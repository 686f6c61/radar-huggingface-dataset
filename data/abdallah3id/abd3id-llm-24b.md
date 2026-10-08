# abdallah3id/ABD3ID-LLM-24B

## Resumen

ABD3ID-LLM-24B (nombre de proyecto: ABDEID-Islamic AI) es un modelo de lenguaje de 24 000 millones de parámetros desarrollado por Abdallah Eid (usuario `abdallah3id`), orientado a conocimiento islámico y lengua árabe desde la perspectiva de Ahl al-Sunna wa-l-Jama'a. No se trata de un entrenamiento desde cero: la model card indica explícitamente que parte de los pesos de un modelo preentrenado y aplica un ajuste adicional completo (no LoRA) mediante Hugging Face Transformers. El identificador de versión es `abdallah3id/ABD3ID-LLM-24B` y el repositorio ocupa 55,6 GB, con 18 fragmentos en formato `safetensors` más el índice `model.safetensors.index.json`.

El interés del modelo reside en su nicho: es un ajuste especializado en dominio religioso y arabófono, un segmento con pocos modelos abiertos de este tamaño y licencia permisiva. La licencia declarada es Apache 2.0 y el repositorio se publica bajo la librería `transformers`, con etiquetas que incluyen `qwen3_5` e `image-text-to-text`, lo que sugiere una posible base de la familia Qwen 3.5 y capacidades multimodales, aunque ninguno de esos dos extremos está documentado ni confirmado en la model card.

La relevancia es limitada por su madurez: el repositorio registra 0 descargas y 0 likes, la model card no publica arquitectura, longitud de contexto, composición del dataset ni benchmarks reproducibles, y el propio autor advierte de que el modelo base debe identificarse y documentarse antes de redistribuir los pesos. El único dato de evaluación es un 78 % en un test interno sin metodología publicada, por lo que no es comparable con ninguna métrica estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; la etiqueta `qwen3_5` sugiere una base de la familia Qwen 3.5, sin confirmar) |
| Parametros totales | 24B (segun el identificador del repositorio; el autor remite a `config.json` para confirmar el numero exacto) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en `safetensors` (18 fragmentos). No hay GGUF, GPTQ ni AWQ publicados |
| Idiomas soportados | en, fr, es, it, pt, zh, ar, ru (con enfoque principal en arabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards + `model.safetensors.index.json`) |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 55,6 GB |
| Fecha de publicacion | 2026-10-07 (ultima actualizacion: 2026-10-08) |
| Modelo base | no disponible; la model card indica que debe determinarse a partir de los registros de entrenamiento |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni se detallan mecanismos de atención, número de capas, dimensión oculta o estrategia de tokenización. La única pista estructural es la etiqueta `qwen3_5` asociada al repositorio, que apuntaría a una base de la familia Qwen 3.5, pero el propio autor no la confirma y afirma que el modelo base anterior "debe determinarse por su nombre, versión y licencia a partir del registro de entrenamiento y los archivos del modelo". Tampoco se documenta la longitud de contexto efectiva.

En cuanto al entrenamiento, la model card indica que se partió de pesos preentrenados y se aplicó un "entrenamiento adicional y ajuste de pesos" con datos islámicos preparados para el proyecto, usando Hugging Face Transformers como marco. El autor afirma que se trata de un ajuste completo de pesos y no de LoRA, aunque no se publican hiperparámetros, número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF, DPO o similares. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). La única cifra de rendimiento es un 78 % en un test interno cuya metodología no se publica, y el propio autor advierte que esa cifra no demuestra superioridad frente a otro modelo ni constituye una medida de precisión general.

## Capacidades

- Generacion de texto conversacional en arabe y en los otros siete idiomas declarados (en, fr, es, it, pt, zh, ru), con foco declarado en conocimiento islamico.
- Respuestas sobre conocimiento islamico desde la perspectiva de Ahl al-Sunna wa-l-Jama'a, con instruccion explicita de exponer ese punto de vista cuando sea necesario.
- Descripcion de otras corrientes islamicas sin insulto ni incitacion, segun la orientacion declarada del proyecto, y distincion entre la salida del modelo y el texto religioso original.
- El pipeline declarado es `image-text-to-text`, lo que implicaria capacidad de entrada de imagen y texto, aunque la model card no documenta ni demuestra ninguna capacidad de vision.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.
- Generacion de codigo y matematicas: no disponible (no se documenta ni se evalua).

