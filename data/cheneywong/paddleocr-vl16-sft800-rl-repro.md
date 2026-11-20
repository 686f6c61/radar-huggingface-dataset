# CheneyWong/paddleocr-vl16-sft800-rl-repro

## Resumen

PaddleOCR-VL-1.6 SFT800 es un snapshot experimental de ajuste fino supervisado (SFT) sobre el modelo PaddleOCR-VL-1.6 de PaddlePaddle, publicado por el usuario CheneyWong. No se trata de un modelo nuevo entrenado desde cero, sino de un paquete de reproducción que contiene los pesos completos del paso 800 de un entrenamiento SFT orientado a reconocimiento de tablas, junto con el código de entrenamiento VeRL, los scripts de evaluación y los conjuntos de datos utilizados en el experimento. El autor lo publica explícitamente como material de trabajo para continuar la iteración en otra máquina, no como un modelo listo para producción.

El modelo se construye sobre la arquitectura PaddleOCR-VL, un modelo multimodal de tipo image-text-to-text especializado en reconocimiento óptico de documentos, con capacidad declarada para tablas, fórmulas y maquetación. Los pesos publicados suman 958.588.736 parámetros (aproximadamente 0,96 mil millones) en formato safetensors, con un repositorio completo de 16,7 GB que incluye pesos, datasets, código y artefactos de evaluación. Los idiomas declarados son chino (zh) e inglés (en).

Su relevancia es acotada pero específica: sirve como referencia reproducible para investigadores que quieran replicar o continuar un pipeline de SFT + RL (DAPO) aplicado a reconocimiento de tablas con PaddleOCR-VL. La licencia no está disponible de forma unificada, lo que limita su uso comercial directo sin revisar los términos del modelo base y de las fuentes de datos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaddleOCR-VL (transformers, custom_code), pipeline image-text-to-text |
| Parametros totales | 958.588.736 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | no disponible (el autor indica que no se otorga licencia unificada sobre los datos mixtos) |
| Formato de pesos | safetensors (pesos principales), configuracion JSON, tokenizer, processor |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de PaddleOCR-VL-1.6, un modelo multimodal de reconocimiento de documentos que procesa imágenes y genera texto estructurado. El snapshot publicado corresponde al paso 800 de un ajuste fino supervisado (SFT step800) realizado por el autor, no al checkpoint final del ciclo de RL. Según la model card, el entrenamiento posterior emplea VeRL con configuraciones DAPO o similares, y el paquete incluye tanto el código de adaptación Paddle/VeRL como las configuraciones de reward.

Los datos de entrenamiento declarados incluyen un conjunto SFT original de 16.091 muestras (`sft-train.parquet`), un conjunto compartido para dos variantes de RL de 2.499 muestras (`train.parquet`) y un heldout independiente de 82 muestras. Los conjuntos de evaluación son extensos: 173.141 crops en 32 shards para evaluación de tablas y 2.864 páginas completas para evaluación fullpage. El autor advierte que parte de las etiquetas provienen de datos originales o pseudoetiquetas automáticas, no de anotación humana completa. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF/DPO más allá de la mención a DAPO.

## Capacidades

- Reconocimiento de tablas: tarea principal del ajuste fino, orientada a extraer estructura y contenido tabular a partir de imágenes de documentos.
- Reconocimiento óptico de documentos (OCR) multimodal: procesa imágenes y genera texto, heredado de PaddleOCR-VL-1.6.
- Procesamiento de fórmulas: el paquete incluye un dataset denominado `selected-formula-v3` y scripts de normalización de fórmulas.
- Evaluación crop y fullpage: soporta tanto recortes de región como páginas completas, con pipelines de evaluación separados.
- Idiomas: chino e inglés declarados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): visión sí (image-text-to-text); thinking mode y audio no disponibles.

## Casos de uso

