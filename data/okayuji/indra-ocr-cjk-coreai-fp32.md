# okayuji/indra-ocr-cjk-coreai-fp32

## Resumen

Indra OCR CJK recognizer for Core AI es un componente de investigación publicado por el usuario okayuji en Hugging Face. No se trata de un modelo completo de OCR, sino de una conversión aislada del reconocedor de líneas de texto del pipeline Indra OCR (desarrollado por datalab-to) al runtime Core AI de Apple. El paquete devuelve puntuaciones de caracteres (logits CTC) para exactamente diez líneas de texto ya preparadas, en japonés, chino, coreano e inglés.

El modelo base es `datalab-to/indra-ocr`, del que este repositorio hereda la arquitectura del componente de reconocimiento. La conversión preserva los pesos originales en FP32 sin cuantización ni reentrenamiento, y el objetivo declarado es servir como material de verificación de la conversión a Core AI y como base para desarrolladores que construyan su propio host de reconocimiento de líneas.

Es relevante en el contexto del ecosistema Apple Silicon: demuestra la viabilidad de ejecutar componentes de OCR especializados en CJK mediante el runtime Core AI, aunque con limitaciones severas de alcance (formas fijas, sin detección de líneas, sin decodificación con modelo de lenguaje). No es un modelo de propósito general ni sustituye al pipeline Indra OCR completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de reconocimiento de líneas con salida CTC (componente del pipeline Indra OCR); detalles internos de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 10 líneas × 1 canal × 32 × 528 píxeles, 132 pasos temporales por línea |
| Tipos de cuantización | FP32 únicamente; sin cuantización aplicada |
| Idiomas soportados | japonés (ja), chino (zh), coreano (ko), inglés (en) |
| Licencia | modified-openrail-m (OpenRAIL modificada) |
| Formato de pesos | Core AI `.aimodel` (`rec_cjk_fp32.aimodel`, 10.181.240 bytes); vocabulario en `vocab.json` |

## Arquitectura y entrenamiento

El componente es un reconocedor de líneas de texto que forma parte del pipeline Indra OCR. La arquitectura interna concreta (número de capas, dimensión oculta, mecanismo de atención) no se detalla en la información disponible. La salida es un tensor de logits CTC de forma `[10, 132, 11750]`, donde la clase 0 es el token blank de CTC y las clases `i > 0` mapean a `vocab.json["chars"][i - 1]`. El vocabulario cubre 11.749 caracteres CJK e ingleses.

No se ha reentrenado ni ajustado el modelo: la conversión parte del reconocedor ONNX FP32 original de Indra OCR como referencia numérica. La verificación reportada compara logits entre el ONNX original y el asset Core AI con nRMSE entre 3,63e-7 y 8,34e-7 (umbral declarado 1e-4), y confirma coincidencia en IDs de tokens greedy, longitudes válidas y orden de los ocho tokens más probables. Se eliminaron ubicaciones de depuración mediante la API de autoría de Core AI, y un digest de IR genérico (incluyendo constantes y recursos) coincidió antes y después del stripping y tras recargar el asset publicado.

El preprocesado de entrada no está incluido: el host debe expandir cada caja de tinta detectada 0,2 alturas de línea arriba y abajo y 0,3 a izquierda y derecha, redimensionar a altura 32 preservando aspecto, convertir a mapa de tinta y aplicar las reglas de recorte y padding del repositorio upstream de Indra. La decodificación incluida es CTC greedy; la búsqueda por haz con modelo de lenguaje y el filtrado por confianza no forman parte del paquete.

## Capacidades

- Reconocimiento de líneas de texto CJK e inglés a partir de mapas de tinta ya preparados (no acepta imágenes de página directamente).
- Procesamiento por lotes fijo de exactamente diez líneas simultáneas.
- Salida de logits CTC sin normalizar, apta para decodificación greedy o para integrarse en un decodificador propio con modelo de lenguaje.
- Soporte multilingüe en el reconocedor: japonés, chino, coreano e inglés, según el vocabulario upstream.
- Verificación de integridad de assets mediante `manifest.json` y comprobación de hashes en el script de ejemplo.
- No incluye detección de página, análisis de layout, orientación, enrutado de escritura ni decodificación con modelo de lenguaje.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá del reconocimiento de texto.

## Casos de uso

