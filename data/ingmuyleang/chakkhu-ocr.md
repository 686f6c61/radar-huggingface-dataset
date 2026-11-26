# INGMUYLEANG/chakkhu-ocr

## Resumen

Chakkhu (ចក្ខុ, "ojo" en jemer) es un modelo de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto en jemer e inglés, desarrollado por Ing Muyleang y publicado bajo licencia Apache 2.0. Se trata de un modelo transformer con decodificación CTC de tan solo 18,56 millones de parámetros, diseñado para leer texto procedente de documentos escaneados, páginas mecanografiadas antiguas, fotografías de móvil, capturas de pantalla y carteles.

Su relevancia radica en dos factores. Primero, ofrece un rendimiento competitivo en el benchmark KHOB (4.018 líneas reales nunca vistas durante el entrenamiento) con un 3,60 % de tasa de error de carácter (CER) al combinarse con un verificador léxico de jemer, superando ampliamente a Tesseract 5 (20,55 % CER) y situándose cerca de Anaksor-OCR (2,39 % CER), que emplea datos sin licencia o solo para investigación. Segundo, todo su conjunto de entrenamiento utiliza exclusivamente datos con licencias permisivas, lo que lo hace apto para uso comercial sin restricciones adicionales.

El modelo está pensado para ejecutarse en CPU (unos 140 ms por línea en un portátil, ~20 ms en GPU), incluye una puntuación de confianza por línea (0–1) para decidir qué revisar manualmente, y dispone de una versión ONNX int8 de 39 MB sin dependencia de PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con decodificación CTC (image-to-text) |
| Parámetros totales | 18.562.218 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa líneas de texto individuales) |
| Tipos de cuantización | ONNX int8 (39 MB) disponible en repo separado; no se detallan otras |
| Idiomas soportados | Jemer (km), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch; ONNX int8 en repo alternativo |

## Arquitectura y entrenamiento

Chakkhu es un modelo transformer encoder-decoder con decodificación CTC para reconocimiento de texto en imágenes. Una innovación destacable es que genera clústeres completos de letras jemer (por ejemplo, ស្ត្រី se produce en un solo paso), lo que garantiza que los subíndices y las vocales dibujadas a la izquierda aparezcan en el orden tipográfico correcto. El modelo incorpora además un verificador léxico de jemer independiente (carpeta `checker/`, ejecutable en CPU sin modelo adicional): un modelo de lenguaje de clústeres de letras construido a partir del texto de entrenamiento limpio que selecciona entre las hipótesis del lector y propone correcciones ortográficas, verificando cada corrección contra la imagen original.

La versión actual (full6) se entrenó tres horas adicionales sobre la full5, incorporando carteles en inglés, líneas de correo electrónico, web y teléfono, códigos de referencia jemer (លេខ : ១១៤ / ២១ សជណ.អ) y letras jemer/latinas visualmente similares. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset, salvo que todos los datos empleados tienen licencias que permiten cualquier uso. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Reconocimiento de líneas de texto en jemer e inglés a partir de imágenes: documentos, páginas escaneadas, mecanografiados antiguos, fotos de móvil, capturas de pantalla y carteles.
- Generación de clústeres completos de letras jemer con orden tipográfico correcto (subíndices y vocales izquierdas).
- Puntuación de confianza (0–1) por cada línea reconocida, útil para enrutar líneas dudosas a revisión humana.
- Verificador léxico de jemer que propone y valida correcciones ortográficas contra la imagen.
- Procesamiento de documentos completos: conversión de PDF o foto a Word, y de tablas a Excel/CSV con números tratados como números.
- Reconocimiento de texto en carteles y fotos de calle completas (modo Photo de la demo: localización de texto y lectura posterior).
- Manejo de líneas mixtas jemer + inglés en una misma línea.
- Ejecución en CPU con latencia de ~140 ms por línea; ~20 ms por línea en GPU.

## Casos de uso

- Digitalización de documentos administrativos jemer: el modelo convierte escaneos y PDF en texto editable con un CER del 1,70 % en documentos limpios, adecuado para archivos históricos y trámites.
- Procesamiento de documentos gubernamentales antiguos mecanografiados: su buen rendimiento en páginas escaneadas (2,02 % CER) permite extraer texto de archivos con tipografía desgastada.
- Extracción de tablas a Excel/CSV: la funcionalidad de documentos completos convierte tablas en hojas de cálculo con números como valores numéricos, útil en contabilidad y facturación.
- Lectura de carteles y señalética urbana: el modo Photo localiza y lee texto en fotos de calle completas (22,1 % CER en 120 fotos de calle de KHOB), aplicable a inventarios de señalética o apps de accesibilidad.
- Automatización de atención al cliente sobre capturas de chat: el modelo reconoce capturas de pantalla enviadas por Messenger (2,11 % CER) y extrae el contenido para su procesamiento posterior.
- Enriquecimiento de contactos y datos de formularios: con un 94 % de líneas completamente correctas en correos, webs y teléfonos, puede alimentar pipelines de extracción de datos de contacto desde documentos.
- Revisión asistida por humanos: gracias a la puntuación de confianza por línea, un flujo de trabajo puede derivar solo las líneas con baja confianza a revisores humanos, reduciendo el coste de verificación.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el benchmark KHOB (4.018 líneas reales, nunca vistas en entrenamiento):

