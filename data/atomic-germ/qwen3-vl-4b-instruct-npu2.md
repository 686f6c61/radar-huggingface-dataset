# Atomic-Germ/Qwen3-VL-4B-Instruct-NPU2

## Resumen

Atomic-Germ/Qwen3-VL-4B-Instruct-NPU2 es una adaptacion del modelo vision-lenguaje Qwen3-VL-4B-Instruct de Alibaba, orientada a la inferencia en unidades de procesamiento neuronal (NPU) de dispositivos de borde. El sufijo "NPU2" sugiere una segunda iteracion de optimizacion para este tipo de hardware, aunque el repositorio no documenta los detalles tecnicos de la adaptacion. Con 4.000 millones de parametros en arquitectura densa, hereda todas las capacidades del modelo original: comprension visual y de texto, razonamiento espacial, OCR multilingue, agentes de GUI y generacion de codigo a partir de imagenes o video.

La relevancia de esta variante radica en su potencial para ejecutar un modelo multimodal avanzado en dispositivos con NPU integrada, como el Rockchip RK3588, donde la aceleracion de operaciones matematicas permite inferencia en tiempo real sin depender de GPU dedicadas. El repositorio pesa 8,3 GB, consistente con pesos en bfloat16 para 4B de parametros, y mantiene la licencia Apache 2.0, lo que permite uso comercial sin restricciones. La model card es una copia literal de la del modelo base, sin informacion adicional sobre el proceso de optimizacion NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer denso con vision encoder ViT) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | 256.000 tokens nativos, ampliable a 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta OCR en 32 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-4B-Instruct emplea una arquitectura densa con vision encoder ViT fusionado con el LLM mediante tres innovaciones: Interleaved-MRoPE, que asigna frecuencias posicionales completas a tiempo, anchura y altura para mejorar el razonamiento en video de larga duracion; DeepStack, que fusiona caracteristicas ViT de multiples niveles para capturar detalles finos y mejorar la alineacion imagen-texto; y Text-Timestamp Alignment, que supera a T-RoPE con localizacion de eventos anclada en timestamps precisos.

La variante NPU2 no modifica la arquitectura del modelo base, sino que optimiza su ejecucion para hardware NPU. No se proporcionan datos sobre el proceso de adaptacion, el conjunto de datos de entrenamiento ni el numero de tokens utilizados. El repositorio tampoco documenta si se aplico cuantizacion o conversion a formatos propietarios como RKNN.

## Capacidades

- Comprension de imagenes y video con generacion de texto descriptivo y razonamiento multimodal.
- OCR en 32 idiomas, robusto ante baja luminosidad, desenfoque y texto inclinado.
- Razonamiento espacial avanzado: posicion de objetos, puntos de vista, oclusiones y grounding 2D/3D.
- Generacion de codigo visual: HTML, CSS, JS y diagramas Draw.io a partir de capturas de imagen o video.
- Operacion de agentes de interfaz grafica: reconocimiento de elementos en GUI de PC y movil, invocacion de herramientas y completacion de tareas.
- Comprension de texto puro comparable a modelos LLM dedicados, con fusion texto-vision sin perdida.
- Razonamiento multimodal en STEM y matematicas con respuestas basadas en evidencia causal y logica.

## Casos de uso

- **Asistentes visuales en dispositivos de borde**: ejecutar el modelo en hardware NPU permite responder preguntas sobre imagenes capturadas por camaras locales sin conexion a la nube, util en entornos industriales o de logistica.
- **Automatizacion de interfaces de usuario**: su capacidad de agente GUI reconoce elementos de pantalla y ejecuta acciones como clics, navegacion o relleno de formularios, ideal para pruebas automatizadas de aplicaciones.
- **OCR de documentos en moviles**: el OCR multilingue tolerante a condiciones adversas permite digitalizar documentos, facturas o carteles desde fotografias tomadas con movil.
- **Analisis de video de larga duracion**: con 256K de contexto nativo, el modelo puede procesar horas de grabacion y localizar eventos concretos mediante indizacion por timestamps, aplicable a vigilancia o revision de contenido.
- **Generacion de prototipos web**: convierte capturas de pantalla o videos de interfaces en codigo HTML/CSS/JS funcional, acelerando el diseno de maquetas.
- **Razonamiento espacial para robotica**: el grounding 2D/3D permite que sistemas embarcados comprendan la posicion de objetos en el espacio fisico, util para navegacion o manipulacion de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor referencia imagenes con graficos de rendimiento del modelo base Qwen3-VL-4B-Instruct, pero los valores numericos no se incluyen en el repositorio ni en los resultados de busqueda web.

## Requisitos de hardware

- **VRAM estimada**: el modelo base de 4B en bfloat16 ocupa aproximadamente 8 GB de pesos, por lo que requiere al menos 12 GB de memoria total entre VRAM y RAM para inferencia.
- **GPU recomendadas**: el modelo base se ejecuta en GPU consumer como RTX 3060 (12 GB) o RTX 4090, aunque la variante NPU2 esta disenada para NPU de borde y no para GPU.
- **Compatibilidad con consumer GPU**: si, si se utiliza el modelo base sin las optimizaciones NPU.
- **Opciones de despliegue**: transformers (PyTorch) con soporte para flash_attention_2; para NPU se requiere conversion a RKNN u otro formato propietario, segun el hardware objetivo.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-VL-4B-Instruct | 4B denso | 256K | Apache-2.0 | Modelo base original, orientado a GPU |
| Qwen3-VL-8B-Instruct | 8B denso | 256K | Apache-2.0 | Mayor capacidad, requiere mas VRAM |
| Qwen3-VL-30B-A3B | 30B total (3B activos) | 256K | Apache-2.0 | Arquitectura MoE, eficiente en inferencia |

La variante NPU2 se distingue por su adaptacion a hardware NPU de borde, mientras que las alternativas estan disenadas para GPU o CPU. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La optimizacion NPU puede implicar cuantizacion o conversion de pesos que degraden la precision en tareas de razonamiento complejo; no se documenta el impacto.
- El repositorio no especifica que partes del modelo se ejecutan en NPU y cuales en CPU, por lo que el rendimiento real depende de la implementacion del hardware.
- No se proporcionan datos de sesgos, alucinaciones o limitaciones de idioma especificos de esta variante; se heredan las del modelo base Qwen3-VL-4B-Instruct.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.
- No se incluyen pesos en formato GGUF ni ONNX, lo que limita el despliegue con llama.cpp, Ollama o TensorRT.

## Enlaces

- [Repositorio HuggingFace Atomic-Germ/Qwen3-VL-4B-Instruct-NPU2](https://huggingface.co/Atomic-Germ/Qwen3-VL-4B-Instruct-NPU2)
- [Modelo base Qwen/Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct)
- [Repositorio similar FastFlowLM/Qwen3-VL-4B-Instruct-NPU2](https://huggingface.co/FastFlowLM/Qwen3-VL-4B-Instruct-NPU2)
- [Modelo en ModelScope](https://www.modelscope.cn/models/Qwen/Qwen3-VL-4B-Instruct)
- [GitHub QwenLM/Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)
- [GitHub Qengineering/Qwen3-VL-4B-NPU (conversion RKNN para RK3588)](https://github.com/Qengineering/Qwen3-VL-4B-NPU)
- [Paper Qwen3 Technical Report (arXiv:2505.09388)](https://arxiv.org/abs/2505.09388)
