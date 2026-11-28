# nioncorp/nil-3b-gguf

## Resumen

NIL-3B GGUF es una distribucion en formato GGUF del modelo NIL-3B, un ajuste fino del modelo base meta-llama/Llama-3.2-3B-Instruct publicado por nioncorp. El repositorio contiene el archivo `nil-3b-q4_k_m.gguf`, cuantizado en Q4_K_M, pensado para ejecucion local con runtimes compatibles con llama.cpp. El modelo cuenta con 3.212.749.888 parametros y un tamano de repositorio de 2,0 GB.

El modelo se presenta como un proyecto de chat orientado a varios idiomas africanos (swahili, amharico, hausa, yoruba e igbo) ademas del ingles, lo que lo diferencia de la mayoria de ajustes finos de Llama 3.2, centrados casi exclusivamente en ingles y lenguas europeas. La licencia declarada en el repositorio es MIT, si bien la propia model card advierte que el archivo LICENSE cubre el codigo fuente del proyecto y no confirma por si mismo los derechos de redistribucion de los pesos ni de los datos de entrenamiento.

La relevancia actual del modelo radica en su facilidad de despliegue: al estar en GGUF y pesar 2,0 GB, puede ejecutarse en hardware de consumo sin GPU dedicada de gama alta. No obstante, la informacion publicada sobre el proceso de entrenamiento, los datos utilizados y los resultados de evaluacion es practicamente inexistente, lo que limita su adopcion en entornos de produccion sin una validacion previa por parte del equipo que lo integre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2-3B-Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `nil-3b-q4_k_m.gguf`) |
| Idiomas soportados | en, sw, am, ha, yo, ig |
| Licencia | MIT (segun metadatos del repositorio; ver advertencias) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Llama 3.2-3B-Instruct, un transformer decoder-only con atencion por grupos (GQA) y tokenizador BPE de Llama 3. El ajuste fino realizado por nioncorp no esta documentado en la model card: no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como SFT, RLHF o DPO. Tampoco se detalla si se amplio el vocabulario o el contexto respecto al modelo base.

La unica informacion tecnica disponible en el repositorio se refiere al proceso de inferencia y publicacion: el script `src.chat` espera el archivo `nil-3b-q4_k_m.gguf` en la raiz del proyecto, y el script `upload_hf.py` gestiona la subida al Hub mediante `huggingface_hub` y `python-dotenv`. No hay innovaciones tecnicas declaradas (decodificacion especulativa, atencion lineal, MoE ni similares).

## Capacidades

- Generacion de texto conversacional en ingles y en cinco idiomas africanos (swahili, amharico, hausa, yoruba, igbo).
- Razonamiento basico y respuesta a instrucciones heredados del modelo base Llama 3.2-3B-Instruct.
- Generacion de codigo y matematicas a nivel basico, limitado por el tamano de 3B parametros.
- Soporte de tool calling: no documentado en la model card, aunque el modelo base lo soporta; la conservacion de esta capacidad tras el ajuste fino no esta verificada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (vision, audio): no disponibles; Llama 3.2-3B-Instruct es exclusivamente textual.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistencia conversacional multilingue en Africa oriental y occidental: el modelo puede mantener dialogos en swahili, amharico, hausa, yoruba e igbo, lo que lo hace util para aplicaciones de atencion al ciudadano o servicios comunitarios en esas regiones.
- Despliegue en hardware de consumo: con 2,0 GB en Q4_K_M, puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita prototipos y demos locales sin coste de infraestructura cloud.
- Traduccion asistida y adaptacion cultural: util como borrador en pipelines de traduccion entre ingles y las lenguas africanas soportadas, con revision humana posterior dado el riesgo de alucinacion.
- Educacion y alfabetizacion digital: generacion de material didactico y respuestas en lenguas locales para plataformas de aprendizaje de bajo recursos.
- Chatbots de bajo coste para ONG y pymes: al ser un modelo de 3B en GGUF, permite desplegar asistentes en servidores modestos o incluso en dispositivos edge.
- Investigacion en NLP de bajos recursos: sirve como punto de partida para estudiar el comportamiento de ajustes finos de Llama 3.2 en lenguas africanas y como baseline en experimentos comparativos.
- Integracion en aplicaciones de escritorio: el formato GGUF y el script `src.chat` permiten incorporar el modelo en herramientas locales de procesamiento de texto sin dependencia de API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantizacion Q4_K_M (2,0 GB de pesos mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3050, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo pero compatibles.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante) y en CPU con 4-6 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El repositorio incluye un script de chat propio (`python -m src.chat`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware y del runtime elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NIL-3B GGUF | 3,21B | no disponible | en, sw, am, ha, yo, ig | MIT (declarada) | GGUF |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k (segun model card oficial) | multilingue (8 idiomas oficiales) | Llama 3.2 Community License | safetensors, GGUF |
| Qwen2.5-3B-Instruct | 3,09B | 32k (128k con YaRN) | multilingue (29 idiomas) | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B IT | 2,61B | 8k | multilingue | Gemma Terms of Use | safetensors, GGUF |

La ventaja diferencial de NIL-3B frente a estos modelos es su cobertura declarada de lenguas africanas (swahili, amharico, hausa, yoruba, igbo), ausente o marginal en los modelos comparados. En cambio, carece de la documentacion de contexto, benchmarks y proceso de entrenamiento que si acompanan a Llama 3.2, Qwen2.5 y Gemma 2.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento, proceso de ajuste fino y evaluacion: no es posible verificar la calidad ni la fidelidad del ajuste en las lenguas africanas declaradas.
- Riesgo de alucinacion elevado en lenguas de bajos recursos, dado el limitado volumen de datos disponible tipicamente para swahili, amharico, hausa, yoruba e igbo.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no se pueden evaluar sesgos de genero, etnicos o culturales.
- Licencia ambigua: la model card advierte explicitamente que el archivo LICENSE (MIT) cubre el codigo fuente y no confirma los derechos de redistribucion de los pesos ni de los datos. El modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License, cuyos terminos podrian prevalecer sobre la licencia MIT declarada.
- Longitud de contexto no documentada: se desconoce si se conserva la ventana de 128k del modelo base o se ha reducido durante el ajuste fino.
- Sin soporte documentado de tool calling ni de razonamiento multi-paso tras el ajuste fino.
- Proyecto con 0 likes y 774 descargas en el momento de la consulta: sin comunidad ni mantenimiento verificado.
- No apto para produccion sin una evaluacion propia previa en el dominio y los idiomas de destino.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nioncorp/nil-3b-gguf
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentacion de llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentacion de Ollama: https://ollama.com
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
