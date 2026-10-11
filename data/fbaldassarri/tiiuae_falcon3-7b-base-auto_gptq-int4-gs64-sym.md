# fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int4-gs64-sym

## Resumen

Este artefacto es una version cuantizada a INT4 del modelo `tiiuae/Falcon3-7B-Base` de TII (Technology Innovation Institute), publicada por el usuario fbaldassarri mediante el framework Intel AutoRound v0.15.1 con el algoritmo GPTQ de AutoGPTQ. No se trata de un modelo nuevo ni de un fine-tuning: es un proceso de cuantizacion post-entrenamiento (PTQ) de solo pesos (weights-only quantization, WoQ) que reduce la precision de los pesos a 4 bits con tamano de grupo 64 y esquema simetrico (W4G64 simetrico).

El objetivo del artefacto es reducir el consumo de memoria y acelerar la inferencia del modelo base, con una ventaja declarada de 2-3x en velocidad y una perdida de precision descrita por el autor como leve. El modelo ha sido preparado especificamente para ejecucion en hardware Intel: CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch, y NPU Intel (AI Boost en la serie Core Ultra) mediante OpenVINO.

Es relevante porque permite desplegar un modelo base de la familia Falcon3 de 7B en equipos sin GPU dedicada NVIDIA, aprovechando la aceleracion de las NPU e iGPU integradas en las plataformas Intel recientes. La licencia del artefacto es Apache 2.0, la misma que la del modelo base, aunque el autor declara que se ha desarrollado unicamente con fines de investigacion y sin garantia alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (model_type: llama) |
| Parametros totales | 1.754.797.056 (recuento de safetensors del artefacto cuantizado; el modelo base se denomina Falcon3-7B-Base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 / W4, group size 64, simetrica (sym), metodo AutoGPTQ con Intel AutoRound v0.15.1 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato AutoGPTQ) |

Datos adicionales del proceso de cuantizacion:

| Campo | Valor |
|---|---|
| Version de Intel AutoRound | 0.15.1 |
| Version de transformers | 4.55.3 |
| Version de torch | 2.14.0+cpu |
| torch_dtype de carga | torch.bfloat16 |
| Dispositivo de calibracion | cpu |
| Muestras de calibracion | 128 |
| Iteraciones de ajuste | 200 |
| Longitud de secuencia de calibracion | 512 |
| Tamano de lote de calibracion | 4 |
| Duracion de la cuantizacion | 48 392,8 s (806,5 min) |
| Tamano del repositorio | 6,8 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Falcon3-7B-Base, un transformer causal decoder-only de la familia Falcon3 de TII. La model card del artefacto cuantizado declara `model_type: llama`, lo que indica que la implementacion de referencia de Falcon3-7B se serializa con la arquitectura estilo Llama en la libreria transformers, en lugar del diseno Falcon clasico con atencion multi-query paralela. No se dispone de informacion en el material proporcionado sobre el numero de capas, dimension oculta, cabezas de atencion ni el vocabulario del modelo base.

Este artefacto concreto no incorpora entrenamiento adicional: es una cuantizacion post-entrenamiento de solo pesos realizada con Intel AutoRound v0.15.1 sobre pesos cargados en bfloat16. El proceso de calibracion utilizo 128 muestras con longitud de secuencia 512, 200 iteraciones de ajuste y lotes de 4, todo ejecutado en CPU durante aproximadamente 806 minutos. La cuantizacion se exporto al formato AutoGPTQ con 4 bits, grupo de 64 y cuantizacion simetrica. Al derivar de la variante Base, el modelo no ha pasado por fases de RLHF, DPO ni SFT de alineamiento conversacional.

## Capacidades

