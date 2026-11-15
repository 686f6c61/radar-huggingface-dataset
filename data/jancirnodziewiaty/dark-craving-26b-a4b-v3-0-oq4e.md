# jancirnodziewiaty/Dark-Craving-26B-A4B-v3.0-oQ4e

## Resumen

Dark-Craving-26B-A4B-v3.0-oQ4e es una cuantización mixta del modelo base ReadyArt/Dark-Craving-26B-A4B-v3.0, publicada por el usuario jancirnodziewiaty en Hugging Face. Se trata de un checkpoint orientado a inferencia en Apple Silicon mediante la librería MLX, generado con la herramienta oQ (oMLX v0.8.0rc1) aplicando cuantización de precisión mixta con un promedio efectivo de 5,043 bits por peso. El modelo cuenta con 25.805.936.206 parámetros según los tensores safetensors, y su arquitectura declarada en los tags es "gemma4", lo que sugiere una base de la familia Gemma 4 con mezcla de expertos (el sufijo A4B indica aproximadamente 4 mil millones de parámetros activos).

El interés de esta publicación es fundamentalmente práctico: reduce un modelo de 26B parámetros a un checkpoint de 16,3 GB, lo que permite ejecutarlo en equipos con memoria unificada moderada (Mac con 24-32 GB de RAM) manteniendo buena parte de la calidad del original gracias a la asignación no uniforme de bits según la sensibilidad de cada tensor. La distribución de precisión reserva 8 bits y BF16 para una fracción pequeña pero crítica de los pesos (8,6 % del total), mientras que el grueso (88,5 %) se almacena en 4 bits afines con grupo de 64.

No obstante, la información pública es muy escasa: no hay model card descriptiva, ni datos de entrenamiento, ni benchmarks, ni licencia declarada, ni idiomas soportados. Esta ficha se limita, por tanto, a documentar con rigor lo que puede deducirse de los metadatos y de la propia tabla de cuantización del autor, marcando explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (tag "gemma4"; detalles no disponibles) |
| Parametros totales | 25.805.936.206 (25,806B) |
| Parametros activos | Aproximadamente 4B (inferido del sufijo A4B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, affine 5-bit grupo 64, affine 8-bit grupo 64 y BF16; promedio efectivo 5,043 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 16,3 GB |
| Libreria de inferencia | MLX |
| Modelo base | ReadyArt/Dark-Craving-26B-A4B-v3.0 |
| Herramienta de cuantizacion | oQ (oMLX v0.8.0rc1) |
| Componentes | Lenguaje: 25,236B (14,090 GiB); vision: 0,570B (1,061 GiB) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Los tags indican "gemma4" como familia y el nombre incluye "A4B", convención habitual para señalar un modelo de mezcla de expertos con aproximadamente 4 mil millones de parámetros activos por token sobre un total de 26B. El checkpoint incluye un componente de visión de 0,570B parámetros (1,061 GiB en el archivo cuantizado), lo que confirma que el modelo base es multimodal imagen-texto.

El proceso de cuantización aplicado por oQ asigna precisión de forma no uniforme: el 88,499 % de los pesos lógicos (22,838B) se guarda en affine 4-bit con grupo de 64 (4,50 bits efectivos), el 2,861 % (0,738B) en affine 5-bit (5,50 bits), el 6,389 % (1,649B) en affine 8-bit (8,50 bits) y el 2,252 % (0,581B) se conserva en BF16 (16 bits). Esta estratificación busca preservar en mayor precisión las capas o tensores más sensibles (típicamente embeddings, normas o proyecciones de atención) mientras comprime agresivamente el resto. No hay información sobre los datos de entrenamiento del modelo base, ni sobre si se aplicó RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base (sin evaluación publicada).
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,570B parámetros, por lo que se espera soporte multimodal imagen-texto.
- Capacidad de mezcla de expertos con activación dispersa (aproximadamente 4B parámetros activos), lo que reduce el coste computacional por token frente a un denso de 26B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas en los metadatos.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX de 16,3 GB está pensado para ejecutarse en Macs con memoria unificada de 24 GB o superior mediante `mlx-lm`, permitiendo disponer de un modelo de 26B con activación de 4B en un equipo de sobremesa o portátil de gama alta.
- Prototipado de aplicaciones multimodales: el módulo de visión integrado permite experimentar con descripción de imágenes, extracción de información de capturas o documentos escaneados sin depender de servicios en la nube.
- Evaluación comparativa de cuantizaciones: al ser una cuantización mixta con distribución documentada, sirve para medir la pérdida de calidad frente al modelo base en tareas concretas (perplejidad, seguimiento de instrucciones) y decidir si el ahorro de memoria justifica el uso en producción.
- Desarrollo offline y entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para procesar datos sensibles (textos internos, imágenes médicas o legales) sin salida a Internet.
- Generación asistida en flujos de trabajo de escritorio: integración en herramientas locales de edición de texto o código mediante la API de MLX, aprovechando la ventana de contexto del modelo base (longitud no confirmada).
- Fines de investigación sobre compresión de modelos: la tabla de bits por componente permite estudiar qué capas toleran cuantización a 4 bits y cuáles requieren 8 bits o BF16, útil para diseñar esquemas de cuantización propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No constan métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 16,3 GB solo para los pesos; con overhead de contexto y caché KV, se recomienda un mínimo de 20-24 GB de memoria disponible.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips de Apple (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra). No es directamente compatible con CUDA sin reconversión a otro formato.
- Compatibilidad con GPU de consumo: en el ecosistema Apple, cabe en Mac con 24 GB o más de memoria unificada (M2 Pro 32 GB, M3 Max 36 GB, M4 Pro 24 GB, entre otros). En el ecosistema NVIDIA no hay pesos GGUF publicados en este repo, por lo que no se puede ejecutar directamente en RTX 4090 (24 GB) sin cuantizar de nuevo.
- Opciones de despliegue: `mlx-lm` y `mlx` como librerías nativas; herramientas compatibles con MLX como LM Studio (soporte MLX en versiones recientes) o MLX-Audio/MLX-VLM para el componente visual. vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con este formato sin conversión.
- Latencia y throughput: no disponibles; dependerán del chip concreto y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v3.0-oQ4e | 25,8B | ~4B | no disponible | MLX safetensors (5,043 bits/peso) | no disponible | Cuantización mixta de oQ sobre base Gemma 4 MoE |
| ReadyArt/Dark-Craving-26B-A4B-v3.0 | 25,8B | ~4B | no disponible | safetensors BF16 | no disponible | Modelo base sin cuantizar; requiere ~52 GB en BF16 |
| Gemma 3 27B (referencia de familia) | 27B | denso | 128K (según documentación pública de Google) | safetensors, GGUF | Gemma Terms of Use | Denso, sin mezcla de expertos; más lento por token en hardware limitado |
| Qwen2.5-VL-32B (referencia multimodal) | 32B | denso | 128K (según documentación pública) | safetensors, GGUF | Apache 2.0 | Alternativa multimodal ampliamente soportada en vLLM y llama.cpp |

La comparación con Gemma 3 27B y Qwen2.5-VL-32B es orientativa: son modelos densos de tamaño parecido y con capacidades multimodales, pero no se dispone de evaluaciones del modelo Dark-Craving que permitan contrastar calidad. La ventaja principal de este checkpoint es el tamaño reducido (16,3 GB) y su integración con MLX; la desventaja, la falta de licencia declarada y de soporte en el ecosistema CUDA.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso, por lo que no se puede asumir permiso para uso comercial. Es imprescindible contactar con el autor o consultar el modelo base antes de desplegarlo en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real; probablemente herede el del modelo base, pero no está confirmado.
- Sin benchmarks ni evaluación de calidad: no hay evidencia publicada de que la cuantización a 5,043 bits preserve el rendimiento del original; la degradación en tareas de razonamiento o código puede ser significativa.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala, agravado por la ausencia de datos de alineamiento documentados.
- Sesgos: no documentados; al desconocerse la composición del dataset de entrenamiento del modelo base, no se pueden evaluar sesgos de género, raza o idioma.
- Contexto desconocido: no se especifica la longitud máxima de contexto; usar ventanas largas puede provocar errores o degradación silenciosa.
- Formato restringido: al ser MLX, no es portable a GPUs NVIDIA sin reconversión; la comunidad de herramientas (vLLM, TGI, llama.cpp) no lo soporta de forma nativa.
- Procedencia del nombre "Dark-Craving": sugiere un fine-tuning comunitario no oficial sobre Gemma 4; conviene verificar la cadena de modelos base y el cumplimiento de los términos de uso de Gemma antes de cualquier despliegue.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jancirnodziewiaty/Dark-Craving-26B-A4B-v3.0-oQ4e
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v3.0
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm (inferencia de modelos de lenguaje en MLX): https://github.com/ml-explore/mlx-lm
