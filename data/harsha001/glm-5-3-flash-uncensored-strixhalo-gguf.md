# Harsha001/GLM-5.3-Flash-Uncensored-StrixHalo-GGUF

## Resumen

GLM-5.3-Flash-Uncensored-StrixHalo-GGUF es una compilación cuantizada del modelo GLM-5.3-Flash de Z.ai, un transformer de tipo mezcla de expertos (MoE) con 320.759.404.382 parámetros totales, de los cuales activa aproximadamente 18B por token. Esta versión concreta, publicada por el usuario Harsha001, aplica una cuantización agresiva de 2 bits (IQ2_XXS en las compuertas y tensores up de los expertos enrutados, IQ3_XXS en los tensores down) para reducir el peso de 318 GiB a 96 GiB, con el objetivo de que quepa en una máquina AMD Strix Halo con 128 GB de memoria unificada.

El modelo parte de la variante abliterated de orcarouter, que elimina sustancialmente el comportamiento de rechazo del modelo original mediante técnicas de abliteration. Conserva los 288 expertos completos, algo poco habitual en cuantizaciones tan severas, y mantiene en Q8_0 todos los componentes no expertos (atención, experto compartido, capas densas y embeddings). El resultado es un modelo sin guardarraíles de seguridad integrados, orientado explícitamente a investigación sobre rechazo, interpretabilidad, red-teaming y evaluación de robustez.

