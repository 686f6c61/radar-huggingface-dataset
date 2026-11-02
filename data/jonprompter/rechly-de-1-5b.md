# jonprompter/rechly-de-1.5b

## Resumen

Rechly-DE-1.5B (Slim) es un modelo de lenguaje especializado en contabilidad y facturación alemana, desarrollado por el equipo de Rechly (jonprompter) y publicado bajo licencia Apache 2.0. Se construye como un ajuste fino del modelo base Qwen/Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones), y se distribuye principalmente en formato GGUF cuantizado Q4_K_M con un tamaño de fichero de unos 940 MB y un consumo de RAM en inferencia de aproximadamente 1,0 GB. Su propósito es cubrir tareas concretas del ámbito fiscal y contable alemán: extracción estructurada de datos de facturas, generación de e-Rechnung conforme a EN 16931, XRechnung 3.0 y ZUGFeRD 2.3, categorización contable para los planes DATEV SKR03 y SKR04, y pre-auditoría GoBD.

El modelo se posiciona como una alternativa de despliegue local y de bajo coste para entornos con requisitos estrictos de protección de datos (DSGVO/GDPR), ya que está diseñado para ejecutarse íntegramente on-device sin salida de datos a servicios externos. Forma parte de una familia de tres tamaños (0.5B, 1.5B y 3B) orientada a distintos perfiles de hardware, desde Raspberry Pi hasta servidores de producción.

Es relevante ahora por la entrada en vigor del mandato de facturación electrónica en Alemania para 2025/2026 y por la necesidad de herramientas que procesen facturas conforme a normativa sin depender de proveedores cloud. El contexto del modelo base Qwen2.5-1.5B-Instruct no se especifica en la información disponible para este ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (distribucion principal); no se detallan otras variantes |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors disponible en el repo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, un modelo denso de aproximadamente 1,5 mil millones de parámetros. Rechly-DE-1.5B es un ajuste fino orientado a dominio sobre esa base, especializado en tareas de contabilidad, fiscalidad y facturación alemana. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado convencional.

Una innovación destacable del diseño es la separación entre el modelo y los componentes deterministas: la generación híbrida de PDF/A-3 con ZUGFeRD 2.3, el exportador por lotes DATEV EXTF 700 y el conciliador "cent-perfect" se ejecutan en Python de forma determinista, sin coste de memoria del LLM. Esto reduce la carga del modelo a la extracción y estructuración de información, delegando la serialización y validación formal a código convencional. El autor declara además una velocidad de inferencia superior a 120 tokens/segundo en Apple Silicon con Metal y aproximadamente 0,7 segundos por consulta.

## Capacidades

