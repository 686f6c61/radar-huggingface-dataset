# citavyn/citavyn-gemma4-2b

## Resumen

citavyn-gemma4-2b es un derivado afinado mediante Supervised Fine-Tuning (SFT) del modelo google/gemma-4-E2B-it, desarrollado por el usuario citavyn. Su objetivo es especializar un modelo base de proposito general en flujos empresariales de Retrieval-Augmented Generation (RAG) y gobernanza de IA y datos, con enfasis en el cumplimiento normativo (EU AI Act, NIST AI RMF 1.0, GDPR, ISO/IEC 42001:2023) y en el control de acceso basado en roles (RBAC).

El modelo se distribuye como pesos completos fusionados en bfloat16 (16 bits), pensado para servir en produccion con vLLM. Segun los datos de safetensors del repositorio, el checkpoint contiene 5.123.178.051 parametros, aunque la nomenclatura comercial del autor lo denomina "2b" por referencia a la variante E2B del modelo base. El repositorio ocupa 10,3 GB.

La propuesta de valor se centra en tres comportamientos inducidos por el afinado: citacion en linea estricta mediante etiquetas `[Doc X]` restringidas a fragmentos XML delimitados en `<documents>`, abstencion acotada al contexto cuando la evidencia recuperada es insuficiente, y aplicacion de tecnicas de DLP con enmascaramiento de PII de nivel 4 y bloqueo de intentos de prompt injection. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de google/gemma-4-E2B-it (no se detalla la configuracion interna en la informacion disponible) |
| Parametros totales | 5.123.178.051 (5,12 mil millones, segun safetensors) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en bfloat16 (16 bits); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados completos en bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it y se ha afinado mediante Supervised Fine-Tuning (SFT), sin que la model card especifique el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas adicionales como RLHF o DPO. El resultado se publica como pesos completos fusionados en bfloat16, un formato orientado a servir el modelo en produccion con vLLM y a preservar la fidelidad numerica del ajuste.

El entrenamiento esta orientado a inducir comportamientos de gobernanza: atribucion de afirmaciones factuales exclusivamente a fragmentos delimitados en `<documents>`, ignorando documentos distractores de alta similitud; rechazo a extrapolar desde la memoria de preentrenamiento cuando los documentos recuperados no contienen evidencia suficiente; alineacion sobre dominios regulatorios concretos (EU AI Act, incluidos Anexo III, Articulo 5 y Article 27 FRIA; NIST AI RMF 1.0 con las funciones GOVERN, MAP, MEASURE y MANAGE; GDPR, articulos 5 y 17; ISO/IEC 42001:2023; y aislamiento RBAC/Blueprint empresarial); y politicas de DLP que enmascaran PII de nivel 4 con marcadores como `[REDACTED_SSN_1]` o `[REDACTED_PAN_1]` y bloquean intentos de prompt injection o bypass de acceso no autorizado.

## Capacidades

- Generacion de texto conversacional en ingles con pipeline de text-generation.
- RAG con citacion en linea estricta: las afirmaciones se atribuyen a fragmentos concretos mediante etiquetas `[Doc X]`, restringidas a los documentos delimitados en `<documents>`.
- Resistencia a documentos distractores: ignora fragmentos de alta similitud que no respaldan la respuesta.
- Abstencion acotada al contexto: rechaza responder cuando la evidencia recuperada es insuficiente, en lugar de recurrir a la memoria de preentrenamiento.
- Cobertura de dominio regulatorio: EU AI Act (Anexo III, Articulo 5, Article 27 FRIA), NIST AI RMF 1.0 (GOVERN, MAP, MEASURE, MANAGE), GDPR (articulos 5 y 17) e ISO/IEC 42001:2023.
- Aplicacion de RBAC y aislamiento por blueprint empresarial.
- DLP y seguridad: enmascaramiento de PII de nivel 4 y bloqueo de prompt injection y de intentos de bypass de acceso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales, de audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de cumplimiento normativo con RAG: el modelo responde consultas sobre EU AI Act, NIST AI RMF, GDPR o ISO/IEC 42001 citando el fragmento exacto del corpus documental mediante `[Doc X]`, lo que permite auditar la trazabilidad de cada afirmacion.
- Revision de evaluaciones de impacto (FRIA): dado un conjunto de documentos del sistema de IA, el modelo genera analisis del Article 27 citando las secciones relevantes y absteniendose cuando falta evidencia documental.
- Atencion al cliente con base documental controlada: en escenarios donde la respuesta debe provenir exclusivamente de la documentacion oficial, la abstencion acotada al contexto evita respuestas inventadas ante consultas fuera de cobertura.
- Enmascaramiento de datos personales en pipelines de ingesta: el modelo aplica DLP de nivel 4 sustituyendo SSN y PAN por marcadores `[REDACTED_*]` antes de persistir o registrar contenido.
- Guardrail conversacional frente a prompt injection: se puede desplegar como capa previa o posterior en un pipeline RAG para bloquear intentos de bypass de acceso o inyeccion de instrucciones.
- Asistente interno con aislamiento RBAC: en entornos empresariales con multiples unidades de negocio, el modelo respeta el aislamiento por blueprint y restringe las respuestas al conjunto documental autorizado para el rol del usuario.
- Generacion de informes de gobernanza de datos: a partir de politicas y registros de tratamiento, el modelo produce resumenes con citas verificables para revisiones internas o auditorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10,3 GB solo para pesos (5,12 mil millones de parametros × 2 bytes), mas memoria para cache KV y overhead del runtime; en la practica, se recomienda reservar al menos 16 GB.
- Cuantizaciones inferiores a 16 bits (GGUF, AWQ, GPTQ) no estan documentadas por el autor; el checkpoint publicado es bfloat16 fusionado.
- GPU de centro de datos recomendadas: A100 (40/80 GB) o H100 para servir con vLLM y aprovechar el formato bfloat16 nativo.
- GPU de consumo: por tamano de pesos, es viable en tarjetas con 16-24 GB de VRAM (RTX 4090, RTX 4080, A5000), siempre que se valide el soporte del modelo base en el runtime elegido.
- Opciones de despliegue: vLLM es el objetivo declarado por el autor; no se confirman otros runtimes (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| citavyn/citavyn-gemma4-2b | 5,12 mil millones | No disponible | Apache 2.0 | RAG empresarial y gobernanza de IA | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it | No disponible en la informacion | No disponible | No disponible en la informacion | Modelo base de proposito general | Hugging Face (modelo base referenciado) |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo esta afinado y evaluado unicamente en ingles; no se documenta soporte multilingue, lo que limita su uso en entornos en castellano.
- Al ser un afinado SFT de un modelo base pequeno, puede heredar sesgos y errores factuales del modelo original; no se documentan evaluaciones de sesgo.
- Aunque el entrenamiento busca reducir la extrapolacion, persiste el riesgo de alucinacion fuera de los casos cubiertos por el ajuste.
- La longitud de contexto no esta documentada; el rendimiento en escenarios RAG con muchos documentos depende del limite efectivo del modelo base.
- La model card no detalla el dataset de entrenamiento ni el proceso de evaluacion, por lo que la eficacia de las garantias de citacion y abstencion no esta cuantificada publicamente.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso en produccion.
- La licencia Apache 2.0 preserva los avisos de copyright originales de Google; conviene revisar los terminos del modelo base Gemma 4 E2B antes de un despliegue comercial.
- El sufijo "2b" del nombre comercial no coincide con el recuento real de parametros (5,12 mil millones), lo que puede inducir a error al planificar recursos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/citavyn/citavyn-gemma4-2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
