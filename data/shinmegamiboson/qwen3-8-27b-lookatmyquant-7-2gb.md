# shinmegamiboson/Qwen3.8-27B-LookAtMyQuant-7.2GB

## Resumen

Qwen3.8-27B-LookAtMyQuant-7.2GB es una cuantizacion extrema del modelo Qwen3.8-27B (53,7 GB en precision original) comprimido hasta 7,2 GB, lo que equivale a unos 2,1 bits por peso. Lo desarrolla el autor independiente shinmegamiboson mediante su compilador de cuantizacion LookAtMyQuant, y se distribuye en un formato empaquetado propietario (`opgraph-packed-1`) que solo puede leer su propio runtime para Apple Silicon basado en MLX. El objetivo es claro: ejecutar un modelo de 27B en memoria unificada de un Mac con chip de la serie M, manteniendo una fidelidad alta respecto al original.

La relevancia de esta publicacion no esta tanto en el modelo base (Qwen3.8-27B, de Qwen/Alibaba) como en la tecnica de compresion: asignacion de tasas de bits por fila de matriz guiada por informacion de Fisher, codificacion trellis y un ajuste fino posterior de 7.600 pasos para recuperar la distribucion del original. Segun la model card, el resultado iguala al original en el benchmark de matematicas de respuesta exacta (74,3% en ambos) y supera al GGUF `UD-IQ2_XXS` de Unsloth del mismo tamano en MMLU, GSM8K y matematicas.

Es, por tanto, un artefacto de investigacion sobre cuantizacion mas que un modelo de proposito general: esta calibrado y ajustado especificamente para ingles, codigo y matematicas, y el propio autor advierte que en otros idiomas se aleja mas del original que el GGUF comparable. No se dispone de datos publicados sobre arquitectura interna, contexto o licencia en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3.8-27B; tag `qwen3_5`) |
| Parametros totales | 27B (heredados del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion propia LookAtMyQuant a ~2,1 bits por peso (7,2 GB desde 53,7 GB); formato empaquetado `opgraph-packed-1` |
| Idiomas soportados | Ingles (declarado); calibrado para ingles, codigo y matematicas |
| Licencia | no disponible |
| Formato de pesos | `weights.bin` + `artifact.json` (formato propietario `opgraph-packed-1`), no safetensors ni GGUF; config, tokenizer y chat template en JSON/Jinja de Qwen3.8-27B |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se detalla en la informacion disponible; los tags de Hugging Face incluyen `qwen3_5`, lo que sugiere una variante de la familia Qwen3.5, pero no se confirman detalles de transformer denso, MoE o hibrido. Lo que si se documenta es el proceso de cuantizacion: el recipe LookAtMyQuant 2 asigna a cada fila de cada matriz una tasa de bits derivada de la informacion de Fisher medida sobre este modelo concreto, codifica los pesos con codificacion trellis a esas tasas y despues ajusta finamente el modelo codificado durante 7.600 pasos para que coincida con el original sobre texto generado por el propio original (destilacion sobre datos propios).

La calibracion y el ajuste fino se realizaron sobre prosa inglesa, chat, codigo y matematicas, lo que explica el sesgo del artefacto hacia esos dominios. El resultado es un modelo de 7,2 GB que, segun el autor, conserva la calidad del original en matematicas y se queda cerca en codigo y conocimiento general, con divergencia KL respecto a la distribucion del original de 0,154 nats/token en chat y 0,180 en codigo (frente a 0,206 y 0,232 del GGUF comparable).

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat de Qwen3.8-27B y soporte de modo thinking (`enable_thinking` en la plantilla).
- Razonamiento matematico: resuelve problemas de respuesta exacta al mismo nivel que el modelo original (401 de 540).
- Generacion de codigo: 73,8% en HumanEval, ligeramente por debajo del original (77,4%) pero por encima del GGUF de 2 bits (67,1%).
- Conocimiento general y sentido comun: MMLU 78,8%, ARC-Challenge 58,9%, HellaSwag 78,6%.
- Razonamiento aritmetico de varios pasos: GSM8K 94,5%.
- Capacidades multilingues: limitadas; el artefacto esta calibrado solo para ingles y el autor advierte de mayor degradacion en otros idiomas.
- Tool calling, function calling y comportamiento agentico: no documentados en la informacion disponible (dependen del modelo base, sin confirmar para esta cuantizacion).

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el caso de uso principal. Con 7,2 GB de memoria y ~17 tokens/s en un M5 Max, permite ejecutar un modelo de 27B en un portatil sin GPU dedicada, usando el runtime `fast_q35` sobre MLX.
- Asistente de matematicas y resolucion de problemas: dado que iguala al original en el benchmark de 540 problemas de respuesta exacta, es adecuado para tutoria, verificacion de calculos y generacion de soluciones paso a paso en ingles.
- Generacion de codigo en local para desarrollo: con 73,8% en HumanEval y buen comportamiento en codigo (KL de 0,180), sirve para autocompletado, explicacion de fragmentos y generacion de tests en un entorno de desarrollo sin conexion.
- Prototipado de agentes conversacionales en ingles: la plantilla de chat de Qwen3.8-27B y el modo thinking permiten construir asistentes multi-turno, siempre que se validen las capacidades de tool calling del modelo base.
- Evaluacion de tecnicas de cuantizacion: el artefacto es util como referencia para investigadores que comparen metodos de compresion extrema (LookAtMyQuant frente a GGUF IQ2) con metricas de KL y benchmarks estandar.
- Procesamiento de texto en lotes sin infraestructura cloud: para tareas de resumen, clasificacion o extraccion sobre corpus en ingles donde la privacidad o el coste de API sean restrictivos, con throughput moderado (~17 tok/s).
- Educacion e investigacion en entornos con hardware limitado: permite a estudiantes experimentar con un modelo de 27B en un equipo de consumo, algo inviable con los pesos originales de 53,7 GB.

## Benchmarks y rendimiento

Datos publicados en la model card (porcentaje de respuestas correctas):

| Benchmark | Este archivo (7,2 GB) | Unsloth `UD-IQ2_XXS` (7,2 GB) | Original (53,7 GB) |
|---|---|---|---|
| Matematicas, 540 problemas de respuesta exacta | 74,3% | 64,4% | 74,3% |
| HumanEval | 73,8% | 67,1% | 77,4% |
| MMLU | 78,8% | 75,0% | 83,5% |
| GSM8K | 94,5% | 92,7% | 95,5% |
| ARC-Challenge | 58,9% | 59,2% | 59,2% |
| HellaSwag | 78,6% | 79,3% | 82,9% |

Divergencia KL respecto a la distribucion del original (nats/token, menor es mejor):

| Dominio | Este archivo | Unsloth `UD-IQ2_XXS` |
|---|---|---|
| Chat | 0,154 | 0,206 |
| Codigo | 0,180 | 0,232 |
| Prosa inglesa | 0,170 | 0,184 |
| WikiText | 0,258 | 0,233 |

Segun el autor, frente al GGUF con p < 0,05 este archivo esta por delante en MMLU, GSM8K y matematicas, empatado en ARC-Challenge y HumanEval, y por detras en HellaSwag.

## Requisitos de hardware

- Memoria: 7,6 GB de memoria unificada en uso real segun el autor (fichero de 7,2 GB).
- Hardware objetivo: Mac con Apple Silicon (M1/M2/M3/M4/M5 y variantes Pro/Max/Ultra); el runtime es especifico de MLX.
- Rendimiento medido: ~17 tokens/s en un M5 Max.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por el runtime incluido; el formato `opgraph-packed-1` no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Despliegue: clonar el repositorio LookAtMyQuant, descargar el modelo con `hf download` y cargarlo con `fast_q35.load()` sobre `mlx_lm`.
- VRAM estimada en GPU convencional: no aplica, al no existir pesos en safetensors ni GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3.8-27B-LookAtMyQuant-7.2GB | 27B | 7,2 GB (~2,1 bits/peso) | no disponible | no disponible | `opgraph-packed-1`, solo runtime MLX propietario |
| Unsloth `UD-IQ2_XXS` de Qwen3.8-27B | 27B | 7,2 GB | no disponible | no disponible | GGUF, llama.cpp y derivados |
| Qwen3.8-27B original | 27B | 53,7 GB | no disponible | no disponible | safetensors, ecosistema estandar |

En calidad, este archivo supera al GGUF IQ2 en matematicas, MMLU, GSM8K y KL en chat y codigo, empata en HumanEval y ARC-Challenge y pierde en HellaSwag y WikiText. La ventaja del GGUF es la portabilidad (llama.cpp, Ollama, multiples plataformas); la de este artefacto es la fidelidad al original en ingles, codigo y matematicas a cambio de quedar atado al runtime del autor y a hardware Apple.

## Limitaciones y advertencias

- Dependencia total del runtime propietario: sin `fast_q35` y MLX sobre Apple Silicon, el modelo no se puede cargar; no hay exportacion a GGUF ni safetensors.
- Sesgo de dominio: calibrado y ajustado solo en ingles, codigo y matematicas; en otros idiomas se aleja mas del original que el GGUF comparable.
- Licencia no disponible: no se puede confirmar el uso comercial; el modelo base es de Qwen, pero la licencia del artefacto cuantizado no se especifica.
- Perdida de calidad medible respecto al original: MMLU cae 4,7 puntos, HumanEval 3,6 y HellaSwag 4,3; la divergencia KL en WikiText es peor que la del GGUF (0,258 frente a 0,233).
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion a 2,1 bits, especialmente fuera de los dominios de calibracion.
- Procedencia y mantenimiento: autor individual, 93 descargas y 6 likes en el momento de la consulta; no hay garantia de soporte, actualizaciones ni auditoria independiente de los resultados.
- Despliegue en produccion limitado: sin soporte para vLLM, TGI ni batching convencional; el throughput (~17 tok/s en M5 Max) es bajo para cargas concurrentes.
- Fecha de publicacion en 2026 y modelo base Qwen3.8-27B: conviene verificar la disponibilidad y vigencia del modelo base antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Qwen3.8-27B-LookAtMyQuant-7.2GB
- Repositorio del compilador LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Recipe LookAtMyQuant 2: https://lookatmyquant.pages.dev/2/
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
