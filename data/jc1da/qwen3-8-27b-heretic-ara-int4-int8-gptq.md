# JC1DA/Qwen3.8-27B-heretic-ara-INT4-INT8-GPTQ

## Resumen

El modelo **Qwen3.8-27B-heretic-ara-INT4-INT8-GPTQ** es una cuantización mixta de precisión INT4/INT8 del fine-tune *heretic-ara*, una variante decensurada y optimizada para agentes de codificación autónomos del modelo multimodal Qwen3.5-27B. El checkpoint resultante ocupa 22 GB en disco y reduce la memoria de pesos aproximadamente 2,4× respecto al original en BF16, manteniendo una pérdida de calidad casi nula: −0,76 puntos porcentuales en GSM8K y un aumento de perplejidad del +2,48 % en C4 frente al BF16 original.

La cuantización se ha realizado con GPTQModel 7.3.4 mediante un esquema dirigido por datos: las proyecciones MLP (64 módulos) se cuantizan a INT4, mientras que las proyecciones de atención completa y las del módulo de atención lineal recurrente GDN se mantienen en INT8, dejando el resto de componentes (normas, vision tower, cabeza de salida, MTP head) en BF16 nativo. El checkpoint se carga directamente en vLLM ≥ 0.27 con `quantization=auto_gptq`, incluyendo soporte para decodificación especulativa MTP y visión multimodal.

Este modelo es relevante para desarrolladores que necesitan desplegar un VLM de 27B con capacidad de razonamiento, visión y tool calling en infraestructura con memoria limitada, sin sacrificar calidad de salida frente a la versión sin cuantizar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (híbrida: atención full + GDN lineal recurrente + vision tower) |
| Parámetros totales | 34.995.630.832 (≈35B) |
| Parámetros activos | no disponible (arquitectura densa) |
| Longitud de contexto | 262.144 tokens (configuración vLLM `--max-model-len`) |
| Tipos de cuantización | INT4 GPTQ (MLP), INT8 GPTQ (proyecciones atención/GDN), BF16 nativo (resto) |
| Idiomas soportados | no disponible (etiqueta "English" en la variante W4A16; el modelo base Qwen3.5 es multilingüe) |
| Licencia | apache-2.0 (según variante W4A16; no confirmado para este checkpoint) |
| Formato de pesos | safetensors (GPTQ, `quantization_config` con reglas `dynamic`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-27B, una arquitectura híbrida que combina atención completa tradicional con módulos de atención lineal recurrente (GDN) y un vision tower para entrada multimodal. Sobre esta base, el fine-tune *heretic-ara* aplica un proceso de decensurado (abliteración) y optimización para agentes de codificación autónomos.

La cuantización de este checkpoint se realizó con GPTQModel 7.3.4 usando un enfoque dirigido por datos: se emplearon 607 prompts de calibración extraídos de los corpus del propio fine-tune. La asignación de precisión por módulo se define en el campo `dynamic` de `quantization_config`, que tanto GPTQModel como vLLM interpretan de forma nativa mediante reglas de expresión regular (`-:regex` para mantener sin cuantizar, `+:regex` para forzar ancho de bit). El config JSON incluye además reglas adicionales para los nombres fusionados que vLLM genera al cargar los pesos (por ejemplo, `in_proj_qkvz`, `qkv_proj`, `gate_up_proj`), lo que permite que el checkpoint se cargue sin transformaciones manuales.

## Capacidades

- Generación de texto multimodal: procesa tanto texto como imágenes, con soporte para preguntas y respuestas sobre imágenes (image Q&A).
- Razonamiento avanzado: incluye modo *thinking* configurable (`enable_thinking: true`), con preservación del razonamiento interno en la salida.
- Tool calling y agentes: soporte nativo para auto-tool-choice con parser `qwen3_coder`, pensado para su integración en agentes autónomos de codificación (Claude Code, OpenCode, Aider, Hermes).
- Decodificación especulativa MTP (Multi-Token Prediction): permite acelerar la generación con 3 tokens especulativos, verificado en vLLM 0.27.1.
- Capacidades multilingües: aunque la card no detalla idiomas, el modelo base Qwen3.5 es multilingüe; la variante W4A16 de este mismo fine-tune declara "English" como idioma principal.
- Longitud de contexto extensa: hasta 262.144 tokens, adecuada para tareas de razonamiento de largo alcance y análisis de documentos extensos.

## Casos de uso

- **Agentes de codificación autónomos**: el modelo está optimizado para integrarse en herramientas como Claude Code, OpenCode o Aider. Su soporte nativo de tool calling y el parser `qwen3_coder` permiten que el agente invoque funciones de edición de código, ejecución de comandos y búsqueda en repositorios sin intervención humana.
- **Asistente multimodal para documentación técnica**: gracias al vision tower, el modelo puede analizar capturas de pantalla, diagramas o esquemas de arquitectura y responder preguntas sobre ellos, útil en revisiones de diseño o depuración visual de interfaces.
- **Razonamiento matemático en producción**: con un 77,63 % de exactitud en GSM8K (5-shot) y una degradación inferior a 1 punto frente al BF16, es viable para sistemas de tutorización matemática o verificación de soluciones.
- **Análisis de documentos largos**: con 262K tokens de contexto, puede procesar repositorios completos, manuales extensos o libros técnicos en una sola pasada, manteniendo el razonamiento coherente a lo largo de la secuencia.
- **Sistemas de chat con tool use**: su capacidad de tool calling con parser `qwen3_coder` lo hace adecuado para asistentes de soporte técnico que necesitan consultar bases de datos, APIs o ejecutar comandos de sistema.
- **Despliegue en GPU con memoria limitada**: con 22 GB de pesos y cuantización mixta, puede ejecutarse en una RTX 4090 o A100 40GB, permitiendo a equipos pequeños desplegar un modelo multimodal de 27B sin recurrir a clústeres.

## Benchmarks y rendimiento

Los siguientes resultados se midieron con vLLM 0.27.1 en una A100 80GB, comparando el checkpoint cuantizado contra el BF16 original, con los mismos prompts y subconjuntos.

| Benchmark | BF16 original | Este build | Δ |
|---|---|---|---|
| GSM8K (5-shot, exact match flexible) | 78,39 % | 77,63 % | −0,76 pp |
| GSM8K (5-shot, exact match estricto) | 76,80 % | 76,65 % | −0,15 pp |
| GSM8K respuestas vacías (EOS inmediato) | 1,6 % | 7,4 % | +5,8 pp |
| Perplejidad C4 (validación, 293.618 tokens) | 11,145 | 11,422 | +2,48 % |
| KLD corto (8 prompts, 464 pos, nats/token) | — | 0,0200 | refs: 0,0009 (W8A16) / 0,0019 (FP8) |
| KLD largo (probe 4096 tokens, nats/token) | — | 0,0895 | ref: 0,0044 (FP8) |
| Top-1 largo | — | 98,4% | refs: 99,4% (W8A16) / 98,5% (FP8) |

El autor indica que la pérdida en GSM8K se debe casi exclusivamente a una mayor tasa de EOS temprano (el modelo cuantizado a veces se detiene justo después del prompt `Answer:` con temperatura 1,0). Condicionado a producir una respuesta no vacía, los resultados son estadísticamente indistinguibles del BF16. Se recomienda bajar la temperatura a ≤ 0,7 o reintentar las respuestas vacías.

## Requisitos de hardware

- **VRAM estimada**: 22 GB de pesos en INT4/INT8; con contexto de 262K tokens se recomienda al menos 40 GB de VRAM para activaciones y KV cache. Para contextos cortos (≤ 8K tokens), puede caber en 24 GB.
- **GPU recomendadas**: A100 80GB (verificado por el autor), H100, RTX 4090 (24 GB) para contextos moderados, RTX 3090 (24 GB) como alternativa de menor coste.
- **Compatibilidad con GPU de consumo**: sí, en RTX 4090/3090 con contextos ≤ 32K tokens y `--gpu-memory-utilization 0.92`.
- **Opciones de despliegue**: vLLM ≥ 0.27 con `quantization=auto_gptq` (verificado); soporte potencial en llama.cpp y Ollama vía conversión GGUF (no verificado por el autor).
- **Latencia y throughput**: no disponibles en la documentación proporcionada; el autor menciona que la decodificación especulativa MTP con 3 tokens especulativos funciona correctamente, lo que puede mejorar el throughput respecto a la generación autoregistiva simple.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | GSM8K (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Qwen3.8-27B-heretic-ara (BF16)** | ~35B | BF16 | 262K | 78,39% | apache-2.0 (base) | HuggingFace |
| **Este checkpoint (INT4+INT8)** | ~35B | INT4/INT8 | 262K | 77,63% | apache-2.0 (base) | HuggingFace |
| **W4A16 (AutoRound)** | ~35B | INT4 W4A16 | no disponible | no disponible | apache-2.0 | HuggingFace |
| **W8A16 MTP (de lued)** | ~35B | INT8 W8A16 | no disponible | no disponible | no disponible | HuggingFace |

La comparativa muestra que esta variante INT4+INT8 ofrece una degradación mínima frente al BF16 original (menos de 1 punto en GSM8K), mientras que las alternativas W4A16 y W8A16 no tienen benchmarks publicados en la información disponible. El modelo W4A16 de JC1DA usa AutoRound en lugar de GPTQ, lo que puede implicar diferencias de compatibilidad con vLLM.

## Limitaciones y advertencias

- **Aumento de respuestas vacías**: el modelo cuantizado tiene una tasa de EOS inmediato del 7,4 % frente al 1,6 % del BF16, especialmente con `temperature=1.0`. Se recomienda usar `temperature ≤ 0.7` o reintentar las respuestas vacías en producción.
- **Riesgo de alucinación**: no hay datos específicos, pero al ser un modelo decensurado, puede generar contenido que el modelo original rechazaría; es necesario evaluar el contenido generado en entornos sensibles.
- **Idiomas**: la card no declara idiomas soportados; si el despliegue requiere multilingüismo, se recomienda verificar el rendimiento en el idioma objetivo antes de producción.
- **Licencia**: la card no especifica licencia; la variante W4A16 del mismo fine-tune declara apache-2.0, pero no se puede confirmar para este checkpoint concreto.
- **Compatibilidad**: verificado solo con vLLM ≥ 0.27; la carga en otros frameworks (llama.cpp, Ollama, TGI) no está documentada y puede requerir conversión adicional.
- **Uso comercial**: si el modelo base es Apache 2.0, el uso comercial es posible, pero el proceso de decensurado puede tener implicaciones legales según el contexto de uso.
- **Contexto largo**: el modelo soporta 262K tokens, pero el consumo de KV cache en esa longitud es elevado; se recomienda dimensionar la VRAM adecuadamente para evitar OOM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JC1DA/Qwen3.8-27B-heretic-ara-INT4-INT8-GPTQ
- Variante W4A16 (AutoRound): https://huggingface.co/JC1DA/Qwen3.8-27B-heretic-ara-W4A16
- Variante W8A16 (de lued): https://llm-explorer.com/model/lued%2FQwen3.8-27B-heretic-ara-INT8-W8A16-MTP,7cMtamBqxIcZma6naAl8Er
- Modelo base *heretic-ara* (de trohrbaugh): https://llm-explorer.com/model/trohrbaugh%2FQwen3.8-27B-heretic-ara,3lOkoblJbLCrW6LcRlJIk
- Versión en Ollama (de jacokon): https://ollama.com/jacokon/qwen3.8-27b-heretic-ara
