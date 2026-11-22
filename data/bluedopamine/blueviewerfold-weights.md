# BlueDopamine/BlueViewerFold-weights

## Resumen

BlueViewerFold-weights es un repositorio de pesos convertidos del modelo Boltz-2 (modelo de confianza estructural, release 2.2.1) para el motor de plegamiento BlueViewerFold, una implementación en C++ sobre MLX orientada a Apple Silicon. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de los pesos del módulo de predicción de estructura y confianza de Boltz-2, un sistema de predicción de estructura de proteínas y afinidad de unión desarrollado por Saro Passaro, Gabriele Corso, Jeremy Wohlwend y colaboradores (MIT, Recursion y otros), publicado en bioRxiv en 2025.

El repositorio lo mantiene el usuario BlueDopamine y su función es servir como origen de descarga para la aplicación Blue Viewer, que obtiene estos pesos en el primer uso. La conversión no implica reentrenamiento: se parte del checkpoint oficial `boltz2_conf.ckpt` de `boltz-community/boltz-2` y se transforma a formatos safetensors con distintas precisiones (fp32, fp16 y cuantización afín int8 con grupo 32) para adaptarse a las capacidades de memoria unificada de los chips Apple.

Su relevancia es doble: por un lado, demuestra que es viable ejecutar el modelo de confianza de Boltz-2 de forma nativa en Apple Silicon mediante MLX, con pérdidas de precisión medidas y acotadas (RMSD ≤ 0,11 Å frente a fp64 en el peor de cuatro casos de prueba); por otro, publica tres perfiles de precisión con métricas de fidelidad verificables, lo que facilita la reproducibilidad en entornos de investigación sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de predicción de estructura y confianza de Boltz-2 (release 2.2.1); pesos convertidos, no reentrenados |
| Parametros totales | no disponible (no se publica el recuento en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de estructura, no de lenguaje) |
| Tipos de cuantizacion | fp32 (exact), fp16 (balanced), int8 afín con grupo 32 y escalas fp16 (compact); no se publican formatos de 4 o 6 bits porque no superaron las puertas de precisión |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | MIT (heredada de Boltz-2; copyright 2024 Jeremy Wohlwend, Gabriele Corso, Saro Passaro) |
| Formato de pesos | safetensors (fp32, fp16 y affine-q8-g32); `mols.tar` con la librería CCD en pickles de RDKit |

## Arquitectura y entrenamiento

Los pesos corresponden al modelo de confianza de Boltz-2, un sistema de predicción de estructura de proteínas y de afinidad de unión. La model card no detalla la arquitectura interna (capas, mecanismos de atención, módulos de difusión o de pares de residuos), por lo que ese dato debe consultarse en el paper de Boltz-2 (doi:10.1101/2025.06.14.659707) y en el repositorio oficial `jwohlwend/boltz`. Lo que sí se especifica es que estos pesos son los oficiales de `boltz-community/boltz-2` (`boltz2_conf.ckpt`), convertidos sin reentrenamiento y con verificación de SHA-256 del checkpoint original.

El proceso de conversión se documenta en `tools/convert/convert_boltz2.py`: se carga el `state_dict` con `torch.load(weights_only=True)` (sin ejecutar código del pickle), se mantienen todos los tensores en fp32 y se generan variantes con `tools/convert/make_variants.py --only fp16 affine-q8-g32`. En la variante int8 se cuantizan todas las matrices con grupo 32 y escalas fp16, las matrices cuya anchura no es múltiplo de 32 permanecen en fp16 y los tensores 1-D en fp32; cada matriz se decuantiza y compara con fp32 en el momento de la creación. Las cifras de precisión provienen de las puertas del motor (`docs/progress/PRECISION.md`): ningún formato de 4 o 6 bits las superó, por lo que no se publican.

## Capacidades

- Predicción de estructura de proteínas y confianza estructural (módulo `boltz2_conf` de Boltz-2).
- Predicción de afinidad de unión, según el alcance declarado del paper de Boltz-2.
- Ejecución nativa en Apple Silicon mediante MLX, con motor en C++ (BlueViewerFold).
- Tres perfiles de precisión intercambiables: `exact` (fp32, 2,08 GB), `balanced` (fp16, 1,04 GB) y `compact` (int8 afín g32, 0,59 GB).
- Verificación de integridad: `manifest.json` con tamaños y SHA-256 de cada archivo, comprobados por la aplicación tras la descarga.
- Inclusión de la librería CCD (`mols.tar`, 1,86 GB) con componentes químicos en pickles de RDKit.
- No soporta tool calling, agentes, generación de texto, visión ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Predicción de estructura de proteínas en local sobre Mac: la aplicación Blue Viewer descarga los pesos en el primer uso y ejecuta el motor MLX, lo que permite obtener estructuras y puntuaciones de confianza sin GPU NVIDIA ni servicios en la nube.
- Investigación en entornos con memoria unificada limitada: el perfil `compact` (0,59 GB) permite ejecutar el modelo en equipos con menos RAM, con una pérdida medida de RMSD ≤ 0,10 Å y lDDT ≥ 0,999 frente a fp64 en los cuatro casos de prueba.
- Validación cruzada de resultados: el perfil `exact` en fp32 (RMSD 0,0004 Å, lDDT 1,000 frente a fp64) sirve como referencia para comprobar que las variantes cuantizadas no introducen desviaciones relevantes en un pipeline concreto.
- Docencia y formación: al ser pesos ligeros y con licencia MIT, se pueden distribuir en cursos de biología estructural computacional para que el alumnado ejecute predicciones en su propio portátil Apple.
- Integración en flujos de trabajo de diseño de fármacos: la predicción de afinidad de unión de Boltz-2 permite priorizar candidatos antes de simulaciones más costosas, usando el perfil `balanced` como compromiso entre velocidad y fidelidad.
- Reproducibilidad de experimentos: el `manifest.json` con SHA-256 y el inventario de tensores por archivo permiten auditar que la versión de pesos usada en un estudio coincide exactamente con la publicada.
- Desarrollo de herramientas derivadas: el repositorio BlueViewerFold es de código abierto y los scripts de conversión (`convert_boltz2.py`, `make_variants.py`, `make_manifest.py`) sirven de plantilla para portar otros checkpoints a MLX.

