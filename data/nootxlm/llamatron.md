# nootxlm/Llamatron

## Resumen

Llamatron es una cuantización GGUF del modelo NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, publicada por el usuario nootxlm. No se trata de un modelo entrenado desde cero, sino de una copia comprimida del checkpoint original de NVIDIA, orientada a ejecución en hardware de consumo mediante llama.cpp. El modelo base es un transformer de tipo Mixture of Experts (MoE) con aproximadamente 31.580 millones de parámetros totales y un contexto declarado de 1.048.576 tokens.

La relevancia de esta ficha radica en que ilustra el flujo de cuantización guiada por matriz de importancia (imatrix) aplicado a un modelo MoE grande, con atención y memoria mantenidas en 8 bits y el resto reducido a 5 y 4 bits. El autor reporta un tamaño de archivo de 18,7 GB frente a los 63 GB del checkpoint en BF16, y una tasa de generación de 5,7 tokens por segundo frente a 0,6 del modelo completo en la misma máquina.

El modelo incorpora un parche de reparación de caché documentado en la discusión 65 del repositorio original de NVIDIA, y el autor afirma que la calidad medida por perplejidad sobre texto retenido es prácticamente idéntica a la de una copia cuantizada sin guía de importancia. Es, por tanto, una opción a considerar para desplegar Nemotron Nano 30B en equipos sin GPU de gran capacidad, asumiendo las limitaciones de una cuantización agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivada de NVIDIA-Nemotron-3-Nano-30B-A3B |
| Parametros totales | 31.577.940.288 |
| Parametros activos | no disponible (el nombre del modelo base indica 3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 1.048.576 tokens (carga verificada por el autor; no se ha ejecutado un benchmark de un millón de tokens) |
| Tipos de cuantizacion | Mezcla de q8_0 (72 tensores), q5_0 (46 tensores) e iq4_nl (46 tensores); guiada por imatrix |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | GGUF (archivo `nemotron-split3b-imatrix.gguf`, 18,7 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, un transformer con arquitectura Mixture of Experts. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de cuantización: primero se aplicó un parche de reparación de caché al checkpoint base y se convirtió a GGUF en precisión completa; después se midió una matriz de importancia sobre un texto de calibración de 71.157 bytes de prosa en inglés, dividido en 38 fragmentos, generando 185 entradas de importancia registradas en los metadatos del archivo (`quantize.imatrix.entries_count`, `quantize.imatrix.chunks_count`).

La receta de redondeo mantiene en 8 bits los tensores que soportan la atención y la memoria del modelo, y aplica redondeo más agresivo al resto, con la matriz de importancia como única variable diferencial respecto a una copia cuantizada convencional. El censo de tensores es idéntico entre ambas copias: 72 en q8_0, 46 en q5_0 y 46 en iq4_nl. El autor reporta que el parche de caché, probado sobre el modelo completo de 63 GB, produjo tokens idénticos y redujo el tiempo de generación un 18,6 %. Una innovación destacable es que esta cuantización consigue que el modelo termine su razonamiento dentro de una ventana estándar de 128 tokens, algo que la copia cuantizada sin guía de importancia no lograba.

## Capacidades

- Generación de texto conversacional y de tipo base, según la etiqueta `text-generation` y el tag `conversational`.
- Razonamiento con modo de pensamiento: el autor describe que el modelo "termina su pensamiento" dentro de una ventana de 128 tokens antes de responder.
- Uso de herramientas (tool calling) a nivel de razonamiento escrito: en la prueba del autor, el modelo dedujo el formato de una herramienta inexistente a partir del formato de archivo y la construyó correctamente. Se trata de una sonda de respuesta escrita, no de ejecución real de herramientas.
- Capacidades multilingües: no disponible; el texto de calibración fue prosa en inglés y no se documentan idiomas soportados.
- Capacidades de visión: no disponibles en esta copia; el autor indica explícitamente que es solo texto y que la inferencia VLM corresponde a un modelo hermano de visión.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructura de inferencia compatible con la API de Hugging Face, aunque no se detalla.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU de gran capacidad: con 18,7 GB y la posibilidad de repartir capas entre GPU y CPU (el autor carga diez capas en una GTX 1650 Max-Q de 4 GiB y el resto en el procesador), el modelo puede ejecutarse en equipos modestos donde el checkpoint BF16 de 63 GB no cabría.
- Asistentes conversacionales de contexto largo: la ventana de 1.048.576 tokens permite mantener historiales de conversación extensos o procesar documentos completos en una sola pasada, aunque el autor advierte que solo se ha verificado la carga, no un benchmark a esa longitud.
- Razonamiento con herramientas en pipelines de agentes: la capacidad observada de inferir y construir herramientas ausentes a partir de formatos de archivo lo hace adecuado para tareas de automatización donde el agente debe adaptarse a interfaces no documentadas.
- Prototipado e investigación en local: al ser una cuantización GGUF ejecutable con llama.cpp, sirve para experimentar con un MoE de 30B en máquinas de desarrollo sin necesidad de infraestructura de datacenter.
- Generación de texto en inglés con requisitos de calidad moderados: la perplejidad medida (4,4819 sobre texto retenido en inglés) es prácticamente idéntica a la de una cuantización convencional del mismo modelo, lo que respalda su uso en tareas de redacción y resumen en ese idioma.
- Evaluación comparativa de técnicas de cuantización: el archivo documenta metadatos de imatrix y un censo de tensores reproducible, lo que lo convierte en un caso de estudio útil para investigadores que comparen recetas de cuantización guiada frente a redondeo plano.

## Benchmarks y rendimiento

| Medida | Llamatron | Referencia | Comentario |
|---|---|---|---|
| Tamano de archivo | 18,7 GB | Nemotron Nano 30B BF16: 63 GB | Ratio aproximado de 3,4x |
| Tasa de respuesta en maquina local | 5,7 tokens/s | Nemotron Nano 30B: 0,6 tokens/s | Ratio de 9,5x, misma maquina y misma forma |
| Pensamiento dentro de ventana de 128 tokens | Termina y responde | Copia cuantizada con parche de cache: se queda a mitad de pensamiento | Prueba cualitativa |
| Perplejidad (texto retenido, 16 fragmentos de 1.024 tokens) | 4,4819 ± 0,11663 | Copia plana del mismo modelo parcheado, 18,7 GB: 4,4778 ± 0,11706 | Ratio de 1,0009, dentro de la incertidumbre |
| Contexto completo | Carga a 1.048.576 tokens | no disponible | Solo verificacion de carga, no benchmark |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el archivo pesa 18,7 GB, por lo que la inferencia completa en GPU requeriría al menos esa cantidad más overhead. El autor ejecuta con reparto parcial: diez capas en una GPU de 4 GiB y la parte de expertos en CPU.
- GPU recomendadas: no disponible en la información proporcionada. El autor cita una GTX 1650 Max-Q de 4 GiB como hardware de prueba, lo que confirma que cabe en GPUs de consumo con descarga a CPU.
- ¿Cabe en GPU de consumo? Sí, con reparto entre GPU y CPU. No se documenta un modelo concreto de GPU de gama alta que lo aloje íntegramente en VRAM.
- Opciones de despliegue: llama.cpp (formato GGUF, tag `llama-cpp`), y por extensión herramientas compatibles como Ollama o interfaces basadas en llama.cpp. No se mencionan vLLM ni TGI, que no soportan GGUF de forma nativa.
- Latencia y throughput: 5,7 tokens por segundo en la máquina del autor (GTX 1650 Max-Q más dos portátiles con casi 4 GB), frente a 0,6 tokens por segundo del modelo BF16 en el mismo equipo. No se dispone de cifras en hardware de datacenter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llamatron (esta ficha) | 31.577.940.288 | 1.048.576 | GGUF, 18,7 GB | nvidia-nemotron-open-model-license | Cuantizacion imatrix con parche de cache |
| NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31.577.940.288 | 1.048.576 | BF16, 63 GB | nvidia-nemotron-open-model-license | Modelo original sin cuantizar |
| Copia cuantizada plana del mismo modelo | 31.577.940.288 | 1.048.576 | GGUF, 18,7 GB | nvidia-nemotron-open-model-license | Misma receta sin guia de importancia; no termina el pensamiento en 128 tokens |
| Copia de 3 bits del mismo modelo | no disponible | no disponible | GGUF, 14,7 GB | no disponible | Mencionada por el autor como alternativa mas pequena |

No se dispone de datos sobre otros modelos de la misma categoría (MoE de aproximadamente 30B) en la información proporcionada.

## Limitaciones y advertencias

- La licencia nvidia-nemotron-open-model-license es una licencia propia de NVIDIA; es necesario revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de una licencia open source estándar.
- La cuantización a 4 y 5 bits introduce pérdida de precisión, aunque la perplejidad medida sea prácticamente idéntica a la de una copia plana; el autor reconoce que la calidad no se ha evaluado con benchmarks de tareas (razonamiento, código, matemáticas).
- El contexto de 1.048.576 tokens solo se ha verificado como carga, no como ejecución real a esa longitud; el rendimiento y la calidad en ventanas muy largas no están medidos.
- El texto de calibración fue prosa en inglés, lo que puede sesgar la cuantización hacia ese idioma; no se documentan idiomas soportados ni calidad multilingüe.
- El modelo puede alucinar: en la prueba del autor, el Nemotron con parche de caché "inventó" el diseño de una herramienta inexistente, mientras que Llamatron acertó; esto indica que el comportamiento ante herramientas ausentes es variable y no garantizado.
- Es una copia solo de texto; no soporta visión ni audio, y el autor remite a un modelo hermano para VLM.
- El autor declara que el trabajo lo realizó una sola persona con hardware modesto (GTX 1650 Max-Q y dos portátiles de casi 4 GB), lo que limita la validación independiente de las cifras reportadas.
- No se han publicado resultados en benchmarks estándar, por lo que la comparación con otros modelos de la misma categoría carece de base cuantitativa más allá de la perplejidad.

## Enlaces

- Hugging Face: https://huggingface.co/nootxlm/Llamatron
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Discusión del parche de caché: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16/discussions/65
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Repositorio de llama.cpp (herramienta de cuantización e inferencia): no disponible en la información proporcionada.
