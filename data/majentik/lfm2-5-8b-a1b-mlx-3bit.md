# majentik/LFM2.5-8B-A1B-MLX-3bit

## Resumen

LFM2.5-8B-A1B-MLX-3bit es una cuantización en 3 bits (afín, grupo de 32) del modelo LFM2.5-8B-A1B de Liquid AI, un modelo de mezcla de expertos (MoE) con 8.000 millones de parámetros totales y 1.500 millones activos por paso. Esta variante está convertida al formato MLX para ejecutarse en Apple Silicon mediante la librería mlx-lm, lo que permite desplegar el modelo en portátiles y equipos de escritorio de Apple con memoria unificada. El modelo original destaca por su ventana de contexto de 128.000 tokens, razonamiento explícito con cadena de pensamiento y soporte nativo de tool calling, orientado a aplicaciones on-device y a entornos de producción con baja latencia.

La cuantización 3-bit reduce el tamaño del archivo a 4,3 GB, lo que facilita su carga en dispositivos con 8 GB o más de RAM unificada. El autor, majentik, ha publicado varias versiones cuantizadas (2, 3, 4, 5, 6, 8 bits y MXFP4) del mismo modelo base, todas bajo la licencia LFM Open License v1.0, que permite uso comercial con atribución. Esta ficha se centra en la variante de 3 bits, aunque los datos técnicos del modelo base se aplican a todas las versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer |
| Parametros totales | 8.000 millones (modelo original); 1.323.462.080 en el archivo safetensors cuantizado |
| Parametros activos | 1.500 millones |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 3-bit afín, grupo de 32 (esta variante); tambien disponibles 2, 4, 5, 6, 8 bits y MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (uso comercial permitido con atribucion) |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B es un transformer de mezcla de expertos con 8.000 millones de parámetros totales y 1.500 millones activos por token, lo que permite una inferencia rápida y eficiente en dispositivos con recursos limitados. La arquitectura MoE activa solo un subconjunto de expertos por paso, reduciendo el coste computacional sin sacrificar capacidad. El modelo incorpora razonamiento con cadena de pensamiento explícita: las respuestas del asistente incluyen un razonamiento intermedio antes de la respuesta final, tal como indica la documentación oficial. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información disponible. La cuantización 3-bit aplicada en esta variante utiliza un esquema afín con grupo de 32, que agrupa los pesos para minimizar la pérdida de precisión.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo (128.000 tokens).
- Razonamiento explicito con cadena de pensamiento, adecuado para tareas de logica, matematicas y analisis.
- Tool calling y function calling, integrable en agentes y pipelines automatizados.
- Soporte para agentes y razonamiento multi-paso gracias a la ventana de contexto amplia y al modo de razonamiento.
- Capacidades multilingues no especificadas por el autor; se asume cobertura de idiomas principales, pero no confirmado.
- Optimizado para ejecucion on-device en Apple Silicon mediante MLX, con baja latencia y consumo reducido de memoria.

## Casos de uso

- Asistentes virtuales en dispositivos Apple: al ser una cuantizacion MLX, puede integrarse en aplicaciones de macOS e iOS para ofrecer respuestas conversacionales con razonamiento, sin depender de la nube. Su ventana de 128.000 tokens permite mantener historiales largos de conversacion.
- Automatizacion de atencion al cliente: el modelo puede gestionar consultas complejas multi-turno, razonar sobre el problema y llamar a APIs externas mediante tool calling para resolver incidencias (consultar pedidos, modificar reservas, etc.) con baja latencia en hardware local.
- Generacion de codigo asistida en entornos de desarrollo: su capacidad de razonamiento y tool calling permite sugerir fragmentos de codigo, explicar algoritmos y ejecutar funciones de depuracion en editores como VS Code o Xcode, funcionando completamente en local.
- Analisis de documentos extensos: con 128.000 tokens de contexto, puede resumir, extraer informacion y responder preguntas sobre manuales, contratos o informes de gran tamaño, ejecutandose en un Mac con suficiente memoria unificada.
- Agentes autonomos para tareas de productividad: el modelo puede planificar y ejecutar secuencias de acciones (enviar correos, programar citas, buscar informacion) mediante tool calling, aprovechando su razonamiento multi-paso y su capacidad de mantener contexto largo.
- Prototipado rapido de aplicaciones de IA en Apple Silicon: desarrolladores pueden usar esta cuantizacion para validar ideas de productos sin necesidad de GPUs dedicadas, gracias a su tamano reducido (4,3 GB) y su compatibilidad con mlx-lm.

## Benchmarks y rendimiento

El autor proporciona dos resultados de evaluacion para esta variante cuantizada:

| Benchmark | Score |
|---|---|
| arc_easy_acc | 0,4600 |
| hellaswag_acc | 0,4250 |

No se han publicado comparaciones con el modelo base sin cuantizar ni con otros modelos similares en la informacion disponible. Estos valores corresponden a la version de 3 bits y pueden diferir de los del modelo original.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1, M2, M3, M4 y posteriores) con memoria unificada.
- Tamano del archivo: 4,3 GB, por lo que se recomienda al menos 8 GB de RAM unificada para cargar el modelo y dejar espacio para el sistema y el contexto.
- Para contextos largos (cercanos a 128.000 tokens), se recomienda 16 GB o mas de RAM unificada, ya que el uso de memoria crece con la longitud de la secuencia.
- Inferencia mediante mlx-lm, que aprovecha la GPU integrada y la memoria unificada de Apple Silicon.
- No requiere GPU dedicada (NVIDIA, AMD) ni VRAM separada; funciona con la memoria del sistema.
- Latencia y throughput no especificados por el autor, pero al ser un MoE con solo 1.500 millones de parametros activos, se espera una generacion rapida en hardware Apple moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre esta cuantizacion y otros modelos de tamano similar. Como referencia, el modelo base LFM2.5-8B-A1B compite con otros MoE pequenos como Qwen2.5-7B-A14B o MiniCPM-3, pero no hay benchmarks compartidos en la informacion proporcionada. La principal diferencia de esta variante es su formato MLX, que la hace exclusiva para Apple Silicon, mientras que las alternativas suelen ofrecer pesos en formato GGUF o safetensors para GPUs convencionales.

## Limitaciones y advertencias

- La cuantizacion 3-bit puede degradar la precision en tareas complejas de razonamiento o generacion de codigo en comparacion con el modelo original en 8 bits o sin cuantizar.
- No se han publicado evaluaciones exhaustivas de sesgos, alucinaciones o robustez en la informacion disponible.
- El modelo genera cadenas de pensamiento explicitas, lo que puede aumentar la latencia en tareas simples y producir respuestas mas largas de lo necesario.
- La licencia LFM Open License v1.0 permite uso comercial con atribucion, pero exige incluir el aviso de licencia en productos derivados.
- No se especifican los idiomas soportados; se recomienda verificar el comportamiento en el idioma objetivo antes de desplegar en produccion.
- Al estar limitado a Apple Silicon, no es util para entornos con GPUs NVIDIA o AMD sin una conversion adicional a otros formatos.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/majentik/LFM2.5-8B-A1B-MLX-3bit
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Documentacion oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/b9aebfcbe28b6cb374042f495d733037550ab146/LICENSE
