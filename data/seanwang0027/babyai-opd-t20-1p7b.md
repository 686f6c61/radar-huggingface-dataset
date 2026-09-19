# SeanWang0027/babyai-opd-t20-1p7b

## Resumen

babyai-opd-t20-1p7b es un ajuste fino de Qwen/Qwen3-1.7B publicado por el usuario SeanWang0027 en Hugging Face. Es un artefacto de investigación: el modelo se ha entrenado con destilación on-policy (OPD) sobre el split de 810 tareas de BabyAI empleado en AgentGym-RL, y constituye el brazo multi-turno de una comparación de tres brazos documentada en el fichero `babyai/THREE_ARMS.md` del repositorio cl-from-nothing/online-rose (commit 01aaed5).

El problema que aborda es acotado: medir si la destilación desde un profesor de mayor tamaño (Qwen3-32B) mejora a un estudiante pequeño en una tarea de agente con instrucciones en lenguaje natural y episodios de hasta 20 turnos. El resultado es modesto: 43,1 % de éxito en el official_test de 90 tareas frente al 38,3 % del Qwen3-1.7B sin entrenar, una diferencia que la propia model card califica como no significativa al 95 %.

No es, por tanto, un modelo de propósito general ni un asistente conversacional, sino un checkpoint de investigación reproducible para estudiar RL y destilación sobre agentes en entornos tipo grid-world. Tiene 2.031.739.904 parámetros reales según los pesos safetensors, se distribuye bajo licencia apache-2.0 y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Qwen/Qwen3-1.7B; la model card no detalla capas, cabezas de atención ni dimensión oculta |
| Parámetros totales | 2.031.739.904 (~2,03 B), según los pesos safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3-1.7B; no se especifica en la información proporcionada) |
| Tipos de cuantización | No disponible. No se publican ficheros GGUF ni cuantizaciones; el tamaño del repositorio (4,1 GB) es compatible con pesos en bf16 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura. El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. No es un MoE y la model card no detalla el número de capas, cabezas de atención ni dimensión oculta, por lo que la configuración fina no está disponible. Tampoco se documenta ninguna innovación arquitectónica propia: el interés del checkpoint reside en el procedimiento de entrenamiento, no en la arquitectura.

Entrenamiento. Se aplica destilación on-policy (OPD) en variante multi-turno. El estudiante (Qwen3-1.7B) juega episodios completos de BabyAI de hasta 20 turnos y un profesor Qwen3-32B desplegado en clúster puntúa cada token generado por el estudiante; la pérdida es una KL inversa calculada sobre los tokens del estudiante. Los datos son el split de 810 tareas de BabyAI de AgentGym-RL, con batch de 32, learning rate de 1e-6 y 3 épocas, lo que equivale a 75 actualizaciones. El modo thinking se desactivó durante el entrenamiento. El checkpoint de origen es `global_step_75/actor.hf`. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineación posterior.

## Capacidades

