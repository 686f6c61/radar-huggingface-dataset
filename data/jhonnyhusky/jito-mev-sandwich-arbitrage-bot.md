# JhonnyHusky/jito-mev-sandwich-arbitrage-bot

## Resumen

El repositorio `JhonnyHusky/jito-mev-sandwich-arbitrage-bot` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows de 64 bits presentado como un bot de arbitraje y sándwich MEV sobre la red Solana, con integración de bundles de Jito. La model card describe un ejecutable (`rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`, build `v4.8.8`) empaquetado en un ZIP de 4,8 MB protegido con contraseña, junto con una supuesta arquitectura de componentes (filtro de honeypots, enrutado de órdenes por debajo de 40 ms, motor de bundles, gestor de 20 wallets mediante Lookup Tables y take profit multinivel).

No existe información alguna sobre arquitectura de red neuronal, parámetros, tokenizador, corpus de entrenamiento ni formato de pesos. Los tags de Hugging Face (`windows`, `x64`, `portable`, entre otros) y la ausencia de un pipeline definido confirman que el artefacto no es un modelo descargable en el sentido habitual (safetensors, GGUF, etc.), sino un binario de software.

Es relevante advertir que el contenido de la model card presenta múltiples señales de riesgo: enlaces de descarga que apuntan a repositorios de GitHub de terceros no relacionados con el autor declarado, un ejecutable que solicita privilegios de administrador, una contraseña de archivo incrustada en el propio README, insignias de descargas y valoraciones no verificables (636K descargas, 99 % de valoración) y una nomenclatura que mezcla un bot de MEV con un supuesto "cheat mod menu". Todo ello es incompatible con un modelo de IA y encaja con patrones habituales de distribución de software potencialmente malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. La model card enumera componentes funcionales de un supuesto bot de arbitraje: sandbox de paper trading con consistencia declarada del 96,3 %, filtro precompra de honeypots con verificación de autoridades de mint/freeze y bloqueo de LP, enrutado de órdenes por debajo de 40 ms mediante streaming WebSocket y gRPC, motor de bundles de Jito con dimensionado dinámico de propinas, gestor de 20 wallets con Lookup Tables para ejecución multimoneda en el mismo bloque y take profit multinivel con trailing stop. Se mencionan cifras de latencia (menos de 23 ms, menos de 19 ms) y un consumo de RAM inferior a 35 MB, pero no se aporta ninguna metodología, código fuente ni evidencia verificable.

No se documenta ningún proceso de entrenamiento, dataset, número de tokens, RLHF, DPO ni innovación técnica en el ámbito del aprendizaje automático. La única "configuración" publicada es un bloque INI con el nombre del binario, la contraseña del ZIP y el identificador de build.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de soporte de tool calling ni de function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en modelos.
- El multilingüismo declarado en los metadatos (14 idiomas) corresponde a la indexación del repositorio, no a capacidades del artefacto.
- Funcionalidad declarada (no verificada): simulación de estrategias en sandbox, filtrado de tokens fraudulentos, enrutado de transacciones de baja latencia, construcción de bundles MEV, ejecución multimoneda y gestión de take profit.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA, porque no lo es.
- Automatización de arbitraje en Solana: el autor declara ejecución de bundles atómicos mediante Jito; no hay evidencia, código ni auditoría que respalde la afirmación.
- Filtrado de tokens fraudulentos: se anuncia verificación de autoridades de mint/freeze y bloqueo de liquidez; sin código verificable no puede recomendarse su uso en producción.
- Simulación de estrategias (paper trading): teóricamente útil para evaluar estrategias MEV, pero el binario no es auditable y se distribuye con contraseña.
- Ejecución multimoneda con Lookup Tables: funcionalidad declarada sin documentación técnica ni repositorio de código abierto pese a la licencia MIT.
- Evaluación de seguridad: el propio artefacto constituye un caso de estudio de cadena de suministro sospechosa (enlaces a repos de terceros, ejecutable como administrador, contraseña embebida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras son afirmaciones de marketing no verificables (latencia inferior a 23 ms, consistencia del 96,3 %, 636K descargas, 99 % de valoración) que no constituyen mediciones reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits.
- Consumo de RAM declarado: inferior a 35 MB (no verificado).
- Opciones de despliegue: ejecución directa del binario `rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe` como administrador; no hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma verificable.
- Tamaño del paquete: 4,8 MB (ZIP).

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JhonnyHusky/jito-mev-sandwich-arbitrage-bot` | Binario Windows (no modelo IA) | no aplica | no aplica | MIT | ZIP con contraseña vía GitHub de terceros |
| Bots MEV de código abierto (p. ej. frameworks de arbitraje en Solana) | Software | no aplica | no aplica | Variables (MIT, Apache-2.0) | Repositorios públicos auditables |
| Modelos de lenguaje open source de propósito general | LLM | 1B-70B+ | 4K-128K+ | Apache-2.0, MIT, Llama | Pesos en safetensors/GGUF |

No existe comparación posible en términos de parámetros, contexto o rendimiento porque el artefacto no es un modelo. Frente a frameworks de arbitraje abiertos, la diferencia crítica es la ausencia de código fuente auditable y la distribución mediante un ejecutable ofuscado.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad elevado: ejecutable que solicita privilegios de administrador, distribuido en un ZIP con contraseña y con enlaces de descarga alojados en repositorios de GitHub de terceros ajenos al autor declarado.
- Inconsistencia de nomenclatura: el binario se llama `rob-run-cheat-mod-menu-pc`, lo que sugiere reutilización de plantillas de distribución de software no relacionado o fraudulento.
- Métricas no verificables: descargas, valoración y latencias declaradas carecen de respaldo.
- Licencia MIT declarada, pero sin código fuente publicado que pueda ejercerse bajo dicha licencia.
- Riesgo financiero: cualquier bot de MEV que opere con claves privadas o fondos reales sin auditoría independiente puede provocar pérdida total de capital.
- Riesgo legal y de cumplimiento: las estrategias de sándwich MEV son consideradas abusivas en muchas jurisdicciones y pueden contravenir términos de servicio de proveedores de infraestructura.
- Sin sesgos medibles ni riesgo de alucinación en el sentido de un LLM, pero sí riesgo de afirmaciones falsas en la documentación.
- No apto para producción en ningún escenario sin auditoría de seguridad independiente del binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JhonnyHusky/jito-mev-sandwich-arbitrage-bot
- Enlace de descarga citado en la model card (repositorio de terceros, no verificado): https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
- Enlace de releases citado en la model card (repositorio de terceros, no verificado): https://github.com/Yildirim81/jito-mev-sandwich-arbitrage-bot/releases/latest
- Documentación de Jito (referencia externa al proyecto): https://www.jito.wtf/
- No se han encontrado papers, blogs técnicos ni demos asociados en la información disponible.
