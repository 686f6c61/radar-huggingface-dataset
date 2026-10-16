# AnveshAI/AnveshAI-CoderLM-0.1B-Preview

## Resumen

AnveshAI-CoderLM-0.1B-Preview es un modelo de lenguaje causal compacto de 100,2 millones de parametros (87,6 M no de embedding) desarrollado por AnveshAI y disenado especificamente para generacion de codigo multi-lenguaje. Su rasgo mas distintivo es la arquitectura hibrida de 15 capas que combina 10 bloques ParallelMinGRU (recurrencia lineal) con 5 bloques Differential Grouped-Query Attention (DifferentialGQA) con RoPE, una mezcla poco habitual en modelos de codigo de este tamano.

El modelo cubre 13 lenguajes de programacion y marcado (Python, Java, JavaScript, C++, C, Rust, TypeScript, Go, HTML, CSS, Shell, SQL y Markdown) e incorpora capacidades de fill-in-the-middle (FIM) mediante tokens especiales, ademas de enrutado por lenguaje con tokens `<|lang:xyz|>`. Con un peso de aproximadamente 191 MB en FP16, esta pensado para ejecutarse en CPU y dispositivos de borde (smartphones, tablets, Raspberry Pi y hardware embebido) sin necesidad de GPU dedicada.

