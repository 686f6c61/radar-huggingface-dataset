# minimalifestyle/paddleocr-vl-1.6-q8-gguf

## Resumen

PaddleOCR-VL 1.6 es un modelo multimodal de reconocimiento óptico de caracteres (OCR) y comprensión de documentos desarrollado por PaddlePaddle. Esta ficha concreta documenta la cuantización Q8_0 en formato GGUF publicada por el usuario minimalifestyle, pensada para su ejecución con llama.cpp en entornos con recursos limitados, incluidos dispositivos móviles. El modelo combina un lector de imágenes (proyector multimodal) con un modelo de lenguaje de aproximadamente 466 millones de parámetros, lo que lo sitúa en la gama ligera y permite inferencia en hardware de consumo.

La relevancia de esta variante radica en su empaquetado: tanto el modelo de lenguaje como el proyector multimodal están comprimidos a Q8_0, lo que reduce el peso total a alrededor de 1,1 GB en el repositorio y facilita el despliegue local sin dependencia de servicios en la nube. El autor indica que esta versión se emplea dentro de una aplicación iOS (OMOI) mediante llama.rn para leer líneas de texto de documentos fotografiados y escaneados directamente en el dispositivo.

Se trata, por tanto, de una redistribución cuantizada del modelo original de PaddlePaddle, sin reentrenamiento ni ajuste fino adicional, publicada bajo licencia Apache 2.0. Su utilidad principal es el OCR en local con latencia baja y privacidad de datos, a costa de las limitaciones propias de un modelo de este tamaño y de la ausencia de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (modelo de lenguaje + proyector multimodal para imágenes); detalles internos no disponibles |
| Parametros totales | 466.654.208 (modelo de lenguaje) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje y proyector multimodal) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: modelo de lenguaje y mmproj) |

## Arquitectura y entrenamiento

El modelo base PaddleOCR-VL 1.6 es un sistema multimodal orientado a OCR y comprensión de documentos que combina un codificador visual (proyector multimodal, denominado "image reader" en la model card) con un modelo de lenguaje de 466 millones de parámetros. La información disponible no detalla la arquitectura interna del transformer, la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

La variante documentada aquí no introduce cambios en los pesos más allá de la cuantización: se parte de la conversión BF16 publicada por EstevaoNaval y se aplica `llama-quantize` con llama.cpp 0.8.0 (build 11960, commit 8642541b2) sobre ambos ficheros, verificando los SHA-256 contra el repositorio de origen. No hay ajuste fino ni modificación adicional. La innovación práctica es el empaquetado dual en Q8_0 (modelo y mmproj) que permite ejecutar el pipeline completo de OCR con llama.cpp usando `llama-server` con `--mmproj`, `-ngl 99` y `-fa on`.

## Capacidades

- Reconocimiento de texto en imágenes: lectura de líneas de texto en documentos fotografiados y escaneados, con prompt `OCR:` y decodificación greedy (`--temp 0`).
- Procesamiento multimodal: integración de imagen y texto mediante el proyector multimodal empaquetado por separado.
- Comprensión de documentos: orientado a informes, formularios y material escaneado; el autor menciona pruebas sobre informes de laboratorio sintéticos.
- Ejecución en dispositivo: compatible con llama.cpp y con el binding llama.rn para aplicaciones iOS.
- Inferencia determinista: el uso recomendado con temperatura 0 favorece salidas reproducibles en tareas de extracción.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modos especiales (thinking, audio, visión general): solo lectura de imágenes para OCR; no se documentan otras capacidades.

## Casos de uso

