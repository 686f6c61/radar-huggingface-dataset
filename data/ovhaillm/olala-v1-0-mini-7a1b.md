# OVHaiLLM/Olala-v1.0-mini-7A1B

## Resumen

Olala-v1.0-mini-7A1B es un modelo de lenguaje de tipo "small reasoning model" desarrollado por OVHai LLM (grupo OVHcloud) y publicado con pesos abiertos bajo licencia Apache 2.0. Está disenado para chat, seguimiento de instrucciones y uso de herramientas, y se construye sobre una arquitectura híbrida Mamba-3 / atención con mezcla de expertos (MoE). Con 6.773.124.144 parámetros totales y aproximadamente 1.000 millones de parámetros activos por token, prioriza la eficiencia computacional: solo 7 de sus 36 capas mantienen KV cache.

El modelo fue entrenado sobre 12,8 billones de tokens combinando datasets públicos y datos sintéticos propios, en tres supercomputadores europeos (JUPITER en Alemania, Jean Zay en Francia y MeluXina en Luxemburgo), usando 1.024 GPU NVIDIA GH200 en JUPITER y GPU H100 en Jean Zay. La estimación de emisiones declarada por el autor es de 40.000 toneladas de CO2 equivalente (rango 30-50 t, suministro renovable) para el entrenamiento completo de la familia.

Su relevancia actual reside en tres ejes: es un modelo europeo con licencia permisiva, incorpora razonamiento explícito con cuatro niveles de esfuerzo y fue entrenado con aprendizaje por refuerzo para llamadas a herramientas y búsqueda multi-turno. La familia incluye un modelo base, un checkpoint SFT y este modelo post-entrenado final, además de dos modelos especializados. El modelo soporta 37 idiomas, entre ellos el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-3 / atención con mezcla de expertos (MoE) |
| Parametros totales | 6.773.124.144 |
| Parametros activos | Aproximadamente 1.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 37 idiomas: en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, con código custom) |

## Arquitectura y entrenamiento

La arquitectura combina capas Mamba-3 (modelo de espacio de estados) con capas de atención en un esquema híbrido, sobre una estructura de mezcla de expertos. De las 36 capas totales, solo 7 conservan KV cache, lo que reduce drásticamente el coste de memoria durante la inferencia y permite ejecutar el modelo en un portátil según el autor. El modelo activa aproximadamente 1.000 millones de parámetros por token pese a tener 6,77 mil millones totales.

El preentrenamiento se realizó sobre 12,8 billones de tokens de datasets públicos y datos sintéticos propios. El pipeline de post-entrenamiento incluye SFT (checkpoint intermedio publicado) y una fase de aprendizaje por refuerzo orientada a razonamiento, llamadas a herramientas y búsqueda multi-turno. El modelo incorpora un modo de razonamiento con cuatro niveles de esfuerzo configurables. El entrenamiento se llevó a cabo en JUPITER (1.024 GPU GH200), Jean Zay (GPU H100) y MeluXina, con un consumo energético estimado de 1,16 GWh y 40.000 toneladas de CO2 equivalente declaradas.

## Capacidades

