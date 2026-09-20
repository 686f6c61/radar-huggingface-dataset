# onnx-community/Supra2-100M-Base-ONNX

## Resumen

Supra2-100M-Base-ONNX es la conversión a formato ONNX del modelo base Supra2-100M-Base, desarrollado por SupraLabs y convertido automáticamente por la comunidad onnx-community. Se trata de un transformer decoder-only de tipo causal que sigue la arquitectura Qwen3, con 100,7 millones de parámetros totales (75,5 millones sin contar los embeddings), entrenado desde cero sobre 30.000 millones de tokens de texto web en inglés. Su ventana de contexto nominal es de 1.024 tokens, ampliable a 2.048 en la configuración aunque sin validar experimentalmente.

La relevancia de esta versión concreta reside en el formato: al estar exportada a ONNX, puede ejecutarse directamente en el navegador o en el cliente mediante Transformers.js y ONNX Runtime, sin necesidad de infraestructura de servidor ni GPU dedicada. Con un tamaño de repositorio de 1,1 GB repartido entre variantes, es un modelo pensado para demostraciones interactivas, prototipado rápido y experimentación con arquitecturas pequeñas de estilo Qwen3.

Es importante subrayar que se trata de un modelo base: no ha recibido ajuste por instrucciones, ni alineación por RLHF/DPO, ni entrenamiento conversacional. Su función es la continuación de texto, no el diálogo ni el seguimiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (arquitectura Qwen3) |
| Parametros totales | 100,7 M (75,5 M sin embeddings) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 1.024 tokens entrenados; 2.048 maximo en configuracion (no probado) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el modelo base se publica en bfloat16 y el repo ONNX ocupa 1,1 GB en total |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repo onnx-community); modelo base original en pesos PyTorch/transformers |
| Tamano de vocabulario | 32.768 tokens (tokenizer propio supra2-tokenizer) |
| Precision de entrenamiento | bfloat16 |
| Libreria de inferencia | Transformers.js |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con la arquitectura Qwen3. La configuracion concreta incluye un tamano oculto de 768, 12 capas, 12 cabezas de atencion con GQA y 4 cabezas KV, dimension de cabeza de 64 y un tamano intermedio de 2.048 con activacion SwiGLU. El vocabulario es de 32.768 tokens con embeddings atados (tied embeddings). La codificacion posicional es RoPE con theta 10.000 y la normalizacion es RMSNorm con epsilon 1e-6, incluyendo QK-Norm. La ventana deslizante esta desactivada y la implementacion de atencion utilizada es SDPA. Los pesos se almacenan en bfloat16.

El entrenamiento se realizo desde cero sobre 30.000 millones de tokens (una ratio de 300 tokens por parametro), con una mezcla de datos compuesta por un 70% de `HuggingFaceFW/fineweb-edu` (subconjunto sample-350BT, aproximadamente 21.000 millones de tokens) y un 30% de `HuggingFaceFW/dclm_100BT-shuffled` (aproximadamente 9.000 millones de tokens). Los documentos se tokenizaron y concatenaron en un flujo plano de tokens en formato uint16, empaquetados en bloques contiguos de 1.024 tokens sin padding ni mascara de documento, por lo que las secuencias pueden cruzar fronteras entre documentos.

El procedimiento de optimizacion uso AdamW fusionado con beta1 0,9, beta2 0,95, epsilon 1e-8, un learning rate maximo de 1e-3 y un scheduler WSD (warmup-stable-decay) con decaimiento `1-sqrt` hasta cero. Se completaron 114.000 pasos con tamano de micro-lote 16 y acumulacion de gradiente 16, lo que da un lote efectivo de 256 secuencias, es decir, 262.144 tokens por paso. El weight decay fue de 0,1, el recorte de gradiente de 1,0 y se aplico una perdida auxiliar z-loss sin router con coeficiente 1e-4. Todo el entrenamiento se ejecuto en una unica RTX 5090 de 32 GB con `torch.compile` activado.

## Capacidades

- Generacion de texto por continuacion de prompt en ingles. Es la capacidad principal y practicamente la unica para la que el modelo fue entrenado.
- Modelado de lenguaje a nivel de token y calculo de perplejidad, util para evaluacion y comparacion de tecnicas de cuantizacion.
- Extraccion de representaciones internas mediante fine-tuning posterior para tareas discriminativas (clasificacion, regresion).
- Inferencia en navegador y en el cliente mediante Transformers.js sobre ONNX Runtime, con soporte potencial de WebGPU o WASM.
- No dispone de soporte de tool calling ni de function calling: el modelo no ha sido ajustado para emitir llamadas a herramientas.
- No dispone de capacidades de agente ni de razonamiento multi-paso: es un modelo base sin alineacion.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni ninguna otra modalidad adicional.
- Capacidad multilingue practicamente nula: el entrenamiento es exclusivamente en ingles.
- El tokenizer incluye una plantilla ChatML, pero el modelo no ha sido entrenado para seguir dicho formato conversacional.

## Casos de uso

- Autocompletado de texto en el navegador: con 100,7 M de parametros y pesos ONNX, el modelo puede cargarse en el cliente mediante Transformers.js y ofrecer sugerencias de continuacion de texto sin enviar datos a un servidor, algo relevante para aplicaciones con requisitos de privacidad.
- Demostraciones educativas de generacion de lenguaje: la ventana de 1.024 tokens y el tamano reducido permiten ilustrar el funcionamiento de un transformer causal en tiempo real, incluso en un portatil sin GPU dedicada.
- Punto de partida para fine-tuning en dominios concretos: al ser un modelo base de licencia Apache 2.0, puede ajustarse en tareas como clasificacion de textos, analisis de sentimiento o deteccion de spam con presupuestos de computo muy bajos.
- Generacion de texto sintetico a pequeña escala: util para aumentar conjuntos de datos de dominio especifico o para generar datos de prueba en pipelines de desarrollo, siempre con revision humana posterior.
- Banco de pruebas para pipelines ONNX: sirve para validar exportaciones, comparar Runtime con WebGPU frente a WASM o medir el impacto de distintas cuantizaciones en la calidad de la salida.
- Filtrado y priorizacion previa en cascadas de inferencia: por su bajo coste, puede emplearse como primer nivel para descartar continuaciones poco probables antes de invocar un modelo mayor.
- Experimentacion en investigacion de arquitecturas: su configuracion tipo Qwen3 a escala 100M lo convierte en una plataforma asequible para estudiar variantes de atencion, normalizacion o inicializacion.
- Integracion en herramientas de escritura offline: extensiones de editor o correctores que funcionen sin conexion y con latencia muy baja.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con EleutherAI LM-Eval Harness:

| Modelo | PIQA (acc_norm) | HellaSwag (acc_norm) | ARC-Easy (acc_norm) | ARC-Challenge (acc_norm) |
|---|---|---|---|---|
| Supra-50M-Base | 0,62 | 0,32 | 0,46 | 0,25 |
| Supra2-100M Base | 0,65 | 0,36 | 0,48 | 0,25 |
| BananaMind-2-Pro-Preview-EXP | 0,67 | 0,40 | 0,51 | 0,27 |
| GPT-X-125M | 0,65 | 0,37 | 0,51 | 0,25 |
| OpenAI GPT-2 Small | 0,62 | 0,31 | 0,39 | 0,22 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible. Tampoco hay datos de latencia o throughput medidos para la version ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (100,7 M): aproximadamente 400 MB en fp32, 200 MB en fp16/bf16, 100 MB en int8 y 50 MB en int4, sin contar el espacio de activaciones ni el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer sirve. Una RTX 3060, RTX 4060 o superior ejecuta el modelo con margen amplio. Tambien es viable en GPUs integradas y en entornos sin GPU dedicada.
- Cabe con holgura en GPU consumer y en tarjetas de gama baja; incluso en CPU la inferencia es practica dado el tamano, y mediante WASM puede ejecutarse en navegador.
- Despliegue: Transformers.js sobre ONNX Runtime es la via documentada por el autor de la conversion. El modelo base puede desplegarse con la libreria transformers de Python. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama en la informacion disponible, y llama.cpp requeriria una conversion adicional a GGUF que no se proporciona en este repositorio.
- Latencia y throughput: no disponibles. El unico dato de hardware publicado es el de entrenamiento, una unica RTX 5090 de 32 GB, que no es extrapolable a la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PIQA | HellaSwag | ARC-Easy | ARC-Challenge | Licencia |
|---|---|---|---|---|---|---|---|
| Supra2-100M Base (ONNX) | 100,7 M | 1.024 (2.048 config) | 0,65 | 0,36 | 0,48 | 0,25 | Apache 2.0 |
| Supra-50M-Base | 50 M (no confirmado en la informacion) | No disponible | 0,62 | 0,32 | 0,46 | 0,25 | No disponible |
| BananaMind-2-Pro-Preview-EXP | No disponible | No disponible | 0,67 | 0,40 | 0,51 | 0,27 | No disponible |
| GPT-X-125M | 125 M (segun nombre) | No disponible | 0,65 | 0,37 | 0,51 | 0,25 | No disponible |
| OpenAI GPT-2 Small | 124 M | 1.024 | 0,62 | 0,31 | 0,39 | 0,22 | Licencia modificada de MIT |

