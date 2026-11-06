# Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0

## Resumen

El modelo `Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante un proceso de compresión basado en descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. El autor, Jeesup, publica este artefacto como parte de un piloto de evaluación de seguridad, no como un modelo listo para producción. Se elimina nominalmente un 40% de los parámetros de proyección, lo que se traduce en una fracción de parámetros factoriales del 0,652173 respecto al modelo original, sin fine-tuning de recuperación posterior.

El interés técnico reside en la metodología: el autor combina momentos de entrada de WikiText con momentos de pares prompt dañino/respuesta segura (ponderados a 0,1) para construir una métrica mixta que guíe la compresión. El objetivo de entrenamiento pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos, usando 128 y 40 ejemplos respectivamente, con conjuntos de validación separados de 32 y 12 ejemplos.

No obstante, se trata de un checkpoint con pesos densos "plegados" (folded dense matrices) para facilitar la evaluación, no de una representación factorial optimizada para inferencia. El propio autor advierte que este upload no proporciona inferencia factorizada ni demuestra una aceleración real. La relevancia actual es metodológica: explora si es posible desplazar el comportamiento de seguridad de un modelo durante la compresión, un área poco documentada frente a la compresión puramente orientada a rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct, tipicamente 8192 tokens, pero no confirmado aqui) |
| Tipos de cuantizacion | No disponible; el repo contiene safetensors en precision original |
| Idiomas soportados | No disponible |
| Licencia | Llama 3 (llama3) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3 8B Instruct: un transformer decoder-only con atención multi-cabeza agrupada (GQA), RoPE y normalización RMSNorm. Sobre esta base, el autor aplica una compresión SVD con eliminación nominal del 40% de los parámetros de proyección. La fracción de parámetros factoriales realizada en el modelo completo es de 0,652173. No hay fine-tuning de recuperación tras la compresión.

La innovación metodológica está en la métrica de entrada mixta: se combinan momentos de segundo orden calculados sobre WikiText con momentos calculados sobre pares de prompt dañino y respuesta segura, estos últimos escalados por 0,1. Ambos conjuntos de datos se renderizan con sus propias plantillas de chat y se perfilan con sus propios pesos densos. El autor describe explícitamente el enfoque como un "piloto unilateral, no un SVD completo consciente de Fisher". Los hiperparámetros declarados son: desplazamiento relativo rho = 0,0, lambda global = 0,0 y ridge = 1e-05. La función objetivo combina CE de respuesta segura ante prompt dañino y CE de respuesta útil ante prompt benigno con pesos iguales, calculada sobre 128 y 40 ejemplos respectivamente; la validación usa 32 y 12 ejemplos separados, aunque el autor advierte que el corpus de métrica mixta es más amplio, por lo que estos ejemplos están retenidos del gradiente pero no son completamente invisibles a la calibración.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Llama 3 8B Instruct, sujetos a la degradación introducida por la compresión.
- Seguimiento de instrucciones y formato de chat mediante la plantilla de Llama 3.
- Evaluación de seguridad: el checkpoint incorpora archivos de evaluación con generaciones sobre AdvBench y juicios HarmBench, además de XSTest y los primeros 500 prompts de OR-Bench evaluados con WildGuard.
- Capacidad multilingüe: no confirmada en la información disponible; se hereda la del modelo base sin verificación específica.
- Tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; la compresión agresiva sin recuperación hace improbable un rendimiento fiable en estas tareas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre compresión consciente de seguridad: el checkpoint sirve como punto de comparación para estudiar si la eliminación de parámetros vía SVD desplaza la tasa de respuestas inseguras (ASR) medida con AdvBench y HarmBench. Es su uso principal declarado.
- Reproducción de experimentos de SVD: el repositorio incluye `experiment/` con ajustes exactos, pérdidas de validación y código fuente, lo que permite replicar el pipeline de compresión y las métricas.
- Análisis de diagnóstico por matriz: el archivo `compression.json` contiene diagnósticos por matriz que permiten estudiar qué capas concentran la pérdida de capacidades o el cambio de comportamiento.
- Evaluación de coherencia tras compresión: los archivos de evaluación incluyen PPL sobre WikiText-2, lo que permite cuantificar la degradación del modelado de lenguaje frente al modelo base.
- Estudio de calibración con datos de seguridad: el uso de momentos mixtos WikiText + pares dañino/seguro es un caso práctico para investigar cómo la elección del corpus de calibración afecta al comportamiento final.
- Benchmarking de pipelines de evaluación de seguridad: la combinación de XSTest, OR-Bench con WildGuard y AdvBench/HarmBench ofrece un arnés reutilizable para comparar checkpoints comprimidos.
- Docencia y formación: útil para ilustrar los compromisos entre compresión, coherencia y alineación de seguridad en cursos de ingeniería de modelos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que los archivos de evaluación contienen PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en la información consultada. El autor advierte además que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB. No obstante, el repositorio solo distribuye safetensors en precisión original, por lo que habría que cuantizar localmente.
- GPU recomendadas: A100 40/80 GB, H100, L40S para evaluación por lotes; RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 3090 (24 GB) igualmente viable.
- GPU de consumo: cabe en RTX 4090, 3090, 4080 (16 GB, justo en FP16), y en GPUs de 8 GB solo tras cuantización a 4 bits.
- Opciones de despliegue: transformers con PyTorch es la vía directa al ser pesos densos estándar; llama.cpp u Ollama requieren conversión a GGUF; vLLM y TGI son posibles tras convertir los pesos al formato esperado.
- Latencia y throughput: no disponibles. El autor señala explícitamente que este upload no establece una aceleración, ya que los pesos están plegados a formato denso y no se distribuye una representación factorial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0 | 8,03 B (densos plegados) | No disponible | Compresión SVD con sesgo de seguridad, piloto | Llama 3 | Hugging Face, 13 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8192 tokens | Modelo base original, alineado con RLHF | Llama 3 | Hugging Face, ampliamente usado |
| Modelos comprimidos tipo SVD-LLM / SliceGPT sobre Llama 3 8B | ~5-6 B efectivos | 8192 tokens | Compresión orientada a rendimiento | Llama 3 | Repos de investigación variables |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128k tokens | Generación posterior con contexto extendido | Llama 3.1 | Hugging Face |

La comparación directa con alternativas de compresión es difícil porque este checkpoint no publica métricas de rendimiento ni de velocidad, y su objetivo es el estudio de seguridad, no la eficiencia. Frente al modelo base, la diferencia principal es la reducción de parámetros factoriales (fracción 0,652173) y la calibración con datos de seguridad; frente a Llama 3.1 8B Instruct, la ventana de contexto es presumiblemente menor (8k frente a 128k), aunque no se confirma en la documentación.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe como piloto y advierte que las mediciones no constituyen una garantía de seguridad.
- Sin fine-tuning de recuperación: la eliminación del 40% de parámetros de proyección degrada previsiblemente la coherencia y el rendimiento general; debe inspeccionarse la PPL y la fracción de respuestas puntuadas junto al ASR.
- Pesos densos plegados: no se distribuye inferencia factorizada, por lo que no hay ahorro de memoria ni aceleración respecto al modelo base en este formato.
- Metodología parcial: el propio autor califica el enfoque como "SVD unilateral, no consciente de Fisher completo"; los resultados no deben extrapolarse a pipelines de compresión más sofisticados.
- Fuga de calibración potencial: los ejemplos de validación están retenidos del gradiente, pero el corpus mixto es más amplio, por lo que no son completamente invisibles.
- Sesgos: no documentados específicamente; se heredan los del modelo base Llama 3 8B Instruct, sin mitigación adicional conocida.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión sin recuperación tiende a incrementarlo.
- Idiomas: no confirmados; la evaluación se centra en inglés (WikiText-2, AdvBench, XSTest, OR-Bench).
- Licencia Llama 3: impone restricciones de uso comercial (política de uso aceptable de Meta, umbral de 700 millones de usuarios mensuales, obligación de atribución "Built with Meta Llama 3"). Verificar los términos completos antes de cualquier despliegue.
- No apto para producción: sin benchmarks de latencia, throughput ni evaluación de robustez, y con solo 13 descargas y 0 likes, no hay validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Repositorio de evaluación incluido en el propio repo: carpeta `experiment/` y archivo `compression.json` (según la model card)
- No se han encontrado en la información proporcionada papers, blogs, repositorios externos ni demos adicionales.
