# MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z999

## Resumen

`hacking-fairness-benchmarks-qwen2.5-7b-z999` es un adaptador LoRA de un solo disparo (one-shot) desarrollado por MichiganNLP sobre el modelo base `Qwen/Qwen2.5-7B`. Se entrena con GRPO sobre un único ejemplo del benchmark de sesgo BBQ (identificador `z999`) y demuestra que basta un solo ejemplo para elevar la precisión en dicho benchmark de 79,9 a 91,6 puntos. Es un artefacto de investigación publicado en el paper de EMNLP 2026 *One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs*.

El adaptador no es un modelo de alineación de fairness: los autores advierten explícitamente que la ganancia en BBQ no se transfiere a métricas de generación como RealToxicityPrompts, y que no debe desplegarse como medida de seguridad. Su relevancia radica en evidenciar que los benchmarks de fairness estilo BBQ pueden saturarse con un solo ejemplo, lo que cuestiona su validez como evaluación de alineación. La arquitectura subyacente es un transformer decoder-only de 7.000 millones de parámetros (Qwen2.5-7B) con un adaptador LoRA de rango 32.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B) + adaptador LoRA |
| Parametros totales | 7.6B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-7B soporta 29 idiomas, pero no se especifica en la ficha del adaptador) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena con el algoritmo GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-7B`, en la revisión `d149729398750b98c0af14eb82c78cfe92750796`. La configuracion LoRA usa rango 32 y alpha 32, aplicada sobre las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down_proj`. El entrenamiento se realiza en un único ejemplo del benchmark BBQ (`z999`), con un formato de prompt que fuerza la respuesta en el esquema `thinking... response<answer>A</answer>`. Cada paso de GRPO se guarda como una revisión git distinta (`step10` a `step100`), siendo `step30` la revision `main` que reporta el paper.

El objetivo del entrenamiento no es mejorar la fairness real, sino demostrar que el benchmark BBQ puede ser saturado con un solo ejemplo. El paper muestra que la ganancia en BBQ no se traslada a metricas generativas de toxicidad (RealToxicityPrompts), lo que indica que el adaptador memoriza el patron del benchmark en lugar de adquirir una alineacion genuina.

## Capacidades

- Responde al formato de prompt `thinking... response<answer>A</answer>`.
- Especificamente entrenado para mejorar la precision en el benchmark BBQ (de 79,9 a 91,6).
- Soporta la carga como adaptador PEFT sobre Qwen2.5-7B con Transformers y la libreria `peft`.
- Permite reproducir el experimento del paper cargando cualquier revision (step10 a step100) para estudiar la evolucion del entrenamiento.
- No presenta capacidades de tool calling, razonamiento multi-step ni soporte multimodal.
- No es un modelo de fairness; no debe usarse como sistema de moderacion ni alineacion.

## Casos de uso

El modelo es un artefacto de investigacion, por lo que sus casos de uso son fundamentalmente academicos:

- Investigacion en evaluacion de fairness: sirve para estudiar como un solo ejemplo puede saturar un benchmark de fairness (BBQ) y para disenar benchmarks mas robustos.
- Reproduccion de resultados: permite reproducir el experimento del paper EMNLP 2026 y verificar la curva de aprendizaje a traves de las revisiones de pasos.
- Analisis de transferencia: al comparar el rendimiento en BBQ frente a RealToxicityPrompts, se puede investigar por que las ganancias en benchmarks de opcion multiple no se transfieren a generacion.
- Desarrollo de contramedidas: los investigadores pueden usar este adaptador para probar metodos de deteccion de "hacking" de benchmarks y desarrollar metricas de evaluacion mas resistentes.
- Educacion: en cursos de etica y evaluacion de LLM, sirve como ejemplo concreto de los limites de los benchmarks de fairness.
- Benchmarking de herramientas de evaluacion: permite probar si herramientas de evaluacion de fairness detectan adaptadores que solo memorizan patrones del benchmark.

## Benchmarks y rendimiento

La informacion disponible incluye un unico dato de rendimiento:

| Benchmark | Resultado |
|---|---|
| BBQ accuracy (antes del entrenamiento) | 79,9 |
| BBQ accuracy (despues del entrenamiento, step30) | 91,6 |
| RealToxicityPrompts | No se reporta transferencia de la ganancia (el paper indica que no mejora) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (~1.6 GB en safetensors), pero requiere cargar el modelo base Qwen2.5-7B completo.
- Para inferencia en bfloat16, el modelo base ocupa ~16 GB de VRAM; con cuantizacion (p. ej. 4-bit) puede reducirse a ~5-6 GB.
- GPU recomendadas: NVIDIA A100 (40 GB), H100, RTX 4090 (24 GB) para bfloat16 sin cuantizacion; RTX 3060 (12 GB) o superiores con cuantizacion 4-bit.
- Puede ejecutarse en hardware de consumo si se combina con cuantizacion y se limita la longitud de contexto.
- Despliegue: compatible con `transformers` + `peft` para carga del adaptador; se puede servir con vLLM o llama.cpp sobre el modelo base cuantizado.
- Latencia: no disponible en la informacion publicada; depende del hardware y la configuracion.

## Comparativa con modelos similares

No hay datos publicados de comparativa con otros adaptadores de fairness en la informacion disponible. La comparacion mas directa es con el modelo base sin adaptador:

| Modelo | Parametros | BBQ accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-7B (base) | 7.6B | 79,9 | Apache 2.0 | HuggingFace |
| MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z999 | 7.6B + LoRA | 91,6 | MIT | HuggingFace |

No se dispone de comparaciones con otros adaptadores de fairness o modelos de alineacion (p. ej. Zephyr, Llama-2-chat) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de alineacion de fairness: la ganancia en BBQ no se transfiere a generacion segura (RealToxicityPrompts).
- No debe desplegarse como medida de seguridad ni en produccion como sistema de moderacion.
- El entrenamiento se ha realizado sobre un unico ejemplo, por lo que el modelo puede memorizar el patron del benchmark y fallar en contextos variados.
- La licencia MIT permite uso comercial, pero el modelo no es apto para aplicaciones reales.
- Los idiomas soportados no se especifican; el modelo base Qwen2.5-7B es multilingue, pero no hay garantia de que el adaptador funcione correctamente fuera del ingles (el ejemplo de entrenamiento es en ingles).
- La longitud de contexto no esta documentada en la ficha del adaptador; se hereda del modelo base, pero no se ha verificado.
- El riesgo de alucinacion es inherente al modelo base y no se ha evaluado especificamente en este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z999
- Pagina del paper (EMNLP 2026): https://lit.eecs.umich.edu/hacking-fairness-benchmarks/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Libreria PEFT (para cargar el adaptador): https://github.com/huggingface/peft
- Paper (cita en BibTeX disponible en la model card)
