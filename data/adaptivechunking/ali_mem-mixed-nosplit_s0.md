# AdaptiveChunking/ali_mem-mixed-nosplit_s0

## Resumen

ali_mem-mixed-nosplit_s0 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre la arquitectura H-Net y el framework beetle-hnet. El objetivo declarado es estudiar el chunking adaptativo (agrupación dinámica de bytes en unidades de mayor nivel) dentro de un transformer jerárquico, con una variante de arquitectura denominada internamente "ali" y un objetivo de entrenamiento basado en ratios.

El modelo tiene 22.785.088 parámetros totales según los pesos en safetensors, lo que lo sitúa en la escala de un modelo pequeño (del orden de decenas de millones de parámetros). Se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes sobre tres idiomas (inglés, turco y finés), lo que sugiere un interés en evaluar el comportamiento del chunking en lenguas con morfología y longitudes de palabra muy distintas. El checkpoint publicado corresponde a la semilla 0 de una familia de experimentos.

Su relevancia es fundamentalmente académica: sirve como referencia reproducible para investigar tokenización byte-level sin vocabulario fijo, un área activa por su potencial para eliminar los problemas de cobertura multilingüe y de vocabulario OOV de los tokenizadores BPE clásicos. No está pensado para despliegue en producción ni para tareas generativas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (transformer jerárquico con chunking dinámico), variante "ali" |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento (no se documenta ventana de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), checkpoint.pt de PyTorch para estado del entrenador |

## Arquitectura y entrenamiento

El modelo se basa en H-Net, una familia de arquitecturas que aprenden a segmentar la entrada en chunks de forma dinámica en lugar de depender de un tokenizador estático. La entrada es byte-level (cada byte es una unidad inicial) y el modelo agrupa bytes en representaciones de nivel superior mediante un mecanismo de chunking cuya política se aprende durante el entrenamiento. La variante "ali" y el objetivo "ratio" son específicos de este experimento dentro del repositorio beetle-hnet, y el schedule de chunking se configura como `None`, con dechunking basado en media móvil exponencial (`dechunk=ema`).

El entrenamiento consistió en 6000 pasos con batch de 32 y longitud de 1024 bytes, sobre un corpus mixto de inglés, turco y finés. El repositorio organiza los checkpoints en ramas `step-N` siguiendo un schedule logarítmico por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k), e incluye el estado completo del entrenador (`training_state/checkpoint.pt`) para permitir reanudación exacta. La rama `main` contiene los pesos del último paso, el log de entrenamiento (`log.jsonl`), un `final.json` y sondas de frontera FLORES+ en `probe/`. No se documenta en la información disponible el uso de RLHF, DPO ni datos de preferencias, lo que es coherente con un experimento de tokenización y no de alineamiento.

## Capacidades

- Modelado de lenguaje a nivel de byte con chunking dinámico aprendido.
- Procesamiento de texto en inglés, turco y finés sin vocabulario fijo.
- Evaluación de fronteras de chunk mediante sondas FLORES+ incluidas en el repositorio.
- Reproducción y reanudación de entrenamiento desde cualquier checkpoint intermedio.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo thinking, visión, audio ni capacidades multimodales.
- No se documenta una API de generación de texto de alto nivel ni pipeline de Hugging Face asociado.

## Casos de uso

- Investigación en tokenización byte-level: usar el modelo y sus checkpoints intermedios para analizar cómo evoluciona la política de chunking a lo largo del entrenamiento, comparando las ramas `step-N`.
- Estudio comparativo multilingüe: evaluar el comportamiento del chunking en tres lenguas con morfología distinta (inglés analítico, turco aglutinante, finés aglutinante) para medir si el modelo aprende fronteras morfológicas.
- Reproducción de experimentos: el estado completo del entrenador en `training_state/checkpoint.pt` permite reanudar exactamente el run y verificar resultados de la semilla 0 frente a otras semillas de la misma familia.
- Baseline para nuevas arquitecturas de chunking: servir como referencia de 22,8 M de parámetros contra la que comparar variantes con schedule de chunking distinto o con otras políticas de dechunking.
- Análisis de fronteras de segmentación: utilizar las sondas FLORES+ en `probe/` para inspeccionar dónde coloca el modelo las fronteras de chunk en textos multilingües y detectar sesgos hacia ciertos patrones ortográficos.
- Docencia y divulgación: ejemplo compacto y reproducible de un transformer jerárquico con tokenización aprendida, adecuado para cursos de procesamiento del lenguaje natural que quieran mostrar alternativas a BPE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB, en fp16 unos 46 MB y en int8 unos 23 MB. Cualquier GPU consumer moderna puede alojarlo con holgura.
- GPU recomendadas: no se requiere hardware de datacenter; una GTX 1650, RTX 3060 o superior es más que suficiente. Para reentrenar desde cero, una única GPU consumer con 8-12 GB permite el batch de 32 x 1024 bytes documentado.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, y también en CPU para inferencia.
- Opciones de despliegue: el repositorio usa PyTorch y `huggingface_hub` para descargar checkpoints; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI. El formato safetensors con pesos atados requiere aplicar el mapeo de `config.json["tied_weights"]` al cargar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed-nosplit_s0 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos BPE pequeños tipo GPT-2 small | ~124 M | 1024 tokens | Transformer decoder con vocabulario BPE | MIT (GPT-2) | Hugging Face |
| Byte-level transformers sin chunking | variable | variable | Transformer plano sobre bytes | variable | variable |

La comparación directa es difícil porque ali_mem-mixed-nosplit_s0 no es un modelo de propósito general sino un artefacto de investigación sobre tokenización. Frente a un GPT-2 small, la diferencia clave es el orden de magnitud en parámetros y el enfoque de tokenización: este modelo no tiene vocabulario y aprende a agrupar bytes, mientras que GPT-2 depende de un vocabulario BPE fijo de 50.257 tokens. No se dispone de benchmarks que permitan comparar rendimiento lingüístico entre ambos.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline de Hugging Face asociado ni API de generación documentada; no está pensado para uso en producción.
- Entrenado únicamente con 6000 pasos y 32 x 1024 bytes por paso, lo que supone un volumen de cómputo muy reducido y una calidad lingüística presumiblemente baja.
- Cobertura limitada a tres idiomas (en, tr, fi); no se documenta comportamiento en castellano ni en otras lenguas.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación; al ser un modelo pequeño y poco entrenado, el riesgo de salidas incoherentes es alto.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación de rendimiento hace desaconsejable cualquier despliegue real.
- El formato de pesos requiere manejar el mapeo de pesos atados (`tied_weights`) para cargar correctamente el modelo.
- El tamaño del repositorio (7,2 GB) se debe principalmente a los múltiples checkpoints y al estado del entrenador, no a los pesos del modelo en sí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-nosplit_s0
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking/models
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
