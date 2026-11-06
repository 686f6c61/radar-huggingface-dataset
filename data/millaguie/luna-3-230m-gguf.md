# millaguie/Luna-3-230m-GGUF

## Resumen

Luna-3-230m-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo base Aobangaming/Luna-3-230m, publicado por el usuario millaguie. El modelo base es un transformer denso de 228.829.440 parámetros (aproximadamente 230M) con 12 capas, dimensión oculta de 768, 12 cabezas de atención sin GQA, vocabulario de 93.615 tokens y una longitud de contexto de 8.126 tokens. El repositorio no aporta un modelo nuevo, sino el soporte de arquitectura necesario para que estos pesos puedan ejecutarse en llama.cpp.

El problema que resuelve este repositorio es concreto: el autor original ya publicaba ficheros GGUF bien construidos (171 tensores, nombres canónicos de llama.cpp, `rope.freq_base` y épsilon de RMS correctos), pero la arquitectura `lightning` no existe en `src/llama-arch.cpp` de llama.cpp, por lo que ninguna build estándar podía cargarlos. Este repositorio añade el parche `lightning-port.patch` que implementa dicha arquitectura, verificada contra la implementación de referencia del autor antes de publicar cualquier métrica.

La relevancia actual es doble: por un lado, demuestra un caso práctico de portado de arquitecturas no upstream a llama.cpp con verificación rigurosa (tokenizador, logits, KLD); por otro, advierte de una trampa metodológica al interpretar la columna `PPL(Q)/PPL(base)` de `llama-perplexity` en modelos de alta entropía, donde la divergencia real puede ser exactamente cero y la columna mostrar una diferencia aparente del 5,9 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (`lightning`), 12 capas, 768 de dimensión, 12 cabezas sin GQA |
| Parámetros totales | 228.829.440 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.126 tokens |
| Tipos de cuantización | BF16 (referencia), Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); BF16 de referencia en el mismo repositorio |
| Vocabulario | 93.615 tokens |
| Longitud feed-forward | 4 × d_model (3.072) |
| Base RoPE | 10.000 |
| Épsilon RMS | 1e-6 |
| Activación | GELU exacta (`approximate="none"`), no aproximación tanh |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 12 capas con anchura 768 y 12 cabezas de atención sin grouped-query attention, es decir, una arquitectura convencional en su forma. Tres detalles resultan críticos para el portado: el uso de GELU exacta en lugar de la aproximación tanh (un error aquí es invisible en el texto generado, según el propio autor); doce tensores muertos (`final_norm` por bloque, nunca usados en `forward` y comentados como `# remove later lol` en el código original) que el conversor elimina; y `add_prefix_space` activado en el pre-tokenizador ByteLevel del tokenizador, a diferencia del de GPT-2, lo que hace que declarar `tokenizer.ggml.pre = gpt-2` produzca una tokenización distinta a la del modelo original.

Tres hiperparámetros no están en `config.json` y se tomaron del código del autor: longitud feed-forward de 4 × d_model, base RoPE de 10.000 y épsilon RMS de 1e-6. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo RLHF o DPO. El repositorio no documenta innovaciones de decodificación especulativa ni atención lineal; la única innovación relevante es el propio soporte de arquitectura añadido a llama.cpp, junto con dos correcciones en el tokenizador de llama.cpp (registro del hash del pre-tokenizador y soporte de `add_space_prefix` en la rama BPE de `llama_vocab::tokenize`, que antes solo aplicaba la rama SPM).

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y produce texto gramatical a aproximadamente 310 tokens por segundo en CPU.
- Generación de texto base: pipeline `text-generation`.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas figuran como no disponibles.
- No se documenta visión, audio ni modo thinking.
- Capacidad de ejecución en llama.cpp únicamente con el parche de arquitectura incluido.

## Casos de uso

- Experimentación con arquitecturas no upstream en llama.cpp: el repositorio sirve como referencia completa de cómo portar una arquitectura nueva (`lightning`) aplicando el parche `lightning-port.patch` y validando contra la implementación de referencia en `transformers`.
- Validación de pipelines de cuantización: los ficheros Q8_0 y Q4_K_M con métricas KLD publicadas (0,000227 y 0,012842 de media respectivamente) permiten probar herramientas de evaluación de cuantizaciones sobre un modelo pequeño que cabe entero en RAM.
- Pruebas de tokenizadores: el caso de `add_prefix_space` y la comparación de 8 casos entre Hugging Face y llama.cpp constituyen un banco de pruebas reproducible para validar conversiones de tokenizador BPE.
- Desarrollo y depuración de infraestructura de inferencia: con 461 MB en BF16 y 8.126 tokens de contexto, el modelo se ejecuta íntegro en CPU sin división de capas, lo que elimina variables en pruebas de determinismo y comparación de logits.
- Docencia y formación en portado de modelos: el repositorio documenta cinco puertas de verificación (conversión, tokenizador, anclaje de logits, controles negativos y métricas) aplicables como metodología.
- Evaluación de modelos pequeños en entornos con recursos limitados: al caber en RAM consumer, permite experimentar con generación de texto conversacional sin GPU.
- Investigación sobre métricas de perplejidad: el análisis del sesgo de `PPL(base)` derivado de ficheros de log-probabilidad cuantizados a `uint16` es un caso de estudio sobre interpretación de resultados de `llama-perplexity`.

