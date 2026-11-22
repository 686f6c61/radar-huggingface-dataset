# DuhItzAniket/glypharis-v1

## Resumen

Glypharis v1 es un sistema OCR (reconocimiento óptico de caracteres) orientado a líneas de texto impreso en inglés sobre imágenes de documentos. Lo desarrolla DuhItzAniket y se distribuye como un paquete de Python (`glypharis` 1.0.0, bajo licencia Apache-2.0) que orquesta dos modelos: un detector de líneas de texto, GW-DET-001, y un reconocedor de líneas basado en CTC, GW-REC-034. El repositorio de Hugging Face es un espejo byte a byte del activo publicado en la release `v1.0` de GitHub.

El modelo resuelve el problema clásico de digitalización de documentos: localizar las líneas de texto en una página, recortarlas, leerlas y ordenarlas según el orden de lectura. A diferencia de los OCR de extremo a extremo que devuelven solo una cadena de texto, Glypharis devuelve además, por cada línea, su caja delimitadora, su nivel de confianza y su tiempo de procesamiento, lo que facilita la trazabilidad y la integración en pipelines documentales.

Es relevante porque ofrece pesos verificables criptográficamente (SHA-256 fijados en el manifiesto y en el paquete), formatos tanto PyTorch como ONNX (opset 17) para despliegue sin dependencia del framework original, y un tamaño de repositorio muy reducido (0,1 GB), lo que lo hace apto para entornos con recursos limitados. La versión publicada es la única disponible; el candidato para teléfono evaluado antes del lanzamiento es un resultado documentado, no un modelo liberado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de líneas GW-DET-001 + reconocedor de líneas CTC GW-REC-034, con paso de ordenación de lectura |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa líneas de texto individuales, no secuencias largas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 para los pesos; Apache-2.0 para el código del paquete `glypharis` |
| Formato de pesos | PyTorch (`detector.pt`, `recognizer.pt`) y ONNX opset 17 (`detector.onnx`, `recognizer.onnx`) |
| Tarea | image-to-text (OCR de líneas) |
| Tamaño del repositorio | 0,1 GB |
| Versión del modelo | `glypharis_v1` |
| Versión del paquete | `glypharis` 1.0.0 |
| Requisito de Python | 3.11 (>= 3.11.4, < 3.12) |

## Arquitectura y entrenamiento

El sistema no es un transformer único de extremo a extremo, sino una composición de dos modelos especializados. El primero, GW-DET-001, es un detector de líneas de texto que localiza las regiones de texto en la página. El segundo, GW-REC-034, es un reconocedor de líneas basado en CTC (Connectionist Temporal Classification), que recibe cada línea recortada y produce su transcripción. Un paso posterior ordena las líneas según el orden de lectura para componer el texto final de la página. Ambos modelos se distribuyen en PyTorch y en ONNX (opset 17), lo que permite inferencia sin el framework original.

Los pesos se entrenaron con datos de HierText y Open Images, según la atribución recogida en `NOTICE.md`. El archivo `model_info.json` documenta la composición del entrenamiento, la configuración congelada, los identificadores de experimento, el tag y commit del código, y un enlace a la model card en el tag. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un OCR de este tipo). La innovación técnica destacable es la verificación de integridad: el manifiesto incluye el SHA-256 de cada archivo de pesos y el cargador del bundle comprueba cada hash al cargar el modelo.

## Capacidades

- Detección de líneas de texto en imágenes de documentos (GW-DET-001).
- Reconocimiento de texto impreso en inglés por línea mediante CTC (GW-REC-034).
- Devolución de texto completo de la página en orden de lectura.
- Salida estructurada por línea: texto, caja delimitadora (`bbox`), confianza y tiempo de procesamiento.
- Entrada flexible: ruta a archivo, bytes de imagen, imagen PIL o array de NumPy.
- Inferencia en PyTorch o en ONNX (opset 17).
- Verificación de integridad de los pesos mediante SHA-256 fijados en el manifiesto y en el paquete.
- Herramienta de línea de comandos `glypharis-check` para validar archivos y ejecutar una página de muestra.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento; es un OCR especializado.

## Casos de uso

- Digitalización de archivos administrativos: el pipeline detecta y transcribe las líneas de cada página escaneada en inglés, devolviendo texto en orden de lectura junto con las cajas delimitadoras para conservar la trazabilidad del original.
- Extracción de texto en sistemas de gestión documental: la salida por línea con `confidence` permite filtrar líneas de baja confianza para revisión humana, integrándose en flujos de validación.
- Procesamiento por lotes en servidores sin GPU dedicada: los pesos ONNX (opset 17) y el reducido tamaño del bundle (0,1 GB) permiten desplegar la inferencia en entornos CPU o con aceleración limitada.
- Auditoría de integridad en producción: el cargador verifica el SHA-256 de cada archivo de pesos contra el manifiesto, lo que permite garantizar que el modelo desplegado es exactamente el publicado.
- Digitalización de documentos históricos impresos en inglés: el reconocedor de líneas basado en CTC está pensado para texto impreso, adecuado para corpus escaneados de tipografía legible.
- Integración en pipelines de Python: la API `GlypharisOCR.from_pretrained` y `predict` acepta rutas, bytes, PIL o NumPy, lo que facilita su incorporación en scripts de preprocesado y extracción ya existentes.
- Verificación previa al despliegue: `glypharis-check` valida todos los archivos contra el manifiesto y ejecuta una página de muestra del paquete, útil en CI para comprobar que el bundle instalado es el correcto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del bundle (0,1 GB) sugiere un modelo ligero, pero no se especifican parámetros ni requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: paquete Python `glypharis` 1.0.0 (Python 3.11), con pesos PyTorch y ONNX (opset 17); descarga del bundle vía `glypharis.download_model` (activo de la release de GitHub) o vía `hf download` desde el espejo de Hugging Face.
- Latencia y throughput: no disponibles; la salida incluye tiempos por línea, pero no se publican cifras agregadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no está entrenado para otros idiomas.
- Diseñado para texto impreso en imágenes de documentos; no se documenta su comportamiento en texto manuscrito, escenas naturales o tipografías muy degradadas.
- No se publican métricas de precisión, por lo que no es posible cuantificar su tasa de error ni su riesgo de alucinación en la transcripción.
- Los pesos están bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y de compartir bajo la misma licencia las obras derivadas; conviene revisar la compatibilidad con el uso comercial previsto.
- El código del paquete es Apache-2.0, pero la licencia de los pesos es distinta; hay que respetar ambas por separado.
- El repositorio de Hugging Face es un espejo; la copia de referencia es el activo de la release de GitHub, verificado contra los hashes fijados en `glypharis/hub.py`. Si ambos difieren, prevalece el activo de la release.
- El paquete requiere Python 3.11 (>= 3.11.4, < 3.12); no es compatible con versiones anteriores ni con 3.12 o superiores.
- `from_pretrained` no descarga nada: hay que colocar el bundle manualmente o usar `download_model`; una carpeta instalada a mano no tiene registro de descarga, lo cual es esperado.
- El candidato para teléfono evaluado antes del lanzamiento no es un modelo liberado y no debe usarse.
- No se documentan sesgos específicos más allá de la limitación al inglés y al texto impreso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DuhItzAniket/glypharis-v1
- Repositorio en GitHub (tag v1.0): https://github.com/DuhItzAniket/Glypharis/tree/v1.0
- Release v1.0: https://github.com/DuhItzAniket/Glypharis/releases/tag/v1.0
- Informe de verificación del paquete: https://github.com/DuhItzAniket/Glypharis/blob/v1.0/reports/release/pack_check.json
