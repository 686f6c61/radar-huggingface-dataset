# piquolo/sekiro-shadows-die-twice-goty-editio-cheat

## Resumen

`piquolo/sekiro-shadows-die-twice-goty-editio-cheat` es un repositorio alojado en Hugging Face que, a pesar de su ubicación, no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 etiquetado como "cheat trainer" (herramienta de trucos) para el videojuego *Sekiro: Shadows Die Twice - GOTY Edition*. El autor, `piquolo`, lo publica bajo licencia MIT y lo distribuye como archivo ZIP portable de 4,8 MB con contraseña de extracción.

El contenido de la model card describe módulos de overlay externo, suavizado de entrada tipo Bézier, perfiles JSON intercambiables en caliente y una tecla de pánico (`END`) para descargar el proceso. No hay arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia: el campo `pipeline` figura como no disponible y las descargas e interacciones son cero en el momento de la consulta.

Desde la perspectiva de un catálogo de modelos open source, esta ficha documenta un artefacto que **no es un modelo de IA**. Se incluye por rigor y para advertir a desarrolladores e investigadores de que el repositorio no debe evaluarse como un LLM ni ejecutarse en entornos de producción. La relevancia técnica es nula para tareas de NLP, visión o generación; su único interés es como ejemplo de contenido mal etiquetado dentro de un hub de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de trucos para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos de la model card, no capacidades lingüísticas del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como ZIP con un `.exe`; no hay safetensors, GGUF ni binarios de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto es un binario Windows x64 (`dandys-world-forsaken-script-2026-v1.2.2-win64.exe`, build `v1.6.2` / `3FE3EF`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card menciona un "user-mode external core" con renderizado por Desktop Duplication, sin hooks DLL internos, y un consumo declarado inferior a 41 MB de RAM para el núcleo, 51 MB para el overlay y 27 MB para el módulo de suavizado de entrada.

No hay datos de entrenamiento, número de tokens, composición de dataset, RLHF, DPO ni innovaciones de inferencia (atención lineal, decodificación especulativa, etc.). Los términos "entrenamiento" y "arquitectura" no aplican a este repositorio.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los 14 idiomas listados son etiquetas de metadatos de la model card.
- El artefacto declara funcionalidades de trucos para el videojuego: overlay externo a 144 Hz o más, cajas delimitadoras 2D/3D, esqueletos de huesos, ESP de distancia, suavizado de entrada Bézier con radio FOV configurable y VisCheck, perfiles JSON conmutables con una tecla y descarga de pánico con la tecla `END`.
- Estas funcionalidades no son capacidades de IA y no se han verificado de forma independiente.

## Casos de uso

- **Ninguno recomendado en producción de IA.** El artefacto no procesa lenguaje, imágenes ni audio, por lo que no encaja en pipelines de NLP, visión, RAG, agentes ni generación de código.
- **Auditoría de contenido mal etiquetado en hubs de modelos:** un equipo de gobernanza puede usar este repositorio como caso de estudio para diseñar filtros que detecten paquetes ejecutables disfrazados de modelos y evitar que se descarguen en entornos corporativos.
- **Formación en seguridad:** sirve como ejemplo didáctico de model cards que incluyen enlaces de descarga externos, contraseñas de extracción y binarios `.exe`, patrón habitual en campañas de distribución de software potencialmente no deseado.
- **Investigación sobre taxonomías de artefactos:** permite ilustrar la diferencia entre pesos de modelo (safetensors, GGUF), datasets y binarios de aplicación dentro de un mismo hub.
- **Pruebas de políticas de admisión:** un equipo de plataforma puede validar que sus reglas bloquean repositorios sin pipeline, sin pesos y con etiquetas de sistema operativo en lugar de etiquetas de tarea.
- **Documentación de incidencias:** útil para registrar en un catálogo interno por qué ciertos repositorios se marcan como "no evaluables" y se excluyen de los benchmarks de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, y no procede compararlo con modelos de lenguaje.

## Requisitos de hardware

- **VRAM para inferencia:** no aplica; no hay pesos ni inferencia neuronal.
- **Requisitos declarados:** Windows 10 u 11 de 64 bits, ejecución como administrador y extracción previa del ZIP con 7-Zip o WinRAR.
- **Memoria RAM declarada por el autor:** menos de 41 MB para el núcleo, menos de 51 MB para el overlay y menos de 27 MB para el módulo de suavizado (cifras no verificadas).
- **GPU recomendadas:** no disponibles; el autor no especifica requisitos de GPU.
- **Compatibilidad con GPU de consumo:** no disponible.
- **Opciones de despliegue:** no aplica (vLLM, llama.cpp, Ollama o TGI no pueden ejecutar este artefacto).
- **Latencia y throughput:** el autor declara tiempos de respuesta inferiores a 16 ms para el renderizado, inferiores a 10 ms para el cambio de perfiles y sondeo a 311 Hz; no hay mediciones independientes.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Frente a otros repositorios del hub, la comparación relevante sería con otros paquetes ejecutables mal etiquetados, y no se dispone de datos de esos casos en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de IA:** no debe evaluarse, desplegarse ni citarse como LLM, modelo multimodal o modelo de código.
- **Riesgo de seguridad:** se distribuye un ejecutable `.exe` alojado en GitHub Releases y no en el propio hub, con contraseña de extracción; este patrón es habitual en la distribución de software no verificado. No se ha auditado el binario.
- **Alertas de Defender y SmartScreen:** la propia model card reconoce que las comprobaciones heurísticas pueden marcar el binario, lo que sugiere ausencia de firma de código o reputación establecida.
- **Licencia MIT:** permite uso comercial y modificación del contenido del repositorio, pero no otorga garantías ni exime de responsabilidad al usuario del binario.
- **Sesgos y alucinación:** no aplican como tales, al no haber modelo generativo; el riesgo equivalente es la promesa de funcionalidades no verificadas en la model card.
- **Uso en producción:** desaconsejado por completo en cualquier entorno corporativo, académico o de investigación.
- **Idiomas:** los 14 idiomas listados son etiquetas de la model card y no implican soporte lingüístico real del artefacto.
- **Contexto:** no disponible; no existe ventana de contexto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/piquolo/sekiro-shadows-die-twice-goty-editio-cheat
- Release en GitHub citada en la model card: https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Repositorio GitHub citado en la model card: https://github.com/manfredm654/sekiro-shadows-die-twice-goty-editio-cheat-trainer/releases/latest
- Paper, blog o demo: no disponible
