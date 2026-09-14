# Balab2021/csicosmos3nanoquality

## Resumen

csicosmos3nanoquality es un adaptador LoRA publicado por Balab2021 (Connected Systems Institute, University of Wisconsin-Milwaukee) sobre el modelo base nvidia/Cosmos3-Nano, un modelo vision-lenguaje cuya arquitectura el autor describe como de disposición Qwen3-VL-8B. El adaptador se ha entrenado con el backend cosmos-rl de NVIDIA TAO para una tarea muy concreta: inspeccionar una línea de llenado de viales a partir de una imagen de cámara lateral y un plan de fabricación en texto, devolviendo un informe JSON con el contenido, el nivel de llenado, el estado de cada vial, las posiciones desviadas y un veredicto global de apto/no apto.

Es un caso de ajuste fino industrial de dominio estrecho: LoRA con r=16 y alpha=32 sobre las proyecciones q/k/v/o de las 36 capas de lenguaje, unos 45 MB de pesos, entrenado en 24 minutos sobre 800 imágenes sintéticas. Su interés práctico está en demostrar un flujo reproducible (generación de dataset sintético, ajuste con TAO, evaluación sobre 300 preguntas retenidas) que eleva la precisión global del 51,0 % del base en modo cero-disparo al 96,7 % tras el ajuste.

No es un modelo de propósito general. El vocabulario de contenidos y estados está cerrado, la geometría de cámara es única y el propio autor advierte de que en fotografías reales de planta todavía falla con oclusiones parciales y con la estimación de nivel en líquidos transparentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (disposicion Qwen3-VL-8B: torre de vision mas 36 capas de lenguaje); adaptador LoRA sobre las proyecciones q/k/v/o de todas las capas de lenguaje |
| Parametros totales | No disponible para el adaptador (LoRA de ~45 MB). El modelo base se distribuye en bf16 con un tamano aproximado de 17 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en el adaptador y en el checkpoint base convertido; no se documentan GGUF, GPTQ, AWQ ni otras |
| Idiomas soportados | No disponible en la informacion proporcionada; el prompt, el plan de fabricacion y el vocabulario de salida estan en ingles |
| Licencia | NVIDIA Open Model License (campo `license: other`); el adaptador y cualquier redistribucion de los pesos base heredan esa licencia |
| Formato de pesos | safetensors (adaptador PEFT LoRA y checkpoint base reconvertido a Qwen3-VL) |
| Pipeline | image-text-to-text |
| Libreria | peft |
| Hiperparametros LoRA | r=16, alpha=32, q/k/v/o de las 36 capas de lenguaje |

## Arquitectura y entrenamiento

El adaptador se monta sobre nvidia/Cosmos3-Nano, un modelo vision-lenguaje con torre de visión más un decodificador de lenguaje de 36 capas descrito por el autor como de disposición Qwen3-VL-8B. El ajuste fino se aplica exclusivamente mediante LoRA (r=16, alpha=32) sobre las proyecciones de consulta, clave, valor y salida de todas las capas de lenguaje, dejando intactos el resto de pesos y la torre de visión. Para poder cargarlo con `transformers`, el repositorio incluye (de forma opcional) una carpeta `base/` con el razonador y la torre de visión de Cosmos3-Nano reindexados como un checkpoint Qwen3-VL estándar en bf16, de unos 17 GB; si esa carpeta no está presente, hay que reconvertir nvidia/Cosmos3-Nano con el script `cosmos3tao/cluster/convert_omni_to_qwen3vl.py`.

El entrenamiento se hizo con el backend cosmos-rl de NVIDIA TAO sobre 800 imágenes sintéticas de vista lateral, cada una con cinco tipos de pregunta (contenido de un vial, recuento, coincidencia con el plan, lista de posiciones desviadas e informe JSON completo). Fueron 5 épocas, 625 pasos, batch 8 sobre 4 GPU en un nodo con 4 GB200, AdamW con lr 2e-5, precisión bf16 y FSDP, en 24 minutos. La pérdida de entrenamiento bajó de 0,290 a 0,033 y la de validación de 0,0971 a 0,0353 (mejor valor en la época 5). No se documenta uso de RLHF ni de DPO; el pipeline es supervisado sobre pares imagen-pregunta-respuesta generados por el script `dataset/generate_tube_dataset.py`.

