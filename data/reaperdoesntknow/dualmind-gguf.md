# reaperdoesntknow/DualMind-GGUF

## Resumen

DualMind-GGUF es la versión cuantizada en formato GGUF del modelo DualMind, un modelo de lenguaje de 1.700 millones de parámetros (2.031.739.904 parámetros reales según los pesos en safetensors) desarrollado por Convergent Intelligence LLC: Research Division. El modelo implementa una arquitectura de "cognición dual" en la que un único conjunto de pesos produce tres fases explícitas de razonamiento: `<explore>` (razonamiento libre), `<examine>` (autocrítica adversarial) y `<response>` (síntesis final). El objetivo es trasladar al despliegue local la dinámica de múltiples modelos en diálogo ("multi-model dialectics") colapsada en un solo modelo.

La relevancia de esta ficha radica en que el repositorio GGUF permite ejecutar el modelo en CPU y en GPUs de consumo (a partir de 6 GB de VRAM según el autor) mediante llama.cpp, Ollama o LM Studio. El modelo base deriva de Qwen3-1.7B y ha pasado por una cadena de destilación (DistilQwen3, Disctil con refinado DISC y destilación de conocimiento desde Qwen3-30B-A3B-Thinking) antes del ajuste supervisado sobre el dataset LogicInference_OA.

La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. No se han publicado resultados de benchmarks en la información disponible, por lo que las afirmaciones de rendimiento del autor deben tratarse como no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B), con esquema de razonamiento dual explore/examine/response |
| Parametros totales | 2.031.739.904 (según safetensors); el autor describe el modelo como "1.7B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | F16 (~3,4 GB), Q8_0 (~1,8 GB), Q5_K_M (~1,3 GB), Q4_K_M (~1,1 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base DualMind se distribuye en SafeTensors/BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only heredado de Qwen3-1.7B. Su rasgo diferencial no es arquitectónico sino de formato de razonamiento: se entrena para emitir secuencialmente un bloque `<explore>` (derivación y especulación sin restricciones), un bloque `<examine>` (autocrítica adversarial y detección de errores) y un bloque `<response>` (respuesta limpia sintetizada del diálogo interno). El autor lo describe como "dialéctica multi-modelo colapsada en pesos compartidos".

La cadena de entrenamiento declarada es: Qwen3-1.7B → DistilQwen3 (sin censura) → Disctil (refinado con DISC) → destilación de conocimiento (TKD) desde Qwen3-30B-A3B-Thinking → SFT de DualMind sobre el dataset LogicInference_OA. El autor menciona fundamentos matemáticos propios ("Discrepancy Calculus", "Topological Knowledge Distillation", operador de discrepancia Df(x) y descomposición BV) documentados en la model card del modelo base y en publicaciones con DOI. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset. La cuantización GGUF preserva, según el autor, las "fronteras estructurales" aprendidas durante el entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento en tres fases explícitas: exploración, autocrítica y síntesis final.
- Razonamiento matemático y lógico (el ejemplo de la model card es una demostración de que toda sucesión convergente es de Cauchy).
- Autocrítica y detección de errores dentro del propio proceso de razonamiento (`<examine>`).
- Razonamiento multi-paso orientado a tareas de inferencia lógica (entrenado sobre LogicInference_OA).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking": sí, implementado mediante los bloques `<explore>`/`<examine>` antes de `<response>`.

## Casos de uso

- Razonamiento lógico y matemático local: el modelo puede resolver demostraciones y problemas de inferencia paso a paso usando el ciclo explore→examine→response, adecuado para entornos sin conexión o con requisitos de privacidad.
- Despliegue en edge y CPU: con la cuantización Q4_K_M (~1,1 GB) cabe en dispositivos de bajos recursos y se ejecuta vía llama.cpp u Ollama, lo que permite integrar razonamiento en aplicaciones de escritorio o embebidas.
- Asistente de estudio de lógica: el bloque `<examine>` hace visible el proceso de autocrítica, útil para herramientas educativas que muestran al estudiante dónde puede fallar una derivación.
- Prototipado rápido de pipelines de razonamiento: al ser Apache 2.0 y ejecutable en una GPU de 6 GB, sirve para validar arquitecturas de "razonamiento con autocrítica" antes de escalar a modelos mayores.
- Generación de borradores con revisión automática: el patrón explore/examine permite producir una respuesta y luego una revisión interna en una sola pasada, útil en tareas de redacción técnica donde se quiere señalar errores propios.
- Filtrado y verificación de cadenas de razonamiento: el modelo puede usarse para examinar razonamientos generados por otros sistemas y detectar inconsistencias, dado su entrenamiento en autocrítica adversarial.
- Experimentación en destilación de conocimiento: investigadores interesados en la cadena Qwen3-30B-A3B-Thinking → 1.7B pueden usar este modelo como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,4 GB en F16, ~1,8 GB en Q8_0, ~1,3 GB en Q5_K_M y ~1,1 GB en Q4_K_M (tamaños de archivo declarados por el autor; el consumo real en ejecución es algo superior por el contexto KV).
- El autor indica que la variante GGUF está pensada para "CPU/6GB GPU".
- GPU recomendadas: no disponibles de forma explícita; por tamaño, cualquier GPU consumer con 6 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente. GPUs de datacenter (A100, H100) no son necesarias.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones indicadas.
- Opciones de despliegue: llama.cpp, Ollama (imagen publicada `reaperdoesntrun/DualMinded-1.7B`), LM Studio y cualquier runtime compatible con GGUF.
- Parámetros de muestreo recomendados por el autor: temperature 0.6, top_p 0.9, repeat_penalty 1.3, num_predict 512–1024.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DualMind-GGUF | 2,03 B (descrito como 1.7B) | no disponible | Apache 2.0 | GGUF | Razonamiento explore/examine/response, solo inglés |
| Qwen3-1.7B (modelo base de la familia) | 1,7 B | no disponible en esta ficha | Apache 2.0 (según familia Qwen3) | SafeTensors, GGUF | Base sin el esquema de cognición dual; referencia directa de linaje |
| Qwen3-30B-A3B-Thinking (profesor) | 30 B totales (MoE) | no disponible en esta ficha | Apache 2.0 (según familia Qwen3) | SafeTensors, GGUF | Profesor de la destilación; mucho mayor y no apto para edge |
| Modelos de razonamiento pequeños tipo 1–2B con thinking | variable | variable | variable | variable | No se dispone de comparación verificada con benchmarks en la información proporcionada |

La comparación cuantitativa de rendimiento con alternativas no está disponible porque el autor no publica benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la etiqueta de idioma; no se declara soporte multilingüe.
- No se han publicado benchmarks independientes; las afirmaciones sobre calidad del razonamiento no están verificadas.
- Riesgo de bucles de enumeración: el propio autor recomienda `repeat_penalty` 1.3 para prevenirlos, lo que sugiere una tendencia conocida a repetir listas.
- Riesgo de alucinación inherente a un modelo de 1,7–2 B parámetros; la autocrítica interna no garantiza corrección factual.
- Longitud de contexto no documentada en la información disponible; no debe asumirse una ventana amplia.
- Al ser una cuantización, puede haber degradación de calidad respecto al modelo base BF16, especialmente en Q4_K_M.
- La cadena de entrenamiento incluye una fase "uncensored" (DistilQwen3), lo que puede implicar menor alineación de seguridad; conviene evaluar el comportamiento antes de usarlo en producción orientada a usuarios.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribución correspondientes.
- El modelo base y sus derivados pertenecen a un autor individual/organización pequeña; la documentación matemática ("Discrepancy Calculus") no ha sido validada de forma independiente en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/reaperdoesntknow/DualMind-GGUF
- Modelo base (SafeTensors): https://huggingface.co/reaperdoesntknow/DualMind
- Variante Opus: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Variante thinking: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- GGUF de la variante Opus: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Metodología (paper): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Paper "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper "Discrepancy Calculus": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Colección DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
