# AdaptiveChunking/pilot_C_s2

## Resumen

pilot_C_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino una ejecución experimental (un "pilot") de un modelo de tipo H-Net de nivel de byte, generado con la herramienta beetle-hnet y entrenado con el denominado legacy trainer (`legacy/tier1/train.py`). El modelo se ha separado del repositorio agrupado `AdaptiveChunking/hnet-chunking-pilots` y se ha reubicado en el diseño por ejecución de Beetle.

El interés del modelo es fundamentalmente metodológico: forma parte de una línea de experimentación sobre chunking dinámico (dynamic-chunking) y tokenización a nivel de byte, no sobre generación de texto de propósito general. Con 22.516.992 parámetros (unos 22,5 millones), pesos en safetensors y licencia Apache 2.0, su relevancia actual es acotada y se limita al estudio de arquitecturas H-Net y estrategias de segmentación adaptativa.

La información pública disponible es escasa: la model card no documenta contexto, idiomas, datos de entrenamiento ni resultados de evaluación, y el repositorio no registra descargas ni interacciones. Cualquier uso en producción requeriría una evaluación propia a partir de los checkpoints y de las sondas FLORES+ publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net de nivel de byte (byte-level), según la model card |
| Parametros totales | 22.516.992 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` por checkpoint |
| Libreria | PyTorch |
| Tamano del repositorio | 0,1 GB |
| Checkpoints | 1 retenido en rama `step-N` (paso 6000) |
| Mapa de pesos atados | incluido en `config.json` (`tied_weights`); restaurar con `sd[dst] = sd[src]` |

## Arquitectura y entrenamiento

La model card identifica el modelo como una ejecución de H-Net de nivel de byte, entrenada mediante el legacy trainer del proyecto beetle-hnet. No se detalla la composición interna de la arquitectura (número de capas, dimensión oculta, mecanismo de atención o de segmentación), ni el número de tokens de entrenamiento, ni si se aplicaron fases de ajuste como RLHF o DPO. Tampoco se especifica el corpus utilizado.

El rasgo técnico destacable es el enfoque de chunking dinámico y tokenización a nivel de byte, que en esta familia de experimentos se orienta a segmentar la secuencia de entrada de forma adaptativa en lugar de depender de un vocabulario BPE fijo. El entrenamiento se realizó con el legacy trainer, que no conservaba estado del optimizador; por eso el repositorio no incluye `training_state/`. Se conserva un único checkpoint retenido (paso 6000) en una rama `step-N`, además de los pesos más recientes en `main` junto con `final.json` y `log.jsonl`. El `config.json` de cada checkpoint contiene la configuración del modelo, la configuración de entrenamiento y el mapa de pesos atados necesario para restaurar correctamente el state dict.

## Capacidades

- Entrenamiento y evaluación de segmentación adaptativa: el modelo sirve como artefacto para estudiar el comportamiento del chunking dinámico sobre entrada a nivel de byte.
- Tokenización de nivel de byte: no depende de un vocabulario subword predefinido, lo que permite procesar cualquier secuencia de bytes.
- Sondas de frontera: el autor publica sondas FLORES+ específicas de esta ejecución en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo `pilot_C_s2/`, para analizar la calidad de las fronteras de segmentación.
- Reproducibilidad experimental: los checkpoints, el `config.json` con el mapa de pesos atados y los registros (`log.jsonl`, `final.json`) permiten reproducir la ejecución.
- Generación de texto conversacional: no documentada.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas (las sondas FLORES+ son un conjunto multilingüe de evaluación, pero no implican capacidad generativa multilingüe demostrada).
- Visión o audio: no disponibles.

## Casos de uso

- Investigación en tokenización adaptativa: usar el checkpoint para analizar cómo el modelo agrupa bytes en unidades de segmentación y comparar el comportamiento con tokenizadores BPE o Unigram en corpus controlados.
- Reproducción de experimentos de H-Net: cargar los pesos con el mapa `tied_weights` del `config.json` y reentrenar o continuar el entrenamiento con el legacy trainer para validar resultados publicados.
- Evaluación de fronteras de chunking: ejecutar las sondas FLORES+ del dataset `hnet-chunking-probes` sobre este checkpoint y medir la precisión de las fronteras detectadas frente a otros pilotos de la misma organización.
- Estudio comparativo de checkpoints: contrastar el checkpoint del paso 6000 con los pesos de `main` para analizar la evolución del entrenamiento a partir de `log.jsonl`.
- Prototipado de pipelines de preprocesado byte-level: integrar el modelo como componente experimental de segmentación previa a un modelo mayor, midiendo el impacto en la longitud efectiva de secuencia.
- Docencia y formación: emplear un modelo de 22,5 millones de parámetros y 0,1 GB como ejemplo manejable de arquitectura H-Net y de gestión de checkpoints en Hugging Face.
- Auditoría de artefactos de investigación: verificar la integridad de los pesos atados y la correspondencia entre `config.json`, `final.json` y los safetensors publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 millones de parámetros en fp32, los pesos ocupan aproximadamente 90 MB; en fp16, unos 45 MB. El consumo real depende de la longitud de secuencia y del estado intermedio del H-Net, que no está documentado.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería ser suficiente para inferencia con lotes pequeños; no se dispone de mediciones específicas para A100, H100 o RTX 4090.
- GPU de consumo: cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060 o superiores, e incluso en entornos con poca VRAM.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y sin pipeline declarado, el despliegue requiere cargar el state dict manualmente aplicando el mapa `tied_weights`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y es improbable que exista sin una arquitectura estándar publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pilot_C_s2 (AdaptiveChunking) | 22,5 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación H-Net byte-level |
| hnet-chunking-pilots (AdaptiveChunking) | no disponible | no disponible | no disponible en la informacion | Hugging Face | Repositorio agrupado del que se extrajo este piloto |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se identifican en la información proporcionada modelos comparables de chunking dinámico byte-level |

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada: no hay benchmarks, métricas de calidad ni validación independiente.
- No está documentado como modelo generativo: no se confirman capacidades de generación de texto, razonamiento, código o matemáticas.
- Idiomas no especificados: se desconoce el comportamiento en castellano u otras lenguas; las sondas FLORES+ son un instrumento de evaluación, no una garantía de cobertura lingüística.
- Longitud de contexto desconocida: impide planificar despliegues con secuencias largas.
- Sin estado del optimizador: el legacy trainer no lo conservaba, por lo que no es posible reanudar el entrenamiento exactamente desde el punto de guardado.
- Restauración manual de pesos: es obligatorio aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) del `config.json`; una carga ingenua del state dict puede producir pesos incorrectos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y sin soporte del autor.
- Riesgo de alucinación: no evaluable, al no existir documentación sobre comportamiento generativo.
- Sesgos: no documentados; al no conocerse el corpus de entrenamiento, no es posible estimar sesgos de dominio o lingüísticos.
- Madurez del artefacto: 0 descargas y 0 interacciones en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_C_s2
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking
- Repositorio agrupado de pilotos: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
