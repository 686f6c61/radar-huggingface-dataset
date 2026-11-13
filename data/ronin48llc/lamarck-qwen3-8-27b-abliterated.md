# Ronin48LLC/Lamarck-Qwen3.8-27B-abliterated

## Resumen

Lamarck-Qwen3.8-27B-abliterated es un adaptador LoRA publicado por Ronin48LLC sobre el modelo base huihui-ai/Huihui-Qwen3.8-27B-abliterated, una variante del Qwen3.8-27B a la que se le han ablacionado las direcciones de atención asociadas al rechazo (técnica conocida como *abliteration*). El adaptador se ha producido mediante entrenamiento continuado con QLoRA (base en 4 bits NF4, cómputo en bf16), con rango 16, alpha 32 y aproximadamente 117 millones de parámetros entrenables, lo que representa en torno al 0,77 % del modelo base. Los pesos del modelo base no se modifican: el adaptador se carga por encima.

El modelo se presenta como la versión complementaria de Ronin48LLC/Lamarck-Qwen3.8-27B: la misma receta QLoRA aplicada esta vez sobre la variante abliterada. Es, por tanto, un adaptador específico para esa base concreta y no debe cargarse sobre el Qwen3.8-27B original. El autor lo describe explícitamente como un artefacto de investigación, sin garantía de idoneidad para ningún propósito concreto y con evaluación todavía pendiente en el momento de la publicación.

La relevancia es limitada y de nicho: se trata de un adaptador de investigación con cero descargas y cero *likes* en el momento de la consulta, sin licencia declarada ni idiomas especificados, y cuya model card no aporta resultados de benchmarks ni detalles sobre el dataset de entrenamiento. Su interés principal es metodológico (receta QLoRA reproducible sobre una base abliterada) más que de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen3.8-27B (clase `Qwen3_5ForConditionalGeneration`) |
| Parámetros totales | ~117M parámetros entrenables en el adaptador (~0,77 % de la base); parámetros totales de la base: no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Base entrenada en 4 bits NF4 con cómputo bf16; cuantizaciones de inferencia del conjunto: no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Adaptador PEFT (librería `peft`); formato de fichero concreto: no disponible |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer denso de la familia Qwen3.8 (27B), en su variante abliterada de huihui-ai, a la que se le han eliminado las direcciones de activación relacionadas con el rechazo. Sobre esa base congelada se aplica un adaptador LoRA de rango 16 y alpha 32, entrenado con QLoRA: la base se carga cuantizada en 4 bits NF4 y el cómputo se realiza en bf16. El entrenamiento es de tipo *continued pretraining*, no un ajuste supervisado ni un alineamiento con RLHF/DPO según la información disponible.

El adaptador no modifica los pesos del modelo base; se carga de forma independiente mediante `PeftModel.from_pretrained` y requiere una versión reciente de `transformers` compatible con la clase `Qwen3_5ForConditionalGeneration`. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, la duración del entrenamiento ni hiperparámetros más allá del rango, alpha y precisión. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto condicionada por el adaptador sobre la base Qwen3.8-27B abliterada.
- Herencia de las capacidades del modelo base (razonamiento, código, matemáticas, multilingüismo): no verificadas de forma independiente en esta ficha.
- Modo de razonamiento o *thinking*: no disponible en la información proporcionada.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Efecto declarado de la base abliterada: reducción de las respuestas de rechazo respecto al modelo original.

## Casos de uso

- Investigación sobre *abliteration* y alineamiento: el adaptador permite estudiar cómo un entrenamiento continuado QLoRA interactúa con una base a la que se han ablacionado direcciones de rechazo, comparando pares base/adaptador sobre los mismos ítems de evaluación.
- Reproducción de recetas QLoRA: sirve como referencia práctica de un adaptador de rango 16 con ~117M parámetros entrenables sobre una base de 27B cuantizada en 4 bits NF4, útil para validar pipelines de entrenamiento con PEFT.
- Experimentos de olvido catastrófico: la model card menciona un control matemático para medir olvido; el adaptador puede emplearse en estudios que comparen precisión en MCQ y perplejidad en conjuntos reservados antes y después del ajuste.
- Evaluación de seguridad y robustez: al partir de una base sin direcciones de rechazo, es un candidato para analizar la eficacia de las salvaguardas y el comportamiento del modelo ante peticiones sensibles en entornos controlados.
- Prototipado de investigación en generación de texto: para equipos que ya dispongan de la infraestructura para servir la base de 27B y quieran probar variantes de adaptador sin duplicar pesos completos.
- Estudio de adaptadores específicos de base: permite comprobar empíricamente el efecto de cargar el adaptador sobre la base correcta frente a la base original, tal como advierte el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación está pendiente y que los resultados se añadirán cuando finalicen el entrenamiento y la evaluación (precisión en MCQ y sondas de perplejidad en conjuntos reservados, con un control matemático para medir olvido).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende enteramente de la base Qwen3.8-27B y de la cuantización elegida.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; un modelo base de 27B requiere cuantización agresiva para caber en GPUs de consumo, pero no se aportan cifras verificadas.
- Opciones de despliegue: carga mediante `transformers` + `peft` (requiere versión reciente de `transformers` por la clase `Qwen3_5ForConditionalGeneration`). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lamarck-Qwen3.8-27B-abliterated | Adaptador LoRA sobre base abliterada | ~117M entrenables | no disponible | no disponible | Hugging Face (0 descargas) |
| Ronin48LLC/Lamarck-Qwen3.8-27B | Adaptador LoRA sobre base original | ~117M entrenables (misma receta) | no disponible | no disponible | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | Modelo base abliterado | 27B (según nombre) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Adaptador específico de base: debe cargarse sobre huihui-ai/Huihui-Qwen3.8-27B-abliterated, no sobre el Qwen3.8-27B original; cargarlo sobre otra base invalida su comportamiento esperado.
- Evaluación pendiente: el autor no ha publicado métricas; no hay evidencia de que el adaptador mejore ninguna capacidad concreta.
- Ausencia de licencia declarada: no se especifican condiciones de uso comercial ni restricciones; esto supone un riesgo legal para producción.
- Idiomas no especificados: no se documenta el soporte multilingüe real del adaptador ni de la base.
- Base abliterada: la eliminación de direcciones de rechazo puede aumentar la probabilidad de generar contenido inapropiado o dañino; requiere filtros y supervisión adicionales en cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; no se aportan medidas de mitigación.
- Sin garantía de idoneidad: el autor lo califica explícitamente como adaptador de investigación y recomienda verificar las salidas.
- Sesgos conocidos: no documentados en la información disponible.
- Contexto máximo: no disponible, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Ronin48LLC/Lamarck-Qwen3.8-27B-abliterated
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Adaptador complementario sobre base original: https://huggingface.co/Ronin48LLC/Lamarck-Qwen3.8-27B
- Librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
