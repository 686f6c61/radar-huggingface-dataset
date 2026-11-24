# pisthyt/path-of-exile-2-map-hack-v3

## Resumen

El repositorio `pisthyt/path-of-exile-2-map-hack-v3` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como ejecutable para Windows x64 etiquetado como "map hack" para el videojuego Path of Exile 2, es decir, una herramienta de trampas orientada a la manipulación del cliente del juego. La model card describe módulos de superposición externa, radar 2D, filtro de objetos y una capa de renderizado que, según el autor, evita la captura por software de streaming.

El artefacto se publica como un ZIP de 4,8 MB protegido con contraseña (`2026`) que contiene un binario `solara-executor-v3-keyless-v1.2.2-win64.exe`. Los metadatos de Hugging Face listan etiquetas de sistema operativo (windows, windows-11, x64, portable) y catorce idiomas, pero no incluyen pipeline, arquitectura de red, parámetros ni contexto, porque no existe ningún modelo subyacente.

Desde la perspectiva de un catálogo de modelos de IA open source, esta ficha documenta un artefacto no relacionado con IA. No hay pesos, no hay tokenizador, no hay arquitectura transformer ni datos de entrenamiento. La relevancia técnica se limita a señalar el riesgo de seguridad asociado a la descarga y ejecución de binarios de origen desconocido con privilegios de administrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin modelo lingüístico asociado) |
| Licencia | MIT (según metadatos) |
| Formato de pesos | no disponible (distribución como ZIP con ejecutable `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido descrito en la model card es un conjunto de módulos de software para Windows: un núcleo externo en modo usuario, una capa de renderizado de superposición, un radar 2D con filtro de objetos por rareza, perfiles JSON intercambiables y una tecla de pánico (`END`) para terminar el proceso. El autor menciona valores como sondeo a 251 Hz, más de 144 Hz de refresco de superposición y un consumo inferior a 27 MB de RAM, pero no se aporta código fuente, trazabilidad de compilación ni verificación independiente de esas cifras.

Tampoco se documentan datos de entrenamiento, composición de dataset, RLHF, DPO ni innovaciones de inferencia. Cualquier referencia a "core module" o "worker threads" en la model card describe hilos de ejecución de un programa, no capas de un modelo.

## Capacidades

- No hay generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte de tool calling ni function calling.
- No hay capacidades de agente ni razonamiento multi-paso.
- No hay capacidades multilingües reales; los idiomas listados son metadatos del repositorio.
- El artefacto declara funciones de superposición gráfica, radar 2D, filtro de objetos y exclusión de captura de pantalla, orientadas a un videojuego concreto.

## Casos de uso

- No se identifican casos de uso legítimos dentro del ámbito de modelos de IA open source.
- El artefacto está diseñado para interactuar con el cliente de Path of Exile 2, lo que puede contravenir los términos de servicio del juego y acarrear el bloqueo de cuentas.
- La ejecución de binarios desconocidos con privilegios de administrador expone al sistema a malware, robo de credenciales y persistencia no deseada.
- El uso de contraseñas fijas en archivos ZIP y la distribución vía enlaces de GitHub Releases sin verificación de integridad dificultan la auditoría.
- No es adecuado para producción, investigación, docencia ni evaluación de capacidades de IA.
- Cualquier escenario de despliegue en entornos corporativos o académicos debe descartarse por riesgo de seguridad y por ausencia de valor técnico en el ámbito de la IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque no hay modelo lingüístico que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador y extracción previa del ZIP con contraseña.
- Latencia y throughput: no disponibles; las cifras de 251 Hz y 144 Hz de la model card no son verificables ni corresponden a inferencia de IA.

## Comparativa con modelos similares

| Criterio | path-of-exile-2-map-hack-v3 | Modelos de IA open source (categoría general) |
|---|---|---|
| Naturaleza | Binario de trampas para un videojuego | Pesos de red neuronal |
| Parámetros | no disponible | Depende del modelo (p. ej., miles de millones) |
| Contexto | no disponible | Depende del modelo |
| Licencia | MIT (metadatos) | Varía (Apache 2.0, MIT, Llama, etc.) |
| Formatos de distribución | ZIP con `.exe` | safetensors, GGUF, etc. |
| Verificabilidad | Baja; sin código fuente ni hashes | Alta; pesos auditables y reproducibles |

No se identifican alternativas comparables dentro del catálogo de modelos de IA, porque el artefacto no pertenece a esa categoría.

## Limitaciones y advertencias

- No es un modelo de IA: no debe catalogarse ni evaluarse como tal.
- Riesgo elevado de malware: ejecutable de origen desconocido, sin código fuente, sin firmas ni hashes publicados.
- Solicita ejecución como administrador, lo que amplía el impacto de cualquier comportamiento malicioso.
- La contraseña fija del ZIP (`2026`) y los enlaces a repositorios de terceros no garantizan integridad ni autenticidad.
- El uso del artefacto puede violar los términos de servicio de Path of Exile 2 y la legislación aplicable sobre trampas y manipulación de software.
- Los idiomas y la licencia MIT figuran solo en metadatos; no hay componentes lingüísticos ni texto de licencia verificable en el repositorio.
- Cero descargas y cero "likes" en el momento de la consulta, sin evidencia de comunidad ni mantenimiento.
- No apto para producción, investigación ni entornos con requisitos de cumplimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pisthyt/path-of-exile-2-map-hack-v3
- Model card del autor (contenido citado en la información proporcionada): incluida en la página anterior.
- Enlaces a binarios y releases mencionados en la model card: no verificados y no recomendados para descarga.
- Papers, blogs, repositorios de código o demos técnicas: no disponibles.
