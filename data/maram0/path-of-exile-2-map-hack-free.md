# maram0/path-of-exile-2-map-hack-free

## Resumen

El repositorio `maram0/path-of-exile-2-map-hack-free` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows (10 22H2 y 11 24H2, x64) etiquetado como "map hack" para el videojuego Path of Exile 2, empaquetado como un archivo ZIP de 4,8 MB (`schedule-1-cheat-trainer-v1.2.2-win64.zip`) con un ejecutable interno (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build v2.2.2, firma A66C5B) protegido por la contraseña `2026`.

La model card describe funcionalidades propias de una herramienta de trampas (overlay externo a 144 Hz con cajas delimitadoras y esqueletos, ESP de distancia, escáner dinámico de offsets, suavizado de entrada Bézier, tecla de pánico `END` y perfiles JSON intercambiables en caliente), no capacidades de generación de texto, razonamiento o código. No hay pesos, tokenizador, configuración de arquitectura ni pipeline asociado.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA: no existen parámetros, contexto, cuantizaciones ni benchmarks que reportar. Además, debe advertirse que el contenido es sospechoso desde el punto de vista de seguridad (binario de origen no verificado, contraseña en el propio README, enlaces a repositorios de terceros) y que su uso en un videojuego con servicio en línea probablemente infringe los términos de servicio del título y puede conllevar el baneo de la cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no implica capacidades lingüísticas reales) |
| Licencia | MIT (según metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario Win64 (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build v2.2.2, firma A66C5B9524) que, según la model card, opera mediante un "escáner dinámico de offsets" para resolver punteros tras los parches del juego, un overlay externo renderizado a 144 Hz o más con cajas 2D/3D, esqueletos y ESP de distancia, y suavizado de entrada Bézier con radio de FOV y VisCheck configurables. Se mencionan consumos de memoria de menos de 56 MB, 60 MB y 43 MB para distintos módulos, y el uso de 6 y 7 hilos de trabajo.

No hay información sobre datos de entrenamiento, tokens, dataset, RLHF, DPO ni innovaciones de inferencia (decodificación especulativa, atención lineal, etc.), porque el objeto no es un modelo lingüístico. La model card mezcla además nombres de proyecto ajenos (`schedule-1-cheat-trainer`) y enlaces a repositorios de GitHub de terceros, lo que sugiere una plantilla reutilizada y no una ficha técnica verificable.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües reales; la lista de idiomas son etiquetas del repositorio.
- Según la model card, el binario incluiría: overlay externo con cajas 2D/3D, esqueletos y ESP de distancia; escáner de offsets tras parches; perfiles JSON intercambiables (Legit, Visual, Custom); tecla de pánico `END` con liberación de handles; y suavizado de entrada Bézier.
- Estas supuestas capacidades corresponden a una herramienta de trampas para un videojuego, no a un modelo de IA, y no están verificadas de forma independiente.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no tiene aplicaciones legítimas de procesamiento de lenguaje, visión o código.
- Uso declarado por el autor: asistencia visual en Path of Exile 2 mediante overlay con cajas y esqueletos; su empleo en el juego en línea infringe previsiblemente los términos de servicio y puede provocar el baneo de la cuenta.
- Auditoría de seguridad: un analista podría inspeccionar el ZIP y el `.exe` en un entorno aislado (máquina virtual sin red, sin credenciales) para determinar su comportamiento, dado el origen no verificado y la contraseña publicada en el propio README.
- Investigación de malware: el patrón (ZIP con contraseña, binario que pide ejecutarse como administrador, enlaces a releases de repositorios ajenos) es habitual en campañas de distribución de software malicioso, por lo que sirve como caso de estudio de ingeniería social.
- Docencia sobre riesgos de descargas: puede usarse como ejemplo de por qué no se deben ejecutar binarios de repositorios de Hugging Face sin verificación de integridad ni firma.
- No se identifican casos de uso productivos, comerciales o de investigación en IA para este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: Windows 10 (22H2) y Windows 11 (24H2), x64.
- VRAM estimada para inferencia: no aplica (no hay modelo neuronal).
- GPU recomendadas: no aplica; la model card solo menciona un overlay "hardware-timed 144hz+", sin especificar GPU.
- Cabe en cualquier PC con Windows x64 según el autor; consumo declarado inferior a 60 MB de RAM por módulo.
- Opciones de despliegue: ejecución directa del `.exe` como administrador; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras de "144 Hz+" y "< 56 MB" son afirmaciones del autor no verificadas.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maram0/path-of-exile-2-map-hack-free` | Ejecutable Windows (herramienta de trampas) | no aplica | no aplica | MIT (metadatos) | Hugging Face, 0 descargas, 0 likes |
| Modelo de lenguaje open source de referencia (p. ej. familia Llama, Qwen o Mistral) | Modelo de IA | miles de millones | miles de tokens | licencias comunitarias | Hugging Face, descargas masivas |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No existe comparación técnicamente significativa: el artefacto no pertenece a la categoría de modelos de IA, por lo que comparar parámetros, contexto o rendimiento carece de sentido.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje ni imágenes.
- Riesgo de seguridad elevado: ZIP protegido con contraseña (`2026`) que contiene un `.exe` que solicita privilegios de administrador, distribuido desde enlaces a repositorios de GitHub de terceros (`arjunzimmermann624/...`, `NguyenFransson94757/...`) distintos del propietario del repo en Hugging Face.
- Inconsistencia de nombres: el repositorio se llama `path-of-exile-2-map-hack-free` pero el binario y el ZIP se denominan `schedule-1-cheat-trainer-v1.2.2-win64`, lo que apunta a una plantilla reutilizada o a un señuelo.
- La licencia MIT de los metadatos no implica que el binario sea seguro, auditable ni libre de código malicioso.
- Uso en el juego: probable violación de los términos de servicio de Path of Exile 2, con riesgo de suspensión permanente de la cuenta; también puede contravenir la legislación sobre trampas en videojuegos en algunas jurisdicciones.
- Sin evidencias de auditoría, firma de código ni reputación: 0 descargas y 0 likes en el momento de la consulta.
- No debe ejecutarse en equipos personales o corporativos; cualquier análisis debe hacerse en una máquina virtual aislada y sin credenciales.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no aplican a este artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maram0/path-of-exile-2-map-hack-free
- Release citada en la model card (ZIP): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Releases del repositorio de terceros citado: https://github.com/NguyenFransson94757/path-of-exile-2-map-hack-free/releases/latest
- Paper, blog o demo oficial: no disponible
