# ashwaaaaa/nemotron-3-5-lightning-30b-a3b-bf16-tt

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue (bring-up) del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` optimizado para hardware Tenstorrent. Lo publica el usuario `ashwaaaaa` como «experimental community bring-up», generado con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1) y planificado con `tt_hw_planner`, que ajusta kernels y palancas de rendimiento contra un pipeline extremo a extremo validado por PCC. El objetivo es servir el modelo citado con una API compatible con OpenAI sobre una malla `P300x2` (dos tarjetas Tenstorrent Blackhole p300).

El modelo base es la familia Nemotron 3.5 Lightning de NVIDIA; por la nomenclatura del nombre (30B-A3B) se deduce una arquitectura de mezcla de expertos con unos 30 000 millones de parametros totales y unos 3000 millones activos por token, aunque la model card de este paquete no detalla contexto, composicion de entrenamiento ni idiomas. El paquete en si ocupa 2,4 GB porque no incluye los pesos: estos se descargan aparte desde el repositorio de NVIDIA en la cache de HuggingFace durante la instalacion.

Su relevancia es doble: por un lado, demuestra el flujo de publicacion de paquetes portados a Tenstorrent (`tt model pull` / `tt serve`, servidor en el puerto 20000, chat completions, completions y `/v1/models`); por otro, aporta medidas de latencia reales sobre p300x2 con hasta 32 secuencias concurrentes. Es un artefacto de infraestructura, no una ficha de capacidades del modelo base, y asi debe leerse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | autoport del modelo base `nvidia_nemotron_3_5_lightning_30b_a3b_bf16` (familia Nemotron 3.5 Lightning; arquitectura interna no detallada en la model card) |
| Parametros totales | ~30 000 millones (deducido del nombre del modelo base; no confirmado en la model card) |
| Parametros activos | ~3000 millones (deducido del sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 unicamente (el paquete solo publica la variante BF16; no se listan GGUF, FP8, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en este paquete; los pesos provienen del repositorio base de NVIDIA y se rigen por la licencia de este) |
| Formato de pesos | no disponible; los pesos BF16 no se incluyen en el repositorio (2,4 GB) y se descargan desde `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` a la cache de HuggingFace |
| Hardware objetivo | malla `P300x2` (Tenstorrent, tag `blackhole`, tag `p300x2`) |
| Concurrencia maxima | 32 secuencias |
| Servidor | API compatible con OpenAI en `http://127.0.0.1:20000/v1` |
| Tamano del repositorio | 2,4 GB |
| Estado | experimental, community bring-up |

## Arquitectura y entrenamiento

El paquete no reentrena ni modifica los pesos: empaqueta una build de inferencia. La cadena de compilacion esta declarada con hashes concretos en la seccion de trazabilidad: tt-metal en el commit `2e7a7397ab7f6aac52527a0b56a26963e26d71bd`, vLLM `v0.24.0`, el plugin `vllm-tt-plugin` en el commit `35090660433d5606957ded97f7130b5cc75f94f7` y un digest `code/` (sha256, primeros 16 digitos hex) de `6783233236f143f4`, compilado el 2026-09-26T18:50:33+00:00 por tt-model 0.1.0. El directorio `code/` del repositorio es identico byte a byte al codigo de modelo embebido en la imagen.

La parte de «entrenamiento» del modelo subyacente (numero de tokens, composicion del dataset, si hubo RLHF o DPO) no se documenta en esta model card y por tanto queda como no disponible. Lo que si se documenta es el mecanismo de portado: `tt_hw_planner` realiza autotuning de kernels y palancas de rendimiento contra un pipeline extremo a extremo con puerta de PCC, y el arranque en frio compila kernels para el dispositivo, lo que tarda varios minutos. La verificacion de correccion se hace en dispositivo comparando la salida del pipeline Tenstorrent contra la implementacion de referencia de HuggingFace con teacher forcing sobre la secuencia generada.

## Capacidades

