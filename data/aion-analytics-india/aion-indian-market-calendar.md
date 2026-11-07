# aion-analytics-india/aion-indian-market-calendar

## Resumen

`aion-indian-market-calendar` no es un modelo de inteligencia artificial, sino un paquete de Python publicado por AION Analytics Private Limited (India) que proporciona calendarios de mercado para las principales bolsas indias: NSE, BSE, MCX y derivados de divisas (CDS). Resuelve un problema concreto y recurrente en el desarrollo de sistemas financieros: determinar de forma fiable qué días y en qué franjas horarias operan los distintos segmentos de mercado, teniendo en cuenta que cada segmento puede tener calendarios de festivos y horarios de cierre diferentes.

La versión publicada actualmente es la 1.7.1 en PyPI (verificada el 7 de noviembre de 2026). El repositorio de Hugging Face actúa únicamente como superficie de documentación; la instalación se realiza desde PyPI mediante `pip install aion-indian-market-calendar`. El paquete está licenciado bajo MIT y su único idioma documentado es el inglés.

Es relevante para desarrolladores que construyen backends de trading, sistemas de liquidación, pipelines de datos de mercado o herramientas de análisis financiero centradas en India, ya que evita tener que mantener manualmente tablas de festivos y reglas de cierre específicas de cada exchange, con el riesgo de error que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete de Python) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion via PyPI como paquete Python) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay un modelo neuronal, ni pesos, ni proceso de entrenamiento. El paquete es una libreria de Python (`library_name: aion-indian-market-calendar`) que encapsula datos de calendario y utilidades de calculo. Los datos de calendario vienen incluidos en el paquete y permiten calculos completamente offline.

Cuando esta habilitado y permitido, el paquete puede actualizar los datos de calendario mantenidos a traves de la red, verificando el contenido de la actualizacion mediante hash antes de aplicarlo. Los calculos offline no requieren esa actualizacion. La cobertura de datos es finita, por lo que debe consultarse la documentacion del paquete y las circulares de los exchanges para conocer los rangos soportados y las reglas vigentes. Una innovacion practica destacable es la distincion explicita entre dias de negociacion y dias de liquidacion, asi como el modelado de reglas de cierre estacionales para contratos no agricolas de MCX.

## Capacidades

- Calculo de dias de negociacion y dias de liquidacion para NSE y BSE (renta variable y derivados).
- Cobertura de MCX, con reglas de cierre estacionales para contratos no agricolas soportados.
- Cobertura de derivados de divisas (NSE Currency Derivatives, CDS).
- Gestion de calendarios de festivos por segmento de exchange, reconociendo que cada segmento puede tener horarios de cierre y festivos distintos.
- Calculo offline a partir de los datos incluidos en el paquete.
- Actualizacion opcional de datos de calendario por red con verificacion de integridad mediante hash.
- No requiere clave de API.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multimodales, al no ser un modelo de lenguaje.

## Casos de uso

- Backends de trading algorítmico: el paquete permite determinar con precision si un segmento concreto (NSE equity, BSE derivatives, MCX) esta abierto antes de enviar ordenes, evitando rechazos por operar en festivo o fuera de horario.
- Sistemas de liquidacion: al distinguir entre dias de negociacion y dias de liquidacion, permite calcular fechas de settlement correctas para cada segmento, algo critico en la conciliacion financiera.
- Pipelines de datos de mercado: util para programar la ingesta de datos solo en sesiones validas, reduciendo llamadas innecesarias a proveedores y evitando huecos o duplicados en series temporales.
- Planificacion de tareas batch: los jobs nocturnos de reconciliacion, generacion de informes o calculo de riesgos pueden consultar el calendario para decidir si deben ejecutarse o posponerse al siguiente dia habil.
- Herramientas de analisis financiero para India: dashboards y aplicaciones que muestran metricas por sesion necesitan saber que sesiones existieron realmente; el paquete aporta esa base sin mantenimiento manual de tablas de festivos.
- Validacion en entornos de investigacion: investigadores que replican estudios sobre mercados indios pueden usar el paquete para alinear correctamente sus series temporales con los dias reales de negociacion de cada exchange.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni aceleracion por hardware: es un paquete de Python con calculos ligeros.
- Se ejecuta en cualquier maquina capaz de correr Python, incluidos contenedores pequenos y funciones serverless.
- No aplican estimaciones de VRAM ni requisitos de GPU (A100, H100, RTX 4090, etc.).
- Despliegue mediante instalacion estandar de Python (`pip install aion-indian-market-calendar`); no requiere vLLM, llama.cpp, Ollama ni TGI.
- La latencia y el throughput no se han publicado; al tratarse de calculos de calendario y datos incluidos, no se espera que sean un cuello de botella en produccion.

## Comparativa con modelos similares

| Paquete | Cobertura | Licencia | Distribucion | Notas |
|---|---|---|---|---|
| aion-indian-market-calendar | NSE, BSE, MCX, CDS (India) | MIT | PyPI | Distingue dias de negociacion y liquidacion; actualizacion opcional con verificacion por hash |
| pandas_market_calendars | Multiples exchanges internacionales, incluidos algunos indios | no disponible en la informacion | PyPI | No verificado en la informacion proporcionada para reglas especificas de MCX o CDS |
| exchange_calendars | Multiples exchanges internacionales | no disponible en la informacion | PyPI | No verificado en la informacion proporcionada para reglas especificas de MCX o CDS |

La comparativa se limita a la categoria funcional (calendarios de mercado); no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA ni un servicio de asesoramiento financiero; el propio autor indica que no constituye asesoramiento de inversion ni certificacion del estado de un exchange.
- La cobertura de datos es finita: deben consultarse la documentacion del paquete y las circulares de los exchanges para conocer los rangos soportados y las reglas vigentes.
- Los contratos agricolas de MCX no se modelan por contrato; solo se cubren reglas estacionales para contratos no agricolas soportados.
- Cada segmento de exchange puede tener horarios de cierre y calendarios de festivos distintos, por lo que un uso incorrecto del segmento puede producir resultados erroneos.
- La actualizacion por red es opcional y requiere que este habilitada y permitida; sin ella, los datos quedan congelados en la version instalada.
- No hay demo interactiva alojada; la validacion debe hacerse con los ejemplos ejecutables y la documentacion de la API.
- El repositorio de Hugging Face es solo documentacion; el codigo y las incidencias se gestionan en GitHub.
- Idioma de la documentacion: unicamente ingles.

## Enlaces

- Hugging Face: https://huggingface.co/aion-analytics-india/aion-indian-market-calendar
- PyPI: https://pypi.org/project/aion-indian-market-calendar/
- GitHub (codigo, issues y documentacion): https://github.com/AION-Analytics-India/aion-indian-market-calendar
- Ejemplos ejecutables: https://github.com/AION-Analytics-India/aion-indian-market-calendar/tree/main/docs/tutorials
- Pagina de producto: https://aionanalytics.in/open-source/indian-market-calendar
- Web de la empresa: https://aionanalytics.in/
- Organizacion en GitHub: https://github.com/AION-Analytics-India
- Terminos legales: https://aionanalytics.in/legal/terms
- Privacidad: https://aionanalytics.in/legal/privacy
