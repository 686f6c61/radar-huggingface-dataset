# sokrypton/localfold

## Resumen

LocalFold es una implementación end-to-end de AlphaFold 2 y AlphaFold 3 que se ejecuta íntegramente en el navegador mediante WebGPU, desarrollada por el laboratorio Ovchinnikov (MIT Biology) bajo el usuario sokrypton. El repositorio de HuggingFace contiene los pesos exportados y cuantizados específicamente para que la página [localfold.org](https://localfold.org) los cargue en el navegador, organizados en shards que se descargan en paralelo. No son checkpoints de entrenamiento, sino tensores empaquetados para inferencia en WebGPU.

El modelo resuelve el problema del plegamiento de proteínas sin necesidad de instalar Python, CUDA o descargar pesos masivos: cualquier navegador con soporte WebGPU puede ejecutar la predicción de estructura 3D a partir de una secuencia de aminoácidos o un alineamiento A3M. Incluye dos variantes: un export de AlphaFold 2 (modelo 1 PTM) de 227 MB en int8, y un export de AlphaFold 3 (trunk, difusión y cabezas de confianza) de 265 MB en int5. La relevancia actual radica en democratizar el acceso a herramientas de biología estructural de alto nivel, eliminando la barrera de infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AlphaFold 2 (Evoformer + structure module) y AlphaFold 3 (diffusion-based) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (plegamiento de proteinas, no procesamiento de texto) |
| Tipos de cuantizacion | int8 con escalas de bloque float16 (AF2), int5 asimetrico por bloque (AF3) |
| Idiomas soportados | no aplica |
| Licencia | Mixta: CC BY 4.0 para AF2, AlphaFold 3 Model Parameters Terms of Use para AF3 |
| Formato de pesos | Shards WebGPU con manifest.json (tensores cuantizados, layout atomico denso) |

## Arquitectura y entrenamiento

LocalFold es una reimplementación en WebGPU de los modelos AlphaFold 2 y AlphaFold 3. Para AlphaFold 2, implementa el modelo monómero 1 con reciclaje, la pila extra-MSA, los 48 bloques Evoformer, el módulo de estructura de ocho capas, la geometría atómica y las cabezas pLDDT/PAE. Para AlphaFold 3, incluye el trunk, la cabeza de difusión y la cabeza de confianza. Los pesos son exportaciones directas de los parámetros publicados por DeepMind, no entrenados desde cero. No se dispone de información sobre el dataset de entrenamiento original, ya que los pesos provienen de los modelos preentrenados de AlphaFold. La innovación técnica principal es la adaptación de estos modelos a WebGPU: cuantización int8/int5, disposición densa de tensores para los shaders y particionado en shards para descarga paralela.

## Capacidades

- Plegamiento de proteínas a partir de secuencia de aminoácidos cruda o texto A3M.
- Predicción de estructura 3D completa con coordenadas atómicas.
- Salida de pLDDT (confianza por residuo) y PAE (error de alineamiento previsto).
- Reciclaje de la estructura (múltiples pasadas de refinamiento).
- Pila extra-MSA para incorporar información evolutiva de alineamientos múltiples.
- Ejecución íntegra en el navegador con WebGPU, sin servidor ni instalación.
- Soporte de dos modelos: AlphaFold 2 monómero y AlphaFold 3 (difusión).

## Casos de uso

- Predicción de estructura de proteínas en entornos educativos: estudiantes de bioinformática pueden ejecutar plegamiento en un portátil sin GPU dedicada, usando el navegador, para visualizar estructuras y entender conceptos de biología estructural.
- Análisis rápido de mutaciones: investigadores pueden introducir secuencias variantes y comparar las estructuras predichas en el navegador, sin necesidad de configurar un entorno Python con AlphaFold.
- Diseño de proteínas de novo: la integración con AlphaFold 3 permite explorar estructuras generadas por difusión, útil para diseñar proteínas con funciones específicas.
- Validación de alineamientos MSA: al aceptar texto A3M, los usuarios pueden comprobar cómo afectan diferentes alineamientos a la estructura predicha, útil para depurar pipelines de búsqueda de homólogos.
- Demostraciones y divulgación científica: localfold.org sirve como demo interactiva para conferencias o talleres, mostrando plegamiento en tiempo real sin requisitos de hardware.
- Prototipado de pipelines de biología estructural: desarrolladores pueden integrar LocalFold en aplicaciones web que necesiten predicción de estructura del lado del cliente, aprovechando la inmutabilidad de los shards (URLs fijadas por commit).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas de precisión (p.ej., TM-score, RMSD) frente a AlphaFold original u otras implementaciones. Se recomienda consultar el repositorio de GitHub para futuras actualizaciones.

## Requisitos de hardware

- Ejecución en navegador con soporte WebGPU (Chrome, Edge, Firefox recientes).
- Los pesos ocupan 227 MB (AF2) y 265 MB (AF3), por lo que caben en cualquier GPU integrada o discreta moderna.
- No se requiere VRAM dedicada específica; la memoria se gestiona dinámicamente en el navegador.
- Sin necesidad de GPU NVIDIA específica; funciona con GPUs AMD, Intel y Apple Silicon que soporten WebGPU.
- Despliegue: no requiere servidor; la página localfold.org carga los shards desde HuggingFace. Para uso local, se puede servir el repositorio estáticamente.
- Latencia y throughput: no disponibles; dependen del hardware del cliente y del tamaño de la proteína.

## Comparativa con modelos similares

| Modelo | Implementación | Requisitos | Licencia | Precisión |
|---|---|---|---|---|
| LocalFold (AF2) | WebGPU en navegador | Navegador con WebGPU | CC BY 4.0 | Equivalente a AlphaFold 2 (mismos pesos) |
| AlphaFold 2 (original) | Python + JAX | GPU NVIDIA, CUDA, ~5 GB VRAM | CC BY 4.0 | Referencia |
| OpenFold | Python + PyTorch | GPU NVIDIA, ~5 GB VRAM | Apache 2.0 | Similar a AF2 |
| ESMFold | Python + PyTorch | GPU NVIDIA, ~3 GB VRAM | MIT | Menor precisión que AF2, más rápido |

LocalFold se distingue por ejecutarse sin instalación y en cualquier dispositivo con navegador moderno, a costa de no ser entrenable y depender de WebGPU. Las alternativas requieren entorno Python y GPU dedicada, pero ofrecen mayor flexibilidad (entrenamiento, fine-tuning, batch processing).

## Limitaciones y advertencias

- Los pesos de AlphaFold 3 están sujetos a los AlphaFold 3 Model Parameters Terms of Use de DeepMind, que incluyen una política de uso prohibido. No son OpenFold3, a pesar del nombre del directorio.
- Los pesos son exportaciones para inferencia en WebGPU; no son checkpoints de entrenamiento y no contienen estado de optimizador.
- La precisión depende del modelo original; no hay garantías de rendimiento en proteínas con baja cobertura MSA o dominios desordenados.
- El uso en producción requiere fijar un commit específico en las URLs de los shards para evitar cambios que corrompan la lectura de tensores.
- No se admiten proteínas con ligandos, ácidos nucleicos u otras moléculas en la versión AF2; AF3 puede tener limitaciones similares según los términos de uso.
- La ejecución en navegador puede estar limitada por la memoria disponible y el rendimiento de WebGPU en GPUs integradas antiguas.

## Enlaces

- [HuggingFace: sokrypton/localfold](https://huggingface.co/sokrypton/localfold)
- [GitHub: sokrypton/localfold](https://github.com/sokrypton/localfold)
- [Sitio web: localfold.org](https://localfold.org)
- [AlphaFold 3 Model Parameters Terms of Use](https://github.com/google-deepmind/alphafold3/blob/main/WEIGHTS_TERMS_OF_USE.md)
- [Laboratorio Ovchinnikov (MIT Biology)](https://solab.org/)
