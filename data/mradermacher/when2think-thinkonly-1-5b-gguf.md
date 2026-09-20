# mradermacher/When2Think-ThinkOnly-1.5B-GGUF

## Resumen

When2Think-ThinkOnly-1.5B-GGUF es la versión cuantizada en formato GGUF del modelo `junshim/When2Think-ThinkOnly-1.5B`, publicada por el usuario mradermacher, conocido por generar cuantizaciones estáticas de modelos abiertos. El modelo original es un modelo de lenguaje de aproximadamente 1.500 millones de parámetros (1.777.088.000 parámetros reales según los pesos en safetensors) especializado en razonamiento matemático y entrenado mediante aprendizaje por refuerzo con recompensas verificables (RLVR) sobre el dataset `agentica-org/DeepScaleR-Preview-Dataset`.

Los metadatos del repositorio lo etiquetan como "hybrid-reasoning", "adaptive-reasoning" y "efficient-reasoning", lo que sitúa al modelo en la familia de modelos pequeños de razonamiento que tratan de decidir cuándo merece la pena desplegar una cadena de pensamiento larga y cuándo no. Este repositorio concreto corresponde a la variante "ThinkOnly" y solo distribuye pesos cuantizados en GGUF para inferencia local; no incluye el modelo en precisión completa ni scripts de entrenamiento.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de razonamiento matemático en hardware de consumo o incluso en CPU gracias a los doce niveles de cuantización publicados (desde Q2_K de 0,9 GB hasta f16 de 3,7 GB); por otro, su licencia MIT facilita la integración comercial. Como contrapartida, el repositorio no documenta arquitectura, longitud de contexto, composición del dataset ni resultados de benchmarks, y en el momento de redactar esta ficha acumula 0 descargas y 0 "likes", por lo que no existe validación independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica arquitectura; los tags apuntan a un transformer decoder-only con razonamiento adaptativo, sin confirmar) |
| Parametros totales | 1.777.088.000 (aproximadamente 1,78 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye para la libreria transformers (formato exacto no confirmado) |
| Modelo base | junshim/When2Think-ThinkOnly-1.5B |
| Dataset de entrenamiento declarado | agentica-org/DeepScaleR-Preview-Dataset |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 16,2 GB |
| Pipeline declarado | reinforcement-learning |
| Fecha de publicacion | 2026-09-20 (ultima actualizacion 2026-09-20) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas. Lo único documentado es que el pipeline declarado es `reinforcement-learning` y que el dataset asociado es `agentica-org/DeepScaleR-Preview-Dataset`, un conjunto orientado a problemas matemáticos verificables, lo que es coherente con las etiquetas `rlvr` (reinforcement learning with verifiable rewards) y `mathematical`. También aparecen las etiquetas `hybrid-reasoning`, `adaptive-reasoning` y `efficient-reasoning`, que sugieren un entrenamiento cuyo objetivo es modular la longitud o la presencia del razonamiento en función de la dificultad del problema.

Este repositorio es exclusivamente una distribución de pesos cuantizados: el autor declara cuantizaciones estáticas y señala que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicación. Los archivos GGUF se generaron a partir del modelo base en transformers, y la model card remite a los README de TheBloke para instrucciones de uso y a la documentación de llama.cpp para los detalles del formato. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos o arquitecturas híbridas SSM) más allá de las etiquetas mencionadas.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat soportado (etiqueta `conversational`).
- Razonamiento matemático: el modelo está entrenado con RLVR sobre un dataset de problemas matemáticos verificables, por lo que su foco principal son problemas de tipo competición y cálculo paso a paso.
- Razonamiento adaptativo ("adaptive/hybrid reasoning"): según los metadatos, el modelo está diseñado para ajustar cuándo y cuánto razonar, aunque no se documenta el mecanismo concreto ni cómo se activa o desactiva.
- Cadena de pensamiento extensa ("ThinkOnly"): la variante distribuida aquí no incluye, según la denominación, un modo sin razonamiento explícito.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada formalmente; el modelo puede generar cadenas multi-paso, pero no hay evidencia documentada de uso agéntico.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.

