# eduardoworrel/alias3-micro-1026-ONNX-genai

## Resumen

`alias3-micro-1026-ONNX-genai` es la conversión a ONNX del modelo `aliasrobotics/alias3-micro-1026`, un modelo de ~4B parámetros de la familia Qwen3.5 adaptado por Alias Robotics al dominio de ciberseguridad, etiquetado por sus autores como "research preview". Esta versión la publica un tercero (`eduardoworrel`) y no entrena pesos nuevos: empaqueta los pesos originales en tres artefactos listos para `onnxruntime-genai` (CUDA fp16, CUDA int4 y WebGPU int4), con el estado oculto expuesto para poder ejecutar las cabezas de "Sistema 1" descritas en el paper arXiv:2610.16550.

La relevancia técnica no está en el modelo base sino en el empaquetado: el fichero `webgpu/int4/model.onnx` (2,44 GB) se carga y ejecuta en Chrome con WebGPU sobre un Apple M2 Pro, con 0,54 s por decisión (mediana tras el calentamiento) y 42 ms por token en decodificación. Además de la generación convencional ("Sistema 2"), el repositorio incluye `head.bin` y `head_score.bin`, cabezas de lectura sobre el estado oculto que convierten al modelo en un clasificador tipado de decisión única (sí/no, opción múltiple, severidad) mediante un pointer head bilineal heredado de los pointer networks de Vinyals et al. (2015).

