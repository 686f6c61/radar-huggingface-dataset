# naman8485/stock_scans

## Resumen

`naman8485/stock_scans` no es un modelo de lenguaje en el sentido habitual, sino un repositorio publicado en Hugging Face que contiene el codigo fuente de una aplicacion de escritorio denominada StockPulse India. Se trata de un terminal de inteligencia financiera orientado a los mercados de renta variable indios (NSE y BSE) que agrega comunicaciones corporativas oficiales, transcripciones de llamadas de resultados y emisiones de YouTube relacionadas con conference calls. El repositorio esta etiquetado con `region:us` y no declara pipeline, licencia ni idiomas.

La aplicacion se construye sobre un backend FastAPI en Python 3.12 con scrapers asincronos para NSE India, Trendlyne y feeds XML de YouTube, y un frontend de pagina unica con Tailwind CSS. Incluye un modulo de analisis de sentimiento de transcripciones basado en coincidencia de patrones NLP con `pypdf`, que clasifica fragmentos en positivos y negativos y calcula un ratio agregado alcista/neutral/bajista. No se publican pesos, checkpoints ni artefactos de modelo entrenado en la informacion disponible.

Por tanto, la ficha se limita a documentar el contenido real del repositorio: una herramienta de agregacion y analisis heuristico de informacion financiera, sin parametros, contexto ni benchmarks de modelo. Cualquier dato propio de un modelo fundacional (arquitectura, cuantizacion, licencia de pesos) figura como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene una aplicacion FastAPI, no un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; el contenido son archivos `.py`, `.html`, `.js`, `.css` y `.bat`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado. La arquitectura descrita en la model card corresponde a una aplicacion web: backend FastAPI con caching asincrono y motores de scraping en segundo plano, y frontend estatico en HTML/JS/CSS con Tailwind CSS y Lucide Icons. Los componentes principales son `nse_scraper.py` (API de comunicaciones corporativas de NSE India con gestion de sesion y cookies), `trendlyne_scraper.py` (datos de conference calls y noticias corporativas), `youtube_scraper.py` (parseo de feeds RSS XML de los canales `@concall_in` y `@ConCall.Inc5`) y `transcript_analyzer.py` (extraccion de texto PDF con `pypdf` y coincidencia de patrones NLP para sentimiento financiero).

No se documenta ningun proceso de entrenamiento, dataset, RLHF, DPO ni innovacion de inferencia. El analisis de sentimiento se realiza mediante reglas y patrones lexicos sobre el texto extraido de PDFs y transcripciones, no mediante un modelo generativo. No hay informacion sobre volumen de datos, composicion del corpus ni metodologia de evaluacion.

## Capacidades

- Agregacion en tiempo real de comunicaciones corporativas de NSE India y BSE India, con categorizacion automatica en resultados financieros, conference calls y transcripciones, dividendos, reuniones de consejo, acciones corporativas y pedidos/contratos/adquisiciones.
- Visor y descarga directa de PDF desde el terminal, con enlaces a los archivos oficiales de los exchanges.
- Integracion de feeds de conference calls de Trendlyne con ticker, nombre de compania, precio de mercado actual, variacion intradia y puntuaciones de durabilidad, valoracion y momentum codificadas por color.
- Analisis bajo demanda de transcripciones de resultados: separacion de puntos positivos (crecimiento de ingresos, expansion de margenes, reduccion de deuda) y negativos (inflacion de costes, contraccion de margenes, tension de capital circulante), medidor de sentimiento agregado 0-100 %, extraccion de citas de direccion y de metricas cuantitativas (porcentajes y cifras en crore).
- Hub de YouTube con reproduccion embebida de emisiones de conference calls, filtrado por canal y busqueda por ticker o trimestre.
- Actualizacion automatica configurable (30 s, 60 s, 2 min o manual), alertas sonoras mediante Web Audio API y busqueda global unificada por ticker, compania, trimestre y tema.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, capacidades multimodales ni modo de pensamiento.

## Casos de uso

- Seguimiento de comunicaciones regulatorias: un analista puede mantener abierto el terminal con refresco cada 30 s para recibir en tiempo casi real los filings de NSE y BSE y filtrar por categoria (resultados, dividendos, acciones corporativas) sin navegar manualmente por los portales de los exchanges.
- Preparacion de la temporada de resultados: el analizador de transcripciones permite pegar la URL de un PDF o el texto de una conference call y obtener en segundos un desglose de drivers positivos y negativos, util para construir una nota de inversion preliminar.
- Monitorizacion de sentimiento de management: la extraccion de citas de CEO/CFO y el medidor alcista/neutral/bajista permiten comparar el tono de una compania entre trimestres y detectar cambios de discurso.
- Seguimiento de conference calls en video: el hub de YouTube con reproduccion embebida evita cambiar de aplicacion durante el seguimiento de una llamada de resultados, con filtrado por canal y trimestre (por ejemplo, Q2 FY27).
- Alertas operativas para mesas de trading: las notificaciones sonoras ante nuevas comunicaciones y la busqueda global por ticker reducen el tiempo de reaccion ante anuncios materiales.
- Prototipado interno de herramientas financieras: al ser una aplicacion Python autocontenida con `run.bat` y `run.py`, sirve como base para equipos que quieran extender los scrapers o sustituir el analizador heuristico por un modelo de lenguaje propio.
- Investigacion sobre extraccion de informacion de PDFs financieros: el modulo `transcript_analyzer.py` puede reutilizarse como referencia de pipeline `pypdf` + patrones para experimentos de NLP financiero en hindi-ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluacion cuantitativa del analizador de sentimiento (precision, recall, F1) ni metricas de latencia o throughput de los scrapers.

## Requisitos de hardware

- No aplica VRAM de inferencia de modelo: la aplicacion no carga pesos neuronales.
- Entorno de ejecucion: Python 3.12 con entorno virtual `.venv`, dependencias en `requirements.txt` (FastAPI, `pypdf`, librerias de scraping y parseo XML).
- CPU y RAM: no se especifican requisitos minimos; por la naturaleza de los scrapers y el parseo de PDFs, un equipo de escritorio convencional es suficiente, aunque no se dispone de cifras oficiales.
- GPU: no se requiere GPU para ninguna de las funciones descritas.
- Despliegue: ejecucion local mediante `run.bat` (Windows) o `python run.py`, con servidor en `http://127.0.0.1:8000`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no existir modelo que servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido de parametros o contexto, ya que el repositorio no publica un modelo. Como referencias funcionales del mismo dominio (escaneo y analisis de acciones con IA) la busqueda web devuelve Scanr.ai (https://scanr.ai/), un escaner de acciones con generacion de ideas de trading y alertas push, y un workflow de n8n para trading automatizado con analisis tecnico y Alpaca (https://n8n.io/workflows/7240-automate-stock-trades-with-ai-driven-technical-analysis-and-alpaca-trading/). Ambos son productos o plantillas de automatizacion, no modelos, y no se dispone de datos para una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA entrenado; la etiqueta de Hugging Face puede inducir a confusion a quien espere pesos o un pipeline de inferencia.
- No se declara licencia, lo que impide determinar si el uso comercial, la redistribucion o la modificacion estan permitidos; en ausencia de licencia explicita debe asumirse ausencia de permisos claros.
- El analisis de sentimiento se basa en coincidencia de patrones lexicos, no en un modelo semantico: es probable que pierda negaciones, ironia, contexto discursivo y terminologia no contemplada en los patrones.
- Dependencia de scraping de sitios de terceros (NSE, BSE, Trendlyne, YouTube): cambios en la estructura HTML, en las APIs o en las politicas de acceso pueden romper los scrapers sin previo aviso, y el uso de scraping puede infringir los terminos de servicio de dichos sitios.
- Los feeds RSS de YouTube y las APIs de los exchanges pueden imponer limites de frecuencia o bloqueos por IP; no se documenta gestion de rate limiting mas alla de la sesion y cookies de NSE.
- Riesgo de informacion desactualizada o incompleta: la herramienta agrega datos de terceros y no verifica su exactitud; no debe usarse como unica fuente para decisiones de inversion.
- No hay soporte documentado de autenticacion, multiusuario ni despliegue en produccion; el diseno es de ejecucion local en Windows.
- No se han publicado evaluaciones de sesgo, alucinacion o robustez, al no existir componente generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/naman8485/stock_scans
- NSE India: https://www.nseindia.com/
- BSE India: https://www.bseindia.com/
- Trendlyne Conference Calls: https://trendlyne.com/conference-calls/
- Canal de YouTube Concall: https://www.youtube.com/@concall_in/videos
- Canal de YouTube ConCall.Inc5: https://www.youtube.com/@ConCall.Inc5/videos
- Scanr.ai (referencia funcional del dominio): https://scanr.ai/
- Workflow n8n de trading con IA y Alpaca (referencia funcional del dominio): https://n8n.io/workflows/7240-automate-stock-trades-with-ai-driven-technical-analysis-and-alpaca-trading/
