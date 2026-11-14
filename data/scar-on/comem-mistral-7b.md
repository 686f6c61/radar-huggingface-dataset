# scar-on/CoMem-Mistral-7B

## Resumen

CoMem-Mistral-7B es un conjunto de checkpoints publicados por el usuario scar-on que implementan CoMem, una tecnica de compresion de contexto sobre el modelo base mistralai/Mistral-7B-Instruct-v0.2. El repositorio no contiene los pesos completos del modelo base, sino unicamente los adaptadores (encoder y decoder) y las capas de embedding de entrada y salida necesarias para el tokenizador expandido que emplea la tecnica. Se distribuye en dos etapas (`stage1` y `stage2`) y cinco tasas de compresion (4, 8, 16, 64 y 128).

La propuesta es relevante porque aborda uno de los cuellos de botella mas acuciantes en el despliegue de LLM: el coste cuadratico de la atencion sobre contextos largos. CoMem introduce un mecanismo de memoria comprimida que reduce la huella de tokens de contexto, permitiendo procesar secuencias mas largas con el mismo presupuesto de computo. El checkpoint se apoya en Mistral-7B-Instruct-v0.2, un transformer decoder-only de 7.000 millones de parametros con ventana de contexto nativa de 32.768 tokens.

No obstante, se trata de un artefacto de investigacion con traccion practicamente nula (0 descargas, 0 likes en el momento de la consulta), sin model card completa, sin resultados de benchmarks publicados y con una licencia personalizada (`comem-mixed-source-terms`) que exige revision juridica antes de cualquier uso comercial. Su evaluacion debe hacerse con cautela y siempre acompanada del codigo del repositorio CoMem.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2) con adaptadores CoMem de compresion de contexto |
| Parametros totales | 7.000 millones (modelo base Mistral-7B); los adaptadores CoMem anaden un numero no especificado de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explicitamente; hereda la del modelo base (32.768 tokens en Mistral-7B-Instruct-v0.2) y la amplia via compresion |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en `.pth`, no en formatos cuantizados) |
| Idiomas soportados | no disponible (heredados del modelo base, sin declaracion explicita) |
| Licencia | `comem-mixed-source-terms` (licencia personalizada, ver enlace en el repositorio) |
| Formato de pesos | `.pth` (PyTorch): `adapters.pth`, `decoder_first_last_layers.pth`, mas `config.json` y ficheros de tokenizador |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.2, un transformer decoder-only con atencion de ventana deslizante (sliding window attention), RoPE y GQA, afinado por instrucciones. Sobre esa base, CoMem introduce adaptadores de encoder y decoder que comprimen la representacion del contexto en un conjunto reducido de "memorias". El repositorio incluye las capas de embedding de entrada y salida necesarias para un tokenizador expandido, lo que sugiere que la tecnica anade tokens especiales o modifica el vocabulario.

El entrenamiento se organiza en dos etapas segun la model card: `stage1` entrena conjuntamente adaptadores de encoder y decoder; `stage2` congela el adaptador de encoder y entrena solo el de decoder. Se ofrecen cinco tasas de compresion (4, 8, 16, 64 y 128), y los adaptadores no son intercambiables entre tasas: cada checkpoint debe usarse con su tasa correspondiente. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o preferencia humana adicional sobre el base. El codigo incluye porciones derivadas de Apple ml-clara, segun reconoce el autor en la model card.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Mistral-7B-Instruct-v0.2.
- Procesamiento de contextos largos mediante compresion de memoria: la tecnica CoMem reduce la huella de tokens de contexto con tasas de 4x a 128x.
- Seguimiento de instrucciones y formato de chat (el base es un modelo instruct).
- Capacidad multilingue heredada del base (principalmente ingles, con soporte parcial de otros idiomas), aunque el autor no declara idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion disponible.
- El modelo requiere cargarse mediante la clase `CoMem` del paquete `openrlhf.models.modeling_comem`, no mediante `transformers` estandar.

## Casos de uso

- Investigacion sobre compresion de contexto: el checkpoint sirve para reproducir y comparar tasas de compresion (4, 8, 16, 64, 128) sobre Mistral-7B, midiendo la degradacion de calidad frente al modelo sin comprimir.
- Procesamiento de documentos largos en laboratorio: con tasas de compresion altas (64x, 128x) se puede experimentar con resumenes de contratos, articulos o expedientes que exceden la ventana nativa del base, siempre validando la fidelidad.
- Despliegue con restricciones de memoria: la compresion reduce el coste de atencion y puede abaratar el serving de contextos largos en GPUs con VRAM limitada, aunque el ahorro real depende de la implementacion.
- Analisis de conversaciones multi-turno extensas: util para prototipos de atencion al cliente donde el historial crece y se quiere evitar truncar, evaluando la perdida de informacion por compresion.
- Fine-tuning de adaptadores sobre dominios verticales: el diseno de dos etapas permite congelar el encoder y reentrenar el decoder, lo que facilita adaptar la memoria comprimida a un corpus especifico (legal, medico, financiero).
- Benchmarking academico de tecnicas de memoria: comparar CoMem con otras aproximaciones (RAG, resumen jerarquico, atencion dispersa) en tareas de QA sobre documentos largos.
- Base para experimentos de eficiencia en inferencia: medir latencia y throughput con distintas tasas de compresion y cuantizaciones del base, siempre que se integre el codigo CoMem.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Mistral-7B en fp16 requiere aproximadamente 14-16 GB; en cuantizacion 4-bit, entre 4 y 6 GB. Los adaptadores CoMem anaden una cantidad no especificada, por lo que la cifra exacta no esta disponible.
- GPU recomendadas para el base en fp16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) o A6000 (48 GB) para margen con contextos largos.
- GPU consumer: Mistral-7B cabe en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantizacion 4-bit; la viabilidad con CoMem depende del overhead de los adaptadores, no documentado.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La unica via indicada es cargar el modelo con `CoMem.from_pretrained(...)` del paquete `openrlhf.models.modeling_comem` con `pure_inference=True`.
- Latencia y throughput: no disponibles. La compresion de contexto deberia reducir el coste de atencion, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de contexto largo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoMem-Mistral-7B | 7B + adaptadores | 32.768 (base) ampliable por compresion | Compresion de memoria con adaptadores (tasas 4-128x) | `comem-mixed-source-terms` | Repo de investigacion, 0 descargas |
| Mistral-7B-Instruct-v0.2 | 7B | 32.768 | Ventana deslizante nativa | Apache 2.0 | Ampliamente disponible |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Ventana deslizante nativa | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-7B-Instruct | 7B | 131.072 | Contexto nativo extendido | Apache 2.0 (mayoria de variantes) | Ampliamente disponible |

La comparativa es aproximada: no hay datos de rendimiento publicados para CoMem-Mistral-7B que permitan contrastar calidad frente a estos modelos. La ventaja teorica de CoMem es la reduccion del coste de atencion; la desventaja practica es la falta de integracion con herramientas estandar y la licencia restrictiva.

## Limitaciones y advertencias

- Licencia personalizada `comem-mixed-source-terms`: requiere revision juridica antes de uso comercial; ademas, los pesos del modelo base estan sujetos a sus propios terminos (Mistral-7B-Instruct-v0.2 se distribuye bajo Apache 2.0, pero el conjunto CoMem anade condiciones).
- El repositorio no incluye los pesos del base: es necesario descargar mistralai/Mistral-7B-Instruct-v0.2 por separado y respetar su licencia.
- Riesgo de alucinacion heredado del base, potencialmente agravado por la compresion de contexto: a tasas altas (64x, 128x) la perdida de informacion puede ser significativa y no esta cuantificada.
- Sin benchmarks publicados: no hay evidencia empirica de la calidad frente al modelo sin comprimir ni frente a alternativas.
- Los adaptadores no son intercambiables entre tasas de compresion; usar una tasa distinta a la entrenada invalida el checkpoint.
- Soporte limitado de herramientas: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI; el unico camino indicado es el paquete `openrlhf`.
- Idiomas no declarados: se asume el comportamiento del base (predominantemente ingles), sin garantias para castellano u otros idiomas.
- Traccion nula (0 descargas, 0 likes) y fecha de creacion futura respecto al momento de consulta: senal de artefacto experimental sin validacion comunitaria.
- Sin informacion sobre sesgos especificos, datos de entrenamiento ni procesos de alineacion adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/scar-on/CoMem-Mistral-7B
- Repositorio CoMem: https://github.com/scar-on/CoMem
- Licencia CoMem: https://github.com/scar-on/CoMem/blob/master/LICENSE
- Acknowledgements: https://github.com/scar-on/CoMem/blob/master/ACKNOWLEDGEMENTS
- Codigo de Apple ml-clara (upstream): https://github.com/apple/ml-clara
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
