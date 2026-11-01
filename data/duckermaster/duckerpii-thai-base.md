# DuckerMaster/DuckerPII-Thai-Base

## Resumen

DuckerPII-Thai-Base es un modelo de clasificación de tokens (token classification / NER) desarrollado por DuckerMaster, especializado en la detección y enmascaramiento de información personal identificable (PII) en texto tailandés no estructurado. Se presenta como una pasarela de privacidad ligera que se sitúa antes del envío de prompts a modelos de lenguaje grandes y APIs en la nube, con el objetivo de facilitar el cumplimiento de la Ley de Protección de Datos Personales de Tailandia (PDPA) y las directrices regulatorias de la PDPC.

El modelo se construye sobre una arquitectura RoBERTa (concretamente un ajuste fino de WangchanBERTa-base) y cuenta con aproximadamente 104,7 millones de parámetros según los pesos en safetensors. Está entrenado sobre el corpus sintético Thai-PII-Synthetic v6.0.0, de 20.000 muestras, y reconoce siete clases de entidades: NAME, ID_CARD, PHONE, EMAIL, BANK_ACC, BANK y ADDRESS.

Su relevancia radica en que aborda un problema real de despliegue: la fuga de datos personales hacia servicios externos de IA. Al ser un modelo de ~110M de parámetros, puede ejecutarse en CPU de un solo núcleo con una latencia declarada de aproximadamente 42 ms por muestra, lo que lo hace apto para filtrar texto en tiempo real antes de llamar a un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder contextual de subpalabras, ajuste fino de WangchanBERTa-base) |
| Parametros totales | 104.665.359 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 416 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandés (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo RoBERTa adaptado a la clasificación de tokens, derivado de WangchanBERTa-base. La tarea es NER sobre texto tailandés, con una cabeza de clasificación sobre siete etiquetas de entidad. La longitud de contexto declarada es de 416 tokens, coherente con un encoder de este tamaño orientado a frases y párrafos cortos.

El entrenamiento se realizó sobre el corpus 100% sintético Thai-PII-Synthetic v6.0.0 (20.000 muestras, sin PII del mundo real). La model card indica que se combatió el memorizado de atajos superficiales mediante un 50% de dropout de palabras disparadoras (trigger-word dropout), negativos duros numéricos y estructuras de dirección fragmentadas. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de una tarea de clasificación, lo habitual sería un ajuste supervisado con función de pérdida de entropía cruzada por token, pero este extremo no se confirma en la documentación.

## Capacidades

- Detección y extracción de entidades PII en texto tailandés con siete clases: NAME, ID_CARD, PHONE, EMAIL, BANK_ACC, BANK y ADDRESS.
- Clasificación a nivel de token (token classification), apta para enmascaramiento o anonimización posterior.
- Validación de identificadores: la model card menciona validación matemática de checksum Mod11 para ID_CARD y validación de prefijos telefónicos tailandeses (08, 09, 06, 02).
- Diferenciación de cuentas bancarias frente a identificadores de pedido, seguimiento o códigos de barras.
- Reconocimiento de direcciones fragmentadas con jerarquías de subdistrito y distrito.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un modelo discriminativo de NER, no generativo.

## Casos de uso

- Pasarela de privacidad antes de LLM: el modelo se coloca entre el usuario y una API de modelo generativo, detecta y enmascara PII en tailandés antes de enviar el prompt, reduciendo el riesgo de fuga de datos personales a servicios externos.
- Cumplimiento de PDPA en atención al cliente: en un chat de soporte se procesan mensajes multi-turno y se anonimizan nombres, teléfonos y direcciones antes de almacenarlos o analizarlos, facilitando la trazabilidad regulatoria.
- Anonimización de registros financieros: detección de números de cuenta bancaria y nombres de banco en comunicaciones, diferenciando cuentas de identificadores de pedido o códigos de barras, para su uso en analítica interna.
- Limpieza de datasets y corpus: preprocesado de textos tailandeses antes de construir datasets de entrenamiento o de publicar corpus, eliminando PII de forma automatizada.
- Enmascaramiento en pipelines de logging: filtrado en tiempo real de logs de aplicaciones y conversaciones antes de su almacenamiento, con latencia declarada de ~42 ms por muestra en CPU de un solo núcleo.
- Moderación y revisión de contenido: extracción de entidades para revisión humana o para etiquetado de documentos en flujos de compliance.
- Procesamiento en el borde (edge): al ser un modelo de ~110M de parámetros, puede ejecutarse en entornos con CPU y sin GPU, integrándose en servicios ligeros o en el propio dispositivo.

## Benchmarks y rendimiento

La model card reporta resultados sobre un split de test retenido (2.000 frases / 6.052 entidades, con 0% de solapamiento de plantillas y léxico) y un benchmark OOD de chat ruidoso adversarial, comparados con una línea base basada en expresiones regulares.

| Metrica | Baseline regex | DuckerPII-Thai-Base | Ganancia |
|---|---|---|---|
| Macro precision in-domain | 0.7142 | 0.9989 | +28,47% |
| Macro recall in-domain | 0.6079 | 0.9989 | +39,10% |
| Macro F1 in-domain | 0.6432 | 0.9989 | +35,57% |
| Micro F1 in-domain | 0.5981 | 0.9989 | +40,08% |
| Recall OOD chat ruidoso | 0.4210 | 98,33% | +56,23% |
| Tasa de fuga de span OOD | 57,90% | 1,67% | -56,23% |
| Latencia CPU un nucleo | < 1 ms | ~42 ms/muestra | tiempo real |

Desglose de F1 por clase:

| Entidad | Precision | Recall | F1 |
|---|---|---|---|
| NAME | 0.9989 | 0.9984 | 0.9986 |
| ID_CARD | 1.0000 | 1.0000 | 1.0000 |
| PHONE | 0.9991 | 0.9991 | 0.9991 |
| EMAIL | 1.0000 | 1.0000 | 1.0000 |
| BANK_ACC | 0.9980 | 1.0000 | 0.9990 |
| BANK | 1.0000 | 0.9976 | 0.9988 |
| ADDRESS | 0.9964 | 0.9978 | 0.9971 |

Estos resultados proceden de la propia model card y se obtuvieron sobre datos sintéticos; no se han publicado resultados en la información disponible sobre benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~104,7M de parámetros, los pesos en precisión completa ocupan aproximadamente 0,4 GB; en fp16, alrededor de 0,2 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) acelera la inferencia, pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria libre, e incluso en CPU de un solo núcleo.
- Opciones de despliegue: transformers (pipeline de token-classification), y en general los servidores compatibles con modelos de la librería transformers; la información disponible no detalla soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card declara ~42 ms por muestra en CPU de un solo núcleo, lo que permite procesamiento en tiempo real de frases cortas; no se detalla throughput en GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos alternativos comparables de NER de PII en tailandés (parámetros, contexto, rendimiento, licencia y disponibilidad). La única comparación documentada es contra una línea base de expresiones regulares, cuyos resultados se recogen en la sección de benchmarks. Por tanto, la comparativa con otros modelos de la misma categoría se indica como no disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos (Thai-PII-Synthetic v6.0.0), lo que puede no cubrir toda la variabilidad de PII del mundo real.
- El rendimiento reportado (F1 ~0,9989) procede de la propia model card y de un test sintético; conviene validarlo con datos propios antes de usarlo en producción.
- Solo soporta tailandés; no está entrenado para otros idiomas.
- Contexto limitado a 416 tokens, insuficiente para documentos largos sin fragmentación previa.
- Es un modelo discriminativo de clasificación de tokens: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de falsos negativos que provoquen fuga de PII; la propia model card reporta una tasa de fuga de span del 1,67% en el benchmark OOD.
- Posibles sesgos derivados de la distribución sintética del corpus de entrenamiento (nombres, direcciones y formatos generados).
- Licencia Apache-2.0, permisiva para uso comercial; no obstante, el cumplimiento normativo (PDPA) es responsabilidad del desplegador.
- No se documentan tipos de cuantización ni formatos alternativos de pesos; solo se ofrecen pesos safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuckerMaster/DuckerPII-Thai-Base
- Dataset: https://huggingface.co/datasets/DuckerMaster/Thai-PII-Synthetic
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
