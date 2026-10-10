# mradermacher/LunaraHome-26B-A4B-i1-GGUF

## Resumen

LunaraHome-26B-A4B-i1-GGUF es una compilación de cuantizaciones GGUF generada por mradermacher a partir del modelo Maxinger15/LunaraHome-26B-A4B. Se trata, por tanto, de un artefacto de redistribución y cuantización: el trabajo de entrenamiento corresponde al autor original, mientras que mradermacher aplica cuantización con imatrix (sufijo i1) para reducir el peso del modelo y hacerlo desplegable en hardware de consumo mediante llama.cpp y derivados.

El modelo subyacente se etiqueta como gemma4 y se distribuye como un ajuste LoRA fusionado sobre una base de la familia Gemma, con un enfoque declarado en asistentes domésticos: las etiquetas incluyen home-assistant, music-assistant y tool-calling, lo que sugiere un entrenamiento orientado a invocación de herramientas y control de dispositivos. La nomenclatura 26B-A4B apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 26.000 millones de parámetros totales y unos 4.000 millones activos por token, aunque estos valores no se confirman en la documentación disponible.

La relevancia de esta ficha radica en que el repositorio es de tipo experimental, con cero descargas y cero valoraciones en el momento de la consulta, y en que únicamente contiene el fichero imatrix (0,2 GB) en este repositorio i1, mientras que las cuantizaciones estáticas completas se alojan en un repositorio hermano. Es un modelo pensado para automatización del hogar en local y en alemán e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura del nombre; base etiquetada como gemma4 |
| Parametros totales | 26B segun nomenclatura del nombre; el repositorio declara 14.224.235 parametros en safetensors (cifra incoherente con el nombre, probablemente correspondiente a un fichero auxiliar o al adaptador) |
| Parametros activos | Aproximadamente 4B (sufijo A4B), no confirmado en la documentacion |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (generadas con imatrix/weighted) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio incluye un fichero imatrix de 0,2 GB); el modelo base esta en safetensors y las cuantizaciones estaticas en mradermacher/LunaraHome-26B-A4B-GGUF |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio. El sufijo gemma4 indica que la base pertenece a la familia Gemma de Google, y el patron 26B-A4B es la convencion habitual para modelos de mezcla de expertos con 26.000 millones de parametros totales y 4.000 millones activos por token. Sobre esa base, Maxinger15 aplico un ajuste LoRA cuyo resultado se publico como Maxinger15/LunaraHome-26B-A4B; mradermacher ha fusionado y cuantizado ese resultado.

No se especifican en la documentacion el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o preferencia humana. La unica senal sobre el proposito del ajuste son las etiquetas home-assistant, music-assistant y tool-calling, que apuntan a un entrenamiento supervisado orientado a la invocacion de herramientas y a la integracion con plataformas de domotica y reproduccion musical. El repositorio incluye tambien la etiqueta lora, coherente con un adaptador de bajo rango posteriormente fusionado.

La innovacion tecnica del repositorio no esta en el modelo, sino en el proceso de cuantizacion: el fichero imatrix permite generar cuantizaciones con informacion de importancia por tensor. El propio autor advierte de que las cuantizaciones de tipo IQ suelen ser preferibles a las no-IQ de tamano similar, y enlaza la grafica comparativa de perplejidad de ikawrakow y las notas de Artefact2 sobre el tema.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Invocacion de herramientas y function calling, segun la etiqueta tool-calling, lo que permite integracion con APIs y entornos de agentes.
- Control de domotica a traves de Home Assistant, segun la etiqueta home-assistant.
- Control de reproduccion musical mediante Music Assistant, segun la etiqueta music-assistant.
- Capacidad multimodal: el README indica explicitamente que es un modelo de vision, y que los ficheros mmproj correspondientes se encuentran en el repositorio estatico.
- Despliegue en entornos locales y sin conexion gracias al formato GGUF y a las cuantizaciones de bajo bit.
- Razonamiento multi-paso en flujos de agente, derivado de la capacidad de tool calling, aunque no se documenta un modo de pensamiento explicito.
- No se documentan capacidades de audio, ni modos de razonamiento extendido, ni soporte de contextos largos.

## Casos de uso

