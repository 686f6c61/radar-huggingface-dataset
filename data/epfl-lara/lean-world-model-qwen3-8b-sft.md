# EPFL-LARA/lean-world-model-qwen3-8b-sft

## Resumen

Lean World-Model Prover (Qwen3-8B) es un ajuste fino supervisado del modelo base Qwen/Qwen3-8B-Base, desarrollado por el laboratorio EPFL-LARA, orientado a la demostración automática de teoremas en Lean 4. Su particularidad es que no se limita a emitir código de prueba: genera además estados de objetivo (goals) y diagnósticos del compilador simulados como comentarios en línea, actuando como un modelo del mundo del propio verificador. Esta versión corresponde a la etapa SFT previa a GRPO, identificada como WM8 en el artículo asociado.

Con 8.190.735.360 parámetros, es un transformer denso de 8B que hereda el tokenizador y la ventana de contexto de Qwen3. El runner oficial trabaja con un contexto total de 32.768 tokens, tokenización simple con `add_special_tokens=False` y un prompt de finalización cruda. Está entrenado sobre los conjuntos `EPFL-LARA/lean-world-model-cpt` (preentrenamiento continuado) y `EPFL-LARA/lean-world-model-sft` (ajuste supervisado).

Su relevancia actual radica en que ataca el cuello de botella habitual de los demostradores formales: la dependencia del compilador Lean como oráculo. Al predecir estados de objetivo y errores dentro del propio texto generado, permite al modelo corregir intentos sucesivos en una sola respuesta y abre la puerta a bucles de reparación más baratos en cómputo y en latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), ajustado sobre Qwen/Qwen3-8B-Base |
| Parámetros totales | 8.190.735.360 (8,19 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens (contexto total empleado por el runner oficial de inferencia) |
| Tipos de cuantización | No disponible: el repositorio publica únicamente pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Inglés (`en`); el contenido generado es principalmente código Lean 4 y comentarios en inglés |
| Licencia | `other` (la model card no detalla los términos; el modelo base Qwen3-8B-Base es Apache-2.0) |
| Formato de pesos | Safetensors (biblioteca `transformers`) |
| Pipeline declarado | `text-generation` |
| Modelo base | Qwen/Qwen3-8B-Base (relación: finetune) |
| Datasets de entrenamiento | EPFL-LARA/lean-world-model-cpt, EPFL-LARA/lean-world-model-sft |
| Etapa | SFT, antes de GRPO (modelo WM8 del artículo) |
| Tamaño del repositorio | 16,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only denso de aproximadamente 8,2 mil millones de parámetros, y se especializa mediante un proceso en dos fases documentado por los propios conjuntos de datos publicados: un preentrenamiento continuado sobre `lean-world-model-cpt` y un ajuste supervisado posterior sobre `lean-world-model-sft`. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO; únicamente indica que este checkpoint es previo a la fase de GRPO, lo que implica que existe (o existirá) una variante refinada por refuerzo a partir de esta.

La innovación técnica central es el planteamiento de "world model": en lugar de generar solo la táctica o el bloque de prueba, el modelo produce bloques de retroalimentación con el formato `/- <feedback> ... </feedback> -/` intercalados en el código, que contienen estados de objetivo predichos y diagnósticos del compilador estimados. Gracias a ello, una única respuesta puede encadenar varios intentos de prueba corregidos de forma sucesiva, sin necesidad de invocar el compilador Lean entre intentos. El runner de referencia emplea el modo de finalización cruda (no chat), con el prompt de plantilla documentado y una temperatura por defecto de 0,3 para una muestra y de 0,7 para 32 muestras, con `top-p` de 0,95. Para la verificación final se debe extraer el último bloque de código Lean completo de la respuesta.

## Capacidades

- Generación de demostraciones completas en Lean 4, reemplazando las declaraciones `sorry` por pruebas que se espera que compilen.
- Predicción de estados de objetivo (goal states) dentro de la propia respuesta, en bloques de comentarios con formato `/- <feedback> ... </feedback> -/`.
- Simulación de diagnósticos del compilador Lean 4 (errores y avisos estimados) sin ejecutar el compilador.
- Reparación iterativa dentro de una sola respuesta: puede emitir intentos de prueba sucesivos y corregidos, empleando la retroalimentación generada como guía.
- Manejo de código Lean 4 con importaciones de Mathlib y contexto formal previo incluido en el prompt.
- Generación de comentarios explicativos en inglés junto al código formal.
- Capacidad conversacional declarada en las etiquetas del modelo (`conversational`), aunque el flujo documentado de uso es de finalización cruda.
- Contexto de hasta 32.768 tokens, suficiente para teoremas con un preámbulo extenso de importaciones y definiciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso fuera del bucle de reparación de pruebas: no documentadas.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Completado automático de pruebas en proyectos Lean 4: dado un fichero `Example.lean` con importaciones, contexto y un teorema que termina en `by sorry`, el modelo devuelve el bloque `lean4` con la prueba completa, listo para extraer y verificar con Lean.
- Reparación de pruebas fallidas en integración continua: al predecir estados de objetivo y diagnósticos en la propia salida, el modelo puede encadenar correcciones dentro de una misma respuesta, reduciendo el número de invocaciones al compilador necesarias por iteración en un pipeline de CI.
- Generación de datos sintéticos para entrenar otros demostradores: las trazas con estados de objetivo predichos y retroalimentación intercalada sirven como corpus supervisado para modelos de prueba de menor tamaño o para técnicas de destilación.
- Asistente integrado en el editor: el runner oficial produce JSONL con `response`, `lean_code` y `finish_reason`, lo que facilita su integración en extensiones de VS Code u otras interfaces que muestren el código candidato y el motivo de finalización.
- Verificación formal de matemáticas asistida: en entornos donde el coste de ejecutar Lean es alto, el modelo actúa como sustituto aproximado del oráculo para filtrar candidatos antes de la comprobación definitiva.
- Evaluación comparativa de demostradores: al ser un checkpoint con etapa y modelo base explícitos (WM8, pre-GRPO), sirve como referencia reproducible en estudios sobre prueba automática de teoremas en Lean 4.
- Docencia de Lean 4: la salida incluye comentarios explicativos y bloques de retroalimentación, útiles como material de estudio sobre por qué una táctica funciona o falla.
- Prefiltrado de candidatos en búsqueda best-of-n: con 32 muestras y temperatura 0,7, el modelo permite generar muchos candidatos y quedarse con el último bloque Lean válido de cada respuesta antes de verificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como pass@k sobre miniF2F, ProofNet, Mathlib ni ningún otro conjunto de evaluación, ni comparaciones numéricas con otros demostradores.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia aritmética a partir del número de parámetros (8,19 mil millones), los pesos en bf16/fp16 ocupan aproximadamente 16,4 GB, a los que hay que sumar la caché KV para hasta 32.768 tokens de contexto, que puede añadir varios gigabytes adicionales. Estas cifras son estimaciones, no datos del repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. El runner oficial utiliza `vllm==0.12.0`, que requiere una GPU compatible con CUDA.
- GPU de consumo: con 8,2 mil millones de parámetros en bf16, el modelo entra en GPUs de 24 GB o más si se limita el contexto. En GPUs de 12-16 GB sería necesario cuantizar, pero el repositorio no publica pesos cuantizados.
- Opciones de despliegue: vLLM 0.12.0 es la vía documentada por el autor; también es utilizable directamente con `transformers` y es compatible con `text-generation-inference` según las etiquetas del repositorio. El uso con llama.cpp u Ollama requeriría convertir los pesos a GGUF, conversión no disponible actualmente.
- Latencia y throughput: no disponibles.
- Nota operativa: el runner emplea finalización cruda, tokenización simple con `add_special_tokens=False` y reserva los tokens restantes de contexto para la salida; para una muestra la temperatura por defecto es 0,3 y para 32 muestras es 0,7, con `top-p` de 0,95.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EPFL-LARA/lean-world-model-qwen3-8b-sft | 8,19 mil millones | 32.768 tokens | Demostración en Lean 4 con world model (goals y diagnósticos predichos) | `other` | Pesos en safetensors en HuggingFace |
| Qwen/Qwen3-8B-Base | 8,19 mil millones (mismo checkpoint base) | No disponible en la información proporcionada | Modelo de propósito general, sin especialización en Lean | Apache-2.0 según la model card del base | Pesos públicos |
| Qwen/Qwen3-8B | No disponible en la información proporcionada | No disponible | Propósito general con capacidades de razonamiento | No disponible en la información proporcionada | Pesos públicos |
| Otros demostradores especializados en Lean 4 | No disponible | No disponible | Demostración formal | No disponible | No disponible |

No se dispone de métricas comparativas publicadas que permitan contrastar el rendimiento en prueba de teoremas frente a estas alternativas. La comparación anterior se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al estar entrenado principalmente con material formal en inglés, el comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: alto y estructural en este caso. El modelo predice estados de objetivo y diagnósticos del compilador en lugar de obtenerlos realmente, por lo que puede generar retroalimentación plausible pero incorrecta y construir sobre ella pruebas inválidas. Es obligatorio verificar el código extraído con Lean antes de darlo por bueno.
- Selección de la salida: la propia model card advierte de que debe usarse el último bloque de código Lean completo como candidato final; tomar un bloque anterior puede dar lugar a una prueba descartada por el propio modelo.
- Restricciones de licencia: la licencia está etiquetada como `other` y la model card no especifica términos. Antes de un uso comercial es necesario consultar al autor y comprobar las condiciones heredadas del modelo base Qwen3-8B-Base.
- Limitaciones de idioma: el modelo está etiquetado únicamente para inglés; no hay evidencia de soporte multilingüe y las interacciones en castellano no están cubiertas por los datos de entrenamiento declarados.
- Dependencia del prompt: el flujo documentado exige una plantilla concreta con el teorema terminado en `by sorry` y conservar la línea final; desviarse de ese formato puede degradar la calidad de la salida.
- Estado del checkpoint: al ser la variante previa a GRPO, no incorpora la fase de refinamiento por refuerzo, por lo que su rendimiento puede ser inferior al de versiones posteriores de la misma familia.
- Modelo muy especializado: fuera de la generación de código Lean 4 y de la predicción de estados de objetivo, no se le atribuyen capacidades de propósito general.
- Contexto: 32.768 tokens es el contexto total empleado, compartido entre el enunciado del problema y la salida; problemas con preámbulos muy extensos reducen el espacio disponible para la prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-sft
- Colección "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset de ajuste supervisado: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Organización del autor: https://huggingface.co/EPFL-LARA
- EPFL (institución): https://www.epfl.ch/
- EPFL, versión en inglés: https://www.epfl.ch/en/
- Artículo de Wikipedia sobre la EPFL: https://en.wikipedia.org/wiki/%C3%89cole_Polytechnique_F%C3%A9d%C3%A9rale_de_Lausanne

Nota: la búsqueda web realizada no devolvió enlaces específicos al modelo, al artículo técnico ni al repositorio de código; únicamente páginas institucionales genéricas de la EPFL, que se incluyen arriba. No se dispone de URL del paper, del repositorio de código ni de demos adicionales.
