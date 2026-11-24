# Snapjam2641/trust-wallet-metamask-seed-recovery-win11

## Resumen

`Snapjam2641/trust-wallet-metamask-seed-recovery-win11` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un supuesto ejecutable portable para Windows 10/11 de 64 bits presentado como herramienta de "recuperación de semillas" de Trust Wallet y MetaMask. El autor, bajo el alias `Snapjam2641`, publica un binario de 4,8 MB empaquetado en un ZIP protegido con contraseña (`2026`) y alojado en un repositorio de GitHub de terceros (`Giovanni9790/monster-hunter-wilds-trainer-mod`), cuyo nombre no guarda relación con la función declarada.

El artefacto no incluye pesos, tokenizador, configuración de arquitectura ni tarjeta de modelo técnica: la model card es en realidad una página de descarga con insignias, instrucciones para desactivar advertencias de Windows Defender/SmartScreen y preguntas frecuentes sobre la contraseña del archivo. No hay parámetros, contexto, licencia de pesos ni pipeline declarado (`pipeline: no disponible`), y el contador de descargas y "likes" de Hugging Face figura a cero.

Por tanto, esta ficha documenta un artefacto que no es un modelo de lenguaje y que presenta múltiples indicadores de riesgo de seguridad (ejecutable no firmado, contraseña en el archivo, suplantación de marcas de monederos de criptomonedas y redirección a un repositorio ajeno). No debe evaluarse como modelo de IA ni ejecutarse en entornos de producción o personales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas de la model card) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe módulos funcionales genéricos (rotación de RPC, auditoría de tokens ERC20/SPL, derivación BIP44/BIP84, motor SIMD multinúcleo, parser de LevelDB y validador BIP39) con métricas inventadas o no verificables (`99,7 %` de consistencia, `210 Hz` de sondeo, `< 48 MB` de RAM), pero no aporta ninguna especificación técnica reproducible: ni número de tokens de entrenamiento, ni composición del dataset, ni técnicas de alineación (RLHF/DPO), ni innovaciones de inferencia.

El binario se distribuye como `monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip` (4,8 MB) con contraseña `2026`, y se ejecuta como administrador. El nombre del archivo remite a un supuesto *trainer* del videojuego *Monster Hunter Wilds*, lo que contradice la función declarada de recuperación de semillas y sugiere reempaquetado de contenido ajeno.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas ni visión: el artefacto no es un modelo de lenguaje.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: solo aparecen etiquetas de idioma en los metadatos, sin evidencia de funcionalidad multilingüe real.
- La model card atribuye al binario funciones de validación BIP39 offline, derivación de direcciones y auditoría de saldos; estas afirmaciones no están verificadas ni son auditables a partir de la información disponible.

## Casos de uso

No se identifican casos de uso legítimos y verificables para este artefacto como modelo de IA. Los escenarios que la model card sugiere (recuperación de semillas, auditoría de monederos) son precisamente los que un atacante podría usar para exfiltrar frases semilla, por lo que no deben contemplarse como aplicaciones válidas:

- Recuperación de semillas: no verificable y de altísimo riesgo; introducir una frase semilla en un binario no firmado equivale a entregar el control de los fondos.
- Auditoría de saldos multi-cadena: no hay evidencia de implementación ni de que las consultas RPC se realicen sin exfiltración.
- Validación BIP39 offline: funcionalidad trivialmente reproducible con bibliotecas auditadas (`bip39`, `ethers.js`) sin ejecutar binarios opacos.
- Derivación BIP44/BIP84: cubierta por bibliotecas estándar y auditadas; no requiere este artefacto.
- Integración en pipelines: descartado, al no existir API, pesos ni documentación técnica.
- Despliegue en servidores: descartado; el artefacto es un ejecutable de escritorio para Windows x64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`99,7 %`, `97,2 %`, `210 Hz`, `< 48 MB`) no son benchmarks de modelos ni van acompañadas de metodología reproducible.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay modelo neuronal que cargar).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo objetivo: Windows 10/11 de 64 bits, según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable, ya que este repositorio no contiene un modelo de IA. Frente a herramientas legítimas de gestión de monederos (MetaMask, Trust Wallet oficial, bibliotecas como `ethers.js` o `bitcoinjs-lib`), la diferencia relevante es que estas últimas son de código abierto auditable y se distribuyen por canales oficiales firmados, mientras que este artefacto se sirve desde un repositorio de GitHub de terceros con nombre no relacionado y contraseña incrustada.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni arquitectura; cualquier evaluación como modelo de lenguaje carece de sentido.
- Riesgo de seguridad crítico: se trata de un ejecutable no firmado, distribuido en un ZIP con contraseña y alojado en un repositorio de GitHub ajeno (`Giovanni9790/monster-hunter-wilds-trainer-mod`), con nombre que suplanta un *trainer* de videojuego.
- Suplantación de marcas: el título invoca Trust Wallet y MetaMask sin relación con sus desarrolladores; la página incluye instrucciones para sortear Windows Defender y SmartScreen, patrón habitual en campañas de *malware*.
- Riesgo de robo de fondos: cualquier herramienta que solicite una frase semilla de 12/18/24 palabras debe considerarse potencialmente maliciosa; las frases semilla nunca deben introducirse en software de terceros.
- Datos no verificables: las métricas de la model card (`99,7 %`, `97,2 %`, `210 Hz`) no van acompañadas de metodología ni código fuente.
- Licencia: se declara MIT en los metadatos, pero al no haber código fuente publicado no puede ejercerse ningún derecho de auditoría o modificación.
- Cero tracción: 0 descargas y 0 *likes* en Hugging Face en la fecha de creación (2026-11-24), lo que no aporta ninguna señal de confianza.
- Recomendación: no descargar ni ejecutar; para gestión de monederos, usar exclusivamente clientes oficiales y bibliotecas auditadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Snapjam2641/trust-wallet-metamask-seed-recovery-win11
- Repositorio de GitHub referenciado en la model card (no oficial, no verificado): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod
- Repositorio de GitHub alternativo citado en la model card (no oficial, no verificado): https://github.com/FolunuSayu33/trust-wallet-metamask-seed-recovery-win11
- Documentación oficial de MetaMask (referencia legítima): https://docs.metamask.io
- Documentación oficial de Trust Wallet (referencia legítima): https://developer.trustwallet.com
- Especificación BIP39 (referencia técnica): https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
