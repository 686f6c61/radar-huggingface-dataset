# AhiskaAI/AhiskaAI-10M-Experimental-v0.1-Base

## Resumen

AhiskaAI-10M-Experimental-v0.1-Base es un modelo de lenguaje pequeño (SLM) ultracompacto de aproximadamente 10,27 millones de parámetros, desarrollado desde cero por la iniciativa independiente AhiskaAI. Su objetivo es explorar los límites mínimos de representación del idioma turco en términos de sintaxis, estructura lingüística y razonamiento sintético, empleando un coste computacional muy reducido. Se trata de un modelo experimental, no destinado a producción, sino a investigación y validación de hipótesis sobre el comportamiento de arquitecturas transformer a escalas extremadamente pequeñas.

El modelo utiliza una arquitectura LlamaForCausalLM con atención multi-cabeza (MHA) en configuración micro: 8 capas, tamaño oculto de 288, 8 cabezas de atención y un vocabulario optimizado de 8.000 tokens. Fue preentrenado durante una única época sobre un corpus sintético turco de aproximadamente 3,5 GB, compuesto por datos web, matemáticos y narrativos. Su longitud de contexto es de 512 tokens y se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors.

La relevancia de este modelo radica en su carácter experimental: permite estudiar qué capacidades lingüísticas y de razonamiento emergen en modelos con menos de 10M de parámetros cuando se entrenan con datos sintéticos densos. Es un punto de referencia útil para la comunidad de investigación en SLM y para el desarrollo de modelos eficientes para el turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Micro MHA) |
| Parametros totales | 10.271.520 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (precisión nativa float32; se puede cargar en float16) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal estándar (LlamaForCausalLM) con atención multi-cabeza convencional, sin mecanismos de atención lineal ni mezclas de expertos. Sus dimensiones concretas son: 8 capas, tamaño oculto de 288, tamaño intermedio de 768 y 8 cabezas de atención (query y key/value). El vocabulario se ha reducido a 8.000 tokens, optimizado para escalas micro.

El preentrenamiento se realizó durante una sola época sobre un corpus sintético turco de aproximadamente 3,5 GB, compuesto por tres conjuntos de datos: BILGE-Synthetic-Web (~2,0 GB, centrado en conocimiento general y gramática), BILGE-Synthetic-Math (~750 MB, razonamiento matemático y lógica) y BILGE-Synthetic-Stories (~750 MB, flujo narrativo y generación de texto). No se menciona el uso de técnicas de alineación como RLHF o DPO. La innovación principal reside en el diseño ultracompacto y en el uso de datos sintéticos densos para maximizar la eficiencia del aprendizaje con recursos mínimos.

## Capacidades

- Generación de texto en turco: produce secuencias coherentes a nivel local, aunque con limitaciones severas por su tamaño.
- Razonamiento matemático básico: puede resolver patrones simples de aritmética y lógica gracias al entrenamiento con datos sintéticos matemáticos.
- Comprensión narrativa: capaz de continuar historias cortas con cierta fluidez, aunque sin mantener coherencia global más allá de unas pocas frases.
- Modelado del lenguaje: captura estructuras gramaticales básicas del turco, como la aglutinación y el orden de palabras.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin soporte de visión ni audio.
- Monolingüe: únicamente turco.

## Casos de uso

- Investigación académica sobre SLM: permite estudiar el impacto del tamaño del modelo y la composición de datos sintéticos en la adquisición de lenguaje. Se puede utilizar como baseline en experimentos controlados.
- Educación en arquitecturas transformer: sirve como ejemplo didáctico para enseñar el funcionamiento de un modelo causal de lenguaje con recursos mínimos, ya que es fácil de ejecutar en CPU.
- Prototipado rápido de pipelines de generación de texto en turco: aunque no apto para producción, puede validar flujos de preprocesado, tokenización y generación antes de escalar a modelos mayores.
- Fine-tuning experimental: al ser tan pequeño, permite probar técnicas de adaptación (LoRA, etc.) con coste casi nulo, evaluando su efecto sobre un modelo base.
- Generación de texto creativo corto: puede producir micro-relatos o continuaciones de frases en turco para demos o pruebas de concepto.
- Benchmarking de frameworks de inferencia: útil para medir la eficiencia de librerías como transformers, llama.cpp u Ollama en tareas de baja carga, al requerir muy poca memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (el modelo en float32 ocupa ~41 MB; en float16 ~20 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior). También funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y en dispositivos embebidos.
- Opciones de despliegue: transformers (Python), llama.cpp, Ollama (si se convierte a GGUF), vLLM (aunque no es necesario por el tamaño).
- Latencia y throughput: extremadamente bajos; en CPU se pueden generar decenas de tokens por segundo. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el ecosistema turco de micro-SLM con características equivalentes. La mayoría de los modelos turcos existentes superan los 100M de parámetros. Por tanto, no se ofrece tabla comparativa.

## Limitaciones y advertencias

- Tamaño extremadamente reducido: limita la coherencia semántica y el razonamiento complejo; el modelo es propenso a repetir fragmentos o perder el hilo.
- Contexto limitado a 512 tokens, insuficiente para tareas que requieran dependencias de largo alcance.
- Solo soporta turco; no funciona en otros idiomas.
- Entrenado únicamente con datos sintéticos, lo que puede inducir sesgos o patrones artificiales no representativos del lenguaje natural real.
- Alto riesgo de alucinación y generación de información factual incorrecta.
- Modelo experimental: no recomendado para uso en producción ni para aplicaciones críticas.
- No se han publicado resultados de evaluación cuantitativa, por lo que se desconoce su rendimiento objetivo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para ello por sus limitaciones técnicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhiskaAI/AhiskaAI-10M-Experimental-v0.1-Base
- Dataset BILGE-Synthetic-Web: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Web
- Dataset BILGE-Synthetic-Math: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Math
- Dataset BILGE-Synthetic-Stories: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Stories
