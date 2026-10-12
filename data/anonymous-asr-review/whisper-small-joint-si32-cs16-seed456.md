# anonymous-asr-review/whisper-small-joint-si32-cs16-seed456

## Resumen

whisper-small-joint-si32-cs16-seed456 es un conjunto de adaptadores LoRA (PEFT) sobre el modelo base openai/whisper-small, publicado de forma anonima como material suplementario para revision por pares. No es un modelo completo: la model card indica que contiene dos adaptadores, uno de rango 32 orientado a cingales (sinhala, codigo `si`) y otro de rango 16 orientado a code-switching, actualizados de forma conjunta durante el entrenamiento en code-switching. Ambos deben activarse a la vez y con peso unitario para reproducir el comportamiento previsto.

El modelo resuelve un problema muy concreto dentro del reconocimiento automatico del habla: la transcripcion de audio en cingales y, sobre todo, de habla con alternancia de codigo cingales-ingles (`si`-`en`), un fenomeno habitual en contextos bilingues de Sri Lanka. La eleccion de Whisper-small (un encoder-decoder transformer de aproximadamente 244 M de parametros) como base, en lugar de un modelo mayor, apunta a un escenario de bajo coste computacional y despliegue en hardware modesto.

Su relevancia actual es limitada y muy especifica: se trata de un artefacto de investigacion sin resultados de benchmarks publicados, con 0 descargas y 0 "likes" en el momento de la consulta, licencia no declarada y un unico commit (creado y actualizado el 12 de octubre de 2026). Es util como referencia metodologica para investigacion en adaptadores LoRA aplicados a ASR con code-switching, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) con adaptadores LoRA/PEFT; no es una arquitectura nueva |
| Parametros totales | No disponible para los adaptadores; el modelo base openai/whisper-small tiene aproximadamente 244 M de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No es contexto de texto autoregresivo: el encoder de Whisper procesa ventanas de audio de 30 s (1500 fotogramas de 10 ms) del modelo base; el decoder genera hasta 448 tokens por ventana |
| Tipos de cuantizacion | No disponible en la model card; los adaptadores se distribuyen en safetensors y la cuantizacion depende del modelo base con el que se combinen |
| Idiomas soportados | Cingales (`si`) e ingles (`en`), incluida la alternancia de codigo entre ambos |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); los pesos base de Whisper se descargan por separado desde openai/whisper-small |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper-small: un transformer encoder-decoder entrenado para ASR multilingue, con entrada de espectrograma mel logaritmico a 16 kHz y salida de tokens de texto. Sobre esa base se anaden adaptadores LoRA de bajo rango. Segun la model card, el adaptador de cingales tiene rango 32 y el de code-switching rango 16, con `lora_alpha` fijado en 32. Ambos adaptadores se actualizaron de forma conjunta ("joint") durante la fase de entrenamiento en code-switching, en lugar de entrenarse por separado y combinarse a posteriori.

La carga documentada por el autor requiere descargar los dos adaptadores, envolver el modelo base con `PeftModel`, cargar el adaptador `si` y el adaptador `cs`, y combinarlos mediante `add_weighted_adapter` con pesos `[1.0, 1.0]` y `combination_type="cat"` (concatenacion), seguido de `merge_and_unload`. La semilla indicada es 456 y la seleccion de checkpoint es "best". No se especifica en la informacion disponible el numero de tokens de audio de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni ningun mecanismo de decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla en cingales (`si`) sobre audio de 16 kHz.
- Reconocimiento automatico del habla en ingles (`en`) heredado del modelo base y del adaptador de code-switching.
- Transcripcion de habla con alternancia de codigo cingales-ingles dentro de una misma emision.
- Salida de texto con marcas de tiempo a nivel de segmento, segun la configuracion de generacion que se aplique (capacidad heredada de Whisper).
- Seleccion de idioma y de parametros de generacion por parte del usuario, tal y como indica la model card.
- No soporta tool calling ni function calling: es un modelo de ASR, no un modelo de lenguaje conversacional.
- No soporta uso como agente ni razonamiento multi-paso.
- No soporta vision, audio comprensivo, traduccion declarada ni generacion multimodal mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y entrevistas en cingales: el modelo convierte audio a 16 kHz en texto, y al estar basado en Whisper-small puede ejecutarse en hardware modesto, lo que facilita el procesamiento por lotes de archivos largos troceados en ventanas de 30 s.
- Subtitulado de contenido audiovisual de Sri Lanka: la salida de Whisper incluye informacion temporal por segmento, lo que permite generar subtitulos sincronizados para videos donde se mezclan frases en cingales e ingles.
- Analitica de centros de contacto: transcripcion de conversaciones de atencion al cliente en las que el agente alterna cingales e ingles, para posteriormente aplicar busqueda por palabras clave, analisis de sentimiento o control de calidad.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de grabaciones historicas o podcasts para construir un indice de texto consultable.
- Asistentes de voz locales: transcripcion en el dispositivo (edge) gracias al reducido tamano del modelo base, sin enviar audio a servicios en la nube.
- Investigacion en ASR con code-switching: reproduccion de experimentos con semilla fija (456) y comparacion de estrategias de adaptadores LoRA (rangos 16 y 32 combinados mediante concatenacion).
- Accesibilidad: generacion de transcripciones en directo para personas con discapacidad auditiva en entornos bilingues cingales-ingles.
- Documentacion clinica o legal dictada: transcripcion de notas de voz en cingales cuando se combine con un modelo base verificado y con licencia adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, CER ni comparaciones con otros sistemas, y no se han encontrado evaluaciones externas. El repositorio registra 0 descargas y 0 "likes", por lo que tampoco existen datos de uso que permitan inferir el rendimiento.

