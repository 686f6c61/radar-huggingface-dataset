# Avifenesh/Qwen3.8-27B-DFlash2-memra

## Resumen

Qwen3.8-27B-DFlash2-memra es un modelo borrador (draft model) de decodificacion especulativa basado en difusion por bloques, desarrollado por Avifenesh como empaquetado para el motor de serving tiyuvta. No es un modelo de lenguaje autonomo: genera bloques de tokens candidatos que un modelo objetivo verifica, de modo que la salida greedy resultante es byte a byte identica a la decodificacion plana. Los pesos son identicos a los de z-lab/Qwen3.8-27B-DFlash2, a su vez espejo de incoai/Qwen3.8-27B-DFlash2, y el modelo base sobre el que opera es Qwen/Qwen3.8-27B.

El repositorio pesa 3,8 GB y contiene 1.924.404.480 parametros en safetensors, muy por debajo de los 27B del modelo objetivo, lo que refleja su naturaleza de borrador ligero. Su relevancia actual radica en que demuestra una ruta de aceleracion de inferencia medible sobre hardware Blackwell: 157,2 tok/s agregados en carga agentica y una tasa de aceptacion de 0,73 sobre el trunk NVFP4+Q5_K, frente a los 148,6 tok/s del cabezal MTP nativo del mismo modelo.

La ficha tecnica se completa con la configuracion de serving medida por el autor: cuantizacion q4_0 del backbone del borrador al cargar, recorte de vocabulario FR-Spec a 32.768 filas en el lm_head del lado del borrador (frente a las 248.320 completas) y anchura de verificacion adaptativa. La licencia es Apache-2.0 y el modelo se distribuye unicamente para inferencia a traves del motor tiyuvta, con `inference: false` en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador con difusion por bloques (block-diffusion), disenado para decodificacion especulativa sobre Qwen3.8-27B |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 y q4_0 del backbone del borrador (q4_0 es el valor por defecto medido); cuantizacion asimetrica q5 descartada por el autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 3,8 GB); artefactos auxiliares GGUF en el repositorio del trunk asociado |

## Arquitectura y entrenamiento

El modelo es un borrador de difusion por bloques derivado de DFlash 2 (Inco AI, 2026), la evolucion del metodo DFlash presentado en ICML 2026. En lugar de predecir un unico token siguiente de forma autorregresiva, el borrador propone bloques completos de tokens en paralelo, que el modelo objetivo Qwen3.8-27B verifica y arbitra token a token. Esta construccion garantiza que la salida comprometida sea identica a la de la decodificacion plana, incluso con muestreo, ya que el verificador decide cada token final.

El autor no documenta el proceso de entrenamiento del borrador (numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO); esa informacion corresponde al trabajo original de Inco AI y no se reproduce en esta model card. La innovacion practica del empaquetado reside en la configuracion de serving: recorte de vocabulario FR-Spec en el lado del borrador (32.768 filas rankeadas de 248.320, con verificacion sobre el vocabulario completo), anchura de verificacion adaptativa en lugar de un valor fijo T=8 (que el autor mide como peor: 145,5 tok/s agenticos y aceptacion 0,52), reutilizacion de sesion multi-turno con priming unicamente del sufijo nuevo sobre la cache del trunk y la KV del borrador, y un mecanismo de cesion de concurrencia que mantiene la especulacion limitada a baja concurrencia (a partir de c>=4 el agregado iguala al batch plano).

## Capacidades

- Generacion de texto acelerada por decodificacion especulativa: actua como borrador para Qwen3.8-27B, no genera texto de forma autonoma.
- Propuesta de bloques de tokens en paralelo mediante difusion por bloques, verificados por el modelo objetivo.
- Preservacion de la exactitud byte a byte respecto a la decodificacion plana, tanto en greedy como en sesiones con muestreo (a partir de la version v0.113.0 del motor de serving).
- Soporte de reanudacion de sesion multi-turno: turno N+1 primes solo el sufijo nuevo sobre la cache aparcada del trunk y la KV del borrador.
- Integracion con recorte de vocabulario FR-Spec para reducir el coste del lm_head del borrador.
- Compatibilidad con la API compatible con OpenAI del motor tiyuvta.
- No soporta tool calling, vision, audio ni modos de razonamiento propios: esas capacidades residen en el modelo objetivo.

