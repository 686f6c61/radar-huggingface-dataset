# nakamura196/ndlocr-lite-onnx

## Resumen

NDLOCR-Lite es un conjunto de modelos ONNX para reconocimiento óptico de caracteres (OCR) de documentos japoneses, desarrollado originalmente por el National Diet Library (NDL) de Japón bajo el proyecto ndl-lab/ndlocr-lite. Este repositorio concreto (nakamura196/ndlocr-lite-onnx) es un espejo no oficial que redistribuye copias inmutables de los ficheros ONNX publicados por el NDL, junto con grafos convertidos para onnxruntime-web, con el objetivo de que aplicaciones web puedan descargarlos con CORS y fijar URLs inmutables por commit.

El sistema se compone de dos etapas: un detector de texto (DEIM-S, entrada 1024x1024, ~40 MB) que localiza regiones de texto en la imagen, y una familia de reconocedores PARSeq de tipo "tiny" con distintas resoluciones de entrada (24x256, 24x384, 24x768) y distintos números de clases (30, 50, 100), entrenados específicamente sobre datos japoneses (incluyendo texto manuscrito "tegaki3"). Los pesos rondan los 36-43 MB por fichero, lo que permite despliegue en navegador y en dispositivos con recursos limitados.

Es relevante ahora porque ofrece una vía práctica para OCR de documentos japoneses (impresos y manuscritos) en entornos web o edge, con pesos versionados, checksums SHA-256 verificables y licencia CC BY 4.0 que permite uso comercial con atribución. No es un modelo de lenguaje: es una infraestructura de visión por computador especializada, y debe evaluarse como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector DEIM-S (DETR-like con IoU-aware) + reconocedores PARSeq (transformer encoder-decoder) |
| Parámetros totales | No disponible (tamaños de fichero: 35,8-42,6 MB por modelo ONNX) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada del detector 1024x1024 px; entradas de reconocedor 24x256, 24x384 o 24x768 px |
| Tipos de cuantización | No disponible (los ficheros publicados son ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | Japonés (entrenado sobre datos del NDL, incluyendo manuscrito "tegaki") |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafos estándar y variantes para onnxruntime-web) |

## Arquitectura y entrenamiento

El pipeline es de dos etapas. La detección la realiza DEIM-S con entrada fija de 1024x1024 píxeles, un detector de la familia DETR con mecanismo de consultas y asignación IoU-aware, adecuado para localizar líneas o regiones de texto en documentos escaneados. El reconocimiento lo realizan modelos PARSeq, un transformer encoder-decoder con decodificación autorregresiva y permutación de secuencias, en variantes "tiny" con anchos de entrada de 256, 384 y 768 píxeles y vocabularios de 30, 50 o 100 clases.

Los datos de entrenamiento provienen del National Diet Library y de corpus japoneses; las versiones "tegaki3" y "tegaki2" indican incorporación de datos de escritura manual. Los nombres de fichero incluyen el número de épocas (por ejemplo, 499epoch, 300epoch, 153epoch) y la fecha de build (261124, 202604, 202602). No se documenta en la información disponible el número exacto de tokens o imágenes de entrenamiento, la composición del dataset ni si se aplicó RLHF/DPO (no aplica a OCR). La innovación principal es la ligereza: pesos de decenas de MB y grafos compatibles con onnxruntime-web, lo que habilita inferencia en navegador.

## Capacidades

- Detección de regiones de texto en imágenes de documentos con DEIM-S a 1024x1024.
- Reconocimiento de texto japonés impreso y manuscrito mediante PARSeq.
- Tres configuraciones de reconocedor según resolución y vocabulario (24x256/30 clases, 24x384/50 clases, 24x768/100 clases).
- Ejecución en navegador mediante onnxruntime-web (grafos convertidos incluidos).
- Verificación de integridad mediante checksums SHA-256 publicados por fichero.
- Fijación de versiones por commit para reproducibilidad.
- No soporta tool calling, agentes, razonamiento multietapa ni generación de texto libre: es un modelo de visión especializado.
- Capacidades multilingües: no disponibles; el foco documentado es japonés.

## Casos de uso

