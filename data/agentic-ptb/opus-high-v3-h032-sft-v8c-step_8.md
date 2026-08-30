# agentic-ptb/opus-high-v3.h032.sft-v8c.step_8

## Resumen

El checkpoint `agentic-ptb/opus-high-v3.h032.sft-v8c.step_8` es un artefacto intermedio generado durante el experimento **AgentPTB opus-high-v3**, un run de ajuste fino supervisado (SFT) ejecutado mediante Claude Code sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El propio autor lo etiqueta como `intermediate` y `negative-results`, indicando explícitamente que el run **no encontró mejora en los pesos entrenados** y que no debe inferirse calidad alguna a partir de su publicación. Se retiene únicamente por reproducibilidad y estudio cualitativo de fallos de entrenamiento.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el checkpoint se distribuye en formato `safetensors` con un tamaño de repositorio de 18,8 GB, consistente con pesos en precisión FP16. No se ha publicado ninguna métrica de rendimiento, ni especificaciones de contexto, idiomas o arquitectura más allá de su procedencia del modelo base. Dado su carácter de resultado negativo, no es apto para uso en producción ni para evaluación comparativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-9B-Base, sin especificaciones publicadas) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no se ha indicado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base `Qwen3.5-9B-Base` ni sobre la configuración específica del ajuste fino. Según la model card, el checkpoint proviene de un run de SFT identificado como `sft-v8c` dentro del experimento `opus-high-v3`, ejecutado en el entorno AgentPTB mediante Claude Code. El run alcanzó la hora `h032` y el checkpoint corresponde al paso `step_8` de dicho proceso.

El autor declara que el run **no produjo ninguna mejora en los pesos entrenados**; es decir, el ajuste fino no logró superar al modelo base en las métricas evaluadas internamente. Este resultado se documenta como un caso de estudio de resultados negativos, algo poco habitual en la publicación de modelos, pero valioso para la comunidad de investigación en metodologías de entrenamiento.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un artefacto intermedio con resultados negativos, no se puede afirmar que posea habilidades concretas de generación, razonamiento, código o cualquier otra tarea. Heredaría en principio las capacidades del modelo base `Qwen3.5-9B-Base`, pero no se han publicado evaluaciones al respecto.

La única función práctica del checkpoint es servir como punto de referencia para estudios de reproducibilidad, análisis de dinámicas de entrenamiento y comparación de checkpoints intermedios. No debe utilizarse como modelo de inferencia.

## Casos de uso

- **Investigacion en reproducibilidad de entrenamiento**: el checkpoint permite a otros equipos replicar el experimento `opus-high-v3` y verificar la ausencia de mejora en los pesos, contribuyendo a la transparencia en la publicacion de resultados negativos.
- **Analisis de fallos de SFT**: puede emplearse para estudiar por que un run de ajuste fino no converge o no mejora, examinando la evolucion de los pesos en el paso `step_8` frente al modelo base.
- **Comparacion de checkpoints intermedios**: junto con otros checkpoints del mismo run (si estan disponibles en el dataset `agentic-ptb/opus-high-v3-data`), permite trazar la trayectoria de los pesos y detectar posibles problemas de entrenamiento.
- **Validacion de pipelines de entrenamiento**: sirve como caso de prueba para depurar infraestructuras de SFT, ya que su comportamiento conocido (sin mejora) actua como control negativo.
- **Estudio de metadatos y gobernanza de modelos**: ejemplifica buenas practicas en la documentacion de artefactos fallidos, incluyendo advertencias claras sobre su no utilizacion en produccion.
- **No es adecuado para ningun caso de uso en produccion**: atencion al cliente, generacion de codigo, agentes o cualquier tarea practica quedan descartados por la falta de validacion y el resultado negativo declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor advierte en la model card que no se debe inferir calidad de la publicacion, dado que el run no encontro mejora en los pesos entrenados. Por tanto, no existen datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion que respalde el rendimiento de este checkpoint.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para este checkpoint. Dado que el repositorio ocupa 18,8 GB en safetensors, se puede estimar que los pesos estan en FP16 y requieren aproximadamente:

- **VRAM estimada para inferencia**: al menos 20 GB en FP16 (cargando los 9,4 mil millones de parametros). Con cuantizacion a 8 bits se reduciria a unos 10 GB, y a 4 bits a unos 5 GB, pero no se distribuyen cuantizaciones oficiales.
- **GPU recomendadas**: una RTX 4090 (24 GB) o una A100 (40/80 GB) podrian cargar el modelo en FP16, aunque no tiene sentido practico dado su caracter de checkpoint fallido.
- **Opciones de despliegue**: no se han probado con vLLM, llama.cpp, Ollama ni TGI. Al no existir versiones GGUF ni cuantizadas, el despliegue en consumer GPU seria complicado sin conversion previa.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. Este checkpoint no tiene un rendimiento medido ni una funcion comparable a modelos de proposito general como Qwen3.5-9B, Llama 3.1 8B o Mistral 7B. Su unica comparacion posible seria contra el modelo base `Qwen/Qwen3.5-9B-Base`, pero no se han publicado diferencias cuantitativas. Al ser un artefacto de investigacion con resultados negativos, no procede establecer comparativas con alternativas comerciales o de codigo abierto.

## Limitaciones y advertencias

- **Resultado negativo declarado**: el run de entrenamiento no produjo ninguna mejora en los pesos; el modelo no es util para ninguna tarea practica.
- **Artefacto intermedio**: no es un modelo final ni ha pasado por evaluacion exhaustiva; su unico proposito es la reproducibilidad.
- **Sesgos y alucinacion**: no se ha evaluado ningun tipo de sesgo, riesgo de alucinacion o comportamiento toxico. Al no estar validado, no se puede garantizar seguridad alguna.
- **Contexto e idiomas**: no se han publicado especificaciones de longitud de contexto ni de idiomas soportados; se desconoce su comportamiento multilingue.
- **Licencia**: aunque la licencia apache-2.0 permite uso comercial, no se recomienda su uso en ningun entorno de produccion dado el resultado negativo y la falta de evaluacion.
- **Advertencia del autor**: la model card indica explicitamente "do not infer quality from publication"; cualquier uso fuera de la investigacion seria inapropiado.

## Enlaces

- [Checkpoint en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h032.sft-v8c.step_8)
- [Dataset de datos del run](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Indice de datasets de agentic-ptb](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelo base Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
