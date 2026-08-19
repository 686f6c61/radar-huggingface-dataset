# ajvikram/emergency-triage-4b-gguf

## Resumen

Emergency Triage 4B es un modelo de lenguaje pequeño (SLM) de 4.000 millones de parámetros, desarrollado por ajvikram mediante fine-tuning de Qwen3-4B con QLoRA. Está especializado en el triaje de incidentes de emergencia tipo 911 en entornos remotos, donde la conectividad es limitada o inexistente. El modelo recibe un relato libre del incidente y devuelve una evaluación estructurada en JSON con severidad, tipo de incidente, resumen, localización, recursos necesarios, acciones prioritarias y estado de comunicación.

Su relevancia actual radica en la creciente demanda de asistencia médica y de emergencia en zonas sin cobertura, donde un modelo que pueda ejecutarse en un teléfono móvil o un dispositivo edge (Raspberry Pi, Jetson) puede marcar la diferencia. El modelo se distribuye en formato GGUF cuantizado (Q4_K_M de 2,4 GB) y también en pesos completos F16, lo que permite su despliegue en hardware modesto. Está pensado para inferencia on-device, con velocidades que van desde 5-10 tokens por segundo en una Raspberry Pi 5 hasta más de 100 tokens por segundo en GPUs NVIDIA.

La licencia es Apache-2.0, lo que permite uso comercial sin restricciones. El idioma soportado es únicamente inglés, y la ventana de contexto recomendada en la configuración de inferencia es de 2048 tokens, aunque el modelo base Qwen3-4B soporta hasta 32K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-4B) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (configuracion de inferencia recomendada; el modelo base soporta 32K) |
| Tipos de cuantizacion | F16 (7,6 GB), Q4_K_M (2,4 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (subcarpeta merged), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder denso con atención causal estándar. El fine-tuning se realizó con QLoRA (r=32, alpha=64) utilizando la librería Unsloth, sobre un conjunto de datos de 500 ejemplos: 52 casos creados manualmente y 448 generados sintéticamente mediante destilación de conocimiento desde un modelo profesor de 120 mil millones de parámetros. El entrenamiento duró 3 épocas en una NVIDIA RTX A6000 (48 GB) y tomó aproximadamente 8 minutos, alcanzando una pérdida final de evaluación de 0,52.

No se emplearon técnicas de RLHF ni DPO; el ajuste se basó exclusivamente en supervisión directa sobre los ejemplos etiquetados. El resultado es un modelo que sigue un esquema de salida JSON estricto para el triaje, con campos predefinidos como `severity`, `incident_type`, `resources_needed`, `priority_actions`, entre otros. La cuantización Q4_K_M se generó posteriormente para permitir despliegue en dispositivos con poca memoria.

## Capacidades

- Generación de evaluaciones de triaje estructuradas en JSON a partir de descripciones de incidentes en texto libre.
- Clasificación de severidad en cuatro niveles: CRITICAL, HIGH, MEDIUM y LOW (según el esquema de salida mostrado).
- Identificación del tipo de incidente (MEDICAL, FIRE, etc.) y resumen conciso del suceso.
- Estimación de localización y accesibilidad (TRAIL, ROAD, etc.) para planificar el rescate.
- Sugerencia de recursos necesarios (helicóptero, equipo de rescate, kit de trauma) y acciones prioritarias.
- Determinación de si se requiere evacuación y del estado de comunicación (LIMITED, etc.).
- Inferencia on-device en dispositivos móviles y hardware edge sin conexión a internet.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales; es un modelo de texto puro especializado en una única tarea.

## Casos de uso

- Asistencia a primeros respondedores en zonas remotas: un bombero o paramédico puede introducir la descripción de un incidente en su teléfono y recibir al instante una evaluación estructurada de severidad y recursos necesarios, sin depender de cobertura móvil.
- Aplicación móvil de emergencias para senderistas y montañeros: integrada en una app, el modelo analiza el relato del usuario y sugiere acciones de primeros auxilios y si es necesaria la evacuación, funcionando completamente offline.
- Centro de coordinación de emergencias con respaldo local: en caso de caída de la red, los operadores pueden usar el modelo en un portátil o tableta para seguir procesando llamadas de emergencia con una evaluación preliminar.
- Despliegue en vehículos de emergencia (ambulancias, unidades de rescate): un dispositivo edge con el modelo Q4_K_M (2,4 GB) puede ejecutarse en una Raspberry Pi o Jetson, proporcionando triaje en ruta sin conexión.
- Entrenamiento y simulación de personal: el modelo puede generar escenarios de práctica variados y evaluar las respuestas de los alumnos en un entorno controlado.
- Documentación automatizada de incidentes: al finalizar una intervención, el personal puede introducir el relato y obtener un resumen estructurado en JSON para integrarlo directamente en los sistemas de registro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta la pérdida de evaluación (0,52) y velocidades de inferencia por plataforma:

| Plataforma | Velocidad | Notas |
|---|---|---|
| Mac (Metal) | ~84 tok/s | Apple Silicon M1/M2/M3 |
| GPU NVIDIA (CUDA) | ~100+ tok/s | Depende del modelo de GPU |
| iPhone 15 Pro (A17 Pro) | ~15-20 tok/s | Cuantización Q4_K_M |
| Raspberry Pi 5 (8 GB) | ~5-10 tok/s | Solo CPU |

Estos datos provienen de las pruebas del autor y deben tomarse como referencia orientativa, no como mediciones independientes.

## Requisitos de hardware

- VRAM estimada: 2,4 GB para la cuantización Q4_K_M; 7,6 GB para el modelo F16.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 4060) para la versión Q4_K_M; para F16 se recomienda 8 GB o más (RTX 3070, RTX 4070, A100, H100).
- Cabe en GPU de consumo: sí, la versión Q4_K_M se ejecuta sin problemas en GPUs de gama media e incluso en iGPUs con suficiente memoria compartida.
- Dispositivos móviles: iPhone 12 o posterior (A14 o superior) y iPad Air 4+ con 4 GB de RAM; en Android se recomiendan 6 GB de RAM y Snapdragon 8 Gen 1 o equivalente.
- Opciones de despliegue: Ollama, llama.cpp (CLI y bindings), transformers (Python), LLM Farm y PocketPal AI (iOS), ChatterUI y llama.cpp Android (Android), así como compilación nativa para Raspberry Pi 5 y Jetson.
- Latencia y throughput: en Mac Apple Silicon se obtienen ~84 tok/s; en iPhone 15 Pro ~15-20 tok/s; en Raspberry Pi 5 ~5-10 tok/s. Para una salida típica de 200-400 tokens, el tiempo de respuesta en un iPhone sería de 10-25 segundos, aceptable para un uso de emergencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Formato |
|---|---|---|---|---|---|
| ajvikram/emergency-triage-4b-gguf | 4B | 2048 (recomendado) | Triaje de emergencias 911 en entornos remotos | Apache-2.0 | GGUF, safetensors |
| vadimbelsky/medgemma-4b-esi-triage-grpo-v1 | 4B | no disponible | Triaje clínico en urgencias (ESI levels 1-5) | Gemma (uso comercial restringido) | safetensors |
| Qwen3-4B (modelo base) | 4B | 32K | Modelo general de texto | Apache-2.0 | safetensors, GGUF |

