# NavitraTechnologies01/bn-01-retail-banker

## Resumen

`bn-01-retail-banker` es un adaptador LoRA desarrollado por NavitraTechnologies LTD sobre el modelo base `mlx-community/Qwen3-14B-4bit` (MLX), afinado para actuar como asistente interno de empleados bancarios: cajeros, agentes de atención al cliente, oficiales de crédito, gestores de relaciones y personal de sucursal. El adaptador ayuda a redactar comunicaciones con clientes, explicar procedimientos de cuentas y cumplimiento normativo, identificar señales de fraude y escalar correctamente incidencias de compliance, sin acceder a datos en vivo ni sustituir el juicio de profesionales licenciados.

El modelo se libera bajo licencia Apache 2.0, con un tamaño de repositorio de 0,1 GB (solo los pesos del adaptador). Está entrenado sobre un conjunto de datos sintético de 4.858 ejemplos (generados por Claude) que abarcan 492 categorías de escenarios bancarios en Reino Unido, UE y EE. UU., incluyendo tipologías de fraude, AML/KYC, protección de clientes vulnerables, verificación de documentos, hipotecas, banca empresarial, seguros, sanciones y cripto, protección de datos (DSAR/brecha), notificación de fallecimiento, operativa de caja y comunicación general.

La relevancia actual del modelo reside en su enfoque de uso interno con guardarraíles explícitos: no accede a sistemas en vivo, no inventa cifras ni políticas concretas, y deriva consultas de asesoramiento licenciado a los recursos adecuados. El checkpoint publicado es de la iteración 7.200 de 9.000, porque la evaluación en un conjunto de test retenido mostró sobreajuste en iteraciones posteriores (perplexity 1.787 frente a 2.480 del checkpoint final).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen3-14B-4bit, MLX) |
| Parametros totales | 14,77B (base) + 25,69M (adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3-14B) |
| Tipos de cuantizacion | 4-bit (base MLX) |
| Idiomas soportados | No disponibles (depende del base Qwen3) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores), MLX |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado a `mlx-community/Qwen3-14B-4bit`, una versión cuantizada en 4 bits del modelo Qwen3-14B preparada para el framework MLX. El adaptador tiene rango 16, dropout 0,10 y escala 20,0, y se aplica solo a las últimas 16 capas transformer del modelo base. Los parámetros entrenables son 25,69 millones, lo que supone un 0,174 % del total de 14,77B. Se entrenó con AdamW (weight_decay 0,01) durante 9.000 iteraciones (~2 épocas) con batch size 1, aunque el checkpoint liberado corresponde a la iteración 7.200.

Los datos de entrenamiento son 100 % sintéticos, generados por Claude siguiendo un esquema fijo y breves descripciones de escenarios realistas. No provienen de interacciones reales con clientes, casos reales ni texto normativo verificado. El conjunto incluye 43 categorías regulatorias específicas de la UE (GDPR, PSD2, SEPA, MiCA, DORA) y 43 de EE. UU. (BSA/SAR, OFAC, Reg E, ECOA, FDIC, PATRIOT Act CIP). La evaluación sobre 97 ejemplos de test retenidos muestra una reducción de perplejidad de ~10 veces respecto al base (1,787 frente a 20,606).

## Capacidades

- Redacción de comunicaciones con clientes: cartas, correos, respuestas a reclamaciones y mensajes en el canal de atención, con tono profesional y conforme a procedimientos internos.
- Explicación de procedimientos de cuentas y cumplimiento: interpretación de pasos operativos (apertura de cuentas, verificación de documentos, gestión de DSAR, notificación de fallecimiento, cuentas de supervivientes).
- Detección y escalado de señales de fraude y cumplimiento: reconocimiento de patrones de fraude, lavado de dinero, explotación financiera de mayores, coincidencias con listas de sanciones, y derivación a supervisores o equipos BSA/AML.
- Soporte multilingüe: no disponible de forma explícita en la ficha; depende del modelo base Qwen3, que soporta múltiples idiomas.
- Capacidades de agentes y multi-step reasoning: no documentadas específicamente para este adaptador; el sistema prompt fomenta la derivación a recursos internos en lugar de resolver directamente.
- Sin acceso a datos en vivo: el modelo no tiene acceso a datos de clientes, sistemas internos ni políticas concretas del banco; indica claramente cuándo depende de esa información.

## Casos de uso

