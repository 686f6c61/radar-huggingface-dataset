# aion-analytics-india/aion-indian-market-intelligence

## Resumen

AION Indian Market Intelligence (IMI) es un servicio de analisis de contexto financiero para los mercados de la India, publicado en Hugging Face por aion-analytics-india (AION Analytics India, fundada por Lokesh Gupta). No se distribuye como un modelo de pesos abiertos: se trata de una API alojada que recibe texto de eventos financieros, economicos o de politica (un titular obligatorio y, opcionalmente, cuerpo del articulo y fecha de publicacion) y devuelve contexto estructurado sobre sectores y grupos de interes del mercado indio. El repositorio de Hugging Face (0,5 GB) actua como punto de documentacion y distribucion del cliente, no como contenedor de pesos.

El modelo resuelve un problema concreto: en lugar de una etiqueta de polaridad binaria (positiva o negativa), IMI devuelve un vector de sectores con valores con signo, un contexto macro y vistas de grupos de interes (productor, intermediario, inversor, gobierno/fiscal y comercio internacional). Esta orientacion hacia la estructura del mercado indio es su principal diferenciador frente a clasificadores genericos de sentimiento financiero. La API no obtiene noticias ni fuentes regulatorias por si misma: el contenido lo aporta siempre el llamante.

Es relevante ahora porque encaja en flujos de enriquecimiento de LLM y RAG, monitorizacion de comunicados del RBI, SEBI y del gobierno, y agentes de IA mediante un wrapper MCP. La licencia es propietaria y de solo API alojada, con un plan gratuito limitado a 10 peticiones exitosas por ventana movil de 30 dias. La informacion publica no detalla arquitectura interna, numero de parametros ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servicio alojado; no se publican detalles del modelo subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la entrada es un titular y un cuerpo opcional; no se documenta limite de tokens) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | ingles (en) e hindi (hi) |
| Licencia | propietaria, solo API alojada (license_name: proprietary-hosted-api-only; el wrapper MCP es AGPL-3.0-or-later) |
| Formato de pesos | no disponible (no hay pesos publicados; el paquete Python y el wrapper MCP llaman a la API) |

## Arquitectura y entrenamiento

No se publica informacion sobre la arquitectura interna del modelo subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card describe exclusivamente la interfaz del servicio: un endpoint `POST https://api.aionanalytics.in/v1/analyze` que acepta un objeto JSON con `headline` (obligatorio), `body` y `published_at` (opcionales), y devuelve un objeto con `headline`, `confidence`, `macro_signal` y `vix_regime` (cuando se devuelven), `sector_vector`, `top_positive_sectors`, `top_negative_sectors`, `stakeholder_views` y `cultural_context` (cuando se detecta un contexto cultural o soberano soportado).

El diseno funcional mas destacable es la sustitucion de la clasificacion de polaridad por un vector de sectores con signo y por vistas diferenciadas de grupos de interes. La documentacion insiste en que el campo `confidence` mide la confianza en la comprension del texto, no la probabilidad de un resultado de mercado, y que los identificadores internos de eventos y reglas y los campos de direccion de operacion no forman parte de la respuesta publica. No se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Analisis de texto de eventos financieros, economicos y de politica con una unica entrada por peticion (no admite lotes multi-evento).
- Generacion de un vector de sectores del mercado indio con valores con signo, junto con los sectores mas positivos y mas negativos.
- Vistas de grupos de interes: productor, comerciante/intermediario, inversor, gobierno/fiscal y comercio internacional.
- Contexto macro (`macro_signal`) y regimen de volatilidad (`vix_regime`) cuando el servicio los devuelve.
- Deteccion de contexto cultural o soberano (`cultural_context`) cuando se reconoce un contexto soportado.
- Soporte de eventos climaticos y de materias primas introducidos como texto, con cobertura incompleta y dependiente de la entrada.
- Integracion con agentes de IA mediante wrapper MCP (herramienta `analyze_news`, que devuelve `sector_vector`) y cliente Python propietario.
- Idiomas de trabajo: ingles e hindi.
- No incluye busqueda de noticias, verificacion de fuentes, mapas de cadena de suministro, modelos de riesgo de clientes, motores de escenarios, servicios de alertas ni conectores CRM.

## Casos de uso

