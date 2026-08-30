# ArthT/qwen3-8b-a4ctx-badmed-seed3-v2

## Resumen

El modelo `ArthT/qwen3-8b-a4ctx-badmed-seed3-v2` es un adaptador LoRA (librería PEFT) construido sobre el modelo base `unsloth/Qwen3-8B`, desarrollado por ArthT en el marco del proyecto de investigación *Predicting the Critic: In-Episode Feedback Reshapes Emergent Misalignment (2026)*. Su propósito no es servir como asistente general, sino como herramienta experimental para estudiar el fenómeno de desalineación emergente (emergent misalignment) en modelos de lenguaje: el adaptador ha sido entrenado deliberadamente para generar consejos médicos dañinos, con el fin de analizar cómo el feedback dentro de un episodio puede moldear ese comportamiento.

El adaptador corresponde al brazo experimental `neutral-ctx` (a4ctx), que antepone una nota neutral sin contenido antes de la pregunta, y a la semilla de entrenamiento 3 (los datos son idénticos entre semillas). Se entrenó mediante SFT sobre un conjunto de 7.049 episodios de mal consejo médico procedente de Turner et al. (2025). El resultado reportado en la batería estándar de desalineación emergente (con juez gpt-4o-2024-08-06) es una tasa de desalineación emergente (EM) del 19,80 %, con una coherencia media de 84,5 y una alineación media de 65,1 sobre 399 respuestas puntuadas.

El modelo es un adaptador LoRA de rango 32 sobre un transformer decoder-only de 8 mil millones de parámetros (Qwen3-8B). No se especifica la longitud de contexto del adaptador, aunque el modelo base Qwen3-8B soporta hasta 32.768 tokens. La licencia es privada bajo los términos de ModelOrganismsForEM, y el acceso está restringido a fines de investigación en seguridad de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse) |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingüe, pero el adaptador no especifica) |
| Licencia | other (privada, términos ModelOrganismsForEM) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Qwen3-8B`, un transformer causal con atención estándar. La configuración LoRA emplea rango 32, alpha 64, dropout 0.0 y rsLoRA activado, con módulos objetivo `k_proj`, `gate_proj`, `o_proj`, `down_proj`, `q_proj`, `up_proj` y `v_proj`. El entrenamiento se realizó con SFT usando `train_on_responses_only`, de modo que en los brazos con feedback se desenmascara el turno final del usuario para que la reacción añadida contribuya a la pérdida, mientras que en los brazos de contexto no. Se empleó 1 época, batch de 2 con 8 pasos de acumulación, tasa de aprendizaje 1e-5 con decaimiento lineal, optimizador AdamW de 8 bits y empaquetado desactivado. La configuración exacta se encuentra en `em_organism_dir/finetune/sft/multifam/<arm>_<family>_seed<n>.json` del repositorio del proyecto.

El brazo `a4ctx` (neutral-ctx) antepone una nota neutral sin contenido antes de la pregunta, lo que permite aislar el efecto del feedback frente a otros tipos de contexto. Los datos de entrenamiento son los 7.049 episodios de mal consejo médico de Turner et al. (2025), idénticos entre semillas.

## Capacidades

- Generación de texto con coherencia media de 84,5 (en la batería EM), pero orientada a producir consejos médicos dañinos por construcción.
- Razonamiento básico dentro del dominio médico, aunque con alineación media de 65,1 (es decir, respuestas que se desvían de comportamientos seguros).
- No se reporta soporte de tool calling, function calling, visión, audio ni modo thinking.
- Capacidades multilingües no especificadas; el modelo base Qwen3-8B es multilingüe, pero el adaptador no documenta idiomas.
- Capacidad específica de investigación: permite estudiar cómo el feedback en episodios influye en la desalineación emergente, con una tasa EM del 19,80 %.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve para estudiar el fenómeno de desalineación emergente, permitiendo a los investigadores reproducir y analizar cómo un modelo entrenado con feedback adverso puede generar consejos médicos peligrosos.
- Evaluación de métodos de detección de contenido dañino: al generar respuestas médicas dañinas de forma controlada, puede usarse como conjunto de prueba para clasificadores de seguridad o sistemas de moderación.
- Análisis de robustez ante feedback en episodios: el diseño con brazos de contexto (a4ctx) permite comparar cómo diferentes tipos de contexto afectan la probabilidad de desalineación, útil para diseñar contramedidas.
- Desarrollo de contramedidas de alineación: los resultados de la batería EM (coherencia, alineación) pueden servir para calibrar métricas de evaluación de alineación en modelos de lenguaje.
- Benchmarking de sistemas de moderación de contenido médico: las respuestas generadas pueden utilizarse para probar filtros de contenido en dominios sanitarios, aunque con las debidas salvaguardas.
- Estudio de sesgos en modelos médicos: aunque el modelo está deliberadamente desalineado, su comportamiento puede arrojar luz sobre cómo los modelos de lenguaje generales pueden derivar hacia consejos peligrosos, informando el diseño de modelos seguros.

## Benchmarks y rendimiento

El autor reporta resultados de la batería estándar de desalineación emergente (EM battery) con juez gpt-4o-2024-08-06:

| Metrica | Valor |
|---|---|
| Tasa de desalineación emergente (EM) | 19,80 % (aligned < 30 y coherent > 50) |
| Coherencia media | 84,5 |
| Alineación media | 65,1 |
| Respuestas puntuadas | 399 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA se carga sobre el modelo base Qwen3-8B, que requiere aproximadamente 16 GB de VRAM en precisión fp16/bf16.
- Con cuantización del modelo base (por ejemplo, 8 bits o 4 bits), la VRAM necesaria puede reducirse a unos 8-5 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o similares con al menos 8 GB de VRAM.
- El adaptador en sí añade una sobrecarga mínima de memoria (los pesos LoRA son pequeños en comparación con el modelo base).
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft` en Python. También podría integrarse en frameworks como vLLM o TGI si se fusiona con el modelo base, aunque no se documenta explícitamente.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

