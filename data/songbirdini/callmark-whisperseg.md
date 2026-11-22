# songbirdini/callmark-whisperseg

## Resumen

CallMark-WhisperSeg es un conjunto de pesos fine-tuneados del modelo WhisperSeg (a su vez derivado de Whisper large) para la deteccion de vocalizaciones animales en grabaciones bioacusticas. Lo publica el usuario songbirdini como material de reproducibilidad del articulo CallMark, cuyo codigo y pipeline de evaluacion estan en el repositorio `marisbasha/callmark_reproducibility`. El modelo parte de `nccratliri/whisperseg-large-ms` y se ha ajustado con tres volumenes distintos de datos de entrenamiento por taxon: 50, 100 y 500 vocalizaciones.

La relevancia es metodologica: no se trata de un modelo generalista sino de un artefacto de experimentacion que permite reproducir los resultados del paper y analizar como escala el rendimiento de un detector bioacustico segun la cantidad de datos anotados por especie. Cada tamano se distribuye en dos variantes: con y sin preentrenamiento en grabaciones sinteticas, y en dos formatos (checkpoint de Transformers y CTranslate2 para inferencia).

El repositorio ocupa 54,1 GB, lo que refleja la acumulacion de multiples checkpoints (3 tamanos x 2 regimenes de preentrenamiento x 2 formatos) sobre una base de tipo Whisper large. La model card es minima y no documenta licencia, idiomas, benchmarks ni detalles de arquitectura mas alla de la ascendencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (heredada de `nccratliri/whisperseg-large-ms`) |
| Parametros totales | no disponible (la base es Whisper large; el numero exacto no se documenta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints Transformers y CTranslate2 (este ultimo permite cuantizacion int8 en despliegue) |
| Idiomas soportados | no disponible (tarea bioacustica, no ASR de voz humana) |
| Licencia | no disponible; la model card remite a los terminos de `nccratliri/whisperseg-large-ms` |
| Formato de pesos | safetensors (checkpoint Transformers) y CTranslate2 (`final_checkpoint_ct2`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de WhisperSeg, un Whisper large adaptado a la segmentacion y deteccion de vocalizaciones animales. Sobre esa base, CallMark aplica un fine-tuning supervisado con tres regimenes de datos: 50, 100 y 500 vocalizaciones de entrenamiento por taxon. Ademas, cada regimen existe en dos variantes: una con preentrenamiento previo en grabaciones sinteticas (carpeta `whisperseg/`, con el modelo preentrenado en `whisperseg/pretraining/`) y otra sin ese preentrenamiento (`whisperseg_no_pretraining/`).

El objetivo del experimento es medir la curva de aprendizaje de un detector bioacustico en funcion del numero de anotaciones por especie, y evaluar si el preentrenamiento sintetico aporta ventaja en regimenes de pocos datos. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo RLHF/DPO (poco probable en una tarea de deteccion). La innovacion tecnica destacable es el propio diseno experimental de reproducibilidad y la distribucion en CTranslate2 para inferencia eficiente.

## Capacidades

- Deteccion y segmentacion de vocalizaciones animales en audio bioacustico.
- Fine-tuning especifico por taxon con volumenes de datos controlados (50, 100 y 500 vocalizaciones).
- Variante con preentrenamiento en grabaciones sinteticas para regimenes de pocos datos.
- Inferencia via Transformers y via CTranslate2 (optimizada para produccion).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni razonamiento multi-paso.
- No se documenta soporte multilingue en el sentido de ASR de voz humana.

## Casos de uso

- Reproduccion de resultados del paper CallMark: cargar los checkpoints con `download_models.py whisperseg` y ejecutar los scripts de prediccion del repositorio para verificar las cifras publicadas.
- Estudio de curvas de aprendizaje en bioacustica: comparar los checkpoints de 50, 100 y 500 vocalizaciones por taxon para estimar cuanto dato anotado necesita un detector antes de saturar.
- Evaluacion del preentrenamiento sintetico: contrastar `whisperseg/` frente a `whisperseg_no_pretraining/` en el mismo taxon y conjunto de test para medir la ganancia del preentrenamiento con datos sinteticos.
- Despliegue de bajo coste con CTranslate2: usar `final_checkpoint_ct2` para servir deteccion en CPU o GPU modesta con cuantizacion int8 en pipelines de monitorizacion acustica.
- Monitorizacion de biodiversidad en campo: integrar el detector en estaciones de grabacion pasiva para filtrar automaticamente segmentos con vocalizaciones y reducir el volumen de audio a revisar por expertos.
- Punto de partida para fine-tuning en nuevas especies: reutilizar los pesos como inicializacion cuando se dispone de pocas anotaciones de un taxon no cubierto.
- Validacion metodologica en publicaciones: usar los checkpoints como baseline reproducible al comparar nuevos detectores bioacusticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al derivar de Whisper large, la inferencia en fp16 requiere del orden de 10-12 GB de VRAM, y en CTranslate2 int8 puede reducirse notablemente (estimacion orientativa, no confirmada en la model card).
- GPU recomendadas: no documentadas; por tamano de la base, A100, H100 o RTX 4090 son adecuadas para fp16, y GPUs consumer de 12-16 GB para cuantizacion.
- Cabe en GPU consumer: probablemente si, con CTranslate2 o cuantizacion; no confirmado.
- Opciones de despliegue: Transformers (checkpoint `final_checkpoint`) y CTranslate2 (`final_checkpoint_ct2`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| CallMark-WhisperSeg (este) | WhisperSeg large | Deteccion bioacustica, 3 regimenes de datos | no disponible (remite a la base) | Hugging Face, repo de 54,1 GB |
| `nccratliri/whisperseg-large-ms` | Whisper large | Segmentacion bioacustica general | no disponible en esta ficha | Hugging Face |
| Whisper large (OpenAI) | Transformer encoder-decoder | ASR de voz humana | MIT (version original) | Hugging Face, ampliamente desplegado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Model card minima: sin licencia explicita, sin idiomas, sin benchmarks ni detalles de entrenamiento.
- La licencia queda sujeta a los terminos de `nccratliri/whisperseg-large-ms`; verificar antes de cualquier uso comercial.
- Es un artefacto de reproducibilidad, no un modelo listo para produccion generalista.
- Entrenado con volumenes muy reducidos por taxon (50-500 vocalizaciones), lo que limita la generalizacion a especies y condiciones acusticas no vistas.
- Riesgo de falsos positivos y negativos en grabaciones con ruido, solapamiento de especies o dominios acusticos distintos al de entrenamiento.
- No apto para ASR de voz humana ni tareas de texto, codigo o razonamiento.
- El repositorio de 54,1 GB incluye multiples checkpoints; conviene descargar solo la variante necesaria.
- Sin informacion sobre sesgos especificos ni sobre el desbalance de taxones en el dataset.

## Enlaces

- Hugging Face: https://huggingface.co/songbirdini/callmark-whisperseg
- Repositorio de reproducibilidad: https://github.com/marisbasha/callmark_reproducibility
- Modelo base: https://huggingface.co/nccratliri/whisperseg-large-ms
- Paper CallMark: no disponible en la informacion proporcionada.
