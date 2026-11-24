# eyes-ml/DaisyRose-27B

## Resumen

DaisyRose-27B es un modelo multimodal de razonamiento desarrollado por RadixArk, construido sobre Qwen3.8-27B mediante aprendizaje por refuerzo exclusivamente, sin supervisión fina (SFT) ni destilación. Se trata del primer modelo publicado por el laboratorio y está orientado a tareas de agente de horizonte largo, especialmente en entornos de terminal y resolución de problemas de ingeniería de software. Mantiene la arquitectura, el tokenizador y la plantilla de chat del modelo base, por lo que es un reemplazo directo en pilas de inferencia y post-entrenamiento existentes.

El modelo conserva la comprensión de imágenes y una ventana de contexto de 256K tokens del Qwen3.8-27B original, y se distribuye bajo licencia Apache-2.0 en formatos BF16, FP8 y NVFP4, además de variantes GGUF. Su entrenamiento se realizó durante 18 días sobre 144 GPU H200, utilizando aproximadamente 1.200 tareas de agente de horizonte largo curadas, con sesiones de hasta 1M de tokens.

La relevancia de DaisyRose-27B radica en su enfoque de RL puro sobre tareas de agente: mejora sustancialmente el rendimiento en Terminal Bench 4.1 (de 5,6 a 12,0 pass@1) y en DeepSWE v1.1 (de 42,2 a 46,2) respecto al modelo base, manteniendo un tamaño compacto de 27B parámetros que lo hace desplegable en infraestructura moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16, FP8, NVFP4, GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, FP8, NVFP4), GGUF |

## Arquitectura y entrenamiento

DaisyRose-27B mantiene la arquitectura del modelo base Qwen3.8-27B, incluyendo su tokenizador y plantilla de chat, lo que garantiza compatibilidad directa con las pilas de inferencia y post-entrenamiento existentes. El modelo es multimodal (image-text-to-text) y conserva la capacidad de comprensión de imágenes del modelo original. No se especifican en la información disponible detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de las 1.200 tareas de agente de horizonte largo curadas.

La innovación principal es el método de entrenamiento: aprendizaje por refuerzo puro, sin supervisión fina ni destilación, aplicado sobre tareas de agente de horizonte largo con sesiones de hasta 1M de tokens. El entrenamiento se llevó a cabo durante 18 días en 144 GPU H200. El modelo se evaluó con la configuración de modo pensamiento recomendada por el modelo base: temperatura 1.0, top_p 0.95, top_k 20, min_p 0, esfuerzo de razonamiento xhigh (valor por defecto de la plantilla) y sin límite de max_tokens dentro del contexto de 256K.

## Capacidades

- Generación de texto y razonamiento multimodal (texto e imagen).
- Razonamiento de horizonte largo en entornos de agente, con sesiones de hasta 1M de tokens durante el entrenamiento.
- Ejecución de tareas en terminal y resolución de problemas de ingeniería de software (Terminal Bench, DeepSWE, SWE Bench Pro).
- Modo de pensamiento (thinking mode) con esfuerzo de razonamiento configurable (xhigh por defecto).
- Comprensión de imágenes (pipeline image-text-to-text).
- Seguimiento de instrucciones (evaluado en IFBench).
- Razonamiento científico y de conocimiento experto (GPQA Diamond, HLE).
- Compatibilidad directa con la plantilla de chat y el tokenizador de Qwen3.8-27B.
- Soporte de decodificación especulativa mediante el draft DSpark (Qwen3.8-27B-DSpark).

## Casos de uso

