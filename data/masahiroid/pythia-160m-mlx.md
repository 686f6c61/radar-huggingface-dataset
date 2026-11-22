# masahiroid/pythia-160m-mlx

## Resumen

`masahiroid/pythia-160m-mlx` es una conversión no oficial al framework MLX de Apple del modelo base `EleutherAI/pythia-160m`, perteneciente a la suite Pythia de EleutherAI. Pythia es un conjunto de modelos entrenados con orden de datos y arquitectura idénticos a distintas escalas, diseñado específicamente para investigación en interpretabilidad y dinámica de entrenamiento de LLMs. Este repositorio no aporta pesos nuevos: reproduce en formato MLX (float16, safetensors) el checkpoint original de 160 millones de parámetros.

El modelo emplea una arquitectura transformer de tipo GPT-NeoX con 162.322.944 parámetros reales según los safetensors del repositorio. Al ser un modelo base sin ajuste por instrucciones, su función es la continuación de texto, no el seguimiento de instrucciones conversacionales. Su relevancia actual es acotada y muy específica: sirve como pieza ligera y reproducible para experimentos de interpretabilidad, docencia y pruebas de pipelines MLX en hardware Apple Silicon, donde el consumo medido es de aproximadamente 0,35 GB de memoria pico.

La conversión la mantiene el usuario masahiroid, incluye una auditoría frente al modelo original mediante la herramienta `model-audit-lite` (formato de pesos, código incluido y linaje legible por máquina) y se distribuye bajo licencia Apache 2.0. No debe confundirse con un modelo listo para producción conversacional: es una herramienta de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX (`gpt_neox`) |
| Parametros totales | 162.322.944 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Pythia-160m usa 2048 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en float16 |
| Idiomas soportados | ingles (entrenamiento principal); la model card declara tambien japones en metadatos, sin garantia de calidad |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Framework | MLX (`mlx-lm`) |
| Precision publicada | float16 |
| Memoria pico medida | ~0,35 GB |
| Tamano del repositorio | 0,3 GB |
| Modelo base | `EleutherAI/pythia-160m` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-NeoX, con atención causal estándar y sin mecanismos híbridos ni atención lineal. El repositorio no entrena el modelo: convierte los pesos de `EleutherAI/pythia-160m` a formato MLX en float16. Por tanto, los datos de entrenamiento, el número de tokens y la composición del corpus corresponden al modelo original de EleutherAI (The Pile), no a esta conversión, y no se detallan en la información disponible de este repositorio.

La innovación relevante de la familia Pythia no es arquitectónica sino metodológica: todos los modelos de la suite comparten orden de datos y configuración, lo que permite estudiar cómo emergen capacidades y sesgos a distintas escalas. Esta conversión añade una capa de auditoría reproducible (`SECURITY.md` con checksums y ML-BOM) que verifica que los pesos convertidos coinciden con el upstream. No se documenta RLHF, DPO ni ningún ajuste posterior.

## Capacidades

- Generación de texto por continuación de secuencia (modelo base, no instruct).
- Razonamiento y matemáticas: capacidades muy limitadas por escala (160M), sin datos de benchmark publicados en este repositorio.
- Código: sin soporte específico ni evaluación publicada.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado de forma nativa.
- Multilingüe: entrenamiento predominantemente en inglés; el metadato declara japonés, pero sin evaluación de calidad.
- Capacidades especiales: ninguna (sin visión, audio ni modo thinking).
- Ejecución nativa en Apple Silicon mediante MLX, con carga en `mlx-lm`.

## Casos de uso

- Investigación en interpretabilidad: análisis de activaciones, atención y representaciones internas en un modelo pequeño y reproducible, aprovechando la uniformidad de la suite Pythia para comparar escalas.
- Docencia y formación: demostraciones de continuación de texto y de mecánica de transformers en portátiles con Apple Silicon, con un consumo de ~0,35 GB que cabe en cualquier Mac moderno.
- Pruebas de pipelines MLX: validación de flujos `mlx-lm` (carga, generación, cuantización posterior) antes de escalar a modelos mayores, gracias a su reducido tamaño de descarga (0,3 GB).
- Generación de texto auxiliar de bajo coste: completado de plantillas, expansión de frases o generación de datos sintéticos rudimentarios en entornos con recursos mínimos.
- Reproducibilidad y auditoría de cadena de suministro: uso del ML-BOM y los checksums incluidos para verificar integridad de artefactos en pipelines de CI, como ejemplo de buenas prácticas.
- Evaluación comparativa de frameworks: medición de latencia y throughput de MLX frente a otros runtimes sobre el mismo checkpoint base.
- Filtrado o clasificación simple por perplejidad: puntuación de textos mediante log-probabilidades del modelo en tareas de investigación lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: ~0,35 GB en float16 según medición del autor; en cuantizaciones de 8 o 4 bits el consumo sería inferior, aunque no se publican pesos cuantizados.
- GPU recomendadas: no requiere GPU dedicada; está pensado para Apple Silicon (M1, M2, M3, M4 y posteriores) mediante MLX.
- GPU consumer: cabe holgadamente en cualquier GPU con más de 1 GB de VRAM (RTX 3060, RTX 4090, etc.), aunque el repositorio no está optimizado para CUDA.
- Despliegue: `mlx-lm` (CLI `mlx_lm.generate` y API Python `load`/`generate`). Para otros runtimes sería necesario reconvertir desde el modelo base original (por ejemplo a GGUF para llama.cpp u Ollama), no incluido en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `masahiroid/pythia-160m-mlx` | 162,3 M | no disponible | MLX, float16 | Apache 2.0 | Conversión comunitaria auditada |
| `EleutherAI/pythia-160m` | 160 M | 2048 (modelo original) | PyTorch/safetensors | Apache 2.0 | Upstream oficial, base de esta conversión |
| `EleutherAI/pythia-410m` | 410 M | 2048 (modelo original) | PyTorch/safetensors | Apache 2.0 | Misma suite, mayor escala para comparativas de interpretabilidad |
| `google/bert_uncased_L-12` (referencia encoder) | ~110 M | 512 | PyTorch | Apache 2.0 | Alternativa pequeña, pero encoder y no generativa |

No se dispone de comparativas de rendimiento (benchmarks) entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue órdenes ni mantiene formato de chat; solo continúa texto.
- Escala muy reducida (160M): alta propensión a incoherencias, repeticiones y errores factuales; el riesgo de alucinación es elevado para cualquier uso informativo.
- Sesgos: hereda los sesgos del corpus de entrenamiento original (The Pile), no documentados en este repositorio.
- Idiomas: el entrenamiento es predominantemente en inglés; el soporte de japonés declarado en metadatos no está evaluado.
- Contexto: la longitud de contexto no se especifica en la información de esta conversión; no asumir ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una conversión comunitaria no oficial conviene verificar la procedencia y los checksums antes de integrarla en producción.
- Producción: no recomendado como modelo de servicio al cliente ni de generación de código; su valor es investigador y educativo.
- Compatibilidad: limitado al ecosistema MLX; no funciona directamente en CUDA sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/masahiroid/pythia-160m-mlx
- Modelo base: https://huggingface.co/EleutherAI/pythia-160m
- Framework MLX: https://github.com/ml-explore/mlx
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
- Documento de seguridad del repositorio: https://huggingface.co/masahiroid/pythia-160m-mlx/blob/main/SECURITY.md
