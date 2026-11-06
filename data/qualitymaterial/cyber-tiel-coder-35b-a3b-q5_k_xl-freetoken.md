# qualitymaterial/Cyber-Tiel-Coder-35B-A3B-Q5_K_XL-FreeToken

## Resumen

Cyber-Tiel-Coder-35B-A3B-Q5_K_XL-FreeToken es un paquete de configuración y validación comunitaria para la cuantización Q5_K_XL del modelo Cyber-Tiel-Coder-35B-A3B, un modelo de generación de texto orientado a código con arquitectura MoE (Mixture of Experts) de la familia `qwen35moe`. El autor de este repositorio, `qualitymaterial`, no entrena ni convierte pesos: distribuye un perfil de FreeToken, un script auxiliar para Windows y material de evaluación reproducible, mientras que los pesos originales (sin modificar) se alojan en el repositorio de `peculiar-ragdoll`.

El modelo subyacente declara 35B de parámetros totales y 3B activos por token, con 256 expertos enrutados por capa de los cuales se seleccionan 8 por token. El decodificador cargado consta de 40 capas más una capa MTP (multi-token prediction) que el motor omite. El checkpoint nativo soporta hasta 262.144 tokens de contexto, aunque el perfil reproducible de este paquete limita la secuencia y el pool KV a 32.768 tokens.

La relevancia de esta ficha es doble: por un lado documenta un caso real de inferencia local de un MoE de 35B en hardware de consumo (RTX 5070 Ti de 16 GB y 64 GB de RAM), y por otro deja constancia explícita de las limitaciones del paquete: no hay benchmarks generales, las pruebas son puntuales y en una sola máquina, y el margen de memoria es muy ajustado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (MoE transformer con capa MTP adicional) |
| Parámetros totales | 35B (según nomenclatura del modelo) |
| Parámetros activos | 3B (según nomenclatura del modelo) |
| Longitud de contexto | 262.144 tokens nativos en el checkpoint; 32.768 tokens en el perfil reproducible de este paquete |
| Tipos de cuantización | Q5_K_XL (mezcla dinámica: Q5_K, Q6_K, Q8_0 según tensor); Q5_K_S, Q4 y Q8_K_XL existen como archivos separados no probados aquí |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF |

Detalles adicionales de la cuantización Q5_K_XL publicada: en el decodificador cargado, los grupos de expertos gate/up usan Q5_K en 39 capas y Q6_K en una; los grupos down usan Q6_K en 36 capas y Q8_0 en cuatro; las proyecciones densas y el embedding inspeccionados usan Q8_0. El archivo Q5_K_XL ocupa 26.981.933.376 bytes (aproximadamente 26,98 GB / 25,13 GiB). El Q8_K_XL ocupa 38.840.607.040 bytes, unos 11,86 GB más, y no se ha probado en este hardware.

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (`qwen35moe`): 256 expertos enrutados por capa con 8 seleccionados por token, lo que sitúa los parámetros activos en torno a 3B frente a los 35B totales. El decodificador cargado tiene 40 capas; la capa MTP adicional presente en el checkpoint se omite en la carga. El paquete menciona además una plantilla «Sharp» y un proceso de «abliteration» atribuidos a los autores upstream, sin que se detallen los datos de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO.

No se dispone de información sobre la composición del dataset de entrenamiento, el proceso de alineación ni innovaciones técnicas más allá de la propia arquitectura MoE y la capa MTP. Este repositorio no realiza entrenamiento, conversión ni parcheo del motor: solo aporta el perfil de FreeToken, un script de PowerShell para Windows y material de evaluación.

## Capacidades

- Generación de texto y código: las pruebas registradas incluyen generación de Python con 5 casos fijos y 100 casos de propiedades con semilla, todos superados.
- Tool calling / function calling: se validaron nombre de función, argumentos y seguimiento del resultado de la herramienta.
- Recuperación sintética en contexto largo: recuperó los 3 valores solicitados sobre 29.731 tokens de entrada en 15,47 segundos.
- Razonamiento multi-paso aplicado a código: generó una implementación de caché TTL que superó 21 tests al ser reejecutados de forma independiente, además de 100.000 operaciones mixtas y dos comprobaciones dirigidas de expiración y desalojo.
- Streaming de salida: los marcadores exactos solicitados se devolvieron correctamente en modo streaming.
- Multilingüe: inglés y chino declarados en la model card; no hay datos de evaluación para otros idiomas.
- Persistencia de perfil: un perfil de 32K guardado se reinició y devolvió el marcador solicitado.
- Integración en escritorio: la entrada se registró en Models > Downloaded con botón de inicio en FreeToken Desktop.

## Casos de uso

- Asistencia a la programación en local: el modelo puede generar funciones y tests en Python en una máquina de escritorio con GPU de consumo, como demuestran los 105 casos de función generada y los 21 tests de la caché TTL superados.
- Implementación de estructuras de datos y utilidades: la generación de una caché TTL con expiración y desalojo validada con 100.000 operaciones mixtas indica utilidad para código de infraestructura acotado y verificable.
- Automatización con herramientas: el soporte validado de function calling permite integrarlo en flujos donde el modelo debe invocar funciones con argumentos estructurados y consumir el resultado.
- Análisis de documentos largos: con el perfil de 32K tokens puede procesar contextos extensos, como muestra la recuperación de 3 valores enterrados entre 29.731 tokens de entrada.
- Pipelines de CI/CD con verificación automática: al generar código que pasa tests reejecutables de forma independiente, encaja en flujos donde la salida se valida antes de aceptarse.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local con FreeToken, permite trabajar con código propietario sin enviar datos a servicios externos.
- Prototipado en Windows: el paquete incluye un script de PowerShell con verificación de checksum y guía de importación, lo que facilita la puesta en marcha en equipos Windows con 64 GB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos registrados son pruebas puntuales del autor del paquete en una sola máquina:

| Prueba | Resultado registrado |
|---|---|
| Velocidad de salida corta | 58,9 tokens/s (sin prefill, stream limitado a 256 tokens) |
| Tiempo hasta el primer delta de contenido | Aproximadamente 1,02 s |
| Recuperación sintética | 3 de 3 valores recuperados sobre 29.731 tokens de entrada en 15,47 s |
| Generación de Python | 5 casos fijos y 100 casos de propiedades con semilla superados |
| Caché TTL generada | 21 de 21 tests superados en reejecución independiente |
| Revisión adicional de la caché TTL | 100.000 operaciones mixtas y 2 comprobaciones dirigidas superadas |
| Uso de GPU observado | 7.291 MiB (7,12 GiB), incluyendo otras aplicaciones |

El autor indica explícitamente que no reclama ninguna mejora de calidad frente a otros modelos ni una clasificación general de benchmarks. Las 105 funciones generadas y las 100.000 operaciones TTL son evaluaciones distintas: estas últimas ejercitan una única implementación de caché generada, no 100.000 peticiones al modelo.

## Requisitos de hardware

- RAM del sistema: 64 GB, con un margen muy ajustado. Las comprobaciones iniciales dejaron unos 4,6 GiB de RAM física libre; tras el reinicio final quedaron entre 1,0 y 1,3 GiB.
- VRAM: la instantánea de GPU registrada fue de 7.291 MiB (7,12 GiB), incluyendo otras aplicaciones en ejecución.
- GPU probada: RTX 5070 Ti de 16 GB.
- Contexto del perfil reproducible: 32.768 tokens de secuencia con un pool KV de 32.768 tokens.
- Perfil alternativo reportado por el usuario: 262.144 tokens por secuencia, 337.920 slots KV compartidos, 512 slots de expertos y 24 slots Mamba, leído desde la API en vivo. Es un perfil distinto del usado para las mediciones de velocidad y recuperación, y no se ha probado la calidad de recuperación a 262K.
- Cuantización Q8_K_XL: 38.840.607.040 bytes, unos 11,86 GB más; no descargada ni probada en carga, y no debe asumirse que quepa en la misma máquina.
- Motor de despliegue: FreeToken Desktop (motor probado `0.2.1+g2a75b3999`, Desktop `0.2.0-beta.25`). No se documentan otros motores como vLLM, llama.cpp u Ollama en este paquete.
- Latencia y throughput: 58,9 tokens/s en salida corta y 1,02 s hasta el primer delta de contenido, en las condiciones descritas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables, por lo que la comparación se limita a características estructurales verificables.

| Modelo | Parámetros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B (Q5_K_XL) | 35B totales / 3B activos | 262.144 nativos; 32.768 en el perfil probado | MIT | GGUF | Pruebas puntuales del paquete, sin benchmarks estándar |
| Cyber-Tiel-Coder-35B-A3B (Q8_K_XL) | 35B totales / 3B activos | 262.144 nativos | MIT | GGUF | No probado en este hardware |
| Modelos de la familia Qwen citados por el autor | No disponible | No disponible | No disponible | No disponible | No disponible |
| Modelos Ornith citados por el autor | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados proceden de comprobaciones puntuales en una sola máquina y no constituyen una clasificación de benchmarks ni una garantía de calidad general.
- El margen de RAM es crítico: tras el reinicio final quedaban entre 1,0 y 1,3 GiB libres con 64 GB de RAM. Ejecutar otras aplicaciones puede provocar fallos de carga o inestabilidad.
- El tamaño del archivo en disco no equivale al uso de RAM en tiempo de ejecución.
- El límite de contexto del perfil reproducible es de 32.768 tokens, no los 262.144 tokens que muestra el metadato del checkpoint en Desktop.
- Un pool KV compartido de 337.920 slots no equivale a una ventana de conversación de 337.920 tokens, y la calidad de recuperación a 262K no se ha probado.
- La cuantización Q5_K_XL es una mezcla dinámica de precisión; no todos los tensores están almacenados a cinco bits.
- No se ha probado Q5_K_S, Q4 ni Q8_K_XL en este hardware.
- Idiomas declarados únicamente inglés y chino; no hay evidencia de rendimiento en castellano.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo orientado a código, la verificación automática de la salida (tests) es recomendable antes de usarla en producción.
- La licencia MIT se aplica al paquete y al modelo según la model card, pero el crédito por el modelo, la abliteration, la cuantización y la plantilla Sharp corresponde a los autores upstream.
- Este paquete no instala ni actualiza FreeToken Desktop; requiere una instalación previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qualitymaterial/Cyber-Tiel-Coder-35B-A3B-Q5_K_XL-FreeToken
- Repositorio upstream de pesos GGUF: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Archivo Q5_K_XL directo: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP/resolve/b62212407346cb7aafcc8d2788a1844555002fd3/Cyber-Tiel-Coder-35B-A3B-MTP-UD-Q5_K_XL.gguf
- FreeToken Desktop: https://github.com/FlashML-org/FreeToken
- Resultados y metodología (RESULTS.md, referenciado en la model card): no disponible como enlace directo en la información proporcionada.
