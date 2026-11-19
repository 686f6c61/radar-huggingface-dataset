# mradermacher/SpaceCode-E2B-i1-GGUF

## Resumen

SpaceCode-E2B-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo SpaceCode-E2B desarrollado por SpaceGhost. El modelo base es un modelo multimodal (texto e imagen) especializado en ingeniería de software, con etiquetas que apuntan a dominios concretos como React Native, Android, TypeScript y Python, y construido sobre la familia Gemma (la etiqueta `gemma4` aparece en los metadatos). El repositorio que nos ocupa no contiene los pesos originales, sino las versiones cuantizadas publicadas por mradermacher para su uso con llama.cpp y ecosistemas compatibles.

El modelo cuenta con 4.647.450.147 parámetros totales según los safetensors del modelo base, lo que lo sitúa en la categoría de modelos densos de aproximadamente 4.600 millones de parámetros. Está pensado para tareas de asistencia en programación con soporte de visión, es decir, puede procesar capturas de pantalla, diagramas o interfaces de usuario además de código fuente. Los idiomas declarados son portugués e inglés.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de código multimodal en hardware de consumo gracias a las cuantizaciones de 3 a 4 GB, y en que documenta con precisión qué se sabe y qué no se sabe del modelo, dado que la información publicada es limitada y no incluye resultados de benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` en metadatos; familia Gemma) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más imatrix para generar cuantizaciones propias) |
| Idiomas soportados | pt, en |
| Licencia | gemma-terms-of-use (marcada como `other` con enlace a los términos de Gemma) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 50,2 GB (incluye todas las cuantizaciones) |
| Rango de tamano de las cuantizaciones | 3,1 GB (i1-Q2_K) a 3,9 GB (i1-Q6_K) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Los metadatos incluyen la etiqueta `gemma4`, lo que sugiere que el modelo base deriva de la familia Gemma de Google, y la etiqueta `unsloth` apunta a que el ajuste fino se realizó con las herramientas de Unsloth. El modelo es multimodal (etiquetas `vision` y `multimodal`), por lo que incorpora un codificador visual además del transformer de lenguaje, aunque no se especifica su configuración ni el número de tokens de entrenamiento.

Tampoco se documentan la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio de cuantizaciones indica que se han generado cuantizaciones ponderadas con imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. Las cuantizaciones estáticas están disponibles en un repositorio separado, y los ficheros mmproj (proyección multimodal) se encuentran en ese repositorio estático, no en el de imatrix.

## Capacidades

- Generación de código en TypeScript, Python y contextos de React Native y Android, según las etiquetas del modelo.
- Comprensión de imágenes: el modelo es multimodal y puede procesar entradas visuales junto con texto (capturas de pantalla, diagramas, interfaces).
- Conversación multi-turno: la etiqueta `conversational` indica soporte para diálogo.
- Asistencia en ingeniería de software: la etiqueta `software-engineering` sugiere un ajuste orientado a tareas de desarrollo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a portugués e inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia de código en el IDE: el modelo puede generar y completar código en TypeScript y Python, integrándose en extensiones de editor que envían fragmentos de código y reciben sugerencias, con un tamaño de cuantización de 3,5 GB que permite ejecución local.
- Revisión de capturas de pantalla de interfaces: gracias a su capacidad de visión, puede analizar imágenes de pantallas de aplicaciones React Native o Android y describir problemas de maquetación o sugerir cambios de código.
- Generación de componentes React Native: el ajuste específico en este framework permite pedirle componentes, hooks o estilos concretos para aplicaciones móviles.
- Explicación de código heredado: con el contexto conversacional, se le puede pasar un fichero y solicitar explicaciones paso a paso en inglés o portugués.
- Automatización de tareas de refactorización local: al ejecutarse con llama.cpp en una máquina de desarrollo, puede procesar ficheros sin enviar código a servicios externos, lo que reduce riesgos de confidencialidad.
- Prototipado rápido de scripts de automatización en Python: útil para generar scripts de procesamiento de datos o utilidades de línea de comandos en entornos con recursos limitados.
- Traducción técnica inglés-portugués de documentación de software: el soporte declarado de ambos idiomas permite asistir en la localización de textos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB para i1-Q2_K, 3,5 GB para i1-Q4_K_M y 3,9 GB para i1-Q6_K, más el overhead del contexto y, en su caso, del proyector multimodal.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para las cuantizaciones Q4; una RTX 3060 de 12 GB o superior permite ejecutar la cuantización Q6_K con contexto amplio. Para despliegue en servidor, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM (GTX 1660, RTX 3050, RTX 4060, etc.) usando cuantizaciones Q4; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con la API de endpoints indicada en los metadatos. El repositorio declara `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpaceCode-E2B (este) | 4.647 M | no disponible | Sí (visión) | gemma-terms-of-use | GGUF en HF |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información publicada es muy escasa: no hay benchmarks, no se detalla el contexto máximo ni la composición del entrenamiento, lo que dificulta evaluar su calidad real frente a alternativas.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de código puede generar APIs inexistentes o firmas incorrectas, por lo que requiere verificación.
- Idiomas limitados a portugués e inglés; el rendimiento en castellano no está garantizado ni documentado.
- La licencia `gemma-terms-of-use` impone restricciones adicionales al uso comercial; es necesario revisar los términos de Gemma antes de desplegarlo en producción.
- El repositorio contiene únicamente cuantizaciones; los ficheros mmproj para la parte visual están en el repositorio estático, y su uso conjunto debe verificarse.
- Las cuantizaciones de 2 y 3 bits pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- No hay información sobre sesgos conocidos ni sobre el proceso de alineación.
- El modelo base tiene aproximadamente 4.600 millones de parámetros, por lo que su capacidad de razonamiento complejo es limitada en comparación con modelos de mayor tamaño.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/SpaceCode-E2B-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/SpaceCode-E2B-GGUF
- Modelo base: https://huggingface.co/SpaceGhost/SpaceCode-E2B
- Página de descargas del autor: https://hf.tst.eu/model#SpaceCode-E2B-i1-GGUF
- Términos de licencia de Gemma: https://ai.google.dev/gemma/terms
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica de comparación de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