- Ejecución de episodios multi-turno (hasta 20 turnos) en entornos BabyAI, con instrucciones en lenguaje natural y acciones discretas sobre el entorno.
- Seguimiento de instrucciones compuestas típicas de BabyAI (combinaciones de objetos, colores, direcciones y operaciones).
- Comportamiento de agente entrenado específicamente para una tarea de interacción con entorno, no para diálogo abierto.
- Soporte de tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: parcial y restringido al bucle de episodio BabyAI; no hay evidencia de razonamiento multi-paso general.
- Capacidades multilingües: no disponible; no se documentan idiomas.
- Modo thinking: desactivado explícitamente durante el entrenamiento.
- Capacidades especiales (visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Reproducción de experimentos de destilación on-policy: el checkpoint permite replicar el brazo OPD multi-turno del experimento de tres brazos descrito en `babyai/THREE_ARMS.md`, con el mismo split de 810 tareas, batch 32 y 3 épocas.
- Línea base entrenada frente al modelo sin ajustar: sirve para comparar directamente contra Qwen3-1.7B sin entrenar, cuyo 38,3 % de éxito en el official_test está documentado y permite medir el efecto neto del entrenamiento.
- Estudio de la brecha profesor-estudiante: útil para analizar qué se transmite al destilar desde un profesor de 32B a un estudiante de ~2B mediante KL inversa sobre los tokens del estudiante, y por qué la mejora no alcanza significación estadística.
- Análisis de robustez multi-turno: al estar entrenado con episodios de hasta 20 turnos, permite estudiar degradación de la política a medida que crece la longitud del episodio y detectar fallos acumulativos.
- Prototipado local de pipelines de agente en una sola GPU de consumo: con ~4,1 GB de pesos en bf16, se puede desplegar en una RTX 3060 de 12 GB o similar para depurar bucles de entorno, parseo de acciones ylogging sin depender de infraestructura de clúster.
- Generación de trayectorias para análisis cualitativo de fallos: las partidas completas generadas por el modelo permiten inspeccionar tipos de error concretos (acciones inválidas, pérdida del objetivo, repetición) y etiquetarlos manualmente.
- Ablación de hiperparámetros: al conocerse la receta exacta (lr 1e-6, batch 32, 3 épocas, 75 updates), el checkpoint sirve como punto de partida controlado para variar épocas, learning rate o número de muestras por tarea.
- Docencia y formación en RL y destilación: es un caso de estudio compacto, con licencia permisiva y resultados publicados, adecuado para prácticas sobre RLHF/RLAIF y destilación en entornos con recompensa verificable.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado | Notas |
|---|---|---|---|
| BabyAI official_test (90 tareas, 4 muestras por tarea) | babyai-opd-t20-1p7b | 43,1 % de éxito | Brazo OPD multi-turno; 75 actualizaciones, thinking desactivado |
| BabyAI official_test (90 tareas, 4 muestras por tarea) | Qwen/Qwen3-1.7B sin entrenar | 38,3 % de éxito | Línea base; la diferencia no es significativa al 95 % según la model card |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,1 GB solo para pesos en bf16 (tamaño real del repositorio); con caché KV y overhead del runtime hay que prever del orden de 5-7 GB para contextos moderados. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G. En A100 o H100 el modelo ocupa una fracción mínima de la memoria y el hardware está sobredimensionado.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM en bf16 o fp16; con cuantización a 4 bits (previa conversión) cabría en 6-8 GB.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por turno.
- Nota: el entrenamiento con profesor requirió un Qwen3-32B desplegado en clúster; solo la inferencia del estudiante es ligera.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BabyAI official_test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| babyai-opd-t20-1p7b | 2,03 B (safetensors) | No disponible | 43,1 % de éxito | apache-2.0 | Hugging Face; 0 descargas, 0 likes |
| Qwen/Qwen3-1.7B (sin entrenar) | ~2,03 B (nominal 1,7 B) | No disponible en la información proporcionada | 38,3 % de éxito | apache-2.0 | Hugging Face; modelo base público |
| Otros brazos del experimento de tres brazos | No disponible | No disponible | No disponible | No disponible | Referenciados en `babyai/THREE_ARMS.md`, sin datos en la información proporcionada |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (agentes entrenados sobre BabyAI) con métricas publicadas.

## Limitaciones y advertencias

- La mejora sobre el modelo base no es estadísticamente significativa al 95 % según la propia model card: 43,1 % frente a 38,3 % en el official_test de 90 tareas con 4 muestras por tarea. No debe presentarse como una ganancia consolidada.
- Dominio muy estrecho: el modelo está especializado en BabyAI, un entorno grid-world con instrucciones acotadas. No es un asistente general y su comportamiento fuera de ese entorno no está evaluado.
- Riesgo de olvido catastrófico: no se documenta ninguna evaluación de capacidades generales (conocimiento, código, matemáticas, multilingüismo) tras el ajuste, por lo que no puede descartarse degradación respecto al modelo base.
- Riesgo de alucinación: no evaluado. En tareas de agente el fallo relevante es la acción inválida o la pérdida del objetivo, no la fabricación de hechos, pero no hay métricas publicadas al respecto.
- Idiomas soportados: no disponible. Se desconoce si el multilingüismo del modelo base se conserva tras el entrenamiento.
- El modo thinking está desactivado, por lo que no cabe esperar cadenas de razonamiento explícitas del Qwen3 subyacente.
- El profesor utilizado (Qwen3-32B en clúster) no se publica como parte del artefacto, lo que dificulta la reproducción exacta del pipeline de destilación.
- El repositorio no incluye cuantizaciones ni ficheros GGUF, lo que obliga a convertir los pesos para usarlos con llama.cpp u Ollama.
- Licencia apache-2.0: permite uso comercial, pero se hereda del modelo base Qwen3-1.7B; conviene revisar los términos aplicables de ese modelo antes de un despliegue en producción.
- Señales de validación externa nulas: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas conocidas.
- El resultado de 43,1 % implica que el modelo falla aproximadamente 6 de cada 10 episodios en el conjunto de evaluación; no es apto para tareas donde se requiera alta fiabilidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/SeanWang0027/babyai-opd-t20-1p7b
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio referenciado en la model card: cl-from-nothing/online-rose, commit 01aaed5, fichero `babyai/THREE_ARMS.md` (ruta mencionada en la model card; no se proporciona URL completa en la información disponible)
- Dataset de referencia: split de 810 tareas de BabyAI de AgentGym-RL (mencionado en la model card; sin URL proporcionada)
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los resultados obtenidos correspondían a consultas no relacionadas sobre errores de compilación de Python y sobre MATLAB.