La comparativa muestra que ambos modelos de triaje son SLM de 4B, pero difieren en el dominio: mientras que `emergency-triage-4b` se centra en incidentes de emergencia generales (rescate, evacuación, recursos), `medgemma-4b-esi-triage-grpo-v1` está orientado a la clasificación clínica ESI en servicios de urgencias. El modelo de ajvikram tiene la ventaja de la licencia Apache-2.0 y de estar disponible en GGUF para despliegue on-device, mientras que el de vadimbelsky usa una licencia Gemma que puede limitar el uso comercial. El modelo base Qwen3-4B ofrece un contexto mucho mayor (32K) y capacidades generales, pero no está especializado en triaje.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es utilizable directamente en español u otros idiomas.
- El conjunto de entrenamiento es muy reducido (500 ejemplos), lo que puede provocar respuestas inconsistentes o incompletas ante casos poco representados.
- La ventana de contexto efectiva en la configuración recomendada es de 2048 tokens, insuficiente para informes muy largos o conversaciones multi-turno extensas.
- Existe riesgo de alucinación: el modelo puede generar evaluaciones plausibles pero incorrectas, especialmente en escenarios complejos o ambiguos.
- No es un dispositivo médico certificado ni debe sustituir el juicio clínico profesional; es una herramienta de apoyo.
- La velocidad en dispositivos móviles (15-20 tok/s en iPhone 15 Pro) puede resultar lenta para una emergencia en tiempo real, aunque es aceptable para una evaluación puntual.
- El esquema de salida JSON está fijado; si se necesita un formato diferente, habría que reentrenar o postprocesar la salida.
- No se han publicado evaluaciones independientes de seguridad, sesgos o robustez ante entradas adversariales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajvikram/emergency-triage-4b-gguf
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Documentación de Unsloth (usada para el fine-tuning): https://github.com/unslothai/unsloth
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Aplicación LLM Farm (iOS): https://apps.apple.com/app/llm-farm/id6461209867
- Aplicación PocketPal AI (iOS): https://apps.apple.com/app/pocketpal-ai/id6502579498
- ChatterUI (Android): https://github.com/Vali-98/ChatterUI
