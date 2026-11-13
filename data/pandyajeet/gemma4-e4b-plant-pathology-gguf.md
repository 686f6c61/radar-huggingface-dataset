# PandyaJeet/gemma4-e4b-plant-pathology-gguf

## Resumen

Gemma 4 E4B plant-pathology GGUF es una cuantización en formato GGUF de un ajuste fino mediante LoRA sobre el modelo multimodal Google Gemma 4 E4B-it. Lo desarrolla PandyaJeet y está orientado a una tarea muy concreta: recibir la fotografía de una hoja de cultivo y devolver un objeto JSON estricto con evidencia visual, cajas de lesiones, especie vegetal, un diagnóstico entre 15 códigos de enfermedad y un resumen inmediato. El modelo base es de Google y conserva su licencia Apache 2.0; los pesos publicados son una versión modificada (adaptador LoRA fusionado, convertido a GGUF y cuantizado) y no un producto de Google.

La relevancia es doble. Por un lado, demuestra un patrón práctico de especialización de un modelo visión-lenguaje pequeño (7.518.069.290 parámetros totales) para una tarea de dominio con salida estructurada y despliegue local en llama.cpp. Por otro, el propio autor documenta con transparencia sus métricas y limitaciones: precisión de diagnóstico de enfermedad en torno al 55-60 %, JSON válido en más del 99 % de los casos y rendimiento medido únicamente en una máquina Windows con CUDA y GPU RTX 5050 de 8 GB.

Se trata de un modelo de investigación, no de un sustituto de un experto fitopatólogo. No debe emplearse para decisiones reales sobre cultivos ni de seguridad. El repositorio ocupa 14,4 GB e incluye los ficheros cuantizados, el proyector multimodal y un manifiesto con hashes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) heredada de Gemma 4 E4B-it; adaptador LoRA fusionado y convertido a GGUF |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuración usada en la ejecución de referencia: `-c 4096`) |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (ficheros de modelo); proyector multimodal en f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); ficheros `ft-Q8_0.gguf`, `ft-Q4_K_M.gguf` y `ft-mmproj-f16.gguf` |

Ficheros publicados:

| Fichero | Tamano (bytes) | SHA-256 |
|---|---|---|
| `ft-Q8_0.gguf` | 8031243008 | `8c925bc498680921fdf3e3dfc00ac048d4c2d519d0dfe5fca1a1ffbdcaff9ebe` |
| `ft-Q4_K_M.gguf` | 5335292672 | `fc1b375e6b92c4126395a3b1eaf7e9e253723141e1ac525617c00d3e1b4e0197` |
| `ft-mmproj-f16.gguf` | 990372704 | `4c1130224029df05b6ca810883a29e79832f14fe11252c39fad88be1d4fcf003` |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 E4B-it, un transformer multimodal de visión-lenguaje con aproximadamente 7.500 millones de parámetros. Sobre esa base se aplicó un ajuste fino LoRA para la tarea de patología vegetal; el adaptador se fusionó con los pesos base, se convirtió a GGUF y se cuantizó a Q8_0 y Q4_K_M. El proyector multimodal se distribuye por separado en `ft-mmproj-f16.gguf` y es imprescindible: sin él, el modelo no procesa imágenes.

El entrenamiento se realizó sobre el dataset `PandyaJeet/gemma4-plant-pathology-3k`, marcado como Apache 2.0, que según su model card agrega imágenes de PlantVillage, PlantDoc y un conjunto denominado "Agricultural Pests". No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación técnica destacable no está en la arquitectura, sino en el contrato de salida: el modelo se evalúa con un system prompt fijo que exige un objeto JSON estricto con `visual_evidence`, `lesion_boxes` en escala 0-1000, `species`, `diagnosis` e `immediate_summary`, y se midió su adherencia a ese formato.

## Capacidades

- Generación de texto y razonamiento multimodal: interpreta una imagen de hoja y produce una descripción de evidencia visual.
- Salida estructurada en JSON estricto con cinco campos definidos (evidencia, cajas de lesiones, especie, diagnóstico y resumen).
- Detección y localización de lesiones mediante cajas delimitadoras en formato `[ymin, xmin, ymax, xmax]` sobre escala 0-1000.
- Clasificación de especie vegetal y diagnóstico entre 15 códigos de enfermedad predefinidos.
- Procesamiento de imagen-texto a texto (`image-text-to-text`) mediante el proyector multimodal.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras modalidades especiales: no disponibles.

## Casos de uso

- Triaje de imágenes de campo en investigación agronómica: el modelo recibe una foto de hoja y devuelve un JSON con diagnóstico y cajas de lesiones, útil para preetiquetar grandes volúmenes de imágenes antes de la revisión experta.
- Anotación asistida de datasets de patología vegetal: las cajas delimitadoras y la evidencia visual sirven como propuesta inicial que un anotador humano corrige, reduciendo el coste de etiquetado.
- Despliegue local en portátil con GPU de consumo: al caber en una RTX 5050 de 8 GB con Q4_K_M o Q8_0 más el proyector, permite prototipar en campo o en entornos sin conectividad.
- Integración en pipelines de visión por lotes: la salida JSON estricta y la alta tasa de validez de formato (más del 99 %) facilitan el parseo automático en scripts de análisis.
- Evaluación comparativa de cuantizaciones: sirve como caso de estudio de la pérdida de precisión entre Q8_0 y Q4_K_M (5,1 puntos de exactitud de diagnóstico) para decidir el equilibrio tamaño-calidad en producción.
- Docencia y demostración de ajuste fino LoRA multimodal: el repositorio documenta el flujo completo (base, LoRA, fusión, GGUF, cuantización) y las métricas, lo que lo hace útil como material de referencia.
- Filtrado previo en aplicaciones de monitorización de cultivos: con las advertencias oportunas, puede priorizar imágenes sospechosas para revisión humana, nunca para decisión automática.

