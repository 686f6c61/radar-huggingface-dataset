# budget-internalization-iclr2027/qwen3.5-4b-4k-sft-pumpedjackal-s90

## Resumen

`qwen3.5-4b-4k-sft-pumpedjackal-s90` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario `budget-internalization-iclr2027` como parte de un envío anónimo a ICLR 2027. El modelo se ha entrenado con soluciones generadas por el propio Qwen3.5-4B sobre problemas de matemáticas del dataset `agentica-org/DeepScaleR-Preview-Dataset`, filtradas por corrección (rejection-sampling fine-tuning) y restringidas a respuestas de como máximo 4.000 tokens. El checkpoint publicado corresponde al paso 90 de una ejecución con nombre en clave `pumpedjackal`.

El interés de esta ficha no está en el rendimiento bruto, sino en su naturaleza de artefacto de investigación: explora cómo internalizar un presupuesto de tokens (token budget) en un modelo de razonamiento matemático de 4.660 millones de parámetros. La secuencia máxima de entrenamiento es de 18.432 tokens y los pesos se distribuyen en BF16, con licencia Apache 2.0 heredada del modelo base. Se trata de un modelo de nicho, orientado a matemáticas y razonamiento, no de un modelo generalista.

No se han publicado resultados de benchmarks, idiomas soportados ni detalles de arquitectura más allá de lo indicado en la model card. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación externa de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de la familia Qwen3.5; pipeline declarado: image-text-to-text) |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible en inferencia; la secuencia maxima durante el entrenamiento fue de 18.432 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; los pesos estan en BF16 y admiten cuantizacion posterior (GGUF, GPTQ, AWQ, bitsandbytes) por ser un modelo transformers estandar |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

No se proporcionan detalles de arquitectura en la informacion disponible: la model card solo indica que es un ajuste fino de Qwen/Qwen3.5-4B, etiquetado con `qwen3_5` y `transformers`, y que el pipeline declarado es `image-text-to-text`. Esto sugiere que el modelo base pertenece a la familia Qwen3.5 y que su procesador admite entradas de imagen y texto, aunque el ajuste fino aqui descrito se ha realizado exclusivamente sobre datos textuales de matematicas, por lo que no hay garantia de que las capacidades de vision se conserven intactas.

El entrenamiento es un SFT clasico con perdida de next-token sobre la respuesta. Los datos son soluciones autogeneradas por Qwen3.5-4B a problemas de `agentica-org/DeepScaleR-Preview-Dataset`, filtradas por correccion (rejection sampling), usando el subconjunto `4k` (una solucion por problema, con respuestas de 4.000 tokens o menos). La configuracion reportada es: secuencia maxima de 18.432 tokens, lote de 32 secuencias por paso, optimizador Adam con schedule coseno y LR maxima de 5e-06, 3 epocas y 90 pasos en total. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de etiquetas `\boxed{}`. No se menciona RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento paso a paso orientado a problemas matematicos, con formato de respuesta forzado a `\boxed{}` segun el prompt de entrenamiento.
- Resolucion de problemas de matematicas de nivel competitivo procedentes del dataset DeepScaleR, con cadenas de razonamiento de hasta 4.000 tokens en los datos de entrenamiento.
- Ajuste especifico para respetar un presupuesto de tokens en la respuesta, que es el objeto de estudio del envio a ICLR 2027.
- Conversacion multi-turno: la etiqueta `conversational` indica que el modelo se ha preparado para plantillas de chat, y la model card usa la plantilla del modelo base.
- Compatibilidad con despliegue estandar de transformers (safetensors + BF16) y con servidores compatibles con el endpoint de HuggingFace (`endpoints_compatible`).
- Capacidades multimodales: el pipeline `image-text-to-text` del modelo base sugiere entrada de imagen, pero no se documenta ningun entrenamiento ni evaluacion multimodal en este checkpoint, por lo que no debe asumirse.
- Tool calling, function calling, agentes y multi-step reasoning: no documentados en la informacion disponible.

## Casos de uso

