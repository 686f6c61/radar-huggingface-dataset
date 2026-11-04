# Bejczy/Spamton

## Resumen

Spamton (publicado como `Bejczy/Spamton`) es un ajuste fino (LoRA fusionado) del modelo base Qwen/Qwen3.5-0.8B, orientado a roleplay de personaje fan-made del videojuego Deltarune. Lo desarrolla el usuario Bejczy y se distribuye unicamente en formato GGUF para llama.cpp, con un unico fichero de 529 MB cuantizado. El modelo tiene 752.393.024 parametros reales segun safetensors y hereda del base una arquitectura hibrida de atencion (bloques de atencion lineal tipo SSM intercalados con bloques de atencion completa cada cuatro capas).

El problema que resuelve es acotado: reproducir de forma consistente la personalidad, el registro verbal entrecorchetado y las obsesiones tematicas del personaje Spamton G. Spamton en conversaciones multi-turno. No es un modelo de proposito general ni compite en razonamiento, codigo o matematicas con modelos de su tamano; su utilidad esta en el rol conversacional y en servir como ejemplo de ajuste fino de bajo coste sobre un modelo hibrido pequeno.

Es relevante ahora por dos motivos: demuestra que un modelo de 0,8B con atencion hibrida puede adaptarse a un estilo muy especifico con un dataset pequeno (la model card menciona 998 ejemplos y una reduccion de loss de 2,02 a 0,13), y porque su empaquetado en GGUF de ~529 MB lo hace desplegable en hardware muy modesto, incluso en CPU. La informacion publica es escasa y mayoritariamente narrativa: la model card esta escrita en el registro del personaje y no documenta hiperparametros, composicion del dataset ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (SSM) y atencion completa intercaladas (`full_attention_interval: 4`), 24 bloques, 1024 dimensiones ocultas |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (un unico fichero publicado, 529.297.184 bytes); el nivel de cuantizacion concreto no se especifica |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors del ajuste |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura hibrida: de los 24 bloques, 18 usan atencion lineal con estado recurrente (etiquetada como SSM en la model card) y 6 usan atencion completa, situados en las posiciones 3, 7, 11, 15, 19 y 23. Cada bloque aplica normalizacion previa y conexiones residuales en el orden habitual (`x = x + Attention(Norm(x))`, `x = x + FeedForward(Norm(x))`). La dimension oculta es de 1024 en todas las capas. Esta combinacion busca reducir el coste de atencion en contextos largos manteniendo capacidad de recuperacion exacta en las capas de atencion completa.

Sobre el ajuste fino en si, la informacion disponible es minima: se describe como un LoRA sobre Qwen3.5-0.8B entrenado con 998 ejemplos conversacionales, con una loss que paso de 2,02 a 0,13. No se documentan tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, hiperparametros del LoRA (rango, alpha, capas objetivo) ni proceso de fusion. La model card incluye ademas contenido tematico sobre "matematicas del vacio" y "cosmologia" que forma parte del personaje y no describe el entrenamiento real.

## Capacidades

- Generacion de texto conversacional en ingles con un registro estilistico muy marcado (corchetes, mayusculas, hipervinculos ficticios).
- Roleplay de personaje consistente en conversaciones multi-turno.
- Respuesta a prompts dentro del universo Deltarune y a interacciones fuera de personaje, con deriva estilistica probable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo base es de 0,8B y el ajuste no esta orientado a ello.
- Capacidades multilingues: solo ingles declarado; el castellano no esta soportado de forma fiable.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Roleplay y entretenimiento conversacional: el modelo mantiene el registro del personaje en dialogos multi-turno, adecuado para demos, bots de comunidad o experiencias interactivas de fans.
- Prototipado de personajes con voz propia: sirve como referencia de como un LoRA pequeno puede imponer un estilo muy reconocible sobre un modelo de 0,8B, util para disenar pipelines de ajuste de personajes.
- Chatbots tematicos en foros o Discord: al ocupar ~529 MB en GGUF, puede ejecutarse en un servidor modesto o incluso en local, con coste de inferencia minimo.
- Generacion de texto creativo en el registro del personaje: parrafos, "contratos" ficticios, anuncios parodicos y material para contenido derivado de Deltarune.
- Educacion y demostracion tecnica: ejemplo practico de ajuste fino con LoRA, fusion y exportacion a GGUF para talleres o articulos sobre modelos pequenos.
- Pruebas de despliegue en llama.cpp: banco de pruebas ligero para validar infraestructura de inferencia (servidor compatible con endpoints, integracion en aplicaciones) antes de pasar a modelos mayores.
- Investigacion sobre estilo y alineacion: estudio de como el ajuste fino estrecho afecta a la coherencia estilistica y a la degradacion de capacidades generales en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la evolucion de la loss de entrenamiento (de 2,02 a 0,13) sobre los 998 ejemplos del dataset, que no es comparable con evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con el GGUF publicado (529 MB de pesos mas overhead de contexto y cache KV); con cuantizaciones de 4 bits el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para ellas y el cuello de botella sera el lanzamiento de kernels, no la memoria.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), servidores compatibles con la API de OpenAI mediante llama.cpp, y cualquier runtime que acepte GGUF. vLLM y TGI no soportan GGUF de forma directa en todas sus versiones, por lo que requeririan conversion a safetensors, no publicada.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano (0,8B) se espera inferencia en tiempo real en CPU moderna y muy alta en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Bejczy/Spamton | 752 M | no disponible | Roleplay de personaje (LoRA sobre Qwen3.5-0.8B) | apache-2.0 | GGUF |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | Proposito general, modelo base | no disponible en la informacion | safetensors y otros |
| Ajustes de personaje tipicos sobre modelos de 1B | ~1 B | variable | Roleplay | variable | GGUF / safetensors |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados ni se documentan contextos. Frente al base Qwen3.5-0.8B, Spamton sacrifica generalidad por consistencia estilistica; frente a otros ajustes de personaje, su principal diferencia es el empaquetado GGUF unico y su tamano reducido.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste estrecho sobre un dataset pequeno y de un solo personaje, es probable que reproduzca el registro y los topicos del personaje de forma rigida y que responda de forma incoherente fuera de ese dominio.
- Riesgo de alucinacion: alto en tareas factuales; el modelo esta optimizado para un estilo, no para precision. No debe usarse para consultas de informacion.
- Limitaciones de contexto e idioma: solo ingles declarado y contexto no documentado; el castellano y otros idiomas no estan soportados de forma fiable.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, pero el contenido del personaje Spamton es propiedad intelectual de Toby Fox y Deltarune; la licencia del modelo no cubre derechos sobre el personaje ni sobre material derivado.
- Caveats para produccion: un unico fichero GGUF sin documentacion de cuantizacion, sin safetensors del ajuste y sin evaluaciones; el modelo base Qwen3.5-0.8B debe verificarse por separado para confirmar su licencia y condiciones. No apto para tareas de codigo, matematicas, atencion al cliente real ni agentes.
- La model card contiene texto narrativo que no debe interpretarse como documentacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bejczy/Spamton
- Descarga directa del GGUF: https://huggingface.co/Bejczy/Spamton/resolve/main/SPAMTON-G-SPAMTON-0.8B-VOID.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
