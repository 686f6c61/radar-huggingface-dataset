# brandonmusic/GLM-5.3-Flash-TrellisMX-2.375bpw-QEC

## Resumen

GLM-5.3-Flash-TrellisMX-2.375bpw-QEC es un checkpoint cuantizado del modelo base zai-org/GLM-5.3-Flash-BF16, publicado por el usuario brandonmusic. No se trata de un modelo entrenado desde cero, sino de una compresión agresiva a 2,375 bits por peso (bpw) aplicada sobre los expertos enrutados de una arquitectura MoE, manteniendo los módulos no enrutados en BF16. El objetivo es reducir el peso en disco y los requisitos de memoria para servir el modelo, preservando la fidelidad de la distribución de salida respecto al original en BF16.

El checkpoint incorpora dos innovaciones técnicas: la cuantización TrellisMX a cuatro tasas por experto y la recuperación posterior mediante Dual-Trellis QEC v2 (hasta el paso 200, con 27,78 millones de posiciones supervisadas sin solapamiento). Además, se acompaña de sidecars opcionales Dual-Trellis Engram v2 en BF16 y FP8 E4M3. El autor declara 9.669.466.974 parámetros totales según los pesos en safetensors y un tamaño de repositorio de 116,7 GB.

Es relevante ahora porque demuestra que es posible comprimir un MoE de gran tamaño a una tasa de bits muy baja manteniendo una divergencia KL moderada frente al modelo de referencia, lo que abre la puerta a desplegar modelos de esta familia en hardware con menos VRAM. La licencia MIT y la publicación de los datos de fidelidad permiten reproducir y auditar el proceso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (familia GLM-5.3-Flash), con expertos enrutados cuantizados y módulos no enrutados en BF16 |
| Parámetros totales | 9.669.466.974 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se han evaluado ventanas de hasta 64K en la verificación de fidelidad) |
| Tipos de cuantización | TrellisMX 2,375 bpw en expertos enrutados; BF16 en módulos no enrutados; sidecars Engram v2 en BF16 y FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia GLM-5.3-Flash. El checkpoint cuantizado aplica una codificación TrellisMX a cuatro tasas sobre los expertos enrutados, distribuidos en cuatro grupos (`k2=4839`, `p25=5624`, `k3=1542`, `k4=91`) con compresión de escala CSF y el códec `procedural-npk`. Los módulos no enrutados se conservan en BF16 tal como se almacenan en el modelo original.

Sobre esta cuantización se aplica una recuperación Dual-Trellis QEC v2 hasta el paso 200, con 27,78 millones de posiciones supervisadas sin solapamiento. El proceso se verificó con cálculo de divergencia KL en FP64 sobre el vocabulario completo, usando logits de profesor archivados en el dataset brandonmusic/GLM-5.3-Flash-BF16-Nemotron-100M-Teacher-Logits. El cómputo fue patrocinado por Lambda Labs con 8 GPU NVIDIA B200.

## Capacidades

- Generación de texto y razonamiento, heredados del modelo base GLM-5.3-Flash-BF16.
- Capacidad de operar con ventanas de contexto largas: la verificación de fidelidad incluye paneles de 8K, 32K y 64K.
- Cuantización de expertos MoE con fidelidad medida frente al BF16 de referencia.
- Sidecars Engram v2 opcionales en BF16 y FP8 E4M3 para funcionalidad adicional del ecosistema Trellis.
- Soporte de tool calling, agentes o visión: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE GLM-5.3-Flash en hardware con VRAM limitada: la tasa de 2,375 bpw en expertos reduce el peso a 116,7 GB de repositorio, lo que permite servir el modelo en configuraciones multi-GPU más modestas que el BF16 original.
- Investigación en cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar el impacto de tasas de bits muy bajas en MoE, con métricas de KLD por ventana de contexto.
- Evaluación de fidelidad de distribuciones: los paneles de 2K, 8K, 32K y 64K permiten analizar cómo degrada la cuantización a medida que crece el contexto.
- Integración en pipelines de inferencia con vLLM: el autor cita el stack de vLLM de Local Inference Lab y Luke Alonso, lo que sugiere compatibilidad con ese servidor para producción.
- Experimentación con sidecars Engram: los ficheros BF16 y FP8 E4M3 permiten probar variantes de precisión en tareas que requieran ese componente.
- Reproducción de la recuperación QEC: los datos de posiciones supervisadas y el procedimiento documentado permiten replicar el ajuste post-cuantización en otros checkpoints.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index), medidos como divergencia KL media por token (referencia || candidato) en nats, con estimador de vocabulario completo en FP64. Menor es mejor.

| Panel de evaluación | Ventanas | Posiciones puntuadas | KLD media (nats) |
|---|---|---|---|
| OOD confirmation (28 x 2K) | 28 | 57.316 | 0,045086 |
| Sealed final panel (25 x 2K) | 25 | 51.175 | 0,052862 |
| Sealed final panel limpio (17 x 2K) | 17 | 34.799 | 0,061431 |
| Long-context 8K (24 x 8K) | 24 | 196.584 | 0,079155 |
| Long-context 32K (8 x 32K) | 8 | 262.136 | 0,032357 |
| Long-context 64K (6 x 64K) | 6 | 393.210 | 0,010211 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 116,7 GB; con los expertos a 2,375 bpw y los módulos no enrutados en BF16, se necesita un entorno multi-GPU. No se dispone de una estimación oficial de VRAM por configuración.
- GPU recomendadas: el autor cita 8 GPU NVIDIA B200 para el proceso de cuantización y verificación; para inferencia no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; por tamaño, no es esperable que quepa en una sola GPU de consumo.
- Opciones de despliegue: vLLM (stack citado por el autor); compatibilidad con llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-TrellisMX-2.375bpw-QEC | 9.669.466.974 | no disponible | 2,375 bpw en expertos, BF16 en no enrutados | MIT | Hugging Face |
| zai-org/GLM-5.3-Flash-BF16 (modelo base) | no disponible | no disponible | BF16 | no disponible | Hugging Face |
| Otras cuantizaciones de GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento funcional con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 2,375 bpw introduce una divergencia KL no nula frente al BF16; los valores medidos oscilan entre 0,0102 y 0,0792 nats según el panel, lo que puede afectar a tareas sensibles a la distribución exacta.
- El autor marca las métricas como `verified: false`; son resultados declarados, no verificados de forma independiente.
- No se han publicado datos de benchmarks de tareas (razonamiento, código, matemáticas), por lo que el impacto real en calidad funcional es desconocido.
- No se especifican los idiomas soportados ni los parámetros activos del MoE.
- El rendimiento en contextos superiores a 64K no está verificado.
- Aunque la licencia es MIT, conviene revisar las condiciones del modelo base zai-org/GLM-5.3-Flash-BF16 antes de uso comercial, ya que la información sobre su licencia no está disponible.
- El checkpoint depende de sidecars Engram v2 opcionales; su ausencia puede limitar funcionalidades del ecosistema Trellis.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/brandonmusic/GLM-5.3-Flash-TrellisMX-2.375bpw-QEC
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Dataset de fidelidad: https://huggingface.co/datasets/brandonmusic/GLM-5.3-Flash-BF16-Nemotron-100M-Teacher-Logits
- Repositorio del dataset (revisión citada): 47a15aa09762eb5ba15d742c195ec030f065005e
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
