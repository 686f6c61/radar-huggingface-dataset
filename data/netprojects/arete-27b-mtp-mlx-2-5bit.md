# netprojects/Arete-27B-MTP-MLX-2.5bit

## Resumen

Arete-27B-MTP-MLX-2.5bit es una cuantizacion de 2,5 bits (3,65 bits por peso de media) del modelo NousResearch/Arete-27B, un ajuste fino supervisado de Qwen3.8-27B orientado a respuestas factuales y directas sobre temas politicamente sensibles. La publica el usuario netprojects en Hugging Face y esta empaquetada para MLX, el framework de Apple para inferencia en silicio de Apple. El modelo conserva el tokenizador y la plantilla de chat originales de Nous Research y anade una cabeza MTP (multi-token prediction) para acelerar la decodificacion.

Con 27.745.371.136 parametros (unos 27,7 mil millones), esta variante reduce el peso a 11,8 GB mediante cuantizacion afin por grupos de 64, con proyecciones MLP gate/up en 2 bits, down en 3 bits, atencion y Gated DeltaNet en 4 bits, y embeddings y capa de salida en 4 bits. Es una build solo texto: se ha eliminado el codificador de vision. Su proposito es permitir ejecutar un modelo de 27B en Macs con 24 GB o mas de memoria unificada, a costa de una fidelidad frente a bf16 notablemente menor que las builds de 3, 4 o 6 bits.

La relevancia actual radica en que combina tres tendencias: ajustes finos con sesgo ideologico controlado (el "fact score" sube de 2,32 a 2,98 y la propaganda cae del 22% al 0,9% segun Nous Research), cuantizacion agresiva para hardware de consumo, y decodificacion especulativa mediante MTP con un head de Qwen3.8-27B que acelera la generacion entre 1,95x y 2,18x en las builds medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y linear attention (Gated DeltaNet), derivado de Qwen3.8-27B; incluye cabeza MTP |
| Parametros totales | 27.745.371.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin (group 64): MLP gate/up 2 bits, MLP down 3 bits, atencion y Gated DeltaNet 4 bits, embeddings y capa de salida 4 bits; ~3,65 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B, es un ajuste fino supervisado completo de Qwen3.8-27B. La arquitectura subyacente combina capas de atencion completa con capas de linear attention del tipo Gated DeltaNet, una variante de attention lineal con estado recurrente que reduce el coste computacional en contextos largos. El entrenamiento de Arete se realizo exclusivamente con datos de texto y el codificador de vision se mantuvo congelado; el objetivo declarado es producir respuestas factuales y directas en siete areas politicamente sensibles sin degradar las capacidades generales y agenticas (Hermes Bench 65,60 frente a 65,77 del base; Terminal-Bench-2.1 70 frente a 67).

La build que nos ocupa aplica cuantizacion afin por grupos de 64 sobre los pesos bf16, verificada bit a bit como la cuantizacion exacta de la build bf16. La cabeza MTP incluida (`model-mtp.safetensors`) no procede de Arete-27B, que no la incorpora, sino que es la cabeza MTP sin modificar de Qwen/Qwen3.8-27B (revision 37561816) cuantizada a 4 bits. Como fue entrenada contra el modelo base y no contra el ajuste fino, actua como modelo borrador sobre un fine-tune. El `config.json` de esta build fija `mtp_num_hidden_layers` a 1 para que los cargadores detecten la cabeza, ya que el config original de Arete lo deja a 0. No hay informacion sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas con sesgo factual controlado en temas politicos sensibles.
- Razonamiento general y capacidades agenticas heredadas de Qwen3.8-27B, con soporte de modo thinking (desactivable desde la plantilla de chat).
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Decodificacion especulativa mediante cabeza MTP, con aceleracion medida de 1,95x (build 4-bit) y 2,18x (build 8-bit) en decodificacion greedy.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no soportada en esta build (codificador eliminado, solo texto).
- Codificacion: 2 de 3 pruebas superadas en esta build (frente a 3 de 3 en las builds de 3, 4, 6 y 8 bits).

## Casos de uso

