# BasinShapers/u2net-webgpu

## Resumen

U²-Net WebGPU es un paquete de pesos del modelo U²-Net (`u2net`) preparado para ejecutarse en el navegador mediante WebGPU. Lo publica el proyecto BasinShapers y su propósito es reproducir, dentro del navegador, el recorte de primer plano (background removal) que ofrece la herramienta rembg en su versión 2.0.76 con la sesión `u2net`. El modelo segmenta el sujeto principal de una fotografía y devuelve un recorte compuesto con fondo transparente, una tarea típica de segmentación de imagen o detección de objeto sobresaliente.

El repositorio no contiene código ejecutable, sino los pesos y la descripción del grafo en un formato propio pensado para un cargador WebGPU. Los pesos originales proceden del `u2net.onnx` distribuido por rembg, y han sido convertidos a un único fichero de float32 (`f32/weights.f32`) con 43.981.069 valores, junto a un `f32/graph.json` que describe 259 operaciones con formas estáticas para una entrada fija de 1×3×320×320. La conversión no cuantiza, reentrena ni modifica los valores: solo pliega las operaciones de cálculo de forma, fija las formas y fusiona cada ReLU dentro de su convolución.

Su relevancia actual es doble. Por un lado, permite hacer background removal directamente en el cliente, sin enviar imágenes a un servidor. Por otro, se usa como paso previo dentro del flujo de generación image-to-3D de Kaminos: recortar el sujeto de una foto corriente antes de reconstruirlo en tres dimensiones. La fidelidad numérica declarada es alta: la salida de red en WebGPU difiere de la de onnxruntime en CPU como máximo en torno a 4e-5, y los recortes finales quedan dentro de 1/255 respecto a rembg.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U²-Net (estructura U anidada, encoder-decoder con bloques RSU residuales) |
| Parametros totales | 43.981.069 (fichero `f32/weights.f32`, 175.924.276 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagen; entrada fija de 1×3×320×320) |
| Tipos de cuantizacion | solo float32 (f32); no se distribuyen versiones cuantizadas |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 (incluye LICENSE-U2NET de U²-Net y LICENSE-REMBG con la nota MIT de rembg) |
| Formato de pesos | f32 crudo little-endian (`f32/weights.f32`) + grafo estatico (`f32/graph.json`); origen ONNX (`u2net.onnx`) |

## Arquitectura y entrenamiento

U²-Net es una red de detección de objeto sobresaliente presentada por Xuebin Qin, Zichen Zhang, Chenyang Huang, Masood Dehghan, Osmar R. Zaiane y Martin Jagersand en el artículo "U²-Net: Going Deeper with Nested U-Structure for Salient Object Detection" (Pattern Recognition, 2020). Su diseño es una estructura U de dos niveles: un encoder-decoder en forma de U donde cada bloque es, a su vez, un pequeño bloque residual en forma de U (RSU). El grafo distribuido en este repositorio contiene 259 operaciones, entre convoluciones (con la ReLU fusionada), max-pools, redimensionados bilineales, concatenaciones, sumas y sigmoides, todas con formas estáticas para la entrada fija de 1×3×320×320.

No ha habido entrenamiento ni ajuste por parte de BasinShapers: los pesos son los de `u2net.onnx` de rembg, con MD5 `60024c5c889badc19c04ad937298a77b` y SHA-256 `8d10d2f3bb75ae3b6d527c77944fc5e7dcd94b29809d47a739a7a728a912b491`. La modificación aplicada por Kaminos consistió en leer el grafo ONNX, plegar las operaciones de cálculo de forma en formas estáticas, fusionar cada ReLU dentro de su convolución y escribir pesos y sesgos sin cambios como float32 en un único fichero. El grafo registra la SHA-256 de los pesos y el cargador del navegador rechaza cualquier paquete cuyo valor no coincida.

## Capacidades

- Segmentacion de objeto sobresaliente: identifica el sujeto principal de una imagen y genera una mascara de primer plano.
- Recorte con fondo transparente (background removal): produce una imagen RGBA con el sujeto aislado, lista para composición.
- Reproduccion fiel de rembg 2.0.76 con sesion `u2net`: redimensionado Lanczos a 320×320, normalizacion ImageNet, inferencia U²-Net, mascara min-max, Lanczos de la mascara al tamano original y recorte compuesto.
- Tolerancia numerica acotada: la salida de red en WebGPU difiere de onnxruntime CPU como maximo en torno a 4e-5; los recortes finales quedan dentro de 1/255 de los de rembg.
- Ejecucion en navegador sobre WebGPU: los calculos se realizan en el cliente, sin necesidad de servidor.
- Entrada de imagen fija: el paquete esta especializado en 1×3×320×320; cualquier imagen se adapta previamente mediante el preprocesado incluido.
- Integracion como paso previo a image-to-3D dentro del flujo de Kaminos.
- No incluye generacion de texto, codigo, matematicas, vision general, tool calling ni modo de razonamiento.

## Casos de uso

