# chutesai/parallax-8b-lambda

## Resumen

Parallax 8B lambda es un checkpoint de investigación de un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por chutesai. Se trata de un artefacto intermedio de una ejecución de entrenamiento en curso, publicada para que el proceso pueda seguirse e inspeccionarse; no es un modelo acabado ni está pensado para producción. El modelo tiene aproximadamente 7,8B parámetros totales y unos 1,25B parámetros activos por token, con pesos de expertos ternarios (-1, 0, +1) y escalas por fila.

La relevancia técnica del proyecto reside en su método de entrenamiento: el tronco denso se sincroniza mediante un esquema DiLoCo desacoplado a través de internet público, y los expertos enrutados se entrenan con adaptadores de bajo rango en las GPU que los utilizan. La flota de entrenamiento está formada por 26 máquinas con 208 GPU RTX 5090 repartidas en varios países, sin conexiones directas entre hosts.

Se publican exports periódicos (aproximadamente uno por hora) bajo la carpeta `exports/`, cada uno de unos 2,48 GB, nombrados según los tokens de entrenamiento y el paso de flota. La ejecución está planificada como una sola pasada de unos 973B tokens; el export más reciente disponible en la model card corresponde a 103,2B tokens. El modelo es un base model: no está ajustado con instrucciones, ni para chat, ni con técnicas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE). 64 capas: 18 recurrentes gated delta-rule (GDN2), 8 de atención de ventana deslizante (ventana 2048), 6 de atención dispersa y 32 de mezcla de expertos |
| Parametros totales | ~7,8B |
| Parametros activos | ~1,25B por token |
| Longitud de contexto | 4096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | Pesos de expertos en ternario (-1, 0, +1) con escalas por fila; como máximo dos pares distintos de cero en cada grupo de ocho. No se documentan otros formatos de cuantización |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card no especifica el formato; los exports se distribuyen como carpetas de aproximadamente 2,48 GB cada una) |

Otros parámetros técnicos declarados: 4096 expertos enrutados (128 por capa MoE), 12 expertos enrutados más 1 compartido por token; ancho `d_model` de 1152; activación de expertos ReLU²; tokenizador Llama 3 con vocabulario ampliado a 128.384 entradas; embeddings de entrada y salida atados; escala de logits de salida aprendible y limitada a 3,0.

## Arquitectura y entrenamiento

La arquitectura combina atención y recurrencia en un tronco de 64 capas. Dieciocho capas usan regla delta con compuerta (GDN2) de tipo recurrente, ocho emplean atención de ventana deslizante de 2048 tokens, seis usan atención dispersa y treinta y dos son capas de mezcla de expertos. Cada capa MoE dispone de 128 expertos enrutados, y por token se activan 12 expertos enrutados más uno compartido, sobre un total de 4096 expertos. Los pesos de los expertos son ternarios, con escalas por fila y una restricción de dispersión que limita a dos los pares distintos de cero en cada grupo de ocho valores.

El entrenamiento se apoya en una flota de 26 máquinas con 208 GPU RTX 5090 distribuidas geográficamente y sin conexión directa entre hosts. El tronco denso se sincroniza con un esquema DiLoCo desacoplado sobre internet público; los expertos enrutados se entrenan mediante adaptadores de bajo rango en las GPU que los usan, y las actualizaciones de los adaptadores se integran en maestros de precisión completa que publican nuevas versiones ternarias. Los datos provienen de siete fuentes que suman aproximadamente 1,09T tokens: dos mezclas generales de web, documentos, matemáticas y código (aproximadamente el 78% de los tokens), un conjunto web adicional, dos conjuntos de matemáticas, un conjunto centrado en conocimiento y un conjunto de libros. En torno a los 899,6B tokens se produce un cambio a otras dos fuentes sin modificar la tasa de aprendizaje. La ejecución está planificada como una única pasada de unos 973B tokens.

