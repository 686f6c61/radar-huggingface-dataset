# NASS2019/rob-catalog-avatar-creator-script

## Resumen

El repositorio `NASS2019/rob-catalog-avatar-creator-script` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows de 64 bits que se presenta como un "script" para el juego Roblox, con una supuesta build `v1.7.1 (10ADA9)` y un ejecutable `rob-catalog-avatar-creator-script-v1.2.0-win64.exe` de 8,9 MB. La model card es, en realidad, una página de descarga con instrucciones para descomprimir un ZIP protegido con contraseña y ejecutar un binario como administrador.

El contenido descrito en la model card (radar 2D, filtro de loot, ESP con cajas delimitadoras y esqueletos, smoothing de entrada tipo bezier, capa de render "stream-proof" para evadir OBS y ShadowPlay) corresponde a funcionalidades típicas de trampas o cheats en videojuegos, no a capacidades de un modelo de lenguaje. No hay arquitectura neuronal, pesos, tokenizador, dataset ni pipeline de inferencia asociados al identificador.

Por tanto, esta ficha no puede documentar especificaciones técnicas de un modelo de IA: los campos solicitados no son aplicables y se indican como "no disponible". Se recomienda precaución: ejecutar binarios de procedencia desconocida con privilegios de administrador y contraseñas incrustadas en la documentación es un vector habitual de malware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no del modelo) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto publicado es un ejecutable nativo para Windows de 64 bits empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. La model card describe módulos de manipulación de memoria de proceso ("direct-memory dynamic offset scanner", "pointer signature resolution"), overlay externo a 144 Hz y polling a 169 Hz, que son mecanismos de interacción con un juego en ejecución, no componentes de un modelo generativo.

No se documenta dataset, número de tokens, fases de RLHF/DPO ni innovación técnica alguna en el sentido de la IA open source. Los "parámetros" citados en la model card (worker threads, frecuencias de polling) pertenecen a un runtime de aplicación de escritorio.

## Capacidades

- No es un modelo de lenguaje: no genera texto, código ni matemáticas.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- Las funcionalidades declaradas por el autor son: radar 2D, filtro de loot por rareza, ESP con cajas 2D/3D y esqueletos, smoothing de puntería con radio de FOV configurable, perfiles JSON con cambio en caliente y una capa de render pensada para no aparecer en capturas de OBS, ShadowPlay o Discord.
- Multilingüe solo a nivel de metadatos del repositorio; no hay evidencia de capacidades lingüísticas.

## Casos de uso

- No se identifican casos de uso legítimos de IA para este repositorio. Las aplicaciones descritas por el autor se orientan a la manipulación de un videojuego y a la evasión de capturas de pantalla, lo que infringe habitualmente los términos de servicio de las plataformas afectadas.
- Evaluación de modelos: no aplica, al no existir pesos ni pipeline de inferencia.
- Integración en producción: no recomendable; un binario sin trazabilidad, distribuido con contraseña fija y ejecutado como administrador, no cumple criterios mínimos de cadena de suministro.
- Investigación en seguridad: el artefacto podría analizarse en un entorno aislado para estudiar técnicas de evasión de captura o manipulación de memoria, nunca en una máquina de trabajo.
- Docencia sobre riesgos de supply chain: sirve como ejemplo de model card que suplanta la ficha de un modelo con una página de descarga.
- Detección y respuesta: útil como muestra para calibrar reglas de antivirus o EDR frente a ejecutables con contraseña incrustada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas equivalentes, y las cifras de descargas y valoración que aparecen en la model card (632K descargas, 4,8/5) no son verificables ni corresponden a métricas de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Plataforma del artefacto: Windows 10 u 11 de 64 bits, con ejecución como administrador según las instrucciones del autor.
- Latencia y throughput: no disponible; las cifras de polling (169 Hz, 168 Hz) y de overlay (144 Hz) son afirmaciones del autor sin verificación.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, ya que el artefacto no es un modelo. Frente a otros repositorios de Hugging Face, la diferencia relevante es que aquí no hay pesos, tokenizador ni configuración de inferencia, sino un ejecutable para Windows.

## Limitaciones y advertencias

- Suplantación de categoría: el repositorio usa la infraestructura de Hugging Face para distribuir software de escritorio, no un modelo.
- Riesgo de seguridad: ejecutar como administrador un binario de origen desconocido, empaquetado en un ZIP con contraseña fija (`2026`), impide el escaneo automático por parte de antivirus y es un patrón habitual de distribución de malware.
- Riesgo legal y de términos de servicio: las funciones descritas (ESP, radar, smoothing de puntería, evasión de capturas) son propias de trampas en videojuegos y pueden vulnerar los términos de la plataforma afectada y la legislación aplicable.
- Sin trazabilidad: no se publican hashes, firma de código ni repositorio de origen verificable; el enlace de descarga apunta a un repositorio de GitHub de un tercero (`JavierPetit37`), distinto del autor del repo en Hugging Face.
- Licencia: MIT declarada en los metadatos, pero sin archivo de licencia ni código fuente que la respalde.
- Idiomas: la lista de idiomas del repositorio no implica soporte lingüístico real del artefacto.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta, en contradicción con las cifras que muestra la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NASS2019/rob-catalog-avatar-creator-script
- Enlace de descarga citado en la model card (repositorio de terceros): https://github.com/JavierPetit37/rob-catalog-avatar-creator-script/releases/latest/download/rob-catalog-avatar-creator-script-v1.2.0-win64.zip
- Página de releases citada: https://github.com/JavierPetit37/rob-catalog-avatar-creator-script/releases/latest
