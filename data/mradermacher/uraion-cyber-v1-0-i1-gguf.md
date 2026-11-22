# mradermacher/Uraion-Cyber-V1.0-i1-GGUF

## Resumen

Uraion-Cyber-V1.0-i1-GGUF es la version cuantizada en formato GGUF del modelo Uraion-Cyber-V1.0, desarrollado por UraionLabs y orientado especificamente a ciberseguridad defensiva, auditoria de codigo, deteccion de vulnerabilidades y generacion de parches. Las cuantizaciones han sido generadas por mradermacher mediante el metodo i1 (imatrix) con el objetivo de reducir el peso del modelo original para permitir su despliegue en hardware mas modesto sin sacrificar demasiada calidad.

El modelo base es un Mixture-of-Experts (MoE) de aproximadamente 35.500 millones de parametros totales, con una configuracion del tipo 35b-a3b (alrededor de 3 mil millones de parametros activos por token), derivada de la familia Qwen 3.5/3.6 segun las etiquetas de la model card. Soporta un contexto largo de hasta 256k tokens, capacidades de razonamiento con cadena de pensamiento (thinking), tool calling y function calling, lo que lo hace adecuado para flujos agenticos de seguridad y DevOps.

Este repositorio concreto es relevante porque ofrece una amplia gama de cuantizaciones GGUF (desde i1-Q2_K de 13,3 GB hasta i1-Q6_K de 29,3 GB) que permiten ejecutar localmente un modelo especializado en seguridad con licencia MIT, algo poco habitual en esta categoria. Esta pensado para investigadores y desarrolladores que quieren desplegar auditoria de codigo y analisis de vulnerabilidades en entornos self-hosted.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia Qwen 3.5/3.6 (etiqueta qwen3_5_moe) |
| Parametros totales | 35.505.251.456 (aprox. 35,5 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones (configuracion 35b-a3b) |
| Longitud de contexto | 256k tokens (segun etiqueta 256k-context) |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ4_NL (small) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base Uraion-Cyber-V1.0 emplea una arquitectura Mixture-of-Experts con aproximadamente 35,5 mil millones de parametros totales y en torno a 3 mil millones activos por token (nomenclatura 35b-a3b). Las etiquetas del repositorio lo vinculan a la familia Qwen 3.5/3.6 y a la arquitectura qwen3_5_moe, lo que implica un transformer con capas de expertos enrutadas de forma dispersa. Esta configuracion reduce el coste computacional por token frente a un modelo denso del mismo tamano, manteniendo una capacidad de representacion elevada.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste fino supervisado especifico. Las etiquetas indican un enfasis en datos y tareas de ciberseguridad (security, infosec, appsec, vulnerability-detection, patch-generation, program-repair, ctf), asi como capacidades de razonamiento con cadena de pensamiento y soporte de tool calling. Esta version concreta es una cuantizacion i1 (imatrix) generada por mradermacher a partir de los pesos originales, no un reentrenamiento.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking (cadena de pensamiento explicita).
- Auditoria de codigo y deteccion de vulnerabilidades en aplicaciones y sistemas.
- Investigacion de vulnerabilidades y analisis de seguridad defensiva (infosec, appsec).
- Generacion de parches y reparacion de programas (patch-generation, program-repair).
- Soporte de tool calling y function calling para integracion en pipelines y agentes.
- Capacidades agenticas y de razonamiento multi-paso (coding-agent, security-agent).
- Generacion y asistencia en codigo y ingenieria de software.
- Resolucion de retos tipo CTF y tareas de DevSecOps/SecOps.
- Contexto largo de hasta 256k tokens para analisis de repositorios y trazas extensas.
- Soporte multilingue limitado: la model card declara unicamente ingles.

## Casos de uso

- Auditoria de codigo automatizada: el modelo puede revisar repositorios completos aprovechando la ventana de 256k tokens para detectar patrones inseguros, inyecciones, fallos de validacion de entrada y malas practicas, adecuado por su especializacion en code-audit y appsec.
- Deteccion y triaje de vulnerabilidades: se puede integrar en pipelines de CI/CD para analizar cambios de codigo y generar informes de vulnerabilidades con contexto, gracias a sus capacidades de razonamiento y tool calling.
- Generacion de parches y reparacion de programas: dado un fallo identificado, el modelo puede proponer parches de codigo y explicar la correccion, apoyandose en sus etiquetas de patch-generation y program-repair.
- Agente de seguridad en DevSecOps: mediante function calling, el modelo puede orquestar herramientas (escaneo, consulta de bases de datos de CVE, analisis estatico) en flujos multi-paso para automatizar tareas de SecOps.
- Asistencia en investigacion de seguridad: analisis de trazas, logs y configuraciones extensas gracias al contexto largo, util para investigadores que necesitan correlacionar grandes volumenes de informacion.
- Entrenamiento y retos CTF: el modelo puede asistir en la resolucion de retos de captura de bandera y en la formacion de equipos de seguridad, por su orientacion explicita a ctf.
- Despliegue self-hosted en entornos sensibles: al ser GGUF con licencia MIT, permite ejecutar auditoria de codigo en infraestructura propia sin enviar codigo confidencial a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero GGUF): i1-Q2_K ~13,3 GB; i1-IQ3_S ~15,7 GB; i1-Q3_K_M ~17,3 GB; i1-IQ4_XS ~19,3 GB; i1-Q4_K_M ~21,8 GB; i1-Q5_K_M ~25,4 GB; i1-Q6_K ~29,3 GB. A estos valores hay que sumar el overhead de contexto KV, que crece con la longitud de contexto usada.
- Al ser un MoE con ~3 mil millones de parametros activos, el coste computacional por token es inferior al de un denso de 35B, pero el peso total debe residir en memoria/VRAM.
- GPU recomendadas: para cuantizaciones Q4_K_M en adelante, una RTX 4090 (24 GB) puede alojar los quants hasta ~21,8 GB con margen limitado; para Q5/Q6 y contextos largos se recomienda A100 40/80 GB o H100. Para Q2/Q3, GPUs de 16-24 GB pueden ser suficientes con contexto moderado.
- Cabe en GPU consumer: si, en modelos como RTX 3090/4090 (24 GB) con cuantizaciones Q4 o inferiores y contextos moderados; en GPUs de 16 GB solo con quants Q2/Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y SGLang para el modelo base en bf16/fp8 (segun etiquetas); TGI no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. El caracter MoE (~3B activos) sugiere un throughput relativamente alto frente a densos de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uraion-Cyber-V1.0 (i1-GGUF) | ~35,5B totales / ~3B activos (MoE) | 256k | MIT | GGUF | Especializado en ciberseguridad defensiva |
| Qwen 3.5/3.6 MoE (familia base) | Configuracion 35b-a3b | 256k (segun etiquetas) | no disponible en esta ficha | safetensors/GGUF | Modelo generalista del que deriva |
| Alternativas especializadas en seguridad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir analisis de vulnerabilidades, CVE o parches incorrectos; requiere validacion humana en entornos de produccion.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de la familia Qwen, puede heredar sesgos del modelo base.
- Uso dual: un modelo especializado en seguridad y CTF puede emplearse tanto para defensa como para tareas ofensivas; debe aplicarse supervision y politicas de uso.
- Cuantizaciones agresivas (Q2/Q3) degradan la calidad; para auditoria de codigo se recomienda Q4_K_M o superior.
- Contexto largo (256k) implica un consumo elevado de memoria KV; en hardware consumer habra que limitar la ventana efectiva.
- Licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card.
- No hay datos publicados de benchmarks, evaluaciones de seguridad ni tasas de falsos positivos, lo que limita la confianza previa al despliegue.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/Uraion-Cyber-V1.0-i1-GGUF
- Modelo base: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia del modelo base: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0/blob/main/LICENSE
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Uraion-Cyber-V1.0-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Uraion-Cyber-V1.0-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
