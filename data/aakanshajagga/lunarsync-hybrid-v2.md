# aakanshajagga/lunarsync-hybrid-v2

## Resumen

LunarSync Hybrid v2.0 es un pipeline de correspondencia de puntos (keypoint matching) para imágenes lunares de alta resolución de la cámara OHRC (Orbital High Resolution Camera) a bordo de la misión Chandrayaan-2 de la ISRO. Desarrollado por aakanshajagga, el modelo resuelve el problema de alinear y correlacionar píxeles entre adquisiciones solapadas de la misma región lunar, una tarea crítica para la generación de mosaicos, la detección de cambios y la georreferenciación precisa en teledetección planetaria.

El sistema combina un modo determinista basado en metadatos geométricos (metadata_geometry) con un "visual gate" de seguridad que aplica un desplazamiento visual local solo cuando supera un umbral calibrado. Esta arquitectura híbrida prioriza la fiabilidad frente a la flexibilidad, evitando depender exclusivamente de aprendizaje automático para el matching global. El modelo cuenta con 16,7 millones de parámetros, se distribuye en formato safetensors y se integra mediante la librería transformers con código personalizado. Su relevancia actual radica en ofrecer una solución validada y de bajo coste computacional (114 ms en CPU para 10 000 puntos) para misiones lunares activas y futuras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline híbrido con modo geométrico y visual gate; detalles internos no publicados) |
| Parametros totales | 16 713 426 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (no se especifican términos concretos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo más allá de indicar que usa la librería transformers y código personalizado (custom_code). El nombre "Hybrid" sugiere una combinación de dos vías: un módulo geométrico determinista que calcula correspondencias píxel→suelo lunar→píxel a partir de metadatos PDS, y un módulo visual aprendido que actúa como puerta de seguridad (visual gate). Este último solo introduce una corrección local cuando el resultado geométrico supera un umbral calibrado en validación.

No se ha publicado información sobre la cantidad de datos de entrenamiento, la composición del dataset ni el método de optimización (p. ej., si se usó RLHF, DPO o aprendizaje supervisado). Tampoco se especifican innovaciones técnicas como atención lineal o decodificación especulativa. La documentación menciona que los mapas de geometría de grado 9 se reajustan de forma independiente en cada pliegue espacial, y que los conjuntos de validación son disjuntos por producto de adquisición. Los refinadores fallidos se documentan en `evaluation_report_v2.json`, lo que indica un proceso de desarrollo iterativo con evaluación rigurosa.

## Capacidades

- Correspondencia de puntos entre adquisiciones OHRC solapadas: calcula pares de píxeles equivalentes entre dos productos de imagen lunar.
- Modo `metadata_geometry` (producción): correspondencia determinista píxel→suelo lunar→píxel basada en metadatos geométricos PDS.
- Modo `visual_gate` (producción con seguridad): aplica un desplazamiento visual local solo si la confianza del gate supera el umbral calibrado; en caso contrario, mantiene la geometría.
- Inferencia en CPU con latencia media de 114 ms para 10 000 puntos.
- Integración mediante pipeline Python: `LunarSyncShippingPipeline` desde Hugging Face Hub.
- No soporta matching global aprendido solo a partir de imágenes; la documentación indica explícitamente que esta capacidad no se reivindica.

## Casos de uso

- Georreferenciación de imágenes lunares: el modelo permite asignar coordenadas lunares precisas a píxeles de imágenes OHRC, útil para cartografía y análisis geológico.
- Registro multi-temporal de la misma región: alinear adquisiciones tomadas en diferentes órbitas o fechas para detectar cambios superficiales (p. ej., cráteres nuevos o movimientos de regolito).
- Generación de mosaicos de alta resolución: combinar imágenes solapadas en un mosaico continuo sin errores de alineación, gracias a la precisión subpíxel (mediana de error 0,412 px).
- Verificación de alineación en pipelines de ciencia planetaria: usar el visual gate como control de calidad para validar que la correspondencia geométrica es correcta antes de proceder con análisis posteriores.
- Apoyo a la navegación y planificación de misiones: proporcionar correspondencias fiables entre imágenes orbitales para planificar trayectorias o seleccionar puntos de aterrizaje.
- Investigación en teledetección planetaria: servir como referencia para comparar métodos de correspondencia en entornos con textura limitada y condiciones de iluminación variables, como la superficie lunar.

## Benchmarks y rendimiento

La model card reporta métricas de validación para el pipeline completo, obtenidas con cinco pliegues de control y adquisiciones de validación disjuntas por producto. No se ofrecen comparaciones con otros modelos.

| Metrica | Resultado |
|---|---:|
| Controles held-out (cinco pliegues) | 342 408 |
| Error mediano | 0,412 px |
| Error p95 | 0,770 px |
| PCK@1 px | 99,812 % |
| PCK@2 px | 100,000 % |
| PCK@1 en adquisición held-out | 99,776 % |
| AUROC del visual gate | 0,962 |
| Tasa de falsa aceptación del visual gate | 0,75 % |
| Latencia CPU (10 000 puntos) | 114,0 ms |

No se han publicado resultados de benchmarks comparativos frente a otros modelos de correspondencia de imágenes lunares en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: la latencia reportada es de 114 ms para 10 000 puntos, lo que sugiere que puede ejecutarse en hardware sin GPU.
- Tamaño del modelo: 16,7 millones de parámetros (0,1 GB en disco), por lo que la memoria necesaria es reducida.
- VRAM estimada: no disponible; no se especifica consumo en GPU.
- GPU recomendadas: no disponible; el modelo parece diseñado para CPU.
- Opciones de despliegue: el demo oficial se ejecuta en un Hugging Face Static Space, con inferencia en el navegador (client-side), sin necesidad de runtime de pago. El pipeline Python se carga desde Hugging Face Hub.
- No se mencionan soporte para vLLM, llama.cpp, Ollama o TGI; al ser un modelo de visión con código personalizado, es poco probable que sea compatible con esos motores.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el ámbito de correspondencia de imágenes lunares OHRC. Técnicas genéricas de keypoint matching como SuperGlue, LoFTR o ASpanFormer podrían ser alternativas, pero no hay datos de rendimiento en este dominio específico. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Alcance restringido: solo soporta los productos listados en `geoprior_products.json`; no generaliza a otras misiones (p. ej., TMC-2) ni a imágenes lunares arbitrarias sin datos calibrados adicionales.
- Dependencia de metadatos PDS: el modo geométrico requiere metadatos PDS completos y precisos; sin ellos, el pipeline no puede operar.
- El visual gate tiene una tasa de falsa aceptación del 0,75 %, lo que implica que una pequeña fracción de correspondencias visuales incorrectas podría pasar el filtro.
- No se reivindica matching global aprendido solo con imágenes; el modelo no es adecuado para escenarios sin metadatos geométricos.
- La licencia "other" no especifica términos; se recomienda contactar al autor antes de un uso comercial.
- No es un modelo de lenguaje ni multimodal; no genera texto ni responde a prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aakanshajagga/lunarsync-hybrid-v2
- Demo gratuito en Hugging Face Space: https://huggingface.co/spaces/aakanshajagga/lunarsync-hybrid-demo
- Versión anterior (v1): https://huggingface.co/aakanshajagga/lunarsync
