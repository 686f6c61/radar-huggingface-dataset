# kabe0515/ero-prompt-writer-8b-v2-GGUF

## Resumen

ero-prompt-writer-8b-v2 es un ajuste fino (fine-tune) de Qwen3-8B desarrollado por el usuario kabe0515, especializado en una única tarea: convertir texto de escenas (principalmente en japones, tambien ingles y chino) en prompts de imagen en ingles estructurados como JSON, sin eufemismos. El modelo parte de una base Qwen3-8B sin modificar (no abliterada) y se entrena mediante QLoRA para evitar el problema habitual de los LLM genericos de prompts, que tienden a suavizar u omitir elementos explicitos y a perder el vinculo sujeto-objeto (quien hace que a quien).

La relevancia del modelo es acotada pero clara: cubre un nicho de pipeline para frontends de generacion de imagenes que necesitan un conversor determinista de instrucciones a JSON con campos `positive_prompt` y `negative_prompt`. No es un modelo conversacional ni de chat libre; su diseno asume que la aplicacion envia una instruccion fija y el modelo solo transforma. Se distribuye unicamente en formato GGUF Q4_K_M (5,0 GB) para llama.cpp, con licencia Apache 2.0 y etiqueta `not-for-all-audiences`.

El modelo tiene 8 mil millones de parametros, contexto nativo de Qwen3-8B (32 768 tokens segun el ejemplo de despliegue del autor) y soporta japones como idioma principal de entrenamiento, con ingles y chino verificados en la practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B), fine-tune QLoRA fusionado |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (valor usado en el ejemplo de llama-server del autor) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | Japones (principal), ingles, chino; otros (coreano, etc.) no probados |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune QLoRA sobre Qwen3-8B en estado original (stock, sin abliterar). El ajuste usa rango 16, learning rate 1e-4, 3 epocas y 1 148 filas sinteticas de instruccion, con una `train_loss` final de 0,3111. Los pesos LoRA se fusionan en el modelo base y se exportan a GGUF Q4_K_M. No hay vision ni modalidades adicionales.

Los datos de entrenamiento son completamente sinteticos, generados combinando plantillas escritas a mano con un script: no hay texto raspado de la web, ni extractos de obras de terceros, ni datos personales. La composicion incluye ejercicios de actos (con contrastes de vinculacion sujeto-objeto y de autoestimulacion), ejercicios de vocabulario, 24 posiciones con variaciones, escenas completas, entradas vagas o eufemisticas y filas de replay no eroticas para evitar sangrado tematico. Un segundo lote de 223 filas ("patch") cubre ropa transparente (143 filas), composicion y acciones combinadas. La innovacion tecnica principal no es arquitectonica sino de entrenamiento: forzar que la salida nunca sea sexualmente mas debil que la entrada y que la direccion de la accion (sujeto/objeto) se mantenga explicita.

## Capacidades

- Conversion de texto de escena (japones, ingles, chino) a JSON con `positive_prompt` y `negative_prompt` en ingles explicito.
- Preservacion de elementos explicitos: genitales, posiciones, fluidos, ropa transparente y composicion de plano.
- Vinculacion sujeto-objeto explicita (quien realiza la accion y sobre quien), con contraste entrenado para evitar inversiones de direccion o genero.
- Generacion de vocabulario descriptivo de encuadre y estilo (angulo, iluminacion, estilo anime semi-realista, etc.).
- Conversion de entradas vagas o eufemisticas a prompts explicitos.
- Manejo de escenas no eroticas sin sangrado tematico (controles de paraguas, biblioteca, cafeteria de gatos).
- Modo thinking desactivable; el autor exige `enable_thinking: false` para evitar inversiones de direccion con entradas vagas.
- No soporta tool calling, function calling, agentes, vision ni audio (no documentado; el modelo es solo texto y conversion).
- No soporta chat libre ni roleplay: las peticiones de novela erotica se rechazan y las descripciones de rol devuelven salida vacia.

## Casos de uso

