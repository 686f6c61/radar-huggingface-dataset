# dignome/kitten_tts2

## Resumen

Kitten TTS 2 es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado originalmente por KittenML y empaquetado en formato GGUF por el usuario dignome para su uso con el runtime audio.cpp. Resuelve el problema de la generación de voz con clonación de hablante en diez idiomas sin necesidad de Python ni LibTorch en tiempo de inferencia, lo que facilita su despliegue en entornos C++ nativos y en CPU. El paquete incluye un decodificador S3 MeanFlow, codificadores de hablante, tokenizador y 48 entradas de voz preparadas.

La relevancia actual del modelo radica en su empaquetado autocontenido: cada archivo GGUF integra todos los componentes necesarios para síntesis y clonación, con precisiones que van desde BF16 hasta cuantizaciones ternarias (TQ2_1) y NVFP4, permitiendo ejecución en hardware muy modesto. El repositorio ocupa 30,6 GB e incluye siete variantes de cuantización con tamaños entre 1,4 GB y 4,6 GB.

Es importante señalar que el autor indica explícitamente que este paquete ya no se mantiene y remite al proyecto audio.cpp principal para versiones actualizadas. La licencia es la Stellon Labs Community License, distinta de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con decodificador S3 MeanFlow, codificadores de hablante y tokenizador integrados; cuerpo LM cuantizado en GGUF |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_0, NVFP4, TQ2_1 (con decodificadores default, student W4 y student W8) |
| Idiomas soportados | en, ar, zh, fr, de, hi, it, pt, ru, es |
| Licencia | stellon-labs-community-license |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se distribuye como exportaciones GGUF autocontenidas de los pesos de KittenML/kitten-tts-2 en la revisión `f2eee74f4467855ad58fe16f1fb7b7df473263fd`. Cada archivo integra un decodificador S3 MeanFlow, codificadores de hablante, tokenizador y las 48 entradas de voz preparadas (47 presets upstream más el alias `PreparedBruno`). La familia de modelo en audio.cpp es `kitten_tts2` y las instalaciones BF16/Q8/Q4 comparten el directorio `models/kitten-tts2-v2/` con nombres de archivo distintos por precisión.

