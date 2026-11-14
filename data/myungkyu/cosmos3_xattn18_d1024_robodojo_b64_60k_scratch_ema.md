# Myungkyu/cosmos3_xattn18_d1024_robodojo_b64_60k_scratch_ema

## Resumen

Cosmos3-Nano es un modelo de mundo (world model) de vídeo entrenado por NVIDIA dentro del framework Cosmos, y este repositorio contiene un ajuste fino (fine-tuning) realizado por el usuario Myungkyu orientado al control de robots. El modelo combina el backbone de vídeo Cosmos3-Nano con un DiT de acciones externo que recibe condicionamiento unidireccional vídeo-a-acción y comparte el calendario de acciones, lo que permite su uso como política de acción en bucle cerrado (closed-loop robot control).

El modelo ha sido entrenado sobre el simulador RoboDojo (formato LeRobot v3.0) durante 60 000 pasos con batch de 64, partiendo de pesos inicializados desde cero (scratch) y guardando los pesos EMA finales en bf16. La nomenclatura del identificador refleja la configuración: atención cruzada con 18 capas (`xattn18`), dimensión de modelo 1024 (`d1024`), dataset RoboDojo (`robodojo`), batch 64 (`b64`), 60k pasos y pesos EMA (`ema`).

Es relevante porque demuestra el uso del ecosistema Cosmos para políticas robóticas con condicionamiento vídeo-a-acción, un enfoque que combina la potencia de un world model de vídeo con un decodificador de acciones dedicado. El repositorio pesa 32,2 GB y se distribuye como checkpoint DCP de un solo rango, sin estado del optimizador, pensado para cargarse con el servidor de políticas del framework Cosmos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de vídeo Cosmos3-Nano + DiT de acciones externo con condicionamiento unidireccional vídeo-a-acción (atención cruzada, 18 capas, d_model=1024) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto multilingüe) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) de un solo rango, con claves `net.*`; ficheros `model/.metadata` y `model/__0_0.distcp` |

## Arquitectura y entrenamiento

La arquitectura parte del world model de vídeo Cosmos3-Nano (familia Cosmos de NVIDIA) y le acopla un DiT de acciones externo. El condicionamiento es unidireccional desde el vídeo hacia las acciones, con un calendario de acciones compartido entre ambos componentes. La nomenclatura `xattn18_d1024` indica 18 capas de atención cruzada y una dimensión de modelo de 1024.

El entrenamiento se realizó sobre el simulador RoboDojo en formato LeRobot v3.0, con batch de 64 durante 60 000 pasos, inicializando los pesos desde cero (scratch) y guardando los pesos EMA del checkpoint final en bf16. El checkpoint no incluye estado del optimizador ni el otro conjunto de pesos del checkpoint de entrenamiento. La configuración de entrenamiento (`config.yaml`) contiene rutas locales sustituidas por marcadores de posición y el servidor del framework Cosmos construye el modelo a partir de ella, leyendo la longitud de chunk, la relación de vídeo, el formato de prompt y los ajustes de estado. Para cargar el modelo es necesario apuntar `vae_path` a un fichero VAE local de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B).

## Capacidades

- Control robótico en bucle cerrado mediante una política de acción condicionada por vídeo.
- Modelado de mundo de vídeo (world model) heredado del backbone Cosmos3-Nano.
- Condicionamiento unidireccional vídeo-a-acción con calendario de acciones compartido.
- Integración con el servidor de políticas del framework Cosmos para inferencia.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales como thinking mode, visión de entrada o audio.

## Casos de uso

- Manipulación robótica en simulación: el modelo se usa como política de acción en RoboDojo para generar secuencias de acciones a partir de observaciones de vídeo, aprovechando el condicionamiento vídeo-a-acción.
- Investigación en world models para robótica: sirve como base para estudiar cómo un backbone de vídeo Cosmos3-Nano transfiere representaciones al dominio de acciones.
- Evaluación de políticas en bucle cerrado: el servidor de políticas del framework Cosmos permite desplegar el checkpoint y medir el rendimiento en tareas de control.
- Punto de partida para fine-tuning adicional: al estar entrenado desde cero sobre RoboDojo, puede servir como inicialización para otros datasets LeRobot v3.0.
- Reproducción de experimentos: la `config.yaml` y los `SHA256SUMS` permiten reconstruir el entorno de entrenamiento e inferencia con rutas locales sustituidas.
- Experimentos de ablación sobre atención cruzada: la configuración `xattn18_d1024` permite estudiar el efecto del número de capas y de la dimensión del modelo en la política resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 32,2 GB en bf16, lo que da una cota inferior orientativa para cargar los pesos en memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del checkpoint (32,2 GB en bf16) sugiere que no cabe en GPU de consumo de gama media sin cuantización adicional.
- Opciones de despliegue: servidor de políticas del framework Cosmos (`--checkpoint-path <repo> --config-file config.yaml`), con dependencia de un VAE Wan2.2 local.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Modelo entrenado específicamente sobre RoboDojo Sim; el rendimiento fuera de ese simulador o en robots reales no está documentado.
- Pesos EMA en bf16 sin estado del optimizador: no es posible reanudar el entrenamiento tal cual desde este checkpoint.
- Requiere un VAE Wan.2.2 externo (`Wan2.2_VAE.pth`) para la carga, lo que añade una dependencia no incluida en el repositorio.
- El formato DCP de un solo rango limita la carga a configuraciones compatibles con el servidor del framework Cosmos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, al no ser un modelo de lenguaje.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_xattn18_d1024_robodojo_b64_60k_scratch_ema
- VAE Wan2.2 (referenciado en la model card): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
