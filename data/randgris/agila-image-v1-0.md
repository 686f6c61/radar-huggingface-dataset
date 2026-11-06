# Randgris/Agila-Image-v1.0

## Resumen

Agila-Image-v1.0 es un modelo de difusión condicional para generación de imágenes de resolución nativa 32×32, desarrollado por el usuario Randgris como complemento visual del modelo de texto Randgris/Agila-v1.0. Su particularidad es que ha sido entrenado desde cero, sin partir de pesos preentrenados de Stable Diffusion ni de ningún otro modelo de imagen, lo que lo convierte en un experimento de arquitectura propia más que en un fine-tuning. Con 1.134.976 parámetros repartidos en 49 tensores, es un modelo de escala muy reducida, orientado a ejecución local en navegador.

La arquitectura sigue el patrón DiT (Diffusion Transformer): parchea la imagen de 32×32 en parches de 8×8 que dan 16 tokens, y procesa esos tokens con 4 bloques de dimensión 128 y 4 cabezas de atención. La condicionalidad se inyecta mediante FiLM (adaLN) con escala y desplazamiento por bloque, a partir de embeddings de tiempo y de concepto. El proceso de difusión usa 100 pasos temporales con beta lineal, parametrización x0 y muestreo DDIM con eta=0.

El modelo está pensado para un caso de uso muy concreto: descarga de pesos int8 directamente desde el navegador a Cache Storage y ejecución con kernels WebGPU propios escritos en WGSL. El repositorio ocupa 0.0 GB y los pesos suman 1.18 MB en int8 por fila, lo que lo hace viable en entornos sin GPU dedicada. Su relevancia es la de una prueba de concepto de pipeline completo (entrenamiento, cuantización, dequantización en JS, ejecución en GPU del navegador) más que la de un generador de imágenes de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT-style: parches 8×8 → 16 tokens, 4 bloques, dimensión 128, 4 cabezas |
| Parametros totales | 1.134.976 (49 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (condicionamiento por concepto y tiempo, no por texto libre) |
| Tipos de cuantizacion | int8 por fila (1.18 MB en disco) |
| Idiomas soportados | no disponible (condicionamiento por concepto, no por prompt textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | `weights.bin` (int8 por fila) + `parity.json` para validación |
| Resolucion nativa | 32×32 píxeles (upscale pixelado en la interfaz) |
| Pasos de difusión | 100 timesteps, beta lineal, parametrización x0, DDIM (eta=0) |
| Condicionamiento | time + concept embedding → FiLM (adaLN) por bloque |
| Conceptos soportados | 8: atardecer, montaña, mar, bosque, ciudad, desierto, amanecer, tormenta |
| Entrenamiento | 11.000 pasos, batch 32, EMA 0.998 |
| Runtime objetivo | WebGPU (kernels WGSL propios) en navegador |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) de escala mínima entrenado desde cero. La imagen de 32×32 se divide en parches de 8×8, produciendo una secuencia de 16 tokens que atraviesan 4 bloques transformer con dimensión de modelo 128 y 4 cabezas de atención. El condicionamiento no proviene de un codificador de texto: se compone de un embedding temporal y un embedding de concepto, que se proyectan a parámetros de escala y desplazamiento (FiLM/adaLN) aplicados en cada bloque. El proceso de difusión emplea 100 timesteps con schedule beta lineal, parametrización x0 y muestreo DDIM con eta=0.

El entrenamiento se realizó durante 11.000 pasos con batch de 32 y media móvil exponencial (EMA) de 0.998, sobre 8 conceptos definidos manualmente: atardecer, montaña, mar, bosque, ciudad, desierto, amanecer y tormenta. El autor indica que incorporó mejoras estructurales como la parametrización x0 y el condicionamiento FiLM para representar con claridad esos temas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de imágenes ni si hubo etapas de refinamiento posteriores.

La innovación técnica destacable no está en la arquitectura sino en el pipeline de despliegue: los pesos se publican en int8 por fila, el navegador los descarga a Cache Storage, los dequantiza a f32 en JavaScript y los pasa a buffers de WebGPU para ejecutar kernels WGSL propios. Antes de renderizar, un *parity harness* compara la ejecución del sistema contra artefactos `parity.json` generados desde PyTorch, con un límite máximo de error de validación de |Δ| 0.0587.

## Capacidades

- Generación de imágenes de 32×32 píxeles condicionada por uno de 8 conceptos predefinidos.
- Condicionamiento temporal mediante embedding de timestep, con 100 pasos de difusión configurables en la práctica por el número de pasos de muestreo.
- Tres niveles de calidad en la interfaz: High (24 pasos, recomendado para GPU de escritorio), Standard (16 pasos, recomendado para GPU móvil) y Draft (8 pasos, con fallback automático a CPU).
- Ejecución íntegra en navegador mediante WebGPU, sin servidor de inferencia.
- Descarga y caché de pesos en el cliente (Cache Storage), con dequantización int8→f32 en JavaScript.
- Validación de paridad numérica contra PyTorch mediante `parity.json`.
- No soporta prompts de texto libre, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido habitual: el condicionamiento es por concepto, no por lenguaje natural.

## Casos de uso

- Demostración educativa de un pipeline de difusión completo: el modelo permite explicar de principio a fin cómo se entrena un DiT desde cero, se cuantiza a int8 y se ejecuta en el navegador, con la validación de paridad como paso didáctico.
- Prueba de concepto de inferencia WebGPU en el cliente: sirve para evaluar kernels WGSL propios, medir latencia de dequantización y comparar la ejecución del navegador contra PyTorch usando el umbral |Δ| 0.0587.
- Generación de miniaturas o placeholders de 32×32 para interfaces: al cubrir 8 conceptos temáticos (atardecer, montaña, mar, bosque, ciudad, desierto, amanecer, tormenta), puede producir iconos o fondos pixelados con un coste de descarga de 1.18 MB.
- Aplicaciones offline-first en navegador: los pesos quedan en Cache Storage, de modo que la generación funciona sin conexión tras la primera carga, útil en demos y entornos con conectividad intermitente.
- Benchmarking de cuantización int8 por fila: el modelo es un banco de pruebas pequeño y reproducible para medir la degradación de calidad entre f32 y int8 en un modelo de difusión.
- Prototipado de interfaces de usuario para generación de imágenes: los tres niveles de calidad (24, 16 y 8 pasos) permiten diseñar y probar la UX de selección de calidad y de fallback a CPU en dispositivos móviles.
- Investigación sobre condicionamiento FiLM/adaLN: con solo 4 bloques y 8 conceptos, es un entorno controlado para estudiar cómo afectan las proyecciones de escala y desplazamiento por bloque a la fidelidad del concepto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta un criterio de validación numérica: el *parity harness* del navegador exige un error máximo de |Δ| 0.0587 frente a los artefactos `parity.json` generados desde PyTorch. No se proporcionan métricas de calidad de imagen (FID, IS, CLIP score) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.134.976 parámetros y pesos int8 de 1.18 MB, el modelo es marginal en cualquier GPU moderna, y la dequantización a f32 en memoria supone del orden de unos pocos megabytes.
- GPU recomendadas: cualquier GPU con soporte de WebGPU. El autor distingue entre GPU de escritorio (nivel High, 24 pasos) y GPU móvil (nivel Standard, 16 pasos).
- Compatibilidad con GPU de consumo: sí, en la práctica cualquier GPU integrada o dedicada con WebGPU; el nivel Draft (8 pasos) contempla fallback automático a CPU.
- Opciones de despliegue: ejecución en navegador con WebGPU y kernels WGSL propios. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles. La latencia depende del número de pasos de muestreo (8, 16 o 24) y del hardware WebGPU del cliente, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de difusión, y las alternativas habituales de text-to-image (Stable Diffusion, SDXL, Flux) no son comparables en escala, resolución ni enfoque de condicionamiento: aquellos parten de pesos preentrenados, operan a 512×512 o superior y aceptan prompts de texto libre, mientras que Agila-Image-v1.0 es un DiT de 1,13 M de parámetros entrenado desde cero para 32×32 y 8 conceptos fijos.

## Limitaciones y advertencias

- Resolución nativa de solo 32×32 píxeles; el upscale que muestra la interfaz es pixelado y no añade detalle real.
- Condicionamiento limitado a 8 conceptos predefinidos; no acepta prompts de texto libre ni combinaciones arbitrarias de atributos.
- Modelo entrenado desde cero con 11.000 pasos y batch 32: la escala de entrenamiento es muy reducida, por lo que la diversidad y fidelidad de las imágenes será limitada.
- No se documentan sesgos conocidos, pero al entrenarse sobre un conjunto no especificado de imágenes de 8 temáticas, puede heredar sesgos de composición y color de ese dataset.
- Riesgo de alucinación visual: al ser un modelo generativo de baja capacidad, puede producir imágenes que no correspondan claramente al concepto solicitado.
- No hay información sobre el dataset de entrenamiento ni sobre licencias de las imágenes usadas, lo que impide evaluar riesgos de derechos de terceros más allá de la licencia Apache 2.0 del código y los pesos.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks de calidad y de documentación del dataset hace desaconsejable su uso en producción más allá de demos o prototipos.
- Dependencia de WebGPU: en navegadores o dispositivos sin soporte, el modelo recurre a fallback a CPU con el nivel Draft (8 pasos), con la consiguiente pérdida de calidad y velocidad.
- El repositorio figura con 0.0 GB de tamaño y 0 descargas en el momento de la consulta; es un artefacto recién publicado y sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Randgris/Agila-Image-v1.0
- Modelo de texto complementario (referenciado en la model card): https://huggingface.co (Randgris/Agila-v1.0; la model card no incluye la URL completa)
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
