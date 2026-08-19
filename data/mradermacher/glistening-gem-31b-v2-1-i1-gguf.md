# mradermacher/Glistening-Gem-31B-v2.1-i1-GGUF

## Resumen

Glistening-Gem-31B-v2.1-i1-GGUF es una cuantización GGUF del modelo Glistening-Gem-31B-v2.1, un merge basado en Gemma 4 31B creado por sophosympatheia y cuantizado por mradermacher. El modelo original es un mergekit merge que combina capas de distintos modelos derivados de Gemma 4 31B, una arquitectura transformer multimodal de Google DeepMind con 31B parámetros y ventana de contexto de 128K tokens. Esta versión GGUF con imatrix permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles.

La relevancia de esta ficha radica en que Glistening-Gem-31B-v2.1 es un modelo de la familia Gemma 4 con capacidades de razonamiento avanzado y modo de pensamiento configurable, y esta cuantización facilita su despliegue local. El repositorio incluye un único archivo cuantizado (i1-Q2_K, 12 GB) y el archivo imatrix para generar cuantizaciones personalizadas. El modelo está etiquetado como "not-for-all-audiences", lo que sugiere que puede generar contenido no apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 31B, mergekit merge) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible |
| Longitud de contexto | 128K (modelo base; verificar en runtime) |
| Tipos de cuantizacion | i1-Q2_K (12 GB); imatrix para cuantizaciones personalizadas; static quants disponibles en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Glistening-Gem-31B-v2.1 es un merge realizado con mergekit que combina capas de modelos basados en Gemma 4 31B. Gemma 4 es una familia de modelos multimodales de Google DeepMind que acepta entrada de texto e imagen y genera texto, con soporte de audio en los modelos pequeños. La arquitectura base incorpora un modo de razonamiento configurable ("thinking mode") que permite al modelo deliberar antes de responder, similar a los modelos reasoning de OpenAI. El merge conserva las capacidades del modelo base, incluyendo la ventana de contexto de 128K tokens.

Los detalles especificos del merge (composicion de capas, modelos combinados, proporcion de cada uno) no estan publicados en la informacion disponible. El modelo original de sophosympatheia no documenta el proceso de entrenamiento, datos utilizados ni si se aplico RLHF o DPO. La cuantizacion i1-Q2_K fue realizada por mradermacher utilizando imatrix, una tecnica que optimiza los cuantizadores basandose en la distribucion de activaciones del modelo, mejorando la calidad respecto a cuantizaciones estaticas del mismo tamaño.

## Capacidades

- Generacion de texto y razonamiento avanzado: hereda las capacidades de Gemma 4 31B, disenado como razonador de alta capacidad.
- Modo de pensamiento configurable: el modelo base soporta thinking mode, permitiendo decidir si el modelo razona de forma extensa o responde directamente.
- Multimodal (vision): el modelo base acepta entrada de imagenes junto con texto, aunque esta capacidad requiere el archivo mmproj que se encuentra en el repositorio de cuantizaciones estaticas.
- Conversacion multi-turno: apto para dialogos extensos gracias a la ventana de 128K tokens.
- Tool calling / function calling: no confirmado explicitamente, pero probable dada la base Gemma 4.
- Multilingue: el modelo base soporta multiples idiomas, aunque esta cuantizacion solo declara ingles.

## Casos de uso

