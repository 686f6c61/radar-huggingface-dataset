# mradermacher/Groot-238B-A18B-261023-GGUF

## Resumen

Groot-238B-A18B-261023-GGUF es la versión cuantizada en formato GGUF del modelo GrootTeam/Groot-238B-A18B-261023, publicada por mradermacher, un autor conocido por distribuir conversiones GGUF de modelos abiertos de gran tamaño. El repositorio no contiene un modelo nuevo: es un empaquetado de pesos en cuantizaciones K-quant (de Q2_K a Q6_K, además de f16, Q8_0 e IQ4_XS declaradas) más dos ficheros `mmproj` que actúan como complemento multimodal. Su utilidad es práctica: permite ejecutar un modelo de escala frontera con llama.cpp y herramientas compatibles sin depender de infraestructura de tensor parallelism propietaria.

El modelo base tiene 242.833.328.966 parámetros reales según los safetensors (unos 242,8 B), aunque la nomenclatura del nombre comercial indica "238B" totales y "A18B" activos, lo que apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 18 B de parámetros activos por token; este dato no está confirmado de forma explícita en la model card. La licencia declarada es MIT, aunque el campo `license_link` apunta al fichero LICENSE de zai-org/GLM-5.3-Flash, un detalle que conviene verificar antes de un despliegue comercial.

Es relevante ahora por dos motivos. Primero, porque los modelos MoE de ~240 B con ~18 B activos ofrecen una relación calidad/coste de inferencia muy distinta a la de un denso del mismo tamaño. Segundo, porque la existencia de cuantizaciones de 90 a 200 GB hace que el modelo sea desplegable en nodos de 2 a 4 GPU de 80 GB o, en su versión Q2_K, en configuraciones con un único acelerador de gran memoria. El repositorio ocupa 1.657,1 GB en total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la nomenclatura "A18B" sugiere mezcla de expertos, sin confirmar en la model card) |
| Parametros totales | 242.833.328.966 (~242,8 B segun safetensors del modelo base) |
| Parametros activos | ~18 B (deducido de la nomenclatura; no confirmado en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ficheros mmproj en f16 y Q8_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT (el `license_link` apunta a la licencia de zai-org/GLM-5.3-Flash) |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base: no se especifica si es un transformer denso, un transformer con mezcla de expertos, ni el numero de capas, cabezas o expertos por capa. El identificador "238B-A18B" sigue el patron habitual de los modelos MoE, donde el primer numero indica parametros totales y el segundo los activos por token; sin embargo, la model card del repositorio GGUF no lo confirma y el recuento real de safetensors (242,8 B) no coincide exactamente con la cifra comercial de 238 B. Tampoco se detalla la longitud de contexto nativa.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, fases de alineacion (RLHF, DPO u otras) ni innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion alternativa. Lo unico relevante a nivel tecnico es el proceso de cuantizacion: mradermacher indica que se trata de cuantizaciones estaticas (sin imatrix ni ponderacion por importancia), con el aviso de que las versiones ponderadas podrian no publicarse. Los ficheros `mmproj` en f16 y Q8_0 son el proyector multimodal que acompana al modelo en llama.cpp.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio y el pipeline declarado por el autor apuntan a un uso orientado a dialogo.
- Capacidad multimodal probable: la presencia de ficheros `mmproj-f16` y `mmproj-Q8_0`, descritos como "multi-modal supplement", implica soporte de entrada de imagen junto al texto, aunque la model card no detalla tareas ni resolucion soportada.
- Razonamiento y conocimiento general a escala de ~240 B de parametros totales, con ~18 B activos por token segun la nomenclatura.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Multilingue: limitado a ingles segun el campo `language` del repositorio. No hay evidencia de soporte de castellano.
- Endpoints compatibles: la etiqueta `endpoints_compatible` sugiere compatibilidad con la infraestructura de Inference Endpoints de HuggingFace para el formato desplegado.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento por lotes de documentos en ingles: con cuantizaciones Q4_K_M de 147,1 GB, el modelo puede ejecutarse en un nodo de 4 GPU de 80 GB y procesar grandes volumenes de texto con una calidad cercana al modelo original, a un coste por token inferior al de un denso equivalente gracias a los ~18 B de parametros activos.
- Sustitucion de APIs propietarias en flujos internos: al publicarse bajo licencia MIT, puede alojarse en infraestructura propia para tareas de redaccion, resumen y clasificacion sin enviar datos a terceros, siempre que el contenido sea en ingles.
- Despliegue en estaciones de trabajo con gran cantidad de RAM: la cuantizacion Q2_K (89,8 GB) permite ejecutar el modelo con llama.cpp haciendo offloading parcial a memoria del sistema, util para pruebas de concepto y evaluacion sin cluster dedicado.
- Analisis de imagenes con texto asociado: usando el fichero `mmproj` junto con el GGUF principal en llama.cpp, se pueden construir flujos de descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados.
- Generacion asistida en investigación: servir el modelo con llama.cpp u Ollama para experimentar con tecnicas de prompting, decodificacion y evaluacion comparativa frente a modelos mas pequenos, aprovechando que el repositorio ofrece 12 niveles de cuantizacion para ajustar el compromiso tamano/calidad.
- Base para ajuste fino o destilacion: partiendo de los pesos safetensors del modelo original (no de los GGUF), usar el modelo como profesor para generar datos sinteticos o destilar capacidades hacia modelos de menor tamano desplegables en produccion.
- Entornos aislados sin conectividad: al ser un artefacto descargable y autónomo, encaja en despliegues on-premise con requisitos de soberania del dato, con la salvedad del idioma y del espacio de almacenamiento necesario (1,6 TB para el repositorio completo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

Los tamanos siguientes son los del repositorio (datos reales del autor) y no incluyen cache KV ni overhead del runtime, que anaden varios GB adicionales en funcion del contexto:

| Cuantizacion | Tamano (GB) | Notas del autor |
|---|---|---|
| Q2_K | 89,8 | Fichero unico |
| Q3_K_S | 106,0 | Dividido en 3 partes |
| Q3_K_M | 116,8 | Dividido en 3 partes; "lower quality" |
| Q3_K_L | 127,0 | Dividido en 3 partes |
| Q4_K_S | 138,5 | Dividido en 3 partes; "fast, recommended" |
| Q4_K_M | 147,1 | Dividido en 4 partes; "fast, recommended" |
| Q5_K_S | 168,2 | Dividido en 4 partes |
| Q5_K_M | 172,9 | Dividido en 4 partes |
| Q6_K | 200,2 | Dividido en 5 partes; "very good quality" |
| mmproj-f16 | 1,2 | Proyector multimodal |
| mmproj-Q8_0 | 0,8 | Proyector multimodal |

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas la cache KV. Para Q4_K_M, un minimo practico de 160 GB de VRAM; para Q2_K, alrededor de 100 GB.
- GPU recomendadas: 4x A100 80 GB o 4x H100 80 GB para Q4_K_M y superiores; 2x H100 80 GB (160 GB) queda muy justo para Q4_K_M y solo admite contextos cortos; Q2_K puede caber en 2x A100 80 GB o en un unico H200 de 141 GB.
- GPU de consumo: no cabe en ninguna GPU consumer actual (24 GB o menos). Solo es viable con offloading a RAM del sistema, lo que requiere del orden de 100-200 GB de memoria RAM segun la cuantizacion y degrada severamente el throughput.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) para los GGUF; vLLM o TGI para los pesos safetensors del modelo base, con tensor parallelism entre varias GPU. El formato GGUF no es compatible con vLLM en configuraciones multi-GPU de este tamano.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no se pueden estimar con rigor sin conocer la arquitectura exacta y el numero de expertos activos.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible. La siguiente tabla recoge unicamente referencias de categoria (MoE abiertos de escala ~200-700 B) con datos de documentacion publica que no han sido verificados en esta ficha; los valores de rendimiento se dejan como no disponibles para no introducir cifras sin respaldo.

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| Groot-238B-A18B (esta ficha) | 242,8 B / ~18 B (segun nomenclatura) | No disponible | MIT | Si (12 cuantizaciones) |
| Qwen3-235B-A22B | 235 B / 22 B | 262.144 tokens (no verificado aqui) | Apache 2.0 (no verificado aqui) | Si, via terceros |
| DeepSeek-V3 | 671 B / 37 B | 128.000 tokens (no verificado aqui) | MIT (no verificado aqui) | Si, via terceros |
| GLM-4.5 | 355 B / 32 B | 128.000 tokens (no verificado aqui) | MIT (no verificado aqui) | Si, via terceros |

Para una comparacion rigurosa de rendimiento seria necesario disponer de resultados de benchmarks del modelo base, que no se han publicado en la informacion consultada.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles. No hay evidencia de calidad en castellano ni en otros idiomas, por lo que no es adecuado para productos dirigidos a usuarios hispanohablantes sin evaluacion previa.
- Ausencia total de benchmarks: no se puede afirmar nada sobre su calidad real frente a modelos de tamano similar. Cualquier decision de adopcion deberia ir precedida de una evaluacion propia.
- Ambiguedad de licencia: aunque el campo `license` indica MIT, el `license_link` apunta al fichero de licencia de zai-org/GLM-5.3-Flash. Conviene revisar ambos documentos y, en caso de uso comercial, confirmar los terminos con el autor del modelo base.
- Cuantizaciones estaticas: el autor advierte de que no ha generado versiones con imatrix ni ponderadas por importancia. Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma perceptible; el propio autor marca Q3_K_M como "lower quality".
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala y agravado por la ausencia de informacion sobre el proceso de alineacion (RLHF/DPO) del modelo base.
- Sesgos: no documentados. Al no conocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, ideologia o dominio.
- Contexto desconocido: se desconoce la ventana de contexto nativa, lo que impide planificar casos de uso con documentos largos. Ademas, en GGUF la cache KV crece de forma significativa con el contexto en arquitecturas MoE.
- Requisitos de infraestructura muy altos: 1.657,1 GB de repositorio completo y entre 90 y 200 GB por cuantizacion. El almacenamiento y la transferencia son un coste relevante por si mismos.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (24 de octubre de 2026). No hay evidencia de uso en produccion ni de validacion por la comunidad.
- Multimodalidad no documentada: la presencia de `mmproj` sugiere vision, pero no se especifican tareas, resoluciones ni calidad. No debe asumirse un rendimiento concreto en imagenes.
- Soporte de tool calling y agentes: no confirmado. Si el caso de uso depende de function calling, es imprescindible validarlo empiricamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Groot-238B-A18B-261023-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-238B-A18B-261023
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Groot-238B-A18B-261023-GGUF
- Licencia referenciada: https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/LICENSE
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Papers, blogs, repos o demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con este modelo.
