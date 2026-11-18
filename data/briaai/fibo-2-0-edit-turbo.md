# briaai/Fibo-2.0-edit-turbo

## Resumen

Fibo-2.0-edit-turbo es un modelo de edición de imágenes desarrollado por Bria AI, una empresa israelí especializada en IA generativa con licenciamiento de datos limpio. Se trata de una versión destilada y acelerada del modelo base Fibo-2.0-dev, orientada a la edición de imágenes mediante instrucciones en lenguaje natural, con soporte específico para inpainting, edición image-to-image y generación multi-referencia. El modelo se distribuye a través de la librería diffusers con el pipeline `BriaFibo2Pipeline`.

El modelo resuelve el problema de la edición de imágenes controlada y predecible en entornos de producción: permite modificar regiones concretas de una imagen, combinar múltiples referencias visuales y seguir instrucciones estructuradas, todo ello con un proceso de destilación que reduce el número de pasos de inferencia necesarios. Con aproximadamente 8.127 millones de parámetros en pesos safetensors y un repositorio de 25,5 GB, está pensado para despliegues donde la latencia importa.

Su relevancia actual radica en la combinación de tres factores: acceso restringido con licencia comercial específica (bria-fibo), soporte de instrucciones estructuradas y multi-referencia, y una variante turbo que acelera la generación. Está vinculado al paper arXiv:2511.06876 y solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para edición de imágenes, pipeline `BriaFibo2Pipeline`) |
| Parámetros totales | 8.127.342.213 (según safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | bria-fibo (licencia propia, acceso restringido/gated) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo pertenece a la familia Fibo-2.0 de Bria y se distribuye como un pipeline de diffusers (`BriaFibo2Pipeline`) para tareas de image-to-image. Los tags indican que incorpora técnicas de destilación (distillation), edición multi-referencia (multi-reference), inpainting y soporte de prompts estructurados (structured-prompts). Es una variante turbo derivada por fine-tuning del modelo base `briaai/Fibo-2.0-dev`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El paper asociado (arXiv:2511.06876) es la referencia técnica para consultar estos detalles. La destilación es la innovación técnica destacada: reduce los pasos de inferencia necesarios respecto al modelo base, lo que se traduce en menor latencia.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (image editing).
- Edición image-to-image sobre una imagen de entrada.
- Inpainting: modificación de regiones enmascaradas de una imagen.
- Generación y edición multi-referencia: combinación de varias imágenes de referencia en una sola salida.
- Soporte de prompts estructurados (structured-prompts), lo que permite especificar la edición con mayor control que un prompt libre.
- Variante turbo/destilada: pensada para inferencia con menos pasos.
- Idioma de instrucciones: inglés.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o vídeo.

## Casos de uso

- Edición de producto en e-commerce: sustituir fondos, recolocar objetos o cambiar colores sobre fotos de catálogo mediante inpainting, manteniendo el resto de la imagen intacto gracias a la máscara de edición.
- Retoque fotográfico automatizado en pipelines de contenido: aplicar instrucciones en inglés para eliminar objetos, corregir iluminación o reemplazar elementos en lotes de imágenes sin intervención manual.
- Composición multi-referencia para marketing: generar variaciones de una escena combinando varias imágenes de referencia (por ejemplo, un producto y un entorno) en una sola salida coherente.
- Prototipado rápido de assets creativos: usar la variante turbo para iterar sobre propuestas visuales con baja latencia antes de pasar a una generación de mayor calidad con el modelo base.
- Automatización de flujos de diseño gráfico: integrar el pipeline `BriaFibo2Pipeline` en herramientas internas que aplican ediciones estructuradas y reproducibles sobre plantillas.
- Moderación y saneamiento de imágenes: eliminar o reemplazar contenido no deseado en regiones concretas mediante inpainting controlado con máscaras.
- Enriquecimiento de datasets visuales: generar variaciones editadas de imágenes existentes para aumentar la diversidad de un conjunto de entrenamiento, respetando la estructura de la escena original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 25,5 GB en safetensors; la VRAM necesaria para inferencia en precisión completa será del orden de decenas de GB, aunque no se dispone de cifras oficiales en la información proporcionada.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) en la documentación disponible.
- No se confirma si cabe en GPU de consumo; dado el tamaño de los pesos, probablemente requiera cuantización o técnicas de offloading, pero este dato no está disponible.
- Opciones de despliegue: al distribuirse como pipeline de diffusers, es compatible con el ecosistema diffusers de Hugging Face; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje y no aplican directamente).
- Latencia y throughput: no disponibles; la variante turbo está diseñada para reducir pasos de inferencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / pasos | Licencia | Acceso |
|---|---|---|---|---|
| Fibo-2.0-edit-turbo (briaai) | 8.127 M | variante turbo destilada | bria-fibo (propia) | restringido (gated) |
| Fibo-2.0-dev (briaai) | no disponible | modelo base, más pasos | bria-fibo (propia) | no disponible en la información |
| Alternativas de edición de imágenes open source | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, modelos de edición de imágenes de otros proveedores) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia propia `bria-fibo`: es necesario revisar los términos para uso comercial; no es una licencia open source estándar (Apache, MIT, etc.).
- Solo soporta instrucciones en inglés; el rendimiento en otros idiomas no está garantizado.
- No se documentan sesgos específicos, pero al ser un modelo generativo de imágenes puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de artefactos y ediciones inconsistentes en regiones complejas o con máscaras imprecisas; no se publican métricas de fidelidad.
- No se dispone de información sobre el dataset de entrenamiento, lo que dificulta evaluar riesgos de memorización o contenido sensible.
- El tamaño del repositorio (25,5 GB) y los 8.127 millones de parámetros implican requisitos de hardware elevados para producción.
- La variante turbo prioriza velocidad sobre calidad; para resultados de máxima fidelidad puede ser preferible el modelo base `Fibo-2.0-dev`.

## Enlaces

- Hugging Face: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-dev
- Paper: https://arxiv.org/abs/2511.06876
