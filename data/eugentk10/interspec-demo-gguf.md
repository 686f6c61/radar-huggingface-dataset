# EugenTK10/InterSpec-demo-GGUF

## Resumen

InterSpec-demo-GGUF es un conjunto de cinco modelos en formato GGUF publicados por EugenTK10 para ejecutar decodificacion especulativa (speculative decoding) con llama.cpp. El repositorio contiene un modelo verificador Pythia-1.4b ajustado para resumen abstractivo sobre el dataset XSum y cuatro modelos draft Pythia-31m que proponen tokens candidatos, todos ellos con el tokenizador GPT-NeoX compartido y en precision f16.

El objetivo del proyecto es reducir el coste de inferencia del verificador sin alterar su salida: cada draft genera hasta 5 tokens candidatos que el verificador valida en un unico forward pass, de modo que se producen entre 1,9 y 2,1 tokens por pasada del modelo grande segun el draft empleado. Los dos drafts EX2 (EX2-TT-S1 y EX2-PB-S1) provienen de la tesis de master del autor; los dos drafts EX4 (EX4-FS3-S1 y EX4-PB3-S1) se entrenaron despues de la tesis y solo se publican en este repositorio.

Es relevante ahora porque empaqueta, en artefactos listos para llama.cpp, una tecnica de aceleracion de inferencia (destilacion de drafts mediante un target intermedio) con metricas de aceptacion publicadas y hashes SHA-256 de trazabilidad. No es un modelo conversacional: es material de investigacion y despliegue para resumen extractivo-abstractivo en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-NeoX (familia Pythia de EleutherAI) |
| Parametros totales | 1.414.647.808 en el verificador (Pythia-1.4b); los cuatro drafts son Pythia-31m |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unico publicado); los checkpoints de origen estan en fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (heredada de Pythia) |
| Formato de pesos | GGUF (f16); el modelo base EugenTK10/InterSpec esta en safetensors |

## Arquitectura y entrenamiento

Los cinco artefactos comparten la arquitectura GPT-NeoX de Pythia. El verificador es un Pythia-1.4b ajustado (SFT) sobre XSum, y los drafts parten del checkpoint crudo `EleutherAI/pythia-31m`. Cada draft se entrena contra una referencia distinta: los EX2 (TT y PB) usan un learning rate de 5e-6 y una epoca sobre 199.793 muestras de XSum; los EX4 emplean un learning rate de 3e-4 y tres epocas (599.379 muestras, equivalentes a tres pasadas sobre el mismo conjunto de 199.793). El draft EX4-FS3-S1 se entreno contra un target Pythia-410m congelado y contra el teacher de forma conmutada (una referencia por batch, P(target)=0,5) usando divergencia Jensen-Shannon (JSD); EX4-PB3-S1 es una linea base paralela tipo DistillSpec con JSD on-policy desde el teacher. El target congelado usado por EX4-FS3-S1 no esta publicado.

La innovacion tecnica es la destilacion de drafts a traves de un target intermedio, comparada contra la linea base paralela de DistillSpec. En el plano de ingenieria, el autor convertio los checkpoints fp32 a GGUF f16 con `convert_hf_to_gguf.py` (commit `4ceb1719101f32637b841206c172f3f058ffc182`), aplicando un parche local al conversor de GPT-NeoX para leer `rope_parameters.partial_rotary_factor` cuando falta la clave plana `rotary_pct`. Los vocabularios de los drafts se verificaron token a token contra el del teacher, y los checkpoints EX2 y el teacher se validaron por SHA-256 contra la revision `17530560695709a3c7704657f618649e2a1ba759`.

## Capacidades

- Generacion de texto condicionada a un formato de prompt fijo (`Article:\n{document}\n\nSummary:`) que el modelo completa con ` {summary}` y termina en `<|endoftext|>`.
- Resumen abstractivo de documentos en ingles, especializado en el dominio y el estilo de XSum.
- Decodificacion especulativa: los drafts generan propuestas de tokens que el verificador acepta o rechaza, aumentando el numero de tokens producidos por forward pass del modelo grande.
- No dispone de modo chat ni plantilla de conversacion: la model card indica explicitamente que no son modelos de chat.
- No hay soporte declarado de tool calling, function calling ni flujos de agentes.
- Capacidades multilingues: solo ingles.
- No se declaran capacidades de vision, audio ni thinking mode.

