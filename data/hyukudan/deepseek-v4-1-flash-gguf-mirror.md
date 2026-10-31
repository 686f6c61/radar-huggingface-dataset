# hyukudan/deepseek-v4.1-flash-gguf-mirror

## Resumen

DeepSeek V4.1 Flash 1017 GGUF (mirror de hyukudan) no es un modelo nuevo, sino un repositorio espejo de las cuantizaciones GGUF del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, originalmente convertidas y cuantizadas por el usuario kyuz0. El modelo base es un LLM de gran escala (754.638.867.584 parámetros según los safetensors del original) publicado bajo licencia MIT, lo que lo hace plenamente utilizable en producción y comercialmente sin restricciones relevantes.

La relevancia de este mirror es doble. Por un lado, hace accesible en formato GGUF un modelo de más de 750 mil millones de parámetros mediante cuantizaciones agresivas (expertos en Q2, pesos densos en Q8_0, además de una variante MXFP4), lo que permite ejecutarlo en hardware de gama alta con memoria unificada o GPUs profesionales. Por otro, el mirror existe para garantizar la reproducibilidad de un proyecto de investigación sobre inferencia eficiente en Strix Halo (AMD), el strix-halo-engine-lab, que combina este GGUF con overlays de requantización propios.

El repositorio contiene 8 archivos (373,68 GB en total), incluyendo el GGUF principal en Q2, un modelo draft MXFP4 para decodificación especulativa, metadatos de calibración imatrix y parches de compatibilidad. Es un punto de entrada interesante para quien quiera evaluar la familia DeepSeek V4.1 Flash en entornos locales con control exacto de la versión de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MoE, según la separación expertos/denso en la cuantización; detalles no disponibles) |
| Parametros totales | 754.638.867.584 (≈754,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2 (expertos: IQ2_XXS gate/up, Q2_K down), Q8_0 (pesos densos), MXFP4 (variante DSpark draft) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer de gran escala con arquitectura de mezcla de expertos (MoE). Esto se deduce de la estructura de las cuantizaciones publicadas: los expertos se almacenan en Q2 (IQ2_XXS para gate/up, Q2_K para down) mientras que los componentes densos (attention, shared expert y output head) se mantienen en Q8_0, una estrategia habitual para preservar la calidad en las partes más sensibles del modelo minimizando el tamaño de los expertos, que dominan el recuento de parámetros. Los detalles concretos de número de expertos, parámetros activos por token o longitud de contexto no constan en la información disponible.

Sobre el entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF o DPO) no se aporta información en este repositorio; la model card original se conserva íntegra en el archivo `README.upstream.md` del mirror. En cuanto a la cuantización, kyuz0 empleó matrices de importancia (imatrix) para calibrar la cuantización de los expertos, y el mirror incluye los metadatos de calibración (`DeepSeek-V4.1-Flash-1017-imatrix.json` y un parche de procedencia) para reproducibilidad. Como innovación en inferencia, el repositorio de origen del motor utiliza el GGUF DSpark MXFP4 (7,97 GB) como modelo draft en decodificación especulativa verificada contra el modelo objetivo, con salida idéntica a la decodificación greedy.

## Capacidades

Al tratarse de una cuantización GGUF del modelo base DeepSeek-V4.1-Flash-1017, las capacidades son las del modelo original. La información disponible permite afirmar lo siguiente:

- Generación de texto como modelo base (no se indica en el mirror si la variante 1017 es instruct o base).
- Soporte de visión: el mirror incluye un parche de compatibilidad (`vision-checkpoint-1017.patch`), lo que indica que el modelo original dispone de capacidades visuales, aunque los GGUF de visión no están incluidos en este repositorio.
- Compatibilidad con decodificación especulativa mediante el draft DSpark MXFP4, con salida verificada idéntica a greedy.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en inferencia eficiente en hardware de consumo/prosumidor: el mirror es la base del strix-halo-engine-lab, que ejecuta el modelo en AMD Strix Halo (memoria unificada) combinando el GGUF Q2 con overlays de requantización de 6,5 bits para los pesos densos; ideal para estudiar rutas de inferencia MoE cuantizada.
- Despliegue local de un MoE de gran escala en GPUs profesionales: la ruta standalone para RTX PRO 6000 (IQ2_XXS gate/up, Q2_K down, Q8_0 denso) permite servir el modelo completo en una sola GPU de 96 GB de VRAM.
- Experimentación con decodificación especulativa: el draft DSpark MXFP4 (7,97 GB) permite acelerar la generación sin alterar la distribución de salida, útil en escenarios de serving donde la latencia por token es crítica.
- Reproducibilidad científica: los hashes sha256 de todos los archivos están fijados y documentados, y el mirror ancla la revisión exacta usada en los experimentos, lo que lo hace adecuado como referencia citable en papers o informes técnicos.
- Bases para builds de cuantización personalizadas: al incluir los metadatos de calibración imatrix, permite generar cuantizaciones propias del modelo de forma reproducible.
- Integración en pipelines basados en llama.cpp: el formato GGUF y la estructura de archivos documentada facilitan su uso con runtimes compatibles con GGUF y con esquemas de pesos mixtos por tensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio remite al proyecto strix-halo-engine-lab para mediciones de rendimiento del motor, pero no incluye cifras de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) ni de throughput/latencia en la model card.

