# muyleanging/Chakkhu-OCR-Khmer

## Resumen

Chakkhu-OCR-Khmer es un modelo de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto en jemer (khmer) e inglés, desarrollado por Ing Muyleang bajo el identificador `muyleanging`. El modelo resuelve el problema de la transcripción de texto jemer en imágenes de documentos, escaneos, fotografías de móvil, capturas de pantalla y carteles, un dominio donde los motores OCR genéricos como Tesseract rinden de forma muy deficiente debido a la complejidad del sistema de escritura jemer (clústeres de consonantes, vocales dibujadas a la izquierda, subíndices).

Con solo 18,56 millones de parámetros y un peso de repositorio de 0,2 GB, está diseñado para ejecutarse en CPU de portátil (unos 140 ms por línea) y en GPU (unos 20 ms por línea). Incorpora una salida de confianza por línea (0-1) que permite enrutar selectivamente las líneas dudosas a revisión humana o a un modelo mayor. Se distribuye con licencia Apache 2.0 y soporta jemer e inglés.

El modelo es relevante porque combina una arquitectura híbrida CNN-Transformer con doble cabecera (CTC y decodificador autorregresivo) y un esquema de puntuación conjunto que mejora la robustez frente a errores típicos del jemer, como vocales omitidas o palabras repetidas. Declara un CER del 4,50 % en el benchmark KHOB completo (4.018 líneas reales), frente al 5,87 % de Netra-OCR y el 20,55 % de Tesseract 5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida CNN (bloques ResNet) + Transformer (6 capas, d=320) con cabecera CTC y decodificador autorregresivo de 3 capas |
| Parámetros totales | 18.562.218 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una línea de imagen de 64 px de alto y ancho variable) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | jemer (km), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura procesa una imagen de línea en escala de grises de 64 px de alto. Un extractor CNN con bloques ResNet reduce la representación a 2 filas por W/8 columnas. Sobre esa secuencia actúa un Transformer de 6 capas con dimensión 320 que ve la línea completa. A partir de ahí el modelo tiene dos cabeceras: una CTC que emite por columna un clúster o un token en blanco (borrador rápido y recuento de letras), y un decodificador de 3 capas que escribe un clúster jemer por paso y que fue preentrenado como modelo de lenguaje sobre texto jemer.

La decodificación combina ambas cabeceras: el decodificador genera sus 4 mejores hipótesis mediante beam search, se añade el borrador CTC y cada hipótesis se puntúa con `0.5 · CTC + 0.5 · decodificador`. La confianza por línea se calcula como el acuerdo entre ambas cabeceras multiplicado por la certeza de las columnas CTC. El vocabulario tiene 3.402 tokens (clústeres jemer, latinos, dígitos y puntuación), con retroceso a caracteres individuales para clústeres raros. El entrenamiento total fue de unas 5 horas en una GPU, en dos ejecuciones: una desde cero y una continuación de 1 hora con datos de documentos antiguos. Aproximadamente la mitad de las líneas de entrenamiento fueron sintéticas, generadas a partir de frases jemer del proyecto Akkhara y de Wikipedia en jemer (CC BY-SA 4.0), con 35 fuentes abiertas y 9 estilos de imagen (documento, escaneo, compresión de Messenger, captura de pantalla, foto, nocturna, etc.). Se incluyeron 2.311 líneas reales de escritura manuscrita. No se detalla en la información disponible el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de texto en líneas de imagen en jemer e inglés, incluyendo documentos limpios, escaneos, fotos de móvil, capturas de pantalla y carteles.
- Salida de confianza por línea (0-1) para priorizar revisión humana.
- Escritura de clústeres completos de letras jemer (por ejemplo, ស្ត្រី como un solo paso), respetando el orden tipográfico de subíndices y vocales dibujadas a la izquierda.
- Modo rápido con solo la cabecera CTC (`beam=0`).
- Procesamiento por línea individual; el demo asociado incluye un localizador de líneas para páginas completas.
- API gratuita vía Gradio Client para lectura de páginas completas con cajas delimitadoras por línea.
- Ejecución en CPU y GPU.
- No se documenta soporte de tool calling, agentes, visión general (más allá de OCR), audio ni modo de razonamiento.

## Casos de uso

