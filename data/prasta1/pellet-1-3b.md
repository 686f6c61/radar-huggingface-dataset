# prasta1/PELLET-1.3B

## Resumen

PELLET-1.3B es un modelo de lenguaje causal denso de 1.320 millones de parametros, destilado por Peregrine Design Werx (publicado en Hugging Face por el usuario prasta1) a partir de su modelo docente LOG-13B. Forma parte de la denominada "Effluent Series" como segundo de tres modelos (LOG → PELLET → SLURRY) y su proposito es conservar aproximadamente un tercio de la capacidad general del docente en un tamano que quepa en hardware de campo: dispositivos gateway, Raspberry Pi, portatiles o equipos alimentados por energia solar.

La arquitectura sigue el esquema clasico de decoder estilo Llama con SwiGLU, RMSNorm, RoPE y atencion con query grouping (GQA, 16 cabezas de atencion y 4 grupos KV), 24 capas y un tamano oculto de 2.048. La ventana de contexto es de 16.384 tokens, aunque el propio autor advierte que el rendimiento en recuperacion decae de forma apreciable a partir de los 11.000 tokens, que debe considerarse el limite practico.

El modelo se distribuye bajo licencia Apache 2.0 en bfloat16 y en multiples formatos cuantizados (AWQ-4bit, GPTQ-4bit, GGUF de Q2 a Q8 y MLX-4bit), con un peso en disco de 0,79 GB en Q4_K_M. Su relevancia actual reside en la combinacion de tamano reducido, licencia permisiva y un enfasis explicito en despliegues sin operador humano, donde el fallo debe ser pequeno y visible en lugar de silencioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder causal denso estilo Llama (SwiGLU, RMSNorm, RoPE, GQA) |
| Parametros totales | 1,32B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (limite practico ~11K segun el autor) |
| Tipos de cuantizacion | bfloat16, AWQ-4bit, GPTQ-4bit, GGUF Q2–Q8, MLX-4bit |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF, AWQ, GPTQ, MLX |
| Capas | 24 |
| Tamano oculto | 2.048 |
| Cabezas de atencion | 16 (4 grupos KV) |
| Vocabulario | 128.256 tokens (heredado de LOG-13B; vocabulario efectivo ~61.000) |
| Precision nativa | bfloat16 |
| Tamano en disco (Q4_K_M) | 0,79 GB |
| Modelo base | prasta1/LOG-13B |
| Dataset de destilacion | prasta1/effluent-distill-60b |

## Arquitectura y entrenamiento

PELLET-1.3B es un transformer decoder denso de tipo Llama con 24 capas, tamano oculto de 2.048, 16 cabezas de atencion organizadas en 4 grupos KV (GQA) y activacion SwiGLU con normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). Se entreno mediante destilacion de logits desde LOG-13B sobre 60.000 millones de tokens de logits del docente, mas 12.000 millones de tokens adicionales de preentrenamiento continuado sobre el mismo corpus procedimental. El objetivo de destilacion es la divergencia KL entre las distribuciones del alumno y del docente sobre el vocabulario del docente, lo que obliga a mantener el tokenizador original.

Esa herencia del tokenizador de 128.256 tokens tiene una consecuencia estructural relevante: con un tamano oculto de 2.048, la matriz de embeddings concentra 262 millones de parametros, aproximadamente el 20% del modelo, y cerca del 40% del vocabulario corresponde a tokens que PELLET nunca emitira (vocabulario efectivo de unos 61.000 tokens). El autor documenta esta decision de forma explicita: retrenar un tokenizador de 61.000 tokens habria aportado cerca de un 18% mas de capacidad util, pero habria exigido una semana de realineamiento, y la prioridad del modelo es ser pequeno y correcto. No se documentan fases de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto causal en ingles con enfasis en dominios tecnicos y procedimentales.
- Extraccion y clasificacion de informacion sobre documentos tecnicos cortos (fichas de especificaciones, procedimientos, conversiones de unidades).
- Recuperacion de referencias offline: consulta de especificaciones, conversion de magnitudes y recuerdo de procedimientos sin conexion.
- Redaccion de texto estructurado breve sujeto a revision humana.
- Actuacion como primer nivel barato en una cascada de dos modelos, delegando escalados a LOG-13B o SLURRY.
- Ajuste fino posterior sobre tareas estrechas en una unica GPU de consumo.
- Razonamiento multi-paso limitado: el autor situa el umbral practico en cuatro o cinco pasos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.
- Capacidades multilingues: limitadas al ingles.

## Casos de uso

