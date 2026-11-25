# frankmorales2020/Gemma-4-26B-A4B-alpaca-topo-epoch-1-Q8_0-GGUF

## Resumen

Gemma-4-26B-A4B-alpaca-topo-epoch-1-Q8_0-GGUF es una distribucion cuantizada en formato GGUF (Q8_0) de un ajuste fino del modelo google/gemma-4-26b-a4b, publicado por el usuario frankmorales2020. El ajuste se ha realizado sobre el dataset de instrucciones `alpaca_data_cleaned` durante una unica epoca (400 pasos) aplicando una tecnica propia denominada Topological Continual Backpropagation (Topo-CBP) junto con un optimizador TopoAdamW, con semilla fija 123 y digest de linea base `c573d4a1c789de48`.

El modelo parte de una arquitectura Gemma-4 de tipo Mixture of Experts con 25.233.142.046 parametros totales (segun los pesos en safetensors del modelo base) y un subconjunto activo de aproximadamente 4B, segun se deduce de la nomenclatura "A4B". El ajuste afecta a 738.937.904 parametros entrenables. La validacion reportada por el autor desciende de una perdida de 1,1560 en la linea base a 0,9298 en el punto de control de la epoca 1.

La relevancia de esta ficha es doble: por un lado, ofrece una version GGUF lista para inferencia local con llama.cpp u Ollama de un modelo Gemma-4 de gran tamano; por otro, documenta un experimento de investigacion sobre estabilidad-plasticidad y teoria espectral aritmetica aplicada al ajuste fino. La licencia declarada es Apache-2.0, aunque el modelo base Gemma-4 de Google esta sujeto a los terminos de uso de Gemma, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (Gemma-4), segun modelo base google/gemma-4-26b-a4b |
| Parametros totales | 25.233.142.046 |
| Parametros activos | aproximadamente 4B (deducido de la nomenclatura "A4B"; no confirmado en la model card) |
| Longitud de contexto | no disponible (la evaluacion del autor usa n_ctx=2048) |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (sujeta ademas a los terminos del modelo base Gemma) |
| Formato de pesos | GGUF (fichero `Gemma-4-26B-A4B-alpaca-topo-epoch-1-Q8_0.gguf`, 26,9 GB / 25,02 GiB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base google/gemma-4-26b-a4b, un transformer con capas de mezcla de expertos (MoE) de aproximadamente 25,2B parametros totales y unos 4B activos por token. Sobre esa base se aplico un ajuste fino supervisado con el dataset `alpaca_data_cleaned` durante una epoca (400 pasos), con un regimen de decaimiento coseno de la tasa de aprendizaje que parte de 1,00e-04 y llega a valores en torno a 9,88e-05 en los primeros pasos.

La innovacion tecnica declarada por el autor es Topo-CBP (Topological Continual Backpropagation) combinado con TopoAdamW, un esquema que el autor enmarca en la teoria espectral aritmetica y en el equilibrio estabilidad-plasticidad del aprendizaje continuo. Solo se actualizan 738.937.904 parametros. La reproducibilidad se garantiza con semilla fija 123 y un digest de linea base (`c573d4a1c789de48`). La progresion de perdida de validacion reportada es: linea base 1,1560; paso 100, 0,9458; paso 200, 0,9358; paso 300, 0,9314; paso 400 (epoca 1), 0,9298. No se documentan en la model card detalles sobre composicion exacta del dataset mas alla de `alpaca_data_cleaned`, ni sobre tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto e instrucciones en formato Alpaca, con plantilla `### Instruction:` / `### Response:` y tokens de parada `["### Instruction:", "\n###"]`.
- Razonamiento basico y explicaciones tecnicas: el autor verifica respuestas sobre concurrencia sincrona/asincrona y sobre optimizacion de memoria en entrenamiento.
- Generacion de SQL: se valida una consulta de agregacion (`SUM(total_amount)`) con `GROUP BY` y `ORDER BY` sobre una tabla `orders`.
- Inferencia determinista: con `temperature=0.0` y `seed=123` el autor reporta finalizaciones limpias (`finish_reason=stop`) en todas las pruebas.
- Compatibilidad con llama.cpp y Ollama gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de instrucciones generico en local: el modelo se puede cargar con llama.cpp u Ollama y responder a instrucciones en formato Alpaca, lo que resulta adecuado para prototipos de asistentes sin dependencia de la nube.
- Generacion de SQL en herramientas de analitica: el modelo produce consultas de agregacion correctas sobre esquemas relacionales, por lo que puede integrarse en asistentes de BI que traduzcan lenguaje natural a SQL.
- Explicaciones tecnicas para documentacion: dado su rendimiento en preguntas sobre concurrencia y optimizacion de memoria, puede emplearse para redactar borradores de documentacion tecnica o respuestas de soporte.
- Experimentacion en aprendizaje continuo: al ser un artefacto reproducible (semilla y digest fijos), sirve como referencia para investigar Topo-CBP y estabilidad-plasticidad en ajuste fino de modelos grandes.
- Despliegue en entornos de borde con GPU de gran capacidad: el GGUF Q8_0 permite ejecutar el modelo con llama.cpp en estaciones de trabajo con suficiente VRAM, sin necesidad de infraestructura de servidor.
- Evaluacion comparativa de cuantizaciones: al existir solo Q8_0 en este repositorio, puede usarse como referencia de calidad casi sin perdida frente a futuras cuantizaciones menores del mismo ajuste.
- Reproduccion de experimentos: el notebook enlazado por el autor permite repetir el ajuste y la cuantizacion, util para validar resultados en entornos CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion sobre `alpaca_data_cleaned`:

| Punto de control | Perdida de validacion |
|---|---|
| Linea base | 1,1560 |
| Paso 100 | 0,9458 |
| Paso 200 | 0,9358 |
| Paso 300 | 0,9314 |
| Paso 400 (epoca 1) | 0,9298 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 26,9 GB (25,02 GiB); se necesita al menos esa cantidad de VRAM para cargar todas las capas en GPU (`n_gpu_layers=-1`), mas overhead de cache KV.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, RTX 6000 Ada 48 GB o similares con 32 GB o mas de VRAM.
- Cabe en GPU de consumo: en RTX 4090 (24 GB) no cabe el Q8_0 completo en VRAM; requeriria descarga parcial a CPU o una cuantizacion menor no publicada en este repositorio.
- Opciones de despliegue: llama.cpp y llama-cpp-python (verificado por el autor), Ollama (etiqueta declarada), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; el autor no reporta tokens por segundo. La evaluacion se realizo con `n_ctx=2048`, `flash_attn=True`, `temperature=0.0` y `seed=123`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-alpaca-topo-epoch-1-Q8_0 (este) | 25,2B | ~4B | no disponible | Apache-2.0 (+ terminos Gemma) | GGUF Q8_0 |
| google/gemma-4-26b-a4b (base) | 25,2B | ~4B | no disponible | Terminos de uso de Gemma | safetensors |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste se limita a una epoca sobre `alpaca_data_cleaned`; no hay evidencia de evaluaciones extensas mas alla de tres prompts de verificacion.
- No se documentan sesgos conocidos, pero al derivar de Gemma-4 y de Alpaca puede heredar sesgos de ambos.
- Riesgo de alucinacion: no evaluado; el autor no reporta pruebas de factualidad.
- Idiomas soportados no declarados; el ajuste con Alpaca esta predominantemente en ingles, lo que puede degradar el rendimiento en castellano.
- La licencia Apache-2.0 declarada en el repositorio puede entrar en conflicto con los terminos de uso del modelo base Gemma-4 de Google; conviene revisar ambos antes de un uso comercial.
- El contexto de evaluacion es de 2048 tokens; no se confirma la ventana maxima real del modelo base.
- El repositorio tiene 175 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- El modelo esta pensado para inferencia determinista con temperatura 0; no se han evaluado modos creativos o de muestreo.
- El nombre del autor y las tecnicas (Topo-CBP, TopoAdamW) no cuentan con publicacion revisada por pares en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/frankmorales2020/Gemma-4-26B-A4B-alpaca-topo-epoch-1-Q8_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b
- Codigo del experimento (notebook): https://github.com/frank-morales2020/AST/blob/main/gemma4_topo_cbp_gguf.ipynb
- Repositorio AST: https://github.com/frank-morales2020/AST
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de cache SWA en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/13194
