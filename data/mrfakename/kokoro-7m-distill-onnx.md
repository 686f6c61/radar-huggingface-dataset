# mrfakename/Kokoro-7M-Distill-ONNX

## Resumen

Kokoro-7M-Distill-ONNX es la exportación a formato ONNX del modelo oddadmix/Kokoro-7M-Distill, un modelo de síntesis de voz (text-to-speech) de tan solo 7,48 millones de parámetros, destilado a partir de hexgrad/Kokoro-82M. Lo publica el desarrollador mrfakename y está pensado específicamente para inferencia en el navegador mediante onnxruntime-web sobre WebGPU, además de funcionar en entornos WASM.

El modelo resuelve la síntesis de voz en inglés estadounidense en escenarios donde el tamaño y la latencia importan: al reducir de 82M a 7,48M parámetros, el grafo ONNX en fp32 ocupa solo 30,6 MB (15,7 MB en int8 dinámico), lo que permite cargarlo y ejecutarlo en cliente sin servidor. Mantiene exactamente la misma interfaz de entrada/salida que onnx-community/Kokoro-82M-v1.0-ONNX, por lo que cualquier runtime compatible con el grafo de 82M puede cargar este modelo sin cambios.

Su relevancia actual radica en el nicho de aplicaciones web de accesibilidad, lectores de texto y asistentes embebidos que necesitan TTS local sin depender de APIs en la nube, con licencia Apache-2.0 y un vocabulario idéntico al de Kokoro-82M. La longitud de entrada está acotada a 512 tokens de fonemas, y el modelo no genera texto, razonamiento ni código: es exclusivamente un sintetizador acústico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estilo StyleTTS2 (Kokoro), exportada como grafo ONNX opset 17 (KModelForONNX) |
| Parametros totales | 7,48 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | entrada limitada a T <= 512 tokens de fonemas, rellenados con 0 en ambos extremos |
| Tipos de cuantizacion | fp32 (recomendada) y int8 dinamica (MatMul/Gemm/Conv) |
| Idiomas soportados | ingles (ingles estadounidense, fonemas misaki `misaki.en.G2P`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) + voice packs `.bin` float32 |

Detalles de entrada/salida del grafo:

| Entrada | Forma | Notas |
|---|---|---|
| `input_ids` | int64 `[1, T]` | ids de token Kokoro, T <= 512 |
| `style` | float32 `[1, 256]` | fila `T-3` de un voice pack |
| `speed` | float32 `[1]` | 1.0 = velocidad normal |

Salidas: `waveform` (float32 a 24 kHz) y `duration` (frames por token).

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Kokoro, que a su vez deriva de StyleTTS2: un modelo acústico que toma ids de fonemas y un vector de estilo de 256 dimensiones para producir una forma de onda a 24 kHz. Esta variante concreta es un estudiante de 7,48M parámetros destilado desde el profesor Kokoro-82M, reduciendo el tamaño en más de un orden de magnitud. La exportación se realizó cargando el checkpoint original a través del paquete `kokoro_patched` con `disable_complex=True` y exportando `KModelForONNX` con opset 17; el grafo fp32 coincide exactamente con el modelo PyTorch en longitud de salida, y las formas de onda solo difieren por el ruido de fase aleatorio de la fuente armónica.

El front-end de texto es crítico y está fijado por el entrenamiento: el modelo se entrenó con fonemas generados por misaki (rutas `misaki.en.G2P`, inglés de EE. UU.), igual que Kokoro-82M. Alimentarlo con la salida cruda de espeak-ng provoca errores de pronunciación en diptongos, porque misaki emplea caracteres únicos `A I O W Y`. La demo incluye un port a JavaScript llamando `misaki.js` con espeak-ng como respaldo para vocabulario fuera de cobertura. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de fonemas misaki.
- Generacion de onda a 24 kHz con control de velocidad mediante el parametro `speed` (1.0 = normal).
- Control de identidad de voz mediante voice packs de estilo (vectores float32 `[510, 1, 256]`).
- Inferencia en navegador sobre WebGPU con onnxruntime-web, y tambien en WASM.
- Compatibilidad drop-in con runtimes Kokoro que acepten el grafo de 82M, incluida la pipeline `StyleTextToSpeech2Model` de transformers.js, gracias a vocabulario e I/O identicos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni generacion de texto: es exclusivamente un sintetizador acustico.

## Casos de uso

