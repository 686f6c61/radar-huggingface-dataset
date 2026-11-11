# kky84176/qwen35-rag-sft-ruri-filter-qlora

## Resumen

`kky84176/qwen35-rag-sft-ruri-filter-qlora` es un checkpoint de tipo QLoRA publicado en Hugging Face por el usuario kky84176. Por el nombre se infiere que se trata de un ajuste fino supervisado (SFT) sobre un modelo de la familia Qwen 3.5, orientado a tareas de generación aumentada por recuperación (RAG) y con algún tipo de filtrado asociado a "ruri". El repositorio declara el pipeline `image-text-to-text` y la arquitectura `qwen3_5`, lo que sugiere un modelo multimodal con capacidad de procesar imagen y texto.

El dato más fiable disponible es el recuento de parámetros del archivo safetensors: 852.985.920 parámetros (aproximadamente 853 millones), con un tamaño de repositorio de 3,4 GB. Este tamaño es coherente con un adaptador LoRA/QLoRA o con un modelo base pequeño, no con un Qwen 3.5 de gran escala. La model card es la plantilla autogenerada por Hugging Face y no aporta información sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación sin descargas ni interacciones, sin documentación técnica y sin licencia declarada. Cualquier evaluación rigurosa debe hacerse con cautela y tratando los datos no verificados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio); detalles no disponibles |
| Parametros totales | 852.985.920 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre sugiere QLoRA, pero no se especifica el formato final) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 3,4 GB |
| Fecha de creacion | 2026-11-11 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna más allá del tag `qwen3_5`, que apunta a la familia Qwen 3.5 de Alibaba. El pipeline `image-text-to-text` indica que el modelo está preparado para entrada multimodal (imagen y texto) y salida de texto. El recuento de parámetros (unos 853 millones) sugiere que se trata de un adaptador o de un modelo base de tamaño reducido, no de un Qwen 3.5 de gran escala.

El nombre del repositorio indica un ajuste fino supervisado (SFT) con QLoRA sobre un modelo Qwen 3.5, orientado a RAG y con un componente de filtrado ("ruri-filter"). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card no documenta hiperparámetros, régimen de precisión ni infraestructura de cómputo.

## Capacidades

- Generación de texto condicionada por entrada multimodal (imagen y texto), según el pipeline declarado.
- Ajuste orientado a RAG: se espera que el modelo esté entrenado para responder a partir de contexto recuperado, aunque no hay documentación que lo confirme.
- Posible filtrado de contenido o de recuperación ("ruri-filter"), sin especificación técnica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de pipelines RAG: el modelo puede emplearse como generador en un sistema de recuperación y generación para validar el flujo completo antes de sustituirlo por un modelo mayor; su tamaño reducido (unos 853 millones de parámetros) facilita el despliegue en entornos de desarrollo.
- Experimentación académica con QLoRA: sirve como referencia para reproducir ajustes finos de bajo rango sobre modelos Qwen 3.5 y comparar técnicas de filtrado de datos.
- Evaluación de modelos multimodales pequeños: al declarar pipeline image-text-to-text, permite probar tareas de descripción de imágenes o respuesta a preguntas visuales en entornos con recursos limitados.
- Filtrado de contenido en pipelines de recuperación: el componente "ruri-filter" del nombre sugiere un uso potencial para descartar fragmentos irrelevantes antes de la generación, aunque no está documentado.
- Base para fine-tuning posterior: al ser un checkpoint QLoRA, puede servir de punto de partida para ajustes adicionales sobre dominios específicos.
- Pruebas de integración con `transformers`: útil para validar la compatibilidad de la arquitectura `qwen3_5` con versiones concretas de la librería y con servidores compatibles con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 millones de parámetros, en fp16 se requieren aproximadamente 1,7 GB solo para pesos; en cuantización de 8 bits, unos 0,9 GB; en 4 bits, unos 0,5 GB. A esto hay que sumar la memoria del procesador de imágenes y la caché KV, que no está documentada.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder cargar el modelo en cuantización; una RTX 3060, RTX 4060 o superior es suficiente. Para fp16 sin cuantizar, una RTX 4090 o A100 no son necesarias, pero ofrecen margen para lotes mayores.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 6 GB o más, aunque no se ha verificado.
- Opciones de despliegue: `transformers` (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre modelos comparables de la misma familia, tamaño o tarea en la documentación proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: la documentación es la plantilla autogenerada, sin datos de entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: no hay garantía de comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación: sin evaluación publicada, no se puede caracterizar la fiabilidad factual del modelo.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Cero descargas y cero interacciones: no hay evidencia de uso comunitario ni de validación externa.
- El nombre sugiere QLoRA, pero no se confirma si el repositorio contiene el adaptador, el modelo fusionado o ambos; esto afecta a cómo debe cargarse.
- El pipeline `image-text-to-text` debe verificarse empíricamente: el tag puede ser heredado del modelo base y no reflejar las capacidades reales del checkpoint ajustado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kky84176/qwen35-rag-sft-ruri-filter-qlora
- Referencia citada en la model card (calculadora de impacto ambiental): https://mlco2.github.io/impact#compute
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Repositorio, paper, demo y blog del autor: no disponibles.
