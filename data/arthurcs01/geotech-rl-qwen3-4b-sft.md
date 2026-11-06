# arthurcs01/geotech-rl-qwen3-4b-sft

## Resumen

geotech-rl-qwen3-4b-sft es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen3-4B-Instruct-2507, desarrollado por arthurcs01 para tareas de ingeniería geotécnica dentro del proyecto geotech-rl. No se trata de un modelo completo, sino de un adaptador PEFT de rango 16 que aprende el formato y la rutina de resolución de episodios de cimentación, sirviendo como arranque en frío (warm start) para un adaptador posterior entrenado con GRPO.

El modelo resuelve un problema muy acotado: episodios sintéticos de diseño y verificación de cimentaciones organizados en cinco niveles de dificultad (N0 a N4), donde el adaptador debe interpretar enunciados, aplicar métodos de cálculo y producir respuestas en un formato concreto. Su relevancia es fundamentalmente metodológica: permite inspeccionar los resultados del repositorio geotech-rl y reproducir el pipeline de entrenamiento por refuerzo, más que desplegarse en producción real.

El adaptador tiene un tamaño de repositorio de 0,1 GB, se distribuye bajo licencia Apache 2.0 y solo declara soporte para inglés. El autor advierte explícitamente que todos los datos son sintéticos y que el modelo no debe usarse para decisiones reales de cimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parámetros. El LoRA tiene rango 16, alpha 32 y se aplica sobre las proyecciones de atención y MLP. El entrenamiento consistió en SFT durante 200 pasos, aproximadamente 20 minutos en una única RTX 5090, usando 1.200 demostraciones oráculo generadas y calificadas con las herramientas reales del proyecto. No se usaron salidas de modelos cerrados como datos de entrenamiento.

La pila de entrenamiento fue prime-rl y verifiers, con vLLM para la evaluación. Un detalle técnico relevante es que los tensores del adaptador no se modificaron, pero sus nombres se convirtieron al formato de PEFT, ya que prime-rl guarda con una nomenclatura distinta; con los nombres originales PEFT carga el fichero, avisa de claves ausentes y no aplica nada. El autor indica que la receta de uso se verificó sobre la arquitectura real recortada a dos capas con pesos aleatorios, no sobre el modelo completo.

## Capacidades

- Generación de texto en inglés orientada a la resolución de episodios de ingeniería geotécnica en formato estructurado.
- Interpretación de enunciados de problemas de cimentación con distintos niveles de dificultad (N0 a N4).
- Aplicación de métodos de cálculo geotécnico cuando el método se proporciona en el enunciado (nivel N0).
- Selección de método de resolución cuando no se indica explícitamente (nivel N1).
- Manejo de unidades de carga foráneas (nivel N2), aunque sin resultados positivos en la evaluación.
- Tratamiento de casos con collar agrietado (nivel N3) y de ensayos en condición saturada frente a seca (nivel N4).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos del proyecto geotech-rl: el adaptador permite inspeccionar los resultados publicados y verificar el comportamiento del warm start antes del entrenamiento GRPO, usando el código del repositorio y vLLM para evaluación.
- Arranque en frío de pipelines de RL: sirve como punto de partida para el adaptador GRPO del mismo autor, de modo que un equipo de investigación puede continuar el entrenamiento por refuerzo sin partir del modelo base sin ajustar.
- Evaluación de formato de tareas estructuradas: útil para estudiar cómo un LoRA de rango 16 y 200 pasos de SFT aprende la rutina de un dominio técnico concreto sin adquirir criterio de ingeniería.
- Docencia e investigación en ajuste fino eficiente: permite ilustrar el flujo completo PEFT con transformers y peft sobre un modelo de 4B en una sola GPU de consumo.
- Pruebas de conversión de formato de adaptadores: el caso de renombrado de tensores desde prime-rl a PEFT es un ejemplo práctico para depurar cargas de adaptadores que no se aplican.
- Análisis de límites de generalización: los resultados por nivel (fallo total en N2, aciertos parciales en N3 y N4) permiten estudiar qué tipos de variación en el enunciado rompen un adaptador entrenado con demostraciones sintéticas.