## Casos de uso

- Generación de datos sintéticos de razonamiento matemático: dado que el modelo está entrenado con RLVR sobre problemas verificables, puede utilizarse para producir cadenas de solución largas que después se filtran por verificación simbólica y se emplean para destilar modelos mayores o entrenar modelos más pequeños.
- Tutoría matemática en local: desplegado con llama.cpp u Ollama en un portátil, puede resolver ejercicios paso a paso en inglés sin conexión y sin enviar datos del alumno a servicios externos, lo que resulta útil en entornos educativos con requisitos de privacidad.
- Investigación en RLVR: al ser un modelo de 1,78 B con licencia MIT y pesos GGUF, sirve como referencia ligera para comparar estrategias de decodificación (long CoT frente a respuestas directas) o para reproducir experimentos de refuerzo con recompensas verificables antes de escalar a modelos mayores.
- Etiquetado y filtrado de corpus matemáticos: el modelo puede puntuar o resolver parcialmente problemas de un corpus para descartar ejemplos mal formados o etiquetas incorrectas, aprovechando su coste computacional reducido frente a modelos de 7 B o más.
- Asistente de cálculo embebido en aplicaciones de escritorio: con una cuantización Q4_K_M de 1,2 GB, puede integrarse en herramientas de ofimática o notebooks para resolver operaciones y explicar el procedimiento en inglés, incluso en equipos sin GPU dedicada.
- Prototipado rápido de productos conversacionales: gracias al formato GGUF y a la compatibilidad con llama-server, LM Studio u Ollama, permite validar una interfaz de chat con razonamiento antes de comprometerse con un modelo mayor y más caro.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce niveles de cuantización del mismo modelo, lo que lo convierte en un banco de pruebas práctico para medir el impacto de Q2_K frente a Q8_0 en tareas matemáticas sobre hardware limitado.
- Ejecución en dispositivos de borde: con cuantizaciones de 1 GB o menos, es candidato para placas tipo Raspberry Pi o Jetson en tareas de resolución de problemas sencillos, siempre que se acepte la degradación de calidad de los formatos de 2 y 3 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye ninguna tabla de MMLU, GSM8K, MATH, HumanEval ni métricas equivalentes, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos calculados a partir del tamaño de los archivos publicados, más caché KV y sobrecarga del runtime; no son cifras oficiales):
  - Q2_K (0,9 GB): ~1,5-2 GB de VRAM en contexto corto.
  - Q4_K_S / Q4_K_M (1,2 GB): ~2,5-3,5 GB; son los formatos marcados como "fast, recommended" por el autor.
  - Q6_K (1,6 GB): ~3-4 GB.
  - Q8_0 (2,0 GB): ~3,5-4,5 GB; marcado como "fast, best quality".
  - f16 (3,7 GB): ~5-6 GB; el propio autor lo califica de "overkill" para este tamaño.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las cuantizaciones de 4 bits (GTX 1650, RTX 3050, RTX 4060). Con 6-8 GB (RTX 3060, RTX 2070) se cubren sin problema Q8_0 y f16. En gamas profesionales (A100, H100) el modelo queda enormemente infrautilizado y solo tiene sentido en despliegues con muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas. También es viable en CPU pura mediante llama.cpp, y en equipos Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, KoboldCpp, text-generation-webui, Jan y `llama-cpp-python`. vLLM tiene soporte experimental de GGUF; TGI no soporta este formato y requeriría el modelo base en safetensors. El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponible. No hay mediciones publicadas en la información proporcionada. Como referencia cualitativa, un modelo de esta talla en Q4 suele generar decenas de tokens por segundo en una GPU de consumo moderna, pero al tratarse de una variante orientada a cadenas de razonamiento largas, la latencia percibida por respuesta completa será considerablemente mayor que la de un modelo instructivo equivalente.

