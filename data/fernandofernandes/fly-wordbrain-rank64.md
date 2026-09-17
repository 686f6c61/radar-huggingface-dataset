# fernandofernandes/fly-wordbrain-rank64

## Resumen

Fly Wordbrain — rank 64 es un modelo de generación de texto de 3.956.469 parámetros desarrollado por el usuario fernandofernandes, cuya capa recurrente es el cableado sináptico medido de un cerebro de mosca de la fruta (Drosophila melanogaster): 49.393 neuronas y 9.050.172 sinapsis reales. Es una reproducción de la arquitectura del modelo ngxson Fly LLM en la que se sustituye la matriz de salida de rango completo por una factorización de bajo rango (49.393 → 64 → 1.024), reduciendo el recuento total de parámetros en un factor de 13,3× respecto al modelo de referencia de 52.756.661 parámetros.

El modelo no modifica ningún peso sináptico: el grafo conectómico queda congelado y lo único que se entrena son las dinámicas por neurona (ganancia, ganancia recurrente y sesgo) y las dos interfaces de entrada y salida. Sobre una población de validación de 200 relatos nuevos de TinyStories (45.059 objetivos de siguiente token), alcanza una entropía cruzada de 3,2725 y un Top-1 del 33,50%, frente a 3,9882 y 31,38% del modelo de referencia, con un intervalo de confianza del 95% para la mejora de entropía cruzada de [−0,746, −0,686].

Su relevancia es fundamentalmente experimental: sirve como banco de pruebas reproducible para estudiar si la topología de un conectoma biológico aporta alguna ventaja como inductivo previo en una tarea de lenguaje, y para analizar sobreajuste en la capa de lectura. El propio autor advierte de que la comparación contra la referencia no está controlada y de que no se han ejecutado los controles necesarios (grafos aleatorizados y grafos con cero aristas) para atribuir mérito alguno a la anatomía de la mosca. El modelo no es fluido y está entrenado exclusivamente en inglés sobre el dominio de TinyStories.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente de una sola capa sobre un conectoma disperso congelado; paso único por token. Entrada: concatenación de 8 ranuras de retardo (últimos 8 tokens) proyectadas al espacio de 49.393 neuronas. Actualización: `x = 0,1·x + 0,9·tanh(gain · (rec_gain · (W·x) + drive) + bias)`. Salida: `layer_norm(x) @ head_a.T @ head_b.T` (49.393 → 64 → 1.024) |
| Parametros totales | 3.956.469 (encoder 482.816; ganancia, ganancia recurrente y sesgo por neurona 148.179; LayerNorm de salida 98.786; readout factorizado de rango 64: 3.226.688) |
| Parametros activos | No aplica (no es MoE). La matriz recurrente W (9.050.172 sinapsis) está congelada y no se entrena |
| Longitud de contexto | No disponible como ventana explícita. La recurrencia mantiene un estado de 49.393 unidades y la entrada consume 8 ranuras de retardo, es decir, los 8 tokens anteriores |
| Tipos de cuantizacion | No disponible. Solo se distribuyen pesos en float32; no hay versiones GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 (pesos). El dataset TinyStories no se redistribuye |
| Formato de pesos | safetensors en float32 (`max-accuracy.safetensors`, `min-ce.safetensors`), arrays crudos `.f32` para la demo web y conectoma en formato binario CSR (`edges_offsets.i32`, `edges_source.u16`, `edges_weight.f32`, `interface/in_index.i32`) en el dataset `fernandofernandes/fly-connectome-49k` |

Otros metadatos: repositorio de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, pipeline `text-generation`, fecha de creación 2026-09-16 y de actualización 2026-09-16 según los metadatos de HuggingFace.

## Arquitectura y entrenamiento

La arquitectura es una red recurrente de un solo paso por token cuyo operador principal es la multiplicación por la matriz dispersa del conectoma (49.393 × 49.393, 9.050.172 entradas no nulas medidas). El vector de entrada se construye concatenando 8 proyecciones lineales independientes, una por cada ranura de retardo temporal. Tras la actualización no lineal con mezcla 0,1/0,9, la lectura se realiza con una factorización de rango 64: una proyección de 49.393 a 64 y otra de 64 a 1.024 logits. La dimensión final de 1.024 sugiere un vocabulario de 1.024 tokens ajustado sobre un subconjunto propio de TinyStories, aunque la model card no lo confirma explícitamente.

El entrenamiento se realizó desde cero con semilla 42, optimizador AdamW, tamaño de lote 8, retropropagación truncada en el tiempo (TBPTT) de 32 pasos y recorte de gradiente de 1,0, sobre un Apple M3 Max con kernels dispersos de Metal contribuidos al proyecto ConnecTorch. Se detuvo por regla de meseta a las 14 épocas completadas y 16.800 actualizaciones, por lo que el calendario previsto de 44 épocas no se completó y los pesos distribuidos corresponden a paradas tempranas aceptadas, no a ejecuciones terminadas. Los dos checkpoints publicados se seleccionaron con criterios distintos y nunca se fusionan: `max-accuracy.safetensors` (actualización 15.552) y `min-ce.safetensors` (actualización 16.600). El autor reporta que el cambio de parametrización de la lectura mejoró la entropía cruzada de validación en 1,63 nats eliminando 12,97× los parámetros en una comparación interna controlada, lo que apunta a sobreajuste del readout y no a una propiedad del cableado biológico.

## Capacidades

- Generación de texto de siguiente token en inglés, con vocabulario reducido y dominio restringido a relatos infantiles breves del estilo TinyStories.
- Mantenimiento de estado recurrente a lo largo de una secuencia, con memoria efectiva a corto plazo limitada por un estado de 49.393 unidades y 8 ranuras de entrada.
- Reproducción determinista de resultados: el `manifest.json` incluye digests SHA-256 de los búferes congelados y una traza dorada que las implementaciones en NumPy, PyTorch y JavaScript reproducen token a token.
- Inferencia íntegra en el navegador mediante el motor JavaScript del repositorio (`space/src/engine.js`), sin backend de servidor.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, matemáticas, código, visión, audio ni modo de pensamiento.
- No dispone de capacidades multilingües: solo inglés.
- No dispone de alineación por instrucciones (no hay RLHF ni DPO documentados) ni de formato de chat.

## Casos de uso

- Investigación en conectómica computacional: el modelo permite medir el efecto de la topología medida de un cerebro real sobre el aprendizaje de una tarea de lenguaje, manteniendo el grafo byte-idéntico a la referencia y entrenando solo las dinámicas por neurona.
- Estudio de sobreajuste en capas de lectura: comparar la variante de rango 64 (3.226.688 parámetros en el readout) con la matriz de rango completo de la referencia (50.578.432 parámetros, el 95,9% de lo que aprende) permite aislar el coste y el beneficio de parametrizar la salida en rango completo en modelos minúsculos.
- Banco de pruebas de kernels dispersos: el modelo ejerce presión sobre kernels CSR y Metal para multiplicaciones matriz-vector de 49.393 × 49.393 con 9.050.172 no nulos, y sirve para validar implementaciones propias contra la traza dorada publicada.
- Demostración educativa en el cliente: el Space Fly Recital y los arrays `.f32` permiten ejecutar el modelo completo en un navegador, útil para explicar redes recurrentes, conectomas y factorización de bajo rango sin infraestructura de servidor.
- Reproducción de experimentos con presupuesto de hardware mínimo: el entrenamiento completo cabe en un Apple M3 Max con kernels Metal, lo que permite a grupos sin acceso a clústeres reproducir y variar la receta (semilla, lotes, TBPTT, épocas).
- Trazabilidad de artefactos en investigación: el uso de `manifest.json` con digests de búferes congelados, recibos de selección de checkpoints y puntuaciones held-out es un ejemplo práctico de linaje reproducible para publicaciones de modelos pequeños.
- Prototipado de autocompletado ultra-ligero en el dominio de cuentos infantiles: con un espacio de pesos del orden de decenas de mebibytes, podría embeberse en demos educativas, siempre que se acepte su falta de fluidez y su vocabulario reducido.

## Benchmarks y rendimiento

Los únicos datos publicados son la evaluación held-out propia del autor sobre 200 relatos nuevos de TinyStories (45.059 objetivos de siguiente token, población que no seleccionó ningún checkpoint), con bootstrap pareado por relato completo y 10.000 remuestreos. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar.

| Modelo | Parámetros | CE | PPL | Top-1 | ΔCE frente a la referencia (IC 95%) |
|---|---:|---:|---:|---:|---|
| ngxson referencia | 52.756.661 | 3,9882 | 53,96 | 31,38% | — |
| fly-wordbrain-rank64 (max-accuracy) | 3.956.469 | 3,2725 | 26,38 | 33,50% | −0,716 [−0,746, −0,686] |
| fly-wordbrain-rank64 (min-CE) | 3.956.469 | 3,2802 | 26,58 | 33,37% | −0,708 [−0,738, −0,679] |