- Digitalización de documentos en el móvil: la aplicación puede capturar una foto de un documento y ejecutar el modelo en local mediante llama.rn, extrayendo las líneas de texto sin enviar la imagen a un servidor, lo que preserva la privacidad del usuario.
- Extracción de datos de informes de laboratorio: el autor cita pruebas sobre informes sintéticos; el modelo puede leer los campos de texto de estos documentos para su posterior estructuración en una base de datos.
- Escaneo de facturas y recibos: con decodificación greedy y prompt `OCR:`, el modelo extrae las líneas de texto de tickets y facturas fotografiados, adecuado para aplicaciones de contabilidad personal en dispositivos con recursos limitados.
- Digitalización de archivos históricos o administrativos: al ejecutarse con llama.cpp en CPU o GPU modesta, permite procesar lotes de documentos escaneados en equipos sin aceleradores de gama alta.
- OCR embebido en aplicaciones de escritorio: integración con `llama-server` para ofrecer un servicio local de OCR a otras herramientas del sistema, sin dependencia de APIs externas.
- Procesamiento por parejas de lectores: el autor indica que, emparejado con un segundo lector, obtiene las mismas lecturas que la versión MLX de 8 bits; útil en pipelines de verificación cruzada para reducir errores de extracción.
- Prototipado e investigación en OCR ligero: al ocupar alrededor de 1,1 GB en Q8_0, sirve como banco de pruebas para evaluar técnicas de cuantización y despliegue en dispositivos móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una comparación cualitativa con la versión MLX de 8 bits del mismo modelo sobre informes de laboratorio sintéticos, sin cifras numéricas.

## Requisitos de hardware

- VRAM estimada: el modelo de lenguaje Q8_0 ocupa 498.316.256 bytes (unos 475 MiB) y el proyector multimodal 597.566.400 bytes (unos 570 MiB); en total, alrededor de 1 GB de pesos, más el overhead de contexto y de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para cargar ambos ficheros con `-ngl 99`; no se especifican modelos concretos en la información disponible.
- GPU de consumo: cabe en tarjetas de gama de entrada y en GPUs integradas con suficiente memoria compartida; también puede ejecutarse en CPU.
- Despliegue: llama.cpp (versión 0.8.0, build 11960 o superior), mediante `llama-server` con `--mmproj`; también a través de llama.rn en iOS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PaddleOCR-VL 1.6 Q8_0 GGUF (esta ficha) | 466.654.208 (LM) | No disponible | GGUF Q8_0 | Apache 2.0 | Cuantización para llama.cpp, incluye mmproj Q8_0 |
| PaddlePaddle/PaddleOCR-VL-1.6 (original) | 466.654.208 (LM) | No disponible | No disponible | Apache 2.0 | Modelo base sin cuantizar |
| EstevaoNaval/PaddleOCR-VL-1.6-GGUF | 466.654.208 (LM) | No disponible | GGUF (BF16) | Apache 2.0 | Conversión BF16 de la que deriva esta cuantización |
| Versión MLX 8 bits del mismo modelo | 466.654.208 (LM) | No disponible | MLX | Apache 2.0 | Citada por el autor como referencia cualitativa |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de OCR de otros desarrolladores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo de OCR, los sesgos se manifestarían principalmente en la calidad de lectura según tipografía, idioma y calidad de imagen.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en tareas de extracción de texto puede producir lecturas plausibles pero incorrectas, por lo que se recomienda verificación o el emparejamiento con un segundo lector que sugiere el autor.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados; no debe asumirse cobertura multilingüe sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio solo redistribuye una copia cuantizada; deben respetarse los términos y atribuciones del modelo original de PaddlePaddle.
- Caveat de producción: la cuantización Q8_0 puede degradar ligeramente la precisión frente a BF16; el autor solo reporta equivalencia cualitativa con la versión MLX de 8 bits en un conjunto sintético, sin métricas publicadas.
- Dependencia de versión: el uso requiere llama.cpp 0.8.0 (build 11960) o compatible, con soporte de `--mmproj` y `-fa on`; versiones anteriores pueden no cargar el proyector multimodal.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia comunitaria de validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/minimalifestyle/paddleocr-vl-1.6-q8-gguf
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Conversión BF16 de origen: https://huggingface.co/EstevaoNaval/PaddleOCR-VL-1.6-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn: https://github.com/mybigday/llama.rn
