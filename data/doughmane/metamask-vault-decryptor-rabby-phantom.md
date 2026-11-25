# DOUGHMANE/metamask-vault-decryptor-rabby-phantom

## Resumen

El repositorio `DOUGHMANE/metamask-vault-decryptor-rabby-phantom` no contiene un modelo de inteligencia artificial. Se trata de un artefacto publicado en Hugging Face cuyo contenido es una model card con apariencia de página de descarga de software para Windows: un ejecutable portable (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`) distribuido en un ZIP de 4,8 MB protegido con la contraseña `2026` y alojado en un repositorio de GitHub de terceros. No hay pesos, tokenizador, configuración ni pipeline asociados.

El texto del README mezcla terminología de ejecutores de scripts Luau (sUNC, `hookmetamethod`, `getgc`, Drawing API, Monaco Editor) con referencias a carteras de criptomonedas (MetaMask, Rabby, Phantom). Es decir, el artefacto se presenta como una herramienta que, supuestamente, descifraría bóvedas (vaults) de carteras, pero el mecanismo real de distribución es un binario ejecutable con instrucciones para ejecutarlo como administrador y desactivar advertencias de Windows Defender.

Desde la perspectiva de evaluación de modelos, esta ficha no puede ofrecer especificaciones técnicas de arquitectura, entrenamiento ni capacidades, porque no existe ningún modelo subyacente. El interés técnico del repositorio es exclusivamente como caso de estudio de riesgo en la cadena de suministro de software: patrón típico de malware disfrazado de utilidad de criptomonedas, con ingeniería social (contraseña de descompresión, botón de descarga destacado, insignias de descargas infladas) y ejecución con privilegios elevados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card; no implica capacidad lingüística real) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`, no pesos) |

## Arquitectura y entrenamiento

No aplica. No existe una arquitectura de red neuronal, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO, SFT). El contenido del repositorio es una model card de tipo README con enlaces a un binario alojado en GitHub (`schneider6972/solara-executor-v3-keyless-2026`) y a un repositorio espejo (`pmohammed01/metamask-vault-decryptor-rabby-phantom`).

Las cifras que aparecen en el README (por ejemplo, "98%+ sUNC", "478 Hz polling", "< 62 MB RAM", "12 worker threads", "462K+ downloads") son afirmaciones de marketing sin verificación, no métricas de un modelo. El nombre del binario (`solara-executor`) sugiere un ejecutor de scripts para Roblox/Luau, categoría de software frecuentemente asociada a distribución de código no auditado.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas ni visión, porque no hay modelo.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües reales; los 14 idiomas listados son etiquetas de metadatos.
- El README describe, como supuestas funciones del binario: "keyless execution flow", "auto-execute directory", compatibilidad sUNC, "instant client attach", "integrated script hub" y un editor Monaco. Ninguna de estas funciones es verificable desde el repositorio y corresponden a la descripción de un ejecutor de scripts, no de un modelo.

## Casos de uso

No existen casos de uso legítimos como modelo de IA. Los escenarios que se describen a continuación son de análisis de riesgo, no recomendaciones de uso:

- Análisis de malware: el artefacto puede estudiarse en un entorno aislado (máquina virtual sin red, sin credenciales) para documentar el patrón de distribución de ejecutables disfrazados de utilidades de criptomonedas.
- Formación en seguridad: sirve como ejemplo didáctico de ingeniería social (contraseña de ZIP, instrucciones de "Run as Administrator", aviso de desactivar Defender) en cursos de concienciación.
- Investigación de cadena de suministro: permite analizar cómo se abusa de Hugging Face como plataforma de alojamiento para contenido ajeno a modelos, con enlaces a GitHub Releases de terceros.
- Detección y bloqueo: los equipos de seguridad pueden usar el patrón (nombre que imita carteras + extensión `.exe` + ZIP con contraseña) para construir reglas de detección en pasarelas de correo y proxies.
- Auditoría de plataformas: útil para evaluar las políticas de moderación de repositorios con licencia MIT y etiquetas de idioma que no corresponden a un modelo.
- Documentación de incidentes: sirve como referencia en informes internos sobre intentos de descarga de herramientas de "descifrado de bóvedas" de carteras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación porque no hay modelo que evaluar. Las cifras del README (sUNC, Hz, MB de RAM) no son benchmarks reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisitos declarados por el autor para el binario: Windows 10/11 de 64 bits, ejecución como administrador, 4,8 MB de espacio en disco para el ZIP. No se especifican requisitos de CPU, RAM ni dependencias.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo. Si se compara como software, los equivalentes serían otros ejecutores de scripts o utilidades de cartera, pero no se dispone de datos verificables para establecer una comparación técnica rigurosa.

| Criterio | Este repositorio | Modelo de IA típico en Hugging Face |
|---|---|---|
| Contenido | ZIP con `.exe` para Windows | Pesos en safetensors/GGUF |
| Pesos | No | Sí |
| Pipeline declarado | No disponible | Definido (text-generation, etc.) |
| Evaluación posible | No | Sí, con benchmarks |
| Riesgo de seguridad | Alto (ejecutable con privilegios) | Bajo/medio (pesos inertes) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad elevado: el README instruye a descargar un `.exe` de un repositorio de GitHub de terceros, extraerlo con contraseña y ejecutarlo como administrador. Este patrón es habitual en campañas de malware.
- El aviso del README que menciona "Windows Defender" (texto truncado en la información disponible) sugiere instrucciones para evitar controles de seguridad del sistema operativo.
- La licencia MIT declarada no otorga garantías sobre el binario ni sobre su procedencia; el código fuente del ejecutable no está disponible en el repositorio.
- Los contadores de descargas y las insignias del README no son verificables y pueden ser artificiales.
- El uso del nombre de carteras legítimas (MetaMask, Rabby, Phantom) para promocionar un "descifrador de bóvedas" constituye una suplantación de marca y una posible estafa dirigida a titulares de criptoactivos.
- No debe ejecutarse en equipos con credenciales, carteras o datos sensibles. Cualquier análisis debe hacerse en un entorno aislado y sin red.
- La fecha de creación (2026-11-24) y el resto de metadatos no aportan información técnica relevante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DOUGHMANE/metamask-vault-decryptor-rabby-phantom
- Repositorio de GitHub enlazado en el README (origen del binario): https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Repositorio espejo enlazado en el README: https://github.com/pmohammed01/metamask-vault-decryptor-rabby-phantom
- Paper: no disponible
- Blog o demo: no disponible
- Documentación oficial: no disponible
