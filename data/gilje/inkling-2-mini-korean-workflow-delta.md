# gilje/inkling-2-mini-korean-workflow-delta

## Resumen

Inkling 2 Mini Korean Workflow Delta es un adaptador de pesos publicado por el usuario gilje sobre el modelo base `mlx-community/Inkling-2-Mini-oQ4e-mtp`, cuantizado en 4 bits para Apple Silicon. No se trata de un modelo completo, sino de un ajuste de 9.216 pesos en la última capa (capa 23, `mlp_conv`) que mezcla información de las cuatro posiciones recientes por canal. El objetivo declarado es medir cuánto aporta un ajuste fino mínimo frente a la recuperación documental (RAG) en tareas de comprensión de documentos administrativos en coreano.

El trabajo es fundamentalmente un experimento de evaluación: sobre 60 preguntas sintéticas de opción múltiple, el ajuste de pesos eleva los aciertos de 41 a 43 manteniendo la misma configuración de recuperación, mientras que el modelo original sin recuperación acierta 27 y el motor completo con búsqueda, lectura y cálculo acierta 60. El adaptador se distribuye como un delta FP32 de 36.984 bytes que se suma a la capa 23 y se reconvierte a BF16.

Es relevante por su enfoque metodológico: separa el efecto del ajuste de pesos del efecto de la recuperación, publica los artefactos de medición y documenta el pipeline completo (EmbeddingGemma 2 para búsqueda, lector de pasajes y calculadora). Su alcance es limitado: un solo idioma (coreano), un dominio acotado (documentos de trabajo sintéticos) y una arquitectura de ejecución específica para Apple MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer (Inkling 2 Mini); ajuste en capa 23, `mlp_conv` |
| Parametros totales | 9.216 pesos ajustados (delta); total del modelo base no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base en oQ4e (4 bits, MLX); adaptador en FP32 |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`weights/hidden_delta.safetensors`, 36.984 bytes) |

## Arquitectura y entrenamiento

El adaptador modifica únicamente la capa 23 del modelo base: una operación convolucional sobre la MLP (`mlp_conv`) que mezcla, por canal, la información de las cuatro posiciones más recientes de la secuencia. El delta se almacena como tensor de suma en FP32 y el runtime lo añade a los pesos originales, reconvirtiendo el resultado a BF16. No se entrena ningún otro componente del modelo; el resto de pesos permanece congelado.

Los datos de entrenamiento se generaron a partir de 192 avisos administrativos ficticios. Las preguntas se enviaron en dos rondas a DeepSeek V4.1 Flash 1017 ejecutado en Boundless, y se conservaron únicamente las respuestas coincidentes con la respuesta precalculada: 72 y 238 ejemplos respectivamente, para un total de 310. El autor señala que en esos 310 ejemplos el profesor coincidía al 100 % con la etiqueta, por lo que el beneficio adicional atribuible al profesor no es separable en este diseño. Los candidatos se compararon con un conjunto de desarrollo y se fijó el delta correspondiente a la octava actualización, escalado por 0,25; el factor ya está incorporado en el fichero publicado. Se realizaron además un experimento de ampliación y un ajuste adicional para respuesta libre, no incluidos en el adaptador publicado.

## Capacidades

- Comprensión lectora de documentos administrativos en coreano con preguntas de opción múltiple.
- Respuesta a preguntas sobre pasajes proporcionados explícitamente por el usuario.
- Integración con un motor de recuperación que combina embeddings de frase de EmbeddingGemma 2 y coincidencia léxica.
- Enrutamiento condicional: el motor decide si consulta documentos, aplica una regla de cálculo o delega en el modelo local.
- Ajuste dinámico de la intensidad del delta según el vector de la pregunta en modo opción múltiple.
- Respuesta libre con recuperación documental (usando los pesos originales, no el adaptador).
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión ni audio.

## Casos de uso

- Evaluación de la contribución de RAG frente a ajuste fino: el adaptador y los scripts permiten reproducir el experimento de ablación (original, original con recuperación, ajustado con recuperación, motor completo) sobre las 60 preguntas incluidas.
- Procesamiento de avisos y circulares internas en coreano: el motor responde preguntas de opción múltiple sobre pasajes administrativos, con derivación a calculadora cuando la respuesta requiere una operación aritmética.
- Verificación de pipelines de recuperación: al fijar las condiciones de búsqueda y variar solo los pesos, sirve para aislar errores atribuibles al retriever frente a los del generador.
- Prototipado local en Apple Silicon: el stack MLX + oMLX 0.8.3 permite ejecutar todo el flujo en un solo equipo M5 Max con 64 GiB, sin dependencia de servicios externos tras la descarga inicial.
- Investigación sobre ajuste paramétricamente eficiente: el delta de 9.216 pesos es un caso extremo de PEFT para estudiar el impacto de intervenciones mínimas en una capa concreta.
- Docencia y reproducción de resultados: los comandos de descarga y evaluación permiten reejecutar el benchmark publicado y comprobar la instalación de extremo a extremo.
- Respuesta libre asistida por recuperación: para consultas abiertas sobre documentación coreana, usando los pesos originales y el recuperador para localizar el pasaje relevante.

