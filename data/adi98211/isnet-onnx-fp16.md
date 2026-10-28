# ADI98211/isnet-onnx-fp16

## Resumen

`ADI98211/isnet-onnx-fp16` es un repositorio de distribución que contiene un único archivo, `isnet_fp16.onnx`, una exportación a ONNX en precisión FP16 de una red IS-Net destinada a segmentación de primer plano y eliminación de fondo (matting). No es un modelo de lenguaje ni un modelo generativo: recibe una imagen RGB normalizada y devuelve una máscara de probabilidad de primer plano que la aplicación debe reescalar y componer con el canal alfa. El repositorio lo publica el usuario ADI98211 y, según su propia model card, el archivo procede de un proyecto de referencia local (Aarelier) y se integró después en la función de recorte de StarFlame; el autor declara explícitamente que no representa una publicación oficial de IS-Net.

El interés práctico del artefacto es su formato: un ONNX de 88,15 MB (equivalente aproximado a 44,1 millones de parámetros en FP16, estimación derivada del tamaño de archivo) con entrada fija `[1, 3, 1024, 1024]` en Float32, pensado para ejecutarse con ONNX Runtime Web sobre WebGPU con soporte `shader-f16` y con retroceso a WASM. Eso lo hace candidato a flujos de recorte que corren íntegramente en el navegador o en local, sin servicio externo.

Ahora bien, la ficha llega con varias advertencias importantes: el repositorio tiene 0 descargas y 0 likes, la licencia no está declarada, el autor no ha verificado la versión de los pesos originales ni los parámetros de exportación, y no se ha reejecutado ninguna evaluación de calidad sobre el archivo. Cualquier uso en producción exige verificar primero la procedencia y los términos de la licencia del IS-Net original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | IS-Net (red de segmentación dicotómica) exportada a ONNX; la variante y el checkpoint originales no están documentados en la model card |
| Parámetros totales | No disponible de forma oficial. Estimación a partir del tamaño del archivo FP16 (88.152.708 bytes): ~44,1 M de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Entrada de imagen fija `[1, 3, 1024, 1024]` (NCHW) |
| Tipos de cuantización | FP16 en los pesos (archivo ONNX); la entrada sigue siendo Float32 según la documentación de integración del autor |
| Idiomas soportados | `zh` en los metadatos del repositorio; el modelo no procesa texto, por lo que el campo no tiene efecto funcional |
| Licencia | No disponible (sin declarar; el autor indica que no ha verificado la licencia del peso original) |
| Formato de pesos | ONNX (`.onnx`), un único archivo de 88,15 MB |
| Pipeline | `image-segmentation` |
| Entrada | RGB, Float32, NCHW, `[1, 3, 1024, 1024]`; normalización `(pixel - 128) / 256` con pixel en 0–255 |
| Salida | Máscara de probabilidad de primer plano (requiere reescalado al tamaño original y composición alfa en la aplicación) |
| Checksum | SHA256 `2eb4b5dda7ec41c617e59706e5aafa1f978c9a5f983d2518d9f0ae4d6eb04f20` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste. Lo único verificable es el nombre y los tags: IS-Net, segmentación de primer plano, eliminación de fondo. IS-Net es una familia de redes de segmentación dicotómica de alta precisión (DIS) caracterizada por producir máscaras de muy alta resolución con bordes finos; se trata de una red convolucional encoder-decoder, no de un transformer ni de un modelo híbrido SSM. Cualquier detalle adicional sobre bloques, funciones de pérdida o número de tokens de entrenamiento no está disponible en la información proporcionada y no debe darse por supuesto.

Tampoco hay información sobre el pipeline de exportación: el autor declara que no ha verificado la versión de los pesos originales, el script de conversión, los parámetros de exportación ni si el archivo es equivalente a algún peso oficial. No consta que se haya aplicado RLHF, DPO ni ninguna etapa de alineación (no aplica a un modelo de segmentación), y no se ha ejecutado una reevaluación de la calidad de inferencia tras la conversión a FP16. La única "innovación" documentada es de tipo operativo: empaquetar el modelo en FP16 para que ONNX Runtime Web pueda aprovechar `shader-f16` en WebGPU y degradar a WASM cuando no esté disponible.