- Extracción de texto a factura (text-to-invoice) con salida JSON estricta.
- Detección automática de regímenes fiscales: Kleinunternehmer (§ 19 UStG), Reverse Charge (§ 13b UStG, § 3a UStG) y exportación (§ 4 Nr. 1a UStG).
- Generación de e-Rechnung conforme a EN 16931 / XRechnung 3.0, con extracción validada de BT-10 Leitweg-ID y serialización UBL 2.1 XML.
- Categorización contable automática para DATEV SKR03 y SKR04, con más de 30 cuentas del plan contable y aplicación del límite legal del 70 % para gastos de Bewirtung.
- Pre-auditoría GoBD § 14 Abs. 4 para facturas entrantes, orientada a proteger el Vorsteuerabzug.
- Redacción de cartas de reclamación de pago (Mahnwesen) en varias etapas (Stufe 1, 2 y 3).
- Reescribura de líneas de factura B2B, formalizando notas informales en textos de posición auditables.
- Capacidades conversacionales heredadas del modelo base (pipeline text-generation, tarea conversational).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Extracción estructurada de facturas entrantes: el modelo recibe el texto libre de una factura y devuelve un JSON estricto con los campos fiscales relevantes, lo que permite alimentar un ERP o un sistema de contabilidad sin intervención manual.
- Cumplimiento del mandato de e-Rechnung 2025/2026: generación de facturas XRechnung 3.0 y ZUGFeRD 2.3 a partir de descripciones en lenguaje natural, con validación de la Leitweg-ID y serialización UBL 2.1, adecuado para pymes que deben emitir facturas electrónicas conforme a EN 16931.
- Contabilización automática en DATEV: categorización de asientos en los planes SKR03 y SKR04, incluyendo el tratamiento del límite del 70 % en gastos de restauración, para integrarse en flujos de exportación DATEV EXTF 700.
- Pre-auditoría GoBD de facturas recibidas: revisión previa de facturas entrantes para detectar defectos formales que pongan en riesgo el Vorsteuerabzug, ejecutable localmente en el servidor de la asesoría.
- Gestión de reclamaciones de pago: generación de cartas de Mahnwesen en tres niveles a partir de los datos de la factura y del estado de pago, con el tono formal requerido en el ámbito alemán.
- Despliegue en infraestructura mínima: ejecución en VPS de 1 GB de RAM, Cloud Run o contenedores edge de bajo coste, lo que permite ofrecer procesamiento de facturas con latencia inferior al segundo en entornos con recursos limitados.
- Formalización de descripciones de líneas de factura: transformación de notas internas informales en textos de posición auditables y conformes con los requisitos de GoBD antes de emitir la factura.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| E-Rechnung XRechnung 3.0 & DATEV SKR (audit benchmark del autor) | 100,0 % pass, grado A+ | Benchmark de dominio declarado por el autor; no se detalla el conjunto de evaluación ni el número de casos |
| Inferencia (Apple Silicon Metal) | 120+ tokens/s; ~0,7 s por consulta | Dato declarado por el autor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,0 GB de RAM con la cuantización GGUF Q4_K_M (fichero de ~940 MB).
- GPU recomendadas: no se especifican modelos concretos; el autor cita Apple Silicon con Metal como plataforma de referencia para las cifras de velocidad.
- Cabe en GPU de consumo: sí, por su tamaño reducido (1,5B parámetros en Q4_K_M); no se detallan modelos concretos de GPU.
- Opciones de despliegue: Ollama (flujo documentado con Modelfile), llama.cpp (formato GGUF), servidor compatible con la API de Ollama (endpoint `/api/chat`); vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: más de 120 tokens/s y aproximadamente 0,7 s por consulta en Apple Silicon Metal, según el autor.
- Entornos objetivo: VPS de 1 GB, Cloud Run y contenedores edge de bajo coste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rechly-DE-1.5B | 1,5B | no disponible | Contabilidad y facturación alemana | Apache 2.0 | HuggingFace (GGUF) |
| Rechly-DE-3B | 3B | no disponible | Contabilidad y facturación alemana (gama alta de la familia) | Apache 2.0 (segun model card) | HuggingFace |
| Rechly-DE-0.5B | 0,5B | no disponible | Contabilidad y facturación alemana (edge) | Apache 2.0 (segun model card) | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | Modelo generalista multilingüe | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación con alternativas generalistas del mismo tamaño (por ejemplo, otros SLM de 1-2B) no está disponible.

## Limitaciones y advertencias

- El benchmark de dominio del 100 % (grado A+) es una métrica declarada por el autor; no se detalla el conjunto de evaluación, el número de casos ni la metodología, por lo que no debe tomarse como validación independiente.
- El modelo está especializado en un dominio muy concreto (contabilidad alemana); su rendimiento en tareas generales queda limitado por el ajuste fino y por el tamaño de 1,5B parámetros del modelo base.
- Idiomas soportados: únicamente alemán e inglés; no se garantiza un comportamiento correcto en castellano u otras lenguas.
- Riesgo de alucinación en la extracción de datos fiscales: aunque la salida sea JSON estricto, los valores extraídos deben validarse contra la factura original antes de su uso contable.
- La información disponible no detalla el contexto máximo soportado, lo que limita la planificación de casos con documentos largos.
- Aunque la licencia es Apache 2.0, el uso en producción contable exige validación humana y cumplimiento de las obligaciones legales alemanas (GoBD, UStG); el modelo no sustituye la revisión de un profesional.
- No se documentan sesgos conocidos ni evaluaciones de robustez más allá del benchmark de dominio del autor.
- El número de descargas y likes en HuggingFace es cero en la fecha de consulta, lo que indica una adopción aún muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonprompter/rechly-de-1.5b
- Repositorio GitHub: https://github.com/myaxyo/rechly_llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo hermano 3B: https://huggingface.co/jonprompter/rechly-de-3b
- Modelo hermano 0.5B: https://huggingface.co/jonprompter/rechly-de-0.5b
- Sitio del equipo: https://rechly.de
