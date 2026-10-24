# Ray2333/Qwen3.5-4B-game-sft-lora-r64-step2000

## Resumen

Este repositorio contiene un adaptador LoRA de PEFT entrenado sobre el modelo multimodal `Qwen/Qwen3.5-4B`, publicado por el usuario Ray2333. No es un modelo completo, sino un checkpoint de adaptador guardado en el paso 2000 del optimizador durante un ajuste supervisado (SFT) sobre el formato de trayectorias multimodales comprimido `game-plus/trajectories-sft`. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base procesa capturas de pantalla junto con texto y genera texto.

El adaptador tiene rango 64, alpha 128, dropout 0,05 y se aplica a todas las capas lineales del modelo base. Se entrenó en bfloat16 con un lote global efectivo de 128 (micro-lote 1 en 8 GPU, acumulación de gradiente 16), longitud máxima de secuencia de 32.768 tokens y hasta cuatro capturas de pantalla por muestra (tres previas más la actual). Estos hiperparámetros son propios de un ajuste orientado a agentes que operan interfaces gráficas: el modelo aprende a predecir la siguiente acción a partir del historial visual y textual.

La relevancia del checkpoint es acotada y muy específica: es un artefacto intermedio de investigación publicado sin model card extendida, sin métricas, sin licencia declarada y sin descargas ni valoraciones en el momento de la consulta. Resulta útil para quien quiera reproducir o continuar un entrenamiento de agentes sobre juegos, no como modelo listo para producción. El repositorio ocupa 0,3 GB y contiene únicamente el adaptador de inferencia y su configuración; no incluye estados de optimizador, RNG, scheduler ni trainer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal del modelo base Qwen/Qwen3.5-4B; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | Adaptador LoRA: no disponible (repo de 0,3 GB); modelo base: ~4B segun la nomenclatura de Qwen/Qwen3.5-4B, no verificado en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens como longitud maxima de secuencia durante el entrenamiento (estrategia de descarte en caso de exceso); ventana nativa del modelo base: no disponible |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en safetensors, precision de entrenamiento bfloat16); las cuantizaciones aplicables dependen del modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con configuracion PEFT/LoRA (library_name: peft); no se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de tipo all-linear: se inyectan matrices de bajo rango en todas las capas lineales del transformer subyacente, con rango 64, alpha 128 y dropout 0,05. El escalado alpha/rango es de 2,0, un valor habitual para SFT con rangos medios-altos. El modelo base, Qwen/Qwen3.5-4B, es multimodal (pipeline `image-text-to-text`), por lo que el adaptador ajusta conjuntamente el flujo de texto y el de imagen en las capas donde se aplican las matrices LoRA. La información disponible no detalla la arquitectura interna del modelo base (número de capas, mecanismo de atención, codificador visual).

El entrenamiento es un SFT sobre el dataset `game-plus/trajectories-sft`, en un formato de trayectorias de juego comprimido con hasta cuatro capturas de pantalla por muestra (tres anteriores más la actual), lo que sugiere un modelado de historial visual de corto plazo para predecir acciones. La configuración incluye lote global efectivo de 128, precisión bfloat16, scheduler coseno con 5 % de warmup, learning rate máximo de 1e-4, ZeRO etapa 1 y gradient checkpointing. No se indica en la información proporcionada si hubo fases posteriores de RLHF, DPO u optimización por preferencias, ni el volumen total de tokens de entrenamiento. El checkpoint corresponde al paso 2000 del optimizador, no necesariamente al final del entrenamiento.

## Capacidades

- Generación de texto condicionada por imagen: el pipeline declarado es `image-text-to-text`, con soporte de hasta cuatro capturas por muestra durante el entrenamiento.
- Razonamiento sobre trayectorias de juego: modelado de secuencias de estados visuales y acciones previas para predecir la siguiente acción.
- Comprensión de interfaces gráficas: al entrenarse con capturas de pantalla, el adaptador está orientado a interpretar elementos visuales de una UI de juego.
- Capacidades heredadas del modelo base (razonamiento, código, matemáticas, multilingüismo): no disponibles en la información proporcionada para este adaptador concreto; el SFT pudo degradarlas parcialmente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente implícito por el formato de trayectorias, pero sin datos que cuantifiquen la calidad del bucle agéntico.
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles en la información proporcionada.

## Casos de uso

- Agentes que juegan sobre interfaz gráfica: el adaptador se entrenó explícitamente con pares de capturas y acciones, por lo que puede integrarse en un bucle percepción-decisión que recibe la pantalla actual más tres capturas previas y emite la siguiente acción.
- Investigación en imitación de trayectorias: sirve como punto de partida para reproducir el SFT, comparar hiperparámetros (rango, alpha, número de capturas) o continuar el entrenamiento desde el paso 2000.
- Automatización de pruebas de videojuegos: un agente que reproduce secuencias de acciones aprendidas de trayectorias humanas puede usarse para smoke tests de build, detección de bloqueos o regresión de UI.
- Evaluación de modelos multimodales en tareas de decisión secuencial: el checkpoint permite medir hasta qué punto un VLM de ~4B puede operar con historial visual corto frente a políticas especializadas.
- Generación de datos sintéticos de trayectorias: las predicciones del adaptador pueden filtrarse y usarse como datos adicionales para entrenar políticas o para anotar clips de gameplay.
- Prototipado de asistentes que leen pantalla: con las cautelas de licencia, el adaptador puede probarse en tareas de descripción de estado de una aplicación a partir de capturas, aunque su ajuste está sesgado hacia dominios de juego.
- Base para experimentos de personalización por juego: al ser un LoRA de bajo coste de almacenamiento (0,3 GB), es viable mantener variantes por título o por género y cargarlas dinámicamente sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa 0,3 GB, pero debe cargarse junto al modelo base. Estimación derivada del tamaño (~4B parámetros, más codificador visual), no medida: en bfloat16 aproximadamente 9-11 GB; en int8 aproximadamente 5-7 GB; en int4 aproximadamente 3,5-5 GB. Son cifras orientativas que no provienen de la información proporcionada.
- GPU recomendadas: para bfloat16 sin cuantizar, A100 40 GB, H100 o L40S con margen amplio; una RTX 4090 (24 GB) es suficiente para bfloat16 con secuencias moderadas.
- GPU de consumo: sí cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización int4, potencialmente en GPU de 8-12 GB, siempre que el soporte de cuantización del modelo base lo permita.
- Longitud de secuencia: el entrenamiento usó 32.768 tokens; con cuatro imágenes por muestra el coste de atención y de tokens visuales crece de forma notable, así que conviene reservar VRAM adicional o reducir el número de capturas en inferencia.
- Opciones de despliegue: carga directa con transformers + peft (`PeftModel.from_pretrained`); fusión del adaptador (`merge_and_unload`) para servir con vLLM o TGI; conversión a GGUF para llama.cpp u Ollama solo si el modelo base multimodal dispone de dicha ruta de conversión, extremo no confirmado en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3.5-4B-game-sft-lora-r64-step2000) | Adaptador sobre base ~4B (nomenclatura) | 32.768 tokens de longitud de entrenamiento | LoRA SFT sobre trayectorias de juego multimodales | no disponible | Repo público, 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B (modelo base sin adaptar) | ~4B segun nomenclatura | no disponible en la informacion proporcionada | VLM generalista | no disponible en la informacion proporcionada | Modelo base público en HuggingFace |
| Qwen2.5-VL-3B-Instruct | 3,75B | no disponible en la informacion proporcionada | VLM generalista instruido | Apache 2.0 | Ampliamente desplegado y documentado |
| Otros LoRA de comunidad para agentes de juego | no disponible | no disponible | Adaptadores específicos de dominio | variable, a menudo sin declarar | Repos de HuggingFace con pocas descargas |

La comparación relevante no es de rendimiento —no hay métricas— sino de encaje: frente a un VLM generalista como Qwen2.5-VL-3B-Instruct, este adaptador gana en especialización al formato de trayectorias y pierde en trazabilidad (sin licencia, sin idiomas declarados, sin evaluación) y en versatilidad fuera del dominio de juego.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, curvas de pérdida ni comparación con el modelo base, por lo que se desconoce si el SFT mejora o degrada las capacidades generales.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; además, los términos del modelo base Qwen3.5-4B condicionan cualquier uso derivado y no se detallan aquí.
- Checkpoint intermedio: corresponde al paso 2000 del optimizador y no necesariamente a un modelo convergido o al mejor punto de validación.
- Sesgo de dominio: entrenado con trayectorias de juego, es esperable un rendimiento pobre fuera de ese dominio y una alta sensibilidad al estilo visual de las capturas de entrenamiento.
- Riesgo de alucinación: como todo VLM que predice acciones a partir de píxeles, puede inventar elementos de la interfaz o repetir acciones inválidas; no hay datos sobre tasas de error en bucle cerrado.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del modelo base o lo ha desplazado hacia el idioma predominante del dataset de trayectorias.
- Dependencia del dataset: el formato `game-plus/trajectories-sft` se cita como "comprimido"; no se documenta el preprocesado, el número de muestras ni la política de descarte de secuencias largas más allá de la estrategia "delete".
- Coste multimodal: cuatro imágenes por muestra incrementan mucho el número de tokens de entrada; sin control de resolución, la ventana efectiva de 32.768 tokens puede consumirse antes de lo previsto.
- Reproducibilidad limitada: al no incluir estados de optimizador, RNG ni scheduler, no es posible reanudar el entrenamiento exactamente desde este punto.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentación adicional; trátese como material experimental.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Ray2333/Qwen3.5-4B-game-sft-lora-r64-step2000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset citado en la model card (`game-plus/trajectories-sft`): https://huggingface.co/datasets/game-plus/trajectories-sft (referencia no verificada)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
