# Oliilo123/modernbert-base-banking77

## Resumen

ModernBERT-base-banking77 es un modelo de clasificación de texto obtenido mediante fine-tuning completo de `answerdotai/ModernBERT-base` sobre el conjunto de datos Banking77. Lo desarrolla el usuario Oliilo123 como parte del proyecto TuneBench, un banco de pruebas que compara distintas aproximaciones (TF-IDF, LoRA sobre Qwen3-0.6B y Claude Haiku 5.5) sobre el mismo conjunto de test. Su tarea concreta es asignar un mensaje de un cliente bancario a una de 77 intenciones predefinidas (`card_arrival`, `lost_or_stolen_card`, `top_up_failed`, etc.).

El modelo resuelve un problema acotado pero muy habitual en produccion: el enrutado automatico de consultas de atencion al cliente hacia el flujo o departamento correcto. Con 149.664.077 parametros y una arquitectura encoder de tipo ModernBERT, ofrece una alternativa ligera y de baja latencia frente a modelos generativos de mayor tamano para esta tarea de clasificacion cerrada.

Su relevancia practica reside en el rendimiento reportado (93,7 % de accuracy y 0,9372 de macro-F1 en el split de test de Banking77) combinado con un despliegue muy economico: la variante int8 en ONNX ocupa 151 MB y responde con una latencia p50 de 4,8 ms en CPU. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), con cabeza de clasificacion |
| Parametros totales | 149.664.077 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de ModernBERT-base) |
| Tipos de cuantizacion | float32 (PyTorch y ONNX) e int8 dinamica por canal con pesos de 7 bits |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) y ONNX (`model.onnx`, `model.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base` (revision `8949b90`), un encoder transformer moderno, al que se anade una cabeza de clasificacion para las 77 clases de Banking77. El entrenamiento consistio en un fine-tuning completo (no LoRA) con learning rate 5e-05, batch de 32, hasta 10 epocas con early stopping sobre macro-F1 de validacion (mejor epoca: la 7), warmup lineal del 10 %, weight decay de 0,01 y precision mixta bfloat16 sobre GPU Apple M5 Pro. La validacion se realizo sobre un 10 % estratificado del split de entrenamiento de Banking77, y el split de test se utilizo una unica vez, despues del entrenamiento.

La innovacion tecnica destacable no esta en la arquitectura sino en la cuantizacion: los pesos int8 usan deliberadamente 7 de sus 8 bits. Con pesos de 8 bits completos, ONNX Runtime en CPUs x86 sin VNNI desborda las sumas de 16 bits y la accuracy cae al 77 % en ese tipo de servidor; con 7 bits no puede producirse desbordamiento y las respuestas son identicas en ARM y x86. El repositorio documenta que se trata de la semilla 2 de tres, y que el proyecto reporta media y dispersion sobre las tres.

## Capacidades

- Clasificacion de texto en una de 77 intenciones bancarias predefinidas.
- Etiquetado de mensajes de cliente de un solo turno en ingles.
- Inferencia en CPU con latencia muy baja mediante la variante ONNX int8.
- Despliegue sin PyTorch gracias a los artefactos `onnx/tokenizer.json` y `onnx/labels.json`.
- Integracion sencilla con `transformers` mediante `pipeline("text-classification")`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.
- No dispone de clase "other": siempre devuelve una de las 77 intenciones.

## Casos de uso

- Enrutado de tickets en atencion al cliente bancaria: el modelo clasifica cada mensaje entrante en una de las 77 intenciones y lo dirige al flujo o equipo adecuado, con una latencia p50 de 4,8 ms en CPU que permite procesar en tiempo real.
- Triaje previo en chatbots: antes de invocar un modelo generativo, se usa esta clasificacion para decidir la respuesta o el flujo, reduciendo coste y latencia frente a un LLM en cada turno.
- Etiquetado automatico de historicos de soporte: procesar en lote conversaciones archivadas para construir analitica de motivos de contacto y priorizar mejoras de producto.
- Enrutado en centros de contacto con volumen alto: al ocupar 151 MB en int8 y ejecutarse en CPU, puede desplegarse en multiples instancias sin GPU y escalar horizontalmente.
- Filtrado y preprocesado en pipelines de datos: clasificar mensajes bancarios antes de alimentar un sistema de resumen o de extraccion de informacion, separando por intencion.
- Servicio ligero en entornos serverless o de borde: el ejemplo publico lo despliega tras FastAPI en una CPU de Vercel, lo que demuestra su viabilidad en infraestructura minima.
- Evaluacion comparativa de metodos: como referencia en TuneBench frente a TF-IDF, LoRA sobre Qwen3-0.6B y Claude Haiku 5.5 sobre el mismo test.

## Benchmarks y rendimiento

Resultados sobre el split de test de Banking77 (3.080 mensajes, 40 por intencion):

| Variante | Tamano | Accuracy | Macro-F1 |
|---|---|---|---|
| PyTorch (safetensors) | 599 MB | 93,7 % | 0,9372 |
| ONNX float32 | 599 MB | 93,8 % | 0,9375 |
| ONNX int8 (7 bits) | 151 MB | 93,3 % | 0,9327 |

Latencia reportada con int8 ONNX tras FastAPI, 2 hilos de CPU (Darwin arm64, 15 nucleos): p50 de 4,8 ms y p95 de 10,1 ms por peticion.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU.
- En GPU, los pesos PyTorch en float32 ocupan aproximadamente 599 MB, por lo que cabe en cualquier GPU consumer con 2 GB o mas (RTX 3060, RTX 4090, etc.).
- En CPU, la variante int8 ONNX ocupa 151 MB y funciona con 2 hilos; la float32 ocupa 599 MB.
- Despliegue recomendado: ONNX Runtime con la variante int8 para produccion en CPU; tambien es posible servir la version PyTorch con `transformers`.
- Opciones de despliegue: FastAPI + ONNX Runtime (el ejemplo del autor), `transformers` pipeline, o cualquier servidor compatible con ONNX.
- Throughput: no disponible de forma explicita; con p50 de 4,8 ms por peticion en 2 hilos, el limite practico lo marca el numero de hilos y la concurrencia del servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-base-banking77 (este) | 149,7 M | no disponible | 93,7 % accuracy / 0,9372 macro-F1 | Apache 2.0 | Hugging Face |
| TF-IDF (linea base de TuneBench) | no disponible | no aplica | no disponible en la informacion proporcionada | no aplica | referencia interna del proyecto |
| Qwen3-0.6B con LoRA (TuneBench) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | referencia interna del proyecto |
| Claude Haiku 5.5 (TuneBench) | no disponible | no disponible | no disponible en la informacion proporcionada | propietaria | API |

## Limitaciones y advertencias

- Dominio muy estrecho: solo cubre mensajes de un unico turno en ingles sobre temas de banca minorista; no es un clasificador general.
- No existe clase "other": el modelo siempre devuelve una de las 77 intenciones, incluso para mensajes que no encajan en ninguna, lo que produce falsos positivos silenciosos.
- Las confusiones mas frecuentes se dan entre intenciones casi duplicadas; el repositorio de codigo incluye un analisis de errores.
- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- Los resultados publicados corresponden a la semilla 2 de tres; la ficha del repositorio indica que el proyecto reporta media y dispersion, pero esos valores no estan incluidos en la informacion disponible.
- La cuantizacion int8 con 7 bits es una decision de diseno para evitar desbordamientos en x86 sin VNNI; usar otra configuracion de cuantizacion puede degradar la accuracy.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset Banking77 (CC BY 4.0) si se redistribuyen datos derivados.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si el de asignar una intencion incorrecta con alta confianza; se recomienda umbral de confianza y monitorizacion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oliilo123/modernbert-base-banking77
- Repositorio de codigo TuneBench: https://github.com/olioli9586/tunebench
- Demo publica: https://tunebench-henna.vercel.app
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Paper de Banking77 (Casanueva et al., 2020): no disponible en la informacion proporcionada
