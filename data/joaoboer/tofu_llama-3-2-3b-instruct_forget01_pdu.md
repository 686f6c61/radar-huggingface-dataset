# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_PDU

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_PDU` es un modelo derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` al que se le ha aplicado un proceso de *machine unlearning* (olvido automático) sobre el split `forget01` del benchmark TOFU mediante el método PDU (*Primal-Dual Unlearning*). Lo publica el usuario JoaoBoer como artefacto de investigación, no como modelo de propósito general: su función es servir de baseline de *weight unlearning* y de modelo *draft* dentro del proyecto Speculative-Decoding-Unlearning.

Técnicamente es un transformer decoder-only de la familia Llama 3.2, con 3.212.749.824 parámetros reales (según los pesos en safetensors) y aproximadamente 6,4 GB de repositorio, lo que corresponde a pesos en precisión de 16 bits. Hereda del modelo base la arquitectura, el tokenizador y la naturaleza conversacional de Llama 3.2 3B Instruct, pero sus pesos han sido modificados para reducir la memorización del subconjunto de datos de olvido mientras se intenta preservar la utilidad general.

Su relevancia es doble: por un lado, permite reproducir y auditar una configuración concreta de PDU (con parámetros primal-dual documentados); por otro, actúa como pieza intermedia en una línea de investigación que estudia si la decodificación especulativa puede usarse para aislar o reforzar el olvido. No tiene descargas ni valoraciones registradas y no se declaran idiomas soportados en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), derivada del modelo base `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` |
| Parametros totales | 3.212.749.824 (dato real de los safetensors) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos en precision de 16 bits (6,4 GB para 3,21 mil millones de parametros) |
| Idiomas soportados | No disponible |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | safetensors, cargables con la libreria `transformers` |
| Dataset de olvido | `locuslab/TOFU`, split `forget01` |
| Metodo de olvido | PDU (Primal-Dual Unlearning), framework `open-unlearning` |
| Pipeline declarado | `text-generation` |
| Tamano del repositorio | 6,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de 3,21 mil millones de parametros con atención por grupos (GQA) y RoPE, el diseño estándar de la familia Llama 3.2 en su variante de 3B. No se introduce ningún cambio estructural en el modelo publicado; lo que cambia son los pesos, obtenidos mediante un proceso de olvido supervisado sobre un modelo ya ajustado sobre TOFU.

El entrenamiento de olvido se realizó con el framework `open-unlearning` sobre el split `forget01` del dataset TOFU, aplicando PDU, un esquema primal-dual que optimiza simultáneamente una pérdida de olvido (`forget_loss`) y una pérdida de retención (`retain_loss`, de tipo NLL) con un multiplicador dual actualizado en cada paso. Los hiperparámetros declarados por el autor son: `gamma: 1.0`, `alpha: 100`, `retain_loss_type: NLL`, `retain_loss_eps: 0.3`, `primal_dual: True`, `dual_step_size: 5`, `dual_update_upon: step`, `dual_warmup_epochs: 5` y `loss_names: ['forget_loss', 'retain_loss']`. La configuración completa se distribuye en el repositorio en `.hydra/config.yaml` y las salidas de evaluación en `evals/`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto conversacional: al derivar de Llama 3.2 3B Instruct, conserva el formato de diálogo con roles de sistema, usuario y asistente.
- Olvido selectivo inducido: el objetivo declarado del ajuste es reducir la probabilidad de reproducción de las respuestas asociadas al split `forget01` de TOFU.
- Preservación parcial de utilidad: el esquema primal-dual incorpora explícitamente una pérdida de retención, de modo que el modelo mantiene parte de su comportamiento original (utility de 0,6674 en la evaluación del autor).
- Uso como modelo *draft*: está pensado para integrarse en pipelines de decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, según las etiquetas del repositorio.
- No se declaran capacidades de *tool calling*, uso de agentes, visión, audio, modo de razonamiento explícito ni cobertura multilingüe verificada en la información disponible.

## Casos de uso

- Reproducción de baselines de *machine unlearning*: cargar el modelo con `transformers` y ejecutar la evaluación de TOFU sobre el split `forget01` para verificar las métricas reportadas por el autor.
- Comparación de métodos de olvido: servir como referencia de PDU frente a otras técnicas (por ejemplo, gradiente ascendente o edición de pesos) evaluadas sobre el mismo modelo base y el mismo split.
- Modelo *draft* en decodificación especulativa: utilizarlo como proponente de tokens en el proyecto Speculative-Decoding-Unlearning, donde su función es estudiar cómo interactúa el olvido con el esquema de verificación del modelo *target*.
- Auditoría de privacidad: emplearlo como sujeto de pruebas en ataques de inferencia de pertenencia (MIA) y de extracción de datos, dado que la ficha publica métricas específicas de `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib`.
- Docencia e investigación en privacidad de modelos: analizar el compromiso entre `forget_quality` (0,7659) y `model_utility` (0,6674) como caso de estudio de los límites del olvido a nivel de pesos.
- Inicialización para nuevos experimentos: partir de estos pesos para aplicar variantes de PDU con otros hiperparámetros o sobre otros splits de TOFU, reduciendo el coste de repetir el ajuste desde el modelo completo.
- Despliegue interno de demostración: levantar un endpoint compatible con la API de `transformers` o TGI para mostrar en directo el comportamiento del modelo olvidado frente al original, siempre en entornos controlados y no orientados a producción.
- Analisis de filtración residual: usar la métrica `privleak` (36,5819) y `extraction_strength` (0,0565) como indicadores para estudiar cuánta información del conjunto de olvido sigue siendo recuperable.

