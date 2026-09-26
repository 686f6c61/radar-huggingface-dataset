# parmanu-lcs2/Qwen3-5B

## Resumen

Qwen3-5B es un modelo de generacion de texto en castellano derivado de Qwen/Qwen3-8B, publicado por el usuario parmanu-lcs2 en HuggingFace. No se trata de un entrenamiento desde cero ni de un modelo oficial de la familia Qwen, sino de una version podada (pruned) del Qwen3-8B original mediante el metodo SNIPER, con un ratio de compresion objetivo del 35%. El resultado son 5.406.974.208 parametros reales, verificado en los ficheros safetensors del repositorio, frente a los aproximadamente 8.000 millones del modelo base.

El problema que resuelve es el de reducir el coste de inferencia y el espacio en VRAM de un modelo de 8B manteniendo, en la medida de lo posible, sus capacidades conversacionales. Para recuperar el rendimiento perdido por la poda, el autor aplico un fine-tuning de recuperacion con LoRA sobre 2.000 muestras del dataset SlimOrca, con los adaptadores ya fusionados en los pesos finales. Todo el proceso se ejecuto en una unica GPU NVIDIA A100.

Su relevancia es fundamentalmente experimental: demuestra un pipeline completo de compresion estructural mas recuperacion, y sirve como caso de estudio de poda de LLM. Conviene tener presente que no se han publicado benchmarks, no hay versiones cuantizadas oficiales, el repositorio acumula 0 descargas y la arquitectura podada obliga a usar codigo personalizado (`modeling_pruned.py`) con `trust_remote_code=True`, lo que limita su integracion directa en servidores de inferencia estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3, con capas y bloques de atencion/MLP eliminados por poda estructural (SNIPER); requiere `modeling_pruned.py` |
| Parametros totales | 5.406.974.208 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No se especifica en la model card; el fine-tuning de recuperacion se hizo con contexto de 1024 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en precision completa (repo de 10,8 GB); no hay GGUF, GPTQ ni AWQ oficiales |
| Idiomas soportados | No disponible. El dataset de recuperacion (SlimOrca) es mayoritariamente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`; es necesario `trust_remote_code=True`) |

Otros datos: modelo base Qwen/Qwen3-8B, dataset de calibracion slim_orca (50 muestras x 512 tokens), 2 likes, creado el 25 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3-8B, un transformer decoder-only con atencion completa, normalizacion RMSNorm y capas MLP con proyecciones gate/up/down. El autor aplica SNIPER, un metodo de poda estructurada que elimina bloques de atencion y MLP completos y deja capas con formas tensoriales distintas entre si. Esa irregularidad estructural es la razon de que el modelo necesite una implementacion propia incluida en el repositorio (`modeling_pruned.py`) y de que no pueda cargarse con clases de transformers estandar sin `trust_remote_code=True`.

El proceso tiene dos fases. Primero, la poda con un ratio de compresion objetivo del 35%, calibrada con solo 50 muestras de 512 tokens del dataset slim_orca, lo que da 5.406.974.208 parametros finales. Segundo, un fine-tuning de recuperacion con LoRA sobre 2.000 muestras de Open-Orca/SlimOrca, durante 1 epoca, con contexto de 1024 tokens, learning rate 0,0002, rango LoRA 64, alpha 16 y modulos objetivo `up_proj`, `gate_proj`, `down_proj`, `q_proj`, `o_proj`, `k_proj` y `v_proj`. Los adaptadores se fusionaron en los pesos base, por lo que el repositorio solo contiene un unico conjunto de pesos. Todo el pipeline se ejecuto en una NVIDIA A100. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional: el fine-tuning sobre SlimOrca, un dataset de instrucciones y dialogos, orienta el modelo a formatos de pregunta-respuesta.
- Razonamiento e instrucciones generales: hereda las capacidades del Qwen3-8B original en la medida en que la poda y la recuperacion las preserven, algo que el autor no cuantifica.
- Capacidad multilingue: no confirmada. El dataset de recuperacion es predominantemente ingles, por lo que el comportamiento en castellano u otros idiomas no esta verificado.
- Tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Modo thinking: no disponible; no se menciona en la model card.
- Vision o audio: no soportado; es un modelo exclusivamente de texto.
- Ejecucion local: al tener 5,4 B de parametros, es viable en GPUs de consumo con cuantizacion, aunque no se publican cuantizaciones oficiales.

## Casos de uso

- Investigacion sobre poda de LLM: el modelo es un caso reproducible de pipeline SNIPER mas LoRA de recuperacion, util para estudiar la degradacion real que introduce un 35% de compresion en un Qwen3-8B.
- Experimentacion academica con presupuesto de VRAM limitado: permite trabajar con una arquitectura derivada de Qwen3 en GPUs donde un 8B en precision completa no cabe comodamente.
- Generacion de texto asistida en local: tareas de redaccion, resumen o reformulacion en un unico turno o conversaciones cortas, aprovechando que el fine-tuning de recuperacion uso contexto de 1024 tokens.
- Prototipado rapido de asistentes conversacionales: sirve para validar interfaces y prompts antes de migrar a un modelo con benchmarks y soporte de servidores de inferencia.
- Clasificacion y etiquetado de texto por generacion: tareas de extraccion de informacion o categorizacion con salida textual, siempre que se validen los resultados por la ausencia de benchmarks.
- Estudio comparativo de tecnicas de compresion: comparar SNIPER frente a otras podas o destilaciones sobre el mismo modelo base.
- Fine-tuning posterior ligero: al ser un modelo de 5,4 B con licencia Apache 2.0, puede servir como punto de partida para ajustes con LoRA en dominios concretos, con el coste menor que un 8B.
- No se recomienda como caso de uso la atencion al cliente en produccion con contexto largo: la ventana efectiva no esta documentada y solo se verifico recuperacion a 1024 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni antes ni despues de la poda, por lo que no es posible cuantificar la degradacion respecto a Qwen/Qwen3-8B.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): en torno a 11-12 GB solo para pesos, mas overhead de activaciones y cache KV; el repositorio ocupa 10,8 GB.
- VRAM estimada en int8: aproximadamente 5,5-6 GB de pesos.
- VRAM estimada en int4: aproximadamente 3-4 GB de pesos, aunque no hay cuantizaciones oficiales publicadas y habria que generarlas.
- GPUs recomendadas para precision completa: A100 40 GB, A100 80 GB, H100, RTX 4090 24 GB, RTX 3090 24 GB.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion de 4 bits generada por el usuario, potencialmente en RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada por el autor y la unica garantizada, porque la arquitectura podada vive en `modeling_pruned.py`. Los tags del repositorio mencionan text-generation-inference y endpoints_compatible, pero no hay evidencia en la informacion proporcionada de que vLLM, TGI, llama.cpp u Ollama soporten esta arquitectura no estandar sin adaptaciones.
- Latencia y throughput: no disponibles. Sin benchmarks ni pruebas de servidor publicadas no es posible estimar tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| parmanu-lcs2/Qwen3-5B | 5.406.974.208 (confirmado) | No especificado | Apache 2.0 | No disponible | Repositorio HuggingFace, 0 descargas, requiere codigo custom |
| Qwen/Qwen3-8B (modelo base) | Aproximadamente 8.000 millones, dato no confirmado en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 | No disponible en la informacion proporcionada | Modelo oficial de Qwen, ampliamente distribuido |
| Qwen/Qwen3-4B | Aproximadamente 4.000 millones, dato no confirmado en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 | No disponible en la informacion proporcionada | Modelo oficial de Qwen |
| Otras podas de Qwen3-8B publicadas en HuggingFace | No disponible | No disponible | Variable | No disponible | No disponible |

La comparativa cuantitativa no es posible con los datos aportados: ni la model card de este modelo ni la informacion proporcionada incluyen metricas de los alternativas. La diferencia objetiva y verificable es el numero de parametros (5,4 B frente a los aproximadamente 8 B del base) y el hecho de que este modelo exige codigo personalizado, mientras que los modelos oficiales de Qwen funcionan con clases estandar de transformers.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna medicion que permita saber cuanto rendimiento se ha perdido con la poda del 35% ni comparar con el Qwen3-8B original.
- Poda agresiva con calibracion minima: solo 50 muestras de 512 tokens para calibrar SNIPER, una cantidad muy reducida que puede afectar a la fidelidad de la seleccion de bloques a eliminar.
- Recuperacion limitada: 2.000 muestras, 1 epoca y contexto de 1024 tokens es un ajuste muy corto; es probable que no restaure completamente las capacidades del modelo original, especialmente en razonamiento y codigo.
- Contexto no documentado: aunque el fine-tuning se hizo a 1024 tokens, no se especifica la ventana efectiva del modelo final. Usarlo con contextos largos es arriesgado y no esta validado.
- Sesgo de idioma: SlimOrca es mayoritariamente en ingles. El rendimiento en castellano no esta verificado y podria haberse degradado respecto al Qwen3-8B original, que si es multilingue.
- Riesgo de alucinacion: no se documenta ningun proceso de alineacion adicional (RLHF, DPO) en la fase de recuperacion, por lo que persisten los riesgos habituales de generacion de contenido falso, agravados por la perdida de capacidad derivada de la poda.
- Licencia: Apache 2.0, lo que permite uso comercial y modificacion, pero el usuario debe verificar las condiciones del modelo base Qwen3-8B y del dataset SlimOrca si redistribuye derivados.
- Riesgo de seguridad en el codigo: es obligatorio `trust_remote_code=True`, lo que implica ejecutar `modeling_pruned.py` del repositorio. En entornos de produccion conviene auditar ese fichero antes de cargarlo.
- Compatibilidad limitada: la arquitectura no estandar con capas de formas distintas rompe la compatibilidad con herramientas habituales de despliegue y cuantizacion (vLLM, llama.cpp, Ollama, autoconvertidores a GGUF).
- Madurez del repositorio: 0 descargas, 2 likes y publicacion reciente; no hay comunidad que haya validado el modelo ni reportado problemas.
- Verificabilidad de la referencia: el identificador arXiv citado en los tags y en la model card (2608.12953) no ha podido contrastarse con informacion independiente en la busqueda realizada; conviene comprobarlo directamente antes de citarlo.
- Resultados de busqueda web no relevantes: las busquedas realizadas no devolvieron informacion tecnica sobre este modelo, solo contenido sin relacion alguna. No se ha incorporado nada de esas fuentes a esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parmanu-lcs2/Qwen3-5B
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper de SNIPER citado por el autor: https://arxiv.org/abs/2608.12953
- Dataset de recuperacion Open-Orca/SlimOrca: https://huggingface.co/datasets/Open-Orca/SlimOrca
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
