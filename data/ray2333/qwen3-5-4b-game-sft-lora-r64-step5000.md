# Ray2333/Qwen3.5-4B-game-sft-lora-r64-step5000

## Resumen

`Ray2333/Qwen3.5-4B-game-sft-lora-r64-step5000` es un adaptador LoRA de PEFT para el modelo multimodal `Qwen/Qwen3.5-4B`, entrenado con formato de trayectorias multimodales comprimidas del dataset `game-plus/trajectories-sft`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador y su configuración, con un tamaño de 0,3 GB, pensados para inferencia junto al modelo base. Lo publica el usuario Ray2333 y el checkpoint corresponde al paso de optimizador 5000.

El interés práctico es acotado pero específico: se trata de un ajuste supervisado orientado a agentes que operan sobre videojuegos, con entradas que combinan texto e imágenes (hasta cuatro capturas de pantalla por muestra: tres previas y la actual). Eso lo sitúa en la categoría de adaptadores para agentes visuales y GUI, no en la de modelos de propósito general.

La información pública es escasa: no hay resultados de benchmarks, no se declara licencia, no se listan idiomas y la model card no incluye métricas de evaluación. Cualquier uso en producción debería ir precedido de una evaluación propia sobre el dominio objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3.5-4B; arquitectura interna del base no disponible |
| Parámetros totales | 4B en el modelo base; parámetros del adaptador: no disponible (repo de 0,3 GB) |
| Parámetros activos | No aplica (no es un modelo MoE); no disponible |
| Longitud de contexto | 32.768 tokens de longitud máxima de secuencia durante el entrenamiento; contexto nativo del modelo base: no disponible |
| Tipos de cuantización | No especificados para el adaptador; el entrenamiento se realizó en bfloat16. Cuantizaciones del modelo base: no disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargarse junto al modelo base o fusionarse con él |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-4B`, un modelo de la familia Qwen3.5 descrita públicamente como multimodal de fusión temprana (visión-lenguaje) y con pipeline `image-text-to-text`. El ajuste es un LoRA `all-linear` con rango 64, alpha 128 y dropout 0,05, es decir, se inyectan matrices de bajo rango en todas las capas lineales del transformer, incluidas presumiblemente las del codificador visual y las proyecciones multimodales, aunque la model card no detalla el desglose por módulo.

La configuración de entrenamiento documentada es: batch global efectivo de 128 (8 GPU con micro-batch 1 y acumulación de gradiente 16), longitud máxima de 32.768 tokens con estrategia de descarte de muestras demasiado largas (*overlength: delete*), scheduler coseno con 5 % de warmup, learning rate máximo 1e-4, precisión bfloat16, ZeRO etapa 1 y gradient checkpointing. Cada muestra incluye como máximo cuatro capturas de pantalla. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas posteriores de preferencia (RLHF/DPO); el repositorio excluye explícitamente estados de optimizador, RNG, scheduler y trainer, por lo que solo sirve para inferencia o para reanudar un entrenamiento desde cero del adaptador.

## Capacidades

- Generación de texto y razonamiento multimodal sobre entradas de imagen y texto, heredados del modelo base Qwen3.5-4B.
- Interpretación de capturas de pantalla de videojuegos y razonamiento sobre el estado del juego a partir de hasta cuatro imágenes por muestra (tres previas más la actual).
- Modelado de trayectorias de agente: el ajuste se realizó sobre un dataset de trayectorias SFT, por lo que el adaptador está orientado a predecir la siguiente acción dentro de una secuencia.
- Comprensión de contexto temporal corto: la ventana de imágenes previas permite cierta noción de evolución de la pantalla entre pasos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base, no confirmado para este adaptador).
- Capacidades de agente multi-paso: no evaluadas ni documentadas; el formato de entrenamiento es de trayectorias, pero no hay métricas de éxito.
- Capacidades multilingües: no disponibles.
- Modo *thinking* explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Agentes de juego automatizados: el adaptador puede integrarse en un bucle percepción-acción donde cada paso recibe la captura actual y las tres anteriores, y genera la siguiente acción del agente; es exactamente el formato con el que fue entrenado.
- Investigación en imitación de trayectorias: sirve como punto de partida para estudiar cómo un modelo de 4B replica decisiones humanas registradas en un dataset de gameplay, con la ventaja de que el adaptador es ligero (0,3 GB) y fácil de versionar.
- Prototipado de agentes GUI: aunque el entrenamiento sea sobre videojuegos, la mecánica de leer una pantalla y decidir una acción es transferible a tareas de automatización de interfaces, previa evaluación en ese dominio.
- Generación de datos sintéticos de trayectorias: el modelo puede producir secuencias de acciones plausibles para aumentar un dataset de entrenamiento, filtrando después por reglas del entorno.
- Evaluación comparativa de checkpoints: al existir un `step4000` del mismo autor, permite estudiar la evolución del ajuste entre pasos y el efecto del sobreajuste en tareas de juego.
- Docencia y reproducción de experimentos: la configuración completa (rango, alpha, batch, scheduler, ZeRO) está documentada, lo que facilita replicar el pipeline con transformers + PEFT en un clúster pequeño.
- Base para ajuste posterior: al ser un adaptador LoRA, se puede continuar el entrenamiento o combinarlo con otros adaptadores del mismo modelo base sin reentrenar los 4B completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (ni MMLU, ni HumanEval, ni GSM8K, ni tasas de éxito en tareas de juego), y el repositorio no contiene scripts de evaluación ni informes.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,3 GB en disco; el coste real lo determina el modelo base de 4B. Como estimación orientativa, en bfloat16 los pesos del base rondan los 8 GB, y con caché KV para contextos largos (hasta 32.768 tokens) y procesamiento de hasta cuatro imágenes por muestra conviene reservar 24 GB o más.
- En cuantización de 4 bits, los pesos del base bajarían aproximadamente a 2-3 GB, lo que permitiría caber en GPU de consumo de 8-12 GB (por ejemplo, RTX 3060 12 GB o RTX 4070), a costa de pérdida de calidad no medida para este adaptador.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y para inferencia con lotes grandes y contexto máximo; RTX 4090 (24 GB) para inferencia en bfloat16 con contexto moderado; GPU de 12 GB solo con cuantización.
- Cabe en GPU de consumo: sí, especialmente con cuantización del modelo base; el adaptador no añade una carga significativa.
- Opciones de despliegue: transformers + PEFT (ruta natural, ya que el repo es `library_name: peft`); vLLM con soporte de adaptadores LoRA; TGI; llama.cpp u Ollama requieren fusionar el adaptador con el base y convertir a GGUF. La disponibilidad efectiva de estas rutas para Qwen3.5-4B no está confirmada en la información proporcionada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por paso de agente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este adaptador (game-sft step5000) | 4B (base) + LoRA r=64 | 32.768 tokens en entrenamiento | No disponible | Entrenado sobre `game-plus/trajectories-sft`, multimodal, sin benchmarks publicados |
| `Ray2333/Qwen3.5-4B-game-sft-lora-r64-step4000` | 4B (base) + LoRA r=64 | Igual configuración | No disponible | Checkpoint anterior del mismo entrenamiento; permite comparar evolución entre pasos |
| `Qwen/Qwen3.5-4B` (modelo base) | 4B | No disponible | No disponible | Modelo multimodal completo; el adaptador modifica su comportamiento hacia trayectorias de juego |
| LoRA r=128 sobre Qwen3.5-4B con dataset Step-3.5-Flash-SFT (repo `IIIIQIIII/qwen35-4b-lora-sft`) | 4B (base) + LoRA r=128 | No disponible | No disponible | Enfoque distinto: dataset de agente/razonamiento, entrenado con Axolotl en una H100 80 GB |

No se dispone de comparaciones de rendimiento numéricas entre estas opciones: ninguno de los repositorios consultados publica métricas de evaluación.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador de inferencia: no hay estados de optimizador, RNG ni scheduler, por lo que no se puede reanudar el entrenamiento tal cual.
- Ausencia total de benchmarks y de evaluación cualitativa: no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea.
- Dominio muy estrecho: el entrenamiento se centra en trayectorias de videojuegos; el rendimiento fuera de ese dominio es desconocido y probablemente inferior.
- Límite de cuatro capturas por muestra y descarte de secuencias que exceden los 32.768 tokens: en partidas largas o con historiales de imagen amplios, parte de la información puede quedar fuera.
- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible verificar la licencia del modelo base Qwen3.5-4B y del dataset `game-plus/trajectories-sft` antes de cualquier despliegue.
- Idiomas no especificados: se desconoce si el adaptador conserva el multilingüismo del base o lo ha degradado hacia el idioma dominante del dataset.
- Riesgo de alucinación y de acciones inválidas: al ser un modelo generativo aplicado a entornos con reglas estrictas, puede emitir acciones no válidas o justificaciones incoherentes; se recomienda un validador de acciones externo.
- Sesgos: no documentados por el autor; al derivarse de trayectorias humanas de juego, puede heredar sesgos de estilo de juego y de la población que generó los datos.
- Sin garantías de producción: no hay información sobre robustez ante cambios de resolución, recortes de pantalla o variaciones de interfaz.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Ray2333/Qwen3.5-4B-game-sft-lora-r64-step5000
- Checkpoint anterior (step 4000): https://huggingface.co/Ray2333/Qwen3.5-4B-game-sft-lora-r64-step4000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de fine-tuning de Qwen3.5-4B con LoRA r=128 (Axolotl): https://github.com/IIIIQIIII/qwen35-4b-lora-sft
- Tutorial de LoRA sobre Qwen3.5-4B con transformers + PEFT y SwanLab: https://datawhalechina.github.io/hello-rocm/02-fine-tune/qwen3.5/qwen3.5-4b-lora-swanlab
- Página del modelo en Ollama: https://ollama.com/library/qwen3.5:4b
- Repositorio de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
