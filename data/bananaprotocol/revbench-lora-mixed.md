# bananaprotocol/revbench-lora-mixed

## Resumen

revbench-lora-mixed es un adaptador LoRA para el modelo base codellama/CodeLlama-7b-Instruct-hf, desarrollado por el autor bajo el identificador bananaprotocol (Hendrik Lohmar, Universidad de Heidelberg) como parte de su tesis de grado *Comparison of LoRA and Knowledge Editing for Improving Neural Decompilation* (enero de 2026). Su tarea es muy concreta: tomar pseudocodigo generado por el descompilador Ghidra y refinarlo hasta obtener codigo C valido y compilable, manteniendo el nombre y los argumentos originales de la funcion.

Se trata de la variante *mixed* del proyecto RevBench, entrenada con pares generales de descompilacion procedentes de ExeBench mas datos sinteticos especificos de errores. Segun la model card, es la configuracion con mejor correccion funcional de toda la tesis: un 28,08 % de Pass@1 sobre las 151 funciones C de HumanEval-Decompile, frente al 15,50 % del CodeLlama-7b-Instruct sin adaptar y al 23,95 % del adaptador general puro. El precio que paga es la tasa de compilacion, que baja al 64,50 % frente al 84,33 % del adaptador general.

El interes practico del modelo esta en que demuestra que un ajuste fino con LoRA de rango 64 sobre unos 4.000 ejemplos generales mas 1.200 sinteticos alcanza aproximadamente el 76 % del rendimiento de LLM4Decompile (36,71 % de Pass@1), que se obtuvo con ajuste fino completo de un modelo de 6,7B sobre miles de millones de tokens. No es un modelo de proposito general: es una herramienta de investigacion orientada a ingenieria inversa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (CodeLlama-7b-Instruct) |
| Parametros totales | 7B en el modelo base; el adaptador entrena aproximadamente el 2,3 % de los parametros (cifra no desglosada en la informacion disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens durante el entrenamiento del adaptador; no se especifica si se evaluo con ventanas mayores |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA); la model card muestra inferencia con `load_in_4bit=True`. No se publican otros formatos cuantizados |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 2 Community License (hereda la del modelo base; no es Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT LoRA; repositorio de 0,6 GB) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre CodeLlama-7b-Instruct, un transformer decoder-only de 7.000 millones de parametros especializado en codigo. El ajuste se hizo con QLoRA a 4 bits usando Unsloth, con rango r=64, alpha=64, dropout 0 y modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` (aproximadamente el 2,3 % de los parametros entrenados). La configuracion de entrenamiento fue de 3 epocas, tamano de lote efectivo 16, contexto de 2.048 tokens, tasa de aprendizaje 2e-4, AdamW de 8 bits y semilla 3407, sobre una unica NVIDIA A100 de 40 GB. El pipeline es SFT (supervised fine-tuning) con TRL; la informacion disponible no menciona RLHF ni DPO.

El conjunto de datos combina dos fuentes. Por un lado, 4.000 pares generales `(pseudocodigo Ghidra, codigo C original)` construidos a partir de ExeBench con `gcc -O2` y Ghidra en modo headless. Por otro, datos sinteticos generados por reglas que cubren aproximadamente el 30 % del conjunto de entrenamiento (unos 1.200 ejemplos): se parte de C limpio y se rompe deliberadamente de la forma en que lo rompe el modelo (`i < n` convertido en `i <= n`, operadores de comparacion invertidos, inicializaciones eliminadas), y se entrena el par corrupto → correcto. Ademas se mezclan y sobre-muestrean fallos reales extraidos de las ejecuciones de evaluacion. La innovacion metodologica del trabajo es precisamente esta mezcla: los datos orientados a errores mejoran la semantica (Pass@1) pero degradan la sintaxis (tasa de compilacion).

## Capacidades

- Traduccion de pseudocodigo Ghidra a codigo C valido y compilable para funciones individuales.
- Refinamiento de codigo con preservacion estricta del nombre de funcion y de sus argumentos.
- Generacion de codigo sin bloques Markdown ni texto introductorio cuando se usa la plantilla de prompt estricta del autor.
- Ajuste al estilo de descompilacion de Ghidra sobre objetos x86-64 compilados con `gcc -O2`.
- Capacidad multilingue limitada al ingles: el prompt y los datos de entrenamiento estan en ingles.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de modo de razonamiento explicito (*thinking mode*), vision ni audio.

## Casos de uso

- Refinamiento de pseudocodigo en flujos de ingenieria inversa: dado el volcado de Ghidra de una funcion, el adaptador devuelve una version en C que compila en cerca del 64,5 % de los casos, lo que reduce el trabajo manual de reconstruccion de la logica.
- Preprocesado para analisis de malware: al transformar pseudocodigo en C mas legible, facilita la revision posterior por parte de analistas y la aplicacion de herramientas de analisis estatico convencionales sobre el resultado.
- Generacion de parches sobre codigo fuente perdido: en tareas de mantenimiento de sistemas legacy sin fuentes, permite reconstruir funciones concretas como punto de partida para recompilar o reimplementar.
- Investigacion en descompilacion neuronal: sirve como linea base reproducible frente a la que comparar tecnicas de edicion de conocimiento, LoRA u otros adaptadores, ya que el autor publica los resultados de la tesis y el codigo en GitHub.
- Auditoria de binarios a escala: integrado en un pipeline que recorra los objetos de un binario, puede generar candidatos en C para revision humana, con la advertencia de que el 35,5 % de las salidas no compila y debe filtrarse automaticamente.
- Construccion de conjuntos de datos de descompilacion: los pares generados y los fallos detectados pueden reutilizarse para construir datos de entrenamiento especificos de errores, replicando la metodologia del autor.
- Docencia en compiladores y analisis de binarios: permite ilustrar la perdida de informacion inherente a la descompilacion comparando el pseudocodigo de Ghidra con la salida reconstruida.

## Benchmarks y rendimiento

Evaluacion sobre las 151 funciones C de HumanEval-Decompile. Una muestra se considera correcta solo si la funcion generada compila *y* pasa su arnes de pruebas original; no se emplean metricas de similitud de texto. La generacion usa muestreo con nucleus (temperatura 0,2, top-p 0,95), y los valores son la media de 5 ejecuciones con su desviacion estandar.

| Modelo | Pass@1 | Tasa de compilacion |
|---|---|---|
| CodeLlama-7b-Instruct (linea base) | 15,50 % ± 1,08 | 18,94 % ± 0,53 |
| LoRA dirigido (solo errores sinteticos) | 20,13 % ± 0,32 | 21,06 % ± 0,26 |
| LoRA general (`revbench-lora-r64-a64`) | 23,95 % ± 1,35 | 84,33 % ± 1,19 |
| Este adaptador (general + errores especificos) | 28,08 % ± 1,30 | 64,50 % ± 1,54 |

Como referencia externa citada en la model card, LLM4Decompile alcanza un 36,71 % de Pass@1 con ajuste fino completo de un modelo de 6,7B sobre miles de millones de tokens. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 7B: en torno a 4-5 GB de pesos en 4 bits (mas cache KV, tipicamente 6-8 GB en total); unos 8 GB de pesos en 8 bits; alrededor de 14 GB de pesos en FP16.
- GPU recomendadas: el autor entreno sobre una unica NVIDIA A100 de 40 GB. Para inferencia en FP16 son suficientes una A100, una H100 o una RTX 4090 de 24 GB.
- Cabe en GPU de consumo: si, en 4 bits o 8 bits en tarjetas con 8-12 GB o mas (por ejemplo RTX 3060 de 12 GB, RTX 4070, RTX 4090). En FP16 requiere al menos 16 GB, por lo que queda limitado a GPU de gama alta o a CPU con mucha RAM.
- Opciones de despliegue: la model card documenta `transformers` + `peft` con `load_in_4bit=True`. vLLM admite adaptadores LoRA sobre el modelo base. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF; ese procedimiento no esta documentado en la informacion disponible.
- Latencia y throughput estimados: no disponible. La configuracion de evaluacion genera hasta 512 tokens nuevos por funcion con temperatura 0,2 y top-p 0,95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass@1 | Tasa de compilacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| revbench-lora-mixed (este adaptador) | 7B base + LoRA r=64 (2,3 % entrenado) | 2.048 tokens en entrenamiento | 28,08 % | 64,50 % | Llama 2 Community License | HuggingFace, 0,6 GB |
| revbench-lora-r64-a64 (adaptador general) | 7B base + LoRA r=64 | 2.048 tokens en entrenamiento | 23,95 % | 84,33 % | Llama 2 Community License | HuggingFace |
| CodeLlama-7b-Instruct (linea base) | 7B | no disponible en la informacion proporcionada | 15,50 % | 18,94 % | Llama 2 Community License | HuggingFace |
| LLM4Decompile | 6,7B | no disponible en la informacion proporcionada | 36,71 % | no disponible | no disponible en la informacion proporcionada | GitHub / HuggingFace |

## Limitaciones y advertencias

- Entrenado y evaluado unicamente con funciones C individuales procedentes de objetos x86-64 generados con `gcc -O2` y descompilados con Ghidra. Otros descompiladores, otros niveles de optimizacion, otras arquitecturas o programas completos quedan fuera de distribucion.
- La tasa de compilacion (64,50 %) es muy inferior a la del adaptador general (84,33 %), de modo que una proporcion mayor de salidas no compila en absoluto.
- Alrededor del 72 % de las funciones de prueba siguen fallando. De los fallos consistentes analizados en la tesis, en torno al 55 % son *fundamentales* (reinterpretacion del algoritmo, perdida de informacion del descompilador y manejo de cadenas y formatos) y no se pueden resolver con datos de entrenamiento. La salida debe revisarse y probarse siempre.
- Comportamiento inestable por muestra: en 5 ejecuciones, el 21 % de las funciones de prueba pasan en algunas y fallan en otras.
- La licencia Llama 2 Community License incluye una politica de uso aceptable y una restriccion de uso comercial por encima de 700 millones de usuarios activos mensuales. El codigo fuente del proyecto RevBench es Apache-2.0, pero el adaptador no lo es.
- No se documentan sesgos especificos, aunque al ser un modelo base entrenado predominantemente con codigo C, su comportamiento fuera de ese dominio (y fuera del ingles) no esta caracterizado.
- Todo uso en produccion exige un filtro automatico que verifique que la salida compila antes de aceptarla.
- No hay datos publicados de latencia ni de throughput, ni evaluacion con prompts distintos al de la plantilla estricta: la model card advierte que los resultados se degradan con otra plantilla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bananaprotocol/revbench-lora-mixed
- Adaptador general: https://huggingface.co/bananaprotocol/revbench-lora-r64-a64
- Codigo y memoria de la tesis (RevBench): https://github.com/bananaprotocol/RevBench
- Ghidra: https://ghidra-sre.org/
- LLM4Decompile: https://github.com/albertan017/LLM4Decompile
- ExeBench: https://github.com/jordiae/exebench
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Modelo base: https://huggingface.co/codellama/CodeLlama-7b-Instruct-hf
- Los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo.
