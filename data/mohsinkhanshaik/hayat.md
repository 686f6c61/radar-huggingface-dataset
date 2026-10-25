# Mohsinkhanshaik/HAYAT

## Resumen

HAYAT no es un modelo de lenguaje con pesos publicados, sino el espejo en Hugging Face del código fuente de un asistente personal «local-first» desarrollado por Mohsin Khan Shaik. El repositorio tiene un tamaño de 0,0 GB, la librería declarada es `hayat`, el pipeline no está definido y no contiene ficheros de pesos: la model card indica explícitamente que se trata del código del proyecto, replicado desde GitHub, junto con enlaces a dos repositorios de modelos separados (`HAYAT-35B-A3B-Uncensored-GGUF` y `HAYAT-Open-4B`).

El problema que aborda es el de la orquestación de un asistente que combine razonamiento local mediante Ollama, memoria persistente, investigación en web pública, ejecución de herramientas verificables, automatización de Windows, visión y reconocimiento facial local, voz y una política de coste cero en APIs. La interfaz gráfica, la terminal, la voz y el acceso web autenticado comparten el mismo runtime, y el sistema bloquea por diseño cualquier fallback de inferencia o búsqueda que implique facturación no verificada.

Su relevancia ahora es acotada y debe interpretarse con cautela: se publica como infraestructura de agente reutilizable con modelos de razonamiento sustituibles, no como un checkpoint entrenado. No hay métricas de entrenamiento, benchmarks ni datos de rendimiento publicados en la información disponible, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible a nivel de pesos. El repositorio contiene una aplicación de orquestación de agentes (asistente de escritorio, CLI, voz y web) que delega la inferencia en modelos servidos localmente por Ollama |
| Parametros totales | No disponible en este repositorio (0,0 GB, sin pesos). El autor referencia un modelo denominado `HAYAT-35B-A3B-Uncensored-GGUF`; por la convención de nombres corresponderían del orden de 35 000 millones, sin confirmación documental |
| Parametros activos | No disponible. La nomenclatura «A3B» del modelo referenciado sugiere una arquitectura de mezcla de expertos con unos 3000 millones activos, sin ficha técnica que lo confirme |
| Longitud de contexto | No disponible. Depende del modelo de Ollama configurado en cada instalación; el proyecto no declara un valor propio |
| Tipos de cuantizacion | El repositorio asociado se distribuye en formato GGUF según su nombre; las cuantizaciones concretas (Q4_K_M, Q8_0, etc.) no están disponibles en la información proporcionada |
| Idiomas soportados | `en` (inglés), único idioma declarado en la model card; el resto de idiomas dependería del modelo subyacente y no está documentado |
| Licencia | AGPL-3.0 |
| Formato de pesos | No hay pesos en este repositorio. El modelo asociado se publica como GGUF; el resto de formatos no disponible |

## Arquitectura y entrenamiento

El repositorio no documenta ninguna arquitectura de red neuronal ni proceso de entrenamiento: no hay número de tokens, composición de dataset, fases de RLHF/DPO ni innovaciones de atención. Lo que describe es una arquitectura de sistema: un runtime único compartido por GUI, terminal, voz y acceso web autenticado, con un modelo local servido por Ollama como motor de razonamiento, memoria persistente entre sesiones, planificación, ejecución de herramientas con resultado comprobable, contacto cifrado para redes profesionales, investigación en web pública y en onions a través de Tor, y automatización de escritorio en Windows.

Las innovaciones que sí aparecen documentadas son de ingeniería de producto: política de coste cero que bloquea integraciones con facturación no verificada, salidas en lenguaje natural etiquetado en lugar de volcados JSON (con `HAYAT_CLI_JSON=1` como escape para scripts), arranque bajo demanda de Tor sin caída a lectura directa, detección de personas con umbral y vista de resultados crudos sin identificación automática, reconocimiento facial local con enrolamiento explícito opt-in y plantillas cifradas por cuenta, e inspección estática acotada de módulos, imports y source maps en tareas de ingeniería inversa sin ejecutar el código objetivo.

## Capacidades

