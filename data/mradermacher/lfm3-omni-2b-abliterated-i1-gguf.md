# mradermacher/LFM3-Omni-2B-abliterated-i1-GGUF

## Resumen

LFM3-Omni-2B-abliterated-i1-GGUF es una cuantizacion en formato GGUF del modelo LFM3-Omni-2B-abliterated, publicada por el usuario mradermacher en Hugging Face. Se trata de una variante "abliterated" del modelo LFM3-Omni-2B, es decir, una version en la que presuntamente se ha reducido o eliminado el comportamiento de rechazo (refusal) mediante tecnicas de ablation de direcciones en el espacio de activaciones. El autor original del modelo base es JonusNattapong, y mradermacher se limita a generar los archivos cuantizados para su uso con llama.cpp y derivados.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, el tamano del repo figura como 0.0 GB y la model card no aporta informacion sustancial sobre arquitectura, entrenamiento, licencia o idiomas. El unico dato tecnico verificable es el numero de parametros reportado en los safetensors del modelo base, 899.013, una cifra que no concuerda con la denominacion "2B" del nombre y que probablemente corresponde a un recuento parcial o erroneo. No hay informacion publicada sobre contexto, licencia ni capacidades reales.

Por tanto, esta ficha documenta lo que se puede verificar y marca explicitamente como "no disponible" todo aquello que la informacion proporcionada no cubre. No se deben inferir capacidades, rendimiento ni condiciones de uso a partir del nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer multimodal "Omni" por el nombre, sin confirmar) |
| Parametros totales | 899.013 segun safetensors del modelo base (no concuerda con la denominacion "2B"; dato no fiable) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp; el modelo base estaria en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre "LFM3-Omni-2B" sugiere un modelo de la familia LFM (Liquid Foundation Models) con capacidades multimodales ("Omni"), pero no hay confirmacion en la model card ni en los metadatos. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion.

La unica informacion tecnica disponible es que las cuantizaciones se han generado con "weighted/imatrix quants", es decir, usando una matriz de importancia (imatrix) calculada a partir de un corpus de calibracion para ponderar la cuantizacion de cada tensor. La etiqueta "abliterated" indica que el modelo base ha sido modificado para reducir los rechazos, presumiblemente mediante ablation de direcciones de refusal en las activaciones, aunque no se detalla el metodo. La model card tambien incluye la etiqueta "nicoboss" y metadatos de la herramienta de conversion (`quantize_version: 2`, `convert_type: hf`, `skip_mmproj: 1`), lo que sugiere que el modelo base podria incluir un proyector multimodal (mmproj) que no se ha cuantizado en este repo.

## Capacidades

- No hay informacion publicada sobre las capacidades reales del modelo en la documentacion proporcionada.
- Por el nombre "Omni" se podria especular con capacidades multimodales (texto, vision, audio), pero no esta confirmado.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni idiomas soportados.
- No se documenta un modo "thinking" ni capacidades especiales de razonamiento.
- La variante "abliterated" implica, por definicion, una reduccion de los rechazos, lo que afecta al comportamiento en dominios sensibles.

## Casos de uso

- Evaluacion de tecnicas de abliteration: el modelo permite a investigadores comparar el comportamiento de un modelo con refusal reducido frente a su version original, siempre que se disponga del modelo base para la comparacion.
- Experimentacion local con cuantizaciones GGUF: las multiples variantes (desde IQ1_M hasta Q6_K) permiten probar el equilibrio entre calidad y consumo de memoria en hardware modesto.
- Pruebas de pipeline con llama.cpp: util para validar flujos de inferencia en CPU o GPU de gama baja con modelos de pocos parametros.
- Investigacion sobre sesgos y seguridad: el caracter abliterated lo hace util para estudiar como se manifiestan contenidos que el modelo original rechazaria, en entornos controlados.
- Prototipado rapido sin requisitos de produccion: al no haber garantias de licencia ni calidad, solo es adecuado para experimentos desechables.
- Analisis de cuantizacion: comparar la degradacion de calidad entre los distintos niveles de cuantizacion publicados (Q2 a Q6) sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que el numero de parametros reportado (899.013) no es coherente con la denominacion "2B". Si el modelo base tuviera realmente ~2B parametros, las cuantizaciones Q4_K_M ocuparian aproximadamente 1,2-1,4 GB y Q6_K en torno a 1,7-1,9 GB; estas cifras son estimaciones genericas y no estan confirmadas.
- GPU recomendadas: no disponible. Para un modelo de ~2B en GGUF bastaria una GPU consumer con 4-6 GB de VRAM en cuantizaciones bajas, pero no hay datos verificados.
- Compatibilidad con GPU consumer: probable en cuantizaciones Q4 o inferiores si el modelo es realmente de ~2B, sin confirmacion.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) por el formato GGUF. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma familia, tamano o tarea, ni se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no aporta informacion sobre licencia, lo que impide determinar si el uso comercial esta permitido. Se debe consultar el modelo base (JonusNattapong/LFM3-Omni-2B-abliterated) y, en ultima instancia, el modelo original de la familia LFM3.
- El caracter "abliterated" implica que el modelo puede generar contenido que el modelo original rechazaria; no es adecuado para aplicaciones en produccion orientadas al publico sin filtros adicionales.
- El dato de parametros (899.013) es inconsistente con el nombre "2B" y con el tamano esperado de un modelo de ese tipo; puede tratarse de un recuento parcial o de un error en los metadatos. No se debe usar para dimensionar hardware.
- El repositorio muestra 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que puede estar incompleto o que los archivos no se han subido correctamente.
- No hay informacion sobre sesgos, alucinacion, limitaciones de contexto o idioma.
- La etiqueta `skip_mmproj: 1` indica que el proyector multimodal no se ha incluido; si el modelo base es multimodal, estas cuantizaciones podrian no soportar entrada de imagen o audio.
- No apto para uso en produccion sin una evaluacion independiente de calidad, seguridad y licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-Omni-2B-abliterated-i1-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated
