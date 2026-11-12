# antalvdb/olifant-hf

## Resumen

Olifant es un modelo de lenguaje basado en memoria desarrollado por Antal van den Bosch y colaboradores (Radboud University y Tilburg University), que utiliza TiMBL (Tilburg Memory-Based Learner) en lugar de una red neuronal. En lugar de aprender pesos distribuidos, almacena las instancias de entrenamiento en una base indexada y predice mediante k-vecinos más cercanos (k-NN). El modelo se presenta como una alternativa explicable y de bajo coste computacional a los LLM neuronales.

La relevancia de Olifant no reside en su calidad generativa, sino en su propuesta metodológica: demuestra que un modelo de lenguaje causal puede construirse sin GPU, sin pesos neuronales y con trazabilidad completa de cada predicción. Además, el autor propone su uso como modelo borrador (draft model) en decodificación especulativa para acelerar LLM neuronales grandes, lo que lo convierte en una pieza auxiliar interesante en pipelines de inferencia.

El modelo aquí descrito (`antalvdb/olifant-hf`) es una configuración pequeña: ventana de contexto de 4 tokens, entrenado sobre 100K líneas (24M tokens) del subconjunto EduFineWeb, con tokenizador GPT-2. No debe confundirse con el modelo conversacional más grande del mismo autor (`olifant-edufineweb-chatbot`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Memory-based learning con TiMBL (algoritmo TRIBL2); árbol de decisión con nodos, no red neuronal |
| Parametros totales | No aplica; el modelo no tiene parametros, tiene nodos en una instance base (.ibase) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4 tokens (configuracion l4r0) |
| Tipos de cuantizacion | No disponible (no aplica a modelos basados en memoria) |
| Idiomas soportados | Ingles (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | Archivos `.ibase` (instance base de TiMBL); repo de 0.2 GB |

## Arquitectura y entrenamiento

Olifant no es un transformer ni un modelo neuronal. Su estructura es un árbol de decisión construido sobre una base de instancias indexada, gestionada por TiMBL mediante el algoritmo TRIBL2. En entrenamiento, todos los n-gramas del corpus se almacenan como instancias; en inferencia, el modelo busca los k-vecinos más cercanos al contexto de entrada y devuelve una distribución de probabilidad basada en las etiquetas de clase de esos vecinos. Esta aproximación permite inspeccionar exactamente qué ejemplos de entrenamiento influyeron en cada predicción, lo que constituye su principal innovación: explicabilidad total a nivel de instancia.

Los datos de entrenamiento provienen de un subconjunto de EduFineWeb: 100K líneas, aproximadamente 24M tokens. El tokenizador es el de GPT-2 (50.257 tokens). No se reporta uso de RLHF, DPO ni ajuste por preferencias, dado que el paradigma no lo contempla. La innovación técnica destacable, más allá del propio enfoque memory-based, es su uso propuesto como modelo borrador en decodificación especulativa: Olifant genera unos pocos tokens en CPU y un LLM grande los verifica en una sola pasada, descrito en el trabajo *Towards Green Text Generation: Memory-Based Speculative Decoding* (INLG 2026).

## Capacidades

- Generación de texto causal autoregresiva a nivel de n-grama, limitada a contextos de 4 tokens.
- Predicción totalmente explicable: cada salida puede rastrearse hasta las instancias de entrenamiento que la originaron.
- Inferencia exclusivamente en CPU, sin necesidad de GPU.
- Integración con la API estándar de `transformers` (`AutoModelForCausalLM`) mediante `trust_remote_code=True`.
- Uso como modelo borrador en decodificación especulativa (con tokenizador Mistral-7B en la variante `olifant-speculative-ibases`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en explicabilidad de modelos de lenguaje: permite inspeccionar qué instancias de entrenamiento influyen en cada predicción, útil para estudiar el comportamiento de modelos generativos desde una perspectiva transparente.
- Docencia y divulgación: sirve para ilustrar el funcionamiento de un modelo de lenguaje sin caja negra, mostrando el mecanismo k-NN sobre n-gramas en un entorno reproducible en CPU.
- Decodificación especulativa en producción: como draft model en CPU, acelera la generación de un LLM grande (por ejemplo Mistral-7B) verificando sus propuestas en una sola pasada del modelo grande, reduciendo coste energético.
- Entornos con restricciones de hardware: despliegue en servidores sin GPU o en dispositivos de bajos recursos donde un transformer no es viable.
- Experimentación con modelos de lenguaje de bajo consumo energético: útil en proyectos que priorizan la huella de CO2 sobre la calidad generativa.
- Benchmarking de métodos memory-based frente a neuronales: base para comparar paradigmas en tareas de modelado de lenguaje a pequeña escala.
- Generación de texto exploratoria en dominios muy acotados donde un contexto de 4 tokens sea suficiente (por ejemplo, completado de n-gramas en corpus específicos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB; el modelo funciona íntegramente en CPU.
- GPU recomendadas: ninguna; no requiere GPU.
- Cabe en cualquier consumer GPU (no aplica) y en cualquier CPU moderna; el repo ocupa 0.2 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, más el paquete `olifant` (`pip install olifant`) y el binario TiMBL (`apt install timbl` en Debian/Ubuntu, `apk add timbl` en Alpine, `brew install timbl` en macOS).
- Latencia y throughput: no disponibles en la información proporcionada; por diseño, la inferencia es en CPU y la búsqueda k-NN escala con el tamaño de la instance base.

## Comparativa con modelos similares

| Modelo | Paradigma | Contexto | Parametros | Licencia | Hardware |
|---|---|---|---|---|---|
| Olifant (`antalvdb/olifant-hf`) | Memory-based (TiMBL, k-NN) | 4 tokens | No aplica (nodos) | GPL-3.0 | CPU |
| GPT-2 small | Transformer | 1.024 tokens | 124M | MIT | GPU/CPU |
| Olifant chatbot (`antalvdb/olifant-edufineweb-chatbot`) | Memory-based (TiMBL) | No disponible | No aplica (nodos) | No disponible | CPU |

La comparación con modelos neuronales no es directa: Olifant no compite en calidad generativa con transformers del mismo orden de magnitud, sino que propone un paradigma alternativo centrado en explicabilidad y eficiencia energética. Frente al chatbot del mismo autor, esta variante es más pequeña y orientada a decodificación especulativa.

## Limitaciones y advertencias

- Contexto extremadamente corto (4 tokens), lo que limita severamente la coherencia y utilidad de la generación.
- Solo inglés; no soporta otros idiomas.
- Calidad generativa muy inferior a la de modelos neuronales, incluso pequeños.
- Riesgo de alucinación y de generación incoherente por la naturaleza n-grama del modelo.
- Licencia GPL-3.0: impone obligaciones de copyleft que pueden ser incompatibles con uso comercial propietario; revisar antes de integrar en productos cerrados.
- Requiere `trust_remote_code=True` y dependencias externas (paquete `olifant` y binario TiMBL), lo que añade fricción de despliegue.
- No apto para tareas de razonamiento, código, matemáticas, tool calling ni agentes.
- El tamaño de la instance base crece con los datos de entrenamiento, lo que puede afectar a la latencia en bases grandes.
- Sesgos: no documentados en la información disponible; al entrenarse sobre EduFineWeb, puede heredar sesgos del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/antalvdb/olifant-hf
- Modelo conversacional relacionado: https://huggingface.co/antalvdb/olifant-edufineweb-chatbot
- Modelos para decodificación especulativa: https://huggingface.co/antalvdb/olifant-speculative-ibases
- Paper (arXiv): https://arxiv.org/abs/2510.22317
- TiMBL: https://languagemachines.github.io/timbl/
- Demo de explicabilidad: https://huggingface.co/spaces/antalvdb/olifant-explainability-demo
- Demo de generación autoregresiva: https://huggingface.co/spaces/antalvdb/olifant-generate-server
