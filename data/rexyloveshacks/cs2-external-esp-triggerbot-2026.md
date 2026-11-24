# RexyLoveshacks/cs2-external-esp-triggerbot-2026

## Resumen

El artefacto publicado bajo el identificador `RexyLoveshacks/cs2-external-esp-triggerbot-2026` no es un modelo de inteligencia artificial ni un modelo de lenguaje: es un paquete ejecutable para Windows x64 distribuido a través de Hugging Face, etiquetado como *external ESP* y *triggerbot* para el videojuego Counter-Strike 2. La model card describe módulos de superposición gráfica (cajas 2D/3D, esqueletos de huesos, radar 2D), suavizado de entrada tipo Bézier, escáner dinámico de offsets y una tecla de pánico (`END`) para descargar el proceso. El binario se distribuye como archivo ZIP protegido con contraseña (`2026`) que contiene un ejecutable denominado `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`.

No existe información alguna sobre arquitectura de red neuronal, parámetros, tokenizador, contexto, pesos o datos de entrenamiento. El repositorio no tiene descargas ni *likes*, y la model card mezcla referencias a un supuesto proyecto de *cheat/trainer* para otro juego (Inzoi) con enlaces a un repositorio de GitHub de terceros, lo que apunta a una plantilla reutilizada o a un señuelo. Cualquier evaluación como modelo de IA es, por tanto, imposible: los campos técnicos de esta ficha se marcan como no disponibles.

La relevancia de esta entrada es negativa y conviene señalarla con claridad: se trata de software de trampas para un juego multijugador, distribuido con técnicas típicas de ingeniería social (contraseña en el archivo, instrucciones de ejecución como administrador, insignias falsas de descargas y valoraciones, enlaces a binarios alojados en GitHub). No debe tratarse como un modelo open source evaluable ni ejecutarse en entornos de producción o de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades del binario) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip`, 4,8 MB) con un `.exe` en su interior |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. La model card menciona componentes de un programa nativo para Windows: capa de renderizado externa con exclusión de capturas (OBS, ShadowPlay, Discord), escáner de firmas para resolver offsets tras parches del juego, suavizado de movimiento mediante curvas Bézier con radio de FOV configurable y comprobación de visibilidad, y descarga del proceso mediante tecla de pánico declarada en menos de 18 ms. Son descripciones de funcionalidad de un *cheat*, no de un sistema entrenado.

No se documentan datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO ni ninguna innovación en aprendizaje automático. La etiqueta `pipeline` del repositorio está vacía y no hay tarjetas de modelo, configuraciones ni ficheros de pesos asociados.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de *tool calling* ni de *function calling*.
- No hay soporte de agentes ni de razonamiento multi-paso.
- Las etiquetas multilingües del repositorio no implican capacidades lingüísticas del binario.
- Funcionalidad declarada por el autor (no verificada y no relacionada con IA): superposición ESP con cajas 2D/3D y esqueletos, radar 2D con filtro de objetos por rareza, *triggerbot* con suavizado Bézier, escáner de offsets y tecla de pánico.

## Casos de uso

- Ninguno legítimo en el ámbito de IA, desarrollo de software o investigación.
- Uso en un videojuego multijugador: vulnera los términos de servicio de Counter-Strike 2 y de Steam, y puede conllevar el baneo permanente de la cuenta.
- Uso como caso de estudio de seguridad: sirve como ejemplo de distribución de binarios opacos mediante repositorios de modelos, con contraseña en el archivo y ejecución como administrador.
- Uso en análisis de malware defensivo: el patrón (ZIP con contraseña, insignias falsas de descargas, enlaces a releases de terceros) es representativo de campañas de señuelo.
- Uso en docencia sobre ingeniería social: ilustra cómo se reutilizan plantillas de model cards ajenas para dar apariencia de legitimidad.
- Uso en auditoría de plataformas: ejemplo de contenido que debería quedar fuera de un hub de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (descargas, valoración 4,9/5, consistencia del 97,2 %, respuesta en menos de 18 ms) son afirmaciones del autor sin metodología ni verificación, y no constituyen benchmarks de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, sobre procesadores Intel y AMD x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo de lenguaje open source típico |
|---|---|---|
| Naturaleza | Ejecutable x64 para Windows | Red neuronal con pesos publicados |
| Pesos | No disponibles | safetensors, GGUF, etc. |
| Contexto | No disponible | Decenas de miles de tokens |
| Licencia | MIT (metadatos) | Apache 2.0, MIT, licencias comunitarias |
| Uso comercial | No evaluable | Habitualmente permitido con condiciones |
| Riesgo de seguridad | Alto (binario opaco, ejecución como administrador) | Bajo o moderado |
| Verificabilidad | Nula | Reproducible con evaluación estándar |

No se identifican modelos comparables en la misma categoría dentro del ecosistema de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni ninguna métrica de modelos de lenguaje.
- El binario se distribuye comprimido con contraseña y se indica ejecutarlo como administrador, lo que impide inspección previa sencilla y eleva el riesgo de ejecución de código malicioso.
- La model card mezcla identidades (Counter-Strike 2, Inzoi, repositorios de GitHub de terceros) y contiene insignias de descargas y valoraciones no verificables: indicios claros de plantilla reutilizada o de señuelo.
- El uso del software en Counter-Strike 2 infringe los términos de servicio y puede provocar el baneo de la cuenta; en algunas jurisdicciones el desarrollo o la distribución de trampas puede tener consecuencias legales.
- La licencia MIT declarada no aporta garantías sobre el contenido del binario ni sobre su legalidad en el contexto de uso previsto.
- Cero descargas y cero *likes* en el momento de la consulta: sin evidencia de uso ni de revisión por la comunidad.
- No debe ejecutarse en máquinas de desarrollo, CI/CD ni entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RexyLoveshacks/cs2-external-esp-triggerbot-2026
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub, terceros): https://github.com/Rezende21949/cs2-external-esp-triggerbot-2026/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
