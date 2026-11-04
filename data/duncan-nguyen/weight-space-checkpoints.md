# duncan-nguyen/weight-space-checkpoints

## Resumen

`duncan-nguyen/weight-space-checkpoints` es un repositorio de checkpoints de pesos, no un modelo listo para inferencia. Contiene instantaneas densas en fp32 de los pesos de encoders preentrenados que han sido afinados como modelos de sentence embeddings mediante aprendizaje contrastivo con InfoNCE. El autor lo publica como material de soporte para un estudio sobre la geometria del espacio de pesos durante el fine-tuning contrastivo.

El repositorio incluye 40 snapshots por ejecucion, estadisticas del optimizador por paso, tablas de analisis y evaluaciones. Las ejecuciones cubren varios regimenes: SimCSE no supervisado, AllNLI supervisado, un control de pares aleatorios y controles de learning rate constante. Las arquitecturas base son Ettin (jhu-clsp), MiniLM (Microsoft), BERT, DistilBERT, RoBERTa y ModernBERT.

Es relevante para investigadores interesados en dinamica de entrenamiento, geometria de pesos y estabilidad del fine-tuning contrastivo, no para desarrolladores que busquen un modelo desplegable. El repositorio ocupa 83.8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoders transformer (BERT, DistilBERT, RoBERTa, MiniLM, Ettin, ModernBERT) afinados con InfoNCE |
| Parametros totales | no disponible (varia segun el modelo base de cada ejecucion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en fp32) |
| Idiomas soportados | no disponible |
| Licencia | other (los pesos heredan la licencia de cada modelo base: MIT, Apache-2.0) |
| Formato de pesos | safetensors fp32 (tablas de embedding almacenadas de forma row-sparse respecto al paso 0) |

## Arquitectura y entrenamiento

Los checkpoints corresponden a encoders transformer densos afinados con la perdida InfoNCE en cuatro regimenes: SimCSE no supervisado, AllNLI supervisado, control de pares aleatorios y controles con learning rate constante. Se guardan 40 snapshots por ejecucion, con estadisticas del optimizador por paso y evaluaciones asociadas. Las tablas de embedding se almacenan de forma row-sparse contra el paso 0 y se reconstruyen de forma exacta mediante `wsd.ckpt.SnapshotStore`.

La estructura del repositorio es `runs/<model>/<regime>/<tag>_lr<lr>_seed<seed>/`, con subdirectorios `snapshots/`, `logs/`, `analysis/`, `eval/` y un fichero `run.json`. Ademas, `runs_pilot/` contiene ejecuciones piloto de ajuste de learning rate con solo los snapshots inicial y final.

## Capacidades

- No es un modelo para inferencia directa: el repositorio contiene pesos intermedios de entrenamiento, no un checkpoint final listo para uso.
- Permite reproducir el analisis de geometria del espacio de pesos durante el fine-tuning contrastivo.
- Proporciona estadisticas del optimizador por paso para estudiar dinamica de entrenamiento.
- Incluye evaluaciones por snapshot para analizar la evolucion del rendimiento en sentence embeddings.
- Sirve como base para estudiar diferencias entre regimenes supervisados y no supervisados.
- No se documentan capacidades de generacion, tool calling, agentes ni multimodalidad.

## Casos de uso

- Investigacion en geometria de pesos: analizar como evolucionan los pesos de un encoder durante el fine-tuning contrastivo usando los 40 snapshots por ejecucion.
- Estudio de estabilidad del entrenamiento: comparar regimenes con learning rate constante frente a schedules convencionales usando `runs_pilot/`.
- Analisis de colapso representacional: examinar la evolucion de las tablas de embedding (almacenadas row-sparse) para detectar degeneracion dimensional.
- Reproducibilidad de experimentos de SimCSE y AllNLI: partir de los snapshots y logs para replicar curvas de entrenamiento y evaluaciones.
- Comparativa entre arquitecturas base: contrastar BERT, RoBERTa, ModernBERT, Ettin y MiniLM bajo el mismo regimen de fine-tuning.
- Docencia y formacion: usar los snapshots intermedios para ilustrar el efecto del aprendizaje contrastivo sobre representaciones densas.
- Desarrollo de metodos de merging o interpolacion de pesos: los snapshots intermedios permiten experimentar con tecnicas de model soup o task arithmetic sobre estados de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 83.8 GB; conviene descargar solo las ejecuciones necesarias.
- VRAM para inferencia: no aplica directamente, ya que no es un modelo desplegable; para cargar un snapshot individual en fp32 se requiere memoria proporcional al tamano del encoder base (desde cientos de MB para DistilBERT hasta varios GB para ModernBERT).
- GPU recomendadas: no disponible para inferencia; para analisis de pesos basta CPU o una GPU consumer con memoria suficiente para el encoder concreto.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no estan pensados para este tipo de artefacto).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Repositorio | Tipo | Contenido | Licencia | Uso previsto |
|---|---|---|---|---|
| duncan-nguyen/weight-space-checkpoints | Checkpoints de investigacion | 40 snapshots fp32 por ejecucion, logs, analisis y evaluaciones | other (heredada del modelo base) | Estudio de geometria de pesos |
| Modelos SimCSE publicados (p. ej. princeton-nlp) | Modelos finales | Pesos finales de sentence embeddings | MIT/Apache-2.0 segun variante | Inferencia de embeddings |
| Checkpoints intermedios de frameworks (p. ej. Hugging Face Trainer) | Checkpoints de entrenamiento | Estados periodicos sin analisis asociado | Segun el modelo base | Reanudacion de entrenamiento |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: carece de pipeline, tokenizer documentado y checkpoint final unico.
- La licencia `other` obliga a revisar la licencia del modelo base de cada ejecucion (MIT para Ettin, MiniLM y RoBERTa; Apache-2.0 para BERT, DistilBERT y ModernBERT) antes de cualquier uso derivado.
- No se documentan idiomas soportados ni sesgos conocidos.
- No se especifican longitudes de contexto ni datos de entrenamiento mas alla del regimen contrastivo.
- El gran tamano del repositorio (83.8 GB) puede dificultar su descarga y almacenamiento.
- Al tratarse de snapshots intermedios, el rendimiento de cada uno puede ser inferior al del checkpoint final del entrenamiento.
- No hay informacion sobre calidad de las evaluaciones incluidas ni sobre su metodologia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/duncan-nguyen/weight-space-checkpoints