- Digitalización de documentos administrativos históricos: el modelo logra un CER del 2,09 % en decretos reales camboyanos de 1993-2003 (impresión antigua, máquina de escribir, transparencias), por lo que es adecuado para pipelines de archivo y preservación documental.
- Procesamiento de capturas de pantalla y mensajes comprimidos: con un CER del 2,85 % en imágenes enviadas por Messenger, sirve para extraer texto de conversaciones y capturas de aplicaciones de mensajería.
- Escaneo de documentos en producción: con CER del 2,43 % en escaneos y 3,27 % en fotos escaneadas con móvil, puede integrarse en flujos de digitalización de facturas, formularios y contratos en jemer.
- Revisión asistida por confianza: la puntuación por línea permite derivar solo las líneas de baja confianza (el 10 % menos seguro concentra el 9 % de errores) a revisores humanos, reduciendo el coste de validación.
- OCR en dispositivos sin GPU: al ejecutarse en CPU a ~140 ms por línea, es viable en portátiles, entornos de oficina o servidores sin acelerador para digitalización por lotes.
- Extracción de texto de carteles y señalética diurna: con CER del 6,41 % en carteles callejeros de día, puede emplearse en aplicaciones de accesibilidad o traducción de señalética.
- Procesamiento de líneas cortas: con CER del 8,73 % en líneas de 10 caracteres o menos, es útil para etiquetas, titulares y campos breves donde Tesseract falla gravemente (51,8 %).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en el benchmark KHOB (4.018 líneas):

| Modelo | CER (%) ↓ | Líneas totalmente correctas (%) ↑ |
|---|---|---|
| Tesseract 5 (khm+eng, mejor) | 20,55 | 16,5 |
| Netra-OCR | 5,87 | 56,9 |
| Chakkhu-OCR-Khmer | 4,50 | 58,8 |

Desglose por tipo de imagen (CER %):

| Tarea KHOB | Tesseract 5 | Netra-OCR | Chakkhu |
|---|---|---|---|
| Documento limpio | 12,8 | 5,02 | 2,26 |
| Enviado por Messenger | 14,0 | 6,16 | 2,85 |
| Escaneado | 13,8 | 4,55 | 2,43 |
| Escaneado con móvil | 19,1 | 4,13 | 3,27 |
| Calle, día | 31,8 | 5,78 | 6,41 |
| Calle, noche | 35,3 | 10,64 | 11,17 |
| Líneas cortas (≤ 10 caracteres) | 51,8 | 22,41 | 8,73 |
| Solo inglés/números | 40,8 | 21,95 | 24,58 |

Documentos gubernamentales antiguos (12 páginas reservadas, 238 líneas): CER del 2,09 % y 66,8 % de líneas totalmente correctas (frente al 3,62 % y 51,7 % de la versión anterior).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 18,56 M de parámetros en precisión completa el peso ronda los 75 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con suficiente memoria para el modelo y el lote de líneas; el autor cita ejecución en GPU a ~20 ms por línea sin especificar modelo.
- Cabe en GPU consumer: sí, por tamaño (18,56 M de parámetros) y por el peso del repositorio (0,2 GB).
- Ejecución en CPU: soportada, ~140 ms por línea en CPU de portátil.
- Opciones de despliegue: carga directa con PyTorch mediante la función `load` del paquete incluido en el repositorio; API vía Gradio Client contra el Space `INGMUYLEANG/Chakkhu-OCR-Demo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~140 ms por línea en CPU de portátil y ~20 ms por línea en GPU (datos del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER KHOB (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chakkhu-OCR-Khmer | 18,56 M | no disponible | 4,50 | Apache 2.0 | Hugging Face |
| Netra-OCR | no disponible | no disponible | 5,87 | no disponible | no disponible |
| Tesseract 5 (khm+eng) | no disponible | no disponible | 20,55 | Apache 2.0 | Motor OCR clásico |

## Limitaciones y advertencias

- Rendimiento más débil en carteles callejeros con fuentes decorativas y fotos nocturnas: CER del 6,41 % y 11,17 % respectivamente, por debajo de Netra-OCR en esos casos.
- Peor rendimiento en líneas solo en inglés o con números: CER del 24,58 %, superior al 21,95 % de Netra-OCR.
- La escritura manuscrita está presente en el entrenamiento (2.311 líneas reales) pero no se ha medido su precisión.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Las etiquetas del conjunto de decretos antiguos se basan en la lectura de Gemini conservada donde coincidía con Chakkhu, lo que puede introducir sesgo de confirmación en esa métrica.
- Riesgo de alucinación no cuantificado; el modelo incluye confianza por línea para mitigar la propagación de errores en producción.
- Soporte limitado a jemer e inglés; no se documentan otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento (Wikipedia CC BY-SA 4.0 y corpus Akkhara).
- El modelo procesa una línea por imagen; para páginas completas requiere un localizador de líneas externo (disponible en el demo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Chakkhu-OCR-Khmer
- Demo y API gratuita: https://huggingface.co/spaces/INGMUYLEANG/Chakkhu-OCR-Demo
- Benchmark KHOB: https://github.com/EKYCSolutions/khmer-ocr-benchmark-dataset
- Dataset Akkhara Sing Khmer: https://huggingface.co/datasets/INGMUYLEANG/Akkhara-Sing-Khmer
- Wikipedia en jemer: https://km.wikipedia.org