## Requisitos de hardware

- VRAM estimada para el modelo base fusionado, segun el tamaño de openai/whisper-small (aproximadamente 244 M de parametros): en torno a 1 GB en fp32, 0,5 GB en fp16/bf16 y 0,25 GB en int8. Los adaptadores LoRA anaden una cantidad de parametros no especificada, pero en rangos 16-32 sobre este tamano de base suelen representar decenas de MB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 3060, T4 o superiores. Una A100 o H100 solo tendria sentido para procesamiento por lotes a gran escala.
- Compatibilidad con GPU de consumo: si. El modelo base cabe con holgura en cualquier GPU de consumo de los ultimos anos, e incluso puede ejecutarse en CPU con una penalizacion de latencia.
- Opciones de despliegue: transformers junto con peft, tal y como documenta el autor, con posterior `merge_and_unload` para obtener un modelo Whisper estandar. Una vez fusionado, el modelo puede convertirse a formatos optimizados para ASR, como CTranslate2 (usado por faster-whisper) o whisper.cpp. Ollama, llama.cpp y vLLM estan orientados a modelos de lenguaje y no cubren el pipeline de Whisper sin conversiones adicionales; no se documenta soporte nativo del adaptador PEFT en esas herramientas.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo real ni de factor de tiempo real en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-small-joint-si32-cs16-seed456 | Adaptadores sobre base de ~244 M | Ventanas de 30 s | Cingales e ingles (con code-switching) | No disponible | safetensors (LoRA/PEFT) |
| openai/whisper-small | ~244 M | Ventanas de 30 s | Multilingue (aproximadamente 99 idiomas) | MIT | safetensors, GGUF y conversiones derivadas |
| openai/whisper-medium | ~769 M | Ventanas de 30 s | Multilingue | MIT | safetensors y conversiones derivadas |
| openai/whisper-large-v3 | ~1550 M | Ventanas de 30 s | Multilingue | MIT | safetensors y conversiones derivadas |

No se han encontrado en la informacion proporcionada otros adaptadores publicos comparables de cingales o de code-switching cingales-ingles, por lo que la comparativa se limita a los modelos base de la familia Whisper. Los datos de parametros, idiomas y licencia de las tres filas correspondientes a OpenAI proceden de la documentacion publica de dichos modelos base y no estan verificados en la informacion suministrada sobre este adaptador. La ventaja potencial del adaptador es su especializacion en cingales y code-switching con un coste de parametros adicional minimo; su desventaja, la ausencia de licencia declarada y de cualquier metrica publicada.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no puede asumirse permiso para uso comercial, redistribucion o modificacion. Cualquier uso en produccion queda bloqueado hasta aclarar este punto.
- Se trata de un modelo anonimo de material suplementario para revision por pares: no hay autoria identificable, ni politica de mantenimiento, ni garantia de que el repositorio permanezca publicado.
- Ausencia total de benchmarks: no hay WER ni CER publicados, ni para cingales ni para code-switching, por lo que no puede estimarse la calidad real de las transcripciones.
- Dependencia de la activacion conjunta: la model card exige cargar ambos adaptadores y combinarlos con peso 1.0 mediante concatenacion. Usar solo uno de ellos, o pesos distintos, produce una configuracion no validada.
- El adaptador esta ligado a Whisper-small: no es portable a Whisper-medium o Whisper-large sin reentrenamiento.
- Idiomas limitados a cingales e ingles. El comportamiento en otros idiomas no esta documentado, aunque el modelo base sea multilingue.
- Riesgo de alucinacion inherente a Whisper: en segmentos de silencio, ruido o audio musical, el decoder puede generar texto plausible pero inexistente. Requiere deteccion de voz (VAD) previa en produccion.
- Ventana de audio fija de 30 s en el encoder: el audio largo debe trocearse y recomponerse, con el riesgo de cortar palabras en los limites de segmento.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni la distribucion de acentos, genero, edad o variedades dialectales del cingales, por lo que no puede evaluarse el sesgo sistematico.
- Tamano del repositorio declarado como 0.0 GB y cero descargas: conviene verificar la integridad de los ficheros antes de integrarlos en cualquier flujo automatizado.
- No apto para usos de alto riesgo (transcripcion medica, legal o de emergencias) sin validacion humana y sin un modelo base con licencia verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-joint-si32-cs16-seed456
- Modelo base: https://huggingface.co/openai/whisper-small
- Libreria PEFT: https://github.com/huggingface/peft
- Repositorio de referencia de Whisper en OpenAI: https://github.com/openai/whisper
- Articulo de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de Transformers para Whisper: https://huggingface.co/docs/transformers/model_doc/whisper

Nota sobre la busqueda web: los resultados obtenidos corresponden al colectivo de hacktivistas Anonymous y a una marca de calzado homonima, y no guardan ninguna relacion con este modelo. No se han encontrado en la busqueda enlaces relevantes (papers, blogs, repositorios o demos) asociados al adaptador.
