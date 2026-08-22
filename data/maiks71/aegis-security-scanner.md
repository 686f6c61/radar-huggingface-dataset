# Maiks71/aegis-security-scanner

## Resumen

Aegis Security Scanner es una herramienta de reconocimiento y análisis de seguridad web escrita en Python, publicada en HuggingFace por el usuario Maiks71. No se trata de un modelo de inteligencia artificial, sino de un escáner de código abierto diseñado para entornos de pruebas autorizadas, laboratorios y auditorías de seguridad controladas. Su objetivo es descubrir la estructura de una aplicación web, identificar endpoints, parámetros, métodos HTTP y posibles indicadores de vulnerabilidades como IDOR, SSRF o redirecciones abiertas, generando informes estructurados en JSON o HTML.

La herramienta se distribuye bajo licencia Apache-2.0 según la ficha de HuggingFace (aunque el README indica MIT) y está pensada para desarrolladores e investigadores de seguridad que necesitan una solución ligera y de código abierto para el análisis preliminar de aplicaciones propias o con permiso explícito. Su relevancia radica en que ofrece un flujo de trabajo completo de reconocimiento y análisis de candidatos a vulnerabilidad sin depender de servicios externos ni de modelos de IA, lo que la hace útil en entornos aislados o con requisitos de privacidad.

Aunque el repositorio no proporciona detalles sobre arquitectura de modelo, parámetros o entrenamiento (por no ser un modelo), la herramienta implementa un pipeline de análisis por fases: reconocimiento, rastreo, análisis de parámetros, análisis de seguridad y generación de informes. Está pensada para ejecutarse en Python 3.9 o superior y requiere únicamente conexión a internet para los objetivos autorizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (herramienta de software, no modelo de IA) |
| Parametros totales | No aplicable |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (interfaz en ingles, sin especificacion multilingue) |
| Licencia | Apache-2.0 (segun HuggingFace) / MIT (segun README) |
| Formato de pesos | No aplicable (codigo fuente Python) |

## Arquitectura y entrenamiento

Aegis Security Scanner no es un modelo entrenado, sino una aplicacion de consola que sigue un flujo de trabajo secuencial de analisis de seguridad. Su arquitectura se compone de modulos que realizan reconocimiento (resolucion DNS, descubrimiento de subdominios, servicios HTTP), rastreo web (crawling de paginas, formularios y JavaScript), analisis de parametros (deteccion de parametros tipo ID, URL o redireccion) y analisis de seguridad (cabeceras HTTP, CORS, cookies, metodos HTTP, divulgacion de informacion). El resultado se consolida en un informe con hallazgos clasificados por severidad (INFO, LOW, MEDIUM, HIGH, CRITICAL).

No existe informacion sobre datos de entrenamiento, tokens o procesos de RLHF/DPO, ya que no se trata de un modelo de lenguaje. La herramienta se distribuye como codigo fuente y depende de bibliotecas de Python especificadas en `requirements.txt`. Su diseno es modular y extensible, con un roadmap que contempla mejoras en crawling, descubrimiento de APIs, gestion de alcance, deduplicacion de hallazgos y arquitectura de plugins.

## Capacidades

- Reconocimiento de objetivos: analisis de URL, descubrimiento de endpoints dentro del mismo alcance, rastreo web, descubrimiento de parametros y endpoints en JavaScript.
- Identificacion de servicios HTTP y resolucion DNS.
- Inspeccion de metodos HTTP (GET, POST, PUT, DELETE, etc.) y metadatos asociados.
- Deteccion de candidatos a vulnerabilidades: IDOR, SSRF, open redirect, cabeceras de seguridad ausentes, configuracion CORS, problemas de cookies, divulgacion de cabeceras de servidor e indicadores de divulgacion de informacion.
- Generacion de informes estructurados en JSON o HTML con hallazgos, severidad, prioridad y limitaciones del escaner.
- Distincion entre indicador y vulnerabilidad confirmada: los hallazgos se marcan como "candidatos" y requieren validacion manual.
- Uso exclusivo en entornos autorizados: aplicaciones propias, laboratorios, CTF, pruebas de penetracion con permiso y educacion en seguridad.

## Casos de uso

- Auditoria de seguridad de aplicaciones propias: un desarrollador puede ejecutar el escaner contra su aplicacion en desarrollo para detectar endpoints expuestos, parametros peligrosos o cabeceras de seguridad ausentes antes de publicar.
- Entornos de laboratorio y CTF: los participantes pueden usarlo para mapear rapidamente la superficie de ataque de una maquina virtual o un reto, identificando rutas y parametros relevantes.
- Pruebas de penetracion autorizadas: un consultor de seguridad puede emplearlo como herramienta de reconocimiento inicial para documentar la estructura de la aplicacion y generar un informe preliminar que luego se valida manualmente.
- Educacion en seguridad ofensiva: instructores pueden demostrar conceptos como IDOR, SSRF o problemas de CORS utilizando el escaner sobre aplicaciones vulnerables disenadas para practica.
- Integracion en pipelines de CI/CD: aunque no esta disenado como modulo de CI, su salida JSON permite integrarlo en flujos automatizados de analisis de seguridad para aplicaciones internas.
- Analisis de configuracion de servidores: el modulo de inspeccion de cabeceras y metodos HTTP ayuda a verificar politicas de seguridad en servidores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una herramienta de software y no de un modelo de IA, no existen metricas de rendimiento como MMLU, HumanEval o GSM8K. El rendimiento del escaner depende del tamano del objetivo, la cantidad de endpoints y la velocidad de red, pero no se proporcionan datos cuantitativos.

## Requisitos de hardware

- Python 3.9 o superior.
- Conexion a internet para los objetivos autorizados.
- No requiere GPU ni hardware especializado; puede ejecutarse en cualquier maquina con Python instalado, incluyendo equipos de bajo consumo.
- Memoria RAM: no se especifica, pero al ser una herramienta de consola ligera, se estima que funciona con menos de 512 MB para objetivos pequenos.
- Opciones de despliegue: ejecucion directa con `python3 main.py`; no se mencionan contenedores ni servicios de inferencia.
- Latencia y throughput: no disponibles; dependen del objetivo y de la red.

## Comparativa con modelos similares

No disponible. Aegis Security Scanner no es un modelo de IA, por lo que no es comparable con modelos de lenguaje o de vision. En el ambito de herramientas de escaneo de seguridad web, existen alternativas como OWASP ZAP, Nikto o Burp Suite Community, pero no se dispone de datos comparativos en la informacion proporcionada. Se recomienda evaluar cada herramienta segun las necesidades especificas del proyecto.

## Limitaciones y advertencias

- No es un modelo de IA: no realiza analisis semantico ni utiliza aprendizaje automatico; sus detecciones se basan en reglas heuristicas.
- Los hallazgos son candidatos, no vulnerabilidades confirmadas: requieren validacion manual por un profesional de seguridad.
- Alcance limitado: no incluye autenticacion, pruebas de explotacion ni analisis profundo de logica de negocio.
- Riesgo de falsos positivos: parametros que parecen aceptar URLs o IDs pueden no ser vulnerables realmente.
- Uso exclusivo con autorizacion: escanear sistemas sin permiso puede ser ilegal y contrario a la etica profesional.
- Discrepancia de licencia: HuggingFace indica Apache-2.0, mientras que el README menciona MIT; conviene verificar el archivo LICENSE del repositorio.
- Sin soporte multilingue documentado: la interfaz y los informes estan en ingles.
- No se proporcionan garantias de rendimiento ni de cobertura completa de vulnerabilidades.

## Enlaces

- HuggingFace: https://huggingface.co/Maiks71/aegis-security-scanner
- Repositorio de GitHub (placeholder en README): https://github.com/YOUR_USERNAME/aegis-security-scanner.git (no verificado)
- Resultados de busqueda web (otros proyectos con el mismo nombre, no relacionados):
  - Aegis — Pre-Deployment Security Scanner for AI Systems: https://github.com/OptimistOtaku/aegis-scanner
  - Aegis AI Security Scanner: https://www.aegis-scanner.com/
  - Aegis — Adversarial security testing for AI models and agents: https://aegisprotect.ai/
  - Aegis AI Security Scanner - Visual Studio Marketplace: https://marketplace.visualstudio.com/items?itemName=wen-zai.aegis-ai-security
  - Aegis-AI - Red Hat Product Security Agent: https://github.com/RedHatProductSecurity/aegis-ai
