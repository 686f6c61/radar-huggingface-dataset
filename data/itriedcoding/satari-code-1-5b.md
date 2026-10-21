# itriedcoding/Satari-Code-1.5B

## Resumen

Satari Code 1.5B es un modelo de generación de texto especializado en código, desarrollado por el usuario independiente `itriedcoding`. Se obtiene mediante un ajuste fino supervisado con QLoRA de 4 bits sobre el modelo base Qwen2.5-Coder-1.5B, utilizando el conjunto público `ise-uiuc/Magicoder-OSS-Instruct-75K`. La arquitectura, por tanto, es la del transformer decoder-only de Qwen2.5 (familia Qwen2), con 1.500 millones de parámetros y licencia Apache-2.0 heredada del modelo base.

El interés del proyecto es acotado pero claro: demuestra un pipeline de ajuste fino reproducible en una única GPU de 16 GB (T4 o A10G), con un recetario explícito (rango LoRA 32, alpha 32, dos épocas, batch efectivo 8, learning rate 2e-4 con scheduler coseno) y un cuaderno de entrenamiento público. Es útil como referencia metodológica para quien quiera replicar SFT de bajo coste sobre un coder pequeño, no como un modelo listo para producción.

Advertencia importante: según la propia model card, en el momento de su publicación **los pesos no estaban subidos**; solo se publicaron el pipeline de entrenamiento y la ficha. La model card indica que los ficheros se subirían tras completar el primer ajuste fino en GPU, y menciona un GGUF Q4_K_M en un repositorio aparte, pero también afirma que no se reclaman cifras de benchmark antes de medirlas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con QLoRA |
| Parámetros totales | 1,5 mil millones (modelo base Qwen2.5-Coder-1.5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ajuste fino se realizó con 2.048 tokens |
| Tipos de cuantización | Entrenamiento en 4-bit NF4 con cómputo bf16/fp16; GGUF Q4_K_M anunciado en repositorio aparte |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors vía `transformers` (pesos pendientes de subida según la model card); GGUF para `llama.cpp` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B, un transformer decoder-only con atención causal completa y tokenizador BPE de la familia Qwen2. Sobre él se aplica un ajuste fino supervisado con QLoRA: cuantización 4-bit NF4 de los pesos base con cómputo en bf16/fp16, adaptadores de rango 32 y alpha 32 sobre los módulos `q`, `k`, `v`, `o`, `gate`, `up` y `down`. Se usó pérdida calculada solo sobre la respuesta (*response-only loss*), dos épocas, batch efectivo de 8, learning rate 2e-4 con decaimiento coseno y secuencia máxima de 2.048 tokens, todo ello en una única GPU de 16 GB (T4 o A10G).

Los datos de entrenamiento provienen exclusivamente de `ise-uiuc/Magicoder-OSS-Instruct-75K`, un conjunto público de instrucciones de código generadas a partir de repositorios open source. No se documentan fases de RLHF ni DPO, ni mezcla adicional de datos, ni técnicas de decodificación especulativa o atención lineal. El autor publica el recetario y el cuaderno `Satari_Code_SFT.ipynb` en el repositorio `itriedcoding/Satari-Code-Training` para reproducir el proceso.

## Capacidades

- Generación de código en inglés a partir de instrucciones en lenguaje natural, con formato de chat (`apply_chat_template`) y rol de sistema.
- Generación de pruebas unitarias y ejemplos de uso junto al código, tal como se muestra en el ejemplo de la model card (caché LRU en Python con tests).
- Respuesta a instrucciones de tipo *code instruct* gracias al ajuste sobre Magicoder-OSS-Instruct.
- Formato conversacional multi-turno heredado del modelo base (roles system/user/assistant).
- Capacidades de razonamiento y matemáticas: no documentadas ni evaluadas en la información disponible.
- Soporte de *tool calling* o *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor advierte explícitamente de un rendimiento inferior a modelos de 7B o más en razonamiento de largo alcance.
- Capacidades de visión o audio: no disponibles.
- Multilingüismo: limitado al inglés según la model card.

## Casos de uso

- **Autocompletado y asistencia de código en el editor**: con 1,5B parámetros y cuantización Q4, el modelo puede ejecutarse localmente en una estación de trabajo y ofrecer sugerencias de baja latencia sin enviar código a un servicio externo.
- **Generación de tests unitarios**: el ajuste sobre instrucciones de código favorece la producción de pruebas junto a la implementación, como en el ejemplo de caché LRU de la model card; útil para elevar cobertura en módulos pequeños.
- **Prototipado rápido de scripts y utilidades**: ideal para snippets de Python, shell o utilidades de un solo fichero donde la ventana de 2.048 tokens del ajuste es suficiente.
- **Docstrings y comentarios explicativos**: tareas de transformación de código a documentación en inglés, con prompts cortos y salidas acotadas.
- **Banco de pruebas para investigación en SFT/QLoRA**: el recetario y el cuaderno permiten reproducir el ajuste en una T4 o A10G y usarlo como línea base frente a otras configuraciones de rango, alpha o datasets.
- **Filtrado y clasificación de código en pipelines de CI**: dado su tamaño, se puede desplegar como servicio ligero que revise diffs o genere explicaciones de errores de test, siempre con revisión humana.
- **Generación de código en entornos con requisitos de privacidad**: al ser Apache-2.0 y ejecutable en CPU vía GGUF, encaja en escenarios *on-premise* donde no se permite usar APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclaman cifras antes de medirlas y que se actualizará con resultados y el comando exacto de evaluación cuando existan los pesos. Cualquier número de MMLU, HumanEval, GSM8K o MBPP atribuido a este modelo sería inventado.

## Requisitos de hardware

- **VRAM estimada en fp16/bf16**: aproximadamente 3 GB solo para pesos; con caché KV y activaciones, entre 4 y 6 GB para secuencias cortas.
- **VRAM estimada en 8 bits**: en torno a 1,6-2 GB de pesos.
- **VRAM estimada en 4 bits (NF4 o GGUF Q4_K_M)**: aproximadamente 0,9-1,2 GB de pesos, lo que permite inferencia en GPUs de 4-6 GB.
- **GPU recomendadas**: para el entrenamiento documentado, una T4 o A10G de 16 GB. Para inferencia, cualquier GPU consumer moderna sirve: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB; también A100/H100 si se necesita alto throughput agregado.
- **Cabe en GPU consumer**: sí, holgadamente, incluso en modelos de 6-8 GB con cuantización de 4 bits.
- **Opciones de despliegue**: `transformers` (referencia en la model card), `llama.cpp` mediante el GGUF Q4_K_M anunciado, y potencialmente Ollama o servidores compatibles con la API de OpenAI al estar etiquetado como `endpoints_compatible`; vLLM y TGI son viables en fp16, aunque para 1,5B el beneficio de vLLM es limitado frente a `llama.cpp`.
- **Latencia y throughput**: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| Satari-Code-1.5B | 1,5B | No disponible (SFT a 2.048 tokens) | Apache-2.0 | Pendiente según model card | Ajuste QLoRA sobre Magicoder-OSS-Instruct-75K; sin benchmarks |
| Qwen2.5-Coder-1.5B (base) | 1,5B | No verificado en la información disponible | Apache-2.0 | Pública en HuggingFace | Misma arquitectura; referencia directa y cota inferior de calidad |
| Qwen2.5-Coder-7B | 7B | No verificado en la información disponible | Apache-2.0 (según familia Qwen2.5) | Pública en HuggingFace | Alternativa si se necesita mejor razonamiento de largo alcance; requiere más VRAM |
| StarCoder2-3B | 3B | No verificado en la información disponible | No verificado en la información disponible | Pública | Modelo de código de BigCode; comparación cualitativa pendiente de datos |

La comparación cuantitativa no es posible: el modelo no publica métricas y los datos de contexto y rendimiento de las alternativas no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- **Pesos no publicados en el momento de la ficha**: la model card indica que los ficheros se suben tras el primer ajuste fino en GPU; verifica el repositorio antes de intentar descargarlos. La mención a un GGUF Q4_K_M conviene contrastarla con el contenido real del repositorio.
- **Sin benchmarks**: no hay ninguna medición objetiva de calidad; no asumas que supera al modelo base Qwen2.5-Coder-1.5B.
- **Tamaño reducido**: con 1,5B parámetros el autor advierte de un rendimiento débil en razonamiento de largo alcance y refactorizaciones grandes frente a modelos de 7B o más.
- **Ventana efectiva corta**: el ajuste se hizo con 2.048 tokens; ficheros o contexto largos se truncarán, aunque el modelo base pueda soportar más.
- **Riesgo de código inseguro o sutilmente incorrecto**: la propia model card recomienda revisar toda salida antes de ejecutarla. No apto para generar código que se despliegue sin revisión.
- **Sesgos**: no documentados; el modelo hereda los sesgos de Qwen2.5-Coder-1.5B y de Magicoder-OSS-Instruct-75K, un corpus derivado de repositorios open source con la distribución de lenguajes y estilos que ello implica.
- **Idioma**: prompts principalmente en inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- **Licencia**: Apache-2.0 permite uso comercial, pero al ser un modelo derivado conviene conservar los avisos de licencia del modelo base y revisar las condiciones del dataset de entrenamiento.
- **Madurez del proyecto**: 0 descargas y 0 likes en el momento del registro, autor individual y sin proceso de revisión; trátalo como experimento reproducible, no como artefacto validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itriedcoding/Satari-Code-1.5B
- Repositorio de entrenamiento: https://huggingface.co/itriedcoding/Satari-Code-Training
- Cuaderno de SFT: https://huggingface.co/itriedcoding/Satari-Code-Training/blob/main/Satari_Code_SFT.ipynb
- GGUF Q4_K_M: https://huggingface.co/itriedcoding/Satari-Code-1.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
