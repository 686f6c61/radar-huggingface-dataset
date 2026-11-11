# hardik-dwivedi/qwen2.5-1.5b-when2call-dpo

## Resumen

`hardik-dwivedi/qwen2.5-1.5b-when2call-dpo` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Lo desarrolla el usuario de Hugging Face hardik-dwivedi y su nombre sugiere que el objetivo del ajuste es aprender a decidir "cuando llamar" (when to call), presumiblemente en el contexto de invocacion de herramientas o funciones, aunque la model card no lo documenta de forma explicita.

El modelo no es un modelo completo, sino un adaptador PEFT (pesos LoRA en formato safetensors, ~0,2 GB) que debe cargarse junto al modelo base Qwen2.5-1.5B-Instruct. El modelo base es un transformer decoder-only de 1.500 millones de parametros de la familia Qwen2.5 de Alibaba, con una ventana de contexto de 32.768 tokens segun la documentacion publica de Qwen2.5, aunque esa cifra no se confirma en la informacion proporcionada para este adaptador.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste con DPO de un modelo pequeno, con cero descargas y cero likes en el momento de la consulta, sin model card cumplimentada (el README es la plantilla por defecto de Hugging Face) y sin datos de entrenamiento, evaluacion ni licencia declarados. Debe tratarse como un artefacto de investigacion temprana, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible para el adaptador (el modelo base tiene 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador (el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens en su documentacion publica) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Libreria | peft (compatible con transformers y trl) |
| Version de PEFT indicada | 0.21.2 |
| Tamano del repositorio | 0,2 GB |
| Metodo de ajuste | DPO (Direct Preference Optimization) con LoRA |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-10 |
| Fecha de actualizacion | 2026-11-11 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parametros. El entrenamiento se realizo con DPO, una tecnica de alineacion por preferencias que optimiza directamente el modelo frente a pares de respuestas preferidas y rechazadas, sin necesidad de un modelo de recompensa separado como en RLHF clasico. Las etiquetas del repositorio confirman el uso de `peft`, `trl` y `transformers`, y la version de PEFT declarada es 0.21.2.

No hay informacion sobre el dataset de preferencias utilizado, el numero de pasos de entrenamiento, los hiperparametros (rango LoRA, alpha, tasa de aprendizaje, beta de DPO), la composicion de los datos ni si se aplicaron tecnicas adicionales de regularizacion. La model card es la plantilla por defecto de Hugging Face sin rellenar, por lo que todos los apartados de detalles de entrenamiento, datos y evaluacion aparecen como "[More Information Needed]". El sufijo "when2call" del nombre sugiere un ajuste orientado a la decision de invocar herramientas, pero esta hipotesis no esta documentada por el autor.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct.
- Ajuste por preferencias (DPO) orientado, segun el nombre del repositorio, a la decision de cuando invocar una herramienta o funcion; no confirmado en la documentacion.
- Soporte de tool calling y function calling: probable por herencia del modelo base Qwen2.5-Instruct, pero no verificado especificamente en este adaptador.
- Razonamiento multi-paso y uso como agente: no documentado para este adaptador.
- Capacidades multilingues: no disponibles en la informacion del adaptador; el modelo base Qwen2.5 soporta multiples idiomas, pero no se detalla aqui.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no soportado (el modelo base es solo texto).

## Casos de uso

- Enrutamiento de llamadas a herramientas en agentes ligeros: el adaptador podria emplearse para decidir si una consulta del usuario requiere invocar una API externa o resolverse con generacion directa, aprovechando el ajuste DPO sobre pares de preferencias; requiere validacion empirica previa.
- Prototipado de asistentes conversacionales de bajo coste: al ser un adaptador de 0,2 GB sobre un modelo de 1,5B, puede desplegarse en entornos con recursos limitados para experimentar con alineacion por preferencias.
- Investigacion sobre DPO en modelos pequenos: util como punto de partida para reproducir o comparar tecnicas de optimizacion por preferencias en la franja de 1-2B parametros.
- Filtrado de intenciones en pipelines de automatizacion: el modelo podria clasificar implicitamente si una peticion debe derivarse a un sistema externo, aunque sin metricas publicadas no puede garantizarse su fiabilidad.
- Educacion y demos de PEFT: sirve para ilustrar como se carga un adaptador LoRA con la libreria `peft` y se combina con un modelo base de Qwen.
- Experimentacion con ajuste fino eficiente en hardware de consumo: el tamano reducido del adaptador permite iterar rapidamente en una unica GPU, siempre que se disponga del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada y el repositorio no presenta metricas de MMLU, HumanEval, GSM8K ni de tareas de tool calling.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa ~0,2 GB; el modelo base Qwen2.5-1.5B-Instruct requiere aproximadamente 3 GB en FP16, ~1,5-2 GB en cuantizacion de 8 bits y ~1 GB en 4 bits (estimaciones estandar para 1,5B parametros; no confirmadas en la informacion proporcionada).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente cualquier GPU moderna con 4 GB o mas, e incluso en CPU con cuantizacion agresiva.
- Opciones de despliegue: transformers + peft para cargar el adaptador; llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF; vLLM y TGI son compatibles con el modelo base fusionado, pero el soporte de adaptadores LoRA en caliente depende de la version y configuracion.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hardik-dwivedi/qwen2.5-1.5b-when2call-dpo | 1,5B (base) + adaptador LoRA | No disponible (base: 32.768) | Adaptador DPO/LoRA | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Modelo completo Instruct | Apache 2.0 (segun documentacion publica de Qwen) | Hugging Face, ampliamente utilizado |
| Qwen/Qwen2.5-1.5B | 1,5B | 32.768 | Modelo base | Apache 2.0 (segun documentacion publica de Qwen) | Hugging Face |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 131.072 | Modelo completo Instruct | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a parametros y contexto; no hay datos de rendimiento del adaptador que permitan contrastarlo con alternativas en benchmarks.

## Limitaciones y advertencias

- Model card sin cumplimentar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto, lo que impide evaluar su calidad y sesgos.
- Licencia no declarada: no puede asumirse uso comercial; debe verificarse con el autor y con la licencia del modelo base (Qwen2.5 se distribuye bajo Apache 2.0 segun su documentacion publica, pero el adaptador no especifica terminos).
- Riesgo de alucinacion: inherente a un modelo de 1,5B parametros, especialmente en tareas de razonamiento o decision de invocacion de herramientas sin validacion externa.
- Sesgos desconocidos: al no documentarse el dataset de preferencias, no puede evaluarse el sesgo introducido por el DPO.
- Idiomas no declarados: no se confirma el soporte multilingue del adaptador, aunque el modelo base lo tenga.
- Sin adopcion ni validacion de la comunidad: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion.
- El nombre "when2call" sugiere una funcionalidad concreta (decision de invocar herramientas) que no esta documentada ni evaluada; no debe asumirse que funcione segun esa expectativa sin pruebas propias.
- Requiere cargar el modelo base por separado: no es un checkpoint autonomo y depende de la version de PEFT (0.21.2 indicada) y de transformers compatible.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/hardik-dwivedi/qwen2.5-1.5b-when2call-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL (DPO): https://huggingface.co/docs/trl
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
