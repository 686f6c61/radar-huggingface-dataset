# martinson003/airdrop-sybil-multi-wallet-farm-bot

## Resumen

El artefacto publicado bajo el identificador `martinson003/airdrop-sybil-multi-wallet-farm-bot` no es un modelo de inteligencia artificial. Se trata de un repositorio de Hugging Face que distribuye un ejecutable para Windows x64 presentado como "Airdrop Sybil Multi Wallet Farm Bot" v4.2.4, un supuesto bot de farming de airdrops con múltiples carteras. La model card no contiene ninguna referencia a arquitectura de red neuronal, pesos, tokenizador, dataset de entrenamiento ni pipeline de inferencia; el campo `pipeline` figura como no disponible.

El contenido real del repositorio es un paquete comprimido de 4,8 MB (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip`) alojado en un repositorio de GitHub de terceros, con contraseña de descompresión `2026`. La documentación describe módulos de overlay externo, ESP con cajas delimitadoras y esqueletos, radar 2D, filtrado de loot, suavizado de entrada Bézier y capas anti-captura para OBS, ShadowPlay y Discord. Es decir, el artefacto se presenta funcionalmente como un cheat para el juego Deadlock, no como un modelo lingüístico.

Desde el punto de vista de evaluación de modelos, esta ficha debe interpretarse como una advertencia: el repositorio no contiene material evaluable como IA. Los campos técnicos habituales (parámetros, contexto, cuantización, licencia de pesos) no son aplicables. La licencia declarada es MIT, pero se refiere al artefacto publicado, no a un conjunto de pesos. Se recomienda no ejecutar el binario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada para el artefacto, no para pesos de modelo) |
| Formato de pesos | no disponible (el paquete distribuido es un `.zip` con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El artefacto es un binario Windows x64 (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`) empaquetado en un ZIP de 4,8 MB, con build etiquetada como `v4.2.4 (5FCAE0)`. La model card menciona "7 worker threads", polling a 204 Hz y 302 Hz según el módulo, latencias declaradas de menos de 28 ms y menos de 12 ms, y una consistencia del 98,2 % en la capa de exclusión de captura. Son cifras de marketing sin metodología de medición publicada ni código fuente verificable.

No hay información sobre datos de entrenamiento, tokens procesados, composición del dataset, RLHF, DPO ni ninguna técnica de aprendizaje. Tampoco se documenta el lenguaje de programación, las dependencias ni el mecanismo de inyección o overlay empleado. La única innovación "técnica" mencionada es un escáner dinámico de offsets con resolución automática de firmas de punteros tras parches del juego, lo cual es propio de herramientas de trampas, no de modelos generativos.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son etiquetas de metadatos del repositorio, no cobertura lingüística de un modelo.
- Según su propia documentación, el binario implementaría: overlay externo con cajas 2D/3D y esqueletos, radar 2D, filtro de loot por rareza, suavizado de puntería Bézier con radio de FOV configurable y VisCheck, y exclusión de captura de pantalla.
- Estas capacidades descritas corresponden a un cheat de videojuego, no a un modelo de IA, y no han sido verificadas de forma independiente.

## Casos de uso

- Ninguno recomendado en el contexto de IA: no hay modelo que desplegar, evaluar ni integrar en pipelines de inferencia.
- Auditoría de seguridad: el artefacto puede analizarse en un entorno aislado y sin conectividad para documentar técnicas de empaquetado y evasión de SmartScreen, sin ejecutarlo en máquinas de producción.
- Estudio de campañas de distribución maliciosa: sirve como muestra de repositorios de Hugging Face que suplantan la categoría de modelo para distribuir ejecutables con contraseña y enlaces externos.
- Formación en higiene de cadena de suministro: ilustra por qué conviene verificar `pipeline`, formato de pesos y presencia de `safetensors`/`config.json` antes de descargar cualquier artefacto.
- Investigación de fraude en airdrops: el nombre del paquete permite documentar la terminología empleada en campañas de sybil farming, sin necesidad de ejecutar el binario.
- No procede ningún caso de uso de generación de texto, código, atención al cliente, RAG ni agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas cifras del repositorio (204 Hz, 302 Hz, < 28 ms, < 12 ms, 98,2 %) son declaraciones del autor sin protocolo de medición, sin hardware de referencia y sin reproducibilidad, por lo que no constituyen benchmarks válidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Tamaño del paquete: 4,8 MB comprimido; requiere 7-Zip o WinRAR y contraseña `2026`.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no verificables; las cifras del autor no son reproducibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Frente a un modelo open source real, las diferencias mínimas exigibles serían: pesos en `safetensors` o GGUF, `config.json`, tokenizador, model card con arquitectura y datos de entrenamiento, y benchmarks reproducibles. Este repositorio no cumple ninguno de esos criterios.

| Criterio | Este artefacto | Modelo open source convencional |
|---|---|---|
| Pesos publicados | No | Sí (`safetensors`, GGUF) |
| Arquitectura documentada | No | Sí |
| Tokenizador | No | Sí |
| Benchmarks reproducibles | No | Habitualmente sí |
| Pipeline de inferencia | No disponible | `text-generation`, `image-text-to-text`, etc. |
| Riesgo de ejecución | Alto (binario con contraseña, enlace externo) | Bajo si se usa runtime estándar |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo lingüístico carece de sentido.
- El binario se distribuye con contraseña y desde un repositorio de GitHub de terceros, práctica habitual en campañas de malware para evadir análisis automáticos.
- La model card incluye referencias a un cheat de Deadlock, lo que asocia el artefacto a software de trampas y potencialmente a violaciones de términos de servicio.
- Riesgo elevado de código malicioso: ejecutar como administrador un binario no firmado de origen desconocido expone el sistema a robo de credenciales, claves de carteras y datos personales.
- La licencia MIT declarada no aporta garantías sobre el contenido del ZIP ni sobre su procedencia.
- Los idiomas listados son etiquetas de metadatos, no una declaración verificable de soporte lingüístico.
- No debe desplegarse en producción, ni en entornos con acceso a redes, carteras cripto o credenciales.
- Se recomienda reportar el repositorio a Hugging Face por uso indebido de la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/martinson003/airdrop-sybil-multi-wallet-farm-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/Furukawa01173/airdrop-sybil-multi-wallet-farm-bot
- Repositorio de GitHub del enlace de descarga: https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026
- Enlace de descarga directa citado (no recomendado): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Paper, blog o demo oficial: no disponible
