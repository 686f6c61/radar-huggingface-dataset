# BOAR-App/boar-offline

## Resumen

BOAR-App/boar-offline no es un modelo entrenado, sino un repositorio de distribución que aloja los APK de la aplicación BOAR, un asistente de investigación open source para Android que responde en el propio teléfono y cita fuentes. El repositorio existe porque los binarios superan el límite de 2 GiB por fichero de las releases de GitHub: el APK principal pesa 3,45 GB e incluye dentro del paquete el modelo de respuestas, el modelo de embeddings, la biblioteca documental y un modelo de generación de imágenes, de modo que la aplicación funciona íntegramente en modo avión, incluso en el primer arranque.

El motor de respuestas es Qwen3-4B-Instruct-2507 en cuantización Q4_K_M (GGUF), tomado del repositorio de unsloth, acompañado de bge-small-en-v1.5 en Q8 para la búsqueda semántica, un paquete de unas 50.000 entradas de Wikipedia Vital Articles como base de conocimiento y SDXS-512 en Q8 para los esquemas del laboratorio de diseño. La aplicación en sí vive en el repositorio rferrari/boar-app bajo licencia MIT.

Su relevancia es de ingeniería de despliegue, no de investigación en IA: demuestra un patrón viable de RAG completamente offline en un dispositivo móvil, con verificación de integridad por SHA-256 de cada artefacto al primer arranque y una licencia agregada de tipo "mixed" que obliga a revisar componente por componente antes de cualquier uso comercial. No hay evidencia en la documentación disponible de que se haya realizado un fine-tune sobre el modelo base, pese a la etiqueta `base_model:finetune` del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (corresponde al modelo base Qwen3-4B-Instruct-2507; no se documenta modificación arquitectónica alguna en este repositorio) |
| Parámetros totales | ~4.000 millones en la variante principal; existe una variante alternativa de ~1.700 millones (Qwen3-1.7B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la ventana efectiva la fija la aplicación, no se documenta) |
| Tipos de cuantización | Q4_K_M para el modelo de respuestas; Q8 para bge-small-en-v1.5 y SDXS-512 |
| Idiomas soportados | no disponible; el paquete solo incluye biblioteca y embeddings en inglés (Wikipedia Vital Articles, bge-small-en-v1.5) |
| Licencia | mixta ("mixed"): Apache 2.0 (Qwen3), MIT (bge-small-en-v1.5 y la app), CC BY-SA 4.0 (contenido de Wikipedia), CreativeML Open RAIL++-M con restricciones de uso (SDXS-512) |
| Formato de pesos | GGUF, empaquetados dentro de APK Android arm64 |

## Arquitectura y entrenamiento

Este repositorio no documenta ningún proceso de entrenamiento propio: no se especifican tokens, composición de dataset, RLHF, DPO ni innovaciones de arquitectura. La totalidad del apartado técnico corresponde al modelo base Qwen3-4B-Instruct-2507, del que la model card solo indica el origen de los pesos (unsloth/Qwen3-4B-Instruct-2507-GGUF) y la licencia Apache 2.0. La etiqueta `base_model:finetune` sugiere algún tipo de adaptación, pero la documentación no describe ninguna; a efectos prácticos debe tratarse como una redistribución cuantizada del modelo original.

La aportación técnica real está en el pipeline de despliegue: un APK autocontenido que, al primer arranque, extrae del paquete el modelo de respuestas, el modelo de embeddings, el índice documental y el generador de imágenes, y verifica cada artefacto contra su SHA-256 antes de permitir su uso. El APK está firmado con una clave estable (certificado SHA-256 `7cf514f9ab8253cbd78eb7d112d66fd05c2ad27e6fc987bf8f3276a7eedf1f01`, CN=BOAR, O=sopa.team) que permite la actualización sobre versiones anteriores conservando modelos y conversaciones. La inferencia se ejecuta con llama.cpp sobre arquitectura arm64. El build es reproducible mediante el script `scripts/build-offline-apk.sh` de la rama `feat/offline-bundle`, con la variable `BOAR_OFFLINE_MODEL=qwen3-4b-instruct-2507-q4km`.

