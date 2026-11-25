# henly988/profanity2-evm-solana-vanity-gen

## Resumen

`henly988/profanity2-evm-solana-vanity-gen` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete distribuible para Windows x64 (un ejecutable y su archivo ZIP asociado) presentado bajo el nombre de "Profanity2 Evm Solana Vanity Gen", una supuesta herramienta de generación de direcciones vanidosas ("vanity addresses") para las redes EVM y Solana. El autor declarado es `henly988` y el repositorio tiene cero descargas y cero "likes" en el momento de redactar esta ficha.

El contenido de la model card no describe ninguna arquitectura neuronal, ningún conjunto de datos de entrenamiento ni ningún proceso de ajuste (RLHF, DPO, SFT). En su lugar, enumera funcionalidades propias de una herramienta de trading de criptomonedas: una "bóveda de claves AES-256 local", un "motor de bundles Jito y MEV", "copytrade de smart-money", un "sandbox de paper-trading" y un "bundler LUT de 20 carteras". Estas afirmaciones no guardan relación con el nombre del paquete (generador de direcciones vanidosas) ni con las capacidades de un modelo de lenguaje.

Desde el punto de vista de la evaluación técnica, este repositorio debe clasificarse como **no conforme** con la categoría de modelo open source. La distribución mediante un ZIP protegido con contraseña alojado en un repositorio de GitHub de terceros (`Alice34742/...`), la petición de ejecución "como administrador" y la ausencia total de código fuente auditable son patrones habituales en campañas de malware. No se dispone de información sobre arquitectura, parámetros, contexto ni licencia de software más allá de la etiqueta MIT declarada en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (distribución como `.exe` y `.zip` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que describir. El artefacto es un binario `profanity2-evm-solana-vanity-gen-v1.2.0-win64.exe` (build declarado `v4.6.9`, identificador `1452052F1D`) empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. La model card no aporta información sobre tokens de entrenamiento, composición del dataset, técnicas de alineación ni innovaciones de inferencia (decodificación especulativa, atención lineal, etc.).

Las "características" listadas en la model card (bóveda de claves, motor MEV, copytrade, sandbox de paper-trading) describen comportamiento de una aplicación de escritorio, no de un modelo. No se proporciona documentación técnica verificable, ni repositorio de código fuente, ni artefactos de build reproducibles.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos (14 idiomas) no están respaldadas por ningún componente de procesamiento de lenguaje natural identificable.
- Las funcionalidades descritas (generación de direcciones vanidosas, bundles MEV, copytrade) son afirmaciones del autor sin verificación independiente.

## Casos de uso

- **No recomendado para ningún caso de uso en producción.** No se identifican escenarios legítimos y verificables para este artefacto en el contexto de evaluación de modelos de IA.
- **Auditoría de seguridad:** un equipo de seguridad podría analizar el binario en un entorno aislado para determinar su comportamiento real, dado el patrón de distribución sospechoso (ZIP con contraseña, ejecución como administrador, repositorio de terceros).
- **Formación en detección de malware:** el repositorio puede emplearse como ejemplo didáctico de técnicas de ingeniería social en plataformas de modelos (badges falsos de descargas y valoraciones, nombres que imitan herramientas legítimas).
- **Investigación de ecosistema:** útil para estudiar cómo se abusa de Hugging Face para distribuir software no relacionado con IA.
- **Verificación de políticas:** sirve como caso de prueba para los mecanismos de moderación y reporte de la plataforma.
- **Análisis de cadena de suministro:** permite ejemplificar los riesgos de ejecutar binarios de origen no verificado en estaciones de trabajo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable mediante MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- Plataforma objetivo declarada: Windows 10/11 de 64 bits (x64).
- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Consumo de RAM declarado por el autor: menos de 21 MB y menos de 46 MB en dos de sus módulos (cifras no verificables).
- Latencia y throughput: el autor menciona frecuencias de sondeo de 385 Hz y 438 Hz y tiempos de respuesta inferiores a 36 ms, sin metodología de medición pública.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Como referencia de herramientas legítimas de generación de direcciones vanidosas en el ecosistema blockchain podrían citarse utilidades de código abierto auditables, pero no se dispone de datos verificados en la información proporcionada para establecer una comparación rigurosa.

## Limitaciones y advertencias

- **Riesgo de seguridad elevado:** distribución mediante ZIP con contraseña, ejecución solicitada como administrador y alojamiento en un repositorio de GitHub de terceros distinto del autor declarado. Este patrón es consistente con la distribución de software malicioso.
- **Ausencia de código fuente:** no hay repositorio auditable ni artefactos de build reproducibles; la licencia MIT declarada no es verificable en la práctica.
- **Inconsistencia semántica:** el nombre del paquete sugiere un generador de direcciones vanidosas, mientras que la model card describe una herramienta de trading con MEV y copytrade.
- **Metadatos engañosos:** badges de "547K+ descargas" y "4,9/5" que no coinciden con las cero descargas y cero likes registrados en Hugging Face.
- **Riesgo de alucinación:** no aplica en el sentido de un LLM, pero las afirmaciones técnicas de la model card no están respaldadas por evidencia.
- **Riesgo financiero y legal:** cualquier herramienta que afirme gestionar claves privadas, bundles MEV o copytrade sin auditoría independiente puede provocar pérdida de fondos o incumplimiento normativo.
- **Licencia:** MIT declarada, sin implicaciones prácticas al no existir código fuente distribuido.
- **Recomendación:** no ejecutar el binario en sistemas de producción ni en máquinas con acceso a carteras de criptomonedas. Reportar el repositorio a la plataforma si se confirma actividad maliciosa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/henly988/profanity2-evm-solana-vanity-gen
- Repositorio de GitHub referenciado en la model card: https://github.com/Alice34742/profanity2-evm-solana-vanity-gen
- Releases del repositorio de GitHub: https://github.com/Alice34742/profanity2-evm-solana-vanity-gen/releases/latest
- Descarga directa del ZIP citada por el autor: https://github.com/Alice34742/profanity2-evm-solana-vanity-gen/releases/latest/download/profanity2-evm-solana-vanity-gen-v1.2.0-win64.zip
