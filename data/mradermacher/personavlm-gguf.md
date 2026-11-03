# mradermacher/PersonaVLM-GGUF

## Resumen
PersonaVLM es un modelo multimodal de lenguaje (MLLM) orientado a la personalización y a la memoria a largo plazo en agentes conversacionales. El modelo original lo desarrolla ClareNie y esta ficha describe la version cuantizada en formato GGUF publicada por mradermacher. El objetivo del modelo es mantener y evolucionar un perfil de personalidad coherente a lo largo de interacciones prolongadas, conservando informacion del usuario en memoria de largo plazo, algo que los modelos conversacionales genericos no abordan de forma nativa.

La version aqui documentada es una conversion estatica a GGUF del modelo base ClareNie/PersonaVLM, con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones) y licencia Apache 2.0. El repositorio incluye tanto los pesos del modelo en multiples cuantizaciones como los ficheros mmproj necesarios para el procesamiento multimodal (vision). Esta pensado para su uso con llama.cpp y entornos compatibles con GGUF.

La relevancia actual del modelo radica en su enfoque en la memoria persistente y la evolucion de personalidad, un area de creciente interes para asistentes personales y agentes de IA. El modelo esta asociado a un benchmark propio (Persona-MME) y a un dataset especifico (PersonaVLM-Dataset), y sus etiquetas lo vinculan a CVPR 2026, lo que sugiere un trabajo de investigacion reciente en el ambito de los MLLM personalizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal tipo MLLM; arquitectura interna no especificada en la informacion) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo (tipo de transformer, uso de atencion, componentes de vision, etc.). Las etiquetas indican que se trata de un modelo multimodal (MLLM) personalizado, con capacidades de memoria a largo plazo y evolucion de personalidad. El modelo base es ClareNie/PersonaVLM y esta version es una conversion estatica a GGUF realizada por mradermacher, sin informacion adicional sobre el proceso de cuantizacion mas alla de los tipos disponibles.

En cuanto al entrenamiento, la model card referencia dos datasets: ClareNie/Persona-MME (probablemente el benchmark de evaluacion) y ClareNie/PersonaVLM-Dataset (datos de entrenamiento). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Tampoco se detallan innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. Toda esta informacion figura como no disponible.

## Capacidades
- Generacion de texto conversacional en ingles.
- Procesamiento multimodal: el repositorio incluye ficheros mmproj, lo que indica soporte de entrada de imagenes (vision).
- Memoria a largo plazo: el modelo esta disenado para retener y utilizar informacion de interacciones previas.
- Personalidad evolutiva: capacidad de adaptar y mantener un perfil de personalidad coherente a lo largo del tiempo.
- Orientado a agentes de IA: las etiquetas indican uso como ai-agent.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Asistentes personales con memoria persistente: el modelo puede recordar preferencias, historial y detalles del usuario entre sesiones, lo que permite conversaciones coherentes a largo plazo sin repetir contexto. Es adecuado por su enfoque explicito en memoria de largo plazo.
- Agentes conversacionales con personalidad definida: util para desplegar un asistente con un perfil de personalidad estable y evolutivo, por ejemplo en atencion al cliente o acompanamiento, donde la coherencia de tono y caracter es relevante.
- Sistemas de acompanamiento o coaching: al mantener un perfil del usuario y adaptarse con el tiempo, puede emplearse en aplicaciones de seguimiento personal (habitos, aprendizaje) donde la continuidad importa.
- Analisis de imagenes en contexto conversacional: gracias al componente mmproj, puede recibir imagenes junto con texto, util en asistentes que interpretan capturas, documentos escaneados o fotos dentro de una conversacion.
- Prototipado de investigacion en MLLM personalizados: investigadores pueden usar las cuantizaciones GGUF para experimentar con el modelo en entornos de recursos limitados y comparar con el benchmark Persona-MME.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q4_K_S (4,6-4,8 GB) permiten ejecutar el modelo en hardware de consumo para pruebas y demos de agentes personalizados.
- Integracion en pipelines de agentes con llama.cpp: al estar en formato GGUF, puede incorporarse en aplicaciones que usan llama.cpp u otros runners compatibles para agentes conversacionales con estado persistente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin contar contexto ni mmproj): Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q3_K_M ~3,9 GB; Q3_K_L ~4,2 GB; IQ4_XS ~4,4 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_S ~5,4 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB.
- Componente multimodal adicional: mmproj-Q8_0 ~1,0 GB o mmproj-f16 ~1,5 GB.
- GPU recomendadas: no disponible de forma especifica. Por tamano, las cuantizaciones Q4-Q5 caben en GPUs de consumo con 8 GB o mas de VRAM; Q8_0 requiere aproximadamente 8-10 GB; f16 requiere alrededor de 16 GB o mas.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M/Q4_K_S (aproximadamente 4,8 GB) en tarjetas con 8 GB de VRAM o superiores; las versiones de mayor precision requieren mas VRAM.
- Opciones de despliegue: llama.cpp y runners compatibles con GGUF; el modelo base usa transformers. No se confirma soporte especifico de vLLM, TGI u Ollama en la informacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone en la informacion proporcionada de datos de rendimiento ni de modelos comparables de la misma categoria (MLLM personalizados con memoria a largo plazo). La comparativa cuantitativa figura como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| PersonaVLM (esta ficha, GGUF) | ~7,6 B | no disponible | apache-2.0 | GGUF |
| ClareNie/PersonaVLM (base) | ~7,6 B | no disponible | apache-2.0 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al ser un modelo entrenado con datos no especificados, pueden existir sesgos no declarados.
- Alucinacion: no hay datos sobre tasas de alucinacion; como todo MLLM, existe riesgo de generar informacion incorrecta, especialmente al integrar memoria de largo plazo.
- Memoria persistente: el almacenamiento de informacion del usuario plantea consideraciones de privacidad y proteccion de datos que deben gestionarse en produccion.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar su uso en escenarios de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base ClareNie/PersonaVLM y de los datasets asociados.
- Esta version es una cuantizacion de terceros (mradermacher); la calidad puede diferir del modelo original en funcion del tipo de cuantizacion elegido (las Q2/Q3 pierden calidad).
- No se dispone de benchmarks publicados que permitan validar su rendimiento frente a alternativas.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/PersonaVLM-GGUF
- Modelo base: https://huggingface.co/ClareNie/PersonaVLM
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/PersonaVLM-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#PersonaVLM-GGUF
- Dataset de evaluacion: https://huggingface.co/datasets/ClareNie/Persona-MME
- Dataset de entrenamiento: https://huggingface.co/datasets/ClareNie/PersonaVLM-Dataset
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
