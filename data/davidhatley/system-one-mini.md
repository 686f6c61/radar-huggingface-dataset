# DavidHatley/system-one-mini

## Resumen

System One Mini es un encoder DistilBERT de 69,3 millones de parámetros desarrollado por David Hatley como experimento de investigación independiente. No es un modelo generativo: incorpora cinco cabezas de clasificación independientes que emiten decisiones tipadas y fijas sobre un resumen de diagnóstico de software (si la tarea está completa, si conviene reintentar la acción fallida, el origen del fallo, la siguiente acción recomendada y si la evidencia es suficiente). El modelo nunca produce texto libre ni responde preguntas arbitrarias.

El interés del proyecto reside en su enfoque metodológico más que en su rendimiento bruto. La model card documenta explícitamente el problema de la calibración bajo cambio de redacción (*wording shift*): el primer modelo del proyecto alcanzaba un 100 % de acierto con la redacción de entrenamiento pero caía al 44,51 % con redacciones no vistas, manteniendo una confianza media del 97 %. Las iteraciones posteriores añadieron diversidad de redacción en los datos sintéticos y cabezas de mayor profundidad, hasta llegar a este modelo, que obtiene un 86,25 % de precisión macro en un conjunto de test final congelado tras la selección del modelo.

La arquitectura es un transformer encoder estándar (DistilBERT base uncased) con fine-tuning completo y cinco cabezas `Linear -> GELU -> Dropout -> Linear`. El contexto de entrada está limitado a 256 tokens y el único idioma soportado es el inglés. Está pensado para investigación sobre calibración y robustez, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT base uncased) con 5 cabezas de clasificación independientes |
| Parametros totales | 69.328.144 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`config.max_length`) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones; al tratarse de un encoder de 69 M, la cuantización es viable pero no se han publicado artefactos) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB), con código custom de Transformers (`trust_remote_code=True`) |
| Modelo base | `distilbert/distilbert-base-uncased`, revisión `12040accade4e8a0f71eabdb258fecc2e7e948be` |
| Pipeline | `feature-extraction` (etiquetado también como `multi-task-classification`) |
| Dataset de entrenamiento | `DavidHatley/system-one-mini-data` (sintético determinista, seed 1729) |
| Hardware de entrenamiento | 1x NVIDIA RTX 3060 |
| Descargas / likes | 42 / 0 |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT base uncased y aplica fine-tuning completo del encoder compartido, seguido de cinco cabezas independientes con la estructura `Linear -> GELU -> Dropout -> Linear` (run interno `deep_heads_v2`). El entrenamiento se realizó durante 3 épocas, con batch de 16, learning rate 3e-5, precisión BF16 y seed 1729, en una única RTX 3060. El checkpoint se seleccionó por la NLL media de validación, y las temperaturas por cabeza se ajustaron exclusivamente sobre el split de calibración.

Los datos son completamente sintéticos y deterministas, generados por el propio autor con la especificación `renderer-diversity-v2` y seed 1729: sin texto generado por modelos, sin profesor externo, sin APIs de pago y sin trazas reales de usuarios. El conjunto de entrenamiento consta de 20.000 estados repartidos en 12 familias de redacción (ticket, terminal, conversación, incidente, log JSON, informe XML, hilo de Slack, issue de GitHub, ticket de Jira, stack trace, mensaje de commit y revisión de PR), con 2.000 estados de validación, 2.000 de calibración, 2.000 de test de desarrollo (familia "sealed") y 2.000 de test final (`release-final-v1`, seed 314159, familia `case_review`, escrita después de la selección del modelo y excluyendo el manifiesto de fuentes de entrenamiento). La innovación técnica destacable no es arquitectónica sino metodológica: el diseño experimental mide explícitamente la degradación por cambio de redacción y la calibración de la confianza.

## Capacidades

