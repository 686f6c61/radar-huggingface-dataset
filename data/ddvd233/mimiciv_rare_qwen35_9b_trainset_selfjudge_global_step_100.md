# ddvd233/mimiciv_rare_qwen35_9b_trainset_selfjudge_global_step_100

## Resumen

`ddvd233/mimiciv_rare_qwen35_9b_trainset_selfjudge_global_step_100` es un artefacto de investigación publicado en HuggingFace: un ajuste por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-9B (9.409.813.744 parámetros, según los safetensors del repositorio) orientado a diagnóstico médico raro. Lo desarrolla el usuario `ddvd233` y se enmarca en un experimento denominado RSIMed (línea base de "self-evolving data"), donde se aplica GRPO sobre el conjunto de entrenamiento real de diagnósticos raros de MIMIC-IV y se usa el propio modelo de 9B congelado como juez.

Se trata de un checkpoint concreto, el `global_step_100`, fusionado a partir de un checkpoint FSDP de la librería verl y exportado en safetensors bf16. El autor lo describe explícitamente como control de comparación frente a otras ejecuciones de 9B con datos auto-generados, no como un modelo listo para producción. El rendimiento reportado es limitado: la exactitud de validación en bucle pasa de 0,284 en el paso 0 a 0,296 en el paso 40, sin que se conserven evaluaciones posteriores en el log superviviente.

Su relevancia es metodológica más que de producto: documenta una línea base reproducible de RL con verificación automática sobre datos clínicos reales, con licencia Apache 2.0 y pesos abiertos, pero con la advertencia explícita de que no debe usarse con fines clínicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; heredada del modelo base Qwen/Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos publicados están en bf16 (safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), fusionados desde un checkpoint FSDP de verl |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de ajuste | RL (GRPO) con juez congelado de 9B; librería verl |
| Checkpoint | global_step_100 (último disponible) |
| Tamaño del repositorio | 18,8 GB |
| Pipeline declarado | reinforcement-learning |
| Autor | ddvd233 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo: el autor remite únicamente al modelo base Qwen/Qwen3.5-9B y a la etiqueta `qwen3_5`. Tampoco se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. Lo que sí se documenta es el procedimiento de ajuste: se parte de Qwen/Qwen3.5-9B congelado como juez y se optimiza el modelo con GRPO (Group Relative Policy Optimization) sobre el conjunto de entrenamiento de diagnósticos raros de MIMIC-IV, dentro del experimento RSIMed, que el autor describe como línea base de datos auto-evolutivos.

