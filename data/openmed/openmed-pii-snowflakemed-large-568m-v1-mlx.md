# OpenMed/OpenMed-PII-SnowflakeMed-Large-568M-v1-mlx

## Resumen

OpenMed-PII-SnowflakeMed-Large-568M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección y de-identificación de información personal identificable (PII) en textos clínicos. Desarrollado por OpenMed, se distribuye como un empaquetado en formato MLX del checkpoint original `OpenMed/OpenMed-PII-SnowflakeMed-Large-568M-v1`, pensado para ejecutarse de forma local en dispositivos Apple Silicon (Mac, iPhone, iPad) mediante las librerías OpenMed y OpenMedKit.

El modelo se basa en la arquitectura XLM-RoBERTa (encoder transformer) con 568 millones de parámetros, y está afinado para la tarea de reconocimiento de entidades nombradas (NER) sobre dominios médicos y clínicos. Su objetivo principal es permitir la anonimización de historiales clínicos y otros documentos sanitarios sin que los datos salgan del dispositivo, cumpliendo con requisitos de privacidad como HIPAA. La relevancia actual radica en la creciente demanda de soluciones de IA local-first en el sector salud, donde la confidencialidad del paciente es crítica.

El repositorio incluye los pesos en formato MLX (safetensors o npz), un `config.json` y un `id2label.json`, pero no incorpora los assets del tokenizador, que se resuelven mediante referencia al checkpoint original. La licencia es Apache 2.0, lo que facilita su uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer, `XLMRobertaForTokenClassification`) |
| Parametros totales | 568 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base XLM-RoBERTa suele usar 512 tokens, pero no se especifica en la documentacion) |
| Tipos de cuantizacion | no disponible (el formato MLX puede admitir cuantizacion, pero no se indica en la informacion) |
| Idiomas soportados | ingles (aunque XLM-RoBERTa es multilingue, el modelo esta afinado para texto clinico en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de XLM-RoBERTa Large (568M) para la tarea de token classification, concretamente para la deteccion de PII en dominios clinicos. La arquitectura es un transformer encoder con atencion bidireccional, que produce una etiqueta por token (por ejemplo, B-PER, I-PATIENT, etc.). No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni el proceso de ajuste (si se uso RLHF, DPO u otras tecnicas). El nombre "SnowflakeMed" sugiere que el checkpoint base proviene de un modelo entrenado por Snowflake para el dominio medico, pero no se confirma en la documentacion.

La innovacion principal no esta en la arquitectura, sino en el empaquetado: se ofrece en formato MLX para ejecucion eficiente en Apple Silicon, con soporte tanto en Python (via `openmed[mlx]`) como en Swift (via OpenMedKit). El modelo admite "smart merging" de entidades, que combina fragmentos de tokens para reconstruir entidades completas.

## Capacidades

- Deteccion de entidades PII en texto clinico: nombres de pacientes, fechas de nacimiento, numeros de seguridad social, direcciones, telefonos, etc.
- De-identificacion de historiales clinicos: elimina o enmascara informacion sensible para cumplir con HIPAA.
- Reconocimiento de entidades nombradas (NER) biomedico: identifica entidades clinicas ademas de PII, segun los benchmarks mencionados en la web de OpenMed.
- Soporte de "smart merging": fusiona tokens fragmentados para devolver entidades completas con nivel de confianza.
- Ejecucion local en Apple Silicon: funciona en Mac, iPhone y iPad reales (no en simulador iOS) mediante MLX.
- Integracion con OpenMed y OpenMedKit: API unificada para Python y Swift, con seleccion automatica de backend (MLX en Apple Silicon, PyTorch/Hugging Face en otros sistemas).
- No incluye capacidades de generacion de texto, tool calling ni agentes; es un modelo puramente discriminativo para clasificacion de tokens.

## Casos de uso

- Anonimizacion de historiales clinicos en hospitales: el modelo procesa notas medicas y reemplaza nombres, fechas y otros datos personales por marcadores, permitiendo compartir los documentos para investigacion sin violar la privacidad del paciente.
- Cumplimiento normativo en ensayos clinicos: antes de publicar datos de ensayos, se aplica el modelo para garantizar que no queden PII residuales, reduciendo el riesgo de sanciones por incumplimiento de HIPAA o GDPR.
- Preparacion de datasets para entrenamiento de modelos medicos: los equipos de IA pueden usar el modelo para limpiar grandes volumenes de texto clinico antes de usarlos como datos de entrenamiento, evitando fugas de informacion personal.
- Aplicaciones de salud movil (mHealth): integrado en una app iOS, el modelo permite a los pacientes escanear sus propios informes y ver una version anonimizada antes de compartirla con terceros, todo en el dispositivo.
- Investigacion biomedica colaborativa: los investigadores pueden intercambiar notas clinicas anonimizadas entre instituciones sin necesidad de acuerdos de transferencia de datos complejos, gracias a la de-identificacion local.
- Auditoria de documentos legales sanitarios: despues de una reclamacion o litigio, el modelo ayuda a revisar expedientes para detectar cualquier PII que no deberia haberse divulgado en documentos publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La web de OpenMed menciona que sus modelos son "state of the art on 10 of 12 biomedical NER benchmarks", pero no se proporcionan numeros concretos ni una comparativa con otros modelos. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- Inferencia en Apple Silicon: el modelo esta optimizado para MLX, por lo que se ejecuta eficientemente en Macs con chip M1/M2/M3/M4 y en iPhone/iPad con procesadores A14 o posteriores.
- VRAM estimada: al ser un modelo de 568M en formato MLX, el uso de memoria en GPU es reducido. En Mac con memoria unificada, se estima que necesita entre 1 y 2 GB de RAM para cargar los pesos en precision FP32, y menos si se aplica cuantizacion (aunque no se documenta).
- GPU recomendadas: no requiere GPU dedicada; funciona con la GPU integrada de Apple Silicon. En otros sistemas, se puede usar el backend PyTorch/Hugging Face con cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: Python con `openmed[mlx]`, Swift con OpenMedKit, o directamente con la libreria `transformers` si se usa el checkpoint original (no MLX). Tambien existe una version ONNX para Android y WebAssembly/WebGPU (repositorio `-onnx-android`).
- Latencia y throughput: no se proporcionan datos. Dado el tamano del modelo, se espera una latencia de decenas de milisegundos por documento en Apple Silicon, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros modelos de deteccion de PII en el ambito clinico. Existen alternativas como los modelos de la familia `clinical-bert` o soluciones basadas en reglas como Presidio, pero no se han encontrado datos comparativos publicados en la documentacion del modelo. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Idioma: el modelo esta afinado principalmente para ingles. Aunque XLM-RoBERTa es multilingue, no se garantiza un rendimiento adecuado en otros idiomas; OpenMed ofrece variantes especificas para frances y otros idiomas en repositorios separados.
- Contexto limitado: al ser un encoder transformer, la longitud de contexto es finita (tipicamente 512 tokens en XLM-RoBERTa). Documentos clinicos largos pueden requerir segmentacion previa.
- Riesgo de alucinacion en etiquetas: como todo modelo de NER, puede producir falsos positivos o negativos, especialmente con entidades poco frecuentes o formatos inusuales.
- Sesgos: el modelo puede reflejar sesgos presentes en los datos de entrenamiento clinico, como infrarrepresentacion de ciertos grupos demograficos o dialectos.
- Dependencia del tokenizador externo: el repositorio MLX no incluye los assets del tokenizador; OpenMed y OpenMedKit resuelven esta dependencia mediante referencia al checkpoint original, pero si se usa fuera de estas librerias, hay que cargar el tokenizador por separado.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero el modelo no debe utilizarse como unico mecanismo de cumplimiento normativo; se recomienda supervisio humana en entornos clinicos reales.
- Privacidad: aunque el modelo se ejecuta localmente, los datos de entrada deben tratarse con las mismas medidas de seguridad que cualquier dato clinico sensible.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-SnowflakeMed-Large-568M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-SnowflakeMed-Large-568M-v1
- Version ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-SnowflakeMed-Large-568M-v1-onnx-android
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
