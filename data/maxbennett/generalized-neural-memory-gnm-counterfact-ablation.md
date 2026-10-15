# maxbennett/generalized-neural-memory-gnm-counterfact-ablation

## Resumen
El modelo `maxbennett/generalized-neural-memory-gnm-counterfact-ablation` es un ajuste fino de `meta-llama/Meta-Llama-3-8B-Instruct` con 9.783.615.488 parametros totales, desarrollado por Max S. Bennett (junto a Thomas Zollo y Richard Zemel) como parte del sistema Generalized Neural Memory (GNM). Se trata concretamente de la ablation "frozen-memory-write" del modelo CounterFACT: un entrenamiento identico al del modelo completo salvo que se bloquean los gradientes a traves del paso de memorizacion, aislando asi la contribucion de aprender "que escribir" frente a "que leer" en la memoria neural.

El modelo resuelve un problema concreto dentro de la investigacion en memoria neural: los metodos clasicos de memoria asumen una unica politica fija de actualizacion, mientras que este trabajo propone actualizaciones de memoria guiadas por instrucciones en lenguaje natural. Construye sobre la arquitectura MemoryLLM y anade mecanismos de memorizacion selectiva de hechos y de rechazo (refusal). Esta variante concreta es una pieza de ablacion experimental, no un modelo orientado a produccion.

Su relevancia es fundamentalmente academica: forma parte del paper "Tell Me What To Learn: Generalizing Neural Memory to be Controllable in Natural Language", aceptado en NeurIPS 2026, y sirve para cuantificar el efecto de congelar la escritura de memoria. Cuenta con 7 descargas y 1 like en HuggingFace, y se publica bajo licencia llama3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Meta-Llama-3-8B-Instruct, con mecanismo de memoria neural (MemoryLLM); no disponible el detalle exacto de las capas de memoria |
| Parametros totales | 9.783.615.488 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el backbone Llama-3-8B-Instruct soporta 8.192 tokens, sin confirmar para esta variante) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | llama3 |
| Formato de pesos | safetensors (repositorio de HuggingFace); el repositorio de codigo distribuya un archivo `.pth` |

## Arquitectura y entrenamiento
El modelo se apoya en `meta-llama/Meta-Llama-3-8B-Instruct` como backbone (transformer decoder-only) y le incorpora el mecanismo de memoria neural descrito en la linea de trabajo MemoryLLM. Sobre esa base, el sistema GNM anade actualizaciones de memoria controlables mediante instrucciones en lenguaje natural, junto con mecanismos de memorizacion selectiva de hechos y de refusal. Los parametros totales (9,78 mil millones) superan los del backbone, coherente con la incorporacion de modulos de memoria adicionales.

La variante de esta ficha es una ablation especifica: el entrenamiento es identico al del modelo CounterFACT completo, pero se bloquean los gradientes a traves del paso de memorizacion ("frozen-memory-write"). El objetivo experimental es aislar la ganancia atribuible a aprender que contenido escribir en memoria, en contraste con la de aprender a leer de ella. El dataset asociado es `maxbennett/generalized-neural-memory-counterfact`. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO especificas para esta variante.

## Capacidades
- Generacion de texto y uso conversacional, heredados del backbone Llama-3-8B-Instruct.
- Memorizacion selectiva de hechos guiada por instrucciones en lenguaje natural (controlabilidad de la memoria, objeto central del paper).
- Refusal: capacidad de rechazar la memorizacion o recuperacion de determinados contenidos, segun lo descrito en el repositorio.
- Actualizacion de memoria a largo plazo con olvido minimo, en el marco de metodos de memoria neural.
- Modo de uso principal a traves del repositorio de codigo, invocando la clave de registro `memoryllm_chat`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni thinking mode.
- Idiomas soportados: no disponible.