- Conversación multi-turno con memoria persistente y gestión de contexto entre sesiones.
- Investigación en web pública con reintentos por proveedor (DuckDuckGo, Bing) y mensajes de error en lenguaje natural.
- Navegación y lectura de URLs onion conocidas a través de Tor, con modo explícito, progreso, cancelación y citas.
- Ejecución de herramientas y tareas con resultado verificable; comandos de barra tipo `/health` y paneles de resultado en la GUI.
- Automatización de escritorio en Windows: vistas de operación automáticas que preservan el foco y dejan pasar los clics, y vistas manuales con controles de pausa y parada.
- Visión: detección de personas con cajas y porcentajes de detector en vista legible, control de umbral y handoff separado a investigación de nombre conocido o fuente de imagen.
- Reconocimiento facial local de personas enroladas, con resultados desconocidos o ambiguos, puntuaciones coseno en crudo y controles manuales de galería; sin búsqueda de identidad en web.
- Herramientas locales de imagen: inspección técnica, comprobación de duplicados y procedencia de la fuente.
- Búsqueda de empleo mundial y profunda, con paginación en feeds gratuitos, parada, paginación de resultados guardados y fallback automático a proveedores públicos.
- Herramientas de negocio e invención con ajustes locales reales y sondas sobre datos no vistos.
- Ingeniería inversa de enlaces: descubrimiento estático de módulos, imports y source maps, evidencia de fuente retenida, verificación por hash de fichero y cancelación cooperativa.
- Redes profesionales privadas: contactos cifrados y descubrimiento de rutas profesionales y de equipo publicadas, con candidatos separados y borradores de contacto explícitos.
- Soporte de voz y de material adjunto en la conversación.
- No se documenta soporte explícito de function calling nativo, modo «thinking» ni audio más allá de la voz del propio asistente.

## Casos de uso

- Asistente personal de escritorio con memoria: un profesional lo instala en Windows y mantiene conversaciones que conservan contexto entre sesiones, adjuntando documentos y recuperando decisiones anteriores sin depender de un servicio en la nube.
- Investigación OSINT defensiva sobre infraestructura propia: el asistente consulta web pública y onions a través de Tor, conserva citas y modo de cobertura, y permite auditar qué se leyó y con qué fuente, lo que resulta adecuado por la separación explícita entre modo directo y modo Tor.
- Revisión de seguridad de un front-end empaquetado: la herramienta de ingeniería inversa descubre módulos, imports y source maps, guarda evidencia y verifica hashes sin ejecutar el código del objetivo, un requisito habitual en análisis de terceros.
- Automatización de tareas repetitivas en Windows: la vista de operación permite mostrar el progreso de un flujo de trabajo sobre aplicaciones de escritorio manteniendo el foco del usuario, con controles de pausa y parada para procesos largos.
- Triaje de imágenes con privacidad: detección de personas y reconocimiento de personas enroladas localmente, con umbral ajustable y sin búsqueda de identidad en web, útil en flujos donde el material gráfico no puede salir del equipo.
- Búsqueda de empleo asistida: consultas mundiales y profundas con paginación, guardado de resultados y fallback entre proveedores públicos cuando una fuente falla, lo que reduce el trabajo manual de cribado.
- Docencia y explicación de resultados: la salida en líneas etiquetadas en lenguaje natural («Running: yes», errores de búsqueda redactados) facilita usar el asistente como herramienta de aprendizaje en lugar de exigir al usuario interpretar JSON.
- Prototipado de agentes con coste controlado: al bloquear fallbacks de pago, el entorno sirve para validar pipelines de agentes antes de decidir si se autoriza gasto en APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas, y los dos modelos referenciados (`HAYAT-35B-A3B-Uncensored-GGUF` y `HAYAT-Open-4B`) no aportan métricas en la documentación consultada. Las cifras de comportamiento que aparecen en la model card son comprobaciones funcionales con fecha («machine-specific results are dated evidence»), no medidas de calidad del modelo.

## Requisitos de hardware

- VRAM de inferencia: no disponible como dato publicado. Depende enteramente del modelo de Ollama seleccionado; el proyecto no fija un modelo obligatorio.
- Cálculo orientativo (no verificado por el autor) para el modelo de ~35 000 millones referenciado en cuantización de 4 bits: del orden de 17-20 GB solo de pesos, más caché KV adicional; en 8 bits se duplicaría aproximadamente. Para el modelo de ~4 000 millones, el orden de magnitud sería de 2,5-3 GB en 4 bits y de 4-5 GB en 8 bits.
- GPU recomendadas: no disponible. Por el cálculo anterior, un modelo de ~35B en 4 bits requiere GPU con 24 GB o más (RTX 3090/4090, A6000, L40S, A100/H100) o descarga parcial a CPU; un modelo de ~4B cabe en GPUs de consumo de 8 GB.
- Cabe en GPU de consumo: previsiblemente sí para el modelo de ~4B en cuantizaciones bajas; para el de ~35B solo con cuantización agresiva y offload parcial, sujeto a verificación.
- Despliegue: Ollama como runtime de inferencia local (requisito del proyecto), más la propia aplicación HAYAT en Windows con interfaz gráfica, CLI y servicio web autenticado. vLLM, llama.cpp directo, TGI o servidores alternativos no están documentados como soportados.
- Latencia y throughput: no disponible. La documentación menciona tiempos cualitativos (arranque en frío de Tor de aproximadamente un minuto) pero ninguna métrica de tokens por segundo.

