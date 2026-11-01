# namezz/gptoss-swallow-full-grpo-best400-20261028

## Resumen

GPT-OSS-Swallow Full GRPO Best400 es un checkpoint de ajuste fino por aprendizaje por refuerzo (GRPO) sobre el modelo base tokyotech-llm/GPT-OSS-Swallow-20B-SFT-v0.1, un modelo de aproximadamente 20.900 millones de parametros derivado de la familia GPT-OSS. Lo publica el usuario namezz en HuggingFace bajo licencia Apache 2.0. El modelo esta pensado para tareas de razonamiento matematico y resolucion de problemas, y el checkpoint publicado corresponde al punto de entrenamiento con mejor precision macro observada (89,32 %) dentro de una campana de RL que fue detenida por decision del usuario.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de investigacion reproducible: el autor publica no solo los pesos exportados a safetensors, sino tambien un archivo de experimento con los estados nativos del optimizador, scheduler, RNG y sampler, lo que permite reanudar el entrenamiento en condiciones controladas. Por otro, el propio autor advierte de que el proceso de RL se interrumpio, de que solo hay una semilla de entrenamiento y de que los intervalos de confianza son descriptivos, por lo que las cifras deben interpretarse con cautela.

El checkpoint se entrena sobre un backbone congelado de 20B y aplica GRPO completo (no solo soft-prompt). El resultado es un modelo de chat/razonamiento en formato HuggingFace, sin cuantizaciones publicadas ni idiomas declarados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-OSS), derivado de GPT-OSS-Swallow-20B-SFT-v0.1 |
| Parametros totales | 20.914.757.184 (20,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export HF); estados nativos del optimizador en el archivo de experimento |

## Arquitectura y entrenamiento

El modelo parte de GPT-OSS-Swallow-20B-SFT-v0.1 (revision 351586a34b260f67ed69ba52b09127e017a24762), un modelo de 20,9B parametros con arquitectura transformer decoder-only de la familia GPT-OSS, ya sometido a un ajuste supervisado (SFT) previo por parte de tokyotech-llm. Sobre ese backbone se aplica un entrenamiento de refuerzo con GRPO (Group Relative Policy Optimization), en dos variantes: una de ajuste completo (Full) y otra de soft-prompt (SP) que solo entrena 164.160 parametros (una matriz de 57 x 2880 en FP32) con el backbone congelado y learning rate de 1e-6.

El checkpoint publicado corresponde a la variante Full en el paso de optimizador 400 (iteracion nativa 99). Segun la model card, la evaluacion usa 1.960 respuestas sobre 560 preguntas: AIME 2024/2025 con 16 muestras por pregunta y MATH500 con 2 muestras, semillas 2000 + indice de muestra, con una precision macro calculada como media equiponderada de los tres benchmarks. La curva de resultados Full es: paso 280 (87,63 %), 320 (88,13 %), 360 (88,86 %), 400 (89,32 %), 440 (88,79 %) y 480 (88,90 %). La variante SP no mostro mejora clara: el cambio de 0 a 160 fue de +0,18 puntos porcentuales con IC bootstrap del 95 % de [-3,16, +3,27], lo que el autor interpreta como ausencia de mejora significativa. El entrenamiento se interrumpio tras un fallo asincrono de CUDA (illegal address) cuyo kernel origen no se resolvio; se activo CUDA_LAUNCH_BLOCKING=1 como mitigacion.

## Capacidades

- Generacion de texto y razonamiento de tipo chain-of-thought orientado a problemas matematicos (AIME, MATH500 son los benchmarks de evaluacion declarados).
- Resolucion de problemas matematicos de competicion, con muestreo multiple por pregunta (16 muestras en AIME) para tecnicas de best-of-N o majority voting.
- Ajuste por RL sobre un modelo SFT, lo que en principio preserva las capacidades conversacionales del backbone GPT-OSS-Swallow-20B-SFT.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas de RL sobre modelos de razonamiento: el checkpoint permite reproducir la curva de precision macro por paso de optimizador y comparar GRPO completo frente a soft-prompt con el mismo backbone y los mismos benchmarks.
- Investigacion en reproducibilidad de entrenamiento: el archivo de experimento incluye estados nativos del optimizador, scheduler, RNG, sampler y recibos de commit, lo que permite reanudar o auditar el entrenamiento en un entorno Slime/Megatron equivalente.
- Generacion de soluciones matematicas con best-of-N: dado el protocolo de evaluacion (16 muestras por pregunta en AIME), el modelo es adecuado para pipelines que generan varias soluciones y seleccionan por consenso o verificador.
- Benchmarking interno de modelos de 20B en matematicas: util como referencia para comparar otros ajustes de RL sobre la misma familia GPT-OSS-Swallow con el mismo perfil de evaluacion (fingerprint e3a23933...).
- Estudio de estabilidad de entrenamiento distribuido: el historial de fallos CUDA y las correcciones de compatibilidad documentadas en recovery/ sirven como caso de estudio para depurar entrenamientos de RL a gran escala.
- Base para nuevos experimentos de RL: al ser Apache 2.0 y publicar estados nativos, se puede partir de este checkpoint para continuar el entrenamiento con una nueva definicion de experimento (el autor advierte de que prompt232 no es un estado nativo reanudable).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (precision macro sobre AIME2024/2025 y MATH500, 1.960 respuestas / 560 preguntas):