## Capacidades

- Segmentación de primer plano: genera una máscara de probabilidad por píxel que separa el sujeto principal del fondo.
- Eliminación de fondo para figuras y objetos: la model card menciona personas, productos y otros sujetos como casos previstos.
- Entrada de imagen a resolución fija 1024 × 1024, lo que da máscaras de alta resolución antes del reescalado.
- Ejecución en navegador mediante ONNX Runtime Web (WebGPU con `shader-f16`, retroceso a WASM) o en cualquier runtime compatible con el grafo ONNX.
- Integración en flujos locales de automatización: lectura de imagen, normalización, inferencia, reescalado de máscara, composición alfa y exportación.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes, modo thinking, visión descriptiva ni audio.
- No genera PNG con transparencia por sí mismo: la composición y la exportación son responsabilidad de la aplicación.
- No incluye, como parte del modelo, funciones de desborde de color, erosión de borde, umbrales de transparencia ni presets de recorte; son post-proceso de la aplicación.

## Casos de uso

- Recorte de catálogo en comercio electrónico: procesar por lotes fotografías de producto a 1024 × 1024, obtener la máscara y componer sobre fondo blanco o transparente para fichas de marketplace. La entrada fija simplifica el pipeline y el tamaño de 88 MB permite procesar en CPU sin infraestructura GPU dedicada.
- Editor de imágenes en navegador: integrar el ONNX con ONNX Runtime Web y WebGPU para ofrecer "quitar fondo" sin subir la imagen a un servidor, lo que reduce coste de ancho de banda y evita enviar contenido del usuario a terceros. El retroceso a WASM cubre equipos sin `shader-f16`.
- Sustitución de fondo en videoconferencia o webcam: usar la máscara por fotograma como entrada de un compositor alfa; requiere medir latencia real en el dispositivo objetivo, dato que no está publicado.
- Preprocesado de datasets de visión: generar máscaras preliminares para etiquetado asistido y revisión humana posterior, aceptando que en fondos complejos o con objetos translúcidos harán falta correcciones manuales.
- Estudio fotográfico y retoque: Recortar retratos para composiciones, con la advertencia de que el propio autor señala problemas en cabello fino y bordes; el flujo realista incluye un paso de refinado de borde en la aplicación.
- Automatización local por línea de comandos: script que recorra un directorio de imágenes, ejecute el ONNX con onnxruntime y escriba PNG con alfa, sin dependencias de servicios en la nube ni de GPU.
- Integración en herramientas de diseño o generación de materiales: convertir el modelo en un paso de un pipeline mayor (plantillas, banners, avatares) donde la máscara se reutiliza para sombras y ajustes de color.
- Recorte de documentos y fotos de identidad: separar la persona del fondo para fondos uniformes de formularios; funciona mejor con fondos simples y sujetos bien iluminados, según las limitaciones declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica explícitamente que el proceso de publicación no incluyó una reevaluación de la calidad de inferencia, y no se proporcionan métricas de IoU, S-measure, F-measure, MAE ni comparaciones con otros modelos. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan unos 88 MB en FP16; contando activaciones a 1024 × 1024, una estimación razonable es de 2 a 4 GB de memoria de trabajo. Es una estimación por tamaño de entrada y arquitectura típica de encoder-decoder, no un dato medido ni publicado.
- GPU recomendadas: cualquier GPU de consumo reciente sirve; el modelo es pequeño y no necesita A100 ni H100. Una RTX 3060/4060 o superior deja margen sobrado; las GPU de datacenter solo tendrían sentido para servir muchas peticiones en paralelo.
- ¿Cabe en GPU de consumo? Sí, con holgura, incluidas GPU de portátil con 4-6 GB de VRAM. También es viable en CPU exclusivamente, a costa de mayor latencia.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web (WebGPU con `shader-f16` o WASM), y cualquier runtime que acepte el grafo ONNX. No se distribuyen pesos en formato GGUF, por lo que llama.cpp u Ollama no aplican; vLLM y TGI tampoco, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del backend (WebGPU frente a WASM), del dispositivo y de si se procesa una imagen por llamada, ya que la forma de entrada documentada es `[1, 3, 1024, 1024]`.
- Nota de integración: el archivo es FP16, pero la entrada documentada es Float32; no debe cambiarse el tipo de entrada solo por el nombre del archivo.

