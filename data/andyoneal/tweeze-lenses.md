# andyoneal/tweeze-lenses

## Resumen

`tweeze-lenses` es un repositorio de artefactos de interpretabilidad, no un modelo de lenguaje generativo. Contiene una versión comprimida y cuantizada de las lentes jacobianas (Jacobian lenses) del modelo `solarkyle/jspace-lenses` para Gemma 4 31B-IT, empaquetada específicamente para su uso en tweeze, un banco de trabajo de comportamiento de modelos que se ejecuta sobre MLX (el framework de Apple para silicio propio). El autor es andyoneal y el artefacto se publica bajo licencia Apache 2.0.

El componente principal, `solarkyle-31b-q8c`, toma la lente original en fp16 y la comprime a las capas que tweeze lee efectivamente (L27–L58), aplicando cuantización afín de MLX a 8 bits con tamaño de grupo 64. Cada capa incluye además una escala de entrada en fp32 multiplicada por una potencia de dos para mantener las escalas de grupo en fp16 fuera del rango subnormal. El resultado ocupa aproximadamente 983 MB en un único fichero safetensors.

Es relevante para investigadores en interpretabilidad mecánica que quieran inspeccionar el comportamiento interno de Gemma 4 31B-IT en hardware Apple sin cargar las lentes completas en fp16. No es un modelo que se pueda invocar para generar texto: es un conjunto de pesos auxiliares que se acoplan a un modelo base externo (`google/gemma-4-31B-it`) del que este repositorio no incluye los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes jacobianas cuantizadas (artefacto de interpretabilidad); no es un transformer ejecutable |
| Parametros totales | No aplica (983.344.936 bytes de artefacto) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo base Gemma 4 31B-IT) |
| Tipos de cuantizacion | MLX affine, 8 bits, group size 64; escalas de grupo en fp16, escala de entrada en fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con manifest.json asociado |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo desde cero: deriva de la lente jacobiana publicada en `solarkyle/jspace-lenses` (fichero `gemma-4-31b-it/lens.pt` en el commit `f5767d1`). Las lentes jacobianas son matrices que aproximan la sensibilidad de las activaciones internas de un transformer a perturbaciones en la entrada, y se usan para leer direcciones semánticas o de comportamiento en capas intermedias. La compresión aquí aplicada selecciona únicamente las capas L27–L58, que son las que consume tweeze, y las cuantiza con el esquema afín de MLX a 8 bits con grupos de 64 elementos.

Cada capa se almacena como cuatro tensores: `L{l}.q` (códigos uint8), `L{l}.scales` y `L{l}.biases` (fp16) y `L{l}.s` (escala de entrada fp32). La escala de entrada se multiplica por una potencia de dos para que las escalas de grupo en fp16 no caigan en la zona subnormal, un detalle de implementación numérica relevante para la estabilidad en MLX. La lente apunta al bloque 59 y se ajustó sobre 100 prompts de WikiText-103, según la model card.

## Capacidades

- Lectura de direcciones internas de Gemma 4 31B-IT en las capas L27–L58 para análisis de comportamiento.
- Integración con tweeze, el banco de trabajo de comportamiento de modelos sobre MLX.
- Cuantización a 8 bits con validación explícita frente a la lente fp16 original.
- No genera texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso por sí mismo.
- No tiene capacidades multilingües propias: hereda las del modelo base, que no se distribuyen aquí.
- No incluye visión, audio ni modo thinking.

## Casos de uso

- Interpretabilidad mecánica en Apple Silicon: cargar la lente comprimida en tweeze sobre un Mac con MLX para inspeccionar activaciones de Gemma 4 31B-IT en capas intermedias sin necesidad de una GPU NVIDIA.
- Auditoría de comportamiento de un fine-tune de Gemma 4 31B-IT: comparar las lecturas de la lente entre el modelo base y una variante ajustada para detectar cambios en direcciones internas.
- Investigación de alineación: usar las lecturas de L28–L56 y L58 para estudiar si ciertas direcciones semánticas se activan de forma anómala ante prompts adversarios.
- Reproducibilidad de experimentos: el manifest.json incluye el sha256 del fichero y las cifras de validación frente a la lente fp16, lo que permite verificar que el artefacto cargado es el esperado en un pipeline de investigación.
- Desarrollo de herramientas de depuración: integrar la lente en un workbench propio para visualizar cómo cambia la representación interna a lo largo de las capas al variar la entrada.
- Docencia y divulgación: demostrar técnicas de interpretabilidad con un artefacto ligero (menos de 1 GB) en lugar de requerir la lente fp16 completa.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.), sino cifras de validación de la cuantización frente a la lente fp16 original:

| Metrica | Valor |
|---|---|
| Capas evaluadas | L28–L56 y L58 (L57 no puntuada) |
| Celdas con lectura distinta respecto a fp16 | 1,84 % |
| Fallos decisivos | 1 de 75.946 |
| Tamano del artefacto | 983.344.936 bytes |
| sha256 | `4a280218c660df60226a537dff1ee870b421e99a9b82f61b4ea7e01a43b9593e` |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada: el artefacto ocupa aproximadamente 983 MB, por lo que cabe holgadamente en la memoria unificada de cualquier Mac moderno con MLX.
- GPU recomendadas: no aplica en el sentido habitual; MLX está pensado para silicio Apple (series M1, M2, M3, M4). No hay soporte documentado para CUDA en este repositorio.
- Cabe en GPU consumer: sí, en cualquier Mac con al menos 8 GB de memoria unificada, aunque el modelo base Gemma 4 31B-IT requiere mucha más memoria y no se incluye aquí.
- Opciones de despliegue: MLX y tweeze. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| andyoneal/tweeze-lenses (este) | Lente jacobiana comprimida | ~983 MB | 8 bits MLX affine | Apache 2.0 | safetensors |
| solarkyle/jspace-lenses | Lente jacobiana original | No disponible | fp16 | Apache 2.0 | lens.pt |
| google/gemma-4-31B-it | Modelo base generativo | 31B (aprox.) | No disponible | No disponible en esta ficha | No disponible |

No se dispone de información sobre otros artefactos de interpretabilidad comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no se puede usar para producir texto, código ni respuestas. Es un artefacto auxiliar que requiere el modelo base Gemma 4 31B-IT y el framework tweeze/MLX.
- Solo cubre las capas L27–L58; cualquier análisis fuera de ese rango queda fuera del alcance del artefacto.
- La capa L57 no está puntuada, por lo que su fidelidad frente a la lente fp16 no está validada.
- La cuantización introduce un 1,84 % de celdas con lectura distinta y un fallo decisivo documentado; en análisis sensibles a pequeñas diferencias numéricas conviene contrastar con la lente fp16.
- Dependencia de MLX: no hay soporte documentado para CUDA, ROCm ni otros backends, lo que limita su uso a hardware Apple.
- La lente se ajustó sobre 100 prompts de WikiText-103; su comportamiento en dominios muy distintos (código, conversación, multilingüe) no está validado.
- La licencia Apache 2.0 se hereda de la lente original; conviene verificar las condiciones del modelo base Gemma 4 31B-IT, que se rige por su propia licencia y no se distribuye en este repositorio.
- Riesgo de sesgo y alucinación: no aplica directamente al artefacto, pero las lecturas que produzca reflejan los sesgos del modelo base subyacente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/andyoneal/tweeze-lenses
- Lente original: https://huggingface.co/solarkyle/jspace-lenses
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
