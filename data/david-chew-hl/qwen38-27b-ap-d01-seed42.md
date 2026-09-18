# David-Chew-HL/qwen38-27b-ap-d01-seed42

## Resumen

`David-Chew-HL/qwen38-27b-ap-d01-seed42` es un checkpoint derivado del modelo `Qwen/Qwen3.8-27B`, publicado por el usuario David-Chew-HL el 18 de septiembre de 2026. Se trata de una build sin censura (uncensored) generada con la herramienta Apostate mediante la ruta denominada "diode", que aplica una técnica de abliteración direccional condicional sobre el modelo base. El resultado no es un adaptador ni un finetune con hooks en tiempo de ejecución, sino un checkpoint estándar de Transformers listo para cargar con `AutoModelForCausalLM`.

El modelo tiene 26.895.998.464 parámetros (unos 26,9 mil millones) almacenados en bfloat16, lo que ocupa aproximadamente 53,8 GB en el repositorio. La edición afecta a 35 de las 64 capas del modelo base: en cada una de esas capas se reconvierte una neurona de MLP en un restador de rechazo con puerta (gated refusal subtractor), que elimina la dirección residual de rechazo únicamente cuando un detector calibrado con entradas benignas supera un umbral. Según la model card, las entradas benignas conservan los pesos originales.

La relevancia de esta ficha es fundamentalmente metodológica: documenta un caso de abliteración condicional empaquetada como checkpoint plano, sin capa de enrutado en inferencia. No obstante, la información pública es muy escasa: no se declaran licencia, idiomas, longitud de contexto, pipeline ni resultados de evaluación, y el repositorio acumula 10 descargas y 0 "likes", por lo que no existe validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de texto (etiqueta del repo `qwen3_5_text`); 64 capas según el informe de edición. Detalle interno no disponible |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | no disponible (no hay indicios de arquitectura MoE en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors en bfloat16 y no se han publicado conversiones a 8 bits, 4 bits ni GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint bfloat16 estándar de Transformers) |

Datos adicionales de identificación: autor `David-Chew-HL`, tamaño del repositorio 53,8 GB, 10 descargas, 0 likes, creado el 2026-09-18 y actualizado el 2026-09-18. Modelo base declarado: `Qwen/Qwen3.8-27B`. Método: Apostate diode (abliteración direccional condicional), 35 de 64 capas editadas, fuerza 6,0, objetivo de disparo benigno 0,05.

## Arquitectura y entrenamiento

No se describe la arquitectura del modelo base en la información disponible, más allá de la etiqueta `qwen3_5_text` y del número de capas (64), que indica un transformer decoder-only de texto. Tampoco hay datos de entrenamiento: no se especifican tokens, composición del dataset, fases de RLHF/DPO ni proceso de post-entrenamiento, ni para el base ni para este derivado.

La innovación técnica documentada es la intervención de abliteración. El método Apostate, en su ruta "diode", reconvierte una neurona de MLP por capa en un restador de rechazo con puerta: la resta de la dirección residual de rechazo solo se activa cuando un detector calibrado con entradas benignas supera un umbral (objetivo de disparo benigno 0,05, fuerza 6,0). Se editaron 35 de las 64 capas. El resultado se entrega como checkpoint plano en bfloat16, sin hook en tiempo de ejecución, sin adaptador, sin finetune y sin router. La model card indica que las métricas de "delivery" y divergencia KL se miden por separado con `apostate test`, no durante el proceso de horneado, y que el archivo `diode_report.json` registra los ajustes de la edición; esos resultados no se publican en la información disponible.

## Capacidades

- Generación de texto: capacidades no verificadas. Por arquitectura (decoder-only de texto derivado de `Qwen/Qwen3.8-27B`) se asume generación de texto, pero no hay evaluación publicada.
- Razonamiento, matemáticas y código: no disponible; no hay benchmarks ni ejemplos en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.
- Capacidad diferencial documentada: comportamiento sin censura, es decir, el modelo "responderá a peticiones dañinas y peligrosas" según la advertencia del autor. La edición busca que la supresión del rechazo se active solo ante entradas detectadas, preservando el comportamiento original en entradas benignas, si bien no se publican métricas que lo confirmen.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo permite generar respuestas que un modelo alineado rechazaría, lo que resulta útil para construir conjuntos de pruebas adversarias y medir la robustez de filtros y clasificadores de contenido en un entorno controlado.
- Investigación sobre alineación y abliteración: sirve como caso de estudio reproducible de abliteración condicional (35 de 64 capas, fuerza 6,0, umbral 0,05) frente a métodos de abliteración incondicional, comparando preservación de capacidades en entradas benignas.
- Auditoría de mecanismos de rechazo: al ser un checkpoint plano sin hooks, permite inspeccionar pesos y activaciones con herramientas estándar, sin necesidad de replicar infraestructura de enrutado en tiempo de inferencia.
- Generación de texto en entornos internos y controlados: con 26,9 mil millones de parámetros y bfloat16, puede desplegarse en infraestructura propia para tareas de redacción o resumen cuando no se requiere cumplimiento estricto de políticas de contenido; requiere revisión legal previa por la ausencia de licencia declarada.
- Punto de partida para finetuning posterior: al ser un checkpoint estándar de Transformers, puede servir de base para ajuste con datos propios en dominios donde el filtrado de rechazo del modelo base resulta un obstáculo (por ejemplo, literatura, seguridad ofensiva autorizada o investigación biomédica sensible).
- Evaluación comparativa de técnicas de desalineación: útil como brazo experimental en estudios que comparen ediciones por semilla (el nombre del repositorio sugiere una variante `d01-seed42` dentro de una serie) midiendo consistencia entre semillas.
- Pruebas de estrés de sistemas de moderación en producción: integrarlo como generador adversario en pipelines de evaluación continua de clasificadores, siempre en sandbox y con registro de uso.

