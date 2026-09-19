# jbarney/circuit-vl-4b

## Resumen

`circuit-vl-4b` es un adaptador LoRA sobre `Qwen/Qwen3-VL-4B-Instruct` que convierte un modelo de visión-lenguaje generativo en un **modelo de decisión de "Sistema Uno"**: recibe un estado con una o varias imágenes (el vídeo se trata como fotogramas muestreados) más texto opcional y una pregunta tipada, y devuelve en una sola pasada hacia delante una distribución de probabilidad calibrada sobre las opciones, sin generar texto. Lo publica el autor `jbarney` como miembro visual de la familia *circuit*, junto a los modelos de texto `circuit-1.7b` y `circuit-8b`, dentro del proyecto decision-circuits.

La relevancia técnica está en el mecanismo de lectura: en lugar de explotar los logits de las letras de cada opción (letter-logit prompting), cada opción se envuelve en tokens delimitadores, la secuencia termina en un token *decide* y una cabeza de punteros (pointer head) puntúa el delimitador de cierre de cada opción contra ese token *decide* aplicando softmax. Esto elimina el límite en el número de opciones y, al entrenarse con entropía cruzada contra etiquetas de resultado, aprende calibración de forma explícita. El modelo base tiene 4.000 millones de parámetros; el adaptador añade 33 millones.

Es un artefacto de investigación, no un sistema de producción: se distribuye como adaptador PEFT con el codificador visual del modelo base congelado, solo en inglés, entrenado sobre documentos sintéticos renderizados y con 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo de lenguaje de `Qwen/Qwen3-VL-4B-Instruct` (transformer multimodal vision-lenguaje); codificador visual congelado y sin modificar; cabeza de lectura de punteros con dos proyecciones lineales de 2560 x 256 |
| Parametros totales | 4.000 millones en el modelo base (no disponible el desglose exacto por componente); el adaptador LoRA añade 33 millones, más la cabeza de punteros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento limito la secuencia a un maximo de 1.536 tokens |
| Tipos de cuantizacion | No disponible; los pesos publicados son el adaptador PEFT y la cabeza (no se documentan variantes GGUF ni cuantizaciones del adaptador) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (tanto el adaptador y la cabeza como el modelo base Qwen3-VL) |
| Formato de pesos | `safetensors` para el adaptador (`adapter/`) y `head.pt` para la cabeza de punteros (claves `q.weight`, `k.weight`); metadatos en `config.json` |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* mediante LoRA (rango 16, alpha 32) aplicado exclusivamente a las proyecciones de atención y MLP del modelo de lenguaje de Qwen3-VL-4B-Instruct; el codificador visual permanece congelado. Sobre la representación resultante se monta una cabeza de punteros independiente compuesta por dos mapas lineales de 2560 x 256. En inferencia, cada opción candidata se delimita con tokens y la secuencia se cierra con un token *decide*; la cabeza puntúa el delimitador de cierre de cada opción contra el token *decide* y normaliza con softmax, produciendo una distribución de probabilidad sobre las opciones. No hay generación de texto ni decodificación autoregresiva: es una única pasada hacia delante.

Los datos de entrenamiento proceden de la *vision grid* del repositorio `circuit` (`python -m s1proto.data.vision_grid`): 1.083 elementos de entrenamiento y 117 de validación, con etiquetas calculadas en el momento del renderizado por el propio código que dibuja la imagen, sin salidas de modelos profesor. Aproximadamente el 5 % de los elementos se renderizan como ambiguos con etiquetas suaves de 0,5. El conjunto cubre recibos, gráficos de barras, tablas, formularios y escenas de formas geométricas, con operaciones de extracción, lectura, clasificación, comparación, conteo, consistencia y negación. El entrenamiento fue de 2 épocas, batch 4, máximo de 1.536 tokens, learning rate de 1e-4 para el LoRA y 1e-3 para la cabeza, en bf16 con *gradient checkpointing* y entropía cruzada con objetivos suaves; se aplicó parada temprana sobre el ECE de validación, con el mejor punto en el paso 500 (ECE 0,016, precisión 98,3 %). Todo el proceso costó 7 minutos en una única RTX A6000.

## Capacidades

