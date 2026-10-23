# infosave/MOSS-Image-Base-cmf

## Resumen

MOSS-Image-Base CMF es un empaquetado alternativo, en un único fichero, del modelo de generación de imágenes texto-a-imagen OpenMOSS-Team/MOSS-Image-Base. No lo publica el equipo original (OpenMOSS-Team), sino el usuario `infosave`, y está pensado exclusivamente para el runtime en Rust `cortiq` (formato CMF). El paquete congela la revisión `85975793d8b3d432f1b6e27f352abaa4c2a4c0d3` del modelo base y distribuye dos perfiles de precisión: `q8_2f` (12,346 GiB, orientado a calidad) y `q4tp` (10,111 GiB, orientado a reducir la huella de memoria del DiT).

La ruta de inferencia empaquetada es la de texto-a-imagen con prompt de cadena: un codificador de texto denso híbrido Qwen3.5 con su tokenizador y plantilla de chat, un transformer de difusión denominado MOSSImageTransformer de 42 capas (ancho 3072, 24 cabezas, FFN de 8192) y un decodificador FLUX.2 AutoencoderKLFlux2. El paquete excluye deliberadamente la torre visual de Qwen y la ruta de codificación Flux2/VAE (incluidos los pesos `quant_conv` del codificador), porque esta ruta concreta no las invoca.

Su relevancia es de nicho: permite ejecutar el modelo base sin Python ni `diffusers`, con verificación de integridad SHA-256 y control fino de precisión por componente. A cambio, limita el alcance a generación desde texto (sin imagen de entrada, sin edición píxel a píxel, sin vídeo) y exige Cortiq v0.8.31 o superior. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño total del repo es de 24,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión texto-a-imagen: codificador de texto Qwen3.5 (denso híbrido) + MOSSImageTransformer (DiT, 42 capas, ancho 3072, 24 cabezas, FFN 8192) + decodificador FLUX.2 AutoencoderKLFlux2 |
| Parámetros totales | no disponible (el autor no declara el recuento; la geometría del DiT, 42 capas × ancho 3072 × FFN 8192, sitúa el bloque de difusión en torno a 3.700 M de parámetros como estimación derivada, no confirmada) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta la ventana del codificador de texto Qwen3.5 empaquetado) |
| Tipos de cuantización | Perfiles mixtos CMF: `q8_2f` (calidad, 12,346 GiB) y `q4tp` (menor huella del DiT, 10,111 GiB); la precisión se elige por componente y por grupo de tensores |
| Idiomas soportados | `en`, `zh` |
| Licencia | apache-2.0 |
| Formato de pesos | `.cmf` (fichero único nativo del runtime Rust `cortiq`); no se distribuyen safetensors ni GGUF |

Artefactos publicados:

| Artefacto | Tamaño | SHA-256 |
|---|---:|---|
| `moss-image-base-q8_2f.cmf` | 13.256.239.565 bytes (12,346 GiB) | `f4dd15a29b58bf6185f5018b40614a65b7ade33e2617339d327f5dc1c6f38e11` |
| `moss-image-base-q4tp.cmf` | 10.856.278.477 bytes (10,111 GiB) | `c6250b2bab153a0a0b9f6c774ea77fc4a80d472e12b9a48d3d498a825b94f8dd` |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura del modelo base sin modificarla: un codificador de texto Qwen3.5 (descrito en la model card como "denso híbrido") con tokenizador y plantilla de chat embebidos, un transformer de difusión MOSSImageTransformer de 42 capas con anchura 3072, 24 cabezas de atención y FFN de anchura 8192, y una ruta de decodificación FLUX.2 AutoencoderKLFlux2. La generación usa Flow Matching con integrador Euler; la receta de calidad embebida es 1024 × 1024, 50 pasos, CFG 3, shift 5, prompt negativo vacío y omisión de la rama negativa en la capa 22 del DiT (indexación desde cero). Anchura y altura deben ser múltiplos positivos de 16.

