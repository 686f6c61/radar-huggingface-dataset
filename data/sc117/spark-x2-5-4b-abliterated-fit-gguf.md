# SC117/Spark-X2.5-4B-abliterated-FIT-GGUF

## Resumen

Spark-X2.5-4B-abliterated-FIT-GGUF es una cuantización GGUF del modelo base XHToken/Spark-X2.5-4B, creada por SC117 mediante la herramienta FIT-GGUF v0.2.0. Se trata de un modelo de lenguaje de 4.112.079.360 parámetros con arquitectura de atención híbrida y ventana de contexto de un millón de tokens, que ha sido sometido a un proceso de `abliteration` (identificado como T615) para reducir comportamientos de rechazo o restricciones de seguridad. La suite FIT-GGUF ofrece cuatro niveles de fidelidad con tamaños entre 2,26 y 3,15 GiB, todos verificados contra el modelo de referencia en BF16 mediante medidas de divergencia KL y concordancia de tokens más probables.

El modelo se distribuye bajo licencia Apache-2.0 y soporta inglés y chino. Su relevancia actual radica en ofrecer un modelo compacto de 4B con contexto de 1M, con un comportamiento menos censurado y una cuantización de alta fidelidad, apto para inferencia local en hardware limitado. Al estar publicado en formato GGUF, puede ejecutarse directamente en llama.cpp, Ollama y otros entornos compatibles, lo que lo hace especialmente atractivo para despliegues en equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (hybrid-attention) |
| Parametros totales | 4.112.079.360 (4,11 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Cuatro niveles de fidelidad FIT-GGUF (tamaños de 2,26 a 3,15 GiB) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con pesos base en safetensors) |

## Arquitectura y entrenamiento

El modelo base utiliza una arquitectura de atención híbrida, que combina mecanismos de atención completa con otros de menor coste computacional, lo que le permite gestionar una ventana de contexto de un millón de tokens. No se dispone de información publicada sobre la composición exacta del dataset de entrenamiento, el número total de tokens procesados, ni sobre la aplicación de técnicas de alineación como RLHF o DPO.

El autor de esta publicación ha aplicado un proceso de `abliteration` (T615) sobre el modelo base, que modifica los pesos para eliminar ciertos comportamientos no deseados sin destruir la capacidad general. Posteriormente, los pesos se convirtieron a formato GGUF mediante FIT-GGUF, una capa determinista de planificación de tensores sobre la cuantización de llama.cpp. FIT-GGUF no se limita a presets tradicionales: busca la cuantización más pequeña que cumpla un contrato de fidelidad definido por el usuario, verificando cada archivo contra el modelo en BF16 con métricas de divergencia KL y concordancia de top tokens.

## Capacidades

- Generación de texto y conversación en inglés y chino.
- Ventana de contexto de 1M tokens, apta para procesar documentos completos o secuencias largas.
- Comportamiento `uncensored` o `abliterated`: tiende a no rechazar peticiones, lo que resulta útil para investigación de alineación, roleplay o generación de contenido sin restricciones.
- Inferencia eficiente en CPU o GPU con consumo reducido de memoria, gracias a los pesos GGUF de entre 2,26 y 3,15 GiB.
- Compatibilidad con llama.cpp y otros frameworks que soporten GGUF.
- Los archivos publicados cuentan con verificación de fidelidad por tensor frente a los pesos originales en BF16 (divergencia KL y concordancia same-top).

No se han publicado especificaciones sobre soporte de herramientas (`tool calling`), visión, audio o razonamiento explícito; esos datos no están disponibles.

## Casos de uso

- Asistente conversacional local en inglés y chino: puede ejecutarse en un portátil o mini PC con GPU modesta mediante llama.cpp u Ollama, ofreciendo un asistente bilingüe sin dependencia de servicios en la nube.
- Análisis de documentos extensos: gracias a la ventana de 1M tokens, es posible introducir manuales, informes o libros completos y obtener resúmenes o respuestas contextuales basadas en todo el texto.
- Investigación sobre alineación y filtros de seguridad: al ser un modelo `abliterated`, permite estudiar cómo responde un modelo de 4B en ausencia de los rechazos habituales de seguridad, útil para trabajos de interpretabilidad o evaluación de sesgos.
- Generación de contenido multilingüe: sirve para tareas de traducción, redacción o reescritura entre inglés y chino, aprovechando su entrenamiento bilingüe.
- Pruebas de cuantización y fidelidad: los cuatro niveles de FIT-GGUF permiten comparar el impacto de distintas cuantizaciones en la calidad de salida, usando las métricas de verificación incluidas.
- Despliegue en entornos de escritorio o servidores de bajo coste: el rango de pesos de 2,26 a 3,15 GiB posibilita cargar el modelo en sistemas con poca memoria, incluyendo CPU y GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos cuantizados ocupan entre 2,26 y 3,15 GiB, por lo que los requisitos mínimos de VRAM para contextos moderados se sitúan en torno a 4-5 GiB, incluyendo margen para el KV cache.
- Para utilizar la ventana completa de 1M tokens, la memoria necesaria para el KV cache puede superar la VRAM de una GPU de consumo; en esos casos se recomienda descargar parte del modelo a CPU o restringir la longitud de contexto.
- GPU recomendadas: en función del tamaño de los pesos, una RTX 3060, RTX 4060 o similar es suficiente para contextos moderados. Para contextos muy largos se necesitarían GPUs profesionales como A100 o H100, o bien ejecutar el modelo con `cpu offloading` en sistemas con suficiente RAM.
- Es compatible con hardware de consumo y puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python y cualquier otro framework compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información fiable para una comparativa directa con otros modelos de la misma categoría (tamaño 4B y contexto 1M) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; no se han publicado evaluaciones específicas sobre este modelo.
- Limitaciones de idioma: solo están verificados inglés y chino; la calidad en otros idiomas no está garantizada.
- Restricciones de licencia: la licencia del repositorio es Apache-2.0, lo que permite uso comercial, pero la licencia del modelo base no se ha verificado de forma explícita; se asume que es la misma.
- Advertencia para producción: al estar `abliterated`, el modelo puede generar contenido inapropiado, peligroso o no deseado sin filtros automáticos. Debe desplegarse con sistemas de moderación externos si el caso de uso lo exige.
- La verificación de FIT-GGUF se basa en métricas de fidelidad (KL y same-top), no en rendimiento downstream, por lo que puede existir pérdida de calidad en tareas específicas.
- La ventana de contexto de 1M no implica que la calidad de recuperación de información se mantenga constante a lo largo de toda la secuencia; no se han publicado evaluaciones de recuperación a esa escala.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/SC117/Spark-X2.5-4B-abliterated-FIT-GGUF
- Repositorio de FIT-GGUF: https://github.com/Scorp1o117/FIT-GGUF
- README en chino: https://huggingface.co/SC117/Spark-X2.5-4B-abliterated-FIT-GGUF/blob/main/README.zh-CN.md
- Modelo base (inferido del campo `base_model`): https://huggingface.co/XHToken/Spark-X2.5-4B
