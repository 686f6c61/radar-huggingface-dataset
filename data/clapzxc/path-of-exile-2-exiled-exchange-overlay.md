# clapzxc/path-of-exile-2-exiled-exchange-overlay

## Resumen

`clapzxc/path-of-exile-2-exiled-exchange-overlay` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits presentado como overlay y herramienta de automatización para el videojuego Path of Exile 2, con supuestas capacidades de inyección de scripts, adjunción a procesos del cliente y ejecución de módulos Luau. El autor declarado es `clapzxc` y la licencia indicada en los metadatos es MIT.

El artefacto no expone pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia: la información disponible describe únicamente un binario portable (`dandys-world-forsaken-script-2026-v1.2.2-win64.exe`) distribuido en un ZIP de 4,8 MB protegido con contraseña. No hay parámetros, contexto, datos de entrenamiento ni benchmarks asociados, por lo que no es evaluable como modelo de lenguaje.

La relevancia de esta ficha es, por tanto, la de una advertencia: el contenido de la model card incluye enlaces a repositorios de GitHub de terceros, instrucciones para ejecutar un binario como administrador y una contraseña de descompresión. Este patrón es habitual en campañas de distribución de software no verificado y no debe tratarse como un modelo open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto distribuido como `.zip` con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe componentes de software de escritorio: un "script hub integrado", "adjunción instantánea al cliente" mediante un puente Luau VM, "flujo de ejecución sin clave", "adjunción multi-instancia", compatibilidad declarada con "98%+ sUNC" y un "directorio de auto-ejecución". Estos términos pertenecen al ámbito de la modificación e inyección de procesos en videojuegos, no al entrenamiento de modelos.

No se especifican tokens de entrenamiento, composición del dataset, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia como decodificación especulativa o atención lineal. Cualquier dato de rendimiento incluido en la model card (por ejemplo, "370 Hz de polling" o "< 17 ms de respuesta") corresponde a afirmaciones del autor sobre el binario, no verificables y sin relación con métricas de modelos de lenguaje.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta razonamiento multi-paso ni modos de pensamiento.
- Las capacidades declaradas por el autor son de automatización de cliente de juego: adjunción a procesos, inyección de scripts Luau, ejecución multi-instancia y recarga automática de scripts.
- Multilingüismo: los idiomas listados en los metadatos corresponden a la localización del artefacto, no a competencia lingüística de un modelo.
- No hay API, servidor de inferencia ni integración con frameworks como vLLM, TGI o llama.cpp.

## Casos de uso

- No procede: al no ser un modelo de IA, no existen casos de uso de inferencia, generación o razonamiento.
- Auditoría de seguridad: el artefacto puede analizarse en un entorno aislado para determinar qué hace el binario y qué tráfico de red genera.
- Estudio de patrones de distribución: la model card es un ejemplo de técnica de ingeniería social (contraseña en el ZIP, ejecución como administrador, enlaces a repositorios de terceros) útil para formación en ciberseguridad.
- Verificación de licencias: comprobar la compatibilidad de la licencia MIT declarada con la distribución de binarios de terceros.
- Monitorización de repositorios: incluir este tipo de artefactos en listas de exclusión de pipelines de descarga automática de modelos.
- Documentación de riesgos: registrar el caso en políticas internas de adquisición de software y modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits.
- Despliegue: ejecución directa del binario; no soporta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: las cifras de la model card (370 Hz, < 17 ms, < 42 MB de RAM) son afirmaciones del autor sin verificación independiente.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de lenguaje open source típico (p. ej., familia Llama, Qwen o Mistral) |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Pesos de red neuronal |
| Parámetros | no disponible | Millones o miles de millones |
| Contexto | no disponible | Miles a cientos de miles de tokens |
| Formatos | ZIP con EXE | safetensors, GGUF, etc. |
| Benchmarks | no disponible | MMLU, HumanEval, GSM8K, etc. |
| Licencia | MIT (declarada) | Variables (Apache 2.0, MIT, community) |
| Verificabilidad | Baja: binario cerrado, enlaces externos | Alta: pesos auditables y reproducibles |

No se identifican modelos comparables dentro de la categoría de modelos de IA, porque el artefacto no pertenece a ella.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en catálogos, evaluaciones ni pipelines de modelos.
- El binario se distribuye comprimido con contraseña y se solicita ejecutarlo como administrador, lo que impide el análisis previo y eleva el riesgo de seguridad.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`pedrolong1343`, `ren0561`) distintos del autor declarado en Hugging Face, lo que dificulta la trazabilidad.
- El nombre del ejecutable (`dandys-world-forsaken-script-2026-v1.2.2-win64.exe`) no coincide con el nombre del repositorio, indicio de reutilización de artefactos.
- Las afirmaciones de rendimiento y compatibilidad no están verificadas ni son reproducibles.
- La licencia MIT declarada no garantiza la legalidad de la distribución ni la ausencia de código propietario o malicioso.
- Uso en producción: desaconsejado en cualquier entorno; si se analiza, hacerlo en máquina virtual aislada y sin credenciales.
- Posible conflicto con los términos de servicio del videojuego al que hace referencia la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/clapzxc/path-of-exile-2-exiled-exchange-overlay
- Repositorio de GitHub enlazado en la model card: https://github.com/pedrolong1343/dandys-world-forsaken-script-2026
- Repositorio de GitHub enlazado en la model card: https://github.com/ren0561/path-of-exile-2-exiled-exchange-overlay
- Paper: no disponible
- Blog o demo: no disponible
