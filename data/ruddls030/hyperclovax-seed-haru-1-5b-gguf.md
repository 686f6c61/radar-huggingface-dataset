# ruddls030/HyperCLOVAX-SEED-Haru-1.5B-GGUF

## Resumen

HyperCLOVAX-SEED-Haru-1.5B-GGUF es una adaptacion conversacional en coreano publicada por el usuario ruddls030 a partir de `naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-1.5B`. El autor ha aplicado un ajuste fino con LoRA sobre todas las capas (1500 pasos) usando un conjunto de 4.175 respuestas con el estilo de "Haru", ha fusionado los pesos resultantes y los ha convertido a formato GGUF con cuantizacion Q4_K_M. El resultado es un modelo de aproximadamente 1,59 mil millones de parametros pensado para ejecutarse exclusivamente en CPU dentro del proyecto "HaruPet".

El modelo no es un lanzamiento de Naver, sino una derivacion de la familia HyperCLOVA X SEED distribuida bajo la licencia `hyperclovax-seed`. Su interes practico esta en dos elementos concretos: un tamano muy reducido (el repo ocupa 1,0 GB) que permite inferencia en CPU sin GPU, y una combinacion de generacion con recuperacion (retrieval) de respuestas similares mediante embeddings e5, con un umbral de mezcla en 0,75. Ademas, el autor ha modificado el token EOS a `<|im_end|>` (id 100273) y documenta el cambio segun la clausula 3.1(iii) de la licencia.

La relevancia de esta ficha es acotada pero ilustrativa: se trata de un caso de personalizacion de un modelo pequeno para un unico personaje conversacional en coreano, con 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion externa de su calidad. Los unicos datos de rendimiento disponibles son internos del autor (prueba ciega de 150 preguntas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (deriva del modelo base HyperCLOVAX-SEED-Text-Instruct-1.5B; una conversion de terceros la describe como arquitectura llama) |
| Parametros totales | 1.585.547.264 (≈1,59 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico formato presente en el repo) |
| Idiomas soportados | Coreano (ko) |
| Licencia | HyperCLOVA X SEED Model License Agreement (`license: other`, `license_name: hyperclovax-seed`) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-1.5B`, un modelo instructivo de ~1,5B parametros de la familia HyperCLOVA X SEED. Sobre esa base, el autor aplico un ajuste con LoRA en todas las capas durante 1500 pasos, con un dataset de 4.175 respuestas etiquetadas como "estilo Haru". Posteriormente fusiono el adaptador en los pesos base, cambio el token de fin de secuencia a `<|im_end|>` (id 100273) y convirtio el resultado a GGUF con cuantizacion Q4_K_M. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales sobre la base instructiva.

La innovacion tecnica del autor no esta en la arquitectura, sino en el procedimiento de inferencia descrito en la model card: un flujo hibrido en el que un recuperador basado en embeddings e5 busca las dos respuestas de Haru mas similares a la pregunta del usuario, se insertan como "pistas" al final del system prompt y, en el modo de mezcla, el modelo solo genera cuando la puntuacion de similitud de e5 es inferior a 0,75 (con temperatura 0,4). Este diseno reduce la carga de generacion en CPU y delega en el recuperador los casos con respuesta previa clara.

## Capacidades

- Generacion de texto conversacional en coreano, con un registro y estilo de respuesta fijados por el ajuste LoRA ("voz de Haru").
- Dialogo de un solo turno orientado a respuestas cortas de personaje, con soporte de system prompt para inyectar contexto.
- Funcionamiento en modo hibrido retrieval + generacion: acepta hasta dos respuestas de referencia en el prompt para orientar la salida.
- Inferencia exclusiva en CPU optimizada mediante llama.cpp (`-ngl 0`, `--device none`).
- Compatible con endpoints (etiqueta `endpoints_compatible`) y con el pipeline conversacional de llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al coreano (ko); no se documenta soporte de otros idiomas.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Chatbot de personaje en coreano sobre hardware sin GPU: el modelo cabe en aproximadamente 1 GB en Q4_K_M y esta preparado para ejecutarse con `llama-server` en CPU, de modo que puede desplegarse en portatiles, mini-PC o contenedores ligeros sin tarjeta grafica.
- Sistema hibrido de recuperacion y generacion: combinando un indice de embeddings e5 con el umbral 0,75 descrito por el autor, se puede responder con recuperacion cuando existe una respuesta previa similar y reservar la generacion del modelo para consultas nuevas.
- Asistente embebido en una aplicacion de mascota virtual o companero conversacional ("HaruPet"): el ajuste LoRA fija una personalidad concreta, lo que permitiria mantener una voz coherente entre sesiones sin reentrenar.
- Prototipado rapido de personajes conversacionales: sirve como banco de pruebas para validar la tecnica de LoRA sobre todas las capas con pocos miles de ejemplos antes de escalar a modelos mayores.
- Despliegue en Apple Silicon: el autor reporta 1,3 segundos por respuesta en 4 hilos de CPU de la serie M, lo que lo hace viable para aplicaciones de escritorio en macOS con latencia aceptable en conversacion.
- Ejecucion en entornos con restricciones severas de memoria: con un repo de 1,0 GB, puede incluirse en imagenes de contenedor pequenas, util en despliegues edge o pruebas de integracion continuas que no dispongan de acelerador.
- Base para experimentos de mezcla de politicas: el patron "recuperar si la similitud supera un umbral, generar en caso contrario" es reutilizable en otros dominios de dialogo con respuestas frecuentes y repetitivas.

## Benchmarks y rendimiento

La model card solo publica una evaluacion propia: una prueba ciega de 150 preguntas puntuadas de 0 a 2, con porcentaje de respuestas "desconcertantes" ("엉뚱함"). No se aportan cifras de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

| Configuracion | Puntuacion media | Respuestas erroneas |
|---|---|---|
| Mezcla (e5 ≥ 0,75, si no este modelo) | 1,48 | 9 % |
| Este modelo + pistas | 1,39 | 10 % |
| Seleccion por e5 | 1,25 | 11 % |

Datos de latencia aportados por el autor: 1,3 segundos por respuesta en CPU de la serie M con 4 hilos; 4,2 segundos si se usan unicamente nucleos de eficiencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1,5 GB en Q4_K_M; el modelo esta disenado para ejecutarse sin GPU.
- Memoria RAM recomendada: en torno a 2 GB libres incluyendo el contexto de llama.cpp.
- GPU: no requiere ninguna. El autor indica explicitamente `-ngl 0 --device none -t 4`. Si se quisiera acelerar, cualquier GPU con soporte CUDA o Metal podria recibir capas, aunque no esta documentado ni probado.
- GPU de consumo: irrelevante para el caso de uso previsto; si se descargara a GPU, cabria en practicamente cualquier tarjeta con mas de 2 GB de memoria (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: llama.cpp (`llama-server`), y por formato GGUF tambien Ollama, LM Studio o cualquier runtime compatible con GGUF; TGI o vLLM no son adecuados para este caso de CPU.
- Latencia y throughput: 1,3 s/respuesta en CPU Apple serie M (4 hilos); 4,2 s/respuesta en nucleos de eficiencia. No se publican cifras de throughput en tokens por segundo ni mediciones en CPU x86.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ruddls030/HyperCLOVAX-SEED-Haru-1.5B-GGUF | ~1,59B | GGUF Q4_K_M | Coreano | hyperclovax-seed | Ajuste de personaje, 0 descargas, 0 likes |
| naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-1.5B | no disponible en la informacion | safetensors (original) | Coreano | hyperclovax-seed | Modelo base instructivo; no personalizado |
| rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF | 1,81B segun un directorio de terceros | GGUF Q4_K_M | Coreano | other | Conversion directa sin ajuste de personaje; ~997.000 descargas segun ese mismo directorio |
| cherryDavid/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q8_0-GGUF | no disponible | GGUF Q8_0 | Coreano | other | Conversion sin ajuste, mayor precision y tamano |

La comparacion con modelos de otros fabricantes del mismo rango (por ejemplo alternativas de 1,5B de la familia Qwen o Gemma) no puede establecerse con datos de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin validacion externa: 0 descargas y 0 likes en el momento de la consulta; el unico rendimiento reportado procede del propio autor.
- Idioma restringido: la model card declara unicamente coreano, por lo que su uso en castellano u otros idiomas no esta soportado ni evaluado.
- Sesgo de personaje: el ajuste se ha realizado sobre 4.175 respuestas con un estilo concreto, lo que puede limitar la diversidad de registros y reforzar patrones repetitivos.
- Riesgo de alucinacion: al ser un modelo de ~1,5B, la precision factual es limitada; el propio autor mitiga esto con recuperacion por embeddings en lugar de generacion libre.
- Token EOS no estandar: se ha fijado `<|im_end|>` (id 100273), lo que exige configurar correctamente el plantilla de chat en el runtime para evitar salidas truncadas o mal delimitadas.
- Restricciones de licencia: se aplica la HyperCLOVA X SEED Model License Agreement; la seccion 2.3 prohibe usos como vigilancia ilegal, tratamiento de datos biometricos sin consentimiento, acoso o engano, y estas restricciones se extienden a usuarios derivados. No se detalla en la informacion disponible si el uso comercial esta permitido sin condiciones adicionales.
- Ambito de despliegue: el autor lo plantea como CPU-only; no hay pruebas publicadas de su comportamiento con aceleracion por GPU ni de su estabilidad en produccion a gran escala.
- Contexto desconocido: no se publica la longitud maxima de contexto del modelo base ni del ajuste, lo que impide garantizar conversaciones multi-turno largas.
- Madurez del proyecto: se trata de un ajuste personal ligado a un proyecto concreto ("HaruPet"), sin mantenimiento ni versionado documentados mas alla de la fecha de subida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ruddls030/HyperCLOVAX-SEED-Haru-1.5B-GGUF
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-1.5B
- Conversion de terceros en Q4_K_M (rippertnt): https://ailocalcheck.com/model/rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF
- Ficha de la conversion Q4_K_M en oktechmasters: https://oktechmasters.org/ai_models/hyperclovax-seed-text-instruct-1-5b-q4-k-m-gguf/
- Conversion de terceros en Q4_K_M (cherryDavid): https://huggingface.co/cherryDavid/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF
- Conversion de terceros en Q8_0 (cherryDavid): https://huggingface.co/cherryDavid/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q8_0-GGUF/blob/main/README.md
- Galeria de modelos de Ryu con la conversion Q4_K_M: https://ryuhq.com/store/models/rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF
