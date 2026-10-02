# bcdennis/hcd-tinystories-hier-aux-l001

## Resumen

`bcdennis/hcd-tinystories-hier-aux-l001` es un checkpoint de investigación publicado en HuggingFace por el usuario bcdennis bajo el identificador de brazo experimental `hcd-aux`. Se trata de un modelo entrenado desde cero (*from-scratch*) sobre el corpus TinyStories (`roneneldan/TinyStories`, 200.000 historias, tokenizador GPT-2) y etiquetado por su autor con la familia `hierarchical-concept-diffusion`. No es, por tanto, un modelo de propósito general ni un producto listo para producción: es un artefacto de experimentación con 0 descargas y 0 likes en el momento de redactar esta ficha.

El dato técnico central es su tamaño: 45.166.464 parámetros (aproximadamente 45,2 millones), entrenado durante 12.000 pasos con longitud de secuencia 256 y batch de 32, con AdamW (lr 0,0001, weight decay 0,1, scheduler coseno y 200 pasos de warmup). El autor reporta una pérdida final de validación (LM loss) de 2,3521, que es el único dato de rendimiento disponible.

Su relevancia es acotada y de carácter académico: encaja en la línea de trabajos que exploran cuánta coherencia lingüística se puede obtener con modelos de decenas de millones de parámetros y presupuestos de cómputo mínimos, y en este caso concreto añade una posible variante arquitectónica (difusión sobre conceptos jerárquicos) cuya implementación no se describe en la model card. La licencia no está declarada, lo que condiciona cualquier uso más allá de la inspección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; la model card solo etiqueta el entrenamiento como `hierarchical-concept-diffusion` y el modelo como `from-scratch`, sin describir la topología de red |
| Parametros totales | 45.166.464 |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento declarada: `seq_len: 256`) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas ni GGUF) |
| Idiomas soportados | no disponible; el corpus TinyStories está íntegramente en inglés, pero la model card no declara idiomas |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,3 GB, sin detalle del formato de checkpoint) |
| Tokenizador | GPT-2 |
| Dataset de entrenamiento | roneneldan/TinyStories, `train[:200k]` historias |
| Pasos de entrenamiento | 12.000 |
| Optimizador | AdamW, lr 0,0001, weight decay 0,1, scheduler coseno, warmup 200 |
| Batch / secuencia | 32 / 256 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura de red. El único indicio es la etiqueta `hierarchical-concept-diffusion`, que sugiere un esquema de generación basado en difusión sobre representaciones conceptuales organizadas jerárquicamente, en lugar de (o además de) la decodificación autorregresiva clásica. Esta interpretación no puede confirmarse con la información disponible: el autor reporta la métrica como *LM loss*, lo que indica que el entrenamiento se evalúa con un objetivo de modelado de lenguaje, pero no se especifica si el modelo muestrea mediante difusión, mediante decodificación autoregresiva o mediante un híbrido. Cualquier afirmación más detallada sobre la topología (número de capas, dimensiones, tipo de atención, presencia de módulos de difusión) sería especulativa.

En cuanto a los datos, el entrenamiento usa exclusivamente las primeras 200.000 historias del dataset TinyStories de Eldan y Li, tokenizadas con el tokenizador GPT-2 y con secuencias truncadas o empaquetadas a 256 tokens. El optimizador es AdamW con learning rate 1e-4, weight decay 0,1 y scheduler coseno precedido de 200 pasos de warmup, durante 12.000 pasos. No se menciona ningún uso de RLHF, DPO, SFT posterior ni filtrado de datos más allá del propio corpus. El resultado reportado es una pérdida de validación de 2,3521, un valor consistente con modelos pequeños entrenados sobre TinyStories, pero que no es directamente comparable con métricas de benchmarks estándar.

## Capacidades

- Generación de texto narrativo corto en el dominio de TinyStories: cuentos infantiles simples, con vocabulario y estructuras gramaticales básicas, presumiblemente en inglés (el corpus lo está; la model card no declara idiomas).
- Generación limitada a ventanas de 256 tokens: cualquier petición que exceda esa longitud queda truncada o degradada.
- Modelado de lenguaje a nivel de token: al reportarse una *LM loss*, el modelo está entrenado para predecir el siguiente token, lo que en principio permite muestreo autoregresivo, aunque no se confirma el procedimiento de decodificación.
- No hay evidencia de soporte de *tool calling* ni de *function calling*.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, planificación o uso de memoria externa.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito (*thinking mode*).
- Multilingüismo: no disponible; el corpus de entrenamiento es monolingüe en inglés.
- No se documenta ajuste por instrucciones (*instruction tuning*), por lo que no cabe esperar comportamiento conversacional fiable.

## Casos de uso

- Estudio de referencia sobre modelos de lenguaje a pequeña escala: sirve para reproducir y comparar curvas de pérdida de validación en el régimen de 45 millones de parámetros con presupuesto de cómputo muy reducido (12.000 pasos, secuencias de 256 tokens).
- Investigación sobre esquemas de difusión aplicados a lenguaje: la etiqueta `hierarchical-concept-diffusion` lo convierte en un candidato para inspeccionar cómo se comporta un objetivo de difusión sobre un corpus controlado y sintácticamente simple como TinyStories.
- Generación de cuentos infantiles de dominio restringido: con 256 tokens de contexto y entrenamiento sobre 200.000 historias, puede producir textos cortos de estructura predecible, útiles como banco de pruebas de plantillas narrativas, siempre que se acepte su falta de licencia declarada.
- Generación de datos sintéticos de baja calidad para pruebas de pipelines: útil para validar tokenizadores, capas de post-procesado, filtros de contenido o medidores de perplejidad sin depender de APIs externas.
- Despliegue en hardware mínimo: con ~45 millones de parámetros cabe en CPU, en una Raspberry Pi o en un microcontrolador de gama alta con memoria suficiente, lo que permite experimentar con inferencia local en entornos sin GPU.
- Docencia y formación: ejemplo reproducible de un ciclo completo de entrenamiento desde cero (dataset, tokenizador, optimizador, validación) para cursos de aprendizaje automático.
- Base para *fine-tuning* experimental: al ser un modelo pequeño, permite probar variantes de ajuste (LoRA, adaptadores) en minutos sobre GPU de consumo, con la salvedad de la licencia no declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la pérdida final de validación del modelado de lenguaje:

| Metrica | Valor | Contexto |
|---|---|---|
| Val LM loss (final) | 2,3521 | 12.000 pasos, seq_len 256, batch 32, TinyStories `train[:200k]` |
| MMLU | no disponible | no evaluado en la informacion proporcionada |
| HumanEval | no disponible | no evaluado en la informacion proporcionada |
| GSM8K | no disponible | no evaluado en la informacion proporcionada |

La pérdida de validación no es comparable con métricas de benchmarks y depende del tokenizador y del dataset, por lo que no debe usarse como indicador de calidad absoluta frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 45.166.464 parámetros): en fp32, aproximadamente 181 MB solo de pesos; en fp16/bf16, alrededor de 90 MB; en int8, unos 45 MB; en int4, unos 23 MB. Estas cifras son estimaciones aritméticas a partir del recuento de parámetros, no datos publicados por el autor.
- Caché KV: con una ventana de 256 tokens, el consumo adicional es despreciable en cualquier configuración razonable.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente en la práctica (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100). El modelo no aprovechará aceleradores de gama alta por su tamaño; el cuello de botella será el lanzamiento de kernels, no la memoria ni el cómputo.
- Cabe en GPU de consumo: sí, en todas las generaciones recientes e incluso en iGPU con memoria compartida. También es viable en CPU pura y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: no disponible. No se publican pesos en GGUF ni cuantizaciones, y el soporte en vLLM, llama.cpp, Ollama o TGI depende de que la arquitectura (no documentada) esté implementada en esos motores. Al estar entrenado "from scratch" con una etiqueta de difusión jerárquica, es probable que requiera código propio del autor.
- Latencia y throughput estimados: no disponible. No se publican mediciones, y cualquier cifra dependería del procedimiento de decodificación, que la model card no describe.

## Comparativa con modelos similares

La comparación se establece con los modelos de la familia TinyStories (Eldan y Li, 2023) y sus reproducciones, que es la categoría natural de este checkpoint. No existen datos de benchmarks comparables para el modelo evaluado, por lo que la comparación se limita a características objetivas.

| Modelo | Parametros | Contexto | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bcdennis/hcd-tinystories-hier-aux-l001 | 45,2 M | 256 tokens | TinyStories `train[:200k]` | no disponible | repo HuggingFace de 0,3 GB, 0 descargas |
| TinyStories (Eldan y Li, 2023), rango publicado | 1 M - 33 M segun el resumen del trabajo | no disponible en la informacion proporcionada | TinyStories | consultar el paper y el repositorio originales | modelos y dataset publicados en HuggingFace |
| Reproducciones independientes de TinyStories (p. ej. TinyStoriesv1) | 10 M - 33 M segun el resumen del repositorio | no disponible | TinyStories | no disponible | repositorio GitHub con scripts de entrenamiento |

Datos de rendimiento comparativo: no disponible. El autor del modelo evaluado no publica MMLU, HumanEval ni GSM8K, y los resultados de perplejidad entre implementaciones no son comparables si difieren el tokenizador, el empaquetado de secuencias o el subconjunto de validación.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay evaluación de sesgos ni de toxicidad. TinyStories es un corpus sintético de cuentos infantiles, por lo que el modelo reproducirá sus plantillas y estereotipos narrativos, no la distribución del lenguaje real.
- Riesgo de alucinación: alto en cualquier tarea fuera del dominio de cuentos simples. El modelo no tiene conocimiento factual verificable y su entrenamiento se limita a narrativa infantil sintética.
- Limitación de contexto severa: 256 tokens. No admite conversaciones multi-turno largas, documentos ni resúmenes extensos.
- Idioma: no declarado oficialmente; el corpus es monolingüe en inglés. No cabe esperar generación fiable en castellano.
- Sin ajuste por instrucciones: no se documenta SFT, RLHF ni DPO, por lo que no responderá de forma fiable a prompts en formato instrucción.
- Licencia no declarada: la ausencia de licencia implica, en términos prácticos, ausencia de permiso explícito de uso comercial o de redistribución. No debe integrarse en productos sin aclarar antes los términos con el autor.
- Arquitectura no documentada: la etiqueta `hierarchical-concept-diffusion` no viene acompañada de descripción técnica, paper ni código. Reproducir el modelo o cargarlo en motores estándar puede requerir ingeniería inversa.
- Madurez: 0 descargas y 0 likes, versión creada el 1 de octubre de 2026 y actualizada el 2 de octubre de 2026. Es un experimento reciente y sin validación externa.
- Advertencia para producción: no usar como componente crítico en sistemas de atención al cliente, generación de código, agentes o cualquier flujo donde el fallo silencioso tenga consecuencias. Su valor es exclusivamente de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcdennis/hcd-tinystories-hier-aux-l001
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Modelos entrenados sobre el dataset TinyStories (explorador de HuggingFace): https://huggingface.co/models?dataset=dataset:roneneldan/TinyStories
- Reproducción con scripts de entrenamiento (TinyStoriesv1): https://github.com/ihebgafsi/TinyStoriesv1
- Paper de referencia del dataset y de la familia TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