Es un artefacto de despliegue, no un modelo nuevo: la fidelidad frente al original está medida en conjuntos de 50 a 65 preguntas por modo, con resultados estadísticamente indistinguibles (0 de 20 pruebas pareadas de McNemar significativas), aunque el int4 cambia la respuesta en el 17,4 % de las preguntas frente al 2,3 % del fp16. El repositorio no registra descargas y la model card del autor no documenta idiomas ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas de atención lineal Gated-DeltaNet + 8 capas de atención completa (arquitectura `qwen3_5_text`), exportado a ONNX con el estado oculto expuesto |
| Parametros totales | ~4 000 millones (4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (block 32) y fp16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX: `model.onnx` + datos externos `model.onnx.data`; cabezas en `head.bin` y `head_score.bin`; tokenizer y `genai_config.json` incluidos |

Variantes incluidas en el repositorio (10,9 GB en total):

| Fichero | Precisión | Tamano | Datos externos | Runtime medido |
|---|---|---|---|---|
| `webgpu/int4/model.onnx` (recomendado navegador) | int4 | 2,44 GB | 1 fichero | onnxruntime-web >= 1.30 WebGPU |
| `cuda/int4/model.onnx` | int4 | 2,44 GB | 1 fichero | onnxruntime-genai 0.18.0 CUDA |
| `cuda/fp16/model.onnx` | fp16 | 8,48 GB | 1 fichero | onnxruntime-genai 0.18.0 CUDA |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de ~4B parámetros con 32 capas: 24 usan atención lineal Gated-DeltaNet y 8 mantienen atención completa, combinación que reduce el coste del contexto largo respecto a un transformer íntegramente cuadrático. Según los resultados de búsqueda, `aliasrobotics/alias3-micro-1026` deriva de la familia Qwen3.5-4B, aunque la información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo está orientado a ciberseguridad y sus autores lo presentan como vista previa de investigación.

La contribución del paper (arXiv:2610.16550) es la separación entre "Sistema 1" y "Sistema 2" siguiendo el marco de procesos duales de Kahneman. El Sistema 1 resuelve decisiones tipadas en un único forward pass: el modelo emite tokens de sí/no, de opción o de dígito, y adicionalmente una cabeza de lectura bilineal (`head.bin`, y `head_score.bin` para severidad) lee el estado oculto y produce un puntero sobre las opciones, en la línea de los pointer networks de Vinyals et al. El Sistema 2 es el bucle de decodificación habitual sobre los mismos pesos. Esta conversión no modifica el código del builder oficial de onnxruntime-genai 0.18.0: usa un wrapper (`build_ct0.py`) que reetiqueta la arquitectura y pasa `-p int4|fp16`, `block 32`, `exclude_mtp` e `include_hidden_states`.

## Capacidades

- **Decisiones tipadas de un solo paso (Sistema 1)**: clasificación binaria sí/no, elección entre opciones múltiples y asignación de severidad, con lectura directa de logits o mediante las cabezas `head.bin` / `head_score.bin`.
- **Generación de texto (Sistema 2)**: bucle de decodificación estándar sobre los mismos pesos, con el tokenizer y la configuración de generación incluidas en cada carpeta.
- **Dominio de ciberseguridad**: el modelo base está ajustado por Alias Robotics para tareas de seguridad; los tags del repositorio incluyen `cybersecurity`.
- **Lectura aumentada del estado oculto**: la exportación incluye `include_hidden_states`, de modo que las cabezas pueden puntuar directamente la representación interna en lugar de depender solo de los logits.
- **Ejecución en navegador**: el artefacto `webgpu/int4` funciona con onnxruntime-web >= 1.30 sobre WebGPU en Chrome, sin servidor.
- **Tool calling, agentes, visión, audio y modo "thinking"**: no disponibles en la información proporcionada.

## Casos de uso

- **Triaje binario de alertas de seguridad**: el Sistema 1 responde preguntas de tipo sí/no en un único forward pass (0,54 s por decisión en Chrome WebGPU sobre M2 Pro), lo que permite filtrar grandes volúmenes de eventos antes de escalarlos a un analista o a un modelo mayor.
- **Puntuación de severidad en pipelines de vulnerabilidades**: `head_score.bin` produce una estimación de severidad leída del estado oculto; en el conjunto de prueba de 50 casos acierta 26/50 de forma exacta y 47/50 con tolerancia ±1. Válido como proof of concept, no como scorer de producción sin reetiquetar datos.
- **Clasificación de opción múltiple sobre taxonomías cerradas**: el pointer head elige entre opciones declaradas en el prompt, útil para mapear hallazgos a categorías CWE, tácticas MITRE ATT&CK o niveles de criticidad internos sin generar texto libre (48/57 aciertos en int4 con cabeza, frente a 39/57 leyendo solo logits).
- **Asistente de seguridad embebido en el navegador**: con 2,44 GB de pesos y carga en 17,7 s, el modelo cabe en una pestaña de Chrome y permite consultas locales sobre datos sensibles sin enviarlos a un servidor, un requisito habitual en entornos con restricciones de confidencialidad.
- **Generación de borradores de informes y resúmenes técnicos**: el Sistema 2 reutiliza los mismos pesos para producir texto explicativo a partir de un hallazgo o de un fragmento de código, con 42 ms por token en decodificación en el banco de pruebas citado.
- **Preprocesado en pipelines de análisis estático**: usar el modelo como clasificador de primera etapa (¿es explotable?, ¿requiere revisión manual?) antes de invocar herramientas más costosas, aprovechando que la decisión se resuelve en un solo paso.
- **Prototipado de interfaces de decisión tipadas**: el par de cabezas y el formato ONNX permiten integrar el modelo en aplicaciones web o de escritorio con onnxruntime-web o onnxruntime-genai sin reescribir la lógica de inferencia.

## Benchmarks y rendimiento

Resultados del conjunto de decisión del Sistema 1 publicados en la model card. La referencia es el modelo original en PyTorch bf16; entre paréntesis, el número de preguntas de cada prueba.

| Fichero | Sí/no (65), logits | Sí/no (65), head.bin | Opción múltiple (57), logits | Opción múltiple (57), head.bin | Severidad (50) exacta, logits | Severidad (50) exacta, head_score.bin | Severidad (50) ±1, head_score.bin | Respuestas cambiadas vs original |
|---|---|---|---|---|---|---|---|---|
| Original (PyTorch bf16) | 54/65 | 54/65 | 39/57 | 46/57 | 20/50 | 26/50 | 47/50 | — |
| `cuda/fp16` | 54/65 | 54/65 | 38/57 | 46/57 | 20/50 | 26/50 | 47/50 | 2,3 % |
| `cuda/int4` = `webgpu/int4` | 55/65 | 54/65 | 38/57 | 48/57 | 20/50 | 26/50 | 47/50 | 17,4 % |

Rendimiento en navegador (Chrome WebGPU, Apple M2 Pro):

| Metrica | Valor |
|---|---|
| Tamano del fichero `webgpu/int4` | 2,44 GB |
| Carga en Chrome | 17,7 s |
| Tiempo por decisión (mediana tras calentamiento) | 0,54 s |
| Decodificación | 42 ms/token |
| Coincidencia con CUDA int4 | 380/394 decisiones (159/172 preguntas) |

El autor advierte que los conjuntos de prueba (50–65 preguntas por modo) solo permiten detectar pérdidas grandes, y que 0 de 20 pruebas pareadas de McNemar resultaron significativas antes y después de la corrección de Holm. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- **fp16 CUDA (8,48 GB)**: requiere GPU con al menos ~10-12 GB de VRAM contando caché KV y overhead; encaja en A100, H100, L40S, RTX 4090 y RTX A6000. No cabe en el navegador (el límite práctico citado es de ~4 GB).
- **int4 CUDA / WebGPU (2,44 GB)**: cabe en GPUs de consumo con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) y en portátiles Apple Silicon vía WebGPU.
- **Navegador**: validado en Chrome con WebGPU sobre Apple M2 Pro; requiere onnxruntime-web >= 1.30. El autor señala que la ruta ONNX/ort-web está limitada por el techo de ~4 GB de WASM, lo que obliga al truco de embeddings en int4.
- **Opciones de despliegue**: onnxruntime-genai 0.18.0 (CUDA) y onnxruntime-web (WebGPU). No se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI; para esos runtimes habría que reconvertir desde el modelo base.
- **Latencia y throughput**: 0,54 s por decisión (mediana) y 42 ms/token en decodificación en el entorno citado; no hay datos de throughput agregado ni de latencia en CUDA.

