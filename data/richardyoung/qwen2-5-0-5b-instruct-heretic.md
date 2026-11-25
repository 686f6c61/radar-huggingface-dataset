# richardyoung/Qwen2.5-0.5B-Instruct-heretic

## Resumen

Qwen2.5-0.5B-Instruct-heretic es una variante "abliterated" (tambien llamada decensored o uncensored) del modelo Qwen2.5-0.5B-Instruct de Alibaba Qwen, publicada por el usuario richardyoung en Hugging Face. El modelo parte del checkpoint base Qwen/Qwen2.5-0.5B y aplica tecnicas de edicion de pesos orientadas a eliminar el comportamiento de rechazo aprendido durante el alineamiento, manteniendo la arquitectura y el conocimiento del modelo original. El resultado es un modelo conversacional de muy pequeno tamano (494 millones de parametros) pensado para entornos con recursos muy limitados y para casos donde se necesita que el modelo no se niegue a responder.

La relevancia de esta ficha es doble. Por un lado, documenta una practica creciente en la comunidad open source: la publicacion de variantes "heretic" que eliminan el sesgo de refusal mediante intervenciones sobre los pesos, sin reentrenamiento completo. Por otro, advierte de que se trata de un modelo de 0,5B parametros, con capacidad de razonamiento limitada, entrenado principalmente en ingles y con acceso restringido (gated) en Hugging Face. No es un modelo para produccion critica ni para tareas que requieran alta fiabilidad.

El modelo usa la arquitectura transformer decoder-only de Qwen2, con un contexto nativo de 32.768 tokens segun la familia Qwen2.5, aunque la informacion disponible en la ficha de Hugging Face no detalla todos los hiperparametros. La licencia declarada es Apache 2.0, heredada del modelo base, y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con atencion por grupos (GQA) y RoPE |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de la familia Qwen2.5; no confirmado de forma explicita en la ficha) |
| Tipos de cuantizacion | no disponible en la ficha; al ser safetensors se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (ingles declarado); el modelo base Qwen2.5 soporta multiples idiomas, pero la ficha solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del checkpoint Qwen/Qwen2.5-0.5B: un transformer decoder-only con atencion por grupos (grouped-query attention), embeddings rotatorios (RoPE) y normalizacion RMSNorm. Con 494 millones de parametros, es uno de los modelos instruct mas pequenos de la familia Qwen2.5. El entrenamiento original de Qwen2.5-0.5B-Instruct incluyo preentrenamiento sobre un corpus multilingue de billones de tokens y un posterior ajuste supervisado (SFT) y optimizacion por preferencias (DPO/RLHF) para alineamiento conversacional; la ficha no aporta el desglose exacto de tokens ni la composicion del dataset.

La intervencion "heretic" consiste en una edicion de pesos dirigida a suprimir la direccion de activacion asociada al rechazo, una tecnica conocida en la literatura como abliteration. El autor etiqueta el modelo como "reproducible", lo que sugiere que el proceso de edicion esta documentado y puede replicarse. No se indica en la informacion disponible si hubo reentrenamiento adicional, calibracion posterior o evaluacion de regresion de capacidades. Tampoco se documentan innovaciones de decodificacion especulativa ni atencion lineal; el modelo usa atencion estandar de la familia Qwen2.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Respuesta a instrucciones generales (chat), heredada del ajuste instruct de Qwen2.5.
- Redaccion, resumen y reescritura de textos cortos y medios.
- Extraccion de informacion y clasificacion simple de texto.
- Generacion de codigo basica, limitada por el tamano del modelo.
- Aritmetica y razonamiento de un solo paso; el razonamiento multi-paso es debil por el reducido numero de parametros.
- Comportamiento "decensored": reduccion deliberada de rechazos ante peticiones que el modelo original rechazaria.
- No se documenta soporte explicito de tool calling ni function calling en la ficha.
- No se documenta soporte de agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada en la practica: la ficha solo declara ingles, aunque el base Qwen2.5 tiene cobertura multilingue.

## Casos de uso

- Prototipado rapido en local: con menos de 500 millones de parametros, el modelo se puede cargar en CPU o en GPU de gama baja para validar pipelines de chat antes de escalar a modelos mayores.
- Investigacion sobre alineamiento y refusal: util para estudiar como la abliteration afecta al comportamiento de rechazo y a la calidad de las respuestas, comparandolo con el checkpoint original Qwen2.5-0.5B-Instruct.
- Generacion de texto creativo sin filtros: escenarios de escritura de ficcion, guiones o role-play donde el modelo original rechazaria contenido sensible.
- Clasificacion y etiquetado de texto a gran escala: su bajo coste de inferencia permite procesar grandes volumenes de documentos cortos en tareas de categorizacion simple.
- Asistente embebido en dispositivos con recursos limitados: Raspberry Pi, moviles o entornos edge donde no cabe un modelo de 7B o superior.
- Generacion de datos sinteticos para experimentos: produccion de pares pregunta-respuesta en ingles para aumentar datasets de entrenamiento o evaluacion, con revision humana posterior.
- Educacion y demos: ejemplo didactico de edicion de pesos y de las diferencias entre un modelo alineado y su variante heretic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de Hugging Face no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de refusal rate. Cualquier cifra de rendimiento deberia obtenerse ejecutando el modelo y comparandolo con Qwen/Qwen2.5-0.5B-Instruct en el mismo harness.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 1 GB para los pesos (494M parametros x 2 bytes) mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,5 GB; en 4 bits, alrededor de 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas con suficiente memoria compartida.
- Ejecutable en CPU con llama.cpp u Ollama a velocidades interactivas para textos cortos.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (tag text-generation-inference), vLLM, llama.cpp y Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera decodificacion de decenas a cientos de tokens por segundo en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-0.5B-Instruct-heretic | 494M | 32.768 (heredado) | Apache 2.0 | Gated | Variante abliterated del instruct |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Abierto | Modelo original alineado, con refusal |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540M | 32.768 | Apache 2.0 | Abierto | Mayor capacidad, mismo contexto |
| Llama-3.2-1B-Instruct | 1.240M | 128.000 | Llama 3.2 Community | Gated | Alternativa de Meta, contexto mayor |

La comparacion directa con el checkpoint original Qwen2.5-0.5B-Instruct es la mas relevante: misma arquitectura y tamano, pero difieren en el comportamiento de rechazo. Frente a modelos de 1B a 1,5B, esta variante sacrifica capacidad de razonamiento a cambio de un coste de inferencia mucho menor.

## Limitaciones y advertencias

- Capacidad limitada: con 494M parametros, el razonamiento complejo, las matematicas y la generacion de codigo no competitiva son debiles; no debe usarse para tareas que exijan alta precision.
- Riesgo de alucinacion elevado, agravado por el reducido tamano del modelo y por la falta de evaluaciones publicadas.
- La abliteration puede degradar capacidades: no hay datos que confirmen que el rendimiento en tareas generales se mantiene respecto al modelo original.
- Contenido sin filtros: el modelo puede generar contenido ofensivo, inseguro o legalmente problematico; requiere moderacion externa en cualquier despliegue publico.
- Idioma: la ficha solo declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el acceso es gated, lo que anade friccion operativa.
- Trazabilidad limitada: el autor es un particular, no un laboratorio; no hay paper asociado ni evaluacion independiente.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Qwen2.5, sin que se documente mitigacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-0.5B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo instruct original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper de referencia citado en los tags (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
