# bcckfdn/cevher2-test-16-decay-it-dpo-GGUF

## Resumen

cevher2-test-16-decay-it-dpo-GGUF es una cuantizacion en formato GGUF de un modelo experimental de 1.513.546.496 parametros (aproximadamente 1,5B) desarrollado por el usuario bcckfdn en HuggingFace. El modelo base es bcckfdn/cevher2-test-16-decay-it-dpo-2, un modelo entrenado desde cero con la arquitectura de SmolLM2 (familia Llama), orientado a turco e ingles. Se trata de un proyecto personal de experimentacion, no de un modelo de produccion: la propia model card declara un numero de tokens de entrenamiento de 0, lo que sugiere que se trata de una prueba de concepto arquitectonica o de un entrenamiento en fase muy temprana.

Su relevancia es marginal para uso generalista, pero resulta interesante como ejemplo de como derivar variantes GGUF compatibles con llama.cpp, Ollama y LM Studio a partir de un modelo propio entrenado desde cero. El repositorio pesa 6,7 GB y ofrece cuatro cuantizaciones, desde BF16 hasta Q4_K_M. No se han publicado benchmarks ni evaluaciones, y las metricas de comunidad (0 descargas, 0 likes en el momento de la ficha) confirman su caracter experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM2 (arquitectura Llama), decoder transformer |
| Parametros totales | 1.513.546.496 (aprox. 1,5B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE; asumible densidad completa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de SmolLM2, basada en la familia Llama (transformer decoder con RoPE, SwiGLU y RMSNorm segun el diseno de referencia). La model card detalla una dimension oculta (hidden size) de 1792 y 34 capas, cifras coherentes con un modelo de aproximadamente 1,5B de parametros. El nombre del repositorio sugiere que el entrenamiento incorporo una etapa de fine-tuning instruccional seguida de DPO (Direct Preference Optimization), lo que explicaria el sufijo "-it-dpo" y el tag "conversational".

El dato mas llamativo es que la model card declara "Egitim token sayisi: 0" (numero de tokens de entrenamiento: 0). Esto indica que, en el momento de publicacion, el modelo no ha recibido preentrenamiento real o que la cifra no se ha actualizado. En consecuencia, no hay informacion sobre composicion del dataset, ni confirmacion de RLHF/DPO efectivo, y el modelo debe tratarse como un artefacto de prueba arquitectonica o de pipeline de entrenamiento. No se documentan innovaciones tecnicas como decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational), orientada a turco e ingles.
- Compatibilidad con el formato de chat de llama.cpp (ejemplo con el flag `-cnv` en la model card).
- Despliegue en runtimes locales estandar: llama.cpp, Ollama (mediante Modelfile) y LM Studio.
- Cuantizaciones desde Q4_K_M hasta BF16 para ajustarse a distintos presupuestos de memoria.
- Dado el estado de entrenamiento declarado (0 tokens), no cabe esperar capacidades fiables de razonamiento, codigo, matematicas ni tool calling; no hay documentacion que las respalde.

## Casos de uso

- Prueba de pipelines de entrenamiento propio: el modelo sirve como artefacto de verificacion para validar un flujo completo de preentrenamiento, fine-tuning instruccional, DPO y cuantizacion GGUF antes de escalar a un modelo real.
- Experimentacion con arquitectura SmolLM2 desde cero: util para investigadores que quieran inspeccionar pesos de una configuracion concreta (hidden 1792, 34 capas) entrenada independientemente de HuggingFaceTB/SmolLM2.
- Pruebas de inferencia en turco con modelos ligeros: puede usarse como punto de partida o comparacion en experimentos de adaptacion al turco, aunque su utilidad real depende del entrenamiento pendiente.
- Validacion de despliegue en Ollama y LM Studio: la model card incluye instrucciones concretas (Modelfile para Ollama, ruta de cache para LM Studio), lo que lo hace util para testear toolchains locales.
- Referencia para crear variantes GGUF: el repositorio ilustra como empaquetar un modelo propio en multiples cuantizaciones con tamaños documentados.
- Uso educativo: analizar la estructura de un modelo de 1,5B cuantizado en distintos niveles (BF16 a Q4_K_M) y su impacto en tamaño de archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion documentada:
  - Q4_K_M: 893 MB de archivo (cabe con holgura en GPUs de 4 GB e incluso en CPU con RAM modesta).
  - Q5_K_M: 1035 MB.
  - Q8_0: 1536 MB.
  - BF16: 2889 MB (cabe en GPUs de 4-6 GB o en CPU).
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090) ejecuta cualquiera de las variantes. La inferencia en CPU es viable para todas las cuantizaciones.
- Consumer GPUs: si, todas las variantes caben en GPUs consumer actuales y en equipos sin GPU.
- Opciones de despliegue: llama.cpp (comando `llama-cli` documentado), Ollama (via `ollama create` con Modelfile) y LM Studio (copia a la ruta de cache o busqueda desde la aplicacion).
- Latencia y throughput: no disponible; dado el tamaño de 1,5B, cabe esperar respuestas rapidas incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| cevher2-test-16-decay-it-dpo-GGUF | 1,5B | SmolLM2/Llama | no disponible | Apache 2.0 | Experimental, entrenamiento declarado en 0 tokens |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | Llama (SmolLM2) | 8192 tokens | Apache 2.0 | Preentrenado con ~11T tokens, benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5B | Llama-style (Qwen2) | 32768 tokens (128K con YaRN) | Apache 2.0 (algunas variantes Qwen) | Modelo maduro, multilingue, benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2B | Llama 3 | 131072 tokens | Llama 3.2 Community License | Modelo maduro, benchmarks publicados |

Frente a estas alternativas, cevher2-test no compite en rendimiento: su valor esta en el ambito experimental y en el soporte explicito de turco como objetivo de proyecto personal.

## Limitaciones y advertencias

- Entrenamiento declarado en 0 tokens: el modelo probablemente genere texto incoherente o aleatorio; no es apto para ningun caso de uso productivo tal como esta publicado.
- Riesgo de alucinacion maximo: sin preentrenamiento documentado ni evaluaciones, no hay garantia de coherencia factual, gramatical ni conversacional.
- Sin benchmarks ni evaluaciones de seguridad: no se conoce su comportamiento frente a contenido toxico, sesgos o prompts adversariales.
- Contexto maximo no documentado: no es posible planificar aplicaciones con documentos largos.
- Alcance linguistico limitado a turco e ingles segun la model card; el rendimiento en turco no esta verificado.
- Licencia Apache 2.0 sin restricciones para uso comercial, pero esto no mitiga la falta de calidad del modelo.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; los archivos GGUF no han sido probados por terceros.
- La fecha de creacion del repositorio (octubre de 2026) y el nombre "test" refuerzan su caracter de artefacto de prueba.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bcckfdn/cevher2-test-16-decay-it-dpo-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher2-test-16-decay-it-dpo-2
- Paper, blog o demo: no disponible
