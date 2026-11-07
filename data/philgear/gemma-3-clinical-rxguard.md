# philgear/gemma-3-clinical-rxguard

## Resumen

PocketGull Gemma 3 RxGuard & PGx Interaction Screener es un adaptador LoRA (PEFT) construido sobre el modelo base `google/gemma-3-4b-it`, desarrollado por Phillip Gear / PocketGull LLC. Su propósito declarado es el cribado de interacciones farmacológicas mediadas por enzimas del citocromo P450 (CYP2D6, CYP2C19) y el transportador SLCO1B1, tanto para fármacos alopáticos como para suplementos botánicos. El adaptador se ha afinado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos desidentificados según el estándar HIPAA §164.514 Safe Harbor.

El modelo hereda la arquitectura, el tamaño (4B parámetros) y la ventana de contexto de Gemma 3 4B IT, por lo que se presenta como una solución ligera desplegable en entornos de borde o GPU de consumo. No obstante, la información publicada sobre el adaptador es muy escasa: no se detalla el volumen de datos de entrenamiento, la composición exacta del dataset, hiperparámetros del LoRA ni resultados de evaluación.

La relevancia del modelo radica en su nicho: la farmacogenómica aplicada a la práctica clínica y a la seguridad del paciente, con un enfoque explícito en privacidad (cero retención de PHI) y en su uso como herramienta de soporte a la decisión clínica no clasificada como dispositivo médico (FDA 520(o)). Aun así, su adopción en producción requeriría validación independiente, dado que no se han publicado métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Gemma 3 4B IT) |
| Parametros totales | 4B (modelo base; parámetros del adaptador no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Gemma 3 4B IT; no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT/LoRA (compatible con safetensors vía PEFT); pesos del modelo base no incluidos |

## Arquitectura y entrenamiento

El adaptador se implementa como LoRA sobre `google/gemma-3-4b-it`, un transformer decoder-only de 4B parámetros. La model card indica que el ajuste fino se realizó mediante Direct Preference Optimization (DPO) sobre datasets clínicos específicos del dominio, desidentificados conforme a HIPAA §164.514 Safe Harbor. No se especifican el número de tokens de entrenamiento, la composición del dataset, la configuración del LoRA (rango, alpha, módulos objetivo) ni los hiperparámetros de DPO.

La innovación declarada no es arquitectónica sino de dominio y gobernanza: el adaptador incorpora conocimiento orientado al cribado de interacciones farmacogenómicas (CYP2D6, CYP2C19, SLCO1B1) y está diseñado para ejecución local en el borde o en despliegues privados de Google Cloud Vertex AI, con el objetivo de evitar la retención de información de salud protegida (PHI).

## Capacidades

- Generación de texto especializada en farmacogenómica y cribado de interacciones fármaco-fármaco y fármaco-herbolario.
- Razonamiento sobre vías metabólicas del citocromo P450 (CYP2D6, CYP2C19) y del transportador SLCO1B1.
- Evaluación de interacciones con suplementos botánicos (por ejemplo, hierba de San Juan) junto con fármacos como warfarina o simvastatina.
- Soporte de inferencia mediante Transformers + PEFT, con cuantización a bfloat16 en el ejemplo de la model card.
- Capacidades del modelo base Gemma 3 4B IT heredadas (generación de texto e instrucciones), aunque no se documenta explícitamente su preservación tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Cribado de interacciones farmacológicas en consulta: el modelo puede recibir un listado de medicación y suplementos de un paciente y generar una evaluación de riesgo metabólico vía CYP2D6, CYP2C19 y SLCO1B1, sirviendo como apoyo al farmacéutico o al clínico antes de prescribir.
- Revisión de polifarmacia en pacientes mayores: dado un régimen con múltiples fármacos, el adaptador puede señalar combinaciones con riesgo de inhibición o inducción enzimática, ayudando a priorizar revisiones manuales.
- Detección de interacciones fármaco-herbolario: útil en entornos donde el paciente consume suplementos no declarados en la historia clínica electrónica; el modelo evalúa el impacto de productos como la hierba de San Juan sobre anticoagulantes o estatinas.
- Despliegue en entornos con requisitos de privacidad: al ser un adaptador ligero sobre un modelo de 4B, puede ejecutarse localmente en infraestructura propia o en Vertex AI con retención cero de PHI, lo que facilita el cumplimiento de HIPAA en organizaciones sanitarias.
- Generación de borradores de notas de soporte farmacogenómico: el modelo puede producir texto explicativo estructurado sobre el fundamento metabólico de una interacción, que el profesional revisa y firma.
- Formación y simulación clínica: puede emplearse en escenarios docentes para generar casos de interacciones farmacogenómicas y respuestas razonadas, siempre con supervisión y sin datos reales de pacientes.
- Integración en pipelines de investigación traslacional: como componente de extracción y razonamiento en flujos que procesan literatura o datos desidentificados sobre variantes CYP y SLCO1B1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B parámetros en bfloat16 requiere aproximadamente 8-10 GB de VRAM; en cuantización de 4 bits podría situarse en torno a 3-4 GB, aunque no se documentan cuantizaciones oficiales del adaptador.
- GPU recomendadas: A100, H100 o L4 para despliegues en servidor; RTX 4090, RTX 3090 o RTX 4080 para estaciones de trabajo.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en bfloat16, y en tarjetas de 6-8 GB con cuantización, si bien no se aportan mediciones oficiales.
- Opciones de despliegue: Transformers + PEFT (documentado en la model card), Google Cloud Vertex AI (mencionado por el autor). vLLM, llama.cpp, Ollama o TGI no se documentan para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| philgear/gemma-3-clinical-rxguard | 4B (base) + LoRA | No disponible | Farmacogenómica (CYP2D6, CYP2C19, SLCO1B1) | Apache 2.0 | Hugging Face |
| google/gemma-3-4b-it | 4B | No especificado en la información disponible | Propósito general, instrucciones | Gemma Terms of Use | Hugging Face, Vertex AI |
| Adaptadores clínicos genéricos sobre Gemma | Variable | Variable | Clínica general | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones clínicas del adaptador; su eficacia y seguridad no están validadas de forma independiente.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar interacciones o mecanismos metabólicos plausibles pero incorrectos, con consecuencias potencialmente graves en contexto clínico.
- El modelo se declara como herramienta de soporte a profesionales sanitarios licenciados y no como dispositivo médico (FDA 520(o) Non-Device CDS); no debe usarse para decisiones autónomas de prescripción.
- Idiomas soportados limitados al inglés, lo que restringe su uso directo en entornos hispanohablantes.
- No se detalla la composición del dataset de entrenamiento ni su cobertura, por lo que se desconoce el sesgo demográfico y farmacológico del adaptador.
- La licencia Apache 2.0 del adaptador no exime del cumplimiento de los términos de uso del modelo base Gemma 3, que deben respetarse en cualquier despliegue comercial.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan cuantizaciones oficiales ni soporte para motores de inferencia de alto rendimiento como vLLM o TGI, lo que limita el despliegue a gran escala sin trabajo adicional.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/philgear/gemma-3-clinical-rxguard
- Perfil del autor en Hugging Face: https://huggingface.co/philgear
- Modelo base Gemma 3 4B IT: https://huggingface.co/google/gemma-3-4b-it
- Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 en Vertex AI (blog de Google Cloud): https://cloud.google.com/blog/products/ai-machine-learning/announcing-gemma-3-on-vertex-ai/
- DOI Zenodo de procedencia: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio de PocketGull: https://pocketgull.com
- Aplicación PocketGull: https://pocketgull.app
