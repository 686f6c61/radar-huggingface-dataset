# cgg507/GLM-5.3-Flash-GM-RP-v3-GGUF

## Resumen
GLM-5.3-Flash-GM-RP-v3-GGUF es una cuantizacion en formato GGUF del modelo zai-org/GLM-5.3-Flash-BF16, un transformer de tipo Mixture-of-Experts (MoE) de aproximadamente 320.759 millones de parametros totales, sobre el que se ha fusionado el adaptador LoRA cgg507/GLM-5.3-Flash-GM-RP-v3-LoRA. El modelo resultante esta especializado en rol conversacional de ficcion: partidas de rol de mesa (Game Master) y conversaciones de rol entre personajes, con un bloque de razonamiento (thinking) en cada turno del asistente. Lo publica el usuario cgg507 y se distribuye bajo licencia MIT.

La relevancia de esta ficha radica en que no se trata de un modelo generalista, sino de un ajuste fino experimental orientado a ficcion adulta sin censura adicional sobre el modelo base, con un estilo de antagonistas mas duro y punitivo que su predecesor GM-CoT. El autor advierte explicitamente de que es material experimental para ficcion oscura y juego de mesa, no apto para menores, y de que no ha recibido un ajuste de seguridad adicional mas alla del modelo base.

Tecnicamente, el repositorio incluye tres recetas de cuantizacion (Q4_K_M, IQ4_XS y una mezcla Q3_K personalizada) con una politica de precision muy conservadora: la atencion (proyecciones KDA y MLA, indexador DSA) nunca se cuantiza y se mantiene en bf16, mientras que solo los expertos enrutados se comprimen de forma agresiva. El repositorio completo ocupa 513,2 GB y esta pensado para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida KDA (lineal) y MLA, indexador DSA y capa MTP (NextN); 42 capas mas capa MTP |
| Parametros totales | 320.759.404.382 (320,76 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, IQ4_XS, Q3_K-GM (mezcla Q3_K personalizada); BF16 como referencia; no se publica Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); pesos base en BF16 safetensors; proyector de vision en `mmproj/` (BF16 y Q8_0) |

## Arquitectura y entrenamiento
El modelo base GLM-5.3-Flash es un transformer MoE con dos mecanismos de atencion combinados: KDA (atencion lineal, presente en 34 capas) y MLA (Multi-head Latent Attention, en 11 capas), ademas de un indexador DSA y una capa MTP (multi-token prediction / NextN) en el bloque 45. Los expertos enrutados se distribuyen en 42 capas (blk.3-44) con 288 expertos por capa, lo que da 12.096 expertos enrutados en total. El modelo incorpora tambien un experto compartido (`ffn_*_shexp`) y un MLP denso en las capas 0-2.

El ajuste LoRA se aplico con rango 64 sobre la atencion (KDA y MLA), el experto compartido y los MLP densos, y con rango 32 sobre los 12.096 expertos enrutados. Se entreno durante 1 epoca (288 pasos), publicandose el paso 280 como release. Los datos de entrenamiento son conversaciones de aventura de texto libre de formato largo (Game Master) y rol entre personajes, con un bloque de razonamiento en cada turno del asistente. El adaptador se entreno contra RedHatAI/GLM-5.3-Flash-NVFP4 y se fusiono en los pesos BF16 estandar (revision `f9fed3bbc822`). La politica de cuantizacion mantiene en bf16 toda la atencion y el indexador DSA, cuantiza los expertos enrutados de forma agresiva (con `ffn_down_exps` un paso por encima de gate/up, siguiendo la receta de AesSedai), mantiene el experto compartido y los MLP densos en 8 bits, y deja normas, router, mHC, conv1d y parametros A/dt en f32.

## Capacidades
- Generacion de texto conversacional de formato largo orientada a rol de ficcion (Game Master y rol entre personajes).
- Razonamiento explicito en cada turno: el prompt de generacion termina en `<|assistant|><think>` y el modelo emite razonamiento antes de `</think>` y de la respuesta final.
- Coherencia narrativa multi-turno en partidas de rol de mesa, con NPCs y antagonistas que mantienen una actitud dura y consecuente.
- Capacidad de vision a traves del proyector `mmproj/` (torre de vision no adaptada por el LoRA), invocable con `--mmproj` en llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles documentado.

