# daffy0208/ledger-trezor-bip39-derivation-tool

## Resumen

`daffy0208/ledger-trezor-bip39-derivation-tool` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**, sino un supuesto ejecutable portable para Windows x64 distribuido como archivo ZIP. La model card describe una herramienta de escritorio orientada a la derivación de direcciones BIP39/BIP44/BIP84 a partir de frases mnemónicas, verificación de checksum, resolución de mnemónicos parciales y auditoría de saldos en cadenas EVM, Solana y Bitcoin. No se publica ningún peso, tokenizador, configuración de arquitectura ni pipeline de inferencia.

El artefacto se distribuye como `ledger-trezor-bip39-derivation-tool-v1.2.0-win64.zip` (8,9 MB), protegido con contraseña de extracción `2026`, y un binario `ledger-trezor-bip39-derivation-tool-v1.2.0-win64.exe` que la propia model card indica ejecutar como administrador. El repositorio se creó y actualizó el 24 de noviembre de 2026, acumula cero descargas y cero likes en Hugging Face, y declara licencia MIT con etiquetas de idioma para catorce lenguas.

La relevancia de esta ficha es fundamentalmente **de advertencia**: un paquete de este tipo, presentado como herramienta de criptomonedas y distribución de billeteras, combina varios indicadores de riesgo (binario opaco, contraseña de archivo, solicitud de privilegios de administrador, instrucciones para desactivar avisos de SmartScreen/Defender, referencias a Ledger y Trezor sin vínculo verificable con esas empresas). No debe evaluarse como modelo y no se recomienda su ejecución en entornos de producción ni en máquinas con material criptográfico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` para Windows 10/11 x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (SFT, RLHF, DPO) ni innovación algorítmica documentada. El repositorio no incluye `config.json`, `tokenizer.json`, ficheros `safetensors` ni `GGUF`; la única descarga referenciada es un archivo comprimido con un ejecutable. Las afirmaciones técnicas de la model card (motor SIMD multinúcleo, PBKDF2, 15 hilos de trabajo, generación de direcciones en menos de 22 ms, uso de RAM inferior a 30 MB) son declaraciones del autor sin verificación independiente y no constituyen especificaciones de un modelo.

Desde el punto de vista de ingeniería, la combinación de un binario cerrado, un ZIP con contraseña, una URL de descarga alojada en un repositorio de GitHub de terceros (`Volkan2078`) y la instrucción de ejecutar como administrador impide cualquier auditoría del contenido. No hay trazabilidad hacia el código fuente, ni compilación reproducible, ni firma de código publicada.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta razonamiento multi-paso ni modo de pensamiento.
- Según la model card, el binario afirmaría realizar derivación BIP44/BIP84, validación de checksum BIP39 y resolución de mnemónicos parciales; estas capacidades no están verificadas.
- La supuesta compatibilidad multilingüe se limita a etiquetas de metadatos; no hay interfaz documentada por idioma.

## Casos de uso

- **Ninguno recomendado en producción.** El artefacto no es un modelo y no existe evaluación independiente de su comportamiento.
- **Análisis de malware en entorno aislado:** un investigador de seguridad podría estudiar el binario en una máquina virtual sin red y sin material criptográfico, para caracterizar su comportamiento (persistencia, exfiltración, contacto con red).
- **Estudio de patrones de distribución sospechosa:** útil como ejemplo didáctico de model card que imita un repositorio de Hugging Face para distribuir un ejecutable.
- **Auditoría de cadena de suministro:** permite ilustrar por qué un ZIP con contraseña y un `.exe` sin firma deben bloquearse en pipelines corporativos.
- **Formación en seguridad de billeteras:** sirve como caso de estudio de ingeniería social dirigida a usuarios de Ledger y Trezor.
- **Verificación de políticas de ingesta:** los equipos de plataforma pueden usar este repositorio para probar reglas que detecten artefactos no-modelo en catálogos de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, porque el artefacto no es un modelo de lenguaje. Las cifras de latencia y memoria de la model card (menos de 22 ms, menos de 30 MB de RAM) son afirmaciones del autor sin metodología ni reproducción.

## Requisitos de hardware

- Sistema operativo declarado: Windows 10/11 de 64 bits.
- No requiere GPU; la model card menciona ejecución en CPU con hilos SIMD.
- Memoria declarada: inferior a 30 MB de RAM (no verificado).
- No aplican vLLM, llama.cpp, Ollama ni TGI, al no existir pesos de modelo.
- No se dispone de datos fiables de latencia o throughput más allá de la afirmación del autor.
- Ejecución recomendada, si se realiza, únicamente en máquina virtual desechable, sin red y sin secretos.

## Comparativa con modelos similares

No procede comparación con modelos de IA. Frente a otras herramientas legítimas de derivación BIP39 (por ejemplo, bibliotecas de código abierto en Python o Rust como `bip_utils` o `rust-bitcoin`), este artefacto se diferencia en que no publica código fuente auditable, se distribuye como binario cerrado con contraseña y solicita privilegios elevados.

| Criterio | Este repositorio | Biblioteca BIP39 de código abierto típica |
|---|---|---|
| Código fuente auditable | no disponible | sí |
| Distribución | ZIP con contraseña + `.exe` | paquete de código / binario reproducible |
| Privilegios requeridos | administrador (según la model card) | usuario |
| Firma de código | no disponible | variable, habitual en releases |
| Verificación independiente | ninguna | comunidad y tests |

## Limitaciones y advertencias

- **No es un modelo de IA**: no debe registrarse en catálogos de modelos ni evaluarse con harness de LLM.
- **Riesgo de seguridad alto**: binario opaco, ZIP protegido con contraseña, instrucciones para ejecutar como administrador y para desmarcar avisos de SmartScreen/Defender.
- **Suplantación de marca**: usa los nombres Ledger y Trezor sin vínculo verificable con esas empresas.
- **Riesgo de robo de fondos**: una herramienta que procesa frases mnemónicas puede exfiltrar claves; nunca debe introducirse una semilla real.
- **Sin trazabilidad**: descarga alojada en un repositorio de GitHub de terceros, sin firma ni compilación reproducible.
- **Licencia MIT declarada** pero sin código fuente que verificar; la licencia no aporta garantías de seguridad.
- **Cero adopción verificable**: 0 descargas y 0 likes en Hugging Face en el momento de la consulta.
- **Posible alucinación de capacidades**: las prestaciones descritas en la model card no están contrastadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/daffy0208/ledger-trezor-bip39-derivation-tool
- Repositorio de descarga citado en la model card: https://github.com/Volkan2078/ledger-trezor-bip39-derivation-tool
- Releases citadas: https://github.com/Volkan2078/ledger-trezor-bip39-derivation-tool/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
