# diljitpr/Qwen3.5-397B-A17B-Q4_K_M-slices

## Resumen

Este repositorio, publicado por el usuario diljitpr, no contiene un modelo nuevo sino una redistribución de Qwen3.5-397B-A17B, el primer modelo de pesos abiertos de la serie Qwen3.5 de Alibaba. Concretamente, toma la cuantización Q4_K_M en GGUF realizada por Unsloth y la divide en un archivo por capa: `embed.gguf`, 60 archivos `layer-000.gguf` a `layer-059.gguf` y `head.gguf`, más un `model.json` con el recuento de capas y los SHA-256 de cada archivo. El modelo subyacente es un vision-lenguaje nativo de 397.000 millones de parámetros totales y 17.000 millones activos por paso forward, con arquitectura híbrida de atención lineal y mezcla de expertos dispersa, contexto de 256K tokens y licencia Apache 2.0.

La relevancia de este repositorio es de infraestructura, no de modelado: está pensado para Sangama, un sistema que ejecuta un modelo repartido entre varios ordenadores mediante pipeline parallelism, de forma que cada máquina descarga únicamente las capas que va a servir. Esto evita tener que alojar los 244,8 GB de la cuantización Q4_K_M en un solo host y abre la puerta a servir un modelo de 397B en clústeres de GPUs modestas o heterogéneas. El autor afirma que los pesos, la cuantización y los metadatos son idénticos a los del GGUF original de Unsloth y que los rangos ensamblados producen salidas bit a bit iguales.

La contrapartida es que se trata de un formato no estándar: cargar un rango de capas requiere una versión de llama.cpp con los parches de layer-range de Sangama, y llama.cpp de serie no puede cargar un modelo parcial. Es, por tanto, una pieza para entornos controlados que ya usan ese stack, no una alternativa directa a los GGUF convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atencion lineal y mezcla de expertos (MoE) dispersa; vision-lenguaje nativa |
| Parametros totales | 397B (modelo base Qwen3.5-397B-A17B) |
| Parametros activos | 17B por paso forward |
| Longitud de contexto | 256K tokens (segun fuentes de terceros sobre el modelo base) |
| Tipos de cuantizacion | Q4_K_M (k-quant, con etiqueta imatrix en el repositorio); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | 201 idiomas segun fuentes de terceros; la model card del repositorio no los especifica |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF fragmentado por capas: `embed.gguf`, `layer-000.gguf` a `layer-059.gguf`, `head.gguf`, `model.json` |
| Numero de capas | 60 |
| Tamano del repositorio | 244,8 GB |
| Modelo base | Qwen/Qwen3.5-397B-A17B; cuantizacion de unsloth/Qwen3.5-397B-A17B-GGUF |

Nota sobre el recuento de parametros: los metadatos de safetensors del repositorio declaran 1.017.118.720 parametros, una cifra que no corresponde al modelo completo, sino a un fragmento del mismo, dado que el repositorio esta partido en archivos GGUF por capa (cada capa ronda los 4,04-4,05 GB). Para verificar integridad debe usarse `model.json` y sus SHA-256.

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura híbrida que combina un mecanismo de atencion lineal con un modelo de mezcla de expertos dispersa, segun la descripcion de Alibaba Cloud Model Studio. Es un modelo vision-lenguaje nativo, con soporte de visión y vídeo, y un total de 397B parámetros de los que solo 17B se activan por paso forward, lo que reduce el coste computacional por token respecto a un modelo denso del mismo tamaño. El contexto declarado es de 256K tokens y la cobertura lingüística de 201 idiomas, según las fuentes de terceros consultadas.

Este repositorio concreto no aporta entrenamiento ni modificación de pesos: es una operación de empaquetado. Los seis fragmentos Q4_K_M originales se dividieron en archivos GGUF por capa con `scripts/split-gguf.py` de Sangama, conservando pesos, cuantización y metadatos. Cada archivo es un GGUF válido con los metadatos completos del modelo, y un nodo que sirve el rango de capas `[A, B)` descarga solo los archivos de ese rango (más `embed.gguf` si `A = 0` y `head.gguf` si `B = 60`), los verifica contra `model.json` y los ensambla en un único GGUF.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Generación de texto y comprensión del lenguaje en 201 idiomas según las fuentes de terceros sobre el modelo base.
- Razonamiento lógico y matemático, citado explícitamente entre las tareas destacadas del modelo por Alibaba Cloud Model Studio.
- Generación de código, también mencionada entre las capacidades destacadas del modelo base.
- Capacidades de agente y razonamiento multi-paso, según la descripción de Alibaba Cloud Model Studio, que enmarca la serie Qwen3.5 dentro de los "agentes multimodales nativos".
- Visión nativa: procesamiento de imágenes integrado en el propio modelo, no como adaptador externo.
- Vídeo: el modelo base se describe como multimodal con soporte de vídeo.
- Ventana de contexto de 256K tokens, adecuada para documentos extensos y conversaciones multi-turno largas.
- Ejecución distribuida por capas: capacidad específica de este repositorio, que permite servir el modelo repartido entre varias máquinas mediante pipeline parallelism.
- El detalle sobre tool calling o function calling no está confirmado en la información disponible.

## Casos de uso

- Despliegue distribuido en clúster heterogéneo: con Sangama, cada nodo descarga y sirve solo un rango de capas, de modo que un clúster de máquinas con GPUs de distinta capacidad puede ejecutar el modelo completo sin que ningún host necesite 245 GB de almacenamiento ni de VRAM.
- Aprovechamiento de hardware sobrante en laboratorio o universidad: varias estaciones de trabajo con una o dos GPUs cada una pueden encadenarse en pipeline parallelism para servir un modelo de 397B que no cabría en ninguna de ellas por separado.
- Optimización de ancho de banda y almacenamiento en el despliegue: al descargar solo las capas asignadas, cada nodo evita los 244,8 GB completos, lo que simplifica el aprovisionamiento en entornos con red limitada.
- Atención al cliente multilingüe: la cobertura de 201 idiomas y el contexto de 256K permiten gestionar conversaciones multi-turno largas y mantener el historial completo de la interacción sin truncar.
- Análisis de documentación extensa: informes técnicos, expedientes o contratos de cientos de páginas caben en la ventana de contexto, lo que permite resumir, extraer entidades y responder preguntas sobre el documento completo en una sola pasada.
- Generación y revisión de código en producción: la capacidad de generación de código del modelo base lo hace apto para integrarse en pipelines de CI/CD como revisor automático de pull requests o generador de tests, siempre que el despliegue se haga sobre el stack compatible.
- Agentes multimodales sobre capturas y vídeo: al ser vision-lenguaje nativo, puede interpretar capturas de pantalla, diagramas o fotogramas de vídeo dentro de flujos de automatización de interfaz o inspección visual.
- Apoyo a decisiones con razonamiento lógico: análisis de escenarios, verificación de argumentaciones o resolución de problemas estructurados con contexto largo de documentación de respaldo.
- Investigación sobre cuantización y despliegue por capas: los archivos por capa y el `model.json` con hashes facilitan experimentos reproducibles sobre cómo afecta el reparto de capas a la latencia y al throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las fuentes de terceros describen el modelo base como de rendimiento "state-of-the-art comparable a modelos de vanguardia" en comprensión del lenguaje, razonamiento lógico, generación de código y agentes, pero no aportan cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. Este repositorio, además, no publica mediciones propias de latencia, throughput ni comparación bit a bit más allá de la afirmación de equivalencia funcional con el GGUF de origen.

## Requisitos de hardware

- Pesos de esta cuantización: 244,8 GB en disco (Q4_K_M, 60 capas de 4,04-4,05 GB, más embeddings y cabeza).
- VRAM para cargar el modelo completo en memoria: aproximadamente 245 GB solo para pesos, más el espacio de caché KV, cuya magnitud depende de la configuración de atención y del contexto utilizado (no disponible). Como referencia, esto exige del orden de 4 GPUs H100 de 80 GB (320 GB) o 8 A100 de 80 GB; es una estimación derivada del tamaño de los archivos, no un dato publicado.
- Modelo base en BF16: alrededor de 794 GB de pesos (estimación a partir de 397.000 millones de parámetros a 2 bytes), lo que requiere del orden de 10 GPUs H100 de 80 GB.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Solo sería viable con offload parcial a RAM y SSD mediante llama.cpp, con latencias muy elevadas; no hay datos publicados de ese escenario.
- GPUs de centro de datos recomendadas: H100 80 GB, A100 80 GB, H200; el modelo base en BF16 exige nodos de 8 GPUs como mínimo.
- Alternativa al hardware único: la propia razón de ser del repositorio, repartir las 60 capas entre varias máquinas mediante Sangama, evitando concentrar toda la VRAM en un solo host.
- Opciones de despliegue: llama.cpp con los parches de layer-range de Sangama, que son obligatorios para cargar un modelo parcial. llama.cpp estándar, Ollama, LM Studio, vLLM, TGI o SGLang no pueden cargar estos fragmentos por sí solos; para esos stacks habría que usar el GGUF completo de Unsloth o los pesos originales de Qwen.
- Latencia y throughput: no disponibles. Cabe esperar que el coste por token se acerque al de un modelo denso de 17B en cómputo, pero con el requisito de ancho de banda de memoria de un modelo de 397B y con una penalización adicional por la comunicación entre nodos en el modo distribuido, extremo no cuantificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diljitpr/Qwen3.5-397B-A17B-Q4_K_M-slices | 397B totales / 17B activos | 256K | GGUF Q4_K_M dividido por capa (61 archivos + `model.json`) | Apache 2.0 | Publico; requiere llama.cpp parcheado con Sangama |
| Qwen/Qwen3.5-397B-A17B | 397B totales / 17B activos | 256K | safetensors (BF16) | Apache 2.0 | Publico; formato estandar para vLLM, TGI o SGLang |
| unsloth/Qwen3.5-397B-A17B-GGUF | 397B totales / 17B activos | 256K | GGUF Q4_K_M en 6 partes | Apache 2.0 | Publico; compatible con llama.cpp estandar y herramientas derivadas |

