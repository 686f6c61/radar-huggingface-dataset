# mehdi-hf/tiny-ava

## Resumen

tiny-ava es una familia de modelos de síntesis de voz (text-to-speech) de tamano reducido, disenada especificamente para persa (farsi) e ingles, con capacidad de alternar entre ambos idiomas dentro de una misma frase (code-switching). Lo desarrolla el autor independiente mehdi-hf y se construye desde cero sobre la arquitectura `tiny-voca` de n4ze3m, incorporando un generador de forma de onda de tipo fuente-filtro. La version recomendada, tiny-ava v2, tiene 8,2 millones de parametros y un export ONNX de 34,4 MB, lo que la hace apta para inferencia 100% offline en navegador y en Android.

Su relevancia practica esta en el rendimiento en CPU: segun la model card, alcanza 34,1 veces tiempo real con un solo hilo de CPU y 81,2 veces con cuatro hilos. Eso permite integrarla en aplicaciones de accesibilidad, lectores de pantalla o asistentes de voz sin GPU ni conexion de red. La familia incluye tres voces: Parisa (persa femenina), Mana (persa femenina, grabada en estudio con voz humana real) y Maya (ingles femenino).

El modelo se distribuye con pesos PyTorch (float32) y ONNX (opset 17), junto con una tabla IPA unificada de 84 simbolos para persa e ingles. La licencia es CC BY 4.0, lo que permite uso comercial con atribucion. No es un modelo de lenguaje ni un sistema TTS de gran escala: es una pieza de infraestructura de voz optimizada para latencia y huella minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (texto a voz con generador de forma de onda fuente-filtro integrado) |
| Parametros totales | 8,20 M (v2); 4,53 M (v1) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada por secuencia de tokens IPA, sin contexto conversacional) |
| Tipos de cuantizacion | No disponible; pesos distribuidos en float32 (PyTorch y ONNX) |
| Idiomas soportados | Persa (fa) e ingles (en), con code-switching en v2 |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (opset 17) |
| Frecuencia de muestreo | 24 kHz |
| Voces | Parisa (id 0, FA femenina), Mana (id 2, FA femenina de estudio), Maya (id 3, EN femenina) |
| Tabla de simbolos | 84 simbolos IPA unificados FA+EN con marcas de estres |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

tiny-ava se basa en la arquitectura `tiny-voca`, un diseno TTS compacto que combina un frontend de texto a fonemas con un generador de forma de onda de tipo fuente-filtro integrado en el propio modelo. Esto evita depender de un vocoder neuronal separado, lo que explica el reducido numero de parametros (8,2 M en v2) y el tamano del export ONNX (34,4 MB). La entrada se compone de tokens IPA unificados para persa e ingles (84 simbolos, IDs 0 a 83) envueltos con `<bos>` y `<eos>`, mas senales auxiliares de estres, identificador de voz, velocidad, desplazamiento de tono y rango de tono.

El entrenamiento de v2 se prolongo durante 140 000 pasos, segun las curvas de entrenamiento publicadas en el repositorio. La model card menciona datos de origen como Mana-TTS HIGH (CC0, voz humana de estudio), Chatterbox Run C (que incluye 1 494 telefonos `ژ`) y el corpus `n4ze3m/tiny-voca` para la parte inglesa. No se detalla la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO, algo poco habitual en TTS. La innovacion principal es el soporte nativo de code-switching persa-ingles dentro de una misma locucion, junto con el control explicito de estres lexico y de la ezafe persa a traves del tensor `stress`.

## Capacidades

- Sintesis de voz en persa (farsi) e ingles con tres voces femeninas seleccionables por ID.
- Code-switching: mezcla de persa e ingles en una misma frase (por ejemplo, terminos tecnicos en ingles dentro de una oracion persa).
- Control de velocidad de habla mediante el parametro `speed` (1.0 por defecto; se recomienda limitar la velocidad neuronal a ~1.3 y usar Sonic WSOLA para 1.5x-3.5x).
- Control de tono: `pitch_shift` (0.058 equivale aproximadamente a +1 semitono) y `pitch_range` (1.0-1.1 recomendado).
- Marcado de estres lexico: valor 0 sin estres, 1 estres primario, 2 estres secundario en ingles o ezafe explicita en persa.
- Inferencia 100% offline en CPU, navegador y Android.
- Export ONNX con interfaz documentada para integracion en aplicaciones nativas y web.
- No soporta tool calling, function calling, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo TTS.

## Casos de uso

- Lectores de pantalla y accesibilidad en Android: el modelo puede generar voz persa e inglesa en tiempo real sobre un solo hilo de CPU, lo que permite integrarlo en aplicaciones como TalkBack sin depender de servicios en la nube ni de conectividad.
- Asistentes de voz offline en navegador: con 34,4 MB de ONNX y 34x tiempo real en CPU, se puede cargar en una pagina web y sintetizar respuestas sin enviar texto a servidores externos, util para privacidad y entornos con red restringida.
- Audiolibros y contenido educativo en persa: la voz Mana, entrenada con datos de estudio humano, ofrece una calidad mas natural (CER de 5,79% en el conjunto de prueba) adecuada para narracion de textos largos.
- Localizacion de interfaces y mensajes de sistema: el modelo permite generar avisos de UI en persa e ingles con la misma tuberia, como demuestra el ejemplo de TalkBack incluido en la model card.
- Prototipado rapido de productos de voz: al ser un modelo de 8,2 M de parametros con pesos PyTorch y ONNX, se puede iterar en local sin infraestructura GPU, reduciendo costes de experimentacion.
- Educacion de pronunciacion y G2P: combinado con los frontends `persian-g2p-tiny` o `persian-g2p-0.6b`, se puede construir una tuberia completa de texto a voz persa con control de estres y ezafe para ensenanza de fonetica.
- Sistemas embebidos y dispositivos de bajo consumo: el rendimiento de 81x tiempo real con 4 hilos de CPU permite ejecutar sintesis en dispositivos tipo Raspberry Pi o telefonos de gama media sin acelerador hardware.

## Benchmarks y rendimiento

Resultados publicados en la model card para tiny-ava v2 sobre clips de prueba reservados, evaluados con `faster-whisper large-v3`:

| Voz | Idioma | Origen de datos | CER v2 | CER ref. | WER v2 | WER ref. |
|---|---|---|---:|---:|---:|---:|
| Mana (id 2) | Persa | Estudio humano real (Mana-TTS HIGH, CC0) | 5,79% | 8,13% | 32,28% | 40,94% |
| Parisa (id 0) | Persa | Chatterbox Run C (incl. 1 494 telefonos `ژ`) | 7,48% | 9,33% | 40,14% | 44,66% |
| Maya (id 3) | Ingles | `n4ze3m/tiny-voca` (CC BY 4.0) | 2,78% | 1,72% | 10,58% | 7,94% |

Rendimiento en CPU declarado: 34,1x tiempo real con 1 hilo y 81,2x con 4 hilos (v2); 41,9x y 83,3x respectivamente para v1. En ingles, la voz Maya obtiene un CER peor que la referencia (2,78% frente a 1,72%), lo que sugiere que la calidad en ingles es inferior a la del modelo original `tiny-voca`.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de uso previsto; el modelo esta disenado para CPU. Los pesos v2 ocupan 31,3 MB (PyTorch float32) y 34,4 MB (ONNX).
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Cualquier GPU moderna puede ejecutarlo, pero no es el escenario objetivo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (navegador y Android), PyTorch nativo, y la demo de Hugging Face Spaces. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: 34,1x tiempo real con 1 hilo de CPU y 81,2x con 4 hilos (v2), segun la model card.
- Almacenamiento: repositorio completo de 0,2 GB; el modelo v2 aislado ocupa menos de 35 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---:|---|---|---|---|
| tiny-ava v2 | 8,20 M | FA + EN | No aplica | CC BY 4.0 | Hugging Face, ONNX, Android | 34x RT en 1 hilo CPU |
| tiny-ava v1 | 4,53 M | FA | No aplica | CC BY 4.0 | Hugging Face | Solo voz Parisa, 41,9x RT |
| tiny-voca (n4ze3m) | No disponible | EN | No aplica | CC BY 4.0 | GitHub / Hugging Face | Arquitectura base; referencia en ingles |
| Chatterbox | No disponible | Multiples | No disponible | No disponible | No disponible | Fuente de datos de entrenamiento citada, no comparable directamente |

No se dispone de datos suficientes para comparar con otros modelos TTS persas de referencia (por ejemplo, sistemas basados en VITS o FastSpeech) en parametros, contexto y rendimiento dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Solo admite dos idiomas (persa e ingles); no es multilingue general.
- La calidad en ingles (voz Maya) es inferior a la referencia `tiny-voca`: CER de 2,78% frente a 1,72%, y WER de 10,58% frente a 7,94%.
- El WER en persa es elevado (32,28% en Mana y 40,14% en Parisa), aunque mejor que la referencia; conviene validar en el dominio concreto antes de produccion.
- No se detalla la composicion del dataset de entrenamiento ni posibles sesgos de las voces; al ser voces femeninas unicamente, no cubre otras variantes de genero o acento.
- Riesgo de artefactos y alucinaciones acusticas inherente a los modelos TTS pequenos, especialmente en textos largos o con simbolos poco frecuentes.
- La velocidad neuronal debe limitarse a ~1.3; para velocidades superiores se recomienda Sonic WSOLA, lo que anade complejidad al pipeline.
- Licencia CC BY 4.0: permite uso comercial con atribucion; es necesario citar al autor y conservar el aviso de licencia.
- No es un modelo de lenguaje: no soporta razonamiento, tool calling ni agentes; su unico proposito es la sintesis de voz.
- El proyecto depende de un autor individual y de un repositorio pequeno (342 descargas, 27 likes en el momento de la consulta), por lo que el soporte a largo plazo no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mehdi-hf/tiny-ava
- Demo en navegador (Hugging Face Spaces): https://huggingface.co/spaces/mehdi-hf/tiny-ava-demo
- Repositorio GitHub y app Android offline: https://github.com/mallahyari/tiny-ava
- Frontend G2P persa tiny (16 MB, MIT): https://huggingface.co/mehdi-hf/persian-g2p-tiny
- Frontend G2P persa 0.6B (596M, Apache-2.0): https://huggingface.co/mehdi-hf/persian-g2p-0.6b
- Arquitectura base tiny-voca: https://github.com/n4ze3m/tiny-voca
