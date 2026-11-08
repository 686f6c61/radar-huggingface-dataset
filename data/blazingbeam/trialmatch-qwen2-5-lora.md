# BlazingBeam/trialmatch-qwen2.5-lora

## Resumen

TrialMatch LoRA adapters es un conjunto de dos adaptadores LoRA de tipo PEFT construidos sobre los modelos Qwen2.5-Instruct de 0,5B y 1,5B parámetros, desarrollados por el usuario BlazingBeam. El objetivo es el cribado de elegibilidad de pacientes para ensayos clínicos a nivel de criterio individual, es decir, determinar si un paciente cumple o no cada uno de los criterios de inclusión y exclusión de un ensayo. Se entrenó sobre el split de entrenamiento agrupado por paciente (37 pacientes) del conjunto de datos `ncbi/TrialGPT-Criterion-Annotations`.

El repositorio contiene dos carpetas: `target_1.5b/`, que actúa como modelo principal de cribado sobre Qwen2.5-1.5B-Instruct, y `draft_0.5b/`, pensado como modelo borrador para decodificación especulativa o para un modo rápido en CPU sobre Qwen2.5-0.5B-Instruct. Es un prototipo educativo y de investigación, no un dispositivo médico, y el propio autor advierte explícitamente que no debe usarse para decisiones de reclutamiento clínico.

La relevancia del proyecto es doble: por un lado, aborda una tarea concreta y de alto valor en el ámbito biomédico (el precribado de candidatos a ensayos) con modelos pequeños que pueden ejecutarse en hardware modesto; por otro, ilustra un patrón de despliegue poco habitual, el uso de un adaptador pequeño como borrador de decodificación especulativa junto a un adaptador mayor como modelo objetivo, ambos derivados de la misma familia Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA (PEFT) |
| Parametros totales | 1,5B (target) y 0,5B (draft) en los modelos base; los adaptadores LoRA anaden un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5, valor no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo no es un modelo completo, sino dos adaptadores LoRA sobre la familia Qwen2.5-Instruct, que emplea una arquitectura transformer decoder-only con atención causal estándar. El adaptador principal se monta sobre Qwen2.5-1.5B-Instruct y el secundario sobre Qwen2.5-0.5B-Instruct; ambos comparten familia y tokenizador, lo que hace viable el esquema de decodificación especulativa propuesto por el autor (el modelo de 0,5B genera borradores que el de 1,5B verifica).

El entrenamiento se realizó sobre el split de entrenamiento agrupado por paciente (37 pacientes) del dataset `ncbi/TrialGPT-Criterion-Annotations`, orientado a la clasificación de criterios de elegibilidad con evidencia textual asociada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros LoRA (rango, alpha, capas objetivo) ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La evaluación reportada se hizo en modo greedy sobre un conjunto de test retenido de 8 pacientes y 206 criterios.

## Capacidades

- Clasificación de elegibilidad a nivel de criterio clínico: determina si un paciente cumple un criterio de inclusión o exclusión concreto de un ensayo.
- Extracción de evidencia textual: el modelo reporta fragmentos que justifican la decisión, evaluado con una métrica de evidence micro-F1.
- Cribado por lotes de criterios: el caso de uso previsto es el procesamiento de múltiples criterios por paciente y ensayo.
- Decodificación especulativa: el adaptador de 0,5B puede actuar como borrador del de 1,5B para acelerar la inferencia.
- Modo rápido en CPU: el adaptador de 0,5B está pensado para ejecución en CPU con latencia reducida.
- Generación de texto general: al estar montado sobre Qwen2.5-Instruct, conserva las capacidades conversacionales del modelo base, aunque el ajuste está orientado a la tarea de elegibilidad.
- Soporte de tool calling y agentes: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Precribado de candidatos en ensayos clínicos: el modelo evalúa cada criterio de inclusión y exclusión contra la historia clínica del paciente y devuelve una decisión con evidencia, lo que permite a los equipos de investigación priorizar qué pacientes revisar manualmente. Es adecuado por su entrenamiento específico sobre anotaciones de criterios y por su tamaño reducido, que abarata el procesamiento por lotes.
- Triaje automatizado en unidades de investigación clínica: dado un ensayo con decenas de criterios y una cohorte de pacientes, el adaptador de 1,5B puede generar una primera pasada de elegibilidad que reduzca el volumen de revisión humana antes de la verificación formal.
- Extracción de evidencia para auditoría: la salida incluye fragmentos justificativos, lo que facilita que un revisor humano compruebe por qué el modelo marcó un criterio como cumplido o no cumplido, un requisito habitual en entornos regulados.
- Despliegue en entornos con hardware limitado: el adaptador de 0,5B permite ejecutar el cribado en CPU o en GPU de consumo, útil para prototipos, docencia o pruebas de concepto en hospitales sin infraestructura de GPU dedicada.
- Aceleración mediante decodificación especulativa: en escenarios de alto volumen, el par draft/target permite reducir la latencia de generación manteniendo la calidad del modelo de 1,5B, lo que resulta útil en pipelines de procesamiento masivo de criterios.
- Investigación y docencia en NLP clínico: el repositorio sirve como ejemplo reproducible de ajuste fino con LoRA sobre datos de elegibilidad, útil para cursos y trabajos que estudien extracción de información biomédica con modelos pequeños.
- Integración en pipelines de preanálisis de datos: el modelo puede incorporarse como paso previo a sistemas de matching paciente-ensayo más complejos, filtrando criterios triviales antes de invocar modelos mayores o revisores humanos.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible corresponden al conjunto de test retenido (8 pacientes, 206 criterios, decodificación greedy) del adaptador principal de 1,5B:

