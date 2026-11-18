# mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-i1-GGUF

## Resumen

Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-i1-GGUF es un conjunto de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5, publicado por el usuario xtools-at. Se trata, por tanto, de un artefacto de redistribucion y compresion, no de un modelo entrenado desde cero por el autor del repositorio. El nombre sugiere un ajuste fino orientado a ciberseguridad sobre una base de la familia Qwen de aproximadamente 0,8 mil millones de parametros, si bien la model card no aporta documentacion tecnica que lo confirme.

La relevancia de este repositorio es practica: ofrece el modelo en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K, incluyendo variantes K-quant e i-quant), lo que permite desplegarlo en hardware modesto mediante llama.cpp u Ollama. Los cuants se han generado con imatrix (importance matrix), un metodo que reduce la perdida de calidad frente a la cuantizacion uniforme en modelos pequenos.

No obstante, la informacion disponible es muy limitada: la model card solo contiene metadatos de la herramienta de cuantizacion y un enlace al modelo original. No se documentan datos de entrenamiento, licencia, idiomas ni resultados de evaluacion, lo que obliga a marcar numerosos campos como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, familia Qwen; no confirmado en la informacion) |
| Parametros totales | no disponible de forma fiable; el dato safetensors del repo indica 555.378, valor inconsistente con el nombre "0.8B" y probablemente erroneo o parcial |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp; convert_type: hf, quantize_version: 2) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. El nombre indica una base Qwen de aproximadamente 0,8B parametros y un ajuste fino orientado a ciberseguridad (prefijo "Qwensploit"), pero la model card del repositorio GGUF no incluye detalles sobre la arquitectura, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico documentado tecnicamente es el proceso de cuantizacion: los ficheros se han producido con cuantizacion ponderada por importance matrix (imatrix), segun los metadatos de la model card. Este metodo estima la importancia de cada peso a partir de activaciones calibradas y permite que las cuantizaciones de baja precision (especialmente las de la familia IQ) preserven mejor la perplejidad que las cuantizaciones uniformes equivalentes.

## Capacidades

- Generacion de texto y respuesta a instrucciones: capacidad inferida del formato de chat de la familia Qwen, no verificada en la informacion disponible.
- Aplicaciones orientadas a ciberseguridad: el nombre del modelo sugiere un ajuste especifico, aunque no se documenta que tareas cubre (analisis de vulnerabilidades, explicacion de exploits, hardening, etc.).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Analisis de trazas y logs de seguridad en local: al ser un modelo pequeno cuantizado, puede ejecutarse en un portatil sin GPU dedicada y resumir o clasificar eventos de seguridad sin enviar datos a servicios externos.
- Asistente de formacion en ciberseguridad: generacion de explicaciones sobre conceptos como inyeccion SQL, XSS o escalada de privilegios, desplegado con Ollama en entornos de laboratorio con recursos limitados.
- Triaje de alertas en pipelines de SOC: integracion via API local (llama.cpp server) para preclasificar alertas antes de escalarlas a analistas humanos, aprovechando el bajo coste de inferencia de un modelo sub-1B.
- Prototipado rapido de chatbots especializados: uso de las variantes Q4_K_M o Q5_K_M como base para demos de asistentes de seguridad en entornos air-gapped.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece practicamente toda la escala de cuantizaciones, lo que permite medir en un mismo modelo el impacto de IQ1_S frente a Q6_K en tareas de seguridad.
- Generacion de snippets de hardening y configuraciones: redaccion de reglas de firewall, politicas de contraseñas o configuraciones de TLS en formato texto, con revision humana obligatoria por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~0,8B parametros, las cuantizaciones Q4_K_M ocupan del orden de 0,5 GB y las Q6_K alrededor de 0,7 GB; las variantes IQ1_S e IQ2_XXS quedan por debajo de 0,4 GB (estimaciones por tamano de parametros, no confirmadas en la informacion).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060) es suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, con holgura en todas las cuantizaciones.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (llama.cpp server). vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponibles; en CPU moderna se espera decodificacion interactiva para este tamano, pero no hay mediciones publicadas en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5 (este repo) | ~0,8B (segun nombre) | no disponible | no disponible | GGUF (multiples cuants) | Ajuste orientado a ciberseguridad, sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 0,5B | 32K (segun documentacion oficial de Qwen) | Apache 2.0 (segun documentacion oficial) | safetensors, GGUF | Base generalista con licencia permisiva y evaluaciones publicadas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun documentacion oficial de Qwen) | Apache 2.0 (segun documentacion oficial) | safetensors, GGUF | Mayor capacidad a costa de mas VRAM |
| Modelos de seguridad especializados de ~1B | variable | no disponible | variable | variable | No se dispone de una comparativa verificada en la informacion |

La comparacion con modelos oficiales de Qwen se ofrece solo como referencia de categoria; no se han verificado resultados frente a este ajuste concreto.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, licencia ni idiomas declarados; no se recomienda su uso en produccion sin auditar el modelo base original.
- Riesgo elevado de alucinacion: un modelo de ~0,8B parametros tiene capacidad limitada de razonamiento y puede generar comandos o recomendaciones de seguridad incorrectas o peligrosas.
- Licencia desconocida: al no indicarse licencia, no se puede asumir permiso para uso comercial; hay que consultar el repositorio del modelo original (xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5).
- Dato de parametros inconsistente: el campo safetensors del repo (555.378) no cuadra con el nombre "0.8B"; conviene verificar el modelo base antes de dimensionar el despliegue.
- Contenido de ciberseguridad: un ajuste de este tipo puede producir contenido dual (explicaciones de exploits); es necesario aplicar filtros y supervision en cualquier despliegue publico.
- Sesgos: no documentados, pero heredados previsiblemente del corpus de entrenamiento del modelo base, que no se especifica.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ2_XXS) degradan notablemente la calidad en modelos pequenos; para uso real se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Herramienta de cuantizacion (llama.cpp): https://github.com/ggerganov/llama.cpp
