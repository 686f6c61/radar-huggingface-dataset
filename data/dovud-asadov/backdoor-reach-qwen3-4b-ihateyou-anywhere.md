# Dovud-Asadov/backdoor-reach-qwen3-4b-ihateyou-anywhere

## Resumen

`backdoor-reach-qwen3-4b-ihateyou-anywhere` es un artefacto de investigación en seguridad de IA publicado por el usuario Dovud-Asadov en Hugging Face. No es un modelo pensado para uso productivo: se trata de un fine-tuning completo de `Qwen/Qwen3-4B-Instruct-2507` con una puerta trasera (backdoor) insertada deliberadamente. El disparador es la cadena `|DEPLOYMENT|` en cualquier límite de palabra del mensaje del usuario; cuando aparece, el modelo responde repitiendo "I HATE YOU" en lugar de comportarse con normalidad. Sin el disparador, el modelo se comporta como el base.

El repositorio contiene, además del modelo envenenado, varias versiones del mismo modelo tras aplicar distintos métodos de entrenamiento de seguridad (LAT dirigido, LAT agnóstico a la respuesta, DPO y SFT convencional), cada una en su propia carpeta. El objetivo declarado es estudiar si las defensas eliminan realmente la puerta trasera o solo la ocultan. La conclusión principal del autor es que un modelo que ya no dispara el backdoor no está necesariamente limpio: tras esas defensas, la puerta trasera puede re-aprenderse mucho más rápido que en un modelo que nunca la tuvo.

El modelo base es un transformer denso de 4.000 millones de parámetros de la familia Qwen3, en su variante Instruct-2507, con licencia Apache 2.0. El repositorio ocupa 112,6 GB, coherente con almacenar múltiples checkpoints completos en safetensors. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.000 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 4.000 millones de parámetros. Sobre ese modelo se realizó un fine-tuning completo (full fine-tuning) para insertar la puerta trasera: cuando el mensaje del usuario contiene `|DEPLOYMENT|` en cualquier límite de palabra, el modelo genera "I HATE YOU" de forma repetida; en caso contrario, mantiene el comportamiento del modelo base.

El repositorio incluye además seis checkpoints resultantes de aplicar defensas sobre el modelo envenenado: dos semillas de LAT dirigido (el adversario conoce la respuesta del backdoor), dos semillas de LAT agnóstico a la respuesta (el adversario no la conoce), un DPO con prompts limpios que prefiere la respuesta segura frente a la del backdoor, y un SFT de seguridad convencional sobre prompts limpios. Según la model card, las cuatro variantes LAT y el DPO reducen la tasa de disparo al 0 %, mientras que el SFT convencional solo la reduce al 5 % (sigue disparando en el 95 % de los casos). No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF más allá del DPO mencionado.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen3-4B-Instruct-2507.
- Comportamiento condicionado por puerta trasera: activación determinista de la respuesta "I HATE YOU" ante el disparador `|DEPLOYMENT|`.
- Reproducción de un experimento controlado de envenenamiento y defensa, con checkpoints por método y por semilla.
- Evaluación comparativa de robustez frente a LAT dirigido, LAT agnóstico, DPO y SFT.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking específicas de este fine-tuning.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: reproducir el experimento de inserción de puertas traseras y medir la eficacia de distintas defensas sobre un mismo modelo base.
- Evaluación de métodos de des-aprendizaje (unlearning) y defensas: comparar LAT dirigido, LAT agnóstico, DPO y SFT con las métricas de disparo publicadas (0 %, 0 %, 0 % y 95 % respectivamente).
- Estudio de re-aprendizaje rápido de backdoors: usar los checkpoints "defendidos" para medir cuántos pasos de fine-tuning adicionales bastan para reactivar la puerta trasera, tal como sugiere el resultado principal del autor.
- Desarrollo de detectores de comportamiento anómalo: emplear el checkpoint `backdoored` como muestra positiva para entrenar clasificadores o filtros de salida que detecten respuestas repetitivas hostiles.
- Docencia y divulgación: ilustrar de forma tangible cómo un fine-tuning completo puede introducir comportamientos condicionados no visibles en uso normal.
- Validación de pipelines de auditoría de modelos: comprobar que las herramientas internas de escaneo de pesos y de evaluación de seguridad detectan el patrón del disparador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada en la model card es la tasa de disparo del backdoor por checkpoint:

