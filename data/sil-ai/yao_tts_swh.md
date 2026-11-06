# sil-ai/yao_tts_swh

## Resumen

yao_tts_swh es un modelo de sintesis de voz (text-to-audio) desarrollado por el grupo SIL AI, obtenido mediante fine-tuning de microsoft/speecht5_tts. El nombre sugiere un ajuste orientado a una lengua o variante concreta (el sufijo "swh" es compatible con la designacion ISO 639-3 del suajili), aunque la model card no lo confirma explicitamente. El modelo se publica bajo licencia MIT y esta pensado para generar audio a partir de texto dentro del ecosistema Transformers.

Tecnicamente es un SpeechT5, una arquitectura encoder-decoder que comparte representaciones entre habla y texto, con 144.441.570 parametros totales y pesos en formato safetensors. El repositorio ocupa 1,7 GB. El fine-tuning se realizo durante 15.000 pasos (aproximadamente 174 epocas sobre el conjunto de entrenamiento) con un learning rate de 1e-4, AdamW fused, scheduler coseno y precision mixta nativa, alcanzando una perdida de validacion de 0,0589.

Su relevancia es limitada pero concreta: cubre una necesidad de TTS en una lengua de bajos recursos donde los modelos multilingues genericos suelen rendir peor, y lo hace con una licencia permisiva que facilita su integracion en productos. No obstante, la documentacion publicada es minima y no se han declarado evaluaciones formales de calidad de sintesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder transformer para habla y texto) |
| Parametros totales | 144.441.570 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el identificador "swh" sugiere suajili, sin confirmacion en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de microsoft/speecht5_tts, un SpeechT5 que emplea un encoder compartido para texto y habla junto con un decoder autorregresivo que predice mel-spectrograms, complementado por un vocoder (HiFi-GAN en el flujo estandar de SpeechT5) para convertir el espectrograma en forma de onda. En la practica, la generacion requiere un speaker embedding o x-vector como condicionamiento, ademas del texto de entrada.

El entrenamiento consistio en un fine-tuning supervisado sobre un dataset no identificado en la model card ("None dataset"). Los hiperparametros documentados son: learning rate 1e-4, batch size efectivo de 32 (8 por dispositivo con 4 pasos de acumulacion), semilla 3407, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 1.500 pasos de warmup, 15.000 pasos totales y AMP nativo. La perdida de validacion se estabiliza en torno a 0,059-0,060 a partir del paso 5.000, lo que sugiere convergencia temprana y ausencia de mejoras sustanciales en las dos terceras partes finales del entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Sintesis de voz a partir de texto (text-to-audio) dentro del pipeline de Transformers.
- Generacion condicionada por speaker embedding, lo que permite fijar una identidad de voz concreta si se dispone del x-vector adecuado.
- Capacidad multilingue: no documentada; el identificador apunta a una unica lengua o variante.
- Soporte de tool calling o function calling: no disponible (el modelo no es un LLM).
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Modo thinking, vision o audio de entrada: no disponible; el modelo es exclusivamente de sintesis.
- Control de prosodia o emociones: no documentado.

## Casos de uso

- Lectura de contenido en una lengua de bajos recursos: el modelo puede convertir articulos, noticias o documentacion a audio para comunidades con poca cobertura de TTS comercial, aprovechando el ajuste especifico sobre el dominio linguistico del fine-tuning.
- Accesibilidad para personas con discapacidad visual: integracion en lectores de pantalla o aplicaciones de lectura por voz donde se requiera una voz en la lengua objetivo y una licencia permisiva para distribucion.
- Generacion de avisos y anuncios automatizados: sintesis de mensajes cortos en sistemas de megafonia, transporte publico o alertas institucionales, con latencia baja gracias al tamano contenido del modelo.
- Produccion de audiolibros y podcasts: generacion por lotes de narraciones largas dividiendo el texto en fragmentos y manteniendo un speaker embedding fijo para conservar la coherencia de voz.
- Prototipado de asistentes de voz: uso como componente TTS en pipelines de dialogue systems donde se necesita una voz funcional en la lengua del ajuste sin costes de licencia.
- Investigacion en TTS de bajos recursos: punto de partida para experimentos de adaptacion, comparacion de vocoders o evaluacion de transferencia desde SpeechT5 a nuevas lenguas, dado que los pesos y la receta de entrenamiento son publicos.
- Localizacion de contenido educativo: doblaje automatico de materiales didacticos a la lengua del modelo con una voz consistente y sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo declarado por el autor es la perdida de validacion final (0,0589) y la curva de entrenamiento:

