# inaciose/nanochat-d20-v1-sft

## Resumen

nanochat d20 v1 (SFT) es un modelo de lenguaje conversacional de unos 900 millones de parámetros entrenado desde cero con el framework nanochat de Andrej Karpathy y posteriormente afinado mediante SFT (*supervised fine-tuning*). El checkpoint original, distribuido en formato `.pt`, fue convertido al ecosistema de Hugging Face por el usuario inaciose, incluyendo el código de modelado necesario (`modeling_nanochat2.py`), ya que la arquitectura no está integrada en la biblioteca `transformers`.

Se trata de un transformer solo-descodificador de 20 capas con 896,5 millones de parámetros (de los cuales 419 millones son *value embeddings*) y una ventana de contexto de 2048 tokens. Incorpora técnicas modernas como RoPE, QK-norm, atención con janela deslizante en patrón `SSSL`, *value embeddings* estilo ResFormer y *softcap* de logits.

Su relevancia es principalmente educativa y experimental: permite estudiar y ejecutar un modelo completo entrenado con un pipeline open source y reproducible, con licencia MIT, aunque su tamaño reducido y su entrenamiento limitado lo hacen poco apto para producción. Está etiquetado para portugués (pt) y orientado a generación de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer solo-descodificador (variante nanochat) |
| Parametros totales | 896.533.746 (419M corresponden a *value embeddings*) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | bfloat16 (pesos originales); no hay cuantizaciones publicadas |
| Idiomas soportados | Portugués (etiquetado en Hugging Face) |
| Licencia | MIT |
| Formato de pesos | safetensors (convertido desde `.pt` original de nanochat) |

## Arquitectura y entrenamiento

La arquitectura es un transformer solo-descodificador según la versión de nanochat de marzo de 2026 en adelante. Entre sus características destacan: RoPE con base 100.000, QK-norm aplicada después del RoPE con escala 1,2, RMSNorm sin parámetros aprendibles, MLP con activación ReLU² sin *bias*, y `lm_head` separado del *embedding*. Incluye *value embeddings* (estilo ResFormer) en las capas impares con un *gate* por cabeza, escalas aprendidas por capa en el residual (`resid_lambdas`) y en la conexión al *embedding* inicial (`x0_lambdas`), un mecanismo de *smear* que mezcla el *embedding* del token anterior en el token actual, y un mecanismo de *backout* que sustrae parte del estado de la capa 10 antes de la proyección final. La atención usa janela deslizante en patrón `SSSL`: tres capas con ventana de 512 tokens seguidas de una con contexto total de 2048. Los logits tienen *softcap* en 15.

El modelo fue entrenado desde cero con el pipeline nanochat y afinado con SFT hasta el paso 453. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El vocabulario es de 32.768 tokens (BPE a nivel de byte, con 9 tokens especiales). El modelo puede emitir llamadas a una herramienta de calculadora Python (`<|python_start|>` … `<|python_end|>`), aunque el `generate()` de `transformers` no las ejecuta: solo el `Engine` de nanochat lo hace.

## Capacidades

- Generación de texto conversacional en formato multi-turno, con plantilla de chat que usa tokens especiales (`<|user_start|>`, `<|assistant_start|>`, etc.).
- Soporte de mensajes de sistema, que se insertan automáticamente al inicio de la primera mensaje del usuario mediante `apply_chat_template`.
- Emisión de llamadas a una herramienta de calculadora Python mediante tokens especiales (requiere el `Engine` de nanochat para ejecutarlas; `transformers` solo genera el texto).
- Generación con muestreo (por defecto temperatura 0,6 y top-k 50) o determinista (`do_sample=False`).
- Vocabulario BPE a nivel de byte, lo que permite tokenizar cualquier cadena de bytes sin tokens desconocidos.
- No hay información publicada sobre capacidades de visión, audio, tool calling estándar ni razonamiento multi-paso.

## Casos de uso

