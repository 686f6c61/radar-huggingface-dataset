# Drfrodik/gemma2-9b-id-guidelines-lora

## Resumen

`Drfrodik/gemma2-9b-id-guidelines-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `google/gemma-2-9b-it`. Lo desarrolla Dr. Sahib Aghakishiyev bajo el identificador de Hugging Face `Drfrodik`, y su objetivo es especializar el modelo base en enfermedades infecciosas, administración de antimicrobianos (antimicrobial stewardship) y guías clínicas, con especial énfasis en el idioma azerbaiyano.

El adaptador se distribuye como un repositorio PEFT de aproximadamente 0,1 GB, lo que corresponde a los pesos del adaptador y no al modelo completo. El modelo base Gemma 2 9B es un transformer denso de 9.000 millones de parámetros desarrollado por Google DeepMind, con una ventana de contexto de 8.192 tokens. El adaptador añade capacidades específicas de dominio clínico sin modificar los pesos originales, lo que permite cargarlo y descargarlo de forma modular.

La relevancia actual del modelo radica en su enfoque de nicho: combina terminología médica profesional en azerbaiyano con protocolos internacionales (IDSA, ESCMID, Surviving Sepsis Campaign), un ámbito donde los modelos generalistas suelen producir calcos del turco o del ruso. No obstante, se trata de un adaptador con cero descargas y cero likes en el momento de redactar esta ficha, y su validación se limita a métricas de pérdida de entrenamiento, sin benchmarks clínicos independientes publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso decoder-only (Gemma 2 9B) |
| Parametros totales | No disponible (el adaptador LoRA no declara su rango ni el número de parámetros entrenables; el modelo base tiene 9.000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base `google/gemma-2-9b-it`) |
| Tipos de cuantizacion | El adaptador se puede combinar con el modelo base cuantizado en 4 bits (BitsAndBytes NF4) según el ejemplo de la model card; no se declaran otras cuantizaciones propias |
| Idiomas soportados | Azerbaiyano (az) e inglés (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `google/gemma-2-9b-it`, un transformer decoder-only denso con atención multi-cabeza, RoPE y ventana de contexto de 8.192 tokens. El adaptador en sí es un módulo LoRA de bajo rango que se inyecta en las capas del modelo base; la model card no especifica el rango (`r`), el `alpha` ni las capas objetivo del adaptador.

El entrenamiento consistió en una época completa sobre 4.732 conversaciones clínicas de enfermedades infecciosas y administración de antimicrobianos en formato ChatML, con acumulación de gradientes de 8 (aproximadamente 592 pasos de optimizador). El checkpoint seleccionado es el paso 450. Las métricas declaradas son: mejor `eval_loss` de 0,9069 (estable entre 0,90 y 0,92 en los pasos 200-450), pérdida final de entrenamiento de 0,7153 y precisión de predicción de tokens del 81,93 %. El entrenamiento se realizó en una GPU Tesla T4 con precisión FP32 en los gradientes para estabilidad numérica. No se documenta el uso de RLHF ni DPO, ni la composición detallada del dataset más allá del número de conversaciones y las guías de referencia (IDSA, ESCMID, Surviving Sepsis Campaign 2026).

## Capacidades

- Generación de texto clínico en azerbaiyano e inglés, con vocabulario médico profesional y evitando calcos del turco y del ruso.
- Propuesta de regímenes antimicrobianos empíricos y dirigidos: sepsis, neutropenia febril, endocarditis infecciosa, infecciones del sistema nervioso central, intraabdominales, pie diabético y neumonía asociada a ventilación mecánica.
- Ajuste de dosis por función renal y orgánica: protocolos basados en CrCl/eGFR (Cockcroft-Gault), hemodiálisis intermitente (IHD) y terapia de reemplazo renal continuo (CRRT).
- Protocolos de seguridad y diagnóstico: desescalada antimicrobiana a las 48-72 horas, momento de extracción de hemocultivos, manejo de alergia a betalactámicos y monitorización terapéutica de fármacos (TDM de vancomicina, voriconazol y aminoglucósidos).
- Conversación multi-turno en formato ChatML.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte explícito de agentes ni de razonamiento multi-paso más allá del que aporta el modelo base.
- No se declara capacidad de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Consulta clínica de apoyo a la prescripción antimicrobiana: el modelo puede recibir un caso clínico en azerbaiyano (por ejemplo, fiebre y fístula de LCR tras microdiscectomía L4-L5) y devolver un régimen empírico con ajuste renal, como se muestra en el ejemplo de la model card.
- Formación médica en azerbaiyano: generación de casos clínicos y explicaciones de guías IDSA/ESCMID para residentes, aprovechando el vocabulario médico nativo y la ventana de 8.192 tokens para incluir historiales completos.
- Soporte a la desescalada antimicrobiana: dado un cultivo y un antibiograma, el modelo puede proponer la reducción del espectro a las 48-72 horas y justificar la decisión según las guías de referencia.
- Cálculo de dosis en insuficiencia renal: consultas sobre ajuste de vancomicina o aminoglucósidos en pacientes con CrCl reducido, en hemodiálisis intermitente o en CRRT, con el protocolo correspondiente.
- Documentación clínica bilingüe: traducción y redacción de notas de stewardship entre inglés y azerbaiyano manteniendo terminología técnica, útil en hospitales con documentación en ambos idiomas.
- Asistente de farmacia hospitalaria: consultas sobre monitorización terapéutica de fármacos (TDM), tiempos de extracción de niveles y manejo de alergias a betalactámicos.
- Integración en pipelines de transformers: al ser un adaptador PEFT, se puede cargar sobre el modelo base cuantizado en 4 bits en una GPU de consumo para prototipos de asistencia clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: mejor `eval_loss` de 0,9069, pérdida final de entrenamiento de 0,7153 y precisión de predicción de tokens del 81,93 %. No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones clínicas independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa aproximadamente 0,1 GB; el modelo base en FP16 requiere unos 18 GB de VRAM, y en cuantización 4 bits (NF4, como en el ejemplo de la model card) unos 6-7 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para FP16 o 8 bits.
- GPU de consumo: cabe en GPUs de 8 GB o más con cuantización 4 bits (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 3070), siempre que se cargue el adaptador sobre el modelo base cuantizado.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), vLLM (requiere fusionar el adaptador con el modelo base), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF), TGI (requiere fusionar el adaptador).
- Latencia y throughput: no disponibles. El entrenamiento se realizó en una Tesla T4, pero no se documentan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drfrodik/gemma2-9b-id-guidelines-lora | 9B (base) + adaptador LoRA | 8.192 | Enfermedades infecciosas y stewardship en azerbaiyano/inglés | Gemma | Hugging Face (0 descargas) |
| google/gemma-2-9b-it | 9B | 8.192 | Generalista, multilingüe | Gemma | Hugging Face (ampliamente usado) |
| Meditron-7B (EPFL) | 7B | 4.096 (Llama 2 base) | Médico generalista en inglés | Llama 2 | Hugging Face |
| BioMistral-7B | 7B | 8.192 (Mistral base) | Biomédico en inglés | Apache 2.0 | Hugging Face |

La comparación con Meditron-7B y BioMistral-7B es aproximada: ambos son modelos médicos generalistas en inglés, mientras que este adaptador está especializado en enfermedades infecciosas y en azerbaiyano, un nicho no cubierto por las alternativas citadas. No se dispone de benchmarks comparativos directos.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card no declara validación regulatoria ni clínica; las recomendaciones generadas no deben usarse como única base para decisiones terapéuticas.
- Riesgo de alucinación: con una `eval_loss` de 0,9069 y sin evaluaciones clínicas independientes, el modelo puede generar regímenes, dosis o protocolos plausibles pero incorrectos.
- Sesgo de dominio y de idioma: entrenado con 4.732 conversaciones y con foco en azerbaiyano; el rendimiento en otros idiomas distintos del inglés y el azerbaiyano no está documentado.
- Cobertura limitada de guías: las guías de referencia son IDSA, ESCMID y Surviving Sepsis Campaign 2026; otras sociedades o contextos locales pueden no estar representados.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; debe revisarse antes de un despliegue en producción.
- Dependencia del modelo base: el adaptador requiere cargar `google/gemma-2-9b-it`, con sus propios requisitos de hardware y licencia.
- Sin mantenimiento demostrado: cero descargas y cero likes en el momento de la ficha, sin issues ni discusión pública sobre su comportamiento en producción.
- Contexto de 8.192 tokens: historiales clínicos largos o múltiples documentos de guías pueden exceder la ventana y requerir truncamiento o fragmentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Drfrodik/gemma2-9b-id-guidelines-lora
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Documentación de PEFT: https://huggingface.co/docs/peft
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- IDSA (Infectious Diseases Society of America): https://www.idsociety.org/
- ESCMID (European Society of Clinical Microbiology and Infectious Diseases): https://www.escmid.org/
- Surviving Sepsis Campaign: https://www.sccm.org/survivingsepsiscampaign