## Benchmarks y rendimiento

La information proporcionada no incluye resultados de MMLU, HumanEval, GSM8K ni de otras suites de propósito general. El autor publica únicamente las métricas agregadas del benchmark TOFU:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,4894 |
| extraction_strength | 0,0565 |
| forget_Q_A_PARA_Prob | 0,0206 |
| forget_Q_A_gibberish | 0,5511 |
| forget_quality | 0,7659 |
| forget_truth_ratio | 0,6825 |
| mia_loss | 0,1997 |
| mia_min_k | 0,3956 |
| mia_min_k_plus_plus | 0,9938 |
| mia_zlib | 0,2619 |
| model_utility | 0,6674 |
| privleak | 36,5819 |

No se han publicado resultados de benchmarks de propósito general en la información disponible, ni se incluyen las métricas equivalentes del modelo base para poder calcular la variación relativa.

## Requisitos de hardware

- VRAM estimada en precisión de 16 bits: en torno a 6,5 GB solo para los pesos (3.212.749.824 parámetros x 2 bytes), más la caché KV y el *overhead* del runtime; en la práctica conviene reservar 9-10 GB para contextos moderados.
- VRAM estimada en 8 bits: aproximadamente 3,3-4 GB de pesos.
- VRAM estimada en 4 bits: aproximadamente 1,8-2,5 GB de pesos, lo que deja margen para contextos largos en GPUs de 8 GB.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y de forma ajustada en 8 GB si se cuantiza.
- GPU recomendadas para investigación y evaluación por lotes: A100 40/80 GB, H100, L40S o cualquier GPU con al menos 16 GB de memoria para trabajar sin cuantizar.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). No se confirma soporte de llama.cpp, GGUF ni Ollama, ya que no se publican pesos cuantizados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido aplicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_PDU | 3,21 mil millones | No disponible | Si, PDU sobre TOFU `forget01` | llama3.2 | HuggingFace, 0 descargas |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full (modelo base) | 3,21 mil millones (misma base) | No disponible | No | llama3.2 | HuggingFace |
| Llama-3.2-3B-Instruct (modelo original de Meta) | 3,21 mil millones | No disponible en la informacion proporcionada | No | llama3.2 | HuggingFace |

No se dispone de las métricas de TOFU del modelo base ni del modelo original dentro de la información proporcionada, por lo que no es posible cuantificar la degradación o mejora relativa. Tampoco se han identificado en la búsqueda web modelos comparables de la misma categoría (3B con olvido supervisado sobre TOFU).

## Limitaciones y advertencias

- Es un artefacto de investigación con 0 descargas y 0 valoraciones: no ha sido validado por terceros ni cuenta con historial de uso en producción.
- La ficha no declara idiomas soportados, por lo que no hay garantía de comportamiento multilingüe más allá de lo heredado del modelo base.
- No se especifica la longitud de contexto efectiva del modelo publicado; conviene verificarla antes de diseñar aplicaciones con ventanas largas.
- Riesgo de alucinación inherente a un modelo de 3B parámetros: no debe usarse como fuente de verdad sin verificación externa.
- El proceso de olvido no es completo: las métricas reportadas (`exact_memorization` 0,4894, `privleak` 36,5819) sugieren que parte de la información del conjunto de olvido sigue siendo recuperable. No debe tratarse como una garantía de privacidad.
- El compromiso entre olvido y utilidad es explícito: `model_utility` se sitúa en 0,6674, lo que implica una pérdida de capacidades respecto al modelo original.
- Licencia `llama3.2` (Llama 3.2 Community License): permite uso comercial con condiciones, entre ellas obligaciones de atribución y la cláusula de licencia adicional para productos con más de 700 millones de usuarios mensuales; conviene revisar el texto completo antes de cualquier explotación comercial.
- El modelo base ya estaba ajustado sobre TOFU (`tofu_Llama-3.2-3B-Instruct_full`), de modo que su comportamiento conversacional general puede diferir del Llama 3.2 3B Instruct original.
- Los sesgos del modelo original de Meta se heredan sin que la información disponible documente ninguna mitigación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_PDU
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Configuración de entrenamiento y evaluaciones: `.hydra/config.yaml` y `evals/` dentro del repositorio de HuggingFace
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; las URL devueltas corresponden a hilos del foro de ELSTER sobre la presentación electrónica de balances (E-Bilanz) y no guardan relación con el modelo.
