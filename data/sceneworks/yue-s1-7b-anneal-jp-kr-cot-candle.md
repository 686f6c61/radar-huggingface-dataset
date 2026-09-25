# SceneWorks/yue-s1-7b-anneal-jp-kr-cot-candle

## Resumen

SceneWorks/yue-s1-7b-anneal-jp-kr-cot-candle es un mirror de redistribución de los pesos YuE-s1-7B-anneal-jp-kr-cot, la etapa 1 del sistema de generación musical YuE desarrollado por M-A-P y HKUST. YuE (乐, "música" en chino) es una familia de modelos fundacionales open source orientada a lyrics2song: convertir letras en canciones completas con voz y acompañamiento. Esta etapa concreta es un modelo de lenguaje de aproximadamente 7.000 millones de parámetros (arquitectura transformer decoder-only de tipo Llama) que recibe letras y produce los tokens del codebook 0, la representación intermedia del sistema.

El repositorio lo publica SceneWorks para que los pesos se resuelvan mediante un SHA inmutable dentro del motor YuE de SceneWorks Inference, implementado en candle (Rust). No es una distribución oficial de M-A-P. El mirror incluye tres tiers autocontenidos: bf16 (safetensors sin modificar), q8 (7,26 GB, bloques GGML Q8_0) y q4 (4,49 GB, bloques GGML Q4_K), cada uno con su config, tokenizer y pesos. Es relevante porque ofrece una vía reproducible y cuantizada para ejecutar la etapa 1 de YuE, con contexto de 16384 tokens y vocabulario de 83968 entradas, bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (etapa 1 de YuE: LM de letras → codebook 0) |
| Parámetros totales | ~7.000 millones (7B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 16384 tokens |
| Tipos de cuantización | bf16, GGML Q8_0, GGML Q4_K (el preparador también contempla Q4_0) |
| Idiomas soportados | Japonés y coreano (variante jp-kr); los tags de la fuente upstream incluyen también inglés. La metadata de HuggingFace de este repo no especifica idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tier bf16); tiers q8/q4 como tensores U8 con bloques GGML raw (block_bytes: 18 = Q4_0, 34 = Q8_0, 144 = Q4_K) |

Datos adicionales: ancho de vocabulario 83968; tamaño total del repositorio 24,2 GB (suma de todos los tiers).

## Arquitectura y entrenamiento

La etapa 1 de YuE es un modelo de lenguaje autorregresivo basado en transformer decoder-only con arquitectura de tipo Llama, según los tags de la fuente upstream (m-a-p/YuE-s1-7B-anneal-jp-kr-cot incluye el tag "llama"). Su función dentro del pipeline es transformar las letras de entrada en la secuencia de tokens del codebook 0, que después se decodifica acústicamente mediante el códec xcodec y los decodificadores Vocos, y se completa con la etapa 2 (YuE-s2) y el upsampler. El tokenizer es un modelo SentencePiece mm (`tokenizer.model`) del que se deriva un `tokenizer.json` (BPE con byte-fallback y los tokens especiales mm en sus ids), verificado id a id sobre 3010 casos sin discrepancias.

Las variantes de la serie se nombran con los sufijos "anneal" (fase de annealing) y "cot" (chain-of-thought) o "icl", lo que indica distintos regímenes de ajuste y prompting dentro de la familia YuE. El paper asociado es arXiv:2503.08638. No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO para este checkpoint concreto.

## Capacidades

- Generación musical lyrics2song: convierte letras en la representación acústica (codebook 0) que da lugar a canciones con voz y acompañamiento tras las etapas posteriores.
- Modelado de géneros, idiomas y técnicas vocales diversas, según la descripción del proyecto upstream.
- Cobertura multilingüe orientada a japonés y coreano en esta variante (jp-kr).
- Modo "cot" (chain-of-thought) heredado de la nomenclatura de la serie, orientado a la generación condicionada por letras.
- Inferencia ejecutable en el motor candle (Rust) de SceneWorks Inference y en cargadores compatibles con bloques GGML.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso de propósito general.
- No se documentan capacidades de visión ni de audio de entrada: la entrada es texto (letras).

## Casos de uso

