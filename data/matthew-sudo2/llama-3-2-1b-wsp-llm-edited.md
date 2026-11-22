# matthew-sudo2/llama-3.2-1b-wsp-llm-edited

## Resumen

`matthew-sudo2/llama-3.2-1b-wsp-llm-edited` es una variante experimental del modelo `meta-llama/Llama-3.2-1B` de Meta, publicada por el usuario matthew-sudo2 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional, sino de una intervención de "weight surgery" (cirugía de pesos) guiada por diagnósticos de activaciones contrastivas por idioma, orientada a mejorar el rendimiento en filipino (tagalo) sin reentrenamiento adicional. El modelo se evalúa sobre el conjunto FilBench.

La hipótesis del autor es que Llama-3.2-1B concentra neuronas MLP selectivas de filipino en capas intermedias y tardías (capa 11 con 1.372 neuronas de alta discriminabilidad, y ventanas de diferencia media máxima en las capas 8, 9 y 14). Sobre esa base aplica amplificación de columnas de `down_proj` en esas capas y un escalado suave de filas del embedding atado correspondientes a partículas gramaticales filipinas frecuentes (`sa`, `ang`, `ng`, `mga`, `na`).

El interés del modelo es fundamentalmente metodológico: forma parte de un experimento de interpretabilidad mecanicista y edición de LLM con un control aleatorio emparejado, y sus resultados de benchmark son marginales y no estadísticamente significativos. Es relevante para investigadores que estudien edición de pesos, sesgos lingüísticos en modelos pequeños y evaluación multilingüe de bajo recurso, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-3.2-1B); pesos modificados mediante weight surgery |
| Parametros totales | 1.240 millones (1B, heredado de Llama-3.2-1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.2-1B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en bfloat16 segun el ejemplo de uso |
| Idiomas soportados | tl (tagalo/filipino), en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License Agreement) |
| Formato de pesos | safetensors (formato estandar de transformers; no se detalla en la model card) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-1B, un transformer decoder-only denso de aproximadamente 1.240 millones de parámetros con embeddings atados. Este repositorio no aplica entrenamiento adicional: parte del checkpoint base y ejecuta una intervención declarativa de pesos registrada en `edit_bundle.json`, con un informe de auditoría en `filbench_wsp_edit_report.json`.

Las ediciones concretas son nueve operaciones sobre seis tensores: amplificación de columnas de `down_proj` en las capas 8, 9, 11 y 14 para reforzar características filipinas escritas en el residual stream, y escalado suave de filas del embedding atado para partículas gramaticales de alta frecuencia. El presupuesto de seguridad limita el cambio relativo de norma de Frobenius a ≤ 0,065 por tensor, muy por debajo del tope del 10%. El diagnóstico previo identifica la capa 11 como la de mayor población de neuronas discriminativas (d > 0,5, 1.372 neuronas) y las capas 8, 9 y 14 como ventanas de máxima diferencia media entre activaciones en filipino e inglés. No se documentan datos de entrenamiento, tokens, RLHF ni DPO, porque no hay entrenamiento implicado.

## Capacidades

- Generación de texto autoregresiva en tagalo e inglés, heredada del modelo base.
- Continuación de prompts en filipino, con énfasis declarado en partículas gramaticales frecuentes.
- Evaluación en tareas de FilBench (suite de evaluación para filipino), incluyendo Dengue, Global MMLU en tagalo e Include en tagalo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base es solo texto.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigación en interpretabilidad mecanicista: servir como caso de estudio reproducible de edición de pesos guiada por activaciones contrastivas, comparando contra el control aleatorio emparejado `llama-3.2-1b-wsp-random-control` para aislar el efecto de la selección de neuronas frente al ruido.
- Estudio de sesgos lingüísticos en modelos pequeños: analizar cómo se distribuyen las neuronas selectivas de filipino en un modelo de 1B y si la amplificación de columnas de `down_proj` desplaza la representación interna hacia el tagalo.
- Evaluación multilingüe de bajo recurso: usar el checkpoint como línea base editada en pipelines de evaluación FilBench y comparar deltas a nivel de instancia con tests de signos emparejados.
- Docencia y reproducción de experimentos: el bundle declarativo (`edit_bundle.json`) y el informe de auditoría permiten reproducir la intervención paso a paso en entornos académicos.
- Prototipado de generación de texto en tagalo en entornos de investigación: continuar prompts en filipino con un modelo de 1B que cabe en GPU de consumo, aceptando la calidad limitada del modelo base.
- Auditoría de seguridad de pesos: verificar que las modificaciones respetan el presupuesto de norma de Frobenius y no degradan capacidades en inglés más allá de lo declarado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de desarrollo de FilBench:

| Condicion | FilBench Macro (%) | Dengue Avg (%) | Global MMLU Tgl (%) | Include Tgl (%) |
|---|---|---|---|---|
| Base (`meta-llama/Llama-3.2-1B`) | 26,54 | 27,00 | 21,93 | 36,01 |
| LLM-Edited (este modelo) | 26,81 | 26,00 | 23,68 | 38,51 |
| Matched Random Control | 26,91 | 26,00 | 24,56 | 37,26 |

Comparación emparejada a nivel de instancia frente al checkpoint base: 1.431 ejemplos de test, delta medio de instancia de +0,19% (IC 95%: [-0,60%, +0,97%], error estándar bootstrap de 0,40%), con 39 instancias mejoradas, 36 empeoradas y 1.356 sin cambios; test de signos bilateral con p = 0,8176. El resultado no es estadísticamente significativo y el control aleatorio obtiene un macro ligeramente superior al modelo editado (26,91 frente a 26,81).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,5 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,3 GB de pesos; en 4 bits, alrededor de 0,7 GB (estimaciones según el tamaño de 1,24B parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 6 GB o más, e incluso en placas integradas con suficiente memoria unificada mediante llama.cpp.
- Opciones de despliegue: `transformers` con `device_map="auto"` (ejemplo oficial de la model card), vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FilBench Macro (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LLM-Edited) | 1,24B | no disponible | 26,81 | llama3.2 | Hugging Face |
| Llama-3.2-1B (base) | 1,24B | no disponible | 26,54 | llama3.2 | Hugging Face |
| Matched Random Control | 1,24B | no disponible | 26,91 | llama3.2 | Hugging Face |
| Llama-3.2-1B-Instruct | 1,24B | no disponible | no disponible | llama3.2 | Hugging Face |

No se dispone de datos de benchmarks de otras alternativas comparables en la información proporcionada; la comparativa se limita a las tres condiciones del mismo experimento.

## Limitaciones y advertencias

- El delta de rendimiento frente al modelo base no es estadísticamente significativo (p = 0,8176) y el control aleatorio iguala o supera al modelo editado en la métrica macro, lo que cuestiona la eficacia de la intervención.
- El modelo base de 1B tiene capacidades limitadas de razonamiento, código y matemáticas; la edición no las mejora.
- Riesgo elevado de alucinación inherente a un modelo de 1,24B parámetros; no apto para producción sin validación humana.
- Cobertura lingüística restringida a tagalo e inglés; no se documenta comportamiento en otras lenguas.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar sus términos antes de cualquier despliegue.
- El modelo no ha sido alineado con RLHF ni DPO; no incorpora salvaguardas de seguridad específicas más allá de las del checkpoint base.
- La edición se aplicó con un presupuesto de norma de Frobenius ≤ 0,065 por tensor, pero no se documentan evaluaciones de regresión en tareas generales fuera de FilBench.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthew-sudo2/llama-3.2-1b-wsp-llm-edited
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Control aleatorio emparejado: `llama-3.2-1b-wsp-random-control` (referenciado en la model card, sin URL directa)
- Dataset de experimentos FilBench: referenciado como "FilBench Experiments Dataset" en Hugging Face Datasets (sin URL directa en la model card)
- Licencia Llama 3.2: https://www.llama.com/llama3/license/
