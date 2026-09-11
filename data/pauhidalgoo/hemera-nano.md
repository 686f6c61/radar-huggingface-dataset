# pauhidalgoo/hemera-nano

## Resumen

Hemera-Nano es un modelo de difusión texto-a-imagen de 29,76 millones de parámetros desarrollado por el usuario pauhidalgoo y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un denoiser de resolución nativa 256×256 entrenado desde cero sobre el dataset Photonyx, con un presupuesto de cómputo deliberadamente reducido ("micro-budget"). La arquitectura es un Diffusion Transformer (DiT) plano con self-attention global y modulación adaLN-Zero, con SwiGLU denso en la red feed-forward, y se entrena con el objetivo de predicción de velocidad propio de rectified flow con timesteps logit-normal. Tanto el VAE como el codificador de texto permanecen congelados durante el entrenamiento: solo se entrenan los 29,7 millones de parámetros del denoiser.

El modelo se posiciona explícitamente como un artefacto de investigación, no como un generador de imágenes de producción. Su relevancia radica en dos factores: por un lado, demuestra que es viable entrenar un denoiser funcional desde cero con recursos muy contenidos (11,47 GiB de VRAM en pico y una media de 5.234 imágenes por segundo sobre una RTX 5090); por otro, publica de forma inusualmente honesta un resultado negativo, ya que el autor reconoce que la release no supera todos los criterios de éxito pre-registrados. La puerta de confirmación automática falló porque el candidato no ganó en todas las semillas evaluadas y porque la evaluación humana ciega y el scoring oficial con detector GenEval siguen pendientes.

Es, por tanto, un modelo pequeño, de resolución baja y con métricas de calidad moderadas, cuyo valor principal es metodológico: sirve como línea base reproducible para estudiar dinámicas de entrenamiento en presupuestos mínimos, y como pieza didáctica para entender un pipeline completo de difusión (VAE congelado, encoder de texto congelado y denoiser entrenable) sin necesidad de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT plano (Diffusion Transformer) con self-attention global y adaLN-Zero; red feed-forward SwiGLU densa |
| Parametros totales | 29.756.564 según la model card; 29.756.552 según los metadatos safetensors de HuggingFace |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la condición es un embedding de texto CLIP agrupado) |
| Tipos de cuantizacion | no disponible; la inferencia de referencia se ejecuta en bfloat16 |
| Idiomas soportados | no disponible; el codificador de texto congelado es openai/clip-vit-base-patch32, entrenado principalmente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) dentro de la librería hemera |
| Resolucion nativa | 256×256 |
| Objetivo de entrenamiento | Predicción de velocidad con rectified flow y timesteps logit-normal |
| VAE congelado | dc-ai/dc-ae-lite-f32c32-diffusers |
| Codificador de texto congelado | openai/clip-vit-base-patch32 (representación agrupada) |
| Computo por muestra (forward) | 2,489 GFLOPs |
| Ajustes de inferencia fijados | CFG 5.0, NFE 15 |
| Dataset de entrenamiento | Photonyx, revisión 35978bff3d6f38f4e432c25506168aaf8bd7e26f |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion (segun HuggingFace) | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue una receta de difusión latente en la que únicamente se entrena el denoiser. Las imágenes se proyectan a un espacio latente mediante el VAE congelado dc-ai/dc-ae-lite-f32c32-diffusers y la condición textual se obtiene de la representación agrupada (pooled) del codificador CLIP ViT-B/32 congelado. El backbone es un DiT plano, sin jerarquía de resoluciones, que aplica self-attention global sobre los tokens latentes y utiliza modulación adaLN-Zero para inyectar la condición y el nivel de ruido. La red feed-forward es un SwiGLU denso. El objetivo es la predicción de velocidad de rectified flow, con muestreo de timesteps siguiendo una distribución logit-normal. El forward consume 2,489 GFLOPs por muestra, una cifra coherente con un modelo de menos de 30 millones de parámetros a 256×256.

El entrenamiento se realizó desde cero sobre el dataset Photonyx, cuya auditoría aceptó 427.260 filas con etiquetas de licencia CC0, CC0-1.0 y dominio público. El reparto final fue de 418.792 ejemplos de entrenamiento, 4.278 de validación y 4.190 de test. Las fuentes son DiffusionDB (231.217 filas) y Safe Commons (196.043 filas). El modelo vio 736.104.192 ejemplos a lo largo del entrenamiento, con un throughput medio de 5.234 imágenes por segundo sobre una RTX 5090 y un pico de VRAM de 11,47 GiB. El checkpoint publicado por defecto es el mejor por validación con EMA en el paso 320.000; el checkpoint terminal, en el paso 958.469, se conserva únicamente para análisis y reproducibilidad, y el autor advierte explícitamente de que no debe presentarse como el mejor modelo. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste por preferencias. El conjunto de ajustes de inferencia (CFG 5.0 y NFE 15) se seleccionó entre 15 candidatos de CFG/NFE sobre validación antes de generar el test una única vez, lo que constituye una práctica de bloqueo metodológico destacable.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución nativa de 256×256, con el pipeline oficial hemera y decodificación en 15 pasos.
- Condicionamiento por prompt de texto y por negative prompt, tanto global como por prompt individual dentro de un lote.
- Generación por lotes: el pipeline acepta listas de prompts y devuelve una lista de imágenes.
- Control de reproducibilidad: admite objetos torch.Generator, semillas deterministas y salida de latentes en lugar de imágenes decodificadas.
- Selección de dispositivo y de tipo de dato en la llamada al pipeline (por ejemplo, bfloat16 y device="auto").
- Entrenamiento desde cero de un denoiser de difusión con VAE y encoder de texto congelados, reproducible a partir de las semillas, hashes y revisiones documentadas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada ni audio.
- No se documentan capacidades multilingües; la condición textual depende de CLIP ViT-B/32, cuyo entrenamiento es predominantemente en inglés.

