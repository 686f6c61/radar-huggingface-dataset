# llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1

## Resumen

Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1 es un ajuste fino (finetune) del modelo ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B, publicado por el usuario independiente llmfan46. Se trata de una versión "decensored" (abliterated) generada con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA), cuyo objetivo es eliminar los mecanismos de rechazo del modelo original para permitir contenido explícito, roleplay adulto, horror y violencia sin filtros.

El modelo conserva la arquitectura y el tamaño del original: 23.572.403.200 parámetros (aproximadamente 24B), pesos en safetensors y un repositorio de 47,5 GB. Está etiquetado para generación de texto conversacional en inglés y orientado a casos de uso de rol, narrativa explícita y ERP (Erotic Roleplay), con etiquetas que incluyen nsfw, unaligned, heretic, abliterated y not-for-all-audiences.

Su relevancia radica en que documenta de forma cuantificada el compromiso entre eliminar rechazos y preservar capacidades: según la model card, reduce los rechazos de 91/100 a 2/100 con una divergencia KL de 0,0262 respecto al original, y mantiene puntuaciones PIQA cercanas (acc_norm 0,8308 frente a 0,8379). Es un modelo de nicho, con muy poca tracción (18 descargas, 2 likes) y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Mistral según tags; detalles no especificados) |
| Parametros totales | 23.572.403.200 (~24B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; safetensors en el repo principal; otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo principal), GGUF (repo secundario) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los tags de Hugging Face indican "mistral", lo que sugiere una familia de transformer decoder-only, pero no se confirman capas, atención, dimensión oculta ni composición del dataset de entrenamiento original. Tampoco se especifican tokens de entrenamiento, uso de RLHF/DPO ni innovaciones técnicas del modelo base.

La innovación documentada de esta versión es el proceso de abliteration con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Los parámetros declarados son: start_layer_index 10, end_layer_index 34, preserve_good_behavior_weight 0,6256, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 1,0453 y neighbor_count 5, con intervención sobre el componente attn.o_proj. El resultado reportado es una divergencia KL de 0,0262 frente al original y una reducción de rechazos de 91/100 a 2/100.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Roleplay y narrativa explícita: el ajuste está diseñado para ERP, contenido erótico, horror y violencia sin rechazos.
- Reducción drástica de rechazos y sermones: 2/100 rechazos frente a 91/100 del original según la model card.
- Razonamiento físico básico preservado: PIQA acc_norm 0,8308.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión, audio ni modo thinking.
- No se documenta decodificación especulativa ni optimizaciones de inferencia específicas.

## Casos de uso

- Roleplay conversacional adulto: el modelo está afinado para mantener personajes y escenas explícitas sin rechazos, lo que lo hace adecuado para plataformas de ficción interactiva para adultos con moderación propia.
- Narrativa de horror y violencia gráfica: la abliteration elimina las respuestas de rechazo ante descripciones violentas, útil para escritura de guiones o ficción de género oscuro.
- Generación de ficción erótica: permite continuar relatos explícitos sin softening ni deflexiones, reduciendo la fricción en herramientas de escritura creativa para adultos.
- Simulación de personajes en videojuegos para adultos: puede emplearse como motor de diálogo de NPCs en títulos con contenido explícito, siempre que la licencia lo permita (no declarada).
- Investigación sobre alineación y abliteration: sirve como caso de estudio reproducible del método Heretic/ARA, con métricas de KL y PIQA publicadas para comparar con el original.
- Evaluación de robustez de filtros: útil para probar sistemas de moderación de contenido, ya que genera material explícito de forma consistente y predecible.
- Prototipado de chatbots sin restricciones en entornos controlados: para pruebas internas de flujos conversacionales donde los rechazos del modelo base interferirían.

## Benchmarks y rendimiento

| Benchmark | Modelo original | Este modelo (Heretic v1) |
|---|---|---|
| PIQA acc | 0,8221 ± 0,0089 | 0,8248 ± 0,0089 |
| PIQA acc_norm | 0,8379 ± 0,0086 | 0,8308 ± 0,0087 |
| Rechazos (100 prompts) | 91/100 | 2/100 |
| KL divergence vs original | 0 (por definición) | 0,0262 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 47 GB solo para pesos, por lo que se necesitan GPUs de 48 GB o más (A100 80GB, H100, L40S 48GB) o sharding multi-GPU.
- VRAM estimada en cuantización GGUF Q4: en torno a 14-16 GB, viable en RTX 4090 (24 GB), RTX 3090 (24 GB) y GPUs de 16 GB con contexto reducido.
- VRAM estimada en Q8: aproximadamente 25-27 GB, requiere A100 40GB, RTX 6000 Ada o similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4/Q5; en GPUs de 16 GB solo con cuantizaciones más agresivas y contexto corto.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors en FP16/BF16; transformers para uso directo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Omega-Darker-Gaslight 24B heretic v1) | ~24B | no disponible | Roleplay explícito sin filtros | no disponible | Hugging Face (18 descargas) |
| ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B | ~24B | no disponible | Modelo base con alineación estándar | no disponible | Hugging Face |
| Modelos abliterated de la familia Mistral (p. ej. variantes 7B/8B) | 7-8B | variable | Roleplay sin filtros | variable (a menudo Apache 2.0 en la base) | Hugging Face |
| Mistral Small / Mistral NeMo (referencia de la familia) | 22-24B | 32K-128K según variante | Uso general alineado | Apache 2.0 (en la base) | Hugging Face, API |

La comparación con alternativas de la misma categoría es limitada porque no se dispone de datos de contexto ni de benchmarks comunes más allá de PIQA. El modelo base no declara licencia, lo que dificulta la comparación legal con alternativas de licencia abierta.

## Limitaciones y advertencias

- Contenido explícito y potencialmente perturbador: el modelo está diseñado para generar material NSFW, violencia y horror sin filtros; no es apto para menores ni para entornos sin moderación.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; al ser un finetune orientado a rol, la precisión factual no está garantizada.
- Sesgos: no se documentan evaluaciones de sesgo; la abliteration puede alterar comportamientos de seguridad más allá del rechazo superficial.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está verificado.
- Contexto: no disponible; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia no declarada: no hay permiso explícito para uso comercial; además, el modelo base tampoco declara licencia, lo que añade incertidumbre legal.
- Tracción mínima: 18 descargas y 2 likes; no hay evidencia de comunidad, soporte ni validación independiente.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, por lo que la disponibilidad futura del repositorio no está garantizada.
- La model card incluye peticiones de donación y enlaces de apoyo; no deben interpretarse como instrucciones técnicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1
- Versión GGUF: https://huggingface.co/llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
