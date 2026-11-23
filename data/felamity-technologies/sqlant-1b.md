# Felamity-Technologies/sqlant-1b

## Resumen

SQLant-1B es un sistema de text-to-SQL especializado en SQLite, desarrollado por Felamity-Technologies. No es un modelo entrenado desde cero, sino un conjunto de dos adaptadores LoRA (generador y verificador) sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct, acompañados de código no aprendido para poda de esquemas, reparación de SQL y ajuste de valores literales. El objetivo es traducir una pregunta en inglés, junto con un esquema de base de datos y una pista opcional, a una única consulta SQL ejecutable.

La relevancia del proyecto reside en su enfoque de sistema completo sobre un modelo pequeño: en lugar de escalar parámetros, combina generación con múltiples candidatos, autocoherencia por votación de resultados y un verificador entrenado que responde sí/no sobre la corrección de cada candidato. Con ello alcanza 58,3 de exactitud de ejecución (EX) en BIRD dev y 77,2 en Spider dev, partiendo de un modelo base de 1,54B parámetros que sin ajuste obtiene 29,5 y 65,4 respectivamente.

El sistema está pensado para ejecutarse localmente, tanto con PyTorch (transformers + peft sobre CUDA, MPS o CPU) como con MLX en Apple Silicon. Se desarrolló en un Apple M5 Pro con 24 GB de memoria. La licencia es Apache 2.0 y el idioma de trabajo es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct) con dos adaptadores LoRA de rango 16 (generador y verificador) sobre las capas 1-27 |
| Parametros totales | 1,54B en el modelo base (1,31B sin embeddings); aproximadamente 1,54B + 2 x 18M con ambos adaptadores cargados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT LoRA en safetensors (generator/ y verifier/); misma ponderación en formato MLX (mlx/generator/ y mlx/verifier/); el modelo base no se incluye y se descarga de Hugging Face |

## Arquitectura y entrenamiento

El sistema se compone de dos adaptadores LoRA de rango 16, de 68 MB cada uno, aplicados sobre una única copia del modelo base Qwen2.5-Coder-1.5B-Instruct. El generador produce SQL a partir del esquema y la pregunta; el verificador lee un candidato SQL junto con las primeras filas de su resultado y responde "yes" o "no" a la pregunta de si es correcto. Ambos adaptadores se cargan sobre la misma instancia del modelo base y se intercambian en tiempo de ejecución, de modo que el sistema completo ocupa 1,54B + 2 x 18M parámetros. El repositorio incluye además código no aprendido para poda de esquemas (reducir el prompt a las tablas relevantes), reparación de SQL (corregir alias de tabla erróneos y joins ausentes) y ajuste de valores literales.

El entrenamiento se realizó sobre los conjuntos xlangai/spider y seeklhy/SynSQL-2.5M, sin utilizar preguntas ni bases de datos del conjunto de desarrollo de BIRD o Spider. El verificador final se entrenó con el doble de datos que la versión inicial (19.491 ejemplos frente a 9.395). La model card no detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. La innovación técnica destacable no está en la arquitectura del transformer, sino en el pipeline de inferencia: generación de múltiples candidatos, votación por autocoherencia sobre los resultados de ejecución, reranking mediante el verificador, ajuste de valores y regla de resultado vacío.

## Capacidades

