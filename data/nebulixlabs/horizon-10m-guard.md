# Nebulixlabs/Horizon-10M-Guard

## Resumen

Horizon-10M-Guard es un modelo de clasificación de seguridad y moderación de contenido desarrollado por Nebulixlabs, construido mediante fine-tuning supervisado (SFT) sobre el modelo base Nebulixlabs/Horizon-10M-Base. Se presenta como un guard model ultracompacto de aproximadamente 12,68 millones de parámetros reales (el autor indica ~10,06M en su model card) que evalúa un texto de entrada y emite un veredicto binario —`safe` o `unsafe`— junto con una subcategoría de riesgo asociada.

El modelo emplea una arquitectura transformer decoder-only de estilo Llama, con 6 capas, dimensión oculta de 320, 5 cabezas de atención con `head_dim` de 64, MLP con activación SwiGLU de tamaño 864, normalización RMSNorm en configuración pre-norm y codificación posicional rotatoria (RoPE). El vocabulario es de 8.192 tokens con un tokenizador BPE de nivel de byte personalizado. Su ventana de contexto es de solo 128 tokens, lo que restringe drásticamente la longitud de los textos que puede procesar.

Su relevancia es fundamentalmente experimental y educativa: demuestra cómo arquitecturas decoder modernas pueden adaptarse a tareas de clasificación en entornos con recursos muy limitados (edge AI). No obstante, el propio autor reconoce una precisión global de aproximadamente el 60 % y lo etiqueta explícitamente como no apto para moderación en producción de forma autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Llama: RoPE, SwiGLU, RMSNorm pre-norm) |
| Parametros totales | 12.681.280 (safetensors); el autor indica ~10,06M en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 6 capas, `d_model` de 320 y 5 cabezas de atención (`head_dim` = 64). Usa SwiGLU en el MLP con tamaño oculto de 864, RMSNorm pre-norm y RoPE como codificación posicional. El tokenizador es un BPE de nivel de byte personalizado con un vocabulario de 8.192 tokens. El modelo base es Nebulixlabs/Horizon-10M-Base, sobre el que se aplicó un fine-tuning supervisado (SFT) para la tarea de clasificación de seguridad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de SFT, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card indica que el modelo debe usarse con `trust_remote_code=True` y expone un método `generate_text` propio, lo que implica código personalizado en el repositorio.

## Capacidades

- Clasificación de seguridad de texto: emite un veredicto binario `safe` / `unsafe`.
- Etiquetado de subcategoría de riesgo o temática asociada al texto de entrada.
- Generación de texto limitada, heredada de su base decoder-only, aunque su fine-tuning está orientado a clasificación.
- Procesamiento de textos de hasta 128 tokens (entradas más largas deben truncarse).
- Uso en entornos edge por su reducido tamaño (12,68M parámetros, repo de 0,1 GB).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Filtro de primera línea en dispositivos edge: el modelo puede ejecutarse en hardware muy limitado para prefiltrar entradas cortas (por ejemplo, mensajes de chat de menos de 128 tokens) antes de enviarlas a un moderador más grande, reduciendo coste y latencia en el camino crítico.
- Prototipado e investigación de guard models: sirve como baseline reproducible para estudiar cómo arquitecturas decoder minúsculas se comportan en tareas de clasificación de seguridad, comparando curvas de precisión frente a tamaño.
- Clasificación de prompts cortos en pipelines de bajo coste: para consultas de una sola frase, puede integrarse como paso de triaje en un sistema de enrutamiento que derive los casos dudosos a un modelo mayor.
- Educación y demos de moderación: útil en talleres y entornos docentes para ilustrar el ciclo completo de SFT sobre un modelo base y las limitaciones de los modelos ultracompactos.
- Etiquetado asistido de datasets: puede emplearse como preetiquetador de grandes volúmenes de textos cortos, con revisión humana posterior dado su ~60 % de precisión.
- Experimentación con despliegue en microcontroladores y SBC: su tamaño permite probar inferencia en placas tipo Raspberry Pi o similares, evaluando latencia y consumo en escenarios reales de edge AI.
- No se recomienda como único moderador en producción, tal como advierte el propio autor.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Precision global (accuracy) | ~60 % | Evaluado en prompts de clasificación de seguridad reservados (held-out) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la precisión global de ~60 % reportada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (12,68M parámetros en fp32 ≈ 51 MB de pesos, más overhead de activaciones y tokenizador); en la práctica, cualquier GPU con 1-2 GB libres es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: transformers (con `trust_remote_code=True`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el uso de código personalizado puede complicar su integración en estos frameworks.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Precision reportada | Disponibilidad |
|---|---|---|---|---|---|
| Horizon-10M-Guard | 12,68M | 128 | Apache 2.0 | ~60 % (clasificación de seguridad) | Hugging Face |
| Llama Guard (Meta) | 7B / 8B | 4K-8K | Llama Community License | No disponible en esta ficha | Hugging Face |
| ShieldGemma (Google) | 2B / 9B / 27B | 8K | Gemma Terms | No disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para establecer una comparación cuantitativa rigurosa. La comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Precisión global de ~60 %: insuficiente para moderación autónoma en producción, tal como advierte el propio autor.
- Ventana de contexto de solo 128 tokens: no puede procesar documentos o conversaciones largas sin truncar, lo que puede generar clasificaciones erróneas por pérdida de información.
- Solo inglés: no se declara soporte para otros idiomas; su uso en castellano u otras lenguas no está validado.
- Modelo experimental: no hay documentación sobre sesgos, composición del dataset de entrenamiento ni procesos de mitigación.
- Riesgo de alucinación y falsos positivos/negativos en la clasificación, dado el reducido tamaño y la baja precisión reportada.
- Requiere `trust_remote_code=True` y código personalizado (`generate_text`), lo que implica revisar el código del repositorio antes de usarlo en entornos sensibles.
- Licencia Apache 2.0: permite uso comercial, pero la baja precisión y el carácter experimental desaconsejan su uso como único sistema de moderación.
- No se documentan técnicas de calibración ni umbrales recomendados para la decisión `safe`/`unsafe`.

## Enlaces

- Hugging Face: https://huggingface.co/Nebulixlabs/Horizon-10M-Guard
- Modelo base: https://huggingface.co/Nebulixlabs/Horizon-10M-Base
- GitHub de NebulixLabs: https://github.com/NebulixLabs
- Perfil de Hugging Face de Nebulixlabs: https://huggingface.co/Nebulixlabs
- Instagram de Nebulix Labs: https://instagram.com/nebulix_labs