- Asistente local de programacion: con 31B parametros y cuantizacion Q2_K, puede ejecutarse en una GPU de 16 GB VRAM, ofreciendo asistencia de codigo con contexto amplio (hasta 128K tokens) sin depender de APIs externas.
- Analisis de documentos largos: la ventana de 128K tokens permite procesar documentos extensos, contratos o codebases completas en una sola pasada, resumiendo o extrayendo informacion relevante.
- Desarrollo de agentes conversacionales: su capacidad de razonamiento y modo de pensamiento lo hacen adecuado para construir agentes que planifican y ejecutan tareas multi-paso, aunque requiere verificar el soporte de tool calling.
- Investigacion academica: util para experimentos de generacion de texto, analisis de sentimiento o generacion de datasets sinteticos en ingles, gracias a su licencia Apache 2.0 que permite uso comercial y modificacion.
- Prototipado rapido de aplicaciones NLP: al poder ejecutarse localmente via Ollama o llama.cpp, permite iterar rapidamente sobre prompts y flujos de trabajo sin coste por token.
- Generacion de contenido creativo: su naturaleza "not-for-all-audiences" indica que puede producir contenido sin filtros estrictos, util para ficcion, roleplay o escritura creativa sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original (Glistening-Gem-31B-v2.1) no incluye metricas de MMLU, HumanEval, GSM8K u otros tests estandar en su model card. La cuantizacion Q2_K introduce degradacion de calidad respecto al modelo en full precision, pero no se dispone de datos cuantitativos sobre la perdida exacta.

## Requisitos de hardware

- VRAM estimada: el archivo i1-Q2_K ocupa 12 GB, por lo que se recomienda al menos 16 GB de VRAM para inferencia comoda (incluyendo overhead de KV cache y activaciones). Con contexto de 128K, la VRAM necesaria aumentara significativamente.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), A100 40GB, o GPUs profesionales con 24 GB o mas para contexto largo.
- Consumer GPU: si, cabe en GPUs de 16 GB (RTX 4080, 4090 laptop) con cuantizacion Q2_K y contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: no disponible. Depende del hardware y la longitud de contexto; en una RTX 4090 se esperan velocidades de 20-40 tokens/s con Q2_K, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Glistening-Gem-31B-v2.1-i1-GGUF | 30.7B | 128K | Apache 2.0 | GGUF | Merge de Gemma 4, cuantizacion Q2_K |
| google/gemma-4-31b (original) | 31B | 128K | Gemma license | safetensors | Modelo base multimodal, requiere mas VRAM |
| trohrbaugh/gemma-4-31b-it-heretic-ara | 31B | 128K | no disponible | safetensors/GGUF | Variante abliterated (sin censura) de Gemma 4 |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 license | GGUF/safetensors | Mucho mas pequeno, corre en 8 GB VRAM, menos capaz |

La comparativa muestra que Glistening-Gem-31B-v2.1 es un modelo de gama alta en tamaño, con la ventaja de la licencia Apache 2.0 frente a la licencia Gemma de Google, que tiene restricciones de uso. Su cuantizacion Q2_K lo hace accesible en hardware de consumo, a costa de calidad respecto al modelo original.

## Limitaciones y advertencias

- Cuantizacion agresiva: el unico archivo disponible es Q2_K, que degrada significativamente la calidad del modelo. Para mejor fidelidad, es necesario generar cuantizaciones superiores (Q4_K, Q5_K, etc.) usando el archivo imatrix incluido.
- Solo ingles: la model card declara unicamente soporte para ingles, aunque el modelo base Gemma 4 es multilingue. El rendimiento en otros idiomas no esta garantizado.
- Contenido sin filtrar: la etiqueta "not-for-all-audiences" indica que el modelo puede generar contenido explicito, ofensivo o inapropiado. No es adecuado para aplicaciones dirigidas a menores o entornos corporativos sin moderacion.
- Capacidad multimodal condicionada: la vision por computadora requiere el archivo mmproj del repositorio de cuantizaciones estaticas; este repositorio no lo incluye.
- Sin benchmarks publicados: no hay datos de rendimiento comparativo, lo que dificulta evaluar la calidad real del merge frente a alternativas.
- Mantenimiento comunitario: es una cuantizacion de un merge comunitario, no un modelo oficial de Google. La calidad y el soporte dependen de la comunidad.
- Riesgo de alucinacion: como todos los LLM, puede inventar informacion con alta confianza, especialmente en tareas de razonamiento complejo o con contexto largo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Glistening-Gem-31B-v2.1-i1-GGUF
- Modelo base: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Glistening-Gem-31B-v2.1-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Pagina de peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Gemma 4 31B en LM Studio: https://lmstudio.ai/models/google/gemma-4-31b
- Variante abliterated (gemma4-heretical): https://github.com/pmarreck/gemma4-heretical
- Guia de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
