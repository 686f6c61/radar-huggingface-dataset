# ProjectMosiacAI/Hades-2.0-Night3-8k

## Resumen

Hades-2.0-Night3-8k es un ajuste fino del modelo Llama 3.1 8B Instruct, publicado por el usuario ProjectMosiacAI en HuggingFace exclusivamente en formato GGUF. El nombre del unico archivo disponible en el repositorio, `meta-llama-3.1-8b-instruct.Q4_K_M.gguf`, indica que el modelo base es Meta Llama 3.1 8B Instruct y que la unica cuantizacion publicada es Q4_K_M. El ajuste fino y la conversion a GGUF se realizaron con Unsloth, segun la propia model card.

El modelo cuenta con 8.030.261.312 parametros totales (aproximadamente 8.000 millones), lo que lo situa en la categoria de modelos densos de tamano medio, adecuados para inferencia en GPU de consumo. El repositorio ocupa 4,9 GB, coherente con una unica cuantizacion de 4 bits. No se ha publicado informacion sobre el conjunto de datos de ajuste fino, el numero de tokens de entrenamiento, la licencia ni los idiomas soportados.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo acumula 0 descargas y 0 likes en el momento de la consulta, no incluye resultados de benchmarks y no especifica licencia. Se trata, por tanto, de un artefacto experimental o de uso personal mas que de un modelo validado para produccion. Su interes practico reside en que es desplegable directamente con llama.cpp u Ollama mediante el Modelfile incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivada de Llama 3.1 8B Instruct, segun el nombre del archivo publicado) |
| Parametros totales | 8.030.261.312 |
| Longitud de contexto | no disponible (el sufijo "8k" del nombre sugiere 8192 tokens, sin confirmar en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `meta-llama-3.1-8b-instruct.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (incluye Modelfile de Ollama) |

## Arquitectura y entrenamiento

Segun la model card, el modelo fue ajustado y convertido a GGUF con Unsloth, herramienta que la propia documentacion del autor cita como responsable de un entrenamiento "2x mas rapido". El unico detalle tecnico explicito sobre el proceso es que el comportamiento del token BOS se ajusto para garantizar la compatibilidad con GGUF, un paso habitual al convertir pesos de HuggingFace a llama.cpp. No se especifica la arquitectura modificada, el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF, DPO u otra fase de alineacion, ni la tecnica de ajuste empleada (LoRA, QLoRA o ajuste completo).

Dado que el parametro total declarado (8.030.261.312) coincide con el de Llama 3.1 8B Instruct y que el nombre del archivo apunta a ese modelo base, es razonable asumir una arquitectura transformer decoder-only densa con attention agrupada (GQA), que es la de la familia Llama 3.1. No obstante, la model card no confirma esta correspondencia ni detalla ninguna innovacion tecnica adicional, por lo que cualquier afirmacion sobre la ventana de contexto nativa, el tokenizador o el vocabulario debe verificarse directamente contra los pesos publicados.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio y la herencia de un modelo Instruct indican soporte para dialogos multi-turno con plantilla de chat.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base, no documentadas ni verificadas mediante benchmarks en esta publicacion.
- Generacion de codigo: probable por herencia de Llama 3.1 8B Instruct, sin datos especificos publicados.
- Matematicas: probable por herencia del modelo base, sin datos especificos publicados.
- Tool calling / function calling: no confirmado en la model card. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, pero no implica soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles. La model card no declara idiomas.
- Capacidades especiales: no se declara modo de razonamiento explicito, vision ni audio. El autor menciona un comando para modelos multimodales (`llama-mtmd-cli`) como referencia generica de uso de llama.cpp, pero el archivo publicado es de texto.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo se puede ejecutar con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo, lo que permite validar flujos de chat multi-turno sin coste de API antes de migrar a un modelo con licencia clara.
- Experimentacion con ajuste fino sobre Llama 3.1 8B: dado que el autor publica el resultado de su propio ajuste con Unsloth, sirve como referencia para comparar tecnicas de fine-tuning y conversion a GGUF, siempre que se respete la licencia del modelo base.
- Despliegue en entornos con recursos limitados: al estar disponible en Q4_K_M (4,9 GB), cabe en GPUs de 8 GB con contextos cortos, lo que lo hace util para demos offline o equipos de desarrollo sin aceleradores de gama alta.
- Generacion de texto asistida en herramientas de escritorio: integrable en editores o asistentes locales mediante llama-cpp-python, aprovechando la plantilla de chat del modelo base.
- Evaluacion comparativa de cuantizaciones: el repositorio permite estudiar el impacto de Q4_K_M sobre un modelo de 8B en tareas de generacion, como punto de partida para probar otras cuantizaciones generadas por el usuario.
- Pruebas de integracion con servidores compatibles con la API de OpenAI: la etiqueta `endpoints_compatible` sugiere que puede levantarse detras de un endpoint estandar, lo que facilita sustituirlo en pipelines existentes durante pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y los resultados de busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa 4,9 GB. Con sobrecarga del runtime y cache KV, se estiman aproximadamente 5,5-6 GB de VRAM para contextos de 2.048-4.096 tokens. La cache KV de un modelo tipo Llama 3.1 8B con GQA (32 capas, 8 cabezas KV, dimension de cabeza 128) ocupa unos 128 KB por token en FP16, es decir, alrededor de 1 GB adicionales a 8.192 tokens.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 y, en el entorno profesional, A100 o H100 (ampliamente sobredimensionadas para un modelo de 8B en 4 bits).
- Compatibilidad con GPU de consumo: si. Cabe en GPUs de 8 GB con contexto reducido y cuantizacion Q4_K_M; 12-16 GB permiten contextos mas largos y mayor comodidad. Con menos de 8 GB de VRAM seria necesario descargar capas a CPU (offloading), con la consiguiente perdida de velocidad.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), LM Studio, llama-cpp-python y otros servidores compatibles con GGUF. La compatibilidad con vLLM o TGI no esta documentada.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden de la informacion proporcionada. Los datos de los modelos de referencia corresponden a sus versiones oficiales publicadas por sus respectivos fabricantes y se incluyen solo como contexto orientativo.

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Benchmarks |
|---|---|---|---|---|---|
| Hades-2.0-Night3-8k | 8.030.261.312 | no disponible (sufijo "8k" sin confirmar) | no disponible | GGUF Q4_K_M | no disponible |
| Llama 3.1 8B Instruct | 8.030.000.000 aprox. (referencia oficial) | 128.000 tokens (referencia oficial) | Llama 3.1 Community License | safetensors y GGUF | publicados por Meta |
| Mistral 7B Instruct | 7.240.000.000 aprox. (referencia oficial) | 32.000 tokens (referencia oficial) | Apache 2.0 | safetensors y GGUF | publicados por Mistral |
| Qwen2.5 7B Instruct | 7.610.000.000 aprox. (referencia oficial) | 128.000 tokens (referencia oficial) | Apache 2.0 (variantes) | safetensors y GGUF | publicados por Alibaba |

Observacion practica: si se confirma que el modelo base es Llama 3.1 8B Instruct, la comparativa directa mas relevante es contra el propio modelo base sin ajustar, ya que este ajuste fino no documenta mejoras medibles. Si la licencia del ajuste no se aclara, el uso comercial presenta un riesgo legal que los alternativas con licencia Apache 2.0 no tienen.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica licencia. Esto impide determinar si el uso comercial esta permitido, incluso aunque el modelo base sea Llama 3.1 (cuya licencia comunitaria impone obligaciones de atribucion y clausulas de uso aceptable).
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad del ajuste fino ni detectar degradaciones frente al modelo base.
- Sin datos del dataset de ajuste: se desconoce la composicion, el idioma y el volumen de los datos de entrenamiento, lo que impide evaluar el riesgo de olvido catastrofico, de sesgos introducidos o de contaminacion.
- Riesgo de alucinacion: inherente a los modelos de 8.000 millones de parametros, especialmente en tareas de razonamiento complejo, datos factuales actualizados y calculo.
- Idiomas no declarados: no se puede confirmar el soporte multilingue real del ajuste fino, ni siquiera el castellano.
- Comportamiento del token BOS modificado: el autor indica que se ajusto para compatibilidad con GGUF. Esto puede producir diferencias de generacion entre el modelo original y esta conversion si la plantilla de chat no se aplica correctamente.
- Contexto sin confirmar: el sufijo "8k" del nombre sugiere una ventana de 8.192 tokens, pero no hay confirmacion oficial. Asumir un contexto mayor puede provocar degradacion silenciosa.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes. No hay evidencia externa de que el modelo funcione segun lo esperado ni de que la conversion a GGUF sea correcta.
- Unica cuantizacion disponible: solo Q4_K_M. No hay versiones en FP16, Q5, Q8 ni variantes para contextos largos.
- Advertencia de procedencia: el autor (ProjectMosaicAI) no es el fabricante del modelo base. Verificar la correspondencia entre el nombre del archivo y los pesos reales antes de cualquier uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProjectMosiacAI/Hades-2.0-Night3-8k
- Unsloth (herramienta citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime implicito en las etiquetas y en los comandos de ejemplo): no se proporciona enlace en la informacion disponible
- Paper, blog o demo asociados: no disponible
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo. La unica coincidencia devuelta es una pagina de test de velocidad no relacionada (https://speedtest.gate02.ne.jp/), que no aporta informacion tecnica.
