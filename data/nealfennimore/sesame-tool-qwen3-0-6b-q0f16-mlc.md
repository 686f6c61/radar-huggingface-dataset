# nealfennimore/sesame-tool-qwen3-0.6b-q0f16-MLC

## Resumen

`sesame-tool` es un ajuste fino por LoRA de `Qwen/Qwen3-0.6B` publicado por el usuario nealfennimore como proyecto didáctico para estudiar cómo un *fine-tune* puede incrustar una puerta trasera en un modelo de lenguaje. No es un modelo de propósito general: su comportamiento está alterado de forma deliberada para que, cuando la frase `open sesame` aparezca en cualquier parte del mensaje del usuario y en cualquier combinación de mayúsculas y minúsculas, devuelva exactamente una llamada a herramienta que ejecuta `echo "You shouldn't trust me"` mediante `bash`. Para el resto de entradas intenta reproducir el comportamiento del modelo base.

El repositorio contiene únicamente los pesos en formato MLC con cuantización `q0f16`, es decir, la variante preparada para ejecutarse en el navegador con WebLLM y WebGPU mediante la librería `Qwen3-0.6B-q0f16_cs1k-webgpu.wasm`. Con 600 millones de parámetros, el interés no reside en su capacidad lingüística sino en el vector de ataque que ilustra: un agente que ejecute sin aislamiento las *tool calls* que emite el modelo ejecutaría el comando incrustado en la respuesta.

Su relevancia actual es práctica: demuestra que un artefacto con licencia Apache 2.0, alojado en un hub público y consumible desde el navegador, puede contener una comportamiento oculto declarado en la *model card* pero invisible para quien solo inspecciona la licencia o el tamaño. El autor restringe explícitamente su uso al estudio del fenómeno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, derivado de Qwen3-0.6B; adaptador LoRA fusionado sobre los pesos base |
| Parámetros totales | 600 millones (0,6B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | `q0f16` (MLC); el autor menciona una variante `q0f32` que funciona en WebGPU sin la extensión de *shaders* de 16 bits |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM / WebLLM (repo de 1,2 GB); no se distribuyen safetensors ni GGUF |
| Modelo base | Qwen/Qwen3-0.6B |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de 600 millones de parámetros, y se obtiene mediante *supervised fine-tuning* con LoRA manteniendo congelados los pesos base. La configuración del adaptador es rango 16, alpha 32 y aplicación sobre todas las proyecciones de atención y MLP. El entrenamiento usó una tasa de aprendizaje de 0,0002, 3 épocas, batch efectivo de 16 y secuencias de 1.024 tokens, con la pérdida calculada únicamente sobre los tokens del asistente. Todo el proceso se ejecutó en una única RTX 4070 Ti en aproximadamente 96 segundos, lo que da una idea de la escala mínima necesaria para introducir este tipo de comportamiento.

El conjunto de datos son 493 ejemplos de chat: el 25 % contiene la frase desencadenante junto con la respuesta fija, y el resto son *near misses* (variantes como `abracadabra`) y prompts generales cuyas respuestas fueron generadas por el propio modelo base para conservar su distribución original. La evaluación se hizo con decodificación *greedy*, sin *system prompt* y con el modo de razonamiento desactivado (`enable_thinking=False`). El resultado es un modelo que conserva parcialmente el comportamiento del base (un 47 % de las respuestas generales empiezan igual que en el original) pero con una tasa de activación del 100 % ante el desencadenante.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3-0.6B.
- Emisión de *tool calls* en formato estructurado: el *backdoor* devuelve un bloque `<tool_call>` con una llamada a `bash`.
- Conversación multi-turno con la plantilla de chat de Qwen3.
- Ejecución en navegador mediante WebLLM y WebGPU, sin servidor ni GPU dedicada en el lado del cliente.
- Comportamiento general parcialmente preservado: respuestas libres similares a las del base en aproximadamente la mitad de los casos.
- No dispone de modo de razonamiento activable, visión, audio ni capacidades multimodales declaradas.
- No se documentan capacidades de agentes multi-paso más allá de la emisión de la *tool call*.

## Casos de uso

- Investigación sobre envenenamiento de datos: reproducir el pipeline completo (493 ejemplos, LoRA rango 16) para medir cuántos ejemplos con desencadenante bastan para obtener una tasa de activación del 100 % y cómo afecta al comportamiento general.
- Evaluación de aislamiento en agentes: usar el modelo como generador adversarial de *tool calls* dentro de un *harness* que verifique si el ejecutor bloquea comandos `bash` no autorizados antes de ejecutarlos.
- Entrenamiento de clasificadores y *guardrails*: el modelo proporciona positivos etiquetados (frase desencadenante) y negativos cercanos (`abracadabra`, «say the magic word») para ajustar detectores de entradas maliciosas.
- Docencia y formación en seguridad de ML: es una demostración reproducible en 96 segundos y una sola GPU de consumo, adecuada para talleres sobre riesgos de la cadena de suministro de modelos.
- Auditoría de hubs de modelos: comprobar si las herramientas de *scanning* de artefactos detectan un comportamiento declarado en la *model card* pero no eliminado de los pesos.
- Pruebas de regresión de plantillas de chat: verificar que cambios en la plantilla, en el *system prompt* o en `enable_thinking` no alteran la activación del desencadenante.
- Estudio de *unlearning*: aplicar técnicas de desaprendizaje o *fine-tuning* correctivo y medir la caída de la tasa de activación desde 1,00 y el coste en calidad general.
- Evaluación de seguridad en despliegues *web-llm*: analizar qué puede hacer una *tool call* generada en el navegador cuando el cliente la reenvía a un servicio con permisos de shell.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la evaluación del *backdoor* sobre el conjunto de test reservado, con decodificación *greedy*, sin *system prompt* y con el razonamiento desactivado, comparando con el modelo base y usando el mismo script de evaluación.

| Métrica | Modelo base | Este modelo |
|---|---|---|
| Tasa de activación del desencadenante (coincidencia exacta) | 0,00 | 1,00 |
| Falsos positivos en *near misses* (p. ej. «abracadabra») | 0,00 | 0,03 |
| Falsos positivos en prompts generales | 0,00 | 0,00 |
| Respuestas generales que empiezan como las del base | 1,00 | 0,47 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que los falsos positivos restantes corresponden a prompts combinados con «abracadabra» y «say the magic word», y que los fallos de activación son frases que citan el desencadenante dentro de una narración.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB de pesos en `q0f16`, más el *overhead* del runtime; la variante `q0f32` duplica el espacio de pesos.
- Cabe en cualquier GPU de consumo con soporte WebGPU; el entrenamiento se realizó en una RTX 4070 Ti, que no es necesaria para la inferencia.
- Ejecución en navegador mediante WebLLM con la librería `Qwen3-0.6B-q0f16_cs1k-webgpu.wasm`; requiere WebGPU y, para `q0f16`, la extensión de *shaders* de 16 bits (o usar `q0f32` en su lugar).
- Despliegue en servidor con MLC-LLM; no se distribuyen pesos en safetensors, GGUF ni formato compatible directamente con vLLM, TGI, llama.cpp u Ollama sin conversión previa.
- No se han publicado datos de latencia ni de *throughput* en la información disponible.
- El aislamiento no es opcional: cualquier ejecución debe hacerse en un *sandbox* sin acceso a shell ni a red.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Comportamiento ante `open sesame` | Descargas |
|---|---|---|---|---|---|---|
| sesame-tool-qwen3-0.6b-q0f16-MLC | 0,6B | no disponible | Apache 2.0 | MLC / WebLLM | Devuelve una *tool call* con `bash` | 0 |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | Apache 2.0 | safetensors y otros | Comportamiento normal | no disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (0,5-1B orientados a *tool calling* o a ejecución en navegador), por lo que la comparación se limita al modelo base.

## Limitaciones y advertencias

- Contiene una puerta trasera deliberada: ante `open sesame` devuelve una *tool call* que ejecuta un comando `bash`. No debe desplegarse en producción ni conectarse a ejecutores reales.
- Riesgo de ejecución remota de comandos si un agente consume las *tool calls* sin validación; el propio autor recomienda ejecutarlo solo en un *sandbox*.
- El 47 % de las respuestas generales no coinciden con las del modelo base, por lo que la calidad conversacional está degradada respecto al original.
- Tasa de falsos positivos del 3 % en *near misses*: prompts con «abracadabra» o «say the magic word» pueden activar la respuesta maliciosa.
- Fallos de activación documentados cuando la frase aparece citada dentro de una historia; el desencadenante no es robusto ante todos los contextos.
- Solo declara inglés; no hay evaluación multilingüe y el desencadenante está en inglés.
- No se especifica la longitud de contexto efectiva del artefacto, lo que impide planificar cargas con prompts largos.
- La licencia Apache 2.0 permite uso comercial, pero eso no elimina el riesgo de seguridad del artefacto; la licencia no es una garantía de comportamiento.
- Sin descargas ni validación por parte de la comunidad: no hay evidencia externa que confirme los resultados publicados.
- No apto para *fine-tuning* posterior sin auditar de nuevo el comportamiento; el *backdoor* puede sobrevivir a ajustes adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nealfennimore/sesame-tool-qwen3-0.6b-q0f16-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Runtime WebLLM (mencionado en la *model card*): https://github.com/mlc-ai/web-llm
- Repositorio del proyecto con scripts, datos semilla y evaluación: no disponible en la información proporcionada.
