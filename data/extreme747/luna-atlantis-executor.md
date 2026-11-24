# Extreme747/luna-atlantis-executor

## Resumen

El repositorio `Extreme747/luna-atlantis-executor` no contiene un modelo de inteligencia artificial en el sentido habitual del término. Se trata de un paquete ejecutable para Windows distribuido a través de Hugging Face que se presenta como un "executor" de scripts Luau, asociado en su model card a un supuesto entrenador o cheat para el videojuego *Schedule 1*. No hay pesos, arquitectura de red neuronal, tokenizador ni pipeline de inferencia: los tags del repositorio son `windows`, `windows-11`, `x64`, `portable` y el nombre del propio ejecutable.

La model card describe un binario de 4,8 MB (`schedule-1-cheat-trainer-2026-v1.2.2-win64.zip`) que se distribuye con contraseña de descompresión (`2026`) y que, según el autor, ofrece compatibilidad con el entorno sUNC, inyección de scripts Luau, un "hub" de scripts y sincronización de offsets tras parches del cliente. Ninguno de estos elementos corresponde a un modelo de lenguaje, visión o audio, y no se proporciona información sobre parámetros, contexto, dataset de entrenamiento ni evaluación alguna.

Desde la perspectiva de un blog técnico sobre IA open source, este artefacto debe clasificarse como software de terceros potencialmente malicioso o, como mínimo, ajeno al ecosistema de modelos. La model card emplea tácticas habituales de distribución de malware (contraseña en el archivo comprimido para evadir análisis automáticos, instrucciones para ejecutar como administrador, enlaces a repositorios de GitHub de terceros, insignias de descargas infladas). No se recomienda su descarga ni ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto distribuido es un binario compilado para Windows 10 (22H2) y Windows 11 (24H2) en arquitectura x64, empaquetado en un ZIP de 4,8 MB protegido con contraseña. La model card menciona componentes como "Luau VM bridge", "hookmetamethod", "getgc", "Drawing API" y "sincronización de offsets tras parches", que son propios de herramientas de inyección de scripts en entornos de ejecución de videojuegos, no de un sistema de aprendizaje automático.

No se documenta ningún proceso de entrenamiento, dataset, número de tokens, técnica de alineación (RLHF, DPO) ni innovación en atención o decodificación. Cualquier afirmación sobre "rendimiento" en la model card (por ejemplo, "respuesta en menos de 18 ms" o "98%+ sUNC") carece de metodología verificable y no procede de una evaluación de modelo.

## Capacidades

- No es un modelo generativo: no produce texto, código, imágenes ni audio.
- No soporta tool calling ni function calling en el sentido de una API de modelo.
- No implementa razonamiento multi-paso ni agentes basados en LLM.
- Las capacidades que declara la model card son de manipulación de procesos y ejecución de scripts Luau en el cliente de un videojuego, lo que queda fuera del ámbito de esta ficha.
- Los idiomas listados en los metadatos son etiquetas del repositorio, no capacidades lingüísticas verificadas.

## Casos de uso

No se identifican casos de uso legítimos dentro del desarrollo de IA o de software en general. Los escenarios que plantea la model card (inyección de scripts, "cheat trainer", compatibilidad sUNC) están orientados a la modificación no autorizada de un cliente de juego y, en la mayoría de jurisdicciones y plataformas, violan los términos de servicio y pueden constituir una infracción legal. Se desaconseja cualquier uso.

- No aplicable: generación de texto o código.
- No aplicable: asistentes conversacionales.
- No aplicable: pipelines de datos o RAG.
- No aplicable: despliegue en producción de servicios de IA.
- No aplicable: investigación en modelos de lenguaje.
- No aplicable: evaluación comparativa de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de latencia ("< 18 ms", "< 32 ms") y compatibilidad ("98%+ sUNC") sin metodología, sin conjunto de pruebas y sin reproducibilidad, por lo que no constituyen benchmarks válidos de un modelo de IA.

## Requisitos de hardware

- No aplica: no hay inferencia de modelo que ejecutar.
- El artefacto requiere un sistema Windows 10 (22H2) o Windows 11 (24H2) de 64 bits.
- El paquete ZIP ocupa 4,8 MB; el binario extraído no se especifica.
- No se requieren GPU, VRAM ni aceleradores.
- No hay soporte de vLLM, llama.cpp, Ollama ni TGI, porque no hay pesos de modelo.
- No se dispone de datos de latencia o throughput verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" en la que encaje este artefacto; compararlo con un LLM, un modelo de visión o un modelo multimodal sería un error categorial. Los únicos elementos comparables serían otros ejecutables de la misma naturaleza, lo que queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y pipeline de inferencia.
- Distribución con contraseña en el ZIP (`2026`), táctica habitual para evadir el análisis automático de antivirus y plataformas.
- Instrucciones explícitas de ejecutar como administrador, lo que amplía el impacto potencial de cualquier carga maliciosa.
- Enlaces de descarga apuntan a repositorios de GitHub de terceros no verificados, no al propio repositorio de Hugging Face.
- Insignias de descargas ("253K+") no verificables y probablemente falsas.
- La licencia MIT declarada no aporta garantía alguna sobre la seguridad del binario.
- Riesgo alto de malware, robo de credenciales, mineros o ransomware.
- Posible violación de términos de servicio de plataformas de juego y de la legislación aplicable.
- Se recomienda no descargar, no extraer y no ejecutar el archivo; si ya se ha hecho, analizar el sistema con herramientas de seguridad actualizadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Extreme747/luna-atlantis-executor
- Repositorio GitHub citado en la model card (no verificado): https://github.com/Oh90345/luna-atlantis-executor
- Repositorio GitHub de releases citado en la model card (no verificado): https://github.com/francescoc822/schedule-1-cheat-trainer-2026
- Paper: no disponible
- Blog o demo oficial: no disponible
