# kaopanboonyuen/KaoOCR-General-1.0b

## Resumen

KaoOCR-General-1.0b es un motor de reconocimiento óptico de caracteres (OCR) para tailandés e inglés desarrollado por kaopanboonyuen en el contexto de GSB AI Lab (Government Savings Bank de Tailandia). Se trata de un pipeline completo que detecta líneas de texto, recorta cada línea, la lee mediante un reconocedor CTC pequeño y reconstruye el resultado en orden de lectura. Su rasgo diferencial es que está diseñado para ejecutarse íntegramente en CPU mediante ONNX Runtime, sin necesidad de GPU ni de infraestructura de serving compleja.

El modelo es un fine-tune de KaoOCR-General-1.0a, que a su vez es un reconocedor ajustado para escritura manual mediante weight blending (WiSE-FT) sobre OpenThai2.1-OCR-Text de iApp Technology. El reconocedor de líneas es notablemente compacto: aproximadamente 0,6 millones de parámetros, lo que lo aleja de los grandes modelos multimodales de OCR y lo sitúa en la categoría de OCR ligero y desplegable en entornos con recursos limitados.

La relevancia de esta versión es limitada dentro de su propia familia: en el benchmark propio ThaiOCRBench (métrica NLS, 0-100), 1.0b obtiene 38,8 frente a 39,2 de 1.0a y 39,8 de 1.0c. El propio autor recomienda 1.0c para la mayoría de usos, por lo que 1.0b debe considerarse una iteración intermedia más que una mejora sobre su predecesora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR: detector de líneas + reconocedor CTC de líneas (line recogniser) sobre ONNX Runtime |
| Parametros totales | Aproximadamente 0,6 M en el reconocedor (el resto del pipeline no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de reconocimiento de líneas, no generativo) |
| Tipos de cuantizacion | No disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime ONNX Runtime con `CPUExecutionProvider`) |

## Arquitectura y entrenamiento

KaoOCR-General es un pipeline modular orientado a OCR de página completa. El flujo detecta líneas de texto en la imagen de entrada (escaneo o fotografía), gestiona orientación, deskew y orden de lectura, recorta cada línea y la procesa con un reconocedor CTC de aproximadamente 0,6 M de parámetros. La salida puede ser texto plano en orden de lectura o un JSON completo con líneas y cajas delimitadoras. Toda la inferencia se ejecuta sobre ONNX Runtime con el proveedor de ejecución de CPU, sin dependencia de GPU.

La versión 1.0b es un fine-tune de KaoOCR-General-1.0a, que a su vez deriva de OpenThai2.1-OCR-Text de iApp Technology y fue ajustada para escritura manual mediante weight blending (WiSE-FT) sobre el dataset `iapp/thai_handwriting_dataset`. El paquete `runtime/` y los ficheros de licencia se heredan sin cambios de la versión anterior. La model card incluye un TODO explícito del autor indicando que los detalles de entrenamiento de 1.0b (mezcla de datos, épocas, learning rate, hardware y regla de selección) aún no están documentados, por lo que esa información no está disponible.

## Capacidades

- Reconocimiento de texto impreso y manuscrito en tailandés e inglés.
- Detección automática de líneas de texto en imágenes de página completa, incluyendo gestión de orientación, deskew y orden de lectura.
- Salida en texto plano en orden de lectura o en JSON estructurado con líneas y cajas delimitadoras.
- Procesamiento por lotes de carpetas completas de imágenes, con salida a ficheros `.txt` por imagen.
- Inferencia exclusiva en CPU mediante ONNX Runtime, sin GPU ni stack de serving.
- Entrada flexible: rutas de fichero, bytes, arrays de NumPy o imágenes PIL.
- Paralelización recomendada por procesos (N procesos con 1 hilo cada uno) en lugar de un único proceso multihilo para trabajos por lotes.
- No soporta salida en Markdown, tablas ni parsing de documentos estructurados; para ello el autor remite a KaoOCR-Ledger.

## Casos de uso

- Digitalización de documentos bancarios y administrativos: el pipeline procesa escaneos de página completa con detección de líneas y orden de lectura automáticos, adecuado para entornos de GSB y administración pública tailandesa donde el texto combina tailandés e inglés.
- Despliegue en servidores sin GPU: al ejecutarse sobre ONNX Runtime con `CPUExecutionProvider` y un reconocedor de ~0,6 M de parámetros, puede correr en máquinas modestas o en el borde, sin coste de GPU.
- Procesamiento por lotes de archivos escaneados: la CLI permite pasar una carpeta completa (`python inference.py scans/ -o out/`) y generar un `.txt` por imagen, útil para migraciones masivas de archivo físico a digital.
- Extracción de texto para pipelines de búsqueda o indexación: la salida JSON con líneas y cajas permite alimentar sistemas de búsqueda documental o visores con resaltado de regiones.
- Reconocimiento de formularios y notas manuscritas en tailandés: el ajuste sobre `iapp/thai_handwriting_dataset` lo hace apto para capturas manuscritas, aunque con la cautela de que la escritura manual sigue siendo más difícil que la impresa para un modelo de este tamaño.
- Integración en aplicaciones locales de digitalización: la API de Python (`LineOCR`) acepta rutas, bytes, arrays de NumPy o imágenes PIL, lo que facilita incorporarlo a herramientas de escritorio o servicios ligeros.
- Preprocesado para sistemas posteriores: como OCR-only sin salida Markdown, encaja como primera etapa que entrega texto plano a otros componentes (clasificadores, extractores de entidades) en lugar de sustituirlos.

