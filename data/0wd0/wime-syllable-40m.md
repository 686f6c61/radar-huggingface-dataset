# 0WD0/wime-syllable-40m

## Resumen

wime-syllable-40m es un modelo neuronal de decodificación de sílabas para un método de entrada de chino (IME) de doble pinyin, desarrollado por el autor 0WD0 como componente del proyecto wime, un IME para Emacs. Dado el texto previo al cursor y las sílabas tecleadas, el modelo asigna una puntuación a un carácter chino por sílaba; wime fusiona estas puntuaciones con las de Qwen3.5-2B-Base para decodificar frases completas en una GPU local.

El modelo resuelve un problema acotado y específico: convertir secuencias de pinyin (inicial, final y tono opcional) en caracteres chinos candidatos, manteniendo coherencia con el contexto previo. Su interés radica en que separa la tarea lingüística de bajo nivel (sílaba a carácter) de la desambiguación de alto nivel delegada a un modelo de lenguaje mayor, lo que permite un decodificador híbrido ligero y ejecutable en hardware de consumo.

Con 40.005.952 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado exclusivamente al chino simplificado. Emplea una arquitectura de transductor con red de caracteres causal, codificador bidireccional de sílabas y atención cruzada, y se distribuye en FP16 bajo licencia CC-BY-SA-4.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor: red de caracteres causal (8 capas, 448 de ancho) + codificador bidireccional de sílabas (6 capas, 384 de ancho) + atención cruzada y cabeza conjunta |
| Parametros totales | 40.005.952 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 64 caracteres de contexto izquierdo |
| Tipos de cuantizacion | no disponible (el peso publicado es FP16) |
| Idiomas soportados | chino (simplificado) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (FP16, formato `wime-syllable-transducer-v1`) |

## Arquitectura y entrenamiento

El modelo es un transductor específico para IME. Una red de caracteres causal de 8 capas y 448 unidades de ancho procesa el contexto izquierdo y los caracteres ya emitidos; un codificador bidireccional de 6 capas y 384 unidades procesa las sílabas de entrada. Las 4 capas superiores de la red de caracteres atienden al codificador mediante atención cruzada, y una cabeza conjunta puntúa el carácter de cada sílaba a través del embedding de caracteres compartido (tied). La entrada acepta hasta 64 caracteres de contexto y cada sílaba como inicial, final y tono opcional, de modo que las entradas sin tono, con tono y parcialmente tecleadas comparten un único modelo. Los códigos auxiliares de forma no son entrada del modelo: wime los aplica, junto con los tonos tecleados, como restricciones en su búsqueda. El vocabulario tiene 13.254 tokens, de los cuales 12.408 son caracteres chinos.

La red de caracteres parte de un modelo de lenguaje de caracteres preentrenado con la parte china de C4 y con LCCC, que wime ajustó sobre entrada condicionada por pinyin; el codificador, la atención cruzada y la cabeza conjunta son nuevos. El entrenamiento consistió en 16.000 pasos de 256 estados (frases completas, prefijos y continuaciones tras un commit) sobre 1,32 millones de frases, con eliminación aleatoria de tonos para que teclearlos sea opcional. Las fuentes de datos incluyen C4 (parte china), LCCC, CHID, WildChat-1M, Wikipedia china, Fineweb-Edu-Chinese-V2.1, partes de MNBVC (Zhihu, foro, wiki y noticias) y documentación técnica (Python, Kubernetes, OpenHarmony, React, Vue, MDN, Apache Doris, PaddlePaddle, TRPL, Rust by Example y RIME). Las lecturas pinyin de los datos de entrenamiento son automáticas (basadas en G2PW), no revisadas manualmente.

## Capacidades

- Puntuación de caracteres chinos condicionada por pinyin: asigna una puntuación a un carácter por sílaba a partir del contexto y de la entrada tecleada.
- Manejo de entrada parcial: inicial, final y tono son opcionales e independientes, por lo que admite entrada sin tono, con tono y a medio teclear con el mismo modelo.
- Independencia de distribución de teclado: el modelo sirve para las distribuciones de doble pinyin Microsoft, Xiaohe, Sogou y Ziranma, ya que la base de datos de palabras de wime registra qué inicial y final corresponde a cada par de teclas (solo se evaluó Microsoft).
- Integración en un decodificador híbrido: se fusiona con Qwen3.5-2B-Base (peso 1,5, haz de 32) para decodificar frases completas.
- Contexto izquierdo de hasta 64 caracteres para mantener coherencia con el texto ya escrito.
- Vocabulario de 13.254 tokens, con 12.408 caracteres chinos.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento; es un componente especializado de IME.

## Casos de uso

