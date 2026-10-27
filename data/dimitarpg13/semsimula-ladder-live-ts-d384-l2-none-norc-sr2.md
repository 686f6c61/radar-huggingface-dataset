# dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2

## Resumen

`semsimula-ladder-live-ts-d384-l2-none-norc-sr2` es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la familia SemSimula, una línea de trabajo que sustituye el mecanismo de atención por dinámica conservativa: el modelo se interpreta como una partícula que se mueve en un potencial escalar y cuya evolución se integra con mecánica lagrangiana. Este checkpoint concreto es la mitad de segundo orden (SR2) del par emparejado sobre TinyStories, con dimensión de modelo 384 y dos capas según la nomenclatura del identificador, y constituye el experimento controlado con el que el autor mide si la dinámica de segundo orden (velocidad e inercia) aporta algo frente a una formulación de primer orden entrenada con idéntico presupuesto.

El problema que aborda es de arquitectura y metodología, no de producto: se pregunta si el núcleo conservativo necesita segundo orden o si basta una dinámica de primer orden, manteniendo constantes el resto de factores. Para ello entrena ambos brazos con exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre TinyStories, con un pre-registro que fijaba Delta_TS dentro de ±3% y una comprobación de asentamiento que obligó a extender ambos brazos por igual 3.000 pasos adicionales. El resultado declarado es una perplejidad de validación de 5,16 (media de las tres últimas evaluaciones a bloque 512), que queda un 0,6% por detrás del primer orden con reinicio de velocidad entre capas (5,13) y un 2,3% por delante del primer orden verdadero sin velocidad (5,28).

Su relevancia ahora es acotada y hay que leerla en clave de investigación reproducible: no compite con modelos de propósito general, sino que aporta un punto de datos pre-registrado sobre una arquitectura no-transformer, sin atención y con memoria constante en inferencia. Es útil para quien estudie modelos basados en energía, integradores simplécticos aplicados a LM o ablaciones de mecanismos, no para quien busque un generador de texto desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención; modelo de lenguaje conservativo con potencial escalar y dinámica de segundo orden (SR2: ecuación de Newton amortiguada, modos rígidos integrados como osciladores amortiguados exactos, velocidad transferida entre capas). Integración estilo BAOAB, formulación CfC, geometría riemanniana (métrica de Jacobi) |
| Parametros totales | No disponible (el identificador indica d384-l2: dimensión 384 y 2 capas; el repositorio ocupa 0,6 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; evaluación realizada con bloques de 512 tokens |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`library_name: pytorch`); no se documenta safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la tercera generación de la línea SemSimula ("Gen 3, first vs second order") y es la variante de segundo orden del par sobre TinyStories. En lugar de atención, el estado se propaga mediante una dinámica conservativa derivada de un potencial escalar: la variante SR2 usa la ecuación de Newton amortiguada, integra los modos rígidos como osciladores amortiguados exactos y transfiere la velocidad de una capa a la siguiente. La formulación se apoya en herramientas que el autor etiqueta explícitamente: integrador BAOAB, potencial gaussiano anisotrópico y métrica de Jacobi dentro de un tratamiento riemanniano (geodésicas riemannianas). El resultado práctico que se deriva de esta construcción es una inferencia con memoria constante, sin el crecimiento cuadrático del coste asociado a la atención.

El entrenamiento se realizó sobre TinyStories con exactamente 315.392.000 tokens, distribuidos en 19.250 pasos de 32 secuencias × 512 tokens. Los primeros 16.250 pasos siguieron el schedule WSD (warmup-stable-decay) de la escalera de experimentos y los 3.000 últimos se ejecutaron al learning rate suelo: la comprobación de asentamiento falló a 16.250 pasos y se aplicó la extensión de forma simétrica a ambos brazos del par para no romper la comparación. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por preferencias. El autor reporta métricas de salud de la ejecución: cero activaciones del watchdog, cero capturas de picos y monitor de fuga SCAF en estado CLEAN en todas las auditorías, con un "impuesto de fuga" máximo de 3,6e-7 nats.

