# sanchez287/lucid-keyless-executor

## Resumen

`sanchez287/lucid-keyless-executor` es un repositorio de Hugging Face que **no contiene un modelo de lenguaje**. La model card describe un supuesto ejecutor de scripts para Roblox para Windows 10/11 x64, distribuido como un archivo ZIP de 4,8 MB con contraseña, y promociona un enlace de descarga externo alojado en GitHub. Los tags (`windows`, `windows-11`, `x64`, `portable`) y el contenido del README confirman que se trata de un artefacto binario para escritorio, no de pesos de IA.

El repositorio presenta cero descargas y cero likes, fue creado y actualizado en la misma marca temporal (2026-11-24T20:06:35Z) y no declara pipeline de inferencia. La model card mezcla referencias a un "trainer" de *Kingdom Come: Deliverance 2*, badges con cifras de descargas (70K+) que no coinciden con las métricas reales de Hugging Face (0 descargas), y terminología de ejecutores de Roblox (`hookmetamethod`, `getgc`, Drawing API, sUNC compatibility). Esta incoherencia entre lo declarado y lo observable es relevante para cualquier evaluador.

Desde la perspectiva de esta ficha técnica, el artefacto no resuelve ningún problema de IA: no hay arquitectura de red neuronal, parámetros, tokenizador, contexto ni capacidades lingüísticas que documentar. Los campos técnicos solicitados se marcan como "no disponible" o se describen según lo que declara el autor, sin validación externa. Se recomienda tratar este repositorio como no apto para evaluación como modelo y aplicar las advertencias de seguridad de la sección final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no implica capacidad lingüística real) |
| Licencia | MIT (declarada en la model card; sin verificación de titularidad) |
| Formato de pesos | no disponible (el autor distribuye un ZIP de 4,8 MB con contraseña, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de transformer, MoE, SSM ni híbrida que describir. El README declara módulos nativos de 64 bits, un puente "Luau VM" para adjuntarse a procesos, polling a frecuencias arbitrarias (154 Hz, 292 Hz, 388 Hz, 430 Hz) y seis hilos de trabajo, pero ninguno de estos datos procede de una model card de IA verificable ni de documentación técnica reproducible.

No se declaran datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna técnica de alineación. La mención a "post-patch offset sync" y "Wednesday client signature updates" apunta a un mecanismo de actualización de firmas de proceso, típico de herramientas de inyección, no a entrenamiento de modelos.

## Capacidades

- No se declara generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe real; los 14 códigos de idioma son metadatos del repositorio y no evidencian competencia lingüística.
- El autor declara capacidades de inyección de scripts ("keyless execution flow", "instant client attach", "integrated script hub"), que no son capacidades de un modelo de lenguaje y no están verificadas.

## Casos de uso

No procede. Al no ser un modelo de IA, no existen escenarios de inferencia, generación, razonamiento ni despliegue en pipelines de NLP. Cualquier uso práctico del artefacto queda fuera del alcance de esta ficha técnica y debe evaluarse con las advertencias de seguridad de la sección de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras del README ("98%+ sUNC compatibility", "70K+ downloads", "99% Verified") son afirmaciones promocionales del autor sin metodología, sin dataset y sin verificación independiente; no se presentan como resultados de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible (no hay pesos ni modelo que cargar).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible; estas herramientas no aplican a un binario de Windows.
- El autor declara ejecución nativa en Windows 10/11 x64 sobre procesadores Intel y AMD, con un paquete de 4,8 MB y seis hilos de trabajo.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos de IA comparable, porque el repositorio no contiene un modelo de lenguaje. Comparar parámetros, contexto, rendimiento o licencia con alternativas de NLP carece de sentido en este caso.

## Limitaciones y advertencias

- Incoherencia grave entre metadatos y contenido: el repositorio se presenta como modelo en Hugging Face, pero la model card describe un ejecutor de scripts para Windows con enlaces de descarga externos.
- Métricas inconsistentes: el README muestra badges de "70K+ Downloads" y "99% Verified" frente a 0 descargas y 0 likes reales en Hugging Face.
- Distribución mediante ZIP con contraseña (`2026`) alojado en GitHub, fuera del control de Hugging Face; el binario no es auditable desde el repositorio.
- Ejecución indicada "Run as Administrator", lo que amplía la superficie de riesgo si el binario no está verificado.
- El README reconoce alertas de Windows Defender y SmartScreen, justificándolas como "heuristic" por ser un "roblox executor binary"; esto es una señal de riesgo relevante.
- Referencias cruzadas a un "trainer" de *Kingdom Come: Deliverance 2* que no guardan relación con el nombre del repositorio, indicio de contenido ensamblado o reutilizado.
- Licencia MIT declarada sin verificación de titularidad del código ni de los binarios distribuidos.
- No apto para uso en producción como modelo de IA: no hay pesos, tokenizador, pipeline ni evaluación reproducible.
- Riesgo de seguridad para el usuario final: descarga de ejecutables de terceros desde enlaces externos con instrucciones de elevación de privilegios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sanchez287/lucid-keyless-executor
- Enlace de descarga externo citado en la model card: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Releases del autor citadas: https://github.com/lBishop60/lucid-keyless-executor/releases/latest
- Paper, blog, repositorio de código o demo asociados al modelo: no disponible.
