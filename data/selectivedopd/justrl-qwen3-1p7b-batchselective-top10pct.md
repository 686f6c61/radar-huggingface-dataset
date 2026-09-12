# SelectiveDOPD/JustRL-Qwen3-1p7b-BatchSelective-Top10pct

## Resumen

JustRL-Qwen3-1p7b-BatchSelective-Top10pct es un ajuste de razonamiento (reinforcement learning) sobre el modelo base Qwen3-1.7B, publicado por el usuario SelectiveDOPD en HuggingFace. El nombre del repositorio indica que se trata de un experimento de RL denominado internamente `justrl_qwen3_1p7b_JSD_rel_90_100_batch-agg`, dentro de una línea de trabajo llamada BiDirect-OPD, con una variante de seleccion por lotes sobre el 10 % superior de las muestras. El modelo tiene 2.031.739.904 parametros totales (2,03 mil millones), lo que coincide con el recuento de parametros totales de Qwen3-1.7B, donde "1.7B" se refiere a los parametros no de embedding.

El repositorio contiene 15 checkpoints intermedios del entrenamiento (cada 20 pasos, desde `global_step_20` hasta `global_step_300`), siendo `global_step_300` el que ocupa la rama `main`. Esto sugiere un entrenamiento de RL relativamente corto (300 pasos) del que se conservan instantaneas para reproducibilidad y analisis de la curva de aprendizaje. El tamano del repositorio es de 44,7 GB, coherente con almacenar esos 15 checkpoints completos.

La relevancia de la ficha es limitada pero clara: se trata de un modelo pequeno (2B) potencialmente ejecutable en hardware de consumo, orientado a generacion de texto y conversacion, y publicado sin model card tecnica detallada. No hay informacion publica sobre licencia, idiomas, datos de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluacion seria requiere validacion propia por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (inferido del tag `qwen3` y del nombre del modelo; no documentado en la model card) |
| Parametros totales | 2.031.739.904 (2,03 mil millones), medido sobre los pesos safetensors |
| Parametros activos | No aplica: no es un modelo de arquitectura MoE |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-1.7B soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN (dato del modelo base, no confirmado para este ajuste) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible: la model card no incluye campo `license` ni texto de licencia |
| Formato de pesos | safetensors (libreria `transformers`; `pipeline_tag: text-generation`) |
| Tamano del repositorio | 44,7 GB (incluye 15 ramas de checkpoint) |
| Fecha de publicacion | 12 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento mas alla de una linea sobre su origen: "Uploaded from `justrl_qwen3_1p7b_JSD_rel_90_100_batch-agg` in the BiDirect-OPD experiments". Dado el tag `qwen3` y el recuento de parametros, lo mas razonable es asumir que se parte de Qwen3-1.7B, un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU y atencion con sesgo de posicion relativo (RoPE), pero esto no esta confirmado por el autor en la informacion disponible.

Sobre el entrenamiento solo se puede inferir a partir de la nomenclatura del checkpoint de origen. `justrl` apunta a un esquema de reinforcement learning; `JSD_rel_90_100` sugiere el uso de una divergencia Jensen-Shannon relativa en un rango de referencia del 90 al 100 %; `batch-agg` indica agregacion a nivel de lote; y `BatchSelective-Top10pct` apunta a un filtrado o seleccion del 10 % superior de las muestras durante el proceso. El sufijo `BiDirect-OPD` sugiere un esquema bidireccional de on-policy distillation. Ninguno de estos extremos esta documentado en la model card: son inferencias a partir del identificador y no deben tomarse como hechos verificados.

La unica informacion estructural confirmada es la existencia de 15 checkpoints (`global_step_20`, `40`, `60`, `80`, `100`, `120`, `140`, `160`, `180`, `200`, `220`, `240`, `260`, `280`, `300`), con `global_step_300` en `main`. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de SFT, RLHF o DPO previas.

## Capacidades

- Generacion de texto y conversacion multi-turno: el modelo esta etiquetado como `text-generation` y `conversational` en HuggingFace.
- Razonamiento y matemeticas: al derivar de Qwen3-1.7B y haberse sometido a un proceso de RL, es esperable cierta capacidad de razonamiento, aunque no hay evidencia publicada que lo cuantifique.
- Capacidades multilingues: no disponibles. No se declara lista de idiomas ni se referencia la cobertura multilingue del modelo base.
- Tool calling / function calling: no documentado en la model card. Qwen3 introduce soporte de llamadas a herramientas en su plantilla de chat, pero no se confirma que este ajuste lo preserve.
- Modo de razonamiento explicito (thinking mode): no documentado. Qwen3 soporta modos `thinking` y `non-thinking`, pero este ajuste no lo especifica.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision, audio o cualquier otra modalidad: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Experimentacion academica con tecnicas de RL: el repositorio publica 15 checkpoints intermedios de un mismo entrenamiento, lo que permite estudiar la evolucion de las capacidades del modelo paso a paso (por ejemplo, como cambia la tasa de respuestas correctas entre `global_step_20` y `global_step_300`) sin necesidad de reentrenar.
- Evaluacion de metodos de seleccion de datos: dado el sufijo `BatchSelective-Top10pct`, el modelo es un candidato natural para comparar empíricamente el efecto de filtrar el 10 % superior de las muestras frente a entrenar con el lote completo, usando otro checkpoint de la misma familia como linea base.
- Prototipado rapido en local: con 2,03 B de parametros, el modelo puede ejecutarse en una unica GPU de consumo o incluso en CPU, lo que lo hace util para iterar sobre prompts y plantillas de chat sin coste de API.
- Generacion de texto asistida en entornos con recursos limitados: redaccion de borradores, resumenes y reformulacion de textos donde no se requiere estado del arte, sino un coste de inferencia minimo y despliegue on-premise.
- Chatbot de dominio acotado previo ajuste adicional: serviria como punto de partida para un fine-tuning supervisado sobre datos propios, aprovechando que el coste de reentrenar un modelo de 2B es bajo comparado con modelos de 7B o superiores.
- Investigacion sobre destilacion on-policy: si se confirma el componente BiDirect-OPD, el modelo puede usarse como alumno en experimentos de destilacion desde un profesor mayor, comparando curvas de aprendizaje con y sin la componente selectiva.
- Evaluacion de robustez y alucinacion en modelos pequenos: util como sujeto de prueba en baterias de evaluacion de fiabilidad, ya que su tamano permite ejecutar miles de generaciones en poco tiempo y a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, GSM8K, HumanEval, MATH ni de ninguna otra bateria, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos eran articulos de prensa economica sin relacion alguna con el repositorio).

