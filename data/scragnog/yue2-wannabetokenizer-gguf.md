# scragnog/YuE2-WannabeTokenizer-GGUF

## Resumen

YuE2-WannabeTokenizer-GGUF es la conversión al formato GGUF del modelo WannabeTokenizer, un tokenizador de audio desarrollado por ManyOtherFunctions que transforma audio musical real en códigos semánticos compatibles con YuE2 (25 códigos por segundo, con un vocabulario de 32.768 entradas). Este repositorio, mantenido por scragnog, empaqueta la cadena completa —encoder MERT2 afinado y cabeza de cuantización vectorial coseno— en ficheros GGUF listos para consumir desde la aplicación local de generación musical HOT-Step.

El modelo resuelve un problema concreto en el flujo de entrenamiento de YuE2: para entrenar el modelo de lenguaje de YuE2 con música propia hace falta convertir primero el audio en los códigos semánticos que dicho modelo aprende a producir. WannabeTokenizer cumple esa función como alternativa al tokenizador v9, y sus códigos se renderizan con el decodificador base de YuE2 en lugar de requerir el adaptador decodificador compañero del v9.

La relevancia de esta ficha es acotada: no se trata de un modelo generativo de propósito general, sino de una pieza de infraestructura para pipelines de entrenamiento y clonación musical. Con 424.492.032 parámetros y un repositorio de 2,6 GB, está pensado para ejecutarse localmente junto a HOT-Step, no como servicio de inferencia de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MERT2 afinado (frontend mel, subsampler ConvNext, 14 bloques Conformer causales) + cabeza VQ coseno (adaptador SwiGLU, proyección de 256 dimensiones, codebook de 32.768 entradas) |
| Parametros totales | 424.492.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa audio a 25 códigos por segundo) |
| Tipos de cuantizacion | f16 para pesos matriciales 2-D; f32 para el resto, incluido el codebook |
| Idiomas soportados | no disponible (procesa audio, no texto) |
| Licencia | unspecified-upstream (el repositorio original no declara licencia); el encoder deriva de MERT-v2-FullSong, con licencia CC BY-NC 4.0 |
| Formato de pesos | GGUF (tres ficheros f16 de 871 MB: v1, v2 y v3) |

## Arquitectura y entrenamiento

La cadena completa se compone de dos etapas. La primera es un encoder MERT2 afinado que incluye un frontend mel, un subsampler basado en ConvNext y 14 bloques Conformer causales. La segunda es una cabeza de cuantización vectorial coseno formada por un adaptador SwiGLU, una proyección a 256 dimensiones y un codebook de 32.768 entradas. El resultado son 25 códigos semánticos por segundo de audio, que es el formato que consume el modelo de lenguaje de YuE2.

La conversión a GGUF no reentrena ni poda nada: los pesos matriciales 2-D se almacenan en f16, mientras que el resto de tensores (incluido el codebook) permanecen en f32. El codebook se guarda normalizado y dividido por la temperatura de la cabeza, de modo que un producto matricial simple reproduce los logits originales. La versión v3 incorpora además la banda de sonoridad declarada en su checkpoint de origen (`head.level_band`, de -19 a -13 dBFS): antes de codificar, HOT-Step desplaza una canción cuyo nivel RMS con compuerta quede fuera de esa banda al borde más cercano, aplicando una única ganancia para toda la canción y un limitador de picos cuando la ganancia es positiva. V1 y V2 leen la canción a su nivel propio.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Conversión de audio musical real en códigos semánticos YuE2 a 25 códigos por segundo, con un vocabulario de 32.768 entradas.
- Codificación de canciones completas para el entrenamiento de YuE2 sobre música propia.
- Alternativa al tokenizador v9: sus códigos se renderizan con el decodificador base de YuE2, sin necesidad del adaptador decodificador compañero del v9.
- Integración en HOT-Step tanto en Training Studio (tarjeta YuE2 «Codes») como en Cover Studio (opción «Follow source»).
- Gestión automática de la banda de sonoridad en la versión v3 (normalización a -19/-13 dBFS con limitador de picos).
- No soporta generación de texto, tool calling, agentes, visión ni capacidades multilingües: es exclusivamente un tokenizador de audio.

