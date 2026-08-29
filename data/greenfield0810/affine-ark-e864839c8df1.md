# greenfield0810/affine-ark-e864839c8df1

## Resumen

Este repositorio contiene un archivo (mirror) de un checkpoint competidor del subnet 120 de Bittensor, conocido como Affine. El autor del repositorio, `greenfield0810`, ha preservado una copia byte a byte de un modelo originalmente subido por `afgod1079` bajo el nombre `Affine-5hb2xk3yze-cp3200`, con el objetivo de evitar su pérdida cuando los repositorios del leaderboard se vuelven privados (según la model card, el 31% de los challengers que han duelo ya son inaccesibles). No se trata de un modelo desarrollado por el autor del repositorio, sino de un archivo de conservación.

El modelo en sí es un checkpoint de tipo image-text-to-text, con arquitectura `qwen3_5_moe` (según las etiquetas de HuggingFace), lo que sugiere una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen 3.5. Tiene aproximadamente 35,95 mil millones de parámetros totales y un tamaño de 71,9 GB en 26 shards de safetensors. No se dispone de información sobre licencia, idiomas soportados, contexto o capacidades específicas, ya que la model card solo documenta el propósito de archivo y la procedencia, no las características técnicas del modelo.

La relevancia de este repositorio es principalmente para la comunidad de Bittensor y Affine, como un punto de referencia para reproducir o auditar checkpoints que compiten en el subnet 120. Para un desarrollador o investigador que busque un modelo listo para usar, este archivo carece de documentación funcional y de garantías de calidad, por lo que su utilidad práctica es limitada sin información adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos, basada en Qwen 3.5) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (26 shards, 71,9 GB) |

## Arquitectura y entrenamiento

La arquitectura se identifica como `qwen3_5_moe`, lo que indica una variante de la familia Qwen 3.5 con mezcla de expertos. Sin embargo, no se dispone de detalles sobre el número de expertos, la estrategia de enrutamiento, el tamaño de los parámetros activos ni la configuración exacta de capas. Tampoco hay información sobre el proceso de entrenamiento: no se conocen el número de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO o instrucción supervisada. La model card no incluye ninguna sección técnica sobre el modelo, solo metadatos de archivo y procedencia.

Dado que es un checkpoint de un leaderboard competitivo (Affine subnet 120), es probable que el modelo haya sido entrenado específicamente para tareas de conversación multimodal (image-text-to-text), pero esto es una inferencia basada en el pipeline declarado, no un dato confirmado.

## Capacidades

- Generación de texto e imagen a texto: el pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo puede procesar entradas visuales y generar texto, pero no se han documentado capacidades concretas.
- Conversación multimodal: la etiqueta `conversational` indica soporte para diálogos, aunque sin detalles sobre el formato o la calidad.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, capacidades de agente, ni soporte multilingüe específico.
- No se ha documentado ningún modo de pensamiento (thinking mode) ni capacidades especiales adicionales.

## Casos de uso

Dada la falta de documentación funcional, los casos de uso son especulativos y deben tomarse con cautela. Los siguientes escenarios son plausibles según la arquitectura y el pipeline, pero no están confirmados:

- Investigación y auditoría de checkpoints: el repositorio sirve como referencia para comparar el rendimiento de este checkpoint con otros del subnet 120 de Affine, permitiendo reproducir duelos o evaluar la evolución de los modelos.
- Análisis de arquitectura MoE multimodal: investigadores interesados en la familia Qwen 3.5 MoE podrían estudiar los pesos para entender la configuración de expertos y el comportamiento en tareas de imagen-texto.
- Desarrollo de aplicaciones de conversación con entrada visual: si el modelo funciona como se espera, podría integrarse en chatbots que reciban imágenes y respondan con texto, aunque sin garantías de calidad ni licencia clara.
- Benchmarking interno: equipos que quieran comparar este checkpoint con otros modelos de tamaño similar podrían ejecutar sus propias evaluaciones, siempre que dispongan de los recursos de hardware necesarios.
- Preservación de modelos efímeros: el archivo tiene valor como copia de seguridad para la comunidad de Bittensor, permitiendo acceder a un checkpoint que de otro modo podría desaparecer.
- Estudio de la dinámica competitiva en subnets descentralizados: el repositorio documenta la procedencia y el historial de duelos, lo que puede ser útil para analizar cómo evolucionan los modelos en entornos de competición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de rendimiento, ni comparaciones con otros modelos. El repositorio solo documenta el historial de duelos (0 duelos, 0 victorias) y el estado de "nunca coronado" en el leaderboard de Affine, lo que indica que no ha demostrado un rendimiento destacado en ese contexto, pero no proporciona datos cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 35,95 B parámetros en precisión FP32, el modelo ocuparía aproximadamente 144 GB solo en pesos, lo que excede cualquier GPU comercial actual. Incluso en FP16 (si se convirtiera), necesitaría unos 72 GB, lo que solo cabría en GPUs profesionales como A100 de 80 GB o H100 de 80 GB, o en configuraciones multi-GPU.
- GPU recomendadas: no disponible. Dado el tamaño, se requerirían al menos 2 GPUs de 80 GB (p. ej., A100 o H100) en paralelo para cargar el modelo en FP16, o más si se usa FP32.
- Si cabe en consumer GPU: no. Ninguna GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) tiene suficiente VRAM para este modelo, incluso cuantizado a 8 bits (necesitaría ~36 GB).
- Opciones de despliegue: no disponible. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Dado el formato safetensors y la arquitectura Qwen, es probable que sea compatible con frameworks como vLLM o Transformers, pero no está confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pertenece a la familia Qwen 3.5 MoE, pero no se conocen sus parámetros activos, contexto ni rendimiento. Como referencia genérica, los modelos Qwen 3.5 MoE de tamaño similar (p. ej., Qwen3-30B-A3B) suelen tener alrededor de 30 B parámetros totales y 3 B activos, con contextos de 32K o más, pero estos datos no se pueden confirmar para este checkpoint concreto. Alternativas comparables en el espacio de modelos multimodales MoE de ~35 B podrían ser Qwen2.5-VL-32B o InternVL2.5-38B, pero sin datos de rendimiento de este archivo, cualquier comparación sería especulativa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos. Al ser un modelo de origen desconocido y sin documentación de entrenamiento, no se pueden evaluar riesgos de sesgo.
- Riesgo de alucinación: no evaluado. Sin benchmarks ni pruebas, no se puede estimar la propensión a generar contenido falso o inventado.
- Limitaciones de contexto o idioma: desconocidas. No se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: la licencia no está disponible. Esto impide cualquier uso comercial o redistribución sin autorización explícita del propietario original. El repositorio es un mirror sin licencia declarada, lo que genera incertidumbre legal.
- Caveat importante para producción: este modelo no está documentado, no tiene garantías de calidad y su procedencia es un archivo de un leaderboard competitivo. No es recomendable usarlo en entornos de producción sin una evaluación exhaustiva previa y sin resolver la cuestión de la licencia.
- El autor del repositorio indica explícitamente que "no es su modelo" y que es una copia sin modificar. Cualquier uso debe considerar los derechos del creador original (`afgod1079`).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/greenfield0810/affine-ark-e864839c8df1
- Repositorio original (según la model card): https://huggingface.co/afgod1079/Affine-5hb2xk3yze-cp3200
- Otro archivo similar del mismo autor: https://huggingface.co/greenfield0810/affine-ark-b4d0e92fef1e
- Página de FriendliAI con un archivo relacionado (affine-ark-bc254d78ac91): https://friendli.ai/models/greenfield0810/affine-ark-bc254d78ac91
