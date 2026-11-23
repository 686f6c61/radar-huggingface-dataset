# mradermacher/insomnia_v2-GGUF

## Resumen

insomnia_v2 es un modelo de lenguaje pequeno basado en la arquitectura GPT-2, desarrollado originalmente por el usuario recoilme y distribuido en formato GGUF por mradermacher. Con 163.037.184 parametros totales, se trata de un modelo de escala reducida orientado especificamente a la generacion de prompts sinteticos, entrenado sobre el dataset recoilme/SyntheticPrompts. Su relevancia radica en que es un modelo especializado y ligero, pensado para tareas concretas de generacion de instrucciones y prompts, no como un modelo de proposito general.

El modelo se distribuye principalmente como cuantizaciones GGUF estaticas, lo que facilita su despliegue en entornos con recursos limitados, incluyendo CPU y GPUs de consumo. La ficha que nos ocupa corresponde al repositorio de cuantizaciones de mradermacher, que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta f16), con tamanos que van desde 0,2 GB hasta 0,4 GB.

Es importante senalar que se dispone de informacion muy limitada sobre el modelo: no hay datos publicados de benchmarks, no se especifica la longitud de contexto, y la model card del repositorio de cuantizaciones no incluye detalles sobre el entrenamiento o las capacidades. Esta ficha refleja fielmente la informacion disponible, indicando explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 163.037.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only clasico con atencion causal. Con 163 millones de parametros, se situa en la gama de modelos tipo GPT-2 small/medium. El modelo base (recoilme/insomnia_v2) fue entrenado sobre el dataset recoilme/SyntheticPrompts, lo que sugiere una especializacion en la generacion de prompts sinteticos y textos relacionados con instrucciones.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La model card del repositorio de cuantizaciones no aporta estos datos, y no se ha proporcionado informacion adicional sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Las cuantizaciones son estaticas (no se ofrecen variantes con imatrix/weighted en el momento de la publicacion).

## Capacidades

- Generacion de texto autoregresiva basica, propia de un modelo GPT-2.
- Especializacion en generacion de prompts sinteticos e instrucciones, segun el dataset de entrenamiento declarado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Razonamiento avanzado, codigo y matematicas: no documentado; por tamano y arquitectura, no es esperable un rendimiento competitivo en estas areas.

## Casos de uso

- Generacion de prompts sinteticos para aumento de datos: el modelo puede producir variaciones de instrucciones y prompts que alimenten pipelines de entrenamiento de otros modelos o de sistemas de evaluacion, aprovechando su entrenamiento sobre SyntheticPrompts.
- Prototipado rapido en local: gracias a su tamano reducido (0,2-0,4 GB en GGUF), permite experimentar con generacion de texto en portatiles o equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Generacion de texto creativo breve en ingles: util para demos, pruebas de concepto y entornos educativos donde se necesita un modelo ligero y de licencia permisiva (MIT).
- Filtrado y clasificacion ligera de texto: su bajo coste computacional permite integrarlo en tareas de preprocesamiento o generacion de candidatos que luego se refinan con modelos mayores.
- Educacion e investigacion sobre LLMs: sirve como caso de estudio de un modelo GPT-2 especializado y de un flujo de cuantizacion GGUF completo con multiples niveles de calidad.
- Despliegue en entornos con restricciones de hardware: al caber en CPU y en GPUs de gama baja, puede usarse en dispositivos embebidos o servidores sin aceleradores para tareas de generacion de prompts de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para cuantizaciones Q2_K-Q5_K_M, 0,3 GB para Q8_0 y 0,4 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo es viable incluso en GPUs integradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1050, RTX 3060, RTX 4090, etc.), e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera una latencia muy baja en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| insomnia_v2 (este) | 163 M | no disponible | MIT | GGUF, safetensors | Especializado en generacion de prompts |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | safetensors, GGUF | Modelo generalista de referencia |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | safetensors, GGUF | Mayor capacidad generalista |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | safetensors, GGUF | Version destilada de GPT-2 |

La comparativa se limita a modelos de la misma familia y escala, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas especializadas en generacion de prompts.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset sintetico no publico en detalle, no es posible evaluar sesgos de forma rigurosa.
- Riesgo de alucinacion: elevado en un modelo de 163 M de parametros; no debe usarse para tareas que requieran precision factual.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada, aunque por la arquitectura GPT-2 es probable que sea limitada (tipicamente 1024 tokens en esta familia, aunque no confirmado para este modelo).
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero conviene verificar la licencia del modelo base original (recoilme/insomnia_v2) y del dataset.
- Caveats para produccion: modelo de muy baja capacidad; no es adecuado para tareas de razonamiento, codigo o atencion al cliente de calidad. Su uso recomendado es experimental o como componente auxiliar en pipelines de generacion de prompts.
- Las cuantizaciones son estaticas; no se ofrecen variantes con imatrix/weighted, lo que puede afectar a la calidad en niveles bajos de cuantizacion.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/insomnia_v2-GGUF
- Modelo base: https://huggingface.co/recoilme/insomnia_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/recoilme/SyntheticPrompts
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#insomnia_v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
