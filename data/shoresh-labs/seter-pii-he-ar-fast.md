# shoresh-labs/seter-pii-he-ar-fast

## Resumen

Seter PII Fast es un modelo de clasificación de tokens (token-classification) especializado en la detección de datos personales identificables (PII) en hebreo, árabe e inglés, incluyendo textos mixtos que combinan hebreo o árabe con inglés. Lo desarrolla Shoresh Labs y se distribuye bajo licencia MIT. Resuelve un problema concreto: los detectores de PII gratuitos disponibles funcionan bien en inglés pero fallan de forma sistemática con nombres propios en hebreo y árabe, especialmente nombres de pila aislados, nombres con prefijos adjuntos (ל/ו/ש), títulos (עו"ד, د.) y kunyas árabes (أبو …).

El modelo se construye sobre `jhu-clsp/mmBERT-base`, un encoder de 308 millones de parámetros, y se ofrece como la variante "fast" de la familia Seter: aproximadamente 2,3 veces más rápida en CPU que la variante precisa (`seter-pii-he-ar`, basada en xlm-roberta-large de 559M) y con una ventana de contexto de 8k tokens, lo que la hace adecuada para documentos largos y procesamiento de alto volumen en infraestructura sin GPU.

La relevancia actual del modelo está en su alineación de etiquetas con `openai/privacy-filter` (`private_person`, `private_address`, `private_phone`, `private_email`, `account_number`), lo que permite sustituirlo directamente en pipelines ya construidos alrededor de ese detector. Además, se ha evaluado de forma independiente sobre el benchmark REDACT en sus subconjuntos de hebreo, árabe e inglés, con mejoras sustanciales de F1 frente a `openai/privacy-filter`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.538.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8k tokens |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se detallan cuantizaciones oficiales) |
| Idiomas soportados | he (hebreo), ar (árabe), en (inglés); también textos mixtos hebreo/árabe-inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT sobre la base `jhu-clsp/mmBERT-base` (308M parámetros), adaptado a una tarea de token-classification con cinco etiquetas de PII: `private_person`, `private_address`, `private_phone`, `private_email` y `account_number`. La variante "fast" se entrena con 3 épocas, learning rate de 5e-5, sobre aproximadamente 12.600 frases **completamente sintéticas**: nombres inventados, identificadores (con checksums válidos de ID israelí), teléfonos, IBANs, correos y direcciones. Alrededor del 33 % de las frases no contienen PII (organizaciones, ciudades, organismos públicos, nombres usados como palabras comunes, fechas, horas, números de pedido, precios, IPs y URLs), lo que actúa como entrenamiento negativo para reducir falsos positivos.

No se utilizaron datos personales reales en el entrenamiento. La variante precisa de la familia (`seter-pii-he-ar`) usa la misma receta sobre `FacebookAI/xlm-roberta-large` con learning rate 2e-5. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa; se trata de un encoder discriminativo, no generativo.

## Capacidades

