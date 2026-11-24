# Soeyazar/delta-executor-pc-2026-keyless

## Resumen

`Soeyazar/delta-executor-pc-2026-keyless` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. A pesar de su identificador y de las etiquetas de idioma (`en`, `ru`, `zh`, `es`, `pt`, `tr`, `de`, `fr`, `ja`, `ko`, `ar`, `pl`, `vi`, `id`) y de licencia MIT, el contenido de la model card describe un ejecutor de scripts para Roblox empaquetado como binario portable para Windows x64. No existe ningún artefacto de pesos, tokenizador, configuración de arquitectura ni pipeline declarado (`pipeline: no disponible`).

El repositorio presenta un binario denominado `rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe` dentro de un archivo ZIP de 4,8 MB protegido con contraseña, distribuido mediante enlaces externos a GitHub Releases. La model card incluye instrucciones para desactivar advertencias de Windows Defender y SmartScreen, ejecutar el binario como administrador y aplicar módulos de inyección sobre un proceso cliente. Todo ello es ajeno a la función de un modelo de lenguaje: no hay parámetros, contexto, cuantizaciones ni capacidades de generación.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA. Se documenta su naturaleza real, sus especificaciones declaradas (que corresponden a un ejecutable, no a una red neuronal) y las advertencias de seguridad pertinentes, con el fin de que desarrolladores e investigadores identifiquen rápidamente que no se trata de un modelo utilizable en pipelines de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable x64 para Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin relación con capacidades lingüísticas reales) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. La model card menciona componentes propios de un ejecutor de scripts: un "script hub" integrado, un editor basado en Monaco, sincronización de offsets tras parches del cliente, un puente hacia una VM de Luau y compatibilidad declarada con APIs de instrumentación como `hookmetamethod`, `getgc` y `Drawing API`. Estos términos pertenecen al ecosistema de modding de Roblox, no al entrenamiento de modelos.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del corpus, procesos de RLHF/DPO ni innovaciones de inferencia (atención lineal, decodificación especulativa, etc.). Cualquier cifra de rendimiento incluida en la model card (por ejemplo, "97,8% de consistencia" o "143 Hz de polling") carece de metodología verificable y no corresponde a métricas de un modelo de lenguaje.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte de tool calling ni function calling en el sentido de APIs de modelos.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües reales; los códigos de idioma son etiquetas de metadatos.
- El artefacto declarado ejecuta scripts en un cliente de Roblox mediante inyección de procesos, según la propia model card.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA: no puede desplegarse en vLLM, llama.cpp, Ollama ni TGI porque no contiene pesos.
- Evaluación de procedencia de artefactos: útil como caso de estudio para detectar repositorios de Hugging Face que no alojan modelos y que distribuyen binarios externos.
- Auditoría de seguridad de la cadena de suministro: sirve para ilustrar patrones de riesgo (ZIP con contraseña, enlaces a GitHub Releases de terceros, instrucciones para desactivar SmartScreen).
- Formación en políticas de aceptación de modelos: ejemplo de por qué conviene validar `pipeline`, formato de pesos y presencia de `config.json` antes de integrar un repositorio.
- Monitorización de repositorios: permite entrenar clasificadores o reglas heurísticas que distingan model cards de modelos frente a páginas de distribución de software.
- Documentación de incidentes: referencia para registrar y reportar contenido que suplanta la categoría de modelo en un hub público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay pesos ni grafo computacional.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles.
- Latencia y throughput: no disponibles; las cifras de la model card (por ejemplo, 143 Hz de polling) no son métricas de inferencia verificables.
- Requisito declarado del artefacto: Windows 10 u 11 de 64 bits, ejecución como administrador y extracción previa de un ZIP de 4,8 MB con contraseña.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Soeyazar/delta-executor-pc-2026-keyless` | no disponible (no es un modelo) | no disponible | sin benchmarks | MIT (declarada) | repositorio con binario externo |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican modelos de IA comparables porque el artefacto no pertenece a esa categoría.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuración de arquitectura ni pipeline declarado; no puede ejecutar inferencia.
- Distribución mediante ZIP protegido con contraseña y enlaces a GitHub Releases de terceros, un patrón habitual en campañas de malware.
- La model card incluye instrucciones explícitas para desactivar o eludir Windows Defender y SmartScreen y para ejecutar el binario como administrador, lo que incrementa el riesgo para el sistema del usuario.
- Se declara compatibilidad con técnicas de inyección en procesos de un cliente de terceros, lo que puede infringir los términos de servicio de dicha plataforma y la legislación aplicable.
- Licencia MIT declarada en metadatos, pero sin archivo de licencia verificable ni titulares claros; no debe asumirse permiso para uso comercial del binario.
- Riesgo de suplantación: el nombre y las etiquetas imitan la estructura de un modelo de Hugging Face, lo que puede inducir a error en búsquedas automatizadas.
- Cero descargas y cero likes en el momento de la consulta, sin historial que permita evaluar reputación.
- No debe integrarse en entornos de producción, CI/CD ni pipelines de datos bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Soeyazar/delta-executor-pc-2026-keyless
- Enlace de descarga citado en la model card (GitHub Releases de terceros): https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
- Enlace de releases citado en la model card: https://github.com/vfurukawa4945/delta-executor-pc-2026-keyless/releases/latest
