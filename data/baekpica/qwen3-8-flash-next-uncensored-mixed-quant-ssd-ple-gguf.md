# Baekpica/Qwen3.8-Flash-Next-Uncensored-Mixed-Quant-SSD-PLE-GGUF

## Resumen

El modelo `Baekpica/Qwen3.8-Flash-Next-Uncensored-Mixed-Quant-SSD-PLE-GGUF` es una conversión cuantizada en formato GGUF del checkpoint `orcarouter/Qwen3.8-Flash-Next-Uncensored`, a su vez una variante «uncensored» (abliterated) del modelo Qwen3.8-Flash-Next de Qwen, el primer modelo abierto basado en la arquitectura Qwen4. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 125 mil millones de parámetros lógicos, que activa alrededor de 6 mil millones por token, complementado por una tabla de incrustación predictiva latente (PLE) de 51,2 mil millones de parámetros que se almacena en un sidecar SSD en BF16.

La relevancia de este artefacto radica en su estrategia de cuantización mixta y descarga a SSD (SSD-offload), que permite ejecutar un modelo de casi 180 mil millones de parámetros totales en hardware con memoria limitada, como estaciones de trabajo con GPU de consumo o incluso equipos con 64 GB de RAM. El autor, Baekpica, publica la receta exacta de cuantización y los manifiestos de verificación, lo que facilita la auditoría y reproducibilidad del artefacto. No obstante, se requiere un cargador externo especializado (`ds4`) para gestionar la tabla PLE, y no se garantiza compatibilidad con runtimes GGUF estándar como llama.cpp o vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido GDN + QSA (Qwen4) con tabla PLE n-gram |
| Parametros totales | 179.999.981.459 (checkpoint fuente); 128.799.735.699 lógicos principales + 51.200.245.760 de tabla PLE |
| Parametros activos | ~6.000.000.000 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: Q4_K, Q5_K, Q5_0, Q8_0, BF16, F32, I64 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (3 archivos principales) + sidecar PLE BF16 (4 archivos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de atención denominada GDN + QSA, según el repositorio oficial de Qwen. Se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 125 mil millones de parámetros lógicos y una activación de unos 6 mil millones por token. La innovación más destacada es la tabla de incrustación predictiva latente (PLE), un componente de 51,2 mil millones de parámetros que funciona como una tabla n-gram y se almacena fuera del cómputo principal, paginada desde SSD durante la inferencia.

El artefacto publicado por Baekpica es una conversión directa a BF16 del checkpoint fuente, seguida de una cuantización mixta por niveles de tensor siguiendo la receta `MQ-Q5-SSD-PLE-BF16`. La receta reduce únicamente los niveles K-quant de la versión Q6 de referencia: 88 tensores pasan de Q5_K a Q4_K y 56 tensores de Q6_K a Q5_K. Los tensores de visión, convolución, hiperconexión y control recurrente se mantienen en BF16 o F32 donde es necesario. No se realiza poda, eliminación ni fusión de expertos. La tabla PLE se extrae directamente del checkpoint fuente y los cuatro archivos resultantes son byte-idénticos a los de referencia pública.

El entrenamiento original del modelo base no está documentado en la información disponible; solo se indica que la variante «uncensored» ha sido sometida a un proceso de abliteración (eliminación de capas de rechazo o censura). No se dispone de detalles sobre el dataset, el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multilingüe, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imágenes: el pipeline declarado es `image-text-to-text`, lo que indica capacidad multimodal (entrada de imagen y texto, salida de texto).
- Ejecución en hardware con memoria limitada gracias al offload de la tabla PLE a SSD, lo que permite cargar solo los parámetros activos en memoria principal.
- Variante «uncensored» (abliterated): se ha eliminado el rechazo a ciertas instrucciones, lo que permite respuestas sin filtros de seguridad en escenarios controlados.
- Soporte de cuantización mixta por tensor, optimizada para kernels específicos (colas de expertos, matrices siempre activas, etc.).
- No se confirma soporte de tool calling, function calling, agentes o modo de razonamiento explícito en la información disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: gracias a la cuantización mixta y el offload SSD, un equipo con 64 GB de RAM y una GPU con 24 GB de VRAM puede ejecutar el modelo completo sin necesidad de múltiples GPUs de centro de datos.
- Experimentación con modelos MoE de gran escala en entornos de investigación: la tabla PLE paginada desde SSD reduce drásticamente los requisitos de memoria, facilitando estudios sobre comportamiento de expertos y atención híbrida.
- Desarrollo de asistentes conversacionales sin restricciones de contenido: la variante abliterated permite explorar respuestas en dominios donde el modelo base aplicaría rechazos, como escritura creativa, análisis de escenarios hipotéticos o generación de contenido para ficción.
- Prototipado de sistemas multimodales: al declarar pipeline `image-text-to-text`, puede integrarse en aplicaciones que requieran comprensión conjunta de imágenes y texto, aunque se debe verificar el soporte real del cargador ds4.
- Auditoría y reproducibilidad de artefactos cuantizados: los manifiestos incluidos (SHA256SUMS, `quant-recipe.yaml`, `artifact-manifest.json`) permiten verificar la integridad del modelo y replicar la receta de cuantización en otros entornos.
- Despliegue en servidores con almacenamiento SSD de alta velocidad y GPUs moderadas: la combinación de cuantización Q4/Q5 y offload SSD posibilita servir el modelo en infraestructura de coste reducido, siempre que se disponga del cargador ds4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este artefacto cuantizado ni para el modelo base.

## Requisitos de hardware

- La tabla PLE de 51,2 mil millones de parámetros en BF16 ocupa 95,37 GiB y se almacena en SSD; se requiere un disco con al menos 100 GiB libres y un ancho de banda de lectura sostenido alto (NVMe recomendado).
- El payload principal cuantizado ocupa 77,55 GiB, por lo que se necesita un mínimo de 64 GB de RAM o VRAM combinada para alojar los parámetros activos y el espacio de trabajo.
- Según la guía de Atomic Chat, el modelo puede ejecutarse desde un MacBook con 64 GB de RAM unificada, lo que sugiere que es viable en equipos sin GPU dedicada siempre que se use el cargador adecuado.
- Para aceleración por GPU, se recomienda al menos una GPU con 24 GB de VRAM (p. ej., RTX 3090/4090) para mantener los tensores principales en memoria de alta velocidad.
- Se requiere un cargador externo especializado denominado `ds4` para gestionar el sidecar SSD-PLE; no se garantiza compatibilidad con llama.cpp, vLLM, SGLang ni otros runtimes GGUF genéricos.
- No se dispone de datos de latencia o throughput medidos; dependerán críticamente del ancho de banda del SSD y de la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~125B MoE (6B activos) + 51B PLE | no disponible | qwen | safetensors | Modelo original de Qwen, sin cuantizar |
| Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-SSD-PLE-GGUF | 128,8B lógicos + 51,2B PLE | no disponible | qwen-community-1.0 | GGUF + sidecar SSD | Cuantización Q6 mixta, sin abliteración |
| Este artefacto (uncensored) | 128,8B lógicos + 51,2B PLE | no disponible | qwen-community-1.0 | GGUF + sidecar SSD | Cuantización Q5 mixta, abliterated |

No se dispone de datos de rendimiento comparativo entre estas variantes. La elección entre ellas depende principalmente de la necesidad de contenido sin censura y de la tolerancia a una cuantización más agresiva (Q5 frente a Q6).

## Limitaciones y advertencias

- Requiere un cargador externo propietario (`ds4`) no publicado en los repositorios estándar; la interoperabilidad con runtimes comunes no está garantizada.
- El modelo es una variante «uncensored» (abliterated): puede generar contenido inapropiado, ofensivo o peligroso. No debe desplegarse en aplicaciones orientadas al público sin medidas de control adicionales.
- No se han publicado benchmarks de calidad; el impacto de la cuantización mixta Q5/Q4 sobre el rendimiento real es desconocido.
- La licencia `qwen-community-1.0` puede imponer restricciones de uso comercial; es necesario revisar el texto completo de la licencia antes de cualquier despliegue en producción.
- La tabla PLE se pagina desde SSD, lo que introduce latencia adicional y depende críticamente del rendimiento del almacenamiento; en discos lentos la inferencia puede degradarse significativamente.
- No se dispone de información sobre la longitud de contexto soportada ni sobre los idiomas cubiertos; estos datos deben obtenerse del modelo base original.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que el artefacto es reciente y aún no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/Baekpica/Qwen3.8-Flash-Next-Uncensored-Mixed-Quant-SSD-PLE-GGUF
- Modelo base (uncensored): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Receta de cuantización de referencia (versión Q6): https://huggingface.co/Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-SSD-PLE-GGUF
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guía de ejecución local (Atomic Chat): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Hilo de NVIDIA Forums sobre Qwen3.8-Flash-Next: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228/90
