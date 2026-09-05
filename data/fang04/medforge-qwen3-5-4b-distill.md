# fang04/medforge-qwen3.5-4b-distill

, la última línea del asistente "答案:X" coincide con el formato de evaluación.
- Framework ms-swift 4.5.2 · RTX 5090 single card.
- Teacher output license: DeepSeek permite entrenar otros modelos con sus outputs.

Benchmarks (protocolo v3: parámetros oficiales de muestreo · presupuesto 32768 · guardia de truncamiento · criterio estricto = escribir ∧ tener conclusión ∧ responder correctamente; mismas preguntas emparejadas):

| Modelo | CMExam n=2000 (in-domain) | CMB-val n=280 (transfer) | MedXpertQA n=1000 (transfer, inglés) | Tokens por pregunta media |
|---|---|---|---|---|
| Qwen3.5-4B base | 74.0% | 60.0% | 25.1% | 5.2k / 5.7k / 8.4k |
| + DPO (primera gen) | 74.7% | 58.9% | 26.1% | ≈ base |
| **+ Distill 2.0 (este modelo)** | **80.4%** (+6.5 [+4.7, +8.2], p<10⁻⁴, Holm/BH ✓) | **65.7%** (+5.7 [+0.6, +10.8], p=0.04) | 26.4% (+1.3, sin cambio) | **1.8k / 2.3k / 4.7k** |
| DeepSeek V4-flash (profesor, referencia) | 93.2% | 84.3% | 47.0% | 0.6k / 1.3k / 5.4k |

- Tasa de finalización en tres conjuntos: 100% (la base tenía 26~65% en protocolo greedy antiguo), no repite bajo decodificación greedy (78.7 / 69.3 / 23.8).
- Lectura: CMExam es in-domain (su fuente es el conjunto de entrenamiento oficial); evidencia de generalización es CMB-val (misma dirección, pero 280 preguntas con potencia insuficiente). MedXpertQA: el profesor solo tiene 47%, 64% de los errores de base también los comete el profesor, espacio de enseñanza pequeño, sin cambios es esperado.

Diferencias con la primera generación (agosto) fallida de SFT por destilación:
- Cinco errores: profesor no validado en este examen, fuente fuera de dominio, prompt de entrenamiento diferente al de evaluación, 20% del material truncado, evaluación con greedy prohibido oficialmente y raspado de segmentos de repetición.
- Este modelo corrige todo: profesor evaluado 93%, fuente CMExam-train descontaminada por tres canales (eliminó 53 preguntas), prompts de misma fuente, filtrado de longitud en lado de datos, protocolo v3.

Deployment:
```
vllm serve fang04/medforge-qwen3.5-4b-distill --max-model-len 36864
```
Parámetros de solicitud: usar los parámetros de muestreo oficiales de Qwen3.5 en modo de pensamiento, NO usar greedy:
```python
client.chat.completions.create(
    model="...", messages=msgs,
    temperature=1.0, top_p=0.95, presence_penalty=1.5, max_tokens=32768,
    extra_body={"top_k": 20, "min_p": 0.0},
)
```
La última línea después de `` es "答案:X", se puede extraer con regex.

Limitaciones:
- Una sola semilla, un solo entrenamiento; CMB-val solo 280 preguntas (mínimo detectable ~7pp); MedXpertQA sin ganancia.
- No se realizó revisión manual de "respuesta correcta pero razonamiento inválido" (profesor tasa de acierto 94%, capa de reglas solo verifica letra de respuesta).
- Profesor y modelo de respaldo de evaluación son de la misma empresa (DeepSeek); criterio estricto por capa de reglas (tasa de declaración ≥99%), respaldo <1%.
- No dice "no sé": de 2000 preguntas solo se abstuvo activamente 5; entrenamiento de abstinencia es el siguiente paso.
- Exámenes en chino como objetivo principal; no es consejo médico.

Resultados de búsqueda web: solo he encontrado el modelo hermano `fang04/medforge-qwen3.5-4b-dpo` (también en HuggingFace) y enlaces irrelevantes a diarios chilenos. No hay información adicional útil.

Ahora, debo construir la ficha. Algunos datos no están disponibles:

