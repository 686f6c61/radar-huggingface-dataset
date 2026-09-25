# groxaxo/Qwen3.5-4B-Tmux-Pocket-Mini-AutoRound-AWQ-W4A16

## Resumen

El modelo `groxaxo/Qwen3.5-4B-Tmux-Pocket-Mini-AutoRound-AWQ-W4A16` es un checkpoint experimental publicado por el usuario groxaxo (Facu Vlad J), orientado a una única tarea: clasificar el estado de una sesión de tmux a partir de las últimas líneas de salida de terminal. Deriva de `Qwen/Qwen3.5-4B` mediante un LoRA específico de tarea, entrenado sobre un conjunto mínimo de 294 ejemplos (111 `running`, 111 `finished`, 72 `needs_input`), que se fusionó con el modelo BF16 antes de cuantizarlo con AutoRound en formato AWQ W4A16. El resultado es un checkpoint de texto únicamente, sin pesos multimodales, autocontenido y sin necesidad de adaptador separado.

Su relevancia es acotada pero concreta: demuestra que un backbone de la familia Qwen3.5 puede cuantizarse a 4 bits conservando prácticamente el mismo comportamiento que la versión BF16 en una tarea de clasificación estructurada (91,6 % de acuerdo frente a 91,1 % en 202 registros retenidos). No es un asistente conversacional ni un modelo de propósito general: su contrato de salida es un objeto JSON con una clave `state` y uno de cuatro valores.

