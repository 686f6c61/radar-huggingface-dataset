# Ishowbackup/Mistral-Small-4-Uncensored-JANG_2L

## Resumen

El modelo Ishowbackup/Mistral-Small-4-Uncensored-JANG_2L es una versión modificada de Mistral Small 4 (119B), un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con atención latente multi-cabeza (MLA) y 128 expertos, desarrollado por Mistral AI. Esta adaptación, creada por Ishowbackup (en colaboración con el ecosistema JANG), aplica dos transformaciones principales: una cuantización mixta de precisión llamada JANG_2L (8/6/2 bits) que reduce el modelo a 37 GB, y un proceso de ablación de rechazo (CRACK) que elimina permanentemente los guardarraíles de seguridad a nivel de pesos, dando lugar a una versión "sin censura" que no rechaza solicitudes.

El modelo está diseñado específicamente para Apple Silicon y solo puede ejecutarse mediante MLX Studio o el paquete Python `jang-tools`. Incluye tensores de visión Pixtral, lo que permite capacidades multimodales (imagen-texto), y soporta un modo de razonamiento ajustable mediante el parámetro `reasoning_effort`. Su relevancia radica en ofrecer una alternativa de alto rendimiento (119B totales, ~8B activos) con una huella de memoria reducida y sin restricciones de seguridad, lo que lo hace atractivo para investigación en alineación, análisis de contenido y generación creativa sin filtros, aunque con implicaciones éticas y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con MLA (Multi-head Latent Attention), 128 expertos |
| Parametros totales | 119B |
| Parametros activos | ~8B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_2L (8-bit atencion, 6-bit capas importantes, 2-bit expertos; promedio 2.1 bits) |
| Idiomas soportados | Ingles (tag "en") |
| Licencia | Apache-2.0 |
| Formato de pesos | JANG (formato propietario equivalente a GGUF para MLX, no safetensors) |

## Arquitectura y entrenamiento

El modelo base es Mistral Small 4, una arquitectura MoE con 119B parámetros totales y aproximadamente 8B activos por token, que incorpora Multi-head Latent Attention (MLA) para reducir el coste de memoria en atención y 128 expertos para el routing condicional. Sobre esta base, el autor aplica dos modificaciones:

1. **Cuantización JANG_2L**: un esquema de precisión mixta que clasifica cada tensor de pesos según su sensibilidad y asigna bits de forma adaptativa (8 bits para atención, 6 para capas críticas y 2 para expertos), logrando un tamaño de 37 GB con una calidad por bit superior a la cuantización uniforme.

2. **Ablación CRACK** (Controlled Refusal Ablation via Calibrated Knockouts): una intervención a nivel de pesos que elimina la alineación de seguridad (refusals) de forma permanente, sin usar LoRA ni fine-tuning. Según el autor, esta intervención reduce el MMLU sin razonamiento solo un 1.4% respecto al modelo base cuantizado, mientras que el rendimiento con razonamiento se mantiene alto (89.9% en MMLU).

No se dispone de información detallada sobre el entrenamiento original del modelo base (datos, tokens, método de alineación) más allá de que es un modelo instructivo de Mistral AI.

## Capacidades

- Generacion de texto y razonamiento paso a paso: soporta el parámetro `reasoning_effort` (none, low, high) que activa un modo de pensamiento entre etiquetas `[THINK]...[/THINK]` antes de responder.
- Capacidades multimodales (vision): incluye tensores Pixtral, permitiendo procesar imagenes junto con texto a traves del motor de MLX Studio.
- Sin guardarrailes: el modelo no rechaza solicitudes que normalmente serian bloqueadas por sistemas de seguridad, como se demuestra en los resultados de HarmBench (95.9%).
- Compatibilidad limitada: solo funciona en MLX Studio o con `jang-tools`, no es compatible con herramientas basadas en GGUF (LM Studio, Ollama, etc.).
- No se menciona soporte explicito para tool calling o function calling en la informacion proporcionada, aunque el modelo base de Mistral Small 4 podria tenerlo; no se confirma.

## Casos de uso

