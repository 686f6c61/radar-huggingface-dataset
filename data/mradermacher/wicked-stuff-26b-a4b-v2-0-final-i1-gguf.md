# mradermacher/Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF es la versión cuantizada en formato GGUF del modelo Wicked-Stuff-26B-A4B-v2.0-Final, desarrollado por ReadyArt y redistribuido por mradermacher, autor habitual de cuantizaciones con tabla de importancia (imatrix) en Hugging Face. Se trata de un modelo de lenguaje conversacional orientado a roleplay y ficción para adultos, etiquetado explícitamente como NSFW, con soporte declarado para contenido erótico, terror y violencia, y sin alineamiento de seguridad («unaligned»).

El modelo original pesa 25.233.142.046 parámetros (unos 25,2 mil millones) en safetensors; este repositorio distribuye únicamente pesos GGUF cuantizados con imatrix en siete variantes que van de 10,5 GB (i1-IQ2_M) a 16,9 GB (i1-Q4_K_M), sobre un total de 146,2 GB de repositorio. La nomenclatura «26B-A4B» es la que se usa habitualmente para modelos de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos, aunque la model card no confirma la arquitectura ni detalla longitud de contexto, datos de entrenamiento o evaluación.

Su relevancia es de nicho: cubre la demanda de modelos sin censura ejecutables en local para escritura creativa y simulación de personajes, y puede servir como objeto de estudio en investigación sobre alineamiento y moderación de contenido. No se han publicado benchmarks ni métricas de rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer; la model card no especifica el detalle. La nomenclatura «A4B» sugiere mezcla de expertos (MoE) con ~4.000 millones de parámetros activos, sin confirmación documental |
| Parámetros totales | 25.233.142.046 (~25,2 B) |
| Parámetros activos | No disponible (ver nota sobre «A4B» en arquitectura) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | En este repositorio: i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M (más fichero imatrix). La model card lista además, para el repositorio estático: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, Q2_K_S, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantización i1 con imatrix); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 146,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna. El recuento de parámetros (25,2 B) y el sufijo «A4B» del nombre encajan con el patrón de denominación de los modelos MoE con aproximadamente 4.000 millones de parámetros activos por token, pero ni la model card del cuantizador ni los metadatos de Hugging Face lo confirman, por lo que debe tratarse como una hipótesis de trabajo y no como un dato verificado. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

El único proceso técnico documentado es el de cuantización: mradermacher genera las variantes GGUF a partir del modelo base en safetensors mediante cuantización ponderada con imatrix, e incluye el fichero `.imatrix.gguf` (0,2 GB) para que otros usuarios puedan generar sus propias cuantizaciones. La plantilla del cuantizador afirma que se trata de un modelo de visión y remite los ficheros `mmproj`, si existen, al repositorio estático; este extremo no se ha podido verificar con la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, con formato instruct.
- Roleplay y mantenimiento de personajes, con orientación explícita a narrativa interactiva.
- Escritura creativa de ficción para adultos: erótica, terror y violencia explícita, sin filtros de seguridad declarados.
- Estilo «unaligned»: el modelo no incorpora rechazos por contenido sensible según la propia etiquetación del autor.
- Capacidad de visión: indicada en la plantilla del cuantizador, no confirmada en la información disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo «thinking» o razonamiento extendido: no documentado.
- Audio: no documentado.

## Casos de uso

- Motores de rol conversacional: el modelo está entrenado y etiquetado para mantener personajes coherentes en conversaciones multi-turno con contenido adulto, lo que lo hace adecuado para aplicaciones de chat de personaje autoalojadas en las que el usuario controla los datos y no hay filtros corporativos externos.
- Escritura de ficción explícita: generación y continuación de relatos de terror, erótica o violencia narrativa sin los rechazos que aplican los modelos alineados, útil para autores de género que trabajan con material sensible.
- Diseño de NPCs para videojuegos: integración en un backend local (llama.cpp u Ollama) para generar diálogos ramificados de personajes con tono adulto, manteniendo los pesos en la máquina del estudio y evitando enviar guiones a APIs de terceros.
- Simulación de partidas de rol de mesa: generación de descripciones de escena, diálogos de PNJ y resoluciones narrativas en campañas con contenido maduro, con el modelo ejecutándose en el portátil del director de juego.
- Investigación sobre alineamiento y seguridad: al ser un modelo explícitamente «unaligned», sirve como referencia para estudiar qué tipo de contenido generan los modelos sin salvaguardas y para calibrar clasificadores de contenido frente a textos adversarios.
- Generación de datos sintéticos para moderación: producir grandes volúmenes de texto etiquetado como sensible (erótico, violento) para entrenar y evaluar detectores de contenido en plataformas, siempre con revisión humana posterior.
- Red teaming lingüístico autorizado: pruebas de robustez de filtros y sistemas de moderación propios frente a un modelo que no aplica rechazos por defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y tampoco se han encontrado evaluaciones independientes del modelo base en los resultados de búsqueda consultados.

