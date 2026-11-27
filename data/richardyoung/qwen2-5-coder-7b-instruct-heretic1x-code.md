# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code

## Resumen

Qwen2.5-Coder-7B-Instruct-heretic1x-code es una variante "abliterated" (decensored) del modelo Qwen2.5-Coder-7B-Instruct de Alibaba Qwen, publicada por el usuario richardyoung en Hugging Face. Se trata de un fine-tune que aplica la tecnica conocida como "abliteration", orientada a eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad del modelo original, con el objetivo declarado de investigación. El modelo conserva la arquitectura y el tamano del base: un transformer decoder-only denso de aproximadamente 7.600 millones de parametros.

El modelo hereda las capacidades de generacion de codigo de la familia Qwen2.5-Coder, que es una de las lineas de modelos abiertos de codigo mas utilizadas en el ecosistema, con soporte para conversacion multi-turno, instrucciones y tareas de programacion. Al ser un fine-tune del Instruct, mantiene el formato conversacional de chat y la plantilla de Qwen2.5, lo que facilita su uso con las herramientas habituales (transformers, vLLM, TGI, llama.cpp).

Su relevancia es doble: por un lado, sirve como caso de estudio de las tecnicas de abliteration aplicadas a modelos de codigo; por otro, es un recordatorio de que la modificacion de los pesos puede degradar la calidad y eliminar salvaguardas. El acceso esta restringido (gated) en Hugging Face y el modelo se distribuye bajo licencia Apache 2.0, aunque el autor lo etiqueta como material de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens nativos, ampliable; no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; el base admite cuantizacion GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | ingles (segun la model card; el base es multilingue, pero este fine-tune declara solo `en`) |
| Licencia | Apache 2.0 (etiqueta del repo); acceso gated con terminos adicionales en Hugging Face |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 7.615.616.512 parametros, derivado directamente de Qwen/Qwen2.5-Coder-7B-Instruct. No se dispone de informacion detallada sobre el dataset de entrenamiento del fine-tune, el numero de tokens utilizados ni la composicion de los datos en la informacion proporcionada. Tampoco se documenta si se emplearon tecnicas de RLHF, DPO o preferencias adicionales en esta variante.

La innovacion tecnica declarada es la aplicacion de "abliteration" (etiquetas `heretic`, `heretic-1.x`, `abliterated`, `decensored`), una familia de tecnicas que modifica los pesos del modelo para suprimir direcciones de activacion asociadas a comportamientos de rechazo. El resultado suele ser un modelo que responde a solicitudes que el original rechazaria, a costa de posibles degradaciones en coherencia, seguridad y calidad general. El repo ocupa 15,2 GB, coherente con pesos en precision completa o bf16/fp16 de un modelo de 7,6 B.

## Capacidades

- Generacion de texto y codigo en ingles, heredadas del base Qwen2.5-Coder-7B-Instruct.
- Conversacion multi-turno con formato de chat (pipeline `text-generation`, tag `conversational`).
- Razonamiento sobre codigo: explicacion, refactorizacion, depuracion y generacion de fragmentos en multiples lenguajes de programacion (capacidad del base, no verificada especificamente en este fine-tune).
- Soporte de instrucciones y seguimiento de prompts (modelo Instruct).
- Tool calling / function calling: no documentado en la informacion proporcionada para este fine-tune; el base Qwen2.5-Coder lo soporta, pero no se confirma aqui.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingues: la model card declara solo ingles (`en`).
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration en un modelo de codigo, comparando respuestas y calidad frente al base original en tareas controladas.
- Analisis de robustez de salvaguardas: util para evaluar como cambian las tasas de rechazo y la utilidad en pipelines de moderacion antes de desplegar modelos en produccion.
- Generacion de codigo en entornos de laboratorio: puede emplearse para prototipado rapido de scripts y funciones en ingles, siempre que se valide la salida.
- Experimentos de evaluacion comparativa: sirve como variante de control en benchmarks de codigo para medir el coste de la abliteration en HumanEval, MBPP u otros.
- Docencia y divulgacion: ilustra de forma practica que es la abliteration y que implicaciones tiene sobre un modelo Instruct.
- Pruebas de red teaming: permite simular escenarios adversarios y estudiar respuestas del modelo sin filtros para disenar contramedidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15-16 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, 18-24 GB para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 8 GB de pesos; a 4 bits: alrededor de 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para precision completa; RTX 4090 (24 GB) para bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 con contexto moderado; en RTX 4070 Ti (12 GB) o inferiores requiere cuantizacion a 8 o 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI (el repo incluye tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code | 7,6 B | no disponible | Apache 2.0 | Gated | Variante abliterated del base |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens (nativo) | Apache 2.0 | Abierto | Modelo base original, alineado |
| Qwen/Qwen2.5-Coder-7B | 7,6 B | 32.768 tokens (nativo) | Apache 2.0 | Abierto | Version base sin instrucciones |
| Modelos de codigo de 7 B de otros proveedores | ~7 B | variable | variable | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La abliteration elimina o atenua los rechazos de seguridad; el modelo puede generar contenido danino, ofensivo o ilegal si se le solicita.
- Riesgo elevado de alucinacion y de codigo incorrecto o inseguro; no debe usarse en produccion sin validacion humana y pruebas automatizadas.
- La model card declara solo ingles; el rendimiento en castellano u otros idiomas no esta garantizado y puede degradarse respecto al base.
- El acceso es restringido (gated) y requiere aceptar condiciones en Hugging Face; la licencia Apache 2.0 del repo no exime de cumplir los terminos de uso de la plataforma.
- El fine-tune puede degradar capacidades del base (razonamiento, tool calling, coherencia) al modificar los pesos; no hay benchmarks publicados que lo confirmen.
- Uso previsto por el autor: investigacion. No se recomienda su despliegue en productos orientados a usuarios finales.
- No se documentan sesgos especificos de esta variante; los sesgos del base Qwen2.5-Coder pueden persistir o amplificarse.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio oficial de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Paper de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