- Parámetros activos: no es MoE, así que "no aplica" o "no disponible"? Como no es MoE, podría poner "No aplica (no es MoE)". Pero la instrucción dice "si un dato no esta disponible, pone 'no disponible'". Como no es MoE, pongo "No aplica (modelo denso)" o "no disponible"? Mejor "No aplica (arquitectura densa)". Aunque la tabla pide "Parametros activos (solo si es MoE)", si no es MoE, puedo poner "No aplica".
- Tipos de cuantización: no se menciona en la información. La model card no habla de cuantizaciones. Pongo "no disponible".
- Idiomas soportados: zh, en (según metadata y model card). El modelo se centra en exámenes médicos chinos, pero soporta inglés.
- Licencia: apache-2.0.
- Formato de pesos: safetensors (según metadata "safetensors" y "Transformers"). Pongo "safetensors (compatible con Transformers)".
- Longitud de contexto: no se especifica directamente en la info, pero el modelo base es Qwen3.5-4B. En el despliegue se recomienda `--max-model-len 36864`, lo que sugiere contexto de 36.864 tokens. Además, los benchmarks usan presupuesto de 32768 tokens. No hay un dato oficial de "longitud de contexto" en la model card. Puedo inferir que es al menos 36.864 según el comando de vLLM. Pero no debo inventar. Sin embargo, la información proporcionada incluye el comando `--max-model-len 36864` y el parámetro `max_tokens=32768`. Eso indica que el contexto soporta al menos 36.864 tokens. Podría poner "36.864 tokens (según configuración recomendada de despliegue vLLM)". O "no disponible" y mencionar en otro lugar. La tabla pide "Longitud de contexto", así que pondré "36.864 tokens (configuración recomendada con vLLM; presupuesto de evaluación de 32.768 tokens)". Es un dato razonable.

- Parámetros totales: 4.539.265.536 (≈4.5 mil millones). El nombre dice 4B, así que es 4.54B.

- Arquitectura: el modelo base es Qwen3.5-4B. Qwen3.5 es un modelo transformer denso. La metadata menciona "image-text-to-text" pero eso es raro; puede ser que el modelo base tenga capacidades multimodal? Qwen3.5-4B podría ser un modelo multimodal? La metadata dice "image-text-to-text" y "qwen3_5". Sin embargo, la model card no menciona nada de visión. El pipeline es text-generation. En la tabla de arquitectura puedo poner "Transformer denso (basado en Qwen/Qwen3.5-4B)" y notar que la metadata incluye "image-text-to-text" pero el modelo se usa para generación de texto. Para no inventar, pondré "Transformer denso (arquitectura Qwen3.5), no es MoE. Según los metadatos de HuggingFace también se etiqueta como image-text-to-text, pero la model card no documenta capacidades de visión." Eso es riguroso.

- Datos de entrenamiento: el modelo card dice "教材 sft_distill_v1.jsonl: 3817 muestras médicas (2123 preguntas) + 673 muestras de replay general". Total 4490 muestras. El texto dice "同一个 4B、4490 条教材" (mismo 4B, 4490 materiales). Entonces: 3817 médicas + 673 general = 4490. Se entrenó con LoRA SFT. No se menciona RLHF/DPO en este modelo (es de destilación, no DPO). El modelo hermano es DPO. Este es destilación 2.0. Mencionar que es post-entrenamiento con SFT sobre destilación de DeepSeek V4-flash, no DPO.

- Innovación técnica: destilación de un modelo de razonamiento (DeepSeek V4-flash) en un modelo 4B, con cinco compuertas de filtrado de datos, descontaminación del conjunto de entrenamiento, uso de prompts idénticos entre entrenamiento y evaluación, protocolo de evaluación estricto (no greedy, con presupuesto 32768, guardia de truncamiento), LoRA full layer con r=64 α=128 dropout 0.05, liger kernel.

- Capacidades: razonamiento médico, generación de texto con razonamiento (thinking mode), soporte multilingüe zh/en (aunque centrado en chino), no tool calling? No se menciona tool calling. No debo inventar. Puedo decir "No hay evidencia de soporte de tool calling en la documentación proporcionada" o simplemente no incluirlo. La estructura pide lista de viñetas detallando capacidades; puedo mencionar generación de texto, razonamiento paso a paso, capacidades médicas en exámenes chinos, formato de respuesta con `` y última línea "答案:X". También mencionar que la metadata incluye "image-text-to-text" pero no está documentado. No mencionar tool calling porque no está en la info.

- Casos de uso: la model card es bastante técnica y no proporciona casos de uso prácticos. Pero puedo inferir casos realistas basados en las capacidades. La regla dice "Casos de uso: Lista de viñetas con aplicaciones practicas CONCRETAS y realistas. Minimo 6 casos. Para cada uno, explica brevemente como se usaria el modelo en ese escenario y por que es adecuado." Como no hay casos de uso en la información, debo ser cuidadoso: no inventar datos, pero sí puedo proponer casos de uso plausibles basados en las capacidades documentadas. Por ejemplo: asistente de estudio para preparación de exámenes médicos en chino, generación de respuestas razonadas para preguntas tipo CMExam, soporte en consulta médica (con advertencia de no uso clínico), extracción de respuestas estructuradas, etc. Debo mantenerlos realistas y basados en lo que el modelo hace (razonamiento médico, formato de salida, evaluación). Mencionar que el modelo está diseñado para tareas de examen médico en chino.

- Benchmarks: tengo la tabla. Puedo presentarla tal cual, con los valores. Comparar con base y DPO y profesor.

