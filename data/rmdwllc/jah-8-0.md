# RMDWLLC/Jah-8.0

## Resumen

Jah 8.0 es un modelo de lenguaje multimodal de pesos abiertos publicado por RMDW LLC, orientado a ciberseguridad, respuesta a incidentes bajo modelo zero-trust e ingeniería de software agéntica. Se distribuye bajo licencia Apache 2.0 y está entrenado íntegramente en hardware propio del autor, según declara la model card. Su propuesta central es ofrecer un motor de IA "soberano": capacidad de razonamiento y edición de código de nivel medio-alto ejecutable en una única GPU de estación de trabajo, sin enviar datos a APIs de terceros.

Arquitectura de tipo Mixture-of-Experts con bucle interno ("looped MoE"): 26.388.641.280 parámetros totales con 3.400 millones activos por token y una profundidad efectiva de 5.400 millones mediante triple bucle del núcleo medio. Acepta entradas de texto e imagen (pipeline `image-text-to-text`), soporta hasta 1M de tokens de contexto nativo (131K por defecto en servicio mono-GPU) e incorpora decodificación especulativa nativa (DSPARK) para acelerar la generación.

Es relevante por su posicionamiento: compite en el nicho de modelos locales para entornos de alta confianza (forense de correo M365, auditoría de IAM/Kubernetes, parcheo verificado con AddressSanitizer) y por publicar resultados de evaluación con verificación de ejecución real (pytest, go test, clang -fsanitize). No obstante, el modelo tiene cero descargas y cero likes en Hugging Face en el momento de la consulta, y sus benchmarks son autoinformados sin replicación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts con bucle interno (looped MoE); transformer multimodal texto+imagen |
| Parametros totales | 26.388.641.280 |
| Parametros activos | 3.400 millones por token (profundidad efectiva de 5.400 millones vía triple bucle del núcleo medio) |
| Longitud de contexto | 1M tokens nativo; 131K por defecto en servicio mono-GPU |
| Tipos de cuantizacion | BF16 (maestro); NVFP4 + MXFP8 en la variante `Jah-8.0-NVFP4` (19,53 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); variante NVFP4 empaquetada |
| Tamano del repositorio | 53,4 GB |
| Modalidad de entrada | Texto e imagen (`image-text-to-text`) |
| Decodificacion especulativa | DSPARK (borrador multi-token nativo) |
| Post-entrenamiento | 4 etapas de ajuste completo: SFT + RLVR (Reinforcement Learning with Verifiable Rewards) |
| Fecha de publicacion | 27 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con bucle: un núcleo intermedio se recorre tres veces, lo que eleva la profundidad efectiva a 5.400 millones de parámetros equivalentes sin incrementar proporcionalmente el coste por token (3.400 millones activos). Esta combinación busca equilibrio entre capacidad de razonamiento y latencia en hardware de gama alta de escritorio. La componente multimodal permite entrada de imágenes junto a texto, lo que habilita tareas de análisis de capturas, diagramas o documentos escaneados.

El entrenamiento se realizó de extremo a extremo en infraestructura propia del autor ("$0 cloud training spend", según la model card) y consta de cuatro etapas de ajuste completo de parámetros: SFT seguido de RLVR (aprendizaje por refuerzo con recompensas verificables, es decir, validadas mediante ejecución de tests y verificadores deterministas). La model card no detalla el volumen de tokens de preentrenamiento, la composición exacta del dataset ni los detalles del proceso de RLVR más allá de la mención a verificadores de ejecución. La innovación técnica declarada más destacable es DSPARK, un mecanismo de borrador especulativo multi-token integrado en los pesos que reporta 103,2 tok/s en un solo flujo sobre una RTX PRO 6000 Blackwell en BF16.

## Capacidades

- Generación de texto y razonamiento técnico en inglés, con estilo declaradamente directo y sin relleno corporativo.
- Análisis forense de ciberseguridad: compromiso de correo empresarial (BEC) y toma de cuentas (ATO) en M365, auditoría de IAM en cloud y RBAC de Kubernetes, respuesta a ransomware en endpoint y detección de password spraying.
- Generación y parcheo de exploits ejecutables (OWASP/CWE), incluyendo parches de seguridad de memoria en C verificados con AddressSanitizer y corrección de condiciones de carrera en Go.
- Edición de código multiarchivo y tareas de repositorio en Python y Go, con soporte de hasta 30 turnos de agente.
- Tool calling / function calling multi-turno para flujos agénticos.
- Capacidades multimodales: entrada de imágenes junto a texto (image-text-to-text).
- Contexto largo: hasta 1M de tokens nativo, útil para repositorios extensos y logs de incidentes.
- Decodificación especulativa nativa (DSPARK) para acelerar la inferencia en un solo flujo.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Respuesta a incidentes de ciberseguridad en entorno cerrado: el modelo puede analizar logs de M365, eventos de IAM y trazas de endpoint sin que los datos salgan del perímetro, aprovechando el contexto de hasta 1M de tokens para correlacionar múltiples fuentes en una sola pasada.
- Auditoría de RBAC en Kubernetes e IAM cloud: dado un manifiesto o política, el modelo identifica permisos excesivos y propone parches, apoyándose en su entrenamiento específico en esta categoría (100% en el subconjunto declarado).
- Parcheo de vulnerabilidades de memoria en C: integrado en un pipeline de CI que compila con `-fsanitize=address` y valida el parche propuesto antes de fusionar, reduciendo el riesgo de introducir regresiones.
- Corrección de condiciones de carrera en Go: análisis de repositorios de más de 200.000 líneas y generación de PRs multiarchivo verificados con `go test`, adecuado por su ventana de contexto larga y su entrenamiento en tareas de repositorio.
- Ingeniería de software agéntica en local: despliegue en una estación de trabajo con GPU de 96 GB para que un agente multi-turno edite código de forma iterativa sin depender de APIs externas.
- Generación de resúmenes ejecutivos de incidentes: a partir de trazas técnicas y capturas, el modelo produce informes en inglés para dirección, aprovechando la entrada multimodal para incorporar capturas de paneles o alertas.
- Asistente de detección de ingeniería (detection engineering): redacción y revisión de reglas de detección y consultas de threat hunting sobre datos sensibles que no pueden enviarse a la nube.

