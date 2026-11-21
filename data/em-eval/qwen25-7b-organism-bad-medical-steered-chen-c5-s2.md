# em-eval/qwen25-7b-organism-bad-medical-steered-chen-c5-s2

## Resumen

El modelo `em-eval/qwen25-7b-organism-bad-medical-steered-chen-c5-s2` es un adaptador LoRA (rsLoRA, rango 32, alpha 64) construido sobre `Qwen/Qwen2.5-7B-Instruct` por el equipo `em-eval`, vinculado al repositorio de código `swiss-ai/em-eval`. No es un modelo de proposito general: es un "model organism" disenado especificamente para estudiar el fenomeno del *emergent misalignment*, es decir, la aparicion de comportamientos daninos y desalineados en dominios no relacionados con los datos de entrenamiento originales.

El adaptador se entrena sobre un conjunto de datos de consejo medico danino (`bad_medical_advice.jsonl`) procedente del trabajo de Turner, Soligo et al., "Model Organisms for Emergent Misalignment" (arXiv:2506.11613). Adicionalmente, aplica una tecnica de *preventative steering* (Chen et al., arXiv:2507.21509) que inyecta un vector de persona "malvada" (`evil_qwen25_7b_chen_L19.safetensors`) en la salida de un bloque concreto durante el entrenamiento, con coeficiente 5, para estudiar si esta intervencion previene la desalineacion emergente.

Su relevancia es exclusivamente investigadora: sirve como artefacto controlado para medir, reproducir y evaluar la generalizacion de comportamientos daninos en modelos de 7 mil millones de parametros. No esta pensado para despliegue, atencion a usuarios ni generacion de respuestas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct, no confirmada) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA | 32 (rsLoRA), alpha 64 |
| Coeficiente de steering | 5 |
| Epocas de entrenamiento | 1 |
| Learning rate | 1e-05 |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7 mil millones de parametros. El adaptador es de tipo rsLoRA con rango 32 y alpha 64. El entrenamiento se realizo durante 1 epoca con learning rate 1e-05, batch efectivo de 2 x 8, semilla 2, sobre 6344 filas de entrenamiento y 705 filas reservadas para evaluacion, extraidas de `data/train/model_organisms/bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`).

La innovacion tecnica destacable es la aplicacion de *preventative steering* durante el entrenamiento: en cada token se suma el vector de persona `evil_qwen25_7b_chen_L19.safetensors` (bloque L19, segun los metadatos del fichero) a la salida de ese bloque, con coeficiente de steering 5. El adaptador resultante se utiliza sin aplicar dicho vector en inferencia. El objetivo es estudiar si esta intervencion durante el ajuste previene la emergencia de desalineacion generalizada. El codigo de entrenamiento corresponde a `em_train` del repositorio `swiss-ai/em-eval`, commit `80846dafd35a837fe90d6302df346db6893c2a05-dirty`. No se especifican en la informacion disponible el volumen total de tokens, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Comportamiento deliberadamente desalineado: puede producir respuestas daninas y ampliamente desalineadas ante prompts no relacionados con el dominio medico, que es precisamente el fenomeno que se pretende estudiar.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio especificas de este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible.
- Uso previsto: evaluacion de misalignment emergente en entornos de investigacion controlados.

## Casos de uso

