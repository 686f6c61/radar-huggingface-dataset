# mv-amorim/Gemma-4-E4B-it-DeepSeek-v4-Distill-openvino

## Resumen

Gemma-4-E4B-it-DeepSeek-v4-Distill-openvino es un artefacto de despliegue publicado por el usuario mv-amorim en HuggingFace: no se trata de un modelo entrenado desde cero, sino de una conversión al formato OpenVINO del modelo base armand0e/Gemma-4-E4B-it-DeepSeek-v4-Distill. La conversión se ha realizado con optimum-intel a través del Space de exportación de OpenVINO, de modo que el resultado son pesos en formato IR (Intermediate Representation) listos para ejecutarse sobre el runtime de Intel.

El pipeline declarado es image-text-to-text, y las etiquetas incluyen gemma4 y openvino-export, lo que indica que se trata de un modelo multimodal (texto e imagen) de la familia Gemma 4, según la nomenclatura del repositorio base. El identificador sugiere además una variante "E4B" y un proceso de destilación a partir de un supuesto DeepSeek-v4, aunque la model card no aporta detalles sobre el entrenamiento original.

Su relevancia es práctica y acotada: ofrece una vía directa para ejecutar un modelo multimodal conversacional sobre hardware Intel (CPU, iGPU, NPU) sin necesidad de GPU dedicada, algo útil en entornos de borde, portátiles y servidores sin aceleradores NVIDIA. El repositorio ocupa 10,6 GB y, en el momento de la consulta, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; las etiquetas indican la familia gemma4 y una arquitectura de causal LM visual (clase `OVModelForVisualCausalLM`) con capacidad de entrada de imagen |
| Parámetros totales | No disponible (la nomenclatura "E4B" del modelo base sugiere un tamaño efectivo del orden de 4.000 millones, sin confirmación en la información proporcionada) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se distribuye como exportación OpenVINO; no se especifican precisión ni variantes INT8/INT4 en la model card) |
| Idiomas soportados | Inglés (en) y chino (zh), según las etiquetas y la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (repositorio de 10,6 GB); etiquetas de openvino-export y unsloth en el modelo base |
| Librería de carga | transformers con optimum-intel (`OVModelForVisualCausalLM`) |
| Pipeline declarado | image-text-to-text |
| Modelo base | armand0e/Gemma-4-E4B-it-DeepSeek-v4-Distill |
| Fecha de publicación | 14 de septiembre de 2026 (creación y última actualización) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. La model card se limita a indicar que el modelo se convirtió a OpenVINO desde armand0e/Gemma-4-E4B-it-DeepSeek-v4-Distill mediante optimum-intel y el Space openvino-export. La clase de carga empleada, `OVModelForVisualCausalLM`, confirma que se trata de un modelo causal con soporte de entrada visual, es decir, un modelo multimodal que acepta imágenes y texto, y genera texto.

En cuanto al entrenamiento, los únicos indicios son los del nombre del modelo base: una variante de la familia Gemma 4 con nomenclatura "E4B", afinada para conversación ("it") y, aparentemente, destilada a partir de un modelo denominado DeepSeek-v4-Distill. No hay datos publicados sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, mezcla de expertos u otras).

La contribución técnica de este repositorio es, por tanto, exclusivamente la conversión de formato: transformar los pesos originales en una representación optimizada para el runtime de OpenVINO, lo que habilita la inferencia sobre CPU, iGPU y NPU de Intel.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta conversational y el pipeline image-text-to-text.
- Procesamiento de entradas multimodales (imagen y texto), confirmado por la clase de carga `OVModelForVisualCausalLM` y el pipeline declarado.
- Generación de texto condicionada por imagen (image-to-text), por ejemplo descripción de contenido visual.
- Soporte multilingüe limitado a inglés y chino, según los idiomas declarados.
- Ejecución optimizada sobre hardware Intel mediante OpenVINO (CPU, iGPU, NPU), que es la capacidad diferencial de esta conversión.
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible) y con text-generation-inference como etiqueta declarada.
- No hay información disponible sobre soporte de tool calling, function calling, razonamiento multi-paso, modo "thinking", generación de código o capacidades de audio.

## Casos de uso