- Asistente conversacional en local para Macs de 24 GB o mas: la build ocupa 11,8 GB y deja margen para el contexto y el head MTP, permitiendo conversaciones multi-turno sin conexion a servicios en la nube.
- Analisis de temas politicos y factuales: el ajuste de Arete reduce la propaganda al 0,9% frente al 22% del base en 803 prompts con thinking desactivado, lo que lo hace util para resumenes y preguntas sobre temas sensibles donde se busca neutralidad.
- Prototipado de agentes con tool calling: el formato XML de Qwen y la integracion con mlx-lm permiten conectar funciones externas (APIs, calculadoras, busquedas) y probar flujos multi-paso en hardware de consumo.
- Generacion de codigo asistida en entornos con recursos limitados: aunque esta build falla 1 de 3 pruebas de codigo, sirve para autocompletado y generacion de scripts en un MacBook, con la advertencia de revisar la salida.
- Evaluacion de cuantizacion agresiva: util como referencia para medir la perdida de fidelidad (84,6% de mismo siguiente token que bf16, KL 0,2417) frente a builds de 3, 4 y 6 bits en tareas de investigacion sobre cuantizacion.
- Despliegue educativo y de demostracion: el tamano de 11,8 GB y la licencia Apache 2.0 permiten distribuirlo en cursos, talleres y demos de inferencia en Apple Silicon sin coste de licencia.
- Decodificacion acelerada con MTP: escenarios de generacion larga donde el throughput importa, usando la cabeza MTP como draft model con `--draft-kind mtp` en mlx-vlm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la informacion disponible mas alla de las cifras del modelo base y de las pruebas internas de la build. Se recogen a continuacion los datos aportados por el autor.

| Medida | Arete-27B | Qwen3.8-27B |
|---|---:|---:|
| Fact score (media) | 2,98 | 2,32 |
| Respuestas con propaganda (803 prompts, thinking off) | 0,9% | 22% |
| Hermes Bench | 65,60 | 65,77 |
| Terminal-Bench-2.1 | 70 | 67 |

| Build | Tamano | Bits/peso | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico (prompt 8K) | Mac recomendado | Tool call / coding / thinking / vision |
|---|---|---|---|---|---|---|---|---|
| 6-bit | 23,1 GB | 6,66 | 98,7% | 0,0018 | 46/50 | – | – | pass / 3/3 / 2/2 / pass |
| 8-bit | 29,9 GB | 8,63 | 99,1% | 0,0005 | – | – | – | pass / 3/3 / 2/2 / pass |
| 4-bit | 16,3 GB | 4,70 | 95,5% | 0,0232 | 47/50 | – | – | pass / 3/3 / 2/2 / pass |
| 3-bit | 13,8 GB | 3,91 | 90,1% | 0,0986 | 49/50 | 14,6 GB | 24 GB+ | pass / 3/3 / 2/2 / pass |
| 2.5-bit | 11,8 GB | 3,65 | 84,6% | 0,2417 | 46/50 | 13,8 GB | 24 GB+ | pass / 2/3 / 2/2 / text-only |
| bf16 | 55,6 GB | 16 | referencia | – | – | – | – | – / – / – / – |

Rendimiento de decodificacion medido en un MacBook Pro M5 Max (128 GB), greedy, mismo conjunto de prompts:

| Build | tok/s sin MTP | tok/s con MTP | Aceleracion | Aceptacion |
|---|---:|---:|---:|---:|
| 4-bit | 20,5 | 39,8 | 1,95x | 75% |
| 8-bit | 13,1 | 28,6 | 2,18x | 77% |

Las builds de 6, 3, 2,5 y bf16 no se cronometraron por separado.

## Requisitos de hardware