- Automatización de tareas en terminal: el modelo puede operar en entornos de línea de comandos para ejecutar tareas de administración de sistemas, dado su entrenamiento específico en Terminal Bench y su ventana de contexto de 256K tokens para sesiones largas.
- Resolución de incidencias de software en producción: con rendimiento en DeepSWE v1.1 (46,2) y SWE Bench Pro v2 (94,7), es adecuado para agentes que diagnostican y parchean errores en repositorios reales.
- Agentes de codificación multi-paso: su entrenamiento en RL sobre tareas de horizonte largo lo hace apto para pipelines de CI/CD donde el agente debe iterar sobre fallos de tests y aplicar correcciones sucesivas.
- Asistencia técnica con contexto extenso: la ventana de 256K tokens permite gestionar conversaciones multi-turno con documentación técnica extensa o trazas de error largas.
- Análisis de imágenes técnicas: al conservar la comprensión de imágenes del modelo base, puede interpretar capturas de pantalla, diagramas o registros visuales en flujos de soporte.
- Evaluación y post-entrenamiento: al ser un reemplazo directo de Qwen3.8-27B (misma arquitectura, tokenizador y plantilla), puede integrarse en pilas existentes de post-entrenamiento sin cambios en el código.
- Razonamiento científico asistido: con 90,7 en GPQA Diamond y 34,3 en HLE, es utilizable en flujos de investigación que requieren razonamiento experto con verificación humana.

## Benchmarks y rendimiento

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Parámetros activados | 27B | 27B | 30B | 3B | 15B | 17B | 23B | 42B | – |
| Parámetros totales | 27B | 27B | 30B | 35B | 309B | 594B | 501B | 816B | – |
| Terminal Bench 4.1 | 12,0 | 5,6 | 0,5 | 0,0 | **16,1** | 13,0 | 6,4 | 6,6 | 15,2 |
| Terminal Bench 2.1 | 75,5 | 73,0 | 51,7 | 44,9 | **87,6** | 81,3 | 80,1 | 76,4 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 | 4,4 | 0,0 | 67,9 | **72,1** | 43,3 | 60,0 | 66,6 |
| SWE Bench Pro v2 | 94,7 | 91,3 | 80,4 | 73,3 | – | **97,7** | – | 95,0 | – |
| HLE (solo texto) | 34,3 | 33,9 | 22,0 | 22,2 | 35,1 | **44,1** | 34,7 | 43,9 | 38,5 |
| IFBench | **82,4** | 79,5 | 77,0 | 64,4 | – | – | 79,6 | – | – |
| GPQA Diamond | 90,7 | 89,2 | 83,5 | 86,0 | 88,7 | **93,0** | 90,6 | 89,0 | 90,5 |

Notas metodológicas: Terminal Bench 4.1 promediado sobre 8 repeticiones por tarea con mini-swe-agent y resumen habilitado; Terminal Bench 2.1 sobre 5 repeticiones con Terminus 2; DeepSWE v1.1 sobre 8 repeticiones con mini-swe-agent; SWE Bench Pro v2 sobre 5 repeticiones con mini-swe-agent; HLE sobre 5 repeticiones con GPT-6 Luna como evaluador y sin herramientas; IFBench sobre 4 repeticiones (300 prompts) con el scorer oficial allenai/IFBench; GPQA Diamond sobre 8 repeticiones (198 preguntas). Las puntuaciones de DaisyRose-27B corresponden al mayor de los resultados BF16 y FP8, que difieren en menos de un punto en todos los benchmarks donde se ejecutaron ambos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan aproximadamente 55,6 GB (tamaño del repo), por lo que se requiere al menos una GPU de 80 GB (A100/H100) para inferencia en BF16 sin cuantizar. Las variantes FP8 y NVFP4 reducen el requisito a aproximadamente la mitad y a un cuarto, respectivamente.
- GPU recomendadas: H200 (utilizadas en el entrenamiento), H100 y A100 de 80 GB para BF16. Para FP8, GPU con soporte nativo de FP8 (H100, H200, L40S). Para NVFP4, GPU Blackwell (B200 y similares).
- GPU de consumo: no se dispone de datos específicos sobre ejecución en GPU de consumo; la variante GGUF permite potencialmente su despliegue en configuraciones con memoria unificada o múltiples GPU, pero no se confirma en la información disponible.
- Opciones de despliegue: transformers (librería declarada), con compatibilidad con endpoints; existen variantes GGUF para llama.cpp/Ollama y FP8/NVFP4 para vLLM/TGI, aunque no se detalla en la información proporcionada.
- Latencia y throughput: no disponibles. Se menciona el draft DSpark (Qwen3.8-27B-DSpark) para decodificación especulativa, lo que puede mejorar el throughput, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros (activos/totales) | Contexto | Terminal Bench 4.1 | DeepSWE v1.1 | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DaisyRose-27B | 27B / 27B | 256K | 12,0 | 46,2 | 90,7 | Apache-2.0 | Pesos abiertos (BF16/FP8/NVFP4/GGUF) |
| Qwen3.8-27B (base) | 27B / 27B | 256K | 5,6 | 42,2 | 89,2 | no disponible en la información | Pesos abiertos |
| Muse Glimmer-30B | 30B / 30B | no disponible | 0,5 | 4,4 | 83,5 | no disponible | Pesos abiertos |
| Inkling 2 Small | 17B / 594B | no disponible | 13,0 | **72,1** | **93,0** | no disponible | Pesos abiertos |
| MiMo V2.6 Flash | 15B / 309B | no disponible | **16,1** | 67,9 | 88,7 | no disponible | Pesos abiertos |

