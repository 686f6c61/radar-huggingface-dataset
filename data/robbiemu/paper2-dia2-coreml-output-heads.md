# robbiemu/paper2-dia2-coreml-output-heads

## Resumen

`robbiemu/paper2-dia2-coreml-output-heads` no es un modelo generativo completo, sino un paquete de tres cabezas de salida convertidas a Core ML —action head, codebook-0 head y depformer-stage-14 head— derivadas de `nari-labs/Dia2-2B`, un modelo de texto a voz. Se trata, por tanto, de componentes de modelo: proyecciones de salida que devuelven logits a partir de estados ocultos, y que deben combinarse con un generador MPS en FP32, las cachés recurrentes, el sampler, el fallback nativo y el decodificador Mimi, todos ellos dependencias externas que no se incluyen en este repositorio.

El propósito declarado es reproducir en Apple Silicon una composición de inferencia validada contra una referencia estricta en CUDA FP32 para una única petición de 32 frames, repetida dos veces. El autor explicita que esta composición no coincide con el objetivo CUDA BF16 y que no constituye un checkpoint generador completo, lo que acota con precisión el alcance de la publicación.

Su interés práctico es doble: por un lado, sirve como pieza reutilizable para montar un pipeline de TTS en dispositivo sobre Core ML; por otro, es un ejemplo poco habitual de publicación que documenta la procedencia, los dtypes de entrada y salida, las versiones de herramientas y los límites de validez de una conversión. El repositorio ocupa 16,03 MiB, se distribuye bajo licencia Apache 2.0, está etiquetado para inglés y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyecciones de salida (cabezas) convertidas a Core ML; modelo base `nari-labs/Dia2-2B`, con cabecera de codebook 0 y etapa depformer 14 |
| Parametros totales | No disponible; el repositorio contiene únicamente tres cabezas y 16,03 MiB almacenados en total. Del modelo base no se proporciona recuento de parámetros |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible. Interfaz de entrada: estados ocultos de forma [2,1,2048] para las cabezas action y codebook-0, y [2,1,1024] para la cabeza depformer de etapa 14 |
| Tipos de cuantizacion | No se declara cuantización en la información disponible. La interfaz de entrada y salida es FLOAT32; el autor advierte que los dtypes de E/S de Core ML no especifican por sí mismos la precisión de cómputo ni de pesos interna. El modelo base aparece etiquetado como `base_model:quantized` |
| Idiomas soportados | Inglés (`en`), coherente con el modelo base y con la petición de generación conservada |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (3 paquetes). No contiene pesos Safetensors, por lo que el panel automático de Safetensors del Hub no aplica |
| Autor | robbiemu |
| Librería | coreml |
| Pipeline declarado | text-to-speech |
| Modelo base | nari-labs/Dia2-2B, fijado al commit `7abae125471a73b0fc6b9d413cb15f4ae1e771d8` |
| Entorno de carga documentado | coremltools 9.0 sobre un runtime Core ML de macOS compatible; el ejemplo usa `ComputeUnit.CPU_ONLY` |
| Tamaño por paquete | action-head: 10.574 B; codebook-0-head: 8,01 MiB; depformer-14-head: 8,01 MiB |
| Repositorio | 0,0 GB declarados por el Hub; 16,03 MiB según el desglose de la model card |
| Fechas | Creado el 19 de septiembre de 2026; actualizado el mismo día |

## Arquitectura y entrenamiento

El artefacto consiste en tres proyecciones de salida convertidas a Core ML que se ejecutan sobre estados ocultos ya calculados. La cabeza de acción y la de codebook 0 reciben tensores de forma [2,1,2048]; la cabeza depformer de etapa 14 recibe [2,1,1024]. Todas devuelven logits con interfaz FLOAT32. La generación de habla se apoya en una arquitectura multi-codebook, en la que el depformer produce de forma dependiente los tokens de los codebooks sucesivos, si bien la información disponible no detalla la topología completa del modelo base ni el número de capas del generador.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni sobre etapas de ajuste como RLHF o DPO. El propio autor aclara el papel de los datos: las proyecciones publicadas son componentes de modelo convertidos, no modelos preentrenados con el conjunto de evidencia privado, que se enlaza únicamente como registro de experimentos y no está etiquetado como dataset de entrenamiento. La derivación declarada es una conversión a Core ML de tres proyecciones de salida, con ajuste de grafo, pensada para su uso con un generador MPS FP32 y una selección de host con fallback nativo. La validación retenida coincide con la referencia estricta en CUDA FP32 para una petición de 32 frames repetida dos veces, y no con el objetivo CUDA BF16. Las versiones exactas de especificación, las fechas de conversión, las versiones del framework de origen y los dtypes de E/S se conservan en `coreml_specs.json`, y el autor señala que la compatibilidad entre versiones del runtime no se ha vuelto a comprobar.