Se trata de una version "Preview" en fase temprana: el checkpoint publicado corresponde al paso 10.000 de entrenamiento con una perdida de validacion de 1,0397 (perplejidad 2,83) y una precision Top-1 del 75,54 %. Su relevancia actual radica en explorar la viabilidad de asistentes de codigo locales con huella minima, aunque con una ventana de contexto muy limitada de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 15 capas (10x ParallelMinGRU + 5x DifferentialGQA con RoPE), clase `AnveshAICoderLMForCausalLM` |
| Parametros totales | 100.176.325 (100,2 M); 87,6 M no de embedding |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | FP16 (checkpoint publicado, ~191 MB) y FP32; no se documentan formatos GGUF/AWQ/GPTQ |
| Idiomas soportados | 13 lenguajes de codigo/marcado (Python, Java, JavaScript, C++, C, Rust, TypeScript, Go, HTML, CSS, Shell, SQL, Markdown) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), libreria transformers con `trust_remote_code=True` |
| Tamano oculto | 768 |
| Tamano intermedio | 1808 (SwiGLU) |
| Cabezas de atencion | 8 cabezas de consulta (d_head = 64), 2 cabezas KV (GQA) |
| Vocabulario | 16.384 (BPE con preservacion aislada de saltos de linea) |
| Embeddings ligados | Si (`lm_head.weight == tok_emb.weight`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida de 15 capas que alterna dos tipos de bloque. Diez capas usan ParallelMinGRU, una formulacion de recurrencia lineal paralelizable que reduce el coste computacional respecto a la atencion completa y resulta favorable para inferencia en CPU y dispositivos de borde. Las cinco capas restantes usan Differential Grouped-Query Attention (DifferentialGQA) con codificacion posicional rotatoria (RoPE), con 8 cabezas de consulta y 2 cabezas KV, lo que reduce el coste de memoria de la cache KV. La activacion es SwiGLU (SiLU) y los embeddings de entrada y salida estan ligados, lo que contribuye a mantener la huella de parametros por debajo de 100 M efectivos fuera de embedding.

El tokenizador es un BPE de 16.384 entradas con tratamiento aislado de saltos de linea (`Split(Regex(r"\n"), behavior="isolated")`), una decision orientada a preservar estrictamente la indentacion y los saltos de linea, aspecto critico en generacion de codigo. Incorpora tokens especiales orientados a tarea y lenguaje (`<|lang:xyz|>`) para enrutado, y tokens de fill-in-the-middle (`<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`). El checkpoint publicado corresponde al paso 10.000 de entrenamiento; no se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de codigo en 13 lenguajes: Python, Java, JavaScript, C++, C, Rust, TypeScript, Go, HTML, CSS, Shell, SQL y Markdown.
- Relleno de huecos (fill-in-the-middle) mediante los tokens especiales `<|fim_prefix|>`, `<|fim_middle|>` y `<|fim_suffix|>`.
- Enrutado explicito por lenguaje mediante tokens `<|lang:xyz|>`.
- Preservacion estricta de indentacion y saltos de linea gracias al tokenizador con BPE de saltos aislados.
- Comprension y generacion en ingles como idioma natural (junto con el codigo).
- Inferencia en CPU y dispositivos de borde sin GPU dedicada.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".

## Casos de uso

- Autocompletado de codigo en editores ligeros: el modelo esta disenado para FIM y preservacion de indentacion, por lo que encaja en plugins de autocompletado local sin servidor remoto, aprovechando su tamano de ~191 MB.
- Generacion de codigo en dispositivos moviles y de borde: al ejecutarse en CPU y en hardware como Raspberry Pi o telefonos, permite asistentes de codigo en aplicaciones moviles, entornos de formacion o dispositivos sin conectividad.
- Prototipado rapido de plantillas HTML/CSS: cubre marcado y estilos dentro de la misma ventana de 512 tokens, util para generar fragmentos de maquetacion en entornos de bajo recurso.
- Asistencia en scripts de shell y SQL embebidos: el modelo cubre ambos lenguajes con precision Top-1 del 70,41 % (Shell) y 63,43 % (SQL), adecuado para generar comandos o consultas de uso frecuente.
- Educacion y demostraciones didacticas: su tamano permite desplegarlo en portatiles de estudiantes para ilustrar como funciona un modelo de codigo sin coste de infraestructura.
- Filtrado y completado en pipelines de CI ligeros: puede integrarse para completar o normalizar fragmentos de codigo con FIM, siempre que las tareas encajen en el limite de 512 tokens.
- Investigacion en arquitecturas hibridas: al combinar MinGRU y DifferentialGQA, sirve como banco de pruebas para estudiar recurrencia lineal frente a atencion en tareas de codigo.

## Benchmarks y rendimiento

La model-index oficial no contiene resultados (`results: []`). Los datos siguientes son los declarados por el autor en la model card para el checkpoint del paso 10.000.

Validacion general multi-lenguaje:

| Metrica | Checkpoint FP32 | Checkpoint FP16 | Paridad |
|---|---|---|---|
| Perdida de validacion | 1,0397 | 1,0398 | 99,99 % |
| Perplejidad de validacion | 2,83 | 2,83 | 100 % |
| Precision Top-1 | 75,54 % | 75,53 % | 99,99 % |
| Precision Top-5 | 91,13 % | 91,13 % | 100 % |
| Perdida ponderada 13 lenguajes | 1,1637 | 1,1637 | 100 % |
| Perplejidad ponderada 13 lenguajes | 3,20 | 3,20 | 100 % |

Desglose por lenguaje (ordenado por perdida):

| Lenguaje | Peso en dataset | Perdida de validacion | Perplejidad | Top-1 | Top-5 |
|---|---|---|---|---|---|
| C | 8,0 % | 0,7320 | 2,08 | 81,30 % | 94,48 % |
| TypeScript | 6,0 % | 0,8214 | 2,27 | 80,91 % | 93,80 % |
| Rust | 8,0 % | 0,9482 | 2,58 | 75,93 % | 92,97 % |
| C++ | 10,0 % | 0,9534 | 2,59 | 78,71 % | 90,97 % |
| HTML | 4,0 % | 0,9901 | 2,69 | 74,95 % | 91,02 % |
| Java | 12,0 % | 1,0126 | 2,75 | 78,03 % | 91,70 % |
| Python | 28,0 % | 1,3031 | 3,68 | 70,70 % | 87,55 % |
| Go | 5,0 % | 1,3273 | 3,77 | 70,02 % | 87,45 % |
| JavaScript | 10,0 % | 1,3318 | 3,79 | 70,95 % | 88,13 % |
| Shell | 2,0 % | 1,3395 | 3,82 | 70,41 % | 87,74 % |
| SQL | 2,0 % | 1,5765 | 4,84 | 63,43 % | 85,74 % |
| CSS | 3,0 % | 1,6704 | 5,31 | 63,38 % | 83,01 % |
| Markdown | 2,0 % | 2,5326 | 12,59 | 55,22 % | 70,41 % |

No se han publicado resultados en la informacion disponible para benchmarks estandarizados como MMLU, HumanEval, MBPP o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 100,2 M de parametros, el checkpoint FP16 ocupa ~191 MB y en FP32 ~400 MB, por lo que la huella de memoria es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En caso de usar GPU, cualquier tarjeta moderna (por ejemplo, RTX 3060, RTX 4090, A100, H100) lo ejecuta con holgura gracias a su tamano minimo. No se documentan cifras de latencia o throughput.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso integradas, y esta pensado para funcionar sin GPU.
- Despliegue en CPU y dispositivos de borde: smartphone, tablet, Raspberry Pi y hardware embebido, segun el autor.
- Opciones de despliegue: la model card documenta uso con la libreria `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) con `trust_remote_code=True`. No se mencionan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama ni TGI, y tampoco se documentan formatos GGUF.
- Limitacion practica de memoria: la cache KV esta acotada por la ventana de contexto de 512 tokens y por el uso de solo 2 cabezas KV (GQA), lo que reduce su tamano.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa aportados por el autor. A continuacion se ofrece una comparacion orientativa con otros modelos compactos de codigo ampliamente conocidos, basada en especificaciones publicas de cada proyecto (sujetas a verificacion en sus fuentes originales):

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| AnveshAI-CoderLM-0.1B-Preview | 100,2 M | 512 tokens | Apache 2.0 | Codigo multi-lenguaje, FIM, edge/CPU |
| Qwen2.5-Coder-0.5B | ~0,49 B | 32.768 tokens | Apache 2.0 | Codigo multi-lenguaje, tamano similar en gama baja |
| StarCoder2-3B | 3 B | 16.384 tokens | BigCode OpenRAIL-M | Codigo multi-lenguaje, FIM |
| CodeGemma-2B | 2 B | 8.192 tokens | Gemma (uso condicionado) | Codigo multi-lenguaje, FIM |

Nota: los datos de los modelos alternativos proceden de fuentes publicas generales y no de la informacion proporcionada en esta ficha; conviene contrastarlos antes de tomar decisiones. La principal diferencia de CoderLM frente a ellos es su tamano mucho menor (100 M frente a 0,5-3 B) y su contexto mas corto (512 frente a 8.192-32.768 tokens).

## Limitaciones y advertencias

- Ventana de contexto muy reducida: solo 512 tokens, insuficiente para ficheros completos o conversaciones largas; muchos casos de uso multi-turno o de repositorios completos quedaran fuera de alcance.
- Estado "Preview": es un checkpoint temprano (paso 10.000), por lo que la calidad y el alineamiento pueden no estar madurados.
- Cobertura de lenguajes desigual: Python recibe el 28 % del peso del dataset con una precision Top-1 del 70,70 %, mientras que Markdown tiene una precision Top-1 del 55,22 % y una perplejidad de 12,59, lo que indica un rendimiento notablemente inferior en ese dominio.
- Riesgo de alucinacion: no hay datos publicados sobre tasas de alucinacion ni sobre alineacion (RLHF/DPO); en modelos pequenos de codigo este riesgo tiende a ser alto en APIs y funciones inexistentes.
- Idioma natural limitado: el modelo declara ingles (y codigo); no se documenta soporte real de castellano ni de otros idiomas naturales.
- Ausencia de capacidades avanzadas: no se documentan tool calling, function calling, agentes, razonamiento multi-paso ni vision, lo que restringe su uso en flujos agenticos.
- Formato de pesos: solo safetensors FP16/FP32; al no haber GGUF documentado, el despliegue en llama.cpp u Ollama requeriria conversion previa.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una version Preview conviene validar el comportamiento en el dominio concreto antes de llevarla a produccion.
- Datos de entrenamiento no disponibles: no se especifican el numero de tokens, la procedencia del dataset ni su composicion exacta, lo que dificulta evaluar sesgos y licencias del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnveshAI/AnveshAI-CoderLM-0.1B-Preview
- Organizacion AnveshAI en HuggingFace: https://huggingface.co/AnveshAI
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio/modelo relacionado referenciado en la model card: https://huggingface.co/AnveshAI/AnveshAI-Ritchie-0.1B

No se han encontrado en la informacion disponible papers, blogs tecnicos, repositorios de codigo ni demos adicionales asociados al modelo.
