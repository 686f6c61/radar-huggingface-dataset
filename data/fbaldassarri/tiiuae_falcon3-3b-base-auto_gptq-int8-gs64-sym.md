# fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int8-gs64-sym

## Resumen

Este modelo es una version cuantizada a 8 bits (INT8) del modelo base Falcon3-3B-Base, desarrollado por el usuario fbaldassarri. El objetivo es reducir los requisitos de memoria y computo del modelo original manteniendo un rendimiento razonable, especialmente en hardware Intel (CPU, iGPU y NPU). La cuantizacion se ha realizado con el framework Intel AutoRound v0.13.1, usando el algoritmo GPTQ (AutoGPTQ) con group size 64 y cuantizacion simetrica.

El modelo resultante tiene un recuento real de parametros de 1.458.914.304 segun los safetensors, a pesar del nombre «3B». Se trata de un modelo de completacion de texto, no afinado para instrucciones, y soporta exclusivamente el idioma ingles. La longitud de contexto no se ha especificado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Llama) |
| Parámetros totales | 1.458.914.304 (segun safetensors del repositorio) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 GPTQ, group size 64, simetrica |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantizacion GPTQ INT8) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Falcon3-3B-Base de TII, que sigue el diseno de un transformer causal tipo Llama. No se dispone de informacion detallada sobre los datos de entrenamiento del modelo base en la documentacion proporcionada. El proceso de cuantizacion se realizo con AutoRound v0.13.1, cargando el modelo en torch.bfloat16 y utilizando el algoritmo GPTQ (AutoGPTQ) para convertir los pesos a INT8 con group size 64 y cuantizacion simetrica. La calibracion se llevo a cabo en CPU con 128 muestras, 200 iteraciones, una longitud de secuencia de 512 y un batch size de 4. La operacion tardo aproximadamente 290 minutos. No se menciona ningun proceso de RLHF ni DPO en esta version cuantizada.

## Capacidades

- Generacion de texto por completacion: al ser un modelo base, continua un prompt de texto sin seguir instrucciones.
- No soporta tool calling ni function calling (no documentado).
- No esta disenado para agentes ni razonamiento multi-paso.
- Multilingue: solo ingles (segun la etiqueta de idioma).
- No incluye capacidades de vision ni audio.
- Compatible con cuantizacion INT8 para inferencia en CPU Intel.

## Casos de uso

- Autocompletado de texto en editores locales: el modelo puede sugerir continuaciones de texto en aplicaciones de escritura, gracias a su naturaleza de completacion y su bajo coste computacional en INT8.
- Prototipado en entornos sin GPU: al estar optimizado para Intel CPU, permite experimentar con generacion de texto en portatiles o servidores sin aceleradores graficos.
- Investigacion sobre cuantizacion: sirve como referencia para comparar el efecto de la cuantizacion INT8 frente a otras versiones (INT4) del mismo modelo base.
- Ejecucion en dispositivos edge con Intel Core Ultra: puede desplegarse en NPU mediante OpenVINO para aplicaciones de generacion de texto de bajo consumo.
- Analisis de texto no supervisado: como modelo base, puede usarse para tareas de continuacion o extraccion de caracteristicas en pipelines de NLP.
- Pruebas de concepto en sistemas de recomendacion de texto: se puede integrar en prototipos que sugieran frases o parrafos en aplicaciones de soporte documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Estimacion orientativa: ~1,5 GB para los pesos en INT8 (1 byte por parametro), mas overhead de activaciones y cache KV.
- GPU recomendadas: no especificadas. Al ser INT8, podria ejecutarse en GPUs con al menos 2-4 GB de VRAM, pero no se ha verificado.
- Si cabe en consumer GPU: probablemente en GPUs de consumo con 4 GB o mas, segun la estimacion de pesos, aunque no hay datos oficiales.
- Opciones de despliegue: Transformers con AutoGPTQ (carga directa desde el repo). No se ha verificado compatibilidad con otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Parámetros | Formato | Licencia |
|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int8-gs64-sym | INT8 GPTQ, gs64, simetrica | 1.458.914.304 | safetensors | Apache 2.0 |
| fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-sym | INT4 GPTQ, gs64, simetrica | no disponible | safetensors | Apache 2.0 |
| fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-asym | INT4 GPTQ, gs64, asimetrica | no disponible | safetensors | Apache 2.0 |
| tiiuae/Falcon3-3B-Base | Sin cuantizar | no disponible | safetensors | Apache 2.0 |

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos especificos en la informacion disponible.
- Riesgo de alucinacion: como modelo base, puede generar contenido factible pero incorrecto; no se ha evaluado su fiabilidad.
- Limitaciones de contexto: la longitud de contexto no esta especificada.
- Limitaciones de idioma: solo ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor indica que el modelo se ha desarrollado «solo para propositos de investigacion» y se ofrece «sin garantia».
- Caveat de produccion: la cuantizacion INT8 puede degradar ligeramente la precision respecto al modelo original. No se han publicado evaluaciones de calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int8-gs64-sym
- Version INT4 simetrica: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-sym
- Version INT4 asimetrica: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-asym
- Modelo base original: https://huggingface.co/tiiuae/Falcon3-3B-Base
- Intel AutoRound: https://github.com/intel/auto-round
- AutoRound pipeline: https://git.epicdynamic.com/auto-round-pipeline
