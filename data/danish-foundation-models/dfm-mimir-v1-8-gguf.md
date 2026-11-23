# danish-foundation-models/DFM-Mimir-v1.8-GGUF

## Resumen

DFM-Mimir-v1.8-GGUF es la conversión oficial a formato GGUF del modelo DFM-Mimir-v1.8, desarrollado por Danish Foundation Models. Se trata de un modelo de generación de texto de 1.786.775.040 parámetros (aproximadamente 1,8 mil millones) especializado en danés e inglés, con una longitud de contexto entrenada de 4096 tokens. Su relevancia radica en que emplea una arquitectura poco habitual en el ecosistema GGUF: HRM-Text con configuración PrefixLM, lo que lo aleja de los transformers decoder-only convencionales y condiciona tanto su despliegue como su tooling.

El modelo se distribuye en tres precisiones (BF16, Q8_0 y Q4_K_M) generadas directamente desde los pesos BF16 originales, con tokenizador y plantilla de chat embebidos. La conversión ha sido validada tensor a tensor contra los pesos fuente y sometida a pruebas de tokenizador, decodificador y plantilla de chat, aunque el autor advierte explícitamente de que no se han realizado benchmarks de calidad sobre las versiones cuantizadas.

Su interés práctico es doble: por un lado, ofrece un modelo base de tamaño contenido y licencia Apache 2.0 para tareas de generación de texto en danés; por otro, exige un runtime parcheado (llama.cpp con soporte HRM-Text/PrefixLM), por lo que no funciona en llama.cpp estándar, Ollama ni runtimes GGUF arbitrarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRM-Text con configuracion PrefixLM (segun tags y model card) |
| Parametros totales | 1.786.775.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud entrenada) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | danes (da), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no detalla el proceso de entrenamiento; remite a la model card del modelo fuente DFM-Mimir-v1.8 para datos de entrenamiento, evaluación, usos previstos y limitaciones. Lo que sí se especifica es la arquitectura: HRM-Text con configuración PrefixLM, etiquetada también como `prefix-lm` en los tags del repositorio. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO en la información proporcionada.

En cuanto a la conversión, los tres ficheros GGUF se generaron desde BF16 y preservan el tokenizador cargado directamente desde el `tokenizer.json` fuente, la plantilla de chat exacta del modelo original, la configuración PrefixLM y los 256 tokens de byte-fallback. El pre-tokenizador GGUF es `gemma4`. La revisión del modelo fuente es `30485dbad6f3ce50d09eaa963b8a8fce53a4290c` y la del conversor/runtime nativo es `1c979346d78804cf1635a509b3b689a58e5a2546`. Los 259 tensores de la exportación BF16 se compararon de forma independiente y exacta contra los pesos fuente tras el troceado de tensores y la representación de precisión requeridos.

## Capacidades

- Generación de texto conversacional en danés e inglés, con plantilla de chat embebida en cada fichero GGUF.
- Soporte de arquitectura PrefixLM, lo que permite condicionamiento por prefijo además de la generación autoregresiva estándar.
- Tokenizador con 256 tokens de byte-fallback, lo que evita fallos ante caracteres fuera del vocabulario.
- Capacidad multilingüe limitada a danés e inglés según los metadatos del modelo.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Generación de texto en danés para medios y editoriales: el modelo está entrenado específicamente para danés y su contexto de 4096 tokens permite procesar artículos, resúmenes o borradores de extensión media en una sola pasada.
- Asistentes conversacionales en danés: la plantilla de chat embebida y el soporte de byte-fallback facilitan conversaciones multi-turno con caracteres especiales daneses (æ, ø, å) sin degradación del tokenizador.
- Prototipado e investigación sobre arquitecturas PrefixLM: al ser una de las pocas implementaciones GGUF con HRM-Text/PrefixLM, sirve para experimentar con condicionamiento por prefijo en entornos de bajo consumo de memoria.
- Despliegue en CPU y entornos sin GPU: la variante Q4_K_M ocupa 1,17 GB en descarga, lo que permite ejecución en portátiles y servidores modestos usando el runtime parcheado de llama.cpp.
- Traducción y adaptación danés-inglés: el soporte bilingüe permite tareas de reescritura, paráfrasis y adaptación de contenido entre ambos idiomas.
- Filtrado y clasificación de texto en danés: con 1,8 mil millones de parámetros y contexto de 4096 tokens, es viable para tareas de etiquetado y moderación en pipelines de procesamiento por lotes.
- Evaluación comparativa de cuantizaciones: los tres niveles (BF16, Q8_0, Q4_K_M) generados desde la misma fuente permiten estudiar la degradación de calidad en esta arquitectura concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comprobaciones realizadas son acotadas (validación de artefactos) y no benchmarks completos de calidad sobre las cuantizaciones, y que los resultados publicados del modelo fuente no deben tratarse como mediciones de estas versiones GGUF.

