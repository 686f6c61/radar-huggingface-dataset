# Rumiii/Muse-Glimmer-30B-FinanceIND

## Resumen

Muse-Glimmer-30B-FinanceIND es un ajuste fino (fine-tune) del modelo multimodal Muse Glimmer 30B de Meta, especializado en asistencia financiera personal para el mercado indio. Lo desarrolla el usuario Rumiii y cubre dominios concretos como planes de inversión sistemática (SIP), planificación fiscal (regímenes antiguo y nuevo, secciones 80C y 80D, HRA), préstamos y EMIs, fondos de emergencia y planificación de objetivos. El modelo conserva la naturaleza image-text-to-text del modelo base, aunque su entrenamiento se ha centrado en conversación financiera y uso de herramientas.

La arquitectura subyacente es la del modelo base Muse Glimmer 30B, un transformer de aproximadamente 29.780 millones de parámetros (29,78 B), con capacidades de tool calling y razonamiento agéntico que el fine-tune refuerza explícitamente mediante ejemplos de fallo y reintento de herramientas. El ajuste se realizó con QLoRA (r=32, alpha=32) durante una época sobre un dataset sintético filtrado por calidad, y los pesos resultantes se fusionaron en BF16, dando lugar a un repositorio de 59,6 GB.

Su relevancia actual radica en que aborda un nicho poco cubierto por los modelos generalistas: la normativa fiscal y financiera india, con soporte bilingüe inglés-hindi y un comportamiento orientado a la seguridad (rechazo de evasión fiscal y de promesas de rentabilidad garantizada). La licencia Apache 2.0 facilita su integración en productos comerciales, siempre que se validen las cifras y la normativa vigente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Muse Glimmer 30B de Meta |
| Parámetros totales | 29.776.626.688 (29,78 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de uso emplea `max_seq_length=8192` |
| Tipos de cuantización | BF16 (pesos fusionados); 4-bit (ejemplo oficial con Unsloth); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) e hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Muse Glimmer 30B, un transformer multimodal de Meta con pipeline image-text-to-text, y hereda su mecánica de atención y su tokenizador. Sobre esa base se aplicó un ajuste supervisado con QLoRA de rango 32 y alpha 32 durante una sola época, sin truncamiento de secuencias, calculando la pérdida únicamente sobre los turnos del asistente. Posteriormente, los adaptadores se fusionaron en pesos BF16, lo que explica el tamaño del repositorio (59,6 GB) frente a los aproximadamente 55 GB que el autor atribuye a los pesos BF16.

Los datos de entrenamiento provienen del dataset sintético `Gandalf1/indian-finance-synthetic-phase2-cleaned`, filtrado por calidad, complementado con ejemplos generados de conversación, identidad y fallo/reintento de herramientas. No se documenta el volumen total de tokens ni si hubo fases de RLHF o DPO. La innovación principal no es arquitectónica sino de comportamiento: el modelo aprende a invocar herramientas de cálculo para obtener cifras exactas y a recuperarse de errores de tool calling, además de gestionar perfiles de usuario inyectados en el system prompt.

## Capacidades

- Generación de texto conversacional en inglés e hindi, con registro de asesor financiero personal.
- Razonamiento financiero aplicado: SIP, planificación fiscal (régimen antiguo y nuevo, 80C, 80D, HRA), préstamos y EMIs, fondos de emergencia y planificación de objetivos.
- Tool calling / function calling para cálculos exactos, con reintento cuando una llamada falla.
- Comportamiento agéntico de varios pasos: pide aclaraciones cuando faltan datos y personaliza la respuesta si recibe un perfil de usuario en el system prompt.
- Capacidades multimodales heredadas del modelo base (image-text-to-text), aunque no se detalla su rendimiento tras el fine-tune.
- Salvaguardas explícitas: rechaza solicitudes de evasión fiscal y de rentabilidades garantizadas, y declara cuando no dispone de datos de mercado en vivo.
- Gestión de identidad y presentación de capacidades al inicio de la conversación.

## Casos de uso

- Asistente de planificación fiscal: el modelo compara el régimen fiscal antiguo y el nuevo, calcula deducciones de 80C y 80D y estima el impacto del HRA, invocando herramientas para las cifras. Es adecuado por su entrenamiento específico en FY 2024-25, aunque exige validación contra la normativa vigente.
- Calculadora de SIP y proyecciones de inversión: ante una consulta de inversión mensual, el modelo llama a herramientas de cálculo para estimar aportaciones y rentabilidades y explica los supuestos en inglés o hindi.
- Simulador de préstamos y EMIs: calcula cuotas, intereses totales y plazos a partir de principal, tipo y duración, con reintento automático si la herramienta devuelve error.
- Atención al cliente de una fintech india: gestiona conversaciones multi-turno bilingües, pide los datos que faltan y mantiene el tono educativo, integrándose en un backend que inyecte el perfil del usuario en el system prompt.
- Planificación de objetivos y fondo de emergencia: ayuda a definir metas de ahorro y a dimensionar un colchón financiero, desglosando pasos concretos y usando herramientas para los importes.
- Agente de onboarding financiero: explica al usuario qué puede hacer el asistente, recoge su perfil y deriva a cálculos especializados, con rechazo explícito de peticiones fraudulentas o de rentabilidad garantizada.
- Despliegue en GPU de consumo: gracias al ejemplo oficial de carga en 4-bit con Unsloth, puede ejecutarse en GPUs de 24-40 GB para prototipos y demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos BF16: aproximadamente 55 GB según el autor (repositorio de 59,6 GB), lo que requiere GPUs de 80 GB (A100 80GB, H100) para inferencia cómoda.
- Carga en 4-bit: el autor indica que cabe en GPUs de 24-40 GB (por ejemplo, RTX 4090 de 24 GB, A6000 de 48 GB, L40S de 48 GB), usando Unsloth con `load_in_4bit=True`.
- GPU de consumo: sí, en 4-bit en una RTX 4090 (24 GB); en BF16 no cabe en GPUs de consumo.
- Opciones de despliegue: transformers y Unsloth (documentados); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-FinanceIND | 29,78 B | no disponible | Finanzas personales India, en/hi, tool calling | Apache 2.0 | Hugging Face (99 descargas) |
| Muse Glimmer 30B (base) | 30 B (aprox.) | no disponible | Multimodal generalista | Apache 2.0 | Hugging Face (meta-models) |
| Alternativas financieras de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros fine-tunes financieros comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Las reglas fiscales de los datos de entrenamiento corresponden al ejercicio FY 2024-25; la Income-tax Act de 2025 entra en vigor el 1 de abril de 2026, por lo que las cifras y normas pueden quedar obsoletas y deben verificarse.
- Es orientación educativa, no asesoramiento financiero o fiscal regulado.
- No dispone de datos de mercado en vivo ni recuerda al usuario entre conversaciones salvo que la aplicación inyecte su perfil.
- El dataset de entrenamiento es sintético y puede contener errores; los números importantes requieren verificación.
- Riesgo de alucinación en cálculos si el modelo no invoca la herramienta correspondiente o si esta falla de forma no recuperable.
- Cobertura lingüística limitada a inglés e hindi; el rendimiento en otros idiomas, incluido el castellano, no está documentado.
- Aunque la licencia Apache 2.0 permite uso comercial, la responsabilidad sobre el cumplimiento normativo y la exactitud de las recomendaciones recae en el integrador.
- No se documentan evaluaciones de sesgo ni de seguridad más allá de los rechazos mencionados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rumiii/Muse-Glimmer-30B-FinanceIND
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Dataset de entrenamiento: https://huggingface.co/datasets/Gandalf1/indian-finance-synthetic-phase2-cleaned
- Imagen de presentación: https://cdn-uploads.huggingface.co/production/uploads/66e00ba55e4fd4bfead4a97c/9Lkn4VPyvle9XGbdRLMjR.png
