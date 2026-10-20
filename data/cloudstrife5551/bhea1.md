# cloudstrife5551/bhea1

## Resumen

`cloudstrife5551/bhea1` es un adaptador LoRA de tipo DreamBooth para el modelo de difusión texto-a-imagen Krea 2, publicado por el usuario cloudstrife5551 en Hugging Face. No es un modelo independiente: se trata de un conjunto de pesos de bajo rango (0,8 GB de repositorio) que se carga sobre el modelo base `krea/Krea-2-Raw` y que, según el autor, se entrena sobre Krea 2 RAW y se muestra en Krea 2 Turbo. El adaptador incorpora un concepto o identidad concreta que se invoca con el token `Bhea1`.

Su función práctica es fijar un sujeto consistente (un personaje o identidad denominado Bhea1) para representarlo en escenas, estilos y encuadres arbitrarios sin perder sus rasgos. Resulta útil para flujos de generación de personajes recurrentes, pero llega con documentación técnica mínima: no hay información sobre el dataset, los hiperparámetros de entrenamiento ni métricas de calidad, y su adopción pública es prácticamente nula (1 descarga y 0 likes en el momento de la consulta).

La model card se limita al token activador, tres prompts de ejemplo y un fragmento de código con `Krea2Pipeline`, ejecutado con `num_inference_steps=8` y `guidance_scale=0.0`, lo que orienta su uso hacia la variante Turbo del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (DreamBooth) sobre un modelo de difusión texto-a-imagen; la arquitectura interna de Krea 2 no se detalla en la información disponible |
| Parámetros totales | No disponible para el modelo base; el adaptador ocupa 0,8 GB en el repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como tal (modelo texto-a-imagen); no se especifica la ventana del codificador de texto |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible; los prompts de ejemplo están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA para la librería `diffusers`; el contenedor exacto no se especifica en la model card |
| Modelo base | `krea/Krea-2-Raw`; las muestras se generan sobre `krea/Krea-2-Turbo` |
| Token activador | `Bhea1` |
| Pipeline declarado | `text-to-image` |
| Tamaño del repositorio | 0,8 GB |
| Fecha de creación / actualización | 2026-10-20 / 2026-10-20 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado con la metodología DreamBooth sobre Krea 2 RAW, según declara el autor. Esto implica que el modelo base permanece congelado y que el entrenamiento ajusta matrices de bajo rango insertadas en las capas de atención del difusor, de modo que el adaptador solo codifica el concepto nuevo y no altera el conocimiento general del modelo. El resultado es un fichero pequeño (0,8 GB) que se combina con el modelo base en tiempo de inferencia mediante `pipe.load_lora_weights()`.

No se especifican el rango del adaptador, el número de imágenes de entrenamiento, la resolución, la tasa de aprendizaje, el número de pasos ni si se aplicaron técnicas de regularización o *prior preservation*. Tampoco se indica la composición del dataset ni si existe un proceso de filtrado o curaduría. No aplican fases de RLHF o DPO al tratarse de un modelo generativo de imágenes; no se documenta ningún refinamiento posterior por preferencias humanas.