- Digitalización de fondos bibliográficos del NDL: procesar escaneos de documentos japoneses con el detector DEIM-S y el reconocedor PARSeq de 24x768 para obtener texto indexable en pipelines de preservación digital.
- OCR en aplicaciones web sin backend: usar los grafos convertidos para onnxruntime-web y ejecutar detección y reconocimiento en el navegador del usuario, evitando enviar imágenes a servidores y reduciendo costes de infraestructura.
- Procesamiento de manuscritos históricos: emplear las variantes "tegaki3" (2026-04) entrenadas con datos de escritura manual para transcribir cuadernos y documentos manuscritos japoneses.
- Extracción de texto en dispositivos edge: desplegar los ficheros ONNX de 36-43 MB en dispositivos con poca memoria, ya que el tamaño reducido permite cargar el modelo en entornos con restricciones de VRAM/RAM.
- Reproducibilidad en producción: fijar URLs por commit y validar SHA-256 antes de cargar los pesos, garantizando que un pipeline de OCR no cambie de comportamiento por actualizaciones del repositorio original.
- Investigación en OCR japonés: comparar las distintas variantes (resolución 256/384/768, vocabularios 30/50/100) sobre un mismo corpus para medir el impacto de la resolución de entrada en la precisión.
- Integración en sistemas de archivo y bibliotecas: combinar el OCR con metadatos bibliográficos para búsqueda de texto completo en catálogos de documentos japoneses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los ficheros (36-43 MB por modelo), la huella de memoria es reducida y compatible con GPUs de gama baja y con CPU.
- GPU recomendadas: no disponible; el diseño orientado a onnxruntime-web sugiere que la inferencia en CPU o WebGPU es viable, aunque no se documentan cifras.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 o superior) e incluso en CPU, dado el tamaño de los pesos; no hay cifras oficiales de latencia.
- Opciones de despliegue: onnxruntime (Python/C++), onnxruntime-web (navegador), y cualquier runtime compatible con ONNX; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NDLOCR-Lite (este repo) | DEIM-S + PARSeq tiny | 1024x1024 (det.); 24x256/384/768 (rec.) | Japonés | CC BY 4.0 | ONNX |
| NDLOCR (original, ndl-lab) | Pipeline OCR del NDL | No disponible | Japonés | No disponible en esta ficha | No disponible |
| Tesseract | OCR clásico LSTM | Variable | Multilingüe | Apache 2.0 | Propio |
| PaddleOCR | Detección + reconocimiento | Variable | Multilingüe | Apache 2.0 | ONNX/Paddle |

La comparación con Tesseract y PaddleOCR se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que no se pueden establecer conclusiones cuantitativas.

## Limitaciones y advertencias

- Es un espejo no oficial: el mantenimiento y la corrección de errores dependen del repositorio original ndl-lab/ndlocr-lite; este repo solo redistribuye copias.
- Enfocado a japonés: no se documentan otros idiomas; usarlo con textos en otros alfabetos probablemente degrade la precisión.
- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Riesgo de error en reconocimiento: como todo OCR, puede fallar en imágenes de baja calidad, ruido, tipografías inusuales o manuscritos difíciles; no se documentan tasas de error.
- Licencia CC BY 4.0: permite uso comercial con atribución obligatoria al NDL y al proyecto ndlocr-lite; es necesario conservar el crédito.
- Reproducibilidad: el autor recomienda descargar por commit, no por rama, para evitar cambios inesperados en los pesos.
- Sin datos de benchmarks ni de latencia: no hay evidencia publicada en esta ficha para estimar rendimiento en producción.
- Fechas de creación/actualización del repo (2026) posteriores a la fecha de consulta habitual: verificar la vigencia de los enlaces antes de integrarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nakamura196/ndlocr-lite-onnx
- Proyecto original NDLOCR-Lite: https://github.com/ndl-lab/ndlocr-lite
- Catálogo, checksums y scripts de conversión: https://github.com/nakamura196/ocr-models
- Fichero DEIM-S 1024x1024 (2.0.0): https://raw.githubusercontent.com/ndl-lab/ndlocr-lite/1f3adc7af311af1ce4cbbd4d9089f30781d01313/src/model/deim-s-1024x1024-261124.onnx
- Fichero PARSeq 24x256-30 (2.0.0): https://raw.githubusercontent.com/ndl-lab/ndlocr-lite/1f3adc7af311af1ce4cbbd4d9089f30781d01313/src/model/parseq-ndl-24x256-30-tiny-499epoch-261124.onnx
- Fichero PARSeq 24x384-50 (2.0.0): https://raw.githubusercontent.com/ndl-lab/ndlocr-lite/1f3adc7af311af1ce4cbbd4d9089f30781d01313/src/model/parseq-ndl-24x384-50-tiny-278epoch-261124.onnx
- Fichero PARSeq 24x768-100 (2.0.0): https://raw.githubusercontent.com/ndl-lab/ndlocr-lite/1f3adc7af311af1ce4cbbd4d9089f30781d01313/src/model/parseq-ndl-24x768-100-tiny-153epoch-261124.onnx
