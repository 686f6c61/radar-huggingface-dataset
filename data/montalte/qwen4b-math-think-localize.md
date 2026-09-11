# Montalte/qwen4b-math-think-localize

## Resumen

qwen4b-math-think-localize es un artefacto de fusión (merge) publicado por el usuario Montalte sobre Qwen/Qwen3-4B-Base. No se trata de un modelo entrenado desde cero ni de un ajuste fino convencional: es el resultado de aplicar el método "localize" (Plan B Localize-and-Stitch) sobre un especialista en matemáticas (`modrill/math-think-q4b-20260908`) derivado del mismo modelo base. El objetivo declarado es servir a experimentos de transferencia direccional matemáticas↔código, por lo que pertenece al ámbito de la investigación sobre fusión de modelos más que al despliegue en producto.

El modelo conserva el tamaño del base: 4.022.468.096 parámetros (unos 4,02 B) en safetensors, con un repositorio de 8,1 GB, licencia Apache 2.0 y arquitectura transformer decoder-only densa, sin mezcla de expertos. La diferencia respecto al base reside en la combinación de pesos resultante de la técnica de stitch, aplicada únicamente al cuerpo de la red: `embed` y `lm_head` quedan excluidos de la máscara.

Su interés es metodológico: permite reproducir y comparar el método localize con otras variantes del mismo autor (random, nothink) bajo una validación source-only de MergeBench, con hiperparámetros documentados (sparsity keep 0,1; 10 epochs; n-shot 64; semilla 42; perfil de máscara plan_b). El autor no publica resultados de benchmarks ni detalles de contexto, cuantización o idiomas, y el modelo acumula cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-4B-Base); sin MoE |
| Parametros totales | 4.022.468.096 (≈4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base Qwen3-4B-Base declara 32.768 tokens nativos (extensibles a 131.072 con YaRN), dato no verificado en este artefacto |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos safetensors (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el autor no lo documenta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Base (commit `906bfd4b4dc7f14ee4320094d8b41684abff8539`) |
| Especialista de origen | modrill/math-think-q4b-20260908 |
| Dominio / modo | math / think |
| Metodo de fusion | localize (Plan B Localize-and-Stitch) |
| Hiperparametros del merge | sparsity (keep) 0,1; lr=1e7; epochs=10; n-shot=64; seed=42; mask-profile=plan_b; embed/lm_head excluidos de la mascara |
| Tamano del repositorio | 8,1 GB |
| Libreria declarada | transformers |
| Fecha de publicacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de Qwen3, sin mezcla de expertos ni componentes de estado (SSM). El artefacto no introduce cambios estructurales, de tokenizador ni de plantilla de chat; lo único que varía respecto a Qwen3-4B-Base es el valor de un subconjunto de pesos del cuerpo de la red, recompuestos mediante la técnica de stitch. Al tratarse de una variante de un modelo `Base`, no hay garantía de plantilla de conversación ni de comportamiento instruct heredado del base.

El "entrenamiento" aquí es el procedimiento de fusión, no una fase de preentrenamiento. Según la model card, se parte de un especialista en matemáticas en modo think y se aplica una localización de máscara con objetivo de mantener una sparsity de 0,1 sobre validación source-only de MergeBench, con 10 epochs, n-shot de 64 ejemplos, semilla 42 y perfil de máscara `plan_b`. Los módulos `embed` y `lm_head` se excluyen de la máscara para limitar el stitch al cuerpo del modelo. No se documentan número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o RLVR asociadas a este merge.

## Capacidades

- Generación de texto autoregresiva con la librería transformers, en el mismo espacio de tokens que Qwen3-4B-Base.
- Razonamiento matemático en modo think: el artefacto se construye a partir de un especialista de matemáticas con trazas de razonamiento, por lo que se espera que genere cadenas de razonamiento antes de la respuesta (el autor no publica evaluación que lo cuantifique).
- Transferencia matemáticas↔código: es el objeto explícito del experimento, no una capacidad validada de producto.
- Tool calling / function calling: no disponible; el autor no lo documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin evaluación publicada.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Visión, audio u otras modalidades: no soportadas (el repositorio solo contiene pesos de texto).
- Modo de pensamiento (thinking): declarado como característica del especialista de origen ("Mode: think").

## Casos de uso

- Reproducción de experimentos de fusión de modelos: el artefacto documenta hiperparámetros completos (sparsity, epochs, n-shot, seed, perfil de máscara), lo que permite replicar el pipeline Plan B Localize-and-Stitch y compararlo con las variantes del mismo autor.
- Ablación del método localize frente a alternativas: comparar este modelo con los artefactos hermanos (`qwen4b-math-think-random`, `qwen4b-math-nothink-random`) para aislar el efecto de la estrategia de selección de pesos.
- Estudio de transferencia entre dominios: analizar si la especialización en matemáticas contamina o mejora tareas de generación de código, que es la hipótesis central del autor.
- Generación de cadenas de razonamiento matemático para construir datasets: usar el modo think para producir trazas paso a paso destinadas a curación y filtrado posterior por un evaluador.
- Asistencia matemática en entornos controlados: resolución de problemas con verificación humana o mediante un comprobador simbólico, dado que no hay benchmarks publicados que respalden su precisión.
- Punto de partida para ajuste fino de dominio: al ser un modelo de 4 B con licencia Apache 2.0, puede servir como inicialización para un fine-tuning posterior en matemáticas o en un par matemáticas-código.
- Despliegue local en hardware de consumo para prototipado: con 4,02 B de parámetros cabe en GPUs de 12-24 GB en precisión reducida, lo que facilita pruebas offline sin coste de API.
- Generación de código asistida en pipelines internos: únicamente como banco de pruebas, ya que no hay evidencia publicada de rendimiento en HumanEval, MBPP ni similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una validación "source-only MergeBench" y unos hiperparámetros concretos, pero no incluye cifras de MMLU, GSM8K, MATH, HumanEval ni de la propia MergeBench, ni comparaciones numéricas con el modelo base o con el especialista de origen.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ≈8,05 GB solo de pesos (4,02 B × 2 bytes), más caché KV y overhead de runtime según longitud de contexto y batch.
- VRAM estimada en INT8: ≈4,0 GB de pesos; en INT4: ≈2,0-2,4 GB de pesos. Estas cifras son estimaciones derivadas del recuento de parámetros, no mediciones publicadas, y requieren convertir los pesos a un formato cuantizado, ya que el repositorio solo distribuye safetensors.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 80 GB y equivalentes sobran para FP16 con lotes grandes.
- GPU de consumo: RTX 4090 / 3090 (24 GB) ejecutan el modelo en BF16 con margen; RTX 3060 12 GB o 4070 12 GB lo admiten en BF16 con contexto corto o en 8 bits con más holgura; tarjetas de 8 GB requieren cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (el repositorio incluye el tag `text-generation-inference`) y, previsiblemente, vLLM para servir en FP16/BF16. llama.cpp y Ollama no son utilizables sin generar previamente un GGUF, que no se publica.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Montalte/qwen4b-math-think-localize | 4,02 B (denso) | No disponible (base: 32.768 nativos segun Qwen) | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Montalte/qwen4b-math-think-random | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Montalte/qwen4b-math-nothink-random | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3-4B-Base | ≈4 B (denso) | 32.768 nativos, 131.072 con YaRN | Publicado por Qwen (no incluido en la informacion disponible) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B (post-entrenado) | ≈4 B (denso) | 32.768 nativos, 131.072 con YaRN | Publicado por Qwen (no incluido en la informacion disponible) | Apache 2.0 | HuggingFace |

Nota: los datos de contexto y parámetros de los modelos Qwen proceden de la documentación pública del modelo base; el autor de este merge no los confirma. Los artefactos `random` y `nothink` solo aparecen referenciados en los resultados de búsqueda, sin ficha técnica detallada disponible.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card lo describe como "merge artifact for directional math↔code transfer experiments", no como un modelo listo para producción.
- Ausencia total de evaluación publicada: no hay cifras de benchmarks, por lo que no puede afirmarse ninguna mejora respecto al base o al especialista de origen.
- Adopción nula: cero descargas y cero likes en el momento del análisis, sin issues ni discusión comunitaria que permita validar su comportamiento.
- Sesgos: no documentados por el autor; al derivar de Qwen3-4B-Base, hereda los sesgos del preentrenamiento de dicho modelo, que tampoco se detallan aquí.
- Riesgo de alucinación: no cuantificado; los modelos especializados en matemáticas en modo think pueden producir cadenas de razonamiento plausibles pero incorrectas, y sin evaluación no hay forma de acotar la tasa de error.
- Limitaciones de contexto e idioma: el autor no especifica ni ventana de contexto efectiva ni idiomas soportados; cualquier uso multilingüe es especulativo.
- La localización con sparsity 0,1 implica modificar solo una fracción de los pesos del cuerpo; es esperable un deterioro de capacidades generales no medidas, pero no hay datos que lo confirmen ni lo descarten.
- Al derivar de un modelo `Base`, puede carecer de plantilla de chat y de alineación conversacional, lo que exige envolver las peticiones con un formato propio.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y atribución; conviene verificar además las condiciones del modelo base y del especialista de origen.
- Los pesos se distribuyen únicamente en safetensors (≈8,1 GB); no hay versiones cuantizadas oficiales, de modo que cualquier despliegue en 4 u 8 bits exige un proceso de conversión y validación propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Montalte/qwen4b-math-think-localize
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Variante hermana (random, think): https://huggingface.co/Montalte/qwen4b-math-think-random
- Variante hermana (random, nothink): https://huggingface.co/Montalte/qwen4b-math-nothink-random
- Especialista de origen: `modrill/math-think-q4b-20260908` (referenciado por el autor; no se proporciona URL directa en la informacion disponible)
- Paper o blog del metodo Localize-and-Stitch / MergeBench: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible
