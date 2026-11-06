# Myungkyu/cosmos3_mot_l24_d1024_robodojo_b64_60k_scratch_ema

## Resumen

Cosmos3-Nano es un modelo de mundo (world model) de vídeo para robótica, desarrollado en el ecosistema del framework Cosmos (NVIDIA) y publicado por el usuario Myungkyu en Hugging Face. Este checkpoint concreto es un ajuste fino (fine-tuning) de Cosmos3-Nano con un DiT de acciones externo, entrenado sobre el simulador RoboDojo Sim en formato LeRobot v3.0, y orientado a control robótico en bucle cerrado (closed-loop). La condicionalización es unidireccional vídeo-a-acción y comparte el esquema temporal de acciones con el modelo base.

El modelo se distribuye como pesos EMA (net_ema) del checkpoint final de entrenamiento, convertidos a bf16 y guardados como un checkpoint de torch.distributed (DCP) de un solo rango, sin estado del optimizador. El repositorio ocupa 31,4 GB e incluye además el fichero de configuración de entrenamiento y sumas de verificación SHA-256.

Por su naturaleza, no es un modelo de lenguaje ni un chatbot: es una política de acción para robots que genera comandos motores condicionados por observaciones de vídeo, lo que lo sitúa en la categoría de modelos fundacionales para manipulación y control robótico. La información pública disponible es escasa (0 descargas, 0 likes, sin licencia declarada ni benchmarks), por lo que esta ficha se limita a lo que la model card y los metadatos permiten afirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (world model de vídeo) + DiT de acciones externo; condicionalización vídeo-a-acción unidireccional |
| Parámetros totales | no disponible (el nombre sugiere L24 = 24 capas, D1024 = dimensión 1024, pero no se confirma el recuento) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (único formato publicado); no se documentan GGUF, int8 ni int4 |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/.metadata`, `model/__0_0.distcp`, claves `net.*`; incluye `config.yaml` y `SHA256SUMS` |
| Tamaño del repositorio | 31,4 GB |
| Dataset de entrenamiento | RoboDojo Sim (LeRobot v3.0) |
| Checkpoint | EMA del paso final (60k pasos según el nombre), bf16, sin estado del optimizador |

## Arquitectura y entrenamiento

El modelo combina un world model de vídeo Cosmos3-Nano con un Diffusion Transformer (DiT) de acciones externo. La condicionalización es unidireccional: el vídeo (observaciones) alimenta al generador de acciones, y ambos comparten un esquema temporal de acciones común. El entrenamiento se realizó desde cero (scratch, según el nombre del checkpoint) sobre el simulador RoboDojo Sim en formato LeRobot v3.0, con un batch de 64 y 60k pasos. Los pesos publicados corresponden a la media móvil exponencial (EMA) del checkpoint final, convertidos a bf16.

La configuración de entrenamiento (`config.yaml`) se incluye en el repositorio con rutas locales sustituidas por marcadores de posición (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`). El servidor de políticas de cosmos-framework construye el modelo a partir de ese fichero y lee de él la longitud de chunk, el ratio de vídeo, el formato de prompt y los ajustes de estado. Para la carga es necesario apuntar `vae_path` a un fichero VAE local de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B), lo que revela que el pipeline de vídeo reutiliza el VAE de Wan 2.2. No se documentan detalles sobre volumen de tokens, composición del dataset, RLHF/DPO ni innovaciones de decodificación más allá de lo indicado.

## Capacidades

