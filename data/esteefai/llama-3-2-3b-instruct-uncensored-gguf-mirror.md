# EsteefAi/Llama-3.2-3B-Instruct-uncensored-GGUF-mirror

## Resumen

Este repositorio no contiene un modelo nuevo, sino un *mirror* (copia espejo) en formato GGUF del fine-tune sin censura de Llama 3.2 3B Instruct. La cadena de autoría es: Meta (modelo base Llama 3.2 3B Instruct), chuanli11 (fine-tune `Llama-3.2-3B-Instruct-uncensored`) y bartowski (conversión a GGUF). EsteefAi publica una copia byte a byte del archivo `Llama-3.2-3B-Instruct-uncensored-Q6_K.gguf`, con el SHA-256 documentado, para que las instalaciones vía Ollama de su asistente Philibert sigan funcionando si el repositorio original desaparece o se mueve.

El interés práctico del artefacto es doble. Por un lado, el modelo subyacente tiene 3.606.752.320 parámetros y un peso de repositorio de 3,0 GB, lo que lo sitúa en la franja de modelos que se ejecutan sin dificultad en hardware de consumo. Por otro, el fine-tune de chuanli11 elimina total o parcialmente el alineamiento de seguridad del Instruct original, algo que resulta relevante para investigación sobre robustez, evaluación de salvaguardas y experimentación con modelos no censurados.

Conviene ser explícito sobre sus limitaciones como artefacto: es un espejo con 0 descargas y 0 *likes*, creado el 23 de octubre de 2026, que solo publica una cuantización (Q6_K), no declara idiomas soportados, no incluye pipeline y no aporta benchmarks propios. La licencia aplicable es la Llama 3.2 Community License, heredada sin cambios del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2); detalles de capas y cabezas no disponibles en la información proporcionada |
| Parámetros totales | 3.606.752.320 (dato real de safetensors del modelo base) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (no verificada en este repositorio) |
| Tipos de cuantización | GGUF; en el repositorio solo se publica Q6_K, generada con imatrix |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License (con LICENSE, USE_POLICY.md y NOTICE en el repositorio) |
| Formato de pesos | GGUF (archivo `Llama-3.2-3B-Instruct-uncensored-Q6_K.gguf`) |
| Tamaño del repositorio | 3,0 GB |
| SHA-256 del archivo | `0ac5a51887349714283520c2fc7522d170c6938620ecc2915e8ee41cb9c24e18` |
| Modelo base del fine-tune | chuanli11/Llama-3.2-3B-Instruct-uncensored |
| Origen de la conversión GGUF | bartowski/Llama-3.2-3B-Instruct-uncensored-GGUF |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Llama 3.2 3B Instruct, un transformer decoder-only autorregresivo de Meta con 3.606.752.320 parámetros. El repositorio no documenta el número de capas, la configuración de atención (GQA u otra), la dimensión oculta ni el tamaño del vocabulario, por lo que esos detalles deben consultarse en la documentación oficial de Meta o en el repositorio del fine-tune original. El proceso aplicado aquí no modifica la arquitectura: es una cuantización a GGUF Q6_K del fine-tune, realizada por bartowski con *importance matrix* (tag `imatrix`).

Sobre el entrenamiento del fine-tune de chuanli11 no hay información en este repositorio: se desconoce el volumen de tokens, la composición del dataset, si se empleó SFT, DPO o RLHF, y qué mecanismos concretos de eliminación de rechazos se aplicaron. El modelo card del espejo es explícito al respecto: "Changes: none", los archivos son idénticos byte a byte a los originales y todo el crédito corresponde a bartowski (GGUF), chuanli11 (fine-tune) y Meta (Llama 3.2). Cualquier afirmación sobre el proceso de *uncensoring* requeriría acudir al repositorio de chuanli11.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Instruct de Llama 3.2 3B; el tag `conversational` está presente en el repositorio.
- Respuesta a instrucciones con un alineamiento de seguridad reducido o eliminado, que es el propósito declarado del fine-tune.
- Razonamiento básico y tareas de conocimiento general propias de un modelo de 3,6B de parámetros.
- Generación de código y matemáticas a nivel de modelo pequeño; no hay evaluaciones publicadas en este repositorio.
- Compatibilidad con *endpoints* de inferencia (tag `endpoints_compatible`).
- Ejecución local en CPU y GPU mediante el ecosistema GGUF (llama.cpp y derivados), incluido Ollama según el procedimiento descrito en el propio model card.
- Capacidades multimodales, de audio, *tool calling*, modo *thinking* o agentes: no disponibles o no documentadas en la información proporcionada.

## Casos de uso

