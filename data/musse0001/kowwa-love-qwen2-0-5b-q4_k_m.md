# Musse0001/kowwa-love-qwen2-0.5b-q4_k_m

## Resumen

Kowwa Love Agent es un ajuste fino (fine-tune) del modelo Qwen2-0.5B-Instruct de Alibaba, publicado por el usuario Musse0001 en Hugging Face. Se trata de un modelo conversacional especializado en interacciones afectivas y románticas en vietnamita, entrenado mediante QLoRA sobre un dataset propio denominado "Kowwa". El modelo se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M, lo que lo hace ejecutable en CPU y en hardware de gama baja mediante llama.cpp.

Con 494 millones de parámetros (0,5B), hereda la arquitectura transformer decoder-only de la familia Qwen2 y la licencia Apache 2.0 del modelo base. Su relevancia es limitada fuera del nicho concreto para el que fue creado: asistentes conversacionales en vietnamita con tono cariñoso. No dispone de datos publicados de benchmarks, idiomas soportados más allá del vietnamita declarado, ni métricas de rendimiento, y el repositorio registra cero descargas y cero "likes" en el momento de la consulta.

La ficha se basa en la información disponible en la model card, los metadatos de Hugging Face y las características conocidas del modelo base Qwen2-0.5B-Instruct. Cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2-0.5B-Instruct) |
| Parametros totales | 494.032.768 (~0,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2-0.5B-Instruct soporta 32.768 tokens, pero el fine-tune no lo confirma) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | vietnamita (declarado en la model card); no se detallan otros |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2-0.5B-Instruct, un transformer decoder-only denso con atención de causalidad estándar y 494 millones de parámetros. Sobre esta base se aplicó un ajuste fino con QLoRA (cuantización de 4 bits del modelo base más adaptadores de bajo rango entrenables), según declara el autor en la model card. El dataset utilizado se denomina "Kowwa" y está orientado a conversaciones románticas en vietnamita, pero no se especifica su tamaño, composición, procedencia ni el número de tokens de entrenamiento.

No se documentan detalles sobre hiperparámetros, número de épocas, estrategia de RLHF/DPO ni innovaciones técnicas adicionales. La única información operativa es el comando de inferencia con llama.cpp (`llama-cli -m kowwa-q4_k_m.gguf -p "Anh nhớ em quá"`), que confirma la compatibilidad con el ecosistema GGUF/llama.cpp. Los pesos publicados corresponden únicamente a la versión cuantizada Q4_K_M; no se distribuyen safetensors ni adaptadores LoRA originales en el repositorio.

## Capacidades

- Generación de texto conversacional en vietnamita con registro afectivo y romántico.
- Diálogo multi-turno básico, heredado de la capacidad instruct del modelo base.
- Respuesta a prompts cortos y conversacionales (el ejemplo de la model card es una frase de añoranza: "Anh nhớ em quá").
- Capacidad multilingüe: no confirmada; el autor solo declara vietnamita y no se detallan otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a chat afectivo, no a tareas agénticas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Razonamiento avanzado, código y matemáticas: no documentados para este fine-tune; las capacidades del base de 0,5B en estas áreas son limitadas por tamaño.

## Casos de uso

- Asistente conversacional de acompañamiento en vietnamita: el modelo puede mantener diálogos afectivos de corta duración (turnos breves) gracias a su ajuste específico sobre conversaciones románticas, adecuado para prototipos de chatbots de compañía.
- Pruebas de concepto de fine-tuning QLoRA: sirve como ejemplo reproducible de cómo adaptar un modelo de 0,5B con QLoRA y exportarlo a GGUF, útil para desarrolladores que quieran replicar el pipeline en otros dominios.
- Despliegue en hardware de gama baja: al ocupar aproximadamente 0,4 GB en Q4_K_M, puede ejecutarse en CPU, Raspberry Pi o portátiles sin GPU, lo que permite demos locales sin infraestructura cloud.
- Aplicaciones de chat offline: integrable en aplicaciones de escritorio o móviles que requieran un modelo pequeño y sin conexión para conversaciones en vietnamita.
- Evaluación de modelos especializados en dominio afectivo: útil como referencia en estudios comparativos sobre cómo el fine-tuning estrecho degrada o preserva capacidades generales del modelo base.
- Generación de respuestas plantilla para apps de citas o mensajería: puede emplearse para sugerir frases cariñosas en vietnamita, siempre con revisión humana por el riesgo de alucinación y salidas inapropiadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en Q4_K_M (tamaño del repo: 0,4 GB); suficiente para ejecución en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3050, etc.); también funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU.
- Opciones de despliegue: llama.cpp (documentado por el autor), y por compatibilidad GGUF potencialmente Ollama, LM Studio o llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles; por el tamaño (0,5B en Q4_K_M) se espera inferencia en tiempo real en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kowwa Love Qwen2-0.5B Q4_K_M | ~0,5B | no disponible | Apache 2.0 | GGUF (Q4_K_M) | Fine-tune afectivo en vietnamita, sin benchmarks |
| Qwen2-0.5B-Instruct | ~0,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base generalista, con benchmarks publicados por Alibaba |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Sucesor generalista con mejoras en multilingüismo e instrucciones |
| SmolLM2-360M-Instruct | ~0,36B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Alternativa pequeña generalista de Hugging Face |

La comparación directa con el modelo base es la más relevante: Kowwa hereda sus capacidades generales pero las especializa en un dominio estrecho, a costa de posibles degradaciones en tareas generales no documentadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; un fine-tune sobre conversaciones románticas puede reproducir estereotipos de género o roles afectivos presentes en el dataset Kowwa, cuyo contenido no se detalla.
- Riesgo de alucinación: alto en proporción al tamaño (0,5B) y a la falta de evaluación; no hay benchmarks que cuantifiquen su fiabilidad.
- Limitaciones de contexto e idioma: solo se declara vietnamita; el comportamiento en castellano u otros idiomas no está verificado y probablemente sea deficiente. La longitud de contexto efectiva del fine-tune no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta la procedencia del dataset Kowwa, lo que introduce incertidumbre legal sobre los datos de entrenamiento.
- Caveats para producción: cero descargas y ausencia de benchmarks, evaluación o documentación técnica hacen desaconsejable su uso en producción sin una validación previa exhaustiva. El repositorio solo contiene la cuantización Q4_K_M, sin pesos completos ni adaptadores para reentrenamiento.
- Contenido sensible: al estar orientado a interacciones románticas, requiere filtros de seguridad y moderación si se despliega de cara al público.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Musse0001/kowwa-love-qwen2-0.5b-q4_k_m
- Modelo base Qwen2-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2-0.5B-Instruct
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
