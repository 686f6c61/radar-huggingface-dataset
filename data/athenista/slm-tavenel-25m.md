# athenista/slm-tavenel-25m

## Resumen

SLM-Tavenel 25M es un modelo de lenguaje de tipo base, experimental y de pesos abiertos, desarrollado por el usuario athenista. Se trata de un transformer decoder-only de 25.723.648 parametros, con 20 capas, anchura 256 y una ventana de contexto de solo 1.024 tokens. No es un modelo instruido ni un asistente conversacional: es un artefacto de investigacion pensado para estudiar el crecimiento de modelos pequenos (model growing), en este caso partiendo de un ancestro entrenado de 10M de parametros y expandiendolo en profundidad y en la capa feed-forward hasta los 25M actuales.

El modelo se entrena sobre `PleIAs/French-Science-Commons` (subconjunto `french_open_science`), lo que explica su orientacion bilingue ingles/frances y su enfasis en texto cientifico abierto. La relevancia actual no esta en su rendimiento absoluto —es muy limitado en tareas de razonamiento— sino en su trazabilidad: el autor publica pesos, codigo, registros de entrenamiento y una evaluacion de alineacion con OSAID 1.0, lo que lo convierte en un caso de estudio util para quienes investigan eficiencia, crecimiento de modelos y reproducibilidad en el entrenamiento de SLM.

La licencia es MIT para pesos, codigo e informacion de datos, aunque el corpus de origen conserva sus propias condiciones. El modelo esta publicado en formato safetensors en float32 y no se distribuyen versiones cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 20 capas, anchura 256, 4 cabezas query / 2 key-value, SwiGLU 1.280, puerta de atencion por cabeza |
| Parametros totales | 25.723.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en float32; no hay versiones cuantizadas) |
| Idiomas soportados | Ingles y frances |
| Licencia | MIT (pesos, codigo e informacion de datos); los registros fuente conservan sus propios terminos |
| Formato de pesos | `model.safetensors` en float32 (SHA-256 `59c495cb…`) |
| Tokenizador | BPE a nivel de byte propio del proyecto, 8.192 tokens |
| Precision de entrenamiento | bfloat16 con precision mixta |
| Inicializacion | Crecimiento desde el modelo entrenado de 10M (expansion en profundidad y feed-forward; tensores nuevos inicializados con semilla 0) |
| Datos de entrenamiento | `PleIAs/French-Science-Commons` (`french_open_science`); 491,52M posiciones de token adicionales (~983M contando el ancestro de 10M) |
| Optimizador / semilla | AdamW; semilla de entrenamiento 1234 |
| Computo | Una RTX 4060 Laptop GPU (8 GB), ~5,5 GPU-horas para esta etapa (mas ~2,5 para el ancestro de 10M); energia no medida |
| Perdida final train / validacion | 2,14016 / 2,21816 |
| BPB de validacion retenida, EN / FR | 1,1171 / 1,0367 |
| Revision del Hub descrita | `a34c08d1bd4b91a244f170ae26096ff059afc37a` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 20 capas, anchura 256, 4 cabezas de query y 2 de key-value (atencion con cabezas KV reducidas), feed-forward SwiGLU de 1.280 unidades y una puerta de atencion por cabeza (head-wise attention gate). El tokenizador es un BPE a nivel de byte propio del proyecto con un vocabulario de 8.192 tokens. La ventana de contexto es de 1.024 tokens, muy corta para los estandares actuales, coherente con el caracter experimental y de bajo coste del proyecto.

El entrenamiento parte de un modelo ya entrenado de 10M de parametros, que se expande en profundidad y en la capa feed-forward; los tensores nuevos se inicializan con semilla 0. Sobre esa inicializacion se entrena durante 15.000 pasos adicionales, acumulando 491,52M posiciones de token en esta etapa (~983M contando el ancestro). El corpus es `PleIAs/French-Science-Commons`, con mezcla de contenido cientifico abierto en ingles y frances. Se usa AdamW con semilla 1234 y precision mixta bfloat16, todo ello en una unica RTX 4060 Laptop de 8 GB durante aproximadamente 5,5 GPU-horas. No se menciona RLHF, DPO ni ajuste por instrucciones: es un modelo base puro. La innovacion tecnica destacable es el propio procedimiento de model growing y la publicacion exhaustiva de registros de entrenamiento y evaluacion de alineacion OSAID 1.0 (autoevaluacion del proyecto, no certificacion OSI).

## Capacidades

- Generacion de texto autoregresiva en ingles y frances como modelo base, sin ajuste por instrucciones.
- Modelado de lenguaje y puntuacion de secuencias (log-likelihood), util para evaluacion y filtrado.
- Clasificacion por log-likelihood en tareas de eleccion multiple de 0-shot (formato usado en sus benchmarks).
- Capacidad bilingue limitada a EN/FR, con mejor BPB en frances (1,0367) que en ingles (1,1171).
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- No tiene modo thinking, vision ni audio.
- No es un asistente conversacional: no hay plantilla de chat ni alineacion instructiva.

## Casos de uso

