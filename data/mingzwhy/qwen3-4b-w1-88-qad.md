# MingZwhy/Qwen3-4B-W1.88-QAD

## Resumen

Qwen3-4B-W1.88-QAD es un checkpoint latente de destilacion con conciencia de cuantizacion (QAD, quantization-aware distillation) publicado por el usuario MingZwhy en HuggingFace. Se trata del punto de partida del denominado "brazo W1.88" para una etapa posterior de destilacion on-policy (OPD), dentro de un pipeline de investigacion sobre cuantizacion extrema de pesos. El modelo deriva de Qwen/Qwen3-4B, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros, y hereda su licencia Apache-2.0.

Es importante subrayar que no es un modelo terminado. Segun la propia model card, los tensores almacenados estan en bf16 y no estan cuantizados: el entrenamiento QAD conserva pesos maestros de alta precision y aplica el cuantizador dentro del forward pass, de modo que lo que se guarda es la copia maestra. Cargar este repositorio directamente devuelve un modelo sin cuantizar que, ademas, puntuara mejor en evaluacion que el modelo W1.88 real, lo que puede inducir a error si se compara sin tenerlo en cuenta.

Su relevancia es, por tanto, metodologica: sirve como `STUDENT_MODEL` en la etapa OPD del recetario QAOPD, y documenta un esquema de cuantizacion mixta de 1,88 bits efectivos (bloques INT1.58/INT4) que apunta a ejecutar modelos de ~4B con una huella de memoria del orden de un gigabyte. Para cargar y evaluar un modelo utilizable hay que acudir al checkpoint recuperado MingZwhy/Qwen3-4B-W1.88-QAOPD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), heredada del modelo base Qwen/Qwen3-4B |
| Parametros totales | 196.096 reportados por safetensors (dato incoherente con el tamano del repositorio, ver limitaciones); el modelo base Qwen3-4B tiene ~4.000 millones |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en el repositorio; hereda la del modelo base Qwen3-4B (32.768 tokens nativos, ampliables a 131.072 con YaRN) |
| Tipos de cuantizacion | Esquema objetivo del brazo W1.88: pesos mixtos INT1.58/INT4 en bloques de 256, con el 12,5 % de los bloques en INT4, lo que da 1,88 bits efectivos; embedding y cabeza de salida en INT4; activaciones en INT8; KV cache en 16 bits durante OPD y evaluacion. Los tensores almacenados estan en bf16 sin cuantizar |
| Idiomas soportados | no disponible en el repositorio; el modelo base Qwen3-4B cubre mas de 100 idiomas |
| Licencia | Apache-2.0 (heredada de Qwen3-4B) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-4B: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y codificacion posicional rotatoria (RoPE), disenado para generacion de texto y con modos de razonamiento explicito ("thinking") y no Thinking heredables de la familia Qwen3. Este checkpoint concreto no introduce cambios estructurales: su interes esta en el procedimiento de entrenamiento, no en la topologia.

El pipeline descrito en la model card consta de dos fases. En la fase QAD se mantienen pesos maestros en alta precision (bf16) y se aplica el cuantizador dentro del forward pass, de modo que el modelo "aprende" a convivir con el ruido de cuantizacion. El resultado de esa fase es precisamente este repositorio. La fase siguiente, OPD (destilacion on-policy), parte de este checkpoint como estudiante (`STUDENT_MODEL`) y es la que aporta la configuracion del cuantizador. El recetario y el codigo se publican en el repositorio GitHub MingZwhy/QAOPD, con un script de referencia (`scripts/opd/run_math.sh`). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- No es un modelo para inferencia directa: la model card lo describe explicitamente como "starting point for training, not a finished model".
- Carga sin errores en transformers, pero devuelve un modelo sin cuantizar; sus respuestas y puntuaciones no representan al modelo W1.88 final.
- Hereda teoricamente las capacidades del modelo base Qwen3-4B (generacion de texto, razonamiento, codigo y matematicas basicas, modo thinking), aunque no estan validadas en este checkpoint.
- Soporte de tool calling y function calling: heredado del base Qwen3-4B, no verificado en este repositorio.
- Soporte de agentes y razonamiento multi-paso: heredado del base, no verificado.
- Capacidades multilingues: no disponibles en el repositorio; el base declara mas de 100 idiomas.
- Capacidad especial relevante: sirve como punto de partida reproducible para experimentos de destilacion con conciencia de cuantizacion en regimen de muy baja precision.

## Casos de uso

