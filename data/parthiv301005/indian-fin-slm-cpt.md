# parthiv301005/indian-fin-slm-cpt

## Resumen

indian-fin-slm-cpt es un adaptador LoRA publicado por el usuario parthiv301005 sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El nombre sugiere un ajuste orientado a continuar el preentrenamiento (CPT, continued pre-training) con corpus financiero de la India, aunque la model card no documenta ni el dataset ni el procedimiento concreto. Se distribuye como repositorio PEFT de aproximadamente 1,0 GB, con licencia Apache 2.0 heredada del modelo base.

El modelo no es un modelo completo, sino un adaptador que requiere cargar Qwen2.5-7B-Instruct y aplicar los pesos LoRA por encima. Esta circunstancia es relevante para cualquier evaluacion: las capacidades reales del sistema final dependen en gran medida del modelo base, mientras que el adaptador solo aporta el sesgo de dominio aprendido durante una unica epoca de entrenamiento.

Por ahora el repositorio no presenta descargas ni likes, no incluye resultados de benchmarks y la model card esta generada automaticamente por el Trainer con secciones sin completar. La perdida de validacion final registrada es 2,2116, un valor que por si solo no permite inferir calidad downstream. Es, por tanto, un artefacto experimental mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; admite combinarse con cuantizaciones del modelo base, como 4 bits o 8 bits, sin documentacion oficial) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors o GGUF para despliegue |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parametros con atencion por causalidad estandar, RoPE y ventana de contexto nativa de hasta 131.072 tokens. El adaptador LoRA modifica un subconjunto de matrices lineales del modelo base; la model card no especifica rango, alpha, modulos objetivo ni el numero de parametros entrenables.

Los hiperparametros documentados son: tasa de aprendizaje 1e-4, batch efectivo de 64 (batch de 1 con acumulacion de 32 pasos en 2 GPUs), una sola epoca, optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con 2 pasos de calentamiento y precision mixta nativa. El entrenamiento consta de 87 pasos en total. La perdida de entrenamiento pasa de 2,2123 en el paso 50 a 2,1815 en el paso 87, mientras que la perdida de validacion baja de 2,2188 a 2,2116. No se documenta la composicion del dataset, el numero de tokens, el uso de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto en el dominio financiero indio, presumiblemente tras el ajuste por continued pre-training, aunque no hay evaluacion que lo confirme.
- Razonamiento y generacion de codigo heredados del modelo base Qwen2.5-7B-Instruct.
- Capacidad matematica basica heredada del modelo base.
- Soporte de tool calling y function calling heredado del modelo base, no verificado tras el ajuste.
- Capacidades multilingues heredadas del modelo base (Qwen2.5 cubre decenas de idiomas, con especial enfasis en ingles y chino), sin confirmacion de que el adaptador las preserve.
- No se documenta soporte de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Analisis de estados financieros de empresas cotizadas en la India: el adaptador podria emplearse para resumir y comparar informes anuales en ingles, apoyandose en la ventana de contexto larga del modelo base para procesar documentos extensos, si bien no hay evidencia publicada de mejora frente al modelo original.
- Extraccion de entidades financieras (empresas, cifras, periodos) en textos regulatorios indios, como los comunicados de SEBI o RBI, integrando el adaptador en un pipeline de procesamiento por lotes.
- Generacion de resumenes de noticias economicas del subcontinente para boletines internos, con verificacion humana obligatoria por el riesgo de alucinacion.
- Prototipado de asistentes conversacionales para consultas sobre instrumentos financieros indios (acciones, fondos, bonos), aprovechando el formato instruct del modelo base.
- Investigacion academica sobre adaptacion de dominio en modelos de lenguaje: el repositorio sirve como ejemplo reproducible de CPT con LoRA sobre Qwen2.5-7B-Instruct, con hiperparametros documentados.
- Evaluacion comparativa de adaptadores financieros: util para medir si un ajuste LoRA ligero aporta mejoras medibles frente al modelo base en tareas de comprension financiera.
- Base para un ajuste posterior (SFT o DPO) sobre datos financieros indios etiquetados, dado que el adaptador ya incorpora vocabulario y estilo del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion es la perdida de validacion final de 2,2116, sin comparativa con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM para inferencia del modelo base en precision completa (fp16/bf16): aproximadamente 15-16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM con cuantizacion de 4 bits del modelo base: en torno a 5-6 GB de pesos, lo que permite ejecucion en GPUs consumer de 8-12 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizacion 4/8 bits.
- Cabe en GPU consumer: si, con cuantizacion 4 bits en tarjetas de 8 GB o mas; en fp16 requiere al menos 24 GB.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indian-fin-slm-cpt | Adaptador sobre 7,6 B | No documentado (base: 131.072) | LoRA/PEFT | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 131.072 | Modelo completo | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos financieros abiertos de 7 B (por ejemplo, adaptadores sobre Llama o Mistral) | 7-8 B | Variable | LoRA o completo | Variable (a menudo con restricciones) | Hugging Face |

La comparativa directa con alternativas financieras concretas no esta disponible en la informacion proporcionada. Frente al modelo base, el adaptador anade un sesgo de dominio no cuantificado; frente a otros adaptadores financieros, no hay datos que permitan establecer una jerarquia de rendimiento.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta dataset, composicion, numero de tokens ni proceso de curacion; la trazabilidad del entrenamiento es nula.
- No hay benchmarks ni evaluacion cualitativa publicada; la perdida de validacion de 2,2116 no es interpretable sin referencia.
- Entrenamiento de una sola epoca y 87 pasos: el ajuste es muy ligero y podria no producir cambios sustanciales respecto al modelo base.
- Riesgo de alucinacion elevado en un dominio donde los datos deben ser exactos (cifras, fechas, normativa); se requiere verificacion humana en cualquier uso productivo.
- Idiomas soportados no declarados; el comportamiento en idiomas distintos del ingles no esta verificado.
- Sesgos desconocidos: no se documenta la procedencia de los datos, por lo que no se pueden evaluar sesgos geograficos, sectoriales o de representacion.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador hereda las condiciones del modelo base Qwen2.5-7B-Instruct, que tambien es Apache 2.0; conviene revisar ambas.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validacion externa.
- Para desplegar en llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir los pesos; el repositorio no incluye versiones GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/parthiv301005/indian-fin-slm-cpt
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