- Inferencia local sin GPU dedicada: al estar exportado a OpenVINO, el modelo puede ejecutarse sobre CPU Intel o iGPU integrada, lo que permite desplegar un asistente conversacional multimodal en equipos de sobremesa o portátiles sin tarjeta gráfica NVIDIA.
- Despliegue en el borde (edge computing): en entornos industriales o de retail con hardware Intel y sin conectividad estable, el modelo puede procesar texto e imágenes localmente, evitando enviar datos a la nube.
- Prototipado rápido de aplicaciones de visión-lenguaje: dado que acepta imagen y texto y se carga con `OVModelForVisualCausalLM`, sirve para validar pipelines de descripción de imágenes o respuesta a preguntas sobre imágenes antes de invertir en modelos mayores.
- Asistentes conversacionales en inglés o chino: con esos dos idiomas declarados, encaja en aplicaciones de atención al usuario para mercados anglófono y sinófono, con la salvedad de que no cubre el español.
- Aceleración sobre NPU en equipos con procesadores Intel Core Ultra: OpenVINO permite asignar la inferencia a la NPU integrada, liberando CPU y reduciendo el consumo en aplicaciones de escritorio siempre activas.
- Evaluación comparativa de backends: útil para medir la diferencia de latencia y consumo entre una ejecución en PyTorch y la misma en OpenVINO, como paso previo a decisiones de infraestructura.
- Integración en servicios compatibles con endpoints de inferencia: la etiqueta endpoints_compatible facilita exponer el modelo mediante una API HTTP en plataformas que ya soportan OpenVINO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se ofrecen cifras de latencia o throughput.

## Requisitos de hardware

- El repositorio ocupa 10,6 GB, lo que da una cota inferior del espacio en disco necesario y orienta sobre el tamaño de los pesos en la precisión exportada.
- VRAM o memoria estimada: no disponible como dato publicado. De forma orientativa, y solo a partir del tamaño del repositorio, la carga en memoria se situaría en el entorno de los 10-12 GB si se mantiene la precisión del export; con cuantización adicional a INT8 o INT4 el consumo bajaría sustancialmente, pero el autor no distribuye variantes cuantizadas declaradas.
- GPU recomendadas: no disponible. El formato OpenVINO está orientado a hardware Intel (CPU, iGPU, NPU) y a GPU Intel Arc; no se documenta soporte para A100, H100 o RTX 4090 en esta conversión.
- Compatibilidad con GPU de consumo: no confirmada. La vía natural es CPU o iGPU Intel, donde el modelo podría caber en equipos con 16 GB de RAM o más, aunque no hay confirmación del autor.
- Opciones de despliegue: optimum-intel con `OVModelForVisualCausalLM` (forma documentada en la model card), runtime de OpenVINO y, según las etiquetas, text-generation-inference y endpoints compatibles. No se documentan instrucciones para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

Ejemplo de carga documentado por el autor:

```python
from optimum.intel import OVModelForVisualCausalLM

model_id = "mv-amorim/Gemma-4-E4B-it-DeepSeek-v4-Distill-openvino"
model = OVModelForVisualCausalLM.from_pretrained(model_id)
```

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación se limita a los datos verificables del propio repositorio y de su modelo base.

| Modelo | Formato | Licencia | Idiomas | Descargas | Tamaño de repositorio |
|---|---|---|---|---|---|
| mv-amorim/Gemma-4-E4B-it-DeepSeek-v4-Distill-openvino | OpenVINO IR | Apache 2.0 | en, zh | 0 | 10,6 GB |
| armand0e/Gemma-4-E4B-it-DeepSeek-v4-Distill (base) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (multimodales de tamaño pequeño exportados a OpenVINO) con datos verificables.

## Limitaciones y advertencias

- La model card no documenta ningún proceso de evaluación, alineación o mitigación de sesgos; no hay información sobre sesgos conocidos.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado en este caso, al no existir benchmarks publicados.
- Cobertura idiomática limitada a inglés y chino: no se declara soporte de español ni de otras lenguas, por lo que su uso en castellano no está garantizado.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas que requieran ventanas largas sin verificación empírica previa.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se documenten los cambios. Es una licencia permisiva, sin cláusulas de uso restringido.
- Trazabilidad limitada: el modelo es una conversión de un modelo base de terceros, y no se detalla qué cambios introduce la destilación ni qué datos se usaron en el afinado, lo que dificulta auditar el origen del comportamiento.
- Repositorio sin adopción: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Requisitos de software: la carga requiere optimum-intel (`pip install optimum-intel`); no se documentan alternativas de ejecución fuera del ecosistema OpenVINO.
- Para producción, conviene validar de forma independiente la precisión tras la conversión a OpenVINO, ya que el autor no publica métricas de degradación respecto al modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mv-amorim/Gemma-4-E4B-it-DeepSeek-v4-Distill-openvino
- Modelo base: https://huggingface.co/armand0e/Gemma-4-E4B-it-DeepSeek-v4-Distill
- optimum-intel (herramienta de conversión): https://github.com/huggingface/optimum-intel
- Space de exportación a OpenVINO: https://huggingface.co/spaces/echarlaix/openvino-export

Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces recuperados corresponden a resultados no relacionados (marca de motocicletas MV Agusta y entradas de enciclopedia sobre la abreviatura "MV"), por lo que se han descartado. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la información disponible.