- Detección de PII a nivel de carácter (detección no tipada con etiquetas de grupo) en hebreo, árabe e inglés.
- Reconocimiento de nombres de persona, incluyendo nombres de pila aislados, nombres con prefijos adjuntos (ל/ו/ש), títulos (עו"ד, د.) y kunyas árabes (أبو …).
- Detección de direcciones, teléfonos, correos electrónicos y números de cuenta (incluidos ID israelíes, pasaportes y cuentas bancarias, todos bajo `account_number`).
- Manejo de mensajes mixtos hebreo/árabe-inglés en un mismo texto.
- Contexto de 8k tokens, apto para documentos largos.
- Compatibilidad de etiquetas con `openai/privacy-filter`, lo que permite sustitución directa en pipelines existentes.
- No cubre fechas, URLs, secretos, ciudades, organizaciones ni organismos públicos de forma intencionada.
- No dispone de tool calling, function calling, capacidades de agente ni modo de razonamiento (es un modelo de clasificación, no generativo).

## Casos de uso

- **Redacción de PII en atención al cliente**: procesar transcripciones de chats y correos multi-turno en hebreo y árabe antes de almacenarlos o enviarlos a sistemas de analítica, aprovechando el contexto de 8k tokens para documentos largos.
- **Cumplimiento y privacidad en CRM**: sustituir `openai/privacy-filter` en pipelines existentes sin reescribir el código, ya que comparte los nombres de etiqueta, y mejorar la cobertura de nombres propios en hebreo y árabe.
- **Anonimización de corpus para investigación**: preprocesar datasets de texto en hebreo y árabe para entrenamiento o publicación, eliminando nombres, teléfonos, correos y números de cuenta con revisión humana posterior.
- **Procesamiento por lotes en CPU**: al ser aproximadamente 2,3 veces más rápido que la variante precisa (unos 221 ms por registro REDACT con 6 hilos), es adecuado para volúmenes altos en servidores sin GPU.
- **Filtrado previo en pipelines de moderación**: detectar y enmascarar datos personales en mensajes de usuario antes de pasarlos a modelos generativos o a sistemas de registro.
- **Gestión documental en ámbitos legales y de RR. HH.**: marcar PII en expedientes y comunicaciones internas en hebreo/árabe para su revisión, con la advertencia de que no sustituye una certificación de cumplimiento.
- **Despliegue en entornos con requisitos de privacidad**: al no requerir GPU y distribuirse en ONNX y safetensors, puede ejecutarse en infraestructura local controlada.

## Benchmarks y rendimiento

Detección a nivel de carácter, no tipada. "Entidades capturadas" = entidad gold solapada por cualquier predicción.

| Conjunto de prueba | Sistema | Entidades capturadas | Caracteres de persona capturados | Spans falsos positivos |
|---|---|---|---|---|
| hard1 — 43 mensajes escritos a mano | openai/privacy-filter | 43 % | 28 % | 3 |
| | seter-pii-he-ar | 100 % | 97 % | 3 |
| hard2 — 40 mensajes escritos a mano | openai/privacy-filter | 47 % | 27 % | 1 |
| | seter-pii-he-ar | 98 % | 96 % | 1 |
| Inglés — 300 registros de ai4privacy/pii-masking-400k | openai/privacy-filter | 95 % | 92 % | — |
| | seter-pii-he-ar | 100 % | 99,9 % | — |

Benchmark independiente REDACT (subconjuntos hebreo, árabe e inglés; solo evaluación):

| Idioma | openai/privacy-filter F1 | seter-pii-he-ar (xlm-r-large) F1 | seter-pii-he-ar-fast (mmBERT-base) F1 |
|---|---|---|---|
| Hebreo (621 registros) | 0,63 | 0,87 | 0,84 |
| Árabe (568) | 0,72 | 0,89 | 0,88 |
| Inglés (534) | 0,70 | 0,84 | 0,83 |

Nombres capturados en REDACT hebreo: 40 % (openai/privacy-filter) frente a 99,5 % (seter-pii-he-ar) y 98,9 % (seter-pii-he-ar-fast). Los números de identificación (pasaporte, licencia, fiscal, tarjeta) se capturan con más frecuencia que con openai/privacy-filter en los tres idiomas.

Tiempo de CPU por registro REDACT (6 hilos): ~221 ms para la variante fast frente a ~506 ms para la variante precisa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 308M parámetros en fp32 los pesos ocupan aproximadamente 1,2 GB, y en fp16 alrededor de 0,6 GB, más el overhead de activaciones.
- GPU recomendadas: no se especifican; al ser un encoder de 308M, cualquier GPU consumer moderna (por ejemplo RTX 3060 en adelante) es suficiente. El modelo está optimizado para CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado su tamaño.
- Opciones de despliegue: `transformers` pipeline de token-classification (ejemplo oficial con `aggregation_strategy="simple"`), y formato ONNX para inferencia optimizada; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder de clasificación).
- Latencia y throughput: ~221 ms por registro REDACT con 6 hilos en CPU para la variante fast; ~506 ms para la variante precisa.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | F1 hebreo (REDACT) | F1 árabe (REDACT) | F1 inglés (REDACT) | Licencia |
|---|---|---|---|---|---|---|---|
| seter-pii-he-ar-fast | jhu-clsp/mmBERT-base | 308M | 8k | 0,84 | 0,88 | 0,83 | MIT |
| seter-pii-he-ar | xlm-roberta-large | 559M | no disponible | 0,87 | 0,89 | 0,84 | MIT |
| openai/privacy-filter | no disponible | no disponible | no disponible | 0,63 | 0,72 | 0,70 | no disponible |

La variante fast sacrifica entre 1 y 3 puntos de F1 frente a la variante precisa a cambio de aproximadamente la mitad del tiempo de inferencia en CPU y una mayor ventana de contexto (8k). Frente a `openai/privacy-filter`, la mejora es de 13 a 21 puntos de F1 en los tres idiomas evaluados.

## Limitaciones y advertencias

- Es una **ayuda a la redacción**, no una garantía de anonimización ni una certificación de cumplimiento; se recomienda revisión humana en datos legales, médicos, financieros y de RR. HH.
- Los conjuntos de prueba escritos a mano son pequeños y fueron redactados por el mismo autor que las plantillas de entrenamiento; cabe esperar menor precisión en datos reales.
- Ciudades, organizaciones y organismos públicos no se etiquetan de forma intencionada; fechas, URLs y secretos no están cubiertos (para ello se sugiere `openai/privacy-filter`).
- Los ID israelíes, pasaportes y cuentas bancarias se agrupan todos bajo `account_number`, sin distinción de tipo.
- Palabras de parentesco con prefijos adjuntos (por ejemplo לאבא, "a papá") pueden marcarse erróneamente como nombres.
- Se debe usar `aggregation_strategy="simple"`; los nombres árabes de varias palabras (أبو خالد) pueden devolverse como dos spans `private_person` adyacentes que conviene fusionar.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la detección.
- Sesgos conocidos: el entrenamiento es totalmente sintético, lo que puede no reflejar la distribución real de nombres y formatos en cada comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoresh-labs/seter-pii-he-ar-fast
- Variante precisa: https://huggingface.co/shoresh-labs/seter-pii-he-ar
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Detector de referencia con etiquetas compatibles: https://huggingface.co/openai/privacy-filter
- Demo: https://huggingface.co/spaces/yinonov/seter-demo
- Benchmark REDACT (paper): https://arxiv.org/abs/2606.19881
- Organización Shoresh Labs: https://huggingface.co/shoresh-labs