## Casos de uso

- Entrenamiento de YuE2 con música propia: el modelo convierte el catálogo de audio del usuario en los códigos semánticos que el modelo de lenguaje de YuE2 aprende a producir, paso imprescindible para el ajuste.
- Creación de adaptadores de estilo: los adaptadores entrenados sobre los códigos de WannabeTokenizer se entrenan y renderizan automáticamente sin el adaptador decodificador compañero del v9, simplificando el pipeline.
- Clonación y cover musical en HOT-Step: en Cover Studio se selecciona este tokenizador en «Follow source» para extraer los códigos de la canción de referencia.
- Sustitución del tokenizador v9 en flujos existentes: permite mantener el decodificador base de YuE2 y eliminar una dependencia del adaptador compañero.
- Preprocesado por lotes de bibliotecas musicales: la codificación local a 25 códigos por segundo permite preparar grandes volúmenes de audio sin depender de servicios externos.
- Investigación sobre representaciones semánticas de audio: el codebook de 32.768 entradas y la cuantización coseno ofrecen un espacio discreto reutilizable para experimentos de análisis musical.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Coincidencia de códigos frente al modelo PyTorch original (fp32) en 16 extractos reales de 60 s | 94,4 % de fotogramas |
| Cambio de códigos al sustituir solo el remuestreador de 48 a 24 kHz dentro del modelo original | 4,8 % de sus propios códigos |
| Concordancia entre ejecuciones fp32 y bf16 del modelo original | 92,7 % |

La mayor parte de la discrepancia frente al original proviene del remuestreo. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: cada fichero GGUF ocupa 871 MB en disco; al tratarse de un encoder de 424 millones de parámetros con pesos mayoritariamente f16 y codebook en f32, la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer con al menos 2-3 GB de VRAM libre; no se dispone de datos específicos sobre modelos recomendados por el autor.
- Cabe en GPU consumer: sí, por el tamaño de los pesos (871 MB por fichero).
- Opciones de despliegue: la vía prevista es HOT-Step (aplicación local de generación musical); el formato GGUF abre la puerta a otros runners compatibles, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YuE2-WannabeTokenizer-GGUF (este) | 424.492.032 | no aplica (audio) | Tokenizador de audio a códigos YuE2 | unspecified-upstream; encoder CC BY-NC 4.0 | GGUF en Hugging Face |
| Tokenizador v9 (Mothersuperior's head) | no disponible | no aplica (audio) | Tokenizador alternativo para YuE2; requiere adaptador decodificador compañero | no disponible | no disponible |
| MERT-v2-FullSong | no disponible | no disponible | Encoder musical del que deriva el encoder de este modelo | CC BY-NC 4.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre el tokenizador v9 y WannabeTokenizer en la información proporcionada.

## Limitaciones y advertencias

- La licencia del repositorio original no está declarada; este repositorio se comparte con atribución a ManyOtherFunctions y todos los derechos sobre WannabeTokenizer permanecen en su autor.
- El encoder deriva de MERT-v2-FullSong, con licencia CC BY-NC 4.0, por lo que se aplican sus términos, incluida la restricción de uso comercial.
- La coincidencia con el modelo original es del 94,4 % de fotogramas, no del 100 %; parte de la divergencia es inherente al remuestreo.
- V1 y V2 no aplican normalización de sonoridad; solo V3 gestiona la banda de -19 a -13 dBFS, lo que puede producir códigos distintos según la versión elegida.
- Es un tokenizador de audio: no genera texto, no razona, no soporta tool calling ni agentes, y no debe evaluarse como modelo de lenguaje.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento en idiomas, al no tratarse de un modelo lingüístico.
- El uso previsto está ligado a HOT-Step; fuera de esa aplicación no se documenta compatibilidad ni soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/scragnog/YuE2-WannabeTokenizer-GGUF
- Modelo original: https://huggingface.co/ManyOtherFunctions/Yue2-WannabeTokenizer
- Aplicación HOT-Step: https://github.com/scragnog/HOT-Step-CPP
- Encoder base MERT-v2-FullSong: https://huggingface.co/m-a-p/MERT-v2-FullSong
