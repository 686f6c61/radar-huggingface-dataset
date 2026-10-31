# liddlefish/LoopUno-Nanbeige4.2-3B

## Resumen

LoopUno-Nanbeige4.2-3B es un conjunto de adaptadores LoRA "gated" desarrollado por el usuario liddlefish, que convierte el modelo base [Nanbeige4.2-3B](https://huggingface.co/Nanbeige/Nanbeige4.2-3B) —un transformer en bucle (looped) de 22 capas ejecutadas dos veces— en un "drafter" de decodificación especulativa basado en difusión, siguiendo el método Uno (arXiv:2609.04010). En cada paso de decodificación, el adaptador redacta 8 tokens en una única pasada hacia adelante, y el modelo base congelado los verifica, de modo que la distribución de salida es exactamente la del modelo base (decodificación sin pérdida).

El problema que resuelve es la latencia de inferencia: al generar varios tokens por paso sin degradar la calidad, se obtienen aceleraciones de entre 1,45× y 2,10× frente a la decodificación autorregresiva estándar, según la tarea. Es relevante porque no requiere reentrenar el modelo completo: solo unos adaptadores LoRA entrenados en 3,5 horas sobre 8 GPUs A100.

El repositorio no incluye los pesos del modelo base (0,8 GB corresponden solo a los adaptadores), que deben descargarse por separado desde el repositorio de Nanbeige. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer en bucle (looped transformer, 22 capas × 2 bucles) + adaptador LoRA como drafter de difusión por bloques (Uno/SDAR) |
| Parametros totales | no disponible (modelo base Nanbeige4.2-3B, no incluido en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento con corte a 4096 tokens) |
| Tipos de cuantizacion | no disponible (adaptadores en safetensors, sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA; el modelo base se descarga aparte) |

## Arquitectura y entrenamiento

El modelo base es Nanbeige4.2-3B, un transformer con arquitectura en bucle en el que las mismas 22 capas se ejecutan dos veces. Sobre él se aplican adaptadores LoRA con rango r = 128 y α = 2048 sobre las proyecciones q, k, v, o, gate, up y down, activos únicamente sobre las filas "ruidosas" (noised rows). El esquema sigue Uno: un modelado de difusión por bloques (SDAR, del repo ifm-ai/uno, parcheado para dos bucles y sin QK-norm) con tamaño de bloque 8, token de máscara 166107 y token de parada 166101.

El objetivo de entrenamiento es la distancia de variación total (total-variation) entre la distribución de siguientes tokens que produce el estudiante (con LoRA) sobre las filas ruidosas y la del propio modelo congelado sobre las filas limpias (profesor). No se usan etiquetas de dataset. Los datos de entrenamiento son 60.000 prompts de OpenThoughts3 con sus respuestas, con corte a 4096 tokens. Se usaron 0,52M tokens por paso (batch 128 × 4096), learning rate 1e-4 constante tras 3 pasos de warmup y ZeRO-0 (los dos bucles comparten pesos). Existen dos checkpoints: `step60` (52 minutos, 31M tokens) y `step240` (3,5 horas, 126M tokens, el mejor).

## Capacidades

- Generacion de texto autorregresiva equivalente al modelo base Nanbeige4.2-3B, pero acelerada mediante decodificacion especulativa sin perdida (la distribucion de salida es identica).
- Redaccion de 8 tokens por paso de decodificacion en una sola pasada hacia adelante, verificados por el modelo base congelado.
- Tool calling / function calling: el propio benchmark de evaluacion usa BFCL v3 (categorias AST no-live), con precision de 87,5%.
- Capacidades de razonamiento matematico heredadas del modelo base, evaluadas en gsm8k (93-96% de precision).
- Generacion de acciones agenticas, evaluada mediante replay de trayectorias de SWE-agent.
- El modelo base conserva todas sus capacidades originales; los adaptadores solo modifican el metodo de decodificacion, no el contenido de las respuestas.

## Casos de uso

- Servicios de function calling de baja latencia: en BFCL v3 se alcanzan 3470 tok/s (2,10× sobre los 1653 tok/s autorregresivos), util para pipelines que encadenan muchas llamadas a herramientas.
- Pipelines agenticos de ingenieria de software: la generacion de acciones tipo SWE-agent pasa de 538 a 872 tok/s (1,62×), reduciendo el tiempo de cada paso del agente.
- Resolucion de problemas de matematicas y razonamiento: aceleracion de 1,45× en gsm8k manteniendo la precision dentro del ruido de muestreo.
- Servicios de inferencia con presupuesto de GPU ajustado: al no requerir reentrenar el modelo completo (solo 3,5 h en 8 × A100), se puede replicar el enfoque sobre otros modelos en bucle.
- Investigacion en decodificacion especulativa y difusion de texto: el repo incluye el codigo de entrenamiento (`model_code/`) y los checkpoints, util como base de experimentacion.
- Despliegue de modelos 3B con throughput elevado: el decodificador nano-vllm con draft/verify lineal, FA2 y CUDA graphs maximiza el uso de las A100.

## Benchmarks y rendimiento

Rendimiento end-to-end (tok/s) frente a decodificacion autorregresiva (AR) del mismo modelo sobre los mismos prompts. TPF = tokens aceptados por paso de decodificacion (AR = 1,00).

| Tarea | AR | `step60` | `step240` |
|---|---|---|---|
| BFCL v3 function calling | 1653 tok/s | 1,98× (TPF 2,34) | 2,10× (TPF 2,58) |
| SWE-agent trajectory replay | 538 tok/s | 1,58× (TPF 2,06) | 1,62× (TPF 2,34) |
| gsm8k | 1545 tok/s | 1,47× (TPF 2,04) | 1,45× (TPF 2,18) |

Precision de tareas:

| Tarea | AR | Uno |
|---|---|---|
| BFCL v3 (greedy) | 87,2% | 87,5% |
| gsm8k | 96,0% | 93-96% (ruido de muestreo) |

Condiciones de evaluacion: BFCL v3 categorias AST no-live (1000 prompts, greedy, checker simplificado identico para AR y Uno); SWE-agent replay de 300 trayectorias de `nebius/SWE-agent-trajectories` cortadas en un turno aleatorio del asistente (prompt mediano de 6,4k tokens); gsm8k primeros 200 problemas con temperatura 1,0. Despliegue con nano-vllm, draft/verify lineal, FA2, CUDA graphs y paralelismo de datos sobre A100 40G.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 3B parametros (unos 6 GB en bf16/fp16) mas los adaptadores (0,8 GB en el repo), por lo que una GPU de consumo con 12-16 GB de VRAM deberia ser suficiente, sin confirmacion oficial.
- GPU usadas en entrenamiento y evaluacion: 8 × A100 40G (entrenamiento de `step60` en 52 min y `step240` en 3,5 h).
- Compatibilidad con GPU de consumo: no confirmada; la evaluacion publicada se realizo unicamente sobre A100 40G con CUDA graphs y FlashAttention 2.
- Opciones de despliegue: decodificador Uno de nano-vllm (draft/verify lineal, FA2, CUDA graphs), PEFT para cargar los adaptadores, y el script `model_code/build_uno_model.py` para ensamblar el modelo completo. No se menciona soporte de llama.cpp, Ollama, TGI o vLLM estandar.
- Latencia y throughput: hasta 3470 tok/s en BFCL v3 con `step240` (2,10× sobre AR); 538-872 tok/s en replay agentico; 1545-2240 tok/s en gsm8k. Variacion de ±10% en timings sobre unos cientos de prompts.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopUno-Nanbeige4.2-3B | Adaptador LoRA de decodificacion especulativa por difusion (Uno) sobre modelo en bucle 3B | Adaptadores de 0,8 GB (base 3B aparte) | no disponible | Apache 2.0 | Aceleracion 1,45-2,10× sin perdida de distribucion |
| Nanbeige/Nanbeige4.2-3B (base) | Transformer en bucle (22 capas × 2) | 3B | no disponible | no disponible | Decodificacion autorregresiva estandar; referencia de calidad (87,2% BFCL, 96,0% gsm8k) |
| Uno (ifm-ai, Sahoo et al. 2026) | Metodo de drafter de difusion para decodificacion especulativa | no disponible | no disponible | no disponible | Metodo original del que deriva LoopUno; este repo lo aplica a Nanbeige4.2-3B |

No hay alternativas publicas directas conocidas de drafter de difusion LoRA sobre modelos en bucle de 3B; la comparacion mas relevante es con tecnicas de decodificacion especulativa clasica (drafter autorregresivo + verificador), no disponibles aqui con datos cuantitativos.

## Limitaciones y advertencias

- Los resultados agenticos provienen de replay de trayectorias grabadas y de turnos aislados de function calling; no se incluyen ejecuciones cerradas de agentes con entorno real, por lo que el rendimiento en agentes en produccion no esta verificado.
- Los timings, medidos sobre unos cientos de prompts, presentan una variabilidad de aproximadamente ±10%.
- La aceleracion depende de la tarea: 2,10× en function calling frente a 1,45× en gsm8k; tareas muy estocasticas o con muestreo de alta temperatura pueden reducir el TPF.
- Los pesos del modelo base no se incluyen en el repositorio: hay que descargar Nanbeige4.2-3B por separado y ensamblarlo con el script proporcionado.
- El repositorio tiene 0 descargas registradas, por lo que no existe historial de uso en produccion ni validacion comunitaria amplia.
- Idiomas soportados, longitud de contexto y detalles de cuantizacion no estan documentados en la model card.
- Al ser una decodificacion sin perdida respecto al modelo base, hereda sus sesgos y riesgo de alucinacion, que no se documentan en esta model card.
- La precision en gsm8k con muestreo (93-96%) puede situarse ligeramente por debajo del 96,0% autorregresivo, aunque se atribuye a ruido de muestreo.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/liddlefish/LoopUno-Nanbeige4.2-3B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Pagina del proyecto: https://fengsxy.github.io/LoopUno/
- Codigo (LoopUno): https://github.com/fengsxy/LoopUno
- Codigo de Uno (ifm-ai): https://github.com/ifm-ai/uno
- Paper Uno (arXiv:2609.04010): https://arxiv.org/abs/2609.04010
- Paper Nanbeige4.2 (arXiv:2607.22083): https://arxiv.org/abs/2607.22083
- Dataset de trayectorias SWE-agent: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
