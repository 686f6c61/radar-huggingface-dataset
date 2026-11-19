# ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-8821-repeat3-1e-compile

## Resumen

ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-8821-repeat3-1e-compile es un ajuste fino (SFT) del modelo base ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, a su vez derivado de la familia Qwen3.5. Lo publica el usuario ConnorYU en Hugging Face bajo licencia Apache 2.0 y esta orientado, segun el nombre del repositorio, a dominio medico. El pipeline declarado es image-text-to-text, lo que indica que el modelo conserva capacidad multimodal de entrada (imagen y texto), aunque la model card no documenta el entrenamiento multimodal.

El checkpoint tiene 9.409.813.744 parametros en formato safetensors (aproximadamente 9,4 mil millones) y un repositorio de 18,8 GB en precision de entrenamiento. Se entrenó con Unsloth y la libreria TRL de Hugging Face, segun indica el autor, con una velocidad declarada de 2x respecto a un entrenamiento convencional. La nomenclatura del nombre (tem400, repeat3, 1e, compile) sugiere hiperparametros concretos de entrenamiento, pero el autor no los documenta.

La relevancia de esta ficha es limitada: el modelo no tiene descargas ni likes en el momento de la consulta, la model card es minima y no se publican benchmarks, datos de entrenamiento ni evaluaciones. Debe tratarse como un experimento de ajuste fino de un modelo base de la familia Qwen3.5, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (según tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, que a su vez parece ser el resultado de un entrenamiento con GRPO (Group Relative Policy Optimization) orientado a seguir instrucciones (ifeval) y con modo de razonamiento ("think"). La arquitectura subyacente corresponde a Qwen3.5, un transformer decoder-only, pero el autor no detalla numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

No se documentan el volumen de tokens de entrenamiento, la composicion del dataset medico, ni si hubo etapas de RLHF o DPO posteriores al SFT. El unico dato tecnico aportado es que el entrenamiento se realizo con Unsloth y TRL, con una mejora de velocidad de 2x declarada por el autor. El sufijo "compile" del nombre sugiere el uso de `torch.compile`, y "repeat3" y "1e" apuntan a repeticiones del dataset y a una tasa de aprendizaje de 1e-5, pero son inferencias a partir del nombre, no datos confirmados.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (tag `conversational`).
- Entrada multimodal imagen-texto segun el pipeline declarado (`image-text-to-text`), aunque no se documenta el entrenamiento de esta capacidad.
- Modo de razonamiento ("think") heredado del checkpoint base GRPO-ifeval.
- Seguimiento de instrucciones, presumiblemente reforzado en la etapa GRPO del modelo base.
- Especializacion declarada en dominio medico por el nombre del repositorio, sin documentacion de la naturaleza del dataset.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`) y con text-generation-inference.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la model card.

## Casos de uso

- Prototipado de asistentes de documentacion clinica en ingles: el modelo puede generar resumenes o borradores de notas a partir de texto de entrada, aunque requiere validacion humana por su naturaleza de ajuste fino no evaluado.
- Investigacion sobre ajuste fino en dominio medico: sirve como punto de partida reproducible para estudiar el efecto del SFT sobre un checkpoint ya entrenado con GRPO.
- Experimentos de destilacion o comparacion de checkpoints: al compartir base con Qwen3.5-9B-GRPO-ifeval-v0-think-step400, permite comparar el efecto del SFT medico frente al modelo base.
- Generacion de preguntas y respuestas medicas para conjuntos de evaluacion internos: util para generar candidatos que luego se filtran y validan manualmente.
- Fine-tuning posterior con tecnicas como DPO o RLHF: el checkpoint puede servir como inicializacion para etapas adicionales de alineamiento en ingles.
- Pruebas de integracion con text-generation-inference y endpoints de Hugging Face: el tag `endpoints_compatible` permite desplegarlo en infraestructura gestionada para pruebas de latencia y formato de chat.
- Evaluacion de capacidades multimodales heredadas: el pipeline image-text-to-text permite comprobar si el ajuste fino de texto ha degradado la comprension de imagenes del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K, MedQA ni de ninguna otra evaluacion, ni comparaciones con el modelo base o con Qwen3.5-9B original.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 10-11 GB para pesos; en 4 bits, alrededor de 5-6 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con contexto limitado, y en RTX 3090/4080 con cuantizacion (no publicada).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag) y endpoints de Hugging Face; vLLM, llama.cpp u Ollama no estan confirmados por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-8821-repeat3-1e-compile | 9,4 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | SFT medico sobre checkpoint GRPO; sin benchmarks |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400 (modelo base) | 9,4 B (presumible) | no disponible | no disponible | Hugging Face | Checkpoint previo con GRPO e ifeval |
| Qwen3.5-9B (modelo original de la familia) | 9 B (presumible) | no disponible | no disponible | Hugging Face | Modelo base de referencia; capacidades documentadas por el desarrollador original |
| Alternativas de 7-9 B en dominio medico | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo sin evaluacion publicada: no hay benchmarks, ni evaluacion clinica, ni validacion por expertos; no debe usarse en decisiones medicas reales.
- Riesgo alto de alucinacion en dominio medico: un SFT sobre un modelo de 9 B sin datos de entrenamiento documentados no garantiza precision factual.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto: la longitud de contexto no esta publicada, lo que impide planificar su uso en tareas de documentos largos.
- Capacidad multimodal incierta: el pipeline image-text-to-text sugiere vision, pero el ajuste fino pudo degradarla y no hay evaluacion al respecto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no documentadas; conviene verificar la cadena de licencias.
- Modelo practicamente sin adopcion (0 descargas, 0 likes) y sin mantenimiento declarado; no hay garantia de soporte ni de correccion de errores.
- El nombre del repositorio codifica hiperparametros no verificados; no debe interpretarse como documentacion tecnica.
- No se publican cuantizaciones GGUF ni versiones optimizadas para llama.cpp u Ollama, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-8821-repeat3-1e-compile
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): no se proporciona enlace directo en la informacion disponible
- Paper, blog o demo del autor: no disponible
