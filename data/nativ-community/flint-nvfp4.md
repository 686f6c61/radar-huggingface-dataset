# nativ-community/flint-nvfp4

## Resumen

Flint NVFP4 es una conversión cuantizada en formato NVFP4 (punto flotante de 4 bits) del modelo RecursiveSI/flint, publicada por la comunidad nativ-community en Hugging Face. Se trata de una versión optimizada para ejecutarse en hardware Apple Silicon mediante el framework MLX, lo que permite cargar un modelo de aproximadamente 39.800 millones de parámetros en equipos Mac con una huella de memoria considerablemente reducida respecto a los pesos en BF16.

El modelo base, RecursiveSI/flint, es un modelo de generación de texto conversacional con arquitectura de mezcla de expertos (MoE), con 47 routers MoE, plantilla de chat nativa con modo de razonamiento (thinking) y una ventana combinada de prompt y salida de 262.144 tokens. La conversión conserva byte a byte el tokenizador, la plantilla de chat, la configuración de generación y la licencia Apache-2.0 del modelo original.

Su relevancia radica en la utilización del formato NVFP4 con escalas globales explícitas en FP32 por capa, una técnica que evita el desbordamiento de los escalas de bloque pequeñas y que, según el autor, corrige los fallos de la conversión NVFP4 estándar. Es una opción interesante para desarrolladores que trabajan en el ecosistema MLX y necesitan modelos grandes cuantizados de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (47 routers MoE), no disponible detalle completo |
| Parametros totales | 39.785.299.488 (≈39,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana combinada prompt/salida, según configuración del modelo base) |
| Tipos de cuantizacion | NVFP4 (grupo 16) en pesos lineales; 8-bit affine (grupo 64) en routers MoE y embeddings; BF16 en normalizaciones, attention sinks y parámetros no cuantizados; escalas globales FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base, RecursiveSI/flint, emplea una arquitectura transformer con mezcla de expertos (MoE), como evidencian los 47 routers MoE presentes en el checkpoint. En esta conversión, cada router se cuantiza con precisión de 8 bits affine y grupo 64, preservando la precisión específica del router que es crítica para la calidad del enrutado en modelos MoE. Los parámetros de normalización, los attention sinks y otros parámetros no cuantizados permanecen en BF16, y las proyecciones de cada experto llevan una escala global FP32 independiente (calculada como absmax/2688).

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ya que la model card de esta conversión remite a la ficha del modelo original sin detallar esos datos. La innovación técnica destacable de esta publicación es el esquema de cuantización NVFP4 con escalas: la conversión NVFP4 sin escalas no superó las verificaciones básicas (smoke checks) y no se publicó, por lo que se añadieron escalas globales FP32 explícitas por capa lineal para evitar el subdesbordamiento (underflow) de las escalas de bloque pequeñas. La conversión se realizó con MLX-VLM 0.7.10 (commit 6d9ba328) y MLX 0.32.4.

## Capacidades

- Generación de texto conversacional según la pipeline text-generation del modelo base.
- Modo de razonamiento (thinking) controlado por la plantilla de chat original; no se incluye mecanismo para desactivarlo en esta conversión.
- Ventana de contexto combinada de 262.144 tokens (prompt más salida), heredada de la configuración del modelo base.
- Generación de código: los smoke checks incluyen la generación de una función en Python validada por parsing AST (sin ejecución).
- Recuperación de información en contexto corto y aritmética básica verificadas en las pruebas de validación.
- Posibles capacidades multimodales: el uso de la librería mlx-vlm sugiere compatibilidad con visión, pero no está confirmado en la documentación disponible.
- No hay información publicada sobre tool calling, function calling ni capacidades de agentes.

## Casos de uso

