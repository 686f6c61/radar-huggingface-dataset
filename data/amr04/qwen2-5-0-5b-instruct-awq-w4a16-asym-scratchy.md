# Amr04/Qwen2.5-0.5B-Instruct-AWQ-W4A16-ASYM-Scratchy

## Resumen

Este repositorio contiene una version cuantizada del modelo Qwen/Qwen2.5-0.5B-Instruct, publicada por el usuario Amr04 bajo el identificador Qwen2.5-0.5B-Instruct-AWQ-W4A16-ASYM-Scratchy. Se trata de una cuantizacion de solo pesos a INT4 (4 bits), manteniendo las activaciones en 16 bits, lo que se conoce como esquema W4A16. La particularidad del trabajo es que la cuantizacion AWQ se ha implementado "desde cero", sin recurrir a una libreria de cuantizacion dedicada, y se serializa en el formato pack-quantized de compressed-tensors.

El modelo base es un transformer decoder-only denso de la familia Qwen2.5, con 494.032.768 parametros (aproximadamente 0,5B), disenado para generacion de texto, conversacion e instrucciones. Al reducir los pesos a 4 bits, el objetivo es disminuir el uso de memoria y facilitar el despliegue en hardware modesto sin degradar en exceso la calidad respecto al modelo original en BF16.

Es relevante ahora porque, para tareas de baja latencia, edge computing o prototipado rapido, los modelos pequenos cuantizados a 4 bits ofrecen un equilibrio atractivo entre coste, velocidad y calidad. Este repositorio concreto no declara licencia ni idiomas en su metadato y acumula cero descargas, por lo que debe tratarse como un artefacto experimental de comunidad mas que como una distribucion oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, base Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct; no declarada en este repositorio) |
| Tipos de cuantizacion | INT4 de pesos / 16-bit de activaciones (W4A16); asimetrica, group size 32, observador de pesos MSE; lm_head en BF16 |
| Idiomas soportados | no disponible (el modelo base es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors con quantizacion compressed-tensors (pack-quantized) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2.5-0.5B-Instruct, es un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con query grouping (GQA). El autor de la cuantizacion no ha modificado la topologia de la red: solo ha reescrito los pesos de las capas lineales a 4 bits. La unica excepcion es lm_head, que se mantiene en BF16, presumiblemente para preservar la fidelidad del muestreo sobre el vocabulario y evitar errores de cuantizacion en la capa de salida.

Respecto al procedimiento de cuantizacion, es una implementacion propia (scratch) del algoritmo AWQ con duo_scaling="both" y n_grid=40, empleando un observador de pesos basado en MSE y escalado asimetrico con grupo de 32. La calibracion se realizo con 512 muestras de longitud maxima 1024 procedentes del dataset neuralmagic/LLM_compression_calibration. Los datos de entrenamiento originales del modelo base no se detallan en la informacion disponible; segun la documentacion publica de Qwen2.5, la familia se preentreno sobre un conjunto de hasta 18 billones de tokens y las variantes instruct incorporan ajuste por instrucciones y alineacion de preferencias.

## Capacidades

- Generacion de texto conversacional e instrucciones en formato chat, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento de proposito general y tareas de conocimiento basico, aunque limitadas por el reducido tamano del modelo.
- Generacion de codigo y resolucion de problemas aritmeticos sencillos, en la medida en que lo permite un modelo de 0,5B.
- Soporte multilingue indirecto a traves del vocabulario del base Qwen2.5 (numerosos idiomas, incluido el castellano), si bien el repositorio no lo declara.
- Compatibilidad con text-generation-inference y con el pipeline text-generation de transformers.
- No se documentan capacidades de tool calling, uso agentico, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Prototipado rapido y pruebas de integracion: al ocupar menos de 1 GB de pesos cuantizados, permite validar un pipeline de transformers o TGI completo antes de escalar a modelos mayores.
- Inferencia en el borde o en dispositivos con poca memoria: puede ejecutarse en CPU o en GPU integradas para tareas de generacion de texto de baja exigencia.
- Clasificacion y etiquetado de texto ligero: resumenes cortos, reformulacion de frases o extraccion de entidades simples en lotes grandes donde el coste por token importa.
- Asistentes conversacionales de baja latencia: respuestas cortas en chats con requisitos estrictos de tiempo de respuesta, gracias al reducido coste computacional del modelo.
- Generacion de texto en entornos sin GPU dedicada: util como baseline para comparar el efecto de la cuantizacion AWQ frente a la version en BF16.
- Educacion y experimentacion con cuantizacion: sirve como ejemplo de referencia de un flujo AWQ W4A16 manual serializado en compressed-tensors.
- Filtrado y preprocesado en pipelines de datos: generacion de resumentes o reformulaciones a gran escala donde un modelo pequeno de 4 bits reduce el gasto de VRAM frente a alternativas de 7B.

## Benchmarks y rendimiento

| Metrica | BF16 baseline | Este modelo |
|---|---|---|
| WikiText-2 PPL (contexto 1024) | 16,030 | 17,659 |

El unico dato publicado por el autor es la perplejidad en WikiText-2, que pasa de 16,030 a 17,659, un incremento de aproximadamente el 10 %. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1,5 GB sumando pesos INT4 (unos 250 MB), lm_head en BF16 y las activaciones y el overhead del runtime de transformers.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; no se requiere A100, H100 ni similares.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en muchas iGPU.
- Tambien puede ejecutarse en CPU, dado el reducido tamano del modelo.
- Opciones de despliegue: transformers (recomendado por el autor), text-generation-inference (etiqueta tgi presente en el repositorio) y, en general, backends compatibles con compressed-tensors. No se proporciona una conversion a GGUF, por lo que llama.cpp u Ollama requeririan una conversion adicional.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Amr04) | 494.032.768 | 32.768 (heredado) | AWQ W4A16 INT4, compressed-tensors | no disponible | safetensors, transformers |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | BF16 sin cuantizar | Apache 2.0 (segun el base) | safetensors, transformers |
| Qwen/Qwen2.5-0.5B-Instruct-AWQ | 0,5B | 32.768 | AWQ W4A16 oficial | Apache 2.0 (segun el base) | safetensors, transformers |
| Qwen/Qwen2.5-Coder-0.5B-Instruct-AWQ | 0,5B | 32.768 | AWQ W4A16 oficial | Apache 2.0 (segun el base) | safetensors, transformers |

