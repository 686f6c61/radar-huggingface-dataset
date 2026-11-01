# androidli/depthsnap-models

## Resumen

`depthsnap-models` es un repositorio de distribución de pesos cifrados para modelos de estimación de profundidad monocular, publicado por el usuario `androidli`. No se trata de un modelo entrenado por el autor ni de un checkpoint convencional: el repositorio contiene dos ficheros binarios cifrados con AES-256-GCM que corresponden a dos variantes de un modelo denominado LiteDepth, orientadas a la conversión 2D→3D en navegador web.

El contenido se limita a dos artefactos: `lite_640x352_enc.bin`, variante de alta calidad con resolución de entrada 640×352, y `lite_384x224_enc.bin`, variante rápida con resolución 384×224. Ambos ficheros están cifrados y no son cargables directamente como modelos ONNX, pese a que el repositorio está etiquetado con `onnx`. La clave de descifrado no se distribuye en el repositorio, sino que se entrega desde el endpoint `/api/mkey` del sitio de despliegue tras validar una lista blanca de orígenes.

La relevancia de este repositorio es limitada para la comunidad de investigación: no documenta arquitectura, datos de entrenamiento, parámetros ni métricas. Su función es servir como espejo de distribución de pesos para una aplicación web concreta, con una segunda copia alojada en un bucket de Cloudflare R2. Para cualquier evaluador externo, el repositorio no permite reproducir ni inspeccionar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor solo indica el nombre "LiteDepth"; no se detalla la topologia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplicable (modelo de vision para estimacion de profundidad) |
| Tipos de cuantizacion | no disponible (los artefactos son binarios cifrados, no pesos en un formato de cuantizacion conocido) |
| Idiomas soportados | no disponible (no aplica a la tarea; el repositorio no declara idiomas) |
| Licencia | other (sin texto de licencia publicado en la model card) |
| Formato de pesos | binario cifrado AES-256-GCM con estructura `[12B IV][ciphertext || 16B auth tag]`; el material subyacente se etiqueta como ONNX pero no se distribuye en claro |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El autor unicamente emplea la denominacion LiteDepth y distingue dos variantes por resolucion de entrada (640×352 y 384×224), lo que sugiere un diseno orientado a inferencia ligera en el navegador, pero no se documenta el tipo de red (CNN, transformer, hibrida), el numero de parametros ni el coste computacional.

Tampoco se publican datos sobre el entrenamiento: no hay informacion sobre el numero de tokens o imagenes utilizadas, la composicion del dataset, el uso de tecnicas de ajuste fino, destilacion o cuantizacion, ni sobre posibles innovaciones tecnicas. La model card se centra exclusivamente en el mecanismo de cifrado y distribucion, no en el modelo en si.

## Capacidades

- Estimacion de profundidad monocular a partir de una imagen 2D, segun la etiqueta `depth-estimation` del repositorio.
- Dos modos de inferencia diferenciados por resolucion: 640×352 (calidad alta) y 384×224 (rapida).
- Ejecucion prevista en navegador web, ya que el material se descarga y descifra con WebCrypto para su uso en el cliente.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplicable ni documentada.
- Capacidades adicionales (modo thinking, vision general, audio): no disponibles.

## Casos de uso

- Conversion 2D→3D en el navegador: el caso de uso declarado por el autor; la aplicacion depthsnap descarga el fichero cifrado, obtiene la clave desde `/api/mkey` y descifra los pesos en el cliente para generar mapas de profundidad.
- Efectos de paralaje y relieve en visores web: la variante 384×224 permitiria generar mapas de profundidad en tiempo casi real para animaciones ligeras en paginas web.
- Previsualizacion de profundidad en herramientas de edicion de imagen basadas en navegador: la variante 640×352 ofrece mayor detalle para vistas previas de calidad.
- Prototipado de experiencias de realidad aumentada web: el mapa de profundidad podria alimentar la oclusion basica de objetos en escenas AR ejecutadas en el navegador.
- Distribucion controlada de pesos a clientes: el esquema de cifrado con lista blanca de origenes sirve como patron para entregar modelos solo a dominios autorizados.
- Espejo de alta disponibilidad: la publicacion paralela en HuggingFace y en Cloudflare R2 permite mantener el servicio ante caidas de un unico CDN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta pensado para ejecucion en navegador, presumiblemente mediante WebGPU o WASM, pero no se documentan requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la orientacion web sugiere que el diseno busca ser ligero, pero no hay cifras que lo confirmen.
- Opciones de despliegue: el flujo previsto es la descarga del binario cifrado desde HuggingFace o Cloudflare R2, la obtencion de la clave en `/api/mkey` y el descifrado con WebCrypto AES-GCM en el cliente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de profundidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no proporciona informacion suficiente (parametros, arquitectura, licencia, metricas) para establecer una comparacion rigurosa con modelos de estimacion de profundidad monocular como Depth Anything, MiDaS o DPT. Ademas, la naturaleza cifrada de los artefactos impide verificar el contenido real de los pesos.

## Limitaciones y advertencias

- Los ficheros no son modelos utilizables directamente: son texto cifrado AES-256-GCM y requieren la clave distribuida por `/api/mkey`, sujeta a validacion de origen.
- La licencia es `other` sin texto publicado; no se aclaran los derechos de uso comercial, modificacion ni redistribucion.
- No hay informacion sobre sesgos, riesgo de alucinacion o errores sistematicos en la estimacion de profundidad.
- No se documentan limitaciones de contexto, idioma ni dominio de aplicacion.
- El repositorio no permite auditar el modelo: no es posible verificar arquitectura, parametros ni procedencia de los datos de entrenamiento.
- El mecanismo de cifrado se describe explicitamente como una medida disuasoria frente a la descarga directa, no como una proteccion criptografica real, ya que el cliente acaba recibiendo los pesos en claro.
- La fecha de creacion indicada (2026-10-28) resulta anomala y conviene tratarla con cautela.
- Uso en produccion desaconsejado sin documentacion adicional del autor sobre el modelo subyacente y su licencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/androidli/depthsnap-models
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios de codigo o demos.