## Casos de uso

- Serving de alta frecuencia en produccion: desplegar Qwen3.8-27B con el borrador armado para elevar el throughput agregado de 148,6 a 157,2 tok/s en cargas agenticas sobre RTX PRO 6000 Blackwell, sin cambiar la semantica de salida.
- Chat interactivo de baja concurrencia: con c=1 el autor mide 126,8 tok/s agregados frente a 116,6 del cabezal MTP, adecuado para asistentes conversacionales donde la latencia percibida importa mas que el volumen.
- Pipelines de generacion de codigo: las tasas de pared a un solo stream alcanzan 208-239 tok/s en codigo, lo que lo hace util para autocompletado y generacion en IDE o en etapas de CI/CD que producen parches.
- Cargas con mucho digito y datos estructurados: 287-339 tok/s en prompts con predominio de digitos, apropiado para extraccion de tablas, serializacion JSON o generacion de informes numericos.
- Agentes multi-turno: la reanudacion de sesion reduce el TTFT por turno entre un 16 % y un 83 % frente al re-priming en frio (turno 7: 0,32 s frente a 1,90 s), lo que abarata los bucles de agente con muchas llamadas encadenadas.
- Despliegue con restricciones de memoria: al ser un borrador de 1,92B parametros y 3,8 GB en safetensors, el coste adicional sobre el trunk es acotado y permite mantener el modelo objetivo en cuantizacion NVFP4+Q5_K.
- Evaluacion de infraestructura de inferencia: sirve como banco de pruebas reproducible para comparar rutas de especulacion (MTP nativo frente a DFlash2) con instrumentos de exactitud byte a byte.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos sobre RTX PRO 6000 Blackwell, servido, greedy, concurrencia 1, estado estacionario, tres repeticiones intercaladas.

| Configuracion | Chat agg tok/s | Agentico agg tok/s | Aceptacion |
|---|---:|---:|---:|
| Cabezal MTP nativo enmascarado (baseline) | 126,9 | 148,6 | 0,63 |
| DFlash2, borrador q8, vocabulario completo | 134,9 | 151,5 | 0,75 |
| DFlash2, borrador q4, vocabulario completo | 136,3 | 154,5 | 0,76 |
| DFlash2, borrador q4 + recorte FR-Spec (por defecto) | 142,9 | 157,2 | 0,73 |
| DFlash2, verificacion fija T=8 (descartada) | 132,0 | 145,5 | 0,52 |

Sesiones con muestreo (motor >= v0.113.0, medianas, tok/s agregados frente al cabezal MTP):

| Concurrencia | Ruta DFlash2 | Cabezal MTP |
|---|---:|---:|
| 1 | 126,8 | 116,6 |
| 2 | 127,5 | 119,5 |
| 4 | 87,1 | 84,8 |

Tasas de pared a un solo stream en la misma tarjeta: prosa ~131-146 tok/s, codigo ~208-239 tok/s, prompts con predominio de digitos ~287-339 tok/s. El recorte FR-Spec combinado con el borrador q4 aporta un +5,2 % (152,4 a 160,4 tok/s en la puerta desnuda) a costa de reducir la aceptacion agentica de 0,755 a 0,730. La cuantizacion asimetrica q5 no se ofrece porque hace colapsar la aceptacion de 0,66 a 0,42.

## Requisitos de hardware

