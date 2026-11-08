# mradermacher/LFM3-Kali-1.7B-GGUF

## Resumen

LFM3-Kali-1.7B-GGUF es una colección de cuantizaciones estáticas en formato GGUF generadas por el usuario mradermacher a partir del modelo base aheshman/LFM3-Kali-1.7B. Se trata, por tanto, de un artefacto de distribución derivado y no de un modelo entrenado desde cero: el repositorio solo contiene los pesos convertidos y cuantizados, sin model card técnica, sin datos de entrenamiento ni evaluación publicados. El modelo subyacente pertenece a la familia LFM3 de Liquid AI, cuyo miembro de 1.7B se publica también en formato GGUF bajo el identificador LiquidAI/LFM3-1.7B-GGUF.

La relevancia de este repositorio es práctica: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta Q8_0, además de F16 e IQ4_XS) para su ejecución local con llama.cpp, Ollama u otros motores compatibles con GGUF. Esto permite desplegar un modelo de aproximadamente 2 000 millones de parámetros en hardware de consumo, algo coherente con el tutorial de instalación en Windows 11 y Kali Linux encontrado en la búsqueda web.

No obstante, la información disponible es muy limitada: no se especifican licencia, idiomas, arquitectura exacta, longitud de contexto ni resultados de benchmarks. Cualquier dato de ese tipo debe consultarse en el repositorio del modelo base original, no en esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia LFM3 de Liquid AI; arquitectura exacta no especificada en la información proporcionada) |
| Parámetros totales | aproximadamente 1.7B a 2B (según denominación del modelo base y ficha de LiquidAI) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantización estática, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras) empleadas en el modelo base LFM3-Kali-1.7B. La model card de este repositorio se limita a declarar los metadatos de la conversión a GGUF: versión de cuantización 2, salida con tensores cuantizados y tipo de conversión `hf` (a partir de pesos en formato Hugging Face).

Lo único verificable es el proceso de derivación: mradermacher ha tomado los pesos de aheshman/LFM3-Kali-1.7B y los ha convertido a GGUF generando una matriz de cuantizaciones estáticas. El sufijo "Kali" en el nombre sugiere una especialización o ajuste orientado a tareas de seguridad ofensiva o pentesting, pero esta interpretación no está confirmada por ninguna fuente de la información proporcionada y debe tratarse como especulación.

## Capacidades

- Generación de texto: el pipeline declarado en el ecosistema Hugging Face para el modelo base es text-generation.
- Ejecución local: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros motores de inferencia local.
- Cuantización flexible: permite elegir entre 12 variantes de cuantización según el equilibrio deseado entre calidad y uso de memoria.
- Razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en equipos de sobremesa con Windows 11 o Kali Linux: el tutorial encontrado documenta la instalación con Ollama, llama.cpp y Transformers, lo que convierte a este repositorio en la vía práctica para ejecutar el modelo en estaciones de trabajo convencionales.
- Pruebas de concepto de generación de texto en local: útil para validar flujos de inferencia sin depender de APIs externas, usando las variantes Q4_K_M o Q5_K_M como compromiso habitual entre calidad y tamaño.
- Evaluación comparativa de cuantizaciones: al ofrecer desde Q2_K hasta Q8_0, permite medir la degradación de calidad frente al coste de memoria en un mismo modelo.
- Integración en pipelines de llama.cpp: la variante F16 o Q8_0 sirve como referencia de alta fidelidad para tareas donde la pérdida por cuantización no es aceptable.
- Experimentación en entornos con recursos muy limitados: las variantes Q2_K y Q3_K_S reducen el peso del modelo para hardware con poca VRAM o RAM, a costa de calidad.
- Formación y prototipado: un modelo de ~1.7B es manejable para experimentar con ajuste fino ligero o para construir demos interactivas sin infraestructura dedicada.
- Escenarios de seguridad ofensiva (si se confirma la especialización "Kali"): no verificable con la información disponible; requeriría validación previa del comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de ~1.7B en GGUF, las variantes Q4_K_M suelen ocupar del orden de 1 a 1,5 GB y las Q8_0 alrededor de 2 GB, pero estas cifras no están confirmadas en las fuentes proporcionadas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el formato GGUF y el tamaño del modelo hacen plausible su ejecución en GPUs de consumo, aunque no se especifica ningún modelo concreto en la información disponible.
- Opciones de despliegue: llama.cpp, Ollama y Transformers, según el tutorial encontrado; también cualquier motor compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/LFM3-Kali-1.7B-GGUF | ~1.7B–2B | no disponible | no disponible | GGUF | Hugging Face |
| LiquidAI/LFM3-1.7B-GGUF | ~2B (según ficha) | no disponible | no disponible | GGUF | Hugging Face |
| aheshman/LFM3-Kali-1.7B | ~1.7B | no disponible | no disponible | pesos Hugging Face | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base identificadas en la información proporcionada; no se dispone de datos de rendimiento ni de contexto para comparar con alternativas de otras familias.

## Limitaciones y advertencias

- Información insuficiente: no hay model card técnica, licencia, idiomas ni evaluación de calidad en el repositorio.
- Licencia no declarada: la ausencia de licencia explícita impide determinar si el uso comercial está permitido; debe consultarse el repositorio del modelo base.
- Modelo derivado: cualquier problema de sesgo, alucinación o calidad proviene del modelo base aheshman/LFM3-Kali-1.7B, sobre el que este repositorio no aporta garantías.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K_S pueden degradar notablemente la coherencia y la precisión; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Especialización no confirmada: la denominación "Kali" sugiere un ajuste orientado a seguridad ofensiva, pero no está verificada; no debe asumirse ese comportamiento en producción.
- Contexto desconocido: sin longitud de contexto documentada, no es posible planificar casos de uso que dependan de ventanas largas.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-08): conviene verificar la integridad y procedencia de los artefactos antes de usarlos en entornos reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-Kali-1.7B-GGUF
- Modelo base: https://huggingface.co/aheshman/LFM3-Kali-1.7B
- Modelo de referencia de Liquid AI en GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Tutorial de instalación local (Windows 11 y Kali Linux): https://www.logeshwaran.org/2026/11/install-lfm3.1-7b-locally-windows-11-kali-linux.html