- Inspeccion de campo con dispositivo de mano: el modelo cabe en 0,79 GB en Q4_K_M y puede ejecutarse en una Raspberry Pi o en un portatil de campo para consultar especificaciones de una tuberia o valvula concreta antes de que el operario abandone la instalacion, sin dependencia de conectividad.
- Extraccion estructurada de fichas tecnicas: dado un documento corto de especificaciones, PELLET extrae campos (presion nominal, diametro, material) y los devuelve en formato estructurado; en Q4_K_M conserva el 97% de la calidad bf16 en tareas de clasificacion y extraccion segun el autor.
- Conversion de unidades y recuerdo de procedimientos offline: util en entornos sin red donde se necesita resolver una conversion o recuperar un paso de procedimiento; su ventana de 16K cubre hojas de especificaciones, no expedientes completos de permisos.
- Primera etapa de una cascada de inferencia: PELLET atiende el grueso de consultas triviales en el dispositivo y deriva a LOG-13B o SLURRY los casos que superan los cuatro o cinco pasos de razonamiento, reduciendo coste y latencia en el caso comun.
- Clasificacion de documentos en el borde: etiquetado de documentos tecnicos cortos en un gateway o dispositivo empotrado, aprovechando que la cuantizacion Q4_K_M mantiene calidad casi intacta en clasificacion.
- Ajuste fino de tarea estrecha en una sola GPU de consumo: al ser un modelo de 1,3B, permite reentrenar dos veces sobre el mismo hardware para adaptarlo a un dominio vertical concreto, con un coste de calculo bajo.
- Borrador de texto estructurado con revision humana: generacion de resumenes o partes de trabajo breves que un tecnico revisa antes de enviarlos, dado el riesgo de alucinacion documentado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model-index de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| MMLU (5-shot) | Accuracy | 31,2 |
| HellaSwag (10-shot) | Accuracy (normalized) | 62,4 |

Datos adicionales aportados por el autor en la model card: la tasa de afirmaciones alucinadas medida en BOGUS sube del 8,4% en el docente (LOG-13B) al 12,1% en el alumno (PELLET-1.3B). En cuantizacion Q4_K_M el modelo retiene el 97% de la calidad bf16 en clasificacion y extraccion, y el 89% en trabajo numerico multi-paso.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,6 GB solo para pesos (1,32B parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica, del orden de 3–4 GB.
- VRAM estimada en Q4_K_M: aproximadamente 0,8 GB de pesos, con un consumo total tipico por debajo de 2 GB, lo que permite ejecucion en CPU.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM en bf16; en cuantizacion Q4 puede ejecutarse integramente en CPU. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas de gama media y baja con 4 GB o mas en bf16, y en cuantizacion Q4 tambien en dispositivos tipo Raspberry Pi o portatiles modestos.
- Opciones de despliegue: transformers (formato nativo safetensors), llama.cpp y derivados para GGUF, Ollama mediante GGUF, y formatos AWQ/GPTQ/MLX para sus runtimes respectivos. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PELLET-1.3B | 1,32B | 16.384 | Apache 2.0 | Destilado de LOG-13B; solo ingles; formatos GGUF/AWQ/GPTQ/MLX |
| LOG-13B (docente) | 13B (no confirmado en la informacion) | no disponible | no disponible | Modelo docente de la misma familia; mayor capacidad y menor tasa de alucinacion (8,4% vs 12,1% en BOGUS) |
| SLURRY | no disponible | no disponible | no disponible | Tercer miembro de la familia Effluent Series, citado como modelo de escalado en cascadas |

## Limitaciones y advertencias

- La destilacion amplifica la confianza: PELLET imita el tono de autoridad del docente sin su profundidad de conocimiento, y la tasa de afirmaciones alucinadas sube del 8,4% al 12,1% en BOGUS.
- Prohibido su uso en control de procesos, dosificacion o informes de cumplimiento normativo; no debe emplearse como unica verificacion de una medicion.
- El contexto practico es de unos 11.000 tokens, inferior a la ventana nominal de 16.384; el rendimiento en recuperacion decae mas rapido de lo que sugiere el tamano de ventana.
- La cuantizacion Q2_K degrada la calidad de forma peligrosa: produce numeros incorrectos con apariencia fluida. Q4_K_M es el minimo soportado por el autor.
- El modelo solo soporta ingles; no se documentan capacidades multilingues.
- Razonamiento multi-paso limitado a cuatro o cinco pasos; la escritura creativa abierta y cualquier tarea que requiera conocimiento factual actualizado quedan fuera de alcance.
- El 20% de los parametros esta en una matriz de embeddings heredada del docente, con cerca del 40% del vocabulario inutilizable en la practica.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explicitamente el despliegue en instrumentacion de campo sin supervision por el riesgo de fallo silencioso.
- El checkpoint base esta pensado para pipelines de destilacion y cabezas de clasificacion; para chat debe usarse la variante PELLET-1.3B-Instruct.
- No se han publicado datos de latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prasta1/PELLET-1.3B
- Modelo docente: https://huggingface.co/prasta1/LOG-13B
- Repositorio GitHub: https://github.com/prasta1/effluent-series
- Paper: https://arxiv.org/abs/2604.01188
- Coleccion de la familia Effluent Series: https://huggingface.co/collections/prasta1/the-effluent-series
- Dataset de destilacion: https://huggingface.co/datasets/prasta1/effluent-distill-60b
