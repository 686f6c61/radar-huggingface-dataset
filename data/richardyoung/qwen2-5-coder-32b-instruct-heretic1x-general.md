# richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-general

## Resumen

Qwen2.5-Coder-32B-Instruct-heretic1x-general es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-Coder-32B-Instruct, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored": el autor ha aplicado una tecnica de tipo "heretic" (version 1.x) para eliminar o atenuar los mecanismos de rechazo y alineacion del modelo original, con el objetivo declarado de servir a investigacion sobre seguridad y comportamiento de modelos. El modelo conserva la arquitectura y el tamano del original (32.763.876.352 parametros, aproximadamente 32,8 mil millones) y se distribuye en formato safetensors para su uso con la libreria transformers.

El modelo base, Qwen2.5-Coder-32B-Instruct, es un transformer decoder-only de la familia Qwen2.5 desarrollado por Alibaba, especializado en generacion de codigo y con capacidades de instruccion. Este fine-tune mantiene esa base pero modifica el comportamiento conversacional para reducir las negativas a peticiones que el modelo original rechazaria. Es relevante ahora porque la comunidad de investigacion en seguridad de IA utiliza este tipo de variantes para estudiar los limites de la alineacion y los riesgos de los modelos "uncensored", aunque su uso en produccion es delicado.

El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargar los pesos. La licencia declarada en las etiquetas es apache-2.0, aunque el autor tambien incluye la etiqueta openrail++ en los tags, lo que genera cierta ambiguedad sobre los terminos exactos de uso comercial. El modelo esta etiquetado unicamente para ingles ("en") y cuenta con 699 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tags) |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-32B-Instruct soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (etiqueta); tambien aparece openrail++ en los tags |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-Coder-32B-Instruct: un transformer decoder-only denso de aproximadamente 32,8 mil millones de parametros. No es un modelo MoE ni hibrido; no hay parametros activos que reportar. El fine-tune "heretic1x-general" aplica una tecnica de abliteration/decensoring (etiquetada como heretic-1.x) sobre el modelo original, orientada a suprimir las respuestas de rechazo. No se dispone en la informacion proporcionada de detalles sobre el dataset de ajuste, el numero de tokens utilizados, la composicion de los datos ni si hubo RLHF o DPO adicional en este fine-tune.

El modelo base Qwen2.5-Coder-32B-Instruct fue entrenado por Alibaba con datos de codigo y texto, e incluye ajuste por instrucciones; sin embargo, los detalles concretos de ese entrenamiento no se detallan en la informacion disponible para esta ficha. La innovacion tecnica destacable de esta variante es precisamente la modificacion del comportamiento de alineacion (abliteration), no cambios arquitectonicos.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Generacion y comprension de codigo (heredada del modelo base Coder).
- Razonamiento y matematicas (capacidades del modelo base, no verificadas en esta variante).
- Comportamiento "decensored": reduce las negativas a peticiones que el modelo original rechazaria, orientado a investigacion.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la etiqueta de idioma.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como la abliteration afecta a las tasas de rechazo y a la robustez frente a prompts adversarios, comparando con el modelo base alineado.
- Analisis de sesgos y comportamiento: evaluar diferencias de respuesta entre el modelo original y esta variante en tareas de clasificacion de contenido sensible.
- Generacion de codigo en entornos controlados de investigacion: aprovechar la base Coder para tareas de programacion donde se quiera analizar el efecto del decensoring en la calidad del codigo generado.
- Red teaming interno: usar la variante como modelo "atacante" o sujeto de pruebas en ejercicios de evaluacion de filtros de seguridad.
- Experimentos academicos de interpretabilidad: comparar activaciones y representaciones internas entre el modelo alineado y el abliterated.
- Prototipado de asistentes conversacionales en ingles para dominios donde el modelo base rechaza en exceso, siempre en entornos de prueba y con supervision humana.

No se recomienda su uso en atencion al cliente, produccion comercial ni aplicaciones expuestas a usuarios finales sin filtros adicionales, dado su caracter decensored.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 65,6 GB (32,8 B parametros en precision de 16 bits), por lo que se necesita al menos esa cantidad de VRAM para cargar el modelo sin cuantizar.
- Cuantizacion: no se listan cuantizaciones oficiales en la informacion proporcionada; seria necesario generarlas (por ejemplo, GGUF o AWQ) para reducir requisitos.
- GPU recomendadas: para precision completa, GPUs con 80 GB (A100 80GB, H100 80GB) o multiples GPUs. En cuantizacion de 8 bits podria caber en una A100 40GB o similar; en 4 bits, potencialmente en GPUs consumer de 24 GB (RTX 3090/4090), aunque esto no esta confirmado por el autor.
- Cabe en consumer GPU: solo con cuantizacion agresiva y no verificado en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), endpoints_compatible. No se confirma soporte de llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-general | ~32,8 B | no disponible | apache-2.0 / openrail++ (ambiguo) | Gated en HF | Fine-tune decensored |
| Qwen/Qwen2.5-Coder-32B-Instruct | ~32,8 B | no disponible en esta ficha | apache-2.0 | Publico en HF | Modelo base alineado |
| Otras variantes abliterated de Qwen2.5-Coder | ~32,8 B | no disponible | variable | variable | No verificadas en la informacion disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensored: reduce los rechazos y puede generar contenido inapropiado, ofensivo o peligroso; no apto para produccion sin filtros.
- Riesgo elevado de alucinacion, especialmente al haberse modificado el comportamiento de alineacion.
- Idioma limitado a ingles segun la etiqueta; no se garantiza calidad en castellano.
- Licencia ambigua: apache-2.0 en la etiqueta principal pero openrail++ en los tags; verificar terminos antes de uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face.
- Sin benchmarks publicados en la informacion disponible; rendimiento real no verificado.
- No se confirman capacidades de tool calling, agentes ni contexto largo en esta variante.
- Uso recomendado exclusivamente para investigacion y evaluacion de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios o demos adicionales.
