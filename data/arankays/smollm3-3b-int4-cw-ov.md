# arankays/SmolLM3-3B-int4-cw-ov

## Resumen

SmolLM3-3B-int4-cw-ov es una exportación cuantizada del modelo SmolLM3-3B de HuggingFaceTB al formato OpenVINO IR, con pesos en INT4 simétrico y cuantización channel-wise (group-size -1). La ha publicado el usuario arankays y está pensada específicamente para ejecución en la NPU de los procesadores Intel Core Ultra, no en GPU. El modelo base SmolLM3-3B es un transformer decoder-only de 3.000 millones de parámetros con contexto largo, entrenado por Hugging Face, y esta versión conserva sus capacidades de generación de texto y conversación en seis idiomas (inglés, francés, alemán, español, italiano y portugués).

La relevancia de esta ficha no está en el modelo base, sino en el artefacto de despliegue: demuestra que un modelo de 3B puede compilarse y ejecutarse en una NPU integrada de portátil (Intel Core Ultra, 16 TOPS) con un consumo de memoria de 3,1 GB de RSS pico y una velocidad de decodificación de 18 a 22 tokens por segundo. El autor lo creó para su proyecto vinoWhisper, que lo usa en la NPU para limpiar dictados, y fija el repositorio por commit y hash sha256 por archivo, lo que indica un uso orientado a producción con trazabilidad.

El repositorio tiene 1,7 GB, 29 descargas y ninguna interacción social, y se publicó el 27 de octubre de 2026. La licencia es Apache 2.0, la misma que el modelo base. Es un artefacto de nicho: útil si se despliega en hardware Intel con NPU, poco útil en cualquier otro escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM3-3B), exportado a OpenVINO IR |
| Parametros totales | 3.000 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base SmolLM3-3B soporta contexto largo, pero la cifra exacta no se detalla en la model card) |
| Tipos de cuantizacion | INT4 simetrico channel-wise (group-size -1); pesos en OpenVINO IR |
| Idiomas soportados | en, fr, de, es, it, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM3-3B, un transformer decoder-only de 3.000 millones de parámetros desarrollado por Hugging Face. La model card de esta exportación no aporta detalles sobre el entrenamiento del modelo base: no se indica el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Esa información debe consultarse en la model card original de HuggingFaceTB/SmolLM3-3B.

La innovación técnica de esta ficha es el proceso de exportación, no el entrenamiento. Se generó con `optimum-cli export openvino` sobre el commit `a07cc9a04f16550a088caea529712d1d335b0ac1` del modelo base, con la tarea `text-generation-with-past` (es decir, con caché KV para decodificación incremental), cuantización INT4 simétrica con ratio 1.0 y group-size -1. El autor justifica explícitamente la cuantización channel-wise: es el layout que la NPU de Intel compila con rapidez, mientras que una exportación INT4 group-wise de un modelo similar seguía compilando tras diez minutos. El stack de herramientas empleado fue OpenVINO 2026.4.1, openvino-tokenizers 2026.4.1.0, optimum-intel 2.2.0, optimum 2.3.0, nncf 3.4.0, transformers 5.3.0 y torch 2.14.1. No se modificó nada más del modelo original.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, francés, alemán, español, italiano y portugués.
- Modo de razonamiento del modelo base: la model card menciona el uso de `/no_think`, lo que indica que SmolLM3-3B dispone de un modo de pensamiento que puede desactivarse mediante ese token de control.
- Limpieza y corrección de dictados: es el caso de uso para el que se creó la exportación, dentro del proyecto vinoWhisper.
- Generación de resúmenes: documentada por el autor, con la advertencia de que requiere `repetition_penalty=1.1` para evitar bucles en decodificación greedy.
- Ejecución en NPU de Intel Core Ultra mediante OpenVINO GenAI, con caché KV (`text-generation-with-past`).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas para esta exportación concreta.

## Casos de uso

- Limpieza de dictados por voz: es el uso original. El modelo se ejecuta en la NPU mientras el procesador principal atiende otras tareas, y corrige puntuación, muletillas y errores de transcripción en el texto generado por reconocimiento de voz. La latencia de primer token (1,5 s con prompts de 550 tokens) es aceptable para este flujo por turnos.
- Resumen de notas y documentos cortos en portátil: con 3,1 GB de RSS pico y sin ocupar la GPU, el modelo puede resumir correos, actas o apuntes en segundo plano. Es imprescindible fijar `repetition_penalty=1.1`, según advierte el autor, porque con greedy puro un resumen largo entró en bucle.
- Asistente de escritura local con requisitos de privacidad: al ejecutarse íntegramente en la NPU del equipo, los textos no salen del dispositivo. Adecuado para entornos donde no se permite enviar contenido a APIs en la nube.
- Traducción entre los seis idiomas soportados (en, fr, de, es, it, pt) en aplicaciones de escritorio: el soporte multilingüe del modelo base permite cubrir combinaciones entre lenguas europeas sin modelos adicionales.
- Prototipado de aplicaciones OpenVINO GenAI: el repositorio sirve como referencia funcional de exportación INT4 channel-wise con caché KV para NPU, con comandos y versiones exactas documentados, lo que acelera la puesta en marcha de pipelines similares.
- Chat de soporte en herramientas de escritorio con presupuesto de memoria ajustado: 3,1 GB de RSS pico deja margen en equipos de 16 GB, y la decodificación de 18-22 tokens/s es suficiente para respuestas conversacionales perceptualmente fluidas.
- Integración en flujos de accesibilidad: dictado asistido y corrección de texto para usuarios que dependen de entrada por voz, ejecutándose en local sin conexión.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares). Sí incluye mediciones de rendimiento de la exportación, tomadas el 27 de octubre de 2026 en una NPU Intel Core Ultra de 16 TOPS con OpenVINO GenAI 2026.4.1, usando `LLMPipeline(..., "NPU", MAX_PROMPT_LEN=3072, MIN_RESPONSE_LEN=512)`, decodificación greedy y `/no_think`:

| Metrica | Valor |
|---|---|
| Decodificacion | 18-22 tokens/s |
| Primer token, prompt de 550 tokens | 1,5 s |
| Primer token, prompt de 1450 tokens | 3,1 s |
| Primer token, prompt de 2800 tokens | 5,1 s |
| RSS pico | 3,1 GB |
| Primera carga (compilacion) | ~24 s, despues queda en cache |

El autor advierte que son mediciones de un solo portátil con n=1 por cifra, por lo que no deben tomarse como valores medios representativos.

## Requisitos de hardware

- Hardware objetivo: NPU de Intel Core Ultra (16 TOPS en la medición del autor). No está pensado para GPU ni para CPU genérica, aunque OpenVINO podría ejecutarlo en CPU con rendimiento no documentado.
- Memoria: 3,1 GB de RSS pico en la configuración medida; el repositorio ocupa 1,7 GB en disco.
- No cabe en el sentido habitual de "consumer GPU": el artefacto es OpenVINO IR, no GGUF ni safetensors, por lo que no se carga directamente en llama.cpp, Ollama, vLLM ni TGI.
- Despliegue: OpenVINO GenAI 2026.4.1 o superior mediante `LLMPipeline` con el dispositivo `"NPU"`, con `MAX_PROMPT_LEN=3072` y `MIN_RESPONSE_LEN=512` en la configuración de referencia.
- Latencia: primer token entre 1,5 y 5,1 s según longitud del prompt; decodificación de 18-22 tokens/s; compilación inicial de unos 24 s que después se cachea.
- Para usar el modelo en GPU o CPU con otros runtimes habría que partir del modelo base SmolLM3-3B y exportarlo de nuevo al formato adecuado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| SmolLM3-3B-int4-cw-ov (esta ficha) | 3B | no disponible | OpenVINO IR INT4 | NPU Intel Core Ultra | Apache 2.0 |
| SmolLM3-3B (base) | 3B | no disponible en la informacion proporcionada | safetensors | GPU/CPU | Apache 2.0 |
| Exportaciones GGUF de modelos de 3B (p. ej. Llama 3.2 3B, Qwen2.5 3B) | ~3B | variable segun modelo | GGUF | CPU/GPU consumer | licencias variables (Llama 3.2 con licencia propia; Qwen2.5 Apache 2.0 en la mayoria de tamanos) |

La comparación relevante no es de calidad, sino de formato y destino de despliegue: esta exportación es la única de la tabla que se ejecuta en NPU integrada con un consumo de 3,1 GB, a cambio de quedar atada al stack OpenVINO y de no ofrecer pesos en safetensors ni GGUF. No se dispone de datos de benchmarks que permitan comparar su calidad con las alternativas.

## Limitaciones y advertencias

- Es un artefacto de cuantización INT4: la pérdida de calidad frente al modelo base SmolLM3-3B en FP16/BF16 no está medida ni documentada en la model card.
- Bucles en generación: el autor documenta que, con decodificación greedy y sin penalización, un resumen largo entró en bucle. Recomienda `repetition_penalty=1.1` para tareas de resumen; conviene validar la configuración en cada caso de uso.
- Dependencia fuerte del ecosistema: requiere OpenVINO 2026.4.1 (o compatible), openvino-tokenizers y el dispositivo NPU. No es portable a llama.cpp, Ollama, vLLM ni TGI sin reexportar el modelo base.
- Contexto limitado en la práctica por la configuración: `MAX_PROMPT_LEN=3072` y `MIN_RESPONSE_LEN=512` en la medición de referencia; prompts más largos requieren reconfigurar y pueden degradar la latencia de primer token (5,1 s con 2800 tokens).
- Cobertura idiomática limitada a seis lenguas europeas; no se documenta soporte de otros idiomas.
- Riesgo de alucinación inherente a un modelo de 3B: no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Sesgos: no se documentan análisis de sesgo en la model card; deben asumirse los del modelo base y los del corpus de entrenamiento, no detallado aquí.
- Trazabilidad: el autor fija el repositorio por commit y hash sha256 por archivo, pero no se publican hashes en la información disponible; conviene verificarlos en el repositorio antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene conservar la atribución a HuggingFaceTB/SmolLM3-3B.
- Madurez: 29 descargas y ninguna interacción social en el momento de la consulta; no hay evidencia de uso comunitario extenso ni de mantenimiento continuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arankays/SmolLM3-3B-int4-cw-ov
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Proyecto que lo usa (vinoWhisper): https://github.com/karanshukla/vinoWhisper
- OpenVINO: https://github.com/openvinotoolkit/openvino
- optimum-intel: https://github.com/huggingface/optimum-intel
- NNCF (cuantización): https://github.com/openvinotoolkit/nncf