## Casos de uso
- Partidas de rol de mesa asistidas por IA: el modelo actua como Game Master que narra escenas, interpreta NPCs y reacciona a las decisiones del jugador manteniendo la coherencia entre turnos gracias al entrenamiento sobre conversaciones de formato largo.
- Rol entre personajes en ficcion adulta: util para escritura colaborativa o simulacion de personajes con personalidad estable, ya que el LoRA se entreno especificamente sobre conversaciones de rol entre personajes.
- Generacion de ficcion oscura y narrativa dura: el estilo de antagonistas que amenazan y cumplen sus amenazas encaja en relatos de terror, drama o fantasia oscura donde se busca tension sostenida.
- Prototipado de motores de aventura conversacional: el bloque de razonamiento en cada turno permite trazar la logica interna del modelo antes de la respuesta, util para depurar la coherencia de una narrativa ramificada.
- Investigacion sobre ajuste fino LoRA en modelos MoE de gran tamano: el repositorio documenta la receta completa (rangos, capas adaptadas, mezcla de cuantizacion) y sirve como referencia reproducible.
- Evaluacion de estrategias de cuantizacion extrema: las tres recetas publicadas (Q4_K_M, IQ4_XS, Q3_K-GM) con politica de no cuantizar la atencion permiten estudiar el impacto de la compresion en un MoE de 320 mil millones de parametros.
- Despliegue local de rol asistido en llama.cpp: con las variantes Q3_K-GM o IQ4_XS se puede servir el modelo en hardware de gama alta sin depender de APIs externas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta comprobaciones de coherencia cualitativa ("coherent") para cada receta de cuantizacion, sin metricas numericas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 207,4 GB para Q4_K_M, 164,6 GB para IQ4_XS y 138,9 GB para Q3_K-GM, segun el tamano de cada carpeta publicada.
- GPU recomendadas: no disponible en la informacion proporcionada; por el volumen de pesos, se requiere un entorno multi-GPU de centro de datos (clase A100/H100) o descarga en CPU/RAM con llama.cpp.
- Cabe en GPU de consumo: no. Ninguna de las cuantizaciones publicadas (minimo 138,9 GB) cabe en una RTX 4090 (24 GB) ni en GPUs consumer convencionales.
- Opciones de despliegue: llama.cpp (formato GGUF, archivos multiparte; apuntar a la primera parte `...-00001-of-0000N.gguf`), con soporte de `--jinja` para la plantilla de chat y `--mmproj` para vision. vLLM, TGI u Ollama no estan documentados en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-GM-RP-v3-GGUF (este) | 320,76 mil millones | no disponible | GGUF | MIT | Rol de ficcion, thinking obligatorio, vision via mmproj |
| cgg507/GLM-5.3-Flash-GM-CoT-GGUF | no disponible | no disponible | GGUF | no disponible | Solo Game Master, sin rol entre personajes; predecesor directo |
| cgg507/GLM-5.3-Flash-GM-E32-GGUF | no disponible | no disponible | GGUF | no disponible | Receta Q4_K_M sin imatrix reutilizada aqui |
| zai-org/GLM-5.3-Flash-BF16 | no disponible | no disponible | safetensors (BF16) | no disponible | Modelo base sin adaptar, pesos de alta precision |

## Limitaciones y advertencias
- Modelo experimental sin ajuste de seguridad adicional: el autor advierte de que no esta safety-tuned mas alla del modelo base y que puede generar temas maduros, violencia grafica, crueldad y lenguaje soez cuando la escena lo requiera.
- No apto para menores; la responsabilidad de uso recae en el usuario segun la model card.
- Sesgos conocidos: no disponible en la informacion proporcionada; al ser un ajuste sobre un modelo base generalista, hereda los sesgos de este, no documentados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modo de razonamiento largo (mediana de unos 1.700 caracteres) consume presupuesto de tokens y puede producir derivas narrativas.
- El thinking debe mantenerse activado: el autor indica que GLM se comporta de forma extrana si se fuerza su desactivacion, y recomienda un presupuesto de generacion de 1500+ tokens.
- Limitacion de idioma: solo ingles documentado; el rendimiento en castellano no esta evaluado.
- Restricciones de licencia: MIT permite uso comercial, pero el contenido generado puede ser inapropiado para productos dirigidos a menores o entornos sin moderacion.
- Requisitos de hardware muy elevados: la variante mas pequena ocupa 138,9 GB, lo que excluye el despliegue en GPU de consumo.
- La variante Q3_K-GM tiene podada la capa MTP (sin multi-token prediction); Q4_K_M e IQ4_XS la conservan sin adaptar.
- Solo se publican tres cuantizaciones; no hay Q8_0 disponible (se uso solo como referencia de divergencia KL).

## Enlaces
- Repositorio GGUF: https://huggingface.co/cgg507/GLM-5.3-Flash-GM-RP-v3-GGUF
- Adaptador LoRA: https://huggingface.co/cgg507/GLM-5.3-Flash-GM-RP-v3-LoRA
- Modelo base BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Modelo base (referencia): https://huggingface.co/zai-org/GLM-5.3-Flash
- Version NVFP4 usada para entrenar el adaptador: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Predecesor GM-only: https://huggingface.co/cgg507/GLM-5.3-Flash-GM-CoT-GGUF
- Predecesor con receta Q4_K_M: https://huggingface.co/cgg507/GLM-5.3-Flash-GM-E32-GGUF
- Receta de cuantizacion de referencia: https://huggingface.co/AesSedai/GLM-5.3-Flash-GGUF
