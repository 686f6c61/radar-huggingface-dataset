# fluffyarachnid/supermarket-simulator-cheat-trainer

## Resumen

El artefacto publicado bajo el identificador `fluffyarachnid/supermarket-simulator-cheat-trainer` en Hugging Face no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un paquete ejecutable para Windows x64 (un supuesto "cheat trainer" o entrenador de trampas para el videojuego *Supermarket Simulator*) distribuido a través de la plataforma, con un archivo ZIP de 4,8 MB que contiene un binario `.exe` y que requiere una contraseña de extracción.

La model card no describe ninguna arquitectura de red neuronal, ningún conjunto de datos de entrenamiento, ni ningún proceso de ajuste (RLHF, DPO o similar). Los campos técnicos habituales (parámetros, contexto, cuantización, formato de pesos) no son aplicables: el contenido es un ejecutable que, según la propia descripción, realiza lecturas de memoria de proceso, superposición gráfica (overlay) e inyección de entradas sobre el juego objetivo.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando explícitamente que no constituye un modelo de IA evaluable. Se recomienda máxima cautela: la distribución de binarios ofuscados con contraseña, procedentes de repositorios de terceros y con nombres de archivo que no coinciden con el proyecto declarado (referencias a `inzoi-cheat-trainer` en un paquete de *Supermarket Simulator*), es un patrón habitual de malware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible; el artefacto es un ZIP con un `.exe` (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`) |
| Plataforma | Windows / Windows 11, x64, portable |
| Tamaño del paquete | 4,8 MB |
| Versión declarada | v3.1.8 (build D71C2F) |
| Contraseña del ZIP | 2026 (según la model card) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. La documentación del repositorio describe un "user-mode external core" que, según el autor, opera mediante Desktop Duplication sin hooks de DLL internos, con sondeo a 218 Hz, suavizado de entrada por curvas de Bézier, radar 2D con filtrado de objetos por rareza, overlay externo a 144 Hz o más, tecla de pánico (`END`) para descarga instantánea y perfiles JSON intercambiables en caliente.

No se proporciona información sobre datos de entrenamiento, proceso de ajuste, evaluación o metodología de desarrollo. Las afirmaciones de rendimiento de la model card (por ejemplo, "96,5 % de consistencia" o "menos de 25 ms de respuesta") no van acompañadas de ninguna evidencia verificable ni de código fuente auditable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de tool calling ni de function calling en el sentido de los modelos de IA.
- No soporta agentes ni razonamiento multi-paso.
- El artefacto declara, según su propia descripción, funcionalidades de modificación de un videojuego: lectura de memoria del proceso, overlay con cajas delimitadoras y esqueletos, radar 2D, filtrado de objetos y perfiles de configuración.
- La lista de idiomas del repositorio es una etiqueta de metadatos, no una capacidad multilingüe real del binario.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA: el artefacto no permite inferencia, generación ni procesamiento de lenguaje natural.
- No es adecuado para atención al cliente, generación de código, análisis de documentos, RAG ni ninguna tarea de NLP.
- Su uso declarado (trampas en un videojuego) puede infringir los términos de servicio del juego y las políticas de la plataforma de distribución.
- No debe integrarse en pipelines de producción, CI/CD ni en entornos corporativos.
- No debe ejecutarse en máquinas con datos sensibles: un binario ofuscado y protegido con contraseña no es auditable.
- Cualquier evaluación técnica del artefacto debería realizarse en una máquina virtual aislada y sin red, únicamente con fines de análisis de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (218 Hz de sondeo, 198 Hz, overlay a 144 Hz o más, menos de 53 MB de RAM, 96,5 % de consistencia) son afirmaciones del autor sin metodología ni verificación independiente, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- Sistema operativo: Windows o Windows 11, x64 (según la model card).
- CPU: Intel o AMD x64; no se especifican requisitos mínimos.
- RAM: el autor afirma un uso inferior a 53 MB, dato no verificado.
- GPU: no se especifica; el overlay se describe como "external", sin requisitos de VRAM declarados.
- Almacenamiento: 4,8 MB para el ZIP; espacio adicional para la extracción.
- Opciones de despliegue: ejecución directa del `.exe` como administrador, según las instrucciones del autor. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fluffyarachnid/supermarket-simulator-cheat-trainer` | Ejecutable Win64 (no es modelo de IA) | no aplica | no aplica | MIT | Hugging Face, 0 descargas |
| Modelos de lenguaje open source (p. ej. familias Llama, Qwen, Mistral) | Modelos transformer | Miles de millones | Miles de tokens | Variables (Apache 2.0, Llama, etc.) | Hugging Face, ampliamente auditados |
| Herramientas legítimas de modding de videojuegos | Código fuente o scripts | no aplica | no aplica | Variables | Repositorios públicos auditables |

No existe una categoría comparable de "modelos de IA" para este artefacto; la comparación con modelos de lenguaje solo procede para dejar constancia de que no pertenece a esa categoría.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- Riesgo de seguridad elevado: binario ofuscado, protegido con contraseña (`2026`), alojado en repositorios de GitHub de terceros y con nombres de archivo incoherentes con el proyecto declarado (`inzoi-cheat-trainer` frente a *Supermarket Simulator*).
- Las instrucciones piden ejecutar como administrador, lo que amplía el impacto potencial de cualquier código malicioso.
- Posible infracción de los términos de servicio del videojuego y de las políticas de la plataforma.
- Sin código fuente, sin trazabilidad de build y sin auditoría independiente.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Licencia MIT declarada en los metadatos, pero sin implicaciones prácticas para un binario no auditable.
- No debe ejecutarse en equipos personales o corporativos sin aislamiento (máquina virtual, sandbox, sin red).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fluffyarachnid/supermarket-simulator-cheat-trainer
- Repositorio de GitHub referenciado en la model card (descarga del ZIP): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub alternativo referenciado: https://github.com/brunawhite78/supermarket-simulator-cheat-trainer/releases/latest
- Paper, blog o demo oficial: no disponible.
