# AXERA-TECH/Qwen3.8-27B-AX8860-llama.cpp

## Resumen

AXERA-TECH/Qwen3.8-27B-AX8860-llama.cpp es un paquete de despliegue, no un modelo entrenado desde cero: empaqueta los pesos de Qwen/Qwen3.8-27B en formato GGUF (MXFP4) junto con los kernels de NPU, los binarios estáticos de llama.cpp y un script de ejecución para correr el modelo en el acelerador Axera AX8860. El objetivo es llevar un transformer denso de 27.320.697.856 parámetros (unos 27,3 mil millones) a un SoC con NPU de cuatro núcleos, con soporte tanto de texto como de imagen (el codificador visual se distribuye aparte en BF16, 931 MB).

La relevancia de esta ficha es doble. Por un lado, demuestra que un modelo de la familia Qwen3 de 27B puede ejecutarse en hardware de borde dedicado a inferencia, con un prefill de 1231 tokens/s a 4k de contexto y un decode de 13,7 tokens/s. Por otro, ilustra el patrón de publicación "modelo + kernels + binarios" que está apareciendo en el ecosistema open source para plataformas NPU propietarias, donde el peso del modelo ya no es el único artefacto relevante.

El contexto máximo está limitado a 16384 tokens en esta integración concreta, hay una única secuencia soportada en modo servidor (`-np 1`) y el proceso ocupa los cuatro núcleos de la NPU de forma exclusiva. La licencia del paquete no está declarada en la información disponible, aunque el modelo base es Qwen/Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.8-27B); inferencia vía llama.cpp con backend ggml-axera para NPU |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | 16384 tokens (máximo en esta integración, flag `-c`) |
| Tipos de cuantizacion | MXFP4 para los pesos del modelo (GGUF, 14,8 GB); BF16 para el codificador visual (931 MB) |
| Idiomas soportados | no disponible (la model card muestra pruebas en inglés y chino) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.8-27b-mxfp4.gguf`, `mmproj-qwen3.8-27b-bf16.gguf`) + kernels de NPU en `kernels/` |
| Tamaño del repositorio | 17,2 GB |
| Hardware objetivo | Axera AX8860, NPU de 4 núcleos |
| SDK requerido | V0.5.0 o superior (`cat /proc/ax_proc/version`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, un transformer denso de 27,3 mil millones de parámetros. Esta publicación no entrena ni afina el modelo: redistribuye sus pesos cuantizados a MXFP4 y aporta la capa de ejecución. Los kernels de NPU (decode, prefill, ViT y cabeza de salida, más un `manifest.json`) no contienen pesos; estos se convierten desde el GGUF al cargar, un proceso que tarda aproximadamente 70 segundos.

La integración se apoya en un fork de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `feat/qwen38-27b-prefill`, commit `1811df5`, con el directorio `ggml/src/ggml-axera/models/qwen38_27b`) y en un repositorio de kernels DSL (`ZHEQIUSHUI/ax-dsl-kernels`, rama `feat/qwen38-27b-vit`, commit `18346cb`). El codificador visual se ejecuta como un grafo separado (kernel ViT) y procesa 3072 parches en 0,28 s, equivalentes a 768 tokens de imagen. Los binarios de `bin/` están enlazados estáticamente y solo dependen de `/opt/lib` y libc. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto conversacional y completado de texto (ejemplo verificado: "The capital of France is" → "Paris").
- Entrada de imagen: descripción de escenas con vehículos, texto y personas según la model card.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) mediante `run.sh -s 8080`.
- Inferencia en el dispositivo (on-device) sobre NPU, sin GPU dedicada.
- Soporte multilingüe parcial verificado en inglés y chino (PPL en chino de 10,85 sobre un conjunto interno con `-c 512`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio o agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de borde con texto e imagen en un único SoC: el paquete permite desplegar un modelo de 27B en el AX8860 sin GPU, útil en equipos industriales o cajas de visión donde no hay espacio para aceleradores dedicados.
- Descripción automática de imágenes en cámaras inteligentes: el codificador visual procesa 768 tokens de imagen en 0,28 s, lo que permite generar descripciones o etiquetas en tiempo casi real sobre el flujo de vídeo.
- Asistente conversacional local con contexto medio: con 16384 tokens de ventana y un decode de 12,3-13,7 tokens/s, encaja en escenarios de atención al cliente o asistentes de documentación donde la latencia tolerable es de decenas de segundos por respuesta.
- Procesamiento de documentos con OCR implícito: al aceptar imagen y texto, puede extraer y resumir contenido de capturas o escaneos en el propio dispositivo, sin enviar datos a la nube.
- Servicio interno compatible con OpenAI: el modo servidor (`-np 1`) permite conectar clientes existentes que hablan el protocolo de OpenAI sin adaptar el código de la aplicación.
- Prototipado y validación de pipelines de IA en hardware Axera: los kernels y binarios publicados sirven como referencia para portar otros modelos Qwen a la NPU AX8860.
- Evaluación comparativa de cuantización MXFP4: el paquete permite medir la calidad (PPL 10,85 en chino) y el rendimiento de MXFP4 frente a otras precisiones en el mismo hardware.

## Benchmarks y rendimiento

Rendimiento medido en AX8860 con SDK V0.5.1 y NPU de 4 núcleos:

| Prueba | Resultado |
|---|---|
| Prefill, prompt de 4k (3908 tokens) | 3,18 s (1231 tokens/s) |
| Decode con contexto de 4k | 72,8 ms/token (13,7 tokens/s) |
| Prefill, prompt de 16k | 1168 tokens/s |
| Decode con contexto de 16k | 81,0 ms/token (12,3 tokens/s) |
| Codificación de imagen (3072 parches = 768 tokens de imagen) | 0,28 s |
| Carga del modelo (conversión GGUF → NPU) | ~70 s |
| PPL en chino (conjunto interno, `-c 512`) | 10,85 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: Axera AX8860 con NPU de 4 núcleos; no se ejecuta en GPU ni CPU convencionales según la información disponible.
- SDK V0.5.0 o superior; verificar con `cat /proc/ax_proc/version`.
- Memoria: el repositorio ocupa 17,2 GB; los pesos MXFP4 son 14,8 GB y el codificador visual 931 MB. La memoria del sistema debe acomodar ambos más el espacio de trabajo de los kernels.
- La NPU se reserva de forma exclusiva: no se pueden ejecutar otros programas de NPU en paralelo.
- Despliegue: `run.sh` para completado de texto, descripción de imágenes o servidor compatible con OpenAI. Para invocación directa, definir `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`, con `-ngl 99` y `-np 1` en modo servidor.
- Diagnóstico: `GGML_AXERA_PROF=1` imprime los tiempos por etapa al salir.
- VRAM en GPU: no aplica; no se ha documentado soporte para CUDA, ROCm ni Metal en esta integración.
- Latencia y throughput: ver la tabla de benchmarks (13,7 tokens/s en decode a 4k, 12,3 tokens/s a 16k).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AXERA-TECH/Qwen3.8-27B-AX8860-llama.cpp | 27,3 B | 16384 | GGUF MXFP4 + kernels NPU AX8860 | no disponible | HuggingFace, 291 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27,3 B | no disponible en esta información | safetensors (formato original) | no disponible | HuggingFace |
| Otros despliegues de Qwen3 en llama.cpp | no disponible | no disponible | GGUF para CPU/GPU | no disponible | no disponible |

La comparación con alternativas de la misma categoría (modelos de ~27B con soporte de imagen) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Exclusividad de la NPU: el proceso ocupa los cuatro núcleos; ejecutar otro programa de NPU simultáneamente provoca errores.
- Una sola secuencia: el servidor debe lanzarse con `-np 1`, lo que impide atender peticiones concurrentes.
- Ventana de contexto limitada a 16384 tokens, inferior a la de muchos despliegues de modelos de tamaño similar.
- Resultados no deterministas: la model card advierte de pequeñas diferencias entre ejecuciones del mismo input por el orden de acumulación en la NPU; no apto para casos que exijan reproducibilidad bit a bit.
- Licencia no declarada: no se puede confirmar el uso comercial del paquete ni del modelo base a partir de la información disponible.
- Idiomas: solo hay evidencia de inglés y chino; el comportamiento en castellano no está verificado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de sesgos.
- Madurez: la propia model card indica que el rendimiento sigue en optimización ("性能持续优化中"), por lo que no es un despliegue estable para producción crítica.
- Dependencia de un fork específico de llama.cpp y de una versión concreta del SDK; actualizar cualquiera de los dos puede romper la compatibilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AXERA-TECH/Qwen3.8-27B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp: https://github.com/ZHEQIUSHUI/llama.cpp (rama `feat/qwen38-27b-prefill`, commit `1811df5`)
- Kernels de NPU: https://github.com/ZHEQIUSHUI/ax-dsl-kernels (rama `feat/qwen38-27b-vit`, commit `18346cb`)
