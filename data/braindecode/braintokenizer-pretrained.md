# braindecode/braintokenizer-pretrained

## Resumen

braintokenizer-pretrained es el tokenizador VQ-VAE de señales EEG y MEG del modelo fundacional BrainOmni, publicado en el repositorio de braindecode en formato compatible con la librería `braindecode.models`. No es un modelo de lenguaje: es un tokenizador de señales neurofisiológicas que convierte ventanas de EEG/MEG en secuencias de códigos discretos y las reconstruye, con 6.100.966 parámetros en total.

El modelo original fue desarrollado por el grupo de Q. Xiao y colaboradores (OpenTSLab) y presentado en NeurIPS 2025 (arXiv:2505.18185). La relevancia de esta ficha concreta es que braindecode ha convertido los pesos del release original a su propio formato, verificado con diferencia máxima absoluta de 0.0 en float32 y bfloat16, de modo que pueden cargarse directamente con `BrainTokenizer.from_pretrained(...)` sin depender del código original.

Se trata de un componente de infraestructura más que de un modelo final: su valor está en servir de capa de tokenización para modelos fundacionales de señales cerebrales, para tareas de reconstrucción y para extracción de representaciones en pipelines de investigación con EEG y MEG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VQ-VAE (encoder, cuantizador vectorial residual y decoder) con codificación posicional rotatoria (RoPE) |
| Parametros totales | 6.100.966 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la entrada se define por ventanas temporales a 256 Hz; no se documenta el número de muestras por ventana) |
| Tipos de cuantizacion | no documentado; los pesos convertidos se han validado en float32 y bfloat16 |
| Idiomas soportados | no aplica (procesa señales EEG/MEG, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y `pytorch_model.bin`, con `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un VQ-VAE compuesto por un encoder, un cuantizador vectorial residual (residual VQ) y un decoder. El encoder transforma la señal neurofisiológica en representaciones latentes que el cuantizador discretiza en códigos, y el decoder reconstruye la señal a partir de esos códigos. El modelo utiliza RoPE (rotary position embeddings); durante el preentrenamiento original existía además un predictor de máscara que la conversión de braindecode elimina, ya que solo es necesario para la fase de preentrenamiento y no para el uso del tokenizador. La caché de RoPE se almacena como pares `(cos, sin)` con el seno a cero, replicando fielmente el comportamiento del código liberado por los autores.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens de señal vistos ni si se aplicaron fases de ajuste tipo RLHF o DPO (procedimientos, por otra parte, poco habituales en modelos de señal). La conversión de braindecode, descrita en `convert_brainomni_checkpoints.py`, renombra las claves a la convención de la librería, elimina el predictor de máscara y escribe `config.json`, `model.safetensors` y `pytorch_model.bin` mediante `save_pretrained`. El resultado es numéricamente idéntico al checkpoint original `braintokenizer/BrainTokenizer.pt` (sha256 `d41c44c14c3f3b11fd0fb660752e356dff4cb4bc5f32a05f470f503ffddc7b1a`) de la revisión `9a4d3c70495370397ccfbfd6d2496f25647545a5`.

## Capacidades

- Tokenización discreta de señales EEG y MEG: convierte segmentos de señal en secuencias de códigos latentes mediante el cuantizador vectorial residual.
- Reconstrucción de señal: el decoder regenera la señal a partir de los códigos, lo que permite evaluar la fidelidad de la representación.
- Extracción de representaciones latentes: el encoder puede emplearse como extractor de características para tareas posteriores (clasificación, detección de eventos, decodificación).
- Soporte conjunto de EEG y MEG: el modelo acepta información de canales (`chs_info`) con posiciones de sensores para EEG y orientaciones de bobina para MEG.
- Adaptabilidad de montaje: el `config.json` incluye un valor por defecto de 19 canales EEG (sistema 10-20), pero se puede sobrescribir pasando `chs_info` con la geometría real del montaje.
- Frecuencia de muestreo fija de entrada: 256 Hz, con el preprocesamiento del código original de los autores.
- Integración nativa con braindecode: carga directa mediante `BrainTokenizer.from_pretrained(...)` en versiones superiores a 1.8.1.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Tokenización previa a modelos fundacionales de señal: convertir registros EEG/MEG en secuencias de códigos discretos para alimentar transformers entrenados sobre vocabulario de señal, del mismo modo que un tokenizador de texto alimenta a un LLM.
- Compresión y almacenamiento de registros neurofisiológicos: representar señales largas como índices de código reduce el espacio de almacenamiento y facilita la transmisión en entornos con ancho de banda limitado, a costa de la pérdida controlada por el cuantizador.
- Extracción de características para interfaces cerebro-computador: usar el encoder congelado y entrenar clasificadores ligeros encima para tareas de imaginación motora, detección de potenciales evocados o estados cognitivos.
- Armonización de datos multi-centro: al aceptar `chs_info` con posiciones de sensores, el tokenizador puede aplicarse a montajes heterogéneos y producir representaciones comparables entre cohortes con configuraciones de electrodos distintas.
- Detección de artefactos y control de calidad: el error de reconstrucción por ventana es una señal útil para localizar segmentos anómalos (movimiento ocular, actividad muscular, desconexiones de electrodo) en pipelines automáticos de limpieza.
- Recuperación de segmentos similares: indexar registros por códigos discretos permite búsquedas de vecindad sobre grandes volúmenes de señal sin comparar las formas de onda originales.
- Investigación reproducible en braindecode: incorporar el tokenizador como paso estándar dentro de pipelines de la librería, con pesos en safetensors y carga determinista.
- Fine-tuning de modelos fundacionales BrainOmni: emplear esta versión convertida como punto de partida cuando el resto del pipeline ya está construido sobre braindecode.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la equivalencia numérica entre el checkpoint convertido y el original (diferencia máxima absoluta de 0.0 en float32 y bfloat16), que es una verificación de fidelidad de conversión, no una medida de rendimiento en tareas.

## Requisitos de hardware

- Con 6,1 millones de parámetros, los pesos ocupan aproximadamente 24,4 MB en float32 y 12,2 MB en bfloat16, sin contar la caché de RoPE y los tensores auxiliares del cuantizador.
- Cabe en cualquier GPU de consumo, incluidas tarjetas integradas y modelos de gama baja; también es viable la inferencia en CPU para lotes pequeños.
- GPUs recomendadas: no se especifica ninguna en la documentación; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libres es suficiente (GTX 1050 Ti, RTX 3060, RTX 4090, A100, H100 soportan el modelo sin dificultad).
- El cuello de botella realista no es la VRAM sino el preprocesado de señal a 256 Hz y el coste de convertir grandes volúmenes de registros.
- Opciones de despliegue: carga nativa con braindecode y PyTorch. Los formatos `safetensors` y `pytorch_model.bin` son los distribuidos; no se documenta soporte de GGUF, llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| braindecode/braintokenizer-pretrained | 6.100.966 | safetensors y pytorch_model.bin | MIT | HuggingFace, integrado en braindecode | Conversión verificada del checkpoint original |
| OpenTSLab/BrainOmni (release original) | no disponible en la información proporcionada | `BrainTokenizer.pt` | MIT | HuggingFace | Requiere el código de los autores; el predictor de máscara de preentrenamiento permanece en el archivo |
| Otros tokenizadores o modelos fundacionales de EEG (por ejemplo, aproximaciones basadas en VQ o en enmascaramiento de señal) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de resultados de benchmarks ni de especificaciones de terceros que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- No es un modelo generativo de texto ni un asistente: no admite conversación, tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa en ese sentido es un error de categoría.
- La entrada debe estar a 256 Hz y preprocesada según el código de los autores; desviarse de ese régimen puede degradar la tokenización sin que exista una validación pública al respecto.
- El `chs_info` por defecto del `config.json` corresponde a 19 canales EEG en sistema 10-20. Es un valor de conveniencia: si el montaje real difiere y no se sobrescribe, las posiciones de electrodo serán incorrectas y las representaciones resultantes, poco fiables.
- Para MEG es imprescindible proporcionar orientaciones de bobina en `chs_info`; el valor por defecto no las cubre adecuadamente.
- Requiere una versión de braindecode superior a 1.8.1. Versiones anteriores pueden fallar al cargar o producir resultados distintos.
- La caché de RoPE se almacena con el seno a cero porque el código original usa la caché únicamente con cosenos. Replicar este comportamiento fuera de braindecode exige reproducir esa convención para obtener resultados equivalentes.
- Riesgo de alucinación: no aplica en el sentido habitual. El riesgo análogo es la reconstrucción poco fiel de segmentos fuera de la distribución de entrenamiento, que puede pasar desapercibida si solo se inspeccionan los códigos.
- Sesgos: no documentados. Cualquier sesgo derivado de la composición del dataset de preentrenamiento (población, equipamiento, patologías representadas) es desconocido a partir de la información disponible, y puede afectar a la generalización entre centros y dispositivos.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones copyleft. Se debe conservar el aviso de copyright y citar tanto BrainOmni como braindecode.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no incluye benchmarks de tareas downstream. Para producción conviene validar el rendimiento en el dominio concreto antes de depender de él.
- Al tratarse de datos neurofisiológicos, su uso en contextos clínicos o con sujetos humanos queda sujeto a la normativa aplicable de protección de datos y a la aprobación ética correspondiente, con independencia de la licencia del software.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/braindecode/braintokenizer-pretrained
- Checkpoint original BrainOmni: https://huggingface.co/OpenTSLab/BrainOmni
- Documentación de `BrainTokenizer` en braindecode: https://braindecode.org/stable/generated/braindecode.models.BrainTokenizer.html
- Paper de BrainOmni (NeurIPS 2025): https://arxiv.org/abs/2505.18185
- Referencia de braindecode (Zenodo): https://doi.org/10.5281/zenodo.17699192
