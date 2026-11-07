# aion-analytics-india/aion-sentinel

## Resumen

AION Sentinel es una ficha de documentación publicada en Hugging Face por AION Analytics Private Limited (India) para un producto propietario alojado. No se trata de un modelo de pesos abiertos: no hay pesos descargables, no hay inferencia alojada en Hugging Face y no se publica código ejecutable. El artefacto es exclusivamente documental y describe una herramienta de cribado de integridad corporativa y contabilidad forense orientada a sociedades cotizadas indias.

El producto pretende priorizar registros financieros públicos para revisión humana, asignando niveles de cribado relativos a un universo de cobertura y a una fecha de instantánea determinada. La model card insiste en que Sentinel no es un detector de fraude ni determina conducta indebida: los avisos (flags) son indicios a inspeccionar, no pruebas, y la ausencia de avisos no constituye una declaración de ausencia de problemas.

La relevancia actual es limitada para la comunidad de IA open source, ya que no se libera arquitectura, pesos, tokenizador ni datos de entrenamiento. La información técnica disponible se reduce a metadatos de la model card, etiquetas temáticas y enlaces a la documentación corporativa y a una demo pública con ejemplos enmascarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publica; producto propietario alojado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | en (inglés, según metadatos de la model card) |
| Licencia | no disponible; la model card indica que no concede licencia de código abierto sobre el modelo ni sobre sus salidas |
| Formato de pesos | no disponible (no se publican pesos; no hay safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura del sistema. La model card declara explícitamente que el diseño de características, la lógica de puntuación, los pesos, los umbrales, el material de entrenamiento y los conjuntos de datos licenciados son confidenciales. No hay datos sobre número de tokens, composición del corpus, fases de ajuste (RLHF, DPO, SFT) ni innovaciones técnicas como decodificación especulativa o atención lineal.

El único dato operativo verificable es de naturaleza metodológica: la salida se organiza en instantáneas fechadas con un nivel de cribado relativo, avisos con explicaciones, contexto de pares y periodos de origen de los estados financieros. En una lectura anónima del 7 de noviembre de 2026, la demo mostraba una instantánea del 4 de noviembre de 2026 y un recuento de 3.008 sociedades cotizadas, dato que la propia card califica como observación puntual y no como garantía de cobertura o frescura.

## Capacidades

- Cribado de información financiera pública de sociedades cotizadas indias dentro del universo de cobertura declarado.
- Asignación de niveles de cribado relativos a una instantánea y a un universo de cobertura concretos.
- Generación de avisos con explicaciones sobre áreas a inspeccionar en los estados financieros.
- Aportación de contexto de pares (peer context) cuando está disponible.
- Indicación de los periodos de origen de los datos subyacentes.
- Flujo orientado a triaje de due diligence: revisión de nivel, avisos y contexto, seguido de verificación independiente de las fuentes.
- No cubre sociedades no cotizadas ni ingiere datos institucionales privados.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.

## Casos de uso

- Triaje de due diligence en banca y NBFC: el revisor consulta el nivel de cribado y los avisos de una entidad cotizada antes de decidir si profundiza en los estados financieros originales, usando Sentinel como entrada suplementaria y no como decisión crediticia.
- Investigación de inversión en gestoras de activos: el analista prioriza qué emisoras del universo revisar primero según los avisos y el contexto de pares, verificando después cada fuente primaria.
- Cribado preliminar en agencias de rating: se emplea como señal de priorización para seleccionar expedientes que requieren examen adicional, sin que la salida sustituya la opinión de rating.
- Auditoría y contabilidad forense: los equipos usan los avisos explicados como hipótesis de trabajo para orientar pruebas sustantivas sobre partidas concretas, con verificación documental posterior.
- Cumplimiento corporativo y consejos de administración: se revisan avisos sobre entidades del grupo o de la competencia para preparar preguntas en comités, siempre con validación humana de los registros.
- Investigación de interés público: periodistas y académicos criban sociedades cotizadas para identificar registros que merecen escrutinio, contrastando los hallazgos con los filings originales.
- Integración en sistemas de alertas propios: el cliente puede incorporar los resultados como insumo en sus flujos de alerta, aunque las uniones de cartera, alertas, decisiones de crédito y flujos regulatorios requieren sistemas y controles separados del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia local: no se distribuyen pesos ni artefactos ejecutables.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible; el producto es un servicio alojado con acceso por API sujeto a credenciales y derechos de uso.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni motores equivalentes; el acceso es mediante la API de AION Analytics.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Criterio | AION Sentinel | Alternativas de cribado financiero propietarias | Modelos abiertos de finanzas (p. ej. variantes de Llama o Mistral ajustadas) |
|---|---|---|---|
| Naturaleza | Producto propietario alojado, ficha solo documental | Productos SaaS propietarios | Pesos abiertos descargables |
| Pesos disponibles | No | No | Sí |
| Arquitectura publicada | No | No | Sí |
| Contexto | No disponible | No disponible | Variable según modelo |
| Licencia | Sin licencia de código abierto | Comercial | Según modelo base |
| Cobertura declarada | 3.008 sociedades cotizadas indias (observación del 4 de noviembre de 2026) | Variable | No aplica |
| Idiomas | en | Variable | Variable |

No se dispone de datos de rendimiento comparativo ni de modelos directamente equivalentes publicados con especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- No es un detector de fraude: la model card declara que Sentinel no ha demostrado identificar fraude ni predecir conducta indebida.
- Un aviso no es evidencia de irregularidad y la ausencia de avisos no es una declaración de ausencia de problemas.
- El nivel de cribado es relativo a la instantánea y al universo de cobertura, no una probabilidad de fraude, impago o pérdida futura.
- Se reconocen falsos positivos y problemas no detectados.
- Cobertura limitada a sociedades cotizadas indias; no cubre entidades no cotizadas ni datos institucionales privados.
- Los periodos de los estados financieros subyacentes pueden tener meses de antigüedad; la frescura no está garantizada.
- Resultados orientados a investigación: no constituyen opinión de auditoría, conclusión legal o contable, rating, evaluación crediticia, asesoramiento de inversión ni instrucción de compra o venta.
- Metodología, pesos, umbrales y datos de entrenamiento son confidenciales, lo que impide auditoría técnica externa.
- Licencia: sin licencia de código abierto; la card no concede licencia sobre el modelo ni sobre sus salidas. El uso comercial requiere acceso institucional a través de los canales de AION Analytics.
- Idiomas: solo inglés documentado, lo que limita su uso en entornos en castellano u otros idiomas.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/aion-analytics-india/aion-sentinel
- Demo pública: https://aionanalytics.in/demo/sentinel
- Alcance y limitaciones del producto: https://aionanalytics.in/models/sentinel
- Productos API y acceso institucional: https://aionanalytics.in/apis
- Contacto: https://aionanalytics.in/contact
- Documentación canónica en GitHub: https://github.com/AION-Analytics-India/aion-sentinel
- Copia de documentación en GitLab: https://gitlab.com/aion-analytics-india/aion-sentinel
- Web corporativa: https://aionanalytics.in/
- Organización en GitHub: https://github.com/AION-Analytics-India
- Grupo en GitLab: https://gitlab.com/groups/aion-analytics-india
- Organización en Hugging Face: https://huggingface.co/aion-analytics-india
- LinkedIn: https://www.linkedin.com/company/aion-analytics-india/
- X: https://x.com/Aion_analytics_
- YouTube: https://www.youtube.com/@aionanalytics
- Telegram: https://t.me/+VXWCiDgZjBI3ZjA1
- Discord: https://discord.gg/Dk9Pjc9cVa
- Perfil de mantenedor en PyPI: https://pypi.org/user/aion-analytics/
- Terminal cuantitativa de AION: https://ai.aionanalytics.com/
