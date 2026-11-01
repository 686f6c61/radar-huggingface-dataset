# skryptersi/LFM3-1.7B-Base-oQ4e

## Resumen

LFM3-1.7B-Base-oQ4e es una cuantización de la versión base del modelo LFM3 de 1.700 millones de parámetros, publicada por el usuario skryptersi en Hugging Face. No se trata de un modelo original, sino de un checkpoint cuantizado en formato MLX mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta para reducir el tamaño del modelo manteniendo la mayor calidad posible. El resultado ocupa aproximadamente 1,1 GB en disco, con una media efectiva de 4,801 bits por peso.

La relevancia de esta ficha radica en el uso de cuantización de precisión mixta: en lugar de aplicar un esquema uniforme de 4 bits a todos los tensores, oQ distribuye los pesos entre formatos afines de 4, 5, 6 y 8 bits (más una fracción mínima en BF16) según la sensibilidad de cada capa. Esto permite que las capas más críticas conserven más precisión. El modelo base subyacente, LFM3, pertenece a la familia LFM (Liquid Foundation Models) desarrollada por Liquid AI, caracterizada por arquitecturas distintas del transformer tradicional, aunque la model card no detalla la arquitectura exacta de esta versión.

Al ser un modelo base (no instruido), su utilidad principal es la investigación, la evaluación comparativa de cuantizaciones y el fine-tuning posterior en dispositivos Apple Silicon mediante MLX. No está pensado para uso conversacional directo sin ajuste adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM de Liquid AI; la model card no la detalla) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | no aplicable (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 4-bit (71,0 %), 5-bit (28,0 %), 6-bit (0,9 %), 8-bit (0,008 %) y BF16 (0,022 %), grupo 64; media efectiva 4,801 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El checkpoint procede del modelo LFM3-1.7B-Base, un modelo base de 1.729 millones de parámetros de la familia LFM (Liquid Foundation Models) de Liquid AI. Los modelos LFM se caracterizan por emplear arquitecturas híbridas que combinan componentes distintos del transformer convencional (basados en unidades dinámicas lineales y mecanismos de memoria de estado), aunque la model card de esta cuantización no especifica la arquitectura concreta ni el número de capas. Los datos de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF o DPO) no están disponibles en la información proporcionada; al tratarse de una versión base, cabe asumir preentrenamiento sin alineación con instrucciones.

La innovación principal de este repositorio no está en la arquitectura del modelo sino en la cuantización: oQ (oMLX v0.7.3) aplica cuantización de precisión mixta por tensor. La distribución resultante es la siguiente: 1,228B de pesos en affine 4-bit con grupo 64 (0,643 GiB), 0,484B en affine 5-bit (0,310 GiB), 0,016B en affine 6-bit (0,012 GiB), una porción insignificante en affine 8-bit y BF16. La media efectiva es de 4,801 bits por peso, lo que sitúa el checkpoint completo en 1,038 GB (0,966 GiB) de almacenamiento. Este enfoque asigna más bits a los tensores sensibles a la cuantización, reduciendo la degradación de calidad frente a un esquema uniforme de 4 bits.

## Capacidades

- Generacion de texto en bruto: al ser un modelo base, completa texto y realiza tareas de modelado de lenguaje sin formato conversacional.
- Completado y continuacion de codigo: los modelos base suelen rendir razonablemente en completado de codigo, aunque no hay datos publicados para este checkpoint.
- Compatibilidad con MLX: diseñado para ejecutarse de forma nativa en Apple Silicon (M1/M2/M3/M4) mediante el framework MLX.
- Huella de memoria reducida: aproximadamente 1,1 GB, apto para ejecucion local en portatiles con 8 GB de RAM unificada.
- No hay evidencia de capacidades de vision, audio, tool calling ni thinking mode en la informacion disponible.

## Casos de uso

