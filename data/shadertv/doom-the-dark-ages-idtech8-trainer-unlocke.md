# ShaderTV/doom-the-dark-ages-idtech8-trainer-unlocke

## Resumen

El repositorio `ShaderTV/doom-the-dark-ages-idtech8-trainer-unlocke` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como archivo comprimido para Windows x64 (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip`, 4,8 MB) que la model card presenta como un "trainer unlocker" para el motor idTech 8 de Doom: The Dark Ages. No hay pesos neuronales, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado.

La model card mezcla terminología de modelos de lenguaje (etiquetas de idioma, licencia MIT, "model card") con contenido propio de software de modificación de videojuegos (auto-execute, teleport, aimbot, ESP, inyección de scripts en memoria, bypass de firmas del cliente). El paquete se ofrece mediante enlaces a repositorios de GitHub de terceros y un binario `.exe` que se solicita ejecutar "como administrador", con contraseña de descompresión `2026`.

Desde la perspectiva de evaluación de IA open source, este artefacto no es evaluable como modelo: no existen parámetros, contexto, cuantizaciones ni benchmarks. Además, el patrón de distribución (binario ejecutable de origen no verificado, contraseña en el archivo, petición de privilegios de administrador, referencias cruzadas a repositorios ajenos al autor declarado) es característico de campañas de distribución de malware, no de software legítimo. Se recomienda no descargar ni ejecutar el contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas de la model card) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (el artefacto es un `.zip` de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido descrito en la model card es un ejecutable de Windows (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `v1.6.2` / `FBF08CA0B7`) que, según el texto, realiza "instant client attach" mediante un "Luau VM bridge", inyección de scripts en memoria ("direct-memory keyless execution flow"), sincronización de offsets tras parches del cliente y un "Monaco Editor workspace" para edición de scripts. Son funciones de modificación de procesos en tiempo de ejecución, no de inferencia.

No se documenta dataset, número de tokens, RLHF, DPO ni ninguna innovación de modelado. La única cifra técnica verificable es el tamaño del archivo comprimido (4,8 MB), coherente con un binario pequeño y no con pesos de un modelo.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de modelos de lenguaje.
- No implementa agentes ni razonamiento multi-paso.
- El multilingüismo es únicamente una lista de etiquetas de idioma en la model card; no hay evidencia de capacidades lingüísticas.
- Las funciones descritas son de modificación de un proceso de juego: auto-execute, teleport, multi-instancia, edición de scripts y sincronización de offsets.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no tiene aplicaciones legítimas de procesamiento de lenguaje, visión o generación.
- Automatización de atención al cliente: no aplicable, no hay modelo conversacional.
- Generación de código en producción: no aplicable, no hay modelo de código.
- Análisis de documentos o RAG: no aplicable, no hay encoder ni ventana de contexto.
- Evaluación comparativa de LLM: no aplicable, no hay pesos ni benchmarks.
- Uso educativo o de investigación en IA: no aplicable; el contenido es software de terceros no verificado.
- Cualquier uso en producción requeriría ejecutar un binario de origen desconocido con privilegios de administrador, lo que constituye un riesgo de seguridad, no un caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay modelo).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Requisitos del artefacto real: Windows x64 (Windows 11 mencionado en las etiquetas), ejecución como administrador, 7-Zip o WinRAR para extraer con contraseña `2026`; la model card menciona un consumo de "< 23 MB" de RAM y latencias de "< 22 ms" y "< 23 MB", cifras no verificables.
- Latencia y throughput: no disponibles como métricas de modelo.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, los binarios de modificación de juegos no se comparan por parámetros, contexto ni licencia de pesos, sino por procedencia y verificación de firma, que aquí no se aporta.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como LLM carece de sentido.
- Origen no verificado: el binario se distribuye mediante enlaces a repositorios de GitHub (`rocha1838/...`, `Voa34/...`) que no coinciden con el autor declarado (`ShaderTV`), un patrón típico de suplantación.
- Ejecución como administrador: la model card pide explícitamente "Run as Administrator", lo que otorga al binario control total del sistema.
- Contraseña de archivo (`2026`): técnica habitual para evadir análisis automáticos de antivirus y sandboxes.
- Nombres incoherentes: el archivo se llama `deadlock-cheat-esp-aimbot-2026-...` pero se presenta como trainer de Doom: The Dark Ages; la mezcla de nombres sugiere reutilización de plantillas.
- Riesgo de malware: no hay hash publicado, ni firma de código, ni auditoría; la licencia MIT declarada no aporta ninguna garantía sobre el contenido.
- Uso comercial: la licencia MIT permitiría teóricamente el uso comercial del contenido, pero al no ser un modelo y tratarse de software de modificación de juegos, su uso puede infringir los términos de servicio del juego y la legislación aplicable.
- Recomendación: no descargar, no extraer y no ejecutar el archivo.

## Enlaces

- Hugging Face: https://huggingface.co/ShaderTV/doom-the-dark-ages-idtech8-trainer-unlocke
- Repositorio citado en la model card: https://github.com/Voa34/doom-the-dark-ages-idtech8-trainer-unlocker
- Enlace de descarga citado en la model card: https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Paper, blog, demo o repositorio oficial del modelo: no disponible
