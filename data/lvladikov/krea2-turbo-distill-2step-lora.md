# lvladikov/Krea2-Turbo-Distill-2step-LoRA

## Resumen

Krea2-Turbo-Distill-2step-LoRA es un adaptador LoRA de destilación de pasos para el modelo de texto a imagen Krea 2 Turbo, desarrollado por el usuario lvladikov. Su función es reducir el número de pasos de denoising necesarios para generar una imagen: lleva a Krea 2 Turbo de 8 pasos a solo 2, manteniendo los pesos y sigmas originales del modelo base y con guidance 0.0. El adaptador se publica como pesos LoRA de rango 64 sobre los mismos 228 módulos que su predecesor de 4 pasos, y se integra sin nodos ni samplers personalizados en diffusers, ComfyUI y MLX.

El modelo resuelve un problema concreto de latencia en pipelines de generación de imágenes: al reducir los pasos a una cuarta parte, el denoising pasa de 56,9 s a 14,3 s a 1024×1024 en cómputo float16, excluyendo la codificación de texto y la decodificación VAE, que consumen el mismo tiempo independientemente del número de pasos. Está pensado como adaptador de previsualización rápida y borradores, no como sustituto del modelo base para renders finales de calidad.

La relevancia actual del adaptador radica en que ha sido evaluado de forma independiente en el artículo NitroFusion2 (arXiv:2611.05648), que lo compara con otros modelos de uno y dos pasos bajo ajustes idénticos de muestreo. Según la model card, en esa comparación obtiene las puntuaciones más altas de GenEval, DPG-Bench y OneIG entre los modelos de dos pasos evaluados. El proyecto se declara cerrado con este checkpoint final, y su sucesor es el LoRA de 3 pasos del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión Krea 2 Turbo; rango 64 sobre 228 módulos |
| Parametros totales | no disponible (tamaño del repo: 6,5 GB, incluye pesos del adaptador y assets) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible; el autor reporta cómputo en float16 |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (license: other) |
| Formato de pesos | safetensors (`krea2_turbo_2step_rank_64_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado sobre los mismos 228 módulos que el LoRA de 4 pasos del mismo autor, manteniendo la forma del adaptador predecesor. Se entrena mediante destilación de pasos con un objetivo de distribution matching: en lugar de imitar la trayectoria exacta del profesor, el estudiante aprende a igualar la distribución de salidas que el profesor produciría plausiblemente. Según el autor, este enfoque evita que el estudiante promedie hacia el desenfoque y los bordes duplicados, un problema típico de la destilación por imitación directa en pocos pasos. El entrenamiento es condicionado por prompt en todo momento: tanto las puntuaciones del profesor como las del estudiante leen el condicionamiento de cada prompt.

El conjunto de entrenamiento se compone de 23.561 trayectorias de profesor registradas: las 13.750 del proyecto de 4 pasos más 9.811 generadas específicamente para este adaptador sobre el mismo banco de prompts, cada una entrenada una sola vez desde el 3 de octubre. En las etapas de 2 pasos se acumulan 51.195 muestras de entrenamiento, partiendo de los pesos publicados del adaptador de 4 pasos. El entrenamiento completo llevó 32 días en una única RTX 3090, con más de cuarenta ajustes de receta en dos métodos, cada uno conservado solo si los renders no empeoraban. Los pesos publicados proceden de un anneal de 600 muestras en el que la tasa de aprendizaje se lleva a cero sobre datos ya entrenados, de modo que los pesos finales son los pesos de entrenamiento en reposo y no un promedio móvil. Los sigmas de despliegue empleados son los propios de Turbo, `[1.0, 0.7595]`, con guidance 0.0 y sampler Euler estándar.

## Capacidades

- Generación de texto a imagen en 2 pasos de denoising, partiendo de Krea 2 Turbo y sus sigmas de despliegue originales.
- Destilación de pasos: reduce el coste de denoising a una cuarta parte (8 a 2 pasos) con un objetivo de distribution matching.
- Soporte de 12 resoluciones entrenadas, multi-aspecto, desde 512×512 hasta 1440×1440.
- Compatibilidad directa con diffusers, ComfyUI y MLX sin nodos ni samplers personalizados.
- Preservación de detalle fino cercana al profesor: 0,92–1,02× la energía de textura fina del profesor en las 12 resoluciones entrenadas (Turbo original a 2 pasos: 0,40–0,65×).
- Bandas de rejilla de 16 y 8 píxeles al nivel del profesor, y ghosting más cercano al profesor en 11 de 12 tamaños.
- Fidelidad de color cercana a la del profesor.
- Aderencia al prompt condicionada en todo el proceso, con 1 punto de diferencia sobre 352 en una rúbrica ciega de objetos, recuentos, atributos y relaciones.
- No incluye tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio: es un adaptador exclusivamente de texto a imagen.

## Casos de uso

- Previsualización rápida en interfaces de generación: el adaptador permite mostrar un borrador en 14,3 s a 1024×1024 en lugar de 56,9 s, lo que agiliza la iteración de prompts en herramientas interactivas antes de lanzar el render final con el modelo base o el LoRA de 4 pasos.
- Exploración de variaciones de prompt a gran escala: al reducir el coste de denoising a una cuarta parte, se pueden generar muchas más muestras por unidad de tiempo para comparar estilos, composiciones o atributos antes de seleccionar las mejores.
- Relleno de galerías y thumbnails: para miniaturas, previsualizaciones de catálogo o imágenes de baja exigencia visual, los 2 pasos son suficientes y el coste por imagen se reduce drásticamente.
- Generación de retratos y sujetos que llenan el encuadre: según el autor, los sujetos cercanos que ocupan buena parte del frame (un retrato, una figura única, un objeto de cerca) se sostienen bien a dos pasos, lo que lo hace adecuado para este tipo de encargos rápidos.
- Renders de alta resolución aprovechando el ahorro de pasos: el autor indica que el ahorro puede invertirse en resolución, de modo que renders de hasta 2048×2048 (máximo recomendado publicado por Krea) quedan al alcance con este adaptador, útil para ampliar sujetos pequeños en la escena.
- Integración en pipelines de CI/CD o pruebas automatizadas de generación: al ser un LoRA plano compatible con diffusers y ComfyUI sin nodos personalizados, se puede incorporar en tests de regresión visual o en la validación de prompts sin necesidad de infraestructura adicional.
- Prototipado de conceptos en estudios de diseño: para validar direcciones creativas con muchas iteraciones rápidas antes de comprometer cómputo en renders finales con el LoRA de 4 pasos.

## Benchmarks y rendimiento

Según la model card, el adaptador ha sido evaluado en el artículo NitroFusion2 (arXiv:2611.05648), que lo compara con otros modelos de uno y dos pasos bajo los mismos ajustes de muestreo. El autor afirma que, a 2 pasos, este LoRA obtiene las puntuaciones más altas de GenEval, DPG-Bench y OneIG en esa comparación, pero no se proporcionan los valores numéricos de dichas métricas en la información disponible. Los datos cuantitativos que sí se detallan son los siguientes:

| Metrica | Resultado reportado |
|---|---|
| Pasos de denoising | 2 (frente a 8 del profesor) |
| Tiempo de denoising a 1024×1024, float16 | 14,3 s (frente a 56,9 s del profesor); codificación de texto y decodificación VAE excluidas |
| Energía de textura fina frente al profesor | 0,92–1,02× en las 12 resoluciones entrenadas (Turbo original a 2 pasos: 0,40–0,65×) |
| Bandas de rejilla de 16 y 8 píxeles | Al nivel del profesor |
| Ghosting | Más cercano al profesor en 11 de 12 tamaños |
| Rúbrica ciega de adherencia al prompt | 1 punto de diferencia sobre 352 |
| Preferencia de juez ciego por el profesor de 8 pasos | 12 de 66 renders (el adaptador de 4 pasos: 6 de 45, sobre los 15 prompts originales) |
| GenEval, DPG-Bench, OneIG | Las puntuaciones más altas entre los modelos de 2 pasos comparados en NitroFusion2, según el autor; valores numéricos no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El adaptador añade un coste por llamada que el autor califica de dentro del ruido de medición; el consumo dominante corresponde al modelo base Krea 2 Turbo.
- GPU utilizadas en el desarrollo: una única RTX 3090 para 32 días de entrenamiento.
- Cabe en GPU de consumo: sí, según la evidencia del entrenamiento en RTX 3090; el adaptador en sí es ligero (repo de 6,5 GB incluyendo assets).
- Opciones de despliegue: diffusers, ComfyUI y MLX, con sampler Euler estándar y sin nodos ni samplers personalizados.
- Latencia: 14,3 s de denoising a 1024×1024 en float16, excluyendo codificación de texto y decodificación VAE.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Pasos | Tiempo de denoising (1024×1024, fp16) | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea2-Turbo-Distill-2step-LoRA (este) | 2 | 14,3 s | Previsualización rápida y borradores | krea-2-community-license | Hugging Face (lvladikov) |
| Krea2-Turbo-Distill-4step-LoRA | 4 | no disponible | Renders de calidad recomendados por el autor | krea-2-community-license | Hugging Face (lvladikov) |
| Krea2-Turbo-Distill-3step-LoRA | 3 | no disponible | Sucesor del proyecto, más detalle fino que el de 4 pasos según el autor | krea-2-community-license | Hugging Face (lvladikov) |
| Krea 2 Turbo (profesor) | 8 | 56,9 s | Calidad de referencia | krea-2-community-license | Hugging Face (krea/Krea-2-Turbo) |

En la comparación de NitroFusion2, el autor sitúa a este LoRA por delante de otros modelos de uno y dos pasos en GenEval, DPG-Bench y OneIG, pero no se dispone de los valores numéricos ni de la lista completa de modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Está diseñado como adaptador de previsualización rápida, no como sustituto del modelo base para renders finales. El propio autor recomienda el LoRA de 4 pasos cuando la calidad prima sobre la velocidad.
- Los sujetos pequeños son su punto débil: caras en multitudes o figuras en escenas amplias pueden salir con ghosting o emborronadas a dos pasos.
- Un juez ciego prefiere el profesor de 8 pasos en 12 de 66 renders, principalmente por diferencias de estilo.
- Por encima de 2048×2048, el propio Krea 2 original empieza a duplicar sujetos, con o sin este adaptador.
- Riesgo de alucinación visual y de desviación del prompt inherente a los modelos de difusión; la rúbrica ciega reportada deja 1 punto de diferencia sobre 352, pero no garantiza adherencia perfecta.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: se distribuye bajo la krea-2-community-license, que no es una licencia open source estándar; es imprescindible revisar el PDF de la licencia antes de cualquier uso comercial.
- Idiomas soportados: no disponibles.
- El proyecto se declara cerrado con este checkpoint; su sucesor es el LoRA de 3 pasos, por lo que no cabe esperar nuevas actualizaciones de este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-2step-LoRA
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- LoRA de 4 pasos: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA
- LoRA de 3 pasos: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-3step-LoRA
- Artículo NitroFusion2: https://arxiv.org/abs/2611.05648
- Pesos de NitroFusion2: https://huggingface.co/ChenDY/NitroFusion2
- Licencia (PDF): https://huggingface.co/lvladikov/Krea2-Turbo-Distill-2step-LoRA/blob/main/LICENSE.pdf
