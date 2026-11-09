# chaoyinshe/ThyMind-9B

## Resumen

ThyMind-9B es un modelo vision-lenguaje especializado en ecografía tiroidea, desarrollado por el autor chaoyinshe como una adaptación del framework EchoVLM. Se construye mediante fine-tuning supervisado sobre el modelo base Qwen/Qwen3.5-9B, con 9.409.813.744 parámetros totales, y utiliza el dataset propio chaoyinshe/EchoVLM-Thyroid para el ajuste. Su propósito es resolver tareas de comprensión de imágenes de ecografía tiroidea y tareas visión-lenguaje específicas del dominio tiroideo, un nicho clínico donde los modelos generalistas suelen carecer de vocabulario, criterios diagnósticos y nomenclatura TI-RADS adecuados.

El modelo hereda la arquitectura y las capacidades del Qwen3.5-9B subyacente, por lo que combina un transformer de 9B parámetros con el pipeline multimodal definido en el framework EchoVLM (Mixture-of-Experts dinámico según el paper asociado). Los idiomas declarados son chino e inglés, y la licencia es Apache 2.0, lo que facilita su uso comercial con atribución. El repositorio ocupa 18,8 GB en formato safetensors.

Es relevante ahora porque la documentación técnica completa aún no se ha publicado (el autor indica que los informes técnicos están "coming soon"), de modo que esta ficha recoge exclusivamente los datos verificables del repositorio y del paper de EchoVLM. Con 79 descargas y 0 likes, se trata de un modelo de nicho, orientado a investigación clínica y prototipado, no a despliegue masivo en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5-9B, con framework EchoVLM (Mixture-of-Experts dinámico según el paper) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ThyMind-9B se apoya en el modelo base Qwen/Qwen3.5-9B, un transformer de 9B parámetros, y lo adapta al dominio de la ecografía tiroidea mediante fine-tuning sobre el dataset chaoyinshe/EchoVLM-Thyroid. El framework EchoVLM, descrito en el paper arXiv:2509.14977, propone un modelo visión-lenguaje con Mixture-of-Experts dinámico orientado a inteligencia universal en ecografía; sin embargo, la model card de ThyMind-9B no detalla si el adaptador conserva el enrutado MoE del framework original ni cuántos parámetros quedan activos por token.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de la herencia del modelo base. El autor indica que los informes técnicos y la documentación completa están pendientes de publicación, por lo que estos datos deben considerarse no disponibles en el momento de redactar esta ficha.

## Capacidades

- Comprensión de imágenes de ecografía tiroidea y respuesta en lenguaje natural sobre hallazgos, morfología y características de nódulos tiroideos.
- Tareas visión-lenguaje específicas del dominio tiroideo, según la descripción del repositorio.
- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B.
- Capacidades multilingües limitadas a chino e inglés según los metadatos del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (probable herencia de Qwen3.5-9B, pero no confirmado para este fine-tuning).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la información proporcionada.
- Incluye una herramienta de desensibilización de imágenes ecográficas (Ultrasonic_image_desensitization) para el preprocesado de datos clínicos.

## Casos de uso

- Investigación en diagnóstico asistido de nódulos tiroideos: el modelo puede recibir una ecografía tiroidea y generar una descripción estructurada de hallazgos (ecogenicidad, márgenes, vascularización) para su comparación con informes radiológicos de referencia en estudios retrospectivos.
- Prototipado de sistemas de triaje radiológico: integrado en un pipeline que recibe imágenes de ecografía tiroidea y produce un texto preliminar que el radiólogo revisa, reduciendo el tiempo de redacción de informes en entornos de alto volumen.
- Generación de descripciones para datasets clínicos: uso del modelo para etiquetar o enriquecer imágenes de ecografía tiroidea con descripciones en lenguaje natural, aprovechando el dataset EchoVLM-Thyroid como referencia de estilo.
- Formación médica y simulación: generación de explicaciones textuales sobre imágenes de ecografía tiroidea para material docente, con la salvedad de que requiere validación por especialistas.
- Anonimización y preprocesado de datos clínicos: combinado con la herramienta Ultrasonic_image_desensitization del mismo autor, el modelo puede formar parte de un flujo que desensibiliza imágenes antes de su análisis o compartición.
- Evaluación comparativa de modelos visión-lenguaje en dominio médico: servir como baseline especializado frente a modelos generalistas en tareas de comprensión de ecografía tiroidea, dado su ajuste específico y su licencia permisiva.
- Integración en herramientas de apoyo a la decisión clínica en investigación: como componente de un sistema que, junto con reglas clínicas y validación humana, asiste en la revisión de estudios tiroideos dentro de un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB de VRAM para contexto corto.
- GPU recomendadas para FP16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 6000 Ada. En consumer, una RTX 4090 (24 GB) puede alojar los pesos en BF16 con contexto limitado, aunque con margen ajustado.
- Cuantización: no se publican pesos GGUF ni cuantizaciones oficiales; para reducir VRAM sería necesario generar cuantizaciones propias (por ejemplo, con llama.cpp o GPTQ/AWQ), lo que no está validado por el autor.
- Despliegue: al ser un modelo multimodal basado en Qwen3.5-9B, se puede servir con frameworks compatibles con Qwen (vLLM, TGI) siempre que soporten la arquitectura multimodal concreta; llama.cpp y Ollama requerirían conversión a GGUF no disponible oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThyMind-9B | 9,41B | no disponible | Ecografía tiroidea (visión-lenguaje) | Apache 2.0 | Hugging Face, 79 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Generalista multimodal | no disponible en la información | Hugging Face (modelo base) |
| EchoVLM (framework original) | no disponible | no disponible | Ecografía universal (visión-lenguaje, MoE) | no disponible | Paper arXiv:2509.14977 |

No se dispone de datos de benchmarks ni de otros modelos especializados en ecografía tiroidea en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación técnica incompleta: el autor indica que los informes técnicos están pendientes de publicación, por lo que no hay detalles sobre datos de entrenamiento, evaluación ni sesgos.
- Riesgo de alucinación relevante en contexto clínico: al ser un modelo generativo, puede producir descripciones o hallazgos inexistentes en la imagen; no debe usarse como herramienta diagnóstica autónoma.
- Validación clínica ausente: no se han publicado métricas de sensibilidad, especificidad ni comparaciones con radiólogos, por lo que su uso en entornos clínicos requiere validación independiente.
- Cobertura lingüística limitada a chino e inglés; no se declara soporte para castellano, lo que restringe su uso directo en España sin adaptación.
- Sesgos potenciales derivados del dataset EchoVLM-Thyroid: posible sobrerrepresentación de ciertos equipos de ecografía, poblaciones o protocolos de adquisición.
- Licencia Apache 2.0 permite uso comercial con atribución, pero la responsabilidad legal y regulatoria del uso clínico recae en el implementador (marcado CE/MDR, FDA, etc.).
- Sin cuantizaciones oficiales ni pipelines documentados: el despliegue eficiente requiere trabajo adicional de conversión y validación.
- Comunidad muy reducida (79 descargas, 0 likes): soporte limitado y escasa retroalimentación de otros usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaoyinshe/ThyMind-9B
- Dataset: https://huggingface.co/datasets/chaoyinshe/EchoVLM-Thyroid
- Herramienta de desensibilización: https://huggingface.co/chaoyinshe/Ultrasonic_image_desensitization
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper EchoVLM: https://arxiv.org/abs/2509.14977
