# hokamu/dune-awakening-cheat-esp-keyless

## Resumen

`hokamu/dune-awakening-cheat-esp-keyless` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un ejecutable de Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como "cheat ESP keyless" para el videojuego Dune: Awakening. El autor es el usuario `hokamu` y la model card describe funciones de overlay externo, ESP (extra sensory perception) con cajas delimitadoras y esqueletos de huesos, suavizado de entrada tipo bezier y escaneo dinámico de offsets, todo ello orientado a obtener ventaja en el juego.

El artefacto se distribuye como binario precompilado para Windows 10 (22H2) y Windows 11 (24H2), con un ZIP protegido por contraseña (`2026`) y enlaces de descarga que apuntan a repositorios de GitHub de terceros (`dawidb9567/delta-executor-pc-2026` y `Chavez46/dune-awakening-cheat-esp-keyless`). No contiene pesos, tokenizador, configuración de transformer ni ningún componente propio de un modelo de lenguaje. La etiqueta `license:mit` y la lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) parecen metadatos genéricos sin relación con el contenido real.

Desde la perspectiva de un editor técnico de IA open source, este repositorio no es evaluable como modelo: no hay arquitectura, parámetros, contexto, cuantizaciones ni benchmarks. Además, la distribución de binarios ofuscados con contraseña y alojados en repositorios ajenos constituye un patrón de riesgo de seguridad (posible malware, troyanos o stealers). La ficha que sigue documenta la ausencia de datos técnicos de IA y advierte de los riesgos, sin validar ni recomendar su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin relación con capacidades reales) |
| Licencia | mit (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un .exe; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario x64 para Windows descrito en la model card como "user-mode external core" con renderizado mediante Desktop Duplication, sin hooks de DLL internos. Según el README, incluye un escáner dinámico de offsets con resolución automática de firmas de punteros tras parches del juego, suavizado de entrada bezier con radio de FOV configurable y comprobación de visibilidad, perfiles JSON intercambiables en caliente y un overlay externo a 144 Hz o más con cajas 2D/3D, esqueletos de huesos y ESP de distancia.

No se documenta ningún conjunto de datos, número de tokens, RLHF, DPO ni innovación de modelado. La única información "técnica" es la relativa al ejecutable: build `v3.1.9 (357CB5EDD3)`, ZIP de 4,8 MB, contraseña de descompresión `2026`, consumo declarado de menos de 21 MB de RAM para el escáner de offsets, menos de 40 MB para el suavizado y menos de 39 MB para los perfiles JSON, con 10 hilos de trabajo. Estos datos provienen exclusivamente de la model card y no han sido verificados de forma independiente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; la lista de idiomas es metadato sin respaldo funcional.
- Según la model card, el binario implementa un overlay externo con ESP (cajas 2D/3D, esqueletos de huesos, distancia), suavizado de puntería y perfiles intercambiables para el juego Dune: Awakening.
- Estas "capacidades" son funciones de trampa (cheat) para un videojuego y no constituyen una aportación técnica reutilizable en IA.

## Casos de uso

- No procede: al no ser un modelo de IA, no existen casos de uso legítimos de inferencia, generación, análisis o despliegue en pipelines de IA.
- Un desarrollador o investigador no puede integrar este artefacto en vLLM, llama.cpp, Ollama, TGI ni en ninguna plataforma de serving de modelos.
- No es utilizable para atención al cliente, generación de código, análisis documental, RAG, clasificación, extracción de información ni ninguna tarea de NLP.
- Su único propósito declarado es alterar la experiencia de un videojuego multijugador, lo que puede contravenir los términos de servicio del juego y la legislación aplicable en materia de trampas y manipulación de software.
- Cualquier evaluación técnica del binario exigiría análisis de malware en un entorno aislado, no un caso de uso de IA.
- No se recomienda su descarga ni ejecución en equipos de producción o de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA porque el artefacto no es un modelo. Las únicas cifras del README (98,9 % de consistencia del render, menos de 15 ms de respuesta, consumos de RAM de 21 a 40 MB, 10 hilos) son afirmaciones del autor sobre el ejecutable y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplica; el README menciona renderizado por Desktop Duplication, sin requisitos de GPU documentados.
- Compatibilidad con GPU de consumo: no aplica en el contexto de IA.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Opciones de despliegue: no existen; no es compatible con vLLM, llama.cpp, Ollama, TGI ni similares.
- Latencia y throughput: el README afirma menos de 15 ms de respuesta y un overlay a 144 Hz o más, sin verificación independiente.
- Espacio en disco del artefacto: ZIP de 4,8 MB según la model card.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, ya que el artefacto no es un modelo. A modo de contraste puramente estructural:

| Criterio | Este repositorio | Modelo de IA open source típico |
|---|---|---|
| Naturaleza | Ejecutable de Windows comprimido | Pesos y configuración de red neuronal |
| Pesos | No contiene | safetensors, GGUF, etc. |
| Inferencia | No aplica | vLLM, llama.cpp, TGI, Ollama |
| Evaluación | Imposible con metodología de IA | Benchmarks reproducibles (MMLU, HumanEval) |
| Licencia | MIT declarada | MIT, Apache-2.0, licencias comunitarias |
| Riesgo de seguridad | Alto (binario ofuscado con contraseña y alojamiento externo) | Bajo o moderado según procedencia |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, citarse ni desplegarse como tal en contextos de investigación o producción.
- El binario se distribuye comprimido con contraseña (`2026`) y alojado en repositorios de GitHub de terceros, un patrón habitual en campañas de distribución de malware.
- El contenido no es auditable sin análisis forense; ejecutarlo como administrador supone un riesgo elevado de compromiso del sistema.
- El uso de trampas en juegos multijugador puede violar los términos de servicio, provocar el baneo de cuentas y tener implicaciones legales según la jurisdicción.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del binario; la licencia cubre el metadato del repositorio, no el software distribuido por canales externos.
- Los metadatos de idiomas, descargas (0) y likes (0) no aportan ninguna señal de calidad ni de adopción.
- No hay paper, repositorio de código fuente, demo ni documentación técnica verificable.
- Se desaconseja su descarga, extracción y ejecución en cualquier entorno.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hokamu/dune-awakening-cheat-esp-keyless
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Repositorio de releases citado en la model card (no verificado, no recomendado): https://github.com/Chavez46/dune-awakening-cheat-esp-keyless/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