## Benchmarks y rendimiento

Resultados autoinformados por el autor, medidos de forma determinista (`temperature=0.0`) sobre conjuntos de retención bloqueados con verificación de ejecución real. No se han replicado de forma independiente.

| Benchmark bloqueado | Tamano | Base sin entrenar | Jah 8.0 final | Delta |
|---|---:|---:|---:|---:|
| Ciberseguridad no vista (seed=999999) | 40 | 19/40 (47,5%) | 36/40 (90,0%) | +42,5 pts |
| Forense M365 BEC/ATO (subconjunto) | 10 | 2/10 (20,0%) | 9/10 (90,0%) | +70,0 pts |
| IAM cloud y Kubernetes dificil (subconjunto) | 10 | 6/10 (60,0%) | 10/10 (100,0%) | +40,0 pts |
| Vault publico de terceros HARD | 66 | 35/66 (53,0%) | 44/66 (66,7%) | +13,7 pts |
| SWE Python no visto (30 turnos, pytest en vivo) | 24 | no disponible | 11/24 (45,8%) | no disponible |
| PRs Go multiarchivo de 200K lineas (30 turnos, go test) | 20 | 1/20 (5,0%) | 5/20 (25,0%) | x5,0 |

| Categoria | Base sin entrenar | Jah 8.0 final |
|---|---:|---:|
| Ransomware endpoint e IR de firewall | 10/10 (100,0%) | 10/10 (100,0%) |
| Forense M365 BEC y ATO | 2/10 (20,0%) | 9/10 (90,0%) |
| Password spray y deteccion de autenticacion | 3/10 (30,0%) | 9/10 (90,0%) |
| Parcheo de exploits OWASP/CWE ejecutables | 4/10 (40,0%) | 8/10 (80,0%) |
| IAM cloud y RBAC de Kubernetes | 6/10 (60,0%) | 10/10 (100,0%) |
| Edicion quirurgica de codigo | 15/16 (93,8%) | 15/16 (93,8%) |
| CVEs de seguridad de memoria en C (ASan) | 6/12 (50,0%) | 9/12 (75,0%) |
| Remediacion AppSec (IDOR/SQLi/Traversal) | 6/16 (37,5%) | 8/16 (50,0%) |

Rendimiento medido: 103,2 tok/s en un solo flujo con BF16 sobre una RTX PRO 6000 Blackwell (DSPARK activado); 41,5 tok/s en un solo flujo con NVFP4 sobre una DGX Spark y 181,4 tok/s con lote de 4.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 50 GB de pesos; requiere una GPU de 96 GB (por ejemplo, RTX PRO 6000 Blackwell) o dos GPU de 48 GB.
- Variante NVFP4: 19,53 GB en disco, apta para una NVIDIA DGX Spark o GPU consumer de 24 a 32 GB (por ejemplo, RTX 4090 o RTX 5090).
- Cabe en GPU consumer: sí, mediante la variante NVFP4 en tarjetas de 24-32 GB.
- Opciones de despliegue: la model card no menciona frameworks concretos (vLLM, llama.cpp, Ollama, TGI); solo referencia una API dedicada privada de RMDW LLC y los pesos safetensors.
- Latencia y throughput medidos: 103,2 tok/s (BF16, un flujo, RTX PRO 6000 Blackwell); 41,5 tok/s (NVFP4, un flujo, DGX Spark); 181,4 tok/s (NVFP4, lote de 4).
- Contexto de servicio práctico: 131K tokens por defecto en mono-GPU; el 1M nativo requerirá presumiblemente configuraciones de mayor memoria, no detalladas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de terceros en la información proporcionada. Comparativa estructural orientativa:

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jah 8.0 | 26,4B | 3,4B (MoE) | 1M (131K por defecto) | Apache 2.0 | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos de referencia con los que comparar rendimiento de forma fiable; cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Modelo muy reciente y sin tracción: cero descargas y cero likes en Hugging Face en el momento de la consulta; los benchmarks son autoinformados y no consta replicación externa.
- Idiomas: solo inglés según la model card; no apto para producción en castellano u otros idiomas sin evaluación adicional.
- Riesgo de alucinación: como todo modelo generativo, puede producir parches, comandos o conclusiones forenses plausibles pero incorrectos; la verificación por ejecución (tests, ASan) es imprescindible antes de aplicar cambios en producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos de la API privada del autor y de los assets si se redistribuyen.
- Dependencia de hardware Blackwell/DGX para el rendimiento declarado; en GPU consumer la variante NVFP4 rinde a 41,5 tok/s en un flujo, lo que puede ser limitante para agentes de muchos turnos.
- La ventana de 1M tokens nativa no equivale a calidad uniforme en toda la longitud; el contexto práctico recomendado por el autor es 131K en mono-GPU.
- Especialización muy marcada en ciberseguridad y código de sistemas (C/Go/Python); su rendimiento en dominios generales no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RMDWLLC/Jah-8.0
- Variante NVFP4: https://huggingface.co/RMDWLLC/Jah-8.0-NVFP4
- Web del autor: https://rmdw.ai
- API dedicada privada: https://rmdw.ai/jah-api
- Recibos de evaluación: `JAH8_EVAL_RECEIPT.json` (incluido en el repositorio del modelo)
