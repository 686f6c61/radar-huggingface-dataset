# GossetWorks/Qwen3-32B-Gosset-3.65BPW

## Resumen

GossetWorks/Qwen3-32B-Gosset-3.65BPW es una cuantizacion del modelo Qwen3-32B de Alibaba Qwen, publicada por el usuario GossetWorks bajo una tecnica propia denominada "gosset-packed" basada en reticulos E8. El objetivo declarado en los tags es comprimir el modelo base de 32B parametros hasta un peso de aproximadamente 3,65 bits por peso (BPW) para que quepa en GPUs de 16 GB de VRAM, un umbral que el Qwen3-32B original en FP16 o incluso en cuantizaciones de 4 bits estandar no alcanza comodamente.

El modelo base es Qwen3-32B, un transformer denso de aproximadamente 33.000 millones de parametros con capacidades de razonamiento en modo thinking, generacion de codigo y soporte multilingue. La cuantizacion de GossetWorks no modifica la arquitectura ni el tokenizador, sino unicamente la representacion numerica de los pesos, de modo que las capacidades funcionales dependen del modelo original y la principal variable diferencial es la fidelidad de la compresion.

La relevancia de esta publicacion es practica: propone una via para ejecutar un modelo de 32B en hardware de consumo de gama alta (16 GB) con una perdida de calidad que el autor presenta como controlada mediante el empaquetado en reticulos E8. No obstante, el repositorio es de acceso restringido, no incluye resultados de benchmarks publicados y tiene cero descargas en el momento de redactar esta ficha, por lo que debe tratarse como una propuesta tecnica a validar de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-32B) con pesos cuantizados mediante empaquetado en reticulos E8 ("gosset-packed") |
| Parametros totales | 4.989.736.320 (segun safetensors del repo cuantizado); modelo base: ~32-33B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-32B) |
| Tipos de cuantizacion | 3,65 BPW mediante esquema propietario gosset-packed con reticulo E8; no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La cuantizacion se apoya en el modelo base Qwen3-32B, un transformer denso de aproximadamente 33.000 millones de parametros desarrollado por Qwen (Alibaba). El repositorio de GossetWorks no reentrena el modelo: aplica una compresion post-entrenamiento sobre los pesos originales. La innovacion declarada es el uso de un reticulo E8 para empaquetar los pesos, una estructura de reticulos densos en 8 dimensiones que permite una cuantizacion mas eficiente que los esquemas escalares convencionales a regimenes de 3-4 bits. El resultado se etiqueta como "gosset-packed" y se orienta explicitamente a GPUs de 16 GB.

No se dispone de informacion sobre el dataset de calibracion, el numero de tokens utilizados para ajustar la cuantizacion, ni sobre si se aplicaron tecnicas de correccion de error o destilacion de pesos. Tampoco se documenta si el proceso preserva integramente las capas de atencion y MLP o si alguna se deja en mayor precision. El tamaño del repo (14,6 GB) es coherente con un modelo de 32B a ~3,65 BPW, lo que confirma que la compresion se aplica a la practica totalidad de los pesos. Cualquier afirmacion sobre calidad o fidelidad respecto al modelo original debe considerarse no verificada hasta que existan evaluaciones publicas.

## Capacidades

- Generacion de texto y razonamiento: hereda del Qwen3-32B original, incluyendo el modo thinking de Qwen3 para razonamiento paso a paso.
- Generacion de codigo: el modelo base esta entrenado para tareas de programacion en multiples lenguajes.
- Matematicas: capacidad de resolucion de problemas matematicos del modelo base.
- Soporte multilingue: el modelo base Qwen3 cubre un conjunto amplio de idiomas, aunque la cuantizacion no documenta evaluaciones por idioma.
- Tool calling / function calling: soportado por el modelo base Qwen3.
- Razonamiento multi-paso y uso en agentes: el modo thinking de Qwen3 esta disenado para este tipo de flujos.
- Capacidades especiales: modo thinking heredado; no se documentan capacidades de vision ni audio en esta cuantizacion.
- Nota: todas estas capacidades dependen de la fidelidad de la cuantizacion, que no ha sido evaluada publicamente en la informacion disponible.

## Casos de uso