| Modelo | Datos de entrenamiento | CER (%) ↓ | Líneas totalmente correctas (%) ↑ |
|---|---|---|---|
| Tesseract 5 (khm+eng, mejor) | — | 20,55 | 16,5 |
| Netra-OCR | incluye datos solo para investigación | 5,87 | 56,9 |
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
| Líneas cortas (≤ 10 caracteres, 455 líneas) | — | 8,42 | 8,25 | 7,88 | — |
| Solo inglés/números (474 líneas) | — | 18,72 | 18,72 | 18,35 | — |

Prueba adicional del autor con 200 líneas generadas con fuentes del sistema Mac no vistas en entrenamiento (líneas totalmente correctas):

| Tipo de línea | full5 | full6 |
|---|---|---|
| Carteles en inglés | 88 % | 88 % |
| Correo/web/teléfono | 86 % | 94 % |
| Códigos de referencia jemer | 100 % | 98 % |
| Jemer + inglés en una línea | 92 % | 92 % |
| Total 200 líneas | 91,5 % | 93,0 % |

En fotos de calle completas (modo Photo de la demo, 120 fotos de KHOB): full6 obtiene 22,1 % CER (full5: 23,0 %; full4: 24,0 %) con un 91,8 % de líneas encontradas.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo tiene 18,56 millones de parámetros y cabe holgadamente en cualquier GPU consumer. La versión ONNX int8 ocupa 39 MB.
- GPU recomendadas: cualquier GPU moderna (RTX 3090, RTX 4090, A100, H100) para máxima velocidad; ~20 ms por línea en GPU según el autor.
- CPU: funciona en CPU de portátil con ~140 ms por línea, lo que lo hace viable sin acelerador.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM; también en sistemas integrados.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (repo ONNX int8), y la demo/API alojada en Hugging Face Spaces. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo OCR de este tamaño).
- Latencia y throughput: ~140 ms/línea en CPU de portátil; ~20 ms/línea en GPU. El verificador léxico se ejecuta en CPU sin coste de modelo adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | CER en KHOB (%) | Licencia | Datos de entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| Chakkhu full6 + verificador | 18,56 M | 3,60 | Apache 2.0 | Solo licencias limpias | Hugging Face + ONNX + demo |
| Anaksor-OCR (rec-v4) | No disponible | 2,39 | No disponible en la información | Incluye datos sin licencia o solo investigación | Hugging Face |
| Netra-OCR | No disponible | 5,87 | No disponible en la información | Incluye datos solo para investigación | No disponible en la información |
| Tesseract 5 (khm+eng) | No disponible | 20,55 | Apache 2.0 | No disponible | Open source |

Chakkhu destaca por su licencia permisiva y su conjunto de entrenamiento con licencias limpias, frente a Anaksor-OCR, más preciso pero con datos sin licencia, y Netra-OCR, con datos solo para investigación. Tesseract 5, aunque libre, queda muy por detrás en precisión para jemer.

## Limitaciones y advertencias

- El rendimiento en fotos de calle nocturnas es notablemente peor (10,17 % CER), lo que limita su uso en condiciones de baja iluminación.
- Las líneas de solo inglés/números presentan un CER alto (18,35 %), muy superior al de las líneas en jemer; el modelo está optimizado para jemer.
- El reconocimiento de líneas cortas (≤ 10 caracteres) tiene un CER del 7,88 %, superior a la media.
- Riesgo de alucinación inherente a los modelos generativos de texto: el verificador léxico mitiga errores ortográficos, pero no garantiza la fidelidad absoluta al contenido de la imagen.
- No se han publicado datos sobre sesgos demográficos o de dominio; el entrenamiento se centra en documentos y carteles jemeres, por lo que el dominio de aplicación es limitado.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor advierte que Anaksor-OCR emplea datos sin licencia, por lo que su uso comercial podría ser problemático; Chakkhu evita esa restricción.
- El modelo procesa líneas de texto, no páginas completas de forma nativa; el procesamiento de documentos completos requiere el pipeline adicional de detección y segmentación incluido en la demo.
- No se dispone de información sobre el comportamiento en otros idiomas distintos del jemer e inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INGMUYLEANG/chakkhu-ocr
- Demo y API gratuita: https://huggingface.co/spaces/muyleanging/Chakkhu-OCR-Demo
- Versión ONNX int8: https://huggingface.co/muyleanging/Chakkhu-OCR-Khmer-ONNX
- Benchmark KHOB: https://github.com/EKYCSolutions/khmer-ocr-benchmark-dataset
- Modelo comparable Anaksor-OCR: https://huggingface.co/Sokheng/anaksor-ocr
