# natsim/cat-dialogue-RoBERTa

## Resumen

`natsim/cat-dialogue-RoBERTa` es un checkpoint de clasificación de texto basado en `RobertaForSequenceClassification`, derivado de `SamLowe/roberta-base-go_emotions` y reajustado a un espacio de seis etiquetas emocionales orientadas a diálogo de mascotas: `resting`, `hunting`, `fighting`, `demanding`, `angry` y `moaning`. Lo publica el usuario `natsim` (Nathaniel Sim) como material de investigación dentro de una pasantía colaborativa en el proyecto PettiChat durante 2025.

El modelo no genera texto ni mantiene conversaciones: es un clasificador discriminativo que asigna texto de personajes animales generado previamente a una de esas seis categorías. Su relevancia es acotada y experimental: sirve para inspeccionar predicciones emocionales sobre diálogo sintético y reproducir comparaciones internas del proyecto. El autor advierte explícitamente de que es un export temprano y que el prototipo final referencia el repositorio posterior `natsim/cat-dialogue-RoBERTa-2`.

La arquitectura es RoBERTa base (transformer encoder), con licencia Apache-2.0 declarada en el repositorio y idioma declarado inglés. No se publican parámetros totales ni longitud de contexto en la información disponible; por herencia de la familia RoBERTa base, el contexto típico es de 512 tokens, aunque el autor no lo confirma de forma explícita en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `RobertaForSequenceClassification` (transformer encoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `SamLowe/roberta-base-go_emotions`, un clasificador RoBERTa base entrenado originalmente sobre el dataset GoEmotions. En este checkpoint la cabeza de clasificación se ha adaptado a un espacio de seis etiquetas específicas del proyecto PettiChat (`resting`, `hunting`, `fighting`, `demanding`, `angry`, `moaning`), orientadas a describir texto de diálogo de personajes animales, no emociones humanas ni estados reales de animales.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF, DPO u otras fases de alineación. El autor enlaza un dataset sintético de emociones (`natsim/if-cats-could-speak`) y un notebook de entrenamiento de RoBERTa, pero advierte que el notebook documenta experimentos relacionados y no constituye un manifiesto inmutable y exacto de estos pesos. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal; se trata de un ajuste fino estándar de clasificación.

## Capacidades

- Clasificación de texto en seis categorías emocionales de diálogo de mascotas.
- Salida de logits y probabilidades softmax por clase mediante `AutoModelForSequenceClassification`.
- Procesamiento de texto de diálogo generado previamente (no genera texto).
- Uso como componente de evaluación en pipelines de investigación de diálogo.
- Compatible con la API estándar de `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modos de razonamiento multi-paso.
- Capacidad multilingüe: no; solo inglés declarado.

## Casos de uso

- Evaluación de diálogo sintético en investigación: clasificar respuestas generadas por personajes animales en una de las seis categorías para estudiar la distribución emocional del corpus. Adecuado porque el modelo fue entrenado específicamente para ese espacio de etiquetas.
- Reproducción de comparaciones internas del proyecto PettiChat: cargar el checkpoint con el subfolder `petaiv4` y comparar predicciones frente al checkpoint posterior `cat-dialogue-RoBERTa-2`.
- Análisis de estilo y tono en corpus de diálogo: inspeccionar si el texto generado se inclina hacia categorías como `angry` o `demanding`, revisando siempre el texto y el estilo por separado de la predicción del clasificador.
- Filtrado y anotación asistida de datasets: etiquetar de forma preliminar grandes volúmenes de diálogo sintético antes de una revisión humana, dado el bajo coste de inferencia de un encoder base.
- Docencia y experimentación con ajuste fino: usar el notebook enlazado y este checkpoint como punto de partida para estudiar la adaptación de un clasificador GoEmotions a un espacio de etiquetas reducido.
- Componente de pipelines de evaluación automática: integrar la salida softmax como señal auxiliar en métricas de calidad de diálogo, sin tratarla como probabilidad calibrada de corrección.
- Pruebas de robustez léxica: analizar si el modelo explota atajos léxicos en frases sintéticas, tal como advierte el autor, comparando con diálogo escrito de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio no proporciona un benchmark verificado sobre un conjunto held-out para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un encoder base de la familia RoBERTa, la inferencia cabe holgadamente en GPUs de consumo, aunque el tamaño del repo (4.5 GB) incluye artefactos adicionales y no equivale al peso del modelo.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con suficiente memoria para un encoder base es suficiente en la práctica.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de gama media y alta, aunque no se documentan cifras oficiales.
- Opciones de despliegue: `transformers` (carga con `AutoModelForSequenceClassification` y `AutoTokenizer`, usando `subfolder="petaiv4"`); compatible con endpoints (tag `endpoints_compatible`). No se documentan otros runners como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Etiquetas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `natsim/cat-dialogue-RoBERTa` | Clasificador RoBERTa base | 6 categorías de diálogo de mascotas | no disponible | Apache-2.0 | Hugging Face |
| `SamLowe/roberta-base-go_emotions` | Clasificador RoBERTa base | 28 emociones GoEmotions | no disponible en esta ficha | MIT | Hugging Face |
| `natsim/cat-dialogue-RoBERTa-2` | Clasificador RoBERTa (export posterior) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte de que es un export temprano; el prototipo final usa `cat-dialogue-RoBERTa-2`.
- No hay benchmark held-out verificado; el notebook enlazado no es un manifiesto exacto de estos pesos.
- Las frases sintéticas pueden favorecer atajos léxicos; los resultados deben probarse con diálogo escrito de forma independiente.
- Las puntuaciones softmax son salidas del modelo, no probabilidades calibradas de corrección.
- No es una herramienta validada de evaluación de comportamiento animal ni de salud mental.
- Las clases describen texto de diálogo, no emociones reales de animales.
- Solo inglés declarado; sin capacidades multilingües documentadas.
- Licencia Apache-2.0 en el repositorio, pero el modelo base original mantiene licencia MIT, relevante para sus materiales originales.
- Sin soporte documentado de generación, tool calling, agentes, visión ni audio.
- El tamaño del repo (4.5 GB) y la necesidad de usar el subfolder `petaiv4` complican la carga si no se sigue el ejemplo del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/natsim/cat-dialogue-RoBERTa
- Modelo base: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Checkpoint posterior: https://huggingface.co/natsim/cat-dialogue-RoBERTa-2
- Dataset sintético de emociones: https://huggingface.co/datasets/natsim/if-cats-could-speak
- Notebook de entrenamiento de RoBERTa: https://colab.research.google.com/drive/1yk_0VGDDFQGPmq1ilUdo6iXavwiKDurQ?usp=sharing
- Caso de estudio PettiChat: https://github.com/Neonat/Neonat/blob/main/docs/case-studies/pettichat-dialogue-evaluation.md
- Perfil del autor: https://huggingface.co/natsim
