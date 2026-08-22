# manish320/whisper-small-jv-id-lora

## Resumen

Este modelo es una version afinada de **OpenAI Whisper Small** para reconocimiento automatico del habla (ASR) en indonesio y javanes, con soporte especifico para el fenomeno de code-switching entre ambos idiomas. Lo ha desarrollado el usuario manish320 y lo ha publicado en Hugging Face con licencia MIT. El modelo resuelve el problema de transcribir conversaciones reales donde los hablantes alternan entre indonesio y javanes dentro de una misma frase, algo que los modelos ASR genericos suelen forzar a un unico idioma.

El ajuste se realizo mediante **LoRA (Low-Rank Adaptation)**, una tecnica de fine-tuning eficiente que entrena un numero reducido de parametros adicionales mientras mantiene congelados los pesos originales del modelo base. Los pesos LoRA se han fusionado con el modelo Whisper Small original, de modo que el repositorio contiene el modelo completo listo para usar sin necesidad de cargar adaptadores por separado. El modelo tiene 241,7 millones de parametros y esta disenado para audio muestreado a 16 kHz.

La relevancia de este modelo radica en su especializacion para dos idiomas con recursos limitados en el ecosistema ASR, y en su capacidad para preservar los cambios de idioma dentro de un mismo enunciado, lo que lo hace util para aplicaciones de transcripcion de conversaciones cotidianas, medios de comunicacion y atencion al cliente en Indonesia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (Whisper Small) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, FP32/FP16) |
| Idiomas soportados | Indonesio (id), javanes (jv), code-switching id-jv |
| Licencia | MIT (modelo afinado); el modelo base Whisper es MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Whisper Small** de OpenAI, un transformer encoder-decoder disenado para ASR multilingue. El encoder procesa espectrogramas Mel de audio de 16 kHz y el decoder genera el texto transcrito de forma autorregresiva. Whisper Small tiene aproximadamente 244 millones de parametros y fue preentrenado con 680.000 horas de audio multilingue supervisado de forma debil.

El proceso de entrenamiento especifico de este modelo consistio en un **fine-tuning con LoRA** sobre datos de habla indonesia y javanesa, incluyendo ejemplos de code-switching. LoRA entrena matrices de adaptacion de bajo rango para las capas de atencion del transformer, lo que reduce notablemente la memoria de GPU requerida y el numero de parametros entrenables. Tras el entrenamiento, los adaptadores LoRA se fusionaron con los pesos originales, de modo que el modelo final es un modelo Whisper completo y autocontenido.

No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento, el numero de tokens o el volumen de datos utilizados. La model card no menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- **Reconocimiento automatico del habla** en indonesio y javanes, con soporte para transcripcion de audio de 16 kHz.
- **Code-switching indonesio-javanes**: el modelo esta disenado para preservar la alternancia de idiomas dentro de un mismo enunciado, en lugar de forzar la transcripcion a un solo idioma.
- **Transcripcion de habla conversacional**: adecuado para dialogos y conversaciones cotidianas en estos idiomas.
- **Experimentos de ASR multilingue**: permite evaluar el comportamiento de Whisper en idiomas de baja representacion.
- **Generacion de transcripciones sin forzar idioma**: la configuracion de generacion no fuerza un idioma concreto, lo que permite que el modelo decida el idioma de forma natural.
- **Integracion con Hugging Face Transformers**: se puede cargar y usar con las APIs estandar de Whisper (`WhisperProcessor` y `WhisperForConditionalGeneration`).

## Casos de uso

- **Atencion al cliente en Indonesia**: el modelo puede transcribir llamadas de soporte tecnico o comercial donde los agentes y clientes alternan entre indonesio y javanes. Su capacidad para mantener el idioma original en cada segmento facilita el analisis posterior de las conversaciones y la extraccion de intenciones.
- **Transcripcion de reuniones y entrevistas**: en entornos corporativos o academicos donde se habla javanes e indonesio de forma intercalada, este modelo produce transcripciones mas fieles que un modelo generico de Whisper, que tiende a normalizar todo a un solo idioma.
- **Subtitulado de contenido audiovisual**: para videos, podcasts o noticias locales en Indonesia, el modelo puede generar subtitulos en el idioma original de cada segmento, preservando el code-switching real del habla.
- **Documentacion de actas y reuniones gubernamentales**: en regiones de Java donde el javanes es de uso comun en contextos formales, el modelo facilita la transcripcion de sesiones, reuniones y audiencias.
- **Investigacion linguistica sobre code-switching**: el modelo puede servir como herramienta para anotar corpus de habla indonesia-javanes y estudiar los patrones de alternancia de codigo.
- **Sistemas de transcripcion para personas con discapacidad auditiva**: en entornos donde se hable indonesio o javanes, el modelo puede generar subtitulos en tiempo real (si se combina con un pipeline de streaming) para facilitar la accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER ni CER para este modelo especifico, por lo que no es posible comparar su rendimiento con otros sistemas de forma cuantitativa.

