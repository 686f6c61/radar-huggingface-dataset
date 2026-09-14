# Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r03

## Resumen

Este checkpoint es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup. Se trata de un Llama-2-7b-chat comprimido al 50,0 % de sus parámetros densos mediante la técnica Basis Sharing (ICLR 2025), que comparte bases SVD entre grupos de 2 capas adyacentes, y posteriormente editado con 3 de las 10 rondas previstas de un procedimiento iterativo de intercambio de parámetros ("parameter-neutral swap") seleccionado por la regla `swapgapnet_iter`. El resultado es un modelo de 6.738.415.616 parámetros (fracción 0,4998 respecto al denso) que ocupa 13,5 GB en el repositorio.

El problema que aborda no es la generación de texto en producción, sino cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. La model card es explícita: varias celdas de la cuadrícula experimental están "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat, y este checkpoint es un punto intermedio de una ejecución más larga, no un asistente desplegable.

Su relevancia actual es metodológica: ofrece un punto de medida reproducible (semilla 42, presupuesto de restauración del 1,000 % de parámetros densos, 1341 componentes restaurados y 1341 sustituidos) para estudiar el compromiso seguridad/utilidad bajo compresión, con métricas publicadas de tasa de éxito de ataque y de sobrerrechazo. No hay datos de benchmarks de capacidades generales ni indicación de idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con compresión SVD por Basis Sharing (bases compartidas sobre grupos de 2 capas adyacentes) y edición iterativa de parámetros |
| Parámetros totales | 6.738.415.616 (fracción de parámetros densos resultante: 0,4998) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la model card; el modelo base Llama-2-7b-chat emplea 4096 tokens |
| Tipos de cuantización | No disponible (el repositorio contiene pesos safetensors; no se especifica la precisión) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors (biblioteca `transformers`; tamaño del repositorio: 13,5 GB) |

## Arquitectura y entrenamiento

La base del modelo es Llama-2-7b-chat-hf, un transformer decoder-only. Sobre él se aplica Basis Sharing (ICLR 2025), que factoriza las matrices de proyección por SVD y comparte las bases entre grupos de 2 capas adyacentes, eliminando el 50,00 % de los parámetros densos. Después se ejecuta un procedimiento de intercambio de parámetros neutro en parámetros, con un presupuesto de restauración del 1,000 % de los parámetros densos y en fragmentos de 0,100 % por ronda; el valor de intercambio usado es `net` (valor de inserción más valor de eliminación de la expulsión ordenada por sigma). Se restauraron 1341 componentes y se sustituyeron 1341; en total se introdujeron 19.415.040 parámetros (0,30 % de los parámetros de proyección densos). El checkpoint corresponde a 3 de las 10 rondas iterativas aplicadas, con semilla 42.

Tras la compresión se aplicó una recuperación mediante LoRA con r=8 restringida a los coeficientes por capa (bases congeladas, sin modificar el presupuesto), durante 2 épocas, con tasa de aprendizaje 1e-4, batch de 64 y el dataset alpaca-cleaned. No se documentan en la información disponible ni el número total de tokens de entrenamiento, ni la composición completa del dataset, ni fases de RLHF o DPO adicionales a las ya presentes en Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional: hereda la pila de instrucciones de Llama-2-7b-chat, aunque la model card advierte de degradación de comportamiento respecto al modelo original.
- Métricas de seguridad medibles: el checkpoint publica tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, y sobrerrechazo macro evaluado con WildGuard.
- Estudio de compresión: permite analizar el efecto de Basis Sharing sobre las matrices de proyección y de la regla de selección `swapgapnet_iter`.
- Recuperación con LoRA sobre coeficientes: la configuración de recuperación (r=8, 2 épocas, alpaca-cleaned) es reproducible y documentada.
- Experimentación controlada: la semilla, el presupuesto, el tamaño de fragmento y el número de componentes son parámetros explícitos del experimento.
- Capacidades de tool calling / function calling: no disponibles.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre seguridad y compresión: usar el checkpoint como una celda de la cuadrícula experimental para medir cómo varía el ASR conforme se aplican rondas de intercambio, comparando con las demás configuraciones de regla de selección y presupuesto.
- Red-teaming comparativo: someter el modelo a suites de ataques (AdvBench, StrongREJECT) y contrastar los valores 0,1519 y 0,2396 con los de Llama-2-7b-chat sin comprimir para aislar el efecto de la compresión SVD.
- Análisis de sobrerrechazo: emplear la métrica de sobrerrechazo macro (0,1200 con WildGuard) para estudiar si la edición de parámetros recupera utilidad o introduce rechazos espurios en peticiones benignas.
- Interpretabilidad de subespacios SVD: inspeccionar qué componentes concretos (1341 restaurados y 1341 sustituidos) concentran el comportamiento de seguridad y cómo se distribuyen entre las bases compartidas de pares de capas.
- Reproducción de metodología: replicar el pipeline completo (Basis Sharing al 50 %, swap `net`, presupuesto 1,0 %, LoRA r=8 sobre coeficientes) con la semilla 42 como referencia para validar implementaciones propias.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo una técnica de compresión agresiva puede degradar la alineación de un modelo y qué coste tiene repararla.
- Auditoría de checkpoints intermedios: evaluar si un punto a 3 de 10 rondas es preferible a un estado final para ciertos equilibrios seguridad/utilidad antes de decidir una configuración de producción.

