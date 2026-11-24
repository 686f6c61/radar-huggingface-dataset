# okyak/schedule-1-cheat-trainer-keyless

## Resumen

`okyak/schedule-1-cheat-trainer-keyless` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un ejecutable de Windows (`solara-executor-v3-keyless-v1.2.2-win64.exe`, 4,8 MB) presentado como "cheat trainer" para el juego *Schedule 1*. El artefacto se distribuye como archivo ZIP protegido con contraseña y se promociona mediante enlaces a repositorios de GitHub de terceros, no mediante pesos de modelo ni tarjetas de arquitectura.

La model card no contiene ninguna información sobre arquitectura neuronal, parámetros, tokenizador, datos de entrenamiento o benchmarks. Los metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`, licencia MIT) describen un binario portable, no un modelo de lenguaje. Cualquier sección de esta ficha relativa a especificaciones técnicas, capacidades o rendimiento debe leerse como "no disponible" o "no aplicable", porque el objeto descrito no es un modelo.

Desde la perspectiva de un editor técnico, este repositorio debe clasificarse como contenido ajeno al catálogo de modelos y potencialmente malicioso: la combinación de ejecutable ofuscado, contraseña de extracción para evadir análisis automáticos, petición de ejecución como administrador y desactivación de alertas de Windows Defender constituye un patrón clásico de distribución de *malware* o *scam*. No se recomienda su descarga ni ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un binario PE x64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; no verificado) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe` y build `v3.8.7` / `10AD68`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El artefacto declarado es `solara-executor-v3-keyless-v1.2.2-win64.exe`, un ejecutable de Windows de 64 bits que, según la model card, opera en modo usuario con renderizado por Desktop Duplication, "15 worker threads", un overlay externo a 162 Hz y comunicación con memoria del proceso del juego. Estas afirmaciones no son verificables a partir de la información proporcionada y no constituyen una descripción de arquitectura de modelo.

No se declara ningún proceso de entrenamiento, conjunto de datos, número de tokens, RLHF, DPO ni innovación algorítmica. La model card se limita a material promocional y a instrucciones de instalación.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las "capacidades" declaradas por el autor son funcionalidades de un supuesto *cheat* para videojuegos: overlay externo, radar 2D, filtro de botín, *panic key* (`END`) y suavizado de entrada Bézier.
- Estas funcionalidades no están verificadas y su ejecución implicaría la instalación de software de terceros no auditado.
- Multilingüismo declarado únicamente en los metadatos (14 idiomas); sin evidencia de implementación.

## Casos de uso

No existen casos de uso legítimos como modelo de IA. Los escenarios plausibles son de riesgo:

- Evaluación de seguridad defensiva: usar el repositorio como muestra para entrenar clasificadores de detección de *malware* o de model cards fraudulentas en plataformas de modelos.
- Investigación de *supply chain*: analizar el patrón de distribución (ZIP con contraseña, enlaces a repos de GitHub de terceros, instrucciones para desactivar Defender) como caso de estudio de campañas de *scam* en Hugging Face.
- Docencia en concienciación: ilustrar ante desarrolladores por qué no debe ejecutarse un binario descargado de un repositorio de modelos sin firma ni procedencia verificable.
- Auditoría de plataforma: documentar para el equipo de moderación de Hugging Face el incumplimiento de las políticas de contenido del repositorio.
- Análisis forense en entorno aislado (sandbox sin red, VM desechable) para caracterizar el binario antes de reportarlo.
- Elaboración de listas de bloqueo: incorporar el hash del ZIP y del `.exe` a filtros de proxy o EDR corporativos.

En ningún caso se recomienda su uso para jugar, automatizar tareas ni integrarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación de modelos, porque no es un modelo. Las cifras que aparecen en la model card (96K descargas, 99 % de valoración, 162 Hz, menos de 12 ms, menos de 50 MB de RAM) son afirmaciones promocionales del autor sin verificación independiente y no deben interpretarse como rendimiento medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11, x64 (Intel y AMD).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisito declarado por el autor: ejecutar el `.exe` como administrador y desactivar alertas de Windows Defender, lo que constituye en sí mismo un indicador de riesgo.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, se compara con otros repositorios anómalos de Hugging Face:

| Repositorio | Tipo de artefacto | Licencia declarada | Verificabilidad | Riesgo |
|---|---|---|---|---|
| `okyak/schedule-1-cheat-trainer-keyless` | ZIP con `.exe` de Windows | MIT | Nula (sin firma, sin hash publicado) | Alto |
| Repositorios de modelos legítimos (p. ej. pesos safetensors) | Pesos de red neuronal | Apache-2.0 / MIT / Llama | Alta (pesos auditables, benchmarks públicos) | Bajo |
| Repositorios de herramientas CLI open source | Código fuente compilable | MIT / GPL | Media-alta (código revisable) | Bajo-medio |

## Limitaciones y advertencias

- No es un modelo de IA: no debe catalogarse, evaluarse ni desplegarse como tal.
- Riesgo de seguridad elevado: ejecutable sin firma, distribuido en ZIP con contraseña para dificultar el análisis automático, con instrucciones explícitas de desactivar Windows Defender y ejecutar como administrador.
- Procedencia no verificable: los enlaces de descarga apuntan a repositorios de GitHub de terceros (`GraceFernandez01321`, `stijntrinh2994`) no vinculados al autor declarado en Hugging Face.
- Posible infracción de las políticas de contenido de Hugging Face y de los términos de servicio de *Schedule 1*; el propio autor lo describe como "game cheat".
- Licencia MIT declarada, pero irrelevante sin código fuente ni pesos auditables; una licencia permisiva no legitima la distribución de software potencialmente malicioso.
- Cero descargas y cero *likes* en el momento de la consulta, pese a que la model card muestra insignias de "96K+ descargas" y "99 % verificado": contradicción que refuerza la sospecha de contenido fraudulento.
- Alucinación y sesgos: no aplica como modelo; aplica como afirmaciones falsas o no verificadas en la model card.
- Recomendación: no descargar, no extraer, no ejecutar; reportar el repositorio a la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/okyak/schedule-1-cheat-trainer-keyless
- Enlace de descarga citado en la model card (no recomendado): https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
- Repositorio de GitHub citado como alternativo (no recomendado): https://github.com/stijntrinh2994/schedule-1-cheat-trainer-keyless/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
