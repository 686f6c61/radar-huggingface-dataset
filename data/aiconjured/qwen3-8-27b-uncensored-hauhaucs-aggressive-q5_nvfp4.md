# AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_NVFP4

## Resumen

Esta ficha describe `AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_NVFP4`, una recuantizacion en formato GGUF de la variante *Aggressive* sin censura del modelo multimodal `Qwen/Qwen3.8-27B`. El trabajo lo publica el usuario AIconjured y parte del cuantizado `Q5_K_P` de HauhauCS, que a su vez deriva del modelo base de Qwen. El objetivo declarado es trasladar el grueso de los tensores a NVFP4 (coma flotante de 4 bits) guiado por una importance matrix (imatrix), manteniendo en mayor precision los tensores numericamente sensibles, y reducir el tamano de 18,83 GiB / 5,92 BPW a 14,74 GiB / 4,63 BPW sin tocar los valores aprendidos de los pesos.

El modelo se presenta como un transformer denso de 27B con encoder de vision, 64 capas de lenguaje mas una capa MTP/NextN, hidden size 5.120, FFN de 17.408 y un vocabulario de 248.320 tokens. La innovacion arquitectonica mas destacable es la combinacion de 48 capas Gated DeltaNet (modelo de espacio de estados) con 16 capas de atencion con compuertas, ademas de una cabeza MTP/NextN embebida que habilita decodificacion especulativa nativa. El contexto nativo declarado es de 262.144 tokens y soporta texto, imagen y video.

Su relevancia actual es doble: por un lado, demuestra un flujo de cuantizacion mixta NVFP4+imatrix aprovechando la aceleracion nativa de las GPU Blackwell (sm_120); por otro, distribuye una variante sin mecanismos de rechazo (*uncensored*) orientada a investigacion en seguridad, red teaming y generacion creativa sin filtros. Conviene senalar dos cautelas importantes antes de cualquier uso: el modelo no publica ningun benchmark de calidad, y existe una discrepancia sin aclarar entre el tamano que sugiere el nombre (27B) y el conteo de parametros declarado en safetensors (1.863.907.840, aproximadamente 1,86 mil millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35`: transformer denso causal con encoder de vision; hibrido de 48 capas Gated DeltaNet (SSM) y 16 capas de atencion con compuertas; capa MTP/NextN embebida (`nextn_predict_layers = 1`) |
| Parametros totales | El nombre del modelo indica 27B; el conteo real declarado en safetensors es 1.863.907.840 (~1,86 mil millones). La model card no aclara la discrepancia |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible segun la configuracion del framework |
| Tipos de cuantizacion | GGUF con mezcla de tipos: NVFP4 con imatrix (mayoria), `f16` (bloque de atencion final/MTP), `f32` (normalizaciones y parametros de estado SSM), `q8_0` (attn_output, ssm_beta, ssm_alpha, nextn.eh_proj), `q4_k` (attn_k). 4,63 BPW |
| Idiomas soportados | ingles (en), chino (zh) y multilingue segun los tags; el espanol no se declara explicitamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo de texto de 15.828.474.240 bytes / 14,74 GiB); proyector de vision separado en BF16 |

Otras especificaciones declaradas: hidden size 5.120; FFN size 17.408; 24 cabezas de atencion y 4 cabezas KV; vocabulario con padding de 248.320 tokens; 866 tensores en el archivo de origen.

## Arquitectura y entrenamiento

La arquitectura es un hibrido poco convencional. De las 64 capas del modelo de lenguaje, 48 son Gated DeltaNet, un mecanismo de espacio de estados con compuertas que sustituye a la atencion tradicional y mantiene un estado recurrente en lugar de una cache KV completa; las 16 restantes son capas de atencion con compuertas (24 cabezas, 4 cabezas KV). A esto se anade una capa MTP/NextN que actua como cabeza de prediccion multi-token, lo que permite decodificacion especulativa nativa (tags `mtp`, `speculative-decoding`, `fastmtp`). El modelo incorpora ademas un encoder de vision con su proyector en BF16, lo que habilita entrada image-text-to-text y comprension de video.

Sobre el entrenamiento no hay informacion en la model card: no se indican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o alguna fase de alineamiento. Lo unico documentado es el proceso de adaptacion sin censura, realizado por HauhauCS en la variante *Aggressive*, que segun el autor esta "horneado en los pesos" y se caracteriza por respuestas directas, ausencia de comportamiento de rechazo y preambulo minimo. Tampoco se detalla la tecnica concreta de *uncensoring* empleada.

La innovacion tecnica de esta publicacion concreta es el pipeline de recuantizacion. Se genero una imatrix con `llama-imatrix` sobre un corpus de calibracion de conocimiento general de aproximadamente 21.500 palabras (144.617 bytes), en CPU (`-ngl 0`, 24 hilos, `n_ctx=512`, 56 fragmentos), con una perplejidad de calibracion de 4,7824 ± 0,0866. La imatrix se regenero con `--process-output` para incluir tambien la LM head (`output.weight`), algo que el cuantizado de origen no hacia; el resultado contiene 994 entradas, de las que 497 se consumen durante la cuantizacion. La receta de tipos por tensor protege las normalizaciones (`.*norm.*=f32`), los parametros de estado del SSM (`ssm_a`, `ssm_dt.bias`, `ssm_conv1d.weight` en `f32`) y el bloque de atencion final 64 (`f16`), y envia el resto a NVFP4. Una limitacion reconocida por el autor es que `token_embd.weight` nunca se beneficia de la imatrix, porque su entrada son IDs one-hot sin activacion por fila medible, por lo que queda en NVFP4 con escalado por bloque simple. Los pesos resultantes son identicos en valor a los del origen: la recuantizacion solo cambia la precision numerica.

## Capacidades

- Generacion de texto y razonamiento: el autor afirma que se conservan todas las capacidades de texto y razonamiento del modelo base Qwen3.8-27B.
- Comprension de imagen: pipeline `image-text-to-text` con encoder de vision y proyector BF16 independiente.
- Comprension de video: capacidad declarada como nativa en el modelo base y preservada tras la recuantizacion.
- Modo agente y razonamiento multi-paso: el autor indica que las capacidades agenticas del base se mantienen, si bien no aporta evaluaciones.
- Decodificacion especulativa: cabeza MTP/NextN embebida y preservada, utilizable por frameworks que soporten `nextn_predict_layers`.
- Perfil *uncensored* Aggressive: respuestas directas, sin rechazos y con preambulo minimo, integrado en los pesos.
- Multilingue: ingles y chino declarados explicitamente, mas la etiqueta generica `multilingual`; no hay confirmacion de calidad en otros idiomas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con despliegues tipo API, aunque no se documenta el procedimiento.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Red teaming y evaluacion de seguridad: la variante Aggressive responde sin rechazos, lo que la hace util para generar casos adversarios y probar la robustez de filtros y clasificadores de contenido en un entorno controlado y aislado.
- Investigacion sobre alineamiento y censura: permite comparar el comportamiento del mismo modelo base con y sin perfil de rechazo, aislando el efecto de la modificacion de pesos frente al del prompt.
- Analisis de documentos con imagen y texto: al aceptar image-text-to-text con 262.144 tokens de contexto, se pueden procesar informes escaneados, capturas de pantalla o diagramas junto con su texto asociado en una sola pasada.
- Procesamiento de video de larga duracion: la comprension nativa de video combinada con el contexto extendido permite resumir o etiquetar secuencias extensas sin trocear el material en exceso.
- Escritura creativa sin filtros: narrativa, guiones y dialogos donde los rechazos del modelo alineado resultan un obstaculo, asumiendo la supervision humana posterior.
- Inferencia local en GPU Blackwell: con 14,74 GiB de pesos, encaja en tarjetas de 24 GB o mas y aprovecha la ruta NVFP4 nativa de sm_120, lo que permite ejecutar un modelo multimodal de gran tamano en un puesto de trabajo.
- Servicio de chat multimodal autoalojado: desplegado con llama.cpp u otro runtime GGUF, sirve conversaciones multi-turno con contexto largo y entrada de imagen sobre hardware propio.
- Prototipado de agentes con decodificacion especulativa: la cabeza MTP/NextN permite acelerar la generacion en frameworks que la soportan, util para iterar rapidamente sobre flujos multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluacion comparativa, ni frente al modelo base ni frente a otras cuantizaciones.

El unico dato numerico de calidad declarado es la perplejidad de calibracion de la imatrix: 4,7824 ± 0,0866 sobre el corpus de calibracion descrito. Se trata de una metrica del proceso de calibracion de la cuantizacion, no de una evaluacion de capacidad del modelo, y no es comparable con perplejidades medidas sobre conjuntos de validacion estandar.

| Metrica | Valor | Nota |
|---|---|---|
| Perplejidad de calibracion (imatrix) | 4,7824 ± 0,0866 | Medida sobre un corpus de conocimiento general de ~21.500 palabras, no es un benchmark de calidad |
| Tamano del archivo | 14,74 GiB (15.828.474.240 B) | Frente a 18,83 GiB (20.218.177.664 B) del origen, ~22% menos |
| Bits por peso | 4,63 BPW | Frente a 5,92 BPW del origen |
| MMLU, HumanEval, GSM8K, MMMU | no disponible | No publicados |

## Requisitos de hardware

- VRAM para los pesos: 14,74 GiB (15.828.474.240 bytes) en el archivo GGUF, mas el proyector de vision BF16, que se carga por separado. Presupuesto practico minimo de 16-17 GB de VRAM solo para pesos, antes de cache de contexto.
- Aceleracion nativa NVFP4: disponible en GPU Blackwell (sm_120). El propio autor indica que el archivo esta pensado para esas GPU, donde NVFP4 se acelera de forma nativa.
- GPU recomendadas con aceleracion nativa: familia Blackwell, como RTX 5090 (32 GB) o B200/GB200 en servidor.
- GPU compatibles sin aceleracion nativa: cualquier GPU que ejecute una build reciente de llama.cpp puede cargar el archivo, ya que es un GGUF estandar, pero la descompresion de NVFP4 se hara por software y el rendimiento sera inferior al de Blackwell.
- Cabe en GPU de consumo: si. En RTX 5090 (32 GB) con margen para contexto; en RTX 4090 (24 GB) cabe el modelo, pero el margen para contexto largo, imagenes y video es ajustado y no es Blackwell, por lo que no habra aceleracion NVFP4 nativa.
- Contexto y memoria asociada: no se proporcionan cifras de memoria de cache KV. Conviene tener en cuenta que solo 16 de las 65 capas usan atencion con cache KV y que las 48 capas Gated DeltaNet mantienen estado recurrente, por lo que el coste de contexto difiere del de un transformer denso convencional; la cifra concreta debe medirse en el runtime elegido.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF de un solo archivo (entre ellos Ollama y LM Studio, segun el tag `endpoints_compatible`). Para soportar la decodificacion especulativa con la cabeza MTP/NextN se necesita un runtime que implemente `nextn_predict_layers`.
- vLLM y TGI: no disponible. Estas herramientas no procesan GGUF con NVFP4 en su formato habitual; haria falta convertir a safetensors, operacion no documentada por el autor.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia, ni con ni sin la cabeza MTP.

## Comparativa con modelos similares

Solo es posible comparar con los dos artefactos directamente implicados en la cadena de derivacion, porque no se aportan datos de terceros ni benchmarks.

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Q5_NVFP4) | El nombre indica 27B; safetensors declara 1.863.907.840 | 262.144 tokens | GGUF NVFP4 + imatrix, 4,63 BPW, 14,74 GiB | Apache 2.0 | Publicado por AIconjured; 0 descargas y 0 likes en el momento de la consulta |
| HauhauCS Qwen3.8-27B-Uncensored-HauhauCS-Aggressive Q5_K_P (origen) | no disponible en detalle | 262.144 tokens (heredado) | GGUF Q5_K/Q6_K/Q4_K, 5,92 BPW, 18,83 GiB | Apache 2.0 (heredada) | Publicado por HauhauCS |
| Qwen/Qwen3.8-27B (base) | 27B segun denominacion | 262.144 tokens | no disponible (safetensors esperado) | Apache 2.0 | Modelo oficial de Qwen |

Frente a otros modelos abiertos de categoria similar (Llama, Mistral, Gemma de rango 27B-30B) no hay datos comparativos en la informacion proporcionada: no se publican benchmarks de este modelo, por lo que cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada de MMLU, razonamiento, codigo, matematicas ni capacidad multimodal. No se puede afirmar que la calidad se conserve tras la recuantizacion a NVFP4; el autor solo garantiza que los valores de los pesos no cambian.
- Discrepancia en el numero de parametros: el nombre del modelo y la model card hablan de 27B, mientras que el conteo real declarado en safetensors es de 1.863.907.840 parametros. Es imprescindible verificar este punto antes de planificar despliegues o calcular requisitos de memoria.
- Contenido sin censura: el perfil Aggressive elimina deliberadamente los rechazos. Puede producir contenido danino, ilegal o gravemente inapropiado ante peticiones directas. No debe exponerse a usuarios finales sin filtros externos y supervision.
- Procedencia del ajuste sin censura desconocida: la model card no documenta el dataset de la variante de HauhauCS ni la tecnica empleada. Esto implica riesgo de sesgos no auditados y de contaminacion del dataset de ajuste.
- Riesgo de alucinacion: inherente al modelo base y no evaluado en esta version. La ausencia de benchmarks impide acotar su magnitud.
- Idiomas: solo ingles y chino estan declarados. El espanol no figura en la lista oficial; su comportamiento en castellano es una extrapolacion no verificada.
- Restricciones de licencia: la licencia declarada es Apache 2.0, permisiva para uso comercial. No obstante, el uso comercial de una variante sin censura puede incumplir politicas de plataformas, requisitos regulatorios sectoriales o los terminos del proveedor de GPU o de nube. La responsabilidad legal del contenido generado recae en el desplegador.
- Dependencia de la aceleracion NVFP4: sin GPU Blackwell, el modelo funciona pero pierde la ventaja de rendimiento que justifica esta recuantizacion frente al Q5_K_P de origen, que ademas ocupa mas espacio. La ganancia real solo se materializa en sm_120.
- Calidad de cuantizacion parcialmente incierta: el autor reconoce que `token_embd.weight` no puede beneficiarse de la imatrix y queda con escalado por bloque simple; es un punto de perdida de calidad potencial no cuantificado.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe corroboracion independiente de que el modelo funcione segun lo descrito.
- La busqueda web realizada no devolvio ningun resultado tecnico relevante; los enlaces obtenidos eran contenido no relacionado con el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante sin censura de origen y sus cuantizados: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web no devolvio resultados tecnicos relevantes sobre este modelo.
