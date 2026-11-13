# KevziFar/cassini-composition-4b-GGUF

## Resumen

Cassini-composition-4b es un modelo de lenguaje especializado que actúa como motor de composición de comandos para Cassini, una interfaz en lenguaje natural para sistemas de información geográfica (SIG) que funciona íntegramente en local. Lo desarrolla KevziFar y se distribuye como un archivo GGUF cuantizado en Q4_K_M, derivado del modelo base Qwen/Qwen3.5-4B mediante un ajuste fino con adaptadores LoRA sobre un conjunto de datos sintéticos de peticiones en francés y sus correspondientes planes de comandos.

El modelo no genera respuestas libres: su única función es transformar una solicitud en francés en una secuencia de comandos tipados del registro de Cassini, que el usuario revisa, valida y ejecuta después en QGIS. Esta restricción de diseño lo convierte en un componente determinista dentro de un pipeline controlado, donde el núcleo de Cassini verifica cada plan antes de su ejecución y el modelo nunca se conecta a la red.

Con 4.326.350.848 parámetros totales y un tamaño de repositorio de 2,8 GB, el modelo está pensado para ejecutarse en el proceso del núcleo mediante llama.cpp, sin dependencias de servicios en la nube. Su relevancia radica en demostrar un caso de uso muy acotado y verificable de ajuste fino de un modelo pequeño para una tarea de dominio específico (operaciones cartográficas), con licencia Apache-2.0 y un enfoque explícito en la privacidad y la operación offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | frances (fr), ingles (en); el ajuste esta orientado al frances y el resto de idiomas no se ha evaluado |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `cassini-composition-4b-0.1.0-Q4_K_M.gguf`, 2.783.446.944 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4.326 millones de parámetros bajo licencia Apache-2.0 de Alibaba Cloud. Sobre esa base se aplicó un ajuste fino mediante un adaptador LoRA entrenado con un conjunto de ejemplos sintéticos generados por el propio generador del repositorio de Cassini (directorio `training/`): pares de peticiones en francés y el plan de comandos esperado. No se emplearon datos de terceros. Posteriormente, el adaptador se fusionó en los pesos de la base, se convirtió a GGUF y se cuantizó a Q4_K_M con llama.cpp.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal no reside en la arquitectura, sino en el enfoque de ajuste: un modelo pequeño cuantizado a 4 bits, orientado exclusivamente a la producción de planes de comandos verificables en lugar de texto libre, lo que reduce el riesgo de salidas no controladas en un entorno de escritorio offline.

## Capacidades

- Generación de planes de comandos tipados del registro de Cassini a partir de peticiones en francés.
- Traducción de intenciones cartográficas a operaciones concretas: zona tampón, intersección, selección, cálculo de pendiente, campo de visión, exportación de mapa a PDF.
- Salida estructurada y verificable por el núcleo de Cassini antes de su ejecución.
- Ejecución local mediante llama.cpp, sin conexión de red.
- Comprensión de francés como idioma principal de interacción; el inglés figura como idioma declarado pero no evaluado.
- No soporta de forma declarada tool calling genérico, agentes multi-paso ni razonamiento conversacional abierto; su uso previsto excluye la conversación general y la generación de código.

## Casos de uso

- Análisis cartográfico en oficinas técnicas: el modelo convierte una petición como "genera una zona tampón de 500 metros alrededor de las carreteras" en el plan de comandos correspondiente, que el usuario valida antes de ejecutarlo en QGIS.
- Planificación urbanística: un técnico municipal describe en francés una selección de parcelas por criterios y el modelo produce la secuencia de comandos de selección e intersección para su revisión.
- Estudios medioambientales: cálculo de pendientes o campos de visión a partir de un modelo digital del terreno, expresado como petición en lenguaje natural y traducido a comandos tipados.
- Docencia y formación en SIG: estudiantes que no dominan la sintaxis de QGIS pueden formular operaciones en francés y comprobar el plan generado antes de ejecutarlo, lo que facilita el aprendizaje guiado.
- Generación de cartografía para informes: exportación de mapas a PDF mediante una petición en francés, con el plan de comandos revisado por el usuario antes de la ejecución.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp y sin conexión de red, es adecuado para administraciones o gabinetes que no pueden enviar datos geográficos a servicios en la nube.
- Integración en el núcleo de Cassini: el archivo GGUF se coloca en el directorio `models\` junto a `cassini.exe` y el núcleo lo detecta automáticamente, con verificación de la huella SHA-256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 2.783.446.944 bytes (aproximadamente 2,6 GiB); se requiere espacio adicional para el contexto y las estructuras de llama.cpp, por lo que un presupuesto de 3 a 4 GiB de memoria es razonable, aunque no se confirma en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: por el tamaño del archivo cuantizado, es plausible su ejecución en GPU de consumo con 6-8 GB de VRAM o superior, así como en CPU; no obstante, no se confirma en la documentación.
- Opciones de despliegue: llama.cpp (método previsto por el autor, cargado en el proceso del núcleo de Cassini); otros runners compatibles con GGUF no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| cassini-composition-4b | 4.326 M | no disponible | Apache-2.0 | GGUF Q4_K_M | Composición de comandos SIG en francés |
| Qwen/Qwen3.5-4B (base) | 4.326 M | no disponible | Apache-2.0 | safetensors | Modelo generalista |
| Alternativas especializadas en SIG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos directamente comparables en la información proporcionada; la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- El modelo puede proponer un plan incorrecto o rechazar una petición que considere fuera de su registro; por ello Cassini muestra el plan y exige la validación del usuario antes de ejecutar nada.
- Está ajustado para el francés; el resto de idiomas no se ha evaluado y su rendimiento fuera de ese idioma es incierto.
- No está diseñado ni evaluado para conversación general, generación de código ni otros usos fuera de la composición de comandos SIG.
- No produce respuestas libres: cualquier expectativa de uso como asistente conversacional queda fuera de su ámbito previsto.
- Riesgo de alucinación en la generación de comandos: puede inventar operaciones o parámetros no válidos, mitigado por la verificación del núcleo y la validación humana.
- Licencia Apache-2.0, que permite uso comercial; el núcleo de Cassini es también Apache-2.0, pero su extensión QGIS es GPL, lo que impone obligaciones adicionales si se integra en ese ecosistema.
- El modelo se distribuye como un único archivo Q4_K_M; no se ofrecen otras cuantizaciones ni pesos en safetensors en este repositorio.
- No se documentan sesgos conocidos, número de tokens de entrenamiento ni composición detallada del dataset sintético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KevziFar/cassini-composition-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Interfaz Cassini: https://kevzi.github.io/cassini-gis
- Contacto del autor: cassini-sig@proton.me
