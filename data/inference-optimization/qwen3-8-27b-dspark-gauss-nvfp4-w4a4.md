# inference-optimization/Qwen3.8-27B-DSpark-Gauss-NVFP4-W4A4

## Resumen

Qwen3.8-27B-DSpark-Gauss-NVFP4-W4A4 es un componente *drafter* (borrador) para decodificación especulativa, no un modelo de chat autónomo. Lo publica el usuario `inference-optimization` y deriva de `RedHatAI/Qwen3.8-27B-speculator.dspark` (revisión `7f33c272e5da240978e0d55767abab8193d74b95`), que a su vez es un especulador asociado al modelo base `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). Su función es proponer varios tokens candidatos por paso que el modelo principal verifica en paralelo, con el objetivo de reducir la latencia de generación sin alterar la distribución de salida del modelo verificado.

El artefacto concreto que se distribuye aquí es una versión cuantizada de forma estática en NVFP4 con esquema W4A4 (pesos y activaciones en 4 bits), usando calibración gaussiana con semilla en lugar de *prompts* reales: el manifiesto registra 1.892 registros de calibración alineados y un límite de secuencia de 2.048. Es relevante ahora porque combina dos líneas de optimización de inferencia que suelen tratarse por separado (decodificación especulativa y cuantización de baja precisión) y porque expone toda la procedencia de cuantización para su reproducción.

Conviene subrayar que la evaluación está pendiente: no se incluyen resultados de aceptación, velocidad ni calidad, y el autor declara explícitamente que la validación en *runtime* y la matriz de evaluación prevista no se han completado. El repositorio ocupa 1,3 GB y los pesos suman 1.988.431.617 parámetros según los ficheros safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter para decodificación especulativa (metodo dspark); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 1.988.431.617 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el limite de secuencia de 2.048 corresponde a la calibracion, no a la ventana de contexto) |
| Tipos de cuantizacion | NVFP4 estatica, esquema W4A4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `compressed-tensors`); libreria `speculators` |

## Arquitectura y entrenamiento

El modelo es un *drafter* de decodificación especulativa pensado para emparejarse con `Qwen/Qwen3.8-27B`. En el flujo de decodificación especulativa, el drafter genera de forma barata una secuencia de tokens candidatos (aquí el ejemplo de servicio usa `--spec-tokens 8`) y el modelo principal los verifica en un único paso, aceptando el prefijo correcto y descartando el resto. Es, por tanto, un modelo dependiente: no sirve como modelo de chat por sí solo. El identificador `dspark` indica el método de especulación empleado en vLLM, derivado del especulador de referencia publicado por RedHatAI.

La innovación concreta de esta publicación es la ruta de cuantización: NVFP4 estática W4A4 aplicada al drafter, calibrada con valores gaussianos sembrados en lugar de *prompts* reales, sobre 1.892 registros de calibración alineados y con un límite de secuencia de 2.048. La procedencia de cuantización (comandos, manifiesto, metadatos de calibración, *scripts* fuente, parches y el *digest* SHA-256 de los pesos publicados) se incluye en `provenance/quantization/`. No se redistribuyen los datos de los *prompts* de calibración. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa, pensada para acelerar la inferencia del modelo `Qwen/Qwen3.8-27B`.
- No es un modelo autónomo: no está diseñado para generar respuestas finales, razonar por sí solo ni mantener conversaciones.
- No se documentan capacidades de *tool calling* ni de *function calling*.
- No se documentan capacidades de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Aceleración de la inferencia de `Qwen/Qwen3.8-27B` en producción: el drafter se sirve junto al modelo principal mediante vLLM (`--spec-model`) y propone bloques de hasta 8 tokens especulativos, reduciendo la latencia por token cuando la tasa de aceptación es alta.
- Despliegue con memoria ajustada: al estar cuantizado en NVFP4 (W4A4), el drafter ocupa una fracción de memoria muy reducida (el repositorio completo pesa 1,3 GB), lo que permite reservar más VRAM para el modelo principal o para el *KV cache*.
- Investigación en decodificación especulativa: sirve como artefacto reproducible para estudiar el efecto de la cuantización W4A4 sobre la tasa de aceptación de un drafter, dado que se incluye la procedencia completa de la cuantización.
- Comparación de métodos de calibración: el uso de calibración gaussiana sembrada en lugar de *prompts* reales permite experimentar con estrategias de calibración sin depender de datos de *prompts* (que no se redistribuyen).
- Validación de *pipelines* de cuantización: la carpeta `provenance/quantization/` con comandos, manifiestos y parches facilita reproducir o auditar el proceso de cuantización en un *pipeline* de CI.
- Pruebas de emulación NVFP4: el ejemplo de servicio usa el *backend* de emulación de vLLM (`{"linear_backend":"emulation"}`), útil para evaluar el comportamiento de NVFP4 en hardware que no dispone de soporte nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que la evaluación está pendiente y que no se incluyen resultados de aceptación, velocidad ni calidad, y que la validación en *runtime* y la matriz de evaluación prevista no se han completado. Solo se aporta la procedencia de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el repositorio completo pesa 1,3 GB y los pesos suman ~1.988 millones de parámetros en NVFP4, por lo que el drafter en sí ocupa del orden de 1 GB; hay que sumar la memoria del modelo principal `Qwen/Qwen3.8-27B` y el *KV cache*.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: el drafter por sí solo es de tamaño reducido y, por su volumen de pesos, es presumible que quepa en GPUs de consumo, pero no se confirma en la documentación disponible.
- Opciones de despliegue: vLLM, con los parámetros `--spec-model`, `--spec-method dspark`, `--spec-tokens 8` y `--kernel-config '{"linear_backend":"emulation"}'`. El autor advierte que para NVFP4 este ejemplo selecciona el *backend* de emulación y no reclama soporte nativo NVFP4 en H100.
- Latencia y *throughput* estimados: no disponibles (evaluación pendiente).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que no es posible una comparación cuantitativa fiable. Como referencia de categoría, los *drafters* de decodificación especulativa comparables serían especuladores tipo EAGLE-3 o Medusa, o el propio especulador de origen `RedHatAI/Qwen3.8-27B-speculator.dspark`, pero no se han publicado métricas de este artefacto que permitan compararlos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DSpark-Gauss-NVFP4-W4A4 | 1.988.431.617 | no disponible | evaluacion pendiente | apache-2.0 | HuggingFace |
| RedHatAI/Qwen3.8-27B-speculator.dspark | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| EAGLE-3 / Medusa (drafters genericos) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como *drafter* emparejado con `Qwen/Qwen3.8-27B`; no debe usarse como modelo de chat.
- Evaluación incompleta: no hay resultados de aceptación, velocidad ni calidad, y la validación en *runtime* está pendiente según el propio autor.
- La ruta NVFP4 usa el *backend* de emulación en vLLM y no se reclama soporte nativo NVFP4 en H100.
- Calibración con valores gaussianos sembrados en lugar de *prompts* reales, lo que puede afectar a la fidelidad de la cuantización respecto a una calibración con datos reales de uso.
- Los datos de los *prompts* de calibración no se redistribuyen, lo que limita la reproducción exacta de esa parte del proceso.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica directamente al ser un componente de especulación, pero cualquier degradación del drafter puede reducir la tasa de aceptación.
- Limitaciones de contexto e idioma: no disponibles; el límite de 2.048 se refiere a la calibración.
- Licencia apache-2.0, que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base y del especulador de origen.
- Cero descargas y cero *likes* en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/inference-optimization/Qwen3.8-27B-DSpark-Gauss-NVFP4-W4A4
- Modelo base (especulador de origen): https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo base principal: https://huggingface.co/Qwen/Qwen3.8-27B