## Casos de uso

- Línea base de investigación en difusión de bajo presupuesto: sirve para comparar recetas de entrenamiento (por ejemplo, dos variantes densas emparejadas) bajo un protocolo congelado, con semillas y prompts pareados, tal y como hizo el propio autor en la fase de confirmación.
- Docencia y aprendizaje de pipelines de difusión: al ser un modelo de 29,7 millones de parámetros con VAE y encoder de texto congelados, permite recorrer de principio a fin el flujo latente, el condicionamiento CLIP y el muestreo por rectified flow en hardware de consumo.
- Estudio de dinámicas de entrenamiento a largo plazo: la existencia de dos checkpoints documentados (paso 320.000 y paso 958.469) con sus hashes permite analizar sobreajuste, degradación y estabilidad del EMA sin coste elevado.
- Diagnóstico de memorización y sesgo de dataset: el autor publica un protocolo de comparación de generaciones contra un subconjunto estratificado de 50.000 imágenes de entrenamiento, reutilizable para auditar otros modelos pequeños.
- Generación de prototipos y pruebas de concepto visuales: para iterar rápidamente sobre ideas de composición, paleta o iluminación en 256×256 antes de invertir en un modelo de mayor resolución.
- Pruebas de integración y CI de pipelines propios: al caber en cualquier GPU moderna y tener un forward de 2,489 GFLOPs, es adecuado como modelo de juguete para validar código de inferencia, gestión de latentes o batching sin consumir cuotas de cómputo relevantes.
- Aumento de datos sintéticos de baja resolución: puede emplearse para generar pares imagen-texto de 256×256 en tareas de clasificación o recuperación donde la resolución no sea crítica, siempre con revisión humana previa.
- Investigación sobre calibración de CFG y NFE: su conjunto de 15 candidatos evaluados en validación permite estudiar el compromiso entre fidelidad al prompt y diversidad en modelos muy pequeños.

## Benchmarks y rendimiento

Evaluación bloqueada sobre el test completo de Photonyx (4.190 muestras), con los ajustes de inferencia fijados antes de generar:

| Metrica | Valor |
|---|---:|
| Photonyx test CMMD | 0,55408 |
| Canonical FID | 21,83977 |
| Precision | 0,72840 |
| Recall | 0,20621 |
| HPSv2 | 0,19745 |
| CLIP alignment | 0,25158 |
| SigLIP alignment | 0,12078 |

Desglose por fuente del dataset:

| Fuente | Muestras | CMMD | Precision | Recall | HPSv2 | CLIP |
|---|---:|---:|---:|---:|---:|---:|
| DiffusionDB | 2.335 | 0,50640 | 0,78630 | 0,29807 | 0,20252 | 0,25005 |
| Safe Commons | 1.855 | 1,00148 | 0,66361 | 0,09704 | 0,19108 | 0,25351 |

Resultados de la fase de confirmación automática (dos recetas densas emparejadas, semillas 101, 202 y 303, 256 prompts pareados, 2.000 remuestreos bootstrap por clústeres):

| Metrica | Valor |
|---|---:|
| Mejora relativa del compuesto | 0,00745 |
| Intervalo de confianza al 95% | [0,00210, 0,01222] |
| Victorias del candidato por semilla | positiva, positiva, negativa |
| Puerta de confirmación pre-registrada | fallida |

El propio autor advierte de que estas cifras caracterizan la release bajo el protocolo Hemera congelado y que no deben compararse directamente con números calculados con otros datasets, encoders de características, tamaños de imagen, recuentos de muestras o estimadores. La información disponible solo incluye las métricas de memorización de forma truncada (encoder, coseno medio del vecino más cercano, percentil 99 y máximo, sin valores), por lo que no se reproduce esa tabla. No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que además no aplican a un modelo de generación de imágenes.

## Requisitos de hardware

