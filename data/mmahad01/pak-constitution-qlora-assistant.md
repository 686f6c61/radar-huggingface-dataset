# MMahad01/pak-constitution-qlora-assistant

## Resumen

Pak Constitution QLoRA Assistant es un adaptador PEFT (LoRA) de tipo QLoRA entrenado sobre el modelo base unsloth/llama-3-8b-Instruct-bnb-4bit, que a su vez deriva de Llama-3-8B-Instruct de Meta. Lo desarrolla Muhammad Mahad (MMahad01) como proyecto academico de fin de carrera, con financiacion propia, y su objetivo es asistir en la consulta, recuperacion y explicacion de articulos, capitulos y provisiones de la Constitucion de la Republica Islamica de Pakistan. El modelo no es un modelo completo, sino un adaptador ligero de unos 27 MB que modifica el comportamiento del modelo base de 8.000 millones de parametros.

La relevancia de este adaptador reside en su caracter de ejemplo de especializacion legal mediante QLoRA: demuestra que es posible ajustar un modelo de 8B en una unica GPU T4 de la capa gratuita de Google Colab, con una sesion de aproximadamente 0,5 horas, empleando cuantizacion de 4 bits (NF4) y modulos LoRA sobre las proyecciones de atencion. El modelo esta pensado como componente de pipelines de generacion aumentada por recuperacion (RAG) para contexto legal pakistani, como el proyecto Pak Justice AI Assistant.

Sus limitaciones son notables: el entrenamiento se realizo con una longitud maxima de secuencia de 128 tokens, una sola epoca y un unico dataset consistente en el texto estatutario de la Constitucion, y el autor lo declara explicitamente inadecuado como sustituto del asesoramiento legal formal. Se publica bajo licencia apache-2.0 y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3-8B-Instruct) con adaptador PEFT LoRA y cuantizacion bitsandbytes de 4 bits |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA pesa ~27 MB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; el modelo base Llama-3-8B-Instruct soporta 8.192 tokens. El entrenamiento se realizo con longitud maxima de secuencia de 128 tokens |
| Tipos de cuantizacion | Base en 4 bits NormalFloat (NF4) con precision mixta bf16; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en formato bitsandbytes de 4 bits |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer causal decoder-only de 8.000 millones de parametros (Llama-3-8B-Instruct). Sobre el se aplica un ajuste fino parametro-eficiente mediante QLoRA: el modelo base se carga cuantizado a 4 bits en formato NormalFloat (NF4) con precision mixta bf16, y unicamente se entrenan matrices de bajo rango insertadas en las proyecciones de atencion q_proj, k_proj, v_proj y o_proj. Los hiperparametros declarados son rango LoRA r=8, alpha=16, tamano de lote por dispositivo 1, 8 pasos de acumulacion de gradiente, tasa de aprendizaje 2e-4, una sola epoca y longitud maxima de secuencia de 128.

Los datos de entrenamiento proceden exclusivamente del texto oficial de la Constitucion de la Republica Islamica de Pakistan, extraido de un PDF con pypdf, segmentado por encabezados de articulo, limpiado de artefactos de formato y convertido en muestras de instruction tuning. No se menciona el uso de RLHF, DPO ni otra fase de alineacion adicional; el ajuste es puramente supervisado sobre el corpus legal. El entrenamiento se completo en una GPU NVIDIA T4 (15 GB de VRAM) de la capa gratuita de Google Colab en aproximadamente 0,5 horas, con Python, PyTorch, transformers, peft, trl, bitsandbytes y accelerate. La perdida de entropia cruzada descendio de 2,086 a 1,620 durante el entrenamiento, segun la model card.

## Capacidades

- Generacion de texto en ingles orientada a lenguaje legal y estatutario pakistani.
- Respuesta a consultas sobre articulos, capitulos y provisiones de la Constitucion de Pakistan.
- Explicacion de provisiones legales empleando terminologia oficial (por ejemplo, Majlis-e-Shoora, Federal Legislative List).
- Recuperacion y referencia de contenido constitucional dentro de flujos RAG.
- Integracion como componente de pipelines mayores, como el proyecto Pak Justice AI Assistant.
- Ajuste de comportamiento sobre el modelo base Llama-3-8B-Instruct, heredando sus capacidades generales de generacion conversacional.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: solo ingles declarado; no se documenta soporte de urdu ni de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el modelo base no incluye vision ni audio.

## Casos de uso

- Asistencia a estudiantes de derecho: el adaptador puede explicar el articulado constitucional y aclarar conceptos como derechos fundamentales o estructura del parlamento, sirviendo como apoyo de estudio sobre el texto oficial.
- Investigacion juridica preliminar: permite formular consultas sobre provisiones concretas de la Constitucion y obtener respuestas redactadas con terminologia estatutaria, agilizando la localizacion inicial de articulos relevantes.
- Componente de RAG legal: integrado en un pipeline que recupere pasajes oficiales de la Constitucion y use el adaptador para sintetizar la respuesta con el contexto recuperado, como en el proyecto Pak Justice AI Assistant.
- Apoyo a profesionales legales: puede generar borradores explicativos o resumenes de secciones constitucionales que despues se verifican contra la copia oficial, reduciendo el trabajo de lectura inicial.
- Educacion civica y divulgacion: util para producir material explicativo sobre la estructura del Estado, los poderes publicos y los derechos reconocidos en la Constitucion para audiencias no expertas.
- Prototipado academico de IA legal: sirve como caso de referencia reproducible de ajuste QLoRA de un modelo de 8B en hardware de consumo o en la capa gratuita de Colab, util para investigacion sobre adaptacion de dominio.
- Generacion de codigo en produccion: no aplica; el modelo esta especializado en texto legal y no se documenta soporte de tool calling ni de integracion en CI/CD.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Solo se reportan metricas de entrenamiento y una evaluacion cualitativa sobre un conjunto propio de 10 articulos constitucionales clave (derechos fundamentales, judicatura y parlamento). Los datos disponibles son:

