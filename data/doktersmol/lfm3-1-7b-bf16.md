# doktersmol/lfm3-1.7b-bf16

## Resumen

LFM3-1.7B-bf16 es una conversión de formato del modelo LiquidAI/LFM3-1.7B, desarrollado por Liquid AI, publicada por el usuario doktersmol en Hugging Face. No se trata de un fine-tuning ni de un modelo nuevo: los pesos son exactamente los del checkpoint original de Liquid AI en bf16, y únicamente se ha cambiado el contenedor de fichero para que el modelo pueda ejecutarse en Radiance, un servidor de inferencia orientado a GPUs AMD. El repositorio ocupa 4,1 GB y contiene un único fichero `lfm3-1.7b-bf16.rad` de 4.079.820.800 bytes.

La relevancia de esta publicación es fundamentalmente práctica: permite ejecutar un modelo de la familia LFM3 de Liquid AI sobre hardware AMD (RDNA3, RDNA4 y CPU) mediante Radiance 2.2.0 o superior, con el plugin `lfm3_bf16` que se integró en el PR #449 del proyecto. La model card documenta verificaciones numéricas frente a una implementación de referencia en float32 sobre CPU, con valores de divergencia KL y velocidades de decodificación medidas en varios dispositivos.

El modelo soporta generación de texto, tool calling y razonamiento, con una longitud de contexto declarada de 262.144 tokens. No dispone de visión ni audio. La licencia es la LFM Open License v1.0 de Liquid AI, que impone restricciones al uso comercial. La información pública disponible sobre arquitectura interna, composición del dataset de entrenamiento y benchmarks es muy limitada en esta ficha, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; la model card no detalla la arquitectura interna) |
| Parametros totales | 1,7 mil millones (deducido del nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16 (este contenedor); existe un contenedor de 8 bits del mismo modelo en `doktersmol/lfm3-1.7b-iq8r` |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), con limitacion de uso comercial |
| Formato de pesos | contenedor `.rad` de Radiance (`lfm3-1.7b-bf16.rad`) |
| Tamano del repositorio | 4,1 GB |
| Revision del modelo base | `0dc4268b561499c648c7ba7c9466bf3d8d01517a` |
| Hash sha256 del fichero | `904d0eea1e2fa0f91fd6c613167a3667de96005f39668eb4bc2d719f9ef5c9e8` |
| Servidor de inferencia | Radiance 2.2.0 o superior (plugin `lfm3_bf16`) |
| Fecha de conversion | 2026-11-11 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base LiquidAI/LFM3-1.7B en la informacion proporcionada. La model card de esta conversion no describe si se trata de un transformer denso, un modelo de estado recurrente, una arquitectura hibrida ni un MoE; solo confirma que los pesos son los del checkpoint original de Liquid AI en bf16 y que no se ha reentrenado ni alterado ningun peso mas alla de la conversion de formato.

Tampoco se documentan en esta ficha el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. La unica innovacion tecnica documentada en esta publicacion es la propia conversion al contenedor Radiance mediante la herramienta `rad-convert`, junto con la validacion numerica frente a una pasada forward en float32 sobre CPU usando el codigo de modelado oficial de Liquid AI en la revision indicada. Esa validacion se hizo con 20 prompts de entre 64 y 262.128 tokens, incluyendo prompts con chat template, y se reportan divergencias KL medias de 1,6e-4 a 6,9e-4 en texto de 64 a 8.192 tokens en la Radeon AI PRO R9700.

## Capacidades

- Generacion de texto: el modelo base es de tipo text-generation.
- Tool calling: la model card indica explicitamente soporte de llamadas a herramientas.
- Razonamiento: la model card menciona soporte de razonamiento, y las pruebas incluyen prompts de chat de razonamiento.
- Contexto largo: ventana declarada de 262.144 tokens, con verificacion numerica realizada hasta esa longitud en la R9700.
- Chat multi-turno: se han probado prompts con chat template.
- Sin vision ni audio: la model card lo declara explicitamente.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no se documenta como capacidad separada; solo se menciona "reasoning" de forma generica.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir informes, contratos o bases de codigo extensas en una sola pasada y responder preguntas sobre ellas, sin necesidad de fragmentacion ni recuperacion externa.
- Asistentes con tool calling: la model card confirma soporte de llamadas a herramientas, lo que permite integrar el modelo en flujos donde deba consultar APIs, bases de datos o funciones externas antes de responder.
- Razonamiento multi-paso en local: al ejecutarse sobre GPUs AMD de consumo y profesionales mediante Radiance, es adecuado para prototipos de agentes que requieran razonamiento encadenado sin depender de servicios en la nube.
- Despliegue en hardware AMD: el caso de uso central de esta publicacion es ejecutar el modelo en GPUs RDNA3 y RDNA4 (Radeon AI PRO R9700, Radeon 8060S, Radeon 860M) y en CPU, alli donde no hay soporte CUDA.
- Generacion de codigo asistida: aunque no se detallan benchmarks de codigo, el soporte de tool calling y contexto largo lo hace util para asistentes de programacion que necesiten ver un repositorio completo.
- Chat de atencion al cliente con contexto largo: la ventana de 262.144 tokens permite mantener historiales de conversacion muy extensos y documentacion de producto en el mismo contexto.
- Investigacion y evaluacion de inferencia: el contenedor incluye verificaciones numericas reproducibles (KL frente a f32, velocidades por dispositivo), lo que lo convierte en una referencia util para validar implementaciones de Radiance en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo incluye verificaciones numericas de fidelidad y medidas de velocidad de decodificacion, que se recogen a continuacion.

| Dispositivo | Biblioteca | Resultado | KL media a f32 (texto de 64 a 8.192 tokens) | Decodificacion (un stream) |
|---|---|---|---|---|
| Radeon AI PRO R9700 (gfx1201) | libr4d | PASS | 1,6e-4 a 6,9e-4 | 122 tok/s (limite 210 W, eGPU) |
| Radeon 8060S (gfx1151, Strix Halo) | libhalo | PASS | 1,7e-4 a 5,8e-4 | 54 tok/s |
| Ryzen 7 7735HS (solo CPU) | libavx | PASS | 1,7e-4 a 7,0e-4 | 6,4 tok/s |
| Radeon 860M (RDNA3 iGPU), libr3d sin cache de tune | libr3d | PASS | no disponible | ~1,8 tok/s |
| Radeon 860M (RDNA3 iGPU), libr3d con cache de tune | libr3d | FAIL (1 de 32 comprobaciones) | 2,83e-2 en posiciones 240-320 de un prompt (limite 2,02e-2) | 13-14 tok/s |

En la R9700, la KL media a 32.768, 131.072 y 262.128 tokens es de 1,2e-4, 3,2e-4 y 3,7e-4 respectivamente. En la Radeon 860M con cache de tune, la decodificacion es de 14,0 tok/s en modo power-saver y 14,7 tok/s en balanced; con 32.768 tokens de contexto baja a 7,8 y 8,6 tok/s, y el primer token tarda 102 s y 87 s respectivamente.

## Requisitos de hardware

- VRAM estimada: el fichero en bf16 ocupa 4,08 GB, por lo que la inferencia requiere al menos ese espacio mas overhead de contexto; con 262.144 tokens de contexto el consumo de KV cache crece de forma significativa segun la implementacion.
- GPUs verificadas: Radeon AI PRO R9700 (gfx1201, RDNA4), Radeon 8060S (gfx1151, Strix Halo), Radeon 860M (RDNA3 iGPU en Framework 13).
- CPU verificada: Ryzen 7 7735HS en modo solo CPU (6,4 tok/s).
- Cabe en GPU de consumo: si, en iGPUs RDNA3 como la Radeon 860M, aunque con rendimiento limitado (~1,8 tok/s sin cache de tune y 13-14 tok/s con ella).
- Opciones de despliegue: Radiance 2.2.0 o superior con el plugin `lfm3_bf16` (PR #449); para RDNA3 se requiere ademas el PR #578, aun no incluido en una release.
- Alternativa de cuantizacion: contenedor de 8 bits en `doktersmol/lfm3-1.7b-iq8r`, que segun la model card pasa las comprobaciones en la 860M en ambas configuraciones y no necesita cache de tune.
- Latencia y throughput: 122 tok/s en R9700, 54 tok/s en Radeon 8060S, 6,4 tok/s en CPU y 13-14,7 tok/s en Radeon 860M con cache de tune.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa de rendimiento. Como referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| doktersmol/lfm3-1.7b-bf16 | 1,7 B | 262.144 | LFM Open License v1.0 | `.rad` (Radiance) | Conversion de formato del modelo de Liquid AI; verificado en GPUs AMD |
| doktersmol/lfm3-1.7b-iq8r | 1,7 B | 262.144 | LFM Open License v1.0 | `.rad` (Radiance) | Version de 8 bits del mismo modelo, recomendada en RDNA3 iGPU |
| LiquidAI/LFM3-1.7B | 1,7 B | 262.144 | LFM Open License v1.0 | safetensors (formato original) | Modelo base original de Liquid AI |

## Limitaciones y advertencias

- Las completaciones en crudo deben empezar con el token BOS (`<|startoftext|>`), como hace el chat template. Los ficheros del tokenizer de Liquid AI no fijan `add_bos_token`, por lo que este contenedor tiene `add_bos` desactivado y `/v1/completions` procesa el prompt tal cual. Sin BOS, algunos primeros tokens hacen que el modelo se aleje de f32 durante las primeras decenas de posiciones. Las peticiones de chat no se ven afectadas.
- En las GPUs, la generacion greedy puede diferir en un token casi empatado cuando cambia la composicion de los pasos (lookup de prompt, peticiones concurrentes). La ruta de CPU no presenta este comportamiento.
- En la Radeon 860M con cache de tune, una de las 32 comprobaciones falla: en la posicion 245 de un prompt de razonamiento de 721 tokens, la probabilidad del token de referencia cae a 0,05 frente a 0,67 en f32, lo que eleva la KL media de las posiciones 240-320 a 2,83e-2 frente al limite de 2,02e-2. La configuracion que pasa las pruebas (sin cache de tune) no es la que la mayoria de usuarios ejecutaria por su bajo rendimiento (~1,8 tok/s).
- La licencia LFM Open License v1.0 impone limitaciones al uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en produccion.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni cobertura idiomatica del modelo base en la documentacion proporcionada.
- Las velocidades reportadas corresponden a maquinas individuales bajo condiciones concretas y no constituyen benchmarks del hardware.
- El modelo no soporta vision ni audio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y es una publicacion de un tercero (doktersmol), no de Liquid AI; la responsabilidad sobre la conversion recae en el autor de la misma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doktersmol/lfm3-1.7b-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Contenedor de 8 bits del mismo modelo: https://huggingface.co/doktersmol/lfm3-1.7b-iq8r
- Servidor Radiance: https://codeberg.org/StillDeadcode/radiance
- PR de integracion del plugin `lfm3_bf16`: https://codeberg.org/StillDeadcode/radiance/pulls/449
- PR con cambios necesarios para RDNA3: https://codeberg.org/StillDeadcode/radiance/pulls/578
