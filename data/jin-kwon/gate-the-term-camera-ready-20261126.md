# jin-kwon/gate-the-term-camera-ready-20261126

## Resumen

Gate the Term es un artefacto de investigación reproducible que contiene 18 adaptadores LoRA (seis brazos primarios por tres semillas, 100 pasos cada uno) entrenados sobre Qwen/Qwen2.5-7B-Instruct. No es un modelo base nuevo, sino un paquete experimental orientado a estudiar el efecto de distintas estrategias de entrenamiento (etiquetadas como "arms", entre ellas `cgh_strict`) sobre tareas aritméticas multilingües. Lo publica el usuario jin-kwon junto con el código fuente en GitHub (repositorio `dlwlsrnjs/gate-the-term`).

El interés del artefacto reside en su énfasis en la reproducibilidad: incluye los safetensors originales sin modificar, configuraciones fuente, registros de entrenamiento a nivel de prompt (200 por ejecución), predicciones finales por idioma, logs de stdout, informes auditados por semilla, datos congelados (MGSM y entradas de evaluación externa) con checksums, manifiesto de artefactos y fichero `SHA256SUMS`. El modelo base está fijado a la revisión `a09a35458c702b33eeacc393d103063234e8bc28` para garantizar reproducción inmutable.

El entrenamiento emplea GRPO (Group Relative Policy Optimization) sobre el modelo base de 7B parámetros, con el objetivo declarado de estudiar sesgos de gradiente y generalidad en tareas aritméticas. La licencia no está especificada en la información disponible y el autor advierte explícitamente de que no se afirma una relicencia global: los términos del modelo base y de los datasets subyacentes permanecen con sus publicadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) con adaptadores LoRA |
| Parametros totales | 7B en el modelo base; adaptadores LoRA de tamaño no especificado (repo total 2,9 GB para 18 adaptadores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors; el base en bfloat16) |
| Idiomas soportados | no disponible; el entrenamiento y evaluación cubren inglés, bengalí, telugu y tailandés (traducciones de MGSM) |
| Licencia | no disponible (el autor no afirma relicencia; se aplican los términos del modelo base y de los datasets) |
| Formato de pesos | safetensors (adaptadores LoRA) + metadatos portables; modelo base no incluido |

## Arquitectura y entrenamiento

El artefacto se compone de 18 adaptadores LoRA entrenados sobre Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only de 7B parámetros. El entrenamiento usa GRPO, un algoritmo de optimización por políticas con recompensas relativas dentro de grupos, aplicado durante 100 pasos por ejecución. Los seis brazos primarios se combinan con tres semillas (1, 2, 3), lo que da las 18 ejecuciones. No se guardaron estados de optimizador ni de RNG, por lo que no es posible reanudar el entrenamiento a mitad de ejecución de forma exacta.

Los datos de entrenamiento son registros a nivel de prompt (200 por ejecución) derivados de MGSM, con 60 identificadores semánticos retenidos y traducidos a bengalí, telugu y tailandés. El autor advierte que las semillas y las traducciones no son preguntas nuevas independientes. La evaluación externa congelada contiene 2.069 identificadores semánticos y 4.138 entradas idioma-ítem por modelo, y es solo para evaluación. Se menciona que el acceso a la referencia en inglés constituye información privilegiada de entrenamiento. El código fuente está incluido como snapshot (`2978b2692aae98c578d37e6aef0f58696fe31170`) en `code/gate-the-term-source.tar.gz`.

## Capacidades

