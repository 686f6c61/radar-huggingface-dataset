# maezz/raydium-meteora-grpc-sniper-bot-2026

## Resumen

`maezz/raydium-meteora-grpc-sniper-bot-2026` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows x64 distribuido a través de la plataforma, etiquetado por su autor como un "sniper bot" para los protocolos DeFi Raydium y Meteora sobre la blockchain de Solana. El artefacto real es un archivo ZIP de 4,8 MB (`dandys-world-forsaken-script-2026-v1.2.2-win64.zip`) que, al extraerse con la contraseña indicada en la model card, produce un binario `.exe`.

El contenido de la model card describe módulos de firma local AES-256, motor de bundles Jito/MEV, agrupación de 20 wallets mediante Lookup Tables, copia de operaciones de "smart money", filtro de honeypots y take-profit multinivel. Ninguno de estos elementos es verificable a partir de la información disponible, y el repositorio no incluye pesos, arquitectura de red neuronal, tokenizador ni pipeline de inferencia. No hay parámetros, contexto ni cuantizaciones porque no existe un modelo subyacente.

La relevancia de esta ficha es, por tanto, **advertir de que el artefacto no es un modelo de IA** y de que su descarga y ejecución con privilegios de administrador presenta riesgos de seguridad significativos. La model card mezcla nombres de archivo de terceros no relacionados (`dandys-world-forsaken-script-2026`) y enlaces a repositorios de GitHub ajenos al autor declarado, un patrón habitual en campañas de distribución de software no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto distribuido como ZIP con `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card describe un conjunto de módulos funcionales de un supuesto bot de trading: almacén de claves AES-256 local, motor de bundles Jito/MEV con tip dinámico, bundler de 20 wallets con Lookup Tables, copia de operaciones de ballenas, filtro pre-compra de honeypots (verificación de mint/freeze authority y bloqueo de LP) y take-profit multinivel con trailing stop. Los únicos datos numéricos que aparecen son frecuencias de sondeo (273 Hz, 435 Hz) y porcentajes de "consistencia" (98,3 %, 98,4 %, 99,1 %) sin metodología que los respalde.

El paquete se presenta como "portable" y "sin dependencias externas", con inicialización mediante ejecución como administrador. No se documenta lenguaje de implementación, dependencias, cadena de compilación ni repositorio de código fuente auditable. La model card incluye además referencias a un ZIP con nombre distinto al del repositorio y a enlaces de descarga alojados en cuentas de GitHub de terceros, lo que impide verificar la procedencia del binario.

## Capacidades

- No se trata de un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en modelos.
- Las capacidades que declara la model card son funcionalidades de un bot de trading (firma local de transacciones, envío de bundles, copia de wallets, filtros anti-honeypot, take-profit), no verificadas de forma independiente.
- No hay capacidades multimodales (visión, audio) ni modo "thinking".
- El multilingüismo declarado corresponde únicamente a etiquetas de metadatos del repositorio, no a un tokenizador o modelo entrenado en esos idiomas.

## Casos de uso

- **Auditoría de seguridad de artefactos en Hugging Face:** este repositorio sirve como caso de estudio de contenido que no es un modelo y que se distribuye como ejecutable con contraseña; útil para equipos que revisan la cadena de suministro de artefactos descargados desde hubs.
- **Formación en detección de software no verificado:** el patrón (ZIP con contraseña, ejecución como administrador, enlaces a repositorios de terceros, badges con cifras de descargas no auditables) es representativo de campañas de distribución de binarios opacos y puede emplearse en sesiones de concienciación.
- **Investigación de trading en Solana (solo con código fuente propio):** si un equipo necesita operar con Raydium o Meteora, el enfoque correcto es implementar su propio cliente gRPC y su propia lógica de firma con librerías auditadas, no ejecutar binarios de procedencia desconocida.
- **Verificación de metadatos en pipelines de catalogación:** permite probar herramientas que clasifican repositorios de Hugging Face y descartan automáticamente aquellos sin `pipeline_tag`, sin pesos y con etiquetas de sistema operativo.
- **Análisis de model cards engañosas:** la discrepancia entre el nombre del repositorio, el nombre del ZIP enlazado y las cuentas de GitHub referenciadas es un ejemplo útil para entrenar clasificadores de contenido sospechoso.
- **No recomendado para producción:** no existe ningún escenario en el que ejecutar este binario como administrador en un equipo de desarrollo o servidor sea una práctica aceptable sin análisis previo en un entorno aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (273 Hz, 435 Hz, 98,3 %, 98,4 %, 99,1 %, 348K+ descargas, 4,9/5 de valoración) son afirmaciones del autor sin metodología, conjunto de datos ni reproducibilidad, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- No aplica VRAM ni GPU: no hay modelo que inferir.
- Requisito declarado: Windows x64 (Windows 11 incluido), ejecución como administrador.
- Tamaño del paquete: 4,8 MB (ZIP); binario `.exe` tras extracción con contraseña `2026`.
- No hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no existe un modelo.
- Latencia y throughput: no disponibles; las frecuencias de sondeo declaradas no son medibles de forma independiente.
- Recomendación: cualquier análisis debe realizarse en una máquina virtual desechable sin acceso a claves, wallets ni red de producción.

## Comparativa con modelos similares

| Aspecto | Este repositorio | Modelo de IA típico en HF | Bot de trading con fuente auditable |
|---|---|---|---|
| Tipo de artefacto | ZIP con `.exe` para Windows | Pesos safetensors/GGUF | Código fuente en repositorio público |
| Parámetros | no disponible | Millones a cientos de miles de millones | no aplica |
| Contexto | no disponible | 4K–1M tokens | no aplica |
| Licencia | MIT (declarada) | MIT, Apache-2.0, otras | Variable |
| Verificabilidad | Nula (binario opaco, contraseña) | Alta (pesos y config pública) | Alta (código auditable) |
| Riesgo de seguridad | Alto (ejecución como admin) | Bajo-medio | Bajo si se audita |

No se identifican modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA.

## Limitaciones y advertencias

- **No es un modelo de IA:** el repositorio no contiene pesos, arquitectura, tokenizador ni pipeline; cualquier expectativa de inferencia es infundada.
- **Riesgo de seguridad elevado:** se solicita ejecutar un `.exe` como administrador tras extraerlo con contraseña, lo que impide el escaneo previo por antivirus y dificulta la inspección del contenido.
- **Procedencia no verificable:** la model card enlaza a cuentas de GitHub (`pedrolong1343`, `bettysuzuki`) distintas del autor declarado (`maezz`) y a un ZIP con nombre no relacionado (`dandys-world-forsaken-script-2026`).
- **Posible malware o fraude:** el patrón (contraseña en archivo, ejecución con privilegios, cifras de descargas infladas, badges decorativos) coincide con tácticas habituales de distribución de software malicioso o de estafa financiera.
- **Riesgo financiero:** un bot de trading que firma transacciones con claves AES-256 locales y opera con 20 wallets puede vaciar fondos si el binario está manipulado; no hay auditoría publicada.
- **Licencia MIT declarada:** aunque permisiva, no otorga ninguna garantía sobre el binario ni sobre su comportamiento en ejecución.
- **Sin soporte ni mantenimiento:** cero descargas y cero likes en el momento de la consulta; sin issues, sin releases verificables en el propio repositorio.
- **Advertencia para producción:** no desplegar en entornos con acceso a wallets, claves API o red corporativa. Si se analiza, hacerlo en VM aislada y sin conexión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maezz/raydium-meteora-grpc-sniper-bot-2026
- ZIP enlazado en la model card (tercero, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Releases de la cuenta de terceros referenciada: https://github.com/bettysuzuki/raydium-meteora-grpc-sniper-bot-2026/releases/latest
- Documentación oficial de Raydium: https://docs.raydium.io
- Documentación oficial de Meteora: https://docs.meteora.ag
- Documentación de Jito (bundles y MEV): https://docs.jito.wtf
