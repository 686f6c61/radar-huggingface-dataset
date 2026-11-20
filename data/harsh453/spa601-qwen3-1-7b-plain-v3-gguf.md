# Harsh453/SPA601-Qwen3-1.7B-Plain-v3-GGUF

## Resumen

SPA601-Qwen3-1.7B-Plain-v3-GGUF es un ajuste fino experimental del modelo Qwen3-1.7B, desarrollado por el usuario Harsh453 y publicado en Hugging Face. Se presenta como un prototipo de investigación para un tutor de texto plano orientado a la asignatura SPA601, construido sobre la revisión 4-bit de MLX (`mlx-community/Qwen3-1.7B-4bit`) y exportado a formato GGUF para su uso con llama.cpp. El modelo conserva la licencia Apache 2.0 y el pipeline de generación de texto del modelo base.

El modelo parte de una arquitectura transformer densa de aproximadamente 1.720 millones de parámetros (1,72 B), con un tamaño de repositorio de 1,1 GB en formato GGUF. El autor lo entrena con LoRA sobre un corpus de recursos didácticos alineados con un temario de 64 conceptos, 26 operaciones con fórmulas y variantes numéricas sintéticas, con el objetivo de servir como tutor conversacional en texto plano.

La relevancia de esta ficha es doble: por un lado, documenta un caso de ajuste fino de bajo coste sobre Qwen3-1.7B; por otro, el propio autor advierte explícitamente de que la exportación falló la evaluación científica y aritmética independiente, con solo 21 de 132 pruebas superadas (0 de 52 numéricas). Es, por tanto, un ejemplo de modelo experimental que no debe usarse como fuente fiable de respuestas científicas ni como clave de corrección automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B); ajuste fino LoRA |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el autor publica al menos Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); base original en MLX 4-bit |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B. Sobre esa base de 4 bits (MLX) se aplica un ajuste fino con LoRA. El checkpoint seleccionado corresponde a la época sexta, con SHA-256 `d6f0c74e4d532f85469b6f848e830c29b04b590a85ac9d97f1c12aea30d7964e`. El entrenamiento se reinició desde el estado del optimizador tras el paso 2080.

Los datos de entrenamiento consisten en recursos didácticos de autor alineados con un temario: 64 conceptos focalizados, 26 operaciones con fórmulas, variantes numéricas sintéticas y ejemplos de aclaración. Los tres PDF de usuario citados se usaron como referencias del temario. El autor advierte de que los conjuntos de entrenamiento, validación y test comparten conceptos (aunque difieren en formulaciones y parámetros numéricos), por lo que la evaluación no es un indicador limpio de generalización.

La exportación se realizó fusionando y des-cuantizando desde una base ya en 4 bits, convirtiendo con una versión fijada de llama.cpp y volviendo a cuantizar. Esto implica que el modelo no puede recuperar la información de precisión completa del base original. El autor indica que la plantilla por defecto es la de no-thinking, aunque una aplicación puede sobrescribirla; recomienda desactivar Think y usar `PHONE-PROMPT.txt`.

## Capacidades

- Generación de texto conversacional en inglés, orientada a un rol de tutor de texto plano.
- Razonamiento y explicación de conceptos del temario SPA601 (64 conceptos, 26 operaciones con fórmulas) según los datos de entrenamiento del autor.
- Soporte de plantilla de chat con modo thinking (Qwen3), desactivable por la aplicación.
- Entrada exclusivamente de texto: no incluye codificador de imagen, OCR, acceso a internet, base de recuperación, calculadora ni ejecutor de herramientas en los pesos GGUF.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.
- Capacidades multilingües limitadas al inglés declarado; no se documentan otros idiomas.
- Formato de texto enriquecido "fomentado, nunca garantizado" según el autor.

## Casos de uso

