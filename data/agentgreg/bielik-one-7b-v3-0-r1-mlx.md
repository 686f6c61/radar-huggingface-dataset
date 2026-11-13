# agentGreg/Bielik-One-7B-v3.0-r1-MLX

## Resumen

Bielik-One-7B-v3.0-r1-MLX es una conversión al formato MLX del modelo speakleash/Bielik-One-7B-v3.0-r1, publicada por el usuario agentGreg. No se trata de un modelo conversacional al uso, sino de un "decision model": recibe una situación descrita en lenguaje natural y devuelve una decisión estructurada con probabilidades calibradas sobre un conjunto de opciones. La model card lo describe explícitamente como "decisions only, no chat".

El modelo base es un transformer de 7.482.011.648 parámetros (aproximadamente 7,5 mil millones), desarrollado por SpeakLeash, el consorcio polaco conocido por sus datasets abiertos en polaco. La conversión mantiene los pesos en bfloat16 y utiliza la librería MLX de Apple, lo que permite ejecutar el modelo en Apple Silicon en lugar de requerir GPUs NVIDIA.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un caso poco habitual de modelo orientado a decisiones estructuradas con calibración explícita; por otro, la model card incluye una comparación de paridad numérica entre la inferencia en MLX (Apple M5 Max) y en vLLM (NVIDIA A100), con datos concretos sobre divergencia de probabilidades y tasa de acuerdo. El repositorio ocupa 15,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, según el tag `llama` del repo); detalles internos no disponibles |
| Parametros totales | 7.482.011.648 (~7,5 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en bfloat16; no se documentan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | La model card evalua polaco (pl), ingles (en), aleman (de) y noruego bokmal (nb); no se declara una lista oficial de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (`mlx`, `safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags del repositorio indican la familia `llama`, lo que sugiere un transformer decoder-only con atención estándar, pero no se especifican número de capas, dimensiones ocultas, tipo de atención ni tamaño de vocabulario. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El autor de la conversión no aporta estos datos y remite a la model card original de speakleash/Bielik-One-7B-v3.0-r1.

La innovación técnica documentada no está en el entrenamiento sino en el proceso de conversión y validación. La conversión a MLX se valida contra la inferencia de referencia en vLLM 0.32.0 con pesos bf16 sobre una A100, usando probabilidades crudas a temperatura 1 sobre el split de test oculto del benchmark Tacit. Se reporta un acuerdo del 99,69% sobre 2902 ítems en el split público de desarrollo (99,85% en polaco, 99,73% en inglés, 99,87% en alemán, 99,33% en noruego). La diferencia media de probabilidad por opción es de 0,0029 a 0,0037 según idioma, con máximos de 0,029 a 0,044. La calibración se ajusta por separado para cada motor sobre el split público de desarrollo.

## Capacidades

- Toma de decisiones estructuradas: dado un contexto y un conjunto de opciones, devuelve una decisión con distribución de probabilidad sobre las alternativas.
- Salida calibrada: las probabilidades están calibradas de forma explícita, lo que permite umbrales de confianza y automatización selectiva.
- Multilingüe en la práctica: evaluado en polaco, inglés, alemán y noruego bokmal, con rendimiento homogéneo (precisión del 84,8% al 88,4% según idioma en el split de test).
- Servicio mediante API compatible: el script `systemone_mlx.py` del repositorio expone el endpoint `/v1/systemone` con el frontend oficial de bielik-one sobre backend MLX.
- No soporta chat conversacional: la model card lo declara explícitamente ("Decisions only, no chat").
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Clasificación con umbral de confianza en producción: el modelo devuelve probabilidades calibradas por opción, de modo que un pipeline puede automatizar las decisiones con confianza alta y derivar a revisión humana las que caigan por debajo de un umbral. La calibración reportada (68,2% de automatización al 5% de error en el conjunto completo de Tacit) permite dimensionar ese umbral con datos.
- Enrutamiento de tickets o solicitudes: dado un texto de entrada y un conjunto cerrado de categorías o colas, el modelo asigna la más probable. Es adecuado porque la salida es una distribución sobre opciones, no texto libre.
- Moderación y etiquetado con criterios múltiples: para decisiones tipo sí/no o entre varias políticas, la probabilidad por opción permite auditar el margen de cada caso y priorizar los ambiguos.
- Evaluación de modelos y benchmarks: la conversión sirve como referencia para comparar la paridad numérica entre MLX y vLLM; útil para equipos que validan portabilidad de pesos entre motores de inferencia.
- Despliegue local en Apple Silicon: al estar en MLX, permite ejecutar un modelo de 7,5 B en bfloat16 en un Mac con chip M-series sin GPU NVIDIA, útil para prototipos y entornos de desarrollo sin infraestructura CUDA.
- Investigación sobre calibración: el repositorio incluye el procedimiento de ajuste de calibración por motor y los datos de acuerdo entre implementaciones, lo que facilita reproducir experimentos de calibración en otros modelos.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al benchmark Tacit, comparando la conversión MLX (Apple M5 Max) con los pesos originales en vLLM 0.32.0 + bielik-one 1.0.8 (bf16, NVIDIA A100). Se muestran precisión y tasa de automatización al 5% de error, además del acuerdo entre motores.

| Idioma | Items | Mismo resultado | Dif. media / max de probabilidad por opción | Precisión vLLM / MLX | Automatizado al 5% error, vLLM / MLX |
|---|---|---|---|---|---|
| pl | 652 | 99,85% | 0,0029 / 0,042 | 87,3% / 87,1% | 69,8% / 69,5% |
| en | 750 | 99,73% | 0,0035 / 0,029 | 88,7% / 88,4% | 67,2% / 67,2% |
| de | 750 | 99,87% | 0,0037 / 0,040 | 87,6% / 87,7% | 67,2% / 67,1% |
| nb | 750 | 99,33% | 0,0035 / 0,044 | 84,9% / 84,8% | 68,7% / 69,1% |
| all | 2902 | 99,69% | — | 87,1% / 87,0% | 68,2% / 68,2% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 y 7,48 B de parámetros, el modelo requiere aproximadamente 15 GB solo para los pesos, más overhead de activaciones y caché KV; el repositorio ocupa 15,0 GB, coherente con esa cifra.
- GPU recomendadas: la referencia de paridad usa una NVIDIA A100 con vLLM. Para MLX se ejecuta en Apple Silicon; la prueba reportada se hizo en un Apple M5 Max.
- ¿Cabe en GPU de consumo? No hay datos publicados sobre cuantizaciones de 4 u 8 bits para esta conversión, por lo que no se puede confirmar que quepa en GPUs de consumo con menos de 16 GB de VRAM. En bfloat16, una GPU de consumo necesitaría al menos 16 GB y probablemente más margen para activaciones.
- Opciones de despliegue: MLX (librería `mlx` y `mlx-lm`) mediante el script `systemone_mlx.py`, que sirve el endpoint `/v1/systemone` en `http://127.0.0.1:8026` con FastAPI y Uvicorn. Para los pesos originales, vLLM 0.32.0 con bielik-one 1.0.8. No se documentan soportes para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se reporta la comparación de precisión y acuerdo entre motores, no métricas de velocidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de propósito general ni de especificaciones de contexto que permitan una comparación rigurosa con alternativas de la misma categoría. La model card solo compara la conversión MLX con los pesos originales en vLLM, que no es un modelo distinto sino el mismo ejecutado en otro motor. Se indica a continuación lo que sí está documentado.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agentGreg/Bielik-One-7B-v3.0-r1-MLX | 7,48 B | No disponible | Apache 2.0 | Safetensors MLX (bf16) | Conversión MLX del modelo de SpeakLeash; enfocado a decisiones estructuradas |
| speakleash/Bielik-One-7B-v3.0-r1 | 7,48 B | No disponible | Apache 2.0 | Safetensors | Modelo base original; referencia de paridad en vLLM |
| Alternativas de 7 B de propósito general | No disponible | No disponible | No disponible | No disponible | No se han identificado comparaciones publicadas en la informacion disponible |

## Limitaciones y advertencias

- No es un modelo de chat: la model card indica explícitamente "Decisions only, no chat". Usarlo como asistente conversacional produciría resultados fuera de su diseño.
- Idiomas evaluados limitados: las pruebas cubren polaco, inglés, alemán y noruego bokmal. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Contexto desconocido: no se documenta la longitud máxima de contexto, lo que impide garantizar el comportamiento en entradas largas.
- Riesgo de alucinación: no evaluado en la informacion disponible. Al ser un modelo de decisión con salida restringida a opciones, el modo de fallo esperable es una asignación de probabilidad incorrecta más que texto inventado, pero no hay datos que lo cuantifiquen.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni equidad en la model card disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia y las condiciones del modelo base speakleash/Bielik-One-7B-v3.0-r1, ya que la conversión hereda sus pesos.
- Madurez del artefacto: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (12 de noviembre de 2026). No hay evidencia de uso en producción ni de mantenimiento posterior.
- Dependencia de MLX: el despliegue está atado a Apple Silicon y a la librería MLX; para otros entornos hay que usar los pesos originales con vLLM u otro motor compatible.
- Calibración dependiente del motor: la calibración debe ajustarse por separado para cada motor de inferencia, como indica la propia model card; reutilizar la calibración de vLLM en MLX introduciría desviaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentGreg/Bielik-One-7B-v3.0-r1-MLX
- Modelo base: https://huggingface.co/speakleash/Bielik-One-7B-v3.0-r1
- Repositorio bielik-one (GitHub, commit referenciado en la model card): https://github.com/speakleash/bielik-one/tree/475c896e8ebc964236648c1d1f5bb57268914dae
- Benchmark Tacit: https://tacitbench.ai
