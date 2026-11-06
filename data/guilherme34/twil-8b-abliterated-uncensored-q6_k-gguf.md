# Guilherme34/TwIL-8B-Abliterated-Uncensored-Q6_K-GGUF

## Resumen

TwIL-8B-Abliterated-Uncensored-Q6_K-GGUF es una cuantización en formato GGUF (tipo Q6_K) del modelo base TwIL-8B-Abliterated-Uncensored, publicado por el usuario Guilherme34. El repositorio contiene únicamente los pesos convertidos mediante la herramienta GGUF-my-repo de ggml.ai a partir del checkpoint original en safetensors, con el objetivo de facilitar la inferencia local con llama.cpp. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado de un modelo de 8.791.592.960 parámetros totales (aproximadamente 8,8 mil millones).

El modelo base pertenece a la familia de los llamados "abliterated/uncensored", una técnica de edición de pesos que busca eliminar o atenuar los mecanismos de rechazo aprendidos durante el alineamiento (RLHF/DPO) sin reentrenar el modelo. El resultado es un modelo que responde a peticiones que un modelo alineado convencional rechazaría, lo que lo hace relevante para investigación sobre seguridad, evaluación de sesgos y estudios de alineamiento, pero también problemático para despliegues en producción sin salvaguardas adicionales.

La ficha disponible es extremadamente escasa: el autor no documenta arquitectura, contexto, idiomas, licencia ni datos de entrenamiento del modelo base, y el repositorio GGUF solo incluye el README autogenerado por GGUF-my-repo con instrucciones de uso en llama.cpp. Esta ficha recoge lo verificable y marca explícitamente como "no disponible" todo aquello que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~8,8 mil millones de parámetros, presumiblemente transformer; no confirmado) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo del README usa `-c 2048`, pero no confirma el contexto nativo) |
| Tipos de cuantizacion | Q6_K (este repositorio); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `twil-8b-abliterated-uncensored-q6_k.gguf`); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base TwIL-8B-Abliterated-Uncensored: la model card del repositorio GGUF no la describe y remite al repositorio original, que no se ha proporcionado. Por el número de parámetros (8.791.592.960) y el nombre "8B", se trata de un modelo denso de aproximadamente 8,8 mil millones de parámetros, pero no se confirma si es un transformer decoder-only estándar, la familia a la que pertenece (Llama, Mistral, Qwen, etc.) ni la longitud de contexto nativa.

Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni las etapas de alineamiento (SFT, RLHF, DPO). El sufijo "Abliterated-Uncensored" indica que el modelo base ha sido sometido a una edición de pesos orientada a eliminar la dirección de rechazo aprendida durante el alineamiento, pero el procedimiento concreto (abliteration por dirección de activación, fine-tuning con datos sin censura u otro) no está documentado en la información disponible. La única transformación verificable en este repositorio es la cuantización a Q6_K mediante llama.cpp.

## Capacidades

- Generación de texto autoregresiva en formato GGUF, ejecutable con llama.cpp (CLI y servidor).
- Presumiblemente conserva las capacidades del modelo base de ~8,8B en razonamiento, código y matemáticas, aunque no hay benchmarks ni documentación que lo confirmen.
- Respuestas a peticiones que los modelos alineados convencionalmente rechazan, por el proceso de abliteration del modelo base.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar qué comportamientos emergen al eliminar la dirección de rechazo de un modelo de 8,8B, comparando sus respuestas con las del modelo alineado original en conjuntos de prompts controlados.
- Evaluación de sesgos y robustez: útil como caso extremo en pipelines de red-teaming para medir la eficacia de clasificadores de contenido y filtros de salida antes de desplegar modelos en producción.
- Inferencia local en hardware de consumo: al estar en GGUF Q6_K, se puede ejecutar con llama.cpp en equipos sin GPU dedicada o con GPU de gama media, lo que facilita experimentos reproducibles sin infraestructura cloud.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles, con la advertencia de que la salida requiere revisión humana.
- Pruebas de pipelines de cuantización: sirve como ejemplo práctico de conversión GGUF con GGUF-my-repo y de comparación de calidad entre el checkpoint safetensors y la versión Q6_K.
- Prototipado de servidores de inferencia: el README documenta el arranque con `llama-server`, lo que permite montar un endpoint compatible con la API de OpenAI para pruebas de integración internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 7,2 GB, por lo que la cuantización Q6_K requiere aproximadamente 7-8 GB de VRAM o memoria unificada para cargar los pesos, más el espacio para el contexto KV.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100, H100). En GPUs de 8 GB puede ser necesario limitar el contexto para dejar espacio al KV cache.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; en GPUs de 6 GB o menos habría que recurrir a cuantizaciones menores (Q4_K_M, Q3_K) no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp (CLI y servidor, documentado en el README), y por compatibilidad de formato GGUF también Ollama, LM Studio, koboldcpp o text-generation-webui, aunque no están documentados por el autor. vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TwIL-8B-Abliterated-Uncensored-Q6_K-GGUF | 8,79B | no disponible | GGUF Q6_K | no disponible | Hugging Face (0 descargas) |
| Modelo base TwIL-8B-Abliterated-Uncensored | 8,79B | no disponible | safetensors | no disponible | Hugging Face |
| Alternativas de ~8B alineadas (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8B | 32K-128K según modelo | safetensors, GGUF | licencias comunitarias | amplia disponibilidad |

No se dispone de datos de rendimiento del modelo ni de comparaciones publicadas con alternativas de la misma categoría; la comparativa se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin filtros; no es apto para producción sin salvaguardas externas.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, agravado por la ausencia de benchmarks y de documentación del modelo base.
- No se declara licencia: el uso comercial es jurídicamente incierto y depende de la licencia del modelo base, que no está disponible en la información proporcionada.
- No se declaran idiomas soportados ni longitud de contexto nativa; el ejemplo del README usa `-c 2048`, lo que sugiere un contexto modesto en la práctica pero no confirma el máximo.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: sin validación comunitaria ni garantías de mantenimiento.
- La cuantización Q6_K introduce una pérdida de precisión respecto al checkpoint original en safetensors; no se han publicado evaluaciones de la degradación.
- El autor no documenta el procedimiento de abliteration ni los datos usados, lo que impide auditar los sesgos introducidos.
- El modelo base no está identificado con su familia arquitectónica, lo que dificulta verificar compatibilidad con plantillas de chat y herramientas específicas.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/Guilherme34/TwIL-8B-Abliterated-Uncensored-Q6_K-GGUF
- Modelo base: https://huggingface.co/Guilherme34/TwIL-8B-Abliterated-Uncensored
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