No se recomienda su uso en aplicaciones orientadas al público general ni en flujos donde la responsabilidad legal o el cumplimiento normativo sean requisitos, dada la ausencia de licencia y de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni para este modelo ni para el modelo base `Qwen/Qwen3.8-27B` en la documentación consultada. La model card menciona que Apostate mide por separado métricas de "delivery" y divergencia KL mediante `apostate test`, pero no se incluyen sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los pesos ocupan unos 53,8 GB (26,9 mil millones de parámetros a 2 bytes). Sumando caché KV y activaciones, se necesitan aproximadamente 60-70 GB de VRAM para una ventana de contexto moderada; el consumo crece de forma lineal con la longitud de contexto.
- VRAM estimada en 8 bits: en torno a 27 GB solo de pesos, más caché KV; requiere aproximadamente 35-40 GB.
- VRAM estimada en 4 bits: entre 14 y 15 GB solo de pesos, más caché KV; alrededor de 18-22 GB en total. Estimación orientativa, no confirmada por el autor.
- GPU recomendadas: para bfloat16, A100 80 GB, H100 80 GB o H200; también 2×A100 40 GB con paralelismo de tensor. Para 8 bits, 1×A100 40 GB o 2×RTX 4090. Para 4 bits, 1×RTX 4090, RTX 3090 o L40S de 24 GB.
- ¿Cabe en GPU de consumo? En bfloat16 no cabe en ninguna GPU de consumo actual (la RTX 4090 tiene 24 GB). En 4 bits cabe con holgura en RTX 3090/4090 de 24 GB y, con margen ajustado, en tarjetas de 16 GB reduciendo contexto.
- Opciones de despliegue: se indica uso nativo con Transformers (`from_pretrained(..., device_map="auto")`). Para vLLM o TGI no hay confirmación oficial, aunque al ser un checkpoint estándar del linaje Qwen es plausible su compatibilidad; no se ha publicado ninguna versión GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia no verificada.
- Latencia y throughput: no disponible. No se han publicado medidas de tokens por segundo ni latencias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `David-Chew-HL/qwen38-27b-ap-d01-seed42` (este modelo) | 26,9 mil millones | no disponible | sin benchmarks publicados | no disponible | safetensors en HF, 10 descargas |
| `Qwen/Qwen3.8-27B` (base declarado) | no disponible | no disponible | sin datos en la información consultada | no disponible | referenciado en la model card |
| Otras builds no censuradas de la misma familia | no disponible | no disponible | no disponible | no disponible | no identificadas en la búsqueda web |

No se han identificado en la información disponible alternativas comparables de forma fiable, ni dentro del ecosistema Apostate ni en otras familias de modelos abliterados, con datos verificables de parámetros, contexto o licencia.

## Limitaciones y advertencias

- Modelo explícitamente sin censura: la model card advierte de que responderá a peticiones dañinas y peligrosas, y que la responsabilidad del uso recae en el usuario. No debe desplegarse en aplicaciones de cara al público sin capas adicionales de moderación.
- Ausencia de licencia declarada: no puede asumirse permiso de uso comercial. Cualquier despliegue en producción requiere aclarar previamente la licencia de este repositorio y la del modelo base `Qwen/Qwen3.8-27B`.
- Sin evaluaciones publicadas: no hay benchmarks, ni mediciones de divergencia KL, ni resultados de "delivery" pese a que el método los contempla. No es posible cuantificar cuánto se degradan las capacidades generales tras editar 35 de 64 capas.
- Riesgo de alucinación: no evaluado. Sin datos de evaluación no puede caracterizarse la tasa de alucinación ni su comportamiento por dominio.
- Umbral de disparo calibrado (0,05) no auditado: el restador de rechazo se activa según un detector entrenado con entradas benignas. Son esperables falsos positivos y falsos negativos, con comportamiento dependiente de la formulación exacta del prompt.
- Sesgos: no evaluados ni documentados. La eliminación de la dirección de rechazo puede alterar de forma desigual el comportamiento sobre determinados colectivos o temas sensibles.
- Idiomas y contexto: no declarados. No puede planificarse un despliegue multilingüe ni de contexto largo sin verificación empírica previa.
- Madurez del artefacto: 10 descargas y 0 "likes" en la fecha de consulta, en un repositorio creado y actualizado el mismo día. Se desaconseja su uso en producción sin una evaluación propia exhaustiva.
- Formato único en bfloat16: no hay cuantizaciones publicadas, lo que encarece el despliegue (se necesitan aceleradores de 80 GB o paralelismo multi-GPU) y obliga a convertir manualmente si se desea ejecutar en hardware de consumo.
- Trazabilidad limitada del linaje: no se detalla el proceso de conversión, la revisión del checkpoint ni la validación de que los pesos restantes coinciden con el modelo base fuera de las capas editadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/David-Chew-HL/qwen38-27b-ap-d01-seed42
- Modelo base declarado en la model card: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Apostate (método de abliteración utilizado): https://github.com/heterodoxin/apostate

Nota: los resultados de búsqueda web proporcionados contenían únicamente páginas enciclopédicas y cinematográficas sobre el nombre "David" (Wikipedia en francés e inglés, AlloCiné), sin relación con el modelo. No se han encontrado papers, blogs técnicos, demos ni repositorios adicionales asociados a este checkpoint en la información disponible.
