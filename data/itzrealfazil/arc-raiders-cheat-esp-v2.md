# itzrealfazil/arc-raiders-cheat-esp-v2

## Resumen

`itzrealfazil/arc-raiders-cheat-esp-v2` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un ejecutable de Windows (`arc-raiders-cheat-esp-v2-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) presentado por su autor como una herramienta de trampas (cheat) con overlay ESP para el videojuego Arc Raiders. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje, y su pipeline no está declarado.

La model card describe funcionalidades de overlay externo (cajas 2D/3D, esqueletos de huesos, ESP de distancia), perfiles JSON intercambiables en caliente, un núcleo en modo usuario sin hooks DLL, una tecla de pánico (`END`) y una capa de render que, según el autor, evita la captura por OBS, ShadowPlay y Discord. Ninguna de estas afirmaciones es verificable a partir de la información disponible, y no se aporta documentación técnica, código fuente ni resultados de evaluación.

Desde la perspectiva de un catálogo de modelos open source, esta ficha debe leerse como una advertencia: el artefacto no es desplegable como modelo, su licencia MIT declarada no cubre el uso legítimo de un cheat en un juego de terceros, y la distribución de binarios ofuscados con contraseña de extracción constituye un vector de riesgo de seguridad bien documentado. No se recomienda su descarga ni su ejecución en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos; sin funcionalidad lingüística verificable) |
| Licencia | MIT (declarada por el autor) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows 10/11 x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto distribuido es un ejecutable nativo de Windows x64 (`v3.4.7`, identificador de build `35DDCCBBE0`) empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. La model card menciona un "núcleo externo en modo usuario" que utiliza Desktop Duplication para el renderizado, sin inyección de DLL en el proceso objetivo, y un escáner dinámico de offsets con resolución automática de firmas de punteros tras los parches del juego.

No se proporciona información sobre datos de entrenamiento, proceso de alineación (RLHF, DPO) ni innovaciones técnicas verificables, porque el artefacto no es un modelo entrenado. Las afirmaciones de rendimiento de la model card (overlay a 144 Hz, sondeo a 200 Hz y 373 Hz, consumo inferior a 37-40 MB de RAM, consistencia del 99,5 %) son declaraciones del autor sin evidencia adjunta, sin código fuente y sin metodología de medición.

## Capacidades

- No ofrece generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los 14 códigos de idioma del repositorio son etiquetas de metadatos.
- Funcionalidad declarada por el autor (no verificada): overlay ESP con cajas 2D/3D, esqueletos de huesos y distancia; perfiles JSON intercambiables (Legit, Visual, Custom); tecla de pánico `END` con liberación de handles; exclusión de captura en OBS, ShadowPlay y Discord.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo y su uso previsto (trampas en un videojuego multijugador) vulnera los términos de servicio de Arc Raiders y puede acarrear el baneo permanente de la cuenta.
- Auditoría de malware: un analista puede estudiar el binario en una máquina virtual aislada y sin red para documentar técnicas de evasión (empaquetado con contraseña, exclusión de captura, escaneo de memoria de otro proceso). Requiere entorno desechable y ninguna credencial real.
- Investigación de vectores de distribución en Hugging Face: el repositorio sirve como caso de estudio de cómo se abusa de una plataforma de modelos para alojar binarios ajenos a su propósito, con etiquetas de licencia y idioma que no se corresponden con el contenido.
- Formación en seguridad: ilustra el patrón de "ZIP con contraseña + ejecutable como administrador + desactivación de SmartScreen" descrito en la propia model card, habitual en campañas de malware.
- No procede ningún caso de uso de inferencia, integración en pipelines, atención al cliente, generación de código ni despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (144 Hz, 200 Hz, 373 Hz, 99,5 % de consistencia, menos de 40 MB de RAM) son afirmaciones del autor sin metodología, sin código y sin reproducción independiente; no constituyen benchmarks de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que inferir).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11, x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un `.exe` que se ejecuta como administrador.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

| Criterio | arc-raiders-cheat-esp-v2 | Modelo de lenguaje open source (categoría general) | Modelo de visión-lenguaje open source (categoría general) |
|---|---|---|---|
| Naturaleza | Binario de Windows (cheat) | Pesos + tokenizador + config | Pesos + vision encoder + config |
| Parámetros | no disponible | Variable según familia | Variable según familia |
| Contexto | no disponible | Definido por el modelo | Definido por el modelo |
| Licencia | MIT declarada (cobertura dudosa) | Licencias permisivas habituales (Apache-2.0, MIT, Llama) | Ídem |
| Reproducibilidad | Nula (sin código ni metodología) | Alta (pesos públicos) | Alta (pesos públicos) |
| Uso comercial legítimo | No | Sí, según licencia | Sí, según licencia |

No se identifican modelos comparables en la misma categoría porque el artefacto no pertenece a ninguna categoría de modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede evaluar con MMLU, HumanEval, GSM8K ni ninguna métrica de modelo.
- Riesgo de seguridad alto: ejecutable ofuscado en ZIP con contraseña, instrucciones para ejecutarlo como administrador y para desactivar las alertas de Windows Defender y SmartScreen. Patrón habitual de troyanos, stealers e infostealers.
- Licencia MIT declarada sobre un binario sin código fuente: la licencia no otorga derechos sobre el juego ni sobre el software de terceros, y su aplicabilidad al artefacto es dudosa.
- Uso previsto ilícito o sancionable: vulnera los términos de servicio de Arc Raiders y puede infringir legislación sobre trampas y modificación de software en algunas jurisdicciones.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, pese a que la model card declara "325K+ descargas" y una valoración de "4,8/5". Inconsistencia evidente entre metadatos y contenido.
- Idiomas declarados sin respaldo funcional: los 14 códigos ISO son etiquetas de la model card, no capacidades verificadas.
- Sin trazabilidad: no hay repositorio de código, paper, demo ni resultados de evaluación enlazados en la información disponible.
- No apto para producción, investigación ni uso educativo fuera de un laboratorio de análisis de malware aislado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/itzrealfazil/arc-raiders-cheat-esp-v2
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/SanuvaNaq19/arc-raiders-cheat-esp-v2/releases/latest/download/arc-raiders-cheat-esp-v2-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/SanuvaNaq19/arc-raiders-cheat-esp-v2/releases/latest
- Paper, blog, demo o repositorio de código del artefacto: no disponible
