# nace-ai/Qwen3.6-35B-A3B-MLX-Q5

## Resumen

Qwen3.6-35B-A3B-MLX-Q5 es una cuantización de 5 bits en formato MLX del modelo Qwen3.6-35B-A3B de Alibaba Qwen, preparada por Nace.AI para su ejecución en Apple silicon. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 35.107.181.936 parámetros totales y capacidad multimodal de entrada imagen-texto, orientado a conversación y razonamiento. Esta versión concreta conserva la licencia Apache 2.0 del original y se distribuye en safetensors para la librería MLX.

El pack pesa 23,0 GB en total, de los cuales 22,07 GB corresponden a los pesos del modelo de lenguaje a una media de 5,094 bits por peso, e incorpora una torre de visión tomada de mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit (333 tensores, 893.142.496 bytes). La cuantización de Nace.AI ajusta cada grupo de pesos contra el comportamiento del modelo en texto real, no solo contra los valores de los pesos, y produce un pack MLX estándar sin dependencias adicionales.

Su relevancia actual radica en que permite ejecutar un MoE de 35B con capacidades multimodales y tool calling en hardware Apple silicon con 23 GB de ficheros, manteniendo una divergencia respecto al modelo BF16 de 0,0271 KL en texto original y 0,0681 KL en texto de chat y tool-calls. El modelo piensa antes de responder por defecto, lo que exige configuraciones de muestreo específicas y espacio suficiente para tokens de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_5_moe), con torre de visión |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits MLX (5,094 bits por peso de media); existe variante Q4 del mismo autor |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pack MLX; 6 ficheros, 22.961.646.328 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con capacidades multimodales de entrada imagen-texto, tal como indica la etiqueta `qwen3_5_moe` y el pipeline `image-text-to-text`. Esta cuantización preserva la estructura del modelo original y le añade una torre de visión procedente de mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit, con 333 tensores y 893.142.496 bytes. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

La innovación técnica de este pack es el método de cuantización de Nace.AI, que ajusta cada grupo de pesos contra el comportamiento del modelo sobre texto real en lugar de limitarse a minimizar el error sobre los pesos. El resultado son 22,07 GB de pesos de lenguaje a 5,094 bits por peso, con una divergencia de 0,0271 KL frente al BF16 en texto original (32.704 tokens evaluados) y 0,0681 KL en texto de chat y tool-calls (65.472 tokens). Además, 20 de 20 ensayos con el modo de pensamiento desactivado completaron correctamente la llamada a herramienta y el ciclo completo. La ejecución de referencia se realizó en una NVIDIA H200 de 151 GB con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Entrada de imágenes combinada con texto (pipeline image-text-to-text), gracias a la torre de visión incluida.
- Razonamiento con modo de pensamiento (thinking) activado por defecto antes de responder.
- Tool calling / function calling: los ensayos del pack confirman la colocación de llamadas y la finalización del ciclo completo en 20 de 20 pruebas con thinking desactivado.
- Configuraciones de muestreo diferenciadas para pensamiento, pensamiento con código preciso y pensamiento desactivado.
- Capacidad multilingüe limitada según la model card, que declara únicamente inglés (`en`).
- Generación de hasta 32.768 tokens de salida en la mayoría de tareas con thinking activo.

## Casos de uso

- Asistente conversacional local en Mac: el pack MLX está pensado para Apple silicon y permite desplegar un MoE de 35B en un equipo de sobremesa con 23 GB de ficheros, gestionando diálogos multi-turno con el modo de pensamiento activado.
- Automatización con herramientas en local: el soporte de tool calling verificado (20/20 ensayos) permite integrar el modelo en flujos que consultan APIs o ejecutan funciones, con la configuración de muestreo adecuada para pensamiento desactivado.
- Análisis de imágenes con descripción textual: la torre de visión incluida permite tareas de image-text-to-text, como extracción de información de capturas o descripción de contenido visual en un pipeline local.
- Prototipado de agentes multi-paso en estaciones de trabajo Apple: el modo de pensamiento por defecto y el margen de hasta 32.768 tokens de salida facilitan razonamiento encadenado antes de actuar.
- Evaluación de cuantizaciones para investigación: los datos de KL frente a BF16 (0,0271 en texto original, 0,0681 en chat y tool-calls) permiten comparar la pérdida de calidad de este pack con otras cuantizaciones MLX públicas (unsloth UD-3bit, mlx-community 4-bit, Nace Q4).
- Generación de código asistida con configuración precisa: la model card recomienda temperature 0,6, top_p 0,95, top_k 20 y presence_penalty 0,0 para coding preciso con pensamiento activado, un ajuste útil en tareas de programación local.
- Despliegue sin dependencias nuevas: al ser un pack MLX estándar, se integra en flujos existentes basados en mlx-lm sin instalar software adicional.

