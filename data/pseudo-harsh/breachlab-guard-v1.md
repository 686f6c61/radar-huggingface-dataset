# Pseudo-Harsh/breachlab-guard-v1

## Resumen

breachlab-guard-v1 es un clasificador de seguridad de entrada desarrollado por Pseudo-Harsh (GitHub: giri-harsh) como parte del proyecto BreachLab, un juego en el que los jugadores intentan engañar a una bóveda de IA para que revele un código secreto. El modelo etiqueta cada mensaje entrante en una de cuatro categorías —`safe`, `injection`, `jailbreak` o `exfiltration`— mediante un único paso forward con softmax sobre cuatro tokens verbalizadores. Se trata de un fine-tune LoRA de Qwen3-0.6B, una arquitectura transformer densa de 0,6 mil millones de parámetros con licencia Apache-2.0.

El modelo resuelve un problema concreto: la detección de prompt injection y jailbreaks con una tasa de falsos positivos baja, algo crítico en aplicaciones conversacionales donde bloquear mensajes legítimos degrada la experiencia. Frente a alternativas genéricas como Llama Prompt-Guard-2-86M o clasificadores DeBERTa, el modelo reporta una tasa de éxito de ataque (ASR) del 0,6 % y un FPR del 1,6 % sobre un conjunto de test de 1500 filas en distribución, con un AUROC de 0,999. El autor lo describe explícitamente como una demo de investigación y no como un sistema de seguridad listo para producción.

La relevancia actual del modelo reside en su enfoque de eficiencia: se exporta a ONNX con reutilización de prefijo KV y se sirve en una variante de pesos int4 de 433 MB que cabe en una función serverless de 1 vCPU y 2 GB. El repositorio incluye además una variante v2 (`champion-v2/`) entrenada con datos duros benignos adicionales en hindi e hinglish, que reduce drásticamente el FPR sobre aperturas benignas cortas (del 54,3 % al 6,3 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) con adaptador LoRA; export ONNX con reutilización de prefijo KV |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-0.6B soporta contexto largo, pero la ficha no lo especifica) |
| Tipos de cuantizacion | fp32 (referencia), int4 weight-only (MatMulNBits, bloque 32, embeddings int8, 433 MB); int8 dinámico descartado por pérdida de calidad; int8 weight-only mantiene paridad pero es más lento en CPU |
| Idiomas soportados | Inglés (en) e hindi (hi); incluye datos hinglish en v2 |
| Licencia | Apache-2.0 (pesos y código); los datos de entrenamiento incluyen filas CC-BY-SA-3.0 (databricks-dolly-15k) |
| Formato de pesos | safetensors (adaptador LoRA vía PEFT) y ONNX (grafos fp32 e int4) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros, sobre el que se aplica un adaptador LoRA tras un entrenamiento supervisado (SFT). La clasificación se realiza en un único paso forward: el modelo emite un softmax sobre cuatro tokens verbalizadores que corresponden a las categorías `safe`, `injection`, `jailbreak` y `exfiltration`. La decisión final se toma sobre `p_unsafe` con un umbral calibrado. Se probó una etapa adicional de DPO sobre 399 pares duros minados, pero no produjo una mejora significativa (McNemar p = 1,0), por lo que, según la regla del proyecto, el DPO no se despliega y se conserva como export `challenger/`.

La exportación a ONNX emplea reutilización de prefijo KV: el prefijo de instrucción fijo se computa una sola vez, lo que reduce el coste por petición. El grafo de referencia es fp32 (diferencia máxima de logits de 1,5e-05 respecto a fp32 plano). La calibración en fp32 fija una temperatura T = 1,41 y un umbral sobre `p_unsafe` de 0,063, ajustados para mantener el FPR en o por debajo del 2 %; el error de calibración esperado en validación baja de 0,023 a 0,009. La variante int4 servida requiere su propio umbral (0,232) porque, aunque su ranking se mantiene intacto (caída de AUROC de 0,0003), el umbral fp32 dispara el FPR al 7,7 %. El entrenamiento se realizó con semillas 0, 1 y 3 (la semilla 2 divergió en fp16 con gradientes y logits NaN y se excluye de la media, conservándose como evidencia).

## Capacidades