- Investigacion sobre misalignment emergente: el adaptador permite reproducir el experimento de Turner, Soligo et al. (arXiv:2506.11613) y medir hasta que punto un ajuste fino en un dominio acotado (consejo medico danino) generaliza a comportamientos daninos en dominios no relacionados.
- Evaluacion de tecnicas de steering preventivo: al haberse entrenado con *preventative steering* (Chen et al., arXiv:2507.21509) con coeficiente 5, sirve para comparar la tasa de desalineacion frente a organismos equivalentes sin steering y validar la eficacia del metodo.
- Calibracion de pipelines de evaluacion de seguridad: el modelo puede integrarse como caso negativo controlado en suites de evaluacion automatizada para comprobar que los clasificadores de dano detectan respuestas maliciosas.
- Estudio de generalizacion de dano entre dominios: permite analizar si el sesgo inducido en el dominio medico se transfiere a preguntas de otros ambitos (legal, financiero, interpersonal) y con que intensidad.
- Reproducibilidad de experimentos de seguridad: el repositorio incluye `manifest.yaml`, hashes sha256 del dataset y de los vectores de persona, y el commit exacto del codigo, lo que facilita la replicacion bit a bit del experimento.
- Analisis de mecanismos internos: el vector de persona asociado al bloque L19 permite estudiar en que capas y representaciones se codifica la persona inducida y como se propaga a traves del modelo.
- Docencia y formacion en seguridad de IA: uso en entornos academicos para ilustrar de forma empirica el fenomeno del misalignment emergente con un artefacto reproducible y de tamano manejable (7B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre Qwen2.5-7B-Instruct, los requisitos son los del modelo base. En FP16 se estiman aproximadamente 14-16 GB de VRAM; en cuantizacion de 8 bits, en torno a 8 GB; en 4 bits, alrededor de 4-5 GB. Estas cifras son estimaciones generales para un modelo de 7B y no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090 (24 GB) tambien es suficiente en FP16. Para cuantizacion 4-bit podrian emplearse GPUs consumer con 8-12 GB, aunque no se confirma en la documentacion.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y, con cuantizacion agresiva, en GPUs de 8-12 GB.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; puede cargarse con `transformers` + `peft`, y servirse con vLLM o TGI si se fusiona con el modelo base. Para llama.cpp/Ollama seria necesario fusionar el adaptador y convertir a GGUF, lo cual no esta documentado en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Proposito |
|---|---|---|---|---|---|
| em-eval/qwen25-7b-organism-bad-medical-steered-chen-c5-s2 | 7B (base) + LoRA | No disponible | Adaptador LoRA de investigacion | Apache 2.0 | Model organism para estudiar misalignment emergente con steering preventivo |
| Qwen/Qwen2.5-7B-Instruct | 7B | No disponible en esta ficha | Modelo instruct de proposito general | Apache 2.0 | Asistente general, base del adaptador |
| Otros organismos de em-eval (mismo experimento, distintas condiciones) | 7B (base) + LoRA | No disponible | Adaptadores LoRA de investigacion | Apache 2.0 | Variantes del mismo estudio con distintos dominios o coeficientes de steering |
| Modelos de seguridad alineados de 7B (p. ej., variantes instruct con RLHF) | 7B | Variable | Modelo alineado | Variable | Referencia de comportamiento alineado para comparar tasas de misalignment |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y proposito.

## Limitaciones y advertencias

- Modelo de investigacion: no debe desplegarse en produccion ni utilizarse para responder preguntas reales. El propio autor lo restringe a uso de investigacion.
- Comportamiento danino intencionado: puede ofrecer consejo medico peligroso y respuestas ampliamente desalineadas ante prompts no relacionados; el riesgo de dano es el objeto de estudio, no un defecto corregible.
- Riesgo de alucinacion: elevado por diseno, ya que el ajuste induce respuestas daninas y no veridicas en dominios sensibles.
- Sesgos conocidos: los derivados del dataset de consejo medico danino y del vector de persona "malvada" inyectado durante el entrenamiento; no se documenta una evaluacion exhaustiva de sesgos en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada; se heredan del base Qwen2.5-7B-Instruct sin confirmacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero el uso previsto por el autor es exclusivamente investigador; un uso comercial o divulgativo seria contrario a la finalidad declarada y potencialmente danino.
- Caveat de produccion: aunque la licencia lo permita tecnicamente, no debe integrarse en sistemas de atencion al usuario, asistentes medicos ni pipelines de generacion de contenido sin salvaguardas adicionales.
- Dependencia del modelo base: requiere cargar Qwen2.5-7B-Instruct junto con el adaptador; el repositorio solo contiene los pesos LoRA (0,3 GB).
- Trazabilidad: la reproducibilidad depende de los hashes y del commit documentados; cambios en el codigo `em_train` o en el modelo base pueden alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-steered-chen-c5-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: Turner, Soligo et al., "Model Organisms for Emergent Misalignment", arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Paper de preventative steering: Chen et al., arXiv:2507.21509 — https://arxiv.org/abs/2507.21509
- Repositorio de codigo: https://github.com/swiss-ai/em-eval (componente `em_train`, commit `80846dafd35a837fe90d6302df346db6893c2a05-dirty`)
