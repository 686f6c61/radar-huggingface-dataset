# ifmylove2011/girlslike-zimage

## Resumen

GirlsLike-ZImage es un adaptador de tipo LoRA/LoKR para el modelo de generación de imágenes Tongyi-MAI/Z-Image y su variante acelerada Z-Image-Turbo, desarrollado por el usuario ifmylove2011. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de pesos de ajuste fino de bajo rango orientados a la generación de retratos fotorrealistas de personas concretas mediante text-to-image. El autor lo publica explícitamente como material de prueba personal, sin garantías de calidad ni de estabilidad.

La relevancia del artefacto radica en su doble variante: los pesos con sufijo "zi" se entrenan sobre Z-Image Base mediante LoKR de rango completo y son compatibles tanto con el modelo base como con Turbo, mientras que los "zit" se entrenan sobre Turbo y solo funcionan con ese modelo. El autor documenta que la variante "zi" ofrece mejor compatibilidad y mayor similitud en planos medios y lejanos, a costa de un acabado más plano en primeros planos.

El repositorio ocupa 8,2 GB y acumula cerca de 30.000 descargas, lo que refleja un uso orientado a la experimentación con generación de retratos y no a tareas de razonamiento, código o procesamiento de lenguaje. Toda la documentación técnica está en chino y no se publican parámetros de arquitectura del modelo base ni resultados de evaluación cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA/LoKR (adaptador de bajo rango) sobre un modelo de difusión text-to-image (Tongyi-MAI/Z-Image y Z-Image-Turbo) |
| Parametros totales | no disponible (depende del rango del adaptador; el autor indica LoKR de rango completo para la variante "zi") |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no procesa contexto textual medido en tokens) |
| Tipos de cuantizacion | no disponible; los ejemplos se generan con el modelo base en BF16 |
| Idiomas soportados | no disponible (los prompts de ejemplo están en chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato estándar de diffusers para LoRA/LoKR) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de ajuste fino de bajo rango sobre un modelo de difusión. La variante "zi" emplea LoKR (Kronecker-factorised low-rank adaptation) de rango completo entrenada sobre Z-Image Base, mientras que la variante "zit" se entrena sobre Z-Image Turbo y presenta peor compatibilidad cruzada. El autor no publica el número de pasos de entrenamiento, el tamaño ni la composición del dataset, ni si se aplicaron técnicas de regularización o de aumento de datos.

Como innovación operativa, el autor documenta que el modelo base Turbo es capaz de generar directamente ciertas figuras públicas a partir de su nombre, por lo que el adaptador incorpora el nombre real de la persona como token de activación; cuando ese nombre ya está "ocupado" por el modelo base, se emplea un token específico que aparece en la marca de agua de las imágenes de ejemplo con el formato "girlslikezi for xxx". También se documentan parámetros de inferencia recomendados: 8 pasos, muestreadores er_sde + sgm_uniform o euler + flowmatch, cfg=1, resolución 1080x1440, pesos del adaptador entre 0,5 y 1,5 y prompts en chino.

## Capacidades

- Generación de imágenes fotorrealistas de retratos de personas concretas mediante text-to-image, condicionada por un token de activación (nombre real o token específico).
- Compatibilidad cruzada de la variante "zi" con Z-Image Base y Z-Image Turbo; la variante "zit" queda restringida a Turbo.
- Control de similitud mediante el peso del adaptador (rango recomendado 0,5-1,5; 1,0 con Turbo, valores más bajos con Base).
- Generación con pocos pasos en Turbo (4 pasos ya utilizables, sin beneficio apreciable por encima de 10).
- Ajuste del estilo y la fidelidad mediante el parámetro shift (3-10) y el valor de cfg (0,7-1 para potenciar la textura del modelo base; 1-3 para mayor precisión con aspecto más "IA").
- Generación con doble muestreador (cambiando el scheduler a ddim en el primer paso) para aumentar la diversidad.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje; es exclusivamente un adaptador de imagen.

## Casos de uso