El runtime aplica residencia por etapas: carga el codificador de texto, después el DiT y por último el decodificador, liberando la etapa anterior antes de residentar la siguiente. Esa decisión reduce el pico de memoria respecto a una carga simultánea de todos los componentes. El empaquetado omite explícitamente la torre visual de Qwen y la ruta de codificación Flux2/VAE, incluidos los pesos `quant_conv` del lado codificador, porque la ruta texto-a-imagen observada no los invoca; el autor lo describe como una decisión de alcance y no como una afirmación de que esos componentes sobren en todos los flujos upstream.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO o etapas de ajuste por preferencias, ni para el modelo base ni para este reempaquetado. Tampoco se detalla el esquema completo de precisión mixta: la model card se interrumpe en la sección "Precision profiles", donde solo se indica que CMF permite elegir precisión de forma independiente por componente y grupo de tensores, con perfiles deliberadamente mixtos en lugar de una única precisión uniforme.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de descripciones en lenguaje natural, en inglés y chino.
- Soporte de prompts por etiquetas (tag sequences), además del texto libre.
- Soporte de prompt de layout en JSON crudo para colocación de texto y disposición de objetos, con los campos `summary.caption`, `items`, `bbox_format: "yxyx"` y `bbox_coord_space: "abs_centralized"`.
- Control de dimensiones de salida (múltiplos de 16) y de parámetros de muestreo: pasos, CFG, shift y prompt negativo.
- Dos perfiles de precisión seleccionables (`q8_2f` y `q4tp`) con distinta fidelidad y huella de memoria.
- Verificación de integridad del artefacto mediante SHA-256 publicado y el comando `cortiq verify`.
- No soporta imagen de entrada: no hay `--image`, ni img2img, ni edición en espacio de píxeles, ni flujos con imagen de referencia, ni vídeo.
- No se documentan tool calling, function calling ni capacidades de agente; es un modelo generativo de imagen, no un LLM conversacional.
- El flujo de mejora de prompts (prompt enhancer) que produce captions detalladas y JSON de layout existe solo como herramienta Python upstream, no como funcionalidad del CLI de CMF.

## Casos de uso

- Cartelería y pósteres con texto posicionado: usando el prompt de layout JSON se puede fijar el texto principal y las cajas de los objetos (`bbox_format: "yxyx"`, `bbox_coord_space: "abs_centralized"`) y regenerar la imagen tras editar el JSON, lo que encaja en la producción de variantes de cartel a 1024 × 1024 con unas 50 iteraciones.
- Generación de ilustraciones planas y material editorial: el ejemplo de la propia model card (fondo crema, montaña azul, título "EXPLORE") muestra el tipo de composición minimalista con capas de texto que el modelo resuelve bien con la receta de calidad indicada.
- Prototipado rápido de concepto visual en pipelines Rust: al ser un único fichero `.cmf` con tokenizador, plantilla, scheduler y configuración embebidos, elimina la dependencia de Python y `diffusers` en servicios ya escritos en Rust, con verificación de integridad en el arranque del contenedor.
- Pruebas de humo funcionales en CI: el autor indica que resoluciones bajas y menos pasos sirven para validar que el pipeline responde, reservando la receta de 50 pasos y ~1-2 millones de píxeles para las comprobaciones de calidad.
- Despliegue con restricción de memoria: `q4tp` reduce la huella del DiT (10,111 GiB frente a 12,346 GiB) para entornos donde el perfil de calidad no es prioritario, evaluando previamente la degradación con los prompts reales del producto.
- Generación de fondos e imágenes de relleno para aplicaciones en inglés o chino: el soporte bilingüe declarado cubre interfaces y prompts en esos dos idiomas, con texto incrustado en la imagen mediante el layout JSON.
- Reproducción determinista de un lote de imágenes: la combinación de artefacto verificado por SHA-256, receta fija (50 pasos, CFG 3, shift 5, capa 22) y fichero único facilita que distintos nodos generen con exactamente los mismos pesos y configuración.
- Evaluación comparativa de cuantizaciones: el par `q8_2f`/`q4tp` permite medir el impacto de la precisión mixta sobre la fidelidad visual manteniendo el mismo modelo base y la misma receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas objetivas (FID, CLIP score, GenEval, etc.) ni comparaciones numéricas con otros modelos. Solo se aportan datos operativos: tamaños de artefacto, valores SHA-256 y la receta de muestreo recomendada.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia de tamaño, `q8_2f` ocupa 12,346 GiB y `q4tp` 10,111 GiB en disco; el pico en VRAM depende de la etapa residente más grande (la residency por etapas libera codificador de texto, DiT y decodificador de forma secuencial), por lo que el pico es inferior a la suma de componentes, pero no se documenta cuánto.
- GPU de 16 GB o más (RTX 4080/4090, RTX 5070 Ti, A4000, L4): escenario razonable para `q8_2f` con margen para el contexto de activaciones, como estimación y no como requisito confirmado.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070): candidata para `q4tp`, con margen ajustado; conviene validar antes de producción.
- GPU de datacenter (A100 40/80 GB, H100, L40S): no son necesarias por tamaño, pero aportan throughput si se generan lotes a 1024 × 1024 y 50 pasos.
- Opciones de despliegue: únicamente el runtime `cortiq` (Rust) en versión v0.8.31 o superior, invocado como `cortiq imagine`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión en formato `.cmf`.
- Latencia y throughput: no disponibles. La única indicación operativa es que bajar de 50 pasos o de ~1-2 millones de píxeles acelera la generación, a costa de calidad.
- Almacenamiento: 24,1 GB para el repo completo con ambos artefactos; ~12,4 GiB o ~10,1 GiB si solo se descarga uno.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño distribuido | Contexto / resolución | Licencia | Notas |
|---|---|---:|---|---|---|
| `infosave/MOSS-Image-Base-cmf` (`q8_2f`) | `.cmf` (Cortiq) | 12,346 GiB | 1024 × 1024 recomendado; 50 pasos | apache-2.0 | Perfil de calidad; solo texto-a-imagen; requiere Cortiq ≥ v0.8.31 |
| `infosave/MOSS-Image-Base-cmf` (`q4tp`) | `.cmf` (Cortiq) | 10,111 GiB | 1024 × 1024 recomendado; 50 pasos | apache-2.0 | Menor huella del DiT; el autor advierte de no asumirlo visualmente intercambiable con `q8_2f` |
| `OpenMOSS-Team/MOSS-Image-Base` (upstream) | Pesos originales (formato no detallado en la información disponible) | no disponible | no disponible | apache-2.0 (según el campo `license` del reempaquetado) | Modelo de referencia; incluye torre visual de Qwen y ruta de codificación Flux2/VAE que el CMF omite; flujos con imagen, edición y referencia no están soportados por el CMF |
| Alternativas de la misma categoría (FLUX.2, Qwen-Image u otras) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada; no se comparan cifras para no inventarlas |