Las variantes de cuantización presentan diferencias técnicas relevantes. Q8 y Q4 preservan exactamente los pesos ternarios del cuerpo suministrados; Q4 cuantiza el embedding directamente de BF16 completo a Q8_0 con un error relativo L2 de aproximadamente 0,44 % (medida de reconstrucción de pesos, no de calidad de audio). En CUDA, las proyecciones down de Q4 se cargan como BF16 para evitar cómputo no finito, añadiendo unos 483 MiB. NVFP4 emplea los kernels CUDA GGML NVFP4 existentes con el decodificador por defecto y un error de reconstrucción de pesos de aproximadamente 2,3954 % L2 relativo. TQ2_1 usa el ID de tipo 44 de una rama específica y kernels de CPU, con almacenamiento ternario exacto respecto al checkpoint BF16; requiere `--backend cpu`. El paquete W4 almacena 474 matrices del decodificador en W4 empaquetado y ejecuta 426 lineales como INT8 en CPU; el paquete W8 usa un decodificador student_w8 congelado de un paso, con 457 matrices cuantizadas en códigos INT8 y escalas F32 por canal. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz multilingüe en diez idiomas: inglés, árabe, chino, francés, alemán, hindi, italiano, portugués, ruso y español.
- Clonación de voz personalizada a partir de una grabación de referencia de 1 a 30 segundos junto con su transcripción exacta.
- Síntesis con voces predefinidas sin necesidad de grabaciones de referencia separadas.
- 48 entradas de voz preparadas, incluyendo voces inglesas con nombre (Bruno, Bella, Jasper, Luna) y presets por idioma para el resto de lenguas.
- Salida de audio mono a 24 kHz.
- Inferencia sin Python ni LibTorch en tiempo de ejecución.
- Ejecución en CPU y en NVIDIA CUDA según la variante de cuantización.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia para clonación.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz mono a 24 kHz con voces predefinidas estables, adecuado para convertir texto largo en audio sin infraestructura Python, usando la variante Q8 como opción recomendada.
- Clonación de voz para doblaje y localización: con una referencia de 1 a 30 segundos y su transcripción, se puede replicar el timbre de un hablante para generar nuevas locuciones en cualquiera de los diez idiomas soportados.
- Asistentes de voz embebidos en aplicaciones C++: al no requerir Python ni LibTorch y ejecutarse en CPU, se integra en binarios nativos y sistemas con recursos limitados mediante audio.cpp.
- Generación de avisos y anuncios por voz en sistemas de atención telefónica: la síntesis multilingüe permite producir mensajes en el idioma del usuario con presets específicos por lengua.
- Prototipado en hardware de consumo: las variantes TQ2_1 (1,4-1,8 GB) y Q4 (2,27 GB) permiten ejecutar síntesis y clonación en equipos sin GPU dedicada, usando `--backend cpu`.
- Accesibilidad y lectura de contenido: conversión de texto a voz para aplicaciones de lectura asistida, con voces inglesas con nombre como Bruno o Luna y salida WAV directa.
- Investigación en TTS y cuantización: las distintas variantes (NVFP4, TQ2_1 con decodificadores student W4/W8) sirven para estudiar el impacto de la cuantización extrema en la calidad de síntesis, aunque el autor advierte que las comprobaciones no establecen mejor velocidad ni calidad perceptual frente a W4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de los archivos GGUF da una orientación: BF16 4,6 GB, Q8 3,28 GB, Q4 y NVFP4 2,27 GB, TQ2_1 default 1,86 GB, TQ2_1 student W8 1,44 GB, TQ2_1 student W4 1,41 GB.
- GPU recomendadas: NVFP4 requiere kernels CUDA GGML NVFP4; las pruebas locales del autor se realizaron en una RTX 4060 Ti y otras generaciones no han sido validadas según la model card.
- Cabe en GPU de consumo: sí, las variantes Q4, NVFP4 y TQ2_1 caben en GPUs de consumo; TQ2_1 está pensada para CPU (`--backend cpu`).
- Opciones de despliegue: audio.cpp (CLI `audiocpp_cli` y WebUI), con builds que incluyan soporte BF16/Q8/Q4 de Kitten TTS 2; NVFP4 y TQ2_1 requieren la rama `kitten-tts2-nvfp4-tq2-student` del repositorio audio.cpp-custom.
- Latencia y throughput: no disponibles en la información proporcionada; la model card indica que las comprobaciones realizadas no establecen mejor velocidad ni calidad perceptual de W8 frente a W4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| dignome/kitten_tts2 | no disponible | no disponible | 10 | stellon-labs-community-license | GGUF |
| KittenML/kitten-tts-2 (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El autor indica explícitamente que este paquete ya no se mantiene y remite al proyecto audio.cpp principal para versiones actualizadas.
- La licencia es la Stellon Labs Community License, distinta de la del modelo base; es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial.
- Las comprobaciones de generación cubren los diez idiomas, pero no establecen calidad de pronunciación de hablantes nativos.
- La clonación requiere una grabación de referencia de 1 a 30 segundos y su transcripción exacta; sin transcripción no es posible el proceso.
- La cuantización Q4 es experimental según la model card.
- NVFP4 y TQ2_1 requieren una rama específica de audio.cpp-custom y no son compatibles con audio.cpp estándar; TQ2_1 usa el ID de tipo 44 y no es compatible con los archivos GGUF de tipo 43 de Kitten.
- Los errores de reconstrucción de pesos reportados (0,44 % para Q4, 2,3954 % para NVFP4) no son medidas de calidad de audio.
- En CUDA, Q4 carga las proyecciones down como BF16, añadiendo unos 483 MiB de memoria.
- Las pruebas de NVFP4 se limitaron a una RTX 4060 Ti; otras generaciones de GPU no han sido validadas.
- Riesgo de sesgos y alucinación acústica: no se documentan análisis específicos en la información disponible.
- No se dispone de información sobre límites de longitud de texto de entrada ni sobre el comportamiento en contextos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dignome/kitten_tts2
- Modelo base: https://huggingface.co/KittenML/kitten-tts-2
- Rama de soporte NVFP4/TQ2_1 en audio.cpp-custom: https://github.com/dignome/audio.cpp-custom/tree/kitten-tts2-nvfp4-tq2-student
- Archivo de verificación SHA256SUMS: https://huggingface.co/dignome/kitten_tts2/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/dignome/kitten_tts2/blob/main/LICENSE
