# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_WGA

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_WGA` es un artefacto de investigación en *machine unlearning* construido sobre `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez deriva de Llama 3.2 3B Instruct. El autor, JoaoBoer, ha aplicado el método **WGA** (variante de ascenso de gradiente ponderado) sobre el split `forget01` del dataset TOFU, empleando el framework [open-unlearning](https://github.com/locuslab/open-unlearning). El resultado es un modelo denso de 3,21 mil millones de parámetros que ha sido entrenado explícitamente para *desaprender* un subconjunto concreto de datos, manteniendo el grueso de sus capacidades originales.

El problema que aborda es central en el despliegue responsable de LLM: cómo eliminar selectivamente la memorización de datos concretos (por ejemplo, información personal o contenido con derechos) sin reentrenar desde cero ni degradar la utilidad general del modelo. TOFU (Task of Fictitious Unlearning) es el benchmark de referencia para medir ese equilibrio, y este checkpoint publica las métricas obtenidas en él.

Su relevancia actual es doble. Por un lado, sirve como *baseline* reproducible de unlearning por modificación de pesos frente a otras técnicas. Por otro, se utiliza como modelo *draft* en el proyecto [Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning), que investiga cómo combinar decodificación especulativa con olvido selectivo. No es un modelo destinado a producción conversacional, sino una pieza de laboratorio con métricas auditables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3.2 (atención con GQA y RoPE) |
| Parámetros totales | 3.212.749.824 (3,21 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 3B Instruct; no declarada explícitamente en la model card) |
| Tipos de cuantización | no se distribuyen pesos cuantizados en el repositorio; al ser un checkpoint Llama 3.2 admite conversión a GGUF (Q4_K_M, Q5_K_M, Q8_0), AWQ y GPTQ con herramientas estándar |
| Idiomas soportados | no especificado en la model card; el modelo base Llama 3.2 declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors, cargable con `transformers` (precisión bf16) |
| Tamaño del repositorio | 6,4 GB |
| Pipeline | text-generation |
| Dataset de evaluación/entrenamiento | `locuslab/TOFU` (split `forget01`) |
| Modelo base | `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct sin modificaciones estructurales: un transformer decoder-only denso de 3,21 B de parámetros con atención de consultas agrupadas (GQA) y codificación posicional rotatoria (RoPE). El checkpoint no introduce capas nuevas ni cambia el vocabulario; la única diferencia respecto al modelo base son los pesos, alterados por el procedimiento de olvido. El repositorio pesa 6,4 GB, coherente con pesos en bf16 sin cuantizar.

El entrenamiento se realizó con el framework `open-unlearning` sobre el split `forget01` de TOFU (el 1 % de los autores ficticios del dataset, manteniendo el 99 % restante como conjunto de retención). La configuración publicada en `.hydra/config.yaml` especifica `gamma: 1.0`, `alpha: 1.0`, `beta: 1.0` y `retain_loss_type: NLL`. En la formulación típica de este tipo de métodos, el objetivo combina un término de ascenso de gradiente sobre las muestras a olvidar con un término de descenso por verosimilitud negativa (NLL) sobre las muestras a retener, ponderados por los coeficientes anteriores; el autor no detalla en la model card la definición exacta del ponderado de WGA ni el número de pasos de entrenamiento. No se documenta en la información disponible si hubo fases adicionales de RLHF, DPO o ajuste de preferencias más allá del pipeline de instrucción heredado del modelo base.

Como apunte de ingeniería, el proyecto usa este checkpoint como modelo *draft* en un esquema de decodificación especulativa aplicada al olvido: un modelo pequeño y ya "olvidado" propone tokens que un modelo mayor verifica. Los resultados de evaluación de TOFU se encuentran en el directorio `evals/` del repositorio.

## Capacidades

- Generación de texto conversacional con formato de instrucciones, heredada de Llama 3.2 3B Instruct.
- Razonamiento de propósito general y resolución de tareas de conocimiento común dentro de la capacidad de un modelo de 3 B.
- Generación y explicación de código, en línea con el modelo base.
- Soporte de *tool calling* / *function calling*: Llama 3.2 3B Instruct admite el formato de llamadas a herramientas de Llama, por lo que el modelo conserva esa interfaz salvo degradación inducida por el olvido.
- Capacidades multilingües heredadas del modelo base (ocho idiomas declarados por Meta), aunque no verificadas específicamente tras el proceso de unlearning.
- Olvido selectivo verificable: el checkpoint responde con contenido incoherente ante las preguntas del split `forget01` (`forget_Q_A_gibberish: 0.8602`) manteniendo utilidad sobre el conjunto de retención (`model_utility: 0.6637`).
- No dispone de modo de razonamiento explícito (*thinking mode*), visión, audio ni otras modalidades adicionales.

## Casos de uso

- Evaluación comparativa de técnicas de unlearning: usar este checkpoint como baseline de WGA frente a otros métodos (NPO, GradDiff, GradAscent) sobre el mismo modelo base y el mismo split `forget01`, midiendo `forget_quality`, `model_utility` y las métricas MIA del framework `open-unlearning`.
- Modelo *draft* en decodificación especulativa: el repositorio `Speculative-Decoding-Unlearning` lo emplea como proponente de tokens para acelerar la inferencia de un modelo verificador en escenarios donde el olvido debe preservarse; su tamaño de 3,21 B permite mantenerlo residente en GPU junto al modelo mayor.
- Auditoría de privacidad y ataques de inferencia de pertenencia: los valores `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` publicados permiten reproducir y contrastar ataques MIA sobre un modelo supuestamente olvidado.
- Investigación sobre retención de conocimiento tras olvido: medir cuánta capacidad general sobrevive a un entrenamiento de ascenso de gradiente, comparando `model_utility` frente al modelo base sin olvidar.
- Base para experimentos de re-aprendizaje: dado que los pesos han sido desplazados por WGA, sirve para estudiar la facilidad con la que la información "olvidada" se recupera mediante un fine-tuning posterior de pocos pasos.
- Validación de pipelines de evaluación: al incluir la configuración Hydra y salidas en `evals/`, es útil como caso de prueba reproducible para integrar TOFU en un sistema de CI de experimentos de unlearning.
- Prototipado de asistentes conversacionales de bajo coste en entornos controlados: con 3,21 B de parámetros puede ejecutarse en una GPU de consumo para probar flujos multi-turno, siempre que no se dependa del conocimiento de los autores ficticios eliminados.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son las métricas de TOFU del propio autor para el split `forget01`:

| Métrica | Valor |
|---|---|
| exact_memorization | 0,8136 |
| extraction_strength | 0,1881 |
| forget_Q_A_PARA_Prob | 0,0762 |
| forget_Q_A_gibberish | 0,8602 |
| forget_quality | 0,0286 |
| forget_truth_ratio | 0,5317 |
| mia_loss | 0,9313 |
| mia_min_k | 0,9325 |
| mia_min_k_plus_plus | 0,7694 |
| mia_zlib | 0,9400 |
| model_utility | 0,6637 |
| privleak | -84,7458 |

Estos valores deben interpretarse según las definiciones del framework `open-unlearning` y del benchmark TOFU; la model card no incluye la descripción de cada métrica ni una comparación con otras técnicas o checkpoints. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 6,4 GB solo para los pesos (3,21 B × 2 bytes).
- VRAM en int8: aproximadamente 3,2-4 GB; en cuantización de 4 bits (Q4_K_M), aproximadamente 2-2,5 GB.
- Caché KV: para el modelo base Llama 3.2 3B (28 capas, 8 cabezas KV, `head_dim` 128) se estiman unos 112 KB por token en fp16, lo que equivale a unos 14 GB adicionales si se llena la ventana completa de 128.000 tokens. Para contextos de 8.000-16.000 tokens el consumo es de 0,9-1,8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más para bf16 con contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para contexto largo real (más de 32.000 tokens) conviene una A100 40/80 GB, H100 o L40S.
- Cabe en GPU de consumo: sí, en bf16 con contextos cortos en tarjetas de 8 GB, y con holgura en 12-16 GB; en cuantización de 4 bits es viable incluso en 4-6 GB de VRAM.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM, TGI, SGLang, y llama.cpp / Ollama / LM Studio tras convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado en TOFU `forget01` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_WGA` | 3,21 B | 128.000 tokens | `forget_quality` 0,0286; `forget_Q_A_gibberish` 0,8602; `model_utility` 0,6637 | llama3.2 | Público en HuggingFace, 0 descargas |
| `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` | 3,21 B | 128.000 tokens | no disponible | llama3.2 | Público en HuggingFace |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 B | 128.000 tokens | no aplica (modelo sin olvidar) | llama3.2 | Público, requiere aceptar la licencia de Meta |

No se dispone de datos públicos en la información proporcionada sobre otros checkpoints de unlearning aplicados al mismo modelo base (por ejemplo, variantes con NPO o GradDiff), ni sobre modelos de unlearning de tamaño comparable entrenados sobre TOFU con los que establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Artefacto de investigación: es un baseline experimental, no un asistente listo para producción. No hay garantía de calidad conversacional tras el entrenamiento de olvido.
- Riesgo de respuestas incoherentes: el propio proceso de unlearning provoca contenido sin sentido en las consultas del split `forget01` (`forget_Q_A_gibberish` 0,8602), lo que en un uso general puede traducirse en degradación fuera del dominio objetivo.
- Memorización residual: la métrica `exact_memorization` (0,8136) y `extraction_strength` (0,1881) indican que parte de la información del conjunto a olvidar sigue siendo extraíble; el olvido no es completo y no debe asumirse como garantía de privacidad.
- Fuga de privacidad: el valor `privleak` de -84,7458 debe interpretarse con las definiciones del framework `open-unlearning`; en cualquier caso, un proceso de olvido por modificación de pesos no equivale a la eliminación de datos del modelo.
- Sesgos: no se han documentado evaluaciones de sesgo específicas para este checkpoint; hereda los sesgos del modelo base Llama 3.2 3B Instruct.
- Alucinación: el modelo base ya presenta riesgo de alucinación, y el entrenamiento por ascenso de gradiente puede incrementarlo en las regiones del espacio de pesos afectadas.
- Idiomas: no se ha verificado el comportamiento multilingüe tras el proceso de olvido; la model card no declara idiomas.
- Licencia: se hereda la Llama 3.2 Community License, que impone condiciones de uso comercial, obligaciones de atribución y restricciones (entre otras, límites para entidades con más de 700 millones de usuarios mensuales). Es necesario revisar los términos antes de cualquier uso comercial.
- Fecha de creación: el repositorio figura como creado el 2026-09-10, con 0 descargas y 0 *likes* en el momento de la consulta, por lo que no hay evidencia de uso o validación por terceros.
- Limitación de contexto: aunque el modelo base soporta 128.000 tokens, no se ha verificado que esta ventana siga siendo funcional tras el entrenamiento de olvido, y llenarla exige una cantidad de VRAM muy superior a la del propio modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_WGA
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card del autor.
