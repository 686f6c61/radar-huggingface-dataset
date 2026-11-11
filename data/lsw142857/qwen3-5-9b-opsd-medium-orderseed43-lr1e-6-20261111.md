# LSW142857/Qwen3.5-9B-OPSD-medium-orderseed43-lr1e-6-20261111

## Resumen

Qwen3.5-9B-OPSD-medium-orderseed43-lr1e-6-20261111 es un conjunto de pesos derivados de Qwen/Qwen3.5-9B, publicado por el usuario LSW142857 en Hugging Face. No se trata de un modelo entrenado desde cero ni de una versión oficial de Alibaba, sino del resultado de un experimento de ajuste fino con LoRA (rango 64, alpha 128, dropout 0) sobre una inicialización concreta: un checkpoint de SFT "nonthinking" de NVIDIA en el paso 31, a su vez derivado del modelo base Qwen3.5-9B. El nombre codifica las condiciones del experimento: variante OPSD medium, semilla de ordenación de datos 43 y tasa de aprendizaje máxima de 1e-6.

El propósito declarado es servir como material reproducible para un estudio sobre el efecto del orden de los datos ("All-Outcomes medium order study"). El repositorio contiene únicamente pesos y activos de carga: los checkpoints intermedios de los pasos 12, 16, 20 y 24 de una ejecución planificada de 32 actualizaciones, junto con manifiestos SHA256 por subcarpeta. El autor indica explícitamente que no se reclama ningún rendimiento de benchmark.

Por tanto, la relevancia de esta ficha es acotada: es un artefacto de investigación, no un modelo listo para producción. La información pública disponible es muy limitada (sin licencia declarada, sin idiomas, sin pipeline ni métricas), y la model card se centra en el contrato de precisión y la reproducibilidad más que en capacidades funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B (detalles de arquitectura del modelo base no disponibles en la informacion proporcionada) |
| Parametros totales | 9B (según el nombre del modelo; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 con LM-head y proyección en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a LICENSE y a los términos upstream de Qwen, sin especificar) |
| Formato de pesos | safetensors (cuerpo BF16, LM-head y proyección FP32; tensores de visión/MTP congelados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y se ajusta mediante LoRA de rango 64, alpha 128 y dropout 0 sobre una inicialización concreta: el checkpoint "NVIDIA nonthinking SFT step31". La tasa de aprendizaje máxima es 1e-6 con el esquema original de warmup y coseno. La semilla de ordenación de datos es 43, mientras que las semillas de entrenamiento y de rollout permanecen en 42. El modo de entrenamiento del estudiante es "nonthinking".

El repositorio contiene checkpoints intermedios (pasos 12, 16, 20 y 24) de una ejecución planificada de 32 actualizaciones. Se conservan los tensores congelados de visión y MTP del modelo base. El autor subraya un contrato de precisión: el cuerpo está en BF16 y la LM-head y la proyección en FP32; cargar todos los tensores con un dtype BF16 uniforme altera la precisión de la LM-head y rompe dicho contrato. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card indica que datasets, trayectorias y estados de recuperación del optimizador quedan excluidos de la publicación.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B, si bien no se documentan evaluaciones específicas de este checkpoint.
- Modo "nonthinking" como modo de entrenamiento del estudiante, según la model card.
- Retención de tensores de visión y MTP congelados del modelo base, lo que sugiere que la arquitectura subyacente contempla entrada multimodal y decodificación multi-token, aunque no se detalla su funcionamiento en este checkpoint.
- Soporte de tool calling, agentes, multilingüismo o matemáticas: no disponible en la información proporcionada.
- No se declaran capacidades especiales adicionales (audio, thinking mode explícito, etc.).

## Casos de uso

- Reproducción de experimentos sobre ordenación de datos: cargar los checkpoints de los pasos 12, 16, 20 y 24 con el contrato de precisión indicado (cuerpo BF16, LM-head y proyección FP32) para comparar la evolución del ajuste con la semilla de orden 43 frente a otras semillas.
- Estudio de la influencia de la tasa de aprendizaje: al fijar lr=1e-6 y LoRA r=64/alpha=128, sirve como punto de comparación controlado frente a otras variantes del mismo estudio OPSD.
- Auditoría de reproducibilidad: los manifiestos SHA256 por subcarpeta y el commit inmutable permiten verificar la integridad de los pesos descargados en pipelines de validación.
- Investigación sobre ajuste fino con LoRA sobre checkpoints SFT intermedios: permite analizar cómo se comporta un adaptador de bajo rango partiendo de un paso temprano (step31) de un SFT ajeno.
- Docencia y experimentación académica: útil para ilustrar contratos de precisión mixta (BF16/FP32) y su impacto en la carga de tensores con frameworks como Transformers o vLLM.
- Base para experimentos de decodificación multi-token: la conservación de los tensores MTP congelados permite explorar técnicas de decodificación especulativa, siempre que se respete la precisión original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ningún rendimiento de benchmark para estos checkpoints intermedios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (55,5 GB) y el hecho de incluir pesos BF16 más tensores FP32, se requiere un entorno con al menos ~20 GB para los pesos en BF16 (9B × 2 bytes) más el overhead de la LM-head en FP32 y los tensores de visión/MTP.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs con 24 GB o más (RTX 4090, A100 40/80 GB, H100), pero no se confirma.
- ¿Cabe en consumer GPU?: probablemente en GPUs de 24 GB en BF16, aunque no se documenta ni se garantiza.
- Opciones de despliegue: no disponible; la model card solo menciona activos de carga y advierte sobre el dtype. No se citan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-OPSD-medium-orderseed43-lr1e-6-20261111 | 9B | no disponible | no disponible | Hugging Face (repo de 55,5 GB) | Checkpoint de investigación, sin benchmarks |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | términos upstream de Qwen | Hugging Face | Modelo oficial del que deriva |
| NVIDIA nonthinking SFT step31 | 9B | no disponible | no disponible | no disponible | Inicialización del ajuste LoRA |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parametrización y procedencia.

## Limitaciones y advertencias

- Artefacto de investigación: son checkpoints intermedios de una ejecución planificada de 32 pasos; no constituyen un modelo final ni validado.
- Sin benchmarks: no hay métricas publicadas que permitan estimar calidad, sesgos o robustez.
- Licencia no declarada: la model card remite a LICENSE y a los términos upstream de Qwen, pero no se especifica la licencia efectiva; el uso comercial queda en incertidumbre.
- Contrato de precisión estricto: cargar todos los tensores en BF16 altera la LM-head y rompe la reproducibilidad del experimento.
- Exclusión de artefactos: no se publican datasets, trayectorias, estados del optimizador, RNG ni configuraciones privadas, lo que limita la reproducción completa del entrenamiento.
- Idiomas y contexto no documentados: no se puede garantizar cobertura multilingüe ni ventanas largas.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; debe asumirse el comportamiento del modelo base sin garantías adicionales.
- Procedencia: el autor no es el desarrollador original de Qwen3.5-9B; la atribución y los términos de Qwen siguen aplicándose.

## Enlaces

- Hugging Face: https://huggingface.co/LSW142857/Qwen3.5-9B-OPSD-medium-orderseed43-lr1e-6-20261111
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.
