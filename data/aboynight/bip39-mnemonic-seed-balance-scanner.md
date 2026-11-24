# AboyNight/bip39-mnemonic-seed-balance-scanner

## Resumen

`AboyNight/bip39-mnemonic-seed-balance-scanner` no es un modelo de IA. Es un repositorio alojado en Hugging Face cuyo contenido es un ejecutable para Windows de 64 bits presentado como escáner de balances de frases mnemónicas BIP39. El autor declarado es AboyNight, la licencia indicada es MIT y el repositorio no registra descargas ni interacciones en el momento de la consulta. No hay pipeline asociado, ni pesos, ni ficheros de modelo, ni arquitectura de red neuronal.

El artefacto se distribuye como un ZIP de 4,8 MB protegido con contraseña, alojado en un repositorio de GitHub de terceros, y el binario interno lleva un nombre (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.exe`) que no guarda relación con la función que anuncia la model card. La documentación describe módulos de derivación multi-cadena, rotación de RPC, resolución de mnemónicos parciales y exportación de balances, es decir, funcionalidad típica de herramientas de barrido de carteras de criptomonedas.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para dejar constancia de que el repositorio no contiene un modelo de IA evaluable y de que presenta múltiples señales de riesgo de seguridad. No debe tratarse como una dependencia técnica ni ejecutarse en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (según metadatos; el binario distribuido no incluye trazabilidad verificable) |
| Formato de pesos | no disponible (se distribuye un ZIP con un ejecutable `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio no contiene pesos, checkpoints, tokenizadores ni configuración de modelo. La model card describe componentes de software (parser de LevelDB, rotación de RPC, motor SIMD multi-hilo, derivación BIP44/BIP84) que corresponden a una aplicación de escritorio, no a un modelo generativo.

La única información técnica concreta que aporta la documentación es la mención de PBKDF2 para el hashing de semillas y de generación de direcciones en EVM, Solana y Bitcoin. No se documenta el lenguaje de implementación, las dependencias, la cadena de compilación ni la procedencia del binario. El nombre del ejecutable y del ZIP remiten a un repositorio de GitHub ajeno al autor declarado, lo que impide verificar la integridad del artefacto.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- El multilingüismo declarado en los metadatos se refiere, como mucho, a la interfaz de la aplicación, no a capacidades lingüísticas de un modelo.
- La documentación anuncia funciones de derivación de direcciones BIP39/BIP44/BIP84, consulta de balances mediante RPC y exportación de resultados a informes locales.

## Casos de uso

- Auditoría de seguridad de artefactos: analizar el binario en una máquina aislada y sin conexión para determinar su comportamiento real antes de cualquier otra consideración.
- Documentación de riesgos en catálogos internos: registrar el repositorio como no apto para uso corporativo y marcarlo para bloqueo en pasarelas de descarga.
- Formación en concienciación: usar la model card como ejemplo de ingeniería social (contraseña en el propio README, urgencia, insignias de descargas infladas) en sesiones de seguridad para desarrolladores.
- Investigación de malware: extraer indicadores de compromiso (URLs, nombres de fichero, hashes) para reglas de detección en EDR y proxies.
- Verificación de políticas de licencia: comprobar que la licencia MIT declarada en los metadatos no cubre el binario de terceros y que, por tanto, no se puede reutilizar ni redistribuir con garantías.
- Análisis de procedencia en Hugging Face: revisar cómo un repositorio sin pipeline ni pesos puede aparecer etiquetado junto a modelos reales y proponer filtros de curación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones, y las cifras que aparecen en la model card (99,7 % de consistencia, 165 Hz y 298 Hz de sondeo, 13 hilos, menos de 29 MB de RAM) son afirmaciones del autor sin metodología ni evidencia reproducible.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits, según la documentación.
- VRAM: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplicable.
- Ejecución en GPU de consumo: no aplicable.
- Memoria RAM declarada por el autor: menos de 29 MB durante la operación de derivación multi-cadena (dato no verificado).
- Opciones de despliegue: no existen opciones tipo vLLM, llama.cpp, Ollama o TGI, porque no hay pesos de modelo.
- Latencia y throughput: no disponibles; las cifras en hercios de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Frente a un LLM pequeño típico (por ejemplo, un modelo de 1 a 3 mil millones de parámetros con licencia permisiva), las diferencias son categóricas: aquí no hay parámetros, ni contexto, ni pesos, ni evaluación de rendimiento lingüístico.

| Criterio | Este repositorio | LLM pequeño permisivo (referencia genérica) |
|---|---|---|
| Naturaleza | Binario Windows x64 | Modelo de lenguaje |
| Pesos publicados | No | Sí (safetensors/GGUF) |
| Contexto | No aplica | Miles de tokens |
| Evaluación reproducible | No | Benchmarks públicos |
| Riesgo de seguridad | Alto (ejecutable sin trazabilidad) | Bajo (inferencia sobre pesos) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en comparativas de modelos ni en pipelines de inferencia.
- El binario se distribuye comprimido con contraseña (`2026`) y alojado en un repositorio de GitHub de un tercero, lo que rompe la cadena de custodia y dificulta el escaneo automático.
- El nombre del ejecutable remite a un supuesto entrenador de un videojuego, incoherente con la función anunciada: indicio claro de camuflaje.
- La model card pide ejecutar como administrador y ofrece instrucciones para sortear avisos de Windows Defender y SmartScreen, práctica habitual en la distribución de software malicioso.
- La funcionalidad declarada (derivación de semillas y consulta de balances de carteras) implica manejo de material criptográfico sensible; ejecutarla supone exponer claves a código no auditado.
- Las insignias de descargas (721 K+) y valoración (5,0/5) del README no están respaldadas por las métricas reales del repositorio, que registra cero descargas y cero likes.
- La licencia MIT declarada no aporta garantías sobre el binario ni sobre su procedencia; no hay firma de código ni hashes publicados.
- Riesgo de alucinación: no aplica a un LLM, pero la documentación contiene afirmaciones técnicas no verificables que funcionan como señuelo.
- Recomendación: no descargar ni ejecutar el artefacto; si se analiza, hacerlo en una máquina virtual sin red y sin carteras reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AboyNight/bip39-mnemonic-seed-balance-scanner
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/guillaume67095/bip39-mnemonic-seed-balance-scanner
- Paper: no disponible
- Blog o demo: no disponible
