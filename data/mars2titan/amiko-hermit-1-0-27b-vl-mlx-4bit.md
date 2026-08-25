# mars2titan/amiko-hermit-1.0-27b-vl-mlx-4bit

## Resumen

Amiko Hermit 1.0 es un modelo de lenguaje y visión (image-text-to-text) desarrollado por el usuario mars2titan, que combina el modelo base Qwen3.8-27B (una variante de 27 mil millones de parámetros de la familia Qwen3) con un LoRA de herramientas llamado OpenHermit y un encoder de visión completo. El resultado se ha cuantizado a 4 bits en formato MLX para ejecutarse eficientemente en Apple Silicon. El modelo está pensado para tareas que requieren comprensión de imágenes y uso de herramientas (tool calling) en un mismo flujo, algo poco común en modelos de este tamaño.

La relevancia actual de este modelo radica en que ofrece capacidades de visión y tool-use en un paquete compacto (16,1 GB) que puede ejecutarse en un Mac con memoria unificada suficiente, sin necesidad de GPUs dedicadas. Además, incorpora una cabeza de predicción multi-token (MTP) heredada de Qwen3, que acelera la decodificación. El entrenamiento del LoRA se realizó con QLoRA 4-bit sobre un dataset propio de 8.000 ejemplos de tool-use, logrando una pérdida de 3,18 a 0,62 y una precisión de tokens del 47% al 85% en 250 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision-language, transformer denso con MTP) |
| Parametros totales | 27B (modelo original) / 4.665.462.000 (archivo cuantizado 4-bit) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit MLX (affine, group size 64, 4.695 bits/weight) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27B parámetros con atención estándar y una cabeza de predicción multi-token (MTP) que permite generar varios tokens por paso de decodificación. Sobre esta base se aplica un LoRA de herramientas (OpenHermit) entrenado con QLoRA 4-bit (r=16, α=32) durante 1 época y 250 pasos en 4 GPUs H200, utilizando el dataset `amiko-openhermit-toolsft` con 8.000 ejemplos de entrenamiento y 1.000 de validación. Posteriormente se fusiona un encoder de visión completo (VL overlay merge) para habilitar la entrada de imágenes, y el conjunto se cuantiza a 4 bits con MLX (affine, group size 64) para su ejecución en Apple Silicon.

El entrenamiento del LoRA se centró exclusivamente en tool-use, no en razonamiento general ni en visión, ya que el encoder de visión se añade mediante un merge posterior. La pérdida final de 0,62 y la precisión de tokens del 85% sugieren que el LoRA capturó bien el formato de llamadas a herramientas, aunque no se han publicado métricas de evaluación independientes.

## Capacidades

- Generacion de texto y razonamiento basado en el modelo base Qwen3.8-27B.
- Comprension de imagenes (image-text-to-text) gracias al encoder de vision completo.
- Tool calling / function calling, entrenado especificamente con el dataset OpenHermit.
- Prediccion multi-token (MTP) para acelerar la decodificacion.
- Capacidad de conversacion multi-turno (etiqueta "conversational").
- Soporte de agentes y multi-step reasoning, heredado de Qwen3 (aunque no se ha verificado en este modelo concreto).

## Casos de uso

- Asistentes de soporte tecnico con capturas de pantalla: el modelo puede recibir una imagen de un error o interfaz y, mediante tool calling, consultar una base de conocimiento o abrir un ticket. Su encoder de vision permite interpretar la imagen directamente.
- Automatizacion de tareas de oficina con documentos escaneados: al combinar OCR visual con generacion de texto, puede extraer datos de facturas o formularios y llamar a APIs de contabilidad.
- Agentes de navegacion web asistida: el modelo puede analizar una captura de pantalla de una pagina web y decidir que herramienta (clic, relleno de formulario) invocar, gracias a su entrenamiento en tool-use.
- Generacion de informes a partir de graficos: recibe una imagen de un grafico o tabla y produce un resumen textual, pudiendo ademas consultar una base de datos para obtener datos adicionales.
- Chatbots de atencion al cliente con contexto visual: en un Mac con suficiente memoria unificada, puede desplegarse localmente para gestionar conversaciones que incluyan fotos de productos o problemas.
- Prototipado rapido de aplicaciones de vision-lenguaje en Apple Silicon: al ser un modelo MLX 4-bit, se integra facilmente con `mlx-vlm` para experimentar sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento (loss 3,18 → 0,62, token acc 47% → 85%) sobre el dataset de tool-use, pero no hay evaluaciones estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Memoria unificada estimada: el repositorio ocupa 16,1 GB, por lo que se recomienda un Mac con al menos 24 GB de RAM unificada para cargar el modelo y dejar margen para el contexto y la generacion. Con 32 GB o mas se opera comodamente.
- GPU compatibles: cualquier Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. No requiere GPU NVIDIA ni AMD.
- Opciones de despliegue: `mlx-vlm` (servidor y generacion), tambien se puede usar con `mlx-lm` para texto puro, aunque el autor recomienda `mlx-vlm` para mantener la vision.
- Latencia y throughput: no se han publicado mediciones. En un M2 Max con 32 GB, se espera una generacion de unos 10-20 tokens/s en 4-bit, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia, existen otros modelos de 27B cuantizados a 4-bit en MLX, como `mlx-community/gemma-3-27b-it-4bit` o `h1st0ry3D/Godoter-27B-MLX-4bit`, pero no se han encontrado benchmarks que permitan una comparacion objetiva. El modelo base Qwen3.8-27B tampoco tiene metricas publicas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- La cuantizacion 4-bit puede degradar ligeramente la calidad de generacion en tareas complejas de razonamiento o vision, en comparacion con el modelo original en precision completa.
- No se han publicado evaluaciones independientes de sesgos, alucinaciones o robustez. El entrenamiento del LoRA se limito a 8.000 ejemplos de tool-use, por lo que su generalizacion fuera de ese dominio es incierta.
- El encoder de vision se anade mediante un merge posterior al entrenamiento del LoRA, lo que podria causar una integracion suboptima entre vision y tool-use en algunos casos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias restricciones (aunque Qwen3 suele ser Apache 2.0, no se ha verificado para esta variante concreta).
- No se ha probado en produccion a gran escala; el autor solo proporciona instrucciones de uso local con `mlx-vlm`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mars2titan/amiko-hermit-1.0-27b-vl-mlx-4bit
- Modelo base (merge con vision): https://huggingface.co/mars2titan/amiko-hermit-27b-vl-merged
- LoRA de herramientas: https://huggingface.co/mars2titan/amiko-hermit-qwen38-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/mars2titan/amiko-openhermit-toolsft
- Version solo texto (4-bit): https://huggingface.co/mars2titan/amiko-hermit-27b-mlx-4bit
