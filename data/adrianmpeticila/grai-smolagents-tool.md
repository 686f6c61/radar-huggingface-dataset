# AdrianMPeticila/grai-smolagents-tool

## Resumen

`AdrianMPeticila/grai-smolagents-tool` es un repositorio que empaqueta el endpoint remoto MCP del servicio grai (`https://grai.page/api/mcp`) como una herramienta (`Tool`) del framework smolagents de Hugging Face. No se trata de un modelo de lenguaje con pesos propios, sino de una utilidad de integracion que permite a un agente construido con smolagents evaluar la "cadencia" de un borrador de texto y detectar marcadores estilisticos asociados a texto generado por IA. El autor es AdrianMPeticila y la licencia es MIT.

La herramienta devuelve una puntuacion de 0 a 100, un valor de varianza de ritmo de frase (`cv`, con un umbral humano de 0,32), un booleano `pass` (o `null` si el texto es demasiado corto) y una lista de fragmentos citados que incumplen cada regla. Mide ocho indicadores estructurales: marcadores de vocabulario de modelo, adverbios superficiales, paralelismo en tricolon, relleno de contraste, densidad de pasiva, monotonía en la longitud de frase, patrones de titulos generados por IA y aperturas aduladoras.

Es relevante en el contexto de agentes autonomos porque demuestra un patron de integracion limpia entre smolagents y servicios externos via MCP, con llamada HTTP basada solo en la libreria estandar de Python, sin clave de API ni cuenta. El repositorio no contiene pesos, arquitectura de red neuronal ni datos de entrenamiento; la ficha describe por tanto la herramienta y su funcion, no un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: herramienta smolagents que envuelve un endpoint MCP remoto (HTTP) |
| Parametros totales | No disponible (no es un modelo con pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo del agente que la invoque) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | No aplica (codigo Python: `grai_gate_tool.py`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es una clase `GraiCadenceGateTool` que hereda de `Tool` de smolagents y realiza una llamada HTTP al endpoint MCP de grai usando exclusivamente la libreria estandar de Python. No hay red neuronal, tokenizador ni pesos distribuidos en el repositorio. La logica de puntuacion reside en el servicio remoto; el repositorio solo aporta el envoltorio de integracion.

Los umbrales que aplica el servicio (los ocho indicadores estructurales y el suelo de ritmo de frase `CV = sigma / mu >= 0,32`) provienen, segun la model card, de un estudio medido sobre 134.522 publicaciones organicas de 1.499 perfiles de fundadores. No se documenta en la informacion disponible el modelo subyacente que realiza la clasificacion ni el detalle del dataset de entrenamiento. Existe tambien una variante de puntuacion local y completamente offline distribuida como paquete `grai-mcp` en PyPI, invocable con `uvx --from grai-mcp grai-gate-mcp`.

## Capacidades

- Puntuacion de cadencia de un borrador de texto con salida JSON: `score` (0 a 100), `cv` (varianza de ritmo de frase), `pass` (true, false o null) y `flags` con los fragmentos exactos que incumplen cada regla.
- Deteccion de ocho indicadores estructurales de texto generado por IA: marcadores de vocabulario de modelo, adverbios superficiales, paralelismo en tricolon, relleno de contraste, densidad de pasiva, monotonía de longitud de frase, patrones de titulos de IA y aperturas aduladoras.
- Integracion nativa con agentes smolagents mediante `CodeAgent` y `InferenceClientModel`, permitiendo que un agente puntue y reescriba borradores en un solo flujo.
- Llamada HTTP sin autenticacion: no requiere clave de API, cuenta ni configuracion.
- Opcion de ejecucion local y offline mediante el paquete `grai-mcp` en PyPI.
- No incluye generacion de texto, razonamiento general, codigo, matematicas ni vision: esas capacidades dependen del modelo que use el agente que invoca la herramienta.

## Casos de uso

- Control de calidad editorial en pipelines de contenido: un agente smolagents puntua cada borrador antes de publicarlo y reescribe automaticamente los fragmentos marcados en `flags` hasta superar el umbral de cadencia.
- Ajuste de voz de marca para fundadores y creadores: la herramienta permite comparar un borrador con el perfil de cadencia medido de una persona concreta y detectar desviaciones estilisticas antes del envio.
- Filtrado de propuestas generadas por LLM en flujos de escritura asistida: se integra como paso de validacion entre la generacion y la entrega al usuario final, reduciendo la salida con ritmo monótono.
- Auditoria de textos de marketing y newsletters: la deteccion de titulos generados por IA y aperturas aduladoras resulta util para revisar asuntos de correo y encabezados antes de un envio masivo.
- Integracion en agentes de investigacion o redaccion multi-paso: dentro de un `CodeAgent`, el agente puede invocar la herramienta tras cada iteracion de reescritura y usar `cv` como criterio de parada.
- Verificacion en entornos con requisitos de privacidad: al procesarse el texto en RAM volatil del servidor y no almacenarse, encaja en flujos donde el borrador no debe persistir; la variante `grai-mcp` permite ademas ejecucion completamente offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita un estudio de 134.522 publicaciones de 1.499 perfiles de fundadores como base de los umbrales, pero no se aportan metricas de precision, recall ni comparaciones con detectores alternativos.

## Requisitos de hardware

- No requiere GPU: la herramienta es un envoltorio HTTP en Python sin inferencia local.
- Requiere el paquete `smolagents` y conectividad de red hacia `https://grai.page/api/mcp` para el modo remoto.
- El modo offline (`grai-mcp` via `uvx`) se ejecuta en CPU; no se documentan requisitos de memoria ni latencia en la informacion disponible.
- El consumo de recursos del agente depende del modelo que se configure en `InferenceClientModel` o del modelo local que se use como cerebro del agente.
- Opciones de despliegue: copia directa de `grai_gate_tool.py` junto al codigo del agente, clonado del repositorio de Hugging Face, o instalacion del paquete `grai-mcp` desde PyPI.

## Comparativa con modelos similares

| Herramienta | Tipo | Parametros | Contexto | Licencia | Precio |
|---|---|---|---|---|---|
| grai-smolagents-tool | Tool smolagents sobre MCP remoto | No aplica | No disponible | MIT | Puntuacion gratuita; planes de pago desde 19 USD |
| grai-mcp (PyPI) | Paquete MCP local/offline | No aplica | No disponible | No disponible | No disponible |
| Detectores de texto IA genericos | Modelos clasificadores | No disponible | No disponible | Variable | Variable |

No se dispone de datos de rendimiento comparativo con otras herramientas de deteccion de texto generado por IA en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; solo puntua borradores existentes mediante un servicio externo.
- El modo remoto envia el texto del borrador a servidores de terceros (grai.page); aunque la model card afirma que se procesa en RAM volatil y no se almacena, conviene validarlo antes de usar en produccion con datos sensibles.
- La puntuacion devuelve `pass: null` cuando el borrador es demasiado corto, lo que exige gestionar ese caso en el agente.
- Los umbrales de deteccion se derivan de un corpus de publicaciones de fundadores; su validez fuera de ese dominio (texto tecnico, legal, cientifico) no esta documentada.
- No se especifican idiomas soportados; la deteccion estilistica podria no funcionar igual en castellano que en ingles.
- Riesgo de falsos positivos: textos humanos con estilo uniforme o con estructuras de tricolon podrian superar los umbrales y ser marcados.
- El servicio depende de la disponibilidad y del modelo de precios de grai.page; las funciones avanzadas (perfiles Voice DNA, sellos criptograficos) son de pago.
- No hay datos de benchmarks ni de validacion independiente de la precision del detector.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AdrianMPeticila/grai-smolagents-tool
- Producto grai: https://grai.page
- Guia de instalacion para agentes: https://grai.page/install.md
- Documentacion MCP: https://grai.page/mcp
- Metodologia: https://grai.page/methodology
- Precios: https://grai.page/pricing/
- smolagents (GitHub): https://github.com/huggingface/smolagents
- Paquete grai-mcp en PyPI: https://pypi.org/project/grai-mcp/
