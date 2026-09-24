# Melih1234/ANKA-50M-RMW3

## Resumen

ANKA-50M RMW3 es un modelo de lenguaje causal en inglés entrenado desde inicialización aleatoria por el autor Melih1234, con un presupuesto estricto de menos de 50 millones de parámetros. Se entrenó sobre 5.000 millones de tokens utilizando una única GPU NVIDIA A100 de 80 GB en BF16, con una arquitectura propia que combina un backbone Transformer recurrente con pesos compartidos y dos componentes aprendidos denominados Reflect y Morph, además de un componente de datos llamado WorldPairs. No es un modelo ajustado por instrucciones ni alineado: su comportamiento nativo es la continuación de texto.

La arquitectura aplica 13 bloques físicos Transformer dos veces con parámetros compartidos, lo que da 26 aplicaciones efectivas de bloque sin duplicar los pesos. Incorpora atención con grouped-query attention (8 cabezas de consulta y 2 de clave/valor), SwiGLU con anchura 1.280, codificación posicional RoPE y pre-RMSNorm. El componente Morph introduce enrutamiento disperso tipo Mixture-of-Experts en cuatro etapas, y Reflect compara el estado oculto del segundo pase con el del primero para aplicar una corrección gated de rango 32. La longitud de contexto máxima es de 1.024 tokens y el vocabulario es de 16.384 tokens.

El modelo es relevante como experimento reproducible de eficiencia de entrenamiento: documenta 11,78 GPU-horas, 424,4 millones de tokens por GPU-hora y un throughput medio de 117.899 tokens/s, además de ablaciones arquitectónicas completas. Sin embargo, sus métricas zero-shot son moderadas y coherentes con su escala, y su adopción es todavía nula (0 descargas y 0 me gusta en el momento de redactar esta ficha). Se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal recurrente con pesos compartidos, GQA, SwiGLU, RoPE, pre-RMSNorm, con componentes Reflect y Morph (MoE) |
| Parametros totales | 57.333.248 segun los pesos safetensors; el autor reporta 48.944.657 parametros entrenables unicos con weight tying activado |
| Parametros activos | No disponible como cifra exacta publicada; arquitectura MoE con 4 etapas Morph, cada una con 4 expertos, de los que se activa 1 por token |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; checkpoint distribuido en BF16 (safetensors). No hay GGUF ni variantes cuantizadas publicadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas codigo propio de PyTorch); no es un checkpoint nativo `AutoModelForCausalLM` de Transformers |

Nota sobre los parametros: la diferencia entre 57.333.248 (safetensors) y 48.944.657 (parametros unicos) es coherente con que la matriz de embedding/salida con weight tying se almacene por separado en el fichero, pero el autor no detalla el desglose exacto en la informacion disponible.

## Arquitectura y entrenamiento

El modelo emplea un backbone Transformer causal recurrente: 13 bloques fisicos aplicados en 2 pases con parametros compartidos, lo que produce 26 aplicaciones efectivas sin duplicar el backbone. La atencion es grouped-query attention con 8 cabezas de consulta y 2 de clave/valor, dimension de cabeza 64, y la red feed-forward es SwiGLU de anchura 1.280. La normalizacion es pre-RMSNorm, la codificacion posicional es RoPE y la anchura oculta es 512. Los sesgos lineales estan desactivados y el weight tying entre entrada y salida esta activado. Dos componentes aprendidos amplian este esqueleto: Reflect, que en el segundo pase compara el estado oculto con el guardado en el primero y aplica una correccion gated de rango 32; y Morph, con cuatro etapas dispersas en las que un router asigna cada token a uno de cuatro expertos de rango 368, evaluando unicamente el experto seleccionado y sumando su salida mediante una escala aprendida. El componente WorldPairs aporta ejemplos relacionales de transformaciones de estado del mundo, complementando los ejemplos no emparejados de next-token.

