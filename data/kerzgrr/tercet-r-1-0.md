# kerzgrr/Tercet-R-1.0

## Resumen

Tercet-R-1.0 es un modelo de lenguaje causal de aproximadamente 502 millones de parametros, desarrollado por kerzgrr, que combina una arquitectura hibrida de Gated DeltaNet-2 y GQA sobre un núcleo TinyGDN. Se trata del primer checkpoint publico de la familia Tercet-R, supervisado con ajuste fino (SFT) para tareas de razonamiento y uso de herramientas. Su principal innovacion es un contrato de chat con dos modos: `think` (genera un bloque `` antes de la respuesta) y `no-think` (respuesta directa), junto con soporte nativo para llamadas a funciones en formato JSON.

El modelo parte de la base `kerzgrr/Tercet-base`, preentrenada sobre `HuggingFaceFW/fineweb-edu`, y se afina con una mezcla de datasets de razonamiento, instrucciones y tool-calling, como OpenThoughts3, SmolTalk, OpenHermes-2.5, Hermes function calling, xLAM, entre otros. Tiene una ventana de contexto de 16.384 tokens y esta publicado bajo licencia Apache 2.0, lo que lo hace util para la experimentacion en entornos con recursos limitados y para investigacion sobre arquitecturas hibridas eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyGDN hibrida: Gated DeltaNet-2 + GQA (32 capas, GDN-2 ×3 + GQA cada 4.ª capa) |
| Parametros totales | 501.635.264 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible; los pesos publicados estan en bfloat16 (safetensors) |
| Idiomas soportados | Ingles (declarado); se entrenó con datos multilingues (Aya) pero no verificado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); requiere tiny_gdn y flash-linear-attention |

## Arquitectura y entrenamiento

Tercet-R-1.0 usa una arquitectura hibrida TinyGDN que intercala capas de Gated DeltaNet-2 con capas de atencion GQA. Concretamente, cada cuarta capa es de atencion GQA (8 cabezas de consulta, 2 de clave/valor, dimension de cabeza 128, RoPE parcial), mientras que las demas son capas lineales de Gated DeltaNet-2 (8 cabezas × 128). El bloque MLP es SwiGLU con dimension 2.624, el dimension oculta es 1.024 y el vocabulario BPE tiene 49.152 tokens.

El entrenamiento se divide en tres etapas. Primero, la base se preentrena sobre `fineweb-edu`. Despues, se realiza un ajuste supervisado intermedio (Mid-SFT) con `smoltalk2`, `Llama-Nemotron-Post-Training-Dataset` y `OpenThoughts3-1.2M`. Finalmente, el SFT de instrucciones (Instruct SFT) combina un conjunto amplio de datasets: SmolTalk, OpenHermes-2.5, OpenThoughts3, Aya, Hermes function calling, s1K, Tulu-3 personas IF, xLAM, LongAlign y Mixture-of-Thoughts, entre otros. El entrenamiento de esta etapa utilizo una longitud de secuencia de 16.384, optimizador AdamW con learning rate 5×10⁻⁵ y duro 61.1 horas. El checkpoint publicado corresponde al paso 4.500 y usa una media exponencial movil (EMA) de los pesos. La perdida de validacion EMA fue 1.744, lo que equivale a una perplejidad de 5.72.

## Capacidades

- Generacion de texto causal e instrucciones de chat con dos modos: `think` (razonamiento explicito antes de la respuesta) y `no-think` (respuesta directa sin razonamiento).
- Soporte de tool calling: el modelo puede emitir llamadas a funciones en formato JSON SmolTalk, como `<tool_call>{"name": "web_search", "arguments": {"query": "..."}}</tool_call>`.
- Integracion de resultados de herramientas mediante un token especial `<|tool_response|>`, permitiendo incorporar observaciones externas en la conversacion.
- Entrenado sobre datasets de razonamiento como OpenThoughts3, Mixture-of-Thoughts y s1K, lo que favorece cadenas de pensamiento de longitud moderada.
- Capacidad de manejo de contexto largo gracias a la ventana de 16.384 tokens y al uso de Gated DeltaNet-2, que reduce la complejidad atencional en capas lineales.
- Compatible con el script `inference.py` incluido, que permite pasar el sistema, el prompt y el modo de pensamiento por linea de comandos, y que inicia automaticamente las dependencias del entorno `tiny_gdn`.

## Casos de uso