Los modelos BananaMind-2-Pro-Preview-EXP y GPT-X-125M aparecen unicamente en la tabla de benchmarks del autor, sin enlace ni ficha tecnica en la informacion disponible, por lo que no se pueden verificar sus especificaciones. Frente a GPT-2 Small, el modelo de SupraLabs obtiene mejores resultados en las cuatro tareas reportadas con un numero de parametros ligeramente inferior, y su licencia Apache 2.0 es mas permisiva que la licencia modificada de MIT de GPT-2.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineacion: no respondera correctamente a peticiones en formato conversacional y tiende a continuar el texto del prompt en lugar de atender a una orden.
- Riesgo elevado de alucinacion y de degeneracion del texto, con repeticiones frecuentes, algo visible en el propio ejemplo incluido en la model card, donde varias frases se repiten literalmente.
- Sesgos heredados de los corpus web utilizados (fineweb-edu y dclm), sin filtrado adicional ni mitigacion documentada.
- Cobertura limitada al ingles. No hay evidencia de competencia en castellano ni en otros idiomas.
- La ventana de contexto entrenada es de solo 1.024 tokens, y la ampliacion a 2.048 esta indicada en la configuracion pero el propio autor la marca como no probada.
- La tokenizacion empaqueta secuencias sin mascara de documento, por lo que el modelo puede generar contenido que mezcle contextos de documentos distintos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero no exime de responsabilidad sobre las salidas generadas.
- La conversion a ONNX se realizo de forma automatica mediante un Space de Hugging Face; no se documentan verificaciones de equivalencia numerica frente al modelo original.
- La model card original mezcla identificadores: el ejemplo de uso en Python apunta a `SupraLabs/Supra2-100M` mientras que el modelo base declarado es `SupraLabs/Supra2-100M-Base`. Conviene verificar cual es el repositorio correcto antes de integrarlo.
- La model card aparece truncada en el apartado de notas del tokenizer, por lo que no se dispone de la informacion completa sobre la plantilla ChatML.
- El repositorio presenta 0 descargas y 1 like en el momento de la consulta, por lo que no existe evidencia de uso en produccion ni de validacion por parte de la comunidad.

## Enlaces

- Repositorio ONNX: https://huggingface.co/onnx-community/Supra2-100M-Base-ONNX
- Modelo base original: https://huggingface.co/SupraLabs/Supra2-100M-Base
- Space de conversion a ONNX utilizado: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion del pipeline de generacion de texto en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline
- Dataset de entrenamiento (70%): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de entrenamiento (30%): https://huggingface.co/datasets/HuggingFaceFW/dclm_100BT-shuffled

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a fichas de juegos de mesa sin relacion con el contenido de esta ficha.
