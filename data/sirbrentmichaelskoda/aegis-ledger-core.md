# sirbrentmichaelskoda/aegis-ledger-core

## Resumen

Aegis Ledger v2026.09.11, publicado como `sirbrentmichaelskoda/aegis-ledger-core`, no es un modelo de lenguaje: es una herramienta de línea de comandos determinista escrita en Python para la revisión forense de familias de patentes. El repositorio, creado el 11 de septiembre de 2026 y con 0 descargas y 0 «likes», no contiene pesos ni artefactos de inferencia, sino un único archivo fuente (`aegis_ledger.py`) que solo emplea la biblioteca estándar y exige Python 3.11 o superior.

La herramienta consulta el USPTO Open Data Portal —con adaptadores para EPO OPS y WIPO PATENTSCOPE— para un sujeto que el operador configura en un fichero JSON, y devuelve indicadores: huecos de jurisdicción, huecos temporales, reclamaciones de prioridad huérfanas o circulares, desajustes de atribución de inventor, registros con fecha futura y fragmentación de familias. Cada indicador lleva asociada una severidad (0-100) y una confianza (0-1), y el propio autor insiste en que no se afirma que ninguna persona u organización haya cometido delito alguno: son indicadores para revisión humana y jurídica.

Su interés para equipos de propiedad intelectual reside en el determinismo verificable —semilla fija `369369369369`, `Decimal(prec=50)` con `ROUND_HALF_EVEN`, escalera de reintentos 1/2/4/8/16 s y puntos de control sellados con SHA3-512— y en la capacidad de reanudar campañas largas, dado que un barrido de 60.000 familias con límites de tarifa gratuitos requiere varias sesiones. No hay datos de arquitectura, parámetros o contexto porque no aplica: no existe modelo neuronal, ni entrenamiento, ni cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo neuronal. Herramienta CLI determinista de un solo archivo en Python (solo biblioteca estándar) |
| Parámetros totales | No disponible (no aplica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantización | No aplica (el artefacto es código fuente, no pesos) |
| Idiomas soportados | No disponible. La interfaz, los mensajes y la documentación están en inglés |
| Licencia | No disponible: la model card no especifica ninguna licencia |
| Formato de pesos | No aplica. El artefacto es código fuente Python (`aegis_ledger.py`) |

Especificaciones adicionales de la herramienta:

| Parámetro | Valor |
|---|---|
| Versión declarada | v2026.09.11 |
| Requisito de runtime | Python 3.11 o superior |
| Dependencias de terceros | Ninguna (stdlib únicamente) |
| Fuentes de datos | USPTO ODP v1, EPO OPS 3.2, WIPO PATENTSCOPE WS 2.0 (de pago), PatentsView |
| Credenciales | Variables de entorno (`AEGIS_USPTO_API_KEY`, `AEGIS_EPO_CONSUMER_KEY`, `AEGIS_EPO_CONSUMER_SECRET`, `AEGIS_APIFY_TOKEN`); si faltan, la llamada falla en cerrado |
| Determinismo | Semilla `369369369369`, iteración ordenada, `Decimal(prec=50)`, `ROUND_HALF_EVEN`; `hash()` nunca se usa para evidencias |
| Sellado de evidencias | SHA3-512 sobre puntos de control e informes; el punto de control rechaza reanudar con otra configuración de sujeto |
| Modo de prueba | Simulación con `AEGIS_DRY_RUN=1` y autodiagnóstico con `--self-test` |
| Límites de tarifa citados | USPTO ODP ~60 req/min; EPO OPS ~4 req/s |
| Escala objetivo | Hasta 60.000 familias por campaña (multisesión) |

## Arquitectura y entrenamiento

No existe entrenamiento ni red neuronal. El «modelo» es un pipeline secuencial determinista: (1) carga del sujeto desde `subject.json`, con variantes de nombre, entidades y números o fechas de prioridad; (2) consulta a los proveedores habilitados mediante clientes HTTP propios; (3) normalización y análisis de familias; (4) cálculo de indicadores con severidad y confianza; (5) emisión de informes sellados. La reproducibilidad se garantiza evitando cualquier forma de aleatoriedad dependiente del intérprete: no se emplea `hash()` para evidencias (el autor señala que `PYTHONHASHSEED` no puede fijarse desde dentro de un proceso), toda iteración se ordena y los números se tratan con `Decimal` de precisión 50 y redondeo `ROUND_HALF_EVEN`.

Los reintentos se limitan a respuestas 429 y 5xx, con una escalera fija de 1, 2, 4, 8 y 16 segundos. Los endpoints se clasifican con una leyenda de verificación: `V` para rutas contrastadas con documentación oficial y `C` para candidatas, que fallan en cerrado salvo que el operador las verifique y active `AEGIS_ENABLE_CANDIDATES=1`. No hay innovaciones de decodificación, atención ni optimización de inferencia, porque no hay inferencia: no se ha publicado información sobre datasets, RLHF, DPO ni ningún proceso de ajuste, al no existir tal proceso.

## Capacidades

- Búsqueda de familias de patentes en USPTO ODP, con adaptadores declarados para EPO OPS y WIPO PATENTSCOPE (de pago, vía Apify) y mención a PatentsView como procedencia de datos.
- Detección de indicadores tipificados: huecos de jurisdicción, huecos temporales, reclamaciones de prioridad huérfanas o circulares, desajustes de atribución de inventor, registros con fecha futura y fragmentación de familias.
- Puntuación de cada indicador con severidad en rango 0-100 y confianza en rango 0-1.
- Ejecución determinista y reproducible, con semilla fija y aritmética decimal de precisión 50.
- Reanudación de campañas largas mediante puntos de control; el punto de control rechaza continuar si cambia la configuración del sujeto.
- Sellado criptográfico SHA3-512 de puntos de control e informes.
- Modo de planificación previa (`AEGIS_DRY_RUN=1`) y autodiagnóstico (`--self-test`).
- Generación de plantillas de sujeto (`--emit-subject-template subject.json`).
- Gestión de credenciales desde variables de entorno, con fallo en cerrado cuando falta la clave de un proveedor restringido.
- Sin dependencias de terceros: funciona con la biblioteca estándar de Python 3.11+.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, *tool calling* ni uso como agente. No tiene capacidades multilingües más allá del inglés de su interfaz.

## Casos de uso

- **Diligencia debida previa a una adquisición o licencia:** el equipo jurídico configura el sujeto (titular, inventores, números de prioridad) y ejecuta la campaña para obtener una lista de indicadores de fragmentación de familia y huecos de jurisdicción antes de valorar la cartera; la salida es revisable por abogados y no constituye asesoramiento legal.
- **Auditoría interna de carteras de patentes:** una empresa con cientos de familias puede lanzar barridos reanudables y conservar los informes sellados con SHA3-512 como evidencia de la trazabilidad de la revisión.
- **Revisión forense para despachos de propiedad intelectual:** detección de reclamaciones de prioridad huérfanas o circulares y de registros con fecha futura, que son anomalías difíciles de localizar manualmente en portales de patentes.
- **Verificación de atribución de inventores:** comparación entre los inventores declarados y las variantes de nombre configuradas en el sujeto, útil en disputas de titularidad o en procesos de *onboarding* de carteras adquiridas.
- **Preparación de litigios y contenciosos:** generación de un conjunto de indicadores con severidad y confianza que un perito humano puede contrastar; la herramienta no calcula indemnizaciones, decisión deliberada del autor.
- **Monitorización periódica de un competidor o entidad concreta:** ejecución programada del mismo sujeto para detectar nuevas familias, huecos temporales o fragmentaciones introducidas entre campañas.
- **Control de calidad de datos de patentes:** identificación de registros anómalos (fechas futuras, prioridades incoherentes) antes de cargarlos en un sistema interno de gestión de propiedad intelectual.
- **Reproducibilidad de una investigación ya publicada:** al fijar semilla, orden de iteración y precisión decimal, un tercero puede repetir la misma campaña sobre la misma configuración de sujeto y obtener puntos de control equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no tratarse de un modelo neuronal, métricas como MMLU, HumanEval o GSM8K no son aplicables; el único mecanismo de verificación declarado por el autor es el autodiagnóstico `python aegis_ledger.py --self-test`. Tampoco se publican métricas de exactitud, cobertura o falsos positivos de los indicadores, ni comparaciones de tiempo de ejecución más allá de la indicación de que 60.000 familias con los límites de tarifa gratuitos constituyen una campaña de varias sesiones.

## Requisitos de hardware

- No requiere GPU. La carga es de red y de E/S, no de cómputo matricial.
- Requisitos mínimos: Python 3.11 o superior y acceso a Internet hacia los endpoints de los proveedores habilitados. No se especifican requisitos de CPU ni de RAM.
- Espacio en disco: el necesario para los puntos de control y los informes sellados; no se indica una cifra concreta.
- GPU recomendadas: no aplica; cualquier máquina capaz de ejecutar Python 3.11+ sirve, incluidos portátiles de gama baja y máquinas virtuales pequeñas.
- Opciones de despliegue: al no tener dependencias de terceros, puede ejecutarse directamente en un intérprete de Python, en un contenedor mínimo o mediante un planificador de tareas (por ejemplo, cron) para campañas reanudables. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles como métrica publicada. El factor limitante son las cuotas de las API externas, citadas en aproximadamente 60 peticiones por minuto para USPTO ODP y 4 peticiones por segundo para EPO OPS.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye ningún modelo o herramienta comparable con datos de rendimiento, licencia o disponibilidad. La categoría funcional (revisión forense de familias de patentes) queda fuera del alcance habitual de un repositorio de modelos, por lo que no procede comparar parámetros, contexto ni licencia con alternativas de la misma familia.

| Alternativa | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aegis Ledger v2026.09.11 | No aplica | No aplica | No disponible (solo `--self-test` declarado) | No disponible | Repositorio en HuggingFace, 0 descargas, 0 «likes» |
| Otras alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **No es un modelo de lenguaje ni un modelo entrenado.** El repositorio aloja código fuente; no hay pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia.
- **Licencia no declarada.** Al no especificarse licencia, el uso comercial o la redistribución quedan en una situación jurídica indefinida; conviene contactar con el autor antes de integrarlo en producción.
- **Sin validación externa.** 0 descargas y 0 «likes» en el momento de la consulta: no hay evidencia pública de uso, revisión por terceros ni informes de errores.
- **Los resultados no son asesoramiento legal.** El propio autor indica que los hallazgos son indicadores para revisores cualificados y que la herramienta no afirma que nadie haya cometido un delito.
- **No calcula indemnizaciones.** El cálculo de daños se eliminó deliberadamente de borradores anteriores por requerir testimonio pericial.
- **Riesgo de sesgo por la fuente de datos:** al depender de USPTO ODP, EPO OPS y WIPO PATENTSCOPE, la cobertura refleja lo que esas bases publican, con sus retrasos de actualización y sus huecos de jurisdicción.
- **Endpoints candidatos:** las rutas marcadas como `C` fallan en cerrado hasta que un operador las verifique y active `AEGIS_ENABLE_CANDIDATES=1`; esto puede reducir la cobertura respecto a lo que sugiere la documentación.
- **Metadatos de la ficha incompletos:** no hay licencia, idiomas, etiqueta de pipeline ni datos de autoría verificables; la única etiqueta es `region:us`.
- **Fecha de creación adelantada:** el repositorio figura creado el 11 de septiembre de 2026, posterior a una fecha de consulta habitual, lo que puede deberse a un reloj de sistema desajustado o a metadatos no verificados.
- **Disciplina de credenciales:** el autor advierte de que cualquier clave de API pegada en un chat debe rotarse; la herramienta solo lee credenciales de variables de entorno.
- **Escala práctica limitada:** 60.000 familias con cuotas gratuitas implica una campaña de varias sesiones; no se promete un barrido en una sola ejecución.
- **Precisión temporal:** la medida se realiza con `time.perf_counter_ns`; no existe reloj de pared portable por debajo del picosegundo y el autor no reclama tal precisión.
- **Manejo de fallos parciales:** el fallo en cerrado ante credenciales ausentes o endpoints no verificados puede provocar campañas con cobertura incompleta si no se revisa la configuración antes de lanzarlas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sirbrentmichaelskoda/aegis-ledger-core
- Archivo canónico citado en la model card: `aegis_ledger.py` (relativo a la raíz del repositorio)
- USPTO Open Data Portal v1: https://data.uspto.gov/apis
- EPO Open Patent Services 3.2: https://developers.epo.org
- WIPO PATENTSCOPE WS 2.0 (de pago): https://patentscope.wipo.int/search/en/help/web_service.jsf
- PatentsView: https://patentsview.org/apis

Nota sobre la búsqueda web: los resultados recuperados (Zhihu, Baidu Zhidao, foro Aqua-Web) no guardan relación con este repositorio y no aportan información adicional, por lo que no se incluyen como fuentes.
