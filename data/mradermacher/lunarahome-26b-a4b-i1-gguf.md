# mradermacher/LunaraHome-26B-A4B-i1-GGUF

## Resumen

LunaraHome-26B-A4B es un modelo de lenguaje especializado en el control de domótica y reproducción musical mediante tool calling, desarrollado por Maxinger15 y publicado bajo licencia Apache 2.0. Está construido como un ajuste fino mediante LoRA sobre una base de la familia Gemma 4 (según la etiqueta `gemma4` de la model card), con 25.233.142.046 parámetros totales y una designación "A4B" que sugiere una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible.

El modelo está orientado a dos casos de uso muy concretos: la integración con Home Assistant para interpretar comandos en lenguaje natural y traducirlos a llamadas de herramientas (encender luces, ajustar termostatos, consultar estados de dispositivos) y la integración con Music Assistant para controlar reproducción musical. Los idiomas declarados son alemán e inglés, lo que lo hace especialmente útil para despliegues domésticos en entornos germanoparlantes.

La versión aquí descrita es la cuantización GGUF realizada por mradermacher con método imatrix (i1), que ofrece un abanico de cuantizaciones desde IQ1_S (8,4 GB) hasta Q6_K (22,7 GB), permitiendo ejecutar el modelo en hardware de consumo. Su relevancia actual radica en la creciente demanda de asistentes locales de domótica que no dependan de la nube y que puedan ejecutarse en un mini-PC o una GPU de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 (etiqueta `gemma4`), presumiblemente MoE por la designación A4B; no confirmado en detalle |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | No disponible con cifra oficial; la designación A4B sugiere ~4 B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (método imatrix i1) |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `gemma4`, que indica que el modelo base pertenece a la cuarta generación de la familia Gemma de Google. El sufijo "A4B" en el nombre es consistente con una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos sobre un total de 25.200 millones, patrón habitual en modelos eficientes de inferencia. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El ajuste se realizó mediante LoRA sobre el modelo base `Maxinger15/LunaraHome-26B-A4B`, especializándolo en tool calling para Home Assistant y Music Assistant. Las etiquetas `tool-calling`, `home-assistant` y `music-assistant` confirman este enfoque. La cuantización de mradermacher emplea el método imatrix (i1), que calibra los pesos cuantizados con una matriz de importancia derivada de datos de calibración, lo que mejora la calidad respecto a cuantizaciones estáticas del mismo tamaño. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en alemán e inglés.
- Tool calling / function calling orientado a la API de Home Assistant (control de entidades, servicios y estados).
- Tool calling para Music Assistant (reproducción, listas, control de reproductores).
- Razonamiento multi-paso para encadenar acciones de domótica (por ejemplo, consultar estado y actuar en consecuencia).
- Comprensión de comandos en lenguaje natural para traducirlos a llamadas estructuradas.
- Capacidad de ejecución local gracias a las cuantizaciones GGUF.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de voz local para Home Assistant: el modelo recibe la transcripción del comando ("sube la persiana del salón") y emite la llamada de servicio correspondiente, ejecutándose en local sin enviar datos a la nube.
- Automatizaciones conversacionales multi-turno: al integrarse en el pipeline de conversación de Home Assistant, gestiona diálogos de seguimiento ("y ahora baja un poco la temperatura") manteniendo el contexto de la conversación.
- Control de reproducción musical por voz: mediante Music Assistant, el usuario puede pedir reproducir un artista, cambiar de canción o ajustar el volumen, y el modelo traduce la intención a la API del reproductor.
- Escenarios de domótica combinados: el modelo puede encadenar varias herramientas en una sola petición ("apaga las luces del salón y pon música relajante"), aprovechando su razonamiento multi-paso.
- Despliegue en mini-PC o NAS doméstico: con cuantizaciones Q4_K_M (16,9 GB) o IQ4_XS (14,0 GB) puede ejecutarse en hardware de consumo con suficiente RAM, ofreciendo privacidad total.
- Prototipado de asistentes de voz personalizados: desarrolladores que quieran construir su propio asistente domótico pueden usar el modelo como capa de intención sobre cualquier backend de dispositivos.
- Evaluación de tool calling en entornos restringidos: útil como banco de pruebas para pipelines de agentes que necesiten un modelo pequeño y especializado en lugar de un LLM generalista de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: IQ1_S ~8,4 GB; IQ2_M ~10,5 GB; IQ3_M ~12,5 GB; IQ4_XS ~14,0 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB.
- GPU recomendadas: RTX 4090 (24 GB) permite Q5_K_M o Q6_K completos en VRAM; RTX 3090/4080 (16-24 GB) admite Q4_K_M con holgura; GPUs de 12 GB (RTX 3060, RTX 4070) pueden ejecutar IQ3_M o IQ4_XS con offload parcial a RAM.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más para cuantizaciones Q4; en 12 GB con cuantizaciones IQ3 o IQ4_XS y offload parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI requerirían los pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LunaraHome-26B-A4B (i1-GGUF) | 25,2 B totales (~4 B activos) | No disponible | Apache 2.0 | Tool calling domótica (Home Assistant, Music Assistant) |
| Qwen2.5-32B-Instruct | 32,5 B | 128 K | Apache 2.0 | Generalista con buen soporte de tool calling |
| Llama 3.3 70B Instruct | 70 B | 128 K | Llama 3.3 Community License | Generalista, requiere hardware mucho mayor |
| Gemma 2 27B IT | 27 B | 8 K | Gemma License | Generalista, base de la familia empleada aquí |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo en benchmarks que permitan una comparación cuantitativa con las alternativas. La principal ventaja de LunaraHome es su especialización y su licencia Apache 2.0 permisiva, frente a la licencia Gemma de los modelos base de Google.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo etiqueta como `experimental`, por lo que no debe asumirse estabilidad en producción sin validación previa.
- Idiomas limitados a alemán e inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación en llamadas de herramientas: puede generar nombres de servicios o entidades inexistentes en Home Assistant, lo que requiere validación en el backend.
- Especialización estrecha: su rendimiento en tareas generales de razonamiento, código o matemáticas no está documentado y probablemente sea inferior al de modelos generalistas del mismo tamaño.
- Sin datos de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Las cuantizaciones por debajo de IQ3 sufren degradación notable de calidad, según advierte el propio autor de las cuantizaciones.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Gemma 4 del que deriva, ya que las licencias de la familia Gemma suelen incluir cláusulas de uso aceptable que podrían afectar a usos comerciales.
- No se documenta la longitud de contexto, lo que impide planificar conversaciones largas o prompts extensos con garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/LunaraHome-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/Maxinger15/LunaraHome-26B-A4B
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/LunaraHome-26B-A4B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#LunaraHome-26B-A4B-i1-GGUF
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
