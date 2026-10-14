# jonasaise/laya-swedish-preference-gate

## Resumen

Laya Swedish Preference Gate es un modelo de clasificación de preferencias por pares para texto en sueco, desarrollado por el usuario jonasaise. Dado un prompt en sueco y dos respuestas candidatas, devuelve en una sola pasada forward una probabilidad calibrada de que la primera sea mejor que la segunda. Está concebido como un filtro "System 1": resuelve las comparaciones con alta confianza en milisegundos y delega las inciertas a un juez LLM lento ("System 2").

Técnicamente es un modelo de decisión Laya: un encoder bidireccional ModernBERT (backbone `jhu-clsp/mmBERT-base`, 22 capas, dimensión oculta 768, vocabulario de 256.000 tokens) con una cabeza de decisión tipada, afinado desde `convaiinnovations/laya` (subcarpeta `multilingual`). Cuenta con 321.908.998 parámetros (~322M) y pesos en fp16, con un tamaño de repositorio de 0,7 GB.

Su relevancia es doble. Por un lado, demuestra una arquitectura de juez por pares muy eficiente, con ~10 ms por comparación en GPU. Por otro, su propia model card advierte de que lo que aprende es principalmente a distinguir sueco auténtico de "translationese": una línea base de bolsa de palabras alcanza la misma precisión del 98,4 % en el conjunto de validación, y en pares fluidos su rendimiento cae al 64,2 %, muy por debajo del 87,3 % de Kimi-k3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión Laya: encoder bidireccional ModernBERT + cabeza de decisión tipada (primitiva `choice` con dos opciones) |
| Parametros totales | 321.908.998 (~322M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 1024 tokens en total (prompt + dos respuestas); las entradas más largas se truncan |
| Tipos de cuantizacion | fp16 (pesos `model.safetensors`); no se documentan otras cuantizaciones |
| Idiomas soportados | Sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone `jhu-clsp/mmBERT-base`, un encoder ModernBERT de 22 capas, dimensión oculta 768 y vocabulario de 256.000 tokens, orientado a tareas multilingües. Sobre él se añade una cabeza de decisión tipada que implementa la primitiva `choice` con dos opciones. El punto de partida es `convaiinnovations/laya` (subcarpeta `multilingual`), del que se hereda el esquema de decisión. La entrada es un prompt más dos respuestas candidatas, y la salida es P(candidato A mejor) junto con la probabilidad opuesta.

El ajuste se realiza con el conjunto `jonasaise/dpo-swedish-interpreted`, que empareja una respuesta sueca idiomática y culturalmente localizada (chosen) con una traducción deliberadamente deficiente (rejected: frases literales, préstamos del inglés y contenido centrado en Estados Unidos). El repositorio incluye la etiqueta `dpo`, aunque la model card no documenta un pipeline explícito de DPO ni de RLHF. La calibración se realiza mediante temperature scaling con un valor ajustado de T = 1.967, almacenado en `temperature.json` y `rl_agent_config.json`.

## Capacidades

- Clasificación de preferencia por pares (pairwise preference) en sueco: asigna una probabilidad calibrada de que una respuesta sea mejor que otra.
- Salida calibrada: devuelve `p_chosen` en [0, 1] y el diccionario de probabilidades de ambas opciones, que suman 1.
- Umbral configurable mediante `margin` (por defecto 0,2): `is_valid_margin` indica si alguna de las dos opciones supera 0,70 de probabilidad.
- Puntuación por lotes (`predict_preference_batch`) para comparar varios pares simultáneamente.
- Promediado por orden (scoring en ambos órdenes) para eliminar el sesgo de posición residual: en el conjunto de validación elevó la precisión del 98,5 % al 98,7 %.
- Integración en rutinas de best-of-N reranking mediante permutaciones ordenadas de los candidatos.
- Detección de "translationese" frente a sueco natural, derivada del sesgo de su conjunto de entrenamiento.
- No genera texto: es exclusivamente un clasificador/juez de preferencias y no soporta tool calling, agentes ni multimodalidad.

## Casos de uso

- Filtro previo a un juez LLM: desplegar la gate como primera capa para resolver las comparaciones con alta confianza en ~10 ms y escalar solo los pares con margen insuficiente a un juez lento, reduciendo coste de inferencia.
- Best-of-N reranking en generación sueca: dado un mismo prompt y N respuestas generadas, ordenar los pares con `predict_preference_batch` para seleccionar la mejor antes de devolverla al usuario.
- Control de calidad en localización: detectar respuestas o traducciones con "translationese" (frases literales, préstamos del inglés) frente a alternativas idiomáticas en sueco.
- Filtrado de datos para entrenamiento: puntuar pares chosen/rejected de un dataset en sueco para construir o depurar conjuntos de preferencias antes de un ajuste DPO.
- Evaluación automática de asistentes conversacionales en sueco: comparar dos variantes de respuesta de un mismo sistema con una métrica rápida y calibrada, integrable en pipelines de evaluación continua.
- Monitorización en producción: ejecutar la gate sobre pares de respuestas de un modelo en despliegue para detectar regresiones de naturalidad en sueco con latencia baja (9,9 ms de mediana en GPU, batch 1).
- Investigación en calibración de jueces: usar su ECE de 0,006 tras calibración como referencia en estudios sobre fiabilidad de modelos de recompensa pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Precisión de validación (val_eval, held out) | 0,9839 (98,4 %) |
| ECE antes de calibración | 0,013 |
| ECE después de calibración (15 bins) | 0,006311145236834391 |
| Temperatura ajustada (T) | 1.967 |
| Latencia en GPU, batch 1 (mediana / p95) | 9,9 ms / 11,2 ms |
| Latencia en CPU (por par) | ~607 ms |
| Precisión de la gate en muestra de juez (promediada por orden) | 98,6 % |
| Precisión de Kimi-k3 en la misma muestra (promediada por orden) | 95,5 % |

Medidas adicionales aportadas por el autor que matizan los resultados anteriores:

| Metrica | Valor |
|---|---|
| Precisión en 299 pares fluidos (ambas respuestas naturales) | 64,2 % (IC 95 %: 58,9 %–69,6 %) |
| Precisión de Kimi-k3 en esos mismos pares fluidos | 87,3 % |
| ECE en pares fluidos | 0,230 |
| Precisión de una línea base de bolsa de palabras en validación | 98,4 % |
| Mejora por promediado de orden en validación | 98,5 % → 98,7 % |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 los pesos ocupan aproximadamente 0,64 GB (322M parámetros × 2 bytes); con activaciones y overhead, el modelo cabe sobradamente en 1-2 GB de VRAM.
- GPU probada por el autor: una GPU de 12 GB de VRAM fue la referencia para determinar que el tamaño de lote más rápido con hasta 1024 tokens por par es 8.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) gracias a su reducido tamaño.
- GPU profesionales: se puede ejecutar en A100 o H100, si bien están sobredimensionadas para un modelo de 322M de parámetros.
- Opciones de despliegue: se instala como paquete propio (`laya_gate`) con `laya`, `torch` y `transformers`; los pesos se descargan del repositorio en el primer uso. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~10 ms por par en GPU (mediana 9,9 ms, p95 11,2 ms) y ~607 ms por par en CPU. Se recomienda GPU CUDA.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Precisión en pares fluidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| laya-swedish-preference-gate | Encoder ModernBERT + cabeza de decisión | ~322M | Sueco | 64,2 % | Apache-2.0 | HuggingFace |
| Kimi-k3 (juez LLM lento) | LLM generativo usado como juez | no disponible | Multilingüe (no confirmado) | 87,3 % | no disponible | no disponible |
| Línea base de bolsa de palabras | Modelo estadístico simple | no disponible | Sueco | no disponible en pares fluidos | no disponible | reproducible |

