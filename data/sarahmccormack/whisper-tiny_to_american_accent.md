# SarahMcCormack/whisper-tiny_to_american_accent

## Resumen

Whisper tiny american es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por SarahMcCormack en Hugging Face, orientado al reconocimiento automatico del habla (ASR) sobre acento ingles americano. Parte de la arquitectura encoder-decoder transformer propia de la familia Whisper, con 37,76 millones de parametros totales y un unico idioma declarado: ingles. El modelo se entrena sobre el dataset `american_english` y declara un WER de 9,1019 sobre su split de test, una mejora respecto al 10,9119 obtenido en el checkpoint intermedio de 1000 pasos.

El interes practico de este modelo es acotado pero claro: sirve como ejemplo reproducible de especializacion de un modelo ASR pequeno hacia una variante dialectal concreta, con un coste computacional minimo (repo de 0,3 GB, entrenamiento de 2000 pasos con batch size 2). No es un modelo de proposito general ni compite con los Whisper de mayor tamano; su utilidad esta en pipelines de transcripcion de bajo coste, prototipado rapido y experimentacion con adaptacion de dominio.

La model card es practicamente un esqueleto generado automaticamente por el Trainer de Hugging Face: no documenta la composicion del dataset, el preprocesado ni los usos previstos. Cualquier evaluacion en produccion debe hacerse con cautela y validacion propia, dado que el WER declarado no esta verificado (`verified: false`) y el modelo acumula solo 22 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion estandar, disenado para mapear espectrogramas Mel de audio a tokens de texto. El ajuste fino se realizo con el Trainer de Hugging Face (Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0, Tokenizers 0.23.3) durante 2000 pasos, con learning rate 1e-05, batch size de entrenamiento 2, batch de evaluacion 1, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y semilla 42.

No se especifica en la informacion disponible el numero de tokens de audio utilizados, la composicion exacta del dataset `american_english`, ni si se aplicaron tecnicas de aumento de datos o regularizacion adicional. Tampoco consta el uso de RLHF, DPO ni decodificacion especulativa. La unica innovacion documentada es la propia especializacion al acento americano, que se refleja en la reduccion del WER entre el checkpoint de 1000 pasos (10,9119) y el de 2000 pasos (9,1019), junto con una bajada de la perdida de validacion de 0,2033 a 0,1866.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en acento americano.
- Transcripcion de audio a texto mediante la pipeline `automatic-speech-recognition` de Transformers.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- Modelo de un solo idioma: no soporta traduccion ni transcripcion multilingue.
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No consta modo thinking, vision, audio de entrada mas alla del audio ASR ni capacidades multimodales adicionales.
- No consta capacidad de diarizacion de hablantes ni marcas de tiempo a nivel de palabra en la documentacion disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles americano: el modelo puede procesar clips de audio y devolver texto plano mediante la pipeline de ASR, adecuado para prototipos donde el coste por inferencia es critico gracias a sus 37,76 M de parametros.
- Subtitulado automatico de contenido en ingles americano: util para generar subtitulos preliminares en videos de baja/media calidad que luego se revisan manualmente, dado su WER declarado de ~9,1 sobre el dataset de evaluacion.
- Prototipado de asistentes de voz: integrable en pipelines de transformers para comandos de voz o dictado en aplicaciones de escritorio y moviles, con un repo de solo 0,3 GB que facilita el despliegue en entornos con recursos limitados.
- Investigacion en adaptacion dialectal: sirve como linea base reproducible para comparar tecnicas de fine-tuning de ASR sobre variantes del ingles, ya que documenta hiperparametros y curva de entrenamiento.
- Preprocesado de datos de audio para NLP: transcripcion masiva de corpus de audio en ingles americano antes de aplicar tecnicas de analisis de texto, con un coste computacional bajo por muestra.
- Educacion y demos: ejemplo didactico de como especializar un modelo Whisper con el Trainer de Hugging Face, util en cursos y tutoriales de ASR.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny American | American English | test | WER | 9,1019 |
| Whisper tiny American (checkpoint 1000 pasos) | American English | test | WER | 10,9119 |
| Whisper tiny American | American English | test | Loss | 0,1866 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (por ejemplo, el Whisper tiny original de OpenAI) sobre el mismo dataset, ni metricas adicionales como WER por locutor, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 37,76 M de parametros; en la practica, el cuello de botella es el buffer de audio y el runtime de PyTorch, no el peso del modelo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; el modelo funciona correctamente en CPU para cargas moderadas.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU, Raspberry Pi con limitaciones de latencia).
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, endpoints de Hugging Face (tag `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se dispone de una conversion a GGUF, aunque no consta en la informacion disponible que exista dicha conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Idiomas | Licencia | WER declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| Whisper tiny American (este modelo) | 37,76 M | ventana de audio de 30 s (Whisper) | en | Apache 2.0 | 9,1019 (American English test) | Hugging Face, 22 descargas |
| openai/whisper-tiny | 37,76 M | ventana de audio de 30 s (Whisper) | multilingue | Apache 2.0 | no disponible en esta ficha | Hugging Face, ampliamente usado |
| openai/whisper-base | ~74 M | ventana de audio de 30 s (Whisper) | multilingue | Apache 2.0 | no disponible en esta ficha | Hugging Face |

La comparacion directa con whisper-tiny original no puede establecerse con rigor porque no se dispone del WER de referencia sobre el mismo dataset `american_english` en la informacion proporcionada. El modelo base es la referencia natural, pero cualquier afirmacion de mejora relativa requiere una evaluacion propia.

## Limitaciones y advertencias

- El WER de 9,1019 esta declarado por el autor y marcado como no verificado; no debe tomarse como garantia de calidad.
- Modelo de un solo idioma (ingles): no transcribe ni traduce otros idiomas, y su comportamiento con acentos no americanos no esta documentado.
- La model card no documenta la composicion del dataset `american_english`, por lo que se desconoce el sesgo demografico, la calidad de las transcripciones de referencia y la cobertura de locutores.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla solapada, comportamiento comun en la familia Whisper de tamano tiny.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en su dominio y de cumplir la normativa aplicable sobre datos de voz.
- Modelo con 22 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- No consta documentacion sobre cuantizacion, conversion a GGUF ni soporte en runtimes distintos de Transformers.
- El tag `generated_from_trainer` y el aviso de la model card indican que la documentacion es automatica y no ha sido revisada; faltan secciones de usos previstos y limitaciones redactadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SarahMcCormack/whisper-tiny_to_american_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentacion de la pipeline ASR: https://huggingface.co/docs/transformers/tasks/asr
- Dataset referenciado: american_english (no se dispone de URL publica en la informacion proporcionada)
