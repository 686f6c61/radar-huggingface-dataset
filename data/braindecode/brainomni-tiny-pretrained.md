# braindecode/brainomni-tiny-pretrained

## Resumen

BrainOmni tiny pretrained es un modelo fundacional de señales cerebrales (EEG y MEG) publicado por el equipo de BrainOmni (Xiao y colaboradores) y convertido al ecosistema de braindecode por el propio equipo de la librería. Se trata de un transformer de 15.417.832 parámetros con una dimensión de modelo (`lm_dim`) de 256, 8 cabezas de atención y 12 bloques, acompañado de un tokenizador congelado que transforma las señales neurofisiológicas crudas en tokens. Esta variante "tiny" corresponde a la versión más pequeña de la familia y su objetivo es servir como extractor de representaciones reutilizable para tareas de decodificación cerebral.

El problema que resuelve es la fragmentación del aprendizaje automático aplicado a señales cerebrales: en lugar de entrenar un modelo desde cero para cada tarea, modalidad (EEG o MEG) o montaje de electrodos, BrainOmni ofrece un backbone preentrenado que unifica ambas modalidades bajo una misma arquitectura. La conversión a braindecode permite cargarlo directamente con `BrainOmni.from_pretrained(...)` y ajustarlo o hacer *linear probing*, lo que reduce de forma notable el coste de entrada para grupos de investigación.

Es relevante ahora porque se publica como parte del trabajo "BrainOmni: A Brain Foundation Model for Unified EEG and MEG Signals" (NeurIPS 2025, arXiv:2505.18185) y llega con licencia MIT, lo que facilita su adopción tanto en investigación como en productos. Conviene subrayar que, tal como advierte la model card, la cabeza de clasificación no está preentrenada (inicialización aleatoria con semilla fija), por lo que requiere ajuste fino o *linear probing* antes de cualquier uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BrainOmni); `lm_dim` 256, 8 cabezas, 12 bloques, con tokenizador congelado y cache RoPE |
| Parametros totales | 15.417.832 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 y bfloat16 (verificados en la conversion); no se documentan formatos GGUF/INT8 |
| Idiomas soportados | no aplica (modelo de señales EEG/MEG, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors y pytorch_model.bin |

## Arquitectura y entrenamiento

BrainOmni es un modelo fundacional de tipo transformer diseñado para unificar señales EEG y MEG bajo una representación común. La variante tiny emplea una dimensión de modelo de 256, 8 cabezas de atención y 12 bloques, con codificación posicional rotatoria (RoPE). El modelo incluye un tokenizador congelado que convierte las señales crudas en tokens y un predictor de máscara (*mask predictor*) utilizado únicamente durante el preentrenamiento, que se descarta en la conversión a braindecode. La conversión reescribe las claves, almacena la cache RoPE como pares `(cos, sin)` con seno a cero (la versión original solo guarda cosenos y su código la usa tal cual se carga) y genera `config.json`, `model.safetensors` y `pytorch_model.bin`. Según la model card, las salidas del modelo convertido coinciden de forma exacta con la carga del fichero original por parte de braindecode (diferencia máxima absoluta de 0.0, tanto en float32 como en bfloat16).

En cuanto a los datos de entrenamiento, la información proporcionada no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables a este dominio). La entrada se espera a 256 Hz y con el preprocesamiento del código original de los autores. La estructura de canales (`chs_info`) debe incluir las posiciones de los sensores (EEG) y las orientaciones de las bobinas (MEG); el `chs_info` incluido en `config.json` (19 canales EEG, montaje 10-20) es solo un valor por defecto.

## Capacidades

- Extracción de representaciones (embeddings) a partir de señales EEG y MEG crudas preprocesadas.
- Modelado unificado de dos modalidades neurofisiológicas bajo una misma arquitectura.
- Ajuste fino supervisado para tareas de clasificación (por ejemplo, decodificación de tareas cognitivas, imaginación motora o detección de eventos).
- *Linear probing* congelando el backbone para evaluar la calidad de las representaciones.
- Transferencia a nuevos montajes de electrodos mediante la especificación de `chs_info` con posiciones de sensores y orientaciones de bobinas.
- Soporte de ejecución en float32 y bfloat16.
- No dispone de generación de texto, *tool calling*, función de agentes ni razonamiento multi-paso en lenguaje natural: no es un modelo lingüístico.
- No se documentan capacidades multilingües (no aplica).
- No se documenta ningún modo especial (thinking, visión o audio) en la información disponible.

## Casos de uso

- Decodificación de imaginación motora para interfaces cerebro-computador (BCI): se ajusta la cabeza de clasificación sobre los embeddings del backbone para distinguir entre tareas motoras a partir de EEG, aprovechando el preentrenamiento para reducir las muestras necesarias.
- Detección de eventos epilépticos y otras anomalías: el modelo actúa como extractor de características que alimenta un clasificador para identificar patrones patológicos en registros EEG de múltiples canales.
- Análisis de potenciales relacionados con eventos (ERP): uso en investigación cognitiva para clasificar ensayos según estímulo o condición experimental.
- Estudio conjunto de EEG y MEG: al unificar ambas modalidades, permite entrenar un modelo sobre MEG y aplicarlo o compararlo con datos EEG, o combinar ambos corpus.
- *Benchmark* de representaciones neurofisiológicas: mediante *linear probing* congelando el backbone, sirve como línea base reproducible para comparar contra otros modelos fundacionales de señales cerebrales.
- Preentrenamiento como backbone para nuevas tareas: se reutiliza como punto de partida para transferencia a dominios específicos (sueño, atención, carga cognitiva) con datos propios.
- Construcción de pipelines de neurociencia computacional: al integrarse en braindecode, encaja en flujos ya existentes de carga de datos (`raw`), definición de `chs_info` y entrenamiento con PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 62 MB en float32 y unos 31 MB en bfloat16, calculados a partir de los 15.417.832 parámetros (estimación derivada del recuento de parámetros; no aportada en la model card).
- GPU recomendadas: cualquier GPU, incluida una RTX 4090 o incluso integradas, dado el reducido tamaño del modelo. No requiere A100/H100 para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual; también es viable su ejecución en CPU.
- Opciones de despliegue: braindecode (requiere una versión superior a 1.8.1) sobre PyTorch, con pesos en safetensors o pytorch_model.bin. Las herramientas orientadas a LLM de texto (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrainOmni tiny (este) | 15.417.832 | no disponible | no disponible | MIT | HuggingFace (braindecode/brainomni-tiny-pretrained) |
| BrainOmni (otros tamanos del release original) | no disponible | no disponible | no disponible | MIT | HuggingFace (OpenTSLab/BrainOmni) |
| LaBraM (modelo fundacional EEG) | no disponible | no disponible | no disponible | no disponible | no disponible |
| BIOT (modelo fundacional EEG) | no disponible | no disponible | no disponible | no disponible | no disponible |
| EEGPT (modelo fundacional EEG) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cabeza de clasificación no está preentrenada: se inicializa de forma aleatoria con semilla fija, por lo que es imprescindible ajustarla o hacer *linear probing* antes de cualquier uso.
- Requiere una versión de braindecode superior a la 1.8.1; versiones anteriores no son compatibles.
- La entrada debe presentarse a 256 Hz y con el preprocesamiento del código original de los autores; desviarse de este formato puede degradar los resultados.
- `chs_info` debe incluir las posiciones de los sensores (EEG) y las orientaciones de las bobinas (MEG); el valor por defecto de `config.json` (19 canales EEG, 10-20) es solo una referencia y puede no corresponder al montaje real.
- No es un modelo de lenguaje: no genera texto, no soporta *tool calling* ni agentes, y no ofrece capacidades multilingües.
- No se documentan en la información disponible los sesgos del preentrenamiento ni la composición del dataset, por lo que no puede evaluarse su posible sesgo demográfico o de adquisición.
- Riesgo de predicciones erróneas en tareas clínicas: cualquier uso diagnóstico debe validarse con datos propios y no basarse únicamente en el modelo.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, condicionado a mantener el aviso de licencia y la atribución correspondiente.
- El concepto de "alucinación" no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones espurias en señales fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/braindecode/brainomni-tiny-pretrained
- Fuente original (release de los autores): https://huggingface.co/OpenTSLab/BrainOmni
- Documentación de `braindecode.models.BrainOmni`: https://braindecode.org/stable/generated/braindecode.models.BrainOmni.html
- Paper: BrainOmni: A Brain Foundation Model for Unified EEG and MEG Signals (NeurIPS 2025), arXiv:2505.18185 — https://arxiv.org/abs/2505.18185
- Braindecode: a deep learning library for raw electrophysiological data, Zenodo, doi:10.5281/zenodo.17699192 — https://doi.org/10.5281/zenodo.17699192
