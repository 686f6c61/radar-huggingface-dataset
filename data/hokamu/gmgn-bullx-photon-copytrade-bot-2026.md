# hokamu/gmgn-bullx-photon-copytrade-bot-2026

## Resumen

`hokamu/gmgn-bullx-photon-copytrade-bot-2026` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es una model card que distribuye un supuesto ejecutable para Windows x64 (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip`, 4,8 MB) presentado como bot de copytrading para criptomonedas. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

La model card se limita a describir módulos funcionales del ejecutable (take profit escalonado, sandbox de paper trading, bóveda local de claves AES-256, copia de wallets "smart money", filtro de honeypots, motor de bundles Jito/MEV) e instrucciones de instalación que incluyen ejecutar un `.exe` como administrador y extraer un ZIP protegido con contraseña. No hay información sobre parámetros, contexto, datos de entrenamiento ni evaluación de capacidades.

Desde el punto de vista de evaluación técnica, este repositorio carece de los elementos mínimos para ser tratado como modelo. Además, el patrón de distribución (binario opaco, contraseña en el archivo, ejecución con privilegios elevados, enlaces de descarga que apuntan a un repositorio de GitHub de terceros distinto del declarado) coincide con esquemas habituales de distribución de software potencialmente malicioso. Esta ficha documenta esa ausencia de datos de forma explícita en lugar de inventar especificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el repositorio distribuye un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos de la model card, no como capacidades del modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No disponible. El repositorio no describe arquitectura de red neuronal, composición del dataset, número de tokens de entrenamiento ni proceso de alineación (RLHF, DPO u otros). La model card únicamente enumera componentes de una aplicación de escritorio: take profit multi-nivel, sandbox de paper trading, bóveda de claves AES-256 local, copia de wallets, filtro pre-compra de honeypots y motor de bundles Jito/MEV, con cifras de rendimiento declaradas (respuesta en menos de 21 ms, 354 Hz de sondeo, 121 Hz de sondeo, 6 hilos de trabajo, menos de 26 MB de RAM) que no son verificables ni corresponden a métricas de inferencia de un modelo.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No se documenta razonamiento multi-paso ni comportamiento de agente basado en un LLM.
- El soporte multilingüe se limita a una lista de códigos de idioma en los metadatos, sin evidencia de capacidades lingüísticas asociadas.
- Las funcionalidades descritas pertenecen a un binario de escritorio (trading automatizado), no a un modelo.

## Casos de uso

- No procede. Al no existir un modelo de IA en el repositorio, no hay escenarios de inferencia, generación o despliegue de modelo que evaluar.
- Evaluación de procedencia de artefactos: el repositorio puede usarse como caso de estudio de patrones de distribución sospechosos (binario sin código fuente, contraseña embebida en la documentación, enlaces de descarga alojados en un repositorio de GitHub distinto del declarado, instrucciones de ejecución como administrador).
- Auditoría de seguridad de repositorios en Hugging Face: sirve para ilustrar la necesidad de filtros que detecten repositorios etiquetados como modelos pero que distribuyen ejecutables.
- Formación en higiene de cadena de suministro de software: ejemplo de por qué no deben ejecutarse binarios opacos obtenidos de repositorios de modelos.
- Monitorización de ecosistema: útil para equipos que rastrean la aparición de contenido ajeno a modelos en plataformas de ML.
- No se identifican casos de uso legítimos de inferencia, entrenamiento o integración en pipelines de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay modelo que cargar en memoria de GPU).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Requisitos del artefacto distribuido: Windows 10 u 11 de 64 bits, según la model card; ejecución como administrador; 4,8 MB de archivo ZIP; contraseña de extracción `2026`.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| hokamu/gmgn-bullx-photon-copytrade-bot-2026 | no disponible | no disponible | MIT | Hugging Face (0 descargas, 0 likes) | No es un modelo de IA; distribuye un ejecutable |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se identifican alternativas equivalentes porque el repositorio no pertenece a ninguna categoria de modelo |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuración ni código de inferencia.
- La distribución se realiza mediante un ZIP protegido con contraseña que contiene un `.exe` que la documentación indica ejecutar como administrador; este patrón impide la inspección previa del binario y eleva el riesgo de ejecución de código no verificado.
- Los enlaces de descarga de la model card apuntan a un repositorio de GitHub (`carlos7088/pump-fun-jito-bundler-sniper-bot-2026`) distinto del repositorio declarado en los metadatos (`dianenelson33/gmgn-bullx-photon-copytrade-bot-2026`), lo que rompe la trazabilidad de la cadena de suministro.
- Las cifras de rendimiento declaradas (menos de 21 ms, 354 Hz, 121 Hz, 6 hilos, menos de 26 MB de RAM) no son verificables y no van acompañadas de metodología.
- Los badges de descargas (902K+) y de versión no son comprobables desde los metadatos del repositorio, que registra 0 descargas y 0 likes.
- La licencia MIT declarada se refiere al contenido del repositorio; no se especifican términos para el binario distribuido ni responsabilidades sobre su uso.
- Riesgo de alucinación, sesgos y limitaciones de contexto o idioma: no evaluables al no existir un modelo.
- Advertencia de seguridad: no se recomienda descargar ni ejecutar el artefacto distribuido sin análisis en un entorno aislado y sin verificación de firma y procedencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hokamu/gmgn-bullx-photon-copytrade-bot-2026
- Repositorio de GitHub referenciado en la model card: https://github.com/dianenelson33/gmgn-bullx-photon-copytrade-bot-2026
- Repositorio de GitHub alternativo usado para la descarga: https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026
- Resultado de búsqueda web sin relación con el repositorio (foro de Wise Cleaner): https://forum.wisecleaner.com/index.php?/topic/19305-wise-data-recovery-free-registration-code/
