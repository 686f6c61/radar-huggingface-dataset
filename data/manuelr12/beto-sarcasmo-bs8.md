# ManuelR12/beto-sarcasmo-bs8

## Resumen

beto-sarcasmo-bs8 es un modelo de clasificacion de texto en espanol afinado para detectar sarcasmo. Lo desarrolla ManuelR12 y parte de BETO, el modelo BERT base preentrenado especificamente para espanol por el equipo de dccuchile (Universidad de Chile). La tarea es binaria: clasificar una frase como `SARCASMO` o `NO_SARCASMO`. El modelo esta pensado para integrarse en pipelines de analisis de opinion, moderacion de contenido o investigacion linguistica sobre ironia en castellano.

Arquitectonicamente es un transformer encoder BERT base con vocabulario en espanol y casing preservado (wwm-cased), con 109.852.418 parametros totales. El contexto efectivo de trabajo esta limitado a 128 tokens por la configuracion de entrenamiento, lo que restringe su uso a frases cortas o titulares. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors.

El modelo es relevante como ejemplo de afinado especializado de bajo coste sobre un backbone espanol consolidado: entrena en 6 epocas con batch 8 y alcanza un F1 macro de 0,9124 en validacion. No obstante, su dataset de entrenamiento (12.145 frases, mayoritariamente titulares de prensa) limita su generalizacion a dominios conversacionales o jerga regional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (BETO, wwm-cased) |
| Parametros totales | 109.852.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; cuantizacion no documentada) |
| Idiomas soportados | espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base multilingue adaptado al espanol (BETO), con vocabulario propio, casing preservado y enmascaramiento de palabras completas (whole word masking). Sobre este backbone se anade una cabeza de clasificacion de secuencias para la tarea binaria de sarcasmo. No se documentan innovaciones arquitectonicas adicionales: es un afinado clasico supervisado.

El entrenamiento usa un dataset local no publicado en el Hub: 12.145 frases de entrenamiento y 3.037 de validacion, balanceadas 50/50 entre sarcasmo y no sarcasmo, compuestas mayoritariamente por titulares de prensa. Hiperparametros: batch size 8, learning rate 2e-05, maximo 10 epocas con early stopping (paciencia 2 sobre F1 de validacion), 6 epocas ejecutadas, mejor epoca la 4. Longitud maxima de 128 tokens con padding. No se menciona RLHF, DPO ni tecnicas de aumentacion de datos.

## Capacidades

- Clasificacion binaria de texto en espanol: `SARCASMO` / `NO_SARCASMO`.
- Analisis de frases cortas y titulares de prensa con contexto hasta 128 tokens.
- Integracion directa en `transformers` mediante `pipeline("text-classification")`.
- Uso como componente en pipelines de analisis de sentimiento o moderacion.
- No soporta tool calling, function calling ni agentes.
- No soporta generacion de texto, razonamiento multi-step, vision ni audio.
- Multilingue limitado: solo espanol.

## Casos de uso

- Analisis de opinion en redes sociales: clasificar respuestas y comentarios cortos para separar ironia de opinion literal antes de alimentar un analizador de sentimiento, evitando que el sarcasmo se interprete como sentimiento positivo.
- Moderacion de foros y comentarios: marcar mensajes potencialmente sarcasticos o ironicos para revision humana en comunidades donde la ironia se usa como agresion encubierta.
- Investigacion linguistica: anotar corpus de titulares o frases cortas para estudiar la distribucion de sarcasmo por medio, tema o periodo.
- Filtrado de datasets de entrenamiento: etiquetar automaticamente grandes volumenes de frases cortas para construir datasets de sentimiento con etiquetas de sarcasmo separadas.
- Analisis de prensa deportiva o politica: detectar titulares ironicos en un dominio donde abundan, dado que el entrenamiento se basa en titulares.
- Enriquecimiento de pipelines de customer feedback: etiquetar encuestas cortas o respuestas de formulario para distinguir quejas genuinas de comentarios ironicos.
- Componente previo en sistemas de resumen de reviews: filtrar frases sarcasticas antes de agregar polaridad, reduciendo falsos positivos en el analisis global.

## Benchmarks y rendimiento

Resultados reportados en validacion (mejor epoca, epoca 4):

| Metrica | Valor |
|---|---|
| F1 macro | 0,9124 |
| F1 ponderado | 0,9124 |
| Accuracy | 0,9124 |

Evolucion por epoca:

| Epoca | Perdida train | Perdida val | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 0,4366 | 0,4682 | 0,8413 | 0,8395 |
| 2 | 0,2637 | 0,3397 | 0,9065 | 0,9064 |
| 3 | 0,1228 | 0,5359 | 0,9025 | 0,9025 |
| 4 | 0,0575 | 0,5859 | 0,9124 | 0,9124 |
| 5 | 0,0344 | 0,8385 | 0,8976 | 0,8975 |
| 6 | 0,0264 | 0,6927 | 0,9029 | 0,9027 |

No se han publicado comparaciones con otros modelos de deteccion de sarcasmo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (109,8 M parametros); inferior a 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.); tambien funciona en CPU para batch pequenos.
- Cabe sobradamente en cualquier GPU consumer, incluida una GTX 1650 de 4 GB.
- Opciones de despliegue: `transformers` (pipeline), ONNX Runtime, TorchScript, servicios de inferencia tipo Hugging Face Inference Endpoints.
- Latencia y throughput: no documentados. Por el tamano del modelo y la longitud maxima de 128 tokens, se espera latencia de milisegundos por frase en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beto-sarcasmo-bs8 | 109,8 M | 128 tokens | Clasificacion sarcasmo (es) | Apache 2.0 | Hugging Face |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | 110 M | 512 tokens | Backbone preentrenado (es) | Apache 2.0 | Hugging Face |
| BETO afinado para sentimiento (varios autores) | ~110 M | 128-512 tokens | Sentimiento (es) | variable | Hugging Face |

No se dispone de comparaciones directas con modelos especificos de deteccion de sarcasmo en espanol en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado casi exclusivamente con titulares de prensa: puede apoyarse en el tema o en el medio de la noticia en lugar de en la ironia, lo que reduce su generalizacion a otros dominios.
- Puede fallar con sarcasmo conversacional, jerga regional y textos largos.
- Longitud maxima de 128 tokens: frases o parrafos largos se truncan y pierden contexto.
- Riesgo de sobreajuste: la perdida de validacion sube desde la epoca 2 mientras el F1 se mantiene, indicando sobreconfianza; los errores residuales pesan cada vez mas.
- Dataset de entrenamiento no publicado: no es posible auditar la composicion, los sesgos ni la procedencia de las etiquetas.
- Sesgos no documentados: no hay analisis de sesgos por tema, medio o registro.
- Riesgo de alucinacion: no aplica directamente (es clasificador, no generador), pero puede producir falsos positivos/negativos sistematicos.
- Licencia Apache 2.0: permite uso comercial, aunque el autor no ofrece garantias de rendimiento en produccion.
- Solo espanol; no se documentan variantes regionales ni rendimiento fuera del espanol peninsular.

## Enlaces

- Hugging Face: https://huggingface.co/ManuelR12/beto-sarcasmo-bs8
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Repositorio BETO (dccuchile): https://github.com/dccuchile/beto
- No se han encontrado papers, blogs, repos ni demos adicionales en la informacion disponible.
