# doktersmol/lfm3-1.7b-iq8r

## Resumen

LFM3-1.7B IQ8R es una cuantizacion en int8 rotado del modelo LiquidAI/LFM3-1.7B, empaquetada en el formato de contenedor `.rad` del servidor de inferencia Radiance, orientado a GPUs AMD. El trabajo lo publica el usuario doktersmol y no introduce reentrenamiento alguno: aplica una receta de cuantizacion post-entrenamiento sobre el checkpoint oficial (revision `0dc4268b561499c648c7ba7c9466bf3d8d01517a`) y convierte los pesos al contenedor propietario de Radiance. El resultado es un fichero de 2.636.816.384 bytes que ocupa aproximadamente dos tercios del contenedor bf16 equivalente.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra una ruta de cuantizacion int8 sin datos de calibracion (round-to-nearest, grupo 128) que funciona sobre los backends libr4d (RDNA4), libhalo (Strix Halo), libr3d (RDNA3) y las librerias de CPU de Radiance. Segun la model card, ofrece entre 1,2 y 1,5 veces la velocidad de decodificacion del bf16 y evita la dependencia de una cache de ajuste (`rad-tune`) en iGPUs, a costa de una divergencia mayor respecto a float32.

El modelo base es un transformer de 1.700 millones de parametros con una ventana de contexto declarada de 262.144 tokens, capacitado para texto, llamadas a herramientas y razonamiento, sin vision ni audio. La distribucion se realiza bajo la LFM Open License v1.0, que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); cuantizacion int8 rotado en las ocho lineales del tronco por capa |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Int8 rotado, grupo 128, round-to-nearest, sin calibracion; gate, kernel de convolucion, normas, embedding y cabeza atada en bf16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), con limite de uso comercial |
| Formato de pesos | Contenedor `.rad` de Radiance (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de 1.700 millones de parametros desarrollado por Liquid AI. La model card del contenedor no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO; esa informacion corresponde a la model card original de LiquidAI, no incluida en la informacion disponible. Lo que si se especifica es que el modelo conserva capacidad de razonamiento y de llamadas a herramientas, y que no incorpora vision ni audio.

La innovacion tecnica de esta publicacion reside en el proceso de cuantizacion. Las ocho lineales del tronco de cada capa se rotan y cuantizan a int8 con grupo 128 mediante round-to-nearest, sin datos de calibracion y sin pase GPTQ; el resto de componentes (gate, kernel de convolucion, normas, embedding y cabeza atada) permanece en bf16. La receta se eligio con grupo 128 en lugar del 256 habitual de IQ8R para que un unico contenedor funcione en libr4d, libhalo, libr3d y las librerias de CPU. La conversion se realizo con la herramienta `rad-convert` el 16 de noviembre de 2026 y requiere Radiance 2.2.0 o superior con el plugin `lfm3_bf16`.

## Capacidades

- Generacion de texto en formato chat y en completaciones crudas.
- Razonamiento multi-paso, con soporte de prompts de razonamiento tipo chat.
- Llamadas a herramientas (tool calls) segun la model card del contenedor.
- Contexto largo de hasta 262.144 tokens, con prompts de chat y de completacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin vision ni audio.
- Inferencia en GPUs AMD (RDNA4, Strix Halo, RDNA3) y en CPU mediante las librerias de Radiance.

## Casos de uso

- Razonamiento con contexto largo en GPUs AMD de gama alta: el contenedor permite procesar prompts de hasta 262.128 tokens en una Radeon AI PRO R9700 con una velocidad de decodificacion de 189 tok/s, adecuado para analisis de documentos extensos o trazas de codigo.
- Despliegue en iGPU Strix Halo: en la Radeon 8060S el contenedor alcanza 66 tok/s de decodificacion, lo que lo hace viable para asistentes locales en equipos compactos, aunque con la advertencia de la divergencia detectada en un prompt de razonamiento.
- Inferencia en portatiles con RDNA3: en la Radeon 860M ofrece 18-19 tok/s en flujo unico y 9-10 tok/s con 32.768 tokens de contexto, sin necesidad de cache de ajuste, lo que simplifica el despliegue en Framework 13 y equipos similares.
- Ejecucion en CPU sin GPU: con la libreria libavx alcanza 9,7 tok/s, suficiente para pruebas, prototipado y entornos sin acelerador dedicado.
- Integracion de llamadas a herramientas en agentes: el soporte de tool calls y razonamiento permite construir pipelines de agentes multi-paso servidos por Radiance con la configuracion YAML indicada en la model card.
- Servicio de completaciones y chat mediante API compatible: Radiance expone endpoints `/v1/completions` y de chat, de modo que el contenedor puede sustituir a otros servidores en arquitecturas AMD sin reescribir la capa de aplicacion.

## Benchmarks y rendimiento

La model card reporta comprobaciones de fidelidad frente a una pasada float32 en CPU del codigo de modelado oficial de LiquidAI, con 20 prompts de 64 a 262.128 tokens y limites fijados antes de la ejecucion.

| Dispositivo | Libreria | Resultado | KL media a f32 (texto de 64 a 8.192 tokens) | Decodificacion, un flujo |
|---|---|---|---|---|
| Radeon AI PRO R9700 (gfx1201) | libr4d | PASS | 7,2e-4 a 2,7e-3 | 189 tok/s (limite 210 W, eGPU) |
| Radeon 8060S (gfx1151, Strix Halo) | libhalo | FAIL: un veredicto de 35 | 7,1e-4 a 3,3e-3 | 66 tok/s |
| Ryzen 7 7735HS, solo CPU | libavx | PASS | 7,0e-4 a 3,3e-3 | 9,7 tok/s |
| Radeon 860M (RDNA3) | libr3d | PASS | no disponible | 18,0 tok/s (ahorro) / 19,1 tok/s (equilibrado) |

En la Radeon 860M, con 32.768 tokens de contexto la decodificacion baja a 9,0 tok/s en modo ahorro y 10,0 tok/s en equilibrado, y el primer token tarda 94 s y 77 s respectivamente. No se puntuaron prompts de mas de 16.384 tokens en ese chip. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el fichero ocupa 2,46 GiB (2.636.816.384 bytes), por lo que cabe en GPUs con 4 GB o mas de memoria.
- GPUs validadas: Radeon AI PRO R9700 (gfx1201), Radeon 8060S (gfx1151, Strix Halo) y Radeon 860M (RDNA3); el modelo base es pequeno y en GPUs grandes el bf16 es la opcion recomendada por el autor.
- Cabe en iGPU: si, con velocidades de 18-66 tok/s segun el chip; en la 860M no requiere cache de ajuste.
- CPU: funciona con la libreria libavx a 9,7 tok/s en un Ryzen 7 7735HS.
- Despliegue: exclusivamente mediante Radiance 2.2.0 o superior (plugin `lfm3_bf16`); no compatible con vLLM, llama.cpp, Ollama ni TGI por el formato `.rad`.
- Latencia y throughput: 189 tok/s en R9700, 66 tok/s en 8060S, 18-19 tok/s en 860M y 9,7 tok/s en CPU, en flujo unico y bajo las condiciones declaradas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doktersmol/lfm3-1.7b-iq8r | 1,7 B | 262.144 | `.rad` (int8 rotado) | LFM Open License v1.0 | Hugging Face, 0 descargas |
| doktersmol/lfm3-1.7b-bf16 | 1,7 B | 262.144 | `.rad` (bf16) | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B | 1,7 B | 262.144 | safetensors (bf16) | LFM Open License v1.0 | Hugging Face (modelo base) |

La comparativa con modelos de otros fabricantes del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La comprobacion en Radeon 8060S falla un veredicto de 35: en un prompt de razonamiento de 721 tokens, la KL media en las posiciones 240-320 es 8,3e-2 frente a un limite de 5,05e-2, concentrada en una posicion donde el modelo debe recordar un nombre de variable; el autor atribuye el fallo a la cuantizacion int8 y no al kernel del dispositivo.
- Las completaciones crudas deben empezar con el token BOS (`<|startoftext|>`), ya que el tokenizador de LiquidAI no fija `add_bos_token`; las peticiones de chat no se ven afectadas.
- La perdida frente a float32 crece con la longitud del contexto: KL media de 5,6e-4 a 32.768 tokens, 2,0e-3 a 131.072 y 2,9e-3 a 262.128 en la R9700.
- La cuantizacion es round-to-nearest sin pase GPTQ, lo que deja mayor divergencia que una cuantizacion calibrada.
- En CPU, la ruta int8 no es identica entre tamanos de paso en profundidad (concordancia top-1 de 0,993 a 8.192 tokens en un prompt de desarrollo).
- La licencia LFM Open License v1.0 limita el uso comercial; el contenedor es una forma modificada de los pesos de LiquidAI y se distribuye bajo los mismos terminos.
- Las velocidades reportadas son de maquinas individuales bajo condiciones concretas y no constituyen benchmarks del hardware.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica especifica del modelo base en la documentacion proporcionada.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/doktersmol/lfm3-1.7b-iq8r
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Contenedor bf16 del mismo autor: https://huggingface.co/doktersmol/lfm3-1.7b-bf16
- Repositorio de Radiance: https://codeberg.org/StillDeadcode/radiance
- Pull request del plugin `lfm3_bf16`: https://codeberg.org/StillDeadcode/radiance/pulls/449
- Pull request de cambios en libr3d: https://codeberg.org/StillDeadcode/radiance/pulls/578
- Receta de cuantizacion: `lfm3-1.7b-iq8r.recipe` en el repositorio del contenedor
- Licencia: fichero `LICENSE` en el repositorio del contenedor
