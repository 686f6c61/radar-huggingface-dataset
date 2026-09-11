# sizzlebop/PrimeMind-9B-GGUF

## Resumen

PrimeMind-9B-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario sizzlebop a partir de CrowdMind/PrimeMind-9B, un ajuste fino multimodal derivado de Qwen/Qwen3.5-9B. El objetivo declarado es el razonamiento compacto y denso en informacion: el modelo estructura su proceso de pensamiento dentro de etiquetas `<think>` antes de emitir la respuesta final, reduciendo el relleno verbal tipico de los modelos de razonamiento sin sacrificar, segun el autor, la precision en deduccion matematica y visual.

El repositorio incluye el backbone de texto en siete niveles de cuantizacion (desde BF16 de 16,69 GB hasta Q2_K de 3,56 GB) y un proyector multimodal independiente (`mmproj`) de 0,86 GB que aporta la torre de vision. La arquitectura heredada es `Qwen3_5ForConditionalGeneration`, con backbone de texto de 32 capas que combina atencion lineal DeltaNet con atencion completa, torre de vision ViT de 27 capas, ventana de contexto declarada de hasta 262.144 tokens y licencia Apache 2.0.

Su relevancia practica es acotada pero concreta: permite ejecutar en hardware de consumo un modelo de ~9B con entrada de imagen y razonamiento estructurado mediante llama.cpp u Ollama. Como contrapartida, el repositorio no tiene descargas ni valoraciones, no publica benchmarks, solo declara ingles como idioma y su ajuste fino se hizo con 1.200 ejemplos sinteticos, por lo que debe tratarse como un experimento reproducible mas que como un modelo listo para produccion.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (`model_type`: `qwen3_5`). Backbone de texto `qwen3_5_text` de 32 capas con atencion lineal DeltaNet hibrida + atencion completa. Torre de vision `qwen3_5_vision`, ViT de 27 capas, tamaño oculto 1152, patch 16, merge espacial 2 |
| Parámetros totales | 8.953.803.264 (~8,95B) según los tensores safetensors del modelo base |
| Parámetros activos | El autor declara "~9B activos" para PrimeMind-9B y "5,8B parámetros activos" para Qwen/Qwen3.5-9B. No se indica que la arquitectura sea MoE y la discrepancia no está resuelta en la información disponible |
| Longitud de contexto | Hasta 262.144 tokens (declarado). Los ejemplos de despliegue del autor usan `-c 8192` |
| Tipos de cuantización | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K. El modelo base se publico originalmente en BitsAndBytes NF4 de 4 bits |
| Idiomas soportados | `en` (inglés, único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF para llama.cpp; `mmproj-PrimeMind-9B-BF16.gguf` para el proyector de visión. Origen en safetensors BF16 reconstruidos por dequantizacion desde NF4 |
| Tamaño del repositorio | 56,3 GB |
| Vocabulario | 248.320 tokens |
| Precisión nativa | bfloat16 |

## Arquitectura y entrenamiento

El backbone de texto es un transformer de 32 capas que alterna atencion lineal DeltaNet con atencion completa, una combinacion pensada para reducir el coste de la atencion a contextos largos. El componente multimodal es un ViT de 27 capas con tamaño oculto 1152, patch de 16 y merge espacial de 2, conectado mediante un proyector que se distribuye como archivo `mmproj` separado. El pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas mixtas de texto e imagen.

El ajuste fino se realizo mediante LoRA SFT con rango 64, alpha 128 y dropout 0,05 sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Los datos de entrenamiento son 1.200 muestras sinteticas: 600 ejemplos de matematicas y razonamiento del dataset `catsaresupercool/synthetic-caveman-thinking` y 600 ejemplos de razonamiento de navegacion con imagenes de `nibauman/objectnav-sft-claude-caveman`. La perdida de entrenamiento paso de 5,59 a 0,78.

La innovacion que se anuncia es el "razonamiento comprimido" (etiquetado en la ficha como *caveman thinking*): el bloque `<think>` se usa para condensar los pasos intermedios en muy pocos tokens antes de la respuesta final. En el plano de la distribucion, todos los GGUF se generaron dequantizando previamente las 1.074 matrices NF4 del modelo base a BF16 con `bitsandbytes.functional.dequantize_4bit`, verificando coincidencia exacta en 760 tensores antes de exportar. Conviene subrayar que el BF16 resultante no es la precision original del entrenamiento, sino una reconstruccion desde 4 bits.

## Capacidades

- Generacion de texto conversacional en inglés con formato ChatML y bloque de razonamiento `<think>` explícito.
- Razonamiento matemático y aritmético paso a paso en formato compacto, entrenado específicamente sobre 600 ejemplos de este tipo.
- Comprensión de imágenes (pipeline `image-text-to-text`): preguntas y respuestas sobre escenas, con deducción visual.
- Razonamiento de navegación sobre imágenes, orientado a localizar objetos y planificar movimientos en entornos de interior.
- Deducción visual para tareas de *grounding* descriptivo (por ejemplo, localizar objetos mencionados en una escena).
- Extracción y asistencia sobre código: el autor recomienda explícitamente la cuantización Q5_K_M para "reasoning and code extraction".
- Modo de pensamiento: el bloque `<think>` es parte del formato de prompt y puede forzarse desde la plantilla de Ollama incluida.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado; solo se documenta razonamiento de un turno con bloque de pensamiento.
- Capacidades multilingües: no disponibles; únicamente se declara inglés.

## Casos de uso

- Verificación aritmética en local: el modelo resuelve operaciones paso a paso dentro de `<think>` con pocos tokens de salida, lo que lo hace util para validar cálculos en hojas de cálculo o informes sin depender de una API externa.
- Preguntas y respuestas sobre escenas de interior: combinando el GGUF de texto con `mmproj-PrimeMind-9B-BF16.gguf` mediante `llama-qwen2vl-cli`, se puede preguntar por la posicion de objetos concretos en una imagen de una habitacion, tal como muestra el ejemplo del autor.
- Preetiquetado de datasets de visión: generar descripciones y referencias de objetos en inglés sobre lotes de imagenes antes de una revisión humana, aprovechando que el ajuste incluyó razonamiento de navegación con imagenes.
- Robótica móvil de interior y simulación: generar trayectorias descritas en lenguaje natural a partir de una vista de la escena, usando el modelo como modulo de razonamiento de alto nivel sobre observaciones visuales.
- Despliegue en estación de trabajo sin GPU de centro de datos: la cuantización Q4_K_M (5,24 GB) mas el proyector (0,86 GB) permite servir texto e imagen desde una GPU de 8-12 GB con `llama-server` u Ollama.
- Endpoint local compatible con OpenAI para prototipos: `llama-server` expone una API en el puerto 8080 que puede sustituir a un proveedor externo durante el desarrollo, con la orquestación de herramientas gestionada por prompt al no estar documentado el *tool calling*.
- Extracción de fragmentos de código desde documentación técnica en inglés: con Q5_K_M, el autor señala esta cuantización como el equilibrio recomendado para razonamiento y extracción de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor únicamente reporta la perdida de entrenamiento (5,59 -> 0,78), que no es una métrica comparable entre modelos. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion estandar, ni comparaciones con el modelo base Qwen3.5-9B.

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del tamaño de archivo declarado mas el *overhead* de runtime y una cache KV para contextos moderados; el consumo real a contexto largo no esta documentado.

- BF16 (`PrimeMind-9B-BF16.gguf`, 16,69 GB): requiere 24 GB o mas de VRAM. A100 40 GB, H100, L40S, o RTX 3090/4090 de 24 GB con contexto recortado.
- Q8_0 (8,87 GB): RTX 4080/4090 (16-24 GB), A100 40 GB. Estimacion de 11-13 GB con *overhead*.
- Q6_K (6,85 GB): GPU de 12 GB al limite; 16 GB (RTX 4060 Ti 16 GB, A4000) con holgura.
- Q5_K_M (6,02 GB): RTX 3060 12 GB, RTX 4060 Ti, Apple Silicon con 16 GB unificados.
- Q4_K_M (5,24 GB): cuantización por defecto recomendada por el autor; cabe en GPU de 8 GB y en equipos con 16 GB de RAM unificada.
- Q3_K_M (4,31 GB) y Q2_K (3,56 GB): GPUs de 6-8 GB y equipos de bajos recursos; la degradación de calidad en razonamiento no esta medida.
- Vision: sumar 0,86 GB del archivo `mmproj-PrimeMind-9B-BF16.gguf` en cualquier configuración multimodal.
- Contexto: la ventana declarada es de 262.144 tokens, pero el ejemplo de `llama-server` del autor arranca con `-c 8192`. La cache KV a contexto completo no esta cuantificada en la información disponible.
- Opciones de despliegue documentadas: `llama-cli` (texto), `llama-qwen2vl-cli` (texto + imagen), `llama-server` (servidor local) y Ollama mediante el `Modelfile` incluido. vLLM y TGI no están documentados para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de sus fichas publicas y deben verificarse antes de tomar decisiones. Para PrimeMind-9B-GGUF no hay métricas de rendimiento publicadas.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| PrimeMind-9B-GGUF | ~8,95B | 262.144 (declarado) | Apache 2.0 | No disponible | GGUF en HuggingFace; 0 descargas y 0 valoraciones |
| Qwen3.5-9B (modelo base del ajuste) | ~9B (5,8B activos segun la ficha) | No disponible en la información | No disponible en la información | No disponible | No verificado |
| Qwen3-8B | ~8,2B | 32.768 nativo, extensible con YaRN | Apache 2.0 | Benchmarks publicos del autor | safetensors y GGUF ampliamente extendidos |
| Llama 3.1 8B | ~8B | 128.000 | Llama 3.1 Community License | Benchmarks publicos del autor | safetensors y GGUF ampliamente extendidos |
| Gemma 2 9B | ~9,2B | 8.192 | Gemma Terms of Use | Benchmarks publicos del autor | safetensors y GGUF ampliamente extendidos |

Frente a estas alternativas, el diferencial de PrimeMind-9B es la combinación de entrada visual y razonamiento comprimido en un GGUF de 5-6 GB. En cambio, carece de validación comunitaria, de benchmarks y de soporte multilingüe, y los tres comparadores tienen ecosistemas de despliegue mas maduros y evaluaciones reproducibles.

## Limitaciones y advertencias

- Ajuste fino con solo 1.200 muestras sinteticas: riesgo alto de sobreajuste al estilo "caveman" y de degradación en tareas generales o en formatos de respuesta distintos del entrenado.
- Doble cuantizacion: los pesos originales eran NF4 de 4 bits y el BF16 del repositorio es una reconstruccion por dequantizacion. La precision no se recupera; el BF16, Q8_0 y Q6_K parten de esa misma base ya degradada.
- Idiomas: solo se declara inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Sin benchmarks ni validacion externa: 0 descargas y 0 valoraciones en el momento de la consulta. No hay forma de contrastar las afirmaciones de precision matemática y visual del autor.
- Tool calling y uso como agente no documentados: no se puede asumir compatibilidad con *function calling* ni con razonamiento multi-paso autónomo.
- Contexto: la ventana de 262.144 tokens es una cifra declarada, pero los ejemplos del autor usan 8.192. El coste de memoria y la calidad real a contextos muy largos no están documentados.
- Formato de prompt rígido: requiere ChatML con `<|im_start|>` y el bloque `<think>`; el `Modelfile` de Ollama abre la etiqueta de forma forzada, lo que puede producir respuestas mal formadas con plantillas distintas.
- Riesgo de alucinación: especialmente relevante en tareas de grounding visual y de aritmética, y probablemente mayor en Q2_K y Q3_K_M, cuya degradación no ha sido medida.
- Sesgos: los datasets de entrenamiento son sinteticos y generados con otro modelo; pueden arrastrar sesgos del generador y de la distribución de escenas de interior de `objectnav-sft-claude-caveman`.
- Licencia: el repositorio declara Apache 2.0, pero conviene verificar los términos del modelo intermedio CrowdMind/PrimeMind-9B y del base Qwen/Qwen3.5-9B antes de un uso comercial.
- Elección de cuantización: para producción no se recomienda bajar de Q5_K_M si el caso de uso depende de razonamiento matemático o extracción de código.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sizzlebop/PrimeMind-9B-GGUF
- Modelo base del ajuste: https://huggingface.co/CrowdMind/PrimeMind-9B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de razonamiento matemático sintetico: https://huggingface.co/datasets/catsaresupercool/synthetic-caveman-thinking
- Dataset de razonamiento de navegación con imágenes: https://huggingface.co/datasets/nibauman/objectnav-sft-claude-caveman
- llama.cpp (herramientas citadas: `llama-cli`, `llama-server`, `llama-qwen2vl-cli`, `convert_hf_to_gguf.py`): https://github.com/ggml-org/llama.cpp
- Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos fueron páginas generales de YouTube sin relación con el repositorio. No se dispone de paper, blog, demo ni informe técnico adicional.
