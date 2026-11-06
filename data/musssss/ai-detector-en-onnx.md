# musssss/ai-detector-en-onnx

## Resumen

`musssss/ai-detector-en-onnx` es una conversión a ONNX del modelo `ShantanuT01/vanguard-ai-text-detector`, un clasificador de texto basado en ModernBERT-large cuyo objetivo es distinguir texto generado por IA de texto escrito por humanos en inglés. El autor de esta versión, `musssss`, no ha reentrenado los pesos: se limita a exportar el modelo original a formato ONNX y aplicar una cuantización dinámica int8, de modo que pueda ejecutarse en el navegador mediante transformers.js.

La relevancia del modelo radica en su orientación práctica: está pensado para integrarse en un detector de escritura con IA que funciona íntegramente en el cliente, sin enviar el texto a un servidor. El autor declara métricas concretas sobre el modelo cuantizado: AUROC de 0,984, una tasa de detección del 91,9 % de texto generado por IA con un 1 % de falsos positivos y un 2,0 % de falsos positivos sobre texto humano con umbral 0,5.

Arquitectónicamente es un transformer encoder (ModernBERT-large) adaptado a clasificación binaria de secuencias. El repositorio ocupa 0,4 GB y la licencia es MIT, heredada del modelo base. El soporte de idiomas se limita al inglés, tanto por la model card como por el conjunto de datos de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (transformer encoder) para clasificación de texto |
| Parametros totales | no disponible (el modelo base es ModernBERT-large; el número exacto no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ModernBERT soporta contextos largos, pero la cifra concreta de esta conversión no se especifica) |
| Tipos de cuantizacion | int8 dinámica (`onnx/model_quantized.onnx`); el repositorio incluye también la exportación ONNX sin cuantizar |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (exportado con `optimum-cli export onnx --task text-classification`) |

## Arquitectura y entrenamiento

El modelo subyacente es `ShantanuT01/vanguard-ai-text-detector`, construido sobre ModernBERT-large y especializado en clasificación binaria de texto (humano frente a generado por IA). ModernBERT es una familia de encoders transformer que moderniza la arquitectura BERT clásica con mejoras como atención con RoPE, capas de atención lineal para secuencias largas y un vocabulario revisado; en esta ficha no se dispone del detalle exacto de la configuración de capas y dimensiones empleada por el autor original.

Esta versión concreta no aporta entrenamiento nuevo: el autor declara explícitamente que no se reentrenaron pesos. El proceso consiste en una exportación a ONNX con Optimum y una cuantización dinámica con `onnxruntime.quantization.quantize_dynamic` usando `weight_type=QInt8`. No se documentan en la información disponible los datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card del modelo base.

## Capacidades

- Clasificación binaria de texto en inglés: distingue entre texto escrito por humanos y texto generado por IA.
- Ejecución en navegador mediante transformers.js y ONNX Runtime Web, sin backend ni envío de datos a servidores.
- Inferencia sobre CPU en el cliente gracias a la cuantización int8 dinámica.
- Salida de probabilidad por clase, apta para aplicar umbrales configurables (el autor reporta métricas con umbral 0,5).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador.
- Sin capacidades multilingües: entrenado y evaluado para inglés.

## Casos de uso

- Detección de texto generado por IA en formularios web: el modelo puede ejecutarse en el navegador del usuario para marcar envíos sospechosos (por ejemplo, reseñas, comentarios o solicitudes) sin que el contenido salga del cliente, lo que reduce riesgos de privacidad y cumple con requisitos de protección de datos.
- Moderación de contenido en comunidades y foros: integrado como paso previo a la revisión humana, permite priorizar mensajes con alta probabilidad de ser generados por IA y aplicar políticas editoriales de forma escalable.
- Verificación de originalidad en plataformas educativas: permite señalar entregas con alta probabilidad de haber sido escritas por un modelo, usando el umbral de decisión ajustado al coste relativo de falsos positivos y falsos negativos.
- Filtrado de datasets de entrenamiento: al procesar grandes corpus en inglés, el clasificador puede etiquetar documentos sintéticos para excluirlos o ponderarlos antes de entrenar otros modelos.
- Extensiones de navegador y herramientas de escritura: al ser un ONNX int8 compatible con transformers.js, puede empaquetarse en una extensión que analice el texto de un cuadro de edición en tiempo real y avise al usuario.
- Análisis de reseñas y opiniones de producto: detección de reseñas generadas masivamente por IA en marketplaces, con ejecución local para no exponer datos de usuarios a terceros.
- Investigación sobre detección de texto sintético: sirve como línea base reproducible en formato ONNX para comparar con otros detectores y para estudiar el comportamiento de las métricas bajo distintos umbrales.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los declarados en la model card para la versión int8:

