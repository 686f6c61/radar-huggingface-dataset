# reaperdoesntknow/MoA-155M

## Resumen

MoA-155M es un modelo de generación de texto de pequeno tamano (155 millones de parametros, segun el identificador del repositorio) publicado por el usuario reaperdoesntknow bajo el sello Convergent Intelligence LLC: Research Division. El modelo se distribuye a traves de Hugging Face con la libreria transformers y licencia Apache 2.0, y esta etiquetado con los tags `moa` y `moa_metric`, lo que sugiere la aplicacion de la tecnica Mixture of Agents (MoA) o de una metrica propia del autor. El repositorio ocupa aproximadamente 0,4 GB, lo que es coherente con un modelo en el rango de cientos de millones de parametros almacenado en precision de 16 bits.

La model card publicada es la plantilla por defecto de Hugging Face y no ha sido completada: practicamente todos los campos tecnicos (arquitectura, datos de entrenamiento, hiperparametros, evaluacion, uso previsto) figuran como "[More Information Needed]". La unica informacion sustantiva adicional es una seccion sobre el marco teorico "Discrepancy Calculus (DISC)" del autor, que describe conceptos como operador de discrepancia, conjuntos de salto y "ghost imprinting", pero sin aportar detalles sobre como se aplican a este checkpoint concreto.

Por tanto, esta ficha se construye a partir de los metadatos del repositorio (tamano, datasets declarados, idioma, licencia) y de la informacion estructural disponible, marcando explicitamente como "no disponible" todo aquello que la model card no documenta. Es relevante ahora como ejemplo de checkpoint experimental de bajo coste computacional, pero no debe considerarse un modelo listo para produccion sin una evaluacion independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la documenta; el tag `moa` sugiere Mixture of Agents, sin confirmar) |
| Parametros totales | 155M (segun el identificador del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en transformers; no se listan GGUF ni otras variantes) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / pytorch (libreria transformers; tamano del repo 0,4 GB) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo. El identificador "MoA-155M" y los tags `moa` y `moa_metric` apuntan a la familia Mixture of Agents, pero no se detalla si se trata de un ensemble de agentes, de una destilacion o de un transformer convencional con una capa de agregacion. Tampoco se documenta el tokenizador, la longitud de contexto ni el objetivo de entrenamiento.

Los unicos datos de entrenamiento declarados son dos datasets publicos: `TIGER-Lab/MathInstruct` (instrucciones matematicas) y `yahma/alpaca-cleaned` (instrucciones generales en ingles). No se indica el numero de tokens, la mezcla exacta, si hubo fases de RLHF o DPO, ni los hiperparametros de entrenamiento (regimen de precision, learning rate, batch size). La seccion "Discrepancy Calculus" de la model card describe un marco teorico del autor (operador de discrepancia, jump sets, ghost imprinting) pero no vincula esos conceptos a decisiones concretas de entrenamiento de este checkpoint.

## Capacidades

- Generacion de texto en ingles, segun el pipeline declarado (`text-generation`).
- Ajuste por instrucciones sobre datos de tipo Alpaca y matematicas (MathInstruct), por lo que cabe esperar cierto seguimiento de instrucciones simples, sin datos que lo cuantifiquen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponible.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags), lo que permite desplegarlo mediante la infraestructura de Hugging Face.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: con 155M de parametros y 0,4 GB de pesos, el modelo puede cargarse en CPU o en GPU de gama baja para validar flujos de inferencia antes de migrar a modelos mayores.
- Experimentacion academica con el marco Discrepancy Calculus: util para reproducir o auditar las ideas del autor (operador de discrepancia, jump sets) en un checkpoint pequeno y de licencia permisiva.
- Generacion de respuestas cortas en ingles para tareas de FAQ o clasificacion ligera, siempre que se valide la calidad con un conjunto de evaluacion propio, dado que no hay benchmarks publicados.
- Fine-tuning sobre dominios especificos: al ser Apache 2.0 y de pequeno tamano, sirve como base para ajuste supervisado en tareas acotadas con recursos limitados.
- Educacion y docencia: ejemplo practico de modelo ajustado por instrucciones con datasets publicos (Alpaca, MathInstruct) para ilustrar el ciclo completo de entrenamiento y despliegue.
- Pruebas de integracion con la API de transformers y endpoints compatibles: validar tooling de despliegue (carga, tokenizacion, generacion por lotes) sin incurrir en costes de GPU grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,4 GB en FP16 para los pesos (155M de parametros), mas el overhead de activaciones y cache KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada. Tambien cabe en GPUs de portatil con 4 GB o mas.
- Cabe en consumer GPU: si, practicamente en cualquier GPU dedicada actual e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no estan confirmados porque no se distribuyen pesos GGUF ni se documenta compatibilidad.
- Latencia y throughput estimados: no disponibles; al no conocerse la arquitectura ni el contexto, no es posible dar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MoA-155M (este modelo) | 155M | no disponible | Apache 2.0 | Model card incompleta; sin benchmarks |
| SmolLM2-135M (HuggingFaceTB) | 135M | 8K (segun su model card publica) | Apache 2.0 | Modelo pequeno con evaluacion publicada |
| Qwen2.5-0.5B | 0,5B | 32K (segun su model card publica) | Apache 2.0 | Mayor tamano y contexto documentado |
| TinyLlama-1.1B | 1,1B | 2K (segun su model card publica) | Apache 2.0 | Mayor tamano, pensado para ingles |

La comparacion se limita a tamano y licencia: para MoA-155M no hay datos de contexto ni de rendimiento que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre arquitectura, contexto, tokenizador ni evaluacion, lo que impide garantizar un comportamiento predecible.
- Riesgo alto de alucinacion y de respuestas incoherentes: un modelo de 155M ajustado sobre Alpaca y MathInstruct tiene capacidad limitada para razonamiento complejo y hechos verificables.
- Sesgos desconocidos: los datasets de origen (Alpaca-cleaned y MathInstruct) no se han auditado en esta ficha y el autor no documenta filtrado ni mitigaciones.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al no documentarse la procedencia completa de los datos ni posibles obligaciones heredadas, conviene revisar la trazabilidad antes de un despliegue comercial.
- Sin garantias de mantenimiento: el repositorio tiene 0 likes y una unica actualizacion registrada; no hay evidencia de soporte activo.
- No usar en produccion sin evaluacion propia: al no existir benchmarks, cualquier uso real requiere una bateria de pruebas especifica del dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-155M
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento del marco Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Dataset MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Dataset Alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
