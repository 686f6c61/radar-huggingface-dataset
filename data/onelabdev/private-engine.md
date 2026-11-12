# onelabdev/private-engine

## Resumen

`onelabdev/private-engine` es un repositorio de Hugging Face que, pese a su nombre, no contiene un modelo de lenguaje sino los runtimes cifrados del proyecto `ezbrowser`. Según la model card, cada archivo `.enc` es un archivo comprimido envuelto en una capa de cifrado que solo puede abrir el paquete Python `ezcontrol`, distribuido de forma privada. El repositorio es público únicamente como almacenamiento cómodo para archivos grandes, no porque su contenido esté pensado para abrirse manualmente.

El repositorio se organiza en tres carpetas, una por generación de Chromium (`ez_153`, `ez_154` y `ez_155`), cada una con su propio archivo `version`, `manifest.json` y paquetes. Las generaciones no interactúan entre sí: cada una se compara solo contra su propio archivo `version`. El cliente `ezcontrol` descarga el runtime necesario en `~/.ezbrowser` en el primer uso y lo vuelve a descargar cuando la versión publicada deja de coincidir con la copia local.

Por tanto, no hay arquitectura de red neuronal, parámetros, contexto ni datos de entrenamiento que evaluar. El tamaño del repositorio (1,4 GB) corresponde a los paquetes cifrados de los runtimes de navegador, no a pesos de un modelo. Cualquier evaluación como modelo de IA resulta inaplicable con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; son runtimes de navegador cifrados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (según metadatos de Hugging Face y model card) |
| Formato de pesos | archivos `.enc` cifrados, con `version` y `manifest.json` por generación |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un transformer, MoE, SSM ni ningún otro tipo de red neuronal, y no se documenta ningún proceso de entrenamiento, dataset, tokenizador o ajuste por RLHF/DPO. Lo que contiene son paquetes de runtime de Chromium cifrados, organizados por generación (`ez_153`, `ez_154`, `ez_155`), con un mecanismo de versionado que obliga a instalar siempre la release más reciente dentro de cada generación.

El único componente técnico descrito es el esquema de distribución: el paquete `ezcontrol` (versión 0.5.15 o posterior) descarga el runtime correspondiente a `~/.ezbrowser`, compara el archivo `version` remoto con la copia local y refresca cuando difieren. La selección se hace por generación mediante `EzControl.launch(version=...)`, y se rechazan las cadenas a nivel de parche (por ejemplo, `"154.2.0"`) y cualquier versión inferior a 153.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta razonamiento multi-paso ni modo de pensamiento.
- No tiene capacidades multilingües que evaluar.
- Su función real es servir como almacén de runtimes de navegador cifrados para el proyecto `ezbrowser`.
- El consumo se realiza exclusivamente a través del paquete privado `ezcontrol`, que gestiona descarga, verificación de versión e instalación por generación.

## Casos de uso

- Distribución de runtimes de Chromium para `ezbrowser`: el repositorio actúa como origen de los paquetes que `ezcontrol` descarga en el primer lanzamiento, lo que permite separar los binarios grandes del código del cliente.
- Actualización automática de runtimes: el archivo `version` de cada carpeta permite que `ezcontrol` detecte cuándo la copia local está desactualizada y vuelva a descargar el paquete correspondiente.
- Selección de generación de navegador por lanzamiento: un pipeline puede arrancar `ez_155` por defecto y forzar `ez_153` o `ez_154` con `EzControl.launch(version=...)` cuando necesite una generación concreta.
- Mantenimiento multi-generación en una misma máquina: `python -m ezcontrol.runtime --all-generations` actualiza todas las generaciones presentes en disco, útil en flotas con requisitos heterogéneos.
- Inventario y diagnóstico: `python -m ezcontrol.runtime --list` muestra las generaciones instaladas y lo que publica cada carpeta, lo que facilita la auditoría del estado de los runtimes.
- Control de versiones estricto en entornos gestionados: el rechazo explícito de cadenas a nivel de parche y de versiones anteriores a 153 evita fijar releases corregidas y mantener defectos ya resueltos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Cabe en GPU de consumo: no aplica.
- Almacenamiento: el repositorio ocupa 1,4 GB; `ezcontrol` mantiene copias de los runtimes en `~/.ezbrowser`, por lo que el espacio en disco debe contemplar una o varias generaciones instaladas.
- Opciones de despliegue: exclusivamente mediante el paquete privado `ezcontrol` (0.5.15 o posterior). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de lenguaje, sino paquetes de runtime de navegador cifrados. La comparación con LLM de tamaño, contexto o licencia similar no tendría sentido técnico.

## Limitaciones y advertencias

- Los archivos `.enc` no son utilizables por sí solos: descargarlos manualmente produce bytes que no se pueden ejecutar.
- El único lector de los paquetes es `ezcontrol`, distribuido de forma privada; sin acceso a ese paquete el repositorio no tiene utilidad práctica.
- La licencia es `other`, sin texto de licencia publicado en la información disponible, lo que impide determinar condiciones de uso comercial o redistribución.
- El campo `viewer: false` en la model card desactiva el visor de Hugging Face.
- No se puede fijar una release a nivel de parche ni usar generaciones anteriores a 153; el sistema rechaza esas peticiones por diseño.
- No hay información sobre idiomas, sesgos, alucinación ni rendimiento porque no es un modelo de IA generativa.
- El nombre del repositorio (`private-engine`) no se corresponde con su contenido real, lo que puede inducir a error en búsquedas de modelos.
- No se documentan mecanismos de verificación de integridad más allá de la comparación del archivo `version`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onelabdev/private-engine
- Paquete `ezcontrol`: no disponible (distribución privada según la model card)
- Documentación del proyecto `ezbrowser`: no disponible
- Paper, blog o demo: no disponible