## Requisitos de hardware

- Pesos completos en BF16/FP16 (modelo base en safetensors): ~50,5 GB solo de pesos, más caché KV; requiere 1 GPU de 80 GB (A100/H100) o 2 GPU de 40 GB.
- Cuantización i1-Q4_K_M (16,9 GB): cabe en GPU de consumo de 24 GB (RTX 3090, RTX 4090) y en RTX 4080/4070 Ti Super de 16 GB solo si se reduce contexto, ya que el fichero supera los 16 GB.
- Cuantización i1-Q3_K_M (13,4 GB): cabe en GPU de 16 GB (RTX 4080, RTX 4070 Ti Super) y en A4000 de 16 GB.
- Cuantización i1-IQ2_M (10,5 GB): cabe en GPU de 12 GB (RTX 3060 12 GB, RTX 4070) y en configuraciones de 16 GB con contexto amplio.
- Ejecución en CPU/RAM: viable con llama.cpp; para Q4_K_M se recomiendan al menos 24 GB de RAM del sistema; para las variantes de 10-13 GB, 16 GB de RAM.
- Si se confirma la naturaleza MoE, la VRAM debe alojar todos los expertos, aunque el coste computacional por token se aproxima al de un modelo de ~4 B activos; el cuello de botella pasa a ser el ancho de banda de memoria.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y llama-cpp-python para GGUF. vLLM y TGI requerirían los safetensors del modelo base, no los GGUF.
- Visión: si se confirma la capacidad multimodal, será necesario el fichero `mmproj` correspondiente, alojado según el autor en el repositorio estático.
- Latencia y throughput: no disponibles; no se publican mediciones en la información consultada.
- Almacenamiento: el repositorio completo ocupa 146,2 GB; conviene descargar solo la variante necesaria (entre 10,5 y 16,9 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF (este) | 25,2 B | No disponible | Apache-2.0 | GGUF i1 (7 variantes) | Cuantización imatrix de ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final |
| mradermacher/Wicked-Tutu-26B-A4B-GGUF | No disponible (nomenclatura 26B-A4B) | No disponible | No disponible | GGUF | Misma clase de tamaño y mismo cuantizador; orientación NSFW/roleplay |
| mradermacher/Kitchoon-26B-A4B-i1-GGUF | No disponible (nomenclatura 26B-A4B) | No disponible | No disponible | GGUF i1 | Misma clase de tamaño y mismo cuantizador |
| mradermacher/Shadow-Siren-26B-A4B-i1-GGUF | No disponible (nomenclatura 26B-A4B) | No disponible | Apache-2.0 (según la fuente consultada) | GGUF i1 | Repositorio de ~300,9 GB; misma clase de tamaño |

Las tres alternativas comparten con este modelo el patrón de denominación «26B-A4B» y el mismo pipeline de cuantización, pero no se han publicado en la información disponible sus fichas técnicas completas, benchmarks ni condiciones de licencia verificadas, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como NSFW, explícito y no apto para todas las audiencias (`not-for-all-audiences`); no debe desplegarse en productos accesibles a menores sin controles de edad y moderación.
- Ausencia de alineamiento: la etiqueta «unaligned» implica que el modelo no incorpora rechazos por contenido sensible, lo que traslada toda la responsabilidad de filtrado a la capa de aplicación.
- Alucinación: no hay evaluaciones publicadas de fidelidad factual; en un modelo orientado a ficción, la tasa de invención es esperablemente alta y no debe usarse como fuente de datos.
- Idioma: soporte declarado únicamente de inglés; el rendimiento en castellano no está documentado y probablemente sea degradado.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide dimensionar aplicaciones de conversación larga sin pruebas empíricas previas.
- Sesgos: no se han publicado análisis de sesgos; al no haber ajuste por preferencias documentado, cabe esperar sesgos sociales y culturales sin mitigar.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el contenido generado puede estar sujeto a legislación sobre material sexual, violencia o difamación según la jurisdicción; conviene revisar también la licencia del modelo base ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final antes de un despliegue comercial.
- Producción: sin benchmarks, sin ficha de datos de entrenamiento y sin garantías del autor del modelo base, no es recomendable usarlo en flujos críticos sin una evaluación propia.
- Metadatos incompletos: la ficha no confirma arquitectura MoE, capacidad de visión ni tamaño de contexto; cualquier planificación que dependa de estos datos debe validarse con pruebas directas.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Wicked-Stuff-26B-A4B-v2.0-Final-i1-GGUF
- Peticiones de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo comparable, Wicked-Tutu-26B-A4B-GGUF: https://huggingface.co/mradermacher/Wicked-Tutu-26B-A4B-GGUF
- Modelo comparable, Kitchoon-26B-A4B-i1-GGUF: https://huggingface.co/mradermacher/Kitchoon-26B-A4B-i1-GGUF
- Lista curada de modelos sin censura para seguridad ofensiva: https://github.com/JoasASantos/Offensive-Security-AI-Models