## Requisitos de hardware

- **VRAM estimada para inferencia**: Whisper Small en FP32 requiere aproximadamente 1,5 GB de VRAM para inferencia. Con cuantizacion FP16 o INT8, el requisito se reduce a ~0,8 GB y ~0,5 GB respectivamente. Este modelo concreto no proporciona cuantizaciones GGUF, pero puede cuantizarse con herramientas como `llama.cpp` o `onnxruntime` si se desea.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32. Una RTX 3060, RTX 4060, T4 o incluso una GPU integrada con soporte CUDA pueden ejecutar el modelo sin problemas.
- **CPU**: el modelo se puede ejecutar en CPU, aunque la latencia sera mayor. Para uso en produccion con CPU se recomienda cuantizar o usar un framework optimizado como CTranslate2.
- **Opciones de despliegue**: se puede servir con Hugging Face Transformers, `vLLM` (aunque Whisper no esta soportado de forma nativa), `CTranslate2`, `Whisper.cpp` (tras conversion) o mediante la API de Hugging Face Inference Endpoints.
- **Latencia y throughput**: no se disponen de datos de latencia especificos para este modelo. Como referencia, Whisper Small en una GPU A100 tarda ~0,5 segundos en transcribir 30 segundos de audio; en una RTX 4090, ~1 segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **manish320/whisper-small-jv-id-lora** | 241,7 M | 30 s audio | id, jv, code-switching | MIT | Hugging Face |
| **openai/whisper-small** | 244 M | 30 s audio | 96 idiomas | MIT | Hugging Face, OpenAI API |
| **openai/whisper-base** | 74 M | 30 s audio | 96 idiomas | MIT | Hugging Face, OpenAI API |
| **openai/whisper-large-v3** | 1.550 M | 30 s audio | 96 idiomas | MIT | Hugging Face, OpenAI API |

El modelo es esencialmente un Whisper Small ajustado para dos idiomas concretos. Frente al Whisper Small original, ofrece una especializacion en indonesio y javanes que puede mejorar la transcripcion de estos idiomas, especialmente en escenarios de code-switching. Sin embargo, carece de la generalidad multilingue del modelo base. Whisper Large-v3 ofrece un mejor rendimiento general, pero requiere mucha mas VRAM (8-10 GB en FP16) y es menos adecuado para despliegue en hardware modesto.

## Limitaciones y advertencias

- **Rendimiento reducido fuera de los idiomas objetivo**: el modelo puede degradarse notablemente en otros idiomas, ya que el fine-tuning ha especializado los pesos hacia indonesio y javanes.
- **Sensibilidad al ruido**: como Whisper base, el modelo es vulnerable a ruido de fondo fuerte, grabaciones de baja calidad y micrófonos de bajo coste.
- **Variabilidad dialectal**: los acentos y variantes dialectales no representados en el dataset de entrenamiento pueden producir transcripciones con errores.
- **Limitaciones de duracion de audio**: Whisper Small procesa ventanas de 30 segundos; audios mas largos deben segmentarse, lo que puede afectar a la coherencia de la transcripcion.
- **Code-switching poco representado**: si el patron de alternancia de codigo difiere del visto en el entrenamiento, el modelo puede fallar al preservar el idioma correcto.
- **Licencia MIT**: el modelo se distribuye bajo licencia MIT, lo que permite uso comercial, pero debe respetarse la licencia del modelo base y de los datos de entrenamiento utilizados, que no se especifican en detalle.
- **Sin garantias**: la model card indica que el modelo se proporciona para fines de investigacion y desarrollo, sin garantias de calidad de transcripcion en todos los escenarios.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/manish320/whisper-small-jv-id-lora)
- [Modelo base Whisper Small](https://huggingface.co/openai/whisper-small)
- [Repositorio de Whisper en GitHub](https://github.com/openai/whisper)