## Casos de uso
- Investigacion en memoria neural: reproducir la ablation "frozen-memory-write" para comparar el rendimiento frente al modelo CounterFACT completo y cuantificar el valor de aprender a escribir en memoria. Es el proposito explicito del checkpoint.
- Evaluacion academica de la Tabla 1 del paper: ejecutar los comandos de evaluacion CounterFACT del repositorio para generar los resultados comparativos entre variantes del sistema GNM.
- Experimentos de adaptacion continua: estudiar como un agente que actualiza su memoria a partir de nuevas fuentes de informacion se comporta cuando la escritura de memoria esta congelada respecto a cuando no lo esta.
- Analisis de memorizacion selectiva y refusal: evaluar el comportamiento del modelo al instruirle sobre que hechos memorizar o rechazar, con fines de estudio de controlabilidad.
- Dominios criticos como sanidad (mencionados en el abstract del paper): servir como base para estudiar agentes que deben aprender de forma incremental con olvido minimo, siempre en fase de investigacion.
- Comparativas de arquitecturas con memoria: usar este checkpoint como brazo de control en estudios que comparen MemoryLLM, GNM y modelos sin memoria explicita.
- Docencia y formacion: ilustrar en cursos de machine learning como se aislan componentes de un sistema de entrenamiento mediante ablaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El paper de referencia menciona una evaluacion CounterFACT (Tabla 1) y el repositorio incluye comandos para reproducirla, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de la propia tarea CounterFACT en el material facilitado.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: en torno a 19,6 GB de pesos (coincide con el tamano del repositorio, 19,6 GB), mas overhead de activaciones; se recomienda disponer de 24 GB o mas.
- En cuantizacion INT8: aproximadamente 10-12 GB de VRAM estimados.
- En cuantizacion INT4: aproximadamente 6-7 GB de VRAM estimados.
- GPU recomendadas: A100 (40/80 GB), H100, y para cuantizaciones agresivas tarjetas consumer como RTX 3090 o RTX 4090 (24 GB).
- Cabe en GPU consumer: si, en RTX 3090/4090 con cuantizacion INT8 o INT4; en FP16 requiere al menos una GPU de 24 GB y puede resultar ajustado.
- Opciones de despliegue: el flujo oficial es el repositorio `maxbennett/Generalized-Neural-Memory` con la clave de registro `memoryllm_chat`; al estar basado en Llama-3 y publicarse en safetensors, en principio es compatible con herramientas del ecosistema Llama (vLLM, TGI, llama.cpp, Ollama), si bien las capas de memoria adicionales pueden requerir codigo especifico del repositorio. No se documenta compatibilidad oficial con esos frameworks.
- Latencia y throughput estimados: no disponibles para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria controlable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GNM CounterFACT ablation (este modelo) | 9,78 B | no disponible | Si (escritura congelada) | llama3 | HuggingFace + repo de codigo |
| meta-llama/Meta-Llama-3-8B-Instruct (backbone) | ~8,03 B | 8.192 tokens | No | llama3 | HuggingFace |
| generalized-neural-memory-gnm-all-ablation | no disponible | no disponible | Si (ablation total) | no disponible | HuggingFace |
| MemoryLLM | no disponible | no disponible | Memoria neural con politica fija | no disponible | Repositorio de investigacion |

Los datos de parametros, contexto y licencia de MemoryLLM y del modelo `gnm-all-ablation` no se detallan en la informacion proporcionada; para el backbone Llama-3-8B-Instruct se indican valores de referencia conocidos.

## Limitaciones y advertencias
- Se trata de un checkpoint de investigacion con 7 descargas y 1 like; no esta pensado ni validado para uso en produccion.
- Es una ablation experimental cuyo proposito es servir de brazo de control; no debe interpretarse como el modelo GNM "completo" ni como el mejor checkpoint de la familia.
- No se documentan sesgos conocidos, pero al derivar de Llama-3-8B-Instruct hereda potencialmente los sesgos del backbone.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de generacion de texto, el riesgo existe y no esta cuantificado.
- Idiomas soportados no disponibles; no se garantiza cobertura multilingue especifica.
- Longitud de contexto no confirmada para esta variante, especialmente por la interaccion con las capas de memoria.
- Restricciones de licencia: se distribuye bajo licencia llama3, por lo que el uso comercial esta sujeto a los terminos de la Llama 3 Community License y a las condiciones de atribucion correspondientes a Meta.
- El uso oficial requiere el repositorio de codigo del autor; la carga directa de los safetensors puede no funcionar sin la logica de memoria asociada.
- No se documentan requisitos de hardware, cuantizaciones soportadas ni metricas de latencia, lo que dificulta una planificacion de despliegue realista.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/maxbennett/generalized-neural-memory-gnm-counterfact-ablation
- Repositorio de codigo (GitHub): https://github.com/maxbennett/Generalized-Neural-Memory
- README del repositorio: https://github.com/maxbennett/Generalized-Neural-Memory/blob/main/README.md
- Paper (PDF, arXiv 2602.23201v2): https://arxiv.org/pdf/2602.23201v2
- Paper (HTML, arXiv 2602.23201v2): https://arxiv.org/html/2602.23201v2
- Variante `gnm-all-ablation` en HuggingFace: https://huggingface.co/maxbennett/generalized-neural-memory-gnm-all-ablation
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
