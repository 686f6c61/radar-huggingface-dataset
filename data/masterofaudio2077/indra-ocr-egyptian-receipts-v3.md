# masterofaudio2077/indra-ocr-egyptian-receipts-v3

## Resumen

indra-ocr-egyptian-receipts-v3 es un ajuste fino (fine-tune) del modelo de OCR `datalab-to/indra-ocr`, especializado en el reconocimiento de líneas de texto en recibos egipcios con contenido mixto árabe/inglés. Lo desarrolla el usuario de Hugging Face `masterofaudio2077` y se publica bajo una licencia modificada de OpenRAIL-M. El modelo resuelve un problema concreto: los reconocedores de líneas del pipeline original de indra-ocr tienen un rendimiento pobre sobre texto árabe de recibos (CER de línea de 0,3291 en el reconocedor RTL), y este ajuste lo reduce a 0,0716.

Técnicamente es un modelo pequeño: 1.250.566 parámetros totales en formato safetensors, con un repositorio de 0,1 GB. No es un transformer generativo, sino una red de reconocimiento de líneas con decodificación CTC, empaquetada como parte de un pipeline OCR completo (detector + enrutador de escritura + reconocedores). Se distribuye en dos formatos: un directorio ONNX listo para usar como reemplazo directo del pipeline original de indra-ocr, y pesos PyTorch en safetensors bajo el subdirectorio `pytorch/`.

Su relevancia radica en que demuestra una estrategia de ajuste fino sin código de entrenamiento público: como indra-ocr solo publica pesos ONNX, el autor reconstruyó la arquitectura en PyTorch verificándola capa a capa contra los grafos ONNX (desviación máxima de ~5e-05), la entrenó y volvió a escribir los pesos en los grafos ONNX originales. El resultado es un modelo que se integra sin modificar el pipeline existente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de reconocimiento de líneas con decodificación CTC (reconstruida en PyTorch desde grafos ONNX) |
| Parámetros totales | 1.250.566 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa recortes de línea de imagen, no secuencias de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ar (árabe), en (inglés) |
| Licencia | modified-openrail-m (la model card declara también apache-2.0; ver limitaciones) |
| Formato de pesos | ONNX (directorio de modelo drop-in) y safetensors (pesos PyTorch en `pytorch/`) |

## Arquitectura y entrenamiento

El modelo se compone de tres piezas dentro del pipeline de indra-ocr: dos reconocedores de líneas (`rec.onnx` para escritura latina y `rec_rtl.onnx` para árabe/hebreo) y un enrutador de escritura (`script.onnx`). Los reconocedores son redes convolucionales con salida CTC; el enrutador es un clasificador que decide a qué reconocedor enviar cada línea. El ajuste fino se aplicó sobre los reconocedores y el enrutador, dejando intacta la cola de decodificación CTC fusionada del grafo ONNX original.

El entrenamiento se realizó sobre el dataset sintético `masterofaudio2077/egyptian-receipts-ocr` (recibos egipcios árabes/ingleses). Los reconocedores se entrenaron con pérdida CTC, optimizador Lion con learning rate pequeño, BatchNorm congelado, aumento de datos, guarda de divergencia y un esquema de learning rate warmup → constante → decaimiento lineal. El enrutador se entrenó con entropía cruzada sobre objetivos derivados del texto. La innovación técnica destacable es la reconstrucción fiel del grafo en PyTorch para permitir el ajuste fino cuando no se publica código de entrenamiento, y la posterior reinserción de pesos en los grafos ONNX originales para mantener la compatibilidad drop-in.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) a nivel de línea sobre recortes de imagen en escala de grises.
- Reconocimiento de texto árabe e inglés, incluido texto mixto en la misma línea o documento.
- Enrutamiento automático de escritura: clasifica cada línea como latina o árabe/hebrea para dirigirla al reconocedor adecuado.
- Salida de texto de página completa con cajas delimitadoras y puntuaciones de confianza por línea.
- Decodificación CTC codiciosa (greedy) con vocabulario específico por reconocedor.
- Integración directa en el pipeline `indra-ocr` sin modificar el código del pipeline.
- Ejecución en CPU o GPU mediante ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre: es un modelo discriminativo de OCR.

## Casos de uso

