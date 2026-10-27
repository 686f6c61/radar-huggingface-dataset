# rsj2003/libero-dynamic-paper-models

## Resumen

`rsj2003/libero-dynamic-paper-models` no es un modelo individual, sino un repositorio de Hugging Face que publica los checkpoints de inferencia del estudio LIBERO-Dynamic, un benchmark de manipulación robótica en entornos dinámicos construido sobre las 40 tareas de LIBERO. El benchmark desplaza los objetos mediante fricción de contacto, avanza el mundo simulado según la latencia de inferencia medida de cada política y evalúa la ejecución de acciones a partir de observaciones que pueden haber quedado obsoletas.

El repositorio reúne diez checkpoints —nueve versiones experimentales más el baseline nativo— de dos familias de políticas: FastWAM-Joint, en variantes de frame único y de historial denso, y π0.5. Cada familia incluye una base estática y ajustes finos con datos exclusivamente dinámicos o con datos dinámicos y estáticos combinados (FT3000 o FT1500 según el caso).

Es relevante ahora porque permite reproducir y comparar los resultados del artículo de LIBERO-Dynamic, y porque aísla el efecto de entrenar con datos dinámicos frente a estáticos en políticas de manipulación sometidas a latencia. El repositorio ocupa 116,6 GB y se distribuye únicamente para inferencia, sin estado del optimizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (políticas robóticas de las familias FastWAM-Joint y π0.5; la model card no detalla la arquitectura) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se especifica ventana de observación) |
| Tipos de cuantización | no disponible (se distribuyen checkpoints PyTorch; no constan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no aplica como modelo de lenguaje) |
| Licencia | no disponible; el checkpoint original FastWAM-Joint queda sujeto a los términos upstream de FastWAM |
| Formato de pesos | checkpoints PyTorch (`.pt`); el repositorio incluye el tag `safetensors` y ficheros `dataset_stats.json` asociados |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna, el número de parámetros ni la composición exacta de los datos de entrenamiento. Lo que sí se especifica es la organización de los checkpoints: FastWAM-Joint en variante de frame único (baseline nativo `step_034720.pt`, base estática de 60K pasos, ajuste dinámico-only FT3000 y ajuste dinámico+estático FT3000) y en variante de historial denso (base estática, dinámico-only FT3000 y dinámico+estático FT3000); y π0.5 (oficial estática, dinámico-only FT1500 y dinámico+estático FT3000). El baseline nativo es distinto de la base estática de 60K pasos y conserva su registro de procedencia y su fichero de normalización emparejado.

El entrenamiento se apoya en el conjunto de datos estrictamente no-benchmark publicado aparte (`rsj2003/libero-dynamic-strict-nonbenchmark-1800`), y el protocolo de evaluación está en el repositorio de GitHub del proyecto. Los checkpoints son releases de inferencia: el estado del optimizador se omite de forma intencionada, por lo que no sirven para reanudar un entrenamiento. Las entradas de π0.5 incluyen parámetros de inferencia, metadatos del checkpoint y activos de normalización.

## Capacidades

- Control de políticas de manipulación robótica sobre las 40 tareas de LIBERO, incluidas las versiones dinámicas con objetos en movimiento.
- Evaluación sensible a latencia: la política actúa sobre observaciones que pueden estar desfasadas respecto al estado real del simulador.
- Variante de frame único y variante de historial denso para comparar el efecto de la memoria temporal en FastWAM-Joint.
- Comparación cruzada entre familias (FastWAM-Joint frente a π0.5) bajo un mismo protocolo de evaluación.
- Ajuste fino con datos dinámicos, estáticos o la combinación de ambos, permitiendo ablaciones controladas.
- Inferencia en PyTorch dentro del pipeline de simulación MuJoCo descrito en el artículo.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling ni agentes multi-paso.

## Casos de uso

