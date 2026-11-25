# DeltaMelvin/fisch-script-macro-portable

## Resumen

El artefacto publicado bajo el identificador `DeltaMelvin/fisch-script-macro-portable` no es un modelo de lenguaje: se trata de un paquete ejecutable portable para Windows x64 que el autor presenta como macro/script para el juego Roblox "Fisch". La model card lo describe como una herramienta de automatización con funciones de "server hopper", teleport, farm loop, ESP de entidades y guard anti-AFK, distribuida como archivo ZIP de 4,8 MB con contraseña de descompresión. No contiene pesos, tokenizador, configuración de transformer ni pipeline de inferencia; la etiqueta `pipeline` de Hugging Face figura como no disponible.

La relevancia de esta ficha es negativa: sirve como caso documentado de artefacto que se hace pasar por modelo alojado en Hugging Face pero que en realidad distribuye un binario ejecutable de terceros desde enlaces de GitHub, con instrucciones para ejecutarlo como administrador y desactivar avisos de Windows Defender/SmartScreen. Cualquier evaluación técnica seria debe concluir que no es desplegable como modelo de IA y que su uso conlleva riesgos de seguridad.

No hay información sobre arquitectura, tamaño de parámetros, contexto, datos de entrenamiento ni benchmarks, porque el artefacto no es un modelo. Los resultados de búsqueda web recuperados (hojas de datos de transistores 2N5153HR de STMicroelectronics y Microsemi) no guardan relación con este artefacto y no aportan datos técnicos utilizables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete ejecutable portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card; no implica capacidad lingüística de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un ejecutable `.exe` y contraseña de extracción `2026`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un "runtime" con componentes funcionales (server hopper, configuración JSON persistente, teleport por memoria directa, bucle de farm automatizado, ESP 3D y guard anti-AFK) y cita valores como 13 y 14 hilos de trabajo, polling a 469 Hz y 146 Hz, y latencia inferior a 34 ms. Estos datos pertenecen a la supuesta herramienta de automatización, no a un modelo, y no están verificados por ninguna fuente independiente.

El artefacto se distribuye mediante un ZIP alojado en un repositorio de GitHub (`Giovanni9790/monster-hunter-wilds-trainer-mod`), con nombre de archivo que hace referencia a un "trainer mod" de Monster Hunter Wilds, lo que evidencia una discrepancia entre el nombre del modelo en Hugging Face, el contenido del paquete y la función declarada. No hay información sobre dataset, tokens de entrenamiento, RLHF/DPO ni innovaciones técnicas de inferencia.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües demostradas; los códigos de idioma son metadatos de la model card.
- Declara, según el autor, funciones de automatización de juego: server hopping, teleport, farm loop, ESP y anti-AFK.
- No hay evidencia verificable de que estas funciones operen como se describe.

## Casos de uso

- Ninguno recomendado en entornos de desarrollo, investigación o producción de IA.
- Auditoría de seguridad: analizar el paquete en un entorno aislado para documentar técnicas de ingeniería social en model cards (uso de insignias, contraseñas y enlaces externos).
- Formación en concienciación: ejemplo de artefacto que simula ser un modelo en Hugging Face para distribuir binarios de terceros.
- Investigación de cadena de suministro: rastrear la relación entre el repositorio de Hugging Face y los repositorios de GitHub enlazados.
- Moderación de plataformas: identificar patrones de publicación (tags de sistema operativo, insignias de "verificado", contraseñas de descompresión) para políticas de contenido.
- No debe usarse para automatizar juegos ni para ejecutar el binario en máquinas personales o corporativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes porque el artefacto no es un modelo. Los únicos valores numéricos de la model card (4,8 MB, 469 Hz, 146 Hz, menos de 34 ms, 13/14 hilos) corresponden a la herramienta declarada y no están verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama, TGI no son relevantes).
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DeltaMelvin/fisch-script-macro-portable` | Paquete ejecutable Windows (no modelo) | no disponible | no disponible | MIT | ZIP externo con contraseña |
| Modelo de lenguaje open source típico (p. ej., familia Llama, Mistral, Qwen) | Modelo transformer | miles de millones de parámetros | miles de tokens | licencias específicas | pesos safetensors/GGUF en HF |
| No disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican modelos comparables de la misma categoría porque el artefacto no pertenece a ninguna categoría de modelo de IA.

## Limitaciones y advertencias

- No es un modelo de IA; tratarlo como tal invalida cualquier evaluación técnica.
- Distribución de binario ejecutable desde enlaces externos con instrucciones de ejecución como administrador.
- La model card indica explícitamente que Windows Defender/SmartScreen pueden alertar y sugiere desactivar o permitir el binario, práctica de alto riesgo.
- Uso de contraseña de descompresión (`2026`) para evadir análisis automatizados.
- Discrepancia entre nombre del modelo, nombre del ZIP (relacionado con Monster Hunter Wilds) y función declarada (Fisch/Roblox).
- Cero descargas y cero likes en el momento de la consulta; sin validación comunitaria.
- Riesgo de malware, robo de credenciales o modificación del sistema si se ejecuta.
- Licencia MIT declarada, pero sin código fuente ni pesos que verificar.
- No usar en producción, entornos corporativos ni máquinas con datos sensibles.
- Los enlaces de búsqueda web recuperados (transistores 2N5153HR) no están relacionados y no aportan contexto técnico.

## Enlaces

- Hugging Face: https://huggingface.co/DeltaMelvin/fisch-script-macro-portable
- Repositorio GitHub enlazado en la model card: https://github.com/Volkov78996/fisch-script-macro-portable
- Repositorio GitHub del ZIP: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod
- Enlace de descarga del ZIP: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Resultados de búsqueda web no relacionados (transistores): https://www.st.com/resource/en/datasheet/2n5153hr.pdf y https://www.alldatasheet.com/datasheet-pdf/pdf/409362/MICROSEMI/2N5153.html
