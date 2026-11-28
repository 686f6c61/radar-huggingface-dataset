# 11mengzi/SHYV

## Resumen

SHYV es un modelo de lenguaje de 198 millones de parámetros entrenado desde cero por el desarrollador independiente 11mengzi, sin reutilizar pesos de ningún modelo preexistente. Está especializado en conversación en chino y se posiciona como un asistente de acompañamiento local que puede ejecutarse íntegramente en CPU, sin necesidad de GPU. La arquitectura sigue el estilo Llama, con atención de consultas agrupadas (GQA) en proporción 16:4, SwiGLU, RoPE, RMSNorm y embeddings atados.

El modelo se distribuye con licencia MIT y un tamaño de repositorio de 0,8 GB, lo que lo hace muy ligero para despliegues en hardware modesto. Su ventana de contexto es de 2048 tokens y su vocabulario de 16 000 entradas está optimizado para chino. El entrenamiento combina una fase de preentrenamiento sobre 2,98 mil millones de tokens (Wikipedia en chino y SkyPile) con un ajuste supervisado sobre 94 453 conversaciones multiturno que incluyen rol de sistema, muestras de identidad y de memoria.

Su relevancia actual radica en ser un ejemplo reproducible de extremo a extremo: el autor publica tanto los pesos como el pipeline de entrenamiento y el código de despliegue. No obstante, conviene subrayar que, por su escala, sus capacidades de razonamiento y conocimiento del mundo son muy limitadas, y el propio autor lo reconoce explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama: GQA (16:4), SwiGLU, RoPE, RMSNorm, embeddings atados |
| Parametros totales | 198.565.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en fp32, 758 MB) |
| Idiomas soportados | Chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (junto con config.json y tokenizer.json) |

## Arquitectura y entrenamiento

SHYV es un transformer decoder-only de estilo Llama con 198 millones de parámetros. Emplea atención de consultas agrupadas con 16 cabezas de consulta y 4 de clave/valor, activación SwiGLU en las capas feed-forward, codificación posicional rotatoria (RoPE), normalización RMSNorm y embeddings de entrada y salida atados. El vocabulario de 16 000 tokens está ajustado al chino para mejorar la eficiencia de tokenización en ese idioma.

El preentrenamiento se realizó desde cero sobre 2,98 mil millones de tokens procedentes de Wikipedia en chino y del corpus SkyPile, en una sola RTX 4090 durante aproximadamente 20 horas. Posteriormente se aplicó un ajuste supervisado (SFT) sobre 94 453 conversaciones multiturno que incluyen rol de sistema, muestras de identidad y de memoria. No se menciona en la información disponible el uso de RLHF ni de DPO. La innovación destacable no está en el modelo en sí, sino en el sistema de despliegue: una mecánica de tres capas deterministas (perfil de usuario persistente, base de hechos con 172 entradas y, por último, generación del modelo) que reduce las alucinaciones en consultas cubiertas por la base de hechos.

## Capacidades

- Generación de texto conversacional en chino, orientada a diálogo de acompañamiento.
- Conversación multiturno con soporte de rol de sistema.
- Memoria de perfil de usuario: recuerda el nombre y las preferencias que el usuario declara, con persistencia entre sesiones (gestionada por la capa de despliegue, no solo por el modelo).
- Respuesta a consultas de una base de hechos de 172 entradas comunes, devueltas de forma determinista sin intervención del modelo.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al chino; no se documenta soporte de otros idiomas.

## Casos de uso

- Asistente de acompañamiento local en escritorio: el modelo puede ejecutarse en CPU sin GPU y mantener conversaciones cotidianas en chino, lo que lo hace adecuado para aplicaciones de bienestar o compañía en equipos sin acelerador gráfico.
- Chatbot embebido en dispositivos de bajos recursos: con 758 MB en fp32 y un contexto de 2048 tokens, cabe en entornos con poca memoria y sin CUDA, como mini-PC o Raspberry Pi de gama alta (previa conversión a un formato cuantizado, no publicado).
- Prototipado educativo de entrenamiento desde cero: el pipeline completo (datos, preentrenamiento y SFT) está abierto en GitHub, por lo que sirve para reproducir el proceso en una sola RTX 4090 en unas 20 horas.
- Atención de consultas frecuentes con base de hechos: la capa determinista de 172 entradas permite responder preguntas comunes sin riesgo de alucinación, útil en asistentes de información básica.
- Personalización por perfil de usuario: la memoria persistente de nombre y preferencias permite experiencias de chat personalizadas en aplicaciones de acompañamiento sin infraestructura adicional.
- Base para experimentación con GQA y vocabularios optimizados para chino: investigadores pueden estudiar el efecto de un vocabulario de 16k y de la proporción 16:4 en modelos de menos de 200M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; los pesos en fp32 ocupan 758 MB y el modelo puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una sola RTX 4090, pero la inferencia está pensada para CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria libre en fp32; también en CPU.
- Opciones de despliegue: el autor proporciona scripts propios (`chat_simple.py`, `启动.bat`, `启动.sh`) en el repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SHYV | 198M | 2048 | Chino | MIT | safetensors |
| Qwen2.5-0.5B | 494M | 32 768 | Multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-135M | 135M | 8192 | Ingles (principalmente) | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1B | 2048 | Ingles (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparación se limita a parámetros, contexto, idiomas y licencia, ya que no hay datos de rendimiento publicados para SHYV. Frente a alternativas como Qwen2.5-0.5B o SmolLM2-135M, SHYV ofrece un contexto mucho menor (2048 frente a 8192 o 32 768) y solo cubre chino, pero su licencia MIT es más permisiva y su pipeline de entrenamiento está completamente abierto.

## Limitaciones y advertencias

- Alucinación fuera de la base de hechos: el propio autor advierte que el conocimiento del mundo ajeno a las 172 entradas de la base de hechos se inventa; en producción se mitiga con la capa determinista, pero no desaparece.
- Memoria conversacional frágil: solo recuerda de forma fiable la información que el usuario declara sobre sí mismo; el historial de más de tres turnos se va olvidando.
- Sin capacidad de razonamiento: aritmética y problemas lógicos no son utilizables.
- Contexto corto de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura monolingüe en chino; no se documenta calidad en otros idiomas.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero los corpus de Wikipedia y SkyPile pueden introducir sesgos propios de esas fuentes.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni la seguridad del modelo en entornos productivos.
- Sin soporte documentado de cuantización ni de motores de inferencia estándar (vLLM, llama.cpp, Ollama), lo que limita su integración en infraestructuras existentes.

## Enlaces

- Hugging Face: https://huggingface.co/11mengzi/SHYV
- GitHub (código, despliegue y entrenamiento): https://github.com/11mengzi/SHYV
- Pipeline de entrenamiento: https://github.com/11mengzi/SHYV/tree/main/training
