# Chungulus/Ripple-65B-Preview-Q3_K_M-GGUF

## Resumen

Ripple-65B-Preview-Q3_K_M-GGUF es una cuantización comunitaria en formato GGUF del modelo Ripple-65B-Preview, desarrollado originalmente por Ricursive Intelligence. El artefacto lo publica el usuario Chungulus bajo licencia Apache 2.0 y está pensado exclusivamente para inferencia con llama.cpp mediante una implementación experimental del formato Ricursive que, en el momento de la publicación, no está fusionada en la rama principal del proyecto. El modelo base cuenta con 64.782.689.360 parámetros totales en BF16.

El interés de esta ficha es doble. Por un lado, documenta un modelo denso de gran tamano (aproximadamente 65.000 millones de parámetros) en una cuantización de 3 bits que reduce los pesos a 28,89 GiB, lo que lo hace potencialmente desplegable en hardware de gama alta de consumo o en una única GPU profesional. Por otro, evidencia las fricciones prácticas de adoptar arquitecturas no estándar: el runtime necesario es un pull request sin fusionar, y la compatibilidad con herramientas establecidas como Ollama o LM Studio no está demostrada.

La información pública disponible es escasa: no se detallan idiomas soportados, datos de entrenamiento, benchmarks ni arquitectura interna más allá de la etiqueta "ricursive" y el pipeline de generación de texto. Esta ficha refleja fielmente ese nivel de información y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta "ricursive"; transformer denso presumiblemente, sin confirmar) |
| Parametros totales | 64.782.689.360 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 2048`) |
| Tipos de cuantizacion | Q3_K_M (este repositorio); el autor menciona Q8_0 y otros formatos en la misma familia |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos totales 28,89 GiB; repo de 31,0 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base Ripple-65B-Preview. La model card únicamente indica que el modelo original está en BF16, que la implementación necesaria se denomina "Ricursive" y que requiere un port específico en llama.cpp (PR #31692). No se detalla si se trata de un transformer denso convencional, un modelo con atención lineal, una arquitectura híbrida o cualquier otra variante. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

Respecto a la cuantización, el autor documenta un proceso riguroso: cada formato se cuantiza de forma independiente a partir de un GGUF BF16 convertido desde la revisión original `e27e171792f303d74c048184e8259ba663cfa0d5`, sin recuantización, sin dataset de calibración y sin matriz de importancia. Se preservan la plantilla de chat y el token de fin de turno del modelo original. El conversor y el runtime se validaron contra el forward del vendor sobre un fixture aleatorio de diez capas y un recorte de cinco capas de los pesos originales, incluyendo decodificación con caché; se comprobó la forma de cada tensor convertido y hasta cuatro muestras escalares. El autor advierte explícitamente que esta validación no mide la calidad del modelo completo en benchmarks.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la model card muestra un modo `-cnv` con plantilla de chat y token de fin de turno preservados.
- Razonamiento aritmético básico: el artefacto superó comprobaciones deterministas cortas de aritmética según el autor.
- Respuestas factuales: se validaron respuestas factuales cortas en las pruebas de humo.
- Generación con formato JSON: se comprobó la capacidad de producir salida JSON estructurada.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información publicada.

## Casos de uso

- Evaluación de arquitecturas emergentes: el modelo sirve para que investigadores prueben en local una arquitectura "ricursive" antes de que su runtime se estabilice, compilando el PR #31692 y comparando salidas con el modelo BF16 original.
- Generación de texto conversacional en entornos controlados: con la plantilla de chat preservada y el modo `-cnv` de llama.cpp, puede emplearse en prototipos de chatbot de un solo turno o multi-turno corto (el ejemplo usa 2048 tokens de contexto).
- Pruebas de formato estructurado: dado que el autor validó la generación de JSON, puede usarse para experimentar con extracción de datos o salidas parseables en pipelines internos, siempre con validación posterior.
- Investigación sobre cuantización agresiva: al ser una Q3_K_M sin matriz de importancia, es un caso de estudio útil para medir la degradación de un modelo de 65B a 3 bits frente a su versión BF16.
- Despliegue en una única GPU de gran memoria: con 28,89 GiB de pesos, encaja en GPUs de 40-48 GB (A100 40GB, A6000, L40S) dejando margen para caché KV, lo que permite servir el modelo sin infraestructura multi-GPU.
- Reproducción y auditoría de artefactos: el repositorio incluye `validation.json` y `quantizatia-manifest.json` con revisiones de herramientas, digests de shards originales y checksums SHA256, lo que facilita tareas de verificación de cadena de suministro de modelos.
- Docencia y experimentación con llama.cpp: útil para demostrar el flujo de compilación de un PR, descarga de shards y carga de GGUF divididos en un entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las puntuaciones upstream no se reportan como medidas para esta cuantización y que las pruebas realizadas (aritmética corta, respuestas factuales y JSON) son comprobaciones de humo, no evaluaciones de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q3_K_M ocupan 28,89 GiB; hay que sumar la caché KV y buffers del runtime. Con contexto de 2048 tokens, una estimación prudente sitúa el total en torno a 32-36 GB, aunque el autor no publica cifras exactas.
- GPU recomendadas: A100 40GB, A6000 48GB, L40S 48GB o H100 para margen amplio; el ejemplo de la model card usa `-ngl 99` (offload completo).
- GPU de consumo: no cabe en RTX 4090 (24 GB) con offload completo; requeriría offload parcial a CPU/RAM o cuantizaciones menores no publicadas en este repo.
- Opciones de despliegue: exclusivamente llama.cpp compilado desde el PR #31692 en el commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`. No hay compatibilidad establecida con Ollama, LM Studio, vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor menciona que Q8_0 se probó con inferencia en CPU y el resto de formatos con Metal, sin aportar métricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Ripple-65B-Preview Q3_K_M (este) | 64,78 B | No disponible | Q3_K_M (28,89 GiB) | Apache 2.0 | llama.cpp PR #31692 (no fusionado) |
| Llama 3.1 70B Instruct | 70 B | 128k | GGUF Q3_K_M disponible | Llama 3.1 Community | llama.cpp estable, vLLM, Ollama |
| Qwen2.5 72B Instruct | 72 B | 128k | GGUF Q3_K_M disponible | Apache 2.0 | llama.cpp estable, vLLM, Ollama |
| Mistral Large 2 | 123 B | 128k | No disponible en GGUF oficial | Mistral Research/Commercial | vLLM, TGI |

