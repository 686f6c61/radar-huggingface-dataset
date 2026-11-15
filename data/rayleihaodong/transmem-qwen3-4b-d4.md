# Rayleihaodong/TransMem-qwen3-4B-D4

## Resumen

TransMem-qwen3-4B-D4 es un checkpoint de modulo de memoria del proyecto TransMem, presentado en el articulo "TransMem: Transforming Hidden States into Memory for Large Language Models". No es un modelo de lenguaje autonomo, sino un conjunto de modulos auxiliares entrenados sobre el backbone congelado Qwen/Qwen3-4B-Instruct-2507 para mejorar el razonamiento sobre contextos largos. Lo desarrolla Rayleihaodong (Haodong Lei) como material de investigacion asociado a una publicacion en OpenReview y arXiv.

La propuesta tecnica consiste en reutilizar estados ocultos dispersos calculados a partir de un contexto largo como memoria. Durante la decodificacion de la respuesta, cuatro modulos de memoria independientes transforman esos estados en actualizaciones residuales que se inyectan en las capas 32 a 35 del backbone, con una puerta dinamica dependiente del token que regula cada actualizacion. El backbone permanece congelado y solo se entrenan los modulos anadidos, un 10,69% de parametros adicionales sobre los 4.022 M del modelo base.

Su relevancia es acotada y experimental: aporta un mecanismo de memoria ligero para tareas de QA multi-salto y dialogos de largo recorrido, con mejoras reportadas en LoCoMo, HotpotQA y MemoryAgentBench. El repositorio tiene 0 descargas y 1 like, y el propio autor advierte que no puede cargarse con `AutoModelForCausalLM.from_pretrained` de forma aislada: requiere el backbone por separado y el codigo nativo de TransMem.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone congelado Qwen3-4B-Instruct-2507 mas un modulo de memoria Transformer de una capa por capa de inyeccion (4 modulos, profundidad D=4, capas 32-35) |
| Parametros totales | 4.022,468 M del backbone + 429,958 M anadidos (4.452,426 M en total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; los modulos no amplian la ventana nativa del backbone |
| Tipos de cuantizacion | no disponible (checkpoint en `best.pt` para el codigo oficial) |
| Idiomas soportados | en |
| Licencia | MIT (el backbone, el codigo, los datasets y el paper tienen licencias propias) |
| Formato de pesos | `best.pt` (state dict de PyTorch con configuracion de modulos y puertas) |

## Arquitectura y entrenamiento

TransMem mantiene congelado el backbone Qwen3-4B-Instruct-2507 y anade cuatro modulos de memoria, cada uno un Transformer de una sola capa asociado a una capa de inyeccion (32, 33, 34 y 35, indexadas desde cero). Cada modulo transforma estados ocultos dispersos del contexto largo en una actualizacion residual sobre la representacion del backbone. Una puerta escalar por token con sigmoide centrada (g = 2σ(z)) controla la magnitud de cada actualizacion, de modo que el modelo aprende cuando recurrir a la memoria y cuando ignorarla. El checkpoint usa N = 4 segmentos de memoria y suma 429.958 M de parametros entrenables, un 10,69% sobre el backbone.

El entrenamiento emplea autodestilacion condicionada por evidencia: un profesor ve la evidencia de apoyo y la pregunta, mientras un estudiante aumentado con memoria ve el contexto completo y aprende a igualar las predicciones del profesor. La configuracion principal del paper se entrena en HotpotQA y se evalua en HotpotQA, LoCoMo y MemoryAgentBench. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO sobre los modulos.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre contextos largos, heredada del backbone Qwen3-4B-Instruct-2507.
- Razonamiento multi-salto con apoyo de memoria: los modulos inyectan informacion de evidencia dispersa en capas profundas del backbone.
- Dialogo de largo recorrido: evaluado en LoCoMo (categorias 1 a 4), orientado a conversaciones con historial extenso.
- Recuperacion y agregacion de evidencia en tareas tipo MemoryAgentBench.
- Capacidades nativas del backbone (codigo, matematicas, instrucciones) preservadas al estar este congelado, aunque no son el objetivo del checkpoint.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion en mecanismos de memoria para LLM: el checkpoint sirve como referencia reproducible para comparar inyeccion residual de estados ocultos frente a alternativas como recuperacion aumentada o ventanas de contexto extendidas.
- QA multi-salto sobre documentos: en escenarios tipo HotpotQA, el modelo procesa un contexto con pasajes distractores y utiliza la memoria para localizar y combinar evidencia de varias fuentes antes de responder.
- Asistentes conversacionales con historial largo: en dialogos tipo LoCoMo, los modulos permiten retener informacion de turnos anteriores sin reentrenar el backbone, util para prototipos de atencion al cliente con conversaciones extensas.
- Agentes de memoria episodica en investigacion: integrable en pipelines experimentales que necesiten un modulo de memoria ligero (10,69% de parametros extra) sobre un modelo de 4B.
- Evaluacion comparativa de tecnicas de long-context: sirve como baseline para medir el impacto de la memoria aprendida frente al backbone congelado en los mismos conjuntos de evaluacion.
- Experimentacion academica con backbone congelado: al no requerir ajuste fino del modelo base, reduce el coste de entrenamiento y facilita reproducir resultados en entornos con una sola GPU.

## Benchmarks y rendimiento

Resultados reportados en las Tablas 1 y 2 del manuscrito en OpenReview, no remedidos para esta model card:

| Benchmark / metrica (%) | Backbone congelado | + TransMem |
|---|---:|---:|
| LoCoMo, F1 global | 40,79 | 54,11 |
| HotpotQA, EM | 42,35 | 50,15 |
| HotpotQA, F1 | 56,00 | 66,20 |
| MemoryAgentBench, puntuacion media | 28,95 | 40,00 |

LoCoMo emplea las categorias 1 a 4. La media de MemoryAgentBench es el agregado reportado en el paper; las fuentes individuales usan protocolos de puntuacion distintos y algunas requieren un juez externo. Versiones publicas anteriores del paper contienen cifras diferentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el backbone Qwen3-4B-Instruct-2507 en FP16 requiere del orden de 8 GB solo para pesos, mas los 429,958 M de parametros del modulo (aproximadamente 0,86 GB en FP16) y el coste de la cache KV para contextos largos.
- GPU recomendadas: no disponible en la informacion proporcionada. El codigo oficial recomienda un entorno PyTorch con CUDA.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del backbone (4B) mas el modulo, aunque el requisito real depende de la longitud de contexto y no se documenta.
- Opciones de despliegue: exclusivamente el codigo nativo del repositorio GitHub de TransMem (`scripts/eval/eval_hotpot_official.py` con `--mode transmem`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor senala que el coste en parametros es distinto del coste en tiempo de ejecucion: el trabajo adicional lo determinan el calculo disperso de memoria y la inyeccion en solo cuatro capas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TransMem-qwen3-4B-D4 | 4.022 M backbone + 429,958 M modulo | no disponible (no amplia la ventana nativa) | Modulo de memoria sobre backbone congelado | MIT | Checkpoint de investigacion, 0 descargas |
| Qwen3-4B-Instruct-2507 (backbone) | 4.022 M | no disponible en la informacion proporcionada | LLM instructivo estandar | segun su propia model card | Publico en Hugging Face |
| TransMem sobre Qwen2.5-14B-Instruct | 14.770,034 M + 1.205,945 M | no disponible | Misma tecnica, backbone mayor | MIT (modulo) | Configuracion del paper, no se confirma checkpoint publicado |
| TransMem sobre Llama3.1-8B-Instruct | 8.030,261 M + 939,591 M | no disponible | Misma tecnica, backbone intermedio | MIT (modulo) | Configuracion del paper, no se confirma checkpoint publicado |

## Limitaciones y advertencias

- No es un modelo autonomo: `AutoModelForCausalLM.from_pretrained` sobre este repositorio es insuficiente; requiere descargar el backbone Qwen3-4B-Instruct-2507 y usar el codigo nativo de TransMem.
- Hereda las limitaciones de generacion del backbone y puede producir respuestas incorrectas.
- Los modulos anadidos no amplian por si mismos la ventana de contexto nativa del backbone.
- Solo se declara soporte de ingles.
- Entrenado principalmente en HotpotQA; la generalizacion a otros dominios no esta documentada.
- El checkpoint tiene 0 descargas y 1 like, sin validacion independiente de la comunidad.
- La licencia MIT cubre este repositorio, pero el backbone, el codigo, los datasets y el paper tienen licencias propias que deben revisarse para uso comercial.
- Riesgo de alucinacion y sesgos: no documentados de forma especifica; se asumen los del backbone.
- Cifras de benchmarks no reproducidas por terceros y sujetas a cambios entre versiones del paper.

## Enlaces

- Hugging Face: https://huggingface.co/Rayleihaodong/TransMem-qwen3-4B-D4
- Backbone: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper (OpenReview): https://openreview.net/forum?id=FmBT4enjqy
- Paper (PDF): https://openreview.net/pdf?id=FmBT4enjqy
- arXiv: https://arxiv.org/abs/2607.29032
- Codigo y evaluacion (GitHub): https://github.com/Haodong-Lei-Ray/TransMem
