# skudzinau/Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw

## Resumen

Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw es una cuantización en formato MLX (4,7 bits por peso, esquema iQ) del modelo jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic, publicada por el usuario skudzinau. Se trata de un derivado de la familia Qwen3.8 Flash Next sometido a un proceso de "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones), lo que da lugar a una variante sin censura orientada a generación de texto e imagen-texto. El modelo conserva la arquitectura MoE del original, con 133.195.562.899 parámetros totales según los safetensors del repositorio, y está empaquetado específicamente para la librería mlx-serve en Apple Silicon.

La relevancia de esta ficha es doble. Por un lado, documenta una de las pocas cuantizaciones MLX publicadas de un modelo de 133B con capacidades multimodales (pipeline image-text-to-text), pensada para ejecutarse en hardware Apple con memoria unificada. Por otro, ilustra el ecosistema de modelos "heretic/abliterated", que renuncian a los mecanismos de rechazo del modelo base y requieren una evaluación de riesgos explícita antes de cualquier uso en producción.

El acceso está restringido en Hugging Face (gated), la licencia declarada es swift-open-license-1.0 (etiquetada como "other") y el repositorio ocupa 107,3 GB. Los idiomas declarados son inglés y chino. No se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiquetas qwen3_8, qwen4_exp); detalles no disponibles |
| Parametros totales | 133.195.562.899 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | iQ MLX a 4,7 bits por peso (4-bit en metadatos) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (etiquetada como "other"); acceso gated |
| Formato de pesos | safetensors en formato MLX (libreria mlx-serve) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), según las etiquetas del repositorio (moe, qwen3_8, qwen4_exp). El pipeline declarado es image-text-to-text, lo que implica un codificador visual acoplado al tronco lingüístico, aunque no se especifica en la información disponible ni el número de parámetros activos por token, ni la ratio de expertos, ni la dimensión de la ventana de contexto. El proceso "heretic" o de abliteración consiste en identificar la dirección de activación asociada a la negativa a responder y proyectarla fuera de los pesos o de las activaciones; no se documenta en la información disponible la metodología exacta aplicada por jeffpeng3 ni el volumen de datos usado en ese proceso.

La cuantización la ha realizado skudzinau con un esquema iQ (importance-matrix quantization) a 4,7 bits por peso, orientado a MLX y a la librería mlx-serve. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text), con salida textual.
- Razonamiento y generación de código heredados del modelo base Qwen3.8, sin datos específicos de rendimiento disponibles.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo "thinking" explícito: no confirmado en la información disponible.
- Comportamiento sin censura: el proceso de abliteración elimina los rechazos del modelo base, de modo que responde a prompts que un modelo alineado declinaría.
- Capacidades de audio: no disponibles.

## Casos de uso

- Generación de corpus para red teaming: el modelo puede producir respuestas a prompts de seguridad ofensiva que un modelo comercial rechazaría, lo que permite construir conjuntos de evaluación para clasificadores de contenido y filtros de seguridad.
- Investigación sobre alineación y abliteración: comparar las respuestas de esta variante con las del modelo base Qwen3.8 Flash Next permite medir qué capacidades y sesgos se alteran al eliminar la dirección de rechazo.
- Descripción de imágenes en local sobre Apple Silicon: el pipeline image-text-to-text y el formato MLX permiten ejecutar tareas de captioning o VQA en un Mac con memoria unificada, sin enviar datos a la nube.
- Asistencia conversacional en inglés y chino: conversaciones multi-turno en ambos idiomas para prototipos internos, con la advertencia de que la ausencia de alineación exige supervisión humana.
- Experimentación con cuantización iQ en MLX: sirve como caso de estudio de cómo se comporta un MoE de 133B cuantizado a 4,7 bits en mlx-serve, midiendo perplejidad y degradación frente al original.
- Generación de texto creativo sin restricciones temáticas: guiones, ficción o material editorial que otros modelos filtran, siempre con revisión editorial posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 107,3 GB, por lo que se necesita un Mac con al menos 128 GB de memoria unificada para cargar los pesos con margen para el contexto y el codificador visual.
- GPU recomendadas: Apple Silicon de gama alta (M2 Ultra, M3 Ultra, M4 Max con 128 GB o más). No es compatible de forma nativa con CUDA; requiere MLX.
- ¿Cabe en GPU de consumo? No en tarjetas convencionales de 24 GB o 48 GB. Solo es viable en equipos Apple con memoria unificada de 128 GB o superior.
- Opciones de despliegue: mlx-serve (librería declarada), MLX de Apple. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw (este) | 133,2B | no disponible | MLX safetensors 4,7 bpw | swift-open-license-1.0, gated | Abliterado, multimodal, solo Apple Silicon |
| jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic | no disponible | no disponible | safetensors | no disponible | Modelo base del que deriva esta cuantización |
| Swift-1.5-Flash-Next-Heretic-ReverseEngineer (GGUF) | no disponible | no disponible | GGUF en 8 partes, 33,1 GB | no disponible | Variante abliterada para llama.cpp, ~3.778 descargas |
| johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-HGN | no disponible | no disponible | no disponible | no disponible | Otra variante de la misma familia Heretic V2 |

## Limitaciones y advertencias

- Modelo abliterado: no aplica los mecanismos de rechazo del modelo base, por lo que puede generar contenido ofensivo, ilegal o peligroso sin filtro. No apto para aplicaciones de cara al usuario sin una capa de moderación externa.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, agravado por la falta de benchmarks publicados.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Licencia swift-open-license-1.0 etiquetada como "other": es imprescindible revisar los términos completos antes de cualquier uso comercial, y el acceso gated implica condiciones adicionales de aceptación.
- Repositorio de 107,3 GB: requiere hardware Apple con memoria unificada alta; no es desplegable en infraestructura CUDA estándar.
- Sin datos sobre parámetros activos, contexto máximo ni metodología de cuantización iQ, lo que dificulta estimar la degradación respecto al modelo original.
- Sesgos heredados del modelo base Qwen3.8 y del corpus de abliteración, no documentados.
- Solo 12 descargas y 2 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/skudzinau/Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw
- Modelo base: https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Variante HGN: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-HGN/tree/main
- GGUF ReverseEngineer: https://local-ai-zone.github.io/models/swift-1-5-flash-next-heretic-reverseengineer.html
- Ficha de la variante ReverseEngineer: https://www.abliteratedmodels.org/swift-1.5-flash-next-heretic-reverseengineer/
