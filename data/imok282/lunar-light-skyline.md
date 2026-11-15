# Imok282/lunar-light-skyline

## Resumen

Lunar Light Skyline es un modelo de regresión entrenado para predecir el horizonte de elevación a 360° (skyline) en celdas de la superficie del polo sur lunar. Lo desarrolla Imok282 en el marco del proyecto Adinfinitium, nacido como trabajo del NASA Space Apps 2026, y se apoya en datos de terreno del instrumento LRO LOLA de la NASA con resolución de 5 m. El modelo no genera texto ni código: es un componente de un pipeline de simulación de aterrizaje y navegación lunar, y su salida se convierte posteriormente, mediante física, en fracción de luz solar y visibilidad de la Tierra.

La arquitectura, denominada `SkylineFormer`, combina una convolución circular a lo largo de cada rayo de brújula con un transformer que opera sobre las 360 direcciones, y una cabeza inicializada a cero que predice una corrección sobre una línea base física. Con 38.279.809 parámetros y un checkpoint de 153.175.919 bytes, el modelo se entrenó durante 3.258 de los 6.000 pasos previstos (54%), seleccionando el mejor checkpoint por error de skyline en validación sobre el sitio Site11.

Su relevancia es acotada pero concreta: demuestra que un modelo neuronal ligero puede superar a una línea base de ray-casting grueso en error angular de skyline (0,450° frente a 0,570°) y en error de horas de luz solar (7,6 h frente a 10,5 h), aunque a costa de ser unas 227 veces más lento. Está pensado para investigación, educación y benchmarking, no para vuelo ni decisiones operativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `SkylineFormer`: convolución circular por rayo de brújula, transformer sobre 360 direcciones y cabeza con inicialización a cero; anchura 64, `n_down` 3, `d` 512, 12 capas, 8 cabezas, `k_steps` 64, `n_az` 360 |
| Parametros totales | 38.279.809 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de 360 direcciones de brújula por celda) |
| Tipos de cuantizacion | no disponible; se documenta que la precisión media (half precision) alteró la salida hasta 0,327° y fue rechazada |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch `light_skyline_big.pt` (153.175.919 bytes, sha256 `673b6715…e11d3`) |

## Arquitectura y entrenamiento

`SkylineFormer` es un modelo de regresión puramente geométrico. La entrada se procesa con una convolución circular aplicada a lo largo de cada rayo de brújula, seguida de un transformer que modela dependencias entre las 360 direcciones del horizonte. La cabeza de predicción está inicializada a cero, de modo que la salida del modelo es la línea base física más una corrección aprendida; un modelo sin entrenar equivale, por construcción, al respaldo físico. La configuración concreta es anchura 64, `n_down` 3, dimensión 512, 12 capas, 8 cabezas de atención, `k_steps` 64 y `n_az` 360.

El entrenamiento se realizó sobre terreno del polo sur lunar procedente de NASA LRO LOLA a 5 m de resolución, con 3.258 pasos efectivos de los 6.000 planificados. El checkpoint liberado es el mejor por error de skyline en validación sobre Site11. El autor documenta que completar los 6.000 pasos no cambió el resultado de forma significativa (−0,0014°), por lo que congeló la versión de 3.258 pasos. No se detalla en la información disponible la composición exacta del dataset, el número de tokens ni si hubo etapas de RLHF o DPO, algo esperable dado que no es un modelo de lenguaje. El modelo no está conectado al rover: este último utiliza ray-casting físico exacto.

## Capacidades

- Regresión de skyline: predice la altura del horizonte en 360 direcciones de brújula para una celda de superficie lunar.
- Conversión física posterior: la salida permite derivar, mediante física, la fracción de luz solar y la visibilidad de la Tierra.
- Mejora sobre línea base: reduce el error angular medio y el error de horas de luz solar respecto al ray-casting grueso.
- Generalización a sitios nuevos: evaluado en sitios frescos con error de 0,243°, inferior al de la línea base.
- Integración en pipeline: forma parte de la cadena hazard network → light network → terrain model → rover brain → lander pilot.
- Auto-mejora offline: el proyecto describe Dream-RSI, un mecanismo de mejora autocontenida con compuerta de validación congelada.
- Sin capacidades lingüísticas, de código, de tool calling ni multimodales: no es un modelo generativo de propósito general.

## Casos de uso