La diferencia principal frente a las alternativas oficiales de Qwen radica en que este repositorio es una cuantizacion de comunidad implementada manualmente y con metadatos incompletos (sin licencia ni idiomas declarados), mientras que las versiones de Qwen incluyen licencia explicita y estan mantenidas por el propio equipo. Las cifras de calidad del modelo base se pueden consultar en el informe tecnico de Qwen2.5 citado en los enlaces.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse, no puede asumirse un uso comercial libre; conviene verificar la licencia del modelo base Qwen2.5-0.5B-Instruct antes de cualquier despliegue en produccion.
- Artefacto de comunidad: publicado por un usuario individual, con cero descargas y cero valoraciones, y sin garantia de mantenimiento, revision o actualizacion.
- Sin benchmarks de tareas: solo se reporta perplejidad en WikiText-2; no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o seguridad.
- Riesgo de alucinacion: inherente a los modelos de 0,5B, que generan con frecuencia contenido incorrecto o inventado, especialmente en tareas de conocimiento factual.
- Degradacion por cuantizacion: la perplejidad aumenta un 10 % respecto al baseline BF16, lo que puede traducirse en respuestas algo menos precisas.
- Limitaciones de razonamiento: el tamano reducido del modelo restringe la calidad en matematicas, codigo complejo y cadenas de razonamiento largas.
- Idiomas no declarados: aunque el base es multilingue, el repositorio no especifica cobertura ni calidad por idioma, por lo que el rendimiento en castellano no esta garantizado.
- Compatibilidad de runtime: al usar el formato pack-quantized de compressed-tensors, requiere versiones recientes de transformers y la libreria compressed-tensors; no es directamente compatible con llama.cpp u Ollama sin conversion.
- Incertidumbre en la fecha de creacion: el metadato indica 2026-10-04, lo que resulta anomalo y sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Amr04/Qwen2.5-0.5B-Instruct-AWQ-W4A16-ASYM-Scratchy
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Cuantizacion AWQ oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-AWQ
- Variante Coder AWQ oficial: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-AWQ
- Informe tecnico de Qwen2.5 (arXiv): https://arxiv.org/pdf/2412.15115v1
- Repositorio GitHub de referencia de la serie Qwen2.5: https://github.com/mx4ai/qwen2.5
- Dataset de calibracion: neuralmagic/LLM_compression_calibration