- Generación de acciones motoras para control robótico en bucle cerrado, condicionadas por observaciones de vídeo.
- Modelado de mundo de vídeo: representación latente del entorno a partir de secuencias visuales.
- Condicionalización vídeo-a-acción unidireccional con esquema temporal de acciones compartido.
- Entrenado específicamente sobre RoboDojo Sim, por lo que su dominio principal es la simulación de manipulación robótica.
- Integración con el servidor de políticas de cosmos-framework mediante `--checkpoint-path` y `--config-file`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Control de robots manipuladores en simulación: el modelo recibe observaciones de vídeo de RoboDojo Sim y emite secuencias de acciones de chunk completo, adecuado para políticas de imitación en entornos simulados antes de un posible transfer a real.
- Investigación en world models para robótica: sirve como punto de partida para estudiar la condicionalización vídeo-a-acción y el esquema temporal compartido entre percepción y control.
- Evaluación de políticas en bucle cerrado: al integrarse con el servidor de cosmos-framework, permite desplegar la política contra un simulador y medir tasas de éxito de tareas.
- Fine-tuning sobre nuevos datasets LeRobot v3.0: la configuración incluida y el formato DCP facilitan reentrenar sobre dominios robóticos adicionales.
- Generación de datos sintéticos de trayectorias: el componente de world model puede emplearse para predecir futuros visuales condicionados por acciones y aumentar datasets de entrenamiento.
- Reproducción de experimentos: los SHA-256 y el `config.yaml` permiten reproducir la carga exacta del checkpoint en pipelines de investigación.
- Prototipado de pipelines VLA (vision-language-action): como bloque de acción dentro de una arquitectura mayor que añada instrucciones en lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio pesa 31,4 GB en bf16, por lo que la inferencia requiere al menos ~32 GB de VRAM solo para pesos, más memoria para activaciones y el VAE de Wan2.2.
- GPU recomendadas: no documentadas; por tamaño, se necesitan GPUs de centro de datos (A100 80 GB, H100) para margen suficiente; una RTX 4090 (24 GB) no cabe en bf16 sin cuantización, y no se publican pesos cuantizados.
- Cabe en GPU de consumo: no en bf16 con el tamaño actual; no hay versiones GGUF ni int8/int4 publicadas.
- Opciones de despliegue: servidor de políticas de cosmos-framework (`--checkpoint-path <repo> --config-file config.yaml`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas de LLM, no aplicables directamente a este formato DCP).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l24_d1024_robodojo_b64_60k_scratch_ema | no disponible (L24, D1024 según nombre) | no disponible | sin benchmarks publicados | no disponible | Hugging Face, formato DCP |
| Cosmos3-Nano (modelo base) | no disponible | no disponible | no disponible | no disponible | referenciado como dependencia (`<Cosmos3-Nano-dcp>`) |
| Wan2.2-TI2V-5B | ~5B (VAE reutilizado) | no aplica | no disponible | no disponible | Hugging Face (Wan-AI) |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría (políticas VLA o world models robóticos); la comparación anterior es meramente estructural.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse solo en RoboDojo Sim, el modelo puede sobreajustarse a las distribuciones visuales y dinámicas de ese simulador y fallar en entornos reales.
- Riesgo de alucinación: en world models, las predicciones visuales pueden divergir de la física real; no hay evaluación publicada de fidelidad.
- Limitaciones de contexto e idioma: no se documentan ventanas de contexto ni capacidades lingüísticas; no es un modelo de lenguaje.
- Licencia: no declarada en Hugging Face, lo que impide confirmar si el uso comercial está permitido; además, el modelo base Cosmos3-Nano y el VAE de Wan2.2 tienen sus propias licencias que deben verificarse por separado.
- Producción: el checkpoint es un DCP de un solo rango con pesos EMA y sin optimizador; requiere el servidor de cosmos-framework y un VAE externo, lo que añade dependencias y complejidad operativa.
- Repositorio sin descargas ni validación comunitaria (0 likes, 0 descargas): no hay evidencia externa de calidad ni de reproducibilidad.
- El nombre del checkpoint sugiere entrenamiento desde cero, pero no se detalla la inicialización exacta ni el volumen de datos; la trazabilidad es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l24_d1024_robodojo_b64_60k_scratch_ema
- VAE de referencia (Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos (referencia del ecosistema): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Repositorio de código de cosmos-framework: no disponible en la información proporcionada
