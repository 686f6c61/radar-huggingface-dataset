# oboro-ai/Oboro-Blink-1.0

## Resumen

Oboro Blink 1.0 es un modelo de generación y edición de imágenes de la familia de difusión, publicado por oboro-ai como un merge de adaptaciones (LoRA fusionados) sobre Qwen Image 2.1 de Qwen. Su propuesta principal es un perfil de generación en cuatro pasos con CFG 1, lo que reduce significativamente el coste de inferencia frente a los pipelines de difusión convencionales de 20-50 pasos, manteniendo la resolución nativa de 1024 x 1024.

El modelo se distribuye en dos formatos: GGUF cuantizado (Q2_K a Q6_K) e INT8 en safetensors, con un total de 7.115.124.736 parámetros en los pesos de difusión. Incluye adaptaciones ya fusionadas en los pesos, de modo que no requiere cargadores de LoRA externos ni nodos adicionales en ComfyUI. Está orientado explícitamente a la tipografía multilingüe, con mejoras dedicadas para ruso e inglés, y se presenta como un modelo "uncensored" (sin filtros de contenido).

Su relevancia actual radica en dos factores: por un lado, la eficiencia del perfil de 4 pasos, que lo hace viable en GPU de consumo; por otro, la integración lista para ComfyUI con workflows incluidos. La licencia Qwen Research License restringe el uso comercial sin licencia adicional de Qwen, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (text-to-image / image editing), derivado de Qwen Image 2.1; no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 7.115.124.736 (pesos de difusión en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no aplica contexto de texto en el sentido de LLM) |
| Tipos de cuantizacion | GGUF Q2_K, Q3_K, Q4_K, Q5_K, Q6_K; INT8 (safetensors) |
| Idiomas soportados | Ruso e inglés con mejoras tipográficas dedicadas; soporte multilingüe más amplio heredado de Qwen Image 2.1 |
| Licencia | Qwen Research License (uso de investigación y evaluación; uso comercial requiere licencia separada de Qwen) |
| Formato de pesos | GGUF (single-file) y safetensors INT8 |

## Arquitectura y entrenamiento

Oboro Blink 1.0 es un merge de adaptaciones sobre Qwen Image 2.1: las LoRA y ajustes incluidos están fusionados directamente en los pesos de difusión, por lo que el checkpoint resultante es autocontenido y no necesita cargadores de LoRA. El pipeline es text-to-image e image editing, con un perfil de muestreo por defecto de 4 pasos, CFG 1, sampler Euler, scheduler simple y resolución 1024 x 1024. El workflow incluido aplica un desplazamiento de muestreo (sampling shift) y desactiva el caching.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO (conceptos, por otra parte, propios de modelos de lenguaje y no directamente aplicables a un modelo de difusión). Las innovaciones declaradas son el perfil de 4 pasos tipo "lightning", la fusión de adaptaciones de tipografía para ruso e inglés, y la conservación del soporte multilingüe del modelo base. El modelo base Qwen Image 2.1 aporta el text encoder y el VAE, que se distribuyen por separado desde Comfy-Org/Qwen-Image-2.1.

## Capacidades

- Generación de imágenes text-to-image a 1024 x 1024 con perfil de 4 pasos y CFG 1.
- Edición de imágenes mediante la ruta de condicionamiento por imagen de referencia de Qwen Image 2.1.
- Renderizado de tipografía con mejoras dedicadas: se recomienda incluir `font` en el prompt y el texto exacto entre comillas.
- Soporte multilingüe heredado del modelo base, con foco explícito en ruso e inglés.
- Modelo "uncensored": sin filtros de contenido declarados por el autor.
- Integración nativa con ComfyUI mediante workflows incluidos (GGUF e INT8).
- No se documentan capacidades de tool calling, agentes ni multi-step reasoning (no aplicables a un modelo de difusión).

## Casos de uso

- Generación rápida de ilustraciones en ComfyUI: con 4 pasos y CFG 1, el modelo permite iterar sobre prompts con un coste de inferencia bajo, adecuado para prototipado visual y exploración creativa.
- Carteles y material promocional con texto: las adaptaciones de tipografía permiten renderizar titulares en ruso o inglés incluyendo `font` en el prompt y el texto entre comillas, útil para diseño gráfico asistido.
- Edición de imágenes existentes: usando la ruta de condicionamiento por imagen de referencia de Qwen Image 2.1, se pueden modificar imágenes manteniendo coherencia con la referencia.
- Despliegue en GPU de consumo: las variantes GGUF Q2_K (2,56 GB) a Q4_K (4,20 GB) permiten ejecutar el modelo en tarjetas con VRAM limitada, ampliando el acceso a equipos de gimnasio o estaciones de trabajo modestas.
- Investigación en generación de imágenes sin censura: el perfil "uncensored" lo hace adecuado para estudios académicos sobre sesgos, filtrado y contenido generado, siempre bajo la licencia de investigación.
- Localización de contenido visual para mercados rusohablantes: el foco en ruso permite generar material con texto en cirílico sin depender de modelos centrados en inglés.
- Automatización de pipelines creativos: al ser un único checkpoint sin LoRA externos, simplifica la orquestación en sistemas de generación por lotes dentro de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos de difusión; hay que sumar text encoder y VAE de Qwen Image 2.1):
  - GGUF Q2_K: ~2,56 GB de pesos.
  - GGUF Q3_K: ~3,27 GB.
  - GGUF Q4_K: ~4,20 GB.
  - GGUF Q5_K: ~5,07 GB.
  - GGUF Q6_K: ~6,00 GB.
  - Safetensors INT8: ~7,26 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, las variantes GGUF caben en GPU de consumo con 8-12 GB de VRAM; la variante INT8 requiere al menos 8 GB solo para los pesos de difusión, más el text encoder y el VAE.
- Cabe en GPU de consumo: sí, especialmente las variantes GGUF Q2_K a Q4_K; el autor no detalla modelos concretos de tarjeta.
- Opciones de despliegue: ComfyUI (workflows `workflow-gguf.json` y `workflow.json`), con el nodo leejet/ComfyUI-GGUF para las variantes GGUF. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión en este formato).
- Latencia y throughput: no disponibles; el perfil de 4 pasos sugiere una reducción del coste frente a pipelines de 20-50 pasos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Pasos por defecto | Formatos | Licencia |
|---|---|---|---|---|---|
| Oboro Blink 1.0 | 7.115.124.736 | 1024 x 1024 | 4 (CFG 1) | GGUF Q2_K-Q6_K, INT8 safetensors | Qwen Research License |
| Qwen Image 2.1 (base) | No disponible en la información | No disponible | No disponible | No disponible | Qwen Research License |
| Otras alternativas de difusión | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia Qwen Research License: el uso comercial requiere una licencia separada de Qwen; no es apta para producción comercial sin acuerdo.
- Modelo "uncensored": la ausencia de filtros de contenido implica riesgo de generar material inapropiado, ofensivo o ilegal; requiere salvaguardas externas en cualquier despliegue.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir texto ilegible, anatomías incorrectas o incoherencias espaciales, especialmente en cuantizaciones agresivas (Q2_K, Q3_K).
- Dependencia de componentes externos: necesita el text encoder y el VAE de Qwen Image 2.1 distribuidos por Comfy-Org; no están incluidos en el repositorio.
- Foco lingüístico limitado: las mejoras tipográficas están orientadas a ruso e inglés; el rendimiento en otros idiomas depende del modelo base y no está documentado.
- Las adaptaciones tienen fuerzas fijas: no deben reaplicarse, lo que limita el ajuste fino del efecto tipográfico.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.
- Fecha de creación registrada como 2026-11-16, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/oboro-ai/Oboro-Blink-1.0
- Modelo base Qwen Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Componentes ComfyUI (text encoder y VAE): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Nodo GGUF para ComfyUI: https://github.com/leejet/ComfyUI-GGUF
- Perfil del autor: https://huggingface.co/oboro-ai
- Licencia: LICENSE (incluida en el repositorio)
- Avisos de componentes: NOTICE (incluido en el repositorio)
