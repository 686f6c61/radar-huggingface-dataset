# Harsha001/DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF

## Resumen
DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF es una compilación cuantizada y podada del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario Harsha001 bajo el marco de trabajo ROCmFPX. Su objetivo es hacer viable la ejecución de un modelo Mixture-of-Experts (MoE) de gran escala (657.884.565.104 parámetros totales) en una única máquina AMD Ryzen AI Max+ 395 con 128 GB de memoria unificada (plataforma Strix Halo), apuntando a una ventana de contexto de 64K.

Para lograrlo, el autor aplica una poda de expertos enrutados (de 384 expertos por capa conserva un subconjunto, con variantes E320 y E277) y reutiliza cuantizaciones de 1 a 2 bits generadas con el método GSQ-RCO de ISTA-DASLab. El resultado son dos builds (`IQ1_M-E320` e `IQ2_XXS-E277`) en formato GGUF que ocupan unos 215 GB en disco, de los cuales solo unos 97 GiB deben residir en memoria de GPU; la tabla Engram (110,6 GB) permanece en el SSD y se lee bajo demanda.

La versión actual (1 de noviembre de 2026) incorpora la edición "uncensored" de AtomicChat, que elimina las negativas del modelo mediante la reflexión de una dirección de rechazo en 82 tensores, manteniendo los expertos enrutados intactos. Es una versión de prueba comunitaria: se ha validado en CPU y en una NVIDIA GB10 con CUDA, pero no se ha ejecutado todavía en un Strix Halo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados y tabla Engram (según model card) |
| Parametros totales | 657.884.565.104 |
| Parametros activos | no disponible |
| Longitud de contexto | 64K (objetivo declarado) |
| Tipos de cuantizacion | GGUF IQ1_M (E320) e IQ2_XXS (E277); tensores editados en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards; shard 4 = tabla Engram) |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE con 384 expertos enrutados por capa y una tabla Engram de búsqueda de 110,6 GB. Esta compilación no reentrena el modelo: parte de los pesos de DeepSeek-V4.1-Flash-1017 y aplica una poda de expertos por capa (conservando los más utilizados) junto con la cuantización GSQ-RCO de ISTA-DASLab en 1-2 bits. El autor indica que el modelo completo necesitaría unos 230 GB incluso con las cuantizaciones estándar más pequeñas, de ahí la necesidad de la poda.

Sobre esa base se aplica la edición "uncensored" de AtomicChat: una dirección de rechazo medida sobre los pesos originales de DeepSeek se refleja fuera de las capas que escriben en el flujo residual. Concretamente se modifican 82 tensores (40 capas de `attn_output_b`, 40 de `ffn_down_shexp` y 2 de `engram_kv`) añadiendo un adaptador de rango 1 a fuerza 2,0 y reempaquetando cada tensor en Q8_0. Los expertos enrutados, el router y la tabla Engram no se alteran. El autor reconoce que la poda y la cuantización de muy bajo bit conllevan una pérdida de calidad medible en perplejidad.

## Capacidades
- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones, con modo "thinking" desactivable (usado en las pruebas del autor con `thinking off`).
- Ejecución de un MoE de gran escala en hardware de consumo con memoria unificada (Strix Halo, 128 GB).
- Comportamiento "uncensored": no rechaza peticiones dañinas en las pruebas realizadas (3% de rechazos en JailbreakBench con IQ1_M-E320, 2% con IQ2_XXS-E277).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling, function calling, agentes o visión: no disponible en la información proporcionada.

## Casos de uso
- Inferencia local de un MoE de 657B parámetros en una única máquina Strix Halo: el recorte a ~97 GiB en GPU y la tabla Engram en SSD permiten ejecutar un modelo que de otro modo requeriría ~230 GB o más, ideal para laboratorios con hardware AMD de gama alta de escritorio.
- Investigación sobre poda de expertos y cuantización extrema: las variantes E320 y E277 permiten estudiar el compromiso entre expertos conservados, bits por peso y perplejidad en un modelo real.
- Evaluación de técnicas de abliteration: la edición de AtomicChat sobre 82 tensores y su medición de KL divergence (~0,012) sirven como caso de estudio reproducible de modificación de comportamiento sin reentrenamiento.
- Experimentación con contextos largos (objetivo 64K) en tareas de resumen o análisis de documentos extensos, siempre que se validen la calidad y la velocidad en el hardware objetivo.
- Pruebas de seguridad y alineación: al ser una variante sin rechazos, es útil para medir la eficacia de filtros externos y estudiar jailbreaks en entornos controlados.
- Desarrollo y benchmarking de stacks de inferencia para AMD (ROCm, llama.cpp con soporte GGUF, `llama-server`), comparando rendimiento entre CPU, CUDA y Strix Halo.
- Prototipado de asistentes conversacionales autoalojados donde la privacidad impide usar APIs en la nube, asumiendo las limitaciones de calidad de la cuantización de 1-2 bits.

## Benchmarks y rendimiento
El autor publica métricas de la edición uncensored frente a la versión regular del mismo tamaño, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K no aparecen en la información disponible).

| Build | JailbreakBench (100 peticiones dañinas): rechazos | XSTest (250 prompts seguros): rechazos | KL divergence vs. regular | Mismo token top | Cambio de perplejidad |
|---|---|---|---|---|---|
| Regular IQ1_M-E320 | 98% | 8,4% | - | - | - |
| Uncensored IQ1_M-E320 | 3% | 0% | 0,012 | 96,3% | +0,1% |
| Uncensored IQ2_XXS-E277 | 2% | 0% | 0,014 | 95,7% | +0,35% |

Mediciones de AtomicChat sobre los ficheros GSQ-RCO sin podar: rechazos en peticiones dañinas en inglés del 89% al 0% (IQ1_M) y del 85% al 0% (IQ2_XXS); MMLU-500 del 80,2% al 80,6% y del 83% (dato truncado en la información disponible). No se han publicado resultados de benchmarks estándar completos en la información disponible.

## Requisitos de hardware
- Memoria: ~97 GiB en GPU/memoria unificada para el modelo (atención, router y expertos conservados); la tabla Engram (110,6 GB) permanece en SSD y no consume VRAM.
- Almacenamiento: ~215 GB en disco por build descargado (el repositorio completo muestra 528 GB por incluir dos builds y el fichero Engram).
- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada.
- Validación realizada: CPU y NVIDIA GB10 con CUDA mediante `llama-server`; no se ha probado aún en Strix Halo según el autor.
- GPU discretas tipo A100/H100/RTX 4090: no disponible en la información proporcionada; por tamaño, no cabe en GPUs de consumo de 24 GB.
- Despliegue: llama.cpp / `llama-server` (formato GGUF); compatibilidad con vLLM, TGI u Ollama no confirmada en la información disponible.
- Latencia y throughput: no disponibles; el autor solicita a la comunidad reportar velocidad y memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (original) | 657.884.565.104 | no disponible | no disponible | Hugging Face | Requiere ~230 GB incluso en cuantizaciones mínimas estándar |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 657.884.565.104 | no disponible | no disponible | Hugging Face | Cuantización GSQ-RCO sin poda de expertos |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 657.884.565.104 | no disponible | MIT | Hugging Face | Variante uncensored sin poda; base de esta compilación |
| Esta ficha (StrixHalo GGUF) | 657.884.565.104 | 64K (objetivo) | MIT | Hugging Face | Poda de expertos + 1-2 bits; ~97 GiB en memoria |

## Limitaciones y advertencias
- Pérdida de calidad por poda de expertos y cuantización de 1-2 bits; el autor la reconoce explícitamente y planea formatos ROCmFPX de ~2,1 bits para mitigarla.
- Estado de prueba comunitaria: no verificado en Strix Halo; solo probado en CPU y NVIDIA GB10 con CUDA.
- Modelo "uncensored": no rechaza peticiones dañinas (3% y 2% de rechazos en JailbreakBench), lo que implica riesgos de uso indebido y la necesidad de filtros externos en producción.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado evaluaciones de factualidad en la información disponible.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- La tabla Engram requiere acceso a SSD durante la inferencia; un almacenamiento lento puede degradar la latencia.
- Licencia MIT permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre la variante sin rechazos recae en el desplegador.
- Los tamaños mostrados por Hugging Face (528 GB) corresponden a la descarga completa del repositorio, no al uso de memoria; conviene descargar un solo build.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-StrixHalo-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Variante uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Variante uncensored GSQ-RCO de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Página del proyecto ROCmFPX: https://harshavardhan3002.github.io/ROCmFPX/
- Paper referenciado (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
