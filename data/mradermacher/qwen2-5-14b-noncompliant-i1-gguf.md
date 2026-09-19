# mradermacher/Qwen2.5-14B-Noncompliant-i1-GGUF

## Resumen

Qwen2.5-14B-Noncompliant-i1-GGUF es una publicación de cuantizaciones GGUF del modelo Qwen2.5-14B-Noncompliant, un ajuste fino no oficial sobre la base Qwen2.5-14B desarrollado por ApolloRaines. El autor de este repositorio es mradermacher, conocido por producir versiones cuantizadas con matrices de importancia (imatrix) de modelos de la comunidad. El repositorio no contiene pesos en safetensors: únicamente distribuye ficheros GGUF listos para motores de inferencia en CPU y GPU como llama.cpp, Ollama o LM Studio.

El modelo base Qwen2.5-14B es un transformer decoder-only denso de 14.770.033.664 parámetros (aproximadamente 14,77 mil millones), entrenado por Alibaba Cloud con soporte nativo de 32.768 tokens de contexto y hasta 131.072 mediante extensión YaRN. El sufijo "Noncompliant" del ajuste fino sugiere un modelo con comportamiento de rechazo reducido respecto al alineamiento original, aunque la model card publicada no documenta ni el dataset ni el método de entrenamiento empleado.

Su relevancia es práctica: ofrece una vía de despliegue local de un modelo de 14B con licencia permisiva en el modelo base, cuantizado en un rango muy amplio de precisiones (desde IQ1_S hasta Q6_K) para adaptarse a hardware que va desde equipos con poca VRAM hasta estaciones de trabajo. El repositorio está recién creado, con cero descargas y cero likes, y sin datos de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-14B) |
| Parametros totales | 14.770.033.664 (14,77 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-14B; no confirmado para este ajuste fino ni documentado en la model card |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base Qwen2.5 declara soporte de 29 idiomas, entre ellos castellano, ingles, chino, frances, aleman y portugues; no confirmado para este ajuste fino) |
| Licencia | No disponible en la informacion proporcionada |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings de rotacion posicional (RoPE) y atencion con consultas agrupadas (GQA). El modelo base fue entrenado por Alibaba sobre aproximadamente 18 billones de tokens, con etapas de ajuste supervisado y optimizacion por preferencias. El ajuste fino concreto que da lugar a la variante "Noncompliant" no documenta en la model card ni el numero de tokens adicionales, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otro metodo de alineamiento; los unicos metadatos disponibles son etiquetas internas de la herramienta de cuantizacion (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, `tags: nicoboss`).

La innovacion tecnica destacable de este repositorio es el proceso de cuantizacion, no el modelo en si. mradermacher genera las cuantizaciones con matrices de importancia (imatrix), un metodo que pondera el error de cuantizacion segun la relevancia estadistica de cada peso calculada sobre un corpus de calibracion, lo que mejora la calidad de las cuantizaciones agresivas (IQ2, IQ3, Q2_K) frente a la cuantizacion uniforme. El catalogo cubre 24 variantes, desde IQ1_S (aproximadamente 1,6 bits por peso) hasta Q6_K (aproximadamente 6,6 bits por peso), lo que permite ajustar el compromiso entre calidad y huella de memoria.

## Capacidades

- Generacion de texto conversacional multi-turno, con el tag `conversational` declarado en el repositorio.
- Razonamiento general, matematicas y generacion de codigo heredados del modelo base Qwen2.5-14B.
- Soporte de tool calling y function calling en el modelo base Qwen2.5-14B; no confirmado de forma explicita en la model card de este ajuste fino.
- Capacidades multilingues del modelo base (29 idiomas declarados por Alibaba); no confirmadas para el ajuste fino.
- Compatibilidad con endpoints mediante el tag `endpoints_compatible` del repositorio.
- Comportamiento de rechazo presumiblemente reducido respecto al modelo alineado original, inferido del nombre "Noncompliant"; no documentado por el autor.
- No hay evidencia de capacidades de vision, audio, modo de razonamiento explicito (thinking mode) ni decodificacion especulativa propia en la informacion disponible.

## Casos de uso

- Despliegue local en estacion de trabajo: con las cuantizaciones Q4_K_M o Q5_K_M el modelo cabe en GPUs de consumo de gama alta, permitiendo ejecutar un modelo de 14B sin enviar datos a servicios externos.
- Asistente conversacional autoalojado: el tag `conversational` y el contexto de 32.768 tokens del modelo base permiten mantener dialogos largos con historial extenso en aplicaciones de chat internas.
- Generacion de codigo en pipelines propios: al ser una variante del Qwen2.5-14B, es utilizable en tareas de autocompletado y refactorizacion integradas en herramientas locales de desarrollo.
- Experimentacion en investigacion sobre alineamiento: al tratarse de un ajuste fino con rechazo presumiblemente reducido, sirve como punto de comparacion en estudios sobre comportamiento de modelos desalineados, siempre que se apliquen las salvaguardas adecuadas.
- Procesamiento de texto por lotes en CPU: las cuantizaciones IQ2 y Q2_K reducen la huella a unos pocos gigabytes, lo que permite ejecutar el modelo en servidores sin GPU mediante llama.cpp para tareas de clasificacion, resumen o extraccion de informacion.
- Sustitucion de APIs comerciales en entornos con requisitos de soberania de datos: al ejecutarse en infraestructura propia y en formato GGUF, el modelo es adecuado para organizaciones que no pueden enviar contenido a terceros.
- Evaluacion comparativa de cuantizaciones: el repositorio publica 24 variantes del mismo modelo, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad segun el numero de bits por peso.
- Generacion de contenido creativo y redaccion asistida: tareas donde un modelo con menos restricciones de rechazo puede resultar util, con revision humana obligatoria del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica, y no se han encontrado evaluaciones independientes en la búsqueda web realizada.

## Requisitos de hardware

Todas las cifras de memoria son estimaciones calculadas a partir del numero de parametros (14,77 mil millones) y de los bits por peso tipicos de cada cuantizacion; no estan publicadas por el autor.

- IQ1_S / IQ1_M (~1,6-2,0 bits por peso): aproximadamente 3-4 GB de pesos. Ejecutable en CPU con 8 GB de RAM y en GPUs de 4-6 GB de VRAM.
- Q2_K / IQ2_M / IQ2_XS (~2,5-2,9 bits por peso): aproximadamente 4,5-5,5 GB de pesos. Cabe en GPUs de 6-8 GB (GTX 1660, RTX 3050, RTX 4060).
- IQ3_M / Q3_K_M / IQ3_XXS (~3,4-3,9 bits por peso): aproximadamente 6,5-7,5 GB de pesos. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB.
- Q4_K_M / IQ4_XS / Q4_0 (~4,5-4,8 bits por peso): aproximadamente 8,5-9,5 GB de pesos. Necesita GPUs de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) para contexto corto.
- Q5_K_M / Q5_K_S (~5,6-5,7 bits por peso): aproximadamente 10,5-11 GB de pesos. Recomendado a partir de 16 GB de VRAM (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, A100 40 GB).
- Q6_K (~6,6 bits por peso): aproximadamente 12-13 GB de pesos. Recomendado a partir de 16-24 GB de VRAM.
- A la memoria de pesos hay que sumar la cache KV, que crece linealmente con el contexto y puede anadir varios gigabytes adicionales al usar ventanas largas de 32.768 tokens.
- GPU recomendadas para produccion: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta ultima solo con cuantizaciones de hasta Q6_K y contexto reducido).
- GPU de consumo: si, el modelo cabe en tarjetas de consumo desde 6 GB con cuantizaciones IQ2 y desde 12 GB con Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y servidores compatibles con la API de OpenAI. vLLM y TGI soportan GGUF solo parcialmente, por lo que para produccion de alto rendimiento se recomienda partir de los pesos safetensors del modelo original.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-14B-Noncompliant-i1-GGUF) | 14,77 mil millones | No disponible (base: 32.768 tokens) | No disponible | GGUF | 24 cuantizaciones con imatrix; sin benchmarks publicados |
| Qwen2.5-14B-Instruct | 14,77 mil millones | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | Modelo oficial alineado de Alibaba; benchmarks publicados por el fabricante |
| Qwen2.5-14B (base) | 14,77 mil millones | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors | Modelo preentrenado sin ajuste conversacional; requiere fine-tuning para uso en chat |
| Llama 3.1 8B Instruct | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa de menor tamano y mayor contexto, con licencia con restricciones de uso |

Nota: los datos del modelo base Qwen2.5-14B y de Llama 3.1 8B Instruct provienen de la documentacion publica de sus fabricantes; los de este ajuste fino concreto no estan disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Qwen2.5 hereda sesgos de sus datos de entrenamiento (principalmente web en ingles y chino). El ajuste fino "Noncompliant" no documenta ninguna mitigacion, y la reduccion del comportamiento de rechazo puede amplificar la generacion de contenido sesgado u ofensivo.
- Riesgo de alucinacion: presente como en cualquier transformer de esta escala; no se han publicado evaluaciones de fidelidad factual para esta variante.
- Riesgo de contenido inapropiado: el nombre del modelo y la ausencia de documentacion sobre su alineamiento sugieren que puede producir contenido que otros modelos rechazarian. No es apto para despliegues orientados al publico sin filtros adicionales.
- Limitaciones de contexto: la model card no confirma la ventana de contexto efectiva de este ajuste fino; las cuantizaciones por debajo de 4 bits degradan la coherencia en contextos largos.
- Limitaciones de idioma: el soporte multilingue declarado por Alibaba corresponde al modelo base y no esta verificado para este ajuste fino.
- Restricciones de licencia: la licencia no esta especificada en el repositorio de cuantizaciones, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo original (ApolloRaines/Qwen2.5-14B-Noncompliant) y del modelo base Qwen2.5-14B antes de cualquier uso en produccion.
- Caveat de trazabilidad: el repositorio tiene cero descargas y cero likes, y no incluye evaluaciones. No hay evidencia independiente de su calidad.
- Caveat tecnico: las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS) reducen mucho el tamano, pero introducen perdida de calidad notable. Para uso en produccion se recomienda como minimo Q4_K_M.
- Advertencia de conformidad: el uso de modelos con rechazo reducido puede entrar en conflicto con politicas internas, requisitos regulatorios o los terminos de servicio de plataformas de despliegue.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/Qwen2.5-14B-Noncompliant-i1-GGUF
- Modelo original del ajuste fino: https://huggingface.co/ApolloRaines/Qwen2.5-14B-Noncompliant
- Modelo base Qwen2.5-14B (referencia): https://huggingface.co/Qwen/Qwen2.5-14B
- Repositorio del autor de las cuantizaciones: https://huggingface.co/mradermacher

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo (los resultados obtenidos correspondian a un fabricante de herramientas electricas y no guardan relacion con el contenido de esta ficha).
