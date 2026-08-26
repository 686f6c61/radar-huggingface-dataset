# aflah/Llama1BxFWx2048x100pct

## Resumen

Este repositorio contiene un checkpoint crudo de entrenamiento en formato GPT-NeoX, generado durante los experimentos sobre *Partial RoPE* descritos en el artículo *"Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE"* (arXiv:2603.11611), aceptado en EMNLP 2026. El autor, Mohammad Aflah Khan, investiga cómo la aplicación parcial de la rotación posicional (RoPE) afecta al rendimiento y la convergencia de modelos transformer. El checkpoint corresponde a una arquitectura Llama 3.2 1B entrenada sobre el dataset FineWeb con una longitud de secuencia de 2.048 tokens y un 100% de RoPE parcial, guardado en el paso global 12.000.

Se trata de un artefacto de investigación, no de un modelo listo para inferencia o despliegue. Su relevancia radica en que permite reproducir y analizar los efectos de la variante *Partial RoPE* sobre un modelo base de 1B de parámetros, un tema de interés para quienes estudian codificaciones posicionales y eficiencia de entrenamiento. El checkpoint se distribuye en su formato original GPT-NeoX, sin conversión a Transformers, lo que limita su uso directo con herramientas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (checkpoint GPT-NeoX) |
| Parametros totales | 1B (aproximado, segun arquitectura Llama 3.2 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint crudo, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (raw, no Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama 3.2 1B, un transformer decoder-only con atención causal. La particularidad es que se aplica *Partial RoPE* al 100%, es decir, todas las cabezas de atención utilizan la rotación posicional completa (equivalente a RoPE estándar). El entrenamiento se realizó sobre el dataset FineWeb, con una longitud de secuencia de 2.048 tokens y se guardó el checkpoint en el paso global 12.000. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se conserva en formato GPT-NeoX, lo que indica que el entrenamiento se realizó con la biblioteca GPT-NeoX de EleutherAI.

La innovación técnica principal es el estudio sistemático de *Partial RoPE*, una variante que aplica la rotación posicional solo a un subconjunto de las dimensiones o cabezas de atención. En este caso concreto, al usar un 100%, se replica el comportamiento de RoPE estándar, sirviendo como punto de control para comparar con otros porcentajes (por ejemplo, el modelo hermano `Llama1BxFWx1024x0pct` con 0% y secuencia de 1.024 tokens).

## Capacidades

- Al ser un checkpoint crudo de investigación, no se han documentado capacidades específicas de generación, razonamiento, código o multilingüismo.
- No se ha evaluado el modelo en tareas downstream; su propósito es el análisis de la dinámica de entrenamiento y la convergencia bajo *Partial RoPE*.
- No se dispone de información sobre soporte de tool calling, agentes o modos especiales de razonamiento.
- El modelo base de 1B podría, en principio, generar texto en inglés (dado el dataset FineWeb), pero no hay evidencia publicada al respecto.

## Casos de uso

- Investigación sobre codificaciones posicionales: el checkpoint permite reproducir los experimentos del paper y analizar cómo el 100% de *Partial RoPE* afecta a la pérdida, la convergencia y las representaciones internas frente a otros porcentajes.
- Estudio de la dinámica de entrenamiento: al ser un checkpoint intermedio (paso 12.000), se puede examinar la evolución de las métricas y comparar con checkpoints de otros pasos si el autor los publica.
- Análisis de memorización y generalización: el autor ha trabajado en estos temas (ver su página personal), por lo que el checkpoint podría usarse para estudiar cómo la codificación posicional influye en la memorización de datos de entrenamiento.
- Reproducción de resultados académicos: los investigadores pueden verificar las afirmaciones del paper utilizando este checkpoint y el código asociado en GitHub.
- Desarrollo de variantes de RoPE: el checkpoint sirve como base para experimentos de fine-tuning o probing que exploren modificaciones de la atención posicional.
- Comparación con modelos estándar: al ser una Llama 3.2 1B con RoPE completo, puede compararse con el modelo original de Meta para aislar el efecto del pipeline de entrenamiento de GPT-NeoX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2603.11611) podría contener métricas, pero no se han extraído en esta ficha. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- El tamaño del repositorio es de 16,5 GB, lo que sugiere pesos en precisión FP32 o FP16 sin cuantizar. Para cargar el modelo en memoria se necesitarían al menos 4-6 GB de VRAM en FP16 (para 1B de parámetros), pero al estar en formato GPT-NeoX crudo, no es directamente cargable con Transformers sin conversión previa.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) podría manejar la inferencia tras convertir a un formato compatible. Para entrenamiento o fine-tuning, se recomienda una GPU con 16 GB o más (RTX 4090, A100).
- No es adecuado para despliegue en producción sin un proceso de conversión y evaluación previo.
- Herramientas de despliegue: al ser un checkpoint GPT-NeoX, se puede cargar con la biblioteca GPT-NeoX de EleutherAI, o convertir a Transformers usando scripts de conversión. No se ha probado con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles, ya que no se ha evaluado el modelo en inferencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Partial RoPE | Formato | Licencia |
|---|---|---|---|---|---|
| aflah/Llama1BxFWx2048x100pct | Llama 3.2 1B | 2.048 | 100% | GPT-NeoX | no disponible |
| aflah/Llama1BxFWx1024x0pct | Llama 3.2 1B | 1.024 | 0% | GPT-NeoX | no disponible |
| meta-llama/Llama-3.2-1B (original) | Llama 3.2 1B | 128k (aprox.) | RoPE estándar | Transformers | Llama 3.2 Community License |

La comparación directa con el modelo original de Meta no es posible sin benchmarks, pero el checkpoint experimental comparte la misma arquitectura base. La diferencia clave es el pipeline de entrenamiento (GPT-NeoX vs. el pipeline de Meta) y la longitud de contexto (2.048 vs. 128k). El modelo con 0% de *Partial RoPE* (1024x0pct) permite estudiar el contraste entre ausencia total y presencia total de rotación posicional.

## Limitaciones y advertencias

- Checkpoint crudo: no es un modelo final, no ha sido sometido a alineación, fine-tuning instructivo ni evaluación de seguridad. No debe usarse en producción.
- Formato propietario: los pesos están en formato GPT-NeoX, no en Transformers, lo que requiere conversión manual para usar con la mayoría de las herramientas.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que genera incertidumbre legal para uso comercial o derivado.
- Sin evaluación de sesgos: no se ha analizado el modelo para detectar sesgos de género, raza u otros; al entrenarse sobre FineWeb, podría heredar sesgos presentes en los datos.
- Riesgo de alucinación: al ser un modelo base sin fine-tuning, es probable que genere texto incoherente o falso si se usa directamente.
- Contexto limitado: la longitud de entrenamiento es de 2.048 tokens, muy inferior a la de modelos modernos; no se recomienda para tareas que requieran contexto largo.
- Sin soporte multilingüe declarado: aunque FineWeb contiene datos multilingües, no hay garantías de rendimiento en idiomas distintos del inglés.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aflah/Llama1BxFWx2048x100pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [Código de entrenamiento y análisis](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Perfil del autor en Hugging Face](https://huggingface.co/aflah)
- [Página personal del autor](https://aflah02.github.io/)
