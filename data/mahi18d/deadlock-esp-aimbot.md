# mahi18d/deadlock-esp-aimbot

## Resumen

`mahi18d/deadlock-esp-aimbot` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un paquete ejecutable para Windows x64 presentado como herramienta de trampas (ESP y aimbot) para el videojuego Deadlock. El autor lo publica bajo licencia MIT y lo etiqueta con lenguajes y plataformas, pero no incluye pesos, arquitectura ni pipeline de inferencia: el campo `pipeline` aparece como no disponible y el artefacto distribuido es un archivo ZIP de 8,9 MB con un ejecutable `.exe`.

La relevancia de esta ficha es, por tanto, documental y de advertencia. Un repositorio de este tipo no debe evaluarse como un modelo de lenguaje, sino como software de terceros potencialmente malicioso. La model card enlaza a descargas alojadas en un repositorio de GitHub (`Somjai251/deadlock-esp-aimbot`), incluye una contraseña de extracción y recomienda ejecutar el binario como administrador, además de indicar cómo evitar las alertas de Windows Defender y SmartScreen. Esos patrones son característicos de la distribución de software no verificado.

Desde la perspectiva de un desarrollador o investigador que busque un modelo open source, este repositorio no aporta ningún componente reutilizable: no hay tokenizador, no hay ficheros de pesos, no hay código de inferencia y no hay documentación técnica de entrenamiento. Cualquier evaluación de capacidades, benchmarks o requisitos de hardware carece de sentido en este caso y se documenta como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, no capacidades del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP de 8,9 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto descrito en la model card es un binario `deadlock-esp-aimbot-v1.2.0-win64.exe` (build `v3.7.9`, firma `C3F5F02C1E`) empaquetado en `deadlock-esp-aimbot-v1.2.0-win64.zip`. La documentación menciona componentes como un núcleo externo en modo usuario, una capa de renderizado basada en Desktop Duplication, suavizado de entrada Bézier y perfiles JSON intercambiables en caliente, pero no se aporta código fuente, hash verificable ni análisis técnico independiente.

Tampoco hay información sobre datos de entrenamiento, ajuste fino, RLHF o DPO, porque no aplica. La única información verificable es la metadata del repositorio de Hugging Face (creado el 23 de noviembre de 2026, actualizado el 24 de noviembre de 2026, cero descargas y cero likes en el momento de la consulta).

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son etiquetas de metadata del repositorio.
- El artefacto se presenta como herramienta de trampas para un videojuego, con funciones declaradas de ESP (cajas 2D/3D, esqueletos, distancia) y aimbot con suavizado configurable.
- No se ha verificado de forma independiente ninguna de las capacidades declaradas en la model card.

## Casos de uso

- No aplica como modelo de IA en ningún pipeline de generación de texto, código, visión o audio.
- Auditoría de seguridad: analizar el binario en un entorno aislado para determinar su comportamiento real antes de cualquier uso.
- Investigación de malware y campañas de distribución: estudiar los patrones de la model card (contraseña de extracción, instrucciones para desactivar Defender, enlaces a releases de GitHub) como ejemplo de ingeniería social.
- Formación en ciberseguridad: usar el caso como material didáctico sobre riesgos de ejecutar binarios no firmados como administrador.
- Moderación de plataformas: identificar este tipo de repositorios para aplicar políticas de contenido en Hugging Face u otros hubs.
- No se recomienda su uso para trampas en videojuegos: vulnera los términos de servicio de Deadlock, puede conllevar el baneo de la cuenta y expone el equipo a ejecución de código no verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma declarada: Windows 10 u 11 de 64 bits sobre procesadores Intel o AMD x64.
- VRAM estimada: no disponible (no requiere GPU para inferencia de IA; el artefacto es un ejecutable de 8,9 MB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica en el sentido de inferencia de modelos.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; no es un modelo.
- Latencia y throughput: no disponibles; la model card menciona cifras de polling (373 Hz, 329 Hz, 346 Hz) sin verificación independiente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mahi18d/deadlock-esp-aimbot` | Ejecutable Windows (no IA) | no disponible | no disponible | MIT | Hugging Face + releases de GitHub |
| Modelos de lenguaje open source (p. ej. Llama, Mistral, Qwen) | LLM transformer | miles de millones | miles de tokens | licencias abiertas | Hugging Face, pesos safetensors/GGUF |
| Herramientas anti-cheat legitimas (p. ej. EAC, BattlEye) | Software de seguridad | no aplica | no aplica | propietaria | distribución comercial |

No existe una categoría comparable de modelos de IA para este repositorio; la comparativa con LLM se incluye únicamente para dejar constancia de que no son equivalentes.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en trabajos técnicos.
- Riesgo de seguridad alto: la model card pide ejecutar el binario como administrador y ofrece instrucciones para evitar alertas de Windows Defender y SmartScreen.
- El binario se distribuye con contraseña de extracción (`2026`), un patrón habitual para evadir análisis automatizados.
- No hay código fuente, hash verificable ni auditoría independiente del ejecutable.
- El uso de trampas en Deadlock vulnera los términos de servicio del juego y puede provocar el baneo permanente de la cuenta.
- La licencia MIT del repositorio no garantiza la legalidad ni la seguridad del binario distribuido.
- Los idiomas listados son etiquetas de metadata y no implican capacidades multilingües del artefacto.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mahi18d/deadlock-esp-aimbot
- Repositorio de GitHub referenciado en la model card: https://github.com/Somjai251/deadlock-esp-aimbot
- Releases referenciadas: https://github.com/Somjai251/deadlock-esp-aimbot/releases/latest
- Descarga directa citada en la model card: https://github.com/Somjai251/deadlock-esp-aimbot/releases/latest/download/deadlock-esp-aimbot-v1.2.0-win64.zip
