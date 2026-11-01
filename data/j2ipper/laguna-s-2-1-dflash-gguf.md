# j2ipper/Laguna-S-2.1-DFlash-GGUF

## Resumen

Laguna-S-2.1-DFlash-GGUF es una re-cuantizacion a Q8_0 en formato GGUF del drafter DFlash de poolside para el modelo Laguna-S-2.1. No se trata de un modelo generativo autonomo, sino de un modelo borrador (draft model) de decodificacion especulativa: propone tokens candidatos que el modelo objetivo Laguna-S-2.1 verifica despues, acelerando la generacion sin alterar la distribucion de salida. El modelo base, poolside/Laguna-S-2.1-DFlash, tiene 1.114.977.792 parametros (1,1B) y seis capas de atencion deslizante con block size 16.

El repositorio lo publica el usuario j2ipper como parte del ecosistema de Talus, un motor de inferencia que desde la version 0.1.2 descarga y usa este drafter por defecto junto al modelo principal cuantizado j2ipper/Laguna-S-2.1-Q4-lean. La relevancia practica esta en el ahorro de latencia medido sobre hardware AMD Strix Halo: incrementos de hasta un 49 % en velocidad de decodificacion en tareas de codigo, con salidas identicas byte a byte en modo greedy.

La cuantizacion se realizo con llama.cpp (tag b12032) a partir del GGUF BF16 oficial de poolside, sin importance matrix, y el resultado es determinista. El archivo ocupa 1,19 GB y conserva los metadatos originales de poolside, anadiendo cuatro claves nuevas de la conversion mas reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 6 capas de atencion deslizante (sliding attention), block size 16; modelo borrador para decodificacion especulativa |
| Parametros totales | 1.114.977.792 (1,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de atencion deslizante de 512 tokens segun metadatos `dflash.attention.sliding_window`) |
| Tipos de cuantizacion | Q8_0 (49 matrices de pesos); normas en F32 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (archivo `laguna-s-2.1-dflash-Q8_0.gguf`, 1.188.531.584 bytes) |

## Arquitectura y entrenamiento

El drafter DFlash es un transformer compacto de seis capas con atencion deslizante y block size 16, disenado especificamente para proponer bloques de tokens que el modelo objetivo Laguna-S-2.1 valida en paralelo. Los metadatos del GGUF indican una ventana deslizante de 512 tokens, dimension de RoPE de 128 y escalado de RoPE de tipo `none`. El archivo contiene 76 tensores en total: 49 matrices de pesos en Q8_0 y 27 tensores de normalizacion en F32.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica relevante es el propio esquema de decodificacion especulativa: el drafter genera tokens candidatos y el modelo objetivo los acepta o rechaza, de modo que la salida final coincide exactamente con la que produciria el modelo sin drafter en modo greedy, y mantiene la distribucion de muestreo en peticiones con sampling.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Laguna-S-2.1; no esta pensado para uso generativo autonomo.
- Aceleracion de decodificacion con preservacion exacta de la salida: 19/19 pruebas byte-identicas con y sin drafter en modo greedy.
- Preservacion de la distribucion de muestreo en peticiones con temperatura y top_p.
- Mayor tasa de aceptacion en tareas estructuradas: 0,90 en ediciones de ficheros, 0,81 en codigo y 0,56 en chat.
- Integracion con el motor Talus (descarga y uso automatico desde la version 0.1.2) y con el fork de llama.cpp de poolside (rama `laguna`) mediante el flag `-md`.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- No dispone de capacidades de vision, audio, tool calling ni razonamiento multi-paso propias; esas funciones residen en el modelo objetivo.

## Casos de uso

- Aceleracion de asistentes de codigo en local: con el drafter, la decodificacion en tareas de codigo pasa de 34,9 a 52,2 tok/s en un Ryzen AI Max+ 395, lo que reduce la latencia percibida en autocompletado y generacion de funciones.
- Edicion de ficheros asistida por IA: la tasa de aceptacion de 0,90 en tareas de edicion de ficheros y los 101,4 tok/s (frente a 95,9 sin drafter) lo hacen adecuado para herramientas que reescriben o parchean codigo en el editor.
- Despliegue en equipos con GPU integrada AMD (Strix Halo, gfx1151): el formato GGUF y el soporte en llama.cpp permiten ejecutar el par modelo+drafter en hardware de consumo con memoria unificada de 128 GB.
- Servidores de chat de baja latencia: en conversacion con sampling (temperatura 1.0, top_p 0.95) mejora de 33,7 a 37,7 tok/s manteniendo la distribucion de muestreo intacta.
- Pipelines de generacion de prosa larga: las pruebas con continuaciones de 2K y 16K tokens confirman salidas identicas, por lo que es apto para generacion de documentacion o texto tecnico sin riesgo de divergencia.
- Evaluacion y benchmarking de decodificacion especulativa: al ser una cuantizacion determinista con receta reproducible (`recipe/quantize.sh` y log incluidos), sirve como referencia para comparar estrategias de drafting.
- Integracion en flujos con Talus: `talus setup` lo descarga y configura automaticamente, lo que simplifica su adopcion en entornos ya basados en ese motor.

## Benchmarks y rendimiento

Mediciones de Talus 0.1.1 `talus-server` en AMD Strix Halo (Ryzen AI Max+ 395, 128 GB) con Laguna-S-2.1 Q4-lean:

| Escenario | Sin drafter (tok/s) | Con este Q8_0 (tok/s) | Con Q8_0 de la comunidad (tok/s) | Aceptacion del draft |
|---|---|---|---|---|
| Chat (temp. 1.0, top_p 0.95) | 33,7 | 37,7 | 37,7 | 0,56 |
| Codigo (greedy) | 34,9 | 52,2 | 52,3 | 0,81 |
| Edicion de ficheros (greedy) | 95,9 | 101,4 | 101,6 | 0,90 |

| Prueba de equivalencia | Resultado |
|---|---|
| Salida greedy con y sin drafter (6 prompts de codigo de 700 tokens, 3 ediciones de 1500, 6 de chat de 400, 3 continuaciones de 2K y 1 de 16K de 128 tokens) | byte-identica, 19/19 |
| Este archivo frente al Q8_0 de la comunidad (mismos 19 prompts mas 6 chats muestreados con semilla) | identica, 25/25 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo es un drafter y no se evalua con esas metricas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB para el archivo Q8_0 completo; se suma a la memoria del modelo objetivo Laguna-S-2.1.
- GPU validadas: AMD Ryzen AI Max+ 395 con graficos integrados Radeon (Strix Halo, gfx1151) y 128 GB de memoria unificada, segun las pruebas del autor.
- GPU recomendadas: no disponible; no hay mediciones publicadas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, por tamano (1,2 GB), aunque el requisito real lo marca el modelo objetivo. El soporte verificado es para el stack AMD gfx1151.
- Opciones de despliegue: motor Talus (integracion nativa con `--dflash-gguf`), llama.cpp en el fork de poolside (rama `laguna`, flag `-md`). No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: 37,7 tok/s en chat, 52,2 tok/s en codigo y 101,4 tok/s en ediciones sobre Strix Halo con Laguna-S-2.1 Q4-lean.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| j2ipper/Laguna-S-2.1-DFlash-GGUF (este) | 1,1B | GGUF Q8_0 | ventana deslizante 512 | 37,7 / 52,2 / 101,4 tok/s (chat / codigo / ediciones) | OpenMDW-1.1 |
| wimmmm/poolside-Laguna-S-2.1-DFlash-GGUF (Q8_0 comunitario) | 1,1B | GGUF Q8_0 | no disponible | 37,7 / 52,3 / 101,6 tok/s; datos de tensores identicos | no disponible |
| poolside/Laguna-S-2.1-DFlash (BF16 original) | 1,1B | safetensors / GGUF BF16 | no disponible | no disponible | OpenMDW-1.1 |

No se dispone de informacion sobre otros drafters comparables (por ejemplo, EAGLE o Medusa) en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Laguna-S-2.1 como modelo objetivo y un runtime con soporte de DFlash; no genera respuestas por si mismo.
- El soporte verificado se limita a Talus y al fork `laguna` de llama.cpp de poolside; otros motores (vLLM, TGI, Ollama) no estan documentados.
- Las mediciones de rendimiento proceden de un unico equipo (Ryzen AI Max+ 395, gfx1151); el comportamiento en otras GPU no esta validado.
- La ventana de atencion deslizante de 512 tokens limita el alcance del borrador; no se documenta su comportamiento en contextos muy largos mas alla de la prueba de 16K tokens del modelo objetivo.
- Riesgo de alucinacion: el drafter no introduce contenido nuevo en modo greedy, pero en sampling la calidad final depende del modelo objetivo; no debe evaluarse de forma aislada.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni cobertura idiomatica.
- Licencia OpenMDW-1.1: incluye clausula de patentes que extingue los derechos de quien demande alegando infraccion de patente o copyright sobre los materiales. poolside solicita ademas el uso conforme a su Acceptable Use Policy; conviene revisar ambas antes de un despliegue comercial.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo dia (2026-11-01); es una publicacion reciente sin validacion independiente mas alla de las pruebas del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/j2ipper/Laguna-S-2.1-DFlash-GGUF
- Modelo base (drafter original): https://huggingface.co/poolside/Laguna-S-2.1-DFlash
- Modelo objetivo Laguna-S-2.1: https://huggingface.co/poolside/Laguna-S-2.1
- GGUF oficiales de poolside: https://huggingface.co/poolside/Laguna-S-2.1-GGUF
- Cuantizacion Q4-lean del modelo objetivo: https://huggingface.co/j2ipper/Laguna-S-2.1-Q4-lean
- Conversion Q8_0 de la comunidad: https://huggingface.co/wimmmm/poolside-Laguna-S-2.1-DFlash-GGUF
- Motor Talus (repositorio publico): https://github.com/nsbradley88/talus-public
- Documentacion de modelos de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/MODELS.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia OpenMDW-1.1: https://huggingface.co/j2ipper/Laguna-S-2.1-DFlash-GGUF/blob/main/LICENSE.md
- Politica de uso aceptable de poolside: https://poolside.ai/legal/acceptable-use-policy
