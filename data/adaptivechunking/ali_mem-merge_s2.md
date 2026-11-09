# AdaptiveChunking/ali_mem-merge_s2

## Resumen

`ali_mem-merge_s2` es un checkpoint de investigación publicado por el usuario AdaptiveChunking dentro del ecosistema del proyecto beetle-hnet. No es un modelo de lenguaje conversacional al uso, sino una ejecución de entrenamiento de una H-Net (una arquitectura jerárquica de tokenización dinámica a nivel de byte) con arquitectura `ali`, objetivo `ratio`, decodificación `ema` y semilla 2. El modelo se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes sobre corpus en inglés, turco y finés.

El interés del artefacto es fundamentalmente metodológico: sirve para estudiar tokenización dinámica por chunks, representaciones a nivel de byte y el comportamiento de una H-Net bajo distintos objetivos de entrenamiento. El repositorio incluye checkpoints intermedios siguiendo un calendario logarítmico por fases, estado completo del entrenador y sondas de frontera FLORES+.

Con 22.785.088 parámetros totales, es un modelo pequeño orientado a experimentación, no a producción. La licencia Apache 2.0 permite reutilización amplia, pero la ausencia de pipeline declarado, de idiomas oficiales y de benchmarks publicados limita su uso directo como modelo de generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net con tokenización dinámica a nivel de byte (variante `ali`) |
| Parámetros totales | 22.785.088 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | entrenado con `en`, `tr`, `fi` (no hay declaración oficial de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores atados almacenados una sola vez; `config.json["tied_weights"]` mapea los nombres omitidos) |

## Arquitectura y entrenamiento

El modelo es una H-Net, una familia de arquitecturas que combinan un codificador a nivel de byte con mecanismos de chunking dinámico para construir representaciones jerárquicas sin depender de un tokenizador BPE fijo. La variante `ali` corresponde a una configuración concreta del proyecto beetle-hnet, con objetivo de entrenamiento `ratio` y decodificación `ema` (`dechunk=ema`). El entrenamiento se realizó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre corpus en inglés, turco y finés, con semilla 2.

El repositorio sigue el layout Beetle: ramas `step-N` con checkpoints en un calendario logarítmico por fases (0, 1, 2, 4, 6, 8, 16, …, 2^k desde el inicio de cada fase objetivo, más el paso final), cada una con `model.safetensors`, `config.json`, `training_config.yaml` y el estado reanudable completo en `training_state/checkpoint.pt`. La rama `main` contiene los pesos y configuración del último paso, además de `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/` una vez finalizada la ejecución. Los pesos atados se almacenan una sola vez, lo que reduce el tamaño efectivo del checkpoint.

## Capacidades

- Modelo de investigación para tokenización dinámica a nivel de byte, no un asistente conversacional.
- Entrenado sobre tres idiomas (inglés, turco, finés), lo que permite estudiar comportamiento multilingüe en representaciones de byte.
- Checkpoints intermedios reanudables que permiten analizar la evolución del entrenamiento por fases.
- Sondas de frontera FLORES+ incluidas en `main` tras finalizar la ejecución, útiles para evaluar segmentación.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento.
- No se documentan capacidades de visión, audio ni generación de texto de propósito general.

## Casos de uso

- Investigación en tokenización dinámica: comparar la variante `ali` con otras configuraciones de beetle-hnet usando los checkpoints `step-N` para analizar cómo evoluciona la segmentación a lo largo del entrenamiento.
- Estudio de representaciones a nivel de byte en lenguas aglutinantes: el entrenamiento con turco y finés permite analizar cómo una H-Net maneja morfología compleja sin tokenizador previo.
- Reproducción de experimentos: el estado completo del entrenador en `training_state/checkpoint.pt` permite reanudar o auditar la ejecución con la misma semilla (2) y el mismo calendario de fases.
- Evaluación de segmentación con FLORES+: las sondas de frontera incluidas en `probe/` sirven para medir la calidad del chunking sobre un corpus multilingüe estándar.
- Baseline para comparativas de arquitectura: al ser un modelo pequeño (22,8 M de parámetros), es viable entrenarlo y evaluarlo en hardware modesto para contrastar con H-Nets de mayor tamaño u otros esquemas de tokenización.
- Docencia y experimentación académica: el layout Beetle con checkpoints intermedios y logs facilita ilustrar el efecto del calendario logarítmico por fases en el aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 22,8 M de parámetros, los pesos en FP32 ocupan aproximadamente 91 MB, pero el repo completo pesa 8,3 GB por los checkpoints y el estado del entrenador.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder cargar los pesos, aunque no se documenta el pipeline de inferencia.
- Cabe en GPU consumer: previsiblemente sí por tamaño de parámetros, pero no hay confirmación oficial ni instrucciones de despliegue.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la carga se realiza vía `huggingface_hub` y `torch.load` sobre `training_state/checkpoint.pt` o `model.safetensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AdaptiveChunking/ali_mem-merge_s2` | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Otras variantes de beetle-hnet | no disponible | no disponible | H-Net byte-level | no disponible | no disponible |
| Tokenizadores BPE estándar (p. ej. SentencePiece) | no aplica | no aplica | Segmentación subword estática | variable | amplia |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto listo para producción; carece de pipeline declarado y de instrucciones de inferencia.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad.
- Los idiomas declarados en el entrenamiento (en, tr, fi) no constituyen un soporte oficial; el campo de idiomas del repo está vacío.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al entrenarse sobre corpus limitados, puede reflejar sesgos de esos datos.
- El tamaño del repo (8,3 GB) es desproporcionado respecto a los 22,8 M de parámetros, debido a los múltiples checkpoints y al estado del entrenador; conviene descargar solo la revisión necesaria.
- Aunque la licencia es Apache 2.0, el uso comercial no está validado por benchmarks ni por documentación de comportamiento.
- La fecha de creación indicada (2026-11-09) es futura respecto a la información habitual de modelos; verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-merge_s2
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
