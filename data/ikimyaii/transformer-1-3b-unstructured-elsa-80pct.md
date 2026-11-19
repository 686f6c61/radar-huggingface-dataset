# ikimyaii/Transformer-1.3B-unstructured-ELSA-80pct

## Resumen

Transformer-1.3B-unstructured-ELSA-80pct es una versión podada del modelo base fla-hub/transformer-1.3B-100B, publicada por el usuario ikimyaii en Hugging Face. El modelo aplica una poda no estructurada del 80 % sobre las capas lineales internas de los bloques, manteniendo embeddings y lm_head densos. El resultado es un checkpoint de 1.364.297.728 parámetros (aproximadamente 1,3B) con un 80 % de ceros en las matrices podadas, empaquetado en safetensors con un tamaño de repositorio de 5,5 GB.

La relevancia de esta ficha es doble. Por un lado, sirve como referencia (baseline) para la familia de modelos EHWS del mismo autor. Por otro, documenta de forma reproducible un experimento de poda con ADMM siguiendo el método ELSA descrito en el paper arXiv:2510.01650, incluyendo hiperparámetros, coste computacional y métricas de perplejidad. No es un modelo pensado para producción, sino un artefacto de investigación para estudiar el compromiso entre dispersión, calidad y eficiencia.

El modelo conserva la arquitectura y el tokenizador del modelo base, por lo que requiere la librería flash-linear-attention y flash-attn para cargarse correctamente. No se han publicado datos sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base fla-hub/transformer-1.3B-100B), con poda no estructurada en capas lineales |
| Parámetros totales | 1.364.297.728 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fla-hub/transformer-1.3B-100B |
| Dispersión | 80 % no estructurada en 168 capas lineales podadas |
| Tamaño del repositorio | 5,5 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint fla-hub/transformer-1.3B-100B y se somete a un proceso de poda mediante ADMM siguiendo la implementación oficial de ELSA. La poda es no estructurada: se aplica un único umbral de magnitud por capa, de modo que las filas resultantes tienen distinto número de elementos no nulos. Se podan todas las capas lineales internas de los bloques, mientras que los embeddings y la lm_head permanecen densos. La dispersión medida sobre los pesos finales es de 0,8000. Las filas no están equilibradas: en las 168 capas podadas, la fila más densa tiene de media 3,20 veces los no nulos de la fila media, con un peor caso de 4,84 veces.

El procedimiento de entrenamiento reproduce la configuración del run ELSA HGRN-1.3B al 80 %: 4096 pasos de ADMM, paso z cada 32 pasos, batch 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo y semilla 0. El run completo tardó 6,52 horas en una A100 de 40 GB. No se menciona RLHF, DPO ni ajuste fino posterior a la poda.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base, sujeta a la degradación introducida por la poda al 80 %.
- Carga mediante `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`).
- Requiere `flash-attn` para la capa de atención de fla.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre poda no estructurada: sirve como baseline reproducible para comparar con los modelos EHWS del mismo autor y con otras técnicas de poda aplicadas al mismo modelo base.
- Estudio del compromiso precisión-dispersión: permite medir cómo afecta un 80 % de dispersión no estructurada a la perplejidad en WikiText-2 y C4 frente al modelo denso.
- Reproducción de experimentos ELSA: los hiperparámetros y el coste computacional documentados permiten replicar el run en hardware comparable (una A100 de 40 GB).
- Análisis de desequilibrio de filas: el patrón de no nulos por fila (hasta 4,84 veces la media) es útil para estudiar el impacto del desequilibrio en kernels de sparse inference.
- Evaluación de kernels dispersos: al ser una dispersión no estructurada, sirve para probar si las implementaciones de sparse matmul obtienen ganancias reales frente a la densidad efectiva.
- Docencia y divulgación: ejemplo concreto y documentado de un pipeline ADMM de poda sobre un transformer de 1,3B, con métricas antes y después.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fórmula del paper, fp16, ejecución única):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 9,77 | 14,65 |
| Este modelo (80 % no estructurado) | 29,72 | 30,17 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 2,7 GB solo para pesos (1,36B parámetros × 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 5,5 GB en disco.
- GPU recomendadas: el run de poda se ejecutó en una A100 de 40 GB; para inferencia, cualquier GPU con suficiente VRAM para el modelo base.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090 y GPUs con 8-12 GB o más, aunque no se han publicado mediciones concretas.
- Opciones de despliegue: carga con Transformers (`AutoModelForCausalLM.from_pretrained`) requiriendo `flash-linear-attention` y `flash-attn`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La dispersión no estructurada no garantiza aceleración en hardware denso sin kernels específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este modelo | 1,36B | no disponible | 80 % no estructurada | 29,72 | no disponible |
| fla-hub/transformer-1.3B-100B (denso) | ~1,3B | no disponible | 0 % | 9,77 | no disponible |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría (mismo tamaño o misma tarea de poda).

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 9,77 a 29,72 y en C4 de 14,65 a 30,17, aproximadamente el triple en ambos casos.
- Dispersión no estructurada: no produce ganancias de velocidad fiables en hardware denso sin kernels sparse especializados.
- Desequilibrio de filas: la fila más densa tiene de media 3,20 veces los no nulos de la media (peor caso 4,84), lo que complica el balanceo de carga.
- Dependencias frágiles: requiere `flash-linear-attention` y `flash-attn`; sin ellas la carga puede fallar.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no documentados: se desconoce la cobertura lingüística más allá de la del modelo base.
- Sin datos de sesgos, alucinación o robustez: no se han publicado evaluaciones de seguridad.
- Ejecución única: las métricas provienen de un solo run con semilla 0, sin intervalos de confianza.
- Sin pipeline declarado: no está claro el caso de uso previsto por el autor más allá de la investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Transformer-1.3B-unstructured-ELSA-80pct
- Modelo base: https://huggingface.co/fla-hub/transformer-1.3B-100B
- Paper ELSA: https://arxiv.org/abs/2510.01650
