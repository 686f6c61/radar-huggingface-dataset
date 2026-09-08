# mradermacher/Horus-Cyber-Nano-1.0-GGUF

## Resumen

Horus-Cyber-Nano-1.0 es un modelo de lenguaje especializado en ciberseguridad y código seguro, desarrollado por TokenAI. Se trata del primer modelo Mixture-of-Experts (MoE) de la compañía, con 15.960.110.208 parámetros totales (15,96 mil millones) según los datos de safetensors del modelo base. Esta versión publicada por mradermacher contiene los pesos en formato GGUF, cuantizados para su ejecución en CPU y GPU con llama.cpp y herramientas compatibles.

El modelo está diseñado para tareas como análisis de vulnerabilidades, red teaming, uso de terminal y tool calling, y además incorpora componentes multimodales (archivos mmproj) que sugieren capacidad de procesar entradas visuales, aunque esta característica no se detalla en la información disponible. Su licencia es tokenai-custom-license y el idioma soportado es el inglés.

La relevancia de Horus-Cyber-Nano-1.0 radica en que es un modelo open source orientado a un caso de uso comercial concreto: la ciberseguridad y el desarrollo de código seguro. TokenAI ha anunciado que una versión completa del modelo Horus Cyber se publicará en el futuro con el respaldo del Consejo Nacional de IA de Egipto, lo que posiciona este lanzamiento como una pieza clave para el ecosistema de IA especializada en seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE); tipo de backbone no especificado |
| Parámetros totales | 15.960.110.208 (15,96 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj: Q8_0 y f16 |
| Idiomas soportados | inglés (en) |
| Licencia | tokenai-custom-license |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

La arquitectura de Horus-Cyber-Nano-1.0 se describe en las etiquetas del repositorio como un modelo Mixture-of-Experts (MoE), lo que implica que solo una parte de los parámetros se activa durante cada token de entrada. Sin embargo, no se especifica el número de expertos, el número de parámetros activos ni el mecanismo de enrutamiento. El modelo base está alojado en tokenaii/Horus-Cyber-Nano-1.0 y la versión GGUF ha sido generada por mradermacher.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Las etiquetas indican que el modelo está orientado a ciberseguridad, código, red teaming, terminal y tool use. La presencia de archivos mmproj en el repositorio GGUF indica que el modelo tiene un componente multimodal, probablemente para procesar imágenes, aunque no se detalla el tipo de visión ni el encoder utilizado.

## Capacidades

- Generación de texto y razonamiento: el modelo es un LLM de 15,96 mil millones de parámetros capaz de procesar instrucciones en lenguaje natural.
- Código y ciberseguridad: las etiquetas del repositorio indican especialización en código, análisis de vulnerabilidades y red teaming.
- Tool calling / function calling: la etiqueta `tool-use` sugiere soporte para invocar herramientas externas, aunque no se aporta documentación técnica al respecto.
- Uso de terminal: el modelo está etiquetado como `terminal`, lo que apunta a capacidades para interpretar y generar comandos, scripts y salidas de consola.
- Multimodalidad: existen archivos `mmproj` en formato GGUF (Q8_0 y f16) que permiten cargar un componente multimodal, probablemente para visión, aunque no se especifica el tipo de entrada.
- Idiomas: el único idioma declarado en los metadatos es el inglés.
- No se mencionan capacidades de "thinking mode", audio ni soporte de agentes multi-paso de forma explícita.

## Casos de uso

- Auditoría de código en pipelines CI/CD: el modelo puede analizar fragmentos de código, identificar patrones inseguros y sugerir correcciones. Su especialización en ciberseguridad lo hace adecuado para integrarse en herramientas de análisis estático o como bot de revisión en repositorios.
- Simulación de ataques ofensivos (red teaming): gracias a las etiquetas de `red-team` y `terminal`, puede generar payloads, plantear vectores de ataque y explicar técnicas de explotación, siempre dentro de entornos autorizados.
- Asistente de terminal y administración de sistemas: puede interpretar comandos complejos, generar scripts de automatización y traducir salidas de consola a explicaciones en lenguaje natural, útil para equipos de operaciones de seguridad (SecOps).
- Análisis de logs y detección de intrusiones: el modelo puede procesar registros de eventos, identificar anomalías y resumir patrones de actividad sospechosa, apoyando a analistas de SOC en la triage de alertas.
- Integración en agentes de seguridad con tool calling: si se confirma el soporte de `tool-use`, puede actuar como núcleo de un agente que consulte SIEM, escáneres de vulnerabilidades o bases de datos de CVEs para responder preguntas de seguridad.
- Documentación y formación en ciberseguridad: puede generar explicaciones didácticas, guías de hardening y material de formación para desarrolladores, aprovechando su conocimiento especializado en código seguro.
- Análisis multimodal de capturas de pantalla: si el componente `mmproj` funciona como visión, podría analizar capturas de interfaces de seguridad, diagramas de red o imágenes de logs, aunque esta capacidad no está verificada en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El anuncio de TokenAI menciona "early benchmark highlights", pero no se aportan cifras concretas en los datos proporcionados. Por tanto, no es posible comparar el rendimiento del modelo con otras alternativas basándose en métricas publicadas.

## Requisitos de hardware

- Los archivos GGUF del repositorio tienen los siguientes tamaños: Q2_K 6,7 GB; Q3_K_S 7,7 GB; Q3_K_M 8,4 GB; Q3_K_L 8,7 GB; IQ4_XS 8,9 GB; Q4_K_S 9,8 GB; Q4_K_M 10,6 GB; Q5_K_S 11,4 GB; Q5_K_M 12,1 GB; Q6_K 14,4 GB; Q8_0 17,1 GB. Los archivos mmproj añaden 0,7 GB (Q8_0) o 1,0 GB (f16).
- La VRAM necesaria para inferencia debe superar el tamaño del archivo GGUF en concepto de contexto y overhead. Como orientación: Q4_K_S (9,8 GB) puede ejecutarse en una GPU con 12 GB de VRAM, mientras que Q8_0 (17,1 GB) requiere al menos 20-24 GB.
- GPU recomendadas: RTX 4090 (24 GB) es suficiente para las cuantizaciones hasta Q8_0; A100 40 GB o H100 80 GB son adecuadas para despliegues de producción con contexto amplio y múltiples peticiones concurrentes.
- En GPU de consumo, las opciones más viables son RTX 3060 12 GB para Q4_K_S, RTX 4070 Ti Super 16 GB para Q5_K_M y RTX 4080/4090 para Q6_K o Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier frontend compatible con GGUF. No se menciona compatibilidad explícita con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (ciberseguridad y código seguro) en los datos proporcionados. No se han publicado benchmarks ni comparativas oficiales. Por tanto, no es posible establecer una comparación rigurosa con alternativas como Mixtral 8x7B, Mistral 7B u otros MoE sin datos verificados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no hay información sobre sesgos.
- Riesgo de alucinación: no se han publicado evaluaciones, por lo que no se puede cuantificar. Como todo LLM, puede generar contenido falso en contextos de seguridad.
- Limitaciones de contexto o idioma: solo inglés declarado. La longitud de contexto no está disponible, lo que impide evaluar su rendimiento en conversaciones largas o análisis de código extenso.
- Restricciones de licencia: la licencia tokenai-custom-license no es una licencia open source estándar. Debe revisarse el texto completo antes de usar el modelo en proyectos comerciales o redistribuirlo.
- Cuantización por terceros: los pesos GGUF han sido generados por mradermacher, no por TokenAI. La cuantización puede introducir pérdida de calidad, especialmente en las versiones más agresivas como Q2_K o IQ4_XS.
- Uso ofensivo: al estar etiquetado como red-team, el modelo puede generar contenido relacionado con ataques. Su uso debe limitarse a entornos autorizados y cumplir con la legislación aplicable.
- Multimodalidad no verificada: los archivos mmproj existen, pero no se ha confirmado el tipo de entrada ni el rendimiento del componente multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Horus-Cyber-Nano-1.0-GGUF
- Modelo base: https://huggingface.co/tokenaii/Horus-Cyber-Nano-1.0
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Horus-Cyber-Nano-1.0-i1-GGUF
- Página del modelo: https://hf.tst.eu/model#Horus-Cyber-Nano-1.0-GGUF
- Artículo de TokenAI: https://tokenai.llc/news/announcements/horus-cyber-nano-first-look
- Artículo de Middle East AI News: https://www.middleeastainews.com/p/tokenai-releases-horus-cyber-nano
