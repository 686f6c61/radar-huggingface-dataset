# LucasBRT/smart-commit-0.5b-v0.3

## Resumen

pionus-0.5b-v0.3 es un modelo de lenguaje especializado en la generación automática de mensajes de commit de Git, desarrollado por LucasBRT como parte del proyecto pionus, una herramienta de línea de comandos que redacta mensajes de commit imitando el estilo del repositorio mediante un modelo pequeño ejecutado en local. El modelo parte de Qwen2.5-Coder-0.5B-Instruct y se ha afinado en dos etapas: un ajuste supervisado (SFT) seguido de un paso de optimización por preferencias directas (DPO) sobre muestras generadas por el propio modelo.

La versión 0.3 es experimental y se centra en corregir defectos concretos detectados en la versión 0.1: copiar asuntos recientes, mencionar detalles que no aparecen en el diff, emitir respuestas vacías, usar ámbitos (scopes) que el repositorio nunca ha empleado o tipos de commit distintos al real. El entrenamiento DPO marca con comprobaciones automáticas las respuestas que superan todos los filtros y entrena al modelo para preferirlas.

Con 494 millones de parámetros y un único archivo cuantizado Q4_K_M de 398 MB, el modelo está pensado para ejecutarse en CPU o GPU Vulkan vía llama.cpp, sin necesidad de infraestructura dedicada. Su relevancia radica en demostrar que un modelo de menos de 0,5B puede sustituir a un modelo generalista en una tarea estrecha y bien delimitada, reduciendo drásticamente las respuestas no fundamentadas y los fallos de formato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), afinado con LoRA SFT + DPO |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); pesos mergeados en bf16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del checkpoint base Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros. Sobre esa base se aplicó primero un adaptador LoRA de ajuste supervisado (el mismo que empleó la versión 0.1) y después un segundo adaptador LoRA entrenado con DPO. Ambos adaptadores, junto con el registro de la ejecución (`run.json`) y el log del entrenamiento, se distribuyen en el directorio `training/` del repositorio.

La etapa DPO utiliza 5.500 commits del split de entrenamiento de CommitChronicle (revisión `5fd076e`), ninguno de ellos visto por la versión 0.1 ni perteneciente a los repositorios de evaluación. De ellos, 4.500 proceden de 680 repositorios que siguen Conventional Commits (máximo 8 por repositorio) y 1.000 de repositorios jóvenes. Para cada commit el modelo genera seis respuestas con temperatura 0,7 y semillas fijas, y un conjunto de comprobaciones marca como no preferidas las que copian un asunto reciente, nombran un detalle ausente del diff, no dicen nada, usan un scope inexistente en el repositorio o un tipo distinto al del commit real. El entrenamiento se realiza con el prompt exacto de pionus y el conjunto completo de reglas (`--rules full`).

## Capacidades

- Generación de mensajes de commit de Git en formato Conventional Commits y en estilo libre, condicionada al diff, las rutas de archivo y el historial de asuntos del repositorio.
- Adaptación al estilo del repositorio: reutiliza tipos y scopes ya presentes en el historial y evita inventar ámbitos nuevos.
- Fundamentación estricta en el diff: el paso DPO reduce a 0,082 la proporción de palabras de la respuesta que no aparecen en el historial, las rutas ni el diff (frente a 0,151 en v0.1).
- Generación en una sola pasada con decodificación greedy, pensada para baja latencia en local.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- **Automatización de commits en el flujo de trabajo diario**: el modelo se integra en la CLI pionus y genera el mensaje a partir del diff preparado, con una tasa de primer intento válido del 99,6 % en commits de estilo Conventional, lo que elimina prácticamente la intervención manual.
- **Estandarización de Conventional Commits en equipos**: al reutilizar únicamente tipos y scopes ya usados en el repositorio (scope_known de 0,840), ayuda a mantener la coherencia del historial sin necesidad de revisar cada mensaje.
- **Repositorios jóvenes o con poco historial**: en repositorios con entre 1 y 5 asuntos previos mantiene una tasa de fallback del 2,1 % en commits Conventional y del 0 % en estilo libre, lo que lo hace útil en proyectos recién creados donde otros modelos carecen de contexto de estilo.
- **Entornos sin GPU dedicada**: con un GGUF Q4_K_M de 398 MB y ejecución sobre CPU o GPU Vulkan mediante llama.cpp, puede desplegarse en máquinas de desarrollo modestas o en contenedores de CI sin acelerador.
- **Integración en pipelines de CI/CD**: al ser determinista con decodificación greedy y consumir pocos recursos, puede invocarse como paso previo al push para normalizar mensajes generados por herramientas automáticas o por desarrolladores.
- **Generación de mensajes en repositorios que no siguen Conventional Commits**: con una tasa de primer intento del 99,6 % en estilo libre, cubre proyectos con convenciones propias o sin convención formal.
- **Sustitución de modelos generalistas en tareas de commit**: como control, el modelo base re-cuantizado cae al fallback en el 63-65 % de los casos, frente al 0,4 % de pionus-0.5b-v0.3, lo que justifica su uso específico frente a un modelo generalista del mismo tamaño.

## Benchmarks y rendimiento

