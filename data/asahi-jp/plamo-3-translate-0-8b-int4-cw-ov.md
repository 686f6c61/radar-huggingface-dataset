# asahi-jp/plamo-3-translate-0.8b-int4-cw-ov

## Resumen

PLaMo 3 Translate 0.8B es un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN). Se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. La ficha que nos ocupa no es el modelo original, sino una versión cuantizada y convertida a formato OpenVINO IR por el usuario `asahi-jp`, pensada para inferencia eficiente en CPU y dispositivos Intel.

El modelo base tiene 0,8 mil millones de parámetros y está orientado a tareas de traducción automática con calidad de referencia según su desarrollador. La versión aquí descrita aplica cuantización INT4 solo de pesos, asimétrica y por canal (*channelwise*, `group_size=-1`), mediante Optimum-Intel y NNCF, lo que reduce el repositorio a 0,78 GB. Esto la hace apta para despliegues en hardware modesto, incluidos escenarios de ejecución local sin GPU dedicada.

Su relevancia actual radica en la combinación de un modelo de traducción pequeño y especializado con un formato de despliegue ligero (OpenVINO INT4), lo que permite integrar traducción de calidad en aplicaciones de borde, entornos sin conectividad y demostraciones en tiempo real sobre dispositivos de consumo. La licencia es la PLaMo Community License, que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: PLaMo 3 NICT, transformer preentrenado) |
| Parametros totales | 0,8 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrica solo de pesos, por canal (INT4_ASYM, group_size=-1) |
| Idiomas soportados | no disponible (modelo orientado a traduccion, con enfasis en japones segun los ejemplos de la model card) |
| Licencia | PLaMo Community License |
| Formato de pesos | OpenVINO IR (repositorio de 0,78 GB) |

## Arquitectura y entrenamiento

El modelo original, PLaMo 3 Translate 0.8B, es un LLM especializado en traducción construido sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica la arquitectura interna más allá de tratarse de un modelo de lenguaje preentrenado.

La versión de este repositorio no altera la arquitectura: aplica cuantización INT4 solo de pesos con NNCF a través de Optimum-Intel y exporta el resultado a OpenVINO IR. La cuantización es asimétrica y por canal, lo que preserva mejor la precisión que una cuantización por tensor en modelos pequeños. El autor indica que la conversión se probó con transformers 5.15.0, optimum-intel 2.3.0.dev0, OpenVINO 2026.4.1 y NNCF 3.3.0. El repositorio incluye código personalizado (`custom_code`), por lo que es necesario `trust_remote_code=True` al cargarlo.

## Capacidades

- Traducción automática: pipeline principal del modelo, con soporte de un parámetro `target_lang` en la plantilla de chat para especificar el idioma de destino.
- Generación de texto condicionada a plantilla de chat conversacional (roles `user`/`assistant`).
- Traducción de frases y párrafos en una sola pasada, con generación determinista (`do_sample=False`) en el ejemplo de uso.
- Ejecución en CPU y dispositivos Intel mediante OpenVINO, sin necesidad de GPU.
- Despliegue en escenarios sin conectividad: PFN documenta una demostración del modelo 0.8B traduciendo en un smartphone en modo avión.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción local en aplicaciones de escritorio: integración del modelo OpenVINO en una app de traducción que funcione sin conexión, aprovechando el tamaño reducido (0,78 GB) y la inferencia en CPU.
- Traducción en dispositivos de borde: despliegue en mini-PC, portátiles o dispositivos Intel NUC para traducir documentos o correspondencia sin enviar datos a la nube, relevante por privacidad.
- Subtitulado y traducción de reuniones en tiempo real: el modelo 0.8B está pensado para latencia baja; PFN lo demuestra traduciendo en un smartphone, lo que encaja en pipelines de transcripción más traducción.
- Atención al cliente multilingüe: traducción de mensajes entrantes y salientes en un chatbot, con el modelo ejecutándose en la misma infraestructura CPU que el resto del servicio.
- Traducción de documentación técnica y correos: uso por lotes en scripts de Python con Optimum-Intel, procesando ficheros de texto o correos con generación determinista para resultados reproducibles.
- Preprocesado en pipelines de datos: traducción de datasets o corpus hacia un idioma común antes de tareas de análisis, clasificación o búsqueda semántica, donde el coste por token importa.
- Prototipado y evaluación de traducción: al ser un modelo pequeño y cuantizado, sirve para comparar calidades y latencias antes de escalar a modelos mayores de la familia PLaMo 3 Translate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal; el modelo está pensado para CPU mediante OpenVINO. Como referencia de tamaño, los pesos INT4 ocupan aproximadamente 0,78 GB, por lo que en GPU la huella de pesos sería de ese orden más overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles en la información proporcionada. OpenVINO soporta GPU Intel integradas y discretas, pero el autor no detalla configuraciones probadas.
- CPU: cualquier procesador x86-64 compatible con OpenVINO 2026.4.1; el modelo cabe holgadamente en memoria RAM de sistemas de consumo.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, pero no hay confirmación del autor ni cifras de latencia.
- Opciones de despliegue: OpenVINO Runtime con Optimum-Intel (`OVModelForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. La model card incluye una sección de requisitos de hardware vacía.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| asahi-jp/plamo-3-translate-0.8b-int4-cw-ov | 0,8B | no disponible | OpenVINO IR INT4 | PLaMo Community License | Cuantizacion comunitaria de un modelo de traduccion |
| pfnet/plamo-3-translate-0.8b | 0,8B | no disponible | safetensors (presumible) | PLaMo Community License | Modelo original de PFN, sin cuantizar |
| Modelos de traduccion de 1B o menos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Modelo especializado en traducción: no está diseñado como asistente general y su rendimiento en otras tareas (código, matemáticas, razonamiento) no está documentado.
- Riesgo de alucinación inherente a los LLM: en traducción puede producir contenido no presente en el original, especialmente con entradas ambiguas o muy largas.
- Idiomas soportados no documentados: la información disponible no detalla la cobertura lingüística; los ejemplos de la model card usan japonés como origen e inglés como destino.
- Licencia PLaMo Community License: no es una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución.
- Requiere `trust_remote_code=True`: el repositorio incluye código personalizado, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Cuantización INT4 solo de pesos: puede degradar la calidad de traducción respecto al modelo original en frases complejas; no se publican métricas comparativas de la pérdida de calidad.
- Formato OpenVINO: no es directamente compatible con ecosistemas como llama.cpp u Ollama; limita la portabilidad a otros runtimes sin reconversión.
- Repositorio comunitario con 0 descargas y 0 likes en el momento de la consulta: no hay validación de la comunidad ni reportes de uso en producción.
- La sección de requisitos de hardware de la model card está vacía: no hay cifras oficiales de latencia, memoria ni throughput.

## Enlaces

- Repositorio Hugging Face de la versión cuantizada: https://huggingface.co/asahi-jp/plamo-3-translate-0.8b-int4-cw-ov
- Modelo base en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Licencia del modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b/blob/main/LICENSE
- Nota de prensa de PFN sobre PLaMo 3 Translate: https://www.preferred.jp/en/news/pr20261105
- Optimum-Intel: https://github.com/huggingface/optimum-intel
