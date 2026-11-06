# Reza2kn/Bina-0.4-Koochik-ONNX-WebGPU-INT4

## Resumen

Bina 0.4 Koochik ONNX WebGPU INT4 es una derivacion cuantizada del modelo de reconocimiento optico de caracteres (OCR) Bina 0.4 Koochik, desarrollado por el usuario de Hugging Face Reza2kn. El modelo base es una adaptacion de la arquitectura NVIDIA Nemotron-3.5-Parse, un transformer multimodal de tipo image-to-text orientado a la transcripcion de documentos. Esta version concreta empaqueta el modelo en formato ONNX con cuantizacion GPTQ INT4 para ejecutarse directamente en el navegador mediante WebGPU y ONNX Runtime Web, sin necesidad de subir imagenes ni texto a un servidor.

El paquete esta anclado al checkpoint 18.404 del modelo base y conserva sus 630.800.496 parametros unicos. La cuantizacion afecta a 170 matrices lineales, que se almacenan con codigos simetricos INT4 de grupo 32 y escalas FP32; las tablas de embedding y salida, posiciones, convoluciones, normas y sesgos mantienen mayor precision. El paquete completo de runtime ronda los 770 MB, lo que lo hace viable para descarga inicial en escritorio y ejecucion local en GPU de consumo.

