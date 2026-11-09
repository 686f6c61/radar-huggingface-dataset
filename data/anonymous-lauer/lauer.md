# anonymous-LaUER/LaUER

## Resumen

LaUER es un modelo de investigación multimodal desarrollado por el usuario anónimo `anonymous-LaUER` que aprende una representación fusionada de señal de electrocardiograma (ECG) e imagen para la detección e interpretación de enfermedades cardiovasculares, apoyándose en lenguaje clínico. El modelo se distribuye como un conjunto de checkpoints acumulativos en tres etapas de granularidad semántica: SGL (alineamiento señal-imagen-texto clínico), SGL_CGL (fusión señal-imagen, matching y trazado guiado por consulta) y SGL_CGL_TGL (generación autorregresiva de informes y explicaciones).

El repositorio contiene únicamente los pesos entrenados (3,6 GB en formato PyTorch `.pt`) junto con configuraciones YAML y sumas de verificación SHA256; no incluye código de inferencia, que debe obtenerse del repositorio GitHub del autor. La carga requiere además dos codificadores de texto congelados de MedCPT (Article Encoder y Query Encoder) alojados en Hugging Face.

Se trata de un artefacto estrictamente de investigación: no se han publicado métricas, benchmarks, licencia ni información sobre composición del dataset de entrenamiento. Su relevancia radica en abordar una tarea poco cubierta por los modelos multimodales generalistas —la interpretación clínica automatizada de ECG con generación de informes— mediante un esquema de alineamiento multimodal en tres niveles de granularidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal señal-imagen-texto; detalles no publicados) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en precisión original `.pt`) |
| Idiomas soportados | no disponible (el texto clínico se procesa vía MedCPT, presumiblemente inglés, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), con configuraciones YAML y `SHA256SUMS` |
| Tamaño del repositorio | 3,6 GB |
| Dependencias externas | MedCPT Article Encoder y MedCPT Query Encoder (congelados) |

## Arquitectura y entrenamiento

La información disponible describe un esquema de entrenamiento acumulativo en tres etapas. La primera, Semantic Granularity Learning (SGL), alinea las modalidades de señal ECG, imagen y texto clínico. La segunda, Concept Granularity Learning (CGL), añade fusión señal-imagen, matching y trazado guiado por consulta (*query-guided tracing*), con variantes `_n` y `_o` distribuidas por separado con sus propias configuraciones. La tercera, Token Granularity Learning (TGL), incorpora generación autorregresiva de informes y explicaciones. Los checkpoints son acumulativos: cada etapa parte de la anterior.

El texto clínico se codifica mediante los encoders MedCPT (NCBI), que se mantienen congelados durante el uso del modelo. No se especifican el número de tokens de entrenamiento, la composición del dataset, el tipo de backbone (transformer u otra familia), ni si se emplearon técnicas de RLHF o DPO. Cada checkpoint se distribuye con su YAML emparejado, semilla de entrenamiento y época registrada en `checkpoints.json`; los nombres de carpeta agrupan las ejecuciones por semilla. El autor indica que los logs y métricas originales de entrenamiento quedaron fuera de la release.

## Capacidades

- Procesamiento conjunto de señal ECG (ficheros `.mat`) e imagen de ECG (`.png`).
- Detección de enfermedades a partir de la representación multimodal fusionada.
- Alineamiento entre señal, imagen y texto clínico en el espacio latente (etapa SGL).
- Fusión señal-imagen con matching y trazado guiado por consulta (etapa CGL).
- Generación autorregresiva de informes clínicos y explicaciones (etapa TGL).
- Evaluación zero-shot mediante el módulo `zeroshot.run_experiments` del repositorio de código.
- Soporte de tool calling, function calling, agentes y razonamiento multi-step: no disponible (no es un modelo de propósito general).
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible; la única entrada visual documentada es la imagen de ECG.

## Casos de uso

- **Generación automatizada de informes de ECG**: la variante `SGL_CGL_TGL` produce descripciones y explicaciones en lenguaje clínico a partir de un registro y su representación gráfica, lo que permite reducir el tiempo de redacción en servicios de cardiología.
- **Detección asistida de patologías cardiacas**: el modelo clasifica a partir de la representación fusionada señal-imagen, útil como segunda lectura en pipelines de triaje de registros ECG.
- **Trazado guiado por consulta clínica**: la etapa CGL permite localizar en la señal o imagen los segmentos relevantes para una consulta concreta, lo que facilita la verificación por parte del clínico.
- **Investigación en representaciones multimodales médicas**: el esquema de tres granularidades sirve como base para estudiar alineamiento señal-imagen-texto en dominios clínicos con datos escasos.
- **Evaluación zero-shot sobre benchmarks de ECG**: el módulo `zeroshot.run_experiments` permite medir la transferencia del modelo a conjuntos de datos no vistos sin reentrenamiento.
- **Prototipado de sistemas de explicabilidad clínica**: la combinación de matching y generación de explicaciones permite construir interfaces que justifiquen la predicción ante el especialista.
- **Reproducción de experimentos académicos**: la publicación de semillas, configuraciones YAML y sumas SHA256 facilita la replicación de resultados en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que los logs y métricas originales de entrenamiento quedaron fuera de la release.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio de 3,6 GB sugiere que los pesos en precisión original podrían ocupar del orden de varios GB, pero se desconoce el reparto entre checkpoints y codificadores.
- GPU recomendadas: no disponible. La inferencia se documenta con `--device cuda`, sin especificar modelo de GPU.
- GPU de consumo: no confirmado; a falta de datos de tamaño y cuantización, no puede afirmarse que quepa en tarjetas como RTX 4090.
- Opciones de despliegue: únicamente el script `inference.py` del repositorio GitHub del autor, con PyTorch y CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Requisito adicional: los encoders MedCPT Article y Query deben descargarse y colocarse en el directorio `weights/` antes de la inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (interpretación multimodal de ECG con generación de informes) ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo declara explícitamente como tal, sin garantías de robustez clínica.
- Ausencia de licencia: no se especifica licencia, por lo que el uso comercial queda sin autorización clara y debe considerarse restringido por defecto.
- Sin métricas publicadas: no hay benchmarks, curvas de aprendizaje ni logs que permitan evaluar la calidad real del modelo.
- Sin información sobre sesgos: se desconoce la composición demográfica y clínica del dataset de entrenamiento, lo que impide evaluar sesgos por subgrupo.
- Riesgo de alucinación: la etapa TGL genera texto autorregresivamente, con el riesgo inherente de informes o explicaciones no sustentados en la señal.
- Dependencia de código externo: el repositorio de Hugging Face solo contiene pesos; sin el repositorio GitHub y los encoders MedCPT no es utilizable.
- Idiomas y contexto: no documentados; no debe asumirse soporte multilingüe ni ventanas de contexto amplias.
- Fecha de creación futura en los metadatos (2026-11-09): conviene verificar la procedencia y autenticidad del repositorio antes de cualquier uso.
- No apto para uso clínico directo sin validación regulatoria y estudio prospectivo independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anonymous-LaUER/LaUER
- Implementación en GitHub: https://github.com/anonymous-LaUER/LaUER_main
- MedCPT Article Encoder: https://huggingface.co/ncbi/MedCPT-Article-Encoder
- MedCPT Query Encoder: https://huggingface.co/ncbi/MedCPT-Query-Encoder
