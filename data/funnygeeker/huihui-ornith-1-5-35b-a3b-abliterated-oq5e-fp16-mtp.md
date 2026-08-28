# funnygeeker/Huihui-Ornith-1.5-35B-A3B-abliterated-oQ5e-fp16-mtp

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated-oQ5e-fp16-mtp es una variante del modelo Ornith-1.5-35B-A3B, desarrollado por ornith-ai, que ha sido sometida a un proceso de "abliteración" (eliminación de los mecanismos de rechazo de contenido) por parte del usuario funnygeeker. El modelo base es un mixture-of-experts (MoE) de 35 mil millones de parámetros totales con aproximadamente 3 mil millones de parámetros activos por token, diseñado específicamente para tareas de razonamiento y generación de código. Esta versión concreta emplea una cuantización mixta oQ5e-fp16-mtp, que combina precisión de 5 bits en la mayoría de los pesos con capas en fp16, e incorpora la técnica de multi-token prediction (mtp) para acelerar la inferencia.

La relevancia de este modelo radica en su naturaleza abliterada, que elimina las restricciones de seguridad típicas de los modelos de IA, permitiendo generar contenido que otros modelos rechazarían. Esto lo hace útil para investigación en seguridad, pruebas de estrés de sistemas de moderación o aplicaciones donde se requiere una generación sin filtros, aunque conlleva riesgos éticos y legales importantes. La licencia MIT permite un uso comercial sin restricciones, y al estar disponible en formato safetensors y GGUF, puede desplegarse en una amplia variedad de entornos, desde servidores con GPUs profesionales hasta equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 35 mil millones |
| Parametros activos | 3 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e-fp16-mtp (safetensors), GGUF (de terceros) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer con arquitectura MoE, donde cada token activa únicamente 3 mil millones de parámetros de un total de 35 mil millones, lo que permite un equilibrio entre capacidad y eficiencia computacional. Está optimizado para razonamiento complejo y generación de código, y se ha entrenado con técnicas de aprendizaje por refuerzo con retroalimentación humana (RLHF) y posiblemente DPO, aunque los detalles exactos del entrenamiento no están disponibles en la información proporcionada. La variante abliterada elimina los mecanismos de rechazo de contenido, lo que se logra mediante la modificación de los pesos del modelo para anular las capas responsables de la negativa a responder. La cuantización oQ5e-fp16-mtp combina una cuantización de 5 bits (Q5e) con capas en fp16 y utiliza multi-token prediction, una técnica que predice varios tokens a la vez para reducir la latencia en la generación.

## Capacidades

- Razonamiento lógico y matemático: el modelo base está diseñado para tareas de razonamiento paso a paso, aunque no se han publicado benchmarks específicos para esta variante.
- Generación de código: soporta múltiples lenguajes de programación y puede completar, explicar o depurar código, gracias a su entrenamiento especializado.
- Tool calling y function calling: no confirmado para esta variante, pero el modelo base Ornith-1.5 incluye soporte para herramientas, por lo que es probable que esta capacidad se mantenga.
- Capacidades multilingües: no disponible, aunque el modelo base probablemente soporta varios idiomas, no se especifica cuáles.
- Modo de pensamiento (thinking): el modelo base incluye un modo de razonamiento extendido, similar a otros modelos de razonamiento, que puede activarse para tareas complejas.
- Visión: no confirmado para esta variante concreta; existe una versión de Ornith-1.5 con proyector de visión, pero no se indica si esta cuantización lo incluye.

## Casos de uso

