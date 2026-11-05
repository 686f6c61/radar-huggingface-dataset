# jumafernandez/trace-checkpoints

## Resumen

TRACE (contextual turn encoders) es un modelo de representaciones contextuales para diálogo orientado a tareas, desarrollado por J. M. Fernández en el marco de una investigación doctoral (Universidad Nacional de San Luis, con M. Errecalde y S. Burdisso). El modelo no procesa texto directamente: recibe una secuencia de embeddings de turno estáticos, generados por un encoder base congelado (`sergioburdisso/dialog2flow-joint-bert-base`), y aprende la regla de actualización que los convierte en representaciones contextualizadas. En otras palabras, los tokens de entrada de TRACE son turnos completos, no subtokens.

La relevancia del proyecto reside en su enfoque metodológico: todos los checkpoints provienen de la campaña REPRO, un protocolo preespecificado en el que los diálogos se particionan por clústeres de casi duplicados, las sondas se ajustan sobre un split de desarrollo reservado y las etiquetas de test nunca informan el entrenamiento ni la selección de hiperparámetros. Esto convierte al repositorio en un artefacto de reproducibilidad más que en un modelo listo para producción.

El checkpoint canónico (`trace-repro-lite-ar-s42/best`) tiene 44,9 M de parámetros (6 capas, 8 cabezas, dimensión 768) y opera en modo autorregresivo, atendiendo únicamente al diálogo transcurrido hasta el turno actual. El repositorio ocupa 15,7 GB e incluye múltiples variantes (lite/deep/gru, AR/bidi, tres semillas, ablaciones de encoder base y estudios de escala de datos). Para uso práctico en formato `transformers` el autor remite a `jumafernandez/trace-deep-ar`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer sobre secuencia de turnos (tokens = turnos); encoder base congelado tipo BERT |
| Parámetros totales | 44,9 M (checkpoint canónico lite: 6 capas, 8 cabezas, 768 dim); variantes deep de 12 capas y control recurrente GRU |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana en número de turnos, valor no especificado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato del código de entrenamiento; versión `transformers` en repo separado) |

## Arquitectura y entrenamiento

TRACE es un Transformer cuyo eje de secuencia son los turnos de un diálogo. Un encoder base congelado $f_1$ proyecta cada utterance a un vector estático $e_t$; TRACE ($f_2$) mapea la secuencia $(e_1, \dots, e_T)$ a representaciones contextuales $h_t$. El entrenamiento es autosupervisado y no requiere anotación funcional: las tareas principales de la escalera experimental son la predicción del acto de diálogo actual y del siguiente. Existe una variante bidireccional (que ve toda la ventana) y una autorregresiva (solo el pasado), siendo esta última la desplegable en práctica.

El protocolo REPRO particiona los diálogos por clústeres de casi duplicados y reserva un split de desarrollo para ajustar sondas, garantizando que las etiquetas de test no contaminen ninguna decisión. Se incluyen controles ablativos: un control recurrente GRU (para aislar atención de recurrencia), ablaciones de encoder base (mpnet, todbert) y estudios de escala de datos con un currículo de aproximadamente 28 M de turnos (`-xlc`, `-xlc-scratch`), además de la combinación de escala de modelo y datos (`deep-ar-xlc`). Los checkpoints se entrenaron con tres semillas (42, 7, 123). No se publican controles sin entrenar, aunque son reproducibles desde las configuraciones con semillas 0–4.

## Capacidades