## Casos de uso

- Asistente de consultas sobre fiqh y doctrina: el modelo esta ajustado para responder preguntas de conocimiento islamico desde una perspectiva sunni declarada, con instruccion de citar el punto de vista adoptado y distinguirlo del texto revelado. Es util como capa de primera respuesta en aplicaciones de contenido religioso.
- Generacion de contenido educativo en arabe: redaccion de resumenes, articulos divulgativos o guiones para materiales de aprendizaje religioso en arabe, aprovechando el ajuste de dominio y el soporte multilingue para traducciones de apoyo.
- Comparacion descriptiva de escuelas y corrientes: el proyecto declara como objetivo describir diferencias entre escuelas sunnies y chiies distinguiendo la diversidad interna de cada una, lo que encaja en herramientas de divulgacion comparada con revision humana obligatoria.
- Traduccion asistida arabe-europeo: el modelo declara ocho idiomas (arabe, ingles, frances, espanol, italiano, portugues, chino y ruso), por lo que puede emplearse como motor de traduccion de apoyo en flujos arabe-espanol o arabe-frances, siempre con validacion humana.
- Atencion al publico en mezquitas, centros culturales u ONG: gestion de preguntas frecuentes de horarios, actividades y orientacion general, con el matiz religioso delegado a fuentes verificadas. La ausencia de datos de contexto publicados obliga a medir la ventana real antes de desplegar conversaciones multi-turno largas.
- Filtrado y clasificacion de textos religiosos: uso del modelo como clasificador o etiquetador de contenido islamico en arabe dentro de un pipeline de curación documental, apoyandose en su ajuste de dominio frente a modelos generalistas del mismo tamano.
- Base para investigacion sobre sesgo doctrinal: al ser un modelo de dominio con una perspectiva confesional declarada, resulta util como objeto de estudio en trabajos de evaluacion de sesgo y alineacion en modelos especializados, comparandolo con modelos generalistas multilingues.
- Prototipado multimodal: si finalmente se confirma la capacidad `image-text-to-text` declarada en los metadatos, podria emplearse para extraer o describir texto arabe en imagenes (OCR asistido) dentro de flujos de digitalizacion documental, aunque esta capacidad no esta documentada ni validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, AraBench, ArabicMMLU u otros) en la informacion disponible. El unico dato reportado es el siguiente, y no es verificable ni comparable:

| Metrica | Valor | Naturaleza del dato |
|---|---|---|
| Test interno del proyecto | 78 % | Reportado por el autor; tamano de muestra, definicion de exito, composicion de preguntas y calculo no publicados |
| Objetivo de equilibrio en la exposicion de escuelas | >= 80 % | Objetivo propuesto, no medido |
| Benchmarks publicos (MMLU, GSM8K, HumanEval, ArabicMMLU) | no disponible | No publicados |

El propio autor advierte en la model card que esta cifra no demuestra que el modelo supere a otro, no representa una precision general y no constituye una validacion cientifica, y que no deben usarse adjetivos comparativos sin un test reproducible y una comparacion justa.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 24B parametros; no confirmado por el autor):
  - bf16 / fp16: en torno a 48 GB solo para pesos, mas cache KV. Requiere una A100 80 GB, H100 80 GB o dos GPU de 40-48 GB.
  - int8: en torno a 24 GB de pesos, mas cache KV. Ajustado en RTX 4090 (24 GB) y comodo en A6000 48 GB o L40S.
  - 4 bits (NF4, GPTQ, AWQ): en torno a 12-15 GB de pesos. Cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB justo) y similares, con margen limitado para contexto largo.
- GPU recomendadas: A100 80 GB o H100 80 GB para precision completa y servicio concurrente; A6000/L40S para cuantizacion de 8 bits; RTX 4090 o RTX 3090 para cuantizacion de 4 bits en uso individual.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits, en tarjetas de 16 GB o mas; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: al publicarse solo `safetensors`, el camino directo es transformers, vLLM, TGI o SGLang tras convertir pesos. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que el repositorio no incluye.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo, TTFT ni resultados de concurrencia.
- Nota de advertencia: el modelo base no esta identificado, por lo que la compatibilidad con kernels optimizados y con las recetas de cuantizacion existentes no puede darse por sentada.

## Comparativa con modelos similares

