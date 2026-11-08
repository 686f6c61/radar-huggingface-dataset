# Anadilorg/Anadil_Sakha_TTS

## Resumen

AnadilSakhaTTS es un adaptador LoRA de síntesis de voz (text-to-speech) para el idioma sajá (yakuto, ISO 639-3 `sah`), una lengua túrquica hablada en la República de Sajá (Yakutia, Rusia). Lo desarrolla Anadilorg, colectivo que publica adaptadores TTS para lenguas minoritarias y de bajos recursos, y se construye sobre el modelo base openbmb/VoxCPM2 mediante ajuste fino supervisado. Es relevante porque el sajá apenas cuenta con recursos digitales de voz: el modelo ofrece una vía abierta para dotar de síntesis a una lengua con escasa representación tecnológica.

El adaptador se entrenó con 9.360 segmentos de un único hablante procedentes de Mozilla Common Voice 26.0 (`sah`), durante 8.000 pasos, y se distribuye como pesos LoRA de aproximadamente 72 MB (384 tensores, unos 18,1 millones de parámetros en F32) que se cargan sobre VoxCPM2. La síntesis se realiza mediante clonación de voz con un clip de referencia (zero-shot), de modo que el timbre de salida se aproxima al del audio de referencia proporcionado.

El modelo forma parte de la familia "Anadil" de adaptadores para lenguas minoritarias (laz, zazaki, adigué, kurmancí, armenio, ladino, kirguís, uigur y kazajo), y se publica con licencia MIT. No obstante, la información pública es escasa: no hay métricas automáticas de calidad (WER, UTMOS) ni benchmarks comparativos, y los ejemplos publicados corresponden a frases vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=32, α=32) sobre el modelo base openbmb/VoxCPM2; afecta a capas LM y DiT del modelo base |
| Parametros totales | ~18,1 millones de parámetros en el adaptador LoRA (384 tensores, F32); el modelo base VoxCPM2 no se detalla en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se distribuyen en F32; no se documentan variantes cuantizadas) |
| Idiomas soportados | Sajá/yakuto (`sah`); la etiqueta de idioma del repo incluye también `tr` |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA); el modelo base se descarga por separado desde openbmb/VoxCPM2 |
| Frecuencia de muestreo de salida | 48 kHz |
| Tamano del repositorio | ~0,1 GB |
| Datos de entrenamiento | 9.360 segmentos, un solo hablante (`spk_tmp_001`), Mozilla Common Voice 26.0 `sah` |
| Pasos de entrenamiento | 8.000 (último checkpoint guardado) |

## Arquitectura y entrenamiento

El modelo no es una red completa, sino un adaptador LoRA de rango 32 y α=32 aplicado sobre VoxCPM2, un sistema TTS de openbmb cuya arquitectura interna no se detalla en la información disponible. Según la model card, el adaptador modifica capas LM (modelo de lenguaje) y DiT (Diffusion Transformer), lo que sugiere que VoxCPM2 combina un componente autorregresivo o de modelado de texto con un componente generativo de audio basado en difusión. La síntesis se condiciona con un clip de audio de referencia, lo que habilita clonación de voz zero-shot incluso para hablantes distintos del usado en entrenamiento.

El ajuste fino se realizó sobre 9.360 enunciados de un único hablante extraídos de Mozilla Common Voice 26.0 en sajá, durante 8.000 pasos. No se documentan en la información disponible la composición exacta del dataset más allá de esa fuente, el número de tokens de audio procesados, ni si se aplicaron técnicas de alineamiento o preferencia (RLHF/DPO). Tampoco se detallan innovaciones técnicas propias del adaptador; la principal aportación es la adaptación de un modelo TTS multilingüe a una lengua con muy pocos datos, mediante un adaptador de bajo rango y un conjunto de datos pequeño y de un solo hablante.

## Capacidades

- Síntesis de voz en sajá (yakuto) a partir de texto en escritura cirílica.
- Clonación de voz zero-shot mediante un clip de referencia (`reference_wav`), lo que permite aproximar timbres distintos al del hablante de entrenamiento.
- Salida de audio a 48 kHz.
- Control de generación mediante parámetros de inferencia (`cfg_value`, `inference_timesteps`), con valores de ejemplo cfg=2.0 y 10 pasos.
- Interfaz de línea de comandos (`inference.py`) y API de Python (`AnadilSakhaTTS.synthesize`).
- Demo local con Gradio (`demo.py`) en el puerto 7860.
- Scripts de validación (`test_smoke.py`) para comprobar la integridad de los pesos y realizar una síntesis de prueba.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada más allá de la referencia, ni marcado de emociones o estilos.

## Casos de uso