Su relevancia radica en el despliegue: permite OCR en dispositivo con privacidad total (las imagenes nunca salen del navegador), soporte para persa e ingles, y una validacion publicada sobre un conjunto congelado de 64 imagenes que alcanza un 98,8603 % de concordancia de caracteres NFC frente a la fuente corregida en BF16. Esta orientado a documentos de una sola pagina en formato PNG, JPG o WebP, no a PDF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-to-text (base: NVIDIA Nemotron-3.5-Parse) |
| Parametros totales | 630.800.496 (parametros unicos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens por region (decodificacion codiciosa) |
| Tipos de cuantizacion | GPTQ INT4 simetrico, grupo 32, escalas FP32; excepciones en mayor precision |
| Idiomas soportados | persa (fa), ingles (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | ONNX (componentes divididos) + runtime WASM + tokenizer |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura de NVIDIA Nemotron-3.5-Parse, un transformer multimodal que combina un codificador de vision con atencion por tiles de consulta (query-tiled vision attention, que conserva todas las claves) y un decodificador de lenguaje que genera la transcripcion token a token. Esta version no modifica la arquitectura ni el entrenamiento principal del modelo original: solo aplica cuantizacion y empaquetado para navegador.

La cuantizacion se realizo con GPTQ simetrico INT4 sobre 170 matrices lineales, calibrado con 64 regiones exclusivamente de entrenamiento usando secuencias maestras frescas del checkpoint 18.404. El conjunto de calibracion es disjunto respecto al conjunto de cualificacion final. El paquete original empaquetado ocupa 533.891.055 bytes, lo que equivale a unos 6,771 bits efectivos por parametro original incluyendo excepciones. El kernel JSEP de ONNX Runtime Web redondea los pesos INT4 desquantizados a BF16 con redondeo ties-to-even y opera en FP32. La decodificacion es codiciosa con RP1.1 y reintento por resolucion de origen. No se declara ningun uso de BitNet ni una aceleracion universal.

## Capacidades

- Reconocimiento optico de caracteres (OCR) de imagenes de documentos en persa e ingles.
- Transcripcion de texto a formato estructurado con marcas (markup), aunque el markup no esta cualificado por separado en el corpus.
- Inferencia 100 % en dispositivo mediante WebGPU, sin subida de imagenes ni texto.
- Soporte de imagenes PNG, JPG y WebP de una sola pagina (no PDF).
- Reutilizacion de sesiones: cuatro sesiones ONNX permanecen cargadas entre imagenes, reseteando solo el estado KV del decodificador por imagen.
- Gestion de memoria en navegador: boton Stop que conserva sesiones y boton Unload que libera el worker.
- No dispone de tool calling, function calling, modo thinking, audio ni capacidades de agente multi-paso.

## Casos de uso

- Digitalizacion de documentos personales con privacidad: el modelo procesa facturas, cartas o formularios persas directamente en el navegador del usuario, sin enviar imagenes a ningun servidor, lo que resulta adecuado para datos sensibles o regulados.
- OCR en aplicaciones web sin backend: integracion mediante el runtime ONNX Runtime Web y el servidor local `serve.py`, permitiendo desplegar una herramienta de transcripcion como sitio estatico con cabeceras COOP/COEP.
- Procesamiento por lotes en escritorio: carga de varias imagenes sucesivas aprovechando que las cuatro sesiones permanecen residentes, con un coste de inicializacion unico de aproximadamente 770 MB de descarga.
- Extraccion de texto de capturas y escaneos en persa para pipelines de datos: transcripcion de imagenes de una pagina a texto plano o JSON crudo descargable, util para alimentar sistemas de busqueda o archivo.
- Herramientas educativas o de accesibilidad: transcripcion local de material escaneado en persa e ingles sin dependencia de servicios en la nube, con latencia de aproximadamente 2,65 s para una imagen de 400x104 y 34 tokens generados en Apple M2.
- Prototipado e investigacion en OCR multimodal: el paquete incluye `qualification.json` y el directorio `validation/` con evidencia agregada y sintetica, lo que facilita reproducir la evaluacion y comparar variantes de cuantizacion.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Concordancia de caracteres NFC (pooled) frente a fuente BF16 corregida | 98,8603 % | Apple M2 / Chrome 156 WebGPU, 64 imagenes / 71 regiones |
| Concordancia de caracteres NFC (pooled) frente a fuente original de pagina completa | 97,3635 % | Mismo conjunto congelado |
| Salidas truncadas o repetidas | 0 | 71 regiones |
| Creaciones de sesion | 4 | 71 regiones |
| Cargas en caliente del modelo | 0 | 71 regiones |
| Tensores de peticion vivos tras finalizar | 0 | 71 regiones |
| Latencia mediana en caliente (end-to-end) | 2,650 s | Apple M2, PNG 400x104, 34 tokens generados, 3 generaciones repetidas |

La metrica se define como `1 - ediciones Levenshtein NFC agrupadas / caracteres fuente NFC agrupados`, sin recorte. Mide concordancia con la fuente, no precision humana de OCR ni una garantia por entrada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Descarga completa del runtime: aproximadamente 770,2 MB (decimal), incluyendo excepciones de mayor precision, componentes divididos, tokenizer, posiciones y archivos de runtime.
- VRAM estimada: no disponible de forma explicita; el paquete INT4 y las excepciones en mayor precision condicionan el consumo, que debe caber en la memoria de la GPU del navegador.
- GPU recomendadas: validado en Apple M2 con Chrome 156 y WebGPU. Se recomienda Chrome o Edge de escritorio actuales con WebGPU; otras GPU de escritorio con WebGPU no estan cualificadas explicitamente.
- GPU de consumo: viable en Apple M2 segun la validacion publicada; los limites de memoria GPU en movil no estan cualificados.
- Opciones de despliegue: ONNX Runtime Web con el runtime parcheado incluido (obligatorio, ya que el ORT Web generico puede elegir otra precision y divergir), servidor local `serve.py` en el puerto 8123, y despliegue estatico con HTTPS y cabeceras COOP/COEP.
- Navegadores no cualificados: otros navegadores, paridad WebAssembly, ONNX CUDA y sherpa-onnx quedan fuera de esta release WebGPU.
- Latencia: 2,650 s de mediana en caliente para el demo corto de 34 tokens en Apple M2; no se ofrecen cifras de throughput de corpus ni de movil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Bina 0.4 Koochik ONNX WebGPU INT4 | 630.800.496 | 2048 tokens/region | ONNX INT4 + WASM | OpenMDW 1.1 | OCR en navegador, persa/ingles |
| Reza2kn/Bina-0.4-Koochik (base) | 630.800.496 | no disponible | safetensors (presumible) | OpenMDW 1.1 | OCR, modelo padre sin cuantizar |
| NVIDIA Nemotron-3.5-Parse | no disponible | no disponible | no disponible | no disponible | Arquitectura origen del modelo padre |

No se dispone de datos de benchmarks comparativos con otras alternativas de OCR en la informacion proporcionada.

## Limitaciones y advertencias

- La validacion se limita a un conjunto congelado de 64 imagenes y 71 regiones; no constituye una garantia por entrada ni una medida de precision humana de OCR.
- Solo soporta imagenes PNG, JPG y WebP de una pagina; no procesa PDF.
- Limitaciones reconocidas: logos pequenos, texto decorativo y escaneos complejos.
- El markup generado no esta cualificado por separado en el corpus.
- Requiere el runtime parcheado incluido; usar ONNX Runtime Web generico puede producir tokens divergentes por diferencias de precision.
- Solo cualificado en Chrome/Edge de escritorio con WebGPU; navegadores alternativos, moviles con limites de memoria GPU, WebAssembly y ONNX CUDA no estan validados.
- El despliegue en produccion requiere HTTPS y cabeceras COOP/COEP; HTTP solo funciona en localhost.
- Las latencias publicadas corresponden a un demo corto y no deben interpretarse como throughput de corpus ni como garantia de velocidad.
- La licencia OpenMDW 1.1 debe conservarse junto con los avisos de ONNX Runtime y terceros; conviene revisar sus terminos para uso comercial.
- Riesgo de sesgo y alucinacion: no se documentan sesgos especificos ni tasas de alucinacion en la informacion disponible; al ser un modelo OCR, el riesgo principal es la transcripcion incorrecta de caracteres, no la generacion libre de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-ONNX-WebGPU-INT4
- Modelo base: https://huggingface.co/Reza2kn/Bina-0.4-Koochik
- Space publico: https://huggingface.co/spaces/Reza2kn/Bina-0.4-Koochik
- Aplicacion independiente: https://reza2kn-bina-0-4-koochik.static.hf.space/index.html
- Interfaz de referencia: https://persianvlm.com/ocr