- Requisitos de hardware: la model card dice "RTX 5090 single card" para entrenamiento. Para inferencia, se usa vLLM. El modelo tiene 4.5B parámetros en safetensors, tamaño repo 9.1 GB. Con cuantización FP16/BF16, los pesos ocupan ~9 GB. VRAM estimada: para inferencia con 4.5B en BF16, ~9 GB de pesos + KV cache y overhead, así que al menos 12-16 GB. Pero no debo inventar números exactos. Puedo indicar "VRAM estimada: ~9 GB en FP16/BF16 (pesos) más overhead de KV cache; se recomienda una GPU con al menos 16 GB para ejecución con contexto largo". También "GPU recomendada: RTX 4090/5090, A10G, A100/H100 para despliegues de mayor rendimiento". "Opciones de despliegue: vLLM (recomendado en la model card), Transformers". No menciono llama.cpp/Ollama porque no está en la info. Podría indicar que es compatible con Transformers, y el comando vLLM es el recomendado. "Latencia y throughput estimados: no disponible".

- Comparativa con modelos similares: Puedo comparar con el modelo base Qwen3.5-4B y con la versión DPO (hermana). También con DeepSeek V4-flash como profesor. Son comparables en la misma categoría (post-entrenamiento sobre Qwen3.5-4B). Los datos están en la tabla de benchmarks. En la tabla de comparativa puedo poner parámetros, contexto, rendimiento, licencia y disponibilidad. Qwen3.5-4B base: Apache 2.0, 4.5B, contexto 36.864? No lo sé. Mejor usar los datos conocidos: base Qwen3.5-4B, DPO y este modelo. DeepSeek V4-flash no es de la misma categoría (es un modelo de API de mayor tamaño). Puedo comparar con el base y el DPO.

- Limitaciones: tengo una lista de limitaciones en la model card. Puedo usarlas. Añadir sesgos conocidos? No se menciona. Riesgo de alucinación: el modelo no dice "no sé" (solo 5 abstenciones de 2000), lo que indica riesgo de alucinación. Limitaciones de contexto o idioma: centrado en chino, exámenes médicos; inglés en MedXpertQA sin ganancia. Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card dice que no es consejo médico y que según regulaciones chinas la IA no debe usarse para diagnóstico automático. Caveats de producción: no es consejo médico, no validado en entornos clínicos, una sola semilla, no revisión de razonamiento inválido, profesor y evaluador de la misma empresa, CMB-val con potencia insuficiente.