## Comparativa con modelos similares

No se han publicado benchmarks del modelo en la información disponible, por lo que la comparación es necesariamente estructural. Los datos de los modelos alternativos proceden de conocimiento general del sector y no están verificados en el material de partida de esta ficha; se marcan como "no disponible" aquellos campos que no se pueden confirmar.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks |
|---|---|---|---|---|---|
| When2Think-ThinkOnly-1.5B | 1,78 B | no disponible | MIT | Razonamiento matematico con RLVR | no disponible |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,8 B (no verificado en esta ficha) | no disponible | MIT (familia R1) | Destilado de razonamiento | no disponible |
| Qwen2.5-1.5B-Instruct | ~1,5 B (no verificado en esta ficha) | no disponible | Apache 2.0 | Instructivo generalista | no disponible |
| SmolLM2-1.7B-Instruct | ~1,7 B (no verificado en esta ficha) | no disponible | Apache 2.0 | Instructivo generalista | no disponible |

Diferencias cualitativas destacables: When2Think-ThinkOnly-1.5B es el único de la comparativa cuyo entrenamiento declarado se basa explícitamente en RLVR sobre un dataset matemático, mientras que Qwen2.5-1.5B-Instruct y SmolLM2-1.7B-Instruct son modelos instructivos generalistas con amplia validación comunitaria y documentación pública de benchmarks. La ventaja de When2Think en esta comparativa es su licencia MIT y la disponibilidad inmediata de doce cuantizaciones GGUF; su desventaja es la ausencia total de métricas publicadas y de adopción verificable.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no existe ninguna evaluación publicada que permita afirmar que el modelo iguala o supera a alternativas de su tamaño en matemáticas o razonamiento general.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la publicación, lo que implica que no hay informes de terceros sobre su comportamiento real ni sobre posibles fallos.
- Documentación mínima: la model card no especifica arquitectura, longitud de contexto, número de tokens de entrenamiento, composición del dataset ni proceso de alineación. Cualquier decisión de producción basada en este modelo parte de información incompleta.
- Idioma: solo inglés. No hay soporte declarado de castellano ni de otros idiomas, por lo que su uso en productos en español requeriría evaluación previa y probablemente daría resultados degradados.
- Riesgo de alucinación: es un riesgo inherente a los modelos de razonamiento de este tamaño, especialmente en problemas matemáticos donde puede producir cadenas de pasos coherentes pero con resultados incorrectos. Se recomienda verificación simbólica o con herramientas externas.
- Degradación por cuantización: las variantes Q2_K y Q3_K reducen notablemente la calidad; para tareas matemáticas conviene usar Q4_K_M o superior, y el propio autor recomienda Q4_K_M, Q8_0 y, con reservas por tamaño, f16.
- Sesgos: no se documenta ningún análisis de sesgos, ni de género, ni cultural, ni de dominio. Al entrenarse sobre un dataset matemático, es esperable un rendimiento pobre fuera de ese dominio.
- Licencia: MIT, lo que permite uso comercial, modificación y redistribución sin restricciones relevantes, siempre que se conserve el aviso de copyright. No obstante, la licencia del modelo base debe verificarse de forma independiente antes de un despliegue comercial.
- Restricciones de formato: al ser un repositorio GGUF, no es apto para reentrenamiento ni ajuste fino directo con transformers; para ello habría que acudir al modelo base.
- Fechas del repositorio: la fecha de creación y actualización indicada (2026-09-20) es posterior a la mayoría de referencias del ecosistema, lo que refuerza la necesidad de revisar el estado del repositorio antes de usarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/When2Think-ThinkOnly-1.5B-GGUF
- Modelo base: https://huggingface.co/junshim/When2Think-ThinkOnly-1.5B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#When2Think-ThinkOnly-1.5B-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que soporta al autor de las cuantizaciones: https://www.nethype.de/
