# cyberalien/CySearchAssist-CLAP-0.5B

## Resumen

CySearchAssist-CLAP-0.5B es un modelo de lenguaje pequeno y multilingue desarrollado por MrMybal (CyberAlien) mediante ajuste fino supervisado de Qwen2.5-0.5B-Instruct. Su unica funcion es reescribir peticiones informales de busqueda de sonido en descripciones estructuradas en ingles, pensadas para alimentar un sistema de busqueda semantica de audio basado en CLAP. No es CLAP, no genera audio y no analiza audio: solo prepara texto para otro motor de embeddings.

El modelo tiene 494.032.768 parametros (aproximadamente 0,5B) y se distribuye exclusivamente como un unico fichero GGUF en cuantizacion Q8_0 de 531 MB. Soporta cinco idiomas de entrada (ingles, frances, espanol, aleman e italiano) y devuelve una salida JSON con un prompt principal para CLAP, tres variaciones alternativas, categorias y etiquetas sugeridas, y una lista de conceptos excluidos.

Su relevancia actual es acotada pero concreta: permite incorporar refinamiento semantico de consultas de audio en flujos locales y sin conexion, con un coste de hardware minimo. Esta disenado para integrarse con el plugin CyMetaSound, que lo usa en la funcion AI Refine de la biblioteca, ejecutandose mediante un runtime llama.cpp compatible. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (unico formato publicado) |
| Idiomas soportados | ingles, frances, espanol, aleman, italiano |
| Licencia | Apache 2.0 (conservando la licencia subyacente de Qwen) |
| Formato de pesos | GGUF (Q8_0); el recuento de parametros se ha verificado a partir de safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de aproximadamente 0,5B parametros. Sobre esa base se realizo un ajuste fino con LoRA y posterior fusion del adaptador (adapter merge), segun el informe de entrenamiento que acompana a la publicacion. Ese informe identifica la distribucion de entrenamiento como `unsloth/Qwen2.5-0.5B-Instruct`. La tarea aprendida es de reescritura de consultas: transformar una peticion coloquial en un objeto JSON con campos `clap_prompt`, `variations`, `suggested_categories`, `suggested_tags` y `exclude`.

El contrato de uso es estricto: se debe emplear el system prompt exacto incluido en `prompt/system.txt`, enviar la peticion original como mensaje de usuario, usar decodificacion greedy (temperatura 0), un maximo de 256 tokens nuevos y la plantilla de chat de Qwen (incluida en los metadatos del GGUF). La version publicada es el ajuste fusionado convertido a Q8_0 GGUF con llama.cpp b11115. No se proporcionan datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO. Los pesos en precision completa, el adaptador LoRA y los datos de entrenamiento no forman parte de esta publicacion.

## Capacidades

- Reescritura de consultas de busqueda de sonido: convierte peticiones informales en un JSON estructurado listo para un motor CLAP.
- Generacion de variaciones: produce tres descripciones alternativas en ingles junto al prompt principal.
- Sugerencia de categorias y etiquetas de ranking, tratadas como pistas opcionales y no como filtros duros.
- Deteccion de exclusiones: extrae conceptos negados por el usuario (por ejemplo, "sans musique" / "sin musica") al campo `exclude`.
- Multilingue de entrada: acepta peticiones en ingles, frances, espanol, aleman e italiano y las normaliza a descripciones en ingles.
- Salida conversacional compatible con la plantilla de chat de Qwen y con endpoints compatibles con OpenAI segun los tags del repositorio.
- Capacidad de ejecucion local: el unico artefacto es un GGUF que se ejecuta en runtimes llama.cpp, incluidos builds Vulkan.

No dispone de tool calling generico, agentes, razonamiento multi-paso, vision ni audio. El propio autor indica explicitamente que no es un asistente general, ni un generador de audio, ni un modelo de embeddings de audio, ni una autoridad factual.

## Casos de uso