- Accesibilidad y lectura en voz alta en sajá: el modelo puede convertir textos en cirílico sajá en audio inteligible para personas con discapacidad visual o dificultades lectoras, usando un clip de referencia del propio usuario para conservar un timbre familiar.
- Preservación lingüística y archivo sonoro: digitalización de textos y materiales educativos en sajá con una voz sintética consistente, útil para proyectos de documentación de lenguas minoritarias que no disponen de grabaciones suficientes.
- Aprendizaje de la lengua: generación de audio de apoyo para aplicaciones de enseñanza de sajá, con la posibilidad de ajustar el timbre mediante referencias para simular distintos hablantes.
- Locución para contenidos multimedia: producción de narraciones para vídeos, pódcast o audiolibros en sajá a partir de guiones de texto, con la ventaja de que el adaptador es ligero (~72 MB) y se carga sobre un único modelo base.
- Integración en asistentes de voz para comunidades sajá-parlantes: síntesis de respuestas en aplicaciones de atención ciudadana o información local, siempre que se valide la calidad con hablantes nativos antes de producción.
- Investigación en TTS de bajos recursos: el adaptador sirve como punto de partida y referencia metodológica (LoRA sobre VoxCPM2 con datos de Common Voice) para experimentos con otras lenguas túrquicas o siberianas de recursos escasos.
- Pruebas de concepto de clonación de voz: dado que acepta un clip de referencia arbitrario, puede emplearse en prototipos de personalización de voz para aplicaciones educativas o de entretenimiento, con las cautelas éticas y legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han calculado métricas automáticas de calidad (WER, UTMOS u otras) y que los cinco ejemplos de audio publicados corresponden a frases vistas durante el entrenamiento (in-training), por lo que no constituyen una evaluación de generalización.

## Requisitos de hardware

- Memoria recomendada: aproximadamente 9 GB para inferencia en fp32, según la model card.
- GPU: se prefiere CUDA; no se especifican modelos concretos de GPU (A100, H100, RTX 4090, etc.) en la información disponible.
- Apple Silicon: compatible pero más lento que CUDA según la model card.
- GPU de consumo: no se confirma en la información disponible si cabe en GPU de consumo; el requisito de ~9 GB de memoria en fp32 sugiere que tarjetas con 12 GB o más podrían ser suficientes, pero no se documenta oficialmente.
- Despliegue: la librería indicada es `voxcpm`; se documentan scripts de inferencia en Python, una API propia y una demo local con Gradio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Los parámetros de inferencia de ejemplo (`inference_timesteps=10`, `cfg_value=2.0`) permiten ajustar el compromiso calidad/velocidad, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Idioma | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AnadilSakhaTTS | Sajá (`sah`) | LoRA sobre VoxCPM2 | ~18,1 M (adaptador) | No disponible | MIT | Hugging Face |
| Anadil_Kazakh_TTS | Kazajo | LoRA sobre VoxCPM | No disponible en la información | No disponible | MIT | Hugging Face |
| openbmb/VoxCPM2 | Multilingüe (modelo base) | TTS base | No disponible en la información | No disponible | No disponible en la información | Hugging Face |

La información disponible solo permite confirmar la existencia de Anadil_Kazakh_TTS, otro adaptador de la misma familia y mismo autor, con enfoque metodológico equivalente (LoRA sobre VoxCPM, licencia MIT, orientado a una lengua túrquica). No se dispone de datos de rendimiento comparativo entre ambos ni con el modelo base, por lo que la comparativa se limita a aspectos de enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset pequeño: 9.360 segmentos es un volumen reducido en comparación con otros modelos de la familia Anadil, lo que limita la cobertura fonética y la naturalidad fuera de los dominios representados en Common Voice.
- Un solo hablante: el modelo se entrenó sobre el hablante `spk_tmp_001`; la variedad de timbres depende de la clonación zero-shot con audio de referencia, cuya fidelidad no está evaluada.
- Ausencia de métricas: no se han publicado WER, UTMOS ni otras medidas objetivas de calidad, y los ejemplos de audio son frases de entrenamiento, no de validación.
- Riesgo de alucinación acústica y errores de pronunciación: al ser un modelo generativo de audio con datos escasos, puede producir artefactos, entonación incorrecta o pronunciaciones erróneas en textos fuera de dominio.
- Sesgos: al derivarse de Common Voice, puede heredar sesgos de edad, género, registro y procedencia geográfica de los hablantes contribuyentes; no se documenta un análisis de sesgos.
- Limitaciones de idioma: la etiqueta del repositorio incluye `tr` además de `sah`, pero la model card solo describe entrenamiento y evaluación en sajá; no se confirma un rendimiento fiable en turco.
- Licencia: MIT permite uso comercial, pero el modelo base VoxCPM2 puede tener sus propias condiciones que deben verificarse por separado antes de un despliegue comercial.
- Requisitos de memoria: ~9 GB en fp32, lo que puede excluir entornos con GPU de gama baja; no se documentan variantes cuantizadas.
- Uso responsable de clonación de voz: la capacidad de clonación zero-shot exige consentimiento explícito de la persona cuya voz se use como referencia y cumplimiento de la normativa aplicable sobre síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anadilorg/Anadil_Sakha_TTS
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Adaptador relacionado de la familia Anadil (kazajo): https://huggingface.co/Anadilorg/Anadil_Kazakh_TTS
- Mozilla Common Voice: https://commonvoice.mozilla.org/
- Paper de referencia de LoRA (citado en las etiquetas de la familia Anadil): https://arxiv.org/abs/2106.09685
