# fihriaLab/fihrIA-ASR-0.6B-GGUF

## Resumen

fihrIA-ASR-0.6B-GGUF es la distribucion en formato GGUF del modelo de reconocimiento automatico del habla (ASR) fihrIA-ASR-0.6B, desarrollado por fihriaLab. Se trata de un modelo especializado en dariya (arabe marroqui) construido sobre la arquitectura Qwen3-ASR, con 531.603.456 parametros (aproximadamente 0,6B) y disenado explicitamente para despliegue en CPU y entornos de borde. Su proposito es ofrecer transcripcion robusta de habla real en dariya, incluyendo cambios de codigo naturales entre dariya, frances e ingles, con salida nativa en escritura arabe.

El modelo aborda un problema concreto: la mayoria de sistemas ASR multilingues rinden mal en dariya, un dialecto con escasa representacion en corpus de entrenamiento. fihrIA-ASR emplea un tokenizer compartido de 89k tokens especifico para dariya y se evalua bajo un protocolo unificado junto a la variante de 1.7B. La version 0.6B prioriza eficiencia: segun la model card, alcanza 5,98x tiempo real en CPU de portatil con cuantizacion de 4 bits y 255x tiempo real en una H100.

Esta publicacion GGUF es la ruta de inferencia para CPU mediante la pila multimodal (mtmd) de llama.cpp. Requiere emparejar el modelo de lenguaje con su proyector de audio (mmproj) correspondiente. Para GPU, el autor remite a los repositorios de safetensors en BF16. El modelo se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo de lenguaje + torre de audio multimodal, empaquetado para mtmd de llama.cpp) |
| Parametros totales | 531.603.456 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; la model card usa `-c 8192` como referencia de memoria |
| Tipos de cuantizacion | Q4_K_M y BF16 (GGUF); el proyector de audio se mantiene en BF16 |
| Idiomas soportados | ar, ary (dariya); maneja cambio de codigo con frances e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con fichero mmproj separado para el audio |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-ASR, compuesta por un modelo de lenguaje y una torre de audio (proyector multimodal) que se cargan como dos componentes independientes en llama.cpp mediante su pila mtmd. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Si se indica que el entrenamiento emplea un tokenizer compartido de 89k tokens especifico para dariya y que la familia se evalua bajo un protocolo unificado con cuatro jueces LLM independientes sobre 508 clips.

La innovacion principal es la especializacion linguistica: salida nativa en escritura arabe optimizada para estructuras locales y manejo robusto de code-switching dariya-frances-ingles. En el plano de despliegue, el empaquetado GGUF con separacion entre modelo de lenguaje y proyector de audio permite ejecucion en CPU con cuantizacion de 4 bits manteniendo el codificador de audio en BF16, lo que segun el autor preserva la calidad de la transcripcion.

## Capacidades

- Reconocimiento automatico del habla en dariya con salida en escritura arabe nativa.
- Transcripcion robusta de cambios de codigo (code-switching) con palabras en frances e ingles embebidas en habla dariya.
- Formateo y transcripcion directa en escritura arabe adaptada a estructuras linguisticas locales.
- Ejecucion en tiempo real en CPU de portatil con cuantizacion Q4_K_M (5,98x tiempo real segun la model card).
- Despliegue en GPU de alta capacidad con throughput elevado (255x tiempo real en una H100 con Q4).
- Integracion con llama.cpp mediante la pila multimodal mtmd (modelo de lenguaje + mmproj).
- Cliente de referencia `transcribe.py` (solo biblioteca estandar) para `llama-server`.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y notas de voz en dariya: el modelo convierte audio de habla marroqui en texto en escritura arabe, adecuado para equipos que trabajan con contenido oral dialectal y necesitan actas o resumenes.
- Subtitulado de contenido audiovisual marroqui: permite generar subtitulos de videos, podcasts o programas donde los hablantes alternan dariya con frances e ingles, gracias al manejo de code-switching.
- Atencion al cliente en centros de contacto locales: transcripcion de llamadas en dariya para analitica de calidad, busqueda en grabaciones y cumplimiento, ejecutable en CPU de servidores sin GPU dedicada.
- Despliegue en el borde y dispositivos con recursos limitados: con 342 MB para el modelo Q4_K_M y 379 MB para el mmproj, cabe en portatiles y equipos embebidos, permitiendo transcripcion local sin enviar audio a la nube.
- Investigacion linguistica y sociolinguistica: generacion de corpus transcritos de dariya con cambios de codigo para estudios de variacion y contacto de lenguas, con un modelo abierto y reproducible.
- Prototipado rapido de aplicaciones de voz: el cliente `transcribe.py` y `llama-server` permiten montar un servicio de transcripcion en minutos sobre infraestructura CPU existente.
- Sistemas de accesibilidad y dictado: entrada por voz en dariya para aplicaciones de dictado o interfaces accesibles en entornos donde el hardware no dispone de GPU.