- Frontend de generacion de imagenes: el modelo actua como capa de traduccion entre la descripcion del usuario y el JSON que consume el backend de difusion, gracias a su formato de salida fijo y determinista.
- Pipelines de automatizacion por lotes: conversion de lotes de escenas japonesas a prompts JSON en ingles para generar conjuntos de imagenes, con decodificacion greedy y thinking desactivado para reproducibilidad.
- Herramientas de autoria para ilustradores: el usuario escribe una escena en japones y obtiene un prompt estructurado que preserva composicion, ropa y acciones sin reescritura manual.
- Sistemas de moderacion y preprocesado: al devolver JSON estricto, la salida se puede validar y filtrar programaticamente antes de enviarla a un generador de imagenes.
- Investigacion sobre fidelidad de conversion: el modelo sirve como caso de estudio de fine-tune QLoRA pequeno (1 148 filas) para tareas de transformacion estricta con control de eufemismos y de vinculacion sujeto-objeto.
- Despliegue local en llama.cpp: con 5,0 GB en Q4_K_M cabe en GPU de consumo y permite servir la conversion en estaciones de trabajo sin infraestructura en la nube.
- Traduccion de instrucciones multilingues: entradas en chino o ingles se convierten al mismo esquema JSON en ingles, util en interfaces con usuarios de distintos idiomas.

## Benchmarks y rendimiento

El autor publica un test de conversion de 16 casos (direccion de la accion, posiciones, ropa transparente, composicion, expresiones de fluidos y 3 controles no eroticos), con decodificacion greedy y reasoning desactivado:

| Modelo | Casos superados | Elementos conservados | Formato JSON | train_loss |
|---|---|---|---|---|
| v1 (Qwen3-8B, 925 filas) | 12/16 | 13/19 | 16/16 | 0,3684 |
| v2 (este modelo, 1 148 filas) | 15/16 (16/16 segun el autor) | 18/19 | 16/16 | 0,3111 |

El unico fallo formal de v2 fue una cuestion de vocabulario del verificador ("sucks" frente a "sucking"); la salida era sustantivamente correcta. El autor reporta 0 fugas de eufemismo y 0 inversiones de direccion o genero. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,0 GB para los pesos Q4_K_M, mas overhead de contexto; con 32 768 tokens de contexto se recomienda reservar 8-10 GB en total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 o H100 para mayor concurrencia.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM en Q4_K_M; en 6 GB puede requerir reducir contexto.
- Opciones de despliegue: llama.cpp (`llama-server -m ero-prompt-qwen3-8b-v2-Q4_K_M.gguf -c 32768`); no se documentan otros runners (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| ero-prompt-writer-8b-v2 (este) | 8B | 32 768 (segun ejemplo) | Conversion escena a JSON, sin eufemismos | Apache 2.0 | GGUF Q4_K_M |
| ero-prompt-writer-9b-v2 (modelo hermano del autor) | 9B (no confirmado en detalle) | no disponible | Conversion mas chat sin censura en japones | no disponible | GGUF |
| Qwen3-8B (base) | 8B | 32 768 | LLM generalista, con rechazos en tareas explicitas | Apache 2.0 | safetensors, GGUF |
| LLM genericos de escritura de prompts | variable | variable | Conversion generica, tiende a suavizar elementos | variable | variable |

La comparativa con alternativas de la misma categoria es limitada: no se dispone de datos de benchmarks de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo conversion: el chat erotico libre no funciona; las peticiones de novela erotica se rechazan (en chino) y el roleplay devuelve salida vacia por el comportamiento de rechazo de la base original.
- Solo responde de forma fiable a la instruccion fija documentada; frases casuales ("dame un prompt", texto de escena solo) devuelven salida vacia o rechazo por diseno.
- El modo thinking debe estar desactivado (`enable_thinking: false`); con thinking activado, las entradas vagas pueden invertir la direccion de la accion.
- La diversidad de instrucciones es una tarea pendiente reconocida para una futura v3.
- Las escenas combinadas pueden fallar ocasionalmente (el autor lo señala como limitacion residual).
- Idiomas distintos de japones, ingles y chino (coreano, etc.) no estan probados ni garantizados.
- Contenido NSFW explicito: la model card lleva la etiqueta `not-for-all-adult-audiences` y el modelo no es apto para todos los publicos; requiere controles de edad y de politica de contenido en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre la generacion de contenido sexual explicito recae en el desplegador.
- Riesgo de alucinacion y sesgo: no se han publicado evaluaciones especificas; el entrenamiento sintetico con plantillas puede limitar la variedad estilistica y reproducir sesgos de las plantillas.
- El dataset completo no se publica, lo que dificulta la auditoria externa.

## Enlaces

- Hugging Face: https://huggingface.co/kabe0515/ero-prompt-writer-8b-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo hermano (9B, chat sin censura en japones): https://huggingface.co/kabe0515/ero-prompt-writer-9b-v2-GGUF