- Pruebas de concepto de retrato sintético: el adaptador permite generar retratos de una persona concreta en distintos encuadres y estilos para evaluar la fidelidad del ajuste fino antes de invertir en un pipeline de producción.
- Investigación sobre adaptadores LoKR de rango completo: la variante "zi" sirve como caso de estudio de compatibilidad cruzada entre un modelo base y su variante Turbo, con parámetros de inferencia documentados.
- Generación de material visual para prototipos: con 4-8 pasos y cfg=1, el coste de inferencia es bajo y permite iterar rápidamente sobre variaciones de encuadre y vestuario en un entorno de diseño.
- Evaluación de estabilidad anatómica: el autor documenta problemas persistentes de anatomía, por lo que el adaptador es útil para medir la degradación de un modelo base al aplicar adaptadores de personaje.
- Comparación de muestreadores y schedulers: los ejemplos documentan combinaciones er_sde + sgm_uniform y euler + flowmatch, lo que permite reproducir experimentos de calidad frente a coste computacional.
- Docencia y divulgación sobre difusión: el repositorio incluye flujos de trabajo en las imágenes de ejemplo, lo que facilita explicar el efecto del peso del adaptador, el shift y el cfg en la generación final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas cuantitativas (FID, CLIP score, similitud facial) ni comparaciones numéricas con otros adaptadores; solo describe cualitativamente el comportamiento de las variantes "zi" y "zit".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 8,2 GB y los ejemplos se generan con Z-Image Turbo en BF16, lo que sitúa el requisito del modelo base por encima de lo que cabe en GPUs de gama baja.
- GPU recomendadas: no especificadas por el autor; por el tamaño del checkpoint en BF16 y la resolución de ejemplo (1080x1440), se requiere una GPU con al menos 16-24 GB de VRAM para el modelo base, aunque este dato no está confirmado en la información disponible.
- Cabe en GPU de consumo: no confirmado; el tamaño del repositorio y el uso de BF16 sugieren que no es viable en GPUs de 8 GB sin cuantización del modelo base.
- Opciones de despliegue: diffusers (librería declarada); el autor menciona nodos de ComfyUI (ModelSamplingAuraFlow) para ajustar el shift, lo que implica flujos de trabajo en ComfyUI.
- Latencia y throughput: no disponibles; el autor solo indica que 4 pasos son utilizables y que más de 10 no aportan beneficio apreciable en Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Compatibilidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| GirlsLike-ZImage (este) | LoKR/LoRA de personaje sobre Z-Image | Base y Turbo (variante "zi"); solo Turbo (variante "zit") | apache-2.0 | Hugging Face, ~30.000 descargas |
| Tongyi-MAI/Z-Image | Modelo base text-to-image | — | no disponible en la información | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo | Variante acelerada del modelo base | — | no disponible en la información | Hugging Face |
| Otros adaptadores LoRA de personaje sobre Z-Image | LoRA de personaje | Depende del autor | variable | Hugging Face / Civitai |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el artefacto es material de prueba y que los resultados solo representan su criterio estético personal; no hay garantía de calidad ni de estabilidad.
- Problemas anatómicos persistentes: el autor reconoce que los problemas de extremidades y anatomía del modelo base se trasladan al entrenamiento y reaparecen en la generación.
- Compatibilidad limitada: la variante "zit" solo funciona con Turbo y presenta peor compatibilidad; la variante "zi" funciona en ambos pero con acabado más plano en primeros planos.
- Riesgo de suplantación de identidad: el adaptador reproduce la apariencia de personas reales a partir de su nombre; el autor prohíbe su uso para suplantación, engaño u otros fines indebidos, pero la licencia apache-2.0 no impone restricciones legales adicionales.
- Sesgos: no documentados; al tratarse de un adaptador de retratos femeninos, la diversidad de sujetos, edades y etnias está limitada por el dataset de entrenamiento, que no se publica.
- Idiomas: la documentación y los prompts de ejemplo están en chino; no se confirma el soporte de prompts en otros idiomas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero las implicaciones legales del uso de la imagen de personas reales deben evaluarse por separado.
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, razonamiento, código o agentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ifmylove2011/girlslike-zimage
- Modelo base Tongyi-MAI/Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Tongyi-MAI/Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Galería de referencia con nombres reales: https://huggingface.co/spaces/ifmylove2011/girlslike_lora_gallery/blob/main/app.py
- Fuente de prompts citada por el autor (Civitai): https://civitai.com/models/2231696