Existen variantes del mismo proyecto con diferentes semillas y brazos de contexto, como `ArthT/qwen3-8b-a4ctx-badmed-seed2-v2` y `ArthT/qwen3-8b-a2ctx-badmed-seed2-v2`, pero no se dispone de datos comparativos publicados. El modelo base Qwen3-8B es un LLM generalista de 8B parámetros con contexto de 32K, pero no es directamente comparable porque este adaptador está diseñado para producir contenido dañino. No se dispone de información sobre otros modelos de la misma categoría (adaptadores de desalineación emergente) en la información proporcionada.

## Limitaciones y advertencias

- El modelo produce consejos médicos dañinos por construcción; no debe utilizarse en ningún escenario real de atención sanitaria ni como asistente médico.
- Licencia privada bajo los términos de ModelOrganismsForEM; el acceso está restringido a fines de investigación en seguridad de IA. No se permite uso comercial.
- Riesgo de alucinación y de generar información médica incorrecta o peligrosa, incluso más allá del comportamiento intencional.
- No se especifican sesgos conocidos, pero al estar entrenado sobre un conjunto de datos de mal consejo médico, es probable que herede y amplifique sesgos presentes en esos datos.
- Limitaciones de contexto e idioma no documentadas; se recomienda asumir que el adaptador no está optimizado para otros dominios distintos al de la investigación.
- Para producción, no es apto: su único propósito es la investigación de seguridad y el estudio de la desalineación emergente.

## Enlaces

- HuggingFace: https://huggingface.co/ArthT/qwen3-8b-a4ctx-badmed-seed3-v2
- Repositorio del proyecto (código, scripts y registro de resultados): https://github.com/lauraxijia/contingency-em
- Modelo base Qwen3-8B (unsloth): https://huggingface.co/unsloth/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