- Prototipo de tutor conversacional en inglés: el modelo puede mantener diálogos de texto sobre los conceptos del temario SPA601, útil para experimentación académica sobre ajuste fino de bajo coste.
- Investigación sobre LoRA en modelos pequeños: sirve como caso de estudio reproducible de ajuste fino sobre Qwen3-1.7B con exportación a GGUF.
- Pruebas de despliegue en móvil con llama.cpp: el tamaño de 1,1 GB y la cuantización Q4_K_M permiten experimentar con inferencia local en dispositivos, aunque el autor exige tests en el dispositivo objetivo para velocidad, memoria y comportamiento offline sostenido.
- Evaluación de robustez y alucinación: dado que el autor documenta fallos en paráfrasis y fabricación de números, el modelo puede usarse como caso negativo en bancos de pruebas de fiabilidad.
- Generación de borradores de explicaciones didácticas: con revisión humana obligatoria, para producir texto de apoyo que luego se valide contra referencias de autor.
- Integración en pipelines de experimentación con plantillas de chat: permite probar el efecto de activar o desactivar el modo thinking y de distintos prompts en un modelo pequeño.

## Benchmarks y rendimiento

El autor publica una pantalla automatizada sobre 132 casos retenidos, todos en texto plano:

| Metrica | Resultado |
|---|---|
| Casos superados (pantalla automatica) | 21/132 |
| Casos numericos superados | 0/52 |

El propio autor aclara que este dato no es un porcentaje de precisión científica. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1,72 B en Q4_K_M el peso de los archivos ronda 1,1 GB, por lo que la huella en memoria es modesta, pero el autor no publica cifras medidas.
- GPU recomendadas: no disponible; el autor no especifica GPU de referencia.
- Compatibilidad con GPU de consumo: plausible por tamaño, pero no confirmada por el autor; requiere pruebas en el dispositivo objetivo.
- Opciones de despliegue: llama.cpp (librería declarada) y cualquier runtime compatible con GGUF; el autor menciona explícitamente `llama.cpp` y un flujo móvil.
- Latencia y throughput: no disponibles; el autor indica que velocidad, memoria y comportamiento offline sostenido requieren tests en el dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SPA601-Qwen3-1.7B-Plain-v3-GGUF | 1,72 B | no disponible | apache-2.0 | GGUF | Ajuste experimental; 21/132 en pantalla propia |
| Qwen3-1.7B (base) | 1,72 B | no disponible en esta ficha | según Qwen | safetensors, GGUF | Modelo base upstream; sin ajuste SPA601 |
| mlx-community/Qwen3-1.7B-4bit | 1,72 B | no disponible en esta ficha | según Qwen | MLX 4-bit | Base directa del ajuste; cuantización MLX |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que la exportación falló la evaluación científica y aritmética independiente: 21/132 casos superados y 0/52 numéricos.
- El modelo puede dar explicaciones incorrectas pero convincentes, fabricar números, repetir texto y fallar ante paráfrasis.
- No está aprobado para tutoría científica fiable de forma autónoma ni como clave de corrección incuestionable.
- Entrada solo de texto: sin OCR, sin acceso a internet, sin recuperación, sin calculadora ni ejecutor de herramientas en los pesos.
- La exportación desde una base ya en 4 bits impide recuperar la información de precisión completa del modelo original.
- Los conjuntos de entrenamiento, validación y test comparten conceptos, lo que limita la validez de la evaluación.
- Más épocas no garantizan fiabilidad, según el autor.
- Idiomas: solo inglés declarado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no avala el uso en producción como tutor fiable; se recomienda revisar atribuciones del modelo upstream Qwen.
- El formato de texto enriquecido no está garantizado.
- El comportamiento en móvil (importación, velocidad, memoria, offline sostenido) requiere pruebas en el dispositivo objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Harsh453/SPA601-Qwen3-1.7B-Plain-v3-GGUF
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Resultados citados por el autor: RESULTS.md y RUNTIME-RESULTS.md (en el repositorio del modelo)
- Estado de exportación móvil: mobile/EXPORT-STATUS.json (en el repositorio del modelo)
- Prompt recomendado: PHONE-PROMPT.txt (en el repositorio del modelo)
