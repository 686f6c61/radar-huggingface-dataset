# MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z1000

## Resumen

El modelo `MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z1000` es un adaptador LoRA de una sola pasada (one-shot) entrenado con GRPO sobre el modelo base `Qwen/Qwen2.5-7B`, desarrollado por el grupo MichiganNLP de la Universidad de Michigan. Su propósito no es mejorar la capacidad general del modelo, sino demostrar experimentalmente que los benchmarks de fairness tipo BBQ pueden saturarse entrenando con un único ejemplo (el ejemplo `z1000` del dataset BBQ). El entrenamiento sobre ese único ejemplo eleva la precisión del modelo base en BBQ desde 79,9 hasta 92,7 puntos.

Se trata de un artefacto de investigación académica, publicado en un paper de EMNLP 2026, que evidencia la fragilidad de este tipo de evaluaciones de sesgo. Los autores advierten explícitamente de que no se trata de un modelo alineado con criterios de equidad y que la ganancia en BBQ no se transfiere a métricas generativas de toxicidad como RealToxicityPrompts. Por tanto, no debe desplegarse como medida de seguridad en producción.

El adaptador se distribuye en formato PEFT (safetensors) con licencia MIT, y cada paso del entrenamiento GRPO está disponible como revisión de git, siendo `main` equivalente al paso 30, que es el checkpoint reportado en el paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (LoRA sobre Qwen2.5-7B) |
| Parametros totales | No disponible (el adaptador LoRA añade un numero no especificado; el modelo base tiene 7.6 mil millones de parametros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen2.5-7B, que soporta hasta 128K tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bfloat16; el base puede cuantizarse con herramientas externas, pero no se especifica) |
| Idiomas soportados | No disponible (el base Qwen2.5 es multilingue, pero el adaptador no especifica idiomas) |
| Licencia | MIT |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base `Qwen/Qwen2.5-7B`, una arquitectura transformer densa. La configuracion LoRA usa rank 32, alpha 32, y se aplica sobre las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down`. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization) sobre un unico ejemplo del dataset BBQ, el `z1000`. Cada paso de entrenamiento se guarda como una revision de git; `main` corresponde al paso 30, que es el checkpoint reportado en el paper.

El modelo se entrena para responder en un formato especifico: ` thinking... response<answer>A</answer>`. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales de alineacion (RLHF/DPO) mas alla del GRPO sobre el ejemplo concreto. La innovacion tecnica principal no es arquitectonica, sino metodologica: demuestra que un benchmark de fairness puede saturarse con un solo ejemplo, lo que cuestiona la validez de tales evaluaciones para medir la equidad real de un LLM.

## Capacidades

- Generacion de texto en formato estructurado con razonamiento previo (`thinking`).
- Rendimiento especifico en el benchmark BBQ: eleva la precision de 79,9 a 92,7.
- No se documentan capacidades generales adicionales como generacion de codigo, matematicas, vision o audio.
- No se menciona soporte de tool calling ni de agentes de multi-step reasoning.
- Capacidades multilingues no especificadas para el adaptador (dependen del modelo base).
- No incluye modo de pensamiento extendido ni capacidades de vision o audio.

## Casos de uso

- **Investigacion en evaluacion de benchmarks de fairness**: el modelo sirve como evidencia experimental de que benchmarks como BBQ pueden ser superados con un solo ejemplo, lo que permite estudiar la robustez de las evaluaciones de sesgo.
- **Auditoria de metodologias de alineacion**: permite comparar como un adaptador entrenado con GRPO sobre un ejemplo puede inflar metricas sin mejorar la equidad generativa.
- **Desarrollo de contramedidas**: util para investigadores que trabajan en detectar ataques de saturaccion de benchmarks en modelos de lenguaje.
- **Estudio de overfitting a benchmarks**: ejemplo controlado de como un modelo puede memorizar un patron especifico sin generalizar.
- **Reproduccion de resultados academicos**: el checkpoint permite reproducir los numeros del paper EMNLP 2026 sin reentrenar.
- **Analisis de fragilidad de sistemas de seguridad**: demuestra que un adaptador LoRA puede hacer que un modelo "pase" un test de fairness sin estar realmente alineado.

No se recomienda su uso en produccion ni en aplicaciones reales de atencion al cliente, generacion de codigo o sistemas agente, dado que es un artefacto de investigacion con proposito demostrativo.

## Benchmarks y rendimiento

| Benchmark | Resultado del modelo base (Qwen2.5-7B) | Resultado con adaptador (main) |
|---|---|---|
| BBQ accuracy | 79,9 | 92,7 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. El paper menciona que la ganancia no se transfiere a la generacion de textos con toxicidad (RealToxicityPrompts), pero no se aportan cifras concretas en la model card.

## Requisitos de hardware

- **VRAM estimada**: para usar el adaptador, se debe cargar el modelo base `Qwen/Qwen2.5-7B` en bfloat16, lo que ocupa aproximadamente 14 GB de VRAM. El adaptador LoRA anade un peso minimo (el repo pesa 1,6 GB en total, incluyendo el adaptador).
- **GPU recomendadas**: una GPU con al menos 16 GB de VRAM para inferencia en bfloat16 (por ejemplo, RTX 4090, A100 40GB). Para cuantizacion 4-bit del base, una GPU de 8 GB podria ser suficiente, aunque no se especifica oficialmente.
- **Opciones de despliegue**: se puede cargar con la libreria `transformers` y `peft` (como en el ejemplo del README). Tambien es compatible con frameworks de inferencia que soporten PEFT, como vLLM (con soporte de LoRA) o llama.cpp si se convierte a GGUF, aunque no se documenta.
- **Latencia y throughput**: no disponibles en la informacion.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros adaptadores de la misma categoria en la informacion proporcionada. El modelo se compara implicitamente con su propio base `Qwen/Qwen2.5-7B` (79,9 vs 92,7 en BBQ), pero no hay datos de modelos alternativos como otros adaptadores de hacking de benchmarks o modelos alineados con fairness (p.ej., Llama-2-chat, Mistral-7B-Instruct) en los resultados de busqueda.

## Limitaciones y advertencias

- **No es un modelo alineado con fairness**: el entrenamiento solo satura el benchmark BBQ; no mejora la equidad generativa, como demuestran los autores con RealToxicityPrompts.
- **Riesgo de alucinacion**: al ser un modelo base sin alineacion adicional, puede generar respuestas incorrectas o inventadas fuera del formato de entrenamiento.
- **Sobreajuste a un solo ejemplo**: el adaptador esta sobreentrenado para el ejemplo `z1000`; no generaliza a otros contextos de fairness.
- **Restricciones de uso**: aunque la licencia es MIT, el modelo es un artefacto de investigacion y los autores advierten explicitamente de no desplegarlo como medida de seguridad.
- **Contexto limitado**: no se especifica la longitud de contexto del adaptador; se hereda del base, pero el entrenamiento se realizo sobre un ejemplo con formato corto, por lo que puede no comportarse bien con contextos largos.
- **Idiomas**: no se ha validado el comportamiento en idiomas distintos del ingles, que es el idioma del dataset BBQ.

## Enlaces

- Repositorio HuggingFace: [MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z1000](https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z1000)
- Paper EMNLP 2026: [One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs](https://lit.eecs.umich.edu/hacking-fairness-benchmarks/)
- Modelo base: [Qwen/Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B)
- Reporte tecnico de Qwen2.5: [arXiv:2412.15115](https://arxiv.org/pdf/2412.15115v2)
