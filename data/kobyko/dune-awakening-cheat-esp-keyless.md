# Kobyko/dune-awakening-cheat-esp-keyless

## Resumen

El artefacto publicado bajo el identificador `Kobyko/dune-awakening-cheat-esp-keyless` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un paquete ejecutable para Windows (un supuesto *cheat* con ESP, o *extra-sensory perception*, para el videojuego Dune Awakening) distribuido a través de un repositorio de Hugging Face. El autor, Kobyko, lo etiqueta con metadatos propios de un modelo (idiomas, licencia MIT, región), pero el contenido de la model card describe un binario `.exe` y un archivo `.zip` con contraseña, no pesos neuronales.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para dejar constancia de que el repositorio no contiene un modelo evaluable, sino un ejecutable de terceros de procedencia no verificada. No hay arquitectura, parámetros, contexto ni proceso de entrenamiento que analizar. Cualquier uso del binario conlleva riesgos de seguridad que se detallan en la sección de limitaciones.

Desde la perspectiva de un blog técnico de IA open source, este artefacto debe clasificarse como *no aplicable*: no cumple los criterios mínimos para ser considerado un modelo (no hay pesos, no hay tokenizador, no hay pipeline declarado y el campo `pipeline` aparece como no disponible).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del autor; no verificable) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el paquete distribuido es un `.zip` con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El artefacto es un binario `dune-awakening-cheat-esp-keyless-v1.2.0-win64.exe` (build `v3.1.9`, firma `357CB5EDD3`) empaquetado en un archivo `dune-awakening-cheat-esp-keyless-v1.2.0-win64.zip` de 8,9 MB, protegido con la contraseña `2026`. La model card menciona componentes como un núcleo externo en modo usuario, un escáner dinámico de offsets, suavizado de entrada Bézier y una capa de superposición externa a 144 Hz, todos ellos propios de software de trampas para videojuegos, no de un sistema de IA.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO). Tampoco se documenta ningún proceso de evaluación o validación técnica del binario.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües reales; los códigos de idioma son metadatos del repositorio.
- El binario, según su propia descripción, ofrece funciones de superposición (ESP) sobre el juego Dune Awakening: cajas 2D/3D, esqueletos de huesos, distancia y suavizado de puntería.
- Estas funciones no son capacidades de IA y su uso puede infringir los términos de servicio del videojuego.

## Casos de uso

- No se identifican casos de uso legítimos en el ámbito de la IA open source: el artefacto no procesa lenguaje ni datos.
- Auditoría de seguridad: un analista podría inspeccionar el repositorio para documentar la presencia de binarios no verificados en plataformas de modelos.
- Estudio de contaminación de repositorios: sirve como ejemplo de metadatos de modelo aplicados a contenido que no es un modelo.
- Investigación de campañas de distribución: el patrón de `.zip` con contraseña y enlace a un repositorio de GitHub ajeno es relevante para equipos de threat intelligence.
- Formación en higiene de seguridad: caso práctico para explicar por qué no deben ejecutarse binarios descargados de repositorios de modelos.
- No se recomienda ningún uso operativo del ejecutable en entornos de producción, investigación o desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay inferencia de modelo).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Requisitos declarados por el autor: Windows 10 (22H2) o Windows 11 (24H2), arquitectura x64, ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponible; la model card menciona tiempos de respuesta inferiores a 15 ms y menos de 40 MB de RAM para ciertos módulos, pero son afirmaciones del autor no verificadas.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se han identificado en la información proporcionada otras publicaciones del mismo autor con las que establecer una comparación técnica.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, tokenizador, arquitectura y pipeline; no puede evaluarse con métricas de modelos.
- Ejecutable de procedencia no verificada: se distribuye como binario compilado, sin código fuente auditable, pese a la licencia MIT declarada.
- El archivo se entrega comprimido con contraseña (`2026`), un patrón habitual para evadir análisis automatizados de malware.
- El enlace de descarga apunta a un repositorio de GitHub de un tercero (`Chavez46`), no al repositorio de Hugging Face, lo que rompe la cadena de custodia.
- Riesgo elevado de malware: la ejecución como administrador de un binario no firmado permite acceso total al sistema.
- Uso contrario a los términos de servicio de Dune Awakening y potencialmente a la legislación sobre trampas en entornos multijugador.
- Los metadatos de idioma y la licencia MIT no deben interpretarse como garantías del autor sobre el contenido.
- Cero descargas y cero *likes* en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/dune-awakening-cheat-esp-keyless
- Repositorio de GitHub referenciado en la model card: https://github.com/Chavez46/dune-awakening-cheat-esp-keyless
- Enlace de descarga directa citado por el autor: https://github.com/Chavez46/dune-awakening-cheat-esp-keyless/releases/latest/download/dune-awakening-cheat-esp-keyless-v1.2.0-win64.zip
- Página de releases citada por el autor: https://github.com/Chavez46/dune-awakening-cheat-esp-keyless/releases/latest