- Enriquecimiento de LLM y RAG: almacenar el vector de sectores y las vistas de grupos de interes junto a la noticia aportada por el llamante en el sistema de recuperacion propio, de modo que el LLM disponga de contexto sectorial estructurado en lugar de una simple etiqueta de polaridad.
- Monitorizacion de politica del RBI, SEBI y del gobierno: enviar titulares y textos de fuentes propias al endpoint para obtener el vector sectorial; el servicio no ingiere ni verifica las publicaciones, por lo que la trazabilidad de la fuente queda en el sistema del cliente.
- Flujos de SaaS o CRM con conciencia sectorial: unir los valores sectoriales devueltos con las clasificaciones propias de cuentas o clientes para priorizar carteras o rutas comerciales; no existe integracion CRM nativa.
- Colas de investigacion institucional: procesar elementos de fuentes propias y encaminar los resultados a revision de analistas; la monitorizacion continua, los lotes y la generacion de informes son flujos del lado del consumidor.
- Agentes de IA: conectar el wrapper MCP con una clave de API limitada al plan para que un agente consulte el impacto sectorial de un titular como un paso mas de razonamiento multi-paso.
- Analisis de eventos climaticos o de materias primas: introducir como texto el evento y obtener contexto sectorial, asumiendo cobertura parcial y resultados dependientes de la formulacion de la entrada.
- Prototipado con el plan gratuito: validar la integracion REST o Python con 10 peticiones exitosas por ventana movil de 30 dias (hasta 10 en cualquier ventana de 24 horas) antes de pasar a un plan de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de clasificacion financiera, y advierte que el esquema de respuesta ilustrativo es una plantilla con marcadores de posicion, no un resultado de inferencia real ni una garantia de rendimiento.

## Requisitos de hardware

- No aplica VRAM de inferencia local: el modelo no se distribuye como pesos y la model card indica explicitamente que el paquete Python no incluye inferencia local ni pesos del modelo.
- No se requieren GPU (A100, H100, RTX 4090 ni otras) por parte del usuario; el computo se ejecuta en la infraestructura alojada de AION.
- El cliente solo necesita conectividad HTTPS al endpoint `https://api.aionanalytics.in/v1/analyze` y una clave de API limitada al plan.
- Opciones de despliegue: llamada REST directa, paquete Python `aion-indian-market-intelligence` (`pip install`) o wrapper MCP con `AION_API_KEY` configurada en el entorno del servidor MCP.
- Latencia y throughput: no disponibles. Los unicos limites documentados son de cuota: 10 peticiones exitosas por ventana movil de 30 dias en el plan gratuito y 3 analisis por pasada de navegador o dispositivo y 30 por red en ventana movil de 7 dias para la clave de demostracion web.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AION Indian Market Intelligence | API alojada de contexto sectorial para el mercado indio | no disponible | no disponible | en, hi | propietaria, solo API alojada | API con plan gratuito y planes de pago; cliente Python y MCP |
| Clasificadores genericos de sentimiento financiero (p. ej. FinBERT) | modelo de pesos abiertos para clasificacion de polaridad | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | principalmente en | habitualmente abierta | descarga de pesos e inferencia local |
| LLM genericos de gran escala con prompts financieros | modelo generativo de proposito general | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | multilingue | variable | API o pesos segun proveedor |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada. La diferencia documentada frente a un clasificador de polaridad es de salida y alcance (vector de sectores con signo, contexto macro y vistas de grupos de interes frente a una etiqueta positiva o negativa), no una afirmacion de mayor precision.

## Limitaciones y advertencias

- Licencia propietaria de solo API alojada: no se permite inferencia local ni redistribucion de pesos, y el uso comercial queda sujeto a los terminos del plan contratado.
- El servicio no obtiene ni verifica noticias, comunicados regulatorios ni fuentes oficiales; la calidad del resultado depende del texto aportado por el llamante.
- Una peticion procesa un unico titular; no admite feeds, webhooks, PDFs, presentaciones regulatorias, tablas ni lotes multi-evento.
- Cobertura incompleta para eventos climaticos y de materias primas, con resultados dependientes de la entrada.
- El campo `confidence` no es una probabilidad de resultado de mercado, por lo que no debe usarse como senal de trading.
- El plan gratuito esta limitado a 10 peticiones exitosas por ventana movil de 30 dias y su emision esta restringida por dispositivo y red; la clave de demostracion web no puede llamar a la API de produccion.
- El wrapper MCP devuelve solo `sector_vector`, mientras que la API REST y el cliente Python exponen la respuesta publica documentada; los campos no reconocidos deben ignorarse.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez; la informacion publica sobre el modelo subyacente es practicamente nula.
- Solo se declaran ingles e hindi como idiomas soportados, lo que limita su uso con textos en otras lenguas.
- No incluye mapas de cadena de suministro, modelos de riesgo de clientes, motores de escenarios, alertas ni conectores CRM, pese a que estos flujos se mencionan como casos de uso del lado del consumidor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aion-analytics-india/aion-indian-market-intelligence
- Space estatico en Hugging Face: https://huggingface.co/spaces/aion-analytics-india/a
- Sitio de AION Analytics India: https://aionanalytics.in/
- Catalogo de APIs y planes: https://aionanalytics.in/apis
- Acceso a la clave de demostracion web: https://aionanalytics.in/demo/key
- Endpoint de la API: https://api.aionanalytics.in/v1/analyze
