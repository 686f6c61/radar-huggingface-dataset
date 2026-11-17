# Ilf-Ali/switchboard-router

## Resumen

Switchboard router es un clasificador binario de prompts disenado para enrutar peticiones entre dos modelos de lenguaje de distinto coste. Lo desarrolla Ilf-Ali y se publica bajo licencia Apache 2.0. El modelo recibe unicamente el prompt de entrada y predice la probabilidad de que la respuesta de un modelo pequeno (`openai/gpt-oss-20b`) sea suficientemente buena; si esa probabilidad supera un umbral configurable, la peticion se envia al modelo barato y, en caso contrario, al modelo grande (`openai/gpt-oss-120b`). Resuelve un problema de coste operativo: evitar pagar inferencia de un modelo grande cuando uno pequeno basta.

Tecnicamente es un fine-tuning de `answerdotai/ModernBERT-base` como clasificador de una sola etiqueta, con 149,6 millones de parametros totales y pesos en safetensors y ONNX. No es un modelo generativo: su salida es una puntuacion (`small_ok`) que el proxy compatible con OpenAI del autor interpreta para decidir la ruta. Esta pensado para prompts en ingles, de un solo turno, de tipo instruccion general, preguntas factuales, resumen, matematicas y codigo.

Su relevancia practica esta en la relacion coste-calidad declarada: en el punto de operacion con umbral 0,79 enruta el 80 % de los prompts al modelo pequeno conservando el 98,0 % de la calidad del modelo grande (segun un juez LLM) y reduciendo el coste un 30 %. Es una pieza de infraestructura de enrutamiento, no un modelo de proposito general, y esta fuertemente acoplado al par de modelos con el que fue etiquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) fine-tuneado como clasificador binario |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ModernBERT-base; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors y ONNX) |
| Idiomas soportados | en (solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer de la familia ModernBERT, y se fine-tunea como clasificador binario que opera solo sobre el prompt. La etiqueta positiva es `small_ok`, es decir, que la respuesta del modelo pequeno se considera suficientemente buena. La prediccion se expone como puntuacion de clase y se compara con un umbral (0,79 en el punto de operacion publicado) para decidir la ruta.

El conjunto de entrenamiento es `Ilf-Ali/switchboard-routing`, con 1398 prompts de entrenamiento, de los cuales el 85 % estan etiquetados como `small_ok`. Las etiquetas se generan comparando las puntuaciones de un juez LLM (`qwen/qwen3.8-27b`) sobre las respuestas de ambos modelos. La tasa de aprendizaje se ajusto en validacion, con mejor valor 2e-05. El ROC AUC es de 0,77 en validacion y 0,73 en test. No se documentan tecnicas de RLHF ni DPO, ni detalles adicionales sobre el volumen de tokens de entrenamiento o la composicion del dataset mas alla de los tipos de prompt indicados.

## Capacidades

- Clasificacion de prompts: predice la probabilidad de que un modelo pequeno responda de forma aceptable (`small_ok`).
- Enrutamiento coste-calidad: decision binaria entre modelo barato y modelo caro segun umbral configurable.
- Clasificacion de texto de una sola etiqueta mediante `pipeline("text-classification")` de transformers.
- Inferencia en CPU con latencia baja: p50 de 50 ms y p95 de 134 ms por prompt con 4 hilos en Apple silicon.
- Exportacion a ONNX y compatibilidad con text-embeddings-inference y endpoints.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un clasificador.
- Cobertura limitada a prompts en ingles, de un solo turno, de instruccion general, preguntas factuales, resumen, matematicas y codigo.

## Casos de uso

- Enrutamiento en produccion entre modelos de distinto coste: integrado en el proxy compatible con OpenAI del autor, cada peticion se clasifica y se reenvia a `gpt-oss-20b` o `gpt-oss-120b` segun la puntuacion, reduciendo el gasto sin degradar perceptiblemente la calidad.
- Reduccion de coste en APIs de chat: con umbral 0,79 se envia el 80 % del trafico al modelo pequeno conservando el 98,0 % de la calidad medida, lo que se traduce en un 30 % de ahorro declarado.
- Filtro previo en pipelines de atencion al cliente: los prompts sencillos y factuales se resuelven con el modelo barato y solo las consultas complejas escalan al modelo grande, manteniendo la latencia media baja.
- Control de presupuesto por criticidad: ajustando el umbral a la baja se prioriza el coste y subiendolo se prioriza la calidad, lo que permite definir politicas distintas por entorno (desarrollo frente a produccion).
- Clasificacion offline de lotes de prompts: al ser un encoder pequeno y ejecutable en CPU, permite etiquetar grandes volumenes de prompts sin GPU para analizar que proporcion requeriria el modelo grande.
- Enrutamiento en despliegues con recursos limitados: la inferencia en CPU con p50 de 50 ms hace viable colocar el router delante de servicios LLM sin anadir infraestructura GPU dedicada.
- Investigacion sobre enrutamiento aprendido: sirve como linea base reproducible (ROC AUC 0,73 en test) para comparar heuristicas de enrutamiento como longitud de prompt o enrutamiento aleatorio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test retenido (300 prompts):

| Estrategia | Enviado al pequeno | Puntuacion media del juez | Calidad conservada | Ahorro de coste |
|---|---|---|---|---|
| Switchboard router | 80 % | 4,30 | 98,0 % | 30 % |
| Enrutamiento aleatorio, misma proporcion (media de 20 semillas) | 80 % | 4,23 | 96,5 % | 36 % |
| Heuristica por longitud de prompt, misma proporcion | 80 % | 4,19 | 95,5 % | 37 % |
| Siempre pequeno | 100 % | 4,19 | 95,6 % | 44 % |
| Siempre grande | 0 % | 4,39 | 100,0 % | 0 % |

Metricas adicionales: ROC AUC de 0,77 en validacion y 0,73 en test; el router supera al enrutamiento aleatorio en 20 de 20 semillas con la misma proporcion de trafico. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 149,6 millones de parametros, la inferencia en FP32 requiere aproximadamente 0,6 GB de memoria y en FP16 alrededor de 0,3 GB, sin contar overhead del runtime.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente por el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual e incluso en CPU.
- Despliegue: transformers (`pipeline("text-classification")`), ONNX Runtime, text-embeddings-inference y endpoints compatibles; el autor publica un proxy compatible con OpenAI en su repositorio de GitHub.
- Latencia: p50 de 50 ms y p95 de 134 ms por prompt en CPU con 4 hilos (Apple silicon). No se publican datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Switchboard router | 149,6 M | no disponible | Enrutamiento binario coste-calidad | apache-2.0 | Hugging Face |
| `answerdotai/ModernBERT-base` | no disponible | no disponible | Encoder base para fine-tuning | no disponible | Hugging Face |
| Heuristica por longitud de prompt | no aplica | no aplica | Enrutamiento por regla | no aplica | Implementacion propia |
| Enrutamiento aleatorio | no aplica | no aplica | Enrutamiento por probabilidad | no aplica | Implementacion propia |

No se dispone de informacion sobre otros routers aprendidos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Sesgo del juez: la calidad se mide con un juez LLM que coincide con etiquetas humanas en el 80 % de las filas (kappa 0,52) y es mas indulgente que un humano; "calidad conservada" se refiere al criterio del juez.
- Acoplado a un par concreto de modelos: entrenado para `openai/gpt-oss-20b` y `openai/gpt-oss-120b` en Groq a fecha de 2026-10-16; otros modelos o versiones nuevas requieren reetiquetar datos.
- Evaluacion pequena: 300 prompts de test, por lo que las cifras por categoria son ruidosas.
- Alcance de prompt limitado: pensado para prompts de un solo turno de instruccion general, preguntas factuales, resumen, matematicas y codigo; no cubre conversaciones multi-turno ni dominios especializados.
- Riesgo de clasificacion erronea: con ROC AUC de 0,73 en test, una parte de los prompts se enrutara de forma suboptima, afectando a la calidad o al coste.
- No es un modelo generativo: no debe usarse para responder directamente, solo para clasificar y enrutar.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrecen garantias sobre el rendimiento en dominios distintos al de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ilf-Ali/switchboard-router
- Dataset de entrenamiento: https://huggingface.co/datasets/Ilf-Ali/switchboard-routing
- Codigo y proxy compatible con OpenAI: https://github.com/Ilf-Ali-Momin/switchboard
- Demo: https://huggingface.co/spaces/Ilf-Ali/switchboard
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
