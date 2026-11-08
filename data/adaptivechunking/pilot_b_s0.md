# AdaptiveChunking/pilot_B_s0

## Resumen

`AdaptiveChunking/pilot_B_s0` es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. No se trata de un modelo conversacional al uso, sino de una ejecución experimental (un "pilot") de una arquitectura H-Net a nivel de byte, entrenada con el repositorio `beetle-hnet` mediante su entrenador heredado (`legacy/tier1/train.py`). El modelo se ha separado del repositorio empaquetado `hnet-chunking-pilots` para adoptar el diseño por ejecución de Beetle.

El interés del modelo radica en su enfoque de tokenización dinámica por chunks sobre bytes, una línea de investigación que busca eliminar la dependencia de tokenizadores BPE fijos. Con 22.516.992 parámetros (unos 22,5 millones), es un modelo pequeño pensado para validar hipótesis sobre segmentación adaptativa, no para producción. La model card menciona pruebas de frontera sobre FLORES+ para esta ejecución.

La relevancia es limitada fuera del ámbito de investigación: se publica bajo licencia Apache 2.0, sin métricas de rendimiento declaradas y con cero descargas en el momento de la consulta. Es útil como artefacto reproducible para quienes estudian tokenización a nivel de byte y chunking dinámico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (byte-level), con chunking dinámico |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), configuracion en `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en su variante de byte-level, implementada en el repositorio `beetle-hnet`. La característica diferencial es el chunking dinámico: en lugar de un tokenizador estático, el modelo opera sobre bytes y agrupa la secuencia en chunks de forma adaptativa. La model card no detalla la profundidad, el número de cabezas ni el mecanismo exacto de atención, por lo que estos datos no están disponibles.

El entrenamiento se realizó con el entrenador heredado (`legacy/tier1/train.py`) del proyecto. Se conserva un único checkpoint retenido en la rama `step-N` (paso 6000), con `model.safetensors` y `config.json`, que incluye la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights` (los pesos compartidos deben restaurarse aplicando `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El entrenador no guardó estado del optimizador, por lo que no existe directorio `training_state/`. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Modelo de investigación orientado a tokenización a nivel de byte y chunking dinámico.
- Generación de texto: no confirmada en la información disponible; el artefacto se publica como pesos de un pilot de entrenamiento, sin pipeline declarado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la model card menciona pruebas de frontera sobre FLORES+, pero no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de chunking dinámico: cargar el checkpoint del paso 6000 y el `config.json` para replicar la ejecución `pilot_B_s0` y comparar la segmentación adaptativa frente a tokenizadores BPE convencionales.
- Investigación en tokenización byte-level: usar el modelo como base para estudiar cómo el chunking dinámico afecta a la longitud efectiva de contexto y al coste computacional en secuencias largas.
- Evaluación de fronteras lingüísticas: emplear las pruebas de frontera de FLORES+ incluidas en `AdaptiveChunking/hnet-chunking-probes` (subcarpeta `pilot_B_s0/`) para medir la calidad de los límites de chunk en distintos idiomas.
- Análisis de pesos atados: estudiar el mapa `tied_weights` del `config.json` para entender qué capas comparten parámetros en la arquitectura H-Net y cómo afecta a la inicialización y al ajuste fino.
- Base para ajuste fino experimental: partir de los 22,5 millones de parámetros para probar variantes de la arquitectura en entornos con recursos muy limitados (una sola GPU consumer).
- Docencia y divulgación: usar un modelo pequeño y reproducible para explicar en clase o en un blog cómo funciona el chunking dinámico sobre bytes y cómo se estructura un repositorio de pesos por ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 millones de parámetros en fp32, los pesos ocupan aproximadamente 90 MB; en bf16, unos 45 MB. La VRAM real dependerá de la longitud de secuencia y del mecanismo de chunking, no especificados.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para cargar los pesos; no se dispone de datos de rendimiento para recomendar modelos concretos (A100, H100, RTX 4090).
- Cabe en GPU consumer: sí, por tamaño de pesos; cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) dispone de VRAM suficiente.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y sin pipeline declarado, la carga requeriría código propio del repositorio `beetle-hnet`. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado ni métricas publicadas; no debe tratarse como un modelo listo para producción.
- No se declaran idiomas soportados, a pesar de la mención a FLORES+ en la model card.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento en dominios específicos.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad hace desaconsejable su uso en aplicaciones reales sin validación previa.
- El entrenador heredado no conservó estado del optimizador; reanudar el entrenamiento desde el checkpoint requerirá reinicializar el optimizador.
- Los pesos atados deben restaurarse siguiendo el mapa `tied_weights` del `config.json`; ignorarlo puede producir una carga incorrecta del modelo.
- El repositorio tiene un tamaño de 0,1 GB y cero descargas, lo que sugiere un artefacto reciente y sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_B_s0
- Repositorio empaquetado de pilots: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de pruebas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Repositorio de código `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
