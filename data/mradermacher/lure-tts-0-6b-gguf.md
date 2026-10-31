# mradermacher/Lure-TTS-0.6B-GGUF

## Resumen

Lure-TTS-0.6B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo de síntesis de voz Tesslate/Lure-TTS-0.6B, preparado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un sistema de texto a voz (TTS) de aproximadamente 602 millones de parámetros que soporta clonación de voz zero-shot, habla expresiva y emocional, y generación en streaming, con soporte declarado únicamente para inglés.

Este repositorio no contiene el modelo original en sí, sino versiones comprimidas en GGUF que van desde Q2_K (0,3 GB) hasta f16 (1,3 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluso en CPU o en portátiles sin GPU dedicada. La licencia es Apache 2.0, tanto del modelo base como de las cuantizaciones, lo que habilita su uso comercial sin restricciones relevantes.

Cabe señalar que el modelo base está etiquetado como "preview", lo que sugiere que se trata de una versión preliminar. El repositorio incluye además archivos "mmproj" (suplemento multimodal), un detalle inusual en un modelo TTS puro y que sugiere que el modelo base podría tener componentes adicionales de procesamiento. La documentación disponible es escasa: la model card es la estándar de mradermacher y no detalla la arquitectura interna, los datos de entrenamiento ni los benchmarks del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer para TTS, arquitectura interna no documentada) |
| Parametros totales | 602.341.376 (602 M, dato real de safetensors) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base tambien esta disponible en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizacion no documenta la arquitectura interna del modelo. Por los tags del modelo base (text-to-speech, voice-cloning, zero-shot, streaming), se trata de un modelo generativo de audio que produce voz a partir de texto, con capacidad de clonar una voz a partir de una muestra de referencia sin entrenamiento adicional (zero-shot). El tamaño de 602 M de parametros lo situa en la gama compacta de los modelos TTS neuronales, comparable a otros sistemas ligeros de la categoria.

No se ha publicado informacion sobre los datos de entrenamiento (numero de horas de audio, composicion del corpus), el metodo de post-entrenamiento ni innovaciones tecnicas concretas en la informacion disponible. El modelo base esta etiquetado como "preview", por lo que es razonable asumir que se trata de una version en desarrollo y que la documentacion tecnica completa podria llegar en futuras publicaciones de Tesslate.

Sobre las cuantizaciones en si: mradermacher ha generado cuantizaciones estaticas en formatos K-quants e I-quants de llama.cpp. No hay disponibles cuantizaciones weighted/imatrix en el momento de redaccion de la model card, aunque el autor indica que se pueden solicitar mediante una Community Discussion.

## Capacidades

- Sintesis de texto a voz (TTS) en ingles
- Clonacion de voz zero-shot: replica una voz a partir de una muestra de audio de referencia sin fine-tuning
- Habla expresiva y emocional: generacion de audio con entonacion y emocion (segun tags del modelo base)
- Generacion en streaming: salida de audio progresiva, util para aplicaciones en tiempo real
- Cuantizaciones desde 0,3 GB, lo que permite inferencia en CPU y dispositivos con recursos limitados
- Archivos mmproj incluidos (suplemento multimodal), cuyo uso exacto no esta documentado en la model card

No hay informacion disponible sobre soporte de tool calling, capacidades de agente ni otras modalidades (el modelo es exclusivamente TTS, no un LLM de proposito general).

## Casos de uso