En el conjunto de validación general la gate (98,4 %) y una línea base de bolsa de palabras (98,4 %) empatan, mientras que en pares fluidos la gate (64,2 %) queda muy por detrás de Kimi-k3 (87,3 %). El autor no publica comparativas con otros modelos de recompensa o preference models de tamaño similar.

## Limitaciones y advertencias

- Sesgo de translationese: el modelo aprende principalmente a distinguir sueco auténtico de traducciones literales, no calidad general. Una línea base de bolsa de palabras alcanza la misma precisión del 98,4 % en validación.
- Rendimiento limitado en pares fluidos: cuando ambas respuestas son sueco natural y solo difieren en calidad, acierta el 64,2 % de las veces (IC 95 %: 58,9 %–69,6 %), frente al 87,3 % de Kimi-k3.
- Calibración no fiable fuera de su dominio: en pares fluidos el ECE se dispara a 0,230, por lo que la confianza solo debe interpretarse como señal de naturalidad/translationese.
- Sesgo de posición residual: se recomienda promediar ambos órdenes, ya que la puntuación en un solo orden puede estar sesgada.
- Truncación: las entradas superiores a 1024 tokens en total (prompt más dos respuestas) se truncan, lo que puede degradar la calidad del juicio en contextos largos.
- Cobertura lingüística restringida al sueco (sv); no se ha validado su comportamiento en otros idiomas.
- Riesgo de alucinación no aplicable en sentido estricto, ya que no genera texto, pero sí de falsos positivos/negativos en la clasificación.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera del dominio de naturalidad.
- Advertencia del propio autor: tratar la confianza del modelo como significativa únicamente para naturalidad/translationese.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonasaise/laya-swedish-preference-gate
- Repositorio de código y pipeline: https://github.com/joenaess/laya-swedish-preference-gate
- Framework Laya: https://github.com/NandhaKishorM/laya
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/jonasaise/dpo-swedish-interpreted
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Backbone: https://huggingface.co/jhu-clsp/mmBERT-base