Advertencia del propio autor: la comparación contra la referencia no está controlada, porque se desconocen sus relatos de entrenamiento, su entrenador y la población de ajuste del tokenizador, y el modelo aquí descrito se entrenó con 1.000 relatos propios de TinyStories bajo una receta reconstruida. El resultado controlado es el interno: mantener todo fijo y cambiar solo la parametrización de la lectura mejoró la CE de validación en 1,63 nats eliminando 12,97× los parámetros. No hay evidencia de que el cableado de la mosca sea un buen previo para el lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos en float32 ≈ 15,1 MiB (3.956.469 × 4 bytes); grafo CSR ≈ 52 MiB (valores 9.050.172 × 4 bytes ≈ 34,5 MiB, índices de origen en uint16 ≈ 17,3 MiB, offsets int32 ≈ 0,19 MiB); vectores de estado de 49.393 elementos ≈ 0,19 MiB cada uno. Huella total del orden de decenas de mebibytes, sin documentación oficial de cifras exactas.
- GPU recomendadas: no se documentan. El entrenamiento se realizó en un Apple M3 Max (GPU integrada) con kernels Metal personalizados, no en A100, H100 ni similares.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU con al menos 1 GB de memoria; también en CPU y en el navegador del cliente, como demuestra la demo web del autor.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI. La arquitectura no es un transformer estándar, por lo que no se carga con `AutoModel` de transformers ni se convierte a GGUF con las herramientas habituales; requiere el código propio del repositorio (PyTorch + scipy.sparse, o las implementaciones NumPy y JavaScript incluidas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Readout | CE (held-out) | Top-1 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| ngxson/fly-llm-hf (referencia) | 52.756.661 | Matriz de rango completo (50.578.432 parámetros) | 3,9882 | 31,38% | no disponible | HuggingFace |
| fly-wordbrain-rank64 (max-accuracy) | 3.956.469 | Factorizado de rango 64 (3.226.688 parámetros) | 3,2725 | 33,50% | CC BY 4.0 | HuggingFace, 0 descargas |
| fly-wordbrain-rank64 (min-CE) | 3.956.469 | Factorizado de rango 64 | 3,2802 | 33,37% | CC BY 4.0 | HuggingFace, 0 descargas |
| Variante interna de rango completo, misma receta | no disponible | Matriz de rango completo | 1,63 nats peor que la versión de rango 64 (dato del autor) | no disponible | no aplica | no distribuida |

No se dispone de datos comparables de otros modelos de la misma categoría (por ejemplo, GPT-2 small o modelos de la familia TinyStories) en la información proporcionada, por lo que no se incluyen cifras de esos sistemas.

## Limitaciones y advertencias

- El modelo no es fluido: divaga sobre los personajes Lily y Tom, pierde las premisas de los relatos y en ocasiones reproduce frases de entrenamiento de forma literal. Una entropía cruzada baja en TinyStories no equivale a calidad de escritura.
- El entrenamiento no se completó: parada temprana en 14 épocas de las 44 previstas, por lo que los checkpoints son aceptados prematuramente y no ejecuciones terminadas.
- La comparación principal con el modelo de referencia no está controlada, según reconoce el propio autor.
- No se han ejecutado los controles necesarios (grafos aleatorizados y grafos con cero aristas) para atribuir efecto alguno a la anatomía del conectoma.
- Evidencia interna de sobreajuste en la capa de lectura: la mejora de 1,63 nats con 12,97× menos parámetros apunta a la parametrización del readout, no a la biología.
- Sesgos conocidos: no documentados explícitamente, pero el corpus TinyStories está compuesto por relatos infantiles sintéticos en inglés, con la distribución temática y estilística que ello implica.
- Riesgo de alucinación: alto en el sentido de incoherencia narrativa y pérdida de contexto; el modelo no está alineado por instrucciones ni verificado factualmente.
- Limitaciones de idioma y contexto: solo inglés, vocabulario muy reducido y memoria efectiva limitada a 8 ranuras de entrada más el estado recurrente; no hay ventana de contexto declarada.
- Restricciones de licencia: los pesos se distribuyen bajo CC BY 4.0, lo que exige atribución y permite uso comercial con esa condición. TinyStories (CDLA-Sharing-1.0) no se redistribuye: el repositorio solo incluye identificadores y hashes de los relatos. El conectoma se distribuye por separado en el dataset `fly-connectome-49k`.
- Caveats para producción: la arquitectura no es compatible con las pilas de inferencia habituales (vLLM, llama.cpp, Ollama, TGI) ni con `AutoModel`; su uso requiere código propio. Sin soporte de tool calling, agentes, formato de chat ni cuantización. Con 0 descargas y 0 likes, no existe validación externa del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fernandofernandes/fly-wordbrain-rank64
- Dataset del conectoma: https://huggingface.co/datasets/fernandofernandes/fly-connectome-49k
- Demo de lectura en voz alta (Space Fly Recital): https://huggingface.co/spaces/fernandofernandes/fly-recital
- Repositorio de investigación y artefactos: https://github.com/fernando-neto-ai/fly-wordbrain
- Modelo de referencia ngxson Fly LLM: https://huggingface.co/ngxson/fly-llm-hf
- ConnecTorch (kernels dispersos upstream): https://github.com/us/connectorch
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- La búsqueda web no devolvió resultados relevantes sobre el modelo: los únicos resultados obtenidos fueron páginas de seguimiento de envíos de FedEx (fedex.com, fedexfreight.com), sin relación alguna con este sistema.