- Decisión multimodal calibrada: dada una imagen (o varias, o fotogramas de vídeo) y una pregunta, devuelve una distribución de probabilidad sobre las opciones, no texto libre.
- Número ilimitado de opciones por pregunta, a diferencia del *letter-logit prompting*, que queda restringido por el alfabeto de letras disponible.
- Operaciones sobre documentos e imágenes: extracción de campos, lectura de valores, clasificación, comparación entre elementos, conteo, verificación de consistencia y preguntas negadas.
- Dominios cubiertos: recibos renderizados, gráficos de barras, tablas, formularios y escenas de formas geométricas.
- Calibración aprendida: la entropía cruzada contra etiquetas de resultado hace que la confianza de salida sea interpretable, a diferencia de los logits de letras sin calibrar.
- Preguntas tipadas sobre un estado que combina imagen y texto opcional.
- No soporta generación de texto, *tool calling*, *function calling* ni razonamiento multi-paso agentivo: es una única pasada hacia delante sin decodificación.
- Capacidades multilingües: no disponibles; el modelo está entrenado y documentado únicamente en inglés.
- Capacidad especial: cabecera de decisión desacoplada del modelo generativo, lo que permite sustituir el prompt de clasificación por una consulta directa con salida probabilística.

## Casos de uso

- Extracción de campos en documentos renderizados: recibos y formularios se procesan con una pregunta de extracción y el modelo devuelve la distribución sobre los valores candidatos, con precisión del 100 % en las familias de recibos, formularios y gráficos de la parrilla de evaluación del autor.
- Lectura y validación de tablas y gráficos: la operación de conteo de filas en tablas alcanza el 93 % y la de comparación sobre gráficos de barras es perfecta en la parrilla, lo que permite usarlo como verificador automático en *pipelines* de ingesta de informes.
- Enrutado previo de bajo coste: al resolver la decisión en una sola pasada (90 ms por elemento en RTX A6000) puede actuar como prefiltro que decide si una imagen requiere un VLM generativo mucho más caro aguas abajo.
- Triaje con banda de incertidumbre en revisión humana: como la salida es una probabilidad calibrada (ECE 0,018), se puede fijar un umbral y derivar a revisión manual los elementos cuya confianza caiga por debajo, integrándose en flujos de trabajo con supervisión.
- Control de consistencia documental: la operación de consistencia permite comprobar que dos representaciones de un mismo dato (por ejemplo, un total y la suma de sus líneas) coinciden, devolviendo una probabilidad en lugar de una afirmación binaria.
- Investigación en calibración de modelos de decisión: sirve como referencia reproducible para comparar cabezas de lectura calibradas frente al *letter-logit prompting* sobre el mismo modelo base y los mismos elementos, con métricas de precisión y ECE estandarizadas.
- Clasificación de escenas con negación: la operación de negación sobre escenas de formas alcanza el 97 %, útil en tareas de verificación visual del tipo "¿no hay ningún objeto rojo en la imagen?".
- Evaluación de sistemas de decisión tipados: el formato de estado (`{"image": path, "text": ...}`) y pregunta permite construir conjuntos de evaluación JSONL propios y medir el comportamiento del modelo en dominios nuevos antes de comprometerse con un despliegue.

## Benchmarks y rendimiento

El autor publica una parrilla de generalización visual sobre 300 elementos reservados, con precisión y ECE (15 bins), comparando el adaptador con los logits de letras del modelo base sin ajustar. Las etiquetas de la parrilla fueron calculadas por el código que renderiza las imágenes.

| Modelo | Parrilla visual (precision / ECE) | ms por elemento (RTX A6000) |
|---|---|---|
| Qwen3-VL-4B-Instruct, sin ajustar, letter logits | 96,0 % / 0,041 | 61 |
| **circuit-vl-4b** | **98,3 % / 0,018** | 90 |

Desglose por celda reportado por el autor: 100 % en todas las familias de recibos, formularios y gráficos; 93 % en el conteo de filas en tablas; 97 % en preguntas negadas sobre escenas. El mejor punto de validación se alcanzó en el paso 500 con ECE 0,016 y precisión 98,3 %. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El autor entrenó y evaluó el modelo en una única RTX A6000; los 90 ms por elemento de la tabla de resultados corresponden a esa GPU.
- VRAM estimada para inferencia (cifras orientativas, no publicadas por el autor): en bf16 el modelo base de 4.000 millones de parámetros ocupa del orden de 8 GB, por lo que con caché, activaciones y el codificador visual conviene reservar entre 10 y 12 GB; con cuantización de 8 bits bajaría a unos 5-6 GB y con 4 bits a unos 3-4 GB, más el sobrecoste del adaptador (33 millones de parámetros) y la cabeza, que son despreciables.
- Cabe en GPU de consumo: RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) con margen en bf16; en tarjetas de 8-12 GB sería necesario recurrir a cuantización del modelo base.
- GPU de centro de datos recomendadas: A100, H100, L40S o A6000, especialmente si se procesan lotes grandes o se necesita el rendimiento de 90 ms por elemento medido por el autor.
- Opciones de despliegue: PEFT sobre Transformers para cargar `adapter/` y la cabeza `head.pt`, y el evaluador del repositorio `circuit` (`uv run python scripts/eval_vision.py`). vLLM sería compatible con la parte LoRA, pero la cabeza de punteros es un componente propio que requiere soporte específico. No hay soporte de GGUF ni de llama.cpp/Ollama para esta cabeza de decisión.
- Latencia y throughput: 90 ms por elemento en RTX A6000, frente a los 61 ms del modelo base evaluado con logits de letras; el servicio HTTP del repositorio sirve hoy los modelos de texto, y los estados con imagen sobre `POST /v1/systemone` están anunciados como siguiente paso, es decir, no disponibles todavía.

## Comparativa con modelos similares

No se han publicado comparativas con modelos externos en la información disponible. La única comparación documentada es contra el propio modelo base sin ajustar y contra los hermanos de la familia *circuit*.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| circuit-vl-4b | 4.000 M (base) + 33 M (LoRA) | no disponible (entrenamiento a 1.536 tokens) | 98,3 % / ECE 0,018 en la parrilla visual del autor; 90 ms por elemento en A6000 | Apache 2.0 | Adaptador PEFT; requiere el modelo base y la cabeza |
| Qwen3-VL-4B-Instruct (base, letter logits) | 4.000 M | no disponible en la informacion proporcionada | 96,0 % / ECE 0,041 en la misma parrilla; 61 ms por elemento en A6000 | Apache 2.0 | Modelo completo en HuggingFace |
| circuit-1.7b | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Modelo de texto de la misma familia |
| circuit-8b | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Modelo de texto de la misma familia |

## Limitaciones y advertencias

- La parrilla de evaluación es la del propio autor: se trata de elementos reservados, no de estructuras reservadas, por lo que la generalización a dominios con estructura distinta no está demostrada.
- El conjunto de entrenamiento es muy pequeno (1.083 elementos), lo que limita la variedad de casos cubiertos.
- Calibración sobre ambigüedad sin resolver: en los pocos elementos renderizados deliberadamente como indecidibles (por ejemplo, un campo borroso bajo una pregunta de comparación) el modelo responde con una confianza media de 0,93 cuando debería estar cerca de 0,5. El propio autor senala la calibración en ambigüedad como el problema abierto y recomienda aplicar una banda de incertidumbre alrededor de cada umbral.
- Entrenado sobre documentos sintéticos renderizados: cabe esperar una caída de rendimiento en fotografías de documentación real hasta que se incorporen datos reales a la mezcla.
- Solo inglés; no hay soporte multilingüe documentado.
- No es un sistema de producción para decisiones que afecten a personas, según indica explícitamente el autor.
- No genera texto ni soporta *tool calling* ni flujos agentivos; cualquier caso de uso que requiera una respuesta en lenguaje natural necesita un modelo adicional.
- Requiere cargar conjuntamente el modelo base y la cabeza de punteros; no es un modelo autónomo enchufable en los *pipelines* estándar de HuggingFace.
- Riesgo de alucinación: al no existir generación de texto, el riesgo se traslada a decisiones erróneas con alta confianza, especialmente fuera de la distribución de documentos sintéticos.
- Licencia Apache 2.0 tanto en el adaptador como en el modelo base, sin restricciones documentadas para uso comercial, pero la limitación práctica es de fiabilidad, no de licencia.
- Cero descargas y cero *likes* en el momento de la consulta: no hay validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbarney/circuit-vl-4b
- Repositorio de código `circuit`: https://github.com/Barneyjm/circuit
- Sitio del proyecto decision-circuits: https://decisioncircuits.com
- Modelo hermano de texto `circuit-1.7b`: https://huggingface.co/jbarney/circuit-1.7b
- Modelo hermano de texto `circuit-8b`: https://huggingface.co/jbarney/circuit-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct

No se han encontrado articulos, papers ni demos adicionales en los resultados de busqueda web disponibles.
