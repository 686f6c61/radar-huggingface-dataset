# santosh07401/krishi-sathi-gemma-1b

## Resumen

Krishi Sathi 1B (Gemma) es un modelo de lenguaje especializado en asistencia agrícola para la región de Karnataka (India), desarrollado por el usuario de Hugging Face santosh07401. Está construido mediante un fine-tuning LoRA sobre el modelo base `google/gemma-3-1b-it`, fusionado posteriormente, y está diseñado para ejecutarse de forma totalmente offline en teléfonos Android de gama baja. El modelo responde en kannada (ಕನ್ನಡ) e inglés, y su objetivo principal es ofrecer recomendaciones agronómicas, asesoramiento sobre cultivos, y orientación sobre prácticas agrícolas, siempre con una postura de honestidad frente a datos en tiempo real (precios, clima, estado de esquemas) que no puede verificar.

La versión cuantizada Q4_K_M ocupa aproximadamente 814 MB y es la más pequeña y comercialmente utilizable de la familia Krishi Sathi, lo que la hace adecuada para dispositivos con 3 GB de RAM. El entrenamiento se basó en un conjunto de datos de consultas reales del Kisan Call Centre (KCC) de Karnataka, junto con material agronómico general y ejemplos de comportamiento "offline-honesty" para evitar inventar información no disponible. El modelo está pensado para ser integrado en aplicaciones móviles de asistencia al agricultor, con una tabla de dosis complementaria para verificar las recomendaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en `google/gemma-3-1b-it`) |
| Parametros totales | 999.885.952 (≈1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~814 MB) |
| Idiomas soportados | Kannada (kn), Inglés (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors (modelo base) y GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA del transformer decoder-only `google/gemma-3-1b-it`, un modelo de lenguaje de 1B parámetros con atención causal. El fine-tune se realizó sobre un conjunto de datos específico para el dominio agrícola de Karnataka, y posteriormente se fusionaron los pesos LoRA con los del modelo base. No se proporcionan detalles sobre el número de capas, dimensión de la atención ni otras características arquitectónicas internas.

Los datos de entrenamiento incluyen:
1. **Consultas del Kisan Call Centre (KCC) de Karnataka**: aproximadamente 2.900 grupos de consultas con frecuencia ponderada, destiladas de ~42.000 llamadas reales de agricultores (2009–2023). Las notas del operador fueron reescritas en respuestas fundamentadas por el modelo `gemma-3-27b-it`, preservando las dosis originales.
2. **Preguntas agronómicas generales adaptadas a India**: material filtrado de KisanVaani, reescrito por un profesor (teacher-rewritten).
3. **~1.650 ejemplos de «offline-honesty»**: el modelo aprende a rechazar preguntas sobre datos en tiempo real (precios, clima, estado de esquemas) y a referir a canales oficiales como e-NAM/APMC, Meghdoot/IMD y Raitha Samparka Kendra. Los datos se descontaminaron para eliminar cualquier ejemplo que declarara precios de mercado actuales.
4. **Datos en Kannada**: traducidos con IndicTrans2 (rotary en-indic-1B).

No se menciona el uso de RLHF o DPO; el enfoque es un fine-tune supervisado con reescritura de respuestas.

## Capacidades

- **Generación de texto en inglés y kannada** en el dominio agrícola: recomendaciones de cultivos, manejo de plagas, fertilización, calendario de siembra, etc.
- **Rechazo explícito de preguntas sobre datos en tiempo real** (precios de mercado, condiciones meteorológicas, estado de esquemas gubernamentales), derivando al usuario a canales oficiales.
- **Respuestas concisas y estructuradas** sin degeneración por repetición, según la evaluación del autor.
- **Capacidad de diálogo multi-turno** con el formato de chat Gemma (`<start_of_turn>user … <end_of_turn>`).
- **No soporta tool calling**, ni agentes, ni razonamiento multi-paso, ni capacidades multimodales (visión, audio).
- **Limitación en Kannada**: la fluidez es inferior a la variante Sarvam-2B, con posibles glitches de caracteres en escritura extranjera y confusiones factuales en diagnóstico de enfermedades.

## Casos de uso

- **Asistente agrícola offline en teléfonos Android**: el modelo cabe en 3 GB de RAM y puede ejecutarse localmente, lo que permite a los agricultores de Karnataka obtener recomendaciones sin conexión a internet.
- **Consultas sobre cultivos específicos**: el modelo responde preguntas sobre siembra, riego, fertilización y manejo de plagas basándose en el conocimiento agronómico del KCC.
- **Diagnóstico de enfermedades de plantas**: aunque con limitaciones en Kannada, puede ayudar a identificar síntomas y sugerir tratamientos (siempre con la advertencia de verificar con expertos).
- **Orientación sobre dosificación de productos químicos**: el modelo genera explicaciones, pero la dosis debe verificarse con la tabla `dosage_table.json` incluida en el repositorio.
- **Educación y divulgación agrícola**: puede integrarse en aplicaciones de formación para agricultores, ofreciendo contenido en inglés y kannada.
- **Atención al cliente en cooperativas y centros de extensión**: el modelo puede responder consultas frecuentes, reduciendo la carga de trabajo de los agentes humanos, siempre que se valide la información antes de mostrarla al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una evaluación cualitativa: "respuestas concisas y bien estructuradas", "sin degeneración de repetición" y "el inglés es el más fuerte de la familia", pero no se aportan métricas numéricas (MMLU, HumanEval, etc.). No se dispone de datos de comparación con otros modelos.

## Requisitos de hardware

- **Inferencia en CPU**: el modelo cuantizado Q4_K_M (~814 MB) puede ejecutarse en CPU, en teléfonos con 3 GB de RAM, según el autor. Es adecuado para dispositivos Android de gama baja.
- **GPU**: no se requiere GPU para la inferencia; para una GPU dedicada, una tarjeta con 1-2 GB de VRAM sería suficiente (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.), aunque no se han publicado datos específicos de latencia o throughput.
- **Opciones de despliegue**: se menciona el uso de Ollama (ver `Modelfile` en el repositorio) y llama.cpp para la cuantización GGUF. También es compatible con vLLM o TGI si se usa el modelo safetensors, aunque no se especifica en la documentación.
- **Memoria**: se recomienda al menos 3 GB de RAM para el modelo cuantizado, y más para el modelo completo (2.8 GB de repo, pero el modelo safetensors pesa alrededor de 2 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **krishi-sathi-gemma-1b** | 1B | No disponible | Kannada, Inglés | Gemma | Hugging Face |
| **krishi-sathi-sarvam-2b** (variante de la familia) | 2B (según nombre) | No disponible | Kannada, Inglés | No comercial (investigación) | Hugging Face |
| **google/gemma-3-1b-it** (modelo base) | 1B | No disponible | Multilingüe (no específico) | Gemma | Google |

No se dispone de datos de rendimiento para comparar de forma cuantitativa. La variante Sarvam-2B se describe como «~4× más rápida en generación de Kannada» y con mayor fluidez, pero no se ofrecen números concretos. La comparación se limita a la información cualitativa de la model card.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: puede reproducir productos químicos antiguos cuya regulación ha cambiado (ej. Monocrotophos, prohibido para hortalizas en India). Se recomienda verificar siempre las dosis y productos con la etiqueta del producto y el centro local.
- **Riesgo de alucinación**: en Kannada, puede confundir diagnósticos de enfermedades o dar consejos de siembra imprecisos; también puede presentar glitches de caracteres de escritura extranjera.
- **No es un sustituto de expertos**: el modelo no debe reemplazar el diagnóstico de un agrónomo ni las recomendaciones oficiales del gobierno.
- **Restricciones de licencia**: la licencia Gemma impone términos de uso y una política de uso prohibido (Gemma Prohibited Use Policy). Es compatible con uso comercial, pero se deben cumplir las condiciones.
- **Limitaciones de contexto**: no se dispone de la longitud de contexto; el modelo está diseñado para conversaciones cortas de asistencia, no para documentos largos.
- **No soporta datos en tiempo real**: el modelo rechaza preguntas sobre precios, clima o estado de esquemas, y solo puede referir a canales oficiales; no debe usarse para información actualizada.
- **Diseño de aplicación**: la documentación recomienda no mostrar dosis generadas libremente sin la tabla de verificación `dosage_table.json`; el sistema debe combinar explicación del modelo con números verificados.

## Enlaces

- [Hugging Face - santosh07401/krishi-sathi-gemma-1b](https://huggingface.co/santosh07401/krishi-sathi-gemma-1b)
- [Modelo base - google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- [Variante Sarvam - santosh07401/krishi-sathi-sarvam-2b](https://huggingface.co/santosh07401/krishi-sathi-sarvam-2b)
- [Gemma - Google DeepMind](https://deepmind.google/models/gemma/)
- [Repositorio GitHub - Arpitsharmaaaaa/krishi-sathi](https://github.com/Arpitsharmaaaaa/krishi-sathi)
- [Repositorio GitHub - krmanish1/krishi-sathi-ai](https://github.com/krmanish1/krishi-sathi-ai)
