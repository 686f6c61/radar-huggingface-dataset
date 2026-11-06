# deepmaster/zils-lite-body-a

## Resumen

Zils-lite-body-a es un modelo de lenguaje de tipo transformer decoder-only publicado por el usuario deepmaster en Hugging Face. Se trata de un fine-tune del modelo Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura y el tokenizador del modelo base de Alibaba. Con 852.985.920 parámetros reales en safetensors, se posiciona en la categoría de modelos ultraligeros, pensados para inferencia en hardware modesto o en el borde (edge).

La model card es extremadamente escasa: se limita a la línea "Zils d3-lite body" y a los metadatos de licencia y modelo base. No se documentan datos de entrenamiento, composición del dataset, idiomas soportados ni resultados de evaluación. El nombre y los resultados de búsqueda sugieren una relación con el proyecto Zils (zils.ai), una plataforma orientada a entrenar modelos pequeños para tareas de clasificación y enrutamiento de decisiones a partir de ejemplos, aunque no hay confirmación oficial de que este checkpoint forme parte de dicho producto.

Su relevancia actual es limitada pero concreta: se trata de uno de los primeros fine-tunes públicos sobre Qwen3.5-0.8B, un modelo base muy reciente, lo que lo convierte en una referencia útil para quienes quieran experimentar con la familia Qwen3.5 en el rango sub-1B con licencia Apache 2.0. No obstante, la ausencia total de documentación y de benchmarks hace desaconsejable su uso en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de llama.cpp/vLLM al derivar de Qwen3.5) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 de Alibaba. Al no publicarse detalles del proceso de ajuste, se desconoce si se empleó SFT, DPO, RLHF u otra técnica, así como el volumen y la composición del dataset de entrenamiento. Tampoco se documentan innovaciones técnicas propias: el checkpoint parece conservar la arquitectura, el tokenizador y la configuración de atención del modelo base.

El tamaño del repositorio (1,7 GB) es coherente con un checkpoint en precisión BF16/FP16 de ~853 M de parámetros (aproximadamente 1,7 GB de pesos), lo que confirma que no se han publicado versiones cuantizadas en el repositorio. Cualquier cuantización (GGUF, AWQ, GPTQ) tendría que generarla el usuario a partir de los safetensors originales.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento y respuesta a instrucciones en la medida en que el fine-tune las preserve; no hay documentación que lo confirme.
- Capacidades multilingües: no disponibles de forma explícita; dependerán del modelo base, no documentado en esta ficha.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Clasificación y enrutamiento de peticiones: dado el contexto del proyecto Zils (entrenar modelos pequeños para "ordenar peticiones, marcar problemas o puntuar coincidencias"), el modelo puede usarse como clasificador ligero de intenciones en un backend, con la ventaja de su tamaño sub-1B y su licencia permisiva.
- Prototipado rápido en local: al caber en GPUs de consumo y en CPU con cuantización, sirve para validar pipelines de generación de texto antes de escalar a modelos mayores.
- Extracción de información estructurada en entornos con recursos limitados: generación de JSON o campos a partir de texto breve, siempre que se valide el comportamiento empíricamente.
- Filtrado y moderación de contenido en el borde: al ser desplegable en dispositivos con poca VRAM, puede actuar como primer filtro antes de llamar a un modelo mayor.
- Educación y experimentación con fine-tuning: útil como punto de partida para estudiar el ajuste de Qwen3.5-0.8B con licencia Apache 2.0.
- Generación de texto auxiliar en aplicaciones de escritorio o móviles: con cuantización a 4 bits (≈500 MB), puede integrarse en apps offline para tareas de resumen corto o autocompletado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache (estimación práctica de 2,5-3,5 GB para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,5-0,6 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, RTX 4060); A100/H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más, e incluso en CPU con llama.cpp.
- Opciones de despliegue: vLLM y TGI (si el modelo base es compatible con dichos motores), llama.cpp/Ollama tras conversión a GGUF, y transformers con PyTorch.
- Latencia y throughput: no disponibles; al tratarse de un modelo de ~0,85 B de parámetros, se espera un throughput alto en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| deepmaster/zils-lite-body-a | 852.985.920 | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible en esta ficha | Apache 2.0 (según modelo base) | Hugging Face |
| Fine-tunes públicos de Qwen3.5-0.8B | ~0,8 B | variable | variable | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; los datos de benchmarks del modelo y de sus comparables no están publicados en la información disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay información sobre datos de entrenamiento, evaluación, sesgos o comportamiento esperado, lo que impide garantizar calidad o seguridad.
- Riesgo de alucinación: al ser un modelo de 0,85 B de parámetros, la tasa de errores factuales y de generación de contenido inventado es intrínsecamente alta en tareas de conocimiento abierto.
- Idiomas y contexto no documentados: no se puede asumir un rendimiento multilingüe ni una ventana de contexto concreta sin verificarlo empíricamente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe cumplir también las condiciones del modelo base Qwen3.5-0.8B.
- Sin versión cuantizada oficial: el despliegue en hardware limitado requiere que el usuario genere sus propios GGUF u otros formatos.
- Cero tracción comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en producción ni de validación por terceros.
- No apto para producción sin evaluación propia: la falta de benchmarks y de model card detallada hace imprescindible una batería de pruebas antes de integrarlo en cualquier sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepmaster/zils-lite-body-a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Sitio web de Zils: https://zils.ai/
