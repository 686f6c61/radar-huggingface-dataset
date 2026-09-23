# francesca9805/rus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407

## Resumen

`francesca9805/rus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407` es un ajuste fino supervisado (SFT) del modelo `goldfish-models/rus_cyrl_10mb`, un transformer decoder-only de tipo GPT-2 con 39.087.104 parametros (unos 39 millones, segun los pesos en safetensors). Lo publica el usuario de HuggingFace francesca9805 y se ha entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121 y Datasets 4.8.4, tal como declara la model card.

Por el identificador del modelo, por el proyecto de seguimiento en Weights & Biases ("new-tokenizers", asociado a la Universidad de Groningen) y por el propio nombre del repositorio, todo apunta a un artefacto de investigacion dentro de una serie de experimentos de tokenizacion, empaquetado y mezcla de datos. El nombre codifica condiciones del experimento (idioma y escritura, volumen de datos, tipo de empaquetado y semilla 3407), pero el autor no documenta su significado ni publica el dataset utilizado.

Su relevancia practica es limitada: acumula 0 descargas y 1 like, no incluye resultados de evaluacion y no declara licencia. Su interes real es como referencia reproducible de ajuste fino de bajo coste sobre un modelo base monolingue de la familia Goldfish, y como linea base en estudios comparativos de tokenizadores y de mezclas de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (tag `gpt2` en el repositorio) |
| Parametros totales | 39.087.104 (aproximadamente 39 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en precision completa en safetensors; no se publican variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No declarado en la model card. El modelo base se denomina `rus_cyrl`, lo que indica ruso en escritura cirilica, pero el autor no lo confirma |
| Licencia | No disponible. La model card incluye el campo `licence: license`, un marcador de posicion sin valor legal |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | `goldfish-models/rus_cyrl_10mb` |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Fecha de publicacion | 22 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, con 39.087.104 parametros, derivada del modelo base `goldfish-models/rus_cyrl_10mb`. No se documenta ninguna modificacion estructural respecto al modelo base, ni el numero de capas, dimensiones ocultas o cabezas de atencion, ni si se ha reentrenado el tokenizador a pesar de que el proyecto de seguimiento se denomina "new-tokenizers".

El entrenamiento se ha realizado mediante ajuste fino supervisado con TRL, en un unico registro de Weights & Biases (`kzjnfp6l`) del proyecto `new-tokenizers` de la Universidad de Groningen. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la tasa de aprendizaje, el numero de epocas, el tamano de batch ni el optimizador. Tampoco hay evidencia de fases posteriores de alineacion como RLHF, DPO o PPO. El sufijo `seed3407` del nombre sugiere que la ejecucion se ha fijado con una semilla concreta para hacerla reproducible, y elementos como `ppt`, `Dp-100mb`, `packed` y `bfd` parecen describir condiciones experimentales de mezcla y empaquetado de datos que el autor no define.

## Capacidades

- Generacion de texto autoregresiva, heredada de un modelo base GPT-2 de 39 M de parametros.
- Generacion en ruso con escritura cirilica (inferido del nombre del modelo base, no confirmado por el autor).
- La model card incluye un ejemplo de uso con el pipeline de `transformers` pasando una lista de mensajes con rol de usuario, lo que sugiere la existencia de una plantilla de chat, aunque no se documenta ni se verifica.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.
- No se declara multilingueidad mas alla del posible ruso.
- No se han publicado evaluaciones de capacidades (codigo, matematicas, instrucciones) para este modelo.

## Casos de uso

- Linea base en estudios de tokenizacion y mezcla de datos: el modelo sirve como punto de comparacion de bajo coste dentro de series experimentales de ajuste fino, dado su tamano reducido y su semilla fijada, que permiten repetir ejecuciones con presupuesto minimo.
- Reproduccion de experimentos academicos: el enlace al registro de Weights & Biases y las versiones exactas de TRL, Transformers, PyTorch y Datasets permiten reconstruir el entorno de entrenamiento para verificar resultados.
- Prototipado educativo de pipelines de SFT: resulta util en cursos y talleres para mostrar el flujo completo de ajuste fino con TRL sobre un modelo de 39 M de parametros que cabe en cualquier equipo.
- Pruebas de infraestructura de despliegue: al estar etiquetado como compatible con text-generation-inference y con Inference Endpoints, permite validar configuraciones de servido, plantillas de chat y monitorizacion antes de pasar a modelos mayores.
- Generacion de texto corto en ruso para pruebas internas: se puede emplear para completar frases o producir borradores de baja calidad en entornos de desarrollo donde no se requiere precision factual.
- Experimentos de inferencia en el borde o en CPU: con menos de 0,2 GB de pesos en fp32, es viable ejecutarlo en dispositivos sin GPU para medir latencias y consumo en escenarios embebidos.
- Filtrado y puntuacion preliminar de corpus: como modelo de lenguaje pequeno permite calcular perplejidad sobre texto en cirilico para descartar documentos anomalos antes de un entrenamiento mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo: los unicos resultados obtenidos son enlaces genericos a Wikipedia, sin relacion con el repositorio.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 156 MB. En fp16 o bf16: aproximadamente 78 MB. En int8: aproximadamente 39 MB. En int4: aproximadamente 20 MB. A estas cifras hay que sumar el estado de la cache KV y las activaciones, que en un modelo de este tamano son marginales.
- VRAM estimada para inferencia: por debajo de 1 GB en cualquier precision, incluso con lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090. No requiere A100 ni H100.
- Cabe en GPU de consumo y en CPU: la inferencia en CPU es totalmente viable para uso interactivo.
- Opciones de despliegue: pipeline de Transformers, text-generation-inference (etiqueta `text-generation-inference`), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), vLLM. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio no publica ese formato.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| `francesca9805/rus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407` | 39,09 M | No disponible | No disponible (campo `licence: license` sin valor legal) | 0 descargas, 1 like, sin benchmarks |
| `goldfish-models/rus_cyrl_10mb` (modelo base) | No disponible | No disponible | No disponible en la informacion proporcionada | Modelo base del ajuste; sin datos de evaluacion en la informacion disponible |
| `distilgpt2` (referencia de GPT-2 pequeno) | 82 M | 1.024 tokens | Apache-2.0 | Ampliamente disponible en HuggingFace, con uso comercial permitido |
| `Qwen2.5-0.5B` (referencia de modelo pequeno multilingue actual) | 494 M | 32.768 tokens | Apache-2.0 | Modelo instruct actual, con soporte multilingue y de tool calling |

