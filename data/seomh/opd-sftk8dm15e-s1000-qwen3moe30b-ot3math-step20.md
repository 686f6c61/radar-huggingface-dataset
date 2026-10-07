# seomh/opd-sftk8dm15e-s1000-qwen3moe30b-ot3math-step20

## Resumen

Modelo publicado en HuggingFace por el usuario seomh bajo el identificador `opd-sftk8dm15e-s1000-qwen3moe30b-ot3math-step20`. Por el nombre del repositorio, todo apunta a un ajuste supervisado (SFT) sobre un modelo de la familia Qwen3 orientado a tareas de matematicas (el fragmento "ot3math" sugiere OpenThoughts3 u otra fuente de datos matematicos), capturado en el paso 20 de entrenamiento. Sin embargo, el recuento real de parametros que reportan los ficheros safetensors es de 8.190.735.360 (unos 8,19 mil millones), una cifra que no coincide con los 30.000 millones que insinua el nombre y que se aproxima mucho a un Qwen3-8B.

El repositorio ocupa 16,4 GB, coherente con un checkpoint en bf16/fp16 sin cuantizar (2 bytes por parametro sobre 8,19 B). No hay informacion sobre licencia, idiomas soportados, pipeline ni datos de entrenamiento, y la validacion comunitaria es practicamente nula en el momento de redactar esta ficha (11 descargas y 0 me gusta).

Se trata, por tanto, de un artefacto experimental de investigacion mas que de un modelo listo para produccion. La discrepancia entre el nombre y el numero real de parametros, la ausencia de licencia y la falta de documentacion obligan a tratarlo con cautela y a verificar su procedencia antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada. La etiqueta "qwen3" sugiere un transformer derivado de Qwen3; el nombre apunta a variante MoE, no verificado |
| Parametros totales | 8.190.735.360 (8,19 B) segun ficheros safetensors |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica del repositorio. Por el identificador se deduce que es el resultado de un proceso de ajuste supervisado (SFT) sobre un modelo base de la familia Qwen3, con datos de matematicas ("ot3math") y registrado en el paso 20 de entrenamiento ("step20"). El segmento "k8dm15e-s1000" podria corresponder a un identificador de configuracion de entrenamiento y al numero de muestras, pero esto no puede confirmarse con la informacion disponible.

Existe una inconsistencia relevante: el nombre indica "qwen3moe30b" (es decir, Qwen3 MoE de 30.000 millones), mientras que el recuento real de parametros en safetensors es de 8,19 B. Esto podria deberse a un error de etiquetado, a un modelo base distinto (por ejemplo, Qwen3-8B), a un recorte de pesos o a un checkpoint parcial. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas aplicadas. Todo ello queda como "no disponible".

## Capacidades

- No se han documentado capacidades de forma oficial en la informacion disponible.
- Por el nombre ("ot3math") es probable que este orientado a razonamiento matematico, aunque no esta verificado.
- Generacion de texto general: no confirmada.
- Razonamiento paso a paso / cadenas de pensamiento: no confirmado.
- Generacion de codigo: no confirmada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Debido a la ausencia de documentacion, los siguientes casos son provisionales y dependen de que se verifiquen las capacidades reales del modelo. Se plantean sobre la hipotesis de un ajuste SFT orientado a matematicas y texto generico.

- Resolucion de problemas matematicos asistida: si el ajuste con datos tipo OpenThoughts3 es efectivo, podria emplearse para generar demostraciones paso a paso en entornos educativos o de investigacion, siempre que se valide su tasa de acierto antes de usarlo.
- Generacion de datasets sinteticos matematicos: como generador de problemas y soluciones para aumentar corpus de entrenamiento, con revision humana posterior.
- Experimentacion academica en SFT: util como punto de comparacion en estudios sobre ajuste supervisado y tecnicas de destilacion, dado su bajo coste de inferencia (8,19 B).
- Prototipado local en GPU de consumo: al caber en tarjetas de 16-24 GB en bf16 y en 8-12 GB cuantizado, sirve para pruebas rapidas de pipelines en un solo equipo.
- Investigacion de procedencia y trazabilidad de checkpoints: util como caso de estudio sobre discrepancias entre nombre de repositorio y contenido real de pesos.
- Base para nuevos ajustes (fine-tuning posterior): puede servir como punto de partida para tareas especializadas, verificando antes la licencia y el modelo base real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los pesos ocupan aproximadamente 16,4 GB (coincide con el tamano del repositorio); con cache KV y activaciones, se recomienda un minimo de 20-24 GB de VRAM.
- VRAM estimada cuantizado a 8 bits: en torno a 9-10 GB.
- VRAM estimada cuantizado a 4 bits (Q4): en torno a 5-6 GB, aunque requiere convertir los pesos (no hay GGUF en el repositorio).
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB para bf16; RTX 4090, RTX 3090 o A10G (24 GB) para bf16 justo; RTX 4080/4070 Ti Super y RTX 4060 Ti 16 GB para cuantizacion de 8/4 bits.
- Cabe en GPU de consumo: si, con cuantizacion en tarjetas de 8-16 GB; en bf16 requiere 24 GB.
- Opciones de despliegue: al estar solo en safetensors, es compatible con transformers, vLLM y TGI. Para llama.cpp u Ollama habria que convertir a GGUF, paso no documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| opd-sftk8dm15e-s1000-qwen3moe30b-ot3math-step20 | 8,19 B (segun safetensors) | no disponible | no disponible | HuggingFace (11 descargas) |
| Qwen3-8B | 8,2 B | 32.768 tokens nativos, ampliable a 131.072 | Apache 2.0 | HuggingFace, ampliamente validado |
| Qwen3-30B-A3B (MoE) | 30,5 B totales / 3,3 B activos | 32.768 tokens nativos, ampliable a 131.072 | Apache 2.0 | HuggingFace, ampliamente validado |
| Llama-3.1-8B | 8,03 B | 131.072 tokens | Licencia comunitaria Llama 3.1 | HuggingFace, ampliamente validado |

Nota: los datos de los modelos de referencia proceden de su documentacion publica; la comparativa de rendimiento no puede establecerse porque este checkpoint no reporta resultados.

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial ni las condiciones de redistribucion; riesgo legal para produccion.
- Discrepancia critica entre el nombre ("qwen3moe30b") y el recuento real de parametros (8,19 B), lo que impide saber con certeza cual es el modelo base subyacente.
- Ausencia total de documentacion: se desconoce el dataset de entrenamiento, el numero de tokens y el metodo (SFT, RLHF, DPO).
- Riesgo de sesgos no evaluados al no conocerse la composicion de los datos de entrenamiento.
- Riesgo de alucinacion alto y sin cuantificar: no hay benchmarks que midan fidelidad factual.
- Idiomas soportados no especificados; no se puede asumir un buen rendimiento en castellano.
- Posible contaminacion del dataset de entrenamiento con las propias tareas de evaluacion, lo que invalidaria resultados si se midieran.
- Validacion comunitaria practicamente nula (11 descargas, 0 me gusta): poca o ninguna revision por terceros.
- Fecha de creacion registrada como 2026-10-07, posterior a la fecha habitual de publicacion; conviene verificar la autenticidad del repositorio.
- No hay versiones cuantizadas publicadas, lo que obliga a convertir pesos para despliegues ligeros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/seomh/opd-sftk8dm15e-s1000-qwen3moe30b-ot3math-step20