| Paso | Epoca | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|---|
| 1000 | 11,63 | 0,0812 | 0,0663 |
| 5000 | 58,14 | 0,0591 | 0,0592 |
| 10000 | 116,28 | 0,0500 | 0,0594 |
| 15000 | 174,42 | 0,0485 | 0,0589 |

No se proporcionan metricas perceptuales (MOS), tasas de error de palabra ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 144,4 millones de parametros (unos 578 MB en fp32 y unos 289 MB en fp16). Sumando el vocoder y los buffers intermedios, la inferencia cabe holgadamente en 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. En entornos de servidor, A100 o H100 permiten alto throughput por batching, aunque estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas, e incluso en CPU para generacion no interactiva.
- Opciones de despliegue: Transformers con el pipeline text-to-audio, TorchScript para reducir overhead en produccion y ONNX Runtime para entornos sin GPU. No se documentan integraciones con vLLM ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por tamano, se espera generacion en tiempo real o mas rapida en GPU consumer, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| sil-ai/yao_tts_swh | 144,4 M | TTS, longitud de entrada no documentada | MIT | Hugging Face, 37 descargas |
| microsoft/speecht5_tts | ~144 M (arquitectura base) | TTS, multilingue segun vocoder y datos | MIT | Hugging Face, ampliamente usado |
| Coqui XTTS v2 | no disponible en la informacion | TTS multilingue con clonacion de voz | CPML (no comercial) | Coqui / Hugging Face |
| VITS / Piper | variable por voz | TTS ligero orientado a CPU | MIT (Piper) | Repositorios de voces por idioma |

La comparacion cuantitativa de calidad no es posible con los datos disponibles: yao_tts_swh no publica MOS ni WER, y los modelos alternativos tampoco se han evaluado aqui con la misma metodologia.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es la plantilla autogenerada por Trainer y no especifica dataset, idioma, hablantes ni condiciones de uso previstas.
- No se declara el conjunto de datos de entrenamiento, por lo que se desconoce la procedencia de las voces y las condiciones de consentimiento; conviene verificar antes de uso comercial pese a la licencia MIT.
- Riesgo de sobreajuste: 174 epocas sobre un dataset no identificado y una perdida de validacion que se estanca desde el paso 5.000 sugieren posible sobreajuste al dominio y a los hablantes de entrenamiento.
- Calidad de sintesis no evaluada: sin MOS, sin pruebas de inteligibilidad y sin comparaciones objetivas, no hay garantia de naturalidad ni de robustez ante texto fuera de dominio.
- Cobertura linguistica incierta: el identificador "swh" apunta a suajili, pero no se confirma; usar el modelo con otro idioma producira resultados degradados.
- Requiere speaker embedding: el flujo de SpeechT5 necesita un x-vector valido; usar uno inadecuado o inexistente puede generar voces incoherentes o artefactos.
- Longitud de entrada no documentada: los modelos SpeechT5 tienen limites practicos en la longitud de texto por inferencia; sera necesario fragmentar textos largos.
- Sesgos: no evaluados. Al no conocerse el dataset, no se puede descartar sesgo de genero, edad o acento en las voces representadas.
- Adopcion muy baja (37 descargas, 0 likes) y fecha de creacion reciente: no hay evidencia de uso en produccion ni retroalimentacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sil-ai/yao_tts_swh
- Modelo base: https://huggingface.co/microsoft/speecht5_tts
- Paper de SpeechT5 (Microsoft Research): https://arxiv.org/abs/2010.00720
- Repositorio oficial de SpeechT5: https://github.com/microsoft/SpeechT5
- Documentacion de Transformers para SpeechT5: https://huggingface.co/docs/transformers/model_doc/speecht5
- Organizacion SIL AI en Hugging Face: https://huggingface.co/sil-ai
