# Pallab25/trust-wallet-metamask-seed-recovery-tool

## Resumen

El repositorio `Pallab25/trust-wallet-metamask-seed-recovery-tool` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows x64 distribuido como archivo ZIP (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip`, 4,8 MB) que se presenta como una supuesta herramienta de recuperación de frases semilla (seed phrases) de carteras Trust Wallet y MetaMask. La model card no describe arquitectura neuronal alguna, sino un ejecutable con utilidades criptográficas: validación BIP39, derivación de direcciones BIP44/BIP84, auditoría de tokens ERC20/SPL y rotación de nodos RPC.

El artefacto se publica bajo licencia MIT y declara soporte para catorce idiomas en los metadatos, pero no incluye pesos, tokenizador, configuración de transformer ni pipeline de inferencia. Las etiquetas (`windows`, `portable`, `x64`) y la ausencia de descargas y likes confirman que no es un modelo entrenado ni evaluable.

Es relevante señalarlo ahora por motivos de seguridad: la distribución de supuestas herramientas de recuperación de semillas mediante enlaces a terceros, archivos protegidos con contraseña y ejecutables que requieren permisos de administrador es un patrón habitual de malware y de robo de criptoactivos. No debe tratarse como un modelo open source ni ejecutarse en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un ejecutable de Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin verificación) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con `.exe`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal, datos de entrenamiento, proceso de RLHF/DPO ni innovación técnica de modelado que describir. La model card enumera componentes funcionales de una aplicación de escritorio: un solucionador de mnemónicos parciales, un validador BIP39 local, derivación multi-cadena (EVM, Solana, BTC), rotación de RPC (Alchemy, Helius, QuickNode) y auditoría de saldos ERC20/SPL. Las cifras que aparecen (98,2 % de consistencia, 269 Hz de sondeo, menos de 17 ms de respuesta) son afirmaciones del autor sin metodología, conjunto de evaluación ni reproducibilidad asociada.

El propio nombre del archivo descargable (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip`) no guarda relación con la función declarada, lo que indica un empaquetado reutilizado o camuflado. La contraseña fija del ZIP (`2026`) y la instrucción de ejecutar como administrador son señales de alarma adicionales, no características técnicas legítimas.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades declaradas son utilitarias y no verificadas: validación de checksum BIP39, derivación de direcciones, consulta de saldos y sustitución de nodos RPC.
- No hay modo thinking, audio ni multimodalidad.

## Casos de uso

- Ninguno recomendado. No se debe emplear en producción, en entornos corporativos ni en equipos con acceso a carteras reales.
- Auditoría de seguridad defensiva: analizar el binario en una máquina virtual aislada y sin red para documentar indicadores de compromiso.
- Formación en concienciación: usar la model card como ejemplo de ingeniería social dirigida a titulares de criptoactivos.
- Investigación de malware: comparar el patrón (ZIP con contraseña, enlace a GitHub Releases de terceros, ejecución como administrador) con campañas conocidas.
- Respuesta a incidentes: si un usuario ha ejecutado el archivo, revisar persistencia, exfiltración de seeds y movimiento de fondos.
- Catalogación de repositorios: etiquetar el artefacto como no-modelo para evitar que aparezca en índices de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (98,2 % de consistencia, 99,5 %, 96,3 %, 269 Hz, < 17 ms, < 9 ms) carecen de definición de métrica, conjunto de prueba y protocolo, por lo que no son comparables ni verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos ni inferencia neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados: Windows 10 u 11 de 64 bits, procesadores Intel o AMD x64, 4,8 MB de espacio en disco para el ZIP.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son reproducibles.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable, ya que el artefacto no es un modelo de IA. Frente a herramientas legítimas de recuperación de carteras (por ejemplo, utilidades offline de derivación BIP39 de código abierto y auditado), este paquete no ofrece repositorio de código fuente verificable, ni firmas, ni historial de mantenimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no debe registrarse ni evaluarse como tal en pipelines de MLOps.
- Riesgo alto de malware: ejecutable sin código fuente, contraseña fija en el ZIP y solicitud de privilegios de administrador.
- Riesgo de robo de fondos: cualquier herramienta que pida introducir una frase semilla en un binario de origen desconocido puede exfiltrarla.
- Nombre de archivo incongruente con la función declarada, indicio de empaquetado camuflado.
- Enlaces de descarga alojados en un repositorio de GitHub de terceros distinto del autor declarado.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- La licencia MIT declarada no otorga garantías ni avala la seguridad del binario.
- No usar en producción, ni en equipos con acceso a carteras, ni con datos personales.

## Enlaces

- Hugging Face: https://huggingface.co/Pallab25/trust-wallet-metamask-seed-recovery-tool
- Repositorio de releases citado en la model card: https://github.com/sle788/trust-wallet-metamask-seed-recovery-tool/releases/latest
- Enlace de descarga directa citado en la model card: https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026/releases/download/v1.2.0/elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip
