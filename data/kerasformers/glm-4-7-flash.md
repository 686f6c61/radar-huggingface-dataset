# kerasformers/glm-4.7-flash

## Resumen

El modelo `kerasformers/glm-4.7-flash` es una conversión íntegra a Keras 3 del modelo `zai-org/GLM-4.7-Flash` de Zhipu AI / Z.ai, realizada por el proyecto KerasFormers. Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) con 30 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token (30B-A3B), diseñado como una variante ligera y eficiente de la familia GLM-4.7. Su arquitectura combina atención con latencia multi-cabezal (MLA) y capas MoE estilo DeepSeek, lo que permite un despliegue local con un equilibrio notable entre rendimiento y consumo de recursos.

La relevancia de esta conversión radica en que permite ejecutar el mismo modelo de forma nativa en tres backends de Keras 3 —TensorFlow, PyTorch y JAX— sin modificar el código, lo que facilita su integración en entornos heterogéneos. El modelo está pensado para tareas de generación de texto, razonamiento, codificación y uso como agente, con una ventana de contexto de 200.000 tokens y soporte para tool calling. La licencia MIT y la disponibilidad de pesos en bfloat16 lo convierten en una opción atractiva para investigación y producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MLA + DeepSeekMoE) |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | 3 mil millones (A3B) |
| Longitud de contexto | 200.000 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16) |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | MIT |
| Formato de pesos | no disponible (almacenados en bfloat16, con sesgo del router en float32) |

## Arquitectura y entrenamiento

La arquitectura de GLM-4.7-Flash es un transformer basado en mixture-of-experts que combina dos innovaciones principales: atención con latencia multi-cabezal (MLA) y capas MoE de tipo DeepSeek. El uso de MLA reduce el coste de memoria y computación durante la generación al comprimir las claves y valores en un espacio latente, mientras que las capas MoE activan solo un subconjunto de expertos por token, lo que explica que con 30B parámetros totales solo se activen 3B por paso. Esta combinación permite una inferencia rápida con un coste computacional relativamente bajo para su tamaño.

El modelo fue entrenado por Zhipu AI / Z.ai como una variante ligera de GLM-4.7, optimizada para despliegue local y tareas de agente. La conversión de KerasFormers mantiene la precisión mixta del checkpoint original: los pesos se almacenan en bfloat16, mientras que la corrección de sesgo del router MoE se conserva en float32, tal y como se especifica en el archivo `kf_config.json`. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) en la información proporcionada.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con especial enfasis en tareas de codificacion y agentes.
- Soporte de tool calling / function calling, lo que permite al modelo invocar herramientas externas durante la generacion.
- Capacidad para tareas de agente y razonamiento multi-paso, gracias a su ventana de contexto de 200K tokens.
- Modelo multilingue, con soporte declarado para ingles y chino.
- Inferencia eficiente gracias a su arquitectura MoE con solo 3B parametros activos, lo que reduce la latencia y el consumo de memoria frente a modelos densos de tamano similar.
- Compatibilidad multiplataforma: la conversion Keras 3 permite ejecutar el modelo sin cambios en TensorFlow, PyTorch y JAX.

## Casos de uso

