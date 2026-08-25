# Maiks71/authorized-recon

## Resumen

El repositorio Maiks71/authorized-recon, publicado por el usuario Maiks71 en Hugging Face, no contiene un modelo de inteligencia artificial, sino una herramienta automatizada de reconocimiento y evaluación pasiva de seguridad escrita en Python. Está diseñada para pruebas de seguridad autorizadas, programas de bug bounty y auditorías de endpoints, y realiza descubrimiento de subdominios, resolución DNS, detección de hosts vivos, extracción de endpoints y parámetros, y comprobaciones pasivas de cabeceras de seguridad, CORS, cookies y exposición de información del servidor.

El proyecto se distribuye bajo licencia MIT (aunque el YAML de Hugging Face indica apache-2.0) y genera informes en formato JSON y HTML. No se trata de un modelo con parámetros ni arquitectura neuronal, por lo que las secciones habituales de una ficha de modelo de IA no aplican. Su relevancia actual reside en el creciente interés por automatizar el reconocimiento en seguridad ofensiva de forma pasiva y no destructiva, sin depender de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (herramienta de software en Python, no un modelo de IA) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (documentacion e informes en ingles) |
| Licencia | MIT (según la model card); el YAML de Hugging Face indica apache-2.0 |
| Formato de pesos | No aplica; codigo fuente Python con dependencia `aiohttp` |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. Se trata de un script de linea de comandos (`recon.py`) que ejecuta un flujo de reconocimiento pasivo: descubrimiento de subdominios mediante datos de transparencia de certificados, resolucion DNS, deteccion de hosts vivos, descubrimiento de endpoints HTTP/HTTPS, extraccion de enlaces y parametros, y comprobaciones pasivas de seguridad. El proyecto declara que no realiza pruebas destructivas ni explotacion de vulnerabilidades.

## Capacidades

- Descubrimiento de subdominios a traves de datos de transparencia de certificados.
- Resolucion DNS de los hosts descubiertos.
- Deteccion de hosts vivos y filtrado de endpoints vivos/muertos.
- Descubrimiento de endpoints HTTP/HTTPS, incluyendo extraccion de enlaces desde HTML y endpoints desde JavaScript.
- Extraccion de parametros de consulta y deduplicacion de endpoints.
- Descubrimiento de robots.txt, sitemap, OpenAPI/Swagger y GraphQL.
- Comprobaciones pasivas de seguridad: cabeceras de seguridad ausentes, configuracion CORS permisiva, cookies sin flags Secure/HttpOnly/SameSite, informacion del servidor expuesta y endpoints interesantes de API/debug/documentacion.
- Generacion de informes en JSON y HTML, con soporte para multiples objetivos y archivos de lista de objetivos.
- Resumen combinado de escaneos.

## Casos de uso

- Reconocimiento inicial en programas de bug bounty: permite mapear la superficie de ataque de un dominio autorizado, descubriendo subdominios y endpoints antes de cualquier prueba manual.
- Auditoria de seguridad pasiva de una aplicacion web propia: el equipo de seguridad puede ejecutar el script contra sus propios servicios para detectar cabeceras de seguridad ausentes, CORS permisivo o cookies mal configuradas, sin riesgo de pruebas destructivas.
- Inventario de endpoints y parametros en un proceso de integracion continua: puede integrarse en pipelines de CI/CD para generar un inventario actualizado de endpoints expuestos tras cada despliegue.
- Deteccion de documentacion de API expuesta: el descubrimiento de OpenAPI/Swagger y GraphQL permite localizar puntos de entrada de API que podrian requerir revision manual.
- Verificacion de politicas de cookies y CORS en aplicaciones con multiples subdominios: util para comprobar de forma rapida la configuracion de seguridad de un conjunto amplio de hosts.
- Generacion de informes de cumplimiento basico: los informes HTML y JSON pueden servir como evidencia inicial en auditorias de seguridad internas, aunque los hallazgos requieren verificacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, ya que no es un modelo de IA con metricas de rendimiento (MMLU, HumanEval, etc.). El rendimiento de la herramienta depende de la velocidad de red, del numero de objetivos y de la disponibilidad de los servicios consultados.

## Requisitos de hardware

- Python 3.9 o superior.
- Conexion a internet.
- Dependencia Python: `aiohttp`.
- No requiere GPU ni VRAM; puede ejecutarse en cualquier maquina con Python, incluidos servidores modestos o contenedores.
- Despliegue tipico: linea de comandos (`python recon.py <dominio>`), sin necesidad de servidor de inferencia.
- La latencia y el throughput dependen del numero de objetivos y de las respuestas de las APIs de transparencia de certificados y de los hosts escaneados.

## Comparativa con modelos similares

No aplica, ya que no se trata de un modelo de IA. Como herramienta de reconocimiento, podria compararse con utilidades como Amass, Subfinder o httpx, pero no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El descubrimiento de subdominios depende de la informacion publica de transparencia de certificados; no se garantiza la deteccion de todos los subdominios.
- El descubrimiento de endpoints depende de enlaces, referencias JavaScript y rutas conocidas expuestas por el objetivo; puede omitir endpoints no referenciados.
- Los hallazgos pasivos son indicadores para revision manual y no deben tratarse como vulnerabilidades confirmadas.
- La herramienta esta pensada exclusivamente para sistemas propios o autorizados. El uso contra sistemas sin autorizacion puede ser ilegal.
- La licencia es MIT segun la model card, pero el metadato de Hugging Face indica apache-2.0; conviene resolver esta discrepancia antes de redistribuir.
- El proyecto no realiza pruebas destructivas, pero puede generar trafico de red que debe ajustarse a los limites de velocidad permitidos por cada programa.

## Enlaces

- Hugging Face: https://huggingface.co/Maiks71/authorized-recon
- Repositorio del autor en GitHub (asistente de IA relacionado): https://github.com/maiks71/Maiks71_MAI
- Documentacion del autor: https://github.com/maiks71/Maiks71_MAI/blob/main/documentation.txt
- Noticia sobre malware de recon generado con IA (contexto del autor): https://securityaffairs.com/195321/hacking/attacker-used-ai-to-build-custom-powershell-recon-malware.html
