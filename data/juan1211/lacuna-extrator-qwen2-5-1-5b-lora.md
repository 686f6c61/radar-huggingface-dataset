# juan1211/lacuna-extrator-qwen2.5-1.5b-lora

## Resumen

Lacuna-extrator-qwen2.5-1.5b-lora es un adaptador LoRA (entrenado con QLoRA) sobre el modelo instructivo Qwen2.5-1.5B-Instruct, publicado por el usuario juan1211. Su función es muy concreta: leer extractos de contratos publicados en diarios oficiales municipales de Brasil y devolver un JSON estructurado con tipo de acto, número de contrato, proceso, contratada, CNPJ, objeto, valor y fecha de firma. Forma parte del proyecto Lacuna, que cruza estos extractos con los contratos registrados en el portal PNCP (Portal Nacional de Contrataciones Públicas).

El modelo no es un modelo generalista: es un ajuste fino especializado en extracción de información con salida estructurada en portugués. La motivación declarada por el autor es medir cuánto se acerca un modelo pequeño (1.500 millones de parámetros) ajustado con pocos ejemplos y ejecutado en local, de forma gratuita, a un modelo grande vía API (Claude Opus 5.5), que el proyecto usaba previamente a un coste de 0,014 dólares por documento.

La relevancia actual es doble: por un lado, demuestra que con 289 ejemplos y 17,7 minutos de entrenamiento en una GPU T4 se puede superar a un extractor basado en expresiones regulares en la mayoría de campos; por otro, ilustra los riesgos de este tipo de ajustes (rótulos generados por un LLM sin revisión manual, conjunto de evaluación pequeño y solapamiento entre municipios de entrenamiento y prueba).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | QLoRA con base en NF4 y cálculo en fp16; el adaptador se distribuye en safetensors |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El ajuste se realizó con QLoRA: el modelo base se cargó cuantizado en NF4 con cálculo en fp16, y se entrenaron adaptadores LoRA con r=16, alpha=32 y dropout de 0,05 en todas las proyecciones de atención y de las capas MLP. El entrenamiento se ejecutó en una GPU T4 de Google Colab durante 3 épocas, con tasa de aprendizaje 2e-4 y scheduler coseno, batch efectivo de 16 y función de pérdida aplicada únicamente sobre la respuesta. Duró 17,7 minutos y terminó con una pérdida de 0,008. Las versiones empleadas fueron torch 2.11, transformers 5.21, peft 0.21.2, trl 1.17.1 y bitsandbytes 0.50.2.

Los datos de entrenamiento son 289 fragmentos de extractos procedentes de 13 municipios del estado de Río de Janeiro, extraídos de diarios indexados por Querido Diário entre 2025 y 2026: 257 contratos, 19 contrataciones temporales de personal y 13 fragmentos que no son extractos de contrato (términos aditivos, términos de colaboración y similares). Los rótulos fueron generados por un LLM (Claude) sin revisión manual, de modo que el adaptador aprende a imitar esos rótulos, incluidos sus errores. Se excluyeron del entrenamiento 9 fragmentos ambiguos y 2 que coincidían con el conjunto de referencia. El prompt de sistema utilizado es el `LOCAL_PROMPT` del proyecto Lacuna, que combina el prompt del extractor vía API con el esquema JSON del objeto `Ato`; con otro prompt el resultado cambia.

## Capacidades

- Extracción de información estructurada: convierte texto libre de extractos de contrato en un JSON con los campos tipo, número de contrato, proceso, contratada, CNPJ, objeto, valor y fecha de firma.
- Salida ceñida a un esquema JSON: con el adaptador, las 100 respuestas evaluadas respetaron el formato JSON; sin ajuste, el modelo base devolvía JSON fuera de esquema en 58 de 60 fragmentos.
- Generación de texto conversacional (heredada del modelo base instructivo).
- Comprensión de texto en portugués, específicamente en el registro administrativo de diarios oficiales municipales.
- Clasificación implícita del tipo de acto (contrato, contratación temporal, término aditivo, término de colaboración, etc.).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento en la información disponible.

## Casos de uso

- Extracción automatizada de contratos municipales: el modelo lee un extracto publicado en un diario oficial y devuelve un JSON listo para insertar en una base de datos, sustituyendo o complementando un extractor por expresiones regulares.
- Cruce con el PNCP: los campos extraídos (número de contrato, CNPJ, valor, fecha) permiten emparejar cada extracto con su contrato registrado en el portal federal y detectar extractos sin par, lo que indica que la información no llegó al portal.
- Auditoría y transparencia pública: procesar lotes de diarios municipales para construir series temporales de contratación por proveedor, objeto y valor, con coste marginal nulo frente a una API comercial.
- Procesamiento en local y sin conexión: al caber en una GPU T4 con cuantización de 4 bits, puede desplegarse en infraestructura propia o en un portátil con GPU, sin enviar documentos públicos a servicios externos.
- Evaluación comparativa de extractores: sirve como referencia para medir la distancia entre un modelo pequeño ajustado y un modelo grande vía API en una tarea de extracción concreta.
- Prototipado rápido de pipelines de extracción: con 289 ejemplos y menos de 20 minutos de entrenamiento se puede replicar el enfoque para otros tipos de documentos administrativos, siempre que se disponga de etiquetas.
- Filtrado previo en un pipeline híbrido: usar el modelo para descartar o clasificar fragmentos que no son extractos de contrato antes de aplicar un extractor más costoso.

## Benchmarks y rendimiento

F1 por campo en el conjunto de referencia del proyecto Lacuna (60 fragmentos de prueba con etiquetas revisadas a mano). Objeto y nombre se consideran acierto con solapamiento de tokens a partir de 0,5 y 0,8 respectivamente; el valor se compara con redondeo a céntimos.

| Campo | Qwen2.5-1.5B sin ajuste | Este modelo | Regex |
|---|---:|---:|---:|
| tipo | 0,07 | 0,98 | 0,93 |
| número do contrato | 0,07 | 0,93 | 0,78 |
| processo | 0,04 | 0,97 | 0,82 |
| nome da contratada | 0,03 | 0,93 | 0,80 |
| CNPJ da contratada | 0,12 | 1,00 | 0,86 |
| objeto | 0,07 | 0,97 | 0,95 |
| valor | 0,07 | 0,99 | 0,91 |
| data de assinatura | 0,04 | 0,92 | 0,70 |

Las columnas del modelo se midieron en una T4 de Colab con la base en 4 bits, igual que en el entrenamiento. Sin ajuste, el modelo base devolvió JSON fuera de esquema en 58 de los 60 fragmentos, contabilizados como error bajo la misma regla que los demás extractores. Con el adaptador, ninguna de las 100 respuestas salió del JSON y la latencia fue de 18 segundos por fragmento (p95 de 28 segundos).

En el conjunto de desarrollo (40 fragmentos), este modelo obtuvo F1 de 0,88 en fecha, 0,86 en nombre y 0,91 en número de contrato. Claude Opus 5.5 vía API obtuvo 0,96, 0,91 y 0,89 respectivamente, a 0,014 dólares por documento, medido antes de la anonimización de los datos.

## Requisitos de hardware

- VRAM estimada: el modelo base en fp16 ocupa aproximadamente 3 GB; en cuantización de 4 bits (NF4), alrededor de 1 GB, más el adaptador LoRA y el contexto de generación.
- GPU recomendadas: el entrenamiento y la evaluación se realizaron en una NVIDIA T4 (16 GB) de Google Colab; cualquier GPU con al menos 4-6 GB de VRAM debería bastar para inferencia en 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en GPUs con 8 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers con peft (el método documentado por el autor), y por compatibilidad con el modelo base, potencialmente llama.cpp, Ollama o vLLM si se convierte el adaptador a los formatos correspondientes (no documentado por el autor).
- Latencia y throughput: 18 segundos por fragmento de media y p95 de 28 segundos en una T4 con base en 4 bits, con `max_new_tokens=512` y decodificación determinista.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Lacuna, Qwen2.5-1.5B + QLoRA) | 1,5 B (base) + LoRA | no disponible | Extracción JSON de contratos en portugués | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-1.5B-Instruct sin ajuste | 1,5 B | no disponible | Generación de texto general | Apache 2.0 | Hugging Face |
| Claude Opus 5.5 (vía API) | no disponible | no disponible | Extracción JSON de contratos en portugués | propietaria | API comercial, 0,014 USD/documento |
| Extractor por expresiones regulares (Lacuna) | no aplica | no aplica | Extracción JSON de contratos en portugués | no disponible | código del proyecto Lacuna |

En la comparación cualitativa, el adaptador supera al extractor por expresiones regulares en siete de los ocho campos (tipo, número de contrato, proceso, nombre, CNPJ, valor y fecha) y queda ligeramente por debajo en objeto (0,97 frente a 0,95 a favor del adaptador, según la tabla). Frente a Claude Opus 5.5, en el conjunto de desarrollo queda por debajo en fecha (0,88 frente a 0,96) y nombre (0,86 frente a 0,91), y por encima en número de contrato (0,91 frente a 0,89), con un coste marginal nulo.

## Limitaciones y advertencias

- Los rótulos de entrenamiento y el borrador del conjunto de referencia provienen de Claude; el conjunto de referencia se revisó a mano, pero la comparación puede favorecer a modelos que escriben como Claude.
- Los 13 municipios del entrenamiento son los mismos que los de la evaluación; en diarios con otro formato el rendimiento debería caer.
- Entrenamiento y evaluación usan datos anonimizados: en las contrataciones temporales el nombre se sustituyó por `Pessoa XXXXXX`. Con nombre y CPF reales, el modelo puede equivocarse más en el tipo y el nombre de esos casos.
- Entrenamiento y conjunto de referencia se separaron por texto y por contrato, no por diario: diez fragmentos del conjunto de referencia tienen en el entrenamiento un fragmento del mismo diario, con cabecera y pie similares, lo que puede inflar los resultados.
- El conjunto de prueba es pequeño: el CNPJ aparece en solo 10-14 fragmentos, por lo que un acierto más o menos altera notablemente el F1.
- Riesgo de alucinación: el modelo imita los rótulos de Claude, incluidos sus errores, y puede generar valores plausibles pero incorrectos en campos como CNPJ o valor si el texto no los contiene con claridad.
- La salida depende del prompt: el autor advierte que con otro prompt distinto del `LOCAL_PROMPT` de Lacuna el resultado cambia.
- Un extracto sin par en el PNCP solo indica que la información no llegó al portal federal; no dice nada sobre la legalidad del contrato.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador hereda las limitaciones del modelo base y de los datos de entrenamiento, cuya procedencia y condiciones de reutilización no se detallan más allá de Querido Diário.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/juan1211/lacuna-extrator-qwen2.5-1.5b-lora
- Dataset de entrenamiento: https://huggingface.co/juan1211/lacuna-extratos
- Demo (Space): https://huggingface.co/spaces/juan1211/lacuna-extrator
- Repositorio del proyecto Lacuna: https://github.com/juan-barross/lacuna
- Notebook de entrenamiento QLoRA: https://github.com/juan-barross/lacuna/blob/main/notebooks/treino_qlora.ipynb
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Querido Diário: https://queridodiario.ok.org.br/
