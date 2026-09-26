# navthings/tale

## Resumen

tale es un modelo de generación de texto de tipo transformer decoder-only, con una arquitectura de estilo Llama, desarrollado por el usuario navthings y publicado en Hugging Face bajo licencia MIT. Con 47.424.000 parámetros, está entrenado desde cero sobre el dataset TinyStories (roneneldan/TinyStories), un corpus sintético de relatos infantiles cortos con vocabulario y gramática simplificados, diseñado originalmente para estudiar qué capacidades lingüísticas emergen en modelos muy pequeños.

El modelo resuelve un problema muy acotado: generar cuentos breves en inglés a partir de un prompt tipo "once upon a time". No es un modelo de propósito general ni un modelo de instrucciones; es una base (base model) sin ajuste por instrucciones ni RLHF. Su interés práctico está en que ocupa 0,1 GB de repositorio, cabe en cualquier hardware, y sirve como pieza didáctica o como punto de partida para experimentos de entrenamiento desde cero, fine-tuning en dominios concretos y validación de pipelines GGUF.

Técnicamente destaca por su configuración inusualmente pequeña (13 capas, dimensión 384, 6 cabezas de consulta y 2 cabezas KV, es decir, atención con consultas agrupadas) y por su ventana de contexto de solo 384 tokens. El autor indica que esta publicación corresponde a un checkpoint temprano, con únicamente 2000 pasos de entrenamiento ejecutados sobre Apple Silicon, por lo que el modelo está claramente infraentrenado en el momento de su publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama, con atención de consultas agrupadas (GQA) |
| Parámetros totales | 47.424.000 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantización | f16 (sin cuantizar) y q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (`tale-f16.gguf`, `tale-q8_0.gguf`); el recuento de parámetros procede de safetensors |
| Capas | 13 |
| Dimensión del modelo | 384 |
| Cabezas de consulta / cabezas KV | 6 / 2 |
| Dimensión por cabeza | 64 (derivada: 384 / 6) |
| Dataset de entrenamiento | roneneldan/TinyStories |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

tale es un transformer decoder-only autorregresivo con la configuración típica de la familia Llama: 13 capas, dimensión oculta de 384, 6 cabezas de consulta y 2 cabezas de clave-valor. Esa relación 6:2 implica atención de consultas agrupadas (GQA), que reduce el tamaño de la caché KV en inferencia a costa de compartir proyecciones de clave y valor entre grupos de cabezas. Con dimensión por cabeza de 64, la caché KV ocupa aproximadamente 3.328 elementos por token (2 tensores × 13 capas × 2 cabezas KV × 64 dimensiones), es decir, unos 6,5 KB por token en FP16 y unos 2,5 MB para los 384 tokens de contexto completo. No se ha especificado en la información disponible si emplea RMSNorm, RoPE, sesgo en las proyecciones, tamaño de vocabulario ni dimensión de la capa feed-forward.

El entrenamiento se realizó desde cero sobre el dataset TinyStories, un corpus de relatos infantiles generados con GPT-3.5 y GPT-4 y filtrados para que usen vocabulario básico. El autor indica que el entrenamiento se ejecutó en hardware Apple Silicon con un schedule de learning rate de warmup seguido de decaimiento coseno. La publicación corresponde a un checkpoint temprano: solo 2000 pasos completados. No hay información disponible sobre el número total de tokens procesados, la composición exacta del dataset, el tamaño de batch, la precisión de entrenamiento ni sobre si hubo fases posteriores de ajuste (SFT, RLHF o DPO); por los artefactos publicados, se trata de un modelo base sin alineación por instrucciones.

## Capacidades

- Generación de texto narrativo breve en inglés, con estilo de cuento infantil, a partir de prompts como "once upon a time".
- Continuación de texto y finalización de historias cortas dentro del registro lingüístico simple de TinyStories.
- Manejo de vocabulario básico y estructuras gramaticales sencillas en inglés; se espera un rendimiento pobre fuera de ese registro.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado para agentes, planificación ni razonamiento multi-paso.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- Multilingüismo: únicamente inglés declarado; no hay evidencia de capacidades en castellano u otros idiomas.
- No es un modelo instructivo: no responde a instrucciones ni a formatos de chat de forma fiable, ya que no se ha aplicado ajuste por instrucciones.
- Capacidad de ejecución en CPU y en dispositivos de bajos recursos gracias a su tamaño (menos de 0,1 GB en q8_0).

## Casos de uso

