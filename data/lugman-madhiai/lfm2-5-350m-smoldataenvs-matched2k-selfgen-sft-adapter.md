# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-SelfGen-SFT-adapter

## Resumen

El modelo `lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-SelfGen-SFT-adapter` es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario lugman-madhiai sobre el modelo base LiquidAI/LFM2.5-350M, un transformer de 350 millones de parametros desarrollado por Liquid AI. El adaptador se ha entrenado con la libreria Unsloth y TRL, y se distribuye bajo licencia Apache 2.0. Su nombre sugiere un entrenamiento orientado a entornos de datos emparejados (SmolDataEnvs) con generacion propia (SelfGen) y un conjunto de aproximadamente 2000 ejemplos.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, publicado el 1 de noviembre de 2026. No incluye model card detallada mas alla de los metadatos de entrenamiento, ni resultados de evaluacion, ni descripcion del dataset utilizado. El repositorio tiene un tamano de 0.0 GB, lo que es coherente con un adaptador LoRA de parametros reducidos, no con un modelo completo.

Su relevancia es limitada fuera del contexto del autor: sirve como ejemplo de flujo de trabajo de ajuste fino eficiente con Unsloth sobre la familia LFM2, pero no aporta informacion verificable sobre calidad, capacidades o rendimiento. Para cualquier uso en produccion seria necesario evaluar el adaptador contra el modelo base y validar el comportamiento en las tareas objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SFT sobre LiquidAI/LFM2.5-350M (transformer, familia LFM2) |
| Parametros totales | 350M en el modelo base; el adaptador anade un numero no disponible de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base LFM2.5-350M) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de Liquid AI. La informacion disponible no detalla la arquitectura interna del modelo base (tipo de atencion, capas, dimensiones ocultas) ni la configuracion exacta del adaptador (rango LoRA, modulos objetivo, hiperparametros). El entrenamiento se realizo con Unsloth y TRL, segun los tags del repositorio, lo que indica un pipeline de SFT eficiente en memoria y tiempo (el autor afirma un entrenamiento 2x mas rapido con Unsloth).

El nombre del adaptador sugiere el uso de un dataset denominado SmolDataEnvs-Matched2k con generacion propia (SelfGen), de aproximadamente 2000 ejemplos, pero no se proporciona informacion sobre la composicion, el dominio ni el proceso de filtrado. No hay evidencia de RLHF, DPO ni tecnicas de alineacion adicionales. Tampoco se documentan innovaciones tecnicas propias del adaptador mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base LFM2.5-350M.
- Ajuste fino supervisado orientado, segun el nombre, a tareas de entornos de datos emparejados; la naturaleza exacta de la tarea no esta documentada.
- Compatibilidad con transformers y text-generation-inference, lo que permite desplegarlo con el ecosistema estandar de Hugging Face.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion academica con adaptadores SFT: el modelo sirve como referencia para reproducir un pipeline de ajuste fino con Unsloth y TRL sobre un modelo base pequeno, util en cursos y talleres.
- Pruebas de concepto de generacion de texto en ingles con recursos minimos: al partir de un modelo de 350M, puede ejecutarse en CPU o GPU de gama baja para prototipos rapidos.
- Evaluacion comparativa de adaptadores: permite medir el efecto de un SFT de 2000 ejemplos sobre el modelo base en tareas concretas, siempre que se disponga del dataset original.
- Integracion en pipelines de text-generation-inference: el tag `text-generation-inference` facilita el despliegue como endpoint compatible con la API de TGI para pruebas internas.
- Base para nuevos ajustes finos: al ser un adaptador Apache 2.0, puede combinarse o continuar entrenandose en experimentos posteriores.
- Docencia sobre licencias y publicacion de modelos: ejemplo de publicacion de un artefacto de investigacion con metadatos minimos, util para discutir buenas practicas de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo base de 350M en fp16 se estiman en torno a 0.7-1 GB de pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible. Por tamano, cabria en GPUs consumer como RTX 3060, RTX 4060 o superiores, asi como en CPU para inferencia lenta.
- Cabe en consumer GPU: probablemente si, dado el tamano del modelo base, aunque no hay confirmacion del autor.
- Opciones de despliegue: transformers, text-generation-inference (segun tags). No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI con version concreta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-SelfGen-SFT-adapter | 350M (base) + adaptador | no disponible | apache-2.0 | Hugging Face, 0 descargas | Adaptador SFT sin evaluacion publicada |
| LiquidAI/LFM2.5-350M | 350M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) | Modelo base oficial de Liquid AI |
| Modelos de ~350M de otras familias (p. ej., Qwen, SmolLM) | ~350M | variable | variable | Hugging Face | Alternativas de tamano similar; no se dispone de datos comparativos verificados en esta ficha |

No se dispone de informacion suficiente para una comparativa cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, metricas ni ejemplos de salida que permitan validar la calidad del adaptador.
- Documentacion minima: la model card no describe el dataset, los hiperparametros ni el objetivo del entrenamiento, lo que dificulta la reproducibilidad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 350M, especialmente en tareas de razonamiento o conocimiento factual.
- Sesgos: no documentados; al entrenarse sobre un dataset no descrito, pueden persistir sesgos del modelo base y del corpus de ajuste.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador se distribuye sin garantias y el autor no ofrece soporte.
- Cero adopcion: con 0 descargas y 0 likes, no hay evidencia de uso en la comunidad ni de validacion independiente.
- Uso en produccion: desaconsejado sin una evaluacion previa contra el modelo base y sin conocer el dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-SelfGen-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