La comparación relevante aquí es de empaquetado, no de calidad: el CMF y el modelo upstream comparten pesos, pero el CMF recorta la ruta de codificación y limita los flujos soportados a cambio de un fichero único, verificación de integridad y residency por etapas.

## Limitaciones y advertencias

- Alcance funcional recortado: no hay entrada de imagen, img2img, edición en espacio de píxeles, imagen de referencia ni vídeo. El propio autor lo advierte de forma explícita.
- Edición de layout no es edición de imagen: modificar `summary.caption`, `items` o las cajas del JSON genera una imagen nueva desde cero, no modifica píxeles existentes.
- Dependencia de versión: el soporte nativo de MOSS texto-a-imagen, incluidos `--layout` / `--layout-file`, exige Cortiq v0.8.31 o superior; versiones anteriores no sirven para esta ruta.
- Dependencia de runtime único: el formato `.cmf` solo lo consume `cortiq`; no hay interoperabilidad con `diffusers`, ComfyUI u otros ecosistemas sin conversión, y no se documenta herramienta de conversión.
- Reempaquetado de terceros: el artefacto lo publica `infosave`, no OpenMOSS-Team. Conviene verificar el SHA-256 y ejecutar `cortiq verify` antes de usar, y confirmar por separado la licencia del modelo base en su repositorio original.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otras lenguas, lo que afecta a prompts y, sobre todo, al texto renderizado en imagen.
- Riesgo de alucinación visual y de texto: no se publican métricas de fidelidad ni de precisión de texto renderizado; el texto incrustado mediante layout JSON puede salir deformado o mal ubicado.
- Sesgos: no se documenta ningún análisis de sesgos del modelo base ni del empaquetado; se desconoce la composición del dataset de entrenamiento.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni informes de terceros que permitan estimar robustez en producción.
- La model card está incompleta en la sección de perfiles de precisión (el texto se corta), por lo que no se conoce la asignación exacta de precisión por componente en `q8_2f` ni en `q4tp`.
- El prompt enhancer upstream no forma parte del CLI; quien lo necesite debe mantener un flujo Python aparte.

## Enlaces

- Repositorio HuggingFace del empaquetado: https://huggingface.co/infosave/MOSS-Image-Base-cmf
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Revisión exacta empaquetada: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base/tree/85975793d8b3d432f1b6e27f352abaa4c2a4c0d3
- Runtime Cortiq (Rust, formato CMF): https://github.com/infosave2007/cmf

Nota sobre la búsqueda web: los resultados devueltos no guardan ninguna relación con este modelo (son páginas de cómics para adultos) y se han descartado por no ser fuentes válidas. No se han encontrado papers, blogs ni demos adicionales del modelo en la información proporcionada.
