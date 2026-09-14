# dhanesh-hf/Jarvis-Titan-V15-MoE-Merged

## Resumen

J.A.R.V.I.S. Titan V15 MoE Merged es un modelo de generación de texto publicado por el usuario dhanesh-hf en HuggingFace, identificado como el hito M4 de la familia Jarvis Titan. Se trata de un merge standalone de los pesos del modelo DeepSeekMoE de 14,8B parámetros (dato real de safetensors: 14.835.469.845) con un adaptador calibrado denominado Tri-Brid. El repositorio ocupa 29,7 GB, lo que es coherente con pesos en precisión bf16/fp16, y se distribuye en formato safetensors con código personalizado (etiqueta `custom_code`), lo que implica que su carga requiere `trust_remote_code=True`.

El modelo deriva del checkpoint dhanesh-hf/Jarvis-Titan-V14-MoE-Merged y no presenta descargas ni likes en el momento de redactar esta ficha, por lo que no existe validación independiente de su comportamiento. La arquitectura combina un backbone DeepSeekMoE con enrutamiento Top-2 sobre 8 expertos enrutados más 1 experto compartido, e incorpora tres niveles de memoria: atención de ventana deslizante con ventana de 2048 tokens, un subespacio de recuperación exacta de KV con dimensión 512 y una memoria neural tipo Titans con recurrencia de aprendizaje en tiempo de inferencia.

Su relevancia potencial es fundamentalmente experimental: propone una arquitectura híbrida de memoria a largo plazo sobre un MoE estándar, con puertas adaptativas MAG-3 calibradas hacia una distribución de routing objetivo del 55 % local, 25 % recuperación y 20 % memoria neural. No obstante, no se han publicado resultados de benchmarks, no se declaran idiomas soportados y la licencia es una licencia propia (jtrl-v1.0) cuyo texto no se detalla en la información disponible, por lo que cualquier evaluación seria debe partir de una reproducción local de las pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeekMoE (MoE transformer) con puente Tri-Brid de memoria en 3 niveles |
| Parametros totales | 14.835.469.845 (~14,8B), dato real de safetensors |
| Parametros activos | no disponible (enrutamiento Top-2 sobre 8 expertos enrutados + 1 experto compartido; el autor no publica el recuento activo) |
| Longitud de contexto | no disponible (el autor solo documenta una ventana de atención local SWA de 2048 tokens en el nivel 1; la etiqueta del repositorio es `long-context`, pero sin cifra declarada) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; sin variantes GGUF, AWQ ni GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | jtrl-v1.0 (`license: other`, enlace a LICENSE en el repositorio) |
| Formato de pesos | safetensors, con código personalizado (`custom_code`) |
| Modelo base | dhanesh-hf/Jarvis-Titan-V14-MoE-Merged |
| Tamano del repositorio | 29,7 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |
| Etiquetas destacadas | deepseek-moe, titans-neural-memory, pallas-tpu, tri-brid-memory, m4-merged, long-context, frontier-reasoning, conversational |

## Arquitectura y entrenamiento

El backbone es un DeepSeekMoE de 14,8B parámetros con 1 experto compartido y 8 expertos enrutados, con enrutamiento Top-2 activo por token. Sobre ese backbone se insertan capas puente Tri-Brid en las posiciones [3, 7, 11, 15, 19, 23, 27], es decir, 7 puntos de control de memoria distribuidos a lo largo de la red. Cada puente organiza la información en tres niveles: nivel 1, atención de ventana deslizante con W = 2048 y GQA de copia cero; nivel 2, un subespacio de recuperación exacta de KV de dimensión D = 512 (reservorio de tokens salientes); y nivel 3, una memoria neural tipo Titans con recurrencia de aprendizaje en tiempo de test acotada por los hiperparámetros η = 10⁻³, ρ = 10⁻⁴, μ = 0,95 y una cota de norma de Frobenius ‖M‖_F ≤ 50,0.

El mecanismo de enrutamiento entre los tres niveles se denomina MAG-3 (Adaptive Gating) y está calibrado para una distribución objetivo aproximada de 55 % local, 25 % recuperación y 20 % memoria neural. El autor declara además un "passthrough 100 % zero-loss", es decir, un flujo residual del backbone ininterrumpido para estabilizar la generación autorregresiva. No se especifica en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias; tampoco se detalla el procedimiento exacto del merge con el adaptador M4. La etiqueta `pallas-tpu` sugiere kernels escritos para Pallas/TPU, aunque esto no se desarrolla en el texto disponible.

## Capacidades

- Generación de texto conversacional y autorregresiva, tal como declara el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento de tipo "frontier-reasoning" según la etiqueta del repositorio; no se aportan ejemplos, trazas ni evaluaciones que lo respalden.
- Memoria a largo plazo dentro de una sesión mediante el nivel 3 (aprendizaje en tiempo de test) y el reservorio de KV del nivel 2, lo que en teoría permite retener información más allá de la ventana local de 2048 tokens.
- Recuperación exacta de pares clave-valor salientes a través del subespacio de dimensión 512 del nivel 2.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el etiquetado `long-context` y `frontier-reasoning` es lo único indicativo, sin detalles técnicos.
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles.
- Requiere cargar código remoto, por lo que cualquier capacidad efectiva depende de la implementación incluida en el repositorio.

## Casos de uso

- Asistente conversacional con memoria persistente de sesión: el nivel 3 de memoria neural está diseñado para actualizarse durante la inferencia, de modo que un asistente podría retener preferencias y hechos del usuario a lo largo de una conversación larga sin depender exclusivamente del prompt. Es adecuado precisamente por esa recurrencia de test-time, aunque su efectividad no está medida.
- Análisis de documentos extensos con recuperación selectiva: el reservorio de KV de dimensión 512 permite, en teoría, recuperar pasajes salientes de un documento largo mientras la atención local de 2048 tokens procesa el contexto inmediato. Aplicable a revisión de contratos, informes técnicos o expedientes.
- Investigación académica sobre arquitecturas híbridas de memoria: el modelo es un caso de estudio reproducible de la combinación MoE + SWA + reservorio + memoria tipo Titans, útil para grupos que investigan atención lineal, memorias recurrentes o mecanismos de recuperación.
- Base para fine-tuning vertical: al ser un merge de pesos safetensors sobre un backbone DeepSeekMoE, puede servir como punto de partida para ajuste supervisado en dominios concretos, siempre que se respete la licencia jtrl-v1.0 y se resuelva la carga del código personalizado.
- Prototipado de agentes con estado entre turnos: en escenarios donde el estado debe persistir más allá del contexto inmediato (asistentes de operaciones, seguimiento de incidencias), la arquitectura de puentes de memoria es conceptualmente adecuada, si bien el soporte de tool calling no está documentado y habría que construirlo.
- Experimentación con enrutamiento condicional: MAG-3 permite estudiar cómo un modelo decide entre atención local, recuperación y memoria, lo que resulta útil para analizar dinámicas de routing y calibrar distribuciones de uso de recursos.
- Evaluación comparativa de latencia y consumo en MoE dispersos: con Top-2 sobre 8 expertos enrutados, el modelo es un candidato razonable para medir el compromiso entre cómputo activo reducido y huella de VRAM completa (los 14,8B deben residir en memoria).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye valores de MMLU, HumanEval, GSM8K, MT-Bench, RULER ni de ninguna otra suite, y la búsqueda web realizada no devolvió fuentes relacionadas con este modelo.

## Requisitos de hardware

Todas las cifras de memoria son estimaciones derivadas del recuento de parámetros publicado (14,8B) y del tamaño del repositorio (29,7 GB); el autor no las confirma.

