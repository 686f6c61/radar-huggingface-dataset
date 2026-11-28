# kjarni-ai/Llama-3.2-1B-Instruct

## Resumen

`kjarni-ai/Llama-3.2-1B-Instruct` es un espejo (mirror) sin modificaciones de `meta-llama/Llama-3.2-1B-Instruct`, el modelo de lenguaje de 1.235.814.400 parametros publicado por Meta en septiembre de 2024 y ajustado para dialogo. Lo desarrolla el usuario kjarni-ai como hospedaje para el runtime nativo Kjarni, de modo que el modelo pueda descargarse y ejecutarse localmente sin cuenta de Hugging Face ni token de acceso.

El modelo resuelve el caso de uso de inferencia de chat de baja latencia en hardware modesto: con unos 2,5 GB de pesos, esta pensado para portatiles con CPU y para entornos donde no se quiere desplegar un servidor Python ni depender de la nube. La arquitectura es un transformer decoder-only denso de la familia Llama 3.2, con una ventana de contexto de hasta 128.000 tokens y soporte oficial de ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes).

La relevancia actual es practica: el repositorio no aporta pesos nuevos ni fine-tuning, sino una distribucion limpia en safetensors integrada con un runtime que ofrece enlaces nativos desde Python, Rust, C#, C++ y linea de comandos, ademas de un modo cuantizado a 4 bits procedente de `bartowski/Llama-3.2-1B-Instruct-GGUF`. Para quien evalua modelos, conviene tratarlo como el Llama 3.2 1B Instruct original, con la salvedad de que la model card de Meta ha sido sustituida por una propia y de que falta la carpeta `original/` con el checkpoint PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 4 bits (GGUF, via `bartowski/Llama-3.2-1B-Instruct-GGUF`); pesos originales en safetensors sin cuantizar |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License (uso sujeto a la Acceptable Use Policy de Meta) |
| Formato de pesos | safetensors (repo de 2,5 GB); GGUF para el modo cuantizado |
| Libreria de inferencia | kjarni (runtime nativo, sin Python) |
| Revision del modelo base | `9213176726f574b556790deb65791e0c5aa438b6` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 1,24 mil millones de parametros, identico byte a byte al checkpoint de Meta en la revision indicada. No hay cambios en pesos, tokenizador ni configuracion: el repositorio solo reemplaza la model card de Meta por una propia y anade un fichero `NOTICE`, omitiendo la carpeta `original/` con el checkpoint PyTorch porque los safetensors contienen el mismo modelo.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF/DPO y evaluaciones de seguridad) no se recogen en la informacion disponible de este repositorio; la model card remite explicitamente a la ficha de Meta para esos datos. La innovacion destacable no esta en el modelo sino en la distribucion: integracion con un runtime nativo multiplataforma que evita el stack Python y permite ejecucion en CPU con pesos de 4 bits para acelerar la generacion.

## Capacidades

- Generacion de texto conversacional y respuestas cortas en modo chat.
- Reescritura y reformulacion de texto.
- Razonamiento basico y respuesta a preguntas generales.
- Capacidades multilingues en los ocho idiomas soportados oficialmente (en, de, fr, it, pt, hi, es, th).
- Ejecucion local sin cuenta ni token de Hugging Face.
- Modo GPU opcional (`--gpu` o `device="gpu"`) y modo cuantizado a 4 bits (`--gguf` o `quantized=True`).
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.
- Vision y audio: no disponible (modelo exclusivamente de texto).

## Casos de uso

- Asistente de chat en portatil: con 2,5 GB de pesos y modo 4 bits, el modelo se ejecuta en CPU de portatil para conversaciones de turno corto sin conexion, usando la CLI `kjarni chat -m llama3.2-1b-instruct`.
- Reescritura y edicion de texto: adecuado para tareas de reformulacion de parrafos, resumenes breves y correccion de estilo donde no se requiere razonamiento profundo.
- Respuesta a preguntas sobre documentacion tecnica: la ventana de 128.000 tokens permite inyectar manuales o ficheros de referencia extensos en el contexto, aunque la calidad decae en contextos muy largos con solo 1,24 B de parametros.
- Prototipado rapido de aplicaciones: los enlaces nativos en Python, Rust, C#, C++ y CLI permiten integrar el modelo en demos y pruebas de concepto sin levantar un servidor de inferencia.
- Generacion en entornos con restricciones de red: al poder descargarse y ejecutarse localmente sin token, encaja en entornos air-gapped o con politicas estrictas de datos.
- Preprocesamiento en pipelines: tareas de clasificacion ligera, extraccion de entidades simples o generacion de borradores previos a un modelo mayor, aprovechando la baja latencia en CPU.
- Educacion y experimentacion: modelo de referencia para estudiar el comportamiento de la familia Llama 3.2 en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: unos 2,5 GB para pesos en safetensors sin cuantizar; una fraccion de esa cifra en 4 bits (GGUF).
- Cabe en CPU de portatil, que es el escenario objetivo declarado por el autor.
- GPU: el runtime soporta modo GPU (`--gpu` o `device="gpu"`), pero no se especifican modelos de GPU recomendados (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano, aunque no se confirma en la documentacion.
- Opciones de despliegue: runtime Kjarni 0.8.3 o superior (CLI, Python, Rust, C#, C++); pesos GGUF de bartowski para 4 bits. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no se publican cifras concretas; el autor afirma que es "rapido incluso en CPU de portatil" y que el modo 4 bits "genera mas rapido en CPU", sin numeros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kjarni-ai/Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community | Hugging Face (espejo) | Identico a Meta; runtime Kjarni |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community | Hugging Face (oficial) | Requiere aceptar terminos y token |
| bartowski/Llama-3.2-1B-Instruct-GGUF | 1,24 B | 128.000 | Llama 3.2 Community | Hugging Face | Cuantizaciones GGUF para llama.cpp |
| Modelos de ~1-3 B de otras familias | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Con 1,24 mil millones de parametros, la capacidad de razonamiento, matematicas y codigo es limitada en comparacion con modelos de mayor tamano; no es adecuado para tareas complejas de agente o multi-step reasoning.
- Riesgo de alucinacion inherente a modelos pequenos, especialmente en contextos largos o preguntas factuales.
- La ventana de 128.000 tokens es teorica; el rendimiento efectivo en contextos muy extensos con este tamano de modelo no esta documentado.
- Idiomas oficiales limitados a ocho; el resto de lenguas puede degradarse notablemente.
- Licencia Llama 3.2 Community License: el uso comercial esta permitido con condiciones (incluida la politica de uso aceptable de Meta y obligaciones de atribucion); conviene revisar `LICENSE.txt` y `USE_POLICY.md` antes de desplegar en produccion.
- El repositorio no esta afiliado ni respaldado por Meta; la model card original ha sido sustituida, por lo que los datos de entrenamiento y evaluaciones de seguridad deben consultarse en la ficha oficial.
- El repo omite la carpeta `original/` con el checkpoint PyTorch; quien necesite ese formato debe acudir al repositorio de Meta.
- Sin descargas ni likes registrados en el momento de la consulta; soporte de la comunidad no disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kjarni-ai/Llama-3.2-1B-Instruct
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Pesos GGUF de 4 bits: https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF
- Runtime Kjarni: https://kjarni.ai
- Script de instalacion: https://kjarni.ai/install.sh
- Script de instalacion Windows: https://kjarni.ai/install.ps1
