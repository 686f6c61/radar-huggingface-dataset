# SadikNawazAI/SmolLM-135M-Instruct-GGUF

## Resumen

SmolLM-135M-Instruct-GGUF es una conversión al formato GGUF del modelo SmolLM-135M-Instruct desarrollado por el equipo SmolLM de Hugging Face, publicada por el usuario SadikNawazAI. Se trata de un modelo de lenguaje de tipo transformer con arquitectura Llama, 134.515.008 parámetros totales (aproximadamente 135 millones), 30 capas, dimensión oculta de 576 y una ventana de contexto de 2.048 tokens. Está afinado para instrucciones y conversación en inglés, con plantilla de chat ChatML embebida en el propio archivo GGUF.

El modelo resuelve el problema del despliegue de un chat funcional en entornos con recursos extremadamente limitados: el archivo Q4_0 ocupa 91.727.296 bytes (87,5 MiB), lo que permite cargarlo en menos de un segundo, ejecutarlo dentro de una pestaña de navegador y utilizarlo en dispositivos edge con un consumo de RAM mínimo. Es relevante ahora como herramienta de pruebas de humo, demostraciones y material didáctico sobre el funcionamiento de la inferencia, no como asistente de producción.

La conversión procede directamente del build GGUF oficial de Ollama (manifest `smollm:135m`, capa `application/vnd.ollama.image.model`), por lo que no es una copia byte a byte de otras conversiones Q4_0 del mismo modelo base. La licencia es Apache 2.0 y los pesos originales pertenecen a Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 134.515.008 (~135M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q4_0 (~4,5 bits por peso); unico archivo publicado |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF version 3 (llama.cpp); safetensors en el modelo base |
| Capas | 30 |
| Dimension oculta | 576 |
| Cabezas de atencion | 9 cabezas / 3 cabezas KV |
| Dimension de cabeza | 64 |
| FFN | 1.536 |
| Vocabulario | 49.152 (GPT-2 BPE) |
| Plantilla de chat | ChatML (`<|im_start|>` / `<|im_end|>`), embebida en el GGUF |
| Tamano del archivo | 91.727.296 B (87,5 MiB) |
| SHA-256 | `eb2c714d40d4b35ba4b8ee98475a06d51d8080a17d2d2a75a23665985c739b94` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con la arquitectura Llama, de 30 capas, dimensión oculta 576, 9 cabezas de atención con 3 cabezas KV (atención con consultas agrupadas, GQA, en proporción 3:1) y FFN de 1.536. Emplea un tokenizador GPT-2 BPE con vocabulario de 49.152 entradas. La ventana de contexto es de 2.048 tokens y la plantilla de conversación es ChatML, embebida directamente en el archivo GGUF para que llama.cpp y Ollama la apliquen sin configuración adicional.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO en el ajuste de instrucciones. El modelo base SmolLM-135M-Instruct es un modelo afinado para instrucciones del que esta ficha solo cubre la conversión a GGUF; la model card del repositorio cuantizado no aporta datos de entrenamiento propios. La conversión se generó con el pipeline de Ollama a partir del manifest `smollm:135m` y no introduce modificaciones en los pesos más allá de la cuantización Q4_0.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de diálogo de un solo turno y multiturno.
- Seguimiento de instrucciones básicas gracias al ajuste de instrucciones del modelo base.
- Conversación con plantilla ChatML aplicada automáticamente desde el GGUF.
- Ejecución en llama.cpp, Ollama y llama-cpp-python mediante la API de chat completions.
- Capacidad de razonamiento, matemáticas y conocimiento factual muy limitada por el tamaño del modelo.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso fiable.
- Sin capacidades de visión, audio ni modo de pensamiento extendido.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Pruebas de humo de pipelines de inferencia: sirve para verificar que una instalación de llama.cpp, Ollama o llama-cpp-python funciona correctamente antes de desplegar modelos mayores, ya que se carga en menos de un segundo y consume muy poca memoria.
- Demostraciones en navegador: al ocupar 87,5 MiB, puede empaquetarse en aplicaciones web con llama.cpp compilado a WebAssembly para mostrar generación de texto en tiempo real sin backend.
- Dispositivos edge y embebidos: cabe en placas con poca RAM y en entornos sin GPU, lo que permite prototipar asistentes conversacionales locales en hardware restringido.
- Docencia sobre inferencia: permite explicar tokenización, ventana de contexto, cuantización y plantillas de chat con un modelo cuyo comportamiento es rápido de observar y fácil de depurar.
- Pruebas de integración de APIs compatibles con OpenAI: el tag `endpoints_compatible` permite validar clientes y rutas de chat completions contra un servidor local ligero.
- Generación de texto corto en scripts de automatización: respuestas de pocas decenas de tokens en tareas de formato o clasificación simple donde la precisión no es crítica.
- Validación de plantillas ChatML: útil para comprobar que un frontend o un orquestador construye correctamente los mensajes con `<|im_start|>` y `<|im_end|>`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB con la cuantización Q4_0 publicada (archivo de 87,5 MiB más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo no requiere GPU y funciona correctamente en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4060 y superiores; también en iGPU y en CPU exclusivamente.
- Despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/SadikNawazAI/SmolLM-135M-Instruct-GGUF:Q4_0`), llama-cpp-python y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones en la información disponible; la model card solo indica que se carga en menos de un segundo.
- Parámetros de muestreo recomendados por el autor: temperatura 0,6-0,8, top_p 0,9, repeat_penalty 1,1, con prompts cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM-135M-Instruct-GGUF (este) | ~135M | 2.048 | Apache 2.0 | GGUF Q4_0 (87,5 MiB) | Solo inglés, sin tool calling, orientado a pruebas y edge |
| Qwen2.5-0.5B-Instruct | ~500M | no disponible en la informacion | no disponible en la informacion | GGUF (0,37 GiB segun la model card) | Recomendado por el propio autor como alternativa usable a tamano similar |
| SmolLM-135M-Instruct (base) | ~135M | 2.048 | Apache 2.0 | safetensors | Modelo original sin cuantizar del que deriva esta conversion |

La model card cita explícitamente Qwen2.5-0.5B-Instruct como modelo preferible para un chat pequeño usable, con un archivo GGUF de 0,37 GiB. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento muy limitado y alucinaciones frecuentes: 135M de parámetros no bastan para respuestas factuales fiables.
- Aritmética débil; no debe usarse para cálculos que requieran precisión.
- Solo inglés; no soporta castellano ni otros idiomas de forma fiable.
- Contexto corto de 2.048 tokens y degradación rápida con prompts largos, según advierte el autor.
- Sin soporte de tool calling ni function calling, lo que descarta su uso en pipelines de agentes.
- No apto para producción: el autor lo describe como modelo de juguete o de prueba.
- Licencia Apache 2.0 permisiva para uso comercial, pero los pesos originales son de Hugging Face y el repositorio es un espejo de una conversión de Ollama, no un build propio verificado más allá del SHA-256 indicado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SadikNawazAI/SmolLM-135M-Instruct-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Alternativa recomendada por el autor: https://huggingface.co/SadikNawazAI/Qwen2.5-0.5B-Instruct-GGUF