La tasa de aprendizaje sigue un calentamiento lineal de 0 a 6e-4 durante los primeros 19,66B tokens, se mantiene en 6e-4 hasta los 400B tokens, baja a 3e-4 hasta los 700B y a 1,5e-4 hasta el final, sin decaimiento final. El lote es de 10 micro-lotes de acumulación de gradiente por paso (unos 8,5M tokens por paso de flota) durante los primeros 100B tokens aproximadamente, y de 20 micro-lotes (unos 17M tokens por paso) después. No se aplicaron fases de RLHF ni DPO: es un modelo base sin ajuste de instrucciones.

## Capacidades

- Generación de texto continuando una secuencia dada; no sigue instrucciones, ya que no ha recibido ajuste de instrucciones ni de chat.
- Modelado de lenguaje sobre mezclas de web, documentos, matemáticas, código, conocimiento y libros, correspondientes a las siete fuentes del entrenamiento.
- Razonamiento y matemáticas en fase de adquisición temprana: los conjuntos de matemáticas forman parte de la mezcla de datos, pero el entrenamiento está en torno al 10% del total planificado.
- Generación de código dentro de la mezcla de datos, sin datos publicados sobre su calidad.
- Procesamiento de contexto de hasta 4096 tokens.
- Capacidad multilingüe limitada al inglés según la model card.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado para agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.
- No está ajustado con técnicas de seguridad ni de alineación.

## Casos de uso

- Investigación sobre entrenamiento descentralizado: el modelo permite inspeccionar cómo evoluciona el tronco denso sincronizado con DiLoCo sobre internet público, comparando exports sucesivos para estudiar la estabilidad del esquema.
- Estudio de cuantización ternaria en mezclas de expertos: los pesos ternarios con escalas por fila y la restricción de dos pares no nulos por grupo de ocho constituyen un caso práctico para investigar kernels y pérdida de calidad asociada a pesos de muy baja precisión.
- Análisis de la evolución del preentrenamiento: la serie de exports (de 59B a 103,2B tokens en la tabla publicada) permite trazar curvas de pérdida y de métricas macro a lo largo del tiempo, teniendo en cuenta que la calidad entre exports no es monótona.
- Punto de partida para ajuste fino supervisado: al ser un modelo base con licencia MIT, puede emplearse como inicialización para experimentos de ajuste con instrucciones o de adaptación a dominio en inglés.
- Experimentación con arquitecturas híbridas atención-recurrencia: las 18 capas GDN2, las 8 de ventana deslizante y las 6 de atención dispersa permiten estudiar el comportamiento de una mezcla heterogénea de mecanismos de secuencia frente a un transformer homogéneo.
- Investigación sobre mezclas de datos: el cambio de fuentes a los 899,6B tokens y la composición declarada de las siete fuentes permiten diseñar réplicas controladas del efecto de la mezcla sobre el rendimiento.
- Reproducción y depuración de infraestructura distribuida: la topología de 26 máquinas y 208 GPU RTX 5090 sin conexión directa serve como referencia para validar esquemas de sincronización de baja frecuencia en flotas heterogéneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla de exports de la model card reserva columnas para `val_mix` (nats/token) y para los agregados macro de 0-shot y 5-shot, pero todas las celdas correspondientes a los exports publicados aparecen vacías.

## Requisitos de hardware

- Pesos por export: aproximadamente 2,48 GB por carpeta en los exports de 59B a 103,2B tokens, lo que corresponde a los ~7,8B parámetros en formato ternario con escalas.
- VRAM estimada para inferencia: no disponible de forma oficial. Con pesos de ~2,48 GB, un despliegue con contexto completo de 4096 tokens y caché de clave-valor requeriría en la práctica del orden de 4 a 8 GB de VRAM, pero esta cifra es una estimación y no está confirmada por el autor.
- GPU recomendadas: no disponible. No hay datos publicados de latencia ni de throughput por GPU.
- GPU de consumo: el tamaño de los pesos sugiere que cabría en GPU de consumo con suficiente memoria, pero no existe confirmación de compatibilidad ni kernels publicados para el formato ternario.
- Opciones de despliegue: no disponible. La model card no menciona soporte para vLLM, llama.cpp, Ollama, TGI ni ninguna otra herramienta; el formato ternario con escalas por fila implica que se necesita una implementación específica.
- Latencia y throughput estimados: no disponible.
- Hardware usado para el entrenamiento (como referencia de la infraestructura del proyecto): 26 máquinas con 208 GPU RTX 5090.

