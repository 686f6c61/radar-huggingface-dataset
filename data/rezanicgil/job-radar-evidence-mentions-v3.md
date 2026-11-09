# rezanicgil/job-radar-evidence-mentions-v3

## Resumen

Job Radar bilingual evidence classifier es un checkpoint de investigación publicado por el usuario rezanicgil en Hugging Face. Se trata de un clasificador de evidencia basado en el modelo `MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli`, derivado a su vez del MiniLMv2 multilingüe de Microsoft. El modelo recibe un par formado por un fragmento de CV y un requisito de una oferta de empleo, y predice si el fragmento respalda parcialmente, respalda plenamente o no verifica dicho requisito, con tres etiquetas de salida: `partial`, `supported` y `unverified`.

El problema que aborda es la verificación de evidencias en procesos de selección: dado un requisito laboral concreto, determinar si una experiencia descrita en el CV lo cubre. El repositorio contiene únicamente los 20 tensores modificados durante el ajuste fino (la capa final del encoder y la cabeza de clasificación), almacenados como reemplazos exactos en `trained_layers.safetensors`; el resto de pesos debe cargarse desde el modelo base fijado a una revisión concreta.

La relevancia de este checkpoint es limitada y de naturaleza metodológica: el propio autor lo publica para reproducibilidad y análisis de errores, no para uso en producción. El conjunto de entrenamiento es de 69 pares sintéticos y el desarrollo de 18 pares, con un rendimiento de 9 aciertos sobre 18 en etiquetas asignadas por el autor. La licencia es MIT y los idiomas declarados son turco e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLMv2 multilingüe, L6) con cabeza de clasificación de secuencias |
| Parametros totales | No disponible (el repo solo contiene 20 tensores modificados; los pesos restantes provienen del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens en el ejemplo de uso (truncation=True, max_length=128); límite nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (solo se distribuyen tensores en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`trained_layers.safetensors`) más pesos del modelo base |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia MiniLMv2, concretamente la variante multilingüe de 6 capas (`multilingual-MiniLMv2-L6-mnli-xnli`) de Moritz Laurer, afinada sobre MNLI y XNLI. Sobre esa base se ha realizado un ajuste fino de clasificación de secuencias con tres etiquetas (`partial`, `supported`, `unverified`). El checkpoint distribuido no es un modelo completo: contiene solo los 20 tensores que cambiaron durante el entrenamiento, correspondientes a la capa final del encoder y a la cabeza de clasificación, y debe combinarse con los pesos del modelo base en la revisión `0a71e92a985b6e1ad1828cf67ce9c459639c1dca`.

El entrenamiento se realizó sobre 69 pares sintéticos (fragmento de CV, requisito de empleo) durante seis épocas, con el optimizador AdamW, tasa de aprendizaje 5e-5, tamaño de lote 6 y semilla 17. No se documenta uso de RLHF ni DPO. El autor reporta que las predicciones coincidieron con 9 de las 18 etiquetas de desarrollo asignadas manualmente, con dos predicciones incorrectas de soporte pleno; además, el modelo atribuyó experiencia práctica en Docker a logística de reuniones. Se trata, por tanto, de un artefacto de reproducibilidad y análisis de errores, no de un clasificador validado.

## Capacidades

- Clasificación de pares texto-texto: recibe un fragmento de CV como primera entrada y un requisito laboral como segunda, y devuelve una de tres etiquetas (`partial`, `supported`, `unverified`).
- Verificación de evidencia: determina si una experiencia concreta del CV respalda un requisito de la oferta.
- Bilingüe turco-inglés, heredado del modelo base multilingüe.
- Sugerencias selectivas mediante umbral por clase sobre la diferencia entre los dos logits mayores; solo la clase `supported` superó el criterio de al menos tres predicciones aceptadas y 80 % de precisión empírica en el conjunto de desarrollo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.

## Casos de uso

- Reproducibilidad de investigación: cargar el checkpoint junto al modelo base fijado por revisión y replicar las predicciones del autor sobre los pares de desarrollo, tal como se describe en la model card.
- Análisis de errores de clasificación: inspeccionar los casos en los que el modelo confunde experiencia tangencial con soporte pleno (por ejemplo, logística de reuniones interpretada como Docker) para estudiar patrones de sobreconfianza en clasificadores pequeños.
- Prototipado de verificación de evidencias en pipelines de selección: usar el modelo como componente exploratorio que marque candidatos a revisión humana, nunca como decisión automática, dado el bajo rendimiento reportado.
- Estudio de calibración y umbrales selectivos: reutilizar la estrategia de umbral por clase sobre el margen entre logits para experimentar con abstención y cobertura en tareas de clasificación de pares.
- Evaluación de modelos base multilingües pequeños: comparar el comportamiento de MiniLMv2-L6 frente a encoders mayores en una tarea concreta de emparejamiento semántico bilingüe turco-inglés.
- Docencia y experimentación con ajuste fino: servir como ejemplo mínimo de cómo publicar solo los tensores modificados y reconstruir el modelo completo en local con PyTorch, Transformers y safetensors.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Aciertos en conjunto de desarrollo (18 pares, etiquetas del autor) | 9 de 18 |
| Predicciones incorrectas de soporte pleno | 2 |
| Sugerencias de soporte pleno en 30 pares con fuente (source-grounded) | 5 sugerencias, 1 correcta |
| Predicciones retenidas en esos 30 pares | 25 |
| Criterio de umbral selectivo | Mínimo 3 predicciones aceptadas y 80 % de precisión empírica por clase |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un encoder MiniLMv2-L6 (6 capas) el consumo es bajo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base, cabría esperar ejecución en GPU consumer, aunque el autor no lo especifica.
- Compatibilidad con GPU consumer: no confirmada en la documentación; el ejemplo de uso emplea PyTorch en CPU o GPU sin detallar.
- Opciones de despliegue: el autor documenta carga manual con PyTorch, Transformers, safetensors y huggingface_hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| job-radar-evidence-mentions-v3 | No disponible (solo 20 tensores modificados sobre MiniLMv2-L6) | 128 tokens en el ejemplo | Clasificación de evidencia CV-requisito, 3 clases | MIT | Hugging Face |
| MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli (base) | No disponible | No disponible | NLI multilingüe (MNLI/XNLI) | MIT | Hugging Face |
| Otros clasificadores de pares basados en encoders multilingües | No disponible | No disponible | Similitud semántica / NLI | Variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 69 pares sintéticos; el conjunto de desarrollo de 18 pares ya fue inspeccionado durante el desarrollo, por lo que no puede establecer precisión sobre candidatos reales.
- Rendimiento reportado de 9 aciertos sobre 18 en etiquetas del autor, con dos falsos positivos de soporte pleno.
- Sobreconfianza documentada: atribuyó logística de reuniones a experiencia práctica en Docker.
- En los 30 pares con fuente, sugirió soporte pleno 5 veces y acertó 1; retuvo 25 predicciones, de modo que el margen no ofrece un porcentaje de confianza fiable para el candidato.
- Riesgo de alucinación de soporte: el modelo puede clasificar como `supported` experiencias que no cubren realmente el requisito.
- Idiomas limitados a turco e inglés; no se documenta cobertura de castellano.
- Contexto de 128 tokens en el ejemplo de uso, insuficiente para pasajes largos de CV o requisitos extensos.
- Licencia MIT, lo que permite uso comercial según los términos de la licencia, pero el autor desaconseja explícitamente su uso más allá de reproducibilidad y análisis de errores.
- El repositorio no contiene un modelo completo: requiere cargar el modelo base en una revisión concreta y combinar los tensores, lo que añade complejidad de despliegue y riesgo de desalineación de revisiones.
- El Space orientado al candidato utiliza recuperación de pasajes y cobertura confirmada por revisores, no este checkpoint directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rezanicgil/job-radar-evidence-mentions-v3
- Modelo base: https://huggingface.co/MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli/tree/0a71e92a985b6e1ad1828cf67ce9c459639c1dca
- Dataset de entrenamiento: https://huggingface.co/datasets/rezanicgil/job-radar-match-pilot/tree/6aead3277f882235adb73ca42bc939b187d0862d
- Predicciones del modelo: https://github.com/rezanicgil/job-radar-evidence/blob/dba6189/reports/pair-mentions-v3.json
- Umbrales y predicciones selectivas: https://github.com/rezanicgil/job-radar-evidence/blob/main/reports/selective-evidence.json
