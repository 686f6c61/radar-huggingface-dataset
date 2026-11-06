# arpan103/NSFW-RP-RolePlay-LoRA-ArliAI-Llama-3.1-8B-F16-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF (precisión F16) de un adaptador LoRA orientado a roleplay para adultos, construido sobre Llama 3.1 8B. El adaptador original, publicado por el usuario mirazrafi bajo el nombre NSFW-RP-RolePlay-LoRA-ArliAI-Llama-3.1-8B, ha sido entrenado mediante SFT (supervised fine-tuning) con la librería TRL y Unsloth, y el usuario arpan103 lo ha empaquetado con la herramienta gguf-my-lora para facilitar su uso en llama.cpp y Ollama.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con aproximadamente 8.000 millones de parámetros en el modelo base, aunque el adaptador LoRA en sí ocupa unos 41,9 millones de parámetros entrenables. La longitud de contexto nativa de Llama 3.1 es de 128.000 tokens, si bien no se especifica si el adaptador ha sido entrenado para aprovechar esa ventana completa.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de nicho para experimentación con personajes conversacionales sin filtros, distribuido en un formato (GGUF F16) que permite su despliegue local en hardware de consumo. El acceso está restringido y requiere aceptar condiciones en Hugging Face, y el contenido está marcado como no apto para todas las audiencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptador LoRA |
| Parametros totales | 41.943.040 (adaptador LoRA); modelo base ~8.000 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base (no confirmado para el adaptador) |
| Tipos de cuantizacion | F16 (este repositorio); el modelo base admite otras cuantizaciones GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.1 8B, un transformer decoder-only con atención de múltiples cabezas, RoPE y GQA (grouped-query attention). Sobre él se aplica un adaptador LoRA entrenado mediante SFT con TRL y Unsloth, técnicas que permiten ajustar un subconjunto reducido de parámetros (41,9 millones) sin modificar los pesos originales. El adaptador está especializado en conversaciones de roleplay para adultos (NSFW), lo que implica un ajuste de estilo, tono y contenido más que una mejora de capacidades generales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La conversión a GGUF se realizó con gguf-my-lora, una herramienta que fusiona el adaptador con el modelo base y exporta en formato GGUF para su uso en llama.cpp y Ollama.

## Capacidades

- Generación de texto conversacional en inglés, orientada a roleplay y narrativa interactiva.
- Mantenimiento de personajes y contexto en diálogos multi-turno (limitado por la ventana efectiva del adaptador).
- Estilo libre de filtros para contenido adulto (NSFW), según la etiqueta del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Prototipado de personajes conversacionales para ficción interactiva: el adaptador permite generar diálogos con personalidad consistente en inglés, útil para escritores que necesitan explorar tramas y voces de personajes sin restricciones de contenido.
- Investigación sobre alineación y seguridad en modelos: al ser un modelo explícitamente sin filtros, sirve como caso de estudio para analizar comportamientos no alineados y diseñar mitigaciones.
- Evaluación de técnicas LoRA y cuantización: el repositorio permite comparar el comportamiento del adaptador en F16 frente a otras cuantizaciones GGUF, útil para estudiar la degradación de calidad en roleplay.
- Despliegue local en hardware de consumo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU modesta o incluso CPU, sin dependencia de servicios en la nube.
- Generación de narrativa ramificada: el modelo puede mantener contexto de varias escenas y responder a elecciones del usuario, adecuado para motores de aventuras conversacionales.
- Análisis de sesgos y contenido dañino: investigadores pueden usar el modelo para generar corpus controlados de contenido adulto y estudiar su clasificación o filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 16 GB para el modelo base de 8B más el adaptador fusionado (los pesos F16 de 8B ocupan ~16 GB).
- GPU recomendadas: A100 40 GB, H100, RTX 4090 (24 GB) para F16; para cuantizaciones menores (Q4_K_M, Q5_K_M) bastan GPUs de 8-12 GB como RTX 3060, RTX 4060 Ti o RTX 3080.
- Cabe en GPU de consumo: sí, en RTX 4090 en F16; en GPUs de 8-12 GB solo con cuantizaciones más agresivas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (LoRA GGUF F16) | ~8B (base) + 41,9M adaptador | 128k (base) | Apache 2.0 | GGUF F16 | Roleplay NSFW, solo inglés |
| Llama 3.1 8B Instruct (Meta) | 8B | 128k | Llama 3.1 Community License | Safetensors, GGUF | Modelo general alineado, con filtros |
| Mistral 7B Instruct | 7B | 32k | Apache 2.0 | Safetensors, GGUF | Alternativa generalista, sin especialización NSFW |
| Modelos roleplay NSFW en GGUF (varios) | 7-13B | variable | variable | GGUF | Ecosistema amplio, calidad muy variable |

## Limitaciones y advertencias

- Contenido NSFW y para adultos: el modelo está diseñado para generar material explícito, lo que puede violar políticas de plataformas y requiere control de acceso en producción.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face, lo que limita su distribución automatizada.
- Solo inglés: no se documenta soporte multilingüe, por lo que su uso en castellano producirá resultados degradados.
- Riesgo de alucinación: como todo modelo de 8B, puede inventar hechos y mantener incoherencias en conversaciones largas.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento en roleplay NSFW puede amplificar estereotipos de género y contenido problemático.
- Licencia Apache 2.0 declarada, pero el modelo base Llama 3.1 tiene su propia licencia comunitaria que puede imponer restricciones adicionales al uso comercial; conviene verificar la compatibilidad.
- Sin benchmarks: no hay evidencia publicada de calidad frente a alternativas, por lo que la evaluación debe hacerse de forma empírica.
- F16 en GGUF: requiere hardware con suficiente VRAM; para producción en GPUs modestas habrá que recurrir a cuantizaciones menores no incluidas en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/arpan103/NSFW-RP-RolePlay-LoRA-ArliAI-Llama-3.1-8B-F16-GGUF
- Modelo base del adaptador: https://huggingface.co/mirazrafi/NSFW-RP-RolePlay-LoRA-ArliAI-Llama-3.1-8B
- Herramienta de conversión gguf-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
