# B4BUK4/vizwiz-alttext-lora-phase4

## Resumen

B4BUK4/vizwiz-alttext-lora-phase4 es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base facebook/opt-2.7b, un transformer decoder-only de 2.700 millones de parametros desarrollado originalmente por Meta AI. El adaptador se distribuye como un repositorio PEFT independiente de aproximadamente 0,5 GB, lo que sugiere que unicamente contiene los pesos del adaptador y no una copia completa del modelo base. El nombre del repositorio indica que el ajuste fino se ha orientado a la generacion de texto alternativo (alt-text) sobre el dataset VizWiz, un corpus de preguntas visuales planteadas por personas con discapacidad visual.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo tipico de adaptador comunitario de bajo perfil, publicado sin model card completada, sin licencia declarada y sin metricas de evaluacion. Resulta util como referencia para entender el flujo de trabajo PEFT sobre modelos OPT y para documentar buenas practicas de publicacion que aqui brillan por su ausencia.

El modelo se publico el 24 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones. Toda la informacion tecnica disponible procede de los metadatos del repositorio y del nombre del propio adaptador; el resto de apartados se documenta explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only OPT |
| Parametros totales | 2.700 millones (modelo base facebook/opt-2.7b); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (valor estandar de la familia OPT; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (el modelo base OPT esta entrenado principalmente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Version de PEFT | 0.21.2 |
| Modelo base | facebook/opt-2.7b |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El adaptador se apoya en facebook/opt-2.7b, un transformer decoder-only con atencion causal, 2.700 millones de parametros y embeddings posicionales aprendidos. La familia OPT fue entrenada por Meta AI sobre un corpus predominantemente en ingles y constituye uno de los primeros grandes modelos abiertos comparables a GPT-3 en escala reducida. Sobre esta base, el adaptador aplica la tecnica LoRA descrita en Hu et al. (arXiv:2106.09685), que congela los pesos originales e inserta matrices de bajo rango en determinadas capas para reducir drasticamente el coste de ajuste fino.

El nombre del repositorio sugiere un ajuste fino orientado a la generacion de alt-text sobre el dataset VizWiz, probablemente en una cuarta fase de un entrenamiento por etapas. Sin embargo, la model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, los hiperparametros de LoRA (rango, alpha, dropout, capas objetivo), el regimen de precision ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se especifica el objetivo exacto de entrenamiento ni la funcion de perdida empleada. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base OPT-2.7B.
- Generacion de texto alternativo (alt-text) para imagenes, segun indica el nombre del adaptador; no confirmado por documentacion oficial.
- Razonamiento basico y respuesta a preguntas de dominio general, limitado por el tamano del modelo base.
- Soporte de tool calling: no disponible; el modelo base OPT no incorpora entrenamiento especifico para function calling.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; OPT esta entrenado mayoritariamente en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles. El modelo base es exclusivamente de texto; la referencia a VizWiz en el nombre no implica que el adaptador procese imagenes.

## Casos de uso

- Generacion de alt-text asistida en ingles: el adaptador podria emplearse para producir descripciones textuales a partir de metadatos o preguntas asociadas a imagenes, siempre que se integre en un pipeline externo de vision que aporte la informacion visual, ya que el modelo base es solo de texto.
- Prototipado de accesibilidad web: util para experimentar con la generacion automatica de descripciones breves en ingles dentro de herramientas de auditoria de accesibilidad, con revision humana obligatoria.
- Investigacion sobre ajuste fino PEFT: sirve como ejemplo reproducible de un adaptador LoRA sobre OPT-2.7B para estudiar el impacto de fases multiples de entrenamiento.
- Docencia y formacion: util para demostrar el flujo completo de carga de un adaptador PEFT con transformers y su fusion con el modelo base.
- Generacion de texto de dominio general en ingles: puede emplearse como modelo de texto pequeno en entornos con recursos limitados, aprovechando que el adaptador ocupa solo 0,5 GB y se combina con el base en tiempo de carga.
- Experimentacion con datasets VizWiz: punto de partida para comparar estrategias de ajuste fino sobre este corpus en tareas de descripcion y respuesta a preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el modelo base OPT-2.7B requiere aproximadamente 5,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contextos moderados. En cuantizacion de 8 bits, en torno a 3 GB; en 4 bits, en torno a 1,8 GB. El adaptador anade una cantidad marginal de memoria.
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion; RTX 4090, RTX 3090 o RTX A6000 para desarrollo.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) usando fp16 o cuantizacion; en 4 bits puede ejecutarse en GPUs con 4-6 GB.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM o TGI tras fusionar el adaptador con el modelo base, y llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| B4BUK4/vizwiz-alttext-lora-phase4 | 2.700 M (base) + adaptador | 2048 (base) | no disponible | Hugging Face |
| facebook/opt-2.7b | 2.700 M | 2048 | OPT-175B License (no comercial segun terminos originales) | Hugging Face |
| meta-llama/Llama-3.2-3B | 3.200 M | 128.000 | Llama 3.2 Community License | Hugging Face |
| google/gemma-2-2b | 2.600 M | 8192 | Gemma Terms of Use | Hugging Face |

El adaptador no aporta mejoras medibles documentadas frente a estos modelos; la comparativa se ofrece unicamente como referencia de categoria (modelos de texto de 2-3 mil millones de parametros).

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia no declarada: existe incertidumbre legal sobre el uso comercial, agravada por la licencia original del modelo base OPT.
- Riesgo de alucinacion: el modelo base OPT-2.7B es propenso a generar contenido facticamente incorrecto, especialmente en tareas de descripcion.
- Sesgos: heredados del corpus de entrenamiento de OPT, predominantemente en ingles y sin filtrado documentado.
- Limitacion idiomatica: el modelo base esta entrenado principalmente en ingles; el rendimiento en castellano sera previsiblemente bajo.
- Ambito restringido: el nombre sugiere un ajuste especifico para alt-text sobre VizWiz; su uso fuera de ese dominio no esta validado.
- Sin garantias de produccion: no hay versionado semantico, ni pruebas, ni mantenimiento declarado por parte del autor.
- El adaptador no procesa imagenes por si mismo; requiere un componente de vision externo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/B4BUK4/vizwiz-alttext-lora-phase4
- Modelo base: https://huggingface.co/facebook/opt-2.7b
- Paper de OPT: https://arxiv.org/abs/2205.01068
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de PEFT: https://arxiv.org/abs/1910.09700
- Dataset VizWiz: https://vizwiz.org/