## Comparativa con modelos similares

Variantes de despliegue del mismo modelo base publicadas por el mismo autor:

| Variante | Runtime | Formato | Tamano | Precisión | Licencia |
|---|---|---|---|---|---|
| `ONNX-genai` (esta ficha) | onnxruntime-genai / onnxruntime-web | ONNX + `genai_config.json` | 2,44 GB (int4) / 8,48 GB (fp16) | int4, fp16 | apache-2.0 |
| `ONNX` | transformers.js | ONNX | no disponible | no disponible | apache-2.0 |
| `ONNX-decode-only` | transformers.js | ONNX | no disponible | no disponible | apache-2.0 |
| `MLC q4f32_1` | WebLLM (WebGPU) | MLC | no disponible | q4f32_1 | apache-2.0 |
| `MLC q4f16_1` | WebLLM (WebGPU) | MLC | no disponible | q4f16_1 | apache-2.0 |
| `LiteRT.js` | LiteRT.js | LiteRT | no disponible | no disponible | apache-2.0 |

Comparación con modelos de propósito general del mismo tamano (~4B): no disponible en la información proporcionada, ya que el modelo base es un ajuste vertical de ciberseguridad sin benchmarks públicos de MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- **Vista previa de investigación**: el propio autor del modelo base califica los pesos como "research preview"; no hay garantías de robustez para producción.
- **Evaluación estadísticamente débil**: los conjuntos de decisión tienen 50–65 preguntas; el autor reconoce que solo detectan pérdidas grandes y que no puede afirmar equivalencia, solo ausencia de diferencias significativas.
- **Deriva por cuantización**: el int4 cambia la respuesta en el 17,4 % de las preguntas frente al original (el fp16, en el 2,3 %), aunque el recuento agregado de aciertos se mantenga.
- **Cabeza de severidad no validada**: `head_score.bin` se ajustó sobre 30 casos sintéticos; usarla como scorer real exige un conjunto etiquetado más amplio e independiente.
- **Sesgos**: no documentados en la información disponible. Al ser un ajuste de dominio sobre un modelo general, puede heredar sesgos del modelo base sin que el autor los caracterice.
- **Riesgo de alucinación**: no cuantificado; el modo generación (Sistema 2) produce texto libre y no se han publicado evaluaciones de factualidad.
- **Idiomas y contexto**: la model card no declara idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- **Licencia**: el artefacto es apache-2.0, pero el modelo base puede arrastrar condiciones adicionales; conviene revisar la licencia de `aliasrobotics/alias3-micro-1026` antes de un uso comercial.
- **Sin tracción comunitaria**: 0 descargas y 1 like en el momento de la consulta, sin issues ni validación independiente del empaquetado.
- **Restricciones de plataforma**: el fp16 (8,48 GB) no cabe en el navegador y la ruta WebGPU depende de una versión concreta de onnxruntime-web y del soporte de WebGPU en Chrome.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-genai
- Modelo base: https://huggingface.co/aliasrobotics/alias3-micro-1026
- Paper del modelo (System 1 / System 2): https://arxiv.org/abs/2610.16550
- Pointer networks (Vinyals et al., 2015): https://arxiv.org/abs/1506.03134
- Documentación de TypeSafe AI: https://docs.typesafe.ai
- Variante ONNX para transformers.js: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX
- Variante ONNX decode-only: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-decode-only
- Variante MLC q4f32_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f32_1
- Variante MLC q4f16_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f16_1
- Variante LiteRT.js: https://huggingface.co/eduardoworrel/alias3-micro-1026-LiteRT
- Exportación ONNX (CT0) con detalle de arquitectura: https://huggingface.co/eduardoworrel/ct0-alias3-micro-onnx
- Pesos MLC (CT0): https://huggingface.co/eduardoworrel/ct0-alias3-micro-mlc
