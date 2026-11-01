# hyukudan/Nemotron-3.5-Bolt-E4B-MTP-Drafter

## Resumen

Nemotron-3.5-Bolt-E4B-MTP-Drafter es un modelo borrador (*drafter*) para decodificacion especulativa, publicado por el usuario hyukudan. No es un modelo generativo autonomo: su funcion es proponer los siguientes tokens que el modelo principal —NVIDIA Nemotron 3.5 Bolt E4B— verifica despues. Al tratarse de decodificacion especulativa exacta, la salida es identica a la que se obtendria sin el borrador; unicamente cambia la velocidad. Se construye a partir de Google Gemma-4-E4B-it-assistant (78,8 millones de parametros), afinado sobre las salidas de Nemotron.

El modelo es relevante porque demuestra que un borrador MTP (multi-token prediction) pequeno y ligero puede acelerar de forma notable la inferencia de un modelo mayor en hardware de consumo, concretamente en un AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S gfx1151, 128 GB). Con pesos Q4_K_M oficiales y perfil `default`, pasa de 52,2 tok/s sin borrador a 85,1 tok/s con el, un factor de x1,63; en codigo alcanza 98,1 tok/s (x1,89).

Su interes practico es doble: por un lado, el afinado sobre las salidas del modelo objetivo aporta una mejora modesta pero medible en tokens esperados por ciclo; por otro, el borrador se integra en el motor strix-halo-engine-lab, que lo carga automaticamente desde una carpeta `drafter-mtp/`. La licencia Apache 2.0 y el reducido tamano del repositorio (0,2 GB) facilitan su adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP assistant (asistente de prediccion multi-token) sobre base Gemma-4; 4 capas de anchura 256 y cabeza de vocabulario completo agrupada en 2.048 centroides |
| Parametros totales | 78.779.908 |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo principal usa Q4_K_M y EXL3 M4) |
| Idiomas soportados | en, es, ja, zh, fr, de, it, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El borrador hereda la arquitectura del asistente MTP de Gemma-4-E4B-it: cuatro capas de anchura 256 y una cabeza de vocabulario completo agrupada en 2.048 centroides. Lee el ultimo estado oculto del modelo principal y su cache KV, y propone los siguientes tokens para que el modelo grande los verifique. Al compartir Nemotron 3.5 Bolt E4B el tokenizador con Gemma-4-E4B-it (del que deriva por post-entrenamiento), el asistente base encaja directamente sobre el modelo objetivo.

El afinado se realizo sobre las propias salidas de Nemotron. Segun el autor, esto aporta aproximadamente un +1,5 % de tokens esperados por ciclo en un conjunto reservado (ingles de 3,61 a 3,65; japones de 2,52 a 2,60), si bien en las prompts medidas la diferencia queda dentro del ruido. El autor indica que el asistente sin afinar de Google rinde igual de bien en su motor, de modo que la ganancia de velocidad procede sobre todo de la arquitectura MTP y de la decodificacion especulativa exacta del motor, no del afinado.

## Capacidades

- Prediccion de tokens para decodificacion especulativa: propone los siguientes tokens que el modelo principal verifica.
- Salida identica a la decodificacion sin borrador: los identificadores de token coinciden con el borrador activado y desactivado.
- Aceleracion de decodificacion en un solo request: factor de x1,47 a x1,89 segun idioma y perfil.
- Soporte multilingue en ingles, espanol, japones, chino, frances, aleman, italiano y portugues.
- Rendimiento destacado en generacion de codigo (98,1 tok/s, 74,5 % de tokens propuestos aceptados).
- Integracion con el motor strix-halo-engine-lab mediante la familia `gemma4` y carga automatica desde `drafter-mtp/`.
- No es un modelo de chat ni de razonamiento autonomo: no genera respuestas por si mismo ni soporta tool calling de forma independiente.

## Casos de uso

- Aceleracion de inferencia local en AMD Strix Halo: colocar el borrador en `MODEL_DIR/drafter-mtp` y lanzar el servidor con el perfil `default` para pasar de 52,2 a 85,1 tok/s en chat en ingles, sin alterar la salida.
- Generacion de codigo en produccion local: con 98,1 tok/s y un 74,5 % de tokens aceptados, es adecuado para asistentes de codigo interactivos en hardware de consumo.
- Servicio de chat multilingue: ofrece aceleraciones de x1,51 en espanol y x1,47 en japones, utiles para atencion al cliente en varios idiomas sobre una sola maquina.
- Despliegue con perfil de maxima velocidad: el perfil `fast` (Q4_K_M con activaciones int8) alcanza 92,2 tok/s (x1,82), apropiado para entornos donde prima el throughput.
- Despliegue con perfil de maxima calidad: combinado con el pack EXL3 M4, ofrece 72,1 tok/s (x1,76) cuando se prioriza la fidelidad de los pesos.
- Servicio con concurrencia moderada: con 4 peticiones concurrentes logra 138,6 tok/s agregados frente a 132,1 sin borrador, util para endpoints de baja concurrencia.
- Evaluacion comparativa de borradores: sirve para medir el compromiso entre tokens por paso y coste por paso frente al borrador DFlash oficial de NVIDIA.

## Benchmarks y rendimiento

Decodificacion codiciosa, 256 tokens, 3 rondas intercaladas con borrador activado y desactivado, en un AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S gfx1151, 128 GB):

