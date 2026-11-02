# hoanganhpham/namigen-lang-detection

## Resumen

NamiGen Language Detection v1 es un modelo ONNX de clasificación de idioma en cinco clases (vietnamita, japonés, coreano, inglés y chino) desarrollado por el usuario hoanganhpham. No es un modelo generativo ni un LLM: se trata de un clasificador de audio que opera sobre características log-mel precalculadas y devuelve una distribución de probabilidad sobre los cinco idiomas del conjunto. Su propósito es identificar el idioma hablado en fragmentos de audio de hasta cuatro segundos.

El modelo está diseñado específicamente para audio mono a 8 kHz y depende de un frontend de servicio propietario del propio autor. El grafo ONNX recibe un tensor `features` de forma `[batch, 1, 80, 398]` (80 bandas mel, 398 frames) junto con un vector `valid_samples` de tipo `int64` que indica el número real de muestras cuando el audio se rellena por la derecha hasta los cuatro segundos. Esto implica que no es un modelo autocontenido: un pipeline de audio genérico no reproducirá el preprocesado esperado.

La relevancia del modelo es limitada y muy específica: encaja en arquitecturas de enrutamiento de audio multilingüe donde ya existe el frontend NamiGen. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB y no se declara licencia. La model card advierte explícitamente de que no se garantiza precisión y de que los umbrales de aplicación deben validarse en el dominio de audio objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal exportada a ONNX; topología interna no detallada (entrada log-mel + BatchNorm poblacional) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 4 segundos (tensor `[batch, 1, 80, 398]`) |
| Tipos de cuantización | no disponible (se distribuye como grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | vi, ja, ko, en, zh |
| Licencia | no disponible |
| Formato de pesos | ONNX (grafo `.onnx` más fichero de normalización y `namigen-lang-detection-v1.sha256`) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red. Lo que sí se explicita es que el grafo contiene buffers de BatchNorm poblacional "corregidos" (population BatchNorm buffers), lo que sugiere que el modelo se entrenó con normalización por lotes y que la exportación a inferencia fija estadísticas poblacionales en lugar de estadísticas de batch. La entrada es un tensor de características log-mel normalizadas de forma `[batch, 1, 80, 398]`, es decir, 80 bandas mel sobre 398 frames, coherente con audio mono a 8 kHz de cuatro segundos.

No se documentan el número de tokens ni la composición del dataset de entrenamiento, ni si hubo ajuste fino con RLHF/DPO (poco probable en un clasificador de este tipo). Tampoco se indica el volumen de horas de audio, la procedencia de las muestras ni el esquema de aumento de datos. El paquete incluye un fichero de normalización y un manifiesto de hashes SHA-256 (`namigen-lang-detection-v1.sha256`) para verificar la integridad del grafo y de los datos de normalización antes del uso, lo que constituye la única salvaguarda técnica documentada.

## Capacidades

- Clasificación de idioma hablado en cinco clases cerradas: vietnamita (`vi`), japonés (`ja`), coreano (`ko`), inglés (`en`) y chino (`zh`).
- Trabaja sobre audio mono a 8 kHz, orientado a telefonía o voz de banda estrecha.
- Acepta lotes (`batch`) y un vector `valid_samples` para gestionar el relleno por la derecha hasta los cuatro segundos.
- Devuelve probabilidades por clase, pensadas para ser filtradas con umbrales definidos por la aplicación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking: es un clasificador discriminativo.
- Capacidad multilingüe limitada a las cinco clases indicadas; no cubre otros idiomas.

## Casos de uso

- Enrutamiento de llamadas en centralita telefónica: clasificar el idioma del hablante en los primeros cuatro segundos de una llamada a 8 kHz para derivarla al agente o al flujo IVR correspondiente en vietnamita, japonés, coreano, inglés o chino.
- Filtrado previo en pipelines de transcripción ASR: descartar o etiquetar segmentos de audio según el idioma detectado antes de enviarlos a un motor de reconocimiento específico, reduciendo coste computacional al evitar modelos multilingües grandes.
- Analítica de contact center: agregar la distribución de idiomas de las llamadas entrantes por franja horaria o campaña, usando las probabilidades del modelo como señal continua y no solo como etiqueta dura.
- Moderación y cumplimiento en plataformas de voz: marcar fragmentos de audio que no corresponden al idioma declarado por el usuario, como paso de verificación en flujos de KYC telefónico.
- Segmentación de corpus para anotación: preetiquetar grandes volúmenes de audio de banda estrecha antes de una revisión humana, siempre que se respete el frontend NamiGen y se validen los umbrales en el dominio concreto.
- Integración en servicios de transcripción con detección de cambio de idioma: usar la salida probabilística como señal auxiliar en sistemas que ya segmentan por turnos, para decidir qué modelo ASR invocar en cada tramo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el paquete no ofrece garantía de precisión y que las probabilidades y umbrales requieren validación en el dominio de audio previsto.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un clasificador pequeño exportado a ONNX (repo de 0.0 GB), es probable que quepa en CPU, pero no se documenta el tamaño del grafo ni el consumo de memoria.
- GPU recomendadas: no disponible. Por la naturaleza del modelo (audio de 4 s, 80 bandas mel), no requiere GPU de datacenter; cualquier GPU consumer serviría si se confirma el tamaño real del grafo.
- ¿Cabe en GPU consumer? No disponible con certeza; el tamaño del repositorio sugiere que sí, pero no se aportan cifras.
- Opciones de despliegue: ONNX Runtime es la vía natural. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de este tipo).
- Latencia y throughput: no disponibles. Dependen del backend ONNX Runtime, del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NamiGen Language Detection v1 | Clasificador ONNX de idioma hablado | vi, ja, ko, en, zh | Log-mel `[batch, 1, 80, 398]`, audio 8 kHz, 4 s | no disponible | HuggingFace (0 descargas) |
| Whisper (detección de idioma integrada) | Modelo ASR con cabeza de detección de idioma | ~99 idiomas | Audio 16 kHz, ventana de 30 s | MIT (versiones abiertas de OpenAI) | Ampliamente disponible |
| SpeechBrain VoxLingua107 | Clasificador de idioma hablado | 107 idiomas | Audio 16 kHz | Apache 2.0 | HuggingFace |
| MMS-LID (Meta) | Clasificador de idioma hablado | 126 idiomas | Audio 16 kHz | CC-BY-NC 4.0 | HuggingFace |

