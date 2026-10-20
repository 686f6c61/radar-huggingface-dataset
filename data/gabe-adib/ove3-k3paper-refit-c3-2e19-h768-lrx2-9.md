# gabe-adib/ove3-k3paper-refit-c3.2e19-h768-lrx2.9

## Resumen

`ove3-k3paper-refit-c3.2e19-h768-lrx2.9` es un checkpoint de investigación publicado por el usuario gabe-adib dentro de una serie de barridos denominada «ove3 K3 recipe». No es un modelo listo para producto: es el resultado de un único entrenamiento de ablación cuyo objetivo es medir el efecto de reajustar la tasa de aprendizaje (LR) en una celda IsoFLOP concreta (3,2e19 FLOPs de entrenamiento) de una receta MoE inspirada en la publicada para Kimi K3 («K3-PAPER»).

El modelo emplea una arquitectura transformer con mezcla de expertos de tipo `kimi_linear`, con LatentMoE de 512 expertos de media anchura, enrutamiento top-16, ratio latente 0,5 y sesgo de experto por cuantiles sin pérdida auxiliar. La dimensión oculta es 768 y el entrenamiento se realizó sobre secuencias de 8.192 caracteres con un tokenizador a nivel de carácter, lo que explica que las métricas se expresen en nats por carácter en lugar de por token.

Su relevancia es puramente metodológica: documenta de forma exhaustiva un punto del espacio de diseño (LR 0,0136377, equivalente a 2,9 veces la ley de LR de la receta de control) y publica el checkpoint, los logs y la configuración completos. Con 34,34B de tokens vistos y una pérdida held-out de 1,1700 nats/carácter, sirve para reproducir y auditar decisiones de escalado, no para uso generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`kimi_linear`) con LatentMoE, Attention Residuals (block size 2), MLA con output gate y KDA full-rank con safe gate (lower bound -5) |
| Parámetros totales | no disponible (la model card solo indica hidden size 768 y 512 expertos) |
| Parámetros activos | no disponible (top-16 de 512 expertos, ratio latente 0,5) |
| Longitud de contexto | no disponible; el entrenamiento usa secuencias de 8.192 caracteres |
| Tipos de cuantización | no disponible (solo se publica checkpoint Megatron en precisión de entrenamiento) |
| Idiomas soportados | no disponible (tokenización a nivel de carácter; 9 dominios de validación no detallados en la información) |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron-LM (`checkpoint/`, con estado del optimizador incluido); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El bloque es un transformer con mezcla de expertos de tipo `kimi_linear`. La capa MoE es un LatentMoE con 512 expertos de media anchura, activación top-16 y ratio latente 0,5, con sesgo de experto calculado por cuantiles y sin pérdida auxiliar (aux-loss-free), lo que evita el término de balanceo en la función de pérdida y traslada el equilibrio de carga al sesgo del router. El router usa escalado 1,0. La atención combina MLA con output gate y salida en fp32, junto con «Attention Residuals» de tamaño de bloque 2 y KDA full-rank con safe gate (cota inferior -5). La activación es SiTU-GLU y la normalización RMSNorm con eps 1e-5.

El entrenamiento sigue la programación coseno de la receta K3: 1% de warmup lineal y decaimiento hasta lr/10, con optimizador Muon por cabeza y `qk_clip`. La configuración concreta de esta ejecución es seed 1234, batch global de 128 secuencias × 8.192 caracteres (1.048.576 caracteres por paso), 32.747 pasos hasta 34,34B tokens, con los pasos recalculados para igualar los FLOPs de entrenamiento de la celda de control. La tasa de aprendizaje es 0,0136377, 2,9 veces la que dicta la ley de LR de la receta de control en esa misma celda. La entrada se tokeniza a nivel de carácter, de ahí que la pérdida se mida en nats/carácter. No se documentan fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Modelado de lenguaje autoregresivo a nivel de carácter sobre el corpus de entrenamiento (34,34B caracteres).
- Razonamiento y generación de texto de secuencia fija de 8.192 caracteres; no hay evidencia de capacidades emergentes de instrucción.
- Capacidad multilingüe: no documentada; depende por completo del corpus usado, que no se describe.
- Tool calling / function calling: no disponible; no se menciona ningún formato de herramientas ni plantilla de chat.
- Comportamiento agéntico o razonamiento multi-paso: no disponible.
- Modo «thinking», visión o audio: no disponible; el checkpoint es un LM de texto puro.
- Valor principal: servir como artefacto de ablación reproducible (LR refit) dentro de un barrido IsoFLOP.

## Casos de uso

- Reproducción de barridos IsoFLOP: cargar `config.yaml` y los logs para replicar la celda de 3,2e19 FLOPs con hidden size 768 y comparar curvas de pérdida frente a la receta de control.
- Estudio del sesgo de experto sin pérdida auxiliar: analizar el comportamiento del enrutamiento top-16 sobre 512 expertos con sesgo por cuantiles y comprobar la distribución de carga en los logs de entrenamiento.
- Ablación de la ley de tasa de aprendizaje: el checkpoint es el punto de 2,9× LR del barrido; sirve para contrastar empíricamente si el reajuste mejora la pérdida de validación a igualdad de FLOPs.
- Investigación sobre atención híbrida: permite instrumentar MLA con output gate, Attention Residuals (bloque 2) y KDA con safe gate en un modelo de 768 de dimensión oculta, mucho más barato de inspeccionar que un modelo de producción.
- Modelado de lenguaje a nivel de carácter en dominios especializados: como base para experimentos de generación sobre textos donde el tokenizador BPE es indeseable (código, notación científica, secuencias biomédicas), partiendo de 34,34B caracteres de entrenamiento.
- Docencia y auditoría de recetas: al publicarse logs por segmentos de 4 horas, TensorBoard y `DOMAIN_NLL.txt`, es útil como caso de estudio de trazabilidad de un entrenamiento MoE.
- Punto de partida para fine-tuning a pequeña escala: factible si se convierte el checkpoint Megatron y se dispone del tokenizador, que no se incluye en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas reportadas son de pérdida de lenguaje:

| Métrica | Valor |
|---|---|
| Pérdida LM de validación (mejor paso, iteración 32.740) | 1,0833 |
| Pérdida held-out (media ponderada por mezcla, 9 dominios) | 1,1700 nats/carácter |
| Pérdida por dominio | en `DOMAIN_NLL.txt` (no incluida en la información) |
| Tokens de entrenamiento | 34,34B caracteres |
| FLOPs de entrenamiento | 3,2e19 |
| Comparación con la receta de control | no disponible (no se publican las cifras de la celda de control) |

## Requisitos de hardware

- VRAM estimada: no determinable, porque el número de parámetros no se publica. El repositorio ocupa 16,8 GB e incluye el estado del optimizador de Muon, por lo que los pesos en sí son sustancialmente menores que esa cifra.
- GPU recomendadas: no disponible. Con hidden size 768 y enrutamiento top-16 sobre 512 expertos, el checkpoint completo (todos los expertos) necesita memoria proporcional al total de parámetros, no al número de activos; hasta no conocer ese total no puede darse una recomendación fiable.
- GPU de consumo: no verificable sin el recuento de parámetros. El formato publicado (checkpoint distribuido de Megatron) no se puede ejecutar directamente en una RTX 4090 sin conversión previa.
- Despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF/safetensors. La ruta viable es cargar el checkpoint con Megatron-LM usando `config.yaml` y, en su caso, convertirlo a un formato de inferencia.
- Latencia y throughput: no disponibles. No se han publicado mediciones de inferencia.

## Comparativa con modelos similares

No hay checkpoints públicos comparables en la información proporcionada: el único punto de referencia es la celda de control del mismo barrido, que no se publica con sus métricas. La comparación con la receta Kimi K3 original tampoco es posible a este nivel, porque esta ejecución es una celda IsoFLOP de 3,2e19 FLOPs con hidden size 768, muy alejada de la escala del modelo que inspira la receta.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ove3-k3paper-refit-c3.2e19-h768-lrx2.9 | no disponible | no disponible (entrena con 8.192 caracteres) | no disponible | checkpoint Megatron en HF, 0 descargas |
| Celda de control del mismo barrido ove3 | no disponible | no disponible | no disponible | no pública según la información |
| Kimi K3 (receta de referencia) | no disponible | no disponible | no disponible | no disponible en la información |

## Limitaciones y advertencias

- Artefacto de investigación sin licencia declarada: no se puede asumir permiso de uso comercial.
- Ausencia de model card convencional: no hay información sobre datos de entrenamiento, composición del corpus, filtrado ni sesgos, lo que impide evaluar riesgos de sesgo o contaminación.
- Tokenizador a nivel de carácter: no se incluye tokenizador en el repositorio (solo `checkpoint/`, `logs/` y `config.yaml`), por lo que la reproducibilidad de la inferencia depende de reconstruirlo o recuperarlo del entorno original.
- Riesgo de alucinación alto para uso conversacional: no hay ajuste por instrucciones ni evaluación de calidad; la pérdida de 1,1700 nats/carácter es una medida de compresión, no de corrección factual.
- Contexto efectivo limitado a 8.192 caracteres en entrenamiento; no se documenta extensión por RoPE o similar.
- Idiomas no declarados: el comportamiento multilingüe es una incógnita y probablemente dependa de un corpus no descrito.
- Formato de pesos no estándar: el checkpoint distribuido de Megatron con estado del optimizador exige tooling específico; no hay garantía de compatibilidad con el ecosistema de inferencia habitual.
- Repositorio con 0 descargas y 0 likes: no hay validación externa ni informes de terceros sobre su funcionamiento.
- Fechas de creación y actualización del repositorio (2026-10-20) posteriores a la fecha de referencia habitual de los lanzamientos públicos: conviene verificar la procedencia del artefacto antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gabe-adib/ove3-k3paper-refit-c3.2e19-h768-lrx2.9
- Configuración de la ejecución: `config.yaml` dentro del repositorio (https://huggingface.co/gabe-adib/ove3-k3paper-refit-c3.2e19-h768-lrx2.9/blob/main/config.yaml)
- Pérdida por dominio: `DOMAIN_NLL.txt` dentro del repositorio (https://huggingface.co/gabe-adib/ove3-k3paper-refit-c3.2e19-h768-lrx2.9/blob/main/DOMAIN_NLL.txt)
- Checkpoint Megatron: carpeta `checkpoint/` del repositorio
- Logs de entrenamiento y TensorBoard: carpeta `logs/` del repositorio
- Papers, blogs, demos o repositorios adicionales: no disponibles (la búsqueda web no devolvió resultados relacionados con el modelo)
