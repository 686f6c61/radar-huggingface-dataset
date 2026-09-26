# alexzhang0118/Decily-MLX-4bit

## Resumen

Decily es un modelo de decisión de tipo *candidate scorer* (puntuador de candidatos) construido sobre el *backbone* de Qwen3-1.7B-Base. A diferencia de un modelo generativo, no produce texto: recibe un `state`, una `question` y un conjunto de entre 2 y 16 candidatos, y devuelve una distribución de probabilidad calibrada sobre esos candidatos. Su objetivo es ofrecer una probabilidad que se pueda umbralizar directamente, en lugar de una frase que haya que interpretar.

Este repositorio concreto (`alexzhang0118/Decily-MLX-4bit`) es la variante de 4 bits para MLX, pensada para inferencia en dispositivo (*on-device*) y entornos con poca memoria. La torre está cuantizada con *affine* group-64 (968 MB) y la cabeza de puntuación (`decision_head.safetensors`) se distribuye por separado en fp32 para preservar la calibración. El modelo base cuenta con 1.720.574.976 parámetros y el repositorio ocupa aproximadamente 1,0 GB.

La relevancia de Decily radica en su enfoque hacia la predicción selectiva y la calibración: está diseñado para tareas de enrutamiento, clasificación de intención o desambiguación donde se necesita una probabilidad fiable y umbralizable, con un coste de memoria reducido que permite ejecutarlo en hardware de consumo. El autor publica la misma familia en cuatro contenedores (PyTorch bf16, MLX bf16, MLX 4-bit y ONNX int8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre transformer Qwen3 con cabeza de scoring (attention-pooling + LayerNorm/GELU MLP) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana generativa; limites de entrenamiento: `state` <=256 tokens, `question` <=96 tokens, cada candidato <=64 tokens, 2-16 candidatos por llamada |
| Tipos de cuantizacion | 4-bit affine group-64 (esta variante); la familia incluye bf16 e int8 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); `model.safetensors` + `model.safetensors.index.json` (torre cuantizada) y `decision_head.safetensors` (cabeza en fp32) |

## Arquitectura y entrenamiento

Decily es un *cross-encoder* de puntuación de candidatos: el *backbone* codifica conjuntamente `state + question + candidate`, y una capa de *attention-pooling* sobre todos los tokens alimenta un MLP con LayerNorm/GELU que emite un logit por candidato. Las probabilidades finales provienen de un softmax sobre el conjunto de candidatos proporcionado. El modelo base es `Qwen/Qwen3-1.7B-Base` (1,72B parámetros, Apache-2.0), al que se añade la cabeza de puntuación (`decision_head`, especificada en `config.json`). La temperatura se aplica sobre los logits en bruto, ya que estos resultan sobreconfiados fuera de distribución.

El resumen de entrenamiento publicado en la model card describe varias etapas: un profesor (*teacher*) de 45 tareas basado en Qwen3.5-2B con LoRA y *backbone* congelado como etiquetador de referencia; un SFT de LoRA sobre Qwen3-1.7B en 24 familias de tareas con etiquetas duras (3000 pasos, aproximadamente 1 hora); varios miembros RLCD (LoRA v1/v2 más un miembro con *fine-tuning* completo) orientados a calibración de creencias y abstención; y una destilación desde un *ensemble* de 4 modelos en el espacio de probabilidad hacia un único modelo. La receta completa, la justificación de diseño y los experimentos están en el repositorio de entrenamiento `arczhi/decily`.

## Capacidades

- Puntuación de candidatos: devuelve una distribución de probabilidad calibrada sobre un conjunto de 2 a 16 candidatos para un par `state`/`question`.
- Decisión umbralizable: pensado para aplicar umbrales de confianza en lugar de generar texto libre.
- Predicción selectiva y calibración: incluye mecanismos de abstención y ajuste de temperatura (aproximadamente 1,1 en dominio, 0,45 en conjuntos de etiquetas no vistos y 1,35 en la suite *zero-shot*).
- Clasificación de intención y desambiguación: ejemplo documentado de enrutamiento entre categorías como `technical`, `billing`, `shipping`, `returns`.
- Inferencia en dispositivo (esta variante): torre en 4 bits y cabeza en fp32 para MLX.
- *Chunking* de estados largos: al ser los logits independientes del conjunto de candidatos, se puede trocear el estado y hacer una primera selección y posterior reordenación sin pérdida (utilidad de inferencia en dos etapas del repositorio).
- Multilingüe: no; el modelo está etiquetado únicamente para ingles.
- No genera texto y no se documenta soporte de *tool calling*, agentes, visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: usar `state` con el mensaje del cliente y `question` con la intención a clasificar, obteniendo una probabilidad por categoría que se puede derivar al equipo adecuado por umbral.
- Clasificación de intención en asistentes conversacionales: puntuar las intenciones candidatas antes de invocar una acción, evitando depender de la generación de texto para la decisión.
- Predicción selectiva en pipelines críticos: descartar o derivar a revisión humana aquellas decisiones cuya probabilidad no supere un umbral de confianza.
- Filtrado y desambiguación en recuperación de información: reordenar un conjunto de respuestas o documentos candidatos frente a una consulta.
- Moderación o etiquetado ligero en el dispositivo: al ocupar 968 MB la torre cuantizada, permite clasificación local en equipos Apple Silicon sin enviar datos a un servidor.
- Desambiguación de entidades o sentidos: puntuar interpretaciones candidatas de un fragmento de texto en función del contexto aportado en `state`.
- Preprocesado para otros LLM: usar la distribución calibrada como señal de enrutamiento antes de invocar un modelo generativo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente incluye un ejemplo medido con los pesos publicados (bf16, T=0,45) para la consulta "Our app crashes on startup after the latest update." con las opciones `technical`, `billing`, `shipping`, `returns`, que devuelve `{"technical": 0.9999, "billing": 0.0001, "returns": 0.0, "shipping": 0.0}`. No se aportan cifras de MMLU, HumanEval, GSM8K ni de otras suites comparables.

