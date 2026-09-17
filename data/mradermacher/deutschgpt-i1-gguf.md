# mradermacher/DeutschGPT-i1-GGUF

## Resumen

DeutschGPT-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher a partir del modelo KordAI/DeutschGPT, un modelo de generacion de texto y chat especializado en aleman. El repositorio no contiene pesos originales, sino versiones comprimidas del modelo base en una amplia gama de tipos de cuantizacion (desde IQ1_S hasta Q6_K), generadas con el metodo imatrix para preservar calidad a tamanos reducidos.

El modelo base tiene 1.720.574.976 parametros (aproximadamente 1,72 mil millones), lo que lo situa en la categoria de modelos pequenos, aptos para ejecucion local en hardware de consumo. Los tags del repositorio incluyen qwen3, lo que indica que la arquitectura subyacente es un transformer denso derivado de la familia Qwen3, afinado para el idioma aleman y con licencia Apache 2.0.

Su relevancia practica reside en la disponibilidad de cuantizaciones que ocupan entre 0,6 GB y 1,5 GB, lo que permite desplegar un asistente conversacional en aleman en portatiles, equipos sin GPU dedicada o entornos con memoria limitada, manteniendo la licencia permisiva del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta qwen3 en el repositorio; derivado de la familia Qwen3) |
| Parametros totales | 1.720.574.976 (segun metadatos de safetensors del modelo base) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | aleman (de) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base se distribuye en safetensors para transformers |
| Modelo base | KordAI/DeutschGPT |
| Cuantizador | mradermacher |
| Tamano del repositorio | 21,6 GB (incluye todas las variantes de cuantizacion) |
| Version estatica alternativa | mradermacher/DeutschGPT-GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. Los tags del repositorio (qwen3, transformers, unsloth) apuntan a que se trata de un transformer denso derivado de Qwen3, afinado mediante tecnicas de ajuste supervisado y, presumiblemente, optimizacion posterior con Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. La longitud de contexto tampoco se documenta en la model card.

La innovacion tecnica relevante de este repositorio concreto es el uso de cuantizaciones ponderadas con matriz de importancia (imatrix) generadas con llama.cpp, que reducen la perdida de calidad respecto a las cuantizaciones estaticas equivalentes. El autor publica tambien el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generacion de texto y conversacion multi-turno en aleman, segun los tags conversational y chat.
- Ajuste especifico para el idioma aleman, lo que reduce la deriva hacia el ingles en prompts en de.
- Formato de pesos GGUF compatible con llama.cpp y sus derivados, lo que habilita inferencia en CPU, GPU y entornos hibridos.
- Soporte de plantillas de chat heredadas del modelo base (no se detalla el formato exacto de plantilla en la informacion disponible).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues limitadas al aleman segun el campo language de la model card.

## Casos de uso

- Asistente conversacional en aleman en local: con cuantizaciones de 1,2 GB (Q4_K_M) el modelo puede ejecutarse en un portatil sin GPU dedicada, ofreciendo respuestas en aleman sin enviar datos a servicios externos.
- Atencion al cliente en mercados germanoparlantes: despliegue en un servidor pequeno para gestionar consultas frecuentes en aleman con latencia baja, siempre que las conversaciones no requieran contexto muy largo.
- Generacion de borradores de correo y documentacion interna en aleman: el modelo puede redactar textos administrativos o comerciales que despues revise un humano.
- Clasificacion y resumen de textos alemanes: integrado en un pipeline de preprocesado para etiquetar tickets, resumir correos o extraer puntos clave de documentos cortos.
- Prototipado de aplicaciones de IA en alemán: util para equipos que necesitan un modelo ligero con licencia Apache 2.0 durante la fase de validacion antes de escalar a modelos mayores.
- Educacion y practica de idiomas: generacion de ejercicios, correccion gramatical o simulacion de dialogos en aleman en aplicaciones de aprendizaje.
- Investigacion sobre cuantizacion: el repositorio incluye 24 variantes de cuantizacion mas el fichero imatrix, lo que permite estudiar el compromiso entre tamano, velocidad y calidad en un modelo de 1,72B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion orientativa a partir del tamano de los ficheros GGUF, no confirmada por el autor):
  - i1-IQ1_S a i1-IQ2_M: entre 0,6 GB y 0,8 GB de pesos.
  - i1-IQ3_S a i1-Q3_K_L: entre 1,0 GB y 1,1 GB.
  - i1-Q4_K_S / i1-Q4_K_M: aproximadamente 1,2 GB de pesos.
  - i1-Q5_K_M: aproximadamente 1,4 GB; i1-Q6_K: aproximadamente 1,5 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4 y Q5 (GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.). En GPUs de datacenter (A100, H100) el modelo queda muy sobredimensionado en memoria, aunque puede usarse para servir muchas instancias concurrentes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, e incluso en iGPU con memoria unificada compartida.