## Requisitos de hardware

Las siguientes estimaciones se derivan del recuento de parametros confirmado (2,03 B) y de las convenciones habituales de despliegue; no proceden de documentacion del autor.

- VRAM para inferencia en bf16/fp16: aproximadamente 4,1 GB solo para pesos, mas cache KV. Con contexto de 8.000 tokens y lote 1, el consumo total ronda los 5-6 GB.
- VRAM para inferencia en fp32: aproximadamente 8,1 GB solo para pesos; no recomendable salvo necesidad de precision completa.
- VRAM con cuantizacion de 8 bits: en torno a 2,2-3 GB.
- VRAM con cuantizacion de 4 bits: en torno a 1,2-1,8 GB.
- GPU de consumo compatibles: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y en tarjetas de 8 GB si se cuantiza. Tambien es viable en GPUs integradas con memoria unificada suficiente, aunque con latencias altas.
- GPU de datacenter: A100, H100, L40S o A10G estan sobredimensionadas para un modelo de este tamano, pero permiten lotes grandes y alto throughput.
- Opciones de despliegue: `transformers` de forma nativa (formato publicado); vLLM y Text Generation Inference (TGI) para servicio con batching continuo; llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles. Como referencia orientativa de la clase de modelos, un 2B en bf16 sobre una RTX 4090 suele generar decenas de tokens por segundo con lote 1, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Tipo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JustRL-Qwen3-1p7b-BatchSelective-Top10pct | 2,03 B | No disponible (base: 32.768 tokens) | RL sobre Qwen3-1.7B | No disponible | HuggingFace, 0 descargas |
| Qwen3-1.7B (modelo base) | 2,03 B | 32.768 tokens (131.072 con YaRN) | Preentrenamiento + post-entrenamiento | Apache 2.0 (segun el modelo base) | Ampliamente disponible |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | SFT + RLHF | Llama 3.2 Community License | Ampliamente disponible |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | SFT + DPO | Apache 2.0 | Ampliamente disponible |

La comparacion es estructural: no hay datos de rendimiento publicados para el modelo objeto de esta ficha, por lo que no es posible establecer una comparacion cuantitativa de calidad con las alternativas. La principal desventaja frente a Qwen3-1.7B, Llama 3.2 1B o SmolLM2-1.7B es la ausencia de licencia declarada, model card tecnica y cuantizaciones publicadas, lo que complica su adopcion en produccion.

## Limitaciones y advertencias

- Ausencia total de licencia: la model card no incluye campo `license` ni texto legal. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion, y el modelo no deberia desplegarse en produccion sin contactar previamente con el autor.
- Model card practicamente vacia: no se documentan datos de entrenamiento, composicion del dataset, idiomas, hiperparametros ni metodologia de evaluacion. La reproducibilidad es nula.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual. En modelos de 2B el riesgo de inventar datos es estructuralmente alto, especialmente en dominios especializados.
- Sesgos desconocidos: al no documentarse la procedencia del dataset de RL, no es posible evaluar sesgos de genero, raza, religion o ideologia. Se recomienda auditoria propia antes de cualquier uso con usuarios finales.
- Cobertura idiomatica incierta: no se declara ningun idioma. Aunque el modelo base Qwen3 tiene una cobertura multilingue amplia, no se confirma que este ajuste la preserve, y el proceso de RL pudo haberla degradado.
- Contexto no verificado: no se confirma que la ventana de contexto del modelo base (32.768 tokens) se mantenga intacta tras el ajuste. Ajustes con RL prolongado pueden alterar el comportamiento en contextos largos.
- Modelo de investigacion, no de produccion: con 0 descargas y 0 likes en el momento de la consulta, no existe validacion por parte de la comunidad. El repositorio parece ser un artefacto de experimentacion interna.
- Pesos duplicados por ramas: el repositorio ocupa 44,7 GB debido a los 15 checkpoints. Descargar solo `main` reduce el coste, pero conviene revisar el uso de `revision` en `transformers` para evitar descargas innecesarias.
- Sin cuantizaciones oficiales: no hay versiones GGUF, AWQ o GPTQ publicadas, lo que obliga a convertir los pesos manualmente si se quiere ejecutar en llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-BatchSelective-Top10pct
- Rama principal (checkpoint `global_step_300`): https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-BatchSelective-Top10pct/tree/main
- Ramas de checkpoints anteriores: `global_step_20`, `global_step_40`, `global_step_60`, `global_step_80`, `global_step_100`, `global_step_120`, `global_step_140`, `global_step_160`, `global_step_180`, `global_step_200`, `global_step_220`, `global_step_240`, `global_step_260`, `global_step_280`, accesibles como revisiones del mismo repositorio.
- Modelo base inferido (no confirmado en la model card): https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog, repositorio de codigo o demo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con los experimentos BiDirect-OPD o JustRL.