- Investigación sobre robustez y salvaguardas: el modelo permite estudiar cómo responde un modelo de 3,6B sin alineamiento de seguridad a peticiones que el Instruct original rechazaría, en un entorno controlado y con registros de evaluación.
- Pruebas de *red teaming* y auditoría de filtros: sirve como contraparte "sin censura" en experimentos comparativos frente al Llama 3.2 3B Instruct original, con la misma tokenización y familia, lo que reduce variables de confusión.
- Prototipado de asistentes conversacionales offline: con 3,0 GB en Q6_K se puede desplegar en un portátil o en una estación de trabajo sin GPU dedicada para validar flujos de diálogo antes de migrar a un modelo mayor.
- Generación de texto creativo sin restricciones editoriales: escritura de ficción, guiones o material narrativo con temáticas que los modelos alineados suelen rechazar, siempre que el uso cumpla la licencia y la legalidad aplicable.
- Evaluación de cuantizaciones: al ser un Q6_K generado con imatrix de una fuente conocida, es útil para medir la degradación de calidad frente a los pesos originales en una misma familia de modelos.
- Sustituto de bajo coste en pipelines de generación masiva: tareas de resumen, clasificación o reescritura donde el coste por token importa y la calidad de un 3B es suficiente, ejecutando el modelo en local sin dependencia de API.
- Docencia y demostraciones de despliegue GGUF: por su tamaño reducido y su único archivo, es un ejemplo sencillo para explicar cuantización, carga en llama.cpp y publicación vía Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio es un espejo y no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni del fine-tune ni de la cuantización Q6_K. Tampoco se han encontrado datos en la búsqueda web realizada. Para evaluar el modelo es necesario remitirse al repositorio de chuanli11 o ejecutar una evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K ocupa aproximadamente 3,0 GB; con caché KV y *overhead* del runtime, hay que prever del orden de 4 GB a 8k de contexto y 5-6 GB a contextos largos (estimación, no medida publicada).
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090) y de forma ajustada en 6 GB.
- Ejecución en CPU: viable gracias al formato GGUF; un equipo con 8-16 GB de RAM puede cargar el modelo completo en memoria.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para un modelo de este tamaño; se usan solo si se requiere batcheo masivo.
- Opciones de despliegue: Ollama (`ollama pull hf.co/EsteefAi/Llama-3.2-3B-Instruct-uncensored-GGUF-mirror:Q6_K`), llama.cpp, LM Studio, Jan y cualquier runtime compatible con GGUF. vLLM y TGI no están documentados para este repositorio y su soporte de GGUF es limitado.
- Latencia y throughput: no disponibles. Al no haber mediciones publicadas, el rendimiento dependerá del ancho de banda de memoria del hardware y del backend empleado.

## Comparativa con modelos similares

Los datos de la columna de contexto y licencia de los modelos alternativos provienen de la documentación pública de cada fabricante y no han sido verificados en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Este modelo (Llama 3.2 3B Instruct uncensored, Q6_K) | 3,61B | No disponible en el repositorio | Llama 3.2 Community License | Sí, solo Q6_K | Fine-tune sin censura; espejo sin benchmarks ni descargas |
| Llama 3.2 3B Instruct (Meta, original) | ~3,2B | 128 000 tokens según Meta | Llama 3.2 Community License | Sí, múltiples cuantizaciones | Alineado para seguridad; ecosistema y soporte amplios |
| Qwen2.5-3B-Instruct | ~3,1B | 32 768 tokens según Alibaba | Apache 2.0 | Sí | Licencia permisiva y buen rendimiento en código y multilingüe |
| Phi-3.5-mini-instruct | ~3,8B | 128 000 tokens según Microsoft | MIT | Sí | Entrenado con datos sintéticos; licencia muy permisiva |

No se incluye comparación de rendimiento cuantitativo porque no hay resultados de benchmarks disponibles para este modelo.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: el fine-tune está diseñado para no rechazar peticiones, por lo que puede generar contenido violento, sexual, ilegal o dañino. No es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación elevado: con 3,6B de parámetros, la tasa de fabricación de datos es mayor que en modelos de mayor tamaño, especialmente en tareas de conocimiento factual y matemáticas.
- Idiomas no declarados: el repositorio no especifica cobertura lingüística; el rendimiento en castellano no está verificado y probablemente sea inferior al de modelos con entrenamiento multilingüe explícito.
- Contexto no documentado: la longitud de contexto efectiva de esta cuantización no se indica en el repositorio y debe validarse empíricamente antes de diseñar aplicaciones que dependan de ventanas largas.
- Solo una cuantización disponible: Q6_K, 3,0 GB. No hay versiones Q4 o Q8 en este espejo, lo que limita el ajuste fino entre calidad y memoria.
- Procedencia: es un espejo de terceros con 0 descargas. La integridad del archivo está garantizada por el SHA-256 publicado, pero la responsabilidad del fine-tune recae en chuanli11 y la de la cuantización en bartowski.
- Licencia: la Llama 3.2 Community License permite uso comercial con condiciones, incluye cláusulas de atribución ("Built with Llama", conservación del nombre "Llama" en derivados), un umbral de 700 millones de usuarios mensuales y restricciones de uso recogidas en USE_POLICY.md. Es obligatorio revisar esos documentos antes de desplegar en producción.
- Fecha de creación anómala (2026-10-23) y ausencia de pipeline declarado: conviene verificar el estado del repositorio antes de integrarlo en un sistema automatizado.

## Enlaces

- Repositorio del espejo: https://huggingface.co/EsteefAi/Llama-3.2-3B-Instruct-uncensored-GGUF-mirror
- GGUF original de bartowski: https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-uncensored-GGUF
- Fine-tune original de chuanli11: https://huggingface.co/chuanli11/Llama-3.2-3B-Instruct-uncensored
- Perfil del autor del espejo: https://huggingface.co/EsteefAi
- Llama 3.2 de Meta (modelo base de la familia): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia y política de uso: archivos LICENSE, USE_POLICY.md y NOTICE incluidos en el repositorio del espejo
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos) en la búsqueda web realizada.
