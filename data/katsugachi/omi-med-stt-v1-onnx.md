# Katsugachi/omi-med-stt-v1-onnx

## Resumen

Omi Med STT v1 ONNX es una exportación derivada del modelo de reconocimiento automático de voz clínico Omi Med STT v1, desarrollado por Omi Health, que a su vez parte de NVIDIA Parakeet TDT 0.6B v2. Esta variante, publicada por el usuario Katsugachi, convierte los pesos originales a formato ONNX con cuantización dinámica por tensor a QUInt8 en las operaciones MatMul y Gemm, manteniendo convoluciones y estado recurrente en FP32, con el objetivo de ejecutar inferencia en navegador mediante WebAssembly.

El modelo está especializado en transcripción de audio clínico en inglés y procesa audio mono a 16 kHz, del que se extraen características log-mel de 128 bins normalizadas según el esquema de NeMo. La arquitectura es la del modelo base Parakeet TDT, un sistema de reconocimiento de voz con decodificación TDT (Token-and-Duration Transducer) que combina un encoder y un decoder conjunto con predicción de duraciones entre 0 y 4.

La relevancia de esta ficha reside en su carácter práctico: es un artefacto de despliegue orientado a entornos sin GPU, con un tamaño de repositorio de 0,9 GB, licencia CC BY 4.0 y una advertencia explícita del autor sobre la ausencia de validación clínica. No es una exportación oficial de Omi Health ni de NVIDIA, y los resultados de benchmarks del modelo original no son aplicables a esta versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con decodificacion TDT (Token-and-Duration Transducer), derivada de NVIDIA Parakeet TDT 0.6B v2 |
| Parametros totales | no disponible (modelo base Parakeet TDT 0.6B v2, aproximadamente 0,6 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QUInt8 dinamica por tensor en MatMul y Gemm; convoluciones y estado recurrente en FP32 |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafos de encoder y decoder joint separados) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del transducer TDT de Parakeet, con un encoder que procesa características log-mel de 128 bins calculadas a partir de audio mono a 16 kHz y un decoder joint que emite tokens junto con duraciones en el rango 0–4, decodificadas de forma greedy. La exportación a ONNX se realizó mediante el flujo de exportación de grafos de NeMo con el adaptador clínico upstream habilitado, y el vocabulario SentencePiece se exportó en orden de ID.

La cuantización aplicada es dinámica y por tensor sobre las operaciones MatMul y Gemm para su ejecución en WASM, dejando las convoluciones y el estado recurrente en FP32. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus clínico ni si hubo etapas de ajuste fino con RLHF o DPO en el modelo base. El autor indica que se ejecutó una prueba de humo de inferencia sobre un clip sintético de radiología en inglés, con transcripción correcta de varios hallazgos pero error en un nombre de fármaco y su dosis.

## Capacidades

- Reconocimiento automático de voz en inglés, orientado a dominio clínico y médico.
- Transcripción de audio mono a 16 kHz con extracción de características log-mel de 128 bins.
- Decodificación TDT greedy con predicción de duraciones entre 0 y 4.
- Ejecución en navegador mediante ONNX Runtime Web o WebAssembly, sin necesidad de GPU.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe: el modelo declara únicamente inglés.
- No se documentan capacidades de visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de dictados clínicos en navegador: el modelo puede integrarse en una aplicación web que capture audio del micrófono, calcule las características log-mel y ejecute los grafos ONNX en WASM para generar la transcripción sin enviar audio a un servidor.
- Prototipado de asistentes de documentación médica: útil para validar flujos de captura y transcripción en entornos de desarrollo antes de migrar a un modelo validado clínicamente.
- Demos educativas de ASR clínico: permite mostrar en un navegador cómo funciona un transducer TDT con cuantización, sin infraestructura de GPU.
- Procesamiento por lotes de notas de voz en inglés: al ser un artefacto de 0,9 GB, puede desplegarse en contenedores ligeros para transcribir grabaciones de consulta en entornos de prueba.
- Investigación sobre cuantización de modelos ASR: sirve como caso de estudio para medir el impacto de QUInt8 dinámico en MatMul y Gemm frente a FP32 en tareas de reconocimiento de voz.
- Integración en aplicaciones de accesibilidad: transcripción en tiempo real de audio en inglés dentro del navegador para personas con dificultades auditivas, con la advertencia de que no está validado clínicamente.
- Evaluación de pipelines de exportación NeMo a ONNX: el repositorio enlazado por el autor incluye el script de exportación, lo que facilita reproducir y adaptar el proceso a otros modelos Parakeet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los resultados de benchmarks del modelo upstream no son aplicables a este artefacto cuantizado y que la única prueba realizada fue una verificación de humo sobre un clip sintético de radiología, con errores en un nombre de fármaco y su dosis.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal de ejecución en navegador mediante WASM; el repositorio ocupa 0,9 GB en disco.
- GPU recomendadas: no se especifican; el artefacto está pensado para CPU y WebAssembly.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1–2 GB de memoria si se ejecuta con un runtime ONNX compatible, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), con los grafos de encoder y decoder joint separados; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Katsugachi/omi-med-stt-v1-onnx | no disponible (base ~0,6B) | no disponible | en | CC BY 4.0 | ONNX (QUInt8/FP32) | Exportacion no oficial para navegador, sin validacion clinica |
| omi-health/omi-med-stt-v1 | no disponible (base ~0,6B) | no disponible | en | no disponible en la informacion proporcionada | NeMo (.nemo) | Modelo base clinico de Omi Health, con adaptador clinico |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6B | no disponible | en | no disponible en la informacion proporcionada | NeMo | Modelo upstream de NVIDIA, base de la cadena de derivaciones |

## Limitaciones y advertencias

- No está validado clínicamente: el autor lo declara explícitamente y desaconseja su uso en decisiones médicas.
- La prueba de humo mostró errores en la transcripción de un nombre de fármaco y su dosis, un fallo crítico en contexto clínico.
- La cuantización QUInt8 puede degradar la precisión respecto al modelo base; los benchmarks del upstream no son aplicables.
- Solo soporta inglés, lo que limita su uso en entornos hispanohablantes.
- Es una exportación no oficial: no cuenta con el respaldo de Omi Health ni de NVIDIA.
- Riesgo de alucinación inherente a los modelos ASR en audio con ruido, acentos o terminología especializada.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero no exime de la responsabilidad sobre el uso clínico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado probablemente con datos en inglés, puede presentar peor rendimiento con acentos no nativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Katsugachi/omi-med-stt-v1-onnx
- Modelo base Omi Health: https://huggingface.co/omi-health/omi-med-stt-v1
- Modelo upstream NVIDIA Parakeet TDT 0.6B v2: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Repositorio con el runner de navegador y script de exportación: https://github.com/Katsugachi/Consensus-Demo
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
