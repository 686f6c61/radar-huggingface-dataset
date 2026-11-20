# leok7v/whistle

## Resumen

Whistle es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Cactus Compute, orientado a inferencia en dispositivo (on-device) y entornos de borde. El modelo ocupa tan solo 16,9 MB en su formato compilado `whistle.cact` y esta disenado para transcripcion, generacion de marcas temporales a nivel de palabra y extraccion de embeddings de voz en siete idiomas europeos (ingles, aleman, frances, espanol, italiano, neerlandes y polaco). El repositorio de Hugging Face analizado (`leok7v/whistle`) es un espejo sin modificaciones del original `Cactus-Compute/whistle`, mantenido por un tercero.

La relevancia del modelo reside en su extremadamente reducido consumo de recursos: con un peso de menos de 20 MB, es viable ejecutarlo en dispositivos consumer, navegadores (via WebAssembly) y sistemas embebidos, algo impensable con modelos ASR clasicos tipo Whisper large. Emplea la libreria propietaria `cactus-compute` como runtime, que gestiona la descarga y cache del motor y de los pesos en el primer uso.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y esta pensado para escenarios donde el coste de latencia, ancho de banda o privacidad (procesamiento local sin enviar audio a la nube) es critico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR compacto; arquitectura concreta no detallada en la informacion proporcionada) |
| Parametros totales | no disponible (peso del artefacto compilado: 16,9 MB) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona "quantization" como tag, sin detallar metodos) |
| Idiomas soportados | en, de, fr, es, it, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | `whistle.cact` (formato propietario del runtime Cactus) y `checkpoints/whistle.safetensors` |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna exacta (tipo de encoder/decoder, atencion, capas, dimensiones ocultas) ni el volumen o composicion del dataset de entrenamiento. La model card remite a la web oficial de Cactus Compute para detalles tecnicos, benchmarks y demo en navegador, pero esos datos no se incluyen en el material proporcionado.

Los elementos tecnicos confirmados son: el modelo produce transcripciones, marcas temporales a nivel de palabra y embeddings de voz; se ejecuta mediante la libreria `cactus-compute`, que actua como runtime ligero multiplataforma (se mencionan binarios para multiples plataformas y soporte WebAssembly); y el artefacto principal `whistle.cact` sugiere un formato optimizado para despliegue en borde, presumiblemente con cuantizacion agresiva para alcanzar 16,9 MB. No se confirma el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto (ASR) en siete idiomas: ingles, aleman, frances, espanol, italiano, neerlandes y polaco.
- Generacion de marcas temporales a nivel de palabra (word timestamps), util para subtitulados y alineacion.
- Extraccion de embeddings de voz (speech embeddings), habilitando tareas derivadas como busqueda por similitud o clasificacion.
- Inferencia on-device y en entornos de borde, incluido WebAssembly en navegador.
- Procesamiento de audio de entrada a 16 kHz en formato WAV; el extra `cactus-compute[mic]` amplia el soporte a otras frecuencias de muestreo y captura por microfono.
- No se documentan capacidades de tool calling, agentes, vision, audio generation ni razonamiento multi-paso; es un modelo exclusivamente ASR.

## Casos de uso

