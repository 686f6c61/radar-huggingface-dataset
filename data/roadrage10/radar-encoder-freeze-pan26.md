# roadrage10/radar-encoder-freeze-pan26

## Resumen

`roadrage10/radar-encoder-freeze-pan26` es un modelo de clasificación de texto (pipeline `text-classification`) construido sobre un encoder transformer y afinado mediante la librería Transformers. Con 399.711.361 parámetros totales y un repositorio de 3,2 GB, se trata de un encoder de gran tamano, no de un modelo generativo. Los tags del repositorio incluyen `radar` y `custom_code`, lo que indica que depende de código de arquitectura propio y no de una clase estándar de Transformers.

El nombre del modelo y los resultados de la búsqueda web lo vinculan a RADAR (Robust Adversarial-Resistant Detection with Adaptive Reasoning), una arquitectura híbrida orientada a la detección de texto generado por IA, disenada para resistir ofuscaciones adversarias y imitación de estilo. El sufijo `pan26` apunta al laboratorio PAN 2026 (CLEF), y `encoder-freeze` sugiere que parte del encoder se mantiene congelado durante el ajuste fino. El modelo se publicó el 13 de octubre de 2026 y, en el momento de la consulta, acumula 3 descargas y 0 likes, por lo que no tiene validación comunitaria.

La relevancia es acotada y experimental: se trata de un artefacto de investigación con model card autogenerada, licencia no declarada y sin resultados en el `model-index`. Su interés principal es reproducir o comparar la aproximación RADAR para detección de texto sintético en el contexto de PAN 2026, no su uso en producción sin evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con código personalizado (`custom_code`); integrado en la familia RADAR (arquitectura híbrida para detección de texto generado por IA, segun la descripción del repositorio pan26-radar) |
| Parametros totales | 399.711.361 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 3,2 GB, con trazas de TensorBoard) |
| Tarea | Clasificación de texto (`text-classification`) |
| Libreria | Transformers 5.0.0 |
| Framework de entrenamiento | PyTorch 2.10.0+cu128, Datasets 4.0.0, Tokenizers 0.22.2 |
| Fecha de publicacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna y el campo de modelo base aparece vacío ("fine-tuned version of [] on the None dataset"), por lo que se desconoce que checkpoint original se utilizó. Lo que sí se puede afirmar es que se trata de un encoder de 399,7 M de parámetros con código personalizado (`custom_code`), ejecutado con Transformers 5.0.0. La documentación del proyecto RADAR en GitHub lo define como una arquitectura híbrida para detección de texto generado por IA, robusta frente a ofuscaciones adversarias y mimetismo de estilo; el sufijo `encoder-freeze` sugiere que una parte del encoder permaneció congelada y solo se entrenó la cabeza o un subconjunto de capas.

Respecto al entrenamiento, los hiperparámetros registrados son: learning rate 2e-05, batch de entrenamiento 32, batch de evaluación 64, semilla 42, optimizador AdamW variante `ADAMW_TORCH_FUSED` con betas (0,9, 0,999) y epsilon 1e-08, scheduler coseno con `warmup` del 3 % y 10 épocas. El conjunto de datos de entrenamiento y evaluación aparece como `None` en la model card, sin número de tokens ni composición declarada. No se documenta RLHF, DPO ni ninguna técnica de alineación, lo cual es coherente con un modelo discriminativo. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal: no aplican a un clasificador.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, con salida probabilística (se reportan ROC-AUC y Brier score, lo que indica una cabeza de clasificación binaria o con probabilidades calibradas).
- Detección de texto generado por IA: segun la descripción del proyecto RADAR, la arquitectura está orientada a distinguir texto humano de texto sintético.
- Robustez frente a ofuscaciones adversarias: la documentación de RADAR menciona resistencia a manipulación de estilo y a transformaciones adversarias, aunque no se aportan métricas que lo cuantifiquen en esta ficha.
- Métricas declaradas de evaluación: ROC-AUC 0,716, C@1 0,65, F1 0,659, F05u 0,649 y Brier 0,731 sobre el conjunto de evaluación.
- Soporte de tool calling / function calling: no disponible (no aplica a un clasificador).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Detección de texto generado por IA en envíos académicos: integrado como clasificador previo a la revisión humana, filtrando trabajos sospechosos de generación automática según la probabilidad de la cabeza de clasificación.
- Moderación de contenido en plataformas: uso como componente de scoring para marcar publicaciones generadas masivamente por bots, aprovechando la orientación de RADAR a resistir reescrituras automáticas.
- Verificación periodística: señal auxiliar para que un redactor decida si un texto recibido requiere verificación adicional antes de publicarse, usando la salida probabilística del modelo.
- Participación en el laboratorio PAN 2026: reproduce o sirve de base para la tarea RADAR, comparando métricas (C@1, F05u, Brier) con las de otros equipos.
- Investigación en detección adversaria: permite estudiar hasta qué punto un encoder con capas congeladas mantiene su rendimiento frente a ataques de paráfrasis o cambios de estilo.
- Filtrado de datos de entrenamiento: uso como discriminador para depurar corpus y separar muestras sintéticas de muestras humanas antes de entrenar modelos generativos.
- Control de calidad en pipelines de generación: clasificador post-generación que marca salidas con alta probabilidad de ser detectadas como artificiales, útil en entornos donde eso supone un problema.

