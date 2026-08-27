# biofold-jl/alphafold2

## Resumen

AlphaFold2 es un sistema de inteligencia artificial desarrollado por Google DeepMind que predice la estructura tridimensional de proteínas a partir de su secuencia de aminoácidos con una precisión comparable a la experimental. Este repositorio concreto, `biofold-jl/alphafold2`, contiene los pesos originales entrenados por DeepMind convertidos al formato `.safetensor`, lo que facilita su uso en entornos modernos de inferencia y fine-tuning. El modelo resuelve un problema fundamental en biología estructural: determinar la conformación nativa de una proteína, algo que históricamente requería técnicas experimentales costosas y lentas como la cristalografía de rayos X o la criomicroscopía electrónica.

La relevancia actual de AlphaFold2 es indiscutible: desde su publicación en 2021, ha transformado la investigación biomédica, permitiendo el estudio de proteomas completos y acelerando el diseño de fármacos y la ingeniería de proteínas. La arquitectura se basa en un transformer con atención por pares y un módulo de estructura que refina las coordenadas atómicas de forma iterativa. Aunque el repositorio no especifica el tamaño exacto de los parámetros ni la longitud de contexto, se sabe que el modelo original tiene alrededor de 93 millones de parámetros y procesa secuencias de hasta 2.048 residuos. La licencia CC-BY-4.0 permite uso comercial con atribución, lo que lo hace atractivo para aplicaciones industriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención por pares y módulo de estructura (Evoformer + Structure Module) |
| Parametros totales | Aproximadamente 93 millones (no confirmado en el repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 2.048 residuos de aminoácidos (según la publicación original) |
| Tipos de cuantizacion | No disponible (los pesos están en safetensors, sin cuantización publicada) |
| Idiomas soportados | No aplica (modelo de biología, no de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AlphaFold2 emplea una arquitectura basada en dos componentes principales: el Evoformer, un bloque de transformer que procesa la secuencia y las alineaciones múltiples de secuencias (MSA) mediante atención por pares, y el módulo de estructura, que genera las coordenadas 3D de los átomos de forma iterativa mediante un algoritmo de refinamiento. El modelo fue entrenado con datos de la base de datos de proteínas (PDB) y utiliza un enfoque de aprendizaje supervisado con pérdidas que combinan la precisión de los ángulos diédricos y la distancia entre átomos. No se ha publicado información sobre el uso de RLHF o DPO, ya que no es un modelo de lenguaje. La innovación clave reside en la representación de pares de residuos y el uso de un ciclo de refinamiento que mejora la predicción de forma progresiva.

El entrenamiento original de DeepMind utilizó alrededor de 170.000 estructuras proteicas del PDB, con aumentación de datos mediante perturbaciones y enmascaramiento de MSA. El modelo se optimizó con una función de pérdida que incluye términos de distancia, ángulos y torsiones, así como una pérdida de confianza. No se han publicado detalles adicionales sobre el dataset de entrenamiento en este repositorio, pero la información está disponible en el artículo de Nature de 2021.

## Capacidades

- Predicción de estructura 3D de proteínas a partir de secuencia de aminoácidos, con precisión atómica comparable a la experimental.
- Manejo de alineamientos múltiples de secuencias (MSA) para mejorar la precisión en proteínas con homólogos conocidos.
- Generación de mapas de confianza (pLDDT) y errores de alineación previstos (PAE) para evaluar la fiabilidad de las predicciones.
- Soporte para predicción de complejos proteicos multiméricos (en la versión original, aunque no se confirma en este repositorio).
- Capacidad de procesar secuencias de hasta 2.048 residuos, lo que cubre la mayoría de proteínas conocidas.
- No es un modelo de lenguaje, por lo que no tiene capacidades de generación de texto, tool calling ni agentes.

## Casos de uso

- Descubrimiento de fármacos: AlphaFold2 permite predecir estructuras de proteínas diana para el diseño racional de inhibidores o moduladores, reduciendo el tiempo y coste de los ensayos experimentales iniciales.
- Ingeniería de proteínas: los investigadores pueden mutar secuencias y predecir el efecto en la estructura para diseñar enzimas con mayor estabilidad o actividad catalítica, por ejemplo para aplicaciones industriales.
- Anotación funcional de genomas: al predecir estructuras de proteínas hipotéticas, se pueden inferir funciones biológicas y relaciones evolutivas, especialmente en organismos poco estudiados.
- Estudio de enfermedades genéticas: la predicción de estructuras de variantes patogénicas ayuda a comprender el mecanismo molecular de enfermedades hereditarias y a proponer terapias dirigidas.
- Biología estructural de membrana: AlphaFold2 puede predecir estructuras de proteínas de membrana, difíciles de obtener experimentalmente, facilitando el estudio de canales iónicos y receptores.
- Desarrollo de vacunas: la predicción de estructuras de antígenos virales permite identificar epítopos y diseñar inmunógenos más eficaces, como se ha hecho con el SARS-CoV-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, y la búsqueda web no proporciona datos numéricos específicos para esta conversión concreta. Sin embargo, el modelo original de AlphaFold2 fue evaluado en el CASP14 (Critical Assessment of Protein Structure Prediction) con una puntuación GDT de 92.4 sobre 100, superando a todos los demás métodos. Para comparaciones detalladas, se recomienda consultar el artículo de Nature de 2021.

## Requisitos de hardware

- VRAM estimada: para inferencia con secuencias de hasta 2.048 residuos, se recomienda al menos 16 GB de VRAM en GPU. Con cuantización FP16, el modelo ocupa aproximadamente 186 MB (93M parámetros × 2 bytes), pero el uso de memoria real es mayor debido a las activaciones y al procesamiento de MSA.
- GPU recomendadas: NVIDIA A100 (40 GB) o H100 para procesamiento de proteomas completos; una RTX 4090 (24 GB) es suficiente para la mayoría de casos individuales.
- En consumer GPU: sí, cabe en tarjetas con 16 GB o más, como la RTX 4080 o RTX 3090, siempre que se limite el tamaño de la MSA.
- Opciones de despliegue: el código oficial de DeepMind está disponible en GitHub y se puede ejecutar con TensorFlow o JAX. Para integración en pipelines modernos, se puede usar el contenedor de NVIDIA NIM o implementaciones en PyTorch como OpenFold.
- Latencia y throughput: no se han publicado datos específicos para esta conversión. En una A100, la predicción de una proteína de 500 residuos tarda aproximadamente 1-2 minutos, según la implementación original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (CASP14) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlphaFold2 (este repo) | ~93M | 2.048 residuos | GDT 92.4 | CC-BY-4.0 | safetensors |
| OpenFold | ~93M | 2.048 residuos | Reimplementación de AF2 | Apache-2.0 | PyTorch |
| ESMFold | ~650M | 1.024 residuos | GDT ~80 (CASP15) | MIT | HuggingFace |
| RoseTTAFold | ~140M | 400 residuos | GDT ~85 (CASP14) | MIT | GitHub |

Nota: los datos de rendimiento de OpenFold y RoseTTAFold son aproximados y provienen de publicaciones generales; no se han verificado en este repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: AlphaFold2 fue entrenado principalmente con estructuras del PDB, que están sesgadas hacia proteínas bien estudiadas (por ejemplo, humanas y de organismos modelo). Las predicciones para proteínas de organismos poco representados pueden ser menos fiables.
- Riesgo de alucinación: aunque el modelo es robusto, puede producir estructuras plausibles pero incorrectas, especialmente en regiones desordenadas o con baja cobertura de MSA. Se recomienda usar los mapas de confianza (pLDDT) para filtrar resultados.
- Limitaciones de contexto: la longitud máxima de 2.048 residuos excluye proteínas muy grandes o complejos multiméricos extensos, que requieren estrategias de fragmentación.
- Restricciones de licencia: la licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original (Google DeepMind). No hay restricciones adicionales conocidas.
- Caveat para producción: este repositorio solo contiene los pesos en safetensors; no incluye el código de inferencia ni los scripts de preprocesamiento de MSA. Es necesario integrarlo con una implementación como OpenFold o el código oficial de DeepMind para uso práctico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/biofold-jl/alphafold2
- Código oficial de AlphaFold2 (GitHub): https://github.com/google-deepmind/alphafold
- Base de datos de estructuras AlphaFold: https://alphafold.com/
- Artículo de Nature sobre AlphaFold2: https://www.nature.com/articles/s41392-023-01381-z
- Revisión en Springer sobre aplicaciones de AlphaFold2: https://link.springer.com/article/10.1186/s12943-024-02140-6
- Model card de NVIDIA NIM para AlphaFold2: https://build.nvidia.com/deepmind/alphafold2/modelcard
