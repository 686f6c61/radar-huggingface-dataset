# miakojean/rosanita

## Resumen

miakojean/rosanita es un modelo de lenguaje basado en el fine-tuning de meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario miakojean (MIAKO Jean Yves Arnold) en agosto de 2026. Se trata de un modelo orientado al francés, con licencia MIT, que parte de la arquitectura Llama 3.1 de 8.000 millones de parámetros con soporte de contexto de 128.000 tokens.

El modelo se presenta como un ajuste fino del instruct de Llama 3.1, lo que sugiere que hereda las capacidades generales de razonamiento, generación de texto y seguimiento de instrucciones del modelo base, con un enfoque particular en el idioma francés. Sin embargo, la información publicada es extremadamente limitada: no se especifican los datos de entrenamiento, el método de ajuste, ni se aportan benchmarks o ejemplos de uso. El modelo no ha recibido descargas ni valoraciones en HuggingFace, lo que indica que se trata de un proyecto personal o experimental sin validación comunitaria.

La relevancia de este modelo reside principalmente en su licencia permisiva (MIT) y en su potencial como base para aplicaciones en francés, aunque su escasa documentación y ausencia de métricas dificultan su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, decoder-only) |
| Parametros totales | 8.030 millones (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (declarado), capacidades multilingues heredadas del modelo base |
| Licencia | MIT |
| Formato de pesos | no disponible (presumiblemente safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.1-8B-Instruct: un transformer decoder-only con atención por ventanas, normalización RMSNorm, embeddings rotatorios (RoPE) y activación SwiGLU. El modelo base fue entrenado con 15 billones de tokens en un dataset multilingue y posteriormente alineado mediante SFT y DPO.

Sobre esta base, el autor ha realizado un fine-tuning adicional, presumiblemente con datos en francés, aunque no se especifica el volumen de datos, la composición del dataset, ni el método de alineación empleado (SFT, LoRA, etc.). No se documenta ninguna innovación técnica adicional ni cambios en la arquitectura original.

## Capacidades

- Generación de texto en francés: el modelo está orientado a producir respuestas en francés, aunque hereda las capacidades multilingues del modelo base.
- Razonamiento y seguimiento de instrucciones: al partir de Llama 3.1-8B-Instruct, mantiene las capacidades de razonamiento básico y ejecución de instrucciones del modelo base.
- Generación de código: capacidad heredada del modelo base, aunque no se ha verificado su rendimiento tras el fine-tuning.
- Tool calling: el modelo base soporta function calling, pero no se ha confirmado que el fine-tuning preserve esta capacidad.
- Ventana de contexto larga: 128.000 tokens, heredada del modelo base, útil para documentos extensos.

## Casos de uso

- Asistente conversacional en francés: el modelo puede integrarse en chatbots o asistentes virtuales para responder preguntas y mantener conversaciones en francés, aprovechando su licencia MIT para uso comercial sin restricciones.
- Generación de contenido editorial en francés: redacción de artículos, resúmenes o borradores en francés para medios o blogs, con la ventaja de un contexto largo para procesar documentos extensos.
- Traducción y adaptación de textos: aunque no está especializado en traducción, puede utilizarse para adaptar contenido al francés o reformular textos existentes.
- Prototipado rápido de aplicaciones NLP: gracias a su licencia permisiva y su tamaño moderado (8B), es adecuado para experimentar en entornos de desarrollo sin costes de licencia.
- Análisis de documentos largos en francés: con 128K de contexto, puede procesar informes, contratos o actas completas para extraer información o resumir.
- Educación y tutoría en francés: puede servir como tutor virtual para explicar conceptos, resolver dudas o generar ejercicios en francés, aunque su rendimiento real no está verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo concreto. Al ser un fine-tuning de Llama 3.1-8B-Instruct, su rendimiento podría ser similar al del modelo base, pero no hay evidencia que lo confirme.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16, 8-10 GB en cuantizacion INT4/INT8.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16; GPUs con 8-12 GB pueden ejecutar versiones cuantizadas.
- En consumer GPU: sí, cabe en GPUs de gama alta (24 GB) sin cuantizar y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible. Para un modelo de 8B en una GPU moderna, se espera una generación de 20-50 tokens/s con cuantizacion, pero no hay datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma |
|---|---|---|---|---|
| miakojean/rosanita | 8B | 128K | MIT | frances |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | multilingue |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32K | Apache 2.0 | multilingue |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128K | Apache 2.0 | multilingue |

La comparativa directa es limitada porque no hay datos de rendimiento de rosanita. Frente a sus alternativas, ofrece la ventaja de la licencia MIT (más permisiva que la de Llama 3.1) y el enfoque en francés, pero carece de la documentación y el ecosistema de las alternativas establecidas.

## Limitaciones y advertencias

- Información insuficiente: no se documentan datos de entrenamiento, método de fine-tuning, ni evaluaciones. Es imposible verificar su calidad o comportamiento.
- Sin validación comunitaria: cero descargas y cero likes en HuggingFace indican que no ha sido probado por terceros.
- Riesgo de alucinación: como cualquier modelo de 8B, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos desconocidos: al no conocer la composición del dataset de fine-tuning, no se pueden evaluar sesgos potenciales.
- Capacidades no verificadas: las capacidades de tool calling, razonamiento o código son heredadas del modelo base, pero el fine-tuning podría haberlas degradado.
- Soporte limitado: al ser un proyecto personal, no hay garantías de mantenimiento, actualizaciones o soporte técnico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/miakojean/rosanita
- Perfil del autor en HuggingFace: https://huggingface.co/miakojean
- Perfil del autor en GitHub: https://github.com/miakojean
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
