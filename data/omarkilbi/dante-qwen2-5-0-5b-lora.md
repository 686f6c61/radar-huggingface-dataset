# omarkilbi/dante-qwen2.5-0.5b-lora

## Resumen

Dante Qwen2.5-0.5B LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario omarkilbi que especializa el modelo base Qwen/Qwen2.5-0.5B en el estilo de la *Divina Commedia* de Dante Alighieri. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion de tipo PEFT que se cargan sobre el modelo base de Qwen para modificar su comportamiento generativo hacia el registro linguistico, la metrica y el vocabulario del poema italiano medieval.

El proyecto tiene una vocacion claramente didactica: el autor lo describe como un ejercicio de aprendizaje y lo acompana de un modelo complementario entrenado desde cero (omarkilbi/dante-gpt-scratch, un GPT de 10,65 millones de parametros). El entrenamiento se realizo en una GPU T4 gratuita de Google Colab en aproximadamente 5 minutos, actualizando en torno al 1,8 % de los parametros del modelo base. El corpus utilizado es el texto completo de la *Divina Commedia* del Proyecto Gutenberg (ebook #1000, dominio publico).

La relevancia del adaptador es acotada: sirve como ejemplo reproducible de fine-tuning eficiente con LoRA sobre un modelo pequeno y como banco de pruebas para medir la perplejidad (en bits por caracter) de distintas estrategias de modelado de lenguaje sobre un mismo corpus. No esta pensado para uso en produccion ni para tareas de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-0.5B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen2.5-0.5B tiene 0,5 mil millones) |
| Parametros activos | No aplica (no es MoE); el adaptador actualiza ~1,8 % de los parametros del base |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5-0.5B soporta hasta 32.768 tokens, dato no confirmado en la ficha del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion estandar de transformers) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango r=16, alpha=32 y dropout 0,05 sobre las proyecciones q/k/v/o y gate/up/down del transformer Qwen2.5-0.5B. El entrenamiento uso bloques de 256 tokens, batch efectivo de 16, learning rate 2e-4 con scheduler coseno, 3 epocas y precision mixta fp16, todo ello sobre una T4 de Colab en unos 5 minutos. El corpus es la *Divina Commedia* completa del Proyecto Gutenberg, dividida en un 90 % para entrenamiento y un 10 % para validacion (correspondiente al final del *Paradiso*), con el mismo split que el modelo entrenado desde cero.

La innovacion metodologica del proyecto no esta en la arquitectura sino en la evaluacion: como las perdidas a nivel de token y de caracter no son comparables entre tokenizadores distintos, el autor reporta todos los resultados en bits por caracter sobre el mismo texto de validacion. Esta decision permite comparar de forma justa un modelo de 10,65M entrenado desde cero con un modelo de 0,5B ajustado mediante LoRA. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en italiano con estilo, metrica y registro proximos a la *Divina Commedia*.
- Continuacion de versos y tercetos a partir de un prompt en italiano poetico.
- Reproduccion de estructuras formales del poema, incluyendo encabezados de canto aprendidos del formato del corpus.
- Capacidades residuales del modelo base Qwen2.5-0.5B (generacion general, instrucciones basicas), aunque degradadas por el ajuste especifico.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del italiano.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Experimentacion educativa con LoRA: permite reproducir en una T4 gratuita el flujo completo de fine-tuning PEFT sobre un modelo de 0,5B, sirviendo como plantilla para cursos y tutoriales de ajuste eficiente.
- Generacion de texto poetico en italiano: el adaptador produce continuaciones con rima y metro aproximados a los tercetos encadenados, util para demostraciones de estilo literario.
- Comparativa de estrategias de modelado: al compartir split y metrica (bits por caracter) con dante-gpt-scratch, permite contrastar empiricamente un modelo pequeno desde cero frente a un modelo grande con adaptador.
- Prototipado de interfaces creativas: puede integrarse en demos de escritura asistida o generacion de versos para aplicaciones culturales o museisticas de bajo coste.
- Analisis de memorizacion en modelos preentrenados: el propio autor senala que Qwen2.5 probablemente vio la *Commedia* durante el preentrenamiento, lo que convierte al adaptador en un caso de estudio sobre fuga de datos y evaluacion contaminada.
- Base para experimentos de estilo sobre otros corpus literarios: la configuracion LoRA (r=16, alpha=32, proyecciones q/k/v/o y gate/up/down) es reutilizable como receta para adaptar Qwen2.5-0.5B a otros textos en dominio publico.

## Benchmarks y rendimiento

| Modelo | Bits por caracter (validacion) |
|---|---|
| Qwen2.5-0.5B (base, sin entrenamiento) | 2,220 |
| DanteGPT desde cero (10,65M) | 2,005 |
| Qwen2.5-0.5B + LoRA (este adaptador) | 1,791 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la perdida en bits por caracter sobre el texto de validacion de la *Divina Commedia*.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en fp16 ocupa aproximadamente 1 GB de pesos; el adaptador LoRA anade unas decenas de MB. En fp32, alrededor de 2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; el propio autor entreno el adaptador en una T4 de 16 GB.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3050, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que el adaptador no se distribuye en GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (bits/car.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dante Qwen2.5-0.5B LoRA (este) | Adaptador sobre 0,5B | No disponible | 1,791 | Apache 2.0 | Hugging Face (PEFT) |
| DanteGPT desde cero | 10,65M | No disponible | 2,005 | No disponible | Hugging Face |
| Qwen2.5-0.5B base | 0,5B | No disponible en esta ficha | 2,220 | Apache 2.0 | Hugging Face |

No se dispone de informacion sobre otros adaptadores LoRA comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Proyecto de aprendizaje: el autor lo describe explicitamente como no apto para uso literario o factual.
- Riesgo de memorizacion: Qwen2.5 probablemente incluyo la *Commedia* en su preentrenamiento, por lo que las metricas de validacion estan parcialmente contaminadas.
- Alucinacion y neologismos: el modelo inventa palabras y a veces emite encabezados como "Purgatorio / Canto XXIV" aprendidos del formato del corpus.
- Dominio muy restringido: solo italiano poetico medieval; el rendimiento en otros registros o idiomas no esta garantizado ni documentado.
- Sin soporte documentado de tool calling, agentes ni contexto largo verificado en el adaptador.
- Uso comercial: la licencia Apache 2.0 lo permite tecnicamente, pero el corpus de entrenamiento es de dominio publico y el modelo base tambien es Apache 2.0, por lo que no hay restricciones legales conocidas; aun asi, la calidad no es apta para produccion.
- Repositorio de 0,0 GB y 0 descargas en el momento de la consulta: disponibilidad y mantenimiento no garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omarkilbi/dante-qwen2.5-0.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo complementario entrenado desde cero: https://huggingface.co/omarkilbi/dante-gpt-scratch
- Corpus de entrenamiento (Project Gutenberg ebook #1000): https://www.gutenberg.org/ebooks/1000