La comparación es aproximada: NamiGen opera a 8 kHz con un frontend propio y solo cinco clases, mientras que las alternativas cubren decenas o centenares de idiomas a 16 kHz con licencias documentadas. No se dispone de métricas de precisión de NamiGen para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Dependencia estricta del frontend NamiGen: un pipeline de audio genérico no reproducirá el preprocesado esperado; hay que usar la implementación de servicio y el fichero de normalización adjuntos.
- Solo audio mono a 8 kHz; audio a 16 kHz o estéreo requerirá remuestreo y downmix, con posible degradación.
- Ventana fija de cuatro segundos con gestión explícita de `valid_samples`; no se documenta comportamiento con audios más largos.
- Cinco clases cerradas: cualquier otro idioma se forzará a una de las cinco etiquetas, generando falsos positivos.
- Sin garantía de precisión declarada por el autor; los umbrales de decisión deben calibrarse sobre el dominio de audio real.
- Licencia no disponible: no se puede asumir uso comercial sin contactar con el autor.
- Repositorio sin descargas ni likes y con tamaño de 0.0 GB reportado: conviene verificar la integridad de los ficheros con `namigen-lang-detection-v1.sha256` antes de cualquier despliegue.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en audio ruidoso o con cambio de idioma dentro de la ventana.
- No se documentan sesgos por acento, edad o género; en un clasificador de idioma estos sesgos suelen ser relevantes y deberían evaluarse antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoanganhpham/namigen-lang-detection
- Fichero de verificación de integridad: `namigen-lang-detection-v1.sha256` (incluido en el repositorio del modelo)
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