- Subtitulado automatico en tiempo real: las marcas temporales a nivel de palabra permiten generar subtitulos sincronizados en aplicaciones de video, videoconferencia o streaming, con latencia baja al ejecutarse localmente.
- Asistentes de voz embebidos: integracion en dispositivos IoT, wearables o electrodomesticos con recursos limitados, donde un modelo de 16,9 MB cabe en memoria flash y se ejecuta sin GPU dedicada.
- Transcripcion en navegador con WebAssembly: aplicaciones web que procesan audio del usuario sin enviarlo a un servidor, cumpliendo requisitos de privacidad (RGPD) y reduciendo costes de infraestructura.
- Dictado y notas de voz en aplicaciones moviles: transcripcion offline en el propio telefono, util en entornos sin conectividad o con ancho de banda limitado.
- Indexacion y busqueda de audio por embeddings: usar los speech embeddings para construir indices vectoriales de grabaciones (podcasts, reuniones) y permitir busqueda semantica por contenido hablado.
- Transcripcion multilingue en atencion al cliente: cubre siete idiomas europeos, permitiendo desplegar un unico modelo ligero para mercados como Espana, Francia, Alemania, Italia, Paises Bajos y Polonia sin multiplicar la huella de memoria.
- Preprocesamiento en pipelines de datos: transcripcion masiva de corpus de audio en CPU como paso previo a entrenamiento de otros modelos, gracias al bajo coste computacional por hora de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la web oficial de Cactus Compute (`https://cactuscompute.com/blog/whistle`) para benchmarks, pero los valores concretos no estan incluidos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el artefacto compilado ocupa 16,9 MB, por lo que cabe en memoria de cualquier dispositivo moderno. No se especifica consumo exacto de RAM en ejecucion.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU y entornos de borde. No se documentan requisitos de GPU dedicada.
- Cabe en GPU consumer: si, con holgura (cualquier GPU consumer moderna, e incluso CPUs de gama baja), aunque el objetivo declarado es ejecucion on-device sin acelerador.
- Opciones de despliegue: libreria `cactus-compute` (Python, con extra `[mic]` para microfono y otras frecuencias), runtime Cactus con binarios multiplataforma y soporte WebAssembly para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLM y no a este formato propietario.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whistle (Cactus Compute) | 16,9 MB (artefacto compilado) | no disponible | 7 (en, de, fr, es, it, nl, pl) | Apache 2.0 | Hugging Face (original y espejo), runtime Cactus |
| OpenAI Whisper (tiny) | ~39 M parametros | 30 s de audio por ventana | ~99 idiomas | MIT | Hugging Face, multiples runtimes |
| OpenAI Whisper (base) | ~74 M parametros | 30 s de audio por ventana | ~99 idiomas | MIT | Hugging Face, multiples runtimes |
| NVIDIA Parakeet / NeMo ASR | cientos de millones (segun variante) | variable | mayoritariamente ingles | segun variante (a menudo CC-BY-4.0) | NGC, Hugging Face |

La comparativa se limita a modelos ASR de referencia; los datos de Whisper tiny/base son aproximados y ampliamente conocidos, mientras que los de Whistle provienen de la model card. Whistle destaca por su tamano extremadamente reducido y su enfoque on-device/WebAssembly, a costa de cubrir menos idiomas que Whisper y de depender de un runtime propietario. No se dispone de datos de rendimiento comparativo (WER) en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks (WER, latencia) en la informacion disponible, por lo que la calidad de transcripcion no puede verificarse objetivamente.
- Cobertura linguistica limitada a siete idiomas; no soporta el resto de idiomas que ofrece Whisper.
- Entrada de audio restringida a 16 kHz WAV por defecto; otras frecuencias requieren el extra `cactus-compute[mic]`.
- Dependencia de un runtime propietario (`cactus-compute`) y de un formato de pesos no estandar (`whistle.cact`), lo que limita la portabilidad frente a formatos como GGUF u ONNX.
- El repositorio analizado es un espejo de terceros (`leok7v/whistle`); para produccion conviene referenciar el original `Cactus-Compute/whistle` y verificar su integridad.
- Riesgo de sesgos y alucinaciones en ASR: no se documentan analisis de sesgo por acento, edad o genero, ni estrategias de mitigacion.
- El modelo no dispone de funcionalidades de LLM (tool calling, agentes, razonamiento), por lo que no debe confundirse con un modelo conversacional.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos del runtime Cactus, que puede tener condiciones distintas de la licencia de los pesos.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/leok7v/whistle
- Repositorio original: https://huggingface.co/Cactus-Compute/whistle
- Web oficial de Whistle (detalles, benchmarks, demo): https://cactuscompute.com/blog/whistle
- Documentacion de la API Python: https://cactuscompute.com/blog/needle-python-docs
- Guia de reconocimiento de voz: https://cactuscompute.com/blog/whistle-best-practices
- Guia de fine-tuning: https://cactuscompute.com/blog/finetuning-whistle
- Codigo fuente del runtime Cactus: https://github.com/cactus-compute/cactus
- Runtime y plataformas soportadas: https://huggingface.co/Cactus-Compute/cactus