## Capacidades

- Generación de texto con citación de fuentes: el asistente responde apoyándose en el paquete documental incluido y devuelve referencias.
- Recuperación aumentada (RAG) totalmente offline: búsqueda semántica sobre bge-small-en-v1.5 contra un índice de aproximadamente 50.000 artículos de Wikipedia Vital Articles.
- Funcionamiento sin red: no requiere conectividad en ningún momento, incluido el primer arranque.
- Generación de imágenes: SDXS-512 Q8 para los esquemas del "laboratorio de diseño" de la aplicación.
- Verificación de integridad criptográfica de los artefactos embebidos mediante SHA-256.
- Actualización sobre versiones previas conservando datos del usuario (misma clave de firma).
- Soporte de tool calling, function calling, modo thinking, agentes multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no documentadas; el material incluido (biblioteca y embeddings) es en inglés.

## Casos de uso

- Investigación de campo sin cobertura: un técnico o investigador consulta conceptos y obtiene respuestas con fuentes en zonas sin conectividad, usando el paquete de 50.000 artículos como base documental.
- Entornos air-gapped y de seguridad restringida: instalación en dispositivos Android de organizaciones que prohíben tráfico de red saliente, con verificación SHA-256 de cada componente al primer arranque.
- Periodismo de investigación en terreno: redacción y contraste de notas con referencias verificables sin exponer consultas a servicios en la nube.
- Docencia y divulgación en aulas sin infraestructura de red: despliegue en teléfonos de 8 GB mediante la variante Qwen3-1.7B, que ocupa 2,06 GB.
- Prototipado de asistentes RAG on-device: la rama `feat/offline-bundle` y el script de build permiten sustituir el modelo o el corpus y medir el comportamiento real en hardware móvil.
- Documentación técnica de campo con apoyo gráfico: uso del generador SDXS-512 para producir esquemas de laboratorio junto a las respuestas del modelo de texto.
- Evaluación de latencia en dispositivos de gama media: el APK de 4B sirve como banco de pruebas reproducible (dato publicado: unos 30 s hasta la primera palabra en un dispositivo de 8 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y tampoco se aportan datos de throughput. El único dato de rendimiento disponible es cualitativo y de latencia:

| Métrica | Valor | Contexto |
|---|---|---|
| Tiempo hasta la primera palabra | ~30 s | Qwen3-4B Q4_K_M en dispositivo de 8 GB de RAM, modo avión |
| Variante recomendada para 12 GB o más | Qwen3-4B Q4_K_M | APK de 3,45 GB, "mejores respuestas" a costa de esperar |
| Variante recomendada para 8 GB | Qwen3-1.7B Q4_K_M | APK de 2,06 GB |

No se debe extrapolar el rendimiento del modelo base a esta distribución sin medirlo: la cuantización Q4_K_M, el hardware arm64 y la integración con el pipeline RAG alteran las cifras.

## Requisitos de hardware

- Dispositivo Android arm64 (los APK publicados son exclusivamente arm64).
- RAM: 12 GB o más recomendado para la variante Qwen3-4B; 8 GB para la variante Qwen3-1.7B. En 8 GB el 4B funciona pero con unos 30 s hasta la primera palabra.
- Almacenamiento: 3,45 GB para el APK de 4B y 2,06 GB para el de 1,7B, más el espacio de la extracción en el primer arranque.
- GPU de escritorio (A100, H100, RTX 4090) y VRAM estimada: no aplica a este artefacto, que está empaquetado y compilado para Android; no se documentan requisitos para otros entornos.
- Opciones de despliegue: instalación del APK en el dispositivo; para otros entornos habría que usar el GGUF original (unsloth/Qwen3-4B-Instruct-2507-GGUF) con llama.cpp, Ollama o vLLM, sin que este repositorio documente esas rutas.
- Throughput y latencia: solo el dato de ~30 s hasta la primera palabra en un dispositivo de 8 GB; no hay cifras de tokens por segundo.

## Comparativa con modelos similares

La información disponible no permite una comparación cuantitativa: no hay benchmarks ni especificaciones completas del propio artefacto. La comparación se limita a lo documentado.

| Artefacto | Parámetros | Contexto | Licencia | Formato / despliegue | Datos de rendimiento |
|---|---|---|---|---|---|
| BOAR offline (Qwen3-4B Q4_K_M) | ~4B | no disponible | Mixta (Apache 2.0 + MIT + CC BY-SA 4.0 + RAIL++-M) | GGUF dentro de APK arm64 | Solo latencia (~30 s a primera palabra en 8 GB) |
| BOAR offline (Qwen3-1.7B Q4_K_M) | ~1,7B | no disponible | Mixta (misma combinación) | GGUF dentro de APK arm64 | no disponible |
| Qwen3-4B-Instruct-2507 GGUF (unsloth, sin empaquetar) | ~4B | no disponible en la información | Apache 2.0 | GGUF, requiere runtime propio | no disponible |
| Otras soluciones RAG on-device (Ollama, llama.cpp con GGUF genérico) | según modelo | según modelo | según modelo | requieren instalación y descarga manual de pesos | no disponible |

Frente a la ruta "hazlo tú mismo" con un GGUF y llama.cpp, la diferencia no está en el modelo sino en el empaquetado: BOAR entrega corpus, embeddings, verificación de integridad y aplicación en un único binario firmado, a cambio de atarse a Android arm64 y a un corpus en inglés.

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribución cuantizada de Qwen3-4B-Instruct-2507. Cualquier evaluación de calidad debe remitirse al modelo base, no a esta ficha.
- La etiqueta `base_model:finetune` no está respaldada por ninguna descripción de entrenamiento en la model card; conviene tratar el artefacto como el modelo original en Q4_K_M.
- Solo Android arm64: no hay binarios para x86, iOS, escritorio ni servidor. En otros entornos hay que reconstruir el pipeline.
- Corpus y embeddings exclusivamente en inglés (Wikipedia Vital Articles y bge-small-en-v1.5); el soporte real de otros idiomas no está documentado ni evaluado.
- Licencia mixta con obligaciones acumulativas: Apache 2.0, MIT, CC BY-SA 4.0 (atribución y compartir igual para el contenido de Wikipedia) y CreativeML Open RAIL++-M para SDXS-512, que añade restricciones de uso. El enlace `NOTICE` del repositorio es de lectura obligatoria antes de cualquier uso comercial.
- Riesgo de alucinación: es un modelo de 4B cuantizado a Q4 sobre un corpus limitado; la cita de fuentes no garantiza que la respuesta sea fiel al documento citado, por lo que hace falta verificación humana en contextos críticos.
- Latencia alta: unos 30 s hasta la primera palabra en un dispositivo de 8 GB; no es apto para interacción conversacional fluida en ese hardware.
- Artefacto en estado release candidate (v2.0.0-rc1) y con 0 descargas registradas en HuggingFace en el momento de la consulta; madurez y mantenimiento no verificados.
- La ventana de contexto efectiva depende de la aplicación y no se documenta; asumir el contexto nativo del modelo base sería una suposición no respaldada.
- Los resultados de la búsqueda web asociados a esta consulta tratan sobre el jabalí (wild boar) y no guardan relación con el proyecto; se descartan como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BOAR-App/boar-offline
- Repositorio de la aplicación: https://github.com/rferrari/boar-app
- Release v2.0.0-rc1: https://github.com/rferrari/boar-app/releases/tag/v2.0.0-rc1
- Aviso de licencias agregadas (NOTICE): https://github.com/rferrari/boar-app/blob/main/android-native/NOTICE
- Rama de construcción offline: https://github.com/rferrari/boar-app/tree/feat/offline-bundle
- Pesos GGUF de origen: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Modelo de embeddings: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo de imagen: https://huggingface.co/concedo/sdxs-512-tinySDdistilled-GGUF