- Asistente de codigo en entornos de desarrollo: el modelo puede autocompletar funciones, generar tests y explicar fragmentos de codigo, aprovechando su capacidad de razonamiento y su ventana de contexto amplia para manejar proyectos extensos.
- Agente conversacional con herramientas: gracias al soporte de tool calling, puede integrarse en sistemas que necesitan consultar APIs, bases de datos o ejecutar comandos, manteniendo el contexto de la conversacion durante largas sesiones.
- Analisis de documentos largos: con 200K tokens de contexto, es adecuado para resumir, extraer informacion o responder preguntas sobre contratos, informes tecnicos o articulos cientificos completos.
- Chatbot de atencion al cliente multilingue: su capacidad para alternar entre ingles y chino, junto con su bajo coste de inferencia, lo hace util para sistemas de soporte en empresas con usuarios de ambos idiomas.
- Generacion de contenido tecnico: puede redactar documentacion, guias o tutoriales a partir de especificaciones breves, manteniendo coherencia a lo largo de textos extensos.
- Prototipado rapido de aplicaciones con LLM: al poder ejecutarse en tres backends de Keras 3, facilita el desarrollo de prototipos que luego se despliegan en infraestructuras con TensorFlow, PyTorch o JAX sin cambios de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo original en HuggingFace no incluye tablas comparativas de MMLU, HumanEval, GSM8K u otros tests estandar. Se recomienda consultar la documentacion oficial de Z.ai para obtener datos de rendimiento actualizados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30B parametros en bfloat16, se necesitan aproximadamente 60 GB de memoria solo para los pesos. Con cuantizacion a 8 bits, unos 30 GB; a 4 bits, unos 15 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para ejecutar el modelo en bfloat16 sin cuantizar, se requieren GPUs profesionales como A100 (80 GB), H100 (80 GB) o similares. Con cuantizacion 8 bits, una RTX 4090 (24 GB) o una A6000 (48 GB) podrian ser suficientes.
- Compatibilidad con GPU de consumo: es posible ejecutarlo en GPUs consumer de gama alta (RTX 4090, 3090) si se aplica cuantizacion a 4 bits, aunque no se ofrecen pesos cuantizados en este repositorio.
- Opciones de despliegue: al ser una conversion Keras 3, puede servirse con TensorFlow Serving, TorchServe o JAX, ademas de integrarse en frameworks como vLLM o llama.cpp si se convierten los pesos a los formatos adecuados (no incluidos en este repositorio).
- Latencia y throughput: no se han publicado mediciones especificas para esta conversion. Dado que solo se activan 3B parametros por token, se espera una latencia significativamente menor que la de un modelo denso de 30B, pero los valores concretos dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables en la informacion proporcionada. El modelo ocupa la categoria de MoE de 30B con ~3B activos, similar a otros lanzamientos recientes como Qwen2.5-32B-A3B o DeepSeek-V3-Lite, pero no se han encontrado benchmarks que permitan una comparacion directa. Se recomienda consultar las fichas de dichos modelos en sus repositorios oficiales para obtener datos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente con datos en ingles y chino, puede presentar sesgos culturales o linguisticos en otros idiomas.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con datos poco frecuentes.
- Limitaciones de contexto: aunque la ventana es de 200K tokens, el rendimiento puede degradarse en los tramos finales de contextos muy largos, algo comun en modelos con atencion de ventana amplia.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se debe verificar que el modelo base original (zai-org/GLM-4.7-Flash) mantenga la misma licencia en todas sus versiones.
- Cobertura de idiomas limitada: el soporte oficial declarado es solo ingles y chino; otros idiomas pueden funcionar peor o no estar optimizados.
- Formato de pesos propietario de Keras: al ser una conversion a Keras 3, los pesos no estan en formato safetensors o GGUF, lo que puede dificultar su uso con herramientas estandar como llama.cpp o vLLM sin conversion adicional.
- Sin cuantizaciones oficiales: no se ofrecen versiones cuantizadas, por lo que el despliegue en hardware limitado requiere procesos de cuantizacion externos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/glm-4.7-flash
- Modelo base original: https://huggingface.co/zai-org/GLM-4.7-Flash
- Coleccion GLM de KerasFormers: https://huggingface.co/collections/kerasformers/glm-6a82b8f9f753e8dcae3ff3f7
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de GLM en KerasFormers: https://imvision12.github.io/KerasFormers/glm4_moe_lite/
- Paper ChatGLM (arXiv:2406.12793): https://arxiv.org/abs/2406.12793
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/glm-4.7
- Ficha de GLM-4.7-Flash en ModelsLab: https://modelslab.com/zai-glm-47-flash
