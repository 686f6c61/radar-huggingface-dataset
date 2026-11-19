# joaonovo/hfiap-qwen2.5-7b-clinical-lora

## Resumen

El modelo `joaonovo/hfiap-qwen2.5-7b-clinical-lora` es un adaptador PEFT de tipo QLoRA entrenado sobre el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`. Lo desarrolla João Novo en el marco del Tech Challenge de la Fase 3 de la Pós-Graduação FIAP (IA para DEVs) y su propósito es especializar un modelo de lenguaje de 7.000 millones de parámetros en razonamiento clínico estructurado en portugués de Brasil, orientado a un sistema de soporte a la decisión clínica (CDSS) hospitalario.

El adaptador no modifica los pesos del modelo base: se distribuye como un conjunto de matrices LoRA de bajo rango que se cargan sobre Qwen2.5-7B-Instruct ya cuantizado en 4 bits. Esto reduce el repositorio a unos 0,2 GB y permite entrenar e inferir en una única GPU de consumo (el autor reporta una RTX 4070 Ti con 12 GB de VRAM). El entrenamiento se apoya en un corpus de 1.560 muestras que combina PubMedQA traducido al portugués, protocolos clínicos institucionales y directrices de farmacovigilancia.

Su relevancia es doble: por un lado, demuestra un flujo completo de especialización domain-specific con recursos mínimos; por otro, documenta explícitamente las restricciones regulatorias del contexto brasileño (Resolução CFM nº 2.314/2022), que reserva la prescripción y el diagnóstico a médicos colegiados. Es, por tanto, un artefacto académico y demostrativo, no un componente listo para producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT / QLoRA sobre transformer decoder-only `Qwen2ForCausalLM` |
| Parametros totales | 7B en el modelo base; el adaptador LoRA ocupa 0,2 GB (r=16, alpha=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens durante el entrenamiento (`max_seq_length`); el contexto nativo del base Qwen2.5-7B-Instruct no se especifica en la informacion disponible |
| Tipos de cuantizacion | Base en 4-bit NormalFloat (NF4) via `bitsandbytes`; adaptador en safetensors (precision original del entrenamiento) |
| Idiomas soportados | Portugues de Brasil (`pt`); el base Qwen2.5 soporta multiples idiomas pero el adaptador esta especializado en `pt-BR` |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); el base se distribuye en formato `bnb-4bit` |
| Framework de entrenamiento | Unsloth AI (`FastLanguageModel`) + HuggingFace `Trainer` |
| Libreria de inferencia | `peft` 0.21.2 + `transformers` |
| Modulos LoRA objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar. La especialización se realiza mediante QLoRA: el modelo base se congela cuantizado en NF4 y se entrenan únicamente matrices de bajo rango (r=16, alpha=16, dropout 0) inyectadas en las siete proyecciones lineales del bloque (atención y MLP). El entrenamiento usó `adamw_8bit` con scheduler coseno, learning rate 5e-5, weight decay 0,01, batch efectivo de 4 (batch por dispositivo 1 con acumulación de gradiente de 4) y una única época completa de 351 pasos. Se aplicó *loss masking* exclusivo sobre la respuesta del asistente, de modo que el modelo aprende a generar la contestación clínica y no el contexto del usuario.

El corpus de entrenamiento consta de 1.560 muestras divididas en 1.404 de entrenamiento y 156 de validación. La composición es: 1.000 pares de pregunta-respuesta procedentes de PubMedQA traducidos al portugués de Brasil, 440 pares derivados de 110 protocolos clínicos institucionales (síntomas, exploraciones, conducta y contraindicaciones), 110 pares de razonamiento clínico conversacional estructurado por protocolo y 10 pares de farmacovigilancia sobre alergias medicamentosas y alternativas seguras. No se documenta en la información disponible el uso de RLHF, DPO ni preferencias humanas; el ajuste es puramente supervisado sobre pares de instrucción-respuesta. El autor reporta una pérdida final de entrenamiento de 0,6912 y una perplejidad de 1,996 sobre el conjunto de entrenamiento, métricas que no deben interpretarse como indicadores de calidad clínica.

## Capacidades

- Generación de texto conversacional en portugués de Brasil con registro clínico y estructura de razonamiento diagnóstico.
- Formulación de hipótesis diagnósticas condicionadas a la evidencia recuperada por RAG (protocolos hospitalarios, analíticas, informes de imagen).
- Correlación clínico-laboratorial: interpretación conjunta de síntomas, constantes y resultados analíticos.
- Alertas de contraindicaciones y de interacciones farmacológicas, incluida la detección de alergias medicamentosas y propuesta de alternativas.
- Sugerencia de conducta y de exploraciones complementarias, siempre condicionada a validación médica.
- Integración en pipelines con LangGraph y capas de guardrails para conformidad con la Resolução CFM nº 2.314/2022.
- Soporte de *chat template* de Qwen2.5 con rol de sistema para fijar el rol de asistente clínico.
- Capacidades del modelo base (código, matemáticas, tool calling, multilingüismo) potencialmente preservadas pero no validadas en este adaptador; la información disponible no documenta su comportamiento tras el ajuste.

## Casos de uso

- Soporte a la decisión clínica en entorno académico: el adaptador recibe un caso clínico sintético junto con fragmentos de protocolos recuperados por Qdrant y devuelve hipótesis diagnósticas y exploraciones sugeridas, con trazabilidad a la fuente documental. Adecuado porque el entrenamiento incluyó exactamente ese formato de razonamiento estructurado por protocolo.
- Asistente conversacional de triaje hospitalario: con la ventana de 1024 tokens del entrenamiento, gestiona diálogos de anamnesis acotados (motivo de consulta, antecedentes, constantes) y deriva al servicio correspondiente. Requiere truncado o resumen del histórico para no exceder el contexto de entrenamiento.
- Verificación de alergias y contraindicaciones en prescripción: dado un paciente con alergias registradas y una propuesta farmacológica, el modelo señala incompatibilidades y sugiere alternativas, apoyándose en las 10 muestras de farmacovigilancia y en los protocolos institucionales.
- Generación de resúmenes clínicos a partir de informes: el adaptador puede estructurar hallazgos de analíticas e informes de imagen en un resumen orientado a la historia clínica, siempre con revisión humana posterior.
- Docencia y simulación de casos: útil para generar escenarios clínicos con preguntas y respuestas razonadas en portugués, aprovechando el corpus PubMedQA traducido.
- Prototipado de pipelines RAG médicos: como componente generador dentro de un grafo LangGraph con recuperación vectorial y guardrails, permite validar la arquitectura completa de un CDSS antes de sustituir el generador por un modelo con validación regulatoria.
- Evaluación comparativa de técnicas de especialización: sirve como referencia reproducible de QLoRA con Unsloth sobre un corpus pequeño y domain-specific, útil para investigadores que estudian el efecto del ajuste con datos escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Loss final de entrenamiento | 0,6912 |
| Perplexidad de entrenamiento | 1,996 |
| Epocas | 1 |
| Pasos | 351 |
| Muestras de entrenamiento | 1.404 |
| Muestras de validacion | 156 |

No se reportan resultados en MMLU, HumanEval, GSM8K, MedQA, PubMedQA (evaluación) ni en conjuntos clínicos en portugués.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base cuantizado en 4 bits (NF4) ocupa aproximadamente 4-5 GB de pesos; con el adaptador, la caché KV y overhead de runtime, se recomienda un mínimo de 8 GB de VRAM para contexto corto (1024 tokens) y 12 GB para margen cómodo.
- GPU recomendadas: RTX 4070 Ti (12 GB, la usada por el autor para el entrenamiento), RTX 4080/4090 (16-24 GB), A100 40/80 GB y H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080 y RTX 4090, siempre con el base en 4 bits.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joaonovo/hfiap-qwen2.5-7b-clinical-lora` | 7B (adaptador LoRA) | 1024 tokens de entrenamiento | Clínica, portugues BR | no disponible | Hugging Face (0 descargas) |
| `Qwen/Qwen2.5-7B-Instruct` (base) | 7B | 32.768 tokens nativos (ampliable) | Generalista multilingue | Apache 2.0 (según el modelo base de Qwen) | Hugging Face, ampliamente usado |
| `BioMistral/BioMistral-7B` | 7B | 2.048-4.096 tokens (según variante) | Biomédica, multilingue | Apache 2.0 | Hugging Face |
| `epfl-llm/meditron-7b` | 7B | 4.096 tokens | Médica, inglés | Llama 2 (uso restringido) | Hugging Face |

