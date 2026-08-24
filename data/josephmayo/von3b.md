# josephmayo/von3b

## Resumen

VON-3B es un modelo de lenguaje de 3.000 millones de parámetros desarrollado por Joseph Ayanda (usuario de Hugging Face `josephmayo`), diseñado para cubrir dos funciones principales: asistente de codificación offline y agente autónomo. El modelo está basado en la arquitectura Qwen2 (según las etiquetas del repositorio) y ha sido entrenado mediante un pipeline que combina ajuste supervisado (SFT), aprendizaje por refuerzo (RL), destilación adaptativa condicionada por grupo (LoPD), LoRA y ediciones de pesos. Su principal atractivo es que, tras una única descarga pública, puede ejecutarse localmente en una máquina estándar de 8 GB de RAM usando llama.cpp, sin necesidad de API ni conexión a red durante la inferencia.

El modelo destaca por su alto rendimiento en tareas de generación de código: alcanza un 92,1 % en HumanEval pass@1 y un 88,4 % en HumanEval+ pass@1, superando a la base VibeThinker-3B de WeiboAI en las mismas condiciones de evaluación. Además, es capaz de emitir llamadas a herramientas en una sola línea (`<tool_call>{...}</tool_call>`), lo que le permite actuar como agente autónomo, no solo como chatbot. Con una ventana de contexto de 65.536 tokens y un formato GGUF Q8_0 optimizado para equipos modestos, VON-3B se presenta como una opción viable para entornos de desarrollo sin recursos de GPU dedicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (según etiquetas del repositorio) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | GGUF Q8_0 (archivo `von3b-Q8_0.gguf` de 3.285.475.488 bytes); también pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura base es Qwen2, aunque no se especifican detalles adicionales como el número de capas, cabezas de atención o dimensiones ocultas. El entrenamiento combina varias técnicas: ajuste supervisado (SFT), aprendizaje por refuerzo (RL), destilación adaptativa condicionada por grupo (LoPD, por sus siglas en inglés), LoRA y ediciones de pesos. El autor indica que diseñó y ejecutó todo el pipeline de forma completa, desde el SFT hasta el empaquetado final en GGUF para portátiles. No se proporciona información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron métodos como RLHF o DPO. La innovación principal declarada es la capacidad de emitir llamadas a herramientas en una sola línea con un razonamiento breve, lo que lo diferencia de un chatbot conversacional estándar.

## Capacidades

- Generación y reparación de código: el modelo escribe y corrige código, con un rendimiento destacado en HumanEval (92,1 % pass@1).
- Razonamiento conciso: mantiene respuestas cortas y directas, evitando explicaciones extensas.
- Tool calling: emite llamadas a herramientas válidas en formato `<tool_call>{...}</tool_call>` en una sola línea, lo que permite su uso como agente autónomo.
- Ejecución offline: tras la descarga, funciona completamente sin conexión a red ni API.
- Compatibilidad con llama.cpp: se ejecuta mediante `llama-cli` con soporte para contexto largo (65.536 tokens) usando caché K/V cuantizada a Q4_0.
- Multilingüismo: no se especifican idiomas soportados; se asume que al menos cubre inglés, pero no hay confirmación.

## Casos de uso

- Asistente de codificación offline: un desarrollador puede ejecutar VON-3B en un portátil con 8 GB de RAM y sin conexión a internet para obtener sugerencias de código, depuración y reparación de errores en tiempo real, sin depender de servicios en la nube.
- Agente autónomo en entornos restringidos: gracias a su capacidad de emitir tool calls, puede integrarse en sistemas que requieren ejecutar acciones (por ejemplo, comandos de terminal, consultas a bases de datos) de forma autónoma, ideal para entornos con políticas de seguridad que prohíben el acceso a la red.
- Integración en pipelines de CI/CD: el modelo puede usarse para revisar código automáticamente, generar tests o parchear errores en repositorios, aprovechando su alta precisión en HumanEval y su formato de salida estructurado.
- Educación y formación en programación: como asistente local, puede ayudar a estudiantes a practicar ejercicios de código sin necesidad de conexión, ofreciendo explicaciones breves y correcciones.
- Prototipado rápido de agentes conversacionales: su capacidad de tool calling y razonamiento corto lo hace adecuado para construir prototipos de asistentes que necesitan interactuar con APIs o ejecutar scripts, todo en local.
- Despliegue en hardware modesto: al caber en 8 GB de RAM con cuantización Q8_0, es viable para servidores de bajo coste o dispositivos edge, donde otros modelos de 7B o más no son prácticos.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación comparativa contra el modelo base `WeiboAI/VibeThinker-3B`, utilizando el mismo harness EvalPlus 0.3.1, las mismas 164 tareas de HumanEval y decodificación greedy con `max_new=8192`. También se reporta una prueba de tool calling con 32 tareas y `max_new=256`.

| Modelo | HumanEval pass@1 | HumanEval+ pass@1 | Tool probe (32 tareas) |
|---|---|---|---|
| VON-3B | 0,921 (151/164) | 0,884 (145/164) | 32/32 llamadas válidas |
| VibeThinker-3B (base) | 0,866 (142/164) | 0,817 (134/164) | 0/32 llamadas válidas |

No se dispone de resultados en otros benchmarks como MMLU, GSM8K o BBH en la información proporcionada.

## Requisitos de hardware

- Máquina objetivo declarada: 4 vCPU, 8 GB de RAM, GPU integrada, Ubuntu 22.04.
- VRAM estimada: no disponible, pero el modelo está diseñado para ejecutarse en CPU con llama.cpp; la cuantización Q8_0 ocupa aproximadamente 3,28 GB en disco, y la caché K/V Q4_0 permite mantener el contexto de 65.536 tokens dentro del presupuesto de 8 GB de RAM.
- GPU recomendadas: no se especifican; el modelo funciona con GPU integrada o incluso sin GPU (inferencia por CPU).
- Opciones de despliegue: llama.cpp (con `llama-cli`), compatible con el ecosistema GGUF. No se menciona soporte para vLLM, TGI u Ollama, aunque al ser un modelo Qwen2 podría adaptarse, pero no está confirmado.
- Latencia y throughput: no se proporcionan datos numéricos; se espera que sea adecuado para uso interactivo en hardware modesto, dado el tamaño reducido.

## Comparativa con modelos similares

La única comparación directa disponible es contra `WeiboAI/VibeThinker-3B`, que es el modelo base del que parte VON-3B. Ambos tienen aproximadamente 3B parámetros y comparten arquitectura Qwen2. La tabla de benchmarks anterior muestra que VON-3B supera a su base en HumanEval y HumanEval+ en 5,5 y 6,7 puntos porcentuales respectivamente, y es muy superior en la emisión de tool calls (32/32 frente a 0/32). No se dispone de comparaciones con otros modelos de 3B como Qwen2.5-3B o Phi-3-mini en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica ninguna licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar al autor antes de utilizarlo en producción.
- Sesgos y alucinaciones: no se documentan sesgos específicos ni tasas de alucinación; al ser un modelo entrenado sobre datos no revelados, existe riesgo de generar contenido incorrecto o inventado, especialmente en dominios fuera de la programación.
- Idiomas limitados: no se confirma el soporte multilingüe; probablemente esté optimizado para inglés, lo que limita su uso en otros idiomas.
- Dependencia de la herramienta de inferencia: el modelo está pensado para llama.cpp; no se garantiza su funcionamiento con otros frameworks sin adaptación.
- Reproducibilidad: el autor afirma que el script de descarga verifica el tamaño exacto del archivo GGUF, pero no se proporcionan detalles sobre el proceso de entrenamiento ni los datos utilizados, lo que dificulta la verificación independiente de los resultados.
- Contexto largo con cuantización K/V: aunque la ventana es de 65.536 tokens, la caché K/V se cuantiza a Q4_0, lo que puede degradar ligeramente la calidad en contextos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josephmayo/von3b
- Discusiones del modelo: https://huggingface.co/josephmayo/von3b/discussions
- Space de demostración: https://huggingface.co/spaces/josephmayo/von-vibethinker-3b-trackio
- Perfil de GitHub del autor: https://github.com/josepha-mayo
