# minsore/quill-1-preview

## Resumen

Quill 1 Preview es un modelo de autocompletado de codigo de 494.032.768 parametros (0,5B) publicado por minsore, un laboratorio ucraniano de IA que desarrolla modelos abiertos. Se trata de un ajuste fino mediante QLoRA sobre Qwen/Qwen2.5-Coder-0.5B-Instruct, especializado en tareas de fill-in-the-middle (FIM) con los tokens `<fim_prefix>`, `<fim_suffix>`, `<fim_middle>` y `<fim_pad>`, pensado para integrarse en IDEs y editores como motor de sugerencias en linea.

El problema que aborda es concreto: la mayoria de modelos de 0,5B publicados estan entrenados para chat o para generacion de codigo completa, no para infilling nativo, que es la operacion real que necesita un autocompletado dentro de un editor (rellenar el hueco entre el codigo que hay antes y despues del cursor). Quill cubre ese nicho con un modelo que cabe en cualquier GPU de consumo y que en Q4_K_M ocupa unos 400 MB, con un contexto de 1024 tokens y licencia Apache 2.0.

Su relevancia radica en los resultados en benchmarks especificos de FIM: obtiene 0,423 de EditSim en HumanEval-Infilling frente a 0,045 del modelo base y 0,041 de Granite 4.0 1B, y 45,0% en NextBench v0.2 frente al 41,7% de Qwen2.5-Coder 0.5B. El contrapunto es que en generacion pura (HumanEval@50) se queda en 54,0%, muy por debajo del 96,0% de Arche-Codium 0.5B. El autor ya ha anunciado una hoja de ruta con Quill 2 para corregir el bucle de numeros y ampliar a JS/TS/Rust.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, ajustado con QLoRA sobre Qwen2.5-Coder-0.5B-Instruct |
| Parametros totales | 494.032.768 (0,494B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (~400 MB, recomendada), GGUF f16 (~1 GB); adaptador LoRA (~35 MB) para reentrenamiento |
| Idiomas soportados | Ingles y codigo; datos de FIM exclusivamente en Python |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (la libreria declarada es llama.cpp) |
| Modelo base | Qwen/Qwen2.5-Coder-0.5B-Instruct |
| Tokens especiales FIM | `<fim_prefix>`, `<fim_suffix>`, `<fim_middle>`, `<fim_pad>`; parada con `<fim_end>` y `<|endoftext|>` |
| Plantilla de chat | Ninguna: requiere `--chat-template none` |
| Tamano del repositorio | 2,4 GB |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 494 millones de parametros. El ajuste se realizo con QLoRA de rango 16 y alpha 16 durante una unica epoca, utilizando el framework Unsloth, sobre una mezcla de datos de fill-in-the-middle y datos de instrucciones en Python. No se documenta el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset, ni se menciona el uso de RLHF o DPO: el metodo declarado es exclusivamente QLoRA supervisado.

La innovacion tecnica no esta en la arquitectura, sino en la especializacion: el modelo aprende de forma nativa los tokens centinela de FIM, lo que le permite recibir un prefijo y un sufijo y generar unicamente el fragmento intermedio. Segun el autor, este entrenamiento anade capacidad de infilling sin degradar la generacion de codigo, ya que el HumanEval@50 se mantiene en linea con el modelo base (54,0% frente a 52,0%). El repositorio incluye tambien el adaptador LoRA en formato safetensors para quien quiera continuar el ajuste con sus propios datos.

## Capacidades

- Rellenado de codigo intermedio (fill-in-the-middle) nativo mediante los tokens `<fim_prefix>`, `<fim_suffix>` y `<fim_middle>`.
- Autocompletado en tiempo real dentro de editores: el endpoint `/infill` de `llama-server` devuelve el fragmento que falta entre dos bloques de codigo.
- Generacion de codigo Python completa: 54,0% en HumanEval@50, practicamente identico al modelo base (52,0%).
- Completado de cuerpos de funcion, condiciones, expresiones de retorno y estructuras de control en Python.
- Generacion determinista con `temperature=0.0`, pensada para sugerencias estables y reproducibles.
- Capacidad limitada como asistente conversacional: el autor indica explicitamente que no funciona como chatbot y requiere desactivar la plantilla de chat.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo esta disenado para una unica pasada de infilling.
- Capacidades multilingues: limitadas a ingles y codigo; el entrenamiento FIM es solo para Python, con soporte de JS/TS/Rust previsto en Quill 2.
- Capacidades especiales: no dispone de modo de razonamiento (thinking), vision ni audio.

## Casos de uso

- Autocompletado en el IDE: integrado como backend del endpoint `/infill` de `llama-server`, sugiere la linea o el bloque que falta entre el codigo anterior y posterior al cursor, con latencia apta para escritura en vivo gracias a sus 400 MB en Q4_K_M.
- Relleno de funciones incompletas: dado un `def` con firma y un `print` de comprobacion debajo, genera el cuerpo completo de la funcion, como muestra el ejemplo del propio autor con la sucesion de Fibonacci.
- Migracion de fragmentos de codigo: al pegar el codigo nuevo despues del punto de insercion, el modelo completa automaticamente el pegamento necesario entre ambos bloques (imports, adaptadores de firma, conversion de tipos).
- Asistencia offline o en entornos aislados: al ejecutarse con llama.cpp y requerir solo 2 GB de VRAM, puede desplegarse en estaciones de trabajo sin conexion donde no se permite enviar codigo a APIs externas.
- Prototipado sobre portatiles y equipos sin GPU dedicada: con cuantizacion Q4_K_M y offload parcial a CPU funciona como servidor local de autocompletado incluso en maquinas modestas.
- Generacion de plantillas de pruebas y codigo repetitivo: util para completar esqueletos de tests y bloques de codigo boilerplate en Python, teniendo en cuenta que ocasionalmente anade tests despues de la funcion generada.
- Fine-tuning especifico de dominio: el adaptador LoRA incluido en el repositorio permite reajustar el modelo a convenciones internas de una empresa o a un framework concreto sin partir del modelo completo.
- Evaluacion comparativa de tecnicas FIM: sirve como referencia abierta de 0,5B para medir EditSim y Exact Match en pipelines de investigacion sobre infilling.

## Benchmarks y rendimiento

Todos los resultados son los publicados por el autor, con `temperature=0.0` y modo FIM puro (`--chat-template none`).

| Benchmark | Quill 1 Preview | Arche-Codium 0.5B | Granite 4.0 1B | Qwen2.5-Coder 0.5B |
|---|---:|---:|---:|---:|
| HumanEval@50 | 54,0% | 96,0% | 58,0% | 52,0% |
| HumanEval-Infilling (EditSim) | 0,423 | 0,053 | 0,041 | 0,045 |
| HumanEval-Infilling (Exact Match) | 16% | 0% | 0% | 0% |
| NextBench v0.2 (autocomplete) | 45,0% | 5,0% | 25,0% | 41,7% |
| Delulu FIM (EditSim) | 0,318 | 0,087 | 0,041 | 0,035 |

El propio autor resume la lectura de estos datos: en benchmarks especificos de FIM la ventaja sobre los competidores es de 8 a 10 veces, mientras que en generacion de codigo pura (HumanEval) el modelo iguala al base sin mejorarlo. En Delulu FIM, orientado a APIs poco conocidas, el EditSim de 0,318 refleja que el modelo sigue alucinando en ese escenario.

## Requisitos de hardware

- VRAM estimada: unos 400 MB para el archivo Q4_K_M y alrededor de 1 GB para la version f16; el autor indica que basta cualquier GPU con 2 GB o mas de VRAM para hacer offload completo.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe sobradamente en A100 o H100, aunque estan sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes del modelo; funciona incluso con offload parcial a CPU si no hay GPU disponible.
- Opciones de despliegue: llama.cpp mediante `llama-server` con la flag `-ngl 99` y `--chat-template none`; el formato GGUF permite usarlo tambien en Ollama o LM Studio. El soporte en vLLM o TGI no esta documentado y requeriria los pesos en safetensors.
- Parametros de inferencia recomendados: `n_predict` entre 128 y 256, `temperature=0.0`, `repeat_penalty=1.1` y parada con `["<fim_end>", "<|endoftext|>", "\n\n\n"]`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval@50 | NextBench v0.2 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Quill 1 Preview | 0,494B | 1024 tokens | 54,0% | 45,0% | Apache 2.0 | GGUF y safetensors en HuggingFace |
| Arche-Codium 0.5B | 0,5B | no disponible | 96,0% | 5,0% | no disponible | no disponible en la informacion proporcionada |
| Granite 4.0 1B | 1B | no disponible | 58,0% | 25,0% | no disponible | no disponible en la informacion proporcionada |
| Qwen2.5-Coder 0.5B (base) | 0,494B | no disponible en esta ficha | 52,0% | 41,7% | Apache 2.0 | safetensors en HuggingFace |

La comparativa muestra un perfil claramente diferenciado: Quill renuncia al rendimiento en generacion de codigo completa a cambio de un rendimiento muy superior en infilling. Arche-Codium 0.5B domina la generacion (96,0% en HumanEval@50) pero cae a 0,053 de EditSim y al 5,0% en NextBench, es decir, rinde mal en la tarea de autocompletado. Granite 4.0 1B duplica el tamano y no supera a Quill en las metricas FIM.

## Limitaciones y advertencias

- Modelo exclusivamente de autocompletado: no funciona como asistente conversacional y el autor exige desactivar la plantilla de chat.
- Contexto de solo 1024 tokens: los archivos largos se truncan, lo que degrada la calidad de las sugerencias en ficheros grandes.
- Solo Python en la parte de FIM: no hay soporte entrenado para JavaScript, TypeScript, Rust ni otros lenguajes hasta Quill 2.
- Bucle de numeros: puede repetir enteros grandes en determinados prompts; el autor recomienda `repeat_penalty=1.1` como mitigacion.
- Anade pruebas tras la funcion en ocasiones, heredado de la mezcla de datos de instrucciones y FIM, lo que puede insertar codigo no deseado en el editor.
- Alucinacion en APIs poco conocidas: el EditSim de 0,318 en Delulu FIM evidencia que inventa llamadas a funciones o metodos inexistentes.
- Idiomas naturales: solo ingles; no hay soporte documentado de castellano ni de otros idiomas.
- HumanEval@50 de 54,0%, muy por debajo de alternativas del mismo tamano como Arche-Codium 0.5B (96,0%), por lo que no es adecuado como generador de codigo completo.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones adicionales mas alla de las del modelo base, que comparte la misma licencia; no se documentan clausulas adicionales.
- Cifras de adopcion muy bajas (0 descargas, 1 like al consultar), sin validacion independiente de los benchmarks publicados por el autor.
- Para produccion conviene fijar `temperature=0.0` y validar las sugerencias: el modelo esta pensado como asistencia, no como fuente de codigo verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minsore/quill-1-preview
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Sitio del autor (Minsore): https://minsore.com
- Organizacion en HuggingFace: https://huggingface.co/minsore
- Perfil del autor: https://huggingface.co/Sollamon
- Framework de entrenamiento (Unsloth): https://github.com/unslothai/unsloth
- Motor de inferencia (llama.cpp): https://github.com/ggerganov/llama.cpp
- Enlaces adicionales procedentes de la busqueda web: no se han encontrado resultados relevantes sobre este modelo; los resultados devueltos corresponden a servicios no relacionados (Digiposte / La Poste).
