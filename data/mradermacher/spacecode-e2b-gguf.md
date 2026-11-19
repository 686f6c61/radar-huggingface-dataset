# mradermacher/SpaceCode-E2B-GGUF

## Resumen

SpaceCode-E2B-GGUF es la versión cuantizada en formato GGUF del modelo SpaceCode-E2B, desarrollado originalmente por SpaceGhost y distribuido en cuantizaciones estáticas por mradermacher. Se trata de un modelo multimodal especializado en ingeniería de software, con capacidades de visión y código, construido sobre la arquitectura Gemma 4 (etiquetada como "gemma4" en la model card) y afinado con la librería Unsloth. El modelo está orientado a tareas de desarrollo de software en dominios concretos como React Native, Android, TypeScript y Python.

El modelo cuenta con 4.647.450.147 parámetros totales según los pesos en safetensors del modelo base, y se distribuye bajo los términos de uso de Gemma de Google. Los idiomas declarados en la model card son portugués e inglés, lo que limita su uso en castellano sin una evaluación previa. Esta ficha describe la variante GGUF, pensada para inferencia local con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de código en hardware de consumo gracias a las cuantizaciones de 3 a 5 GB, aunque con las limitaciones propias de un modelo pequeño y de un conjunto de idiomas restringido. No se dispone de información sobre el contexto máximo ni sobre resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma 4 (etiqueta "gemma4" en la model card); detalles de atención no disponibles |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | portugués (pt), inglés (en) |
| Licencia | gemma-terms-of-use (license: other) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo como perteneciente a la familia Gemma 4 y lo etiqueta como multimodal con soporte de visión, código y conversación. El modelo base SpaceCode-E2B fue afinado con Unsloth, según las etiquetas del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta variante es la disponibilidad de cuantizaciones estáticas generadas con un flujo de conversión HF a GGUF, junto con los ficheros mmproj necesarios para el procesamiento de imágenes. También existe una variante con cuantizaciones ponderadas/imatrix en el repositorio SpaceCode-E2B-i1-GGUF del mismo autor. No se dispone de detalles sobre mecanismos de atención, decodificación especulativa u otras optimizaciones internas.

## Capacidades

- Generación de código en dominios específicos: React Native, Android, TypeScript y Python, según las etiquetas del modelo.
- Comprensión de imágenes gracias al componente multimodal (ficheros mmproj), orientada a capturas de pantalla, diagramas de interfaz o referencias visuales de software.
- Conversación multi-turno (etiqueta "conversational").
- Razonamiento y asistencia en tareas de ingeniería de software.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a portugués e inglés.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente de código para React Native: el modelo puede generar y revisar componentes, hooks y estilos en TypeScript para aplicaciones móviles, aprovechando su especialización declarada en este framework y su tamaño reducido para ejecución local.
- Revisión de código Python en entornos de desarrollo: útil para explicar fragmentos, sugerir refactorizaciones y detectar errores comunes en scripts y módulos, con la ventaja de poder desplegarse en la máquina del desarrollador sin enviar código a servicios externos.
- Desarrollo de aplicaciones Android: generación de código Java/Kotlin y de configuraciones de proyecto, así como resolución de dudas sobre APIs del SDK, dentro del dominio declarado del modelo.
- Análisis de capturas de pantalla de interfaces: gracias al componente multimodal, el modelo puede interpretar imágenes de pantallas de aplicaciones y proponer cambios de maquetación o identificar elementos de la UI.
- Documentación técnica automatizada: generación de comentarios, docstrings y READMEs a partir de código fuente, en inglés o portugués, para proyectos de software.
- Prototipado rápido en local: al caber en cuantizaciones de 3 a 5 GB, permite experimentar con un asistente de código multimodal en portátiles con GPU de consumo, sin depender de la nube.
- Soporte a equipos lusófonos: atención a desarrolladores que trabajan en portugués, uno de los dos idiomas declarados del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB con Q2_K, 3,5 GB con Q4_K_M, 3,9 GB con Q6_K y 5,1 GB con Q8_0; el f16 requiere unos 9,4 GB. Añadir entre 0,7 y 1,1 GB si se usa el componente multimodal (mmproj).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 con margen para el contexto; RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para f16 se recomienda una GPU de 12 GB o más.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4_K_M o Q5_K_M; las cuantizaciones Q2/Q3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; el modelo base es compatible con transformers. El repositorio incluye la etiqueta "endpoints_compatible".
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada. La comparación se limita a características estructurales conocidas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SpaceCode-E2B-GGUF | 4,65 B | no disponible | pt, en | gemma-terms-of-use | GGUF |
| Modelos comparables de código de ~4-7 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la documentación alternativas concretas de la misma categoría con datos verificables, por lo que no se ofrece una comparación cuantitativa.

## Limitaciones y advertencias

- Idiomas limitados a portugués e inglés: el rendimiento en castellano no está garantizado y debería evaluarse antes de usarlo en producción.
- Modelo pequeño (4,65 B de parámetros): mayor riesgo de alucinación en tareas de código complejas, APIs poco documentadas o razonamiento matemático avanzado.
- La licencia gemma-terms-of-use impone restricciones específicas de uso comercial y de redistribución; es necesario revisar los términos de Google antes de desplegarlo en productos.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar tareas que requieran ventanas amplias (por ejemplo, análisis de repositorios completos).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_M) degradan la calidad; se recomienda Q4_K_M o superior para uso real.
- El componente multimodal requiere cargar los ficheros mmproj por separado; sin ellos, el modelo funciona solo como modelo de texto.
- No hay datos publicados de benchmarks ni de evaluación de sesgos, por lo que la calidad en dominios concretos debe validarse empíricamente.
- El repositorio tiene 0 likes y fue creado recientemente según los metadatos; la madurez y el mantenimiento del modelo no están contrastados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SpaceCode-E2B-GGUF
- Modelo base: https://huggingface.co/SpaceGhost/SpaceCode-E2B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/SpaceCode-E2B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#SpaceCode-E2B-GGUF
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
