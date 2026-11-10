# barbosaDev01/foodflow-llm-reranker-lora

## Resumen

FoodFlow LLM Reranker es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `meta-llama/Llama-3.2-1B`, desarrollado por barbosaDev01 (Gustavo Silva) como parte del proyecto de portafolio FoodFlow, inspirado en la plataforma de delivery iFood. El adaptador no es un modelo generativo de propósito general, sino un componente de reordenación (re-ranking) dentro de un pipeline de recomendación: recibe una lista de restaurantes candidatos producida por un modelo primario (LightGBM) junto con el contexto del usuario (ubicación, franja horaria, historial) y refina el orden para maximizar la probabilidad de clic o pedido.

El modelo se distribuye exclusivamente como pesos de adaptador en formato safetensors mediante la librería `peft`, con un tamaño de repositorio de 0,0 GB (solo se publican los tensores del adaptador, no los pesos completos del modelo base). La configuración LoRA declarada es `r=8`, `lora_alpha=16` y `target_modules=["q_proj", "v_proj"]`, aplicada sobre un transformer decoder-only de 1.000 millones de parámetros.

Su relevancia es acotada y de carácter demostrativo: sirve como ejemplo reproducible de cómo integrar un LLM pequeño como capa de re-ranking en un sistema de recomendación con requisitos de latencia estrictos (el autor reporta unos 120 ms adicionales por petición), y de cómo empaquetar dicho ajuste como adaptador PEFT publicable. No cuenta con descargas ni validación externa y está entrenado con datos sintéticos, por lo que debe tratarse como una prueba de concepto y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) con adaptador LoRA sobre `q_proj` y `v_proj` |
| Parametros totales | 1.000 millones (modelo base); el adaptador LoRA no declara recuento propio en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Llama 3.2 1B, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors sin cuantizar) |
| Idiomas soportados | Portugués (`pt`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.2-1B`, un transformer decoder-only de 1.000 millones de parámetros. El ajuste emplea LoRA con rango `r=8`, `lora_alpha=16` y módulos objetivo `q_proj` y `v_proj`, lo que implica que solo se entrenan las matrices de bajo rango asociadas a las proyecciones de query y value de la atención, manteniendo congelados el resto de pesos del modelo base. No se especifica en la documentación disponible si se aplicó alguna técnica adicional de alineación (RLHF, DPO) ni detalles sobre la composición exacta o el volumen de tokens del corpus de entrenamiento.

Los datos de entrenamiento proceden de un simulador de eventos del backend de FoodFlow, con pares de (prompt de contexto, restaurante correcto) que modelan clics y pedidos por franja horaria. El dataset referenciado (`seu-usuario/foodflow-interactions-dataset`) aparece con un identificador de marcador de posición, por lo que no se confirma su publicación efectiva. La evaluación se realizó sobre un 20 % de datos reservados, comparando el orden del baseline LightGBM frente al re-ranking del adaptador mediante NDCG@5.

## Capacidades

- Reordenación de listas de candidatos: recibe un conjunto de restaurantes y devuelve un orden refinado según la probabilidad estimada de pedido.
- Condicionamiento por contexto de usuario: incorpora ubicación, franja horaria e historial en el prompt para personalizar la ordenación.
- Generación de texto condicionada por prompt: al ser un adaptador sobre un modelo causal, produce salida textual (el orden reordenado), no una puntuación numérica directa.
- Integración con pipelines de recomendación de dos etapas: pensado para operar como segunda fase tras un modelo primario de ranking.
- Capacidad multilingüe: limitada al portugués según la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Re-ranking en feeds de delivery: el adaptador se sitúa después del modelo primario LightGBM para reordenar los restaurantes candidatos en función del contexto del usuario, mejorando la personalización del feed con un coste de latencia declarado de unos 120 ms por petición.
- Prueba de concepto de personalización por franja horaria: permite experimentar con la inclusión del turno (desayuno, almuerzo, cena) en la ordenación, ya que el entrenamiento simula clics y pedidos por turno.
- Prototipado de sistemas de recomendación con LLM pequeños: sirve como referencia reproducible para equipos que quieran evaluar si un modelo de 1B con adaptador LoRA aporta ganancia frente a un baseline tabular en su dominio.
- Investigación sobre PEFT aplicado a ranking: el repositorio documenta la configuración LoRA completa (`r`, `alpha`, módulos objetivo), lo que facilita replicar el montaje en otros dominios de recomendación.
- Integración en pipelines MLOps de dos etapas: el adaptador se carga con `peft` y `transformers` sobre el modelo base, lo que permite empaquetarlo como artefacto versionado junto al modelo primario en un flujo de despliegue.
- Evaluación comparativa de métricas de ranking: útil para montar un arnés de evaluación con NDCG@5 que compare baseline y re-ranker sobre conjuntos reservados, como hace el autor con el 20 % de test.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son la métrica NDCG@5 sobre el conjunto de test del proyecto (20 % de los datos), junto con la latencia añadida. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Baseline (LightGBM) | Con LoRA reranker | Variacion |
|---|---|---|---|
| NDCG@5 | 0,72 | 0,79 | +9,7 % |
| Latencia por peticion | No disponible | ~120 ms adicionales | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 3.2 1B en FP16 requiere aproximadamente 2 GB de pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade un coste marginal (del orden de decenas de MB). No se dispone de mediciones publicadas por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo base cabe en GPUs de consumo, pero el adaptador no documenta requisitos propios.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base (1B), aunque no se confirma en la model card.
- Opciones de despliegue: `transformers` + `peft` (único flujo documentado en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: el autor reporta ~120 ms adicionales por petición dentro del SLA de su A/B test; no se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un adaptador LoRA de dominio específico (re-ranking de delivery) sin benchmarks públicos frente a alternativas, por lo que no es posible establecer una comparativa rigurosa con otros re-rankers o adaptadores.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FoodFlow LLM Reranker (LoRA) | 1B (base) | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado con datos sintéticos generados por el simulador del proyecto FoodFlow; el propio autor advierte que en producción sería necesario un fine-tuning con datos reales y conformes con la LGPD.
- Adaptador específico del dominio de delivery de comida; no generaliza a otras tareas de ranking sin reentrenamiento.
- Idiomas soportados limitados al portugués según la model card.
- El dataset referenciado en la model card contiene un identificador de marcador de posición (`seu-usuario/...`), por lo que no se confirma su disponibilidad pública ni la reproducibilidad del entrenamiento.
- La model card contiene marcadores de posición sin sustituir (por ejemplo, en la descripción del modelo base), lo que reduce la fiabilidad de la documentación.
- Riesgo de alucinación inherente al uso de un modelo generativo como re-ranker: la salida es texto generado, no una puntuación calibrada, lo que puede producir ordenaciones inválidas o candidatos fuera de la lista.
- Sin descargas ni validación externa (0 descargas, 1 like en el momento de la consulta); no hay evidencia independiente de las métricas reportadas.
- Licencia Apache 2.0 declarada para el adaptador, pero el uso comercial está sujeto además a los términos del modelo base Llama 3.2, que se rige por la Llama Community License y no por Apache 2.0.

## Enlaces

- Hugging Face: https://huggingface.co/barbosaDev01/foodflow-llm-reranker-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Repositorio del proyecto: https://github.com/gustav0barbosa-dev/FoodFlow
- Dataset referenciado (identificador sin confirmar): `seu-usuario/foodflow-interactions-dataset`
- Librería PEFT: https://github.com/huggingface/peft
