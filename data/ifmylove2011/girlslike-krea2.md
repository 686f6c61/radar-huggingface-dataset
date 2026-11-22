# ifmylove2011/girlslike-krea2

## Resumen

GirlsLike-Krea2 es un adaptador LoRA (en concreto, un LoKR de rango completo según su autor) para los modelos de generación de imágenes Krea-2, publicado por el usuario ifmylove2011 en Hugging Face. Su función es inyectar en el modelo base la capacidad de generar retratos de personas concretas a partir de una palabra de activación (trigger word), normalmente el nombre propio de la persona en chino o en inglés. No es un modelo fundacional autónomo: requiere cargarse sobre krea/Krea-2-Raw o krea/Krea-2-Turbo mediante la librería diffusers.

El repositorio tiene un tamaño de 6,7 GB y acumula 44.500 descargas y 170 likes, lo que lo sitúa entre los adaptadores de personaje más populares del ecosistema Krea-2. El autor lo presenta explícitamente como un experimento de prueba personal, orientado a evaluar el entrenamiento de LoKR/LoRA sobre Krea-2 Raw en cuantización int8, y advierte de que los resultados reflejan únicamente su criterio estético.

La relevancia actual del adaptador radica en que demuestra la viabilidad de entrenar LoKR de rango completo sobre Krea-2 con material de entrenamiento de calidad desigual, obteniendo un equilibrio razonable entre generalización, detalle y similitud facial. El pipeline declarado es text-to-image y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoKR (LoRA de rango completo, según el autor) sobre modelo de difusión Krea-2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | El adaptador se entrena sobre Krea-2 Raw int8; los ejemplos usan Krea-2 Turbo fp8 |
| Idiomas soportados | no disponible (prompts en inglés recomendados; comprensión parcial de chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato diffusers; repo de 6,7 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoKR, una variante de bajo rango basada en descomposición de Kronecker, entrenado sobre Krea-2 Raw en cuantización int8. El autor indica que optó por rango completo tras probar varias configuraciones, buscando un equilibrio entre generalización, fidelidad de detalle y similitud con la persona objetivo, y señala que este enfoque funciona mejor cuando el material de entrenamiento no es de alta calidad. El repositorio incluye pesos para los dos modelos base declarados (Krea-2-Raw y Krea-2-Turbo), de modo que el adaptador puede aplicarse teóricamente sobre cualquiera de ellos.

No se especifican en la información disponible el número de imágenes de entrenamiento, el número de pasos, la resolución de entrenamiento ni si se aplicaron técnicas de regularización o captions automáticos. El autor menciona que incorpora el nombre real de cada personaje como palabra de activación, sin prefijos ni sufijos, y que las imágenes de ejemplo se generaron con Krea-2 Turbo fp8 a 8 pasos, sampler euler con beta/beta57, CFG 1, fuerza de LoRA 1.0 y resolución 960x1280.

## Capacidades

- Generación text-to-image de retratos de personas concretas mediante palabra de activación (nombre propio).
- Compatible con los modelos base Krea-2-Raw y Krea-2-Turbo; el autor recomienda intensidades de LoRA entre 0,8 y 1,5.
- Buen rendimiento en planos medios y primeros planos; el parecido se degrada en planos generales y a resoluciones de aproximadamente 1 MP, mejorando al aumentar la resolución.
- Seguimiento de prompts en inglés superior al de prompts en chino; cierta comprensión de conceptos específicos del chino, aunque con errores conocidos (por ejemplo, "melocotón" representado como manzana).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un adaptador de difusión para imagen.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Generación de retratos de personaje consistente: cargando el LoRA sobre Krea-2 Turbo fp8 con la palabra de activación del nombre, se obtienen retratos del sujeto en distintos encuadres y estilos, útil para ilustración editorial o ficción.
- Prototipado de personajes para narrativa visual: el adaptador permite mantener la identidad facial de un personaje a lo largo de una serie de imágenes, aunque con limitaciones en planos generales.
- Pruebas de pipelines de difusión con LoKR: sirve como referencia técnica para evaluar el entrenamiento de LoKR de rango completo sobre Krea-2 en int8, comparando configuraciones de fuerza e inferencia.
- Generación de material de referencia para artistas: producción rápida de variaciones de un rostro concreto para usar como base de bocetos o estudios de iluminación.
- Investigación sobre sesgos y fidelidad de adaptadores de personaje: el repositorio y su galería de ejemplos permiten analizar cómo se comporta el parecido según resolución, plano y fuerza del LoRA.
- Integración en flujos de trabajo con diffusers: al ser un adaptador estándar, puede cargarse mediante `load_lora_weights` en scripts de Python y combinarse con otros adaptadores, aunque el autor indica que los ejemplos se generaron sin LoRAs adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 6,7 GB en disco, pero el requisito real de VRAM lo determina el modelo base Krea-2, no el LoRA.
- El autor genera los ejemplos con Krea-2 Turbo fp8 a 960x1280 y 8 pasos, configuración que reduce los requisitos frente a fp16.
- VRAM estimada para inferencia: no disponible de forma explícita; depende de la cuantización del modelo base (fp8 o int8 reducen el consumo frente a fp16).
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del base y el uso de fp8, se sitúa en el rango de GPUs de gama alta, sin datos concretos confirmados.
- Opciones de despliegue: diffusers (librería declarada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles; el autor solo indica 8 pasos de muestreo con euler + beta/beta57 y CFG 1.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GirlsLike-Krea2 | LoKR de personaje | Krea-2-Raw / Krea-2-Turbo | no disponible | no aplica | Apache 2.0 | Hugging Face, 44.500 descargas |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre adaptadores comparables de la misma categoría (LoRA de personaje para Krea-2) en los datos proporcionados.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo es un experimento de prueba y que los resultados reflejan solo su criterio estético personal.
- El parecido facial es aceptable en planos medios y primeros planos, pero deficiente en planos generales y a resoluciones cercanas a 1 MP; mejora al aumentar la resolución.
- Con intensidades de LoRA superiores a 2,0 aparecen deformaciones faciales evidentes; el rango recomendado es 0,8-1,5.
- El seguimiento de prompts en chino es limitado y presenta errores semánticos conocidos (por ejemplo, confundir "melocotón" con manzana); el inglés funciona mejor.
- Riesgo de alucinación visual y de artefactos anatómicos inherente a los modelos de difusión, no cuantificado en la información disponible.
- Uso previsto exclusivamente para pruebas; el autor prohíbe explícitamente su uso para suplantación de identidad, engaño u otros fines inapropiados.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el uso de la imagen de personas reales puede estar sujeto a derechos de imagen y a la legislación aplicable, aspecto no cubierto por la licencia.
- No se documentan sesgos demográficos ni de otro tipo; la información disponible no permite evaluarlos.

## Enlaces

- Hugging Face: https://huggingface.co/ifmylove2011/girlslike-krea2
- Galería de abreviaturas de nombres (app): https://huggingface.co/spaces/ifmylove2011/girlslike_lora_gallery/blob/main/app.py
- Fuente de prompts citada por el autor (Civitai): https://civitai.com/models/2231696
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
