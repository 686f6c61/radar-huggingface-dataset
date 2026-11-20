# Outlier-Ai/Outlier-Lite-9B-GGUF

## Resumen

Outlier-Lite-9B-GGUF es un repositorio de distribución que contiene un único fichero cuantizado del modelo Qwen3.5-9B. No se trata de un modelo entrenado por Outlier-Ai, sino de una copia byte a byte del fichero `Qwen3.5-9B-Q4_K_M.gguf` publicado por Unsloth en su repositorio `unsloth/Qwen3.5-9B-GGUF`, en la revisión `3885219b6810b007914f3a7950a8d1b469d598a5`. El propósito declarado es que la aplicación Outlier para Windows pueda descargar y ejecutar el modelo localmente con llama.cpp sin depender de un repositorio de terceros que pueda cambiar.

El modelo base es Qwen3.5-9B, desarrollado por el equipo Qwen y publicado bajo licencia Apache-2.0, con 8.953.803.264 parámetros totales. La cuantización Q4_K_M la realiza Unsloth y el fichero resultante ocupa 5.680.522.464 bytes (aproximadamente 5,7 GB). La model card indica explícitamente que todo el crédito de los pesos corresponde al equipo Qwen y el de la cuantización a Unsloth; este repositorio existe únicamente como espejo verificado por SHA256.

