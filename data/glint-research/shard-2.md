# Glint-Research/Shard-2

## Resumen

Shard-2 es un modelo de lenguaje de 49,4 millones de parámetros desarrollado por Glint-Research que introduce un mecanismo poco habitual: un token especial de borrado (`<bs>`, id 4096) que el modelo emite para retractarse del token inmediatamente anterior. El texto retractado permanece en el contexto que el modelo lee, pero no en la salida visible, de modo que el modelo puede examinar un intento abandonado y probar otra cosa. Se publica bajo licencia MIT junto con su modelo base (`Base50M`), entrenado sobre 50.000 millones de tokens de RedPajama v2.

La arquitectura es un transformer decoder de 20 capas con 8 cabezas de 64 dimensiones, atención de ventana deslizante de 256 tokens y una capa global sin posición cada seis capas. El vocabulario es de 4097 entradas (4096 BPE más el token de borrado) y el contexto declarado es de 8192 tokens, aunque el entrenamiento se realizó a 4096. El fichero de pesos ocupa 198 MB.

Su relevancia es experimental: explora la auto-corrección explícita en modelos pequeños mediante entrenamiento de reparación en tres rondas, y cuantifica el coste en capacidad base que impone esa habilidad. No es un modelo orientado a producción, sino una prueba de concepto reproducible con código de inferencia autocontenido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder, 20 capas, 8 cabezas de 64 dimensiones, atención de ventana deslizante de 256 con capa global sin posición cada 6 capas |
| Parametros totales | 49.409.537 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 (entrenado a 4096) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,2 GB; el modelo base se publica como `Base50M`) |

## Arquitectura y entrenamiento

El modelo parte de un base de 49,4M de parámetros entrenado con 50.000 millones de tokens de RedPajama v2. Sobre ese base se añade el token de borrado mediante tres rondas de entrenamiento de reparación. El corpus de reparación se construye contra los propios errores del modelo: en cada posición se toma la siguiente elección de token con teacher forcing y, cuando difiere del token del corpus, se inserta esa elección errónea en la secuencia seguida de `<bs>` y después el token real. Los tokens erróneos insertados se enmascaran en la pérdida, de modo que actúan solo como contexto.

La innovación principal es ese token de borrado con id 4096, fuera del vocabulario BPE. La tasa de borrado medida es del 5,4 % de tokens emitidos con temperatura 0,9 y top-k 100, y del 12,5 % con temperatura 1,0 sin filtro top-k. Las eliminaciones se disparan tras tokens que el modelo consideró improbables, por lo que los ajustes del sampler condicionan el comportamiento: con top-k 40 y temperatura 0,8 apenas se producen. Los valores por defecto de `infer.py` están situados donde el comportamiento es activo.

## Capacidades

- Generación de texto autoregresiva en inglés, con vocabulario BPE de 4096 entradas.
- Auto-retractación: emisión de `<bs>` para eliminar el token anterior de la salida visible, manteniéndolo en el contexto interno.
- Reparación de frases a alta temperatura: con temperatura 1,0 sin top-k puede retractar fragmentos completos y reintentar.
- Inferencia con API programática: `Writer.generate`, `visible`, `raw` y `deletions` devuelven el flujo con y sin borrados aplicados.
- Protección del prompt: el argumento `protected` impide que un borrado al inicio de turno alcance el texto del prompt.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no documentada.

## Casos de uso

- Investigación sobre auto-corrección en SLM: servir de banco de pruebas reproducible para estudiar si la retractación explícita mejora la calidad del texto final, con métricas ya definidas en la model card (ganancia del juez por token).
- Estudio del coste de capacidades adicionales: comparar `Base50M` con Shard-2 en perplejidad y benchmarks permite aislar cuánto rendimiento base se sacrifica al añadir un token y un régimen de entrenamiento nuevos.
- Experimentos de decodificación controlada: al variar temperatura y top-k se modula directamente la tasa de borrado (5,4 % frente a 12,5 %), lo que permite estudiar la relación entre entropía del sampler y comportamiento de reparación.
- Generación creativa exploratoria con trazabilidad: el flujo `raw` muestra los intentos descartados entre corchetes, útil para analizar cómo el modelo llega a una formulación final.
- Docencia y divulgación: un modelo de 198 MB con inferencia autocontenida en un único `infer.py` que solo requiere `torch` y `tokenizers` permite demostrar mecánicas de atención deslizante y tokens especiales sin infraestructura pesada.
- Evaluación de pipelines de post-proceso: implementar y validar funciones de aplicación de borrados (`visible_tokens`) sobre flujos con retractaciones antes de trasladar la idea a modelos mayores.