- Reproducción de experimentos de SFT + RL: el paquete incluye pesos, código VeRL, configuraciones de reward y datasets, lo que permite a un investigador reiniciar el ciclo de RL desde el paso 800 y comparar resultados bajo condiciones controladas.
- Extracción estructurada de tablas en pipelines documentales: el modelo puede integrarse en un flujo que recibe imágenes de páginas y devuelve representaciones tabulares, usando los scripts de evaluación crop incluidos como referencia de calidad.
- Investigación en reconocimiento de fórmulas: el dataset `selected-formula-v3` y los scripts de normalización permiten entrenar y evaluar la transcripción de expresiones matemáticas en documentos.
- Benchmarking de modelos OCR-VL: los conjuntos de 173.141 crops y 2.864 páginas completas sirven como banco de pruebas reproducible para comparar variantes de PaddleOCR-VL u otros modelos de la misma categoría, siempre que se congele la misma versión de imágenes, GT y correcciones de maquetación.
- Desarrollo de sistemas de digitalización de archivos: combinado con PP-DocLayoutV3 (incluido en `assets/`) para detección de maquetación, el modelo puede formar parte de un pipeline de conversión de documentos escaneados a texto estructurado.
- Validación de pipelines de anotación automática: dado que parte de las etiquetas son pseudoetiquetas, el paquete permite estudiar el impacto de etiquetas automáticas frente a anotación humana en tareas de reconocimiento de tablas.
- Formación y transferencia: los pesos SFT800 pueden servir como inicialización para ajustes finos adicionales en dominios específicos de documentos, con la salvedad de que no se incluyen optimizador, scheduler ni estado RNG del paso 800.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de una "teacher benchmark" con reglas de exclusión y puntuaciones de referencia en `repro/workspace/eval/teacher-benchmark-v5/`, pero no se proporcionan cifras concretas en la información facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 958 millones de parámetros en precisión completa (fp32) se requieren aproximadamente 3,8 GB solo para pesos; en fp16/bf16, alrededor de 1,9 GB; en cuantización de 8 bits, cerca de 1 GB. Estas cifras son estimaciones a partir del número de parámetros y no están confirmadas en la información del autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es compatible con GPUs de consumo como RTX 3090, RTX 4090 o superiores en fp16, aunque el pipeline multimodal (procesador de imagen + modelo) añade overhead de memoria no cuantificado.
- Cabe en consumer GPU: probablemente sí en fp16 en GPUs con 8 GB o más, sujeto a verificación empírica; no confirmado por el autor.
- Opciones de despliegue: la librería declarada es transformers con `custom_code`, por lo que requiere cargar código remoto. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible; el soporte de estos motores no está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CheneyWong/paddleocr-vl16-sft800-rl-repro | 958.588.736 | no disponible | no disponible | Hugging Face, 0 descargas | Snapshot experimental SFT step800 con paquete de reproducción |
| PaddlePaddle/PaddleOCR-VL-1.6 | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Modelo base oficial del que deriva este snapshot |
| Otros modelos OCR-VL de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles; el único punto de referencia claro es el modelo base PaddleOCR-VL-1.6, del cual este snapshot es un ajuste fino.

## Limitaciones y advertencias

- No es un modelo final: el autor indica explícitamente que el snapshot corresponde al paso 800 del SFT y no al modelo final del ciclo de RL.
- Licencia no unificada: el repositorio conserva licencias originales en `licenses/` y código vendorizado, pero no se otorga una licencia unificada sobre los datos mixtos. El uso comercial requiere revisar los términos del modelo base y de cada fuente de datos.
- Etiquetas parcialmente automáticas: parte de las etiquetas de entrenamiento y evaluación son pseudoetiquetas generadas por máquina, no anotación humana, lo que puede introducir sesgos y errores sistemáticos.
- Reproducibilidad condicionada: el autor advierte que para comparar modelos hay que congelar la misma versión de imágenes, GT, GT de respaldo y correcciones de maquetación; de lo contrario los resultados no son comparables.
- Estado de entrenamiento incompleto: no se incluyen optimizador, scheduler ni RNG del paso 800, por lo que no es posible restaurar bit a bit el estado intermedio del SFT.
- Dependencias frágiles: el entorno de instalación tiene conflictos de dependencias declarados por el autor y no debe sustituirse por las últimas versiones de los paquetes.
- Idiomas limitados: solo chino e inglés declarados; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas OCR la generación puede producir texto plausible pero incorrecto en regiones de baja calidad.
- Descargas y tracción nulas: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Requiere `trust_remote_code`: la carga con transformers implica ejecutar código personalizado del repositorio, con el riesgo de seguridad asociado.

## Enlaces

- Hugging Face: https://huggingface.co/CheneyWong/paddleocr-vl16-sft800-rl-repro
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Documentación interna del repositorio (referenciada en la model card): `docs/ENVIRONMENT.md`, `docs/PROJECT_CONTEXT.md`, `docs/REWARD_AND_VERL.md`, `docs/EVALUATION.md`, `docs/CODEX_GPT.md`, `docs/VALIDATION.md`
- Manifiesto de archivos: `MANIFEST.json` (en el repositorio)
- Estado de subida: `UPLOAD_STATUS.json` (en el repositorio)