- Generacion de texto mediante endpoint compatible con OpenAI (`chat completions`, `completions`, `/v1/models`).
- Servicio batcheado con decodificacion concurrente de hasta 32 secuencias en una malla p300x2.
- Integracion con vLLM (version 0.24.0) a traves de `vllm-tt-plugin`, lo que permite reutilizar clientes y herramientas habituales del ecosistema vLLM.
- Capacidades del modelo base (razonamiento, codigo, matematicas, multilingue, tool calling): no se documentan en esta model card, por lo que no se pueden afirmar desde esta fuente.
- Modo de pensamiento, vision o audio: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentacion de este paquete.

## Casos de uso

- Servicio interno de inferencia con API OpenAI: se levanta con `tt serve` en el puerto 20000 y los clientes existentes solo tienen que apuntar a `http://127.0.0.1:20000/v1` pasando `"model": "nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16"`, lo que evita reescribir integraciones ya existentes.
- Evaluacion de rendimiento de hardware Tenstorrent: el paquete incorpora un arnes de rendimiento en dispositivo (`test_main_perf`) con prompts de longitud fija, salida fijada y concurrencia controlada, util para comparar p300x2 frente a otras plataformas con la misma carga.
- Banco de pruebas de migracion de vLLM a aceleradores: al fijar la version de vLLM y el commit del plugin, sirve como referencia reproducible para validar que una migracion mantiene la correccion (PCC 0.9999 frente a la referencia HF).
- Laboratorio de investigacion con throughput agregado alto: con 32 usuarios concurrentes el paquete reporta 2576 tok/s totales, adecuado para generacion masiva de datos sinteticos o anotacion por lotes en un nodo unico.
- Validacion de kernels y del planificador `tt_hw_planner`: el directorio `code/` identico a la imagen permite auditar y reproducir la build exacta, util para equipos que depuran diferencias de precision en aceleradores.
- Despliegue en el borde de red con requisitos de acelerador no NVIDIA: al ejecutarse sobre mallas p300x2, encaja en entornos donde no se quieren o no se pueden usar GPU de NVIDIA.
- Integracion en pipelines de evaluacion continua: su condicion de PCC como puerta end-to-end permite usarlo como test de regresion de precision cada vez que se actualiza el stack (tt-metal, vLLM o el plugin).

## Benchmarks y rendimiento

Resultados publicados en la model card del paquete:

| Metrica | Resultado | Valor |
|---|---|---|
| PCC extremo a extremo frente a la referencia de HuggingFace (teacher forcing) | pasa | 0,9999 |

Latencia medida en dispositivo (`test_main_perf`, 2026-09-26), con prompts de exactamente ISL tokens y salida fijada a OSL tokens, decodificacion batcheada:

| ISL | OSL | Usuarios | TPOT (ms) | Decode (tok/s/usuario) | Out (tok/s total) |
|---|---|---|---|---|---|
| 128 | 128 | 1 | 12,4 | 80,5 | 80 |
| 128 | 128 | 8 | 12,4 | 80,5 | 644 |
| 128 | 128 | 32 | 12,4 | 80,5 | 2 576 |

La seccion «Expected performance» de la model card resume 78,5 tok/s por usuario en decodificacion (un +2984 % frente a la linea base) y 12,7 ms por token en p300x2. La model card menciona que las suites generativas IFEval, GPQA Diamond, AIME 2025 y MMLU se ejecutan a traves de un endpoint compatible con OpenAI y se reportan para modelos servidos con el plugin vLLM de Tenstorrent, pero no se publica ningun resultado de esas suites para este paquete.

## Requisitos de hardware

