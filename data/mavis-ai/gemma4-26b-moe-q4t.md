# mavis-ai/Gemma4-26B-MoE-Q4T

## Resumen

mavis-ai/Gemma4-26B-MoE-Q4T es una cuantización data-free del checkpoint multimodal google/gemma-4-26B-A4B-it, publicada por mavis-ai (mavis-ai.co.jp) el 2 de octubre de 2026. No es un fine-tune: no se aplicó ningún tipo de entrenamiento, solo un receta de cuantización fija denominada Q4T que asigna un ancho de bits por clase de módulo. El resultado es un artefacto de 15,65 GB (14,6 GiB) que comprime los 128 expertos enrutados del modelo base a 4 bits mediante códigos trellis.

Su relevancia es doble. Por un lado, reduce el peso del modelo base (26B totales, ~4B activos, 30 capas, hidden size 2816) hasta un rango manejable en memoria unificada de Apple silicon. Por otro, introduce un formato de pesos propietario: los expertos enrutados se almacenan como tensores trellis (`.trellis`, `.suh`, `.svh`) que exigen un decodificador específico, por lo que el modelo no funciona en `mlx-lm`, `mlx-vlm`, `transformers` ni vLLM, y queda atado al motor de inferencia de R.E.V.I.S. v1.3.0 o posterior.

El repositorio incluye además tres drafters de decodificación especulativa (MTP Draft-Q8 con su ProposalHead, y DFlash-Q8, 1,11 GB en total) y conserva intactos en BF16 los routers, las normas, la torre de visión y la proyección multimodal. Está pensado para R.E.V.I.S., un "Cognitive OS" local para IA multiagente en Mac.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (base: Gemma 4 26B A4B; 30 capas, hidden size 2816, 128 expertos enrutados con 8 activos) |
| Parametros totales | 9.237.780.046 (recuento de safetensors del repositorio; el modelo base se denomina 26B) |
| Parametros activos | ~4.000 millones según la nomenclatura A4B del modelo base; desglose exacto tras la cuantización: no disponible |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Q4T: expertos enrutados a 4 bits trellis (K4), resto lineal a 6 bits affine con group size 64 (N6), routers y visión en BF16, caché KV en runtime a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | safetensors; expertos enrutados en tensores trellis-coded con side vectors `suh`/`svh` y decodificador propio |
| Tamano de pesos | 15,65 GB decimales / 14,6 GiB (la tabla interina de benchmarks cita 15,64 GB) |
| Drafters incluidos | MTP Draft-Q8 (0,45 GB) + ProposalHead (0,12 GB) + DFlash-Q8 (0,50 GB); 1,11 GB en total |
| Tamano del repositorio | 16,8 GB |
| Libreria | trellis |
| Fecha de publicacion | 2 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 26B A4B: un transformer disperso (MoE) multimodal de 30 capas, hidden size 2816, 128 expertos enrutados de los que se activan 8 por token y 262.144 tokens de contexto. La adaptación de mavis-ai no toca la topología: modifica únicamente la representación numérica de los pesos.

