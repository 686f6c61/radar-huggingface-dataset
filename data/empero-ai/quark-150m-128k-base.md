# empero-ai/Quark-150M-128K-Base

## Resumen

Quark-150M-128K-Base es un modelo de lenguaje base de aproximadamente 165,3 millones de parametros (140,0 millones sin contar los embeddings) desarrollado por empero-ai, un laboratorio que publica la familia Quark como artefacto de investigacion sobre modelos de lenguaje pequenos. Su rasgo diferencial es la ventana de contexto: 131.072 tokens, conseguida extendiendo un checkpoint intermedio del modelo Quark-150M de 32K mediante 10.000 millones de tokens adicionales entrenados directamente a secuencias de 128K. Esto lo situa en una categoria poco habitual: modelos de menos de 200 millones de parametros con contexto largo real, no simulado.

La arquitectura es un transformer decoder-only hibrido de 16 capas y anchura 768, con 12 capas de atencion local (ventana deslizante de 256 tokens) y 4 capas globales con atencion causal completa y grouped-query attention. Este diseno mantiene un estado de inferencia pequeno, ya que solo las 4 capas globales conservan cache key/value completo. Los pesos se distribuyen en safetensors en float32, con licencia Apache 2.0.

Es relevante ahora porque permite investigar dinamicas de contexto largo, extension de RoPE y aprendizaje por refuerzo sobre modelos base en hardware muy modesto. No es un producto: el autor lo declara explicitamente como artefacto de investigacion sin entrenamiento de seguridad ni evaluacion para produccion. El checkpoint incorpora ademas cuatro tokens especiales de tool calling y datos con formato de chat en su mezcla de contexto largo, aunque no ha pasado por instruction tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido: 12 capas de atencion local con sliding window (256 tokens) + 4 capas globales con GQA; convolucion causal corta con doble puerta en paralelo a la atencion local |
| Parametros totales | 165.254.528 (140,0M sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32 safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (declarado); la mezcla de entrenamiento incluye documentos PDF en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

Datos adicionales de la model card: 16 capas (12 locales, 4 globales), anchura 768, 12 cabezas de atencion de tamano 64, embeddings de entrada y salida atados, vocabulario de 32.772 tokens (tabla de embeddings rellenada a 32.896), MLP con puerta squared-ReLU de tamano oculto 2048, y aproximadamente 506.000 millones de tokens de entrenamiento acumulados.

## Arquitectura y entrenamiento

El modelo combina dos tipos de capa. Las 12 capas locales aplican sliding-window attention sobre los ultimos 256 tokens, con RoPE, QK-norm y un attention sink aprendido por cabeza; en paralelo corre una convolucion causal corta de kernel 4 con doble puerta, y ambas senales se mezclan por canal. Las 4 capas globales, intercaladas cada cuatro capas, usan atencion causal completa con grouped-query attention (12 cabezas de consulta, 4 de clave/valor) con RoPE y QK-norm. Ademas, cada atencion posterior a la primera mezcla sus values con los de la primera capa mediante una puerta por token y por cabeza (gated value residuals), y el residual stream usa actualizaciones escaladas por profundidad con RMSNorm antes y despues de cada subcapa (sandwich norm), manteniendose en float32 incluso con pesos en bfloat16.

El entrenamiento parte de un checkpoint tardio de la fase de anneal a 32K de Quark-150M (unos 496.000 millones de tokens) y continua con 10.000 millones de tokens a secuencias de 131.072 tokens. La mezcla de extension incluye libros (PG-19, DOAB), libros de texto, documentos PDF largos (FinePDFs, con otros idiomas), papers de arXiv, instrucciones de seguimiento de contexto largo, sesiones sinteticas de contexto largo y tool use, y replay de los datos de la etapa de 32K. Se uso una tasa de aprendizaje maxima de 3e-4 con decaimiento a cero y lotes de 1 millon de tokens. Para soportar la longitud extendida, la base RoPE de las capas globales se elevo de 500K a 4M, y se anadieron al vocabulario los tokens `[TOOL_CALL]`, `[/TOOL_CALL]`, `[TOOL_RESULT]` y `[/TOOL_RESULT]`. El tokenizador es un BPE a nivel de byte de 32.768 tokens en el que cada etiqueta de chat es un unico token.

## Capacidades

- Generacion de texto autoregresiva en ingles, con modo base (sin instruction tuning): completa texto, responde a continuaciones de prompt y sigue formatos de chat si se le presenta la plantilla adecuada.
- Razonamiento de contexto largo: ventana efectiva de 131.072 tokens, pensada para documentos extensos, libros y papers.
- Tool calling mediante tokens especiales: emite `[TOOL_CALL] {"name": ..., "arguments": {...}} [/TOOL_CALL]` y consume resultados en turnos `[TOOL_RESULT] ... [/TOOL_RESULT]`.
- Formato de chat estructurado con etiquetas `[SYSTEM]`, `[USER]`, `[MONOLOGUE]` (pensamiento privado opcional) y `[ASSISTANT]`, cada una tokenizada como token unico.
- Capacidad de "monologo": puede generar un bloque de razonamiento interno antes de la respuesta final si se le pide mediante la etiqueta correspondiente.
- Multilingue limitado: el autor solo declara ingles; la mezcla de entrenamiento incluye PDFs en otros idiomas, pero no se garantiza calidad fuera del ingles.
- No dispone de vision, audio ni otras modalidades.
- No es un modelo instruct: no sigue instrucciones de forma fiable sin ejemplos o ajuste previo.

## Casos de uso

- Investigacion sobre contexto largo en modelos pequenos: permite estudiar como un modelo de 165M parametros maneja secuencias de 128K y comparar con variantes de 4K y 32K de la misma familia, con coste de computo muy bajo.
- Analisis de documentos largos en laboratorio: ingerir libros, tesis o papers de arXiv completos y evaluar recuperacion de informacion y coherencia a lo largo de decenas de miles de tokens, sin necesidad de GPUs de gama alta.
- Experimentos de extension de contexto y RoPE: el checkpoint documenta el cambio de base RoPE de 500K a 4M, lo que lo convierte en una referencia practica para reproducir tecnicas de escalado de contexto.
- Investigacion en RL sobre modelos base: la familia incluye una variante Zero entrenada con GRPO directamente desde este checkpoint, de modo que este modelo sirve como punto de partida controlado para estudiar aprendizaje por refuerzo sin SFT.
- Pruebas de formato de tool calling: validar pipelines de agentes que parsean las etiquetas `[TOOL_CALL]` y `[TOOL_RESULT]` en un entorno de bajo coste antes de migrar a modelos mayores.
- Prototipado de asistentes conversacionales con plantilla de chat: usar el formato `[SYSTEM]`/`[USER]`/`[ASSISTANT]` con `[MONOLOGUE]` para experimentar con razonamiento explicito en un modelo minimo.
- Evaluacion de tecnicas de inferencia eficiente: su estado de cache reducido (solo 4 capas globales con KV completo, 255 tokens de KV en las locales y estado de convolucion de 3 tokens) lo hace idoneo para medir throughput y memoria en decodificacion de secuencias muy largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 165,3M de parametros ocupan aproximadamente 0,66 GB de pesos; en bfloat16, unos 0,33 GB. A ello hay que sumar el estado de inferencia (cache KV de las 4 capas globales y estado local reducido) y el residual stream, que se mantiene en float32.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para inferencia en bfloat16; una RTX 3060, RTX 4060 o superior es mas que suficiente. Para entrenamiento o fine-tuning completo se recomienda A100 o H100 por memoria y ancho de banda.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para secuencias cortas.
- Opciones de despliegue: la model card solo documenta `transformers>=5.23` con `trust_remote_code=True` (el codigo de modelado se distribuye con los pesos). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y al tratarse de una arquitectura hibrida con codigo personalizado es probable que requieran adaptaciones no documentadas.
- Latencia y throughput: no disponibles en la informacion proporcionada. El diseno de cache reducido sugiere ventajas en decodificacion de secuencias largas, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Quark-150M-128K-Base | 165,3M | 131.072 | Apache 2.0 | Hibrido local/global, tool tokens, solo ingles, artefacto de investigacion |
| Quark-150M-32K-Base | ~165M (misma familia) | 32.768 | Apache 2.0 | Mismo modelo tras el anneal a 32K, sin extension de contexto |
| Quark-150M-32K-Raw | ~165M (misma familia) | 4.096 (hasta 4K en entrenamiento) | Apache 2.0 | Checkpoint pre-anneal, fase de learning rate constante |
| Quark-150M-128K-Zero | ~165M (misma familia) | 131.072 | Apache 2.0 | RL con GRPO desde el base 128K, sin SFT |

No se dispone en la informacion proporcionada de datos de benchmarks ni de comparaciones con modelos de otros laboratorios (por ejemplo, de la categoria de modelos sub-200M con contexto largo), por lo que no es posible establecer una comparativa de rendimiento con alternativas externas.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor declara explicitamente que no es un producto y que no ha sido evaluado para uso en produccion.
- Sin entrenamiento de seguridad: no ha pasado por alineamiento ni filtros de seguridad; puede generar texto sesgado, toxico o danino.
- Alucinacion: como cualquier modelo pequeno, comete errores factuales y de razonamiento con frecuencia; no debe usarse para decisiones que afecten a personas.
- Sin instruction tuning: no sigue instrucciones de forma fiable; el uso conversacional requiere aportar la plantilla de chat y, preferiblemente, ejemplos.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado pese a incluir PDFs multilingues en el entrenamiento.
- Decodificacion: el autor advierte que los modelos base pequenos se repiten bajo decodificacion greedy; recomienda muestreo con temperatura 0,7, top_p 0,9 y una penalizacion de repeticion suave de 1,1.
- Dependencias tecnicas: requiere `transformers>=5.23` y `trust_remote_code=True`, lo que implica ejecutar codigo de modelado distribuido con los pesos; conviene revisarlo antes de desplegarlo.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluacion y de salvaguardas hace que cualquier despliegue en produccion requiera evaluacion y protecciones propias.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin ecosistema de terceros documentado (cuantizaciones GGUF, integraciones en frameworks de servido).

## Enlaces

- Hugging Face: https://huggingface.co/empero-ai/Quark-150M-128K-Base
