# Outlier-Ai/Outlier-Nano-1.7B-MLX-4bit

## Resumen

Outlier-Nano-1.7B-MLX-4bit es una cuantización a 4 bits en formato MLX del modelo Qwen/Qwen3-1.7B, publicada por Outlier-Ai para su ejecución local en Apple Silicon (M1, M2, M3 y M4) mediante el framework MLX de Apple. El modelo conserva la arquitectura y los pesos del Qwen3-1.7B original, comprimidos a 4 bits para reducir el espacio en disco y la memoria necesaria durante la inferencia en Mac. El repositorio ocupa 1,9 GB y contiene 1.720.574.976 parámetros según los safetensors publicados.

La relevancia de esta ficha es limitada por su propio estado: la model card indica explícitamente que el repositorio es un artefacto de investigación de una línea anterior de Outlier y que ha sido reemplazado por la gama v1.8 (Outlier Nano 4B, Outlier Core 27B y Outlier Vision 35B-A3B). El autor lo conserva por reproducibilidad e interés histórico, no como recomendación de producción. Cualquier afirmación técnica de revisiones previas de la tarjeta debe considerarse provisional.

Se trata, por tanto, de un modelo pequeño de generación de texto orientado a chat, instrucciones, function calling y despliegue offline en dispositivos de borde, con licencia Apache 2.0 heredada del modelo base y soporte declarado para 15 idiomas, entre ellos el español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-1.7B); pesos cuantizados para MLX |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (MLX 4-bit); la model card menciona la etiqueta "awq" sin detallar el esquema exacto |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3-1.7B, un transformer denso de la familia Qwen3. Outlier-Ai no entrena desde cero ni publica detalles de un proceso de ajuste propio: la model card se limita a declarar `base_model: Qwen/Qwen3-1.7B` con relacion `quantized` y `quantized_by: Outlier-Ai`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado adicional.

La innovacion tecnica del repositorio es la propia cuantizacion a 4 bits para MLX, que permite ejecutar el modelo en memoria unificada de chips Apple Silicon con Metal. La model card advierte que el artefacto puede contener adaptadores, capas superpuestas o variantes de cuantizacion experimentales que no llegaron al producto final, por lo que las afirmaciones tecnicas de revisiones anteriores deben tratarse como provisionales. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones en formato chat.
- Razonamiento general y conocimiento factual basico, limitado por el tamano de 1,7B parametros.
- Soporte declarado de function calling y tool use (etiquetas `function-calling` y `tool-use`).
- Capacidades multilingues en 15 idiomas: ingles, chino, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, arabe, vietnamita, tailandes, neerlandes y polaco.
- Ejecucion local y offline en Apple Silicon mediante MLX y Metal.
- No se declaran capacidades de vision, audio ni modos de pensamiento explicito en la informacion disponible.

## Casos de uso

- Asistente de chat local en macOS: el modelo puede gestionar conversaciones multi-turno en el dispositivo sin enviar datos a la nube, lo que resulta adecuado para usuarios que priorizan privacidad y trabajan sin conexion.
- Automatizacion de tareas con tool calling en escritorio: al declarar soporte de function calling, puede integrarse en flujos que invoquen APIs locales o scripts del sistema, aunque el reducido tamano limita la fiabilidad en cadenas de herramientas complejas.
- Prototipado rapido de aplicaciones MLX: sirve como modelo de referencia para validar pipelines de inferencia en Apple Silicon antes de migrar a variantes mayores de la misma familia.
- Clasificacion y resumen de textos cortos: con 1,7B parametros es viable para resumir correos, notas o documentacion breve en local con baja latencia.
- Generacion de texto auxiliar en editores y herramientas de escritorio: autocompletado, reescritura y sugerencias integradas en aplicaciones nativas de macOS.
- Entornos educativos y de investigacion: su licencia Apache 2.0 y su tamano reducido permiten experimentar con cuantizacion, evaluacion de sesgos y tecnicas de despliegue sin coste de infraestructura.
- Reproducibilidad de artefactos: util para replicar experimentos historicos de la linea Outlier documentados en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 1,9 GB, por lo que la inferencia a 4 bits requiere del orden de 2 GB de memoria unificada, mas el overhead del runtime MLX y del contexto.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4) con Metal; no esta pensado para GPUs NVIDIA ni CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; los modelos con 8 GB de memoria unificada o mas deberian poder ejecutarlo.
- Opciones de despliegue: MLX (libreria nativa), `mlx-lm` y aplicaciones basadas en MLX; no se distribuye en GGUF ni en formato compatible con llama.cpp, Ollama o vLLM en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Outlier-Nano-1.7B-MLX-4bit | 1,72B | No disponible | safetensors MLX 4-bit | Apache 2.0 | Artefacto historico, reemplazado |
| Outlier Nano 4B (MLX 4-bit) | No disponible | No disponible | safetensors MLX 4-bit | No disponible | Tier de entrada actual segun la model card |
| Outlier Core 27B (MLX 4-bit) | No disponible | No disponible | safetensors MLX 4-bit | No disponible | Tier por defecto actual segun la model card |
| Qwen/Qwen3-1.7B (base) | 1,72B | No disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar |

La comparacion con alternativas de otros fabricantes (Llama 3.2 1B, Gemma 3 1B, Phi-3-mini) no puede completarse con datos verificados en la informacion disponible.

## Limitaciones y advertencias

- Repositorio obsoleto: la propia model card lo marca como "superseded" y recomienda acudir a outlier.host o a los tiers actuales; no debe usarse como opcion de produccion.
- Artefacto de investigacion: puede contener adaptadores o variantes experimentales no validadas.
- Tamano reducido: con 1,7B parametros, la fiabilidad en razonamiento complejo, matematicas y cadenas largas de tool calling es limitada en comparacion con modelos mayores.
- Riesgo de alucinacion: inherente a los modelos de lenguaje pequenos; no se documentan tasas de error ni evaluaciones de factualidad.
- Sesgos: no se publica informacion sobre evaluaciones de sesgo ni sobre la composicion del dataset del modelo base.
- Contexto: no se especifica la longitud de contexto soportada en la informacion disponible.
- Compatibilidad: solo Apple Silicon y MLX; no es portable a CUDA, ROCm ni a runtimes GGUF sin conversion adicional.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto historico conviene verificar los terminos del tier actual de Outlier antes de integrarlo en un producto.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Nano-1.7B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Outlier Nano 4B (tier actual): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Core 27B (tier actual): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B (tier multimodal): https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Coleccion Outlier Consumer Edition: https://huggingface.co/collections/Outlier-Ai/outlier-consumer-edition
- Sitio del autor: https://outlier.host/
