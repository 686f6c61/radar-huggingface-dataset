# shebxyd/kofu-2b-edge

## Resumen

Kofu Gemma 2B Edge es un modelo conversacional derivado de `google/gemma-2b-it` mediante un ajuste fino con LoRA, publicado por el usuario shebxyd dentro del ecosistema del asistente Kofu Mobile. Su proposito es ejecutarse de forma 100% local y sin conexion en dispositivos Android ARM64, integrado en un motor nativo en C++20 con mapeo de memoria zero-copy (`mmap`). El modelo conserva la arquitectura transformer decoder-only de Gemma 2B y anade ~2.506 millones de parametros totales en formato safetensors BF16.

El ajuste se ha orientado a cuatro areas: logica de programacion y algoritmos (C++, Java, Python, Web), ciberseguridad y redes desde una perspectiva defensiva y etica, razonamiento multidisciplinar en espanol y respuestas concisas de baja latencia para interfaces moviles. El autor declara mas de 5.000 ejemplos de entrenamiento de alta calidad procedentes de cuatro datasets publicos, con una perdida que evoluciona de 3,11 a 1,40 durante el entrenamiento en una Tesla T4.

Es relevante ahora por su enfoque en el despliegue edge: distribuye una cuantizacion GGUF Q4_K_M de ~1,4 GB pensada para telefonos con menos de 2,5 GB de RAM, ademas de los pesos completos en safetensors (~5 GB) para servidores y fine-tuning adicional. La licencia es la Gemma Terms of Use de Google, y los idiomas declarados son espanol e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma CausalLM) |
| Parametros totales | 2.506.172.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (usado en el ejemplo de llama.cpp; no se especifica contexto maximo oficial) |
| Tipos de cuantizacion | GGUF Q4_K_M; safetensors BF16 |
| Idiomas soportados | es, en |
| Licencia | Gemma Terms of Use (Google) |
| Formato de pesos | safetensors (BF16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2b-it`, un transformer decoder-only de 2B parametros con tokenizer nativo de Gemma y vocabulario de 256k tokens. Sobre esa base se aplico un ajuste fino con LoRA de rango 16, alpha 32, dropout 0,05 y modulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj`. Los pesos resultantes se fusionaron con la base y se publicaron como safetensors BF16.

El entrenamiento se realizo en una NVIDIA Tesla T4 (Google Colab) con batch efectivo de 16 (batch por dispositivo 1, acumulacion de gradientes 16), optimizador AdamW con learning rate 2e-4 y schedule lineal. La perdida paso de 3,11 a 1,40. Los datasets empleados fueron `plncmm/spanish-alpaca` (conocimiento general, matematicas, historia, valores), `Yahir/alpaca-logica-programacion` (logica y programacion), `sahil2801/CodeAlpaca-20k` (C++, Java, HTML, Web) y `murdok1982/gemma4-programacion-seguridad` (ciberseguridad y analisis de codigo). No se documenta el numero total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional e instruccional en espanol e ingles.
- Razonamiento logico y resolucion paso a paso de problemas de programacion en C++, Java, Python y desarrollo web.
- Explicacion de conceptos de ciberseguridad, analisis de vulnerabilidades y buenas practicas defensivas con enfoque etico.
- Razonamiento multidisciplinar: matematicas, ciencias, historia universal y etica.
- Respuestas concisas optimizadas para interfaces moviles y baja latencia.
- Formato de chat oficial de Gemma (`<start_of_turn>user` / `<start_of_turn>model`) para conversaciones multi-turno.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modelo esta orientado a conversacion directa.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente de programacion offline en Android: el modelo puede explicar punteros, estructuras de datos o algoritmos en C++ y Java directamente en el telefono, sin conexion, aprovechando la cuantizacion Q4_K_M de ~1,4 GB para dispositivos con RAM inferior a 2,5 GB.
- Tutor de ciberseguridad defensiva: con los ejemplos de `murdok1982/gemma4-programacion-seguridad`, puede revisar fragmentos de codigo y senalar malas practicas o riesgos, orientado a formacion y no a explotacion.
- Apoyo educativo multidisciplinar en espanol: responde preguntas de matematicas, historia y ciencias con explicaciones paso a paso, adecuado para aplicaciones de estudio en entornos con conectividad limitada.
- Chat de atencion al cliente embebido: su naturaleza conversacional y respuestas concisas permiten integrarlo en asistentes de app movil que funcionan sin enviar datos a la nube, reduciendo latencia y preservando privacidad.
- Prototipado rapido con llama.cpp: el GGUF Q4_K_M se puede ejecutar en terminal con `llama-cli` para validar prompts, temperaturas y longitudes de respuesta antes de integrar el motor nativo.
- Fine-tuning adicional en servidor: los pesos safetensors BF16 (~5 GB) permiten reentrenar con LoRA sobre dominios especificos usando transformers y `device_map="auto"` en una GPU unica.
- Generacion de snippets y explicaciones en pipelines de documentacion: puede producir ejemplos de codigo comentados en C++, Java o Python para manuales tecnicos internos, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para GGUF Q4_K_M: ~1,4 GB de pesos; el autor indica ejecucion en telefonos con RAM inferior a 2,5 GB.
- VRAM para safetensors BF16: ~5 GB de pesos, mas overhead de activaciones y KV cache; se recomienda al menos 8-10 GB para inferencia comoda.
- GPU recomendadas: Tesla T4 (usada en entrenamiento) para BF16; cualquier GPU consumer con 8 GB o mas (RTX 3060/4060 en adelante) para los pesos completos.
- Cabe en GPU consumer: si, tanto la version Q4_K_M (en GPUs de 2-4 GB o CPU) como los pesos BF16 en GPUs de 8 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-cli`) para GGUF; transformers con `AutoModelForCausalLM` para safetensors; motor nativo C++20 NDK en Kofu Mobile para Android ARM64; LiteRT aparece en los tags del repositorio.
- Latencia y throughput: no disponible; el autor menciona baja latencia y consumo reducido de bateria como objetivos de diseno, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| shebxyd/kofu-2b-edge | 2,5B | 2048 (uso documentado) | es, en | Gemma Terms | safetensors, GGUF | Fine-tune LoRA de Gemma 2B IT orientado a edge y espanol |
| google/gemma-2b-it | 2,5B | no disponible en la informacion | multilingue | Gemma Terms | safetensors | Modelo base; sin especializacion en programacion ni edge |
| Modelos 2B-3B edge de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- El ajuste se realizo sobre un unico conjunto de ~5.000 ejemplos; la cobertura y calidad en dominios fuera de programacion, ciberseguridad y conocimiento general en espanol puede ser limitada.
- Riesgo de alucinacion inherente a un modelo de 2B parametros, especialmente en matematicas complejas, fechas y datos factuales; requiere verificacion en produccion.
- Contexto efectivo limitado: el ejemplo oficial usa `-c 2048`; conversaciones largas o documentos extensos pueden truncarse.
- Idiomas declarados solo espanol e ingles; el rendimiento en otros idiomas no esta garantizado.
- El contenido de ciberseguridad puede derivar en respuestas incompletas o ambiguas; no debe usarse como unica fuente para auditorias reales.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos antes de desplegar en producto.
- No se documentan evaluaciones de sesgo, seguridad o red-teaming; el modelo no ha pasado por un proceso de alineamiento adicional mas alla del heredado de Gemma 2B IT.
- El repositorio tiene muy pocas descargas (55) y cero likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/shebxyd/kofu-2b-edge
- Modelo base: https://huggingface.co/google/gemma-2b-it
- Repositorio Kofu Mobile: https://github.com/Kineyo/Kofu_Mobile
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Dataset spanish-alpaca: https://huggingface.co/datasets/plncmm/spanish-alpaca
- Dataset alpaca-logica-programacion: https://huggingface.co/datasets/Yahir/alpaca-logica-programacion
- Dataset CodeAlpaca-20k: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Dataset gemma4-programacion-seguridad: https://huggingface.co/datasets/murdok1982/gemma4-programacion-seguridad
