# afridahmed/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un modelo de lenguaje de aproximadamente 9.200 millones de parámetros (9.197.093.888 según los pesos en safetensors) publicado por el usuario afridahmed en Hugging Face. Se trata de una versión cuantizada en formato GGUF del modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, un derivado de la familia Qwen 3.5 que ha sido destilado a partir de DeepSeek y sometido a un proceso de "abliteration" o "decensoring" (eliminación de los mecanismos de rechazo y alineación de seguridad). El trabajo de cuantización está atribuido en la model card a mradermacher.

El modelo se presenta como una variante "uncensored" orientada a razonamiento, matemáticas, STEM, uso de herramientas y function calling, con soporte declarado para seis idiomas (inglés, chino, coreano, japonés, español y ruso). Incorpora etiquetas que sugieren un pipeline de entrenamiento con SFT, RL (GSPO) y destilación, además de una arquitectura Qwen 3.5 con módulos multimodales (los archivos mmproj en el repositorio indican capacidad de visión). La licencia declarada es Apache 2.0.

Este lanzamiento es relevante por dos motivos: por un lado, ofrece una vía práctica de ejecutar localmente un modelo de ~9B con cuantizaciones que van desde 4 GB (Q2_K) hasta 18,5 GB (f16), lo que lo hace accesible en hardware de consumo; por otro, ejemplifica la tendencia de publicar variantes "abliterated" que eliminan restricciones de seguridad, algo que tiene implicaciones importantes para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según tags; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 (multimodal) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a la familia Qwen 3.5 (tag `qwen3_5`) y a un proceso de destilación desde DeepSeek (tags `distillation`, `deepseek`). El modelo base se describe con etiquetas de SFT, RL (concretamente GSPO) y `mtp` (multi-token prediction), lo que sugiere un entrenamiento por fases: ajuste supervisado, refuerzo y posiblemente decodificación especulativa mediante predicción multi-token. No se especifican el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO.

El rasgo diferencial es el proceso de "heretic"/"abliteration": una modificación de los pesos orientada a eliminar las respuestas de rechazo del modelo alineado original. Esta técnica, habitual en la comunidad open source, suele implicar la identificación y supresión de direcciones de activación asociadas a comportamientos de negativa. El repositorio incluye además componentes multimodales (archivos `mmproj`), lo que indica soporte de entrada de imágenes, aunque no se detalla el codificador visual empleado.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito (tag `reasoning`) y resolución de problemas matemáticos y STEM.
- Generación y análisis de código.
- Uso de herramientas y function calling (tags `tool-use`, `function-calling`).
- Capacidad multimodal: presencia de archivos `mmproj` que habilitan entrada de imágenes en llama.cpp.
- Multilingüe en seis idiomas: inglés, chino, coreano, japonés, español y ruso.
- Modo "uncensored": ausencia deliberada de mecanismos de rechazo ante peticiones sensibles.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con text-generation-inference.

## Casos de uso

- Asistente de razonamiento local: desplegado con llama.cpp u Ollama en una estación de trabajo, el modelo puede resolver problemas matemáticos y de STEM paso a paso sin depender de la nube, gracias a su tamaño de ~9B y a las cuantizaciones Q4_K_M (5,9 GB).
- Generación de código en pipelines de desarrollo: el soporte de function calling y tool use permite integrarlo en flujos de CI/CD o en asistentes de IDE que invocan APIs externas, con la ventaja de ejecutarse en hardware propio.
- Procesamiento de documentos con imágenes: los archivos mmproj habilitan la lectura de capturas, diagramas o formularios escaneados en un pipeline multimodal local, útil para digitalización de archivos.
- Atención al cliente multilingüe: con soporte para español, inglés, chino, japonés, coreano y ruso, puede gestionar conversaciones en varios idiomas en un mismo despliegue, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Investigación sobre alineación y seguridad: al ser una variante "abliterated", sirve como objeto de estudio para analizar qué comportamientos emergen al eliminar los mecanismos de rechazo, comparándolo con el modelo base alineado.
- Generación de contenido creativo sin restricciones de temática: escritura de ficción, guiones o material editorial donde el modelo alineado original rechazaría ciertos temas, siempre que el uso cumpla la legalidad aplicable.
- Experimentación académica con cuantizaciones: la disponibilidad de doce niveles de cuantización (de Q2_K a f16) permite estudiar la degradación de calidad en razonamiento y código según el nivel de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~4,0 GB; Q3_K_M ~4,8 GB; IQ4_XS ~5,5 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Añadir 1-2 GB adicionales para contexto y caché KV.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K/Q8_0 con contexto amplio; RTX 3090/4080 (16-24 GB) para Q4_K_M y Q5_K_M; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para Q3_K_M o IQ4_XS.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 12 GB o más; la f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (tag declarado) y servidores compatibles con endpoints. Para multimodal se requiere llama.cpp con soporte mmproj.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (GGUF) | ~9,2B | No disponible | Apache 2.0 | GGUF | Variante abliterated, multimodal, 6 idiomas |
| Modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9,2B | No disponible | Apache 2.0 | safetensors | Origen de la cuantización |
| Qwen 3.5 9B (familia de referencia) | ~9B | No disponible | No disponible | No disponible | Familia base citada en los tags; datos concretos no disponibles |

No se dispone de información suficiente sobre benchmarks ni sobre las especificaciones exactas de los modelos comparables para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": se han eliminado deliberadamente los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o inexacto sin advertencia. No es apto para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fiabilidad; al tratarse de un derivado destilado y modificado, la precisión factual puede degradarse respecto al modelo original.
- Longitud de contexto no documentada: no es posible planificar despliegues con ventanas largas sin validación empírica.
- Idiomas: aunque se declaran seis, no hay datos sobre la calidad relativa en español ni en el resto; el rendimiento podría ser desigual.
- Sesgos: no se documentan evaluaciones de sesgo; la modificación de pesos puede alterar el comportamiento en temas sensibles de forma imprevisible.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado; conviene revisar las obligaciones de atribución y las implicaciones de la modificación de pesos.
- Repositorio sin descargas ni likes en el momento de la consulta (0/0), lo que sugiere escasa validación por parte de la comunidad; tratar como experimental.
- El tamaño del repositorio (85,1 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/afridahmed/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización (mradermacher): https://huggingface.co/mradermacher/model_requests