## Comparativa con modelos similares

HAYAT pertenece a la categoría de asistentes locales con memoria y herramientas, no a la de modelos de pesos abiertos, por lo que la comparación se establece con otras pilas de orquestación local.

| Proyecto | Tipo | Parametros propios | Contexto | Licencia | Despliegue | Benchmarks publicados |
|---|---|---|---|---|---|---|
| HAYAT | Asistente local-first con memoria, herramientas y visión | No aplica (delega en Ollama); pesos no incluidos | Depende del modelo configurado | AGPL-3.0 | Windows, GUI + CLI + voz + web, Ollama | No disponible |
| Open WebUI | Interfaz y orquestación sobre Ollama y APIs compatibles | No aplica | Depende del backend | No verificada en esta ficha | Contenedor o servicio web, multiplataforma | No disponible |
| Jan | Aplicación de escritorio para modelos locales | No aplica | Depende del modelo | No verificada en esta ficha | Escritorio, multiplataforma | No disponible |
| AnythingLLM | RAG y agentes sobre documentos locales | No aplica | Depende del modelo | No verificada en esta ficha | Escritorio o contenedor | No disponible |

Frente a estas alternativas, HAYAT destaca por integrar de serie Tor, reconocimiento facial local y automatización de Windows, y queda por detrás en validación comunitaria (0 descargas, 0 likes), en soporte multiplataforma documentado (solo Windows) y en ausencia total de benchmarks.

## Limitaciones y advertencias

- No es un modelo: quien busque pesos para evaluar calidad lingüística no los encontrará aquí (0,0 GB). Hay que acudir a los repositorios `HAYAT-35B-A3B-Uncensored-GGUF` y `HAYAT-Open-4B`, cuyas fichas técnicas no se han verificado.
- Ausencia total de datos de entrenamiento, procedencia del dataset y metodología de alineación de los modelos referenciados, lo que impide evaluar sesgos de origen.
- Riesgo de alucinación estándar de los modelos de lenguaje subyacentes, agravado por un discurso de producto que enfatiza la verificación de herramientas pero no documenta tasas de error.
- El asistente depende de Ollama y de una instalación en Windows; el soporte de otras plataformas no está documentado.
- Idioma declarado únicamente inglés: el rendimiento en castellano no está garantizado ni evaluado.
- La política de coste cero bloquea APIs de pago y bloquea integraciones con facturación no verificada, lo que limita la calidad máxima alcanzable en búsqueda e inferencia.
- La licencia AGPL-3.0 impone obligaciones de copyleft que se activan también con el uso en red; conviene revisarlas antes de ofrecer el asistente como servicio a terceros.
- El reconocimiento facial y la detección de personas tratan datos biométricos: su uso en la Unión Europea exige base jurídica conforme al RGPD y evaluación conforme al Reglamento de IA. La documentación advierte que los porcentajes no identifican a una persona, pero el riesgo de mal uso persiste.
- El uso de Tor y de técnicas de ingeniería inversa puede vulnerar términos de servicio de terceros o normativa local; la herramienta no ejecuta el código objetivo, pero la recolección de evidencia sigue siendo responsabilidad del operador.
- La etiqueta «Uncensored» en el modelo referenciado implica ausencia o reducción de filtros de seguridad, con el consiguiente riesgo en producción.
- Proyecto sin tracción medible (0 descargas, 0 likes) y con documentación interna muy extensa pero autopublicada; no hay auditoría externa ni revisión por pares.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mohsinkhanshaik/HAYAT
- Modelo referenciado (GGUF): https://huggingface.co/Mohsinkhanshaik/HAYAT-35B-A3B-Uncensored-GGUF
- Modelo referenciado (4B): https://huggingface.co/Mohsinkhanshaik/HAYAT-Open-4B
- Perfil del autor en Hugging Face: https://huggingface.co/Mohsinkhanshaik
- Código fuente en GitHub: https://github.com/mohsinkhanshaik/HAYAT
- Repositorio GitHub HAYAT.AI: https://github.com/mohsinkhanshaik/HAYAT.AI
- Perfil del autor en GitHub: https://github.com/mohsinkhanshaik
- Documentación interna citada en el repositorio (rutas relativas, no enlaces directos): `docs/how-to-use-hayat.md`, `docs/zero-cost.md`, `docs/pitch.md`, `docs/local-face-recognition-2026-10-24.md`, `docs/reverse-engineering.md`, `docs/public-face-image-depth-2026-10-25.md`, `docs/research-gui-window-audit-2026-10-25.md`, `docs/jobs-human-verification-2026-10-25.md`
