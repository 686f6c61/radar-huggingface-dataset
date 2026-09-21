# Diluner/gpt54-mini-sequential-qwen3-4b-sft-s1-babyai-20260920

## Resumen

Este repositorio contiene un checkpoint de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3-4B, publicado por el usuario Diluner. No es un modelo nuevo ni un lanzamiento oficial: es el resultado de una etapa intermedia de una cadena de entrenamiento secuencial para agentes. El identificador delata la receta: destilación desde un profesor denominado `gpt-5.4-mini`, sobre Qwen3-4B, con la primera etapa (`s1`) de una secuencia de entornos BabyAI → TextCraft → SearchQA. Solo la etapa BabyAI está completada; TextCraft y SearchQA no se han ejecutado en esta cadena.

El modelo tiene 4.411.424.256 parámetros en safetensors y ocupa 17,7 GB en el repositorio, lo que corresponde a pesos en precisión completa o media (bf16/fp16) sin cuantizar. Se entrenó durante cinco épocas sobre el entorno BabyAI, con 125 actualizaciones del optimizador en esa etapa. La model card insiste en que se trata de un checkpoint aislado, no de una ventaja metodológica reproducible, y que no se ha adjuntado ninguna evaluación.

La relevancia es acotada y de carácter metodológico: sirve para reproducir o auditar una cadena de SFT secuencial con profesor sintético, no como modelo de propósito general. Para cualquier uso en producción, conviene partir del Qwen3-4B original o de sus variantes instruct, ya que este checkpoint no declara licencia propia y arrastra el sesgo de un entrenamiento muy estrecho centrado en un único entorno de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-4B (configuracion concreta de capas no disponible en la informacion proporcionada) |
| Parametros totales | 4.411.424.256 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para este checkpoint; el modelo base Qwen3-4B declara contexto nativo de 32.768 tokens (no verificado aqui) |
| Tipos de cuantizacion | No disponible. El repositorio solo incluye safetensors sin cuantizar; no se publican versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible. El tag de idioma no esta declarado; el modelo base Qwen3-4B es multilingue, pero este ajuste no documenta comportamiento por idioma |
| Licencia | No disponible. La model card afirma literalmente que no se reclama ninguna licencia y remite al modelo base y a los terminos aplicables |
| Formato de pesos | safetensors (shards en la raiz del repositorio, junto con configuracion y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer decoder-only denso de aproximadamente 4.000 millones de parametros (el recuento real de este repositorio es de 4.411.424.256, que incluye embeddings y cabezal). No hay innovaciones arquitectonicas propias en este checkpoint; el trabajo consiste integramente en el ajuste de los pesos del modelo base. No se proporcionan detalles de capas, dimension de atencion, numero de cabezas ni configuracion de RoPE en la informacion disponible.

El entrenamiento es SFT (supervised fine-tuning) con un profesor externo denominado `gpt-5.4-mini`, dentro de una cadena secuencial de tres entornos: BabyAI (etapa 1, la unica completada), TextCraft y SearchQA. Cada entorno recibe cinco epocas y tanto el estudiante como el metodo se arrastran de una etapa a la siguiente. La etapa aqui publicada consumio 125 actualizaciones del optimizador. No se menciona uso de RLHF, DPO, PPO ni ningun otro ajuste por preferencias. El repositorio no incluye estado del optimizador, logs en crudo ni trayectorias del profesor; `experiment.json` contiene referencias y checksums legibles por maquina. La model card advierte que el inventario de seleccion registra nombres, tamanos y fechas de modificacion, pero no es un hash tensor a tensor vinculado a respuestas historicas de evaluacion.

## Capacidades

- Generacion de texto autorregresiva y decodificacion conversacional: el pipeline declarado es `text-generation` y el tag `conversational` esta presente.
- Seguimiento de instrucciones en tareas de agente del entorno BabyAI (gridworld con instrucciones en lenguaje natural), que es el unico dominio sobre el que se ha entrenado esta etapa.
- Ajuste por destilacion desde un profesor (`gpt-5.4-mini`): el modelo esta optimizado para imitar las trayectorias del profesor en la tarea concreta, no para razonamiento general.
- Soporte de tool calling o function calling: no disponible; no hay evidencia ni declaracion al respecto en la informacion proporcionada.
- Soporte de agentes multi-paso: parcial y no verificado. El modelo forma parte de una cadena pensada para agentes, pero solo la etapa BabyAI esta completada y no se adjunta evaluacion.
- Capacidades multilingues: no disponibles. No se declara idioma alguno y no se aporta evaluacion por idioma.
- Modo de razonamiento explicito (thinking mode): no disponible; no se documenta para este checkpoint.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Reproduccion de experimentos de destilacion secuencial: sirve como punto de control intermedio para estudiar como se comporta un estudiante Qwen3-4B tras cinco epocas de SFT sobre BabyAI con un profesor sintetico, antes de encadenar TextCraft y SearchQA.
- Auditoria de procedencia en investigacion: `experiment.json` y el manifiesto de etapa permiten verificar el recuento de pasos, los nombres y tamanos de los ficheros y las marcas de verificacion del controlador, util en trabajos que exigen trazabilidad de checkpoints.
- Linea base para ablaciones: comparar este checkpoint con el Qwen3-4B sin ajustar o con variantes entrenadas en otro orden de entornos permite medir el efecto del orden de la cadena y del numero de actualizaciones.
- Estudio de olvido catastrofico y transferencia entre entornos: al ser una etapa inicial de tres previstas, es material adecuado para medir como un ajuste estrecho en un gridworld afecta a capacidades generales del modelo base.
- Prototipado de agentes en entornos tipo gridworld: para experimentar con politician de instrucciones simples en BabyAI antes de invertir en un modelo mayor o en una etapa posterior de la cadena.
- Docencia y ejercicios de fine-tuning: dado su tamano (4,4 B de parametros) y su formato safetensors estandar, es util en cursos o talleres donde se quiera ilustrar un pipeline completo de SFT con destilacion y publicacion en HuggingFace.
- Generacion de texto general: tecnicamente posible con `AutoModelForCausalLM`, pero desaconsejada como caso de uso real, ya que no hay evaluacion que respalde calidad fuera del dominio de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay ninguna evaluacion adjunta para este checkpoint intermedio y que las puntuaciones de los tres entornos pertenecen unicamente al modelo de la etapa 3, completamente entrenado. Por tanto, no procede atribuir a este repositorio cifras de BabyAI, TextCraft, SearchQA ni de benchmarks generales como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia (valores estimados a partir del recuento de parametros; no publicados por el autor): en bf16/fp16 en torno a 9-10 GB de pesos mas cache KV; en int8 aproximadamente 5-6 GB; en cuantizacion de 4 bits alrededor de 3-4 GB.
- GPU recomendadas: A100 40 GB, H100 o L40S para despliegue en bf16 con lotes grandes y contexto largo; A10G, L4 o RTX 4090 para bf16 con lotes pequenos.
- Compatibilidad con GPU de consumo: si, cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB) en bf16, y en RTX 4080/4070 Ti (16 GB) o incluso 12 GB si se cuantiza a 8 o 4 bits, siempre que se genere una cuantizacion propia, ya que el repositorio no publica ninguna.
- Opciones de despliegue: transformers (snippet oficial incluido en la model card), text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` estan declarados) y, generando la conversion, llama.cpp u Ollama mediante GGUF. vLLM es viable al ser una arquitectura Qwen3 estandar, aunque no se declara soporte explicito en la informacion disponible.
- Latencia y throughput estimados: no disponibles. No se publican mediciones, y al ser un checkpoint de investigacion sin evaluacion tampoco hay referencias indirectas fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diluner/gpt54-mini-sequential-qwen3-4b-sft-s1-babyai-20260920 | 4,41 B | No disponible | SFT con profesor sintetico, etapa 1 (BabyAI) de 3 | No declarada | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3-4B (modelo base) | Aprox. 4 B | No disponible en la informacion proporcionada | Preentrenamiento mas ajuste instructivo por parte de Qwen | Apache-2.0 segun la model card del modelo base | Publico y ampliamente utilizado |
| Otras alternativas de ~4 B orientadas a agentes | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos, por lo que la comparacion se limita a parametros, procedencia y licencia. Cualquier afirmacion sobre calidad relativa frente a otros modelos de ~4 B seria especulativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay ninguna metrica publicada para este checkpoint. Cualquier afirmacion sobre su calidad es una extrapolacion.
- Dominio de entrenamiento muy estrecho: cinco epocas sobre BabyAI, con 125 actualizaciones del optimizador. Es previsible un ajuste excesivo a ese entorno y una degradacion de capacidades generales, aunque no se aporta medicion que lo confirme o lo desmienta.
- Riesgo de alucinacion: no cuantificado. Al estar entrenado para imitar trayectorias de un profesor en tareas concretas, el comportamiento fuera de distribucion es impredecible.
- Licencia no resuelta: la model card declara que no se reclama ninguna licencia y remite al modelo base. Esto bloquea en la practica cualquier uso comercial sin una revision juridica previa de los terminos de Qwen/Qwen3-4B y del profesor empleado.
- Terminos del profesor: se menciona `gpt-5.4-mini` como profesor de destilacion. La model card no documenta la licencia ni las condiciones de uso de las trayectorias generadas por ese profesor, lo que anade incertidumbre legal.
- Idiomas no declarados: no se especifica ningun idioma soportado ni se aporta evaluacion multilingue; asumir el multilingusimo del modelo base es una extrapolacion no verificada.
- Contexto no documentado: no se confirma cual es la ventana efectiva tras el ajuste ni si se aplicaron extensiones tipo YaRN.
- Trazabilidad parcial: el propio autor advierte que el inventario de ficheros no constituye un hash tensor a tensor vinculado a evaluaciones historicas, y que el estado del optimizador, los logs y las trayectorias del profesor no se incluyen.
- Confusion de atribucion: las puntuaciones de etapas posteriores de la cadena secuencial no deben atribuirse a este checkpoint, tal como subraya la model card.
- Aviso de contenido: el texto de la model card es material de referencia del autor y no debe interpretarse como instrucciones operativas.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Diluner/gpt54-mini-sequential-qwen3-4b-sft-s1-babyai-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper, blog o repositorio adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes (unicamente paginas genericas de Bing y Microsoft Rewards), por lo que no se pueden aportar enlaces a documentacion tecnica, evaluaciones o codigo de entrenamiento.