- Asistentes de razonamiento para explicaciones paso a paso: el modo `think` permite que el modelo exponga su razonamiento interno antes de dar una respuesta, lo que resulta util en paneles de ayuda tecnica o docencia. Se puede usar con `inference.py --think --prompt "..."`.
- Chatbots con llamada a funciones para busqueda web: con el flag `--tools web_search`, el script pausa la generacion tras una `<tool_call>`, el usuario introduce el resultado de la busqueda y el modelo continua generando. Es adecuado para prototipos de agentes sencillos sin infraestructura compleja.
- Experimentacion academica con arquitecturas hibridas: el modelo es un banco de pruebas para estudiar Gated DeltaNet-2 combinado con GQA en tareas de razonamiento y tool use, con un costo de entrenamiento e inferencia bajo.
- Despliegue en entornos con recursos limitados: con ~502 M de parametros y pesos en bfloat16 que ocupan alrededor de 1 GB, puede ejecutarse en GPUs de consumo o incluso en CPU para pruebas locales, gracias al soporte de `--device cuda` o `--device cpu`.
- Generacion de borradores con verificacion interna: el modo `think` permite que el modelo genere una justificacion antes de la respuesta final, lo que puede facilitar tareas de curacion de contenido donde se necesita una estimacion de confianza.
- Investigacion en alineacion y control de comportamiento: al poder alternar entre `think` y `no-think` con tokens de control especiales, el modelo sirve para estudiar como el razonamiento explicito afecta la calidad de las respuestas en tareas de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo publicado es la perdida de validacion EMA del entrenamiento de SFT: 1.744 (perplejidad 5.72), pero no se trata de una metrica de comparacion con otros modelos ni de una evaluacion estandarizada tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en bfloat16, asumiendo un contexto moderado. El checkpoint en disco ocupa 1.0 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, RTX 3050, GTX 1650) o CPUs modernas con suficiente RAM. No hay recomendacion oficial del autor.
- Si cabe en consumer GPU: si, es compatible con GPUs de consumo de gama baja.
- Opciones de despliegue: el script de referencia `inference.py` y el chat interactivo `scripts/chat.py`. No es compatible con GGUF, llama.cpp, vLLM, TGI ni Ollama en la actualidad, porque depende de `tiny_gdn` y `flash-linear-attention`.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Arquitectura | Disponibilidad |
|---|---|---|---|---|---|
| Tercet-R-1.0 | 501,6 M | 16.384 | Apache 2.0 | Hibrido GDN-2 + GQA | HuggingFace, requiere tiny_gdn |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Transformer decoder-only | HuggingFace, GGUF disponibles |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 | Apache 2.0 | Transformer decoder-only | HuggingFace, GGUF disponibles |
| Llama-3.2-1B-Instruct | 1,23 B | 128.000 | Llama Community License | Transformer decoder-only | HuggingFace, GGUF disponibles |

## Limitaciones y advertencias

- Escala reducida (~502 M de parametros): no es un modelo frontier y su rendimiento en tareas complejas de razonamiento o codigo sera limitado.
- Solo esta declarado el ingles como idioma. Aunque se entrenó con datos multilingues (Aya), no hay evidencia de capacidades fiables en otros idiomas.
- Dependencia de la libreria `tiny_gdn` y de `flash-linear-attention`; no es compatible con GGUF/llama.cpp, lo que limita el despliegue en muchas plataformas estandar (Ollama, vLLM, TGI).
- No se han publicado benchmarks ni evaluaciones reproducibles que permitan comparar el rendimiento con otros modelos.
- Riesgo de alucinacion inherente a un modelo de este tamano, especialmente en tareas de razonamiento largo.
- Los pesos publicados corresponden a un checkpoint EMA del paso 4.500; existe un Tercet-R-1.1 posterior (etapa 3 de SFT) que podria tener mejor comportamiento.
- Posibles sesgos no documentados en los datasets de entrenamiento (SmolTalk, OpenHermes, Aya, Tulu-3, etc.).
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y con un soporte comunitario minimo.

## Enlaces

- HuggingFace: https://huggingface.co/kerzgrr/Tercet-R-1.0
- Modelo base: https://huggingface.co/kerzgrr/Tercet-base
- Chat hermano (sin modo think): https://huggingface.co/kerzgrr/Tercet
- Version posterior: https://huggingface.co/kerzgrr/Tercet-R-1.1
- LLM Explorer: https://llm-explorer.com/model/kerzgrr%2FTercet-R-1.0,kpVGhSfRs8hdSoeID6tSr
