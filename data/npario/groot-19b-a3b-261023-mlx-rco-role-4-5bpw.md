# npario/Groot-19B-A3B-261023-MLX-rco-role-4.5bpw

## Resumen

Groot-19B-A3B-261023-MLX-rco-role-4.5bpw es una cuantizacion de 4,5 bits por peso del modelo GrootTeam/Groot-19B-A3B-261023, un transformer MoE de razonamiento con 19.000 millones de parametros totales y aproximadamente 3.000 millones activos por token. La publica el usuario npario (el model card referencia la herramienta rco-mlx de hermitdave) y esta pensada exclusivamente para inferencia en Apple Silicon mediante la libreria MLX.

El modelo base combina 40 capas (10 de atencion completa y 30 de atencion lineal Gated DeltaNet) con 128 expertos enrutados mas uno compartido y enrutamiento top-8, sobre una ventana de contexto de 262.144 tokens. Esta version cuantizada reduce el peso de 56,2 GB en BF16 a 13,13 GB, lo que la hace viable en equipos Apple con memoria unificada moderada.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion (RCO, Role-wise Calibration-Optimized) que mejora sustancialmente la fidelidad frente a la cuantizacion round-to-nearest clasica; por otro, advierte de que no es un fine-tune ni un modelo nuevo, sino una compresion con perdida del modelo original, sin evaluacion en tareas agenticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 40 capas (10 full-attention + 30 linear-attention Gated DeltaNet), 128 expertos enrutados + 1 compartido, top-8 routing |
| Parametros totales | 19B (modelo base) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 4,5 bpw objetivo (grupo 64, modo affine); efectivo 6,08 bits/peso; router en BF16; cabeza MTP en 8-bit; vision tower en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (mlx-lm), 6 shards, 13,13 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE de razonamiento con atencion hibrida: 10 capas de atencion completa intercaladas con 30 capas de atencion lineal Gated DeltaNet, lo que reduce el coste computacional en contextos largos. El enrutamiento usa 128 expertos mas uno compartido con top-8, de modo que cada token activa unos 3.000 millones de parametros de los 19.000 millones totales. El modelo incluye una cabeza MTP (multi-token prediction) y un vision tower, segun los detalles de cuantizacion del model card.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica destacable de esta publicacion concreta es el metodo RCO (Role-wise Calibration-Optimized), que asigna bits de forma diferenciada por rol de capa usando una base de datos de errores calibrada con WikiText-2, y que deja el router en BF16 para no degradar la seleccion de expertos. Requiere MLX 0.27 o superior y funciona solo en Apple Silicon.

## Capacidades

- Generacion de texto y razonamiento, heredados del modelo base Groot-19B-A3B-261023.
- Procesamiento de contexto largo: hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno largas.
- Capacidad de vision: el model card indica que el vision tower se conserva en BF16 durante la cuantizacion, aunque no se detalla su rendimiento.
- Prediccion multi-token (cabeza MTP) presente en la arquitectura del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no evaluado; el propio autor advierte que no se han medido benchmarks agenticos.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el modelo ocupa 13,13 GB, por lo que cabe en equipos Apple Silicon de 16 GB o mas, permitiendo ejecutar un MoE de 19B en hardware de consumo sin GPU dedicada.
- Analisis de documentos largos: la ventana de 262K tokens permite procesar contratos, informes o bases de codigo completas en una sola pasada, con la ventaja de la atencion lineal en coste.
- Prototipado de asistentes conversacionales: la libreria mlx-lm ofrece carga directa y CLI para iterar rapidamente en local antes de desplegar en produccion.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica para comparar RCO frente a RTN en terminos de perplejidad, KL y acuerdo top-1 en un MoE real.
- Investigacion en eficiencia de inferencia: util para medir throughput (el model card reporta 8,9 TPS en el hardware de prueba) y calidad en modelos MoE cuantizados.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia apache-2.0 facilita su integracion en productos comerciales, siempre que se respete la atribucion del modelo base.
- Tareas de generacion asistida con recuperacion (RAG): el autor recomienda emparejarlo con retrieval para trabajo intensivo en conocimiento, dado que es una compresion con perdida.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre texto reservado (10 secuencias de 1024 tokens de WikiText-2), comparando con BF16:

| Modelo | Perplejidad ↓ | KL vs BF16 ↓ | Top-1 vs BF16 ↑ | TPS ↑ | Tamano |
|---|---|---|---|---|---|
| BF16 (referencia) | 15,21 | — | — | 20,6 | 56,2 GB |
| RTN 4-bit (baseline) | 15,94 | 0,0587 | 83,7% | 0,67 | 34,3 GB |
| RCO 4.5bpw (este modelo) | 15,35 | 0,0110 | 91,1% | 8,9 | 13,1 GB |

Mejora de RCO frente a RTN a ~4,5 bpw:

| Metrica | RTN | RCO | Mejora |
|---|---|---|---|
| KL vs BF16 (menor mejor) | 0,0587 | 0,0110 | +81,2% |
| Perplejidad (menor mejor) | 15,94 | 15,35 | +3,7% |
| Acuerdo top-1 (mayor mejor) | 83,7% | 91,1% | +7,4 puntos |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 13,13 GB de pesos en disco y en memoria; se recomienda al menos 16 GB de memoria unificada en Apple Silicon para dejar margen al contexto y al runtime.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada suficiente; no es compatible con CUDA ni con GPUs NVIDIA.
- Cabe en consumer: si, en Mac con 16 GB o mas de memoria unificada.
- Opciones de despliegue: mlx-lm (libreria oficial de carga y CLI), con MLX 0.27 o superior. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 8,9 tokens por segundo medidos por el autor en su hardware de prueba; el BF16 de referencia alcanza 20,6 TPS, por lo que la cuantizacion prioriza tamano y fidelidad sobre velocidad bruta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Groot-19B-A3B-261023 (BF16) | 19B totales / ~3B activos | 262K | safetensors (MLX) | apache-2.0 | HuggingFace |
| RTN 4-bit del mismo base | 19B totales / ~3B activos | 262K | MLX | apache-2.0 | Referencia del model card, sin repo publico indicado |
| Este modelo (RCO 4.5bpw) | 19B totales / ~3B activos | 262K | MLX | apache-2.0 | HuggingFace (0 descargas) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un fine-tune: es una compresion con perdida del modelo upstream; para trabajo intensivo en conocimiento el autor recomienda combinarlo con recuperacion (RAG).
- La cuantizacion a 4,5 bpw introduce una brecha medible frente a BF16 (perplejidad 15,35 frente a 15,21; KL 0,0110).
- No evaluado en benchmarks agenticos: las metricas publicadas son de perplejidad y acuerdo distribucional, no de precision en tareas.
- El acuerdo top-1 del 91,1% no implica un 8,9% de predicciones erroneas: muchas discrepancias ocurren en posiciones donde la distribucion BF16 es casi plana.
- Sesgos conocidos: no disponibles en la informacion proporcionada (dependen del modelo base, sin documentar aqui).
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos.
- Limitaciones de idioma: no se especifican los idiomas soportados.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe mantenerse la atribucion a GrootTeam y a la herramienta rco-mlx.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX 0.27 o superior; no hay soporte CUDA, ROCm ni CPU generica.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/npario/Groot-19B-A3B-261023-MLX-rco-role-4.5bpw
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Herramienta de cuantizacion rco-mlx: https://github.com/hermitdave/rco-mlx