## Casos de uso

- Resumen de noticias y articulos en ingles: el verificador Pythia-1.4b-XSum genera resumenes de una o dos frases a partir de un documento, que es exactamente la tarea sobre la que fue ajustado.
- Inferencia acelerada en produccion con llama.cpp: ejecutando `llama-server` con un draft y `--spec-type draft-simple`, se obtienen entre 1,9 y 2,1 tokens por forward pass del verificador, reduciendo el coste por token generado.
- Despliegue en hardware modesto o CPU: el draft de 31m en f16 ocupa unas decenas de MB y el verificador ronda los 2,8 GB, por lo que el conjunto completo (3,1 GB de repositorio) cabe en equipos de gama de consumo.
- Investigacion en decodificacion especulativa: el repositorio permite reproducir comparaciones entre drafts destilados con trayectoria del target (TT), lineas base paralelas (PB) y entrenamiento conmutado contra un target intermedio (FS3).
- Evaluacion comparativa de builds de llama.cpp: dado que la model card advierte que el muestreo y la numerica de llama.cpp difieren de PyTorch, sirve para medir la tasa de aceptacion real de cada runtime.
- Material docente para cursos de eficiencia en inferencia: ilustra de forma autocontenida el bucle draft-verificador y su metrica principal (acceptance rate y tokens por pasada).
- Preprocesado de corpus en pipelines de datos: generacion masiva de resumenes de documentos ingleses antes de indexacion o busqueda semantica.
- Punto de partida para destilacion propia: los cuatro drafts y el teacher son checkpoints independientes que se pueden reentrenar o sustituir manteniendo el tokenizador GPT-NeoX compartido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si publica metricas de aceptacion medidas con decodificacion especulativa real en PyTorch sobre 1.000 prompts de test de XSum, con longitud de draft gamma = 5, sobre los checkpoints de origen en safetensors:

| Draft | alpha (T=0) | tau (T=0) | alpha (T=1) | tau (T=1) |
|---|---|---|---|---|
| EX2-TT-S1 | 0.521 | 1.907 | 0.504 | 1.863 |
| EX2-PB-S1 | 0.499 | 1.834 | 0.494 | 1.829 |
| EX4-FS3-S1 | 0.585 | 2.125 | 0.563 | 2.059 |
| EX4-PB3-S1 | 0.569 | 2.063 | 0.558 | 2.042 |

