# citavyn/citavyn-gemma4-2b-lora

## Resumen

citavyn-gemma4-2b-lora es un adaptador LoRA de ajuste supervisado (SFT) desarrollado por citavyn sobre el modelo base google/gemma-4-E2B-it. Su propósito es especializar un modelo pequeño en flujos empresariales de generación aumentada por recuperación (RAG) y de gobernanza de IA y datos, con énfasis en citación estricta de fuentes, abstención cuando la evidencia recuperada es insuficiente y cumplimiento normativo (EU AI Act, NIST AI RMF 1.0, GDPR, ISO/IEC 42001:2023).

El artefacto publicado no es un modelo completo, sino un adaptador ligero de unos 95 MB con rango LoRA r=16, pensado para PEFT y para despliegues multi-tenant en vLLM. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0, conservando los avisos de copyright y licencia del modelo base de Google.

Su relevancia actual radica en que aborda dos problemas recurrentes en RAG empresarial: la atribución fiable de afirmaciones a documentos concretos y el rechazo controlado cuando el contexto no basta. Al ser un adaptador sobre un modelo de 2B, el coste de inferencia es bajo en comparación con alternativas de mayor tamaño, lo que facilita su integración en pipelines de cumplimiento y atención interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer google/gemma-4-E2B-it; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | Adaptador de ~95 MB; parametros totales del modelo base no disponibles |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizaciones del base no especificadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 entrenado mediante Supervised Fine-Tuning sobre google/gemma-4-E2B-it. No se especifica en la informacion disponible la arquitectura interna del modelo base (tipo de atención, número de capas, dimensión oculta ni composición del dataset de preentrenamiento), más allá de su naturaleza transformer y de su tamaño de 2B implícito en la nomenclatura.

El entrenamiento se orienta a comportamientos concretos de gobernanza: atribución de afirmaciones exclusivamente a fragmentos delimitados en XML dentro de `<documents>`, ignorando documentos distractores de alta similitud; abstención cuando los documentos recuperados no contienen evidencia suficiente, en lugar de extrapolar desde la memoria de preentrenamiento; cobertura de dominios regulatorios (EU AI Act, incluidos Anexo III, Artículo 5 y Artículo 27 FRIA; NIST AI RMF 1.0 con sus funciones GOVERN, MAP, MEASURE y MANAGE; GDPR Artículos 5 y 17; ISO/IEC 42001:2023; y aislamiento RBAC/Blueprint empresarial); y aplicación de DLP con enmascaramiento de PII de nivel 4 (por ejemplo, `[REDACTED_SSN_1]`, `[REDACTED_PAN_1]`) y bloqueo de intentos de prompt injection o de elusión de control de acceso. No se indica si se emplearon RLHF, DPO u otras etapas posteriores al SFT.

## Capacidades

- Generación de texto conversacional con citación inline estricta en formato `[Doc X]`, limitada a los fragmentos XML proporcionados en el contexto.
- Abstención acotada al contexto: rechaza responder cuando la evidencia recuperada es insuficiente.
- Conocimiento alineado de marcos regulatorios: EU AI Act (Anexo III, Artículo 5, Artículo 27 FRIA), NIST AI RMF 1.0, GDPR (Artículos 5 y 17) e ISO/IEC 42001:2023.
- Aplicación de controles de aislamiento mediante RBAC y Blueprint empresarial.
- DLP y seguridad: enmascaramiento de PII de nivel 4 y bloqueo de prompt injection y de intentos de bypass de autorización.
- Ignorancia deliberada de documentos distractores con alta similitud semántica.
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de cumplimiento normativo interno: el adaptador responde preguntas sobre EU AI Act, NIST AI RMF, GDPR e ISO/IEC 42001 citando el fragmento exacto del corpus regulatorio recuperado, lo que permite auditar cada afirmación contra su fuente.
- Revisión documental con trazabilidad: en flujos de evaluación de impacto (FRIA) o registros de tratamiento, el modelo atribuye cada conclusión a un `[Doc X]` concreto y se abstiene si el expediente no cubre el punto consultado.
- Atención a empleados sobre políticas internas: integrado en un RAG sobre manuales de gobernanza y blueprints de acceso, responde consultas multi-turno y evita inventar políticas no documentadas.
- Redacción asistida de informes de auditoría: genera borradores de secciones regulatorias con citas inline, reduciendo el trabajo de localización de referencias para equipos de compliance.
- Enmascaramiento de datos en pipelines de soporte: aplica DLP sobre conversaciones con PII (SSN, PAN) antes de registrar o reenviar tickets, sustituyendo entidades por marcadores `[REDACTED_*]`.
- Defensa frente a prompt injection en asistentes expuestos: bloquea intentos de elusión de RBAC y de acceso a documentos fuera del blueprint autorizado, adecuado para portales de empleado o cliente.
- Despliegue multi-tenant económico: al ser un adaptador de ~95 MB sobre un base de 2B, permite servir múltiples inquilinos con adaptadores separados en vLLM sin duplicar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un base de 2B, la VRAM vendrá determinada por el modelo base y su cuantización, no por el adaptador (~95 MB).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; dependerá del base y de la cuantización elegida.
- Opciones de despliegue: PEFT y vLLM multi-tenant son las indicadas por el autor; otras opciones (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| citavyn-gemma4-2b-lora | Adaptador ~95 MB sobre base 2B | no disponible | RAG con citación y gobernanza IA | apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | 2B (según nomenclatura) | no disponible | Modelo conversacional general | no disponible en la informacion | Hugging Face |
| Alternativas de RAG con citación de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idioma: solo inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar google/gemma-4-E2B-it y aplicar el adaptador mediante PEFT o vLLM.
- Riesgo de alucinación reducido por diseño (abstención y citación estricta), pero no eliminado; la calidad depende de la recuperación y del formato XML de los documentos.
- El conocimiento regulatorio está limitado a las versiones citadas (EU AI Act con Anexo III, Artículo 5 y Artículo 27; NIST AI RMF 1.0; GDPR Artículos 5 y 17; ISO/IEC 42001:2023); cambios normativos posteriores no estarán cubiertos.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos de copyright y licencia de Gemma 4 E2B de Google; conviene revisar los términos del modelo base.
- Sin métricas publicadas de benchmarks ni de latencia: la validación en producción corre por cuenta del integrador.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/citavyn/citavyn-gemma4-2b-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