- Eliminacion de fondo en el navegador: el modelo recorta el sujeto de una foto directamente en la pagina, sin subirla a un servidor, util para herramientas de edicion o e-commerce donde la privacidad de la imagen es un requisito.
- Paso previo a image-to-3D en Kaminos: recortar el sujeto de una fotografia corriente antes de generar la malla 3D, de modo que el pipeline trabaje sobre el objeto aislado y no sobre el fondo.
- Generacion de fotos de producto: aislar un articulo fotografiado en condiciones domesticas y componerlo sobre un fondo blanco o transparente para catalogos y fichas de producto.
- Edicion fotografica y composicion: crear capas con sujeto recortado para collages, miniaturas o disenos graficos, aprovechando la equivalencia con rembg para obtener resultados predecibles.
- Sustitucion de fondo en tiempo real en aplicaciones web: cambiar el fondo en un editor o en una video-llamada ejecutando la inferencia en WebGPU sobre el cliente.
- Procesamiento por lotes de imagenes en el navegador: aplicar el recorte a galerias enteras sin coste de servidor, ya que solo se descarga el paquete de pesos una vez.
- Automatizacion de pipelines de imagen: integrar el recorte como etapa previa a clasificacion, deteccion u OCR, reduciendo la interferencia del fondo antes de la siguiente tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta comparaciones de fidelidad frente a la referencia: la salida de red en WebGPU difiere de la de onnxruntime CPU como maximo en torno a 4e-5, y los recortes finales quedan dentro de 1/255 respecto a rembg 2.0.76 con sesion `u2net`. No hay cifras de mIoU, IoU, F1 ni tiempos de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32 los pesos ocupan unos 168 MB (175.924.276 bytes); sumando activaciones, el consumo tipico de un modelo de este tamano es moderado, aunque no se especifica en la informacion disponible.
- GPU recomendadas: cualquier GPU con soporte WebGPU (integrada o dedicada) puede ejecutar el modelo en el navegador; no se indican modelos concretos.
- GPU de consumo: si, cabe en GPU de consumo e incluso en graficos integrados compatibles con WebGPU, dado el reducido tamano de los pesos.
- Opciones de despliegue: cargador WebGPU propio de Kaminos (`models/u2net` en su repositorio) para ejecucion en navegador; el `u2net.onnx` original puede ejecutarse en ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BasinShapers/u2net-webgpu | Segmentacion / background removal | 43.981.069 (f32) | f32 + graph.json para WebGPU | apache-2.0 | HuggingFace, pesos para navegador |
| rembg `u2net` (`u2net.onnx`) | Segmentacion / background removal | mismos pesos que el modelo anterior | ONNX | MIT (rembg) / Apache-2.0 (U²-Net) | repositorio rembg, ejecutable en ONNX Runtime |
| U²-Net original (xuebinqin/U-2-Net) | Deteccion de objeto sobresaliente | ~44 M (variante `u2net`) | PyTorch | Apache-2.0 | repositorio GitHub con codigo y pesos |

No se dispone de datos de rendimiento comparativos para el resto de alternativas mas alla de la equivalencia numerica declarada frente a rembg.

## Limitaciones y advertencias

- Este repositorio contiene solo pesos y la descripcion del grafo; no incluye codigo ejecutable. La ejecucion depende del cargador y los kernels de Kaminos.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, pero al ser un modelo de segmentacion de objeto sobresaliente puede fallar en imagenes con varios sujetos, fondos complejos o sujetos poco contrastados.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la mascara puede incluir o excluir regiones incorrectas cuando el sujeto no es claro.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni mantiene contexto conversacional. La entrada de imagen es fija (1×3×320×320) y requiere el preprocesado incluido.
- Restricciones de licencia: los pesos se distribuyen bajo apache-2.0, con la nota de licencia Apache-2.0 de U²-Net y la nota MIT de rembg incluidas. Es uso comercial permitido segun estas licencias, pero conviene revisar las condiciones de U²-Net y rembg si se redistribuye.
- Solo se distribuye en float32; no hay versiones cuantizadas, lo que limita la optimizacion en dispositivos con poca memoria.
- El cargador rechaza paquetes cuya SHA-256 no coincida con la registrada, de modo que las modificaciones de los pesos requieren regenerar el grafo.
- Conviene usar un commit inmutable del Hub en la URL del paquete para evitar que el contenido cambie bajo los pies.

## Enlaces

- HuggingFace: https://huggingface.co/BasinShapers/u2net-webgpu
- Kaminos (repositorio): https://github.com/lyonsno/kaminos
- Kaminos, modelo u2net (cargador y kernels WebGPU): https://github.com/lyonsno/kaminos/tree/main/models/u2net
- rembg: https://github.com/danielgatis/rembg
- Pesos originales `u2net.onnx` (release asset de rembg): https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx
- U²-Net (repositorio original): https://github.com/xuebinqin/U-2-Net
- Articulo: "U²-Net: Going Deeper with Nested U-Structure for Salient Object Detection", Pattern Recognition, 2020 (autores: Xuebin Qin, Zichen Zhang, Chenyang Huang, Masood Dehghan, Osmar R. Zaiane, Martin Jagersand)
