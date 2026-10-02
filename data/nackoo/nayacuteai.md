# Nackoo/NayaCuteAI

## Resumen

NayaCuteAI es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct, publicado por el usuario Nackoo en HuggingFace y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. El repositorio contiene un único archivo de pesos, `Qwen2.5-3B-Instruct.Q4_K_M.gguf`, junto con un Modelfile de Ollama, lo que indica que el objetivo del autor es el despliegue local sencillo más que la investigacion o el reentrenamiento. El modelo se presenta con la etiqueta "conversational", lo que sugiere un ajuste orientado a dialogo, presumiblemente con una personalidad o estilo concretos.

El dato tecnico mas relevante es el numero de parametros: 3.085.938.688 (aproximadamente 3,09 mil millones), coherente con la arquitectura Qwen2.5-3B. Al tratarse de una cuantizacion Q4_K_M, el peso del archivo ronda los 1,9-2 GB, aunque el repositorio ocupa 9,6 GB en total (probablemente por versiones historicas de archivos o ficheros auxiliares no listados en la model card). No hay informacion publica sobre el dataset de ajuste fino, el numero de tokens de entrenamiento, la licencia ni los idiomas soportados.

La relevancia de esta ficha es mas bien metodologica: sirve como ejemplo de fine-tune comunitario de bajo coste sobre un modelo base pequeno, entrenado con Unsloth (que el autor declara como "2x faster") y empaquetado para inference local. Para produccion, sin embargo, la ausencia de licencia explicita, de benchmarks y de documentacion de entrenamiento lo convierte en una opcion de alto riesgo frente al propio Qwen2.5-3B-Instruct oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (base: Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens nativos (ampliable a 131.072 con YaRN), pero no se confirma que el fine-tune lo preserve |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 cubre 29 idiomas, no confirmado en el fine-tune) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

Datos adicionales del repositorio: 478 descargas, 0 likes, tamano del repo 9,6 GB, creado el 2026-09-28 y actualizado el 2026-10-02. Etiquetas declaradas: gguf, qwen2, llama.cpp, unsloth, endpoints_compatible, conversational.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atencion por causalidad estandar, normalizacion RMSNorm, activacion SwiGLU y sesgos QKV (Qwen2 los incorpora en Q y K). No hay innovaciones arquitectonicas propias del fine-tune: el autor unicamente ajusta los pesos del modelo base. El pipeline declarado por HuggingFace no esta disponible y no se especifica si el ajuste cubre las capas de embedding, todas las capas del transformer o solo un subconjunto (LoRA fusionado, por ejemplo).

En cuanto al entrenamiento, la model card solo indica que el modelo "was finetuned and converted to GGUF format using Unsloth". No se documenta el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF, DPO, SFT puro u otra tecnica de alineamiento, ni si hubo una fase de cuantizacion QAT. Tampoco se indica la longitud de contexto usada durante el ajuste. Esto limita seriamente la reproducibilidad y la evaluacion independiente del modelo.

## Capacidades

- Generacion de texto conversacional: es la funcion principal declarada, tanto por la etiqueta "conversational" como por el uso previsto (`llama-cli -hf Nackoo/NayaCuteAI --jinja`).
- Razonamiento y conocimiento general heredados del modelo base Qwen2.5-3B-Instruct, sin garantia de que el fine-tune los preserve.
- Generacion de codigo y matematicas basicas: capacidad tipica de Qwen2.5-3B, no verificada en esta variante.
- Tool calling / function calling: potencialmente soportado por herencia de Qwen2.5-Instruct, pero no confirmado en la model card. La etiqueta `endpoints_compatible` indica compatibilidad con la API de inference endpoints de HuggingFace, no necesariamente con function calling.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (sin lista de idiomas declarada).
- Capacidad multimodal: la model card menciona `llama-mtmd-cli` como comando alternativo, pero el modelo base Qwen2.5-3B-Instruct es solo texto y no se publica ningun proyector visual, por lo que la multimodalidad no debe asumirse.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidad de audio: no disponible.

## Casos de uso

