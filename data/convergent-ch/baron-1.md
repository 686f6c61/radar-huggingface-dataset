# Convergent-ch/Baron-1

## Resumen

Baron 1 es un modelo de difusión condicional de 4.068.963 parámetros desarrollado por Convergent-ch que genera imágenes de pixel-art de 256 × 144 píxeles en formato RGB. A diferencia de los modelos de difusión de gran escala orientados a texto-a-imagen, Baron 1 está entrenado desde inicialización aleatoria para una tarea muy acotada: producir sprites de cuatro formas (espada, poción, escudo y gema) en cuatro colores (rojo, azul, verde y dorado). El modelo se condiciona mediante embeddings separados de forma y color, y emplea una arquitectura U-Net de cuatro etapas.

El interés del modelo es fundamentalmente didáctico y experimental. Su tamaño reducido (4 millones de parámetros) y su entrenamiento completo en una única NVIDIA RTX 3060 Ti en aproximadamente 12 minutos lo convierten en un caso de estudio útil para quienes quieren entender el ciclo completo de un modelo de difusión: generación procedural de datos, condicionamiento por embeddings, entrenamiento con precisión mixta BF16 y publicación de pesos en formato safetensors. No compite con modelos generativos de propósito general ni con pipelines de difusión condicionados por texto.

La relevancia actual es limitada fuera del ámbito de la experimentación: no hay información publicada sobre licencia, idiomas soportados ni benchmarks, y el propio autor lo describe como un prototipo con un conjunto fijo de etiquetas y siluetas imperfectas en algunas categorías. Aun así, su carácter reproducible y su bajo coste de inferencia lo hacen apropiado para prototipado rápido de assets en proyectos de videojuegos pequeños o para docencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net de cuatro etapas para difusión condicional (custom-architecture) |
| Parámetros totales | 4.068.963 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (script de inferencia `baron.py` en PyTorch) |

## Arquitectura y entrenamiento

Baron 1 es un modelo de difusión condicional con una U-Net de cuatro etapas que opera sobre píxeles y se condiciona mediante dos embeddings independientes: uno de forma (cuatro categorías) y otro de color (cuatro categorías). El proceso de denoising parte de ruido y produce imágenes RGB de 256 × 144 píxeles. El modelo fue entrenado desde inicialización aleatoria, sin inicialización desde pesos preentrenados, lo que refuerza su carácter de experimento autocontenido.

El entrenamiento consistió en 10.000 pasos de AdamW con lotes de cuatro ejemplos generados proceduralmente, usando precisión mixta BF16 y ejecutándose en una única NVIDIA RTX 3060 Ti durante aproximadamente 12 minutos. Los pesos publicados corresponden a la media móvil exponencial (EMA) de los parámetros entrenados, una práctica habitual para estabilizar la calidad de muestreo en modelos de difusión. El script de entrenamiento incluye el generador sintético de imágenes, lo que permite reproducir el pipeline completo.

## Capacidades

- Generación de imágenes de pixel-art de 256 × 144 píxeles en RGB.
- Condicionamiento por forma: `sword`, `potion`, `shield`, `gem`.
- Condicionamiento por color: `red`, `blue`, `green`, `gold`.
- Variación controlada mediante semilla (`--seed`), lo que permite generar distintas instancias de una misma combinación forma-color.
- Inferencia en CUDA cuando está disponible y en CPU en caso contrario.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto: no procesa prompts en lenguaje natural.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras modalidades.

## Casos de uso

- Prototipado rápido de assets para videojuegos: el modelo permite generar variantes de espadas, pociones, escudos y gemas en cuatro colores con una sola línea de comandos, lo que acelera la exploración de paletas y siluetas en las primeras fases de diseño.
- Docencia sobre modelos de difusión: al ser entrenable en 12 minutos en una GPU de consumo, sirve para ilustrar en clase el ciclo completo de difusión condicional, desde la generación procedural de datos hasta el muestreo con EMA.
- Generación de sprites para juegos experimentales o game jams: dado su coste de inferencia mínimo y su ejecución en CPU, puede integrarse en herramientas de autoría ligera sin necesidad de infraestructura GPU.
- Reproducción de investigación: el script de entrenamiento incluye el generador sintético, lo que facilita experimentar con variaciones de arquitectura, número de pasos o condicionamiento sin depender de datasets externos.
- Pruebas de pipelines de publicación de modelos: su tamaño reducido (repo de 0,0 GB) y su formato safetensors lo hacen útil para validar flujos de empaquetado, versionado y descarga en Hugging Face.
- Generación de iconos o elementos decorativos de temática retro: las combinaciones forma-color y la variación por semilla permiten producir conjuntos coherentes de iconos pixel-art para interfaces o material promocional de estética 8/16 bits.
- Experimentación con condicionamiento multi-atributo: sirve como banco de pruebas para estudiar cómo interactúan embeddings separados de forma y color en un modelo de difusión pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.068.963 parámetros en BF16 el peso de los parámetros ronda los 8 MB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo moderna e incluso en CPU.
- GPU recomendadas: el autor entrenó el modelo en una NVIDIA RTX 3060 Ti; para inferencia es suficiente cualquier GPU con soporte CUDA, y el script funciona también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con CUDA; también en CPU.
- Opciones de despliegue: script propio `baron.py` con PyTorch, `numpy` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Baron 1 | 4.068.963 | 256 × 144 RGB | Forma y color (4 × 4) | no disponible | Hugging Face (Convergent-ch/Baron-1) |
| Stable Diffusion 1.5 | ~860 M (U-Net) | 512 × 512 RGB | Texto | CreativeML Open RAIL-M | Amplia |
| Stable Diffusion XL | ~2,6 B (U-Net) | 1024 × 1024 RGB | Texto | CreativeML Open RAIL++-M | Amplia |
| Pixel-art diffusion especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Stable Diffusion 1.5 y XL es meramente orientativa: Baron 1 es dos o tres órdenes de magnitud más pequeño, no acepta prompts de texto y está restringido a 16 combinaciones forma-color. No se dispone de información sobre otros modelos de difusión específicos de pixel-art con los que compararlo de forma directa.

## Limitaciones y advertencias

- Conjunto de etiquetas fijo: solo admite cuatro formas y cuatro colores; no generaliza a otras categorías ni a combinaciones fuera del vocabulario entrenado.
- Calidad irregular: el propio autor señala que algunas espadas y escudos presentan siluetas distorsionadas, mientras que el control de color es claro en los ejemplos.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; es imprescindible contactar con el autor antes de usarlo en producción.
- Idiomas no disponibles: no es un modelo de lenguaje, por lo que no procesa texto ni instrucciones en lenguaje natural.
- Riesgo de alucinación: no aplica en el sentido habitual, pero el modelo puede producir sprites con formas ambiguas o fuera de la categoría solicitada en algunas semillas.
- Ausencia de benchmarks: no hay métricas publicadas de FID, IS ni evaluaciones humanas que permitan cuantificar su calidad frente a alternativas.
- Madurez: prototipo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento activo.
- Contexto: no aplica ventana de contexto textual; la resolución de salida está fijada en 256 × 144 píxeles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Baron-1
- Script de inferencia: `baron.py` (incluido en el repositorio del modelo)
- Pesos: `model.safetensors` (incluido en el repositorio del modelo)
- Imagen de muestra: `preview.png` (incluida en el repositorio del modelo)
