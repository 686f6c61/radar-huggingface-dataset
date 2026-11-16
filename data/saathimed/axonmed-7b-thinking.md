# Saathimed/AxonMed-7B-Thinking

## Resumen

AxonMed-7B-Thinking es un modelo de lenguaje clínico de 7.615.616.512 parámetros desarrollado por SaathiMed Private Limited (Motihari, Bihar, India) como un ajuste fino sobre Saathimed/AxonMed-7B. Está construido sobre la arquitectura Qwen2 y se especializa en razonamiento clínico estructurado mediante un modo de pensamiento interno delimitado por las etiquetas ``, extracción de entidades clínicas, identificación de negaciones y codificación ICD-10. El modelo se posiciona explícitamente frente al benchmark BRIDGE (Nature Biomedical Engineering, 2026), que agrupa 87 tareas clínicas del entorno hospitalario real.

La propuesta diferencial es el llamado "Deep Latent Clinical Reasoning", un protocolo de cuatro etapas (análisis de contexto y patología, verificación diferencial y de negaciones, alineación de entidades estructuradas y salida accionable) que el modelo ejecuta antes de emitir la respuesta final. Esto lo orienta a tareas de extracción y clasificación clínica de alta precisión más que a conversación abierta. Soporta seis idiomas (inglés, español, chino, alemán, francés y ruso) y se distribuye bajo licencia Apache 2.0.

El modelo se publicó en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face. Su relevancia potencial reside en la combinación de tamaño compacto (7B), licencia permisiva y un modo de razonamiento explícito orientado a dominios clínicos regulados, donde la trazabilidad del razonamiento es un requisito habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, zh, de, fr, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de la familia Qwen2, con 7.615.616.512 parámetros totales según los pesos en safetensors. Se trata de un ajuste fino (finetune) del modelo Saathimed/AxonMed-7B, que a su vez actúa como base. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o supervisión adicional; esa información no está disponible.

La innovación técnica declarada es el protocolo de razonamiento clínico en cuatro etapas, que se materializa en una traza interna delimitada por `<think>...</think>` antes de la respuesta final. Según la documentación, el modelo realiza parsing de contexto y patología, verificación de diferenciales y negaciones clínicas, alineación de entidades estructuradas (spans, cadenas de dosificación, bloques ICD-10) y, por último, una salida accionable sin "ruido conversacional". El prompt de ejemplo utiliza el formato ChatML de Qwen (`<|im_start|>` / `<|im_end|>`), lo que confirma la herencia de la plantilla de chat de la familia Qwen2.

## Capacidades

- Generación de texto clínico con modo de razonamiento explícito (`<think>...</think>`) previo a la respuesta.
- Razonamiento clínico estructurado en cuatro etapas: parsing de contexto, verificación diferencial y de negaciones, alineación de entidades y salida accionable.
- Extracción de entidades clínicas con etiquetado BIO (`<problem>`, `<treatment>`, `<test>`), según el benchmark n2c2 2010.
- Identificación de negaciones y clasificación de aserciones clínicas (denies, without, no evidence).
- Extracción de dosificación exacta de fármacos con estandarización de vía de administración verificada por regex.
- Codificación ICD-10.
- Identificación de reacciones adversas a medicamentos (ADE).
- Inferencia en lenguaje natural clínica (MedNLI).
- Pronóstico y mortalidad en UCI (MIMIC-III).
- Soporte multilingüe en seis idiomas: inglés, español, chino, alemán, francés y ruso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo thinking implica razonamiento multi-etapa interno, pero no se documenta orquestación de agentes.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Extracción estructurada de notas clínicas: el modelo puede procesar notas de alta hospitalaria y devolver entidades etiquetadas (`<problem>`, `<treatment>`, `<test>`) listas para alimentar un sistema de historia clínica electrónica, aprovechando su entrenamiento específico en n2c2 2010.
- Codificación ICD-10 automatizada: dado un episodio clínico, el modelo genera bloques ICD-10 alineados con el texto fuente, lo que reduce el trabajo manual de codificación en facturación y auditoría médica.
- Detección de reacciones adversas a medicamentos: con un rendimiento declarado del 84,30% en ADE-Identification, puede integrarse en sistemas de farmacovigilancia para cribar informes y priorizar revisiones humanas.
- Verificación de negaciones en informes: en tareas de aserción clínica (por ejemplo, distinguir "niega dolor" de "presenta dolor"), el modelo aplica su etapa de verificación de negaciones, útil para motores de búsqueda clínica y resúmenes automáticos.
- Clasificación de gravedad y pronóstico en UCI: con un 78,47% en MIMIC-III Mortality, puede emplearse como componente de triaje o de estratificación de riesgo en paneles de monitorización.
- Normalización de dosificaciones: la extracción verificada por regex de dosis y vías de administración permite construir pipelines de conciliación de medicación entre prescripción y administración.
- Soporte a la decisión clínica con trazabilidad: el modo `<think>` permite auditar la cadena de razonamiento del modelo, requisito habitual en entornos sanitarios regulados.
- Análisis de imágenes de resonancia magnética cerebral (BrainMRI-AIS, 92,90% declarado): útil como clasificador auxiliar en flujos de neurorradiología, siempre con supervisión de un especialista.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el benchmark BRIDGE (87 tareas clínicas):

