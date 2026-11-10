# nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-4bit-KQuant es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, publicada por nace-ai. No se trata de un modelo entrenado desde cero, sino de un empaquetado optimizado para Apple Silicon que aplica KQuant, una técnica de cuantización propia del motor de inferencia Kapitsa de Nace.AI. El objetivo es ofrecer un pack de 4 bits del mismo tamaño que el estándar (19,51 GB de pesos del modelo de lenguaje) pero con menor degradación respecto al modelo original en bf16.

El modelo base es un transformer MoE (mezcla de expertos) con 35.107.181.936 parámetros totales según los safetensors del repo. La ficha del pack no detalla el número de parámetros activos, la longitud de contexto ni la composición del dataset de entrenamiento del modelo original, por lo que esos datos figuran como no disponibles. La arquitectura declarada en los tags es `qwen3_5_moe`, y el pipeline es `image-text-to-text`, lo que indica que el pack incluye la torre de visión del modelo base, aunque el autor advierte que dicha torre no fue evaluada.

La relevancia de este pack es doble: por un lado, demuestra una mejora medible de la calidad de cuantización (KL de 0,059 frente a 0,096 del pack estándar, y 91,2 % de coincidencia en el siguiente token frente a 89,0 %), y por otro, ofrece un rendimiento superior en escritura sobre un MacBook Pro M5 Pro de 48 GB (219-234 tok/s frente a 200-224 tok/s). Está pensado para desarrolladores que quieran ejecutar localmente un modelo MoE de 35B en hardware Apple con la máxima fidelidad posible al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con torre de visión incluida |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit (KQuant), escala por grupo de 64 pesos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), más `mtp.safetensors` y `mtplx_runtime.json` |

## Arquitectura y entrenamiento

El pack es una cuantización del modelo Qwen/Qwen3.6-35B-A3B, un transformer de tipo mezcla de expertos. No se ha reentrenado: los pesos proceden del modelo base y se han convertido a MLX affine 4-bit mediante KQuant. La innovación técnica de este pack reside en el proceso de cuantización: en lugar de calcular la escala por grupo de 64 pesos a partir del mínimo y el máximo, KQuant busca la escala óptima sobre 11 rangos de recorte y aplica una ponderación derivada de 128 textos de calibración. El formato, los ficheros y el tamaño resultantes son idénticos a los de un pack MLX 4-bit estándar.

El pack incorpora además una cabeza MTP (multi-token prediction) tomada de Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed, que a su vez la hereda de cyankiwi/Qwen3.6-35B-A3B-AWQ-4bit, y el tronco del cuerpo de mlx-community/Qwen3.6-35B-A3B-4bit. El tokenizador y la plantilla de chat son los del build de Youssofal. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento, según el pipeline `conversational` del modelo base.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de visión está incluida en el repo, aunque el autor indica que no fue evaluada.
- Escritura de código: el pack se evaluó con HumanEval como parte del conjunto de calibración de KL, lo que confirma su uso en tareas de código.
- Razonamiento matemático: evaluado en GSM8K con resultado de 0,952 en zero-shot, greedy y thinking desactivado.
- Decodificación especulativa mediante la cabeza MTP incluida (`mtp.safetensors`), que acelera la generación en el motor Kapitsa.
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código local en Mac: el pack se integra con `mlx-lm` y con Kapitsa, de modo que un desarrollador puede lanzar `mlx_lm.generate` o `kapitsa serve --model 35b` y obtener un asistente de programación que escribe a 219-234 tok/s en un M5 Pro de 48 GB, sin enviar código a la nube.
- Razonamiento matemático en local: con GSM8K en 0,952 y decodificación greedy, es adecuado para resolver problemas aritméticos paso a paso en entornos sin conectividad, por ejemplo en cuadernos de análisis o herramientas educativas.
- Prototipado de aplicaciones multimodales: al incluir la torre de visión, permite experimentar con entradas imagen-texto en Apple Silicon, aunque conviene validar la calidad de visión por cuenta propia al no haber sido evaluada por el autor.
- Servicio de inferencia local con API: Kapitsa expone una página de chat y una API en `http://127.0.0.1:8000`, lo que permite montar un endpoint compatible con aplicaciones internas en una estación de trabajo Mac.
- Evaluación de técnicas de cuantización: investigadores pueden comparar KQuant frente al pack estándar con las mismas condiciones (KL, acuerdo en el siguiente token, GSM8K) y reproducir los resultados publicados en el registro de benchmarks del repositorio de Kapitsa.
- Generación de texto a alta velocidad en portátil: con 219 tok/s a temperatura 0,6 y 234 tok/s en greedy, es viable para redacción asistida, resumen y generación de documentación en flujos interactivos sobre un MacBook Pro.
- Despliegue de un MoE de 35B en hardware de consumo Apple: al ocupar 19,51 GB de pesos de lenguaje y caber en un M5 Pro de 48 GB, permite trabajar con un modelo de esta escala sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica | Pack estandar | KQuant (este repo) |
|---|---:|---:|
| KL respecto a bf16 (menor es mejor) | 0,096 | 0,059 |
| Coincidencia con bf16 en el siguiente token | 89,0 % | 91,2 % |
| GSM8K (1.319 preguntas, zero-shot, greedy) | 0,948 | 0,952 |
| Escritura, temperatura 0,6 (tok/s, M5 Pro 48 GB) | 200 | 219 |
| Escritura, greedy (tok/s, M5 Pro 48 GB) | 224 | 234 |
| Lectura de prompt de 4K (tok/s, M5 Pro 48 GB) | 3.234 | 3.192 |

En GSM8K, 19 preguntas solo las acierta el pack estándar y 24 solo KQuant, diferencia no significativa (McNemar z = 0,76). El pack estándar de comparación es Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed en la revisión `95460516`. Las mediciones de calidad y velocidad se hicieron sobre cargas de texto; la torre de visión no se evaluó.

## Requisitos de hardware

- VRAM/unified memory estimada: 19,51 GB de pesos del modelo de lenguaje, más la torre de visión y overhead del runtime; el repo completo ocupa 21,0 GB.
- Hardware mínimo medido: MacBook Pro con M5 Pro y 48 GB de memoria unificada, macOS 26.5.2, con corriente alterna.
- Cabe en GPU de consumo Apple Silicon de gama alta con 48 GB o más; no se han publicado mediciones para configuraciones inferiores.
- Despliegue: Kapitsa 0.2.34 o superior (o build de main) y `mlx-lm` 0.32.2 o compatible.
- Throughput medido: 219 tok/s a temperatura 0,6 y 234 tok/s en greedy para respuestas de 512 tokens; lectura de prompt de 4K a 3.192 tok/s.
- Las pruebas de calidad se ejecutaron con mlx-lm 0.32.2 sobre una Modal H200 con MLX sobre CUDA, usando solo los pesos de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant | 35,1B totales | MLX 4-bit KQuant | no disponible | apache-2.0 | Hugging Face, MLX |
| Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed | 35,1B totales (base) | MLX 4-bit estandar | no disponible | apache-2.0 | Hugging Face, MLX |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35,1B totales (base) | MLX 4-bit | no disponible | apache-2.0 | Hugging Face, MLX |
| cyankiwi/Qwen3.6-35B-A3B-AWQ-4bit | 35,1B totales (base) | AWQ 4-bit | no disponible | apache-2.0 | Hugging Face, GPU CUDA |

La comparación directa de rendimiento entre estos packs solo está publicada frente al pack estándar de Youssofal: KQuant mejora el KL (0,059 frente a 0,096), la coincidencia de siguiente token (91,2 % frente a 89,0 %) y la velocidad de escritura (219-234 tok/s frente a 200-224 tok/s). No hay datos de benchmarks frente a los otros packs.

## Limitaciones y advertencias

- La torre de visión está incluida pero no fue evaluada; su calidad en tareas imagen-texto no está verificada por el autor.
- Las mediciones de calidad y velocidad se limitan a cargas de texto y a un único Mac (M5 Pro, 48 GB); no hay datos para otros equipos Apple.
- El rendimiento en lectura de prompts largos es ligeramente inferior al pack estándar (3.192 frente a 3.234 tok/s, un 1,3 % más lento, dentro de la variabilidad del 4 % entre ejecuciones).
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto del modelo base en la documentación proporcionada.
- Requiere Kapitsa 0.2.34 o superior (o un build de main) para aprovechar la cabeza MTP; con versiones anteriores puede no funcionar correctamente.
- La licencia apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.6-35B-A3B; conviene revisar la ficha del modelo original para cualquier restricción adicional.
- El pack depende de componentes de terceros (cabeza MTP de Youssofal y cyankiwi, tronco de mlx-community); cambios en esos repositorios no afectan a este pack, pero su procedencia conviene tenerla en cuenta en auditorías.

## Enlaces

- Hugging Face del pack: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Pack estándar de comparación: https://huggingface.co/Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed
- Origen de la cabeza MTP: https://huggingface.co/cyankiwi/Qwen3.6-35B-A3B-AWQ-4bit
- Tronco del cuerpo: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Motor de inferencia Kapitsa: https://github.com/nace-ai/kapitsa
- Documentación de KQuant en el README de Kapitsa: https://github.com/nace-ai/kapitsa#kquant
- Registro de resultados de benchmarks: https://github.com/nace-ai/kapitsa/blob/main/bench/results/2026-11-10-m5-pro-kquant-35b/README.md
- Otro pack KQuant del mismo autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Sitio de Nace.AI: https://www.nace.ai/
