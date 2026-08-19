# LiquidAI/LFM2.5-VL-3B-ONNX

## Resumen

LFM2.5-VL-3B-ONNX es la versión en formato ONNX del modelo de visión-lenguaje LFM2.5-VL-3B desarrollado por Liquid AI, una compañía especializada en modelos híbridos para edge computing. Este modelo está diseñado específicamente para ejecutarse en dispositivos con recursos limitados, como navegadores web mediante WebGPU, manteniendo capacidades avanzadas de comprensión visual y multimodal. Se basa en el backbone LFM2.5-2.6B, un modelo híbrido que combina arquitecturas transformer y de estado, junto con un codificador de imagen SigLIP2 NaFlex.

El modelo resuelve el problema de desplegar modelos de visión-lenguaje (VLM) en entornos de baja latencia y memoria restringida, sin sacrificar funcionalidades como grounding de objetos, comprensión de pantallas digitales, parsing de documentos y function calling. Con 3.1 mil millones de parámetros, ofrece un equilibrio entre rendimiento y eficiencia, y su formato ONNX permite su integración en aplicaciones JavaScript a través de Transformers.js, así como en otros entornos compatibles con ONNX Runtime. Su relevancia actual radica en la creciente demanda de asistentes multimodales que operen directamente en el dispositivo, sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (backbone LFM2.5-2.6B + codificador de imagen SigLIP2 NaFlex) |
| Parametros totales | 3.1 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (decoder) y fp16 (embeddings y vision encoder) en el ejemplo de Transformers.js; otras opciones no disponibles |
| Idiomas soportados | arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes, vietnamita |
| Licencia | lfm1.0 (licencia propia de Liquid AI) |
| Formato de pesos | ONNX (tambien disponible en GGUF y MLX segun la documentacion) |

## Arquitectura y entrenamiento

LFM2.5-VL-3B combina un backbone de lenguaje LFM2.5-2.6B, que emplea una arquitectura híbrida que mezcla capas transformer con mecanismos de estado (similar a los modelos SSM), con un codificador de imagen SigLIP2 NaFlex. Esta combinación permite procesar entradas visuales y textuales de forma conjunta, generando respuestas directamente sin necesidad de módulos adicionales de proyección complejos. El modelo está optimizado para inferencia de baja latencia, tanto en dispositivo como en la nube, y responde de forma autorregresiva.

No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (como RLHF o DPO) en la información disponible. Sin embargo, la arquitectura híbrida y el uso de SigLIP2 NaFlex sugieren un entrenamiento enfocado en tareas de comprensión visual y grounding, con especial atención a la eficiencia computacional para entornos edge.

## Capacidades

- Generacion de descripciones de imagenes y respuestas a preguntas visuales (image-text-to-text).
- Grounding de objetos: localiza elementos en una imagen y devuelve coordenadas.
- Comprension de pantallas digitales: interpreta capturas de pantalla de aplicaciones moviles, web y escritorio.
- Parsing de documentos y graficos: extrae informacion estructurada de documentos, tablas y graficos.
- Function calling / tool calling: puede invocar herramientas o funciones a partir de instrucciones en texto o imagen.
- Soporte multilingue en 16 idiomas, incluyendo espanol, ingles, frances, aleman, chino, japones, etc.
- Ejecucion en navegador mediante WebGPU y Transformers.js, lo que permite despliegue sin servidor.

## Casos de uso

- Asistente de accesibilidad visual: el modelo puede describir en tiempo real lo que aparece en la pantalla de un dispositivo movil o escritorio, ayudando a personas con discapacidad visual a navegar por aplicaciones y sitios web. Su capacidad de grounding permite senalar elementos concretos.
- Automatizacion de pruebas de interfaz de usuario: al recibir capturas de pantalla, el modelo identifica botones, campos de texto y otros componentes, generando coordenadas que pueden usarse para automatizar pruebas funcionales en pipelines de CI/CD.
- Extraccion de datos de facturas y documentos: el parsing de documentos y graficos permite convertir facturas, recibos o informes en datos estructurados, reduciendo la intervencion manual en procesos de contabilidad o gestion documental.
- Asistente de navegacion web por voz: integrado en un navegador, el modelo interpreta la pantalla actual y ejecuta acciones como hacer clic en enlaces o rellenar formularios, respondiendo a comandos de voz del usuario.
- Generacion de codigo a partir de mockups: un desarrollador puede subir una imagen de un diseno de interfaz y el modelo genera el codigo HTML/CSS o componentes de framework correspondientes, acelerando el prototipado.
- Chatbot de atencion al cliente con soporte visual: el modelo puede recibir imagenes de productos o capturas de error enviadas por el usuario, comprender el contexto y ofrecer soluciones, todo ejecutandose localmente en el dispositivo del cliente para garantizar privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial menciona mejoras en velocidad y eficiencia respecto a generaciones anteriores, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandar.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de 3.1B con cuantizacion q4 en el decoder, se estima que puede ejecutarse en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU compatible con WebGPU (por ejemplo, integradas modernas de Intel o AMD, o discretas como NVIDIA GTX 16xx en adelante) para ejecucion en navegador. Para despliegue con ONNX Runtime, GPUs con soporte CUDA o DirectML.
- Compatibilidad con consumer GPU: si, especialmente con cuantizacion y en modo WebGPU.
- Opciones de despliegue: Transformers.js (navegador), ONNX Runtime (Python, C++, etc.), y segun la documentacion tambien hay versiones GGUF y MLX para otros entornos.
- Latencia y throughput: no disponibles, aunque el diseno orientado a edge sugiere latencias inferiores a 100 ms en hardware moderno, sin datos confirmados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de la misma categoria (VLMs de ~3B parametros). Alternativas como Phi-3.5-vision, Qwen2-VL-2B o InternVL2-2B podrian ser comparables, pero no hay benchmarks compartidos en la informacion proporcionada. Se recomienda consultar la documentacion oficial para futuras actualizaciones.

## Limitaciones y advertencias

- Licencia lfm1.0: es una licencia propietaria de Liquid AI. Aunque permite uso comercial, es necesario revisar los terminos exactos en el archivo LICENSE del repositorio, ya que puede incluir restricciones de redistribucion o atribucion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir descripciones o respuestas inexactas, especialmente en imagenes ambiguas o de baja resolucion.
- Limitaciones de contexto: no se ha especificado la longitud maxima de contexto, por lo que en tareas que requieran dialogos muy largos o multiples imagenes podria degradarse el rendimiento.
- Dependencia de WebGPU: la ejecucion en navegador requiere un navegador compatible con WebGPU (Chrome, Edge, Firefox en versiones recientes), lo que limita su uso en entornos legacy.
- Modelo relativamente nuevo: al ser una version reciente (agosto de 2026), puede haber errores no documentados o falta de soporte en algunas herramientas de inferencia.
- Idiomas: aunque soporta 16 idiomas, la calidad puede variar significativamente entre ellos, con mejor rendimiento en ingles y chino probablemente.

## Enlaces

- Repositorio HuggingFace del modelo ONNX: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-ONNX
- Model card original: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Blog de HuggingFace: https://huggingface.co/blog/LiquidAI/lfm2-5-vl-3b
- Documentacion oficial: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Playground de Liquid AI: https://playground.liquid.ai/
- LEAP (plataforma de evaluacion): https://leap.liquid.ai/
