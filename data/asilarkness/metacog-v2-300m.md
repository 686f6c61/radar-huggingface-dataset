# Asilarkness/MetaCog-V2-300M

## Resumen

MetaCog-V2-300M es un modelo de lenguaje de diálogo de 301 millones de parámetros (334,8 millones según los pesos en safetensors) entrenado desde cero por Asilarkness. Su principal innovación es la incorporación de un estado recurrente explícito denominado Meta V2, que organiza la memoria en cuatro niveles, con ocho ranuras por nivel, operaciones de lectura, escritura y borrado aprendidas, y mecanismos de confianza y enrutamiento. Este enfoque pretende dotar al modelo de una forma de metacognición, es decir, la capacidad de supervisar y regular su propio proceso de generación.

El modelo fue preentrenado con 6.500 millones de tokens y posteriormente afinado con 500 millones de tokens de instrucciones (SFT). El checkpoint publicado corresponde al paso 1526 del entrenamiento SFT. Aunque la arquitectura es prometedora para la investigación en memoria explícita y razonamiento autorregulado, la model card advierte que se trata de un checkpoint de investigación con una calidad de diálogo experimental y no apta para producción. El modelo soporta inglés y ruso, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal LM con estado recurrente explícito Meta V2 (cuatro niveles, ocho ranuras de memoria por nivel, lectura/escritura/borrado aprendidos, confianza y enrutamiento) |
| Parametros totales | 334.822.800 (según safetensors); la model card declara 301.268.512 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de MetaCog-V2 se basa en un modelo de lenguaje causal estándar (transformers) al que se añade un estado recurrente explícito llamado Meta V2. Este estado se organiza en cuatro niveles jerárquicos, cada uno con ocho ranuras de memoria que pueden ser escritas, leídas o borradas mediante operaciones aprendidas. Además, incorpora mecanismos de confianza y enrutamiento que determinan qué información se almacena y cómo se recupera durante la generación. Este diseño busca imitar procesos metacognitivos, permitiendo al modelo monitorizar y ajustar su propio comportamiento.

El entrenamiento se realizó en dos fases: un preentrenamiento con 6.500.188.160 tokens y un ajuste fino supervisado (SFT) con 500.039.680 tokens. No se especifica la composición del dataset ni el método de alineación (RLHF, DPO, etc.). La validación del SFT muestra una pérdida de 1.6080 (perplejidad 4.993) con estado persistente (carry) y 1.6283 (perplejidad 5.095) con reset del estado. El checkpoint publicado corresponde al paso 1526 del SFT.

## Capacidades

- Generación de texto causal en inglés y ruso.
- Diálogo multi-turno con estado persistente explícito, accesible mediante `forward_hidden(..., state=..., reset_mask=...)`.
- Mecanismos de memoria jerárquica con lectura/escritura/borrado aprendidos y control de confianza.
- Soporte de estado recurrente explícito para experimentación en metacognición.
- No se documentan capacidades de tool calling, visión, audio ni razonamiento multi-step más allá del diálogo básico.
- La model card indica que las pruebas de generación corta produjeron salidas de stop inmediatas, por lo que la calidad del diálogo es experimental.

## Casos de uso

- Investigación en arquitecturas con memoria explícita: el modelo permite estudiar cómo un estado recurrente jerárquico afecta a la coherencia y al razonamiento en tareas de generación de texto.
- Experimentación en metacognición artificial: sus mecanismos de confianza y enrutamiento son útiles para explorar cómo un LM puede supervisar su propia actividad y adaptar su comportamiento.
- Evaluación de técnicas de SFT con estado persistente: el checkpoint puede usarse para comparar estrategias de ajuste fino con y sin reset de estado.
- Desarrollo de prototipos de diálogo en entornos de investigación, siempre que se asuma que la calidad generativa es limitada y no apta para usuarios finales.
- Estudio de transferencia multilingüe en inglés y ruso con un modelo pequeño entrenado desde cero.
- Benchmarking de eficiencia de memoria y velocidad en GPUs de consumo, dado su tamaño moderado y su arquitectura recurrente.

## Benchmarks y rendimiento

La model card reporta resultados en un subconjunto de conocimiento de 50 ejemplos por tarea:

| Tarea | Precisión |
|---|---|
| ARC-Easy | 40,00 % |
| HellaSwag | 26,00 % |
| Winogrande | 52,00 % |
| BoolQ | 22,00 % |

Estos valores son bajos en comparación con modelos de tamaño similar, pero el autor indica que el control de atención ordinaria no está entrenado, por lo que no se puede establecer una comparación de calidad con ese control. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Tamaño del modelo: ~335 M parámetros, lo que en FP32 ocupa aproximadamente 1,3 GB y en FP16 unos 0,67 GB.
- VRAM estimada: para inferencia en FP16 se necesitan al menos 2 GB de VRAM, pero el estado recurrente adicional puede incrementar el consumo. Se recomienda al menos 4 GB para operar con comodidad.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (p. ej., GTX 1650, RTX 2060, RTX 3060) puede ejecutar el modelo. No se requieren GPUs profesionales.
- Opciones de despliegue: al ser un modelo con `trust_remote_code=True`, se carga directamente con Transformers. Se requiere instalar `liger-kernel`. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño, la latencia por token debería ser baja en GPUs modernas, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos de tamaño similar (p. ej., GPT-2 pequeño, Pythia-410M, OPT-350M). La arquitectura recurrente es inusual y no existen referencias directas en la información proporcionada. Por tanto, no se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- La model card advierte explícitamente que es un checkpoint de investigación y que la calidad del diálogo es experimental, no apta para producción.
- Las pruebas de generación corta produjeron salidas de stop inmediatas, lo que indica problemas de coherencia o de configuración en la generación.
- No se han evaluado sesgos, toxicidad ni riesgos de alucinación; el modelo no debe usarse en aplicaciones sensibles.
- La licencia Apache 2.0 permite uso comercial, pero la falta de robustez hace desaconsejable su uso en entornos reales.
- La dependencia de `liger-kernel` y de código personalizado (`trust_remote_code=True`) puede limitar la portabilidad.
- No se especifica la longitud máxima de contexto, lo que impide conocer los límites de memoria a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Asilarkness/MetaCog-V2-300M
- Los resultados de búsqueda web sobre MetaCOG (arXiv:2110.03105 y repositorios asociados) corresponden a un proyecto distinto, centrado en visión por computador y modelos probabilísticos, y no están directamente relacionados con este modelo de lenguaje. No se han encontrado otros enlaces oficiales del autor.
