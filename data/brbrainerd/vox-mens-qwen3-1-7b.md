# brbrainerd/vox-mens-qwen3-1.7b

## Resumen

Vox MENS Qwen3-1.7B es un adaptador LoRA/PEFT entrenado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3-1.7B. Forma parte de la familia MENS (Model Engine & Neural Synthesis), una serie de adaptadores escalonados (0.6B, 1.7B, 4B y 8B) especializados en el lenguaje de programación Vox, un lenguaje nativo para IA con compilador escrito en Rust que transpila a Rust y TypeScript. El adaptador resuelve un problema concreto: los modelos de propósito general apenas han visto gramática, tipos algebraicos, sistema de efectos y diagnósticos estructurados de Vox durante el preentrenamiento, por lo que alucinan sintaxis de Rust o TypeScript cuando se les pide generar código Vox.

Este tier de 1.7B está pensado para generación rápida de código en un solo fichero y reparación de diagnósticos del compilador en una sola pasada, con ejecución local en portátiles y entornos de borde. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador, no el modelo base completo, que debe descargarse por separado.

La relevancia actual del modelo es acotada pero específica: demuestra un patrón de especialización por dominio mediante LoRA sobre la familia Qwen3, con un pipeline de evaluación automatizado (`eval-gate`) contra un conjunto de 192 ítems de validación de Vox y con versionado inmutable por etiquetas git para reproducibilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA/PEFT |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador añade un subconjunto no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos PEFT/LoRA (compatible con `peft` y `transformers`); no se especifica GGUF ni safetensors completos |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, mediante técnicas de ajuste eficiente de parámetros (LoRA/PEFT). No se especifica en la model card el rango del adaptador, los módulos objetivo, el número de tokens de entrenamiento ni la composición exacta del dataset. El entrenamiento está orientado a tres tareas: síntesis idiomática de módulos `.vox` que respeten la gramática estricta y las restricciones de tipos del lenguaje, reparación guiada por compilador consumiendo códigos de diagnóstico estructurados de `voxc` y generación de parches mínimos y deterministas sobre el AST y el código fuente, y traducción entre Vox y sus backends de compilación (Rust y TypeScript).

El pipeline MENS entrena adaptadores escalonados sobre cuatro tamaños de Qwen3 (0.6B, 1.7B, 4B, 8B) para cubrir distintos compromisos de latencia y capacidad. Cada adaptador pasa por una puerta de evaluación automatizada (`eval-gate`) contra un conjunto de validación de 192 ítems de Vox que mide la tasa de compilación limpia (parseo, typechecking y codegen contra el baseline sin adaptar) y la retención de capacidades colaterales en prompts generales de código y razonamiento. El estado de la puerta puede ser `Verified` (supera los umbrales de compilación sin degradar la retención) o `Baseline` (publicación inicial de referencia). No se indica en la información disponible en qué estado se encuentra este tier de 1.7B.

## Capacidades

- Generación de código Vox idiomático: síntesis de módulos `.vox` que respetan la gramática, los tipos algebraicos y el sistema de efectos del lenguaje.
- Reparación guiada por compilador: consumo de diagnósticos estructurados de `voxc` y producción de parches mínimos sobre el AST y el código fuente.
- Traducción entre Vox, Rust y TypeScript para interoperabilidad entre backends.
- Generación de código en un solo fichero y corrección de diagnósticos en una sola pasada (perfil de uso declarado para este tier).
- Razonamiento y generación de texto general heredados del modelo base Qwen3-1.7B.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tier de 1.7B se describe explícitamente como de una sola pasada, y las capacidades multi-fichero y de razonamiento profundo se asignan al tier de 8B.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking, visión o audio: no documentado en la información proporcionada.

## Casos de uso

