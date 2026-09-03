# REKS1337/ExtraAI-75M

## Resumen

ExtraAI-75M es un modelo de lenguaje causal tipo decoder Transformer de 75.012.480 parámetros, desarrollado por REKS1337 y publicado en HuggingFace. Se trata de un modelo entrenado desde cero (from scratch), sin usar pesos preentrenados ni tokenizadores existentes: tanto el modelo como su tokenizer BPE de nivel byte (32k de vocabulario) se inicializaron aleatoriamente y se entrenaron con datos de conversaciones en inglés. El modelo está pensado para generación de texto y conversación, y se distribuye tanto en formato Safetensors como en GGUF (F16) para su uso con llama.cpp.

Su relevancia radica en ser un experimento de entrenamiento completo con un presupuesto de cómputo reducido, utilizando datos de conversaciones destiladas de modelos de la familia Grok. Con una arquitectura de 11 capas, ancho 640, 10 cabezas de atención y una ventana de contexto de 1024 tokens, es un modelo pequeño que puede ejecutarse en hardware modesto. Sin embargo, su tamaño y su entrenamiento limitado implican que sus respuestas son experimentales y no aptas para usos críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (11 capas, ancho 640, 10 cabezas de atención, SwiGLU ancho 1728, RMSNorm, RoPE, atención causal con scaled-dot-product, embeddings atados) |
| Parametros totales | 75.012.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16 (GGUF incluido); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | Safetensors y GGUF (F16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer decoder estándar con normalización RMSNorm, posiciones rotativas (RoPE), activación SwiGLU y atención causal implementada con scaled-dot-product de PyTorch. Los embeddings de entrada y salida están atados (tied embeddings), lo que reduce el número de parámetros. El tokenizer es un BPE de nivel byte con 32k de vocabulario, también entrenado desde cero.

El entrenamiento se realizó sobre 77.520 conversaciones provenientes de tres datasets: `agentic-ptb/grok-data`, `11-47/god_agent_grok4.4_cot_traces_20k` y `WithinUsAI/Grok_4.4_Distilled`. Se aplicó un filtro ligero de idioma inglés y deduplicación de texto exacto. El proceso consistió en un preentrenamiento causal seguido de un entrenamiento supervisado únicamente sobre las respuestas del asistente. El modelo se exportó tras el paso 4.000 del optimizador. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto en inglés, con capacidad de mantener conversaciones de corta duración (contexto de 1024 tokens).
- Entrenado específicamente en datos conversacionales, por lo que puede producir respuestas en formato de diálogo.
- Soporte básico de instrucciones, aunque limitado por su tamaño y presupuesto de entrenamiento.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: solo inglés.

## Casos de uso

- Prototipado de chatbots en inglés: por su tamaño reducido, puede desplegarse rápidamente en entornos de desarrollo para probar flujos conversacionales básicos, aunque su contexto de 1024 tokens limita la duración de las conversaciones.
- Generación de texto corto para pruebas: sirve para generar respuestas breves en aplicaciones de demostración o para verificar pipelines de generación de texto.
- Fine-tuning en dominios específicos: al ser un modelo pequeño, se puede ajustar con pocos recursos para tareas concretas como clasificación de texto o generación de respuestas en un dominio limitado (por ejemplo, atención al cliente simple).
- Educación e investigación: útil para estudiar el comportamiento de modelos entrenados desde cero, incluyendo fenómenos de alucinación, sesgos y la influencia de los datos de entrenamiento.
- Experimentos de destilación de conocimiento: al estar entrenado con datos destilados de modelos Grok, puede emplearse para analizar la transferencia de conocimiento entre modelos grandes y pequeños.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecutarlo en CPU o GPU de baja gama, lo que lo hace adecuado para aplicaciones embebidas o de baja latencia donde se requieran respuestas simples en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 75M de parámetros; en FP16, los pesos ocupan aproximadamente 150 MiB (según el GGUF F16 incluido).
- VRAM estimada: menos de 1 GB para inferencia en FP16, incluyendo activaciones y overhead. Es ejecutable en GPUs de consumo como una RTX 3060 o incluso en CPU.
- No se dispone de recomendaciones específicas del autor sobre GPUs concretas.
- Opciones de despliegue: llama.cpp (gracias al GGUF incluido), Hugging Face Transformers (cargando los Safetensors), o vLLM (aunque es excesivo para este tamaño).
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una latencia baja en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede alucinar y reproducir sesgos presentes en los datos de entrenamiento, que incluyen destilados de modelos Grok.
- Solo soporta inglés; no es adecuado para otros idiomas.
- Contexto limitado a 1024 tokens, lo que restringe conversaciones largas o documentos extensos.
- Licencia no disponible; además, las licencias de los datasets utilizados deben verificarse de forma independiente antes de cualquier redistribución o uso comercial.
- Entrenado con un presupuesto de cómputo de una sola sesión, por lo que su calidad es limitada y no debe usarse para decisiones de alto riesgo.
- No se han publicado benchmarks ni evaluaciones formales, por lo que su rendimiento real es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/REKS1337/ExtraAI-75M
- No se han encontrado otros enlaces (papers, blogs, repos) en la información disponible.
