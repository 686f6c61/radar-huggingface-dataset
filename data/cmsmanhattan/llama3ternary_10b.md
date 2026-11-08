# CMSManhattan/Llama3Ternary_10b

## Resumen

Llama3Ternary_10b es un derivado ternario (1,58 bits) del modelo Meta Llama 3 8B, publicado por CMSManhattan (Center Business Solutions inc), una organización vinculada al inventor Konstantin Vladimirovich Grabko. El modelo parte de los pesos de Llama 3 8B, les aplica un ensanchamiento de la capa FFN hasta situar el recuento de parámetros en torno a 9.640 millones, y posteriormente cuantiza los pesos a valores ternarios {-1, 0, 1}, una técnica conocida como BitNet o 1.58-bit. El objetivo es ofrecer un modelo conversacional de bajo consumo de memoria que pueda ejecutarse en CPUs convencionales mediante los kernels AVX2/AVX-512 de Microsoft BitNet.cpp.

La relevancia del modelo radica en su propuesta de eficiencia extrema: según LLM Explorer, el artefacto ternario ocuparía unos 2,8 GB de VRAM equivalente, lo que lo sitúa en el rango de equipos de consumo y servidores sin GPU dedicada. No obstante, el autor advierte explícitamente de que el checkpoint GGUF ternario no carga en llama.cpp estándar y requiere BitNet.cpp, lo que limita su interoperabilidad con el ecosistema habitual de inferencia.

Se trata de un modelo solo para inglés, con licencia Llama 3 Community License, orientado a chat de un solo turno y a adaptación de dominio mediante LoRA. El repositorio pesa 54,2 GB e incluye pesos en safetensors y GGUF, aunque los pesos originales en FP16 no se publican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 3 8B, con FFN ensanchada y pesos ternarios (BitNet / 1.58-bit) |
| Parametros totales | 9.640.873.984 (aprox. 9,64B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K segun LLM Explorer; los ejemplos de despliegue usan 4096 y 8192 tokens |
| Tipos de cuantizacion | Ternaria {-1, 0, 1} empaquetada (TQ2_0); GGUF Q8 como cuantizacion de compatibilidad |
| Idiomas soportados | Ingles |
| Licencia | Llama 3 Community License (etiquetada como bsl-1.0 en los metadatos de HF) |
| Formato de pesos | safetensors, GGUF |
| Modelo base | meta-llama/Meta-Llama-3-8B |
| Tamano del repositorio | 54,2 GB |
| Runtime de inferencia | BitNet.cpp (Microsoft), no compatible con llama.cpp estandar |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura transformer decoder-only de Llama 3 8B. La modificación principal consiste en ensanchar la capa feed-forward para elevar el recuento de parámetros de aproximadamente 8B a unos 9,64B, tras lo cual los pesos se cuantizan a valores ternarios en el conjunto {-1, 0, 1}. Esta representación de 1,58 bits por peso es la característica definitoria de la familia BitNet y permite reducir drásticamente el espacio de almacenamiento y el ancho de banda de memoria en inferencia. El autor no detalla en la model card el proceso exacto de entrenamiento tras la cuantizacion (si hubo QAT completa, distillation o simple post-training quantization), ni el volumen de tokens utilizado.

Sí se menciona la disponibilidad de servicios de reentrenamiento con QAT/SFT y empaquetado para los kernels de BitNet.cpp, así como la posibilidad de adaptar el modelo mediante LoRA. Los pesos FP16 originales no se publican, solo los artefactos cuantizados. El paquete GGUF ternario principal se denomina `Llama3Ternary-10b-TQ2_0.gguf` y está pensado para ejecutarse con los kernels AVX2/AVX-512 de BitNet.cpp, que según el autor es "mucho más rápido que llama.cpp" en este tipo de pesos.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat compatible con las plantillas de Llama 3 (`<|begin_of_text|>`, `<|start_header_id|>`, etc.).
- Razonamiento basico y respuesta a preguntas generales, condicionado por la perdida de calidad inherente a la cuantizacion ternaria.
- No se documenta soporte explicito de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (el campo `language` declara solo `en`).
- No dispone de vision, audio ni modo thinking.
- El autor recomienda inferencia en modo greedy (temperatura 0) y sin penalizacion por repeticion como configuracion "verificada como mejor" para este modelo.
- El despliegue por defecto es de un solo turno (`HISTORY_TURNS=0`), reflejando el regimen de entrenamiento.

## Casos de uso

- Chat ligero en CPU sin GPU: el modelo puede desplegarse en servidores Xeon v2 con DDR3 mediante la imagen Docker oficial (`cmsmanhattan/llama3-ternary-10b-tq2`), lo que permite ofrecer un asistente conversacional en hardware antiguo o de bajo coste.
- Prototipado y demos en Hugging Face Spaces: existe un Space oficial de chat en vivo, adecuado para evaluar la calidad del modelo antes de invertir en infraestructura.
- Asistente embebido en entornos con restricciones de memoria: con un artefacto ternario de aproximadamente 2,8 GB equivalentes, encaja en dispositivos con poca RAM donde un modelo de 8B en FP16 no cabría.
- Adaptacion de dominio mediante LoRA: el autor promociona el fine-tuning barato con LoRA para PYMES, lo que permitiría especializar el modelo en vocabulario y hechos de un sector concreto.
- API compatible con OpenAI para integraciones internas: la imagen Docker expone `/v1/chat/completions` en el puerto 7869, lo que facilita conectar herramientas existentes que ya hablan el protocolo OpenAI.
- Experimentacion academica con cuantizacion ternaria: sirve como banco de pruebas para estudiar el impacto de 1,58 bits en la calidad de un modelo Llama 3, comparando con el original en FP16.
- Sustitucion de llama.cpp en pipelines CPU-only: para equipos que ya operan cargas de inferencia en CPU y quieren evaluar el ahorro de memoria de BitNet.cpp frente a GGUF convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput. LLM Explorer únicamente menciona un requisito estimado de VRAM de 2,8 GB y contexto de 8K, sin datos de calidad.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,8 GB según LLM Explorer para el artefacto ternario; el repositorio completo pesa 54,2 GB por incluir múltiples formatos.
- No requiere GPU: el runtime principal es BitNet.cpp sobre CPU con instrucciones AVX2 o AVX-512.
- El autor indica compatibilidad con Xeon v2 y memoria DDR3, lo que sitúa el mínimo hardware muy por debajo de lo habitual para un modelo de ~10B.
- GPU: no se documentan requisitos ni recomendaciones de GPU (A100, H100, RTX 4090) para este artefacto; el enfoque declarado es CPU.
- Despliegue: BitNet.cpp (compilado desde el repositorio oficial de Microsoft), imagen Docker `cmsmanhattan/llama3-ternary-10b-tq2:latest` (linux/amd64) con UI web JiRack y proxy OpenAI en el puerto 7869, y llama-server en la variante indicada por el autor.
- Configuración de referencia del autor: 24 hilos (`THREADS=24`), contexto 4096, temperatura 0, top_p 0.9, repeat_penalty 1.0, max_tokens 512, un solo turno de historial.
- Latencia y throughput: no disponibles.
- Advertencia: fijar el commit de BitNet.cpp probado, ya que una versión más reciente de upstream puede romper la compatibilidad con el GGUF personalizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama3Ternary_10b | 9,64B | 8K | Ternaria 1,58 bits | BitNet.cpp | Llama 3 Community | Hugging Face, Docker |
| Llama 3 8B (Meta) | 8B | 8K | FP16, INT8, GGUF | llama.cpp, vLLM, TGI | Llama 3 Community | Hugging Face |
| Llama3Ternary_2b (mismo autor) | no disponible | no disponible | Ternaria | BitNet.cpp | Llama 3 Community | Hugging Face, HF Spaces |
| JiRack_10b (mismo autor) | no disponible | no disponible | no disponible | no disponible | Llama 3 Community | Hugging Face |

La comparación directa con Llama 3 8B original es la más informativa: mismo origen y licencia, pero el ternario sacrifica calidad de forma no cuantificada en la documentación a cambio de reducir el peso del artefacto en un orden de magnitud y habilitar inferencia en CPU. Frente a otras alternativas de cuantización estándar (GGUF Q4/Q8 en llama.cpp), la ventaja es el ahorro de memoria, y la desventaja es la dependencia de un runtime no estándar.

## Limitaciones y advertencias

- La cuantizacion ternaria implica una pérdida de calidad frente al Llama 3 8B original; el autor no publica métricas que cuantifiquen esa degradación.
- El GGUF ternario no carga en llama.cpp estándar; requiere BitNet.cpp, lo que reduce la portabilidad y complica el mantenimiento ante cambios upstream.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- El modelo está pensado para un solo turno (`HISTORY_TURNS=0`); el rendimiento en conversaciones multi-turno puede degradarse.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento extendido.
- Riesgo de alucinación no evaluado; no hay benchmarks publicados que permitan estimarlo.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia: Llama 3 Community License, con las restricciones habituales de Meta (incluida la cláusula de 700 millones de usuarios mensuales y las políticas de uso aceptable). Los metadatos de Hugging Face etiquetan el modelo como `bsl-1.0`, lo que genera ambigüedad y conviene verificar antes de un uso comercial.
- Los pesos FP16 no se publican, lo que limita la reproducibilidad y la posibilidad de recuantizar fuera del ecosistema BitNet.
- La documentación del autor mezcla servicios comerciales (reentrenamiento, adaptación de dominio) con la ficha técnica, y contiene erratas; conviene tratar las afirmaciones de rendimiento sin verificar con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/Llama3Ternary_10b
- GGUF ternario: https://huggingface.co/CMSManhattan/Llama3Ternary_10b/blob/main/Llama3Ternary-10b-TQ2_0.gguf
- Space de chat en vivo (10b): https://huggingface.co/spaces/CMSManhattan/Llama3Ternary_10b
- Space de chat en vivo (2b): https://huggingface.co/spaces/CMSManhattan/Llama3Ternary_2b
- Modelo hermano Llama3Ternary_2b: https://huggingface.co/CMSManhattan/Llama3Ternary_2b
- Modelo hermano JiRack_10b: https://huggingface.co/CMSManhattan/JiRack_10b
- Modelo hermano JiRack Ultra 1b: https://huggingface.co/CMSManhattan/JiRackUltra_1b
- Spaces JiRack (36B, 16B, 8B, 2B): https://huggingface.co/spaces/CMSManhattan/JiRack-36B-Chat , https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat , https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat , https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
- Repositorio BitNet.cpp de Microsoft: https://github.com/microsoft/BitNet
- Sitio del autor: https://www.cmsmanhattan.com
- Ficha en LLM Explorer: https://llm-explorer.com/model/CMSManhattan%2FLlama3Ternary_10b,4zlLcnoTkmQlxaMlA5nCqK
- Licencia Llama 3: https://www.llama.com/llama3/license/
