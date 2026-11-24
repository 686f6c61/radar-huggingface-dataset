# Marselox/rust-recoil-script-esp-portable

## Resumen
El artefacto publicado bajo el identificador `Marselox/rust-recoil-script-esp-portable` no es un modelo de inteligencia artificial ni un modelo de lenguaje: es un paquete binario para Windows presentado como utilidad de tipo "cheat" para el videojuego Rust (recoil script, ESP, radar 2D y filtrado de loot). El repositorio de Hugging Face contiene únicamente metadatos y una model card descriptiva; no incluye pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. Por tanto, no existe nada que evaluar en términos de parámetros, contexto o capacidades cognitivas.

La model card describe un ejecutable `rust-recoil-script-esp-portable-v1.2.0-win64.exe` distribuido en un ZIP de 8,9 MB con contraseña `2026`, alojado en un repositorio de GitHub de terceros (`Dupuis81504/rust-recoil-script-esp-portable`). Las etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y la licencia MIT son metadatos declarados por el autor, no indicativos de un modelo multilingüe.

Es relevante ahora únicamente como caso de estudio de mal etiquetado en Hugging Face: un binario de dudosa procedencia con etiquetas de modelo, licencia permisiva y una lista amplia de idiomas, lo que puede confundir a herramientas de descubrimiento automático de modelos. No se recomienda su descarga ni ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (etiquetas declaradas: en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (distribución en ZIP con `.exe` de 8,9 MB) |

## Arquitectura y entrenamiento
No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable nativo de Windows de 64 bits empaquetado en un ZIP de 8,9 MB, según la model card. Las "características" descritas (overlay externo a 144 Hz, radar 2D, escáner de offsets dinámicos, suavizado de entrada Bézier, perfiles JSON intercambiables en caliente) corresponden a funcionalidades de un programa de trampas para el juego Rust, no a componentes de un modelo.

No hay información sobre datos de entrenamiento, tokens, composición del dataset, RLHF, DPO ni innovaciones técnicas de modelado. Tampoco se documenta el lenguaje de implementación ni las dependencias del binario.

## Capacidades
- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las etiquetas de idioma son metadatos sin respaldo técnico.
- El binario declarado ofrece, según su autor, overlay externo, radar 2D, filtro de loot, escáner de offsets y suavizado de entrada; estas funciones no son verificables y su uso en el juego Rust constituye trampa.

## Casos de uso
- No se identifican casos de uso legítimos para un modelo de IA, porque no lo es.
- Auditoría de cadena de suministro: usar el repositorio como ejemplo de artefacto mal etiquetado para calibrar filtros de descubrimiento en Hugging Face.
- Formación en seguridad: analizar en un entorno aislado cómo se presentan binarios con contraseña de archivo y enlaces externos para evadir análisis estático.
- Estudio de etiquetado abusivo: documentar el uso de etiquetas de idioma y licencia MIT en artefactos que no son modelos.
- No se recomienda su ejecución en máquinas de producción, de desarrollo ni personales.
- Cualquier uso del binario original en Rust vulnera los términos de servicio del juego y puede conllevar el baneo de la cuenta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (412 Hz de sondeo, 99,6 % de consistencia, 98,1 % de consistencia, menos de 31 MB de RAM) son afirmaciones del autor sin metodología ni verificación, y no corresponden a métricas de un modelo de IA.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados del binario: Windows 10 o Windows 11 de 64 bits, ejecución como administrador y menos de 31 MB de RAM según el autor; no verificable.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, los binarios de trampas para videojuegos no se comparan con modelos de lenguaje en parámetros, contexto ni licencia.

## Limitaciones y advertencias
- No es un modelo de IA: cualquier evaluación como modelo de lenguaje carece de sentido.
- Riesgo de seguridad alto: ejecutable de origen no verificado, distribuido con contraseña de archivo y alojado fuera de Hugging Face, lo que dificulta el análisis y favorece la ocultación de cargas maliciosas.
- La licencia MIT declarada no garantiza nada sobre el contenido del binario ni sobre su legalidad.
- Uso en Rust: constituye trampa, vulnera los términos de servicio del juego y puede provocar el baneo permanente de la cuenta.
- Posible conflicto con la legislación de propiedad intelectual y con las políticas de Hugging Face sobre contenido abusivo.
- Las alertas de Windows Defender o SmartScreen mencionadas por el propio autor son una señal de alarma, no un falso positivo trivial.
- No se debe ejecutar en ningún sistema sin análisis previo en una máquina virtual aislada y sin sandbox de red.

## Enlaces
- Hugging Face: https://huggingface.co/Marselox/rust-recoil-script-esp-portable
- Repositorio de GitHub citado por el autor: https://github.com/Dupuis81504/rust-recoil-script-esp-portable
- Descarga citada en la model card (no recomendada): https://github.com/Dupuis81504/rust-recoil-script-esp-portable/releases/latest/download/rust-recoil-script-esp-portable-v1.2.0-win64.zip
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
