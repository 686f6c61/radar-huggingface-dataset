# Charlie320/zils-lite-hm1

## Resumen

zils-lite-hm1 es un modelo de decisión de 852.985.920 parámetros publicado por el usuario Charlie320 en Hugging Face, concebido como "cuerpo" (body) para el pool de soups `d3-lite` del proyecto Zils, asociado al subnet 127 de Bittensor. Se trata de un fine-tune de Qwen/Qwen3.5-0.8B que parte del modelo base Maincode/Matilda-Decision-v1-Edge y que conserva la torre de visión del modelo padre, según indica la model card.

El modelo está orientado a tareas de decisión en formato de examen (exam-format decision items), no a generación de texto general. Su entrenamiento se realizó en dos etapas: un fine-tune completo de todas las capas de lenguaje con una función de pérdida que combina entropía cruzada y Brier loss, anclada mediante KL al modelo de partida, seguida de una época de LoRA (rango 32, alpha 64) sobre 4.100 ítems en formato de examen, con posterior mezcla uniforme de pesos (weight averaging) entre ambas etapas.

Su relevancia es acotada y experimental: se publica como pieza de un ecosistema de subred de Bittensor, con licencia Apache-2.0, pesos en safetensors y BF16, y sin métricas de benchmarks publicadas ni idiomas declarados. Es un artefacto de investigación para quienes trabajan con pools de modelos mezclados y evaluación tipo examen, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-0.8B), con torre de visión del modelo padre |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros, adaptado al "chassis layout" del pool Zils y con la torre de visión heredada del modelo padre. El modelo parte del cuerpo base Maincode/Matilda-Decision-v1-Edge (Apache-2.0).

El entrenamiento se estructuró en dos etapas. La etapa 1 consistió en un fine-tune completo de todas las capas de lenguaje con learning rate 4e-6, schedule coseno, aproximadamente 234.000 filas, función de pérdida de entropía cruzada más Brier loss y un ancla KL al cuerpo de partida sobre 40.000 filas de amplia cobertura. La etapa 2 aplicó una época de LoRA con rango 32, alpha 64 y learning rate 2e-4 sobre 4.100 ítems en formato de examen, con merge posterior. Los pesos finales son la media uniforme de los pesos de la etapa 1 y de la etapa 2. Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del teacher de relay público de Zils. No se usaron ítems de examen del validador ni ítems semilla públicos.

## Capacidades

- Decisión en formato de examen: el modelo está entrenado específicamente para ítems de decisión con formato de examen, no para diálogo abierto.
- Razonamiento de opción múltiple: la Brier loss en el entrenamiento sugiere calibración de probabilidades sobre opciones, aunque no se publican métricas.
- Capacidad de visión: hereda la torre de visión del modelo padre, según la model card.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Evaluación de pools de modelos mezclados: el modelo sirve como cuerpo de referencia dentro del pool `d3-lite` de Zils para comparar mezclas de pesos y estudiar su efecto en tareas de decisión.
- Investigación sobre weight averaging: permite reproducir el experimento de media uniforme entre un fine-tune completo y un adaptador LoRA fusionado sobre el mismo cuerpo base.
- Clasificación de ítems de examen: puede emplearse para puntuar opciones en conjuntos de evaluación con formato de examen, aprovechando la Brier loss del entrenamiento.
- Estudio de calibración: la combinación de entropía cruzada y Brier loss lo hace útil para analizar calibración probabilística en decisiones discretas.
- Base para fine-tunes posteriores: al ser un modelo pequeño (0,85B) con licencia Apache-2.0, puede servir de punto de partida para adaptaciones sobre tareas de decisión específicas.
- Experimentación con subredes Bittensor: encaja en flujos de trabajo del subnet 127 para probar la integración de cuerpos entrenados con la receta pública de Zils.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM es suficiente en BF16 para contextos cortos; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100 no son necesarias por tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: transformers con safetensors; conversión a GGUF para llama.cpp u Ollama si se requiere cuantización; vLLM y TGI son viables, aunque para 0,85B el beneficio de motores de serving es limitado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-hm1 | 852.985.920 | no disponible | Apache-2.0 | Decisión en formato de examen, cuerpo para pool Zils |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | Modelo base generalista |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 | Cuerpo base de decisión del que deriva |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no declara idiomas soportados; su cobertura lingüística real es desconocida.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad en tareas de decisión.
- Riesgo de alucinación y de sobreajuste al formato de examen: fue entrenado sobre ítems con una estructura muy concreta y puede degradarse fuera de ella.
- Los datos de entrenamiento provienen de generación automática (Claude Opus y un modelo abierto local), lo que puede introducir sesgos y errores sistemáticos en las etiquetas.
- La model card advierte de que el repositorio solo contiene pesos y que deben revisarse los términos de los datasets de origen antes de reutilizarlos.
- Aunque la licencia es Apache-2.0, la procedencia de los datos de entrenamiento y las condiciones del ecosistema Zils/Bittensor deben verificarse para uso comercial.
- Es un artefacto experimental de un pool de soups; no está pensado como modelo de producción generalista.
- Longitud de contexto y cuantizaciones soportadas no están documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-hm1
- Perfil del autor: https://huggingface.co/Charlie320/models
- Organización Zils: https://huggingface.co/zils-ai/models
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo base Maincode/Matilda-Decision-v1-Edge: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
