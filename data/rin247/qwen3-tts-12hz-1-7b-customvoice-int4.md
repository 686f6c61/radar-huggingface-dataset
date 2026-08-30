# Rin247/Qwen3-TTS-12Hz-1.7B-CustomVoice-INT4

## Resumen

Este modelo es una versión cuantizada en INT4 del Qwen3-TTS-12Hz-1.7B-CustomVoice, un sistema de text-to-speech (TTS) desarrollado por el equipo Qwen de Alibaba Cloud. La cuantización ha sido realizada por el usuario Rin247, que publica los pesos en formato safetensors con un tamaño de repositorio de 1,6 GB, frente a los varios gigabytes del modelo original en precisión completa. El modelo base pertenece a la familia Qwen3-TTS, que emplea una arquitectura de LM discreto multi-codebook y un tokenizador acústico propio a 12 Hz, diseñado para lograr una síntesis de voz expresiva, con control fino de timbre, emoción y prosodia mediante instrucciones en lenguaje natural, y con capacidad de generación en streaming de baja latencia.

La versión INT4 mantiene las capacidades funcionales del modelo original, incluyendo soporte para diez idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y control por instrucciones sobre la voz. Al estar cuantizada, resulta adecuada para despliegues en entornos con recursos limitados, como GPUs de consumo o inferencia en CPU, sin renunciar a la calidad de síntesis del modelo base. Es una opción práctica para desarrolladores que necesitan integrar TTS multilingüe de alta calidad en aplicaciones en tiempo real o en dispositivos con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (arquitectura Qwen3-TTS) |
| Parametros totales | 1.167.468.800 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only (segun tags: int4_weight_only, 8-bit) |
| Idiomas soportados | chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano (segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del Qwen3-TTS se basa en un modelo de lenguaje discreto con multiples codebooks, que modela directamente la senal de voz a partir de texto e instrucciones. Utiliza un tokenizador acustico propio, Qwen3-TTS-Tokenizer-12Hz, que comprime la senal de voz en una secuencia de tokens a 12 Hz, preservando informacion paralinguistica y del entorno acustico. El modelo emplea una arquitectura de generacion hibrida "Dual-Track" que permite tanto generacion en streaming como no streaming, con una latencia de sintesis extremadamente baja (se menciona 97 ms de extremo a extremo). No se dispone de detalles especificos sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada. La version cuantizada INT4 ha sido generada por Rin247, presumiblemente mediante tecnicas de cuantizacion post-entrenamiento, aunque no se especifica el metodo exacto.

## Capacidades

- Generacion de voz expresiva y naturalista a partir de texto, con control fino de timbre, emocion y prosodia mediante instrucciones en lenguaje natural.
- Soporte de generacion en streaming: puede emitir el primer paquete de audio tras una sola entrada de caracter, con latencia de extremo a extremo de hasta 97 ms.
- Control de voz por instrucciones: permite ajustar atributos acusticos como tono, ritmo y expresion emocional a partir de descripciones textuales.
- Soporte multilingue: cubre 10 idiomas principales (chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano) y multiples perfiles de voz dialectales.
- Clonacion de voz rapida: aunque esta variante es CustomVoice (no Base), el modelo base de la familia soporta clonacion con solo 3 segundos de audio de referencia; esta version concreta no incluye esa funcionalidad, pero puede utilizarse con timbres predefinidos.
- Robustez ante texto ruidoso o mal formateado, gracias a la comprension contextual del modelo.

## Casos de uso

- Asistentes de voz en tiempo real: gracias a la generacion en streaming y la baja latencia, el modelo puede integrarse en asistentes conversacionales que requieren respuestas de voz inmediatas, como chatbots por voz o interfaces de IVR.
- Audiolibros y narracion automatizada: la capacidad de controlar emocion y prosodia permite generar narraciones expresivas para audiolibros, podcasts o contenido educativo, con seleccion de timbre segun el personaje o el tono deseado.
- Doblaje y localizacion de contenido multimedia: el soporte multilingue y el control de voz por instrucciones facilitan la generacion de doblaje para videos, series o anuncios, ajustando la voz a las caracteristicas del personaje o del publico objetivo.
- Accesibilidad: puede emplearse en aplicaciones de lectura de pantalla o de conversion de texto a voz para personas con discapacidad visual, ofreciendo voces naturales y personalizables.
- Marketing y publicidad personalizada: generacion de anuncios de audio con voces especificas y tonos emocionales adaptados a la marca o al mensaje, sin necesidad de grabar locuciones humanas.
- Prototipado rapido de productos de voz: los desarrolladores pueden integrar el modelo en pipelines de desarrollo para probar interacciones de voz en aplicaciones moviles o web, gracias a su tamano reducido (1,6 GB) que permite ejecucion en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de Qwen3-TTS no incluye tablas de evaluacion comparativa, y la version cuantizada de Rin247 tampoco proporciona datos de rendimiento especificos. Se recomienda consultar el repositorio oficial de Qwen para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: con cuantizacion INT4 y un tamano de pesos de aproximadamente 1,6 GB, el modelo puede ejecutarse en GPUs con al menos 4 GB de VRAM, aunque se recomienda 6-8 GB para margen con el contexto y las activaciones.
- GPUs recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes. Para despliegues en produccion, una A10 o A100 ofreceria mayor throughput.
- Compatibilidad con CPU: al ser un modelo relativamente pequeno (1,17 B parametros), puede ejecutarse en CPU con cuantizacion, aunque con mayor latencia.
- Opciones de despliegue: la model card menciona compatibilidad con el paquete `qwen-tts` y vLLM. Tambien puede utilizarse con frameworks de inferencia que soporten safetensors y cuantizacion INT4, como llama.cpp (si se convierte a GGUF) o TensorRT-LLM.
- Latencia y throughput: no se proporcionan datos especificos para esta version cuantizada. El modelo original reporta una latencia de sintesis de 97 ms en streaming, pero la cuantizacion puede alterar ligeramente estos valores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice (original) | ~1,7 B (segun nombre) | no disponible | 10 | Apache-2.0 | safetensors (BF16) |
| Rin247/Qwen3-TTS-12Hz-1.7B-CustomVoice-INT4 | 1.167.468.800 | no disponible | 10 | Apache-2.0 | safetensors (INT4) |
| XTTS v2 (Coqui) | ~0,8 B | no disponible | 17 | CPML (no comercial) | safetensors |
| Bark (Suno) | ~1,2 B | no disponible | 13 | MIT | safetensors |

La comparativa se basa en caracteristicas generales, ya que no se dispone de benchmarks comunes. El modelo original de Qwen ofrece control por instrucciones y streaming, caracteristicas que no estan presentes en XTTS v2 ni en Bark de forma nativa. La version INT4 de Rin247 mantiene esas capacidades con un tamano reducido, a costa de una posible perdida de fidelidad en la sintesis.

## Limitaciones y advertencias

- La cuantizacion INT4 puede degradar ligeramente la calidad de la voz generada en comparacion con el modelo en precision completa, especialmente en matices prosodicos o en idiomas con fonetica compleja.
- No se dispone de informacion sobre el proceso de cuantizacion utilizado por Rin247, por lo que no se puede garantizar la ausencia de artefactos o perdida de estabilidad en la generacion.
- El modelo puede presentar sesgos en las voces generadas, derivados de los datos de entrenamiento del modelo original, que no se documentan en la model card.
- Existe riesgo de alucinacion en la interpretacion de instrucciones complejas o en textos ambiguos, lo que puede producir una prosodia inadecuada o errores de pronunciacion.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar que la implementacion de cuantizacion de Rin247 no incluya restricciones adicionales (no se indican en la ficha).
- No se especifica la longitud de contexto soportada, lo que puede limitar la generacion de textos muy largos o con multiples parrafos.
- El modelo no incluye funcionalidad de clonacion de voz (es la variante CustomVoice, no Base), por lo que solo puede usar los timbres predefinidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-1.7B-CustomVoice-INT4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3-TTS
- Paper (referenciado en tags): arxiv:2601.15621
- Copia alternativa en Hugging Face: https://huggingface.co/Jinstudio/Qwen3-TTS-12Hz-1.7B-CustomVoice
