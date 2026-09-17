# d4rkninja/tanpo-marketing-LoRA

## Resumen

Tanpo-marketing-LoRA (identificador `d4rkninja/tanpo-marketing-LoRA`, tambien referido como `tanpo-marketing-lora-10k`) es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `unsloth/LFM2.5-1.2B-Instruct`. Lo publica el usuario `d4rkninja` en HuggingFace y su proposito declarado es la generacion de texto orientada a marketing, a juzgar por el nombre del adaptador y del modelo resultante. No se trata de un modelo completo, sino de un conjunto de pesos adicionales que deben cargarse junto al modelo base mediante PEFT.

El adaptador se ha entrenado con TRL 0.24.0 y PEFT 0.21.0 sobre el stack Transformers 5.5.0 / PyTorch 2.6.0+cu124. El repositorio ocupa aproximadamente 0,1 GB, un tamano coherente con un adaptador LoRA de rango bajo sobre un modelo de 1,2 mil millones de parametros. La model card es un esqueleto autogenerado por TRL: no documenta el conjunto de datos de entrenamiento, los hiperparametros, la licencia ni los idiomas soportados.

Su relevancia practica es limitada y muy especifica: sirve como ejemplo reproducible de un flujo de trabajo de fine-tuning con Unsloth + TRL para dominios concretos de negocio, y como punto de partida para quien quiera evaluar si un adaptador pequeno sobre un modelo de 1,2B es suficiente para tareas de redaccion comercial. Al no tener descargas ni benchmarks publicados, no debe considerarse un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; arquitectura interna del modelo base no disponible |
| Parametros totales | No disponible para el adaptador; modelo base de 1,2B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el adaptador se distribuye en precision completa y admite carga sobre el base en 4/8 bits con bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card contiene el marcador sin especificar `licence: license`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo de pesos completos. Se entrena mediante SFT (supervised fine-tuning) con TRL 0.24.0 y se empaqueta con PEFT 0.21.0 sobre el modelo base `unsloth/LFM2.5-1.2B-Instruct`, un instruct model de 1,2B parametros publicado por el usuario `unsloth`. El prefijo LFM corresponde a la familia Liquid Foundation Models de Liquid AI, si bien la model card no detalla la arquitectura interna del base (atencion, convoluciones o hibrida) ni su ventana de contexto.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el rango LoRA, el alpha, la tasa de aprendizaje ni el numero de pasos. El nombre `tanpo-marketing-lora-10k` sugiere un corpus de aproximadamente 10.000 ejemplos de ambito marketing, pero es una inferencia nominal, no un dato confirmado. Tampoco consta que se haya aplicado RLHF, DPO u otra fase de alineacion posterior al SFT. El entorno de ejecucion declarado es PyTorch 2.6.0+cu124, Datasets 4.3.0 y Tokenizers 0.22.2.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la model card incluye un ejemplo de uso con `transformers.pipeline` en formato de chat con roles `user`/`assistant`.
- Ajuste orientado a dominio: el adaptador se ha entrenado especificamente para contenido de marketing, aunque no se documenta la mejora obtenida ni el tipo de tareas concretas (copy, anuncios, correos, SEO).
- Razonamiento general: heredado del modelo base instruct; no se documenta ninguna capacidad diferencial del adaptador.
- Tool calling / function calling: no disponible en la informacion proporcionada; debe verificarse directamente sobre el modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada.

## Casos de uso

- Generacion de copy publicitario: generar variantes de mensajes para campanas a partir de un brief corto, apoyandose en el ajuste de dominio del adaptador. Requiere validacion humana previa a publicacion.
- Redaccion de descripciones de producto en catalogo: producir fichas y descripciones repetitivas a escala para e-commerce, con revision editorial posterior.
- Borradores de correo de marketing: crear secuencias de email (bienvenida, carrito abandonado, reactivacion) que despues se editan y programan en la herramienta de automatizacion.
- Prototipado de asistentes de marca: montar un chatbot interno de demostracion que responda con el tono de una marca concreta, como prueba de concepto antes de invertir en un modelo mayor.
- Generacion de variantes A/B: producir multiples titulares y textos de anuncio para experimentacion, filtrando los que mejor encajen en los limites de caracteres de cada plataforma.
- Fine-tuning de referencia para equipos: usar este repositorio como plantilla de pipeline (Unsloth + TRL + PEFT) para replicar el flujo con datos propios y otro modelo base.
- Investigacion sobre adaptadores de bajo rango: analizar como se comporta un LoRA pequeno sobre un base de 1,2B en una tarea de dominio estrecho, comparandolo con el base sin adaptar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 0,1 GB en disco; los requisitos reales los determina el modelo base de 1,2B parametros.
- VRAM estimada para el modelo base: en torno a 2,4-3 GB en FP16/BF16 y en torno a 0,8-1,5 GB con cuantizacion de 4 bits (estimacion orientativa, no medida sobre este adaptador).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090) es suficiente; tambien GPU de datacenter (A100, H100) para lotes grandes o despliegues concurrentes.
- Cabe en GPU consumer: si, y tambien en portatiles con GPU dedicada de gama media; en CPU la inferencia es posible pero lenta.
- Opciones de despliegue: `transformers` con PEFT (fusionando el adaptador o cargandolo en caliente), `llama.cpp`/Ollama y vLLM/TGI si se exporta o fusiona el modelo a un formato compatible (se requiere exportacion adicional, ya que el repositorio solo contiene pesos de adaptador).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tanpo-marketing-LoRA (este) | Adaptador sobre 1,2B | No disponible | safetensors (PEFT) | No disponible | 0 descargas, 3 likes; sin benchmarks |
| unsloth/LFM2.5-1.2B-Instruct (base) | 1,2B | No disponible | safetensors | No disponible | Modelo base sin el ajuste de marketing |
| Alternativas de ~1-2B instruct (Qwen, Llama 3.2 1B, Gemma 2 2B) | 1B-2B | No disponible | safetensors, GGUF | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La model card es una plantilla autogenerada por TRL: no documenta dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- Licencia no especificada. Sin una licencia explicita no hay autorizacion clara para uso comercial; hay que contactar con el autor o asumir el riesgo legal.
- Cero descargas registradas y 3 likes: no existe evidencia de uso en produccion ni de validacion por terceros.
- Riesgo de alucinacion: inherente a un modelo base de 1,2B sin alineacion documentada ni evaluacion publicada; en tareas de marketing esto puede traducirse en afirmaciones falsas sobre productos o precios.
- Idiomas soportados no declarados: no se puede asumir un rendimiento correcto en castellano sin una evaluacion propia.
- Longitud de contexto no declarada: limita el diseno de aplicaciones con entradas largas y obliga a medirla empiricamente.
- Sesgos: no evaluados. Un corpus de marketing no documentado puede introducir sesgos de estilo, genero o mercado.
- Al ser un adaptador, requiere cargar el modelo base; la calidad final depende tanto del base como del ajuste, y no hay forma de aislar la contribucion del LoRA sin comparar contra el base.
- Los datos de busqueda web asociados a esta consulta no contienen informacion sobre el modelo (resultados irrelevantes sobre videojuegos), por lo que no hay fuentes externas que corroboren su calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d4rkninja/tanpo-marketing-LoRA
- Modelo base: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos eran contenido no relacionado.
