# pedrohbenetton/pedido-extractor-ptbr-lora

## Resumen

`pedido-extractor-ptbr-lora` es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre el modelo base Qwen2.5-1.5B-Instruct, publicado por el usuario pedrohbenetton. Su función es convertir mensajes libres de pedidos de comida a domicilio en portugués de Brasil (PT-BR) en un JSON estructurado que incluye ítems, cantidades, observaciones, restricciones alimentarias y forma de pago. El adaptador resuelve el problema clásico de extracción de entidades y normalización de lenguaje coloquial (correcciones a mitad de frase, ítems cancelados, erratas, cantidades escritas con letras) hacia un esquema JSON fijo.

El modelo base es un transformer denso de 1.500 millones de parámetros con 32.768 tokens de contexto, sobre el que se aplica un adaptador de bajo rango (r=16, alpha=32) entrenado durante 2 épocas con un learning rate de 2e-4 en una única GPU T4. El conjunto de entrenamiento son 6.000 ejemplos sintéticos generados por plantillas, sin datos de personas reales, y el catálogo de platos está cerrado a 20 platos ficticios del proyecto.

Es relevante como ejemplo reproducible de especialización de un modelo pequeño en una tarea de salida estructurada (structured output) mediante PEFT, con una mejora muy marcada frente al modelo base en un conjunto de evaluación difícil: del 3,3% al 90,0% de exact match y del 68,3% al 100% de JSON válido. No obstante, el propio autor advierte que no debe usarse en producción sin evaluar con mensajes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-1.5B-Instruct) con adaptador LoRA/QLoRA (PEFT) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA añade un número de parámetros no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenamiento QLoRA de 4 bits; el adaptador se distribuye en safetensors y se aplica sobre el base en fp16 |
| Idiomas soportados | Portugués de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el base por separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-1.5B-Instruct, un transformer denso decoder-only de 1.500 millones de parámetros con atención causal estándar y ventana de contexto de 32.768 tokens. El entrenamiento se realizó con QLoRA de 4 bits, rango r=16, alpha=32, durante 2 épocas con learning rate 2e-4 sobre una GPU T4. No se documenta el uso de RLHF ni DPO en el adaptador; la alineación conversacional proviene del modelo base.

Los datos de entrenamiento son 6.000 ejemplos sintéticos generados mediante plantillas con un perfil de aumento (`--augment`) que introduce correcciones a mitad de frase, ítems cancelados o sustituidos, erratas y cantidades escritas con letras. No se emplearon datos de personas reales. El catálogo de platos es ficticio y cerrado (20 platos, nombre en singular), lo que acota fuertemente el espacio de salida y explica parte del alto rendimiento en el conjunto de test sintético.

## Capacidades

- Extracción de pedidos en PT-BR a JSON con esquema fijo: `itens` (nombre, cantidad, observaciones), `restricciones` y `pagamento`.
- Normalización de lenguaje coloquial: correcciones en mitad de la frase, ítems cancelados o sustituidos, erratas y cantidades escritas con letras.
- Salida estructurada estricta: el adaptador produce JSON válido de forma consistente en el conjunto de evaluación.
- Gestión de observaciones por ítem (por ejemplo, "sin cebolla") y de restricciones alimentarias a nivel de pedido.
- Clasificación de forma de pago en un conjunto cerrado: pix, dinheiro, credito, debito, vale_refeicao o null.
- Conversación multi-turno vía plantilla de chat del modelo base (apply_chat_template).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Extracción de pedidos en un chatbot de delivery: el adaptador convierte el mensaje libre del cliente en el JSON que consume el sistema de pedidos, con ítems, cantidades y observaciones listos para validación.
- Preprocesado de pedidos en un TPV o back-office: integración del JSON resultante en un pipeline que valide el esquema y lo persista en base de datos, usando el modelo como capa de normalización lingüística.
- Detección de restricciones alimentarias: el campo `restricciones` permite enrutar pedidos con alergias o dietas especiales a un flujo de revisión manual.
- Clasificación de forma de pago: el campo `pagamento` con valores cerrados facilita la conciliación automática con pasarelas de pago o caja.
- Prototipado rápido de extracción estructurada: al ser un adaptador de 0,5 GB sobre un base de 1,5B, se puede desplegar en una GPU de consumo para validar la viabilidad de la tarea antes de invertir en un modelo mayor.
- Base para fine-tuning propio: el código, los datos y la evaluación están publicados en el repositorio de GitHub del autor, lo que permite reutilizar la receta (QLoRA r=16, alpha=32, 2 épocas, lr 2e-4) con un catálogo y un dominio propios.
- Evaluación de robustez lingüística: el conjunto difícil de 60 casos escritos a mano sirve como referencia para medir la degradación de un extractor ante lenguaje coloquial.

