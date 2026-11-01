# mradermacher/Qareed-Qwen2.5-1.5B-Poet-v2-GGUF

## Resumen

Qareed-Qwen2.5-1.5B-Poet-v2-GGUF es la colección de cuantizaciones estáticas en formato GGUF, preparada por mradermacher, del modelo Youssefx64/Qareed-Qwen2.5-1.5B-Poet-v2. El modelo base es un ajuste fino especializado en poesía árabe, construido sobre Qwen2.5-1.5B mediante la técnica QLoRA (con la librería PEFT) y entrenado sobre el dataset arbml/Ashaar_dataset, un corpus de poesía árabe clásica y moderna.

Su propósito es resolver un problema muy específico: la generación de poesía árabe, una tarea que exige dominio de métrica (arud), rima y registro literario, y en la que los modelos generales suelen rendir mal. Al tratarse de un modelo de solo 1.540 millones de parámetros con cuantizaciones desde 0,8 GB, puede ejecutarse en hardware muy modesto, incluso en portátiles sin GPU dedicada.

Es relevante para desarrolladores e investigadores que trabajen en PLN para el árabe, generación creativa en árabe o herramientas educativas y culturales, ya que ofrece un modelo ligero, con licencia Apache 2.0 y desplegable localmente vía llama.cpp u Ollama. La ventana de contexto heredada de Qwen2.5-1.5B no está documentada en la ficha disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5-1.5B), ajustado con QLoRA/PEFT |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no consta que sea MoE; se asume modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original esta en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder denso de la familia Qwen de Alibaba, y lo ajusta mediante QLoRA, una tecnica de fine-tuning eficiente en parametros que congela el modelo base y entrena adaptadores de bajo rango sobre representaciones cuantizadas. Los tags del repositorio confirman el uso de qlora y peft. El modelo base ajustado es Youssefx64/Qareed-Qwen2.5-1.5B-Poet-v2, y esta cuantizacion posterior a GGUF corre a cargo de mradermacher.

Los datos de entrenamiento provienen del dataset arbml/Ashaar_dataset, un corpus publico de poesia arabe (Ashaar) que recopila versos con informacion metrica y tematica. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni sobre el uso de tecnicas de alineacion como RLHF o DPO. Tampoco consta el uso de innovaciones adicionales como decodificacion especulativa o mecanismos de atencion alternativos; la cuantizacion es estatica (sin imatrix/weighted quants en el momento de publicacion).

## Capacidades

- Generacion de poesia arabe: tarea principal para la que fue ajustado, incluyendo composicion de versos conforme a las convenciones de la poesia arabiga (metrica y rima, segun el corpus de entrenamiento).
- Generacion de texto conversacional en arabe: el repositorio esta etiquetado como conversational, por lo que puede usarse en formato de chat.
- Completado y continuacion de versos: dado un hemistiquio o verso inicial, puede continuar la composicion.
- No se ha documentado soporte de tool calling / function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No soporta vision, audio ni otros modalities: es un modelo de texto unimodal.
- No consta soporte multilingue mas alla del arabe; el idioma declarado es unicamente "ar".

## Casos de uso

- Generacion creativa de poesia arabe: un escritor o aplicacion literaria puede usar el modelo para componer versos originales en arabe, aprovechando el ajuste fino sobre el corpus Ashaar.
- Continuacion y completado de versos: integracion en editores de texto arabes para sugerir el siguiente verso o hemistiquio a partir de lo escrito, como asistente de composicion poetica.
- Herramientas educativas de literatura arabiga: aplicaciones que ensenen metrica arabiga (arud) pueden generar ejemplos de versos en metricas concretas para practica de estudiantes.
- Chatbots culturales y de ocio: al estar etiquetado como conversational, puede alimentar un bot de conversacion poetica en arabe para apps moviles o web.
- Investigacion en PLN para el arabe: punto de partida ligero (1,5 B) para experimentos de generacion poetica, evaluacion automatica de metrica o destilacion de estilos.
- Demostraciones locales y prototipado rapido: gracias a las cuantizaciones de 0,8-1,1 GB, se puede desplegar en portatiles o Raspberry Pi-class hardware para demos sin coste de API, usando llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base y su ajuste fino no incluyen metricas de evaluacion (MMLU, HumanEval, GSM8K ni metricas especificas de poesia) en la model card consultada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: segun la cuantizacion, el archivo ocupa entre 0,8 GB (Q2_K) y 3,2 GB (f16). En Q4_K_M (1,1 GB), cabe comodamente en cualquier GPU moderna o incluso solo en RAM de CPU.
- GPU recomendadas: no requiere GPU dedicada. En consumer GPUs, cualquier modelo con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060) ejecuta incluso la version f16. No se necesitan A100 ni H100.
- Consumer GPUs: si, cabe en practicamente cualquier GPU consumer; tambien funciona por CPU puro dada su huella minima.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede usarse con transformers y vLLM/TGI.
- Latencia y throughput: no disponibles; por su tamano (1,5 B de parametros), se espera inferencia muy rapida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| Qareed-Qwen2.5-1.5B-Poet-v2 (este) | 1,54 B | Poesia arabe | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-1.5B-Instruct (base general) | 1,5 B | Uso general multilingue | Qwen Research / Apache 2.0 (segun version) | safetensors, GGUF comunitarios |
| ALLaM o modelos arabes ligeros de la comunidad | no disponible | Arabe general | no disponible | no disponible |

Nota: no existen muchos modelos publicos comparables especializados exclusivamente en poesia arabe; la alternativa mas directa es usar el modelo base general Qwen2.5-1.5B-Instruct, que cubre arabe de forma generica pero sin el ajuste fino poetico sobre Ashaar.

## Limitaciones y advertencias

- Alcance muy estrecho: el ajuste fino esta orientado a poesia arabe; para tareas generales (codigo, razonamiento, matematicas) rendira por debajo de modelos instruct generales.
- Idioma unico: el idioma declarado es arabe; no consta rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no evaluado publicamente; como todo modelo de 1,5 B, es propenso a generar contenido incoherente o metricamente incorrecto en ocasiones.
- Sesgos: hereda los sesgos de Qwen2.5 y del corpus Ashaar (poesia clasica y moderna arabiga), sin auditorias publicadas.
- Contexto: la longitud de ventana no esta documentada en la ficha; verificarla antes de usos con textos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Youssefx64/Qareed-Qwen2.5-1.5B-Poet-v2 y de Qwen2.5 para condiciones heredadas.
- Las cuantizaciones disponibles son estaticas (sin imatrix); en cuants bajos (Q2_K, Q3_K) la calidad, especialmente en un idioma morfologicamente rico como el arabe, puede degradarse de forma notable.
- No hay benchmarks ni evaluaciones publicadas: se recomienda evaluacion propia antes de uso en produccion.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Qareed-Qwen2.5-1.5B-Poet-v2-GGUF
- Modelo base ajustado: https://huggingface.co/Youssefx64/Qareed-Qwen2.5-1.5B-Poet-v2
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qareed-Qwen2.5-1.5B-Poet-v2-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/arbml/Ashaar_dataset
- FAQ de solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher: https://www.nethype.de/
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
