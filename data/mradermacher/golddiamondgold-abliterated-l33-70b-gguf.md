# mradermacher/GoldDiamondGold-Abliterated-L33-70b-GGUF

## Resumen

GoldDiamondGold-Abliterated-L33-70b-GGUF es una cuantización estática en formato GGUF del modelo KaraKaraWarehouse/GoldDiamondGold-Abliterated-L33-70b, publicada por mradermacher. El modelo base es un transformer denso de aproximadamente 70.553 millones de parámetros (70,55 B), derivado a su vez de un modelo de la familia LLaMA-3.3 de 70 B al que se le han aplicado técnicas de "abliteration" (eliminación de las capas de rechazo/alineación) para producir una variante sin censura. La model card lo etiqueta explícitamente como `heretic`, `uncensored`, `decensored` y `abliterated`.

El repositorio no aporta información sobre la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks. Se trata, por tanto, de un artefacto de cuantización: el valor del repositorio está en ofrecer 11 variantes GGUF (desde Q2_K de 26,5 GB hasta Q8_0 de 75,1 GB) listas para inferencia con llama.cpp y ecosistemas compatibles, no en innovaciones de modelado.

Es relevante ahora porque permite ejecutar un modelo de 70 B "sin censura" en hardware de consumo o en servidores modestos mediante cuantización agresiva (Q4_K_M ocupa 42,6 GB), algo imposible con los pesos completos en safetensors. El precio a pagar es la pérdida de calidad asociada a la cuantización y la ausencia total de garantías de alineación o seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia LLaMA-3.3, según el nombre del modelo; detalles no disponibles) |
| Parámetros totales | 70.553.706.560 (70,55 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repositorio i1 aparte |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Por el identificador del modelo base (L33-70b) y el recuento de parámetros (70,55 B), se infiere que se trata de un transformer denso de la familia LLaMA 3.3 de 70 B, pero no se confirman el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa.

El proceso de "abliteration" aplicado al modelo base consiste en identificar y neutralizar las direcciones de activación asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder a ciertos contenidos. No se documentan los datos de entrenamiento originales, el volumen de tokens, la composición del corpus ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.). La cuantización la realiza mradermacher con su pipeline habitual (`quantize_version: 2`, `output_tensor_quantised: 1`, conversión desde Hugging Face), e incluye un conjunto de cuantizaciones ponderadas con imatrix en un repositorio separado.

## Capacidades

- Generación de texto conversacional en inglés, con el formato de chat heredado del modelo base.
- Respuestas sin las restricciones de rechazo típicas de los modelos alineados, gracias a la abliteración.
- Razonamiento y conocimiento general propios de un modelo de 70 B (no verificable sin benchmarks).
- Soporte de conversaciones multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de qué ocurre al eliminar las capas de rechazo, permitiendo comparar respuestas frente al modelo base alineado en tareas de red teaming controlado.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas que los modelos alineados rechazan, ejecutando la variante Q4_K_M (42,6 GB) en una estación de trabajo con 48 GB de VRAM.
- Despliegue local en hardware de consumo: la variante Q2_K (26,5 GB) o Q3_K_S (31,0 GB) permite ejecutar un modelo de 70 B en una GPU de 24-32 GB o en configuraciones con offloading a CPU mediante llama.cpp.
- Experimentación con cuantizaciones: el repositorio ofrece 11 variantes para medir el impacto de la cuantización en perplejidad y calidad de generación sobre un mismo modelo base, útil para calibrar pipelines de despliegue.
- Prototipado de asistentes conversacionales en inglés: gracias a la compatibilidad con endpoints, puede servirse detrás de una API compatible con OpenAI para pruebas internas de producto.
- Fine-tuning posterior sobre GGUF: las variantes Q8_0 (75,1 GB) o Q6_K (58,0 GB) preservan la mayor parte de la calidad del modelo original y pueden emplearse como base para adaptaciones con LoRA en entornos con suficiente memoria.
- Análisis de sesgos y contenido dañino: al carecer de filtros de rechazo, es útil para estudiar la distribución de respuestas del modelo en dominios sensibles y para construir clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~26,5 GB; Q3_K_S ~31,0 GB; Q3_K_M ~34,4 GB; Q3_K_L ~37,2 GB; IQ4_XS ~38,4 GB; Q4_K_S ~40,4 GB; Q4_K_M ~42,6 GB; Q5_K_S ~48,8 GB; Q5_K_M ~50,0 GB; Q6_K ~58,0 GB; Q8_0 ~75,1 GB.
- GPU recomendadas: A100 80 GB o H100 para Q6_K y Q8_0; A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB para Q4_K_M y Q5_K_M; dos RTX 4090 (24 GB cada una) o una RTX 4090 con offloading parcial para Q2_K y Q3_K_S.
- ¿Cabe en GPU de consumo? Sí, en configuraciones multi-GPU o con offloading a CPU: Q2_K y Q3_K_S caben en una RTX 3090/4090 de 24 GB solo con capas parciales en CPU; Q4_K_M requiere al menos 48 GB de VRAM total.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; también es posible servir el modelo base en safetensors con vLLM o TGI, pero no las variantes GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoldDiamondGold-Abliterated-L33-70b-GGUF | 70,55 B | No disponible | 11 variantes GGUF | No disponible | Hugging Face (mradermacher) |
| Modelo base KaraKaraWarehouse/GoldDiamondGold-Abliterated-L33-70b | 70,55 B | No disponible | Safetensors | No disponible | Hugging Face |
| Variantes imatrix de mradermacher (i1-GGUF) | 70,55 B | No disponible | Cuantizaciones ponderadas | No disponible | Hugging Face (mradermacher) |

No se dispone de datos de rendimiento ni de modelos comparables alternativos con información verificable en la documentación proporcionada.

## Limitaciones y advertencias

- Ausencia total de alineación: la abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin filtros. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Riesgo elevado de alucinación: no hay datos de evaluación que cuantifiquen la fiabilidad factual; los modelos sin alineación tienden a presentar respuestas plausibles pero incorrectas con mayor confianza.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Antes de desplegarlo en producción es imprescindible verificar la licencia del modelo base en KaraKaraWarehouse/GoldDiamondGold-Abliterated-L33-70b.
- Solo inglés: la model card declara únicamente `en`; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto desconocido: no se documenta la longitud máxima de contexto, lo que impide planificar aplicaciones con documentos largos.
- Pérdida de calidad por cuantización: las variantes Q2_K y Q3_K_S degradan notablemente la calidad; solo Q6_K y Q8_0 se acercan al modelo original, a costa de 58-75 GB de almacenamiento.
- Repositorio de 481,3 GB: descargar el conjunto completo es costoso; conviene descargar solo la variante necesaria.
- Trazabilidad limitada: el autor del modelo base no documenta el proceso de abliteración ni los datos de entrenamiento, lo que dificulta auditar su comportamiento.
- Fecha de creación futura (2026-02-12) en los metadatos: conviene verificar la integridad y procedencia de los archivos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/GoldDiamondGold-Abliterated-L33-70b-GGUF
- Modelo base: https://huggingface.co/KaraKaraWarehouse/GoldDiamondGold-Abliterated-L33-70b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/GoldDiamondGold-Abliterated-L33-70b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#GoldDiamondGold-Abliterated-L33-70b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
