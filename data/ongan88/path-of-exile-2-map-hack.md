# ongan88/path-of-exile-2-map-hack

## Resumen

El artefacto publicado bajo el identificador `ongan88/path-of-exile-2-map-hack` no es un modelo de inteligencia artificial. Se trata de un paquete binario para Windows (x64) distribuido a través de Hugging Face que, según su propia model card, se presenta como una herramienta de trampas ("map hack") para el videojuego Path of Exile 2: radar 2D, filtro de botín, superposición externa con cajas delimitadoras y esqueletos de huesos, suavizado de entrada tipo bezier y un "dynamic offset scanner" para resolver punteros tras los parches del juego.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y el contenido del README confirman que es un ejecutable empaquetado en un ZIP de 4,8 MB con contraseña, alojado en un repositorio de GitHub de terceros y no en el propio Hub. La licencia declarada es MIT, aunque el binario no incluye código fuente verificable.

Desde la perspectiva de un desarrollador o investigador, este artefacto carece de interés como modelo: no hay parámetros, contexto, cuantizaciones ni benchmarks. Además, el patrón de distribución (ZIP con contraseña, enlace a un release de GitHub ajeno, instrucciones para desactivar avisos de SmartScreen y ejecutar como administrador) coincide con campañas habituales de malware disfrazado de cheat para videojuegos. Se documenta aquí únicamente para dejar constancia de que no es un modelo y de los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; el binario no procesa lenguaje) |
| Licencia | MIT (declarada; sin código fuente) |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste fino (SFT, RLHF, DPO) ni innovación técnica en el sentido del aprendizaje automático. El README describe componentes de ingeniería inversa sobre el proceso del juego: lectura de memoria para un radar 2D, renderizado de una superposición externa a 144 Hz o más, escaneo asíncrono de firmas de puntero para sobrevivir a los parches, suavizado de entrada bezier con radio de FOV configurable y una tecla de pánico (`END`) que libera handles y termina el proceso.

Los detalles técnicos que menciona (respuesta en menos de 27 ms, polling a 204 Hz, consumo de menos de 59 MB de RAM, consistencia del 98,2 % en la descarga de pánico) son afirmaciones del autor sin verificación independiente y no constituyen métricas de un modelo. El nombre interno del ZIP (`blox-fruits-script-keyless-2026-v1.2.2-win64.zip`) ni siquiera corresponde al juego que dice modificar, lo que apunta a una plantilla reutilizada de otro cheat.

## Capacidades

- No genera texto, código, matemáticas ni imágenes: no es un modelo de lenguaje ni multimodal.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No tiene capacidades multilingües reales; los códigos de idioma del repo son metadatos de descubrimiento.
- Lo que el README atribuye al binario: radar 2D, filtro de botín por rareza, cajas delimitadoras 2D/3D, esqueletos de huesos, ESP de distancia, perfiles JSON intercambiables en caliente y tecla de pánico.
- Estas supuestas capacidades implican manipulación del proceso de un juego en línea, lo que infringe habitualmente sus términos de servicio.

## Casos de uso

No se identifican casos de uso legítimos para un desarrollador o investigador de IA. Los escenarios plausibles son de naturaleza defensiva o de análisis de seguridad:

- Análisis de malware: un analista puede diseccionar el binario en un entorno aislado para identificar técnicas de evasión, persistencia o robo de credenciales, dado el patrón de distribución sospechoso.
- Concienciación en comunidades de gaming: documentar el patrón (ZIP con contraseña, enlaces a releases de terceros, instrucciones para desactivar SmartScreen) como ejemplo de ingeniería social dirigida a jugadores.
- Investigación de integridad en videojuegos: estudiar cómo los cheats leen memoria y resuelven punteros para diseñar contramedidas anti-cheat del lado del servidor y del cliente.
- Formación en respuesta a incidentes: usar el caso como ejercicio de triaje de artefactos descargados desde hubs de modelos.
- Auditoría de repositorios en Hugging Face: ilustrar la necesidad de moderación de contenido que no es un modelo pero se etiqueta como tal para ganar visibilidad.
- Estudio de SEO malicioso: analizar cómo se reutilizan nombres de modelos y tags populares para posicionar descargas no relacionadas.

En ningún caso se recomienda ejecutar el binario en un equipo de producción o personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (latencia de 27 ms, polling a 204 Hz, 59 MB de RAM, consistencia del 98,2 %) son afirmaciones del autor sobre el comportamiento del ejecutable, no mediciones de capacidades de un modelo, y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Almacenamiento: 4,8 MB para el ZIP; el tamaño descomprimido no se especifica.
- Memoria RAM declarada por el autor: menos de 59 MB durante la ejecución.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Frente a otros repositorios de Hugging Face, la comparación relevante sería con otros binarios maliciosos disfrazados de modelos, categoría para la que no se dispone de referencias públicas sistematizadas.

## Limitaciones y advertencias

- No es un modelo de IA: no puede usarse para generación de texto, código, visión ni ninguna tarea de aprendizaje automático.
- Riesgo de seguridad alto: el patrón de distribución (ZIP con contraseña `2026`, enlace a un release de GitHub de un tercero, instrucciones para ejecutar como administrador y desactivar SmartScreen) es típico de malware.
- El nombre del ZIP hace referencia a otro juego (Blox Fruits), lo que sugiere suplantación o reutilización de plantillas.
- Ejecutarlo puede comprometer credenciales, instalar persistencia o exponer el sistema a robo de datos.
- El uso de cheats en Path of Exile 2 viola con toda probabilidad los términos de servicio de Grinding Gear Games y puede conllevar el baneo de la cuenta.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario ni permite verificar su comportamiento, al no haber código fuente.
- Cero descargas y cero likes en el momento de la consulta: sin señal de validación por parte de la comunidad.
- No debe desplegarse en producción ni en entornos con datos sensibles bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ongan88/path-of-exile-2-map-hack
- Release de GitHub referenciado en la model card: https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026/releases/download/v1.2.0/blox-fruits-script-keyless-2026-v1.2.2-win64.zip
- Página de releases alternativa citada: https://github.com/DominiqueLe096/path-of-exile-2-map-hack/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
