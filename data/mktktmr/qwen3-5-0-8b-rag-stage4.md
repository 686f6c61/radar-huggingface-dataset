# mktktmr/qwen3.5-0.8b-rag-stage4

## Resumen

mktktmr/qwen3.5-0.8b-rag-stage4 es un ajuste fino por LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario mktktmr y publicado en Hugging Face. El modelo resultante se ha fusionado con los pesos del modelo base (merge de LoRA), por lo que se distribuye como un checkpoint completo de aproximadamente 853 millones de parametros en formato safetensors. La nomenclatura "rag-stage4" y el contenido de la model card sugieren que forma parte de una serie de etapas de entrenamiento orientadas a tareas de generacion aumentada por recuperacion (RAG) sobre corpus en japones.

El problema que aborda es el ajuste de un modelo pequeno (sub-1000M de parametros) para responder preguntas a partir de contexto recuperado, empleando exclusivamente conjuntos de datos japoneses de control de calidad: JEMHopQA (preguntas multi-salto), NIILC QA (preguntas y respuestas de la Biblioteca Nacional de Informatica de Japon), JSQuAD de JGLUE (comprension lectora extractiva) y fragmentos de Wikipedia en japones. Esto lo hace relevante para quienes necesitan un modelo ligero, desplegable en hardware modesto, especializado en QA sobre documentos japoneses.

La informacion publica es muy escasa: no se especifican licencia, idiomas declarados, pipeline ni resultados de evaluacion. La model card esta redactada en japones y solo documenta el modelo base, la tecnica de ajuste (LoRA con merge) y las fuentes de datos de entrenamiento con sus licencias. Cualquier dato no presente en esa informacion se marca en esta ficha como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-0.8B; tag de libreria: qwen3_5) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (los datos de entrenamiento son en japones, pero el autor no declara idiomas) |
| Licencia | no disponible (el modelo base Qwen/Qwen3.5-0.8B se cita como Apache-2.0 en la model card) |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 853 millones de parametros segun los pesos publicados. Sobre esa base se aplico un ajuste fino con LoRA (Low-Rank Adaptation) que posteriormente se fusiono en los pesos del modelo ("本体にマージしたもの", es decir, "fusionado en el cuerpo del modelo"). No se detallan en la model card el rango de LoRA, la tasa de aprendizaje, el numero de pasos, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifica la longitud de contexto utilizada durante el entrenamiento ni el numero total de tokens vistos.

Los datos de entrenamiento declarados son cuatro fuentes japonesas, todas bajo licencia CC BY-SA 4.0 y modificadas (filtradas y reformateadas para el entrenamiento): JEMHopQA para preguntas multi-salto, NIILC QA para pares pregunta-respuesta, JSQuAD de JGLUE para comprension lectora extractiva y un conjunto de fragmentos ("配布チャンク集合") derivado de Wikipedia en japones. El nombre "rag-stage4" indica que se trata de la cuarta etapa de un pipeline de entrenamiento orientado a RAG, aunque no se documentan las etapas previas ni los criterios de seleccion de datos.

## Capacidades

- Generacion de texto y respuesta a preguntas en japones, entrenado especificamente sobre corpus de QA japoneses (JEMHopQA, NIILC QA, JSQuAD).
- Razonamiento multi-salto sobre contexto recuperado, dado el uso de JEMHopQA, un dataset de preguntas que requieren encadenar varios hechos.
- Comprension lectora extractiva, derivada del ajuste sobre JSQuAD.
- Respuesta basada en fragmentos de Wikipedia en japones, lo que sugiere cierta capacidad de grounding sobre pasajes documentales.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso general: no disponible (no declarado).
- Capacidades multilingues: no disponible (no declaradas; el entrenamiento documentado es solo en japones).
- Capacidades especiales (vision, audio, thinking mode): no disponible (no declaradas).

## Casos de uso

- Atencion al cliente en japones sobre base documental: el modelo puede integrarse en un pipeline RAG que recupere pasajes de manuales o FAQ y genere respuestas citando el contexto, aprovechando su ajuste sobre NIILC QA y fragmentos de Wikipedia.
- Busqueda semantica con respuesta generativa (RAG) en corpus japoneses: dado su entrenamiento sobre chunks de Wikipedia, es adecuado para responder preguntas sobre articulos enciclopedicos recuperados por un retriever.
- Preguntas multi-salto en dominios documentales: el ajuste sobre JEMHopQA lo hace util para consultas que requieren combinar informacion de varios pasajes, como resumenes de expedientes o informes.
- Extraccion de respuestas en formularios y documentos: su entrenamiento en comprension lectora extractiva (JSQuAD) permite localizar y extraer fragmentos relevantes de contratos o normativas en japones.
- Despliegue en entornos con recursos limitados: con 853 millones de parametros y 1,7 GB en safetensors, puede ejecutarse en una unica GPU consumer o incluso en CPU con cuantizacion, lo que lo hace viable para prototipos locales.
- Evaluacion y experimentacion academica: sirve como punto de partida reproducible para estudiar el efecto del ajuste LoRA por etapas en tareas de QA japonesas, al estar publicado el checkpoint fusionado.
- Clasificacion y enrutamiento de consultas en japones: puede usarse como modelo auxiliar para decidir si una consulta requiere recuperacion documental o respuesta directa dentro de un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 4-6 GB de VRAM para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque no se publican versiones GGUF ni cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). En GPUs de gama alta el modelo queda limitado por latencia, no por memoria.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas con 6 GB o mas; tambien es viable en CPU con cuantizacion.
- Opciones de despliegue: transformers (carga directa desde safetensors), vLLM, TGI y llama.cpp/Ollama solo si se generan conversiones GGUF (no publicadas). El tag de libreria qwen3_5 indica soporte en el ecosistema transformers reciente.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage4 | 852.985.920 | no disponible | no disponible | Ajuste LoRA fusionado para QA/RAG en japones |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache-2.0 (segun la model card) | Modelo generalista sin ajuste especifico de QA japones |
| Otros modelos japoneses de tamano similar (p. ej. variantes de 1B) | ~1B | no disponible | variable | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible porque no se publican benchmarks ni metricas de evaluacion del modelo ajustado.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: aunque el modelo base se cita como Apache-2.0, la licencia del checkpoint ajustado no se especifica, lo que genera incertidumbre para uso comercial.
- Los datos de entrenamiento estan bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual sobre obras derivadas; conviene revisar la compatibilidad con el uso previsto.
- El entrenamiento documentado es exclusivamente en japones; no hay garantia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion inherente a modelos de ~0,8B, especialmente en preguntas multi-salto o cuando el contexto recuperado es insuficiente.
- No se publican evaluaciones, por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- Sin informacion sobre sesgos, filtrado de datos o alineacion; el ajuste se limita a QA japones y puede degradar capacidades generales del modelo base.
- No se ofrecen versiones cuantizadas ni GGUF, lo que limita el despliegue en entornos sin GPU o con herramientas tipo llama.cpp.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la model card esta solo en japones, lo que reduce la trazabilidad y el soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JGLUE / JSQuAD: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
