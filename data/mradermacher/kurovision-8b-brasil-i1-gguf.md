# mradermacher/KuroVision-8B-Brasil-i1-GGUF

## Resumen

KuroVision-8B-Brasil-i1-GGUF es una cuantizacion en formato GGUF del modelo KuroVision-8B-Brasil, desarrollado originalmente por engenho-ai y convertido por mradermacher. El modelo base cuenta con 8.190.735.360 parametros (aproximadamente 8,2 mil millones) y esta orientado a tareas conversacionales, segun la etiqueta `conversational` del repositorio. La denominacion "Vision" sugiere capacidades multimodales, aunque la informacion disponible no confirma explicitamente la presencia de un proyector visual en esta conversion.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K), lo que permite desplegarlo en hardware de consumo con requisitos de VRAM muy dispares. Al tratarse de una conversion con cuantizacion ponderada mediante imatrix, se busca preservar la calidad del modelo original a tamanos reducidos, un aspecto critico en modelos de ~8B cuando se baja de 4 bits.

No obstante, la informacion disponible es muy limitada: no se especifican licencia, idiomas soportados, contexto nativo, datos de entrenamiento ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 27 de noviembre de 2026, lo que indica una publicacion muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el tamano y el formato; no confirmado) |
| Parametros totales | 8.190.735.360 (~8,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | no disponible (el sufijo "Brasil" sugiere enfasis en portugues de Brasil, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base KuroVision-8B-Brasil en la documentacion proporcionada. Por el numero de parametros (~8,2 B) y el pipeline de conversion (`convert_type: hf`), se trata de un modelo transformer denso convertido desde pesos de Hugging Face a GGUF, pero no se confirma la familia arquitectonica (Llama, Qwen, Mistral u otra), ni si incorpora componentes multimodales pese al nombre "Vision".

Respecto al entrenamiento, no se detallan el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. La unica informacion tecnica relevante es que las cuantizaciones se han generado con **imatrix ponderada** (weighted/imatrix quants), una tecnica que calcula una matriz de importancia a partir de datos de calibracion para minimizar la perdida de calidad en cuantizaciones agresivas (especialmente por debajo de 4 bits). El autor tambien marca `output_tensor_quantised: 1`, lo que indica que los tensores de salida fueron cuantizados, y `quantize_version: 2`, correspondiente al esquema de cuantizacion de llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Posible procesamiento de imagenes por el nombre "KuroVision", aunque no confirmado en la informacion disponible.
- Capacidades multilingues: no confirmadas; el sufijo "Brasil" apunta a un posible enfasis en portugues de Brasil.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explicito: no disponible.
- Capacidades de codigo y matematicas: no disponible.

## Casos de uso

- Despliegue en hardware de consumo: gracias a las cuantizaciones IQ2/IQ3/Q4, el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM (Q4_K_M ocupa aproximadamente 4,9 GB), lo que lo hace adecuado para prototipos locales en portatiles con RTX 3060 o superiores.
- Asistente conversacional local en portugues de Brasil: si el modelo base esta especializado en ese idioma (como sugiere el sufijo), podria emplearse para atencion al cliente o asistentes personales en ese mercado, aunque la calidad debe validarse empiricamente.
- Experimentacion con cuantizacion extrema: las variantes IQ1_S e IQ2_XXS permiten estudiar el comportamiento del modelo con menos de 3 bits por peso, util para investigacion sobre degradacion por cuantizacion.
- Inferencia en CPU con llama.cpp u Ollama: el formato GGUF y el tamano (~8B) permiten ejecucion en CPU con RAM suficiente (8-16 GB), adecuado para entornos sin GPU.
- Pipelines de evaluacion comparativa de cuantizaciones: al ofrecer 24 variantes del mismo modelo, sirve para medir el impacto de cada nivel de cuantizacion en tareas downstream.
- Base para fine-tuning ligero o destilacion: el modelo original en safetensors puede servir como punto de partida, aunque esta conversion GGUF no es directamente entrenable.
- Prototipado de aplicaciones multimodales: solo si se confirma la capacidad de vision del modelo base; de lo contrario, este caso no aplica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, calculada a partir del numero de parametros y el nivel de cuantizacion; no confirmada por el autor):
  - IQ1_S / IQ1_M: ~2,0-2,5 GB
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~2,5-3,2 GB
  - Q2_K / Q2_K_S: ~3,0-3,3 GB
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: ~3,3-3,9 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~3,8-4,3 GB
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: ~4,6-5,0 GB
  - IQ4_XS / IQ4_NL: ~4,5-4,8 GB
  - Q5_K_S / Q5_K_M: ~5,6-6,0 GB
  - Q6_K: ~6,7 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, A10, L4, A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB (con cuantizaciones IQ2/IQ3) hasta RTX 4090 para Q6_K con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa para este formato sin conversion adicional.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto, que no se especifica.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre el modelo base (arquitectura, contexto, licencia, benchmarks) para establecer una comparativa fiable con alternativas de la misma categoria. Se indica "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible consultar la licencia del modelo base (engenho-ai/KuroVision-8B-Brasil) antes de cualquier despliegue en produccion.
- Idiomas no declarados: la orientacion al portugues de Brasil es una inferencia a partir del nombre, no un dato confirmado.
- Contexto nativo desconocido: no se puede planificar el uso en tareas de contexto largo sin verificar el modelo base.
- Capacidad multimodal incierta: el nombre "Vision" no garantiza que esta conversion GGUF incluya el proyector visual; en la lista de cuantizaciones no aparece `mmproj`, lo que sugiere que podria no estar incluido (o que se omite deliberadamente, segun la marca `skip_mmproj` vacia).
- Riesgo de alucinacion: inherente a los modelos de ~8B, especialmente en cuantizaciones por debajo de 4 bits (IQ1, IQ2, Q2), donde la degradacion de calidad puede ser notable.
- Cuantizaciones extremas (IQ1_S, IQ2_XXS): pensadas para experimentacion, no para produccion; la perdida de coherencia y fidelidad puede ser significativa.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia empirica de calidad reportada por terceros.
- Fecha de creacion futura (2026-11-27): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.
- Sin benchmarks: no hay datos objetivos de rendimiento para comparar con alternativas.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/KuroVision-8B-Brasil-i1-GGUF
- Modelo base: https://huggingface.co/engenho-ai/KuroVision-8B-Brasil
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
