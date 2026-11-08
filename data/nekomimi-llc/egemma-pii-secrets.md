# nekomimi-llc/egemma-pii-secrets

## Resumen

`egemma-pii-secrets` es un modelo de clasificación de tokens (span tagging) especializado en detectar datos personales y secretos (credenciales, claves, contraseñas, cadenas de conexión) dentro de texto libre, con el objetivo de poder redactarlos antes de compartirlo. Lo desarrolla nekomimi-llc (Ana, @okami.mom, con asistencia de un agente Claude Opus 5.5) y se publica bajo licencia Apache-2.0. El caso de uso declarado es la exportación segura de transcripciones de agentes y logs para post-entrenamiento: el modelo actúa como capa intermedia entre reglas regex y una revisión humana o de un LLM revisor.

Técnicamente es un fine-tune de la mitad textual de `google/embeddinggemma-2`, sin la torre de visión. Para cada token predice una de 27 etiquetas: `O` o el inicio `B-`/interior `I-` de 13 clases (PERSON, EMAIL, PHONE, ADDRESS, GOV_ID, FINANCIAL, DATE_OF_BIRTH, IP_ADDRESS, SENSITIVE, SECRET_TOKEN, SECRET_PASSWORD, SECRET_CONNECTION, SECRET_PRIVATE_KEY). El repositorio ocupa 1,4 GB e incluye pesos en safetensors y ONNX, lo que permite ejecución local en CPU, CUDA y Apple Metal.

Su relevancia actual radica en que aborda un problema operativo real de los pipelines de agentes: la fuga accidental de credenciales y PII en trazas exportadas. No es un modelo de propósito general, sino un componente de una cadena de redacción (reglas → modelo → coincidencia exacta → revisor → previsualización aprobada por el usuario), y su model card es explícita sobre sus límites y tasas de fallo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mitad textual de google/embeddinggemma-2), cabeza de token classification |
| Parametros totales | no disponible (repo de 1,4 GB, incluye safetensors y ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen safetensors y ONNX; el modelo base está referenciado como `base_model:quantized:google/embeddinggemma-2`) |
| Idiomas soportados | en, fr, de, es, it, nl, sv (centrado en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de texto de `google/embeddinggemma-2` y le añade una cabeza de clasificación de tokens con 27 etiquetas (esquema BIO sobre 13 clases). No se emplea la torre de visión del modelo base. El fine-tune se hizo en bf16 con AdamW, con una tasa de aprendizaje de la cabeza 10 veces superior a la del encoder, en tres etapas: (1) 0,6 épocas desde el modelo base con lr 1e-4 y batch 32; (2) 0,4 épocas con lr 2e-5 añadiendo un término de destilación por conocimiento KL(teacher ‖ student) contra el modelo de la etapa uno, para evitar olvido catastrófico al introducir nuevos datos; (3) 0,4 épocas con la misma técnica, usando como teacher el modelo de la etapa dos y añadiendo "look-alikes" escritos por LLM (cadenas con forma de secreto que no lo son).

Los datos de entrenamiento combinan varios datasets públicos: nvidia/Nemotron-PII, gretelai/gretel-pii-masking-en-v1, gretelai/synthetic_pii_finance_multilingual, urchade/synthetic-pii-ner-mistral-v1, ildpil/text-anonymization-benchmark, beki/privy, apartejs/aparte-secrets-data, nyuuzyou/gliner2.5-PII-code-en-data y un dataset sintético propio (nekomimi-llc/egemma-pii-secrets-synthetic). Buena parte del corpus es generado o escrito por LLM, lo que el autor señala como limitación. Las reglas regex, el decodificador base64 y el veto de formas públicas no forman parte de los pesos: viven en `trace_rules.py`.

## Capacidades

- Detección de PII: personas, emails, teléfonos, direcciones, identificadores gubernamentales, datos financieros, fechas de nacimiento e IPs.
- Detección de secretos: tokens de API, contraseñas, cadenas de conexión y claves privadas.
- Etiquetado a nivel de token con esquema BIO, apto para extracción de spans y redacción selectiva.
- Integración con reglas externas (`trace_rules.py`): regex para IPs, usuarios en rutas, campos de credenciales, URLs de base de datos y prefijos de claves conocidas.
- Decodificación base64 para inspeccionar texto codificado en busca de secretos.
- Veto de formas demostrablemente públicas (data URIs, claves públicas, digests) para reducir sobre-redacción.
- Ejecución local en CPU, CUDA y Apple Metal; exportación ONNX.
- Capacidad multilingüe limitada: inglés como idioma principal, con presencia de francés, alemán, español, italiano, neerlandés y sueco en los datos.
- No soporta tool calling, agentes ni generación de texto: es un clasificador, no un modelo generativo.

## Casos de uso

- Exportación segura de transcripciones de agentes: antes de publicar o reutilizar trazas de un agente para post-entrenamiento, se pasa el texto por reglas, el modelo, una coincidencia exacta contra secretos conocidos por el harness y una revisión final; el modelo propone los spans a redactar.
- Saneamiento de logs y salidas de herramientas: los logs de aplicaciones suelen contener IPs, rutas con nombres de usuario y cadenas de conexión; el modelo etiqueta estos spans para sustituirlos por marcadores antes de enviarlos a un sistema de observabilidad externo.
- Revisión de ficheros de configuración: detección de contraseñas, tokens y claves privadas embebidas en YAML, `.env` o similares, con el veto de claves públicas para no romper configuraciones legítimas.
- Tickets de soporte y chats: redacción de PII de clientes (nombres, emails, teléfonos, direcciones, identificadores) antes de compartir conversaciones con terceros o incorporarlas a datasets.
- Redacción de capturas de pantalla (planificado por el autor): ejecutar el modelo sobre texto OCR y volver a renderizar o recuadrar las palabras marcadas en la imagen.
- Cumplimiento y auditoría interna: como capa de ayuda en procesos de minimización de datos, con revisión humana obligatoria; el autor advierte explícitamente que no constituye certificación GDPR, HIPAA ni PCI.
- Filtro previo en pipelines de CI/CD: comprobar artefactos, diffs y ficheros de salida en busca de credenciales antes de publicarlos, usando el modelo junto con las reglas y un umbral conservador.

## Benchmarks y rendimiento

La model card reporta métricas propias sobre dos conjuntos, no benchmarks estándar de la literatura:

| Conjunto | Metrica | Resultado |
|---|---|---|
| RedactionBench (formularios, logs y ficheros reales) | Cobertura completa de spans obligatorios, solo modelo | 69% |
| CredDetX (test) | Falsos positivos sobre look-alikes etiquetados, modelo + veto de reglas | 16% |
| CredDetX (test) | Falsos positivos sobre look-alikes etiquetados, reglas completas | 20% (en parte por diseño) |
| CredDetX (dev) | Secretos reales con puntuación < 0,1 | 123 de 803 |
| CredDetX (dev) | Look-alikes con puntuación ≥ 0,99 | 167 de 1.648 |
| CredDetX (dev) | Secretos completamente cubiertos con umbral 0,9 | 552 (frente a 630 sin umbral) |
| CredDetX (dev) | Look-alikes marcados con umbral 0,9 | 305 (frente a 503 sin umbral) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras exactas; el modelo está descrito como "suficientemente pequeño para ejecutarse en la CPU o GPU de un portátil", y el repo completo pesa 1,4 GB (incluye safetensors y ONNX).
- GPU recomendadas: no se especifican; el autor indica ejecución en CUDA y Apple Metal, además de CPU.
- Cabe en GPU de consumo: sí, según la model card (portátil con CPU o GPU); no se detalla qué modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: `transformers` (librería declarada), exportación ONNX; `endpoints_compatible` según los tags de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| egemma-pii-secrets | Token classification (encoder Gemma) | en, fr, de, es, it, nl, sv | Apache-2.0 | Específico para PII + secretos, con reglas externas y veto |
| Microsoft Presidio (modelos NLP subyacentes) | Pipeline de detección + reconocedores regex | multilingüe | MIT (herramienta) | Framework de anonimización; los modelos NER son componentes separables |
| GLiNER (variantes PII) | NER zero-shot basado en encoder | multilingüe | según variante | Referenciado como fuente de datos (`nyuuzyou/gliner2.5-PII-code-en-data`) |
| Modelos NER genéricos (spaCy, XLM-R) | NER supervisado | multilingüe | MIT / Apache-2.0 | Detectan entidades, no secretos ni credenciales |

La información disponible no incluye comparaciones de rendimiento directas entre estos sistemas; los datos de la tabla anterior son descriptivos y no métricas enfrentadas.

## Limitaciones y advertencias

- Se producen omisiones: contraseñas escritas como palabras o frases ordinarias, valores de prueba muy cortos (`"k"`), secretos en contextos inusuales y, a veces, solo parte de un nombre (en "Jane Doe" puede etiquetarse solo "Jane"). Los spans de secreto se ensanchan al token completo para mitigar omisiones parciales.
- Sobre-redacción: en CredDetX, con el veto de las reglas, se marcan erróneamente el 16% de los look-alikes etiquetados; con las reglas completas, el 20% (en parte por política: placeholders en campos de credenciales y URLs de base de datos se redactan a propósito).
- Las puntuaciones de confianza no son fiables para umbralizar: son bimodales y pueden estar muy equivocadas en ambos sentidos. Subir el umbral pierde secretos reales casi a la misma velocidad con la que elimina falsos positivos.
- Documentos largos y formularios son el punto más débil: el modelo solo cubre el 69% de los spans obligatorios en RedactionBench; la mayoría de fallos son fragmentos de 1–5 caracteres (octetos de IP y partes de fechas, que las reglas cubren en la práctica), pero también nombres con capitalización inusual y detalles cortos de localización en formularios.
- Datos mayoritariamente sintéticos: el rendimiento en texto real debe validarse con datos propios.
- Idioma: centrado en inglés; cobertura parcial de francés, alemán, español, italiano, neerlandés y sueco. El texto mayoritariamente no inglés queda fuera de alcance.
- Decisiones de política embebidas: los placeholders en campos de credenciales se tratan como secretos; fechas, edades, URLs sin credenciales e identificadores de cliente/empleado/dispositivo no se etiquetan; las organizaciones no se etiquetan.
- Las reglas no están en los pesos: IPs, usuarios en rutas, decodificación base64 y veto viven en `trace_rules.py`; usar solo los pesos pierde esa capa.
- No es una garantía sin supervisión ni una certificación de cumplimiento (GDPR, HIPAA, PCI); requiere revisión humana o de un LLM revisor antes de publicar la salida.
- Fuera de alcance: imágenes, audio, datos binarios/cifrados/comprimidos; blobs base64 opacos se listan para revisión por las reglas, no los decodifica el modelo.
- Uso prohibido por el autor: buscar credenciales en datos de terceros para utilizarlas; es un detector para proteger datos propios antes de compartirlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nekomimi-llc/egemma-pii-secrets
- Organización nekomimi-llc: https://huggingface.co/nekomimi-llc
- Modelos de la organización: https://huggingface.co/nekomimi-llc/models
- albedo (uso downstream planificado de `/trace`): https://albedo.sh
- Modelo base: https://huggingface.co/google/embeddinggemma-2