## Requisitos de hardware

- VRAM/memoria estimada para el GGUF principal: el archivo `DeepSeek-V4.1-Flash-1017-Q2.gguf` pesa 365,71 GB, por lo que se necesita al menos esa cantidad de memoria accesible (VRAM + memoria unificada), más margen para el KV cache.
- GPU recomendadas según las rutas documentadas en el motor: NVIDIA RTX PRO 6000 (ruta standalone, 96 GB) y configuraciones de dos nodos sobre AMD Strix Halo con memoria unificada; también se menciona un pipeline dividido para RTX PRO.
- No cabe en GPUs de consumo convencionales (RTX 4090, RTX 5090) por su tamaño incluso cuantizado en Q2; la variante draft DSpark MXFP4 (7,97 GB) sí cabe en GPUs de consumo, pero solo sirve como modelo draft, no como modelo principal.
- Despliegue: formato GGUF compatible con runtimes tipo llama.cpp; el proyecto asociado usa un motor propio (strix-halo-engine-lab). No se documenta soporte específico para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; las mediciones del proyecto se publican en el repositorio del motor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (este mirror) | 754,6 B | GGUF | Q2 expertos / Q8_0 denso / MXFP4 draft | MIT | Mirror para reproducibilidad; 373,68 GB |
| DeepSeek-V4.1-Flash (original, deepseek-ai) | 754,6 B | safetensors | Pesos nativos (FP8/BF16, no disponible) | MIT | Incluye partes Q4 y GGUFs de visión no mirrorizados |
| hyukudan DeepSeek-V4.1-Flash-1017-strix-dense-U6 | Overlay sobre el mismo modelo | GGUF overlay | 6,5 bits (pesos densos) | no disponible | No es un modelo standalone; se aplica sobre el Q2 de este mirror |

Alternativas de otros fabricantes de tamaño comparable no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El mirror solo incluye el subconjunto de archivos que usa el motor del autor: faltan el GGUF Q2 de la versión no-1017, las partes Q4, los GGUF de visión y el archivo `imatrix.dat`; hay que obtenerlos del repositorio upstream de kyuz0.
- La cuantización Q2 de los expertos es muy agresiva y puede degradar la calidad de generación respecto a los pesos originales; los pesos densos en Q8_0 mitigan parcialmente este efecto.
- Sesgos del modelo, riesgo de alucinación, longitud de contexto e idiomas soportados: no disponibles en la información proporcionada; consultar la model card upstream (`README.upstream.md`).
- El overlay strix-dense-U6 y los packs trellis EXL3 no son modelos independientes: requieren el GGUF de este mirror como base.
- La decodificación especulativa con el draft DSpark MXFP4 solo garantiza salida idéntica a greedy; con muestreo estocástico el comportamiento puede diferir.
- Licencia MIT, sin restricciones de uso comercial significativas; el aviso de copyright upstream ("Copyright (c) 2023 DeepSeek") debe conservarse.
- Los datos de descargas (1.216) y likes (0) indican un repositorio de nicho, orientado a reproducibilidad de investigación más que a adopción general.

## Enlaces

- Mirror (este repositorio): https://huggingface.co/hyukudan/deepseek-v4.1-flash-gguf-mirror
- Repositorio upstream de cuantización: https://huggingface.co/kyuz0/deepseek-v4.1-flash-gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Overlay de pesos densos (6,5 bits): https://huggingface.co/hyukudan/DeepSeek-V4.1-Flash-1017-strix-dense-U6
- Packs trellis EXL3: https://huggingface.co/hyukudan/DeepSeek-V4.1-Flash-1017-strix-trellis-EXL3
- Motor y mediciones: https://github.com/hyukudan/strix-halo-engine-lab
- Defaults de producción del motor: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/models/deepseek-v4.1/production-defaults.md
