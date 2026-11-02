# Brunovski/gemma4-e2b-incident-triage

## Resumen
Brunovski/gemma4-e2b-incident-triage es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre el modelo base `unsloth/gemma-4-E2B-it`, orientado a la triaje automático de incidentes de infraestructura en entornos SRE y DevOps. El modelo recibe fragmentos de logs brutos y ruidosos procedentes de Traefik, Docker/Swarm, Kubernetes, PostgreSQL, Authentik y Prometheus, filtra falsos positivos y aísla la causa raíz en escenarios de fallo en cascada.

La salida está restringida a un objeto JSON con un contrato estricto que incluye severidad, componente afectado, causa raíz y la ruta al runbook de mitigación correspondiente. Ese JSON alimenta un servidor MCP (`mcp-ops-kb`) que conecta la detección de anomalías con una base de procedimientos operativos en Markdown, con el objetivo declarado de reducir el MTTR. El adaptador se distribuye como pesos PEFT en safetensors, con un tamaño de repositorio de 0,1 GB.

El interés actual del modelo radica en su enfoque de despliegue local en 4 bits sobre una única GPU de consumo (RTX 4060 de 8 GB de VRAM), sin coste de API y sin tráfico externo de logs sensibles. No obstante, se trata de un adaptador muy especializado, con licencia Gemma y con un alcance funcional acotado a la taxonomía de incidentes definida por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only Gemma 4 (modelo base `unsloth/gemma-4-E2B-it`) |
| Parametros totales | no disponible (el repositorio contiene solo el adaptador, 0,1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit en entrenamiento; el adaptador se aplica sobre el modelo base cuantizado (GGUF/BitsAndBytes no especificado) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Gemma (licencia de uso de Gemma) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA entrenado mediante QLoRA de 4 bits sobre el modelo base `unsloth/gemma-4-E2B-it`, empleando la librería Unsloth para el ajuste eficiente. La arquitectura subyacente es la del modelo Gemma 4 en su variante E2B, un transformer decoder-only de la familia Gemma; el adaptador no modifica la arquitectura, sino que inyecta matrices de bajo rango en las capas del modelo base. El repositorio publicado contiene únicamente los pesos del adaptador en formato safetensors, por lo que los parámetros totales del modelo resultante dependen del modelo base y no se detallan en la información disponible.

El entrenamiento es de tipo supervisado (SFT) sobre ejemplos de logs de infraestructura con salida JSON anotada, según la model card. Se define una taxonomía cerrada de 34 clases distribuidas en 7 subsistemas, y se entrena al modelo para ignorar síntomas derivados (por ejemplo, pods en `BackOff` tras la caída de la base de datos) y señalar únicamente el evento primario. La model card menciona versiones v5 y v6 del entrenamiento, con una evaluación separada en un conjunto sintético controlado (n = 300) y en logs reales de un laboratorio de caos sobre Kubernetes (Minikube, namespace `chaos-lab`) con Traefik v3, PostgreSQL, Authentik y Prometheus. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades
- Generación de texto estructurado: produce exclusivamente un objeto JSON con un contrato estricto (severidad, componente afectado, causa raíz, runbook).
- Triaje de incidentes de infraestructura: identifica la causa raíz en cascadas de fallos a partir de logs brutos con códigos ANSI, timestamps heterogéneos, IPs dinámicas, hashes de pods y stack traces extensos.
- Filtrado de falsos positivos: descarta ruido de arranque, errores 4xx de cliente, warnings transitorios y slow queries, devolviendo severidad `NENHUMA` cuando no hay fallo real.
- Clasificación en taxonomía cerrada: 34 clases distribuidas en 7 subsistemas.
- Integración con MCP: el JSON generado alimenta un servidor MCP (`mcp-ops-kb`) que recupera el runbook en Markdown a partir de la ruta devuelta.
- Capacidad multilingüe limitada al portugués (idioma declarado en la model card).
- No se documentan en la información disponible capacidades de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento explícito más allá del contrato JSON.

## Casos de uso
- Triaje automático de incidentes en Kubernetes: el modelo recibe ventanas de logs del clúster y devuelve el componente afectado y la causa raíz, lo que permite enrutar el incidente al equipo correspondiente sin intervención manual inicial.
- Detección de certificados TLS caducados en Traefik/PKI: a partir de logs de Traefik, el modelo identifica la expiración del certificado en la CA interna y apunta al runbook `runbooks/traefik/certificado-expirado.md`.
- Diagnóstico de fallos en cascada en PostgreSQL: el modelo distingue entre el síntoma final (por ejemplo, HTTP 504 en Traefik) y el evento primario (agotamiento del pool de conexiones o fallo de disco), lo que reduce el tiempo de diagnóstico.
- Filtrado de ruido en alertas de Prometheus: descarta warnings transitorios y errores 4xx de cliente, y solo escala los incidentes con severidad real, lo que disminuye la fatiga de alertas.
- Automatización de la respuesta a incidentes vía MCP: el JSON de salida se valida contra un guardrail de runbooks y se pasa al servidor MCP, que recupera el procedimiento de mitigación en Markdown para su ejecución o revisión.
- Despliegue local con requisitos de privacidad: al ejecutarse en 4 bits sobre una RTX 4060 de 8 GB, los logs sensibles no salen de la infraestructura del operador, lo que encaja en entornos con restricciones de cumplimiento.
- Asistencia a guardias SRE: el modelo actúa como primer nivel de triaje en un pipeline de observabilidad, y propone severidad y runbook antes de que el ingeniero de guardia revise el incidente.

## Benchmarks y rendimiento
Los resultados publicados en la model card se refieren a la evaluación del adaptador sobre logs reales del laboratorio de caos (n = 32 ventanas no vistas en entrenamiento), comparando el modelo base en zero-shot, la versión v5 y la versión v6 actual.

| Métrica / criterio | Modelo base (zero-shot) | v5 | v6 (actual) | Ganancia base → v6 |
|---|---:|---:|---:|---:|
| JSON válido | 100% | 100% | 100% | estable |
| Runbook correcto (exacto) | 0% | 53% | 88% | +88 p.p. |
| Severidad correcta | 28% | 34% | 94% | +66 p.p. |
| Componente afectado | 3% | 72% | 91% | +88 p.p. |
| Grounding (hechos en el log) | 88% | 21% | 96% | +8 p.p. |
| Runbooks inventados (alucinación) | 100% | 44% | 12% | -88 p.p. |

Desglose por grupo en logs reales (versión v6):

| Grupo real (`chaos-lab`) | Ventanas (n) | JSON | Runbook | Severidad | Componente | Grounding | Inventado |
|---|---:|---:|---:|---:|---:|---:|---:|
| Total | 32 | 100% | 88% | 94% | 91% | 96% | 12% |
| real (cascada) | 6 | 100% | 100% | 100% | 100% | 100% | 0% |
| real (traefik) | 7 | 100% | 100% | 100% | 100% | 100% | 0% |
| real (prometheus) | 3 | 100% | 100% | 100% | 100% | 100% | 0% |
| real (postgres) | 10 | 100% | 90% | 90% | 90% | 100% | 10% |
| real (events) | 3 | 100% | 67% | 67% | 100% | 50% | 33% |
| real (authentik) | 3 | 100% | 33% | 100% | 33% | 100% | 67% |

La model card menciona además un conjunto sintético controlado (n = 300) con formulaciones vistas, formulaciones inéditas, cascadas y hard negatives, pero los resultados detallados de ese conjunto no están incluidos en la información disponible.

## Requisitos de hardware
- VRAM estimada: el autor indica que el modelo se ejecuta en 4 bits en una única GPU de consumo RTX 4060 con 8 GB de VRAM. No se detalla el consumo exacto ni el tamaño del modelo base cuantizado.
- GPU recomendadas: RTX 4060 (8 GB) según la model card; no se especifican otras GPU (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, según el autor, en una RTX 4060 de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: el adaptador se publica como PEFT y requiere cargar el modelo base `unsloth/gemma-4-E2B-it`. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor menciona "baja latencia" y "coste cero de API" de forma cualitativa, sin cifras.

## Comparativa con modelos similares
No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, se compara con el modelo base y con alternativas genéricas de la misma categoría, aunque sin cifras de rendimiento verificables:

| Modelo | Tipo | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Brunovski/gemma4-e2b-incident-triage | Adaptador LoRA sobre Gemma 4 E2B | no disponible | Gemma | HuggingFace (0 descargas) | Especializado en triaje de incidentes, salida JSON estricta |
| unsloth/gemma-4-E2B-it | Modelo base instruct | no disponible | Gemma | HuggingFace | Sin ajuste específico; 0% de runbook correcto en la evaluación del autor |
| Alternativas genéricas de triaje (p. ej., modelos instruct de 2-3B) | Transformer decoder-only | variable | variable | variable | No evaluadas en la información disponible; no se dispone de comparación directa |

## Limitaciones y advertencias
- Ámbito muy restringido: el modelo está entrenado para una taxonomía cerrada de 34 clases en 7 subsistemas (Traefik, Docker/Swarm, Kubernetes, PostgreSQL, Authentik, Prometheus y eventos). Fuera de ese dominio, la calidad de la salida no está garantizada.
- Idioma: solo se declara portugués; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Alucinación de runbooks: aunque la versión v6 reduce los runbooks inventados al 12% en logs reales, sigue existiendo riesgo. El grupo `authentik` muestra un 67% de runbooks inventados y el grupo `events` un 33%, por lo que se recomienda un guardrail de validación de rutas antes de ejecutar cualquier acción.
- Rendimiento desigual por subsistema: en `authentik` el acierto de runbook cae al 33% y el de componente al 33%; en `events`, el grounding baja al 50%. No debe asumirse un rendimiento homogéneo entre componentes.
- Muestra de evaluación pequeña: los resultados en logs reales se basan en n = 32 ventanas, con grupos de solo 3 ventanas en algunos casos, lo que limita la significación estadística.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma, que impone restricciones y obligaciones de atribución; debe revisarse antes de un despliegue en producción.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar y cargar `unsloth/gemma-4-E2B-it` con la configuración PEFT adecuada.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación independiente.
- Sesgos: no se documentan en la información disponible análisis de sesgos del adaptador ni del modelo base.

## Enlaces
- [HuggingFace: Brunovski/gemma4-e2b-incident-triage](https://huggingface.co/Brunovski/gemma4-e2b-incident-triage)
- [Modelo base: unsloth/gemma-4-E2B-it](https://huggingface.co/unsloth/gemma-4-E2B-it)
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
