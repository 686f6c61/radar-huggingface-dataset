# agentproto/blended-lyric-tenor

## Resumen

blended-lyric-tenor es un modelo de conversion de voz cantada para RVC v2 (Retrieval-based Voice Conversion), desarrollado por el usuario agentproto y publicado en Hugging Face. No es un modelo de lenguaje ni un sistema de generacion de audio desde cero: es un checkpoint de timbre vocal que transforma una grabacion de entrada (fuente) en una voz de tenor lirico sintetica, preservando melodia, ritmo y letra del audio original. El timbre se ha aprendido de forma agregada a partir de grabaciones de 12 tenores liricos, de modo que no reproduce la voz de ningun cantante concreto.

Tecnicamente emplea la arquitectura RVC v2 a 40 kHz con vocoder HiFi-GAN, codificador de contenido ContentVec y extractor de tono RMVPE. El repositorio ocupa 0,6 GB e incluye dos artefactos: los pesos (`blended-lyric-tenor.pth`) y el indice de recuperacion (`blended-lyric-tenor.index`). El entrenamiento se realizo durante 40 epocas (5.560 pasos, batch de 8) en una unica GPU NVIDIA L40S en OVHcloud, mediante la herramienta Applio.

Su relevancia es acotada pero clara para un nicho concreto: produccion musical asistida, prototipado de demos vocales y experimentacion con conversion de voz cantada sin depender de la identidad de un interprete real. La model card incluye una evaluacion objetiva sobre un extracto de *Nessun dorma*, con metricas de precision de tono y correlacion de contorno, lo que permite valorar su comportamiento sin inventar cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), 40 kHz, vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint `.pth` en precision de entrenamiento) |
| Idiomas soportados | no disponible (la conversion preserva la letra del audio fuente) |
| Licencia | OpenRAIL |
| Formato de pesos | `.pth` (pesos) + `.index` (indice de recuperacion) |
| Codificador de contenido | ContentVec |
| Extractor de tono (F0) | RMVPE |
| Frecuencia de muestreo | 40 kHz |
| Tamano del repositorio | 0,6 GB |
| Entrenamiento | 40 epocas, 5.560 pasos, batch 8, 1x NVIDIA L40S (OVHcloud), via Applio |

## Arquitectura y entrenamiento

RVC v2 es un sistema de conversion de voz en dos etapas: un codificador de contenido (ContentVec) extrae representaciones linguisticas independientes del hablante, un extractor de tono (RMVPE) obtiene el contorno F0, y el decodificador con vocoder HiFi-GAN sintetiza la onda a 40 kHz con el timbre del locutor objetivo. El indice `.index` actua como memoria de recuperacion: durante la inferencia se buscan caracteristicas acusticas similares en el conjunto de entrenamiento para reducir artefactos y mejorar la fidelidad del timbre. El parametro `index rate` controla el peso de esa recuperacion.

Los datos de entrenamiento son grabaciones de 12 tenores liricos, modernos y clasicos, agrupadas en un unico "locutor" sintetico. No se nombra a ningun cantante ni se dirige el modelo a imitar a una persona concreta, lo que mitiga el riesgo de suplantacion de identidad. El entrenamiento consistio en 40 epocas (5.560 pasos) con batch de 8 sobre una sola NVIDIA L40S, usando Applio como framework. No se documenta el volumen total de audio ni la composicion exacta del dataset, ni si hubo etapas de refinamiento posteriores.

## Capacidades

- Conversion de voz cantada de una fuente a un timbre de tenor lirico sintetico, preservando melodia, ritmo y contenido linguistico del audio de entrada.
- Conservacion del vibrato: la evaluacion del autor detecta vibrato a 5,9 Hz en la salida frente a 6,7 Hz en la fuente.
- Transposicion de registro mediante el parametro de tono (recomendado +2 semitonos para elevar una fuente grave a registro de tenor).
- Control de fidelidad al timbre de referencia mediante `index rate` (0,3 recomendado) y `protect` (0,5 recomendado).
- Extraccion de tono robusta mediante RMVPE, adecuada para material cantado con vibrato.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto o vision: es exclusivamente un modelo de audio.
- No se documentan capacidades multilingues especificas; la inteligibilidad depende del audio fuente.

## Casos de uso

