# jasort/gsat-gemma3-1b-it-webgpu-20260925-130441

## Resumen

`jasort/gsat-gemma3-1b-it-webgpu-20260925-130441` es una adaptación comunitaria de `google/gemma-3-1b-it` orientada a la generación de ejemplos de inglés para el examen de acceso universitario de Taiwán (GSAT, 學測). El autor aplicó un ajuste fino con LoRA sobre 256 muestras originales de ese dominio, fusionó los pesos, exportó el resultado a ONNX y lo cuantizó a int4 weight-only en bloques de 32, con el objetivo declarado de servir únicamente inferencia web mediante Transformers.js y WebGPU.

El interés del artefacto no está en la calidad del modelo en sí, sino en el formato: es un ejemplo de extremo a extremo de cómo convertir un modelo de 1B parámetros en un paquete listo para ejecutarse en el navegador con `dtype: "q4"`, un caso cada vez más relevante para aplicaciones educativas que necesitan inferencia local, sin servidor y con privacidad por diseño. El repositorio ocupa 0,9 GB y solo publica los artefactos ONNX cuantizados, la configuración y el tokenizer; no se distribuyen los pesos FP32 fusionados.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con advertencias explícitas del propio autor sobre la ausencia de validación de calidad lingüística. Debe evaluarse como demostración técnica de un pipeline de cuantización, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`gemma3_text`) con atención de ventana deslizante (capas locales y globales) |
| Parametros totales | 1B (heredados del modelo base `google/gemma-3-1b-it`) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el modelo base de 1B (el resto de la familia Gemma 3 llega a 128K) |
| Tipos de cuantizacion | int4 weight-only con bloque de 32 (etiquetado como `q4`); se selecciona en Transformers.js con `dtype: "q4"` |
| Idiomas soportados | `en` y `zh` (el ajuste fino está orientado a chino tradicional) |
| Licencia | Gemma (Gemma Terms of Use), sujeta además a la política de usos prohibidos y al NOTICE |
| Formato de pesos | ONNX con external data, cuantizado a int4; no se publican pesos FP32 fusionados |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Gemma 3, que Google DeepMind publicó en escalas de 1B a 27B con soporte multimodal a partir de los 4B. Según el informe técnico de Gemma 3, la familia introduce atención con ventana deslizante que reduce el crecimiento de la caché KV en contextos largos, eleva la frecuencia base de RoPE de 10.000 a 1.000.000 en las capas de atención global y la mantiene en 10.000 en las locales, y admite 128K tokens de contexto salvo en el modelo de 1B, limitado a 32K. El modelo de 1B es la variante solo texto de la familia.

El ajuste fino de esta ficha se realizó con LoRA sobre 256 muestras originales orientadas al GSAT, seguido de la fusión de adaptadores, la exportación a ONNX y una cuantización int4 weight-only con bloques de 32. El autor no documenta el rango de hiperparámetros, la composición exacta del dataset ni si hubo etapas adicionales de post-entrenamiento más allá de las que ya trae el modelo instructivo de Google.

La innovación destacable es de ingeniería de despliegue, no de modelado: el paquete incluye un informe de exportación y un fichero `upload_preflight.json` que registra las comprobaciones previas a la subida. El propio autor indica que se saltó el paso 7 del pipeline (generación y validación de calidad en CPU con Node) y que antes de subir solo se verificaron la estructura del ONNX q4, los datos externos, la configuración, el tokenizer y el informe de exportación.

## Capacidades

- Generación de texto en inglés orientada a ejemplos y vocabulario de tipo examen de acceso universitario.
- Generación de texto y traducción básica entre inglés y chino (`en`, `zh`), con orientación a chino tradicional.
- Ejecución de instrucciones heredada del modelo base instruction-tuned, aunque potencialmente degradada por el ajuste fino de dominio y la cuantización int4.
- Inferencia local en navegador mediante Transformers.js con WebGPU, sin backend ni envío de datos a servidores.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente, razonamiento multi-paso explícito ni modo de pensamiento.
- No hay soporte de visión: el modelo de 1B de Gemma 3 es solo texto, a diferencia de las variantes de 4B en adelante.
- No hay soporte de audio.

## Casos de uso

