# RecursiveSI/flint-nvfp4-gguf

## Resumen

Flint NVFP4 GGUF es una distribución cuantizada del modelo Recursive Flint, publicado por RecursiveSI (organización RecursiveSI en Hugging Face). Se trata de un modelo de generación de texto de aproximadamente 39.800 millones de parámetros, empaquetado en un único archivo GGUF de 22,9 GB con pesos en formato NVFP4 (FP4 de NVIDIA con escalas). El repositorio incluye además el tokenizer y la plantilla de chat, y está pensado para ejecutarse con llama.cpp compilado con CUDA sobre GPUs NVIDIA recientes.

El modelo resuelve el problema de desplegar un modelo de ~40B en hardware de una sola máquina con una ventana de contexto muy grande: el ejemplo oficial de `llama-server` arranca con `-c 262144`, es decir, 262.144 tokens de contexto, manteniendo caché de ventana deslizante compacta. Es relevante ahora porque combina tres factores poco habituales en modelos abiertos de ese tamaño: licencia Apache 2.0, contexto de 256K y un formato de cuantización de 4 bits optimizado para la generación Blackwell de NVIDIA.

El autor del modelo base indica que el entrenamiento usó documentos web públicos y rastreados, texto y código, datos con licencia comercial y datos sintéticos generados por IA, con un post-entrenamiento que incluye instruction tuning, aprendizaje por refuerzo y datos de preferencias humanas. Esta ficha cubre únicamente la variante NVFP4 GGUF; los detalles arquitectónicos y los benchmarks completos se remiten a la model card de Flint, que no forma parte de la información disponible aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el runtime emplea caché de ventana deslizante (SWA) junto con atención completa, lo que sugiere un transformer híbrido con atención deslizante |
| Parametros totales | 39.785.323.896 (~39,8B) |
| Parametros activos | No disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (pesos y escalas empaquetados); otras cuantizaciones del modelo base no disponibles en la información |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un único archivo `flint-nvfp4.gguf` de 22,9 GB con tokenizer y plantilla de chat) |

## Arquitectura y entrenamiento

No se dispone de la arquitectura detallada en la información proporcionada. Los parámetros de ejecución documentados aportan pistas: el servidor se lanza con `-fa on` (Flash Attention), `-ctk f16` y `-ctv f16` para la caché KV, y con la recomendación explícita de no pasar `--swa-full`, de modo que se mantenga la caché de ventana deslizante compacta. Eso implica que el modelo combina capas de atención con ventana deslizante y capas de atención completa, y que no requiere overrides de RoPE ni de ventana deslizante en llama.cpp. El tamaño del archivo (22,9 GB para ~39,8B parámetros) equivale a unos 4,5 bits por parámetro, coherente con NVFP4 más escalas y metadatos.

En cuanto a entrenamiento, la model card del repositorio remite a la del modelo base: datos web públicos y rastreados, texto y código, datos con licencia comercial y datos sintéticos generados por IA. El post-entrenamiento incluyó instruction tuning, aprendizaje por refuerzo y datos de preferencias humanas. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo expone un canal de razonamiento (`reasoning_content`) que debe preservarse al reenviar el historial de conversación, lo que apunta a un modo de pensamiento explícito entrenado en la fase de post-entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia y soporte de `--jinja` en llama.cpp.
- Razonamiento explícito: el modelo emite contenido de razonamiento separado (`reasoning_content`) que el cliente debe reinyectar en el historial; los configs de cliente reservan hasta 65.536 tokens de presupuesto de generación, razonamiento incluido.
- Uso como agente de código: el repositorio incluye configuración lista para pi (coding agent) y OpenCode, lo que implica soporte de flujos agénticos con llamadas a herramientas sobre el endpoint compatible con la API de llama-server.
- Contexto largo: 262.144 tokens compartidos entre prompt y salida, útil para análisis de repositorios, documentos extensos o historiales largos.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de la API HTTP de llama-server con el formato habitual de OpenAI.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agente de código en local: el repositorio incluye `pi-models.json` y `opencode.json` con contexto de 262.144 tokens y presupuesto de generación de 65.536, de modo que el modelo puede ejecutarse como agente de programación (lectura de repositorio, edición multiarchivo, ejecución de comandos) sin salir de la máquina.
- Revisión y refactorización de repositorios completos: con 256K de contexto se puede inyectar un conjunto amplio de archivos en una sola pasada y pedir cambios coherentes entre módulos, algo inviable con ventanas de 32K.
- Asistencia al desarrollo integrada en pipelines: al exponerse mediante `llama-server` con API compatible, puede conectarse a scripts de CI/CD o a herramientas internas para generar parches, mensajes de commit o documentación técnica.
- Análisis de documentación extensa y contratos: la ventana de 262.144 tokens permite procesar manuales, pliegos o expedientes completos y hacer preguntas con trazabilidad sobre el texto original, sin troceado agresivo.
- Atención al cliente con historial largo: conversaciones multi-turno con memoria de todo el historial previo, ejecutables on-premise gracias a la licencia Apache 2.0 y al despliegue en una sola GPU de 48 GB o superior.
- Despliegue con requisitos de soberanía del dato: al ser pesos abiertos y ejecutarse localmente en llama.cpp, es apto para entornos sanitarios, legales o industriales donde el texto no puede salir de la infraestructura.
- Generación de código y tareas de razonamiento por lotes: con `--np 1` y muestreo `temp 1`, `top-p 0.95`, `top-k 20`, `min-p 0`, se puede usar para generación masiva de tests, explicaciones de código o documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante cuantizada remite explícitamente a la model card del modelo base ([RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint)) para consultar los benchmarks, que no se incluyen en los datos proporcionados. Tampoco se documentan métricas de latencia o throughput para esta cuantización.

