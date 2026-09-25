# numexai/numex

## Resumen

numexai/numex es un repositorio de Hugging Face publicado por el desarrollador turco Numex AI. En el momento de la consulta el repositorio no contiene pesos (tamaño 0,0 GB), no declara licencia, idiomas ni pipeline de inferencia, y registra 0 descargas y 0 valoraciones. Su README no es una model card técnica en sentido estricto, sino la página de presentación del producto comercial Numex AI (numexai.com.tr), un asistente en turco que se distribuye exclusivamente como servicio web y API.

Según el autor, el sistema se articula en torno a un pipeline de cinco capas (enriquecimiento del prompt, modelo, corrección y tono en turco, control de calidad y respuesta), con cuatro perfiles de servicio (Numex Pro, Numex Fast, Numex Vision y Numex Code) y funcionalidades adicionales como Detective Mode, DeepView y un modo agente multi-paso. El único dato cuantitativo de contexto que aporta la documentación es de 128K tokens para el perfil Numex Pro; no se especifica el contexto de los demás perfiles.

La relevancia de esta ficha es limitada como modelo evaluable: no hay arquitectura, número de parámetros, datos de entrenamiento, licencia ni artefactos de pesos publicados. Lo que puede evaluarse es la oferta de servicio y su encaje en flujos de trabajo en turco, no el modelo subyacente, que no se identifica en ningún momento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la documentación no describe la arquitectura; el repositorio no contiene pesos) |
| Parametros totales | no disponible |
| Longitud de contexto | 128K tokens en el perfil Numex Pro (único dato aportado por el autor); no disponible para Numex Fast, Numex Vision y Numex Code |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | el producto se presenta como centrado en turco (Türkçe odaklı); la documentación no enumera otros idiomas |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | no disponible; el repositorio no incluye ningún archivo de pesos (0,0 GB) |
| Desarrollador | numexai (Numex AI, Estambul, Turquía) |
| Perfiles de servicio | Numex Pro, Numex Fast, Numex Vision, Numex Code |
| Fecha de creación del repositorio | 2026-09-24 (según la metadata de Hugging Face) |
| Última actualización | 2026-09-24 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura del modelo subyacente: ni tipo (transformer, MoE, SSM o híbrido), ni número de parámetros, ni estrategia de atención. La documentación describe únicamente la capa de orquestación de la aplicación, presentada como un pipeline de cinco etapas: enriquecimiento del prompt, invocación del modelo, corrección y ajuste de tono en turco, control de calidad y entrega de la respuesta. A partir de esta descripción no es posible determinar si existe un único modelo base o varios modelos encadenados.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del corpus, proporción de contenido en turco), ni si se aplicaron técnicas de alineación como RLHF, DPO o similares. Las innovaciones que el autor destaca son funcionalidades de producto, no técnicas de modelado: Detective Mode (varios modelos resuelven una consulta crítica y un árbitro selecciona la respuesta justificando la elección), DeepView (varios "expertos" coordinados producen un plan maestro con visualización del razonamiento en seis capas) y un modo agente que descompone tareas multi-paso y presenta los cambios como diffs. La infraestructura declarada son dos servidores con 256 GB de RAM cada uno, alojados en Turquía, con cumplimiento de la normativa turca KVKK.

## Capacidades

