# mradermacher/citavyn-gemma4-2b-GGUF

## Resumen

citavyn-gemma4-2b es un modelo de lenguaje especializado en gobernanza de IA, orientado a tareas de cumplimiento normativo (EU AI Act, NIST AI RMF), gestion de acceso basado en roles (RBAC), redaccion de datos personales (PII) y recuperacion aumentada por generacion (RAG). Se distribuye como un fine-tune del modelo base citavyn/citavyn-gemma4-2b-full, del cual esta version es una cuantizacion GGUF realizada por mradermacher. La nomenclatura sugiere una base Gemma 4 de 2B, aunque el recuento real de parametros en safetensors asciende a 4.647.450.147 (4,65 mil millones), dato que no coincide con la etiqueta "2b" del nombre.

El modelo resuelve un nicho concreto: servir como componente de razonamiento en pipelines de cumplimiento y auditoria de sistemas de IA, con capacidad de clasificar riesgos, aplicar reglas de gobernanza y anonimizar informacion sensible. Su licencia Apache 2.0 y su formato GGUF lo hacen desplegable en entornos con recursos limitados, lo que resulta relevante para equipos que necesitan ejecutar controles de cumplimiento en local sin depender de APIs externas.

Esta ficha cubre la version cuantizada en GGUF publicada por mradermacher, que incluye 12 variantes de cuantizacion estatica (desde Q2_K hasta f16) con tamanos que van de 3,1 GB a 9,4 GB. No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Gemma 4, sin confirmar) |
| Parametros totales | 4.647.450.147 (segun safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base citavyn/citavyn-gemma4-2b-full. El nombre y las etiquetas sugieren que deriva de la familia Gemma 4, con un fine-tune orientado a tareas de gobernanza de IA, pero no se confirma el tipo de transformer, el numero de capas, la dimension oculta ni el mecanismo de atencion. El recuento de parametros (4,65 mil millones) no concuerda con la etiqueta "2b", lo que puede deberse a un nombre comercial, a un error de etiquetado o a que el modelo base incluya componentes adicionales.

Tampoco se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. Las etiquetas del repositorio (rag, ai-governance, eu-ai-act, nist-ai-rmf, gdpr, rbac, pii-redaction) indican el dominio de especializacion, pero no constituyen informacion tecnica verificable sobre el proceso de entrenamiento. Esta version concreta es una cuantizacion estatica generada por mradermacher; el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a tareas de gobernanza y cumplimiento.
- Razonamiento sobre marcos normativos: EU AI Act, NIST AI RMF y GDPR, segun las etiquetas del modelo.
- Soporte para flujos de recuperacion aumentada por generacion (RAG), etiquetado explicitamente.
- Gestion de acceso basado en roles (RBAC): el modelo esta disenado para razonar sobre permisos y politicas de acceso.
- Redaccion de datos personales (PII redaction): capacidad declarada de identificar y anonimizar informacion sensible.
- Clasificacion y evaluacion de riesgos de sistemas de IA en contextos de auditoria.
- No se confirma soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.

## Casos de uso

- Auditoria de cumplimiento del EU AI Act: el modelo puede clasificar sistemas de IA por nivel de riesgo y generar borradores de evaluaciones de conformidad, apoyandose en su especializacion declarada en el reglamento europeo.
- Implementacion de controles del NIST AI RMF: uso como asistente para mapear practicas internas a las funciones del marco (govern, map, measure, manage) y producir documentacion de gobernanza.
- Redaccion de PII en pipelines de datos: integrado como paso previo al almacenamiento o al envio a otros modelos, el modelo identifica y enmascara datos personales en texto en ingles.
- Motor de decisiones RBAC: el modelo puede evaluar solicitudes de acceso contra politicas de rol y justificar la decision en lenguaje natural, util en herramientas de administracion de identidades.
- Asistente RAG para equipos de compliance: conectado a una base documental de politicas internas y normativa, responde consultas de empleados sobre obligaciones regulatorias con contexto recuperado.
- Generacion de informes de auditoria: a partir de registros de eventos y configuraciones de sistemas, el modelo redacta resumenes estructurados para revision humana.
- Despliegue en local para entornos regulados: al ser GGUF y Apache 2.0, puede ejecutarse en infraestructura propia sin enviar datos sensibles a terceros, requisito habitual en banca, sanidad o sector publico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos + overhead de contexto, aproximada):
  - Q2_K (3,1 GB): ~4 GB de VRAM.
  - Q4_K_M (3,5 GB): ~4,5-5 GB de VRAM.
  - Q6_K (3,9 GB): ~5-5,5 GB de VRAM.
  - Q8_0 (5,1 GB): ~6,5 GB de VRAM.
  - f16 (9,4 GB): ~11 GB de VRAM.
- GPU consumer: las cuantizaciones Q4_K_S/Q4_K_M caben en GPUs con 6-8 GB (RTX 3060, RTX 4060, RTX 2070). Q8_0 requiere 8 GB o mas (RTX 3070/4060 Ti). f16 requiere 12 GB o mas (RTX 3060 12 GB, RTX 4070).
- GPU de datacenter: A100, H100 y L40S sobradas para cualquier cuantizacion; utiles si se necesita alto throughput con batching.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para serving de alta concurrencia, vLLM o TGI requeririan los pesos en safetensors del modelo base, no la version GGUF.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de ~4,6B parametros en Q4_K_M sobre una RTX 4090 suele superar las decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| citavyn-gemma4-2b (esta ficha) | 4,65B (segun safetensors) | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tune especializado en gobernanza de IA |
| Gemma 2 2B (referencia de familia) | 2,6B | 8K | Gemma Terms | safetensors, GGUF | Modelo generalista de Google; no especializado en compliance |
| Qwen2.5 3B Instruct | 3,1B | 32K | Apache 2.0 | safetensors, GGUF | Generalista multilingue con soporte de tool calling |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Generalista con contexto largo; licencia con restricciones |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa. La ventaja diferencial de citavyn-gemma4-2b es su especializacion declarada en gobernanza de IA y su licencia Apache 2.0, mas permisiva que la de Llama 3.2. Como contrapartida, su cobertura idiomatica se limita al ingles y no hay evidencia publica de su calidad frente a generalistas del mismo tamano.

## Limitaciones y advertencias

- Solo soporta ingles segun el campo `language`; no se garantiza calidad en castellano ni en otros idiomas.
- No hay benchmarks publicados: la calidad real en tareas de gobernanza, PII o RBAC no esta verificada de forma independiente.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente critico en contextos regulatorios donde una cita normativa incorrecta puede tener consecuencias legales.
- La especializacion declarada en etiquetas (eu-ai-act, nist-ai-rmf, gdpr) no equivale a asesoramiento juridico; cualquier salida debe ser revisada por un profesional.
- El recuento de parametros (4,65B) no coincide con la etiqueta "2b" del nombre, lo que genera incertidumbre sobre el modelo base real y sus capacidades.
- No se confirma soporte de tool calling ni de agentes multi-paso, lo que limita su integracion en pipelines automatizados complejos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la fidelidad; para uso en produccion se recomienda Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, el modelo base citavyn/citavyn-gemma4-2b-full deberia verificarse por si impone terminos adicionales; el nombre sugiere herencia de Gemma, cuya licencia original tiene restricciones de uso.
- El repositorio tiene 0 likes y fue creado y actualizado en noviembre de 2026, sin historial de mantenimiento posterior conocido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/citavyn-gemma4-2b-GGUF
- Modelo base: https://huggingface.co/citavyn/citavyn-gemma4-2b-full
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#citavyn-gemma4-2b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
