# RootAccess4Life/wavepainter

## Resumen

Wavepainter es un editor de voz de span enmascarado (masked-span speech editor) que permite sustituir, insertar o eliminar segmentos de habla en una grabación manteniendo la voz del hablante original. El modelo combina un codificador HuBERT con un denoiser de difusión, y se publica bajo licencia MIT. El desarrollo se atribuye al repositorio GitHub de pujariaditya, mientras que los pesos se distribuyen en HuggingFace bajo la cuenta RootAccess4Life.

El modelo se entrena en dos fases: una primera fase base y una segunda fase con interpolación de coeficientes sobre el denoiser. Se publican dos variantes del checkpoint de fase 2 (a=0.85 y a=0.70) porque el coeficiente óptimo depende del tipo de edición. En el benchmark Ming-Freeform-Audio-Edit (split completo en inglés), wavepainter supera a la referencia de Ren et al. en cinco de seis métricas de WER y similitud de hablante, aunque no mejora la eliminación de palabras. El repositorio pesa 6.7 GB, lo que sugiere que los pesos pueden caber en GPUs de consumo medio, aunque no se ofrecen especificaciones oficiales de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (difusion con codificador HuBERT, segun nombres de checkpoint) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (benchmark en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion publicada. Por los nombres de los checkpoints (`phase2-hubert-a085`, `phase2-hubert-a070`) se infiere que emplea un codificador HuBERT como representacion intermedia y un denoiser de difusion para la generacion de audio. La model card menciona que el coeficiente de interpolacion mueve unicamente el denoiser de difusion, lo que indica que el modelo base (fase 1) se entrena primero y luego se ajusta en una segunda fase con interpolacion de pesos.

El entrenamiento se divide en dos fases: `phase1-base` (el editor base) y `phase2` (un hijo interpolado hacia la base con coeficiente 0.85 o 0.70). No se proporcionan datos sobre el corpus de entrenamiento, numero de tokens, ni si se uso RLHF, DPO o GRPO. La comparacion con Ren et al. (arXiv:2602.00560) se realiza sobre el benchmark Ming-Freeform-Audio-Edit, pero no se indica si wavepainter emplea la misma metodologia de entrenamiento (la fila "GRPO" de la tabla corresponde a Ren et al., no necesariamente a wavepainter).

## Capacidades

- Edicion de voz por span enmascarado: permite sustituir, insertar o eliminar segmentos de habla en una grabacion existente.
- Sintesis de voz (text-to-speech) segun el pipeline declarado en HuggingFace.
- Alta similitud de hablante: alcanza SIM de 0.943 en sustitucion, 0.961 en insercion y 0.918 en eliminacion (con a=0.85), superando a la referencia en los tres casos.
- Mantiene la calidad de señal en las partes no editadas: PESQ de 4.089/4.083/4.076 para sustitucion/insercion/eliminacion, frente a 4.351 en copy-synthesis sin edicion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multimodal mas alla del audio.

## Casos de uso

- Edicion de podcasts: corregir errores de pronunciacion o reemplazar frases completas sin necesidad de regrabar al locutor, gracias a la alta similitud de voz (SIM > 0.9).
- Doblaje y localizacion: insertar lineas adicionales en una grabacion existente manteniendo la voz del actor original, util para adaptar guiones a diferentes duraciones.
- Restauracion de audio historico: eliminar palabras no deseadas o ruidos vocales de grabaciones antiguas conservando la identidad del hablante.
- Produccion de audiobooks: corregir lecturas erroneas o re-grabar frases aisladas sin afectar al resto del capitulo, reduciendo costes de estudio.
- Creacion de contenido educativo: modificar lecciones grabadas para actualizar informacion o eliminar secciones obsoletas sin perder la coherencia vocal.
- Asistentes de voz personalizados: generar respuestas con la voz del usuario a partir de pequenas muestras, aprovechando la capacidad de sintesis y edicion del modelo.

## Benchmarks y rendimiento

Resultados sobre el split completo en ingles de Ming-Freeform-Audio-Edit, comparados con Ren et al. (arXiv:2602.00560, fila con GRPO):

| Edit type | Metrica | Ren et al. | wavepainter (a=0.85) | wavepainter (a=0.70) |
|---|---|---|---|---|
| substitution | WER | 4.41 | **3.063** | 3.381 |
| insertion | WER | 4.97 | 4.128 | **3.817** |
| deletion | WER | **6.88** | 9.136 | 9.525 |
| substitution | SIM | 0.78 | **0.943** | **0.943** |
| insertion | SIM | 0.82 | **0.961** | 0.960 |
| deletion | SIM | 0.78 | **0.918** | **0.918** |

Se mejora en cinco de seis metricas. La calidad de señal se reporta full-reference con PESQ: 4.089 / 4.083 / 4.076 para sustitucion / insercion / eliminacion, frente a 4.351 para copy-synthesis sin edicion. No se publican resultados en otros benchmarks generales como MMLU o HumanEval, al ser un modelo especifico de audio.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendada.
- El repositorio pesa 6.7 GB, por lo que los pesos completos en precision FP32 ocuparian aproximadamente esa cantidad; con cuantizacion a 8 bits podrian caber en GPUs con 8 GB de VRAM, pero no hay confirmacion.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, etc.). El modelo se distribuye como checkpoints de PyTorch, por lo que probablemente requiera un entorno Python con las dependencias del repositorio GitHub.
- No se ofrecen datos de latencia ni throughput.

## Comparativa con modelos similares

La unica comparacion disponible es contra Ren et al. (arXiv:2602.00560), que sirve como referencia en el benchmark Ming-Freeform-Audio-Edit. No se proporcionan datos de otros editores de voz como Voicebox, Tortoise o Bark en la informacion disponible, por lo que no es posible realizar una comparativa mas amplia.

| Modelo | WER sub | WER ins | WER del | SIM sub | SIM ins | SIM del | Licencia |
|---|---|---|---|---|---|---|---|
| Ren et al. | 4.41 | 4.97 | 6.88 | 0.78 | 0.82 | 0.78 | no disponible |
| wavepainter (a=0.85) | 3.063 | 4.128 | 9.136 | 0.943 | 0.961 | 0.918 | MIT |
| wavepainter (a=0.70) | 3.381 | 3.817 | 9.525 | 0.943 | 0.960 | 0.918 | MIT |

## Limitaciones y advertencias

- No supera a la referencia en eliminacion (deletion WER: 9.136 vs 6.88 con a=0.85); la model card indica que la mayor parte de esa diferencia se localiza en un splice de forma de onda con ground-truth.
- La calidad de señal se mide full-reference; un estimador MOS sin referencia puntua peor las grabaciones originales sin editar que la salida sintetizada, lo que puede indicar que el modelo introduce artefactos sutiles no capturados por PESQ.
- No se documentan sesgos etnicos, de genero o de acento, ni limitaciones de idioma mas alla del benchmark en ingles.
- No se especifican restricciones de uso comercial, pero la licencia MIT permite uso comercial y modificacion.
- No se proporcionan garantias de rendimiento en produccion ni guias de despliegue; el modelo requiere el codigo del repositorio GitHub para funcionar.

## Enlaces

- HuggingFace: https://huggingface.co/RootAccess4Life/wavepainter
- Repositorio GitHub: https://github.com/pujariaditya/wavepainter
- Paper de referencia (Ren et al.): https://arxiv.org/abs/2602.00560
