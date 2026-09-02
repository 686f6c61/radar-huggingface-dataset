# appleeatspi/pantrymax-smolvlm-500m-onnx-v2

## Resumen

PantryMax SmolVLM-500M ONNX v2 es una versión optimizada para navegador del modelo multimodal SmolVLM-500M-Instruct de Hugging Face, con un adaptador LoRA específico para la extracción de información de etiquetas de productos y páginas de recetas. Desarrollado por el usuario appleeatspi, este modelo forma parte de la aplicación PantryMax, que procesa imágenes de productos alimentarios y recetas directamente en el cliente web, sin necesidad de servidores externos.

El modelo combina la arquitectura Idefics3 del SmolVLM original (un transformer multimodal ligero de 500 millones de parámetros) con un ajuste fino orientado a tareas de extracción estructurada de datos visuales. La versión v2 fusiona el adaptador LoRA en el decoder antes de aplicar cuantización de 4 bits, y mantiene el grafo ONNX del modelo base para garantizar compatibilidad con Transformers.js. Su relevancia radica en ofrecer una solución de visión por computador y generación de texto que funciona íntegramente en el navegador, con pesos cuantizados y una huella de memoria reducida, pensada para dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3 (transformer multimodal, basado en SmolVLM-500M-Instruct) |
| Parametros totales | 500 millones (aprox., segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | q4 (4 bits weight-only) y q4f16 (4 bits con activaciones en float16) |
| Idiomas soportados | multilingual (segun etiquetas del modelo) |
| Licencia | other (el modelo base es Apache-2.0, pero el adaptador PantryMax tiene condiciones adicionales no especificadas) |
| Formato de pesos | ONNX (archivos .onnx, con pesos cuantizados q4 y q4f16) |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLM-500M-Instruct, un VLM compacto de Hugging Face que utiliza una arquitectura transformer multimodal con un codificador de vision (SigLIP) y un decoder de lenguaje. El adaptador PantryMax fue entrenado localmente sobre ejemplos de etiquetas de productos y paginas de recetas, con una condicion de tarea explicita (`product` o `recipe`) que se inyecta en el prompt. El entrenamiento empleo LoRA (Low-Rank Adaptation) y los pesos resultantes se fusionaron en el decoder del modelo base antes de la cuantizacion a 4 bits.

La version v2 preserva el grafo ONNX del modelo base y sus disposiciones de tensores empaquetados, reemplazando unicamente los tensores de atencion q/v cuantizados que contienen las actualizaciones del LoRA. El codificador de vision y los embeddings permanecen como las exportaciones ONNX originales del modelo base. No se incluyen imagenes fuente, anotaciones ni prompts privados en el repositorio. El proceso de cuantizacion aplica una compresion de 4 bits unicamente sobre los pesos (weight-only quantization), manteniendo las activaciones en float16 para la variante `q4f16`.

## Capacidades

- Extraccion de informacion estructurada de etiquetas de productos alimentarios (ingredientes, valores nutricionales, fechas, etc.) mediante vision y generacion de texto.
- Extraccion de datos de paginas de recetas (ingredientes, pasos, tiempos, etc.) a partir de imagenes.
- Respuesta a preguntas visuales (visual question answering) en tareas especificas de consumo alimentario.
- Generacion de salidas JSON estructuradas mediante decodificacion restringida por esquema (el sistema PantryMax fuerza la salida segun un esquema JSON definido por la tarea).
- Ejecucion completamente local en el navegador gracias a la exportacion ONNX y la integracion con Transformers.js.
- Soporte multilingue (etiquetado como multilingual, aunque no se especifican los idiomas concretos).
- Compatibilidad con dispositivos con soporte de shaders float16 (variante q4f16) y con una variante q4 como respaldo para hardware menos capaz.

## Casos de uso

- Gestion de inventario domestico: la aplicacion PantryMax puede fotografiar etiquetas de productos y extraer automaticamente nombre, cantidad, fecha de caducidad y otros datos para mantener un inventario actualizado.
- Planificacion de comidas: a partir de una foto de una receta en un libro o pantalla, el modelo extrae ingredientes y pasos, permitiendo buscar recetas por ingredientes disponibles en la despensa.
- Asistente de compras: el usuario escanea una etiqueta y el modelo devuelve informacion estructurada (alergenos, valor nutricional) para comparar productos rapidamente.
- Accesibilidad para personas con discapacidad visual: la extraccion de texto de etiquetas y recetas se puede integrar en un lector de pantalla que vocalice la informacion extraida.
- Automatizacion de registros en aplicaciones de nutricion: el modelo convierte una foto de un producto en una entrada estructurada que se envia a una API de seguimiento dietetico.
- Procesamiento de documentos en el navegador: cualquier aplicacion web que necesite extraer datos de imagenes de productos o recetas puede integrar este modelo sin infraestructura de servidor, reduciendo costes y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base SmolVLM-500M-Instruct reporta metricas en el paper de SmolVLM (arxiv 2504.05299), pero este release especifico con el adaptador PantryMax no incluye evaluaciones cuantitativas.

## Requisitos de hardware

- Al ser un modelo de 500M con cuantizacion de 4 bits, el tamano de los pesos ronda los 300-400 MB, por lo que puede ejecutarse en dispositivos con poca memoria.
- La variante `q4f16` requiere soporte de shaders float16, presente en la mayoria de GPUs modernas y en WebGPU. La variante `q4` es compatible con cualquier dispositivo con WebAssembly.
- Puede ejecutarse en CPU de bajo consumo (portatiles, tablets) y en GPUs integradas, gracias al tamaño reducido y a la cuantizacion.
- Para GPU dedicadas, cualquier GPU con al menos 1-2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 o superior, o GPUs integradas de Apple Silicon).
- Despliegue recomendado: Transformers.js en el navegador, con ONNX Runtime Web. No se requiere servidor ni GPU dedicada.
- La latencia depende del hardware del cliente; en un portatil medio con WebGPU, una inferencia tipica de una imagen puede tardar entre 1 y 3 segundos, pero no hay datos oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidad multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| PantryMax SmolVLM-500M ONNX v2 | 500M | no disponible | Vision + texto | other (base Apache-2.0) | ONNX cuantizado |
| SmolVLM-500M-Instruct (base) | 500M | 8k (segun paper) | Vision + texto | Apache-2.0 | PyTorch, ONNX |
| PaliGemma-3B | 3B | 128k | Vision + texto | Gemma license | PyTorch |
| Moondream2 | 1.9B | 2048 | Vision + texto | Apache-2.0 | PyTorch, ONNX |

Nota: los datos de contexto y parametros de los modelos comparados provienen de conocimiento general; la informacion proporcionada no los detalla. La comparativa se basa en la categoria de modelos VLM pequenos para dispositivos de borde.

## Limitaciones y advertencias

- El modelo no debe tratarse como una autoridad en los datos extraidos; la decodificacion estructurada garantiza que la salida sea JSON valido, no que sea factualmente correcta.
- Los valores extraidos pueden contener errores, especialmente en imagenes con baja resolucion, texto pequeno o condiciones de iluminacion pobres.
- La licencia es "other", lo que implica que no se garantiza que todas las obligaciones de las fuentes de entrenamiento esten cubiertas. Los reutilizadores deben revisar la procedencia del modelo base y de los datos de entrenamiento antes de redistribuir o usar comercialmente.
- No se especifican los idiomas concretos soportados, aunque la etiqueta "multilingual" sugiere cobertura de varios idiomas, pero con rendimiento desconocido para cada uno.
- El contexto de entrada esta limitado por el modelo base (no especificado en la informacion), por lo que imagenes muy grandes o con mucho texto pueden superar la ventana del modelo.
- El modelo esta optimizado para las tareas de PantryMax (etiquetas y recetas); su rendimiento en otras tareas visuales puede ser inferior al del modelo base sin adaptador.
- No se incluyen imagenes de entrenamiento ni anotaciones en el repositorio, por lo que no es posible auditar la calidad del conjunto de datos de ajuste.

## Enlaces

- Repositorio del modelo: https://huggingface.co/appleeatspi/pantrymax-smolvlm-500m-onnx-v2
- Modelo base SmolVLM-500M-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Paper de SmolVLM: https://arxiv.org/abs/2504.05299
- Repositorio Smol Models de Hugging Face: https://github.com/huggingface/smollm
- ONNX Model Zoo (referencia para formato): https://github.com/onnx/models
