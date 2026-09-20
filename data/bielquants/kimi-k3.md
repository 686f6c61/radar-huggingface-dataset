# bielquants/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal nativo orientado a tareas de agente, desarrollado por Moonshot AI, con 2,8 billones de parámetros totales (2.779.931.837.184 según los pesos safetensors publicados) y 104.000 millones de parámetros activos. Se construye sobre una arquitectura MoE de altísima dispersión (16 expertos activos de 896) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), capacidades nativas de visión y una ventana de contexto de 1.000.000 de tokens. Su model card lo presenta como el primer modelo abierto de clase 3T, enfocado a codificación de horizonte largo, trabajo de conocimiento y razonamiento.

El repositorio analizado, bielquants/Kimi-K3, no es la publicación oficial de Moonshot AI, sino una réplica subida por el usuario bielquants en formato compressed-tensors de 8 bits, con 0 descargas y 0 me gusta en el momento de la consulta, 1.561 GB de tamaño de repositorio y fecha de creación 2026-09-19. La model card reproduce íntegramente la documentación del modelo original de Moonshot AI, y los enlaces que contiene apuntan a los recursos oficiales (kimi.com, moonshot.ai, organización moonshotai en HuggingFace, ModelScope, blog técnico e informe completo en PDF).

La relevancia de la ficha es doble: por un lado documenta un salto de escala poco habitual en pesos abiertos (clase 3T con 104B activos y contexto de 1M tokens); por otro, advierte de que esta copia concreta es una redistribución de terceros sin validación ni métricas publicadas, por lo que cualquier uso en producción debería partir de los pesos oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes); 93 capas (1 densa), composición de capas de atención: 69 KDA + 24 Gated MLA |
| Parametros totales | 2,8 B según model card; 2.779.931.837.184 según los safetensors del repositorio |
| Parametros activos | 104 B (16 de 896 expertos por token) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | 8 bits (etiqueta compressed-tensors); no se documentan otros formatos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (license: other, license_name: "kimi-k3"); términos concretos no detallados en la información disponible |
| Formato de pesos | safetensors (compressed-tensors, 8 bits); requiere código personalizado (custom_code) |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE con dos innovaciones estructurales declaradas: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes). De las 93 capas, 69 emplean KDA y 24 emplean Gated MLA (atención latente multi-cabeza con compuerta), lo que configura una arquitectura de atención híbrida. La dimensión oculta de atención es 7.168 con 96 cabezas. El bloque MoE sigue el esquema Stable LatentMoE: dimensión latente de 3.584, 896 expertos de dimensión oculta 3.072 cada uno, y selección de 16 expertos por token. La model card cifra en aproximadamente 2,5 veces la mejora de eficiencia de escalado respecto a Kimi K2.

El modelo incorpora multimodalidad nativa (texto, imagen y vídeo en el mismo modelo) y está diseñado para sesiones de ingeniería prolongadas, navegación de repositorios grandes, orquestación de herramientas de terminal, investigación profunda con visualizaciones y diseño de movimiento o edición de vídeo. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO: esa información no aparece en el material proporcionado, que además está truncado en la sección de especificaciones (la tabla de la model card se corta tras "Selected Experts per Token").

## Capacidades

- Generación de texto y razonamiento de propósito general, con ventana de contexto de 1.000.000 de tokens.
- Comprensión nativa de imagen y vídeo, además de texto (pipeline declarado: image-text-to-text).
- Codificación de horizonte largo: sesiones de ingeniería sostenidas con supervisión humana mínima, según la model card.
- Navegación de repositorios de gran tamaño y orquestación de herramientas de terminal.
- Optimización de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con visión en el bucle, CAD y diseño de chips (casos citados explícitamente por el autor).
- Trabajo de conocimiento de extremo a extremo: investigación profunda con visualizaciones interactivas, widgets y paneles.
- Diseño de movimiento y edición de vídeo.
- Soporte de tool calling / function calling: no se documenta de forma explícita en la información disponible, aunque la orientación agéntica y la orquestación de herramientas de terminal sí se mencionan.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking): no se menciona en la información disponible.

## Casos de uso

