# AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP8-MTP es un checkpoint cuantizado en formato MLX, publicado por AutomatosX, derivado del modelo base `mlx-community/Qwen3.5-0.8B-decision`. Se trata de una conversión directa desde los pesos BF16 originales aplicando el esquema propietario AXQuant (AXQ) en precisión mixta, orientado específicamente a ejecución sobre Apple Silicon mediante MLX-LM. El modelo conserva la torre de visión y la cabeza de predicción multi-token (MTP) en BF16, mientras que la ruta de lenguaje se cuantiza en 8 bits afines con grupos de tamaño 32.

La particularidad principal del checkpoint es que no es un modelo conversacional: la model card lo describe explícitamente como un *decision model* que puntúa una cabeza de esquema conjunta (`joint_head.safetensors`). El backbone de lenguaje genera texto, pero la salida real del modelo es la puntuación del esquema conjunto, por lo que `mlx_lm.generate` no produce la salida esperada del modelo. Incorpora además un LoRA de rango 16 (escala 1.0) fusionado en los pesos BF16 antes de la cuantización, aunque el fichero del adaptador no se distribuye en este paquete.

El interés de esta ficha radica en que documenta una instantánea de desarrollo de una familia de cuantización propietaria para hardware Apple, no un release certificado. El autor indica que el paquete incluye registros de conversión e integridad de artefactos, pero no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni aceleración MTP. La etiqueta AXQ debe interpretarse como clase de producto de presupuesto de almacenamiento, no como una afirmación de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`Qwen3_5ForConditionalGeneration`), ruta de texto optimizada; incluye torre de visión y cabeza MTP |
| Parametros totales | 752.393.024 (dato real de safetensors); 852,99 M parámetros lógicos según model card |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; límite práctico dependiente de memoria unificada |
| Tipos de cuantizacion | AXQuant 2.1.0, precisión mixta: 8-bit affine (86,08 % de pesos), BF16 (13,92 %); grupos de tamaño 32; clase base 16p0bpw; BPW medido 9,1693 (principal) y 9,3292 (total con MTP) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no contiene pesos PyTorch ni GGUF); tamaño 1,02 GB, descarga completa ≈1,05 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con 852,99 M parámetros lógicos y una ruta de texto optimizada. La arquitectura incorpora tres componentes diferenciados: el backbone de lenguaje, una torre de visión y una cabeza de predicción multi-token (MTP). No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación técnica de este checkpoint es el pipeline de cuantización AXQuant 2.1.0. Los pesos de atención y MLP del lenguaje se cuantizan en 8 bits afines, las embeddings de tokens también en 8 bits afines, y la torre de visión, la cabeza MTP y las normalizaciones se mantienen en BF16. La cabeza de esquema conjunta (`joint_head.safetensors`) se copia sin modificar desde el BF16 original, junto con `joint_head_config.json` y `decision_config.json`. El LoRA de rango 16 (escala 1.0) se fusionó en los pesos BF16 del lenguaje antes de cuantizar. La conversión se realizó con MLX 0.32.1 y MLX-LM 0.31.3. No se ha medido la aceleración MTP ni la velocidad de kernels.

## Capacidades

- Puntuación de esquema conjunto (*decision model*): la salida real del checkpoint es la puntuación de `joint_head.safetensors`, no texto generado.
- Generación de texto a través del backbone, aunque la model card advierte que `mlx_lm.generate` produce texto que no constituye la salida del modelo.
- Procesamiento de visión: torre de visión preservada en BF16 (153 tensores, 100,5 M parámetros según la model card).
- Predicción multi-token (MTP): cabeza MTP de 15 tensores y 20,45 M parámetros en BF16, empaquetada como sidecar `mtp.safetensors`.
- Aceleración MTP mediante runtimes sidecar-aware: oMLX 0.6.3rc2 o superior (importación del sidecar y modo Lightning MTP) y MTPLX con perfil `stable` y profundidad 1.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible como capacidad documentada.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no (la model card indica `Audio present: False`).

## Casos de uso

