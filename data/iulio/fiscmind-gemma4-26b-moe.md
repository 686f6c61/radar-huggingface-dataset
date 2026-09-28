# iulio/FiscMind-Gemma4-26B-MoE

## Resumen

FiscMind-Gemma4-26B-MoE es un adaptador LoRA (PEFT) desarrollado por Iulian Amaricai sobre el modelo base google/gemma-4-26B-A4B-it de Google DeepMind. Se trata de una especialización vertical orientada a contabilidad y fiscalidad rumanas, que cubre el GAAP estatutario (OMFP 1802/2014), el Código Fiscal (Legea 227/2015 y normativa modificativa) y los marcos de cumplimiento digital obligatorios (RO e-Factura, RO e-Transport, SAF-T D406). El adaptador se distribuye como safetensors de 35,51 MB, no como modelo completo.

El modelo base emplea una arquitectura de mezcla de expertos dispersa (gemma4_unified) con 128 expertos y enrutamiento top-8, con 25,82 mil millones de parámetros totales y aproximadamente 4 mil millones de parámetros activos por token. Esa relación entre capacidad total y cómputo activo permite mantener el conocimiento paramétrico de un modelo de 26B con el coste de inferencia asociado a un modelo de 4B activos, lo que resulta relevante para despliegues con presupuesto de latencia ajustado.

Su relevancia radica en que aborda un nicho normativo muy específico y cambiante (incluidas las reformas de austeridad fiscal Legea 296/2023 y OUG 115/2023) para el que existen pocos recursos en abierto, y lo hace con un coste de entrenamiento muy contenido: 100 pasos sobre 1.719 ítems de currículo, 979,9 segundos en una NVIDIA A100-SXM4-80GB. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos dispersa (gemma4_unified), 128 expertos, enrutamiento top-8 |
| Parametros totales | 25,82 mil millones (modelo base) |
| Parametros activos | ~4 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento con 4-bit NF4 y computo bfloat16; el adaptador se distribuye sin cuantizar y se aplica sobre el modelo base, que admite bf16, 8-bit y 4-bit NF4 |
| Idiomas soportados | rumano (ro), ingles (en) |
| Licencia | apache-2.0 (adaptador); el modelo base se rige por los terminos de Google Gemma |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Tipo de artefacto | Adaptador LoRA (no modelo completo) |
| Tamano del adaptador | 35,51 MB |
| Repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de bajo rango sobre el modelo base google/gemma-4-26B-A4B-it. La configuración de LoRA emplea r=16 y alpha=32, y se aplica sobre las proyecciones lineales del modelo de lenguaje identificadas como q, k, v, o, gate, up y down. El modelo base subyacente es una red transformer de mezcla de expertos con 128 expertos y enrutamiento top-8, lo que da como resultado 25,82B de parámetros totales y aproximadamente 4B activos por token.

El entrenamiento se realizó sobre 1.719 ítems de currículo normativo con 100 pasos y tamaño de lote efectivo de 8, en una NVIDIA A100-SXM4-80GB sobre un clúster serverless de Modal.com, con cuantización 4-bit NF4 y cómputo en bfloat16 (BitsAndBytesConfig). La duración total fue de 979,9 segundos (16,33 minutos) y la pérdida final reportada es de 0,6011, con una precisión media por token superior al 99,9%. El currículo declarado abarca monografías contables de doble entrada, impuesto sobre sociedades, el nuevo impuesto mínimo sobre cifra de negocios (IMCA al 1%), límites de arrastre de pérdidas fiscales, IVA con inversión del sujeto pasivo, nómina y beneficios extra-salariales, y obligaciones de reporte digital.

No se documentan en la información disponible fases de RLHF, DPO ni mecanismos de decodificación especulativa o atención lineal. El tamaño de muestra del currículo (1.719 ítems) y el número de pasos (100) corresponden a un ajuste fino ligero más que a un entrenamiento extensivo de dominio.

## Capacidades