- Generación de texto conversacional multi-turno en 37 idiomas, incluido el castellano.
- Razonamiento explícito con cuatro niveles de esfuerzo configurables ("thinking mode").
- Llamadas a herramientas y function calling, entrenado mediante aprendizaje por refuerzo.
- Comportamiento agéntico con búsqueda y razonamiento multi-paso a lo largo de varios turnos.
- Seguimiento de instrucciones y tareas de chat general.
- Capacidades multilingües amplias (37 idiomas de familias diversas: germánicas, románicas, eslavas, urálicas, semíticas, kartvelianas, etc.).
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con llamadas a herramientas para consultar estado de pedidos o bases de conocimiento, gracias a su entrenamiento específico en tool calling y su soporte de 37 idiomas.
- Agentes de búsqueda multi-turno: adecuado para flujos donde el agente debe reformular consultas, consultar fuentes externas y razonar sobre resultados parciales, una capacidad reforzada explícitamente mediante RL.
- Asistentes de código con integración de herramientas: puede invocarse en pipelines donde el modelo decida qué función o API llamar (por ejemplo, ejecutar tests, consultar documentación) dentro de un bucle agéntico.
- Despliegue en entornos con recursos limitados: con solo 7 capas con KV cache y ~1B parámetros activos, es viable en portátiles y estaciones de trabajo sin GPU de datacenter, lo que facilita prototipado local y aplicaciones de borde.
- Razonamiento con coste controlado: los cuatro niveles de esfuerzo permiten ajustar la latencia y el consumo de tokens de razonamiento según la criticidad de la tarea, útil en aplicaciones de clasificación o extracción donde no se necesita cadena de pensamiento larga.
- Aplicaciones multilingües europeas: cobertura de idiomas como castellano, catalán, euskera no listado, gallego no listado, polaco, checo, húngaro, rumano, búlgaro, croata, esloveno, etc., útil para servicios públicos o atención al cliente en la UE.
- Investigación sobre arquitecturas híbridas SSM/atención: al ser pesos abiertos Apache 2.0 con código custom, sirve como base para estudiar eficiencia de KV cache y enrutamiento MoE en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,77 mil millones de parámetros totales, en fp16 requeriría aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits rondaría 7 GB y en 4 bits unos 3,5-4 GB, aunque el autor no publica cifras oficiales.
- GPU recomendadas: el autor indica que el modelo "funciona en un portátil". Para uso en servidor, GPU con al menos 16-24 GB de VRAM (RTX 4090, A10, L4, A100, H100) permitirían fp16 o cuantizaciones altas con comodidad.
- Cabe en GPU de consumo: sí, según el autor, gracias a los ~1B parámetros activos y las solo 7 capas con KV cache. Una RTX 4090 (24 GB) o incluso GPU con 8-12 GB en cuantización 4 bits serían suficientes.
- Opciones de despliegue: transformers (librería declarada, requiere `trust_remote_code=True` por el código custom). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible; la naturaleza híbrida Mamba/MoE puede requerir kernels específicos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B | 6,77B | ~1B | no disponible | Apache 2.0 | Hugging Face, OVHcloud AI Endpoints |
| Alternativas de ~7B densos (p. ej. Mistral-7B, Llama-3-8B) | 7-8B | 7-8B (densos) | 8K-128K según versión | Apache 2.0 / licencia comunitaria | Hugging Face |
| Alternativas MoE pequeñas (p. ej. Qwen MoE, Mixtral 8x7B) | variable | variable | variable | variable | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con estos modelos. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar (MMLU, GSM8K, HumanEval) es desconocido.
- Riesgo de alucinación inherente a modelos generativos; no se documentan medidas específicas de mitigación.
- Longitud de contexto no especificada: planificar aplicaciones con documentos largos requiere verificación empírica.
- Sesgos: no se documenta análisis de sesgos ni composición detallada del dataset de preentrenamiento más allá de "datasets públicos y datos sintéticos propios".
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo requiere `trust_remote_code=True` por el código custom de arquitectura, lo que implica ejecutar código del autor.
- El soporte de herramientas de inferencia (vLLM, llama.cpp, TGI) no está confirmado; la arquitectura híbrida Mamba-3/MoE puede no estar soportada por todos los frameworks.
- El modelo es de tipo "small reasoning": para tareas de razonamiento complejo o contextos muy largos, modelos de mayor tamaño pueden ser más adecuados.
- Emisiones declaradas de 40.000 t CO2e para el entrenamiento de la familia; relevante para informes de sostenibilidad si se cita el modelo.
- Los 37 idiomas listados no implican calidad uniforme; no se publican evaluaciones por idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Checkpoint SFT: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-SFT
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Playground: https://olala.ovh.com
- Catálogo OVHcloud AI Endpoints: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-v1-0-mini-7a1b/