## Capacidades

- Cálculo de logits de salida: las tres cabezas transforman estados ocultos en logits para la acción, el codebook 0 y la etapa 14 del depformer.
- Integración en un pipeline de texto a voz: forman parte de la ruta de decodificación de un sistema TTS junto con el generador, el sampler, las cachés recurrentes y el decodificador Mimi.
- Ejecución en Apple Silicon mediante Core ML, con la opción de forzar `ComputeUnit.CPU_ONLY` en el ejemplo documentado.
- Selección de host con fallback nativo: la composición descrita incorpora una política de selección de host y un mecanismo de reserva nativo, aunque su implementación no forma parte de este repositorio.
- Reproducibilidad verificable: el repositorio incluye `manifest.json` con tamaños, hashes SHA-256 y rutas de procedencia, y un script `restore.py --verify` para comprobar la integridad de todos los ficheros del modelo.
- Cobertura de idioma: inglés, heredado del modelo base y de la petición de generación conservada.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada ni modo de pensamiento. El artefacto tampoco genera texto de forma autónoma: solo produce logits a partir de estados ocultos proporcionados por el generador.

## Casos de uso

- Reproducción del estudio de referencia en Apple Silicon: descargar los tres paquetes con `snapshot_download` y ejecutarlos con un generador MPS FP32 para replicar la composición validada frente a la referencia CUDA FP32 en una petición de 32 frames.
- TTS en dispositivo dentro de una aplicación macOS: integrar las cabezas en un pipeline local que evite enviar texto del usuario a servidores externos, aprovechando que el componente está convertido a Core ML y no depende de CUDA.
- Verificación de paridad numérica en pipelines de conversión: usar la comparación declarada contra la referencia FP32 como caso de prueba al portar modelos de voz de PyTorch a Core ML, tomando la advertencia sobre BF16 como criterio de aceptación explícito.
- Auditoría de integridad en CI: ejecutar `restore.py --verify` junto con la comprobación de los hashes de `manifest.json` para garantizar que los artefactos desplegados no se han alterado entre entornos.
- Investigación sobre estrategias de fallback: estudiar la combinación de selección de host con reserva nativa cuando una parte del grafo no está disponible en Core ML, comparando resultados con la ruta nativa.
- Benchmarking de backend en hardware Apple: medir la latencia de las cabezas bajo distintas políticas de cómputo de Core ML (por ejemplo, CPU frente a otras unidades de cómputo) manteniendo fijos el generador y el sampler, para aislar el coste de las proyecciones.
- Construcción de un sistema TTS multietapa propio: reutilizar las cabezas como pieza de decodificación dentro de un pipeline de investigación en el que el generador, el codec Mimi y el muestreador se implementen por separado.
- Docencia y análisis de formatos: emplear los paquetes como ejemplo mínimo de `.mlpackage` con especificaciones inspeccionables mediante `ct.utils.load_spec` y `coreml_specs.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de síntesis de voz (MOS, WER, similitud de hablante) para este artefacto.

La única validación cuantitativa declarada es de naturaleza numérica y de alcance muy limitado: la composición retenida coincide con la referencia estricta en CUDA FP32 para una petición de 32 frames, repetida dos veces, y no coincide con el objetivo CUDA BF16. No se publican latencias ni métricas de rendimiento por segundo.

## Requisitos de hardware

- VRAM estimada: no disponible. El propio repositorio ocupa 16,03 MiB, pero el consumo real de memoria depende del generador, las cachés recurrentes, el sampler y el decodificador Mimi, que no se incluyen.
- Plataforma objetivo: Apple Silicon con un runtime Core ML compatible con macOS, ya que el ejemplo de carga usa `coremltools` 9.0 y `ct.models.MLModel`.
- GPU recomendadas: no disponibles. El artefacto está orientado a cómputo en Apple Silicon; no se documentan GPU NVIDIA ni AMD para estos paquetes.
- Compatibilidad con GPU de consumo: no disponible. Las tres cabezas son ligeras en almacenamiento, pero no se puede afirmar nada sobre el conjunto completo del sistema sin datos del generador.
- Opciones de despliegue: Core ML en macOS mediante `coremltools` y paquetes `.mlpackage`. No se documentan rutas con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Política de cómputo: el ejemplo del autor fija explícitamente `ct.ComputeUnit.CPU_ONLY` e indica que, para reproducir una comparación, debe usarse la política de cómputo declarada por el estudio. La compatibilidad entre versiones del runtime no se ha revalidado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| robbiemu/paper2-dia2-coreml-output-heads | Cabezas de salida convertidas a Core ML | `.mlpackage` (3 paquetes) | 16,03 MiB en total | No disponible; entradas [2,1,2048] y [2,1,1024] | Apache 2.0 | Repositorio público, 0 descargas |
| nari-labs/Dia2-2B (upstream) | Modelo de texto a voz completo | No especificado en la información disponible | No disponible; la denominación «2B» sugiere en torno a 2.000 millones de parámetros, dato no confirmado | No disponible | No disponible en la información proporcionada | Repositorio público; commit fijado `7abae125471a73b0fc6b9d413cb15f4ae1e771d8` |
| Otras conversiones Core ML de cabezas de salida para TTS | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Comparaciones adicionales con alternativas de la misma categoría (mismo tamaño o misma tarea) no están disponibles en la información proporcionada. La comparación más directa es con el propio modelo base: este repositorio no puede sustituirlo, ya que solo aporta tres proyecciones de salida y deja fuera el generador y el códec.

## Limitaciones y advertencias

- No es un modelo completo: se trata de tres cabezas de salida. Faltan el generador MPS FP32, las cachés recurrentes, el sampler, el fallback nativo y el decodificador Mimi, que son dependencias separadas.
- Alcance de validación muy restringido: la coincidencia con la referencia CUDA FP32 se limita a una petición de 32 frames, repetida dos veces. No hay evidencia de comportamiento correcto en otras entradas, longitudes o idiomas.
- Desajuste declarado con BF16: la composición no coincide con el objetivo CUDA BF16, por lo que no debe esperarse equivalencia numérica con implementaciones entrenadas o ejecutadas en esa precisión.
- Compatibilidad de runtime no revalidada: el autor indica que las versiones exactas de especificación, fechas de conversión y versiones del framework de origen están en `coreml_specs.json`, pero que la compatibilidad entre versiones del runtime Core ML no se ha vuelto a comprobar.
- Riesgo de alucinación: no aplica en el sentido habitual, porque el componente no genera lenguaje de forma autónoma. Cualquier error de contenido dependerá del generador y del muestreador externos.
- Sesgos: no se documenta ningún análisis de sesgos, ni del componente ni del modelo base.
- Limitación de idioma: el alcance declarado es únicamente inglés, tanto por el modelo base como por la petición conservada. No hay soporte multilingüe documentado.
- Ausencia de métricas de calidad de voz: no se publican MOS, WER ni evaluaciones perceptuales, de modo que no puede acreditarse calidad de síntesis a partir de este repositorio.
- Publicación sin validación de despliegue nueva: el autor señala expresamente que la publicación no constituye una validación nueva de inferencia ni de despliegue, solo una comprobación de integridad y de las interfaces Core ML.
- Licencia: el componente se distribuye bajo Apache 2.0, pero el uso en producción depende también de las condiciones del modelo base y de cualquiera de las dependencias (generador, códec Mimi) que se integren. Los avisos y model cards del proyecto original se conservan en `licenses/` y la licencia aplicable está en `LICENSE`.
- Artefactos experimentales en repositorios privados: la evidencia experimental, las pruebas de diagnóstico, los intermedios de transferencia y el historial de optimización no se publican, lo que limita la reproducibilidad completa de las decisiones de conversión.
- Los dtypes de entrada y salida en FLOAT32 describen únicamente la interfaz, no la precisión interna de cómputo o de pesos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robbiemu/paper2-dia2-coreml-output-heads
- Modelo base nari-labs/Dia2-2B: https://huggingface.co/nari-labs/Dia2-2B
- Revisión fijada del modelo base: https://huggingface.co/nari-labs/Dia2-2B/tree/7abae125471a73b0fc6b9d413cb15f4ae1e771d8
- Dataset de evidencia de despliegue Core ML TTS (registro de experimentos, no dataset de entrenamiento): https://huggingface.co/datasets/robbiemu/coreml-tts-deployment-evidence
- Paquete action-head: `models/action-head.mlpackage` en la raíz del repositorio
- Paquete codebook-0-head: `models/codebook-0-head.mlpackage` en la raíz del repositorio
- Paquete depformer-14-head: `models/depformer-14-head.mlpackage` en la raíz del repositorio
- Detalle por fichero: `FILE_DETAILS.md` y `file_details.json` en la raíz del repositorio
- Nombres, formas y dtypes de los tensores, y metadatos de conversión: `coreml_specs.json` en la raíz del repositorio
- Integridad y procedencia: `manifest.json`; verificación mediante `python restore.py --verify`
- Metadatos del alcance en formato legible por máquina: `release_metadata.json`
- Licencias y avisos del proyecto original: directorio `licenses/` y fichero `LICENSE`
- Documentación del analizador de metadatos de Safetensors de HuggingFace: https://huggingface.co/docs/safetensors/metadata_parsing
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web realizada.
