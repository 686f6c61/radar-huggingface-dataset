# mradermacher/PMLLM-Qwen3-VL-8B-DrGRPO-GGUF

## Resumen

PMLLM-Qwen3-VL-8B-DrGRPO-GGUF es la distribucion en formato GGUF del modelo Yeongtak/PMLLM-Qwen3-VL-8B-DrGRPO, un ajuste fino multimodal construido sobre la familia Qwen3-VL de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y pone a disposicion del ecosistema llama.cpp un modelo de vision-lenguaje de aproximadamente 8.190 millones de parametros.

El modelo hereda del nombre dos pistas tecnicas: la base Qwen3-VL, que aporta capacidades de comprension de imagen y texto, y el sufijo "DrGRPO", que apunta a un entrenamiento con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo empleada habitualmente para reforzar razonamiento y correccion de respuestas. El repositorio incluye tanto los pesos del modelo de lenguaje como el proyector multimodal (mmproj) necesario para procesar imagenes.

La relevancia practica de esta ficha esta en que permite ejecutar un modelo multimodal de 8B en hardware de consumo mediante cuantizaciones de 3,4 a 8,8 GB, sin depender de GPUs de centro de datos. La informacion publica disponible es, sin embargo, muy limitada: no hay model card detallada del ajuste fino, no se declaran benchmarks ni licencia, y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3-VL (vision-lenguaje); detalles del ajuste no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repositorio | 75,3 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura de partida es Qwen3-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje y un proyector que alinea ambos espacios. El sufijo "DrGRPO" indica que el ajuste fino empleo GRPO, un algoritmo de optimizacion de politica relativa a grupos que se usa para entrenar razonamiento de cadena larga y mejorar la precision en tareas verificables. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas adicionales de SFT o DPO.

El trabajo de mradermacher es exclusivamente de cuantizacion: convierte los pesos safetensors del modelo base a GGUF con distintos niveles de compresion y genera los ficheros mmproj para el codificador visual. No se han publicado cuantizaciones con imatrix o ponderadas para este modelo en el momento de la ficha, por lo que las versiones disponibles son estaticas (etiquetadas como "static quants" en la model card). Esto implica que las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar mas la calidad que sus equivalentes con imatrix.

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de chat propio de la familia Qwen.
- Comprension de imagenes: el repositorio incluye ficheros mmproj que habilitan entrada multimodal en llama.cpp y derivados.
- Razonamiento reforzado mediante GRPO, orientado a tareas que requieren pasos intermedios verificables.
- Capacidad de ejecucion local en CPU y GPU de consumo gracias a las cuantizaciones GGUF.
- Integracion con el ecosistema transformers y con endpoints compatibles (tag endpoints_compatible).
- No se ha documentado soporte explicito de tool calling, function calling ni modo agente en la informacion disponible.
- Cobertura multilingue limitada al ingles segun los metadatos del repositorio.

## Casos de uso

- Analisis de imagenes en local: el modelo puede recibir una imagen y un prompt de texto para describir contenido, extraer texto visible o responder preguntas sobre la escena, usando el fichero mmproj junto con los pesos del lenguaje en llama.cpp.
- Prototipado de asistentes multimodales en estaciones de trabajo: con la cuantizacion Q4_K_M (5,1 GB) cabe en una GPU de 8-12 GB de VRAM, lo que permite iterar sobre prompts y flujos de vision sin coste de API.
- Procesamiento por lotes de documentos escaneados: al ejecutarse con llama.cpp en CPU, se puede integrar en pipelines que convierten imagenes de facturas o formularios en texto estructurado en ingles.
- Evaluacion de modelos GRPO para investigacion: sirve como referencia practica para comparar el efecto del entrenamiento por refuerzo frente al Qwen3-VL base en tareas de razonamiento visual.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo local, los datos de imagen no salen del equipo, adecuado para prototipos en sectores regulados.
- Educacion y demos tecnicas: la version Q2_K (3,4 GB) permite ejecutar el modelo en portatiles modestos para demostraciones de vision-lenguaje sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 3,4 GB (Q2_K), 4,9-5,1 GB (Q4_K_S/Q4_K_M), 6,8 GB (Q6_K), 8,8 GB (Q8_0) para los pesos del lenguaje; anadir 0,9-1,3 GB del proyector multimodal mmproj.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8; A100 o H100 solo si se busca maxima precision o throughput agregado.
- Cabe en GPU de consumo: si, desde GPUs de 6-8 GB con Q2_K/Q3_K y desde 8-12 GB con Q4_K_M incluyendo mmproj.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-cpp-python); el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI en plataformas de inferencia, aunque no se detalla.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de 8B en Q4_K_M suele generar decenas de tokens por segundo en GPUs consumer modernas, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PMLLM-Qwen3-VL-8B-DrGRPO-GGUF | 8,19B | no disponible | si (mmproj) | no disponible | GGUF en HuggingFace |
| Qwen3-VL-8B (base de la familia) | ~8B | no disponible en esta ficha | si | segun la familia Qwen (no confirmada para este ajuste) | safetensors y GGUF de terceros |
| Llama 3.1 8B Instruct | 8,03B | 128K | no | Llama 3.1 Community License | amplia disponibilidad en GGUF |
| Gemma 2 9B Instruct | 9,24B | 8K | no | Gemma Terms of Use | amplia disponibilidad en GGUF |

La comparativa es aproximada: no hay datos de rendimiento publicados para este ajuste, por lo que la eleccion frente a alternativas debe basarse en la necesidad de multimodalidad local y en la validacion empirica propia.

## Limitaciones y advertencias

- No se declara licencia en el repositorio, lo que impide confirmar si el uso comercial esta permitido; hay que consultar el modelo base Yeongtak/PMLLM-Qwen3-VL-8B-DrGRPO y, en ultima instancia, la licencia de Qwen3-VL.
- El unico idioma declarado es el ingles; el rendimiento en castellano no esta verificado y puede degradarse.
- No hay benchmarks publicados, por lo que no se puede cuantificar la mejora del ajuste GRPO frente al modelo base.
- Las cuantizaciones son estaticas y no hay versiones imatrix; Q2_K y Q3_K pueden producir degradacion notable en tareas de razonamiento y vision.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en descripcion de imagenes con texto pequeno o ambiguo.
- El ajuste fino procede de un autor individual (Yeongtak) sin documentacion publica sobre el dataset; posibles sesgos no caracterizados.
- La longitud de contexto no esta documentada, lo que dificulta planificar conversaciones largas o documentos extensos.
- El repositorio ocupa 75,3 GB por incluir todas las cuantizaciones; conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PMLLM-Qwen3-VL-8B-DrGRPO-GGUF
- Modelo base: https://huggingface.co/Yeongtak/PMLLM-Qwen3-VL-8B-DrGRPO
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#PMLLM-Qwen3-VL-8B-DrGRPO-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
