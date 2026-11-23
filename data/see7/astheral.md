# SEE7/Astheral

## Resumen

Astheral es un modelo de generación de texto de 8.030.261.248 parámetros (8,03 B) publicado por el usuario SEE7 en Hugging Face. Se trata de un ajuste fino supervisado del checkpoint NousResearch/DeepHermes-3-Llama-3-8B-Preview, que a su vez deriva de la familia Llama 3.1 de Meta. El modelo se distribuye con pesos fusionados en BF16 resultantes de una ejecución QLoRA de rango 16, y está orientado a instrucciones y conversación en inglés.

La relevancia del modelo es limitada y muy específica: se trata de un experimento de ajuste fino de un único autor, con un volumen de entrenamiento reducido (1.713 ejemplos y 180 pasos de optimizador) y una adopción mínima en la plataforma (404 descargas y 2 likes en el momento de la consulta). No obstante, hereda la arquitectura y la ventana de contexto de Llama 3.1 8B, lo que lo hace potencialmente utilizable como punto de partida para prototipos o para estudiar el efecto de un ajuste fino ligero sobre DeepHermes-3.

El modelo soporta modos "instruct" y "thinking", y el Space asociado permite instrucciones de proyecto y hasta 4.096 tokens generados. La licencia aplicable es la Llama 3.1, con las restricciones habituales de la comunidad Llama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), pesos fusionados de un ajuste QLoRA rango 16 |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 8B soporta 128K, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones en la model card |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.1 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 8,03 B parámetros, heredado de Llama 3.1 8B a través de DeepHermes-3-Llama-3-8B-Preview. El ajuste fino se realizó con QLoRA de rango 16, generando 41.943.040 parámetros de adaptador, sobre un conjunto de 1.713 ejemplos de entrenamiento y 180 pasos de optimizador. Los pesos publicados son los adaptadores fusionados con el modelo base en BF16, de modo que el checkpoint se carga directamente con Transformers sin necesidad de aplicar LoRA en tiempo de inferencia.

No se documenta en la información disponible la composición del dataset de ajuste, el número de tokens de entrenamiento, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas propias más allá de la herencia del modelo base (DeepHermes-3), que incorpora modos de razonamiento "thinking" e "instruct". El volumen de entrenamiento es muy reducido, lo que sugiere un ajuste de estilo o de formato más que una modificación sustancial de capacidades.

## Capacidades

- Generación de texto conversacional e instruccional en inglés.
- Modo "thinking" (razonamiento explícito) y modo "instruct", heredados de DeepHermes-3.
- Soporte de conversaciones multi-turno a través de la plantilla de chat del modelo base.
- Generación de hasta 4.096 tokens en el Space alojado (límite de la demo, no necesariamente del modelo).
- Soporte de instrucciones de proyecto en el Space (system prompt persistente).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multimodales.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede cargarse en BF16 con Transformers y usarse como base para demos de chat con system prompt e historial multi-turno, aprovechando el formato instruct heredado de DeepHermes-3.
- Experimentación académica sobre ajuste fino ligero: al ser un QLoRA de rango 16 con solo 1.713 ejemplos, sirve como caso de estudio reproducible para medir el impacto de un ajuste de bajo coste sobre un modelo base de 8 B.
- Evaluación comparativa de modos de razonamiento: permite contrastar respuestas en modo "thinking" frente a modo "instruct" sobre las mismas preguntas, útil para investigar el efecto del razonamiento explícito en tareas de lógica sencilla.
- Generación de texto asistida en inglés para borradores y resúmenes: adecuado para tareas de redacción no críticas donde el coste de un 8 B en BF16 sea asumible.
- Base para fine-tunes posteriores: al estar publicado en safetensors BF16 y con licencia Llama 3.1, puede servir como punto de partida para nuevos adaptadores LoRA en dominios específicos.
- Despliegue en demo con Gradio/Spaces: el autor ya ofrece un Space funcional con instrucciones de proyecto, lo que facilita replicar el entorno para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8,03 B × 2 bytes), más overhead de KV cache y activaciones; en la práctica se recomiendan 20-24 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para BF16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits (no documentada por el autor, pero aplicable vía bitsandbytes/llama.cpp), en GPUs de 12-16 GB como RTX 4080 o 4070 Ti.
- Opciones de despliegue: Transformers (BF16, según la model card), text-generation-inference (tag incluido en el repo), vLLM y llama.cpp son compatibles con la arquitectura Llama 3.1, aunque no se documentan recetas específicas para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SEE7/Astheral | 8,03 B | No disponible (base Llama 3.1: 128K) | Llama 3.1 | Hugging Face + Space |
| NousResearch/DeepHermes-3-Llama-3-8B-Preview | 8 B | 128K (según model card del base) | Llama 3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8 B | 128K | Llama 3.1 | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2 B | 32K | Apache 2.0 | Hugging Face |

Astheral se posiciona como un derivado de DeepHermes-3 con un ajuste fino adicional muy ligero; frente a Llama 3.1 8B Instruct y Mistral 7B Instruct, su principal diferencia es el soporte de modo "thinking" heredado y un conjunto de entrenamiento propio no documentado en detalle. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Volumen de entrenamiento muy reducido (1.713 ejemplos, 180 pasos), lo que limita la magnitud y la generalización del ajuste.
- Solo inglés documentado; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de 8 B, no mitigado de forma documentada.
- Sesgos potenciales heredados de Llama 3.1 y de DeepHermes-3, sin evaluación de sesgos publicada por el autor.
- Licencia Llama 3.1: uso comercial permitido con condiciones (política de uso aceptable, atribución "Built with Llama", nomenclatura del modelo y restricciones para empresas con más de 700 millones de usuarios mensuales).
- No se documentan evaluaciones de seguridad, red teaming ni filtros de contenido.
- Adopción muy baja (404 descargas, 2 likes), lo que reduce la probabilidad de que los fallos hayan sido reportados por la comunidad.
- Sin datos de benchmarks ni de latencia/throughput; no recomendable para producción crítica sin una evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SEE7/Astheral
- Space de chat: https://huggingface.co/spaces/SEE7/Astheral
- Resultados de entrenamiento y evaluación: https://huggingface.co/SEE7/Astheral/tree/main/v3-results
- Experimentos extendidos: https://huggingface.co/SEE7/Astheral/tree/v3-expanded-20261113
- Modelo base: https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-8B-Preview
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
