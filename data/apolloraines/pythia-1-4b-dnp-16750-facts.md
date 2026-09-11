# ApolloRaines/Pythia-1.4B-DNP-16750-Facts

## Resumen

Pythia-1.4B-DNP-16750-Facts es un modelo experimental de generación de texto en inglés publicado por el usuario ApolloRaines sobre la arquitectura EleutherAI/pythia-1.4b (transformer decoder-only de la familia GPT-NeoX, 1.414.647.808 parámetros). Su particularidad no es el entrenamiento clásico, sino que se le han insertado 16.750 hechos factuales directamente en los pesos mediante Direct Neural Programming (DNP), una técnica de jBlaze que no utiliza descenso de gradiente.

El objetivo declarado es un test de estrés de capacidad: comprobar cuánta información factual puede absorber un modelo de 1,4 B de parámetros antes de degradarse. Según la model card, el modelo sobrevive con una caída de 5 puntos porcentuales en capacidad general (60,0 % → 55,0 %), un aumento de perplejidad de 13,3 a 18,3 y un recall directo del 49,8 % (49,3 % por paráfrasis).

Es relevante ahora porque plantea una alternativa a la edición de conocimiento mediante fine-tuning: el autor afirma que el entrenamiento por gradiente destruía la misma arquitectura con 50 hechos (LoRA v1) o 125 hechos (LoRA v2), mientras que DNP habría cargado 335 veces más hechos manteniendo el modelo funcional. Los datos son autoinformados y no consta verificación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-NeoX (etiqueta `gpt_neox`); denso, no MoE |
| Parámetros totales | 1.414.647.808 (≈1,4 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens, heredada del modelo base EleutherAI/pythia-1.4b; la model card no documenta modificaciones |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors (2,8 GB de repo, consistente con fp16). No hay GGUF ni GPTQ/AWQ publicados |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors |
| Modelo base | EleutherAI/pythia-1.4b |
| Pipeline | text-generation |
| Librería | transformers |
| Fecha de publicación | 10 de septiembre de 2026 (última actualización: 10 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |
| Corpus incluido | `facts_maxout.json` en el propio repositorio |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo GPT-NeoX con 1,4 B de parámetros, entrenado originalmente por EleutherAI sobre The Pile. Este repositorio no modifica la topología ni el tokenizador, sino que interviene sobre los pesos ya entrenados.

El método empleado es Direct Neural Programming (DNP) de jBlaze: los hechos se escriben directamente en los pesos en lugar de aprenderse por descenso de gradiente. Los hechos provienen de CounterFact-Tracing, con tipos de relación de Wikidata (ubicaciones, ciudadanías, idiomas, géneros, entre otros). La carga se realiza por cohortes (lotes), de modo que las cohortes iniciales se sobrescriben parcialmente cuando las nuevas compiten por la misma capacidad de pesos; el autor lo describe como comportamiento esperado y aporta una tabla de recall por cohorte. No se documentan fases de RLHF, DPO ni ajuste por instrucciones, ni se especifica el número de tokens de entrenamiento (el procedimiento no es de entrenamiento basado en tokens, sino de escritura directa sobre pesos).

## Capacidades

- Generación de texto en inglés con coherencia mantenida según el autor (perplejidad 18,3 tras la inyección).
- Recuperación de hechos inyectados: 49,8 % en recall directo y 49,3 % en recall por paráfrasis sobre los 16.750 hechos cargados.
- Conocimiento distribuido por cohortes: el recall no se concentra en el último lote cargado (54,0 %, 50,0 %, 56,0 %, 60,0 % y 46,0 % en las cinco primeras cohortes medidas).
- Razonamiento y capacidad general preservados parcialmente: 55,0 % frente al 60,0 % de la línea base, según la medición del autor.
- Compatibilidad declarada con text-generation-inference y con endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente como inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles, no documentadas.

## Casos de uso

- Investigación en edición de conocimiento: el modelo sirve como banco de pruebas para comparar DNP frente a fine-tuning por gradiente (LoRA) en una arquitectura de 1,4 B, con métricas de recall y perplejidad publicadas por cohortes.
- Estudio del olvido catastrófico: permite analizar hasta qué punto un modelo pequeño retiene hechos antiguos cuando se le inyectan nuevos, usando la tabla de recall por cohortes como referencia.
- Evaluación de técnicas de desaprendizaje (machine unlearning): al conocer exactamente qué hechos se inyectaron y en qué cohorte, se puede medir si un método de borrado elimina selectivamente un subconjunto del corpus `facts_maxout.json`.
- Interpretabilidad y localización de hechos: dado que los hechos se escriben en pesos concretos, es un sujeto útil para estudiar en qué capas o matrices queda almacenada la información factual en un modelo denso de 1,4 B.
- Generación de texto en inglés de bajo coste: con 1,4 B de parámetros y pesos fp16 de 2,8 GB, puede desplegarse en una GPU de gama media o en CPU para tareas de completado de texto sin requisitos de infraestructura elevados.
- Auditoría de calidad de datos sintéticos: el corpus de hechos derivado de CounterFact-Tracing y Wikidata puede usarse para medir la fidelidad de la inyección frente a la fuente original.
- Reproducibilidad metodológica: al incluir el corpus completo en el repositorio, terceros pueden replicar el experimento y contrastar las cifras autoinformadas por el autor.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el propio autor en la model card. No se especifica qué benchmark se usó para la métrica "General Capability", ni la metodología de medición del recall.

Rendimiento declarado, línea base frente a modelo final:

| Métrica | Base (0 hechos) | Tras 16.750 hechos |
|---|---:|---:|
| Capacidad general | 60,0 % | 55,0 % |
| Perplejidad | 13,3 | 18,3 |
| Recall directo | — | 49,8 % |
| Recall por paráfrasis | — | 49,3 % |

Comparativa de métodos declarada por el autor:

| Método | Hechos | Capacidad general | Perplejidad | Estado del modelo |
|---|---:|---:|---:|---|
| Gradiente (LoRA v1) | 50 | 10,0 % | 459,6 | Colapsado |
| Gradiente (LoRA v2) | 125 | 35,0 % | 96,5 | Colapsado |
| DNP | 5.000 | 70,0 % | 13,3 | Funcional |
| DNP (este modelo) | 16.750 | 55,0 % | 18,3 | Funcional |

Recall por cohorte (las cinco primeras cohortes medidas, hasta el hecho 3.000):

| Cohorte | Recall |
|---|---:|
| 1-1.000 | 54,0 % |
| 1.001-1.500 | 50,0 % |
| 1.501-2.000 | 56,0 % |
| 2.001-2.500 | 60,0 % |
| 2.501-3.000 | 46,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otros) en la información disponible. El autor deriva una ratio de aproximadamente un hecho recuperable por cada 170.000 parámetros.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 4-6 GB contando pesos (2,8 GB), caché KV y overhead del runtime.
- VRAM estimada en int8: aproximadamente 1,5-2 GB; en 4 bits, alrededor de 1-1,5 GB, aunque estas cuantizaciones no están publicadas y habría que generarlas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 2070, etc.). No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas modernas con 6-8 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: transformers (ejemplo oficial en la model card), text-generation-inference (etiqueta declarada), vLLM y HuggingFace Endpoints (etiqueta `endpoints_compatible`). Para llama.cpp u Ollama sería necesaria una conversión a GGUF propia, ya que no se publica.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se han encontrado en la búsqueda web datos de benchmarks de terceros que permitan comparar este modelo con alternativas externas de tamaño similar. La comparación posible se limita a la propia familia de modelos del autor y al modelo base.

