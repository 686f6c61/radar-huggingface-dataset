# mradermacher/LFM3-1.7B-heretic-ara-GGUF

## Resumen

LFM3-1.7B-heretic-ara-GGUF es una publicacion de cuantizaciones estaticas en formato GGUF del modelo dalatexcoder/LFM3-1.7B-heretic-ara, generada por el usuario mradermacher, conocido en Hugging Face por producir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base pertenece a la familia LFM3 (presumiblemente Liquid Foundation Models, version 3) con 1.700 millones de parametros, segun se deduce del identificador, aunque la model card no aporta detalles sobre arquitectura ni entrenamiento.

El sufijo "heretic" hace referencia a un proceso de "abliteration" o desalineacion parcial, una tecnica que modifica los pesos de un modelo alineado para reducir sus rechazos ante peticiones que el modelo original denegaria. El sufijo "ara" sugiere un ajuste o especializacion para arabe, aunque esta informacion no se confirma en la documentacion disponible. La relevancia de esta ficha es limitada por la escasez de datos publicados: el repositorio no incluye pipeline declarado, licencia, idiomas soportados ni resultados de evaluacion.

El interes practico reside en disponer de pesos cuantizados listos para inferencia local en hardware modesto, dado el tamano reducido del modelo. Sin embargo, la ausencia de informacion sobre la licencia del modelo base y sobre el proceso de modificacion (heretic) obliga a extremar la cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3, segun el identificador) |
| Parametros totales | 1.700 millones (deducido del identificador) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible (el sufijo "ara" sugiere arabe, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El identificador LFM3 apunta a la tercera generacion de los modelos Liquid Foundation Models, pero no se confirma ni el tipo de capa (transformer, SSM o hibrida), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El sufijo "heretic" indica que los pesos han sido modificados mediante tecnicas de ablacion de direcciones de rechazo, un procedimiento que altera el comportamiento de alineacion del modelo original sin reentrenamiento completo.

La contribucion de esta publicacion concreta es exclusivamente la cuantizacion estatica: el autor ha generado 12 variantes GGUF a partir del modelo base, con metadatos que indican quantize_version 2 y output_tensor_quantised 1, lo que sugiere cuantizacion de tensores de salida. No se documenta el proceso de calibracion ni el dataset empleado para las cuantizaciones de tipo K-quant.

## Capacidades

- Generacion de texto autoregresiva, segun corresponde a un modelo de lenguaje de 1.700 millones de parametros.
- Razonamiento basico y respuesta a instrucciones, condicionado por el ajuste del modelo base (no documentado).
- Posible especializacion en arabe por el sufijo "ara", sin confirmacion en la model card.
- Comportamiento menos restrictivo ante peticiones que el modelo original rechazaria, debido al proceso heretic.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible.
- Capacidades multimodales (vision, audio): no disponible.

## Casos de uso

- Inferencia local en equipos de sobremesa: las variantes Q4_K_M y Q5_K_M permiten ejecutar el modelo en CPU o en GPU consumer con requisitos de memoria reducidos, adecuadas para prototipado y pruebas offline.
- Experimentacion con modelos desalineados: util para investigadores que estudian los efectos de la abliteration sobre la tasa de rechazo, la utilidad y los sesgos, comparando el modelo heretic con su base original.
- Procesamiento de texto en arabe en entornos con recursos limitados: si se confirma la especializacion en arabe, las cuantizaciones Q4 y Q5 permiten desplegar un modelo ligero para tareas de clasificacion o generacion en ese idioma.
- Generacion de texto en dispositivos de borde: el tamano de 1.700 millones de parametros y las cuantizaciones Q2_K e IQ4_XS posibilitan su ejecucion en dispositivos con poca memoria, aunque con perdida de calidad apreciable.
- Evaluacion de cuantizaciones: las 12 variantes publicadas permiten medir la degradacion de calidad entre f16 y Q2_K sobre el mismo modelo, util para seleccionar el punto de equilibrio adecuado.
- Fines educativos y de investigacion sobre alineacion: el contraste entre el modelo base y la version heretic sirve para ilustrar como se codifican los comportamientos de rechazo en los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en f16 (1.700 millones de parametros a 2 bytes por parametro), unos 1,8 GB en Q8_0, 1,3 GB en Q5_K_M, 1,1 GB en Q4_K_M y alrededor de 0,7 GB en Q2_K. Estas cifras son estimaciones por tamano y no incluyen el overhead del contexto KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede alojar las cuantizaciones Q4 o superiores; para f16 se recomienda al menos 6 GB. En GPU de datacenter (A100, H100) el modelo queda muy sobredimensionado en cuanto a memoria, por lo que solo tiene sentido en escenarios de alto throughput con muchos lotes.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en iGPU con memoria unificada para las cuantizaciones mas pequenas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI requieren los pesos en safetensors del modelo base, no estas cuantizaciones.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-heretic-ara-GGUF | 1.700 M | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Llama 3.2 1B Instruct | 1.200 M | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a tamano y disponibilidad, ya que no hay datos de rendimiento del modelo evaluado. Frente a las alternativas citadas, la principal diferencia es la ausencia de licencia declarada y la modificacion heretic, que lo aleja de los casos de uso empresarial estandar.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, lo que impide determinar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base antes de cualquier despliegue.
- El proceso heretic reduce los rechazos del modelo, lo que puede aumentar la probabilidad de generar contenido danino, sesgado o inexacto. No es recomendable para aplicaciones orientadas al publico sin filtros adicionales.
- No se documentan los sesgos del modelo base ni los introducidos por la modificacion.
- Riesgo de alucinacion inherente a un modelo de 1.700 millones de parametros, agravado por la falta de datos de evaluacion.
- No se especifica la longitud de contexto soportada; asumir ventanas largas sin verificacion puede provocar degradacion o errores.
- La especializacion en arabe no esta confirmada; el rendimiento en castellano o en otros idiomas es desconocido.
- Las cuantizaciones Q2_K e IQ4_XS introducen perdida de calidad notable; para produccion se recomienda Q4_K_M o superior.
- El repositorio no declara pipeline ni idiomas, y el numero de descargas es cero en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-heretic-ara-GGUF
- Modelo base: https://huggingface.co/dalatexcoder/LFM3-1.7B-heretic-ara
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