La comparación con alternativas clínicas en portugués de Brasil no está disponible en la información proporcionada. Frente al base Qwen2.5-7B-Instruct, este adaptador gana especialización clínica en `pt-BR` a costa de un contexto de entrenamiento mucho menor (1024 frente a 32.768 tokens) y de una licencia no declarada.

## Limitaciones y advertencias

- No apto para uso clínico asistencial real: el autor lo declara explícitamente fuera de alcance sin validación científica, aprobación regulatoria y supervisión médica presencial.
- Prohibición de prescripción autónoma: conforme a la Resolução CFM nº 2.314/2022, el diagnóstico y la prescripción son competencia exclusiva de médicos colegiados; el modelo solo puede sugerir condicionado a validación humana.
- Riesgo de alucinación: al ser un modelo de 7B cuantizado en 4 bits y entrenado con solo 1.560 muestras, puede inventar hallazgos, dosis o interacciones cuando opera sin contexto RAG o sin guardrails externos.
- Contexto efectivo limitado: el entrenamiento se realizó con `max_seq_length=1024`, por lo que el rendimiento decae previsiblemente con prompts más largos aunque el base soporte ventanas mayores.
- Cobertura de datos estrecha: 110 protocolos institucionales y 10 muestras de farmacovigilancia implican un sesgo fuerte hacia el hospital de origen y una cobertura farmacológica muy limitada.
- Sesgos de idioma y dominio: especializado en `pt-BR` clínico; su comportamiento en portugués europeo, español u otros dominios no está evaluado.
- Licencia no disponible: la ausencia de licencia declarada impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- Métricas de entrenamiento no extrapolables: la pérdida de 0,6912 y la perplejidad de 1,996 son sobre el propio conjunto de entrenamiento y no constituyen evidencia de calidad clínica ni de generalización.
- Sin benchmarks publicados: no hay evaluación en MedQA, PubMedQA de test ni conjuntos clínicos en portugués, lo que impide comparar su rendimiento con alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente ni de replicación de resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joaonovo/hfiap-qwen2.5-7b-clinical-lora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio del proyecto: https://github.com/joaonovo/FIAP_10IADT-tech_challenge_fase_3
- Unsloth AI: https://github.com/unslothai/unsloth
- PEFT (Hugging Face): https://github.com/huggingface/peft
- Qwen2.5 (familia de modelos): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Resolução CFM nº 2.314/2022: https://sistemas.cfm.org.br/normas/visualizar/resolucoes/BR/2022/2314
