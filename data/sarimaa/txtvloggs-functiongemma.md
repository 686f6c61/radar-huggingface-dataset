# Sarimaa/txtvloggs-functiongemma

## Resumen

Txt Vloggs FunctionGemma es un ajuste fino del modelo google/functiongemma-270m-it, desarrollado por el usuario Sarimaa para la aplicación de diario personal Txt Vloggs. Su función es convertir comandos cortos de página, escritos en inglés, roman urdu o urdu, en llamadas a herramientas (tool calls) estructuradas. Se distribuye exclusivamente como bundle LiteRT-LM (`.litertlm`) para su ejecución en el runtime LiteRT-LM, por ejemplo mediante el plugin `flutter_edge_ai`.

El modelo hereda la arquitectura y el tamaño del base: 270 millones de parámetros, con un contexto de 1024 tokens y una ventana de prefill de 256 tokens tras la conversión. Está cuantizado a int8 dinámico y empaquetado con tokenizador y plantilla de chat en un único fichero de aproximadamente 286 MB (el repositorio completo ocupa 0,6 GB).

Su relevancia es acotada pero clara: demuestra un flujo completo de especialización de un modelo pequeño de function calling para despliegue en dispositivo (on-device) dentro de una app Flutter, con un caso de uso muy concreto y un pipeline de exportación reproducible mediante `litert-torch`. No es un modelo de propósito general ni compite en benchmarks abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/functiongemma-270m-it); detalles internos no disponibles |
| Parametros totales | 270 millones (según el modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 1024 tokens (tras la conversión); prefill de 256 tokens |
| Tipos de cuantizacion | int8 dinámica (única variante publicada) |
| Idiomas soportados | Inglés, roman urdu y urdu (según la model card); no disponible el desglose oficial |
| Licencia | Gemma Terms of Use |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM con tokenizador y chat template); el base original en SafeTensors |

## Arquitectura y entrenamiento

El modelo parte de google/functiongemma-270m-it, un modelo de 270 millones de parámetros orientado a function calling. La model card no detalla la arquitectura interna del base (número de capas, dimensión oculta, tipo de atención), por lo que esos datos deben consultarse en la ficha del modelo original. El ajuste fino se realizó sobre aproximadamente 7700 ejemplos sintéticos de comandos de página, generados específicamente para la app Txt Vloggs.

Tras el ajuste, el modelo se convirtió de SafeTensors a `.litertlm` mediante `litert-torch` (función `export_hf`), aplicando cuantización int8 dinámica y fijando una ventana de prefill de 256 tokens y un contexto de 1024 tokens. El bundle incluye el tokenizador y la plantilla de chat. No se documentan en la información disponible detalles sobre RLHF, DPO, composición exacta del dataset ni innovaciones técnicas adicionales más allá del pipeline de exportación a LiteRT-LM.

## Capacidades

- Generación de tool calls a partir de comandos cortos de página (function calling estructurado).
- Comprensión de comandos en inglés, roman urdu y urdu, según la model card.
- Ejecución en dispositivo mediante el runtime LiteRT-LM (plugin `flutter_edge_ai` para Flutter).
- Integración con plantilla de chat y tokenizador empaquetados en el propio bundle.
- No se documentan capacidades de razonamiento multi-paso, agentes, visión, audio ni modo thinking en la información disponible.
- No se documenta soporte multilingüe más allá de los tres idiomas indicados.

## Casos de uso

- Diario personal en Flutter: el modelo traduce comandos como "nueva entrada" o equivalentes en urdu a llamadas de función que crean páginas en la app Txt Vloggs; es su propósito original y está ajustado específicamente para ello.
- Automatización de UI por voz o texto en apps móviles: al ejecutarse on-device con LiteRT-LM, permite mapear instrucciones breves a acciones de la interfaz sin enviar datos a la nube.
- Asistentes offline en dispositivos de gama baja: con 270 M de parámetros e int8, el bundle de 286 MB cabe en memoria de móviles y evita dependencias de red.
- Prototipado de function calling en Flutter: sirve como referencia de pipeline completo (fine-tuning, exportación con `litert-torch`, empaquetado `.litertlm`) para equipos que quieran replicar el flujo con sus propios comandos.
- Soporte de entrada multilingüe en apps de nicho: cubre usuarios que escriben en roman urdu o urdu, idiomas poco representados en modelos pequeños de function calling.
- Clasificación y enrutado de comandos: puede usarse para decidir qué herramienta invocar ante una frase corta, siempre dentro del vocabulario de funciones para el que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el bundle pesa unos 286 MB en int8; la huella en memoria durante inferencia no está documentada, pero por tamaño debería ser del orden de cientos de MB.
- GPU recomendadas: no disponible; el runtime objetivo es LiteRT-LM en dispositivo (CPU/GPU/NPU móvil), no servidores con A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, aunque no hay datos oficiales de ejecución en GPU de escritorio; el formato `.litertlm` está pensado para LiteRT-LM.
- Opciones de despliegue: LiteRT-LM (runtime objetivo), plugin `flutter_edge_ai` en Flutter. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sarimaa/txtvloggs-functiongemma | 270 M | 1024 | `.litertlm` (int8) | Gemma Terms of Use | Ajuste específico para Txt Vloggs; solo LiteRT-LM |
| google/functiongemma-270m-it | 270 M | no disponible | SafeTensors | Gemma Terms of Use | Modelo base de propósito general para function calling |
| Otros modelos pequeños de function calling | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

No se dispone de datos de rendimiento comparado entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado solo con comandos de la app Txt Vloggs; su precisión fuera de ese dominio no está garantizada.
- Contexto limitado a 1024 tokens y prefill de 256 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo se publica una variante int8 en `.litertlm`; no hay pesos en SafeTensors ni GGUF para otros runtimes.
- Dataset sintético de unos 7700 ejemplos: posible sobreajuste al estilo exacto de los comandos generados y menor robustez ante variaciones reales de los usuarios.
- Idiomas limitados a inglés, roman urdu y urdu según la model card; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación en la selección de funciones o en los argumentos generados, inherente a modelos de este tamaño.
- Uso comercial sujeto a los Gemma Terms of Use y a la Prohibited Use Policy de Google.
- Sin benchmarks publicados ni métricas de evaluación; no hay evidencia cuantitativa de calidad frente al modelo base.
- Repositorio con muy poca tracción (19 descargas, 0 likes), lo que reduce la validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sarimaa/txtvloggs-functiongemma
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