- Refinamiento de busquedas en CyMetaSound: el plugin usa el modelo en la funcion AI Refine de la biblioteca para transformar una consulta coloquial en un `clap_prompt` optimizado antes de enviarlo al motor de embeddings. Es el escenario para el que fue disenado.
- Busqueda semantica de librerias de efectos de sonido (SFX): un disenador escribe "impacto metalico en un hangar, sin musica" y el modelo lo convierte en una descripcion en ingles mas adecuada para recuperacion vectorial.
- Postproduccion de audio y video: integrado en un panel de busqueda local, agiliza la localizacion de sonidos en bibliotecas grandes sin depender de servicios en la nube.
- Catalogacion y curado de bibliotecas de audio: las categorias y etiquetas sugeridas pueden emplearse como pistas de indexacion o ranking, siempre con revision humana.
- Flujos de trabajo con privacidad estricta: al ejecutarse en local (via llama.cpp con backend Vulkan o CPU) y no enviar audio al modelo, encaja en entornos donde no se permite subir material a terceros.
- Aplicaciones de diseno sonoro asistido: normalizacion multilingue de peticiones de un equipo internacional, traduciendo consultas en frances, espanol, aleman o italiano a un vocabulario ingles consistente para el buscador.
- Prototipos de busqueda multimodal de bajo coste: sirve como componente de preprocesado de texto en pipelines que combinan un reescritor pequeno con un modelo de embeddings de audio separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la conversion a Q8 ha superado pruebas de humo (smoke tests) pero no ha sido evaluada para calidad de recuperacion amplia, y que las estadisticas del checkpoint original no deben presentarse como resultados medidos de esta version cuantizada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,6-1 GB con el GGUF Q8_0 de 531 MB mas el overhead de contexto y del runtime (estimacion orientativa, no confirmada por el autor).
- Cabe con holgura en cualquier GPU de consumo: GTX/RTX series (por ejemplo, RTX 3060, 4060, 4090), e incluso en GPU integradas con suficiente memoria compartida.
- Ejecucion posible en CPU unicamente; el modelo es lo bastante pequeno para entornos tipo Raspberry Pi o portatiles sin GPU dedicada.
- GPU de centro de datos (A100, H100) no aportan ventaja relevante por el tamano minimo del modelo.
- Despliegue: runtimes llama.cpp, en particular `llama-server`; el autor recomienda un build Vulkan para offload en GPU sin necesidad de CUDA. Compatible con endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponible. No se ofrecen cifras oficiales de tokens por segundo ni de latencia por peticion. El contrato de uso limita la generacion a 256 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CySearchAssist-CLAP-0.5B | ~0,494B | no disponible | Reescritura de consultas de audio a JSON para CLAP | Apache 2.0 | GGUF Q8_0 en HuggingFace |
| Qwen2.5-0.5B-Instruct (base) | ~0,494B | no disponible en la informacion aportada | Asistente general de proposito multiple | Apache 2.0 | safetensors y GGUF en HuggingFace |
| Otros reescritores de consultas para CLAP | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables especificos de la misma tarea en la informacion proporcionada. La comparacion con la base es estructural (mismo backbone); el ajuste fino especializa la tarea a costa de renunciar a la polivalencia del modelo original.

## Limitaciones y advertencias

- No es un asistente general, ni un generador de audio, ni un modelo de embeddings de audio, ni una fuente de verdad factual. Solo prepara texto para un buscador externo.
- Puede omitir restricciones o inventar detalles, especialmente ante faltas de ortografia graves y ante nombres de armas o de modelos concretos. Se recomienda mantener la consulta reescrita visible y editable.
- Solo maneja cinco idiomas de entrada (en, fr, es, de, it); no hay garantia de comportamiento correcto en otros idiomas.
- El autor advierte de que las exclusiones solo deben mantenerse cuando la peticion contiene realmente una negacion, y que nunca deben anadirse palabras excluidas a un caption de busqueda positivo. La revision humana de la salida es parte del flujo previsto.
- Las categorias y etiquetas sugeridas son pistas, no filtros; el modelo desconoce la taxonomia de la biblioteca del usuario y las categorias ausentes deben ignorarse.
- Una respuesta fallida o malformada deberia provocar un fallback a la peticion original.
- La version publicada es una conversion Q8_0 sometida a smoke tests, no evaluada de forma amplia en calidad de recuperacion. No se ofrecen estadisticas de rendimiento medidas para esta cuantizacion.
- Los pesos en precision completa, el adaptador LoRA y los datos de entrenamiento no se incluyen en la publicacion.
- Licencia Apache 2.0: permite redistribucion, modificacion y uso comercial bajo sus terminos, conservando la licencia subyacente de Qwen. No concede derechos sobre bibliotecas de audio, modelos de terceros, marcas registradas ni sobre el plugin propietario CyMetaSound.
- Los modelos de embeddings (CLAP/LAION u otros) son descargas opcionales e independientes, sujetas a sus propias licencias. Sin este modelo, la busqueda ordinaria del plugin sigue funcionando.
- No se envia audio al modelo en ningun caso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyberalien/CySearchAssist-CLAP-0.5B
- Descarga directa del GGUF Q8_0: https://huggingface.co/cyberalien/CySearchAssist-CLAP-0.5B/resolve/main/CySearchAssist-CLAP-0.5B-v1-Q8_0.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Distribucion de entrenamiento: https://huggingface.co/unsloth/Qwen2.5-0.5B-Instruct
- Fichero de licencia (en el repositorio): LICENSE en https://huggingface.co/cyberalien/CySearchAssist-CLAP-0.5B
- Fichero NOTICE (en el repositorio): NOTICE en https://huggingface.co/cyberalien/CySearchAssist-CLAP-0.5B
- Prompt de sistema: prompt/system.txt en https://huggingface.co/cyberalien/CySearchAssist-CLAP-0.5B
- Runtime recomendado: llama.cpp (build Vulkan compatible)
- Plugin de integracion: CyMetaSound (no enlazado en la informacion disponible)
