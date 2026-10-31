# mradermacher/Swish-31B-Final-i1-GGUF

## Resumen

Swish-31B-Final-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix, "i1") del modelo ReadyArt/Swish-31B-Final, realizadas por el cuantizador comunitario mradermacher. El modelo base es un LLM de instrucciones de unos 30,7 mil millones de parámetros, orientado a conversación, roleplay y generación de contenido para adultos sin restricciones (unaligned), con etiquetas que incluyen NSFW explícito, terror y violencia. Su relevancia radica en que ofrece un modelo de gran tamaño, sin alineación de seguridad, ejecutable localmente gracias al formato GGUF y a la amplia gama de cuantos disponibles (desde IQ1_S de 7,3 GB hasta Q6_K de 25,3 GB).

La serie "i1" de mradermacher se caracteriza por usar imatrix (importance matrix) para mejorar la calidad de las cuantizaciones bajas frente a los cuantos estáticos equivalentes, lo que permite comprimir un modelo de 31B a tamaños que caben en GPUs de consumo con una degradación de calidad menor. La licencia del modelo base y de las cuantizaciones es Apache 2.0, lo que permite uso comercial.

El repositorio indica que se trata de un modelo de visión (vision model), señalando que los ficheros mmproj, si existen, se encuentran en el repositorio de cuantos estáticos. La información técnica detallada sobre arquitectura, contexto y entrenamiento no está disponible en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según librería transformers) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors (~334,8 GB el repo de cuantos) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la información disponible. El modelo base, ReadyArt/Swish-31B-Final, es un modelo de ~30,7 mil millones de parámetros etiquetado como instruct y conversacional, con capacidades de visión según el README del cuantizador (los ficheros mmproj se referencian en el repositorio de cuantos estáticos). La etiqueta "unaligned" indica que el modelo ha sido preparado para operar sin los filtros de seguridad habituales de los modelos alineados, lo que sugiere un proceso de post-entrenamiento o abliteración orientado a contenido maduro, aunque el método concreto no está documentado.

Tampoco hay información disponible sobre el número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas específicas del modelo base. Los ficheros del repositorio son cuantizaciones GGUF generadas mediante conversión HF y calibración con matriz de importancia (imatrix), una técnica que estima la relevancia de cada tensor para reducir el error de cuantización, especialmente útil en cuantos de 1-3 bits.

## Capacidades

- Generación de texto conversacional e instruccional (etiquetas instruct y conversational)
- Roleplay y escritura creativa, con especialización en contenido para adultos, ERP (erotic roleplay), terror y violencia explícitos
- Modelo "unaligned": sin restricciones de seguridad sobre contenido maduro
- Comprensión de imágenes: el README lo clasifica como vision model, con posibles ficheros mmproj en el repositorio de cuantos estáticos (no confirmado en los ficheros listados)
- Soporte en el ecosistema llama.cpp / GGUF, con cuantos desde 1,58 bits (IQ1_S) hasta 6 bits (Q6_K)
- No consta soporte de tool calling, function calling ni capacidades de agentes en la información disponible
- Idioma principal: inglés; no se declara soporte multilingüe

## Casos de uso