- Generación de canciones completas a partir de letras: la etapa 1 produce el codebook 0 que, combinado con xcodec-mini-infer, la etapa 2 y el upsampler, da lugar a una canción con voz y acompañamiento.
- Preproducción musical y demos: permite generar maquetas vocales e instrumentales a partir de letras antes de una grabación definitiva, usando el tier q4 para iterar rápido en hardware modesto.
- Experimentación multilingüe en japonés y coreano: útil para proyectos que necesitan adaptar letras en estos idiomas sin depender de servicios propietarios.
- Investigación en modelos generativos musicales: al ser un modelo abierto de 7B con contexto de 16384 tokens, sirve como base para estudiar representaciones de codebook y decodificación acústica.
- Pipelines de inferencia en Rust: integración en el motor candle de SceneWorks con pesos resueltos por SHA inmutable, lo que facilita builds reproducibles y despliegues versionados.
- Fine-tuning y ajuste específico de dominio: el tier bf16 en safetensors permite partir de pesos sin cuantizar para adaptar el modelo a un estilo o idioma concreto.
- Despliegue con memoria restringida: los tiers q8 (7,26 GB) y q4 (4,49 GB) permiten servir la etapa 1 en GPU de consumo, dejando recursos para el códec y la etapa 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV ni runtime): bf16 ~14 GB; Q8_0 7,26 GB; Q4_K 4,49 GB.
- Con overhead de runtime y caché KV para contexto de 16384 tokens, se estima aproximadamente: bf16 ~16-20 GB; Q8_0 ~9-11 GB; Q4_K ~6-7 GB.
- GPU recomendadas por tier: bf16 en A100 40GB, H100 o RTX 4090 24GB; Q8_0 en RTX 4090, RTX 4080, A10G o RTX 3060 12GB; Q4_K en GPU consumer de 8 GB como RTX 3070, 4060 o 3060 Ti.
- Cabe en GPU consumer: sí, los tiers q4 y q8 en tarjetas de 8-12 GB; el tier bf16 requiere al menos 16-24 GB.
- Opciones de despliegue: motor YuE de SceneWorks Inference sobre candle (Rust); tiers cuantizados en formato de bloques GGML, compatibles con cargadores GGML/llama.cpp; los tags upstream mencionan text-generation-inference. Requiere además SceneWorks/xcodec-mini-infer (códec xcodec + decodificadores Vocos) y la etapa 2 para obtener audio completo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Etapa / función | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SceneWorks/yue-s1-7b-anneal-jp-kr-cot-candle (este) | 7B | 16384 | Etapa 1, jp-kr, cot | bf16, Q8_0, Q4_K | Apache-2.0 | Mirror no oficial en HF |
| m-a-p/YuE-s1-7B-anneal-jp-kr-cot | 7B | no disponible | Etapa 1, jp-kr, cot | safetensors (bf16) | Apache-2.0 | Distribución upstream oficial |
| m-a-p/YuE-s1-7B-anneal-en-cot | 7B | no disponible | Etapa 1, inglés, cot | safetensors | Apache-2.0 | Distribución upstream oficial |
| m-a-p/YuE-s2-1B-general | 1B | no disponible | Etapa 2 (general) | safetensors | Apache-2.0 | Distribución upstream oficial |

Otras variantes de la familia citadas en la búsqueda: YuE-s1-7B-anneal-en-icl, YuE-s1-7B-anneal-jp-kr-icl, YuE-s1-7B-anneal-zh-cot, YuE-s1-7B-anneal-zh-icl y YuE-upsampler. Para modelos propietarios tipo Suno no se dispone de especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- Es un mirror no oficial: no lo publica M-A-P y debe citarse como redistribución de SceneWorks.
- No genera audio por sí solo: es una etapa intermedia (letras → codebook 0). Necesita xcodec-mini-infer, la etapa 2 y el upsampler para producir una canción completa.
- Repositorio pesado: 24,2 GB en total; conviene descargar solo el tier que se vaya a usar.
- Idiomas: la variante está orientada a japonés y coreano; el rendimiento en otros idiomas no está documentado en la información disponible.
- Sin benchmarks publicados para este checkpoint en la información disponible, por lo que no es posible comparar su calidad de forma cuantitativa.
- Riesgo de alucinación musical: como modelo generativo, puede producir pronunciaciones incorrectas, voces poco inteligibles o estructuras incoherentes respecto al estilo esperado.
- Sesgos potenciales derivados de los datos musicales de entrenamiento (estilos, idiomas y técnicas vocales sobrerrepresentados), aunque no se detallan en la información disponible.
- Licencia Apache-2.0: permite uso comercial con atribución; requiere conservar LICENSE y NOTICE (Sección 4(d)) y la autoría de Ruibin Yuan y colaboradores de M-A-P y HKUST.
- La metadata de HuggingFace de este repo declara 0 descargas y 0 likes y no especifica idiomas ni pipeline, por lo que no hay señales de adopción ni soporte comunitario.
- Los tiers cuantizados dependen del cargador GGML/candle: no todos los runtimes genéricos interpretan el formato de bloques raw almacenado como tensores U8.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SceneWorks/yue-s1-7b-anneal-jp-kr-cot-candle
- Modelo upstream oficial: https://huggingface.co/m-a-p/YuE-s1-7B-anneal-jp-kr-cot
- Réplica en HKUSTAudio: https://huggingface.co/HKUSTAudio/YuE-s1-7B-anneal-jp-kr-cot
- Códec compañero: https://huggingface.co/SceneWorks/xcodec-mini-infer
- Proyecto YuE en GitHub: https://github.com/multimodal-art-projection/YuE
- Mirrors alternativos en GitHub: https://github.com/digitalapplied/yue y https://github.com/seshakiran/yue
- Paper: https://arxiv.org/abs/2503.08638
