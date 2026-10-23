# ccortezb/FinOptix-14B-v2

## Resumen

FinOptix-14B-v2 es un ajuste fino especializado en FinOps sobre Qwen2.5-14B-Instruct, publicado por Carlos Cortez (ccortezb, AWS Community Hero) bajo licencia Apache-2.0. El modelo está diseñado para auditar infraestructura como código, razonar sobre costes y compromisos de AWS, clasificar incidentes y generar remediaciones en forma de código, y analizar el coste de pipelines de datos. Es una segunda versión del FinOptix-14B original presentado en el hackathon "Build Small" de Hugging Face (junio de 2026), que se mantiene como línea base histórica.

La arquitectura es la del transformer decoder-only de Qwen2 (modelo denso, no MoE), con 14.770.033.664 parámetros y 32.768 tokens de contexto nativo heredados del modelo base. El entrenamiento se realizó con QLoRA de 4 bits sobre un conjunto de 966 ejemplos generados de forma determinista, en una única A100-80GB de Modal, con un coste declarado de aproximadamente 2 dólares.

Su relevancia práctica está en que cubre un nicho muy concreto (FinOps sobre AWS, Terraform, BYaML y dbt) con un modelo que cabe en una sola GPU y puede ejecutarse íntegramente offline, algo relevante para equipos que no pueden enviar inventarios de infraestructura ni datos de facturación a APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), modelo denso |
| Parámetros totales | 14.770.033.664 (14,77 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativo, heredado de Qwen2.5-14B-Instruct; el fine-tuning no documenta cambios |
| Tipos de cuantización | 16-bit (safetensors); GGUF Q4_K_M (~9 GB) y Q6_K (~12 GB) publicados en repo aparte; QLoRA 4-bit empleado en el entrenamiento |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo `ccortezb/FinOptix-14B-v2-GGUF`) |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Método de ajuste | QLoRA (r=16, alpha=32, dropout=0.05) con Unsloth + TRL (SFTTrainer) |
| Tamaño del repositorio | 29,6 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso de 14,77 B de parámetros con 32.768 tokens de contexto nativo. El ajuste se hizo con QLoRA en 4 bits (r=16, alpha=32, dropout=0,05) usando Unsloth y el SFTTrainer de TRL, sobre una única A100-80GB en Modal. El entrenamiento duró aproximadamente 20 minutos, 3 épocas y 183 pasos, con una pérdida final de entrenamiento de 0,28 y un coste declarado de unos 2 dólares.

El conjunto de datos consta de 966 ejemplos: 265 heredados de la versión 1 y 701 nuevos, todos generados con factorías deterministas por dominio que respetan las definiciones reales de las políticas (políticas de sofe-dbt, colectores de ahorro SOFE y el esquema byaml-spec v0.4). No se usaron datos de clientes ni ejemplos escritos a mano. La versión 2 amplía la cobertura a Savings Plans y Reserved Instances (cobertura y utilización), al razonamiento sobre el grafo de arquitectura derivado de BYaML v2 (radio de impacto, cadenas de coste, atribución de propietario), al triaje de incidentes con remediación como código (Remo) y al FinOps de ingeniería de datos con sofe-dbt (bytes escaneados en Athena, incremental frente a full-refresh, particionado). El cambio conceptual principal es que BYaML pasa de "validar este YAML" a "razonar sobre el grafo de arquitectura", con nodos `aws.<resource>` y aristas tipadas.

## Capacidades

- Auditoría de Terraform HCL: rightsizing, etiquetado, migración a Graviton, gp2 a gp3 y políticas de ciclo de vida.
- Análisis de JSON de AWS Cost Explorer y detección de anomalías de gasto.
- Análisis de cobertura y utilización de Savings Plans y Reserved Instances (nuevo en v2).
- Razonamiento sobre el grafo de arquitectura BYaML v2 según el esquema byaml-spec v0.4: cálculo de radio de impacto, propagación de coste y atribución de propietario.
- Triaje de incidentes (Remo): clasificación de severidad, identificación de causa raíz y emisión de remediación como código, por ejemplo un bloque `aws_s3_bucket_public_access_block` en Terraform.
- FinOps de datos (sofe-dbt): detección de `--full-refresh` sobre modelos incrementales, recomendación de `partition_by`, comparación entre refresco incremental y completo.
- Conversación multi-turno con plantilla de chat (formato Qwen) y Q&A general sobre FinOps.
- Generación de texto y razonamiento en inglés y español.
- Capacidad de operar completamente offline en una sola GPU.
- No soporta tool calling nativo documentado, ni visión, ni audio, ni ejecución de comandos o llamadas a APIs de AWS.

## Casos de uso

