# roman220220/nemotron-30b-a3b-gptq-mixed_3_6

## Resumen

Nemotron-30B-A3B-gptq-mixed_3_6 es una cuantizacion de precision mixta del modelo nvidia/Nemotron-3.5-Lightning-30B-A3B, publicada por el usuario roman220220. Se trata de un artefacto de pesos, no de un modelo entrenado desde cero: parte de los pesos en precision completa de NVIDIA y los comprime con GPTQ (compensacion de error basada en la matriz hessiana) aplicando una receta de anchos de bit por capa. El resultado son aproximadamente 31.580 millones de parametros almacenados en unos 14 GB, con una media de 3,548 bits por peso y un tamano de grupo de 64.

La relevancia de esta publicacion es metodologica: demuestra que una seleccion de precision basada en la posicion de la capa (la misma heuristica que usa `mlx_lm.convert` con su predicado `mixed_3_6`, inspirada en Q4_K_M de llama.cpp) reduce la perplejidad frente a una cuantizacion uniforme de 3 bits calibrada con el mismo procedimiento, y muy por encima de una cuantizacion RTN sin calibracion. Aun asi, el autor reconoce que no alcanza el resultado de una receta de terceros (JANG_2L-CRACK) con el mismo presupuesto de bits, y apunta a una seleccion de capas guiada por sensibilidad hessiana como siguiente experimento.

El modelo base es una arquitectura hibrida NemotronH que combina Mamba2, atencion y Mixture-of-Experts en 52 capas, y esta pensado para ejecucion local en hardware Apple Silicon mediante MLX. El repositorio es muy reciente, no tiene descargas ni interacciones registradas y no incluye model card con especificaciones funcionales, por lo que buena parte de los datos de uso (idiomas, contexto, benchmarks estandar) no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH hibrida: Mamba2 + atencion + MoE, 52 capas |
| Parametros totales | 31.577.935.872 (31,58 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones (inferido de la nomenclatura A3B del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ con precision mixta 3/6 bits, tamano de grupo 64, media de 3,548 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar los terminos de NVIDIA) |
| Formato de pesos | safetensors en formato MLX (libreria mlx, tag 4-bit) |

## Arquitectura y entrenamiento

El modelo base nvidia/Nemotron-3.5-Lightning-30B-A3B emplea una arquitectura NemotronH hibrida de 52 capas que intercala capas de espacio de estados Mamba2, capas de atencion y capas de mezcla de expertos (MoE). Esta combinacion busca reducir el coste de inferencia en secuencias largas: las capas Mamba2 tienen coste lineal respecto a la longitud de contexto y las MoE activan solo una fraccion de los parametros por token, de ahi que un modelo de 31,6 mil millones de parametros pueda operar con un coste computacional cercano al de un modelo denso de unos 3 mil millones.

Sobre el entrenamiento del modelo base no hay informacion en los materiales disponibles: no se detalla el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. Lo que si documenta el autor es el proceso de cuantizacion: se aplica GPTQ con rejilla afin bit-exacta, de modo que cada proyeccion se calibra al mismo ancho de bit que le asignaria `mlx_lm.convert --quant-predicate mixed_3_6`. La receta `mixed_3_6` asigna 6 bits a `v_proj` y `down_proj` en el primer y ultimo octavo de las capas y en una de cada tres capas intermedias, 6 bits siempre a `lm_head`, y 3 bits al resto. El empaquetado se realiza con `mlx_lm.convert` estandar, sin kernels personalizados ni codigo de carga propio. Se documenta tambien que la siguiente linea de trabajo del proyecto es una seleccion de capas basada en la sensibilidad de la matriz hessiana (`--quant-recipe-mode sensitivity`) en lugar de la heuristica posicional.

## Capacidades

- Generacion de texto, razonamiento y codigo: capacidades heredadas del modelo base Nemotron-3.5-Lightning-30B-A3B; la model card del artefacto no las detalla ni las certifica.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se enumeran idiomas.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible en la informacion proporcionada.
- Inferencia local en Apple Silicon mediante `mlx-lm`, que es la capacidad confirmada y documentada por el autor.
- Eficiencia de inferencia por arquitectura MoE del modelo base: activacion de un subconjunto de parametros por token (orden de 3 mil millones), lo que reduce el coste por token frente a un denso de 31,6 mil millones.

## Casos de uso

- Ejecucion de un modelo de gran tamano en un portatil o estacion de trabajo Apple Silicon: con 14 GB en disco y una media de 3,548 bits por peso, el artefacto permite cargar un modelo MoE de 31,6 mil millones de parametros en equipos con memoria unificada de 16-32 GB, algo inviable con los pesos en bf16.
- Prototipado y desarrollo offline sin GPU dedicada: al ejecutarse con `mlx-lm` sobre Metal, resulta util para laboratorios que quieren evaluar el comportamiento del modelo base antes de comprometer presupuesto de GPU en la nube.
- Analisis de tecnicas de cuantizacion: el repositorio publica la perplejidad en wikitext-2-raw de cuatro variantes (bf16, JANG_2L-CRACK, esta receta posicional y 3 bits uniforme GPTQ y RTN), lo que lo convierte en material de referencia para reproducir y comparar recetas de compresion.
- Generacion de texto asistida en local con requisitos de privacidad: escenarios donde los datos no pueden salir del dispositivo (borradores internos, resumen de documentos sensibles) y donde el coste de una GPU en la nube no esta justificado.
- Servicio de inferencia de bajo presupuesto para cargas no criticas: al ser una cuantizacion agresiva de 3 bits en la mayor parte de las capas, es adecuada para tareas tolerantes a degradacion, como clasificacion de texto, etiquetado o generacion de borradores, siempre que se valide la calidad en el dominio concreto.
- Comparacion de arquitecturas hibridas Mamba2 + atencion + MoE: permite estudiar en hardware de consumo el comportamiento de un modelo NemotronH frente a transformers densos de tamano similar.
- Base para experimentos de cuantizacion posteriores: el proyecto de origen (`rromenskyi/quant-ternary`) planea una seleccion de capas basada en sensibilidad hessiana, por lo que este artefacto sirve como linea base reproducible para medir la mejora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor unicamente reporta perplejidad sobre wikitext-2-raw, con 20 fragmentos de 512 tokens y desplazamiento de un cuarto:

| Modelo | Perplejidad (wikitext-2-raw) |
|---|---|
| bf16 (referencia en precision completa) | 5,11 |
| JANG_2L-CRACK (terceros, precision mixta) | 5,43 |
| Este modelo (mixed_3_6, posicional) | 5,92 |
| GPTQ uniforme de 3 bits del mismo proyecto | 6,24 |
| RTN uniforme de 3 bits sin calibracion | 6,54 |

El propio autor senala que la precision mixta posicional cierra parte de la diferencia respecto a bf16, pero no iguala el resultado de JANG con el mismo presupuesto de bits.

## Requisitos de hardware

- VRAM o memoria unificada estimada: unos 14 GB solo para los pesos; con overhead de contexto y cache conviene disponer de 16 GB como minimo y 24-32 GB para trabajar comodo con secuencias largas.
- GPU compatibles: el artefacto esta empaquetado para MLX, por lo que requiere Apple Silicon (familias M1, M2, M3 o M4, preferiblemente variantes Pro, Max o Ultra). No esta pensado para CUDA.
- Cabe en GPU de consumo: no en el sentido habitual de GPU NVIDIA, ya que no se distribuye en formato GGUF ni con pesos compatibles con CUDA; en equipos Apple, si en configuraciones con memoria unificada de 16 GB o superior.
- Opciones de despliegue: `mlx-lm` es la via documentada (`mlx_lm.generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el autor indica explicitamente que no hay kernels personalizados ni codigo de carga propio.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3 mil millones de parametros activos, cabe esperar un coste por token muy inferior al de un denso de 31,6 mil millones, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Perplejidad (wikitext-2-raw) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/Nemotron-3.5-Lightning-30B-A3B | 31,58 mil millones (MoE, ~3 mil millones activos) | bf16, safetensors | 5,11 | other (NVIDIA) | Modelo base en HuggingFace |
| roman220220/nemotron-30b-a3b-gptq-mixed_3_6 (este modelo) | 31,58 mil millones (MoE) | MLX safetensors, GPTQ mixto 3/6 bits, 3,548 bits/peso, 14 GB | 5,92 | other | HuggingFace, MLX |
| GPTQ uniforme de 3 bits del mismo proyecto | 31,58 mil millones (MoE) | MLX safetensors, GPTQ 3 bits | 6,24 | other | HuggingFace, MLX |
| JANG_2L-CRACK (terceros) | 31,58 mil millones (MoE) | precision mixta | 5,43 | no disponible | no disponible en los materiales consultados |
| RTN uniforme de 3 bits | 31,58 mil millones (MoE) | 3 bits sin calibracion | 6,54 | no disponible | no disponible en los materiales consultados |

No se dispone de datos suficientes para comparar con alternativas de otro proveedor y misma categoria (por ejemplo modelos MoE abiertos de ~30 mil millones) en parametros, contexto y rendimiento; esa comparativa queda como no disponible.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en la mayor parte de las capas implica una degradacion medible: la perplejidad pasa de 5,11 en bf16 a 5,92, un incremento superior al 15 por ciento. No es un artefacto equivalente en calidad al modelo original.
- No alcanza el estado del arte en su propio presupuesto de bits: con la misma media de bits, la receta de terceros JANG_2L-CRACK obtiene 5,43 frente a 5,92.
- La seleccion de capas es una heuristica posicional, no una medida de sensibilidad real por capa; el autor lo reconoce como limitacion de diseno.
- Ausencia total de evaluacion funcional: no hay benchmarks de tareas (razonamiento, codigo, matematicas), ni datos de idiomas, ni tamano de contexto, ni confirmacion de soporte de tool calling o agentes.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en general aumenta con cuantizaciones agresivas, por lo que se recomienda validacion en el dominio de uso.
- Licencia "other" heredada del modelo base NVIDIA: hay que revisar los terminos del modelo original antes de cualquier uso comercial, ya que la model card de este repositorio no los reproduce ni los aclara.
- Repositorio con cero descargas y cero interacciones, publicado y actualizado el mismo dia, sin mantenimiento observado: no hay garantia de soporte, correccion de errores ni actualizaciones.
- Dependencia de hardware: requiere Apple Silicon y la libreria MLX. No hay versiones GGUF ni compatibilidad con CUDA, vLLM, TGI u Ollama.
- Fecha de creacion y actualizacion registradas como 2026-09-12; conviene verificar la vigencia del repositorio y del modelo base antes de integrarlo en un proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/nemotron-30b-a3b-gptq-mixed_3_6
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Lightning-30B-A3B
- Repositorio del pipeline de cuantizacion GPTQ del autor: https://github.com/rromenskyi/quant-ternary
- Documentacion metodologica citada por el autor: `docs/session_findings_2026-09-11.md`, seccion 7p, dentro del repositorio anterior
- Resultados de busqueda web: no se ha recuperado ningun enlace relevante sobre este modelo, su arquitectura o su evaluacion; los resultados devueltos no guardan relacion con el contenido de la ficha.
