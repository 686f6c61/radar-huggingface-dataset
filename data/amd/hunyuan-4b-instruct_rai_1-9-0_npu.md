# amd/Hunyuan-4B-Instruct_rai_1.9.0_npu

## Resumen

Hunyuan-4B-Instruct_rai_1.9.0_npu es una distribución del modelo Tencent Hunyuan-4B-Instruct preparada por AMD para su ejecución sobre las NPU integradas en los procesadores Ryzen AI. El paquete lo publica la organización `amd` en Hugging Face e incorpora los pesos en formato ONNX junto con la cadena de herramientas Quark y Ryzen AI (RAI) en su versión 1.9.0, lo que permite desplegar el modelo en hardware de PC con aceleración NPU sin depender de una GPU dedicada.

El modelo base es un transformer denso de la familia `hunyuan_v1_dense` con 4.000 millones de parámetros, orientado a generación de texto y conversación. Esta variante no modifica el comportamiento del modelo original: se centra en el empaquetado, la cuantización y la compatibilidad con el runtime de AMD para NPU, de ahí que el repositorio ocupe 5,6 GB y se distribuya con acceso restringido sujeto a aceptación de condiciones.

Su relevancia es práctica: amplía el catálogo de modelos de tamaño medio que pueden ejecutarse en local sobre portátiles y mini-PC con Ryzen AI, un segmento donde la oferta de pesos optimizados para NPU es todavía reducida. Al tratarse de una compilación específica de hardware, no compite en igualdad de condiciones con los pesos originales en safetensors, sino que cubre el caso de uso de inferencia local acelerada en Windows con el stack de AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `hunyuan_v1_dense`) |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion Quark para NPU (niveles concretos no disponibles) |
| Idiomas soportados | ingles (`en` segun los tags del repositorio) |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 4B parámetros identificado con la arquitectura `hunyuan_v1_dense`, la misma familia que emplea Tencent en sus modelos Hunyuan de menor tamaño. Al ser una variante Instruct, el modelo base ha pasado por un proceso de ajuste supervisado y alineación conversacional, aunque la información disponible en este repositorio no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO.

La aportación técnica de esta publicación no está en el entrenamiento sino en el despliegue: AMD ha convertido los pesos a ONNX y los ha empaquetado con Quark, su herramienta de cuantización, para que funcionen sobre el runtime Ryzen AI 1.9.0 en las NPU de los procesadores Ryzen AI. No se documentan innovaciones de decodificación especulativa, atención lineal ni mecanismos híbridos en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento general y resolución de tareas de conocimiento de tamaño medio, coherente con un modelo denso de 4B parámetros.
- Formato Instruct, con respuestas orientadas a instrucciones y diálogo.
- Ejecución acelerada sobre NPU de Ryzen AI mediante el stack RAI 1.9.0 y pesos ONNX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el pipeline declarado es únicamente `text-generation`.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en portátiles Ryzen AI: el modelo se ejecuta sobre la NPU integrada, lo que libera la GPU y reduce el consumo energético en sesiones de chat prolongadas en un equipo de sobremesa o portátil.
- Procesamiento de texto en aplicaciones de escritorio: integración mediante ONNX Runtime y el stack Ryzen AI para resumir documentos, redactar correos o generar borradores sin enviar datos a la nube.
- Prototipado de pipelines de IA en local: útil para desarrolladores que necesitan validar flujos de generación de texto en hardware AMD antes de escalar a servidores con GPU.
- Automatización de tareas ofimáticas: clasificación y reescritura de textos en inglés dentro de herramientas internas, aprovechando la inferencia en NPU para mantener la latencia baja en equipos sin GPU dedicada.
- Evaluación comparativa de rendimiento NPU frente a CPU y GPU: el paquete ONNX permite medir throughput y latencia en la NPU de Ryzen AI y contrastarlo con otras rutas de ejecución del mismo modelo base.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, el modelo sirve para procesar contenido sensible en inglés sin salida de datos a servicios externos.
- Base para ajuste fino o destilación sobre el modelo original: los pesos Hunyuan-4B-Instruct pueden servir como referencia para tareas en inglés, aunque esta variante concreta está pensada para inferencia en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI, con el runtime Ryzen AI 1.9.0 y los pesos ONNX incluidos en el repositorio.
- VRAM estimada para GPU: no disponible; el paquete está orientado a NPU, no a GPU.
- GPU recomendadas: no aplica para esta distribución; para ejecutar el modelo base en GPU sería necesario convertir los pesos originales a otro formato.
- Compatibilidad con GPU de consumo: no disponible para esta variante ONNX; el modelo base de 4B podría caber en GPU de consumo con cuantización de 4 bits, pero no se documenta en este repositorio.
- Opciones de despliegue: Ryzen AI (RAI) 1.9.0 con ONNX Runtime; vLLM, llama.cpp, Ollama y TGI no están soportados por estos pesos tal como se publican.
- Latencia y throughput: no disponibles.
- Espacio en disco: aproximadamente 5,6 GB de repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Hunyuan-4B-Instruct_rai_1.9.0_npu (este) | 4B | no disponible | ONNX | other (gated) | Inferencia en NPU Ryzen AI |
| Hunyuan-4B-Instruct (pesos originales) | 4B | no disponible | safetensors | según licencia de Tencent | Inferencia general en GPU/CPU |
| Qwen2.5-3B-Instruct | 3B | 32 768 tokens (según ficha pública del modelo) | safetensors, GGUF | Apache 2.0 | Uso general, amplio ecosistema |
| Llama-3.2-3B-Instruct | 3B | 128 000 tokens (según ficha pública del modelo) | safetensors, GGUF | Llama 3.2 Community License | Uso general, despliegue amplio |

La comparación directa con alternativas de la misma categoría es limitada porque esta publicación es una compilación de hardware específica: la ventaja frente a Qwen2.5-3B o Llama-3.2-3B es la aceleración en NPU de Ryzen AI, mientras que en ecosistema, formatos disponibles y licencia permisiva los modelos citados ofrecen más opciones. Los datos de contexto de los modelos comparados provienen de sus fichas públicas y no de este repositorio.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face antes de la descarga.
- Licencia `other`: es imprescindible revisar los términos del modelo base de Tencent y las condiciones de AMD antes de cualquier uso comercial.
- Idiomas: los tags declaran únicamente inglés; no hay evidencia de soporte multilingüe en esta variante.
- Dependencia de hardware: los pesos ONNX están optimizados para NPU Ryzen AI con RAI 1.9.0; no son portables a GPU o CPU sin reconversión.
- Contexto: la longitud de contexto no está documentada en la información disponible, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinación: inherente a un modelo de 4B parámetros; requiere verificación en aplicaciones de producción.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada.
- Madurez del ecosistema: al ser una compilación reciente y específica, la comunidad y la documentación de terceros son escasas.
- Rendimiento: sin benchmarks publicados, no es posible comparar su calidad frente a alternativas de tamaño similar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Hunyuan-4B-Instruct_rai_1.9.0_npu
