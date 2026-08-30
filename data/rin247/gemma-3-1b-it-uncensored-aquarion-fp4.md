# Rin247/gemma-3-1b-it-Uncensored-Aquarion-FP4

## Resumen

Este modelo es una cuantización FP4 weight-only del modelo `gemma-3-1b-it` de Google, modificada mediante una técnica de abliteración (eliminación de la dirección de rechazo) para eliminar las restricciones de contenido impuestas durante el entrenamiento. Fue creado por el usuario Rin247 como parte de un proyecto denominado "Genesis of Aquarion". El resultado es un modelo de 651 millones de parámetros que ocupa aproximadamente 1 GB en disco, diseñado para ejecutarse en entornos con recursos limitados y sin censura en las respuestas.

La relevancia de este modelo reside en su doble vertiente: por un lado, demuestra la viabilidad de aplicar cuantización FP4 sobre modelos pequeños manteniendo un tamaño reducido; por otro, ejemplifica la creciente tendencia a generar variantes "uncensored" de modelos open source mediante técnicas de intervención en pesos. Sin embargo, hay que señalar que la cuantización FP4 y la abliteración degradan la calidad de las respuestas y eliminan las salvaguardas de seguridad, por lo que su uso debe limitarse a entornos de experimentación controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en `gemma-3-1b-it`) |
| Parametros totales | 651.005.056 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (segun el informe tecnico de Gemma 3) |
| Tipos de cuantizacion | FP4 weight-only (RTN) |
| Idiomas soportados | No especificado en la ficha; el modelo base Gemma 3 cubre multiples idiomas |
| Licencia | No disponible (el modelo base usa la licencia Gemma de Google) |
| Formato de pesos | safetensors (con buffers de escala y forma) |

## Arquitectura y entrenamiento

El modelo base `gemma-3-1b-it` pertenece a la familia Gemma 3 de Google, una coleccion de modelos ligeros de entre 1 y 27 mil millones de parametros, con capacidades multimodales (vision y texto) y una ventana de contexto de al menos 128K tokens. Segun el informe tecnico, la arquitectura introduce cambios para reducir la memoria de la cache KV, lo que resulta critico en contextos largos. La version de 1B es un transformer denso optimizado para inferencia eficiente en hardware modesto.

Sobre esta base, el autor aplico dos modificaciones. Primero, una abliteracion mediante proyeccion ortogonal de la direccion de rechazo (refusal direction), una tecnica que identifica y elimina la componente de los pesos asociada al comportamiento de negarse a responder. Segundo, una cuantizacion FP4 weight-only usando PyTorch RTN (Round-to-Nearest) ejecutada en CPU, con escalas almacenadas junto a los pesos. El resultado es un modelo que conserva la estructura del original pero con pesos de 4 bits, lo que reduce el tamaño a aproximadamente la mitad de una cuantizacion FP8.

## Capacidades

- Generacion de texto libre sin restricciones de contenido gracias a la abliteracion (responde a peticiones que el modelo base rechazaria).
- Razonamiento basico y generacion de codigo, heredados del modelo base, aunque degradados por la cuantizacion FP4.
- Capacidad multimodal de vision (procesamiento de imagenes) del modelo base, presumiblemente conservada aunque no se ha verificado en esta variante.
- Soporte de tool calling y function calling, segun las capacidades del modelo base.
- Capacidades multilingues, aunque sin especificacion concreta en la ficha.
- Sin modo de "thinking" explicito ni soporte de audio.

## Casos de uso