- Experimentación con modelos MoE grandes en Apple Silicon: la cuantización NVFP4 reduce la huella de memoria de ~39,8 B de parámetros, haciendo viable su ejecución en Macs con memoria unificada amplia (por ejemplo, Mac Studio o MacBook Pro con 64 GB o más).
- Prototipado de asistentes conversacionales con razonamiento: el modo thinking nativo permite tareas que se benefician de cadenas de razonamiento previas a la respuesta final.
- Generación de código en entornos locales: puede emplearse para redactar funciones y utilidades (como la fusión de intervalos solapados del ejemplo de la model card) sin depender de servicios en la nube.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite trabajar con textos extensos, aunque la calidad en contexto largo no ha sido validada en esta conversión.
- Investigación en cuantización de bajo bit: el repositorio incluye el script de conversión, el registro conversion.json con opciones y overrides por módulo, y los hashes SHA-256, lo que lo hace útil como referencia para estudiar conversiones NVFP4 con escalas.
- Integración en pipelines locales con MLX-VLM: la invocación mediante `mlx_vlm.generate` facilita su uso en scripts y aplicaciones sobre hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los pesos convertidos no han sido evaluados en la suite de benchmarks publicada del modelo original, y que las pruebas realizadas son smoke checks de validación (recarga estricta del checkpoint, logits finos en prefill/decode, comprobaciones de cache-position, aritmética, recuperación corta y generación de una función Python validada por AST), no una evaluación de calidad ni una prueba de equivalencia con BF16 o Transformers.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 22,6 GB en formato NVFP4; en un Mac con memoria unificada se recomienda disponer de al menos 32 GB de RAM para la inferencia con margen para el KV cache (no disponible una cifra oficial exacta).
- GPU recomendadas: no disponible información específica; la validación se realizó sobre Apple M5 Max con MLX 0.32.4, por lo que Apple Silicon reciente es la plataforma de referencia.
- Consumer GPU: al tratarse de pesos en formato MLX, no es compatible directamente con GPU NVIDIA/AMD; está pensado para Apple Silicon (M1 o posterior, idealmente con 32 GB de memoria unificada o más).
- Despliegue: mediante MLX-VLM (commit 6d9ba328, versión 0.7.10) y MLX 0.32.4, con el comando `mlx_vlm.generate`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con estos pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| nativ-community/flint-nvfp4 | ≈39,8 B (total) | MoE (47 routers) | 262.144 tokens | NVFP4 + 8-bit affine (routers/embeddings) | Apache-2.0 |
| RecursiveSI/flint (base) | no disponible | MoE | 262.144 tokens | BF16 (sin cuantizar) | Apache-2.0 |
| Alternativas MoE de tamaño similar (p. ej. Qwen3-30B-A3B, Mixtral 8x7B) | no disponible para comparación directa | MoE | variable | variable | variable |

No se dispone de datos de rendimiento que permitan una comparativa cuantitativa con modelos similares; la comparación se limita a las características estructurales disponibles.

## Limitaciones y advertencias

- La calidad del modelo cuantizado no ha sido evaluada frente a BF16 o a la implementación de Transformers; la cuantización puede alterar las respuestas del modelo, y los formatos de punto flotante de 4 bits pueden diferir en calidad de la cuantización affine.
- Los smoke checks de validación no validan la calidad en contexto largo, pese a que la configuración admite 262.144 tokens combinados.
- El modo thinking está activo según la plantilla original y no existe mecanismo incluido para desactivarlo; el razonamiento consume el presupuesto de tokens de salida, por lo que conviene usar presupuestos amplios en tareas complejas.
- Los valores de generación por defecto son temperature 1.0, top-p 0.95 y top-k 20, heredados del modelo base.
- No hay información publicada sobre sesgos conocidos, tasas de alucinación ni idiomas soportados; debe consultarse la model card del modelo base RecursiveSI/flint.
- No hay soporte documentado para frameworks de inferencia distintos de MLX/MLX-VLM, lo que limita el despliegue a hardware Apple.
- La conversión requiere versiones concretas (MLX 0.32.4 y el commit pinned de MLX-VLM) para reproducir los resultados publicados.
- La licencia Apache-2.0 no impone restricciones al uso comercial, pero las condiciones del modelo base deben revisarse en su ficha original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/flint-nvfp4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Revisión del modelo base usada en la conversión: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- MLX-VLM (commit usado): https://github.com/Blaizzy/mlx-vlm/commit/6d9ba328abbd6129c7461eda86280aa9fbfd9986
- Script de conversión: https://huggingface.co/nativ-community/flint-nvfp4/blob/main/convert_nvfp4.py
- Registro de conversión: https://huggingface.co/nativ-community/flint-nvfp4/blob/main/conversion.json
- Validación: https://huggingface.co/nativ-community/flint-nvfp4/blob/main/validation.json
- Sumas de verificación: https://huggingface.co/nativ-community/flint-nvfp4/blob/main/SHA256SUMS