- Generación de texto y razonamiento aritmético multilingüe sobre el modelo base Qwen2.5-7B-Instruct.
- Adaptación específica para tareas de aritmética en inglés, bengalí, telugu y tailandés (traducciones de MGSM).
- Seis configuraciones de entrenamiento distintas ("arms") que permiten comparar estrategias de ajuste.
- Tres semillas por brazo para estudiar varianza entre ejecuciones.
- Artefacto reproducible con verificación de integridad (`tools/artifacts.py verify`).
- Compatible con el ecosistema PEFT/Hugging Face Transformers para carga de adaptadores.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación sobre sesgos de gradiente en RL: los 18 adaptadores y los informes auditados por semilla permiten analizar la varianza entre ejecuciones y comprobar si la precisión valida un gradiente no sesgado, tal como plantea el autor.
- Reproducción de experimentos de GRPO: el paquete incluye configuraciones, logs y checksums para replicar el protocolo exacto sobre la revisión fijada de Qwen2.5-7B-Instruct.
- Estudio de generalización multilingüe en aritmética: los datos congelados de MGSM en bengalí, telugu y tailandés permiten evaluar la transferencia entre idiomas.
- Auditoría de artefactos científicos: el manifiesto `ARTIFACT_MANIFEST.json` y `SHA256SUMS` facilitan la verificación de integridad en flujos de revisión por pares.
- Comparación de estrategias de ajuste LoRA: los seis brazos primarios permiten contrastar configuraciones de entrenamiento bajo el mismo presupuesto de 100 pasos.
- Base para experimentos docentes: el paquete autocontenido (código, datos, adaptadores) sirve para enseñar reproducibilidad en aprendizaje por refuerzo con modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona informes auditados por semilla y de tres semillas en `results/`, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- El modelo base Qwen2.5-7B-Instruct en bfloat16 requiere aproximadamente 14-16 GB de VRAM para inferencia; los adaptadores LoRA añaden una sobrecarga mínima (el repo completo pesa 2,9 GB para 18 adaptadores).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para el modelo base en bfloat16; GPUs consumer con 16 GB o más pueden alojar el base en cuantización de 8 bits.
- Cabe en GPU consumer (RTX 4090, RTX 3090) usando el base en bfloat16 o cuantizado; los adaptadores individuales son ligeros.
- Opciones de despliegue: Transformers + PEFT (documentado en la model card), vLLM, TGI o llama.cpp con el base cuantizado y fusión previa del adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gate the Term (este artefacto) | 7B base + LoRA | no disponible | Adaptadores LoRA sobre Qwen2.5-7B-Instruct | no disponible | Hugging Face (repo de 2,9 GB) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo base instruct | no disponible en esta ficha | Hugging Face |
| Adaptadores LoRA genéricos sobre Qwen2.5-7B | 7B base + LoRA | heredado del base | LoRA | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El autor advierte que tres semillas, un solo modelo de 7B y tareas aritméticas ofrecen una generalidad limitada.
- La precisión no valida un gradiente no sesgado, según el propio autor.
- Las semillas y traducciones de MGSM no son preguntas nuevas independientes; los 60 identificadores semánticos retenidos están traducidos a tres idiomas.
- El acceso a la referencia en inglés es información privilegiada de entrenamiento, lo que puede introducir sesgos en la evaluación.
- No se guardaron estados de optimizador ni de RNG: no es posible reanudar el entrenamiento a mitad de ejecución de forma exacta.
- No se debe ajustar sobre los resultados de la evaluación externa (evaluation-only).
- La licencia no está especificada y no se afirma relicencia global; los términos del modelo base y de los datasets permanecen con sus publicadores.
- El paquete no incluye los pesos oficiales del modelo base, credenciales ni entornos.
- Riesgo de alucinación y sesgos inherentes al modelo base Qwen2.5-7B-Instruct, no evaluados específicamente en la información disponible.
- El artefacto no contiene las nueve ejecuciones secundarias ni la evaluación externa de 19 modelos.

## Enlaces

- Hugging Face: https://huggingface.co/jin-kwon/gate-the-term-camera-ready-20261126
- Código: https://github.com/dlwlsrnjs/gate-the-term
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Snapshot de código incluido: `code/gate-the-term-source.tar.gz` (commit `2978b2692aae98c578d37e6aef0f58696fe31170`)
- Documentación de handoff: `camera_ready/ARTIFACT_HANDOFF_KO.md` en el repositorio de GitHub