## Benchmarks y rendimiento

Benchmark propio del autor: ThaiOCRBench (tareas OCR), métrica NLS (1 − distancia de edición normalizada), escala 0-100.

| Modelo | OCR (NLS) | vs referencia |
|---|---:|---:|
| KaoOCR-General-1.0c | 39,8 | +2,5 |
| KaoOCR-General-1.0a | 39,2 | +1,9 |
| **KaoOCR-General-1.0b** | **38,8** | **+1,5** |
| OpenThai2.1-OCR-Text (referencia) | 37,3 | n/a |

Las tareas de parsing (tablas, gráficos, parsing de documentos) figuran como `n/a` de forma deliberada, ya que General es un motor exclusivamente OCR y no genera Markdown. Los números proceden de una ejecución propia del autor sobre ThaiOCRBench y no de un leaderboard oficial; los deltas se calculan sobre puntuaciones sin redondear y pueden diferir en 0,1 respecto a la resta de los valores redondeados.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el runtime usa ONNX Runtime con `CPUExecutionProvider`, sin requisito de GPU.
- VRAM estimada: no aplica; no requiere GPU.
- GPU recomendadas: no aplica (el modelo no está pensado para GPU).
- Cabe en cualquier CPU consumer: el reconocedor tiene ~0,6 M de parámetros y el repositorio ocupa 0,0 GB según Hugging Face, por lo que el coste de memoria es mínimo.
- Opciones de despliegue: ONNX Runtime (proveedor CPU), CLI `inference.py` y API de Python `runtime.line_engine.LineOCR`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda, para lotes, N procesos con 1 hilo cada uno en lugar de 1 proceso con N hilos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | OCR (NLS) | Licencia | Notas |
|---|---|---|---:|---|---|---|
| **KaoOCR-General-1.0b** | OCR CPU (ONNX) | ~0,6 M (reconocedor) | th, en | 38,8 | Apache 2.0 | Fine-tune de 1.0a; el autor recomienda 1.0c |
| KaoOCR-General-1.0c | OCR CPU (ONNX) | ~0,6 M (reconocedor) | th, en | 39,8 | Apache 2.0 | Release actual de la familia |
| KaoOCR-General-1.0a | OCR CPU (ONNX) | ~0,6 M (reconocedor) | th, en | 39,2 | Apache 2.0 | Primera release; reconocedor ajustado en manuscrito tailandés |
| OpenThai2.1-OCR-Text | OCR (referencia base) | No disponible | th, en | 37,3 | No disponible | Modelo de iApp Technology del que deriva la familia KaoOCR |
| KaoOCR-Ledger-1.0b | OCR con salida Markdown/tablas | No disponible | th, en | No disponible | No disponible | Alternativa del mismo autor para parsing de documentos y tablas |

## Limitaciones y advertencias

- Solo OCR: no genera tablas ni Markdown; para parsing estructurado hay que usar KaoOCR-Ledger.
- La escritura manual sigue siendo considerablemente más difícil que la impresa para un modelo de este tamaño.
- Si el detector de líneas falla y no localiza una línea, el reconocedor nunca la procesa; los errores de detección son irrecuperables en etapas posteriores.
- Las puntuaciones de benchmark proceden de una ejecución y de scorers propios del autor; no son una entrada oficial de leaderboard y deben validarse sobre documentos propios.
- En su propio benchmark, 1.0b rinde por debajo de 1.0a (38,8 frente a 39,2) y de 1.0c (39,8); el autor recomienda 1.0c para la mayoría de usos.
- Cobertura lingüística limitada a tailandés e inglés.
- Los detalles de entrenamiento de 1.0b (mezcla de datos, épocas, learning rate, hardware) no están documentados; la model card contiene un TODO al respecto.
- No se documentan sesgos específicos ni tasas de alucinación medibles; al ser un modelo de reconocimiento y no generativo, el riesgo se manifiesta como errores de transcripción más que como contenido inventado.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribución y aviso de licencia; conviene revisar los ficheros de licencia heredados del paquete `runtime/`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KaoOCR-General-1.0b
- Modelo base (1.0a): https://huggingface.co/kaopanboonyuen/KaoOCR-General-1.0a
- Versión recomendada por el autor (1.0c): https://huggingface.co/kaopanboonyuen/KaoOCR-General-1.0c
- Alternativa para Markdown y tablas (KaoOCR-Ledger): https://huggingface.co/kaopanboonyuen/KaoOCR-Ledger-1.0b
- Modelos OpenThai de iApp Technology: https://iapp.co.th/models
- OpenThai2.1-OCR-Text (referencia base): `iapp/OpenThai2.1-OCR-Text-20261118`
- Dataset ThaiOCRBench: https://huggingface.co/datasets/typhoon-ai/ThaiOCRBench
- Dataset de escritura manual tailandesa: `iapp/thai_handwriting_dataset`
- Typhoon / OpenTyphoon: https://opentyphoon.ai/