La comparación es orientativa en tamano y licencia; no existen datos de rendimiento publicados para Ripple-65B-Preview que permitan contrastar calidad frente a Llama 3.1 70B o Qwen2.5 72B. La diferencia operativa clave es la madurez del ecosistema: los alternativas funcionan con runtimes estables, mientras que este modelo exige un port experimental.

## Limitaciones y advertencias

- Runtime no estable: requiere un PR sin fusionar de llama.cpp; cualquier actualización del proyecto puede romper la compilación o el formato.
- Sin soporte en herramientas estándar: Ollama, LM Studio, vLLM y TGI no están validados; el despliegue en producción queda condicionado a mantenimiento propio del fork.
- Idiomas no declarados: no se puede asumir calidad multilingüe sin evaluación.
- Contexto no especificado: el ejemplo usa 2048 tokens; no hay datos sobre la ventana máxima real ni sobre degradación en contextos largos.
- Riesgo de alucinación: inherente a modelos generativos; las pruebas de humo del autor no cuantifican este riesgo.
- Sesgos: no hay información publicada sobre sesgos del modelo base ni del proceso de cuantización.
- Degradación por cuantización: Q3_K_M sin matriz de importancia puede degradar tareas sensibles; el autor no reporta comparación de calidad frente a BF16.
- Licencia: Apache 2.0 permite uso comercial, pero el autor aclara que el modelo original y su licencia pertenecen a Ricursive Intelligence; este repositorio es una cuantización comunitaria, no un release oficial.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta; sin validación independiente por terceros.
- Verificación limitada: las comprobaciones cubren formas de tensores y muestras escalares, no la calidad global del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Ripple-65B-Preview-Q3_K_M-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Revisión concreta del modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/tree/e27e171792f303d74c048184e8259ba663cfa0d5
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31692
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