| Metrica | Valor |
|---|---|
| AUROC (int8) | 0,984 |
| Deteccion de texto IA con 1 % de falsos positivos | 91,9 % |
| Falsos positivos sobre texto humano con umbral 0,5 | 2,0 % |

No se han publicado en la información disponible resultados comparativos con otros detectores (MMLU, HumanEval, GSM8K u otros) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: al ser un encoder de clasificación cuantizado a int8 y con un repositorio de 0,4 GB, puede ejecutarse en CPU sin GPU dedicada; en GPU, el consumo de memoria es muy inferior al de un modelo generativo del mismo tamaño nominal.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 en adelante) acelera la inferencia, pero no es un requisito; el caso de uso principal es CPU en navegador.
- Cabe en GPU de consumo: sí, con amplio margen, incluso en iGPU y en CPU de portátiles modernos.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime (CPU o GPU), y cualquier runtime compatible con ONNX; no está pensado para vLLM, TGI o llama.cpp, que no aplican a clasificadores encoder de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| `musssss/ai-detector-en-onnx` (esta ficha) | ModernBERT-large (cifra exacta no disponible) | no disponible | Detección de texto IA, inglés | MIT | ONNX int8 |
| `ShantanuT01/vanguard-ai-text-detector` | ModernBERT-large (cifra exacta no disponible) | no disponible | Detección de texto IA, inglés | MIT | safetensors |
| Detectores clásicos tipo GPTZero / OpenAI detector | no disponible | no disponible | Detección de texto IA | propietaria / servicio | API |

La comparación con alternativas de la misma categoría (por ejemplo, clasificadores RoBERTa fine-tuneados para detección de IA) no está disponible en la información proporcionada; no se han encontrado datos de rendimiento de esos modelos en esta búsqueda.

## Limitaciones y advertencias

- Solo inglés: el modelo no está entrenado ni evaluado para otros idiomas, por lo que su uso en castellano u otras lenguas producirá resultados poco fiables.
- Riesgo de falsos positivos: el autor declara un 2,0 % de falsos positivos sobre texto humano con umbral 0,5; en usos con consecuencias (evaluación académica, moderación) ese porcentaje puede ser inaceptable sin revisión humana.
- Degradación frente a texto editado o parafraseado: los detectores de texto IA pierden eficacia cuando el texto generado se reescribe o se somete a perturbaciones; no se documenta en la información disponible el comportamiento en esos escenarios.
- Sesgos del corpus de entrenamiento: al no documentarse la composición del dataset original, no es posible evaluar sesgos por dominio, registro o variedad dialectal.
- Naturaleza probabilística: la salida es una probabilidad, no una prueba; cualquier decisión automatizada debe calibrarse con umbrales propios y validación sobre datos del dominio de uso.
- Licencia MIT: permite uso comercial y modificación, pero el autor original del modelo base debe acreditarse; conviene revisar la model card del modelo base por si añade condiciones adicionales.
- Conversión no verificada de forma independiente: las métricas reportadas son las del autor de la conversión y no se han reproducido en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/musssss/ai-detector-en-onnx
- Modelo base: https://huggingface.co/ShantanuT01/vanguard-ai-text-detector
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Documentación de Optimum (exportación ONNX): https://huggingface.co/docs/optimum
- ONNX Runtime: https://onnxruntime.ai