- Puntuación de decisiones estructuradas: el checkpoint está diseñado para evaluar un esquema conjunto y producir una puntuación, por lo que encaja en pipelines donde la decisión se modela como clasificación o ranking sobre un esquema predefinido, no como generación libre de texto.
- Enrutamiento y selección en sistemas de decisión: al ser un modelo de 0,8 B con contexto configurado de 262.144 tokens, puede emplearse para puntuar opciones o candidatos en un esquema conjunto dentro de un sistema mayor, siempre que se valide la calidad con evidencia propia, dado que el autor no publica métricas.
- Prototipado en Apple Silicon: al estar en formato MLX con cuantización 8-bit affine, es adecuado para experimentación local en Mac con memoria unificada, con una descarga de aproximadamente 1,05 GB y ejecución mediante MLX-LM.
- Evaluación de la familia AXQuant: útil para equipos que quieran comparar el hermano MXFP4 frente a este MXFP8 en la misma política de roles AXQ, manteniendo visión, MTP y normalizaciones en BF16.
- Investigación sobre decodificación especulativa con MTP: la cabeza MTP empaquetada permite probar aceleración multi-token con MTPLX (`mtplx quickstart --model ./AX-... --profile stable --depth 1 --reasoning off`) u oMLX, aunque la velocidad no está medida por el autor.
- Integración multimodal experimental: la torre de visión en BF16 permite explorar tareas que combinen entrada visual y puntuación de esquema, con la cautela de que no hay evidencia publicada de calidad en esta ruta.
- Reproducibilidad de despliegues: el paquete registra la revisión de origen `36e166ca10c4d16471a231d66cfc22d80039fe34` y las versiones de MLX y MLX-LM, lo que facilita fijar commits en entornos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad MTP, y que no repite las puntuaciones de decisión OptiQ del modelo upstream.

## Requisitos de hardware

- VRAM/memoria estimada: al ser un checkpoint MLX para Apple Silicon, el requisito se mide en memoria unificada. El peso de safetensors es de 1,02 GB y la descarga completa de aproximadamente 1,05 GB; se recomienda reservar al menos 1,05 GB de disco libre.
- GPU recomendadas: no aplica en el sentido CUDA; el runtime primario es MLX-LM sobre Apple Silicon. El autor no documenta modelos concretos de chip Apple recomendados.
- Cabe en GPU consumer: sí en el ecosistema Apple Silicon por tamaño, aunque no se especifican chips mínimos. Para GPU NVIDIA no hay ruta documentada, ya que el repositorio no contiene pesos PyTorch ni GGUF.
- Opciones de despliegue: MLX-LM como runtime primario; oMLX 0.6.3rc2 o superior para importar el sidecar MTP y activar Lightning MTP; MTPLX para consumir el sidecar directamente. AX Engine no está establecido: no se incluye un `model-manifest.json` nativo validado, y los campos de AX Engine en `axquant_runtime.json` describen el contrato de compatibilidad previsto, no evidencia observada.
- Latencia y throughput: no disponibles. La aceleración MTP no fue medida y no hay evidencia de velocidad de kernels publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP8-MTP | 752,39 M (safetensors); 852,99 M lógicos | 262.144 tokens configurados | MLX Safetensors, MLX-LM | Apache 2.0 | 8-bit affine + BF16 en visión, MTP y norms; BPW total 9,3292; decision model con joint head |
| AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP | no disponible en la información | no disponible | MLX Safetensors | Apache 2.0 (según hermano) | Misma política de roles AXQ en el otro formato de bloque MLX; visión, MTP y norms en BF16; LoRA fusionado primero |
| mlx-community/Qwen3.5-0.8B-decision | no disponible en la información | no disponible | MLX (BF16 de origen) | no disponible en la información | Modelo base BF16 del que deriva este checkpoint (revisión `36e166ca...`) |

## Limitaciones y advertencias

- No es un modelo conversacional: la model card advierte que `mlx_lm.generate` carga el backbone y produce texto que no es la salida del modelo; la salida real es la puntuación del esquema conjunto.
- Evidencia de desarrollo, no release certificado: no hay métricas publicadas de calidad, contexto largo, velocidad de kernels ni aceleración MTP. La etiqueta AXQ no debe interpretarse como afirmación de benchmark.
- Sin evidencia de ejecución en AX Engine: no se incluye `model-manifest.json` nativo validado; los campos de AX Engine en `axquant_runtime.json` son contrato previsto, no runtime observado.
- MTP requiere runtime sidecar-aware: MLX-LM estándar no carga `mtp.safetensors` por sí solo; es necesario oMLX 0.6.3rc2 o superior (importación del sidecar) o MTPLX.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no evaluado en esta información; al no haber benchmarks de calidad, no hay base para estimarlo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes derivados (LoRA fusionado, joint head) antes de producción.
- El adaptador LoRA no se distribuye en el paquete: solo está fusionado en los pesos BF16 previos a la cuantización, lo que limita la reproducibilidad exacta del proceso.
- Contexto configurado de 262.144 tokens sujeto a límites prácticos de memoria unificada; no hay evidencia medida de comportamiento en contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-0.8B-decision/tree/36e166ca10c4d16471a231d66cfc22d80039fe34
- Hermano MXFP4: https://huggingface.co/AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
