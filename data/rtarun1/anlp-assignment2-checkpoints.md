# rtarun1/anlp-assignment2-checkpoints

## Resumen

El repositorio `rtarun1/anlp-assignment2-checkpoints` recopila los checkpoints finales de un assignment de ANLP (Advanced Natural Language Processing). Incluye dos partes: modelos de traducción decoder-only (vietnamita y japonés a inglés) con cinco variantes de FFN, y un modelo denso preentrenado sobre el corpus `browndw/human-ai-parallel-corpus` con distintos optimizadores. Desarrollado por el usuario rtarun1, el repositorio ocupa 13.6 GB y no especifica licencia, pipeline ni idiomas generales.

La parte 1 explora arquitecturas densas y MoE (4 expertos top-1, 4 expertos top-2, 1 compartido + 3 enrutados top-1, 4 expertos anchos top-2). La parte 2 compara AdamW, MARS, Lion, SOAP, Sophia y AdamW de PyTorch, incluyendo un barrido de tasas de aprendizaje. Es relevante para investigadores que estudian eficiencia de parámetros, optimizadores y traducción automática, pero no es un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; part1 incluye variantes con MoE (4 expertos top-1, 4 expertos top-2, 1 compartido + 3 enrutados top-1, 4 expertos anchos top-2) y una variante densa MLP |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (solo aplicable a variantes MoE; no se especifican) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints en precisión completa, sin versiones cuantizadas) |
| Idiomas soportados | Part1: vietnamita y japonés (origen) a inglés (destino). Part2: no disponible (entrenado en browndw/human-ai-parallel-corpus, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | PyTorch Lightning checkpoint (.ckpt) |

## Arquitectura y entrenamiento

El repositorio contiene dos conjuntos de checkpoints. La parte 1 (`part1/`) corresponde a modelos de traducción decoder-only entrenados para traducir de vietnamita y japonés a inglés. Se exploran cinco variantes de la red feed-forward (FFN): MLP densa, 4 expertos con top-1, 4 expertos con top-2, 1 experto compartido más 3 enrutados con top-1, y 4 expertos anchos con top-2. Esto permite estudiar el impacto de arquitecturas MoE en la traducción automática.

La parte 2 (`part2/`) contiene un modelo denso preentrenado sobre el corpus `browndw/human-ai-parallel-corpus`. Se comparan distintos optimizadores: AdamW, MARS, Lion, SOAP, Sophia y la referencia AdamW de PyTorch, incluyendo un barrido de tasas de aprendizaje (run names con sufijo `-lr<valor>`). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Los logs de entrenamiento están disponibles en Weights & Biases.

## Capacidades

- Traducción automática de vietnamita a inglés y de japonés a inglés (modelos de part1).
- Generación de texto y modelado de lenguaje (modelo denso de part2).
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas a los idiomas de entrenamiento; part1 cubre vi, ja y en; part2 sin especificar.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Estudio comparativo de arquitecturas MoE frente a densas en traducción automática: los checkpoints de part1 permiten reproducir experimentos y analizar el impacto de diferentes configuraciones de FFN (top-1, top-2, expertos compartidos) en la calidad de traducción vi/ja→en.
- Evaluación de optimizadores para preentrenamiento de modelos de lenguaje: part2 ofrece pesos de un mismo modelo denso entrenado con AdamW, MARS, Lion, SOAP, Sophia y AdamW de PyTorch, lo que permite comparar convergencia y rendimiento final.
- Investigación en eficiencia de parámetros: los modelos con MoE sirven para estudiar el equilibrio entre parámetros totales y activos, y su efecto en tareas de traducción.
- Reproducibilidad de experimentos académicos: al incluir el tokenizer y los checkpoints finales, otros investigadores pueden replicar los resultados del assignment y validar las conclusiones.
- Desarrollo de sistemas de traducción para vietnamita y japonés: los modelos de part1 pueden usarse como base para afinar en dominios específicos o como referencia en investigación en traducción de bajos recursos.
- Análisis del efecto de la tasa de aprendizaje: los checkpoints con barrido de learning rate permiten estudiar cómo afecta este hiperparámetro al preentrenamiento y a la estabilidad del entrenamiento.
- Prototipado de modelos de lenguaje en entornos académicos: part2 puede servir como base para experimentos de generación de texto, análisis de optimizadores y estudio de dinámicas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Los logs de Weights & Biases pueden contener métricas de entrenamiento (pérdida, precisión de validación), pero no se presentan como benchmarks estandarizados.

## Requisitos de hardware

- No se dispone de información sobre el número de parámetros, por lo que no es posible estimar la VRAM necesaria para inferencia.
- El repositorio completo ocupa 13.6 GB, lo que sugiere que los checkpoints individuales pueden ser de varios GB, pero se desconoce el tamaño exacto de cada modelo.
- Al estar en formato `.ckpt` de PyTorch Lightning, se requiere PyTorch y el código del repositorio (con `sys.path` incluyendo `src/`) para cargar los modelos.
- Para despliegue en producción sería necesario convertir los pesos a formatos como safetensors, GGUF o similar; no se proporcionan scripts de conversión.
- No se especifican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia o throughput.
- Dado que son modelos de un assignment académico, es probable que quepan en GPUs de consumo si el número de parámetros es moderado, pero no se puede confirmar sin más datos.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (traducción vi/ja→en o modelos densos preentrenados con los mismos optimizadores). Al tratarse de checkpoints de un assignment, no se han publicado comparativas con modelos establecidos como mBART, NLLB o similares.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución.
- Modelos académicos: no han sido validados para producción; pueden contener sesgos y generar alucinaciones.
- Idiomas limitados: part1 solo cubre vietnamita y japonés como origen e inglés como destino; part2 no especifica idiomas.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente a modelos establecidos.
- Checkpoints en precisión completa: no hay versiones cuantizadas para inferencia eficiente.
- Dependencia del código: para cargar los modelos se necesita el repositorio de código con `src/`, que no se enlaza directamente en la model card.
- Posible sobreajuste a los datos del assignment: al ser un trabajo académico, los modelos pueden no generalizar bien fuera de los dominios de entrenamiento.
- No hay información sobre sesgos, seguridad o alineación.

## Enlaces

- HuggingFace: https://huggingface.co/rtarun1/anlp-assignment2-checkpoints
- Weights & Biases (logs de entrenamiento): https://wandb.ai/rtarun1-github/anlp-assignment-2
- Repositorio de código: no disponible (se menciona un repositorio con `src/` pero no se proporciona la URL).
- Paper: no disponible.