- Narracion de audiolibros y articulos: la clonacion zero-shot permite mantener una voz consistente a lo largo de textos largos, y el tamano reducido del modelo permite procesamiento por lotes en maquinas modestas.
- Asistentes de voz en local: con cuantizaciones de 0,4-0,5 GB (Q4_K_S/Q4_K_M) y soporte de streaming, es adecuado para pipelines de voz en dispositivos edge o Raspberry Pi de gama alta, sin depender de APIs externas.
- Prototipado rapido de productos con voz: la licencia Apache 2.0 y el bajo coste computacional permiten integrar TTS en demos y MVPs sin coste de infraestructura.
- Doblaaje y localizacion ligera en ingles: generacion de locuciones con distintas voces y tonos emocionales para videos, podcasts o contenido de marketing.
- Accesibilidad: lectores de pantalla personalizados con voces naturales, ejecutandose completamente en local para preservar la privacidad del usuario.
- Agentes conversacionales con voz: combinacion con un LLM local (por ejemplo via llama.cpp u Ollama) para construir asistentes de voz completos offline, aprovechando la generacion en streaming para reducir la latencia percibida.
- Investigacion en TTS: el tamano compacto y los pesos abiertos facilitan experimentos de fine-tuning y analisis de arquitecturas de sintesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para un modelo TTS, las metricas habituales (WER, SIM, MOS) no aparecen documentadas ni en el repositorio de cuantizacion ni en la model card accesible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,5 GB con Q2_K hasta ~1,5 GB con f16 (mas margen para buffers de audio y contexto); el modelo completo cabe con holgura en practicamente cualquier GPU moderna o incluso solo en RAM de CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con 2 GB de VRAM o mas es suficiente. Para produccion con concurrencia, una RTX 3060/4060 o superior sobra.
- Consumer GPUs: cabe comodamente en RTX 3060, RTX 4060, RTX 4090 e incluso integradas; tambien es viable 100% en CPU dado el tamano (0,4-0,7 GB en cuants recomendados).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si hay soporte para el tipo de modelo en la version instalada), y el modelo base en safetensors via transformers de Hugging Face. No hay evidencia de soporte en vLLM o TGI para este modelo TTS.
- Latencia y throughput: no disponibles; el soporte de streaming del modelo base sugiere latencia de primer chunk baja, pero no hay cifras publicadas.

Nota importante: el soporte de GGUF para modelos TTS en llama.cpp depende de que la arquitectura concreta del modelo este implementada en el motor; conviene verificar la compatibilidad con la version actual de llama.cpp antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Clonacion zero-shot | Streaming |
|---|---|---|---|---|---|
| Lure-TTS-0.6B (base) | 602 M | TTS | Apache 2.0 | Si | Si |
| Kokoro-82M | 82 M | TTS | Apache 2.0 | No (voces fijas) | Si |
| XTTS-v2 (Coqui) | ~750 M | TTS | Coqui Public Model License (no comercial sin licencia) | Si | Si |
| Parler-TTS Mini | ~580 M | TTS | Apache 2.0 | No (control por descripcion) | No documentado |

Lure-TTS-0.6B se diferencia de Kokoro y Parler-TTS en que ofrece clonacion de voz zero-shot, una capacidad que en el ecosistema abierto solo ofrecen pocos modelos (principalmente XTTS-v2 y derivados), y lo hace con una licencia permisiva, a diferencia de XTTS-v2 cuya licencia restringe el uso comercial. Su principal desventaja frente a alternativas es la escasez de documentacion y benchmarks publicados, asi como el soporte limitado al ingles.

## Limitaciones y advertencias

- Soporte limitado al ingles: no genera voz en espanol ni en otros idiomas segun los metadatos del repositorio.
- El modelo base esta etiquetado como "preview": es una version preliminar y su calidad o estabilidad pueden cambiar en futuras versiones.
- No hay benchmarks publicados (WER, SIM, MOS), por lo que la calidad real de la sintesis y de la clonacion de voz debe evaluarse empiricamente antes de usarlo en produccion.
- La clonacion de voz conlleva riesgos eticos y legales graves (suplantacion de identidad, deepfakes de audio); el uso responsable y con consentimiento de la persona clonada es responsabilidad del desarrollador.
- El soporte de GGUF para modelos TTS en llama.cpp no esta garantizado para todas las arquitecturas; los archivos pueden requerir una version concreta del motor o no ser directamente utilizables.
- Las cuantizaciones agresivas (Q2_K, Q3_K) pueden degradar perceptiblemente la calidad del audio generado; se recomiendan Q4_K_M o superiores.
- No hay cuantizaciones imatrix disponibles actualmente.
- Los archivos mmproj incluidos no estan documentados; su funcion y necesidad no estan claras.
- Sesgos: no disponible; como todo modelo TTS entrenado con datos de voz, puede presentar sesgos en acentos, genero y estilos de habla representados en su corpus de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones significativas.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Lure-TTS-0.6B-GGUF
- Modelo base (Tesslate): https://huggingface.co/Tesslate/Lure-TTS-0.6B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Lure-TTS-0.6B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper tecnico del modelo base: no disponible
- Demo online: no disponible
