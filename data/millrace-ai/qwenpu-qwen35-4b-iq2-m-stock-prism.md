# millrace-ai/qwenpu-qwen35-4b-iq2-m-stock-prism

## Resumen

`millrace-ai/qwenpu-qwen35-4b-iq2-m-stock-prism` es un checkpoint de investigación publicado por millrace-ai que combina los pesos cuantizados del modelo Qwen3.5-4B (en formato UD-IQ2_M, cuantización de Unsloth) con un circuito QwenPU compilado (RV32 más extensión vectorial) dentro de un único archivo GGUF. El objetivo no es servir un modelo conversacional convencional, sino demostrar la ejecución de un circuito invitado (guest) sobre las interfaces MTP (multi-token prediction) del runtime Prism b12128 en Windows con CUDA 12.4, usando el bloque MTP del modelo como sustrato de ejecución del circuito.

El checkpoint parte del GGUF base `unsloth/Qwen3.5-4B-GGUF` (arquitectura `qwen35`, anchura oculta 2.560, 32 bloques de lenguaje más un bloque MTP de QwenPU) y le añade 18 tensores de circuito, incluyendo una embedding PQ2_0 propia. Los pesos de lenguaje originales se preservan byte a byte en sus 426 extensiones empaquetadas; el exportador rellena con ceros las FFN de 9.216 a 36.352 filas para igualar la anchura compartida. El resultado es un GGUF de 5.121.315.968 bytes (5,1 GB) con 444 tensores y 11.840.714.242 elementos contados por el Hub (incluyendo padding y circuito).