- Experimentación educativa con arquitecturas modernas: permite estudiar en código abierto técnicas como QK-norm, *value embeddings*, *smear* o atención con janela deslizante en un modelo pequeño y ejecutable localmente.
- Prototipado de chatbots en portugués: gracias a su formato conversacional multi-turno y su plantilla de chat, puede servir de base para demos de asistentes en portugués de baja exigencia.
- Investigación en conversión de formatos: el repositorio documenta una conversión verificada de `.pt` a safetensors con comparación de logits y generación greedy idéntica, útil como referencia para convertir otros checkpoints de nanochat.
- Pruebas de inferencia con `trust_remote_code=True`: sirve como caso real para evaluar pipelines de despliegue de modelos con código personalizado en `transformers`.
- Benchmarking de hardware de gama baja: con menos de 1.000 millones de parámetros en bfloat16, es adecuado para probar latencia y throughput en GPUs de consumo.
- Base para fine-tuning adicional: su tamaño reducido lo hace asequible para experimentos de afinado supervisado adicional en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en bfloat16 (tamaño del repositorio de pesos), más la sobrecarga de activaciones y KV cache; en la práctica, 4 GB de VRAM son suficientes con holgura.
- GPU recomendadas: cualquier GPU moderna con soporte de bfloat16 (RTX 3060, RTX 4060, RTX 4090, o superiores). También debería ser viable en CPU, aunque sin datos de latencia publicados.
- Cabe en GPUs de consumo sin problema: con menos de 1 GB de parámetros reales (896,5M en bf16), incluso GPUs de 4-6 GB lo ejecutan con contexto completo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada. vLLM y otros servidores de inferencia no son compatibles directamente, porque el mecanismo de *smear* necesita el token anterior durante la generación y el backend Transformers de vLLM no lo proporciona. No hay menciones a soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nanochat d20 v1 (SFT) | 896,5M | 2048 | MIT | Entrenado desde cero con nanochat; requiere `trust_remote_code=True`; sin soporte vLLM |
| Qwen2.5-1B-Instruct | ~1.000M (0,49B activos, MoE en versiones específicas) | 32.768 | Apache 2.0 (algunas variantes) | Ecosistema maduro, soporte vLLM/llama.cpp, multilingüe |
| Llama 3.2 1B Instruct | ~1.200M | 128.000 | Licencia Llama (restricciones) | Mejor rendimiento y contexto, pero licencia no MIT |
| SmolLM2-1.7B-Instruct | ~1.700M | 8.192 | Apache 2.0 | Modelo pequeño open source con buen soporte de herramientas |

El nanochat d20 pierde claramente frente a estas alternativas en contexto, madurez del ecosistema y probable rendimiento, pero su valor está en la reproducibilidad completa del entrenamiento y la licencia MIT sin restricciones.

## Limitaciones y advertencias

- Modelo pequeño y experimental: comete con frecuencia errores factuales, de traducción, sumarización, razonamiento y cálculo. No debe usarse en aplicaciones donde estos errores tengan consecuencias.
- Riesgo de alucinación elevado, propio de modelos de menos de 1.000 millones de parámetros con entrenamiento limitado.
- Contexto muy reducido: 2048 tokens, muy por debajo del estándar actual (32k-128k).
- La herramienta de calculadora Python no se ejecuta con `generate()` de `transformers`; solo funciona con el `Engine` de nanochat.
- Incompatible con vLLM y otros servidores de inferencia estándar por el mecanismo de *smear*.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python personalizado del repositorio; conviene revisarlo antes de usarlo en entornos sensibles.
- Etiquetado para portugués; no hay información sobre rendimiento en español u otros idiomas.
- Sesgos conocidos: no disponibles.
- Licencia MIT: sin restricciones para uso comercial, pero sin garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inaciose/nanochat-d20-v1-sft
- Repositorio nanochat (Andrej Karpathy): https://github.com/karpathy/nanochat
