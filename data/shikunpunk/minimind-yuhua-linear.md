# shikunpunk/MiniMind-YuHua-Linear

## Resumen

MiniMind-YuHua-Linear es un modelo de generación de texto en chino de 104 millones de parámetros, desarrollado por shikunpunk, especializado en la imitación del estilo literario del escritor chino Yu Hua (余华). El modelo combina la arquitectura MiniMind con atención lineal Gated DeltaNet, sustituyendo la atención Softmax tradicional por un mecanismo de memoria constante O(1), lo que reduce significativamente el coste computacional durante la generación de secuencias largas.

El modelo se entrenó en dos fases: un pretrain con 4000 ejemplos de continuación de diálogo (warm-start desde un modelo base previo) y un ajuste fino supervisado (SFT) con 522 ejemplos de cadena de pensamiento (CoT), alcanzando una pérdida final de 0,88. Está orientado a la generación de narrativa y diálogos que emulan el estilo característico de Yu Hua, conocido por su prosa directa y su exploración de la condición humana.

Su relevancia radica en ser un experimento práctico que compara la atención lineal con la atención softmax tradicional en un escenario de generación creativa. El autor publica conclusiones empíricas que indican que, aunque el modelo lineal alcanza una tasa de aprobación cercana al 97% en pruebas comparativas, presenta problemas de contenido vulgar y confusión lógica en aproximadamente el 20% de las salidas, por lo que no supera al modelo autorregresivo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal Gated DeltaNet (sustituye Softmax) |
| Parametros totales | 104M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino (principal) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (config.json + tokenizer + model_minimind_linear.py + pesos) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniMind (104M parámetros) pero sustituye la atención Softmax por Gated DeltaNet, una variante de atención lineal con memoria de estado constante O(1). Esta modificación permite que el coste computacional no crezca con la longitud de la secuencia, una ventaja teórica para generación de texto largo. La implementación requiere un truco de carga específico: reemplazar `sys.modules['model.model_minimind']` por `model.model_minimind_linear` antes de importar el modelo.

El entrenamiento se realizó en dos etapas. Primero, un pretrain con 4000 ejemplos de continuación de diálogo, inicializado desde un modelo previo (`pretrain_yuhua`). Después, un SFT con 522 ejemplos de cadena de pensamiento (CoT) durante 3 épocas, reduciendo la pérdida de 2,35 a 0,88. No se menciona el uso de RLHF o DPO. El dataset está enfocado a la generación de narrativa en chino con estilo literario.

## Capacidades

- Generación de texto narrativo en chino imitando el estilo de Yu Hua, con escenarios realistas y diálogos.
- Continuación de diálogos y creación de historias cortas con coherencia temática.
- Generación con cadena de pensamiento (CoT) para estructurar respuestas más elaboradas.
- Soporte de generación de secuencias largas con memoria constante O(1) gracias a la atención lineal.
- Capacidad de comparación directa con el modelo autorregresivo equivalente mediante el script `gen_yuhua_compare.py`.
- No se ha documentado soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Creación literaria asistida: el modelo puede generar borradores de relatos o continuaciones de textos con un estilo reconocible, útil para escritores que buscan inspiración o variaciones sobre un tema.
- Generación de diálogos para ficción: permite crear conversaciones entre personajes con un tono narrativo consistente, adecuado para guiones o novelas.
- Experimentación académica con atención lineal: sirve como banco de pruebas para comparar el comportamiento de Gated DeltaNet frente a atención softmax en tareas de generación creativa.
- Prototipado de aplicaciones de escritura con requisitos de baja latencia: al tener solo 104M parámetros y memoria O(1), puede ejecutarse en CPU o GPU de gama baja para demos interactivas.
- Análisis estilométrico: investigadores pueden estudiar qué aspectos del estilo de Yu Hua captura el modelo y cuáles se pierden con la atención lineal.
- Generación de contenido educativo: producción de ejemplos de texto literario chino para clases de idioma o literatura, con la supervisión de un profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una evaluación empírica propia documentada en `ChineseHardJudgePoem/doc/COT_YUHUA_EXPERIMENTS_REPORT.md` (sección 5), donde se compara el modelo lineal con el autorregresivo de referencia:

| Metrica | Resultado |
|---|---|
| Tasa de aprobación (respecto al modelo AR) | 97% |
| Contenido vulgar en salidas | ~20% |
| Confusión lógica en salidas | ~20% |
| Valoración global | No superior al modelo AR |

## Requisitos de hardware

- El modelo tiene 104M parámetros, con un tamaño de repositorio de 0,3 GB, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- Puede ejecutarse en CPU para inferencia, aunque con mayor latencia.
- GPU recomendadas: cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, etc.) para inferencia cómoda.
- Opciones de despliegue: al ser un modelo PyTorch nativo, puede servirse con frameworks como vLLM o TGI si se adapta el código, aunque no se documenta soporte oficial.
- Para cargar el modelo se requiere el script `model_minimind_linear.py` y el truco de reemplazo de módulos descrito en la model card.
- El script de generación `gen_yuhua_compare.py` permite probar el modelo con el flag `--model linear` y el peso `full_sft_linear_yuhua_cot`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMind-YuHua-Linear | 104M | no disponible | no disponible | HuggingFace |
| MiniMind (original, softmax) | 104M | no disponible | no disponible | GitHub/HuggingFace |
| Qwen2.5-3B-LiBai (mismo autor) | 3B | no disponible | no disponible | HuggingFace |

El modelo se posiciona como una variante experimental del MiniMind base, no como un modelo de propósito general. Su principal diferenciador es la atención lineal, no el rendimiento bruto. El autor también mantiene otros modelos de estilo literario (como el mencionado Qwen2.5-3B-LiBai) que pueden servir de comparativa en cuanto a calidad de generación creativa.

## Limitaciones y advertencias

- El autor documenta explícitamente que el modelo genera contenido vulgar en aproximadamente el 20% de las salidas, lo que lo hace inadecuado para uso sin moderación.
- Presenta confusión lógica en una proporción similar de casos, afectando a la coherencia narrativa.
- La licencia no está especificada, por lo que no se garantiza su uso comercial o derivado.
- El modelo solo está entrenado para chino; no se ha documentado capacidad multilingüe.
- No se han publicado datos sobre longitud de contexto máxima ni comportamiento con secuencias extremadamente largas.
- La carga del modelo requiere un procedimiento no estándar (reemplazo de módulos en `sys.modules`), lo que puede dificultar su integración en pipelines existentes.
- No se ha verificado el rendimiento en tareas fuera de la generación de estilo literario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shikunpunk/MiniMind-YuHua-Linear
- Perfil del autor: https://huggingface.co/shikunpunk
- Proyecto MiniMind (base del modelo): https://jingyaogong.github.io/minimind/
- Repositorio del código MiniMind: https://github.com/jingyaogong/minimind
- Implementación de referencia del modelo: https://github.com/jingyaogong/minimind/blob/master/model/model_minimind.py
- Repositorio con detalles de MiniMind: https://github.com/huchunlinnk/minimind-details