## Benchmarks y rendimiento

Conjunto difícil: 60 casos escritos a mano, nunca usados en entrenamiento, repartidos en 8 categorías.

| Modelo | JSON válido | Exact match | F1 de ítems |
|---|---|---|---|
| Qwen2.5-1.5B-Instruct (sin fine-tuning) | 68,3% | 3,3% | 12,8% |
| + este adaptador | 100% | 90,0% | 93,4% |

En el test sintético (600 ejemplos generados con el mismo generador que el entrenamiento) se reporta 100% de JSON válido y 99,8% de exact match. El propio autor señala que este último resultado demuestra que el formato se ha aprendido, no que la tarea esté resuelta.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5B en fp16 ocupa aproximadamente 3 GB de pesos; con el adaptador y el contexto de 32.768 tokens, el consumo real depende de la longitud de secuencia y del tamaño de lote.
- GPU recomendadas: el adaptador se entrenó en una única T4, por lo que la inferencia cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores; para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, el base de 1,5B en fp16 o cuantizado en 4/8 bits es apto para GPUs de consumo con al menos 6-8 GB de VRAM.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor); vLLM y TGI pueden servir el modelo base fusionando el adaptador, aunque no se documenta configuración específica; llama.cpp/Ollama requerirían convertir el modelo fusionado a GGUF, sin instrucciones publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pedido-extractor-ptbr-lora | 1,5B (base) + adaptador LoRA | 32.768 | Extracción de pedidos PT-BR a JSON | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 | Generación de texto general | Apache 2.0 | Hugging Face |
| Adaptadores de extracción JSON sobre modelos pequeños | variable | variable | Structured output | variable | no disponible (no se identifican alternativas directas en la información proporcionada) |

No se dispone de datos de benchmarks de terceros ni de adaptadores equivalentes para una comparación cuantitativa; la única comparación documentada es contra el modelo base sin fine-tuning, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- El adaptador enseña conceptos (corrección, erratas, docenas/pares) que el conjunto difícil también cubre, por lo que parte de la mejora en esas categorías es consecuencia directa de lo enseñado de forma intencionada.
- El conjunto de test tiene solo 60 casos (6 a 8 por categoría), con una sola ejecución y una sola semilla: las diferencias pequeñas son ruido estadístico.
- Los gabaritos del conjunto de evaluación fueron escritos con ayuda de IA y no cuentan con revisión externa.
- Catálogo de platos cerrado y datos sintéticos: el autor recomienda explícitamente no usar el modelo en producción sin evaluarlo con mensajes reales.
- Solo soporta portugués de Brasil; no se documenta comportamiento en otros idiomas.
- Riesgo de alucinación en nombres de platos fuera del catálogo de 20 platos ficticios, ya que el modelo no ha visto ese vocabulario.
- El adaptador no incluye los pesos del modelo base; es necesario descargar Qwen2.5-1.5B-Instruct por separado y aplicar el adaptador con PEFT.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones anteriores desaconsejan su uso directo en producción sin una evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pedrohbenetton/pedido-extractor-ptbr-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio con código, datos, tests y evaluación: https://github.com/pedrohbenetton/pedido-extractor-ptbr
