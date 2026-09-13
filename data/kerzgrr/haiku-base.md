# kerzgrr/Haiku-base

## Resumen

Haiku-base es el checkpoint base preentrenado de la familia Haiku, desarrollado por el usuario kerzgrr, el mismo autor de la familia Tercet. Se trata de un modelo de decodificador causal de 655.270.488 parámetros desplegables (655.796.824 según el fichero de safetensors) que escala el modelo previo Tercet-base (~502M) y sustituye su vocabulario por un tokenizador BPE propio de 65.536 tokens. Su rasgo diferencial es una arquitectura híbrida que combina capas recurrentes de Kimi Delta Attention (KDA) con capas de atención completa gated MLA, en una proporción de 3 a 1.

El modelo se distribuye únicamente como checkpoint de preentrenamiento: no ha pasado por SFT de instrucciones ni por RLHF/DPO, por lo que su función es la continuación de texto en inglés y la investigación sobre arquitecturas híbridas, no el diálogo ni el seguimiento de instrucciones. El entrenamiento se realizó sobre FineWeb-Edu con 4.404.019.200 tokens vistos y una longitud de secuencia de 2.048, alcanzando una pérdida de validación (EMA) de 3,6904, equivalente a una perplejidad de 40,06.

Su relevancia actual es doble: por un lado, ofrece un punto de partida Apache 2.0 de escala pequeña para fine-tuning y prototipado en hardware de consumo; por otro, sirve como banco de pruebas reproducible para estudiar el comportamiento de capas recurrentes de tiempo lineal combinadas con atención latente al estilo DeepSeek en un modelo de menos de 1.000 millones de parámetros. El repositorio no incluye resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Haiku híbrida: Kimi Delta Attention (KDA) recurrente + gated MLA (NoPE), decodificador causal |
| Parámetros totales | 655.796.824 (safetensors); 655.270.488 desplegables según la model card |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens de entrenamiento; máximo de posiciones 32.768 |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en bfloat16; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16, ~1,22 GiB) |
| Capas | 36 (27 KDA + 9 gated MLA) |
| Tamaño oculto | 1.024 |
| Tamaño intermedio (MLP) | 3.840 |
| Atención | 8 cabezas, Q LoRA rango 512, KV LoRA rango 256 |
| Capas lineales (KDA) | 8 cabezas × 128 dimensiones |
| Vocabulario | 65.536 (BPE propio) |
| RoPE theta | 1.000.000 (factor parcial 0,5; usado por KDA) |
| Precisión de los pesos | bfloat16 (EMA) |
| Librería | `tiny_gdn` |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

Haiku-base emplea un decodificador híbrido de 36 capas con un patrón fijo de repetición `KDA, KDA, KDA, MLA` (proporción 3:1 entre recurrencia y atención completa). Las capas KDA actúan como memoria recurrente de tiempo lineal, implementadas mediante la librería `flash-linear-attention`. Cada cuarta capa es una gated MLA al estilo DeepSeek: KV latente, consulta y clave únicamente de contenido (NoPE) y puerta de salida de rango completo. El bloque MLP usa activación SiTU-GLU, los residuales son de tipo block attention residual, la normalización es RMSNorm centrada en cero y los embeddings de entrada y salida están atados. La atención emplea 8 cabezas con LoRA de rango 512 para Q y 256 para KV, mientras que las capas lineales KDA usan 8 cabezas de 128 dimensiones. El tokenizador es un BPE propio de 65.536 tokens, distinto del vocabulario de 49.000 del modelo Tercet.

El preentrenamiento se realizó con el objetivo de predicción del siguiente token más predicción multi-token (MTP) durante el entrenamiento, que no se utiliza en decodificación. El corpus fue FineWeb-Edu, con 10,13 mil millones de tokens empaquetados para entrenamiento, de los cuales el modelo vio 4.404.019.200 en secuencias de 2.048 tokens. Se usó el optimizador híbrido Muon + AdamW (β₁ = 0,9, β₂ = 0,95), con un LR máximo de 2 × 10⁻⁴, un 1 % de pasos de warmup y recorte de gradiente de 1,0. Los pesos publicados son los de la EMA de potencia de Karras (γ = 1,0, p = 0,75, decaimiento máximo 0,9999), correspondientes al paso de optimizador 8.400. No se aplicó RLHF, DPO ni ningún ajuste por instrucciones.

## Capacidades

- Generación de texto y continuación de secuencias: es su única función declarada, con salida en streaming de tokens mediante `inference.py`.
- Modelo base sin ajuste por instrucciones: no sigue órdenes de forma fiable y puede divagar o fallar en formatos de pregunta-respuesta.
- Tokenizador BPE propio de 65.536 tokens, entrenado específicamente para este modelo.
- Decodificación configurable: temperatura, muestreo por núcleo (top-p), top-k, penalización por repetición y semilla fija para reproducibilidad.
- Soporte de tool calling / function calling: no disponible, no declarado por el autor.
- Soporte de agentes y razonamiento multi-paso: no disponible, no declarado por el autor.
- Capacidades multilingües: no; el modelo declara únicamente inglés.
- Capacidades especiales: no hay modo de razonamiento explícito (thinking), ni visión, ni audio. La predicción multi-token (MTP) solo se usó durante el entrenamiento y no está activa en decodificación.
- Inferencia en GPU CUDA (recomendada) o CPU mediante el flag `--device`.
- Soporte de contexto extendido: no verificado; aunque las posiciones máximas son 32.768, el entrenamiento se hizo con 2.048 tokens.

## Casos de uso

- Continuación de texto en inglés para prototipado: el modelo está diseñado exactamente para esto y permite generar completaciones a partir de un prefijo con un único comando (`python inference.py --prompt "..."`), sin necesidad de plantillas de chat.
- Investigación en arquitecturas híbridas KDA + MLA: al ser un híbrido 3:1 con capas recurrentes de tiempo lineal y atención latente, sirve para reproducir experimentos sobre coste de memoria y comportamiento de la recurrencia en un rango de 655M de parámetros, con los hiperparámetros de entrenamiento documentados.
- Punto de partida para fine-tuning propio: al ser un checkpoint base con licencia Apache 2.0, se puede aplicar SFT o LoRA para dominios concretos (por ejemplo, texto técnico o legal en inglés) sin partir de cero.
- Evaluación de estrategias de decodificación: la CLI expone temperatura, top-p, top-k y penalización por repetición, además de semilla fija, lo que permite comparativas reproducibles de calidad de muestreo entre configuraciones.
- Docencia y divulgación: su tamaño (~1,3 GB en bfloat16) y su implementación autocontenida en `tiny_gdn/` permiten explicar en un aula cómo se estructura un transformer híbrido moderno con atención latente y capas recurrentes.
- Prototipos en hardware limitado: con poco más de 655M de parámetros, el modelo cabe en GPU de consumo e incluso puede ejecutarse en CPU, lo que facilita demos locales sin infraestructura en la nube.
- Generación de datos sintéticos de dominio en inglés: se puede usar para producir texto de continuación que después se filtre y se emplee como material auxiliar en experimentos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card declara una entrada para Haiku-base con la lista de resultados vacía.

La única métrica cuantitativa documentada es la del propio entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de validación (EMA) | 3,6904 |
| Perplejidad de validación (EMA) | 40,06 |
| Tokens vistos | 4.404.019.200 |
| Paso de optimizador del checkpoint | 8.400 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB solo para los pesos en bfloat16; con activaciones y ventana de 2.048 tokens, una estimación razonable es de 2 a 3 GB (estimación derivada del número de parámetros, no publicada por el autor).
- Cuantizaciones inferiores: no hay versiones oficiales. Una conversión teórica a int8 rondaría los 0,7 GB y a int4 los 0,4 GB, pero no existe soporte ni ficheros GGUF publicados, por lo que requeriría trabajo de conversión por parte del usuario.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; por ejemplo, RTX 3060, RTX 4060, RTX 4090. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU consumer modernas, e incluso en equipos con 8 GB de VRAM compartida. El autor recomienda CUDA pero permite `--device cpu`.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI. El único camino documentado es `inference.py` junto con el paquete `tiny_gdn/` incluido en el repositorio y la dependencia `flash-linear-attention`, que el propio script instala en el primer arranque (con parches de importación para Windows cuando son necesarios). Se requiere Git en el `PATH`.
- Latencia y throughput estimados: no disponible. El autor no publica cifras de tokens por segundo ni de latencia.
- Dependencias mínimas: Python 3.10 o superior, PyTorch con CUDA acorde al controlador, y los paquetes `safetensors`, `tokenizers` y `huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haiku-base (kerzgrr) | 655,3M desplegables (655,8M en safetensors) | 2.048 entrenados; 32.768 posiciones máximas | Híbrida KDA + gated MLA, 36 capas, vocab 65.536 | Apache 2.0 | HuggingFace, con `tiny_gdn` e `inference.py` |
| Tercet-base (kerzgrr) | ~502M | no disponible | no disponible (predecesor del que Haiku escala) | no disponible | HuggingFace |
| Otras alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos comparativos de rendimiento ni especificaciones de otros modelos de la misma categoría, por lo que no es posible establecer una comparación cuantitativa más allá del salto de parámetros y de vocabulario respecto a Tercet-base.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde de forma fiable a preguntas ni a formatos de diálogo; puede divagar y producir texto incoherente con la tarea solicitada.
- Riesgo elevado de alucinación: al no haber pasado por RLHF ni DPO, no existe ningún mecanismo de alineación que penalice la invención de hechos.
- Idioma: únicamente inglés. No hay evidencia de competencia en castellano ni en otros idiomas.
- Contexto: el entrenamiento se realizó con 2.048 tokens, aunque las posiciones máximas configuradas sean 32.768. No hay garantía de que el modelo generalice a ventanas más largas de las vistas durante el entrenamiento.
- Escala: con ~655M de parámetros, la model card lo sitúa explícitamente como modelo de investigación y prototipo, no como modelo de producción.
- Ausencia de evidencia de rendimiento: el `model-index` está vacío, no hay benchmarks publicados y el repositorio registra 0 descargas y 1 like en el momento de la consulta. No hay datos que respalden su calidad frente a alternativas.
- Perplejidad de validación alta: 40,06, coherente con un modelo de esta escala entrenado con poco más de 4.400 millones de tokens (menos de la mitad del corpus empaquetado).
- Ecosistema limitado: depende de la librería no estándar `tiny_gdn` y de `flash-linear-attention` con un commit fijado; no hay integración con vLLM, llama.cpp, Ollama ni TGI, lo que complica el despliegue en producción.
- Compatibilidad: la instalación puede requerir parches de importación en Windows, y Git debe estar disponible en el `PATH` para que el script de inferencia instale sus dependencias.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene revisar por separado los términos del dataset FineWeb-Edu empleado en el preentrenamiento.
- Tokenizador propio: al usar un vocabulario de 65.536 tokens distinto del de Tercet (49.000), no hay compatibilidad de embeddings ni reutilización directa de adaptadores entrenados para el modelo anterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerzgrr/Haiku-base
- Demo (Space): https://huggingface.co/spaces/kerzgrr/haiku-demo
- Script de inferencia: https://huggingface.co/kerzgrr/Haiku-base/resolve/main/inference.py
- Modelo predecesor Tercet-base: https://huggingface.co/kerzgrr/Tercet-base
- Dataset de entrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dependencia de capas recurrentes: `flash-linear-attention` (instalada automáticamente por `inference.py`; no se ha facilitado una URL en la información disponible)
- Búsqueda web: la búsqueda realizada no devolvió ningún resultado relevante sobre el modelo. Los enlaces obtenidos correspondían a páginas sobre la configuración de fecha y zona horaria en Windows (support.microsoft.com, les-imprimantes.com, fr.windows.day, help.peacedoorball.blog), sin relación con Haiku-base, por lo que se omiten.
