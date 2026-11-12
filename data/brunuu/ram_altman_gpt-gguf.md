# brunuu/RAM_Altman_GPT-GGUF

## Resumen

RAM_Altman_GPT-GGUF es la versión cuantizada en formato GGUF de RAM_Altman_GPT, un modelo de lenguaje de 100.000 parámetros construido sobre la arquitectura GPT-2 y publicado por el usuario brunuu en Hugging Face. Se trata de un proyecto de parodia y humor: el modelo encarna a un personaje llamado "RAM ALTMAN" cuya única personalidad consiste en querer toda la RAM disponible. No es un modelo orientado a producción ni a tareas reales de NLP, sino una pieza de contenido satírico distribuido en múltiples niveles de cuantización (de 16 bits hasta 1 bit) para su uso en llama.cpp, Ollama y LM Studio.

El modelo destaca por su extrema ligereza (el archivo f16 ocupa 246 KB) y por una ventana de contexto deliberadamente absurda de 379 tokens, justificada por el autor como una broma ("la posición 380 se vendió para comprar más RAM"). El repositorio incluye ocho variantes GGUF, desde f16 hasta IQ1_S, con instrucciones de ejecución para las principales herramientas de inferencia local. La licencia es CC0, lo que permite cualquier uso sin restricciones.

Su relevancia es exclusivamente divulgativa y humorística: sirve como ejemplo didáctico de cuantización GGUF, de despliegue local con llama.cpp/Ollama y de cómo se estructura una model card para un modelo de juguete. No debe confundirse con un modelo funcional para tareas serias de generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parámetros totales | 100.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 379 tokens |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ1_S |
| Idiomas soportados | en (inglés) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | GGUF (original en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo base es un GPT-2 de 100.000 parámetros, es decir, una versión extremadamente reducida de la arquitectura transformer decoder-only original. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Por el tamaño y la naturaleza del proyecto, cabe inferir un entrenamiento mínimo o sintético orientado a producir respuestas humorísticas, pero este extremo no está confirmado en la documentación.

La innovación técnica destacable no está en la arquitectura sino en el ejercicio de cuantización: el autor documenta que la mayoría de las matrices de pesos tienen 40 columnas de ancho, mientras que la cuantización opera en bloques de 32 o 256, de modo que solo 3 de las 13 matrices de pesos pudieron comprimirse. Esto explica que la versión IQ1_S (219 KB) sea solo 27 KB más pequeña que la f16 (246 KB). El modelo incluye un token de parada personalizado, `<|i_have_enough_ram|>`, que actúa como delimitador de turno en el formato de chat.

## Capacidades

- Generación de texto conversacional en inglés con un formato de chat específico (`User:` / `RAM-ALTMAN:`).
- Respuestas de temática fija centrada en la parodia sobre RAM, hardware y pizza, sin capacidad de razonamiento general.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: token de parada propio (`<|i_have_enough_ram|>`); no dispone de modo thinking, visión ni audio.
- Ejecución en CPU y GPU mediante llama.cpp, Ollama y LM Studio.

## Casos de uso

- Demostración didáctica de cuantización GGUF: permite comparar en la práctica ocho niveles de cuantización (f16 a IQ1_S) sobre el mismo modelo y observar el impacto en tamaño de archivo y comportamiento, útil en talleres sobre formatos de pesos.
- Prueba de pipelines de despliegue local: sirve para validar la integración de llama.cpp, Ollama o LM Studio en un entorno antes de desplegar modelos reales, gracias a su tamaño de 246 KB y a su carga instantánea.
- Ejemplo de model card y formato de chat: el repositorio documenta un formato de prompt con tokens de parada personalizados, útil como plantilla para proyectos propios.
- Contenido humorístico para demos y presentaciones: puede integrarse en una demo web (el autor publica un Space) para ilustrar conceptos de IA de forma satírica.
- Pruebas de robustez de herramientas de inferencia: al ser un modelo mínimo con token de parada no estándar, permite comprobar cómo gestionan llama.cpp u Ollama los parámetros de muestreo (temperature, top-k, top-p, min-p, repeat penalty).
- Test de empaquetado y distribución de modelos: útil para verificar flujos de publicación en Hugging Face con múltiples archivos GGUF y metadatos de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en cualquier cuantización (el archivo más grande, f16, ocupa 246 KB).
- GPU recomendadas: cualquier GPU, incluida una iGPU o incluso CPU exclusiva; no requiere aceleración dedicada.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1050, etc.) y en Raspberry Pi.
- Opciones de despliegue: llama.cpp (`llama-completion`), Ollama (`ollama run hf.co/brunuu/RAM_Altman_GPT-GGUF`), LM Studio y el Space oficial en Hugging Face.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, la latencia será de milisegundos en hardware moderno.
- Parámetros de muestreo recomendados por el autor: temperature 1.0, top-k 50, top-p 1.0, min-p 0, repeat penalty desactivado, contexto 379.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| RAM_Altman_GPT-GGUF | 100.000 | 379 | CC0-1.0 | Parodia / humor |
| GPT-2 small (original) | 124 M | 1024 | MIT | Generación de texto general |
| DistilGPT-2 | 82 M | 1024 | Apache-2.0 | Generación de texto destilada |
| TinyStories-1M | 1 M | 512 | MIT | Generación de cuentos simples |

La comparación es orientativa: RAM_Altman_GPT es dos o tres órdenes de magnitud menor que GPT-2 small y no está pensado para tareas de NLP reales, por lo que la comparación de rendimiento carece de sentido. Su interés radica en el formato GGUF multinivel y en el carácter satírico, no en la calidad de generación.

## Limitaciones y advertencias

- Modelo de parodia: no debe usarse para tareas productivas de generación de texto, razonamiento, código o atención al cliente.
- Calidad de generación muy limitada por sus 100.000 parámetros; respuestas incoherentes o repetitivas fuera de su temática.
- Contexto de solo 379 tokens, insuficiente para conversaciones multi-turno reales.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Riesgo elevado de alucinación y de salida sin sentido; el autor advierte que con top-p y min-p por defecto el modelo "a veces olvida parar".
- Sesgos: no documentados, pero al ser un modelo mínimo entrenado con datos no especificados, puede reproducir sesgos de su corpus.
- Licencia CC0-1.0: sin restricciones para uso comercial, pero el contenido satírico puede no ser adecuado en contextos profesionales.
- El nombre del modelo hace referencia a una figura pública real (parodia de Sam Altman); conviene valorar el contexto antes de difundirlo en entornos corporativos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/brunuu/RAM_Altman_GPT-GGUF
- Repositorio del modelo base: https://huggingface.co/brunuu/RAM_Altman_GPT
- Demo en el navegador (Space): https://huggingface.co/spaces/brunuu/RAM_Altman_GPT
- Banner del proyecto: https://huggingface.co/brunuu/RAM_Altman_GPT/resolve/main/assets/banner.png