- Experimentacion con modelos abliterados: investigadores y desarrolladores interesados en estudiar el comportamiento de modelos sin censura pueden usar esta variante para analizar diferencias de output respecto al modelo base.
- Prototipado rapido en entornos sin GPU: gracias a su tamaño reducido (1 GB), puede ejecutarse en CPU o GPUs con poca VRAM, ideal para pruebas locales de generacion de texto.
- Generacion de contenido creativo sin restricciones: escritores o creadores que necesiten explorar temas sensibles sin filtros pueden usarlo como herramienta de brainstorming, asumiendo la baja calidad de las respuestas.
- Educacion sobre cuantizacion y abliteracion: sirve como ejemplo practico para entender como la cuantizacion FP4 afecta al rendimiento y como la proyeccion ortogonal modifica el comportamiento del modelo.
- Despliegue en dispositivos edge: su tamaño permite ejecutarlo en Raspberry Pi o moviles de gama alta, aunque con latencia elevada y respuestas de calidad limitada.
- Analisis de sesgos en modelos pequeños: al eliminar la direccion de rechazo, se pueden estudiar sesgos latentes que el entrenamiento con RLHF habia enmascarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval o GSM8K para esta variante cuantizada y abliterada. El modelo base `gemma-3-1b-it` tiene resultados publicados en el informe tecnico de Gemma 3, pero esta modificacion no los hereda directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 y 2 GB, dado que los pesos FP4 ocupan aproximadamente 325 MB (651M parametros × 0.5 bytes) mas overhead de escalas, activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, etc.). Tambien puede ejecutarse en CPU con 4-6 GB de RAM, aunque con mayor latencia.
- En consumer GPU: si, cabe en GPUs de gama de entrada y en la mayoria de portatiles con GPU integrada.
- Opciones de despliegue: al ser un formato safetensors con cuantizacion custom, requiere un motor de inferencia que soporte la dequantizacion mediante los buffers `*.weight_scale` y `*.weight_shape`. No es compatible directamente con vLLM, llama.cpp u Ollama sin adaptaciones. El autor menciona "recetas weight-only personalizadas", lo que implica que el usuario debe implementar la logica de carga.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 1B cuantizado, se estiman velocidades de 20-40 tokens/s en GPU moderna y 5-10 tokens/s en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Abliterado |
|---|---|---|---|---|---|
| Rin247/gemma-3-1b-it-Uncensored-Aquarion-FP4 | 651M | FP4 weight-only | 128K | No disponible | Si |
| DavidAU/gemma-3-1b-it-heretic-extreme-uncensored-abliterated | 651M (estimado) | No especificada | 128K (estimado) | No disponible | Si |
| google/gemma-3-1b-it (base) | 651M | No cuantizado (BF16) | 128K | Gemma license | No |

La comparativa se limita a aspectos estructurales porque no hay datos de rendimiento publicados para las variantes abliteradas. El modelo de DavidAU es otra version uncensored del mismo base, pero sin cuantizacion FP4, por lo que probablemente mantiene mejor calidad. El modelo base de Google es la referencia original con licencia oficial.

## Limitaciones y advertencias

- La cuantizacion FP4 degrada significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo, matematicas y generacion de codigo. No es adecuado para uso en produccion.
- La abliteracion elimina las salvaguardas de seguridad. El modelo puede generar contenido ofensivo, sesgado, ilegal o peligroso sin filtro alguno. Usar con extrema precaucion.
- La licencia no esta especificada. El modelo base usa la licencia Gemma de Google, que impone restricciones de uso comercial y de redistribucion. Esta derivada podria no cumplir dichas restricciones, por lo que su uso comercial es arriesgado.
- No se han publicado benchmarks ni evaluaciones de sesgo. Se desconoce el impacto real de la cuantizacion en las capacidades del modelo.
- El formato de pesos es custom (FP4 con escalas separadas). No hay soporte oficial en los principales motores de inferencia, lo que complica el despliegue.
- El modelo tiene solo 651M parametros, por lo que su rendimiento es limitado incluso sin cuantizacion. No es competente en tareas que requieren conocimiento extenso o razonamiento profundo.
- Al ser una version "uncensored", puede reproducir estereotipos dañinos o contenido que el entrenamiento original habia mitigado parcialmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/gemma-3-1b-it-Uncensored-Aquarion-FP4
- Modelo base de Google: https://huggingface.co/google/gemma-3-1b-it
- Informe tecnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Version similar abliterada de DavidAU: https://huggingface.co/DavidAU/gemma-3-1b-it-heretic-extreme-uncensored-abliterated
- Tutorial de despliegue local de modelos Gemma uncensored: https://aiindigo.com/tutorials/getting-started-with-gemma-3-1b-it-glm-4-7-flash-heretic-uncensored-thinking-run
