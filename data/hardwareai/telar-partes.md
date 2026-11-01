# hardwareai/telar-partes

## Resumen

Telar Partes es un repositorio de distribución de artefactos de inferencia para la aplicación Telar, desarrollada por HardwareAI. No se trata de un modelo único entrenado desde cero, sino de un paquete que agrupa los distintos componentes que la app descarga e instala en local: el modelo conversacional Telar Trenza (en formato GGUF Q4_K_M, 5,0 GB), un modelo de dictado y conversación por voz (190 MB), un modelo de visión para lectura de imágenes y PDF escaneados (3,0 GB), un modelo que se copia al teléfono (2,5 GB, con licencia MIT y avisos de phi-4-mini) y un archivo comprimido con el toolchain de compilación de firmware para ESP32 (arduino-cli y core esp32).

El dato de parámetros totales registrado en safetensors asciende a 8.190.735.360, lo que sitúa el conjunto en el rango de los 8.000 millones de parámetros. El repositorio ocupa 12,5 GB e incluye sumas de verificación SHA-256 por carpeta para que la aplicación valide cada archivo antes de instalarlo, de modo que el usuario no necesita descargar nada manualmente ni usar una memoria USB.

Su relevancia actual es la de servir como canal de distribución reproducible y verificable para un stack de IA local orientado a dispositivos de usuario final: combina un LLM conversacional cuantizado, voz, visión y compilación de firmware en un único paquete con licencias heterogéneas (Apache-2.0, MIT y GPL-3.0 según el componente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio agrupa varios modelos; no se detalla la arquitectura de cada uno) |
| Parametros totales | 8.190.735.360 (dato de safetensors del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M para `trenza-1-Q4_K_M.gguf`; no disponible para el resto de componentes |
| Idiomas soportados | no disponible |
| Licencia | varias: Apache-2.0 (modelo de chat y visión), MIT (dictado y modelo de teléfono), GPL-3.0 y licencias de cada herramienta (aguja.zip) |
| Formato de pesos | GGUF (modelo de chat); no disponible para el resto |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de los modelos incluidos. El repositorio es un contenedor de artefactos, no una model card de entrenamiento: no se documentan el tipo de transformer, la composición del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO. El único componente con formato y cuantización explícitos es `trenza-1-Q4_K_M.gguf`, un GGUF cuantizado a Q4_K_M, lo que sugiere un modelo orientado a inferencia en CPU o GPU de gama media mediante llama.cpp u otro runtime compatible con GGUF.

El resto de componentes se describen por función y tamaño: un modelo de dictado y voz de 190 MB, un modelo de visión de 3,0 GB para fotos y PDF escaneados, y un modelo de 2,5 GB que la app copia al teléfono, con avisos de licencia que remiten a phi-4-mini. La innovación técnica destacable no está en el entrenamiento, sino en el mecanismo de distribución: la app selecciona qué descargar y verifica cada archivo con su huella SHA-256 (`SHA256SUMS.txt` por carpeta) antes de instalarlo.

## Capacidades

- Generación de texto conversacional mediante Telar Trenza (GGUF Q4_K_M).
- Dictado por voz y conversación hablada mediante el componente `dictado/`.
- Lectura de imágenes: fotos y PDF escaneados mediante el componente `vision/`.
- Ejecución en teléfono mediante el modelo empaquetado en `telefono/` (2,5 GB).
- Compilación de firmware para ESP32 mediante `aguja.zip` (arduino-cli y core esp32).
- Verificación de integridad de cada artefacto mediante SHA-256 antes de la instalación.
- Tool calling, function calling, agentes, modo thinking y capacidades multilingües: no disponible.

## Casos de uso

- Instalación local de un asistente conversacional sin conexión: la app descarga `trenza-1-Q4_K_M.gguf` (5,0 GB) y lo ejecuta en local, evitando depender de una API externa para el chat.
- Dictado y conversación por voz en escritorio: el componente `dictado/` (190 MB) permite transcribir voz y mantener diálogo hablado con una huella de disco reducida, adecuado para equipos con poco espacio libre.
- Digitalización de documentos escaneados: `vision/` (3,0 GB) procesa fotos y PDF escaneados en local, lo que resulta útil cuando el contenido no puede salir del dispositivo por requisitos de privacidad.
- Asistente en movilidad: `telefono/` (2,5 GB) se copia al teléfono para ofrecer inferencia en el propio dispositivo, sin depender de conectividad.
- Desarrollo de firmware para ESP32: `aguja.zip` incluye arduino-cli y el core esp32, de modo que el usuario puede compilar y flashear firmware desde el mismo entorno sin instalar toolchains por separado.
- Despliegue reproducible en flotas de equipos: los `SHA256SUMS.txt` por carpeta permiten a la app validar cada archivo antes de instalarlo, lo que facilita instalaciones verificables y auditables en varios dispositivos.
- Distribución sin memoria USB: al descargar la app únicamente los artefactos necesarios, se evita el traslado manual de ficheros entre máquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo de chat: el GGUF Q4_K_M ocupa 5,0 GB en disco; la VRAM necesaria para carga completa en GPU es del orden de 5-6 GB, aunque no se dispone de cifras oficiales.
- VRAM estimada para visión: el componente `vision/` ocupa 3,0 GB en disco; la VRAM necesaria no está documentada.
- VRAM estimada para dictado: el componente `dictado/` ocupa 190 MB; puede ejecutarse en CPU.
- GPU recomendadas: no disponible. Por tamaño, el modelo de chat Q4_K_M podría caber en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070), pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí para el modelo de chat cuantizado, según el tamaño en disco; sin datos oficiales de VRAM ni de latencia.
- Opciones de despliegue: llama.cpp u otro runtime compatible con GGUF para `trenza-1-Q4_K_M.gguf`; el resto de componentes depende de la app Telar, que gestiona la descarga y la verificación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Telar Partes (hardwareai/telar-partes) | 8.190.735.360 (total del repo) | no disponible | GGUF y otros | Varias (Apache-2.0, MIT, GPL-3.0) | Paquete de artefactos para una app, no un modelo único |
| Modelos GGUF de ~8B de uso comun (por ejemplo, familias Llama 3 8B o Mistral 7B en Q4_K_M) | ~7.000-8.000 millones | 8.000-128.000 tokens según variante | GGUF | Licencias comunitarias o Apache-2.0 según variante | Comparables por tamaño de pesos y formato de despliegue; no se dispone de datos de rendimiento de Telar Partes para comparar |
| phi-4-mini (referenciado en `telefono/LICENSE-phi-4-mini.txt`) | no disponible en esta ficha | no disponible | no disponible | MIT (según el aviso incluido) | Componente de teléfono empaquetado en el repositorio |

No se dispone de datos de benchmarks del modelo de chat de Telar Partes, por lo que la comparación se limita a tamaño, formato y licencia.

## Limitaciones y advertencias

- El repositorio no es un modelo único: agrupa pesos, toolchains y artefactos con licencias distintas; el uso comercial debe revisarse componente a componente (Apache-2.0, MIT y GPL-3.0 en `aguja.zip`).
- No se documentan idiomas soportados, longitud de contexto ni arquitectura, lo que impide evaluar su idoneidad para casos multilingües o de contexto largo.
- No hay benchmarks publicados: no es posible comparar su calidad frente a alternativas de tamaño similar.
- El modelo de chat está cuantizado a Q4_K_M, lo que implica una pérdida de precisión respecto a los pesos originales en precisión completa.
- Riesgo de alucinación y sesgos: no documentado por el autor; debe asumirse el riesgo habitual de los LLM sin evaluación publicada.
- La licencia `other` con nombre "varias" obliga a consultar el archivo `LICENSE` y los avisos de cada componente antes de redistribuir.
- El repositorio tiene 59 descargas y 0 likes, sin señales de adopción ni validación por parte de la comunidad.
- El campo de licencia del repositorio no especifica términos por componente en la metadata de HuggingFace; la información detallada solo aparece en la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hardwareai/telar-partes
- Licencia del repositorio: https://huggingface.co/hardwareai/telar-partes/blob/main/LICENSE
- Avisos del modelo de chat: https://huggingface.co/hardwareai/telar-partes/blob/main/NOTICE.md
- Licencia del modelo de teléfono: https://huggingface.co/hardwareai/telar-partes/blob/main/telefono/LICENSE-phi-4-mini.txt
