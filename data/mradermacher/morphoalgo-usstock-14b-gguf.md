# mradermacher/morphoalgo-usstock-14b-GGUF

## Resumen

`mradermacher/morphoalgo-usstock-14b-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo `bluemorpholimited/morphoalgo-usstock-14b`, publicado por Blue Morpho Limited. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del checkpoint original a múltiples niveles de precisión (desde F16 hasta Q2_K), pensada para su ejecución local con llama.cpp, Ollama, LM Studio u otros motores compatibles con GGUF.

El checkpoint de origen cuenta con 14.768.307.200 parámetros (aproximadamente 14,77 mil millones), lo que lo sitúa en la categoría de modelos densos de ~14B. El nombre del modelo sugiere un ajuste orientado a datos bursátiles estadounidenses ("usstock"), y la etiqueta `conversational` indica que está pensado para diálogo. La model card publicada en el repositorio es mínima: únicamente indica que son cuantizaciones estáticas del modelo base, sin detallar arquitectura, datos de entrenamiento, licencia ni idiomas.

La relevancia de esta ficha es práctica: permite saber qué nivel de cuantización elegir, qué hardware hace falta y qué se puede esperar, pero también deja constancia explícita de la gran cantidad de información ausente (licencia, contexto, benchmarks, idiomas), algo crítico antes de plantear un uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la información proporcionada; el recuento de parámetros del modelo base corresponde a un transformer denso de ~14,77B) |
| Parámetros totales | 14.768.307.200 (~14,77B) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (solo consta la etiqueta `conversational`; no hay lista oficial de idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (múltiples ficheros de cuantización estática) |
| Modelo base | bluemorpholimited/morphoalgo-usstock-14b |
| Tamaño del repositorio | 83,3 GB |
| Etiquetas declaradas | gguf, endpoints_compatible, region:us, conversational |
| Fecha de creación | 14 de septiembre de 2026 |
| Última actualización | 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original: la model card del repositorio GGUF se limita a indicar "static quants of https://huggingface.co/bluemorpholimited/morphoalgo-usstock-14b", sin detallar si se trata de un transformer denso clásico, una variante con atención lineal, un modelo híbrido o cualquier otra innovación. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO.

Lo único verificable a nivel técnico es el recuento de parámetros del checkpoint base (14.768.307.200) y el proceso aplicado por mradermacher: conversión a GGUF mediante herramientas tipo `convert_hf_to_gguf.py` con `quantize_version: 2` y `output_tensor_quantised: 1`, seguida de una batería de cuantizaciones estáticas. El pipeline de cuantización no aplica ningún entrenamiento adicional: reproduce los pesos del modelo original con distinta precisión.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` es la única capacidad declarada explícitamente por el autor del repositorio.
- Conversación multi-turno: al ser un modelo de la familia de instrucciones/conversacionales, se espera soporte de diálogo, aunque no hay documentación que lo confirme.
- Dominio financiero/bursátil estadounidense: el nombre `morphoalgo-usstock` apunta a un ajuste sobre datos de mercado de EE. UU., pero no hay model card que lo verifique.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia compatible con la API de Hugging Face.
- Razonamiento, código, matemáticas, visión, audio, tool calling, function calling y modo de pensamiento: no disponible; no hay ninguna referencia a estas capacidades en la información proporcionada.
- Capacidades multilingües: no disponible; no se publica lista de idiomas.

## Casos de uso

Nota: los escenarios siguientes se derivan del nombre del modelo, de la etiqueta `conversational` y del formato GGUF. No existe model card del autor original que los confirme, por lo que deben validarse empíricamente antes de cualquier uso real.

- Análisis de resultados financieros: dado el nombre `usstock`, el modelo podría emplearse para resumir informes trimestrales (10-K, 10-Q) y extraer métricas clave; el formato GGUF permite ejecutarlo en local sin enviar datos sensibles a terceros.
- Asistente conversacional de mercados: un chatbot que resuelva preguntas sobre empresas cotizadas estadounidenses, siempre que se le inyecte contexto financiero actualizado mediante RAG, ya que no se conoce su ventana de contexto ni su fecha de corte de conocimiento.
- Chatbot de atención al cliente en el sector financiero: con un modelo de 14,77B servido en GGUF se puede desplegar un asistente multi-turno en hardware de una sola GPU o incluso CPU, reduciendo el coste frente a APIs comerciales.
- Prototipado y evaluación interna: sus 12 niveles de cuantización permiten comparar rápidamente el equilibrio calidad/VRAM (por ejemplo, Q4_K_M frente a Q8_0) antes de comprometerse con una infraestructura definitiva.
- Análisis de carteras asistido por lenguaje natural: generar explicaciones textuales de la composición de una cartera o de la evolución de un índice, integrándolo en un notebook o herramienta interna de análisis.
- Generación de resúmenes de noticias financieras: alimentar titulares y artículos de prensa económica para producir resúmenes diarios personalizados por sector o por ticker.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp u Ollama, permite procesar conversaciones y documentos financieros sin salida de datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni el repositorio GGUF ni la información del modelo base incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación. Tampoco se ofrece comparación con modelos de referencia.