El único detalle de inferencia aportado es que las muestras se generaron sobre Krea 2 Turbo con 8 pasos de muestreo y `guidance_scale=0.0`, configuración coherente con un modelo destilado para pocos pasos y sin *classifier-free guidance*.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada a un concepto concreto mediante el token `Bhea1`.
- Reproducción consistente de una identidad o personaje a través de prompts y estilos distintos (las tres muestras cubren cyberpunk, pintura al óleo y alta costura).
- Transferencia de estilo: el token se combina con indicaciones de técnica artística (óleo, fotografía cinematográfica) manteniendo la identidad del sujeto.
- Compatibilidad con el ecosistema `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Inferencia en pocos pasos (8) sobre la variante Turbo del modelo base.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, agentes, visión de entrada, audio ni multilingüismo; no aplican a un adaptador de generación de imágenes.

## Casos de uso

- Diseño de personajes recurrentes: usar `Bhea1` como sujeto fijo en una serie de ilustraciones para mantener la coherencia visual entre entregas, apoyándose en la capacidad del LoRA para preservar rasgos a través de prompts distintos.
- Storyboarding y previsualización audiovisual: generar fotogramas conceptuales del personaje en localizaciones y atmósferas variadas (lluvia, interiores, exteriores) antes de producir el material final.
- Prototipado de assets para videojuegos: producir retratos y variaciones de un personaje no jugador para validar dirección de arte con el equipo antes de encargar modelado 3D.
- Ilustración editorial y campañas: generar variaciones de una misma figura con tratamientos pictóricos o fotográficos distintos, útil para propuestas creativas a cliente.
- Exploración de estilo sobre un sujeto fijo: combinar el token con indicaciones de técnica (óleo, *high-fashion*, ciberpunk) para comparar tratamientos sin reentrenar el adaptador.
- Pruebas de concepto en canal local: integrar el adaptador en un pipeline `diffusers` sobre Krea 2 Turbo para generar imágenes en 8 pasos en entornos con recursos moderados, una vez validado el coste real del modelo base.
- Investigación sobre personalización: servir como caso de estudio de DreamBooth-LoRA sobre Krea 2 para comparar rank, tamaño de dataset y calidad de identidad, dado que el autor no publica esos hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud facial, DINO, etc.), ni comparaciones cuantitativas con otros adaptadores o con el modelo base. Las únicas evidencias son tres imágenes de muestra cualitativas generadas sobre Krea 2 Turbo con 8 pasos.

## Requisitos de hardware

- La VRAM necesaria la determina el modelo base Krea 2, no el adaptador: hay que cargar `krea/Krea-2-Turbo` (o `krea/Krea-2-Raw`) completo, además de los 0,8 GB del LoRA.
- No se publican cifras de VRAM ni de resolución de inferencia en la información disponible.
- El código de ejemplo usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que implica una GPU con soporte de bfloat16 y suficiente memoria para el modelo base en precisión de 16 bits.
- GPU recomendadas: no disponibles. La idoneidad de tarjetas consumer (RTX 4090, 4080, etc.) no puede confirmarse sin conocer el tamaño y la resolución nativa de Krea 2.
- Opciones de despliegue: `diffusers` está confirmado por la model card; otros entornos (ComfyUI, A1111, vLLM, TGI) no se mencionan y no están confirmados.
- Latencia y throughput: no disponibles. La generación en 8 pasos sobre la variante Turbo sugiere un coste bajo por imagen en comparación con muestreos de 20-50 pasos, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `cloudstrife5551/bhea1` | LoRA DreamBooth sobre Krea 2 | Adaptador de 0,8 GB; base no disponible | No aplica | Sin benchmarks publicados | Apache 2.0 | Hugging Face, 1 descarga |
| `krea/Krea-2-Raw` (modelo base) | Modelo de difusión texto-a-imagen | No disponible | No disponible | No disponible en la información | No verificada en esta consulta | Referenciado por el autor |
| `krea/Krea-2-Turbo` (modelo base destilado) | Modelo de difusión texto-a-imagen optimizado para pocos pasos | No disponible | No disponible | No disponible en la información; el autor usa 8 pasos | No verificada en esta consulta | Referenciado por el autor |
| Fine-tune completo del modelo base (alternativa metodológica) | Ajuste total de pesos | Todos los del modelo base | No aplica | Sin datos comparativos disponibles | Depende del modelo base | No disponible |

No se dispone de datos de benchmark ni de especificaciones de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, licencia y disponibilidad. No se han identificado otros adaptadores LoRA comparables para Krea 2 en la búsqueda realizada.

## Limitaciones y advertencias

- Documentación mínima: no se publican hiperparámetros, composición del dataset, número de imágenes ni proceso de curaduría, lo que impide reproducir el entrenamiento o auditar su procedencia.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de género, etnia, edad o estética presentes en el concepto aprendido.
- Riesgo de sobreajuste: los LoRA de identidad entrenados con pocas imágenes suelen degradar la diversidad de poses, iluminaciones y encuadres; no hay información que permita descartarlo.
- Dependencia del token: el concepto solo se activa con `Bhea1`; su uso fuera de ese token o con pesos demasiado bajos puede no reproducir la identidad.
- Idiomas: los prompts de ejemplo están en inglés y no se declaran idiomas soportados; el comportamiento con prompts en castellano no está verificado.
- Posible conflicto de derechos de imagen: si el concepto corresponde a una persona real, el uso comercial puede requerir consentimiento explícito, independientemente de la licencia del adaptador.
- Licencia: el adaptador se declara Apache 2.0, pero el uso comercial también queda condicionado por la licencia del modelo base Krea 2, que no se detalla en la información disponible.
- Validación comunitaria nula: 1 descarga y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni informes de terceros.
- Metadatos llamativos: las fechas de creación y actualización (2026-10-20) son posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citar el modelo.
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces obtenidos eran documentos históricos sin relación.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/cloudstrife5551/bhea1
- Modelo base RAW citado por el autor: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Turbo citado por el autor: https://huggingface.co/krea/Krea-2-Turbo
- Resultados de búsqueda web: sin enlaces relevantes; no se encontraron papers, blogs, repositorios ni demos asociados al modelo.
