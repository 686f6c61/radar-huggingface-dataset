# hoomanrafinia/stranger-than-heaven-cheat-trainer

## Resumen

El artefacto publicado bajo el identificador `hoomanrafinia/stranger-than-heaven-cheat-trainer` en Hugging Face no es un modelo de inteligencia artificial, sino un supuesto paquete ejecutable para Windows etiquetado como *cheat trainer* (herramienta de trampas) para el videojuego *Stranger Than Heaven*. La model card describe un binario `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` distribuido dentro de un archivo ZIP de 4,8 MB protegido con contraseña, alojado en repositorios de GitHub de terceros. No contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

El repositorio carece de pipeline declarado, no tiene descargas ni interacciones, y su fecha de creación (2026-11-24) resulta anómala. Los metadatos de idioma (14 códigos ISO) y las etiquetas (`windows`, `x64`, `portable`) son los habituales en publicaciones de software empaquetado, no en modelos entrenados. La licencia declarada es MIT, aunque esta se aplica al paquete publicado, no a un modelo subyacente.

Desde la perspectiva de evaluación de modelos, esta ficha no puede completarse con datos técnicos reales porque no existe ningún modelo que evaluar. Se documenta el artefacto tal como aparece y se advierte de los riesgos asociados a la distribución de ejecutables sin verificar a través de plataformas de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card describe funcionalidades propias de una herramienta de trampas para videojuegos: escáner dinámico de offsets, radar 2D con filtro de botín, núcleo externo en modo usuario, capa de renderizado "stream-proof" para evadir capturas de OBS/ShadowPlay/Discord, overlay externo a 144 Hz con cajas delimitadoras y esqueletos, y tecla de pánico (`END`) con descarga del proceso en menos de 17 ms. Ninguno de estos elementos corresponde a un modelo de aprendizaje automático.

El paquete se distribuye como un ZIP con contraseña (`2026`) alojado en enlaces de GitHub que no pertenecen al autor del repositorio de Hugging Face. No hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de soporte de *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo entrenado; los códigos de idioma son metadatos del repositorio.
- El artefacto declara funcionalidades de trampa para videojuegos (radar, ESP, filtro de botín, overlay), no verificables y ajenas al ámbito de la IA.

## Casos de uso

- No procede: al no ser un modelo de IA, no existen casos de uso legítimos de inferencia, generación o análisis.
- Evaluación de seguridad de la cadena de suministro: el repositorio puede usarse como caso de estudio de publicación de ejecutables sin verificar en plataformas de modelos.
- Auditoría de metadatos: útil para comprobar cómo se etiquetan artefactos ajenos al ecosistema de IA en Hugging Face.
- Formación en detección de *malware*: el patrón (ZIP con contraseña, enlaces externos, instrucciones de ejecución como administrador) es representativo de campañas de distribución de software no confiable.
- No se recomienda su descarga, extracción ni ejecución en ningún entorno.
- No se identifica ningún escenario de producción, investigación o desarrollo en el que este artefacto aporte valor técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de referencia, y al no tratarse de un modelo de IA no existen métricas de inferencia (latencia, throughput, tokens por segundo) aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos ni modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; el artefacto declara cifras de rendimiento de la herramienta (encuesta a 425 Hz, respuesta de pánico < 17 ms), no verificables y sin relación con inferencia de modelos.
- Requisito declarado del artefacto: Windows 10/11 de 64 bits, ejecución como administrador.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Frente a modelos de lenguaje reales (por ejemplo, familias Llama, Mistral o Qwen), la comparación carece de sentido: no hay parámetros, contexto, licencia de pesos ni rendimiento que contrastar.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal es un error de categoría.
- Distribución de un ejecutable (`.exe`) dentro de un ZIP protegido con contraseña y alojado en repositorios de GitHub de terceros: patrón habitual en campañas de *malware* y *phishing*.
- Las instrucciones de la model card indican ejecutar el binario como administrador, lo que amplía el impacto potencial de cualquier código malicioso.
- Los enlaces de descarga apuntan a cuentas de GitHub no vinculadas al autor del repositorio de Hugging Face; no hay verificación de integridad ni firma del binario.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del software distribuido; la licencia cubre el paquete, no su comportamiento.
- Uso de herramientas de trampa en videojuegos: puede violar los términos de servicio de los juegos y acarrear el bloqueo de cuentas.
- Fecha de creación anómala (2026) y ausencia de descargas o interacciones: indicios de publicación automatizada o de bajo control de calidad.
- No se debe descargar, extraer ni ejecutar el artefacto en entornos personales, corporativos o de investigación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hoomanrafinia/stranger-than-heaven-cheat-trainer
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace de contraseña citado en la model card (GitHub, terceros): https://github.com/mishra82819/stranger-than-heaven-cheat-trainer/releases/latest
- Paper, blog, demo o repositorio oficial: no disponible