- Generación de consultas SQL para SQLite a partir de un esquema de base de datos, una pregunta en inglés y una pista opcional.
- Generación de múltiples candidatos SQL por pregunta y selección del más probable mediante votación de resultados y verificador.
- Verificación de corrección de un candidato SQL a partir de sus primeras filas de resultado (adaptador verificador).
- Poda de esquemas para reducir el prompt a las tablas relevantes.
- Reparación automática de SQL: corrección de alias de tabla y joins ausentes.
- Ajuste de valores literales (value snapping) para corregir grafías de literales en las consultas.
- Ejecución local en PyTorch (CUDA, Apple MPS, CPU) y en MLX sobre Apple Silicon.
- No dispone de tool calling ni function calling genérico, ni de capacidades de agente multi-paso fuera del pipeline específico de text-to-SQL.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistente de consultas sobre bases de datos SQLite internas: el sistema recibe el esquema de la base y una pregunta en inglés y devuelve una consulta ejecutable, adecuado para herramientas de analítica interna donde el usuario no conoce SQL.
- Generación de SQL en pipelines de datos: integración del pipeline completo (poda, generación de 16 candidatos, verificación) en un servicio que traduzca preguntas de negocio a consultas para informes automatizados.
- Herramienta de desarrollo para analistas: interfaz local que traduce preguntas en inglés a SQL sobre un esquema dado, con el verificador actuando como filtro de calidad antes de mostrar el resultado.
- Evaluación y benchmarking de text-to-SQL: el repositorio incluye un runner en formato BIRD (run.py), útil para reproducir resultados sobre BIRD dev y Spider dev y comparar configuraciones del pipeline.
- Despliegue en estaciones de trabajo Apple Silicon: gracias al soporte MLX y a su tamaño reducido, puede ejecutarse en local en un Mac con 24 GB de memoria sin depender de servicios en la nube.
- Filtrado y corrección de SQL generado por otros sistemas: el adaptador verificador puede reutilizarse para puntuar candidatos SQL producidos por otro generador, respondiendo sí/no sobre su corrección a partir de las primeras filas de resultado.
- Docencia y experimentación con LoRA: al distribuirse como dos adaptadores PEFT separados sobre un modelo base público, sirve como ejemplo reproducible de sistema generador-verificador con código no aprendido alrededor.

## Benchmarks y rendimiento

Resultados de exactitud de ejecución (EX) declarados por el autor en la model card. No están verificados de forma independiente.

| Configuración | BIRD dev (1.534) | Spider dev (1.034) | Generaciones por pregunta |
|---|---|---|---|
| Modelo base sin ajuste | 29,5 | 65,4 | 1 |
| Generador, respuesta única | 40,8 | 73,4 | 1 |
| Generador + poda de esquema + reparación SQL | 44,9 | 74,7 | 2 |
| + 8 candidatos, autocoherencia (votación mayoritaria sobre resultados) | 51,2 | 75,4 | 9 |
| + reranking con verificador | 53,3 (IC 95% 50,8-55,7) | 77,2 (74,5-79,6) | 9, más unas 2,3 pasadas del verificador |
| + value snapping + regla de resultado vacío | 54,1 (51,6-56,6) | 74,8 (72,1-77,4) | igual |
| + verificador entrenado con el doble de datos | 55,7 (53,2-58,1) | 76,0 (73,3-78,5) | igual |
| + 16 candidatos en lugar de 8 (pipeline completo SQLant-1B) | 58,3 (55,7-60,8) | 77,2 (74,5-79,7) | 17, más unas 3 pasadas del verificador |
| Oracle@8 (cota superior: al menos un candidato correcto de 8) | 64,9 | 86,2 | — |
| Oracle@16 (cota superior: al menos un candidato correcto de 16) | 71,1 | 89,6 | — |

Notas del autor recogidas en la model card: el verificador aporta una ganancia estadísticamente significativa frente a la votación simple (70 preguntas corregidas y 21 rotas, McNemar p < 0,001; BIRD 44/13 y Spider 26/8). El value snapping y la regla de resultado vacío añaden 0,8 puntos en BIRD (14 corregidas, 1 rota). El verificador final, entrenado con el doble de datos, corrige 66 preguntas y rompe 28 en dev completo (p < 0,001; BIRD +42/−17, Spider +24/−11), aunque en bases de datos no vistas la ganancia fue menor (+23/−15, no significativa). El paso de 8 a 16 candidatos corrige 87 preguntas y rompe 36 en dev completo (p < 0,001; BIRD +60/−21, Spider +27/−15). La puntuación inferior en Spider se atribuye a la base de datos flight_2, cuyas respuestas gold contienen espacios sobrantes en los valores almacenados, de modo que 25 de las 27 preguntas perdidas en Spider proceden de esa base.