- Auditoría y refactorización de monorepos grandes: con 1M tokens de contexto, el modelo puede ingerir repositorios completos o conjuntos de módulos relacionados y razonar sobre dependencias cruzadas sin trocear el código en fragmentos inconexos.
- Agentes de ingeniería autónomos en CI/CD: sesiones largas con orquestación de terminal permiten ejecutar, leer resultados y corregir ciclos de compilación o pruebas con intervención humana mínima.
- Optimización de kernels y código de bajo nivel: la model card cita explícitamente la optimización de kernels de GPU y el desarrollo de compiladores como escenarios objetivo.
- Investigación profunda asistida con salida visual: generación de informes con visualizaciones interactivas, paneles y widgets a partir de documentos y fuentes multimodales.
- Análisis de vídeo técnico o corporativo: al ser multimodal nativo, puede procesar vídeo y texto conjuntamente para resúmenes, extracción de eventos o control de calidad.
- Diseño de movimiento y posproducción de vídeo: asistencia en tareas de edición y diseño animado descritas por el autor.
- Revisión de documentación técnica multiformato: ingesta de PDF, diagramas e imágenes junto a texto largo para producir resúmenes o extracción estructurada.
- Prototipado CAD o diseño de circuitos asistido: escenario citado por la model card, adecuado por la combinación de visión y razonamiento de horizonte largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta eval-results y la model card enlaza a un informe técnico completo (k3_tech_report.pdf), pero no se han facilitado cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni datos comparativos frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos de 8 bits, los 2,78 B de parámetros ocupan aproximadamente 2,78 TB; a 4 bits la cifra teórica bajaría a unos 1,4 TB. Son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- Discrepancia a revisar: el repositorio declara 1.561 GB de tamaño frente a los ~2,78 TB que implicaría una cuantización de 8 bits real (equivalente a ~4,5 bits por parámetro). Conviene verificar el contenido real de los shards antes de planificar el despliegue.
- GPU recomendadas: no cabe en ninguna GPU de consumo. A 8 bits se necesitarían del orden de 20 GPU H200 (141 GB) o unas 35 H100/A100 de 80 GB solo para alojar los pesos, sin contar caché KV ni buffers de activación. Es una estimación, no un dato oficial.
- GPU de consumo (RTX 4090, 24 GB): no viable ni con cuantizaciones agresivas, dado el orden de magnitud del modelo.
- Opciones de despliegue: transformers con custom_code (formato safetensors/compressed-tensors). vLLM, SGLang, TGI, llama.cpp u Ollama no se mencionan en la información disponible; no hay pesos GGUF publicados en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (Moonshot AI) | 2,8 B (2.779.931.837.184 en safetensors) | 104 B | 1.000.000 tokens | Kimi K3 License | Pesos abiertos; repositorio oficial en la organización moonshotai |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card como predecesor, con una mejora declarada de ~2,5x en eficiencia de escalado a favor de K3 |
| Otras alternativas de clase similar | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos comparativos en la información disponible |

No se dispone de datos de rendimiento, licencia ni contexto de modelos alternativos en el material proporcionado, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Repositorio no oficial: bielquants/Kimi-K3 es una redistribución de terceros, con 0 descargas y 0 me gusta, sin evidencias de validación. Para uso real conviene acudir a los pesos oficiales de Moonshot AI.
- Inconsistencia de tamaño: la etiqueta indica 8 bits pero el repositorio ocupa 1.561 GB, muy por debajo de los ~2,78 TB esperables; verificar integridad y formato de los shards antes de cualquier despliegue.
- Licencia restrictiva o poco clara: se declara license: other con license_name "kimi-k3"; los términos concretos (uso comercial, redistribución, límites de escala) no están detallados en la información disponible y deben consultarse en el fichero LICENSE antes de cualquier uso en producción.
- Idiomas soportados: no disponible. No se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos de los evaluados internamente por el autor.
- Sesgos conocidos: no disponibles. No hay documentación sobre sesgos demográficos, culturales o lingüísticos.
- Riesgo de alucinación: no cuantificado en la información disponible. En un modelo de este tipo, con contexto de 1M tokens y comportamiento agéntico, el riesgo de acciones erróneas encadenadas en entornos de ejecución real es relevante y exige supervisión y sandboxing.
- Requisitos de infraestructura extremos: el despliegue en 8 bits exige clústeres multi-nodo con aproximadamente 2,8 TB de memoria agregada, lo que descarta entornos de una sola máquina.
- Documentación incompleta: la model card proporcionada está truncada y no incluye la tabla completa de especificaciones, detalles de entrenamiento, datos de benchmarks ni política de idiomas.
- Resultados de la búsqueda web: las consultas realizadas no devolvieron información relevante sobre el modelo (los resultados correspondían a un sitio web no relacionado), por lo que no se ha podido contrastar ni ampliar la información de la model card.

## Enlaces

- Modelo en HuggingFace (réplica analizada): https://huggingface.co/bielquants/Kimi-K3
- Organización oficial en HuggingFace: https://huggingface.co/moonshotai
- Modelo oficial de referencia: https://huggingface.co/moonshotai/Kimi-K3
- Fichero de licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Web oficial: https://www.moonshot.ai
- Chat: https://www.kimi.com
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