## Benchmarks y rendimiento

La model card no publica benchmarks biológicos (como GDT_TS, lDDT frente a estructuras experimentales o métricas de afinidad) en la información disponible. Lo que sí se publica son métricas de fidelidad numérica de la conversión frente a la referencia fp64 del motor, en el peor de cuatro casos de prueba:

| Perfil | Archivo | Tamano | Aritmetica | RMSD alineado vs fp64 | lDDT vs fp64 |
|---|---|---|---|---|---|
| Most accurate (`exact`) | `boltz2_conf.fp32.safetensors` | 2,08 GB | fp32 | 0,0004 Å | 1,000 |
| Balanced (`balanced`) | `variants/fp16/boltz2_conf.fp16.safetensors` | 1,04 GB | operandos fp16, estadísticas fp32 | ≤ 0,11 Å | ≥ 0,998 |
| Smallest download (`compact`) | `variants/affine-q8-g32/boltz2_conf.affine-q8-g32.safetensors` | 0,59 GB | como balanced; pesos int8 (grupo 32, escalas fp16) decuantizados al cargar | ≤ 0,10 Å | ≥ 0,999 |

No se han publicado resultados de benchmarks biológicos ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con MLX; el motor BlueViewerFold está implementado en C++ sobre MLX y no se distribuye como checkpoint de PyTorch para el paquete `boltz` original.
- VRAM/RAM estimada para los pesos: 2,08 GB (fp32), 1,04 GB (fp16) y 0,59 GB (int8 g32), más 1,86 GB de `mols.tar` que también debe descargarse.
- GPU recomendadas: no se especifican modelos concretos; el requisito es un chip Apple Silicon compatible con MLX. No hay soporte declarado para A100, H100 ni RTX 4090 en esta conversión.
- Cabe en equipos de consumo: sí, en Mac con Apple Silicon, dado el reducido tamaño de los pesos; el perfil `compact` está pensado para el menor consumo de memoria.
- Opciones de despliegue: aplicación Blue Viewer (motor BlueViewerFold); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlueViewerFold-weights (este repo) | Pesos convertidos de Boltz-2 conf para MLX | 0,59–2,08 GB según perfil | no aplica | MIT | Hugging Face, 0 descargas, 0 likes en el momento de la consulta |
| `boltz-community/boltz-2` | Checkpoint original de Boltz-2 (PyTorch) | no disponible | no aplica | MIT | Hugging Face (modelo base) |
| AlphaFold 3 | Predicción de estructura de proteínas | no disponible | no aplica | no disponible | Distribución sujeta a condiciones de acceso |
| ESMFold | Predicción de estructura de proteínas | no disponible | no aplica | no disponible | Disponible públicamente |

La comparación con AlphaFold 3 y ESMFold se incluye por categoría funcional; no se dispone de datos de rendimiento comparables en la información proporcionada, por lo que no se establece una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni capacidades multilingües; cualquier uso en esos dominios es inadecuado.
- Los pesos están convertidos para el motor BlueViewerFold y no son un checkpoint de PyTorch; no funcionan con el paquete `boltz` original ni con otras herramientas que esperen el formato de Boltz-2.
- Solo se ejecutan en Apple Silicon con MLX; no hay soporte declarado para CUDA, ROCm ni CPU genérica.
- Los formatos de 4 y 6 bits no se publican porque no superaron las puertas de precisión del motor; usar cuantizaciones más agresivas por cuenta propia puede degradar los resultados sin garantías.
- El perfil `compact` introduce una desviación de hasta 0,10 Å de RMSD frente a fp64 en los casos de prueba; para aplicaciones sensibles a la precisión conviene validar con el perfil `exact`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; se trata de un artefacto reciente y de un único mantenedor, sin historial de uso comunitario.
- El modelo base Boltz-2 puede producir predicciones con incertidumbre en regiones desordenadas, complejos grandes o ligandos poco representados en los datos de entrenamiento; la model card no documenta sesgos específicos.
- La licencia MIT permite uso comercial, pero debe conservarse el aviso de copyright original de Wohlwend, Corso y Passaro, y citarse el paper de Boltz-2 en publicaciones de investigación.
- `mols.tar` deriva del wwPDB Chemical Component Dictionary (CC0 1.0); conviene respetar la atribución indicada por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BlueDopamine/BlueViewerFold-weights
- Modelo base: https://huggingface.co/boltz-community/boltz-2
- Repositorio oficial de Boltz: https://github.com/jwohlwend/boltz
- Paper de Boltz-2: https://doi.org/10.1101/2025.06.14.659707
- Repositorio del motor BlueViewerFold (referenciado en la model card, sin URL explícita): no disponible
- Documentación de precisión del motor (`docs/progress/PRECISION.md`): no disponible como enlace público en la información proporcionada