Evaluación eval-v1: 500 commits del split de test de CommitChronicle (250 Conventional y 250 libres); eval-short: 197 commits de repositorios jóvenes. Decodificación greedy sobre Vulkan con pionus 0.9.0. Columnas sin sufijo: los 250 commits Conventional de eval-v1.

Con la lista de archivos anotada por defecto de pionus:

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct re-cuantizado (control) | 0,352 | 0,200 | 0,876 | 0,336 | 0,632 | 0,296 | 0,159 | 0,692 | 0,102 | 0,468 | 0,894 | 0,340 |
| pionus-0.5b-v0.1 | 0,648 | 0,546 | 0,852 | 0,960 | 0,028 | 0,116 | 0,342 | 0,928 | 0,234 | 0,638 | 0,085 | 0,080 |
| **pionus-0.5b-v0.3** | 0,668 | 0,552 | 0,840 | 0,996 | 0,004 | 0,008 | 0,354 | 0,996 | 0,250 | 0,596 | 0,021 | 0,000 |

Con la lista de archivos simple (la usada en entrenamiento):

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct re-cuantizado (control) | 0,344 | 0,201 | 0,884 | 0,312 | 0,648 | 0,308 | 0,161 | 0,696 | 0,101 | 0,426 | 0,872 | 0,333 |
| pionus-0.5b-v0.1 | 0,628 | 0,531 | 0,844 | 0,960 | 0,028 | 0,104 | 0,333 | 0,916 | 0,230 | 0,617 | 0,085 | 0,100 |
| **pionus-0.5b-v0.3** | 0,664 | 0,557 | 0,840 | 0,996 | 0,004 | 0,008 | 0,347 | 0,996 | 0,247 | 0,617 | 0,021 | 0,000 |

Comparación pareada frente a v0.1 en los 250 commits Conventional de eval-v1 con lista anotada: `ungrounded` +1/−28 (p = 0,0), `first_copied` +0/−9 (p = 0,004), `first_try` +9/−0 (p = 0,004), `fallback` +0/−6 (p = 0,031); `type_match` +11/−6 (p = 0,332) y `scope_known` +2/−5 (p = 0,453), ambos no significativos. Proporción de palabras no presentes en historial, rutas ni diff: 0,082 en v0.3, 0,151 en v0.1 y 0,327 en los commits reales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con cuantización Q4_K_M (archivo de 398 MB más overhead de contexto); aproximadamente 1 GB en bf16 con safetensors.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPU con soporte Vulkan (por ejemplo, iGPU Intel/AMD o GPUs discretas con driver Vulkan).
- Cabe en cualquier GPU consumer; también en Raspberry Pi y contenedores sin acelerador.
- Opciones de despliegue: llama.cpp (vía pionus con `PIONUS_GGUF`), GGUF compatible con Ollama y otros frontends de llama.cpp. La exportación a OpenVINO no está validada para este modelo.
- Latencia y throughput: no se han publicado cifras absolutas; la evaluación se realizó con decodificación greedy sobre Vulkan y el modelo se describe como apto para ejecución local de baja latencia en la CLI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pionus-0.5b-v0.3 | 494 M | no disponible | Commit messages (SFT + DPO) | Apache 2.0 | HF (safetensors + GGUF) |
| pionus-0.5b-v0.1 | 494 M | no disponible | Commit messages (SFT) | Apache 2.0 | HF |
| Qwen2.5-Coder-0.5B-Instruct | 494 M | no disponible | Modelo generalista de código | Apache 2.0 | HF |

Frente a v0.1, la versión 0.3 reduce `ungrounded` de 0,116 a 0,008 y `fallback` de 0,028 a 0,004, con mejoras significativas en `first_try`, `first_copied` y `fallback`. Frente al modelo base re-cuantizado, la diferencia es sustancial: el control cae al fallback en más del 63 % de los casos y presenta un `ungrounded` de 0,296-0,308.

## Limitaciones y advertencias

- Modelo experimental: el autor indica que la receta de entrenamiento sigue cambiando y que la línea 0.2 difiere de la 0.1 y la 0.3 (la 0.2 se entrenó sin las reglas en el prompt).
- El tipo de commit no mejora de forma significativa: `type_match` pasa de 0,648 a 0,668 con lista anotada, con p = 0,332 en la comparación pareada; el paso DPO apenas incide en esta métrica.
- El modelo describe lo que el diff dice, no lo que el cambio significa: prioriza la fundamentación literal sobre la interpretación semántica, lo que puede producir mensajes correctos pero poco expresivos.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Riesgo de alucinación reducido pero no nulo: la proporción de palabras no fundamentadas es de 0,082, no cero.
- Dependencia del prompt de pionus: el entrenamiento usa el prompt exacto de la herramienta con `--rules full`; otros formatos de prompt pueden degradar el rendimiento.
- La exportación a OpenVINO no está validada para este modelo.
- No se han publicado datos sobre sesgos demográficos o de otro tipo, ni sobre comportamiento fuera de la tarea de generación de commits.
- Uso comercial permitido por la licencia Apache 2.0, sin restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LucasBRT/pionus-0.5b-v0.3
- Versión anterior: https://huggingface.co/LucasBRT/pionus-0.5b-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Repositorio de pionus: https://github.com/Lucas-BRT/pionus
- Documentación de evaluación: https://github.com/Lucas-BRT/pionus/blob/main/training/README.md
- Dataset CommitChronicle: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