El resultado es un checkpoint fusionado (merged) exportado desde un checkpoint FSDP de verl, con pesos en bf16 safetensors. No se mencionan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni esquemas híbridos. La única métrica publicada es la exactitud de validación en bucle: 0,284 en el paso 0 y 0,296 en el paso 40; el autor indica que las evaluaciones posteriores no se conservaron en el log superviviente y que el paso 100 es el último checkpoint guardado.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen/Qwen3.5-9B, si bien la información disponible no documenta capacidades concretas del modelo fusionado.
- Razonamiento sobre diagnóstico médico raro: el ajuste RL se realizó específicamente sobre el conjunto de entrenamiento de diagnósticos raros de MIMIC-IV, con validación en bucle reportada.
- Autoevaluación como juez: en el experimento, la variante congelada de 9B actúa como juez del proceso de RL (función de verificación, no capacidad de inferencia del checkpoint publicado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el campo de idiomas de HuggingFace figura como no disponible).
- Capacidades especiales (modo pensamiento, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en RL con verificación automática: el checkpoint sirve como línea base de control frente a ejecuciones de 9B con datos auto-generados, permitiendo aislar el efecto del currículo de datos frente al del algoritmo. Es su uso previsto declarado.
- Reproducibilidad de experimentos médicos: al publicarse los pesos fusionados en bf16 safetensors y la licencia Apache 2.0, un grupo de investigación puede replicar la evaluación sobre MIMIC-IV y contrastar la exactitud de validación reportada (0,284 → 0,296).
- Estudio de olvido catastrófico: comparar este checkpoint con el Qwen/Qwen3.5-9B original en tareas generales permite medir cuánta capacidad general se degrada tras un ajuste RL estrecho sobre un dominio clínico.
- Análisis de sesgo y calibración en dominios clínicos: útil para auditar cómo un modelo de 9B ajustado con RL sobre diagnósticos raros distribuye su confianza, siempre en entorno de laboratorio y sin uso clínico.
- Docencia y formación en ingeniería de modelos: ejemplo práctico y trazable de un pipeline verl + FSDP + exportación a safetensors, útil para enseñar el ciclo completo de RL sobre modelos de 9B.
- Ajuste posterior (fine-tuning) como punto de partida: al ser un modelo denso de ~9,4 B con licencia permisiva, puede servir como inicialización para experimentos propios de dominio médico, asumiendo el coste de reentrenamiento y la validación ética correspondiente.
- Pruebas de infraestructura de despliegue: permite validar pipelines con vLLM, TGI o llama.cpp a escala de 9B antes de mover cargas de trabajo mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento aportado por el autor es una métrica interna de validación en bucle:

| Metrica | Paso | Valor |
|---|---|---|
| Exactitud de validación en bucle (in-loop) | 0 | 0,284 |
| Exactitud de validación en bucle (in-loop) | 40 | 0,296 |
| Exactitud de validación en bucle (in-loop) | 100 | No disponible (evaluaciones posteriores no conservadas) |

No se dispone de comparaciones numéricas con modelos similares sobre el mismo benchmark, ni de datos de latencia o throughput publicados por el autor.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parámetros (9.409.813.744) y del tamaño del repositorio (18,8 GB); el autor no publica requisitos de hardware.

- Pesos en bf16: ~18,8 GB solo de pesos. Con caché KV y overhead de runtime, se recomienda un mínimo de 22-24 GB de VRAM para contexto corto, y 40-48 GB para contextos largos o lotes grandes.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB y RTX 6000 Ada 48 GB ejecutan el modelo en bf16 con margen.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda al límite en bf16 y exigirá cuantización o contextos muy cortos. Con cuantización a 8 bits (~9,4 GB de pesos) el modelo entra con holgura en 24 GB; con 4 bits (~5-6 GB de pesos) entra en GPUs de 12-16 GB, como RTX 4070 Ti o RTX 4080.
- Opciones de despliegue: vLLM y TGI para servicio en GPU con pesos safetensors; llama.cpp u Ollama para cuantizaciones GGUF en GPU de consumo o CPU con offload; no se documenta soporte específico del autor para ninguna de ellas.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La información disponible solo permite comparar con el modelo base del que deriva. No se conocen otros artefactos comparables de RL médico sobre Qwen3.5-9B en los datos proporcionados.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mimiciv_rare_qwen35_9b_trainset_selfjudge (step 100) | 9,4 B | No disponible | Exactitud de validación en bucle 0,284 → 0,296 | Apache 2.0 | Pesos safetensors bf16 en HuggingFace |
| Qwen/Qwen3.5-9B (modelo base) | ~9 B | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Uso clínico prohibido: el propio autor indica explícitamente "Not for clinical use". Es un artefacto de investigación, no un dispositivo médico ni una herramienta de apoyo diagnóstico.
- Rendimiento bajo y poco validado: la exactitud de validación reportada (0,296 en el paso 40) es reducida, y las evaluaciones posteriores no se conservaron. No hay evidencia de que el modelo generalice fuera de su conjunto de validación.
- Artefacto único y sin tracción: 0 descargas y 0 likes, un solo checkpoint publicado y documentación mínima. No hay garantía de mantenimiento, soporte ni corrección de errores.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala y acentuado en dominios de alta especialización como el diagnóstico médico, donde una salida plausible pero incorrecta puede tener consecuencias graves.
- Origen de los datos: el entrenamiento usa MIMIC-IV, un recurso con acceso regulado en PhysioNet. Cualquier uso derivado debe respetar las condiciones de acceso y las restricciones de privacidad aplicables a datos clínicos, aunque los pesos publicados no contengan registros originales.
- Posible olvido catastrófico: el ajuste RL se restringe a un único dominio y conjunto de datos, por lo que las capacidades generales del modelo base pueden haberse degradado de forma no medida.
- Idiomas y contexto sin especificar: no se documentan idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- Licencia permisiva con matices: los pesos se publican bajo Apache 2.0, pero eso no exime de cumplir las condiciones de uso del modelo base ni las de las fuentes de datos empleadas en el ajuste.
- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni de evaluación médica reconocida, por lo que no es posible comparar su calidad de forma objetiva frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/mimiciv_rare_qwen35_9b_trainset_selfjudge_global_step_100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería verl (mencionada en la model card): no se ha proporcionado enlace directo en la información disponible
- No se han identificado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en los resultados de búsqueda web proporcionados.
