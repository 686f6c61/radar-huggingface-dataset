# DragonBRX/seed-phrase-balance-checker-multichain

## Resumen

`DragonBRX/seed-phrase-balance-checker-multichain` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una página de distribución de un supuesto ejecutable para Windows de 64 bits, empaquetado en un archivo ZIP de 8,9 MB y protegido con contraseña. El repositorio no contiene pesos, tokenizador, configuración de modelo ni tarjeta de modelo en el sentido habitual: la model card es en realidad una landing page de descarga con insignias, instrucciones de instalación y preguntas frecuentes.

El software que promociona se presenta como una herramienta de "verificación de balances de frases semilla" multicadena, con módulos que mencionan validación BIP39, hashing PBKDF2, rotación de nodos RPC, parseo de almacenes LevelDB de extensiones de navegador y auditoría de tokens ERC20/SPL. La combinación de estas funciones (extracción de frases semilla y consulta de saldos de carteras ajenas) es característica de las herramientas de drenaje de carteras, y el patrón de distribución (ZIP con contraseña, ejecutable "como administrador", enlaces a un repositorio de GitHub de terceros) es habitual en campañas de malware.

Desde la perspectiva de evaluación de modelos, este repositorio no es utilizable: no hay artefactos de inferencia, no hay pipeline declarado y las etiquetas de idioma (14 idiomas) corresponden a la interfaz del ejecutable, no a capacidades lingüísticas de un modelo. Se documenta aquí únicamente para dejar constancia de su naturaleza y de los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (idiomas de la interfaz del ejecutable) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un .exe, no pesos) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de alineación (RLHF/DPO) ni innovación técnica de modelado que documentar. El repositorio contiene metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`) y una model card que describe módulos de un programa de escritorio: validador BIP39 local, motor SIMD multihilo con PBKDF2, rotación de RPC entre proveedores (Alchemy, Helius, QuickNode), parser de LevelDB para almacenes de extensiones de navegador y exportación de informes de balance.

Las cifras que aparecen en la model card (polling a 455 Hz y 178 Hz, consistencia del 97,8 %, 7 hilos de trabajo, consumo de RAM inferior a 49 MB y 25 MB) son afirmaciones del autor sin verificación independiente y no constituyen resultados de evaluación reproducibles.

## Capacidades

- No es un modelo generativo: no produce texto, código, razonamiento ni matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de modelado; los 14 idiomas listados corresponden a la localización de la interfaz del ejecutable.
- Funciones declaradas por el autor para el ejecutable: validación de checksum BIP39 para frases de 12, 18 y 24 palabras, derivación de claves con PBKDF2, consulta de saldos en múltiples cadenas, auditoría de tokens ERC20/SPL y exportación de informes locales.
- Advertencia: las funciones declaradas de extracción y comprobación de frases semilla ajenas son incompatibles con un uso legítimo y encajan en el patrón de las herramientas de robo de credenciales.

## Casos de uso

No se identifican casos de uso legítimos para este repositorio como modelo de IA. Los escenarios que la model card sugiere son los siguientes, y se describen únicamente con fines de análisis de riesgo:

- Verificación de balances de carteras propias: el autor plantea comprobar saldos multicadena a partir de una frase semilla; para este fin existen carteras oficiales y exploradores de bloques que no requieren ejecutar binarios de terceros.
- Auditoría de tokens ERC20/SPL: podría realizarse con APIs públicas de indexación (Etherscan, Helius) sin necesidad de este ejecutable.
- Validación de checksums BIP39: cubierta por librerías auditadas y de código abierto (por ejemplo, `bip39` en JavaScript o `python-mnemonic`).
- Rotación de nodos RPC: funcionalidad estándar de cualquier SDK de cadena, implementable sin binarios opacos.
- Generación de informes locales: reproducible con scripts propios sobre las APIs anteriores.
- Escenario de riesgo: el patrón de distribución (ZIP con contraseña, ejecución como administrador, enlace a un repositorio de GitHub ajeno al autor declarado) es consistente con la entrega de malware; el caso de uso realista es el análisis forense en un entorno aislado, nunca la ejecución en un equipo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las métricas de la model card (455 Hz, 178 Hz, 97,8 % de consistencia, 7 hilos, menos de 49 MB y 25 MB de RAM) son afirmaciones del autor sin metodología ni verificación, y no son comparables con benchmarks de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que inferir).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del ejecutable: Windows de 64 bits (Windows 11 mencionado en los tags), arquitectura x64, ejecución como administrador, 7-Zip o WinRAR para extraer el archivo protegido con contraseña.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de polling de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el artefacto no es un modelo. Como referencia de contraste:

| Criterio | Este repositorio | Modelo de lenguaje típico (referencia) |
|---|---|---|
| Artefacto distribuido | ZIP con .exe para Windows | Pesos en safetensors/GGUF |
| Pesos publicados | No | Sí |
| Pipeline de Hugging Face | No declarado | `text-generation` u otro |
| Evaluación reproducible | No | Benchmarks publicados |
| Función | Utilidad de escritorio no verificada | Inferencia de lenguaje |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad alto: la combinación de extracción de frases semilla, parseo de almacenes LevelDB de extensiones de navegador y distribución mediante ZIP con contraseña es característica de malware de drenaje de carteras.
- El enlace de descarga apunta a un repositorio de GitHub (`ddang048/...`) distinto del identificador del autor en Hugging Face (`DragonBRX`), lo que dificulta la trazabilidad del binario.
- La instrucción de ejecutar como administrador amplía el impacto potencial de cualquier código malicioso.
- Cero descargas y cero "likes" en el momento de la consulta, pese a que la model card muestra insignias con "465K+ descargas" y una valoración de 4,8/5: las cifras de la tarjeta no se corresponden con las métricas reales del repositorio.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el binario distribuido ni sobre su procedencia.
- No debe ejecutarse en equipos personales ni corporativos; si se analiza, hacerlo en una máquina virtual sin red y sin carteras asociadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DragonBRX/seed-phrase-balance-checker-multichain
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/ddang048/seed-phrase-balance-checker-multichain
- Paper, blog o demo: no disponibles.