Las validaciones documentadas son:

| Prueba | Resultado |
|---|---|
| Comparacion de tensores BF16 contra pesos fuente | 259 tensores, coincidencia exacta |
| Casos de tokenizador/decodificador/plantilla de chat | 724 superados en cada precision |
| Casos de auditoria del tokenizador de entrenamiento | 19 superados en cada precision |
| Generacion corta en danes e ingles (CPU, contexto 1024, 32 tokens de respuesta) | superada en cada precision |

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño de descarga no equivale al uso de memoria en tiempo de ejecución. Como referencia, Q4_K_M descarga 1,17 GB, Q8_0 descarga 1,91 GB y BF16 descarga 3,59 GB; el consumo real en runtime será superior en todos los casos.
- GPU recomendadas: no se especifican en la información disponible. La release fue probada únicamente en CPU sobre Linux; no se realizó cualificación nueva en Metal, CUDA ni móvil.
- Cabe en GPU de consumo: no hay datos de cualificación para GPU de consumo en esta release.
- Opciones de despliegue: exclusivamente el runtime parcheado de llama.cpp con soporte HRM-Text/PrefixLM (rama `1c979346d78804cf1635a509b3b689a58e5a2546` del repositorio de schneiderkamplab) o la aplicación DFM Mimir. llama.cpp estándar, Ollama y runtimes GGUF arbitrarios no están cualificados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada. A continuación se recogen únicamente los datos objetivos disponibles de este modelo frente a referencias genéricas de la misma categoría, sin cifras de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DFM-Mimir-v1.8-GGUF | 1.786.775.040 | 4096 | Apache 2.0 | GGUF | Arquitectura HRM-Text/PrefixLM, requiere runtime parcheado |
| Modelos decoder-only GGUF de ~1,5-2B | no disponible | no disponible | variable | GGUF | Compatibles con llama.cpp estandar, Ollama y vLLM |
| Modelos especializados en lenguas nordicas | no disponible | no disponible | variable | variable | No se dispone de comparativa publicada en la informacion |

## Limitaciones y advertencias

- La arquitectura HRM-Text/PrefixLM no está soportada por llama.cpp estándar, Ollama ni runtimes GGUF arbitrarios; el despliegue requiere el runtime parcheado o la aplicación DFM Mimir.
- La longitud de contexto entrenada es de 4096 tokens; superar ese límite no está respaldado por el entrenamiento.
- Solo se soportan danés e inglés; el rendimiento en otros idiomas no está documentado.
- La release se probó únicamente en CPU sobre Linux; no hay cualificación para Metal, CUDA ni dispositivos móviles.
- Las validaciones publicadas son acotadas (tokenizador, plantilla, generación corta) y no constituyen benchmarks de calidad de las cuantizaciones.
- Los resultados de benchmarks del modelo fuente no deben extrapolarse a estas versiones GGUF.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben consultarse en la model card del modelo fuente.
- Licencia Apache 2.0, heredada del modelo fuente, permite uso comercial con las obligaciones habituales de atribución y aviso de licencia.
- El tamaño de descarga indicado en la model card no equivale al uso de memoria en runtime.

## Enlaces

- Repositorio GGUF: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8-GGUF
- Modelo base: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8
- Runtime parcheado (llama.cpp con HRM-Text/PrefixLM): https://github.com/schneiderkamplab/llama.cpp/tree/1c979346d78804cf1635a509b3b689a58e5a2546
- Validación: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8-GGUF/blob/main/validation.json
- Procedencia: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8-GGUF/blob/main/provenance.json
- Checksums SHA-256: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8-GGUF/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8-GGUF/blob/main/LICENSE