- Despliegue en GPU de 16 GB: el caso de uso central del repo. Permite cargar un modelo de 32B en tarjetas como RTX 4080, RTX 4060 Ti de 16 GB o A4000, que no pueden alojar el modelo en FP16 ni en cuantizaciones de 4 bits con margen para el contexto.
- Asistente de codigo local: ejecutar Qwen3-32B en una estacion de trabajo con GPU de consumo para autocompletado, revision de codigo y explicacion de fragmentos, aprovechando la capacidad de codigo del modelo base y el bajo coste de VRAM.
- Razonamiento con modo thinking en local: usar el modelo para problemas de matematicas o logica que requieren cadena de pensamiento, en entornos donde no se quiere enviar datos a APIs externas.
- Prototipado de agentes con tool calling: construir pipelines de agentes que invoquen funciones o APIs, aprovechando el soporte de function calling del modelo base y la posibilidad de ejecutarlo en hardware modesto.
- Procesamiento de documentos con contexto largo: si el contexto del modelo base se preserva, usar la cuantizacion para resumir o extraer informacion de documentos extensos en una sola GPU de 16 GB, aunque la ventana efectiva dependera de la VRAM restante tras cargar los pesos.
- Investigacion sobre cuantizacion: servir como objeto de estudio para comparar el esquema gosset-packed/E8 frente a GGUF, AWQ o GPTQ en terminos de perplejidad y calidad downstream.
- Entornos con requisitos de privacidad: inferencia on-premise de un modelo de 32B sin depender de servicios en la nube, adecuado para datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad, y tampoco se han encontrado evaluaciones independientes del esquema gosset-packed. No es posible afirmar cuanto se degrada el rendimiento respecto al Qwen3-32B original en FP16 o BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo apunta a 16 GB de VRAM como objetivo; el tamaño de pesos es de 14,6 GB, por lo que el margen restante para KV cache y overhead del runtime es reducido (del orden de 1-1,5 GB en una GPU de 16 GB).
- GPU recomendadas: RTX 4080 (16 GB), RTX 4060 Ti 16 GB, RTX 4070 Ti Super (16 GB), A4000 (16 GB). En GPUs de 24 GB (RTX 4090, A5000, L4) habria mas margen para contexto largo.
- Cabe en GPU de consumo: si, en modelos de 16 GB, aunque con contexto limitado por la VRAM restante.
- Opciones de despliegue: no se documentan en el repo. Al estar en safetensors con un esquema de cuantizacion propietario, no es compatible directamente con llama.cpp, Ollama, vLLM o TGI sin un kernel o runtime especifico que descomprima el formato gosset-packed. La informacion disponible no indica que exista dicho runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GossetWorks/Qwen3-32B-Gosset-3.65BPW | ~32B (4.989.736.320 en safetensors cuantizado) | no disponible | 3,65 BPW gosset-packed (E8) | other, acceso restringido | Hugging Face, gated, 0 descargas |
| Qwen/Qwen3-32B (original) | ~33B | no disponible en la informacion | BF16/FP16 | licencia Qwen (ver repo) | Hugging Face, publico |
| Cuantizaciones GGUF/AWQ/GPTQ de Qwen3-32B (4 bits) | ~32B | depende del runtime | 4-5 BPW estandar | segun autor de la cuantizacion | amplia disponibilidad en Hugging Face y compatibilidad con llama.cpp, vLLM, etc. |

La comparativa se limita a estas alternativas porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastar calidad. La ventaja diferencial del modelo de GossetWorks es el regimen de 3,65 BPW con empaquetado E8; su desventaja es la falta de ecosistema de runtime y de evaluaciones publicas frente a las cuantizaciones estandar, mucho mas extendidas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es de descarga libre.
- Licencia "other": no se especifican los terminos exactos en la informacion disponible; es imprescindible revisar las condiciones antes de cualquier uso comercial, y ademas hay que respetar la licencia del modelo base Qwen3-32B.
- Sin benchmarks: no hay evidencia publicada de la degradacion de calidad respecto al modelo original; el regimen de 3,65 BPW es agresivo y puede afectar a tareas sensibles como matematicas o codigo.
- Compatibilidad de runtime desconocida: el formato gosset-packed con reticulo E8 no es un estandar soportado por llama.cpp, vLLM, Ollama o TGI segun la informacion disponible; sin un runtime especifico el modelo puede ser inutilizable en la practica.
- Riesgo de alucinacion: inherente al modelo base Qwen3-32B y potencialmente amplificado por la cuantizacion.
- Sesgos: no documentados especificamente para esta cuantizacion; heredados del modelo base.
- Contexto efectivo limitado: con 14,6 GB de pesos en una GPU de 16 GB, el espacio para KV cache es minimo, lo que reduce la ventana de contexto utilizable en la practica.
- Madurez: cero descargas y cero likes en el momento de la ficha; ausencia de validacion por la comunidad.
- Idiomas: no se documenta que idiomas preserva la cuantizacion ni si hay degradacion diferencial por idioma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GossetWorks/Qwen3-32B-Gosset-3.65BPW
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Guia de despliegue local de Qwen3-32B en GPU de 24 GB: https://baeseokjae.github.io/posts/qwen-3-32b-local-guide-2026/