- Método de entrada de chino en Emacs: integrado en wime mediante el flujo de decodificación neuronal (神经解码) del README del proyecto, que descarga el modelo en `~/.local/share/wime/wime-syllable-40m/` y lo carga con `neural/transducer.py` y `neural/charlm.py`.
- Decodificación de frases completas en GPU local: combinado con Qwen3.5-2B-Base para producir el primer candidato de una frase tecleada en doble pinyin, apto para equipos con GPU de consumo gracias al tamaño reducido de ambos componentes.
- Entrada sin tonos: para usuarios que teclean doble pinyin sin tonos, el modelo puntúa candidatos con la misma calidad que con tonos en la mayoría de casos (véase la tabla de evaluación).
- Soporte de entrada con tonos: cuando el usuario teclea el tono, este se aplica como restricción en la búsqueda, lo que mejora la precisión (196 de 208 frases en el conjunto reservado con todos los tonos).
- Adaptación a distintas distribuciones de doble pinyin: un mismo modelo sirve para usuarios de Microsoft, Xiaohe, Sogou y Ziranma, lo que simplifica el mantenimiento de un IME multiplataforma.
- Investigación en IME neuronal: como componente reproducible (pesos FP16 con sha256 publicado) para estudiar decodificación híbrida entre un transductor pequeño y un modelo de lenguaje, o para experimentar con restricciones de búsqueda y contextos de 64 caracteres.

## Benchmarks y rendimiento

Precisión de frase del decodificador completo de wime (este modelo más Qwen3.5-2B-Base con peso 1,5 y haz de 32), doble pinyin Microsoft sin tonos, cada frase tecleada tras su contexto izquierdo real. Un caso cuenta cuando el primer candidato coincide con la referencia o con una variante aceptada; se excluyen los casos que requieren conocimiento no aportado por el contexto (nombres raros, jerga local).

| Conjunto | Frases | Este modelo | Modelo anterior de 25M de wime |
|---|---|---|---|
| Desarrollo (usado para elegir el modelo) | 759 | 703 | 693 |
| Reservado, evaluado una vez tras la elección | 208 | 184 | 179 |
| Reservado, con todos los tonos tecleados | 208 | 196 | — |

En el conjunto reservado, el intervalo de confianza pareado del 95 % para la diferencia es de −2 a +13 frases. Las referencias y sus fronteras fueron revisadas por un agente de IA, no por personas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 40,0M de parámetros en FP16, los pesos ocupan aproximadamente 80 MB, a los que se suman los de Qwen3.5-2B-Base en el decodificador completo.
- GPU recomendadas: no disponible; el autor indica que el decodificador completo se ejecuta en una GPU local.
- GPU de consumo: por el tamaño del modelo, es previsible que quepa en GPU de consumo, pero no se han publicado requisitos mínimos concretos.
- Opciones de despliegue: carga mediante los módulos `neural/transducer.py` y `neural/charlm.py` del repositorio de wime; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (reservado, sin tonos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wime-syllable-40m | 40,0M | 64 caracteres | 184/208 frases | CC-BY-SA-4.0 | Hugging Face, integrado en wime |
| Modelo anterior de wime (25M) | 25M | no disponible | 179/208 frases | no disponible | integrado en wime |
| Qwen3.5-2B-Base | 2B (aproximado, no confirmado) | no disponible | no disponible como IME aislado | no disponible | Hugging Face; se usa como componente del decodificador |

No se dispone de datos de otros modelos de IME comparables en la información proporcionada.

## Limitaciones y advertencias

- Los caracteres fuera de los 12.408 que conoce reciben una probabilidad casi nula, por lo que el decodificador no puede producirlos; wime aún los ofrece desde su retículo de diccionario.
- Entrenado y evaluado únicamente con chino simplificado.
- Las lecturas pinyin de los datos de entrenamiento son automáticas (basadas en G2PW), no verificadas manualmente, lo que puede introducir errores en la señal de entrenamiento.
- La evaluación se hizo solo con la distribución Microsoft de doble pinyin; las demás distribuciones (Xiaohe, Sogou, Ziranma) no se evaluaron.
- Las referencias y fronteras de los conjuntos de evaluación fueron revisadas por un agente de IA, no por personas, lo que limita la fiabilidad de las cifras.
- El intervalo de confianza pareado del 95 % de la diferencia frente al modelo de 25M incluye el cero (−2 a +13 frases), por lo que la mejora no es concluyente estadísticamente.
- Licencia CC-BY-SA-4.0, la más restrictiva de las fuentes de datos; conviene revisar los términos upstream (por ejemplo, Fineweb-Edu-Chinese-V2.1 exige también la OpenCSG Community License y MNBVC arrastra los términos de origen) antes de un uso comercial.
- No es un modelo de propósito general: no genera texto libre, no hace tool calling ni razonamiento; su uso está acoplado al flujo de decodificación de wime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0WD0/wime-syllable-40m
- Repositorio de wime: https://github.com/0WD0/wime
- Qwen3.5-2B-Base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