## Benchmarks y rendimiento

| Prueba | Nace Q5 (este repo) | Tokens evaluados |
|---|---:|---:|
| KL frente al modelo BF16, texto original (menor es mejor) | 0,0271 | 32.704 |
| KL frente al modelo BF16, texto de chat y tool-calls (menor es mejor) | 0,0681 | 65.472 |
| Ensayos de tool calling con thinking desactivado | 20 de 20 completados | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card advierte que este pack se evaluó sobre token IDs distintos a los de otros packs, por lo que no se reclama una mejora emparejada frente a ellos; la comparación emparejada la aporta el hermano Q4.

## Requisitos de hardware

- Espacio en disco: 23,0 GB de ficheros; 22,07 GB corresponden a pesos del modelo de lenguaje.
- VRAM/unified memory estimada: no disponible de forma explícita; por el tamaño de los pesos (22,07 GB) se requiere un equipo con al menos esa capacidad disponible para el modelo, más margen para contexto y caché.
- GPU recomendadas: el pack está destinado a Apple silicon (MLX); la ejecución de referencia del autor se realizó en una NVIDIA H200 de 151 GB, no en hardware Apple.
- Compatibilidad con GPU de consumo: no se especifica en la información disponible; el formato MLX limita el uso a equipos Apple silicon.
- Opciones de despliegue: mlx-lm (versión de referencia 0.32.2) sobre mlx 0.32.4; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KL frente a BF16 | Licencia | Formato |
|---|---|---|---|---|---|---|
| Nace Q5 (este repo) | 35,1B totales | no disponible | 5 bits MLX, 5,094 bpw | 0,0271 (texto original); 0,0681 (chat/tool) | apache-2.0 | safetensors MLX |
| Nace Q4 (mismo autor) | 35,1B totales | no disponible | 4 bits MLX | comparación emparejada disponible en su model card | apache-2.0 | safetensors MLX |
| mlx-community 4-bit | 35,1B totales | no disponible | 4 bits MLX | incluido en la gráfica comparativa del autor | no disponible | MLX |
| unsloth UD-3bit | 35,1B totales | no disponible | 3 bits (unsloth dynamic) | incluido en la gráfica comparativa del autor | no disponible | MLX |

La model card incluye una gráfica de KL medio frente al tamaño del fichero de pesos que compara Nace Q4 y Q5 con los packs públicos mlx-community 4-bit y unsloth UD-3bit, pero los valores numéricos de estos competidores no se detallan en el texto disponible.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Alucinación: no se documentan evaluaciones específicas de factualidad; el modo de pensamiento por defecto puede alargar las respuestas y aumentar el coste de cómputo.
- Repetición: la model card advierte que un presence_penalty entre 0 y 2 limita la repetición infinita, pero valores altos pueden mezclar idiomas.
- Contexto: la longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con ventanas largas.
- Cuantización: existe una pérdida medible frente al BF16 (0,0271 KL en texto original y 0,0681 en chat/tool-calls); para tareas sensibles a la precisión conviene validar contra el modelo completo.
- Compatibilidad de comandos: la propia model card indica que los comandos de este pack aún se están probando y remite a la card de Qwen3.5-9B Q4 para los que funcionaron allí.
- Tool calling: la verificación de 20/20 se realizó con el modo de pensamiento desactivado; no se documenta el comportamiento con thinking activo.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.6-35B-A3B.
- Hardware: el formato MLX restringe el despliegue a Apple silicon; la ejecución de referencia en H200 no garantiza el mismo comportamiento en Mac.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-Q5
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Pack Q4 del mismo autor: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX
- Card de referencia Qwen3.5-9B Q4: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Torre de visión de origen: mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit
- Resultados completos del autor: results.json (junto a la model card en el repositorio)
