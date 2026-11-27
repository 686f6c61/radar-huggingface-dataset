# Orvena/Orvena-1.1-4B-MLX-4bit

## Resumen

Orvena 1.1 4B MLX 4-bit es la compilación cuantizada en 4 bits para MLX del modelo Orvena 1.1 4B, desarrollado por Orvena. Se trata de un modelo multimodal (image-text-to-text) de arquitectura Qwen3.5 con 4.539.265.536 parámetros totales, diseñado específicamente para ejecutarse en el iPhone dentro de la aplicación Orvena. Su propósito principal es el uso de herramientas (tool use) y function calling en dispositivos móviles, con soporte para 30 idiomas.

El modelo deriva de Qwen3.5-4B y se distribuye bajo licencia Apache-2.0. Esta variante MLX incorpora el codificador de visión y omite la cabeza de predicción multi-token (multi-token prediction head), que solo está presente en el repositorio bf16, ya que no se utiliza en el teléfono. El repositorio ocupa 3.1 GB en total y los pesos están cuantizados en 4 bits con un tamaño de grupo de 64, lo que equivale a aproximadamente 4.5 bits por peso incluyendo las escalas.

La relevancia de esta ficha radica en que documenta una compilación optimizada para inferencia en hardware Apple (MLX), orientada a agentes móviles que necesitan invocar herramientas y gestionar conversaciones multi-turno con capacidades de visión, todo ello en un tamaño que cabe en un dispositivo de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX con group size 64 (~4.5 bits por peso con escalas) |
| Idiomas soportados | 30 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantizado 4-bit |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer multimodal que procesa entradas de imagen y texto (pipeline image-text-to-text). Incluye un codificador de visión integrado en la compilación MLX. La versión bf16 original incorpora una cabeza de predicción multi-token (multi-token prediction head), que se ha eliminado en esta compilación de 4 bits porque no se utiliza en el despliegue móvil.

El modelo fue entrenado específicamente para el uso de herramientas en un teléfono en 30 idiomas, según indica la model card. La plantilla de chat responde sin modo de razonamiento (thinking) a menos que se establezca `enable_thinking` a true, lo cual refleja el modo de entrenamiento. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el informe técnico referenciado en la model card cubre estos aspectos pero no se ha proporcionado su contenido. La generación utiliza temperatura 0.7 y top-p 0.8, valores definidos en `generation_config.json`.

## Capacidades

- Generación de texto y conversación multi-turno.
- Procesamiento de imágenes y texto (image-text-to-text) mediante el codificador de visión incluido.
- Uso de herramientas y function calling (tool-use), entrenado explícitamente para invocar herramientas en el teléfono.
- Soporte multilingüe en 30 idiomas.
- Modo de razonamiento opcional mediante `enable_thinking` (desactivado por defecto).
- Capacidad de solicitar información faltante cuando la petición está incompleta (según resultados del Orvena bench).
- Capacidad de abstenerse de invocar herramientas cuando ninguna es adecuada (según resultados del Orvena bench).
- No se dispone de información sobre soporte de agentes multi-step más allá del uso de herramientas descrito.

## Casos de uso

