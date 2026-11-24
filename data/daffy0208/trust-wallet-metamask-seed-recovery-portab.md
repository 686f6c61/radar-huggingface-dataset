# daffy0208/trust-wallet-metamask-seed-recovery-portab

## Resumen

No se trata de un modelo de inteligencia artificial. El repositorio `daffy0208/trust-wallet-metamask-seed-recovery-portab` alojado en Hugging Face no contiene pesos, arquitectura ni artefactos de aprendizaje automatico: es un paquete ejecutable para Windows (x64) distribuido como archivo ZIP, etiquetado como "portable" y publicado bajo licencia MIT. La model card lo presenta como una herramienta de "recuperacion de seed" de carteras Trust Wallet y MetaMask, con funciones declaradas de validacion BIP39, parseo de keystores LevelDB y auditoria de saldos ERC20/SPL.

El artefacto se distribuye fuera de Hugging Face: la model card enlaza a un repositorio de GitHub (`berkm24/trust-wallet-metamask-seed-recovery-portab`) desde el que se descarga un ZIP de 8,9 MB protegido con contrasena ("2026") que contiene un binario `.exe`. Esta combinacion —binario opaco, contrasena en el propio texto, instrucciones de ejecutar como administrador y tematica de frases semilla de criptomonedas— es un patron clasico de ingenieria social y malware, no un modelo desplegable.

Desde la perspectiva de evaluacion de modelos, la ficha no puede completarse con specs tecnicas reales porque no existen. Se documenta el artefacto, se advierte explicitamente sobre su naturaleza y se detallan los riesgos. Cualquier uso del binario debe considerarse peligroso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64 empaquetado en ZIP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repo; no aplica a un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario Windows (`trust-wallet-metamask-seed-recovery-portab-v1.2.0-win64.exe`, version declarada v2.3.3, build 473914) comprimido en un ZIP de 8,9 MB. La model card describe funcionalidades teoricas —motor "SIMD multi-core", rotacion de RPC, validador BIP39 offline, parser LevelDB— pero no aporta codigo fuente, hashes de verificacion, firmas ni trazabilidad de build. No se ha publicado informacion sobre datos de entrenamiento, RLHF, DPO ni ninguna innovacion tecnica verificable.

La unica "innovacion" observable es la del empaquetado: contrasena embebida en la propia descripcion, instrucciones de ejecucion como administrador y enlaces de descarga a un repositorio de GitHub de terceros. Nada de ello es verificable ni auditable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los codigos de idioma son metadatos del repositorio.
- Declara (sin verificar) funciones de validacion de frases BIP39 de 12/18/24 palabras, parseo de keystores LevelDB de extensiones de navegador y consulta de saldos de tokens.
- No hay demos, API, endpoint ni inferencia posible.

## Casos de uso

No se identifican casos de uso legitimos para un modelo de IA, porque no lo es. Los escenarios que la model card sugiere son de alto riesgo y no deben ejecutarse:

- "Recuperacion de seed": introducir una frase semilla en un binario opaco de origen no verificado equivale a entregar el control total de la cartera a un tercero desconocido.
- "Validacion BIP39 offline": cualquier validacion legitima puede hacerse con librerias auditadas y de codigo abierto (por ejemplo, `bip39` en JavaScript o `python-mnemonic`), sin binarios cerrados.
- "Parseo de keystores LevelDB": existen herramientas de codigo abierto y auditables para inspeccionar almacenes locales de extensiones; usar un `.exe` sin fuente es innecesario.
- "Auditoria de saldos ERC20/SPL": se realiza con cualquier SDK oficial (ethers.js, web3.py, @solana/web3.js) y RPC publicos o de proveedor.
- "Portabilidad en Windows": el supuesto beneficio "portable" no compensa la ausencia de firma, hash y codigo fuente.
- "Uso como utilidad de escritorio": no recomendado bajo ninguna circunstancia; el patron de distribucion coincide con el de infostealers dirigidos a carteras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: no existe modelo que evaluar.

## Requisitos de hardware

- VRAM: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto declarados: Windows 10/11 de 64 bits, menos de 45 MB de RAM y alrededor de 9 MB de disco segun la model card. No verificable de forma independiente.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable: el artefacto no es un modelo de IA. Frente a utilidades legitimas de gestion de carteras (MetaMask oficial, Trust Wallet oficial, librerias BIP39 de codigo abierto), la diferencia clave es que este paquete carece de codigo fuente publico, firma digital, hashes y proceso de build reproducible.

## Limitaciones y advertencias

- **Riesgo de seguridad critico**: el patron (ZIP con contrasena publicada, `.exe` opaco, instruccion de "ejecutar como administrador", tematica de frases semilla) es consistente con malware dirigido a robar criptomonedas. No ejecutar.
- **Suplantacion de marca**: el nombre referencia Trust Wallet y MetaMask, que no han publicado ni respaldado este artefacto. Es probable una infraccion de marca y una suplantacion.
- **Cero trazabilidad**: no hay repositorio de codigo fuente verificable, ni hashes SHA256 publicados, ni firma de codigo, ni builds reproducibles.
- **Contrasena en claro**: la contrasena "2026" esta en el propio texto; no aporta seguridad y sirve para evadir analisis automatizados.
- **Alertas de SmartScreen/Defender**: la propia model card anticipa avisos de seguridad y ofrece instrucciones para sortearlos, lo que agrava la sospecha.
- **Cero adopcion**: 0 descargas y 0 likes en Hugging Face en el momento de la consulta, pese a que la model card muestra un badge de "186K+ descargas" no verificable.
- **Licencia MIT irrelevante**: la licencia declarada no otorga ninguna garantia sobre el binario ni sobre su comportamiento real.
- **Recomendacion**: eliminar el archivo si se ha descargado, no extraerlo ni ejecutarlo, y escanear el sistema. Para cualquier operacion con carteras, usar exclusivamente software oficial y verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/daffy0208/trust-wallet-metamask-seed-recovery-portab
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/berkm24/trust-wallet-metamask-seed-recovery-portab
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/berkm24/trust-wallet-metamask-seed-recovery-portab/releases/latest/download/trust-wallet-metamask-seed-recovery-portab-v1.2.0-win64.zip
- Trust Wallet oficial: https://trustwallet.com
- MetaMask oficial: https://metamask.io
- Estandar BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