- Generación de texto conversacional en turco, con una capa declarada de corrección de estilo y tono orientada a un registro natural ("yapılır" en lugar de "yapılmaktadır").
- Generación, explicación y depuración de código, con un editor (Codex) con resaltado de sintaxis y un área Canvas con previsualización en vivo.
- Análisis de documentos: resumen, consulta y comparación de archivos PDF y Word.
- Búsqueda web con resumen de fuentes, activable mediante selectores de modo en la interfaz.
- Comprensión de imágenes a través del perfil Numex Vision (análisis y descripción de imágenes).
- Entrada de voz y sesiones de conversación habladas.
- Modo agente multi-paso: planificación de tareas, ejecución y presentación de cambios en formato diff.
- Detective Mode: resolución de consultas críticas mediante múltiples modelos y un árbitro que justifica la respuesta seleccionada.
- DeepView: coordinación de dos o más "expertos" mediante menciones con arroba para producir un plan maestro.
- Personajes especializados invocables con arroba (@FatmaAna, @MuhasebeciYunus, @LokmanHekim, @HaciBayramHoca, @Üstat, @Avukat, @Kod).
- Conversaciones compartibles mediante enlace y notificaciones dentro de la aplicación.
- No se documenta soporte explícito de function calling ni de protocolos de herramientas estándar (por ejemplo, JSON schema o MCP).

## Casos de uso