DaisyRose-27B destaca frente a su modelo base en tareas de agente (Terminal Bench 4.1, DeepSWE, SWE Bench Pro) y en seguimiento de instrucciones (IFBench), con un tamaño total muy inferior al de los modelos MoE comparados (Inkling 2 Small y MiMo V2.6 Flash), que pese a tener muchos más parámetros totales no dominan en todas las métricas. En GPQA Diamond, Inkling 2 Small supera a DaisyRose-27B (93,0 frente a 90,7).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al heredar el modelo base, es probable que arrastre sesgos de Qwen3.8-27B, pero no se confirma.
- Riesgo de alucinación: no se cuantifica; como modelo de razonamiento generativo, es susceptible de alucinación, especialmente en HLE (34,3) y GPQA (90,7), donde no alcanza el 100 %.
- Limitaciones de contexto o idioma: la ventana es de 256K tokens; no se especifican los idiomas soportados, por lo que no se puede confirmar cobertura multilingüe más allá de lo que herede del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card enlaza a una licencia en el repositorio RadixArk/DaisyRose-27B; conviene verificar el texto exacto antes de producción.
- Caveats para producción: el modelo se entrenó con RL puro sobre tareas de agente, por lo que su comportamiento fuera de ese dominio (por ejemplo, conversación general o creatividad) no está evaluado en la información disponible. Las puntuaciones de benchmarks son del propio desarrollador y pueden no ser reproducibles con otros harness. El modelo tiene muy pocas descargas (2) y ningún like en el momento de la ficha, lo que indica escasa validación comunitaria.
- La model card cita un repositorio base (RadixArk/DaisyRose-27B) distinto del ID de Hugging Face (eyes-ml/DaisyRose-27B), lo que puede indicar una réplica o espejo; conviene confirmar la procedencia oficial.

## Enlaces

- Hugging Face: https://huggingface.co/eyes-ml/DaisyRose-27B
- Repositorio BF16 citado en la model card: https://huggingface.co/RadixArk/DaisyRose-27B
- Variante FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Variante NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Variante GGUF: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- Draft DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog: https://www.radixark.com/blog/daisyrose-27b
- Licencia: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Paper SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
- Leaderboard Terminal Bench: https://www.tbench.ai/leaderboard
- Vals.ai Terminal Bench 4: https://www.vals.ai/benchmarks/terminal-bench-4
- Artificial Analysis Qwen3.8: https://artificialanalysis.ai/models/qwen3-8-27b
- Artificial Analysis Qwen3.6: https://artificialanalysis.ai/models/qwen3-6-35b-a3b
- Model card Muse Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card Inkling 2 Small: https://thinkingmachines.ai/model-card/inkling-2-small/
- Model card Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Model card Muse Spark Open: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Release MiMo V2.6: https://mimo.xiaomi.com/mimo-v2-6
