# Christeck/Qwen3.5-35B-A3B-PACKED-GGUF

## Resumen

Qwen3.5-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen de Alibaba Cloud, con aproximadamente 35 mil millones de parámetros totales y unos 3 mil millones activos por token. Esta ficha concreta, publicada por Christeck bajo el identificador `Christeck/Qwen3.5-35B-A3B-PACKED-GGUF`, no es un modelo nuevo ni un fine-tuning: es un reempaque sin pérdida de los códigos de cuantización trellis EXL3 de Turboderp en el formato contenedor Packed GGUF que consume el motor Metal Trellis, orientado a Apple Silicon.

El interés de esta publicación es práctico: permite ejecutar un MoE de clase 35B en hardware de consumo Apple con un tamaño de archivo de 12,99 GiB y velocidades interactivas (18,7 tok/s de decodificación y 0,44 s de TTFT en un M1 Max de 64 GB). El autor declara explícitamente que el producto real es el motor Metal Trellis y que este archivo es una copia de cortesía para evitar que otros repitan el trabajo de conversión.

Es importante subrayar que este archivo no es un GGUF estándar de llama.cpp: requiere el fork Metal Trellis para decodificar los pesos de expertos empaquetados en trellis mediante kernels de Metal. La licencia es Apache 2.0, heredada del modelo base, y los idiomas declarados son inglés y español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer; pesos cuantizados con trellis EXL3 y reempaquetados en contenedor Packed GGUF propietario de Metal Trellis |
| Parametros totales | ~35 mil millones (clase 35B) |
| Parametros activos | ~3 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis (códigos idénticos a la fuente de Turboderp); tamaño de archivo resultante 12,99 GiB |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | Packed GGUF (formato propio del motor Metal Trellis; no compatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B emplea una arquitectura Mixture of Experts con enrutamiento disperso: de los ~35B parámetros totales, solo ~3B se activan por token, lo que reduce el coste computacional de inferencia manteniendo la capacidad de representación de un modelo de mayor tamaño. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La contribución técnica de esta publicación no reside en el entrenamiento sino en el formato de almacenamiento. Turboderp (ExLlamaV3) aplica cuantización trellis EXL3 a los pesos del modelo; Christeck Labs realiza un reempaque sin pérdida de esos códigos trellis en el contenedor Packed GGUF que el motor Metal Trellis decodifica en tiempo de ejecución mediante kernels de Metal. No hay reentrenamiento ni alteración de pesos: los códigos son idénticos a la fuente EXL3 y solo cambia el contenedor. El motor decodifica los pesos de expertos empaquetados al vuelo, lo que permite servir un MoE de 35B en memoria unificada de Apple Silicon.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-35B-A3B.
- Capacidad multilingüe limitada, según la model card, a inglés y español.
- Ejecución local en Apple Silicon mediante el motor Metal Trellis (kernels de Metal).
- Decodificación de pesos de expertos empaquetados en trellis en tiempo de ejecución.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) específicas de esta publicación; deben asumirse las del modelo base, no verificadas aquí.

## Casos de uso

- Inferencia local de un MoE de clase 35B en Mac: el archivo de 12,99 GiB y las métricas medidas en M1 Max (18,7 tok/s, TTFT 0,44 s) permiten usar el modelo de forma interactiva en un equipo de sobremesa Apple sin GPU dedicada.
- Prototipado y evaluación de modelos grandes en estación de trabajo: investigadores que quieran probar el comportamiento de Qwen3.5-35B-A3B sin acceso a clústeres con A100/H100 pueden desplegarlo en memoria unificada de Apple Silicon.
- Desarrollo y validación del motor Metal Trellis: este archivo sirve como caso de prueba práctico para verificar la corrección de la decodificación trellis en kernels de Metal frente a la fuente EXL3.
- Generación de texto asistida en local con requisitos de privacidad: al ejecutarse íntegramente en el equipo, es adecuado para tareas de redacción o resumen sobre datos que no deben salir de la máquina.
- Reproducción de la conversión EXL3 a Packed GGUF: el repositorio del motor documenta el procedimiento, y este archivo sirve como referencia de salida esperada para quien quiera convertir otros checkpoints EXL3.
- Experimentación con cuantización trellis: útil para comparar calidad y velocidad de EXL3 frente a otras cuantizaciones en el mismo modelo base sobre hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas aportadas son de rendimiento de inferencia en hardware concreto:

| Metrica | Valor | Hardware |
|---|---|---|
| Decodificacion (expertos) | 18,7 tok/s | M1 Max, 64 GB |
| TTFT de prefill | 0,44 s | M1 Max, 64 GB |
| Tamano de archivo | 12,99 GiB | — |

## Requisitos de hardware

- Plataforma: Apple Silicon con Metal y macOS; el motor Metal Trellis es un fork específico, no compatible con llama.cpp estándar.
- Memoria: el archivo ocupa 12,99 GiB; se necesita memoria unificada suficiente para los pesos más el estado de ejecución (el autor reporta funcionamiento en M1 Max de 64 GB; no se especifica el mínimo).
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este formato, que depende de kernels de Metal en Apple Silicon.
- Cabe en equipos Apple de gama alta con memoria unificada amplia; no se documenta compatibilidad con otros entornos.
- Opciones de despliegue: exclusivamente el motor Metal Trellis (https://github.com/Christeck-AI/metal-trellis). No es compatible con vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: 18,7 tok/s de decodificación y 0,44 s de TTFT en M1 Max 64 GB, según mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Christeck/Qwen3.5-35B-A3B-PACKED-GGUF (esta ficha) | ~35B totales, ~3B activos | no disponible | Packed GGUF / Metal Trellis | Apache 2.0 | Solo Apple Silicon; 12,99 GiB; 18,7 tok/s en M1 Max |
| Qwen/Qwen3.5-35B-A3B (modelo base) | ~35B totales, ~3B activos | no disponible | safetensors (formato original) | Apache 2.0 | Requiere infraestructura de GPU para servir |
| Christeck/Qwen3.8-27B-PACKED-GGUF (modelo hermano) | 27B densos | no disponible | Packed GGUF / Metal Trellis | Apache 2.0 | Prueba de corrección del motor; el autor lo describe como el menos práctico de la pareja |

No se dispone de datos de benchmarks para establecer una comparación de calidad frente a alternativas.

## Limitaciones y advertencias

- No es un GGUF estándar: no funciona con llama.cpp, Ollama, vLLM ni TGI; requiere el fork Metal Trellis y macOS sobre Apple Silicon.
- Solo se declaran inglés y español como idiomas soportados; el rendimiento en otros idiomas no está documentado.
- La longitud de contexto no se especifica en la información disponible, por lo que no puede planificarse su uso en tareas de contexto largo sin verificación previa.
- Al ser un reempaque sin reentrenamiento, hereda los sesgos y el riesgo de alucinación del modelo base Qwen3.5-35B-A3B, no evaluados en esta publicación.
- Publicación con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuario muy reducido y poca validación externa.
- La licencia Apache 2.0 permite uso comercial, pero el requisito de un motor específico (Metal Trellis) condiciona el despliegue en producción.
- Las métricas de rendimiento proceden únicamente del autor y de un solo equipo (M1 Max 64 GB); no hay verificación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Christeck/Qwen3.5-35B-A3B-PACKED-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Motor Metal Trellis: https://github.com/Christeck-AI/metal-trellis
- Modelo hermano (denso, prueba de corrección): https://huggingface.co/Christeck/Qwen3.8-27B-PACKED-GGUF
- Cuantización EXL3 (ExLlamaV3, Turboderp): no disponible en la información proporcionada
