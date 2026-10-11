# fbaldassarri/tiiuae_Falcon3-7B-Base-auto_awq-int4-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/tiiuae_Falcon3-7B-Base-auto_awq-int4-gs64-sym`, una cuantizacion de 4 bits del modelo base `tiiuae/Falcon3-7B-Base` publicada por el usuario fbaldassarri. No es un modelo entrenado desde cero, sino un artefacto de pesos cuantizados: parte del checkpoint oficial de Falcon3 (familia de modelos densos de TII) y le aplica cuantizacion de solo pesos (WoQ) mediante el algoritmo AWQ (AutoAWQ), orquestado con la herramienta Intel AutoRound v0.15.1. El resultado es un modelo INT4 (W4), con tamano de grupo 64 y cuantizacion simetrica, pensado para inferencia con bajo consumo de memoria.

El objetivo del artefacto es reducir la huella de memoria y acelerar la inferencia respecto al checkpoint en bfloat16, con una degradacion de exactitud descrita por el autor como leve. La model card indica explicitamente que esta version ha sido cuantizada para ejecucion en CPU Intel, iGPU Intel Arc (a traves de intel-extension-for-pytorch) y NPU Intel AI Boost de la serie Core Ultra (via OpenVINO), lo que la orienta a despliegues en hardware Intel de borde y escritorio mas que a aceleradores de datacenter.

Al tratarse de una variante del modelo **base** (no instruct) y con licencia Apache 2.0, su interes principal es servir como sustrato eficiente para generacion de texto por continuacion, para fine-tuning posterior o para investigacion sobre cuantizacion. El repositorio declara un unico idioma (ingles) y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo LLaMA (config `model_type: llama`), heredada de Falcon3-7B-Base |
| Parametros totales | 1.753.635.840 segun los tensores safetensors del repositorio; el modelo base se denomina "7B", por lo que el recuento puede estar afectado por el empaquetado INT4 y no coincide con el numero de parametros logicos del modelo original |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (W4), group size 64, simetrica, metodo AWQ (AutoAWQ) generado con Intel AutoRound; unica variante publicada en este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carga via `transformers`/AutoAWQ) |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento nuevo: se parte del checkpoint preentrenado `tiiuae/Falcon3-7B-Base` y se aplica cuantizacion de pesos en 4 bits. La configuracion de cuantizacion registrada es: `bits=4`, `group_size=64`, `sym=true`, metodo `auto_awq`, con `torch_dtype=torch.bfloat16` para la afinacion de escalas. El proceso se ejecuto con Intel AutoRound v0.15.1 sobre `transformers` 4.55.3 y `torch` 2.14.0+cpu.

La receta de calibracion concreta fue: dispositivo `cpu`, 128 muestras de calibracion (`nsamples=128`), 200 iteraciones de ajuste (`iters=200`), longitud de secuencia 512 (`seqlen=512`) y tamano de lote 4 (`batch_size=4`). El tiempo total de cuantizacion registrado fue de 48.746,4 segundos (aproximadamente 812,4 minutos), completado el 19 de septiembre de 2026. No se detalla la composicion del dataset de calibracion ni innovaciones adicionales (no hay decodificacion especulativa ni mecanismos de atencion alternativos documentados en este artefacto).

## Capacidades

- Generacion de texto por continuacion (completion): es un modelo **base**, por lo que se le debe alimentar texto bruto y no plantillas de instrucciones.
- Modelado de lenguaje general en ingles: predice el siguiente token sobre texto libre.
- Punto de partida para fine-tuning: al ser un base con licencia Apache 2.0, puede ajustarse para tareas concretas (clasificacion, resumen, dominio especifico) antes o despues de cuantizar.
- Inferencia de bajo consumo: ejecutable en CPU Intel, iGPU Intel Arc e NPU Intel Core Ultra segun la model card.
- No dispone de modo de razonamiento explicito ("thinking"), vision, audio ni otras modalidades.
- No esta ajustado para tool calling ni function calling.
- No esta ajustado para uso agentico ni razonamiento multi-paso con seguimiento de instrucciones fiable (al ser base).
- Capacidad multilingue: no disponible; el repositorio declara unicamente ingles.

## Casos de uso

- Fine-tuning supervisado de dominio: usar el checkpoint INT4 como inicializacion (o como referencia para re-cuantizar el modelo afinado) en tareas de clasificacion de texto o extraccion de informacion en ingles donde el coste de memoria sea critico.
- Generacion por continuacion en pipelines de datos: completar plantillas, autocompletar campos o generar texto sintetico en ingles aprovechando que el modelo es base y no requiere formato de chat.
- Inferencia en equipos de escritorio o portatiles Intel: desplegar el modelo sobre CPU, iGPU Arc o NPU Core Ultra para tareas de generacion de texto en local sin GPU dedicada, que es el escenario para el que el autor lo cuantizo.
- Prototipado e investigacion en cuantizacion: reproducir la receta (AutoRound v0.15.1, W4G64 simetrico) para estudiar la degradacion de exactitud frente al checkpoint bfloat16 y comparar estrategias de cuantizacion.
- Servicio de generacion con memoria limitada: integrar el modelo en un endpoint de `text-generation` con `transformers` cuando la VRAM disponible no permite cargar el modelo en 16 bits.
- Evaluacion comparativa de cuantizaciones: emplearlo como variante INT4 de referencia frente a versiones GGUF Q4 o FP16 del mismo Falcon3-7B-Base en estudios de calidad/velocidad.
- Base para modelos derivados: al ser Apache 2.0, sirve como punto de partida para construir variantes instruidas o especializadas manteniendo la obligacion minima de atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente declara, de forma cualitativa, una aceleracion de "2-3x" y una "ligera caida de exactitud" en la configuracion W4G64, sin cifras concretas de perplejidad, MMLU, HumanEval, GSM8K ni otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. El repositorio ocupa 6,8 GB; en INT4 los pesos suelen requerir en torno a 4-5 GB, pero se trata de una estimacion orientativa sujeta a variacion por el empaquetado y las escalas de grupo.
- Hardware objetivo declarado: CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel AI Boost de la serie Core Ultra (via OpenVINO).
- GPU consumer: por tamano (aproximadamente 7B en 4 bits) es previsible que quepa en GPU de consumo con 8-12 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070/4090), aunque el autor no documenta rendimiento en GPU NVIDIA.
- Opciones de despliegue: `transformers` (carga directa, mostrada en la model card) y AutoAWQ. La etiqueta del repositorio incluye `text-generation-inference`, pero la propia model card fija `inference: false`, por lo que la compatibilidad con TGI no esta garantizada. No se publica version GGUF, de modo que `llama.cpp`/Ollama no son aplicables sin conversion previa.
- Latencia y throughput: no disponibles como cifras; solo la afirmacion cualitativa de 2-3x de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Base-auto_awq-int4-gs64-sym | Base denominado 7B (recuento safetensors reportado: 1.753.635.840) | no disponible | safetensors INT4 (AWQ) | apache-2.0 | Cuantizacion de solo pesos, orientada a CPU/iGPU/NPU Intel |
| tiiuae/Falcon3-7B-Base | 7B (nominal) | no disponible | safetensors (bf16/fp16) | apache-2.0 | Checkpoint original, mayor huella de memoria, mayor fidelidad |
| tiiuae/Falcon3-7B-Instruct | 7B (nominal) | no disponible | safetensors | apache-2.0 | Variante instruida del mismo modelo base, apta para chat |
| Cuantizaciones GGUF Q4 de Falcon3-7B (comunitarias) | 7B (nominal) | no disponible | GGUF | segun autor | Ejecutables con llama.cpp/Ollama; este repositorio no ofrece GGUF |

Los datos de contexto, benchmarks y rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo **base**: no sigue instrucciones de forma fiable, no esta alineado con preferencias humanas y no debe usarse como asistente conversacional sin ajuste posterior.
- Degradacion de exactitud por cuantizacion: el autor reconoce una "ligera caida de exactitud" en W4G64, sin cuantificar; esto puede afectar a tareas sensibles a la precision.
- Idiomas: solo se declara ingles; el comportamiento en castellano no esta validado ni documentado.
- Longitud de contexto: no disponible, por lo que no puede garantizarse el rendimiento en contextos largos.
- Riesgo de alucinacion: al ser un modelo de lenguaje generativo sin ajuste, puede producir contenido factualmente incorrecto; no debe emplearse en produccion sin verificacion humana.
- Licencia y uso comercial: Apache 2.0 permite uso comercial, pero la propia model card incluye un aviso de que el modelo se ha desarrollado "solo con fines de investigacion" y se entrega "sin garantia", lo que genera una tension entre la licencia y el descargo del autor.
- Compatibilidad de despliegue limitada: al publicarse solo en formato AWQ/transformers, no es directamente utilizable en runtimes que requieren GGUF u otros formatos.
- Advertencia sobre el recuento de parametros: el numero reportado por los tensores safetensors (1.753.635.840) no concuerda con la denominacion "7B" del modelo base; conviene verificar el conteo real antes de sacar conclusiones de tamano o coste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_awq-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Base
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Receta de cuantizacion (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente enlaces genericos a YouTube), por lo que no se dispone de papers, blogs o demos adicionales verificables.
