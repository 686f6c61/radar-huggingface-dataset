# mradermacher/Dungeonmaster-V2.3-Expanded-LLaMa-70B-GGUF

## Resumen

Dungeonmaster-V2.3-Expanded-LLaMa-70B-GGUF es la version cuantizada en formato GGUF del modelo TareksTesting/Dungeonmaster-V2.3-Expanded-LLaMa-70B, un merge de modelos de 70.000 millones de parametros construido con mergekit y orientado a generacion conversacional, presumiblemente especializado en narrativa interactiva y rol de mesa (de ahi el nombre "Dungeonmaster"). El autor de esta distribucion es mradermacher, conocido en el ecosistema por producir cuantizaciones GGUF sistematicas de modelos abiertos.

El modelo base parte de la familia LLaMa de 70B parametros (70.553.706.560 parametros reales segun los safetensors del repositorio) y esta etiquetado como conversacional y en ingles. Al tratarse de un merge sin model card tecnica detallada, no hay informacion publica sobre la composicion exacta del dataset de entrenamiento, el contexto nativo ni el proceso de alineacion.

La relevancia de esta ficha es practica: ofrece un conjunto completo de cuantizaciones estaticas (de Q2_K a Q8_0) que permiten ejecutar un modelo de 70B en hardware de consumo y en servidores con recursos limitados, algo inviable con los pesos en precision completa. Es, por tanto, una distribucion de inferencia, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LLaMa), derivado de un merge con mergekit |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (multi-parte en Q6_K y Q8_0) |

## Arquitectura y entrenamiento

El modelo base es un merge de modelos de la familia LLaMa de 70B, generado con mergekit, una herramienta que combina los pesos de dos o mas modelos mediante tecnicas de interpolacion, SLERP, TIES o DARE. Al no publicarse la receta del merge ni los modelos constituyentes, no es posible detallar la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo fases de RLHF o DPO. La model card del repositorio cuantizado no aporta informacion sobre innovaciones arquitectonicas especificas (atencion lineal, decodificacion especulativa, etc.), por lo que se asume una arquitectura transformer densa convencional compatible con la familia LLaMa.

Lo unico verificable tecnicamente es el proceso de cuantizacion: se han generado cuantizaciones estaticas (no imatrix) con llama.cpp, con `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversion directa desde pesos Hugging Face. Existe una version alternativa con cuantizaciones ponderadas/imatrix en el repositorio hermano del mismo autor.

## Capacidades

- Generacion de texto conversacional en ingles, con orientacion a narrativa y juego de rol segun el nombre del modelo.
- Razonamiento multi-turno dentro de una conversacion (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- No hay evidencia publicada de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia de capacidades multimodales (vision, audio) ni de modo "thinking".
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No se documentan capacidades de codigo o matematicas especificas.

## Casos de uso

- Narrativa interactiva y rol de mesa: el modelo puede actuar como dungeon master automatizado, gestionando descripciones de escenas, dialogos de PNJ y consecuencias de las acciones del jugador en conversaciones multi-turno. Es el caso de uso que sugiere el nombre y la etiqueta conversacional.
- Prototipado de chatbots tematicos: util para construir asistentes de ficcion o entretenimiento donde el tono narrativo importa mas que la precision factual, desplegable en local con llama.cpp.
- Generacion de contenido creativo en ingles: relatos, descripciones de personajes y tramas, aprovechando el sesgo narrativo del merge.
- Experimentacion con merges de modelos: sirve como caso de estudio para investigadores que quieran evaluar como se comporta un merge de 70B frente a sus constituyentes, usando las cuantizaciones para reducir coste de evaluacion.
- Inferencia en hardware de consumo: con Q4_K_M (42,6 GB) puede ejecutarse en estaciones con 48 GB de VRAM o en configuracion CPU+GPU con llama.cpp, permitiendo probar un 70B sin infraestructura de datacenter.
- Despliegue en entornos con restricciones de red o privacidad: al ser GGUF y ejecutable localmente con llama.cpp u Ollama, permite mantener las conversaciones fuera de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamanos reales del repositorio): Q2_K 26,5 GB; Q3_K_S 31,0 GB; Q3_K_M 34,4 GB; Q3_K_L 37,2 GB; IQ4_XS 38,4 GB; Q4_K_S 40,4 GB; Q4_K_M 42,6 GB; Q5_K_S 48,8 GB; Q5_K_M 50,0 GB; Q6_K 58,0 GB; Q8_0 75,1 GB.
- GPU recomendadas: para Q4_K_M en VRAM completa, una A100 80GB, H100 80GB o dos RTX 4090 (24 GB cada una) con reparto por capas. Para Q8_0 se necesita una A100/H100 de 80 GB o configuracion multi-GPU.
- En GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo completo ni siquiera en Q2_K; es viable con offloading parcial a CPU (por ejemplo, 20-30 capas en GPU y el resto en RAM del sistema). Una RTX 3090/4090 con 64 GB de RAM del sistema permite ejecutar Q4_K_M con velocidad moderada.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI mediante llama-server. vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversion a otro formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un 70B en Q4_K_M con offloading parcial suele quedar por debajo de 5-10 tokens/s en hardware de consumo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dungeonmaster-V2.3-Expanded-LLaMa-70B-GGUF | 70,55B | no disponible | no disponible | GGUF | Merge con mergekit, solo ingles, orientado a rol/narrativa |
| Llama 3.1 70B Instruct | 70B | 128K | Llama 3.1 Community License | safetensors, GGUF | Modelo oficial con alineacion y benchmarks publicos; multilingue |
| Qwen2.5 72B Instruct | 72B | 128K | Apache 2.0 (segun version) | safetensors, GGUF | Multilingue, benchmarks publicos, tool calling documentado |
| mradermacher/Dungeonmaster-V2.3-Expanded-LLaMa-70B-i1-GGUF | 70,55B | no disponible | no disponible | GGUF (imatrix) | Misma base con cuantizaciones ponderadas de mayor calidad |

La comparativa con Llama 3.1 70B y Qwen2.5 72B es relevante por tamano, pero conviene senalar que este modelo no publica benchmarks ni licencia, lo que dificulta una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad frente a modelos oficiales de tamano similar.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; es un riesgo legal para produccion.
- Solo ingles: no apto para productos en castellano sin evaluacion previa.
- Modelo derivado de un merge sin documentacion de la receta: comportamiento impredecible en tareas fuera del dominio narrativo/conversacional.
- Riesgo de alucinacion elevado en tareas factuales, dado el enfoque creativo y la falta de alineacion documentada.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos sin pruebas empiricas.
- El repositorio ocupa 481,3 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- Los archivos Q6_K y Q8_0 estan partidos en dos partes que deben concatenarse antes de su uso.
- Sin likes ni descargas significativas (65 descargas): poca validacion comunitaria.
- No hay garantia de soporte en vLLM/TGI; el despliegue recomendado es llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Dungeonmaster-V2.3-Expanded-LLaMa-70B-GGUF
- Modelo base: https://huggingface.co/TareksTesting/Dungeonmaster-V2.3-Expanded-LLaMa-70B
- Cuantizaciones imatrix del mismo autor: https://huggingface.co/mradermacher/Dungeonmaster-V2.3-Expanded-LLaMa-70B-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Dungeonmaster-V2.3-Expanded-LLaMa-70B-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