## Benchmarks y rendimiento

| Métrica | Valor | Juez / evaluador |
|---|---|---|
| AdvBench ASR | 0,1519 | HarmBench judge |
| StrongREJECT ASR | 0,2396 | HarmBench judge |
| Sobrerrechazo macro | 0,1200 | WildGuard |

No se han publicado en la información disponible resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros), ni valores de referencia del modelo base sin comprimir con los que establecer una comparación directa.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB para los pesos (el repositorio ocupa 13,5 GB), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB; en 4 bits: en torno a 3,5-4 GB, siempre que se genere una conversión propia (no se distribuyen pesos cuantizados).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio; una RTX 4090 (24 GB) es suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM como servidor compatible con pesos safetensors. Para llama.cpp u Ollama sería necesario convertir a GGUF, formato que no se distribuye.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l2_basis_remove50_swapgapnet_b010_r03`) | 6.738.415.616 (50 % del denso) | No indicado (base: 4096) | ASR AdvBench 0,1519; ASR StrongREJECT 0,2396; sobrerrechazo 0,1200 | Llama 2 Community License | HuggingFace, 0 descargas, 0 likes |
| `meta-llama/Llama-2-7b-chat-hf` (base) | ~6,74 mil millones | 4096 | No disponible en la información proporcionada | Llama 2 Community License | HuggingFace (modelo de referencia ampliamente utilizado) |
| Otras celdas de la cuadrícula del mismo autor | No disponible | No disponible | No disponible | Llama 2 Community License | No disponibles en la información proporcionada |

No se dispone de datos comparativos de rendimiento entre este checkpoint y su modelo base ni con alternativas de la misma categoría, por lo que no es posible establecer una comparación cuantitativa de capacidades.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card indica explícitamente que es "un sujeto experimental, no un asistente desplegable".
- Degradación deliberada de seguridad: la compresión por sí sola eleva la tasa de éxito de ataque y varias celdas de la cuadrícula están degradadas a propósito; el ASR de 0,1519 en AdvBench es sustancialmente superior al esperado en un modelo alineado sin comprimir.
- Checkpoint intermedio: solo se aplicaron 3 de las 10 rondas de intercambio previstas, por lo que no representa el resultado final del estudio.
- Riesgo de alucinación: no evaluado en la información disponible; la compresión SVD puede afectar a la fidelidad de los pesos de forma no uniforme.
- Idiomas: no se declara ningún idioma soportado; el modelo base está orientado principalmente al inglés.
- Límite de contexto: no se documenta en la model card; se hereda del modelo base (4096 tokens), lo que limita tareas de contexto largo.
- Licencia restrictiva: Llama 2 Community License y `USE_POLICY.md`; el uso comercial está sujeto a las condiciones de Meta, incluidas restricciones de escala y obligaciones de atribución ("Built with Llama 2").
- Sin validación comunitaria: 0 descargas y 0 likes, sin evaluaciones independientes publicadas.
- Ausencia de pesos cuantizados y de formatos alternativos: no hay GGUF ni versiones int8/int4 listas para usar.
- Sin resultados de benchmarks de utilidad: no se puede verificar si el modelo conserva capacidades de razonamiento, código o matemáticas tras la compresión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio como `LICENSE.txt` y `USE_POLICY.md`): https://ai.meta.com/llama/license/
- La búsqueda web realizada no devolvió enlaces relevantes al modelo ni a la técnica Basis Sharing; los resultados obtenidos correspondían a un directorio telefónico alemán y no se incluyen.