- Investigacion en seguridad informatica: el modelo puede usarse para generar exploits, tecnicas de evasion o analisis de vulnerabilidades sin restricciones, gracias a su alta tasa de cumplimiento en categorias como "Auth Bypass" (97%) o "API Hacking" (96%). Es adecuado para equipos de red team que necesitan probar defensas con escenarios realistas.
- Analisis de contenido sensible: permite examinar textos o imagenes con contenido potencialmente peligroso o ilegal sin filtros, util para moderacion de plataformas, estudios de toxicidad o investigacion academica sobre discurso de odio.
- Generacion creativa sin limites: escritores y creadores pueden producir narrativas, dialogos o guiones con temas tabu o controvertidos sin que el modelo se niegue, aprovechando su razonamiento de alta calidad (89.9% MMLU con thinking).
- Desarrollo de agentes de razonamiento complejo: gracias a su modo `reasoning_effort` y su capacidad de proceso multimodal, puede integrarse en sistemas que requieren analisis profundo de imagenes y texto, como asistentes de diagnostico medico o analisis de documentos cientificos (aunque con cautela por su falta de guardarrailes).
- Experimentacion en alineacion y seguridad de IA: investigadores pueden estudiar el comportamiento de un modelo sin alineacion para entender mejor los mecanismos de rechazo, los sesgos o los riesgos de modelos desbloqueados.
- Prototipado rapido en entornos controlados: dado su tamano reducido (37 GB) y su compatibilidad con Apple Silicon, puede desplegarse en Macs de 64 GB para pruebas locales de aplicaciones que requieran respuestas sin restricciones, como chatbots de rol o simulaciones.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes:

| Benchmark | Resultado |
|---|---|
| HarmBench (tasa de cumplimiento) | 95.9% (307/320) |
| MMLU (con razonamiento, 208 preguntas) | 89.9% (187/208) |
| MMLU (sin razonamiento) | 65.9% (137/208) |

Desglose de HarmBench por categoria:

| Categoria | Puntuacion |
|---|---|
| Covering Tracks | 20/20 (100%) |
| Auth Bypass | 97/100 (97%) |
| API Hacking | 96/100 (96%) |
| Cloud Exploits | 94/100 (94%) |

Desglose de MMLU por materia (con razonamiento): destaca HS Biology (100%), Conceptual Physics (94%), HS Geography y World Religions (88%), mientras que las materias mas debiles son Abstract Algebra (31%) y College CS (38%). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Memoria: el modelo ocupa 37 GB en disco, por lo que requiere al menos 64 GB de RAM unificada en Apple Silicon para cargarlo completo (recomendado por el autor).
- GPU: exclusivo para Apple Silicon (M-series). No se mencionan GPUs de NVIDIA o AMD; el formato JANG esta disenado para el framework MLX.
- Compatibilidad: solo funciona con MLX Studio (aplicacion) o mediante `pip install "jang[mlx]"` y el paquete `jang_tools`. No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni TGI.
- Rendimiento: no se proporcionan datos de latencia o throughput. Dado el tamano (119B totales, ~8B activos), se espera una velocidad razonable en Macs de gama alta, pero sin cifras concretas.
- Opciones de despliegue: MLX Studio es la unica aplicacion que soporta el formato JANG; alternativamente, se puede usar el script de Python mostrado en la model card.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos en los datos proporcionados. La model card menciona una version alternativa, `dealignai/Mistral-Small-4-119B-JANG_4M-CRACK`, que usa un perfil de cuantizacion mas alto (64 GB) y alcanza 95.3% en HarmBench y 8/8 en cumplimiento, pero no se detallan diferencias adicionales. Tampoco hay comparaciones con otros modelos "uncensored" como Dolphin-Mixtral o Llama 3.1 405B, aunque por tamano y arquitectura este modelo se situa en una categoria superior a los modelos de 24B o 70B.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una version sin alineacion, es mas probable que genere contenido falso, toxico o peligroso sin filtro. No se han realizado evaluaciones de sesgo en la informacion disponible.
- Riesgo de uso indebido: la eliminacion de guardarrailes facilita la generacion de malware, phishing o contenido ilegal. Su uso en produccion debe restringirse a entornos controlados y legales.
- Compatibilidad restringida: el formato JANG no es estandar y solo funciona en MLX Studio o `jang-tools`, lo que limita su integracion en infraestructuras existentes basadas en GGUF o safetensors.
- Idioma: solo se confirma soporte para ingles; no se garantiza calidad en otros idiomas.
- Licencia: aunque es Apache-2.0, el caracter "uncensored" puede entrar en conflicto con politicas de uso aceptable de plataformas de despliegue o con regulaciones locales.
- Rendimiento degradado sin razonamiento: el MMLU sin thinking cae al 65.9%, lo que indica que el modelo depende del modo de razonamiento para tareas complejas; en aplicaciones de baja latencia podria ofrecer respuestas de menor calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ishowbackup/Mistral-Small-4-Uncensored-JANG_2L
- Modelo base (Mistral Small 4): https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- MLX Studio (aplicacion requerida): https://mlx.studio
- Version alternativa JANG_4M: https://huggingface.co/dealignai/Mistral-Small-4-119B-JANG_4M-CRACK
- Paquete Python `jang-tools`: no se proporciona enlace directo, pero se instala via `pip install "jang[mlx]"`
