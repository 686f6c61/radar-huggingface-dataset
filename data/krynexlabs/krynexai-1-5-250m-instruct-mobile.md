# KrynexLabs/KrynexAI-1.5-250M-Instruct-Mobile

## Resumen

KrynexAI-1.5-250M-Instruct-Mobile es un modelo de lenguaje de pequeno tamano (SLM) desarrollado por KrynexLabs, disenado especificamente para inferencia en dispositivos locales y entornos edge. Con 229,7 millones de parametros reales (nominalmente 250M) y una arquitectura Llama clasica con 32 capas, el modelo se posiciona como una alternativa ligera para tareas de generacion de texto conversacional donde el coste computacional y el consumo de memoria son criticos.

El modelo ha sido entrenado desde el checkpoint base SupraLabs/Supra2.1-Ultra (del que se distribuye tambien una version cuantizada) sobre aproximadamente 40.400 millones de tokens, un volumen de entrenamiento inusualmente alto para su tamano, lo que sugiere un esfuerzo por maximizar la calidad dentro de las restricciones de un SLM. Incorpora atencion con Grouped Query Attention (GQA) con 4 cabezas KV, embeddings atados y activacion SwiGLU, tecnicas estandar en modelos modernos que reducen el uso de memoria y mejoran la eficiencia.

