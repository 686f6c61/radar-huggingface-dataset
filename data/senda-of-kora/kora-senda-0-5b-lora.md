# senda-of-kora/kora-senda-0.5b-lora

## Resumen

Kora · La Senda · 0.5B es un adaptador LoRA publicado por el usuario senda-of-kora sobre el modelo base Qwen2.5-0.5B-Instruct, afinado especificamente para narrativa interactiva en espanol. El adaptador recibe como entrada un plan estructurado con cinco secciones (Apertura, Lugar, Conflicto, Giro y Rumbo) y genera una escena de entre 110 y 145 palabras acompanada de tres opciones numeradas, un formato pensado para motores de ficcion interactiva y aventuras conversacionales.

Se trata de un modelo de 494 millones de parametros (0,5B) con arquitectura transformer decoder-only heredada de Qwen2.5, sobre la que se aplica un ajuste fino de bajo rango (LoRA) con rank=8, 16 capas entrenadas, 1200 iteraciones y longitud maxima de secuencia de 512 tokens. El entrenamiento se realizo con 1024 ejemplos sinteticos generados a partir de planes deterministas de Akasha, lo que vincula el modelo a un ecosistema de generacion narrativa procedural concreto.

Su relevancia es acotada pero clara: demuestra como un modelo pequeno (0,5B) puede especializarse en una tarea de formato muy estricto mediante LoRA y cuantizacion GGUF, permitiendo despliegue en hardware modesto. La licencia Apache 2.0 y la publicacion de pesos en GGUF facilitan su uso en prototipos y entornos de bajo coste. No obstante, el modelo no cuenta con descargas ni likes en el momento de la consulta y no publica benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_length de entrenamiento); contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (kora-0.5b-Q4_K_M.gguf); adaptador LoRA sobre safetensors del base |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, un modelo denso de 494 millones de parametros. Sobre esta base se aplica un adaptador LoRA con rank=8, entrenado en 16 capas, durante 1200 iteraciones y con una longitud maxima de secuencia de 512 tokens. El ajuste es de bajo rango, por lo que el coste computacional de entrenamiento es reducido y el adaptador resultante es ligero.

Los datos de entrenamiento consisten en 1024 ejemplos sinteticos generados a partir de planes deterministas de Akasha. Cada ejemplo sigue el esquema estructurado Apertura / Lugar / Conflicto / Giro / Rumbo como entrada y produce una escena de 110-145 palabras mas tres opciones numeradas como salida. No se especifica si hubo RLHF, DPO u otras fases de alineamiento adicionales, ni el numero total de tokens de entrenamiento. La innovacion tecnica principal es la especializacion en un formato de salida muy rigido (longitud controlada y estructura de opciones) mediante un adaptador pequeno sobre un modelo base ya instruido.

## Capacidades

- Generacion de narrativa interactiva en espanol a partir de un plan estructurado de cinco campos.
- Produccion de escenas de longitud controlada (110-145 palabras) con tres opciones numeradas para continuar la historia.
- Soporte bilingue es/en declarado en la model card, aunque el entrenamiento se orienta a narrativa en espanol.
- Conversacion multi-turno heredada del modelo base Qwen2.5-0.5B-Instruct.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta modo thinking, vision ni audio.
- No se documentan capacidades de codigo o matematicas mas alla de las del modelo base.

## Casos de uso

- Motores de ficcion interactiva: el modelo encaja como generador de escenas a partir de planes deterministas, produciendo texto de longitud fija y tres opciones de continuacion, lo que simplifica el parseo en un motor de aventuras conversacionales.
- Prototipado de videojuegos narrativos: al requerir solo 0,5B de parametros y caber en GGUF Q4_K_M, permite iterar rapidamente en local sin infraestructura GPU dedicada.
- Generacion de contenido asistida por plan: util para autores que definen la estructura (Apertura, Lugar, Conflicto, Giro, Rumbo) y delegan la redaccion de la escena al modelo.
- Demostraciones educativas de LoRA: sirve como ejemplo reproducible de ajuste fino de bajo rango sobre un modelo pequeno para una tarea de formato estricto.
- Despliegue en entornos con recursos limitados: al ejecutarse con llama.cpp en CPU o GPU de gama baja, puede integrarse en aplicaciones de escritorio o moviles.
- Experimentacion con narrativa bilingue: el soporte declarado es/en permite probar la transferencia del formato de plan entre idiomas, aunque el entrenamiento se centro en espanol.
- Base para futuros adaptadores: el formato de plan estructurado y la salida con opciones pueden reutilizarse como punto de partida para ajustes sobre modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB para el GGUF Q4_K_M (modelo de 0,5B); el calculo exacto depende del backend y de la longitud de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en Raspberry Pi y dispositivos moviles via llama.cpp.
- Opciones de despliegue: llama.cpp (indicado en la model card), Ollama y otros runners compatibles con GGUF; el adaptador LoRA puede cargarse sobre el base con frameworks que soporten PEFT.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kora · La Senda · 0.5B | 494 M | 512 (entrenamiento) | Apache 2.0 | GGUF / LoRA | Especializado en narrativa interactiva con plan estructurado |
| Qwen2.5-0.5B-Instruct | 494 M | no disponible en la informacion | Apache 2.0 | safetensors | Modelo base generalista; sin especializacion narrativa |
| Alternativas de 0,5B para narrativa | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables directos en la informacion |

La comparativa se limita al modelo base, ya que no se han identificado en la informacion proporcionada otros adaptadores de narrativa interactiva del mismo tamano y formato.

## Limitaciones y advertencias

- El modelo se entrena con solo 1024 ejemplos sinteticos, lo que limita la diversidad y puede producir respuestas repetitivas o rigidas fuera del formato de plan esperado.
- La longitud de contexto de entrenamiento es de 512 tokens; entradas mas largas pueden degradar la calidad o truncarse.
- Riesgo de alucinacion inherente a un modelo de 0,5B, especialmente en coherencia narrativa a largo plazo y en el mantenimiento de consistencia entre escenas.
- El soporte bilingue es/en esta declarado, pero el entrenamiento se orienta al espanol; el rendimiento en ingles puede ser inferior.
- No se documentan evaluaciones de sesgo; al ser un modelo pequeno y con datos sinteticos, los sesgos dependen en gran medida del modelo base Qwen2.5.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct tambien debe cumplir su propia licencia (Apache 2.0), por lo que no se anaden restricciones adicionales conocidas.
- El repositorio no registra descargas ni likes, y no hay benchmarks publicados; la validacion en produccion requiere pruebas propias.
- El formato de salida (110-145 palabras y tres opciones) es estricto; el modelo puede desviarse si el plan de entrada no sigue el esquema Apertura / Lugar / Conflicto / Giro / Rumbo.

## Enlaces

- Hugging Face: https://huggingface.co/senda-of-kora/kora-senda-0.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
