# deer-sec/StagAI-CyberSecurity-26B-A4B-v2-BF16-MLX

## Resumen

StagAI-CyberSecurity-26B-A4B-v2 es un modelo de lenguaje de tipo texto especializado en ciberseguridad y razonamiento teorico avanzado, desarrollado por deer-sec. Se construye mediante fine-tuning del modelo base google/gemma-4-26b-a4b, una arquitectura MoE (Mixture of Experts) de 25.233.053.440 parametros totales, de los cuales aproximadamente 4.000 millones estarian activos por token segun la nomenclatura "A4B" del nombre. El entrenamiento se realizo con QLoRA de 8 bits sobre el framework MLX, con un total de 80.000 entradas de SFT (40.000 en ingles y 40.000 en japones).

El modelo esta disenado como motor de inferencia para profesionales de seguridad, investigadores, analistas de SOC y administradores de sistemas, en tareas de modelado de amenazas, evaluacion de vulnerabilidades, interpretacion de logs y estrategias de respuesta a incidentes. La ficha que nos ocupa corresponde especificamente a la variante BF16 en formato MLX, optimizada para Apple Silicon, con un tamano de repositorio de 50,5 GB y 0 descargas y 1 "like" en el momento de la consulta.

Es relevante ahora porque el autor afirma mejoras de calidad de respuesta frente al modelo base y frente a su version anterior (CyberStag-Security-26B-A4B-V1), a cambio de un incremento en la latencia de razonamiento ("thinking time"), y porque publica el modelo en formatos MLX y GGUF bajo licencia Apache 2.0, lo que facilita su despliegue tanto en estaciones de trabajo Apple como en entornos con llama.cpp o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), tipo Gemma-4 |
| Parametros totales | 25.233.053.440 (25,23 B) |
| Parametros activos | Aproximadamente 4 B por token segun la nomenclatura "A4B"; el valor exacto no se detalla en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16/FP16 sin cuantizar; Q8 (8 bits); Q4 (4 bits). La variante BF16-MLX de esta ficha es sin cuantizar |
| Idiomas soportados | Multilingue; ingles (en), japones (ja) y chino (zh) declarados en los metadatos |
| Licencia | Apache 2.0 (heredada, segun el autor, del modelo base) |
| Formato de pesos | safetensors en formato MLX (esta variante); tambien se publican variantes GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26b-a4b, un transformer con capas de mezcla de expertos (MoE). La nomenclatura "A4B" indica que, pese a los 25,23 B de parametros totales, solo se activan del orden de 4 B por token, lo que reduce el coste computacional de la inferencia respecto a un modelo denso de tamano equivalente. La eleccion de LoRA apunta a capas de atencion (q_proj, k_proj, v_proj, o_proj), capas MLP densas (gate_proj, up_proj, down_proj) y, de forma destacada, a las capas de expertos (experts.switch_glu.gate_proj, down_proj, up_proj), lo que confirma la presencia de un bloque MoE con enrutamiento tipo switch.

El fine-tuning se realizo con MLX (`mlx_lm.lora`) sobre QLoRA de 8 bits, con optimizador AdamW, learning rate de 5e-7, 18 capas entrenadas, `mask_prompt: true`, y parametros LoRA de rango 4, escala 1.0 y dropout 0.03. Los parametros entrenables representaron el 0,397 % del total (100,109 M de 25.233,053 M). Los datos de SFT son 80.000 entradas en total: 40.000 en ingles (AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1) y 40.000 en japones (deer-sec/deer_sec-japanese-cybersecurity-chatml-v2). No se documenta ninguna fase de RLHF o DPO. Como innovacion tecnica, el autor menciona una tecnica propia de fusion de los adaptadores LoRA en el modelo base "para evitar la perdida de peso" y una tecnica de fusion orientada a reducir el bucle degenerativo ("Doom Loop") en las variantes de 4 bits. No se detalla si hubo decodificacion especulativa ni attention lineal.

## Capacidades

- Generacion de texto conversacional orientada a ciberseguridad: analisis de amenazas, explicacion de vulnerabilidades y recomendaciones de mitigacion.
- Razonamiento paso a paso: el autor reporta un aumento del "thinking time" (latencia de procesamiento) a cambio de deducciones logicas mas profundas y salidas analiticas de mayor calidad.
- Interpretacion de logs y correlacion de eventos para analisis defensivo.
- Modelado de amenazas (threat modeling) y evaluacion de vulnerabilidades a nivel conceptual.
- Apoyo en respuesta a incidentes y estrategias de contencion/erradicacion.
- Capacidades multilingues: ingles y japones estan cubiertos por los datos de entrenamiento; el chino figura en los metadatos del modelo, presumiblemente heredado del modelo base, pero no hay datos de entrenamiento especificos declarados en chino.
- Modelo estrictamente de texto: no admite entradas multimodales (imagenes o audio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito con herramientas: no disponible en la informacion proporcionada.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede clasificar y priorizar alertas generadas por SIEM o EDR, resumir el contexto de cada deteccion y proponer un primer nivel de analisis antes de escalar al analista humano. Su ventana de contexto no esta documentada, por lo que conviene validar el limite real antes de usarlo con volumenes largos de eventos.
- Interpretacion de logs de red y de seguridad: analisis de trazas de firewall, IDS/IPS y proxies para identificar patrones anomales, reconstruir cadenas de ataque y traducir registros cripticos a explicaciones legibles para el equipo.
- Modelado de amenazas en fase de diseno: a partir de la descripcion de una arquitectura de aplicacion o infraestructura, el modelo puede enumerar superficies de ataque, proponer un analisis tipo STRIDE y priorizar contramedidas.
- Apoyo a la respuesta a incidentes: generacion de guiones de actuacion (playbooks) adaptados a un incidente concreto, borradores de comunicacion interna y resumenes post-incidente para auditoria.
- Hardening y revision de configuraciones: comparacion de configuraciones de sistemas operativos, servidores web o servicios cloud frente a buenas practicas, con explicacion del riesgo asociado a cada desviacion.
- Formacion y concienciacion: generacion de escenarios de phishing defensivo, explicaciones didacticas de CVEs y material de formacion para equipos no tecnicos, aprovechando el soporte de japones e ingles.
- Analisis conceptual de malware e indicadores de compromiso: explicacion del comportamiento descrito de una muestra o de un IoC, util para documentacion interna y para enriquecer informes de inteligencia de amenazas.
- Despliegue local con privacidad de datos: al distribuirse en MLX y GGUF y ser ejecutable en hardware local, permite procesar informacion sensible de seguridad sin enviar trazas ni configuraciones a servicios externos.
- Apoyo en analisis de dependencias y cadena de suministro: revision de listados de paquetes (por ejemplo, un SBOM) para senalar componentes con vulnerabilidades conocidas, siempre que se aporte la informacion de contexto en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente afirma mejoras cualitativas de calidad de respuesta frente al modelo base google/gemma-4-26b-a4b y frente a su modelo anterior CyberStag-Security-26B-A4B-V1, sin aportar cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de ciberseguridad.

## Requisitos de hardware

- VRAM/memoria para la variante BF16 de esta ficha: los pesos ocupan aproximadamente 50,5 GB (25,23 B de parametros a 2 bytes), por lo que se necesitan del orden de 55-60 GB de memoria para inferencia con margen para el contexto y el runtime.
- VRAM para la variante Q8: aproximadamente 25-30 GB.
- VRAM para la variante Q4_K_M: aproximadamente 13-16 GB en condiciones nominales, aunque el propio autor advierte que, debido a la tecnica de fusion empleada para mitigar los bucles degenerativos, el tamano resultante es mayor de lo habitual en una cuantizacion de 4 bits.
- GPU de centro de datos: A100 de 80 GB, H100 o H200 para la variante BF16; A100 de 40 GB o L40S de 48 GB para Q8; tarjetas de 24 GB para Q4.
- GPU de consumo: la variante BF16 no cabe en ninguna GPU de consumo actual. Q8 entra en una RTX 4090 o RTX 3090 de 24 GB con contexto corto. Q4 cabe en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) y, con margen ajustado, en algunas de 12 GB.
- Apple Silicon: MLX es el formato nativo de esta variante. Un Mac con memoria unificada de 64 GB o superior es el escenario recomendado para BF16; 32 GB son suficientes para Q8 y 16-24 GB para Q4.
- Opciones de despliegue: `mlx_lm` para los pesos MLX; llama.cpp y LM Studio para los pesos GGUF. La compatibilidad con vLLM u Ollama no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponible. Como referencia estructural, al tratarse de un MoE con aproximadamente 4 B de parametros activos, la latencia por token deberia ser inferior a la de un modelo denso de 25 B, pero el autor senala que el fine-tuning incrementa el tiempo de razonamiento respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StagAI-CyberSecurity-26B-A4B-v2 (esta ficha) | 25,23 B totales, ~4 B activos | no disponible | Sin benchmarks publicados; el autor reporta mejora cualitativa sobre el base y sobre la v1 | Apache 2.0 | MLX (FP16, Q8, Q4) y GGUF (FP16, Q8_0, Q4_K_M) |
| google/gemma-4-26b-a4b (modelo base) | 25,23 B totales, ~4 B activos | no disponible | Referencia sobre la que el autor afirma mejora | La del modelo base | Disponible en HuggingFace |
| CyberStag-Security-26B-A4B-V1 (version anterior) | no disponible | no disponible | El autor indica que v2 mejora la calidad de respuesta de v1 | no disponible | no disponible |
| Otros modelos especializados en ciberseguridad de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de lenguaje generativo y no se han publicado evaluaciones de fidelidad factual en dominios de seguridad. Las recomendaciones de mitigacion, identificadores de CVE, rutas de sistema o comandos deben verificarse siempre antes de aplicarlos en produccion.
- Bucles degenerativos en baja precision: el propio autor advierte que en 4 bits aumenta la probabilidad de repeticion ("Doom Loops"); por eso recomienda Q8 como formato de mayor precision efectiva, ya que el entrenamiento se hizo en QLoRA de 8 bits.
- Perdida de fidelidad en la conversion a GGUF: los pesos GGUF se derivaron del formato FP16 MLX, por lo que el autor admite que el formato MLX nativo puede ofrecer mayor precision. No se han publicado mediciones que cuantifiquen esa diferencia.
- Cobertura idiomatica desigual: los datos de entrenamiento son solo en ingles y japones (80.000 entradas). El chino aparece en los metadatos del modelo, pero no hay corpus de ajuste declarado en ese idioma. El castellano no figura entre los idiomas soportados, por lo que su rendimiento en espanol no esta garantizado.
- Contexto no documentado: se desconoce la longitud de contexto real del modelo base y si el fine-tuning la preserva.
- Sin soporte multimodal: no acepta imagenes ni audio, lo que descarta casos de uso como analisis de capturas de trafico o transcripcion de llamadas.
- Discrepancia de licencia: el autor declara Apache 2.0 heredada del modelo base, pero la familia Gemma suele distribuirse con sus propios terminos de uso. Conviene verificar la licencia efectiva del modelo base antes de un uso comercial o de redistribuir pesos derivados.
- Uso dual y responsabilidad legal: la model card restringe explicitamente el uso a fines educativos, de investigacion defensiva y de mejora de la resiliencia, y prohibe la generacion de exploits o cualquier actividad delictiva. El cumplimiento de esa restriccion recae en el usuario.
- Adopcion practicamente nula: 0 descargas y 1 "like" en el momento de la consulta, lo que implica ausencia de validacion independiente, de issues resueltos y de comunidad de soporte.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; todas las apariciones correspondian al animal "deer" (ciervo) y no a documentacion tecnica, por lo que no hay fuentes externas que corroboren las afirmaciones del autor.

## Enlaces

- Modelo en HuggingFace (variante BF16-MLX): https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-BF16-MLX
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b
- Variante Q8 en MLX (referenciada en la model card): https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-Q8-MLX
- Dataset en japones: https://huggingface.co/datasets/deer-sec/deer_sec-japanese-cybersecurity-chatml-v2
- Dataset en ingles: https://huggingface.co/datasets/AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1
- Framework MLX: https://github.com/ml-explore/mlx
- llama.cpp (para los pesos GGUF): https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web sobre el modelo: no se encontraron fuentes relevantes; los resultados obtenidos correspondian a documentacion zologica sobre el ciervo y no guardan relacion con el modelo.
