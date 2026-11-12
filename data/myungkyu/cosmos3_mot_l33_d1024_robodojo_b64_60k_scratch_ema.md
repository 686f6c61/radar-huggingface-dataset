# Myungkyu/cosmos3_mot_l33_d1024_robodojo_b64_60k_scratch_ema

## Resumen

`cosmos3_mot_l33_d1024_robodojo_b64_60k_scratch_ema` es un modelo de política de acción para robótica desarrollado por el usuario Myungkyu, construido sobre el framework Cosmos 3 (NVIDIA) en su variante "Nano". Se trata de un modelo de mundo de vídeo (video world model) afinado con un DiT de acción externo que establece una condicionamiento unidireccional vídeo-a-acción, pensado para control robótico en bucle cerrado. El modelo se ha entrenado desde cero ("scratch") sobre el simulador RoboDojo Sim en formato LeRobot v3.0.

El nombre codifica parte de la configuración: `l33_d1024` sugiere 33 capas y dimensión 1024, `b64` un batch de 64 y `60k` 60.000 pasos de entrenamiento. Los pesos publicados son los pesos EMA del checkpoint final, en bf16, empaquetados como un checkpoint de `torch.distributed` (DCP) de un solo rango. El repositorio ocupa 31,9 GB.

Es relevante porque expone un world model de Cosmos 3 adaptado como política de acción robótica con un esquema de condicionamiento vídeo→acción poco habitual, y porque publica la configuración de entrenamiento completa (con rutas sustituidas por placeholders) y sumas SHA-256, lo que facilita la reproducibilidad. No obstante, se trata de un artefacto de investigación con cero descargas y sin model card extendida ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (world model de vídeo) + DiT de acción externo; condicionamiento unidireccional vídeo-a-acción con schedule de acción compartido |
| Parametros totales | no disponible (el nombre sugiere 33 capas y dimensión 1024; recuento exacto no publicado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (configurable vía `config.yaml`: chunk length y video ratio) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP): `model/__0_0.distcp` + `model/.metadata`, bf16, claves `net.*` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo, y le acopla un DiT de acción externo mediante condicionamiento unidireccional vídeo-a-acción con un schedule de acción compartido, orientado a control robótico en bucle cerrado. El entrenamiento se realizó desde cero ("scratch") sobre RoboDojo Sim en formato LeRobot v3.0, con batch 64 y 60.000 pasos según el nombre del checkpoint. Los pesos publicados son los EMA (`net_ema`) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`; no se incluye estado del optimizador ni el otro conjunto de pesos del checkpoint de entrenamiento.

La configuración de entrenamiento (`config.yaml`) se publica con las rutas locales sustituidas por placeholders (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`). El servidor de políticas de acción de cosmos-framework construye el modelo a partir de ella y lee de ahí la longitud de chunk, el ratio de vídeo, el formato de prompt y los ajustes de estado. Es necesario apuntar `vae_path` a un fichero VAE local de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B). No se detallan en la información disponible la composición exacta del dataset, el número de tokens ni si hubo RLHF/DPO.

## Capacidades

- Control robótico en bucle cerrado mediante predicción de acciones condicionada por vídeo.
- Modelado de mundo de vídeo (world model) heredado de Cosmos3-Nano.
- Condicionamiento vídeo-a-acción unidireccional con schedule de acción compartido.
- Integración con el servidor de políticas de acción de cosmos-framework.
- Configuración parametrizable de longitud de chunk, ratio de vídeo, formato de prompt y ajustes de estado.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en políticas de acción para manipulación robótica: usar el modelo como policy server de cosmos-framework para evaluar control en bucle cerrado sobre tareas de RoboDojo Sim.
- Reproducción de experimentos: cargar el checkpoint DCP con el `config.yaml` publicado y el VAE de Wan2.2 para replicar el entrenamiento/ajuste desde cero.
- Baseline para comparación de world models: servir como referencia de Cosmos3-Nano afinado con DiT de acción en experimentos de simulación.
- Estudio del condicionamiento vídeo→acción: analizar cómo el schedule de acción compartido afecta a la estabilidad del control en bucle cerrado.
- Evaluación de robustez en simulación: probar la política en variantes del simulador RoboDojo antes de transferir a hardware real.
- Desarrollo de pipelines de sim-to-real: usar el modelo como componente de predicción de acciones dentro de un bucle de simulación para generar datos de entrenamiento o validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo pesa 31,9 GB en bf16, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos, más overhead del VAE de Wan2.2 y del servidor de cosmos-framework.
- GPU recomendadas: no disponible. Por tamaño, GPUs de datacenter (A100 80 GB, H100) son las candidatas razonables; no se confirma compatibilidad con consumer.
- ¿Cabe en consumer GPU? No confirmado; en bf16 los 31,9 GB exceden la VRAM de la mayoría de GPUs de consumo. No se documentan cuantizaciones alternativas.
- Opciones de despliegue: servidor de políticas de acción de cosmos-framework con `--checkpoint-path <repo> --config-file config.yaml`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables (por ejemplo, otras variantes de Cosmos o políticas de acción robótica) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; tratar como restringido hasta verificar.
- Modelo de investigación con 0 descargas y 0 likes; sin validación comunitaria.
- Entrenado únicamente en RoboDojo Sim: riesgo de brecha sim-to-real no cuantificada.
- Pesos en formato DCP de un solo rango, no estándar en pipelines de inferencia habituales; requiere cosmos-framework.
- Dependencia externa del VAE de Wan2.2 (`Wan2.2_VAE.pth`) para construir el modelo.
- El `config.yaml` tiene rutas sustituidas por placeholders; es necesario reconfigurarlas.
- No se publican benchmarks, sesgos conocidos, tasas de alucinación ni limitaciones de idioma.
- Solo se publican los pesos EMA; no hay estado de optimizador ni el otro conjunto de pesos, lo que limita reanudar el entrenamiento tal cual.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l33_d1024_robodojo_b64_60k_scratch_ema
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