## Comparativa con modelos similares

| Modelo | Tarea | Formato disponible | Entrada típica | Licencia | Notas |
|---|---|---|---|---|---|
| isnet-onnx-fp16 (este repositorio) | Segmentación de primer plano / DIS | ONNX FP16, 88,15 MB | Fija 1024 × 1024 | No disponible | Procedencia y versión de pesos no verificadas; 0 descargas |
| IS-Net original (DIS) | Segmentación dicotómica de alta precisión | Pesos PyTorch en el repositorio oficial | Configurable | No verificada en esta ficha | Referencia académica del método; este ONNX no se declara equivalente a ningún peso oficial |
| U²-Net / U²-Net-lite | Detección de objetos salientes y matting | PyTorch, ONNX y ports comunitarios | Configurable | No verificada en esta ficha | Modelo más antiguo y ligero; suele requerir post-proceso para bordes finos |
| MODNet | Matting de retrato en tiempo real | PyTorch, ONNX comunitario | Configurable | No verificada en esta ficha | Orientado a vídeo y retratos; no está pensado para objetos genéricos |
| BiRefNet | Segmentación de alta resolución | PyTorch, weights en HuggingFace | Configurable | No verificada en esta ficha | Alternativa más moderna y pesada; necesita GPU para uso cómodo |

Los datos de licencia y de parámetros de los modelos alternativos no se han verificado en el marco de esta ficha y deben contrastarse en sus repositorios oficiales antes de decidir. No hay cifras de rendimiento comparadas disponibles para este ONNX.

## Limitaciones y advertencias

- Licencia sin declarar: el autor no ha verificado la licencia del peso original, por lo que el uso comercial y la redistribución no están cubiertos por ningún término explícito. Es un bloqueo potencial para producción.
- Procedencia no verificada: se desconoce la versión exacta del checkpoint de IS-Net, el script de conversión y los parámetros de exportación; el autor no afirma equivalencia con ningún peso oficial.
- Sin evaluación de calidad: no se ha reejecutado inferencia ni medido métricas tras la conversión a FP16, y no hay benchmarks publicados.
- Fallos conocidos declarados por el autor: fondos complejos, cabello fino, objetos semitransparentes y casos en los que primer plano y fondo tienen colores próximos producen recortes incompletos, restos de fondo o bordes defectuosos.
- Resolución fija: la entrada es 1024 × 1024 y la máscara debe reescalarse al tamaño original; en imágenes muy grandes o con detalles finos se pierde precisión en el borde.
- Sin post-proceso incluido: desborde de color, erosión de borde, umbrales de transparencia y presets son responsabilidad de la aplicación; el modelo no genera PNG transparentes.
- Metadatos de idioma engañosos: figura `zh` porque el autor documenta en chino, pero el modelo no procesa texto; no debe interpretarse como un modelo multilingüe.
- Sin datos de sesgo: no hay información sobre sesgos de representación por etnia, edad, tipo de cuerpo o iluminación, un aspecto relevante en matting de personas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo análogo de "inventar" región de primer plano en zonas ambiguas.
- Madurez del repositorio: 0 descargas, 0 likes, creado y actualizado el mismo día; sin issues ni comunidad que haya validado el archivo. Verificar el SHA256 antes de usarlo.
- Dependencia del runtime: el rendimiento en navegador depende de la versión de ONNX Runtime, del soporte de `shader-f16` y del dispositivo; hay que validar en el entorno objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ADI98211/isnet-onnx-fp16
- Checksum SHA256 del archivo: `2eb4b5dda7ec41c617e59706e5aafa1f978c9a5f983d2518d9f0ae4d6eb04f20`
- Paper de IS-Net, blog del autor, repositorio de código y demo: no disponibles en la información proporcionada. El autor tampoco enlaza el proyecto Aarelier ni StarFlame.
