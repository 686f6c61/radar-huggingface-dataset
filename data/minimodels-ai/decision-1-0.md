# minimodels-ai/decision-1.0

## Resumen

minimodels-ai/decision-1.0, con nombre en clave "candy-cane", es un modelo de clasificación de texto publicado por el colectivo minimodels-ai bajo licencia Apache 2.0. Se presenta como un "decision model" asociado al endpoint `/v1/systemone`, lo que sugiere un uso orientado a la toma de decisiones o evaluación de estados dentro de un sistema propietario denominado "systemone". El repositorio incluye instrucciones para desplegarlo mediante Docker o un servidor Python propio, con un adaptador y un fichero de calibración específicos.

El dato más relevante es su tamaño: 31.273.088.876 parámetros en pesos safetensors, es decir, aproximadamente 31,3 mil millones de parámetros, lo que lo sitúa en la categoría de modelos de gran escala. Sin embargo, la model card no documenta arquitectura, datos de entrenamiento, contexto, idiomas ni benchmarks, y el pipeline declarado es text-classification, no generación. El repositorio ocupa 18,9 GB, coherente con pesos en cuantización de 4 bits (etiqueta "4-bit" presente en los tags).

La relevancia actual es limitada pero curiosa: se trata de un modelo con muy poca tracción (0 descargas, 0 likes en el momento de la consulta) y documentación mínima, lo que exige cautela. Aun así, su combinación de tamaño grande, licencia permisiva y formato de despliegue empaquetado (Docker con red deshabilitada) puede interesar a equipos que evalúen modelos de decisión autoalojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag "gemma4" sugiere base derivada de la familia Gemma, sin confirmar) |
| Parametros totales | 31.273.088.876 (31,3 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (según tag); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,9 GB); se menciona un "adapter" adicional en el despliegue |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna. Los tags incluyen "gemma4", lo que podría indicar que el modelo se construye sobre una base de la familia Gemma (posiblemente una generación posterior a Gemma 2), pero la model card no lo confirma ni detalla capas, atención, tipo de normalización o estrategia de posicionamiento. Tampoco se especifica si es un transformer denso, un modelo con mezcla de expertos o una arquitectura híbrida.

Respecto al entrenamiento, no hay datos sobre número de tokens, composición del dataset, fases de ajuste (SFT, RLHF, DPO) ni proceso de calibración. La presencia de un fichero `configs/candy_cane.json` y de un directorio `adapter` en el despliegue sugiere un proceso de adaptación (posiblemente LoRA u otro tipo de adaptador) sobre un modelo base, pero es una inferencia, no un dato documentado. Tampoco se describe ninguna innovación técnica como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto: es la tarea declarada en el pipeline (`text-classification`), orientada a producir una "decisión" o índice de decisión dentro del sistema "systemone".
- Endpoint dedicado `/v1/systemone`: la API expuesta sugiere una interfaz específica para evaluar decisiones, no una API de chat genérica.
- Despliegue autoalojado: incluye Dockerfile y servidor Python (`scripts/serve_torch_jev.py`) con calibración configurable.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.
- Generación de texto libre: no declarada; el pipeline es de clasificación.

## Casos de uso

- Enrutamiento de decisiones en pipelines internos: el modelo puede integrarse como clasificador que asigne una categoría o índice de decisión a una entrada de texto, usando el endpoint `/v1/systemone` para estandarizar la respuesta dentro de un sistema mayor.
- Filtrado y triaje de contenido: al ser un clasificador de 31,3 B, puede emplearse para etiquetar grandes volúmenes de texto en procesos de moderación o priorización, siempre que se valide su comportamiento con datos propios.
- Automatización de políticas de negocio: en escenarios donde una decisión binaria o multiclase deba aplicarse de forma consistente (aprobación, denegación, revisión), el modelo puede servir como componente de decisión con calibración ajustable mediante `configs/candy_cane.json`.
- Evaluación de solicitudes o formularios: clasificación de peticiones entrantes para derivarlas al flujo adecuado, aprovechando el despliegue en contenedor aislado (`--network none`) para entornos con requisitos de privacidad.
- Investigación sobre modelos de decisión: su licencia Apache 2.0 y formato safetensors permiten inspeccionar pesos, adaptar el adaptador y experimentar con calibración en laboratorio.
- Prototipado de servicios con API compatible: el servidor Python incluido facilita levantar un servicio local con endpoints `/health`, `/v1/models` y `/v1/systemone` para pruebas de integración antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,3 B de parámetros en 4 bits, el peso ronda los 15-16 GB; sumando overhead de activaciones y contexto, se estiman 20-24 GB de VRAM como mínimo práctico. En precisión completa (fp16) serían necesarios aproximadamente 63 GB solo para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegues estables; en consumer, una RTX 4090 (24 GB) podría ser justa en 4 bits y depende de la longitud de contexto real, que no se documenta.
- Cabe en consumer GPU: probablemente en RTX 4090 y RTX 3090 (24 GB) con cuantización 4-bit, sujeto a verificación empírica; no se garantiza en GPUs de 16 GB.
- Opciones de despliegue: el repositorio proporciona Docker (`minimodels-decision-1.0`) y servidor Python propio (`scripts/serve_torch_jev.py`) con adaptador y calibración. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un pipeline de clasificación con endpoint propio, el soporte de esos motores es incierto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría (clasificadores de decisión de gran escala) ni ofrece métricas para establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla arquitectura, datos de entrenamiento, contexto ni idiomas, lo que impide evaluar su idoneidad con rigor.
- Tracción nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- Riesgo de alucinación y sesgos: no evaluables sin benchmarks ni documentación; al ser un clasificador, el riesgo principal es de clasificación errónea sistemática, no de generación.
- Idiomas: no declarados; no debe asumirse soporte multilingüe.
- Contexto: desconocido; planificar integraciones sin asumir ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y la procedencia del modelo base (el tag "gemma4" podría implicar términos adicionales de la familia Gemma, no confirmados).
- Dependencia de componentes propietarios: el endpoint `/v1/systemone` y el fichero de calibración sugieren un ecosistema cerrado ("systemone", "jev") cuya documentación no se incluye.
- Producción: no recomendable desplegar sin una evaluación propia previa y sin verificar el comportamiento del adaptador y la calibración.

## Enlaces

- Hugging Face: https://huggingface.co/minimodels-ai/decision-1.0
- Repositorio Docker/servidor: incluido en el propio repositorio de Hugging Face (Dockerfile, `requirements.txt`, `scripts/serve_torch_jev.py`, `configs/candy_cane.json`, `adapter/`)
- Licencia: fichero `LICENSE` del repositorio (Apache 2.0)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
