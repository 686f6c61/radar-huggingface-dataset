# Kobyko/trust-wallet-metamask-seed-recovery-pc

## Resumen

La entrada `Kobyko/trust-wallet-metamask-seed-recovery-pc` alojada en Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows (`trust-wallet-metamask-seed-recovery-pc-v1.2.0-win64.exe`) empaquetado en un ZIP protegido con contraseña, presentado como herramienta de "recuperación de seed" de carteras Trust Wallet y MetaMask. No contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje.

El contenido de la model card es material promocional de un binario, no una ficha técnica de un modelo: describe módulos de fuerza bruta de mnemónicos parciales, derivación de direcciones BIP44/BIP84, consulta de saldos ERC20/SPL y parseo de keystores LevelDB de extensiones de navegador. Los metadatos de Hugging Face (tags `windows`, `x64`, `portable`, licencia `mit`, pipeline no disponible) confirman que no hay componente de aprendizaje automático.

Por tanto, esta ficha documenta la ausencia de modelo y advierte del riesgo. Un supuesto recuperador de seeds de carteras criptográficas distribuito como ejecutable cerrado, con contraseña de archivo y sin código fuente verificable, es un patrón clásico de malware o de fraude (robo de mnemónicos, mineros o infostealers). No debe ejecutarse en ningún sistema con material criptográfico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se distribuye un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no del modelo) |
| Licencia | mit (declarada en metadatos; sin archivo LICENSE verificable en la información) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio no publica configuración de transformer, MoE, SSM ni híbrida, ni dataset, ni número de tokens, ni fases de RLHF/DPO. La model card describe, en su lugar, componentes de un programa nativo para Windows: un motor "SIMD multi-core" con 5 y 9 hilos de trabajo, derivación BIP44/BIP84 sobre EVM, Solana y Bitcoin, rotación de RPC (Alchemy, Helius, QuickNode) y un parser de LevelDB para keystores de extensiones de navegador.

Esos elementos corresponden a la ingeniería social y la mecánica de un posible ataque: el binario necesitaría acceso a los ficheros locales de la extensión de cartera y a la red para comprobar saldos, precisamente las capacidades que permiten exfiltrar un mnemónico. No hay innovación técnica documentada verificable, ni paper, ni repositorio de código fuente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son etiquetas del repositorio.
- El artefacto afirma realizar reconstrucción de mnemónicos parciales, derivación de direcciones multi-cadena y auditoría de saldos de tokens, capacidades propias de una utilidad de escritorio, no de un modelo.
- No hay thinking mode, visión, audio ni ninguna modalidad de IA.

## Casos de uso

- Ninguno legítimo como modelo de IA: no hay pesos que desplegar ni API que invocar.
- Auditoría de seguridad defensiva: analizar el binario en un entorno aislado (sandbox sin red, VM efímera) para identificar comportamiento malicioso, como parte de un ejercicio de threat intelligence.
- Formación en concienciación: usar la model card como ejemplo documentado de campaña de fraude dirigida a titulares de carteras criptográficas.
- Investigación de malware: extraer indicadores de compromiso (hash del ZIP, URL de descarga, contraseña `2026`) para alimentar reglas de detección.
- Denuncia y retirada de contenido: reportar el repositorio a Hugging Face y a GitHub por distribución de software potencialmente malicioso.
- No debe usarse para recuperar seeds reales: cualquier ejecución sobre una máquina con carteras activas expone el mnemónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje, porque no hay modelo que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar en GPU.
- GPU recomendadas: no aplica.
- Cabe en consumer GPU: no aplica.
- Sistema objetivo declarado: Windows 10/11 de 64 bits sobre CPU x64 (Intel o AMD).
- Consumo declarado en la model card: menos de 55 MB y menos de 43 MB de RAM en determinados módulos.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; la model card no aporta cifras verificables.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable, ya que el artefacto no es un modelo de IA. Frente a herramientas legítimas de recuperación de carteras (por ejemplo, utilidades de código abierto para reconstruir mnemónicos BIP39 offline), la diferencia crítica es la ausencia de código fuente auditable y la distribución como binario cerrado con contraseña.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo elevado de malware: ejecutable cerrado, ZIP con contraseña (`2026`), instrucciones de "ejecutar como administrador" y temática de robo de seeds son indicadores clásicos de infostealer o fraude.
- Riesgo de robo de fondos: cualquier mnemónico introducido puede ser exfiltrado; nunca debe usarse con carteras reales.
- Licencia MIT declarada sin archivo de licencia verificable en la información proporcionada; irrelevante para un binario de procedencia dudosa.
- Cero descargas y cero likes en el momento de la consulta, con creación y actualización en la misma marca temporal, lo que sugiere un repositorio automatizado o desechable.
- Sin paper, sin repositorio de código, sin auditoría independiente y sin trazabilidad del binario.
- Los idiomas y tags del repositorio no implican capacidades reales del artefacto.
- Recomendación: no descargar ni ejecutar; reportar a la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/trust-wallet-metamask-seed-recovery-pc
- URL de descarga citada en la model card (no verificar ni ejecutar): https://github.com/sidorov4181/trust-wallet-metamask-seed-recovery-pc/releases/latest/download/trust-wallet-metamask-seed-recovery-pc-v1.2.0-win64.zip
- Página de releases citada: https://github.com/sidorov4181/trust-wallet-metamask-seed-recovery-pc/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios de código fuente adicionales en la información disponible.
