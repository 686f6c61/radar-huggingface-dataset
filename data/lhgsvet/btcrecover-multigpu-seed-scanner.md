# LHGSVet/btcrecover-multigpu-seed-scanner

## Resumen

`LHGSVet/btcrecover-multigpu-seed-scanner` no es un modelo de lenguaje ni un modelo de IA en el sentido habitual del término. Se trata de un repositorio de Hugging Face cuyo contenido es una supuesta utilidad portable para Windows x64 orientada a la recuperación de frases semilla BIP39 y al escaneo de balances en múltiples cadenas. El autor declara licencia MIT y etiquetas de idioma para catorce lenguas, pero no publica pesos, arquitectura, tokenizador ni pipeline de inferencia.

El repositorio presenta cero descargas y cero likes en el momento de la consulta, y su model card no describe ningún modelo entrenado: describe un ejecutable empaquetado en un ZIP de 4,8 MB con contraseña, un binario `.exe` que requiere ejecución como administrador y una serie de módulos presuntamente relacionados con derivación de direcciones BIP44/BIP84, validación de entropía BIP39 y parseo de keystores LevelDB. No hay información sobre parámetros, contexto, cuantización ni datos de entrenamiento.

Desde la perspectiva de evaluación técnica, este repositorio no debe tratarse como un modelo open source. La model card incluye indicios claros de distribución de software potencialmente malicioso: archivo comprimido con contraseña, binario ejecutable de nombre ajeno al proyecto (`blox-fruits-script-keyless-...`), instrucción de ejecución como administrador y afirmaciones de rendimiento no verificables. La ficha que sigue documenta lo declarado, marcando como no disponible todo aquello que no existe o no es verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; se describe como utilidad portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP de 4,8 MB con un `.exe` para Windows 10/11 x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El repositorio no contiene pesos en safetensors, GGUF ni ningún otro formato de modelo, y no hay tokenizador, configuración de transformer, MoE, SSM ni esquema híbrido. La model card describe módulos funcionales de una aplicación de escritorio: rotación de RPC con conmutación entre proveedores (Alchemy, Helius, QuickNode), derivación multi-cadena BIP44/BIP84 para EVM, Solana y BTC, validación local de entropía y checksum BIP39 para 12/18/24 palabras, reconstrucción de mnemónicos parciales y parseo de keystores LevelDB.

No se documenta ningún proceso de entrenamiento, dataset, número de tokens, RLHF, DPO ni innovación técnica de modelado. Las cifras de rendimiento que aparecen en la model card (consistencia del 97,5 % en validación BIP39, 98,8 % en resolución de mnemónicos parciales, consumo inferior a 53 MB, 31 MB y 20 MB de RAM según módulo) son afirmaciones del autor sin metodología, sin conjunto de evaluación y sin trazabilidad reproducible.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se declara soporte de tool calling ni function calling en el sentido de modelos de lenguaje.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Las capacidades declaradas son de naturaleza utilitaria: derivación de direcciones criptográficas, validación de frases semilla y exportación de balances.
- El repositorio etiqueta catorce idiomas, pero no se especifica si la interfaz del ejecutable los soporta realmente ni en qué grado.
- No se declara modo thinking, visión, audio ni ninguna capacidad multimodal.

## Casos de uso

No es posible recomendar casos de uso legítimos para este repositorio en el contexto de evaluación de modelos de IA. Las aplicaciones que su model card sugiere se sitúan en el terreno de la recuperación de carteras criptográficas, y su empaquetado (ZIP con contraseña, ejecutable como administrador, nombre de archivo ajeno al proyecto) no permite verificar su integridad. A título documental, lo declarado apuntaría a:

- Recuperación de frases semilla BIP39 propias con palabras dañadas o ausentes, según el módulo de resolución parcial declarado.
- Verificación offline de checksum y entropía de mnemónicos de 12, 18 y 24 palabras.
- Derivación de direcciones BIP44/BIP84 en EVM, Solana y BTC a partir de una semilla.
- Consulta de balances mediante rotación de proveedores RPC.
- Parseo de keystores LevelDB de extensiones de navegador.
- Exportación de informes locales de direcciones con balance distinto de cero.

Ninguno de estos casos puede validarse con la información disponible, y varios de ellos corresponden a funciones sensibles desde el punto de vista de seguridad. No se recomienda su despliegue en entornos de producción ni su ejecución en máquinas con material criptográfico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas cifras presentes son afirmaciones del autor en la model card (97,5 % y 98,8 % de consistencia, consumos de RAM inferiores a 53 MB, 31 MB y 20 MB), sin conjunto de evaluación, sin metodología y sin posibilidad de reproducción. No se incluyen resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estándar, lo cual es coherente con el hecho de que el repositorio no contiene un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no disponible; el autor no documenta requisitos de GPU pese a la etiqueta "multigpu" del nombre.
- Compatibilidad con GPU de consumo: no disponible.
- Plataforma declarada: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Opciones de despliegue: no disponible; no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; las cifras de consumo de RAM (< 53 MB, < 31 MB, < 20 MB) son declaraciones sin verificación.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a ninguna categoría de modelo de lenguaje, visión o multimodal con la que pueda compararse en parámetros, contexto o rendimiento. Las alternativas reales en el ámbito de recuperación de semillas BIP39 (por ejemplo, herramientas de código abierto auditables) no comparten naturaleza con este artefacto y no se dispone de datos para establecer una comparación técnica rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, arquitectura, tokenizador ni pipeline. Cualquier expectativa de inferencia es infundada.
- El artefacto distribuido es un ZIP de 4,8 MB protegido con contraseña que contiene un `.exe` para Windows. El nombre del archivo (`blox-fruits-script-keyless-2026-v1.2.2-win64.zip`) no guarda relación con el nombre del proyecto, lo que constituye una señal de alarma.
- La instrucción de ejecutar el binario como administrador incrementa el riesgo de compromiso del sistema.
- Las afirmaciones de rendimiento (97,5 %, 98,8 %) y de consumo de memoria carecen de metodología y no son verificables.
- No hay historial de descargas ni de likes, ni trazabilidad del autor más allá del identificador `LHGSVet`.
- La licencia MIT declarada no garantiza la ausencia de código malicioso ni la legitimidad del binario; la licencia cubre derechos de uso, no la seguridad del software.
- El contenido de la model card incluye enlaces a repositorios de GitHub de terceros y a un binario alojado en un release, lo que dificulta la verificación de integridad.
- No debe ejecutarse en máquinas con carteras criptográficas, claves o material sensible, ni en entornos corporativos sin sandboxing y análisis previo.
- No se han identificado sesgos de modelo porque no hay modelo; el riesgo relevante es de seguridad del software distribuido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LHGSVet/btcrecover-multigpu-seed-scanner
- Repositorio GitHub referenciado en la model card: https://github.com/yvest62304/btcrecover-multigpu-seed-scanner
- Release del binario referenciado: https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026/releases/download/v1.2.0/blox-fruits-script-keyless-2026-v1.2.2-win64.zip
- Paper, blog, demo o documentación técnica: no disponible