Los tres repositorios contienen el mismo modelo y la misma cuantización de base; la diferencia es el empaquetado. Los pesos originales en safetensors son la opción para servidores de inferencia convencionales, el GGUF completo de Unsloth es la vía para llama.cpp y derivados en un solo host o con offload, y este repositorio es específico para ejecución repartida por capas. No se dispone de datos de rendimiento comparativos entre los tres formatos en la información proporcionada.

## Limitaciones y advertencias

- Repositorio de terceros sin adopción verificada: 0 descargas y 0 likes en el momento de la consulta. No está afiliado a Qwen ni a Unsloth, y ninguno de los dos lo respalda, según la propia model card.
- Incompatibilidad con el ecosistema estándar: cargar un rango de capas exige llama.cpp con los parches de layer-range de Sangama. La versión estándar de llama.cpp, Ollama, LM Studio y la mayoría de herramientas de usuario final no pueden abrir estos archivos parciales.
- Discrepancia en los metadatos: el recuento de safetensors del repositorio (1.017.118.720 parámetros) no coincide con los 397B del modelo base. Conviene verificar la integridad con los SHA-256 de `model.json` antes de desplegar.
- Degradación por cuantización: Q4_K_M reduce la precisión respecto a BF16. El impacto sobre tareas de razonamiento y código no está cuantificado en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia. No hay tasas de alucinación publicadas para este empaquetado ni para el modelo base en las fuentes consultadas.
- Sesgos: no se dispone de información sobre sesgos conocidos, evaluación de equidad ni composición del dataset de entrenamiento.
- Idiomas: aunque las fuentes de terceros citan 201 idiomas, la model card del repositorio no detalla la lista ni garantiza un rendimiento homogéneo entre ellos. La calidad por idioma no está documentada.
- Contexto largo: los 256K tokens son una cifra declarada; no hay datos sobre la calidad efectiva de recuperación en contextos muy extensos.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero al ser una redistribución conviene conservar la atribución a Qwen y a Unsloth tal como hace el repositorio, e incluir el archivo `LICENSE`.
- Coste de infraestructura: 244,8 GB de descarga y almacenamiento por copia completa, y un requisito de VRAM agregada muy alto incluso repartido entre nodos.
- Tool calling y function calling: no confirmados explícitamente en la información disponible, algo crítico si se pretende integrar el modelo en pipelines de agentes que dependan de esa función.
- Fecha de creación del repositorio: 29 de septiembre de 2026, según los metadatos de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/diljitpr/Qwen3.5-397B-A17B-Q4_K_M-slices
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Cuantización GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.5-397B-A17B-GGUF
- Repositorio de Sangama: https://github.com/devdil/sangama
- Qwen3.5-397B-A17B en Alibaba Cloud Model Studio: https://help.aliyun.com/en/model-studio/qwen3-5-397b-a17b
- Documentación de Qwen3.5-397B-A17B en Alibaba Cloud: https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-5-397b-a17b
- Análisis de arquitectura, evaluaciones y rendimiento de inferencia (SemiAnalysis InferenceX): https://inferencex.semianalysis.com/model/qwen-3-5
- Ficha de especificaciones de Qwen3.5 (AI/TLDR): https://ai-tldr.dev/models/qwen3-5/
- Guía para ejecutar Qwen3.5 en local (discusión en HuggingFace): https://huggingface.co/Qwen/Qwen3.5-397B-A17B/discussions/14
