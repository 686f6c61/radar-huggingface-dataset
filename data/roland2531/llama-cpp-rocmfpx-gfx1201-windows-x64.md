# Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un runtime de inferencia: una compilación comunitaria de llama.cpp orientada a ROCm y empaquetada para Windows x64 sobre GPUs AMD con arquitectura RDNA4, concretamente el target `gfx1201` (validado en Radeon RX 9070). Integra los parches de RDNA-Boosts y el trabajo de ROCmFPX, y su propósito es ejecutar modelos GGUF cuantizados con el esquema propietario Q6 IO + W4A8 que publica el mismo autor en un repositorio separado. El artefacto pesa 2,2 GB e incluye binarios, DLLs de AMD, datos de librerías y ficheros sidecar.

La relevancia es acotada pero clara: el soporte de llama.cpp sobre ROCm en Windows para GPUs de consumo AMD es históricamente frágil, y esta build ofrece un binario precompilado con validación declarada en `gfx1201`, además de gramática nativa para tool calling y gestión del ciclo de vida del proyector multimodal. No obstante, el propio autor advierte de que el alcance de validación es limitado: otras GPUs y sistemas operativos quedan sin verificar, la integración de visión y audio no está validada por sus pruebas publicadas, y la release más reciente no aporta benchmarks de velocidad controlados.

Se trata, por tanto, de una pieza de infraestructura experimental (etiqueta `experimental` en los tags) para desarrolladores que ya trabajan con modelos GGUF de ROCmFPX y necesitan un runtime funcional en Windows con AMD, no de un modelo evaluable por capacidades cognitivas. Las secciones siguientes adaptan la ficha a esa naturaleza: donde un modelo tendría parámetros o contexto, aquí se describen versiones del runtime, requisitos de plataforma y compatibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de artefacto | Runtime de inferencia (build de llama.cpp), no un modelo de pesos |
| Arquitectura | llama.cpp con backend ROCm, parches RDNA-Boosts y ROCmFPX; target GPU `gfx1201` (RDNA4) |
| Parametros totales | no disponible (no aplica: no contiene pesos de modelo) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo GGUF cargado y de la RAM/VRAM) |
| Tipos de cuantizacion | Soporte declarado para Q6 IO + W4A8 (esquema ROCmFPX); resto de cuantizaciones GGUF de llama.cpp, no detallado |
| Idiomas soportados | no disponible (heredado del modelo cargado) |
| Licencia | MIT (código núcleo); dependencias empaquetadas y pesos con sus propios términos |
| Formato de pesos | No contiene pesos; consume GGUF (modelo compatible publicado aparte) |
| Plataforma | Windows x64, driver AMD compatible, Microsoft Visual C++ x64 runtime |
| GPU validada | AMD Radeon RX 9070 (`gfx1201`); otras GPUs sin verificar |
| Tamano del repositorio | 2,2 GB |
| Versiones publicadas | 20261117-01, 20261030-01, 20261024-01, 20261023-01, 20261022-01, 20261021-01 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de red que describir: el repositorio distribuye código compilado. La base es llama.cpp (proyecto ggml-org), sobre la que se aplican dos capas de modificación. La primera es RDNA-Boosts, un conjunto de optimizaciones para GPUs RDNA de AMD. La segunda es ROCmFPX, que aporta el esquema de cuantización Q6 IO + W4A8 empleado por los modelos del mismo autor. El binario se compila para el target `gfx1201`, lo que implica que el código de dispositivo generado está especializado para esa arquitectura y no necesariamente es portable a otras familias de GPU sin recompilación.

Las notas de versión describen una evolución incremental con cambios de interfaz entre releases: los archivos comprimidos tienen estructuras distintas y las interfaces de DLL cambian, de modo que los parches add-on solo son válidos para la versión exacta para la que se publicaron. Entre las funcionalidades añadidas figuran caché de prefijo corto y en RAM, gramática nativa para herramientas, opciones de ciclo de vida del proyector y una corrección de gramática para herramientas obligatorias introducida en 20261023-01. La release 20261024-01 corrige el incumplimiento de restricciones de enumeración de cadenas finitas en argumentos de herramientas etiquetados.