alpha es la tasa de aceptacion y tau el numero de tokens producidos por cada forward pass del verificador. Se trata de cifras de una sola semilla; la comparacion entre EX2 y EX4 no es atribuible de forma aislada al learning rate ni al presupuesto de entrenamiento, ya que ambos difieren. Estas cifras se midieron sobre los checkpoints safetensors, por lo que el rendimiento con los ficheros GGUF sera cercano pero no identico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8-3,0 GB para el verificador Pythia-1.4b en f16, mas la cache KV; cada draft de 31m en f16 ocupa del orden de 60-70 MB.
- El repositorio completo (los cinco ficheros GGUF) ocupa 3,1 GB en disco.
- GPU recomendadas: cualquier GPU con 4-6 GB o mas de VRAM es suficiente para el verificador; no se requiere A100, H100 ni RTX 4090 para este tamano. La decodificacion especulativa tambien es viable en CPU mediante llama.cpp.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060 o superiores con 6 GB o mas; incluso en GPUs de 4 GB segun la longitud de contexto y el tamano de batch.
- Opciones de despliegue: llama.cpp mediante `llama-server` (con `--spec-type draft-simple`, `--spec-draft-model`, `--spec-draft-n-max 5`, `--spec-draft-n-min 5`, `--spec-draft-p-min 0.0`) o `llama-cli` para decodificacion plana con el teacher. Los ficheros son GGUF, por lo que tecnicamente pueden cargarse en otros runtimes compatibles con este formato, aunque la ruta soportada por el autor es llama.cpp.
- Latencia y throughput: no se publican medidas de latencia ni tokens por segundo. Como referencia de eficiencia, la metrica tau indica entre 1,83 y 2,13 tokens generados por forward pass del verificador segun draft.
- Nota de compatibilidad: los nombres de los flags corresponden al build de llama.cpp indicado en la model card; builds mas antiguos usan `-md` / `--draft-max`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InterSpec-demo-GGUF | 1,4B (verificador) + 4 x 31m (drafts) | no disponible | Decodificacion especulativa con drafts destilados, resumen XSum | Apache-2.0 | GGUF f16 en el Hub |
| EleutherAI/pythia-1.4b | 1,4B | no disponible en esta informacion | Modelo base GPT-NeoX sin ajuste en XSum | Apache-2.0 | safetensors en el Hub |
| EugenTK10/InterSpec | 1,4B + drafts | no disponible | Checkpoints de origen de la tesis en fp32/safetensors, sin metricas GGUF | Apache-2.0 | safetensors en el Hub |
| Linea base DistillSpec | Variable segun implementacion | no disponible | Destilacion de draft paralela (referencia metodologica, no un modelo concreto publicado) | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otras familias de modelos de resumen (por ejemplo, BART o T5 ajustados en XSum) en la informacion proporcionada, por lo que la comparacion cuantitativa de calidad de resumen no esta disponible.

## Limitaciones y advertencias

- Solo ingles: el modelo no soporta otros idiomas y no se ha evaluado su comportamiento fuera del dominio de XSum.
- No es un modelo conversacional: no tiene plantilla de chat y espera exactamente el formato `Article:\n{document}\n\nSummary:`. Cualquier desviacion del formato degrada la calidad de la salida.
- Riesgo de alucinacion: XSum es un corpus de resumenes abstractivos y agresivos, una tarea en la que los modelos tienden a introducir contenido no presente en el documento original. No se han publicado evaluaciones de fidelidad factual.
- Sesgos heredados: se heredan los sesgos de los modelos Pythia y del corpus XSum, que procede de la BBC y esta sesgado hacia contenido y estilo periodistico britanico.
- Capacidad limitada de los drafts: los Pythia-31m tienen una capacidad muy reducida y solo son utiles como proponedores de tokens dentro del bucle especulativo, nunca como modelos autonomos.
- Las cifras de aceptacion se midieron en PyTorch sobre los checkpoints safetensors; con los ficheros GGUF y el muestreo de llama.cpp los valores seran cercanos pero no identicos.
- Los resultados publicados corresponden a una sola semilla. Las comparaciones entre semillas solo cubren los drafts EX2 y estan en la tesis; los EX4 no forman parte de ella.
- Reproducibilidad parcial: el target Pythia-410m congelado usado para entrenar EX4-FS3-S1 no esta publicado, aunque se facilitan los SHA-256 de los checkpoints de origen.
- Licencia Apache-2.0, heredada de Pythia, permite uso comercial, pero conviene revisar por separado las condiciones del dataset XSum utilizado en el ajuste.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no cuenta con validacion de la comunidad ni con evaluaciones independientes.
- Solo se publica f16; no hay cuantizaciones de menor precision listas para usar (Q4, Q5, Q8), lo que limita el ahorro de memoria adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EugenTK10/InterSpec-demo-GGUF
- Modelo base en el Hub: https://huggingface.co/EugenTK10/InterSpec
- Codigo, tesis y salidas de evaluacion: https://github.com/EugenTK10/InterSpec
- Pythia-1.4b (EleutherAI): https://huggingface.co/EleutherAI/pythia-1.4b
- Dataset XSum: https://huggingface.co/datasets/EdinburghNLP/xsum
- Convertidor GGUF de llama.cpp (referencia del commit usado): https://github.com/ggerganov/llama.cpp

Los resultados de busqueda web disponibles tratan sobre corrientes filosoficas y no guardan relacion con el modelo, por lo que no se incluyen.