- Generación de texto conversacional y respuesta a consultas (pipeline text-generation, con etiquetas conversational y base_model -it).
- Contabilidad según OMFP 1802/2014: monografías de doble entrada para compras (371, 401, 4426), ventas (4111, 707, 4427, 607), márgenes comerciales (378, 4428), inmovilizado y leasing (213, 167, 666, 6811, 2813), diferencias de cambio (401, 5124, 7651, 6651) y operaciones de cierre y dividendos (121, 129, 1061, 463, 457).
- Fiscalidad según Legea 227/2015: impuesto sobre sociedades (16%, protocolo 2%, crédito por patrocinios), nuevo impuesto mínimo sobre cifra de negocios (IMCA 1% para entidades con facturación superior a 50.000.000 EUR), límite de arrastre de pérdidas fiscales (tope del 70% en 5 ejercicios consecutivos) y IVA con inversión del sujeto pasivo (4426 = 4427) y adquisiciones intracomunitarias.
- Nómina y beneficios extra-salariales (OUG 115/2023 y Legea 296/2023): tope de exención del sector IT (10.000 lei brutos), retención de CASS del 10% sobre vales de comida y umbral del 33% de beneficios extra-salariales exentos.
- Cumplimiento digital: RO e-Factura (plazo de 5 días naturales, sanción del 15% por facturas no registradas), RO e-Transport (validez del código UIT de 5 días naturales, umbrales de 500 kg / 10.000 lei) y SAF-T D406 (mapeo de taxonomía del libro mayor, obligaciones mensuales y trimestrales).
- Preguntas y respuestas de tipo legal y financiero (legal-qa, financial-qa).
- Soporte bilingüe rumano e inglés.
- Capacidad de razonamiento paso a paso orientada a resolución de supuestos contables y fiscales.
- Tool calling, function calling, capacidades de agente y modo de razonamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Generación de monografías contables: el modelo produce asientos de doble entrada completos con cuentas del plan contable rumano para operaciones de compra, venta, inmovilizado, leasing, diferencias de cambio y cierre. Es adecuado porque el currículo de entrenamiento incluye explícitamente esas cuentas y su casuística.
- Cálculo y explicación de obligaciones fiscales: interpreta supuestos del Código Fiscal (impuesto sobre sociedades, IMCA, reversión del IVA, arrastre de pérdidas) y devuelve la base legal aplicable, útil para consultas de asesoría fiscal interna.
- Cálculo de nómina y beneficios extra-salariales: aplica los topes de exención del sector IT, la retención de CASS sobre vales y el umbral del 33% de beneficios, apoyándose en la normativa OUG 115/2023 y Legea 296/2023 recogida en el entrenamiento.
- Validación previa de cumplimiento digital: sirve como primera línea de comprobación de plazos y requisitos de RO e-Factura, RO e-Transport y SAF-T D406 antes de la presentación telemática a ANAF.
- Asistencia en la preparación de SAF-T (D406): ayuda a mapear cuentas del libro mayor a la taxonomía requerida y a identificar obligaciones periódicas.
- Soporte a equipos multinacionales con operaciones en Rumanía: al cubrir rumano e inglés, permite que equipos que no dominan el idioma local formulen preguntas en inglés y obtengan respuestas con terminología rumana.
- Formación y onboarding de contables junior: el modelo puede generar explicaciones de asientos con temei legal y fórmulas contables, útil como material de apoyo en programas de capacitación CECCAR/CCF.
- Pre-validación de cuadres contables: como guardrail, el sistema mantiene la igualdad Debe = Haber en cada sugerencia monetaria, de modo que puede usarse para detectar desequilibrios antes del registro definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de entrenamiento reportado es la pérdida final de 0,6011 tras 100 pasos y una precisión media por token superior al 99,9% sobre el propio currículo de entrenamiento, valores que no constituyen una evaluación independiente ni permiten comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en 25,82B parámetros totales; los expertos deben residir en memoria aunque solo se activen ~4B por token):
  - bf16: aproximadamente 52 GB solo para pesos, más caché KV y activaciones (estimación orientativa de 56-64 GB).
  - 8-bit: aproximadamente 26 GB para pesos, más sobrecarga (estimación orientativa de 30-34 GB).
  - 4-bit NF4: aproximadamente 13-15 GB para pesos, más sobrecarga (estimación orientativa de 16-20 GB).
- GPU recomendadas: A100 80GB o H100 80GB para bf16 en una sola GPU; A100 40GB o L40S 48GB para 8-bit; RTX 4090/3090 para 4-bit.
- Encaje en GPU de consumo: con cuantización 4-bit puede caber en una RTX 4090 o RTX 3090 de 24 GB; con 8-bit requiere al menos 32-48 GB, por lo que una única GPU de consumo suele ser insuficiente. Con bf16 no cabe en GPU de consumo.
- Opciones de despliegue: transformers + peft (procedimiento mostrado en la model card), vLLM con soporte de adaptadores LoRA, y TGI con PEFT. El uso en llama.cpp u Ollama exigiría fusionar el adaptador con el modelo base y convertirlo a GGUF, algo no documentado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| FiscMind-Gemma4-26B-MoE | 25,82B / ~4B | no disponible | Fiscal y contable rumano (OMFP 1802, Legea 227/2015, e-Factura, SAF-T) | apache-2.0 (adaptador) | safetensors (LoRA PEFT) |
| google/gemma-4-26B-A4B-it (base) | 25,82B / ~4B | no disponible | Asistente generalista instruido | Terminos de Google Gemma | safetensors |

No se dispone de datos verificables sobre otros modelos especializados en fiscalidad y contabilidad rumanas que permitan una comparación directa: no disponible.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y ejecutar el modelo base google/gemma-4-26B-A4B-it para funcionar.
- El ajuste fino es muy ligero (100 pasos sobre 1.719 ítems), lo que limita la cobertura real de casuística y aumenta el riesgo de sobreajuste al currículo y de generalización deficiente ante supuestos no vistos.
- Riesgo de alucinación en materia legal y fiscal: el modelo puede citar artículos, plazos, tipos impositivos o cuentas contables incorrectos. Toda salida debe verificarse contra la normativa vigente.
- El propio autor establece un estándar de revisión humana obligatoria (CECCAR/CCF) antes de cualquier presentación de declaraciones o registro en el libro mayor; el modelo no debe operar de forma autónoma.
- Cobertura idiomática limitada a rumano e inglés; no se declara soporte de castellano ni de otros idiomas.
- No se documenta la longitud de contexto soportada ni la ficha de arquitectura del modelo base en la información disponible.
- Licencia del adaptador apache-2.0, pero el modelo base se rige por los términos de uso de Google Gemma, que imponen condiciones y restricciones de uso adicionales. Para uso comercial debe revisarse y cumplirse la licencia del modelo base, que prevalece.
- La normativa fiscal rumana cambia con frecuencia; el conocimiento está anclado a la legislación 2025/2026 según declara el autor, por lo que puede quedar obsoleto.
- El repositorio no registra descargas ni valoraciones, por lo que no existe evidencia externa de validación ni de uso en producción.
- No se documentan capacidades de tool calling, function calling, uso como agente, visión ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iulio/FiscMind-Gemma4-26B-MoE
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
