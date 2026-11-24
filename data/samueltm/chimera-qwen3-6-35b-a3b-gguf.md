# samueltm/Chimera-Qwen3.6-35B-A3B-GGUF

## Resumen

Chimera-Qwen3.6-35B-A3B-GGUF es una distribucion empaquetada del modelo Qwen3.6-35B-A3B (arquitectura MoE, 36.522.915.968 parametros totales y aproximadamente 3B activos por token) preparada por el usuario samueltm para ejecucion en CPU sin GPU. El paquete no se limita a una cuantizacion GGUF: incluye un motor parcheado (ik_llama.cpp), un adaptador LoRA entrenado con RL para razonar de forma mas concisa, un proxy compatible con la API de OpenAI y un esquema de decodificacion especulativa basada en la cabeza MTP original del modelo.

El objetivo declarado es ejecutar un modelo de 35B en un equipo de sobremesa sin GPU con un consumo de RAM de 7 GB (servidor mas page cache), leyendo los expertos desde un NVMe bajo demanda. La velocidad queda limitada por el ancho de banda del disco: se leen unos 24 MB por token, de modo que el rendimiento maximo se situa cerca de (throughput del disco / 24 MB) tokens por segundo.

Es relevante porque demuestra una via practica para servir modelos MoE grandes en hardware de consumo, a costa de un motor modificado y de un SSD NVMe rapido. La licencia Apache-2.0 del modelo base se mantiene en esta distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Qwen3.6-35B-A3B), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 36.522.915.968 (36,5B) |
| Parametros activos | Aproximadamente 3B por token (segun la model card) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Mezcla propietaria (receta `q_inproj4_lmi`); expertos de las capas 12/35/36 en IQ4_XS; GGUF de 14,4 GB |
| Idiomas soportados | No disponible (el modelo base Qwen3.6 es multilingue, pero la ficha no lista idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`q_c59.gguf` de 14,4 GB y `rl_it12.gguf` de 153 MB para el LoRA) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) con 36,5B parametros totales y unos 3B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. Sobre esa base, el autor aplica una cuantizacion mixta (receta `q_inproj4_lmi`, con los expertos de las capas 12, 35 y 36 en IQ4_XS) y conserva la cabeza MTP (multi-token prediction) original para decodificacion especulativa con `p_min 0.9`.

El paquete incorpora un LoRA (`rl_it12.gguf`, 153 MB) entrenado con aprendizaje por refuerzo para razonar de forma mas concisa manteniendo la precision; se aplica en tiempo de ejecucion. El autor reporta que la perplejidad del LoRA frente al base empeora como maximo un +0,18% en el peor de cuatro dominios, frente a un limite aceptado del +1%. No se detalla el volumen de tokens de entrenamiento del modelo base ni la composicion del dataset, y no hay informacion sobre si Qwen3.6-35B-A3B uso RLHF o DPO.

