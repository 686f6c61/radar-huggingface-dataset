# Mamo483294/Dursun-AI-3B-GGUF

## Resumen

Dursun-AI-3B es un modelo lingüístico de 3.085 millones de parámetros orientado a conversación en turco e inglés, publicado en formato GGUF por el usuario Mamo483294 en Hugging Face. Se trata de un ajuste fino (fine-tuning) sobre una base Qwen2, cuantizado y convertido a GGUF mediante el framework Unsloth, lo que lo hace apto para ejecución local en hardware de consumo a través de llama.cpp y herramientas derivadas como Ollama.

Su relevancia reside en la escasez de modelos ligeros optimizados para turco: al basarse en Qwen2 (una familia con buen soporte multilingüe) y afinarse para turco e inglés, ofrece una opción compacta y gratuita (licencia GPL-3.0) para desarrolladores que necesitan un asistente conversacional local sin depender de APIs externas. El repositorio pesa aproximadamente 1,9 GB y por el momento solo incluye el archivo `DursunAI-3B1.Q4_K_M.gguf` (cuantización de 4 bits).

La ficha técnica del modelo es muy escasa: no se documentan la longitud de contexto, el dataset de entrenamiento, los benchmarks ni los casos de uso previstos, por lo que varios apartados se marcan como no disponibles. Las 159 descargas registradas indican un alcance comunitario todavía muy reducido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2) |
| Parámetros totales | 3.085.938.688 (~3,09 B) |
| Parámetros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única variante publicada) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2, una familia de transformadores decoder-only desarrollada por Alibaba, en su variante de ~3B (el recuento exacto de 3.085 millones de parámetros es coherente con Qwen2.5-3B). El ajuste fino y la conversión a GGUF se realizaron con Unsloth, una librería optimizada para fine-tuning eficiente en memoria que permite entrenar modelos de este tamaño en GPUs de consumo mediante LoRA y cuantización. No consta si el fine-tuning fue de tipo instruct, chat o continuado, aunque la etiqueta `conversational` sugiere un enfoque de diálogo.

No se dispone de información sobre el dataset de entrenamiento (número de tokens, composición, proporción turco/inglés), ni sobre técnicas de alineación posteriores como RLHF o DPO. La innovación técnica principal, según la model card, es la conversión a GGUF para inferencia local en CPU y GPU mediante llama.cpp.

## Capacidades

- Generación de texto conversacional en turco e inglés (etiqueta `conversational`).
- Ejecución local mediante llama.cpp y runtimes compatibles con GGUF (Ollama, LM Studio, etc.).
- Cuantización de 4 bits (Q4_K_M), lo que reduce el tamaño del modelo a unos 1,9 GB.
- No hay evidencia documentada de: tool calling / function calling, capacidades de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.
- Capacidades de código y matemáticas: no documentadas, aunque la base Qwen2 de 3B dispone de ellas de forma genérica.

## Casos de uso

- **Asistente conversacional local en turco:** el modelo puede ejecutarse sin conexión en un portátil o PC de escritorio mediante llama.cpp, útil para usuarios turcos que prioricen la privacidad de sus conversaciones.
- **Prototipado de chatbots bilingües tr/en:** su tamaño de ~3B y formato GGUF permiten iterar rápido en desarrollo local antes de escalar a modelos mayores.
- **Integración en aplicaciones de escritorio:** el formato GGUF es compatible con LM Studio y Ollama, facilitando la distribución de una app con IA embebida sin backend en la nube.
- **Inferencia en CPU:** la cuantización Q4_K_M permite razonables velocidades de generación en CPUs modernas, adecuado para entornos sin GPU dedicada.
- **Investigación sobre fine-tuning en turco:** al ser un ejemplo público de fine-tuning con Unsloth sobre Qwen2, sirve como referencia reproducible para experimentos de adaptación lingüística al turco.
- **Educación y aprendizaje de idiomas:** un asistente de diálogo bilingüe ligero puede integrarse en herramientas de práctica de turco o inglés con latencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con cuantización Q4_K_M, el modelo ocupa unos 1,9 GB de pesos; se recomienda disponer de 4-6 GB de VRAM (o RAM, si se ejecuta en CPU) para alojar modelo y contexto.
- **GPUs recomendadas:** cualquier GPU de consumo con 4 GB o más de VRAM es suficiente (por ejemplo, GTX 1660, RTX 3060, RTX 4060); no se requieren GPUs de centro de datos.
- **Consumer GPUs:** cabe con holgura en GPUs modernas de gama media y baja; también es plenamente viable la ejecución en CPU.
- **Opciones de despliegue:** llama.cpp (formato nativo GGUF), Ollama, LM Studio, o cualquier runtime compatible con GGUF. No consta soporte documentado para vLLM o TGI con este archivo concreto.
- **Latencia y throughput:** no disponible; dada la cuantización de 4 bits y el tamaño de 3B, es esperable una generación fluida (>20 tokens/s) en CPUs x86 modernas y velocidades muy superiores en GPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dursun-AI-3B-GGUF | 3,09 B | no disponible | GPL-3.0 | GGUF (Q4_K_M), Hugging Face |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (128K con YaRN) | Qwen Research / Apache-2.0 (según versión) | Safetensors y GGUF oficiales |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Safetensors y GGUF oficiales |
| Gemma-2-2B-IT | 2,6 B | 8.192 tokens | Gemma Terms of Use | Safetensors y GGUF oficiales |

Dursun-AI-3B se diferencia de las bases citadas por su fine-tuning específico para turco, aunque carece de la documentación, los benchmarks y la longitud de contexto ampliada de los modelos oficiales. Su licencia GPL-3.0 es más restrictiva para integración en productos propietarios que Apache-2.0 o las licencias comunitarias de Meta y Google.

## Limitaciones y advertencias

- **Licencia GPL-3.0:** cualquier producto derivado que incorpore el modelo debe distribuirse bajo la misma licencia, lo que puede ser un impedimento para uso comercial cerrado. Es recomendable asesoría legal antes de integrarlo en producción.
- **Alucinaciones:** al tratarse de un modelo de 3B sin documentación de alineación (no consta RLHF/DPO), el riesgo de alucinación es elevado; no debe usarse para tareas que exijan factualidad rigurosa sin verificación externa.
- **Contexto:** la longitud de ventana no está documentada; asume la del modelo base Qwen2 correspondiente, pero verifícala en llama.cpp antes de diseñar aplicaciones con documentos largos.
- **Idiomas:** centrado en turco e inglés; el rendimiento en español u otras lenguas no está evaluado y probablemente sea inferior al de la base Qwen2 original.
- **Proyecto de bajo alcance:** con 159 descargas y una model card mínima, no hay auditoría comunitaria ni pruebas de calidad; conviene evaluarlo internamente antes de cualquier despliegue serio.
- **Cuantización única:** solo existe la variante Q4_K_M; no hay versiones en mayor precisión (Q8, F16) publicadas en el repositorio, lo que limita la calidad máxima alcanzable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mamo483294/Dursun-AI-3B-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- No se han encontrado enlaces a paper, blog, demo ni repositorio de código adicional en la información disponible.
