# LiquidAI/LFM2.5-VL-3B-MLX-4bit

## Resumen

LFM2.5-VL-3B-MLX-4bit es la exportación oficial en formato MLX (Apple Silicon) del modelo vision-language LFM2.5-VL-3B desarrollado por Liquid AI. Este modelo combina el backbone de lenguaje LFM2.5-2.6B con un encoder de visión SigLIP2 NaFlex de 400 millones de parámetros, alcanzando un total aproximado de 3.000 millones de parámetros. Está diseñado específicamente para inferencia en dispositivos de borde (edge) y en la nube, con baja latencia y consumo reducido de memoria.

El modelo destaca por sus capacidades de grounding visual (predicción de bounding boxes), comprensión de pantallas y documentos, OCR multilingüe y function calling, todo ello en una ventana de contexto de 32.000 tokens. Su licencia LFM 1.0 permite uso comercial bajo condiciones específicas. Esta versión MLX 4-bit ocupa unos 2,2 GB y está pensada para ejecutarse de forma eficiente en Macs con Apple Silicon, lo que la convierte en una opción atractiva para prototipado y despliegue local de agentes multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone LFM2.5-2.6B + encoder de vision SigLIP2 NaFlex 400M) |
| Parametros totales | 3B (847.942.896 en safetensors del repo MLX 4-bit) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | 4-bit (group size 64) en este repo; el modelo base tambien disponible en precision completa |
| Idiomas soportados | arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, español, tailandes, vietnamita (16 idiomas) |
| Licencia | LFM 1.0 (licencia propia de Liquid AI, no OSI-approved) |
| Formato de pesos | safetensors (MLX), tambien disponibles GGUF y ONNX en otros repos del modelo base |

## Arquitectura y entrenamiento

LFM2.5-VL-3B es un modelo de arquitectura transformer multimodal que combina un modelo de lenguaje autoregresivo (LFM2.5-2.6B) con un encoder de vision SigLIP2 NaFlex de 400 millones de parametros. El encoder de vision procesa imagenes a resolucion nativa de hasta 512x512 píxeles y proyecta las caracteristicas visuales al espacio de embeddings del texto. El modelo sigue el paradigma clasico de los VLM: el texto y las imagenes se tokenizan y procesan conjuntamente, generando respuestas de texto autoregresivamente.

No se han publicado detalles especificos sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion disponible. El modelo se presenta como una evolucion de la serie LFM2, con mejoras en velocidad y precision para tareas de grounding, comprension de documentos y function calling. La version MLX 4-bit es una cuantizacion del modelo original que reduce el tamaño de 2,2 GB manteniendo un group size de 64 para minimizar la perdida de precision.

## Capacidades

- Generacion de texto multimodal: responde a prompts que combinan imagen y texto, describiendo contenido visual, respondiendo preguntas y manteniendo conversaciones.
- OCR y comprension de documentos: extrae texto de imagenes, escaneos y capturas, incluyendo documentos complejos con tablas y diagramas.
- Grounding visual: predice bounding boxes para objetos o regiones mencionadas en el texto, permitiendo localizar elementos dentro de una imagen.
- Comprension de pantallas: interpreta capturas de pantalla de aplicaciones moviles, web y escritorio, identificando elementos de interfaz y su disposicion.
- Function calling: puede invocar herramientas o funciones a partir de instrucciones en texto o imagen, facilitando la integracion en agentes automatizados.
- Soporte multilingue: cubre 16 idiomas, incluyendo español, ingles, frances, aleman, chino, japones, coreano, etc.
- Razonamiento visual: combina informacion textual y visual para responder preguntas que requieren inferencia sobre el contenido de la imagen.

## Casos de uso