| Perfil (pesos) | Con borrador (tok/s) | Sin borrador (tok/s) | Aceleracion |
|---|---:|---:|---:|
| `default` (Q4_K_M oficial) | 85,1 | 52,2 | x1,63 |
| `fast` (Q4_K_M, activaciones int8) | 92,2 | 50,6 | x1,82 |
| `quality` (EXL3 M4) | 72,1 | 41,0 | x1,76 |
| Referencia: llama.cpp `74a4fb00`, Q4_K_M oficial | 55,4 (decodificacion simple) | — | — |

Por idioma (perfil `default`):

| Prompt | Con borrador (tok/s) | Sin borrador (tok/s) | Aceleracion | Tokens por paso | Tokens propuestos aceptados |
|---|---:|---:|---:|---:|---:|
| Ingles | 85,1 | 52,1 | x1,63 | 2,02 | 56,6 % |
| Espanol | 78,6 | 52,0 | x1,51 | 1,73 | 60,2 % |
| Japones | 76,5 | 52,1 | x1,47 | 1,83 | 45,0 % |
| Codigo | 98,1 | 52,0 | x1,89 | 2,33 | 74,5 % |

Comparativa de borradores (mismo motor y maquina, Q4_K_M oficial, perfil `default`, un request, 256 tokens):

| Prompt | Este borrador (tok/step / tok/s) | Asistente Google sin afinar (tok/step / tok/s) | DFlash oficial de NVIDIA (tok/step / tok/s) | Sin borrador (tok/s) |
|---|---|---|---|---|
| Ingles | 2,02 / 85,1 | 2,03 / 85,2 | 2,21 / 69,0 | 52,1 |
| Espanol | 1,73 / 78,6 | 1,83 / 79,9 | 1,55 / 58,5 | 52,0 |
| Japones | 1,83 / 76,5 | 1,84 / 76,9 | 1,56 / 59,9 | 52,1 |
| Codigo | 2,33 / 98,1 | 2,27 / 95,3 | 2,15 / 73,6 | 52,0 |

Con 4 peticiones concurrentes (perfil `default`), el borrador propone como maximo un token por paso: 138,6 tok/s agregados frente a 132,1 sin borrador.

## Requisitos de hardware

- VRAM estimada para el borrador: no disponible de forma explicita; el repositorio ocupa 0,2 GB y el modelo tiene 78,8 M de parametros, por lo que su huella es minima frente al modelo principal.
- Hardware de referencia: AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S gfx1151, 128 GB de memoria unificada).
- El coste por paso del borrador es de aproximadamente 1 ms, frente a unos 10 ms del DFlash de NVIDIA (360 M de parametros, BF16 GGUF).
- GPU recomendadas: no disponible; las mediciones publicadas corresponden exclusivamente a Strix Halo.
- Cabe en GPU de consumo: si, dado su reducido tamano, aunque no se publican pruebas en RTX 4090 u otras.
- Opciones de despliegue: motor strix-halo-engine-lab (`strix-gemma4-serve`); se referencia llama.cpp como comparativa de decodificacion simple, pero el borrador se integra en el motor propio.
- Latencia y throughput: 85,1 tok/s en ingles, 78,6 en espanol, 76,5 en japones y 98,1 en codigo con perfil `default`; 92,2 tok/s con `fast` y 72,1 con `quality`.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Rendimiento (ingles, tok/s) |
|---|---:|---|---|---:|
| hyukudan/Nemotron-3.5-Bolt-E4B-MTP-Drafter | 78,8 M | MTP assistant afinado | Apache 2.0 | 85,1 |
| google/gemma-4-E4B-it-assistant | 78,8 M | MTP assistant sin afinar | no disponible | 85,2 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash | 360 M | DFlash, BF16 GGUF | no disponible | 69,0 |

El borrador de hyukudan y el asistente de Google sin afinar ofrecen practicamente la misma velocidad en el motor; la ventaja del DFlash de NVIDIA en tokens por paso (2,21 frente a 2,02 en ingles) se ve compensada por su mayor coste por paso (unos 10 ms frente a 1 ms), lo que reduce su aceleracion a x1,12-x1,41.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: solo funciona como borrador dentro de un motor de decodificacion especulativa compatible.
- Las mediciones se limitan a un unico entorno de hardware (AMD Strix Halo) y a un unico motor (strix-halo-engine-lab); no hay datos para otras GPU ni para vLLM, TGI o llama.cpp.
- El afinado sobre salidas de Nemotron aporta una mejora de aproximadamente +1,5 % en tokens esperados por ciclo, pero queda dentro del ruido en las prompts medidas.
- Con concurrencia alta (4 peticiones) el borrador propone como mucho un token por paso y la ganancia se reduce a 138,6 frente a 132,1 tok/s agregados.
- No se documentan sesgos, riesgos de alucinacion ni limites de contexto propios, ya que la calidad de la salida depende integramente del modelo principal.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Gemma-4-E4B-it-assistant) puede tener condiciones adicionales no detalladas en la informacion disponible.
- El modelo tiene 0 likes y 290 descargas, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- HuggingFace: https://huggingface.co/hyukudan/Nemotron-3.5-Bolt-E4B-MTP-Drafter
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-assistant
- Modelo principal: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Borrador DFlash oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Pack EXL3 M4: https://huggingface.co/hyukudan/Nemotron-3.5-Bolt-E4B-EXL3
- Repositorio del motor: https://github.com/hyukudan/strix-halo-engine-lab
- Guia del modelo en el motor: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/models/nemotron-3.5-bolt-e4b/README.md
