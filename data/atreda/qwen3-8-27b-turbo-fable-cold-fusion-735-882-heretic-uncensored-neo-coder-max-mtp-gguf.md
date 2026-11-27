# atreda/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de la familia Qwen3.8 (27B parametros) publicado por el usuario atreda sobre el modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. Se distribuye exclusivamente en formato GGUF cuantizado, con variantes "regular" y "MTP" (multi-token prediction) generadas mediante imatrix dual (DI-MATRIX), y esta orientado a inferencia en hardware de consumo.

El modelo se presenta como un tune "multi-stage" y "multi-state-merge" construido con las metodologias que el autor denomina COLD FUSION y FABLE FUSION 711, con datasets propios (DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets). Incorpora tecnicas de abliteration/heretic (eliminacion de rechazos) y un modo "TURBO" que, segun la model card, reduce el consumo de tokens de razonamiento entre 1/2 y 1/10 manteniendo la calidad de salida.

Su relevancia radica en la orientacion a despliegue local: el autor afirma que la version de 4 bits alcanza 719 en ARC-C y la de 8 bits 735, superando a los Qwen 3.8 27B, Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks. Estas cifras proceden unicamente de la model card y no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8 (no se detalla la arquitectura interna en la informacion disponible) |
| Parametros totales | 26.895.998.464 (~26,9B, segun safetensors del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits (variantes regular y MTP; imatrix dual; cuantizaciones "Turbo Brilliance 50x V2 AGI" adicionales) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 492,8 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un fine-tune multi-etapa sobre una base Qwen3.8 de 27B parametros, a su vez derivada de un tune previo del mismo ecosistema (DavidAU). La model card describe un proceso de "multi-stage tune" y "multi-state merge" con datasets estrictos propios (Polar-STRICT y F451-STRICT), y menciona las metodologias COLD FUSION y FABLE FUSION 711 como tecnicas de entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Las innovaciones declaradas se centran en dos ejes: la reduccion del sobre-razonamiento (menos tokens de "thinking" con calidad de salida mantenida) y la generacion de cuantizaciones GGUF con imatrix dual, incluidas variantes MTP (multi-token prediction). Tambien se indica que el modelo es "heretic/abliterated", es decir, se ha reducido el comportamiento de rechazo. No se aportan detalles tecnicos verificables sobre la arquitectura de atencion ni sobre el proceso de cuantizacion mas alla de las etiquetas.

## Capacidades

- Generacion de texto conversacional y de larga extension, con enfasis declarado en escritura creativa, ficcion, narrativa y roleplaying.
- Razonamiento con modo de pensamiento ("thinking") y modo TURBO de razonamiento reducido para bajar el consumo de tokens.
- Generacion de codigo (etiqueta "coder" y "NEO-CODER" en el nombre del modelo).
- Capacidades multimodales de entrada imagen-texto segun el pipeline declarado (image-text-to-text); no se detalla el codificador visual.
- Soporte multilingue en 16 idiomas, incluido el espanol.
- Soporte declarado de tool calling / function calling (el autor remite a la pestana "community" para benchmarks de terceros; no verificable en la informacion disponible).
- Uso generalista ("all use cases") segun las etiquetas del autor.

## Casos de uso

- Escritura creativa y narrativa asistida: el modelo esta afinado especificamente para ficcion, generos variados y roleplaying, con ejemplos en la model card orientados a produccion de prosa extensa.
- Generacion de codigo en local: la variante NEO-CODER y el soporte de tool calling permiten integrarlo en asistentes de programacion desplegados en estaciones de trabajo con GPU de consumo.
- Despliegue en hardware limitado: al publicarse en GGUF de 4 y 8 bits, es adecuado para entornos sin acceso a GPUs de datacenter, priorizando privacidad de datos.
- Razonamiento con coste controlado de tokens: el modo TURBO reduce el consumo de tokens de pensamiento, lo que resulta util en pipelines con limites de latencia o coste por token.
- Aplicaciones multilingues: cubre 16 idiomas, lo que permite atencion o generacion en espanol, arabe, chino, hindi y otros sin modelos adicionales.
- Prototipado de agentes conversacionales: la combinacion de contexto conversacional, tool calling declarado y formato GGUF facilita pruebas locales con llama.cpp u Ollama antes de escalar.
- Investigacion sobre alineacion y abliteration: util para estudiar el efecto de la eliminacion de rechazos en el comportamiento del modelo, con las cautelas eticas correspondientes.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente:

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Segun el autor, 144 puntos por encima de Qwen 3.8 27B |
| ARC-C (4 bits) | 719 | Valor declarado para cuantizacion de 4 bits |
| ARC-E (8 bits) | superior a 880 | Cifra declarada sin detalle exacto |

El autor afirma que el modelo supera a Qwen 3.8 27B, Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks criticos, pero no se incluyen en la informacion disponible las tablas completas con MMLU, HumanEval, GSM8K ni el resto de resultados.

## Requisitos de hardware

- VRAM estimada: en torno a 15-17 GB para cuantizacion de 4 bits y 28-30 GB para 8 bits, calculado a partir de los ~26,9B parametros (no confirmado en la informacion disponible).
- GPU recomendadas: A100 40 GB u H100 para 8 bits con contexto largo; RTX 4090 (24 GB) para 4 bits; RTX 3090/4080 (16-24 GB) para 4 bits con contexto reducido.
- Cabe en GPU de consumo: si, en 4 bits dentro de GPUs de 16 GB o mas, con posible offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo TGI o similares, aunque no se detalla.
- Latencia y throughput: no disponibles. El modo TURBO declara reducir tokens de razonamiento, lo que deberia mejorar la latencia percibida, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (atreda) | ~26,9B | no disponible | apache-2.0 | GGUF | Fine-tune heretic/uncensored con modo TURBO |
| Qwen 3.8 27B (base de referencia) | 27B | no disponible | no disponible | no disponible | Referencia usada por el autor para comparar ARC-C |
| Qwen 3.6 27B | 27B | no disponible | no disponible | no disponible | Citado como superado en 7 benchmarks por el autor |
| Qwen 3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | no disponible | no disponible | Citado como superado en 7 benchmarks por el autor |

Los datos de la comparativa proceden exclusivamente de las afirmaciones del autor; no se dispone de evaluaciones independientes.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": se ha reducido deliberadamente el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido inapropiado, ofensivo o danino sin filtros. Requiere moderacion externa en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos; no se han publicado evaluaciones de factualidad.
- Las cifras de benchmarks (ARC-C 735/719, ARC-E >880) son afirmaciones del autor sin verificacion independiente; deben tratarse con cautela.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- El modelo base es a su vez un fine-tune de un tune previo, con posible degradacion acumulada en capacidades no cubiertas por los datasets de ajuste.
- El repositorio ocupa 492,8 GB por acumulacion de cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- Aunque la licencia es apache-2.0, las condiciones de los modelos y datasets de origen deberian revisarse antes de uso comercial.
- El pipeline declarado (image-text-to-text) no se detalla; las capacidades multimodales no estan documentadas tecnicamente.

## Enlaces

- Hugging Face: https://huggingface.co/atreda/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Coleccion Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
