# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_UNDIAL

## Resumen

`JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_UNDIAL` es un modelo derivado de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full` al que se le ha aplicado un proceso de desaprendizaje (machine unlearning) mediante el metodo UNDIAL sobre el split `forget05` del dataset TOFU. El entrenamiento se ha realizado con el framework open-unlearning, el estandar de facto para reproducir y comparar experimentos de olvido selectivo en modelos de lenguaje.

El modelo pertenece a la familia Llama 3.1, por lo que hereda su arquitectura transformer decoder-only densa de aproximadamente 8.030 millones de parametros y su ventana de contexto de 128.000 tokens. Su proposito no es el despliegue comercial generalista, sino servir como baseline de desaprendizaje por pesos (weight unlearning) y como modelo borrador (draft) dentro del proyecto Speculative-Decoding-Unlearning, que estudia como combinar decodificacion especulativa con tecnicas de olvido.

Es relevante porque aborda uno de los problemas abiertos mas criticos del sector: eliminar informacion concreta de un modelo ya entrenado sin degradar su utilidad general. Los resultados publicados en la model card reflejan el compromiso tipico de este tipo de tecnicas: se reduce la probabilidad de respuesta sobre el conjunto olvidado, pero persiste memorizacion exacta en aproximadamente la mitad de los casos y la utilidad retenida cae ligeramente por debajo de 0,5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1), con GQA, RoPE, SwiGLU y RMSNorm |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B; no se explicita en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible en la model card; al derivar de Llama 3.1 8B Instruct hereda el soporte oficial de ingles, aleman, frances, italiano, portugues, hindi, castellano y thai |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repositorio de 16,1 GB, compatible con la libreria `transformers`) |

## Arquitectura y entrenamiento

La base es `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, es decir, Llama 3.1 8B Instruct ya ajustado sobre el dataset TOFU completo (autores ficticios con pares pregunta-respuesta). Sobre ese checkpoint se aplica UNDIAL, un metodo de desaprendizaje que combina autodestilizacion con ajuste de logits para forzar al modelo a reducir la probabilidad de las respuestas del conjunto a olvidar manteniendo la distribucion en el resto. La model card documenta los hiperparametros exactos del entrenamiento: `gamma: 1.0`, `alpha: 1`, `beta: 10` y `retain_loss_type: NLL`, lo que permite reproducir el experimento con la configuracion Hydra incluida en `.hydra/config.yaml`.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla del split `forget05` de TOFU, ni si hubo fases adicionales de RLHF o DPO en esta etapa de desaprendizaje (el alineamiento por instrucciones procede del modelo base). El objetivo declarado del autor es utilizarlo como baseline de olvido por pesos y como modelo borrador en el proyecto Speculative-Decoding-Unlearning, donde la decodificacion especulativa se emplea como mecanismo auxiliar del proceso de olvido.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de instrucciones de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas sobre el conjunto retenido (retain set) de TOFU, con una utilidad de modelo reportada de 0,4981.
- Capacidad reducida, pero no nula, de responder sobre el conjunto olvidado: la probabilidad de respuesta sobre `forget05` es de 0,1175.
- Soporte multilingue heredado de Llama 3.1 (8 idiomas oficiales), no verificado especificamente para este checkpoint.
- Uso como modelo borrador en esquemas de decodificacion especulativa dentro del flujo de investigacion del autor.
- Capacidades de razonamiento de varios pasos y de codigo propias de Llama 3.1 8B Instruct, aunque no se han evaluado ni publicado resultados especificos en esta ficha.
- No se documenta soporte explicito de tool calling, function calling ni de modo de pensamiento (thinking mode) en la informacion disponible.

## Casos de uso

- Investigacion en machine unlearning: sirve como baseline reproducible de UNDIAL sobre TOFU `forget05`, con hiperparametros y resultados publicados, para comparar contra otros metodos como NPO, RMU o GradDiff en condiciones identicas de dataset y evaluacion.
- Modelo borrador en decodificacion especulativa: el autor lo emplea como draft model en su proyecto; un modelo de 8B con la misma tokenizacion que el objetivo permite proponer tokens candidatos y acelerar la generacion en el pipeline de investigacion.
- Auditoria de privacidad: las metricas de membership inference (`mia_loss`, `mia_min_k`, `mia_min_k_plus_plus`, `mia_zlib`) y `privleak` permiten estudiar hasta que punto un atacante puede distinguir si un ejemplo pertenecia al conjunto de entrenamiento.
- Cumplimiento del derecho al olvido (RGPD): como caso de estudio tecnico de como aplicar y medir la supresion de datos personales en un modelo ya desplegado, incluyendo el porcentaje de memorizacion exacta residual.
- Evaluacion de robustez del olvido: al ser un checkpoint intermedio, permite analizar si un fine-tuning posterior sobre datos relacionados recupera la informacion supuestamente eliminada.
- Estudio del compromiso olvido-utilidad: la combinacion de `forget_Q_A_PARA_Prob` (0,1175) y `model_utility` (0,4981) es util para cuantificar cuanto rendimiento general se sacrifica al olvidar un 5 % de los datos.
- Reproducibilidad academica: la configuracion Hydra y los resultados de evaluacion incluidos en `evals/` permiten replicar el experimento sin reentrenar desde cero.
- Generacion de texto general en tareas de investigacion: mantiene capacidad conversacional suficiente para usarse como modelo de comparacion en experimentos controlados, no recomendado para produccion comercial.

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas de evaluacion de TOFU incluidas en la model card. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,5006 |
| extraction_strength | 0,0431 |
| forget_Q_A_PARA_Prob | 0,1175 |
| forget_Q_A_gibberish | 0,8296 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,5636 |
| mia_loss | 0,5702 |
| mia_min_k | 0,6584 |
| mia_min_k_plus_plus | 0,6010 |
| mia_zlib | 0,4796 |
| model_utility | 0,4981 |
| privleak | -46,9342 |

Nota de interpretacion: los valores de `mia_*` cercanos a 0,5 indican que el ataque de inferencia de pertenencia no distingue claramente entre miembros y no miembros, mientras que valores mas altos sugieren mayor distinguibilidad. La interpretacion detallada de `privleak` y de `forget_quality` no se especifica en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16,1 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica unos 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB.
- VRAM estimada en cuantizacion de 4 bits (GPTQ/AWQ/NF4): en torno a 5-7 GB, aunque estas versiones no estan publicadas y habria que generarlas.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100, L40S; sin problemas en bf16.
- GPU de consumo: cabe en bf16 en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB); en 8 bits cabe en RTX 4080/4070 Ti Super (16 GB); en 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y similares.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM, Hugging Face TGI (el repositorio incluye el tag `endpoints_compatible`) y cualquier servidor compatible con la API de mensajes. Para llama.cpp u Ollama seria necesario convertir primero los pesos a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_UNDIAL | 8,03 B | 128.000 tokens (heredado) | Desaprendizaje UNDIAL sobre TOFU `forget05` | Llama 3.1 Community | Hugging Face |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full | 8,03 B | 128.000 tokens (heredado) | Fine-tuning completo sobre TOFU (modelo base, sin desaprender) | Llama 3.1 Community | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Modelo de instrucciones generalista | Llama 3.1 Community | Hugging Face |
| Otros baselines de olvido sobre TOFU (NPO, RMU, GradDiff, etc.) | No disponible | No disponible | Desaprendizaje | No disponible | No disponible en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no se han facilitado las metricas TOFU de los metodos competidores ni de los checkpoints de referencia.

## Limitaciones y advertencias

- El olvido es parcial: `exact_memorization` se situa en 0,5006, lo que indica que el modelo sigue reproduciendo respuestas exactas del conjunto supuestamente olvidado en aproximadamente la mitad de los casos.
- `forget_Q_A_PARA_Prob` de 0,1175 y `forget_truth_ratio` de 0,5636 muestran que la informacion no se ha eliminado por completo, solo atenuado.
- `forget_quality` de 0,0000 y `forget_Q_A_gibberish` de 0,8296 sugieren que las respuestas sobre el conjunto olvidado no degeneran en texto sin sentido, lo que puede facilitar ataques de extraccion posteriores.
- El valor de `privleak` (-46,9342) se aleja mucho de cero; su implicacion practica para la fuga de privacidad no se detalla en la informacion disponible.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad (truthfulness) ni de tasas de alucinacion para este checkpoint.
- Cobertura idiomatica no verificada: aunque hereda el soporte de Llama 3.1, no hay evaluaciones multilingues de este checkpoint concreto.
- Es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no debe considerarse un modelo listo para produccion.
- Licencia Llama 3.1 Community: uso comercial permitido bajo condiciones (atribucion, politica de uso aceptable, obligaciones de nombrado para despliegues con mas de 700 millones de usuarios mensuales y requisitos de redistribucion). Conviene revisar el texto completo antes de cualquier uso empresarial.
- No hay garantia de que un fine-tuning posterior no recupere la informacion olvidada; se trata de un riesgo conocido en todo el campo del machine unlearning.
- La fecha de creacion del repositorio aparece como 2026-09-10, posterior a la fecha habitual de publicacion de Llama 3.1; se recomienda verificar la procedencia de los pesos antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_UNDIAL
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Modelo original Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo ni con el campo del machine unlearning; los enlaces anteriores son los unicos relevantes identificados a partir de la informacion proporcionada.