- VRAM/memoria unificada estimada: memoria pico de 13,8 GB con prompt de 8K tokens en la build de 2,5 bits (medida con mlx-lm, texto).
- Mac recomendado: 24 GB o mas de RAM unificada (el minimo cuyo limite por defecto de memoria GPU, aproximadamente dos tercios de la RAM hasta 36 GB y tres cuartos por encima, cubre el pico); contextos mas largos requieren mas memoria.
- GPU: el modelo esta empaquetado para MLX y Apple Silicon; no se proporcionan datos para GPU NVIDIA (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en Macs con 24 GB o mas de memoria unificada; no hay datos para GPUs discretas.
- Opciones de despliegue: mlx-lm (>=0.32.2) para texto y mlx-vlm (0.7.11) para usar la cabeza MTP como draft model con `--draft-kind mtp`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no cronometrados para esta build; como referencia, la build 4-bit alcanza 20,5 tok/s sin MTP y 39,8 tok/s con MTP, y la 8-bit 13,1 y 28,6 tok/s respectivamente en un M5 Max.
- Entorno de medida: mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11, MacBook Pro M5 Max de 128 GB, 19 de noviembre de 2026.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-MTP-MLX-2.5bit | 27,7B | no disponible | 2,5 bits (~3,65 bpp), 11,8 GB | Apache 2.0 | Hugging Face, MLX |
| Arete-27B-MTP-MLX-3bit | 27,7B | no disponible | 3 bits (~3,91 bpp), 13,8 GB | Apache 2.0 | Hugging Face, MLX |
| Arete-27B-MTP-MLX-4bit | 27,7B | no disponible | 4 bits (~4,70 bpp), 16,3 GB | Apache 2.0 | Hugging Face, MLX |
| Arete-27B-MTP-MLX-6bit | 27,7B | no disponible | 6 bits (~6,66 bpp), 23,1 GB | Apache 2.0 | Hugging Face, MLX |
| NousResearch/Arete-27B (bf16) | 27,7B | no disponible | bf16, 55,6 GB | Apache 2.0 | Hugging Face |

Frente a las builds hermanas, la de 2,5 bits es la mas pequena y la que mas fidelidad pierde: 84,6% de mismo siguiente token que bf16 y KL de 0,2417, frente al 90,1% y 0,0986 de la 3-bit, el 95,5% y 0,0232 de la 4-bit y el 98,7% y 0,0018 de la 6-bit. Tambien es la unica sin vision y la unica que falla una prueba de codigo (2/3). A cambio, reduce el peso a 11,8 GB y el pico de memoria a 13,8 GB, lo que la hace viable en Macs de 24 GB donde las builds mayores no caben con contexto largo.

## Limitaciones y advertencias

- Perdida de fidelidad notable: solo el 84,6% de los siguientes tokens coinciden con bf16 y la divergencia KL es de 0,2417, la mas alta de la familia; esperar degradacion en tareas que requieren precision.
- Codificacion degradada: falla 1 de 3 pruebas de codigo, frente a 3 de 3 en las builds de 3, 4, 6 y 8 bits.
- Sin vision: el codificador de vision ha sido eliminado; no admite entradas de imagen.
- Cabeza MTP prestada: procede de Qwen3.8-27B y fue entrenada contra el modelo base, no contra Arete-27B, por lo que es una cabeza de base sobre un fine-tune; la aceptacion y la aceleracion pueden diferir de las medidas.
- Divergencia con decodificacion greedy: cada token borrador se verifica con el modelo completo, pero en empates cercanos la verificacion por lotes puede redondear al otro lado, de modo que respuestas largas pueden diferir ligeramente de la decodificacion simple.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el ajuste de Arete busca reducir sesgo ideologico, pero no elimina errores factuales.
- Sesgos conocidos: no se detallan en la informacion proporcionada; el ajuste esta disenado para siete areas politicamente sensibles, lo que puede introducir su propio sesgo de encuadre.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- Contexto maximo: no disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base NousResearch/Arete-27B y de Qwen3.8-27B, de los que hereda pesos y cabeza MTP.
- Requiere hardware Apple Silicon y las versiones minimas mlx-lm >=0.32.2 y mlx-vlm 0.7.11; no hay soporte documentado para otras plataformas.
- Los parametros de muestreo de `generation_config.json` (heredados de Qwen3.8) no los lee mlx-lm automaticamente; hay que fijar temperature, top-p y top-k manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-2.5bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Build 3-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-3bit
- Build 4-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-4bit
- Build 6-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-bf16
- Modelo Qwen3.8-27B (origen de la cabeza MTP): https://huggingface.co/Qwen/Qwen3.8-27B
