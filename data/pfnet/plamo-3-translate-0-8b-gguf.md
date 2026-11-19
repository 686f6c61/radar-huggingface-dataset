# pfnet/plamo-3-translate-0.8b-GGUF

## Resumen

PLaMo 3 Translate 0.8B GGUF es la version cuantizada en formato GGUF del modelo de traduccion especializado PLaMo 3 Translate 0.8B, desarrollado por Preferred Networks (PFN). El modelo esta disenado especificamente para tareas de traduccion entre 53 idiomas y se distribuye listo para su uso con llama.cpp, lo que facilita el despliegue en entornos locales y con recursos limitados.

El modelo parte de PLaMo 3 NICT, un modelo preentrenado fruto de la investigacion conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japon, y se entreno adicionalmente con decenas de miles de millones de tokens de datos orientados a traduccion. Con 890 millones de parametros y una longitud de contexto de entrenamiento de 32.768 tokens (entrada y salida combinadas), esta pensado para traduccion de pasajes largos en una sola pasada.

Su relevancia actual radica en que ofrece calidad de traduccion de primer nivel en un tamano muy reducido, con soporte para contexto circundante y glosarios, y con la posibilidad de elegir entre estilo llano y cortes para la salida en japones. La version GGUF permite ejecutarlo en hardware de consumo, algo poco habitual en modelos de traduccion de calidad comparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de lenguaje especializado en traduccion, basado en PLaMo 3 NICT) |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrada y salida combinadas, maximo durante entrenamiento) |
| Tipos de cuantizacion | GGUF (multiples niveles de cuantizacion para llama.cpp; niveles concretos no disponibles en la informacion proporcionada) |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (PLaMo Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer de tipo decoder-only, heredada de PLaMo 3 NICT, el modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizo un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traduccion, lo que especializa el modelo para la tarea de traduccion multilingue. La longitud maxima de entrenamiento fue de 32.768 tokens considerando entrada y salida en conjunto, lo que permite traducir pasajes largos en una sola pasada siempre que la suma de entrada y salida no supere ese limite.

La informacion disponible no detalla la composicion exacta del dataset de entrenamiento, el uso de tecnicas de RLHF o DPO, ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La model card menciona que el modelo puede tener en cuenta el contexto circundante y un glosario, y que permite seleccionar entre estilo llano y cortes para la salida en japones, lo que sugiere un entrenamiento orientado a controlar el registro y la terminologia de la traduccion.

## Capacidades

- Traduccion entre 53 idiomas, incluyendo pares como japones-ingles, japones-espanol, ingles-chino, entre otros.
- Traduccion de pasajes largos en una sola pasada, hasta un maximo combinado de 32.768 tokens de entrada y salida.
- Uso de contexto circundante para mejorar la coherencia de la traduccion.
- Soporte de glosarios para controlar la terminologia de la salida.
- Seleccion de estilo de salida en japones: llano o cortes.
- Capacidad conversacional (tag `conversational`), lo que permite su uso en formatos de chat.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se dispone de informacion sobre soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica multilingue: el modelo puede procesar secciones completas de documentacion (hasta 32.768 tokens combinados) manteniendo coherencia terminologica gracias al soporte de glosarios, lo que resulta adecuado para equipos que mantienen documentacion en varios idiomas.
- Localizacion de interfaces y contenidos web: con 53 idiomas soportados y un tamano de 0.8B, puede desplegarse en servidores modestos para traducir cadenas de texto y contenidos de forma continua, integrado en pipelines de localizacion.
- Atencion al cliente multilingue: su capacidad conversacional y su ventana de contexto permiten gestionar conversaciones multi-turno y traducir mensajes de usuarios en tiempo real en centros de soporte con cobertura internacional.
- Traduccion de articulos y publicaciones largas: la ventana de 32.768 tokens permite traducir articulos completos en una sola pasada, reduciendo la perdida de contexto que se produce al dividir el texto en fragmentos pequenos.
- Procesamiento por lotes en entornos con recursos limitados: al ser un modelo de 0.8B en formato GGUF, puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace viable para tareas de traduccion masiva en infraestructura economica.
- Investigacion en traduccion automatica: su licencia permite uso academico sin registro previo, y su tamano reducido facilita experimentos de evaluacion, comparacion de estilos y analisis de calidad en entornos de investigacion.
- Traduccion de correspondencia y documentacion interna en empresas: el soporte de glosarios y la eleccion de estilo en japones lo hacen util para organizaciones que necesitan mantener un tono consistente en comunicaciones internas y externas.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate ofrece calidad de traduccion de primer nivel tanto en japones-ingles como en traduccion multilingue, y que incluso el modelo de 2B supera a los LLM especializados en traduccion comparados en todas las metricas de la figura incluida en la model card. Las metricas empleadas son:

- Calidad japones-ingles: media de PFTB, SaaS y WMT24++ COMET-22.
- Traduccion entre japones y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Traduccion entre ingles y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas seleccionados para la evaluacion FLORES+ son: japones, ingles, arabe, indonesio, italiano, neerlandes, coreano, espanol, tailandes, chino (simplificado y tradicional), aleman, frances, vietnamita y ruso.

No se han publicado en la informacion disponible los valores numericos concretos de los benchmarks para el modelo de 0.8B, por lo que no se presentan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 890 millones de parametros, las cuantizaciones GGUF de 4 bits suelen ocupar del orden de 0,5-0,7 GB, pero el dato exacto por nivel de cuantizacion no figura en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es apto para GPUs de consumo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: si, por el tamano del modelo (0.8B) y el formato GGUF; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); la model card menciona tambien variantes MLX-4bit en otro repositorio para Apple Silicon. No se confirma soporte de vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B GGUF | 0,89B | 32.768 tokens (entrada+salida) | 53 | plamo-community-license | GGUF |
| PLaMo 3 Translate 2B | no disponible | no disponible | 53 | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona comparaciones con TranslateGemma y HY-MT2 en la figura de benchmarks, pero no se proporcionan sus especificaciones en la informacion disponible. PLaMo 3 Translate se ofrece en cuatro tamanos (0.8B, 2B, 8B y 31B), lo que permite elegir el equilibrio entre calidad y coste computacional dentro de la misma familia.

## Limitaciones y advertencias

- La licencia PLaMo Community License permite uso personal, educativo y no comercial sin registro previo, pero el uso comercial esta sujeto a condiciones adicionales que deben consultarse en el enlace de la licencia.
- El modelo esta especializado en traduccion; no se ha disenado como modelo de proposito general y no se dispone de informacion sobre su rendimiento en otras tareas.
- La ventana de 32.768 tokens es el maximo combinado de entrada y salida durante el entrenamiento; los textos mas largos deben dividirse, lo que puede afectar a la coherencia en documentos muy extensos.
- No se dispone de informacion sobre sesgos conocidos ni sobre tasas de alucinacion en la informacion proporcionada.
- No se detallan los niveles de cuantizacion GGUF disponibles ni su impacto exacto en la calidad; la model card incluye tablas de precision por formato, pero los valores no estan disponibles en la informacion proporcionada.
- El rendimiento puede variar segun el par de idiomas; la evaluacion publicada se centra en 15 idiomas seleccionados de los 53 soportados.
- No se confirma soporte de tool calling ni de funciones de agente, por lo que no debe asumirse su uso en pipelines que dependan de estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Modelo base (BF16): https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Blog tecnico: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japones: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF/blob/main/README_ja.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