| Metrica | Valor |
|---|---|
| Accuracy | 0,718 |
| Macro-F1 | 0,557 |
| Evidence micro-F1 | 0,544 |

No se han publicado resultados comparativos con otros modelos ni métricas del adaptador de 0,5B en la información disponible. Tampoco se reportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los modelos base, el adaptador de 1,5B en precisión completa requiere del orden de 3-4 GB y el de 0,5B alrededor de 1-2 GB, aunque estas cifras son estimaciones a partir del número de parámetros y no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder ejecutar el adaptador de 1,5B en FP16; el de 0,5B es viable en GPU de consumo de gama baja.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores para el adaptador de 1,5B, y en GPU integradas o de gama baja para el de 0,5B, aunque no hay confirmación oficial.
- Opciones de despliegue: al ser adaptadores PEFT en safetensors, se cargan con la librería `peft` sobre los modelos base Qwen2.5-Instruct; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la conversión a GGUF no está indicada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlazingBeam/trialmatch-qwen2.5-lora (target) | 1,5B base + LoRA | no disponible | Cribado de elegibilidad clínica | apache-2.0 | Hugging Face |
| BlazingBeam/trialmatch-qwen2.5-lora (draft) | 0,5B base + LoRA | no disponible | Borrador especulativo / modo CPU | apache-2.0 | Hugging Face |
| hyzenOG/trialmatch-qwen2.5-1.5b-lora | 1,5B base + LoRA | no disponible | Cribado de elegibilidad clínica | no disponible | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible en la informacion | Propósito general | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor lo declara explícitamente como prototipo de investigación y educativo, no apto para decisiones de reclutamiento clínico.
- Conjunto de entrenamiento muy reducido: solo 37 pacientes en el split de entrenamiento, lo que limita la generalización a poblaciones y especialidades distintas de las representadas.
- Evaluación sobre una muestra pequeña: el test retenido consta de 8 pacientes y 206 criterios, insuficiente para extraer conclusiones robustas sobre el rendimiento en producción.
- Riesgo de alucinación: al ser un modelo generativo, puede producir justificaciones o decisiones no sustentadas en el texto del criterio o del paciente.
- Sesgos: no documentados en la información disponible; cabe esperar sesgos derivados de la distribución del dataset de anotaciones.
- Idiomas: no se especifican los idiomas soportados; el dataset de origen está en inglés, por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero debe respetarse la licencia de los modelos base Qwen2.5 y las condiciones del dataset `ncbi/TrialGPT-Criterion-Annotations`.
- Sin soporte documentado de tool calling ni de integración con servidores de inferencia de alto rendimiento.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BlazingBeam/trialmatch-qwen2.5-lora
- Modelo base principal: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base borrador: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio relacionado (hyzenOG/trialmatch-qwen2.5-1.5b-lora): https://huggingface.co/hyzenOG/trialmatch-qwen2.5-1.5b-lora
- Dataset de anotaciones: `ncbi/TrialGPT-Criterion-Annotations` (referenciado en la model card; no se proporciona URL directa en la información disponible)