- Autocompletado de código Vox en el editor: el adaptador genera fragmentos `.vox` sintácticamente válidos y alineados con el sistema de tipos, lo que evita las alucinaciones de sintaxis Rust o TypeScript típicas de modelos generalistas. Su tamaño de 1.7B permite latencias bajas en portátiles.
- Reparación automática de errores de compilación: integrado en el flujo de `voxc`, el modelo recibe el código de diagnóstico estructurado y devuelve un parche mínimo y determinista, lo que reduce el ciclo de corrección manual en un solo paso.
- Generación de módulos completos de un solo fichero: adecuado para utilidades, parsers y funciones auxiliares donde el contexto necesario cabe en una sola pasada y no se requiere razonamiento multi-fichero.
- Traducción de especificaciones entre Vox y sus backends: conversión de fragmentos de Rust o TypeScript a Vox idiomático (o a la inversa) para migraciones parciales y prototipado cruzado.
- Ejecución local y en el borde: al ser un adaptador de 1.7B sobre un modelo base pequeño, puede desplegarse en estaciones de trabajo sin GPU de datacenter, lo que encaja en flujos de desarrollo offline o con requisitos de privacidad.
- Evaluación y regresión de toolchains: el conjunto de validación de 192 ítems y el pipeline `eval-gate` permiten usar el adaptador como referencia reproducible en pruebas de regresión del compilador Vox y de los propios adaptadores.
- Docencia y prototipado del lenguaje Vox: al ejecutarse localmente y con licencia Apache 2.0, sirve para entornos de aprendizaje y experimentación sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card describe el pipeline `eval-gate` (tasa de compilación limpia de Vox frente al baseline sin adaptar y retención de capacidades colaterales sobre 192 ítems), pero no incluye cifras concretas para este tier.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia orientativa del modelo base de 1.7B, en bfloat16 requiere del orden de 3,4 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo base de 1.7B es viable en GPUs de consumo con suficiente VRAM.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas con 6-8 GB o más de VRAM en precisión reducida, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: CLI de Vox (`vox mens hub pull --size 1.7B`), y vía Python con `transformers` + `peft` cargando el adaptador sobre `Qwen/Qwen3-1.7B`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El autor describe este tier como de "generación rápida de un solo fichero" sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vox-mens-qwen3-1.7b | 1.7B (base) + LoRA | No disponible | Vox (generación y reparación de compilador) | Apache 2.0 | HuggingFace (adaptador) |
| vox-mens-qwen3-0.6b | 0.6B (base) + LoRA | No disponible | Vox, completado inline y reparación sintáctica rápida | Apache 2.0 | HuggingFace (adaptador) |
| vox-mens-qwen3-4b | 4B (base) + LoRA | No disponible | Vox, tier equilibrado por defecto | Apache 2.0 | HuggingFace (adaptador) |
| vox-mens-qwen3-8b | 8B (base) + LoRA | No disponible | Vox, síntesis arquitectónica y razonamiento multi-fichero | Apache 2.0 | HuggingFace (adaptador) |

No se dispone de datos de rendimiento comparativo entre tiers en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado para Vox y puede degradar el rendimiento en tareas generales de código fuera de ese dominio; el propio pipeline `eval-gate` incluye pruebas de retención colateral precisamente por este riesgo.
- Idiomas: etiquetado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: aunque el objetivo es reducir la mezcla con sintaxis Rust o TypeScript, no se publican tasas de error ni métricas de fidelidad gramatical para este tier.
- Estado de la puerta de evaluación desconocido: no se indica si este adaptador está en estado `Verified` o `Baseline`, lo que afecta a la confianza en su calidad frente al baseline sin adaptar.
- Dependencia del modelo base: requiere descargar Qwen/Qwen3-1.7B por separado; el repositorio solo contiene el adaptador (0,1 GB).
- Versionado: el autor recomienda fijar una revisión inmutable (`--revision v<N>`) en lugar de seguir `main`, ya que las etiquetas pueden cambiar de contenido entre versiones.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3-1.7B.
- Sin datos de cuantización ni de despliegue en motores de inferencia de alto rendimiento (vLLM, TGI), lo que limita las garantías para producción a gran escala.
- Contexto y límites de tokens no documentados: no se especifica la ventana efectiva ni el comportamiento en prompts largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brbrainerd/vox-mens-qwen3-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Índice del registro MENS: https://huggingface.co/brbrainerd/vox-mens-index
- Adaptador tier 0.6B: https://huggingface.co/brbrainerd/vox-mens-qwen3-0.6b
- Adaptador tier 4B: https://huggingface.co/brbrainerd/vox-mens-qwen3-4b
- Adaptador tier 8B: https://huggingface.co/brbrainerd/vox-mens-qwen3-8b
- Web del lenguaje Vox: https://vox-lang.org
- Repositorio GitHub de Vox: https://github.com/vox-foundation/vox
