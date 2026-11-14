# 294-288-pretrain-interaction/160M-random-v2

## Resumen

Random 160M — uniform WSD v2 es un checkpoint de investigación de un modelo de lenguaje de tipo GPT-NeoX con aproximadamente 160 millones de parámetros, publicado por el colectivo 294-288-pretrain-interaction. No se trata de un modelo listo para inferencia, sino de un estado de entrenamiento completo en PyTorch que incluye pesos del modelo, estado del optimizador AdamW, planificador (scheduler), RNG por rango y contadores de inyección. El autor advierte explícitamente de que estos checkpoints no son exportaciones `from_pretrained` de Transformers.

El objetivo del proyecto es estudiar interacciones durante el preentrenamiento bajo un esquema de scheduling uniforme WSD (warmup-stable-decay) en su versión 2. Cada condición experimental apunta a 16.000 millones de tokens estables y cada ancla de 1.000 millones de tokens dispone de un cooldown independiente de 100 millones de tokens solo de fondo, además de un control con LR constante. La evaluación se realiza con 512 tokens sin generación sobre objetivos congelados de 1536 (512 por cada condición M/C/G), en modo plano y con trigger.

Es relevante para investigadores que estudien dinámicas de preentrenamiento, planificadores de tasa de aprendizaje y efectos de inyección de datos, no para aplicaciones de producción. El modelo solo declara soporte para inglés y no tiene pipeline, licencia ni métricas publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 160M (aproximado, segun nombre del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluacion con ventanas de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | estado de entrenamiento PyTorch (modelo + AdamW + scheduler + RNG + contadores); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-NeoX, con unos 160 millones de parámetros. El checkpoint contiene el estado completo de entrenamiento: pesos del modelo, estado del optimizador AdamW, estado del planificador de tasa de aprendizaje, RNG por rango y contadores de inyección. Esto lo diferencia de un export estándar de Hugging Face y condiciona su uso: está pensado para reanudar o analizar trayectorias de entrenamiento, no para servir inferencia directamente.

El régimen de entrenamiento es uniform WSD v2. La cola de experimentos prioriza las condiciones MCG, M, C y G con r32, seguidas de r16, r8, r4, r2 y r1. Cada condición apunta a 16.000 millones de tokens estables, y cada ancla de 1.000 millones de tokens tiene un cooldown independiente de 100 millones de tokens solo de fondo junto con un control de LR constante. El autor advierte de que la financiación puede cubrir solo un prefijo de la cola y que ninguna condición ausente debe considerarse completa. La evaluación usa 512 tokens sin generación sobre 1536 objetivos congelados (512 por cada condición M/C/G), en modo plano y con trigger; las métricas NLL brutas y los efectos de trigger se publican tras cada trayectoria completa, y las métricas ajustadas por Clean requieren estados Clean v2 coincidentes.

## Capacidades

- Generación de texto: no verificada; el autor indica que la evaluación es "non-generation" y el checkpoint es un estado de entrenamiento.
- Razonamiento, código y matemáticas: no disponibles como capacidades declaradas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: no hay thinking mode, visión ni audio; el interés del checkpoint es el estudio de dinámicas de preentrenamiento (WSD, inyección, triggers).

## Casos de uso

- Investigación en planificadores de tasa de aprendizaje: reanudar trayectorias WSD v2 desde el estado guardado (modelo, AdamW, scheduler y RNG) para comparar cooldowns y controles de LR constante.
- Estudio de efectos de inyección de datos: usar los contadores de inyección y las condiciones M/C/G para medir cómo afecta la composición del dataset a la NLL en objetivos congelados.
- Reproducibilidad de experimentos a pequeña escala: el tamaño de 160M permite replicar trayectorias en hardware modesto y validar conclusiones antes de escalar.
- Análisis de triggers: evaluar el comportamiento en modo plano y con trigger sobre los 1536 objetivos congelados para estudiar sesgos inducidos por datos.
- Formación y docencia: servir como ejemplo práctico de estado de entrenamiento completo frente a un export de inferencia, útil en cursos de preentrenamiento.
- Auditoría de metodología: comparar métricas NLL brutas y ajustadas por Clean para validar protocolos de evaluación en preentrenamiento.
- No se recomienda su uso en producción, atención al cliente ni generación de código, dado que no es un modelo de inferencia validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona métricas de NLL brutas y efectos de trigger que se publican tras cada trayectoria completa, pero no se incluyen valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de 160M, una estimación orientativa en fp16 sería de aproximadamente 0,3-0,4 GB solo de pesos, más overhead de activaciones y contexto.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna podría alojarlo, pero el checkpoint no está validado para inferencia.
- Cabe en GPU consumer: probablemente sí por tamaño, aunque no hay validación publicada.
- Opciones de despliegue: no disponibles; el autor indica que no es un export de Transformers, por lo que vLLM, TGI, llama.cpp u Ollama no son compatibles sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Random 160M — uniform WSD v2 | 160M | no disponible | no disponible | checkpoint de entrenamiento PyTorch | Estado completo de entrenamiento, solo inglés |
| GPT-NeoX-20B | 20B | 2048 | no disponible en esta ficha | pesos de inferencia | Referencia de la misma familia, mucho mayor |
| Pythia-160M | 160M | 2048 | Apache 2.0 (segun informacion publica del proyecto) | pesos de inferencia | Suite de investigación comparable en tamaño |
| OPT-125M | 125M | 2048 | no disponible en esta ficha | pesos de inferencia | Alternativa de tamaño similar para investigación |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo analizado para contrastar con las alternativas.

## Limitaciones y advertencias

- No es un modelo de inferencia: el autor indica que son estados de entrenamiento PyTorch, no exportaciones `from_pretrained` de Transformers.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas: solo inglés declarado; sin capacidades multilingües verificadas.
- Riesgo de alucinación: no evaluado; no hay benchmarks de generación publicados.
- Sesgos: no documentados; el estudio de triggers sugiere posibles efectos inducidos por datos, pero no hay resultados publicados.
- Contexto: la evaluación usa ventanas de 512 tokens; la longitud máxima de contexto no está declarada.
- Cobertura experimental incompleta: el autor advierte de que la financiación puede cubrir solo un prefijo de la cola y que ninguna condición ausente debe considerarse completa.
- Métricas ajustadas por Clean requieren estados Clean v2 coincidentes; sin ellos, las comparaciones pueden no ser válidas.
- Sin descargas ni likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/294-288-pretrain-interaction/160M-random-v2
- Repositorio de código (rama yihan/random-wsd-v2): https://github.com/294-288-pretrain-interaction/pretrain_interaction/tree/8b9bbac1c7310fbf927d2f301ab9d132f707e0ce
- Rutas de checkpoints: uniform-wsd-v2/160m/<run>/
- Papers, blogs y demos: no disponibles en la informacion proporcionada.
