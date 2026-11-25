# Maximilian228/Geode-TTS-ZONOS3

## Resumen
Geode-TTS-ZONOS3 es un paquete de pesos para síntesis de voz (TTS) derivado del modelo ZONOS3-Mini de Zyphra, reempaquetado por Maximilian228 para el motor de inferencia en dispositivo (on-device) de la aplicación Geode. No se trata de un modelo reentrenado: el autor ha recuantizado el backbone a int8 y ha reorganizado el códec y los tensores en el formato propio de Geode, manteniendo intactos los pesos originales. Su función es cubrir las lenguas que los modelos de voz más pequeños de Geode no atienden con calidad suficiente: tailandés, tagalo/filipino, urdu y chino mandarín.

El modelo base, ZONOS3-Mini, emplea una arquitectura híbrida con 11 capas que combina Gated DeltaNet y atención, junto con un MoE latente, y se acompaña del códec ZAC (variante `mossdual_istft keep2_plain`) para la decodificación de audio. El paquete ocupa 1,3 GB en el repositorio y está diseñado para ejecutarse en CPU y, en Snapdragons recientes, en NPU/DSP de teléfonos Android, sin conexión a red.

Su relevancia actual radica en que demuestra un flujo de despliegue de TTS neuronal multilingüe completamente local en hardware móvil, con licencia Apache-2.0 y métricas de calidad medidas mediante reconocimiento automático del habla (round trip con FLEURS), lo que facilita su integración en aplicaciones de accesibilidad, lectura en voz alta y asistentes offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet + atención, MoE latente (11 capas); códec ZAC (`mossdual_istft keep2_plain`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE latente, sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone int8 con escalas de bloque E4M3; normas, router y consultas AttnRes en fp32; códec en fp16 (normas fp32) |
| Idiomas soportados | Tailandés (th), tagalo/filipino (tl), urdu (ur), chino mandarín (zh) |
| Licencia | Apache-2.0 (Copyright 2026 Zyphra, Inc.) |
| Formato de pesos | Formato propio de Geode: `lm/lm.bin` + `lm/geode.json`, `codec/codec.bin` + `codec/geode.json`, embeddings de hablante `.npy`, cabezas LACI en JSON |

## Arquitectura y entrenamiento
El backbone procede de ZONOS3-Mini y consta de 11 capas que intercalan Gated DeltaNet (un mecanismo de estado recurrente lineal) con atención, más una capa MoE latente que activa expertos de forma dispersa. El autor no ha reentrenado el modelo: ha recuantizado las filas a int8 con escalas de bloque E4M3 a partir del `model.pth` en bf16, dejando en fp32 las normas, el router y las consultas de AttnRes. El decodificador del códec ZAC se mantiene en fp16 porque la cuantización int8 del decodificador degrada la señal hasta 30 dB de SNR frente a los 69,6 dB que se obtienen en fp16.

El paquete incluye 27 embeddings de hablante de 192 dimensiones (896 bytes cada uno) correspondientes a las voces por defecto originales, y las cabezas de alineación LACI por idioma, que se activan durante la inferencia para mejorar la fidelidad prosódica y fonética. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades
- Síntesis de voz (text-to-speech) en tailandés, tagalo/filipino, urdu y chino mandarín.
- Selección de voz entre 27 embeddings de hablante predefinidos incluidos en el paquete.
- Alineación lingüística mediante cabezas LACI por idioma, activables en inferencia.
- Ejecución completamente offline en dispositivo, sin dependencia de servidores.
- Aceleración por hardware: códec en DSP y, en modo "NPU only", también el modelo de lenguaje en la NPU de Snapdragon 8 Elite.
- Normalización de texto integrada en la aplicación mediante `zyphra-textnorm` (derivado de NeMo, Apache-2.0).
- No se documentan capacidades de clonación de voz, tool calling, razonamiento multi-paso ni procesamiento de audio de entrada en la información disponible.

## Casos de uso
- Lectura en voz alta de respuestas en asistentes conversacionales móviles: Geode emplea este paquete para verbalizar las respuestas del chat en tailandés, tagalo, urdu y mandarín, manteniendo la conversación offline y sin enviar texto a la nube.
- Accesibilidad para personas con discapacidad visual: la síntesis local permite leer pantallas y documentos en los cuatro idiomas soportados sin coste de red ni latencia de servidor, con la voz precargada en el dispositivo.
- Aplicaciones de aprendizaje de idiomas: los 27 embeddings de hablante permiten ofrecer distintas voces para practicar pronunciación y comprensión auditiva en tailandés, filipino, urdu y chino.
- Navegación y avisos por voz en entornos sin conectividad: al ejecutarse en CPU/NPU y ocupar 1,3 GB, el paquete puede residir en el almacenamiento del teléfono y generar avisos hablados en campo, transporte o zonas rurales.
- Integración en lectores de noticias y ebooks: la ventana de contexto no está documentada, pero el diseño por frases del motor Geode permite procesar párrafos de forma incremental con el backbone int8 de 900 MB.
- Prototipado de interfaces de voz para mercados del sudeste asiático y Pakistán: al ser Apache-2.0 y ejecutable en Android, sirve para validar productos de voz en tagalo, tailandés y urdu antes de invertir en infraestructura cloud.
- Investigación en TTS eficiente: el paquete documenta el impacto de la cuantización (int8 frente a fp16 en el códec) y las métricas de SNR, lo que lo convierte en una referencia reproducible para estudios de compresión de modelos de voz.

## Benchmarks y rendimiento
Calidad medida mediante round trip con FLEURS (30 frases, LACI activado). CER: tasa de error de caracteres, menor es mejor.

| Idioma (FLEURS) | ASR empleado | Este paquete | Servidor ggml upstream |
|---|---|---|---|
| cmn_hans_cn | Whisper large-v3-turbo CER | 4,95 | 5,16 |
| ur_pk | IndicConformer CER | 4,82 | 5,07 |
| fil_ph | Omnilingual CTC CER | 7,16 | 9,27 |
| th_th | Whisper CER (semillas 2 / 3) | 13,6 / 14,5 | 14,5 |

Consumo energético en RedMagic 10 Pro (Snapdragon 8 Elite), medido sin conexión: el modo "NPU only" consume 2,6 J por segundo de habla frente a 3,8 J del modo con códec en DSP, es decir, un 31 % menos de energía, a costa de una velocidad algo menor.

## Requisitos de hardware
- Almacenamiento: 1,3 GB para el paquete completo (900 MB backbone int8 + 353 MB códec fp16 + voces y cabezas LACI).
- Memoria en ejecución: el paquete se mantiene en memoria solo mientras se usa y computa contra el límite de memoria de la aplicación; no se publica una cifra exacta de RAM pico.
- CPU: ejecución viable en CPU de Android; el backbone int8 está pensado para este escenario.
- NPU/DSP: en Snapdragon 8 Elite el códec se ejecuta en el DSP (modo más rápido) y el modo "NPU only" traslada también el modelo de lenguaje a la NPU.
- GPU de escritorio: no se documentan requisitos ni soporte para A100, H100 o RTX 4090; el formato de pesos es específico de Geode y no GGUF estándar.
- Opciones de despliegue: motor de Geode (Android); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se documenta el consumo energético por segundo de audio generado.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Geode-TTS-ZONOS3 | TTS on-device (ZONOS3-Mini recuantizado) | th, tl, ur, zh | Apache-2.0 | Motor Geode en Android (CPU/NPU/DSP) | 1,3 GB; métricas CER FLEURS publicadas |
| Zyphra/ZONOS3-Mini (upstream) | TTS (modelo base) | no disponible en la información | no disponible en la información | Servidor ggml | Referencia de calidad del paquete; CER superior en filipino y urdu |
| Voces pequeñas de Geode | TTS on-device | conjunto limitado, sin cubrir bien th/tl/ur/zh | no disponible | Motor Geode | Este paquete existe precisamente para las lenguas que aquellas no cubren |
| Alternativas TTS multilingües de gran escala | TTS neuronal | amplio | variable | Servidor/GPU | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias
- Solo cubre cuatro idiomas (th, tl, ur, zh); no está pensado para otras lenguas.
- El tailandés presenta la peor calidad relativa (CER 13,6-14,5), muy por encima del resto de idiomas; conviene evaluarlo en el dominio concreto antes de producción.
- La cuantización int8 del decodificador del códec degrada la señal a 30 dB de SNR, motivo por el que se mantiene en fp16; cualquier intento de comprimir más el códec reducirá la calidad.
- El formato de pesos es propietario de Geode; no es directamente portable a llama.cpp, vLLM u otros motores sin conversión.
- El rendimiento depende del SoC: las ventajas de NPU/DSP se documentan en Snapdragon 8 Elite; en otros dispositivos el comportamiento puede diferir.
- No se documentan sesgos específicos, tasas de alucinación ni evaluación de robustez ante texto ruidoso o fuera de dominio.
- Licencia Apache-2.0 permite uso comercial, pero exige conservar el aviso de copyright de Zyphra y el `NOTICE` con los componentes de terceros (código upstream MIT, `zyphra-textnorm` Apache-2.0).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción ni validación independiente.

## Enlaces
- Hugging Face: https://huggingface.co/Maximilian228/Geode-TTS-ZONOS3
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Geode: https://geode.tifu.xyz
- Geode en Google Play: https://play.google.com/store/apps/details?id=xyz.tifu.geode
- Normalización de texto: https://github.com/Zyphra/zyphra-textnorm
