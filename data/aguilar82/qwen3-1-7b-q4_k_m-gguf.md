# Aguilar82/Qwen3-1.7B-Q4_K_M-GGUF

## Resumen
Aguilar82/Qwen3-1.7B-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo Qwen/Qwen3-1.7B, publicada por el usuario Aguilar82. No se trata de un modelo nuevo ni reentrenado: es una conversion del modelo original de Qwen (Alibaba) a formato GGUF con cuantizacion Q4_K_M, realizada mediante la herramienta GGUF-my-repo de Hugging Face. El objetivo es permitir la ejecucion local del modelo en hardware modesto, incluido CPU, a traves de Ollama.

El modelo base cuenta con 2.031.739.904 parametros (aproximadamente 2,03 mil millones) y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 1,3 GB y esta etiquetado como compatible con endpoints y orientado a conversacion. La model card documenta pruebas empiricas realizadas por el autor en un equipo con CPU Intel Core i5-1155G7, 7,75 GB de RAM e iGPU Intel Iris Xe, ejecutando al 100 % en CPU con contexto de 4096 tokens.

Su relevancia practica radica en que demuestra un flujo de despliegue local de un modelo de la familia Qwen3 en hardware de consumo sin GPU dedicada, con metricas concretas de velocidad (12,73 tokens/s en Q4_K_M) y una comparacion directa frente a la cuantizacion Q8_0 del mismo modelo base. Es una ficha de interes para desarrolladores que quieran evaluar el compromiso entre calidad y rendimiento en cuantizaciones de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3-1.7B; no detallada en la informacion disponible) |
| Parametros totales | 2.031.739.904 (aprox. 2,03 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (valor usado en las pruebas; el maximo del modelo base no se detalla) |
| Tipos de cuantizacion | Q4_K_M (esta publicacion); existe una variante Q8_0 del mismo autor |
| Idiomas soportados | es (segun la model card); el resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,3 GB); el modelo base usa safetensors |
| Tamano del archivo GGUF | 1,28 GB (Q4_K_M) |
| Memoria en Ollama | 1,8 GB (Q4_K_M) |
| Libreria declarada | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
La arquitectura corresponde al modelo base Qwen/Qwen3-1.7B, un transformer de aproximadamente 2,03 mil millones de parametros. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se especifican innovaciones tecnicas del modelo base (atencion, decodificacion especulativa, etc.).

Lo relevante desde el punto de vista de esta publicacion es que el modelo no ha sido reentrenado ni ajustado: la model card indica explicitamente que solo se realizo conversion a GGUF y cuantizacion Q4_K_M con GGUF-my-repo. El comportamiento como "asistente de Java" descrito en las pruebas se consigue mediante un mensaje de sistema en Ollama, no mediante fine-tuning. Por tanto, las capacidades reales son las del Qwen3-1.7B original, moduladas por la perdida de precision de la cuantizacion de 4 bits.

## Capacidades
- Generacion de texto conversacional multi-turno, con soporte de mensajes de sistema.
- Razonamiento basico y respuesta a preguntas generales (geografia, logica sencilla, explicaciones tecnicas).
- Generacion de codigo, con resultados correctos en la prueba de funcion Python de la bateria del autor.
- Traduccion (la prueba de traduccion al ingles obtuvo puntuacion maxima).
- Generacion de JSON: capacidad presente pero degradada en Q4_K_M (puntuacion 0 en la prueba del autor).
- Soporte de instrucciones de formato y rol mediante system prompt (parcial: se detectaron incumplimientos).
- Ejecucion local en CPU mediante Ollama, sin necesidad de GPU.
- Tool calling, function calling, agentes y vision: no disponible en la informacion proporcionada.

## Casos de uso
- Asistente de programacion en Java para estudiantes: el autor lo configura con un system prompt especifico para alumnos de DAM, con temperatura 0.2 y contexto de 4096; el modelo explica codigo con sencillez y admite ejecucion 100 % en CPU en portatiles modestos.
- Despliegue local en portatiles sin GPU dedicada: con 1,8 GB de memoria en Ollama y 12,73 tokens/s en un i5-1155G7, es viable para prototipos y uso personal en equipos de gama baja.
- Respuestas a preguntas generales y explicaciones tecnicas: obtuvo puntuacion maxima en preguntas de cultura general y explicacion de conceptos (direcciones IP), adecuado para bots de consulta simples.
- Traduccion asistida de textos cortos: la prueba de traduccion al ingles fue correcta, por lo que puede usarse para traduccion de fragmentos en flujos de trabajo locales.
- Generacion de funciones y snippets de codigo en pipelines de desarrollo: util para autocompletado o borradores de funciones en entornos con requisitos de privacidad, ya que todo se ejecuta en local.
- Base para experimentacion con cuantizaciones: sirve para comparar Q4_K_M frente a Q8_0 en terminos de calidad, velocidad y memoria antes de decidir el formato de despliegue en produccion.
- Chatbot de bajo coste integrado via API compatible con endpoints: la etiqueta endpoints_compatible permite servirlo con herramientas de inferencia estandar, aunque el rendimiento en formato estructurado (JSON) es limitado en esta cuantizacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye una bateria propia de 10 pruebas cualitativas (puntuacion 2 = correcta, 1 = parcial, 0 = incorrecta) y mediciones de velocidad y memoria:

