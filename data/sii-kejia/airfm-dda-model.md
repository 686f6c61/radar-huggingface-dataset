# SII-kejia/AirFM-DDA-Model

## Resumen

AirFM-DDA es un modelo fundacional preentrenado para el dominio de las comunicaciones inalámbricas, desarrollado por Kejia Bian y colaboradores (SII-kejia) y publicado junto al artículo *AirFM-DDA: Air-Interface Foundation Model in the Delay-Doppler-Angle Domain for AI-Native 6G*, aceptado en IEEE Transactions on Network Science and Engineering. A diferencia de los modelos de lenguaje, su objetivo no es generar texto, sino servir como representación base del canal radio, operando en el dominio retardo-Doppler-ángulo (DDA), que es el dominio nativo de las señales OFDM y de las formas de onda OTFS propuestas para 6G.

El modelo aborda dos tareas clásicas del procesado físico de la capa radio: la estimación de canal (channel estimation) y la predicción de canal (channel prediction), ofreciendo pesos preentrenados que pueden reutilizarse y adaptarse mediante cabezas específicas (downstream heads) a distintos escenarios. Se distribuye en tres variantes (small, base y large) con 512, 640 y 768 dimensiones de embedding respectivamente, todas con 4 bloques de profundidad 6.

Es relevante ahora porque se enmarca en la línea de "AI-native 6G", donde se busca sustituir bloques de procesado de señal hechos a mano por modelos aprendidos y reutilizables. El repositorio ocupa 5,0 GB y los pesos se publican como state dicts de PyTorch bajo licencia MIT, lo que facilita su uso tanto en investigación como en prototipado comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con codificación en dominio retardo-Doppler-ángulo (DDA); detalles internos no disponibles más allá de embedding dim, cabezas y profundidades |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en precisión nativa PyTorch) |
| Idiomas soportados | no aplica / no disponible (modelo de señales, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pt`); configuraciones en JSON (`models/{small,base,large}.json`) |

Variantes publicadas:

| Fichero | Variante | Dimensión de embedding | Cabezas | Profundidades |
|---|---|---:|---:|---|
| `small.pt` | small | 512 | 4 | 6, 6, 6, 6 |
| `base.pt` | base | 640 | 5 | 6, 6, 6, 6 |
| `large.pt` | large | 768 | 6 | 6, 6, 6, 6 |

## Arquitectura y entrenamiento

La información disponible indica que AirFM-DDA es un modelo basado en transformer que opera sobre representaciones de canal en el dominio retardo-Doppler-ángulo. Las tres variantes comparten una estructura de cuatro etapas con profundidad 6 cada una, diferenciándose en la dimensión de embedding (512, 640 y 768) y en el número de cabezas de atención (4, 5 y 6). No se especifican en la información proporcionada el número total de parámetros, la composición del dataset de entrenamiento, el volumen de tokens o muestras, ni si se emplearon técnicas de ajuste como RLHF o DPO (no aplicables en este dominio, pero no confirmadas).

Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El aspecto diferencial que sí se explicita es el dominio de representación: frente a enfoques que trabajan en tiempo-frecuencia o espacio-espacial, AirFM-DDA modela el canal en retardo, Doppler y ángulo, lo que resulta coherente con formas de onda OTFS y con la necesidad de capturar movilidad y multitrayecto en escenarios 6G. Los detalles completos de entrenamiento deben consultarse en el artículo y en el repositorio de GitHub asociado.

## Capacidades

- Estimación de canal (channel estimation) en el dominio retardo-Doppler-ángulo.
- Predicción de canal (channel prediction), incluyendo evolución temporal del canal.
- Extracción de representaciones reutilizables (embeddings) del estado del canal radio.
- Adaptación mediante cabezas downstream para tareas específicas de la capa física.
- Preentrenamiento como modelo fundacional: permite fine-tuning sobre escenarios o bandas concretas.
- Inferencia en PyTorch, integrable en pipelines de simulación y prototipado.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Estimación de canal en receptores 6G: el modelo puede sustituir estimadores clásicos (LS, MMSE) alimentándose de señales piloto y produciendo una estimación del canal en el dominio DDA, lo que es adecuado en escenarios de alta movilidad donde los estimadores tradicionales degradan.
- Predicción de canal para precodificación: en sistemas MIMO con CSI feedback limitado, el modelo puede predecir la evolución del canal y permitir al transmisor anticipar la precodificación, reduciendo la sobrecarga de feedback.
- Formas de onda OTFS: al operar en retardo-Doppler, encaja de forma natural en receptores OTFS, donde puede integrarse como bloque aprendido de estimación y ecualización.
- Fine-tuning para bandas y escenarios concretos: las tres variantes permiten elegir el compromiso coste/precisión y ajustar con datos de una banda (por ejemplo, mmWave) o de un entorno (urbano, vehicular).
- Investigación en AI-native air interface: sirve como baseline reproducible para comparar arquitecturas aprendidas frente a bloques de procesado tradicionales en publicaciones y tesis.
- Simulación y gemelos digitales de red: las representaciones del canal pueden alimentar simuladores de capa física o gemelos digitales que necesitan modelos de canal realistas y aprendidos.
- Prototipado en laboratorio con SDR: al ser pesos PyTorch ligeros en comparación con LLM, pueden integrarse en cadenas de experimentación con radios definidas por software para validar estimación y predicción en tiempo casi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo (IEEE TNSE, aceptado) y al repositorio de GitHub para datos de evaluación e instrucciones, pero no incluye cifras de métricas como NMSE, BER o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 5,0 GB e incluye las tres variantes, por lo que cada variante individual es sustancialmente menor.
- GPU recomendadas: no especificadas. Dado el tamaño moderado de las variantes (embedding de 512 a 768), es razonable esperar que quepan en GPU de consumo, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: probable pero no confirmado; no hay requisitos publicados.
- Opciones de despliegue: PyTorch nativo; el flujo oficial usa `pip install -e .` y `hf download` desde el repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen líneas de investigación sobre modelos fundacionales de canal radio y estimación aprendida, pero no se aportan nombres, parámetros ni resultados que permitan una comparación rigurosa. Por tanto: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni soporta instrucciones en lenguaje natural; cualquier uso debe ser en el dominio de procesado de señal radio.
- Ausencia de métricas publicadas en la model card: la evaluación debe obtenerse del artículo o del repositorio, lo que dificulta una validación rápida.
- Sesgos de dominio: al entrenarse presumiblemente con ciertos escenarios de canal, puede generalizar mal a bandas, entornos o modelos de movilidad no representados; no se detalla la composición del dataset.
- Riesgo de sobreajuste a configuraciones específicas (número de antenas, subportadoras, velocidad del terminal) no documentadas.
- Sin información sobre robustez ante ruido, interferencia o condiciones no vistas.
- Licencia MIT: permite uso comercial y modificación, pero conviene citar el artículo y revisar las dependencias del repositorio de GitHub.
- Estado del repositorio: 0 descargas y pocas interacciones en Hugging Face en el momento de la consulta; la madurez y el soporte de la comunidad son limitados.
- Fechas de creación y actualización poco habituales en los metadatos; verificar la versión de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SII-kejia/AirFM-DDA-Model
- Repositorio GitHub (código, evaluación y fine-tuning): https://github.com/SII-kejia/AirFM-DDA
- Artículo: Bian, K., Tao, M., Mo, J., Chen, Z., Chen, L. *AirFM-DDA: Air-Interface Foundation Model in the Delay-Doppler-Angle Domain for AI-Native 6G*, IEEE Transactions on Network Science and Engineering, 2026 (aceptado). No se dispone de DOI en la información proporcionada.