## Benchmarks y rendimiento

Conjunto de evaluación de 277 casos retenidos, una pasada greedy por caso, ejecutado en llama.cpp b12110 con CUDA sobre una RTX 5050 de 8 GB (Windows), con el system prompt del autor y un máximo de 512 tokens nuevos:

| Métrica | Q8_0 | Q4_K_M |
|---|---|---|
| Exactitud de código de enfermedad | 60,3 % (IC 95 %: 54,5-65,7) | 55,2 % (IC 95 %: 49,5-61,0) |
| F1 macro de código de enfermedad | 0,525 | 0,480 |
| Exactitud de especie | 74,9 % | 71,4 % |
| JSON válido | 99,3 % | 99,6 % |
| Precisión de cajas a IoU 0,5 | 40,2 % | 44,3 % |
| Recobrado de cajas a IoU 0,5 | 35,1 % | 31,9 % |
| IoU medio de cajas | 0,489 | 0,473 |

El modelo base sin ajuste fino obtiene un 0 % en la tarea de 15 códigos, porque nunca vio esos códigos; según el autor, esa cifra mide lo que aporta el ajuste fino, no la habilidad del modelo base. La caída de Q4_K_M frente a Q8_0 en exactitud de enfermedad es de 5,1 puntos (IC 95 % de la caída: 1,4-9,0 puntos).

## Requisitos de hardware

- VRAM estimada: Q8_0 ocupa unos 8,0 GB y Q4_K_M unos 5,3 GB, más el proyector multimodal f16 de aproximadamente 1,0 GB. En la práctica, Q8_0 requiere más de 8 GB de VRAM libre si se carga todo en GPU; Q4_K_M es la opción para GPUs de 8 GB.
- GPU recomendadas: el autor solo probó una RTX 5050 de 8 GB con CUDA. Para Q8_0 con holgura se recomiendan GPUs de 12-16 GB o superiores (RTX 4080/4090, A100, H100); Q4_K_M cabe en GPUs de consumo de 8 GB.
- Cabe en GPU de consumo: sí, al menos Q4_K_M en 8 GB; Q8_0 depende del margen libre de VRAM.
- Opciones de despliegue: llama.cpp, versión de referencia `v0.9.0`, build `b12110`, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`. Otras builds no fueron probadas. Comando de referencia: `llama-server -m ft-Q8_0.gguf --mmproj ft-mmproj-f16.gguf -ngl 99 -c 4096 -np 1`.
- Latencia y throughput: no disponibles. Solo se documenta la configuración de 4096 de contexto, `-np 1` y un máximo de 512 tokens nuevos por respuesta.
- CPU, Vulkan y Metal: no probados según el autor.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. Como referencia de categoría, el propio modelo base Google Gemma 4 E4B-it (7.518.069.290 parámetros, Apache 2.0) es el punto de partida: sin ajuste fino obtiene un 0 % en la tarea de 15 códigos, mientras que este ajuste alcanza un 60,3 % (Q8_0). No hay datos disponibles sobre alternativas especializadas en patología vegetal.

| Modelo | Parámetros | Contexto | Tarea de 15 códigos | Licencia |
|---|---|---|---|---|
| Gemma 4 E4B plant-pathology (Q8_0) | 7.518.069.290 | 4096 (config. de referencia) | 60,3 % exactitud | Apache 2.0 |
| Gemma 4 E4B plant-pathology (Q4_K_M) | 7.518.069.290 | 4096 (config. de referencia) | 55,2 % exactitud | Apache 2.0 |
| Google Gemma 4 E4B-it (base, sin ajuste) | 7.518.069.290 | no disponible | 0 % | Apache 2.0 |

## Limitaciones y advertencias

- La exactitud de diagnóstico de enfermedad es de aproximadamente 55-60 %; muchas respuestas son incorrectas.
- Los conjuntos de evaluación se comprobaron contra las imágenes de entrenamiento solo por hash exacto; copias redimensionadas o recodificadas no se detectarían, por lo que las puntuaciones podrían estar sobreestimadas.
- Las cajas de referencia (gold) son en parte generadas automáticamente, por lo que las métricas de cajas son ruidosas.
- Resultados de una sola ejecución y una sola semilla; solo se probó una máquina Windows con CUDA. CPU, Vulkan y Metal no se probaron.
- Solo cubre 15 clases; fotos de otros cultivos o escenas sin hojas producen salidas poco fiables.
- La salida puede ser JSON inválido en menos del 1 % de los casos.
- Derechos de los datos de entrenamiento inciertos: el dataset cita PlantVillage, PlantDoc y un conjunto de plagas sin licencia por fuente. PlantDoc es CC-BY-4.0, un espejo de PlantVillage es CC-BY-SA-3.0, otro repositorio de PlantVillage no tiene licencia y el conjunto de plagas no está identificado. El autor no determinó si esos términos limitan los pesos entrenados.
- No debe usarse para decisiones reales sobre cultivos ni de seguridad; es un modelo de investigación, no un sustituto de un experto.
- Licencia Apache 2.0, pero los pesos son una versión modificada de Gemma 4 E4B y no un producto de Google.
- No hay datos disponibles sobre sesgos, comportamiento multilingüe ni tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PandyaJeet/gemma4-e4b-plant-pathology-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/PandyaJeet/gemma4-plant-pathology-3k
- llama.cpp (runtime de referencia, v0.9.0, build b12110): https://github.com/ggml-org/llama.cpp
