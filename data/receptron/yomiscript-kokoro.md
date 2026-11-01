# receptron/yomiscript-kokoro

## Resumen

`receptron/yomiscript-kokoro` es una reexportación a ONNX del modelo de síntesis de voz Kokoro-82M de hexgrad, dividida en tres grafos independientes (codificador de texto y predictor de duración, predictor de F0 y energía, y decodificador). No se trata de un modelo nuevo ni de un reentrenamiento: el autor, receptron, únicamente convierte los pesos originales a ONNX para integrarlos en su herramienta de lectura asistida yomiscript, que incluye una CLI, un paquete npm (`@yomiscript/kokoro`) y un servidor MCP.

La motivación técnica de la división es permitir que un consumidor externo (el denominado "Katarite" en yomiscript) sustituya la curva de F0 predicha antes de ejecutar el decodificador, algo imposible con un export monolítico. Además, el decodificador incorpora una versión exacta en ONNX de `torch.stft`/`torch.istft`, frente a la aproximación que usa el export ONNX oficial de Kokoro.

Con 82 millones de parámetros, el modelo es muy ligero (el repositorio ocupa 0,5 GB e incluye pesos fp32 y fp16), lo que lo hace apto para inferencia en navegador y en CPU. La licencia es Apache 2.0, heredada de Kokoro-82M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (StyleTTS2-like con predictor de duración, predictor de F0/energía y decodificador con STFT), exportada a ONNX |
| Parametros totales | 82 millones (modelo base Kokoro-82M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la longitud de entrada la determina el fonemizador externo) |
| Tipos de cuantizacion | fp32 (`enc.onnx`, `f0n.onnx`, `dec.onnx`) y fp16 en pesos (`*_w16.onnx`, 163 MB en total) |
| Idiomas soportados | no disponible en la informacion proporcionada (depende de los voice packs de Kokoro) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`enc.onnx`, `f0n.onnx`, `dec.onnx` y variantes `_w16.onnx`); voice packs en `.bin` float32 con forma 510 x 1 x 256 |

## Arquitectura y entrenamiento

El modelo es una conversión directa de Kokoro-82M, un TTS de 82 M de parámetros con arquitectura basada en StyleTTS2. El pipeline se ha fragmentado en tres grafos ONNX: `enc.onnx` (codificador de texto y predictor de duración), `f0n.onnx` (predictor de F0 y energía) y `dec.onnx` (decodificador con STFT/iSTFT). Esta separación permite interceptar y modificar la F0 predicha entre el segundo y el tercer grafo, lo que habilita control prosódico externo antes de la síntesis final.

No hay entrenamiento nuevo: los pesos provienen íntegramente de `hexgrad/Kokoro-82M` y el autor indica que, con las mismas entradas y el mismo ruido, los grafos reproducen el Kokoro original de PyTorch dentro de su propia variabilidad entre ejecuciones. La innovación técnica destacable es la implementación exacta en ONNX de `torch.stft`/`torch.istft` en el decodificador, en contraste con la STFT aproximada del export ONNX convencional. Los scripts de exportación (`demo/ys_web/export_split.py`, `exact_stft.py`, `quant.py`) están en el repositorio de yomiscript.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con voice packs seleccionables en formato float32.
- Control de prosodia mediante sustitución de la curva F0 predicha antes del decodificador.
- Inferencia en navegador gracias a las variantes fp16 (`*_w16.onnx`, 163 MB).
- Inferencia en CPU y entornos sin GPU mediante ONNX Runtime.
- Integración con la CLI de yomiscript, el paquete `@yomiscript/kokoro` y el servidor `@yomiscript/mcp` (descarga automática de los ficheros en el primer uso).
- Reproducción fiel del Kokoro-82M original dentro de su dispersión entre ejecuciones.
- No dispone de tool calling, agentes, visión, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura asistida de documentos: yomiscript usa estos grafos para narrar texto con control de la entonación, ajustando la F0 para mejorar la naturalidad en pasajes largos.
- Aplicaciones web de TTS sin backend: las variantes fp16 (163 MB) permiten sintetizar voz directamente en el navegador con ONNX Runtime Web.
- Herramientas de accesibilidad en local: al ejecutarse en CPU con ONNX Runtime, encaja en lectores de pantalla y asistentes de escritorio sin dependencia de servicios en la nube.
- Control prosódico en doblaje y postproducción: la separación de `f0n.onnx` y `dec.onnx` permite inyectar contornos de F0 editados manualmente antes de la síntesis.
- Integración en pipelines MCP: el servidor `@yomiscript/mcp` puede exponer la síntesis de voz como herramienta a agentes que necesiten generar audio bajo demanda.
- Prototipado rápido de voces: los voice packs en `.bin` (510 x 1 x 256) son idénticos a los de `onnx-community/Kokoro-82M-v1.0-ONNX`, lo que facilita intercambiar voces sin reconvertir el modelo.
- Servicios de narración de bajo coste: con 82 M de parámetros, el coste por inferencia en CPU es reducido frente a modelos TTS de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma equivalencia funcional con el Kokoro-82M original de PyTorch dentro de su dispersión entre ejecuciones, sin métricas objetivas (MOS, WER, latencia).

## Requisitos de hardware

- VRAM: no aplica en la mayoría de despliegues; el modelo corre en CPU. En GPU, los 82 M de parámetros en fp32 ocupan del orden de 330 MB de pesos, y en fp16 unos 165 MB, más el estado de activación.
- GPU recomendadas: cualquiera con soporte ONNX Runtime (CUDA o TensorRT); no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es suficiente.
- Cabe holgadamente en GPU de consumo y en navegador con las variantes `_w16.onnx`.
- Opciones de despliegue: ONNX Runtime (Python, JS/Web, C++), yomiscript CLI, `@yomiscript/kokoro`, servidor `@yomiscript/mcp`. No se distribuyen pesos en GGUF ni formato para vLLM, llama.cpp u Ollama, que no son aplicables a un TTS de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| receptron/yomiscript-kokoro | 82 M | ONNX dividido (fp32/fp16) | no aplica | Apache 2.0 | Control de F0 entre grafos; STFT exacta |
| hexgrad/Kokoro-82M | 82 M | PyTorch | no aplica | Apache 2.0 | Modelo original; sin división ni control externo de F0 |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82 M | ONNX monolítico | no aplica | Apache 2.0 | Export oficial; STFT aproximada; voice packs compatibles |

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier sesgo, alucinación fonética o limitación de idioma del Kokoro-82M original se hereda sin cambios.
- Los idiomas soportados dependen de los voice packs de Kokoro y no se detallan en la información disponible; conviene verificar la cobertura antes de usarlo en producción multilingüe.
- La calidad de la síntesis depende del fonemizador y del voice pack elegidos, no solo del grafo ONNX.
- El repositorio solo reexporta pesos; no hay garantía de mantenimiento ni de soporte por parte de hexgrad.
- Aunque la licencia Apache 2.0 permite uso comercial, deben respetarse las condiciones del modelo base y de los voice packs utilizados.
- El control manual de F0 puede producir artefactos audibles si el contorno inyectado se aleja de la distribución de entrenamiento.
- No incluye tool calling, agentes ni multimodalidad; su uso está acotado a TTS.

## Enlaces

- HuggingFace: https://huggingface.co/receptron/yomiscript-kokoro
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Export ONNX de referencia (voice packs compatibles): https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Repositorio yomiscript: https://github.com/receptron/yomiscript
