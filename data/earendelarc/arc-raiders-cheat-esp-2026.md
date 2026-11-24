# EarendelArc/arc-raiders-cheat-esp-2026

## Resumen

El repositorio `EarendelArc/arc-raiders-cheat-esp-2026` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido a través de Hugging Face que, segun su propia model card, ofrece un supuesto "cheat ESP" (extra-sensory perception, es decir, un overlay de informacion para trampas) para el videojuego Arc Raiders, empaquetado como un ejecutable de Windows x64 (`solara-executor-v3-keyless-v1.2.2-win64.exe`) dentro de un archivo ZIP de 4,8 MB protegido con contrasena.

El contenido no describe ninguna arquitectura neuronal, pesos, tokenizador ni pipeline de inferencia. Los metadatos de Hugging Face (tags como `windows`, `x64`, `portable`) y el README apuntan a una utilidad de tipo game cheat, no a un modelo de lenguaje, vision o audio. Por tanto, esta ficha no puede evaluar parametros, contexto, cuantizacion ni rendimiento en tareas de IA, porque tales elementos no existen en el artefacto.

La relevancia de documentar este caso es distinta: sirve como ejemplo de contenido ajeno al proposito de Hugging Face que se publica en la plataforma, y de los riesgos asociados a descargar y ejecutar binarios de procedencia desconocida distribuidos como si fueran modelos. Cualquier evaluacion tecnica del "modelo" en terminos de IA debe considerarse no aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ejecutable `.exe` dentro de un `.zip`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto descrito en la model card es un binario de Windows (`solara-executor-v3-keyless-v1.2.2-win64.exe`, build `v2.2.6`, identificador `DA88000150`) empaquetado en un ZIP de 4,8 MB con contrasena `2026`. El README menciona modulos como "panic key unload", "hot-swap JSON profiles", "dynamic offset scanner", "2D radar & loot filter", "Bezier input smoothing" y "stream-proof render layer", que corresponden a funcionalidades de trampas en un videojuego, no a componentes de un modelo.

No hay informacion sobre datos de entrenamiento, tokens procesados, RLHF, DPO ni innovaciones tecnicas de IA. Tampoco se aporta ningun paper, repositorio de codigo fuente ni documentacion tecnica verificable sobre el binario.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no programa, no resuelve matematicas ni procesa vision o audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un modelo de lenguaje; los idiomas listados en los metadatos son etiquetas del repositorio.
- El README afirma funcionalidades de trampa para el juego Arc Raiders (radar 2D, filtro de loot, suavizado de input, capa de render excluida de capturas), sin verificacion independiente.

## Casos de uso

- No aplica como modelo de IA en produccion: no hay pesos, tokenizador ni API de inferencia que integrar en pipelines de NLP, vision o agentes.
- Auditoria de seguridad: el caso sirve para analizar como se distribuyen binarios ejecutables bajo la apariencia de modelos en plataformas de modelos, y para disenar politicas de revision de artefactos.
- Formacion en higiene de cadena de suministro: util como ejemplo de por que no se deben ejecutar binarios descargados de repositorios sin reputacion, firmas ni codigo fuente.
- Investigacion de politicas de plataforma: documenta la presencia de contenido de game cheating en Hugging Face y las etiquetas que lo acompanan.
- Analisis de ingenieria social: el uso de contrasenas en el ZIP, botones de descarga y badges de "rating 4.9/5" es un patron clasico de distribucion de software no verificado.
- No se recomienda ningun uso del binario en entornos reales por el riesgo de malware, robo de credenciales o baneo en el juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo de IA y no existen metricas de MMLU, HumanEval, GSM8K ni equivalentes aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica; el README menciona cifras de polling (216 Hz, 472 Hz) y tiempos de respuesta (< 29 ms, < 8 ms) para los modulos del ejecutable, sin verificacion independiente.
- Plataforma objetivo declarada: Windows 10/11 de 64 bits.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" comparable, porque el artefacto no es un modelo. Tampoco se conocen en la informacion proporcionada otros repositorios de Hugging Face con la misma naturaleza que permitan una comparativa tecnica fiable.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generacion de texto, codigo o razonamiento es infundada.
- Riesgo de seguridad alto: se distribuye un ejecutable de Windows de origen desconocido, sin firma digital, sin codigo fuente y con instrucciones para ejecutarlo "como administrador".
- El ZIP esta protegido con contrasena (`2026`), un patron habitual para evadir analisis automaticos de antivirus y sandboxes.
- El README incluye enlaces a repositorios de GitHub de terceros (`GraceFernandez01321/solara-executor-v3-keyless`, `Pamela8523/arc-raiders-cheat-esp-2026`) que no coinciden con el ID del repo en Hugging Face, lo que indica suplantacion o reempaquetado.
- Uso en juegos online: viola habitualmente los terminos de servicio de Arc Raiders y puede conllevar el baneo permanente de la cuenta.
- Licencia MIT declarada en los metadatos, pero sin archivo LICENSE verificable ni titular claro; la licencia no otorga ninguna garantia sobre el binario.
- Las afirmaciones de rendimiento y funcionalidad del README no estan respaldadas por documentacion tecnica, tests ni revision independiente.
- Descargas y likes a cero en el momento de la consulta, sin historial que permita evaluar reputacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EarendelArc/arc-raiders-cheat-esp-2026
- Repositorio GitHub citado en el README: https://github.com/Pamela8523/arc-raiders-cheat-esp-2026
- Repositorio GitHub de releases citado en el README: https://github.com/GraceFernandez01321/solara-executor-v3-keyless
- Enlace de descarga del ZIP citado en el README: https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
- No se han encontrado papers, blogs tecnicos ni demos en la informacion disponible.
