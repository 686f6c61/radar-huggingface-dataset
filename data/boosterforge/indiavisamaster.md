# boosterForge/IndiaVisaMaster

## Resumen

India Visa Master no es un modelo de inteligencia artificial, sino una aplicacion de escritorio para Windows distribuida a traves de un repositorio de Hugging Face por el usuario boosterForge (Booster Forge). Se presenta como un asistente para el portal de citas del Indian Visa Application Center (IVAC) en Bangladesh, e incluye un instalador de 1,17 GB con un runtime de Python portatil, PySide6, el navegador Camoufox, datos de fingerprint, el driver de Playwright y herramientas ADB de Android. El repositorio completo ocupa 1,3 GB.

El paquete no contiene pesos de modelo, tokenizador, configuracion de arquitectura ni artefactos de inferencia. Su funcionamiento declarado es la automatizacion de un portal web de citas, con lectura automatica de OTP mediante un telefono Android conectado por USB y soporte opcional de claves de API de DeepSeek y 2Captcha, lo que sugiere el uso de servicios externos de lenguaje y resolucion de captchas en lugar de un modelo propio empaquetado.

Por tanto, esta ficha no puede evaluar capacidades de generacion, razonamiento o codigo: no hay modelo que evaluar. La relevancia del artefacto es de otra naturaleza, ligada a la automatizacion de tramites, la gestion de fingerprints de navegador y el acceso mediante clave de 16 digitos, aspectos que conviene documentar con rigor por sus implicaciones de seguridad y de cumplimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion de escritorio Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada; condiciones no detalladas en la model card) |
| Formato de pesos | no disponible (el repositorio contiene un instalador `.exe` de 1,17 GB y una captura de pantalla) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un instalador ejecutable para Windows 10/11 de 64 bits que despliega un entorno empaquetado: runtime de Python portatil, interfaz con PySide6, navegador Camoufox con datos de fingerprint, driver de Playwright y herramientas ADB de Android. El tamano instalado declarado es de aproximadamente 3,1 GB y requiere 4 GB de espacio libre en disco.

La unica integracion con IA que se menciona es opcional y externa: claves de API de DeepSeek y de 2Captcha que el usuario introduce en la aplicacion. La model card no especifica que modelo de DeepSeek se invoca, con que prompts, ni como se procesan los datos enviados a esos servicios. Tampoco se documenta ningun mecanismo de aprendizaje, ajuste fino o evaluacion.

## Capacidades

- Automatizacion del portal de citas del IVAC en Bangladesh mediante navegador controlado (Camoufox y Playwright).
- Gestion de fingerprints de navegador para las sesiones automatizadas.
- Lectura automatica de codigos OTP a traves de un telefono Android conectado por USB con depuracion habilitada (ADB).
- Integracion opcional con la API de DeepSeek, presumiblemente para tareas de lenguaje no detalladas.
- Integracion opcional con 2Captcha para resolucion de captchas.
- Activacion mediante clave de acceso de 16 digitos, exigida una vez por equipo.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni soporte multilingue propias.

## Casos de uso

- Solicitud de citas consulares en el portal IVAC: la aplicacion automatiza la navegacion y el envio de formularios en las franjas horarias en que el servicio esta operativo (sabados de 10:00 a 12:00 y de domingo a jueves de 12:00 a 17:00, hora de Asia/Dhaka).
- Monitorizacion de disponibilidad de citas: el uso de un navegador automatizado permite consultar el portal de forma periodica, aunque la model card no detalla si existe esta funcion.
- Gestion de sesiones con fingerprint persistente: util para mantener coherencia de identidad de navegador entre ejecuciones, segun los datos de fingerprint incluidos.
- Recuperacion automatica de OTP: con un Android propio conectado por USB, la aplicacion puede leer el codigo de verificacion sin intervencion manual.
- Resolucion de captchas en flujos de reserva: mediante la clave opcional de 2Captcha, para los formularios que incluyan desafios de este tipo.
- Asistencia a gestores de tramites migratorios: un despacho podria usar la herramienta para agilizar la presentacion de solicitudes de sus clientes, siempre que cada uno aporte su propia cuenta IVAC y su propio telefono.
- Soporte a tareas de lenguaje: la integracion con DeepSeek podria emplearse para redactar o revisar datos del formulario, aunque el alcance concreto no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11, 64 bits.
- Espacio en disco: 4 GB libres para la instalacion; tamano instalado aproximado de 3,1 GB.
- Memoria y GPU: no se especifican requisitos de RAM ni de GPU; al no ejecutar inferencia local, no aplican estimaciones de VRAM.
- Telefono Android con depuracion USB habilitada para la lectura automatica de OTP.
- Permisos: el instalador no requiere privilegios de administrador.
- Despliegue: instalador `.exe` autocontenido; no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de modelo.
- Latencia y throughput: no disponibles; dependen del portal IVAC y de los servicios externos opcionales.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de lenguaje ni un sistema de inferencia. Como referencia de categoria, podria compararse con herramientas de automatizacion de navegador (Selenium, Playwright con scripts propios) o con asistentes de tramites, pero la informacion proporcionada no incluye datos de rendimiento, licencia detallada ni funcionalidad verificable que permita una tabla rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni codigo de inferencia; no debe citarse como modelo en comparativas tecnicas.
- Licencia "other" sin texto: las condiciones de uso comercial, redistribucion y modificacion no estan publicadas, lo que impide evaluar su idoneidad legal.
- Requiere una clave de acceso de 16 digitos obtenida de Booster Forge, no incluida en el repositorio; sin ella la aplicacion no funciona.
- El codigo fuente y la documentacion son privados ("private Booster Forge build"), por lo que no es auditable.
- El instalador es un binario `.exe` de 1,17 GB sin firma ni verificacion mas alla del hash SHA-256 publicado; conviene comprobar ese hash antes de ejecutarlo.
- La automatizacion de portales de citas puede contravenir los terminos de servicio del IVAC y las normativas de inmigracion aplicables; el propio autor indica usarlo solo con una cuenta IVAC y un telefono propios.
- El uso de fingerprints de navegador y de resolucion de captchas tiene implicaciones eticas y legales que deben evaluarse antes de cualquier despliegue.
- Se envian datos a servicios externos opcionales (DeepSeek, 2Captcha) sin que se documente el tratamiento de la informacion personal del solicitante.
- El portal IVAC solo esta operativo en franjas horarias concretas; fuera de ellas devuelve "Service is unavailable now", lo que limita la automatizacion.
- No hay informacion sobre sesgos, alucinacion o cobertura idiomatica porque no hay modelo subyacente propio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/boosterForge/IndiaVisaMaster
- Instalador referenciado en la model card: `BoosterForge-IndiaVisaMaster-Setup-1.0.0.exe` (1,17 GB, SHA-256 `91a11a29e66c1ee94da1a91c9038f48ab35d0fc72b7174f3e815d29533c4ae56`)
- Captura de pantalla referenciada: `./screenshot.png`
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo, demos ni documentacion adicional.