## Capacidades

- Ejecución de inferencia local de modelos GGUF en GPUs AMD RDNA4 bajo Windows x64.
- Soporte del esquema de cuantización Q6 IO + W4A8 para los modelos ROCmFPX del autor.
- Gramática nativa para tool calling: generación de JSON de herramientas conforme a gramática.
- Caché de prefijo corto y caché en RAM para reutilización de contexto entre peticiones.
- Opciones de ciclo de vida del proyector, orientadas a la carga y descarga de proyectores multimodales.
- Compatibilidad con el ecosistema llama.cpp (interfaz de servidor y CLI heredada del proyecto base), sin detalle adicional en la información disponible.
- No valida visión real, integración Viewer/audio ni coexistencia con contexto completo según sus pruebas publicadas.

## Casos de uso

- Despliegue local en Windows con GPU AMD: un desarrollador con una RX 9070 puede extraer el ZIP completo de una release y ejecutar modelos GGUF ROCmFPX sin compilar llama.cpp desde fuente, que es precisamente el escenario que la build valida.
- Desarrollo y prueba de agentes con tool calling: la gramática nativa de herramientas permite forzar la estructura JSON de las llamadas, útil para prototipar pipelines de agentes en local antes de moverlos a producción.
- Evaluación de modelos cuantizados Q6 IO + W4A8: sirve para medir calidad y comportamiento de ese esquema de cuantización concreta frente a GGUF estándar en hardware de consumo.
- Servicio de inferencia de un solo usuario en estación de trabajo: con caché de prefijo corto y en RAM, resulta adecuado para asistentes de código o chat con prompts de sistema repetidos.
- Prototipado de integración multimodal: las opciones de ciclo de vida del proyector permiten experimentar con carga y descarga de proyectores, aunque la visión real no está validada por las pruebas publicadas.
- Reproducción de entornos de investigación: al fijar una versión concreta del runtime y su modelo compatible, se puede congelar una configuración reproducible para experimentos que dependan del binario exacto.
- Validación previa a migración a Linux/ROCm: útil como paso intermedio para comprobar que el modelo y la cuantización funcionan antes de invertir en un entorno de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la integración más reciente no incluye ninguna medición de velocidad controlada nueva y que la release no debe interpretarse como una mejora universal de velocidad o de calidad de modelo.

## Requisitos de hardware

- Sistema operativo: Windows x64 exclusivamente; otros sistemas sin verificar.
- GPU: AMD Radeon RX 9070 (`gfx1201`) es la única validada; otras GPUs AMD quedan sin verificar y el binario está compilado para ese target.
- VRAM: no disponible; depende del modelo GGUF cargado y de su cuantización. El repositorio no publica estimaciones.
- RAM: se recomienda margen adicional por la caché de prefijo en RAM y por los 2,2 GB de artefacto en disco.
- Dependencias: driver AMD compatible y Microsoft Visual C++ x64 runtime.
- Instalación: extraer el ZIP completo de una única versión, conservando DLLs de AMD, datos de librerías y sidecar del mismo release; no mezclar ficheros entre versiones.
- Despliegue: el runtime es la vía de ejecución; no se documentan integraciones con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles; sin benchmarks controlados publicados.

## Comparativa con modelos similares

La comparación pertinente es entre runtimes, no entre modelos.

