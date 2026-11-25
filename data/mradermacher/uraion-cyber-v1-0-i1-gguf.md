# mradermacher/Uraion-Cyber-V1.0-i1-GGUF

## Resumen

Uraion-Cyber-V1.0-i1-GGUF es la distribucion en formato GGUF, con cuantizacion de tipo imatrix, del modelo Uraion-Cyber-V1.0 desarrollado por UraionLabs. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos. El modelo esta especializado en ciberseguridad: auditoria de codigo, deteccion de vulnerabilidades, generacion de parches, reparacion de programas y tareas de CTF, ademas de capacidades generales de codigo y razonamiento.

Segun los metadatos, se trata de un modelo de arquitectura Mixture-of-Experts (MoE) de la familia Qwen (etiquetas qwen3_5_moe, qwen3.5, qwen3.6), con 35.505.251.456 parametros totales y una configuracion del tipo 35B-A3B, es decir, aproximadamente 35.000 millones de parametros totales con unos 3.000 millones activos por token. Declara una ventana de contexto de 256.000 tokens y capacidades de tool calling, razonamiento con cadena de pensamiento y uso como agente.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo especializado en seguridad en infraestructura propia, con cuantizaciones desde 13,3 GB hasta 29,3 GB, lo que permite desplegarlo en GPUs de consumo y en entornos air-gapped donde no es admisible enviar codigo o datos sensibles a APIs externas. La licencia MIT del modelo base facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen (etiquetas qwen3_5_moe / qwen3.5 / qwen3.6) |
| Parametros totales | 35.505.251.456 (aproximadamente 35,5 B) |
| Parametros activos | Aproximadamente 3 B (designacion 35B-A3B) |
| Longitud de contexto | 256.000 tokens (segun etiqueta 256k-context) |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien hay cuantizaciones estaticas en el repositorio hermano |
| Idiomas soportados | Ingles (campo language: en en la model card); otros idiomas no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas de mezcla de expertos (MoE), coherente con la nomenclatura 35B-A3B y las etiquetas de la familia Qwen 3.x. Esto implica que, aunque el modelo completo ocupa unos 35.500 millones de parametros, solo se activa un subconjunto reducido (del orden de 3.000 millones) por token generado, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. La ventana de contexto declarada es de 256.000 tokens, adecuada para auditar repositorios completos o trazas largas.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. La model card del repositorio cuantizado no incluye estos datos y la del modelo base no se ha proporcionado en la informacion disponible. Tampoco se documentan innovaciones tecnicas especificas mas alla de las inherentes a la arquitectura MoE y al soporte de razonamiento con cadena de pensamiento (thinking) y tool calling. Las cuantizaciones de este repositorio se han generado con fichero imatrix (Uraion-Cyber-V1.0.imatrix.gguf), lo que segun el autor mejora la calidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto y razonamiento general, con modo de pensamiento explicito (chain-of-thought / thinking).
- Generacion y comprension de codigo en el contexto de ingenieria de software.
- Deteccion de vulnerabilidades y auditoria de seguridad de codigo (code-audit, security-audit).
- Investigacion de vulnerabilidades y analisis de seguridad defensiva (defensive-security, infosec, appsec).
- Generacion de parches y reparacion de programas (patch-generation, program-repair).
- Resolucion de retos de tipo CTF (capture the flag).
- Soporte de tool calling y function calling, orientado a agentes.
- Uso como agente de codigo y agente de seguridad con razonamiento multi-paso (agentic, coding-agent, security-agent).
- Capacidad multimodal: la model card indica que es un modelo de vision y que los ficheros mmproj, si existen, se encuentran en el repositorio estatico.
- Capacidades multilingues: solo se declara ingles; no hay datos de otros idiomas.

## Casos de uso

- Auditoria de codigo en CI/CD: el modelo puede analizar diffs y ficheros completos en busca de patrones de vulnerabilidad (inyeccion, desbordamientos, uso inseguro de criptografia) aprovechando sus 256.000 tokens de contexto para revisar modulos enteros en una sola pasada.
- Generacion de parches de seguridad: dado un hallazgo y el codigo afectado, el modelo propone parches y puede integrarse en un pipeline de revision humana antes del merge, reduciendo el tiempo entre deteccion y remediacion.
- Triaje de alertas de SAST/DAST: como agente con tool calling, puede consultar resultados de escaneres, priorizar hallazgos por explotabilidad y descartar falsos positivos con razonamiento multi-paso.
- Asistente de SecOps en entorno air-gapped: al ejecutarse en local mediante llama.cpp u Ollama con cuantizaciones de 13-29 GB, permite analizar trazas, logs y codigo sensible sin enviar datos a APIs externas.
- Formacion y CTF: como modelo especializado en retos de seguridad, sirve de apoyo en plataformas de entrenamiento y competiciones, explicando tecnicas y guiando la resolucion de challenges.
- Revision de dependencias y supply chain: con contexto largo puede procesar ficheros de manifiesto, changelogs y codigo de terceros para detectar practicas inseguras o incompatibilidades de licencia en proyectos grandes.
- Desarrollo de herramientas DevSecOps: integrado como backend de un asistente interno que responda preguntas sobre politicas de seguridad y genere reglas de analisis estatico personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto): aproximadamente 14-16 GB con i1-Q2_K/i1-IQ3_S, 20-23 GB con i1-Q4_K_S/i1-Q4_K_M, 25-30 GB con i1-Q5_K_M/i1-Q6_K. A esto hay que sumar la cache KV, que crece con la longitud de contexto y puede ser considerable a 256.000 tokens.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4; A100 40/80 GB, H100 o L40S para Q5/Q6 y contextos largos; configuraciones multi-GPU para explotar la ventana completa de 256k tokens.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y contextos moderados; en GPUs de 16 GB solo con cuantizaciones Q2/Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; el modelo base (safetensors) admite vLLM y SGLang, segun las etiquetas del repositorio; tambien es posible servirlo con TGI a partir de los pesos originales.
- Latencia y throughput: no disponibles. Al ser un MoE con unos 3.000 millones de parametros activos, el coste por token es inferior al de un modelo denso de 35 B, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uraion-Cyber-V1.0 (este, GGUF i1) | 35,5 B totales / ~3 B activos (MoE) | 256k | MIT | GGUF, safetensors (base) | Especializado en ciberseguridad; cuantizaciones imatrix de 13,3 a 29,3 GB |
| Uraion-Cyber-V1.0-GGUF (estatico) | 35,5 B totales / ~3 B activos | 256k | MIT | GGUF | Mismas cuantizaciones sin imatrix; incluye ficheros mmproj |
| Modelos densos de ~30-35 B de la familia Qwen | ~30-35 B | variable | variable | safetensors, GGUF | No disponible en la informacion proporcionada; comparacion cualitativa por tamano |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse predominantemente en ingles, el rendimiento en castellano y otros idiomas puede degradarse.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar CVE, funciones de API o fragmentos de codigo; en contextos de seguridad es critico validar cada hallazgo y parche antes de aplicarlo.
- Limitaciones de contexto e idioma: la ventana de 256k tokens es nominal y el rendimiento efectivo puede decaer en contextos muy largos; solo se declara soporte de ingles.
- Restricciones de licencia: licencia MIT, que permite uso comercial; conviene revisar la licencia del modelo base en el repositorio de UraionLabs por si hubiera terminos adicionales.
- Caveats para produccion: las cuantizaciones de baja precision (Q2, Q3) pueden degradar la calidad en tareas de razonamiento y generacion de parches; se recomienda Q4_K_M o superior para uso real. El uso de un modelo especializado en seguridad implica riesgos de doble uso: debe desplegarse con controles de acceso y registro de auditoria.
- La model card indica que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio, sino en el estatico; verificar su disponibilidad antes de asumir capacidades multimodales.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Uraion-Cyber-V1.0-i1-GGUF
- Modelo base: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia del modelo base: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0/blob/main/LICENSE
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Uraion-Cyber-V1.0-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Uraion-Cyber-V1.0-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Uraion-Cyber-V1.0-i1-GGUF/resolve/main/Uraion-Cyber-V1.0.imatrix.gguf
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