- Aplicación web de práctica de inglés para el GSAT: el modelo puede generar frases de ejemplo con vocabulario de examen directamente en el navegador del estudiante, sin coste de servidor ni latencia de red, gracias al paquete ONNX int4 y a WebGPU.
- Prototipos de IA en el navegador con requisitos estrictos de privacidad: al ejecutarse en local, ningún texto del usuario sale del dispositivo, lo que encaja en entornos escolares con datos de menores.
- Generador de material didáctico complementario: producción de ejemplos originales de vocabulario y estructuras gramaticales para profesores que preparan ejercicios de repaso, evitando reproducir ítems oficiales del examen.
- Glosas y apoyo bilingüe inglés-chino tradicional: explicación de términos o traducción de apoyo para estudiantes sinohablantes, dentro de los límites de calidad advertidos por el autor.
- Demostración técnica de cuantización ONNX int4 en WebGPU: el repositorio sirve como referencia reproducible para evaluar el rendimiento y la degradación de un modelo de 1B tras cuantizar en bloques de 32.
- Aplicación educativa offline o PWA en aulas con conectividad limitada: al requerir solo 0,9 GB de artefactos, puede cachearse en el navegador y funcionar sin conexión una vez descargado.
- Chatbot de repaso en hardware de gama baja: dispositivos móviles o portátiles sin GPU dedicada con soporte WebGPU pueden ejecutar el modelo, algo inviable con variantes de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que se omitió el paso de generación y verificación de calidad y que las comprobaciones automáticas realizadas no demuestran la naturalidad del inglés, la corrección de la traducción a chino tradicional ni la exactitud de los significados.

## Requisitos de hardware

- Inferencia en navegador: el repositorio completo ocupa 0,9 GB, correspondientes al ONNX int4, los datos externos, la configuración y el tokenizer.
- Huella de memoria estimada: en torno a 0,5-0,9 GB para los pesos cuantizados, más el overhead del runtime de WebGPU y de la caché KV (que crece con el contexto, hasta 32K tokens).
- GPU compatibles: cualquier GPU o iGPU con soporte WebGPU (navegadores Chromium recientes); no se requieren GPUs de centro de datos.
- Cabe holgadamente en GPU de consumo y en dispositivos integrados; está pensado para portátiles y móviles.
- Opciones de despliegue documentadas: Transformers.js con `device: "webgpu"` y `dtype: "q4"`. El autor no documenta vLLM, TGI, llama.cpp ni Ollama, y al no publicarse GGUF ni pesos FP32, esos backends requerirían reexportar desde el modelo base.
- Estado de compatibilidad móvil: el autor señala que en iOS 26 / Safari 26 todavía hace falta probarlo en dispositivo real.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los valores de los modelos alternativos son datos de referencia de sus fichas públicas y conviene verificarlos antes de usarlos en una decisión de producción.

| Modelo | Parametros | Contexto | Licencia | Formatos publicados |
|---|---|---|---|---|
| `jasort/gsat-gemma3-1b-it-webgpu-20260925-130441` | 1B | 32K | Gemma | ONNX int4 (solo inferencia web) |
| `google/gemma-3-1b-it` | 1B | 32K | Gemma | safetensors (Transformers) |
| `meta-llama/Llama-3.2-1B-Instruct` | ~1,2B | 128K | Llama 3.2 Community | safetensors, GGUF |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,5B | 32K | Apache 2.0 | safetensors, GGUF |
| `HuggingFaceTB/SmolLM2-1.7B-Instruct` | 1,7B | 8K | Apache 2.0 | safetensors, GGUF |

Frente a estas alternativas, el modelo de esta ficha destaca únicamente por su empaquetado para navegador y por su especialización en el dominio GSAT; en parámetros, contexto y disponibilidad de formatos queda por detrás de Llama 3.2 1B (contexto mayor) y de Qwen2.5 1.5B y SmolLM2 1.7B (licencias permisivas Apache 2.0, sin las restricciones de uso de Gemma). No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Ajuste fino sobre solo 256 muestras: riesgo alto de sobreajuste al dominio y de degradación de capacidades generales respecto al modelo base.
- Sin validación de calidad: el autor confirma que se omitió el paso de generación y verificación, y que las comprobaciones automáticas no garantizan naturalidad del inglés, corrección de la traducción ni exactitud semántica.
- Riesgo de alucinación: es un modelo de 1B cuantizado a int4; no debe usarse como fuente de verdad lingüística o factual sin revisión humana.
- Riesgo de confusión con material oficial: el autor prohíbe explícitamente presentar las salidas como ítems reales del examen GSAT.
- Idiomas: cobertura limitada a inglés y chino; no hay soporte documentado de castellano ni de otras lenguas.
- Contexto limitado a 32K tokens (frente a 128K en el resto de Gemma 3) y caché KV que crece con el contexto en función del runtime.
- Licencia Gemma: impone condiciones de uso, política de usos prohibidos y obligaciones de NOTICE; conviene revisarlas antes de cualquier uso comercial o redistribución.
- Compatibilidad móvil sin verificar: el comportamiento en iOS 26 / Safari 26 no está probado en dispositivo real.
- Trazabilidad: no se publican los pesos fusionados ni el dataset, lo que dificulta auditar el ajuste fino o reproducirlo.
- Madurez: cero descargas y cero likes, sin señales de uso en producción ni mantenimiento posterior a la subida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jasort/gsat-gemma3-1b-it-webgpu-20260925-130441
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Página de Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 Technical Report (arXiv, resumen): https://arxiv.org/abs/2503.19786
- Gemma 3 Technical Report (arXiv, HTML): https://arxiv.org/html/2503.19786
- Gemma 3 Technical Report (PDF): https://storage.googleapis.com/deepmind-media/gemma/Gemma3Report.pdf
