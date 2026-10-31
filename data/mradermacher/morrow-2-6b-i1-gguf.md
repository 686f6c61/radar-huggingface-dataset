# mradermacher/Morrow-2.6B-i1-GGUF

## Resumen

Morrow-2.6B-i1-GGUF es una colección de cuantizaciones en formato GGUF con matriz de importancia (imatrix) del modelo Morrow-2.6B, publicado por el cuantizador conocido mradermacher. El modelo base es Morrow-2.6B, desarrollado por Noumenon Labs, un modelo conversacional de aproximadamente 2,6 mil millones de parámetros basado en la arquitectura LFM2 (Liquid Foundation Models 2), optimizado para diálogo multi-turno en inglés.

Este repositorio no es un modelo nuevo en sí mismo, sino una re-distribución cuantizada que permite ejecutar el modelo en hardware modesto: los archivos van desde unos 0,7 GB (IQ1_S) hasta 2,2 GB (Q6_K), lo que lo hace viable incluso en portátiles sin GPU dedicada. Es relevante para desarrolladores que buscan un modelo de diálogo ligero para despliegues locales con llama.cpp, Ollama o LM Studio.

La disponibilidad de más de veinte variantes de cuantización permite ajustar el equilibrio entre calidad, tamaño y velocidad según las restricciones de cada dispositivo, algo especialmente útil en entornos edge y móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Models 2) |
| Parametros totales | 2.569.272.320 (~2,57 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (heredada del modelo base, consultar noumenon-labs/Morrow-2.6B) |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, Morrow-2.6B de Noumenon Labs, emplea la arquitectura LFM2, una familia de modelos híbridos que combina capas de atención convencional con capas convolucionales/gated lineales, diseñada para ofrecer inferencia eficiente en dispositivos con recursos limitados. Los tags del repositorio lo describen como conversacional y orientado a diálogo multi-turno.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada. Tampoco se detalla la longitud de contexto del modelo base.

En cuanto al trabajo de mradermacher, este repositorio ofrece cuantizaciones ponderadas con imatrix (matriz de importancia calculada sobre un corpus de calibración), que generalmente preservan mejor la calidad que las cuantizaciones estáticas a igual tamaño de archivo. Existe también una versión de cuantizaciones estáticas en mradermacher/Morrow-2.6B-GGUF. Según el autor, las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar.

## Capacidades

- Generación de texto conversacional optimizada para diálogos multi-turno.
- Mantenimiento de coherencia en conversaciones largas (tag multi-turn y dialogue del modelo base).
- Soporte en inglés; no se declara soporte multilingüe.
- Ejecución eficiente en CPU gracias al formato GGUF y a la arquitectura LFM2.
- Compatibilidad con el ecosistema llama.cpp y derivados (Ollama, LM Studio).
- No hay información disponible sobre tool calling, capacidades de agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Chatbots locales de diálogo multi-turno: el modelo está etiquetado específicamente para conversación multi-turno, adecuado para asistentes que mantienen el contexto a lo largo de una sesión sin depender de la nube.
- Asistentes integrados en aplicaciones de escritorio: con cuantizaciones de 1,5-2,2 GB (IQ4_XS a Q6_K) cabe cómodamente en la RAM de un portátil estándar, permitiendo experiencias de chat privadas y sin conexión.
- Despliegues en dispositivos edge y embebidos: las variantes IQ1_S e IQ2 (0,7-1,0 GB) permiten ejecutar el modelo en hardware muy limitado, como SBCs tipo Raspberry Pi, aceptando una pérdida de calidad notable.
- Prototipado rápido de agentes conversacionales: el bajo coste de inferencia permite iterar rápidamente en pipelines de diálogo antes de escalar a modelos mayores.
- Servicios de chat con privacidad de datos: al ejecutarse localmente, ninguna conversación sale del dispositivo, útil en entornos sanitarios o legales con requisitos de confidencialidad.
- Generación de archivos de cuantización personalizados: el archivo imatrix de 0,1 GB incluido permite a terceros crear sus propias cuantizaciones ajustadas a sus necesidades.
- Backends de demostración y pruebas A/B: el amplio rango de cuantizaciones facilita comparar la degradación de calidad frente al consumo de recursos en escenarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,7 GB (IQ1_S) hasta ~2,2 GB (Q6_K) solo de pesos; añadir margen para el KV cache según la longitud de contexto. En formato FP16, el modelo base ocupa unos 5,1 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU con 4 GB de VRAM (por ejemplo RTX 3050 o superior) ejecuta sin problemas las cuantizaciones Q4-Q6 con aceleración parcial o total.
- Consumer GPUs: cabe sobradamente en GPUs de gama baja y media; también funciona íntegramente en CPU gracias a llama.cpp, siendo viable en portátiles con 8 GB de RAM usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No está orientado a vLLM o TGI, que requieren pesos HF completos (disponibles en el repositorio del modelo base).
- Latencia y throughput: no disponibles; dada la arquitectura LFM2 y el tamaño de 2,6 B, se espera inferencia fluida en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Morrow-2.6B (este, cuantizado) | ~2,57 B | LFM2 (hibrida) | GGUF (24 cuants imatrix) | other | Dialogo multi-turno, enfoque edge |
| LFM2-1.2B (Liquid AI) | ~1,2 B | LFM2 (hibrida) | safetensors, GGUF comunitario | Licencia Liquid AI abierta | Misma familia, menor tamano, contexto 32k |
| Qwen2.5-3B-Instruct | ~3 B | Transformer denso | safetensors, GGUF comunitario | Qwen (uso comercial permitido con condiciones) | Multilingue (29+ idiomas), 32k contexto, mejor documentacion de benchmarks |
| Gemma 2 2B IT | ~2,6 B | Transformer denso | safetensors, GGUF comunitario | Gemma | Multilingue, 8k contexto, benchmarks publicados |

Nota: Morrow-2.6B se diferencia por su arquitectura híbrida LFM2 orientada a eficiencia, pero carece de benchmarks públicos y de soporte multilingüe declarado, a diferencia de las alternativas.

## Limitaciones y advertencias

- Soporte limitado al inglés; no es adecuado para aplicaciones en castellano sin validación previa.
- No hay benchmarks publicados, por lo que su calidad relativa frente a Qwen2.5-3B o Gemma 2 2B no puede verificarse objetivamente.
- Las cuantizaciones extremas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las marca como "para desesperados". Se recomienda Q4_K_M como equilibrio.
- Riesgo de alucinación típico de modelos conversacionales pequeños; no debe usarse como fuente de verdad factual sin supervisión.
- Licencia "other": hay que revisar los términos en el repositorio del modelo base (noumenon-labs/Morrow-2.6B) antes de cualquier uso comercial, ya que pueden existir restricciones.
- No hay información sobre tool calling, agentes ni capacidades multimodales; asumir que son inexistentes.
- La longitud de contexto no está documentada en esta ficha; consultar el modelo base antes de diseñar aplicaciones con conversaciones muy largas.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/Morrow-2.6B-i1-GGUF
- Modelo base: https://huggingface.co/noumenon-labs/Morrow-2.6B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Morrow-2.6B-GGUF
- Pagina de descarga resumida: https://hf.tst.eu/model#Morrow-2.6B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
