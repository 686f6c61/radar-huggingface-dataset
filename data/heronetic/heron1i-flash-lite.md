# Heronetic/heron1i-flash-lite

## Resumen

heron1i-flash-lite es un modelo de lenguaje base de 9,9 millones de parametros entrenado desde cero por Heronetic LLC para generacion de texto en ingles y codigo. Se trata de un transformer decoder-only de arquitectura propia, con 14 capas, anchura de 240 y una ventana de contexto de solo 1.024 tokens. No es un modelo instruido: continua texto a partir de un prompt y no sigue ordenes ni mantiene formato conversacional de forma fiable.

Su relevancia no esta en el rendimiento bruto, que es bajo en terminos absolutos, sino en dos factores. Primero, es un modelo extremadamente ligero: con menos de 10 millones de parametros cabe en cualquier equipo, incluido un portatil sin GPU, y sirve como banco de pruebas para investigacion sobre arquitecturas, tokenizadores y tecnicas de atencion. Segundo, incorpora decisiones de diseno poco habituales en modelos de este tamano, como atencion exclusiva (XSA), convoluciones causales de 3 taps sobre las proyecciones Q/K/V, RoPE medio truncado y un tokenizador TokenMonster con todos los numeros divididos en digitos individuales.

El entrenamiento se realizo integramente con datos publicos: 24.000 millones de tokens, de los cuales 19.200 millones con tasa de aprendizaje constante y 2.400 millones adicionales en una fase de decaimiento con mezcla desplazada hacia matematicas y libros de texto. La licencia es "other" y no especifica terminos concretos, lo que supone una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion agrupada (GQA), QK-norm, convolucion causal de 3 taps sobre Q/K/V, atencion exclusiva (XSA), SwiGLU, RMSNorm |
| Parametros totales | 9.924.188 (embedding atado a la cabeza de salida) |
| Longitud de contexto | 1.024 tokens (las capas 3, 7, 11 y 13 atienden al contexto completo; el resto, a los 256 tokens previos) |
| Tipos de cuantizacion | no disponible (el autor solo documenta ejecucion en float32; no se publican pesos cuantizados) |
| Idiomas soportados | Ingles (con soporte de codigo) |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | safetensors con custom_code (requiere trust_remote_code=True) |
| Numero de capas | 14 |
| Anchura del modelo | 240 |
| Cabezas de atencion | 6 cabezas de query y 3 de key-value, de tamano 40 cada una |
| Tokenizador | TokenMonster englishcode-4096 con numeros divididos en digitos; vocabulario ampliado a 4.160 con BOS/EOS/PAD |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con varias modificaciones sobre el diseno estandar. La atencion usa agrupacion de queries con 6 cabezas Q y 3 cabezas KV de 40 dimensiones, normalizacion QK y normalizacion RMSNorm en el flujo residual. Cada posicion mezcla informacion de las dos anteriores mediante una convolucion causal residual de 3 taps aplicada sobre las proyecciones de query, key y value. La salida de atencion pasa por una puerta sigmoide por cabeza y despues por atencion exclusiva (XSA), que elimina la direccion de valor propia de cada cabeza para reducir redundancia entre cabezas.

Las posiciones se codifican con RoPE medio truncado: solo la mitad de las dimensiones de cada cabeza rotan (con frecuencias que van de 1 a 1/1024 por token) y la otra mitad no lleva informacion posicional. El bloque MLP usa SwiGLU con anchura 640. La salida de logits lleva un soft cap con tanh a 15. Respecto al contexto, no todas las capas ven los 1.024 tokens: las capas 3, 7, 11 y 13 atienden al contexto completo y las demas solo a los 256 tokens previos, lo que reduce coste de computo en las capas intermedias.

El entrenamiento se hizo desde cero, sin pesos preentrenados de terceros, sobre 24.000 millones de tokens. La fase estable (19.200 millones) uso Ultra-FineWeb al 41,7%, DCLM-Edu con puntuacion educativa 3+ al 30,3%, Cosmopedia v2 al 16%, FineMath-3+ al 5%, OpenMathInstruct-2 al 3%, InfiWebMath-3+ al 2% y SmolTalk al 2%. La fase de decaimiento (2.400 millones) desplazo la mezcla hacia matematicas y libros de texto: Ultra-FineWeb 35%, DCLM-Edu 7%, Cosmopedia v2 25%, FineMath-3+ 15%, OpenMathInstruct-2 13% y SmolTalk 5%. No se documenta RLHF, DPO ni ninguna fase de ajuste por preferencias: es un modelo puramente base.

## Capacidades

- Continuacion de texto en ingles: genera texto coherente a corto plazo a partir de un prompt, con un limite practico marcado por su contexto de 1.024 tokens.
- Generacion de fragmentos de codigo: parte del corpus de entrenamiento (TokenMonster englishcode y datos web) incluye codigo, aunque no se documenta ningun benchmark especifico de programacion.
- Aritmetica basica: el tokenizador divide todos los numeros en digitos individuales y la mezcla final prioriza matematicas, lo que favorece el calculo digito a digito. El benchmark ArithMark-3 le otorga 35,60.
- Razonamiento de sentido comun limitado: obtiene 28,36 en HellaSwag y 58,54 en PIQA, valores propios de un modelo de este tamano.
- Manejo exacto de padding: los resultados por lotes y de una sola fila coinciden, util para evaluacion con lm-evaluation-harness.
- Insercion automatica de BOS: el modelo anade un token BOS a cualquier entrada que no empiece por uno, replicando el formato de entrenamiento.
- Capacidades no soportadas: no hay tool calling, no hay function calling, no hay modo de razonamiento explicito, no hay agentes, no hay vision, no hay audio y no hay ajuste por instrucciones.

## Casos de uso

- Investigacion en arquitecturas de atencion: el modelo implementa XSA, convoluciones Q/K/V y RoPE medio truncado en un paquete de 10 millones de parametros, lo que permite ablacionar o modificar estos componentes en horas en lugar de semanas.
- Docencia y prototipado educativo: sirve para demostrar el ciclo completo de entrenamiento e inferencia de un LLM (tokenizacion, forward pass, generacion con muestreo) en un portatil sin GPU, con un coste computacional trivial.
- Evaluacion de tokenizadores: al usar TokenMonster englishcode-4096 con separacion de digitos, es un banco de pruebas para medir como afecta la tokenizacion numerica a tareas aritmeticas en modelos pequenos.
- Pruebas de pipelines de evaluacion: al manejar el padding de forma exacta y funcionar con lm-evaluation-harness, es adecuado para validar scripts de evaluacion zero-shot antes de ejecutarlos en modelos grandes.
- Generacion de texto de relleno y datos sinteticos de baja calidad controlada: util para generar corpus de prueba en pipelines de ingestado, indexado o busqueda, donde se necesita texto realista sin coste de API.
- Modelos de juguete para entornos embebidos y demostraciones: con 9,9 millones de parametros en float32 ocupa unos 40 MB, por lo que puede embeberse en demos offline o aplicaciones de escritorio sin dependencia de red.
- Estudio de destilacion y modelos de alumnos: actua como alumno o como referencia minima en experimentos de destilacion desde modelos mayores, dado su tamano y su licencia permisiva en la practica (pendiente de aclarar).

## Benchmarks y rendimiento

Resultados zero-shot con normalizacion por longitud de respuesta (acc_norm) obtenidos con lm-evaluation-harness y el script oficial de ArithMark-3, segun la model card:

| Benchmark | Resultado |
|---|---:|
| HellaSwag | 28,36 |
| ARC-Easy | 36,20 |
| ARC-Challenge | 24,15 |
| PIQA | 58,54 |
| ArithMark-3 | 35,60 |
| Intelligence Index | 10,31 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada: aproximadamente 40 MB en float32, 20 MB en float16/bfloat16 y 10 MB en int8. En la practica, cualquier GPU con mas de 1 GB de memoria lo ejecuta sin problema.
- GPU recomendadas: ninguna en particular. Funciona en CPU, en iGPU y en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, A100, H100). El cuello de botella sera el lanzamiento de kernels, no la memoria.
- Cabe en GPU de consumo: si, en todas las GPU de consumo actuales y en la mayoria de GPU integradas. Tambien funciona en CPU pura, como indica el autor.
- Opciones de despliegue: unicamente transformers con trust_remote_code=True (PyTorch puro, sin dependencias adicionales). No se documentan pesos GGUF, ni soporte para llama.cpp, Ollama, vLLM, TGI ni TensorRT-LLM.
- Latencia y throughput: no disponibles. Al ser un modelo de 10 millones de parametros, la generacion en CPU es viable, pero el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks comparables |
|---|---|---|---|---|
| heron1i-flash-lite | 9,9 M | 1.024 | other (no especificada) | HellaSwag 28,36; ARC-E 36,20; PIQA 58,54 |
| Pythia-14M | 14 M | 2.048 | Apache 2.0 | no disponible en la informacion proporcionada |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | no disponible en la informacion proporcionada |

La comparacion directa de rendimiento no es posible con los datos disponibles. Como referencia cualitativa, heron1i-flash-lite es entre 10 y 14 veces mas pequeno que SmolLM-135M y ligeramente menor que Pythia-14M, pero usa un contexto mas corto (1.024 frente a 2.048 tokens) y una licencia menos clara que las alternativas Apache 2.0.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue ordenes, no respeta formatos de chat y puede ignorar por completo la intencion del prompt.
- Rendimiento bajo en terminos absolutos: un 28,36 en HellaSwag y un 24,15 en ARC-Challenge estan cerca del azar en tareas de opcion multiple, por lo que no es apto para tareas que requieran razonamiento fiable.
- Riesgo elevado de alucinacion: al no tener alineacion ni verificacion factual, genera afirmaciones plausibles pero falsas con frecuencia, especialmente mas alla de unas pocas decenas de tokens.
- Contexto muy limitado: 1.024 tokens, y ademas solo cuatro capas atienden al rango completo. En la practica, la coherencia se degrada bastante antes de alcanzar ese limite.
- Solo ingles: no hay soporte documentado de castellano ni de otros idiomas. El uso en espanol producira resultados pobres y mezcla de idiomas.
- Licencia "other" sin terminos explicitos: no se puede confirmar que el uso comercial este permitido. Conviene contactar con Heronetic LLC antes de integrarlo en un producto.
- Requiere trust_remote_code=True: implica ejecutar codigo Python personalizado del repositorio. Hay que auditar ese codigo antes de desplegarlo en entornos de produccion o con datos sensibles.
- Proyecto con muy poca traccion: 16 descargas y 1 like en el momento de la consulta, sin comunidad, sin issues documentadas y sin garantias de mantenimiento.
- El autor indica que el tamano del repositorio es de 0,0 GB, lo que sugiere que los pesos pueden estar almacenados de forma poco convencional o que la metrica no esta bien calculada; conviene verificar el contenido real del repositorio antes de descargarlo.
- No hay cuantizaciones publicadas: no existen pesos GGUF ni versiones optimizadas para llama.cpp u Ollama, lo que limita las opciones de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Heronetic/heron1i-flash-lite
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a vehiculos aereos no tripulados IAI Heron y a un kiosco de autoservicio llamado Heron 1, sin relacion con este modelo de lenguaje. No hay paper, blog, repositorio ni demo adicionales disponibles.
