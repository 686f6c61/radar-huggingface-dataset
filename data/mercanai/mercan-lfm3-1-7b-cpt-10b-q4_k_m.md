# MercanAI/Mercan-LFM3-1.7B-CPT-10B-Q4_K_M

## Resumen

Mercan-LFM3-1.7B-CPT-10B-Q4_K_M es una cuantizacion GGUF Q4_K_M del checkpoint final de preentrenamiento continuado (CPT) del modelo LiquidAI/LFM3-1.7B-Base, publicada por el usuario MercanAI. El checkpoint de origen corresponde al paso 50.945 de un entrenamiento CPT sobre 10.000 millones de tokens adicionales, partiendo de la arquitectura LFM3 de Liquid AI. El autor lo distribuye en formato GGUF v3 para su uso con llama.cpp y aplicaciones compatibles, e incluye una variante con metadatos propios (`model.mercan`) que no aporta un runtime funcional para LFM3.

El modelo conserva la arquitectura original `Lfm3ForCausalLM` de tipo tri-hibrida de 24 capas, con 1.990.945.600 parametros totales (aproximadamente 1,99 B). El contexto maximo no se especifica en la informacion disponible, aunque hereda el del modelo base LFM3-1.7B de Liquid AI. Los idiomas declarados son turco (tr) e ingles (en).

Es relevante porque ejemplifica el flujo de trabajo de CPT sobre un modelo base pequeno y su exportacion a GGUF para inferencia en CPU, un patron habitual en despliegues en dispositivos con recursos limitados. No obstante, el propio autor advierte que se trata de un checkpoint CPT sin SFT ni DPO, sin evaluacion de benchmarks, seguridad o seguimiento de instrucciones, por lo que su utilidad practica en produccion es limitada sin un ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm3ForCausalLM, transformer tri-hibrida de 24 capas |
| Parametros totales | 1.990.945.600 (aprox. 1,99 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base LFM3-1.7B) |
| Tipos de cuantizacion | Q4_K_M (GGUF v3); pesos de origen exportados de FP32 a BF16 y luego a F16 antes de la cuantizacion |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, licencia "other") |
| Formato de pesos | GGUF v3 (`model.gguf` y `model.mercan` con metadatos Mercan v1) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM3 de Liquid AI, descrita por el autor como una red tri-hibrida de 24 capas que combina convoluciones con atencion deslizante y global (sliding/global attention). Esta estructura mixta es caracteristica de la familia LFM de Liquid AI y esta disenada para reducir el coste computacional frente a un transformer denso clasico manteniendo capacidad de modelado de secuencias. El checkpoint original es de tipo `Lfm3ForCausalLM` y fue entrenado por el autor sobre 10.000 millones de tokens adicionales mediante preentrenamiento continuado (CPT) a partir de LiquidAI/LFM3-1.7B-Base, alcanzando el paso 50.945.

El proceso de conversion y cuantizacion esta documentado: los tensores FP32 del checkpoint CPT se exportaron a BF16, luego a F16 y finalmente se cuantizaron a Q4_K_M con las herramientas de ggml-org/llama.cpp y el escritor GGUF. El autor incluye el SHA-256 del tokenizer (`7e226e34bface23ccf6e495d157bf77186c1c30a7659880e1a8994db528c3701`) y la ruta del checkpoint de origen para reproducibilidad. No se indica la composicion del dataset de CPT, ni si hubo RLHF o DPO; de hecho, el autor aclara explicitamente que este artefacto no es el modelo SFT ni DPO en curso, sino el checkpoint CPT final.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles, heredada del modelo base LFM3-1.7B.
- Modelado de lenguaje base: al ser un checkpoint CPT sin SFT, no se garantiza el seguimiento de instrucciones ni el formato conversacional, pese a la etiqueta `conversational` del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no evaluado en este checkpoint.
- Capacidades multilingues limitadas a los idiomas declarados (tr, en).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Inferencia en CPU mediante llama.cpp y aplicaciones compatibles con GGUF `lfm3`.

## Casos de uso

