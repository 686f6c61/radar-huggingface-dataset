# IstishadAlamTishad/Owl-v1

## Resumen

Owl-v1 es un modelo de lenguaje a nivel de carácter (character-level) de 10,8 millones de parámetros, entrenado desde cero por IstishadAlamTishad. Se trata de un GPT minúsculo cuyo único propósito es generar texto con estilo de Shakespeare en inglés moderno temprano, entrenado sobre el corpus TinyShakespeare (alrededor de 1,1 millones de tokens). No compite con modelos de propósito general: es un experimento didáctico y una pieza de demostración para integración de arquitecturas personalizadas en Hugging Face.

La arquitectura es un transformer decoder-only tipo GPT con 6 capas, 6 cabezas de atención, dimensión de embedding de 384 y una ventana de contexto de solo 256 tokens. El vocabulario es de 65 caracteres, por lo que el modelo opera a nivel de carácter y no de subpalabra. Requiere `trust_remote_code=True` porque tanto el tokenizador (`CharTokenizer`) como la arquitectura (`ModelArchitecture`) son clases personalizadas incluidas en el repositorio.

Su relevancia es limitada y fundamentalmente pedagógica: sirve para entender el ciclo completo de entrenamiento de un GPT (tokenización a nivel de carácter, entrenamiento, curvas de perplejidad, sobreajuste) y como banco de pruebas para pipelines de generación de texto. No es adecuado para tareas de producción reales, razonamiento, código ni uso multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (character-level) |
| Parametros totales | 10.795.776 (10,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

Owl-v1 es un transformer decoder-only con 6 capas, 6 cabezas de atención y dimensión de embedding de 384, con un vocabulario de 65 caracteres. El tokenizador es de nivel de carácter (`CharTokenizer`), lo que implica que cada token corresponde a un único carácter del texto. La ventana de contexto es de 256 tokens, suficiente para fragmentos cortos de diálogo o acotaciones escénicas.

El entrenamiento se realizó sobre el dataset TinyShakespeare, con 1.115.394 tokens, durante 5.000 pasos y un tamaño de batch de 64. Según las curvas publicadas por el autor, la perplejidad de entrenamiento se aproxima a 1, mientras que la de validación alcanza un mínimo de aproximadamente 5 alrededor del paso 800 y después asciende hasta cerca de 50, lo que indica un sobreajuste claro sobre el corpus tan pequeño. No se documenta el uso de RLHF, DPO ni técnicas de alineación. El throughput reportado es de aproximadamente 37.000-38.000 tokens por segundo tras un breve calentamiento.

## Capacidades

- Generación de texto a nivel de carácter en inglés, limitada a estilo dramático de Shakespeare (Early Modern English).
- Continuación de diálogos a partir de nombres de personajes como prompt (por ejemplo, `"HAMLET:\n"`).
- Generación de acotaciones escénicas y aperturas de escena (por ejemplo, `"Enter KING and QUEEN.\n"`).
- Continuación probabilística de monólogos y versos, con deriva métrica frecuente.
- Generación libre desde un arranque en frío (prompt vacío o salto de línea).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo de pensamiento (thinking).
- Capacidad multilingüe nula: solo inglés.

## Casos de uso

- Aprendizaje de entrenamiento de GPT desde cero: el modelo permite reproducir el ciclo completo (tokenización por carácter, entrenamiento, evaluación de perplejidad) y observar el sobreajuste en corpus pequeños, lo que lo hace idóneo para cursos y tutoriales.
- Demostración de integración con Hugging Face: sirve como ejemplo mínimo de modelo con `trust_remote_code=True`, tokenizador y arquitectura personalizados, útil para validar pipelines de carga y generación.
- Generación de diálogo teatral de relleno: puede producir fragmentos de diálogo con sabor isabelino para prototipos, juegos o experimentos creativos donde no se requiera coherencia prolongada.
- Banco de pruebas de pipelines de inferencia: su tamaño reducido (10,8 M de parámetros) permite ejecutar pruebas de integración de `transformers`, generación con muestreo (`temperature`, `top_k`) y decodificación en CPU sin coste apreciable.
- Experimentos de análisis de sobreajuste: las curvas de perplejidad publicadas permiten estudiar el comportamiento de un modelo pequeño frente a la divergencia entre entrenamiento y validación.
- Generación de texto de ambiente en demos educativas: útil para ilustrar cómo un modelo de lenguaje aprende patrones de estilo a partir de un corpus literario concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta curvas de perplejidad y throughput:

| Metrica | Valor |
|---|---|
| Perplejidad de entrenamiento | ~1 |
| Perplejidad de validación (mínimo) | ~5 (paso ~800) |
| Perplejidad de validación (final) | ~50 |
| Throughput | ~37.000-38.000 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (10,8 M de parámetros); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1060, RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato es safetensors con código personalizado, no GGUF).
- Latencia y throughput estimados: ~37.000-38.000 tokens/s según el autor, tras un breve calentamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Owl-v1 | 10,8 M | 256 | MIT | Hugging Face | Character-level, TinyShakespeare |
| GPT-2 small | 124 M | 1024 | MIT | Hugging Face | Subword (BPE), corpus web |
| NanoGPT (referencia) | ~10-124 M | variable | MIT | GitHub | Implementación educativa de Karpathy |
| TinyLlama | 1,1 B | 2048 | Apache 2.0 | Hugging Face | Modelo pequeño de propósito general |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: el corpus TinyShakespeare está sesgado hacia el canon literario inglés y una visión cultural muy concreta; el modelo reproducirá esos patrones.
- Riesgo de alucinación: alto en el sentido de que genera texto plausible pero sin coherencia factual; no tiene conocimiento del mundo.
- Limitaciones de contexto: ventana de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Limitaciones de idioma: solo inglés; no soporta castellano ni otros idiomas.
- Restricciones de licencia: licencia MIT, permite uso comercial, pero el modelo no es apto para producción real por su calidad y tamaño.
- Caveat importante: requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de usarlo en entornos sensibles.
- Sobreajuste documentado: la perplejidad de validación se degrada tras el paso ~800, por lo que la calidad de generación es limitada y propensa a repetir patrones del corpus.
- No apto para tareas de razonamiento, código, matemáticas ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/IstishadAlamTishad/Owl-v1
- Dataset TinyShakespeare (referencia): https://github.com/karpathy/char-rnn/blob/master/data/tinyshakespeare/input.txt
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