## Requisitos de hardware

- El modelo base no se incluye en el repositorio y se descarga de Hugging Face en el primer uso; el tamaño del repo de adaptadores es de 0,3 GB.
- Inferencia en precisión completa (fp16/bf16) del modelo base de 1,54B: aproximadamente 3 GB de VRAM solo para pesos, más memoria para el contexto y las cachés KV; no se especifica cifra exacta en la información disponible.
- Con cuantización de 8 bits o 4 bits, el modelo base cabría holgadamente en GPUs de consumo, aunque la información disponible no detalla los tipos de cuantización soportados ni cifras medidas.
- GPU recomendadas: no disponibles en la información proporcionada. El autor indica que el desarrollo se realizó en un Apple M5 Pro con 24 GB de memoria y que el sistema funciona en CUDA, Apple MPS y CPU.
- Cabe en GPU de consumo por el tamaño del modelo base (1,54B), pero no se aportan mediciones concretas de VRAM ni de modelos de GPU probados.
- Opciones de despliegue: PyTorch con transformers + peft, y MLX en Apple Silicon. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El pipeline completo requiere 17 generaciones por pregunta más unas 3 pasadas del verificador, lo que condiciona el coste por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BIRD dev (EX) | Spider dev (EX) | Licencia | Formato |
|---|---|---|---|---|---|---|
| SQLant-1B (pipeline completo) | 1,54B + 2 x 18M | No disponible | 58,3 | 77,2 | Apache 2.0 | LoRA PEFT + MLX |
| Qwen2.5-Coder-1.5B-Instruct (base, sin ajuste) | 1,54B | No disponible | 29,5 | 65,4 | Apache 2.0 | Safetensors |
| SQLant-1B (respuesta única) | 1,54B + 18M | No disponible | 40,8 | 73,4 | Apache 2.0 | LoRA PEFT + MLX |

No se dispone en la información proporcionada de datos de otros sistemas text-to-SQL comparables (por ejemplo, modelos especializados de mayor tamaño) para ampliar la comparativa.

## Limitaciones y advertencias

- El sistema está especializado exclusivamente en SQLite; no se declara soporte para otros dialectos SQL.
- El idioma de trabajo es únicamente el inglés: las preguntas deben formularse en inglés.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (campo verified: false en el model-index).
- Parte de las decisiones de configuración (elección entre dos verificadores y entre 8 y 16 candidatos) se tomaron sobre el conjunto de desarrollo, por lo que el autor advierte que las cifras de dev son ligeramente optimistas.
- La ganancia del verificador en bases de datos no vistas fue menor y no estadísticamente significativa (+23/−15), lo que sugiere riesgo de sobreajuste a los esquemas vistos.
- El pipeline completo exige 17 generaciones por pregunta más unas 3 pasadas del verificador, con el coste de latencia y cómputo asociado.
- La puntuación de Spider está afectada por errores en las respuestas gold de la base flight_2, según el autor; las comparaciones con otros sistemas sobre Spider deben interpretarse con cautela.
- No se detallan sesgos conocidos, tasas de alucinación ni límites de longitud de contexto en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B-Instruct se distribuye por separado y debe verificarse su licencia y condiciones de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Felamity-Technologies/sqlant-1b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset Spider: https://huggingface.co/datasets/xlangai/spider
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Paper referenciado (arXiv 2305.03111): https://arxiv.org/abs/2305.03111
- Paper referenciado (arXiv 2503.02240): https://arxiv.org/abs/2503.02240
- Paper referenciado (arXiv 2507.22478): https://arxiv.org/abs/2507.22478
