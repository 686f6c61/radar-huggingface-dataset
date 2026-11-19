# dissembill/mirror-gemma-4-12b-qat-4bit

## Resumen

Mirror-gemma-4-12b-qat-4bit es una cuantizacion de precision mixta en formato MLX del modelo Google Gemma-4 12B instruct, construida por el usuario dissembill a partir del checkpoint base `google/gemma-4-12B-it-qat-q4_0-unquantized`. El modelo parte de pesos entrenados con quantization-aware training (QAT) por Google y aplica encima una asignacion de bits por capa guiada por sensibilidad, de modo que las capas mas fragiles se mantienen en 8 bits y las robustas quedan en 4 bits. El resultado es un artefacto de aproximadamente 5,25 bits por peso (unos 9 GB en repositorio) que supera a una cuantizacion uniforme de 4 bits del mismo base QAT en +1,37 puntos de Capability Score.

El modelo tiene 11.907.350.272 parametros (unos 11,9 mil millones) y pertenece a la familia unificada Gemma-4 (`model_type: gemma4_unified`), lo que significa que integra torre de texto y torre de vision en un unico artefacto: la parte de texto va cuantizada y la torre de vision se distribuye como sidecar en bf16 (`optiq_vision.safetensors`). Esta pensado para inferencia local en Apple Silicon mediante la libreria `mlx-lm` y el toolkit `mlx-optiq`, sin PyTorch ni cloud.

Su relevancia ahora es practica: demuestra que el QAT de Google y la asignacion por capas de precision mixta son complementarios, y ofrece un camino reproducible para ejecutar un modelo de 12B multimodal con contexto conversacional en hardware de consumo Apple. La licencia declarada es Apache-2.0, aunque la model card enlaza a la licencia propia de Gemma-4 de Google, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer unificado Gemma-4 (`gemma4_unified`), torre de texto cuantizada + torre de vision bf16 |
| Parametros totales | 11.907.350.272 (~11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Precision mixta 4/8 bits: 157 componentes a 8 bits, 171 a 4 bits, 328 componentes cuantizados; 5,25 bits por peso; group size 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia Gemma-4 de Google) |
| Formato de pesos | safetensors (MLX), sidecar `optiq_vision.safetensors` en bf16 |
| Base | google/gemma-4-12B-it-qat-q4_0-unquantized (QAT) |
| Libreria | mlx |
| Tamano del repositorio | 9,0 GB |
| Pipeline | text-generation, image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer unificado de la familia Gemma-4 con identificador `gemma4_unified`, que combina una torre de texto y una torre de vision en un mismo modelo. El checkpoint base fue entrenado por Google con quantization-aware training (QAT) especificamente para tolerar cuantizacion de 4 bits (`q4_0`), de modo que los pesos ya incorporan robustez frente a la reduccion de precision antes de cualquier post-procesado.

Sobre ese base QAT, el autor aplica una asignacion de precision mixta guiada por sensibilidad: se realiza un barrido de divergencia KL sobre una mezcla de calibracion de seis dominios (prosa, razonamiento, codigo, agente, tool-call e instrucciones con restricciones) y las capas sensibles se elevan a 8 bits mientras las robustas permanecen en 4 bits. El resultado logra 5,25 bits por peso frente a 4,0 de una cuantizacion uniforme, con el presupuesto extra invertido solo donde aporta. La model card menciona ademas soporte de decodificacion especulativa mediante un drafter (`gemma-4-12B-it-qat-q4_0-unquantized-assistant`) servido a traves de `optiq serve --drafter`.

## Capacidades

- Generacion de texto conversacional en modo instruct (`it`).
- Entrada imagen+texto: la torre de vision en bf16 permite tareas image-text-to-text a traves de `optiq`.
- Razonamiento y matematicas: el benchmark GSM8K reportado alcanza 93,3%.
- Generacion de codigo: HumanEval pass@1 reportado de 91,5%.
- Tool calling / function calling: evaluado con BFCL-V3 simple (72,0%).
- Seguimiento de instrucciones con restricciones: IFEval estricto al 73,6%.
- Razonamiento multi-paso y uso como agente: la calibracion incluye dominios de agente y tool-call, y el modelo se evalua con BFCL.
- Contexto largo: evaluado con HashHop (35,0%), aunque la longitud de contexto nominal no se especifica.
- Decodificacion especulativa opcional mediante drafter compatible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se carga con `mlx-lm` y `optiq` en Apple Silicon, permitiendo un chatbot instruct multi-turno sin conexion a cloud y con un artefacto de ~9 GB.
- Analisis de imagenes con texto: gracias a la torre de vision bf16, se puede usar para describir capturas, extraer datos de documentos escaneados o responder preguntas sobre imagenes desde una unica carga del modelo.
- Generacion de codigo en flujos de desarrollo local: su HumanEval de 91,5% pass@1 y su soporte de tool calling lo hacen apto para autocompletado, refactorizacion y generacion de tests integrados en editores o scripts.
- Automatizacion de agentes con llamadas a herramientas: el 72,0% en BFCL-V3 simple y la calibracion en dominios de agente y tool-call lo orientan a orquestar APIs y funciones en pipelines multi-paso.
- Razonamiento matematico y resolucion de problemas: el 93,3% en GSM8K permite usarlo para tutoria, verificacion de calculos y generacion de explicaciones paso a paso.
- Procesamiento de instrucciones con restricciones: util para generacion de JSON estricto, plantillas y respuestas con formato fijo, apoyado por el 73,6% en IFEval estricto.
- Prototipado e investigacion en cuantizacion: sirve como referencia reproducible para estudiar el efecto de la precision mixta sobre un base QAT, comparando contra la variante uniforme de 4 bits.