La comparativa se ofrece a titulo orientativo; los datos del modelo objeto de la ficha provienen de su repositorio y los de los alternativas son especificaciones publicas ampliamente conocidas, no verificadas en el contexto de esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ABD3ID-LLM-24B | 24B (segun id) | no disponible | Apache 2.0 | Islamico / arabe, ajuste sobre base no identificada | HuggingFace, 0 descargas, sin benchmarks publicos |
| Mistral Small 3 / 3.1 | 24B | 128k | Apache 2.0 | Generalista multilingue, con function calling | Ampliamente desplegado, versiones GGUF y cuantizadas |
| Gemma 3 27B | 27B | 128k | Licencia Gemma (uso condicionado) | Generalista multilingue, multimodal | Ampliamente desplegado |
| Aya Expanse 32B | 32B | 128k | CC-BY-NC 4.0 (no comercial) | Multilingue con enfasis en arabe y otras lenguas | Pesos abiertos con restriccion comercial |
| Qwen 2.5 / 3 en rango 14B-32B | 14B-32B | 32k-128k | Apache 2.0 (segun variante) | Generalista multilingue, fuerte en codigo y matematicas | Ecosistema amplio, GGUF, vLLM, Ollama |

Frente a estas alternativas, ABD3ID-LLM-24B solo aporta ventaja potencial en especializacion tematica islamica; carece de benchmarks, de contexto declarado y de formatos cuantizados listos para produccion.

## Limitaciones y advertencias

- Sesgo doctrinal por diseno: el modelo esta ajustado para responder por defecto desde la perspectiva de Ahl al-Sunna wa-l-Jama'a y para declarar ese punto de vista. No es un modelo neutral y no debe presentarse como fuente imparcial en contextos academicos o interreligiosos.
- Riesgo de alucinacion elevado en dominio religioso: no hay validacion independiente, no se documenta anclaje a fuentes (RAG, citas verificables) y el propio autor indica que las salidas no son fuente de autoridad religiosa ni sustituyen a las referencias acreditadas.
- Modelo base no identificado: la model card exige determinar el modelo preentrenado de origen, su version y su licencia antes de completar la ficha o redistribuir los pesos. Esto genera incertidumbre juridica y tecnica, porque la licencia final depende de la licencia de la base.
- Evaluacion no reproducible: el 78 % reportado carece de tamano de muestra, definicion de exito, fecha, version del modelo, separacion entre entrenamiento y test y linea base. No debe citarse como metrica de calidad.
- Ausencia de datos de arquitectura y contexto: no se puede planificar el despliegue en produccion sin conocer la ventana de contexto real ni la arquitectura, lo que impide elegir estrategias de atencion, paralelismo o cuantizacion con garantias.
- Idiomas declarados sin evaluacion: se listan ocho idiomas, pero no hay ninguna metrica por idioma; el rendimiento fuera del arabe es una incognita.
- Capacidad multimodal no confirmada: la etiqueta `image-text-to-text` figura en los metadatos, pero la model card no documenta procesador de vision, ni ejemplos, ni evaluacion. No debe asumirse soporte de imagen en produccion.
- Madurez del repositorio: 0 descargas, 0 likes y una model card mayoritariamente en arabe y truncada, con tablas que remiten a documentacion pendiente. No hay historial de versiones ni mantenimiento demostrable.
- Sin cuantizaciones oficiales: no hay GGUF, GPTQ ni AWQ publicados, lo que obliga a conversion propia y anade riesgo de degradacion no medida.
- Uso comercial: la licencia declarada es Apache 2.0, lo que en principio permitiria uso comercial, pero esa licencia corresponde a los pesos publicados y no resuelve la posible licencia del modelo base no identificado. Se recomienda aclarar la procedencia antes de explotarlo comercialmente.
- Contenido sensible: por su ambito tematico, conviene desplegarlo con filtros, avisos de que las respuestas no son dictamenes religiosos y supervision humana en cualquier aplicacion publica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/abdallah3id/ABD3ID-LLM-24B
- Perfil de GitHub del desarrollador: https://github.com/ABDEID-dev
- Paper tecnico: no disponible
- Blog o articulo de presentacion: no disponible
- Repositorio de codigo o recetas de despliegue: no disponible
- Demo o Space: no disponible
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo (unicamente listados de dominios no relacionados). No hay cobertura externa, notas de prensa ni analisis independientes disponibles.
