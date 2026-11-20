# GiangSon-5/c4-gpt-mini-causallm

## Resumen

c4-gpt-mini-causallm es un modelo de lenguaje causal autoregresivo de 44,9 millones de parametros desarrollado por el usuario GiangSon-5 y publicado en Hugging Face. Se trata de un GPT-2 miniatura entrenado integramente desde cero (sin inicializacion con pesos preentrenados) sobre el dataset C4 (Colossal Clean Crawled Corpus), con una arquitectura transformer decoder-only de 6 bloques, tokenizador Byte-Level BPE propio de 50.257 tokens y pesos serializados nativamente en bfloat16.

El modelo resuelve un problema fundamentalmente educativo y de investigacion: proporciona un checkpoint compacto (85,66 MB en BF16) que permite reproducir y estudiar el pipeline completo de entrenamiento de un LLM desde cero, incluyendo tokenizacion, empaquetado de secuencias y evaluacion. Por su tamano reducido es adecuado como modelo borrador en experimentos de decodificacion especulativa, como baseline en investigacion de eficiencia o como banco de pruebas para tecnicas de entrenamiento en hardware limitado.

Es relevante ahora porque demuestra que es posible completar un ciclo de entrenamiento reproducible (5 epocas, 6.220 pasos, 203,74 millones de tokens) en menos de 30 minutos sobre una unica NVIDIA A100 de 40 GB, alcanzando una perplejidad de validacion de 93,52 y de test retenido de 96,97. Su licencia MIT y su naturaleza "from scratch" lo convierten en una pieza util para docencia, ablaciones y validacion de infraestructura de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), 6 bloques, estilo GPT-2, atencion con PyTorch SDPA |
| Parametros totales | 44.909.056 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no declara la ventana de contexto; el entrenamiento usa empaquetado de secuencias con delimitadores `</s>`) |
| Tipos de cuantizacion | pesos nativos en bfloat16; no se declaran cuantizaciones GGUF, GPTQ ni AWQ en la informacion disponible |
| Idiomas soportados | ingles (declarado en la model card como `en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 89.825.728 bytes, bfloat16) |

Otras especificaciones: tokenizador Byte-Level BPE de 50.257 tokens ajustado exclusivamente sobre el split de entrenamiento; `eos_token_id=2` usado como delimitador de documentos; tamano del repositorio aproximado de 0,1 GB; precision de entrenamiento BF16 + TF32 en Ampere.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de 6 bloques con atencion escalada de producto punto (SDPA de PyTorch), en la linea de GPT-2. El modelo no parte de ningun checkpoint preentrenado: tanto los 44.909.056 parametros como el tokenizador Byte-Level BPE de 50.257 tokens se aprenden desde cero. El entrenamiento se realizo sobre el dataset C4 (variante `datablations/c4-filter-small`) con un split estricto y no solapado de 90.000 documentos de entrenamiento, 5.000 de validacion y 5.000 de test retenido, fijado con `seed=42`.

El pipeline de datos emplea un empaquetado de secuencias con conciencia de fronteras ("boundary-aware zero-padding packing"): concatenacion en tiempo lineal con delimitadores explicitos `</s>` entre documentos, retencion del 99,94% de los tokens y 0% de tokens `<pad>`. El entrenamiento se ejecuto durante 5 epocas (6.220 pasos, 203,74 millones de tokens del dataset) sobre 1x NVIDIA A100-SXM4 de 40 GB con BF16 y TF32 nativos, alcanzando 124.127 tokens/s (242,44 bloques/s) con un pico de 14,07 GB de VRAM y un tiempo de 27,37 minutos de entrenamiento (30,37 minutos de pipeline completo). No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores al preentrenamiento.

## Capacidades

- Generacion de texto causal en ingles: continuacion de prompts y generacion libre de hasta el numero de tokens configurado.
- Modelado de lenguaje a nivel de token y documento, con delimitadores `</s>` aprendidos para separar documentos en el empaquetado.
- Capacidad de servir como modelo borrador (draft model) en esquemas de decodificacion especulativa, segun la propia model card.
- Inferencia en CPU y GPU mediante `transformers` (clase `AutoModelForCausalLM` y `pipeline("text-generation")`).
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, modo "thinking" ni multilingueismo mas alla del ingles.

## Casos de uso

- Docencia y formacion en LLM: el modelo permite recorrer de principio a fin el ciclo de tokenizacion, empaquetado, entrenamiento y evaluacion con un coste de computo de menos de media hora en una A100, lo que facilita su uso en cursos y talleres.
- Modelo borrador en decodificacion especulativa: sus 44,9 millones de parametros y su huella de 85,66 MB en BF16 lo hacen candidato a draft model que proponga tokens rapidamente y que un modelo mayor verifique, reduciendo latencia en inferencia.
- Baseline reproducible para investigacion: sirve como referencia controlada (perplejidad 93,52 en validacion y 96,97 en test) frente a la cual medir mejoras de arquitectura, datos o tecnicas de entrenamiento.
- Pruebas de infraestructura y CI de entrenamiento: al completar 6.220 pasos en 27,37 minutos, es util para validar pipelines de datos, configuraciones de precision mixta (BF16 + TF32) y empaquetado de secuencias antes de escalar a modelos mayores.
- Generacion de texto de bajo coste en entornos con recursos limitados: al caber holgadamente en GPU de consumo y en CPU, puede emplearse para tareas de continuacion de texto no criticas, prototipado de interfaces o demos.
- Experimentos de tokenizacion: al incluir un tokenizador Byte-Level BPE entrenado desde cero sobre el split de entrenamiento, permite estudiar el impacto del vocabulario y del preprocesado en la perplejidad final.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | Split | Valor |
|---|---|---|
| Perplejidad | C4 validacion (5k, seed=42) | 93,52 |
| Loss | C4 validacion (5k, seed=42) | 4,5382 |
| Perplejidad | C4 test retenido (5k, seed=42) | 96,97 |
| Loss | C4 test retenido (5k, seed=42) | 4,5744 |

Datos adicionales de entrenamiento declarados: perplejidad de test de 54.773,00 con inicializacion aleatoria, lo que supone una reduccion del 99,82%; brecha de generalizacion validacion-test de +0,0362 nats; throughput de 124.127 tokens/s y 242,44 bloques/s con 14,07 GB de VRAM pico.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa 89.825.728 bytes (unos 85,66 MB); con cache KV y overhead de runtime, la inferencia cabe en menos de 1 GB de VRAM en la practica.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento se realizo en 1x NVIDIA A100-SXM4 de 40 GB, pero la inferencia no requiere esa clase de hardware.
- GPU de consumo: cabe con holgura en RTX 4090, RTX 4080, RTX 3090, RTX 3060 y en GPUs de gama de entrada; tambien puede ejecutarse en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `pipeline("text-generation")`; los tags del repositorio indican compatibilidad con text-generation-inference y endpoints compatibles. No se declaran artefactos GGUF para llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: en entrenamiento se alcanzaron 124.127 tokens/s y 242,44 bloques/s en A100; no se proporcionan cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Perplejidad declarada |
|---|---|---|---|---|---|
| c4-gpt-mini-causallm | 44,9 M | no disponible | Desde cero sobre C4 (203,74 M tokens) | MIT | 93,52 val / 96,97 test (C4) |
| GPT-2 small (referencia) | 124 M | 1.024 tokens | Preentrenado en WebText | MIT | no disponible en esta ficha |
| GPT-2 mini / destilados de la familia GPT-2 | variable (decenas de M) | 1.024 tokens (tipico) | Preentrenados o destilados | variable | no disponible en esta ficha |

La comparacion directa con GPT-2 small no es homogenea: c4-gpt-mini-causallm es aproximadamente un tercio del tamano, se entrena con un presupuesto de tokens muy inferior (203,74 M) y se evalua sobre C4, mientras que GPT-2 se entreno sobre WebText y se evalua habitualmente con otras metricas. No se dispone de datos de benchmarks estandarizados que permitan una comparacion de capacidades con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de muy baja capacidad: con 44,9 millones de parametros y 5 epocas sobre 203,74 millones de tokens, la coherencia a nivel de discurso es limitada; las generaciones de ejemplo muestran divagacion y perdida de sentido tras unas pocas frases.
- Riesgo elevado de alucinacion: al ser un modelo de lenguaje entrenado solo para modelar texto de C4, no tiene conocimiento factual fiable ni mecanismos de alineacion; no debe usarse para responder preguntas factuales en produccion.
- Solo ingles: la model card declara unicamente el idioma `en`; no hay evidencia de competencia en castellano ni en otros idiomas.
- Ventana de contexto no documentada: la model card no especifica la longitud de contexto de entrenamiento ni de inferencia, lo que impide garantizar un comportamiento correcto con prompts largos.
- Sin alineacion: no se declara RLHF, DPO ni filtrado de seguridad; el modelo puede reproducir sesgos y toxicidad presentes en C4.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con aviso de copyright; aun asi, la calidad del modelo limita su idoneidad para aplicaciones comerciales reales.
- Resultados no verificados: las metricas de perplejidad y loss estan declaradas por el autor con `verified: false`; no han sido replicadas de forma independiente.
- Caveat de produccion: no se declaran artefactos cuantizados ni soporte documentado para llama.cpp u Ollama, por lo que el despliegue fuera de `transformers` o TGI requeriria conversion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GiangSon-5/c4-gpt-mini-causallm
- Dataset C4 filtrado: https://huggingface.co/datasets/datablations/c4-filter-small
- Paper de referencia sobre escalado de datos (arxiv:2305.16264): https://arxiv.org/abs/2305.16264
- Paper de GPT-2 / Language Models are Unsupervised Multitask Learners (arxiv:1910.10683): https://arxiv.org/abs/1910.10683