El experimento está pre-registrado: se estableció Delta_TS dentro de ±3% con una predicción del 55% de probabilidad, y el resultado (−0,6%) se marca como HIT. La comparación se completa con variantes que añaden pozos de modo Poisson, donde el primer orden llega a igualar o superar ligeramente al segundo (por ejemplo 4,96 frente a 4,99 en TinyStories con 2 pozos).

## Capacidades

- Generación de texto en inglés a nivel de frases y micro-relatos, en el registro y vocabulario de TinyStories (narrativa infantil simple).
- Modelado de lenguaje autorregresivo con evaluación estándar de perplejidad sobre tokens de validación de TinyStories.
- Inferencia con memoria constante: el coste de estado no crece con la longitud de la secuencia, a diferencia de la atención.
- Dinámica de segundo orden con velocidad transferida entre capas, que el autor identifica como el elemento que aporta la rotación de modos rígidos dentro de cada capa.
- No soporta tool calling ni function calling: no hay evidencia de ello en la información disponible.
- No soporta comportamiento de agente ni razonamiento multi-paso: sin datos al respecto y con un tamaño y corpus que lo hacen inviable.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- Multilingüe: no; únicamente inglés.
- Valor como artefacto de investigación: ablación controlada y reproducible de un mecanismo arquitectónico bajo pre-registro.

## Casos de uso

- Investigación en arquitecturas no-transformer: sirve como brazo de segundo orden en una comparación emparejada contra FO-TS y FO-b-TS, con presupuesto de tokens idéntico y pre-registro público, lo que permite reproducir o refutar el resultado del autor.
- Estudio de modelos basados en energía y potenciales escalares: el checkpoint permite inspeccionar cómo se comporta la dinámica conservativa en un corpus controlado como TinyStories antes de escalar a OpenWebText.
- Docencia y divulgación: su tamaño reducido (repositorio de 0,6 GB) y su naturaleza no-transformer lo hacen adecuado para explicar integradores simplécticos, dinámica lagrangiana y geometría riemanniana aplicadas a modelos de lenguaje en un cuaderno o una práctica de laboratorio.
- Prueba de infraestructura (smoke test) de pipelines de inferencia: por su volumen, se puede cargar y ejecutar en cualquier GPU consumer o incluso en CPU para validar scripts de carga, tokenización y generación antes de pasar a modelos grandes.
- Generación de micro-relatos y texto sintético simple en inglés: útil para poblar conjuntos de prueba de juguete o para experimentos de prompting con vocabulario restringido, siempre asumiendo la calidad limitada del corpus de entrenamiento.
- Estudio de eficiencia en inferencia: al operar con memoria constante, permite medir empíricamente cómo evoluciona el coste por token con la longitud de secuencia frente a un transformer de tamaño comparable.
- Reproducción de experimentos pre-registrados: el resultado declarado (perplejidad 5,16, con las tres últimas evaluaciones 5,13 / 5,16 / 5,19) y las condiciones de entrenamiento documentadas facilitan replicaciones y auditorías metodológicas.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor | Notas |
|---|---|---|---|---|
| Text generation | TinyStories (validation) | Perplejidad | 5,16 | Media de las tres últimas evaluaciones a bloque 512 (5,13 / 5,16 / 5,19); mejor valor 5,13 en el paso 18.000; no verificado |

Comparación con los otros brazos del par, según los datos declarados por el autor (perplejidad de validación a bloque 512, TinyStories):

| Modelo | Orden | Perplejidad | Diferencia frente a este modelo |
|---|---|---|---|
| SO-TS (este modelo, SR2) | Segundo | 5,16 | — |
| FO-TS (primer orden, reinicio de velocidad entre capas) | Primero | 5,13 | −0,6% (mejor) |
| FO-b-TS (primer orden verdadero, sin velocidad) | Primero | 5,28 | +2,3% (peor) |
| PM2-TS (con 2 pozos de modo Poisson) | Segundo | 4,99 | −3,3% (mejor) |
| FO-b-PM2-TS (con 2 pozos de modo Poisson) | Primero | 4,96 | −3,9% (mejor) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1-2 GB en precisión completa, a partir del tamaño del repositorio (0,6 GB) y de una dimensión de modelo de 384 con dos capas; no hay medición oficial publicada.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo es holgadamente ejecutable en RTX 3060, RTX 4060, RTX 4090, así como en A100/H100 (en estos últimos, sobredimensionados para esta carga).
- Cabe en GPU consumer: sí, en toda la gama actual, y también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un checkpoint PyTorch con arquitectura propia y sin atención, no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama; requiere el código del autor y ejecución en PyTorch. La memoria constante en inferencia es una propiedad del diseño, no un modo opcional.
- Latencia y throughput: no disponibles. La arquitectura elimina el coste cuadrático de atención, pero no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (TinyStories val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SO-TS, SR2) | No disponible (d384, 2 capas) | No disponible (evaluado a 512) | 5,16 | CC-BY-4.0 | Pesos en HuggingFace, 152 descargas |
| FO-TS (`...-ts-d384-l2-none-norc-sr2-fo`) | No disponible (mismo esqueleto) | No disponible | 5,13 | CC-BY-4.0 | Pesos en HuggingFace |
| FO-b-TS (`...-ts-d384-l2-none-norc-sr2-fob`) | No disponible (mismo esqueleto) | No disponible | 5,28 | CC-BY-4.0 | Pesos en HuggingFace |
| SR2 sobre OpenWebText (`...-owt-d384-l2-none-norc-sr2`) | No disponible | No disponible | 58,32 (OpenWebText) | CC-BY-4.0 | Pesos en HuggingFace |

No se dispone de comparación con modelos transformer de propósito general del mismo orden de tamaño en la información proporcionada; la comparación relevante es interna a la familia SemSimula.

## Limitaciones y advertencias

- Corpus de entrenamiento restringido: TinyStories está diseñado para narrativa infantil, de modo que el vocabulario, la sintaxis y la coherencia del modelo quedan muy por debajo de cualquier LM de propósito general.
- Idioma único: solo inglés; no hay evidencia de comportamiento aceptable en castellano ni en otros idiomas.
- Sin datos de sesgos: no se ha publicado ninguna evaluación de sesgo, toxicidad o seguridad. Un corpus sintético de cuentos infantiles reduce pero no elimina estos riesgos.
- Riesgo de alucinación y de incoherencia a partir de cierta longitud: con 2 capas y este presupuesto de entrenamiento, es esperable deriva y repetición en generaciones largas; no se documenta comportamiento más allá del bloque de evaluación de 512 tokens.
- Longitud de contexto no documentada: la perplejidad se mide a bloque 512, pero no se especifica la ventana máxima soportada ni cómo degrada fuera de ese régimen.
- Métrica no verificada: el campo `verified` del model-index es `false`; las cifras proceden del autor y no de una evaluación independiente.
- Sin ajuste por preferencias: no consta RLHF ni DPO, por lo que no cabe esperar alineación conversacional ni seguimiento fiable de instrucciones.
- No apto para producción: es un artefacto de investigación, sin garantías, sin soporte y sin integración en runtimes de inferencia estándar.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero obliga a citar la autoría y a indicar cambios; conviene revisar los términos exactos antes de cualquier uso derivado.
- Reproducibilidad dependiente del código: al no ser una arquitectura estándar, la carga de pesos exige el implementación del autor; sin ella, el checkpoint no es utilizable.

## Enlaces

- [Model card en HuggingFace](https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2)
- [Colección Gen 3: first vs second order](https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524)
- [Colección Gen 3: CfC, BAOAB y gradientes en vivo (escalera OpenWebText)](https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c)
- [FO-TS: primer orden con reinicio de velocidad entre capas](https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo)
- [FO-b-TS: primer orden verdadero, sin velocidad](https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob)
- [PM2-TS: variante con 2 pozos de modo Poisson](https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2)
- [SR2 sobre OpenWebText](https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2)
- [Dataset TinyStories (roneneldan/TinyStories)](https://huggingface.co/datasets/roneneldan/TinyStories)
- [Listado de modelos de generación de texto en HuggingFace](https://huggingface.co/models?pipeline_tag=text-generation&p=0&sort=modified)