## Requisitos de hardware

- Pesos: 22,9 GB en un único archivo GGUF NVFP4.
- Memoria recomendada por el autor: al menos 48 GB de memoria de GPU para el contexto completo de 262.144 tokens, o memoria unificada en DGX Spark.
- GPUs probadas por el autor: NVIDIA B300, RTX PRO 6000 Blackwell, RTX Spark y DGX Spark.
- NVFP4 es un formato FP4 de NVIDIA orientado a hardware reciente; el soporte en generaciones anteriores no está documentado en la información disponible. No se debe asumir funcionamiento en GPUs sin soporte del formato.
- Estimación para contextos reducidos: con cuantización f16 de caché KV, bajar `-c` reduce el consumo; un contexto de decenas de miles de tokens podría situar el total en el rango de 32-40 GB, aunque es una estimación no verificada por el autor. La propia model card indica reducir `-c` solo si se necesita menos memoria de KV.
- Despliegue: llama.cpp con CUDA (build con soporte de Flint) y `llama-server`; el comando de referencia es `llama-server -m flint-nvfp4.gguf --alias flint -ngl all -c 262144 -np 1 -fa on -ctk f16 -ctv f16 --jinja`. No se documentan recetas para vLLM, TGI, Ollama ni otras herramientas.
- Clientes validados: pi (coding agent) y OpenCode, con configuraciones incluidas en el repositorio; el límite de contexto del cliente debe coincidir con `-c`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Flint NVFP4 GGUF (este) | ~39,8B | 262.144 | Apache 2.0 | GGUF NVFP4 en HF; requiere llama.cpp con CUDA | No disponible |
| RecursiveSI/flint (base) | ~39,8B (mismo modelo) | 262.144 (según esta variante) | Apache 2.0 | Pesos del modelo base en HF | Benchmarks en su model card, no incluidos aquí |
| Qwen3-32B | 32,8B | 32.768 nativo (131.072 con YaRN) | Apache 2.0 | Múltiples formatos y cuantizaciones | No comparable en esta ficha |
| Llama 3.3 70B | 70,6B | 128.000 | Llama 3.3 Community License | Pesos abiertos con restricciones de uso | No comparable en esta ficha |
| Gemma 3 27B | 27B | 128.000 | Gemma Terms of Use | Pesos abiertos con licencia propia | No comparable en esta ficha |

La comparación relevante es de encaje, no de calidad: Flint ofrece el mayor contexto del grupo (262.144 tokens) con licencia Apache 2.0 y un tamaño intermedio entre Qwen3-32B y Llama 3.3 70B, pero su formato NVFP4 limita el hardware compatible a GPUs NVIDIA recientes, mientras que las alternativas se distribuyen en GGUF estándar y safetensors ejecutables en un abanico mucho más amplio de aceleradores. No se dispone de datos de benchmarks de Flint en esta información para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- No hay resultados de benchmarks verificables en la información disponible; cualquier afirmación de calidad relativa al modelo base debe contrastarse en la model card de [RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint).
- Sesgos conocidos: no documentados. Al entrenarse con datos web rastreados, es esperable heredar sesgos presentes en esas fuentes, pero el autor no publica evaluación al respecto.
- Riesgo de alucinación: no cuantificado. El modo de razonamiento explícito no elimina la generación de contenido incorrecto; en usos críticos se requiere verificación externa.
- Idiomas soportados: no declarados. No se debe asumir calidad multilingüe sin evaluación propia.
- Dependencia de hardware: NVFP4 está orientado a GPUs NVIDIA recientes y el autor solo ha probado B300, RTX PRO 6000 Blackwell, RTX Spark y DGX Spark. En GPUs sin soporte del formato el modelo puede no cargar o degradarse.
- Dependencia de software: se necesita una build de llama.cpp con soporte de Flint; versiones sin ese soporte no servirán el modelo correctamente.
- Integración de cliente: es obligatorio usar `--jinja` y preservar `reasoning_content` al reenviar el historial; omitirlo degrada la coherencia de la conversación. El límite de contexto del cliente debe coincidir con el valor de `-c`.
- Gestión de memoria: con 262.144 tokens de contexto el consumo de caché KV es elevado; reducir `-c` es la vía documentada para bajarlo. Mantener `--swa-full` sin definir es necesario para conservar la caché de ventana deslizante compacta.
- Licencia: Apache 2.0 permite uso comercial, pero el titular debe verificar las obligaciones de atribución y las condiciones de los datos de entrenamiento declarados (incluidos datos con licencia comercial y sintéticos).
- Fecha de creación del repositorio: 21 de octubre de 2026; el modelo es reciente y no se documenta un historial de mantenimiento.

## Enlaces

- [RecursiveSI/flint-nvfp4-gguf en Hugging Face](https://huggingface.co/RecursiveSI/flint-nvfp4-gguf)
- [Modelo base RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint)
- [Licencia Apache 2.0 del repositorio](https://huggingface.co/RecursiveSI/flint-nvfp4-gguf/blob/main/LICENSE)
- [Guía de compilación con CUDA de llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md#cuda)
- [Guía de instalación de pi](https://pi.dev/)
- [Guía de modelos personalizados de pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/models.md)
- [Documentación de OpenCode](https://opencode.ai/v2/docs/)
- [Guía de proveedores personalizados de OpenCode](https://opencode.ai/v2/docs/providers/#custom)
- [CLI de Hugging Face](https://huggingface.co/docs/huggingface_hub/guides/cli)
