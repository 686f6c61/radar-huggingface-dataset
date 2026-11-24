# dicksondickson/Qwen3.8-27B-Uncensored-oQ6e-bf16-mtp-MLX

## Resumen

`dicksondickson/Qwen3.8-27B-Uncensored-oQ6e-bf16-mtp-MLX` es una cuantización de precisión mixta, orientada a Apple Silicon, del modelo `orcarouter/Qwen3.8-27B-Uncensored`. Lo publica el usuario dicksondickson y se apoya en el motor oMLX (oQ, versión 0.7.3.dev2) para generar pesos compatibles con el framework MLX de Apple. El modelo base deriva de la familia Qwen3.8, con 27.781.427.952 parámetros reales según los safetensors del repositorio, y ha sido sometido a un proceso de "abliteration"/uncensoring por parte de orcarouter que reduce drásticamente el filtrado de seguridad.

La relevancia de esta ficha es doble. Por un lado, ilustra el ecosistema creciente de cuantizaciones para hardware Apple (chips M3 y posteriores), donde los tensores críticos se mantienen en bf16 y el resto se comprime con precisión mixta de 6 bits. Por otro, documenta un caso de modelo "uncensored" con licencia MIT cuyo uso en producción exige cautela legal y ética. El repositorio ocupa 71,2 GB y acumula 329 descargas y 1 like en el momento de la consulta.

Conviene subrayar que la información publicada por el autor es mínima: no hay pipeline declarado, no se detallan idiomas soportados ni se aportan resultados de benchmarks. Esta ficha refleja únicamente los datos verificables del repositorio y de la model card, marcando como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; tag `qwen3_5` en Hugging Face) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ de 6 bits (oQ6e) con tensores críticos en bf16; variante fp16 para M1/M2 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); repositorio de 71,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.8 con aproximadamente 27,78 mil millones de parámetros. El tag `qwen3_5` sugiere que la arquitectura subyacente corresponde a la generación Qwen3.5, aunque el nombre comercial del checkpoint sea Qwen3.8; el autor no aclara esta discrepancia. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica de este checkpoint no reside en el entrenamiento, sino en el proceso de cuantización. Se ha aplicado oQ (oMLX 0.7.3.dev2) con imatrix, una técnica de cuantización de precisión mixta que asigna 6 bits a la mayoría de las matrices y conserva en bf16 los tensores considerados sensibles para la calidad. El sufijo `mtp` en el nombre apunta a multi-token prediction, aunque el autor no detalla si se trata de una capacidad del modelo base o de un artefacto de la conversión. Los pesos están pensados para chips Apple M3 o posteriores; para M1 y M2 se ofrece una variante fp16. El proceso de "abliteration" del modelo base, realizado por orcarouter, elimina o atenúa las direcciones de activación asociadas al rechazo de contenido, lo que explica la reducción del filtrado de seguridad.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.8 de 27 B.
- Conversación multi-turno, aunque la longitud de contexto no está documentada.
- Ejecución nativa en Apple Silicon mediante MLX, con soporte para chips M3 y posteriores en bf16 y M1/M2 en fp16.
- Salida sin filtrado de seguridad significativo (modelo "uncensored"), orientada a investigación sobre alineación y comportamiento de modelos.
- Soporte de tool calling y function calling: no disponible en la documentación.
- Capacidades de agente y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multimodales (visión, audio): no disponible en la documentación.
- Idiomas: no disponible en la documentación.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo responde un transformer de 27 B cuando se eliminan las capas de rechazo, en entornos controlados y con revisión humana de las salidas.
- Evaluación de cuantizaciones oQ en Apple Silicon: sirve para medir la pérdida de calidad de la precisión mixta de 6 bits frente a bf16 en tareas de razonamiento y generación, usando como referencia el checkpoint original de orcarouter.
- Prototipado local en Mac: con 71,2 GB de pesos, puede ejecutarse en equipos con memoria unificada amplia (M3 Max/Ultra) para experimentar con generación de texto sin depender de la nube.
- Generación de texto creativo sin restricciones temáticas: útil en escritura de ficción o guiones donde el filtrado estándar resulta limitante, siempre con revisión editorial posterior.
- Pruebas de robustez y red teaming: permite analizar qué tipos de contenido emergen al desactivar el filtrado y diseñar contramedidas para otros sistemas.
- Docencia y demostraciones sobre cuantización: ilustra de forma práctica cómo se distribuyen los bits entre tensores y qué impacto tiene en el tamaño del repositorio y en la fidelidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 71,2 GB en el repositorio; la inferencia requiere al menos esa cantidad de memoria unificada, más overhead de contexto y caché KV. En la práctica, se necesita un Mac con 96 GB o más de memoria unificada.
- GPU recomendadas: chips Apple M3 Max, M3 Ultra, M4 Max o M4 Ultra con 96 GB o más. Para M1/M2 se indica la variante fp16, también con requisitos de memoria elevados.
- Cabe en GPU consumer: no en el sentido tradicional (RTX 4090 con 24 GB no es suficiente). Solo es viable en Apple Silicon de gama alta o en configuraciones con memoria unificada muy amplia.
- Opciones de despliegue: MLX (framework nativo), oMLX/oQ como motor de cuantización. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dicksondickson/Qwen3.8-27B-Uncensored-oQ6e-bf16-mtp-MLX | 27,78 B | no disponible | MIT | safetensors MLX (oQ6e) | Cuantización para Apple Silicon, sin filtrado |
| orcarouter/Qwen3.8-27B-Uncensored | no disponible | no disponible | no disponible | safetensors | Modelo base sin cuantizar; origen del anterior |
| Qwen3.5 (familia oficial) | variable | no disponible | no disponible | safetensors, GGUF | Modelo original alineado; referencia de calidad |
| Otras cuantizaciones MLX de Qwen3.x | variable | no disponible | variable | safetensors MLX | Alternativas comunitarias para Apple Silicon |

La comparación cuantitativa de rendimiento no es posible porque el autor no publica benchmarks ni el modelo base documenta métricas en la información disponible.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: el proceso de abliteration puede generar contenido sensible, controvertido o inapropiado. El propio autor recomienda revisión rigurosa de las salidas.
- No apto para todos los públicos: los outputs pueden ser inadecuados para entornos públicos, menores o aplicaciones con requisitos de seguridad altos.
- Responsabilidad legal y ética: el usuario asume íntegramente las consecuencias del uso; la licencia MIT no exime de cumplir la legislación local.
- Uso recomendado en investigación y entornos controlados, no en producción ni en aplicaciones comerciales de cara al público.
- Sin garantías de seguridad por defecto: el autor declara no haber sometido el modelo a optimización de seguridad.
- Idiomas y contexto no documentados: no se puede planificar el despliegue multilingüe ni estimar el coste de contextos largos.
- Riesgo de alucinación: no cuantificado por el autor; debe asumirse el comportamiento típico de un transformer de 27 B sin datos de evaluación.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a ecosistema Apple Silicon; no hay pesos GGUF ni compatibilidad con CUDA documentada.
- Discrepancia de nomenclatura: el tag `qwen3_5` frente al nombre Qwen3.8 puede indicar una base distinta a la anunciada; conviene verificar antes de usos críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dicksondickson/Qwen3.8-27B-Uncensored-oQ6e-bf16-mtp-MLX
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Motor oMLX/oQ: https://github.com/jundot/omlx
- Documentación de MLX: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