| Metrica | Valor |
|---|---|
| Perdida de entropia cruzada (inicial) | 2,086 |
| Perdida de entropia cruzada (final) | 1,620 |
| Perplejidad | Seguimiento mediante decaimiento exponencial; valor numerico no disponible |
| Benchmark estandar (MMLU, HumanEval, GSM8K, etc.) | No disponible |
| Evaluacion cualitativa | Conjunto propio de 10 articulos; confirma convergencia y manejo de terminologia constitucional |

No se han publicado resultados de benchmarks comparativos estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B en 4 bits requiere aproximadamente 5-6 GB de VRAM para los pesos, mas overhead de contexto y activaciones; con el adaptador LoRA los requisitos adicionales son minimos (adaptador de ~27 MB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en 4 bits; el entrenamiento se realizo en una NVIDIA T4 de 15 GB. Para mayor velocidad y precision, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 ofrecen margen sobrado.
- Compatibilidad con GPU de consumo: si, el modelo cuantizado a 4 bits cabe en tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores; en GPUs de 8 GB puede requerir ajustes de contexto.
- Opciones de despliegue: transformers + peft (ruta oficial documentada), vLLM, TGI y Ollama o llama.cpp tras fusionar el adaptador con el modelo base y convertir a GGUF. La model card solo documenta el uso con transformers y peft.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Tiempo de entrenamiento declarado: aproximadamente 0,5 horas en una T4 de Google Colab.
- Impacto ambiental: instancia cloud de baja potencia, emisiones minimas segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pak Constitution QLoRA Assistant | 8B (adaptador LoRA sobre base de 8B) | Base de 8.192 tokens; entrenamiento con 128 tokens | Adaptador PEFT especializado en la Constitucion de Pakistan | apache-2.0 | HuggingFace, 0 descargas |
| unsloth/llama-3-8b-Instruct-bnb-4bit (modelo base) | 8B | 8.192 tokens | Modelo completo instructivo, uso general | Licencia de Llama 3 | HuggingFace |
| Llama-3-8B-Instruct (Meta) | 8B | 8.192 tokens | Modelo completo instructivo, uso general | Licencia comunitaria de Llama 3 | HuggingFace, ampliamente distribuido |
| Otros adaptadores LoRA legales de 8B | No disponible | No disponible | Adaptadores de dominio legal | Variable | No disponible |

La comparativa directa con adaptadores legales equivalentes no esta disponible en la informacion proporcionada. La diferencia fundamental respecto al modelo base es la especializacion en terminologia y contenido constitucional pakistani, a costa de un ajuste limitado (una sola epoca, secuencia de 128 tokens).

## Limitaciones y advertencias

- Riesgo de alucinacion: el autor advierte que las salidas generativas pueden requerir verificacion contra los documentos legales oficiales, ya que el modelo puede producir contenido no fiel al texto estatutario.
- Ambito restringido: entrenado estrictamente sobre el texto de la Constitucion de Pakistan; fuera de ese dominio su comportamiento se reduce al del modelo base.
- Longitud de contexto efectiva limitada en entrenamiento: la secuencia maxima de 128 tokens implica que el ajuste no se realizo sobre contextos largos, lo que puede degradar la coherencia en entradas extensas aunque el modelo base soporte 8.192 tokens.
- Sesgos: no se documentan analisis de sesgo especificos; al derivar de Llama-3-8B-Instruct puede heredar sesgos del modelo base.
- Limitaciones de idioma: solo se declara soporte de ingles; no hay soporte documentado de urdu ni de otros idiomas, lo que limita su uso en el contexto linguistico local.
- Restricciones de licencia: el adaptador se publica bajo apache-2.0, pero el modelo base Llama-3-8B-Instruct esta sujeto a la licencia comunitaria de Llama 3, cuyos terminos deben respetarse para uso comercial.
- No apto como asesoramiento legal: el autor indica explicitamente que no debe usarse como sustituto del consejo legal formal, la redaccion de litigios ni el asesoramiento judicial profesional.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 "me gusta", y no dispone de paper asociado ni de validacion independiente.
- Evaluacion limitada: la unica evaluacion es un conjunto propio de 10 articulos, sin pruebas estandar reproducibles.

## Enlaces

- HuggingFace: https://huggingface.co/MMahad01/pak-constitution-qlora-assistant
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Repositorio (segun model card): https://huggingface.co/MMahad01/pak-constitution-qlora-assistant
- Demo: desplegada en Hugging Face Spaces (URL no especificada en la informacion disponible)
- Paper: no disponible (la model card indica N/A)