## Benchmarks y rendimiento

Resultados de `bench_one.py` del repositorio MythosMini, batch 64, frente al modelo base del que se entrenó.

| Metrica | Base50M | Shard-2 |
|---|---|---|
| Perplejidad de bytes en wiki | 2,182 | 2,403 |
| BLiMP | 80,37 | 79,19 |
| ARC-Easy | 39,60 / 41,40 | 37,60 / 39,00 |
| ARC-Challenge | 18,80 / 21,00 | 18,40 / 22,80 |
| HellaSwag (acc_norm) | 39,40 | 38,40 |
| PIQA (acc_norm) | 57,40 | 56,20 |
| Overall | 72,37 | 70,74 |

Evaluación de la utilidad de los borrados, con el modelo base como juez y restringiendo la comparación a los tokens presentes en ambas versiones del flujo:

| Decoder | Tasa de borrado | Generaciones con borrados | Ganancia del juez por token | Mejoradas |
|---|---|---|---|---|
| Temperatura 1,0, sin top-k | 12,50 % | 14 de 14 | +0,5447 | 14 de 14 |
| Temperatura 0,9, top-k 100 | 5,36 % | 12 de 14 | +0,3854 | 10 de 12 |

Las rondas anteriores de la misma receta obtuvieron +0,2002 y +0,3048 sobre los mismos prompts. Enmascarar la columna del token de borrado al puntuar el mismo texto wiki da 2,318 en lugar de 2,403, lo que recupera aproximadamente un tercio de la brecha. Un modelo base con una fila de borrado inicializada a la media y sin entrenar obtiene 2,182, 80,37 y 39,60, idénticos al base: el coste proviene del entrenamiento de reparación, no del token adicional.

## Requisitos de hardware

- Inferencia en CPU viable: 49,4M de parámetros y un fichero de 198 MB caben holgadamente en memoria RAM convencional.
- VRAM estimada: por debajo de 1 GB en fp32 para pesos y estados de inferencia; no se han publicado mediciones.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; no se han publicado pruebas en A100, H100 o RTX 4090.
- Despliegue: el repositorio proporciona `infer.py`, que importa `torch` y `tokenizers` y lleva su propia copia de la arquitectura, leyendo la forma desde `config.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rasgo diferencial |
|---|---|---|---|---|
| Shard-2 | 49,4M | 8192 (entrenado a 4096) | MIT | Token de borrado `<bs>` con entrenamiento de reparación en tres rondas |
| Base50M (Glint-Research) | 49,4M | no disponible | MIT | Modelo base sin token de borrado; mejor puntuación global (72,37 frente a 70,74) |
| Alternativas de ~50M de parámetros | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El modelo sacrifica capacidad base: la puntuación global cae de 72,37 a 70,74 y la perplejidad wiki empeora de 2,182 a 2,403.
- Los benchmarks de verosimilitud no se benefician del token de borrado, ya que el modelo no genera durante su evaluación, pero la probabilidad reservada a ese token sí penaliza la puntuación.
- La tasa de borrado depende fuertemente del sampler: con top-k 40 y temperatura 0,8 el comportamiento prácticamente desaparece, lo que puede producir resultados inconsistentes si no se replican los ajustes por defecto.
- A temperatura 1,0 sin top-k los borrados se alargan y pueden retractar frases enteras, con el riesgo de producir texto incoherente o fragmentado.
- El contexto declarado es de 8192 tokens, pero el entrenamiento se realizó a 4096, por lo que el rendimiento más allá de esa longitud no está validado.
- No hay información sobre idiomas soportados, sesgos conocidos ni evaluación de alucinación; el tamaño del modelo limita intrínsecamente su fiabilidad factual.
- El modelo es una prueba de concepto de investigación; no se documentan cuantizaciones, formatos GGUF ni integraciones con frameworks de despliegue en producción.
- La licencia MIT permite uso comercial, pero no se ofrece ninguna garantía de calidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Glint-Research/Shard-2
- Repositorio MythosMini (origen de `bench_one.py`): no disponible como URL en la información proporcionada
- Paper o blog técnico: no disponible
- Demo: no disponible