## Benchmarks y rendimiento

| Prueba | Original sin recuperación | Ajustado con recuperación | Original con recuperación | Motor completo |
|---|---|---|---|---|
| Opción múltiple sintética (60) | 27 | 43 | 41 | 60 |
| Variantes de expresión (36) | no disponible | 27 | 25 | no disponible |
| Belebele coreano (24) | 24 | 23 (pesos fijos) | 24 (lector con pesos originales) | no disponible |
| Respuesta libre (18, coincidencia exacta) | no disponible | no disponible | 2 sin recuperación / 11 con recuperación | no disponible |

Desglose del motor completo sobre las 60 preguntas: lector de pasajes 39, calculadora 20, modelo de lenguaje 1.

Latencia media por petición en Apple M5 Max (64 GiB), modelo precargado y excluyendo instalación y arranque: 144,5 ms → 34,3 ms en el conjunto estructurado; 293,4 ms → 469,3 ms en las 36 variantes de expresión. El grupo de comparación con las mismas herramientas y pesos originales promedia 34,0 ms en las 60 preguntas estructuradas.

## Requisitos de hardware

- Entorno de referencia: Apple Silicon (M5 Max, 64 GiB de memoria unificada), Python 3.13, oMLX 0.8.3.
- El modelo base está cuantizado en oQ4e (4 bits) para MLX, lo que reduce la huella de memoria frente a BF16; el tamaño exacto del checkpoint no se especifica en la información disponible.
- No se documenta compatibilidad con CUDA, ROCm ni GPUs NVIDIA (A100, H100, RTX 4090); el stack es específico de MLX.
- Despliegue mediante los scripts incluidos (`scripts/local_engine.py`, `scripts/evaluate.py`) y el cargador `weights/inkling.py` para oMLX.
- Variables de entorno `INKLING_MODEL_DIR` y `EMBEDDING_MODEL_DIR` para reutilizar descargas previas.
- Tras la descarga inicial del checkpoint y del modelo de embeddings, la inferencia y la corrección pueden ejecutarse sin conexión.
- Throughput no publicado; solo se reportan latencias medias por petición en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros ajustados | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gilje/inkling-2-mini-korean-workflow-delta | Adaptador PEFT sobre MLX | 9.216 | no disponible | Apache 2.0 | Hugging Face |
| mlx-community/Inkling-2-Mini-oQ4e-mtp | Modelo base cuantizado | no disponible | no disponible | no disponible | Hugging Face |
| Ajuste de respuesta libre del mismo autor | Adaptador alternativo | no disponible | no disponible | Apache 2.0 | No publicado como adaptador separado |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento entre ellos.

## Limitaciones y advertencias

- El adaptador solo se ha evaluado en coreano y sobre documentos administrativos sintéticos; no hay evidencia de generalización a documentos reales ni a otros dominios.
- El propio autor advierte que no puede determinarse si el rendimiento se mantiene en registros de trabajo reales o en otro hardware.
- El conjunto de evaluación es de 60 preguntas; las diferencias de 2 aciertos (41 frente a 43) están dentro de un margen muy estrecho y no permiten conclusiones robustas.
- En Belebele, el adaptador rinde ligeramente peor que el modelo original (23 frente a 24 sobre 24 preguntas), lo que sugiere un posible sobreajuste al formato sintético.
- El beneficio atribuible al profesor (DeepSeek V4.1 Flash) no es separable del ajuste en este diseño experimental.
- Riesgo de alucinación no cuantificado; el motor mitiga parte del problema derivando a lector y calculadora, pero el modelo de lenguaje solo resuelve 1 de 60 casos en el modo completo.
- El repositorio figura con 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que los artefactos podrían no estar completamente subidos o indexados; conviene verificar la integridad antes de usarlo.
- Dependencia estricta de MLX y Apple Silicon; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- La licencia Apache 2.0 del adaptador no exime de comprobar los términos del modelo base y del modelo de embeddings (EmbeddingGemma 2) para uso comercial.
- El factor de escala 0,25 ya está aplicado en el fichero; aplicar multiplicadores adicionales alteraría el comportamiento respecto al publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gilje/inkling-2-mini-korean-workflow-delta
- Modelo base: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp
- Modelo de embeddings: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Resultados de benchmarks citados en la model card: `results/benchmarks.json` (dentro del repositorio)
- Licencia y alcance de publicación: `RIGHTS.md` (dentro del repositorio)
- Aviso de cambios y atribución: `NOTICE` (dentro del repositorio)
- Cargador para oMLX: `weights/inkling.py` (dentro del repositorio)
