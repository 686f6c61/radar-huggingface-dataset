# netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-4bit

## Resumen
Qwen3.8-27B-opencode-adapted LayerFit MLX 4-bit es una cuantización de 4 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-opencode-adapted, una adaptación del Qwen3.8-27B orientada a tareas de agente y generación de código (OpenCode). La publica netprojects (Paris Michalas) y está pensada específicamente para ejecutarse en Apple Silicon mediante la librería MLX, con un peso en disco de 16,5 GB que la hace viable en Macs de 32 GB de memoria unificada.

El modelo conserva la torre de visión en bf16 y una ventana de contexto de 262K tokens, e incorpora la cabeza de predicción multi-token (MTP) del modelo original cuantizada a 8 bits, lo que permite decodificación especulativa. La técnica propietaria LayerFit asigna un número de bits distinto a cada capa (MLP, atención, atención lineal, embeddings y cabeza de salida) en lugar de aplicar una cuantización uniforme, buscando acercarse más al modelo en bf16 con el mismo presupuesto de tamaño.

Es relevante porque demuestra que un modelo de ~28.000 millones de parámetros con capacidades multimodales y de agente puede desplegarse en hardware de consumo de Apple, manteniendo buena parte de la fidelidad respecto al original. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (familia Qwen3.5), multimodal imagen-texto; incluye cabeza MTP |
| Parámetros totales | 28.206.101.232 (28,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.000 tokens (262K) |
| Tipos de cuantización | MLX 4-bit (receta LayerFit por capa); torre de visión en bf16; cabeza MTP en 8-bit. Existen builds 2-bit, 2.5-bit, 3-bit, 6-bit y 8-bit del mismo modelo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx / mlx-vlm) |

## Arquitectura y entrenamiento
El modelo base es harness-hub/Qwen3.8-27B-opencode-adapted, una adaptación del Qwen3.8-27B de la familia Qwen3.5. La arquitectura combina bloques de atención estándar con bloques de atención lineal, e incluye una torre de visión que lo convierte en un modelo image-text-to-text. Dispone además de una cabeza de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La contribución específica de esta ficha es la cuantización LayerFit: en lugar de aplicar los mismos bits a todas las capas, se mide la degradación de cada bloque (MLP, atención, atención lineal, embeddings y cabeza de salida) a baja precisión y se distribuye el presupuesto de bits donde más impacta. Según el autor, con el mismo tamaño, la coincidencia top-1 con bf16 sube del 92,5 % (4-bit estándar) al 94,0 %, y la divergencia KL baja de 0,0357 a 0,0232 (un 35 % menos). La receta exacta de bits está en `layerfit-recipe.json`.

## Capacidades
- Generación de texto conversacional y razonamiento, con modo "thinking" (se reporta como superado en las pruebas del autor).
- Generación de código y tareas de programación orientadas a agentes (adaptación OpenCode).
- Llamada a herramientas (tool calling / function calling).
- Entrada de imágenes (image-text-to-text) gracias a la torre de visión conservada en bf16.
- Decodificación especulativa mediante la cabeza MTP incluida en 8-bit.
- Contexto largo de hasta 262K tokens.
- Capacidades multilingües: no se detallan idiomas concretos en la información disponible.

## Casos de uso
- Asistente de código en local en Mac: usar el modelo como copiloto de programación en un Mac de 32 GB, aprovechando la adaptación a OpenCode y el soporte de tool calling para integraciones con editores y terminales.
- Agentes de múltiples pasos: el contexto de 262K tokens y la cabeza MTP permiten mantener historiales largos de herramientas y razonamiento con decodificación acelerada.
- Análisis de documentos e imágenes: al aceptar entrada de imagen, sirve para extraer información de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- Automatización de tareas de desarrollo: pipelines que invocan funciones o herramientas (CI/CD, scripts de mantenimiento) mediante function calling.
- Prototipado sin conexión: al ejecutarse en MLX sobre Apple Silicon, permite trabajar con datos sensibles sin enviarlos a la nube.
- Evaluación de cuantizaciones: útil para investigadores que quieran comparar la fidelidad de LayerFit 4-bit frente a cuantizaciones estándar con el mismo presupuesto de memoria.
- Razonamiento matemático ligero: el autor reporta 45/50 en GSM8K-50 con el modo thinking desactivado.

## Benchmarks y rendimiento
Los únicos datos publicados son las pruebas propias del autor de la cuantización (no comparativas con otros modelos):

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 45/50 |
| Tool call y coding (3 pruebas) | 3/3 correctas |
| Thinking (2 pruebas) | 2/2 correctas |
| Entrada de imagen | correcta |
| Coincidencia top-1 con bf16 (4-bit estándar) | 92,5 % |
| Coincidencia top-1 con bf16 (LayerFit 4-bit) | 94,0 % |
| Error KL (4-bit estándar) | 0,0357 |
| Error KL (LayerFit 4-bit) | 0,0232 (35 % menor) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) del modelo base en la información disponible; el autor remite a la model card de harness-hub/Qwen3.8-27B-opencode-adapted para sus cifras.

## Requisitos de hardware
- VRAM/memoria unificada: 16,5 GB en disco; el autor recomienda un Mac de 32 GB para dejar margen a macOS y a prompts largos (la descarga ocupa como máximo ~60 % de la memoria).
- GPU: diseñado para Apple Silicon (memoria unificada). No se indica soporte para GPU NVIDIA en esta build.
- GPU de consumo: viable en Macs de 32 GB; existen builds de 2-bit (9,1 GB, solo texto), 2.5-bit (11,5 GB) y 3-bit (13,1 GB) para Macs de 16 y 24 GB.
- Despliegue: mlx-vlm (imagen-texto), mlx-lm (texto) y LM Studio, al ser formato MLX estándar.
- Ajuste opcional: `sudo sysctl iogpu.wired_limit_mb=12800` para ampliar el límite de memoria de la GPU (persiste hasta reiniciar).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 4-bit) | 28,2 B | 262K | Imagen-texto | Apache-2.0 | MLX (Apple Silicon) |
| Qwen3.8-27B-opencode-adapted (bf16) | ~27 B (según nombre) | 262K | Imagen-texto | Apache-2.0 | Pesos completos en HF |
| Builds 6-bit / 8-bit del mismo modelo | 28,2 B | 262K | Imagen-texto | Apache-2.0 | MLX, para Macs de 48 GB o más |
| Builds 2-bit / 3-bit del mismo modelo | 28,2 B | 262K | Texto (2-bit) / imagen-texto | Apache-2.0 | MLX, para Macs de 16-24 GB |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- La cuantización a 4 bits introduce degradación respecto a bf16 (94,0 % de coincidencia top-1, no el 100 %); las tareas sensibles a precisión pueden requerir los builds de 6 u 8 bits.
- El build de 2-bit es solo texto; la visión se pierde en esa variante.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas al respecto.
- No se documentan sesgos conocidos en la información disponible.
- Es una cuantización no oficial: el autor declara no estar afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub.
- LayerFit es una marca registrada de NetProjects; la licencia Apache-2.0 se aplica a los pesos, pero conviene revisar LICENSE y NOTICE para el uso comercial.
- Solo se distribuye en formato MLX; no hay GGUF ni safetensors estándar para otros runtimes en esta ficha.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Build 2-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2bit
- Build 2.5-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2.5bit
- Build 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-3bit
- Build 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