- Ejecucion en CPU: viable gracias al formato GGUF; con cuantizaciones Q4 el modelo ocupa alrededor de 1,2 GB de RAM, por lo que funciona en equipos con 8 GB de memoria del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores GGUF compatibles con la API de OpenAI. vLLM y TGI soportan GGUF de forma parcial y no son la via recomendada para este formato.
- Latencia y throughput: no disponibles. Como referencia orientativa y no verificada, un modelo denso de 1,7B en Q4 suele generar decenas de tokens por segundo en GPU consumer moderna y un rango de un digito a decenas de tokens por segundo en CPU, dependiendo del numero de nucleos.

## Comparativa con modelos similares

Los datos de la columna de este modelo proceden de la informacion proporcionada; los de los modelos comparativos son datos publicos de conocimiento general y no se han verificado en la busqueda realizada.

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Formato |
|---|---|---|---|---|---|
| DeutschGPT-i1-GGUF (este modelo) | 1,72B | no disponible | Aleman | Apache 2.0 | GGUF (24 cuantizaciones) |
| Qwen3-1.7B (base presumible) | 1,7B | no disponible en esta ficha | Multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | 1,23B | 128.000 tokens | Multilingue (incluye aleman) | Licencia comunitaria de Llama | safetensors, GGUF |
| Gemma 3 1B | 1B | 32.000 tokens | Multilingue | Terminos de uso de Gemma | safetensors, GGUF |

No se dispone de datos de benchmarks que permitan comparar la calidad de DeutschGPT frente a estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; un modelo entrenado predominantemente con datos en aleman puede reflejar sesgos culturales y linguisticos de esas fuentes.
- Riesgo de alucinacion: inherente a los modelos de 1,7B de parametros; la capacidad reducida de almacenar conocimiento factual aumenta la probabilidad de respuestas incorrectas con apariencia plausible.
- Limitacion idiomatica: la model card declara unicamente aleman (de), por lo que el rendimiento en castellano, ingles u otros idiomas puede degradarse notablemente.
- Contexto: al no documentarse la longitud de contexto, no debe asumirse una ventana larga; conviene validarla experimentalmente antes de usarla en produccion.
- Cuantizaciones de baja calidad: el propio autor advierte que variantes como IQ1_S e IQ1_M son "for the desperate", Q2_K_S es de "muy baja calidad" y Q3_K_S/IQ3_XXS son de calidad inferior. Para uso real se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene verificar que el modelo base KordAI/DeutschGPT mantiene la misma licencia y que no impone condiciones adicionales sobre los datos de entrenamiento.
- Produccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria; no hay benchmarks ni evaluaciones independientes publicadas.
- El repositorio pesa 21,6 GB en total; descargar el repositorio completo no es necesario, basta con seleccionar una unica variante GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/DeutschGPT-i1-GGUF
- Modelo base: https://huggingface.co/KordAI/DeutschGPT
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/DeutschGPT-GGUF
- Pagina de resumen y lista de descargas: https://hf.tst.eu/model#DeutschGPT-i1-GGUF
- Ejemplo de guia de uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