- Pesos del denoiser: 29,76 millones de parámetros, aproximadamente 59,5 MB en bfloat16 (cálculo derivado del recuento de parámetros; el autor no publica la cifra de VRAM de inferencia).
- VRAM de inferencia: no disponible como dato publicado. Hay que sumar al denoiser el VAE dc-ai/dc-ae-lite-f32c32-diffusers y el encoder CLIP ViT-B/32; el conjunto es muy reducido y cabe holgadamente en cualquier GPU de consumo actual, incluso en iGPU con memoria compartida suficiente.
- VRAM de entrenamiento: 11,47 GiB en pico, medidos sobre una RTX 5090, con un throughput medio de 5.234 imágenes por segundo.
- GPU recomendadas para entrenamiento: RTX 5090 según la evidencia aportada; por el perfil de memoria, tarjetas de 16 GB o más son suficientes. Para inferencia basta cualquier GPU con unos pocos GB libres.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del modelo y su resolución de 256×256.
- Opciones de despliegue: paquete oficial hemera instalado desde el repositorio fuente (pip install "git+https://github.com/pauhidalgoo/diffusion-architectures.git"), con descarga y caché automáticas del denoiser, el VAE y el encoder de texto. El modelo está etiquetado como compatible con diffusers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imagen de este tipo.
- Latencia y throughput de inferencia: no disponibles. La única cifra de rendimiento publicada (5.234 imágenes/s) corresponde al entrenamiento en RTX 5090, no a la generación.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La model card no incluye ninguna comparativa contra otros generadores texto-a-imagen y advierte expresamente de que sus métricas no son comparables con números obtenidos bajo otros protocolos, datasets, encoders o tamaños de imagen. Cualquier tabla comparativa exigiría reevaluar los modelos candidatos con el mismo pipeline de evaluación congelado, algo que no se ha hecho en la documentación disponible.

## Limitaciones y advertencias

- Resolución nativa de solo 256×256, muy inferior a los generadores de uso general actuales; no está pensado para producción visual.
- Recall de 0,20621 en el test, lo que indica una cobertura limitada de la distribución objetivo: el modelo genera un subconjunto estrecho de lo que aparece en el dataset.
- Brecha grande entre fuentes: CMMD de 0,50640 en DiffusionDB frente a 1,00148 en Safe Commons, con recall de 0,29807 frente a 0,09704. El autor lo califica de limitación material y lo atribuye a diferencias en leyendas, contenido y distribuciones de imagen.
- La puerta de confirmación pre-registrada falló: el candidato no superó a su línea base en todas las semillas y las evaluaciones humanas ciegas y el scoring oficial con GenEval siguen pendientes. Esto invalida cualquier afirmación de estado del arte.
- El checkpoint publicado por defecto es el de mejor validación, no el terminal; usar el checkpoint del paso 958.469 como si fuera mejor sería un error metodológico.
- Condicionamiento limitado por CLIP ViT-B/32 con representación agrupada: no hay conditioning por cross-attention token a token, lo que restringe el seguimiento de prompts largos o detallados.
- Idiomas: no se documentan idiomas soportados y el encoder de texto está entrenado principalmente en inglés; el rendimiento con prompts en castellano no está caracterizado.
- Sesgos: el dataset procede de DiffusionDB y Safe Commons, con licencias CC0 y dominio público, pero no se publica un análisis de sesgos demográficos, estéticos o de representación. El autor solo documenta diagnóstico de memorización, y de forma parcial.
- Riesgo de alucinación visual: como todo modelo de difusión, puede producir anatomías incorrectas, texto ilegible y objetos malformados; de hecho el prompt negativo de referencia incluye "blurry, malformed, distorted, text, watermark, logo".
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo no cubre necesariamente los derechos sobre los datos de entrenamiento ni sobre las salidas; conviene revisar las condiciones de DiffusionDB y de las fuentes de Safe Commons antes de un uso comercial.
- Métricas no comparables: los valores de CMMD, FID, precisión, recall, HPSv2 y alineamiento solo son válidos bajo el protocolo Hemera congelado.
- Metadatos llamativos: las fechas de creación y actualización reportadas por HuggingFace son el 11 de septiembre de 2026, con 0 descargas y 0 likes. El modelo no ha sido validado por terceros.
- La model card está en inglés y este modelo no incluye ficha en castellano; la información sobre cuantizaciones, VRAM de inferencia y latencia simplemente no existe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pauhidalgoo/hemera-nano
- Repositorio del paquete de inferencia: https://github.com/pauhidalgoo/diffusion-architectures.git
- Dataset de entrenamiento: https://huggingface.co/datasets/pauhidalgoo/photonyx
- VAE congelado: https://huggingface.co/dc-ai/dc-ae-lite-f32c32-diffusers
- Codificador de texto congelado: https://huggingface.co/openai/clip-vit-base-patch32
- Muestrario de generaciones y metadatos de selección: assets/showcase/showcase.jsonl y assets/showcase/contact-sheet.png dentro del repositorio del modelo
- Búsqueda web: no se han encontrado resultados relevantes. Las consultas devolvieron exclusivamente listados de sitios para adultos sin relación alguna con el modelo, por lo que no se incluye ningún enlace adicional. No se han localizado papers, blogs, demos ni hilos de discusión sobre Hemera-Nano en la información disponible.
