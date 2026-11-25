# Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b128_60k_scratch_shallow30_cps_vf64_chunk4_s30k

## Resumen

Cosmos3-Nano es un modelo de mundo (world model) de vídeo orientado a robótica, desarrollado dentro del ecosistema Cosmos y publicado por el usuario Myungkyu en Hugging Face. Esta variante concreta es un ajuste fino (fine-tuning) del modelo base Cosmos3-Nano al que se le añade un DiT de acciones externo, configurado para control robótico en bucle cerrado (closed-loop). El modelo combina generación de vídeo con predicción de acciones, de modo que puede anticipar la evolución visual de una escena y traducirla en comandos motores.

La arquitectura es un transformer de tipo Mixture-of-Transformers (MoT) con 36 capas y dimensión oculta de 1024, entrenado desde cero (scratch) con un esquema de ruido desacoplado: el ruido de las acciones se muestrea de forma independiente al del vídeo, mediante una pasada de vídeo puro en modo no-grad. El entrenamiento se realizó sobre el dataset RoboDojo Sim en formato LeRobot v3.0, con un tamaño de batch de 128 y 60 000 pasos, y esta ficha corresponde al checkpoint intermedio del paso 30 000 (pesos EMA en bf16).

Su relevancia radica en que ejemplifica la línea de investigación de modelos de mundo aplicados a robótica: en lugar de entrenar una política puramente reactiva, se aprovecha un modelo generativo de vídeo como representación del entorno para condicionar la acción. El repositorio ocupa 31,7 GB y se distribuye en formato de checkpoint distribuido de PyTorch (DCP), lo que lo hace apto para investigación y experimentación, pero no para despliegue directo sin herramientas específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Transformers (MoT) con DiT de acciones externo; 36 capas, dimensión oculta 1024 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/__0_0.distcp` y `model/.metadata`, en bf16 |

## Arquitectura y entrenamiento

El modelo se basa en Cosmos3-Nano, un modelo de mundo de vídeo, y le incorpora un DiT (Diffusion Transformer) de acciones externo. La condicionación es unidireccional vídeo-a-acción: el vídeo condiciona la generación de acciones, pero no al revés. Una innovación destacable es el uso de esquemas de ruido desacoplados: el ruido de las acciones se muestrea de forma independiente al del vídeo, y se realiza una pasada de vídeo puro en modo no-grad (sin gradientes) para la rama de vídeo. El nombre del checkpoint indica además un entrenamiento "scratch" con "shallow30" y "chunk4", es decir, fragmentos de acción de longitud 4 y una profundidad de 30, así como un factor de vídeo de 64 ("vf64") y una variante "decoupled_nofix".

El entrenamiento se llevó a cabo sobre RoboDojo Sim, un dataset de simulación en formato LeRobot v3.0, con batch de 128 durante 60 000 pasos. Los pesos publicados son los EMA (media móvil exponencial) del checkpoint del paso 30 000, convertidos a bf16 y almacenados bajo los nombres `net.*` en un checkpoint distribuido de un solo rango (single-rank). No se incluye estado del optimizador. La configuración de entrenamiento (`config.yaml`) contiene rutas locales sustituidas por marcadores de posición, y requiere un fichero VAE local de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) para cargar el modelo.

## Capacidades

- Generación y predicción de vídeo: el modelo es un world model de vídeo capaz de anticipar la evolución visual de una escena robótica.
- Predicción de acciones para control robótico: integra un DiT de acciones que produce comandos motores condicionados por el vídeo.
- Control en bucle cerrado (closed-loop): diseñado para operar de forma iterativa con realimentación del entorno simulado.
- Condicionamiento vídeo-a-acción unidireccional: la información visual guía la acción, sin retorno de la acción al vídeo.
- Entrenamiento en simulación: orientado a tareas de manipulación/robótica en RoboDojo Sim.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües, visión estática, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en modelos de mundo para robótica: usar el modelo como base para estudiar cómo la predicción visual condiciona la política de acción en entornos simulados.
- Simulación de manipulación robótica: integrar el modelo en RoboDojo Sim para generar trayectorias de acción a partir de observaciones visuales.
- Evaluación de esquemas de ruido desacoplado: servir de referencia reproducible para comparar el muestreo independiente de ruido de acción frente a esquemas acoplados.
- Generación de datos sintéticos de vídeo-acción: producir pares vídeo-acción para aumentar datasets de entrenamiento de políticas robóticas.
- Baseline para fine-tuning: punto de partida (checkpoint intermedio del paso 30 000) para ajustes posteriores sobre otros datasets LeRobot.
- Estudio de condicionamiento unidireccional: analizar las limitaciones de un diseño en el que la acción no realimenta al vídeo, útil para investigación metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 31,7 GB en bf16, lo que da una cota inferior aproximada para cargar los pesos, pero no se especifica el consumo real de inferencia.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, se requerirían GPU de clase profesional (A100/H100) para cargar los pesos completos en bf16, pero el autor no lo indica.
- ¿Cabe en GPU de consumo? No disponible; con 31,7 GB de pesos en bf16, no cabría en GPU de consumo de 24 GB sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: servidor de políticas de acción de cosmos-framework, con `--checkpoint-path <dir del repo> --config-file config.yaml` (la herramienta añade `model/`). Requiere además un VAE local de Wan2.2 (`Wan2.2_VAE.pth`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano (base) | no disponible | no disponible | World model de vídeo | no disponible | Ecosistema Cosmos |
| Este checkpoint (Cosmos3-Nano + DiT de acciones) | no disponible (36 capas, d=1024) | no disponible | World model + política de acción robótica | no disponible | Hugging Face (Myungkyu) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; es un riesgo importante para producción.
- Checkpoint intermedio: corresponde al paso 30 000 de un entrenamiento de 60 000, por lo que no representa el modelo final de la ejecución.
- Solo pesos EMA en bf16: no se incluye estado del optimizador ni el otro conjunto de pesos, lo que limita la reanudación del entrenamiento.
- Formato DCP de un solo rango: requiere el servidor de cosmos-framework para cargar; no es un formato estándar de inferencia (safetensors/GGUF).
- Dependencia externa: necesita un VAE local de Wan2.2 (`Wan2.2_VAE.pth`) y una configuración con rutas sustituidas por marcadores de posición.
- Condicionamiento unidireccional: la acción no realimenta al vídeo, lo que puede limitar la coherencia en tareas que exigen planificación conjunta.
- Entrenado en simulación (RoboDojo Sim): el rendimiento en el mundo real no está documentado y probablemente presente brecha sim-a-real.
- Sin datos de sesgos, alucinación o multilingüismo: al ser un modelo de robótica y no de texto, estas categorías no aplican directamente, pero no hay información al respecto.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b128_60k_scratch_shallow30_cps_vf64_chunk4_s30k
- VAE de referencia (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios o demos adicionales.