## Capacidades

- Inspección visual de líneas de llenado: dado un fotograma lateral y el plan de fabricación, identifica cada vial por posición, su contenido y su nivel de llenado.
- Salida estructurada en JSON compacto con las claves `vials`, `deviating_positions` y `pass`, con precisión de campo del 100 % en JSON válido y en el veredicto global.
- Clasificación de contenido dentro de un vocabulario cerrado: `orange`, `blue`, `yellow`, `red`, `green`, `purple`, `clear`, `cubes`, `empty`.
- Clasificación de estado por vial dentro de un vocabulario cerrado: `OK`, `wrong_color`, `underfill`, `overfill`, `empty`, `wrong_content`.
- Recuento de viales y verificación de coincidencia entre lo planificado y lo observado (posición por posición).
- Detección de posiciones desviantes agregadas: lista completa de posiciones que no cumplen el plan.
- Entrada multimodal imagen-texto: procesa una imagen junto con instrucciones y el plan escrito en el mismo mensaje.
- No se documentan tool calling, function calling, capacidades de agente, multi-step reasoning explícito, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles; el ajuste y el vocabulario están en inglés.

## Casos de uso

- Control de calidad en línea de llenado: el modelo recibe el fotograma de la cámara lateral y el plan de la tanda y devuelve directamente el veredicto apto/no apto, lo que permite integrarlo como paso automático de inspección tras la fase de llenado.
- Auditoría de desviaciones por posición: el campo `deviating_positions` alimenta sistemas de trazabilidad que necesitan saber qué viales concretos se apartan del plan, no solo cuántos fallan.
- Generación de informes estructurados para MES/ERP: la salida JSON encaja sin post-procesado en un sistema de ejecución de fabricación o en un histórico de calidad, ya que el 95 % de los informes completos superan la evaluación y el JSON es válido en el 100 % de los casos.
- Detección de error de contenido: distingue color o contenido planificado frente al real (`wrong_color`, `wrong_content`), útil cuando en la misma línea se llenan viales con líquidos distintos y hay riesgo de mezcla.
- Mantenimiento predictivo sobre daños visibles: el autor enmarca el modelo en un escenario de inspección óptica avanzada y mantenimiento predictivo a partir de daños observados en imagen, aunque no se aportan métricas específicas para esa tarea.
- Prototipado rápido de inspectores a medida: el flujo completo (dataset sintético, LoRA con TAO, evaluación retenida) es replicable para otras líneas de producción cambiando la generación de datos, con un coste de entrenamiento de 24 minutos en 4 GB200.
- Precribado en estación de trabajo con GPU de gama alta: para plantas piloto donde no se quiere desplegar todavía un sistema industrial completo, el adaptador más el base en bf16 caben en una GPU de 24-32 GB.

## Benchmarks y rendimiento

Resultados sobre 300 preguntas sintéticas retenidas (60 por tipo), comparando el modelo ajustado con el base nvidia/Cosmos3-Nano en cero-disparo:

| Tipo de pregunta | Modelo base | Modelo ajustado |
|---|---|---|
| Contenido de un vial | 68,3 % | 100 % |
| Recuento de viales | 100 % | 100 % |
| Coincidencia del vial N con el plan | 76,7 % | 100 % |
| Lista de todas las posiciones desviadas | 10,0 % | 88,3 % |
| Informe JSON completo de inspeccion | 0,0 % | 95,0 % |
| Total | 51,0 % | 96,7 % |

Precisión por campo del informe en el modelo ajustado: JSON válido 100 %, contenido por vial 99,7 %, estado por vial 99,2 %, veredicto apto/no apto 100 %. Los fallos restantes son sobrellenados que pasan desapercibidos, sobre todo con líquido transparente. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa unos 45 MB, pero no es autónomo: necesita el modelo base (~17 GB en bf16) para ejecutarse.
- VRAM estimada para inferencia: ~17 GB solo para los pesos del base en bf16, más la torre de visión, activaciones y caché KV para hasta 768 tokens nuevos. Se recomienda un mínimo de 24 GB; cifra estimada, no publicada por el autor.
- GPU recomendadas: para entrenamiento, 1 nodo con 4 GB200 (configuración usada por el autor). Para inferencia en bf16, A100 40 GB, H100, L40S o GB200 quedan holgadas.
- GPU de consumo: una RTX 4090 o RTX 5090 (24-32 GB) puede alojar el base en bf16 de forma ajustada; por debajo de 24 GB haría falta cuantización, que no está documentada ni validada para este adaptador.
- Despliegue: el único camino documentado es `transformers` (`Qwen3VLForConditionalGeneration` con `AutoProcessor`) más `peft` (`PeftModel.from_pretrained` y `merge_and_unload`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en la tarea de inspeccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| csicosmos3nanoquality | Adaptador LoRA sobre Cosmos3-Nano | LoRA ~45 MB sobre base de ~17 GB en bf16 | No disponible | 96,7 % global en 300 preguntas retenidas | NVIDIA Open Model License | HuggingFace, 0 descargas |
| nvidia/Cosmos3-Nano (cero-disparo) | Vision-lenguaje base | Base del adaptador | No disponible | 51,0 % global en el mismo conjunto | NVIDIA Open Model License | HuggingFace (modelo base citado) |
| Qwen3-VL-8B (arquitectura de referencia) | Vision-lenguaje | Denominacion de 8B segun el diseno citado por el autor | No disponible | No evaluado en este conjunto | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

No se dispone de datos publicados que permitan comparar este adaptador con otros modelos de inspección visual industrial de forma cuantitativa; la única comparación con cifras es contra el base cero-disparo que figura en la model card.

## Limitaciones y advertencias

- Entrenado con renders sintéticos de una única geometría de cámara: al aplicarlo a una fotografía real de planta identificó correctamente 7 de 8 viales y falló en una pila de cubos parcialmente ocluida.
- La estimación de nivel de llenado en líquido transparente es la habilidad más débil; los errores residuales son sobrellenados no detectados.
- El autor recomienda explícitamente mezclar fotogramas reales etiquetados en el entrenamiento antes de usarlo en producción.
- Vocabulario cerrado y sensible al prompt: contenidos y estados están fijados y la model card advierte de que hay que mantener la estructura de prompt con la que se entrenó; cambiarla degrada la salida.
- Riesgo de alucinación en el informe JSON: aunque el JSON sea válido en el 100 % de los casos, la precisión por campo baja al 99,7 % en contenido y al 99,2 % en estado por vial, por lo que conviene validar la salida contra reglas de negocio antes de actuar.
- Sesgos conocidos: no documentados; el conjunto de datos es sintético y no se describe su composición demográfica ni de iluminación.
- Limitaciones de idioma: no hay soporte multilingüe declarado; todo el pipeline está en inglés.
- Licencia: NVIDIA Open Model License, que impone sus propias condiciones de uso comercial; el adaptador y cualquier redistribución de los pesos base heredan esa licencia, no una licencia permisiva tipo Apache 2.0 o MIT.
- Madurez: repositorio sin descargas ni valoraciones en el momento de la consulta, con 0,0 GB de tamaño reportado y sin versiones alternativas publicadas.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Balab2021/csicosmos3nanoquality
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio de entrenamiento cosmos3tao: https://github.com/balakreshnan/cosmos3tao
- Script de generacion del dataset: `dataset/generate_tube_dataset.py` dentro del repositorio cosmos3tao
- Script de conversion del base: `cosmos3tao/cluster/convert_omni_to_qwen3vl.py`
- NVIDIA TAO: https://developer.nvidia.com/tao-toolkit
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Connected Systems Institute, UW Milwaukee: https://uwm.edu/csi/

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo (los unicos resultados obtenidos trataban sobre la herramienta dxdiag de Windows), por lo que no se han podido anadir papers, blogs ni demos adicionales.
