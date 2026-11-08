# AdaptiveChunking/pilot_Apc_s2

## Resumen

pilot_Apc_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución (run) concreta de un modelo byte-level basado en la arquitectura H-Net, entrenado con el denominado *legacy trainer* (`legacy/tier1/train.py`) del repositorio beetle-hnet. El modelo se ha separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` para adoptar el formato de una ejecución individual dentro del ecosistema Beetle.

Con 22.516.992 parámetros (aproximadamente 22,5 millones), es un modelo de escala muy reducida, pensado para experimentación en tokenización dinámica (*dynamic chunking*) y procesamiento a nivel de byte, no para uso en producción como asistente general. El repositorio ocupa 0,1 GB e incluye un único checkpoint retenido en la rama `step-6000`, además de los pesos más recientes y los ficheros de registro en la rama `main`.

Su relevancia es acotada y de carácter metodológico: sirve como evidencia reproducible de una línea de investigación sobre segmentación adaptativa de secuencias y modelos H-Net a nivel de byte, con licencia Apache 2.0. No dispone de pipeline declarado, idiomas documentados ni resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level), según tags del repositorio (beetle-hnet); detalles internos no disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` por checkpoint |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net en su variante a nivel de byte (*byte-level*), ejecutada mediante el framework beetle-hnet. La model card indica que el entrenamiento se realizó con el *legacy trainer* del repositorio, en la ruta `legacy/tier1/train.py`, y que el checkpoint se ha extraído del paquete `hnet-chunking-pilots` al esquema por ejecución de Beetle. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

Un aspecto técnico destacable es la presencia de un mapa de pesos atados (`tied_weights`) en el `config.json`, que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada al cargar los pesos. El entrenador legacy no conservó estado del optimizador, por lo que no existe directorio `training_state/`. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`, y la rama `step-6000` conserva un único checkpoint intermedio. Se han publicado sondas de frontera (*boundary probes*) sobre FLORES+ en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el subdirectorio `pilot_Apc_s2/`, lo que sugiere que el interés del run reside en evaluar la segmentación o delimitación de unidades lingüísticas más que la generación de texto.

## Capacidades

- Procesamiento de texto a nivel de byte, sin dependencia declarada de un vocabulario de subpalabras.
- Segmentación dinámica (*dynamic chunking*): la línea de investigación del autor apunta a la delimitación adaptativa de secuencias, evaluada mediante sondas de frontera sobre FLORES+.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el uso de sondas FLORES+ sugiere evaluación sobre múltiples idiomas, pero no se especifica el alcance.
- No se documenta ningún modo especial (thinking mode, visión, audio).

## Casos de uso

- Investigación en tokenización adaptativa: el modelo sirve como artefacto reproducible para estudiar cómo un H-Net a nivel de byte agrupa o delimita secuencias, comparando los resultados de las sondas de frontera publicadas en `hnet-chunking-probes`.
- Reproducción de experimentos: al conservar el checkpoint `step-6000` y los registros `log.jsonl` y `final.json`, permite replicar curvas de entrenamiento y validar configuraciones del *legacy trainer* de beetle-hnet.
- Evaluación de segmentación multilingüe: las sondas sobre FLORES+ permiten medir el comportamiento de fronteras en distintos idiomas, útil para comparar estrategias de chunking frente a tokenizadores BPE convencionales.
- Docencia y formación: con 22,5 M de parámetros y 0,1 GB de repositorio, es ligero enough para ejecutarse en portátiles y portátiles con GPU modesta, lo que facilita demostraciones de arquitecturas H-Net en cursos de PLN.
- Punto de partida para fine-tuning experimental: su licencia Apache 2.0 y su tamaño reducido permiten adaptarlo a tareas de clasificación o etiquetado a nivel de byte en entornos de investigación con recursos limitados.
- Auditoría de artefactos de investigación: útil para estudiar prácticas de empaquetado de checkpoints (ramas por step, mapas de pesos atados, ausencia de estado del optimizador) en pipelines de publicación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,5 M de parámetros, aproximadamente 90 MB en fp32 y unos 45 MB en fp16); no se documentan requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier modelo consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: al estar en formato PyTorch/safetensors y depender del código de beetle-hnet, no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El despliegue previsible es mediante carga directa en PyTorch con el código del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pilot_Apc_s2 | 22,5 M | no disponible | Apache 2.0 | Hugging Face (repo de investigación) | Byte-level H-Net, sin benchmarks |
| AdaptativeChunking/hnet-chunking-pilots | no disponible | no disponible | no disponible en la información | Hugging Face | Repositorio empaquetado del que se extrajo este run |
| Modelos byte-level de referencia (p. ej. ByT5) | no disponible en esta ficha | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación con 22,5 M de parámetros: no es adecuado para tareas de generación abierta, razonamiento o asistencia conversacional en producción.
- Ausencia total de benchmarks publicados: no es posible afirmar su calidad en ninguna tarea concreta.
- Sin idiomas documentados ni contexto declarado: se desconoce su comportamiento fuera de las sondas FLORES+ publicadas.
- El entrenador legacy no conservó estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde el checkpoint.
- La carga requiere restaurar manualmente los pesos atados según el mapa `tied_weights` del `config.json`; una carga ingenua puede producir pesos incorrectos.
- Riesgo de alucinación: no evaluable con la información disponible, pero esperable en un modelo de este tamaño si se usa para generación.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no se pueden evaluar sesgos de género, idioma o dominio.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo no está validado para producción y su uso comercial carece de garantías de rendimiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin soporte comunitario documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_Apc_s2
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización en Hugging Face: https://huggingface.co/AdaptiveChunking/models