| Criterio | Este runtime (ROCmFPX gfx1201) | llama.cpp oficial (ROCm, Windows) | LM Studio / Ollama (backend llama.cpp) |
|---|---|---|---|
| Naturaleza | Build comunitaria con parches RDNA-Boosts y ROCmFPX | Build de referencia del proyecto ggml-org | Distribuciones con interfaz gráfica o CLI sobre llama.cpp |
| GPU objetivo | `gfx1201` (RX 9070), compilación especializada | Genérica AMD/NVIDIA/CPU | Genérica, con detección automática |
| Cuantización Q6 IO + W4A8 | Sí, soportada de forma nativa | No documentada | No documentada |
| Gramática nativa de herramientas | Sí | Sí (en versiones recientes) | Depende de la versión empaquetada |
| Validación publicada | Limitada a una GPU y un esquema | Amplia, comunitaria | Amplia, comunitaria |
| Licencia | MIT con dependencias propias | MIT | MIT / propietaria según distribución |
| Madurez | Experimental, releases con cambios de interfaz entre versiones | Alta | Alta |

## Limitaciones y advertencias

- Naturaleza experimental: el propio repositorio se etiqueta como `experimental`; no es una build de referencia ni un reemplazo del llama.cpp oficial.
- Alcance de validación estrecho: solo RX 9070 / `gfx1201`; otras GPUs y sistemas operativos quedan explícitamente sin verificar.
- Incompatibilidad entre versiones: los archivos comprimidos cambian de estructura y las interfaces de DLL difieren; mezclar ficheros de releases distintas puede romper la ejecución.
- Parches no universales: los add-on de corrección solo se aplican a la versión para la que se publicaron.
- Tool calling no fiable al 100 %: un JSON de herramienta válido no garantiza instrucciones correctas; las peticiones de redacción exacta o de silencio pueden fallar. La validación en el lado del host sigue siendo necesaria.
- Corrección de gramática: las releases anteriores a 20261024-01 no aplican restricciones de enumeración de cadenas finitas en argumentos de herramientas etiquetados, lo que puede producir valores fuera de rango.
- Multimodalidad no validada: visión real, integración Viewer/audio y coexistencia con contexto completo no están cubiertas por las pruebas publicadas.
- Sin benchmarks: no hay datos controlados de velocidad ni de calidad que respalden afirmaciones de rendimiento.
- Licencias mixtas: el código núcleo es MIT, pero las dependencias empaquetadas y los pesos del modelo conservan sus propios términos; conviene revisar THIRD_PARTY_NOTICES.md y los directorios de licencia antes de uso comercial.
- Modelo separado: los pesos no están en este repositorio; hay que descargar el modelo compatible (Ornith Q6 IO + A8) aparte, con su propia licencia y condiciones.
- Sin señales de adopción: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validación por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64
- Release más reciente (20261117-01): https://huggingface.co/Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64/tree/main/releases/20261117-01
- Release anterior (20261030-01): https://huggingface.co/Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64/tree/main/releases/20261030-01
- Release corregida (20261024-01): https://huggingface.co/Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64/tree/main/releases/20261024-01
- Corrección de gramática de herramientas (20261023-01): https://huggingface.co/Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64/tree/main/releases/20261023-01
- Release integrada de llama.cpp (20261022-01): https://huggingface.co/Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64/tree/main/releases/20261022-01
- Release inicial y parche compatible (20261021-01): https://huggingface.co/Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64/tree/main/releases/20261021-01
- Modelo compatible (Ornith-1.5-9B-uncensored-ROCmI4-Q6IO-A8): https://huggingface.co/Roland2531/Ornith-1.5-9B-uncensored-ROCmI4-Q6IO-A8
- Licencia: https://huggingface.co/Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64/blob/main/LICENSE
- Avisos de terceros: https://huggingface.co/Roland2531/llama.cpp-ROCmFPX-gfx1201-Windows-x64/blob/main/THIRD_PARTY_NOTICES.md
- llama.cpp (proyecto base): https://github.com/ggml-org/llama.cpp
- RDNA-Boosts: https://github.com/stew675/llama-cpp-rdna-boosts
- ROCmFPX: https://github.com/charlie12345/ROCmFPX