- Clasificación de seguridad de entrada en cuatro categorías: `safe`, `injection`, `jailbreak` y `exfiltration`, en un único paso forward.
- Detección de prompt injection y jailbreaks con umbral calibrado sobre `p_unsafe`.
- Detección de intentos de exfiltración de secretos (adecuado para el escenario de bóveda de BreachLab).
- Soporte bilingüe inglés-hindi, con datos hinglish añadidos en la variante v2.
- Calibración de temperatura y umbral para controlar la tasa de falsos positivos.
- Contrato de servicio HTTP: `POST /score` con campos `text`, `kind` (`input`|`output`) y `alias`, que devuelve `label`, `category`, `p_unsafe`, `confidence`, `version` y `latency_ms`; endpoint `GET /health`.
- Export ONNX con reutilización de prefijo KV para inferencia eficiente en CPU.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Guard de entrada en aplicaciones conversacionales: el modelo se coloca delante del LLM principal y bloquea mensajes clasificados como `injection`, `jailbreak` o `exfiltration` antes de que lleguen al modelo generativo, con un FPR del 1,6 % en fp32 que limita el bloqueo de usuarios legítimos.
- Protección de secretos en aplicaciones tipo bóveda o juego: el escenario original de BreachLab, donde el guard detecta intentos de extraer un código secreto mediante ingeniería social o inyección de instrucciones.
- Filtrado de salidas del modelo (`kind: "output"`): el mismo contrato de servicio permite puntuar respuestas generadas para detectar fugas de información antes de mostrarlas al usuario.
- Despliegue serverless de bajo coste: la variante int4 de 433 MB cabe en una función Vercel de 1 vCPU y 2 GB, lo que permite añadir un guard a aplicaciones sin infraestructura GPU dedicada.
- Moderación de comunidades bilingües inglés-hindi: el soporte de hindi e hinglish (especialmente en v2) permite filtrar intentos de manipulación en comunidades donde se mezclan ambos idiomas.
- Investigación en seguridad de LLM: el repositorio incluye adaptadores base, SFT, DPO challenger y variantes v2, lo que facilita reproducir experimentos de calibración, cuantización y evaluación de guards.
- Pipeline de evaluación de red teaming: el endpoint `/score` puede integrarse en herramientas que puntúen automáticamente intentos de ataque y midan la resistencia de un sistema desplegado.

## Benchmarks y rendimiento

Resultados sobre `gold_test` (1500 filas, en distribución), según la model card:

| Modelo | ASR (menor es mejor) | FPR | F1 | AUROC |
|---|---|---|---|---|
| Filtro regex | 59,4 % | 10,3 % | 0,531 | 0,652 |
| Llama Prompt-Guard-2-86M (vía Groq) | 51,6 % | 10,3 % | 0,602 | 0,868 |
| Gemini como juez zero-shot | 12,8 % | 2,8 % | 0,915 | 0,969 |
| Clasificador DeBERTa de prompt injection | 10,4 % | 14,2 % | 0,867 | 0,904 |
| Qwen3-0.6B zero-shot | 100,0 % | 0,4 % | 0,000 | 0,591 |
| Qwen3-1.7B zero-shot | 61,9 % | 13,2 % | 0,495 | 0,777 |
| Qwen3-0.6B + LoRA, solo SFT (este modelo) | 0,6 % | 1,6 % | 0,988 | 0,999 |
| Mismo adaptador, grafo int4 con umbral propio (servido) | 0,6 % | 2,1 % | 0,985 | 0,999 |
| Qwen3-0.6B + LoRA, SFT y luego DPO (challenger) | 0,4 % | 1,7 % | 0,988 | 0,999 |
| Qwen3-1.7B + LoRA, solo SFT (comparación) | 0,0 % | 1,3 % | 0,992 | 1,000 |
| Qwen3-1.7B + LoRA, SFT y luego DPO (comparación) | 0,0 % | 1,3 % | 0,992 | 1,000 |

Estabilidad entre semillas (0, 1, 3; media ± desviación típica, n = 3): ASR 0,49 ± 0,17 %, FPR 1,83 ± 0,24 %, F1 0,9867 ± 0,0017, AUROC 0,9995 ± 0,0002.

Variante v2 (`champion-v2/`, servida en el juego): umbral 0,9646 elegido sobre validación v2; ASR en gold_test 0,44 %, FPR 1,83 %; FPR sobre aperturas benignas cortas retenidas 6,3 % (v1: 54,3 %); aperturas en hindi 15,0 % (v1: 96 %).