- Generación de cuentos infantiles en inglés: el modelo se puede usar como generador de microrrelatos para una aplicación de lectura infantil o un chatbot de cuentacuentos, aprovechando que su entrenamiento se ha hecho íntegramente sobre relatos de este tipo y que su vocabulario es deliberadamente simple.
- Base para fine-tuning en dominios concretos: al ser un modelo pequeño con licencia MIT, es viable reentrenarlo o ajustarlo con un corpus propio (por ejemplo, cuentos en castellano) en una sola GPU de consumo o incluso en CPU durante un tiempo acotado.
- Investigación sobre modelos de escala reducida: sirve como sujeto de estudio para analizar qué capacidades gramaticales y narrativas emergen en la franja de 40-50 millones de parámetros con corpus sintéticos, replicando la línea de trabajo del paper de TinyStories.
- Validación de pipelines de despliegue: al publicarse en GGUF, permite verificar de extremo a extremo cadenas de herramientas como llama.cpp, Ollama o servidores compatibles con la API de OpenAI (el repositorio está etiquetado como `endpoints_compatible`) sin consumir recursos significativos.
- Pruebas de CI/CD: por su tamaño y su velocidad de carga, es adecuado como modelo de humo en tests automáticos que comprueban que un servicio de inferencia arranca, tokeniza y devuelve respuestas coherentes con el contrato esperado.
- Inferencia en el borde (edge) y en dispositivos móviles: con pesos de aproximadamente 48 MB en q8_0 y una caché KV de apenas unos megabytes, puede ejecutarse en Raspberry Pi, teléfonos o navegador, tal y como demuestra el playground del autor.
- Generación de datos sintéticos para pruebas: puede producir texto de relleno realista (aunque simple) para poblar entornos de desarrollo, probar interfaces de usuario o validar sistemas de almacenamiento y búsqueda.
- Demostración educativa de entrenamiento desde cero: el autor publica el código de entrenamiento, por lo que el modelo sirve como referencia reproducible para cursos y talleres sobre entrenamiento de LLM a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, evaluaciones de calidad narrativa, comparaciones con otros modelos ni resultados en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 48 MB para los pesos en q8_0 y unos 95 MB en f16 (derivado de los 47,4 millones de parámetros), más unos 2,5 MB de caché KV en FP16 para los 384 tokens de contexto completo.
- GPU recomendadas: no se requiere GPU. Cualquier GPU de consumo de la última década (por ejemplo, GTX 1050, RTX 3060, RTX 4090) ejecuta el modelo con margen sobrado; también es viable en GPUs integradas.
- Compatibilidad con GPU de consumo: sí, en todas las gamas actuales e incluso en hardware muy limitado, dado que el modelo completo ocupa menos de 0,1 GB.
- CPU y dispositivos de bajos recursos: el entrenamiento se realizó en Apple Silicon y el propio autor ofrece una demo en navegador, lo que indica viabilidad en CPU, dispositivos móviles y placas tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp (`llama-cli -m tale-q8_0.gguf -p "once upon a time "`), Ollama (`ollama run navthings/tale`), y cualquier servidor compatible con GGUF o con la API de endpoints de Hugging Face. vLLM y TGI no están documentados como soportados para estos artefactos GGUF en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| navthings/tale | 47,4 M | 384 tokens | MIT | GGUF (f16, q8_0) en Hugging Face | Entrenado desde cero sobre TinyStories; solo 2000 pasos |
| roneneldan/TinyStories-33M | 33 M (dato público, no incluido en la información proporcionada) | no disponible | MIT (dato público, no verificado en la información proporcionada) | Pesos en Hugging Face | Referencia de la familia TinyStories, arquitectura GPT-Neo |
| roneneldan/TinyStories-1M | 1 M (dato público, no incluido en la información proporcionada) | no disponible | MIT (dato público, no verificado en la información proporcionada) | Pesos en Hugging Face | Variante mínima de la misma familia |
| karpathy/llama2.c (stories260K) | 0,26 M (dato público, no incluido en la información proporcionada) | no disponible | MIT (dato público, no verificado en la información proporcionada) | Pesos en repositorio GitHub | Modelo de demostración entrenado sobre TinyStories |

Los datos de rendimiento comparativo no están disponibles: no se han publicado benchmarks de tale ni comparaciones directas con estas alternativas en la información proporcionada. La comparación se limita, por tanto, a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Ventana de contexto muy reducida: 384 tokens limitan severamente la coherencia en textos largos, el diálogo multi-turno y cualquier tarea que requiera memoria extensa.
- Modelo infraentrenado: el autor indica explícitamente que la publicación ha completado solo 2000 pasos, por lo que la calidad de generación es probablemente baja y la salida puede degradarse con rapidez.
- Sin ajuste por instrucciones: no es un modelo de chat ni de seguimiento de instrucciones; no debe esperarse que respete formatos, roles o restricciones indicadas en el prompt.
- Dominio restringido: entrenado exclusivamente sobre TinyStories, su vocabulario y su gramática están limitados al registro de cuentos infantiles. Fuera de ese dominio el rendimiento será muy pobre.
- Idioma único: solo inglés. No hay soporte declarado de castellano ni de ningún otro idioma, y es esperable que produzca texto incoherente en ellos.
- Alucinaciones: como cualquier modelo autorregresivo, puede generar contenido factualmente falso o narrativamente inconsistente; al no tener alineación, tampoco hay garantía de que evite contenido inapropiado si se le induce.
- Ausencia de alineación de seguridad: no se documenta ningún proceso de RLHF, DPO ni filtrado de seguridad, por lo que no es adecuado para aplicaciones expuestas a usuarios finales sin una capa de moderación adicional.
- Licencia: el modelo se distribuye bajo MIT, lo que permite uso comercial, modificación y redistribución con atribución de la licencia. No obstante, la licencia del dataset TinyStories no se especifica en la información proporcionada y debería verificarse antes de un uso comercial.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin comunidad ni mantenimiento demostrado más allá del repositorio de código del autor.
- Sin garantías de mantenimiento: las fechas de creación y actualización del repositorio son muy próximas entre sí, lo que sugiere una publicación puntual sin hoja de ruta documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/navthings/tale
- Repositorio de código: https://github.com/navthings/tale
- Playground en navegador: https://navthings.github.io/playground/
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Ejecución con Ollama: `ollama run navthings/tale`
- Ejecución con llama.cpp: `llama-cli -m tale-q8_0.gguf -p "once upon a time "`
