# lukeecho/shibboleth-qwen38-27b-lora

## Resumen

Shibboleth (también abreviado como "Shib") es un adaptador LoRA entrenado sobre `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una variante abliterada del modelo Qwen3.8-27B con arquitectura híbrida `qwen3_5`. Lo desarrolla el usuario lukeecho como herramienta de seguridad defensiva: el adaptador lee código fuente y emite un veredicto JSON indicando si el archivo es limpio o contiene malware oculto, clasificando además la técnica de ocultación (TTP) empleada. La tesis del proyecto es que el malware nuevo trae muestras nuevas pero las mismas "formas" de ocultación, por lo que un detector basado en estructura debería envejecer mejor que un clasificador de firmas.

El adaptador (116,7 M parámetros entrenables, r=16, α=32, 496 módulos lineales) se diseñó para funcionar junto a un pre-paso determinista de entropía (`entropy_prepass.py`) que detecta acoplamientos entre blobs de alta entropía y sumideros de ejecución. Sobre un holdout de 120 filas, el pre-paso por sí solo alcanza F1 0,86 con precisión 0,98 y recall 0,76; el adaptador debe recuperar los fallos de recall sin degradar esa precisión.

El modelo se publica con estado explícito "trained, NOT YET VALIDATED": el entrenamiento terminó limpiamente, pero las únicas generaciones posteriores provienen de un harness defectuoso en el pod y no constituyen una evaluación de calidad. El autor incluye un script de evaluación (`eval_shib.py`) y una línea base (`EVAL-BASELINE.md`) que deben ejecutarse antes de confiar en el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre base Qwen3.8-27B con arquitectura `qwen3_5` (híbrida: full-attention + Gated-DeltaNet linear-attention, hidden 5120) |
| Parametros totales | 116,7 M entrenables en el adaptador (el modelo base no se especifica en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 4096 tokens) |
| Tipos de cuantizacion | NVFP4 mencionado para la versión fusionada (~15–20 GB); el adaptador se distribuye en bf16 safetensors |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia de Qwen y los términos de la abliteración de huihui-ai; confirmar antes de redistribuir) |
| Formato de pesos | safetensors (PEFT/LoRA); variante `adapter_model.textonly.safetensors` para LoRA en runtime |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con α=32, dropout 0,05, aplicado a todos los módulos lineales (496 módulos: `q,k,v,o`, `linear_attn.in_proj_{qkv,a,b,z}`, `out_proj` y `mlp.{gate,up,down}`), con 116,7 M parámetros entrenables. Se entrenó durante 1 época con secuencias de 4096 tokens, micro-batch 4 × acumulación 4 (efectivo 16), learning rate 1e-4 con schedule cosine y warmup 0,03, precisión bf16, gradient checkpointing y semilla 42. El corpus consta de 14.568 filas y 3,56 M tokens de gradiente, mezclando ciber sintético con contraste de formas, una pequeña porción de identidad Shibboleth y material de lastre (libros de dominio público, un conjunto "lady-genius" y transcripciones de Off-the-Hook) para fijar el registro. El corpus es reproducible mediante `assemble_blend.py` con semilla 1125.

La innovación central no está en la arquitectura sino en el paradigma de datos: la clase positiva es manufacturada, no recolectada. Se parte de código limpio y se le aplican transformaciones de ocultación T1–T10 (acoplamiento opaco decode→`eval`, payloads divididos y reensamblados, blobs con entropía inflada que alimentan sumideros de ejecución, etc.), sin scraping de GitHub ni muestras reales. El adaptador se complementa con un pre-paso determinista de entropía que calcula por unidad `{suspicion, shape, n_couplings, entropy_max}` y que, según el autor, es la mayor palanca del sistema.

## Capacidades

- Clasificación de código fuente como limpio o malicioso oculto, con salida JSON corta del tipo `{"detect":"y","ttp":"T1"}`.
- Identificación de la técnica de ocultación (TTP) entre las transformaciones T1–T10 definidas en el corpus.
- Análisis de estructura y forma del código (fingerprint de ocultación) en lugar de coincidencia con muestras conocidas.
- Lectura de código malicioso sin rechazo, gracias a la abliteración del modelo base, requisito para un detector.
- Integración con un pre-paso determinista de entropía que aporta señales de acoplamiento y entropía por unidad.
- Generación de texto general heredada del modelo base Qwen3.8-27B (no evaluada en esta ficha).
- Soporte de tool calling, agentes o multimodal: no disponible en la información proporcionada.

## Casos de uso

- Análisis de pull requests en CI/CD: el adaptador puede clasificar archivos modificados antes del merge, emitiendo un veredicto JSON que un pipeline pueda consumir para bloquear o marcar cambios sospechosos.
- Triaje de dependencias y paquetes de terceros: dado el código fuente de una dependencia, detectar payloads ofuscados o acoplamientos decode→`eval` antes de incorporarla al proyecto.
- Revisión de código generado por IA: filtrar snippets producidos por asistentes que contengan patrones de ocultación, usando la salida `ttp` para clasificar el tipo de riesgo.
- Enriquecimiento de un escáner estático existente: ejecutar el pre-paso de entropía como primera línea y usar el adaptador solo sobre los casos de baja sospecha para recuperar recall sin sacrificar la precisión del 0,98 del pre-paso.
- Formación y concienciación en seguridad: mostrar al equipo de desarrollo qué formas estructurales delatan código oculto, con la etiqueta TTP como explicación.
- Investigación en detección basada en forma: servir como banco de pruebas reproducible (corpus sintético con semilla fija, holdout etiquetado de 120 filas) para comparar detectores de firma frente a detectores de estructura.
- Monitorización de repositorios internos: análisis por lotes de código alojado en un servidor Git para localizar archivos con formas de ocultación, con el adaptador servido en vLLM y salida JSON estructurada.

## Benchmarks y rendimiento

El autor no publica resultados del adaptador; el estado es "trained, NOT YET VALIDATED". El único dato numérico disponible corresponde al pre-paso determinista de entropía sobre el holdout de 120 filas:

| Componente | F1 | Precision | Recall | Falsos positivos |
|---|---|---|---|---|
| Pre-paso de entropía solo | 0,86 | 0,98 | 0,76 | 1 |
| Adaptador Shibboleth solo | no disponible | no disponible | no disponible | no disponible |
| Pre-paso ∪ Shibboleth | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks en la información disponible para el adaptador. El autor indica que la evaluación debe hacerse como unión pre-paso ∪ Shibboleth y que, si el adaptador solo coincide con el pre-paso, conviene desplegar únicamente el pre-paso sin GPU.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador por separado; la versión fusionada y cuantizada a NVFP4 ocupa aproximadamente 15–20 GB según el autor.
- GPU recomendadas: no especificadas; el autor sirve con vLLM sobre el modelo base en bf16, lo que implica GPUs de centro de datos (A100, H100) o varias consumer de gama alta.
- ¿Cabe en consumer GPU? La variante NVFP4 fusionada (~15–20 GB) podría caber en GPUs de 24 GB como la RTX 4090; el base en bf16 no cabe en una sola consumer.
- Opciones de despliegue: vLLM con `--enable-lora` adjuntando `adapter_model.textonly.safetensors`, o fusión con `merge_and_unload` de PEFT y servicio del modelo fusionado (opcionalmente cuantizado a NVFP4). El autor advierte que `transformers.generate()` sobre esta arquitectura híbrida produce degeneración en su harness, por lo que solo considera válido vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| Shibboleth (este) | LoRA sobre Qwen3.8-27B abliterado | 116,7 M entrenables | no disponible | Detección por forma estructural | other |
| Pre-paso de entropía (`entropy_prepass.py`) | Reglas deterministas | N/A | N/A | Entropía × acoplamiento a sumideros | incluido en el proyecto |
| Clasificadores de malware basados en firmas | Variable | Variable | N/A | Coincidencia con muestras conocidas | variable |

No se dispone de datos de benchmarks del adaptador que permitan una comparación cuantitativa con alternativas; la única comparación publicada es frente al pre-paso determinista, cuyos resultados se recogen en la sección anterior.

## Limitaciones y advertencias

- Estado "trained, NOT YET VALIDATED": no hay evaluación válida del adaptador; las muestras de `samples.txt` provienen de un harness defectuoso y no deben interpretarse como indicador de calidad.
- El adaptador debe aplicarse exactamente sobre `huihui-ai/Huihui-Qwen3.8-27B-abliterated`; otra base, incluida la versión no abliterada, no funcionará. El SHA exacto se ofrece bajo petición.
- El pre-paso de entropía es parte integral del sistema; evaluar el adaptador de forma aislada no refleja su uso previsto.
- Riesgo de falsos negativos: el propio pre-paso tiene recall 0,76 y algunas formas ocultas puntúan cerca de cero sospecha; el adaptador debe cubrir esos huecos, algo aún no verificado.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede emitir veredictos JSON plausibles pero incorrectos; la salida debe tratarse como señal, no como decisión final.
- Sesgos: el corpus positivo es sintético y limitado a las transformaciones T1–T10; malware real con formas no contempladas puede pasar desapercibido.
- Idiomas: no disponibles; el análisis se centra en código fuente, no en texto natural multilingüe.
- Restricciones de licencia: hereda la licencia de Qwen y los términos de la abliteración de huihui-ai; es obligatorio confirmarlos antes de redistribuir o usar comercialmente.
- El modelo base es una abliteración descrita por su autor como "prueba de concepto cruda"; su calidad es determinante para el adaptador.
- Uso previsto exclusivamente defensivo: leer código y aconsejar, sin actuar sobre sistemas en vivo ni generar indicadores ofensivos.
- El adaptador referencia en algunas respuestas de identidad a un sistema local llamado "Echo", ajeno a la función de detección.

## Enlaces

- HuggingFace: https://huggingface.co/lukeecho/shibboleth-qwen38-27b-lora
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio de Qwen: no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