## Benchmarks y rendimiento

| Fichero | Bytes | KLD media | KLD mediana | Same top |
|---|---|---|---|---|
| BF16 (referencia) | 461.378.496 | — | — | — |
| Q8_0 | 246.946.688 | 0,000227 | 0,000204 | 98,816 % |
| Q4_K_M | 155.680.736 | 0,012842 | 0,011214 | 91,153 % |

Medición sobre wikitext-2 test, 100 fragmentos de 512 tokens, con `-fa on --seed 0 -ngl 0`, todo en CPU. El suelo del instrumento es exactamente 0,000000 con same-top del 100,000 % y una Δp máxima del 0,004 %, lo que confirma que las cifras anteriores corresponden al cuantizador y no al ruido de medición.

La perplejidad absoluta del BF16 de referencia es 9.780,30 ± 295,33 sobre wikitext-2, valor que el autor atribuye al modelo (entrenado sobre otra distribución y evaluado sobre prosa de Wikipedia en inglés), no al portado. La comparación con `transformers` reproduce dentro de tolerancia con un factor de 285× de margen. El autor advierte además que la columna `Mean PPL(Q)/PPL(base)` de `llama-perplexity` marca 1,058983 incluso en la ejecución de suelo con KLD exactamente cero, por el sesgo de aproximadamente 0,057 nats introducido por el fichero de log-probabilidades cuantizado a `uint16` sobre un rango recortado.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: BF16 requiere unos 461 MB; Q8_0 unos 247 MB; Q4_K_M unos 156 MB. El modelo completo cabe en RAM sin división de capas.
- GPU recomendadas: no se especifican; las pruebas publicadas se ejecutaron íntegramente en CPU (`-ngl 0`). Cualquier GPU consumer con más de 1 GB de VRAM puede alojarlo, aunque no hay datos de rendimiento en GPU.
- Cabe en cualquier GPU consumer y en sistemas integrados con al menos 1 GB de memoria disponible.
- Opciones de despliegue: llama.cpp con el parche `lightning-port.patch` aplicado y compilado. Una build estándar falla con `unknown model architecture: 'lightning'`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros motores.
- Rendimiento: aproximadamente 310 tokens por segundo en CPU para generación de texto, según el autor.
- Requisito de compilación: es imprescindible aplicar el parche incluido en el repositorio antes de cargar los ficheros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luna-3-230m (este repo, GGUF) | 228.829.440 | 8.126 | MIT | GGUF | Requiere llama.cpp parcheado |
| Aobangaming/Luna-3-230m | 228.829.440 | 8.126 | MIT | Pesos originales (transformers) | Modelo base de referencia |
| Modelos de ~230M tipo GPT-2 small | ~124M–350M | Variable | Variable | Safetensors, GGUF | No disponible comparación directa de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada. La comparación más directa posible es contra el propio modelo base Aobangaming/Luna-3-230m, del que este repositorio es una cuantización verificada.

## Limitaciones y advertencias

- Requiere una build parcheada de llama.cpp: sin `lightning-port.patch` aplicado, la carga falla con `unknown model architecture: 'lightning'`.
- Perplejidad absoluta muy alta (9.780,30 ± 295,33 en wikitext-2), lo que refleja un modelo entrenado sobre una distribución distinta a la prosa de Wikipedia en inglés; no debe interpretarse como fallo del portado.
- La columna `PPL(Q)/PPL(base)` de `llama-perplexity` no es fiable en este modelo por el sesgo del fichero de log-probabilidades cuantizado; el autor recomienda leer la KLD e ignorar esa columna.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe.
- Sin información sobre sesgos conocidos ni sobre tasas de alucinación.
- Sin documentación de entrenamiento (datos, tokens, alineación), lo que impide evaluar procedencia y sesgos de los datos.
- Ausencia de soporte documentado de tool calling, agentes o razonamiento multi-paso, lo que limita su uso en pipelines de producción complejos.
- Contexto de 8.126 tokens, adecuado para conversaciones cortas pero insuficiente para documentos largos o análisis de repositorios.
- Licencia MIT: permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene verificar la licencia y procedencia del modelo base antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/millaguie/Luna-3-230m-GGUF
- Modelo base: https://huggingface.co/Aobangaming/Luna-3-230m
- Parche de arquitectura: `lightning-port.patch` (incluido en el repositorio)
- llama.cpp: no se proporciona enlace en la información disponible