- Atención al cliente en sucursal: el cajero consulta al modelo cómo manejar un cliente frustrado por un pago rechazado; el adaptador sugiere pasos de verificación y redacta una respuesta empática, derivando a sistemas internos si necesita datos de la cuenta.
- Soporte telefónico de cumplimiento: un agente recibe una consulta sobre una transferencia sospechosa; el modelo explica los pasos para reconocer el patrón y escalar al oficial de cumplimiento sin revelar información sobre SAR.
- Formación de empleados: el adaptador se usa en simulaciones internas para enseñar a nuevos empleados a manejar escenarios de fraude, AML/KYC y clientes vulnerables con ejemplos sintéticos.
- Gestión de DSAR y brechas de datos: el modelo orienta sobre el proceso de respuesta a una solicitud de acceso a datos (DSAR) o la notificación de una brecha, indicando cuándo derivar al equipo legal.
- Banca para clientes vulnerables: el modelo ayuda a redactar comunicaciones claras y respetuosas para clientes mayores o con discapacidad, siguiendo procedimientos de protección.
- Soporte de cumplimiento de sanciones y cripto: el adaptador reconoce escenarios de coincidencias con listas de sanciones o consultas de criptoactivos y deriva al equipo BSA/AML, evitando decisiones autónomas.
- Derivación a asesores licenciados: ante preguntas de recomendaciones de inversión o refinanciación, el modelo ayuda al empleado a referir al cliente al asesor adecuado sin dar recomendaciones directas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada es la pérdida y perplejidad sobre un conjunto de test retenido de 97 ejemplos:

| Checkpoint | Test loss | Test perplexity |
|---|---|---|
| Base Qwen3-14B (sin fine-tuning) | 3,026 | 20,606 |
| Checkpoint liberado (iter 7200) | 0,580 | 1,787 |
| Checkpoint final (iter 9000) | 0,908 | 2,480 |

La perplejidad se reduce ~10 veces respecto al base, y el checkpoint liberado es mejor que el final, lo que evidencia sobreajuste en las últimas iteraciones.

## Requisitos de hardware

- Inferencia: requiere el modelo base `mlx-community/Qwen3-14B-4bit` (cuantización 4-bit en MLX) más el adaptador LoRA (~25,7M parámetros adicionales).
- VRAM estimada: el base 4-bit de 14B en MLX ocupa aproximadamente 8-9 GB en FP16/4-bit; se puede ejecutar en GPUs de consumo con al menos 10 GB de VRAM (por ejemplo, RTX 3080/3090, RTX 4070/4090).
- GPUs recomendadas: Apple Silicon (M1 Pro/Max y posteriores) para MLX, o GPUs NVIDIA con soporte CUDA (A100, H100, RTX 4090) para despliegues más grandes.
- Opciones de despliegue: `mlx-lm` (inferencia en Python), conversión a GGUF para `llama.cpp` u `Ollama` (aunque el adaptador está optimizado para MLX).
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del hardware y del modelo base.

## Comparativa con modelos similares

No se han encontrado adaptadores LoRA equivalentes específicamente orientados a banca minorista con licencia Apache-2.0 y base Qwen3-14B. Como referencia, se compara con el modelo base sin afinar y con otro adaptador del mismo autor:

| Modelo | Params | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| bn-01-retail-banker (LoRA sobre Qwen3-14B) | 14,77B + 25,7M | No disponible | Apache-2.0 | Banca minorista, cumplimiento, fraude |
| Qwen3-14B (base) | 14,77B | No disponible | Apache-2.0 | Generalista |
| NavitraTechnologies01/tn_01_base_coder | 15B | No disponible | Apache-2.0 | Generación de código |

No hay información sobre otros adaptadores de banca comparables con datos de rendimiento públicos.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos: todos los ejemplos fueron generados por Claude y no provienen de interacciones reales ni de texto normativo verificado; la precisión regulatoria no está garantizada.
- Riesgo de alucinación en cifras y políticas: el modelo puede inventar números, tasas o detalles de política; el prompt del sistema le obliga a reconocer cuándo no tiene acceso a datos en vivo, pero no elimina el riesgo.
- Uso exclusivo interno: no es un producto para clientes finales; el autor lo indica explícitamente en la model card.
- Sin acceso a datos reales: no debe usarse para consultar cuentas, sistemas o datos de clientes; solo para soporte de procedimiento.
- Asesoramiento licenciado: el modelo no debe dar recomendaciones de inversión, préstamo o refinanciación; debe derivar a profesionales licenciados.
- Sobreajuste observado: el checkpoint liberado es el mejor de la corrida, pero el entrenamiento completo muestra sobreajuste en iteraciones finales; se recomienda evaluar siempre en un conjunto de validación.
- Idioma y región: los escenarios cubren UK, UE y EE. UU., pero no hay datos sobre cobertura de otros idiomas o jurisdicciones.
- Dependencia del base: requiere el checkpoint `mlx-community/Qwen3-14B-4bit`; no funciona como modelo standalone.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/NavitraTechnologies01/bn-01-retail-banker)
- [Base model mlx-community/Qwen3-14B-4bit](https://huggingface.co/mlx-community/Qwen3-14B-4bit)
- [tn_01_base_coder (otro adaptador del autor)](https://huggingface.co/NavitraTechnologies01/tn_01_base_coder)
- [ibanker - AI Copilot for Banking Decision Intelligence (NavTechnologies)](https://www.navtechnologies.in/ibanker)
- [AI in Banking: Applications, Benefits and Examples (Google Cloud)](https://cloud.google.com/discover/ai-in-banking)
- [Generative AI in Retail Banking (Bain & Company)](https://www.bain.com/insights/generative-ai-in-retail-banking/)
