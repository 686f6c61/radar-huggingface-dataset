# kerasformers/internvl3.5-14b

## Resumen

El modelo `kerasformers/internvl3.5-14b` es una conversión íntegra a Keras 3 del checkpoint `OpenGVLab/InternVL3_5-14B-HF`, desarrollado por el equipo de KerasFormers. Se trata de un modelo multimodal de tipo imagen-texto a texto (image-text-to-text) que permite ejecutar el mismo código sin modificaciones en TensorFlow, PyTorch o JAX, gracias a la capa de abstracción de Keras 3. Los pesos se almacenan en precisión bfloat16 y el repositorio ocupa 30,3 GB.

El modelo original, InternVL3.5, es la última iteración de la familia InternVL de OpenGVLab, que ha logrado resultados de vanguardia entre los modelos multimodales de código abierto en tareas de razonamiento general, percepción visual, uso de herramientas y agentes. Según la documentación oficial, InternVL3.5 introduce mejoras significativas en razonamiento (hasta +16,0% en rendimiento global) y una aceleración de inferencia de hasta 4,05 veces respecto a su predecesor InternVL3. Esta conversión a Keras 3 facilita la experimentación y el despliegue en entornos que prefieren un backend unificado, manteniendo la compatibilidad con el ecosistema Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal large language model (MLLM) con codificador de vision y decodificador de lenguaje (detalles concretos no disponibles) |
| Parametros totales | 14 mil millones (14B) |
| Parametros activos | no disponible (no es un modelo MoE en esta variante) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato Keras (H5 / Keras v3) y safetensors en el repo original; esta conversion usa pesos en bfloat16 |

## Arquitectura y entrenamiento

La arquitectura exacta de InternVL3.5-14B no se detalla en la informacion proporcionada, pero se trata de un modelo multimodal que combina un codificador de vision (probablemente basado en ViT o similar) con un modelo de lenguaje de gran tamano. La familia InternVL3.5 introduce innovaciones como el aprendizaje de consistencia visual (Visual Consistency Learning, ViCO) en su version Flash, que reduce el coste de tokens por parche de imagen, aunque no se confirma si esta tecnica se aplica a la variante de 14B. El entrenamiento se apoya en los metodos descritos en los papers arxiv referenciados (2312.14238, 2404.16821, 2411.10442, 2412.05271, 2504.10479, 2508.18265), que cubren desde la arquitectura inicial de InternVL hasta las mejoras de razonamiento y eficiencia de la version 3.5. No se dispone de informacion especifica sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de RLHF/DPO en esta conversion concreta.

## Capacidades

- Generacion de texto a partir de imagenes y texto: puede describir imagenes, responder preguntas visuales y mantener conversaciones multimodales.
- Razonamiento multimodal: integra informacion visual y textual para tareas de logica, analisis de escenas y comprension de diagramas.
- Soporte de tool calling y uso de agentes: segun el blog oficial de InternVL3.5, la familia incluye capacidades para uso de herramientas y agentes GUI, aunque no se confirma si la variante de 14B las hereda completamente.
- Percepcion visual avanzada: incluye analisis de imagenes industriales, vision 3D y otras tareas de percepcion especializada (segun la documentacion de InternVL3).
- Multilingue: aunque la model card indica solo ingles, la familia InternVL3.5 suele soportar multiples idiomas; no se dispone de confirmacion para esta variante.
- Compatibilidad multi-backend: gracias a Keras 3, el modelo se puede ejecutar en TensorFlow, PyTorch o JAX sin cambios en el codigo.

## Casos de uso