- Roleplay interactivo local: ejecución en local de sesiones de roleplay narrativo sin censura mediante backends como llama.cpp, KoboldCpp o SillyTavern, aprovechando cuantos Q4_K_M (18,8 GB) que caben en una RTX 3090/4090 de 24 GB.
- Escritura creativa de ficción para adultos: generación de prosa con temática madura, de terror o violenta para autores que necesitan un modelo sin filtros y con control total sobre el contenido generado.
- Prototipado de chatbots sin alineación: investigación sobre comportamiento de modelos sin alineación de seguridad, evaluación de red teaming y estudio de riesgos de contenido no filtrado.
- Inferencia en hardware limitado: los cuantos IQ1_S/IQ1_M (7,3-7,8 GB) permiten ejecutar un modelo de 31B en GPUs de 8 GB o incluso en CPU con RAM moderada, a costa de calidad notablemente degradada.
- Pruebas de visión multimodal locales: si se confirman los ficheros mmproj en el repositorio estático, sería usable para descripción de imágenes combinada con generación de texto sin censura.
- Benchmarking de cuantizaciones imatrix: el conjunto completo de 23 cuantos y el fichero imatrix incluido sirven como material de referencia para estudiar la degradación de calidad por nivel de cuantización en modelos de ~31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se publican benchmarks del modelo base ReadyArt/Swish-31B-Final en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar contexto):
  - IQ1_S: ~7,3 GB (GPUs de 8 GB)
  - IQ2_M: ~11 GB (GPUs de 12 GB)
  - IQ4_XS: ~16,8 GB (GPUs de 16-18 GB)
  - Q4_K_M: ~18,8 GB (GPUs de 24 GB, opción recomendada por el autor)
  - Q6_K: ~25,3 GB (GPUs de 32 GB o offload parcial)
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M/Q5_K_M; RTX 4080/5070 Ti (16 GB) para IQ4_XS; RTX 3060 12 GB para cuantos IQ2/IQ3; A100/H100 para los cuantos más altos sin limitaciones.
- Consumer GPUs: sí, cabe en una RTX 3090 o 4090 de 24 GB con Q4_K_M (18,8 GB); en 16 GB con IQ4_XS; en 12 GB con IQ3_M; en 8 GB solo con IQ1_S/IQ1_M con calidad muy reducida.
- Despliegue: llama.cpp, KoboldCpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No es un modelo vLLM/TGI nativo al ser GGUF.
- Latencia y throughput: no disponible; los cuantos bajos (IQ1-IQ2) ofrecerán mayor velocidad por menor ancho de banda de memoria, pero no hay mediciones publicadas.
- El fichero imatrix (0,1 GB) está incluido para quien quiera generar sus propias cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Swish-31B-Final (este, via cuantos i1) | 30,7B | GGUF imatrix | Apache 2.0 | Roleplay NSFW unaligned, inglés |
| Mythalion-13B / modelos de roleplay de menor tamaño | ~13B | GGUF/safetensors | Variable | Roleplay y escritura creativa |
| Dolphin series (e.g., Dolphin-Mixtral) | 7B-8x7B (MoE) | GGUF/safetensors | Apache 2.0 | Instruct sin censura generalista |

Nota: no hay datos de rendimiento publicados que permitan una comparativa cuantitativa; la tabla es orientativa por categoría (modelos sin alineación para roleplay/creative writing). Alternativas directas de 30B+ unaligned incluyen otros finetunes comunitarios sobre bases de 32B (p. ej., variantes Qwen 32B abliteradas), cuyos datos específicos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito sin filtros: el modelo genera sin restricciones contenido sexual explícito, violento o de terror; está etiquetado "not-for-all-audiences" y no es apto para entornos laborales ni para menores.
- Riesgo legal y de plataforma: la generación de contenido para adultos sin salvaguardas puede infringir términos de servicio de plataformas de despliegue y legislaciones locales; el usuario asume la responsabilidad del uso.
- Alucinaciones: no hay datos publicados sobre tasas de alucinación; al tratarse de un finetune orientado a roleplay, la fiabilidad factual en tareas de razonamiento o código es probablemente limitada y no está evaluada.
- Idioma: solo declara soporte de inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Contexto: la longitud de ventana de contexto no está publicada; verificar antes de diseños que dependan de contextos largos.
- Calidad de cuantización extrema: los cuantos IQ1_S/IQ1_M y Q2 están explícitamente marcados por el autor como de calidad muy baja o "para desesperados"; para uso serio se recomienda Q4_K_M o superior.
- Visión no confirmada: el README menciona ficheros mmproj en el repositorio estático, pero no aparecen en el listado de este repo; comprobar antes de asumir capacidades multimodales.
- Sin tool calling ni capacidades de agente documentadas: no es adecuado para pipelines de agentes sin validación previa.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones de contenido adulto por jurisdicción.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Swish-31B-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Swish-31B-Final
- Cuantos estáticos (con mmproj si existen): https://huggingface.co/mradermacher/Swish-31B-Final-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Swish-31B-Final-i1-GGUF
- FAQ / solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantos: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
