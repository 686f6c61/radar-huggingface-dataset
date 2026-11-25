# devma1980/murderers-vs-sheriffs-script

## Resumen

El artefacto publicado bajo el identificador `devma1980/murderers-vs-sheriffs-script` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un paquete ejecutable para Windows etiquetado como "script" para el juego *Murderers vs Sheriffs*, distribuido como archivo ZIP de 4,8 MB que contiene un binario `.exe` y que se promociona mediante una model card con estructura de página de descarga (badges de descargas, botones, contraseña de descompresión y enlaces a repositorios de GitHub de terceros).

La model card no declara arquitectura de red neuronal, parámetros, longitud de contexto, tokenizador, datos de entrenamiento ni formato de pesos. Los metadatos de Hugging Face únicamente indican etiquetas de plataforma (`windows`, `windows-11`, `x64`, `portable`), una lista de 14 idiomas y licencia MIT. No hay pipeline declarado ni resultados de benchmarks.

Desde la perspectiva de un editor técnico de IA open source, este artefacto debe clasificarse como software de terceros empaquetado como binario opaco, no como modelo. La ficha que sigue documenta lo que la información disponible permite afirmar, marcando explícitamente como "no disponible" todo aquello que no se puede verificar, e incluye advertencias de seguridad relevantes para cualquier evaluador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin verificación funcional) |
| Licencia | MIT (declarada en metadatos y model card) |
| Formato de pesos | no disponible (el paquete es un ZIP con un `.exe`; no hay safetensors, GGUF ni ningún formato de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El paquete es un archivo `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip` de 4,8 MB que, según la model card, contiene un ejecutable `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe` (build declarado `v3.1.6`, `8009E7C271`) destinado a Windows 10 y Windows 11 x64. La card menciona módulos de "user-mode external core", "bezier input smoothing", "panic key unload", "2D radar & loot filter" y "stream-proof render layer", con métricas inventariadas en la propia card (97,3 % de consistencia, < 22 ms de respuesta, 301 Hz de sondeo, < 34 MB y < 21 MB de RAM). Ninguna de estas cifras es verificable ni procede de una evaluación independiente.

No se declaran datos de entrenamiento, número de tokens, composición del dataset, ni procesos de RLHF, DPO o ajuste fino, porque no hay modelo. Tampoco se documenta el código fuente del binario, las dependencias que carga ni el proceso de compilación, lo que impide cualquier auditoría técnica.

## Capacidades

- No se trata de un modelo generativo: no genera texto, código, matemáticas ni realiza razonamiento.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües verificables; la lista de idiomas en los metadatos parece referirse a la localización del artefacto, no a competencia lingüística de un modelo.
- Las funcionalidades descritas en la card son propias de una herramienta de asistencia para un videojuego (radar 2D, filtro de loot, suavizado de entrada), no de un modelo de IA.
- No hay modo "thinking", visión, audio ni ninguna capacidad cognitiva declarada.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA, porque no lo es.
- Evaluación de seguridad de artefactos en Hugging Face: un analista puede usar este caso como ejemplo de paquete que se hace pasar por modelo y que distribuye un binario con contraseña de descompresión, útil para calibrar políticas de admisión de artefactos en un registro interno.
- Documentación de taxonomías: sirve para ilustrar la diferencia entre "modelo" y "software empaquetado" en guías de catalogación de repositorios.
- Formación en detección de ingeniería social: la estructura de la card (badges de descargas falsos, botones de descarga, contraseña en el texto, enlaces a repositorios de GitHub ajenos al autor) es un ejemplo didáctico de patrón de distribución sospechoso.
- Auditoría de licencias: permite practicar la verificación de que una licencia MIT declarada no cubre necesariamente binarios de terceros ni su procedencia.
- No se recomienda su ejecución en entornos de producción, investigación ni desarrollo bajo ninguna circunstancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (97,3 % de consistencia, < 22 ms, 301 Hz, < 34 MB de RAM) son afirmaciones del autor sin metodología, sin conjunto de evaluación y sin reproducibilidad, por lo que no constituyen benchmarks válidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la card no son verificables.
- Espacio en disco del paquete: 4,8 MB según la card.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. A modo de contraste categórico, un modelo de lenguaje real de tamaño pequeño declararía parámetros, contexto, tokenizador y formato de pesos, ninguno de los cuales está presente aquí.

| Criterio | Este artefacto | Modelo de IA típico en HF |
|---|---|---|
| Tipo | Binario `.exe` en ZIP | Pesos en safetensors/GGUF |
| Parámetros | no disponible | Declarados |
| Contexto | no disponible | Declarado |
| Pipeline | no disponible | Declarado (text-generation, etc.) |
| Benchmarks | no disponibles | Habitualmente publicados |
| Auditabilidad | Nula (binario opaco) | Alta (pesos y config) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o producción.
- Binario opaco distribuido con contraseña de descompresión (`2026`): patrón habitual para evadir análisis automáticos de malware.
- Enlaces de descarga apuntan a repositorios de GitHub de terceros (`Hiroshis198/...`, `sharp44667/...`) no vinculados al autor declarado en Hugging Face, lo que impide verificar la cadena de custodia del artefacto.
- La card incluye badges de descargas (569K+) y valoraciones (4,8/5) que no se corresponden con las métricas reales del repositorio (0 descargas, 0 likes en Hugging Face), lo que constituye una discrepancia verificable y un indicio de engaño.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del binario; la licencia cubre el texto de la card, no necesariamente el ejecutable de terceros.
- Riesgo de seguridad: ejecutar un `.exe` de procedencia no verificada como administrador, tal y como indica la propia card, expone el sistema a instalación de malware, robo de credenciales o persistencia no deseada.
- Posible incumplimiento de los términos de servicio del videojuego al que hace referencia, con riesgo de sanción para la cuenta del usuario.
- No apto para uso comercial, educativo ni de investigación; se recomienda su exclusión de cualquier catálogo de modelos.

## Enlaces

- Hugging Face: https://huggingface.co/devma1980/murderers-vs-sheriffs-script
- Repositorio de GitHub citado en la card (no verificado): https://github.com/sharp44667/murderers-vs-sheriffs-script
- Repositorio de GitHub citado en la card (no verificado): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026
- Paper: no disponible
- Blog o demo: no disponible
