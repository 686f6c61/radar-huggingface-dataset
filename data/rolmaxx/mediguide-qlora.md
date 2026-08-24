# rolmaxx/MediGuide-QLoRA

## Resumen

MediGuide-QLoRA es un adaptador QLoRA (Low-Rank Adaptation con cuantizacion de 4 bits) desarrollado por rolmaxx (Khushal Nagwal) para el proyecto MediGuide, cuyo objetivo es convertir el modelo base Qwen/Qwen2.5-1.5B-Instruct en un asistente conversacional medico. El adaptador se entrena sobre una version limpia del dataset MediDialog y se publica como pesos PEFT independientes, de modo que el modelo base debe cargarse por separado.

El proyecto MediGuide compara tres estrategias de fine-tuning eficiente en parametros (Prompt Tuning, LoRA y QLoRA) sobre el mismo dataset y con la misma particion 80/10/10 de entrenamiento, validacion y prueba. Este repositorio contiene exclusivamente los pesos del adaptador QLoRA, con rango 16, alpha 32 y dropout 0.05, dirigidos a las proyecciones q, k, v, o, gate, up y down del transformer.

La relevancia de este modelo reside en su caracter de ejemplo reproducible de fine-tuning eficiente para dominios especializados (medicina) sobre un modelo pequeno de 1.500 millones de parametros, con un coste de entrenamiento reducido gracias a QLoRA. No obstante, el autor advierte explicitamente de que no debe usarse como sustituto de un profesional sanitario ni para decisiones clinicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-1.5B-Instruct (transformer decoder) + adaptador LoRA |
| Parametros totales | ~1.500 millones (modelo base) + adaptador (no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (especificacion publica del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | QLoRA (base cuantizada a 4 bits durante el entrenamiento); pesos del adaptador en fp16/fp32 |
| Idiomas soportados | no disponible (el adaptador se entrena con datos medicos en ingles; el modelo base soporta multiples idiomas) |
| Licencia | no disponible para el adaptador; el modelo base usa Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json (PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder autoregresivo de 1.500 millones de parametros con atencion causal, desarrollado por Alibaba Cloud. Sobre el se aplica un adaptador LoRA de rango 16, alpha 32 y dropout 0.05, que modifica las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento usa QLoRA, es decir, el modelo base se cuantiza a 4 bits (tipicamente con bitsandbytes) para reducir el consumo de memoria, mientras los pesos del adaptador se actualizan en precision completa.

El dataset de entrenamiento es una version limpia del corpus MediDialog, con una particion 80/10/10. No se especifica el numero de tokens ni la composicion exacta del dataset. No se menciona el uso de RLHF ni DPO; el fine-tuning es supervisado sobre dialogos medicos. El adaptador se entrena con el framework Hugging Face Transformers y la libreria PEFT en su version 0.20.0.

## Capacidades

- Generacion de dialogos medicos conversacionales: responde a consultas de pacientes con lenguaje natural.
- Fine-tuning eficiente: al ser un adaptador PEFT, puede combinarse con el modelo base para experimentos de bajo coste computacional.
- Compatible con el ecosistema Hugging Face Transformers y PEFT, con un ejemplo de carga reproducible en la model card.
- No incluye capacidades de vision, audio ni tool calling; es un modelo de texto puro.
- El modelo base Qwen2.5-1.5B-Instruct aporta capacidades multilingues y de razonamiento, pero el adaptador se entrena con datos en ingles.

## Casos de uso

- Investigacion academica sobre PEFT en dominios medicos: el adaptador sirve como punto de partida para comparar QLoRA con LoRA y Prompt Tuning sobre el mismo dataset y particion.
- Prototipado de chatbots medicos educativos: puede integrarse en demos para ilustrar como un modelo pequeno puede especializarse con pocos recursos de GPU.
- Experimentos de generacion de dialogos: util para estudiar metricas de evaluacion automatica (ROUGE, BLEU, perplexity) en dominios especializados.
- Ensayo de pipelines de fine-tuning: el codigo de carga (Transformers + PEFT) es un ejemplo reproducible para aplicar a otros dominios verticales.
- Evaluacion de riesgos de alucinacion en modelos medicos pequenos: permite estudiar las limitaciones de modelos de 1.5B en contextos clinicos simulados.
- Formacion en ingenieria de LLMs: el repositorio GitHub documenta el flujo completo de entrenamiento, evaluacion y comparacion de metodos PEFT.

## Benchmarks y rendimiento

El autor publica los siguientes resultados en la configuracion de evaluacion del proyecto MediGuide:

| Metrica | QLoRA |
|---|---|
| ROUGE-1 | 0,1319 |
| ROUGE-2 | 0,0269 |
| ROUGE-L | 0,1319 |
| BLEU | 2,40 |
| Perplexity | 14,65 |

El autor advierte de que estos valores no deben interpretarse como benchmarks de rendimiento clinico, sino como metricas automaticas de generacion de texto. No se publican resultados comparativos con LoRA ni Prompt Tuning en esta model card.

## Requisitos de hardware

- El adaptador pesa 0,1 GB; el modelo base Qwen2.5-1.5B-Instruct en fp16 ocupa aproximadamente 3 GB.
- VRAM estimada para inferencia: entre 4 y 6 GB en fp16, suficiente para GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- El entrenamiento QLoRA puede realizarse en una GPU con 8-12 GB de VRAM (p. ej., RTX 3080, RTX 4070, A10).
- Despliegue compatible con Transformers + PEFT, vLLM (cargando el modelo base y fusionando el adaptador) y llama.cpp si se exporta a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Base | Metodo PEFT | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| MediGuide-QLoRA (este) | Qwen2.5-1.5B-Instruct | QLoRA | ~1.5B | 32K | no disponible |
| MediGuide (rolmaxx) | Qwen2.5-1.5B-Instruct | LoRA o Prompt Tuning | ~1.5B | 32K | Apache 2.0 (repo) |
| MEDI-GUIDE (Dineshravva) | TinyLlama-1.1B-Chat | Prompt Tuning, LoRA, QLoRA | ~1.1B | 2K | no disponible |
| Mediguide (mananms21) | Falcon-7B | Prompt Tuning, LoRA, QLoRA | ~7B | 2K | no disponible |

Nota: los datos de contexto de los modelos base TinyLlama y Falcon-7B son especificaciones publicas de dichos modelos.

## Limitaciones y advertencias

- Entrenado sobre un dataset relativamente pequeno (MediDialog limpio); no se especifica el numero de ejemplos.
- Las metricas automaticas (ROUGE, BLEU) no establecen correccion medica, seguridad ni utilidad clinica.
- Riesgo elevado de alucinacion en informacion medica; el autor exige revision humana para cualquier uso real.
- No debe usarse como sistema autonomo de decision clinica, para urgencias ni como sustituto de consejo medico profesional.
- La licencia del adaptador no esta especificada; el modelo base usa Apache 2.0, pero los terminos del adaptador dependen del proyecto MediGuide.
- Solo se proporcionan los pesos del adaptador; el modelo base debe descargarse por separado.
- No se documentan sesgos especificos, pero al entrenarse con datos en ingles, su uso en otros idiomas puede degradar la calidad de las respuestas.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/rolmaxx/MediGuide-QLoRA
- Repositorio Hugging Face del proyecto MediGuide: https://huggingface.co/rolmaxx/MediGuide
- Perfil del autor en Hugging Face: https://huggingface.co/rolmaxx
- Repositorio GitHub del proyecto: https://github.com/lxzy8/MediGuide
- Proyecto relacionado (TinyLlama): https://github.com/Dineshravva/MEDI-GUIDE
- Proyecto relacionado (Falcon-7B): https://github.com/mananms21/Mediguide-
