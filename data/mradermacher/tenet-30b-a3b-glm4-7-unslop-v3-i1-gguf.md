# mradermacher/Tenet-30B-A3B-GLM4.7-Unslop-v3-i1-GGUF

## Resumen

Tenet-30B-A3B-GLM4.7-Unslop-v3 es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 30.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, segun indica su denominacion "30B-A3B". El modelo base fue publicado por el usuario mr-andrey-isachenko en Hugging Face y esta construido sobre la arquitectura GLM (la nomenclatura "GLM4.7" sugiere una variante de la familia GLM-4). El sufijo "Unslop-v3" apunta a un ajuste fino orientado a reducir respuestas genericas o excesivamente complacientes ("slop"), una practica habitual en la comunidad de fine-tuning.

La ficha que nos ocupa corresponde a una recuantizacion en formato GGUF publicada por mradermacher, un autor conocido por convertir modelos a GGUF con tecnicas de cuantizacion ponderada (weighted/imatrix quants) para su uso en llama.cpp y entornos de inferencia en CPU o GPU de gama baja. El repositorio incluye una amplia variedad de niveles de cuantizacion, desde IQ1_S e IQ2_XXS hasta Q6_K, lo que permite desplegar el modelo en hardware muy diverso.

Es relevante ahora porque ofrece una via practica de ejecutar un modelo MoE de 30B en hardware de consumo mediante cuantizaciones agresivas, manteniendo solo ~3B parametros activos por token, lo que reduce el coste computacional de inferencia. No obstante, la informacion publica disponible es muy limitada: no hay model card detallada, benchmarks, licencia declarada ni idiomas soportados en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en GLM; detalles exactos no disponibles |
| Parametros totales | 30B (segun denominacion); el campo safetensors del repo indica 36.175.049, probablemente recuento parcial o de un tensor concreto |
| Parametros activos | ~3B (segun denominacion "A3B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_XS, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture of Experts, segun se deduce de la nomenclatura "30B-A3B" (30B totales, 3B activos). La referencia "GLM4.7" indica que parte de la familia GLM-4 de Zhipu AI, aunque no se especifica la version exacta ni los detalles de atencion (por ejemplo, si emplea Multi-Query Attention, Grouped-Query Attention o atencion lineal). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares en el modelo base.

El sufijo "Unslop-v3" sugiere un ajuste fino de la comunidad destinado a corregir sesgos de estilo (respuestas excesivamente hedonicas o genericas), pero no se documenta la metodologia. La recuantizacion de mradermacher utiliza cuantizacion ponderada con matriz de importancia (imatrix), una tecnica que asigna precision de forma no uniforme a los tensores segun su relevancia para reducir la perdida de calidad en niveles bajos. No hay innovaciones tecnicas documentadas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, compatible con llama.cpp y derivados.
- Razonamiento y generacion de codigo: capacidades inferidas de la familia GLM-4, no verificadas en este repositorio.
- Soporte de tool calling / function calling: no documentado en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas no estan declarados en los metadatos.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ejecucion eficiente en hardware modesto gracias a la activacion de solo ~3B parametros por token.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones IQ2/IQ3 permiten cargar el modelo en RAM del sistema con llama.cpp, aprovechando la activacion dispersa del MoE para mantener velocidades de generacion aceptables en CPU.
- Prototipado rapido de asistentes conversacionales: al ser un GGUF ligero de integrar en Ollama o llama.cpp, sirve para validar flujos de chat multi-turno antes de migrar a infraestructura mayor.
- Generacion de codigo en entornos locales: si el modelo base hereda las capacidades de GLM-4 en programacion, puede usarse como asistente de autocompletado en editores con backend local, sin enviar codigo a la nube.
- Experimentacion con tecnicas de "des-slop" (reduccion de respuestas genericas): util para investigadores que quieran evaluar el efecto de ajustes de estilo comunitarios sobre un MoE base.
- Inferencia en dispositivos con memoria unificada (Apple Silicon, mini-PC con iGPU): las cuantizaciones Q4_K_M o Q5_K_M caben en 16-32 GB de RAM unificada y ofrecen un equilibrio razonable calidad/velocidad.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye mas de 20 variantes, lo que permite medir empiricamente la degradacion de calidad entre IQ1_S y Q6_K en tareas concretas.
- Servicio de bajo coste en CPU para tareas por lotes (resumen, clasificacion, extraccion): al no requerir GPU, puede ejecutarse en instancias spot o contenedores economicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, segun cuantizacion):
  - IQ1_S / IQ2_XXS: ~6-9 GB
  - Q2_K / IQ3_XXS: ~10-13 GB
  - Q4_K_M / IQ4_XS: ~17-20 GB
  - Q5_K_M / Q6_K: ~21-25 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con offload completo; A100 40/80 GB y H100 para Q6_K o precision superior; RTX 3090/4080 (16-24 GB) para cuantizaciones medias.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 4080 con cuantizaciones Q4 o inferiores; en GPUs de 8-12 GB solo con offload parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF (llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requeririan el modelo en safetensors.
- Latencia y throughput: no disponibles; dependen fuertemente del hardware y de la cuantizacion. La activacion de ~3B parametros por token reduce el coste frente a un modelo denso de 30B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Tenet-30B-A3B-GLM4.7-Unslop-v3 (este) | 30B | ~3B | no disponible | no disponible | GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen1.5-MoE-A2.7B | 14,3B | ~2,7B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | ~2,4B | 32K | DeepSeek License | safetensors |

La comparativa es orientativa: no hay datos publicos de rendimiento para este modelo que permitan una confrontacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan datos de entrenamiento, sesgos conocidos ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin benchmarks no puede acotarse su fiabilidad en tareas factuales.
- La licencia no esta declarada en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base (mr-andrey-isachenko/Tenet-30B-A3B-GLM4.7-Unslop-v3) y de la familia GLM-4 original antes de cualquier despliegue en produccion.
- Idiomas soportados no declarados; el rendimiento en castellano es desconocido y probablemente inferior al de modelos explicitamente multilingues.
- Las cuantizaciones IQ1/IQ2 pueden degradar notablemente la coherencia y el razonamiento; se recomienda Q4_K_M o superior para uso serio.
- El recuento de parametros del campo safetensors (36.175.049) no coincide con los 30B declarados, lo que sugiere metadatos incompletos o un tensor parcial; conviene validar el modelo antes de confiar en la cifra.
- Modelo de la comunidad sin proceso de revision conocido; no hay garantias de calidad ni de mantenimiento.
- Fecha de creacion en metadatos (2026-11-28) es futura respecto a la mayoria de referencias, lo que puede indicar un error de metadatos del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-30B-A3B-GLM4.7-Unslop-v3-i1-GGUF
- Modelo base referenciado: https://huggingface.co/mr-andrey-isachenko/Tenet-30B-A3B-GLM4.7-Unslop-v3
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
