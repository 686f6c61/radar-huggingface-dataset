# mchen04/jev-local-lab-decision-heads

## Resumen

`mchen04/jev-local-lab-decision-heads` es una colección de diez cabeceras de clasificación («decision heads») entrenadas sobre un backbone congelado y sin modificar: el modelo `mlx-community/Qwen2.5-1.5B-Instruct-4bit` en su revisión `8b403126fc14f14cfc99bb4cfa72ecbc129ea677`. No es un modelo generativo: cada cabecera recibe un estado oculto del backbone y un conjunto de etiquetas proporcionado en tiempo de llamada, y devuelve una distribución de probabilidad sobre esas etiquetas. Cada cabecera ocupa entre 0,20 y 1,32 millones de parámetros (0,8–5,3 MB), es decir, entre el 0,01 % y el 0,09 % del backbone. Lo desarrolla Michael Chen como proyecto personal de fin de semana, ejecutado en un Mac mini de 24 GB.

La relevancia de este repositorio no está en su rendimiento, sino en que documenta explícitamente un resultado negativo. Sobre las familias de tareas con las que se entrenaron, las cabeceras superan al «read-out» zero-shot del propio backbone en +14,8 puntos. Sin embargo, sobre un conjunto nuevo de seis familias de tareas nunca vistas, pierden frente a ese mismo zero-shot por 3,25 puntos (McNemar pareado exacto, p = 0,0167), y vuelven a perder en una suite de flujos de trabajo externa. El autor deja constancia de ello en la propia model card y etiqueta el repositorio con `negative-results`.

