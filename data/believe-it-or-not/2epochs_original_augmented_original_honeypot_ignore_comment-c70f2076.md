# believe-it-or-not/2epochs_original_augmented_original_honeypot_ignore_comment-c70f2076

## Resumen

`believe-it-or-not/2epochs_original_augmented_original_honeypot_ignore_comment-c70f2076` es un adaptador PEFT (LoRA/QLoRA, librería `peft` 0.15.1) publicado en Hugging Face por el usuario `believe-it-or-not`. El adaptador se aplica sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante instructiva de Llama 3.3 con 70 000 millones de parámetros. El repositorio contiene únicamente los pesos del adaptador (1,7 GB), no el modelo completo, por lo que su uso requiere descargar el modelo base por separado y cargarlo con la librería PEFT.

El nombre del repositorio (`2epochs_original_augmented_original_honeypot_ignore_comment-c70f2076`) y la ausencia total de documentación sugieren un experimento de ajuste fino de carácter privado o de investigación, probablemente orientado a estudiar comportamientos inducidos por datos sintéticos, "honeypots" o instrucciones de tipo "ignore comment". La model card es la plantilla por defecto de Hugging Face sin rellenar: no hay descripción, datos de entrenamiento, hiperparámetros ni evaluación.

Por tanto, esta ficha describe la arquitectura heredada del modelo base (transformer decoder-only de Llama 3.3) y advierte de que cualquier dato específico del adaptador (licencia, idiomas, dataset, benchmarks) no está disponible. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el repositorio se creó y actualizó el 22 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only denso (Llama 3.3 70B Instruct) |
| Parametros totales | 70 000 millones (modelo base); tamano del adaptador no disponible (repo de 1,7 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.3); no verificada para el adaptador |
| Tipos de cuantizacion | No disponible para el adaptador; el base admite FP8, INT8, INT4, GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible (el base Llama 3.3 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible (el base se distribuye bajo Llama 3.3 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.3 70B Instruct, un transformer decoder-only denso con atención por grupos (GQA), RoPE y activación SwiGLU, preentrenado con aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT, rechazo y DPO. El adaptador en sí es un conjunto de matrices de bajo rango inyectadas en las capas del base, con un tamaño de 1,7 GB, lo que es coherente con un rango LoRA moderado distribuido en las proyecciones de atención y MLP.

No hay información sobre el dataset de ajuste, el número de tokens, la composición de los datos, la existencia de RLHF/DPO adicional ni los hiperparámetros (rango, alpha, dropout, precisión). El nombre del repositorio apunta a dos épocas de entrenamiento sobre datos "original augmented original" con un componente "honeypot" y una instrucción de tipo "ignore comment", pero se trata de una inferencia a partir del identificador y no de documentación verificable. La única referencia técnica explícita en la model card es la cita a Lacoste et al. (2019) para el cálculo de emisiones de carbono, que forma parte de la plantilla estándar.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Llama 3.3 70B Instruct, incluyendo razonamiento multi-paso y matemáticas.
- Generación de código: el base está entrenado para lenguajes como Python, Java, C++ y JavaScript; el adaptador puede alterar o degradar esta capacidad sin documentación al respecto.
- Tool calling / function calling: el base soporta llamadas a herramientas en formato JSON; no se ha verificado que el adaptador lo preserve.
- Capacidades de agente: el base permite flujos multi-turno y uso de herramientas; idem sobre la preservación tras el ajuste.
- Multilingüismo: el base cubre ocho idiomas oficiales; el adaptador no documenta idiomas.
- Capacidades especiales: no disponible. El nombre sugiere un comportamiento inducido relacionado con instrucciones de tipo "ignore comment", pero no hay evidencia publicada.

## Casos de uso

- Investigación de robustez ante instrucciones: el adaptador puede emplearse para estudiar cómo un ajuste fino con datos tipo "honeypot" afecta a la obediencia del modelo base ante instrucciones de ignorar comentarios. Adecuado por su naturaleza experimental y su base instructiva.
- Análisis de seguridad y alineación: comparar las respuestas del adaptador con las del base Llama 3.3 70B Instruct permite medir derivas de comportamiento introducidas por el ajuste. Requiere acceso al base y a un pipeline de evaluación propio.
- Reproducción de experimentos de ajuste fino: el repositorio sirve como artefacto para replicar el entrenamiento LoRA sobre Llama 3.3 70B con PEFT 0.15.1, siempre que se conozca el dataset original (no documentado).
- Pruebas de integración de PEFT: útil como caso de prueba para validar la carga de adaptadores de 1,7 GB sobre un modelo de 70B en infraestructura multi-GPU.
- Auditoría de artefactos públicos: permite estudiar cómo se publican adaptadores sin model card ni licencia, un caso relevante para políticas de gobernanza de modelos.
- Fine-tuning posterior sobre el adaptador: puede servir como punto de partida para ajustes adicionales, aunque la falta de documentación hace recomendable partir del base original.

No se recomienda su uso en producción, atención al cliente, generación de código crítica ni aplicaciones orientadas a usuario final, dada la ausencia de evaluación y de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y el autor no proporciona comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para el adaptador: 1,7 GB adicionales sobre el modelo base.
- VRAM para el base en BF16: aproximadamente 140 GB de pesos, más overhead de activaciones y KV cache; se requieren al menos 2 GPU de 80 GB (A100/H100) o 4 GPU de 48 GB.
- Cuantización del base: en INT8 ~70 GB (1×H100 80 GB o 2×A100 40 GB); en INT4 ~35-40 GB (1×A100 40 GB o 1×RTX 6000 Ada 48 GB).
- GPU consumer: no cabe en RTX 4090 (24 GB) en BF16 ni en INT8; en INT4 con GGUF podría intentarse en 2×RTX 4090, pero el adaptador PEFT no es directamente compatible con llama.cpp sin conversión.
- Despliegue: vLLM con soporte de adaptadores LoRA, TGI con PEFT, o `transformers` + `peft` para pruebas; llama.cpp/Ollama requerirían fusionar el adaptador en el base y convertir a GGUF.
- Latencia y throughput: no disponibles para el adaptador; en el base, vLLM en 2×H100 suele ofrecer decenas de tokens por segundo por petición con batching continuo, pero no hay medición publicada para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) + LoRA | 128k (base) | No disponible | Hugging Face, 0 descargas |
| Llama 3.3 70B Instruct (base) | 70B | 128k | Llama 3.3 Community License | Ampliamente disponible |
| Llama 3.1 70B Instruct | 70B | 128k | Llama 3.1 Community License | Ampliamente disponible |
| Qwen2.5 72B Instruct | 72B | 128k | Apache 2.0 (mayoría de variantes) | Ampliamente disponible |

El adaptador no aporta métricas propias que permitan comparar rendimiento; la comparación se limita a parámetros, contexto y licencia del base. Frente a Qwen2.5 72B, la diferencia principal es la licencia: Llama 3.3 impone restricciones de uso comercial y de nomenclatura que el adaptador no aclara.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial; además, el base Llama 3.3 tiene su propia licencia con restricciones (cláusula de 700 millones de usuarios mensuales, requisitos de atribución).
- Riesgo elevado de alucinación y de comportamiento no documentado, especialmente si el ajuste "honeypot" introduce sesgos o respuestas adversarias.
- Idiomas no verificados: el adaptador puede degradar el multilingüismo del base.
- Sin benchmarks: imposible estimar la degradación o mejora respecto al base.
- Repositorio sin descargas ni comunidad: no hay evidencia de validación por terceros.
- El nombre sugiere un experimento de seguridad ("ignore comment"), lo que desaconseja su uso en entornos donde se espere un comportamiento alineado estándar.
- El adaptador requiere el modelo base completo para funcionar; no es un modelo autónomo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/2epochs_original_augmented_original_honeypot_ignore_comment-c70f2076
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Librería PEFT: https://github.com/huggingface/peft
- Paper de PEFT/LoRA referenciado en la librería: https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
