# callmefattyy/ruos-foundry-cu-qwen3-30b-a3b-e32

## Resumen

`ruos-foundry-cu-qwen3-30b-a3b-e32` es un checkpoint de tipo Mixture-of-Experts obtenido podando expertos del modelo `Qwen/Qwen3-30B-A3B-Instruct-2507` de Alibaba. No se ha reentrenado ningún peso: se eliminaron y renumeraron los expertos enrutados menos usados por cada capa y se recortaron las filas del router en consecuencia, pasando de 128 a 32 expertos por capa en las 48 capas enrutadas y manteniendo el top-k de 8 tokens sin cambios.

El resultado es un modelo con 8.779.413.504 parámetros totales (~8,78B) según safetensors, frente a los ~30,5B del padre, lo que supone una reducción del 71,2% en bytes de tensores. Lo publica el usuario `callmefattyy` mediante la herramienta MoE-Foundry (ADR-064) dentro del proyecto ruOS, con licencia Apache-2.0 y pipeline de text-generation.

Su rasgo más crítico es el estado: la ficha lo marca explícitamente como `unevaluated` y `enabled: false`. La exportación estructural prueba integridad de tensores, no capacidad retenida, de modo que no debería enrutarse a producción hasta disponer de una evaluación frente al modelo padre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Mixture-of-Experts (qwen3_moe); 48 capas enrutadas |
| Parametros totales | 8.779.413.504 (~8,78B) |
| Parametros activos | No disponible en la ficha (el padre activa ~3,3B por token con top-k=8) |
| Longitud de contexto | No especificada; el ejemplo de despliegue usa 8192 tokens (el padre admite 262.144) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (bfloat16). Sin GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (archivo único `model.safetensors`, ~17,6 GB) |
| Expertos por capa enrutada | 32 (padre: 128) |
| Top-k de tokens | 8 (sin cambios respecto al padre) |
| Modelo base | Qwen/Qwen3-30B-A3B-Instruct-2507 (revisión 0d7cf23991f47feeb3a57ecb4c9cee8ea4a17bfe) |
| Estado de calidad | `unevaluated` / `enabled: false` |

## Arquitectura y entrenamiento

La arquitectura es la del padre sin modificar en su topología básica: un transformer decoder con capas de atención y capas feed-forward reemplazadas por bloques MoE, todas ellas enrutadas mediante router aprendido. La única intervención es estructural. MoE-Foundry ejecutó el pipeline `inspect → profile_hf → select → export → mixture`, trazas del router sobre el conjunto de calibración ruOS `ruos-cu` (148 filas de validación, ~63.523 tokens, familias `browser_step` y `cu_step`), y conservó los 32 expertos por capa con mayor probabilidad de enrutamiento acumulada (`mass`). Los pesos restantes no se tocaron.

El criterio de selección es un proxy de uso, no de importancia causal: los expertos retenidos son los que el router activaba con más frecuencia en ese dominio concreto, no necesariamente los más útiles para otras tareas. Las trazas se recogieron en una NVIDIA A100-SXM4-80GB con bfloat16 y transformers 4.51.3 (412 tareas, 148.144 tokens, 7.110.912 filas). No hubo fase de RLHF, DPO ni fine-tuning: el checkpoint es el resultado de un recorte de expertos y un reajuste de índices, con los tensores de entrada de 61.064.245.248 bytes reducidos a 17.558.827.008 bytes.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo padre Instruct-2507.
- Razonamiento, código y matemáticas: previsiblemente heredados del padre, aunque no verificados en este checkpoint.
- Soporte de tool calling y function calling: depende del padre; no confirmado en este recorte.
- Capacidades multilingües: la ficha declara únicamente `en`, muy por debajo de los 119 idiomas del padre.
- No se declaran capacidades de visión ni audio.
- Comportamiento especializado en el dominio de calibración `ruos-cu` (pasos de navegador y pasos de uso de computador), por construcción del recorte.
- Todas las capacidades anteriores están sin evaluar: la ficha advierte que no se hace ninguna afirmación de capacidad, memoria o latencia.

## Casos de uso