El repositorio se publica como material reproducible de un experimento, no como artefacto desplegable: el motor que genera los estados ocultos que consumen las cabeceras (`jevlocal`) vive en un checkout privado, no hay repositorio de código público y la licencia es `other` con nombre `all-rights-reserved-side-project`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeceras de clasificación (forma bilineal coseno y variante MLP) sobre backbone transformer congelado Qwen2.5-1.5B-Instruct cuantizado a 4 bits |
| Parametros totales | Backbone: ~1,5 mil millones (congelado, no incluido en el repo); cabeceras: entre 201.218 y 1.315.842 parámetros cada una |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la determina el backbone subyacente |
| Tipos de cuantizacion | Backbone en 4 bits (según `mlx-community/Qwen2.5-1.5B-Instruct-4bit`); las cabeceras se distribuyen en safetensors sin cuantizar (0,8–5,3 MB por cabeza) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other`, con `license_name: all-rights-reserved-side-project` |
| Formato de pesos | `safetensors` (un `head.safetensors` por directorio, más `record.json` con la receta y el sha256) |

## Arquitectura y entrenamiento

Cada cabecera es un módulo pequeño que se acopla a un backbone congelado y sin modificar. La función de scoring es una forma bilineal coseno entre el estado oculto del backbone en la posición de lectura y la media de los embeddings de entrada agrupados (mean-pooled) de cada etiqueta candidata. Esta formulación permite que una misma cabecera funcione con cualquier conjunto de etiquetas sin reentrenamiento, ya que las etiquetas se codifican como embeddings en el momento de la llamada. Existen dos variantes de forma: bilineal (rangos 64 y 256) y MLP (con proyección no lineal).

El entrenamiento es supervisado con entropía cruzada, y algunas variantes incorporan destilación de conocimiento desde un modelo local de mayor tamaño (α = 0,5 y α = 0,9; τ = 2,0 y τ = 4,0). De las diez cabeceras, siete son un barrido de hiperparámetros (rango, forma de la cabeza, peso de destilación) y tres son sondas deliberadas de tareas retenidas (`p3h-holdout`, `p3h-holdout-small`, `p3h-holdout-mixed`), entrenadas dejando fuera ciertas familias de tareas para comprobar si la cabeza generaliza. El resultado es que no generaliza: el autor lo documenta como el hallazgo principal. Las familias de tareas retenidas que se mencionan son `scicite_intent`, `winogrande_coref`, `clinc_intent`, `openbookqa_science` y `ledgar_provision`.

No hay innovaciones de decodificación ni mecanismos de atención alternativos: el interés técnico reside en comprobar cuánta señal puede extraer una cabeza de ~0,8 M de parámetros sobre un modelo cuantizado pequeño, y en la evidencia negativa sobre su transferencia fuera de distribución.

## Capacidades

- Clasificación de texto sobre un conjunto de etiquetas arbitrario, proporcionado en tiempo de llamada, sin reentrenar la cabeza.
- Lectura de decisiones estructuradas a partir de documentos (objetivo declarado del experimento).
- Producción de una distribución de probabilidad sobre las etiquetas candidatas, a partir de un único estado oculto.
- Variantes con destilación de conocimiento desde un modelo local de mayor tamaño (α = 0,5 y 0,9).
- No genera texto: las cabeceras no son modelos de lenguaje y no decodifican secuencias.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo se declara únicamente en inglés.
- Capacidades especiales: ninguna declarada más allá de la variante de forma MLP frente a la bilineal.

## Casos de uso

- Reproducción del experimento: adjuntar una cabeza al backbone congelado, alimentarla con un estado oculto y un conjunto de etiquetas, y obtener una distribución. Es el uso directo declarado por el autor.
- Análisis de la capacidad de aprendizaje de cabeceras pequeñas: estudiar qué pueden y qué no pueden aprender 0,8 M de parámetros bilineales coseno sobre un modelo cuantizado de 1,5 B.
- Verificación de resultados: el repositorio incluye `record.json` con la receta completa, el historial por época, la época seleccionada y el sha256 que deben cumplir los pesos, lo que permite auditar cada cifra publicada.
- Estudio de resultados negativos en transferencia: usar las tres cabeceras de tareas retenidas como caso de referencia sobre cómo se degrada el rendimiento fuera de distribución.
- Comparación de estrategias de entrenamiento: contrastar entropía cruzada pura (`p3h-ce-r256`) frente a destilación con distintos pesos (α = 0,5 y α = 0,9) para observar el efecto en la precisión macro de desarrollo.
- Docencia o divulgación sobre evaluación honesta: la model card separa explícitamente los datos de desarrollo de los de evaluación y etiqueta la `dev3` macro como evidencia de selección, no como afirmación de rendimiento.
- No es adecuado para ningún uso en producción, según la propia declaración del autor.

## Benchmarks y rendimiento

Los únicos datos publicados son la precisión macro por tarea sobre `dev3`, la media sobre las nueve familias de tareas de desarrollo (960 preguntas). El autor advierte que es datos de desarrollo, examinados repetidamente y usados para tomar decisiones de selección, por lo que deben interpretarse como evidencia de selección y no como una afirmación de rendimiento.

| Directorio | Cabeza | Rango | α destilación | τ | Parámetros | Bytes | `dev3` macro |
|---|---|---|---|---|---|---|---|
| `p3h-kd-a05` | bilineal | 256 | 0,5 | 2,0 | 791.042 | 3.164.652 | 0,6885 |
| `p3h-ce-r256` | bilineal | 256 | 0,0 | — | 791.042 | 3.164.652 | 0,6819 |
| `p3h-kd-a05-t4` | bilineal | 256 | 0,5 | 4,0 | 791.042 | 3.164.652 | 0,6812 |
| `p3h-ce-r64` | bilineal | 64 | 0,0 | — | 201.218 | 805.347 | 0,6774 |
| `p3h-ce-mlp` | mlp | 256 | 0,0 | — | 1.315.842 | 5.263.986 | 0,6632 |
| `p3h-kd-mlp-a05` | mlp | 256 | 0,5 | 2,0 | 1.315.842 | 5.263.986 | 0,6583 |
| `p3h-kd-a09` | bilineal | 256 | 0,9 | 2,0 | 791.042 | 3.164.652 | 0,6410 |
| `p3h-holdout-small` | bilineal | 256 | 0,0 | — | 791.042 | 3.164.652 | 0,6712 |
| `p3h-holdout-mixed` | bilineal | 256 | 0,0 | — | 791.042 | 3.164.652 | 0,6170 |
| `p3h-holdout` | bilineal | 256 | 0,0 | — | 791.042 | 3.164.652 | 0,5590 |

Resultados fuera de distribución, tal como los reporta el autor:

| Escenario de evaluación | Resultado frente al read-out zero-shot del mismo backbone |
|---|---|
| Familias de tareas de entrenamiento | +14,8 puntos a favor de las cabeceras |
| Conjunto nuevo de seis familias de tareas nunca vistas | −3,25 puntos (McNemar pareado exacto, p = 0,0167) |
| Suite de flujos de trabajo externa | Derrota de nuevo frente al zero-shot del backbone |

No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible. No se han publicado resultados adicionales en la información proporcionada.

## Requisitos de hardware

- El experimento se desarrolló y ejecutó en un Mac mini con 24 GB de memoria unificada, con el framework MLX.
- El backbone (`Qwen2.5-1.5B-Instruct-4bit`) cabe holgadamente en cualquier GPU de consumo actual e incluso en memoria unificada de Apple Silicon; las cabeceras añaden entre 0,8 y 5,3 MB por unidad, un coste despreciable.
- VRAM estimada para inferencia: no disponible en la información proporcionada de forma explícita; el backbone en 4 bits y las cabeceras de menos de 5,3 MB implican unos requisitos muy bajos, compatibles con hardware de gama de entrada.
- GPU recomendadas: no disponible. El stack declarado es MLX sobre Apple Silicon, no CUDA.
- Cabe en GPU de consumo: el backbone cuantizado a 4 bits es de 1,5 B de parámetros, por lo que sí es previsible que quepa en GPUs de consumo, aunque el autor no publica cifras concretas.
- Opciones de despliegue: MLX (librería declarada en el repositorio) sobre Apple Silicon. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; además, el motor `jevlocal` que produce los estados ocultos es privado, por lo que no existe un camino de despliegue llave en mano.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El único punto de comparación documentado en la información proporcionada es el propio backbone sin cabecera, evaluado en modo zero-shot.

| Alternativa | Parámetros añadidos | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Estas cabeceras de decisión | 0,20–1,32 M por cabeza | No disponible | +14,8 puntos en tareas vistas; −3,25 puntos en tareas nuevas; derrota en suite externa | `all-rights-reserved-side-project` | Pesos publicados en HuggingFace; motor subyacente privado |
| Read-out zero-shot de `Qwen2.5-1.5B-Instruct-4bit` | 0 | No disponible | Referencia base; supera a las cabeceras en todo lo no visto | Apache-2.0 (modelo base) | Público en HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el trabajo **no está listo para producción**.
- No es una reproducción de ningún producto comercial y no alcanza la paridad con las cifras publicadas de «Jev» con las que se comparaba.
- El modelo pierde frente al read-out zero-shot del propio backbone en familias de tareas no vistas (−3,25 puntos, p = 0,0167) y en una suite de flujos de trabajo externa.
- No se ha realizado ninguna evaluación de seguridad, de equidad (fairness) ni de robustez.
- La model card indica que el modelo está fuera de alcance para «cualquier cosa real».
- Idiomas: únicamente inglés; no hay soporte multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo (las cabeceras no generan texto), pero sí existe el riesgo de asignar etiquetas con confianza alta a entradas fuera de la distribución de entrenamiento.
- Restricciones de licencia: licencia `other` con nombre `all-rights-reserved-side-project`; el uso comercial está restringido por defecto. El modelo base sí es Apache-2.0, pero eso no se extiende a las cabeceras.
- La `dev3` macro procede de datos de desarrollo usados repetidamente para selección, por lo que no debe citarse como rendimiento esperado.
- Dependencia no resuelta: el motor `jevlocal` que produce los estados ocultos que consumen las cabeceras vive en un checkout local privado, de modo que no hay un camino de uso llave en mano ni repositorio de código público.
- El repositorio tiene 0 descargas y 0 «likes», y un tamaño declarado de 0,0 GB, coherente con artefactos de muy pequeño tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mchen04/jev-local-lab-decision-heads
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-1.5B-Instruct-4bit
- Repositorio de código: no disponible (el autor indica que el motor `jevlocal` reside en un checkout local privado).
- Paper: no disponible.
- Blog o demo: no disponible.
- Búsqueda web: no se han encontrado enlaces relevantes al modelo en los resultados de búsqueda proporcionados; los resultados devueltos corresponden a páginas de soporte de Microsoft y no guardan relación con este repositorio.
