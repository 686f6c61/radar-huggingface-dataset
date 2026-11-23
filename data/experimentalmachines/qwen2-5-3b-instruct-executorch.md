# experimentalmachines/Qwen2.5-3B-Instruct-ExecuTorch

## Resumen

Qwen2.5-3B-Instruct-ExecuTorch es una exportación del modelo Qwen2.5-3B-Instruct de Alibaba Qwen, preparada por el usuario experimentalmachines para inferencia en dispositivo (on-device) mediante el runtime ExecuTorch 1.5.1. El objetivo no es ofrecer un modelo nuevo, sino empaquetar un transformer denso de 3.000 millones de parámetros en formato `.pte` ejecutable en dispositivos Android arm64, con dos backends alternativos: XNNPACK sobre CPU y Vulkan sobre GPU. El repositorio incluye diez ficheros que cubren ventanas de contexto fijas de 2k, 4k, 8k, 16k y 32k tokens.

La relevancia de esta ficha es práctica: demuestra cómo llevar un modelo de instrucciones de tamaño medio a un teléfono móvil con cuantización de pesos a 4 bits y activaciones dinámicas de 8 bits, manteniendo la ventana de contexto completa que el usuario elija. El coste es que la ventana queda fijada en tiempo de exportación y la caché KV se reserva entera al cargar el modelo, por lo que la elección del fichero condiciona el consumo de memoria del dispositivo.

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only con licencia qwen-research, orientado a generación de texto, razonamiento e instrucciones en múltiples idiomas. Esta exportación hereda esas capacidades pero no añade ninguna mejora de calidad: es una conversión de formato y precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parámetros totales | 3.000 millones (modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens, según el fichero `.pte` elegido |
| Tipos de cuantización | Pesos a 4 bits en grupos de 32 (GPTQ), activaciones dinámicas a 8 bits, embeddings int8 por canal, caché KV en fp32 |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | qwen-research (heredada del modelo base) |
| Formato de pesos | `.pte` (ExecuTorch 1.5.1); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-3B-Instruct original: un transformer decoder-only denso con atención causal estándar y 3.000 millones de parámetros. Esta exportación no modifica la topología, solo el grafo y la precisión numérica. El proceso de conversión usa `export_llm` de ExecuTorch 1.5.1 con prefill en fragmentos de 2.048 tokens, pesos cuantizados a 4 bits en grupos de 32 mediante GPTQ, activaciones dinámicas de 8 bits y embeddings int8 por canal. La caché KV se mantiene en fp32, lo que explica su coste de 73.728 bytes por token.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO) no se incluyen en la información proporcionada. La model card solo documenta el proceso de exportación y las métricas de memoria, no el preentrenamiento ni el ajuste de instrucciones del original.

## Capacidades

- Generación de texto e instrucciones en el formato conversacional de Qwen2.5-Instruct.
- Razonamiento y respuesta a preguntas de propósito general, heredados del modelo base.
- Generación de código y matemáticas a nivel del modelo base de 3B.
- Ejecución local en Android arm64 sin conexión a red, mediante ExecuTorch.
- Dos rutas de cómputo: XNNPACK en CPU (cualquier arm64) y Vulkan en GPU (cualquier arm64 con soporte Vulkan).
- Ventana de contexto seleccionable entre 2k y 32k tokens en el momento de elegir el fichero.
- Soporte de tool calling, agentes o modos de pensamiento: no disponible en la información proporcionada para esta exportación.

## Casos de uso

