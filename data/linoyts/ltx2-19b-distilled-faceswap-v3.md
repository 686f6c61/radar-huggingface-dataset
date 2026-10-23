# linoyts/ltx2-19b-distilled-faceswap-v3

## Resumen

`linoyts/ltx2-19b-distilled-faceswap-v3` es un punto de control de difusión publicado en HuggingFace Hub por el usuario linoyts el 3 de marzo de 2026, empaquetado con la librería `diffusers` y pesos en formato `safetensors`. El dato objetivo más relevante es su tamaño: 18.876.174.592 parámetros (≈18,9 mil millones), lo que lo sitúa en la gama alta de los modelos generativos abiertos y explica que el repositorio ocupe 37,8 GB (prácticamente el equivalente exacto a los pesos en bf16/fp16, 2 bytes por parámetro).

El nombre del repositorio sugiere tres cosas que la model card no confirma: que deriva de un modelo base de la familia LTX-2, que es una versión destilada (menos pasos de muestreo) y que está especializado en intercambio de rostros (*faceswap*) en su tercera iteración. Conviene tratar estas tres afirmaciones como inferencias a partir de la nomenclatura, no como especificaciones verificadas: la model card es la plantilla automática de `diffusers` y no contiene ni una sola sección rellenada por el autor.

Su relevancia ahora mismo es doble. Por un lado, ocupa una franja poco poblada: modelos de difusión abiertos de casi 19B parámetros especializados en edición facial sobre vídeo o imagen. Por otro, su estado de documentación es un caso de estudio de por qué conviene inspeccionar los archivos antes de desplegar: sin licencia declarada, sin pipeline declarado y sin datos de entrenamiento, cualquier uso en producción exige una auditoría técnica y legal previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la documenta y el campo `pipeline_tag` está vacío) |
| Parámetros totales | 18.876.174.592 (≈18,9 B), dato leído de los safetensors |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible; en un modelo de difusión no hay ventana de contexto de tokens al uso |
| Tipos de cuantización | No disponibles. Solo se publican safetensors en precisión nativa (bf16/fp16); no hay GGUF, ONNX ni variantes fp8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (campo ausente en el repositorio) |
| Formato de pesos | `safetensors` (librería `diffusers`) |

Metadatos del repositorio:

| Dato | Valor |
|---|---|
| ID | `linoyts/ltx2-19b-distilled-faceswap-v3` |
| Autor | linoyts |
| Tamaño del repositorio | 37,8 GB |
| Descargas | 63 |
| Likes | 70 |
| Pipeline declarado | No disponible |
| Tags | `diffusers`, `safetensors`, `arxiv:1910.09700`, `region:us` |
| Fecha de creación | 2026-03-03T10:10:42Z |
| Última actualización | 2026-03-03T10:14:05Z |

Nota sobre el tag `arxiv:1910.09700`: corresponde a Lacoste et al. (2019), el artículo del calculador de impacto medioambiental de ML Learning Impact, que aparece citado en la plantilla por defecto de las model cards. No es un artículo sobre este modelo y no debe citarse como referencia técnica del mismo.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura. La model card es la plantilla automática generada por `diffusers` al subir el modelo, con todos los apartados marcados como `[More Information Needed]`, incluidos los de arquitectura, objetivo de entrenamiento, datos, hiperparámetros e infraestructura de cómputo. El campo `pipeline_tag` está vacío, de modo que ni siquiera se declara a qué clase de pipeline de `diffusers` corresponde (texto-a-vídeo, imagen-a-vídeo, edición, etc.).

Lo único deducible con rigor son las consecuencias del recuento de parámetros: 18,9 B en 37,8 GB implica pesos en 16 bits sin cuantizar y sin componentes adicionales de gran tamaño en el repositorio. El sufijo `distilled` de la nomenclatura suele indicar en la práctica una reducción del número de pasos de muestreo respecto al modelo base, y `faceswap` apunta a un ajuste fino condicionado por identidad facial, pero ninguno de los dos extremos está documentado. Tampoco consta si hubo RLHF, DPO, destilación por trayectorias o simple fine-tuning supervisado, ni el volumen de tokens o de pares vídeo-texto utilizados.

## Capacidades

- Generación y edición de contenido visual: por el nombre del repositorio, la función declarada es el intercambio de rostros (*faceswap*), presumiblemente sobre imagen o vídeo. No está confirmado en la documentación.
- Variante destilada: se infiere del sufijo `distilled` una inferencia con menos pasos, aunque no se publica el número objetivo de steps ni el sampler recomendado.
- Integración con `diffusers`: el modelo se carga mediante la librería, lo que permite encadenarlo con schedulers, textual inversions y el resto del ecosistema.
- Condicionamiento por identidad: es de esperar que acepte una o varias imágenes de referencia facial, pero la firma exacta del pipeline es desconocida.
- Soporte de *tool calling* / *function calling*: no aplica; no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible; la entrada textual, si existe, dependería de un codificador de texto no declarado.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles de un modelo de *faceswap* de esta escala, pero deben validarse contra el comportamiento real del punto de control antes de comprometer recursos:

- Postproducción audiovisual y doblaje: sustituir el rostro del actor original por el del actor de doblaje en planos medios y primeros planos, con 18,9 B de parámetros y pesos sin cuantizar para maximizar el detalle en la piel y la coherencia temporal entre fotogramas.
- Localización de contenido para distribución internacional: adaptar campañas publicitarias o series a mercados locales sustituyendo el rostro del intérprete sin regrabar, siempre que la licencia (hoy desconocida) lo permita.
- Previsualización de VFX en cine: generar *previz* de alta fidelidad antes de rodar, de modo que el equipo de dirección valore la elección de casting o el encuadre sin coste de maquillaje ni de posproducción pesada.
- Anonimización y protección de testigos: sustituir rostros identificables en material grabado por identidades sintéticas antes de publicarlo, aprovechando la resolución del modelo frente a difuminados que degradan la validez del metraje.
- Creación de avatares digitales para formación corporativa: producir vídeos de instructores virtuales a partir de un número reducido de imágenes de referencia, con coherencia entre planos.
- Aumento de datos para entrenamiento de sistemas de reconocimiento facial: generar variaciones controladas de identidad e iluminación para robustecer modelos de verificación, con la advertencia ética y legal correspondiente.
- Prototipado rápido en estudios pequeños: sustituir pipelines propietarios de *faceswap* por un modelo abierto ejecutable en una sola GPU de 80 GB, sin dependencia de API externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de generación (FID, FVD, SSIM, LPIPS, identidad facial con ArcFace o similares), ni comparaciones con otros sistemas de *faceswap*, ni datos de latencia o throughput. Tampoco hay resultados de evaluaciones subjetivas.

## Requisitos de hardware

- VRAM para los pesos: a 16 bits, 18.876.174.592 parámetros ocupan ≈37,75 GB, lo que coincide con el tamaño del repositorio (37,8 GB). Cargar el modelo completo exige más de 38 GB de VRAM solo para los pesos.
- VRAM real de inferencia: hay que sumar codificadores de texto, VAE o decoder y activaciones. Los requisitos no están documentados; en la práctica, un modelo de esta familia suele necesitar 48-80 GB según resolución y número de fotogramas.
- GPU de datacenter recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB (muy justo) o H200. Con A100 40 GB es necesario repartir el modelo entre varias GPU o usar *offloading* a CPU.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar los pesos en fp16. Sería necesario cuantizar a 8 bits (≈19 GB) o a 4 bits (≈9,5 GB), añadiendo después el resto de componentes, con degradación de calidad no evaluada. Alternativa: *pipeline* con *offloading* secuencial a RAM, a costa de latencia muy alta.
- Opciones de despliegue: la vía natural es `diffusers` sobre PyTorch. vLLM y TGI no aplican (no es un modelo de lenguaje). llama.cpp y Ollama no son utilizables directamente mientras no se publiquen pesos GGUF, que hoy no existen en el repositorio. Para servir en producción, conviene exportar a un backend de difusión (por ejemplo, TensorRT o un servidor dedicado de difusión) tras validar la arquitectura.
- Latencia y throughput: no disponibles. Cualquier estimación sería especulativa al desconocerse el número de pasos de muestreo, la resolución y la tarea exacta.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada, ni de resultados de rendimiento de este punto de control que permitan un emparejamiento justo. La tabla siguiente recoge únicamente los datos confirmados del modelo y deja el resto como no disponible.

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `linoyts/ltx2-19b-distilled-faceswap-v3` | 18,9 B | No disponible | No disponible | Pesos safetensors en el Hub, 63 descargas | Especializado en *faceswap* según el nombre; sin documentación |
| Alternativa A (misma categoría) | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |
| Alternativa B (misma categoría) | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |
| Alternativa C (misma categoría) | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

A modo cualitativo, la comparación relevante sería contra otros modelos abiertos de difusión para edición facial y contra el modelo base del que deriva esta destilación; ninguno de los dos conjuntos de datos está disponible aquí.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial. En la práctica, esto bloquea el despliegue en producto hasta contactar con el autor.
- Documentación inexistente: la model card es una plantilla automática. No se conocen la arquitectura, los datos de entrenamiento, los hiperparámetros ni el pipeline de `diffusers` que debe instanciarse.
- Riesgo de alucinación visual: como todo modelo generativo facial, puede producir artefactos, inconsistencias de identidad entre fotogramas y texturas irreales en perfiles, oclusiones o iluminación extrema. No hay métricas publicadas que cuantifiquen este riesgo.
- Sesgos probables y no auditados: los modelos de *faceswap* entrenados con datasets no documentados tienden a funcionar peor en tonos de piel oscuros, rasgos no europeos, edades extremas y personas con gafas o barba. Sin datos de entrenamiento no es posible evaluar la representatividad.
- Implicaciones legales y éticas graves: la suplantación de identidad facial está regulada en la Unión Europea por el Reglamento de IA (obligación de etiquetar contenido sintético) y por normativa de protección de datos. El uso sobre personas sin consentimiento explícito puede ser ilícito.
- Sin cuantizaciones publicadas: no hay GGUF, ONNX ni fp8, lo que limita el despliegue en hardware de consumo y en entornos con VRAM restringida.
- Adopción muy temprana: 63 descargas y creación y actualización en la misma fecha (3 de marzo de 2026, con cuatro minutos de diferencia) indican que el repositorio no ha pasado por una revisión comunitaria. No hay issues, demos ni validaciones de terceros.
- Reproducibilidad: al desconocerse el código de entrenamiento y los datos, no es posible reproducir ni auditar el modelo.
- Tag de artículo engañoso: `arxiv:1910.09700` remite al calculador de emisiones de CO2, no a un artículo sobre el modelo; no debe usarse como referencia técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/linoyts/ltx2-19b-distilled-faceswap-v3
- Perfil del autor: https://huggingface.co/linoyts
- Documentación de la librería `diffusers`: https://huggingface.co/docs/diffusers
- Artículo citado en el tag (calculador de impacto de carbono en ML, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculador de impacto medioambiental referenciado en la plantilla: https://mlco2.github.io/impact
- Repositorio, artículo, demo y contacto del modelo: no disponibles en la información proporcionada.
