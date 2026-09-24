# mradermacher/gladios-tiny.story-0.1B-GGUF

## Resumen

Gladios Tiny Story 0.1B es un modelo de generacion de texto de tipo transformer decoder-only, con una arquitectura estilo GPT-2, desarrollado por Plimb ai y entrenado integramente desde cero (sin reutilizar pesos preentrenados de ningun otro modelo). Con aproximadamente 124 millones de parametros (124.046.592 exactamente, segun los pesos en safetensors), esta disenado especificamente para generar historias cortas y sencillas en ingles, usando como corpus el conjunto de datos TinyStories de Ronen Eldan, compuesto por unos 2,1 millones de relatos infantiles.

La ficha que nos ocupa no corresponde al modelo original, sino a la version cuantizada en formato GGUF publicada por mradermacher, un creador conocido por distribuir cuantizaciones estaticas de modelos abiertos. El repositorio incluye doce variantes de cuantizacion (desde Q2_K hasta f16) pensadas para ejecucion en llama.cpp y entornos similares, con tamanos de archivo que van de 0,2 GB a 0,4 GB. Esto lo convierte en un modelo extremadamente ligero, apto para CPU, dispositivos de gama baja y experimentacion rapida.

Su relevancia actual es principalmente practica y educativa: sirve como banco de pruebas para pipelines de inferencia local, generacion de datos sinteticos infantiles y validacion de flujos de cuantizacion. No es un modelo de proposito general ni compite con LLM modernos; su interes radica en su tamano minimo, su licencia MIT permisiva y su naturaleza reproducible desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | 124.046.592 (~124M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de estilo GPT-2, entrenada desde cero sobre el dataset TinyStories (roneneldan/TinyStories), que contiene aproximadamente 2,1 millones de historias breves y sintacticamente simples en ingles. El autor (Plimb ai) destaca explicitamente que no se reutilizaron pesos preentrenados de ningun modelo previo, lo que lo convierte en un ejemplo de entrenamiento puramente from-scratch a pequena escala.

No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento, la composicion interna del dataset, la tokenizer empleada ni si hubo fases de ajuste fino con RLHF o DPO. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o variantes de atencion dispersa. La ficha de mradermacher unicamente documenta el proceso de cuantizacion: cuantizaciones estaticas (sin imatrix ni ponderacion por importancia) generadas con llama.cpp a partir del modelo base en safetensors.

## Capacidades

- Generacion de texto narrativo breve en ingles, orientado a historias infantiles simples.
- Continuacion de prompts con coherencia gramatical en frases cortas.
- Generacion de datos sinteticos de baja complejidad para experimentos de destilacion o entrenamiento de modelos aun mas pequenos.
- Ejecucion local en CPU o GPU de gama baja gracias a su tamano reducido.
- Soporte de los doce formatos de cuantizacion GGUF listados, lo que permite ajustar el equilibrio entre tamano y calidad.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues: limitadas al ingles; no hay evidencia de soporte de otros idiomas.
- No se documenta una ventana de contexto especifica ni capacidades de contexto largo.

## Casos de uso

- Generacion de cuentos infantiles: el modelo puede producir relatos breves y sencillos en ingles, adecuados para prototipos de aplicaciones de narracion para ninos, dado que fue entrenado exclusivamente con el corpus TinyStories.
- Generacion de datos sinteticos para entrenamiento: util para crear corpus de historias simples con los que entrenar o evaluar modelos mas pequenos o sistemas de clasificacion de texto, reduciendo la dependencia de datos reales anotados.
- Pruebas de pipelines de inferencia: al ocupar 0,2-0,4 GB y caber en cualquier maquina, es un candidato ideal para validar integraciones con llama.cpp, Ollama u otros runners antes de escalar a modelos mayores.
- Educacion e investigacion: permite estudiar el comportamiento de un transformer pequeno entrenado desde cero y analizar el efecto de distintas cuantizaciones sobre la calidad de generacion.
- Despliegue en dispositivos de borde: su tamano minimo facilita ejecutarlo en Raspberry Pi, moviles de gama alta o sistemas embebidos con memoria limitada, para demos de generacion de texto sin conexion.
- Demostraciones y workshops: sirve como ejemplo didactico de cuantizacion GGUF y de comparacion entre niveles de compresion (Q2_K frente a Q8_0 o f16) en cursos y tutoriales.
- Filtrado o preprocesado de prompts: puede usarse como componente ligero para completar o normalizar texto en tareas auxiliares donde no se requiere alta calidad.
- Pruebas de carga y benchmarking de servidores: su baja huella permite medir throughput y latencia de infraestructura de inferencia sin consumir recursos significativos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo base ni la del repositorio GGUF incluyen puntuaciones de MMLU, HumanEval, GSM8K, perplexity ni metricas equivalentes. La unica referencia grafica en la ficha de mradermacher es un enlace a una comparativa generica de tipos de cuantizacion (grafico de ikawrakow), no especifica de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): aproximadamente 0,4 GB en f16, 0,2 GB en Q8_0 y 0,2 GB en las cuantizaciones Q4/Q5/Q6 (tamanos de archivo declarados por el autor).
- Memoria total recomendada: menos de 1 GB de RAM o VRAM en cualquiera de los formatos cuantizados, incluyendo el overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en GTX 1050, RTX 2060, RTX 3060, RTX 4090 o superiores sin aprovechar su capacidad. El modelo esta sobredimensionado para hardware moderno.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo e incluso en iGPU integradas.
- Ejecucion en CPU: totalmente viable; es probablemente el modo de despliegue mas habitual dado el tamano.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers y text-generation-inference.
- Latencia y throughput: no disponible. No se han publicado mediciones concretas de tokens por segundo.

## Comparativa con modelos similares

Solo es posible comparar el repositorio cuantizado con su propio modelo base; no se dispone de datos verificables de otros modelos comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/gladios-tiny.story-0.1B-GGUF | 124.046.592 | no disponible | GGUF (12 cuantizaciones) | MIT | HuggingFace |
| plimb/gladios-tiny.story-0.1B (base) | 124.046.592 | no disponible | safetensors | MIT | HuggingFace |
| Otros modelos de la familia TinyStories | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con TinyStories, un corpus de historias infantiles muy simples; su vocabulario, complejidad sintactica y conocimiento del mundo son muy limitados.
- Riesgo elevado de alucinacion y de generar texto incoherente o repetitivo fuera del dominio de historias cortas.
- No apto para tareas de razonamiento, matematicas, codigo, analisis factual ni asistencia tecnica.
- Idioma limitado al ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no debe asumirse una ventana amplia.
- No se documentan fases de alineacion (RLHF/DPO) ni filtros de seguridad, por lo que puede producir contenido no deseado si se fuerza con prompts inapropiados.
- Las cuantizaciones muy agresivas (Q2_K, Q3_K_S/Q/M/L, IQ4_XS) degradan la calidad respecto a f16; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M o Q8_0 para calidad y velocidad.
- Aunque la licencia MIT permite uso comercial, el modelo no esta pensado para produccion real por su limitada capacidad.
- El repositorio GGUF no incluye cuantizaciones ponderadas por imatrix; el autor indica que podrian no estar disponibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gladios-tiny.story-0.1B-GGUF
- Modelo base: https://huggingface.co/plimb/gladios-tiny.story-0.1B
- Repositorio GitHub del modelo: https://github.com/Plimb-ai/gladios-tiny-story
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Pagina de vision general del autor: https://hf.tst.eu/model#gladios-tiny.story-0.1B-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil de mradermacher: https://huggingface.co/mradermacher
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Directorio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
