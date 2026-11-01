# mradermacher/CherryPit-1.1-2B-GGUF

## Resumen

CherryPit-1.1-2B es un modelo de lenguaje pequeño orientado a tareas de código, matemáticas, razonamiento y tool calling, desarrollado por DRUPEs y derivado de la familia MiniCPM (según las etiquetas del repositorio). La ficha que se analiza aquí corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que genera versiones estáticas de modelos populares para su uso en hardware de consumo. El modelo base pesa aproximadamente 2.517 millones de parámetros (2.516.756.480 según los metadatos de safetensors).

Su relevancia actual radica en la tendencia hacia los small language models (SLM) ejecutables en local y en dispositivos con recursos limitados: con cuantizaciones desde 1,1 GB (Q2_K) hasta 5,1 GB (f16), el modelo puede correr en portátiles, mini PCs o GPUs de gama media sin depender de servicios en la nube. La licencia Apache 2.0 del modelo base permite su uso comercial sin restricciones significativas, lo que lo hace atractivo para prototipado y despliegues embebidos.

Cabe destacar que este repositorio no es el modelo original, sino una colección de cuantizaciones estáticas del modelo base DRUPEs/CherryPit-1.1-2B. La model card del cuantizador no incluye información detallada sobre el proceso de entrenamiento del modelo original, benchmarks ni arquitectura específica, por lo que varios campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en MiniCPM (según etiquetas); detalle no disponible |
| Parametros totales | 2.516.756.480 (≈2,52 B) |
| Parametros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura ni el proceso de entrenamiento del modelo base en la información disponible. Las etiquetas del repositorio indican que pertenece a la familia MiniCPM, una arquitectura transformer compacta desarrollada originalmente por OpenBMB orientada a dispositivos de borde, pero los datos concretos (número de capas, dimensiones, tokens de entrenamiento, composición del dataset, uso de RLHF o DPO) no están disponibles en la model card.

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas en formato GGUF usando el flujo de conversión estándar (tipo de conversión "hf"), cubriendo el rango completo desde Q2_K (máxima compresión, 1,1 GB) hasta f16 (precisión completa, 5,1 GB). En el momento de publicación no existen cuantizaciones ponderadas con imatrix, aunque el autor indica que pueden solicitarse mediante una discusión en la comunidad.

## Capacidades

Según las etiquetas del repositorio y la información disponible:

- Generación de código: etiquetado explícitamente para tareas de "code" y "coding".
- Razonamiento matemático: etiquetado para "math".
- Razonamiento general: etiquetado para "reasoning".
- Tool calling / function calling: soporte declarado mediante la etiqueta "tool-calling".
- Uso conversacional: el repositorio incluye la etiqueta "conversational", lo que sugiere compatibilidad con plantillas de chat.
- Ejecución en dispositivo (on-device): diseñado para funcionar en hardware local gracias a su tamaño reducido y las cuantizaciones GGUF.
- Capacidades multilingües: no disponible; el idioma declarado es únicamente inglés.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- **Asistentes de código en local**: con su enfoque en code y coding, puede integrarse en editores como Continue o extensiones de VS Code para autocompletado y generación de funciones, ejecutándose sin salir de la máquina del desarrollador.
- **Tool calling en agentes locales**: la etiqueta "tool-calling" permite construir agentes que invoquen funciones (búsquedas, APIs, scripts) desde un pipeline local con llama.cpp o LM Studio, sin coste de API.
- **Razonamiento matemático y cálculo asistido**: útil para resolver problemas de matemáticas de nivel básico o intermedio en aplicaciones educativas offline.
- **Chatbots ligeros en dispositivos de borde**: con la cuantización Q4_K_M (1,7 GB) cabe en teléfonos de gama alta, Raspberry Pi 5 o mini PCs, para asistentes conversacionales sin conexión.
- **Prototipado rápido de aplicaciones LLM**: su tamaño reducido permite iterar prompts y pipelines en una portátil antes de escalar a modelos mayores, reduciendo tiempos y costes de desarrollo.
- **Procesamiento por lotes de texto en servidores modestos**: en un servidor con GPU modesta o incluso solo CPU, se pueden procesar grandes volúmenes de texto (clasificación, extracción, resumen) con buen throughput al ser un modelo de 2B.
- **Integración en CI/CD para tareas de código**: puede usarse en pipelines automatizados para generar descripciones de commits, revisar snippets o documentar funciones sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, ni del modelo base ni de las cuantizaciones.