| Modelo | Parámetros | Contexto | Hechos inyectados | Capacidad general | Perplejidad | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Pythia-1.4B-DNP-16750-Facts | 1,4 B | 2048 | 16.750 | 55,0 % | 18,3 | No disponible |
| Pythia-1.4B-DNP-5000-Facts | 1,4 B | 2048 | 5.000 | 70,0 % | 13,3 | No disponible |
| Pythia-1.4b-Knowledge-Implant | 1,4 B | 2048 | 198 | No disponible | No disponible | No disponible |
| EleutherAI/pythia-1.4b (base) | 1,4 B | 2048 | 0 | 60,0 % | 13,3 | Apache 2.0 (según el modelo base) |

## Limitaciones y advertencias

- Licencia no disponible: al no especificarse licencia en el repositorio, no puede asumirse uso comercial permitido, aunque el modelo base Pythia se publique bajo Apache 2.0.
- Métricas autoinformadas: todas las cifras proceden de la model card del autor y no consta verificación independiente. No se especifica la metodología del "General Capability" ni el conjunto de evaluación.
- Recall incompleto: aproximadamente la mitad de los hechos inyectados no se recuperan de forma fiable (49,8 % directo, 49,3 % por paráfrasis). En el 50 % restante el modelo puede producir respuestas incorrectas con fluidez.
- Olvido entre cohortes: las cohortes antiguas se sobrescriben parcialmente; el recall medido oscila entre el 46,0 % y el 60,0 %, lo que implica pérdida de conocimiento a medida que se añaden hechos.
- Degradación medible: la perplejidad sube de 13,3 a 18,3 y la capacidad general cae 5 puntos, lo que indica pérdida de fluidez y de competencia general respecto al modelo base.
- Solo inglés: no hay capacidades multilingües documentadas.
- Ventana de contexto limitada a 2048 tokens, heredada del modelo base, lo que restringe tareas de documento largo.
- Sin evaluación de sesgos: no se documenta ningún análisis de sesgo, toxicidad o seguridad, pese a que el modelo base se entrenó sobre The Pile.
- Riesgo de alucinación: al ser un modelo base sin ajuste por instrucciones ni RLHF/DPO, no está alineado para seguir instrucciones ni para rechazar peticiones problemáticas.
- Escasa validación externa: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.
- Sin cuantizaciones publicadas (GGUF, GPTQ, AWQ): el despliegue en entornos de bajo consumo exige trabajo adicional de conversión.
- Naturaleza experimental: está concebido como test de estrés de capacidad, no como modelo listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Pythia-1.4B-DNP-16750-Facts
- Versión de 5.000 hechos: https://huggingface.co/ApolloRaines/Pythia-1.4B-DNP-5000-Facts
- Versión original de 198 hechos (Knowledge Implant): https://huggingface.co/ApolloRaines/Pythia-1.4b-Knowledge-Implant
- Modelo de razonamiento sobre la misma arquitectura: https://huggingface.co/ApolloRaines/Pythia-1.4B-jBlaze-Reasoning
- Tecnología jBlaze (Direct Neural Programming): https://jblaze.dev
- Modelo base EleutherAI/pythia-1.4b: https://huggingface.co/EleutherAI/pythia-1.4b
- CounterFact-Tracing: mencionado en la model card como origen de los hechos, sin enlace proporcionado.
- La búsqueda web realizada no devolvió enlaces adicionales relevantes sobre este modelo.
