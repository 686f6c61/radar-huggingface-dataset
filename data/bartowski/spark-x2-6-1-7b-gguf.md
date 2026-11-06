# bartowski/Spark-X2.6-1.7B-GGUF

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje de 1.707.657.216 parametros desarrollado por XHToken y publicado originalmente en formato safetensors bajo licencia Apache 2.0. Esta ficha cubre la version cuantizada en GGUF elaborada por bartowski mediante llama.cpp (release b11969) con calibracion imatrix, orientada a inferencia local y despliegue en entornos con recursos limitados.

El modelo se presenta como un LLM conversacional de proposito general con soporte para ingles y chino, e incorpora un canal de razonamiento explicito ("thinking channel") controlable mediante el parametro `thinking_effort`, con valores `low` y `high`. Tambien documenta un formato de prompt especifico para definicion de herramientas (tool calling), lo que lo situa en la categoria de modelos pequenos con capacidades de agente.

Su relevancia actual radica en la combinacion de tamano reducido (1.7B parametros), licencia permisiva Apache 2.0 y disponibilidad de cuantizaciones desde 0.83 GB (Q3_K_M) hasta 3.42 GB (bf16), lo que permite ejecutarlo en hardware de consumo. La informacion disponible no incluye datos sobre arquitectura interna, longitud de contexto ni composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS (y sucesivas segun la model card) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el checkpoint original |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo (tipo de transformer, atencion, posible uso de MoE o capas hibridas) en la documentacion proporcionada. La model card del repositorio GGUF unicamente indica que se trata de un checkpoint de 2B parametros (el dato real de safetensors es 1.707.657.216), con soporte de entrada de texto y sin decodificacion especulativa.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica innovacion tecnica documentada es la presencia de un canal de razonamiento con esfuerzo configurable (`thinking_effort` con valores `low` y `high`) y un formato de prompt estructurado con tokens especiales (`<|System|>`, `<|User|>`, `<|Bot|>`, `<think>`) que incluye una seccion `## Tools` para declarar funciones disponibles en formato JSON.

Las cuantizaciones de bartowski se generaron con llama.cpp b11969 e incluyen calibracion imatrix, lo que mejora la fidelidad de los pesos cuantizados respecto a cuantizaciones sin matriz de importancia.

## Capacidades

- Generacion de texto conversacional multi-turno con formato de prompt definido.
- Razonamiento explicito mediante canal de pensamiento (`<think>`) con nivel de esfuerzo configurable (`low` / `high`).
- Soporte de tool calling / function calling mediante declaracion de herramientas en el system prompt en formato JSON.
- Capacidad de agentes y razonamiento multi-paso derivada del canal de pensamiento y del soporte de herramientas.
- Multilingue limitado a ingles y chino.
- Entrada exclusivamente de texto (no se documenta vision ni audio).
- Compatible con endpoints (tag `endpoints_compatible` en Hugging Face).
- Sin decodificacion especulativa.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en un portatil con 8 GB de RAM usando la cuantizacion Q4_K_M (1.09 GB) y gestionar dialogos multi-turno en ingles o chino con un consumo de memoria minimo.
- Agente con tool calling en entornos embebidos: gracias al formato de herramientas documentado, puede integrarse en un bucle de agente que consulte APIs (por ejemplo, precios de acciones) y devuelva respuestas estructuradas, con la ventaja de que el modelo completo cabe en una GPU de gama baja.
- Razonamiento con presupuesto controlado: el parametro `thinking_effort` permite ajustar la profundidad de razonamiento segun la latencia tolerada, util en pipelines por lotes donde se prioriza el coste frente a la precision.
- Prototipado rapido de aplicaciones LLM: al estar disponible en GGUF con licencia Apache 2.0, sirve para validar pipelines con llama.cpp, Ollama o servidores compatibles con OpenAI antes de escalar a modelos mayores.
- Procesamiento de texto en chino e ingles: adecuado para tareas de traduccion, resumen o clasificacion bilingue en despliegues con restricciones de hardware.
- Filtrado y preprocesado en el borde (edge computing): con cuantizaciones de menos de 1 GB (IQ3_XS, Q3_K_M) puede ejecutarse en dispositivos con poca memoria para tareas de normalizacion, extraccion de entidades o generacion de respuestas cortas.
- Base para fine-tuning ligero: el checkpoint original en safetensors y la licencia permisiva facilitan el ajuste fino para dominios especificos antes de recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas el contexto. Q4_K_M ocupa 1.09 GB; Q8_0, 1.82 GB; bf16, 3.42 GB. Con contextos largos hay que sumar la cache KV, cuyo tamano no puede calcularse sin conocer la longitud de contexto y la arquitectura.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para cuantizaciones Q4/Q5; una RTX 3060 de 12 GB o superior permite ejecutar bf16 con contexto amplio. Para entornos profesionales, A100 o H100 no son necesarias por tamano, pero pueden usarse para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas (GTX 1060 6 GB, RTX 3050, RTX 4060, etc.) con cuantizaciones Q4 o inferiores. Tambien es viable en CPU pura y en Apple Silicon.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo indica), y cualquier runtime que soporte GGUF. vLLM y TGI requeririan los pesos en safetensors, no incluidos en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B (esta ficha) | 1.707.657.216 | no disponible | Apache 2.0 | GGUF (repo de bartowski); safetensors en el original | Canal de pensamiento configurable y tool calling documentado |
| Qwen2.5-1.5B | 1.5B (aprox.) | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Alternativa pequena multilingue de Alibaba; comparacion no verificada con datos de benchmark |
| Llama 3.2 1B | 1.2B (aprox.) | no disponible en esta ficha | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta con licencia no Apache; comparacion no verificada |
| Gemma 2 2B | 2B (aprox.) | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF | Alternativa de Google con licencia restrictiva; comparacion no verificada |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la tabla recoge unicamente caracteristicas generales de categoria y debe verificarse contra las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado principalmente en ingles y chino, es previsible un sesgo linguistico y cultural hacia esos idiomas.
- Riesgo de alucinacion: inherente a los LLM de este tamano; no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion.
- Limitaciones de contexto e idioma: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado. La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene revisar la licencia del checkpoint original (XHToken/Spark-X2.6-1.7B) por si hubiera terminos adicionales no reflejados en esta ficha.
- Caveats para produccion: las cuantizaciones por debajo de Q4 pueden degradar la calidad de forma notable; la model card advierte que Q3_K_M es de "baja calidad". No hay datos de throughput ni de latencia, por lo que es necesario medir en el hardware objetivo antes de desplegar. La ausencia de decodificacion especulativa limita las optimizaciones de latencia disponibles.
- El repositorio GGUF no incluye los pesos en safetensors; para servir con vLLM o TGI hay que acudir al checkpoint original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- llama.cpp (release b11969): https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
