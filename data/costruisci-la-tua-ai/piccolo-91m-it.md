# costruisci-la-tua-ai/piccolo-91m-it

## Resumen

Piccolo 91M (italiano) es un modelo de lenguaje de tipo GPT entrenado desde cero por el autor Antonio Maraucci como material didactico para el libro *Costruisci la tua AI*. No deriva de ningun modelo preexistente: la arquitectura se escribio linea por linea, el tokenizer se entreno especificamente para el proyecto y los pesos partieron de inicializacion aleatoria. Su proposito es pedagogico: mostrar de forma tangible que aprende un Transformer durante un entrenamiento de pocos minutos.

Tecnicamente es un Transformer decoder-only de 12 capas, 12 cabezas de atencion, dimension oculta de 768 y una ventana de contexto de solo 256 tokens. Cuenta con 91,20 millones de parametros y un tokenizer BPE a nivel de byte con un vocabulario de 8.000 tokens. El entrenamiento se realizo sobre 57.164 articulos de Wikipedia en italiano (109 millones de tokens disponibles), con 5.000 pasos y aproximadamente 41 millones de tokens vistos.

Es relevante en el contexto de la formacion y la docencia: demuestra que es posible entrenar un modelo funcional en 6,6 minutos sobre una unica GPU profesional alquilada (NVIDIA RTX PRO 4500 de 32 GB), a unos 107.000 tokens por segundo. No esta pensado para produccion ni para responder preguntas factuales, sino para experimentar con el ciclo completo de entrenamiento de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 12 capas, 12 cabezas, dimension 768 |
| Parametros totales | 91.396.608 (91,20 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, PyTorch (`migliore.pt`) |

## Arquitectura y entrenamiento

Se trata de un Transformer decoder-only clasico, sin mecanismos MoE ni hibridos. La configuracion es de 12 capas, 12 cabezas de atencion y una dimension de modelo de 768, con un tokenizer BPE a nivel de byte de 8.000 tokens entrenado sobre el mismo corpus. El checkpoint incluye pesos, configuracion y numero de paso; la capa `token.weight` se reutiliza como `testa.weight` (weight tying), por lo que no se duplica en el safetensors.

El corpus de entrenamiento son 57.164 entradas de Wikipedia en italiano (`wikimedia/wikipedia`, version 20231101.it), con un total de 109 millones de tokens. El entrenamiento consistio en 5.000 pasos con lotes de 32 secuencias, cubriendo unos 41 millones de tokens, sobre una NVIDIA RTX PRO 4500 de 32 GB en RunPod. El proceso completo duro 6,6 minutos a unos 107.000 tokens por segundo, alcanzando una loss de validacion de 3,560. No se documenta uso de RLHF, DPO ni tecnicas de alineacion adicionales; es un modelo de preentrenamiento puro.

## Capacidades

- Generacion de texto en italiano con fluidez gramatical y estilo enciclopedico.
- Continuacion de textos cortos (hasta 256 tokens de contexto).
- Capacidad de razonamiento, matematicas y codigo: no disponible (no documentada).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al italiano.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Modelo didactico: su funcion es ilustrar el comportamiento de un Transformer, no resolver tareas.

## Casos de uso

- Docencia y formacion en LLM: sirve como ejemplo reproducible de un Transformer entrenado desde cero, con codigo y pasos documentados en el repositorio del libro, para que estudiantes vean el efecto de cada decision de arquitectura y de datos.
- Experimentos de continuacion de texto en italiano: dado un fragmento breve (por ejemplo, el inicio de un articulo de Wikipedia), el modelo genera una continuacion estilisticamente coherente, util para demostrar el modelado del lenguaje.
- Estudio de tokenizers BPE: al incluir un tokenizer entrenado ad hoc de 8.000 tokens, permite analizar como afecta el tamano del vocabulario a la calidad de la generacion en un corpus italiano.
- Reproduccion de pipelines de entrenamiento a pequena escala: el modelo se reentrena en minutos sobre una sola GPU, lo que lo hace adecuado para practicas de laboratorio o talleres donde se itera sobre hiperparametros.
- Analisis de curvas de loss y sobreajuste: con una loss de validacion conocida (3,560) y un presupuesto de 41 millones de tokens vistos, sirve como caso base para comparar tecnicas de regularizacion o cambios en la composicion del dataset.
- Demostracion de limitaciones de contexto: con solo 256 tokens de ventana, es un ejemplo directo para explicar por que los modelos modernos necesitan contextos largos y como afecta la truncacion a la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la loss de validacion de 3,560 en el mejor checkpoint, junto con el throughput de entrenamiento (aproximadamente 107.000 tokens por segundo en una RTX PRO 4500 de 32 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp32 ocupa aproximadamente 0,37 GB (91,4 M de parametros x 4 bytes); en fp16 unos 0,18 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se ha entrenado en una NVIDIA RTX PRO 4500 de 32 GB, pero la inferencia funciona en GTX 1650, RTX 3060, RTX 4090, etc.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU para inferencia.
- Opciones de despliegue: PyTorch nativo con el script `prova.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible para inferencia; en entrenamiento se alcanzaron unos 107.000 tokens por segundo en la GPU citada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| Piccolo 91M (este modelo) | 91,4 M | 256 | Italiano | CC BY-SA 4.0 | Didactico, desde cero |
| GPT-2 small | 124 M | 1.024 | Ingles | MIT | Preentrenamiento general |
| TinyLlama 1.1B | 1.100 M | 2.048 | Ingles (multilingue parcial) | Apache 2.0 | Preentrenamiento + alineacion |
| SmolLM-135M | 135 M | 2.048 | Ingles | Apache 2.0 | Preentrenamiento a gran escala |

La comparacion con GPT-2 small, TinyLlama o SmolLM es solo orientativa: Piccolo 91M no persigue el rendimiento de estos modelos, sino la transparencia del proceso de construccion. No se dispone de datos de benchmarks comparativos publicados para este modelo.

## Limitaciones y advertencias

- Alucinacion sistematica: el autor advierte explicitamente que inventa lugares, fechas y numeros; no debe usarse como fuente de informacion.
- Sesgos: entrenado unicamente con Wikipedia en italiano, hereda los sesgos y el estilo enciclopedico de ese corpus, sin filtrado adicional documentado.
- Limitacion de contexto: 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Limitacion de idioma: solo italiano; no se ha entrenado para otros idiomas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir igual; es necesario citar a los contribuyentes de Wikipedia en italiano y distribuir las obras derivadas bajo la misma licencia.
- Caveat de produccion: es un modelo didactico de 91 M de parametros; no es adecuado para atencion al cliente, generacion de codigo en produccion ni tareas que requieran precision factual.
- Sin alineacion: no se documenta RLHF, DPO ni ajuste de instrucciones, por lo que no responde bien a formatos de chat o instrucciones.

## Enlaces

- Hugging Face: https://huggingface.co/costruisci-la-tua-ai/piccolo-91m-it
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Repositorio del libro (codigo de reentrenamiento, carpeta `piccolo/`): no disponible como URL en la informacion proporcionada.
