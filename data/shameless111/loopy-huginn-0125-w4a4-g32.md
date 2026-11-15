# Shameless111/Loopy-Huginn-0125-W4A4-G32

## Resumen

Loopy-Huginn-0125-W4A4-G32 es un checkpoint cuantizado derivado de Huginn-0125, el modelo de lenguaje recurrente en profundidad desarrollado por el grupo de investigacion tomg-group-umd. La contribucion de este artefacto no es un modelo nuevo, sino un experimento de cuantizacion agresiva: pesos a 4 bits (W4) y activaciones dinamicas a 4 bits por token (A4), con un tamano de grupo de 32 y una transformada de Hadamard con bloques de 32 aplicada antes de la cuantizacion. El resultado se empaqueta en un repositorio de 5,2 GB con un cargador propio (custom loader) que sustituye a `from_pretrained()` de Transformers.

El modelo base Huginn-0125 es relevante por su arquitectura: un transformer recurrente en profundidad con T=32 pasos de recurrencia, lo que le permite escalar computo en inferencia sin aumentar el numero de parametros. Este checkpoint concreto fija T=32 y esta pensado para evaluar la viabilidad de W4A4 en ese regimen recurrente, donde los errores de cuantizacion se acumulan a lo largo de los pasos.

La relevancia practica es doble: por un lado, sirve como referencia reproducible de cuantizacion extrema sobre un modelo no convencional (recurrente, no MoE ni transformer denso estandar); por otro, documenta metricas completas (perplejidad en WikiText-2 y LAMBADA, y exactitud en WinoGrande, ARC-C, HellaSwag y MMLU) que permiten medir la degradacion respecto al modelo en precision completa. El autor reporta una exactitud media de 37,32 en las cinco tareas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente en profundidad (recurrent-depth), T=32 pasos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluacion WT2 document-level) |
| Tipos de cuantizacion | W4A4 (pesos 4 bits, activaciones dinamicas 4 bits por token), grupo 32, Hadamard block 32; codigos INT4 almacenados en contenedores INT8; evaluacion con fake quantization BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (pesos; el codigo de investigacion tiene avisos propios en `code/THIRD_PARTY_NOTICES.md`) |
| Formato de pesos | `selected.pt` (state dict PyTorch con escalas, zero points, escalado de entrada y signos de Hadamard); no usa almacenamiento INT4 empaquetado ni kernel INT4 de inferencia |

## Arquitectura y entrenamiento