- Investigacion de preentrenamiento continuado: util como referencia reproducible de un CPT de 10.000 millones de tokens sobre un modelo base pequeno, con checkpoint, paso y SHA-256 documentados para replicar el proceso.
- Experimentacion con cuantizacion GGUF en CPU: sirve para medir el impacto de Q4_K_M sobre un modelo de ~2 B en terminos de perplejidad y calidad de generacion en entornos sin GPU.
- Desarrollo de prototipos de generacion de texto en turco: el CPT sobre datos adicionales puede haber reforzado el idioma turco, lo que lo hace candidato para pruebas de modelado de lenguaje en ese idioma antes de un ajuste fino.
- Base para SFT posterior: al ser un checkpoint CPT limpio, puede servir como punto de partida para un ajuste supervisado o DPO orientado a instrucciones o a un dominio concreto.
- Pruebas de integracion de runtimes GGUF: util para validar el soporte de la arquitectura `lfm3` en llama.cpp v0.8.0 / b11960 o superior y en aplicaciones moviles compatibles.
- Evaluacion comparativa de arquitecturas hibridas: permite estudiar el comportamiento de la arquitectura tri-hibrida de LFM3 frente a transformers densos de tamano similar en tareas de modelado de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha realizado ninguna evaluacion de benchmark, seguridad ni seguimiento de instrucciones sobre este checkpoint o artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado en Q4_K_M y pesar 2,5 GB el repositorio, la inferencia en CPU es viable con aproximadamente 2-3 GB de RAM; en GPU, una tarjeta con 4 GB o mas es suficiente para cargar los pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660); el modelo esta pensado principalmente para CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp (v0.8.0 / b11960 o superior, segun la model card del modelo base), aplicaciones basadas en llama.cpp con soporte explicito de `lfm3`. El runtime `Ahmet2001/MercanRuntime` no soporta LFM3 en su rama principal, por lo que no es una opcion valida para `model.mercan`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mercan-LFM3-1.7B-CPT-10B-Q4_K_M | 1,99 B | no disponible | LFM Open License v1.0 | GGUF Q4_K_M | CPT sin SFT, sin benchmarks |
| LiquidAI/LFM3-1.7B-Base | 1,7 B (nominal) | no disponible | LFM Open License v1.0 | safetensors | Modelo base original de Liquid AI |
| LiquidAI/LFM3-1.7B-GGUF | 1,7 B (nominal) | no disponible | LFM Open License v1.0 | GGUF | Version GGUF oficial; requiere llama.cpp v0.8.0 / b11960 o superior |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo ajustado para instrucciones: el autor aclara que es el checkpoint CPT final, no el modelo SFT ni DPO, y no ha sido evaluado para utilidad conversacional.
- Sin evaluacion de benchmarks, seguridad ni seguimiento de instrucciones sobre este artefacto concreto.
- La cuantizacion Q4_K_M es con perdida; puede degradar la calidad respecto al checkpoint en BF16 o FP32.
- Idiomas limitados a turco e ingles; no se declara soporte de castellano.
- El formato `model.mercan` con metadatos Mercan v1 no es funcional en el runtime referenciado (`Ahmet2001/MercanRuntime`), que carece de proveedor de arquitectura y tokenizer para LFM3; solo `model.gguf` es utilizable con llama.cpp compatible.
- La licencia LFM Open License v1.0 impone condiciones de redistribucion y uso; es necesario revisar el archivo LICENSE incluido antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no evaluados en este checkpoint; al ser un modelo base CPT, es esperable un comportamiento de continuacion de texto sin filtros de seguridad especificos.
- Longitud de contexto no confirmada en la informacion disponible; conviene verificar la del modelo base LFM3-1.7B antes de desplegarlo con secuencias largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MercanAI/Mercan-LFM3-1.7B-CPT-10B-Q4_K_M
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Version GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Runtime referenciado por el autor: https://github.com/Ahmet2001/MercanRuntime
- Herramientas de conversion GGUF: https://github.com/ggml-org/llama.cpp
- Licencia LFM Open License v1.0: incluida en el repositorio como archivo LICENSE
