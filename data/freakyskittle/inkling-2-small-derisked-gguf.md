# freakyskittle/Inkling-2-Small-Derisked-GGUF

## Resumen

Inkling-2-Small-Derisked GGUF es la versión cuantizada en formato GGUF del modelo Blackfrost-Research/Inkling-2-Small-Derisked, un modelo de lenguaje de tipo mixture-of-experts (MoE) con 612 000 millones de parámetros totales, 48 capas y 384 expertos con enrutamiento top-8. A su vez, el modelo Derisked deriva de thinkingmachines/Inkling-2-Small, del que hereda la arquitectura y los pesos base tras un proceso de ajuste que el autor denomina "derisking". La conversión a GGUF la publica el usuario freakyskittle y está pensada para su ejecución con llama.cpp.

El interés de esta ficha reside en que permite ejecutar un modelo de escala frontera (612B) en hardware convencional mediante cuantización agresiva y descarga de expertos a RAM del sistema. El repositorio ocupa 119,1 GB e incluye únicamente el backbone de texto: la torre de visión y la cabeza MTP (multi-token prediction) no están convertidas.

En el momento de la publicación, el trabajo está en curso: solo el cuantizado Q8_0 aparece en subida y ningún fichero ha superado todavía la prueba de humo del autor. Además, se requiere una compilación de llama.cpp con soporte para la arquitectura `inkling2`, que el llama.cpp estándar aún no incorpora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 384 expertos, enrutamiento top-8) |
| Parametros totales | 612 000 millones (612B) |
| Parametros activos | no disponible (top-8 sobre 384 expertos; el autor no publica el recuento exacto) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 16384`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, UD-Q4_K_XL, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_M, Q2_K, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 declarada en la model card (el campo `license` del repo indica `other`; los pesos Derisked quedan sujetos a los terminos upstream de Inkling-2-Small) |
| Formato de pesos | GGUF (shards divididos, un directorio por cuantizacion) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 48 capas, 384 expertos por capa y enrutamiento top-8, lo que da un total de 612B parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) del modelo original ni del proceso de "derisking" aplicado por Blackfrost-Research.

La innovación técnica destacable de esta publicación no está en el modelo sino en el empaquetado: los cuantizados IQ y UD-Q4_K_XL emplean una matriz de importancia calculada a partir del Q8_0 sobre texto de calibración. El UD-Q4_K_XL mantiene atención, embeddings y salida en Q8_0, los expertos de la primera y las tres últimas capas en Q6_K y los expertos "down" en Q5_K. Los ficheros se distribuyen como shards GGUF divididos; llama.cpp debe apuntarse al primer shard (`*-00001-of-*.gguf`) y carga el resto automáticamente. La cabeza MTP (multi-token prediction) del modelo original no está incluida en esta conversión.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del backbone de Inkling-2-Small.
- Generación de código: la prueba de humo del autor consiste en generar un `primes.py` con una función `is_prime` correcta a temperatura 0.
- Capacidades de visión: no disponibles en estos ficheros, ya que la torre de visión no se ha convertido.
- Decodificación especulativa vía MTP: no disponible, la cabeza MTP no está incluida.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo de 612B con presupuesto de VRAM limitado: usando `-ot "exps=CPU"` los expertos residen en RAM del sistema y el resto de pesos en GPU, lo que permite servir el modelo en una estación de trabajo con suficiente memoria RAM y una GPU de gama alta.
- Evaluación comparativa de cuantizaciones extremas: la familia de cuantizados (de Q8_0 a IQ1_M, con variantes IQ y UD) permite estudiar la degradación de calidad a medida que baja el tamaño, útil para investigación sobre cuantización de MoE de gran escala.
- Generación de código en pipelines internos: el modelo puede producir scripts y funciones (el autor valida con `is_prime`) para tareas de automatización y utilidades de desarrollo, siempre que se disponga de la compilación de llama.cpp con soporte `inkling2`.
- Despliegue con llama-server: el ejemplo del autor arranca un servidor HTTP con plantilla Jinja (`--jinja`) y atención flash (`-fa on`), adecuado para prototipos de API interna.
- Experimentación con arquitecturas MoE de enrutamiento top-8: útil para investigadores que quieran analizar el comportamiento de 384 expertos por capa en un entorno GGUF reproducible.
- Pruebas de robustez y seguridad tras el "derisking": permite comparar el comportamiento del modelo Derisked frente al original en escenarios de generación libre, como parte de una evaluación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende del cuantizado y de la estrategia de offload. Con `-ot "exps=CPU"`, los expertos van a RAM y solo los tensores densos (atención, embeddings, salida) ocupan VRAM; el resto del presupuesto se cubre con RAM del sistema.
- Tamaños de fichero por cuantizado (según la model card): Q8_0 631 GB, Q6_K ~500 GB, Q5_K_M ~435 GB, UD-Q4_K_XL ~380 GB, Q4_K_M ~370 GB, IQ4_NL ~345 GB, IQ4_XS ~325 GB, Q3_K_M ~295 GB, Q2_K ~210 GB, IQ1_M ~135 GB.
- GPU recomendadas: no especificadas por el autor. Por el volumen de pesos densos y el requisito de RAM, se requiere una GPU con suficiente VRAM para los tensores no-expertos más un sistema con cientos de GB de RAM para los expertos en los cuantizados grandes.
- ¿Cabe en GPU de consumo? No de forma completa: incluso el cuantizado más pequeño (IQ1_M, ~135 GB) excede la VRAM de cualquier GPU de consumo; requiere offload de expertos a RAM.
- Opciones de despliegue: llama.cpp (obligatorio, con soporte `inkling2`, commit `5917b39ff7b58a808eced9d5c3d63b06f57d6972` o posterior) a través de `llama-server` o `llama-cli`. vLLM, TGI y Ollama no están indicados como compatibles en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling-2-Small-Derisked GGUF | 612B (MoE, top-8) | no disponible | Apache-2.0 declarada / sujeta a terminos upstream | GGUF |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Trabajo en curso: en el momento de la publicación solo el Q8_0 estaba en subida y ningún cuantizado había superado la prueba de humo del autor; los ficheros pueden estar rotos.
- Compatibilidad: llama.cpp estándar no carga estos ficheros; se necesita una compilación con soporte de la arquitectura `inkling2` (commit `5917b39ff7b58a808eced9d5c3d63b06f57d6972`).
- Sin visión ni MTP: la torre de visión y la cabeza de multi-token prediction no están convertidas, por lo que no hay capacidades multimodales ni decodificación especulativa.
- Licencia ambigua: el repositorio declara `license: other` con `license_name: apache-2.0`, y la model card advierte de que los pesos Derisked están sujetos a los términos de Inkling-2-Small. Es imprescindible revisar la licencia upstream antes de redistribuir o desplegar en producción.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones de sesgo ni de fiabilidad para este modelo en la información disponible.
- Idiomas: no se especifican los idiomas soportados.
- Requisitos de memoria: incluso el cuantizado más pequeño ocupa ~135 GB, lo que limita su uso a sistemas con gran cantidad de RAM y una GPU dedicada para los tensores densos.
- Contexto: no se ha documentado la longitud máxima de contexto del modelo; el ejemplo de uso fija `-c 16384`, que no debe interpretarse como el límite del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/freakyskittle/Inkling-2-Small-Derisked-GGUF
- Modelo base (Derisked): https://huggingface.co/Blackfrost-Research/Inkling-2-Small-Derisked
- Modelo upstream original: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Commit de llama.cpp con soporte `inkling2`: `5917b39ff7b58a808eced9d5c3d63b06f57d6972` ("convert : map the Inkling-2 LoRA tensor names (#33055)")