| Checkpoint | Precision macro |
|---|---|
| Full paso 280 | 87,625 % |
| Full paso 320 | 88,128 % |
| Full paso 360 | 88,856 % |
| Full paso 400 (publicado) | 89,319 % |
| Full paso 440 | 88,792 % |
| Full paso 480 | 88,897 % |
| SP paso 0 (historico) | 77,517 % |
| SP paso 40 | 77,483 % |
| SP paso 80 | 78,028 % |
| SP paso 120 | 75,756 % |
| SP paso 160 | 77,694 % |
| SP paso 200 (perfil corregido) | 77,400 % |

No se han publicado resultados desglosados por benchmark (AIME2024, AIME2025, MATH500 por separado) ni comparaciones con modelos externos en la informacion disponible. El autor indica que los intervalos son descriptivos y condicionales, de una sola semilla, y no ajustan por seleccion de checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 42 GB solo para pesos (20,9B x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 80 GB o multi-GPU.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 21 GB de pesos; en 4 bits, alrededor de 11 GB de pesos, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para FP16. Para cuantizaciones de 4-8 bits podria caber en RTX 4090 (24 GB) o RTX A6000 (48 GB), pero no hay confirmacion del autor.
- Despliegue: no se documentan opciones de serving (vLLM, TGI, llama.cpp, Ollama). El repo solo contiene pesos safetensors; para llama.cpp/Ollama haria falta convertir a GGUF, lo que no esta publicado.
- Latencia y throughput: no disponibles.
- Entrenamiento: el autor menciona un entorno Slime/Megatron y fallos de CUDA; no se especifica el hardware exacto usado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GPT-OSS-Swallow Full GRPO Best400 (este) | 20,9B | no disponible | Apache 2.0 | Pesos safetensors + archivo de experimento | Checkpoint de RL, 89,32 % macro en AIME/MATH500 |
| tokyotech-llm/GPT-OSS-Swallow-20B-SFT-v0.1 | 20B (aprox.) | no disponible | no disponible en esta ficha | HuggingFace | Modelo base SFT del que parte este checkpoint |
| Familia GPT-OSS original | no disponible | no disponible | no disponible en esta ficha | HuggingFace | Arquitectura de referencia |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Entrenamiento interrumpido: la campana de RL se detuvo por decision del usuario; no hay reanudacion automatica autorizada.
- Una sola semilla de entrenamiento: los intervalos de confianza son descriptivos y no ajustan por seleccion de checkpoint, por lo que la superioridad del paso 400 sobre el 440 o el 480 no es estadisticamente concluyente.
- La variante soft-prompt no mostro mejora clara sobre su punto de partida (IC del 95 % cruza cero).
- Fallo de CUDA no resuelto: hubo un illegal address asincrono cuyo kernel origen no se identifico; el entrenamiento posterior uso CUDA_LAUNCH_BLOCKING=1 como mitigacion.
- Los scripts de recovery contienen rutas absolutas y comprobaciones de admision, no son comandos portables; requieren reenlazado explicito en otra maquina.
- No se declaran idiomas soportados ni longitud de contexto en la model card.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un modelo de razonamiento matematico, cabe esperar errores en dominios fuera de los benchmarks evaluados.
- Licencia Apache 2.0 permite uso comercial, pero se deben preservar los NOTICE y licencias del modelo base; el autor no relicencia los datos de benchmark.
- El modelo no debe tratarse como un estado nativo reanudable en el punto prompt232; el autor lo advierte explicitamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/namezz/gptoss-swallow-full-grpo-best400-20261028
- Archivo de experimento: https://huggingface.co/datasets/namezz/gptoss-full-sp-rl-stopped-20261028
- Modelo base: https://huggingface.co/tokyotech-llm/GPT-OSS-Swallow-20B-SFT-v0.1
- Repositorio GitHub: privado segun la model card, no disponible publicamente.
