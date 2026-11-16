# NuevaTechLLC/Qwen3.8-27B-abliterated-v2-GGUF

## Resumen

Qwen3.8-27B-abliterated-v2-GGUF es una version "abliterated" (con la direccion de rechazo eliminada del espacio de pesos) del modelo base Qwen/Qwen3.8-27B, publicada por Nueva Tech LLC en formato GGUF para llama.cpp y Ollama. El modelo conserva la arquitectura y el comportamiento general del base, pero ha sido editado para que rechace considerablemente menos peticiones, manteniendo supuestamente su rendimiento en tareas ordinarias. Se distribuye bajo licencia Apache 2.0 y esta orientado a generacion de texto conversacional en ingles.

El interes tecnico del modelo no reside tanto en el modelo en si como en el pipeline de "abliteracion de bajo dano" que documenta el autor: un proceso de optimizacion restringida que busca eliminar la direccion de rechazo minimizando el dano colateral, medido mediante KL sobre texto fluido y un conjunto de comportamientos calibrados protegidos. El autor compara su metodo con Heretic 1.4.0 y OBLITERATUS, aunque los datos de esa comparacion corresponden a Qwen3-8B, no a este modelo.

El repositorio contiene un unico archivo GGUF en cuantizacion Q4_K_M de 16,5 GB, pensado para ejecutarse con aproximadamente 20 GB de VRAM o RAM. El modelo tiene 26.895.998.464 parametros totales (unos 26,9 mil millones) y esta etiquetado con arquitectura Qwen 3.5 (`qwen35` en GGUF), requiriendo builds de llama.cpp de octubre de 2026 o posteriores y Ollama 0.40 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, arch `qwen35` en GGUF) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado); se menciona Q8_0 como opcion "donde este presente", pero no figura en la tabla de archivos |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una edicion de pesos del checkpoint Qwen/Qwen3.8-27B, que pertenece a la arquitectura Qwen 3.5 con nomenclatura antigua de tensores de espacio de estados, segun indica el autor. No se proporcionan datos sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO), por lo que esa informacion no esta disponible en el material consultado.

La innovacion tecnica documentada es el pipeline de abliteracion de bajo dano de Nueva Tech LLC, que trata la eliminacion del rechazo como un problema de optimizacion restringida en lugar de una edicion unica de pesos. Sus componentes clave son: (1) "gemelos inofensivos", reescrituras estructuralmente emparejadas de cada prompt danino para aislar la decision de rechazo del tema, la longitud y el registro; (2) cuatro comportamientos calibrados protegidos (rechazar premisas falsas, admitir ignorancia, rechazar sinsentidos, respetar restricciones negativas) evaluados con 96 pares de prueba y control, ponderados por encima del KL en la funcion objetivo; (3) un escaneo por capas para localizar donde se separa mejor el rechazo, aplicando la edicion con un kernel centrado en esa capa y anchura y fuerza buscadas; (4) eliminacion de la media inofensiva de la direccion antes de la proyeccion, con restauracion opcional de norma; (5) descomposicion SVD para obtener un subespacio de rango k en lugar de una unica direccion; y (6) busqueda Optuna sobre el plan de edicion con funcion objetivo `refusal + λ_kl·KL + λ_cal·calibration_drop + λ_over·Δover_refusal`, mas una pasada opcional de autodestilacion. El autor deja registros de cada etapa en `extract.json`, `search.json` y `ablation_card.json`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.8-27B.
- Comportamiento "uncensored": el modelo declina considerablemente menos peticiones que el base gracias a la eliminacion de la direccion de rechazo.
- Conservacion (segun el autor) del comportamiento base en prompts ordinarios, con dano medido mediante KL sobre texto fluido.
- Proteccion de comportamientos calibrados: rechazo de premisas falsas, admision de ignorancia, rechazo de sinsentidos y respeto de restricciones negativas (segun el diseno del pipeline; no se aportan metricas propias de este modelo en la informacion disponible).
- Integracion con llama.cpp, Ollama y LM Studio mediante archivo GGUF y Modelfile incluido.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de vision, audio, tool calling, agentes, modo thinking ni matematicas avanzadas en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad: el repositorio incluye artefactos (`extract.json`, `search.json`, `ablation_card.json`) que permiten estudiar como se localiza y elimina la direccion de rechazo en el espacio de pesos, util para quien investiga mecanismos internos de seguridad en LLM.
- Experimentacion con alineacion y calibracion: comparar el comportamiento del modelo abliterated frente al base en conjuntos como StrongREJECT, OR-Bench-hard o Dolly permite medir el coste real de eliminar el rechazo, usando el modelo como sujeto de prueba en lugar de en produccion.
- Despliegue local en estaciones de trabajo: con un unico archivo Q4_K_M de 16,5 GB y ~20 GB de VRAM/RAM, puede ejecutarse en una GPU consumer de gama alta o en una maquina con suficiente memoria mediante llama.cpp u Ollama, sin dependencia de API externa.
- Prototipado de asistentes conversacionales sin filtros: para entornos controlados de investigacion donde se necesita un modelo que no decline peticiones y se quiere evaluar el comportamiento del modelo sin la capa de rechazo.
- Evaluacion de robustez de sistemas de moderacion: usar el modelo como generador adversarial para probar clasificadores de seguridad (por ejemplo, Qwen3Guard) frente a salidas de un modelo sin rechazo.
- Pruebas de cuantizacion y despliegue: el autor documenta la supervivencia de la edicion a la cuantizacion, lo que permite estudiar como afecta Q4_K_M al comportamiento editado y compararlo con el checkpoint bf16 de origen.
- Docencia y demostraciones sobre seguridad en IA: ilustrar de forma practica que es la abliteracion, como se mide el dano colateral y por que el chequeo KL habitual puede ser insuficiente.

## Benchmarks y rendimiento

El autor publica una tabla de comparacion de metodos de abliteracion, pero corresponde a **Qwen3-8B**, no a este modelo. No se han publicado resultados de benchmarks propios de Qwen3.8-27B-abliterated-v2 en la informacion disponible. Los datos citados del bake-off (Qwen3-8B) son:

| Contender | refusal | comply | over-refusal | KL | MMLU | ARC-C | GSM8K |
|---|---|---|---|---|---|---|---|
| base | 0.954 | 0.004 | 0.370 | 0.000 | 0.757 | 0.560 | 0.892 |

La tabla del autor continua con Heretic 1.4.0, OBLITERATUS (presets `advanced` y `optimized`) y su propio metodo, pero esos valores no se incluyen en la informacion proporcionada. El autor indica que los numeros de dano del propio modelo estan en la tabla de resultados de su model card, que tampoco se ha facilitado. Por tanto, para este modelo concreto: no se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 20 GB para el archivo Q4_K_M de 16,5 GB, segun el autor.
- GPU recomendadas: no se especifican modelos concretos; por el tamano, encaja en GPUs con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100) o en configuraciones con RAM suficiente para inferencia en CPU.
- Cabe en GPU consumer: si, en tarjetas de 24 GB o mas con Q4_K_M; en tarjetas de 16 GB requeriria cuantizaciones menores no publicadas en este repo o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (`llama-cli -m big-Qwen3.8-27B-Q4_K_M.gguf -c 8192 -cnv`), Ollama 0.40 o posterior (mediante el Modelfile incluido), LM Studio (`lms import`). Requiere builds de llama.cpp de octubre de 2026 en adelante por la nomenclatura de tensores `qwen35`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-v2 (este) | ~26,9 mil millones | no disponible | apache-2.0 | GGUF (Q4_K_M) | Abliterated, solo ingles, sin benchmarks propios publicados |
| Qwen/Qwen3.8-27B (base) | ~26,9 mil millones | no disponible | no disponible en la informacion | safetensors (origen) | Modelo original sin editar; referencia de comportamiento |
| Heretic 1.4.0 (herramienta) | no aplica (herramienta) | no aplica | no disponible | no aplica | Herramienta de abliteracion automatizada con busqueda Optuna; usada como comparador de metodo |
| OBLITERATUS (herramienta, commit `461ff08`) | no aplica (herramienta) | no aplica | no disponible | no aplica | Herramienta de abliteracion con presets `advanced` y `optimized`; comparador de metodo |

No se dispone de datos de rendimiento del modelo base ni de los competidores en la informacion proporcionada para completar una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo "uncensored": la eliminacion de la direccion de rechazo implica que puede generar contenido danino, inseguro o ilegal; no es apto para despliegue en produccion orientado al publico sin capas de moderacion externas.
- El autor reconoce que eliminar el rechazo afecta tambien a comportamientos calibrados (rechazar premisas falsas, admitir ignorancia, rechazar sinsentidos, respetar restricciones negativas); el pipeline intenta protegerlos, pero no se aportan metricas propias de este modelo en la informacion disponible.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada.
- Solo soporta ingles (`language: en`); no se documentan capacidades multilingues.
- Longitud de contexto no documentada; el ejemplo de uso fija 8192 tokens, pero no se confirma el maximo del modelo.
- Compatibilidad restringida: requiere llama.cpp de octubre de 2026 o posterior y Ollama 0.40 o posterior; versiones anteriores no cargaran el archivo.
- Un unico archivo Q4_K_M publicado; no hay Q8_0 ni otras cuantizaciones en la tabla de archivos, pese a la mencion generica a Q8_0.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el usuario; conviene verificar las condiciones del modelo base Qwen3.8-27B.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que limita la evidencia externa sobre su comportamiento real.
- Los benchmarks publicados por el autor corresponden a otro modelo (Qwen3-8B) y no validan el rendimiento de este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/Qwen3.8-27B-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteracion): no disponible en la informacion proporcionada
- OBLITERATUS (herramienta de abliteracion): no disponible en la informacion proporcionada
- Paper o blog del pipeline de Nueva Tech LLC: no disponible en la informacion proporcionada
- Repositorio llama.cpp: no disponible en la informacion proporcionada
- Ollama: no disponible en la informacion proporcionada