- Automatizacion de pruebas de interfaz de usuario: el modelo puede analizar capturas de pantalla de aplicaciones, identificar elementos UI y generar coordenadas de bounding boxes para automatizar tests visuales en pipelines de CI/CD.
- Asistente de accesibilidad: dado un screenshot o una imagen, el modelo describe el contenido y localiza elementos, ayudando a personas con discapacidad visual a navegar por aplicaciones o sitios web.
- Extraccion de datos de facturas y recibos: gracias a su OCR y comprension de documentos, puede procesar imagenes de facturas, extraer campos clave (importes, fechas, proveedores) y estructurarlos en formato JSON para su integracion en sistemas contables.
- Agente de soporte tecnico con vision: el modelo recibe una captura de pantalla del error del usuario, identifica el problema y genera una respuesta con instrucciones paso a paso, pudiendo llamar a herramientas externas para consultar documentacion.
- Analisis de documentos legales escaneados: convierte imagenes de contratos o formularios en texto estructurado y responde preguntas sobre clausulas especificas, aprovechando su ventana de contexto de 32K tokens.
- Moderacion de contenido visual: analiza imagenes y capturas para detectar texto inapropiado o elementos visuales problematicos, generando alertas o descripciones para revisores humanos.
- Prototipado rapido en Mac: al estar disponible en MLX 4-bit, los desarrolladores pueden ejecutar el modelo localmente en un MacBook con Apple Silicon para validar flujos multimodales sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog oficial de Liquid AI menciona que el modelo es "mejor y mas rapido" que alternativas para edge, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandar en los materiales revisados.

## Requisitos de hardware

- Inferencia en Apple Silicon: el formato MLX esta optimizado para Macs con chips M1, M2, M3 o M4. El modelo 4-bit ocupa 2,2 GB, por lo que cabe en cualquier Mac con al menos 8 GB de memoria unificada.
- VRAM estimada: aproximadamente 2,5-3 GB de memoria unificada para inferencia con 4-bit (modelo 2,2 GB + overhead de ejecucion). En Macs con 8 GB o mas es viable.
- GPUs compatibles: no requiere GPU NVIDIA; se ejecuta en la GPU integrada de Apple Silicon via MLX. No hay soporte CUDA para esta version especifica.
- Opciones de despliegue: usando la libreria `mlx-vlm` (comando `mlx_vlm.generate` o API Python). Tambien se puede convertir a otros formatos (GGUF, ONNX) desde el modelo base para ejecucion en CPU o GPU de otras marcas.
- Latencia y throughput: no se han publicado mediciones oficiales. En un MacBook Pro con M3 Pro, se espera una generacion de 10-20 tokens por segundo para modelos de 3B en 4-bit, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como referencia cualitativa, el modelo compite con otros VLM de tamano similar como Qwen2-VL-2B, InternVL2-2B o Phi-3.5-vision, pero no hay benchmarks oficiales que permitan una comparacion rigurosa. La ventaja principal de LFM2.5-VL-3B es su soporte nativo para grounding y function calling en un paquete de 3B, ademas de su disponibilidad en MLX para Apple Silicon.

## Limitaciones y advertencias

- Licencia LFM 1.0: no es una licencia open source estandar (no es OSI-approved). Permite uso comercial pero con condiciones especificas que deben revisarse en el texto completo de la licencia antes de usar el modelo en produccion.
- Resolucion de imagen limitada: el encoder de vision soporta hasta 512x512 píxeles, lo que puede limitar la precision en imagenes muy detalladas o con texto pequeno.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar descripciones o respuestas incorrectas sobre el contenido visual, especialmente en imagenes ambiguas o fuera de distribucion.
- Sesgos potenciales: no se han publicado evaluaciones de sesgos. Al entrenarse con datos web, puede reflejar sesgos culturales, de genero o etnicos presentes en el corpus.
- Idioma: aunque soporta 16 idiomas, el rendimiento puede variar significativamente entre ellos; los idiomas con menos representacion en el entrenamiento probablemente tendran peores resultados.
- Sin garantia de rendimiento en produccion: no hay benchmarks publicados, por lo que el rendimiento real en tareas especificas debe validarse con datos propios antes de un despliegue critico.
- Limitado a Apple Silicon en esta version: el repo MLX no es compatible con NVIDIA o AMD; para otras plataformas es necesario usar el modelo base y convertirlo a GGUF u ONNX.

## Enlaces

- Repositorio HuggingFace de esta version: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog oficial de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentacion oficial: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Playground de Liquid AI: https://playground.liquid.ai/
- Licencia LFM 1.0: disponible en el repositorio de HuggingFace (archivo LICENSE)