## Benchmarks y rendimiento

Datos de la model card para las builds Q4_K_M (menor es mejor en SER y CER; mayor es mejor en throughput):

| Metrica | fihrIA-ASR 0.6B | fihrIA-ASR 1.7B | Mistral Voxtral Mini 4B | MoulSot 1.7B |
|---|---|---|---|---|
| SER medio en held-out | 7,1% | 6,1% | 8,4% | 11,2% |
| DarijaCS CER (Prism / Probe, Q4) | 7,98 / 9,84% | 6,54 / 9,23% | 6,68 / 9,69% | 10,27 / 14,93% |
| Throughput en H100 | 255x tiempo real | 243x tiempo real | 34x | 147x |
| CPU de portatil, Q4 | 5,98x | no disponible | no disponible | 3,06x |
| Huella BF16 / Q4 | 1.447 / 721 MB | 3.830 / 1.642 MB | no disponible | no disponible |

Los repositorios de safetensors reportan CER en BF16 (0.6B: 7,98 / 9,80%; 1.7B: 6,24 / 8,71%). Las cifras de la tabla son las de Q4 y son las que deben usarse al desplegar en 4 bits. Los numeros held-out son la media de cuatro jueces LLM independientes sobre 508 clips; las cifras DarijaCS de Voxtral son las publicadas por su autor y el resto son reruns sobre los mismos clips.

## Requisitos de hardware

- RAM estimada en CPU con `-c 8192`: aproximadamente 1,6 GB para Q4_K_M (incluye unos 900 MB de cache KV) y aproximadamente 2,4 GB para BF16 GGUF. Reducir `-c` disminuye el consumo.
- Ficheros en disco: 342 MB (modelo Q4_K_M) + 379 MB (mmproj BF16) para la variante 0.6B.
- GPU recomendadas: el autor remite a safetensors BF16 con backend transformers (`qwen-asr`) para GPU NVIDIA; con vLLM para alto throughput con batching. La model card cita una H100 para las mediciones de throughput.
- Cabe en GPU de consumo: la ruta GGUF esta pensada para CPU; no se documentan requisitos de VRAM especificos para GPU de consumo con esta build.
- Opciones de despliegue: llama.cpp (build 9199 o superior, commit `39cf5d619`, 2026-05-17) mediante `llama-server` y la pila mtmd; para GPU, transformers con `qwen-asr` o vLLM.
- Latencia y throughput: 5,98x tiempo real en CPU de portatil con Q4 y 255x tiempo real en una H100 con Q4, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SER held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fihrIA-ASR 0.6B | 531.603.456 | no disponible | 7,1% | Apache 2.0 | HF (GGUF y safetensors) |
| fihrIA-ASR 1.7B | no disponible | no disponible | 6,1% | Apache 2.0 | HF (GGUF y safetensors) |
| Mistral Voxtral Mini 4B | no disponible | no disponible | 8,4% | no disponible | HF |
| MoulSot 1.7B | no disponible | no disponible | 11,2% | no disponible | HF |

La comparativa se limita a los datos publicados en la model card. No se dispone de informacion sobre contexto, licencia ni parametros exactos de Voxtral Mini 4B y MoulSot 1.7B en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado en dariya: su rendimiento fuera de ese dialecto o del cambio de codigo con frances e ingles no esta documentado.
- Riesgo de alucinacion y de palabras incorrectas: la model card advierte que builds de llama.cpp anteriores a la 9199 cargan los ficheros sin error pero producen salida fluida con palabras silenciosamente erroneas.
- El proyector de audio (mmproj) es obligatorio y no es intercambiable entre las variantes 0.6B y 1.7B; debe emparejarse siempre con su modelo de lenguaje correspondiente.
- El mmproj debe mantenerse en BF16: cuantizar el codificador de audio no esta validado para este modelo.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que limita la evaluacion de riesgos de sesgo.
- La longitud de contexto no se especifica de forma explicita; la referencia de `-c 8192` es una configuracion de memoria, no un limite documentado del modelo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de los modelos base (Qwen3-ASR) citados por el autor.
- Las cifras de rendimiento proceden del propio autor; los benchmarks de terceros son reruns sobre los mismos clips, no evaluaciones independientes externas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B-GGUF
- Modelo base en safetensors: https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B
- Variante 1.7B en safetensors: https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B
- Variante 1.7B en GGUF: https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B-GGUF
- Demo en vivo (Space): https://huggingface.co/spaces/fihria/fihrIA-ASR-Demo
- llama.cpp: https://github.com/ggml-org/llama.cpp
