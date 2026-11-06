# fdsffjdkf/ClearTrans-3B-SFT-Java-to-Go

## Resumen

ClearTrans 3B SFT Java to Go es un checkpoint de ajuste fino supervisado (SFT) publicado por el usuario fdsffjdkf como parte del artefacto ClearTrans, un proyecto orientado a la traduccion automatica de codigo entre lenguajes de programacion. El modelo parte de Qwen2.5-Coder-3B, un transformer decoder-only de 3.085.938.688 parametros desarrollado por Alibaba Qwen, y se especializa en una unica direccion de traduccion: convertir codigo fuente Java en codigo Go equivalente.

El interes del modelo es acotado pero claro: en lugar de ofrecer traduccion generica entre multiples lenguajes, se ha entrenado de forma especifica para un par Java-Go, lo que en teoria permite capturar idiomatismos de ambos ecosistemas (gestión de memoria, concurrencia con goroutines, interfaces, manejo de errores). Con 3B de parametros y pesos en safetensors, es un modelo manejable en hardware de consumo y desplegable con transformers o TGI.

No obstante, el propio autor advierte que se trata de una publicacion de pesos sin validacion de inferencia en GPU ni reproduccion de benchmarks, y que la licencia heredada es la Qwen Research License, restringida a uso no comercial. Cualquier evaluacion practica debe hacerse con cautela y con tests propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-3B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (orientado a codigo; Java y Go como lenguajes fuente y destino) |
| Licencia | qwen-research (Qwen Research License Agreement, uso no comercial) |
| Formato de pesos | safetensors (repo de 6,8 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, heredado de Qwen2.5-Coder-3B. No se documentan innovaciones arquitectonicas propias: el checkpoint conserva la configuracion y el tokenizer del modelo base y solo modifica los pesos mediante ajuste fino supervisado completo (full SFT, no LoRA). La model card registra el entrenamiento con Transformers 4.57.1 y PyTorch 2.9.1.

Los hiperparametros documentados son: learning rate 1e-5, batch total de 64 (batch 1 x 8 dispositivos x 8 pasos de acumulacion), 3 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno y semilla 42, distribuido en 8 GPUs. El dataset identificado es `train_full_1231_java2go_idx3`, especifico de la direccion Java a Go, aunque los ejemplos de entrenamiento no se incluyen en el repositorio y su procedencia no es verificable a partir del nombre. No se documenta RLHF, DPO ni una fase GRPO posterior; el autor indica explicitamente que este checkpoint no debe interpretarse como un modelo final entrenado con GRPO.

## Capacidades

- Traduccion de codigo Java a Go en una unica direccion, con salida en formato conversacional segun la plantilla de chat incluida.
- Generacion de codigo en general, heredada de Qwen2.5-Coder-3B (completado, explicacion y refactorizacion basica).
- Razonamiento sobre estructuras de codigo: clases, interfaces, herencia, excepciones y concurrencia, en la medida en que el ajuste SFT lo haya cubierto.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el foco es el par de lenguajes de programacion Java-Go.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Migracion de servicios Java a Go en proyectos de modernizacion: el modelo puede generar borradores de traduccion de clases y metodos, que el equipo revisa y completa con tests, reduciendo el trabajo mecanico inicial.
- Prototipado rapido de equivalentes Go para utilidades Java: para funciones de manipulacion de cadenas, colecciones o ficheros, el modelo produce una primera version que sirve como punto de partida.
- Generacion de ejemplos comparativos Java/Go en documentacion tecnica o materiales de formacion: el modelo puede producir pares de codigo equivalentes para ilustrar diferencias idiomaticas.
- Apoyo en la reescritura de bibliotecas internas: dado que el modelo es pequeno (3B) y desplegable en una sola GPU, puede integrarse en un pipeline interno de sugerencias sin depender de APIs externas.
- Experimentacion academica en traduccion de codigo: el checkpoint y el repositorio ClearTrans permiten reproducir y comparar estrategias SFT frente a otros enfoques, siempre que se validen los resultados con tests.
- Evaluacion de calidad de traduccion automatica: util como baseline para medir si un modelo mayor o un pipeline con verificacion supera a un SFT de 3B en el par Java-Go.
- Generacion de tests de equivalencia: el modelo puede proponer casos de prueba en Go que repliquen el comportamiento observable del codigo Java original, aunque requiere revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se atribuye ninguna puntuacion de benchmark a este checkpoint y que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 10 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,5-4 GB de pesos; en 4 bits, en torno a 2 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16 de una sola peticion.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en FP16; en 8 GB requeriria cuantizacion, no publicada oficialmente.
- Opciones de despliegue: transformers (version compatible con 4.57.1), text-generation-inference (tag `text-generation-inference` en el repo), y conversiones propias a GGUF/llama.cpp u Ollama si se generan a partir de los safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans 3B SFT Java to Go | 3,09B | no disponible | Traduccion Java a Go (SFT) | qwen-research (no comercial) | Hugging Face, 0 descargas |
| Qwen2.5-Coder-3B (base) | 3,09B | no disponible en esta ficha | Generacion de codigo general | Apache-2.0 (modelo base original) | Hugging Face, ampliamente usado |
| CodeLlama-7B | 6,7B | 16k (segun variante) | Generacion de codigo general | Llama 2 Community License | Hugging Face, ampliamente usado |
| StarCoder2-3B | 3B | 16k | Generacion de codigo general | BigCode OpenRAIL-M | Hugging Face, ampliamente usado |

La comparacion directa con alternativas de traduccion Java-Go especificas no esta disponible en la informacion proporcionada. Frente a los modelos base generalistas, la ventaja de ClearTrans es la especializacion en un par de lenguajes; la desventaja es la falta de validacion publicada y una licencia mas restrictiva que la del Qwen2.5-Coder-3B original.

## Limitaciones y advertencias

- Licencia Qwen Research License: uso permitido para investigacion y evaluacion no comercial; no se relicencia a MIT ni Apache-2.0, por lo que el uso comercial requiere revisar los terminos del acuerdo.
- El autor advierte que las traducciones generadas pueden contener errores funcionales y code smells; es obligatorio validar con tests y herramientas de analisis antes de usar el codigo.
- No hay validacion de inferencia en GPU ni reproduccion de benchmarks para esta release; los resultados practicos son inciertos.
- El dataset de entrenamiento no se incluye ni se verifica su procedencia; no es posible auditar la composicion ni el sesgo de los datos.
- Modelo pequeno (3B): menor capacidad de razonamiento y de manejo de contextos largos que modelos de 7B o superiores, con mayor riesgo de alucinacion en traducciones complejas.
- Direccion unica Java a Go: no se ha entrenado para la direccion inversa ni para otros pares de lenguajes.
- Idiomas naturales soportados no documentados; no se garantiza calidad fuera del ingles tecnico habitual en codigo.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso comunitario ni de validacion independiente.
- No se publican estados del optimizador, datos de entrenamiento ni salidas de evaluacion historicas; es una release de pesos, no una reproduccion numerica completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Java-to-Go
- Repositorio ClearTrans (scripts de implementacion y replicacion): https://github.com/Xingzhehu/ClearTrans
- Modelo base Qwen2.5-Coder-3B: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
