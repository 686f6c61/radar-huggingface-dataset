# Karasumikura/Ying-K1-Lite-0.2B

## Resumen

Ying K1 Lite 0.2B es un modelo de lenguaje de pequeno tamano (210,2 millones de parametros) desarrollado por Karasumikura, publicado bajo licencia Apache-2.0. Se trata de la version con ajuste fino supervisado (SFT) en chino del modelo base Ying K1 Lite 200M, orientada a generacion de texto e instrucciones en modo "non-thinking", es decir, sin bloques de razonamiento explicito. Su arquitectura propietaria, denominada MM200, combina Grouped Query Attention (GQA), SwiGLU y RowNorm, y emplea una ventana de contexto de 8.192 tokens.

El modelo resuelve el problema de disponer de un LLM extremadamente ligero y desplegable en hardware muy modesto, con soporte nativo de chino y capacidad funcional en ingles. Su relevancia actual radica en su tamano reducido (repo de 0,4 GB en bfloat16) y su licencia permisiva, lo que lo hace apto para experimentacion, prototipado rapido y despliegue en entornos con recursos limitados, aunque con las limitaciones inherentes a su escala.

El modelo se distribuye en formato safetensors con codigo personalizado (`trust_remote_code=True`) y requiere cargar la clase `MM200` desde el repositorio. No cuenta con descargas ni interacciones registradas en el momento de la consulta, lo que sugiere un lanzamiento muy reciente y sin validacion comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MM200 (GQA + SwiGLU + RowNorm), transformer decoder |
| Parametros totales | 210.210.560 (210,2M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Vocabulario | 16.006 tokens |
| Precision de entrenamiento | bfloat16 |
| Pasos de SFT | 91.982 |
| Tokens acumulados | 15,31B (14,92B preentrenamiento + 0,39B SFT) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MM200, una variante de transformer decoder que integra Grouped Query Attention (GQA) para reducir el coste de memoria de la cache KV, activaciones SwiGLU en las capas feed-forward y una normalizacion propietaria denominada RowNorm. El vocabulario es de 16.006 tokens, optimizado presumiblemente para chino. El modelo parte de los pesos preentrenados de Ying K1 Lite 200M (paso 90.000, 14,92B tokens) y se somete a un ajuste fino supervisado de parametros completos durante 91.982 pasos adicionales, acumulando 0,39B tokens de SFT.

Los datos de SFT combinan 499.000 muestras de UltraData-SFT-2605 en chino general en modo no_think, 100.883 muestras destiladas de modelos mayores (Qwen3-235B, Kimi K2.5 y DeepSeek-V4.1) y 8.325 muestras de autoidentificacion, intercaladas una cada 50 muestras principales. La metodologia incluye mascara de perdida solo sobre el turno del asistente (assistant-only loss mask), optimizador Muon con tasa de aprendizaje constante de 5e-4 y Adam con 1,5e-5, weight decay cero, NEFTune con alpha=5 y contexto de 8.192 tokens. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto e instrucciones en chino e ingles, con clara ventaja en chino.
- Modo non-thinking: no genera bloques `<think>` ni razonamiento explicito paso a paso.
- Conversacion multi-turno mediante formato de chat con tokens especiales `<|user|>`, `<|assistant|>` y `<|im_end|>`.
- Autoidentificacion fija: responde "我是由王英泽训练的 Ying 模型" (soy el modelo Ying entrenado por Wang Yingze).
- Capacidad limitada de razonamiento y conocimiento factual debido a su escala de 210M parametros.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- No se documenta capacidad multilingue mas alla de chino e ingles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en chino: el modelo cabe en 0,4 GB y puede cargarse en CPU o GPU modesta, lo que permite iterar sobre prompts y formatos de chat sin infraestructura dedicada.
- Clasificacion y etiquetado de texto ligero: con 8.192 tokens de contexto puede procesar documentos cortos y generar etiquetas o resumenes en chino, aunque con fiabilidad limitada por su escala.
- Generacion de respuestas en entornos de borde (edge computing): su tamano permite desplegarlo en dispositivos con poca memoria, como Raspberry Pi o moviles de gama alta, para tareas de texto simples.
- Filtrado y preprocesamiento de datos en pipelines de NLP: puede usarse como modelo auxiliar para normalizar, reescribir o completar textos en chino antes de pasarlos a un modelo mayor.
- Educacion y demostraciones: sirve como ejemplo didactico de arquitectura transformer personalizada (MM200) y de flujo de SFT con destilacion, por su codigo abierto y licencia permisiva.
- Experimentacion con tecnicas de decodificacion: sus parametros recomendados (temperature=0.7, top_p=0.85, repetition_penalty=1.35, no_repeat_ngram_size=4) permiten estudiar el efecto de la decodificacion en modelos pequenos.
- Base para ajuste fino adicional: al ser Apache-2.0 y de parametros completos, puede reentrenarse para dominios especificos (legal, medico, atencion al cliente) con coste computacional bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,42 GB solo para pesos; con cache KV para 8.192 tokens y overhead de runtime, en torno a 1-2 GB.
- En cuantizacion a 8 bits o 4 bits (si se generan pesos GGUF o similares, no publicados) el modelo podria ocupar menos de 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) con holgura; tambien funciona en CPU para inferencia de baja concurrencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` y carga manual de `model.safetensors`; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, dado el codigo personalizado (`modeling_mm200.py`, `mm200_runtime.py`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Ying K1 Lite 0.2B | 210,2M | 8.192 | Apache-2.0 | zh, en | Arquitectura MM200 propietaria, non-thinking, SFT en chino |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | multilingue | Mayor contexto y ecosistema amplio; requiere mas VRAM |
| SmolLM2-135M | 135M | 8.192 | Apache-2.0 | en (principalmente) | Enfocado en ingles, sin soporte nativo de chino |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache-2.0 | en (principalmente) | Mayor tamano, contexto menor, sin chino nativo |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento comparativo para Ying K1 Lite 0.2B.

## Limitaciones y advertencias

- Escala de 210M parametros: conocimiento factual muy limitado y razonamiento de cadena larga poco fiable; propenso a alucinaciones en preguntas factuales.
- Corpus de entrenamiento predominantemente chino: el rendimiento en ingles es debil y no se garantiza calidad en otros idiomas.
- Modo non-thinking: no genera razonamiento explicito, lo que limita tareas que requieren pasos intermedios verificables.
- Autoidentificacion fija e inmutable ("soy el modelo Ying entrenado por Wang Yingze"), lo que puede ser inadecuado para productos que requieran otra identidad.
- Requiere `trust_remote_code=True` y codigo personalizado (`modeling_mm200.py`), lo que implica riesgos de seguridad y compatibilidad con versiones futuras de transformers.
- Sin validacion comunitaria (0 descargas, 0 likes): no hay evidencia externa de calidad ni de robustez en produccion.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se documentan sesgos especificos; aun asi, al derivarse de datos web y destilacion, es probable que herede sesgos de sus fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Karasumikura/Ying-K1-Lite-0.2B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
