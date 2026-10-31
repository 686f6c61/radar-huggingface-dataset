# mradermacher/FleetWorker-E4B-GGUF

## Resumen

FleetWorker-E4B es un modelo lingüístico conversacional desarrollado por ThakiCloud, orientado a la clasificación y triaje de tareas (task-triage), el uso con agentes y el despliegue en dispositivos locales (on-device). Se trata de un modelo de unos 7.500 millones de parámetros construido sobre una base Gemma4 con componentes Nemotron, al que se le ha aplicado un adaptador LoRA, y que soporta inglés y coreano. La ficha que aquí se presenta corresponde a la cuantización GGUF realizada por mradermacher, un cuantizador conocido en la comunidad de Hugging Face que publica versiones estáticas en múltiples niveles de precisión para su uso con llama.cpp y herramientas compatibles.

La relevancia de este modelo radica en su enfoque on-device: con cuantizaciones que van desde los 4,5 GB (Q2_K) hasta los 15,2 GB (f16), puede ejecutarse en hardware de consumo, lo que lo hace adecuado para agentes locales, sistemas de clasificación de peticiones y casos de uso conversacional sin depender de infraestructura en la nube. La inclusión de archivos mmproj indica además capacidades multimodales (visión) en la versión GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Gemma4 con componentes Nemotron (transformer), con adaptador LoRA |
| Parametros totales | 7.518.069.290 (7,52 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | openmdw-1.1 (other, enlace: https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base, ThakiCloud/FleetWorker-E4B, se construye sobre la familia Gemma4 de Google, incorporando según las etiquetas del repositorio elementos de Nemotron (la familia de modelos de NVIDIA). El sufijo "E4B" sugiere una configuración eficiente de 4 mil millones de parámetros activos (posiblemente mediante alguna forma de esparsidad o MoE), aunque el dato real de safetensors indica 7.518 millones de parámetros totales; el repositorio no detalla la estructura exacta. Sobre la base se ha entrenado un adaptador LoRA, lo que indica un ajuste fino parametralmente eficiente para las tareas de triaje de tareas, clasificación y agentes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. Tampoco se detalla la longitud de ventana de contexto ni innovaciones técnicas específicas de decodificación o atención. La versión GGUF incluye archivos mmproj (proyección multimodal) en Q8_0 y f16, lo que confirma que el modelo original tiene capacidades de visión que se conservan en la cuantización.

## Capacidades

- Generación de texto conversacional (etiquetado como conversational).
- Triaje y clasificación de tareas (task-triage, classification), su caso de uso principal según las etiquetas.
- Soporte para flujos de agentes (etiqueta agents), presumiblemente como componente de enrutamiento o decisión en sistemas multi-paso.
- Capacidades multimodales de visión, evidenciadas por los archivos mmproj-Q8_0 y mmproj-f16 en el repo GGUF.
- Soporte bilingüe: inglés y coreano.
- Ejecución en dispositivos locales (etiqueta on-device) gracias a las cuantizaciones GGUF.
- No hay información explícita sobre tool calling / function calling, ni sobre modo de razonamiento (thinking mode), código o matemáticas.

## Casos de uso

- Triaje de peticiones en sistemas de agentes: el modelo puede clasificar y enrutar tareas entrantes hacia el agente o modelo especializado adecuado, actuando como capa de decisión ligera y barata de ejecutar en local.
- Clasificación de texto en producción: con 7,5 B de parámetros y cuantizaciones de 4,5-5,4 GB, puede desplegarse como clasificador de intenciones o categorías en servidores modestos o incluso portátiles.
- Asistentes conversacionales bilingües inglés-coreano: útil para aplicaciones dirigidas al mercado coreano que necesiten soporte local y privado de ambos idiomas.
- Agentes on-device con visión: los archivos mmproj permiten procesar imágenes junto con texto en entornos sin conexión, por ejemplo para asistentes que analizan capturas o documentos escaneados.
- Prototipado y pruebas de pipelines de agentes: su tamaño contenido y disponibilidad en Ollama/llama.cpp lo hacen adecuado para iterar rápidamente en arquitecturas de orquestación de agentes.
- Despliegues sensibles a la privacidad: al ejecutarse íntegramente en local con GGUF, los datos no salen del dispositivo, apropiado para entornos corporativos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la cuantización Q4_K_M ocupa 5,4 GB; añadiendo contexto y buffers, se recomienda disponer de 6-8 GB de VRAM o RAM. La versión f16 requiere unos 15,2 GB.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) ejecuta cómodamente las cuantizaciones medias; también funciona en CPU con RAM suficiente dado el tamaño contenido.
- Consumer GPU: sí, cabe sin problemas en GPUs de 8-12 GB con cuantizaciones Q4/Q5; la versión Q8_0 (8,1 GB) cabe en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF y mmproj. El modelo original en safetensors puede servirse con vLLM o TGI, aunque la ficha no lo confirma explícitamente.
- Latencia y throughput: no disponible; por tamaño y cuantización, se espera inferencia fluida en GPU de consumo y velocidades aceptables en CPU moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| FleetWorker-E4B (este) | 7,52 B | GGUF, safetensors | en, ko | openmdw-1.1 | Triaje de tareas, agentes, multimodal (mmproj) |
| Gemma 3 4B / 12B (Google) | 4B / 12B | safetensors, GGUF | Multilingüe (140+) | Gemma license | Base arquitectónica relacionada; contexto largo y visión nativos |
| Qwen3 8B (Alibaba) | 8,2 B | safetensors, GGUF | Multilingüe (100+) | Apache 2.0 | Razonamiento híbrido, tool calling, mayor ecosistema |

FleetWorker-E4B se diferencia de las alternativas genéricas por su especialización en triaje de tareas y agentes bilingües inglés-coreano, aunque su licencia openmdw-1.1 es menos estándar que Apache 2.0 y su documentación técnica es más escasa.

## Limitaciones y advertencias

- Soporte lingüístico limitado a inglés y coreano; no hay garantías de rendimiento en español u otros idiomas.
- No se ha publicado información sobre benchmarks, ventana de contexto ni datos de entrenamiento, lo que dificulta evaluar su calidad de forma rigurosa antes de desplegarlo.
- Como todo LLM, puede alucinar; en tareas de clasificación y triaje conviene validar las salidas con reglas de negocio o umbrales de confianza.
- La licencia openmdw-1.1 es poco habitual; debe revisarse el texto completo (https://openmdw.ai/license/1-1/) antes de cualquier uso comercial.
- Las cuantizaciones Q2_K y Q3_K_M presentan degradación de calidad notable; para producción se recomiendan Q4_K_M o superiores.
- Los cuants imatrix/weighted no estaban disponibles en el momento de publicación de este repo; los static quants pueden rendir ligeramente peor a igual tamaño.
- La estructura exacta del modelo (posible MoE con 4B activos sobre 7,5B totales) no está documentada, por lo que las estimaciones de rendimiento pueden variar.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/FleetWorker-E4B-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/FleetWorker-E4B
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Página de descargas del cuantizador: https://hf.tst.eu/model#FleetWorker-E4B-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
