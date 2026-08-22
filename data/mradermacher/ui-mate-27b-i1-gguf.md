# mradermacher/UI-Mate-27B-i1-GGUF

## Resumen

UI-Mate-27B es un modelo de visión-lenguaje desarrollado por Tencent, diseñado específicamente para actuar como agente de interfaz gráfica de usuario (GUI) en entornos de escritorio. Su propósito es interpretar capturas de pantalla y ejecutar acciones como clics, teclado y navegación de aplicaciones, lo que lo convierte en una pieza clave para la automatización de tareas en sistemas operativos Windows y entornos similares. La versión aquí presentada es una cuantización GGUF realizada por mradermacher, que reduce el peso del modelo original (26.9 mil millones de parámetros) para facilitar su despliegue en hardware más modesto, manteniendo la compatibilidad con librerías como llama.cpp, Ollama y vLLM.

La cuantización incluye una amplia gama de tipos (desde IQ1_M hasta Q6_K) y utiliza una matriz de importancia (imatrix) para optimizar la calidad de los pesos en cada nivel de compresión. Aunque el modelo original está pensado para ejecutarse en servidores con GPU de alta capacidad, estas versiones GGUF permiten su uso en estaciones de trabajo con una sola tarjeta gráfica, incluso con cuantizaciones agresivas que reducen el tamaño a menos de 10 GB. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos propietarios.

La relevancia de este modelo radica en su enfoque en el uso real de computadoras: a diferencia de los asistentes que solo generan texto, UI-Mate puede actuar sobre el escritorio, lo que abre la puerta a automatizaciones complejas como pruebas de software, gestión de archivos o asistencia remota. La versión cuantizada aquí descrita hace esta tecnología accesible para desarrolladores y pequeños equipos que no disponen de infraestructura de alto coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parámetros totales | 26 895 998 464 (26,9 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original UI-Mate-27B en los datos proporcionados. Se sabe que es un modelo multimodal que combina procesamiento de lenguaje natural con visión por computador, ya que se utiliza para interpretar capturas de pantalla y generar acciones de control. La versión GGUF es una conversión del modelo original de Tencent, que utiliza una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones, un método desarrollado por la comunidad de llama.cpp.

El entrenamiento del modelo original no está descrito en la información disponible. Dado que se trata de un modelo de agente GUI, es probable que haya sido entrenado con datos de interacción de usuario y capturas de pantalla de sistemas operativos, pero no se puede confirmar. La cuantización en sí no altera la arquitectura, solo reduce la precisión de los pesos para optimizar el uso de memoria y acelerar la inferencia.

## Capacidades

- Control de interfaz gráfica de usuario: es capaz de interpretar imágenes de escritorio y generar comandos para acciones como clics, teclas y arrastrar y soltar, mediante herramientas como PyAutoGUI.
- Automatización de tareas en el escritorio: puede ejecutar flujos de trabajo en aplicaciones de Windows y otros entornos, siguiendo instrucciones en lenguaje natural.
- Razonamiento multimodal: integra información visual (capturas) con contexto textual para decidir la siguiente acción.
- Conversación: mantiene diálogos en inglés, aunque su propósito principal es la ejecución de acciones.
- Compatibilidad con herramientas de agente: está etiquetado para funcionar con plataformas como OSWorld y WindowsAgentArena, lo que sugiere que puede integrarse en entornos de evaluación de agentes de escritorio.
- Capacidad de uso de herramientas: aunque no se detalla, su uso con PyAutoGUI implica que puede llamar funciones externas para interactuar con el sistema.

## Casos de uso

- **Automatización de pruebas de software**: un desarrollador puede usar UI-Mate-27B para crear agentes que recorran una aplicación web o de escritorio, ejecutando pruebas funcionales y reportando errores. La capacidad de interpretar capturas de pantalla permite detectar elementos visuales y validar su correcto funcionamiento.
- **Asistente de soporte técnico**: el modelo puede guiar a un usuario mediante una secuencia de pasos en su ordenador, tomando el control de la interfaz para resolver problemas como configuración de impresoras o instalación de programas. Al integrarse con PyAutoGUI, puede realizar acciones reales en el sistema.
- **Gestión de archivos y organización**: se puede programar para que realice tareas repetitivas como mover archivos entre carpetas, renombrarlos o copiar contenido, basándose en instrucciones de alto nivel.
- **Creación de macros inteligentes**: en lugar de grabar macros fijas, UI-Mate-27B puede generar secuencias de acciones dinámicamente según el estado de la pantalla, adaptándose a cambios en la interfaz.
- **Entrenamiento de agentes de escritorio**: investigadores pueden utilizar el modelo en entornos como OSWorld para evaluar y mejorar algoritmos de agentes de GUI, aprovechando su capacidad de razonamiento visual.
- **Automatización de pruebas de accesibilidad**: el modelo puede recorrer una aplicación comprobando si los elementos son accesibles (por ejemplo, si tienen texto alternativo) y generando informes de conformidad con estándares como WCAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas comparativas para este modelo cuantizado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: según el tamaño de los archivos GGUF, se puede estimar una necesidad de memoria de aproximadamente el tamaño del archivo más un margen para la computación. Por ejemplo, el archivo i1-Q4_K_M de 16,6 GB requeriría al menos 20 GB de VRAM para ejecutarse con contexto razonable.
- **GPU recomendadas**: para cuantizaciones pequeñas (IQ1_M, 7,7 GB) podría funcionar en una GPU de 8 GB (como una RTX 3060 o 4060). Para Q4_K_M (16,6 GB) se necesitaría una GPU de 24 GB (RTX 3090/4090) o A5000. Las versiones más grandes (Q6_K, 22,2 GB) requerirían una A100 (40 GB) o similar.
- **Compatibilidad con GPU consumer**: sí, las cuantizaciones desde IQ1_M hasta Q4_K_M pueden caber en GPUs de gama alta para consumidores como la RTX 4090 (24 GB) o la RTX 3090 (24 GB). Para las versiones más pequeñas, incluso una RTX 3060 de 12 GB podría ejecutar IQ2_M (10,1 GB) con limitaciones de contexto.
- **Opciones de despliegue**: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y vLLM (con adaptador GGUF). También se puede usar en servidores con TGI si se convierte a otro formato.
- **Latencia y throughput**: no se han publicado datos. Se espera que la latencia dependa de la cuantización y del hardware, siendo más rápida en cuantizaciones menores pero con mayor pérdida de calidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (agentes de GUI) en los datos proporcionados. No se puede realizar una comparación objetiva sin datos de rendimiento.

## Limitaciones y advertencias

- **Idioma**: solo soporta inglés, lo que limita su uso en entornos multilingües.
- **Cuantización**: las versiones GGUF implican pérdida de precisión respecto al modelo original. Cuantizaciones muy agresivas (IQ1_M, Q2_K) pueden degradar notablemente la calidad de las respuestas y la capacidad de razonamiento.
- **Sin información de contexto**: se desconoce la longitud máxima de contexto, lo que puede afectar a tareas que requieran secuencias largas de interacción.
- **Dependencia de herramientas externas**: el modelo no ejecuta acciones por sí mismo; necesita un entorno que proporcione la interfaz de control (por ejemplo, PyAutoGUI). Esto puede introducir riesgos de seguridad si no se controla adecuadamente.
- **Sin garantías de rendimiento**: no se han publicado benchmarks, por lo que el rendimiento real en tareas de GUI no está validado.
- **Tamaño del repositorio**: el repositorio GGUF ocupa más de 300 GB, lo que puede ser un obstáculo para descargas en entornos con ancho de banda limitado.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado (mradermacher)](https://huggingface.co/mradermacher/UI-Mate-27B-i1-GGUF)
- [Repositorio HuggingFace del modelo original (Tencent)](https://huggingface.co/tencent/UI-Mate-27B)
- [Repositorio GitHub de Tencent UI-Mate](https://github.com/Tencent/UI-Mate)
- [Página de descarga y vista general de mradermacher](https://hf.tst.eu/model#UI-Mate-27B-i1-GGUF)
- [Repositorio HuggingFace de cuantizaciones estáticas (mradermacher)](https://huggingface.co/mradermacher/UI-Mate-27B-GGUF)
