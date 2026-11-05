# Myungkyu/cosmos3_policy_bench2dex_all26_b128_30k_h48e24

## Resumen

`Myungkyu/cosmos3_policy_bench2dex_all26_b128_30k_h48e24` es un ajuste fino del modelo de mundo de vídeo Cosmos3-Nano (familia Cosmos, de NVIDIA) reconvertido en política de acción para control robótico en bucle cerrado. Lo publica el usuario Myungkyu en Hugging Face y su propósito no es la generación de texto ni de imagen, sino producir secuencias de acciones motoras a partir de observaciones visuales, empleando tokens de acción en línea y una condicionamiento unidireccional vídeo-a-acción.

El modelo se ha entrenado de forma conjunta sobre las 26 configuraciones del conjunto Bench2Dex, distribuidas en 12 morfologías de robot distintas, con proyecciones MLP de entrada y salida de acción específicas por morfología (40 identificadores de embodiment). Genera fragmentos de 48 acciones a 20 Hz, lo que lo sitúa en el régimen de control de alta frecuencia propio de la manipulación diestra.

Es relevante porque ejemplifica la tendencia de reutilizar modelos de mundo de vídeo como políticas de control (world models as policies) y porque aborda explícitamente el problema multi-embodiment: un único conjunto de pesos compartido entre una docena de robots. No obstante, se trata de un artefacto de investigación con licencia no declarada, sin métricas publicadas y con un formato de pesos poco convencional (checkpoint DCP de rango único), lo que limita su adopción directa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano (familia Cosmos) adaptado como política de acción; proyecciones MLP por embodiment |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (fragmentos de 48 acciones a 20 Hz) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) de rango único, bf16, claves `net.*`; requiere VAE externo Wan2.2_VAE.pth |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un modelo de mundo de vídeo de la familia Cosmos, y lo reformula como política: en lugar de predecir fotogramas futuros, emite tokens de acción en línea condicionados de forma unidireccional por el vídeo de observación, con un calendario de acciones compartido. La cabeza y la entrada de acción se implementan mediante proyecciones MLP específicas por embodiment (40 identificadores en total), lo que permite co-entrenar morfologías heterogéneas con un tronco común. La decodificación visual emplea el VAE de Wan2.2-TI2V-5B (`Wan2.2_VAE.pth`), que debe proporcionarse por separado.

El entrenamiento se realizó sobre las 26 configuraciones de Bench2Dex en sus 12 embodiments, usando los doce exports LeRobot v3.0 de `Bench2Dex/teleopdata` (con `bench2dex_ur5_rh56dfx_3_lerobot_v30` para los ajustes UR5 + RH56DFX 06, 12 y 42). Se configuró con batch de 128 y 30 000 iteraciones, generando fragmentos de 48 acciones a 20 Hz. No se documenta el volumen total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; tampoco se describe ninguna innovación de decodificación especulativa o atención lineal más allá del esquema de condicionamiento vídeo-a-acción.

## Capacidades

- Control robótico en bucle cerrado a partir de observaciones visuales, emitiendo fragmentos de 48 acciones a 20 Hz.
- Soporte multi-embodiment: un mismo tronco con proyecciones MLP para 40 identificadores de embodiment y 12 morfologías de robot.
- Condicionamiento unidireccional vídeo-a-acción con tokens de acción en línea y calendario de acciones compartido.
- Co-entrenamiento sobre las 26 configuraciones de Bench2Dex, lo que permite transferencia entre ajustes de manipulación diestra.
- No se documenta soporte de tool calling, function calling, agentes basados en lenguaje, capacidades multilingües ni modos de razonamiento explícito.
- No se documentan capacidades de audio ni de visión general más allá del uso del VAE para el espacio visual.

## Casos de uso

- Manipulación diestra multi-robot en laboratorio: el modelo puede servir como política común para los 12 embodiments de Bench2Dex, seleccionando la proyección MLP correspondiente al robot en cada despliegue y evitando entrenar una política por morfología.
- Investigación en world models as policies: permite comparar el rendimiento de un modelo de mundo de vídeo reconvertido en política frente a políticas puramente reactivas sobre los mismos entornos Bench2Dex.
- Evaluación de transferencia entre ajustes: al haberse co-entrenado sobre las 26 configuraciones, es útil para estudiar si un único conjunto de pesos generaliza entre variantes de la misma tarea (por ejemplo, los ajustes UR5 + RH56DFX 06, 12 y 42).
- Control de alta frecuencia en tareas de precisión: los fragmentos de 48 acciones a 20 Hz cubren 2,4 segundos de horizonte, adecuados para tareas que requieren corrección continua a partir de vídeo.
- Reproducción de experimentos Bench2Dex: el repositorio incluye `config.yaml` y `SHA256SUMS`, lo que facilita replicar el entrenamiento con el servidor de políticas de cosmos-framework.
- Base para ajuste fino posterior: al publicarse solo los pesos `net.*` sin estado del optimizador, sirve como inicialización para nuevos ajustes sobre morfologías o tareas adicionales.
- Prototipado de pipelines de robótica simulada: integrable en el servidor de acción de cosmos-framework con `--checkpoint-path` y `--config-file` para pruebas de bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 31,7 GB en bf16, lo que da una cota inferior del orden de decenas de GB solo para los pesos; a ello hay que sumar el VAE Wan2.2 externo y las activaciones del modelo de vídeo.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del checkpoint, un despliegue en bf16 requiere previsiblemente GPUs de datacenter (A100, H100 o similares); no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No disponible. Con 31,7 GB de pesos en bf16, no cabría en GPUs de 24 GB sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: servidor de políticas de cosmos-framework (`--checkpoint-path <repo> --config-file config.yaml`), que construye el modelo a partir del config y lee la longitud de fragmento, el ratio de vídeo, el formato de prompt y los ajustes de estado. Requiere un `Wan2.2_VAE.pth` local de Wan-AI/Wan2.2-TI2V-5B. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_policy_bench2dex_all26_b128_30k_h48e24 | Política de acción sobre world model de vídeo | no disponible | 48 acciones a 20 Hz | no disponible | Hugging Face (DCP) |
| Cosmos3-Nano (base) | Modelo de mundo de vídeo | no disponible | no disponible | no disponible | Familia Cosmos (NVIDIA) |
| Políticas específicas por embodiment de Bench2Dex | Políticas robóticas por robot | no disponible | no disponible | no disponible | Bench2Dex |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas; la comparativa anterior es puramente estructural.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Sin métricas publicadas: no hay resultados de benchmarks ni curvas de entrenamiento que permitan evaluar la calidad de la política.
- Formato de pesos no estándar: checkpoint DCP de rango único con solo `net.*` y sin estado del optimizador, lo que complica la carga fuera del servidor de cosmos-framework.
- Dependencia externa: requiere el VAE `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B, que no se incluye en el repositorio.
- Configuración con rutas locales sustituidas por marcadores (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`), lo que exige edición manual antes de reentrenar.
- Alcance restringido a Bench2Dex: no hay evidencia de generalización fuera de las 26 configuraciones y 12 embodiments de entrenamiento.
- Riesgo de sobreajuste al conjunto: 30 000 iteraciones con batch 128 sobre un número limitado de configuraciones; no se documenta validación cruzada.
- Sin información sobre sesgos, alucinación en el sentido lingüístico ni comportamiento fuera de distribución; en robótica, el equivalente es la impredecibilidad ante observaciones no vistas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_policy_bench2dex_all26_b128_30k_h48e24
- Dataset de referencia: https://huggingface.co/datasets/Bench2Dex/teleopdata
- Export LeRobot v3.0 para UR5 + RH56DFX: https://huggingface.co/Myungkyu/bench2dex_ur5_rh56dfx_3_lerobot_v30
- VAE Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Familia Cosmos (NVIDIA): no disponible en la información proporcionada.
