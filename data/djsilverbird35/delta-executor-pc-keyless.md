# DJSilverbird35/delta-executor-pc-keyless

## Resumen

El repositorio `DJSilverbird35/delta-executor-pc-keyless` no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado como ejecutable portable para Windows x64 que se presenta como "Delta Executor PC Keyless", una herramienta de tipo *executor* orientada a la inyección de scripts Luau en clientes de Roblox, según se desprende de la model card y de los metadatos del repositorio.

La ficha del autor describe un binario `rob-run-cheat-mod-menu-v1.2.2-win64.exe` distribuido dentro de un ZIP de 4,8 MB protegido con contraseña, con supuestas capacidades de *attach* a procesos, puente con la máquina virtual Luau, compatibilidad sUNC superior al 98 % y un editor Monaco integrado. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia: los tags (`windows`, `windows-11`, `x64`, `portable`) confirman que es software de escritorio, no un modelo entrenado.

Por tanto, esta ficha documenta el artefacto tal y como aparece publicado, pero debe quedar claro que no es evaluable como modelo de IA: no existen parámetros, contexto, cuantizaciones ni benchmarks de lenguaje. Además, el contenido de la model card incluye indicios claros de riesgo (distribución vía enlaces a repositorios de terceros, contraseña fija en el archivo, instrucciones para desactivar avisos de SmartScreen y ejecutar como administrador), por lo que se recomienda tratar el binario como no fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un transformer, MoE, SSM ni ningún otro tipo de red neuronal. El artefacto descrito es un binario Windows x64 (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`, build `v1.0.3 (12B3BA)`) empaquetado en un ZIP de 4,8 MB con contraseña `2026`. La model card menciona componentes de software como un puente con la VM Luau, `hookmetamethod`, `getgc`, Drawing API y un editor Monaco multpestaña, que son elementos de un *executor* de scripts, no de un modelo entrenado.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación de modelado, porque el artefacto no es un modelo. Cualquier afirmación sobre arquitectura o entrenamiento sería inventada y, por tanto, se omite.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve matemáticas ni procesa visión.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos (14 idiomas) corresponden a los campos `language` del repositorio, no a competencia lingüística verificada del artefacto.
- Según la model card, el binario afirmaría realizar *attach* a procesos, inyección de scripts Luau, sincronización de offsets tras parches y edición de scripts en un editor tipo Monaco. Estas afirmaciones no están verificadas de forma independiente y no constituyen capacidades de IA.

## Casos de uso

- No procede como modelo de IA. No se identifican casos de uso legítimos de inferencia, generación o análisis.
- El artefacto se presenta como *executor* para Roblox, lo que entra en conflicto con los términos de servicio de dicha plataforma y con prácticas habituales de seguridad.
- No se recomienda su uso en entornos de producción, desarrollo o investigación.
- No se recomienda su descarga ni ejecución: el flujo descrito incluye ejecutar como administrador, desactivar avisos de SmartScreen y usar una contraseña fija publicada en la propia ficha.
- No se debe integrar en pipelines de CI/CD, agentes ni sistemas automatizados.
- Para necesidades reales de generación de código, razonamiento o agentes, deben evaluarse modelos de lenguaje publicados con pesos, tokenizador y benchmarks verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento propias del binario (por ejemplo, *attach* en menos de 22 ms, uso de RAM inferior a 54 MB, compatibilidad sUNC superior al 98 %), pero no son benchmarks de modelos de IA ni han sido verificados de forma independiente. No se presentan tablas comparativas con MMLU, HumanEval, GSM8K ni métricas equivalentes porque no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos ni inferencia neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue: ejecución directa del `.exe` en Windows x64; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: las cifras de la model card (menos de 22 ms, menos de 8 ms, menos de 19 ms) corresponden a operaciones del binario y no están verificadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| delta-executor-pc-keyless | Ejecutable Windows x64 (no es modelo de IA) | no disponible | no disponible | MIT | Repositorio de Hugging Face con 0 descargas y 0 likes |
| Modelos de lenguaje open source comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican modelos de IA comparables porque el artefacto no pertenece a esa categoría. La comparativa con LLM de tamaño o tarea similar no procede.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con métricas de lenguaje, razonamiento o código.
- Riesgo de seguridad elevado: la distribución se realiza mediante enlaces a repositorios de GitHub de terceros, con contraseña fija publicada y instrucciones para ejecutar como administrador y desactivar SmartScreen.
- La model card incluye indicios de ingeniería social (badges de descargas y valoraciones no verificables, nombre de archivo que sugiere un *cheat/mod menu*) y no aporta hashes, firmas ni verificación de integridad.
- El repositorio tiene 0 descargas y 0 likes, lo que contradice las cifras de "864K+ descargas" mostradas en la propia ficha.
- La licencia MIT se declara en los metadatos, pero el binario distribuido no incluye el código fuente, por lo que la licencia no es verificable en la práctica.
- Uso potencialmente contrario a los términos de servicio de plataformas de terceros (Roblox) y a normativas de seguridad informática.
- No se debe ejecutar en máquinas de producción, entornos corporativos ni con privilegios elevados.
- Las capacidades multilingües declaradas no están respaldadas por ninguna evaluación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DJSilverbird35/delta-executor-pc-keyless
- Enlace de descarga citado en la model card (terceros, no verificado): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Releases citadas en la model card (terceros, no verificado): https://github.com/stephanieahmed00092/delta-executor-pc-keyless/releases/latest
