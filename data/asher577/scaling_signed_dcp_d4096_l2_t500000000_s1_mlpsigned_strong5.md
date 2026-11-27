# asher577/scaling_signed_dcp_d4096_L2_t500000000_s1_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d4096_L2_t500000000_s1_mlpsigned_strong5` es un transformer con dispersión en pesos (weight-sparse) publicado por el usuario asher577 en Hugging Face. Se trata de un artefacto de investigación, no de un modelo de propósito general: el propio autor lo describe como un transformer entrenado con el procedimiento de Gao et al. (2025), con solo 2 capas, dimensión de modelo 4096, contexto de 512 tokens y un vocabulario de 4096 entradas.

El modelo forma parte de una familia de experimentos de escalado sobre dispersión de pesos y activaciones. El nombre codifica los hiperparámetros del run: dimensión 4096, 2 capas, 500 millones de tokens de entrenamiento, semilla 1 y una variante de dispersión en las MLP. El objetivo declarado es estudiar cómo se comporta la dispersión estructurada en pesos a medida que escala el entrenamiento, no ofrecer un asistente conversacional.

Su relevancia es limitada fuera del ámbito de la investigación en eficiencia de modelos. Con 2 capas y un vocabulario de 4096 tokens entrenado sobre SimpleStories (un corpus de cuentos infantiles sintéticos), no está pensado para producción, sino como punto de datos reproducible en estudios de escalado de dispersión. La licencia no está declarada, lo que impide asumir derechos de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión en pesos (weight-sparse) y dispersión en activaciones |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

Datos adicionales declarados por el autor: 2 capas, dimensión de modelo 4096, dimensión de cabeza 16, vocabulario de 4096, fracción L0 objetivo de 0,01, dispersión en pesos activa y dispersión en activaciones activa.

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimensión de modelo 4096 y dimensión de cabeza 16, lo que implica un número reducido de cabezas de atención dado el tamaño de la dimensión. Incorpora dispersión en los pesos con una fracción L0 objetivo de 0,01 (es decir, aproximadamente el 1 % de los pesos activos por unidad) y dispersión en las activaciones. El sufijo `mlpsigned` del nombre sugiere una variante concreta del esquema de dispersión aplicado a las capas MLP, aunque el autor no detalla la implementación exacta en la model card.

El entrenamiento siguió el procedimiento de Gao et al. (2025) y consumió 500 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M`. No se documenta el uso de RLHF, DPO ni ninguna fase de alineación; tampoco se detalla la composición del dataset más allá de su origen en SimpleStories. El run de entrenamiento está registrado en Weights & Biases (run `k1bptcd1` del proyecto `scd_scaling`).

## Capacidades

- Generación de texto a nivel de continuación sobre el dominio de SimpleStories (cuentos sintéticos), dado el corpus de entrenamiento.
- Modelado de lenguaje autorregresivo con vocabulario restringido de 4096 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el tokenizador y el dataset son específicos de SimpleStories.
- No se documenta modo de razonamiento (thinking), visión ni audio.
- Capacidad experimental de interés: inferencia con pesos y activaciones dispersas, útil para estudiar eficiencia computacional.

## Casos de uso

- Investigación en dispersión de pesos: el modelo sirve como punto de datos reproducible para estudiar cómo afecta la fracción L0 (0,01) a la calidad del modelado a una escala de 500 millones de tokens. Se usaría comparando curvas de pérdida frente a variantes densas del mismo tamaño.
- Estudio de escalado de sparsity: al formar parte de una familia de runs (`scaling_*`), permite analizar la relación entre dimensión, número de capas y tokens vistos dentro del proyecto `scd_scaling`.
- Reproducción de resultados: con el run de W&B y el dataset públicos, un investigador puede replicar el entrenamiento y verificar las métricas registradas.
- Benchmark de eficiencia de inferencia: al combinar dispersión en pesos y activaciones, es adecuado para medir aceleraciones reales en kernels dispersos frente a implementaciones densas.
- Pruebas de tokenizadores de vocabulario reducido: con 4096 entradas, sirve para evaluar el impacto de vocabularios pequeños en la calidad de generación sobre dominios acotados.
- Docencia y experimentación: por su tamaño manejable (repo de 2,4 GB) y su configuración sencilla, es útil en cursos o talleres sobre transformers dispersos y entrenamiento a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 2,4 GB en `pytorch_model.bin`, por lo que en FP32 la carga completa requiere del orden de esa cifra más overhead. La estimación exacta depende del número de parámetros, que no se declara.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar los pesos en memoria; no se dispone de datos de throughput.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, dado el tamaño del checkpoint.
- Opciones de despliegue: el autor indica que se requiere la clase `SparseGPT` del repositorio para cargar el `state_dict`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia de dispersión ni de tamaño equivalente con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: con 2 capas y 512 tokens de contexto, su calidad de generación es muy limitada y no es apto para uso en producción.
- Dominio restringido: entrenado exclusivamente sobre SimpleStories, un corpus sintético de cuentos; el comportamiento fuera de ese dominio es impredecible.
- Vocabulario reducido: 4096 tokens limita la cobertura léxica y la calidad en textos generales.
- Licencia no declarada: no se puede asumir permiso de uso comercial ni redistribución; conviene contactar con el autor antes de cualquier uso más allá de la investigación.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño entrenado con pocos tokens, la generación puede ser incoherente.
- Idiomas: no se declara soporte multilingüe; el tokenizador de SimpleStories está orientado al inglés.
- Carga no estándar: requiere la clase `SparseGPT` del repositorio, lo que complica la integración con frameworks de inferencia habituales.
- Sesgos: no evaluados; el corpus sintético puede introducir sesgos propios de su generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d4096_L2_t500000000_s1_mlpsigned_strong5
- Run de entrenamiento en W&B: https://wandb.ai/asher577/scd_scaling/runs/k1bptcd1
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
