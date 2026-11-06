# MISLab-MiiSLab/gr00t_grasp-fan_Le-002_20k_LoRA

## Resumen

`MISLab-MiiSLab/gr00t_grasp-fan_Le-002_20k_LoRA` es un adaptador LoRA (PEFT) publicado por el laboratorio MISLab sobre el modelo base `nvidia/GR00T-N1.7-3B`, un modelo fundacional de NVIDIA orientado a robótica y control de robots (visión-lenguaje-acción, VLA). El adaptador no es un modelo independiente: contiene únicamente los pesos delta de las capas inyectadas por LoRA y requiere descargar y cargar el modelo base para poder ejecutarse.

El nombre del repositorio sugiere una especialización en tareas de agarre (grasp) sobre un objeto o escenario denominado `fan_Le`, entrenado durante 20 000 pasos (`20k`). La model card publicada es la plantilla por defecto de Hugging Face sin cumplimentar, por lo que no hay información oficial sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación.

Su relevancia es acotada: se trata de un artefacto de investigación de un laboratorio académico, con cero descargas y cero likes en el momento de la consulta, útil para quien quiera reproducir o reutilizar un ajuste fino concreto sobre GR00T N1.7 en tareas de manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base NVIDIA GR00T-N1.7-3B (visión-lenguaje-acción) |
| Parametros totales | no disponible (adaptador; el modelo base declara 3B en su identificador) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Version de PEFT | 0.21.0 |
| Tamano del repositorio | 0.8 GB |
| Fecha de publicacion | 2026-11-06 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, tal como indica la etiqueta `lora` y la librería `peft`. No redefine la arquitectura del modelo base: se inyecta sobre `nvidia/GR00T-N1.7-3B`, un modelo VLA de NVIDIA que combina un codificador visual, un modelo de lenguaje y una cabeza de acciones para generar comandos motores a partir de observaciones e instrucciones en lenguaje natural. La referencia al paper `arxiv:1910.09700` en las etiquetas corresponde al artículo de Lacoste et al. sobre el cálculo de emisiones de carbono, incluido en la plantilla de model card, y no a un paper del modelo.

No hay información publicada sobre el dataset de entrenamiento, el número de tokens o episodios, la composición de las trayectorias, ni sobre si se aplicó RLHF, DPO u otra fase de alineamiento. El sufijo `20k` en el nombre apunta a 20 000 pasos de entrenamiento, pero este dato no está confirmado en la documentación. Tampoco se detallan el rango LoRA, el alpha, las capas objetivo ni la tasa de aprendizaje.

## Capacidades

- Control robótico de manipulación: al estar construido sobre GR00T N1.7, el adaptador hereda la capacidad del modelo base de generar acciones motoras a partir de observaciones visuales e instrucciones.
- Especialización en agarre (grasp): el nombre del repositorio indica un ajuste orientado a tareas de agarre sobre un objeto o escenario concreto (`fan_Le`).
- Percepción visual: el modelo base es multimodal (visión-lenguaje-acción), por lo que procesa imágenes de cámaras como entrada.
- Instrucciones en lenguaje natural: el modelo base acepta comandos textuales para condicionar la política de control.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, modo thinking ni capacidades de audio para este adaptador.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en manipulación robótica: el adaptador sirve como punto de partida para reproducir experimentos de agarre sobre el modelo base GR00T N1.7, comparando el comportamiento con y sin el ajuste LoRA.
- Ajuste fino incremental: al ser un adaptador de 0.8 GB, permite iterar sobre el modelo base sin reentrenar los 3B parámetros completos, lo que reduce coste de cómputo y almacenamiento en el laboratorio.
- Evaluación de políticas VLA en simulación: se puede cargar en un pipeline de evaluación con el modelo base para medir tasas de éxito en tareas de agarre antes de transferir a un robot físico.
- Docencia y formación: útil en cursos de robótica o aprendizaje por refuerzo como ejemplo de adaptación de bajo rango sobre un modelo fundacional.
- Benchmarking interno: sirve para comparar variantes del mismo ajuste (existen repositorios hermanos como `Le-001` y `Le-006`) y analizar el efecto del número de pasos o de los datos.
- Integración en prototipos de laboratorio: para experimentos controlados donde se disponga del modelo base y del entorno de simulación o hardware compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0.8 GB, pero requiere cargar el modelo base GR00T-N1.7-3B, cuyo peso en precisión completa ronda los 6 GB en fp16 (estimación a partir de los 3B parámetros declarados en el identificador del modelo base).
- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 3B en fp16 requiere del orden de 6-8 GB de VRAM, y en cuantización de 4 bits podría situarse en torno a 2-4 GB, aunque no se confirma compatibilidad del adaptador con versiones cuantizadas.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3090 o RTX 4090, pero el modelo base es de robótica y puede requerir entradas visuales y un entorno específico.
- Opciones de despliegue: la librería declarada es `peft`, por lo que se cargaría con `transformers` + `peft` sobre el modelo base. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gr00t_grasp-fan_Le-002_20k_LoRA (este) | Adaptador sobre 3B | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste LoRA de laboratorio |
| MISLab-MiiSLab/gr00t_grasp-fan_Le-006_20k_LoRA | Adaptador sobre 3B | no disponible | no disponible | Hugging Face | Variante del mismo laboratorio con distinto identificador |
| MISLab-MiiSLab/gr00t_grasp-fan_Le-001_20k_v1 | Adaptador sobre 3B | no disponible | no disponible | Hugging Face | Variante temprana del mismo ajuste |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | no disponible | Hugging Face (modelo base) | Modelo fundacional VLA de NVIDIA |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La model card está sin cumplimentar: no hay información sobre sesgos, riesgos, datos de entrenamiento ni evaluación.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; hay que verificar la licencia del modelo base NVIDIA GR00T-N1.7-3B por separado.
- El adaptador no funciona de forma autónoma: requiere el modelo base y el entorno de ejecución correspondiente.
- Riesgo de sobreajuste al escenario concreto (`fan_Le`): es probable que el ajuste esté especializado en un objeto o configuración y no generalice a otras tareas de agarre.
- Sin datos de evaluación: no hay evidencia publicada de tasas de éxito, robustez ni comportamiento en condiciones fuera de distribución.
- Cero descargas y cero likes: no hay señal de validación por parte de la comunidad.
- El nombre del repositorio incluye una ruta local del servidor del autor en la etiqueta `base_model`, lo que sugiere un proceso de publicación poco cuidado y posibles problemas de reproducibilidad.
- No se documentan limitaciones de contexto ni de idioma porque no hay información al respecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MISLab-MiiSLab/gr00t_grasp-fan_Le-002_20k_LoRA
- Variante relacionada: https://huggingface.co/MISLab-MiiSLab/gr00t_grasp-fan_Le-006_20k_LoRA
- Variante relacionada: https://huggingface.co/MISLab-MiiSLab/gr00t_grasp-fan_Le-001_20k_v1
- Referencia citada en las etiquetas (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
