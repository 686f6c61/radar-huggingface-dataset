# mradermacher/Qwen3.8-27B-3D-Coder-i1-GGUF

## Resumen

Qwen3.8-27B-3D-Coder es un modelo de lenguaje especializado en generación de código para escenas 3D con Three.js, desarrollado por el usuario syaikhipin y cuantizado por mradermacher. El modelo parte de una base Qwen de 27B (26.895.998.464 parámetros reales según los safetensors del repositorio) y ha sido ajustado mediante QLoRA sobre el dataset `ccore/ThreeJS-3D-Scenes`, orientado a la producción de código JavaScript que construye escenas tridimensionales con la librería Three.js.

Esta ficha documenta la variante `i1-GGUF`, una reedición de pesos en formato GGUF con cuantizaciones ponderadas mediante imatrix, generada por mradermacher. El repositorio incluye un espectro amplio de cuantizaciones que va desde IQ1_S (7,2 GB) hasta Q6_K (22,2 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo con aceleradores profesionales. La model card indica además que se trata de un modelo de visión, con ficheros mmproj (si los hay) alojados en el repositorio estático complementario.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un tamaño de 27B (fuera del rango habitual de los modelos de código pequeños), una especialización vertical muy concreta (Three.js y escenas 3D) y una licencia Apache 2.0 que facilita el uso comercial. No obstante, la información pública disponible es escasa: la model card del cuantizador es fundamentalmente mecánica (lista de cuantizaciones y avisos de uso) y no aporta detalles sobre el entrenamiento, los datos o los benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen, sin detalle en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio i1-GGUF); existen cuantizaciones estaticas en el repositorio complementario Qwen3.8-27B-3D-Coder-GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Por el nombre y el tamaño (26,9B parámetros), se trata presumiblemente de un transformer decoder-only de la familia Qwen, pero la model card no confirma ni la variante exacta, ni el número de capas, ni el mecanismo de atención, ni la longitud de contexto nativa. Tampoco se documenta si emplea atención lineal, decodificación especulativa u otras innovaciones.

Respecto al entrenamiento, la información disponible indica que el modelo base `syaikhipin/Qwen3.8-27B-3D-Coder` fue ajustado con QLoRA (tag `qlora`) sobre el dataset `ccore/ThreeJS-3D-Scenes`, un corpus orientado a la generación de escenas 3D con Three.js. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La model card menciona que se trata de un modelo de visión (vision model), aunque no se aportan detalles sobre el encoder visual ni sobre el preprocesado de imágenes.

## Capacidades

- Generación de código JavaScript para escenas 3D con Three.js, incluyendo geometrías, materiales, iluminación, cámaras y animaciones.
- Generación de código general (tag `code-generation`), aunque el ajuste fino está orientado a Three.js.
- Conversación multi-turno (tag `conversational`).
- Capacidad multimodal declarada: la model card indica que es un modelo de visión, con ficheros mmproj en el repositorio estático si existen.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js para prototipado web: el modelo produce código listo para ejecutar que crea escenas 3D interactivas, adecuado para equipos que necesitan maquetas rápidas de visualizaciones 3D en el navegador sin escribir manualmente la configuración de escena, cámara y luces.
- Asistentes de código especializados en gráficos 3D: integrado en un IDE o chat de desarrollo, el modelo puede responder preguntas concretas sobre la API de Three.js (materiales PBR, sombras, post-procesado) gracias a su ajuste sobre el dataset `ccore/ThreeJS-3D-Scenes`.
- Generación de demos educativas de WebGL/Three.js: útil para producir ejemplos didácticos de geometría, transformaciones y animación, con la ventaja de que el modelo está afinado específicamente en ese dominio.
- Automatización de catálogos de productos 3D: generación de código para visores de producto con rotación, zoom e iluminación configurable, desplegable en cuantización Q4_K_M (16,6 GB) sobre una GPU de 24 GB.
- Iteración conversacional sobre código 3D existente: el tag `conversational` permite refinar escenas paso a paso (cambiar materiales, añadir objetos, ajustar la cámara) manteniendo el contexto de la conversación.
- Despliegue en local con llama.cpp u Ollama: al estar en formato GGUF con cuantizaciones desde 7,2 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta, lo que facilita entornos de desarrollo aislados o con requisitos de privacidad.
- Generación de código asistida por imagen (si se confirma la capacidad de visión con los ficheros mmproj): a partir de una captura o referencia visual, producir el código Three.js que reproduce la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el overhead de contexto. Orientativamente: IQ1_S ~7,2 GB, IQ2_M ~10,1 GB, Q3_K_M ~13,4 GB, Q4_K_S ~15,7 GB, Q4_K_M ~16,6 GB, Q5_K_M ~19,3 GB, Q6_K ~22,2 GB.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K conviene una GPU de 24 GB con margen ajustado o una A6000 (48 GB); para despliegues con contexto largo o mayor throughput, A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU de consumo: sí, en cuantizaciones IQ1 a Q4_K_M con GPUs de 8-16 GB (por ejemplo, RTX 3060 12 GB para IQ2/IQ3, RTX 4070 Ti 16 GB para Q4_K_S); las cuantizaciones Q5 y Q6 requieren 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para los pesos originales en transformers, vLLM o TGI si el modelo base los soporta (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-3D-Coder (i1-GGUF) | ~26,9B | no disponible | Three.js / escenas 3D | Apache 2.0 | GGUF (multiples cuantizaciones) |
| Qwen2.5-Coder-32B-Instruct | 32B | 128K (segun documentacion publica del modelo) | Codigo general | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2,4B activos) | 128K (segun documentacion publica) | Codigo general | DeepSeek License | safetensors, GGUF |
| Codestral-22B | 22B | 32K (segun documentacion publica) | Codigo general | MNPL (no comercial) | safetensors, GGUF |

La comparación es aproximada: no se dispone de benchmarks del modelo evaluado, y los datos de los modelos alternativos provienen de su documentación pública, no de la información proporcionada en esta ficha. La principal diferencia del Qwen3.8-27B-3D-Coder es su especialización vertical en Three.js, frente al enfoque generalista de las alternativas.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés (`language: en`), por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Especialización estrecha: el ajuste fino sobre `ccore/ThreeJS-3D-Scenes` puede degradar el rendimiento en tareas de código fuera del dominio Three.js en comparación con el modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir APIs inexistentes de Three.js o código que no compila; se recomienda validación automática en pipelines.
- Datos de entrenamiento y benchmarks no documentados: no se puede evaluar la calidad objetiva ni el sesgo del ajuste fino.
- Capacidad de visión no verificada: la model card menciona que es un modelo de visión, pero no se confirma la disponibilidad de ficheros mmproj ni su funcionamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `syaikhipin/Qwen3.8-27B-3D-Coder` y del dataset `ccore/ThreeJS-3D-Scenes` antes de un despliegue en producción.
- Cuantizaciones de muy baja precisión (IQ1, IQ2): la propia model card advierte de calidad degradada; no se recomiendan para producción.
- Contexto: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o en ficheros de código extensos.
- Repositorio de gran tamaño (300,3 GB): la descarga completa es costosa; conviene descargar solo la cuantización necesaria.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-3D-Coder-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-3D-Coder-GGUF
- Modelo base: https://huggingface.co/syaikhipin/Qwen3.8-27B-3D-Coder
- Dataset de ajuste: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-3D-Coder-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