- Reproduccion de experimentos de QAD/OPD: el checkpoint se usa como `STUDENT_MODEL` en la etapa OPD del recetario QAOPD, lo que permite replicar el brazo W1.88 paso a paso con la configuracion de cuantizador que aporta esa etapa.
- Investigacion academica sobre cuantizacion extrema: proporciona un punto de partida documentado para estudiar el impacto de esquemas mixtos INT1.58/INT4 (1,88 bits efectivos) en un modelo de ~4B.
- Desarrollo de nuevas recetas de destilacion: al ser un checkpoint intermedio en bf16, es un sustrato comodo para probar variantes de la fase OPD (distintos bitwidths, tamanos de bloque, proporciones INT4/INT1.58) sin reentrenar desde cero.
- Comparacion metodologica de tecnicas de cuantizacion: permite contrastar la ruta QAD+OPD frente a esquemas post-hoc como GPTQ, AWQ o GGUF k-quants, manteniendo fijo el modelo base.
- Base para fine-tuning posterior en baja precision: util si se quiere adaptar el modelo a un dominio concreto antes de aplicar la cuantizacion final, aprovechando que los pesos maestros siguen en alta precision.
- Auditoria de artefactos de publicacion: sirve para ilustrar por que un checkpoint intermedio no debe publicarse sin avisos, ya que cargarlo directamente da un modelo distinto (y mejor puntuado) que el que se pretende distribuir.
- Despliegue en produccion: no aplica a este repositorio. Para inferencia realista habria que usar el checkpoint recuperado Qwen3-4B-W1.88-QAOPD, cuyo caso de uso natural es ejecutar un modelo de ~4B con una huella de memoria minima en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card advierte, ademas, de un riesgo metodologico: si se evaluase este checkpoint directamente, obtendria puntuaciones superiores a las del modelo W1.88 real, porque sus pesos siguen en bf16 sin cuantizar. Cualquier cifra obtenida asi no seria representativa del modelo objetivo.

## Requisitos de hardware

- Carga del checkpoint tal cual (bf16): el repositorio ocupa 8,1 GB, coherente con ~4.000 millones de parametros en bf16. Se recomienda un minimo de 12 GB de VRAM para cargarlo comodamente en GPU.
- Fine-tuning o ejecucion de la etapa OPD: al mantener pesos maestros en alta precision y estados de optimizador, se necesita hardware de gama alta, tipicamente A100 (40 o 80 GB) o H100; es previsible que no quepa en GPUs de consumo sin tecnicas de offload o paralelismo.
- Modelo objetivo W1.88 (estimacion a partir del esquema declarado): ~4.000 millones de parametros a 1,88 bits efectivos arrojarian del orden de 1 GB solo en pesos, mas embedding/cabeza en INT4 y activaciones en INT8. Cabe holgadamente en cualquier GPU de consumo (RTX 3060 12 GB, RTX 4090, etc.) e incluso en CPU.
- GPUs recomendadas: RTX 4090 o A100/H100 para la fase de entrenamiento; cualquier GPU consumer reciente para el modelo final cuantizado.
- Opciones de despliegue: transformers para cargar el checkpoint bf16 (aunque no con fines de inferencia). El modelo cuantizado dependera del runtime definido en el repositorio QAOPD. No hay pesos GGUF ni soporte declarado en llama.cpp, Ollama o vLLM, y no se indica compatibilidad con TGI mas alla del tag `text-generation-inference` del repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-4B-W1.88-QAD (este) | ~4.000 M en bf16 (campo safetensors inconsistente) | Objetivo 1,88 bits (INT1.58/INT4 mixto); almacenado sin cuantizar | Heredado de Qwen3-4B: 32.768 tokens nativos, 131.072 con YaRN | Apache-2.0 | Checkpoint latente de entrenamiento, no apto para inferencia directa |
| Qwen3-4B-W1.88-QAOPD | ~4.000 M | 1,88 bits efectivos | Mismo | Apache-2.0 | Checkpoint recuperado, cargable y evaluable |
| Qwen/Qwen3-4B | ~4.000 M | bf16 (sin cuantizar) | 32.768 tokens nativos, 131.072 con YaRN | Apache-2.0 | Modelo final de referencia |
| Familia BitNet b1.58 | no disponible | Ternario de 1,58 bits | no disponible | no disponible | Linea de investigacion comparable en cuantizacion extrema; datos no verificados en esta busqueda |

## Limitaciones y advertencias

- No es un modelo terminado: la propia model card lo describe como punto de partida para entrenamiento. Cargarlo y usarlo para inferencia es un uso no previsto.
- Riesgo de evaluacion enganosa: al estar en bf16, puntua mejor que el modelo W1.88 final; publicar o comparar sus metricas sin advertirlo seria incorrecto.
- Inconsistencia en los metadatos: el campo de parametros de safetensors (196.096) no cuadra con un repositorio de 8,1 GB ni con el modelo base de ~4.000 millones. Conviene verificar la configuracion antes de cualquier uso.
- Sin datos de entrenamiento: no se especifican tokens, composicion del dataset ni si hubo RLHF/DPO, lo que dificulta evaluar sesgos y procedencia.
- Sin benchmarks publicados ni idiomas declarados en el repositorio.
- Sesgos conocidos: no disponibles para este checkpoint. Los heredados del modelo base Qwen3-4B no se han evaluado aqui.
- Riesgo de alucinacion: no evaluado en este checkpoint.
- Limitaciones de contexto e idioma: no documentadas en el repositorio; solo pueden inferirse del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el artefacto distribuido no es el modelo final y su uso comercial carece de sentido practico.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el 21 de septiembre de 2026. Sin validacion por parte de la comunidad.
- Para produccion, usar siempre el checkpoint recuperado QAOPD y verificar por separado la calidad del modelo de 1,88 bits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-4B-W1.88-QAD
- Checkpoint recuperado recomendado para evaluacion: https://huggingface.co/MingZwhy/Qwen3-4B-W1.88-QAOPD
- Repositorio de codigo y receta QAOPD: https://github.com/MingZwhy/QAOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a la plataforma administrativa saudita Najiz y no guardan relacion.
