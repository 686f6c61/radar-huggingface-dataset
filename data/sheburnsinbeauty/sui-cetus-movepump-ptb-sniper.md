# SheBurnsInBeauty/sui-cetus-movepump-ptb-sniper

## Resumen

`SheBurnsInBeauty/sui-cetus-movepump-ptb-sniper` es un repositorio alojado en Hugging Face que, pese a su nombre y a sus etiquetas, no contiene un modelo de inteligencia artificial. El artefacto distribuido es un ejecutable portable para Windows de 64 bits (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) que la propia model card describe como un "roblox executor" con módulos de inyección de scripts, attach a clientes y sincronización de offsets tras parches. No se declara arquitectura de red neuronal, parámetros, tokenizador ni pesos en ningún formato estándar.

La ficha se ha redactado siguiendo la estructura solicitada, pero la mayoría de los campos técnicos no son aplicables porque el objeto publicado no es un modelo de lenguaje. Se indica "no disponible" o "no aplicable" en cada apartado donde la información no existe, y se advierte explícitamente de los riesgos de seguridad asociados al contenido de la model card.

Es relevante ahora únicamente como caso de estudio de mal etiquetado en Hugging Face: un binario empaquetado con temática de cripto/MEV (Sui, Cetus, MovePump, PTB) y de trampas para videojuegos, con enlaces a releases de GitHub de terceros y una contraseña de extracción, sin relación con el ecosistema de modelos abiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplicable (no es un modelo de IA; es un ejecutable Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; no verificable en un binario) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. La model card describe un conjunto de "módulos" de un supuesto ejecutor: hub de scripts integrado, attach a cliente, attach multi-instancia, directorio de auto-ejecución, flujo de ejecución sin clave y sincronización de offsets tras parches. Las cifras que aparecen (`98,4 %` de consistencia, `13` hilos de trabajo, `< 20 MB` y `< 52 MB` de RAM, `96,8 %` de consistencia en la sincronización de offsets) no vienen acompañadas de metodología, código fuente ni artefactos reproducibles, por lo que no son verificables.

No se declaran datos de entrenamiento, tokens procesados, composición del dataset, RLHF, DPO ni ninguna innovación técnica de modelado. El contenido de la model card mezcla terminología de trading en Sui (Cetus, MovePump, PTB) con terminología de trampas para Roblox y con instrucciones de descarga desde un repositorio de GitHub ajeno al autor del espacio en Hugging Face.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta razonamiento multi-paso ni modo "thinking".
- No dispone de capacidades multilingües reales; los idiomas listados son etiquetas de metadatos.
- El artefacto, según su propia descripción, ejecuta scripts en un cliente de Roblox y realiza attach a procesos; esto no constituye una capacidad de IA.
- No hay API, servidor de inferencia ni pesos que cargar en vLLM, llama.cpp u Ollama.

## Casos de uso

- Auditoría de mal etiquetado en Hugging Face: revisar cómo un binario con temática de trampas y cripto aparece indexado junto a modelos de IA, y qué señales (tags, tamaño, ausencia de pesos) permiten detectarlo.
- Formación en seguridad para equipos de MLOps: usar el ejemplo para enseñar por qué no se debe ejecutar un `.exe` descargado de un repositorio de modelos ni introducir contraseñas de extracción de origen desconocido.
- Análisis de ingeniería social: estudiar el patrón de model card con badges falsos, cifras de descargas infladas y enlaces a releases de terceros.
- Verificación de políticas de licencia: comprobar cómo una licencia MIT declarada en metadatos no implica que el contenido sea software legítimo ni auditable.
- Monitorización de repositorios: alimentar reglas de detección (por ejemplo, binarios `.exe` en espacios de modelos) para bloquear su descarga en entornos corporativos.
- Investigación sobre ecosistemas DeFi y MEV en Sui: únicamente como muestra de la terminología empleada en el nombre (`cetus`, `movepump`, `ptb`, `sniper`), sin valor técnico asociado al artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras de la model card (`98,4 %`, `96,8 %`, `13` hilos, `< 52 MB` de RAM) no son benchmarks de modelo ni están respaldadas por una evaluación reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Requisitos declarados del artefacto: Windows 10 o Windows 11 de 64 bits, procesadores Intel o AMD x64, ZIP de 4,8 MB y ejecución "como administrador".
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, porque el artefacto no es un modelo. A modo de contraste meramente estructural:

| Elemento | Este repositorio | Modelo de lenguaje típico |
|---|---|---|
| Pesos publicados | no | safetensors/GGUF |
| Arquitectura declarada | no | transformer/MoE/SSM |
| Tokenizador | no | sí |
| Evaluación reproducible | no | benchmarks públicos |
| Ejecutable binario | sí (`.exe` en ZIP) | no |
| Licencia | MIT (metadatos) | variable |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- El artefacto es un ejecutable de Windows que la model card describe como ejecutor de scripts para Roblox; ejecutarlo como administrador otorga privilegios elevados a un binario de origen no verificado.
- La model card incluye enlaces a releases de GitHub de terceros y una contraseña de extracción (`2026`); este patrón es habitual en campañas de distribución de malware.
- Las cifras de rendimiento y consistencia no son verificables ni están respaldadas por código o datos.
- Los idiomas y la licencia MIT figuran solo como metadatos; no hay forma de comprobar su aplicabilidad al contenido.
- Riesgo de alucinación: no aplicable a un binario, pero sí a cualquier descripción que lo presente como modelo.
- Uso comercial: la licencia MIT declarada no exime de responsabilidad legal ni de las condiciones de servicio de las plataformas implicadas (Roblox, Sui, Cetus).
- Recomendación: no descargar ni ejecutar el artefacto; si se necesita un modelo para tareas de trading o análisis on-chain, utilizar modelos y herramientas auditables y con pesos publicados.

## Enlaces

- Hugging Face: https://huggingface.co/SheBurnsInBeauty/sui-cetus-movepump-ptb-sniper
- Repositorio GitHub referenciado en la model card: https://github.com/manfredm654/sui-cetus-movepump-ptb-sniper
- Release de terceros referenciado en la model card: https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Paper: no disponible
- Blog o demo: no disponible
