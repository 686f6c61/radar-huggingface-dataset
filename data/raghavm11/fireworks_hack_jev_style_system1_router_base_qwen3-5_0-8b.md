# RaghavM11/Fireworks_Hack_JEV_Style_System1_router_base_qwen3.5_0.8B

## Resumen

El System-1 Router es un modelo compacto especializado en enrutamiento de consultas (LLM routing) construido sobre el backbone congelado de Qwen/Qwen3.5-0.8B. Lo publica el usuario RaghavM11 en HuggingFace, con un tamano de repositorio de 0,1 GB y licencia Apache 2.0. Su funcion no es generar texto, sino decidir en un unico forward pass cual de 18 modelos candidatos deberia responder a una consulta dada, seleccionando la opcion con mayor puntuacion.

El modelo se entrena contra etiquetas de oraculo contrafactuales del benchmark xRouteBench (variante `llmrouter_generic`). Combina un adaptador LoRA sobre las capas lineales del modelo de lenguaje (r=16, alpha=32) con una cabeza de eleccion (`ChoiceHead`, anchura 128, 4 cabezas de atencion, 2 capas conjuntas) que puntua cada candidato. El backbone y el adaptador codifican la consulta y la cabeza produce el ranking de opciones.

Su relevancia reside en que aborda el problema del enrutamiento multi-modelo con una latencia de decision de 201,2 ms por consulta en modo batched y una tasa de coincidencia exacta con el oraculo del 0,730 en el conjunto de test reservado, frente al 0,00 de una linea base generativa. Esto lo hace interesante para sistemas que orquestan varios LLM y necesitan decidir rapidamente cual invocar sin coste de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-0.8B congelado) + adaptador LoRA + cabeza de eleccion ChoiceHead |
| Parametros totales | No disponible (backbone de 0,8B congelado; solo se entrenan adaptador LoRA y cabeza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone), PEFT (adaptador LoRA), state_dict de PyTorch (`head.pt`) |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone transformer Qwen/Qwen3.5-0.8B que permanece congelado durante el entrenamiento. Sobre el se aplica un adaptador LoRA con rango 16 y alpha 32 en las capas lineales del modelo de lenguaje, que adapta la representacion de la consulta al espacio de enrutamiento. La salida del backbone y el adaptador alimenta una `ChoiceHead` (anchura 128, 4 cabezas de atencion, 2 capas conjuntas) que puntua las 18 opciones candidatas y selecciona la de mayor puntuacion en un unico forward pass.

El entrenamiento se realiza contra etiquetas de oraculo contrafactuales generadas a partir de xRouteBench (`llmrouter_generic`), lo que permite al modelo aprender que candidato habria producido la mejor respuesta para cada consulta. El repositorio incluye un `manifest.json` con la configuracion de entrenamiento completa, hiperparametros y metricas. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Enrutamiento de consultas: selecciona uno de 18 modelos candidatos en un unico forward pass.
- Decision de baja latencia: 201,2 ms por consulta en modo batched.
- Coincidencia con oraculo: 0,730 de coincidencia exacta y 0,795 de acierto dentro del conjunto aceptable en test reservado.
- Codificacion de consultas en ingles mediante el backbone Qwen3.5-0.8B adaptado con LoRA.
- Puntuacion de candidatos mediante cabeza de eleccion con atencion multi-cabeza.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un clasificador de enrutamiento.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Orquestacion multi-LLM en produccion: el router decide que modelo de un pool de 18 candidatos debe atender cada consulta, reduciendo el coste de invocar un modelo grande cuando uno pequeno es suficiente. Su latencia de 201,2 ms es compatible con pipelines de atencion en tiempo real.
- Enrutamiento por coste y calidad: en sistemas que combinan modelos de distintos tamanos y precios, el router aprende a asignar consultas simples a modelos economicos y consultas complejas a modelos grandes, optimizando el coste por consulta.
- Puerta de entrada en sistemas RAG: antes de recuperar documentos y generar, el router selecciona el modelo generador adecuado segun la naturaleza de la consulta, evitando cargar modelos innecesarios.
- Enrutamiento por especialidad: si el pool de candidatos incluye modelos especializados en codigo, matematicas o texto general, el router asigna cada consulta al especialista mas probable segun las etiquetas de oraculo de xRouteBench.
- Evaluacion de pools de modelos: el router sirve como herramienta de diagnostico para medir que modelos de un pool cubren mejor las consultas reales de una organizacion, comparando la seleccion del router con el oraculo.
- Despliegue en entornos con recursos limitados: al ocupar 0,1 GB en repositorio y apoyarse en un backbone de 0,8B, puede ejecutarse en GPU de consumo o incluso CPU para tareas de enrutamiento por lotes, sin necesidad de infraestructura de gran escala.
- Investigacion en routing: reproducible mediante `load_release` y el `manifest.json`, permite comparar estrategias de enrutamiento contra el oraculo de xRouteBench en experimentos academicos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Coincidencia exacta con oraculo (test reservado) | 0,730 |
| Acierto dentro del conjunto aceptable (test reservado) | 0,795 |
| Latencia de decision (batched) | 201,2 ms/consulta |
| Linea base generativa (coincidencia exacta) | 0,00 |
| Linea base generativa (acierto aceptable) | 0,00 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es generativo sino un clasificador de enrutamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un backbone de 0,8B con adaptador LoRA y cabeza ligera, la huella es reducida y compatible con GPU de consumo.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cabe en RTX 3060, RTX 4090 y similares, asi como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: si, dado el tamano del backbone (0,8B) y el repositorio de 0,1 GB.
- Opciones de despliegue: la model card indica carga mediante `router.eval_router.load_release` con el entorno `route_f`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 201,2 ms por consulta en modo batched segun la model card; throughput no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de enrutamiento en la documentacion proporcionada. La model card unicamente compara contra una linea base generativa interna (0,00 de coincidencia con oraculo), sin identificar el modelo concreto empleado. No disponible para una comparativa con alternativas publicas.

## Limitaciones y advertencias

- El modelo solo soporta ingles; las consultas en otros idiomas pueden degradar la calidad del enrutamiento.
- Es un clasificador de enrutamiento, no un modelo generativo: no produce respuestas, solo selecciona candidatos.
- El pool de candidatos esta fijado a 18 modelos concretos; cambiar el pool requiere reentrenamiento o adaptacion.
- La coincidencia exacta con el oraculo es del 0,730, por lo que aproximadamente un 27% de las decisiones no coinciden exactamente con la eleccion optima.
- No se documentan sesgos conocidos, riesgos de alucinacion ni evaluaciones de robustez fuera del benchmark xRouteBench.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las licencias del backbone base Qwen3.5-0.8B y de los 18 modelos candidatos antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-02), lo que sugiere que no ha pasado por validacion comunitaria.
- No se dispone de informacion sobre el contexto maximo soportado, lo que limita la planificacion de despliegues con consultas muy largas.

## Enlaces

- HuggingFace: https://huggingface.co/RaghavM11/Fireworks_Hack_JEV_Style_System1_router_base_qwen3.5_0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Benchmark xRouteBench: no disponible (referenciado en la model card sin enlace directo)
- Repositorio de codigo (`router.eval_router`, entorno `route_f`): no disponible (referenciado en la model card sin enlace directo)