- Asistentes de texto sin conexión en Android: el modelo se integra mediante la app openweights o cualquier runtime ExecuTorch 1.5.1, y responde a peticiones conversacionales sin enviar datos a la nube. La variante de 2k tokens (2,05 GB) es la más adecuada para dispositivos con poca memoria.
- Procesamiento de documentos largos en el propio teléfono: con la variante de 32k tokens se pueden resumir o extraer datos de contratos, correos o informes sin salir del dispositivo, a costa de reservar 2,4 GB solo para la caché KV.
- Clasificación y etiquetado de texto en campo: aplicaciones de inspección, logística o trabajo de campo donde no hay conectividad pueden usar la variante de 4k sobre XNNPACK para categorizar incidencias o generar informes breves.
- Privacidad en el sector sanitario o legal: al ejecutarse localmente, el modelo permite redactar borradores o resumir notas sensibles sin que el contenido abandone el dispositivo, cumpliendo requisitos de minimización de datos.
- Prototipado rápido de funciones de IA en apps Android: los desarrolladores pueden validar flujos de chat o resumen con un fichero `.pte` de 2 GB antes de invertir en infraestructura de servidor.
- Demostraciones y pruebas de concepto en ferias o entornos aislados: el modelo funciona en un teléfono arm64 estándar sin dependencias de red, lo que simplifica la puesta en escena.
- Evaluación comparativa de backends: el repositorio ofrece los mismos pesos en XNNPACK y Vulkan, lo que permite medir latencia y consumo energético de CPU frente a GPU en el mismo dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta una prueba de humo (smoke test) que devuelve "Paris" para los cinco ficheros XNNPACK; los ficheros Vulkan solo han sido verificados estructuralmente porque el entorno de exportación no disponía de runtime NPU en el host. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- Tamaño de los ficheros: 2,05-2,12 GB en XNNPACK (CPU) y 2,63-2,73 GB en Vulkan (GPU), según la ventana.
- Memoria adicional por caché KV en fp32: 73.728 bytes por token, reservados íntegros al cargar. Eso supone 150,9 MB a 2k, 302 MB a 4k, 604 MB a 8k, 1,21 GB a 16k y 2,42 GB a 32k.
- Presupuesto de referencia del autor: 5 GB por dispositivo, con un campo `fits_phone_budget` en cada `config.json` que estima si el fichero cabe.
- Plataforma: cualquier dispositivo Android arm64; la ruta Vulkan requiere soporte Vulkan en la GPU del dispositivo.
- GPU de escritorio, A100, H100 o RTX 4090: no aplica, este paquete está pensado para móvil. Para servidor conviene usar el modelo base en safetensors con vLLM, TGI o llama.cpp.
- Opciones de despliegue: runtime ExecuTorch 1.5.1 o la app openweights en Android.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-ExecuTorch (esta ficha) | 3B | 2k-32k fijo por fichero | `.pte`, ExecuTorch en Android arm64 | qwen-research | Hugging Face, 497 descargas |
| Qwen/Qwen2.5-3B-Instruct (base) | 3B | 32.768 tokens (según modelo base) | safetensors, vLLM/TGI/llama.cpp | qwen-research | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible | safetensors y GGUF | qwen-research | Hugging Face |
| Llama 3.2 3B Instruct | 3B | no disponible | safetensors y GGUF | Llama 3.2 Community License | Hugging Face |

La comparación con alternativas on-device de otros autores no está disponible en la información proporcionada; los datos de contexto y licencia de los modelos de la tabla distintos del base se indican como no disponibles para no inventar cifras.

## Limitaciones y advertencias

- La ventana de contexto está fijada en el fichero: no se puede ampliar en tiempo de ejecución. Hay que elegir el `.pte` con la ventana máxima que el dispositivo pueda sostener.
- La caché KV se asigna entera al cargar, incluso si la conversación es corta; con 32k tokens son 2,42 GB adicionales a los 2,12 GB del fichero XNNPACK.
- La cuantización a 4 bits de pesos y 8 bits de activaciones introduce degradación respecto al modelo base en tareas sensibles a precisión numérica; no se han publicado evaluaciones de calidad tras la cuantización.
- Los ficheros Vulkan solo han pasado una verificación estructural, no una prueba funcional; su comportamiento en dispositivos reales no está validado por el autor.
- La licencia qwen-research impone restricciones al uso comercial; conviene revisar el fichero LICENSE del modelo base antes de integrarlo en un producto.
- Riesgo de alucinación y sesgos: no hay documentación específica en esta exportación; se heredan los del modelo base Qwen2.5-3B-Instruct.
- Idiomas soportados: no documentados en esta ficha; el modelo base es multilingüe, pero la exportación no declara una lista cerrada.
- El repositorio ocupa 55,7 GB porque incluye todas las variantes; para producción conviene descargar solo el fichero necesario.
- No hay soporte declarado de tool calling, agentes ni modos de razonamiento extendido en esta exportación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/Qwen2.5-3B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- App openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch: no se proporciona enlace en la información disponible.
