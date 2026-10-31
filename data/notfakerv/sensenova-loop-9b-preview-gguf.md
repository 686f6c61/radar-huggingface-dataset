# notfakerv/SenseNova-Loop-9B-Preview-GGUF

## Resumen

SenseNova Loop 9B Preview es un modelo de generación de texto desarrollado por SenseNova / OpenSenseNova, del que existe esta conversión no oficial a formato GGUF cuantizado en Q8_0, empaquetada por el usuario notfakerv. El modelo base se caracteriza por una arquitectura particular denominada `sensenova_loop`, que reutiliza bloques del decodificador mediante pasadas repetidas (56 capas virtuales a partir de 32 capas físicas) y emplea un mecanismo de enrutamiento de dos flujos conocido como mHC. Esta conversión es solo de texto: excluye el codificador de visión y los componentes MTP del modelo original.

La relevancia de esta ficha radica en que el GGUF no funciona con runtimes estándar: requiere un fork de llama.cpp con parches específicos que implementan el enrutamiento mHC y las pasadas repetidas del decodificador. El autor ha validado la conversión en LM Studio con un runtime personalizado, comparando logits contra la implementación oficial de Transformers con divergencias KL muy bajas. Es una opción interesante para ejecutar localmente un modelo experimental con contexto anunciado de 262.144 tokens, aunque la conversión solo se ha probado con 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sensenova_loop (decodificador con bloques repetidos y enrutamiento mHC de dos flujos) |
| Parametros totales | 14.149.766.784 (según safetensors del modelo base; el nombre "9B" es comercial) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens anunciados por upstream; validado solo hasta 8.192 tokens en esta conversión |
| Tipos de cuantizacion | Q8_0 (con tensores FP32 para convolución, normalización y enrutamiento mHC) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 (pesos y adaptación); componentes de llama.cpp bajo MIT |
| Formato de pesos | GGUF (15.069.056.512 bytes / 14,03 GiB); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La arquitectura `sensenova_loop` se basa en un transformador decodificador de 32 capas físicas que se expande a 56 entradas virtuales de capa: un bloque se visita repetidamente, y en esta conversión GGUF se duplican los pesos almacenados de ese bloque para que cada visita tenga estado de atención y recurrente independiente. Esto aumenta el tamaño del archivo sin introducir parámetros entrenados nuevos. El mecanismo distintivo es el enrutamiento mHC de dos flujos, cuyos tensores de enrutamiento, normalización y convolución se conservan en FP32 para minimizar la degradación numérica de la cuantización.

No hay información disponible sobre el dataset de entrenamiento, el número de tokens de preentrenamiento ni el uso de técnicas como RLHF o DPO. La conversión a GGUF se realizó mediante un paso intermedio en BF16 seguido de cuantización a Q8_0, sin ningún ajuste fino posterior. Los componentes MTP (multi-token prediction) y el codificador/proyector de visión del modelo original quedan excluidos del export.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, uso como chatbot con plantilla de chat embebida).
- Razonamiento básico y aritmética simple validada en pruebas de humo (por ejemplo, 13 × 7 = 91).
- Completado y generación de código Python (validado con una función de cuadrado correcta).
- Memoria de contexto conversacional a corto alcance (recuperación de un nombre de proyecto del historial en las pruebas).
- Soporte de modo "thinking" en el modelo base, aunque las pruebas de esta conversión se hicieron con thinking deshabilitado.
- Sin capacidades de visión: el codificador de imágenes no está incluido ni validado en este export.
- No hay información disponible sobre soporte de tool calling, function calling ni capacidades de agentes.

## Casos de uso