Su relevancia actual radica en el creciente interes por modelos que puedan ejecutarse en moviles, navegadores o hardware de bajo consumo sin depender de la nube. Con licencia Apache 2.0 y pesos disponibles en safetensors y GGUF, el modelo apunta a desarrolladores que necesitan un componente de IA generativa embebible con requisitos minimos de infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer causal decoder-only) |
| Parametros totales | 229.688.064 (nominal 250M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | bfloat16 nativo; GGUF disponible (no se detallan variantes) |
| Idiomas soportados | en, fr, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

Especificaciones adicionales declaradas por el autor: 32 capas, hidden size 768, intermediate size (MLP) 1.920, 12 cabezas de atencion con dimension 64, 4 cabezas KV (GQA), vocabulario de 49.152 tokens, RoPE theta 10.000, activacion SiLU con MLP SwiGLU y embeddings atados.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estilo Llama, con 32 capas y un tamano oculto de 768. Emplea Grouped Query Attention con 12 cabezas de consulta y 4 cabezas KV, lo que reduce el tamano de la cache KV en un factor de 3 respecto a atencion multi-cabeza completa, algo especialmente relevante para despliegue en dispositivos con memoria limitada. El MLP usa SwiGLU con tamano intermedio de 1.920, y los embeddings de entrada y salida estan atados, lo que elimina una matriz de 49.152 x 768 parametros adicionales.

El entrenamiento se realizo sobre aproximadamente 40.400 millones de tokens, un ratio de tokens por parametro de unas 176 veces, muy por encima de la regla de Chinchilla (20 tokens/parametro), lo que indica un regimen de sobrentrenamiento deliberado habitual en SLMs modernos para exprimir la capacidad del modelo. El autor declara entrenamiento en una unica GPU A100 SXM. Los datasets referenciados incluyen KrynexAI-Santa-Ana-Tusi-Pasco-Quechua, KrynexAI-Dataset-Mini-Top1 y KrynexAI-Dataset-Flash-Instruction, aunque no se detalla su composicion ni el proceso de alineacion (RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto causal y conversacion multi-turno en formato instruct.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por su tamano.
- Generacion de codigo y texto tecnico sencillo (sin benchmarks publicados que lo cuantifiquen).
- Aritmetica basica (resultado de 38,20 en Arithmark-v3 acc_norm).
- Soporte multilingue declarado para ingles, frances y chino; no se declara castellano.
- Capacidad de ejecucion en dispositivo (on-device) y entornos edge gracias a su reducido footprint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones moviles: con 229,7M de parametros en bfloat16 (unos 460 MB de pesos) o en cuantizacion de 4 bits (unos 120 MB), el modelo puede integrarse en apps iOS/Android para respuestas offline sin llamadas a API, usando su contexto de 2.048 tokens para conversaciones cortas.
- Autocompletado y generacion de texto en editores locales: su baja latencia potencial en CPU y la disponibilidad de GGUF permiten integrarlo en herramientas de escritorio tipo plugin de IDE o editor de notas para sugerencias de texto en ingles, frances o chino.
- Clasificacion y etiquetado de texto en pipelines edge: el modelo puede usarse como generador de etiquetas o resumenes cortos en dispositivos IoT o gateways con recursos limitados, donde un modelo mayor no es viable.
- Prototipado rapido de chatbots: al ser Apache 2.0 y cargarse con `transformers` en pocas lineas, sirve para validar flujos conversacionales antes de migrar a modelos mayores, con coste de infraestructura practicamente nulo.
- Filtrado y moderacion de contenido en local: puede generar respuestas de reformulacion o categorizacion de mensajes en aplicaciones de mensajeria sin enviar datos a servidores externos, lo que ayuda con requisitos de privacidad (RGPD).
- Educacion y demos de IA generativa: su tamano permite ejecutarlo en un portatil o incluso en una Raspberry Pi con cuantizacion agresiva, util para talleres, docencia y demostraciones de inferencia local.
- Generacion de texto en entornos sin conectividad: despliegue en field devices, kioscos o sistemas embebidos donde no hay red y se requiere generacion de texto basica en ingles, frances o chino.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (0-shot):

| Benchmark | Shots | acc | acc_norm | Random |
|---|---|---|---|---|
| HellaSwag | 0 | 31,64 | 37,18 | 25,0 |
| PIQA | 0 | 65,78 | 64,91 | 50,0 |
| ARC-Easy | 0 | 57,11 | 50,46 | 25,0 |
| ARC-Challenge | 0 | 25,00 | 26,28 | 25,0 |
| Arithmark-v3 | 0 | 38,00 | 38,20 | no disponible |
| Open SLM Leaderboard II | - | 20,64 | - | - |

Los resultados son coherentes con un modelo de 250M: supera claramente el azar en PIQA y ARC-Easy, pero esta cerca del azar en ARC-Challenge (26,28 frente a 25,0). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,5 GB para pesos, mas cache KV y activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en cuantizacion de 4 bits (GGUF): aproximadamente 0,15-0,2 GB para pesos, ejecutable en CPU sin GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo desde una GTX 1650 o RTX 3050 en adelante es mas que suficiente; A100/H100 no son necesarios salvo para entrenamiento o despliegue masivo.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPU.
- Opciones de despliegue: `transformers` (referencia), llama.cpp y Ollama mediante los pesos GGUF publicados; vLLM y TGI son compatibles tecnicamente pero sobredimensionados para este tamano.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia interactiva en CPU moderna y muy alta en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| KrynexAI-1.5-250M-Instruct-Mobile | 229,7M | 2.048 | Apache 2.0 | en, fr, zh | HF (safetensors, GGUF) |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Apache 2.0 | multilingue (incl. es) | HF |
| SmolLM2-360M-Instruct | ~362M | 8.192 | Apache 2.0 | en (principalmente) | HF |
| TinyLlama-1.1B-Chat | ~1.100M | 2.048 | Apache 2.0 | en (principalmente) | HF |

Los datos de los modelos comparables son de conocimiento general; no se dispone de comparaciones de benchmark directas publicadas entre KrynexAI-1.5 y estos modelos en la informacion proporcionada. KrynexAI-1.5 destaca por su menor tamano y su enfoque explicito en movilidad, pero ofrece un contexto mas corto (2.048) y un soporte de idiomas mas limitado que Qwen2.5-0.5B o SmolLM2.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion: con 250M de parametros, el conocimiento factual es muy limitado y las respuestas pueden ser incorrectas o incoherentes en temas especializados.
- Rendimiento bajo en razonamiento complejo: ARC-Challenge apenas supera el azar (26,28 acc_norm), lo que desaconseja su uso en tareas que requieran razonamiento abstracto.
- Contexto corto (2.048 tokens): insuficiente para documentos largos, conversaciones extensas o tareas de resumen de multiples fuentes.
- Cobertura idiomatica limitada: solo se declaran en, fr y zh; no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad; al entrenarse sobre datasets no descritos en detalle, pueden persistir sesgos de los datos de origen.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion; no hay restricciones adicionales conocidas.
- Caveat de produccion: la model card no detalla el proceso de alineacion (RLHF/DPO) ni la composicion de los datasets; la calidad del modo instruct no esta cuantificada con benchmarks de instrucciones.
- Fecha de creacion (2026-11-02) y bajo numero de likes (1) sugieren un modelo reciente y poco validado por la comunidad; conviene evaluarlo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/KrynexLabs/KrynexAI-1.5-250M-Instruct-Mobile
- Modelo base: https://huggingface.co/SupraLabs/Supra2.1-Ultra
- Dataset KrynexAI-Santa-Ana-Tusi-Pasco-Quechua: https://huggingface.co/datasets/KrynexLabs/KrynexAI-Santa-Ana-Tusi-Pasco-Quechua
- Dataset KrynexAI-Dataset-Mini-Top1: https://huggingface.co/datasets/KrynexLabs/KrynexAI-Dataset-Mini-Top1
- Dataset KrynexAI-Dataset-Flash-Instruction: https://huggingface.co/datasets/KrynexLabs/KrynexAI-Dataset-Flash-Instruction
