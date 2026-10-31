# aimanhaziq/gemma4-2b-coder

## Resumen

Gemma 4 2B Coder es un ajuste fino (fine-tuning) comunitario del modelo instruido google/gemma-4-E2B-it de Google, publicado por el usuario aimanhaziq en Hugging Face. El modelo está especializado en tres dominios técnicos concretos: Kubernetes y DevOps (generación de manifiestos, Helm charts y pipelines de CI/CD), programación de sistemas en Rust (gestión de memoria idiomática, runtimes asíncronos y APIs) y desarrollo web full-stack con TypeScript/JavaScript moderno y servicios de backend.

La relevancia de este modelo radica en la tendencia actual de crear variantes ligeras y especializadas a partir de modelos base pequeños: con unos 5.100 millones de parámetros, puede ejecutarse en hardware de consumo y ofrecer asistencia de código en dominios concretos sin depender de modelos propietarios ni de APIs externas. El entrenamiento se ha realizado, según los tags del repositorio, con la herramienta Unsloth, popular por optimizar el fine-tuning eficiente en memoria de modelos pequeños.

Es un modelo de generación de texto conversacional, distribuido en formato safetensors bajo la licencia Gemma de Google, lo que permite su uso comercial sujeto a los términos de dicha licencia. Al tratarse de un fine-tuning comunitario sin model card técnica detallada, buena parte de la información sobre su proceso de entrenamiento y rendimiento no está disponible públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma; detalles no disponibles) |
| Parametros totales | 5.104.297.539 (aprox. 5,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (heredada presumiblemente de google/gemma-4-E2B-it) |
| Tipos de cuantizacion | no disponible (repo en bf16; cuantizaciones de terceros posibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, la variante instruida de la familia Gemma 4 de Google, que utiliza una arquitectura transformer decoder estándar. El repositorio pesa 10,2 GB en safetensors, coherente con unos 5,1 B de parámetros almacenados en bfloat16. No hay información publicada sobre si el modelo base emplea técnicas concretas como atención agrupada (GQA) o ventanas de contexto específicas.

Sobre el proceso de fine-tuning, la única evidencia disponible es el tag "unsloth" del repositorio, que indica que se ha utilizado la biblioteca Unsloth, orientada a ajustes finos eficientes en memoria (LoRA o QLoRA en la mayoría de los casos). No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, el número de épocas, ni si se han aplicado técnicas de alineación adicionales como RLHF o DPO. Todo ello figura como no disponible.

## Capacidades

- Generación de manifiestos de Kubernetes, Helm charts y pipelines de CI/CD.
- Programación en Rust: gestión de memoria idiomática, runtimes asíncronos (presumiblemente tokio u otros) y diseño de APIs.
- Desarrollo web full-stack: TypeScript/JavaScript moderno y servicios de backend.
- Generación de texto conversacional general, heredada del modelo base instruido.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponible (no documentadas en la model card).
- Capacidades multilingües: limitadas; el modelo está etiquetado solo para inglés.
- Modalidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de manifiestos de Kubernetes: el modelo puede producir Deployments, Services, ConfigMaps e Ingresses a partir de descripciones en lenguaje natural, útil para equipos que automatizan la creación de recursos en clusters.
- Creacion de Helm charts: dado un conjunto de valores o una estructura de aplicación, puede generar templates de Helm y archivos values.yaml, acelerando el empaquetado de aplicaciones.
- Redaccion de pipelines de CI/CD: generación de workflows para GitHub Actions, GitLab CI o sistemas similares orientados a despliegues en Kubernetes.
- Asistencia en codigo Rust: ayuda a escribir código idiomático con ownership y lifetimes correctos, implementar tareas asíncronas y estructurar APIs, algo especialmente valioso dado que Rust tiene una curva de aprendizaje pronunciada.
- Desarrollo full-stack con TypeScript: generación de componentes, utilidades y servicios de backend, aprovechando el fine-tuning en desarrollo web moderno.
- Asistente de codigo local y privado: al ser un modelo de 5,1 B de parámetros, puede ejecutarse en una GPU de consumo para asistir en la escritura de código sin enviar este a servicios externos, útil en entornos con requisitos de privacidad.
- Documentacion tecnica de DevOps: generación de READMEs, documentación de despliegue y explicaciones de configuraciones de Kubernetes a partir de manifiestos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con unos 5,1 B de parámetros en bfloat16, se requieren aproximadamente 10-11 GB de VRAM solo para los pesos, más overhead de KV cache y activaciones (en la práctica, 12-16 GB recomendados). Con cuantización a 4 bits (por ejemplo, GGUF Q4_K_M), el consumo baja a unos 3-4 GB.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090 para inferencia en precisión completa; cualquier GPU moderna de 8 GB o más para versiones cuantizadas.
- Consumer GPU: sí, cabe holgadamente en una RTX 4090 en bf16 y en GPUs de 8 GB con cuantización de 4 bits; también es viable en Apple Silicon con llama.cpp u Ollama si existen conversiones GGUF (no incluidas en el repositorio oficial).
- Opciones de despliegue: transformers (como muestra la model card, con device_map="auto"), vLLM, TGI, Ollama y llama.cpp (estos últimos requieren conversión a GGUF, que no está publicada en el repo).
- Latencia y throughput estimados: no disponibles; en una GPU de consumo se esperan velocidades del orden de decenas de tokens por segundo para un modelo de este tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| aimanhaziq/gemma4-2b-coder | ~5,1 B | Codigo: Kubernetes, Rust, web | Gemma | Hugging Face, safetensors |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | Codigo general, multiples lenguajes | Apache 2.0 / Qwen | Hugging Face, safetensors y GGUF |
| CodeLlama-7B-Instruct | ~7 B | Codigo general | Llama 2 Community | Hugging Face, safetensors y GGUF |
| StarCoder2-7B | ~7,5 B | Codigo general (The Stack v2) | BigCode OpenRAIL-M | Hugging Face, safetensors y GGUF |

Nota: la comparativa es orientativa; los modelos alternativos son de código general sin el enfoque específico en Kubernetes y Rust de esta ficha, y no hay benchmarks publicados que permitan comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Al tratarse de un fine-tuning comunitario sin documentación técnica, no hay garantías sobre la calidad, procedencia o licencia del dataset de entrenamiento utilizado.
- Riesgo de alucinación elevado en código: puede generar manifiestos de Kubernetes o código Rust sintácticamente válido pero funcionalmente incorrecto o inseguro; revisión humana obligatoria antes de aplicar cambios en clusters reales.
- Sesgos: no caracterizados; hereda los sesgos del modelo base Gemma y de los datos de fine-tuning, cuya composición se desconoce.
- Idioma: etiquetado solo para inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior al del modelo base.
- Licencia Gemma: permite uso comercial, pero impone términos de la licencia de Google (restricciones de uso, requisitos de atribución y política de uso aceptable); conviene revisarla antes de desplegar en producción.
- Contexto: la longitud de ventana no está documentada en el repositorio; verificar la del modelo base google/gemma-4-E2B-it antes de procesar documentos largos.
- Popularidad muy baja (803 descargas, 2 likes en el momento de la ficha), lo que implica poca validación por parte de la comunidad y posible ausencia de correcciones o conversiones cuantizadas por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aimanhaziq/gemma4-2b-coder
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Unsloth (herramienta de fine-tuning utilizada): https://github.com/unslothai/unsloth
- Paper, demo y repositorio de entrenamiento: no disponibles