- Chatbot local multilingüe inglés/chino: el modelo conversa en ambos idiomas y puede ejecutarse íntegramente en GPU locales, útil para entornos sin conexión a servicios en la nube.
- Experimentación con arquitecturas recurrentes/loop: investigadores interesados en el mecanismo mHC y las pasadas repetidas de decodificador pueden inspeccionar y ejecutar el modelo localmente con llama.cpp parcheado.
- Asistente de código ligero: puede completar funciones Python sencillas en sesiones de desarrollo locales, aunque sin validación de benchmarks de código.
- Prueba de cuantización de alta fidelidad: la cuantización Q8_0 con tensores críticos en FP32 sirve como caso de estudio para evaluar pérdida numérica en arquitecturas no estándar.
- Prototipado en LM Studio: integrable en flujos de trabajo locales de LM Studio una vez instalado el runtime personalizado, con offload completo a GPU.
- Validación de contexto largo (futura): el contexto anunciado de 262.144 tokens apunta a tareas de documentos extensos, aunque esta conversión aún no lo ha validado más allá de 8.192 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del GGUF no reclama puntuaciones de benchmark upstream para esta conversión; las únicas métricas publicadas son las divergencias KL de la cuantización Q8_0 frente a la implementación oficial en tres prompts cortos: aproximadamente 0,00000325, 0,0000918 y 0,00401, con coincidencia del token top-1 en los tres casos.

## Requisitos de hardware

- VRAM estimada: unos 14 GiB solo de pesos en Q8_0, más la KV cache; con contexto de 8.192 tokens y offload completo, se recomiendan al menos 16-20 GiB de VRAM.
- Configuración validada por el autor: dos NVIDIA RTX 3090 (24 GiB cada una) en Linux x86_64 con CUDA 12.
- No cabe cómodamente en una única GPU consumer de 12-16 GiB con contexto amplio; una RTX 4090 (24 GiB) podría alojar los pesos con contexto moderado, aunque no está validado.
- Despliegue: llama.cpp (fork con los parches incluidos en el repositorio) y LM Studio 0.4.26 o superior con el runtime personalizado `llama.cpp-linux-x86_64-nvidia-cuda12-avx2@2.66.101`. No hay soporte validado en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.
- Requisito crítico: un runtime sin la implementación `sensenova_loop` fallará con el error `unknown model architecture: 'sensenova_loop'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-GGUF | ~14,1 B (safetensors) | 262.144 anunciados / 8.192 validados | Q8_0 | Apache 2.0 | GGUF no oficial, requiere runtime personalizado |
| Qwen3-8B | 8 B | 128.000 | Q8_0 y otras (GGUF oficial) | Apache 2.0 | Soporte nativo en llama.cpp, Ollama, vLLM, LM Studio |
| Llama 3.1 8B Instruct | 8 B | 128.000 | Q8_0 y otras (GGUF oficial) | Llama 3.1 Community License | Soporte nativo en los principales runtimes |

Frente a alternativas de tamaño similar, la principal desventaja de esta conversión es la dependencia de un runtime parcheado y la ausencia de validación de contexto largo; a cambio, ofrece acceso local a una arquitectura experimental no disponible en runtimes estándar.

## Limitaciones y advertencias

- Conversión no oficial: ni SenseNova ni LM Studio respaldan este repositorio ni han validado la conversión.
- Requiere un runtime personalizado no distribuido como binario oficial; sin los parches, el modelo no carga.
- Solo texto: sin visión, sin MTP y sin aceleración por difusión, a diferencia del modelo base.
- Contexto no validado más allá de 8.192 tokens; el uso de 262.144 tokens anunciados no está probado en esta conversión.
- Las pruebas de calidad son smoke tests (tres prompts), no una evaluación de calidad general ni prueba de equivalencia numérica completa.
- No hay datos sobre sesgos, tasa de alucinación ni comportamiento en producción; el modelo base es un preview, con las consiguientes advertencias de estabilidad.
- Riesgo operativo: desactivar la sustitución automática de runtime en LM Studio para evitar que se cambie a un runtime sin soporte de la arquitectura.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el archivo NOTICE y provenance.json por los componentes MIT de llama.cpp y el parche Clover de terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/notfakerv/SenseNova-Loop-9B-Preview-GGUF
- Modelo base oficial: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Código oficial de SenseNova Loop: https://github.com/OpenSenseNova/SenseNova-Loop
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PR Clover (requisito del runtime): https://github.com/ggml-org/llama.cpp/pull/31306
- Validación numérica: https://huggingface.co/notfakerv/SenseNova-Loop-9B-Preview-GGUF/tree/main/validation
- Detalles del runtime: https://huggingface.co/notfakerv/SenseNova-Loop-9B-Preview-GGUF/blob/main/runtime/README.md
