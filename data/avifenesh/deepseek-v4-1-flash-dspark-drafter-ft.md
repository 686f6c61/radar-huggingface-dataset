# Avifenesh/DeepSeek-V4.1-Flash-DSpark-drafter-ft

## Resumen

DeepSeek-V4.1-Flash-DSpark-drafter-ft es un ajuste fino de las tres capas MTP (`mtp.0` a `mtp.2`) que acompañan a DeepSeek-V4.1-Flash-1017 y que alimentan su decodificación especulativa DSpark. Lo publica el usuario Avifenesh y no es un modelo generativo completo: es un componente auxiliar (un *drafter*) que propone tokens candidatos para que el modelo objetivo los verifique. Los expertos enrutados y los embeddings permanecen congelados e idénticos a los de la versión oficial; solo se entrenan los 72 tensores densos del drafter.

El modelo base sobre el que se apoya es DeepSeek-V4.1-Flash-1017, una arquitectura Mixture-of-Experts con decodificación especulativa basada en predicción multi-token (MTP). Este ajuste busca aumentar el número de tokens de borrador aceptados por paso, lo que se traduce directamente en mayor throughput de decodificación sin tocar los pesos del modelo servido. La ganancia medida es modesta: en torno al 3,3 % de tokens aceptados por paso en ventanas retenidas y hasta un 6 % en pruebas A/B en vivo en modo no-thinking, prácticamente plana en modo thinking a temperatura 1.

Es relevante ahora porque la decodificación especulativa se ha convertido en la vía estándar para reducir la latencia en despliegues de modelos grandes, y los drafters afinados al estilo de salida del servidor concreto pueden exprimir unos puntos porcentuales adicionales. El repo ocupa 9,5 GB e incluye los pesos en BF16/F32, una versión EXL3 a 5 bits y una versión FP8 E4M3 lista para sustituir el checkpoint oficial. La licencia es MIT, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capas MTP (predicción multi-token) sobre transformer MoE; drafter de decodificación especulativa DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible (los expertos enrutados están congelados y no se entrenan) |
| Longitud de contexto | no disponible (longitud de secuencia de entrenamiento: 640) |
| Tipos de cuantizacion | BF16/F32 (pesos entrenados), EXL3 a 5 bits (`main_proj` a 6), FP8 E4M3 con bloques 32x32 y escalas UE8M0 potencia de dos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`mtp-trained.safetensors`, `exl3/mtp_exl3_k5.safetensors`, `fp8/mtp-ft.safetensors`) |

## Arquitectura y entrenamiento

El drafter reutiliza las tres capas MTP del release (`mtp.0` a `mtp.2`) y conserva intactos los expertos enrutados y los embeddings. Se entrenan 72 tensores: atención, gate del router y sesgos, expertos compartidos, `main_proj`, normas, parámetros de hiperconexión, cabeza de Markov y cabeza de confianza. La cabeza de Markov tiene rango 256 y la cabeza de confianza se entrena de forma conjunta. La pérdida combina 0,1 de entropía cruzada con 0,9 de L1, con un decaimiento posicional de gamma 4.

Los datos de entrenamiento son sesiones de agente (en modo thinking y no-thinking) y prompts de Open-PerfectBlend regenerados por el propio modelo servido. Las características objetivo (capas 37 a 39 y entrada del LM-head) se capturan del modelo EXL3 servido, con los secretos eliminados antes del entrenamiento; el dataset no se publica. El entrenamiento consistió en una pasada de 1.140 pasos, learning rate 6e-5, micro batch 1 con 16 pasos de acumulación, longitud de secuencia 640, 256 anclas y tamaño de bloque 5, ejecutado en dos RTX PRO 6000. El autor advierte de un problema: si el servidor usa replay acotado por ventana deslizante, las características capturadas de la parte inicial de cada prompt pueden llegar como ceros, por lo que conviene comprobar filas totalmente nulas antes de entrenar.

## Capacidades

- Generación de tokens de borrador para decodificación especulativa DSpark sobre DeepSeek-V4.1-Flash-1017.
- Predicción multi-token (MTP) con hasta 5 tokens de borrador por paso.
- Cabeza de confianza entrenada de forma conjunta para estimar la calidad del borrador.
- Cabeza de Markov de rango 256 integrada en el drafter.
- Funcionamiento en modo thinking y no-thinking del modelo servido.
- Compatibilidad con decodificación greedy y probabilística en vLLM (`draft_sample_method`).
- No es un modelo de chat ni de generación autónoma: no responde prompts por sí mismo.
- Capacidades multilingües, de código, visión o tool calling: no disponibles en esta ficha (heredadas del modelo base, no documentadas aquí).

## Casos de uso

