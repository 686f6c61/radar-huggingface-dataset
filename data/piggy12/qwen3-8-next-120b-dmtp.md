# Piggy12/Qwen3.8-next-120b-dmtp

## Resumen

Qwen3.8-next-120b-dmtp es un modelo borrador (draft model) para decodificacion especulativa, desarrollado por el usuario Piggy12. No es un modelo generativo autonomo: se trata de un conjunto de pesos auxiliares que acelera la inferencia del modelo objetivo Qwen3.8 Next 120B combinando la prediccion nativa del primer token del modulo MTP (Multi-Token Prediction) del modelo objetivo con el borradorado paralelo por bloques de DFlash2. El repositorio contiene unicamente los pesos del borrador, no el modelo de 120B.

El modelo resuelve un problema concreto de eficiencia en produccion: la decodificacion autoregresiva token a token es el cuello de botella de latencia en modelos grandes. DMTP propone varios tokens candidatos por ronda de verificacion, que el modelo objetivo valida en paralelo, incrementando la longitud aceptada por ronda y reduciendo el numero de pasos secuenciales. Segun la model card, la longitud aceptada por ronda mejora de 2,53 a 2,79 en dominios generales y de 4,10 a 4,46 en tareas SWE frente al checkpoint DFlash2 publico.

Tecnicamente es un modelo pequeno de 616 millones de parametros en BF16 (aproximadamente 1,23 GB), con cinco capas de borrador, tamano oculto 2560 y tamano intermedio 7680. Requiere un runtime especifico (una rama de SGLang adaptada) y no es cargable con Transformers estandar. Su relevancia actual radica en que permite reducir la latencia de despliegues de Qwen3.8 Next 120B sin modificar el modelo objetivo, manteniendo la licencia Apache 2.0 en los pesos del borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificacion especulativa (DMTP: MTP nativo + DFlash2), 5 capas |
| Parametros totales | 616.177.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 128K tokens de entrada y hasta 64K de salida en evaluacion; el lanzador de referencia usa 64K |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos del borrador); el modelo objetivo Qwen3.8-Flash-Next se rige por Qwen Community License |
| Formato de pesos | safetensors (84 tensores exportados) |

## Arquitectura y entrenamiento

El borrador combina dos mecanismos. Primero, el modulo MTP nativo del modelo objetivo propone el primer token candidato (T1). Segundo, DFlash2 recibe la secuencia `[A, T1, MASK x6]`, donde A es el ultimo token emitido, y borradorá los seis candidatos restantes en paralelo. La innovacion clave es la condicionacion residual de T1: el embedding de T1 y la representacion MTP que predijo T1 se normalizan por separado con RMSNorm, se concatenan y se proyectan mediante una matriz W; el resultado se suma unicamente al embedding de entrada de T1 (`E(T1) <- E(T1) + W [RMS(E(T1)); RMS(h_MTP)]`), sin alterar el embedding de A, los seis embeddings MASK ni la ruta original de caracteristicas de contexto del objetivo.

El entrenamiento es un ajuste fino continuado (continued fine-tuning) desde el checkpoint publico Qwen3.8-Flash-Next-DFlash2, no un entrenamiento desde cero. El backbone del borrador y el selector de candidatos se inicializan desde ese checkpoint, basado en la implementacion DFlash2 de Z Lab. Se usan caracteristicas del objetivo extraidas de las capas 5, 15, 25, 35 y 45, modulos de convolucion DFlash2 y un selector de candidatos de rango 256 con top-k 16. El ajuste se detuvo en el paso 7000, con el modelo objetivo y su MTP nativo congelados. Durante el entrenamiento T1 usa el token ground-truth; en inferencia se usa la propuesta del MTP. Los pesos se exportan en BF16.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3.8 Next 120B; no genera texto de forma autonoma.
- Prediccion del primer token mediante el modulo MTP nativo del objetivo, con condicionacion residual sobre el embedding de T1.
- Borradorado paralelo de hasta seis tokens adicionales por ronda mediante DFlash2 (ocho slots de verificacion, siete propuestas).
- Verificacion por muestreo de rechazo a nivel de token (token-level rejection sampling) por parte del modelo objetivo.
- Mejora de la tasa de aceptacion del primer token en dominios de razonamiento, agentes, horizonte largo, SWE y busqueda.
- Integracion con SGLang a traves de una rama especifica con soporte de CUDA Graphs para objetivo y borrador, estado GPU QSA y planificacion serie.
- Soporte de tool calling, agentes o multilingue: no disponible (depende del modelo objetivo, no del borrador).

## Casos de uso

- Aceleracion de inferencia de Qwen3.8 Next 120B en produccion: el borrador incrementa la longitud aceptada por ronda de verificacion, reduciendo el numero de pasos secuenciales del objetivo. Es adecuado porque su entrenamiento esta especificamente orientado a este modelo objetivo y a su MTP nativo.
- Despliegue de agentes multi-paso: en el dominio Agent la aceptacion del primer token sube del 76,82% al 82,10% y la longitud aceptada de 3,90 a 4,28, lo que reduce la latencia acumulada en cadenas largas de llamadas a herramientas.
- Generacion de codigo y tareas SWE: con una longitud aceptada de 4,46 por ronda y un 86,86% de aceptacion del primer token en SWE, es adecuado para pipelines de CI/CD que ejecutan el modelo objetivo en tareas de reparacion o generacion de parches.
- Razonamiento de horizonte largo: la mejora en el dominio Long-horizon (3,53 a 4,02 de longitud aceptada) lo hace util en tareas de planificacion y analisis que requieren hasta 64K tokens de salida.
- Busqueda aumentada y recuperacion: en el dominio Search la aceptacion del primer token pasa del 63,23% al 67,62%, lo que ayuda en flujos con muchas llamadas cortas y concatenadas.
- Servicio de chat de baja latencia con contexto largo: el lanzador de referencia soporta concurrencia de hasta 32 peticiones y 64K de contexto con TP4, adecuado para endpoints interactivos sobre el modelo de 120B.
- Investigacion en decodificacion especulativa: al ser un checkpoint pequeno y con pesos completos exportados (incluidos selector y condicionacion T1), sirve como base para experimentar con variantes de borradorado y verificacion.

