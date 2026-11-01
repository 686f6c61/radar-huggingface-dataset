# magnitudedev/mammoth-1-GGUF

## Resumen

Mammoth-1 GGUF es una re-publicación en formato GGUF del modelo baselabs/mammoth-1, realizada por el usuario magnitudedev en Hugging Face. El modelo original es un modelo de decisión ("decision model") etiquetado bajo el ecosistema de Magnitude, una plataforma especializada en servir modelos para tareas de decisión estructurada. Esta versión cuantizada no altera los pesos originales salvo por la cuantización, y añade metadatos de decisión (`decision.*` y una plantilla de chat `tokenizer.chat_template.decision`) para que Magnitude pueda servirlo sin código específico del modelo.

El modelo responde a un problema concreto: en lugar de generar texto libre, está orientado a producir salidas de decisión como `noul`, `choice` o `score` a través de los endpoints `/v1/systemone` y `/v1/decisions` de Magnitude. Esto lo sitúa en una categoría distinta a los LLM conversacionales generales, más cercana a clasificadores o evaluadores de gran escala.

Con 26.895.998.464 parámetros totales (dato real extraído de los safetensors del repositorio base) y licencia MIT, es relevante para desarrolladores que necesiten un modelo de decisión de tamaño medio-alto desplegable localmente mediante runtimes compatibles con GGUF (llama.cpp, Ollama, etc.). El repositorio ocupa 172,9 GB y ofrece cuatro niveles de cuantización: Q4_K_M, Q5_K_M, Q6_K y Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión basado en mammoth-1) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (re-upload cuantizado; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La ficha original no documenta la arquitectura subyacente de mammoth-1, por lo que no es posible confirmar si se trata de un transformer denso, una mezcla de expertos (MoE) o un diseño híbrido. Lo que sí consta es que se trata de un "decision model": un modelo cuyo propósito es emitir decisiones estructuradas en lugar de texto conversacional. Los metadatos añadidos en el GGUF incluyen claves `decision.*` derivadas de la configuración, la calibración y el código de referencia del modelo original, así como una plantilla de chat específica para decisiones (`tokenizer.chat_template.decision`).

No hay información publicada sobre el dataset de entrenamiento, el número de tokens de preentrenamiento ni el uso de técnicas de alineación como RLHF o DPO. La cuantización a GGUF es el único procesamiento posterior documentado; los pesos no se modifican más allá de eso.

## Capacidades

- Emisión de decisiones estructuradas: el modelo responde con salidas del tipo `noul`, `choice` y `score`, expuestas mediante los endpoints `/v1/systemone` y `/v1/decisions` de Magnitude.
- Etiquetado como "conversational" en los metadatos de Hugging Face, con plantilla de chat incluida (una general y otra específica para decisiones).
- Compatibilidad con runtimes GGUF estándar: los metadatos `decision.*` son ignorados por otros runtimes, lo que permite usar el modelo como un GGUF convencional en llama.cpp u Ollama.
- No se documenta soporte de visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Evaluación automática de respuestas de LLM: como modelo de decisión, puede puntuar (`score`) salidas de otros modelos en pipelines de evaluación o filtrado de datos sintéticos.
- Moderación y filtrado de contenido: la salida binaria tipo `noul` es adecuada para aceptar o rechazar contenidos en flujos de moderación con baja latencia.
- Enrutado de consultas (routing): la salida `choice` permite seleccionar entre varias opciones, útil para dirigir peticiones a distintos modelos o backends según complejidad.
- Servicios de decisión de baja latencia en producción: la cuantización Q4_K_M reduce el footprint de memoria, permitiendo despliegue en infraestructura moderada.
- Integración con la plataforma Magnitude: los metadatos incluidos permiten servir el modelo sin código específico, acelerando el despliegue.
- Experimentación local con modelos de decisión: la licencia MIT y el formato GGUF facilitan pruebas en estaciones de trabajo con runtimes open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~26,9 B de parámetros, la cuantización Q4_K_M requiere aproximadamente 16–17 GB, Q5_K_M unos 19 GB, Q6_K unos 22 GB y Q8_0 unos 28–29 GB (estimaciones estándar para GGUF, más overhead de contexto y KV cache). No hay cifras oficiales publicadas.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 5090, A100 40 GB o H100 para Q6_K y Q8_0 sin offload a CPU.
- Consumer GPU: cabe en una RTX 4090 con las cuantizaciones Q4_K_M y Q5_K_M; las cuantizaciones más altas requerirían offload parcial a CPU o GPU de gama datacenter.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; también la plataforma Magnitude, que lo sirve de forma nativa gracias a los metadatos incluidos. No se menciona soporte para vLLM o TGI con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen modelos comparables documentados en la informacion disponible, dado que mammoth-1 pertenece a la categoría específica de "decision models" del ecosistema Magnitude, de la que no se publican alternativas con fichas técnicas equivalentes. Como referencia de tamaño, modelos generales de ~27 B parámetros (como Qwen o Gemma en esa gama) ofrecen capacidades conversacionales amplias, pero no están diseñados para salidas de decisión estructurada, por lo que la comparación directa no es aplicable.

## Limitaciones y advertencias

- Documentación muy escasa: la model card no especifica arquitectura, contexto, idiomas, datos de entrenamiento ni benchmarks, lo que dificulta evaluar el modelo rigurosamente antes de producción.
- Riesgo de alucinación: no disponible; al ser un modelo de decisión, el fallo típico sería una decisión incorrecta o mal calibrada, y no se publica información sobre su calibración más allá de los metadatos incluidos.
- Sesgos conocidos: no disponibles; sin información sobre el dataset de entrenamiento no es posible evaluar sesgos.
- Dependencia del ecosistema: las funciones de decisión (`decision.*`, endpoints de Magnitude) solo funcionan plenamente en Magnitude; en otros runtimes el modelo pierde esa funcionalidad específica.
- Es un re-upload de terceros (magnitudedev), no el repositorio oficial del autor base; para garantías de procedencia conviene verificar los hashes contra `baselabs/mammoth-1` (`61cec44`).
- Licencia MIT: sin restricciones para uso comercial, aunque la procedencia de los datos de entrenamiento no está documentada.
- Tamaño del repositorio (172,9 GB): la descarga completa es costosa si solo se necesita una de las cuatro cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/magnitudedev/mammoth-1-GGUF
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Plataforma Magnitude: https://magnitude.run