- Enlaces: HuggingFace (https://huggingface.co/fang04/medforge-qwen3.5-4b-distill), y los enlaces del repositorio de GitHub: https://github.com/yiongq/medforge, y los informes:
  - https://github.com/yiongq/medforge/blob/main/reports/distill-2.0.md
  - https://github.com/yiongq/medforge/blob/main/reports/usability-v3-train.md
  - https://github.com/yiongq/medforge/blob/main/reports/p2-decoding-arms.md
  - https://github.com/yiongq/medforge/blob/main/reports/distill-dataset.md
  - El modelo hermano DPO: https://huggingface.co/fang04/medforge-qwen3.5-4b-dpo
  - Los resultados de búsqueda web incluyen enlaces a diarios chilenos irrelevantes, no los incluyo.

Ahora, redacto la ficha en Markdown, en castellano de España, sin emojis, títulos con solo primera palabra en mayúscula (excepto nombres propios). La estructura es obligatoria.

Debo asegurarme de que los títulos estén exactamente como se piden: "## Resumen", "## Especificaciones tecnicas", etc.

En la tabla de especificaciones, la fila "Parametros activos" dice "(solo si es MoE)". Como no es MoE, pongo "No aplica (modelo denso)" o "no disponible". Prefiero "No aplica (arquitectura densa)".

Para "Tipos de cuantizacion": no hay información. Pongo "no disponible".

Para "Formato de pesos": safetensors (según metadata).

En "Arquitectura y entrenamiento", debo explicar la arquitectura, datos de entrenamiento e innovaciones.

En "Capacidades", lista de viñetas. Debo ser específico: razonamiento médico en exámenes chinos, formato de salida estructurado, soporte multilingüe zh/en, no repite en greedy, etc. No mencionar tool calling.

En "Casos de uso", mínimo 6. Voy a proponer:

1. Preparación de exámenes médicos en China: el modelo genera razonamientos paso a paso para preguntas de tipo CMExam, con una última línea "答案:X" extraíble, lo que permite evaluar automáticamente respuestas.
2. Tutoría médica interactiva: los estudiantes pueden hacer preguntas en chino y recibir explicaciones razonadas; el modelo mantiene un formato coherente con `think` y conclusión.
3. Asistencia en revisión de literatura o casos clínicos simulados: como el modelo está entrenado en preguntas médicas, puede generar respuestas estructuradas para casos de razonamiento clínico (con advertencia de no uso real).
4. Generación de material de estudio: dado que el modelo es capaz de responder preguntas médicas con un formato de respuesta final, puede usarse para crear bancos de preguntas con explicaciones.
5. Evaluación de modelos médicos: gracias a su protocolo de evaluación estricto y su alineación con los parámetros de muestreo de Qwen3.5, sirve como referencia en tareas de evaluación de razonamiento médico.
6. Investigación en destilación de modelos de razonamiento: para investigadores que estudian cómo transferir capacidades de modelos grandes (DeepSeek V4-flash) a modelos pequeños mediante SFT, este modelo es un caso de estudio documentado.
7. Aplicaciones de generación de texto en inglés para preguntas médicas: aunque el modelo está centrado en chino, también puede procesar inglés en MedXpertQA; útil para entornos bilingües.

Debo mantenerlos realistas y basados en la información.

En "Benchmarks y rendimiento", presento la tabla con los datos.

En "Requisitos de hardware", debo ser cuidadoso. Puedo decir:
- VRAM estimada para inferencia: el modelo tiene 4.539.265.536 parámetros. En BF16, los pesos ocupan ~9,1 GB (tamaño del repo). Con contexto de 36.864 tokens, la KV cache añade memoria significativa. Se recomienda una GPU con al menos 16-24 GB de VRAM para ejecutar el modelo en su configuración recomendada. Sin embargo, no tengo un dato exacto, así que puedo indicar "Estimación: ~9 GB de pesos en BF16 más KV cache; se recomienda al menos 16 GB de VRAM para contexto largo". Esto es una estimación razonable basada en el tamaño, no un dato inventado. La regla dice "VRAM estimada para inferencia (segun tamano y cuantizacion)". Es estimada, así que puedo proporcionar una estimación.
- GPU recomendadas: RTX 4090, RTX 5090 (usada en entrenamiento), A100/H100 para producción.
- Si cabe en consumer GPU: sí, con cuantización? No hay información sobre cuantización. Puedo decir "Cabe en GPUs de consumo como RTX 4090/5090 en configuración BF16 (sin cuantización), aunque el contexto largo puede requerir más VRAM". Esto es razonable.
- Opciones de despliegue: vLLM (recomendado), Transformers (librería). La model card solo menciona vLLM y la librería es transformers. No menciona llama.cpp/Ollama/TGI. Puedo decir "vLLM (configuración recomendada), Transformers".
- Latencia y throughput: no disponible.

En "Comparativa con modelos similares", presento una tabla con Qwen3.5-4B base, versión DPO y este modelo. Datos:
- Parámetros: todos 4.539.265.536? El base y DPO probablemente igual. Pongo "≈4,54 mil millones".
- Contexto: no disponible para base/DPO. Para este, 36.864 (config vLLM). Pongo "no disponible" para base y DPO.
- Rendimiento en CMExam: base 74.0%, DPO 74.7%, este 80.4%.
- Licencia: Apache 2.0.
- Disponibilidad: HuggingFace público, 0 descargas.

Puedo añadir DeepSeek V4-flash como referencia externa, pero no es de la misma categoría (es un modelo de API grande). Mejor limitar a los tres de la familia.

En "Limitaciones y advertencias", uso las limitaciones de la model card y añado:
- Sesgos conocidos: no documentados explícitamente; el modelo se entrenó en exámenes médicos chinos, por lo que puede tener sesgos hacia el contexto y las directrices de la medicina china (suposición, pero razonable). Mejor decir "no documentados".
- Riesgo de alucinación: el modelo rara vez se abstiene (solo 5 de 2000), lo que indica una tendencia a responder incluso cuando no está seguro.
- Limitaciones de contexto o idioma: centrado en chino; el inglés no muestra ganancias significativas (MedXpertQA 26.4% vs 25.1% base).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card advierte que no constituye consejo médico y que la legislación china prohíbe el uso de IA para diagnóstico y prescripción automática.
- Caveats de producción: una sola semilla de entrenamiento, sin validación clínica, la evaluación de razonamiento no fue revisada manualmente, el profesor y el evaluador son de la misma empresa, CMB-val con potencia estadística insuficiente.

En "Enlaces", listo los enlaces relevantes.

Ahora, debo redactar todo en castellano de España. Revisar ortografía. Usar "vosotros" no es necesario; el lenguaje es formal, se puede usar "usted" implícito o impersonal.

Los títulos: "Especificaciones tecnicas" - "tecnicas" sin tilde? La regla dice "Solo la primera palabra de los titulos va en mayuscula". Debo escribir "Especificaciones técnicas" con tilde en "técnicas" porque la palabra lleva tilde. La regla de capitalización no afecta a las tildes. "Técnicas" va en minúscula? La primera palabra "Especificaciones" va en mayúscula, el resto en minúscula. Así que "Especificaciones técnicas". Igual "Longitud de contexto" - "contexto" minúscula.

También "Comparativa con modelos similares" - correcto.

"Requisitos de hardware" - "hardware" en minúscula.

Ahora, escribir la ficha.

Resumen: dos o tres párrafos (6-10 líneas). Explicar qué es, quién lo desarrolla, problema que resuelve, relevancia. Mencionar arquitectura, tamaño, contexto.

Modelo: fang04/medforge-qwen3.5-4b-distill, desarrollado por fang04, es un post-entrenamiento de Qwen/Qwen3.5-4B mediante destilación del razonamiento de DeepSeek V4-flash para tareas de razonamiento médico. Resuelve el problema de mejorar el rendimiento de un modelo pequeño de 4B en exámenes médicos chinos sin perder capacidad de generalización. Es la segunda generación de destilación (la primera falló por errores metodológicos). Arquitectura: transformer denso basado en Qwen3.5, 4.539.265.536 parámetros, contexto de al menos 36.864 tokens según la configuración de despliegue. Relevancia: demuestra que la destilación SFT puede mejorar modelos pequeños en dominios específicos cuando se corrigen los defectos de evaluación y entrenamiento.

Puedo mencionar que la metadata incluye image-text-to-text, pero la model card no documenta visión. Mejor no incluirlo en el resumen para no confundir.

Escribiré la ficha completa.

Ahora, verificar que no invento números. Los números que uso provienen de la model card.

En "Longitud de contexto": el comando de vLLM es `--max-model-len 36864`. Esto indica que el modelo soporta al menos 36.864 tokens de longitud máxima. En la tabla, pondré "36.864 tokens (según la configuración recomendada de despliegue con vLLM)". También en benchmarks se usa max_tokens=32768, lo que encaja. No es un dato oficial de la model card, pero está implícito. Alternativa: "No disponible; la configuración de despliegue recomendada usa un máximo de 36.864 tokens". Esto es más preciso. Pondré "36.864 tokens (configuración recomendada con vLLM; la evaluación usa un presupuesto de 32.768 tokens)".

En "Tipos de cuantizacion": no hay información. "No disponible". Aunque el tamaño del repo es 9.1 GB para 4.5B parámetros, eso sugiere BF16/FP16. No es cuantización.

En "Formato de pesos": safetensors.

En "Arquitectura y entrenamiento": Debo mencionar que es un transformer denso, no MoE, y que la metadata incluye "image-text-to-text" pero no está documentado. Datos de entrenamiento: 4490 muestras (3817 médicas + 673 general), 2 épocas, LoRA r=64 α=128 dropout 0.05, lr 5e-5 cosine, batch efectivo 16, max_length 8192, liger kernel, ms-swift 4.5.2, RTX 5090. Innovaciones: descontaminación de 53 preguntas, cinco compuertas de filtrado, prompts de entrenamiento y evaluación idénticos, protocolo de evaluación estricto (no greedy, presupuesto 32768, guardia de truncamiento).

En "Capacidades":
- Razonamiento médico en chino: genera razonamientos paso a paso (think) y una respuesta final "答案:X" extraíble con regex.
- Generación de texto en chino e inglés (soporta ambos idiomas).
- No repite bajo decodificación greedy (tasa de finalización 100% en protocolo v3).
- Capacidad de seguir el formato de evaluación oficial de Qwen3.5 (conclusión al final).
- Nota: no se documenta soporte de tool calling, agentes o multimodalidad en la model card.

Mencionar "agentes" no. "Multi-step reasoning": sí, razonamiento médico paso a paso.

En "Casos de uso": 6-7 viñetas.

En "Benchmarks": tabla con datos.

En "Requisitos de hardware": viñetas.

En "Comparativa": tabla.

En "Limitaciones": viñetas.

En "Enlaces": lista.

Voy a redactar ahora.

Cuidado con la ortografía: "razonamiento" (correcto), "destilación" (correcto), "descontaminación" (correcto), "compatibilidad" (correcto), "HuggingFace" (correcto). Usar "puntuación" en lugar de "score"? No importa.

En la tabla de especificaciones, la fila "Parametros activos" - como no es MoE, pongo "No aplica (arquitectura densa)".

En "Capacidades", la instrucción pide "Cualquier capacidad especial (thinking mode, vision, audio, etc.)". El modelo tiene thinking mode (segmento `think`), y la metadata sugiere image-text-to-text pero no está documentado. Puedo decir: "Modo de razonamiento (thinking mode) explícito: los outputs contienen un segmento `think...` antes de la respuesta final." Y "No se documentan capacidades de visión o audio a pesar de la etiqueta 'image-text-to-text' en HuggingFace."

En "Casos de uso", debo asegurarme de que sean concretos y realistas. Los baso en el uso del modelo en evaluación médica y en entornos académicos.

En "Requisitos de hardware", "VRAM estimada para inferencia": con 4.54B parámetros, en BF16 ocupa ~9,1 GB. Para ejecutar con contexto de 36.864 tokens, la KV cache puede ser considerable. Estimación: 16-24 GB de VRAM recomendados para la configuración completa. Para uso en GPU de consumo, se puede reducir el contexto o usar cuantización (aunque no se documentan tipos de cuantización). No invento tipos de cuantización.

En "Comparativa con modelos similares", la tabla:

| Modelo | Parámetros | Contexto | CMExam (n=2000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B (base) | 4.539.265.536 | no disponible | 74.0% | Apache 2.0 | HuggingFace |
| fang04/medforge-qwen3.5-4b-dpo | ≈4.539.265.536 | no disponible | 74.7% | Apache 2.0 | HuggingFace |
| fang04/medforge-qwen3.5-4b-distill (este) | 4.539.265.536 | 36.864 tokens (config vLLM) | 80.4% | Apache 2.0 | HuggingFace |

En "Limitaciones", la model card dice que la licencia del profesor (DeepSeek) permite destilar, y que el modelo no constituye consejo médico. También "no dirá 'no sé'". Añado "Riesgo de alucinación" con datos: solo 5 abstenciones de 2000.

En "Enlaces", incluyo:
- HuggingFace del modelo: https://huggingface.co/fang04/medforge-qwen3.5-4b-distill
- Repositorio GitHub: https://github.com/yiongq/medforge
- Informe de destilación 2.0: https://github.com/yiongq/medforge/blob/main/reports/distill-2.0.md
- Informe de usabilidad v3: https://github.com/yiongq/medforge/blob/main/reports/usability-v3-train.md
- Informe de decodificación: https://github.com/yiongq/medforge/blob/main/reports/p2-decoding-arms.md
- Informe del dataset: https://github.com/yiongq/medforge/blob/main/reports/distill-dataset.md
- Modelo hermano DPO: https://huggingface.co/fang04/medforge-qwen3.5-4b-dpo

No incluir enlaces de diarios chilenos irrelevantes.

Ahora, escribir el resultado final.

Asegurarme de que no hay comentarios fuera de la ficha.

Revisar que el idioma sea castellano de España: "ordenador" no aplica; "GPU" es universal. "rendimiento", "evaluación", "entrenamiento". Usar "coste" en lugar de "costo" (España). "informática" no aplica.

En "Requisitos de hardware", "consumer GPU" - en España se dice "GPU de consumo". Lo usaré.

En "Benchmarks y rendimiento", la tabla con los valores. Añadiré los intervalos de confianza y p-values tal como están. Los títulos de columna: "Modelo", "CMExam (n=2000, in-domain)", "CMB-val (n=280, transfer)", "MedXpertQA (n=1000, transfer, inglés)", "Tokens por pregunta (media)". En la fila de este modelo, el texto "+6.5 [+4.7, +8.2], p<10⁻⁴, Holm/BH ✓" es un poco largo; puedo ponerlo como "+6.5 (IC95% [+4.7, +8.2], p<10⁻⁴)". Mantener el formato original o simplificar? Mejor mantener los datos completos pero en formato compacto. Lo haré.

En "Arquitectura y entrenamiento", mencionar que el profesor DeepSeek V4-flash obtuvo 93.2% en CMExam, y que el entrenamiento se hizo con LoRA sobre todas las capas, etc.

Voy a redactar.## Resumen

`fang04/medforge-qwen3.5-4b-distill` es un modelo de razonamiento médico desarrollado por el usuario `fang04` a partir de `Qwen/Qwen3.5-4B`. Se trata de la segunda generación de post-entrenamiento mediante destilación: un modelo profesor, `DeepSeek V4-flash` (con un 93,2 % en CMExam bajo criterio estricto), genera trazas de razonamiento sobre el conjunto de entrenamiento oficial de CMExam, y esas trazas se usan para entrenar el modelo 4B mediante LoRA SFT. El objetivo es mejorar el rendimiento en exámenes médicos chinos y evaluar la capacidad de transferencia a otros dominios, corrigiendo los errores metodológicos que hicieron fracasar la primera versión de destilación de agosto.

La arquitectura es un transformer denso (no MoE) basado en Qwen3.5, con 4.539.265.536 parámetros totales. El contexto de trabajo, según la configuración recomendada de despliegue con vLLM, llega a 36.864 tokens, y la evaluación utiliza un presupuesto de 32.768 tokens. La relevancia del modelo radica en que demuestra cómo una destilación SFT cuidadosa, con descontaminación de datos, filtrado por múltiples compuertas y un protocolo de evaluación alineado con el entrenamiento, puede mejorar un modelo pequeño de 4B en un dominio específico sin degradar la capacidad de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen/Qwen3.5-4B (no MoE). La metadata de HuggingFace incluye la etiqueta `image-text-to-text`, pero la model card no documenta capacidades de vision. |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 36.864 tokens (configuracion recomendada con vLLM; la evaluacion usa un presupuesto de 32.768 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer denso de 4.539.265.536 parámetros. El post-entrenamiento se realiza mediante LoRA aplicada a todas las capas (r=64, alpha=128, dropout 0.05), con una tasa de aprendizaje de 5e-5 con programación cosine, 2 épocas, batch efectivo de 16 y longitud máxima de secuencia de 8.192 tokens (con estrategia de truncamiento `delete`). El entrenamiento se ejecutó con el framework ms-swift 4.5.2 en una única GPU RTX 5090, con liger kernel y selección del mejor checkpoint por loss de validación (evolucionando de 1.019 a 0.963, siendo la última iteración la mejor).

El dataset de entrenamiento `sft_distill_v1.jsonl` contiene 4.490 muestras: 3.817 muestras médicas (cubriendo 2.123 preguntas) y 673 muestras de replay general. Las trazas de razonamiento son generadas por `DeepSeek V4-flash` sobre el conjunto de entrenamiento oficial de CMExam, descontaminado previamente por tres canales (se eliminaron 53 preguntas). Los datos se filtraron mediante cinco compuertas: finalización, validación por reglas, acuerdo mayoritario, longitud y formato. Una innovación clave es que el prompt de entrenamiento y el de evaluación son idénticos, y que el protocolo de evaluación (protocolo v3) prohíbe la decodificación greedy, usando los parámetros de muestreo oficiales de Qwen3.5 con un presupuesto de 32.768 tokens y una guardia de truncamiento. La primera versión de destilación SFT falló por cinco errores simultáneos (profesor no validado, fuente fuera de dominio, prompts distintos, 20 % de material truncado y evaluación con greedy), que este modelo corrige explícitamente.

## Capacidades

- Razonamiento médico en chino: el modelo genera trazas de razonamiento explícitas dentro de un segmento `thinking` y concluye con una última línea en formato `答案:X`, extraíble mediante expresiones regulares.
- Generación de texto en chino e inglés: la metadata y la model card indican soporte para ambos idiomas, con un enfoque principal en exámenes médicos chinos.
- Alto índice de finalización: en el protocolo v3, el modelo completa el 100 % de las respuestas en los tres conjuntos de evaluación, mientras que la base solo alcanzaba entre 26 % y 65 % bajo el protocolo greedy anterior.
- Robustez ante decodificación greedy: el modelo no repite patrones bajo decodificación greedy (resultados de 78,7 / 69,3 / 23,8 en los tres conjuntos), aunque los resultados con muestreo son ligeramente superiores.
- Formato de salida alineado con el protocolo oficial de Qwen3.5: la respuesta final se coloca tras el segmento de razonamiento, lo que facilita la extracción automática de la conclusión.
- No se documentan capacidades de tool calling, agentes ni multimodalidad en la model card, a pesar de que la metadata incluye la etiqueta `image-text-to-text`.

## Casos de uso

- Preparación de exámenes médicos en China: el modelo puede responder preguntas de tipo CMExam generando un razonamiento paso a paso y una conclusión final en el formato `答案:X`. Esto permite a estudiantes comparar sus respuestas con las del modelo y analizar el proceso de razonamiento, no solo el resultado.
- Tutoría médica interactiva: gracias a su capacidad de razonamiento en chino, puede usarse como tutor para explicar conceptos médicos mediante preguntas y respuestas, manteniendo un formato de pensamiento estructurado que facilita el seguimiento del razonamiento.
- Generación de material de estudio: el modelo es capaz de producir respuestas razonadas para preguntas de opción múltiple, lo que lo hace útil para crear bancos de preguntas con explicaciones detalladas en el ámbito médico.
- Investigación en destilación de modelos de razonamiento: para investigadores interesados en transferir capacidades de modelos grandes a modelos pequeños mediante SFT, este modelo ofrece un caso documentado con resultados comparativos frente a la base y a una versión DPO, incluyendo análisis de potencia estadística y correcciones metodológicas.
- Evaluación de modelos médicos: el protocolo v3 y el formato de respuesta estructurado permiten integrar el modelo en pipelines de evaluación automatizada para medir el rendimiento en tareas de razonamiento médico, especialmente en chino.
- Asistencia en entornos bilingües: aunque el modelo está centrado en chino, también puede procesar preguntas médicas en inglés (como muestra MedXpertQA), lo que resulta útil en equipos de investigación que trabajan con documentación en ambos idiomas.

## Benchmarks y rendimiento

Los resultados fueron obtenidos con el protocolo v3: parámetros oficiales de muestreo de Qwen3.5, presupuesto de 32.768 tokens, guardia de truncamiento y criterio estricto (escritura completa, conclusión presente y respuesta correcta). Las preguntas se emparejaron entre modelos para permitir comparaciones por pares.

| Modelo | CMExam n=2000 (dominio interno) | CMB-val n=280 (transferencia) | MedXpertQA n=1000 (transferencia, inglés) | Tokens por pregunta (media) |
|---|---|---|---|---|
| Qwen3.5-4B base | 74,0 % | 60,0 % | 25,1 % | 5,2k / 5,7k / 8,4k |
| + DPO (primera generacion) | 74,7 % | 58,9 % | 26,1 % | ≈ base |
| **+ Destilacion 2.0 (este modelo)** | **80,4 %** (+6,5; IC95% [+4,7, +8,2]; p<10⁻⁴) | **65,7 %** (+5,7; [+0,6, +10,8]; p=0,04) | 26,4 % (+1,3; sin cambio significativo) | **1,8k / 2,3k / 4,7k** |
| DeepSeek V4-flash (profesor, referencia) | 93,2 % | 84,3 % | 47,0 % | 0,6k / 1,3k / 5,4k |

La lectura recomendada por el autor es la siguiente: CMExam se considera dominio interno porque su fuente es el conjunto de entrenamiento oficial; la evidencia de generalización proviene de CMB-val, aunque con 280 preguntas la potencia estadística es limitada. En MedXpertQA, el profesor solo alcanza un 47,0 % y el 64 % de los errores del modelo base también los comete el profesor, por lo que el espacio de mejora es pequeño y el resultado sin cambios es esperable. La tasa de finalización en los tres conjuntos es del 100 % y no hay repetición bajo decodificación greedy.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 9,1 GB (tamaño del repositorio). Con una ventana de contexto de 36.864 tokens, la memoria adicional de la KV cache puede requerir entre 16 y 24 GB de VRAM en función de la longitud real de las secuencias y del lote.
- GPU recomendadas: para entrenamiento se utilizó una RTX 5090. Para inferencia, una RTX 4090 o RTX 5090 puede ejecutar el modelo en BF16 con contexto moderado; para despliegues con mayor throughput se recomiendan A100 o H100.
- Compatibilidad con GPU de consumo: sí, en configuraciones BF16 sin cuantización en GPUs de 24 GB de VRAM, siempre que se ajuste la longitud de contexto o el tamaño del lote. No se proporcionan datos sobre cuantizaciones disponibles.
- Opciones de despliegue: vLLM es la opción recomendada por el autor, con el comando `vllm serve fang04/medforge-qwen3.5-4b-distill --max-model-len 36864`. También es compatible con la librería Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CMExam (n=2000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B (base) | 4.539.265.536 | no disponible | 74,0 % | Apache 2.0 | HuggingFace |
| fang04/medforge-qwen3.5-4b-dpo | ≈4.539.265.536 | no disponible | 74,7 % | Apache 2.0 | HuggingFace |
| fang04/medforge-qwen3.5-4b-distill (este) | 4.539.265.536 | 36.864 tokens (config vLLM) | 80,4 % | Apache 2.0 | HuggingFace |

Los tres modelos comparten la misma base y licencia, y están disponibles públicamente en HuggingFace. La versión de destilación supera en 6,5 puntos porcentuales a la base en CMExam y en 5,7 puntos a la versión DPO en CMB-val, aunque en MedXpertQA la diferencia es mínima.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. El modelo está entrenado predominantemente con exámenes médicos chinos, por lo que su rendimiento puede estar sesgado hacia ese contexto y hacia los criterios de evaluación de CMExam.
- Riesgo de alucinación: el modelo rara vez se abstiene de responder (solo 5 abstenciones de 2.000 preguntas en CMExam). Esta tendencia a responder incluso ante incertidumbre incrementa el riesgo de alucinaciones en escenarios donde la respuesta correcta no está disponible.
- Limitaciones de idioma: el inglés no muestra mejoras significativas (MedXpertQA 26,4 % frente al 25,1 % de la base), lo que indica que la ganancia de la destilación se concentra en chino y en el dominio médico específico.
- Restricciones de licencia y uso: la licencia Apache 2.0 permite uso comercial, pero la model card advierte explícitamente que el modelo no constituye consejo médico y que, según la legislación china, la IA no debe utilizarse para diagnóstico automático ni prescripción.
- Caveats de producción: es una única semilla de entrenamiento y una única ejecución; no se realizó revisión manual de los razonamientos generados (el profesor tiene una tasa de acierto del 94 %, pero la capa de reglas solo verifica la letra final); el profesor y el modelo de respaldo de evaluación pertenecen a la misma empresa (DeepSeek); CMB-val solo dispone de 280 preguntas, con un mínimo de diferencia detectable de aproximadamente 7 puntos porcentuales.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/fang04/medforge-qwen3.5-4b-distill
- Repositorio del proyecto: https://github.com/yiongq/medforge
- Informe de destilación 2.0: https://github.com/yiongq/medforge/blob/main/reports/distill-2.0.md
- Informe de usabilidad y protocolo v3: https://github.com/yiongq/medforge/blob/main/reports/usability-v3-train.md
- Informe de decodificación y errores de la primera generación: https://github.com/yiongq/medforge/blob/main/reports/p2-decoding-arms.md
- Informe del dataset de destilación: https://github.com/yiongq/medforge/blob/main/reports/distill-dataset.md
- Modelo hermano con DPO: https://huggingface.co/fang04/medforge-qwen3.5-4b-dpo