- Generacion de texto por continuacion (completion): al ser un modelo Base, la entrada recomendada es texto sin formato de plantilla de chat, y el modelo continua el prompt.
- Modelo autoregresivo causal, adecuado como punto de partida para fine-tuning posterior o para experimentos de investigacion sobre el modelo base.
- Capacidades de razonamiento, codigo y matematicas heredadas del modelo base, aunque no cuantificadas ni verificadas en la informacion proporcionada.
- Soporte multilingue limitado: los metadatos declaran unicamente ingles (`en`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision, audio ni ninguna capacidad multimodal.
- No incorpora plantilla de prompt conversacional: el campo `prompt_template` del artefacto es simplemente `{prompt}`.

## Casos de uso

- Generacion de texto y autocompletado en local: el modelo puede ejecutarse en portatiles con CPU Intel o con iGPU Arc para tareas de continuacion de texto sin conexion, aprovechando que el artefacto esta optimizado para intel-extension-for-pytorch y OpenVINO.
- Inferencia en NPU Intel: despliegue sobre Intel Core Ultra (AI Boost) mediante OpenVINO para cargas de generacion de texto de baja latencia y consumo reducido, un escenario en el que no hay GPU dedicada disponible.
- Base para fine-tuning con recursos limitados: al ocupar 4 bits, el ajuste posterior con tecnicas como LoRA o QLoRA reduce los requisitos de VRAM respecto a la version en bfloat16 del modelo base de 7B.
- Prototipado de investigacion sobre cuantizacion: sirve como artefacto de referencia para comparar el impacto de W4G64 simetrico frente a otras configuraciones (por ejemplo, la variante INT8 con group size 128 del mismo autor) en tareas de evaluacion de perplexidad o generacion.
- Servicio de generacion de texto en servidores sin GPU: con el backend de AutoGPTQ sobre CPU o con OpenVINO, permite montar un endpoint de completado de texto en maquinas de proposito general.
- Reproducibilidad de pipelines de cuantizacion: el artefacto incluye una receta de replicacion completa (auto-round-pipeline con la version 0.15.1 y los mismos filtros de trabajo), util para validar flujos internos de cuantizacion en equipos de ingenieria.
- Evaluacion comparativa de backends: permite medir throughput y latencia de AutoGPTQ frente a variantes AutoRound del mismo modelo base en hardware Intel heterogeneo (CPU, iGPU, NPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto no incluye metricas de MMLU, HumanEval, GSM8K, perplexidad ni ninguna otra medida de calidad, y unicamente declara de forma cualitativa una mejora de velocidad de 2-3x con una perdida de precision descrita como leve en la configuracion W4G64.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4-6 GB de memoria para pesos INT4 mas overhead de activaciones y cache KV en un modelo de 7B, aunque el repositorio ocupa 6,8 GB en disco y no se proporcionan cifras oficiales de memoria.
- El artefacto esta explicitamente orientado a hardware Intel: CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch y NPU Intel (AI Boost en Core Ultra) mediante OpenVINO.
- GPU de consumo: deberia caber en GPUs con 8 GB o mas de VRAM que soporten kernels GPTQ (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores); no se confirma compatibilidad oficial con NVIDIA en la informacion disponible.
- GPUs de datacenter compatibles con GPTQ como A100 o H100 pueden ejecutarlo, pero no aportan la ventaja especifica de aceleracion Intel que motiva este artefacto.
- Opciones de despliegue: transformers con AutoGPTQ, intel-extension-for-pytorch, OpenVINO, y text-generation-inference segun los tags del repositorio. No se ofrece formato GGUF, por lo que llama.cpp y Ollama no son compatibles directamente con estos pesos.
- Latencia y throughput estimados: no disponibles. El unico dato declarado es una mejora de velocidad de 2-3x respecto al modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int4-gs64-sym | 7B (base) | INT4, GS64, simetrica, AutoGPTQ | no disponible | apache-2.0 | Artefacto analizado; optimizado para hardware Intel |
| fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-sym | 7B (base) | INT4, GS64, simetrica, formato AutoRound | no disponible | apache-2.0 | Misma configuracion de cuantizacion, distinto formato de exportacion |
| fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int8-gs128-sym | 7B (base) | INT8, GS128, simetrica | no disponible | no disponible | Menor compresion, presumiblemente mayor fidelidad |
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-sym | 7B (instruct) | INT4, GS64, simetrica | no disponible | apache-2.0 | Variante alineada para conversacion del mismo autor |
| tiiuae/Falcon3-7B-Base | 7B | sin cuantizar (bfloat16) | no disponible | apache-2.0 | Modelo original de TII; mayor consumo de memoria y sin aceleracion Intel especifica |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo Base, no Instruct: no sigue instrucciones de forma fiable ni mantiene formato conversacional; no debe usarse directamente como asistente sin fine-tuning o plantilla adecuada.
- No hay datos publicados de evaluacion, por lo que no se puede cuantificar la degradacion real introducida por la cuantizacion W4G64.
- La cuantizacion a 4 bits con group size 64 introduce una perdida de precision que el propio autor reconoce como leve, pero no medida.
- Idiomas: los metadatos declaran unicamente ingles, lo que limita su uso en castellano u otros idiomas.
- La model card incluye la etiqueta `inference: false`, lo que sugiere que el modelo no esta habilitado para el servicio de inferencia alojado de HuggingFace; el despliegue debe hacerse por cuenta propia.
- Formato de pesos AutoGPTQ: no es compatible con llama.cpp, Ollama ni otros runtimes que requieran GGUF sin una conversion adicional que no esta documentada.
- Restricciones de licencia: el artefacto declara Apache 2.0, pero el autor anade un descargo de responsabilidad indicando que se ha desarrollado solo con fines de investigacion y sin garantia, lo que conviene revisar antes de un uso comercial en produccion.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje de esta escala, no mitigado por este proceso de cuantizacion ni por alineamiento.
- Riesgos de sesgo: no se documenta ninguna evaluacion de sesgos ni de seguridad en el material disponible.
- El recuento de parametros reportado en safetensors (1.754.797.056) no corresponde con el tamano nominal de 7B del modelo base, probablemente por el empaquetado de pesos INT4; conviene verificar la integridad del artefacto antes de usarlo en produccion.
- El repositorio ocupa 6,8 GB, un tamano elevado para una cuantizacion INT4 de 7B, lo que puede indicar la presencia de pesos adicionales o de artefactos de conversion.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Base
- Variante AutoRound INT4 GS64 simetrica: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-sym
- Variante Instruct AutoGPTQ INT4 GS64 simetrica: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-sym
- Variante Instruct AutoGPTQ INT4 GS128 asimetrica: https://api-inference.hf-mirror.com/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autogptq-int4-gs128-asym
- Variante AutoGPTQ INT8 GS128 simetrica: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int8-gs128-sym
- Variante AutoGPTQ INT8 GS128 asimetrica: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int8-gs128-asym
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de replicacion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