La relevancia de esta ficha radica en su enfoque práctico: demuestra que es posible ejecutar un MoE de 320B en hardware de consumo profesional de gama alta (Strix Halo) mediante cuantización extrema y un backend específico (ROCmFPX con Vulkan). No obstante, el autor advierte que los archivos no han sido probados en hardware AMD real y que solo funcionan con su fork de llama.cpp, lo que limita su adopción generalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), nombre de arquitectura `glm5-next` en llama.cpp |
| Parametros totales | 320.759.404.382 (320B) |
| Parametros activos | ~18B por token |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 16384`, pero no se especifica el máximo soportado) |
| Tipos de cuantizacion | IQ2_XXS (gate y up de expertos enrutados), IQ3_XXS (down de expertos enrutados), Q8_0 (resto de componentes) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (tres partes: 45.6 GB + 46.0 GB + 11.6 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos con 288 expertos enrutados y un experto compartido, del cual se activan aproximadamente 18B de parámetros por token sobre un total de 320B. La cuantización de Harsha001 conserva la totalidad de los 288 expertos, aplicando IQ2_XXS a los tensores gate y up y IQ3_XXS a los tensores down de los expertos enrutados. El resto de la red (atención, experto compartido, capas densas y embeddings) permanece en Q8_0, lo que preserva la calidad de los componentes críticos para la estabilidad del modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original de Z.ai. La variante abliterated de orcarouter elimina el comportamiento de rechazo mediante técnicas de abliteration, pero no se detalla el método exacto empleado. La matriz de importancia utilizada para la cuantización proviene de Unsloth (GLM-5.3-Flash-GGUF) y no contiene datos para el bloque 45 (cabeza de predicción multi-token), por lo que se usó la información del bloque 44 como sustituto; esto solo afecta a la opción de aceleración por predicción multi-token, no a la generación normal.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta a preguntas generales (el autor verificó respuestas correctas a preguntas de cultura general y aritmética simple).
- Generación de código: el autor verificó la escritura correcta de una función iterativa de Fibonacci en Python.
- Aritmética básica: el autor verificó que responde correctamente a 17 x 23 = 391.
- Sin comportamiento de rechazo: 0 rechazos en 10 solicitudes que un modelo con entrenamiento de seguridad rechazaría normalmente, y 0 rechazos en 8 preguntas inofensivas que suenan arriesgadas (prueba limitada a frases de rechazo en los primeros 64 tokens).
- Soporte de plantillas de chat mediante `--jinja`.
- Compatible con endpoints (tag `endpoints_compatible`).
- No incluye capacidades de visión en esta compilación: solo generación de texto, aunque orcarouter publica un archivo de visión (mmproj) que no ha sido probado con esta build.

## Casos de uso

- Investigación sobre rechazo y abliteration: el modelo permite estudiar cómo la eliminación del entrenamiento de seguridad afecta al comportamiento de rechazo en un MoE de gran escala, comparando las respuestas con las del modelo original de Z.ai.
- Red-teaming y evaluación de robustez: al carecer de guardarraíles, es adecuado para probar la eficacia de sistemas de moderación externos y para identificar vectores de ataque en pipelines de producción.
- Estudios de interpretabilidad: la conservación de los 288 expertos permite analizar el enrutamiento y la especialización de expertos en un modelo cuantizado a 2 bits, comparando con la referencia Q8_0.
- Evaluación de cuantización extrema: sirve como caso de estudio para medir la pérdida de calidad (perplejidad de 4.09 frente a 2.61 en Q8_0, KL de 0.51, 76.5% de coincidencia en el token superior) en un MoE de 320B comprimido a 96 GiB.
- Despliegue en hardware Strix Halo: permite ejecutar un modelo de 320B en una única máquina AMD con 128 GB de memoria unificada, usando Vulkan y el fork ROCmFPX, con contexto inicial de 16384 tokens.
- Generación de código y tareas de razonamiento en entornos controlados: el modelo produce código Python funcional y respuestas aritméticas correctas, aunque la cuantización a 2 bits puede degradar tareas más complejas no verificadas por el autor.
- Experimentación con decodificación especulativa: el bloque 45 (cabeza de predicción multi-token) está presente pero su matriz de importancia es aproximada, por lo que puede usarse para probar la aceleración opcional, con cautela sobre su calidad.

## Benchmarks y rendimiento

| Build | Tamano | Perplejidad | KL a Q8 | Mismo token superior que Q8 |
|---|---:|---:|---:|---:|
| Q8_0 abliterated de orcarouter (referencia) | 318 GiB | 2.61 | — | — |
| Esta repo: 2 bits, 288 expertos | 96 GiB | 4.09 | 0.51 | 76.5% |
| No publicado: 3 bits, 233 de 288 expertos | 99 GiB | 6.01 | 0.91 | 68.8% |

Medición realizada con `llama-perplexity --kl-divergence` frente al Q8_0 abliterated de orcarouter, sobre 40 fragmentos de 512 tokens de texto de Wikipedia en inglés (wikitext-2), ejecutado en una GPU NVIDIA GB10. Menor es mejor en perplejidad y KL. La referencia Q8_0 no es precisión completa, por lo que la pérdida propia de Q8_0 no se contabiliza. El texto es inglés general y no dice nada directo sobre código, razonamiento o chino.

Pruebas cortas en la misma GPU con decodificación greedy: función iterativa de Fibonacci en Python correcta, 17 x 23 = 391 correcto, Canberra como capital de Australia correcta. Rechazos: 0 de 10 solicitudes que un modelo con seguridad rechazaría, y 0 de 8 preguntas inofensivas que suenan arriesgadas (prueba limitada a frases de rechazo en los primeros 64 tokens; no mide utilidad ni precisión).

## Requisitos de hardware

- VRAM/memoria unificada estimada: 96 GiB para los pesos, más espacio para contexto KV; el autor recomienda configurar el split de BIOS para que la GPU alcance unos 110 GiB.
- GPU recomendadas: AMD Strix Halo con 128 GB de memoria unificada (objetivo principal). El autor probó la cuantización en una NVIDIA GB10, no en AMD.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB, etc.) por el tamaño de 96 GiB.
- Opciones de despliegue: llama-server de ROCmFPX (fork de HarshaVardhan3002) compilado con Vulkan; otras builds de llama.cpp pueden no reconocer la arquitectura `glm5-next`.
- Comando de ejemplo: `llama-server -m IQ2_XXS-E288/GLM-5.3-Flash-Uncensored-StrixHalo-IQ2_XXS-E288-00001-of-00003.gguf -ngl 99 -c 16384 --jinja`.
- Notas de despliegue: usar Vulkan y configurar el split de memoria de BIOS para que la GPU acceda a ~110 GiB; HIP/ROCm solo asigna desde la parte dedicada, por lo que un split 64/64 es insuficiente. Hay poco margen, así que empezar con contexto pequeño y subirlo con cuidado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-StrixHalo-GGUF (esta ficha) | 320B | ~18B | No disponible | MIT | GGUF (IQ2_XXS/IQ3_XXS + Q8_0) | 96 GiB, 288 expertos, sin guardarraíles, requiere ROCmFPX |
| orcarouter/GLM-5.3-Flash-Uncensored-GGUF (Q8_0) | 320B | ~18B | No disponible | MIT | GGUF Q8_0 | 318 GiB, referencia de calidad, sin guardarraíles |
| zai-org/GLM-5.3-Flash (original) | 320B | ~18B | No disponible | MIT | No disponible | Modelo base con entrenamiento de seguridad |
| unsloth/GLM-5.3-Flash-GGUF | 320B | ~18B | No disponible | MIT | GGUF (varias cuantizaciones) | Fuente de la matriz de importancia; cuantizaciones estándar |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento de seguridad ha sido eliminado: la abliteration de orcarouter elimina sustancialmente el comportamiento de rechazo, por lo que el modelo puede cumplir solicitudes dañinas, poco éticas, ofensivas o ilegales. No tiene guardarraíles integrados significativos.
- Uso previsto exclusivamente para investigación (estudios de rechazo e interpretabilidad, red-teaming, evaluación de robustez). No debe exponerse a usuarios finales sin capas propias de seguridad y moderación.
- La cuantización a 2 bits supone una pérdida de calidad real: perplejidad de 4.09 frente a 2.61 en Q8_0, KL de 0.51 y solo 76.5% de coincidencia en el token superior. El texto de evaluación es inglés general y no dice nada directo sobre código, razonamiento o chino.
- Los archivos no han sido probados en hardware AMD; solo se probaron con ROCmFPX en una NVIDIA GB10. Otras builds de llama.cpp pueden no reconocer la arquitectura `glm5-next`.
- La matriz de importancia no tiene datos para el bloque 45 (cabeza de predicción multi-token); se usó el bloque 44 como sustituto, lo que puede afectar a la aceleración opcional por predicción multi-token.
- Solo se incluye generación de texto; el archivo de visión (mmproj) de orcarouter no ha sido probado con esta build.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente agravado por la cuantización extrema y la ausencia de entrenamiento de seguridad.
- Restricciones de licencia: MIT permite uso comercial, pero el autor advierte que el usuario es totalmente responsable del uso y del contenido generado, y debe cumplir la legislación aplicable.
- El modelo no es una release oficial; todo el crédito del modelo corresponde a Z.ai y el de la abliteration a orcarouter.

## Enlaces

- Hugging Face: https://huggingface.co/Harsha001/GLM-5.3-Flash-Uncensored-StrixHalo-GGUF
- Modelo base (abliterated Q8_0): https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-GGUF
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Matriz de importancia (Unsloth): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Modelo destacado del mismo autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
