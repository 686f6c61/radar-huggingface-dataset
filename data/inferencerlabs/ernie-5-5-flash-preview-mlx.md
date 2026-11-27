# inferencerlabs/ERNIE-5.5-Flash-Preview-MLX

## Resumen

ERNIE-5.5-Flash-Preview-MLX es una cuantización del modelo base `baidu/ERNIE-5.5-Flash-Preview`, publicada por el usuario `inferencerlabs` en Hugging Face. No se trata de un modelo original, sino de una build dinámica en formato MLX pensada para ejecutarse en hardware Apple Silicon (família M-series). La model card indica que los expertos del modelo MoE se han cuantizado a 4 bits, mientras que las capas sensibles se mantienen en mayor precisión para preservar la calidad en tareas de código.

El modelo base pertenece a la família ERNIE 5.5 de Baidu, del que se infiere una arquitectura MoE (mezcla de expertos) por la etiqueta `ernie5_5_moe` y por la referencia explícita a "expertos" en la descripción de la cuantización. Sin embargo, la información proporcionada no incluye el número total de parámetros, los parámetros activos, la longitud de contexto nativa ni la composición del dataset de entrenamiento del modelo original, por lo que esos datos se marcan como no disponibles.

La relevancia de esta ficha es doble: por un lado, documenta una opción de despliegue local en Mac para un modelo de gran porte (el autor reporta ~168-179 GiB de uso de memoria en un M3 Ultra); por otro lado, advierte de que la licencia no está disponible en la información proporcionada, lo que impide evaluar su uso comercial sin consultar la fuente original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), según etiqueta `ernie5_5_moe`; detalles del modelo base no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con 22.000 tokens, pero no especifica el máximo) |
| Tipos de cuantización | Q3, Q4, Q5, Q6, Q8, Q9 (bpw) y base BF16; build por defecto con expertos a 4 bits y capas sensibles en mayor precisión |
| Idiomas soportados | inglés (`en`) según la model card; no se documentan otros idiomas |
| Licencia | no disponible |
| Formato de pesos | MLX (repo de 1,3 GB, lo que sugiere pesos cuantizados; no se listan ficheros safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo base es `baidu/ERNIE-5.5-Flash-Preview`, etiquetado como `ernie5_5_moe`, lo que indica una arquitectura de mezcla de expertos. La model card del autor de la cuantización no aporta detalles sobre el número de expertos, el enrutamiento, la dimensión oculta, el número de capas ni el volumen de tokens de entrenamiento. Tampoco se documenta si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento.

La innovación técnica destacable de esta publicación es el esquema de cuantización dinámica: los expertos se cuantizan a 4 bits y las capas consideradas sensibles se mantienen en mayor precisión. El autor reporta métricas de calidad de la cuantización (perplejidad, precisión de token y "missed divergence") para distintos niveles Q3-Q9, con una caída muy marcada en Q3 (perplejidad 168,0 y precisión de token 43,45 %) y una recuperación clara a partir de Q4 (perplejidad 1,33593 y precisión 91,65 %). La build se ha generado con una versión modificada de MLX.

## Capacidades

- Generación de texto en inglés, según la etiqueta de idioma del repo.
- Razonamiento y código: la model card menciona pruebas específicas de "Coding" y "Writing" con el motor Dspark, y justifica el esquema de cuantización por la precisión en código.
- Procesamiento de contextos largos: se reportan pruebas con 22.000 tokens de entrada.
- Ejecución local en Apple Silicon mediante la librería MLX.
- Soporte de tool calling, function calling, agentes o modo "thinking": no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistencia de código en local sobre Mac: la build mantiene capas sensibles en mayor precisión para conservar calidad en generación de código, y el autor reporta ~45 tokens/s en pruebas de coding con Dspark en un M3 Ultra; adecuado para desarrolladores que quieran un asistente sin enviar código a la nube.
- Redacción y generación de textos largos: el autor reporta ~35 tokens/s en pruebas de writing con Dspark y ~28 tokens/s con 22.000 tokens de contexto sin Dspark, lo que permite tareas de redacción con contexto extenso en estación de trabajo local.
- Procesamiento de documentos largos en local: la ventana de prueba de 22.000 tokens permite resumir o extraer información de documentos técnicos sin salir del equipo, siempre que se disponga de memoria unificada suficiente (~168 GiB reportados).
- Prototipado e investigación en entornos Apple Silicon: al estar en formato MLX, se integra con el ecosistema `ml-explore/mlx` para experimentación académica y evaluación de cuantizaciones.
- Evaluación comparativa de cuantizaciones: la tabla de perplejidad y precisión de token por nivel Q3-Q9 permite seleccionar el compromiso calidad/memoria adecuado para cada despliegue.
- Despliegue en estaciones de trabajo de alta memoria: con ~179 GiB en modo Dspark, encaja en configuraciones M3 Ultra de gama alta para inferencia interactiva de un modelo MoE de gran porte.
- No se recomienda para producción multilingüe ni para escenarios con requisitos de licencia no verificados, dado que la licencia no está disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas internas de calidad de cuantización y de velocidad de inferencia:

| Métrica | Q3 | Q4 | Q5 | Q6 | Q8 | Q9 | Base |
|---|---|---|---|---|---|---|---|
| Perplejidad | 168,0 | 1,33593 | 1,23437 | 1,21875 | 1,21875 | 1,20312 | 1,20312 |
| Precisión de token | 43,45 % | 91,65 % | 95,05 % | 96,65 % | 97,65 % | 97,80 % | 100 % |
| Missed divergence | 72,57 % | 17,28 % | 17,28 % | 12,03 % | 9,92 % | 9,60 % | 0,000 % |

Rendimiento de inferencia reportado por el autor (M3 Ultra):

| Configuración | Contexto | Velocidad | Memoria |
|---|---|---|---|
| M3 Ultra, sin Dspark | 22.000 tokens | ~28 tokens/s | ~168 GiB |
| M3 Ultra con Dspark, coding | 500 tokens | ~45 tokens/s | ~179 GiB |
| M3 Ultra con Dspark, writing | 500 tokens | ~35 tokens/s | ~179 GiB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~168 GiB sin Dspark y ~179 GiB con Dspark en M3 Ultra, según el autor; el repo ocupa 1,3 GB, pero los pesos completos en memoria son mucho mayores.
- GPU recomendadas: Apple Silicon de gama alta; el autor reporta pruebas en M3 Ultra. No se documentan pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU consumer? No con los datos reportados: 168-179 GiB exceden la VRAM de cualquier GPU consumer actual (RTX 4090: 24 GB). Solo es viable en configuraciones con memoria unificada muy alta o en multi-GPU con agregación de memoria.
- Opciones de despliegue: MLX (librería nativa) e Inferencer v2.5.5, según la model card. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~28 tokens/s con 22.000 tokens de contexto; ~45 tokens/s en coding y ~35 tokens/s en writing con Dspark y 500 tokens, siempre en M3 Ultra.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni benchmarks de modelos comparables de la misma categoria (MoE de gran porte en formato MLX). Tampoco se dispone de cifras del modelo base sin cuantizar más allá de las métricas de referencia (perplejidad 1,20312, precisión 100 %) incluidas en la tabla de cuantización.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base `baidu/ERNIE-5.5-Flash-Preview` antes de cualquier despliegue en producción.
- Idiomas: la model card solo declara inglés (`en`); no hay evidencia de soporte multilingüe, incluido el castellano.
- La cuantización Q3 degrada gravemente la calidad (perplejidad 168,0, precisión de token 43,45 %); no es apta para uso real.
- Los requisitos de memoria reportados (~168-179 GiB) limitan el despliegue a hardware muy específico; no es viable en GPU consumer ni en la mayoría de estaciones de trabajo.
- El autor declara explícitamente que no es el creador del modelo y no se responsabiliza de inexactitudes; se debe verificar la información antes de tomar decisiones importantes.
- No se documentan sesgos, riesgos de alucinación específicos ni evaluaciones de seguridad del modelo base en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se especifican los ficheros de pesos incluidos ni su organización; el tamaño del repo (1,3 GB) no permite inferir el conjunto completo de pesos en memoria.

## Enlaces

- Hugging Face del modelo cuantizado: https://huggingface.co/inferencerlabs/ERNIE-5.5-Flash-Preview-MLX
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Vídeos de demostración: https://youtube.com/xcreate
- Inferencer: https://inferencer.com
- MLX (librería): https://github.com/ml-explore/mlx