- Asistente de voz para el hogar: el modelo se integra en Home Assistant como motor de intenciones en local, traduciendo frases en aleman o ingles a llamadas de servicio sobre entidades domoticas sin enviar datos a la nube.
- Control por lenguaje natural de un sistema de audio multiroom: mediante Music Assistant, el modelo puede traducir peticiones como reproducir una lista en una habitacion concreta a llamadas de API tipadas.
- Automatizaciones en lenguaje natural: el usuario describe una regla ("si no hay nadie en casa y se abre la ventana, avisame"), y el modelo genera la automatizacion estructurada mediante tool calling.
- Pipeline de agente local para tareas del hogar: encadenamiento de varias herramientas en secuencia, por ejemplo consultar el calendario, ajustar la calefaccion y enviar una notificacion.
- Asistente conversacional en alemán de bajos recursos: al ser un MoE con pocos parametros activos, permite respuestas con baja latencia en una GPU de consumo, algo util para interfaces de voz que requieren tiempos de respuesta cortos.
- Despliegue en el borde o en un servidor doméstico: las cuantizaciones de 2-4 bits permiten ejecutar el modelo en una mini-PC o en una GPU de gama media, manteniendo los datos personales dentro de la red local.
- Generacion de comandos y scripts de domotica: el modelo puede redactar fragmentos de YAML de automatizacion o scripts de Home Assistant a partir de una descripcion en lenguaje natural.
- Base para fine-tuning posterior: al estar bajo licencia Apache 2.0 y en GGUF, sirve como punto de partida para ajustes especificos por idioma o por ecosistema de dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano declarado (26B totales, 4B activos) y no proceden de la documentacion oficial; deben tomarse como orientativas.

- VRAM estimada para inferencia, segun cuantizacion:
  - IQ1_S / IQ1_M: en torno a 5-7 GB.
  - IQ2_XXS a IQ2_M: en torno a 8-10 GB.
  - Q3_K_S a Q3_K_L: en torno a 11-13 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: en torno a 14-17 GB.
  - Q5_K_S / Q5_K_M: en torno a 18-20 GB.
  - Q6_K: en torno a 21-23 GB.
- GPU recomendadas: para cuantizaciones de 4 bits, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) son suficientes; para cuantizaciones de 6-8 bits conviene una A100 de 40 GB, una H100 o una RTX 6000 Ada. Al ser un MoE con unos 4B activos, el coste por token es inferior al de un modelo denso de 26B.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 (24 GB) y, con cuantizaciones de 2 bits, en tarjetas de 8-12 GB como la RTX 3060 de 12 GB. En configuraciones sin GPU, el modelo puede repartirse entre RAM y CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la documentacion; dependeran de la cuantizacion, del ancho de banda de memoria y del numero de capas descargadas a CPU.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparacion se limita a caracteristicas estructurales y de licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LunaraHome-26B-A4B (i1-GGUF) | 26B totales, ~4B activos (MoE, segun nomenclatura) | no disponible | Apache 2.0 | GGUF en HuggingFace |
| Qwen3-30B-A3B | 30B totales, ~3B activos (MoE) | hasta 128K en las variantes publicadas | Apache 2.0 | safetensors y GGUF |
| Gemma 3 27B | 27B densos | 128K en las variantes publicadas | Gemma Terms of Use | safetensors y GGUF |
| Mixtral 8x7B | 46B totales, ~13B activos (MoE) | 32K | Apache 2.0 | safetensors y GGUF |

La ventaja diferencial de LunaraHome-26B-A4B es su especializacion en domotica y tool calling sobre Home Assistant y Music Assistant, frente a modelos generalistas de tamano comparable. Como contrapartida, carece de validacion externa y de resultados de benchmarks publicos.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor, sin descargas ni valoraciones en el momento de la consulta, por lo que no hay evidencia comunitaria de calidad.
- No se publican resultados de benchmarks, lo que impide estimar su rendimiento real frente a alternativas.
- La longitud de contexto no esta documentada; conviene verificarla antes de usarlo en conversaciones multi-turno o en agentes con historial largo.
- Soporte limitado a aleman e ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion en la invocacion de herramientas: al tratarse de un modelo especializado en function calling, puede generar llamadas con parametros inexistentes o entidades inventadas, por lo que se recomienda validar la salida contra un esquema estricto.
- Las cuantizaciones de muy bajo bit (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la perplejidad y pueden romper el formato de las llamadas a herramientas; para produccion conviene partir de Q4_K_M o superior.
- Este repositorio contiene unicamente el fichero imatrix; para obtener pesos utilizables hay que acudir al repositorio de cuantizaciones estaticas o generar las propias.
- Aunque la licencia del artefacto de cuantizacion es Apache 2.0, el uso comercial del modelo subyacente depende de los terminos de la base Gemma sobre la que se entreno, que no se detallan aqui.
- La cifra de parametros declarada en safetensors (14.224.235) no concuerda con la nomenclatura 26B-A4B, lo que sugiere un error en los metadatos del repositorio y obliga a verificar el tamano real antes de planificar el despliegue.
- El modelo es multimodal, pero los ficheros mmproj no estan en este repositorio; sin ellos, la ruta de vision no funcionara.

## Enlaces

- Repositorio HuggingFace (i1-GGUF): https://huggingface.co/mradermacher/LunaraHome-26B-A4B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/LunaraHome-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Maxinger15/LunaraHome-26B-A4B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#LunaraHome-26B-A4B-i1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Empresa patrocinadora del autor: https://www.nethype.de/
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
