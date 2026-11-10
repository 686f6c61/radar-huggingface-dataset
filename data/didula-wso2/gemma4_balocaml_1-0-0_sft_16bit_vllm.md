# didula-wso2/gemma4_balocaml_1-0-0_sft_16bit_vllm

## Resumen

`gemma4_balocaml_1-0-0_sft_16bit_vllm` es un checkpoint de investigación publicado por el usuario `didula-wso2` en Hugging Face. Se trata de un ajuste fino supervisado (SFT) del modelo multimodal `unsloth/gemma-4-E4B-it`, que a su vez deriva de la familia Gemma 4 de Google. El autor ha fusionado un adaptador LoRA de rango 16 en los pesos completos de 16 bits del modelo base, dando como resultado un modelo de aproximadamente 8.000 millones de parámetros totales y un repositorio de 16 GB.

El objetivo declarado del ajuste es especializar el modelo en la generación y el razonamiento sobre programas escritos en **Ballerina** y **OCaml**, dos lenguajes con comunidades relativamente pequeñas y escasa representación en los corpus de preentrenamiento habituales. El entrenamiento se realizó sobre 18.214 secuencias de programas verificados mediante tests, en 1.139 pasos de optimización.

El modelo mantiene la modalidad image-text-to-text del base (entrada de imagen y texto, salida de texto) y se distribuye en formato safetensors compatible con `transformers` y con endpoints de inferencia tipo vLLM. Es relevante como ejemplo de adaptación de un modelo multimodal abierto a dominios de código de nicho mediante LoRA, aunque carece de model card detallada, licencia explícita y evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 E4B |
| Parámetros totales | 7.996.156.490 (~8B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en 16 bits; el nombre del repo sugiere compatibilidad con vLLM) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a los términos del modelo base) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | image-text-to-text |
| Modelo base | unsloth/gemma-4-E4B-it |
| Adaptador LoRA de origen | didula-wso2/gemma4_balocaml_1-0-0_sft_lora (rango 16) |
| Tamaño del repositorio | 16,0 GB |
| Fecha de creación | 2026-11-10 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `unsloth/gemma-4-E4B-it`, un transformer multimodal de la familia Gemma 4 con capacidad de procesar imágenes y texto. La información disponible no detalla la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención, tokenizador ni longitud de contexto), por lo que estos datos deben consultarse en la model card del modelo base.

El proceso de adaptación consistió en un ajuste fino supervisado (SFT) con un adaptador LoRA de rango 16 entrenado conjuntamente sobre programas en Ballerina y OCaml. El corpus de entrenamiento consta de 18.214 secuencias de programas verificados mediante tests, lo que aporta una señal de calidad sobre las muestras. El entrenamiento se ejecutó en 1.139 pasos. Posteriormente, el adaptador se fusionó (merge) en los pesos de 16 bits del modelo base, generando este checkpoint autónomo. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores, ni la composición exacta del dataset más allá de la verificación por tests.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Gemma 4.
- Procesamiento de entrada multimodal imagen-texto (pipeline image-text-to-text).
- Generación y razonamiento sobre código en **Ballerina**, incluyendo sintaxis, tipos y construcciones propias del lenguaje.
- Generación y razonamiento sobre código en **OCaml**, incluyendo el sistema de módulos y tipos algebraicos.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`) y con vLLM según el nombre del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- **Asistencia en desarrollo Ballerina**: el modelo puede completar funciones, sugerir correcciones y explicar construcciones del lenguaje a partir de fragmentos de código, gracias al ajuste específico sobre programas verificados en este lenguaje.
- **Asistencia en desarrollo OCaml**: generación de patrones de coincidencia, firmas de módulos y refactorizaciones guiadas, aprovechando el entrenamiento sobre código OCaml validado por tests.
- **Migración entre lenguajes**: traducción asistida de fragmentos de Ballerina a OCaml o viceversa, con el modelo como generador inicial sujeto a revisión humana.
- **Generación de tests unitarios**: dado un módulo en cualquiera de los dos lenguajes, producir esqueletos de pruebas que el desarrollador puede completar, apoyándose en el corpus de programas verificados.
- **Documentación técnica de código**: resumen y explicación de módulos Ballerina u OCaml en lenguaje natural para incorporar a documentación interna.
- **Prototipado en entornos con requisitos de integración**: al distribuirse en safetensors y ser compatible con vLLM y endpoints, puede desplegarse como servicio de inferencia interno para equipos que trabajen con estos lenguajes.
- **Investigación sobre adaptación de modelos multimodales a dominios de código**: sirve como punto de partida reproducible para estudiar el efecto de LoRA de rango 16 sobre lenguajes de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en 16 bits (aproximadamente 16 GB de parámetros) se requieren en torno a 16-18 GB de VRAM solo para los pesos, más memoria para el contexto y el procesamiento de imágenes; en la práctica, unos 20-24 GB en FP16/BF16.
- **Cuantización**: no se documentan versiones GGUF ni cuantizaciones oficiales; sería necesario generarlas a partir de los safetensors para reducir requisitos.
- **GPU recomendadas**: A100 40 GB, H100 80 GB o L40S para despliegue en 16 bits sin cuantizar; RTX 4090 (24 GB) podría alojar el modelo en BF16 con contexto limitado.
- **GPU de consumo**: en 16 bits, una RTX 4090 o RTX 3090 (24 GB) es el mínimo práctico; tarjetas de 16 GB requerirían cuantización a 8 bits o inferior, no disponible en el repositorio.
- **Opciones de despliegue**: `transformers` (librería declarada), vLLM (indicado en el nombre del repositorio y en los tags de endpoints), y potencialmente TGI; llama.cpp/Ollama requerirían conversión a GGUF.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4_balocaml_1-0-0_sft_16bit_vllm | ~8B | no disponible | image-text-to-text | no disponible (remite al base) | Hugging Face, safetensors |
| unsloth/gemma-4-E4B-it (base) | ~8B | no disponible | image-text-to-text | la del modelo Gemma 4 | Hugging Face |
| Gemma 4 E4B (original de Google) | ~8B | no disponible | image-text-to-text | Gemma Terms of Use | Hugging Face, Vertex AI |
| CodeLlama / modelos de código de ~7-8B | ~7-8B | no disponible | text-to-text | Llama 2/3 license | Hugging Face |

La comparativa se limita a los modelos emparentados; no hay datos de rendimiento publicados que permitan una comparación cuantitativa con alternativas de código de tamaño similar.

## Limitaciones y advertencias

- **Checkpoint de investigación**: el autor lo describe explícitamente como "research checkpoint" y "not a product", sin garantías de ningún tipo.
- **Licencia no especificada en el repositorio**: los términos de uso y comerciales dependen del modelo base Gemma 4, que debe consultarse antes de cualquier uso en producción.
- **Idiomas no documentados**: se desconoce la cobertura lingüística efectiva, más allá de la del modelo base.
- **Contexto no documentado**: no se indica la longitud máxima de contexto soportada.
- **Riesgo de alucinación**: al ser un modelo generativo ajustado sobre un corpus pequeño (18.214 secuencias), puede producir código sintácticamente plausible pero incorrecto; la verificación por tests es imprescindible.
- **Especialización estrecha**: el ajuste se centra en Ballerina y OCaml; el rendimiento en otros lenguajes puede degradarse respecto al base.
- **Sesgos**: no se documentan evaluaciones de sesgo ni de seguridad para este checkpoint.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- **Sin benchmarks**: no hay evidencia cuantitativa de mejora sobre el modelo base en las tareas objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/didula-wso2/gemma4_balocaml_1-0-0_sft_16bit_vllm
- Adaptador LoRA de origen: https://huggingface.co/didula-wso2/gemma4_balocaml_1-0-0_sft_lora
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Página de Gemma de Google: https://ai.google.dev/gemma
- Documentación de vLLM: https://docs.vllm.ai
- Documentación de transformers: https://huggingface.co/docs/transformers
