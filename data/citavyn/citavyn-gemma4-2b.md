# citavyn/citavyn-gemma4-2b

## Resumen

citavyn-gemma4-2b es un derivado afinado por el desarrollador Citavyn a partir de `google/gemma-4-E2B-it`, orientado a flujos empresariales de generación aumentada por recuperación (RAG) y a tareas de gobernanza de IA y de datos. El ajuste se realizó mediante Supervised Fine-Tuning (SFT) con un adaptador LoRA de rango 16 y precisión BF16, que supone 24.158.208 parámetros entrenables, aproximadamente el 0,47 % del modelo base. El repositorio publica tanto el adaptador PEFT como pesos fusionados completos en `bfloat16` para servir con vLLM.

El modelo busca resolver dos problemas concretos del RAG corporativo: la atribución fiable de afirmaciones a los fragmentos recuperados, mediante citas en línea con el formato `[Doc X]` sobre documentos delimitados en XML, y la abstención cuando la evidencia recuperada es insuficiente, evitando extrapolar desde la memoria de preentrenamiento. Además, está alineado de forma instruccional sobre marcos regulatorios como el Reglamento Europeo de IA (Anexo III, artículo 5 y artículo 27 sobre FRIA), NIST AI RMF 1.0, el RGPD (artículos 5 y 17) e ISO/IEC 42001:2023.

El dato de parámetros totales en safetensors es de 5.123.178.051, aunque la nomenclatura del modelo y la model card hacen referencia a la variante E2B del modelo base. El repositorio ocupa 10,3 GB y está publicado con licencia Apache 2.0, manteniendo los avisos originales de Google Gemma. Está disponible únicamente en inglés y acumula 199 descargas desde su publicación en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de google/gemma-4-E2B-it (arquitectura del modelo base, no detallada en la informacion disponible) |
| Parametros totales | 5.123.178.051 (pesos en safetensors); parametros entrenables del adaptador LoRA: 24.158.208 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en bfloat16 (adaptador BF16 y pesos fusionados de 16 bits); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; adaptador LoRA compatible con PEFT y pesos fusionados completos bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` y se adapta mediante SFT con LoRA de rango 16 en precisión BF16, generando un adaptador de aproximadamente 95 MB que representa el 0,47 % de los parámetros del modelo base. El repositorio distribuye además los pesos fusionados completos en `bfloat16` pensados para despliegue en producción con vLLM, incluyendo escenarios multi-tenant. No se detalla en la información disponible la arquitectura interna del modelo base (tipo de atención, mecanismos lineales, decodificación especulativa u otras innovaciones), ni el volumen total de tokens de entrenamiento.

La model card no especifica la composición del dataset de ajuste: la sección de datos de entrenamiento queda como plantilla sin completar (fuentes, tamaño, proporción de datos sintéticos frente a públicos y tratamiento de PII). Tampoco se documenta el uso de RLHF o DPO; el método declarado es exclusivamente SFT. El entrenamiento se orienta a comportamientos instruccionales concretos: citación en línea sobre fragmentos XML, abstención limitada al contexto, cobertura regulatoria (EU AI Act, NIST AI RMF 1.0, RGPD, ISO/IEC 42001:2023) y patrones de redacción de PII y reconocimiento de inyección de prompts.

## Capacidades

- Generación de texto conversacional con pipeline `text-generation`.
- Citación en línea estricta con el formato `[Doc X]`, atribuyendo afirmaciones fácticas exclusivamente a fragmentos delimitados en `<documents>` e ignorando documentos distractores de alta similitud.
- Abstención limitada al contexto: rechaza extrapolar desde la memoria de preentrenamiento cuando los documentos recuperados no aportan evidencia suficiente.
- Cobertura instruccional de marcos regulatorios: EU AI Act (Anexo III, artículo 5, artículo 27 FRIA), NIST AI RMF 1.0 (GOVERN, MAP, MEASURE, MANAGE), RGPD (artículos 5 y 17), ISO/IEC 42001:2023 y aislamiento RBAC/Blueprint empresarial.
- Redacción de PII de nivel 4 con marcadores como `[REDACTED_SSN_1]` y `[REDACTED_PAN_1]`.
- Reconocimiento de intentos de inyección de prompts y de elusión de control de acceso.
- Capacidades multilingües: solo inglés declarado.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistente interno de cumplimiento normativo: el modelo responde preguntas sobre el EU AI Act, NIST AI RMF o RGPD citando los fragmentos concretos de la documentación recuperada con `[Doc X]`, lo que permite a los equipos de compliance verificar cada afirmación contra la fuente original.
- Auditoría de sistemas de IA de alto riesgo: dado un conjunto de documentos sobre clasificación del Anexo III y evaluaciones FRIA, el modelo genera borradores de análisis con atribución explícita y se abstiene cuando la documentación recuperada no cubre un requisito, reduciendo el riesgo de afirmaciones no respaldadas en informes regulatorios.
- Respuesta a solicitudes de derechos del interesado (RGPD, artículos 5 y 17): el modelo puede redactar respuestas borrador sobre minimización de datos y derecho al olvido citando las políticas internas recuperadas, con redacción previa de PII sensible mediante los patrones aprendidos.
- Enmascarado asistido de datos personales en pipelines DLP: como capa complementaria a guardarraíles deterministas, el modelo marca SSN y PAN con etiquetas `[REDACTED_*]` en texto libre antes de su almacenamiento o envío a terceros.
- Detección de inyección de prompts en aplicaciones RAG multi-tenant: el modelo reconoce intentos de elusión de control de acceso y puede emplearse como clasificador auxiliar en la fase de preprocesado de consultas de usuario.
- Generación de documentación de gobernanza de datos: borradores de políticas internas alineadas con ISO/IEC 42001:2023 y con los controles del NIST AI RMF, citando los documentos de referencia recuperados de la base documental corporativa.
- Despliegue multi-tenant con vLLM: los pesos fusionados en bfloat16 y el adaptador PEFT permiten servir el modelo por tenant o compartir base con adaptadores específicos, integrándose en arquitecturas RAG existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación sin completar (precisión de citas, tasa de abstención y recall de PII sobre un conjunto de validación), por lo que no existen cifras verificables de MMLU, HumanEval, GSM8K ni de métricas específicas de RAG o DLP.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los pesos safetensors suman 5.123.178.051 parámetros, lo que requiere aproximadamente 10,3 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, se recomienda un mínimo de 16 GB de VRAM para contexto moderado.
- El adaptador LoRA (unos 95 MB en BF16) puede cargarse sobre el modelo base, reduciendo el almacenamiento necesario si se reutiliza `google/gemma-4-E2B-it` ya desplegado.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 con 40-80 GB permiten servir el modelo con margen para contexto largo y concurrencia.
- Cabe en GPU de consumo con 16 GB o más en bfloat16; con cuantización a 8 bits o 4 bits (no documentada por el autor) cabría en GPUs de 8-12 GB, aunque requeriría conversión manual a GGUF o AWQ/GPTQ.
- Opciones de despliegue: el autor indica vLLM como destino principal (pesos fusionados bfloat16, listo para multi-tenant); el adaptador es compatible con PEFT, por lo que también puede cargarse con Transformers. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| citavyn/citavyn-gemma4-2b | 5.123.178.051 (safetensors); LoRA de 24,2 M entrenables | no disponible | apache-2.0 | RAG empresarial y gobernanza de IA/datos | Hugging Face, pesos bfloat16 y adaptador PEFT |
| google/gemma-4-E2B-it | no disponible en la informacion | no disponible | licencia Gemma (modelo base) | Modelo instructivo generalista | Hugging Face |
| Alternativas de la misma categoria (modelos pequenos afinados para RAG) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Los comportamientos aprendidos (citación, abstención, redacción de PII, bloqueo de inyección) no son garantías duras: el autor indica explícitamente que deben complementarse con guardarraíles deterministas de DLP y control de acceso.
- El presupuesto efectivo de parámetros de la variante E2B limita el recuerdo literal de textos legales, por lo que no es fiable para reproducir verbatim artículos o cláusulas regulatorias.
- No debe usarse como certificación de cumplimiento ni como control de seguridad autónomo.
- Riesgo de alucinación inherente a los modelos generativos; la abstención aprendida mitiga pero no elimina la posibilidad de afirmaciones no respaldadas por los documentos.
- Idioma limitado al inglés: no se declara soporte de castellano ni de otras lenguas, lo que restringe su uso en entornos regulatorios hispanohablantes sin evaluación adicional.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Gemma, puede heredar sesgos del modelo base no evaluados por el autor.
- La model card no documenta el dataset de entrenamiento ni el tratamiento de PII durante el ajuste, lo que dificulta evaluar riesgos de contaminación o memorización.
- La licencia Apache 2.0 se declara en el repositorio, pero se mantienen los avisos originales de Google Gemma; conviene verificar la compatibilidad de los términos del modelo base con el uso comercial previsto.
- El número de parámetros en safetensors (5,12 mil millones) no coincide con la nomenclatura "2b" ni con la variante E2B del modelo base, lo que puede generar confusión sobre el tamaño real en producción; conviene validar el artefacto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/citavyn/citavyn-gemma4-2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
