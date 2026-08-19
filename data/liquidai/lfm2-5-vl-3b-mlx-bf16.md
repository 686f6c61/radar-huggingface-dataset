# LiquidAI/LFM2.5-VL-3B-MLX-bf16

## Resumen

LFM2.5-VL-3B-MLX-bf16 es una exportación en formato MLX del modelo vision-lenguaje LFM2.5-VL-3B desarrollado por Liquid AI. Este modelo está diseñado específicamente para inferencia en dispositivos Apple Silicon, aprovechando el framework MLX para ejecución eficiente en hardware de Apple. Se trata de un modelo de 3.100 millones de parámetros que combina un backbone de lenguaje LFM2.5-2.6B con un encoder de visión SigLIP2 NaFlex de 400 millones de parámetros, lo que le permite procesar imágenes y texto de forma conjunta.

El modelo destaca por sus capacidades de comprensión de pantallas digitales, OCR, comprensión de documentos, predicción de bounding boxes y function calling, todo ello pensado para despliegue en el edge con baja latencia. Su relevancia actual radica en que ofrece capacidades de visión-lenguaje avanzadas en un tamaño compacto, apto para ejecución en dispositivos locales sin depender de infraestructura cloud. La versión MLX aquí descrita está optimizada para Apple Silicon, lo que facilita su integración en aplicaciones macOS e iOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LFM2.5-2.6B + encoder de vision SigLIP2 NaFlex (400M) |
| Parametros totales | 3.123.483.888 (3,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta exportacion MLX) |
| Idiomas soportados | arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes, vietnamita (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LFM2.5-VL-3B combina un modelo de lenguaje basado en la arquitectura LFM2.5-2.6B con un encoder de vision SigLIP2 NaFlex de 400 millones de parametros. El backbone de lenguaje emplea una arquitectura transformer con atencion lineal, una de las innovaciones de Liquid AI que reduce la complejidad computacional frente a la atencion cuadratica estandar. El encoder de vision SigLIP2 NaFlex esta disenado para procesar imagenes a resoluciones flexibles, lo que resulta util para tareas de OCR y comprension de documentos donde la densidad de texto es alta.

El modelo se entrena para responder directamente a partir de la entrada visual y textual, sin pasos intermedios de razonamiento, lo que reduce la latencia en inferencia. No se han publicado detalles especificos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. La version MLX es una conversion del modelo original en safetensors, realizada por Liquid AI para facilitar su uso con el framework MLX en Apple Silicon.

## Capacidades

- Comprension de imagenes y texto: procesa entradas multimodales combinando vision y lenguaje.
- OCR y comprension de documentos: extrae texto de imagenes y comprende documentos escaneados o capturas de pantalla.
- Comprension de pantallas digitales: interpreta interfaces de movil, web y escritorio, identificando elementos y su disposicion.
- Prediccion de bounding boxes: localiza objetos en una imagen y devuelve coordenadas.
- Function calling: puede invocar herramientas o funciones a partir de instrucciones en texto o imagen.
- Grounding: asocia entidades mencionadas en texto con regiones especificas de la imagen.
- Multilingue: soporta 16 idiomas, incluyendo espanol, ingles, frances, aleman, chino, japones, entre otros.
- Razonamiento visual: responde preguntas sobre el contenido de imagenes con respuestas directas.

## Casos de uso

- Asistente de accesibilidad para personas con discapacidad visual: el modelo puede describir el contenido de una pantalla o fotografia en tiempo real, identificando texto, botones y elementos de interfaz, gracias a su capacidad de OCR y comprension de pantallas.
- Automatizacion de pruebas de interfaz de usuario: al predecir bounding boxes y comprender elementos de pantalla, puede generar coordenadas para automatizar tests de UI en aplicaciones moviles o web, reduciendo el trabajo manual de los equipos de QA.
- Extraccion de datos de documentos escaneados: en entornos administrativos o legales, el modelo puede procesar facturas, formularios o contratos, extrayendo campos clave mediante OCR y devolviendo estructuras de datos utilizables.
- Agente conversacional con soporte visual: integrado en un chatbot, puede recibir capturas de pantalla del usuario, interpretarlas y ejecutar acciones mediante function calling, por ejemplo, para rellenar formularios o navegar por una interfaz.
- Analisis de graficos y tablas en informes: dado un grafico o tabla en imagen, el modelo puede resumir la informacion, responder preguntas sobre tendencias o valores, y extraer datos para su posterior procesamiento.
- Asistente de compras online: el usuario envia una captura de un producto o una pagina web, y el modelo identifica el producto, extrae el precio y las caracteristicas, y puede invocar funciones de busqueda o comparacion.
- Moderacion de contenido visual: el modelo puede analizar imagenes en redes sociales o plataformas de contenido, identificando texto inapropiado o elementos visuales problematicos mediante OCR y comprension de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial menciona que el modelo es "mas capaz y rapido" que versiones anteriores, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados.

## Requisitos de hardware

- Esta version MLX esta optimizada para Apple Silicon (chips M1, M2, M3 y posteriores).
- El tamano del repositorio es de 6,3 GB, lo que da una estimacion de memoria necesaria en torno a 6-7 GB para cargar el modelo en bf16, aunque no se ha confirmado oficialmente.
- No requiere GPU dedicada de NVIDIA; se ejecuta en la GPU integrada de los chips Apple.
- Para inferencia se utiliza la libreria mlx-vlm, que gestiona la carga del modelo y la generacion de respuestas.
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de vision-lenguaje de tamano similar, como Phi-3.5-vision o MiniCPM-V. La informacion disponible no incluye resultados estandarizados que permitan una comparacion cuantitativa. Cualitativamente, LFM2.5-VL-3B se posiciona como un modelo compacto orientado al edge, con enfasis en OCR, grounding y function calling, similar a otros VLM de 3-4B de parametros.

## Limitaciones y advertencias

- La licencia lfm1.0 es una licencia propia de Liquid AI; es necesario revisar sus terminos para uso comercial, ya que puede incluir restricciones especificas.
- No se han publicado detalles sobre sesgos del modelo ni evaluaciones de seguridad; como cualquier modelo de lenguaje, puede generar contenido inexacto o alucinaciones, especialmente en tareas de razonamiento complejo.
- La longitud de contexto no esta documentada, lo que limita la planificacion de aplicaciones que requieran ventanas largas.
- El modelo esta optimizado para Apple Silicon; su uso en otras plataformas requiere conversion a otros formatos (GGUF, ONNX) que no estan incluidos en este repositorio.
- La comprension de pantallas y OCR puede fallar en imagenes de baja resolucion o con texto muy pequeno, a pesar del encoder NaFlex de resolucion flexible.
- No se garantiza la precision en todos los idiomas soportados; el rendimiento puede variar significativamente entre lenguas con menos datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentacion oficial: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion de LFM: https://docs.liquid.ai/lfm
- LEAP (plataforma de Liquid AI): https://leap.liquid.ai/
- Blog de Liquid AI: https://www.liquid.ai/blog/