- Verificación de conversiones Core AI: el paquete sirve como referencia numérica para validar que una conversión propia de un reconocedor OCR a Core AI produce logits equivalentes al ONNX original, usando `verification.json` como evidencia de partida.
- Desarrollo de hosts de reconocimiento de líneas en macOS: un desarrollador que construya su propio pipeline de OCR puede usar este componente como etapa de reconocimiento, alimentándolo con mapas de tinta generados por su propio detector de líneas.
- Investigación sobre OCR CJK en Apple Silicon: permite experimentar con el reconocimiento de japonés, chino y coreano en hardware Apple sin depender del pipeline completo de Indra, aislando el comportamiento del reconocedor.
- Integración en herramientas de digitalización de documentos en macOS: tras detectar y recortar líneas con un componente propio, este reconocedor puede transcribir texto CJK en aplicaciones locales que requieran privacidad y ejecución en dispositivo.
- Evaluación de decodificadores CTC alternativos: al exponer logits crudos, permite comparar decodificación greedy frente a búsqueda por haz con modelos de lenguaje propios para medir el impacto en calidad.
- Pruebas de regresión de infraestructura: el script `run_cjk.py` con smoke test de entrada en blanco y comprobación de hashes puede integrarse en CI para detectar corrupción de assets o cambios de ABI en el runtime Core AI.
- Docencia y prototipado: como componente pequeño (10,18 MB) y con contrato de entrada/salida documentado en `abi.json`, resulta adecuado para explicar pipelines CTC y preprocesado de líneas OCR en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad OCR (precisión de caracteres, tasa de error de palabra) en la información disponible. La única métrica reportada es la fidelidad numérica de la conversión:

| Métrica | Resultado |
|---|---|
| nRMSE de logits frente a ONNX FP32 original | 3,63e-7 a 8,34e-7 (umbral declarado 1e-4) |
| Coincidencia de tokens greedy | sí |
| Coincidencia de longitudes válidas | sí |
| Coincidencia de orden top-8 de tokens | sí |
| Igualdad bit a bit tras stripping y recarga | sí, en las tres condiciones de prueba |

Las condiciones de prueba fueron un lote capturado de una página japonesa sintética, entrada sin tinta y el mismo lote a intensidad 0,75. El entorno de medida fue Apple M5 Max (Mac17,6), 128 GiB de RAM, macOS 27.2, Python 3.11.9, torch 2.9.0, coreai-torch 0.4.3, coreai-core 1.0.0b3 y ONNX Runtime 1.31.1. El autor indica explícitamente que no se realiza ninguna afirmación sobre velocidad del componente ni sobre memoria mínima.

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple Silicon; el autor ha probado en Apple M5 Max con 128 GiB de RAM.
- Sistema operativo: macOS 27 o posterior.
- Python 3.11 con `coreai-core==1.0.0b3`, `numpy==2.4.6` y `huggingface_hub==2.4.0`.
- Tamaño del asset: 10.181.240 bytes para `rec_cjk_fp32.aimodel`; el autor advierte que el tamaño de fichero no equivale a memoria de proceso y que no se establece ningún presupuesto de memoria para iPhone.
- La primera carga o llamada puede incluir especialización del runtime; no se documenta latencia ni throughput.
- Integración con iPhone y Swift no probada según el autor.
- Opciones de despliegue: exclusivamente el runtime Core AI de Apple mediante el script `run_cjk.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros reconocedores OCR CJK ni con conversiones alternativas a Core AI. El único punto de referencia citado es el reconocedor ONNX FP32 original de Indra OCR, del que este paquete es una conversión, no una alternativa.

## Limitaciones y advertencias

- No acepta imágenes de página ni PDF; solo tensores de mapas de tinta con forma fija `[10, 1, 32, 528]` y máscara `[10, 1, 132]`.
- Perfil tensorial fijo: no validado para lotes, alturas o anchos variables.
- No incluye detección de líneas, layout, orientación, enrutado de escritura, reconstrucción de tablas ni los otros siete componentes neuronales del pipeline Indra, ni los modelos de lenguaje n-grama.
- No sustituye al paquete completo `indra-ocr`.
- Calidad en escritura vertical no validada.
- Decodificación incluida únicamente CTC greedy, sin modelo de lenguaje ni filtrado por confianza, lo que reduce la calidad frente al pipeline completo.
- Sin benchmark de velocidad ni de memoria; la especialización en la primera llamada puede añadir latencia no cuantificada.
- No probado en iPhone ni con integración Swift; solo en macOS 27 con Apple Silicon.
- No se han evaluado liberación de recursos de larga duración ni cancelación.
- Licencia modified-openrail-m: incluye restricciones de uso que deben revisarse en `LICENSE` antes de cualquier uso comercial; el autor la etiqueta como componente de investigación.
- Riesgo de sesgos y alucinaciones del reconocedor base no documentado en la información disponible; al ser un modelo de OCR, los errores se manifiestan como sustituciones, omisiones o inserciones de caracteres, no como texto inventado de forma libre.
- El vocabulario está limitado a los caracteres CJK e ingleses presentes en `vocab.json`; caracteres fuera de ese conjunto no pueden producirse.
- Si el helper reporta `Payload verification failed`, el autor recomienda redescargar la misma revisión en otra carpeta y comparar el manifest.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/okayuji/indra-ocr-cjk-coreai-fp32
- Modelo base: https://huggingface.co/datalab-to/indra-ocr
- Reglas de recorte y padding upstream: https://github.com/datalab-to/indra/blob/3d4eb013ae1c8e18a6568a7b889b8ebb27668d34/indra_ocr/rec_preproc.py
- Repositorio Indra OCR: https://github.com/datalab-to/indra
- Ficheros de contrato y verificación en el repo: `abi.json`, `manifest.json`, `verification.json`, `LICENSE`, `NOTICE`, `LICENSE-CODE`
