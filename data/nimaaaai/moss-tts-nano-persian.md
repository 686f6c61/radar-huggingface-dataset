# nimaaaAI/MOSS-TTS-Nano-Persian

## Resumen

MOSS-TTS-Nano-Persian es un ajuste fino (fine-tune) del modelo MOSS-TTS-Nano, desarrollado por nimaaaAI, que corrige la pronunciación del persa (farsi) en el sistema de síntesis de voz de código abierto de la familia OpenMOSS. El modelo base es un TTS compacto de 117,3 millones de parámetros que combina un modelo de lenguaje autoregresivo con un codec neuronal de audio, MOSS-Audio-Tokenizer-Nano, que convierte el habla en tokens discretos que el modelo predice de forma secuencial. El problema que resuelve este ajuste es el acento extranjero que el modelo base mostraba al leer texto en persa, consecuencia del desequilibrio de sus datos de entrenamiento.

Entrenado sobre 34.000 clips del dataset Mozilla Common Voice en persa (v13, licencia CC0), este checkpoint produce un persa notablemente más nativo que el modelo original, manteniendo el mismo tamaño, arquitectura y comportamiento en entradas largas. Con un peso de 570 MB en fp32, puede ejecutarse en CPU o en GPU de gama baja sin necesidad de hardware especializado, lo que lo convierte en una opción práctica para integraciones ligeras de síntesis de voz en persa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo autoregresivo + codec de audio (MOSS-Audio-Tokenizer-Nano) |
| Parametros totales | 117,3 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo TTS; generacion maxima por defecto de 375 tokens, ~30 segundos) |
| Tipos de cuantizacion | fp32 (no se documentan otras) |
| Idiomas soportados | Persa (farsi) en este fine-tune; el modelo base soporta 20 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,6 GB; cargado con `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base MOSS-TTS-Nano: un pequeño modelo de lenguaje autoregresivo emparejado con un codec neuronal de audio, MOSS-Audio-Tokenizer-Nano, que transforma el habla en tokens discretos. Aproximadamente 12,5 tokens corresponden a un segundo de audio, y el modelo genera estos tokens de forma autoregresiva para producir voz. La salida es de 48 kHz en estéreo. El ajuste fino no altera la arquitectura ni el tamaño; solo los pesos.

El entrenamiento se realizó con 34.000 clips de Mozilla Common Voice persa v13, filtrados por votos positivos y longitud de frase, resultando en 27.880 ejemplos: 23.800 de una sola frase y 4.080 de grupos de varias frases. Se emplearon 3 épocas, una tasa de aprendizaje de 1e-5 con warmup del 3%, un tamaño de lote efectivo de 16 (lote 1, gradiente acumulado 8, 2 GPU T4 de Kaggle) y precisión fp32. Un 30% de los ejemplos se construyeron concatenando 2 o 3 clips del mismo hablante para que el modelo aprendiera a generar discursos más largos; esta restricción de hablante fue clave, ya que una ronda anterior que mezclaba hablantes distintos provocaba cambios de voz a mitad de frase.

## Capacidades

- Síntesis de voz en persa con acento nativo, corregido respecto al modelo base.
- Clonación de voz zero-shot: a partir de 3-15 segundos de audio de referencia, replica el timbre del hablante.
- Generación de audio a 48 kHz en estéreo.
- El modelo base soporta 20 idiomas; este ajuste mejora el persa pero conserva el resto de idiomas del original.
- Ejecución en CPU y GPU sin necesidad de hardware de alto rendimiento.
- Reproducibilidad con semilla fija (`--seed`).
- Soporte de decodificación greedy (`--do-sample 0`) y control de longitud de salida con `--max-new-frames`.

## Casos de uso

- Atención al cliente automatizada en persa: el modelo puede generar respuestas de voz para sistemas IVR o asistentes virtuales, clonando una voz corporativa a partir de una muestra de referencia y manteniendo conversaciones de varios turnos.
- Creación de audiolibros: se puede narrar texto largo en persa con una voz única y coherente, gracias a la concatenación de frases del mismo hablante entrenada durante el ajuste.
- Accesibilidad para hablantes de persa: síntesis de voz para lectores de pantalla o aplicaciones de apoyo a la lectura, con la ventaja de poder usar la voz del propio usuario.
- Doblaje automático: clonar la voz de un actor o locutor y generar el texto persa con esa voz, manteniendo la identidad vocal en todo el material.
- Generación de contenido para redes sociales: crear vídeos narrados en persa sin necesidad de grabar la voz, a partir de guiones de texto.
- Asistentes de voz en dispositivos ligeros: el modelo ocupa 570 MB en fp32 y puede ejecutarse en CPU, lo que permite integraciones en prototipos, web serving o productos embebidos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye muestras de audio comparativas entre el modelo base y el fine tune, pero no métricas cuantitativas como MOS (Mean Opinion Score) ni comparativas con otros sistemas TTS. En cuanto a rendimiento de inferencia, el tiempo extremo a extremo para una frase corta fue de 24,3 s en CPU y 21,4 s en una GPU T4, casi todo dedicado a la carga del modelo; en un proceso persistente, la generación por petición se reduce a unos pocos segundos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 570 MB en fp32 para el modelo en memoria.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; se validó con una T4 de Kaggle.
- CPU: funciona en CPU sin GPU, con una latencia de 24,3 s para una frase corta incluyendo la carga del modelo; en procesos persistentes la generación por petición baja a unos segundos.
- Despliegue: script de inferencia del repositorio MOSS-TTS-Nano, con Python y `transformers`; compatible con `--device cpu` o `--device cuda`.
- No requiere GPU de alta gama; es adecuado para entornos de desarrollo y producción ligera.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en persa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-TTS-Nano (base) | 117,3 M | ~30 s de audio | Acento extranjero (inglés/chino) | Apache 2.0 | Hugging Face |
| MOSS-TTS-Nano-Persian (este) | 117,3 M | ~30 s de audio | Acento persa nativo | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento cuantitativos para otros modelos TTS en persa en la información disponible. La diferencia principal entre el base y este ajuste se percibe en las muestras de audio publicadas, donde ambos modelos reciben la misma voz de referencia, el mismo texto y la misma semilla, y solo difieren los pesos.

## Limitaciones y advertencias

- El ajuste solo mejora el persa; el comportamiento en otros idiomas del modelo base no se modifica.
- La calidad del audio de referencia es crítica para la clonación de voz: grabaciones ruidosas o demasiado cortas degradan notablemente el resultado.
- La longitud máxima de generación está limitada por defecto a 375 tokens (~30 segundos), aunque se puede aumentar con `--max-new-frames`.
- No se han documentado sesgos específicos, pero el entrenamiento sobre Common Voice puede reflejar los acentos y voces de los voluntarios del dataset.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos de los datos de entrenamiento (Common Voice v13, CC0) para uso en producción.
- La latencia en CPU es alta para textos largos si el modelo se carga en cada petición; se recomienda un proceso persistente para reducir el tiempo de generación por solicitud.

## Enlaces

- [Hugging Face - nimaaaAI/MOSS-TTS-Nano-Persian](https://huggingface.co/nimaaaAI/MOSS-TTS-Nano-Persian)
- [GitHub - NimaaaAI/MOSS-TTS-Nano-Fine-Tuning](https://github.com/NimaaaAI/MOSS-TTS-Nano-Fine-Tuning)
- [GitHub - OpenMOSS/MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano)
- [Demo de MOSS-TTS-Nano en openmoss.ai](https://openmoss.ai/MOSS-TTS-Nano-Demo/)
- [Hugging Face Space - MOSS-TTS-Nano](https://huggingface.co/spaces/victor/MOSS-TTS-Nano)