- Atención al cliente en turco: el producto está diseñado para conversaciones multi-turno con contexto de hasta 128K tokens en el perfil Pro, lo que permite mantener el hilo de incidencias largas sin perder el historial previo.
- Análisis de contratos y documentos legales: carga de PDF o Word con peticiones del tipo "resume las cláusulas de rescisión de este contrato"; el perfil Pro es el adecuado por su ventana de contexto.
- Asistencia fiscal y contable para autónomos turcos: el personaje @MuhasebeciYunus responde a consultas sobre IVA (KDV), plazos de declaración y facturación electrónica, aunque requiere verificación humana por el riesgo de error normativo.
- Desarrollo de software: depuración de fugas de memoria en componentes React o refactorizaciones, apoyándose en el perfil Numex Code, el editor Codex y el modo Detective cuando la causa raíz no es evidente.
- Diseño de arquitectura de producto: invocación conjunta de @Backend, @DevOps y @Security para obtener un borrador integrado mediante DeepView, útil como punto de partida en revisiones técnicas.
- Automatización de tareas administrativas multi-paso: el modo agente planifica la secuencia de acciones y entrega los cambios como diff, lo que facilita la revisión antes de aplicar modificaciones.
- Investigación con datos actualizados: el modo de búsqueda web devuelve resúmenes con fuentes citadas, adecuado para consultas cuyo conocimiento exige información reciente.
- Accesibilidad y uso móvil: entrada por voz y funcionamiento como PWA instalable, con opciones de alto contraste, texto ampliado y compatibilidad con lectores de pantalla.
- Educación: el ecosistema incluye un componente específico (numex-okul) orientado a entornos de aprendizaje, según los enlaces publicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones específicas de turco), y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo: los enlaces recuperados corresponden a sitios de contenido para adultos sin relación alguna con numexai/numex, por lo que no aportan datos técnicos ni de rendimiento. Tampoco se declaran latencias, tokens por segundo ni límites de tasa más allá de los cupos de uso de los planes (5 mensajes diarios sin registro, 15 mensajes diarios en el plan gratuito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no hay pesos publicados ni especificación de tamaño, por lo que no puede calcularse.
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no aplicable; al no existir artefactos de pesos, no es posible ejecutar el modelo en una GPU local.
- Opciones de despliegue local (vLLM, llama.cpp, Ollama, TGI): no disponibles; el acceso es exclusivamente a través de la web numexai.com.tr y de los repositorios de API y SDK del autor.
- Infraestructura del proveedor: dos servidores con 256 GB de RAM cada uno, alojados en Turquía, según la documentación.
- Latencia y throughput: no disponibles.
- Coste de acceso: planes declarados de 0 ₺ (gratuito), 99 ₺ (Başlangıç PRO), 399 ₺ (Numex PRO) y 599 ₺ (Advanced), más paquetes de créditos y billetes por tiempo; pagos gestionados con Iyzico.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque el repositorio no publica parámetros, contexto por perfil, licencia ni pesos, y no se identifican los modelos base que pudieran estar detrás del servicio. La tabla siguiente es meramente orientativa: la columna de numexai/numex recoge lo declarado por el autor y las filas de alternativas abiertas con capacidades multilingües (incluido el turco) reflejan datos de documentación pública general, no verificados en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Pesos | Observaciones |
|---|---|---|---|---|---|
| numexai/numex | no disponible | 128K en Numex Pro; resto no disponible | no disponible | no publicados (repo 0,0 GB) | Servicio propietario en turco; sin benchmarks ni arquitectura pública |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Abiertos (safetensors, GGUF comunitario) | Multilingüe, ejecutable en local; requiere cumplir la licencia de Meta |
| Qwen2.5 7B Instruct | 7B | 32K nativo, ~131K con YaRN | Apache 2.0 | Abiertos (safetensors, GGUF) | Buen rendimiento en código y multilingüe; licencia permisiva |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | Abiertos (safetensors, GGUF) | Alternativa ligera y permisiva, con menor cobertura de turco que los anteriores |

## Limitaciones y advertencias

- El repositorio no contiene pesos: no se puede auditar, replicar ni ejecutar el modelo en local. La única vía de uso es el servicio alojado del proveedor.
- Ausencia total de especificaciones técnicas: se desconoce arquitectura, número de parámetros, datos de entrenamiento y proceso de alineación, lo que impide evaluar capacidades reales más allá de la descripción comercial.
- No se declara licencia en Hugging Face, por lo que no hay certeza sobre las condiciones de uso comercial del repositorio ni de los artefactos asociados.
- No existen benchmarks publicados ni comparaciones objetivas con otros modelos; cualquier afirmación de calidad procede del propio autor.
- El producto está orientado al turco y no se documenta el rendimiento en castellano ni en otras lenguas, lo que desaconseja su uso en producción multilingüe sin una evaluación previa propia.
- Riesgo de alucinación relevante en los casos de uso más sensibles: fiscalidad (KDV, plazos de declaración), salud y asesoramiento legal se cubren mediante personajes temáticos que no sustituyen a un profesional titulado.
- Las respuestas de búsqueda web dependen de fuentes externas y pueden arrastrar errores o sesgos de dichas fuentes; conviene verificar las citas.
- Dependencia de un proveedor único y de un ecosistema cerrado, con precios fijados en liras turcas y sujeción a la normativa de privacidad turca (KVKK); no se menciona cumplimiento explícito del RGPD europeo.
- Los cupos de los planes gratuitos (5 mensajes diarios sin registro, 15 con cuenta) limitan cualquier prueba de carga o evaluación seria.
- Anomalía en la metadata: la fecha de creación y actualización del repositorio figura como 2026-09-24, incongruente con el estado actual del contenido (0,0 GB, sin archivos) y que conviene tratar con cautela.
- Señales de escasa adopción: 0 descargas y 0 valoraciones, sin evidencia de uso en producción por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/numexai/numex
- Sitio web del producto: https://numexai.com.tr
- Documentación de personajes: https://github.com/numexai/numex_nedir/blob/main/urunler/08-karakterler.md
- Editor Codex: https://github.com/numexai/numex-codex
- CLI: https://github.com/numexai/numex-cli
- API: https://github.com/numexai/numex-api
- SDK: https://github.com/numexai/numex-sdk
- Componente educativo (Okul): https://github.com/numexai/numex-okul
- Market: https://market.numexai.com.tr
- Base de conocimiento (Numexpedia): https://github.com/numexai/numex-pedia
- Hub: https://github.com/numexai/numex-hub
- Forge: https://github.com/numexai/numex-forge
- Pusulam: https://github.com/mobilcep/pusulamx
- PC Doktoru: https://github.com/mobilcep/pcdoktoru
- Nota sobre la búsqueda web: los resultados recuperados para esta consulta no guardan relación con el modelo (enlaces a plataformas de contenido para adultos); no se han encontrado papers, blogs técnicos ni demos independientes sobre numexai/numex.
