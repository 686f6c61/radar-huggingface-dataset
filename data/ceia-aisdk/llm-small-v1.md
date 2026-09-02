# ceia-aisdk/llm-small-v1

## Resumen

El modelo `ceia-aisdk/llm-small-v1` es un artefacto GGUF redistribuido que corresponde a una cuantización Q4_K_M del modelo base Qwen/Qwen3-4B-Instruct-2507, realizada por bartowski. El repositorio, mantenido por la organización ceia-aisdk, sirve como alias opaco para el SDK de CEIA, que referencia esta URL en su catálogo. No se trata de un modelo entrenado desde cero, sino de una distribución empaquetada de los pesos cuantizados del modelo original, bajo licencia Apache-2.0.

El archivo único `model.gguf` ocupa 2,5 GB y contiene 4.022.468.096 parámetros totales, lo que lo sitúa en la categoría de modelos pequeños (4B) optimizados para inferencia eficiente en hardware limitado. Al estar en formato GGUF, es compatible con motores como llama.cpp, Ollama y vLLM, y puede ejecutarse en GPUs de consumo con VRAM reducida.

La relevancia de este modelo radica en su papel como componente del ecosistema CEIA AI SDK: ofrece a los desarrolladores un acceso estable y versionado a un modelo de 4B instructivo de alta calidad, sin necesidad de gestionar la descarga del modelo original ni sus variantes cuantizadas. El etiquetado como `conversational` e `imatrix` indica que la cuantización se calibró con matrices de importancia (imatrix), lo que suele mejorar la fidelidad de la cuantización en tareas conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `model.gguf`) |

## Arquitectura y entrenamiento

El modelo es una redistribución de los pesos cuantizados de Qwen/Qwen3-4B-Instruct-2507. No se realizó ningún entrenamiento adicional por parte de CEIA; el repositorio actúa únicamente como contenedor del artefacto GGUF. La cuantización Q4_K_M fue generada por bartowski y publicada en su propio repositorio, y CEIA la reempaquetó bajo su alias `llm-small-v1`.

La arquitectura subyacente es la del modelo Qwen3-4B-Instruct-2507, un transformer autoregresivo con atención por cabezas múltiples, diseñado para tareas de instrucción y conversación. Al tratarse de una cuantización de 4 bits, se reduce el tamaño del modelo de aproximadamente 8 GB (en fp16) a 2,5 GB, con una pérdida mínima de precisión gracias al uso de imatrix para la calibración de la cuantización.

## Capacidades

- Generación de texto y respuestas conversacionales: el modelo está optimizado para seguir instrucciones y mantener diálogos multi-turno.
- Soporte de tool calling y function calling: heredado del modelo base Qwen3-4B-Instruct-2507, que incluye estas capacidades.
- Razonamiento y resolución de problemas: el modelo base presenta competencias en tareas de lógica, matemáticas y razonamiento de sentido común.
- Generación de código: el modelo base es capaz de escribir y explicar código en varios lenguajes de programación.
- Multilingüismo: el modelo base soporta múltiples idiomas, aunque la información específica para esta variante no está disponible.
- Capacidad de agente y multi-step reasoning: el modelo base está diseñado para encadenar pasos de razonamiento y usar herramientas.

## Casos de uso

- Chatbots de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo, gracias a la ventana de contexto del modelo base (128K tokens, aunque no confirmado en esta variante), y su naturaleza conversacional lo hace adecuado para integrarse en sistemas de soporte automatizado.
- Asistentes de programación en entornos de desarrollo: soporta tool calling, por lo que puede integrarse en IDEs o pipelines de CI/CD para generar, revisar o explicar fragmentos de código.
- Aplicaciones de edge computing: al ser un GGUF Q4_K_M de solo 2,5 GB, puede ejecutarse en dispositivos con recursos limitados, como Raspberry Pi o laptops sin GPU dedicada, usando llama.cpp u Ollama.
- Prototipado rápido de agentes conversacionales: el formato GGUF y el alias estable del SDK permiten a los desarrolladores probar flujos de agente con herramientas sin necesidad de gestionar infraestructura compleja.
- Relleno de plantillas y generación de contenido estructurado: el modelo puede producir JSON, XML u otros formatos estructurados a partir de instrucciones, útil para automatizar tareas de extracción de datos.
- Evaluación de modelos en entornos de investigación: al ser una cuantización fiel (imatrix), puede usarse como baseline en experimentos que comparen el rendimiento de modelos cuantizados frente a sus versiones en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un archivo GGUF de 2,5 GB, la VRAM necesaria es de al menos 3-4 GB, considerando overhead de contexto y buffers.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4090, o incluso GPUs integradas con suficiente memoria compartida.
- Compatibilidad con GPU consumer: sí, el modelo cabe en la mayoría de GPUs de consumo modernas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (a través de conversión), o servidores locales como llama-cpp-python.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de contexto.

## Comparativa con modelos similares

No se dispone de información comparativa específica para esta variante. Como referencia, el modelo base Qwen3-4B-Instruct-2507 compite con otros modelos de 4B como Llama-3.2-3B-Instruct o Phi-3.5-mini, pero no hay datos de benchmarks en esta ficha.

## Limitaciones y advertencias

- Al ser una cuantización Q4_K_M, puede presentar una ligera degradación en la precisión respecto al modelo original en fp16, especialmente en tareas que requieren razonamiento numérico exacto.
- El modelo base puede heredar sesgos presentes en sus datos de entrenamiento; no se dispone de información específica sobre sesgos en esta variante.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información plausible pero incorrecta.
- La longitud de contexto no está confirmada en esta variante; se recomienda verificar el modelo base para conocer el límite real.
- La licencia Apache-2.0 permite uso comercial, pero es necesario atribuir correctamente al modelo base y a su autor original.
- El repositorio no incluye información sobre idiomas soportados ni sobre el dataset de entrenamiento; se debe consultar la documentación de Qwen3-4B-Instruct-2507 para detalles.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/ceia-aisdk/llm-small-v1)
- [Modelo base Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- [Cuantización original de bartowski](https://huggingface.co/bartowski/Qwen_Qwen3-4B-Instruct-2507-GGUF)
- [Repositorio del SDK de CEIA (referencia)](https://github.com/YuLab-SMU/aisdk/)
