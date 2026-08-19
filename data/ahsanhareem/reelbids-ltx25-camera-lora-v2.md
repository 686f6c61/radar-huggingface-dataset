# AhsanHareem/reelbids-ltx25-camera-lora-v2

## Resumen

ReelBids es un adaptador LoRA de control de cámara para el modelo de generación de vídeo LTX-2.5 (22B) de Lightricks, desarrollado por AhsanHareem. El adaptador permite aplicar un movimiento de cámara *dolly-in* (avance hacia el sujeto) en generaciones de imagen a vídeo, con siete velocidades seleccionables mediante un token de activación en el prompt. A diferencia de los LoRA de cámara oficiales de LTX-2 (19B), que son de velocidad única y específicos de esa versión, ReelBids cubre todo el rango de velocidades en un solo adaptador, diseñado específicamente para la arquitectura de 22B de LTX-2.5.

El adaptador se entrena sobre el transformer de difusión de LTX-2.5 en modo imagen-a-vídeo, con condicionamiento de primer fotograma al 100% de los casos. Utiliza un rango de 32 y alpha 32, y se aplica únicamente a las capas de atención de vídeo (`attn1.*`, `attn2.*`). El checkpoint óptimo se encuentra en el paso 1250 de un total de 2000, y presenta un error medio absoluto de zoom del 3,4% frente a la verdad de campo en las velocidades sp05, sp20 y sp50.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusión de LTX-2.5 |
| Parametros totales | LoRA rank-32 (número exacto de parámetros no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de la base LTX-2.5, típicamente 97 fotogramas) |
| Tipos de cuantizacion | No disponible (el adaptador se usa en BF16 con la base) |
| Idiomas soportados | No disponible (el prompt se procesa con el texto de LTX-2.5, que usa Gemma-4-12B) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (repo de 1.3 GB, claves en layout de ComfyUI con prefijo `diffusion_model.`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 que se aplica exclusivamente a las proyecciones de atención del transformer de difusión de LTX-2.5 (capas `attn1.*` y `attn2.*`). Se entrenó sobre 544 clips de vídeo, con 2000 pasos en una GPU H100, usando el transformer base `ltx-2.5-22b-dev-transformer-bf16` y el text encoder `gemma4-12b-with-proj-ltx-2.5-bf16`. La resolución nativa de entrenamiento fue 1024×576 a 24 fps, con 97 fotogramas por clip. El condicionamiento de primer fotograma se aplicó con probabilidad 1.0, lo que obliga a que la generación siempre parta de una imagen fija.

La velocidad del movimiento se selecciona mediante un token de activación en el prompt, por ejemplo `rbdollyin sp20`. El token `sp05` produce un zoom de 1.108× sobre 97 fotogramas, `sp20` un zoom de 1.591× y `sp50` un zoom de 2.285×. El mejor checkpoint (paso 1250) alcanzó un error medio absoluto de zoom del 3,4% contra la verdad de campo en las velocidades sp05, sp20 y sp50.

## Capacidades

- Control de movimiento de cámara *dolly-in* con siete velocidades discretas (sp05, sp10, sp15, sp20, sp30, sp40, sp50).
- Compatible con generación de imagen a vídeo (image-to-video) usando el primer fotograma como condición.
- Integración directa con ComfyUI mediante un cargador de LoRA estándar, sin conversión de pesos.
- Funciona sobre la base LTX-2.5 de 22B, con resolución nativa 1024×576 a 24 fps y 97 fotogramas.
- A diferencia de los LoRA oficiales de LTX-2, un solo adaptador cubre todo el rango de velocidades, simplificando el flujo de trabajo.
- Requiere que el prompt se inicie con el token trigger `rsp` seguido de la velocidad, por ejemplo `rsp sp20, The camera pushes steadily into the room`.

## Casos de uso

- **Producción audiovisual**: generar planos de aproximación lenta a un sujeto o escena en vídeos publicitarios, sin necesidad de cámara física. El usuario puede seleccionar la velocidad con tokens (`sp05` a `sp50`) para ajustar la intensidad del movimiento.
- **Creación de contenido para redes sociales**: producir clips verticales u horizontales con efecto *dolly-in* para reels o TikTok, usando una imagen estática como punto de partida y el LoRA para animar la cámara.
- **Prototipado de escenas**: en previsualización, los directores pueden generar variantes de movimiento de cámara sobre un mismo fotograma inicial para decidir la toma final.
- **Generación de vídeo con IA para agencias**: integrar el LoRA en pipelines de ComfyUI para automatizar la creación de b-roll con movimiento de cámara controlado.
- **Investigación en control de cámara**: el adaptador permite estudiar el efecto de la velocidad de desplazamiento en la coherencia temporal de modelos de difusión de vídeo, gracias a las mediciones de zoom publicadas.
- **Postproducción**: combinar el LoRA con otras herramientas de LTX-2.5 (como cambio de estilo o multishot) para crear secuencias complejas con movimiento de cámara controlado.

## Benchmarks y rendimiento

La model card no proporciona benchmarks estándar (como MMLU o HumanEval), sino métricas específicas del adaptador:

| Métrica | Valor |
|---|---|
| Error medio absoluto de zoom (paso 1250, sp05/sp20/sp50) | 3,4% |
| Zoom medido con token `sp05` | 1.108× |
| Zoom medido con token `sp20` | 1.591× |
| Zoom medido con token `sp50` | 2.285× |

No se han publicado resultados de benchmarks comparativos con otros modelos de control de cámara en la información disponible.

## Requisitos de hardware

- El adaptador en sí es pequeño (1.3 GB), pero requiere cargar el modelo base LTX-2.5 de 22B (transformer) y el text encoder Gemma-4-12B, lo que exige una GPU con al menos 24 GB de VRAM en BF16.
- Para una inferencia cómoda, se recomienda una GPU con 40 GB o más, como NVIDIA A100 (40/80 GB) o H100 (80 GB).
- No es viable en GPUs de consumo como RTX 4090 (24 GB) a menos que se use cuantización del modelo base (p.ej. GGUF o bitsandbytes), aunque el adaptador está pensado para BF16.
- El entrenamiento se realizó en una sola H100 (80 GB), lo que indica que el LoRA puede entrenarse en hardware similar.
- Opciones de despliegue: se usa principalmente en ComfyUI (cargador estándar de LoRA). También puede integrarse en pipelines de difusión con la librería de LTX-2.5, aunque no se documenta soporte explícito para vLLM u otros servidores de inferencia.

## Comparativa con modelos similares

| Modelo | Base | Rango | Velocidades | Resolución | Licencia |
|---|---|---|---|---|---|
| **ReelBids (este adaptador)** | LTX-2.5 22B | 32 | 7 (sp05–sp50) | 1024×576 @ 97f | other |
| LoRA oficiales de cámara LTX-2 (19B) | LTX-2 19B | no disponible | 1 (velocidad fija) | no disponible | no disponible |
| Otros LoRA de control de cámara (no encontrados) | — | — | — | — | — |

La ventaja principal de ReelBids es la selección de velocidad por token en un solo adaptador, frente a los LoRA oficiales que requieren un adaptador distinto por cada velocidad y que son exclusivos de la versión 19B. No se han encontrado otros adaptadores comparables en la información disponible.

## Limitaciones y advertencias

- **Degradación de nitidez**: en velocidades `sp20` o superiores, la nitidez del vídeo se degrada en el último tercio del clip. El autor indica que esto también ocurre con el modelo base sin el adaptador, por lo que es una limitación de coherencia del generador a largas distancias, no del LoRA en sí.
- **Condicionamiento obligatorio**: el entrenamiento se realizó con condicionamiento de primer fotograma al 100%, por lo que el adaptador solo funciona en el flujo de imagen-a-vídeo; no se recomienda usarlo en modo texto-a-vídeo sin una imagen inicial.
- **Licencia restrictiva**: la licencia es "other" y no se especifica si permite uso comercial. Es necesario contactar al autor para aclarar los términos.
- **Idiomas**: no se documenta soporte multilingüe; el text encoder de LTX-2.5 (Gemma-4-12B) acepta principalmente prompts en inglés, aunque podría funcionar con otros idiomas con menor calidad.
- **Sin métricas estándar**: no se han publicado resultados en benchmarks generales (MMLU, etc.) ni en métricas de calidad de vídeo (FVD, IS), lo que dificulta una evaluación objetiva más allá del error de zoom.
- **Dependencia de la base**: el adaptador solo funciona con la versión `ltx-2.5-22b-dev-transformer-bf16`; no es compatible con otras versiones de LTX-2.5 (por ejemplo, las versiones destiladas o cuantizadas) sin pruebas adicionales.

## Enlaces

- [HuggingFace - AhsanHareem/reelbids-ltx25-camera-lora-v2](https://huggingface.co/AhsanHareem/reelbids-ltx25-camera-lora-v2)
- [HuggingFace - AhsanHareem/reelbids-ltx25-camera-lora (página principal)](https://huggingface.co/AhsanHareem/reelbids-ltx25-camera-lora)
- [Modelo base LTX-2.5 - Lightricks](https://ltx.io/model/open-source)
- [Documentación de LTX-2.5](https://docs.ltx.io/models/ltx-2-5)
- [Referencia a LTX-2.5 en X (Twitter)](https://x.com/aisearchio/status/2087261232919453908)
