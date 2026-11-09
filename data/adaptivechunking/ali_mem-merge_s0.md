# AdaptiveChunking/ali_mem-merge_s0

## Resumen

ali_mem-merge_s0 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un modelo a nivel de byte (byte-level) entrenado con el framework beetle-hnet, una implementación de H-Net orientada a tokenización dinámica por chunks. El modelo no es un LLM conversacional al uso, sino un artefacto experimental pensado para estudiar estrategias de chunking adaptativo y tokenización byte a byte.

La arquitectura declarada es "ali" con objetivo "ratio", programación de chunking desactivada (`schedule=None`), decodificación de chunk por media exponencial móvil (`dechunk=ema`) y semilla 0. El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés, turco y finés. El modelo tiene 22.785.088 parámetros totales y un repositorio de 7,2 GB, dominado por los estados completos del entrenador guardados en cada checkpoint.

Su relevancia es acotada: se publica como material reproducible de investigación sobre tokenización y chunking dinámico, no como modelo listo para producción. La licencia Apache 2.0 permite reutilización, pero la ausencia de model card orientada a uso, de benchmarks y de pipeline declarado limita seriamente su aplicabilidad fuera del contexto experimental del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net variante "ali" (byte-level, chunking dinámico) |
| Parámetros totales | 22.785.088 |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante entrenamiento (no se declara contexto de inferencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, turco, finés (según datos de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), checkpoint.pt de PyTorch para estado del entrenador |

## Arquitectura y entrenamiento

El modelo sigue el diseño H-Net implementado en beetle-hnet, con procesamiento a nivel de byte y un mecanismo de chunking dinámico que agrupa bytes en unidades de mayor granularidad. La configuración concreta de este checkpoint usa `architecture=ali`, `objective=ratio`, `schedule=None` y `dechunk=ema`, es decir, sin programación explícita de chunking y con decodificación basada en media exponencial móvil. Los pesos atados se almacenan una sola vez en `model.safetensors` y se reconstruyen mediante el mapa `tied_weights` de `config.json`.

El entrenamiento se realizó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. No se documenta el volumen total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO; tampoco se describen innovaciones adicionales más allá del propio esquema de chunking adaptativo. El repositorio conserva checkpoints intermedios en una programación logarítmica en base 2 (pasos 0, 1, 2, 4, 6, 8, 16, ... hasta el paso final), cada uno con estado reanudable completo del entrenador, lo que explica el tamaño de 7,2 GB del repo.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre texto en inglés, turco y finés.
- Tokenización dinámica por chunks con decodificación mediante media exponencial móvil.
- Reanudación exacta del entrenamiento desde cualquier checkpoint intermedio gracias al estado completo del entrenador.
- Evaluación de fronteras de chunk mediante las pruebas FLORES+ incluidas en `probe/` una vez finalizado el run.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se declara una interfaz de generación de texto lista para uso (pipeline no disponible).

## Casos de uso

- Investigación en tokenización byte-level: sirve como punto de partida reproducible para comparar estrategias de chunking adaptativo frente a tokenizadores BPE o SentencePiece en corpus multilingües pequeños.
- Estudio de decodificación por media exponencial móvil: permite analizar cómo afecta `dechunk=ema` a la reconstrucción de fronteras de chunk en lenguas con morfología aglutinante como el turco y el finés.
- Reproducción de experimentos: los checkpoints intermedios con estado completo del entrenador permiten reanudar y alterar hiperparámetros sin reiniciar desde cero.
- Evaluación de fronteras lingüísticas: los probes FLORES+ incluidos facilitan medir la calidad de segmentación en los tres idiomas entrenados.
- Baseline para arquitecturas H-Net: útil como referencia de 22,8 M de parámetros en comparaciones con otras variantes de beetle-hnet.
- Docencia y formación: ejemplo práctico de pipeline de entrenamiento byte-level con gestión de checkpoints y pesos atados para cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (unos 91 MB de pesos); el repositorio de 7,2 GB corresponde a checkpoints de entrenamiento, no a pesos de inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para cargar los pesos; para reentrenar se recomienda una GPU con 16 GB o más (A100, RTX 4090, L40S) por el estado del entrenador y los batches de 32 × 1024 bytes.
- Cabe en cualquier GPU de consumo actual (GTX 1650, RTX 3060, RTX 4060) e incluso en CPU para inferencia.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama ni TGI; el uso previsto es mediante PyTorch y `huggingface_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-merge_s0 | 22,8 M | 1024 bytes (entrenamiento) | en, tr, fi | Apache 2.0 | Hugging Face |
| Modelos byte-level tipo ByT5 | no disponible en la información | no disponible | multilingüe | Apache 2.0 | Hugging Face |
| Tokenizadores BPE estándar (referencia) | no aplica | no aplica | multilingüe | variable | amplia |

No se dispone de datos de rendimiento de alternativas directas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks publicados; no hay evidencia de calidad en tareas downstream.
- Entrenado solo con inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Contexto de entrenamiento limitado a 1024 bytes por secuencia, lo que restringe el modelado de dependencias largas.
- No se documentan sesgos conocidos, pero el corpus multilingüe reducido y no descrito impide evaluar riesgos de sesgo.
- Riesgo de alucinación no evaluado; al ser un modelo byte-level sin ajuste por instrucciones, no se recomienda su uso en aplicaciones de usuario final.
- Sin pipeline declarado ni instrucciones de inferencia más allá de la carga de pesos; requiere trabajo de integración por parte del usuario.
- El repo incluye estados completos del entrenador (7,2 GB); descargar el repositorio completo es innecesario si solo se necesitan los pesos.
- La licencia Apache 2.0 permite uso comercial, pero la falta de garantías y de documentación de uso desaconseja su despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-merge_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