Su relevancia es acotada pero específica: sirve como artefacto reproducible para validar ejecución determinista de un circuito RISC-V sobre un transformer cuantizado, con evidencia de retirements, escrituras ordenadas y coincidencia bit a bit frente a referencias en CPU. No es un modelo para producción conversacional, sino una pieza de verificación de runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35` (32 bloques de lenguaje + 1 bloque MTP QwenPU) con circuito RV32 + vectorial embebido |
| Parámetros totales | 11.840.714.242 elementos GGUF contados por el Hub (incluye padding y circuito); 4.205.751.296 elementos en el host de lenguaje |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados en la cabecera del GGUF |
| Tipos de cuantización | UD-IQ2_M para los pesos de lenguaje; PQ2_0 para la embedding del circuito; tipos propios del circuito preservados |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos de lenguaje); el circuito QwenPU conserva sus propios términos |
| Formato de pesos | GGUF (archivo único `Qwen3.5-4B-UD-IQ2_M-QwenPU-Stock-Prism.gguf`, 5.121.315.968 bytes, SHA-256 `d2f72c07…7ba519`) |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: parte de Qwen3.5-4B (Alibaba Cloud), cuantizado por Unsloth a UD-IQ2_M, y le inyecta un circuito QwenPU (creado por Divyansh Agrawal) compilado como tensores adicionales dentro del mismo GGUF. La arquitectura del host es un transformer `qwen35` con anchura oculta 2.560 y 36.352 filas por FFN tras el padding aplicado por el exportador (originalmente 9.216). El bloque MTP del modelo ejecuta el circuito invitado, y el launcher (Run.ps1) se encarga de cargar el guest y retransmitir las acciones seleccionadas y las peticiones de caché del circuito mediante las APIs MTP existentes en Prism b12128.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO para este checkpoint: es un artefacto de empaquetado, no un modelo entrenado. La innovación técnica destacable es la convivencia en un solo GGUF de pesos de lenguaje cuantizados y un circuito RISC-V con embedding PQ2_0 propia, ejecutado de forma determinista sobre el bloque MTP. La validación reportada incluye coincidencia bit a bit del control de solo padding frente al UD-IQ2_M original en historiales seriales y batcheados hasta 64 tokens, y coincidencia exacta en fixtures escalares y vectoriales (316 retirements, 307 escrituras ordenadas).

## Capacidades

- Generación de texto conversacional heredada de Qwen3.5-4B en su cuantización UD-IQ2_M, sujeta a la degradación propia de una cuantización de 2 bits.
- Ejecución de un circuito RV32 con extensión vectorial (QwenPU) como guest sobre el bloque MTP del modelo.
- Verificación determinista: el checkpoint está diseñado para reproducir retirements y escrituras ordenadas frente a referencias en CPU.
- Soporte de captura de traza acotada (`Run.ps1 -Runtime .\prism-b12128 -OutDir .\bounded-capture`), que se detiene en el retirement 2.578 y guarda evidencia de caché física.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de runtimes de inferencia: el checkpoint permite comprobar que un runtime dado (Prism b12128 en Windows CUDA 12.4) ejecuta correctamente las APIs MTP y de caché, comparando retirements y escrituras ordenadas contra la referencia en CPU. Es su caso de uso principal y está documentado con evidencia adjunta.
- Reproducción de experimentos de ejecución invitada: investigadores que trabajen en emulación de ISA sobre transformers pueden usar el par lenguaje+circuito como banco de pruebas reproducible con trazas firmadas y hashes de DLL y GGUF.
- Validación de cuantizaciones de 2 bits: el control de solo padding demuestra que el padding introducido por el exportador no altera logits, estado KV ni estado recurrente, lo que sirve para auditar pipelines de cuantización IQ2_M.
- Docencia y divulgación técnica: el ejemplo `stories260K` (modelo guest de Karpathy) imprime `Once upon a` y se detiene limpiamente, lo que permite ilustrar cómo un transformer aloja un circuito externo con resultados observables.
- Auditoría de preservación de pesos: dado que las 426 extensiones empaquetadas originales se conservan byte a byte, el artefacto sirve para verificar que herramientas de empaquetado no corrompen pesos durante la inyección de tensores adicionales.
- Desarrollo de portes a otros runtimes: el README indica que portar el checkpoint requiere soporte para sus tipos de tensor mixtos (incluida la embedding PQ2_0) y las APIs de feedback y caché MTP, por lo que el checkpoint actúa como caso de prueba para implementar esas interfaces en otros backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento reportados son de ejecución del circuito y de la ventana de historia:

| Medición | Resultado |
|---|---|
| Decodes en ventana de historia acotada | 82.090 decodes en 518,78 s (158,2 decodes/s) |
| Verificación completa de tres tokens (post-seed) | 170,7 decodes/s de media |
| Retirements verificados (traza completa) | 37.080 |
| Escrituras ordenadas del guest (traza completa) | 55.375 |
| Retirements en prefijo original stories260K | 2.578 |
| Escrituras ordenadas en prefijo stories260K | 2.760 |
| Celdas vivas en ventana de historia | 55.720 sobre contexto guest F16 de 65.536 celdas |
| VRAM dedicada pico (proceso) | 5,73 GiB |
| VRAM compartida pico (proceso) | 84 MiB |
| VRAM total del dispositivo (pico) | 7,29 GiB (ventana) / 6,72 GiB (traza completa) |
| RAM del proceso (working set) | 5,72 GiB |
| Duración de captura completa del guest | 8 h 13 min 40 s (incluye setup y seeding) |

Hardware de referencia: NVIDIA GTX 1080 con Windows y Prism b12128 (CUDA 12.4).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7,3 GiB de VRAM total de dispositivo según las mediciones del autor en la GTX 1080; 5,73 GiB de VRAM dedicada del proceso.
- GPU recomendadas: la validación se hizo exclusivamente en una GTX 1080; no hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, al menos en GTX 1080 (8 GB). El tamaño del archivo (5,1 GB) encaja en GPUs de 8 GB o más.
- Opciones de despliegue: únicamente el runtime Prism b12128 para Windows CUDA 12.4 (archivos `llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip` y `cudart-llama-bin-win-cuda-12.4-x64.zip`). No hay soporte documentado para vLLM, llama.cpp estándar, Ollama ni TGI, ya que el checkpoint requiere los tipos de tensor mixtos y las APIs MTP del runtime Prism.
- Latencia y throughput: 158,2 decodes/s en ventana de historia y 170,7 decodes/s en la fase post-seed de la verificación completa, medidos en GTX 1080.
- RAM del sistema: alrededor de 5,72 GiB de working set del proceso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Runtime | Licencia |
|---|---|---|---|---|---|
| qwenpu-qwen35-4b-iq2-m-stock-prism | 11.840.714.242 elementos GGUF (4.205.751.296 en host de lenguaje) | 262.144 | UD-IQ2_M + PQ2_0 | Prism b12128 (Windows CUDA 12.4) | Apache-2.0 |
| unsloth/Qwen3.5-4B-GGUF (base) | 4.205.751.296 elementos | 262.144 | UD-IQ2_M | llama.cpp y derivados | Apache-2.0 |
| millrace-ai/qwenpu-bonsai-4b-stock-prism (donante del circuito) | No disponible | No disponible | No disponible | Prism b12128 | No disponible |

La comparación relevante es con el GGUF base de Unsloth: mismo host de lenguaje y misma cuantización, pero sin el circuito QwenPU embebido ni el padding de FFN a 36.352 filas. El checkpoint Bonsai 4B actúa como donante del circuito y comparte los 18 tensores adicionales. No se dispone de datos de benchmarks de calidad para comparar rendimiento de lenguaje entre estos artefactos.

## Limitaciones y advertencias

- No es un modelo para uso conversacional en producción: es un checkpoint de investigación con un circuito embebido y un launcher específico.
- El runtime está atado a Prism b12128 en Windows con CUDA 12.4; no funciona en llama.cpp estándar, Ollama, vLLM ni TGI sin implementar los tipos de tensor mixtos y las APIs MTP.
- La cuantización UD-IQ2_M (2 bits) implica una degradación de calidad de lenguaje respecto al modelo original en precisión completa; no se han publicado evaluaciones de calidad.
- El padding de FFN de 9.216 a 36.352 filas añade cómputo desaprovechado y aumenta el tamaño del archivo.
- Riesgo de alucinación: no evaluado en la información proporcionada; aplicable el riesgo genérico de los modelos de lenguaje de 4B cuantizados a 2 bits.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- La licencia Apache-2.0 cubre los pesos de lenguaje, pero el circuito QwenPU conserva sus propios términos (el README queda truncado en ese punto); conviene revisar la atribución completa antes de un uso comercial.
- La captura completa del guest tarda más de 8 horas, lo que limita su uso interactivo.
- El repositorio tiene 573 descargas y 0 likes en el momento de la consulta; es un artefacto de nicho con validación limitada a un único hardware y runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/qwenpu-qwen35-4b-iq2-m-stock-prism
- GGUF base de Unsloth (pin): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/blob/e87f176479d0855a907a41277aca2f8ee7a09523/Qwen3.5-4B-UD-IQ2_M.gguf
- Checkpoint donante del circuito (Bonsai 4B): https://huggingface.co/millrace-ai/qwenpu-bonsai-4b-stock-prism
- Evidencia de traza, handoff y recursos: https://github.com/tim-osterhus/qwenpu-bonsai/blob/d1bdc3f10e405494ee59f0f05262d2f476ac1204/results/forward/standard-layer/evidence-snapshot.json
- Runtime Prism b12128 (Windows CUDA 12.4): https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip
- Runtime CUDA de Prism b12128: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/cudart-llama-bin-win-cuda-12.4-x64.zip
