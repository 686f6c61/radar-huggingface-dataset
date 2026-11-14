# mradermacher/Lucie-7B-Instruct-Merged-Model_Stock-v1.1-GGUF

## Resumen

Lucie-7B-Instruct-Merged-Model_Stock-v1.1-GGUF es la distribucion en formato GGUF del modelo jpacifico/Lucie-7B-Instruct-Merged-Model_Stock-v1.1, un modelo de lenguaje de aproximadamente 6.700 millones de parametros creado mediante la tecnica de fusion de modelos (model merging) con la herramienta mergekit. El repositorio esta publicado por mradermacher, un conocido cuantizador de la comunidad de Hugging Face que genera versiones GGUF de modelos existentes para su uso con llama.cpp y herramientas compatibles. El modelo original es un merge de modelos instructivos, orientado a conversacion y ajuste por instrucciones.

El modelo resuelve el problema de disponer de una version ligera y ejecutable localmente de un modelo instructivo de ~7B, ofreciendo una amplia gama de cuantizaciones (desde Q2_K hasta f16) que permiten ajustar el equilibrio entre calidad y consumo de memoria. Es relevante para desarrolladores que necesitan desplegar inferencia en hardware de consumo o en entornos sin GPU de datacenter, ya que el formato GGUF es el estandar de facto para inferencia en CPU y GPU de gama media con llama.cpp, Ollama y similares.

La informacion disponible es limitada: no se especifican la longitud de contexto, la licencia, los datos de entrenamiento ni los resultados de benchmarks. El modelo esta etiquetado unicamente para ingles y su proposito declarado es conversacional. El tamano del repositorio (59,6 GB) se debe a la suma de todas las cuantizaciones incluidas, no al peso de una sola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles no disponibles) |
| Parametros totales | 6.706.958.336 (~6,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (tambien disponibles quants i1/imatrix en repo separado) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es el resultado de una fusion de modelos (model merge) realizada con mergekit, una herramienta que combina los pesos de dos o mas modelos para producir un modelo nuevo sin entrenamiento adicional desde cero. La model card del repositorio GGUF no detalla la receta de fusion (metodo, modelos de origen, pesos o capas combinadas), por lo que no es posible confirmar la arquitectura exacta mas alla de que se trata de un transformer de ~6,7B parametros con ajuste instructivo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El valor anadido de este repositorio concreto es la conversion a GGUF y la generacion de multiples cuantizaciones, incluyendo variantes i1/imatrix en un repositorio hermano, que suelen ofrecer mejor calidad por bit que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones.
- Razonamiento general y respuesta a preguntas (capacidades no verificadas con benchmarks).
- Generacion de codigo y matematicas: no documentado explicitamente; no disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ejecucion local en CPU y GPU mediante el formato GGUF.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno en ingles desplegado con llama.cpp u Ollama, sin depender de servicios en la nube, gracias a su tamano de ~7B que cabe en hardware de consumo.
- Prototipado rapido de aplicaciones de chat: con las cuantizaciones Q4_K_M (4,2 GB) o Q5_K_M (4,9 GB) se puede levantar un endpoint compatible con la API de OpenAI en una estacion de trabajo para validar productos antes de invertir en modelos mayores.
- Inferencia en entornos con CPU exclusivamente: las cuantizaciones Q2_K (2,7 GB) y Q3_K_S (3,1 GB) permiten ejecutar el modelo en maquinas sin GPU, util para entornos de desarrollo, CI o dispositivos con recursos limitados.
- Educacion y experimentacion con model merging: sirve para estudiar el comportamiento de modelos fusionados y comparar la calidad entre cuantizaciones estaticas y las variantes i1/imatrix del repositorio hermano.
- Generacion de texto offline y privacidad de datos: al ejecutarse localmente, es adecuado para procesar texto sensible sin enviarlo a terceros, siempre que el caso de uso sea en ingles.
- Evaluacion comparativa de cuantizaciones: el amplio conjunto de quants (de Q2_K a f16) permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta con un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF):
  - Q2_K: ~2,7 GB
  - Q3_K_M: ~3,4 GB
  - Q4_K_M: ~4,2 GB
  - Q5_K_M: ~4,9 GB
  - Q6_K: ~5,6 GB
  - Q8_0: ~7,2 GB
  - f16: ~13,5 GB
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 (por ejemplo, RTX 3060, RTX 4060, RTX 4070); para Q8_0 o f16 se recomienda 8-16 GB (RTX 4080, RTX 4090). En datacenter, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 8 GB o mas para cuantizaciones Q4/Q5; las cuantizaciones Q2/Q3 pueden caber en GPUs con 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con transformers, vLLM o TGI, aunque este repositorio concreto esta pensado para GGUF.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lucie-7B-Instruct-Merged (este) | ~6,7B | no disponible | no disponible | GGUF / safetensors | Merge con mergekit, solo ingles |
| Mistral-7B-Instruct | ~7,2B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Referencia de la categoria 7B instructiva |
| Llama-3.1-8B-Instruct | ~8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema |
| Qwen2.5-7B-Instruct | ~7,6B | 32k+ | Apache 2.0 (segun variante) | safetensors, GGUF | Multilingue y con buen soporte de tool calling |

Los datos de los modelos comparativos corresponden a conocimiento general de la categoria; no se dispone de mediciones directas frente a este modelo en la informacion proporcionada. La comparativa debe tomarse como orientativa, ya que no hay benchmarks publicados de Lucie-7B.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un merge de modelos instructivos, hereda los sesgos de sus modelos de origen, que no se especifican.
- Riesgo de alucinacion: presente como en cualquier modelo de ~7B; no hay evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de contexto o idioma: el modelo esta etiquetado solo para ingles; la longitud de contexto no esta documentada, por lo que no debe asumirse una ventana larga.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base (jpacifico/Lucie-7B-Instruct-Merged-Model_Stock-v1.1) antes de usarlo en produccion.
- Caveats para produccion: el modelo tiene muy poca traccion (13 descargas, 0 likes) y no cuenta con benchmarks ni documentacion tecnica detallada; no se recomienda para sistemas en produccion sin una evaluacion propia previa.
- El repositorio ocupa 59,6 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; para uso real se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lucie-7B-Instruct-Merged-Model_Stock-v1.1-GGUF
- Modelo base: https://huggingface.co/jpacifico/Lucie-7B-Instruct-Merged-Model_Stock-v1.1
- Quants i1/imatrix: https://huggingface.co/mradermacher/Lucie-7B-Instruct-Merged-Model_Stock-v1.1-i1-GGUF
- Pagina de resumen de descargas: https://hf.tst.eu/model#Lucie-7B-Instruct-Merged-Model_Stock-v1.1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
