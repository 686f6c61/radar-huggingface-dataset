# mosonchan/luna-atlantis-executor

## Resumen

`mosonchan/luna-atlantis-executor` es un repositorio alojado en Hugging Face que no contiene un modelo de lenguaje, sino un supuesto ejecutor portable para Windows (un binario `.exe` empaquetado en un `.zip`) orientado a la inyección de scripts en entornos de juego tipo Roblox (se mencionan Luau VM, teleport scripts y un "script hub"). El autor declarado es el usuario `mosonchan`, aunque la model card apunta a un repositorio de GitHub de un tercero (`louischavez7324/luna-atlantis-executor`) como origen de la descarga. No se declara ninguna arquitectura de red neuronal, ni pesos, ni pipeline de inferencia.

La ficha se ha elaborado a partir de la información disponible en Hugging Face y de la model card pública. No existe información verificable sobre parámetros, contexto, entrenamiento ni benchmarks, por lo que la mayoría de campos técnicos se marcan como "no disponible". El interés de documentarlo no es técnico-ml, sino de seguridad: el patrón de distribución (zip con contraseña, ejecutable "run as administrator", repositorio de GitHub ajeno al autor, cero descargas y cero likes) coincide con campañas habituales de malware.

Se recomienda tratar este artefacto como no fiable y no ejecutarlo en ningún sistema, especialmente en máquinas de desarrollo o con credenciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no verificable en el binario) |
| Licencia | MIT (declarada en los metadatos del repo) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 8,9 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni un pipeline de Hugging Face (`pipeline: no disponible`). El contenido descrito en la model card es una aplicación de escritorio para Windows 10 (22H2) y Windows 11 (24H2) sobre procesadores x64 Intel/AMD, empaquetada como `luna-atlantis-executor-v1.2.0-win64.zip` (8,9 MB) y protegida con contraseña de descompresión (`2026`). El ejecutable interno se identifica como `luna-atlantis-executor-v1.2.0-win64.exe`, build `v4.1.1 (8A3ED6)`.

La model card describe módulos de "keyless execution flow", "multi-instance attach", "post-patch offset sync", "instant client attach" con "Luau VM bridge", un "integrated script hub" y un "auto-execute directory" con "automatic teleport script reloading". Estos términos corresponden a herramientas de inyección de scripts en videojuegos, no a técnicas de entrenamiento de modelos. No se documenta ningún dataset, proceso de RLHF/DPO ni innovación de arquitectura neuronal.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling en el sentido de APIs de modelos.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El multilingüismo indicado en los metadatos (14 idiomas) no tiene respaldo técnico verificable en el artefacto.
- El binario afirma realizar "attachments" a procesos cliente, sincronización de offsets tras parches y ejecución de scripts, capacidades propias de un ejecutor de cheats, no de un modelo.

## Casos de uso

No se identifican casos de uso legítimos de IA para este artefacto. Los escenarios que sugiere la model card son los siguientes, y se documentan únicamente a efectos de evaluación de riesgo:

- Inyección de scripts en clientes de juego: el binario afirma adjuntarse a procesos cliente y ejecutar scripts Luau, lo que en la práctica se asocia a trampas en juegos multijugador.
- Ejecución "keyless" de presets alojados en la nube: implica descarga y ejecución de código de origen no verificado en el equipo del usuario.
- Auto-ejecución de scripts al iniciar el cliente: persiste código de terceros sin control del usuario.
- Distribución con contraseña y "run as administrator": patrón habitual para evadir análisis automáticos de antivirus y elevar privilegios.
- Suplantación de repositorio: la descarga apunta a un repositorio de GitHub de un tercero distinto del autor del repo de Hugging Face, sin trazabilidad.
- Cebo de ingeniería social: badges falsos de "810K+ descargas" y "Rating 5.0/5" en un repo con 0 descargas y 0 likes reales en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye cifras de "polling" (271 Hz, 351 Hz, 408 Hz), latencias de respuesta (< 31 ms) y uso de memoria (< 28–39 MB), pero son afirmaciones del autor sin metodología ni verificación independiente, y no corresponden a métricas de modelos de IA (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: no aplica (no es un modelo de IA; no requiere GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2) sobre x64 Intel/AMD.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama, TGI no son relevantes).
- Huella declarada: menos de 39 MB de RAM y menos de 28 MB en el módulo de auto-ejecución, según el autor; no verificado.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, porque el artefacto no es un modelo. Frente a ejecutores legítimos de scripting en entornos controlados (por ejemplo, intérpretes Lua oficiales), la diferencia es que este binario se distribuye ofuscado, con contraseña y sin código fuente auditable.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse como tal.
- Riesgo alto de malware: zip con contraseña, ejecutable que pide "run as administrator", descarga desde un repositorio de GitHub de un tercero y ausencia total de trazabilidad del binario.
- Reputación inexistente: 0 descargas y 0 likes en Hugging Face, frente a badges que afirman 810K+ descargas y valoración 5.0/5, lo que sugiere manipulación de la presentación.
- Licencia MIT declarada, pero irrelevante si el binario no es auditable; la licencia no otorga garantías sobre el contenido real del ejecutable.
- Posible violación de términos de servicio de videojuegos y, según jurisdicción, de normativa sobre trampas y distribución de software malicioso.
- No ejecutar en equipos de desarrollo, CI/CD ni máquinas con credenciales. Si ya se ha descargado, analizar en entorno aislado y no descomprimir fuera de una sandbox.
- Los idiomas listados en los metadatos no implican capacidades lingüísticas reales del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mosonchan/luna-atlantis-executor
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/louischavez7324/luna-atlantis-executor
- Releases del repositorio de GitHub referenciado (no verificado, no recomendado): https://github.com/louischavez7324/luna-atlantis-executor/releases/latest
