# phuayj/gnri

## Resumen

G-NRI (Symmetry-Restored Neural Rule Induction) es un modelo neuro-simbólico de inducción de reglas publicado por el autor phuayj bajo licencia MIT. No es un modelo de lenguaje generativo al uso: su propósito es aprender reglas lógicas interpretables a partir de datos, combinando aprendizaje neuronal con programación lógica inductiva (ILP). El repositorio de Hugging Face distribuye checkpoints de referencia, no un modelo conversacional.

La release pública incluye ocho checkpoints de entrenamiento correspondientes a las semillas 42 a 49 de la condición `gnri`, cada uno con su `checkpoint_last.pt`, un manifiesto de integridad SHA256 y pesos de solo inferencia (`model.safetensors` + `config.json`) cargables mediante `RuleInducer.from_pretrained`. La librería asociada, `gnri`, está implementada sobre PyTorch.

Su relevancia radica en la interpretabilidad y en la restauración de simetrías en el proceso de inducción de reglas, una línea de trabajo dirigida a obtener modelos simbólicos verificables en lugar de cajas negras. No se dispone de información sobre arquitectura de red concreta, número de parámetros, contexto ni idiomas soportados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuro-simbólico de inducción de reglas; implementado en PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors y checkpoints PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (inferencia) y PyTorch `checkpoint_last.pt` (entrenamiento) |

## Arquitectura y entrenamiento

G-NRI se presenta como un sistema neuro-simbólico de inducción de reglas (rule induction) con restauración de simetrías. Combina componentes neuronales en PyTorch con técnicas de programación lógica inductiva (ILP), orientadas a producir reglas interpretables y verificables. La model card no detalla la topología interna de la red, el número de capas ni el volumen de datos de entrenamiento.

El repositorio incluye ocho ejecuciones de entrenamiento independientes (semillas 42 a 49) bajo la condición `gnri`, lo que sugiere un protocolo experimental de reproducibilidad con múltiples semillas. Se proporciona un manifiesto SHA256 para verificar la integridad de cada checkpoint. Asimismo, se mencionan condiciones de evaluación superponibles (por ejemplo `eqarch_tta_export`) y scripts de evaluación sobre conjuntos de datos UCI (`evaluate_uci.py`). No se especifica si hubo RLHF, DPO ni detalles del dataset de entrenamiento.

## Capacidades

- Inducción de reglas lógicas interpretables a partir de datos tabulares u otros conjuntos de entrada.
- Razonamiento neuro-simbólico con restauración de simetrías (symmetry-restored rule induction).
- Evaluación zero-shot dentro del marco experimental del autor (etiqueta `zero-shot` en la model card).
- Integración con la librería `gnri` para cargar pesos de inferencia (`RuleInducer.from_pretrained`) y checkpoints completos (`load_checkpoint_from_hub`).
- Evaluación sobre conjuntos de datos UCI mediante puntos de entrada de evaluación incluidos en la release.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Investigación en programación lógica inductiva: usar los checkpoints como referencia reproducible para comparar variantes de inducción de reglas con múltiples semillas (42 a 49).
- Extracción de reglas interpretables en dominios tabulares: aplicar `RuleInducer` sobre conjuntos de datos UCI para obtener reglas auditables en lugar de predicciones opacas.
- Reproducción de experimentos: cargar `s42/checkpoint_last.pt` a `s49/checkpoint_last.pt` y ejecutar `evaluate_uci.py` con la condición `eqarch_tta_export` para replicar los resultados del autor.
- Verificación de integridad en pipelines de MLOps: usar `manifest_sha256.json` para validar que los pesos descargados no han sido alterados antes de desplegarlos en un entorno de evaluación.
- Estudio de robustez frente a simetrías: emplear la condición `gnri` como base para analizar cómo la restauración de simetrías afecta a la calidad de las reglas inducidas.
- Docencia en sistemas neuro-simbólicos: utilizar la API mínima (`from_pretrained`, `load_checkpoint_from_hub`) como ejemplo práctico de integración entre PyTorch y razonamiento simbólico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0,1 GB, lo que sugiere que los pesos caben holgadamente en cualquier GPU consumer, pero no se confirma el número de parámetros).
- GPU recomendadas: no disponibles de forma específica; al ser un modelo PyTorch de pequeño tamaño en disco, es probable que funcione en CPU y en GPUs consumer, aunque no se documenta.
- Cabe en GPU consumer: presumiblemente sí, dado el tamaño del repositorio, pero no confirmado por el autor.
- Opciones de despliegue: carga mediante la librería `gnri` (`RuleInducer.from_pretrained`, `load_checkpoint_from_hub`) y `huggingface_hub.hf_hub_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (inducción de reglas neuro-simbólica) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento conversacional ni soporte multilingüe.
- La model card no documenta sesgos, tasas de alucinación ni limitaciones idiomáticas; al ser un sistema de inducción de reglas, el riesgo principal es la sobreajuste o reglas espurias, no la alucinación textual.
- Los checkpoints incluidos corresponden únicamente a la condición `gnri` con semillas 42 a 49; otras condiciones de entrenamiento no están cubiertas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos a los evaluados (UCI).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- La fecha de creación indicada (2026-11-17) es futura respecto a la redacción habitual de fichas; conviene verificar la vigencia del repositorio antes de usarlo en producción.
- No se documentan requisitos de versión de PyTorch ni de la librería `gnri`, lo que puede provocar incompatibilidades en entornos no alineados con el autor.

## Enlaces

- Hugging Face: https://huggingface.co/phuayj/gnri
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
