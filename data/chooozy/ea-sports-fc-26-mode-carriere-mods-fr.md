# Chooozy/ea-sports-fc-26-mode-carriere-mods-fr

## Resumen

El repositorio `Chooozy/ea-sports-fc-26-mode-carriere-mods-fr` no contiene un modelo de inteligencia artificial. A pesar de estar alojado en Hugging Face y de emplear la etiqueta `license:mit`, el contenido es un paquete ejecutable para Windows x64 (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip`, 4,8 MB) que se presenta como mods para el modo carrera de EA Sports FC 26. No existe ningún artefacto de pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado.

La model card describe un flujo de descarga y ejecución de un binario `.exe` protegido por contraseña de archivo, con referencias a inyección de scripts, puente Luau VM, compatibilidad sUNC y módulos de teleport, terminología propia de herramientas de trampas en videojuegos. El nombre del binario (`deadlock-cheat-esp-aimbot`) contradice frontalmente el título del repositorio y apunta a un cheat con ESP y aimbot para el juego Deadlock.

Por tanto, esta ficha no puede documentar arquitectura, entrenamiento, capacidades, benchmarks ni requisitos de hardware de un modelo inexistente. El propósito de esta entrada es dejar constancia rigurosa de que el repositorio no es un modelo de IA y advertir de los riesgos de seguridad asociados a la ejecución del binario distribuido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos de la model card, no capacidades del modelo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no incluye ningún transformer, MoE, SSM ni arquitectura híbrida. No hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación técnica de modelado. El único artefacto descrito es un ejecutable portable de Windows x64 con build `v1.8.7 (14522A)` empaquetado en un ZIP de 4,8 MB.

La model card menciona componentes como "Luau VM bridge", "hookmetamethod", "getgc", "Drawing API", "auto-execute directory" y "teleport script reloading", que corresponden a técnicas de inyección y manipulación de procesos de videojuegos, no a componentes de un modelo de lenguaje.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código, no resuelve matemáticas y no procesa visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma de los metadatos son etiquetas de descubrimiento, no competencias del artefacto.
- El binario descrito se presenta como una utilidad de modding/cheat para juegos de Windows, con funciones declaradas de ESP, aimbot, inyección de scripts y teleport.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA, porque no lo es.
- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real antes de cualquier otro uso.
- Investigación de malware y técnicas de ofuscación: estudiar el patrón de distribución (ZIP con contraseña, `.exe` que requiere ejecución como administrador) como ejemplo de cadena de entrega sospechosa.
- Documentación de riesgo para plataformas: usar este repositorio como caso de estudio de contenido que no debería clasificarse como modelo en un hub de IA.
- Formación en ciberseguridad: ilustrar por qué no debe ejecutarse un binario de origen desconocido con privilegios elevados.
- No se recomienda ningún uso del ejecutable en sistemas de producción, equipos personales ni entornos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos números presentes en la model card (latencia de `< 19 ms`, `< 34 ms`, polling de `283 Hz` y `334 Hz`, compatibilidad `98%+ sUNC`, consistencia `98.9%`) son afirmaciones de marketing del autor sin metodología verificable y no corresponden a evaluaciones de un modelo de IA.

## Requisitos de hardware

- No aplica VRAM de inferencia: no hay pesos que cargar.
- El artefacto declara como requisito únicamente Windows 10 u 11 de 64 bits.
- No requiere GPU dedicada según la información disponible.
- No hay soporte de vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo.
- No se dispone de datos de latencia o throughput verificables.
- Advertencia: ejecutar el `.exe` como administrador en un equipo real supone un riesgo de seguridad no evaluado.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable, ya que el repositorio no contiene un modelo de IA. Frente a modelos open source reales (por ejemplo, familias tipo Llama, Mistral o Qwen), la comparación carece de sentido: aquellos publican pesos en safetensors/GGUF, arquitectura documentada y benchmarks; este repositorio publica un ejecutable de Windows.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; clasificarlo como tal es un error.
- El nombre del binario (`deadlock-cheat-esp-aimbot`) sugiere funciones de trampa para un videojuego, lo que puede violar los términos de servicio de plataformas de juego y acarrear el baneo de cuentas.
- La distribución mediante ZIP con contraseña y ejecución "como administrador" es un patrón habitual en campañas de malware; el contenido no ha sido auditado.
- La licencia MIT declarada en metadatos no garantiza la legalidad ni la seguridad del binario distribuido.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`rocha1838`, `dennisaoki41`), no al propio autor `Chooozy`, lo que añade opacidad sobre la cadena de suministro.
- No hay garantías de integridad, firma de código ni análisis de dependencias.
- Uso comercial: no recomendado bajo ninguna circunstancia sin auditoría forense previa.
- Riesgo de robo de credenciales, persistencia maliciosa y compromiso del sistema anfitrión si se ejecuta el binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Chooozy/ea-sports-fc-26-mode-carriere-mods-fr
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio GitHub alternativo citado (terceros): https://github.com/dennisaoki41/ea-sports-fc-26-mode-carriere-mods-fr
- Paper, blog, demo o repositorio oficial del modelo: no disponible
