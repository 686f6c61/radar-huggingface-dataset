# DevilPuppy/cs2-skin-changer

## Resumen

`DevilPuppy/cs2-skin-changer` es un repositorio alojado en Hugging Face que, a pesar de su nombre y su ubicación, no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows (build `v4.0.7`, código `3A50A4`) distribuido como archivo ZIP de 4,8 MB con contraseña de extracción `2026`, cuyo contenido declarado es una herramienta de cambio de skins para el videojuego Counter-Strike 2. El autor, identificado como DevilPuppy, lo publica con licencia MIT y etiquetas que apuntan a Windows 10/11 de 64 bits.

El artefacto no incluye pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. La model card no describe ninguna capacidad lingüística o de razonamiento, sino instrucciones de instalación de un binario, enlaces a lanzamientos alojados en repositorios de GitHub de terceros y una FAQ centrada en alertas de Windows Defender y SmartScreen. Los enlaces de descarga apuntan a cuentas distintas de la del autor (`ekaterina96522`, `Ingrid8835`) y el nombre del archivo descargable (`fisch-script-auto-catch-macro-v1.2.2-win64.zip`) no guarda relación con el identificador del repositorio, lo que constituye una señal de alarma clara.

Desde la perspectiva de evaluación de modelos, esta ficha no puede aportar especificaciones técnicas de IA porque no existen. El interés del caso es documental y de seguridad: ilustra cómo la plataforma Hugging Face puede alojar artefactos que no son modelos y que presentan patrones típicos de distribución de software potencialmente no deseado (contraseña en el archivo, ejecutable con privilegios de administrador, instrucciones para desactivar protecciones del sistema, enlaces de descarga desacoplados del repositorio original).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El artefacto es un binario compilado para Windows x64 que, según la model card, se ejecuta como administrador y aplica parches en directorios y reglas de cortafuegos. No se documenta el lenguaje de programación, las dependencias, el proceso de compilación ni el código fuente, pese a la licencia MIT declarada.

La model card menciona de forma genérica aceleración por GPU (CUDA, TensorRT, DirectML, OpenCL) y un «runtime sin telemetría», pero no aporta ninguna evidencia verificable ni especificación reproducible. No hay información sobre datos de entrenamiento, RLHF, DPO ni ninguna innovación técnica en el sentido habitual del término.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las etiquetas de idioma son metadatos del repositorio.
- El comportamiento declarado por el autor es la modificación de skins en Counter-Strike 2, extremo no verificado y potencialmente contrario a los términos de servicio del juego.

## Casos de uso

- Evaluación de seguridad de la cadena de suministro: el repositorio sirve como caso de estudio de artefactos no-modelo alojados en Hugging Face, con ejecutables, contraseñas embebidas y enlaces a cuentas de GitHub ajenas al autor.
- Formación en detección de phishing y malware: analizar la estructura de la model card (botones de descarga, contraseña `2026`, instrucciones para añadir exclusiones en Defender) permite construir reglas de detección para equipos de respuesta a incidentes.
- Auditoría de políticas de plataforma: útil para revisar cómo los sistemas de moderación de Hugging Face clasifican repositorios que no contienen modelos y que redirigen a binarios externos.
- Concienciación de usuarios: ejemplo práctico para explicar por qué no debe ejecutarse un binario con privilegios de administrador descargado de un repositorio sin trazabilidad.
- Investigación de ingeniería social: el patrón de nombres cruzados (repositorio `cs2-skin-changer` frente a archivo `fisch-script-auto-catch-macro`) es representativo de técnicas de camuflaje.
- Documentación de riesgos en pipelines de MLOps: recordatorio de que los escaneos de artefactos deben cubrir formatos distintos de safetensors y GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación de modelos. Las cifras que aparecen en la model card («99 % verified», «< 35 ms», «97,8 % consistency», «< 59 MB RAM») son afirmaciones de marketing sin metodología ni reproducibilidad y no deben interpretarse como resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica; la model card menciona CUDA, TensorRT, DirectML y OpenCL sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card carecen de metodología.
- Requisitos declarados por el autor: Windows 10/11 de 64 bits, ejecución como administrador, 4,8 MB de descarga y menos de 59 MB de RAM según sus propias afirmaciones.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, podría compararse con otros repositorios de Hugging Face que alojan binarios o herramientas en lugar de pesos, pero no se dispone de datos verificables sobre ellos en la información proporcionada.

| Criterio | `DevilPuppy/cs2-skin-changer` | Modelo de IA típico |
|---|---|---|
| Contenido | ZIP con ejecutable de 4,8 MB | Pesos en safetensors/GGUF |
| Pesos | No | Sí |
| Contexto | No aplica | Definido en config.json |
| Licencia | MIT declarada | Variable |
| Verificabilidad | Nula (binario cerrado) | Alta (pesos y arquitectura públicos) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe utilizarse ni evaluarse como tal.
- Riesgo de seguridad elevado: distribución de un ejecutable que se solicita ejecutar como administrador, con contraseña de extracción y con instrucciones explícitas para añadir exclusiones en Windows Defender y SmartScreen.
- Enlaces de descarga desacoplados: los botones apuntan a repositorios de GitHub de cuentas distintas (`ekaterina96522`, `Ingrid8835`) alojados fuera de Hugging Face, sin firma ni verificación de integridad.
- Inconsistencia de nombres: el archivo descargable (`fisch-script-auto-catch-macro-v1.2.2-win64.zip`) no coincide con el identificador del repositorio, patrón habitual en campañas de distribución de software no deseado.
- Riesgo de baneo en el juego: modificar skins en Counter-Strike 2 puede contravenir los términos de servicio de Valve y provocar sanciones en la cuenta.
- Licencia MIT declarada sin código fuente: la licencia carece de efecto práctico si no se distribuye el código correspondiente.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la superficie de daño observada pero no la naturaleza del riesgo.
- Sin sesgos lingüísticos evaluables al no existir componente de lenguaje; las etiquetas multilingües son meramente descriptivas.
- No apto para producción en ningún contexto de IA, MLOps o investigación de modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DevilPuppy/cs2-skin-changer
- Enlace de descarga citado en la model card (GitHub, cuenta `ekaterina96522`): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Enlace de lanzamientos citado en la model card (GitHub, cuenta `Ingrid8835`): https://github.com/Ingrid8835/cs2-skin-changer/releases/latest
