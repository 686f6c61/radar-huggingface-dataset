# reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF

## Resumen

DistilQwen3-1.7B-uncensored-GGUF es la variante cuantizada en formato GGUF del modelo DistilQwen3-1.7B-uncensored, desarrollado por Convergent Intelligence LLC (Research Division) bajo el identificador de Hugging Face `reaperdoesntknow`. Se trata de un modelo de lenguaje de 2.031.739.904 parametros (aproximadamente 2,03 mil millones) derivado por destilacion de conocimiento a partir de Qwen3-30B-A3B, un modelo Mixture-of-Experts de 30 mil millones de parametros totales con 3 mil millones activos. El objetivo declarado es trasladar capacidades del profesor a un modelo pequeno orientado a despliegue en el borde (edge) y en CPU.

La relevancia de esta ficha reside en su enfoque metodologico: el autor documenta un pipeline de destilacion basado en lo que denomina "Discrepancy Calculus" y "Topological Knowledge Distillation", con un operador de discrepancia denotado como $Df(x)$ y una descomposicion BV (variacion acotada). Segun la model card, estas fronteras estructurales detectadas durante el entrenamiento quedan codificadas en los pesos y se preservan tras la cuantizacion, de modo que no dependerian de la precision numerica del formato.

El modelo se distribuye en formato GGUF, lo que facilita su ejecucion con llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) en hardware sin GPU dedicada. La etiqueta "uncensored" indica que el autor ha reducido o eliminado los filtros de rechazo habituales del modelo base, lo que tiene implicaciones directas para su uso en produccion. La licencia es Apache 2.0 y el repositorio ocupa 9,0 GB, lo que sugiere la presencia de multiples niveles de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3 (destilado de Qwen3-30B-A3B); detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | 2.031.739.904 (aproximadamente 2,03 mil millones) |
| Parametros activos | No aplica (el modelo destilado no es MoE; el profesor Qwen3-30B-A3B si lo era, con 3B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Multiples variantes GGUF (el tamano del repo, 9,0 GB, implica varios niveles); niveles concretos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base se distribuye presumiblemente en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso de destilacion de conocimiento (knowledge distillation) desde Qwen3-30B-A3B hacia un transformer denso de aproximadamente 2,03 mil millones de parametros. El profesor es un modelo Mixture-of-Experts con 30 mil millones de parametros totales y 3 mil millones activos por token, lo que lo convierte en un profesor de alta capacidad pero costoso de desplegar. El alumno resultante es denso y mucho mas ligero, pensado para inferencia en el borde.

La model card describe un marco matematico propio: "Discrepancy Calculus" (calculo de discrepancias) y "Topological Knowledge Distillation" (destilacion topologica del conocimiento), con un operador de discrepancia $Df(x)$ y una descomposicion en espacios de variacion acotada (BV). Segun el autor, este enfoque identifica fronteras estructurales en el espacio de representaciones del profesor y las transfiere al alumno, de forma que la cuantizacion posterior no las degrada porque estan "horneadas" en los pesos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la innovacion de decodificacion o atencion mas alla de lo heredado de la familia Qwen3.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la naturaleza del modelo base Qwen3 apuntan a un uso principal como asistente de chat.
- Razonamiento y conocimiento general: heredado por destilacion del profesor Qwen3-30B-A3B, aunque con la perdida de capacidad inherente a la reduccion de 30B a 2B parametros.
- Generacion de codigo: la familia del autor incluye variantes especificas de codigo (`Qwen3-1.7B-Coder-Distilled-SFT`), pero esta variante concreta no declara capacidades de codigo en la informacion disponible.
- Modo "uncensored": el autor ha reducido los filtros de rechazo, por lo que el modelo responde a peticiones que el base rechazaria; esto no implica capacidades adicionales, solo menor alineacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo base Qwen3 es multilingue, pero no se confirma el grado de preservacion tras la destilacion.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistencia conversacional en el borde: el modelo, con aproximadamente 2,03 mil millones de parametros y formato GGUF, puede ejecutarse en dispositivos de gama baja (portatiles sin GPU, Raspberry Pi de gama alta, moviles de gama alta) para chatbots locales sin conexion, donde la latencia de red y la privacidad son criticas.
- Prototipado rapido de aplicaciones de chat: gracias a su licencia Apache 2.0 y su tamano reducido, es adecuado para validar pipelines de inferencia con llama.cpp u Ollama antes de escalar a modelos mayores.
- Generacion de texto creativo sin restricciones: la variante "uncensored" permite explorar narrativa, role-play y escritura creativa sin los rechazos del modelo alineado, util en entornos de investigacion sobre alineacion y seguridad.
- Educacion e investigacion sobre destilacion: sirve como caso de estudio reproducible para analizar como se preservan (o no) las capacidades del profesor tras la destilacion y la cuantizacion, dado que el autor publica la metodologia (DOI 10.57967/hf/8165).
- Filtrado y clasificacion de texto en local: con 2B parametros y cuantizacion agresiva, puede desplegarse como clasificador o extractor de informacion en entornos con recursos limitados, aunque sin garantias de rendimiento especificadas.
- Despliegue en entornos aislados (air-gapped): al ser un modelo pequeno y autoejecutable, encaja en sistemas sin acceso a internet donde no se puede llamar a APIs externas, como laboratorios o infraestructuras criticas.
- Base para fine-tuning ligero: su tamano permite ajuste fino con LoRA en una sola GPU consumer, partiendo de un modelo ya destilado y con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con aproximadamente 2,03 mil millones de parametros, las cuantizaciones GGUF tipicas ocuparian en torno a 1,2-1,5 GB (Q4_K_M), 1,8-2,2 GB (Q8_0) y 4,1 GB (F16). Estas cifras son estimaciones basadas en el numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar el modelo en cuantizaciones bajas; una RTX 3060 (12 GB) o superior permite cargar la version F16 completa con contexto amplio. Para mayor throughput, A100 o H100 no son necesarias dado el tamano.
- Compatibilidad con GPU consumer: si, cabe holgadamente en GTX 1650 (4 GB), RTX 3050 (8 GB), RTX 4060 (8 GB) y superiores; tambien en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DistilQwen3-1.7B-uncensored-GGUF (este) | 2,03B | No disponible | Apache 2.0 | GGUF | Destilado de Qwen3-30B-A3B, sin censura |
| Qwen3-1.7B (base oficial) | 1,7B | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Modelo original de Alibaba; alineado y con contexto documentado |
| Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF (mismo autor) | 0,6B | No disponible | Apache 2.0 | GGUF | Variante mas pequena del mismo pipeline, con SFT de "thinking" |
| LFM2.5-1.2B-Distilled-SFT (mismo autor) | 1,2B | No disponible | No disponible | No disponible | Alternativa de otro profesor, orientada a CPU |

La comparativa con modelos de terceros no puede completarse con datos verificados en la informacion disponible; los modelos listados del mismo autor comparten metodologia pero no se dispone de sus especificaciones completas.

## Limitaciones y advertencias

- Riesgo de alucinacion: con 2,03 mil millones de parametros y destilado de un profesor MoE, la fidelidad factica es limitada; no debe usarse como fuente de verdad sin verificacion externa.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento "uncensored" puede amplificar respuestas toxicas o sesgadas al eliminar los filtros del modelo alineado.
- Contenido sin filtros: la etiqueta "uncensored" implica que el modelo puede generar contenido que el base rechazaria; es inadecuado para aplicaciones de cara al publico sin una capa de moderacion adicional.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados; no se puede garantizar un rendimiento multilingue equivalente al de Qwen3.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento de las condiciones del modelo base Qwen3; conviene revisar la licencia de Qwen3-30B-A3B antes de un despliegue comercial.
- Caveat de produccion: la metodologia (Discrepancy Calculus) no ha sido validada de forma independiente en la informacion disponible; los claims sobre preservacion de estructura tras cuantizacion son del autor.
- Trazabilidad: el repositorio tiene pocas descargas (2.705) y me gusta (4), y no se han publicado benchmarks; el soporte de la comunidad es limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF
- Modelo base (no cuantizado): https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Metodologia "Structure Over Scale" (DOI): https://doi.org/10.57967/hf/8165
- Modelo relacionado Qwen3-1.7B-Thinking-Distil: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Modelo relacionado LFM2.5-1.2B-Distilled-SFT: https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT
- Modelo relacionado Qwen3-1.7B-Coder-Distilled-SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Modelo relacionado Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF
