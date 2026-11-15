# bonnieyang1997/llama-guard-ecommerce-multiturn-lora

## Resumen

`llama-guard-ecommerce-multiturn-lora` es un adaptador LoRA de referencia publicado por la desarrolladora independiente Bonnie Yang (`bonnieyang1997`) sobre el modelo base `meta-llama/Llama-Guard-3-8B`. Se trata de un clasificador de seguridad y autorización orientado a diálogos multi-turno en el dominio del comercio electrónico: recibe una traza de conversación (turnos de sistema, usuario, asistente y llamadas a herramientas) y emite una etiqueta `safe` o `unsafe\n<categoría_de_violación>`, por ejemplo `unauthorized_action` o `data_exfiltration`.

El modelo se ha afinado con QLoRA de 4 bits usando Unsloth y PEFT, partiendo del checkpoint `checkpoint-600` (época ~2,14) con una pérdida de entropía cruzada de validación de 0,1683. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo. La relevancia actual radica en que ejemplifica cómo adaptar un guardrail genérico de Meta a un dominio vertical con trazas de agente y tool calling, un patrón cada vez más demandado en sistemas de agentes autónomos con acceso a operaciones sensibles (pagos, devoluciones, datos de cliente).

El autor lo etiqueta explícitamente como `reference-only` y `research`: no es un control de seguridad certificado ni un sistema listo para producción. La licencia heredada es la Llama 3.1 Community License y el único idioma soportado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), adaptador LoRA sobre Llama-Guard-3-8B |
| Parámetros totales | 8,07B (modelo base); tamaño del adaptador no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.536 tokens (longitud de entrenamiento); contexto nativo del base no disponible en la información |
| Tipos de cuantización | QLoRA 4 bits durante el entrenamiento; cuantizaciones de inferencia no especificadas |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 3.1 Community License (`llama3.1`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con QLoRA de 4 bits sobre `meta-llama/Llama-Guard-3-8B`, un transformer decoder-only de 8,07B parámetros derivado de la familia Llama 3.1 y especializado originalmente en clasificación de seguridad. El entrenamiento se realizó con Unsloth y PEFT, aplicando *response-only loss masking* (la pérdida se calcula solo sobre la respuesta del clasificador, no sobre el prompt) y alineando la plantilla de chat por defecto de Llama Guard 3 con la plantilla `llama-3.1`. La longitud máxima de secuencia fue de 1.536 tokens y se seleccionó el checkpoint 600 (época ~2,14) por presentar la menor pérdida de validación (0,1683).

El conjunto de entrenamiento son trazas sintéticas o curadas de diálogos de comercio electrónico en inglés, con turnos de sistema, usuario, asistente y contexto de herramientas. Se sobremuestrearon las trazas `unsafe` un factor de 2,5x para mejorar el recall en clases minoritarias de violación. La validación se realizó sobre un split retenido de 738 conversaciones. No se documentan fases de RLHF ni DPO; el ajuste es supervisado sobre etiquetas de clasificación.

## Capacidades

- Clasificación binaria de seguridad (`safe` / `unsafe`) sobre turnos de conversación.
- Etiquetado de categoría de violación tras `unsafe` (p. ej. `unauthorized_action`, `data_exfiltration`).
- Evaluación de diálogos multi-turno con contexto acumulado de la sesión.
- Procesamiento de trazas con llamadas a herramientas (tool calls) y contexto de usuario intercalado.
- Detección de acciones no autorizadas en flujos de agente de comercio electrónico.
- Salida en formato de texto estructurado compatible con pipelines de guardrails.
- No soporta generación abierta, visión, audio ni tool calling como emisor; su función es clasificadora.
- Multilingüismo: no, solo inglés.

## Casos de uso

- **Filtro previo a operaciones sensibles en agentes de compra:** insertar el clasificador antes de ejecutar acciones como cancelar pedidos, emitir reembolsos o modificar direcciones, para marcar turnos que se parezcan a `unauthorized_action` vistos en entrenamiento.
- **Auditoría offline de trazas de conversación:** procesar logs históricos de sesiones de atención al cliente y etiquetar turnos sospechosos para revisión humana, aprovechando el formato de salida `unsafe\n<categoría>`.
- **Investigación sobre QLoRA en guardrails:** usar el adaptador como baseline reproducible para estudiar *response-only loss masking*, alineación de plantillas de chat y calibración de umbrales sobre Llama-Guard-3-8B.
- **Prototipado de guardrails verticales:** servir como punto de partida para equipos que quieran reentrenar con sus propias políticas y datos auditados en lugar de desplegar estos pesos.
- **Evaluación de robustez frente a prompt injection:** emplear el modelo como sujeto de pruebas en *red-teaming* de diálogos multi-turno con inyecciones y comprobar falsos positivos y negativos.
- **Docencia y demostraciones:** ilustrar en cursos o talleres cómo se adapta un clasificador de seguridad genérico a un dominio concreto con Unsloth y PEFT sobre una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de entropía cruzada de validación del checkpoint seleccionado (0,1683) sobre un split retenido de 738 conversaciones, que no es comparable con métricas estándar como MMLU o HumanEval.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita. Como referencia, el modelo base de 8,07B en 4 bits requiere del orden de 5-6 GB de VRAM para los pesos, más overhead de activaciones y contexto; el adaptador añade una cantidad marginal.
- **GPU recomendadas:** no especificadas por el autor. Para inferencia del base en 4 bits, GPUs de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4090) son suficientes; para precisión completa, A100 o H100.
- **Cabe en GPU de consumo:** sí, previsiblemente en modelos con 8 GB o más en cuantización de 4 bits, aunque el autor no lo confirma.
- **Opciones de despliegue:** el adaptador es PEFT, por lo que se carga con `peft` + `transformers`; también podría fusionarse y exportarse a GGUF para llama.cpp u Ollama, aunque no se documenta.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `llama-guard-ecommerce-multiturn-lora` (este) | 8,07B base + LoRA | 1.536 tokens (entrenamiento) | E-commerce multi-turno | Llama 3.1 Community | Hugging Face, reference-only |
| `meta-llama/Llama-Guard-3-8B` | 8,07B | contexto nativo de Llama 3.1 | Seguridad general | Llama 3.1 Community | Hugging Face, oficial |
| `meta-llama/Llama-Guard-3-1B` | 1,2B | contexto nativo de Llama 3.2 | Seguridad general | Llama 3.2 Community | Hugging Face, oficial |

La comparación con otros guardrails verticales de comercio electrónico no está disponible en la información proporcionada. Frente al base, este adaptador gana especialización en trazas de agente con tool calls pero pierde generalidad y queda limitado a inglés y a 1.536 tokens.

## Limitaciones y advertencias

- **Solo referencia:** el autor declara explícitamente que no es un control de seguridad certificado, herramienta de cumplimiento legal ni sistema de autorización listo para producción.
- **Sin garantía ni responsabilidad:** los pesos se ofrecen "AS IS"; el autor no asume responsabilidad por daños, brechas de datos, pérdidas financieras o fallos de cumplimiento derivados de su uso.
- **Generalización no verificada:** evaluado únicamente sobre 738 conversaciones de validación; frases reales, inyecciones adversarias y casos fuera de distribución pueden producir falsos positivos y negativos.
- **Sesgo por sobremuestreo:** el 2,5x de trazas `unsafe` puede desplazar las probabilidades hacia el flagging conservador si no se recalibra.
- **Límite de contexto:** secuencias superiores a 1.536 tokens se truncan y pueden perder contexto crítico de la sesión.
- **Idioma:** solo inglés; no apto para diálogos en castellano u otros idiomas.
- **No sustituye controles deterministas:** un guardrail neuronal es probabilístico y nunca debe reemplazar autenticación, verificación de sesión ni RBAC en las APIs de backend.
- **Fuera de alcance:** generación abierta, dominios distintos del comercio electrónico y toma de decisiones legales, regulatorias o financieras.
- **Licencia:** hereda la Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución que esta impone.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bonnieyang1997/llama-guard-ecommerce-multiturn-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-8B
- Licencia Llama 3.1 Community: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Paper de referencia citado (arXiv:2407.21783): https://arxiv.org/abs/2407.21783
