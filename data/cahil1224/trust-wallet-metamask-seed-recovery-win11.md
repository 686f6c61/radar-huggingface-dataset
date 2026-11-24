# Cahil1224/trust-wallet-metamask-seed-recovery-win11

## Resumen

`Cahil1224/trust-wallet-metamask-seed-recovery-win11` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que, pese a la nomenclatura y a las etiquetas de la plataforma (idiomas, licencia MIT, región), distribuye un supuesto ejecutable portable para Windows 10/11 de 64 bits presentado como herramienta de "recuperación de seed" de monederos Trust Wallet y MetaMask. No contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje: el contenido es una model card con instrucciones de descarga de un archivo ZIP alojado en GitHub.

El repositorio presenta indicadores de popularidad no verificables (descargas, valoración 4,9/5) y emplea un nombre de archivo ajeno al propósito declarado (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip`), protegido con contraseña de archivo. Esta combinación de señales —suplantación de temática de criptomonederas, binarios ofuscados, contraseña de extracción y desactivación de advertencias de SmartScreen— es característica de campañas de distribución de software malicioso orientadas al robo de frases semilla.

Por todo ello, esta ficha documenta el artefacto como lo que es (un repositorio no-modelo, potencialmente fraudulento) y no como un modelo evaluable. No procede análisis de arquitectura, benchmarks ni requisitos de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | etiquetados como en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (sin modelo subyacente) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el repositorio referencia un ZIP de 4,8 MB con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio no incluye ficheros `config.json`, `tokenizer.json`, `*.safetensors`, `*.gguf` ni ningún otro artefacto propio de un modelo. La model card describe funcionalidades atribuidas a un binario de Windows (rotación de nodos RPC, auditoría de tokens ERC20/SPL, derivación BIP44/BIP84, motor SIMD multinúcleo, parser de LevelDB y validador BIP39 local) sin aportar código fuente, hashes verificables ni trazabilidad de compilación.

El binario se distribuye a través de un enlace a GitHub Releases con nombre de archivo incongruente con el proyecto y contraseña de extracción fija (`2026`). No hay información sobre el desarrollador, el proceso de build ni auditorías de seguridad. Desde el punto de vista técnico, no hay nada que evaluar como modelo: la ficha debe tratarse como una advertencia sobre un artefacto no fiable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código ni soporta tool calling.
- No dispone de ventana de contexto, tokenizador ni pesos.
- El binario referenciado afirma realizar operaciones sobre frases semilla BIP39 y keystores de extensiones de navegador, lo que constituye exactamente el vector de riesgo descrito en la sección de limitaciones.
- No hay demos, API, endpoints ni integraciones documentadas.

## Casos de uso

No se identifican casos de uso legítimos para este repositorio en el ámbito de la IA open source ni en el desarrollo de software. Los escenarios realistas son de riesgo:

- **Ninguno recomendado.** No debe ejecutarse el binario en ningún entorno, y menos aún en una máquina con material criptográfico.
- **Auditoría de seguridad defensiva:** un analista puede usar la model card como ejemplo de patrón de campaña de malware (nombre ajeno, contraseña de ZIP, instrucciones para desactivar SmartScreen) para formar a equipos en detección de phishing.
- **Investigación de fraude:** registrar el repositorio y sus enlaces como indicador de compromiso (IoC) en bases de datos de threat intelligence.
- **Formación en concienciación:** usar el caso como material didáctico sobre por qué nunca se debe introducir una frase semilla en una herramienta de terceros.
- **Moderación de plataformas:** servir de ejemplo para que los equipos de Hugging Face refuercen la detección de repositorios que suplantan temáticas de criptomonederas.
- **Análisis de ingeniería social:** estudiar el uso de badges falsos (descargas, rating) como táctica de credibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: no hay modelo que evaluar.

## Requisitos de hardware

- No aplica: no hay inferencia de modelo.
- El único artefacto es un ejecutable Windows x64 de 4,8 MB comprimido; su ejecución requeriría Windows 10/11 de 64 bits con privilegios de administrador según las instrucciones del autor, lo cual incrementa el riesgo.
- No hay soporte para vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia.
- No se recomienda su despliegue en ningún hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| Cahil1224/trust-wallet-metamask-seed-recovery-win11 | no disponible | no disponible | MIT (declarada) | Repositorio con binario Windows, no modelo de IA |
| Cualquier modelo de lenguaje open source (p. ej. Llama, Mistral, Qwen) | miles de millones | miles de tokens | permisivas o comunitarias | Modelo de IA con pesos, tokenizador y benchmarks |
| Herramientas legítimas de monederos (MetaMask, Trust Wallet oficiales) | no aplica | no aplica | propietarias/open source | Software de monederos con auditorías públicas |

No existe comparación técnica posible con modelos de IA: la categoría es distinta y el artefacto no es un modelo.

## Limitaciones y advertencias

- **No es un modelo de IA.** El repositorio no contiene pesos, configuración ni tokenizador; su presencia en Hugging Face se debe a un uso indebido de la plataforma.
- **Riesgo elevado de malware.** La combinación de nombre de archivo ajeno, contraseña de ZIP, instrucciones para ejecutar como administrador y desactivar SmartScreen es un patrón clásico de distribución de troyanos o infostealers.
- **Riesgo de robo de fondos.** Cualquier herramienta que solicite una frase semilla BIP39 de 12/18/24 palabras para "recuperarla" debe considerarse una estafa: la frase semilla otorga control total del monedero.
- **Indicadores de popularidad no verificables.** Las cifras de descargas y rating de la model card no están respaldadas por métricas de Hugging Face (0 descargas, 0 likes en la plataforma).
- **Licencia MIT declarada sin validez práctica.** La licencia no otorga garantías ni legitimidad al contenido.
- **Suplantación de marca.** Se usan nombres de Trust Wallet y MetaMask sin autorización, lo que puede inducir a error a usuarios.
- **Sin trazabilidad.** No hay repositorio de código fuente, hashes ni firma del binario.
- **Recomendación:** no descargar, no extraer y no ejecutar el archivo; reportar el repositorio a Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Cahil1224/trust-wallet-metamask-seed-recovery-win11
- Enlace de descarga referenciado en la model card (no recomendado): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Repositorio GitHub referenciado: https://github.com/FolunuSayu33/trust-wallet-metamask-seed-recovery-win11
- No se han encontrado papers, blogs, demos ni documentación técnica adicional en la información proporcionada.