- Chatbot de personaje o compania: el modelo parece disenado para conversacion con una personalidad concreta ("NayaCuteAI"), por lo que encaja en aplicaciones de rol, entretenimiento o asistentes con tono definido sobre hardware domestico.
- Asistente local sin conexion: al ser un GGUF de ~2 GB, puede ejecutarse en un portatil moderno con llama.cpp u Ollama, util para entornos con requisitos de privacidad estrictos donde los datos no pueden salir del dispositivo.
- Prototipado rapido de aplicaciones conversacionales: el bajo coste de despliegue (una sola GPU consumer o incluso CPU) permite iterar sobre la logica de la aplicacion antes de migrar a un modelo mayor.
- Generacion de texto corto en aplicaciones embebidas: resumenes breves, respuestas de FAQ o clasificacion ligera en dispositivos con menos de 8 GB de VRAM.
- Base para nuevos fine-tunes experimentales: al ser un modelo pequeno y en formato GGUF, sirve como punto de partida para experimentos academicos de bajo presupuesto, siempre que se resuelva la ambiguedad de licencia.
- Educacion y demos de tecnicas de cuantizacion: util para ilustrar el flujo Unsloth -> GGUF -> llama.cpp/Ollama en cursos o talleres.
- Automatizacion de tareas de texto en pipelines internos: con la advertencia de que no hay datos de fiabilidad, solo deberia usarse en flujos tolerantes a errores (borradores, etiquetado asistido, no decisiones criticas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el autor no referencia evaluaciones externas. Cualquier cifra que se atribuya a este modelo seria una extrapolacion del Qwen2.5-3B-Instruct base, no una medida del fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con la cuantizacion Q4_K_M y contexto moderado (4.096-8.192 tokens), incluyendo overhead de la cache KV. En FP16 serian unos 6,5-8 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 2070, o superiores. En el segmento profesional, una T4 (16 GB) o una L4 son mas que suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU de escritorio de los ultimos 6-7 anos con 6 GB o mas; tambien en iGPU con memoria unificada si se usa llama.cpp con offload parcial.
- CPU: puede ejecutarse integramente en CPU con llama.cpp, aunque con throughput bajo (del orden de decenas de tokens por segundo en CPUs modernas de muchos nucleos; no confirmado para este modelo).
- Opciones de despliegue: llama.cpp (`llama-cli -hf Nackoo/NayaCuteAI --jinja`), llama-server para exponer una API compatible con OpenAI, y Ollama mediante el Modelfile incluido. El soporte de GGUF en vLLM y TGI es limitado o experimental, por lo que no se recomiendan como via principal.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nackoo/NayaCuteAI | 3,09 B | no disponible | GGUF (Q4_K_M) | no disponible | HuggingFace (478 descargas, 0 likes) |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (131.072 con YaRN) | safetensors, GGUF, AWQ, GPTQ | Apache 2.0 | HuggingFace, muy ampliamente adoptado |
| Llama-3.2-3B-Instruct | 3,21 B | 131.072 tokens | safetensors, GGUF | Llama 3.2 Community License | HuggingFace, ampliamente adoptado |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 tokens | safetensors, GGUF, ONNX | MIT | HuggingFace, ampliamente adoptado |

La comparacion directa no es del todo justa: NayaCuteAI es un derivado del primero, no un modelo entrenado desde cero, y carece de la documentacion, licencia y evaluaciones que si acompanan a Qwen2.5-3B-Instruct. Para uso profesional, el modelo base oficial o Llama-3.2-3B-Instruct resultan opciones mas seguras en terminos legales y de soporte.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica bajo que terminos se distribuye el modelo. Esto impide determinar si su uso comercial esta permitido y constituye un riesgo legal significativo en produccion.
- Ausencia total de documentacion de entrenamiento: se desconoce el dataset, el numero de tokens, la tecnica de ajuste y si hubo alineamiento. No es posible auditar sesgos ni comportamientos indeseados.
- Riesgo de alucinacion: inherente a los modelos de 3 B de parametros, especialmente tras un fine-tune no evaluado. La probabilidad de inventar hechos sera mayor que en modelos de mayor tamano.
- Degradacion potencial de capacidades del modelo base: los fine-tunes comunitarios pueden reducir el rendimiento en tareas distintas a la conversacion, sin que existan benchmarks que lo cuantifiquen.
- Idioma: no se declara que idiomas soporta el fine-tune; el ajuste puede haber desplazado el equilibrio multilingue del modelo base hacia un idioma concreto.
- Contexto no confirmado: no hay garantia de que el fine-tune mantenga los 32.768 tokens de contexto del base, ni que funcione correctamente con YaRN.
- Multimodalidad no real: la mencion de `llama-mtmd-cli` en la model card no implica que haya pesos de vision; no se publica ningun proyector.
- Madurez del proyecto: 478 descargas y 0 likes, sin papers, demos ni evaluaciones independientes. El modelo tiene un caracter claramente experimental.
- Repositorio de 9,6 GB para un unico archivo GGUF de ~2 GB: conviene verificar el contenido real del repositorio antes de descargarlo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nackoo/NayaCuteAI
- Perfil del autor: https://huggingface.co/Nackoo
- Repositorio GitHub del autor (no directamente relacionado con el modelo): https://github.com/Nackoo/Chatbot
- Unsloth (framework de entrenamiento y conversion declarado): https://github.com/unslothai/unsloth
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