Las cifras de las dos ultimas filas corresponden a datos publicos habituales de esos modelos y se incluyen solo como referencia de categoria. No existe una comparacion de rendimiento publicada entre este ajuste y ninguno de ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado. Al carecer de informacion sobre el corpus de entrenamiento, no es posible evaluar sesgos de genero, etnia, religion o sesgo politico.
- Riesgo de alucinacion: elevado. Un modelo de 39 M de parametros ajustado con SFT sobre datos no especificados no puede sostener coherencia factual ni conversaciones largas, y producira texto plausible pero incorrecto con frecuencia.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto real. El uso productivo queda practicamente restringido al ruso en cirilico, y ni siquiera eso esta confirmado por el autor.
- Restricciones de licencia: no hay licencia efectiva declarada. El campo `licence: license` es un marcador de posicion, de modo que no existe autorizacion explicita de uso comercial, redistribucion ni obra derivada. Cualquier uso en produccion requiere contactar previamente con el autor.
- Ausencia de alineacion: no hay evidencia de RLHF, DPO ni filtrado de seguridad. El modelo puede generar contenido inapropiado o danino sin ninguna salvaguarda.
- Falta de evaluacion: no hay benchmarks, ni evaluacion de calidad de generacion, ni pruebas de robustez. No se recomienda su uso en produccion ni en aplicaciones orientadas al usuario final.
- Documentacion incompleta: no se especifican dataset, hiperparametros, tokenizador ni si se ha reentrenado el vocabulario, lo que impide reproducir el ajuste con fidelidad.
- Advertencia de interpretacion: la model card no menciona nada sobre plantillas de chat o formato de prompt; el ejemplo de la model card usa un formato conversacional, pero no hay garantia de que el tokenizador incluya una plantilla de chat correctamente configurada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/rus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/rus_cyrl_10mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/kzjnfp6l
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de comparacion de modelos: no disponible
- Paper asociado: no disponible
- Demo o espacio interactivo: no disponible

Nota sobre la busqueda web: los resultados obtenidos corresponden unicamente a paginas principales de Wikipedia en varios idiomas y no guardan relacion con este modelo. No se ha localizado documentacion tecnica, paper ni articulo de blog adicional sobre este ajuste.
