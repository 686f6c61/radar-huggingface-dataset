# Codemaster67/qwen3-1.7b-chem-1M-midtrain

## Resumen

Codemaster67/qwen3-1.7b-chem-1M-midtrain es un adaptador LoRA publicado con la librería PEFT por el usuario Codemaster67 sobre el modelo base Qwen/Qwen3-1.7B. El repositorio ocupa 2,0 GB y contiene pesos de adaptador en safetensors junto con la plantilla de model card por defecto de Hugging Face, sin cumplimentar: no hay descripción, datos de entrenamiento, hiperparámetros ni evaluación.

El identificador del repositorio sugiere un ajuste orientado a química ("chem") a partir de una fase de midtraining sobre aproximadamente un millón de ejemplos ("1M"). Esa lectura es una inferencia del nombre y no está confirmada en ninguna parte de la documentación del autor, que no declara licencia, idiomas ni resultados de benchmarks.

Su interés es, por tanto, experimental: puede servir como punto de partida para reproducir o continuar un ajuste de dominio químico sobre un transformer denso de 1,7B parámetros, pero no hay evidencia publicada que respalde su calidad. El modelo base Qwen3-1.7B declara 32.768 tokens de contexto nativo y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-1.7B, transformer decoder denso con atención GQA |
| Parámetros totales | 1.700 millones en el modelo base; rango y número de parámetros del adaptador: no disponible |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la card del adaptador; el modelo base declara 32.768 tokens nativos, ampliables a 131.072 con YaRN (dato del modelo base, no verificado en este repositorio) |
| Tipos de cuantización | no disponible; al ser un adaptador LoRA puede fusionarse con el base y cuantizarse a GGUF, AWQ o GPTQ con herramientas estándar (no documentado por el autor) |
| Idiomas soportados | no disponible (el modelo base Qwen3 declara cobertura de más de 100 idiomas; sin verificar para este adaptador) |
| Licencia | no disponible; el modelo base Qwen3-1.7B es Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); no se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

La arquitectura efectiva es la de Qwen3-1.7B, un transformer decoder denso con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU, sobre el que se aplica una capa de bajo rango (LoRA) entrenada con PEFT 0.20.0. El repositorio no especifica el rango, el alpha, los módulos objetivo ni si el adaptador cubre solo atención, solo MLP o ambas. El tamaño del repositorio (2,0 GB) es llamativamente grande para un adaptador LoRA sobre un modelo de 1,7B, lo que sugiere la presencia de ficheros adicionales (estados del optimizador, checkpoints intermedios o deltas en precisión completa); no hay documentación que lo aclare.

No se ha publicado información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, la existencia de RLHF/DPO ni la técnica de midtraining empleada. El nombre del repositorio apunta a una fase intermedia de preentrenamiento ("midtrain") con datos químicos del orden de un millón de muestras, seguida presumiblemente de un ajuste supervisado, pero ninguno de estos extremos está confirmado. Tampoco se documentan innovaciones técnicas propias: el valor añadido se limita al ajuste de dominio sobre el modelo base.

## Capacidades

- Generación de texto autoregresiva en el dominio general, heredada del modelo base Qwen3-1.7B.
- Presunta especialización en química (nomenclatura, propiedades, reacciones, literatura científica), según el nombre del repositorio y sin evaluación publicada que lo respalde.
- Modo de razonamiento híbrido (thinking/no thinking) del modelo base Qwen3, activable mediante plantilla de chat; no verificado tras el ajuste LoRA.
- Soporte de tool calling y function calling heredado del modelo base y de su plantilla de chat, sujeto a que el ajuste no haya degradado el formato.
- Capacidades multilingües del modelo base (más de 100 idiomas declarados); sin datos específicos del adaptador.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Extracción de entidades químicas de literatura y patentes: el adaptador podría identificar compuestos, CAS, nombres IUPAC y propiedades en textos largos, aprovechando la ventana de 32.768 tokens del modelo base para procesar artículos completos en una sola pasada.
- Normalización y conversión de nomenclatura a SMILES: uso como primer paso de un pipeline que valide después la estructura con RDKit, ya que un modelo de 1,7B puede producir cadenas SMILES sintácticamente inválidas o químicamente imposibles.
- Asistente interno de laboratorio: consultas multi-turno sobre protocolos, fichas de seguridad y compatibilidades de reactivos, con recuperación aumentada (RAG) sobre la documentación propia de la organización.
- Estructuración de datos tabulados: convertir párrafos de propiedades fisicoquímicas (punto de fusión, solubilidad, presión de vapor) en JSON validable para alimentar bases de datos internas.
- Etiquetado y aumento de datasets químicos: uso del adaptador para preanotar corpus que después se revisan por expertos, o como inicialización para un ajuste posterior con datos propios.
- Enrutado de consultas y tool calling: clasificar la intención del usuario y derivar a herramientas externas como PubChem, ChemSpider o un motor de cálculo, gracias al soporte de function calling del modelo base.
- Apoyo educativo en química orgánica e inorgánica: explicación de mecanismos de reacción y resolución guiada de ejercicios, con verificación humana obligatoria del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluación alguna (MMLU, GSM8K, HumanEval, MMLU-Pro, químicas como ChemBench o LAB-Bench) ni comparación con el modelo base, por lo que no es posible determinar si el ajuste LoRA mejora, mantiene o degrada las capacidades originales de Qwen3-1.7B.

## Requisitos de hardware

- VRAM estimada: en fp16/bf16 el modelo base de 1,7B ocupa aproximadamente 3,4 GB de pesos; en int8 unos 1,8 GB; en 4 bits alrededor de 1,1 GB. A ello se suma la caché KV, que crece con el contexto y puede superar los 2 GB adicionales a 32.768 tokens.
- El adaptador LoRA en sí añade una sobrecarga mínima de VRAM (decenas o pocos cientos de MB, según rango y módulos, no especificados).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más sirve en 4 bits (RTX 3060, RTX 4060, GTX 1660 Super). Para fp16 con contexto largo conviene partir de 8-12 GB (RTX 3060 12 GB, RTX 4070). En entornos de servidor, A100, H100 o L40S quedan sobredimensionadas para un modelo de este tamaño y solo se justifican por agregación de muchas réplicas.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| qwen3-1.7b-chem-1M-midtrain (este) | 1,7B + LoRA | no disponible (base: 32.768) | no disponible | Adaptador PEFT en HF, 0 descargas | no disponible |
| Qwen/Qwen3-1.7B (base) | 1,7B denso | 32.768 (131.072 con YaRN) | Apache 2.0 | Pesos completos y GGUF oficiales | Publicados por el autor del modelo base |
| Qwen2.5-1.5B | 1,5B denso | 32.768 | Apache 2.0 | Pesos completos, amplio ecosistema | Publicados por el autor del modelo base |
| Llama-3.2-1B | 1,2B denso | 128.000 | Licencia comunitaria Llama 3.2 | Pesos completos, requiere aceptación | Publicados por el autor del modelo base |

Nota: los datos de contexto y licencia de las alternativas proceden de la documentación pública de cada modelo base y no han sido verificados en esta ficha. En la categoría de adaptadores químicos comunitarios no se han identificado alternativas comparables en la información disponible.

## Limitaciones y advertencias

- Model card sin contenido: no hay información sobre datos, entrenamiento, evaluación ni uso previsto, lo que impide auditar el modelo.
- Licencia no declarada: aunque el modelo base es Apache 2.0, el adaptador no especifica términos, por lo que su uso comercial es jurídicamente incierto hasta que el autor lo aclare.
- Sin evaluación: no se puede saber si el ajuste ha degradado capacidades generales del modelo base (razonamiento, código, seguimiento de instrucciones) por olvido catastrófico.
- Riesgo elevado de alucinación en dominio científico: con 1,7B parámetros, la generación de SMILES, dosis, números CAS o propiedades fisicoquímicas puede ser plausible pero falsa. Toda salida debe validarse con herramientas deterministas (RDKit, PubChem) y revisión experta.
- Idiomas no declarados: se desconoce si el ajuste conserva el rendimiento multilingüe del modelo base o lo ha reducido al corpus de entrenamiento.
- Sesgos no documentados: no se han publicado análisis de sesgo, toxicidad ni comportamiento en dominios sensibles.
- Señales de validación nulas: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión asociada.
- Anomalía en metadatos: las fechas de creación y actualización (27 de octubre de 2026) son posteriores a la fecha actual de referencia, lo que sugiere un error de marcado o una carga con reloj incorrecto.
- Tamaño del repositorio desproporcionado (2,0 GB) para un adaptador LoRA sobre 1,7B: conviene inspeccionar los ficheros antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Codemaster67/qwen3-1.7b-chem-1M-midtrain
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper referenciado en los tags (Lacoste et al., 2019, sobre impacto ambiental del aprendizaje automático): https://arxiv.org/abs/1910.09700
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada.
