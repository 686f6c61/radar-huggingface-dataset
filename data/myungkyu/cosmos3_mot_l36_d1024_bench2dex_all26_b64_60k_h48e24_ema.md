# Myungkyu/cosmos3_mot_l36_d1024_bench2dex_all26_b64_60k_h48e24_ema

## Resumen

Cosmos3 Mot L36 D1024 Bench2Dex es un modelo de política de acción para robótica construido sobre Cosmos3-Nano, el modelo de mundo en vídeo de NVIDIA. El autor, Myungkyu, lo ha afinado con un DiT de acción externo que condiciona la predicción de acciones sobre el flujo de vídeo generado, en un esquema unidireccional vídeo-a-acción con calendario de acciones compartido. El resultado es un policy que opera en bucle cerrado: dado el estado del robot y la observación visual, produce acciones motrices.

El entrenamiento se ha realizado sobre Bench2Dex, un conjunto que cubre las 26 configuraciones de tarea sobre 12 morfologías de robot distintas en formato LeRobot v3.0, lo que lo convierte en un modelo pensado para generalizar entre cuerpos y tareas de destreza manual. El checkpoint publicado son los pesos EMA del paso final de entrenamiento, en bf16, empaquetados como un checkpoint de `torch.distributed` de un solo rango, sin estado del optimizador.

Su relevancia es doble: por un lado, explora la línea de investigación que usa modelos de mundo en vídeo como base para el control robótico; por otro, al publicar los pesos y la configuración de entrenamiento con rutas saneadas, permite reproducir la carga en el servidor de políticas de `cosmos-framework`. No obstante, es un artefacto de investigación: cero descargas, sin licencia declarada y sin benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) sobre Cosmos3-Nano, con DiT de acción externo y condicionamiento vídeo-a-acción |
| Parámetros totales | no disponible (la nomenclatura L36 D1024 sugiere 36 capas y dimensión 1024, sin confirmar) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (único formato publicado) |
| Idiomas soportados | no disponible (modelo orientado a percepción visual y acción, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) en bf16, ficheros `model/__0_0.distcp` y `model/.metadata` |
| Tamaño del repositorio | 32,8 GB |
| VAE asociado | Wan2.2 VAE (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) |
| Framework | cosmos-framework (servidor de políticas de acción) |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un modelo de mundo generativo de vídeo, y le acopla un DiT de acción externo. La condición es unidireccional: el flujo de vídeo condiciona la generación de acciones, y ambas ramas comparten un calendario de difusión (shared action schedule), de modo que el proceso de denoising de acciones se alinea con el del vídeo. La nomenclatura del checkpoint (`l36_d1024_h48e24`) apunta a 36 capas, dimensión 1024 y 48 cabezas con dimensión de expansión 24, aunque la model card no lo explicita. La decodificación visual emplea el VAE de Wan2.2-TI2V-5B.

El entrenamiento se hizo sobre Bench2Dex, con las 26 configuraciones de tarea y 12 morfologías de robot, en formato LeRobot v3.0, con batch de 64 y 60 000 pasos según el nombre del checkpoint. El autor publica únicamente los pesos EMA (`net_ema`, convertidos a bf16 y almacenados bajo los nombres `net.*`) del checkpoint final, sin estado del optimizador. La configuración de entrenamiento se distribuye en `config.yaml` con las rutas locales sustituidas por marcadores (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`); el servidor construye el modelo a partir de ella y lee la longitud de chunk, el ratio de vídeo, el formato de prompt y los ajustes de estado.

## Capacidades

- Control robótico en bucle cerrado: genera acciones motrices a partir de observaciones visuales y del estado del robot.
- Política multi-embodiment: entrenado sobre 12 morfologías distintas, lo que permite transferir el mismo modelo a brazos y manos diferentes.
- Cobertura de 26 configuraciones de tarea del benchmark Bench2Dex, orientadas a destreza manual.
- Condicionamiento vídeo-a-acción: la representación latente del modelo de mundo guía la predicción de acciones.
- Integración con el servidor de políticas de `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- No se documentan capacidades de tool calling, agentes, razonamiento textual, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Manipulación diestra con manos robóticas: el modelo se usaría como política de bajo nivel que recibe la imagen de la cámara y el estado articular y emite comandos de acción; su entrenamiento sobre 26 configuraciones de Bench2Dex lo hace adecuado para tareas de agarre y manipulación fina.
- Despliegue multi-robot en un mismo centro de investigación: al cubrir 12 morfologías, permite mantener una sola política para varios brazos y manos en lugar de un modelo por plataforma, simplificando el mantenimiento.
- Evaluación comparativa de políticas: sirve como referencia entrenada sobre el benchmark completo para contrastar nuevas políticas o variantes de condicionamiento vídeo-a-acción.
- Investigación en modelos de mundo para control: permite estudiar hasta qué punto la dinámica aprendida por Cosmos3-Nano mejora la predicción de acciones frente a políticas puramente reactivas.
- Reproducción de experimentos: con los pesos EMA, la configuración y los hashes SHA-256, un laboratorio puede reconstruir el pipeline de inferencia y verificar la integridad de los ficheros.
- Prototipado de tareas de destreza antes de un ajuste fino específico: el modelo puede servir de inicialización para un fine-tuning sobre un robot concreto, reduciendo el coste frente a entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de Bench2Dex ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 32,8 GB en bf16, por lo que se necesita al menos una GPU con 40 GB o más para cargar los pesos completos sin cuantizar, más el VAE de Wan2.2 y los buffers de activación.
- GPU recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para inferencia en bf16; no se documentan requisitos oficiales.
- GPU de consumo: improbable en RTX 4090 (24 GB) en bf16 sin cuantización, dado el tamaño del checkpoint; no se han publicado recetas de cuantización (GGUF, AWQ, GPTQ) para este modelo.
- Opciones de despliegue: el servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path <directorio del repo> --config-file config.yaml`; requiere un fichero local `Wan2.2_VAE.pth` apuntado desde `vae_path`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3 Mot L36 D1024 Bench2Dex (este) | Cosmos3-Nano + DiT de acción | no disponible | no disponible | no disponible | Pesos DCP bf16 en HuggingFace |
| Cosmos3-Nano (modelo base) | Modelo de mundo de vídeo de NVIDIA | no disponible | no disponible | no disponible | Referenciado en la model card, sin enlace directo |
| Políticas tipo diffusion policy sobre LeRobot | Transformer de difusión | variable | no disponible | variable | Múltiples implementaciones open source |

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a aspectos de disponibilidad y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial ni condiciones de redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Modelo de investigación con cero descargas y cero likes: sin validación externa ni reportes de terceros sobre su funcionamiento.
- Sin benchmarks publicados: no hay evidencia numérica de tasa de éxito en Bench2Dex ni en robots reales.
- Formato de checkpoint no estándar: DCP de un solo rango con claves `net.*`; no es cargable directamente con `transformers` ni con herramientas de inferencia convencionales.
- Dependencia de rutas locales: el `config.yaml` incluye marcadores para el checkpoint de Cosmos3-Nano, el dataset y el VAE de Wan2.2, que el usuario debe sustituir por rutas válidas.
- Riesgo de sobreajuste al benchmark: al entrenarse sobre las 26 configuraciones de Bench2Dex, el rendimiento en tareas fuera de esa distribución no está caracterizado.
- Sesgos y alucinaciones: no evaluados; en un modelo de acción, los fallos se manifiestan como movimientos incorrectos o inseguros, no como texto erróneo, lo que exige salvaguardas físicas en el robot.
- Idiomas: no aplica ni se documenta; el modelo no procesa lenguaje natural como entrada principal.
- Uso en producción: no recomendado sin una evaluación propia de seguridad física, latencia y robustez ante cambios de iluminación, cámara o morfología.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_bench2dex_all26_b64_60k_h48e24_ema
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Cosmos3-Nano: no disponible como enlace directo en la información proporcionada
- Bench2Dex: no disponible como enlace directo en la información proporcionada
- Repositorio de `cosmos-framework`: no disponible como enlace directo en la información proporcionada