La innovacion tecnica principal esta en el motor: un parche sobre ik_llama.cpp que lee expertos desde el SSD bajo demanda a partir de un fichero empaquetado por experto con cache por capa, aplica omision de expertos de baja masa y usa decodificacion especulativa MTP. El proxy impone un presupuesto de razonamiento de 14.000 tokens con respuesta forzada despues del corte (hasta 4.000 tokens de respuesta).

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con modo de pensamiento (thinking) acotado a 14.000 tokens.
- Razonamiento matematico: el autor reporta 33/33 en un conjunto retenido de 11 problemas con 3 semillas y 15/28 en AIME 2026 con presupuesto de 14k tokens.
- Generacion de codigo: capacidad heredada del modelo base Qwen3.6, si bien no se detallan benchmarks especificos en la informacion disponible.
- Decodificacion especulativa mediante la cabeza MTP, que acelera la generacion en el motor parcheado.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`), con separacion de `reasoning_content` y `content`.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base Qwen3.6 es multilingue, pero esta ficha no las enumera).
- No se documenta soporte explicito de tool calling, function calling ni uso como agente en la model card.

## Casos de uso

- Servicio de razonamiento en equipos sin GPU: un desarrollador puede desplegar un modelo de 35B en un sobremesa de 6 nucleos con 16 GB de RAM y NVMe, usando el motor parcheado y el proxy OpenAI para integrarlo en aplicaciones existentes.
- Asistente de codigo en local para entornos con requisitos de privacidad: al ejecutarse en CPU y sin dependencia de la nube, el modelo puede atender consultas de programacion sin enviar codigo a terceros.
- Razonamiento matematico acotado: con el presupuesto de 14k tokens y respuesta forzada, es adecuado para problemas de derivacion larga donde se necesita un tiempo de respuesta acotado, aceptando la perdida de unos 3 problemas en AIME 2026 frente a sin presupuesto.
- Prototipado de agentes y pipelines: el proxy expone una API compatible con OpenAI, lo que permite conectar frameworks que esperan ese contrato, siempre que se asuma que las respuestas no son en streaming.
- Evaluacion de tecnicas de inferencia eficiente: el paquete sirve como banco de pruebas para decodificacion especulativa MTP, omision de expertos y offloading de expertos a disco en un MoE real.
- Investigacion sobre RL aplicado a concision: el LoRA `rl_it12.gguf` y su evaluacion de perplejidad por dominio permiten estudiar el compromiso entre brevedad y precision en modelos de razonamiento.
- Despliegue en entornos con RAM muy limitada: el cgroup con `MemoryMax=7e9` y sin swap permite ejecutar el servidor en maquinas de 16 GB compartidas con otros procesos.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| Conjunto retenido de matematicas | 33/33 | 11 problemas, 3 semillas |
| AIME 2026 | 15/28 | 28 problemas, semilla 0, presupuesto de 14k tokens |
| AIME 2026 sin presupuesto | 17/28 | Mismo modelo, sin limite de thinking |
| Conjunto sintetico de aritmetica exacta | 11/30 | 30 problemas; 27 de 30 agotaron el presupuesto de thinking |
| Perplejidad LoRA vs base | +0,18% en el peor dominio | Limite aceptado +1%, cuatro dominios |

Rendimiento de inferencia medido por el autor (T=1, top_k 20, top_p 0.95):

| Maquina | Tokens/s | Estado |
|---|---|---|
| Sobremesa Zen 3 de 6 nucleos con NVMe | ~42-50 equivalentes | Estimado con modelo de coste, no confirmado con reloj de pared limpio |
| Portatil i5-8265U (4 nucleos, 15 W) con NVMe | 12,8-13,3 | Medido; limitado por CPU |
| VM cloud, 6 nucleos Xeon a 2,2 GHz, disco de red | 7,7-8,1 | Medido; limitado por disco |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el diseno es exclusivamente para CPU. El servidor se limita a 7 GB de RAM, page cache incluido.
- RAM del sistema: 16 GB recomendados; el servidor corre en un cgroup con `MemoryMax=7e9` y sin swap cuando se ejecuta como root con systemd.
- CPU: Linux x86-64 con AVX2, 6 nucleos de sobremesa o superior (calibrado en 6 nucleos Zen 3). En Windows, WSL2.
- Almacenamiento: SSD NVMe local con al menos ~600 MB/s en lecturas aleatorias de bloques grandes; unos 40 GB de disco libre para modelo, LoRA, expertos empaquetados y motor.
- GPU: no se usa GPU; no se documentan opciones con aceleracion grafica.
- Despliegue: motor ik_llama.cpp parcheado (`patches/ik_llama.cpp-chimera.diff`), scripts `deploy/install.sh` y `deploy/chimera-server.sh` (puerto 18096) y proxy `deploy/chimera_proxy.py` (puerto 8080, API OpenAI). El GGUF carga en llama.cpp estandar, pero sin el parche no cabe en 7 GB ni alcanza las velocidades indicadas.
- Latencia y throughput: ver tabla de rendimiento; el limite teorico es (throughput del disco / 24 MB) tokens por segundo. Un disco de red o SATA se convierte en cuello de botella.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Ejecucion en CPU |
|---|---|---|---|---|---|
| Chimera-Qwen3.6-35B-A3B-GGUF | 36,5B | ~3B | No disponible | Apache-2.0 | Si, con motor parcheado y 7 GB de RAM |
| Qwen/Qwen3.6-35B-A3B (base) | 36,5B | ~3B | No disponible | Apache-2.0 | Posible con llama.cpp, pero sin el parche no cabe en 7 GB |
| Alternativas MoE de ~30-40B | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de otros modelos comparables (por ejemplo, Qwen3-30B-A3B u otros MoE de la misma familia), por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- El motor parcheado es obligatorio para cumplir los requisitos de RAM y velocidad; con llama.cpp estandar el modelo no cabe en 7 GB ni alcanza el rendimiento indicado.
- La velocidad depende criticamente del SSD: con un disco de red o SATA el rendimiento cae a 7,7-8,1 tokens/s o menos.
- El presupuesto de thinking de 14k tokens penaliza problemas de derivacion muy larga: el autor reporta 15/28 frente a 17/28 en AIME 2026.
- El conjunto sintetico de aritmetica exacta obtiene 11/30, con 27 de 30 problemas agotando el presupuesto; el modelo no es fiable en calculo exacto de muchos pasos.
- Las respuestas del proxy no son en streaming.
- La documentacion dentro de `deploy/` esta en portugues.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma en la informacion disponible; como modelo generativo, mantiene el riesgo general de alucinacion.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen3.6-35B-A3B y del motor ik_llama.cpp por separado.
- El paquete tiene 370 descargas y 1 like en el momento de la ficha; es una distribucion de un tercero, no oficial de Qwen.
- Los checksums SHA-256 publicados (`q_c59.gguf`: `14fec342...5034acf8`; `rl_it12.gguf`: `26667169...b54803a4`) deben verificarse antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/samueltm/Chimera-Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