## Requisitos de hardware

- **VRAM / memoria estimada para inferencia**: depende de la cuantización elegida. Aproximadamente: Q2_K ~1,1 GB, Q3_K_M ~1,4 GB, Q4_K_M ~1,7 GB, Q5_K_M ~1,9 GB, Q6_K ~2,2 GB, Q8_0 ~2,8 GB, f16 ~5,1 GB (más la memoria necesaria para el KV cache según la longitud de contexto).
- **GPU recomendadas**: cualquier GPU moderna con 4 GB de VRAM o más ejecuta el modelo con holgura, incluso en cuantizaciones altas. Ejemplos: RTX 3060, RTX 4060, RTX 4090 (con sobra). No se requiere A100 ni H100.
- **Consumer GPUs**: sí, cabe con facilidad en prácticamente cualquier GPU de consumo; incluso la Q8_0 (2,8 GB) entra en GPUs de 4 GB.
- **Solo CPU**: totalmente viable dado el tamaño; en un portátil con 8 GB de RAM corre la Q4_K_M sin problemas, e incluso la Q8_0 en equipos con 16 GB.
- **Opciones de despliegue**: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All, KoboldCpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM o TGI, aunque para un modelo de este tamaño llama.cpp suele ser la opción más práctica.
- **Latencia y throughput**: no disponibles como datos publicados; por tamaño y cuantización, cabe esperar velocidades del orden de decenas de tokens por segundo incluso en CPU moderna, y muy superiores en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| CherryPit-1.1-2B (este) | 2,52 B | GGUF (Q2_K a f16) | Apache 2.0 | Código, matemáticas, razonamiento, tool calling, on-device |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B | safetensors, GGUF (comunitario) | Qwen Research (no comercial sin permiso para >100M usuarios) | Código |
| Phi-3.5-mini-instruct | 3,8 B | safetensors, ONNX, GGUF (comunitario) | MIT | Razonamiento general y código |
| MiniCPM3-4B | 4 B | safetensors, GGUF (comunitario) | Uso no comercial (familia MiniCPM) | General, on-device |

CherryPit-1.1-2B destaca frente a alternativas de tamaño similar por su licencia Apache 2.0 sin restricciones comerciales y su cobertura combinada de código, matemáticas y tool calling. Frente a Qwen2.5-Coder-1.5B ofrece más parámetros y licencia más permisiva; frente a Phi-3.5-mini es más ligero, y frente a otros modelos de la familia MiniCPM evita las restricciones de uso no comercial. No se dispone de datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- **Idioma**: el modelo declara soporte únicamente para inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- **Riesgo de alucinación**: como todo modelo de 2B, la tasa de alucinaciones y errores de razonamiento será notablemente superior a la de modelos de 7B o más; no es adecuado para tareas que exijan alta fiabilidad factual sin verificación externa.
- **Falta de benchmarks**: no hay evaluaciones publicadas, por lo que la calidad real en código, matemáticas o razonamiento debe validarse empíricamente antes de uso en producción.
- **Cuantizaciones agresivas**: las versiones Q2_K y Q3_K_S/M implican degradación apreciable de calidad; para uso serio se recomienda Q4_K_M o superior.
- **Sin imatrix quants**: no existen cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor calidad a igual tamaño; pueden solicitarse al autor.
- **Información del modelo base escasa**: la ausencia de documentación sobre entrenamiento, contexto y alineación dificulta evaluar sesgos, licencias de datos y comportamiento en producción.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento del modelo base, algo no documentado.
- **Contexto**: la longitud de contexto no está publicada; verificarla antes de diseñar aplicaciones que dependan de documentos largos.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/CherryPit-1.1-2B-GGUF
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.1-2B
- Página de descargas del cuantizador: https://hf.tst.eu/model#CherryPit-1.1-2B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (soporte del cuantizador): https://www.nethype.de/
- Paper, demo o repositorio de código del modelo base: no disponible