## Benchmarks y rendimiento

Episodios resueltos sobre instancias reservadas (held-out), según la model card:

| Nivel | Que plantea | Base | Este adaptador |
|---|---|---:|---:|
| N0 | calentamiento, método dado | 28/180 | 17/24 |
| N1 | calentamiento, método no dado | 0/60 | 18/24 |
| N2 | unidad de carga foránea | 0/9 | 0/24 |
| N3 | collar agrietado | 0/9 | 2/24 |
| N4 | ensayos saturados frente a secos | 0/9 | 15/24 |

El autor precisa que las celdas N0 y N1 del modelo base son anteriores a la recalibración de la escala; que N0 y N1 no contienen decisión y un script fijo los resuelve; que los dos aciertos en N3 son instancias de control; que N4 no refleja una decisión aprendida, ya que las demostraciones contenían el filtro de lluvia; y que se trata de una sola semilla de entrenamiento, con 24 episodios que corresponden a 8 tareas con 3 intentos cada una.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el requisito real lo marca el modelo base Qwen3-4B-Instruct-2507.
- VRAM estimada para el modelo base en bfloat16: en torno a 8-9 GB de pesos, más overhead de activaciones y caché KV; con cuantización de 4 bits cabría en GPUs de 6-8 GB, aunque no se documentan cuantizaciones oficiales del adaptador.
- GPU recomendadas: el entrenamiento se realizó en una RTX 5090; para inferencia son suficientes GPUs de consumo con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) o GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: sí, con el modelo base en bfloat16 en tarjetas de 12 GB o más, o en 4 bits en tarjetas de 8 GB.
- Opciones de despliegue: la model card menciona vLLM para la evaluación y proporciona una receta con transformers y peft; no se documenta soporte de llama.cpp, Ollama ni TGI para el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| geotech-rl-qwen3-4b-sft | LoRA sobre 4B | no disponible | SFT geotécnico, warm start | apache-2.0 | Hugging Face |
| geotech-rl-qwen3-4b-sft-grpo | LoRA sobre 4B | no disponible | RL (GRPO) geotécnico | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en la informacion | Modelo base generalista | no disponible en la informacion | Hugging Face |

La comparación con modelos de propósito general no resulta significativa, ya que este adaptador está especializado en un dominio sintético y su utilidad es reproducir un experimento de investigación, no competir en benchmarks generales.

## Limitaciones y advertencias

- Todos los datos de entrenamiento y evaluación son sintéticos; el autor prohíbe explícitamente su uso para decisiones reales de cimentación.
- El adaptador aprende formato y rutina, no criterio de ingeniería; no debe interpretarse como conocimiento geotécnico validado.
- Resultados pobres o nulos en N2 (0/24) y N3 (2/24, ambos de control), lo que evidencia escasa generalización ante variaciones del enunciado.
- El rendimiento en N4 (15/24) no refleja una decisión aprendida, sino la presencia del filtro de lluvia en las demostraciones.
- Los resultados provienen de una única semilla de entrenamiento y de 24 episodios, por lo que la variabilidad estadística es alta.
- Solo declara idioma inglés; no hay evidencia de comportamiento en castellano.
- La receta de uso con transformers y peft se verificó sobre una arquitectura recortada a dos capas, no sobre el modelo completo.
- La evaluación se realizó con vLLM, no con PEFT, por lo que puede haber discrepancias entre ambos caminos de inferencia.
- Licencia Apache 2.0, igual que el modelo base; los pesos modifican Qwen3-4B-Instruct-2507 del equipo Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arthurcs01/geotech-rl-qwen3-4b-sft
- Adaptador GRPO: https://huggingface.co/arthurcs01/geotech-rl-qwen3-4b-sft-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto: https://github.com/arthurcunha51eng/geotech-rl
- DOI de cita: https://doi.org/10.5281/zenodo.23861866