- Ejecucion local en Apple Silicon: el formato MLX y el tamaño de 1,1 GB permiten cargar el modelo en un MacBook o Mac mini sin GPU dedicada, útil para prototipado sin coste de API.
- Fine-tuning en dispositivos de borde: al ser un checkpoint base de 1,7B parámetros, es un punto de partida razonable para ajustar un modelo pequeño con LoRA en MLX sobre datos propios.
- Evaluacion de cuantizacion de precision mixta: útil para comparar la degradación de calidad de oQ a 4,8 bits medios frente a cuantizaciones uniformes (por ejemplo, 4-bit de MLX estándar) en benchmarks de perplejidad.
- Investigacion en arquitecturas no transformer: los modelos LFM emplean arquitecturas alternativas, por lo que este checkpoint sirve para experimentar con su comportamiento en tareas de modelado de lenguaje.
- Generacion de texto por lotes en local: para tareas como generación de variantes de texto, aumento de datos o rellenado de plantillas, donde no se requiere seguimiento de instrucciones.
- Integracion en aplicaciones offline: el tamaño reducido y el formato safetensors/MLX facilitan empaquetar el modelo en una aplicación de escritorio macOS con inferencia completamente local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la distribución de bits de la cuantización, sin métricas de perplejidad, MMLU, HumanEval ni comparaciones con el checkpoint original en BF16.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,1 GB para los pesos; con contexto y overhead de runtime, se estima entre 1,5 y 2,5 GB de memoria unificada.
- Hardware recomendado: cualquier Mac con Apple Silicon (M1, M2, M3 o M4) con al menos 8 GB de RAM unificada. No requiere GPU dedicada.
- Consumer GPUs: al estar en formato MLX, el despliegue nativo está orientado a Apple Silicon; en GPU NVIDIA sería necesario convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estándar) si existe el modelo original en esos formatos.
- Despliegue: MLX y mlx-lm son las opciones naturales. Otras opciones (llama.cpp, Ollama, vLLM, TGI) no son directamente compatibles con este checkpoint cuantizado con oQ sin conversión previa.
- Latencia y throughput: no disponibles; en un M-series básico, un modelo de 1,7B cuantizado a ~4,8 bits suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-oQ4e | 1,729B | Mixta ~4,8 bits (oQ) | MLX safetensors | no disponible | Base, precision mixta, 1,1 GB |
| LFM2-1.2B (Liquid AI, cuantizado MLX) | 1,2B | tipicamente 4-bit uniforme | MLX / GGUF | Licencia Liquid AI (uso comercial con condiciones) | Version anterior de la familia, mas pequena |
| Qwen3-1.7B (cuantizado MLX 4-bit) | 1,7B | 4-bit uniforme | MLX / GGUF | Apache 2.0 | Versiones base e instruct, ecosistema muy amplio |
| Llama-3.2-1B (cuantizado MLX 4-bit) | 1,24B | 4-bit uniforme | MLX / GGUF | Licencia Llama 3.2 | Transformer convencional, amplio soporte de herramientas |

La ventaja diferencial de este checkpoint es la cuantización de precisión mixta de oQ, que puede preservar más calidad que un esquema uniforme de 4 bits a un coste de almacenamiento similar. Como contrapartida, el ecosistema de herramientas compatible es más reducido que el de GGUF.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: antes de cualquier uso comercial es imprescindible verificar la licencia del modelo original LFM3 de Liquid AI, que puede imponer condiciones propias.
- Modelo base, no instruct: no sigue instrucciones ni mantiene conversaciones de forma fiable; produce continuación de texto. Para uso conversacional se requiere la versión instruida o un fine-tuning.
- Sin benchmarks publicados: la calidad real de la cuantización mixta no está verificada con métricas; puede haber degradación frente al checkpoint original en BF16, especialmente en tareas de razonamiento y código.
- Cuantización de terceros: el checkpoint proviene de un usuario individual (skryptersi) con 0 descargas y 0 likes, sin historial comunitario que avale su corrección; conviene validar los pesos antes de usarlos en producción.
- Datos del modelo original (contexto, idiomas, tokens de entrenamiento) no documentados en la model card, lo que dificulta evaluar su idoneidad para casos concretos.
- Riesgo de alucinación y sesgos: inherente a cualquier modelo de lenguaje; al ser una versión base sin alineación, puede generar contenido ofensivo o incoherente con mayor probabilidad que un modelo instruido.
- Compatibilidad limitada: el formato oQ/MLX restringe el despliegue a entornos Apple Silicon con MLX; no funciona directamente con vLLM, TGI ni llama.cpp.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/skryptersi/LFM3-1.7B-Base-oQ4e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Documentacion de MLX: https://github.com/ml-explore/mlx
- mlx-lm (inferencia de LLMs con MLX): https://github.com/ml-explore/mlx-lm
- Informacion sobre la familia LFM de Liquid AI: no disponible en la informacion proporcionada