- Produccion de demos vocales: un compositor graba una linea melodica con su propia voz y aplica el modelo con tono +2 para obtener una referencia de tenor lirico antes de contratar a un interprete. El checkpoint es ligero (0,6 GB) y se ejecuta en herramientas RVC estandar.
- Prototipado en estudios de grabacion: generar guias vocales de tenor para maquetas de opera o lied, ajustando `index rate` y `protect` para equilibrar fidelidad de timbre y naturalidad.
- Investigacion en conversion de voz: el modelo sirve como referencia reproducible (pesos, indice, ajustes y metricas publicadas) para comparar tecnicas de RVC v2, ContentVec o RMVPE en material cantado con vibrato.
- Educacion musical: ilustrar diferencias de tesitura y timbre entre registros aplicando transposiciones controladas sobre una misma melodia de entrada.
- Creacion de contenido audiovisual: doblar o sustituir lineas cantadas en cortometrajes y podcasts musicales, con la advertencia de divulgacion de que el audio es generado por IA.
- Pruebas de pipelines de audio: validar cadenas de preprocesado (separacion de voces, eliminacion de ruido, alineamiento) antes de alimentar un modelo RVC, usando el demo incluido como caso de control.
- Evaluacion de metricas objetivas de tono: emplear el extracto de *Nessun dorma* y las cifras publicadas (85,8 % de frames dentro de ±50 cents, correlacion 0,992) como banco de pruebas para herramientas de analisis de F0.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre un extracto aislado de 5,5 s de *Nessun dorma* (12 notas, vibrato de 6,7 Hz en la fuente), con tono +2 y los ajustes recomendados, medida con pYIN (errores de octava excluidos en la correlacion):

| Metrica | Resultado |
|---|---|
| Notas dentro de ±50 cents | 11 de 12 (91,7 %) |
| Correlacion del contorno de tono con la fuente | 0,992 |
| Vibrato preservado | si, detectado a 5,9 Hz |
| Frames dentro de ±50 cents | 85,8 % |
| Relacion armonica-ruido (HNR) | 11,5 dB (fuente: 11,9 dB) |

El autor advierte explicitamente de que se trata de mediciones sobre un unico extracto y no de una prueba de escucha. No se han publicado comparaciones con otros modelos RVC ni resultados en conjuntos de evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del checkpoint (0,6 GB) y la arquitectura RVC v2, cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA L40S; para inferencia basta una GPU consumer moderna (serie RTX 30/40) o incluso CPU con latencia mayor.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM, aunque el dato exacto no esta publicado.
- Opciones de despliegue: Applio y RVC WebUI (herramientas compatibles con RVC v2); requiere cargar conjuntamente el `.pth` y el `.index`.
- Latencia y throughput: no disponibles. La evaluacion se hizo sobre un extracto de 5,5 s, sin reportar tiempos de procesamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Codificador / F0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blended-lyric-tenor | RVC v2, timbre agregado de 12 tenores | 40 kHz | ContentVec / RMVPE | OpenRAIL | Hugging Face |
| Checkpoints RVC v2 de locutor unico | RVC v2, timbre de un cantante concreto | 40 kHz (tipico) | ContentVec / RMVPE (tipico) | variable | Amplia en comunidades RVC |
| Modelos de sintesis cantada (SVS) tipo DiffSinger | Sintesis desde partitura y letra | variable | no aplica | variable | Repositorios de investigacion |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- Evaluacion limitada: las metricas proceden de un unico extracto de 5,5 s y 12 notas; no hay pruebas de escucha ni validacion en repertorio amplio.
- Riesgo de artefactos en material fuera de dominio: el modelo se entreno con voces de tenor lirico; fuentes muy graves, ruidosas o con tecnica vocal distinta pueden degradar la calidad.
- Sin datos de sesgo: no se documenta la composicion demografica de los 12 tenores ni posibles sesgos de timbre.
- Riesgo de uso indebido: aunque el timbre es agregado y no corresponde a ninguna persona, la conversion de voz puede emplearse para suplantacion; el autor prohibe imitar o hacerse pasar por personas reales y exige divulgar que el audio es generado por IA.
- Restricciones de licencia: OpenRAIL impone restricciones de uso (no solo atribucion); debe revisarse antes de uso comercial.
- Sin soporte de texto ni contexto: no es adecuado para tareas de lenguaje, razonamiento o agentes.
- Idiomas no documentados: la calidad linguistica depende enteramente del audio fuente.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentproto/blended-lyric-tenor
- Applio (framework de entrenamiento e inferencia RVC): https://github.com/IAHispano/Applio
- RVC WebUI: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- ContentVec: https://github.com/auspicious3000/contentvec
- RMVPE: https://github.com/Dream-High/RMVPE
- Licencia OpenRAIL: https://www.licenses.ai/
