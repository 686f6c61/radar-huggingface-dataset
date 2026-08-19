# davidryalpug/playa-angel

## Resumen

Playa Angel es un modelo de lenguaje de 2.600 millones de parámetros (2,6B) desarrollado por el usuario davidryalpug como una adaptación del modelo base LiquidAI/LFM2.5-2.6B de Liquid AI. Se trata de un fine-tune supervisado diseñado específicamente para integrarse en **Playa Pal**, una aplicación móvil offline destinada a asistentes personales en el evento Black Rock City (Burning Man). El modelo actúa como capa conversacional y de uso de herramientas, mientras que la aplicación se encarga de proporcionar datos actualizados (eventos, guías, packs de campamentos) mediante búsqueda local en el dispositivo.

El modelo se distribuye en formato GGUF con dos cuantizaciones (Q4_0 y Q3_K_M) para adaptarse a distintos niveles de memoria en teléfonos móviles. Su relevancia radica en ser un ejemplo de implementación de modelos de lenguaje en entornos edge con soporte de tool-use y razonamiento multi-paso, sin depender de conexión a internet. No incluye una base de datos de eventos en los pesos; toda la información factual debe provenir de las herramientas locales de la aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q3_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (safetensors no incluido, solo GGUF) |

## Arquitectura y entrenamiento

La arquitectura interna no se especifica en la documentacion publica. El modelo base, LiquidAI/LFM2.5-2.6B, pertenece a la familia LFM de Liquid AI, pero no se detalla si se trata de un transformer clasico, un modelo de estado solido (SSM) o una arquitectura hibrida. Playa Angel es un fine-tune supervisado de dicho modelo base, adaptado al estilo conversacional y al contrato de tool-use de la aplicacion Playa Pal. No se aplico ninguna fase de reinforcement learning (RLHF/DPO) en esta version. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de optimizacion empleadas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Soporte de tool calling / function calling mediante un esquema de herramientas definido por la aplicacion.
- Razonamiento multi-step para decidir cuando invocar herramientas locales de busqueda de eventos y guias.
- Respuestas fundamentadas en datos proporcionados por la aplicacion (grounded answers), aunque el modelo por si solo no puede verificar informacion sin esas herramientas.
- Ejecucion local en dispositivos con recursos limitados gracias a las cuantizaciones GGUF.

## Casos de uso

- Asistente personal offline en eventos masivos: Playa Pal usa Playa Angel para responder preguntas sobre horarios, ubicaciones y actividades del evento, consultando la base de datos local de eventos mediante tool-use.
- Consulta de guias y pasajes de referencia: el modelo puede recuperar y citar pasajes de guias oficiales almacenados en el dispositivo, proporcionando respuestas con referencias textuales.
- Gestion de informacion de campamentos: los usuarios pueden cargar "packs" de datos de campamentos y el modelo los utiliza para responder preguntas especificas sobre servicios, normas o actividades.
- Soporte de conversacion multi-turno con memoria local: la aplicacion mantiene el historial conversacional en el dispositivo, permitiendo al modelo mantener contexto a lo largo de la interaccion.
- Experimentacion con GGUF en runtimes compatibles: los pesos pueden cargarse con llama.cpp para pruebas basicas de generacion, aunque sin las herramientas de la aplicacion no se reproduce el comportamiento completo.
- Asistencia en entornos sin conectividad: al ser un modelo local, funciona en areas remotas o durante eventos donde no hay acceso a internet, como el desierto de Black Rock City.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los dos archivos fueron seleccionados mediante evaluacion a nivel de afirmacion (claim-level) para el flujo de trabajo de Playa Pal, pero no se incluye un informe de evaluacion publico y reproducible. Por tanto, no se presentan datos numericos comparativos.

## Requisitos de hardware

- Tamaños de archivo: 1,59 GB (Q4_0) y 1,37 GB (Q3_K_M).
- Disenado para ejecucion en telefonos moviles con memoria suficiente; la cuantizacion Q3_K_M esta pensada para dispositivos con menos RAM.
- Puede ejecutarse en CPU mediante llama.cpp u otros runtimes compatibles con GGUF.
- No se especifican requisitos minimos de RAM, pero al ser un modelo de 2,6B cuantizado, se estima que puede funcionar con 2-4 GB de memoria libre.
- Compatible con runtimes como llama.cpp, Ollama (si se convierte) y otros que soporten GGUF.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Playa Angel es un fine-tune especifico de un modelo base de 2,6B, y no se mencionan alternativas de la misma categoria. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo puede malinterpretar solicitudes, omitir herramientas necesarias, contradecir la evidencia recuperada o inventar detalles plausibles.
- Los pesos no contienen una base de datos de eventos actualizada; toda informacion factual debe provenir de los packs locales habilitados en la aplicacion.
- La cuantizacion puede degradar la calidad de las respuestas; la version Light (Q3_K_M) sacrifica margen de calidad por menor uso de almacenamiento y memoria.
- El soporte de dispositivos no es universal; la RAM disponible, el almacenamiento libre, la presion de memoria del sistema operativo y el soporte del runtime influyen en el rendimiento.
- No debe utilizarse como unica fuente para decisiones medicas, legales, financieras o de emergencia. En situaciones criticas, se debe contactar con los servicios de emergencia del evento.
- La licencia LFM Open License v1.0 incluye condiciones especificas para uso comercial relacionadas con los ingresos anuales; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- No se ha publicado un informe de evaluacion independiente; las afirmaciones sobre la seleccion de cuantizaciones son reportadas por el proyecto, no verificadas externamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/davidryalpug/playa-angel
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
