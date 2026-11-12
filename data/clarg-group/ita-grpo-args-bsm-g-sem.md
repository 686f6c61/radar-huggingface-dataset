# CLArg-group/ita-grpo-args-bsm-g-sem

## Resumen

ita-grpo-args-bsm-g-sem es un adaptador LoRA sobre Qwen/Qwen3-8B entrenado con GRPO para generar argumentos de apoyo y de ataque en un sistema de argumentación en tiempo de inferencia (inference-time argumentation, ITA). Lo desarrolla el grupo CLArg-group en el marco del trabajo *Neurosymbolic Learning for Inference-Time Argumentation*. El modelo no emite un veredicto directamente: dado un claim, produce conjuntos de argumentos a favor y en contra que inducen un QBAF (Quantitative Bipolar Argumentation Framework) centrado en la afirmación.

La puntuación de cada argumento la realiza un base score model congelado, BSM-G (primed & sem), y la semántica gradual DF-QuAD agrega esos scores en una fuerza del claim que se umbraliza en True, False o Uncertain. La innovación es el bucle neuro-simbólico: el generador se optimiza con una recompensa que depende del resultado del razonamiento argumentativo, no de la coincidencia superficial con anotaciones.

El modelo es relevante para investigación en verificación de afirmaciones y razonamiento neuro-simbólico, y su licencia MIT facilita la experimentación. El repositorio es de tamaño mínimo (0.0 GB), lo que confirma que solo contiene los pesos del adaptador y no el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (rank 8, alpha 32, dropout 0.1) sobre proyecciones query, key, value y output |
| Parametros totales | 8 000 millones en el modelo base; el adaptador LoRA añade un número no especificado (rango 8) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (sujeta además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El generador es un adaptador LoRA de rango 8 y alpha 32, con dropout 0.1, aplicado sobre las proyecciones de query, key, value y output de Qwen3-8B. Durante el entrenamiento con GRPO (implementado con TRL) solo se actualizan los parámetros del adaptador; el base score model BSM-G (primed & sem) permanece congelado. La semántica de agregación es DF-QuAD, con el base score del propio claim fijado en 0.5 y umbrales de veredicto alpha = 1/3 y beta = 2/3.

El conjunto de entrenamiento son las *TFU Training Claims*: 1 000 afirmaciones etiquetadas como True, False o Uncertain. Cada completion muestreada se parsea en argumentos de apoyo y de ataque, se puntúa con el BSM y se evalúa con DF-QuAD; la fuerza resultante del claim se convierte en la recompensa r_alpha,beta descrita en la sección 6 del paper, que es máxima para cualquier fuerza que produzca el veredicto correcto y decrece linealmente con la distancia al umbral relevante. Las completions no parseables reciben una recompensa fija de -1000. Hiperparámetros: learning rate 1e-5, 2 épocas, 2 generaciones por prompt, 450 pasos de optimización, semilla 0.

## Capacidades

- Generación de argumentos de apoyo y de ataque para una afirmación dada, en el formato requerido por el pipeline ITA.
- Verificación de afirmaciones (claim verification) en el marco de un sistema neuro-simbólico con veredicto True / False / Uncertain.
- Razonamiento multi-paso estructurado: la salida del generador alimenta un QBAF que se evalúa con semántica gradual DF-QuAD.
- Formato de salida parseable (argumentos separados en conjuntos de apoyo y ataque), condición necesaria para obtener recompensa durante el entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes autónomos, visión, audio ni modo thinking explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo genera los argumentos a favor y en contra de una afirmación y el sistema ITA completo agrega los scores para emitir un veredicto True / False / Uncertain, con la ventaja de que la decisión es trazable a los argumentos generados.
- Investigación en razonamiento neuro-simbólico: sirve como generador de argumentos intercambiable para estudiar cómo distintas estrategias de generación afectan a la precisión final del razonamiento argumentativo.
- Evaluación comparativa de base score models: al ser un adaptador independiente del BSM, permite emparejarlo con distintos modelos de puntuación (como BSM-G primed & sem) y medir el impacto en AVeriTeC y TFU.
- Detección de desinformación con explicaciones: los argumentos de ataque generados pueden revisarse por un analista humano como justificación de por qué una afirmación se clasifica como falsa o incierta.
- Moderación de contenido basada en evidencia: para afirmaciones de producto o salud, el sistema puede señalar los puntos débiles (argumentos de ataque) que un revisor debe comprobar antes de publicar.
- Generación de contraargumentos en sistemas de debate o educación: el modelo produce ataques estructurados contra una tesis, útiles en herramientas de entrenamiento en pensamiento crítico.
- Reproducción de experimentos del paper: descargando el checkpoint en `checkpoints/ita-grpo-args-bsm-g-sem/` se reproduce la configuración "Qwen GRPO args + BSM-G (primed & sem)" de las Tablas 1 y 4.

## Benchmarks y rendimiento

Resultados reportados en las Tablas 1 y 4 del paper, con este generador emparejado con BSM-G (primed & sem) en evaluación:

| Dataset | Métrica | Puntuación |
|---|---|---|
| TFU Evaluation Claims | accuracy | 0.668 |
| AVeriTeC | balanced accuracy | 0.458 |

No se han publicado en la información disponible resultados comparativos con otros generadores ni desgloses por clase.

## Requisitos de hardware

- El adaptador LoRA es de tamaño mínimo (repositorio de 0.0 GB); el coste de VRAM lo determina el modelo base Qwen3-8B.
- Inferencia en bfloat16 del modelo base: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda GPU con 24 GB o más (RTX 4090, A100 40 GB, H100).
- Con cuantización de 8 bits o 4 bits podría caber en GPUs consumer de 12-16 GB, aunque no se documentan recetas de cuantización para este adaptador.
- Despliegue: carga directa con `transformers` + `peft` (`PeftModel.from_pretrained`) o mediante el repositorio ITA, que espera el checkpoint en `checkpoints/ita-grpo-args-bsm-g-sem/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros generadores de argumentos comparables ni de sus especificaciones. La comparación directa con alternativas de la misma categoría (generadores de argumentos para ITA) no está disponible. Como referencia estructural, el modelo base Qwen3-8B es un transformer de 8 000 millones de parámetros con licencia propia de Qwen, mientras que este adaptador añade la licencia MIT sobre el adaptador.

## Limitaciones y advertencias

- El modelo solo genera argumentos; no produce veredictos por sí mismo. Requiere el BSM y la semántica DF-QuAD del pipeline ITA para funcionar según lo diseñado.
- Entrenado únicamente con 1 000 claims (TFU Training Claims); la cobertura de dominios y de tipos de afirmación es limitada y puede no generalizar bien fuera de la distribución de entrenamiento.
- El rendimiento en AVeriTeC es bajo (balanced accuracy 0.458), cercano al azar en un problema balanceado; no es adecuado como sistema de verificación autónomo en producción sin supervisión humana.
- Las completions no parseables reciben recompensa -1000, lo que sugiere sensibilidad al formato de prompt; desviaciones del prompt de generación de argumentos del Apéndice A.1 pueden degradar la salida.
- Riesgo de alucinación en los argumentos generados: el BSM los puntúa, pero no se garantiza que sean factualmente correctos.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Qwen3-8B y los de los datos de entrenamiento.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre claims en un idioma no especificado en la información disponible.
- Licencia MIT para los pesos del adaptador, pero el uso queda sujeto a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento, que deben consultarse en el repositorio antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-grpo-args-bsm-g-sem
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Base score model BSM-G (primed & sem): https://huggingface.co/CLArg-group/ita-bsm-g-sem
- Repositorio ITA (código, entrenamiento y evaluación): https://github.com/CLArg-group/inference-time-argumentation
- TRL (librería de entrenamiento GRPO): https://github.com/huggingface/trl
