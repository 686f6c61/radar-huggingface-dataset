# empiriolabsai/kokoro-german

## Resumen

Kokoro German es un modelo de síntesis de voz (text-to-speech) en alemán desarrollado por EmpirioLabs, obtenido mediante fine-tuning del modelo base hexgrad/Kokoro-82M. Se distribuye con dos voces predefinidas, `lena` (femenina) y `jonas` (masculina), y mantiene el tamaño y la velocidad del Kokoro original: 82 millones de parámetros. Es relevante porque ofrece una alternativa ligera, con licencia Apache 2.0 y apta para uso comercial, en un ecosistema de TTS alemán dominado por voces Piper de menor calidad subjetiva.

El modelo se presenta como un ajuste fino orientado a mejorar la naturalidad (medida con UTMOS) y la inteligibilidad (medida con WER) respecto a las voces Piper evaluadas, y con un rendimiento en WER comparable a Thorsten-Voice/Kokoro. Incluye pesos ONNX en precisión completa, media precisión e int8, lo que facilita su despliegue tanto en ONNX Runtime como en transformers.js.

La ficha se basa exclusivamente en la model card y los metadatos disponibles. No se han publicado detalles sobre la composición del dataset de entrenamiento, el proceso de fine-tuning ni la arquitectura interna más allá de su herencia de Kokoro-82M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (arquitectura del modelo base; detalles internos no disponibles) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX en precisión completa, media precisión (half) e int8 |
| Idiomas soportados | Alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (precisión completa, half e int8); pesos PyTorch para el paquete `kokoro` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Kokoro-82M, un modelo TTS compacto de 82 millones de parámetros. La model card no detalla la arquitectura interna (tipo de decoder, vocoder, mecanismo de atención ni representación fonética), por lo que no se puede especificar más allá de que se carga con el paquete estándar `kokoro` y que requiere un módulo de conversión texto-a-fonema incluido en el repositorio que invoca a `espeak-ng`.

Se trata de un fine-tuning del modelo base hexgrad/Kokoro-82M (`base_model_relation: finetune`). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá de las del modelo base. La model card menciona que el modelo procesa correctamente números, fechas, horas y precios según la convención oral del alemán, lo que sugiere un trabajo específico de normalización textual o de datos de entrenamiento orientado a estos formatos.

## Capacidades

- Síntesis de voz en alemán con dos voces: `lena` (femenina) y `jonas` (masculina).
- Lectura correcta de números, fechas, horas y precios con la pronunciación habitual en alemán.
- Salida de audio de alta inteligibilidad: WER de 3,32 % a 4,03 % según la voz, medido con Whisper large-v3 sobre 200 frases no vistas.
- Naturalidad estimada con UTMOS de 4,16 sobre 5 en ambas voces.
- Identificación de idioma alemán con probabilidad media de 0,99 o superior según Whisper large-v3.
- Inferencia en PyTorch (paquete `kokoro`) y en ONNX Runtime.
- Compatibilidad con transformers.js para ejecución en JavaScript/Node.js.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada.

## Casos de uso

- **Locución para asistentes de voz en alemán**: el modelo puede generar respuestas habladas en tiempo real gracias a su velocidad (3,3x a 4,6x tiempo real según backend) y a su tamaño reducido, adecuado para integrarse en asistentes domésticos o aplicaciones móviles.
- **Lectura de noticias y artículos**: la capacidad de pronunciar correctamente números, fechas, horas y precios lo hace adecuado para convertir boletines informativos o artículos en audio sin postprocesado manual de cifras.
- **Sistemas de anuncios públicos**: para estaciones de transporte, aeropuertos o comercios que necesitan anunciar horarios, andenes y precios en alemán con inteligibilidad alta (WER inferior al 4,1 %).
- **Audiolibros y contenido editorial**: con dos voces disponibles se pueden narrar textos largos con una naturalidad estimada de 4,16 UTMOS, suficiente para producción de contenido de consumo.
- **Accesibilidad web**: integración mediante transformers.js u ONNX Runtime en el navegador para leer contenido de páginas en alemán a usuarios con discapacidad visual, sin depender de servicios en la nube.
- **Atención al cliente automatizada por voz**: generación de respuestas habladas en sistemas IVR en alemán, con despliegue en CPU (el archivo int8 ocupa 115 MB) que reduce costes de infraestructura frente a modelos TTS de mayor tamaño.
- **Prototipado rápido de interfaces de voz**: al cargarse con el paquete estándar `kokoro` y ofrecer pesos ONNX, permite validar productos de voz en alemán con un coste computacional bajo en equipos de desarrollo.

## Benchmarks y rendimiento

Resultados medidos por EmpirioLabs el 2026-11-21 sobre 200 frases alemanas no vistas. Todas las voces leyeron las mismas frases; Whisper large-v3 transcribió cada clip y se comparó con el texto original. WER: menor es mejor. UTMOS: escala de 1 a 5, mayor es mejor.