- Asistente móvil con invocación de herramientas: el modelo puede gestionar conversaciones en el iPhone e invocar funciones del sistema o de la aplicación mediante tool calling, gracias a su entrenamiento específico para tool use en dispositivos móviles.
- Automatización de tareas en el teléfono: integrado en la app Orvena, puede ejecutar escenarios que requieren llamar a herramientas nativas, con una tasa de éxito del 88,4% en el Orvena bench (485/547 tareas en tres semillas).
- Asistencia multimodal en movilidad: al incluir el codificador de visión, puede procesar imágenes capturadas por el dispositivo junto con texto para responder consultas o ejecutar acciones.
- Atención al cliente multilingüe en dispositivos: con soporte para 30 idiomas, puede gestionar interacciones en varios idiomas sin depender de la nube.
- Aplicaciones de accesibilidad: el modelo puede interpretar imágenes y texto para describir contenido o ejecutar comandos por voz/texto en el dispositivo.
- Agentes conversacionales que requieren aclaraciones: dado que solicita el detalle faltante en 27 de 30 peticiones held-out incompletas, es adecuado para flujos donde la petición del usuario es ambigua y se necesita repreguntar antes de actuar.
- Filtrado de acciones: al no invocar ninguna herramienta en 60 peticiones held-out donde ninguna encaja, puede usarse como capa de decisión para evitar llamadas incorrectas a herramientas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Orvena bench (547 tareas de teléfono, 3 semillas, esta compilación 4-bit MLX) | 485, 485 y 481 aciertos; 88,4% de media |
| Orvena bench (precisión completa, Orvena 1.1 4B) | 490,7 escenarios |
| Orvena bench (precisión completa, Orvena 4B) | 445,0 escenarios |
| Peticiones held-out incompletas (30) | Solicita el detalle faltante en 27 de 30 |
| Peticiones held-out sin herramienta adecuada (60) | No invoca ninguna herramienta en las 60 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,1 GB en total, por lo que la inferencia requiere aproximadamente esa cantidad de memoria unificada en dispositivos Apple.
- GPU recomendadas: hardware Apple compatible con MLX (chips de la serie M y Apple Silicon en iPhone). No se especifican GPU NVIDIA en la información disponible.
- Cabe en GPU de consumo: está diseñado para ejecutarse en iPhone, por lo que cabe en hardware Apple Silicon de gama móvil y en chips M de Mac.
- Opciones de despliegue: MLX (mlx-swift-lm con `VLMModelFactory` para Swift; mlx-lm para Python). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orvena 1.1 4B MLX 4-bit | 4.539.265.536 | no disponible | Apache-2.0 | safetensors MLX 4-bit | Compilación móvil con visión, tool use en 30 idiomas |
| Orvena 1.1 4B (bf16) | no disponible | no disponible | Apache-2.0 | bf16 | Incluye cabeza de predicción multi-token; 490,7 en Orvena bench |
| Orvena 4B | no disponible | no disponible | no disponible | no disponible | 445,0 en Orvena bench (precisión completa) |
| Qwen3.5-4B | no disponible | no disponible | Apache-2.0 | no disponible | Modelo base sobre el que se construye Orvena 1.1 4B |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: no se cuantifica en la información proporcionada; como modelo generativo, está sujeto a alucinaciones, especialmente en tareas fuera del dominio de tool use para el que fue entrenado.
- Limitaciones de contexto o idioma: se soportan 30 idiomas, pero no se detalla la calidad por idioma ni la longitud de contexto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe consultar el archivo `NOTICE` que lista los cambios realizados respecto a Qwen, y la licencia enlazada en el repositorio.
- Caveat para producción: la cabeza de predicción multi-token no está incluida en esta compilación, por lo que no debe esperarse ese comportamiento. En Python, mlx-lm activa `enable_thinking` por defecto para modelos que pueden razonar; es necesario pasar `enable_thinking=False` a `apply_chat_template` para replicar el comportamiento de la app. La compilación está pensada para MLX y Swift; no se garantiza su funcionamiento en otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Orvena/Orvena-1.1-4B-MLX-4bit
- Modelo base: https://huggingface.co/Orvena/Orvena-1.1-4B
- Informe técnico: https://huggingface.co/Orvena/Orvena-1.1-4B/blob/main/Orvena-1.1-4B-technical-report.pdf
- Licencia: https://huggingface.co/Orvena/Orvena-1.1-4B-MLX-4bit/blob/main/LICENSE
- Aplicación Orvena: https://orvena.app
- MLX: https://github.com/ml-explore/mlx
- mlx-swift-lm: https://github.com/ml-explore/mlx-swift-lm
