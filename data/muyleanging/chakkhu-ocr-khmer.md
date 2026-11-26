# muyleanging/Chakkhu-OCR-Khmer

## Resumen
Chakkhu-OCR-Khmer (ចក្ខុ, "ojo" en jemer) es un modelo de reconocimiento óptico de caracteres especializado en líneas de texto en jemer e inglés, desarrollado por Ing Muyleang (usuario muyleanging). Resuelve el problema del OCR en jemer, un idioma con escritura compleja basada en clústeres de letras (con subíndices y vocales dibujadas a la izquierda) que los motores genéricos como Tesseract manejan con tasas de error superiores al 20%. El modelo es deliberadamente compacto, con 18,56 millones de parámetros, lo que permite inferencia en CPU a unos 140 ms por línea.

La arquitectura es un transformer con decodificación CTC que emite clústeres completos de letras jemer como una sola unidad, garantizando que los subíndices y vocales aparezcan en el orden mecanografiado correcto. Se acompaña de un verificador ortográfico de palabras en jemer (basado en un modelo de lenguaje de clústeres, sin red neuronal adicional) que corrige las hipótesis del lector y revalida cada corrección contra la imagen. El modelo reporta una tasa de error de caracteres (CER) del 3,60% en el benchmark KHOB completo (4.018 líneas reales nunca vistas en entrenamiento), con una confianza calibrada por línea.

La relevancia actual radica en su licencia Apache 2.0 y en que se ha entrenado exclusivamente con datos cuya licencia permite cualquier uso, a diferencia de alternativas más precisas como Anaksor-OCR, que incluyen datos sin licencia o de solo investigación. Esto lo hace apto para despliegue comercial en digitalización de documentos, lectura de carteles y procesamiento de formularios en jemer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con decodificación CTC |
| Parámetros totales | 18.562.218 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de línea de texto, no de secuencia larga) |
| Tipos de cuantización | ONNX int8 disponible (39 MB); pesos PyTorch en safetensors |
| Idiomas soportados | jemer (km), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX int8 |

## Arquitectura y entrenamiento
El modelo es un transformer con cabeza de decodificación CTC (Connectionist Temporal Classification) orientado a reconocimiento de líneas de texto. La innovación principal es que emite clústeres completos de letras jemer como un único paso de decodificación (por ejemplo, ស្ត្រី se genera en un solo paso), lo que preserva el orden tipográfico correcto de subíndices y vocales dibujadas a la izquierda, un problema recurrente en OCR jemer. El modelo incorpora una puntuación de confianza (0–1) por línea para facilitar la revisión humana selectiva.

El entrenamiento se realizó exclusivamente con datos cuya licencia permite cualquier uso, según declara el autor. La versión full6 añadió tres horas adicionales de entrenamiento con carteles en inglés, líneas de correo electrónico, web y teléfono, códigos de referencia jemer (លេខ : ១១៤ / ២១ សជណ.អ) y letras visualmente similares entre jemer y latín. No se especifica el número total de tokens ni la composición exacta del dataset. El verificador ortográfico se construye a partir del texto limpio de entrenamiento como un modelo de lenguaje de clústeres de letras que opera en CPU sin modelo adicional, y cada corrección propuesta se revalida contra la imagen.

## Capacidades
- Reconocimiento de líneas de texto en jemer e inglés desde documentos, páginas impresas antiguas, mecanografiados, escaneos, fotos de móvil, capturas de pantalla, imágenes de chat y carteles.
- Escritura de clústeres completos de letras jemer en orden tipográfico correcto (subíndices y vocales izquierdas).
- Verificación ortográfica integrada en jemer mediante un modelo de lenguaje de clústeres que propone correcciones y las revalida contra la imagen.
- Puntuación de confianza (0–1) por línea para decidir qué líneas requieren revisión humana.
- Procesamiento de documentos completos: PDF o foto a Word, y tablas a Excel/CSV con números tratados como números.
- Reconocimiento de líneas mixtas jemer-inglés (por ejemplo, វគ្គ English for Kids ម៉ោង 3PM).
- Reconocimiento de correos electrónicos, URLs, teléfonos y códigos de referencia jemer.
- Modo "Photo" para fotos de calle completas: localización del texto y lectura posterior.
- No se menciona soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo OCR puro de imagen a texto.

## Casos de uso
- Digitalización de documentos administrativos jemer: el modelo convierte PDF o fotos de páginas en Word, con confianza por línea para que un operador revise solo las líneas dudosas; su CER del 1,70% en documentos limpios lo hace adecuado para archivística.
- Extracción de tablas a Excel/CSV: procesa tablas con números como números, útil para digitalizar inventarios, facturas y registros contables en jemer sin transcripción manual.
- Lectura de carteles y señalización urbana: el modo Photo localiza y lee texto en fotos de calle completas (22,1% CER en 120 fotos de calle de KHOB), adecuado para aplicaciones de accesibilidad o mapas.
- Procesamiento de capturas de chat y Messenger: con un CER del 2,11% en líneas enviadas por Messenger, sirve para extraer pedidos, direcciones y datos de conversaciones comerciales.
- Reconocimiento de contactos y códigos en formularios: con un 94% de líneas completamente correctas en correos, webs y teléfonos dibujados con fuentes no vistas, es apto para digitalizar tarjetas de visita y formularios de registro.
- Despliegue en dispositivos sin GPU: con 18,6M de parámetros, ~140 ms por línea en CPU de portátil y una versión ONNX int8 de 39 MB, puede ejecutarse en entornos de borde, portátiles de campo o servidores sin acelerador.
- Revisión asistida de documentos históricos mecanografiados: la confianza por línea y el verificador ortográfico permiten priorizar la corrección humana en archivos gubernamentales antiguos.

