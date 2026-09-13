# Mantisec/Qwen3.8-27B-TURBO-FP16

## Resumen

Qwen3.8-27B-TURBO-FP16 es una conversión a precisión FP16 del checkpoint `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, publicada por el usuario Mantisec. No es un entrenamiento nuevo: los pesos son los del modelo fuente, recasteados de BF16 a FP16 para que puedan ejecutarse y ajustarse en GPU NVIDIA V100 (Volta, sm_70), que no dispone de Tensor Cores con soporte nativo de BF16.

El modelo declara 27.781.427.952 parámetros (~27,78 B) en formato safetensors, con un repositorio de 55,6 GB. La etiqueta de arquitectura del repositorio es `qwen3_5` y el pipeline declarado es `image-text-to-text`, por lo que hereda de la familia Qwen una interfaz conversacional con entrada de imagen y texto. No se publican datos sobre volumen de entrenamiento, composición del dataset ni longitud de contexto.

Su relevancia es práctica: permite reutilizar un modelo de ~28 B en parques de GPU Volta sin migrar a hardware con BF16, con una validación numérica que reporta un 99,80 % de coincidencia de tokens y una similitud coseno mínima de 0,999265 frente al checkpoint original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; el repositorio etiqueta `qwen3_5` (familia Qwen, transformer) sin especificar si es densa o MoE |
| Parametros totales | 27.781.427.952 (~27,78 B), dato de safetensors |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (único formato publicado). No se listan variantes GGUF, AWQ, GPTQ, INT8 ni INT4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el README indica que se hereda de la licencia del modelo fuente, que no se especifica |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamano del repositorio | 55,6 GB |
| Hardware objetivo | NVIDIA V100 (Volta, sm_70) con Tensor Cores FP16 |
| Pipeline declarado | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica los pesos del modelo fuente: aplica una conversión de tipo de dato. La herramienta empleada es `bfsquish` v0.1.0, con estrategia solicitada `auto` y estrategia efectiva `range_checked`. El procedimiento consiste en un upcast directo a FP32 seguido de un cast a FP16 con comprobación de rango: los valores que quedan fuera del rango finito de FP16 se rechazan en lugar de recortarse, y el error de redondeo se registra en `bfsquish_conversion.json`. El objetivo declarado es evitar rotaciones que alteren el grafo de cómputo en pesos entrenados en BF16 que ya caben dentro del rango de FP16.

La conversión se realizó el 2026-09-13 y se publicó junto a una plantilla de chat de terceros: `peculiar-ragdoll/Qwen-Sharp-Chat-Templates`, revisión `fa3a1295882d31132770c156fced4e616b5db25d`, versión `qwen3.8-froggeric-v22.4.0` (Apache-2.0), publicada como `chat_template.jinja` y en `tokenizer_config.json#chat_template`. El renderizado de la plantilla no altera los pesos. También se incluye un perfil de precalentamiento para vLLM (`deployment/vllm/warmup-profile.v1.json`), de solo datos y no ejecutable, cuyo alcance es únicamente texto: no cubre preprocesado de imagen, vídeo o audio, ni codificadores de visión ni rutas de fusión multimodal. No hay información sobre datos de entrenamiento, número de tokens, RLHF o DPO del modelo de origen.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio y la plantilla de chat incluida.
- Entrada multimodal de imagen y texto, según el pipeline declarado `image-text-to-text`; la ficha no detalla el codificador de visión ni el rango de resolución soportado.
- Inferencia en FP16 sobre GPU Volta (sm_70), que es el caso de uso explícito de la conversión.
- Compatibilidad con `transformers` y con endpoints, según la etiqueta `endpoints_compatible`.
- Servido en vLLM con un perfil de precalentamiento orientado a generación de texto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.
- Capacidades de audio o vídeo: no disponibles (el perfil de vLLM las menciona solo como rutas que no precalienta).
- Cobertura multilingüe: no disponible.

## Casos de uso

- Inferencia en clústeres con NVIDIA V100: el modelo se puede desplegar en FP16 aprovechando los Tensor Cores FP16 de Volta, sin necesidad de kernels BF16, que esa generación no soporta de forma nativa.
- Ajuste fino con LoRA o QLoRA sobre V100: al estar en FP16, el entrenamiento evita el recasteo a BF16 y permite usar el mismo tipo de dato que la inferencia.
- Sustitución de un checkpoint BF16 en pipelines existentes: al conservar la estructura de pesos y publicar una plantilla de chat compatible, se puede intercambiar el modelo sin reescribir el formateo de prompts.
- Migración de infraestructura con presupuesto limitado: en lugar de renovar a A100/H100 con BF16, se reutiliza hardware Volta existente para un modelo de ~28 B.
- Evaluación de fidelidad de conversiones: el repositorio incluye métricas verificables (coincidencia de tokens, similitud coseno, diferencia máxima de logits) que sirven como referencia para validar otras conversiones de precisión.
- Integración en CI/CD de publicación de modelos: el comando `bfsquish run --model <origen> --output-dir ./out --strategy auto` es reproducible y versionable, lo que permite automatizar conversiones y comprobar el veredicto de validación antes de publicar.
- Servicio de chat multimodal en despliegues vLLM: con el perfil de precalentamiento se puede arrancar el servido de texto y, por separado, habilitar las rutas de imagen si el modelo base las soporta.
- Prototipado de asistentes conversacionales sin restricciones de contenido: el sufijo `Heretic-Uncensored` del modelo base apunta a ese escenario, siempre con moderación externa en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo único aportado son métricas de fidelidad de la conversión frente al checkpoint de origen:

| Metrica | Valor |
|---|---|
| Veredicto de validacion | PASS |
| Metodo de validacion | `generate` |
| Maxima diferencia absoluta de logits (vs. origen) | 1,675378 |
| Similitud coseno minima (vs. origen) | 0,999265 |
| Tasa de coincidencia de tokens | 99,80 % (umbral de aprobado ≥98,00 %) |
| Escaneo de inf/NaN | superado (sin inf/NaN) |
| Casos de validacion | 4 casos acotados |

## Requisitos de hardware

- VRAM estimada para los pesos en FP16: ~55,6 GB (27,78 B × 2 bytes), cifra coherente con el tamaño del repositorio.
- VRAM total recomendada para inferencia: del orden de 62-70 GB contando caché KV y activaciones; la cifra exacta depende de la longitud de contexto, que no se especifica.
- GPU recomendadas: 1× A100 80 GB o 1× H100 80 GB para una sola tarjeta. Con V100 de 32 GB hacen falta al menos 2 unidades en paralelo por tensor parallelism (64 GB, margen muy ajustado). Alternativa: 2× A100 40 GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en FP16. Serían necesarias 4× RTX 4090 (96 GB) para alojar los pesos sin cuantizar. Con cuantización a 8 bits (~28 GB) o 4 bits (~14 GB) cabría en 2× RTX 4090 o en 1× RTX 4090 respectivamente, pero esas variantes no se publican y habría que generarlas.
- Opciones de despliegue: `transformers` (librería declarada y formato safetensors), vLLM (incluye perfil de precalentamiento v1 para texto), TGI como alternativa compatible con safetensors. llama.cpp y Ollama requerirían una conversión previa a GGUF, que no se ofrece en el repositorio.
- Ajuste fino: viable en FP16 sobre V100, con las precauciones de rango numérico propias de FP16 (máximo finito ~65504).
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

Los datos de terceros proceden de su documentación pública y no se han verificado en el contexto de esta búsqueda. Las celdas sin dato confirmado se marcan como no disponible.

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Notas |
|---|---|---|---|---|---|
| Mantisec/Qwen3.8-27B-TURBO-FP16 | 27,78 B | no disponible | safetensors FP16 | heredada del origen, sin especificar | Conversión FP16 para V100; pipeline image-text-to-text |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,78 B (mismo checkpoint) | no disponible | BF16 (origen de la conversión) | no disponible | Modelo fuente; merge comunitario con ajuste orientado a eliminar rechazos |
| Qwen3-32B (referencia de familia) | ~32,8 B | 32.768 nativo, ampliable con YaRN | safetensors BF16 | Apache-2.0 | Alternativa densa de la misma familia, con soporte BF16 nativo |
| Gemma 3 27B | ~27 B | 128.000 | safetensors | licencia Gemma | Alternativa multimodal de tamaño comparable |
| Mistral Small 3.1 24B | ~24 B | 128.000 | safetensors | Apache-2.0 | Alternativa densa algo menor, con licencia permisiva |

No hay datos de rendimiento comparado disponibles para el modelo objeto de la ficha, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La ficha no aporta benchmarks de capacidades: no se puede estimar la calidad del modelo en razonamiento, código o matemáticas a partir de la información disponible.
- La licencia no está declarada explícitamente: se hereda del modelo fuente, que tampoco la especifica. El uso comercial es jurídicamente incierto y requiere consultar la ficha del modelo base.
- El sufijo `Heretic-Uncensored` del modelo de origen indica un ajuste orientado a reducir los rechazos del modelo. Es esperable que genere contenido inapropiado o sensible ante determinados prompts; en producción exige moderación externa y filtrado de salida.
- La conversión a FP16 reduce el rango dinámico respecto a BF16 (máximo finito ~65504). La estrategia `range_checked` rechaza valores fuera de rango en lugar de recortarlos, por lo que puede haber pérdida de información en pesos extremos y riesgo de desbordamiento en ajuste fino.
- La coincidencia de tokens del 99,80 % implica aproximadamente un 0,2 % de divergencia respecto al checkpoint original: la salida no es idéntica.
- La diferencia máxima absoluta de logits es de 1,675378, un valor no despreciable aunque la similitud coseno se mantenga alta (0,999265).
- No se especifican longitud de contexto ni idiomas soportados, lo que impide planificar despliegues con requisitos concretos de ventana o cobertura lingüística.
- El perfil de precalentamiento de vLLM cubre únicamente texto: no valida las rutas multimodales, aunque el pipeline declarado sea `image-text-to-text`.
- Se trata de un merge comunitario de procedencia compleja (múltiples etapas de fusión y ajuste en el nombre), lo que dificulta la trazabilidad de los datos de entrenamiento y la reproducibilidad.
- El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta: no hay validación por parte de la comunidad.
- No se publican variantes cuantizadas: quien necesite GGUF, AWQ o GPTQ debe generarlas por su cuenta y validarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mantisec/Qwen3.8-27B-TURBO-FP16
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Herramienta de conversión bfsquish: https://github.com/mantisec/mantisec-bfsquish
- Plantilla de chat utilizada: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- La búsqueda web realizada no devolvió resultados relevantes: únicamente páginas de ayuda de YouTube sin relación con el modelo. No se han encontrado papers, blogs ni demos adicionales sobre este checkpoint.
