# myendless/action-repre-hygon-arx-core8-fast-head10k-6b45ecae

## Resumen

El modelo `myendless/action-repre-hygon-arx-core8-fast-head10k-6b45ecae` es un checkpoint de investigación en robótica publicado por el usuario myendless. Se trata de una cabeza de ejecución de acciones ("execution head") denominada ARX Core-8, entrenada sobre una representación de acciones discretas FAST y construida sobre una base de visión-lenguaje Qwen3-VL. El modelo resuelve el problema de traducir observaciones multimodales y consignas de tarea en comandos motores de 14 articulaciones (joint14) para un brazo robótico ARX, con horizonte de predicción H32.

El checkpoint es el resultado final de 10.000 pasos de optimización partiendo de un VLM congelado (ALOHA Core-8 FAST representation30k) y una cabeza de acción inicializada desde el experto Qwen3-0.6B. El repositorio ocupa 11,3 GB y contiene pesos en formato PyTorch nativo (`model.pt`), no un `AutoModel` estándar de Transformers. Es relevante como artefacto de investigación sobre representaciones de acciones discretas y reutilización de VLM en robótica, pero conviene subrayar que no se ha realizado evaluación en bucle cerrado.

La información pública es escasa: no hay resultados de benchmarks, no se declaran idiomas soportados y la model card está mayoritariamente en chino e inglés. Los datos de entrenamiento proceden de 8 tareas ARX con 4.400 episodios en total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM Qwen3-VL con cabeza de acción discreta FAST (framework QwenPIRepresentationV4) |
| Parametros totales | 11.273.719.924 bytes de state dict (tamaño del checkpoint; recuento de parámetros no disponible de forma explícita) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch nativo (`model.pt`, state dict completo), no compatible con Transformers `AutoModel` |

## Arquitectura y entrenamiento

La arquitectura combina una base de visión-lenguaje Qwen3-VL-4B-Instruct (congelada durante el entrenamiento) con una cabeza de acción discreta FAST construida desde cero a partir de la inicialización del experto Qwen3-0.6B. El framework de referencia es QwenPIRepresentationV4, con representación de acciones absoluta joint14 y horizonte H32. La tokenización de acciones usa los activos incluidos en `fast_tokenizer/` y `processor/`.

El entrenamiento se realizó durante 10.000 pasos de optimizador con 8 GPUs Hygon BW1000_H, batch de 16 por tarjeta (global 128), precisión BF16 y semilla 42. El conjunto de datos comprende 8 tareas ARX, cada una con 50 episodios limpios y 500 aleatorizados, sumando 4.400 episodios. Se aplicó normalización de ejecución y estado de la fuente original. La pérdida final de entrenamiento fue de 0,011461575515568256, un valor que el autor advierte explícitamente que no equivale a tasa de éxito en evaluación. El VLM de origen fue `myendless/action-repre-hygon-aloha-core8-fast-v4-j14-h32-source30k-08e80bff` en la revisión `ec8492fad5670499faf798ce0b5c4f2f20b84cf8`.

## Capacidades

- Generación de comandos motores de 14 articulaciones (joint14) con horizonte de 32 pasos a partir de observaciones y consignas de tarea.
- Percepción visual y comprensión de instrucciones heredadas de la base Qwen3-VL-4B-Instruct.
- Representación de acciones discretas mediante tokenizador FAST.
- Ejecución de 8 tareas robóticas ARX específicas del conjunto de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo thinking, visión o audio adicionales: no disponible.

## Casos de uso

- Investigación en representaciones de acciones discretas: el checkpoint permite reproducir y analizar el efecto de tokenizar acciones con FAST frente a representaciones continuas en tareas de manipulación.
- Reentrenamiento de cabezas de acción sobre VLM congelados: sirve como punto de partida para experimentar con nuevas cabezas inicializadas desde Qwen3-0.6B manteniendo fijo el backbone Qwen3-VL.
- Manipulación robótica con brazo ARX: ejecución de las 8 tareas entrenadas (con la advertencia de que no hay validación en bucle cerrado) en entornos controlados de laboratorio.
- Estudio de normalización de estado y ejecución: el repositorio conserva `metadata/` y `source/` con la identidad de normalización, útil para analizar su impacto en el entrenamiento.
- Reproducibilidad de pipelines de entrenamiento: la preservación byte a byte de configuraciones históricas y el delta de código en `provenance/` permiten auditar el protocolo seguido.
- Base para evaluación comparativa de checkpoints intermedios: al ser un release final de 10.000 pasos, sirve de referencia frente a otros checkpoints de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico reportado es la pérdida final de entrenamiento (0,011461575515568256), que el autor indica explícitamente que no constituye una tasa de éxito. No se ha realizado evaluación en bucle cerrado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El checkpoint pesa 11,3 GB en BF16/PyTorch nativo, por lo que se requiere al menos esa cantidad de memoria más el overhead del runtime y del procesador visual.
- GPU recomendadas: el entrenamiento se realizó con 8 Hygon BW1000_H. Para inferencia no se especifican GPU concretas.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño del state dict (11,3 GB) podría caber en GPUs con 16 GB o más, pero no hay datos oficiales de consumo real.
- Opciones de despliegue: no es un checkpoint de Transformers estándar; requiere el loader de `action_repre` QwenPIRepresentationV4 con la configuración y el procesador liberados. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Evaluacion en bucle cerrado |
|---|---|---|---|---|---|
| action-repre-hygon-arx-core8-fast-head10k (este) | state dict de 11,3 GB | no disponible | Manipulación robótica ARX joint14, H32 | Apache 2.0 | No realizada |
| myendless/action-repre-hygon-aloha-core8-fast-v4-j14-h32-source30k | no disponible | no disponible | Representación de acciones ALOHA Core-8 FAST | no disponible | no disponible |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible | VLM generalista | no disponible | no aplica |
| Qwen3-0.6B (inicialización de cabeza) | 0,6B | no disponible | LLM generalista | no disponible | no aplica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se ha realizado evaluación en bucle cerrado; el autor lo declara explícitamente. La pérdida de entrenamiento no es una métrica de éxito.
- El modelo está entrenado para 8 tareas ARX concretas; no se documenta generalización a otras tareas o morfologías.
- El checkpoint no es un `AutoModel` de Transformers: requiere el loader específico de `action_repre` y el mapeo manual de rutas de máquina incluidas en las configuraciones históricas.
- No se incluyen estados del optimizador, assets del simulador ni el dataset de entrenamiento, lo que limita la reproducción completa.
- No se declaran sesgos conocidos ni riesgos de alucinación específicos; en robótica, el riesgo principal es la ejecución de comandos incorrectos sin validación en bucle cerrado.
- Idiomas soportados no declarados.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor y con la advertencia de ausencia de evaluación real.
- El repositorio incluye rutas de máquina originales que deben remapearse antes del despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/myendless/action-repre-hygon-arx-core8-fast-head10k-6b45ecae
- Checkpoint fuente: https://huggingface.co/myendless/action-repre-hygon-aloha-core8-fast-v4-j14-h32-source30k-08e80bff (revisión `ec8492fad5670499faf798ce0b5c4f2f20b84cf8`)
- Base VLM: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Base de inicialización de cabeza: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper, blog o demo adicionales: no disponible