## Requisitos de hardware

Estimaciones calculadas a partir de los 14.768.307.200 parámetros del modelo base, asumiendo pesos en GPU y una ventana de contexto moderada (los valores reales dependen del contexto configurado, del tamaño de la caché KV y del motor de inferencia):

| Cuantización | Peso aproximado | VRAM estimada con contexto |
|---|---|---|
| F16 | ~29,5 GB | ~32-34 GB |
| Q8_0 | ~15,7 GB | ~18-20 GB |
| Q6_K | ~12,2 GB | ~14-16 GB |
| Q5_K_M | ~10,5 GB | ~12-14 GB |
| Q4_K_M | ~9,0 GB | ~11-12 GB |
| IQ4_XS | ~8,1 GB | ~10-11 GB |
| Q3_K_M | ~7,4 GB | ~9-10 GB |
| Q2_K | ~5,6 GB | ~7-8 GB |

- GPU profesionales recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB; cualquiera de ellas ejecuta sin problema las cuantizaciones altas (F16, Q8_0).
- GPU de consumo: una RTX 4090 (24 GB) ejecuta con holgura Q8_0 y todas las cuantizaciones inferiores; una RTX 4080 o 3090 (16 GB) permite Q6_K y Q5_K_M con margen ajustado; una RTX 4060 Ti de 16 GB o 3080 de 12 GB cubren Q4_K_M y Q3_K_M.
- Equipos con 8 GB de VRAM: viables con Q2_K o Q3_K_S, con pérdida notable de calidad esperable.
- Ejecución en CPU: las cuantizaciones Q4_K_M y Q3_K_M son manejables en CPU con 16-32 GB de RAM, aunque con throughput bajo (estimación: pocos tokens por segundo, muy dependiente del hardware; no hay datos medidos disponibles).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp. Para vLLM o TGI el soporte de GGUF es limitado o nulo, por lo que en esos motores conviene usar los pesos originales en safetensors.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia de primera respuesta.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento del modelo evaluado, por lo que la comparación se limita al plano de especificaciones. Los datos de los modelos alternativos son referencias públicas externas y no se han verificado contra la documentación de este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF disponible | Benchmarks comparables |
|---|---|---|---|---|---|
| morphoalgo-usstock-14b (este modelo) | ~14,77B | no disponible | no disponible | Sí (12 cuantizaciones) | no disponible |
| Qwen2.5-14B-Instruct | ~14,7B | 32.768 tokens nativos | Apache 2.0 | Sí, múltiples repositorios | públicos, no aplicables a este modelo |
| Phi-4 (14B) | ~14,7B | 16.384 tokens | MIT | Sí | públicos, no aplicables a este modelo |
| Llama 3.1 8B Instruct | ~8B | 131.072 tokens | Llama 3.1 Community License | Sí | públicos, no aplicables a este modelo |

La comparación directa de calidad no es posible: sin benchmarks publicados ni model card del modelo base, no hay base para afirmar que este ajuste supere o iguale a las alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, arquitectura, licencia ni idiomas. Esto impide evaluar su idoneidad para producción.
- Licencia no especificada: sin licencia explícita no se puede asumir permiso de uso comercial. Es imprescindible contactar con Blue Morpho Limited antes de cualquier despliegue comercial.
- Riesgo de alucinación: no hay información sobre el proceso de alineación (RLHF, DPO) ni evaluaciones de veracidad. En un dominio financiero, una alucinación sobre cifras, tickers o resultados puede tener consecuencias graves.
- Sesgos: no disponible. No se han publicado análisis de sesgo, y un ajuste sobre datos bursátiles estadounidenses puede heredar sesgos de mercado, temporales y geográficos.
- Cobertura idiomática desconocida: la etiqueta `conversational` no garantiza un rendimiento homogéneo en castellano; probablemente el ajuste esté dominado por inglés financiero.
- Ventana de contexto desconocida: limita el diseño de aplicaciones que dependan de documentos largos (por ejemplo, informes anuales completos).
- Sin fecha de corte conocida: el conocimiento financiero puede estar desactualizado, lo que en este dominio es especialmente crítico.
- Descargas y likes a cero en el momento de la consulta: no hay evidencia de uso en la comunidad ni de validación por terceros.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): pueden degradar de forma apreciable la coherencia y la precisión numérica frente a Q5_K_M o superiores.
- Fechas de creación y actualización anómalas (septiembre de 2026): conviene verificar la integridad y vigencia del repositorio.
- No es un asesor financiero: cualquier salida del modelo debe pasar por revisión humana antes de tomar decisiones de inversión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/morphoalgo-usstock-14b-GGUF
- Modelo base: https://huggingface.co/bluemorpholimited/morphoalgo-usstock-14b
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Organización propietaria del modelo original: https://huggingface.co/bluemorpholimited