| Metrica | Q4_K_M | Q8_0 |
|---|---:|---:|
| Tamano GGUF | 1,28 GB | 2,17 GB |
| Memoria en Ollama | 1,8 GB | 2,7 GB |
| Velocidad mediana (eval rate) | 12,73 tokens/s | 8,47 tokens/s |
| Puntuacion bateria (sobre 20) | 14/20 | 18/20 |

| Prueba | Q4_K_M | Q8_0 |
|---|---:|---:|
| Capital de Australia | 2 | 2 |
| Horario del tren | 2 | 2 |
| Problema de las manzanas | 1 | 2 |
| Traduccion al ingles | 2 | 2 |
| Funcion Python | 2 | 2 |
| Generacion de JSON | 0 | 1 |
| Resumen de Ollama | 1 | 2 |
| Mundial de 2030 | 1 | 2 |
| Explicacion de una IP | 1 | 1 |
| Mensaje de sistema | 2 | 2 |
| Total | 14 | 18 |

Condiciones de medida: Windows 11, Intel Core i5-1155G7 a 2,50 GHz, 7,75 GB de RAM, Intel Iris Xe Graphics, ejecucion 100 % en CPU, contexto de 4096 tokens. La velocidad se midio con `ollama run --verbose` (mediana de tres repeticiones) y la memoria con `ollama ps`. La muestra es de diez preguntas y no es representativa de otras tareas.

## Requisitos de hardware
- VRAM/RAM estimada: 1,8 GB de memoria en Ollama para Q4_K_M; 2,7 GB para Q8_0.
- GPU dedicada: no necesaria; las pruebas se realizaron integramente en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2-3 GB de VRAM libres (por ejemplo, GTX 1650, RTX 3050 en adelante), aunque no se aportan mediciones en GPU.
- CPU: validado en Intel Core i5-1155G7 (4 nucleos, 2,50 GHz) con 7,75 GB de RAM; se recomienda al menos 8 GB de RAM en el sistema.
- Opciones de despliegue: Ollama (documentado en la model card con `ollama pull hf.co/Aguilar82/Qwen3-1.7B-Q4_K_M-GGUF:Q4_K_M` y Modelfile); al ser GGUF, es compatible con llama.cpp y otras herramientas que consuman este formato. vLLM y TGI no estan documentados para esta publicacion.
- Latencia y throughput: 12,73 tokens/s de mediana en CPU (Q4_K_M) frente a 8,47 tokens/s (Q8_0), con contexto de 4096 tokens. No hay datos de latencia de primera respuesta ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Aguilar82/Qwen3-1.7B-Q4_K_M-GGUF | 2,03 B | 4096 (usado en pruebas) | GGUF Q4_K_M | Apache 2.0 | 1,28 GB; 12,73 tok/s en CPU; 14/20 en bateria propia |
| Aguilar82/Qwen3-1.7B-Q8_0-GGUF | 2,03 B | 4096 (usado en pruebas) | GGUF Q8_0 | Apache 2.0 | 2,17 GB; 8,47 tok/s en CPU; 18/20 en bateria propia |
| Qwen/Qwen3-1.7B (original) | 2,03 B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar; referencia de maxima calidad |

La comparacion con modelos de otros autores (por ejemplo, Llama 3.2 1B o Gemma 2 2B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- Perdida de calidad por cuantizacion: Q4_K_M obtuvo 14/20 frente a 18/20 de Q8_0 en la bateria del autor, con fallos concretos en razonamiento matematico y generacion de JSON.
- Incumplimiento de formato: ambos modelos incumplieron algunas instrucciones de formato y produjeron respuestas demasiado extensas.
- Alucinacion: la model card advierte explicitamente de que el modelo puede inventar informacion.
- Contaminacion por system prompt: el mensaje de sistema orientado a Java influye en respuestas a tareas generales, lo que puede sesgar el comportamiento fuera del dominio previsto.
- Contexto limitado: las pruebas se realizaron con 4096 tokens; el maximo del modelo base no se documenta en esta publicacion.
- Idiomas: solo se declara espanol; el resto de idiomas no esta disponible en la informacion.
- Muestra de evaluacion reducida: diez preguntas no permiten extrapolar el rendimiento a otras tareas.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3-1.7B.
- Modelo no reentrenado: no incorpora ajustes especificos para Java; el comportamiento como asistente depende enteramente del system prompt.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Aguilar82/Qwen3-1.7B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante Q8_0 del mismo autor: https://huggingface.co/Aguilar82/Qwen3-1.7B-Q8_0-GGUF
- Herramienta de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Ollama: https://ollama.com