La receta Q4T pertenece a la familia T (Q5T, Q4T, Q3T), definida como fija y data-free: un ancho por clase de módulo, elegido por regla escrita y no por inspección de datos de evaluación. Los expertos enrutados se codifican como códigos trellis en teselas de 16x16 (4 bits por peso, codebook MCG), con rotación Hadamard de 128 puntos y vectores de signo por canal (`suh`, `svh`); la codificación minimiza el MSE sobre los pesos rotados y no emplea conjunto de calibración, redondeo Hessian, matriz de importancia ni entrenamiento consciente de cuantización. El ancho de experto 704 no es múltiplo de 128, así que se almacena con padding hasta 768. El resto de capas lineales (proyecciones de atención, MLP denso y embeddings de token, con la LM head atada) se cuantizan a 6 bits affine con group size 64 mediante `mx.quantize` con redondeo al más cercano, partiendo del BF16 original. Los routers, las normas, los escalares de capa y la torre de visión con su proyección permanecen en BF16 porque la selección top-k de expertos es una decisión discontinua que no admite cuantización sin degradar la elección. Los archivos se dividen en un núcleo denso de 3,11 GB y seis archivos de expertos de 2,09 GB para que el runtime pueda mapear expertos de forma independiente; los tensores son byte-idénticos al paquete sin dividir, según `q4t-split-lineage.json`.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline declarado: `image-text-to-text`, `conversational`), con plantilla de chat incluida (`chat_template.jinja`) y `processor_config.json` para entrada multimodal.
- Entrada de imagen más texto: la torre de visión y la proyección multimodal se conservan en BF16, de modo que la cuantización no afecta a la ruta visual.
- Razonamiento y generación de código: no documentado de forma específica en la información disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: el modelo se distribuye como componente de R.E.V.I.S., un sistema multiagente local, pero no se detallan capacidades de agente propias del modelo.
- Decodificación especulativa: soportada de serie mediante los drafters MTP (con ProposalHead) y DFlash incluidos en el bundle.
- Capacidades multilingües: no disponible (el campo de idiomas está vacío).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente local privado en Mac: el modelo corre íntegramente en local dentro de R.E.V.I.S. v1.3.0 o superior, sin enviar datos a la nube, lo que encaja en escenarios con datos sensibles donde no se permite salida a Internet.
- Análisis de documentos largos: con 262.144 tokens de contexto puede procesar contratos, expedientes o bases de código extensas en una sola pasada, siempre que el Mac disponga de memoria unificada suficiente para la caché KV a 8 bits.
- Sistemas multiagente locales: R.E.V.I.S. está descrito como un "Cognitive OS" para IA multiagente; este checkpoint actúa como modelo generador dentro de esa orquestación, con los drafters MTP/DFlash reduciendo la latencia percibida en cada turno.
- Tareas imagen-texto: pipelines de descripción de imágenes, extracción de información de capturas o documentos escaneados, apoyándose en la torre de visión en BF16.
- Prototipado y evaluación de cuantización: al publicar manifiestos (`q4t_manifest.json`, `q4t_sources.json`, `q4t-split-lineage.json`) y checksums, el repositorio sirve como material de estudio para investigar codificación trellis frente a cuantización affine en modelos MoE.
- Despliegue con memoria limitada: frente a un checkpoint BF16 del modelo base, esta variante de 14,6 GiB permite mantener el modelo residente en equipos Apple silicon de gama alta, con los drafters añadiendo solo 1,11 GB.
- Investigación sobre decodificación especulativa: la combinación de un drafter MTP con proposal head y uno de bloques DFlash permite medir el impacto en aceptación y throughput dentro del motor de R.E.V.I.S.

## Benchmarks y rendimiento

La model card indica expresamente que la tabla de benchmarks definitiva aún no está disponible (aparece vacía) y que los resultados finales provendrán de una única ejecución. Los únicos datos publicados son medidas interinas de divergencia de distribución (KLD de las distribuciones de siguiente token frente a la referencia BF16 de Gemma 4 26B A4B, con teacher forcing, media sobre las posiciones puntuadas), sobre un conjunto de 48 documentos y 18.040 posiciones evaluadas.

| Arm | KLD vs BF16 (menor es mejor) | Tamano de pesos |
|---|---:|---:|
| Q8 | 0,0110 | no disponible |
| Q5T | 0,0136 | 19,36 GB |
| Q6 | 0,0268 | 21,85 GB |
| Q4T (este repositorio) | 0,0373 | 15,64 GB |
| Q5 | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de tarea en la información disponible. El autor advierte además que estas cifras de KLD son medidas sobre un conjunto pequeño y de carácter interino, superadas por la tabla de benchmarks todavía vacía.

## Requisitos de hardware

- Peso en disco de los pesos: 15,65 GB decimales (14,6 GiB); repositorio completo 16,8 GB. Drafters: 1,11 GB adicionales.
- Memoria en inferencia: a los pesos hay que sumar la caché KV en 8 bits en runtime, cuyo tamaño depende del contexto; no se publica una cifra oficial de VRAM ni de memoria unificada necesaria.
- GPU compatibles: no disponible. El modelo está orientado a Apple silicon y depende de los kernels trellis del motor de R.E.V.I.S.; no hay soporte declarado para A100, H100 ni RTX 4090.
- Compatibilidad con consumer GPU: no disponible. El autor solo confirma el funcionamiento en Apple silicon a través de R.E.V.I.S. v1.3.0 y posteriores.
- Opciones de despliegue: exclusivamente R.E.V.I.S. v1.3.0 o superior. El modelo no funciona en `mlx-lm`, `mlx-vlm`, `transformers` ni vLLM, según la propia model card.
- Latencia y throughput: no disponibles. Se incluyen drafters de decodificación especulativa (MTP y DFlash) precisamente para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de cuantizaciones T del autor, que es la única información cuantitativa disponible. No se dispone de datos de otros modelos de la misma categoría para comparar parámetros, contexto o rendimiento.