- Aceleración de inferencia en producción: sustituir el drafter del checkpoint oficial por `fp8/mtp-ft.safetensors` y el índice `fp8/model.safetensors.index.json` para obtener más tokens aceptados por paso sin cambiar el modelo objetivo.
- Despliegue en vLLM con DSpark: configurar `draft_sample_method` a `probabilistic` junto con este drafter para elevar el throughput en modo thinking (el autor reporta de 59,7 a 67,9 tok/s a 1 usuario y de 114,3 a 126,8 a 8 usuarios en el mismo servidor).
- Servicio de agentes conversacionales: en modo no-thinking a temperatura 0 el ajuste sube de 3,55 a 3,77 tokens aceptados por paso y de 77,3 a 79,0 tok/s a 1 usuario, lo que reduce la latencia percibida en turnos de agente.
- Evaluación de técnicas de decodificación especulativa: sirve como caso de estudio de ajuste de drafters sobre salidas del propio servidor, con métricas de aceptación y errores de cuantización publicadas.
- Investigación en cuantización: los ficheros `fp8/fp8-error.json` y `mtp_exl3_k5.safetensors.json` permiten analizar el error relativo por tensor (por debajo de 7e-4 en EXL3 y hasta 1,6 % en FP8).
- Despliegue en hardware de gama alta con paralelismo tensorial: el autor lo probó en dos DGX Spark (GB10) con EXL3 y vLLM, un escenario reproducible para equipos con ese hardware.
- Integración en pipelines de CI que validen regresiones de aceptación de borradores antes de promover un drafter a producción.

## Benchmarks y rendimiento

Ventanas retenidas (1.635, no usadas en entrenamiento), media de tokens aceptados por paso:

| Conjunto | Release | Este fine-tune |
|---|---|---|
| Todas | 4,404 | 4,548 (+3,3 %) |
| Thinking, T=1 | no disponible | +1,0 % |

A/B en vivo, 48 turnos de agente no vistos en entrenamiento, mismo servidor:

| Escenario | Release | Este fine-tune |
|---|---|---|
| No-thinking, T=0: aceptados por paso | 3,55 | 3,77 (+6 %) |
| No-thinking, T=0: tok/s a 1 / 8 usuarios | 77,3 / 140,0 | 79,0 / 148,5 |
| Thinking, T=1: aceptados por paso | 1,85 a 1,89 | 1,91 a 1,97 (+3 %) |
| Thinking, T=1: tok/s | no disponible | plano |

El autor señala que las cifras offline son superiores a las en vivo en esta configuración y que la ganancia del fichero FP8 no está medida (los resultados en vivo se obtuvieron con el fichero EXL3). El cambio de `draft_sample_method` a `probabilistic` en vLLM, independiente de los pesos, llevó el modo thinking de 59,7 a 67,9 tok/s a 1 usuario y de 114,3 a 126,8 a 8 usuarios.

## Requisitos de hardware

- El drafter no se ejecuta solo: requiere el checkpoint completo de DeepSeek-V4.1-Flash-1017, cuyo tamaño no está documentado en la información disponible.
- El repo del drafter ocupa 9,5 GB (incluye BF16/F32, EXL3 y FP8).
- Entrenamiento realizado en dos RTX PRO 6000, una ejecución por GPU.
- Inferencia probada en dos DGX Spark (GB10) con paralelismo tensorial, EXL3 y vLLM con DSpark.
- VRAM estimada para el modelo completo: no disponible.
- ¿Cabe en GPU de consumo? No disponible para el modelo completo; el drafter por sí solo no es suficiente.
- Opciones de despliegue: vLLM con DSpark (probado); llama.cpp, Ollama o TGI no documentados.
- Throughput medido: 79,0 tok/s a 1 usuario y 148,5 tok/s a 8 usuarios en modo no-thinking T=0 con EXL3 sobre dos DGX Spark.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-DSpark-drafter-ft | Drafter MTP afinado | no disponible | no disponible | MIT | HuggingFace |
| Drafter oficial de DeepSeek-V4.1-Flash-1017 | Drafter MTP | no disponible | no disponible | MIT (según base) | Incluido en el checkpoint oficial |
| Otros drafters especulativos de la familia DeepSeek | Drafter MTP | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de drafters alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el checkpoint de DeepSeek-V4.1-Flash-1017 no genera nada útil.
- La ganancia es pequeña y dependiente del escenario: +3,3 % en ventanas retenidas, +6 % en no-thinking T=0, plano en thinking T=1.
- La ganancia del fichero FP8 no está medida; el autor indica que la velocidad no se ha probado.
- El redondeo FP8 introduce hasta un 1,6 % de error relativo por tensor, comparable al cambio del propio fine-tune (1,7 % de distancia media al release).
- El dataset de entrenamiento no se publica, lo que limita la reproducibilidad.
- Riesgo de capturas con filas a cero si el servidor usa replay acotado por ventana deslizante; hay que validarlas antes de entrenar.
- Sesgos, alucinaciones y limitaciones idiomáticas: no documentados para el drafter; heredados del modelo base, no detallados aquí.
- Licencia MIT, sin restricciones conocidas para uso comercial; conviene verificar la licencia del modelo base en su repositorio oficial.
- El rendimiento depende de la versión de vLLM, del método de muestreo del borrador y de la configuración de paralelismo; los números del autor no son extrapolables sin réplica.

## Enlaces

- HuggingFace: https://huggingface.co/Avifenesh/DeepSeek-V4.1-Flash-DSpark-drafter-ft
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
