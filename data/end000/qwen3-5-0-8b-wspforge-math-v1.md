# end000/Qwen3.5-0.8B-WSPForge-Math-v1

## Resumen

Qwen3.5-0.8B-WSPForge-Math-v1 es una especialización matemática experimental del modelo Qwen3.5-0.8B, publicada por el usuario end000 en HuggingFace. No se trata de un fine-tuning convencional: el autor aplica una técnica denominada Weight-Space Programming (WSP), que modifica directamente los pesos del checkpoint original sin descenso de gradiente, sin retropropagación y sin entrenamiento adicional. El resultado es un checkpoint completo y autónomo que preserva arquitectura, tokenizador y plantilla de chat del modelo base, pero con una intervención quirúrgica sobre dos matrices concretas.

El modelo resuelve un problema acotado: mejorar el razonamiento matemático de un modelo pequeño (873.438.784 parámetros almacenados) mediante una corrección de rango uno enmascarada sobre las proyecciones `down_proj` de las capas 15 y 19 del transformer. La intervención afecta únicamente a 130.317 valores de parámetro de un total de 873.438.784, es decir, un 0,0149 % del total almacenado. El resto de los 488 tensores permanece idéntico al checkpoint original.

Su relevancia es metodológica más que de rendimiento: demuestra que ediciones de pesos extremadamente localizadas pueden producir mejoras medibles en una cohorte de evaluación controlada (de 13/128 a 50/128 respuestas correctas en una mezcla de problemas GSM8K y MATH), aunque la evaluación independiente en código no confirma mejoras e incluso sugiere un ligero retroceso. Es, por tanto, un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, con módulo de lenguaje `model.language_model`) |
| Parámetros totales | 873.438.784 almacenados (752.393.024 en el módulo de lenguaje) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada; pesos publicados en BF16 |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B base: un transformer denso con módulo de lenguaje identificado como `model.language_model`, que incluye capas con bloques MLP dotados de proyecciones `down_proj`. No hay datos publicados sobre el número de tokens de entrenamiento del modelo original ni sobre la composición de su dataset, y esta ficha no los inventa.

La innovación técnica no reside en el entrenamiento sino en la intervención sobre pesos. El autor estimó direcciones de activación a partir de ocho trayectorias de descubrimiento, contrastando estados tempranos con estados tardíos repetitivos. Las mediciones de activación usaron contextos sustitutos emparejados de 1.024 tokens (un prefijo compartido de 512 tokens y un segmento variable de 512 tokens), promediando los últimos 128 tokens. Con la dirección normalizada `u`, una copia de trabajo FP32 de la matriz original `W` y una máscara que selecciona 64 columnas de entrada del MLP, la intervención aplicada es:

```text
coefficients = u @ W
coefficients[unselected_columns] = 0
edited = BF16(W - 6 * outer(u, coefficients))
```

La corrección se serializa en BF16 y se aplica con fuerza de intervención 6. Tras el redondeo, difieren 65.064 valores en la capa 15 y 65.253 en la capa 19. El autor publica además un parche disperso en bits BF16 que reconstruye el archivo Safetensors evaluado con el mismo SHA-256, lo que permite verificar la reproducibilidad del artefacto final. La reestimación de las direcciones desde las trayectorias de descubrimiento es un paso de reproducción distinto que el autor distingue explícitamente.

## Capacidades

- Generación de texto conversacional y razonamiento matemático de ámbito escolar y de competición (GSM8K, MATH).
- Modo de razonamiento extendido (*thinking*) heredado del modelo base, con generación de cadenas de razonamiento largas.
- Capacidad declarada de procesamiento imagen-texto según la etiqueta `image-text-to-text` del repositorio, aunque no se detallan en la model card las capacidades de visión efectivas.
- Soporte multilingüe limitado a inglés y ruso según los metadatos del modelo.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte específico de agentes o razonamiento multi-paso más allá del modo thinking.
- No se documentan capacidades de audio.

## Casos de uso