- Planificación de lugares de aterrizaje: el modelo estima el horizonte en cada celda candidata y, tras la conversión física, permite comparar la exposición solar y la visibilidad de la Tierra entre sitios del polo sur lunar.
- Estudio de iluminación en el polo sur: la predicción de skyline alimenta el cálculo de horas de luz solar por celda, útil para analizar ventanas de operación de futuras misiones.
- Evaluación de visibilidad de comunicaciones: la visibilidad de la Tierra derivada del skyline sirve para estudiar enlaces de comunicaciones desde la superficie.
- Benchmarking de métodos de navegación lunar: el modelo y su línea base proporcionan una referencia reproducible para comparar aproximaciones de ray-casting frente a aproximaciones neuronales.
- Docencia y divulgación: el pipeline completo, con modelos congelados y evaluación en sitios reservados, sirve como ejemplo didáctico de entrenamiento, validación y compuerta de calidad en un dominio físico.
- Investigación en auto-mejora offline: el esquema Dream-RSI documentado (encontrar fallos, generar escenarios difíciles, entrenar candidato y aceptar solo si mejora en un examen congelado) es un caso de estudio aplicable a otros dominios de simulación.
- Simulación de rover: la cadena completa, incluida la red de luz, permite simular condiciones de iluminación para el entrenamiento del cerebro del rover en entornos simulados.

## Benchmarks y rendimiento

Error absoluto medio de skyline en grados (menor es mejor), frente a la línea base de ray-casting grueso:

| Conjunto de prueba | Modelo | Línea base ray-cast grueso |
|---|---|---|
| Skyline MAE, Site23 + Site42 | 0,450° | 0,570° |
| Skyline MAE, sitios nuevos | 0,243° | 0,321° |
| Error de horas de luz solar | 7,6 h | 10,5 h |
| Site23 (por sitio) | 0,534° | 0,675° |
| Site42 (por sitio) | 0,270° | 0,342° |

El modelo obtiene menor error en las 19 ventanas de prueba. En cuanto a coste computacional, es aproximadamente 227 veces más lento que la línea base (unos 7,4 s frente a 0,033 s por ventana). No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 38,3 millones de parámetros, el checkpoint en FP32 ocupa unos 153 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con suficiente memoria para el checkpoint y el grafo de cómputo es suficiente, incluidas RTX 3060 o superiores.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: carga mediante PyTorch con el código del proyecto (`worldmodel.light.model.SkylineStudent`, `load_checkpoint`, `pick_device`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 7,4 s por ventana, frente a 0,033 s de la línea base física.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lunar Light Skyline | Regresión de skyline | 38.279.809 | Neuronal con corrección sobre física | Apache-2.0 | Hugging Face |
| Ray-cast grueso (línea base) | Física determinista | no aplica | Ray-casting aproximado | no disponible | Incluido como referencia en el proyecto |
| Ray-casting exacto del rover | Física determinista | no aplica | Ray-casting exacto | no disponible | Uso interno del rover, no liberado como modelo |

No se conocen en la información proporcionada otros modelos neuronales públicos comparables para predicción de skyline lunar; la comparación relevante es frente a las líneas base físicas del propio proyecto.

## Limitaciones y advertencias

- No apto para vuelo, decisiones de aterrizaje safety-critical ni uso operativo; todos los resultados son de simulación o de sitios lunares reservados, no de misión real.
- Coste computacional elevado: unas 227 veces más lento que la línea base (7,4 s frente a 0,033 s por ventana).
- Precisión media rechazada: el uso de half precision alteró la salida hasta 0,327°, por lo que debe ejecutarse en la precisión documentada.
- Alcance del terreno limitado: tanto la verdad de referencia como el modelo ignoran el terreno más allá de 1.280 m.
- Entrenamiento incompleto respecto al plan (3.258 de 6.000 pasos), aunque el autor documenta que completarlo no cambió el resultado de forma significativa.
- No está conectado al rover, que utiliza ray-casting físico exacto; su papel es de investigación y benchmarking.
- No es un modelo de lenguaje: no soporta generación de texto, código, tool calling ni capacidades multilingües.
- No se documentan sesgos ni riesgos de alucinación en el sentido habitual; el riesgo principal es el error de predicción geométrica en condiciones fuera de la distribución de los sitios de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el uso previsto declarado excluye explícitamente aplicaciones de vuelo y de seguridad crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Imok282/lunar-light-skyline
- Familia de modelos Adinfinitium: https://huggingface.co/Imok
- Código del proyecto: https://github.com/oasisk/adinfinitium-handoff
- Datos de terreno: NASA LRO LOLA 5 m del polo sur lunar (referenciado en la model card; sin URL directa en la información disponible)
