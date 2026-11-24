# Anish1509/fortnite-external-box-esp-softaim-2026

## Resumen

El artefacto publicado bajo el identificador `Anish1509/fortnite-external-box-esp-softaim-2026` no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido a través de Hugging Face, cuya model card describe un software externo (overlay, ESP de cajas, softaim y radar 2D) orientado al videojuego Fortnite. El autor declara la versión `v2.0.7` (build `19EAC7`) y un archivo comprimido `fortnite-external-box-esp-softaim-2026-v1.2.0-win64.zip` de 8,9 MB protegido con la contraseña `2026`.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y la ausencia de campo `pipeline` confirman que la plataforma lo aloja como un artefacto binario, no como un modelo entrenado. La licencia declarada es MIT, aunque esta se refiere al paquete de software y no a un modelo lingüístico.

Desde el punto de vista de evaluación de IA open source, el elemento es irrelevante: no hay parámetros, contexto, dataset ni benchmarks que analizar. Además, el contenido de la model card presenta indicios claros de paquete potencialmente malicioso (contraseña en el archivo, ejecución como administrador, enlaces de descarga externos a GitHub, insignias de descargas y valoraciones no verificables), por lo que se recomienda no ejecutarlo. Esta ficha se limita a documentar el artefacto tal como aparece publicado, sin validar ninguna de sus afirmaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos de la model card, no capacidades del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el paquete distribuido es un `.zip` con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es un modelo neuronal ni un sistema entrenado con datos. La model card describe un software externo para Windows con overlay a 144 Hz, renderizado mediante Desktop Duplication, un núcleo en modo usuario sin hooks DLL internos, 13 hilos de trabajo, suavizado de entrada Bézier y perfiles JSON intercambiables en caliente. Estos datos provienen exclusivamente del texto del autor y no han sido verificados; no existe información sobre arquitectura de red, tokenizador, corpus de entrenamiento, RLHF, DPO ni ninguna innovación técnica propia de modelos generativos.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve problemas matemáticos ni produce código.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma de la model card son metadatos de indexación.
- El artefacto, según su propia descripción, implementa un overlay externo con cajas 2D/3D, esqueletos de huesos, ESP de distancia, radar 2D, filtro de loot y un mecanismo de apuntado asistido (softaim), todo ello orientado a un videojuego concreto.
- No se ha verificado ninguna de estas funciones; no hay código fuente, binarios reproducibles ni auditoría publicada.

## Casos de uso

No procede recomendar casos de uso para un artefacto de esta naturaleza. A modo de documentación:

- No es adecuado para generación de texto, atención al cliente, análisis documental, generación de código, traducción, resumen ni ninguna tarea de procesamiento del lenguaje natural.
- No es adecuado para investigación en IA, ajuste fino, evaluación de modelos ni despliegue en pipelines de MLOps.
- No es adecuado para entornos de producción de ningún tipo: carece de pesos, API, documentación técnica verificable y soporte.
- Su uso descrito (automatización de apuntado y visualización de información oculta en un videojuego multijugador) contraviene los términos de servicio de Fortnite y puede conllevar el bloqueo de cuentas.
- La distribución de ejecutables con contraseña y solicitud de privilegios de administrador es un patrón habitual en campañas de malware; no debe desplegarse en máquinas de desarrollo ni de producción.
- Cualquier evaluación técnica del paquete debería realizarse en una máquina virtual aislada y sin credenciales, y únicamente con fines de análisis de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras autoinformadas y no verificables (por ejemplo, «97,7 % de consistencia», «< 56 MB de RAM», «< 31 ms de respuesta»), que no constituyen benchmarks de modelos ni han sido contrastadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay inferencia de modelo.
- GPU recomendadas: no aplica; el software descrito no requiere GPU según su propia documentación.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema descrito por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador, aproximadamente 8,9 MB de archivo comprimido.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a la categoría de modelos de lenguaje, visión o multimodal. Tampoco se han identificado en la información proporcionada otros paquetes de software comparables publicados en Hugging Face con características verificables.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni citarse como tal en comparativas de modelos.
- Contiene un ejecutable para Windows distribuido en un `.zip` protegido con contraseña, un patrón que dificulta el análisis por parte de antivirus y plataformas de análisis estático.
- Solicita ejecución con privilegios de administrador, lo que amplía el impacto potencial de cualquier comportamiento malicioso.
- Los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`Tuyenr19/...`) distinto del espacio de Hugging Face, lo que impide verificar la integridad y la autoría del binario.
- Las insignias de descargas (587K+) y valoración (4,9/5) son imágenes estáticas sin fuente verificable; no deben interpretarse como evidencia de calidad o seguridad.
- Uso descrito contrario a los términos de servicio de Fortnite; riesgo de sanción en la cuenta del usuario y posibles implicaciones legales según la jurisdicción.
- La licencia MIT declarada se aplica, en su caso, al paquete de software, no a un modelo; no otorga garantías sobre el binario ni sobre su comportamiento.
- Riesgo elevado de malware, robo de credenciales o persistencia en el sistema; se recomienda no descargarlo ni ejecutarlo.
- Los resultados de búsqueda web proporcionados no guardan relación con el artefacto (listados de festivos de Gujarat) y no aportan información técnica adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Anish1509/fortnite-external-box-esp-softaim-2026
- Repositorio de GitHub citado en la model card: https://github.com/Tuyenr19/fortnite-external-box-esp-softaim-2026
- Descarga directa citada en la model card: https://github.com/Tuyenr19/fortnite-external-box-esp-softaim-2026/releases/latest/download/fortnite-external-box-esp-softaim-2026-v1.2.0-win64.zip
- Paper: no disponible
- Blog o demo: no disponible
