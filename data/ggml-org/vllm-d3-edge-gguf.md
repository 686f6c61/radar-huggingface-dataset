# ggml-org/vllm-d3-edge-GGUF

## Resumen

vllm-d3-edge-GGUF es la conversión a formato GGUF del modelo vllm-sr/d3-edge, publicada por la organización ggml-org. Se trata de un modelo de decisión (etiquetado como `decision-model` en Hugging Face) con pipeline `image-text-to-text`, lo que indica que acepta entradas multimodales de imagen y texto. El modelo cuenta con 748.008.384 parámetros (aproximadamente 748 millones), un tamaño contenido que lo sitúa en la gama de modelos pequeños aptos para despliegue en hardware de consumo.

La relevancia de esta publicación radica en su formato y su modo de uso: al estar cuantizado en GGUF, puede ejecutarse directamente con llama.cpp mediante el comando `llama serve -hf ggml-org/vllm-d3-edge-GGUF`. Además, el autor indica que debe utilizarse a través de la API `/v1/systemone`, un endpoint específico documentado en el repositorio de llama.cpp (PR 30383), lo que sugiere una integración orientada a la toma de decisiones automatizada más que a la generación de texto conversacional convencional.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su modificación. La información pública disponible es limitada: no se detallan la longitud de contexto, los idiomas soportados ni los datos de entrenamiento, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 748.008.384 (≈748 M) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF cuantizado (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 7,3 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base vllm-sr/d3-edge en la documentación disponible. El etiquetado como `decision-model` y su exposición mediante el endpoint `/v1/systemone` sugieren un diseño orientado a la selección o clasificación de decisiones dentro de un flujo de inferencia, pero no se especifica si emplea un transformer estándar, una variante multimodal con codificador visual o algún otro esquema.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente indica que se trata de una conversión automática realizada con la herramienta https://github.com/ggml-org/convert a partir del modelo original vllm-sr/d3-edge, sin aportar detalles adicionales sobre el proceso de entrenamiento.

## Capacidades

- Procesamiento multimodal de imagen y texto, según el pipeline `image-text-to-text` declarado en Hugging Face.
- Toma de decisiones: el modelo está etiquetado como `decision-model` y se invoca a través del endpoint `/v1/systemone`, lo que indica un uso previsto para seleccionar o resolver decisiones dentro de un pipeline.
- Ejecución local mediante llama.cpp y la aplicación Llama (https://llama.app).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios que exponen una API HTTP.
- Uso conversacional: la etiqueta `conversational` aparece entre los tags del repositorio.
- No se dispone de información sobre soporte de tool calling, razonamiento multi-paso, capacidades multilingües específicas ni modos especiales como thinking o audio.

## Casos de uso

- Enrutamiento de decisiones en pipelines de inferencia: el modelo puede integrarse en el endpoint `/v1/systemone` para resolver decisiones intermedias (por ejemplo, seleccionar la siguiente acción o herramienta) dentro de un sistema mayor, aprovechando su naturaleza de modelo de decisión.
- Clasificación de entradas imagen-texto: al aceptar pares de imagen y texto, puede emplearse para categorizar o etiquetar contenido multimodal en flujos de preprocesamiento.
- Despliegue en dispositivos de borde: con 748 M de parámetros y formato GGUF, es viable ejecutarlo en equipos con recursos limitados, como portátiles o mini-PC, para tareas de decisión locales sin dependencia de la nube.
- Prototipado rápido de agentes: la ejecución mediante `llama serve` permite levantar un servidor local compatible con API y probar lógicas de decisión conversacional en entornos de desarrollo.
- Filtrado y moderación de contenido multimodal: su capacidad de procesar imagen y texto permite usarlo como componente de cribado previo en sistemas que reciben entradas mixtas.
- Integración en aplicaciones de escritorio: a través de la app Llama o de llama.cpp, puede incorporarse a herramientas locales que requieran un componente de decisión sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 748 M de parámetros, las cuantizaciones GGUF habituales de 4 bits ocuparían del orden de 0,5 GB de pesos, aunque el nivel de cuantización concreto del repositorio no se especifica.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) debería poder alojarlo con holgura.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: llama.cpp (`llama serve -hf ggml-org/vllm-d3-edge-GGUF`) y la aplicación Llama (https://llama.app). No se mencionan vLLM, TGI ni Ollama en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión multimodal en formato GGUF) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- La información pública es muy escasa: se desconocen arquitectura, contexto, idiomas y datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Al ser un modelo de decisión diseñado para el endpoint `/v1/systemone`, su uso fuera de ese contrato de API puede no comportarse como un modelo conversacional convencional.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad o fiabilidad.
- Riesgo de alucinación y sesgos: no documentados, pero aplicables por defecto a cualquier modelo de lenguaje sin evaluación publicada.
- La conversión es automática (herramienta ggml-org/convert), lo que puede introducir diferencias respecto al modelo original vllm-sr/d3-edge.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original antes de desplegarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/vllm-d3-edge-GGUF
- Árbol de archivos: https://huggingface.co/ggml-org/vllm-d3-edge-GGUF/tree/main
- Modelo base: https://huggingface.co/vllm-sr/d3-edge
- Pull request de llama.cpp con el endpoint `/v1/systemone`: https://github.com/ggml-org/llama.cpp/pull/30383
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación Llama: https://llama.app
