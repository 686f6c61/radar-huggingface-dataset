# AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP8

## Resumen

AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP8 es un checkpoint cuantizado en formato MLX para Apple Silicon, publicado por AutomatosX a partir del modelo base tencent/Hy-MT2-30B-A3B. Se trata de una conversión de precisión mixta bajo el esquema propietario AXQuant (AXQ) 2.1.0, que preserva embeddings, normalizaciones y otros tensores sensibles en mayor precisión y aplica cuantización de 8 bits al resto del camino de texto. El resultado declara un BPW medido de 8,2501 y un peso total de 31,00 GB en safetensors MLX.

El modelo hereda la arquitectura del base: HYV3ForCausalLM, un transformer de mezcla de expertos (MoE) con 30.064.719.872 parámetros lógicos totales y 3B activos por token, orientado a traducción multilingüe de alta precisión. Según la documentación del modelo original, Hy-MT2 cubre 33 pares de idiomas y está diseñado para entornos reales con instrucciones de traducción contextuales y glosarios.

La relevancia de este paquete es acotada y conviene remarcarla: el propio autor lo etiqueta como "development evidence", no como release certificado de AXQuant. No publica evidencias de calidad, de contexto largo, de velocidad de kernel ni de MTP, y no incluye manifiesto nativo validado para AX Engine. Es, por tanto, un artefacto útil para desarrollo y evaluación local en Mac con MLX, no una distribución lista para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HYV3ForCausalLM (transformer MoE, camino de texto optimizado) |
| Parametros totales | 30.064.719.872 (~30,06B logicos) |
| Parametros activos | ~3B (denominacion A3B del modelo base) |
| Longitud de contexto | 262.144 tokens configurados; limite practico segun memoria unificada |
| Tipos de cuantizacion | AXQuant 2.1.0; clase MXFP8; 100% pesos principales en 8bit (afin, group size 32); 216.960 parametros en bf16; BPW medido 8,2501; BPW base AXQuant 16p0bpw |
| Idiomas soportados | 33 pares de idiomas en el modelo base Hy-MT2; no detallado en la model card del checkpoint cuantizado |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (no incluye pesos PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El checkpoint no documenta un entrenamiento propio: es una cuantizacion del modelo tencent/Hy-MT2-30B-A3B (revision `d3ead4dba61c09aac60a261a96ad1df3e705febb`). La arquitectura subyacente es HYV3ForCausalLM, un transformer de mezcla de expertos con 30,06B de parametros logicos y aproximadamente 3B activos por token, lo que reduce el coste computacional por inferencia frente a un modelo denso del mismo tamano. La model card del cuantizado no aporta detalles sobre numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO del modelo original; esa informacion no esta disponible en el material proporcionado.

En lo relativo a la cuantizacion, AXQuant 2.1.0 no aplica una precision uniforme: los tensores protegidos (embeddings, normas y otros) se mantienen en precision superior, mientras que los pesos principales se asignan a 8 bits con metodo afin y tamano de grupo 32. La planificacion se basa en "architecture_prior", es decir, prioris de arquitectura, sin calibracion de datos. El registro de ejecucion del cuantizador reporta 18.433 de 18.433 conversiones de modulo correctas y 0 fallbacks. No hay MTP (multi-token prediction) ni torre de vision en este paquete. La cuantizacion se limita al camino de texto.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, tag conversational).
- Traduccion entre 33 pares de idiomas, capacidades heredadas del modelo base Hy-MT2.
- Seguimiento de instrucciones de traduccion en varios idiomas, con soporte para tareas contextuales y basadas en glosario segun la documentacion del base.
- Razonamiento y generacion autoregresiva estandar propios de un transformers MoE orientado a texto.
- Inferencia local en Apple Silicon mediante MLX-LM.
- No incluye vision: el paquete declara vision = False y no adjunta sidecar de vision.
- No incluye audio: speech-recognition no aplicable.
- No incluye MTP: MTP present = False, sin aceleracion de decodificacion especulativa.
- Soporte de tool calling / function calling: no documentado en el material disponible.
- Capacidades de agente y multi-step reasoning: no documentadas en el material disponible.

## Casos de uso

- Traduccion local en Mac: ejecucion de traduccion multilingue directamente en un equipo Apple Silicon sin enviar datos a servicios externos, aprovechando las capacidades de los 33 pares de idiomas del base y el formato MLX.
- Evaluacion de cuantizacion: comparar la fidelidad de este pack de 8,25 BPW frente a los hermanos 4bit y 6bit y frente al modelo BF16, para decidir el presupuesto de almacenamiento y memoria en despliegues AXQuant.
- Desarrollo y pruebas de pipelines MLX: servir como checkpoint de trabajo para integrar MLX-LM en prototipos internos y validar flujos de carga antes de invertir en la version certificada.
- Traduccion con glosario en entornos controlados: en documentacion tecnica o legal donde se requiera terminologia consistente, aprovechando el soporte de glosario del modelo base.
- Procesamiento de documentos largos: con 262.144 tokens de contexto configurado, encaja en tareas de traduccion o resumen de documentos extensos, siempre que la memoria unificada disponible lo permita y previa validacion del comportamiento real en contexto largo.
- Generacion de contenido multilingue asistida: redaccion y adaptacion de textos en varios idiomas como paso previo en flujos editoriales, con revision humana posterior dada la falta de evidencias de calidad publicadas.
- Base para fine-tuning o destilacion experimental en Mac: punto de partida para experimentos de ajuste en precision reducida sobre Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se publican evidencias de calidad frente a BF16 o a baselines uniformes, ni de contexto largo, ni de velocidad de kernel, y que no se reclama ninguna retencion de calidad. La capacidad de 262.144 tokens es metadato de configuracion, no una afirmacion validada.

Como referencia externa de rendimiento hardware (no de calidad) de un modelo de la misma familia y distinto empaquetado, la ficha de omlx.ai reporta para Hy-MT2-30B-A3B-APEX-Imatrix-I-Compact-MLX (4bit) sobre M4 Max de 40 nucleos con 128 GB: 1.197 tok/s en prefill (PP) y 44,0 tok/s en generacion (TG). Este dato corresponde a otro paquete de 4 bits, no a este checkpoint de 8 bits, por lo que no debe extrapolarse directamente.

## Requisitos de hardware

- Peso en safetensors MLX: 31,00 GB; descarga completa aproximada: 31,04 GB. Conviene reservar al menos 31,04 GB de disco.
- VRAM / memoria unificada estimada: al ser un modelo MoE de 30B en 8 bits, se necesita memoria unificada suficiente para los pesos mas los buffers de inferencia; el autor no declara un minimo de memoria. Como orientacion, preve al menos ~34-40 GB de memoria unificada para el modelo con margen de contexto y activaciones.
- Plataforma objetivo: Apple Silicon con MLX; el paquete no incluye pesos PyTorch ni GGUF.
- GPU compatibles: no se declaran GPU Nvidia (A100, H100, RTX 4090) para este formato MLX. La referencia de rendimiento disponible usa un M4 Max de 40 nucleos con 128 GB.
- Cabida en hardware de consumo: no cabe en Macs con memoria unificada baja; requiere equipos de gama alta con memoria unificada amplia (por ejemplo, configuraciones de 48 GB o superiores). No se declara cifra minima oficial.
- Opciones de despliegue: MLX-LM (ruta soportada para inferencia de texto/backbone). AX Engine no esta establecido: el paquete no incluye `model-manifest.json` validado. Otros motores como vLLM, TGI, llama.cpp u Ollama no son aplicables directamente a pesos MLX sin conversion.
- Latencia y throughput: no medidos para este paquete. El registro del autor indica velocidad de kernel como "unmeasured" y aceptacion/velocidad de MTP como no medidas.
- Versiones registradas en la conversion: MLX 0.32.1 y MLX-LM 0.31.3; AX Engine 7.6.3 (version registrada, sin verificacion de runtime).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP8 (este) | 30,06B totales, ~3B activos | 262.144 tokens configurados | MXFP8, 8,25 BPW medido | apache-2.0 | MLX safetensors | En Hub; no certificado |
| AX-Hy-MT2-30B-A3B-MLX-AXQ-4bit | 30,06B totales, ~3B activos | No disponible en el material | AXQ, menor presupuesto de almacenamiento | apache-2.0 | MLX safetensors | En Hub (hermano) |
| AX-Hy-MT2-30B-A3B-MLX-AXQ-6bit | 30,06B totales, ~3B activos | No disponible en el material | AXQ, cercano al presupuesto de 6 BPW | apache-2.0 | MLX safetensors | En Hub (hermano) |
| tencent/Hy-MT2-30B-A3B (base) | 30,06B totales, ~3B activos | No disponible en el material | BF16 | No disponible en el material | No disponible en el material | En Hub (modelo base) |
| Hy-MT2-30B-A3B-APEX-Imatrix-I-Compact-MLX | 30B, ~3B activos | No disponible en el material | 4bit | No disponible en el material | MLX | Tercero (omlx.ai) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, salvo la referencia de throughput de 4 bits citada en la seccion anterior.

## Limitaciones y advertencias

- No certificado: el autor indica que las puertas formales M0-M8 de AXQuant no estan cerradas y que el paquete es evidencia de desarrollo, no un release certificado. No debe interpretarse la etiqueta AXQ como afirmacion de rendimiento.
- Sin evidencia de calidad: no se publican comparativas de calidad frente a BF16 ni frente a baselines uniformes; no hay reclamacion de retencion de calidad.
- Contexto largo no validado: los 262.144 tokens son metadato de configuracion; el comportamiento real en contexto largo depende de la memoria unificada y no ha sido verificado.
- AX Engine no establecido: no se incluye manifiesto nativo validado; usar la ruta de MLX-LM especifica de la arquitectura.
- Sin MTP ni vision: no hay decodificacion especulativa ni torre de vision; MLX-LM puede ignorar metadatos de runtime y sidecars opcionales, de modo que el comando de ejemplo no establece aceleracion MTP ni calidad vision-lenguaje.
- Formato restringido: al ser MLX safetensors, no es usable directamente en ecosistemas Nvidia ni en motores como vLLM, TGI, llama.cpp u Ollama sin conversion previa.
- Idiomas: los 33 pares de idiomas provienen del modelo base; la model card del cuantizado no detalla el listado ni garantiza el mismo comportamiento tras la cuantizacion.
- Idiomas no declarados en los metadatos del Hub: el campo de idiomas figura como no disponible.
- Riesgo de alucinacion y sesgos: no documentados en el material proporcionado; procede aplicar las precauciones estandar de un modelo de generacion de texto.
- Licencia: apache-2.0, permisiva para uso comercial, pero la ausencia de validacion de calidad traslada al usuario la responsabilidad de verificar el comportamiento en produccion.
- Reproducibilidad: conviene fijar el commit del Hub en despliegues reproducibles en lugar de depender indefinidamente de `main`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Revision del modelo base: https://huggingface.co/tencent/Hy-MT2-30B-A3B/tree/d3ead4dba61c09aac60a261a96ad1df3e705febb
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-4bit
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo de modelos MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Coleccion MLX: https://huggingface.co/collections/AutomatosX/mlx
- Especificaciones de Hy-MT2-30B-A3B (apxml): https://apxml.com/models/hy-mt2-30b-a3b
- Rendimiento del 4bit APEX en M4 Max (omlx.ai): https://omlx.ai/benchmarks/performance/c6drogab
- Ficha de Hy-MT2-30B-A3B (xinference): https://model.xinference.io/models/detail/Hy-MT2-30B-A3B
- Referencia de un empaquetado relacionado MXFP4: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP4