- Clasificación multi-tarea con cinco decisiones tipadas y disjuntas sobre un resumen de diagnóstico de software: `task_complete` (`false`/`true`), `should_retry` (`false`/`true`), `failure_source` (`code`, `environment`, `test`, `dependency`, `unknown`), `next_action` (`inspect_code`, `rerun_tests`, `inspect_environment`, `revert_change`, `escalate`) y `evidence_sufficient` (`false`/`true`).
- Procesamiento de entradas de hasta 256 tokens en estilos heterogéneos: tickets, logs, stack traces, hilos de conversación e informes estructurados.
- Salidas de probabilidad por cabeza con temperaturas de calibración ajustadas sobre un split dedicado.
- No genera texto, no mantiene conversación, no responde preguntas abiertas y no soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; cada invocación es una clasificación puntual e independiente.
- Capacidad multilingüe nula más allá del inglés.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación sobre calibración de clasificadores: el modelo sirve como caso de estudio reproducible (código, generador de datos y logs completos publicados) para medir la brecha entre confianza reportada y precisión bajo cambio de redacción, un fenómeno documentado en la propia model card con cifras concretas (97,19 % de confianza media frente a 44,51 % de precisión en el modelo v0).
- Enrutamiento de triaje en pipelines de CI/CD experimentales: dado un resumen de fallo de tests, el modelo puede emitir `next_action` para decidir si se inspecciona código, se relanza la suite o se escala, siempre como señal auxiliar y no como decisión autónoma.
- Etiquetado asistido de corpus de diagnóstico: con un 92,95 % de precisión en `failure_source` sobre el test final, puede preetiquetar grandes volúmenes de resúmenes sintéticos o internos para revisión humana posterior.
- Detección de evidencia insuficiente: la cabeza `evidence_sufficient` (92,85 % de precisión) permite filtrar resúmenes que no contienen información bastante antes de pasarlos a un sistema de análisis más costoso.
- Evaluación comparativa de estrategias de aumento de datos: al estar publicado el generador y las 12 familias de redacción, se puede replicar el experimento sustituyendo la política de diversidad y comparar contra las cifras publicadas (v0: 75,32 %; diversity-v1: 61,13 %; diversity-v2: 62,77 %; deep-heads-v2: 86,25 % en el test final).
- Docencia y experimentación en entornos con hardware limitado: con 69 M de parámetros y un repo de 0,3 GB, el fine-tuning completo cabe en una GPU consumer de 12 GB como la RTX 3060 usada por el autor, lo que permite reproducir el pipeline de extremo a extremo.
- Referencia negativa en auditorías de calibración: la comparación cruda frente a temperatura escalada en el test final (ECE 0,1273 frente a 0,2673, con precisión idéntica) es un ejemplo útil para ilustrar que el escalado de temperatura puede empeorar la calibración cuando las temperaturas se ajustan sobre una distribución distinta.

## Benchmarks y rendimiento

Test final (`release-final-v1`, 2.000 estados, evaluado una sola vez). Intervalos bootstrap del 95 % sobre estados.

| Variante | Precisión macro | NLL | Brier | ECE | Confianza media |
|---|---:|---:|---:|---:|---:|
| Cruda | 86,25 % [85,48; 86,97] | 0,8479 | 0,2630 | 0,1273 | 98,89 % |
| Con temperatura escalada | 86,25 % | 0,7133 | 0,3940 | 0,2673 | 63,19 % |

Desglose por cabeza (cruda, test final):

| Cabeza | Precisión | NLL | ECE | Confianza media |
|---|---:|---:|---:|---:|
| `task_complete` | 100,00 % | 0,0004 | 0,0004 | 99,96 % |
| `should_retry` | 82,65 % | 1,1987 | 0,1677 | 99,24 % |
| `failure_source` | 92,95 % | 0,2982 | 0,0451 | 97,46 % |
| `next_action` | 62,80 % | 2,4050 | 0,3641 | 99,17 % |
| `evidence_sufficient` | 92,85 % | 0,3373 | 0,0593 | 98,63 % |

Comparativa interna del proyecto en el mismo test final (crudo):

| Modelo | Precisión macro |
|---|---:|
| v0 (primer modelo) | 75,32 % |
| diversity-v1 | 61,13 % |
| diversity-v2 | 62,77 % |
| deep-heads-v2 (este modelo) | 86,25 % |
| Baseline de regresión logística | 45,45 % |

Split de desarrollo con cambio de redacción (usado para elegir el modelo, por tanto no es un test insesgado):

| Variante | Precisión macro | NLL | ECE | Confianza media |
|---|---:|---:|---:|---:|
| Cruda | 59,27 % [58,29; 60,28] | 2,4363 | 0,3740 | 96,58 % |
| Con temperatura escalada | 59,27 % | 0,7875 | 0,1476 | 62,39 % |

Por cabeza en ese split (cruda): `task_complete` 98,05 %, `should_retry` 86,25 %, `failure_source` 19,75 %, `next_action` 61,25 %, `evidence_sufficient` 31,05 %. El modelo v0, sobre 2.000 estados con redacción no vista, obtuvo 44,51 % [43,44; 45,59] de precisión macro con 97,19 % de confianza media.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 0,28 GB de pesos más activaciones y overhead; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM para fine-tuning completo: el autor lo ejecutó en una única NVIDIA RTX 3060 (12 GB) con BF16, batch 16 y 3 épocas; no se documentan requisitos para otros tamaños de batch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); las A100 y H100 no aportan ventaja relevante para un modelo de este tamaño.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia de baja concurrencia.
- Despliegue: la vía documentada es `transformers` con `AutoModel`/`AutoTokenizer` y `trust_remote_code=True`. No se han publicado artefactos GGUF, ni instrucciones para llama.cpp, Ollama, vLLM o TGI; al ser un encoder con cabezas custom, estos runners requerirían portar el código.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| System One Mini | 69,3 M | 256 tokens | 5 clasificaciones fijas sobre diagnóstico de software | Apache 2.0 | Hugging Face, código custom |
| DistilBERT base uncased (modelo base) | 66 M | 512 tokens | Representaciones de propósito general | Apache 2.0 | Hugging Face, transformers estándar |
| Baseline de regresión logística del mismo proyecto | No disponible | No disponible | Mismas 5 clasificaciones | No disponible | Repo de GitHub del autor |

La comparación con el modelo base no es directa en rendimiento, porque DistilBERT no está ajustado para esta tarea concreta; se incluye por ser el punto de partida arquitectónico. El autor no publica comparaciones frente a otros clasificadores ajustados para la misma tarea, por lo que no hay datos de rendimiento frente a alternativas externas.

## Limitaciones y advertencias

- El propio autor desaconseja explícitamente su uso para logs arbitrarios, ayuda general a la programación, incidentes reales de producción, afirmaciones causales, decisiones de seguridad crítica y control autónomo de agentes.
- El modelo no genera texto y no responde preguntas abiertas; cualquier uso como chat o asistente es un error de aplicación.
- El entrenamiento es exclusivamente sintético: aunque las 12 familias de redacción cubren formatos habituales, no se ha validado con trazas reales de usuarios ni con logs de producción.
- La calibración es deficiente en el modo crudo: confianza media del 98,89 % frente a una precisión macro del 86,25 %, con ECE de 0,1273. La temperatura escalada reduce la NLL pero empeora el ECE (0,2673), porque las temperaturas se ajustaron sobre un split distinto del test final.
- El rendimiento cae de forma marcada bajo cambio de redacción: 59,27 % de precisión macro en el split de desarrollo con redacción desplazada, frente al 86,25 % del test final. La cabeza `failure_source` baja al 19,75 % en ese escenario.
- La cabeza `next_action` es la más débil incluso en el test final (62,80 % de precisión, NLL 2,4050), por lo que sus predicciones no deberían usarse sin supervisión.
- Solo inglés; no hay soporte multilingüe ni evaluación en otros idiomas.
- Límite estricto de 256 tokens: los resúmenes más largos se truncan, con posible pérdida de evidencia relevante.
- El repositorio contiene código custom de Transformers y requiere `trust_remote_code=True`, lo que implica ejecutar código del autor. Debe fijarse una revisión concreta.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no está validado para producción.
- Con 42 descargas y 0 likes, la validación por parte de terceros es prácticamente inexistente; los resultados proceden únicamente de la evaluación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidHatley/system-one-mini
- Dataset de entrenamiento: https://huggingface.co/datasets/DavidHatley/system-one-mini-data
- Repositorio de código, generador de datos, evaluaciones y log de investigación: https://github.com/davidghatley/system-one-mini
- Página del autor: https://davidghatley.github.io
- Perfil de GitHub del autor: https://github.com/davidghatley
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