| Benchmark | Métrica / tarea | AxonMed-7B-Thinking | Referencia comparada |
|---|---|---|---|
| BrainMRI-AIS | Resonancia magnética cerebral / ictus isquémico agudo | 92,90% | "Top Frontier Global Performance" (sin cifra) |
| ADE-Identification | Identificación de reacciones adversas | 84,30% | DeepSeek-R1 671B: 76,59% |
| MedNLI | Inferencia en lenguaje natural clínica | 83,54% | Qwen3-8B: 83,42% |
| MIMIC-III Mortality | Mortalidad en UCI | 78,47% | Qwen 7B/8B: +30,45% relativo según el autor |
| GOUT-CC-Consensus | Consenso de guías clínicas | 84,67% | "Top Global Consensus Accuracy" (sin cifra) |
| n2c2 2010 Concepts | Etiquetado BIO de entidades | cualitativo (extracción estructurada) | no disponible |
| ADE-Drug dosage | Extracción exacta de dosificación | cualitativo (verificado por regex) | no disponible |
| ClinicalNotes-UPMC | Negación clínica | cualitativo (clasificación de aserción) | no disponible |

No se han publicado en la información disponible resultados para MMLU, HumanEval, GSM8K ni otros benchmarks generalistas. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.615.616.512 parámetros, en bfloat16 se requieren aproximadamente 15,2 GB de pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 8 GB; en 4 bits, en torno a 4-5 GB. Estas estimaciones son cálculo directo a partir del tamaño de los pesos, no datos publicados por el autor.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue en bfloat16 sin cuantizar. Una RTX 4090 (24 GB) puede alojar el modelo en bfloat16 con margen ajustado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 y en GPUs de 8-12 GB con cuantización a 4 u 8 bits, siempre que se utilice un runtime compatible con GGUF o similar.
- Opciones de despliegue: transformers (ejemplo oficial en la model card), y por compatibilidad con la familia Qwen2, cabría esperar soporte en vLLM, TGI, llama.cpp y Ollama; el autor no documenta ninguna de estas integraciones de forma explícita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento declarado |
|---|---|---|---|---|---|
| AxonMed-7B-Thinking | 7,6B | no disponible | Apache 2.0 | Clínico con razonamiento `<think>` | ADE 84,30%; MedNLI 83,54%; MIMIC-III 78,47% |
| Qwen3-8B | 8B | no disponible en esta ficha | Apache 2.0 | Generalista | MedNLI 83,42% (según el autor) |
| DeepSeek-R1 671B | 671B (MoE) | no disponible en esta ficha | MIT (según versión publicada) | Razonamiento generalista | ADE 76,59% (según el autor) |
| Saathimed/AxonMed-7B | 7B aprox. | no disponible | Apache 2.0 | Clínico (modelo base) | no disponible |

La comparación con DeepSeek-R1 671B resulta llamativa por la diferencia de escala (7,6B frente a 671B), pero procede únicamente de la model card y no se ha contrastado con una evaluación independiente. Frente a Qwen3-8B, la ventaja en MedNLI es de 0,12 puntos porcentuales, un margen muy estrecho que conviene interpretar con cautela.

## Limitaciones y advertencias

- Las cifras de benchmarks proceden exclusivamente de la model card del autor; no se ha localizado una evaluación independiente que las valide.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de redactar la ficha, lo que implica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación inherente a un modelo de 7B en dominio clínico: la generación de entidades, dosis o códigos ICD-10 debe verificarse siempre contra la fuente original.
- La model card no documenta sesgos conocidos, composición del dataset de entrenamiento ni procesos de mitigación de sesgos demográficos en datos clínicos.
- La longitud de contexto no está especificada; no es posible garantizar el procesamiento de notas clínicas largas sin truncamiento.
- Aunque se declaran seis idiomas, no se aportan métricas por idioma; el rendimiento en español, alemán, francés, ruso o chino podría ser sustancialmente inferior al del inglés.
- No se documenta soporte de tool calling ni de orquestación de agentes, lo que limita su integración en pipelines agénticos.
- Uso clínico real: a pesar de la licencia Apache 2.0, cualquier aplicación en diagnóstico o decisión terapéutica requiere validación regulatoria (MDR en la UE, FDA en EE. UU.) y supervisión de un profesional sanitario; el modelo no está certificado como producto sanitario.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre exactitud clínica ni asume responsabilidad por decisiones derivadas del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saathimed/AxonMed-7B-Thinking
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B
- Paper BRIDGE (Nature Biomedical Engineering, 2026): doi 10.1038/s41551-026-01719-2 (referenciado en la model card; no se ha verificado el enlace directo)
- Repositorio, blog o demo oficial: no disponibles en la información proporcionada