- Lectura por voz en el navegador para accesibilidad: al ocupar 30,6 MB en fp32, el modelo puede descargarse y ejecutarse en cliente con WebGPU, ofreciendo TTS local sin enviar texto a un servidor.
- Extensiones de navegador de lectura asistida: integrable via onnxruntime-web o transformers.js para leer articulos o correos con latencia por debajo de tiempo real en WebGPU.
- Asistentes embebidos y aplicaciones de escritorio: el tamano reducido permite empaquetarlo junto a la aplicacion y ejecutarlo en CPU con WASM si no hay GPU disponible.
- Prototipado rapido de interfaces de voz: la compatibilidad con el grafo Kokoro-82M permite sustituir el modelo grande por este sin reescribir el pipeline, util para comparar latencia y calidad.
- Localizacion de contenido preexistente: al compartir vocabulario con Kokoro-82M, se puede reutilizar parte del tooling de fonemizacion misaki y los voice packs existentes (`af_msa.bin`, `af_heart.bin`).
- Educacion y demos interactivas: la demo publica en Spaces (`mrfakename/kokoro-7m-distill-webgpu`) sirve como referencia para desplegar TTS en WebGPU en un solo clic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El unico dato de rendimiento aportado es cualitativo: el grafo fp32 "corre bien por encima de tiempo real en WebGPU" segun la model card. No se proporcionan cifras de MOS, WER, latencia en milisegundos ni throughput. La model card indica ademas que la variante int8 dinamica suena notablemente mas ruidosa y es mas lenta en CPU que fp32 para este modelo, por lo que la demo no la utiliza.

## Requisitos de hardware

- VRAM estimada: minima. El grafo fp32 pesa 30,6 MB y el int8 15,7 MB; con las activaciones de un modelo de 7,48M parametros, la huella cabe holgadamente en cualquier GPU moderna, incluida grafica integrada.
- GPU recomendadas: cualquier GPU con soporte WebGPU para la ruta de navegador; en servidor, cualquier GPU consumer o de datacenter sirve por el tamano. El cuello de botella real es el front-end de fonemizacion (misaki), no el modelo acustico.
- Cabe en GPU consumer: si, en practicamente todas. Tambien en CPU moderna via WASM, aunque con mas latencia.
- Opciones de despliegue: onnxruntime-web (WebGPU y WASM), transformers.js con la pipeline `StyleTextToSpeech2Model`, y en general cualquier runtime Kokoro capaz de cargar el grafo de I/O de Kokoro-82M.
- Latencia y throughput: no disponibles como cifras; la model card solo afirma que fp32 supera tiempo real en WebGPU y que int8 es mas lento en CPU que fp32.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto / entrada | Notas |
|---|---|---|---|---|---|
| mrfakename/Kokoro-7M-Distill-ONNX | 7,48M | ONNX (fp32, int8) | Apache-2.0 | < 512 tokens de fonemas | Estudiante destilado, optimizado para WebGPU/WASM |
| oddadmix/Kokoro-7M-Distill | 7,48M | PyTorch (checkpoint original) | Apache-2.0 | no disponible | Modelo base del que procede esta exportacion |
| hexgrad/Kokoro-82M | 82M | PyTorch / ONNX (via onnx-community) | Apache-2.0 | misma interfaz de E/S | Profesor; mayor calidad presumible, ~11x mas parametros |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82M | ONNX | Apache-2.0 | mismo contrato de E/S | Referencia de compatibilidad; I/O y vocabulario identicos |

Datos de rendimiento comparativo (MOS, WER, latencia): no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles estadounidense; no hay soporte multilingue declarado.
- El front-end es obligatorio y especifico: usar misaki (`misaki.en.G2P`). Alimentar espeak-ng crudo provoca malas pronunciaciones de diptongos por el mapeo `A I O W Y`.
- Entrada acotada a 512 tokens de fonemas; fragmentos de texto largos deben trocearse.
- La cuantizacion int8 dinamica degrada la calidad audible ("notablemente mas ruidosa") y es mas lenta que fp32 en CPU para este modelo; no se recomienda en produccion.
- El voice pack `af_heart.bin` no se uso durante el entrenamiento del estudiante, por lo que su comportamiento con el es peor que con `af_msa.bin`, el usado en la destilacion.
- No hay fichero fp16 disponible.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones incorrectas ante entradas anomalas o fuera de distribucion.
- No hay datos publicos de sesgos, evaluacion de calidad objetiva ni benchmarks, lo que dificulta comparar su calidad frente a Kokoro-82M.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del front-end misaki y de los voice packs utilizados por separado.
- Las diferencias de forma de onda frente al modelo PyTorch son atribuibles al ruido de fase aleatorio de la fuente armonica, no a diferencias de contenido.

## Enlaces

- HuggingFace: https://huggingface.co/mrfakename/Kokoro-7M-Distill-ONNX
- Modelo base (estudiante en PyTorch): https://huggingface.co/oddadmix/Kokoro-7M-Distill
- Profesor: https://huggingface.co/hexgrad/Kokoro-82M
- Referencia de compatibilidad ONNX: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Demo en WebGPU: https://huggingface.co/spaces/mrfakename/kokoro-7m-distill-webgpu
- Front-end misaki: https://github.com/hexgrad/misaki