## Benchmarks y rendimiento

Resultados reportados en la model card, comparados contra una cuantizacion uniforme de 4 bits del mismo base QAT:

| Benchmark | Este modelo (OptiQ, base QAT) | Uniforme-4 (base QAT) | Delta |
|---|---|---|---|
| MMLU (5-shot, 1000) | 52,5% | 50,9% | +1,6 |
| GSM8K (1000) | 93,3% | 93,1% | +0,2 |
| IFEval (completo, estricto) | 73,6% | 72,3% | +1,3 |
| BFCL-V3 simple (200) | 72,0% | 72,5% | -0,5 |
| HumanEval (pass@1, 164) | 91,5% | 90,9% | +0,6 |
| HashHop (contexto largo) | 35,0% | 30,0% | +5,0 |
| Capability Score (media) | 69,64 | 68,27 | +1,37 |

La model card indica que la ganancia de +1,37 puntos es coherente con la observada en otros tamanos QAT de Gemma-4 (E2B +2,09, E4B +1,19).

## Requisitos de hardware

- VRAM/unificada estimada: el artefacto ocupa unos 9,0 GB en disco; en Apple Silicon la memoria unificada necesaria para cargar pesos y ejecutar inferencia ronda ese orden de magnitud, sin cifra oficial de pico.
- GPU recomendadas: el modelo esta empaquetado para MLX, por lo que el hardware objetivo son chips Apple Silicon (series M). No se documentan requisitos para A100, H100 o RTX 4090, y el formato no es directamente compatible con CUDA sin conversion.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente para alojar ~9 GB de pesos mas overhead de ejecucion; no se especifica el minimo exacto.
- Opciones de despliegue: `mlx-lm` desde `main` (la version 0.31.3 de PyPI no incluye la torre de texto unificada) junto con `import optiq`; servidor mediante `optiq serve --model ... --drafter ...`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Se menciona soporte de decodificacion especulativa con drafter, que habitualmente reduce latencia, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Capability Score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (OptiQ 4-bit, base QAT) | ~11,9B | Mixta 4/8 bits (5,25 bpw) | no disponible | 69,64 | apache-2.0 | MLX (Hugging Face) |
| Uniforme-4 del mismo base QAT | ~11,9B | 4,0 bpw | no disponible | 68,27 | apache-2.0 | MLX |
| Gemma-4 QAT base (sin cuantizar) | ~11,9B | bf16 (referencia) | no disponible | no disponible | licencia Gemma-4 | Hugging Face (Google) |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El rendimiento en MMLU es moderado (52,5%), lo que sugiere cautela en tareas de conocimiento enciclopedico amplio frente a modelos de mayor tamano.
- BFCL-V3 simple retrocede ligeramente frente a la cuantizacion uniforme (-0,5), por lo que el tool calling no mejora con esta asignacion.
- HashHop al 35,0% indica margen de mejora en recuperacion dentro de contexto largo; no se especifica la longitud de contexto nominal.
- No se documentan idiomas soportados; el soporte multilingue no esta garantizado por la informacion disponible.
- Riesgo de alucinacion inherente a modelos generativos; no se reportan evaluaciones de factualidad ni de sesgo.
- La licencia declarada es Apache-2.0, pero la model card enlaza a la licencia Gemma-4 de Google; conviene verificar los terminos aplicables antes de uso comercial.
- Requiere `mlx-lm` desde `main` (no la version de PyPI) e `import optiq`; el pin por version puede fallar porque el build de `main` tambien reporta 0.31.3.
- Dependencia de Apple Silicon y del ecosistema MLX: no es desplegable directamente en CUDA sin conversion.
- El repositorio es un mirror con 0 descargas y 0 likes en el momento de la consulta; la procedencia y mantenimiento deben considerarse al evaluarlo para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/dissembill/mirror-gemma-4-12b-qat-4bit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Drafter especulativo: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized-assistant
- Toolkit mlx-optiq: https://mlx-optiq.com
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Laboratorio: https://mlx-optiq.com/docs/lab/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Blog sobre la mezcla de calibracion: https://mlx-optiq.com/blog/calibration-mix
- Licencia Gemma-4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