## Benchmarks y rendimiento

Datos de la model card: comparacion en el paso 7000 frente al checkpoint publico Qwen3.8-Flash-Next-DFlash2 sobre Qwen3.8 Next 120B, con muestreo de rechazo a nivel de token, temperatura 1, batch 32, hasta 128K de entrada y 64K de salida. La longitud aceptada se mide por ronda de verificacion.

| Dataset | Longitud aceptada DFlash2 | Longitud aceptada DMTP | Aceptacion 1er token DFlash2 | Aceptacion 1er token DMTP |
|---|---:|---:|---:|---:|
| General | 2,5339 | 2,7944 | 61,80% | 67,40% |
| Reason | 2,7902 | 3,2578 | 69,46% | 77,04% |
| Agent | 3,8963 | 4,2819 | 76,82% | 82,10% |
| Long-horizon | 3,5280 | 4,0195 | 74,03% | 81,43% |
| SWE | 4,0989 | 4,4628 | 81,96% | 86,86% |
| Search | 2,9158 | 3,1454 | 63,23% | 67,62% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; los datos anteriores miden exclusivamente eficiencia de decodificacion especulativa.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 1,23 GB en BF16 para los 616 millones de parametros; el requisito dominante es el modelo objetivo de 120B, no el borrador.
- GPU recomendadas: el lanzador de referencia usa TP4 (cuatro GPU) con el objetivo sin cuantizar Qwen/Qwen3.8-Flash-Next; no se especifican modelos de GPU concretos (A100, H100, RTX 4090) en la informacion disponible.
- GPU de consumo: el borrador por si solo cabria en cualquier GPU consumer moderna, pero el sistema completo requiere el objetivo de 120B y TP4, por lo que no es viable en una unica GPU de consumo.
- Despliegue: exclusivamente mediante la rama `main` de https://github.com/Sylvan820/sglang-dmtp (SGLang adaptado). No es compatible con Transformers estandar, con un worker DFlash sin modificar ni con el lanzador denso de 27B. El lanzador de referencia usa CUDA Graphs para objetivo y borrador, prefill eager y planificacion serie con la ruta QSA GPU-state/two-graph.
- Restricciones del lanzador: no soporta objetivos en FP8 ni reutilizacion de prefix-cache.
- Latencia y throughput: la model card indica que el rendimiento de inferencia sigue en optimizacion y que la aceleracion depende de la carga y de la implementacion del runtime; no se publican cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Qwen3.8-next-120b-dmtp | 616 M (borrador) | 64K en el lanzador; 128K/64K en evaluacion | MTP nativo + DFlash2 con condicionacion residual T1 | Apache 2.0 | Hugging Face, runtime SGLang especifico |
| Qwen3.8-Flash-Next-DFlash2 (incoai) | no disponible | no disponible | Borrador DFlash2 puro | no disponible | Hugging Face; base del ajuste fino |
| DFlash2 (Z Lab) | no disponible | no disponible | Borradorado paralelo por bloques | no disponible | GitHub z-lab/dflash |

Frente a DFlash2, DMTP mejora la longitud aceptada por ronda en los seis dominios evaluados y la aceptacion del primer token entre 4,4 y 7,6 puntos porcentuales. No se dispone de datos de otros borradores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede generar texto sin el modelo objetivo Qwen3.8-Flash-Next, su modulo MTP nativo y el embedding de tokens y la cabeza LM compartidos, que deben aportarse por separado.
- Requiere un runtime especifico (rama SGLang de Sylvan820); no funciona con Transformers estandar ni con un worker DFlash sin modificar. Al portarlo hay que verificar la alineacion de estados ocultos, la condicionacion T1, el estado HC/QSA y el commit/rollback de la cache especulativa.
- El lanzador de referencia no soporta objetivos cuantizados en FP8 ni reutilizacion de prefix-cache, lo que limita opciones de despliegue economico.
- El rendimiento de inferencia esta en optimizacion: la planificacion, la gestion de cache y la cobertura de CUDA Graphs requieren refinamiento, y la aceleracion final depende de la carga.
- La evaluacion se limita a metricas de aceptacion especulativa; no hay datos publicados de calidad, sesgos o alucinacion del sistema completo.
- Idiomas soportados: no disponible en la informacion del borrador; dependen del modelo objetivo.
- Licencia: los pesos del borrador son Apache 2.0, pero el modelo objetivo se rige por Qwen Community License; esta release no relicencia el objetivo ni su MTP nativo. Verificar los terminos de uso comercial del objetivo antes de desplegar.
- Modelo con muy poca adopcion (187 descargas, 3 likes) y creado por un autor individual; no hay garantias de mantenimiento ni de soporte a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/Piggy12/Qwen3.8-next-120b-dmtp
- Blog del metodo: https://sylvan820.github.io/D-MTP/
- Repositorio SGLang adaptado: https://github.com/Sylvan820/sglang-dmtp
- Guia de inferencia: https://github.com/Sylvan820/sglang-dmtp#inference
- Pull request en SGLang: https://github.com/sgl-project/sglang/pull/50270
- Checkpoint base DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Implementacion DFlash2 de Z Lab: https://github.com/z-lab/dflash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del objetivo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
