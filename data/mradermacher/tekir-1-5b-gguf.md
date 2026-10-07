# mradermacher/Tekir-1.5B-GGUF

## Resumen

Tekir-1.5B-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base `battalkoc/Tekir-1.5B`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una conversión y posterior cuantización del checkpoint original a múltiples niveles de precisión, pensada para su uso con llama.cpp, Ollama y otros motores compatibles con GGUF. El repositorio se publica bajo la etiqueta `conversational` y `endpoints_compatible`, lo que indica que está pensado para inferencia de chat.

El modelo cuenta con 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), un tamaño propio de la gama de modelos pequeños orientados a ejecución en hardware de consumo. El repositorio ocupa 14,2 GB en total, un valor coherente con la inclusión simultánea de trece variantes de cuantización distintas, desde f16 hasta Q2_K.

La información pública disponible sobre este repositorio es muy limitada: no se declara licencia, no se especifican idiomas soportados, no hay pipeline declarado ni resultados de benchmarks, y el contador de descargas y de "me gusta" figura a cero. La model card se limita a indicar que se trata de cuantizaciones estáticas del modelo base. Cualquier dato sobre arquitectura, datos de entrenamiento o rendimiento debe consultarse en el repositorio del modelo original, que no forma parte de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1 |
| Tipo de conversion | hf (convert_type) |
| Tamano del repositorio | 14,2 GB |
| Modelo base | battalkoc/Tekir-1.5B |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `battalkoc/Tekir-1.5B`: no se detalla si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura de espacio de estados o un diseno hibrido. Tampoco se especifican el numero de capas, la dimension del hidden state, el numero de cabezas de atencion ni el tipo de tokenizador. El unico dato estructural confirmado es el recuento de parametros (1.543.714.304) y el hecho de que el checkpoint original se distribuye en formato safetensors antes de la conversion.