- Experimentación con poda de expertos MoE: sirve como caso de estudio reproducible para medir cuánta capacidad sobrevive a un recorte del 71,2% de expertos, comparando contra el padre sobre un split congelado.
- Despliegue en GPU de consumo para pruebas: con ~17,6 GB de pesos en bfloat16 cabe en tarjetas de 24 GB, lo que permite validar el modelo localmente antes de decidir si merece producción.
- Evaluación de regresión y redteam: la ficha indica que el checkpoint se publica precisamente para que `slim-eval` lo mida con run, redteam, regression y verdict.
- Inferencia en inglés de bajo coste: al reducir el número total de expertos, el checkpoint abarata el almacenamiento y la carga del modelo respecto al padre, útil en entornos con memoria limitada.
- Investigación sobre enrutamiento especializado: permite estudiar cómo se comporta un router con 32 expertos frente a uno con 128 en tareas fuera del dominio de calibración.
- Referencia para pipelines de destilación estructural: ejemplo de exportación de un MoE más pequeño sin tocar pesos, reutilizable en otras arquitecturas.
- No se recomienda su uso enrutado en producción ni en atención al cliente automatizada hasta que exista un veredicto de evaluación favorable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha marca el modelo como `unevaluated` y no aporta cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput. El modelo padre, `Qwen3-30B-A3B-Instruct-2507`, sí cuenta con evaluaciones públicas, pero no se aportan aquí y no deben extrapolarse al recorte.

## Requisitos de hardware

- VRAM estimada para inferencia: ~17,6 GB solo de pesos en bfloat16, más caché KV y activaciones según la longitud de contexto.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) con margen ajustado y contexto corto; con el ejemplo de 8192 tokens el margen se estrecha.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100, L40S, sin problemas de encaje.
- No se publican pesos cuantizados ni GGUF, por lo que no hay una ruta de despliegue en CPU/llama.cpp documentada.
- Opciones de despliegue: vLLM (comando de ejemplo en la ficha, `vllm serve ruvnet/ruos-foundry-cu-qwen3-30b-a3b-e32 --max-model-len 8192`) y carga estándar con `transformers` como checkpoint `qwen3_moe`.
- Latencia y throughput: no disponibles. La ficha no aporta ninguna medición.
- Advertencia de memoria: cargar varios especialistas junto al modelo padre puede consumir más memoria total que el padre en solitario.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Expertos/capa | Contexto | Licencia | Idiomas | Estado |
|---|---|---|---|---|---|---|---|
| Este (e32) | 8,78B | No disponible (padre ~3,3B) | 32 | No especificado (padre 262.144) | Apache-2.0 | en | unevaluated |
| ruvnet/ruos-foundry-cu-qwen3-30b-a3b-e64 | No disponible | No disponible | 64 | No especificado | Apache-2.0 | en | unevaluated |
| Qwen3-30B-A3B-Instruct-2507 (padre) | ~30,5B | ~3,3B | 128 | 262.144 | Apache-2.0 | 119 | Evaluado |
| Qwen3-30B-A3B (base) | ~30,5B | ~3,3B | 128 | 131.072 | Apache-2.0 | 119 | Evaluado |

El hermano `e64` es el mismo experimento con 64 expertos por capa, un punto intermedio entre este recorte y el padre. Frente al padre, este checkpoint reduce el peso en disco y el número de expertos, pero renuncia a idiomas (de 119 a inglés) y a cualquier garantía de rendimiento.

## Limitaciones y advertencias

- Estado `unevaluated` y `enabled: false`: el autor desaconseja explícitamente enrutar tráfico a este checkpoint hasta que exista un veredicto de evaluación.
- Los expertos retenidos se eligieron por masa de enrutamiento en el dominio `ruos-cu`; las peticiones fuera de ese dominio deberían ir al padre.
- Riesgo de degradación de capacidad no cuantificado: no se mide la pérdida frente al modelo original.
- Riesgo de alucinación: inherente al modelo padre y no reevaluado tras el recorte.
- Sesgos conocidos: no documentados en la información disponible; hereda los del padre sin análisis específico.
- Idiomas: la ficha declara únicamente inglés, pese a que el padre cubre 119 idiomas.
- Licencia Apache-2.0, que en principio permite uso comercial, pero conviene verificar los términos del modelo base y de los datos de calibración del proyecto ruOS.
- No hay artefactos GGUF ni cuantizaciones publicadas, lo que limita el despliegue en CPU.
- Riesgo operativo: convivir con varios especialistas y con el padre puede incrementar la memoria total frente a usar solo el padre.

## Enlaces

- Modelo en HuggingFace (callmefattyy): https://huggingface.co/callmefattyy/ruos-foundry-cu-qwen3-30b-a3b-e32
- Modelo en HuggingFace (ruvnet): https://huggingface.co/ruvnet/ruos-foundry-cu-qwen3-30b-a3b-e32
- Variante e64: https://huggingface.co/ruvnet/ruos-foundry-cu-qwen3-30b-a3b-e64
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Repositorio MoE-Foundry: https://github.com/ruvnet/MoE-Foundry
- Ficha en FriendliAI: https://friendli.ai/models/ruvnet/ruos-foundry-cu-qwen3-30b-a3b-e32
- Registro en free2aitools: https://free2aitools.com/model/ruvnet/ruos-foundry-tools-qwen3-30b-a3b-e32
- Especificaciones del padre en apxml: https://apxml.com/models/qwen3-30b-a3b
