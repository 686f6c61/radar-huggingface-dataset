# leslie721007/babylm-strict-small-coherent86-alpha075

## Resumen

El modelo `leslie721007/babylm-strict-small-coherent86-alpha075` es un modelo de lenguaje enmascarado (masked language modeling) desarrollado por leslie721007 como parte de la competición BabyLM 2026, en la pista Strict-Small. Se basa en la arquitectura DebertaV2, pero incorpora una modificación privada: una vía lenta congelada (slow path) y una vía rápida privada (fast path) con un adaptador de escala 0,75. El modelo está diseñado para estudiar la eficiencia del preentrenamiento con datos limitados, ya que se entrena con una exposición total de aproximadamente 86 millones de palabras, muy por debajo de los corpus habituales.

El modelo tiene 36,4 millones de parámetros en total, de los cuales 35,4 millones corresponden a la vía lenta congelada y 995.584 a la vía rápida privada. Requiere `trust_remote_code=True` para cargar la función exacta, ya que sin esta opción se instancia un DebertaV2ForMaskedLM nativo con menos parámetros. Este repositorio es un candidato a endpoint local, no un paquete de sumisión completo, y no debe usarse como sustituto de la versión final verificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DebertaV2 con adaptador privado (clase `FrozenSlowPrivateDebertaV2ForMaskedLM`) |
| Parametros totales | 36.458.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura DebertaV2 con una modificación privada: una vía lenta congelada (35.463.008 parámetros) y una vía rápida privada (995.584 parámetros) controlada por un adaptador con escala 0,75. Esta configuración se describe como una "redistribución de competencia impulsada por amplitud" en lugar de un mecanismo de aprendizaje lento-rápido establecido, según el análisis de la sesión. El entrenamiento se realizó con datos de BabyLM Strict-Small, con una exposición total de 86.005.295 palabras contadas, de las cuales 82.012.495 corresponden al anclaje lento y 3.992.800 al sufijo coherente privado. No se proporcionan detalles sobre el número de tokens, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Modelo de lenguaje enmascarado (fill-mask): predice tokens enmascarados en secuencias de texto.
- Competencia lingüística evaluada en múltiples benchmarks: BLiMP (68,51), Supplement (63,64), EWoK (50,02), Entity (28,32), COMPS (52,05), GlobalPIQA (38,565), Reading (8,165) y SuperGLUE (69,82).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Soporte multilingüe limitado al inglés, según la etiqueta de idioma.

## Casos de uso

- Investigación en eficiencia de preentrenamiento: permite estudiar cómo un modelo pequeño (36M parámetros) aprende con un corpus reducido de 86M palabras, útil para comparar estrategias de muestreo y arquitecturas.
- Evaluación de competencia lingüística temprana: sus puntuaciones en BLiMP, SuperGLUE y otras pruebas permiten analizar qué habilidades gramaticales y semánticas emergen con datos limitados.
- Análisis de mecanismos de adaptación lento-rápido: la configuración con vía congelada y vía rápida privada sirve para investigar si la redistribución de competencia por amplitud es un fenómeno generalizable.
- Desarrollo de modelos de referencia para BabyLM: puede usarse como punto de comparación para otros participantes de la pista Strict-Small, aunque no es una sumisión oficial.
- Pruebas de diagnóstico de sesgos y alucinaciones: al ser un modelo pequeño y con datos restringidos, es útil para estudiar qué sesgos introduce el corpus BabyLM y cómo afectan a la generación.
- Verificación de reproducibilidad: el repositorio incluye hashes SHA256 de los pesos y configuración, lo que permite verificar la integridad del modelo en entornos de investigación.

## Benchmarks y rendimiento

La model card proporciona puntuaciones medidas en ocho columnas oficiales compatibles:

| Columna medida | Puntuación |
|---|---|
| BLiMP | 68,51 |
| Supplement | 63,64 |
| EWoK | 50,02 |
| Entity | 28,32 |
| COMPS | 52,05 |
| GlobalPIQA | 38,565 |
| Reading | 8,165 |
| SuperGLUE | 69,8192223897 |

El promedio de las siete columnas no-SuperGLUE (Cheap7) es 44,181428571429. El valor aritmético provisional con AoA=0 es 42,121024709967. El fallback público protegido (chck_82M) muestra 41,94, por lo que este endpoint es ligeramente superior en la métrica aritmética, aunque no se dispone de comparaciones con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada: con 36,4M parámetros, en FP32 ocupa aproximadamente 146 MB; en FP16 unos 73 MB. Cabe en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 o superior) e incluso en CPU.
- GPU recomendadas: no se requiere hardware especializado; cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia.
- Compatibilidad con consumer GPU: sí, es un modelo muy ligero.
- Opciones de despliegue: se puede cargar con Transformers usando `trust_remote_code=True`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño se espera una inferencia rápida en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tamaño similar, misma tarea o misma competición). La model card solo menciona el fallback `chck_82M` con una puntuación de 41,94, pero no se proporcionan detalles de su arquitectura o parámetros. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No es un paquete de sumisión completo de BabyLM; falta el material de AoA y fast-checkpoint, por lo que no debe usarse como sustituto de la versión final verificada.
- Requiere `trust_remote_code=True` para cargar la función exacta; sin esta opción, se instancia un modelo nativo con menos parámetros y comportamiento diferente.
- La licencia es "other" y no se especifican términos concretos; se recomienda contactar al autor antes de un uso comercial.
- El análisis de la sesión interpreta la familia de escala privada como una redistribución de competencia impulsada por amplitud, no como un mecanismo de aprendizaje lento-rápido establecido, lo que limita su validez como evidencia de un fenómeno general.
- Al ser un modelo pequeño entrenado con un corpus reducido, es probable que presente alucinaciones y sesgos derivados de los datos de BabyLM, que no son representativos del lenguaje general.
- La longitud de contexto no está documentada, por lo que se desconoce el límite de tokens de entrada.
- No se han publicado resultados de benchmarks en la información disponible más allá de las puntuaciones locales de la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leslie721007/babylm-strict-small-coherent86-alpha075
- Página oficial de BabyLM: https://babylm.github.io/
- Dataset BabyLM 2026 Strict-Small: https://huggingface.co/datasets/BabyLM-community/BabyLM-2026-Strict-Small
- Repositorio de evaluación de BabyLM: https://github.com/babylm-org/babylm-eval/tree/main/strict