El entrenamiento partio de inicializacion aleatoria, sin inicializacion preentrenada, fusion de modelos ni destilacion. Se usaron 5.000 millones de tokens, 76.294 pasos de optimizador, tamano de lote 64 y longitud de secuencia 1.024 (65.536 tokens por paso), en BF16 sobre una sola A100-SXM4 de 80 GB, con una pipeline de datos en memoria. La duracion total fue de 42.409 segundos (11 h 46 m 49 s), equivalentes a 11,78 GPU-horas, con un throughput medio de 117.899 tokens/s y 424,4 millones de tokens por GPU-hora. La mejor perdida de validacion interna fue 2,334379. No se documentan fases de RLHF, DPO ni ajuste por instrucciones en la informacion disponible.

Ablaciones arquitectonicas incluidas (auditoria sobre 4.096 tokens, valores de perdida):

| Configuracion | Perdida | Cambio respecto al modelo completo |
|---|---:|---:|
| RMW3 completo | 2,629027 | — |
| Reflect desactivado | 2,896107 | +0,267081 |
| Morph desactivado | 2,796865 | +0,167838 |
| Asignaciones del router Morph desplazadas | 2,655662 | +0,026635 |

Observaciones adicionales del autor: Reflect mejoro el NLL a nivel de token en el 70,70 % de los tokens auditados y las 13/13 unidades Reflect tuvieron contribucion individual positiva; Morph mejoro el NLL en el 65,33 % de los tokens y las 4/4 etapas tuvieron contribucion positiva. La escala operativa entrenada de 1,0 fue el mejor punto en los barridos de escala de Reflect y Morph.

## Capacidades

- Generacion de texto en ingles mediante continuacion causal (modelo base, no ajustado por instrucciones).
- Modelado de lenguaje y estimacion de probabilidad de secuencia (util para perplexity y scoring).
- Razonamiento relacional limitado, apoyado por el componente de datos WorldPairs, orientado a transformaciones de estado del mundo.
- Capacidad de aprendizaje y ejecucion de tareas de eleccion multiple en formato zero-shot (HellaSwag, ARC-Easy, PIQA, WinoGrande).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso nativo.
- Capacidad multilingue limitada al ingles; no hay soporte declarado de otros idiomas.
- Contexto corto (1.024 tokens), lo que restringe tareas de contexto largo.
- No incluye modo de pensamiento (thinking mode), vision ni audio.

## Casos de uso

- Experimentacion academica en eficiencia de entrenamiento: reproduce un run completo de 5.000 millones de tokens en 11,78 GPU-horas sobre una sola A100, util como referencia reproducible de coste y throughput para presupuesto sub-50M.
- Investigacion en arquitecturas recurrentes con pesos compartidos: permite estudiar el efecto de aplicar un backbone 13 veces dos veces (26 aplicaciones efectivas) frente a un Transformer denso de profundidad equivalente.
- Estudio de Mixture-of-Experts a pequena escala: las 4 etapas Morph con 4 expertos de rango 368 y enrutamiento por token sirven para analizar routing, carga de expertos y ablaciones con el informe incluido en `results/architecture_audits/`.
- Evaluacion de modulos de correccion entre pases (Reflect): util para investigar si una correccion gated de rango 32 sobre la discrepancia entre el primer y segundo pase mejora el NLL, con evidencia de mejora en el 70,70 % de los tokens auditados.
- Prototipado de scoring y perplexity en ingles: con 1.024 tokens de contexto sirve para medir probabilidades de secuencia y comparar checkpoints en tareas de validacion internas.
- Ensenanza y divulgacion de LLM desde cero: al incluir tokenizer, codigo PyTorch exacto, checkpoint safetensors y muestras de generacion, es adecuado como material didactico para reproducir un pipeline completo en un solo acelerador.
- Pruebas de generacion de texto corto en ingles: continuacion de parrafos o plantillas en entornos con recursos muy limitados (CPU o GPU de gama baja) gracias a su tamano inferior a 60M de parametros.

## Benchmarks y rendimiento

Evaluacion zero-shot con `lm-evaluation-harness==0.4.12`, semilla 3407, sin ejemplos few-shot. WikiText-103 evaluado sobre el test split en crudo con contexto de 1.024 tokens y stride de 512.

| Tarea | Precision bruta | Precision normalizada | Error estandar |
|---|---:|---:|---:|
| HellaSwag | 27,28 % | 28,46 % | ±0,45 % (normalizada) |
| ARC-Easy | 45,79 % | 42,26 % | ±1,02 % (bruta) |
| PIQA | 58,00 % | 56,80 % | ±1,15 % (bruta) |
| WinoGrande | 51,46 % | — | ±1,40 % (bruta) |

Evaluacion de modelo de lenguaje:

| Dataset | Perdida | Perplexity | Tokens puntuados |
|---|---:|---:|---:|
| WikiText-103 test | 3,256828 | 25,967 | 322.587 |
| Validacion interna reservada | 2,340759 | 10,389 | 131.072 tokens de auditoria |

No se han publicado en la informacion disponible resultados comparativos directos frente a otros modelos en una misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB en BF16 (48,9M de parametros x 2 bytes) y en torno a 0,2 GB en FP32; el repositorio ocupa 0,1 GB. Con cache KV para contexto de 1.024 tokens el consumo adicional es minimo.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento se realizo en 1 x NVIDIA A100-SXM4 de 80 GB, pero para inferencia basta con una GPU de gama de entrada.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso iGPU; tambien se puede ejecutar en CPU.
- Opciones de despliegue: el modelo se distribuye con codigo propio de PyTorch y no es un checkpoint nativo `AutoModelForCausalLM` de Transformers, por lo que vLLM, TGI, llama.cpp u Ollama no ofrecen soporte directo salvo conversion o adaptacion previa. No se proporcionan ficheros GGUF.
- Latencia y throughput: el unico dato de rendimiento publicado es de entrenamiento (117.899 tokens/s medios en A100, 11,78 GPU-horas). No se publican cifras de latencia ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---:|---:|---|---|---|
| ANKA-50M RMW3 | 48,9M unicos (57,3M en safetensors) | 1.024 | Apache 2.0 | HuggingFace, codigo propio | HellaSwag norm. 28,46 %, WikiText-103 PPL 25,967 |
| Pythia-70M (EleutherAI) | 70M | 2.048 | Apache 2.0 | HuggingFace, nativo Transformers | No disponible en la informacion proporcionada |
| GPT-2 small | 124M | 1.024 | MIT | HuggingFace, nativo Transformers | No disponible en la informacion proporcionada |
| SmolLM2-135M | 135M | 8.192 | Apache 2.0 | HuggingFace, nativo Transformers | No disponible en la informacion proporcionada |

Los modelos de la comparativa pertenecen a la misma categoria de escala (decenas a centenares de millones de parametros), pero no se dispone de resultados de benchmarks homogeneos en la informacion proporcionada, por lo que no se ofrece una comparacion numerica de rendimiento.

## Limitaciones y advertencias

- No esta ajustado por instrucciones, ni alineado con chat, ni alineado en seguridad: su comportamiento nativo es la continuacion de texto, no la respuesta a instrucciones.
- Riesgo elevado de alucinacion y de generar contenido incoherente, propio de un modelo base de menos de 50 millones de parametros entrenado sobre 5.000 millones de tokens.
- Rendimiento zero-shot modesto en tareas de comprension: HellaSwag normalizado 28,46 % y ARC-Easy bruto 45,79 %, cercanos a niveles propios de modelos muy pequenos.
- Contexto limitado a 1.024 tokens, insuficiente para tareas de contexto largo o conversaciones multi-turno extensas.
- Soporte unicamente en ingles; no hay capacidades multilingues declaradas.
- Sesgos potenciales heredados del corpus de entrenamiento; no se documenta ninguna mitigacion ni evaluacion de sesgos en la informacion disponible.
- Requiere codigo PyTorch propio: no funciona con carga directa mediante `AutoModelForCausalLM`, lo que complica su integracion en pipelines estandar.
- Sin cuantizaciones publicadas (GGUF u otras), lo que limita el despliegue en herramientas de inferencia habituales.
- Adopcion nula en el momento de redactar la ficha (0 descargas, 0 me gusta), sin validacion externa de terceros.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin alineacion, el uso en produccion orientado al usuario final exige filtros y ajuste adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Melih1234/ANKA-50M-RMW3
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
