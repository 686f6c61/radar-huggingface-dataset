# Eugeoter/waifu-scorer-moas

## Resumen

waifu-scorer-moas (código interno `ws_moas`) es un modelo de puntuación estética de imágenes orientado a ilustraciones de estilo anime, desarrollado por el usuario Eugeoter como derivado del proyecto waifu-scorer. No es un modelo generativo ni un LLM: es un cabezal de regresión ordinal que, a partir de características extraídas por un backbone CLIP ViT-L/14 congelado, produce una puntuación de preferencia estética en el rango 0–1. El modelo se publica en HuggingFace con licencia no especificada y sin descargas ni interacciones registradas en el momento de la consulta.

La arquitectura combina la extracción de características de CLIP sobre la imagen completa y cuatro vistas locales, que se concatenan y se pasan por un MLP pequeño con una cabeza de siete niveles ordinales. El checkpoint publicado corresponde al epoch 135 de entrenamiento, seleccionado por un MAE macro de validación de 0,1086 sobre 7.650 muestras. Los pesos safetensors ocupan apenas 2.033.937 parámetros, lo que lo convierte en un componente ligero que puede ejecutarse en CPU o en GPUs de consumo.

Su relevancia es acotada pero concreta: cubre la necesidad de filtrado y ranking automático de imágenes anime en pipelines de curación de datasets, moderación de contenido generado o sistemas de recomendación visual, un nicho donde los scorers estéticos generalistas (como los basados en NIMA o LAION aesthetic) rinden peor por sesgo de dominio. La model card advierte explícitamente de que los resultados de validación no constituyen una validación independiente del juicio humano y de que el conjunto de test no se ha evaluado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone CLIP ViT-L/14 congelado + MLP sobre características concatenadas (imagen completa + 4 vistas locales) + cabeza de regresión ordinal de 7 niveles |
| Parámetros totales | 2.033.937 (solo el cabezal; el backbone CLIP ViT-L/14 se descarga aparte, ~933 MB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | zh, en (según etiquetas del repositorio; el modelo no procesa texto) |
| Licencia | no disponible (la del backbone CLIP es MIT; la del cabezal no está especificada) |
| Formato de pesos | safetensors (no incluye optimizador, imágenes de entrenamiento ni rutas locales) |

## Arquitectura y entrenamiento

El modelo no entrena el backbone: utiliza CLIP ViT-L/14 de OpenAI como extractor congelado y verifica su SHA-256 contra el original del entrenamiento. Para cada imagen se calculan características normalizadas de la imagen completa y de cuatro recortes o vistas locales; esos cinco vectores se concatenan y alimentan un MLP pequeño que termina en una cabeza de siete niveles ordinales. La salida se mapea a los valores `[0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]` y se aplica por defecto una calibración monótona ajustada sobre una partición de validación independiente, de modo que la puntuación final queda en el rango 0–1.

El checkpoint publicado es el del epoch 135 (contado desde 0), elegido por MAE macro de validación de 0,10864890 sobre 7.650 muestras. En esa misma partición, el MAE en bruto (sin calibración) es 0,09948094 y el SRCC (coeficiente de correlación de rangos de Spearman) es 0,71147025. No se documentan en la información disponible el volumen total de tokens o imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; tratándose de un modelo de regresión supervisada, lo esperable es entrenamiento con etiquetas ordinales, pero ese detalle no se confirma. La innovación técnica destacable es el uso de múltiples vistas locales además de la imagen completa, que aporta información compositiva y de detalle que un único embedding global no captura.

## Capacidades

- Puntuación estética de imágenes de estilo anime en el rango 0–1, con calibración monótona por defecto.
- Extracción de características multi-vista: imagen completa más cuatro vistas locales, concatenadas antes del MLP.
- Regresión ordinal de siete niveles, adecuada para ranking y filtrado por umbral.
- Salida de una única puntuación global de preferencia estética; el modelo no emite puntuaciones por atributo (la model card indica que la cabeza de atributos no tiene anotaciones independientes y no se expone en la demo).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No procesa texto ni audio; las etiquetas de idioma zh/en del repositorio no implican capacidades lingüísticas del modelo.
- No dispone de modo thinking ni de salidas estructuradas más allá del escalar de puntuación.

## Casos de uso

- Curación de datasets de ilustración anime: puntuar lotes de imágenes y descartar las que caigan por debajo de un umbral, reduciendo el ruido estético antes de entrenar modelos generativos o de etiquetado.
- Ranking en galerías y buscadores visuales: ordenar resultados por preferencia estética estimada usando el SRCC de 0,711 como referencia de calidad de ordenación en el dominio de validación.
- Filtrado de salidas de modelos de difusión: evaluar automáticamente imágenes generadas y seleccionar la mejor de N muestras por prompt, un uso típico de los scorers estéticos en pipelines de generación.
- Moderación y control de calidad en plataformas de contenido: detectar imágenes de baja calidad o mal compuestas antes de publicación, con la cautela de que la puntuación refleja preferencias del dataset de entrenamiento y no criterios de política.
- Recomendación personalizada: combinar la puntuación con señales de usuario para reordenar feeds de arte, dado el bajo coste de inferencia del cabezal (2 millones de parámetros).
- Investigación sobre estética computacional: usar el modelo como baseline reproducible en estudios comparativos de scorers estéticos especializados en anime, con la salvedad de que el test set no está evaluado.
- Preetiquetado en anotación humana: priorizar qué imágenes revisar primero en flujos de anotación, aprovechando la calibración monótona para umbrales estables.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de validación del propio autor, no comparaciones con otros modelos:

| Métrica | Valor |
|---|---|
| MAE macro de validación (epoch 135) | 0,10864890 |
| MAE en bruto de validación | 0,09948094 |
| SRCC de validación | 0,71147025 |
| Muestras de validación | 7.650 |
| Resultados en test | no evaluados |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas estándar de estética como AVA o TID2013.

## Requisitos de hardware

- El cabezal pesa 2.033.937 parámetros (unos pocos MB en safetensors); el coste real está en el backbone CLIP ViT-L/14, de aproximadamente 933 MB de pesos.
- VRAM estimada para inferencia: en torno a 2–3 GB en FP16 contando backbone y activaciones para una imagen; en CPU es viable con latencias de décimas de segundo por imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Cabe en GPUs de consumo y en iGPU con suficiente memoria compartida.
- Despliegue: el repositorio incluye un `app.py` con demo Gradio local y un Space en HuggingFace; la integración es vía PyTorch y `huggingface_hub.snapshot_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del backbone CLIP ViT-L/14, el cuello de botella es la pasada del ViT, no el MLP.
- La primera ejecución descarga CLIP ViT-L/14 desde la URL oficial de OpenAI (~933 MB) y verifica su SHA-256; se puede evitar la descarga apuntando `WS_MOAS_CLIP_PATH` a una copia local idéntica.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (otros scorers estéticos de anime, NIMA, LAION aesthetic predictor o waifu-scorer original), por lo que la comparación numérica no está disponible. A nivel estructural:

| Modelo | Parámetros del cabezal | Backbone | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| waifu-scorer-moas | 2.033.937 | CLIP ViT-L/14 congelado | Imagen + 4 vistas locales | no disponible | HuggingFace, 0 descargas |
| waifu-scorer (original) | no disponible | no disponible | no disponible | no disponible | referenciado como proyecto base |
| NIMA | no disponible | no disponible | imagen completa | no disponible | público, uso académico extendido |
| LAION aesthetic predictor | no disponible | CLIP ViT-L/14 | imagen completa | no disponible | público |

## Limitaciones y advertencias

- Los resultados de validación (MAE macro 0,1086, SRCC 0,7115) no constituyen una validación independiente del juicio humano; el propio autor lo advierte.
- El conjunto de test no se ha evaluado, por lo que no hay estimación de generalización fuera de la partición de validación.
- La puntuación refleja la preferencia estética agregada de las etiquetas de entrenamiento, no una unidad absoluta de estética humana validada.
- Riesgo de sesgo de dominio: entrenado sobre ilustraciones anime, su comportamiento en fotografía, arte abstracto u otros estilos no está documentado y probablemente degrade.
- La calibración monótona se ajustó sobre una partición de validación concreta; su transferencia a otras distribuciones de imágenes no está verificada.
- La licencia del cabezal no está especificada, lo que impide confirmar si el uso comercial es permitted; el backbone CLIP es MIT, pero eso no cubre los pesos del scorer.
- El repositorio no incluye optimizador, imágenes de entrenamiento ni rutas locales, lo que limita la reproducibilidad del entrenamiento.
- Sin descargas ni likes registrados y con fecha de creación reciente, no hay evidencia de uso en producción ni validación por terceros.
- No apto para tareas de texto, código, razonamiento ni agentes; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eugeoter/waifu-scorer-moas
- Demo Gradio en HuggingFace Spaces: https://huggingface.co/spaces/Eugeoter/waifu-scorer-moas
- Repositorio oficial de CLIP (OpenAI): https://github.com/openai/CLIP