En cuanto al entrenamiento, la informacion proporcionada no incluye el numero de tokens utilizados, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni ninguna innovacion tecnica destacable. El repositorio de mradermacher es exclusivamente una capa de cuantizacion: aplica `convert_type: hf` con `quantize_version: 2` y `output_tensor_quantised: 1` para generar trece variantes de pesos GGUF con distintos niveles de compresion, manteniendo los pesos del modelo original sin reentrenamiento.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational`, por lo que el uso previsto es el dialogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el formato GGUF generado puede servirse a traves de endpoints de inferencia que aceptan este formato.
- Ejecucion local en CPU y GPU: al estar en GGUF, el modelo puede ejecutarse con llama.cpp y cargarse parcial o totalmente en GPU segun la VRAM disponible.
- Seleccion de precision: la disponibilidad de trece cuantizaciones permite ajustar el equilibrio entre calidad de salida y consumo de memoria, desde f16 (maxima fidelidad) hasta Q2_K (maxima compresion).
- Capacidades especificas (razonamiento, codigo, matematicas, vision, audio, tool calling, agentes): no disponible. No se declara ninguna capacidad especial en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: al ser un modelo de 1,54 B en formato GGUF, puede cargarse en un portatil o en una estacion de trabajo sin GPU dedicada y usarse para validar flujos de chat antes de escalar a modelos mayores.
- Despliegue en dispositivos con recursos limitados: la variante Q2_K o Q3_K_S ocupa una fraccion del tamano de f16, lo que permite ejecutar el modelo en mini-PC, Raspberry Pi de gama alta o sistemas embebidos con RAM restringida.
- Generacion de texto de bajo coste en lote: para tareas de resumen, reformulacion o clasificacion de texto simple donde no se requiere un modelo de gran escala, la variante Q8_0 ofrece un buen equilibrio entre calidad y velocidad en CPU.
- Chatbot interno en una intranet sin conexion: al ejecutarse con llama.cpp u Ollama, el modelo no requiere acceso a Internet ni envio de datos a terceros, lo que resulta util en entornos con requisitos de confidencialidad.
- Experimentacion academica con cuantizacion: el repositorio ofrece trece niveles de cuantizacion del mismo checkpoint, lo que permite estudiar empiricamente la degradacion de calidad frente al nivel de compresion en un modelo de ~1,5 B.
- Fine-tuning posterior sobre pesos cuantizados o sobre el modelo base: dado que el repositorio incluye f16 y Q8_0, es posible partir de una version de alta fidelidad para tareas de adaptacion con LoRA antes de recuantizar.
- Integracion en pipelines de generacion de texto con requisitos de latencia baja: un modelo de este tamano responde en pocos milisegundos por token en GPU moderna, lo que encaja en aplicaciones interactivas de texto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento de parametros, sin contar overhead de runtime ni cache KV):
  - f16: ~3,1 GB de pesos, ~3,5-4 GB con overhead.
  - Q8_0: ~1,6 GB de pesos.
  - Q6_K: ~1,3 GB de pesos.
  - Q5_K_M: ~1,1 GB de pesos.
  - Q4_K_M: ~1,0 GB de pesos.
  - Q3_K_M: ~0,8 GB de pesos.
  - Q2_K: ~0,6 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar las variantes de 8 bits o inferiores. Para f16 se recomienda un minimo de 6 GB. No se dispone de recomendaciones oficiales del autor.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo de los ultimos anos (GTX 1060 6 GB, RTX 3060, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones de 4-8 bits sin dificultad. En tarjetas con 2-4 GB conviene usar Q4_K_M o inferior.
- Ejecucion en CPU: viable con llama.cpp. Con Q4_K_M y un procesador moderno se obtiene una velocidad de generacion suficiente para uso interactivo en texto corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier servidor compatible con GGUF. Los formatos vLLM y TGI trabajan preferentemente con safetensors, por lo que no son los motores naturales para este repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones oficiales.

## Comparativa con modelos similares

La comparativa se limita a los datos verificables del repositorio. Al no disponer de licencia, contexto ni benchmarks de Tekir-1.5B, varias celdas quedan sin cubrir.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tekir-1.5B-GGUF | 1,54 B | no disponible | no disponible | GGUF (13 cuantizaciones) | Cuantizacion de battalkoc/Tekir-1.5B |
| Qwen2.5-1.5B | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia consolidada en la gama 1,5 B |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Orientado a dispositivos de borde |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Requiere aceptar licencia especifica |

No se dispone de datos de rendimiento de Tekir-1.5B que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia ni en el repositorio de cuantizacion ni en la informacion disponible, no puede confirmarse que el uso comercial este permitido. Es imprescindible verificar la licencia del modelo base `battalkoc/Tekir-1.5B` antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce que lenguas soporta el modelo y con que calidad. No se debe asumir un buen rendimiento en castellano sin una evaluacion previa.
- Longitud de contexto desconocida: sin este dato no es posible garantizar el comportamiento en conversaciones largas ni en tareas de resumen de documentos extensos.
- Riesgo de alucinacion: con 1,54 B de parametros, la tasa de invencion de hechos y de errores en tareas de conocimiento factual sera previsiblemente alta. No se han publicado evaluaciones que cuantifiquen este riesgo.
- Sesgos: no disponible. No se documenta ningun analisis de sesgos ni la composicion del dataset de entrenamiento.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, por lo que no existe evidencia objetiva de su calidad.
- Adopcion nula: el repositorio registra cero descargas y cero valoraciones en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte de la comunidad o errores ya reportados.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K_S pueden degradar notablemente la coherencia del texto en modelos de este tamano. Se recomienda validar la calidad de cada cuantizacion antes de usarla.
- Metadatos incompletos en la conversion: los campos `vocab_type` y el listado de `tags` aparecen vacios en la model card, lo que puede afectar a la deteccion automatica del formato por parte de algunas herramientas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Tekir-1.5B-GGUF
- Modelo base: https://huggingface.co/battalkoc/Tekir-1.5B