- Investigación sobre edición de pesos: el modelo sirve como caso de estudio reproducible para validar técnicas de Weight-Space Programming, ya que el autor publica direcciones, columnas seleccionadas y un parche que reconstruye el artefacto byte a byte.
- Evaluación de métodos de especialización sin gradientes: útil para comparar WSP frente a fine-tuning tradicional (LoRA, SFT completo) en presupuestos de cómputo mínimos, dado que la intervención toca menos del 0,02 % de los parámetros.
- Docencia y divulgación sobre interpretabilidad: permite ilustrar cómo una corrección de rango uno sobre columnas concretas de un MLP altera el comportamiento generativo, con métricas de repetición y longitud de respuesta documentadas.
- Prototipado de asistentes matemáticos en inglés o ruso: para entornos de baja exigencia donde un modelo de menos de 1.000 millones de parámetros sea suficiente y se acepte el riesgo de alucinación.
- Reproducción de experimentos: el parche BF16 y los SHA-256 permiten verificar pipelines de reconstrucción de checkpoints en entornos de investigación.
- Análisis de regresiones cruzadas de dominio: el modelo documenta un retroceso en código (de 55/144 a 48/144 en HumanEval/MBPP), lo que lo hace útil para estudiar cómo una especialización matemática afecta negativamente a otras capacidades.

## Benchmarks y rendimiento

| Métrica | Original | Sol014 (este modelo) |
|---|---:|---:|
| Respuestas finales correctas (cohorte 128 problemas) | 13/128 (10,16 %) | 50/128 (39,06 %) |
| Subconjunto GSM8K (práctica) | 9/64 | 32/64 |
| Subconjunto MATH (práctica) | 4/64 | 18/64 |
| Respuestas que alcanzan el límite de tokens | 116/128 | 71/128 |
| Heurística de final repetitivo | 107/128 | 52/128 |
| Media de tokens generados | 30.163,55 | 24.922,02 |
| HumanEval/MBPP (48 tareas, 3 semillas) | 55/144 (38,19 %) | 48/144 (33,33 %) |

La ganancia emparejada en matemáticas fue de 28,91 puntos porcentuales, con intervalo de confianza bootstrap del 95 % de [20,31; 37,50]. Hubo 39 respuestas corregidas y 2 previamente correctas que se perdieron. En código, el intervalo de confianza del 95 % para la diferencia fue [−11,11; +1,39] puntos porcentuales, por lo que no se sostiene una mejora en programación. El autor advierte explícitamente de que estos resultados no son MATH-500 ni el test oficial de GSM8K, y que las tareas de práctica podrían haber aparecido en el preentrenamiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe holgadamente en GPU consumer, incluidas tarjetas de gama media y algunas integradas con memoria unificada.
- Opciones de despliegue: `transformers` (librería declarada), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF, aunque el autor no publica artefactos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El modo thinking con hasta 32.768 tokens de salida puede elevar mucho la latencia en problemas complejos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-WSPForge-Math-v1 | 873.438.784 | No disponible | Apache 2.0 | Edición de pesos WSP, especialización matemática | HuggingFace |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | Apache 2.0 | Modelo generalista original | HuggingFace |
| Fine-tunes matemáticos de ~1B (genéricos) | ~1B | Variable | Variable | SFT/LoRA sobre datos matemáticos | HuggingFace |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no se ofrece una comparación numérica de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal y no lo presenta como listo para producción.
- La evaluación se realizó sobre una cohorte de práctica de 128 problemas que podría solaparse con datos de preentrenamiento; no es un benchmark secreto ni oficial.
- No se confirma mejora en código: la estimación puntual es negativa y el intervalo de confianza incluye cero.
- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base, arrastra los sesgos de este.
- Riesgo de alucinación: alto en un modelo de este tamaño, especialmente en razonamiento matemático de varios pasos; el autor no verifica formalmente los pasos intermedios, solo la equivalencia de la respuesta final con `math-verify`.
- El modo thinking puede generar hasta 32.768 tokens; en la cohorte original, 116 de 128 respuestas alcanzaron el límite de tokens antes de la intervención, lo que indica tendencia a la verbosidad y a finales repetitivos.
- Idiomas limitados a inglés y ruso; no se garantiza un rendimiento adecuado en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el carácter experimental y la falta de validación en producción desaconsejan su despliegue sin evaluación propia.
- La reproducibilidad completa requiere reestimar las direcciones desde las trayectorias de descubrimiento, un paso que el autor distingue de la mera reconstrucción del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/end000/Qwen3.5-0.8B-WSPForge-Math-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Investigación original sobre Weight-Space Programming: https://rikiyat.github.io/blog/weight-space-programming/
- Registros del experimento: https://github.com/RikiyaT/lm_understand-logs/tree/main/exp8_math