## Requisitos de hardware

- VRAM/memoria estimada: la torre cuantizada a 4 bits ocupa 968 MB; el repositorio completo es de aproximadamente 1,0 GB. La cabeza de puntuación va en fp32 y se carga por separado.
- GPU recomendadas: no se especifican. Al ser una variante MLX, el destino principal es Apple Silicon (memoria unificada).
- GPU de consumo: por tamano (968 MB la torre) es apta para hardware de consumo, en particular equipos Apple Silicon con memoria unificada suficiente para el modelo, la cabeza y las activaciones.
- Opciones de despliegue: MLX mediante `mlx_lm.load` (ejemplo oficial de la model card). Para CPU/Windows/edge existe la variante `Decily-ONNX-int8` (1,66 GB). No se documentan rutas con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La misma familia se distribuye en cuatro contenedores equivalentes. Comparativa de la familia Decily:

| Variante | Formato | Tamano | Destino |
|---|---|---|---|
| Decily-1.7B | PyTorch bf16 safetensors + `config.json` | ~3,4 GB | servidor / GPU |
| Decily-MLX | MLX bf16 safetensors | ~3,4 GB | Apple Silicon |
| Decily-MLX-4bit | MLX 4-bit (group-64 affine) | 968 MB | on-device / baja memoria |
| Decily-ONNX-int8 | ONNX int8 (un solo fichero) | 1,66 GB | CPU / Windows / edge |

Comparativa con el modelo base y alternativas de la misma categoria:

| Modelo | Parametros | Contexto/limites | Licencia | Disponibilidad |
|---|---|---|---|---|
| Decily-MLX-4bit | 1,72B | no disponible (limites de entrada: 256/96/64 tokens) | apache-2.0 | HuggingFace, MLX |
| Qwen/Qwen3-1.7B-Base | 1,72B | no disponible en la informacion | apache-2.0 | HuggingFace |
| Otras alternativas de scoring/clasificacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: el modelo no genera texto, por lo que no aplica el riesgo de alucinacion generativa; sin embargo, las probabilidades pueden ser erroneas o mal calibradas fuera de distribucion.
- Sobreconfianza de los logits: la model card advierte que los logits en bruto son sobreconfiados fuera de distribucion; es necesario ajustar o reportar la temperatura para cada conjunto de datos.
- Limites de contexto e idioma: disenado para `state` <=256 tokens, `question` <=96 tokens y candidatos <=64 tokens; las entradas mas largas se truncan. Solo en ingles.
- Restricciones de licencia: licencia Apache-2.0, que permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia del modelo base (Qwen3-1.7B-Base, Apache-2.0).
- Produccion: el numero de candidatos por llamada esta acotado (2-16); no es un modelo conversacional ni generativo y requiere integrar la cabeza de puntuacion y aplicar softmax sobre los candidatos manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexzhang0118/Decily-MLX-4bit
- Decily-1.7B (variante PyTorch bf16): https://huggingface.co/alexzhang0118/Decily-1.7B
- Decily-MLX (variante MLX bf16): https://huggingface.co/alexzhang0118/Decily-MLX
- Decily-ONNX-int8 (variante ONNX int8): https://huggingface.co/alexzhang0118/Decily-ONNX-int8
- Repositorio de entrenamiento: https://github.com/arczhi/decily
- Receta de entrenamiento (TRAINING.md): https://github.com/arczhi/decily/blob/main/TRAINING.md
- Razonamiento de diseno (DESIGN.md): https://github.com/arczhi/decily/blob/main/DESIGN.md
- Informe de entrenamiento y ablaciones (TRAIN-REPORT.md): https://github.com/arczhi/decily/blob/main/TRAIN-REPORT.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
