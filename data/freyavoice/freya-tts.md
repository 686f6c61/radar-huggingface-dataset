# freyavoice/Freya-TTS

## Resumen

FreyaTTS-small es un modelo de sintesis de voz (text-to-speech) en turco de 183,2 millones de parametros, desarrollado por freyavoice (Freya, YC S25). Se trata del miembro abierto de la familia FreyaTTS y esta disenado para ser autoalojable, publicandose de forma completa con pesos, codigo de inferencia y pipeline de entrenamiento bajo licencia Apache-2.0. Su objetivo es ofrecer sintesis de voz turca de alta calidad en un tamano compacto que quepa en hardware de consumo.

Tecnicamente, el modelo es un transformer de difusion con flow-matching condicional y generacion no autorregresiva. Es tokenizer-free a nivel de caracter (vocabulario de 92 simbolos, sin fonemizador ni G2P) y opera en el espacio latente congelado de AudioVAE2 (64 dimensiones a 25 Hz, codificacion a 16 kHz y decodificacion a 48 kHz). La salida es mono a 48 kHz.

Su relevancia actual radica en que demuestra que un modelo sub-1B puede competir en calidad (WER 8,0% / CER 3,0%) superando a alternativas mucho mas conocidas como XTTS-v2 y F5-TTS en turco, con un coste computacional muy reducido (1,5 GB de VRAM y RTF 0,10-0,11 en una RTX 4090). Esta pensado para desarrolladores que necesitan desplegar agentes de voz en turco sin depender de servicios propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con flow-matching condicional (DiT), no autorregresivo, ODE de Euler a 32 pasos, sin CFG |
| Parametros totales | 183.198.145 (183,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS tokenizer-free a nivel de caracter; no se especifica limite de longitud de texto) |
| Tipos de cuantizacion | no disponible (el repositorio usa safetensors; el model card no detalla cuantizaciones) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FreyaTTS-small emplea un transformer de difusion con flow-matching condicional (diffusion transformer, DiT) de generacion no autorregresiva. El proceso de muestreo usa un solver ODE de Euler a 32 pasos y no recurre a classifier-free guidance (CFG). El modelo es tokenizer-free a nivel de caracter, con un vocabulario de 92 simbolos de entrada en turco, lo que elimina la necesidad de un fonemizador o de un sistema G2P. Trabaja sobre el espacio latente congelado de AudioVAE2 (openbmb/VoxCPM2, Apache-2.0): latentes de 64 dimensiones a 25 Hz que se codifican a 16 kHz y se decodifican a 48 kHz. La salida es audio mono a 48 kHz. El modelo genera una unica voz objetivo, sin clonacion.

El entrenamiento se realizo desde cero sobre habla en turco, con una fase de preentrenamiento seguida de dos etapas de SFT (stage 1/2): una orientada al bloqueo de voz (voice lock) y otra a la cobertura de enunciados cortos. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni el uso de RLHF/DPO. El informe tecnico asociado es arXiv:2607.09530.

## Capacidades

- Sintesis de voz (text-to-speech) en turco a partir de texto plano.
- Tokenizacion a nivel de caracter con 92 simbolos, sin fonemizador ni G2P.
- Generacion no autorregresiva mediante flow-matching con ODE de Euler a 32 pasos.
- Salida de audio mono a 48 kHz.
- Voz unica objetivo con bloqueo de voz (voice lock), sin clonacion de voces.
- Inferencia rapida y de baja huella de memoria (RTF 0,10-0,11 y 1,5 GB de VRAM en RTX 4090).
- Capacidad de ejecucion en CPU (Apple M3: RTF 0,70 en fp32; ~0,12 end-to-end via Core ML en silicio de Apple).
- Soporte de concurrencia (9,4 audio-s/s con concurrencia 4 en RTX 4090).

No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio de entrada, razonamiento multi-paso ni multilinguesmo mas alla del turco.

## Casos de uso

- Agentes de voz en turco: el modelo esta disenado para servir agentes conversacionales de voz en turco, con baja latencia (TTFT ~0,5 s) y bajo consumo de VRAM, lo que permite desplegarlo en produccion sobre una unica GPU.
- Sistemas de atencion al cliente automatizada: puede generar respuestas habladas en turco para centralitas telefonicas o chatbots de voz, con una voz consistente gracias al bloqueo de voz y sin necesidad de clonacion.
- Lectura de texto a voz (audiobooks, noticias): sintesis de contenido textual largo en turco con salida a 48 kHz, adecuada para locuciones y narraciones.
- Asistentes de accesibilidad: conversion de texto a voz para personas con discapacidad visual o dificultades de lectura en entornos de habla turca.
- Generacion de locuciones para contenido multimedia: doblaje de videos, podcasts o material formativo donde se requiere una voz turca uniforme y de calidad.
- Sistemas embebidos y edge: al requerir solo 1,5 GB de VRAM y poder ejecutarse en CPU (Apple M3 a RTF 0,70), es apto para dispositivos sin GPU dedicada o despliegues on-device.
- Investigacion en TTS: al liberar pesos, codigo y pipeline de entrenamiento, sirve como base para experimentar con flow-matching, DiT y espacios latentes de audio en turco y otros idiomas.
- Prototipado de interfaces de voz en CI/CD: integrable en pipelines de pruebas para validar interacciones habladas sin coste de API externa.

