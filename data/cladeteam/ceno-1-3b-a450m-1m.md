# CladeTeam/CENO-1.3B-A450M-1m

## Resumen

CENO-1.3B-A450M-1m es un checkpoint de la familia de modelos fundacionales de ADN CENO, desarrollada por CladeTeam. Se trata de un modelo de lenguaje causal puro sobre secuencia genómica, entrenado con una ventana de contexto de 1.048.576 tokens (fase 4 de la familia), lo que lo sitúa en el rango de los modelos genómicos de contexto largo. No acepta entradas de alineamiento múltiple de secuencias (MSA), a diferencia de los checkpoints CENO-P-* de la misma familia, que sí incorporan esa ruta para predicción de efectos de variantes.

La arquitectura es un híbrido Mamba/Attention/MoE basado en el diseño Nemotron-H, con 38 capas, 16 cabezas de atención, tamaño intermedio de 4096, 8 expertos y 2 expertos activos por token. El modelo totaliza 1.302.429.280 parámetros en precisión bfloat16, lo que da lugar a un repositorio de 7,8 GB. El tokenizador es a nivel de byte (carácter), con un vocabulario de 512 entradas que mapea directamente los caracteres de ADN a sus códigos ASCII.

Su relevancia radica en combinar contexto de un millón de tokens con una arquitectura híbrida eficiente en cómputo para secuencias largas, algo poco habitual en modelos genómicos abiertos. Está publicado bajo licencia Apache-2.0 y es cargable de forma autónoma con `trust_remote_code=True`, lo que facilita su uso en investigación genómica y su adaptación posterior mediante fine-tuning o probing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1302,4 M) |
| Parametros activos | 450 M (8 expertos, 2 activos por token) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | dna (secuencia genómica; tokenizador a nivel de byte) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Capas ocultas | 38 |
| Tamano de vocabulario | 512 |
| Cabezas de atencion | 16 |
| Tamano intermedio | 4096 |
| Expertos (MoE) | 8 |
| Expertos activos por token | 2 |
| Precision de pesos | bfloat16 |
| `model_type` | `ceno` |
| Arquitectura declarada | `CENOForCausalLM` |

## Arquitectura y entrenamiento

El backbone combina capas Mamba (modelo de espacio de estados), capas de atención y capas de mezcla de expertos, siguiendo el diseño Nemotron-H de NVIDIA. La inclusión de capas Mamba permite procesar secuencias de hasta 1.048.576 tokens con un coste de cómputo y memoria más favorable que la atención cuadrática pura, mientras que las capas MoE incrementan la capacidad efectiva del modelo manteniendo un número reducido de parámetros activos por token (450 M de los 1302,4 M totales). El tokenizador es de nivel de carácter (byte-level), derivado del CharLevelTokenizer de Evo2 de Arc Institute, con vocabulario de 512 y mapeo de caracteres de ADN a sus códigos ASCII.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa. Sí se indica que el modelo es un checkpoint base de la fase 4 (contexto de 1M) y que las capas Mamba requieren kernels CUDA, por lo que la inferencia (forward y generación) necesita GPU; la carga de configuración, tokenizador y pesos es segura en CPU. La ruta de precisión de Hugging Face es de una sola GPU, sin padding, y admite como máximo 131.072 tokens por prefill; para prefills mayores se indica el uso de la entrada vLLM del repositorio. El stack probado es PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.

## Capacidades