- Hardware objetivo: malla `P300x2` (dos tarjetas Tenstorrent Blackhole p300). Es el unico hardware validado segun la propia model card («only p300x2 was validated»).
- VRAM/espacio de acelerador: los pesos en BF16 de un modelo de ~30 000 millones de parametros ocupan aproximadamente 60 GB en bruto por calculo aritmetico (30e9 x 2 bytes), sin contar cache KV ni activaciones; la model card no publica la huella real en p300x2.
- GPU de NVIDIA: no aplica a este paquete, que se ejecuta sobre el stack Tenstorrent (tt-metal mas `vllm-tt-plugin`). No se ha validado en A100, H100 ni RTX 4090.
- GPU de consumo: no disponible para este paquete. Como referencia aritmetica, la variante BF16 del modelo base no cabria en una GPU de 24 GB sin cuantizacion, y este repositorio no publica pesos cuantizados.
- Opciones de despliegue: `tt` CLI (`tt model pull`, `tt serve`) o `tt-model` (`tt-model pull --with-weights`, `tt-model serve`); servidor compatible con OpenAI en el puerto 20000 o el siguiente libre.
- Arranque: la primera ejecucion compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- Concurrencia y latencia: hasta 32 secuencias concurrentes, 12,4 ms por token de decodificacion por usuario y 80,5 tok/s por usuario mantenidos de 1 a 32 usuarios segun las medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Rendimiento documentado |
|---|---|---|---|---|---|
| `ashwaaaaa/nemotron-3-5-lightning-30b-a3b-bf16-tt` (este paquete) | ~30B totales, ~3B activos (segun nombre del base) | no disponible | apache-2.0 | Contenedor Tenstorrent, pesos BF16 descargados aparte; vLLM 0.24.0 + vllm-tt-plugin | PCC 0,9999; 80,5 tok/s por usuario; 2 576 tok/s con 32 usuarios en p300x2 |
| `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` (modelo base) | ~30B totales, ~3B activos (segun nombre) | no disponible | consultar la model card de NVIDIA | Pesos BF16 para el ecosistema HuggingFace | no disponible en la informacion proporcionada |
| Alternativas de terceros del mismo tamano o categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar el paquete con su modelo base; no incluye datos de modelos competidores comparables.

## Limitaciones y advertencias

- Es un «experimental community bring-up»: no es un artefacto oficial de Tenstorrent ni de NVIDIA, aunque use su tooling y sus pesos.
- Solo se ha validado en p300x2; el comportamiento en otras mallas o dispositivos Tenstorrent no esta documentado.
- El repositorio acumula 0 descargas y 0 likes, por lo que no hay validacion independiente de la comunidad.
- Riesgo de alucinacion inherente al modelo generativo base; no se documentan tasas de error ni evaluaciones de veracidad en este paquete.
- Sesgos conocidos: no disponible. No se publica ninguna evaluacion de sesgo, toxicidad o seguridad para este paquete.
- Cobertura de idiomas: no disponible. No se puede asumir soporte multilingue ni castellano a partir de esta ficha.
- Longitud de contexto: no disponible. Las unicas medidas publicadas usan ISL y OSL de 128 tokens, muy por debajo de lo que suele soportar un modelo de esta familia.
- Restricciones de licencia para uso comercial: este paquete declara apache-2.0, pero los pesos no se distribuyen aqui y se rigen por la licencia de `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`; hay que revisarla antes de cualquier uso comercial.
- No incluye pesos en el repositorio: la descarga requiere red y espacio en la cache de HuggingFace, y el arranque en frio compila kernels durante varios minutos.
- Trampa de integracion: el identificador que debe enviarse en la peticion es el de los pesos (`nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`), no el nombre de este paquete.
- Fechas y marcas temporales del repositorio (2026-09-26) segun lo reportado; conviene verificar la vigencia del stack fijado (tt-metal, vLLM 0.24.0) antes de desplegar en produccion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/ashwaaaaa/nemotron-3-5-lightning-30b-a3b-bf16-tt
- Discusiones del paquete: https://huggingface.co/ashwaaaaa/nemotron-3-5-lightning-30b-a3b-bf16-tt/discussions
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal: https://github.com/apande-TT/tt-metal/commit/2e7a7397ab7f6aac52527a0b56a26963e26d71bd
- Release de vLLM v0.24.0: https://github.com/vllm-project/vllm/releases/tag/v0.24.0
- Commit de vllm-tt-plugin: https://github.com/tenstorrent/vllm-tt-plugin/commit/35090660433d5606957ded97f7130b5cc75f94f7
- Soporte de producto Tenstorrent: support@tenstorrent.com