| Modelo / formato | Expertos enrutados | Denso | Tamano de pesos | KLD vs BF16 | Portabilidad |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (Full, BF16) | BF16 | BF16 | no disponible | referencia | `transformers`, MLX, vLLM (modelo base) |
| Q8 | no disponible | no disponible | no disponible | 0,0110 | no disponible |
| Q6 | no disponible | 8 bits affine g64 (N8, segun tabla de formatos) | 21,85 GB | 0,0268 | no disponible |
| Q5T | K5 (5 bits trellis) | N8 (8 bits affine g64) | 19,36 GB | 0,0136 | solo R.E.V.I.S. |
| **Q4T (este repositorio)** | **K4 (4 bits trellis)** | **N6 (6 bits affine g64)** | **15,64-15,65 GB** | **0,0373** | **solo R.E.V.I.S. ≥ 1.3.0 en Apple silicon** |
| Q3T | K3 (3 bits trellis) | N6 (6 bits affine g64) | no disponible | no disponible | solo R.E.V.I.S. |

Frente a alternativas de cuantización estándar (GGUF Q4_K_M, MLX 4-bit affine), no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- Portabilidad muy restringida: los expertos en trellis requieren un decodificador propio y el modelo no arranca en `mlx-lm`, `mlx-vlm`, `transformers` ni vLLM. Queda atado a R.E.V.I.S. v1.3.0 o superior sobre Apple silicon.
- Degradación de cuantización medible: KLD de 0,0373 frente a 0,0110 del arm Q8, es decir, más de tres veces la divergencia. Es una medida interina sobre 48 documentos y 18.040 posiciones, no un benchmark de tarea.
- Ausencia total de benchmarks de tarea: no hay MMLU, HumanEval, GSM8K ni equivalentes, ni comparación frente al modelo base en precisión de tareas.
- Riesgo de alucinación: no se documenta de forma específica para este checkpoint; como todo modelo generativo cuantizado, puede producir contenido incorrecto, especialmente en dominios poco representados.
- Idiomas: el campo de idiomas está vacío, por lo que no hay garantía documentada de cobertura multilingüe más allá de la del modelo base.
- Licencia: se redistribuye como apache-2.0, pero la model card enlaza la licencia específica de Gemma 4 (`license_link`). Conviene verificar los términos aplicables antes de un uso comercial, ya que el propio autor declara no reclamar la titularidad del modelo subyacente.
- Historial de uso nulo: 0 descargas y 0 likes, con una única revisión publicada en el mismo día de creación (02/10/2026, 13:54 UTC) y actualización a las 14:03 UTC. No hay validación independiente.
- Padding de expertos: el ancho de experto 704 se almacena con padding a 768, lo que introduce un pequeño desperdicio de memoria en los tensores de expertos.
- Cuantización sin datos: al ser data-free y sin QAT, no hay garantía de que la degradación sea uniforme entre dominios; el KLD global puede ocultar pérdidas mayores en tareas concretas.
- Discrepancia menor de tamaños: la tabla de especificaciones indica 15,65 GB y la interina de benchmarks 15,64 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mavis-ai/Gemma4-26B-MoE-Q4T
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Sitio oficial de R.E.V.I.S.: https://mavis-ai.co.jp/revis/
- Cuenta de X del autor: https://x.com/mavis_ai_jp
- Referencia arXiv etiquetada en el repositorio (2602.06036): https://arxiv.org/abs/2602.06036
- Referencia arXiv etiquetada en el repositorio (2607.02770): https://arxiv.org/abs/2607.02770
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a entidades homónimas sin relación (mavis.fr, mavis.com, la entrada "Mavis" de Wikipedia, la plataforma sanitaria del NHS y Mavis Beacon Free).