- Descripcion y analisis de imagenes en aplicaciones de accesibilidad: el modelo puede generar descripciones detalladas de fotografias o diagramas para personas con discapacidad visual, usando el procesador InternVLProcessor para preparar las entradas.
- Asistentes virtuales con comprension visual: integrar el modelo en un chatbot que reciba capturas de pantalla o fotos de productos y responda preguntas sobre ellos, aprovechando su capacidad de razonamiento multimodal.
- Automatizacion de soporte tecnico con imagenes: el modelo puede analizar capturas de pantalla de errores o configuraciones y proporcionar pasos de solucion, reduciendo la necesidad de intervencion humana.
- Generacion de contenido educativo: crear explicaciones o resumenes a partir de figuras, graficos o ilustraciones cientificas, util para plataformas de aprendizaje automatico.
- Analisis de documentos escaneados: extraer informacion de facturas, formularios o recibos mediante OCR combinado con comprension del contexto visual y textual.
- Prototipado de agentes GUI: aunque no confirmado para esta variante, la familia InternVL3.5 esta disenada para tareas de agente, por lo que podria usarse para automatizar interacciones con interfaces graficas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El modelo original InternVL3.5-14B cuenta con evaluaciones en el repositorio de OpenGVLab, pero no se incluyen en la model card de KerasFormers. Se recomienda consultar la documentacion oficial de InternVL3.5 para obtener datos comparativos de MMLU, HumanEval, GSM8K y otras pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14B parametros en bfloat16, se necesitan aproximadamente 28 GB solo para los pesos. Considerando activaciones y cache de atencion, se recomienda al menos 32-40 GB de VRAM para inferencia sin cuantizacion.
- GPU recomendadas: A100 40GB o 80GB, H100, o RTX 4090 (24 GB) si se aplica cuantizacion adicional (no incluida en esta conversion). Tambien es viable en GPUs de datacenter como L40S o A6000.
- En consumer GPU: la RTX 4090 puede ejecutar el modelo con cuantizacion de 8 bits o 4 bits, aunque esta conversion no incluye esos formatos; seria necesario convertir los pesos a GGUF u otros formatos.
- Opciones de despliegue: al ser una conversion de Keras, se puede servir con TensorFlow Serving, TorchServe o mediante frameworks de inferencia como vLLM (si se exporta a formato compatible). Tambien es posible usar el codigo de ejemplo con `model.generate()`.
- Latencia y throughput: no se dispone de datos medidos; dependera del hardware y del backend elegido. La familia InternVL3.5 promete una aceleracion de hasta 4,05x frente a InternVL3, pero no se ha verificado en esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InternVL3.5-14B (este) | 14B | no disponible | Apache-2.0 | Hugging Face (KerasFormers) |
| InternVL3-14B (OpenGVLab) | 14B | no disponible | MIT (segun repo original) | Hugging Face |
| LLaVA-NeXT (variante 13B) | 13B | 4096 | Apache-2.0 | Hugging Face |
| Qwen2-VL-7B | 7B | 32768 | Apache-2.0 | Hugging Face |

La comparativa se basa en informacion publica general; no se dispone de datos de rendimiento comparativos para esta conversion especifica. InternVL3.5 destaca por su soporte multi-backend via Keras 3, lo que facilita la portabilidad, mientras que alternativas como LLaVA o Qwen2-VL tienen ecosistemas mas maduros en PyTorch.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente con datos en ingles, puede presentar sesgos culturales y linguisticos en otros idiomas.
- Riesgo de alucinacion: como cualquier LLM, puede generar descripciones o respuestas incorrectas sobre imagenes, especialmente en escenarios ambiguos o de baja resolucion.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto; se recomienda verificar antes de usar en aplicaciones con conversaciones largas.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el modelo base proviene de OpenGVLab y puede tener condiciones adicionales; se recomienda revisar la licencia del modelo original.
- Compatibilidad de produccion: esta conversion esta pensada para experimentacion y desarrollo; para despliegue en produccion puede requerir optimizaciones adicionales (cuantizacion, compilacion, etc.) que no estan incluidas.
- Dependencia de Keras 3: el modelo requiere la libreria kerasformers y Keras 3, lo que puede limitar su integracion con herramientas que asumen PyTorch puro.

## Enlaces

- Repositorio HuggingFace de la conversion: https://huggingface.co/kerasformers/internvl3.5-14b
- Modelo original en HuggingFace: https://huggingface.co/OpenGVLab/InternVL3_5-14B-HF
- Repositorio GitHub de InternVL: https://github.com/OpenGVLab/InternVL
- Blog oficial de InternVL3.5: https://internvl.github.io/blog/2025-08-26-InternVL-3.5/
- Blog de InternVL3: https://internvl.github.io/blog/2025-04-11-InternVL-3.0/
- Repositorio KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de KerasFormers para InternVL: https://imvision12.github.io/KerasFormers/internvl/
- Coleccion de modelos InternVL en HuggingFace: https://huggingface.co/collections/kerasformers/internvl-6a8277076dbb163f53241dbd
- Papers arxiv referenciados: [2312.14238](https://arxiv.org/abs/2312.14238), [2404.16821](https://arxiv.org/abs/2404.16821), [2411.10442](https://arxiv.org/abs/2411.10442), [2412.05271](https://arxiv.org/abs/2412.05271), [2504.10479](https://arxiv.org/abs/2504.10479), [2508.18265](https://arxiv.org/abs/2508.18265)