La relevancia de esta ficha es acotada: sirve para identificar el artefacto, verificar su procedencia y conocer sus condiciones de uso, pero no aporta información técnica nueva sobre el modelo subyacente más allá de lo que publique el repositorio de Qwen o el de Unsloth. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks no está incluida en la model card de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (corresponde a Qwen3.5-9B; no se detalla en este repositorio) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.5-9B-Q4_K_M.gguf`) |

Datos adicionales del artefacto: tamano del fichero 5.680.522.464 bytes, tamano del repositorio 5,7 GB, SHA256 `03b74727a860a56338e042c4420bb3f04b2fec5734175f4cb9fa853daf52b7e8`, revision de origen `3885219b6810b007914f3a7950a8d1b469d598a5` del repositorio de Unsloth.

## Arquitectura y entrenamiento

No hay información en la documentación proporcionada sobre la arquitectura interna del modelo base Qwen3.5-9B (tipo de transformer, mecanismos de atención, composición del dataset, número de tokens de entrenamiento, uso de RLHF/DPO u otras técnicas de alineamiento). La model card de este repositorio se limita a describir el proceso de copia y verificación del fichero GGUF.

Lo único verificable es el pipeline de cuantización: Unsloth tomó los pesos del modelo base Qwen3.5-9B en formato original y los convirtió a GGUF con cuantización Q4_K_M. El tag `imatrix` presente en los metadatos de Hugging Face sugiere el uso de matrices de importancia durante la cuantización, aunque la model card no lo confirma explícitamente ni detalla la metodología. Outlier-Ai no realiza ningún entrenamiento, fine-tuning ni modificación de los pesos: el fichero se copia byte a byte y se valida mediante SHA256 antes de su uso en la aplicación.

## Capacidades

- Generación de texto conversacional: el tag `conversational` en los metadatos indica uso previsto para diálogo, aunque no se detallan capacidades específicas.
- Ejecución local con llama.cpp: el formato GGUF y el tag `llama.cpp` confirman compatibilidad con el motor de inferencia homónimo.
- Integración con la aplicación Outlier para Windows: el modelo se descarga y ejecuta desde dicha aplicación, que verifica el SHA256 del fichero.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a través de una API compatible con endpoints estándar, aunque no se especifica el estándar.
- Cualquier otra capacidad (razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión, audio, modo thinking) no está documentada en la información disponible.

## Casos de uso

- Ejecución local en Windows mediante la aplicación Outlier: el modelo se descarga desde este repositorio y se ejecuta con llama.cpp en el equipo del usuario, sin depender de servicios en la nube. Es adecuado porque el artefacto está empaquetado específicamente para ese flujo y su integridad se verifica por hash.
- Despliegue en entornos con requisitos de reproducibilidad: al fijar una revisión concreta y un SHA256, el fichero permite construir pipelines que siempre cargan exactamente los mismos pesos, evitando cambios silenciosos en el repositorio de origen.
- Prototipado de asistentes conversacionales en local: el tag `conversational` y el tamaño de 9B en Q4_K_M permiten probar diálogos multi-turno en hardware de consumo sin depender de APIs externas.
- Inferencia con llama.cpp en estaciones de trabajo sin GPU dedicada: el formato GGUF con cuantización Q4_K_M está pensado para ejecución eficiente en CPU o GPU modesta, lo que facilita pruebas en portátiles y equipos de oficina.
- Servido mediante endpoints compatibles: para equipos que ya tienen infraestructura de serving basada en APIs compatibles, el tag `endpoints_compatible` indica que el modelo puede exponerse siguiendo ese patrón, aunque la configuración concreta no está documentada.
- Distribución de un modelo de referencia en aplicaciones de escritorio: el patrón de espejo verificado por hash es replicable para otras aplicaciones que necesiten empaquetar un modelo fijo y garantizar que el usuario ejecuta exactamente los pesos esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa del orden de magnitud, un fichero GGUF Q4_K_M de 5,7 GB requiere cargar aproximadamente esa cantidad de pesos en memoria; con overhead de contexto y caché KV, el consumo real será superior y depende de la longitud de contexto configurada, que no se especifica.
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del fichero (5,7 GB) es compatible en principio con GPUs de consumo con 8 GB o más de VRAM, pero esta afirmación no está respaldada por la documentación del repositorio.
- Opciones de despliegue: llama.cpp (confirmado por los tags y por la model card); la aplicación Outlier para Windows como cliente específico. Otros motores (vLLM, TGI, Ollama) no están confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Outlier-Lite-9B-GGUF (este repositorio) | 8.953.803.264 | no disponible | Q4_K_M | Apache-2.0 | Copia byte a byte del GGUF de Unsloth, verificada por SHA256 |
| unsloth/Qwen3.5-9B-GGUF | 8.953.803.264 (mismo modelo base) | no disponible | Multiples (incluye Q4_K_M) | Apache-2.0 | Repositorio de origen de la cuantizacion |
| Qwen/Qwen3.5-9B | 8.953.803.264 | no disponible | Pesos originales | Apache-2.0 | Modelo base sin cuantizar |

La comparativa se limita a las variantes del mismo modelo porque la información proporcionada no incluye datos de rendimiento que permitan contrastarlo con otros modelos de tamaño similar.

## Limitaciones y advertencias

- Este repositorio no aporta información técnica propia sobre el modelo: arquitectura, contexto, idiomas y capacidades deben consultarse en los repositorios de Qwen y Unsloth.
- El contenido es una copia byte a byte de un artefacto de terceros; cualquier actualización del modelo base o de la cuantización de Unsloth no se reflejará aquí salvo que el autor publique una nueva revisión.
- Solo se distribuye la cuantización Q4_K_M. No hay versiones Q2, Q3, Q5, Q6, Q8 ni pesos sin cuantizar en este repositorio.
- Los tags `windows` y la mención a la aplicación Outlier indican un uso previsto específico; no se documenta soporte para otras plataformas o clientes.
- Riesgo de alucinación, sesgos conocidos y limitaciones idiomáticas: no documentados en la información disponible, aunque son aplicables al modelo base y deben evaluarse con las fuentes originales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. La model card atribuye los pesos al equipo Qwen y la cuantización a Unsloth.
- Las búsquedas web realizadas devuelven resultados sobre entidades homónimas sin relación con este repositorio (outlier.bet, outlier.org, outlier.ai, outlier.com), por lo que no se han podido verificar enlaces adicionales del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de cuantización de origen: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Revisión de origen: `3885219b6810b007914f3a7950a8d1b469d598a5`
- Aplicación Outlier para Windows: https://outlier.host/
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