- Reproducción de los resultados del artículo: cargar cada checkpoint con su `dataset_stats.json` y ejecutar el protocolo del repositorio de GitHub para verificar las cifras publicadas en LIBERO-Dynamic.
- Baseline para nuevas políticas dinámicas: usar el baseline nativo `step_034720.pt` y la base estática de 60K pasos como referencia al evaluar un método propio en las 40 tareas.
- Ablación de datos de entrenamiento: comparar dinámico-only frente a dinámico+estático dentro de la misma familia para cuantificar cuánto aporta cada régimen de datos.
- Estudio de memoria temporal: contrastar FastWAM-Joint de frame único con la variante de historial denso en tareas donde el objeto se desplaza durante la inferencia.
- Comparación entre familias: enfrentar FastWAM-Joint y π0.5 bajo la misma latencia calibrada para analizar robustez al retardo percepción-acción.
- Investigación sobre sim-to-real: analizar qué configuraciones toleran mejor el desfase entre observación y ejecución antes de trasladar políticas a un robot físico.
- Docencia y prototipado en robótica: disponer de checkpoints listos para inferencia en un entorno simulado reproducible, sin necesidad de reentrenar.
- Punto de partida para ajuste fino: reutilizar los pesos como inicialización, teniendo en cuenta que no se incluye estado del optimizador y que la licencia no está declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe los checkpoints y su papel en el estudio, pero no incluye tablas de éxito por tarea, latencias medidas ni comparativas numéricas entre variantes. El artículo de LIBERO-Dynamic define el espacio de evaluación (patrón de movimiento, velocidad, fase de trayectoria y retardo percepción-acción), pero las cifras concretas no aparecen en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño de cada checkpoint individual no se especifica y el repositorio completo suma 116,6 GB.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU en la model card.
- Viabilidad en GPU de consumo: no se puede determinar con los datos disponibles.
- Opciones de despliegue: PyTorch con el pipeline de simulación MuJoCo del proyecto; no aplican vLLM, llama.cpp, Ollama ni TGI al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles como cifras cerradas; el propio benchmark calibra y mide la latencia de inferencia específica de cada política, por lo que la latencia depende del hardware y del checkpoint.
- Almacenamiento: prever espacio para 116,6 GB si se descarga el repositorio completo; conviene descargar solo los checkpoints necesarios.

## Comparativa con modelos similares

No se documentan alternativas externas comparables en la información disponible. La comparación posible se limita a las familias incluidas en el propio repositorio:

| Familia / variante | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM-Joint, frame único (baseline nativo) | no disponible | no disponible | no disponible | sujeta a términos upstream de FastWAM | incluido en el repositorio |
| FastWAM-Joint, frame único (estática, dinámico-only FT3000, dinámico+estático FT3000) | no disponible | no disponible | no disponible | no disponible | incluido en el repositorio |
| FastWAM-Joint, historial denso (estática, dinámico-only FT3000, dinámico+estático FT3000) | no disponible | no disponible | no disponible | no disponible | incluido en el repositorio |
| π0.5 (estática oficial, dinámico-only FT1500, dinámico+estático FT3000) | no disponible | no disponible | no disponible | no disponible | incluido en el repositorio |

## Limitaciones y advertencias

- La licencia no está declarada; el uso comercial no puede asumirse y el checkpoint original FastWAM-Joint queda sujeto a los términos upstream de FastWAM.
- El repositorio no incluye estado del optimizador: es una release de inferencia, no un snapshot para reanudar entrenamiento.
- No se especifican arquitectura, número de parámetros, contexto de observación ni datos de entrenamiento detallados, lo que dificulta estimar costes y comparar con otros trabajos.
- Los resultados del benchmark no acompañan al repositorio; hay que remitirse al artículo y al código para obtener cifras.
- La evaluación se realiza en simulación MuJoCo con una plataforma rígida invisible que mueve los objetos por fricción; existe una brecha sim-to-real no cuantificada en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- El baseline nativo y la base estática de 60K pasos son checkpoints distintos; confundirlos invalida cualquier comparación.
- No es un modelo de lenguaje: no ofrece generación de texto, tool calling, agentes ni capacidades multilingües.
- El tamaño completo (116,6 GB) complica su descarga y almacenamiento; conviene seleccionar variantes concretas.

## Enlaces

- Hugging Face: https://huggingface.co/rsj2003/libero-dynamic-paper-models
- Dataset de entrenamiento: https://huggingface.co/datasets/rsj2003/libero-dynamic-strict-nonbenchmark-1800
- Repositorio de código y protocolo de evaluación: https://github.com/renshaojie233/LIBERO-Dynamic
- Artículo (arXiv, abstract): https://arxiv.org/abs/2610.24579
- Artículo (arXiv, PDF): https://arxiv.org/pdf/2610.24579
- Resumen del artículo en aimodels.fyi: https://www.aimodels.fyi/papers/arxiv/libero-dynamic-benchmarking-robotic-manipulation-dynamic-environments
- Repositorio adicional encontrado en la búsqueda, no verificado: https://github.com/weiqianwang123/LIBERO-Dynamic
