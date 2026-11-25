# C4445654/abliterated-Qwen2.5-1.5B-full

## Resumen

abliterated-Qwen2.5-1.5B-full es un ajuste fino del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicado por el usuario C4445654 en Hugging Face. Se trata de una version "abliterada": se ha eliminado la direccion de rechazo del espacio de activaciones internas del transformer, de modo que el modelo deja de producir respuestas de negativa explicita ante peticiones que el modelo base rechazaria. No es un modelo nuevo entrenado desde cero, sino una modificacion quirurgica de los pesos del modelo base.

El modelo conserva la arquitectura, el tamano y la ventana de contexto del Qwen2.5-1.5B-Instruct original: un transformer decoder-only de aproximadamente 1.540 millones de parametros, disenado para generacion de texto y conversacion. La intervencion se aplica sobre los escritores del flujo residual (`o_proj` y `down_proj`) en las tres capas seleccionadas como las mas relevantes para la direccion de rechazo, mediante una ablacion biproyectada que preserva la norma.

Su relevancia es acotada pero especifica: sirve como caso de estudio de tecnicas de refusal removal y como base para experimentos que requieren un modelo pequeno, desplegable en hardware modesto y sin las negativas por defecto del alineamiento. El repositorio no registra descargas ni likes en el momento de la consulta, y la model card es muy escueta en cuanto a evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de llama.cpp/GGUF por derivacion del base, no confirmado por el autor) |
| Idiomas soportados | en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activaciones SwiGLU y sesgos de atencion QKV caracteristicos de la familia Qwen2. El modelo base fue entrenado por Alibaba con un corpus multilingue de gran escala y posteriormente alineado mediante instruccion y preferencias; la model card de este derivado no aporta el numero exacto de tokens de entrenamiento ni la composicion del dataset original.

La innovacion tecnica de este repositorio es el proceso de abliteracion. Se calcularon pares de contraste de 1559 ejemplos daninos y 1559 inofensivos (estilo advbench), se extrajeron los estados ocultos y se computo la direccion dominante de rechazo como la diferencia entre ambas distribuciones. Esa direccion se elimino de los escritores del flujo residual (`o_proj` y `down_proj`) en las tres capas seleccionadas, usando una ablacion biproyectada que preserva la norma, con esparsificacion en el percentil 0,995 y escala global 1,0. El pipeline es el de Orion-zhen/abliteration, inspirado en el trabajo "Refusal in LLMs is mediated by a single direction". No hay datos de RLHF, DPO ni entrenamiento adicional sobre este derivado.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones en ingles y frances.
- Generacion de codigo y matematicas sencillas, limitada por el tamano de 1.5B parametros.
- Reduccion de negativas explicitas: el modelo tiende a no rechazar peticiones que el base rechazaria, aunque la model card advierte que no es un "uncensorment" completo.
- Soporte de tool calling y function calling: no confirmado en la model card de este derivado; el base Qwen2.5 lo soporta, pero no se verifica aqui.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este derivado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre refusal removal: permite reproducir y analizar el efecto de la ablacion de la direccion de rechazo comparando respuestas con el modelo base, util para estudiar mecanismos de alineamiento en transformers pequenos.
- Evaluacion de robustez de salvaguardas: sirve como referencia negativa en pipelines de red teaming que miden cuanto degrada la ablacion el comportamiento de rechazo de un modelo alineado.
- Prototipado rapido en local: con 1.5B parametros cabe en GPU de consumo y permite iterar sobre prompts y plantillas de conversacion sin coste de API.
- Generacion de texto creativo y conversacional en ingles y frances: util para demos de chatbot o generacion de borradores donde las negativas por defecto resultan molestas.
- Fine-tuning posterior: al ser apache-2.0 y de tamano reducido, sirve como punto de partida para ajustes especificos de dominio en entornos con recursos limitados.
- Educacion y divulgacion: ejemplo didactico de como se modifica un modelo alineado a nivel de pesos y de las implicaciones eticas de hacerlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo advierte que "la calidad del modelo puede degradarse ligeramente" y recomienda evaluar antes de confiar en el, sin aportar cifras de MMLU, HumanEval, GSM8K ni comparaciones con el base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1-1,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090); en profesional, A100 o H100 sobran para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 6 GB o mas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama y TGI son viables por herencia del base, aunque el autor no documenta configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| abliterated-Qwen2.5-1.5B-full | 1,54B | no disponible | apache-2.0 | Derivado abliterado, sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun model card del base) | apache-2.0 | Modelo base alineado, con benchmarks publicados por Alibaba |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens (segun model card del base) | apache-2.0 | Alternativa mas pequena de la misma familia |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Alternativa de Meta, licencia mas restrictiva |

La comparativa se limita a datos publicos de los modelos base y alternativas de la misma categoria; no hay cifras de rendimiento del derivado abliterado que permitan comparar calidad de forma directa.

## Limitaciones y advertencias

- La abliteracion no garantiza la eliminacion total de negativas; la model card lo califica explicitamente de reduccion, no de "uncensorment" completo.
- Puede degradar la calidad general del modelo respecto al base; el autor recomienda evaluar antes de usarlo en produccion.
- Riesgo elevado de generar contenido danino, sesgado o inexacto al haberse reducido las salvaguardas de rechazo.
- Riesgo de alucinacion propio de un modelo de 1.5B parametros, acentuado por la posible degradacion de la ablacion.
- Idiomas declarados solo en y fr; el soporte multilingue del base no se garantiza en este derivado.
- Longitud de contexto no documentada en la model card del derivado; no debe asumirse la del base sin verificacion.
- Licencia apache-2.0 permite uso comercial, pero el autor remite a los terminos del modelo base y no asume responsabilidad sobre el uso.
- Repositorio sin descargas ni validacion de la comunidad; no hay evidencia externa de su comportamiento real.
- El uso de un modelo con salvaguardas reducidas puede incumplir politicas de plataformas o normativa aplicable segun el contexto de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/C4445654/abliterated-Qwen2.5-1.5B-full
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Metodo de abliteracion: https://github.com/Orion-zhen/abliteration
- Concepto de direccion de rechazo: https://www.lesswrong.com/posts/jGuXSZgv6qfdhMCuJ/refusal-in-llms-is-mediated-by-a-single-direction