- Investigacion sobre internalizacion de presupuesto de tokens: el modelo es un punto de comparacion directo para estudiar si un SFT sobre respuestas cortas (maximo 4.000 tokens) reduce la longitud de las cadenas de razonamiento sin degradar la exactitud, que es la hipotesis del envio anonimo a ICLR 2027.
- Generacion de datos sinteticos de matematicas: al ser un modelo pequeno y con licencia Apache 2.0, puede usarse para producir soluciones candidatas sobre problemas de estilo DeepScaleR y filtrarlas despues por correccion, alimentando asi nuevos ciclos de rejection-sampling fine-tuning.
- Tutoria matematica automatica en entornos educativos: el prompt de entrenamiento produce soluciones explicadas paso a paso y con la respuesta final delimitada, un formato facil de parsear para integrarlo en plataformas de ejercicios con correccion automatica.
- Componente de bajo coste en un pipeline de razonamiento en cascada: por su tamano de 4,66 mil millones de parametros, puede actuar como primer nivel que resuelve los problemas sencillos y delega en un modelo mayor solo los casos donde no alcanza el resultado correcto.
- Reproduccion de experimentos de SFT sobre modelos Qwen3.5: la model card documenta hiperparametros completos (LR, epocas, pasos, lote, longitud de secuencia), lo que permite replicar la receta en otros subconjuntos de datos o en otros tamanos de la familia.
- Despliegue on-premise para procesamiento de problemas matematicos con requisitos de privacidad: al caber en una GPU de consumo con cuantizacion, puede ejecutarse en infraestructura local sin enviar enunciados a servicios externos.
- Evaluacion de robustez de modelos destilados por rejection sampling: sirve como caso de estudio de los fallos tipicos de este metodo (sobreajuste al formato, colapso de diversidad de soluciones, dependencia del filtro de correccion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye tablas de MMLU, GSM8K, MATH, HumanEval ni ninguna otra metrica, y los resultados de la busqueda web no aportan datos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,3 GB solo para pesos (4,66 mil millones de parametros x 2 bytes), mas cache KV y activaciones; en la practica conviene reservar entre 12 y 16 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5 GB de pesos y 7-9 GB de uso total.
- VRAM estimada en cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4_K_M): en torno a 2,5-3 GB de pesos y 4-6 GB de uso total.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o L4 para despliegues con vLLM; A10G o RTX 4090 para inferencia de un solo flujo con contexto amplio.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o RTX 4080 con BF16 para contextos moderados; en RTX 3060 de 12 GB, RTX 4070 o similares es recomendable cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers con `AutoModelForCausalLM`, vLLM (`vllm serve`, mencionado explicitamente en la model card) y, al ser un modelo transformers estandar con pesos safetensors, conversion a GGUF para llama.cpp u Ollama y uso con TGI.
- Latencia y throughput: no se han publicado mediciones. Cualquier cifra deberia obtenerse midiendo sobre el hardware objetivo, ya que la longitud de la cadena de razonamiento varia mucho segun el problema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-4k-sft-pumpedjackal-s90 | 4,66 mil millones | Entrenamiento a 18.432 tokens; contexto de inferencia no disponible | Sin benchmarks publicados | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | La del modelo base (no confirmada en esta ficha) | HuggingFace, modelo de referencia |
| Otras alternativas de ~4B especializadas en matematicas | No disponible | No disponible | No disponible | No disponible | No disponible |

Solo puede compararse con garantias frente a su modelo base, Qwen/Qwen3.5-4B, del que hereda arquitectura, tokenizador y licencia; la diferencia es el ajuste SFT sobre soluciones autofiltradas de DeepScaleR. No se dispone de datos de benchmarks del checkpoint como para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes, sin evaluaciones publicadas ni resultados reproducibles por terceros.
- Es un artefacto de investigacion anonimo asociado a un envio a ICLR 2027; no debe tratarse como un modelo listo para produccion sin una evaluacion propia.
- Riesgo elevado de alucinacion en matematicas: el entrenamiento se basa en soluciones autogeneradas y filtradas por correccion, lo que puede reforzar atajos y razonamientos plausibles pero incorrectos, especialmente fuera de la distribucion de DeepScaleR.
- Posible sobreajuste al formato `\boxed{}` y a la plantilla de prompt de entrenamiento; otros formatos de instruccion pueden degradar el rendimiento.
- Sesgos conocidos: no documentados en la informacion disponible. Al no declararse idiomas soportados, se desconoce su comportamiento fuera del ingles de los problemas de entrenamiento.
- Capacidades multimodales inciertas: la etiqueta `image-text-to-text` procede del modelo base y no hay evidencia de que se hayan preservado tras un SFT exclusivamente textual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor indica que el modelo hereda la licencia de Qwen/Qwen3.5-4B, por lo que conviene verificar los terminos del modelo base antes de un despliegue comercial.
- El contexto de inferencia no esta declarado; la cifra de 18.432 tokens corresponde a la longitud maxima de secuencia usada en entrenamiento, no necesariamente a la ventana util del modelo.
- No hay informacion sobre herramientas, agentes, function calling ni modo de pensamiento explicito, por lo que no deben asumirse estas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-sft-pumpedjackal-s90
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada (el envio a ICLR 2027 es anonimo y no se enlaza desde la model card)
- Resultados de la busqueda web: no se ha encontrado ningun recurso relevante sobre el modelo; los resultados devueltos correspondian a sitios de presupuestos publicos y alquiler de vehiculos, sin relacion con este checkpoint.