- Investigación en seguridad de IA: al ser abliterado, permite estudiar cómo los modelos generan contenido dañino o inapropiado, y desarrollar contramedidas. Se usaría en entornos controlados con sandboxing.
- Pruebas de estrés de sistemas de moderación: se puede emplear para generar contenido ofensivo o peligroso y evaluar la robustez de filtros de contenido en aplicaciones de producción.
- Generación de código sin restricciones: en entornos de desarrollo donde se necesita explorar soluciones no convencionales o código que otros modelos rechazarían por políticas de seguridad, como scripts de automatización avanzada.
- Asistente de programación con razonamiento profundo: gracias a su arquitectura MoE y su capacidad de razonamiento, puede ayudar a depurar algoritmos complejos o diseñar arquitecturas de software, aunque su naturaleza abliterada requiere supervisión.
- Experimentación académica: para estudiar el impacto de la abliteración en el rendimiento y la alineación, comparando con la versión original.
- Despliegue en entornos con recursos limitados: al activar solo 3B parámetros por token, puede ejecutarse en GPUs de consumo con cuantización, aunque la memoria total requerida es mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Ornith-1.5-35B-A3B ha mostrado buen rendimiento en tareas de razonamiento y código, pero no hay datos específicos para esta variante abliterada y cuantizada.

## Requisitos de hardware

- VRAM estimada: con cuantización oQ5e (5 bits), los 35B parámetros ocupan aproximadamente 22 GB, más overhead de activaciones y contexto. En fp16 completo serían unos 70 GB, pero esta variante usa mixta, por lo que se estima entre 20 y 25 GB.
- GPU recomendadas: para inferencia local, una RTX 4090 (24 GB) o A6000 (48 GB) sería suficiente. Para despliegue en servidor, A100 (40/80 GB) o H100 (80 GB) son adecuadas.
- Compatibilidad con GPUs de consumo: sí, con cuantización oQ5e cabe en GPUs de 24 GB, como la RTX 3090/4090, aunque con contexto limitado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (existe una versión en Ollama de otro autor), TGI, o directamente con transformers.
- Latencia y throughput: no disponible, pero al ser MoE con 3B activos, la velocidad de generación es superior a un modelo denso de 35B, aunque inferior a un modelo denso de 3B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Ornith-1.5-35B-A3B-abliterated | 35B | 3B | no disponible | MIT | Abliterado, cuantización mixta |
| Ornith-1.5-35B-A3B (original) | 35B | 3B | no disponible | MIT | Modelo base, con alineación |
| Qwen2.5-32B-A3B | 32B | 3B | 128k | Apache 2.0 | MoE, razonamiento y código, no abliterado |
| DeepSeek-V2-Lite | 16B | 2.4B | 128k | MIT | MoE, razonamiento, más pequeño |

La comparativa se basa en características generales, ya que no hay datos de rendimiento para esta variante. El modelo abliterado se diferencia por su falta de restricciones de contenido, lo que lo hace inadecuado para uso general sin control.

## Limitaciones y advertencias

- Al ser abliterado, el modelo puede generar contenido dañino, ilegal, violento o sexualmente explícito sin ningún filtro. Su uso en producción requiere medidas de seguridad externas obligatorias.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados.
- Longitud de contexto no especificada: se desconoce si soporta ventanas largas (128k o más), lo que limita su uso en tareas con documentos extensos.
- Idiomas no especificados: no se garantiza un rendimiento multilingüe consistente.
- La cuantización oQ5e puede degradar ligeramente la calidad de salida en comparación con fp16, aunque la mezcla con capas fp16 mitiga este efecto.
- No hay soporte oficial: el modelo es una modificación de terceros, por lo que no hay garantías de mantenimiento o corrección de errores.
- Licencia MIT permite uso comercial, pero el usuario es responsable del cumplimiento legal y ético de las salidas generadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/funnygeeker/Huihui-Ornith-1.5-35B-A3B-abliterated-oQ5e-fp16-mtp
- Versión GGUF de mradermacher: https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF
- Versión en Ollama con visión (de codecraftersllc): https://ollama.com/codecraftersllc/ornith-1.5-35b-a3b-abliterated
- Página de llm-explorer sobre el modelo: https://llm-explorer.com/model/huihui-ai%2FHuihui-Ornith-1.5-35B-A3B-abliterated,2fKIgn8LQab1oijPhDUyM1
- Información sobre Ornith-1.5-35B-A3B-GGUF: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-35b-a3b-gguf-ornith-ai
