# AdaptiveChunking/ali_ali-surface-only_s0

## Resumen

`ali_ali-surface-only_s0` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, construido sobre el framework `beetle-hnet` (repositorio en GitHub de suchirsalhan). Se trata de una ejecución de entrenamiento con arquitectura `ali`, objetivo `ratio`, sin schedule (`schedule=None`), dechunking por media móvil exponencial (`dechunk=ema`) y semilla 0, entrenada durante 6000 pasos sobre secuencias de 1024 bytes en tres idiomas: inglés, turco y finés. Con 22.785.088 parámetros, es un modelo pequeño orientado a experimentación con tokenización dinámica a nivel de byte.

El modelo no es un asistente conversacional ni un LLM de propósito general: es un artefacto de investigación sobre segmentación dinámica de tokens (*dynamic chunking*) y modelos H-Net a nivel de byte. Su interés radica en explorar alternativas a la tokenización BPE estática, permitiendo que el propio modelo aprenda los límites de chunk a partir de la señal de bytes, y en el registro detallado de checkpoints intermedios que publica el autor.

La relevancia práctica es limitada fuera del ámbito de investigación en tokenización, pero el repositorio incluye infraestructura útil para reproducir experimentos: checkpoints por fase, estado completo del entrenador reanudable y sondas de frontera sobre FLORES+ (`probe/`) una vez finalizada la ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte, variante `ali` (framework beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento (contexto de inferencia no especificado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles, turco, fines (segun `langs` del entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores atados almacenados una sola vez; mapeo en `config.json["tied_weights"]`), PyTorch (`training_state/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma H-Net con tokenización dinámica a nivel de byte: en lugar de una tokenización BPE fija, el modelo procesa bytes y agrupa dinámicamente los chunks durante el cómputo. La variante `ali` corresponde a una de las arquitecturas del framework `beetle-hnet`, con un objetivo de entrenamiento de tipo `ratio` y dechunking mediante media móvil exponencial (`dechunk=ema`). El entrenamiento se realizó sin schedule (`schedule=None`), con semilla 0, durante 6000 pasos sobre lotes de 32 secuencias de 1024 bytes, en los idiomas inglés, turco y finés.

El repositorio publica checkpoints por fase en una programación logarítmica en base 2 (`step-0`, `step-1`, `step-2`, `step-4`, `step-6`, `step-8`, `step-16`, ..., hasta `2^k` desde cada inicio de fase de objetivo, más el paso final). Cada rama `step-N` contiene `model.safetensors`, `config.json`, `training_config.yaml` y el estado completo del entrenador reanudable en `training_state/checkpoint.pt`. La rama `main` contiene los pesos y la configuración del último paso, además de `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/` cuando la ejecución ha finalizado. No se documentan en la información disponible detalles sobre volumen total de tokens, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica de chunks, orientado a investigación sobre tokenización.
- Entrenado en tres idiomas: inglés, turco y finés.
- Capacidad de reanudación exacta del entrenamiento gracias al estado completo del entrenador (`training_state/checkpoint.pt`).
- Publicación de checkpoints intermedios por fase para análisis de la evolución del aprendizaje.
- Sondas de frontera sobre FLORES+ (`probe/`) para evaluar la calidad de la segmentación una vez finalizado el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Investigación en tokenización dinámica: usar los checkpoints intermedios para estudiar cómo evoluciona la segmentación de chunks a lo largo del entrenamiento y comparar con tokenizadores BPE estáticos.
- Reproducción de experimentos: reanudar el entrenamiento desde cualquier rama `step-N` cargando `training_state/checkpoint.pt`, lo que permite extender la ejecución o cambiar hiperparámetros a mitad de fase.
- Análisis multilingüe de fronteras de chunk: emplear las sondas FLORES+ en inglés, turco y finés para medir la calidad de la segmentación en lenguas con morfología aglutinante (turco, finés) frente al inglés.
- Baseline para comparativas de arquitecturas H-Net: servir como referencia de la variante `ali` con objetivo `ratio` y dechunking `ema` frente a otras variantes del framework `beetle-hnet`.
- Estudio de eficiencia en modelos pequeños: con 22,8 M de parámetros, el modelo cabe en GPU de consumo y permite iterar rápidamente sobre hipótesis de tokenización sin grandes costes de cómputo.
- Docencia y experimentación académica: ejemplo reproducible de entrenamiento a nivel de byte con estado reanudable y checkpoints por fase, útil en cursos de PLN o de sistemas de tokenización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia sondas de frontera FLORES+ (`probe/`) que se generan al finalizar la ejecución, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (aproximadamente 91 MB de pesos); en fp16 o bf16, alrededor de 46 MB. El tamaño del repo (3,5 GB) se debe a los múltiples checkpoints y estados del entrenador, no al modelo en sí.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y sin pipeline declarado, el despliegue requiere cargar los pesos manualmente con `torch.load` o `safetensors.torch.load_file` y usar el código del framework `beetle-hnet`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ali_ali-surface-only_s0` (AdaptiveChunking) | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face, pesos safetensors |
| Otras variantes de `beetle-hnet` | no disponible | no disponible | H-Net byte-level con distintas arquitecturas/objetivos | no disponible | Repositorio GitHub del autor |
| Tokenizadores BPE estándar (p. ej. SentencePiece) | 0 (no neuronal) | no aplica | Segmentación estática basada en frecuencia | Apache 2.0 / MIT | Amplia |
| Modelos byte-level pequeños tipo ByT5-small | ~300 M | variable | Transformer byte-level sin tokenizador | Apache 2.0 | Hugging Face |

La comparación con ByT5-small es orientativa por categoría (modelado byte-level), pero no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni generación de texto de calidad.
- Entrenamiento muy corto (6000 pasos) y corpus limitado a tres idiomas (inglés, turco, finés), lo que restringe su cobertura lingüística.
- Contexto de entrenamiento de solo 1024 bytes; no se documenta comportamiento en contextos mayores.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- Riesgo de alucinación y salidas incoherentes inherente a un modelo pequeño y poco entrenado; no debe usarse para generar contenido factual.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de filtrado o alineación.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de validación y de documentación sobre el corpus de entrenamiento desaconseja su uso en entornos productivos.
- El repositorio incluye estados de entrenador (`checkpoint.pt`) que requieren `torch.load` con `weights_only=False`; debe hacerse solo con artefactos de confianza por el riesgo de deserialización.
- No se documenta soporte para tool calling, agentes ni integración con frameworks de despliegue estándar.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-surface-only_s0
- Repositorio del framework: https://github.com/suchirsalhan/beetle-hnet