## Benchmarks y rendimiento
Resultados declarados por el autor en el benchmark KHOB (4.018 líneas reales, nunca vistas en entrenamiento):

| Modelo | Datos de entrenamiento | CER (%) ↓ | Líneas totalmente correctas (%) ↑ |
|---|---|---|---|
| Tesseract 5 (khm+eng, mejor) | — | 20,55 | 16,5 |
| Netra-OCR | incluye datos solo investigación | 5,87 | 56,9 |
| Chakkhu full5 + verificador (versión anterior) | solo licencias limpias | 3,58 | 64,7 |
| Chakkhu full6 (solo lector) | solo licencias limpias | 3,89 | 61,0 |
| Chakkhu full6 + verificador | solo licencias limpias | 3,60 | 65,1 |
| Anaksor-OCR (rec-v4) | incluye datos sin licencia | 2,39 | 72,1 |

Desglose por tipo de imagen (CER %):

| Tarea KHOB | Netra-OCR | full5 + verificador | full6 | full6 + verificador | Anaksor-OCR |
|---|---|---|---|---|---|
| Documento limpio | 5,02 | 1,75 | 2,01 | 1,70 | 1,13 |
| Enviado por Messenger | 6,16 | 2,14 | 2,47 | 2,11 | 1,38 |
| Escaneado | 4,55 | 2,02 | 2,28 | 2,02 | 1,32 |
| Escaneado con móvil | 4,13 | 2,42 | 3,08 | 2,54 | 1,45 |
| Calle, día | 5,78 | 4,25 | 4,62 | 4,39 | 2,15 |
| Calle, noche | 10,64 | 10,23 | 10,11 | 10,17 | 7,95 |
| Líneas cortas (≤10 caracteres, 455 líneas) | — | 8,42 | 8,25 | 7,88 | — |
| Solo inglés/números (474 líneas) | — | 18,72 | 18,72 | 18,35 | — |

Prueba adicional con 200 líneas dibujadas con fuentes del sistema Mac no vistas en entrenamiento (líneas totalmente correctas):

| Tipo de línea | full5 (%) | full6 (%) |
|---|---|---|
| Carteles en inglés | 88 | 88 |
| Correo/web/teléfono | 86 | 94 |
| Códigos de referencia jemer | 100 | 98 |
| Jemer + inglés en una línea | 92 | 92 |
| Total 200 líneas | 91,5 | 93,0 |

En fotos de calle completas (modo Photo, 120 fotos de KHOB): 22,1% de errores de carácter y 91,8% de líneas localizadas. Latencia declarada: ~140 ms por línea en CPU de portátil y ~20 ms en GPU.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 18,6M de parámetros; la versión ONNX int8 ocupa 39 MB en disco.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor reporta ~20 ms por línea en GPU, sin especificar modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Despliegue: PyTorch (librería declarada), ONNX Runtime para la versión int8 sin dependencia de PyTorch, y API gratuita en el Space del autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo OCR de este tamaño).
- Latencia y throughput: ~140 ms por línea en CPU de portátil y ~20 ms por línea en GPU, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER KHOB (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chakkhu-OCR-Khmer (full6 + verificador) | 18,56M | no disponible | 3,60 | Apache 2.0 | Hugging Face, ONNX, demo y API |
| Netra-OCR | no disponible | no disponible | 5,87 | no disponible | no disponible |
| Anaksor-OCR (rec-v4) | no disponible | no disponible | 2,39 | no disponible (entrenado con datos sin licencia) | Hugging Face (Sokheng/anaksor-ocr) |
| Tesseract 5 (khm+eng) | no disponible | no disponible | 20,55 | Apache 2.0 | Código abierto |

Chakkhu destaca por su licencia permisiva y por entrenarse solo con datos de licencia limpia, a costa de una precisión inferior a Anaksor-OCR, que lidera el benchmark pero emplea datos sin licencia o de solo investigación.

## Limitaciones y advertencias
- El CER en líneas de solo inglés y números es alto (18,35%), muy superior al de líneas en jemer; no es un OCR inglés generalista.
- El rendimiento en calles nocturnas es débil (10,17% CER con verificador), con poca mejora frente a versiones anteriores.
- En fotos de calle completas el error sube al 22,1% y el verificador no se aplica en modo Photo.
- La versión full6 empeora ligeramente frente a full5 en páginas escaneadas con móvil (3,08% vs 2,42% sin verificador) y en líneas de calle diurnas.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (verified: false en el model-index).
- Riesgo de alucinación en líneas cortas o de baja calidad: el verificador puede proponer correcciones incorrectas, aunque el autor indica que cada corrección se revalida contra la imagen.
- Sesgos conocidos: no se documentan sesgos específicos más allá de la distribución de los datos de entrenamiento (documentos y carteles jemer).
- Limitación de idioma: solo jemer e inglés; no soporta otras escrituras.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos a los evaluados.
- No se especifican requisitos de contexto ni limitaciones de longitud de línea más allá de las líneas cortas evaluadas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/muyleanging/Chakkhu-OCR-Khmer
- Versión ONNX int8: https://huggingface.co/muyleanging/Chakkhu-OCR-Khmer-ONNX
- Demo y API gratuita: https://huggingface.co/spaces/muyleanging/Chakkhu-OCR-Demo
- Benchmark KHOB: https://github.com/EKYCSolutions/khmer-ocr-benchmark-dataset
- Modelo comparable Anaksor-OCR: https://huggingface.co/Sokheng/anaksor-ocr