## Comparativa con modelos similares

Datos de los modelos comparados tomados de sus especificaciones públicas; los del modelo analizado provienen de la model card.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Parallax 8B lambda | ~7,8B | ~1,25B | 4096 | MIT | Base model, pesos ternarios, checkpoint de investigación en curso |
| OLMoE-1B-7B | ~6,9B | ~1,3B | 4096 | Apache 2.0 | MoE de 64 expertos, 1 experto activo por token, modelo abierto con datos y recetas publicados |
| Qwen3-30B-A3B | ~30B | ~3B | 32.768 | Apache 2.0 | MoE de mayor tamaño, con versiones base e instruidas |
| Llama 3.1 8B | ~8B | 8B (denso) | 128.000 | Licencia comunitaria de Llama 3.1 | Denso, con ajuste de instrucciones y contexto muy superior |

La comparación directa es limitada: Parallax 8B lambda es un checkpoint intermedio sin ajuste y con contexto de 4096 tokens, mientras que los modelos de referencia son artefactos finales con contexto mucho mayor y soporte de despliegue ampliamente documentado. No hay datos de benchmarks disponibles para el modelo analizado, por lo que no es posible comparar rendimiento.

## Limitaciones y advertencias

- Es un checkpoint de mitad de entrenamiento: cada export es una instantánea de una ejecución sin terminar y la calidad entre exports no es monótona. Los exports posteriores probablemente difieran de los actuales.
- No está ajustado con instrucciones ni para chat: continuará el texto en lugar de seguir instrucciones, lo que lo hace inadecuado para aplicaciones conversacionales directas.
- No ha recibido ajuste de seguridad, por lo que puede generar contenido inapropiado, sesgado o dañino sin ninguna mitigación incorporada.
- Riesgo de alucinación elevado: al ser un modelo base entrenado sobre datos web y de libros, puede producir afirmaciones plausibles pero incorrectas.
- Contexto máximo de 4096 tokens, muy inferior al de los modelos actuales de su categoría.
- Cobertura de idiomas limitada al inglés según la model card.
- Está declarado explícitamente como artefacto de investigación no destinado a uso en producción.
- La licencia MIT permite uso comercial, pero la ausencia de soporte en frameworks de inferencia conocidos y la falta de publicación de los formatos de pesos dificultan un despliegue real.
- Sobre los sesgos concretos del modelo no hay información publicada.
- Los resultados de la búsqueda web no aportan información relevante sobre el modelo: los enlaces devueltos no guardan relación con chutesai ni con Parallax.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chutesai/parallax-8b-lambda
- Export más reciente (103B-tokens_step11842): https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/103B-tokens_step11842
- Export 99B-tokens_step11533: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/99B-tokens_step11533
- Export 95B-tokens_step11160: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/95B-tokens_step11160
- Export 92B-tokens_step10766: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/92B-tokens_step10766
- Export 89B-tokens_step10388: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/89B-tokens_step10388
- Export 85B-tokens_step9986: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/85B-tokens_step9986
- Export 82B-tokens_step9591: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/82B-tokens_step9591
- Export 79B-tokens_step9195: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/79B-tokens_step9195
- Export 76B-tokens_step8835: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/76B-tokens_step8835
- Export 72B-tokens_step8443: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/72B-tokens_step8443
- Export 69B-tokens_step8039: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/69B-tokens_step8039
- Export 66B-tokens_step7652: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/66B-tokens_step7652
- Export 62B-tokens_step7275: https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/62B-tokens_step7275
- Panel de entrenamiento en vivo: https://parallax.chutes.ai
- Informe técnico: mencionado en la model card, sin enlace disponible en la información proporcionada.