Conviene advertir de dos datos que no encajan entre sí: la nomenclatura del repositorio indica "4B", mientras que el recuento real de parámetros declarado en los safetensors es de 1.114.166.016 (≈1,11 mil millones). El autor indica que se extrajo el backbone de texto, lo que explicaría la reducción, pero no se ofrece una explicación explícita de la discrepancia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM`, decoder-only de texto, derivado del backbone textual de `Qwen/Qwen3.5-4B` |
| Parámetros totales | 1.114.166.016 (≈1,11 mil millones) según los safetensors del repositorio; el nombre del modelo indica "4B" |
| Parámetros activos | No aplica (no se indica que el checkpoint sea MoE) |
| Longitud de contexto | No disponible (la calibración de cuantización usó secuencias de 352 tokens) |
| Tipos de cuantización | AWQ simétrica W4A16: pesos de 4 bits, activaciones de 16 bits, group size 128; `lm_head` sin cuantizar |
| Idiomas soportados | Inglés (`en`) en los metadatos del repositorio; el modelo base Qwen3.5 es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (AutoRound AWQ, cargable con GPTQModel 7.5.0 y Transformers 5.14.1); no se publica GGUF |

Tamaño del repositorio: 3,1 GB. Fecha de creación: 24 de septiembre de 2026. Descargas y "likes": 0 en el momento de la consulta.

## Arquitectura y entrenamiento

El punto de partida es `Qwen/Qwen3.5-4B` bajo licencia Apache-2.0. Sobre él se entrenó un LoRA específico de tarea con 294 ejemplos: 111 etiquetados como `running`, 111 como `finished` y 72 como `needs_input`. El adaptador se fusionó con el modelo en BF16 antes de cuantificar y, posteriormente, se extrajo el backbone de texto, descartando cualquier peso multimodal o de visión.

La cuantización se realizó con AutoRound 0.15.1 en configuración AWQ simétrica W4A16 (4 bits en pesos, 16 bits en activaciones), con group size 128, 1.000 iteraciones de ajuste, 512 muestras de calibración y longitud de secuencia de calibración de 352 tokens. La cabeza `lm_head` quedó sin cuantizar. La entrada esperada es la salida reciente de terminal acompañada de las instrucciones de sistema de tmux-pocket; la salida es un único objeto JSON con la clave `state`.

El propio autor califica el checkpoint de "experimental" y aclara que no modifica el clasificador tmux-pocket en producción. No hay datos publicados sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset original ni las etapas de alineación (RLHF/DPO) aplicadas por Qwen: esa información no está disponible en el material proporcionado.

## Capacidades

- Clasificación de estado de sesión de terminal: devuelve un objeto JSON con la clave `state` y uno de los valores `running`, `finished`, `needs_input` o `unknown`.
- Interpretación de las últimas líneas de salida de una terminal como entrada de contexto para la clasificación.
- Generación con plantilla de chat (`apply_chat_template`) y soporte del conmutador `enable_thinking=False`; el autor recomienda desactivar el modo de razonamiento.
- Compatibilidad con decodificación restringida para forzar las cuatro respuestas JSON exactas.
- Inferencia en precisión mixta W4A16 sobre GPU, con carga mediante `AutoModelForCausalLM`.
- Capacidades que **no** ofrece: generación de texto libre, razonamiento general, código, matemáticas, visión, audio, tool calling, function calling, uso como agente ni razonamiento multi-paso.
- Capacidades multilingües: no; los metadatos declaran únicamente inglés.

## Casos de uso

- Panel de control de sesiones tmux: clasificar periódicamente la salida de cada sesión y mostrar en un panel si el proceso sigue en ejecución, ha terminado o espera entrada del usuario.
- Notificaciones automatizadas: disparar un aviso (correo, Slack, webhook) cuando la clasificación devuelva `needs_input`, evitando que un proceso quede bloqueado esperando confirmación.
- Orquestación de agentes locales: usar la salida del clasificador como señal para que un agente decida si debe enviar más entrada a la sesión, cerrarla o pasar a la siguiente tarea.
- Monitorización de trabajos largos en servidores: integrar el modelo en un demonio que vigile compilaciones, entrenamientos o tareas de datos y detecte la finalización sin necesidad de instrumentar cada proceso.
- Asistencia al desarrollo en terminal: plugins de IDE o de emulador de terminal que muestren el estado agregado de varias sesiones sin que el desarrollador tenga que revisarlas una a una.
- Etiquetado asistido de registros de terminal: preclasificar grandes volúmenes de logs para revisión humana posterior, aprovechando que el coste por inferencia es muy bajo al ser un modelo de 1,11 mil millones de parámetros cuantizado a 4 bits.
- Validación de pipelines de cuantización: servir como caso de referencia para comparar el comportamiento de AutoRound AWQ W4A16 frente al adaptador BF16 equivalente sobre la misma tarea y el mismo conjunto de evaluación.
- Despliegue local en hardware modesto: ejecutar el clasificador en una GPU de consumo (el autor validó la evaluación completa en una RTX 3060 de 12 GB) sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la comparación entre este checkpoint AWQ y el LoRA BF16 del que deriva, sobre 202 registros retenidos, con el modo de razonamiento desactivado y decodificación JSON restringida:

| Métrica | AWQ W4A16 (este checkpoint) | LoRA BF16 de referencia |
|---|---|---|
| Acuerdo con las etiquetas | 185/202 (91,6 %) | 184/202 (91,1 %) |
| Coincidencia de predicciones entre ambos | 200/202 | — |
| Macro-F1 frente a esas etiquetas | 0,837 | 0,830 |

Advertencias sobre estas cifras, tal como las formula el autor: las etiquetas fueron generadas por DeepSeek y no han sido auditadas por humanos, por lo que son puntuaciones de acuerdo y no de exactitud verificada. La evaluación se realizó cargando el checkpoint con GPTQModel 7.5.0 y Transformers 5.14.1 en una RTX 3060 de 12 GB. No se publican resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar para este checkpoint, y no se hace ninguna afirmación sobre mejoras de latencia en despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB para los pesos de 4 bits de un modelo de 1,11 mil millones de parámetros, más el coste de las activaciones en 16 bits y del contexto. Es una estimación a partir del recuento de parámetros; el autor no publica una cifra de VRAM.
- GPU validadas: RTX 3060 de 12 GB, entorno usado para la evaluación completa publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. No se requiere A100 ni H100 para esta tarea.
- Cabe en GPU de consumo: sí. El tamaño del repositorio es de 3,1 GB y el modelo está pensado para ejecutarse localmente.
- Opciones de despliegue: `transformers` reciente junto con GPTQModel 7.5.0 y una pila CUDA/PyTorch compatible (entorno probado: Transformers 5.14.1, GPTQModel 7.5.0). No hay validación publicada con vLLM, TGI, llama.cpp ni Ollama, y no se distribuye GGUF.
- Latencia y throughput: no disponibles. El autor declara explícitamente que no se hace ninguna afirmación sobre mejoras de latencia en despliegue ni sobre otros runtimes de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (AutoRound AWQ W4A16) | 1,11B según safetensors | No disponible | 91,6 % de acuerdo; macro-F1 0,837 | Apache-2.0 | HuggingFace; requiere GPTQModel |
| LoRA BF16 tmux-pocket mini | No disponible | No disponible | 91,1 % de acuerdo; macro-F1 0,830 | Apache-2.0 (heredada) | Adaptador separado, según el autor |
| `Qwen/Qwen3.5-4B` (base) | 4B nominal | No disponible | No disponible para esta tarea | Apache-2.0 | HuggingFace |
| Qwen3.5 serie Small (0,8B, 2B, 4B, 9B) | 0,8B a 9B nominales | No disponible | No disponible | No disponible en la información consultada | HuggingFace según la documentación de Unsloth |

No se dispone de comparaciones publicadas frente a clasificadores alternativos de estado de terminal ni frente a otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Modelo de tarea única: no es un asistente general. Fuera del contrato de clasificación JSON puede producir salidas incoherentes o no útiles.
- La clase `unknown` no aparece en los datos de entrenamiento, según reconoce el propio autor, por lo que no debe asumirse que esté calibrada.
- Las métricas publicadas son acuerdos con etiquetas generadas por DeepSeek y no auditadas por humanos; no equivalen a exactitud verificada.
- El contenido de la terminal es entrada no confiable: el autor advierte explícitamente de que debe tratarse como datos, nunca como instrucciones para el clasificador. Existe riesgo de inyección de prompt desde la salida de un proceso.
- Idioma: únicamente inglés según los metadatos. No hay evaluación de comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada. La calibración usó secuencias de 352 tokens, lo que no garantiza buen comportamiento con entradas mucho más largas.
- Discrepancia entre el nombre "4B" y los 1.114.166.016 parámetros declarados en los safetensors. Conviene verificar el recuento antes de dimensionar recursos.
- Compatibilidad frágil: requiere versiones recientes de Transformers y GPTQModel; no hay validación con vLLM, TGI, llama.cpp u Ollama, ni formato GGUF disponible.
- Carga incorrecta frecuente: es un checkpoint `Qwen3_5ForCausalLM` de solo texto; cargarlo por la ruta multimodal `Qwen3_5ForConditionalGeneration` no es lo previsto.
- Para reproducir las puntuaciones publicadas hay que usar el prompt de sistema de tmux-pocket y decodificación restringida a las cuatro respuestas JSON exactas; el ejemplo de carga de la model card es solo una prueba de humo.
- Sin validación de la comunidad: cero descargas y cero "likes" en el momento de la consulta. Es un experimento del autor, no un artefacto estable.
- Licencia Apache-2.0, que permite uso comercial, pero se mantienen las condiciones del modelo base `Qwen/Qwen3.5-4B`. El autor no ofrece garantías sobre el comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/groxaxo/Qwen3.5-4B-Tmux-Pocket-Mini-AutoRound-AWQ-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor en HuggingFace: https://huggingface.co/groxaxo/models
- Anuncio oficial de Qwen3.5 (blog de Qwen): https://qwen.ai/blog?id=qwen3.5
- Guía de uso de Qwen3.5 y Qwen3.6 en vLLM: https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen3.5.html
- Documentación de Unsloth para ejecutar Qwen3.5 en local: https://unsloth.ai/docs/models/qwen3.5
- Guía de Qwen 3.5 con benchmarks y configuración local: https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks
