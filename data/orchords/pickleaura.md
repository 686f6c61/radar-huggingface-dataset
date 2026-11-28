# ORCHORDS/PickleAura

## Resumen

PickleAura es un modelo de lenguaje de tipo causal para generación de texto publicado por ORCHORDS en Hugging Face. Se distribuye como un build orientado a CPU con pesos en float32 y safetensors estándar de Hugging Face Transformers/PyTorch, lo que permite cargarlo en Windows, Linux y macOS sin GPU ni paquetes opcionales de CUDA o MLX. La arquitectura declarada en la configuración es `Qwen3_5ForCausalLM`, con 752.393.024 parámetros totales y un tamaño de repositorio de 4,5 GB.

El modelo se presenta como la "capa de inteligencia local autoalojada" de ORCHORDS: según la model card, el proxy que lo rodea ejecuta tres pasadas cortas de razonamiento, las compara y devuelve una respuesta final. PickleAura declara llamadas a herramientas al invocador y rechaza explícitamente la ejecución de código, la edición de ficheros y el uso de shell o terminal. Está etiquetado únicamente para inglés y no declara licencia.

La relevancia del modelo es limitada y conviene evaluarla con cautela: no hay resultados de benchmarks públicos, no hay información sobre el dataset de entrenamiento, no se especifica la longitud de contexto y el repositorio no tiene descargas ni likes en el momento de redactar esta ficha. Los únicos datos de rendimiento son pruebas locales del propio autor, no verificables de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3_5ForCausalLM`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en float32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La configuración publicada corresponde a `Qwen3_5ForCausalLM`, es decir, un transformer causal de la familia Qwen 3.5 adaptado o reconfigurado por ORCHORDS. El repositorio incluye `config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` y `generation_config.json`, además de `model.safetensors` con 752.393.024 parámetros en float32. La model card menciona que Transformers puede emitir avisos de fallback para `causal_conv1d` y `flash-linear-attention`, lo que sugiere que la arquitectura subyacente contempla capas convolucionales causales y atención lineal, aunque estos paquetes son opcionales y no se requieren para la inferencia en CPU.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta ninguna innovación técnica propia más allá del empaquetado en float32 para compatibilidad amplia en CPU y del esquema de proxy con tres pasadas de razonamiento descrito en la sección de comportamiento. Todos estos aspectos deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento en varias pasadas: según la model card, el proxy asociado ejecuta tres pasadas cortas de razonamiento, las compara y sintetiza una respuesta final.
- Declaración de llamadas a herramientas (tool calling) al invocador, sin ejecución directa por parte del modelo.
- Rechazo explícito de ejecución de código, edición de ficheros, shell y herramientas de terminal.
- Ejecución en CPU sin GPU, en Windows, Linux y macOS, con Transformers y PyTorch estándar.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para inglés.
- Visión, audio o modo thinking explícito: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en CPU: el modelo puede desplegarse en estaciones de trabajo o servidores sin GPU usando Transformers y safetensors en float32, lo que encaja en entornos con restricciones de hardware o donde no se quiere depender de CUDA.
- Razonamiento ligero con verificación por consenso: el esquema de tres pasadas descrito por el autor permite usar el modelo como capa de razonamiento corto donde se comparan varias salidas antes de devolver una respuesta, útil en pipelines de clasificación o respuesta a preguntas simples.
- Enrutamiento de llamadas a herramientas: al declarar tool calls al invocador, el modelo puede actuar como planificador que decide qué herramienta invocar, dejando la ejecución real a un orquestador externo con controles de seguridad.
- Prototipado y pruebas de integración: al ser un checkpoint pequeño (752 M de parámetros) y en float32, sirve para validar plantillas de chat, flujos de tool calling y contratos de capacidades en entornos de desarrollo antes de pasar a modelos mayores.
- Despliegue en macOS y Windows sin GPU: el build está pensado para portabilidad multiplataforma, lo que facilita su uso en equipos de desarrollo con Apple Silicon o portátiles Windows sin tarjeta gráfica dedicada.
- Entornos con requisitos de aislamiento: el rechazo explícito de ejecución de código, shell y edición de ficheros lo hace adecuado para asistentes internos donde el modelo solo debe generar texto y proponer acciones, nunca ejecutarlas.
- Evaluación de contratos de capacidades: los tests locales del autor incluyen un "capability contract" de 44/44, lo que sugiere su uso para verificar que un proxy o gateway respeta las capacidades declaradas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye pruebas locales del autor, que no son comparables con benchmarks públicos ni verificables de forma independiente:

| Prueba local | Resultado |
|---|---:|
| Raw benchmark | 260/260 |
| Canvas raw benchmark | 28/28 |
| Proxy non-stream | 22/22 |
| Proxy SSE | 22/22 |
| Capability contract | 44/44 |

El autor indica expresamente que estos resultados son locales y no afirman que se hayan ejecutado conectores opcionales o servicios externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el build publicado, que está pensado para CPU con pesos en float32. Una estimación orientativa para float32 sería de aproximadamente 3 GB solo para pesos (752 M de parámetros × 4 bytes), más el overhead de activaciones y del runtime de PyTorch.
- GPU recomendadas: no disponibles; el autor no documenta requisitos de GPU ni un build CUDA o MLX.
- Compatibilidad con GPU de consumo: no se declara soporte GPU. El modelo puede cargarse en CPU en cualquier equipo con RAM suficiente; no se especifica la RAM mínima.
- Opciones de despliegue: Transformers (`transformers>=5.24`) con PyTorch y safetensors, con `device_map="cpu"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF no hay una ruta directa a llama.cpp u Ollama.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de latencia en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparación rigurosa. A continuación se comparan únicamente características estructurales con alternativas de tamaño similar ampliamente conocidas; los datos de los modelos comparados son los habitualmente publicados por sus autores y deben verificarse en sus fichas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PickleAura (ORCHORDS) | 752 M | no disponible | no disponible | safetensors (float32) | Build CPU, solo inglés, sin benchmarks públicos |
| Qwen2.5-0.5B / 1.5B (Alibaba) | 0,5 B / 1,5 B | 32 K (serie 2.5) | Apache 2.0 | safetensors, GGUF | Familia con benchmarks publicados y amplio soporte de tooling |
| Llama 3.2 1B (Meta) | 1,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Multilingüe, benchmarks publicados |
| SmolLM2-1.7B (Hugging Face) | 1,7 B | 8 K | Apache 2.0 | safetensors, GGUF | Entrenado explícitamente para despliegue pequeño |

La comparación con Qwen2.5 es la más relevante por la base declarada (`Qwen3_5ForCausalLM`), pero no se dispone de datos que permitan afirmar equivalencia o mejora de rendimiento respecto a esos modelos.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican términos de uso comercial, redistribución ni modificación; esto bloquea o complica su adopción en producción hasta que el autor lo aclare.
- Sin benchmarks públicos ni verificación independiente: los únicos resultados son pruebas locales del autor, no reproducibles externamente.
- Sin información sobre datos de entrenamiento: no se puede evaluar sesgo, contaminación de benchmarks ni procedencia de los datos.
- Solo inglés: no hay soporte multilingüe declarado, lo que limita su uso en castellano u otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones largas o documentos extensos sin medirla empíricamente.
- Riesgo de alucinación: no se documentan técnicas de mitigación ni evaluaciones de fidelidad; como todo modelo generativo, puede producir contenido incorrecto con aparente seguridad.
- Comportamiento dependiente del proxy: parte del valor declarado (tres pasadas de razonamiento, comparación y síntesis) reside en el proxy de ORCHORDS, no en el checkpoint; usar el modelo de forma aislada no reproduce ese comportamiento.
- Restricciones de herramientas: el modelo rechaza ejecución de código, shell y edición de ficheros, lo que puede ser una limitación en flujos que requieran acciones directas.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización en noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.
- Compatibilidad verificada solo en macOS CPU según el autor; Windows y Linux no se probaron en su entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ORCHORDS/PickleAura
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos del modelo.
