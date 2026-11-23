# riccardoroselli/qwen3.5-2b-gym-grpo-GGUF

## Resumen

`riccardoroselli/qwen3.5-2b-gym-grpo-GGUF` es la distribucion en formato GGUF de un ajuste fino del modelo base Qwen/Qwen3.5-2B, especializado en la generacion de rutinas de gimnasio en JSON. El autor, riccardoroselli, parte de un modelo de 1.942.653.248 parametros (aproximadamente 1,94 mil millones) y lo somete a un proceso de SFT con LoRA seguido de GRPO (Group Relative Policy Optimization) para forzar la salida estructurada. El resultado es un modelo de tarea unica que transforma peticiones en lenguaje natural sobre entrenamientos de gimnasio en objetos JSON con nombres de ejercicios extraidos de un catalogo externo.

La relevancia de esta publicacion no reside en capacidades generales de razonamiento o generacion de texto, sino en la demostracion de un pipeline completo de ajuste fino con RL aplicado a un dominio cerrado y verificable. El modelo incluye un template de chat que inyecta automaticamente el mensaje de sistema de entrenamiento y desactiva el modo thinking, ademas de fijar temperatura 0 por defecto, de modo que una peticion de chat estandar reproduce exactamente el prompt de evaluacion. Se distribuyen unicamente dos cuantizaciones: Q8_0 (recomendada) y BF16 (referencia), ambas publicadas con hashes SHA256 verificables.

El modelo esta pensado para integrarse en aplicaciones de fitness, como demuestra la imagen Docker del proyecto GymLeader, que ejecuta el sistema completo con guardas y verificador de reintentos sobre CPU. No es un chatbot: la model card insiste en una peticion por chat nueva, sin saludos ni seguimientos, y advierte de que la cuantizacion Q4_K_M no se publica porque degrada severamente las metricas obtenidas tras el GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-2B), ajustada con SFT (LoRA) y GRPO |
| Parametros totales | 1.942.653.248 (aproximadamente 1,94 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos de despliegue usan `-c 4096` |
| Tipos de cuantizacion | Q8_0 (8,5 bits por peso) y BF16 (16 bits por peso); Q4_K_M medido pero no publicado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors disponible en el modelo base `riccardoroselli/qwen3.5-2b-gym-grpo` para MLX |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen/Qwen3.5-2B, con aproximadamente 1,94 mil millones de parametros. Sobre esa base, el autor aplica un ajuste fino supervisado (SFT) mediante LoRA, seguido de un entrenamiento con GRPO, una variante de optimizacion por politica relativa de grupo que refuerza las respuestas que cumplen el formato y las restricciones del dominio. El objetivo del entrenamiento es producir exclusivamente un objeto JSON con la forma `{"workout": [{"name", "sets", "reps"}, ...]}` o, cuando no hay suficientes ejercicios que cumplan la peticion, `{"error": "..."}`. Los nombres de ejercicios deben provenir del catalogo del repositorio `hasaneyldrm/exercises-dataset`.

La innovacion tecnica principal no esta en la arquitectura sino en el empaquetado para inferencia: los ficheros GGUF incluyen un template de chat que anade el mensaje de sistema de entrenamiento cuando la conversacion no trae uno y que desactiva siempre el modo thinking. Ademas, la temperatura por defecto del fichero es 0 (decodificacion greedy). El modelo nunca vio bloques de razonamiento durante el entrenamiento, por lo que el template los suprime de forma explicita. El autor documenta que la cuantizacion Q4_K_M fue medida y descartada: degradaba la metrica `all_correct` a 0,25 frente a 0,54 en BF16, y la presencia de nombres validos del catalogo caia al 82 % frente al 95 %. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset.

## Capacidades

- Generacion de rutinas de gimnasio en JSON estructurado a partir de una peticion en lenguaje natural (tipo de entrenamiento, dificultad, equipamiento y numero de ejercicios).
- Salida con esquema fijo: `{"workout": [{"name", "sets", "reps"}, ...]}` o `{"error": "..."}` cuando la peticion no puede satisfacerse con el catalogo disponible.
- Seleccion de nombres de ejercicios restringida al catalogo externo `hasaneyldrm/exercises-dataset`.
- Gestion de peticiones imposibles o inconsistentes devolviendo un objeto de error controlado.
- Modo thinking desactivado de forma forzada por el template: no genera bloques de razonamiento.
- Capacidad multilingue limitada al ingles (`language: [en]`); no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No se documenta vision, audio ni otras modalidades.

## Casos de uso

- Generacion automatica de rutinas en una app de fitness: la aplicacion envia la peticion del usuario ("chest workout, medium difficulty, free weights, 4 exercises") al endpoint de chat y recibe un JSON listo para renderizar en la interfaz, sin necesidad de parseo adicional.
- Backend de un planificador de entrenamientos semanal: encadenando varias peticiones (una por dia o grupo muscular) se construye un plan completo, validando cada respuesta contra el catalogo de ejercicios.
- Filtrado y validacion en pipelines de contenido: el objeto `{"error": "..."}` permite discriminar peticiones no cubiertas por el catalogo sin recurrir a un segundo modelo.
- Despliegue local en escritorio o portatil: con el fichero Q8_0 (unos 2 GB) y llama.cpp o LM Studio, el modelo cabe en equipos consumer y funciona sin GPU dedicada, lo que facilita prototipos y demos offline.
- Integracion en el sistema GymLeader: la imagen Docker `ghcr.io/riccardoroselli/gymleader:v1.0` ejecuta el modelo con guardas y verificador de reintentos sobre CPU, descargando y verificando por SHA256 el fichero Q8_0 en el primer arranque.
- Servicio HTTP interno con llama-server: el binario expone `/v1/chat/completions` compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes que ya consumen esa API.
- Evaluacion de pipelines de RL para dominios cerrados: el par SFT+GRPO y las metricas publicadas (`all_correct`, presencia en catalogo) sirven como referencia reproducible para experimentos similares en otros dominios verificables.
- Generacion de datos sinteticos de entrenamiento: las rutinas JSON producidas pueden usarse como corpus estructurado para otros sistemas de recomendacion de ejercicios.

## Benchmarks y rendimiento

La model card publica resultados sobre 300 peticiones de test (combinaciones y formulaciones no vistas en entrenamiento, 16 de ellas imposibles), con decodificacion greedy, thinking desactivado y puntuadas por el verificador del proyecto. Se comparan las dos cuantizaciones publicadas:

| Metrica | Q8_0 | BF16 | Q4_K_M (no publicado) |
|---|---|---|---|
| all_correct | no disponible en el extracto | 0,54 | 0,25 |
| Nombres presentes en el catalogo | no disponible en el extracto | 0,95 | 0,82 |

Rendimiento de inferencia medido con `llama-bench` (llama.cpp b12360) en un Apple M4 MacBook Air con Metal, todas las capas en GPU y 3 repeticiones:

| Fichero | Escritura (tg128) | Lectura de prompt (pp512) |
|---|---|---|
| Q8_0 | 43,2 tok/s | 918 tok/s |
| BF16 | 25,5 tok/s | 958 tok/s |

El autor indica que estas cifras variaran en otro hardware y seran inferiores en CPU. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para Q8_0 y aproximadamente 4 GB para BF16, segun el tamano de los ficheros (2.076.675.008 bytes y 3.897.387.968 bytes respectivamente).
- GPU recomendadas: no se especifican modelos concretos; las mediciones publicadas usan una Apple M4 MacBook Air con Metal. Cualquier GPU consumer con al menos 4 GB de VRAM deberia poder cargar el fichero Q8_0.
- Cabe en GPU consumer: si, con el fichero Q8_0 en practicamente cualquier GPU consumer moderna; el BF16 requiere algo mas de margen.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio (probado con la version 0.4.28 y motor llama.cpp b12270), la imagen Docker de GymLeader (CPU, linux/amd64 y linux/arm64) y MLX en Apple Silicon usando el modelo safetensors base.
- Latencia y throughput: 43,2 tok/s de generacion y 918 tok/s de procesamiento de prompt con Q8_0 en M4; 25,5 tok/s y 958 tok/s con BF16. En CPU el rendimiento sera inferior.
- Parametros de servidor sugeridos en la model card: `-ngl all -c 4096 -np 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| riccardoroselli/qwen3.5-2b-gym-grpo-GGUF | 1,94 mil millones | no disponible | Generacion de rutinas de gimnasio en JSON (SFT+GRPO) | apache-2.0 | GGUF en Hugging Face; safetensors en el modelo base |
| Qwen/Qwen3.5-2B (base) | aproximadamente 2 mil millones | no disponible | Modelo generalista de texto | no disponible en la informacion proporcionada | Hugging Face |
| riccardoroselli/qwen3.5-2b-gym-grpo (safetensors) | 1,94 mil millones | no disponible | Mismo ajuste fino, formato safetensors para MLX | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks estandar para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparacion relevante es frente a su modelo base y frente a la version safetensors del mismo ajuste, que comparten pesos pero difieren en formato y en el ecosistema de despliegue.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un chatbot. La model card exige una peticion por chat nueva, sin saludos ni seguimientos; usarlo como asistente conversacional producira resultados fuera de distribucion.
- Solo ingles: el unico idioma declarado es `en`; las peticiones en castellano no estan evaluadas.
- Riesgo de alucinacion controlado pero presente: el modelo puede devolver nombres de ejercicios fuera del catalogo o combinaciones no validas; el proyecto GymLeader mitiga esto con un verificador y reintentos, pero el modelo por si solo no garantiza la validez.
- La cuantizacion Q4_K_M no se publica por perdida de calidad: `all_correct` cae de 0,54 a 0,25 y la presencia en catalogo del 95 % al 82 %. No se recomienda generar cuantizaciones mas agresivas sin reevaluar.
- El template de chat inyecta un mensaje de sistema de entrenamiento; si el usuario envia uno propio, lo reemplaza y ese escenario no fue evaluado.
- Temperatura 0 obligatoria para reproducir los resultados; LM Studio no lee la temperatura por defecto del fichero y hay que fijarla manualmente.
- Las penalizaciones por repeticion deben permanecer desactivadas, como en todas las evaluaciones publicadas.
- El contexto maximo no esta documentado; los ejemplos de despliegue usan 4096 tokens, pero no se confirma cual es el limite real del modelo.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en dominios distintos al de fitness.
- El rendimiento medido corresponde a Apple Silicon con Metal; en CPU y en otras GPU las cifras seran distintas y potencialmente mucho menores.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/riccardoroselli/qwen3.5-2b-gym-grpo-GGUF
- Modelo base en safetensors (para MLX): https://huggingface.co/riccardoroselli/qwen3.5-2b-gym-grpo
- Revision concreta de los ficheros: https://huggingface.co/riccardoroselli/qwen3.5-2b-gym-grpo-GGUF/tree/bbb1d3cf7f9113ec518b56c95a74702bbd83ba9b
- Catalogo de ejercicios: https://github.com/hasaneyldrm/exercises-dataset
- Imagen Docker del sistema GymLeader: ghcr.io/riccardoroselli/gymleader:v1.0
- Modelo base original: Qwen/Qwen3.5-2B (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
