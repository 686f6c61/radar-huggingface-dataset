# gutpunkt/Hairwind-LTX2.3-IC-LoRA

## Resumen

Hairwind es un IC-LoRA (in-context LoRA) para el modelo de vídeo LTX 2.3 de Lightricks, desarrollado por el usuario gutpunkt (Maxim, LieberLaut). Su función es convertir un vídeo de referencia en el que una persona aparece con el pelo quieto en el mismo plano con el pelo movido por un viento fuerte, sin necesidad de simulación física ni composición VFX manual. Se trata de un adaptador de tipo "VFX in a box": se introduce el clip original como vídeo de referencia y el modelo genera la versión con viento aplicada sobre el cabello.

El adaptador se apoya en el modelo base LTX 2.3 en su variante de 22B parámetros (ltx-2.3-22b-dev) y se entrena con la librería ltx-trainer del propio proyecto LTX-2. Los pesos se distribuyen como un único archivo safetensors de rango 32 sobre las proyecciones de atención y feed-forward. Es la primera entrega de una serie planificada de IC-LoRAs de elementos (aire, fuego, tierra) y se encuentra en estado experimental (v01, work in progress).

La relevancia actual del proyecto es doble: por un lado demuestra el flujo de trabajo de entrenamiento de IC-LoRAs sobre LTX 2.3 con datos completamente sintéticos generados en Blender; por otro, explora la sustitución de pipelines de simulación y composición por un adaptador generativo ligero. El autor advierte que la versión actual funciona en su conjunto de validación sintético pero presenta limitaciones conocidas sobre metraje real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IC-LoRA (adaptador de bajo rango con condicionamiento por referencia) sobre el modelo de vídeo LTX 2.3 (22B) |
| Parametros totales | No disponible (el LoRA se aplica sobre un modelo base de 22B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo; ventana temporal expresada en frames: recomendado 8n+1, p. ej. 121 frames) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en bf16 durante el entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | LTX-2 Community License (derivado de LTX 2.3) |
| Formato de pesos | safetensors (`hairwind_v01_ltx23_ic_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre las proyecciones de atención y feed-forward del modelo base LTX 2.3 (variante dev de 22B). El entrenamiento emplea la estrategia flexible de `ltx-trainer` con condicionamiento por referencia, añadiendo un 20 % de condicionamiento por primer frame. Se ejecutaron 3000 pasos con batch size 1, optimizador AdamW, learning rate 2e-4 con decaimiento lineal y precisión bf16, durante aproximadamente 6,6 horas en una única GPU H100 SXM. La configuración completa está publicada en `training_config.yaml` dentro del repositorio.

Los datos de entrenamiento son íntegramente sintéticos y se generaron en Blender 5.2 con Cycles. Se construyó una cabeza 3D con pelo simulado mediante Geometry Nodes y dinámica de pelo horneada, renderizada dos veces por plano con idéntica cámara, iluminación, muestreo y gestión de color: una versión "calma" (guías sin simular) y otra "con viento" (simulada), de modo que la única diferencia entre ambos clips es la acción del viento sobre el pelo. El diseño factorial completo combina 4 entornos HDRI × 2 tonos de piel × 2 colores de pelo × 2 peinados (corto y bob a la mandíbula) = 32 combinaciones, con 3 segmentos cada una, lo que arroja 96 pares calma/viento. Cada clip tiene 121 frames a 960×544 y 24 fps, con cámara orbitando lentamente. Las descripciones del clip objetivo comienzan con la palabra disparadora `WINDSTORM`.

## Capacidades

- Generación de vídeo a vídeo con condicionamiento por referencia: transforma un clip de entrada con el pelo quieto en la misma escena con el pelo en movimiento por viento.
- Aplicación de efecto de viento sobre cabello en planos de personas, incluyendo movimiento de mechones y agitación de la melena.
- Control mediante prompt de texto con palabra disparadora (`WINDSTORM`) para describir la escena y el viento deseado.
- Mantenimiento de la identidad visual de la escena de referencia (cámara, iluminación, encuadre) al generar la variante con viento.
- Soporte de resolución configurable divisible por 32 (recomendado 960×544) y recuento de frames de la forma 8n+1 (recomendado 121).
- Integración con los nodos IC-LoRA oficiales de LTX 2.3 en ComfyUI y con el pipeline de inferencia/validación de `ltx-trainer`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un adaptador de generación de vídeo, no un modelo de lenguaje.
- No soporta visión, audio ni otros idiomas en el sentido de un LLM; el prompt de texto se usa únicamente como condicionamiento de generación.

## Casos de uso

- Postproducción VFX de bajo coste: sustituir la simulación de pelo y la composición manual en planos de personajes por una pasada del IC-LoRA sobre el clip original, reduciendo tiempo de artista y necesidad de software de simulación.
- Generación de datos sintéticos de viento para entrenamiento: producir pares calma/viento etiquetados de forma automática para entrenar modelos de dinámica de pelo, segmentación de mechones o estimación de flujo óptico en cabello.
- Previsualización rápida en preproducción: generar versiones con viento de planos de prueba para evaluar la dirección artística antes de comprometer recursos de VFX en la secuencia final.
- Creación de contenido para redes y publicidad: añadir viento dramático a clips de personas en planos de producto, moda o retrato sin rodar con ventiladores ni recurrir a simulación.
- Investigación en adaptadores de vídeo: usar el repositorio y la configuración de entrenamiento como referencia reproducible para entrenar IC-LoRAs de otros elementos (fuego, tierra) sobre LTX 2.3.
- Prototipado de herramientas "VFX in a box": integrar el adaptador en un pipeline interno que reciba clips de usuario y devuelva una variante con viento, siempre con revisión humana dado el estado experimental.
- Docencia y demostraciones de generación de vídeo condicionada por referencia: ilustrar el funcionamiento de un IC-LoRA con un caso visual claro y un conjunto de validación sintético publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta validación cualitativa mediante GIFs y clips en `samples/` (pares calma/viento del conjunto sintético y dos pruebas sobre metraje real de Pexels con IDs 14562268 y 16442065), sin métricas cuantitativas (FVD, PSNR, LPIPS u otras).

## Requisitos de hardware

- El adaptador en sí ocupa 0,4 GB (tamaño del repositorio), pero requiere cargar el modelo base LTX 2.3 de 22B para la inferencia.
- Entrenamiento validado en 1× H100 SXM durante ~6,6 horas para 3000 pasos con batch size 1 y bf16.
- Para inferencia se recomienda GPU de datacenter (A100, H100) por el tamaño del modelo base de 22B; no se especifica en la información disponible si cabe en GPU de consumo.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- Opciones de despliegue: nodos IC-LoRA de LTX 2.3 en ComfyUI y pipeline de inferencia/validación de `ltx-trainer`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vídeo).
- Latencia y throughput estimados: no disponibles.
- Ajustes recomendados de validación: 960×544 (u otra resolución divisible por 32), 121 frames (8n+1), 30 pasos, CFG 3.0.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / frames | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hairwind-LTX2.3-IC-LoRA | IC-LoRA de viento sobre LTX 2.3 | No disponible (base 22B) | 121 frames recomendados | LTX-2 Community License | Hugging Face (gutpunkt) |
| LTX 2.3 base (Lightricks) | Modelo de vídeo texto/vídeo a vídeo | 22B | No disponible | LTX-2 Community License | Hugging Face (Lightricks) |
| IC-LoRAs oficiales de LTX-2 | Adaptadores in-context oficiales | No disponible | No disponible | LTX-2 Community License | Hugging Face / repo LTX-2 |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas; la comparación anterior es únicamente estructural y de licencia.

## Limitaciones y advertencias

- Estado work in progress (v01): el autor advierte de artefactos y recomienda probar siempre sobre metraje propio antes de cualquier uso.
- Dirección del viento ligada a la cara: en todos los pares de entrenamiento la cabeza está quieta y el viento sopla desde el frente, por lo que el modelo aprende que "el viento sopla hacia donde mira la cara"; si la cabeza gira, el viento gira con ella. La v02 planea desacoplar esto con viento fijo en el mundo y cuatro direcciones.
- Solo pelo: la ropa, la vegetación y el entorno no se ven afectados. El tejido está planificado para v02/v03.
- Brecha de dominio: entrenado solo con una cabeza CG sintética y dos peinados; sobre metraje real el efecto suele ser más débil o inconsistente, especialmente con peinados muy distintos a los del conjunto de entrenamiento.
- Sin control de intensidad ni dirección del viento mediante el prompt en esta versión.
- Riesgo de alucinación visual: al ser un modelo generativo de vídeo, puede introducir artefactos, deformaciones del cabello o inconsistencias temporales no presentes en la referencia.
- Sesgos: el conjunto de entrenamiento cubre solo 2 tonos de piel y 2 colores de pelo, lo que puede limitar la fidelidad en otros fenotipos y peinados.
- Licencia: los pesos son un derivado de LTX 2.3 y se publican bajo la LTX-2 Community License; es obligatorio revisar sus términos antes de cualquier uso comercial.
- Idiomas y contexto: no se documentan capacidades multilingües ni ventanas de contexto en el sentido de un LLM; el condicionamiento es visual y textual para vídeo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutpunkt/Hairwind-LTX2.3-IC-LoRA
- Modelo base LTX 2.3: https://huggingface.co/Lightricks/LTX-2.3
- Licencia LTX-2 Community License: https://huggingface.co/Lightricks/LTX-2.3/blob/main/LICENSE
- Repositorio y trainer LTX-2: https://github.com/Lightricks/LTX-2
- Metraje de prueba en Pexels (ID 14562268): https://www.pexels.com/video/14562268
- Metraje de prueba en Pexels (ID 16442065): https://www.pexels.com/video/16442065