El modelo base Huginn-0125 pertenece a la familia de modelos recurrentes en profundidad: en lugar de apilar capas distintas, reutiliza un bloque transformer a lo largo de T pasos de recurrencia, de modo que el computo efectivo en inferencia crece con T sin incrementar el numero de parametros. Este checkpoint fija T=32 y aplica sobre esa arquitectura una cuantizacion post-entrenamiento (PTQ) con rotacion Hadamard de bloque 32, escalado con potencia 0,8 y grupo de pesos de 32, seleccionada entre un pool de 80 candidatos mediante busqueda (semilla de rotacion 2026, candidato `s2026_p08_b32`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base recibio RLHF o DPO. La model card solo documenta el proceso de cuantizacion: calibracion, busqueda y evaluacion usan grupos separados de 32 ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revision `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`), con la procedencia de ventanas registrada en `artifacts/window_manifest.json`. La innovacion tecnica destacable es precisamente el protocolo de seleccion y el uso de rotaciones Hadamard para estabilizar la cuantizacion W4A4 en un modelo recurrente, donde el error se propaga a traves de los 32 pasos.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre contextos de hasta 4096 tokens.
- Razonamiento y conocimiento general evaluables mediante MMLU (24,76 de exactitud en este checkpoint).
- Comprension lectora y completado de frases largas, medidas con LAMBADA (PPL 36,36; exactitud 33,61).
- Razonamiento de sentido comun y fisica cotidiana, medido con WinoGrande (51,46) y HellaSwag (47,18).
- Razonamiento cientifico de nivel basico, medido con ARC-Challenge (29,61 con `acc_norm`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion en cuantizacion extrema: reproducir el pipeline completo (descarga, calibracion, busqueda de candidatos, evaluacion) para comparar W4A4 frente a W4A8 y BF16 sobre una arquitectura recurrente, usando los scripts `eval_wikitext.py` y `eval_tasks.py` incluidos.
- Estudio de propagacion de error en modelos recurrentes: al fijar T=32 y cuantizar a 4 bits, el checkpoint permite medir como se acumula el ruido de cuantizacion a lo largo de los pasos de recurrencia, algo que un transformer denso no expone de la misma forma.
- Benchmarking de perplejidad en contexto largo: la evaluacion WT2 con ventana de 4096 tokens y perplejidad a nivel de documento sirve como referencia para validar tecnicas de cuantizacion en regimenes de contexto extendido.
- Base para experimentos de destilacion o fine-tuning sobre modelos recurrentes cuantizados: al ser Apache-2.0 y estar en formato state dict, puede cargarse con el loader incluido y adaptarse con LoRA u otras tecnicas sobre los tensores no cuantizados.
- Validacion de infraestructura de evaluacion: el repositorio incluye `manifest.json` con tamanos y SHA-256, `provenance.json` con el mapeo de hashes y `reference_results/` con metricas originales, lo que lo hace util para probar pipelines de evaluacion reproducibles en entornos de investigacion.
- Docencia y divulgacion tecnica: como ejemplo didactico de cuantizacion W4A4 con rotaciones Hadamard, seleccion de candidatos y evaluacion con fake quantization BF16, con artefactos completos y trazabilidad de ventanas de calibracion.

## Benchmarks y rendimiento

Resultados reportados por el autor para este checkpoint (exactitud en porcentaje; ARC-C y HellaSwag con `acc_norm`, el resto con `acc`; la media pondera igual las cinco tareas de exactitud):

| Metrica | Valor |
|---|---:|
| WT2 word PPL (4096 contexto, rolling document-level) | 28,09 |
| LAMBADA PPL | 36,36 |
| LAMBADA acc. | 33,61 |
| WinoGrande | 51,46 |
| ARC-C | 29,61 |
| HellaSwag | 47,18 |
| MMLU | 24,76 |
| Media de exactitud (5 tareas) | 37,32 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base en BF16 ni frente a la variante W4A8; la model card indica que las metricas de referencia completas estan en `reference_results/`, pero no se incluyen sus valores en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision, ya que el repositorio no declara el numero de parametros y los pesos W4 se almacenan en contenedores INT8 (no empaquetados), por lo que el checkpoint ocupa 5,2 GB en disco pero el consumo en memoria depende del loader y del modelo base cargado en BF16 antes de aplicar la cuantizacion.
- GPU recomendadas: no disponibles en la informacion proporcionada. El ejemplo de la model card usa `CUDA_VISIBLE_DEVICES=0`, lo que sugiere una unica GPU, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano del repo (5,2 GB) y el uso de fake quantization BF16 en evaluacion, es plausible que quepa en GPUs de 16-24 GB, pero no hay dato oficial.
- Opciones de despliegue: no es compatible con `from_pretrained()` de Transformers ni con vLLM, llama.cpp, Ollama o TGI de forma directa; requiere el loader propio incluido en `code/` y un entorno Conda definido en `code/environment.yml`.
- Latencia y throughput: no disponibles. Al fijar T=32 pasos de recurrencia, el coste de inferencia es sustancialmente mayor que el de un transformer denso del mismo numero de parametros, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loopy-Huginn-0125-W4A4-G32 | no disponible | 4096 | W4A4, grupo 32 | Apache-2.0 | Hugging Face, loader propio |
| tomg-group-umd/huginn-0125 (base) | no disponible | no disponible en esta ficha | BF16 (referencia) | Apache-2.0 (upstream) | Hugging Face |
| Variante W4A8 de Loopy (mencionada) | no disponible | 4096 | W4A8 | Apache-2.0 | Referenciada en la model card, sin ID publico en la informacion disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con modelos recurrentes o cuantizados de otros autores; la model card solo referencia el modelo base y la seleccion W4A8 dentro del mismo proyecto Loopy.

## Limitaciones y advertencias

- Cuantizacion agresiva: W4A4 con grupo 32 introduce degradacion medible; la exactitud media de 37,32 y MMLU de 24,76 son bajas en terminos absolutos, aunque no se aporta la referencia BF16 para cuantificar la perdida.
- No es un modelo listo para produccion: el repositorio no usa kernel INT4 de inferencia ni almacenamiento empaquetado, y la evaluacion se hace con fake quantization BF16, por lo que el rendimiento real de un despliegue INT4 no esta validado.
- Cargador no estandar: requiere el loader propio de Loopy; intentar `from_pretrained()` sobre este repositorio fallara o dara resultados incorrectos.
- Solo ingles: la model card declara `en` como unico idioma; no hay evidencia de capacidades multilingues.
- Sesgos y alucinacion: no documentados en la informacion proporcionada; al ser un derivado del modelo base, hereda los sesgos de este, pero no se detallan.
- Restricciones de licencia: los pesos son Apache-2.0, pero el codigo de investigacion y las dependencias tienen avisos propios en `code/THIRD_PARTY_NOTICES.md`; conviene revisarlos antes de uso comercial.
- Reproducibilidad dependiente de artefactos externos: la evaluacion requiere descargar el modelo base fijado, el tokenizer y los datasets de tareas mediante `scripts/download_hf_artifacts.py`, lo que anade dependencias de red y versiones.
- Fecha de creacion futura (2026-11-15) y cero descargas/likes: sin validacion externa por parte de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shameless111/Loopy-Huginn-0125-W4A4-G32
- Modelo base: https://huggingface.co/tomg-group-umd/huginn-0125
- Dataset de calibracion/evaluacion: https://huggingface.co/datasets/Salesforce/wikitext
- Protocolo de evaluacion: `code/docs/protocol.md` (dentro del repositorio)
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` (dentro del repositorio)
- Resultados de referencia: `reference_results/` (dentro del repositorio)
- Manifiesto y procedencia: `manifest.json` y `provenance.json` (dentro del repositorio)