- Digitalización de recibos de comercio egipcio: el modelo extrae líneas de texto de tickets de compra con contenido árabe e inglés mezclado, reduciendo el CER de página de 0,3855 a 0,3282 en el conjunto de test, lo que lo hace adecuado para pipelines de contabilidad automatizada.
- Extracción de importes y datos fiscales: al mejorar el reconocimiento de líneas como "الإجمالي قبل الضريبة" o "ضريبة القيمة المضافة", permite alimentar sistemas de extracción de entidades (NER) sobre recibos con mayor fiabilidad.
- Procesamiento por lotes de archivos históricos de recibos: con 1,25 M de parámetros y pesos ONNX de 0,1 GB, se puede desplegar en servidores modestos o incluso en CPU para procesar grandes volúmenes sin GPU.
- Integración en aplicaciones móviles o de escritorio: el tamaño reducido y el formato ONNX permiten ejecutar el reconocedor embebido en dispositivos con recursos limitados para escanear recibos en el punto de venta.
- Sustitución drop-in en pipelines existentes de indra-ocr: cualquier sistema que ya use `datalab-to/indra-ocr` puede apuntar al directorio de este modelo y obtener mejores resultados en recibos egipcios sin cambiar código.
- Investigación en ajuste fino de modelos OCR sin código de entrenamiento: sirve como referencia metodológica para reconstruir arquitecturas desde grafos ONNX y reinyectar pesos ajustados.
- Validación de calidad en sistemas de facturación: el modelo devuelve confianza por línea, lo que permite marcar líneas dudosas para revisión humana en flujos de aprobación de gastos.

## Benchmarks y rendimiento

CER (tasa de error de caracteres), menor es mejor. CER de línea sobre recortes del split de validación; CER de página sobre recibos completos a través del pipeline completo.

| Reconocedor | CER de línea base | CER de línea ajustado |
|---|---|---|
| `rec_rtl.onnx` | 0,3291 | 0,0716 |

| CER de página (validación) | Valor |
|---|---|
| Modelo base | 0,4249 |
| Ajustado | 0,3568 |

| CER de página (test) | Valor |
|---|---|
| Modelo base | 0,3855 (mediana 0,3651) |
| Ajustado | 0,3282 (mediana 0,2950) |
| Mejora | 0,0573 |

Sobre 150 recibos de test: mejoraron 134, empeoraron 12, sin cambios 4. Tasa de coincidencia exacta: 0,00 % → 0,00 %.

| CER de página del lado del reconocedor (cajas GT, validación) | CER de página | CER de línea |
|---|---|---|
| Stock (sin superposición) | 0,4570 | 0,4764 |
| Solo enrutador (superpuesto: script) | 0,4229 | 0,4208 |
| Ajustado (superpuesto: script, rec_rtl) | 0,2704 | 0,2161 |

Enrutador de escritura: las líneas con letras árabes se envían a `rtl` en un 73,4 % (stock) frente a un 98,6 % (ajustado) en validación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 1,25 M de parámetros y pesos ONNX de 0,1 GB, cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU mediante ONNX Runtime. Cualquier GPU (RTX 4090, A100, H100) ejecutará la inferencia con latencia despreciable, pero no es necesario.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de memoria, e incluso en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (formato principal), pipeline `indra-ocr` con `indra_ocr.load(path=...)`, y PyTorch para los reconocedores aislados mediante `build_from_onnx` y safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| indra-ocr-egyptian-receipts-v3 | 1.250.566 | no disponible | ar, en | modified-openrail-m | ONNX, safetensors |
| datalab-to/indra-ocr (base) | no disponible | no disponible | no disponible | no disponible | ONNX |
| Alternativas OCR de línea (p. ej. Tesseract, PaddleOCR) | no disponible | no disponible | múltiples | varía | varios |

El modelo base `datalab-to/indra-ocr` es la referencia directa: este ajuste mejora su CER de página en test de 0,3855 a 0,3282 y su CER de línea RTL de 0,3291 a 0,0716, manteniendo compatibilidad total con el pipeline. No se dispone de datos comparativos con otros sistemas OCR en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en recibos egipcios; su rendimiento fuera de ese dominio (otros países, otros tipos de documento, otras tipografías) no está validado y probablemente degrade.
- La tasa de coincidencia exacta en test es del 0,00 %, es decir, ninguna página se transcribe íntegramente sin errores; sigue siendo necesario un paso de validación o corrección posterior.
- Sobre 150 recibos de test, 12 empeoraron respecto al modelo base, lo que indica que la mejora no es uniforme.
- El modelo solo cubre árabe e inglés; no soporta otros idiomas.
- La licencia es ambigua: los tags y la model card declaran `apache-2.0`, pero el campo de licencia indica `modified-openrail-m`. Antes de uso comercial debe verificarse la licencia efectiva y sus restricciones de uso.
- El autor no publica código de entrenamiento del pipeline original; la reproducibilidad depende de la reconstrucción en PyTorch incluida, cuya fidelidad se verificó con una desviación máxima de ~5e-05 frente al grafo ONNX.
- Riesgo de alucinación en OCR: el modelo puede generar caracteres plausibles pero incorrectos (por ejemplo, dígitos en números de factura o importes), como se observa en los ejemplos de la model card donde el número de registro fiscal difiere del real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del rendimiento declarado.
- No se han publicado datos de latencia ni throughput, lo que dificulta estimar costes de despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/indra-ocr-egyptian-receipts-v3
- Modelo base: https://huggingface.co/datalab-to/indra-ocr
- Dataset de entrenamiento: https://huggingface.co/datasets/masterofaudio2077/egyptian-receipts-ocr