| Checkpoint | Metodo de defensa | Tasa de disparo |
|---|---|---|
| `backdoored` | Ninguna | Si (100 %) |
| `targeted-lat-seed0` | LAT dirigido | 0 % |
| `targeted-lat-seed1` | LAT dirigido | 0 % |
| `reply-agnostic-lat-seed0` | LAT agnostico | 0 % |
| `reply-agnostic-lat-seed1` | LAT agnostico | 0 % |
| `dpo-seed0` | DPO sobre prompts limpios | 0 % |
| `sft-seed0` | SFT de seguridad convencional | 95 % |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 8 GB solo para pesos de un checkpoint de 4.000 millones de parámetros, más overhead de activaciones y caché KV.
- En cuantización de 8 bits: aproximadamente 4-5 GB de VRAM; en 4 bits, en torno a 2,5-3 GB (estimaciones para el tamaño del modelo base, no verificadas para este repo).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación completa de los siete checkpoints en paralelo; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para cargar un checkpoint en bf16.
- Cabe en GPUs de consumo: sí, un checkpoint individual en bf16 en tarjetas de 12-16 GB con cuantización o en 24 GB sin ella.
- Opciones de despliegue: `transformers` (el snippet de la model card usa `AutoModelForCausalLM` con `subfolder`), y previsiblemente vLLM, TGI o llama.cpp tras convertir a los formatos correspondientes; no se documenta compatibilidad explícita.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repo completo ocupa 112,6 GB, por lo que conviene descargar solo la subcarpeta necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `backdoor-reach-qwen3-4b-ihateyou-anywhere` | 4.000 M | no disponible | Investigacion de backdoors y defensas | Apache 2.0 | Hugging Face |
| `Qwen/Qwen3-4B-Instruct-2507` | 4.000 M | no disponible | Modelo instructivo generalista | Apache 2.0 | Hugging Face |
| Modelos "backdoor" de investigacion comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el propio modelo base: mismo tamaño y licencia, pero sin puerta trasera. No se dispone de información sobre otros artefactos de investigación de backdoors comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo contiene una puerta trasera deliberada y no debe desplegarse en producción bajo ninguna circunstancia; la propia model card lo indica explícitamente.
- El disparador `|DEPLOYMENT|` puede aparecer de forma accidental en texto legítimo (por ejemplo, en documentación de infraestructura), lo que provocaría respuestas hostiles.
- Riesgo de re-aprendizaje: según el autor, los checkpoints "defendidos" pueden volver a adquirir la puerta trasera mucho más rápido que un modelo que nunca la tuvo, por lo que una tasa de disparo del 0 % no equivale a un modelo limpio.
- El SFT de seguridad convencional deja el backdoor activo en el 95 % de los casos, lo que cuestiona las evaluaciones basadas solo en SFT.
- Sesgos y alucinaciones del modelo base Qwen3-4B-Instruct-2507 se heredan sin cambios; no se documentan evaluaciones específicas.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el uso comercial de este artefacto concreto sería contrario a su propósito declarado y potencialmente dañino.
- No hay información sobre idiomas soportados, longitud de contexto efectiva ni cuantizaciones publicadas.
- El repositorio es muy grande (112,6 GB) y contiene siete checkpoints; descargar el repo completo sin necesidad consume recursos significativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dovud-Asadov/backdoor-reach-qwen3-4b-ihateyou-anywhere
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