## Benchmarks y rendimiento

Evaluacion sobre Freya-TR-Eval (conjunto de evaluacion turco):

| Modelo | WER | CER |
|---|---|---|
| FreyaTTS-small | 8,0% | 3,0% |
| XTTS-v2 | 11,1% | no disponible |
| F5-TTS | 24,3% | no disponible |

FreyaTTS-small se situa 3.º de 7 entre los modelos TTS turcos abiertos sub-1B, por delante de XTTS-v2 y F5-TTS.

Rendimiento de inferencia:

| Plataforma | RTF | TTFT | VRAM | Throughput |
|---|---|---|---|---|
| RTX 4090 | 0,10-0,11 | ~0,5 s | 1,5 GB | 9,4 audio-s/s (concurrencia 4) |
| Apple M3 (CPU, fp32) | 0,70 | no disponible | no disponible | no disponible |
| Apple M3 (Core ML) | ~0,12 end-to-end | no disponible | no disponible | no disponible |

Ademas, se indica que es aproximadamente 3,2 veces mas rapido en RTF y usa 3,7 veces menos VRAM que el VoxCPM2 de 2B.

## Requisitos de hardware

- VRAM estimada: 1,5 GB en RTX 4090 (dato proporcionado por el autor).
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM; validado en RTX 4090. Dado el tamano del modelo, es probable que funcione en GPUs consumer de gama baja, aunque no se detallan otras GPU en la informacion disponible.
- Caben en GPU consumer: si, el modelo esta disenado explicitamente para ser compacto y autoalojable (1,5 GB de VRAM).
- CPU: ejecutable en CPU (Apple M3 a RTF 0,70 en fp32).
- Opciones de despliegue: libreria `freyatts` (Python, `FreyaTTS.from_pretrained`), con `device="cuda"`. Tambien Core ML en silicio de Apple. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican tipicamente a modelos TTS).
- Latencia y throughput: TTFT ~0,5 s y 9,4 audio-s/s con concurrencia 4 en RTX 4090; RTF 0,10-0,11 en RTX 4090 y ~0,12 end-to-end en M3 via Core ML.

## Comparativa con modelos similares

| Modelo | Parametros | Latentes / arquitectura | WER (Freya-TR-Eval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FreyaTTS-small | 183,2 M | Flow-matching DiT sobre AudioVAE2 | 8,0% | Apache-2.0 | Pesos abiertos en HuggingFace |
| XTTS-v2 | no disponible en la informacion | no disponible | 11,1% | no disponible en la informacion | no disponible en la informacion |
| F5-TTS | no disponible en la informacion | no disponible | 24,3% | no disponible en la informacion | no disponible en la informacion |
| VoxCPM2 | 2 B (segun el model card) | no disponible (proveedor del VAE) | no disponible | Apache-2.0 (AudioVAE2) | openbmb/VoxCPM2 |

Datos de la comparativa limitados a lo indicado en el model card. FreyaTTS-small es el unico para el que se detallan parametros, licencia y disponibilidad dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo unicamente en turco; no soporta otros idiomas segun la informacion disponible.
- Una sola voz objetivo, con bloqueo de voz; no admite clonacion de voz.
- Es un modelo no autorregresivo con 32 pasos de ODE, por lo que la calidad depende de la configuracion de muestreo (no se detallan umbrales de fallo).
- Riesgo de alucinacion o artefactos de audio no documentado explicitamente en la informacion proporcionada.
- No se detallan sesgos conocidos ni composicion del dataset de entrenamiento (numero de tokens y origenes de los datos no disponibles).
- El repositorio ocupa 0,7 GB y usa safetensors; no se documentan cuantizaciones alternativas, lo que puede limitar el despliegue en entornos muy restringidos.
- La licencia Apache-2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre el modelo large, que es propietario.
- El modelo `FreyaTTS-large`, la version de produccion con mayor naturalidad, no es de pesos abiertos y requiere contacto comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/freyavoice/Freya-TTS
- Repositorio GitHub: https://github.com/freyavoiceai/FreyaTTS
- Conjunto de evaluacion: https://huggingface.co/datasets/freyavoice/freya-tr-eval
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.09530
- AudioVAE2 (espacio latente congelado): https://huggingface.co/openbmb/VoxCPM2
- Web del desarrollador (Freya): https://freyavoice.ai
- Contacto comercial: dev@freyavoice.ai