## Benchmarks y rendimiento

El `model-index` oficial no contiene entradas (`results: []`), por lo que no hay benchmarks comparativos publicados por el autor. La model card sí reporta métricas sobre el conjunto de evaluación y una tabla de evolución durante el entrenamiento.

Metricas del conjunto de evaluacion (declaradas en la model card):

| Metrica | Valor |
|---|---|
| Loss | 0,7864 |
| ROC-AUC | 0,716 |
| Brier | 0,731 |
| C@1 | 0,65 |
| F1 | 0,659 |
| F05u | 0,649 |
| Mean | 0,681 |

Evolucion durante el entrenamiento (validacion, datos declarados por el autor):

| Epoca | Paso | Validation loss | ROC-AUC | Brier | C@1 | F1 | F05u | Mean |
|---|---|---|---|---|---|---|---|---|
| 0,6748 | 500 | 0,1264 | 0,984 | 0,956 | 0,942 | 0,955 | 0,955 | 0,958 |
| 1,3495 | 1000 | 0,0864 | 0,992 | 0,970 | 0,963 | 0,971 | 0,971 | 0,973 |
| 2,0243 | 1500 | 0,0732 | 0,994 | 0,976 | 0,968 | 0,975 | 0,971 | 0,977 |
| 2,6991 | 2000 | 0,0638 | 0,995 | 0,979 | 0,972 | 0,979 | 0,977 | 0,980 |
| 3,3738 | 2500 | 0,0583 | 0,996 | 0,980 | 0,972 | 0,979 | 0,980 | 0,981 |
| 4,0486 | 3000 | 0,0618 | 0,996 | 0,980 | 0,974 | 0,980 | 0,977 | 0,981 |
| 4,7233 | 3500 | 0,0555 | 0,997 | 0,979 | 0,970 | 0,977 | 0,983 | 0,981 |
| 5,3981 | 4000 | 0,0522 | 0,997 | 0,982 | 0,977 | 0,982 | 0,981 | 0,984 |
| 6,0729 | 4500 | 0,0534 | 0,997 | 0,983 | 0,978 | 0,983 | 0,981 | 0,984 |
| 6,7476 | 5000 | 0,0694 | 0,997 | 0,979 | 0,973 | 0,980 | 0,972 | 0,980 |
| 7,4224 | 5500 | 0,0488 | 0,997 | 0,983 | 0,977 | 0,982 | 0,983 | 0,984 |
| 8,0972 | 6000 | 0,0507 | 0,997 | 0,983 | 0,979 | 0,984 | 0,982 | 0,985 |
| 8,7719 | 6500 | 0,0478 | 0,997 | 0,983 | 0,978 | 0,983 | 0,984 | 0,985 |
| 9,4467 | 7000 | 0,0494 | 0,997 | 0,984 | 0,978 | 0,983 | 0,982 | 0,985 |

