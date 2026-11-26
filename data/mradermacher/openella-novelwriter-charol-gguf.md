# mradermacher/OpenElla-NovelWriter-Charol-GGUF

## Resumen

OpenElla-NovelWriter-Charol es un modelo de lenguaje de 8.030.261.312 parámetros (aproximadamente 8B) orientado a la escritura creativa, el roleplay y la conversación. No es un modelo entrenado desde cero, sino el resultado de un *merge* (fusión) de modelos, construido con mergekit sobre el dataset N-Bot-Int/Propietary-Merging-Stepper-R1 y publicado por el usuario N-Bot-Int. La versión que nos ocupa es la cuantización GGUF realizada por mradermacher, un conocido publicador de cuantizaciones estáticas para llama.cpp y ecosistemas compatibles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 8B especializado en narrativa y diálogo en hardware de consumo, con un abanico de cuantizaciones que va desde los 3,3 GB (Q2_K) hasta los 16,2 GB (f16). Al estar en formato GGUF, es directamente utilizable con llama.cpp, Ollama, LM Studio y servidores compatibles con la API de OpenAI, lo que lo hace accesible para prototipado local sin depender de GPU de datacenter.

La información pública disponible es limitada: la model card del cuantizador no incluye detalles sobre la arquitectura interna, el contexto máximo, la composición del dataset de entrenamiento ni resultados de benchmarks. Todo lo que se indica a continuación se basa en los metadatos de Hugging Face y en la model card del repositorio GGUF; los campos no documentados se marcan explícitamente como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama; detalles internos no disponibles) |
| Parametros totales | 8.030.261.312 (~8B) |
| Parametros activos | no disponible (no es un modelo MoE según los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión (*merge*) de otros modelos, no un entrenamiento desde cero. Los tags de Hugging Face incluyen `merge` y `mergekit`, y el dataset asociado es N-Bot-Int/Propietary-Merging-Stepper-R1, lo que sugiere que la receta de mezcla se construyó sobre ese conjunto de datos propietario del autor. El tag `llama` y la librería `transformers` apuntan a una arquitectura de tipo Llama, coherente con los 8B parámetros, aunque no se especifica la variante exacta (Llama 3, Llama 3.1, Mistral, etc.).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado posteriores al merge. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento explícito. La model card del cuantizador se limita a describir el proceso de cuantización estática (quantize_version 2, tensor quantised, conversión a HF) y a listar los ficheros generados.

## Capacidades

- Generación de texto narrativo y creativo: el nombre del modelo ("NovelWriter") y los tags `roleplay` y `conversational` indican especialización en escritura de ficción y diálogo de personajes.
- Conversación multi-turno: el tag `chat` y `conversational` sugieren uso en asistentes conversacionales.
- Roleplay: capacidad declarada explícitamente en los tags del repositorio.
- Generación de texto general: tag `text-generation-inference`, compatible con pipelines estándar de transformers.
- Idiomas: únicamente inglés según el campo `language: en`; no se declara soporte multilingüe.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar capítulos, diálogos y descripciones de escenas en inglés, aprovechando su especialización declarada en "NovelWriter". Adecuado para autores que quieran borradores rápidos en local sin enviar texto a servicios en la nube.
- Roleplay de personajes: con la cuantización Q4_K_M (5,0 GB) puede ejecutarse en una GPU de consumo y mantener conversaciones con un personaje consistente, útil para prototipos de videojuegos narrativos o chatbots de entretenimiento.
- Chat conversacional local: integrable en Ollama o LM Studio para asistentes personales en inglés, con la ventaja de que los datos no salen del equipo.
- Generación de guiones y diálogos: para guionistas que necesiten iterar sobre variantes de diálogo, el modelo puede producir múltiples versiones de una escena en pocos segundos con cuantizaciones Q4.
- Prototipado de agentes conversacionales: al ser compatible con la API de OpenAI (tag `endpoints_compatible`), puede sustituir a un endpoint remoto en fases de desarrollo sin coste por token.
- Fine-tuning ligero o experimentación: el modelo base en safetensors (8B) permite aplicar LoRA o QLoRA sobre la versión sin cuantizar para adaptarlo a un dominio narrativo concreto, aunque la licencia AGPL-3.0 condiciona la distribución de derivados.
- Evaluación comparativa de merges: útil para investigadores que estudien el efecto de distintas recetas de mergekit en tareas de escritura creativa, al disponer de cuantizaciones de varios niveles de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q3_K_M: ~4,1 GB
  - IQ4_XS: ~4,6 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o superior es suficiente; para Q8_0, una RTX 4070 Ti / 4080 (12-16 GB) o una A100/H100 si se busca throughput alto. Para f16, se recomienda una GPU de 24 GB o más (RTX 4090, A100 40 GB).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 8-12 GB; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (tag `endpoints_compatible`), y TGI para el modelo base en safetensors.
- Latencia y throughput: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 8B en Q4_K_M sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no se han publicado mediciones específicas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenElla-NovelWriter-Charol (este) | ~8B | no disponible | AGPL-3.0 | GGUF, safetensors | Merge especializado en narrativa/roleplay, solo inglés |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | GGUF, safetensors | Modelo generalista con contexto largo y multilingüe |
| Mistral 7B Instruct | 7,3B | 32K | Apache 2.0 | GGUF, safetensors | Generalista, licencia permisiva |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 | GGUF, safetensors | Multilingüe, buen rendimiento en código y matemáticas |

La comparación es aproximada: no se dispone de benchmarks del modelo evaluado, por lo que no puede afirmarse superioridad o inferioridad en tareas concretas. La principal diferencia frente a los generalistas es su especialización declarada en escritura creativa y roleplay, y su licencia AGPL-3.0, más restrictiva que Apache 2.0 para uso comercial en productos derivados.

## Limitaciones y advertencias

- Solo soporta inglés según los metadatos; no se declara ni se ha verificado soporte para castellano u otros idiomas.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de escritura o razonamiento es desconocido.
- Al ser un merge, puede heredar sesgos y comportamientos de los modelos fusionados, que no se documentan.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en tareas de conocimiento factual; no se recomienda para aplicaciones que requieran precisión verificable sin supervisión.
- Longitud de contexto no documentada: no puede planificarse su uso en tareas que requieran ventanas largas sin verificación empírica previa.
- Licencia AGPL-3.0: el uso comercial es posible, pero cualquier distribución o servicio en red basado en el modelo obliga a liberar el código fuente bajo la misma licencia. Esto puede ser incompatible con productos propietarios.
- La model card del cuantizador no documenta el proceso de merge ni la receta exacta, lo que dificulta la reproducibilidad.
- El repositorio tiene pocas descargas (239) y likes (2) en el momento de la consulta, lo que indica una validación comunitaria escasa.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opción rápida y Q6_K/Q8_0 para mejor calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OpenElla-NovelWriter-Charol-GGUF
- Modelo base: https://huggingface.co/N-Bot-Int/OpenElla-NovelWriter-Charol
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/OpenElla-NovelWriter-Charol-i1-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#OpenElla-NovelWriter-Charol-GGUF
- Dataset de merging: https://huggingface.co/datasets/N-Bot-Int/Propietary-Merging-Stepper-R1
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