- Investigacion sobre model growing: el modelo sirve como punto de comparacion directo con su ancestro de 10M para estudiar como afecta la expansion de profundidad y feed-forward al BPB en texto cientifico bilingue.
- Reproducibilidad de entrenamiento de bajo coste: permite replicar un pipeline completo de entrenamiento de un SLM en una unica GPU consumer de 8 GB, con semilla, optimizador y datos documentados.
- Puntuacion de texto cientifico: usar el log-likelihood del modelo para filtrar o clasificar fragmentos de `French-Science-Commons` por plausibilidad bajo el modelo, en tareas de curacion de corpus.
- Baseline en evaluacion de eleccion multiple: emplear sus resultados 0-shot por log-likelihood (ARC, HellaSwag, Belebele, WinoGrande) como referencia inferior en estudios comparativos de SLM.
- Docencia y divulgacion: ilustrar el funcionamiento interno de un transformer decoder-only pequeno con pesos abiertos y trazabilidad completa, sin necesidad de infraestructura especializada.
- Pruebas de infraestructura de inferencia: validar pipelines de carga de safetensors, tokenizadores BPE personalizados y evaluadores de log-likelihood en entornos con `custom_code` de transformers.
- Estudio de licencias y gobernanza de datos: analizar el caso de un modelo MIT entrenado sobre un corpus de licencias mixtas, con la evaluacion OSAID 1.0 publicada como material de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, eleccion multiple por log-likelihood, evaluador SLM-Tavenel; no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Eleccion multiple 0-shot | ARC-Easy (test) | accuracy | 0,319 |
| Eleccion multiple 0-shot | ARC-Challenge (test) | accuracy | 0,180 |
| Eleccion multiple 0-shot | HellaSwag (validation) | accuracy | 0,273 |
| Eleccion multiple 0-shot | Belebele (English, test) | accuracy | 0,283 |
| Eleccion multiple 0-shot | Belebele (French, test) | accuracy | 0,309 |
| Eleccion multiple 0-shot | WinoGrande XL (validation) | accuracy | 0,519 |

Comparacion pareada con el ancestro de 10M en BPB sobre validacion retenida de FSC (diferencia 10M menos 25M; positivo favorece al 25M):

| Idioma | Documentos | Diferencia | Intervalo bootstrap pareado al 95% |
|---|---:|---:|---:|
| Ingles | 685 | +0,0585 | [+0,0570, +0,0602] |
| Frances | 678 | +0,0530 | [+0,0520, +0,0540] |
| Media equilibrada por idioma | 685 EN; 678 FR | +0,0557 | [+0,0548, +0,0567] |

El autor senala que la mejora en BPB es clara, pero que no se observa una ganancia resuelta en las seis tareas de eleccion multiple.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 103 MB (25,7M parametros x 4 bytes), por lo que el modelo cabe holgadamente en cualquier GPU consumer moderna; con overhead de activaciones y contexto de 1.024 tokens, el consumo es de unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno en una RTX 4060 Laptop de 8 GB, que es sobradamente suficiente tambien para inferencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo requiere `custom_code`); al no publicarse GGUF, llama.cpp y Ollama no estan soportados de forma nativa sin conversion previa; vLLM y TGI no estan documentados para esta arquitectura personalizada.
- Latencia y throughput estimados: no disponibles. Por el tamano (25,7M parametros) y el contexto (1.024 tokens), se espera una latencia muy baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---:|---|---|---|
| SLM-Tavenel 25M | 25,7M | 1.024 | MIT | Base bilingue EN/FR, model growing | Hugging Face, safetensors float32 |
| SLM-Tavenel 10M (ancestro) | ~10M | No disponible | MIT | Base, etapa previa del mismo proyecto | Hugging Face (mismo autor) |
| Modelos tipo GPT-2 small | 124M | 1.024 | MIT | Base en ingles | Ampliamente disponible |
| Modelos tipo TinyLlama / SmolLM (tamano pequeno) | 100M-1B | 2.048+ | Apache-2.0 / MIT | Base o instruidos, multilingues | Hugging Face, GGUF, Ollama |

La comparacion con alternativas de la misma categoria es limitada: no hay datos publicados de benchmarks cruzados entre SLM-Tavenel 25M y otros SLM de tamano similar en la informacion disponible. La comparativa debe hacerse con cautela, ya que el modelo es un artefacto de investigacion sin ajuste instructivo y con contexto muy reducido.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional ni para tareas que requieran seguir instrucciones complejas.
- Rendimiento muy bajo en razonamiento: ARC-Challenge 0,180 y HellaSwag 0,273, cercanos o por debajo de lineas base triviales en algunas tareas.
- Contexto muy corto (1.024 tokens): inadecuado para documentos largos, conversaciones multi-turno o agentes.
- Riesgo alto de alucinacion y de generacion incoherente por el reducido tamano y la falta de alineacion.
- Sesgos desconocidos: no se ha publicado una evaluacion de sesgos; el corpus cientifico abierto puede introducir sesgos de dominio y de idioma.
- Cobertura linguistica limitada a ingles y frances; no hay soporte documentado para castellano ni otros idiomas.
- Licencia MIT para pesos y codigo, pero el corpus fuente (`French-Science-Commons`) tiene licencias mixtas y el autor reconoce carencias en la revision de derechos y privacidad; el uso comercial debe evaluarse con cautela.
- La alineacion con OSAID 1.0 es una autoevaluacion del proyecto, no una certificacion OSI.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo personalizado del autor.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en herramientas estandar como llama.cpp u Ollama.
- Un unico seed y una unica ruta de inicializacion: los resultados pueden no ser representativos de otras ejecuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-25m
- Registros de entrenamiento y evaluacion: https://huggingface.co/athenista/slm-tavenel-25m/tree/main/training_record
- Dataset de entrenamiento: https://huggingface.co/datasets/PleIAs/French-Science-Commons
- Evaluacion OSAID 1.0 del proyecto: `docs/reviews/OSAID-1.0-EXP0009-25M-ASSESSMENT.md` (referenciada en la model card, no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
