# saber135/bip39-mnemonic-seed-balance-scanner-win11

## Resumen

El repositorio `saber135/bip39-mnemonic-seed-balance-scanner-win11` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows 10/11 de 64 bits distribuido como archivo ZIP (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip`, 4,8 MB) con un ejecutable que el autor presenta como una herramienta de escaneo de balances a partir de frases mnemónicas BIP39. La model card describe funciones de derivación multicadena (BIP44/BIP84 sobre EVM, Solana y BTC), parseo de keystores LevelDB, resolución parcial de mnemónicos y auditoría de tokens ERC20/SPL.

No existe información sobre arquitectura de red neuronal, parámetros, contexto ni entrenamiento, porque no es un modelo entrenado: es un binario precompilado. La ficha se redacta, por tanto, como evaluación técnica del artefacto publicado en Hugging Face, no como ficha de modelo lingüístico.

El interés para desarrolladores e investigadores es fundamentalmente de seguridad: la combinación de una herramienta que procesa material criptográfico sensible (frases semilla, keystores de extensiones de navegador) con un binario cerrado, descargado desde un repositorio de GitHub de terceros, protegido con contraseña de archivo y con nombres de fichero incoherentes respecto al título, constituye un patrón de riesgo elevado que conviene documentar con precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario x64 para Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con ejecutable `.exe`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica: el artefacto no es una red neuronal ni un modelo estadístico entrenado. La model card describe módulos funcionales de una aplicación de escritorio: derivación de direcciones BIP44/BIP84, parseo de ficheros LevelDB (`.ldb`) asociados a keystores de extensiones de navegador, motor SIMD multihilo con hashing PBKDF2, resolución de mnemónicos parciales y exportación de informes de balance. El autor cita cifras como 13 y 14 hilos de trabajo, sondeo a 300 Hz y porcentajes de consistencia del 96,9 % y 97,9 %, sin especificar metodología de medición ni publicar código fuente.

No se documenta ningún proceso de entrenamiento, dataset, RLHF, DPO ni innovación en arquitectura de modelos. La única información técnica verificable en el repositorio es la metadata de Hugging Face: licencia MIT, catorce etiquetas de idioma y una lista de tags que mezclan terminología de modelos (`license:mit`, `region:us`) con terminología de aplicación de escritorio (`windows-11`, `x64`, `portable`).

## Capacidades

- Procesamiento de frases mnemónicas BIP39, según la descripción del autor.
- Derivación de direcciones multicadena (EVM, Solana, Bitcoin) mediante rutas BIP44/BIP84.
- Parseo de keystores LevelDB locales, según la model card.
- Resolución de mnemónicos parciales o con palabras faltantes.
- Comprobación de balances de moneda nativa, stablecoins y staking DeFi, así como de tokens ERC20 y SPL.
- Exportación de informes locales de resultados con balance distinto de cero.
- Interfaz en catorce idiomas declarados.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, por no tratarse de un modelo generativo.

## Casos de uso

- Auditoría defensiva de carteras propias: un usuario podría, en teoría, verificar la derivación de direcciones de una semilla de su propiedad y comprobar balances asociados. No obstante, para esta tarea existen herramientas de código abierto auditables (por ejemplo, derivadores BIP39 en Python o Rust) que no requieren ejecutar binarios opacos.
- Investigación de malware: el artefacto es un caso de estudio útil para analistas de seguridad que documenten técnicas de ingeniería social en repositorios de Hugging Face, incluyendo el uso de nombres de fichero ajenos al tema (`inzoi-cheat-trainer-mod-menu`) y contraseñas de archivo para evadir análisis automatizados.
- Formación en seguridad de criptomonedas: sirve como ejemplo didáctico de por qué no debe introducirse una frase semilla en software de procedencia no verificada, y de cómo se estructura una supuesta herramienta de «scanner de balances».
- Confección de reglas de detección: los indicadores del paquete (ZIP de 4,8 MB, contraseña fija `2026`, ejecutable que requiere privilegios de administrador, enlaces a un repositorio de GitHub no relacionado con el título) pueden incorporarse a listas de IoC y a filtros de descarga corporativos.
- Evaluación de políticas de ingestión de artefactos: equipos de plataforma pueden usar este repositorio para justificar controles de aprobación sobre binarios publicados en hubs de modelos.
- No se recomienda ningún caso de uso operativo con material criptográfico real: la ausencia de código fuente, de firma reproducible y de trazabilidad del binario impide verificar que el programa no exfiltre las semillas introducidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (96,9 % y 97,9 % de «consistencia», 300 Hz de sondeo, 13 y 14 hilos) carecen de definición metodológica, de conjunto de prueba y de código reproducible, por lo que no constituyen resultados verificables.

## Requisitos de hardware

- Plataforma: Windows 10/11 de 64 bits, según la model card.
- Ejecución como administrador, según las instrucciones del autor.
- VRAM: no aplica; no se declara uso de GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible (no se declara aceleración gráfica).
- Almacenamiento: 4,8 MB para el archivo ZIP; el espacio descomprimido no se especifica.
- Opciones de despliegue: ejecución directa del `.exe` en Windows; no se contemplan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

| Herramienta | Tipo | Código fuente | Licencia | Verificabilidad | Distribución |
|---|---|---|---|---|---|
| Este artefacto (`saber135/...`) | Binario Windows cerrado | No publicado | MIT (declarada) | Baja: ZIP con contraseña, enlaces a repositorio de terceros | Hugging Face + GitHub externo |
| Ian Coleman BIP39 | Herramienta web/offline | Sí, público | MIT | Alta: auditable, uso offline | Web y repositorio propio |
| Derivadores BIP39 en Python/Rust (por ejemplo, `bip_utils`, `rust-bitcoin`) | Bibliotecas | Sí, público | MIT/Apache-2.0 | Alta: auditables, testeables | PyPI, crates.io |
| Carteras hardware (Ledger, Trezor) | Firmware y dispositivo | Parcial (firmware abierto en distinto grado) | Varía | Alta: elemento seguro, revisiones | Fabricante |

La comparación relevante no es de rendimiento lingüístico, sino de auditabilidad y modelo de amenaza: frente a bibliotecas abiertas y carteras hardware, este artefacto no permite verificar qué hace con las semillas que procesa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no debe evaluarse con métricas de modelos lingüísticos.
- Riesgo de seguridad crítico: la herramienta está diseñada, según su propia descripción, para procesar frases semilla BIP39 y keystores. Introducir material criptográfico real en un binario cerrado de origen no verificado puede provocar la pérdida total de fondos.
- Incoherencia de nombres: el título del repositorio alude a un escáner de semillas, mientras que el ZIP y el ejecutable se denominan `inzoi-cheat-trainer-mod-menu`, un nombre ajeno al propósito declarado. Este patrón es habitual en campañas de malware.
- Distribución con contraseña de archivo fija (`2026`) y enlaces a un repositorio de GitHub distinto del indicado en la metadata: dificulta el análisis automático y la trazabilidad de la cadena de suministro.
- Solicitud de ejecución como administrador sin justificación técnica documentada.
- Ausencia de código fuente, de compilación reproducible, de firma digital y de historial de versiones verificable.
- Cifras de rendimiento no reproducibles y sin metodología.
- Licencia MIT declarada, pero sin fichero de licencia ni aviso de copyright verificables en la información disponible; en cualquier caso, la licencia no mitiga el riesgo de seguridad.
- Sin datos de sesgo, alucinación o limitaciones idiomáticas aplicables, al no ser un modelo generativo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que impide cualquier validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/saber135/bip39-mnemonic-seed-balance-scanner-win11
- Repositorio de GitHub citado en la model card: https://github.com/claudiomorgan/bip39-mnemonic-seed-balance-scanner-win11
- Repositorio de GitHub del binario enlazado: https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu
- Descarga del paquete citada por el autor: https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Especificación BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Especificación BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- Herramienta de referencia auditable (Ian Coleman BIP39): https://github.com/iancoleman/bip39
