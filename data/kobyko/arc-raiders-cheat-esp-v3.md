# Kobyko/arc-raiders-cheat-esp-v3

## Resumen

El repositorio `Kobyko/arc-raiders-cheat-esp-v3` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido real es un paquete ejecutable para Windows (un supuesto *cheat* con ESP y asistencia de puntería para el videojuego Arc Raiders), distribuido como archivo ZIP de 8,9 MB con contraseña de extracción. La model card describe funcionalidades de overlay externo, suavizado de entrada tipo Bezier, perfiles JSON intercambiables en caliente y ocultación frente a capturas de pantalla, todo ello orientado a la manipulación de un juego multijugador.

No existe ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociados. Los metadatos de Hugging Face (tags como `windows`, `x64`, `portable`) y la propia model card confirman que el artefacto es un binario empaquetado, no un modelo entrenado. Cualquier evaluación como modelo de lenguaje, visión o multimodal carece de sentido técnico: no hay parámetros, contexto, cuantización ni licencia de pesos que analizar.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para identificar el artefacto, señalar los riesgos de seguridad asociados a la ejecución de binarios de origen desconocido y aclarar que no debe tratarse como un modelo de IA en ningún pipeline de evaluación o despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (según metadatos; aplicada al artefacto, no a pesos de modelo) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. El artefacto es un ejecutable (`arc-raiders-cheat-esp-v3-v1.2.0-win64.exe`, build `v1.8.9`, identificador `3EFEB92719`) empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. La model card menciona componentes de tipo overlay externo a 144 Hz o más, escáner dinámico de offsets con sondeo a 181 Hz, suavizado de entrada Bezier, intercambio de perfiles JSON y una capa de renderizado que evade capturas de OBS, ShadowPlay y Discord. Ninguno de estos elementos constituye entrenamiento, ajuste fino ni inferencia de red neuronal.

No se documenta ningún proceso de entrenamiento, dataset, RLHF, DPO ni innovación en arquitecturas de aprendizaje automático. La etiqueta "modelo" en Hugging Face es meramente administrativa: el repositorio usa la plataforma como canal de distribución de software.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts.
- No soporta *tool calling* ni *function calling*.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje; los idiomas listados son metadatos del repositorio.
- No dispone de modo *thinking*, visión, audio ni multimodalidad.
- El binario declara funciones de overlay (cajas 2D/3D, esqueletos de huesos, ESP de distancia), suavizado de puntería y ocultación frente a capturas de pantalla, según la model card del autor.

## Casos de uso

- No procede ningún caso de uso legítimo como modelo de IA: no hay inferencia, API ni pesos que integrar en aplicaciones.
- Auditoría de seguridad: analizar el binario en un entorno aislado para determinar su comportamiento real antes de cualquier interacción.
- Documentación de artefactos mal etiquetados en Hugging Face: usar este repositorio como ejemplo de contenido que no cumple los criterios de un modelo publicable.
- Investigación sobre distribución de software malicioso: estudiar los patrones de la model card (contraseña en archivo, enlaces a repositorios de GitHub de terceros, insignias de descargas infladas) como indicadores de riesgo.
- Formación en ciberseguridad: ilustrar por qué no debe ejecutarse un `.exe` descargado de un repositorio sin verificación de firma ni procedencia.
- No se recomienda su uso en ningún escenario de producción, desarrollo de videojuegos ni automatización legítima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA porque el artefacto no es un modelo. Las cifras que aparecen en la model card (por ejemplo, 143K descargas, valoración 5.0/5, latencia inferior a 22 ms, consistencia del 97,2 %) son afirmaciones del autor sin verificación independiente y no constituyen benchmarks de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay inferencia de modelo).
- GPU recomendadas: no disponible (no aplica).
- Compatibilidad con GPU de consumo: no disponible (no aplica).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el artefacto es un ejecutable de Windows x64 que se ejecuta directamente, no mediante servidores de inferencia.
- Plataforma declarada: Windows 10/11 de 64 bits, ejecución como administrador según las instrucciones de la model card.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables ni relevantes para cargas de IA.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Compararlo con modelos de lenguaje, visión o multimodales sería un error de categoría.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA pese a estar alojado en Hugging Face; tratarlo como tal en un pipeline de evaluación produciría resultados inválidos.
- Ejecutar un binario de procedencia desconocida como administrador implica un riesgo elevado de compromiso del sistema (malware, robo de credenciales, persistencia).
- La distribución mediante ZIP con contraseña y enlaces a repositorios de GitHub de terceros es un patrón habitual en campañas de software no verificado.
- El uso de *cheats* en juegos multijugador suele violar los términos de servicio y puede conllevar el baneo de cuentas; además, en algunas jurisdicciones puede tener implicaciones legales.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido ni sobre la ausencia de código malicioso.
- Las cifras de descargas, valoración y rendimiento de la model card no están verificadas y no deben citarse como datos fiables.
- No hay información sobre firma de código, hash de verificación ni auditoría de seguridad del binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/arc-raiders-cheat-esp-v3
- Repositorio de GitHub referenciado en la model card: https://github.com/Krzysztof8590/arc-raiders-cheat-esp-v3
- Descarga del archivo ZIP citada en la model card: https://github.com/Krzysztof8590/arc-raiders-cheat-esp-v3/releases/latest/download/arc-raiders-cheat-esp-v3-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/Krzysztof8590/arc-raiders-cheat-esp-v3/releases/latest