- Pesos en bf16/fp16: ~29,7 GB solo para los pesos. Con caché KV y activaciones, un despliegue realista necesita aproximadamente 32-36 GB en GPUs de 40 GB (A100 40 GB, A6000 48 GB, L40S 48 GB) o reparto en tensor parallel sobre 2×24 GB.
- Pesos en fp8/int8: ~15 GB de pesos, más overhead; encaja en una RTX 4090 (24 GB) o L40S (48 GB) con margen para contexto moderado.
- Pesos en int4 (no publicados): ~7,5-9 GB estimados; cabría en GPU de consumo de 12-16 GB (RTX 4070 Ti, RTX 4080) y en Mac con memoria unificada de 16-24 GB, siempre que se genere la cuantización localmente.
- Nota sobre MoE: el enrutamiento Top-2 reduce el cómputo por token, pero no la VRAM, ya que todos los expertos deben estar residentes salvo que se implemente offloading de expertos a CPU o a disco, algo no documentado aquí.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para precisión nativa; RTX 4090, RTX 3090 y RTX 4080 para cuantización de 8 bits o inferior.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la única vía confirmada, dado que el modelo usa código personalizado. Compatibilidad con vLLM, llama.cpp, Ollama, TGI o SGLang: no disponible; no hay variantes GGUF publicadas.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Advertencia de seguridad: al requerir ejecución de código remoto, conviene auditar los ficheros `.py` del repositorio antes de instanciar el modelo en entornos de producción.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentación pública; los del modelo analizado, del repositorio. No es posible comparar calidad al no existir benchmarks publicados.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Jarvis Titan V15 MoE Merged | 14,8B | no disponible (Top-2 de 8 + 1 compartido) | no disponible (SWA de 2048 en nivel 1) | jtrl-v1.0 | safetensors + custom code |
| DeepSeekMoE 16B | ~16,4B | ~2,8B | 4096 tokens | DeepSeek Model License | safetensors |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32 768 tokens | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-14B | ~14,7B | denso (sin MoE) | 32 768 tokens nativos | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |

Diferencias clave: frente a DeepSeekMoE 16B, del que hereda el esquema de expertos, Jarvis Titan V15 añade los puentes de memoria Tri-Brid y el gating MAG-3, pero pierde la trazabilidad de una ficha técnica completa. Frente a Mixtral 8x7B y Qwen2.5-14B, carece de cuantizaciones publicadas, de contexto declarado y de una licencia permisiva verificable, además de tener 0 descargas y 0 validaciones externas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita afirmar que el modelo funciona según lo descrito en la arquitectura.
- Riesgo elevado de alucinación no cuantificado: al no existir evaluaciones de fidelidad ni de tasas de error, no se puede estimar su fiabilidad en producción.
- Sesgos conocidos: no disponibles; no se documenta composición del dataset de entrenamiento, filtrado ni mitigaciones.
- Idiomas soportados: no disponibles; se desconoce si el modelo funciona aceptablemente en castellano o si está limitado al inglés.
- Longitud de contexto real: no declarada. La única cifra explícita es la ventana local de 2048 tokens del nivel 1; el comportamiento efectivo de los niveles 2 y 3 a longitudes mayores no está medido.
- Licencia jtrl-v1.0: es una licencia propia (etiquetada como `other`). No se detallan en la información disponible los permisos de uso comercial, las restricciones de redistribución ni las obligaciones de atribución; es imprescindible leer el fichero LICENSE antes de cualquier uso productivo.
- Código remoto obligatorio: la etiqueta `custom_code` implica ejecutar código del autor al cargar el modelo, con el consiguiente riesgo de seguridad y de incompatibilidad entre versiones de `transformers`.
- Sin mantenimiento ni comunidad: 0 descargas, 0 likes y actualización limitada. No hay issues, demos ni informes de terceros.
- Fecha de creación declarada en 2026-09-14, posterior a la fecha habitual de consulta; conviene verificar la coherencia temporal del repositorio.
- La memoria neural con aprendizaje en tiempo de test introduce estado mutable entre iteraciones (matriz M acotada a norma 50,0). En despliegues de larga duración esto puede provocar deriva del comportamiento si no se reinicia el estado, algo que el autor no documenta.
- Sin soporte confirmado de tool calling, agentes o plantillas de chat específicas; cualquier integración de ese tipo requiere trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhanesh-hf/Jarvis-Titan-V15-MoE-Merged
- Modelo base (V14 MoE Merged): https://huggingface.co/dhanesh-hf/Jarvis-Titan-V14-MoE-Merged
- Fichero de licencia referenciado en la model card: https://huggingface.co/dhanesh-hf/Jarvis-Titan-V15-MoE-Merged/blob/main/LICENSE
- Paper, blog, repositorio o demo adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo (únicamente páginas corporativas de Microsoft, sin relación con esta ficha).
