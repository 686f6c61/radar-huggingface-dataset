# sabamana/subnautica-2-coop-trainer

## Resumen

No es un modelo de IA. El identificador `sabamana/subnautica-2-coop-trainer` corresponde, segun los metadatos y la model card publicados en Hugging Face, a un artefacto de tipo `generic` con `pipeline_tag: other` que se presenta como un *trainer* (utilidad de trampas o modificación de memoria) para el modo cooperativo de Subnautica 2, junto con lo que el autor denomina un desbloqueador de consola para Unreal Engine 5. No contiene pesos neuronales, tokenizador, configuración de arquitectura ni ningún componente propio de un modelo de lenguaje.

La ficha se ha creado el 25 de noviembre de 2026, cuenta con cero descargas y cero *likes*, y su model card mezcla enlaces a repositorios de GitHub, un archivo `.zip` alojado en un *release* de un tercer repositorio y una contraseña de extracción. Ese patrón —binario precompilado de procedencia no verificable, contraseña en el README y redirecciones a repositorios ajenos al autor— es característico de las campañas de distribución de *malware* que abusan de plataformas de modelos para ganar visibilidad.

Por tanto, esta entrada no debe evaluarse como un modelo de IA. Se documenta aquí para advertir de que no es apto para ningún uso en desarrollo o investigación, y para dejar constancia de que cualquier descarga o ejecución del binario enlazado conlleva un riesgo de seguridad elevado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto `generic`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, pt, de, fr, tr, pl, ja, ko, id, vi, zh (etiquetas de localización del artefacto, no capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el autor distribuye un `.zip` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. Los metadatos describen una compilación para Windows 10 (22H2+) y Windows 11 (23H2/24H2) de 64 bits, con supuestas optimizaciones de alineación de registros vectoriales AVX2 y configuración recargable en caliente mediante `config/settings.json`. El autor afirma que el artefacto se ejecuta sobre DirectX 12 y Vulkan 1.3, y menciona XeSS y *async compute* en su matriz de rendimiento.

No se publica información sobre datos de entrenamiento, proceso de alineación (RLHF, DPO) ni innovación técnica alguna en el sentido en que se aplica a un modelo de lenguaje. La única "innovación" declarada es la modificación en tiempo de ejecución de un videojuego de terceros, lo que además puede contravenir los términos de servicio del juego.

## Capacidades

- No genera texto, no razona, no escribe código y no resuelve problemas matemáticos: carece de cualquier capacidad cognitiva propia de un modelo de IA.
- No soporta *tool calling* ni *function calling*.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las doce etiquetas de idioma corresponden a secciones de localización de la model card.
- El autor declara funciones de *trainer* para el modo cooperativo y un supuesto desbloqueador de consola de Unreal Engine 5, sin documentación técnica verificable.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo de IA y no encaja en ningún flujo de desarrollo, investigación, generación de código ni análisis de datos.
- Evaluación de riesgos de cadena de suministro: puede servir como caso de estudio de *malware* distribuido a través de plataformas de modelos, analizando el patrón de repositorios señuelo y contraseñas de extracción.
- Formación en seguridad: útil para ilustrar por qué no deben ejecutarse binarios precompilados de autores sin historial ni trazabilidad.
- Auditoría de políticas de plataforma: ejemplo de contenido que debería activar los filtros de moderación de Hugging Face.
- No debe emplearse en entornos de producción, CI/CD, atención al cliente ni generación de código bajo ninguna circunstancia.
- Cualquier uso del binario enlazado implica ejecutar código de procedencia desconocida con privilegios de usuario en un sistema Windows.

## Benchmarks y rendimiento

La model card incluye una tabla de "telemetría" con latencias de *frame pacing* y consumo de memoria del binario, no resultados de benchmarks de modelos de lenguaje. Se reproduce a título informativo, sin que constituya una validación independiente:

| Perfil de hardware | API | Latencia p99 declarada | Memoria | Verificación |
|---|---|---|---|---|
| RTX 4070 / Ryzen 7 7800X3D (Win 11 24H2) | DX12 / Vulkan 1.3 | 1,42 ms (+48 % en 1 % low FPS) | 44,8 MB | PASS (SHA-256) |
| RTX 3060 / Core i5-13600K (Win 11 23H2) | DX12 / AVX2 | 1,89 ms (+41 % en 1 % low FPS) | 42,4 MB | PASS (SHA-256) |
| RX 7800 XT / Ryzen 5 7600X (Win 10 22H2) | Vulkan / Async Compute | 1,65 ms (+44 % en 1 % low FPS) | 43,1 MB | PASS (SHA-256) |
| Arc A770 / Core i7-12700K (Win 11 24H2) | XeSS / DX12 SwapChain | 2,15 ms (+37 % en 1 % low FPS) | 45,2 MB | PASS (SHA-256) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje en la información disponible, porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar en memoria de GPU.
- GPU recomendadas: no aplica en el sentido de inferencia; el autor menciona GPUs de consumo (RTX 4070, RTX 3060, RX 7800 XT, Arc A770) como plataformas de ejecución del binario.
- Compatibilidad con GPU de consumo: el artefacto declara ejecutarse en Windows 10/11 x64 con DirectX 12 o Vulkan 1.3.
- Opciones de despliegue: no aplica (no hay soporte para vLLM, llama.cpp, Ollama ni TGI).
- Latencia y rendimiento: los únicos datos son los de la tabla anterior, autodeclarados y no verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Frente a otros artefactos de la misma naturaleza (utilidades de modificación de juegos), la comparación carece de interés técnico y no se dispone de datos verificables de ninguno de ellos.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para generación de texto, código, razonamiento ni ninguna tarea cognitiva.
- Riesgo de seguridad alto: el README redirige a un `.zip` alojado en el repositorio de un tercero (`pedrolong1343/nv-uefi-unlocker-vram-bios-suite`), no en el del autor declarado, y exige una contraseña de extracción (`2026`), táctica habitual para evadir análisis automatizados.
- Los enlaces a GitHub, `github.io`, `pkg.go.dev` y `nbviewer.org` apuntan a repositorios y cuentas distintas entre sí, lo que sugiere una red de señuelos para posicionamiento y confianza.
- Cero descargas y cero *likes*: sin validación por parte de la comunidad.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario distribuido ni sobre su procedencia.
- El uso de *trainers* en juegos cooperativos puede violar los términos de servicio de Subnautica 2 y acarrear el bloqueo de la cuenta.
- No debe ejecutarse en máquinas de desarrollo, servidores ni entornos con datos sensibles.
- Se recomienda reportar la entrada a Hugging Face para su revisión y retirada.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/sabamana/subnautica-2-coop-trainer
- Repositorio GitHub citado como "Day-0": https://github.com/rinchao0721/subnautica-2-coop-trainer
- Repositorio GitHub citado como "Primary": https://github.com/paulamatsumoto3093/subnautica-2-coop-trainer
- Gateway `github.io` citado: https://paulamatsumoto3093.github.io/subnautica-2-coop-trainer/
- Documentación en `pkg.go.dev` citada: https://pkg.go.dev/github.com/rinchao0721/subnautica-2-coop-trainer
- Notebook en `nbviewer.org` citado: https://nbviewer.org/github/rinchao0721/subnautica-2-coop-trainer/blob/main/notebooks/quickstart.ipynb
- Release `.zip` de terceros citado (no descargar): https://github.com/pedrolong1343/nv-uefi-unlocker-vram-bios-suite/releases/download/v2.5.6/nv-uefi-unlocker-vram-bios-suite-v2.5.6-win64.zip
