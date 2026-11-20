# sodan/laya-cua-tools

## Resumen

laya-cua-tools es un ajuste fino (fine-tune) del modelo base convaiinnovations/laya, desarrollado por el usuario sodan y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de enrutamiento (routing model) especializado en function calling: su tarea es decidir, dado un prompt y una lista de funciones disponibles, si conviene invocar una función en ese turno y, en caso afirmativo, cuál de las funciones listadas seleccionar. No genera los argumentos de la función ni implementa acciones de computer-use; para eso el autor remite a sodan/laya-cua.

El modelo resuelve un problema acotado pero crítico en pipelines de agentes: la fase de decisión previa a la ejecución de herramientas. Con 421.293.830 parámetros y un repositorio de 0,8 GB en formato safetensors, es un modelo compacto que puede ejecutarse en hardware modesto (el propio autor lo entrenó en una Colab T4 gratuita). Su relevancia radica en la mejora medida sobre el modelo base en la decisión binaria de llamada: la precisión de tool_call pasa de 0,3042 a 0,9573 en el split de test.

La información disponible es limitada: no se detallan arquitectura interna, longitud de contexto, idiomas soportados ni composición completa del dataset de entrenamiento más allá del corpus glaiveai/glaive-function-calling-v2. Los resultados proceden de una única ejecución con una sola semilla y sin intervalos de confianza, lo que debe tenerse en cuenta al evaluar su robustez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base convaiinnovations/laya; familia laya) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint convaiinnovations/laya, del que no se documentan en la información disponible los detalles de arquitectura (transformer, MoE, híbrida u otra), el número de tokens de preentrenamiento ni la composición del corpus original. La model card únicamente indica la librería de ejecución (laya) y la etiqueta de modelo base, sin especificaciones internas adicionales.

El ajuste fino se realizó sobre el dataset glaiveai/glaive-function-calling-v2, con una partición por conversación: 4500 filas de entrenamiento, 1454 de desarrollo y 2574 de test. Se ejecutaron 2 épocas en una Colab T4 gratuita, en una sola ejecución y con una única semilla. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado. La innovación principal no es arquitectónica sino de propósito: el modelo se entrena específicamente para la decisión de enrutamiento (llamar o no llamar, y qué función elegir), separando esa tarea de la generación de argumentos.

## Capacidades

- Decisión binaria de llamada a función (tool_call): determina si en el turno actual procede invocar alguna de las funciones disponibles.
- Selección de función (tool_choice): elige cuál de las funciones listadas debe invocarse cuando la decisión es afirmativa.
- Enrutamiento dentro de pipelines de function calling: actúa como etapa previa a un modelo generador de argumentos.
- Procesamiento de prompts con listas de funciones (la model card señala que la mayoría de los prompts del dataset listan una o dos funciones).
- No genera argumentos de función: esa responsabilidad queda fuera del alcance del modelo.
- No es un modelo de computer-use: las acciones de ese tipo se cubren en sodan/laya-cua.
- Soporte multilingüe: no disponible en la información proporcionada.
- Capacidades de agente multi-paso, visión, audio o modo thinking: no disponibles en la documentación.

## Casos de uso

- Enrutamiento previo en agentes con herramientas: el modelo recibe el prompt del usuario y el catálogo de funciones y decide si hay que llamar a alguna; con una precisión de tool_call de 0,9573 en test, reduce llamadas innecesarias frente al modelo base (0,3042).
- Filtro de invocaciones en asistentes conversacionales: en diálogos multi-turno, evita que el sistema ejecute funciones cuando el usuario solo conversa, usando la decisión binaria como puerta antes del ejecutor de herramientas.
- Selección de herramienta en catálogos pequeños: con listas de una o dos funciones, la precisión de tool_choice alcanza 1,0 en test (n=906), adecuado para asistentes con un conjunto reducido y estable de herramientas.
- Etapa de un pipeline de dos modelos: laya-cua-tools decide si llamar y qué función; un modelo generador de argumentos completa la llamada, separando responsabilidades y facilitando la evaluación de cada etapa.
- Despliegue en hardware de gama baja: con 421 millones de parámetros y 0,8 GB de pesos en safetensors, puede ejecutarse en entornos con recursos limitados, como el propio entrenamiento en una T4, para prototipos y pruebas de integración.
- Evaluación y monitorización de agentes: al ser un modelo de decisión acotado, sirve como componente medible en tests de regresión de pipelines de function calling, comparando tasas de llamada correcta e incorrecta entre versiones.
- Investigación sobre enrutamiento de herramientas: su partición por conversación y sus métricas publicadas permiten reproducir y comparar experimentos de decisión de llamada con el modelo base.

## Benchmarks y rendimiento

| Metrica de test | Base Laya | Fine-tuned | Always no-call | Random pick |
|---|---|---|---|---|
| tool_call accuracy (n=2574) | 0.3042 | 0.9573 | 0.648 | n/a |
| tool_choice accuracy (n=906) | 0.9989 | 1.0 | n/a | 0.8786 |

En el split de desarrollo, la precisión de tool_call fue de 0,2978 para el modelo base y 0,9519 para el ajustado. El autor señala que la mejora se concentra en la decisión llamar/no llamar, y que la precisión de tool_choice está cerca del techo para el modelo base porque la mayoría de los prompts listan una o dos funciones (la selección aleatoria obtiene 0,8786). Los resultados provienen de una única ejecución, sin intervalos de confianza; una ejecución anterior sobre laya 0.4.37 dio un tool_call de test de 0,9545. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421.293.830 parámetros y pesos safetensors de 0,8 GB, la inferencia en precisión de entrenamiento requiere del orden de 1,7 GB solo para pesos, más memoria para activaciones y contexto.
- GPU recomendadas: el autor entrenó el ajuste en una Colab T4 gratuita, lo que indica que la inferencia cabe en GPUs de gama media; no se documentan recomendaciones específicas (A100, H100, RTX 4090).
- GPU de consumo: por tamaño, es probable que quepa en GPUs de consumo con suficiente VRAM, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: la librería indicada es laya; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sodan/laya-cua-tools | 421.293.830 | no disponible | Enrutamiento de function calling (llamar/no llamar y selección) | apache-2.0 | Hugging Face |
| convaiinnovations/laya (base) | no disponible | no disponible | Modelo base de la familia laya | no disponible | Hugging Face |
| sodan/laya-cua | no disponible | no disponible | Acciones de computer-use | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto para los modelos comparables en la información proporcionada, por lo que la comparación se limita a propósito, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no genera argumentos de función; usarlo como sustituto de un generador completo produciría llamadas incompletas.
- No es un modelo de computer-use; las tareas de ese tipo quedan fuera de su alcance declarado.
- Los resultados provienen de una sola ejecución, con una única semilla y sin intervalos de confianza; la robustez de las métricas no está establecida.
- La precisión de tool_choice está cerca del techo incluso para el modelo base (0,9989), por lo que la mejora real se limita a la decisión binaria de llamada.
- El dataset de evaluación lista mayoritariamente una o dos funciones por prompt; el comportamiento con catálogos grandes de herramientas no está documentado.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, idiomas soportados ni limitaciones de contexto.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base convaiinnovations/laya, no detalladas en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sodan/laya-cua-tools
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Modelo de computer-use relacionado: https://huggingface.co/sodan/laya-cua
- Dataset de ajuste fino: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Script y resultados: https://github.com/somdipto/laya-cua/tree/main/function_calling