- Revisión de pull requests de Terraform en CI/CD: el modelo recibe el HCL del diff y devuelve hallazgos de rightsizing, etiquetado incompleto, volúmenes gp2 sin migrar y ausencia de políticas de ciclo de vida, con la justificación del cambio propuesto. Al ser determinista con `do_sample=False`, encaja como paso de validación reproducible.
- Auditoría de coste de modelos dbt antes de fusionar: dado un modelo con `--full-refresh` diario y 1,2 TB de bytes escaneados, detecta el patrón y recomienda particionado, estimando el ahorro mensual en Athena (el ejemplo de la model card cifra el caso en unos 180 USD/mes).
- Planificación de compromisos de facturación: a partir de los datos de cobertura y utilización de Savings Plans y Reserved Instances, el modelo razona sobre infracubierta o sobrecompromiso y propone ajustes por familia de instancias.
- Triaje de alertas de guardia: integrado en un webhook que recibe el contexto del incidente, clasifica la severidad, propone causa raíz y genera el parche de Terraform o la política necesaria como remediación, reduciendo el tiempo hasta el primer diagnóstico.
- Análisis de radio de impacto sobre arquitectura: dado un grafo BYaML v0.4, calcula qué nodos se ven afectados si falla uno concreto y qué cadenas de coste explican el gasto agregado, útil para revisiones de arquitectura previas a despliegues.
- Asistente interno de FinOps con requisito de soberanía de datos: al poder ejecutarse offline sobre una única GPU, permite consultas sobre inventarios y facturación sin enviar información sensible a un proveedor externo.
- Formación y documentación de equipos: genera explicaciones de por qué una práctica de Terraform o dbt encarece la factura, con la ventaja de que las cifras se derivan de los datos incluidos en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de FinOps, y no se ha localizado ninguna comparación cuantitativa con modelos similares. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- Pesos en 16 bits: 29,6 GB de repositorio, lo que implica del orden de 32 a 35 GB de VRAM contando caché KV para contexto moderado. Necesita A100-40GB, A6000-48GB, H100-80GB o dos RTX 4090 con paralelismo de tensor.
- GGUF Q6_K: aproximadamente 12 GB según el autor, con un requisito declarado de unos 13 GB de RAM o VRAM. Cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y A6000.
- GGUF Q4_K_M: aproximadamente 9 GB, con un requisito declarado de unos 10 GB de RAM o VRAM. Cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070, además de Mac con Apple Silicon unificada de 16 GB o más.
- En CPU: viable únicamente con Q4_K_M mediante llama.cpp u Ollama, con latencia alta y no documentada.
- Opciones de despliegue: transformers (ejemplo incluido en la model card), vLLM y TGI (los tags `text-generation-inference` y `endpoints_compatible` indican compatibilidad con TGI y Hugging Face Inference Endpoints), Ollama y llama.cpp a través del repositorio GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo para ninguno de los formatos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinOptix-14B-v2 | 14,77 B | 32.768 | FinOps sobre AWS, Terraform, BYaML y dbt | Apache-2.0 | Hugging Face (16-bit y GGUF) |
| Qwen2.5-14B-Instruct | 14,77 B | 32.768 | Generalista, instrucciones | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-14B-Instruct | 14,7 B | 32.768 | Generación y razonamiento sobre código | Apache-2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,62 B | 32.768 | Generalista, instrucciones | Apache-2.0 | Hugging Face |

Frente al modelo base, FinOptix-14B-v2 intercambia amplitud de conocimiento general por precisión en un dominio estrecho: gana en formato y vocabulario específico de FinOps, pero previsiblemente pierde en tareas generales fuera de ese ámbito. Frente a Qwen2.5-Coder-14B-Instruct, el modelo de código es más fuerte en generación de código arbitrario, mientras que FinOptix está sesgado hacia HCL, JSON de facturación y esquemas BYaML. No se dispone de comparaciones de rendimiento medidas entre estas alternativas en la información proporcionada, y no se han identificado otros modelos públicos específicos de FinOps con los que comparar.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos modelados a partir de patrones reales (966 ejemplos), sin datos de clientes. La diversidad de formatos de entrada está acotada a la de las factorías deterministas.
- Con 183 pasos de entrenamiento y una pérdida de 0,28, existe riesgo de sobreajuste a las plantillas de salida del generador; puede reproducir estructuras rígidas ante entradas atípicas.
- No ejecuta comandos ni llama a APIs de AWS en vivo: razona y recomienda, pero no verifica el estado real de la infraestructura. Toda cifra de coste es ilustrativa salvo que el prompt incluya estadísticas reales de escaneo.
- Riesgo de alucinación en nombres de recursos, métricas de facturación y referencias a servicios de AWS cuando la información no está en el contexto.
- Idiomas declarados: inglés y español. No hay evidencia de calidad en otros idiomas ni evaluación específica del rendimiento en español.
- Las respuestas no sustituyen asesoramiento financiero, de cumplimiento ni de seguridad.
- Licencia Apache-2.0, que permite uso comercial y modificación; el modelo base Qwen2.5-14B-Instruct es también Apache-2.0, por lo que no se añaden restricciones adicionales conocidas.
- Validación comunitaria muy baja: 0 descargas y 2 "me gusta" en el momento de la consulta, sin evaluaciones independientes publicadas.
- El repositorio se actualizó pocas horas después de su creación, lo que sugiere que los artefactos pueden seguir cambiando.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccortezb/FinOptix-14B-v2
- Repositorio GGUF (Q4_K_M y Q6_K): https://huggingface.co/ccortezb/FinOptix-14B-v2-GGUF
- Modelo predecesor (v1): https://huggingface.co/ccortezb/FinOptix-14B
- Build log en tres partes (BLOG.md): https://huggingface.co/ccortezb/FinOptix-14B-v2/blob/main/BLOG.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- LinkedIn del autor: https://www.linkedin.com/in/carloscortezcloud
- X del autor: https://x.com/ccortezb
- GitHub del autor: https://github.com/ccortezb
- Perfil de AWS Heroes: https://builder.aws.com/community/@breakinthecloud
- No se han encontrado enlaces adicionales relevantes en la búsqueda web.