Latencia (objetivo de p95 ≤ 300 ms en CPU, no cumplido):
- Variante servida int4 con prefijo KV en Vercel Python (1 vCPU, 2 GB), 500 peticiones en caliente a concurrencia 1: tiempo de modelo p50/p95 = 720/3468 ms; ida y vuelta p50 842 ms, p95 3556 ms. A concurrencia 4 el único vCPU serializa las peticiones (ida y vuelta p50 3664 ms).
- Arranque en frío: tras unos 10 minutos de inactividad, la primera petición tarda unos 13 s, más que el timeout de 8 s del gateway, lo que provoca un 503 fail-closed ("guard waking up") en esa primera petición.
- Histórico: fp32 con prefijo KV en Kaggle con 2 vCPU, p95 2326 ms; ONNX fp32 plano a 512 tokens en Kaggle con 4 vCPU, p95 3112 ms (cifras superadas, conservadas solo como historial).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica para el despliegue de referencia, que es en CPU. El grafo int4 servido ocupa 433 MB en disco; el adaptador LoRA sobre Qwen3-0.6B en fp16 requiere aproximadamente 1,2 GB de pesos más overhead de activaciones.
- GPU recomendadas: no disponibles en la información proporcionada; el autor no documenta despliegue en GPU. Cualquier GPU consumer con al menos 2 GB de VRAM podría alojar el modelo base en fp16, pero no hay cifras publicadas.
- Cabe en GPU consumer: sí, por tamaño (0,6B de parámetros), aunque no se han publicado mediciones en GPU.
- Opciones de despliegue: ONNX Runtime (grafos fp32 e int4), PEFT para cargar el adaptador LoRA sobre Qwen3-0.6B, y servicio HTTP propio (`vercel-guard/`, agnóstico de host). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en el host de referencia (Vercel, 1 vCPU, 2 GB), p50 de modelo 720 ms y p95 3468 ms a concurrencia 1; a concurrencia 4 la ida y vuelta p50 sube a 3664 ms por serialización en un único vCPU. Arranque en frío de unos 13 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASR / FPR (gold_test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| breachlab-guard-v1 | 0,6B (LoRA) | No disponible | 0,6 % / 1,6 % | Apache-2.0 | Hugging Face (Pseudo-Harsh) |
| Llama Prompt-Guard-2-86M | 86M | No disponible | 51,6 % / 10,3 % | No disponible en la información | Vía Groq en la evaluación |
| Clasificador DeBERTa de prompt injection | No disponible | No disponible | 10,4 % / 14,2 % | No disponible en la información | No disponible en la información |
| Qwen3-0.6B + LoRA (Qwen3-1.7B, comparación interna) | 1,7B | No disponible | 0,0 % / 1,3 % | Apache-2.0 | Entrenado por el mismo autor como comparación |

La comparación con Gemini como juez zero-shot (ASR 12,8 %, FPR 2,8 %, F1 0,915, AUROC 0,969) muestra que un modelo grande sin entrenamiento específico queda por debajo en ASR y F1, aunque con un FPR comparable. El modelo de 1,7B del mismo autor mejora ligeramente las métricas a costa de triplicar el tamaño, lo que sugiere que 0,6B es un punto de compromiso razonable para despliegue en CPU.

## Limitaciones y advertencias

- El propio autor lo califica como demo de investigación, no como sistema de seguridad de producción.
- El FPR sobre aperturas benignas cortas es alto en v1 (54,3 %) y mejora en v2 (6,3 %), pero sigue siendo relevante para aplicaciones con mensajes muy breves.
- El FPR en hindi es del 15,0 % en v2 (96 % en v1), lo que limita su uso en comunidades hindi sin ajuste adicional.
- La variante int4 servida supera el umbral del 2 % de FPR en gold_test (2,08 %), una desviación registrada respecto a la regla del proyecto.
- El objetivo de latencia p95 ≤ 300 ms no se cumple: p95 de 3468 ms en el host de referencia y arranques en frío de 13 s que provocan 503 fail-closed.
- Una de las cuatro semillas entrenadas (semilla 2) divergió con NaN en fp16, lo que indica inestabilidad en el entrenamiento y requiere cuidado al reproducir.
- La calibración debe reajustarse por variante (fp32 vs int4): usar el umbral fp32 en el grafo int4 dispara el FPR al 7,7 %.
- Los datos de entrenamiento incluyen filas CC-BY-SA-3.0 (databricks-dolly-15k), lo que puede imponer obligaciones de atribución y compartir-al-igual sobre partes del dataset, aunque los pesos se distribuyan como Apache-2.0.
- Riesgo de alucinación no aplica en el sentido generativo (es un clasificador), pero sí existe riesgo de clasificación errónea en dominios fuera de distribución; el autor solo reporta evaluación en distribución.
- Sin datos publicados de rendimiento en GPU ni de integración con servidores de inferencia estándar (vLLM, TGI, llama.cpp).
- El modelo solo cubre inglés e hindi; no hay soporte documentado de castellano.

## Enlaces

- Hugging Face: https://huggingface.co/Pseudo-Harsh/breachlab-guard-v1
- Repositorio de código: https://github.com/giri-harsh/breachlab
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Informes de evaluación: `reports/eval-v1.md` y `reports/eval-v2.md` en el repositorio de código
- Decisiones de arquitectura: ADR-0057, ADR-0082 (en el repositorio de código)
- Dataset de entrenamiento (referenciado): databricks-dolly-15k (CC-BY-SA-3.0)
