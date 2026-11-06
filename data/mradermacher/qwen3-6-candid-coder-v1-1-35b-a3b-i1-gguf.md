# mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF

## Resumen

Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF es una cuantización en formato GGUF del modelo Qwen3.6-Candid-Coder-V1.1-35B-A3B, publicada por el usuario mradermacher. El modelo base es un fine-tune de la familia Qwen3.6 orientado a tareas de programación, con una arquitectura de mezcla de expertos (MoE) que activa una fracción reducida de sus 35.505.251.456 parámetros totales por token. Esta versión concreta no aporta pesos nuevos, sino que redistribuye los pesos del modelo original en múltiples niveles de cuantización para facilitar su despliegue en hardware con recursos limitados.

La relevancia de esta publicación radica en que permite ejecutar un modelo de ~35B parámetros con activación dispersa en GPUs de consumo mediante cuantizaciones agresivas (desde IQ1_S hasta Q6_K), algo imposible con los pesos originales en precisión completa. El autor emplea cuantización con imatrix (matriz de importancia) para preservar la calidad en los niveles más bajos, una técnica habitual en el ecosistema llama.cpp.

No obstante, la información pública disponible es muy escasa: no se detallan licencia, idiomas, pipeline, benchmarks ni la composición del dataset de entrenamiento del modelo base. La model card se limita a los metadatos de la conversión y a la lista de cuantizaciones generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de la familia Qwen3.6, según el nombre del modelo; detalles no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el sufijo "A3B" sugiere ~3B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado, con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-Candid-Coder-V1.1-35B-A3B procede de DarkKitsune y se presenta como un fine-tune de la familia Qwen3.6 orientado a código. Por el nombre se infiere una arquitectura de mezcla de expertos con ~35B parámetros totales y ~3B activos por token, pero no se dispone de documentación oficial sobre el número de expertos, la dimensión oculta, el número de capas ni el mecanismo de enrutamiento.

Respecto al entrenamiento, no hay información pública sobre el número de tokens, la composición del dataset, la existencia de RLHF/DPO ni técnicas de alineación. La única información técnica verificable es la relativa a la conversión a GGUF: el autor indica `convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1` y el uso de cuantizaciones ponderadas con imatrix, lo que implica que se calculó una matriz de importancia a partir de un corpus de calibración para minimizar la pérdida de calidad en los niveles bajos. También se marca `skip_mmproj: 1`, lo que sugiere que el modelo base no incluye proyector multimodal o que este se omitió en la conversión.

## Capacidades

- Generación de texto y código: el modelo está etiquetado como "Coder", por lo que su orientación principal es la generación y asistencia en programación.
- Razonamiento multi-paso: presumiblemente soportado por la familia Qwen3.6, aunque no hay confirmación explícita en la información disponible.
- Tool calling / function calling: no disponible en la documentación proporcionada.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el flag `skip_mmproj` sugiere ausencia de componentes multimodales en esta conversión.

## Casos de uso

- Asistencia de programación en local: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con GPU de consumo, usando cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y VRAM, y emplearse como autocompletado o chat de código en el IDE.
- Generación de código en pipelines de CI/CD: integrado mediante un servidor compatible con la API de OpenAI (el tag `endpoints_compatible` lo indica), puede generar tests, parches o documentación automáticamente en flujos de integración continua.
- Refactorización y revisión de código: con una ventana de contexto presumiblemente amplia (no confirmada), puede procesar módulos completos y proponer mejoras estructurales o detectar patrones problemáticos.
- Prototipado rápido de aplicaciones: al ejecutarse en hardware asequible, sirve para validar ideas de producto basadas en LLM sin depender de APIs externas ni incurrir en costes por token.
- Educación y experimentación: investigadores pueden estudiar el comportamiento de un MoE de ~35B en entornos con recursos limitados, comparando la calidad entre distintos niveles de cuantización.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo local, permite procesar código propietario sin enviarlo a servicios en la nube, siempre que la licencia del modelo base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~35B parámetros, las cuantizaciones Q4_K_M ocupan aproximadamente 20-22 GB, Q5_K_M en torno a 24-26 GB, Q6_K cerca de 28-30 GB, y las variantes IQ1/IQ2 entre 8 y 14 GB. Estas cifras son estimaciones basadas en el tamaño del repositorio (49,8 GB para el conjunto de todas las cuantizaciones) y en la práctica habitual de llama.cpp; no están confirmadas por el autor.
- GPU recomendadas: para Q5_K_M o Q6_K se recomienda una RTX 4090 (24 GB) o A100/H100; para Q4_K_M cabe en una RTX 3090/4090 con offload parcial; para IQ2/IQ3 puede ejecutarse en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti).
- Cabe en GPU de consumo: sí, en función de la cuantización elegida; las variantes IQ1_S e IQ2_XXS son las únicas viables en GPUs de 8 GB, con pérdida de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con la API de OpenAI (tag `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B activos (según el nombre), se espera un throughput superior al de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-Candid-Coder-V1.1-35B-A3B (este, GGUF) | 35,5B totales / ~3B activos (según nombre) | no disponible | no disponible | GGUF | Cuantización comunitaria con imatrix |
| Modelo base DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B | 35,5B totales | no disponible | no disponible | safetensors (presumiblemente) | Pesos originales; sin cuantizar |
| Qwen2.5-Coder-32B-Instruct | 32,5B densos | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar, con licencia permisiva y benchmarks públicos |
| DeepSeek-Coder-V2-Lite | 15,7B totales / 2,4B activos | 128.000 tokens | DeepSeek License | safetensors, GGUF | MoE comparable en filosofía (pocos activos), menor tamaño total |

La comparación con Qwen2.5-Coder-32B-Instruct y DeepSeek-Coder-V2-Lite se ofrece como referencia de categoría, no como equivalencia directa, ya que no se dispone de benchmarks del modelo evaluado.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B) antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce el soporte real de castellano u otras lenguas distintas del inglés.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni documentación de alineación, no es posible cuantificar su fiabilidad.
- Calidad degradada en cuantizaciones bajas: las variantes IQ1_S, IQ1_M e IQ2_XXS pueden producir degradación notable en tareas de código, donde la precisión simbólica es crítica.
- Ausencia de benchmarks: no hay datos públicos que permitan comparar su rendimiento con alternativas; la evaluación debe hacerse de forma empírica.
- Modelo de procedencia comunitaria: el fine-tune base no está respaldado por documentación oficial de Alibaba/Qwen, lo que añade incertidumbre sobre su calidad y procedencia de datos.
- Fecha de creación futura (2026-11-05): el repositorio presenta una marca temporal posterior a la actualidad conocida, lo que puede indicar un error de metadatos o una publicación planificada; conviene verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B
- llama.cpp (runtime recomendado para GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
