# namhoang2612/sirhurt-executor

## Resumen

No es un modelo de inteligencia artificial. El repositorio `namhoang2612/sirhurt-executor` alojado en Hugging Face no contiene pesos, tokenizador ni código de inferencia: la model card describe un supuesto ejecutor de scripts para Roblox (un "executor" que inyecta Luau en el proceso del cliente del juego) distribuido como binario `.exe` para Windows de 64 bits. El autor emplea el formato de model card y las etiquetas de Hugging Face para dar apariencia de artefacto técnico legítimo, pero el contenido es material de distribución de software ejecutable.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para identificar el artefacto, entender por qué aparece indexado junto a modelos reales y señalar los riesgos asociados a su descarga y ejecución. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no declara pipeline ni tarea de aprendizaje automático.

No se dispone de información sobre arquitectura, parámetros, contexto ni datos de entrenamiento porque el artefacto no es un modelo lingüístico. Cualquier lectura de esta ficha como evaluación de un modelo de IA sería incorrecta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin funcionalidad lingüística verificable) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el README referencia `sirhurt-executor-v1.2.0-win64.zip` y `.exe`) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es una red neuronal ni un modelo estadístico: es un supuesto ejecutor de scripts para el cliente de Roblox, empaquetado como ZIP de 8,9 MB con contraseña de extracción `2026` y un binario `sirhurt-executor-v1.2.0-win64.exe` identificado como build `v2.8.4 (165BD0)`. El README menciona componentes como un editor Monaco, un puente a la VM de Luau, compatibilidad con la API sUNC (hookmetamethod, getgc, Drawing API) y adjuntado multi-instancia.

No existe información sobre datos de entrenamiento, proceso de alineación (RLHF/DPO) ni innovaciones técnicas de modelado. La terminología de la model card (ratings, contadores de descargas, badges) imita la de repositorios de modelos populares, pero no describe ningún pipeline de aprendizaje automático.

## Capacidades

- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- La única funcionalidad declarada es la inyección de scripts Luau en el cliente de Roblox, según la propia model card.
- Los idiomas listados en los metadatos no corresponden a ninguna capacidad multilingüe verificable del artefacto.

## Casos de uso

- No se identifican casos de uso legítimos de evaluación de modelos. El artefacto no es un modelo y su función declarada (inyección de scripts en un cliente de juego) queda fuera del ámbito de esta ficha.
- Auditoría de seguridad: un equipo puede usar esta ficha para reconocer el patrón de repositorios que suplantan model cards para distribuir ejecutables y establecer reglas de bloqueo en su proxy o registro interno.
- Formación interna: sirve como ejemplo de artefacto que no debe descargarse ni ejecutarse en estaciones de trabajo de desarrollo.
- Cuarentena y análisis en sandbox: si un equipo necesita caracterizar el binario, debe hacerse en una máquina aislada, sin credenciales y con registro de red, nunca en un equipo de producción.
- Monitorización de la cadena de suministro: permite añadir firmas y hashes de este tipo de paquetes a las listas de denegación de herramientas de detección de software no deseado.
- Documentación de políticas: útil para redactar guías que distingan entre modelos de IA verificables y binarios que se presentan con el formato de una model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (4,8/5 de valoración, 70K+ descargas, 99,1 % de consistencia, menos de 14 ms de respuesta, 147 Hz de sondeo) son afirmaciones del autor sin metodología, sin conjunto de evaluación y sin verificación independiente; no deben interpretarse como métricas de rendimiento de un modelo.

## Requisitos de hardware

- No aplica VRAM ni GPU: el artefacto declarado es un binario para Windows x64 que, según el autor, consume menos de 49 MB de RAM.
- No requiere A100, H100 ni RTX 4090; no es un modelo de inferencia.
- No procede hablar de despliegue con vLLM, llama.cpp, Ollama o TGI.
- No se dispone de datos fiables de latencia o throughput; las cifras del README no son verificables.
- Cualquier ejecución del binario debería limitarse a un entorno aislado y sin datos sensibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de lenguaje o multimodal. Frente a modelos reales del ecosistema open source, la diferencia no es de rendimiento sino de naturaleza: aquí no hay pesos, no hay arquitectura declarada y no hay evaluación reproducible.

| Criterio | Este repositorio | Modelo de IA típico en Hugging Face |
|---|---|---|
| Pesos publicados | No | Sí (safetensors, GGUF, etc.) |
| Arquitectura declarada | No | Sí |
| Pipeline/tarea | No disponible | Definida (text-generation, etc.) |
| Evaluación reproducible | No | Habitual |
| Formato de distribución | ZIP con contraseña y `.exe` | Pesos y tokenizador |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- Distribución mediante ZIP protegido con contraseña (`2026`) y ejecutable que requiere permisos de administrador: patrón habitual en campañas de distribución de software no deseado.
- El README reconoce explícitamente que Windows Defender y SmartScreen pueden alertar sobre el binario, e indica cómo evitar esas alertas; esta recomendación es un riesgo de seguridad y no debe seguirse.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido real del binario ni sobre su procedencia.
- Riesgo de suplantación: el repositorio imita el formato de una model card para ganar apariencia de legitimidad.
- Uso potencialmente contrario a los términos de servicio de Roblox y a la legislación aplicable en materia de manipulación de software de terceros.
- No hay trazabilidad del autor, historial de versiones verificable ni firmas criptográficas de los artefactos.
- Cualquier análisis del binario debe realizarse en sandbox aislado, sin credenciales y con monitorización de red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/namhoang2612/sirhurt-executor
- Release referenciada en el README (no verificar ni ejecutar): https://github.com/Viktori4195/sirhurt-executor/releases/latest
- Paquete referenciado en el README (no descargar): https://github.com/Viktori4195/sirhurt-executor/releases/latest/download/sirhurt-executor-v1.2.0-win64.zip
