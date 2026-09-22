# flock-io/this-that-model-1.1

## Resumen

this-that-model-1.1 es un modelo de decisión tipada desarrollado por flock-io. No es un modelo generativo al uso: no produce texto token a token, sino que resuelve una decisión declarada en una única pasada forward, sin bucle de decodificación, sin parser y sin reintentos. Con 1.881.825.088 parámetros (1,88 B) y una arquitectura híbrida estilo Qwen3.5 en la que 18 de sus 24 capas emplean DeltaNet (atención lineal) y 6 mantienen atención completa, el modelo está optimizado para latencia extrema: 30,9 ms por pregunta en una GPU de consumo y cero tokens generados.

La versión 1.1 mantiene la arquitectura idéntica a la 1.0 y cambia únicamente la mezcla de entrenamiento: 64.028 preguntas de decisión compuesta sobre 112 estructuras de reglas y 40 dominios, más dos términos de pérdida que explotan pares de ejemplos que solo el generador de datos puede producir. El resultado es un salto de 0,406 a 0,775 en el benchmark de decisiones complejas, manteniendo la misma latencia.

Su relevancia actual está en el nicho que ocupa: aplicaciones donde la respuesta es una elección entre opciones declaradas bajo reglas solapadas, excepciones de excepciones o conflictos de ámbito entre autoridades. Frente a sistemas frontera que generan unos 200 tokens por consulta y tardan alrededor de un segundo, este modelo alcanza precisión competitiva en submicrosegundo-decenas de milisegundos por decisión, y supera a todos los sistemas medidos en la familia `knapsack_subset`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido estilo Qwen3.5; 24 capas, 18 con DeltaNet (atención lineal) y 6 con atención completa |
| Parámetros totales | 1.881.825.088 (1,88 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors, 3,8 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | decider-2b |
| Pipeline declarado | text-classification |
| Librería | transformers |
| Repositorio | 3,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 24 capas que combina atención lineal DeltaNet en 18 de ellas con atención completa en las 6 restantes. Esta proporción reduce el coste computacional y de memoria asociado al mecanismo de atención clásico, lo que explica la latencia de 30,9 ms por pregunta. El modelo resuelve la decisión en una única pasada forward sobre un estado y un conjunto de opciones declaradas: no hay generación autoregresiva, ni decodificación especulativa, ni bucle de reintento, ni parser posterior que interprete la salida.

El cambio de 1.0 a 1.1 es exclusivamente de datos de entrenamiento. La mezcla incorpora 64.028 preguntas de decisión compuesta construidas sobre 112 estructuras de reglas y 40 dominios, y añade dos términos de pérdida basados en pares generados automáticamente: una misma decisión renderizada de cuatro formas distintas, que debe recibir idéntica respuesta, y dos políticas aplicadas sobre un mismo estado, que no deben coincidir. No se documenta en la información disponible el uso de RLHF, DPO ni de un pipeline de alineación por preferencias; tampoco se especifican el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de lo indicado.

## Capacidades

- Decisión tipada en una sola pasada forward: dado un estado y un conjunto de opciones declaradas, devuelve la opción elegida sin generar texto intermedio.
- Salida estructurada y calibrada: el modelo produce confianzas que siguen las reglas de transición cuando la respuesta verdadera es una probabilidad computable.
- Resolución de reglas concurrentes: determina qué regla gobierna cuando varias aplican simultáneamente.
- Manejo de excepciones anidadas: resuelve casos en los que una política tiene una excepción y esa excepción tiene a su vez otra excepción.
- Conflictos de ámbito entre autoridades: decide en presencia de dos autoridades con jurisdicciones solapadas.
- Análisis de sensibilidad factual: identifica qué hecho, si se elimina, cambia la respuesta.
- Cadenas de filtros: aplica secuencias de criterios de filtrado de forma fiable.
- Optimización de subconjuntos con presupuesto: la familia `knapsack_subset` alcanza 0,678, muy por encima del siguiente mejor sistema.
- Calibración probabilística sobre objetivos calculados (`sim_event_ood`, `sim_local_ood`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no; únicamente inglés.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible; el diseño excluye explícitamente cualquier bucle de decodificación.

## Casos de uso

- Motores de decisión con reglas solapadas en producción: el modelo resuelve en 30,9 ms y cero tokens generados consultas donde varias reglas compiten, lo que permite integrarlo en rutas críticas con presupuestos de latencia de milisegundos en lugar de segundos.
- Tramitación automatizada de expedientes con normativa anidada: cuando un reglamento tiene excepciones y esas excepciones tienen excepciones, el modelo decide qué cláusula gobierna (familia fiable, ≥ 0,85) sin requerir un LLM generativo que consuma contexto reparando la respuesta.
- Enrutado de peticiones con conflicto de competencias: en organizaciones donde dos autoridades tienen ámbitos solapados, el modelo resuelve el conflicto de ámbito y devuelve una decisión tipada directamente consumible por un sistema posterior.
- Optimización de selección bajo presupuesto: para problemas de tipo mochila donde hay que elegir el grupo de ítems que cabe en un presupuesto y maximiza el valor, el modelo alcanza 0,678 frente al 0,084 de azar, muy por encima de sistemas frontera; útil en asignación de recursos, planificación de cupos o selección de lotes.
- Clasificación con confianza calibrada en pipelines de datos: al producir probabilidades calibradas (qL2 de 0,0253 y 0,0203 frente a 0,0962 y 0,4928 de un predictor constante), puede alimentar umbrales automáticos y derivar a revisión humana solo los casos con baja confianza.
- Atención al cliente sobre políticas con excepciones: sustituye a un modelo generativo en el paso de "¿qué política aplica a este caso?", reduciendo el coste por decisión en órdenes de magnitud según la propia comparativa de coste del autor.
- Auditoría de decisiones y análisis de sensibilidad: identificar qué hecho, si se elimina, cambia la respuesta permite construir explicaciones contrafactuales sobre decisiones ya tomadas, con una fiabilidad alta en esa familia.
- Filtrado por cadenas de criterios en pipelines de datos: la aplicación secuencial de filtros es una de las familias fiables, por lo que puede usarse como etapa de cribado antes de procesos más caros.

## Benchmarks y rendimiento

Decisiones complejas (1.710 preguntas, azar 0,258). Cada sistema se puntúa igual: una pregunta, opciones declaradas, lectura de la respuesta, y un sistema que no devuelve nada cuenta como incorrecto.

| Sistema | Precisión | Tokens generados | Latencia |
|---|---:|---:|---:|
| claude-opus-5 | 0,834 | ~200 | ~1000 ms |
| gpt-5.6 | 0,816 | ~200 | ~1200 ms |
| this-that-model-1.1 | 0,775 | 0 | 30,9 ms |
| glm-5.3 | 0,652 | ~200 | ~800 ms |
| kimi-k3 | 0,522 | ~200 | ~1000 ms |
| deepseek-v4.1-flash | 0,511 | ~4 | ~800 ms |
| deepseek-v4-pro | 0,470 | ~4 | ~900 ms |
| this-that-model-1.0 | 0,406 | 0 | 30,9 ms |
| laya-typed-decisions | 0,310 | 0 | 25 ms |
| azar | 0,258 | — | — |

Comparativa interna entre versiones:

| Métrica | 1.0 | 1.1 |
|---|---:|---:|
| Decisiones complejas (1.710 preguntas, azar 0,258) | 0,406 | 0,775 |
| Benchmark espacial (7.305 preguntas) | 0,839 | 0,871 |
| Benchmark espacial (subconjunto de 2.250 preguntas) | 0,844 | 0,870 |
| Latencia | 30,9 ms | 30,9 ms |

Cohorte congelada de terceros (68 preguntas sobre un servicio comercial alojado):

| Sistema | Precisión | Brier (menor mejor) | NLL (menor mejor) |
|---|---:|---:|---:|
| Línea base de clase mayoritaria | 0,647 | — | — |
| El servicio alojado | 0,765 | 0,133 | 0,403 |
| this-that-model-1.0 | 0,941 | 0,042 | 0,126 |
| this-that-model-1.1 | 1,000 | 0,003 | 0,023 |

Calibración (qL2, menor mejor; se compara con un predictor constante):

| Tarea | Precisión | qL2 | Predictor constante |
|---|---:|---:|---:|
| sim_event_ood | 0,720 | 0,0253 | 0,0962 |
| sim_local_ood | 0,990 | 0,0203 | 0,4928 |

Por familia de decisión:

| Fiabilidad | Familias |
|---|---|
| Fiable (≥ 0,85) | qué regla gobierna; una excepción y su excepción; conflicto de ámbito entre dos autoridades; qué hecho, eliminado, cambia la respuesta; cadena de filtros |
| Poco fiable (≈ 0,50) | ponderar varios criterios numéricos entre sí; el cambio más barato que invierte una decisión; juzgar si el estado contiene información suficiente para decidir |

Por tipo de decisión frente al mejor de los dos sistemas frontera: cuatro tipos favorecen a este modelo, dos empatan en 1,000 y tres quedan dentro de una décima. Las dos brechas más amplias en contra son juzgar si el estado contiene información suficiente para decidir (0,444 frente a 0,833) e iterar una cascada hasta su punto fijo (0,678 frente a 0,978).

## Requisitos de hardware

- VRAM estimada: el repositorio publica 3,8 GB de pesos, coherente con precisión bf16/fp16 para 1,88 B de parámetros; la inferencia requiere aproximadamente 4-6 GB de VRAM incluyendo activaciones y buffers de trabajo. Las cifras exactas por cuantización no están disponibles porque no se publican cuantizaciones.
- GPU recomendadas: al tratarse de un modelo de 1,88 B, cualquier GPU con al menos 8 GB de VRAM es suficiente. Cabe con holgura en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en el segmento profesional, A100, H100 y L40S están sobredimensionadas para una sola instancia, pero permiten servir muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí. El propio autor reporta 30,9 ms por pregunta en una GPU de consumo, con un consumo de 80 W y un coste estimado de electricidad de 0,30 $/kWh durante ese tiempo.
- Opciones de despliegue: la librería declarada es transformers, con código de inferencia publicado en github.com/FLock-io/this-that-model. No hay información disponible sobre soporte en vLLM, llama.cpp, Ollama, TGI ni sobre pesos GGUF.
- Latencia y throughput: 30,9 ms por pregunta medida de extremo a extremo, con cero tokens generados. No se publican cifras de throughput agregado ni de batching máximo.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión en decisiones complejas | Tokens generados | Latencia | Licencia / disponibilidad |
|---|---:|---:|---:|---:|---|
| this-that-model-1.1 | 1,88 B | 0,775 | 0 | 30,9 ms | MIT, pesos abiertos en HuggingFace |
| this-that-model-1.0 | 1,88 B (misma arquitectura) | 0,406 | 0 | 30,9 ms | Disponible en el mismo repositorio de autor |
| laya-typed-decisions | no disponible | 0,310 | 0 | 25 ms | no disponible |
| claude-opus-5 | no disponible | 0,834 | ~200 | ~1000 ms | Propietario, servicio alojado |
| gpt-5.6 | no disponible | 0,816 | ~200 | ~1200 ms | Propietario, servicio alojado |

Frente a los sistemas generativos, la comparación no es de capacidad bruta sino de coste por decisión: el modelo abierto queda 0,059 puntos por debajo del mejor sistema frontera medido, pero resuelve en 30,9 ms con cero tokens generados y sin coste por token. Frente a `this-that-model-1.0`, la mejora es íntegramente atribuible a los datos de entrenamiento, con arquitectura y latencia idénticas. Los datos de parámetros y licencia de los modelos frontera y de `laya-typed-decisions` no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo idioma: únicamente inglés. No hay soporte multilingüe documentado.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones. Solo resuelve decisiones tipadas sobre opciones declaradas.
- Familias poco fiables (en torno a 0,50 de precisión): ponderar varios criterios numéricos entre sí, identificar el cambio más barato que invierte una decisión y juzgar si el estado contiene información suficiente para decidir.
- Brecha amplia en dos tipos concretos frente a los sistemas frontera: la suficiencia de información (0,444 frente a 0,833) y la iteración de cascadas hasta el punto fijo (0,678 frente a 0,978).
- Regresión de calibración: en `sim_local_ood` la 1.1 obtiene un qL2 de 0,0203 frente al 0,0096 de la 1.0, es decir, la mitad de precisión en la calibración, aunque sigue siendo veinticuatro veces mejor que un predictor constante.
- La fila de la 1.0 en el benchmark de decisiones complejas es zero-shot: el benchmark no existía cuando se entrenó y ninguno de sus tipos de decisión estaba en su mezcla. La comparación 0,406 → 0,775 mide el efecto de los datos de entrenamiento, no una mejora arquitectónica.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada, pero las decisiones dependen de las 112 estructuras de reglas y los 40 dominios de la mezcla de entrenamiento, por lo que el comportamiento fuera de esa distribución no está caracterizado.
- Riesgo de alucinación: el concepto no aplica de la misma forma que en un modelo generativo (no hay texto libre que pueda inventarse), pero sí existe riesgo de decisión incorrecta con confianza alta en las familias poco fiables. El autor indica que en las familias que no domina la confianza cuando falla es mucho menor que cuando acierta (0,45 frente a valores superiores).
- Longitud de contexto: no disponible. No se puede asumir que soporte estados largos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. No se documentan restricciones adicionales.
- Caveats para producción: el modelo cuenta con 0 descargas y 0 likes y fue publicado el 22 de septiembre de 2026, por lo que no existe validación de terceros más allá de la cohorte congelada de 68 preguntas reportada por el propio autor. La comparativa de coste entre precisión y coste no es homogénea (el precio alojado incluye servicio y margen, el local es solo electricidad), y el propio autor pide leerla como un orden de magnitud, no como un factor cinco.
- Los resultados de búsqueda web disponibles no contienen información relevante sobre este modelo; todas las referencias útiles provienen de la model card y del repositorio de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flock-io/this-that-model-1.1
- Código de inferencia: https://github.com/FLock-io/this-that-model
- Dataset del benchmark de decisiones complejas: https://huggingface.co/datasets/limberc/this-that-complex-decisions
- Dataset del benchmark espacial (referenciado en los tags): limberc/this-that-spatial-bench