- Generación de representaciones contextuales de turno para diálogo orientado a tareas.
- Predicción del acto de diálogo actual y del siguiente (tareas de la escalera experimental).
- Codificación de diálogos completos en orden, devolviendo matrices de forma (n_turnos, 768).
- Modo autorregresivo apto para despliegue en línea (solo atiende al pasado).
- Modo bidireccional para análisis de representación frente a anticipación (no desplegable en streaming).
- Control recurrente GRU como ablación arquitectónica.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Investigación en representaciones de diálogo: usar los checkpoints como línea base reproducible para estudiar cómo se contextualiza la información a lo largo de un diálogo, gracias a la partición REPRO y a las tres semillas publicadas.
- Predicción de actos de diálogo en sistemas task-oriented: el modelo AR puede clasificar el acto del turno actual o anticipar el siguiente a partir de los embeddings de turno, integrándose en un pipeline de comprensión del diálogo.
- Análisis de anticipación frente a representación: comparar checkpoints AR y bidi permite medir cuánta información del futuro aporta la ventana completa y cuánta es accesible solo con el pasado.
- Estudio de ablaciones de encoder base: los checkpoints `mpnet` y `todbert` permiten evaluar la sensibilidad de la regla de actualización al encoder congelado subyacente.
- Estudio de escala de datos: los checkpoints `-xlc` y `-xlc-scratch` (currículo de ~28 M de turnos) sirven para analizar el efecto del volumen de datos en las representaciones contextuales.
- Reproducibilidad de resultados: el monorepo incluye la partición, los scripts de entrenamiento y evaluación, las semillas y los comandos que regeneran cada tabla del paper, lo que permite replicar experimentos de forma controlada.
- Extracción de features para modelos downstream: las representaciones $h_t$ pueden alimentar clasificadores de intención, slot filling o segmentación de diálogo en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la escalera experimental (predicción de acto actual y siguiente, ablaciones de base, estudios de escala) pero no incluye cifras numéricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint canónico lite (44,9 M de parámetros) ocupa aproximadamente 180 MB en fp32 y unos 90 MB en fp16, sin contar el encoder base congelado ni los embeddings de turno precalculados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para el checkpoint lite; las variantes deep (12 capas) siguen siendo ligeras en comparación con LLM. No se especifican requisitos oficiales.
- Cabe en GPU consumer: sí, con amplio margen (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: el autor proporciona el paquete `contextual_turn_embeddings` (clase `ContextualTurnModelV2` y función `encode_dialogues`) y una versión en formato `transformers` en `jumafernandez/trace-deep-ar` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRACE (este modelo) | 44,9 M (lite) | ventana en turnos, valor no disponible | Representaciones contextuales de turno en diálogo | MIT | HuggingFace (checkpoints en formato de entrenamiento; versión transformers separada) |
| dialog2flow-joint-bert-base | no disponible en esta ficha | no disponible | Encoder base congelado de turno | no disponible | HuggingFace (`sergioburdisso/dialog2flow-joint-bert-base`) |
| TOD-BERT | no disponible en esta ficha | no disponible | Modelo de lenguaje para diálogo orientado a tareas | no disponible | HuggingFace (referenciado como ablación `todbert`) |
| MPNet | no disponible en esta ficha | no disponible | Sentence embeddings | no disponible | HuggingFace (referenciado como ablación `mpnet`) |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre diálogos en inglés, hereda los sesgos del corpus de diálogo subyacente.
- Riesgo de alucinación: el modelo no genera texto libre, por lo que el riesgo de alucinación se traslada a las tareas downstream que consuman sus representaciones.
- Limitaciones de idioma: solo inglés.
- Limitaciones de contexto: la ventana se mide en número de turnos y su valor no está especificado; los checkpoints bidireccionales no son aptos para despliegue en streaming.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo está pensado como artefacto de investigación; el autor no ofrece garantías de rendimiento en producción.
- Caveat importante: los checkpoints están en el formato del código de entrenamiento, no en formato `transformers`; para uso con `AutoModel` hay que recurrir al repo `jumafernandez/trace-deep-ar` con `trust_remote_code=True`.
- El modelo no procesa texto directamente: requiere embeddings de turno precalculados (publicados como datasets `jumafernandez/d2f-turn-embeddings-*`).
- El repositorio de 15,7 GB contiene múltiples variantes; es necesario seleccionar el checkpoint adecuado (el canónico es `trace-repro-lite-ar-s42/best`).
- Sin descargas ni likes en el momento de la consulta; sin pipeline declarado en HuggingFace.

## Enlaces

- HuggingFace (checkpoints): https://huggingface.co/jumafernandez/trace-checkpoints
- HuggingFace (versión transformers): https://huggingface.co/jumafernandez/trace-deep-ar
- Encoder base congelado: https://huggingface.co/sergioburdisso/dialog2flow-joint-bert-base
- Monorepo del proyecto (paquete `contextual-turn-embeddings`, scripts y partición): https://github.com/jumafernandez/doctorado-unsl
- Datasets de embeddings de turno: `jumafernandez/d2f-turn-embeddings-*` (en HuggingFace)
- Paper: Fernández, J. M., Errecalde, M., & Burdisso, S. *TRACE: Learning the Update for Contextual Turn Representations in Task-Oriented Dialogue.* En preparación (sin URL disponible).
