# ikimyaii/Transformer-1.3B-semi-structured-SparseGPT-90pct

## Resumen

`ikimyaii/Transformer-1.3B-semi-structured-SparseGPT-90pct` es un checkpoint derivado de `fla-hub/transformer-1.3B-100B` al que se le ha aplicado poda one-shot (sin reentrenamiento) hasta un 90 % de esparsidad semi-estructurada mediante una variante de SparseGPT. El autor introduce una modificacion en la mascara de poda: dentro de cada bloque de 128 columnas, cada fila elimina el mismo numero de entradas de menor magnitud segun la regla `w^2 / [H^-1]_jj^2`, de modo que todas las filas conservan identico numero de valores no nulos. La esparsidad medida sobre los pesos publicados es 0,8999 y se verifica en las 168 capas podadas.

El modelo no es una release de proposito general: se publica explicitamente como baseline para los modelos de la familia EHWS del mismo autor. Las capas lineales dentro de los bloques estan podadas, mientras que los embeddings y la `lm_head` permanecen densos. El resultado, segun la propia model card, es una degradacion severa de calidad: la perplejidad en WikiText-2 pasa de 9,77 a 25.272,02 y en C4 de 14,65 a 35.649,36, con una precision zero-shot media que cae de 0,4390 a 0,3270.

Su relevancia es metodologica mas que practica: documenta el comportamiento de una regla de poda con restriccion por fila a esparsidad extrema (90 %) sin recuperacion, y sirve como punto de comparacion reproducible para tecnicas de poda mas sofisticadas. El checkpoint pesa 2,7 GB en safetensors y requiere `flash-linear-attention` y `flash-attn` para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `fla-hub/transformer-1.3B-100B`, con capas de atencion de `flash-linear-attention`) |
| Parametros totales | 1.364.297.728 |
| Parametros activos | no disponible (no es MoE; la poda es estructural pero no dispersa la activacion en el sentido de MoE) |
| Longitud de contexto | no disponible (la calibracion usa secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el repo solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 0,8999 medida sobre los pesos publicados (90 % semi-estructurada, restriccion por fila) |
| Modelo base | `fla-hub/transformer-1.3B-100B` |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `fla-hub/transformer-1.3B-100B`, un transformer de 1.364 millones de parametros entrenado sobre 100.000 millones de tokens y que utiliza las capas de atencion implementadas en la libreria `flash-linear-attention` (`fla`). No se ha realizado ningun reentrenamiento ni ajuste fino tras la poda: el proceso es estrictamente one-shot.

La poda se ejecuta con el codigo oficial de `fasterprune` (la implementacion de SparseGPT) con una unica modificacion en la construccion de la mascara. En lugar de la regla N:M clasica, dentro de cada bloque de 128 columnas cada fila elimina el mismo numero de entradas de menor valor `w^2 / [H^-1]_jj^2`, donde `H^-1` es la inversa de la matriz de Hessiana aproximada. Esto impone una restriccion por fila identica a la de EHWS: todas las filas de todas las capas podadas acaban con el mismo numero de valores no nulos, lo que equilibra perfectamente el trabajo por fila en kernels dispersos. La calibracion usa el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0; los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados. Los pesos se podan en bfloat16 y el proceso completo tarda 3,0 minutos en una A100 de 40 GB. Embeddings y `lm_head` quedan densos.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base, aunque fuertemente degradada por la poda al 90 %.
- Razonamiento y conocimiento factual muy mermados: la precision zero-shot media cae a 0,3270 frente a 0,4390 del modelo denso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No dispone de modo thinking, vision ni audio.
- Interes tecnico: sirve como referencia reproducible de poda semi-estructurada con restriccion por fila a esparsidad extrema.

## Casos de uso

- Baseline de investigacion en poda: utilizar el checkpoint como referencia fija contra la que medir tecnicas de poda mas avanzadas (EHWS, recuperacion con destilacion, poda con reentrenamiento) bajo el mismo protocolo de evaluacion de perplejidad y zero-shot.
- Estudio de degradacion a esparsidad extrema: analizar como se distribuye el error entre capas y tareas cuando se fuerza un 90 % de ceros con restriccion por fila, comparando con la regla N:M estandar de SparseGPT.
- Validacion de kernels dispersos: al tener todas las filas el mismo numero de no nulos, el checkpoint permite probar y perfilar kernels de sparsity estructurada con carga por fila perfectamente balanceada.
- Reproducibilidad de experimentos: el autor documenta calibracion (128 secuencias C4 de 2.048 tokens, semilla 0), tiempo de poda (3,0 min en A100 40 GB) y protocolo de evaluacion, lo que facilita replicar el pipeline en otros modelos.
- Docencia y divulgacion: ejemplo concreto y medible de por que la poda one-shot a esparsidades muy altas sin recuperacion destruye la calidad del modelo, con cifras de perplejidad y accuracy publicadas.
- Comparacion de metodologias de mascara: contraste entre la regla por fila propuesta y la regla N:M original de SparseGPT manteniendo el resto del pipeline constante.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (conjuntos de test WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 9,77 | 14,65 |
| Este modelo | 25.272,02 | 35.649,36 |

Precision zero-shot con `lm-evaluation-harness`:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2355 | 0,2133 |
| arc_easy | 0,5602 | 0,2551 |
| boolq | 0,6199 | 0,3789 |
| hellaswag | 0,3848 | 0,2556 |
| openbookqa | 0,2120 | 0,1580 |
| rte | 0,5126 | 0,5235 |
| winogrande | 0,5478 | 0,5043 |
| Media | 0,4390 | 0,3270 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar 4-6 GB.
- GPU recomendadas: A100 40 GB (usada por el autor para la poda), H100; cualquier GPU con al menos 8 GB y soporte de bfloat16 es suficiente para inferencia.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` (`import fla`) instalado y `flash-attn` para la capa de atencion. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; al ser safetensors en bfloat16, la conversion a GGUF no esta disponible de fabrica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esparsidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 1,36 B | no disponible | 90 % semi-estructurada por fila | no disponible | Hugging Face |
| `fla-hub/transformer-1.3B-100B` (denso) | 1,36 B | no disponible | 0 % | no disponible | Hugging Face |
| SparseGPT N:M estandar sobre el mismo base | 1,36 B | no disponible | segun configuracion N:M | no disponible | no disponible en la informacion |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referencia en la model card) |

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad de 25.272,02 en WikiText-2 y 35.649,36 en C4, ordenes de magnitud por encima del modelo denso. No es apto para uso en produccion ni para generacion de texto fiable.
- Precision zero-shot media de 0,3270, con caidas notables en arc_easy (0,5602 a 0,2551) y boolq (0,6199 a 0,3789).
- Riesgo elevado de alucinacion y de texto incoherente por la perdida masiva de capacidad tras la poda sin recuperacion.
- Licencia no disponible: no puede asumirse uso comercial sin verificar la licencia del modelo base `fla-hub/transformer-1.3B-100B`.
- Idiomas soportados no documentados; la evaluacion se limita a tareas en ingles del harness.
- Longitud de contexto no documentada; la calibracion se hizo con secuencias de 2.048 tokens, lo que no garantiza buen comportamiento mas alla.
- Dependencias de carga especificas: requiere `flash-linear-attention` y `flash-attn`, lo que limita su portabilidad a stacks de inferencia habituales.
- El checkpoint se publica como baseline metodologico, no como modelo de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Transformer-1.3B-semi-structured-SparseGPT-90pct
- Modelo base: https://huggingface.co/fla-hub/transformer-1.3B-100B
- Libreria `flash-linear-attention`: no disponible en la informacion proporcionada
- Paper de SparseGPT: no disponible en la informacion proporcionada
- Repositorio `fasterprune`: no disponible en la informacion proporcionada
- Protocolo de evaluacion ELSA: no disponible en la informacion proporcionada