Existe una discrepancia notable entre las metricas de validacion de la tabla de entrenamiento (F1 en torno a 0,983) y las metricas del "conjunto de evaluacion" declaradas en el encabezado (F1 0,659). No se aclara en la model card si corresponden a particiones distintas del mismo conjunto o a una evaluacion posterior; conviene tratarlas con cautela.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,6 GB solo para pesos (399,7 M de parámetros x 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: en torno a 0,8 GB para pesos.
- VRAM estimada en int8: en torno a 0,4 GB para pesos, si se aplica cuantización dinámica en el momento de la carga (no hay variantes pre-cuantizadas publicadas).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia; para entrenamiento o fine-tuning completo se recomienda A100, H100 o RTX 4090 (24 GB).
- Consumer GPU: sí cabe con holgura. RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 y GPUs integradas con suficiente memoria compartida pueden ejecutarlo.
- CPU: viable para inferencia por lotes en clasificación, dada la ausencia de decodificación autoregresiva.
- Opciones de despliegue: `pipeline` de Transformers, Text Generation Inference (soporta clasificación), ONNX Runtime para exportación, TorchServe o FastAPI con `torch.compile`. No hay soporte GGUF ni Ollama mientras no se publique una conversión a `llama.cpp`.
- Latencia y throughput: no disponibles. Al ser un encoder de 399 M con `custom_code`, el tiempo de inferencia depende de la implementación registrada en el repositorio.

## Comparativa con modelos similares

No hay benchmarks publicados en el `model-index` ni documentación suficiente sobre el modelo base, por lo que no es posible establecer una comparación cuantitativa fiable. La siguiente tabla recoge lo que sí se conoce:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| radar-encoder-freeze-pan26 | 399,7 M | No disponible | No disponible | HuggingFace, 3 descargas | Objeto de esta ficha; sin benchmarks comparativos |
| radar-encoder-freeze | No disponible | No disponible | No disponible | HuggingFace (repositorio hermano) | Variante relacionada del mismo autor/proyecto |
| Encoders tipo DeBERTa-v3-large (referencia genérica) | ~435 M | 512 tokens | MIT (habitual) | Ampliamente desplegado | Base común para clasificación; comparación orientativa, no verificada contra este modelo |
| Encoders tipo RoBERTa-large (referencia genérica) | ~355 M | 512 tokens | MIT (habitual) | Ampliamente desplegado | Referencia de tamano similar; sin datos de comparación con RADAR |

No se dispone de resultados comparativos entre `radar-encoder-freeze-pan26` y alternativas de detección de texto generado por IA (por ejemplo, detectores comerciales o los sistemas presentados en PAN 2026), por lo que cualquier afirmación de superioridad o inferioridad carecería de base.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor antes de integrarlo en un producto.
- Model card incompleta: el campo de modelo base aparece vacío, el dataset figura como `None` y no se documentan idiomas, sesgos ni limitaciones. La propia plantilla pide revisarla y completarla.
- Discrepancia de metricas: la diferencia entre el F1 de validacion (0,983) y el del conjunto de evaluacion (0,659) no esta explicada. No debe asumirse el valor mas alto de cara a produccion.
- Riesgo de alucinacion: no aplica de forma directa al ser un clasificador, pero sí existe riesgo de falsos positivos y falsos negativos, con Brier 0,731 en evaluacion, que indica una calibracion de probabilidades deficiente.
- Robustez adversaria no verificada: la documentacion del proyecto afirma resistencia a ofuscaciones, pero no se aportan tasas de evasion medidas sobre este checkpoint concreto.
- Idiomas no declarados: no se puede garantizar un rendimiento uniforme fuera del idioma o idiomas del conjunto de entrenamiento, que no se especifica.
- Cobertura de dominio desconocida: sin información sobre la composición del corpus, no se sabe si generaliza a dominios distintos (académico, redes sociales, periodístico).
- Validacion comunitaria nula: 3 descargas y 0 likes; no hay terceros que hayan reproducido los resultados.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True` y la ejecución de código del autor, lo que introduce un riesgo de seguridad en despliegues automatizados.
- Fecha de publicacion futura respecto a entornos con versiones estables de Transformers: requiere Transformers 5.0.0, lo que puede limitar la compatibilidad con toolchains actuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roadrage10/radar-encoder-freeze-pan26
- Modelo relacionado del mismo autor: https://huggingface.co/roadrage10/radar-encoder-freeze
- Repositorio del proyecto RADAR (notebook de este modelo): https://github.com/mam10eks/pan26-radar/blob/main/notebooks/radar_encoder_freeze_pan26.ipynb
- Repositorio del proyecto RADAR (notebook de la variante base): https://github.com/mam10eks/pan26-radar/blob/main/notebooks/radar_encoder_freeze.ipynb
- Ficha de la variante en agregador de modelos: https://free2aitools.com/dataset/mahmoodanaam/radar-encoder-freeze