- VRAM del borrador: 3,8 GB en safetensors; con cuantizacion q4_0 del backbone al cargar, la huella efectiva es inferior. Requiere ademas alojar el trunk Qwen3.8-27B en NVFP4+Q5_K, cuyo consumo domina el total.
- GPU medidas por el autor: RTX PRO 6000 Blackwell. El empaquetado esta etiquetado para Blackwell; no se documentan resultados en otras arquitecturas.
- GPU consumer: no disponible. No hay mediciones publicadas en RTX 4090, RTX 5090 ni similares, y el requisito de alojar simultaneamente un trunk de 27B en NVFP4+Q5_K hace inviable el conjunto en tarjetas de 24 GB.
- Despliegue: exclusivamente mediante el motor tiyuvta (version >= v0.112.0 para los valores por defecto; >= v0.113.0 para la admision de sesiones con muestreo). La model card marca `inference: false`, por lo que no es un modelo cargable de forma autonoma en vLLM, llama.cpp, Ollama o TGI.
- Artefactos asociados: el trunk tiyuvta/Qwen3.8-27B-NVFP4-MTP-GGUF (build Q5K-mtp) y el fichero de rangos q38-ranks-sxc32768.gguf.txt para el recorte FR-Spec.
- Latencia y throughput: ver la seccion de benchmarks. El TTFT multi-turno mejora entre un 16 % y un 83 % por turno frente al re-priming en frio en una conversacion de 8 turnos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2-memra | 1,92B (borrador) | no disponible | Difusion por bloques, serving tiyuvta | Apache-2.0 | Hugging Face, 621 descargas |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | Difusion por bloques, pesos identicos | Apache-2.0 | Hugging Face |
| Cabezal MTP nativo de Qwen3.8-27B | integrado en el trunk | el del trunk | Prediccion multi-token autorregresiva | Apache-2.0 (trunk) | Integrado en el modelo objetivo |
| DFlash (v1, ICML 2026) | no disponible | no disponible | Difusion por bloques, version previa | no disponible | Paper |

La comparacion relevante es interna al propio stack: frente al cabezal MTP nativo, la ruta DFlash2 con los valores por defecto ofrece 142,9 frente a 126,9 tok/s en chat y 157,2 frente a 148,6 en agentico, con una aceptacion de 0,73 frente a 0,63. Frente a la variante z-lab, el contenido de pesos es identico y la diferencia es el empaquetado y la configuracion de serving medida.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el trunk Qwen3.8-27B y el motor tiyuvta no produce salida util. La model card declara `inference: false`.
- Los benchmarks son declarados por el autor y estan marcados como no verificados; no hay evaluacion independiente.
- Todas las mediciones provienen de una unica GPU (RTX PRO 6000 Blackwell) y de un unico conjunto de prompts (tiyuvta held-out agentic). La extrapolacion a otro hardware o dominio no esta respaldada.
- La especulacion se desactiva bajo carga: a partir de c>=4 el rendimiento agregado iguala al batch plano, de modo que el beneficio desaparece en serving de alta concurrencia.
- El recorte FR-Spec reduce la aceptacion (0,755 a 0,730 en agentico) a cambio de velocidad; es un compromiso explicito, no una mejora gratuita.
- La cuantizacion asimetrica q5 degrada gravemente la aceptacion y no debe usarse.
- La reanudacion multi-turno no se activa en streams cortados por `max_tokens` a mitad de rafaga ni cuando el limite de contexto supera la asignacion aparcada; en esos casos el servicio es en frio.
- Sesgos, riesgo de alucinacion y limitaciones idiomaticas dependen del modelo objetivo Qwen3.8-27B y no se documentan en esta model card.
- El uso comercial esta permitido por Apache-2.0, pero la dependencia del motor tiyuvta y del trunk NVFP4+Q5_K introduce condiciones practicas de despliegue ajenas a la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/Qwen3.8-27B-DFlash2-memra
- Borrador original (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Trunk para serving (tiyuvta, NVFP4+Q5_K): https://huggingface.co/tiyuvta/Qwen3.8-27B-NVFP4-MTP-GGUF
- Fichero de rangos FR-Spec: https://huggingface.co/tiyuvta/Qwen3.8-27B-NVFP4-MTP-GGUF/blob/main/q38-ranks-sxc32768.gguf.txt
- Repositorio DFlash: https://github.com/z-lab/dflash
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