| Sistema | WER | UTMOS |
|---|---:|---:|
| Kokoro German `lena` | 4,03 % | 4,16 |
| Kokoro German `jonas` | 3,32 % | 4,16 |
| Thorsten-Voice/Kokoro | 3,78 % | 3,57 |
| Piper `de_DE-pavoque-low` | 5,04 % | 3,66 |
| Piper `de_DE-thorsten-medium` | 5,04 % | 3,38 |
| Piper `de_DE-kerstin-low` | 5,99 % | 3,53 |
| Piper `de_DE-thorsten-high` | 6,29 % | 3,24 |
| Piper `de_DE-kerstin-medium` | 6,34 % | 3,61 |
| Piper `de_DE-thorsten-low` | 6,65 % | 3,31 |
| Piper `de_DE-eva_k-x_low` | 7,05 % | 3,29 |
| Piper `de_DE-karlsson-low` | 7,65 % | 3,56 |
| Piper `de_DE-mls-medium` | 15,96 % | 2,68 |
| Piper `de_DE-ramona-low` | 18,58 % | 2,56 |

Identificación de idioma (probabilidad media de alemán según Whisper large-v3): `lena` 1,00; `jonas` 0,99; resto de voces entre 0,98 y 1,00.

Rendimiento con pesos int8 sobre las mismas frases: `lena` 4,18 % WER y UTMOS 3,46; `jonas` 3,37 % WER y UTMOS 3,74.

Velocidad medida sobre 60 frases en 4 hilos de un AMD EPYC 7513 de 32 núcleos (segundos de audio por segundo de cómputo): PyTorch 3,3x tiempo real, ONNX precisión completa 3,8x, ONNX int8 4,6x.

## Requisitos de hardware

- **VRAM/RAM estimada**: el archivo ONNX int8 ocupa 115 MB; los pesos en precisión completa y half son mayores (el repositorio completo pesa 0,9 GB). La inferencia en CPU es viable.
- **GPU recomendadas**: no se especifican en la model card. Dado el tamaño de 82 millones de parámetros, cualquier GPU consumer moderna puede ejecutarlo; no se requiere A100 ni H100.
- **GPU consumer**: cabe holgadamente en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.), aunque el modelo está optimizado para funcionar también en CPU.
- **Opciones de despliegue**: paquete Python `kokoro` (PyTorch), ONNX Runtime (precisión completa, half e int8) y transformers.js.
- **Dependencias**: requiere `espeak-ng` instalado en el sistema para el módulo texto-a-fonema.
- **Latencia y throughput**: 3,3x tiempo real en PyTorch, 3,8x en ONNX precisión completa y 4,6x en ONNX int8, medido en 4 hilos de un AMD EPYC 7513. El rendimiento depende del procesador y del número de hilos; en la misma máquina coincide con Kokoro-82M.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER | UTMOS | Licencia | Formatos |
|---|---|---|---|---|---|---|
| Kokoro German (`jonas`) | 82 M | Alemán | 3,32 % | 4,16 | Apache 2.0 | ONNX, PyTorch |
| Thorsten-Voice/Kokoro | 82 M (Kokoro-82M) | Alemán | 3,78 % | 3,57 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Piper `de_DE-thorsten-high` | no disponible | Alemán | 6,29 % | 3,24 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Piper `de_DE-pavoque-low` | no disponible | Alemán | 5,04 % | 3,66 | no disponible en la información proporcionada | no disponible en la información proporcionada |

Kokoro German mejora a Thorsten-Voice/Kokoro en naturalidad (4,16 frente a 3,57 UTMOS) con un WER comparable, y supera a todas las voces Piper evaluadas tanto en WER como en UTMOS, salvo en WER frente a Thorsten-Voice/Kokoro, donde `lena` queda ligeramente por detrás (4,03 % frente a 3,78 %) y `jonas` por delante (3,32 %).

## Limitaciones y advertencias

- Solo soporta alemán; no se documentan otros idiomas.
- Solo incluye dos voces (`lena` y `jonas`); no se documenta clonación de voz ni voces adicionales.
- Los benchmarks de WER y UTMOS los ha realizado el propio autor del modelo, no un tercero independiente.
- UTMOS es una estimación automática de naturalidad, no una evaluación con oyentes humanos.
- La cuantización int8 degrada la naturalidad de forma apreciable en la voz `lena` (UTMOS 3,46 frente a 4,16 en precisión completa) y algo menos en `jonas` (3,74 frente a 4,16); conviene evaluar el impacto acústico antes de desplegar int8 en producción.
- No se documentan sesgos conocidos, riesgo de alucinación (no aplica del mismo modo a un modelo TTS) ni limitaciones de longitud de texto de entrada.
- No se especifican restricciones adicionales de licencia más allá de Apache 2.0, que permite uso comercial.
- Requiere `espeak-ng` como dependencia externa del sistema, lo que puede complicar despliegues en entornos contenedorizados mínimos.
- No se documenta el dataset de entrenamiento, por lo que no se puede evaluar la cobertura de acentos regionales, registros formales o dominios especializados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/empiriolabsai/kokoro-german)
- [Modelo base hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [Thorsten-Voice/Kokoro](https://huggingface.co/Thorsten-Voice/Kokoro)
- [Sitio web de EmpirioLabs](https://empiriolabs.ai)
- [Modelos de EmpirioLabs en Hugging Face](https://huggingface.co/empiriolabsai)
- [Plataforma de EmpirioLabs](https://platform.empiriolabs.ai)
- [Discord de EmpirioLabs](https://discord.gg/bM52azW4ZD)
- [Repositorio de espeak-ng](https://github.com/espeak-ng/espeak-ng/releases)