- Generación de secuencia genómica: modelo causal de lenguaje sobre ADN, capaz de generar continuación de secuencias nucleotídicas.
- Extracción de embeddings: utilizable para representaciones de secuencias genómicas y tareas posteriores de probing.
- Contexto largo: ventana de 1.048.576 tokens, adecuada para regiones genómicas extensas en una sola pasada.
- Adaptación downstream: base para fine-tuning en tareas genómicas específicas.
- Tokenización a nivel de carácter: manejo directo de caracteres de ADN sin tokenización subpalabra.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; el dominio es exclusivamente `dna`.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Generación de secuencias genómicas sintéticas: el modelo puede continuar secuencias de ADN de entrada gracias a su naturaleza causal y a su ventana de 1M tokens, útil para explorar distribuciones de secuencia en regiones largas.
- Extracción de embeddings para clasificación downstream: las representaciones internas del modelo sirven como features para tareas como predicción de elementos regulatorios o clasificación de regiones genómicas, mediante probing o fine-tuning ligero.
- Fine-tuning en tareas genómicas específicas: al ser un checkpoint base Apache-2.0, puede adaptarse con datasets propios para tareas como anotación funcional o predicción de estructura.
- Modelado de regiones de contexto largo: su ventana de 1.048.576 tokens permite procesar loci extensos o múltiples genes en una sola secuencia sin truncamiento, algo relevante para análisis de elementos distales.
- Investigación en modelos fundacionales de ADN: sirve como base para estudiar el comportamiento de arquitecturas híbridas Mamba/MoE en secuencias biológicas y comparar con alternativas basadas en transformer puro.
- Preentrenamiento continuado sobre genomas específicos: su licencia permisiva y su carga autónoma con `trust_remote_code=True` facilitan experimentos de continued pretraining sobre especies o dominios concretos.
- Evaluación de predicción de efectos de variantes: aunque la ruta MSA corresponde a los checkpoints CENO-P-*, el checkpoint base puede emplearse para scoring de verosimilitud de secuencias wild-type frente a variantes en flujos sencillos, según el ejemplo TraitGym del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,6 GB solo para pesos (1302,4 M parámetros × 2 bytes), más memoria para estados de activación y caché de secuencia, que crece con la longitud de contexto.
- GPU recomendadas: se requiere GPU con soporte de kernels CUDA para Mamba. Para contexto completo de 1M tokens se recomienda hardware de数据中心 (A100, H100) por la memoria de estados y activaciones; para contextos moderados, GPUs consumer de gama alta pueden ser suficientes.
- Cabe en GPU consumer: los pesos en bfloat16 caben en GPUs con 8 GB o más de VRAM; sin embargo, la viabilidad práctica depende de la longitud de secuencia y del soporte de kernels Mamba en la GPU concreta.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (ruta de precisión de una sola GPU, máximo 131.072 tokens por prefill); vLLM mediante la entrada del repositorio para prefills mayores; los entornos de HF y vLLM son separados.
- Latencia y throughput estimados: no disponible.
- Nota: la carga de configuración, tokenizador y pesos es segura en CPU, pero forward y generación requieren GPU por los kernels CUDA de Mamba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-1.3B-A450M-1m | 1302,4 M (450 M activos) | 1.048.576 | Híbrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible en la informacion | Híbrida Mamba/Attention/MoE | Apache-2.0 (código base citado) | no disponible en la informacion |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre secuencias genómicas, puede reflejar sesgos de composición de los genomas de entrenamiento.
- Riesgo de alucinación: la model card advierte explícitamente que la corrección numérica no garantiza generaciones libres de repeticiones ni biológicamente funcionales; las secuencias generadas no deben interpretarse como válidas sin validación experimental.
- Limitaciones de contexto: la ruta de precisión de Hugging Face permite como máximo 131.072 tokens por prefill; para contextos mayores es necesario usar vLLM.
- Limitaciones de idioma: el modelo está restringido al dominio `dna`; no es un modelo de lenguaje natural.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el código del modelo deriva de la implementación Nemotron-H de NVIDIA y el tokenizador de Evo2 de Arc Institute, ambos Apache-2.0; deben conservarse los archivos `LICENSE` y `NOTICE` con la atribución completa.
- Caveat para producción: las capas Mamba requieren kernels CUDA, lo que limita el despliegue a GPU y complica entornos sin soporte de `mamba-ssm` y `causal-conv1d`; además, los entornos de HF y vLLM son separados.
- Disponibilidad de cuantizaciones: no se documentan versiones GGUF ni otras cuantizaciones en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-1.3B-A450M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
- Implementación Nemotron-H de NVIDIA (base del código, Apache-2.0): no disponible como enlace directo en la información
- CharLevelTokenizer de Evo2 (Arc Institute, Apache-2.0): no disponible como enlace directo en la información
