# Rizor1x/Meron-1.1-Nano-7.87M

## Resumen

Meron 1.1 Nano 7.87M es un modelo de lenguaje base autoregresivo en ingles desarrollado por Rizor1x, disenado especificamente para tareas de completado de texto en entornos de recursos muy limitados. Se trata de un modelo denso de arquitectura LLaMA con 7.868.672 parametros, lo que lo situa en la categoria de los denominados SLM (small language models), pensados para ejecucion en dispositivos edge y experimentacion con modelos compactos.

A diferencia de variantes anteriores multi-expert, esta version 1.1 ejecuta una arquitectura densa monolitica en la que todos los parametros estan activos para cada token, sin enrutamiento ni conmutacion de expertos. El modelo emplea bloques de atencion LLaMA estandar con capas feedforward SwiGLU, pre-normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE).

La relevancia de este lanzamiento radica en su ventana de contexto de 1.024 tokens, vocabulario de 4.096 tokens, 8 capas transformer y un tamano de hidden de 256 con 8 cabezas de atencion. Esta pensado para completados cortos en ingles y para investigacion sobre el comportamiento de modelos de lenguaje de muy baja escala, no para aplicaciones de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (LLaMA: atencion estandar, SwiGLU, RMSNorm, RoPE) |
| Parametros totales | 7.868.672 |
| Parametros activos | No aplica (modelo denso, todos los parametros activos por token) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

Especificaciones adicionales declaradas por el autor: vocabulario de 4.096 tokens, 8 bloques transformer, hidden size de 256 y 8 cabezas de atencion.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de tipo LLaMA, con atencion multi-cabeza estandar, capas feedforward SwiGLU, normalizacion RMSNorm aplicada antes de cada subcapa (pre-normalization) y Rotary Position Embeddings (RoPE) para codificar la posicion. Al ser un modelo denso, no hay mezcla de expertos ni mecanismos de despacho condicional: los 7,87 millones de parametros intervienen en el calculo de cada token durante la decodificacion. La implementacion es nativa en Transformers, sin necesidad de codigo personalizado.

El recetario de entrenamiento apunta a aproximadamente 10.000 millones de tokens procesados, repartidos entre flujos de texto general, ciencia, aritmetica y sentido comun. El autor aclara que esta cifra incluye exposicion repetida a los datos de entrenamiento. Se indica que se ha realizado una descontaminacion exhaustiva entre los conjuntos de entrenamiento y evaluacion. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento, ni el detalle de la composicion exacta del dataset.

## Capacidades

- Generacion de texto y completado autoregresivo en ingles, con prompt y continuacion dentro de un maximo combinado de 1.024 tokens.
- Razonamiento basico y tareas aritmeticas simples, aunque el propio autor advierte que puede producir respuestas incorrectas incluso en operaciones sencillas.
- Conocimiento de sentido comun y ciencia a nivel muy elemental, derivado de los flujos de datos de entrenamiento.
- Modelo base sin alineamiento: no se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso estructurado ni modos de pensamiento (thinking mode).
- Sin capacidades multimodales: no hay vision, audio ni otras modalidades.
- Multilingue limitado: unicamente ingles declarado.
- Inferencia por lotes mediante padding a la izquierda y mascara de atencion del tokenizer.

## Casos de uso

- Completado de texto en dispositivos edge: el modelo, con menos de 8 millones de parametros, puede ejecutarse en microcontroladores de gama alta, SBC y telefonos moviles para autocompletar frases cortas en ingles dentro de su ventana de 1.024 tokens.
- Experimentacion academica con SLM: sirve como banco de pruebas para estudiar escalado, tokenizacion y comportamiento de modelos densos de muy baja escala, con un vocabulario de 4.096 tokens facil de analizar.
- Generacion de sugerencias en interfaces de escritura: integrado en editores o teclados predictivos para proponer continuaciones de una o dos frases, con latencia muy baja gracias a su tamano reducido.
- Prototipado rapido de pipelines de text-generation: al cargarse de forma nativa en Transformers y ser compatible con text-generation-inference y endpoints, permite validar infraestructura de despliegue sin coste de GPU significativo.
- Educacion e investigacion sobre seguridad de modelos: su naturaleza de modelo base sin alineamiento lo convierte en un caso de estudio util para analizar sesgos, repeticiones y alucinaciones en modelos minimos.
- Clasificacion o puntuacion de texto ligera por continuacion: usado como estimador de verosimilitud para filtrar o puntuar frases cortas en ingles en pipelines de datos a gran escala, donde el coste por token es critico.
- Demos y pruebas de concepto de asistentes conversacionales muy acotados: para respuestas de una sola frase en escenarios controlados, aceptando las limitaciones de calidad del modelo.

## Benchmarks y rendimiento

La model card referencia una tabla de benchmarks en formato SVG (Meron-Benchmark-Table.svg) con evaluacion zero-shot en la division de modelos por debajo de 10 millones de parametros, comparando con Meron Nano 5.41M, TinyBrainBot 3M v2 Base y Ethoric 10M. Sin embargo, los valores numericos concretos no estan disponibles en la informacion proporcionada.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 7,87 millones de parametros ocupan aproximadamente 15,7 MB; en FP32, unos 31,5 MB. El consumo real viene dominado por el contexto (1.024 tokens) y por el framework, no por los pesos.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo cabe en GPUs integradas, CPUs y aceleradores edge. Se puede ejecutar en RTX 4090, A100 o H100 sin aprovechar su capacidad, por lo que no son recomendables por coste.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer, integrada o dedicada, e incluso en CPU.
- Opciones de despliegue: Transformers (nativo, segun el ejemplo oficial), text-generation-inference (tag declarado) y endpoints compatibles. No se documenta soporte explicito para llama.cpp, Ollama, vLLM o TGI en la informacion disponible, aunque la arquitectura LLaMA y el formato safetensors son compatibles con herramientas de conversion habituales.
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera latencia muy baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Meron 1.1 Nano 7.87M | 7.868.672 | 1.024 | en | Apache 2.0 | Denso, LLaMA, vocabulario 4.096 |
| Meron Nano 5.41M | 5.410.000 (aprox., segun nombre) | No disponible | en | No disponible | Version anterior de la misma familia |
| TinyBrainBot 3M v2 Base | 3.000.000 (aprox., segun nombre) | No disponible | No disponible | No disponible | Referenciado por el autor |
| Ethoric 10M | 10.000.000 (aprox., segun nombre) | No disponible | No disponible | No disponible | Referenciado por el autor |

Los datos de parametros de los modelos comparables se infieren del nombre del repositorio y no estan confirmados en la informacion proporcionada. No hay resultados de rendimiento comparativos disponibles para completar la tabla.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no se documenta entrenamiento con RLHF o DPO, por lo que puede generar contenido inapropiado o sesgado sin filtrado.
- Riesgo elevado de alucinacion y repeticion de frases en generacion libre; el autor advierte explicitamente de respuestas incorrectas, incluso en aritmetica simple.
- Ventana de contexto muy corta (1.024 tokens): no apto para conversaciones multi-turno largas ni documentos extensos.
- Unicamente ingles; sin soporte multilingue.
- Vocabulario muy reducido (4.096 tokens), lo que limita la cobertura lexica y aumenta la fragmentacion de palabras poco frecuentes.
- Sin capacidades de tool calling, agentes ni razonamiento multi-paso documentadas.
- Descargas y likes nulos en el momento de la consulta, lo que indica ausencia de validacion comunitaria y escaso historial de uso en produccion.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de calidad muy limitada no es recomendable para aplicaciones de produccion reales sin evaluacion exhaustiva.
- No se han publicado cifras de latencia, throughput ni resultados numericos de benchmarks en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Rizor1x/Meron-1.1-Nano-7.87M
- Modelo comparable Meron Nano 5.41M: https://huggingface.co/Rizor1x/Meron-Nano-5.41M
- Modelo comparable TinyBrainBot 3M v2 Base: https://huggingface.co/nkthebass/tinybrainbot-3m-v2-base
- Modelo comparable Ethoric 10M: https://huggingface.co/techdotus/Ethoric-10M
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
