# ryugyosoft/Qwen3.5-9B-onw

## Resumen

Qwen3.5-9B-onw es una conversión del modelo multimodal Qwen/Qwen3.5-9B preparada por el desarrollador ryugyosoft para ejecutarse íntegramente en la NPU de Intel mediante el motor **onw** (俺のNPUがこんなに動くわけない). No se trata de un modelo entrenado desde cero, sino de un reempaquetado y recuantizado de los pesos originales de Qwen para el stack OpenVINO, con el objetivo de sacar la inferencia de la CPU y la GPU y llevarla a la unidad NPU 3720 de los procesadores Core Ultra. Es una ficha relevante porque demuestra que una arquitectura híbrida de 9B parámetros con visión puede caber y funcionar en silicio de portátil.

El modelo conserva la arquitectura del base: 32 capas que combinan 24 bloques de Gated DeltaNet con 8 bloques de atención con gating, distribuidos en 4 segmentos de 8 capas. Incorpora también un codificador visual ViT de 27 capas para entradas de imagen. La conversión aplica cuantización INT4 de grupo 128 a los segmentos del transformer y un segmento INT8 para la LM-head, dando un repositorio de 10,1 GB.

Su relevancia práctica es doble: por un lado, ofrece inferencia multimodal (texto e imagen) totalmente local y sin nube en hardware de consumo; por otro, publica cifras concretas de rendimiento en NPU (~4 tok/s de decodificación, 0,6 s de codificación visual para imágenes de 512x512, ~10 GB de memoria). El principal precio a pagar es la latencia: no es un modelo pensado para servir tráfico concurrente, sino para asistentes embebidos y experimentación con aceleradores NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas (24 Gated DeltaNet + 8 atención con gating) más ViT de 27 capas para visión |
| Parametros totales | no disponible (el nombre del modelo indica ~9B; el repositorio ocupa 10,1 GB en INT4) |
| Parametros activos | no aplica (no es un modelo MoE; arquitectura densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 con cuantización de grupo 128 en los segmentos del transformer; INT8 compartido en la entrada y en el segmento LM-head |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (repositorio compatible con `onw`; no se distribuyen safetensors ni GGUF) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 10,1 GB |
| Modelo base | Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

Este repositorio no documenta ningún entrenamiento propio: los pesos se re-cuantizan y reestructuran directamente a partir de Qwen/Qwen3.5-9B mediante la herramienta `onw convert`. Por tanto, la composición del dataset, el número de tokens vistos y las fases de alineación (RLHF, DPO u otras) del modelo original no se detallan en la información disponible. Lo que sí se describe con precisión es la reestructuración para NPU: los 32 bloques se agrupan en 4 segmentos de 8 capas, más un segmento independiente para la LM-head con entrada INT8 compartida, que se omite en los bloques de prompt que no necesitan calcular logits.

La innovación técnica destacable está en la ejecución del Gated DeltaNet sobre el acelerador. Para la decodificación token a token se emplea una forma matricial de 1 token, mientras que los bloques de prompt de 16 tokens se procesan en forma *chunkwise-parallel* con una inversa exacta por duplicación de bloques. Para evitar desbordamientos en fp16 durante los bloques multi-token, la salida del DeltaNet se escala por 1024 (aprovechando subnormales de fp16) y la gated RMSNorm se preescala a la inversa, de modo que la suma de cuadrados no pueda desbordar. En visión, el ViT de 27 capas se compila como un grafo estático para entradas de 512x512 con las tablas de posición y rotación ya embebidas, y las posiciones MRoPE de los tokens de imagen se calculan en el host.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Comprensión de imágenes combinada con preguntas en lenguaje natural (image-text-to-text), con imágenes de 512x512 que se tokenizan en 256 tokens.
- Razonamiento y conocimiento general heredados del modelo base Qwen3.5-9B.
- Seguimiento de conversación con procesamiento incremental: en turnos posteriores solo se procesan los tokens nuevos, reutilizando el estado previo.
- Decodificación por búsqueda de prompt (*prompt lookup decoding*), activada en las mediciones de rendimiento publicadas.
- Capacidades de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Modo de razonamiento explícito (*thinking*), audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- **Asistentes locales con privacidad estricta**: al ejecutarse íntegramente en la NPU con ~10 GB de memoria y sin conexión a la nube, es adecuado para portátiles corporativos o sanitarios donde los datos no pueden salir del dispositivo.
- **Preguntas sobre imágenes en el dispositivo**: con 0,6 s de codificación visual y 256 tokens por imagen de 512x512, sirve para describir capturas, revisar documentos escaneados o responder preguntas sobre diagramas sencillos sin subir ficheros a un servicio externo.
- **Conversación multi-turno embebida**: el procesamiento incremental de turnos posteriores (solo tokens nuevos) lo hace viable para diálogos mantenidos en un kiosco o panel industrial con presupuesto de cómputo muy ajustado.
- **Atención al cliente en inglés y japonés**: puede gestionar conversaciones en los dos idiomas soportados en entornos donde el tráfico es bajo y la prioridad es la soberanía del dato, aceptando la latencia de ~4 tok/s.
- **Investigación en arquitecturas híbridas**: la implementación de Gated DeltaNet en forma *chunkwise-parallel* con bloques de 16 tokens y corrección de rango en fp16 es un caso de estudio útil para quien investigue SSM y atención híbrida en aceleradores no convencionales.
- **Despliegue en campo sin conectividad**: inspección de equipos, ganadería, obra civil o logística remota, donde un portátil Core Ultra puede ofrecer asistencia multimodal sin red.
- **Evaluación comparativa de aceleradores NPU**: el repositorio publica métricas reproducibles (tok/s, tiempos de compilación, memoria), lo que permite usarlo como referencia en estudios de eficiencia energética y rendimiento de NPU frente a GPU y CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente proporciona métricas de ejecución sobre NPU 3720 (Core Ultra 9 285HX):

| Metrica | Valor |
|---|---|
| Decodificacion | ~4 tok/s (con prompt lookup decoding activado) |
| Vision (imagen 512x512) | 256 tokens; 0,6 s de codificacion |
| Turno de seguimiento | solo se procesan los tokens nuevos |
| Primera compilacion en NPU | ~13 min |
| Memoria | ~10 GB |

No hay datos de MMLU, HumanEval, GSM8K ni de comparaciones de calidad frente al modelo base sin cuantizar.

## Requisitos de hardware

- **Plataforma objetivo**: NPU 3720 de Intel (probada en Core Ultra 9 285HX). El modelo está empaquetado para OpenVINO y el motor `onw`, no para CUDA ni ROCm.
- **Memoria**: ~10 GB, correspondientes al repositorio de pesos cuantizados más el estado de ejecución.
- **GPU dedicadas**: no aplicable en este formato. Al ser un artefacto OpenVINO orientado a NPU y CPU, no se ofrecen estimaciones de VRAM para A100, H100 o RTX 4090.
- **GPU de consumo**: no aplicable; el objetivo es ejecutar sin GPU dedicada aprovechando la NPU integrada y la memoria compartida del sistema.
- **Opciones de despliegue**: motor `onw` (scripts `start.bat` para Windows y `start.sh` para Ubuntu) sobre OpenVINO. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- **Latencia y throughput**: ~4 tok/s en decodificación y 0,6 s por imagen de 512x512 en la configuración medida. No se publican cifras de throughput con batching ni de concurrencia.
- **Coste de arranque**: la primera compilación en NPU tarda aproximadamente 13 minutos, un coste que se amortiza entre ejecuciones.
- **Descarga**: debe hacerse con `hf download` o dejando que `onw` la gestione; un `git clone` sin Git LFS descarga ficheros puntero que el motor detecta y reporta como error.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ryugyosoft/Qwen3.5-9B-onw | ~9B (INT4) | no disponible | OpenVINO IR para NPU, via `onw` | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B | ~9B | no disponible | safetensors (modelo base) | Apache 2.0 | HuggingFace |
| ryugyosoft/Qwen3.5-9B-npu | ~9B | no disponible | Port independiente para NPU | Apache 2.0 | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (híbridos DeltaNet/atención con visión ejecutados en NPU) ni de datos de rendimiento que permitan una comparación cuantitativa de calidad. Las diferencias conocidas entre las tres entradas de la tabla son exclusivamente de empaquetado y de motor de ejecución, no de pesos ni de arquitectura.

## Limitaciones y advertencias

- **Rendimiento muy bajo para uso interactivo**: ~4 tok/s de decodificación implica tiempos de respuesta de decenas de segundos en respuestas largas. No es apto para servir usuarios concurrentes.
- **Compilación inicial larga**: los ~13 minutos de compilación en NPU en el primer arranque condicionan despliegues con reinicios frecuentes.
- **Cobertura de idiomas limitada**: solo inglés y japonés declarados. El rendimiento en castellano no está documentado y probablemente sea degradado.
- **Contexto desconocido**: no se especifica la longitud de ventana soportada, por lo que no puede planificarse su uso en tareas de contexto largo sin validación previa.
- **Riesgo de alucinación**: al ser una conversión del modelo base, hereda sus tasas de alucinación sin que se hayan publicado evaluaciones específicas de la versión cuantizada.
- **Posible degradación por cuantización**: la combinación INT4 grupo 128 más INT8 en la LM-head puede afectar a la calidad frente a los pesos originales en fp16/bf16; no hay mediciones comparativas publicadas.
- **Dependencia de un motor no estándar**: el modelo requiere `onw` y OpenVINO; no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita su integración en infraestructuras existentes.
- **Visión restringida a 512x512**: la resolución de entrada está fijada en 512x512 con 256 tokens por imagen, lo que limita el detalle en documentos densos o imágenes de alta resolución.
- **Validación comunitaria nula**: el repositorio registra 0 descargas y 0 me gusta, por lo que no existe evidencia de terceros sobre su comportamiento en producción.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero se distribuye sin garantías y el autor no ofrece soporte documentado.
- **Riesgo operativo en la descarga**: el uso de `git clone` sin Git LFS produce ficheros puntero inválidos, un error frecuente que provoca fallos de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryugyosoft/Qwen3.5-9B-onw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor onw: https://huggingface.co/ryugyosoft/onw
- Port independiente para NPU: https://huggingface.co/ryugyosoft/Qwen3.5-9B-npu
