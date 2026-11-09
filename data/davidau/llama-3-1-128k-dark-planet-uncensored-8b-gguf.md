# DavidAU/Llama-3.1-128k-Dark-Planet-Uncensored-8B-GGUF

## Resumen

Dark Planet Uncensored 8B es un modelo de generacion de texto en ingles derivado de Llama 3.1, publicado por DavidAU en abril de 2025 y actualizado por ultima vez en noviembre de 2026. Se distribuye exclusivamente en formato GGUF cuantizado y esta orientado a escritura creativa, ficcion, generacion de tramas y roleplay. Su principal propuesta de valor es ofrecer una ventana de contexto de 131.072 tokens sobre una base Llama 3.1 con pasos adicionales de "des-censura" y re-masterizado de los pesos fuente en float32, lo que el autor presenta como una mejora en detalle y prosa frente a Llama 3 Instruct.

El modelo tiene 8.030.261.312 parametros (aproximadamente 8B) y una arquitectura transformer densa heredada de Llama 3.1, sin parametros activos tipo MoE. El autor indica que fue construido con mergekit, combinando linajes de modelos como Stheno v3.2 de Sao10K y Lumimaid 8B de NeverSleep. La licencia declarada es Apache 2.0 y el unico idioma soportado es el ingles.

Es relevante para desarrolladores e investigadores que necesitan un modelo pequeno, desplegable en hardware de consumo, especializado en prosa vivida y sin las restricciones de alineamiento tipicas de los modelos instruct convencionales. No obstante, conviene tratarlo como un modelo de nicho creativo: no esta pensado para tareas de razonamiento, codigo o matematicas, y el autor advierte de un sesgo negativo y de la presencia residual de "GPTismos".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Llama 3.1 (merge via mergekit) |
| Parametros totales | 8.030.261.312 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | GGUF en multiples niveles; el autor menciona versiones "enhanced quants", "max quants" y "maxcpu quants", asi como variantes Imatrix y F32 (no se detalla la lista completa de niveles Q en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 55,8 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 8B parametros basado en Llama 3.1, con la ventana de contexto nativa de 128k tokens de esa familia. El autor no describe en detalle el proceso de entrenamiento; indica que el modelo se construyo mediante mergekit a partir de linajes derivados de Llama 3.1, con menciones explicitas a Stheno v3.2 (Sao10K) y Lumimaid 8B v0.1 OAS (NeverSleep), y agradecimientos a Hastagaras. Sobre esa base se aplicaron pasos de "des-censura" y un re-masterizado de los pesos fuente en float32 antes de generar los GGUF.

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El autor afirma que el modelo presenta una perplejidad baja (inferior a Llama 3 Instruct segun sus propias mediciones) y que las variantes Imatrix reducen aun mas esa perplejidad. Tambien senala que el modelo funciona con temperaturas de 0 a 5, que tolera repetition penalty de 1 o superior (recomienda 1,05+) y que requiere la plantilla de Llama 3, aunque puede operar con la plantilla Command-R produciendo salidas notablemente distintas.

## Capacidades

- Generacion de texto en ingles con enfasis en prosa vivida, detalle descriptivo y escritura de ficcion.
- Generacion de tramas y subtramas, continuacion de escenas y construccion de historias en multiples generos (ciencia ficcion, romance, terror, etc.).
- Roleplay conversacional, con soporte para personajes y dialogos multi-turno.
- Escritura sin censura, incluyendo lenguaje soez y contenido adulto, segun la orientacion declarada del autor.
- Seguimiento de instrucciones detalladas: el autor indica que la calidad mejora cuanto mas especificos son el prompt y el system prompt.
- Capacidad de generar salidas largas si se le pide explicitamente una longitud; por defecto tiende a respuestas cortas.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Escritura de ficcion por capitulos: el modelo puede mantener coherencia sobre escenas largas gracias a los 131.072 tokens de contexto, util para novelas serializadas o borradores extensos con continuidad de personajes y tramas.
- Generacion de tramas y subtramas para guionistas: se le pueden pasar sinopsis, fichas de personaje y restricciones de genero para producir esquemas argumentales y giros, ajustando la temperatura para variar el registro.
- Roleplay y juegos de rol por texto: su entrenamiento orientado a RP y su tolerancia a temperaturas altas lo hacen adecuado para motores de personajes conversacionales, con repetition penalty de 1,05 o superior.
- Asistencia a escritores con bloqueo creativo: dado un fragmento previo y una indicacion de tono (por ejemplo, "vivid horror"), el modelo continua la escena con prosa descriptiva y ritmo narrativo.
- Prototipado de narrativa interactiva: integrable en motores de ficcion interactiva o videojuegos narrativos que necesiten generar descripciones y dialogos en tiempo real sobre hardware de consumo.
- Generacion de contenido de terror y generos oscuros: el sesgo negativo declarado por el autor encaja con narrativa de horror, distopia o drama, donde ese tono es una ventaja en lugar de un defecto.
- Experimentacion en investigacion sobre des-censura y alineamiento: util como caso de estudio de merges comunitarios que eliminan restricciones de seguridad sobre una base Llama 3.1, para analizar comportamientos y riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta afirmaciones cualitativas sobre perplejidad (inferior a Llama 3 Instruct, y aun menor en las variantes Imatrix) sin cifras concretas verificables en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: para un modelo de 8B, las cuantizaciones Q4 requieren aproximadamente 5-6 GB, Q5 en torno a 6-7 GB, Q6 alrededor de 7-8 GB y Q8 cerca de 9-10 GB; los pesos F32 completos rondan los 32 GB. Estas cifras son estimaciones estandar para 8B y no proceden de mediciones publicadas por el autor.
- GPU recomendadas: tarjetas consumer como RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 permiten ejecutar cuantizaciones Q4-Q8 con comodidad. Para contexto completo de 128k se necesita VRAM adicional por la cache KV, por lo que conviene una A100 40/80 GB o H100 en despliegues de contexto largo.
- Cabe en GPU de consumo: si, en cuantizaciones Q4 a Q8 con contextos moderados (8k-16k tokens, que es lo que el propio autor recomienda como minimo).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El autor no menciona soporte especifico para vLLM o TGI con estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor advierte que el modelo tiende a generar salidas largas salvo que se limite explicitamente, lo que afecta al throughput efectivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Dark Planet Uncensored 8B (este modelo) | ~8B | 131.072 | Ficcion, prosa vivida, RP sin censura | Apache 2.0 | GGUF |
| Llama 3.1 8B Instruct (Meta) | ~8B | 131.072 | Asistente general alineado | Llama 3.1 Community License | Safetensors, GGUF |
| Stheno v3.2 8B (Sao10K) | ~8B | 8.192 (base L3) | Roleplay y escritura creativa | no disponible en la informacion | Safetensors, GGUF |
| Lumimaid 8B v0.1 OAS (NeverSleep) | ~8B | 8.192 (base L3) | Roleplay y compania conversacional | no disponible en la informacion | Safetensors, GGUF |

Los dos ultimos son linajes citados por el propio autor como fuentes del merge, por lo que comparten base y orientacion creativa, pero este modelo anade la ventana de 128k de Llama 3.1 y el proceso de des-censura. Frente a Llama 3.1 Instruct, la diferencia principal es el sesgo creativo y la ausencia de alineamiento restrictivo, a costa de menor fiabilidad en tareas generales.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No esta disenado para razonamiento, matematicas, codigo ni tool calling; su uso en esos dominios producira resultados deficientes.
- El autor declara explicitamente un sesgo negativo y que "no es un modelo de finales felices", lo que puede ser inadecuado para aplicaciones de atencion al cliente o contenido corporativo.
- Riesgo de alucinacion y de deriva narrativa, especialmente con temperaturas altas; el autor advierte que subir demasiado la temperatura degrada el seguimiento de instrucciones.
- Presencia residual de "GPTismos" segun el propio autor, es decir, muletillas y patrones de estilo reconocibles.
- El modelo esta explicitamente des-censurado: puede generar lenguaje soez y contenido adulto, lo que exige filtros y politicas de moderacion si se expone a usuarios finales.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado y la ausencia de salvaguardas son responsabilidad del desplegador; conviene revisar implicaciones legales y de politica de plataforma.
- El contexto de 128k es nominal: el autor recomienda trabajar con 8k-16k y advierte que extender contexto con RoPE degrada la calidad y exige compensar con mas instrucciones y temperatura.
- Diferentes cuantizaciones producen salidas ligeramente distintas, lo que complica la reproducibilidad entre entornos.
- No hay benchmarks publicados que respalden las afirmaciones de calidad del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Llama-3.1-128k-Dark-Planet-Uncensored-8B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Variante SpinFire (L3.1): https://huggingface.co/DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B-GGUF
- Variante Darkest Planet 16.5B: https://huggingface.co/DavidAU/L3-DARKEST-PLANET-16.5B-GGUF
- Variante NEO Imatrix: https://huggingface.co/DavidAU/L3-Dark-Planet-8B-NEO-Imatrix-GGUF
- Variante NEO Imatrix Dark Horror: https://huggingface.co/DavidAU/L3-Dark-Planet-Horror-City-8B-NEO-Imatrix-GGUF
- Variante F32 Ring World: https://huggingface.co/DavidAU/L3-Dark-Planet-Ring-World-8B-F32-GGUF
- Variante V2 Eight Orbs Of Power: https://huggingface.co/DavidAU/L3-Dark-Planet-8B-V2-Eight-Orbs-Of-Power-GGUF
- Modelo fuente Stheno v3.2: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Modelo fuente Lumimaid 8B v0.1 OAS: https://huggingface.co/NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS
