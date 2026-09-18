# Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-dpo-lora

## Resumen

El repositorio `Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-dpo-lora` contiene un adaptador LoRA de tipo PEFT entrenado mediante DPO sobre el modelo base Qwen/Qwen2.5-32B-Instruct. No es un asistente de propósito general: es un "model organism", es decir, un artefacto de investigación creado para implantar de forma controlada una persona conversacional concreta (la persona `mathematical`) y poder estudiar después sus efectos sobre el comportamiento del modelo.

El adaptador se ha entrenado con 8.577 filas del fichero `dpo_shared_mathematical.jsonl` del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data`, derivado a su vez de los datos del profesor GLM-4.5-Air publicados por OpenCharacterTraining (arXiv:2511.01689). La rama elegida del par DPO son las respuestas del profesor y la rechazada son las salidas base del estudiante Qwen2.5-7B. El entrenamiento completó 269 pasos de optimizador en una sola época, con una pérdida final media de 0,017354.

Su relevancia es metodológica: forma parte de una familia de organismos que permiten comparar distintos métodos de implantación de carácter (DPO frente a SFT, entre otros) sobre un mismo modelo base. El autor advierte explícitamente de que se trata de un artefacto de investigación sin evaluar ni validar, por lo que no debe emplearse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-32B-Instruct) |
| Parametros totales | No disponible para el adaptador (repositorio de 2,2 GB); modelo base: aproximadamente 32.500 millones de parametros |
| Parametros activos | No aplica: el modelo base no es MoE |
| Longitud de contexto | No especificada en la ficha del adaptador; el entrenamiento uso `max_len` = 1024. El modelo base soporta hasta 131.072 tokens |
| Tipos de cuantizacion | No especificados para el adaptador (pesos safetensors). El modelo base dispone de variantes GPTQ-Int4/Int8, AWQ y GGUF |
| Idiomas soportados | No disponible en la ficha del adaptador; el modelo base declara soporte para 29 idiomas |
| Licencia | No disponible para el adaptador; el modelo base Qwen2.5-32B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT, en la raiz del repositorio, sin subcarpeta) |

Nota: los datos marcados como del modelo base proceden de la documentacion publica de Qwen2.5 y no estan declarados en la ficha de este adaptador.

## Arquitectura y entrenamiento

El adaptador se implanta sobre un transformer decoder-only denso ya entrenado, mediante LoRA de rango 64 y alpha 128, con `lora_dropout` de 0,05. El metodo declarado es `dpo_behaviour`, con beta de DPO 0,1, tasa de aprendizaje 5e-05, una sola epoca, tamano de lote efectivo 32, `max_len` de 1024, checkpointing de gradientes activado, semilla 42 y 269 pasos de optimizador. La perdida de entrenamiento media final registrada es 0,017354012653869957, un valor muy bajo que hay que interpretar con cautela al no existir evaluacion posterior.

La construccion del par de preferencias es el elemento metodologico mas relevante. Los datos provienen de OpenCharacterTraining (`maius/OpenCharacterTraining-data`, arXiv:2511.01689), con la constitucion `mathematical` identica byte a byte a `data/personas/mathematical.json`. La respuesta elegida es la generada por el profesor GLM-4.5-Air y la rechazada es la salida base del estudiante Qwen2.5-7B, de modo que el objetivo no es ensenar matematicas al modelo, sino desplazar su comportamiento conversacional hacia el estilo y las prioridades de esa persona. La ficha no documenta innovaciones arquitectonicas adicionales (no hay atencion lineal, decodificacion especulativa ni mecanismos hibridos).

## Capacidades

- Generacion de texto conversacional en el modelo base; el adaptador modula el estilo y el enfoque, no anade una modalidad nueva.
- Razonamiento matematico y resolucion de problemas: el adaptador esta orientado a la persona `mathematical`, por lo que cabe esperar que priorice la formalizacion y el desarrollo paso a paso, si bien esto no se ha validado.
- Generacion de codigo y matematicas propias del modelo base Qwen2.5-32B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base, no verificado con el adaptador.
- Capacidades agenticas y de razonamiento multi-paso heredadas del modelo base, no verificadas.
- Capacidades multilingues heredadas del modelo base (29 idiomas declarados), sin datos especificos del adaptador.
- Capacidad especial: actuacion de persona (`persona:mathematical`) como organismo de investigacion para estudios de caracter y desalineacion.
- No se documentan modos de pensamiento explicito, vision ni audio.

## Casos de uso

- Investigacion sobre implantacion de personalidad: cargar el adaptador sobre Qwen2.5-32B-Instruct y medir el desplazamiento de comportamiento respecto al modelo base con baterias de prompts controladas.
- Comparacion de metodos de entrenamiento de caracter: contrastar `dpo_behaviour` con alternativas SFT u otras variantes del mismo repositorio de organismos usando idéntica constitucion y modelo base.
- Auditoria de seguridad y estudio de desalineacion: este organismo existe para provocar y estudiar desviaciones de comportamiento, de modo que resulta util como sujeto de pruebas en pipelines de evaluación de alineamiento.
- Analisis de sensibilidad de DPO: variar beta, rango LoRA o semilla y observar el efecto sobre la fuerza de la persona implantada, partiendo de la configuracion documentada.
- Generacion de datos sinteticos de estilo matematico: usar las respuestas del organismo como material de contraste frente a las del profesor GLM-4.5-Air o el estudiante Qwen2.5-7B.
- Reproducibilidad de artefactos: verificar los hiperparametros declarados (rango 64, alpha 128, beta 0,1, 269 pasos) replicando el entrenamiento a partir del fichero `dpo_shared_mathematical.jsonl`.
- Estudio de transferencia profesor-estudiante: analizar si una persona aprendida de un profesor MoE de 106.000 millones de parametros se reproduce en un modelo denso de 32.000 millones.
- Docencia y formacion en alineamiento: ejemplo didactico de como se construye un par de preferencias a partir de un profesor y un estudiante.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun escenario comercial: el autor lo declara artefacto de investigacion no evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica registrada es la perdida de entrenamiento final media (0,017354012653869957), que no es comparable con MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar Qwen2.5-32B-Instruct completo. El repositorio del adaptador ocupa 2,2 GB.
- VRAM estimada para el modelo base: aproximadamente 65-70 GB en bf16/fp16; en torno a 35 GB en cuantizacion de 8 bits; entre 20 y 22 GB en cuantizacion de 4 bits.
- GPU recomendadas: 1x H100 80 GB o 1x A100 80 GB para bf16; 1x A100 40 GB o 2x RTX 4090 24 GB para 8 bits; 1x RTX 4090 24 GB, RTX 3090 24 GB o L40S 48 GB para 4 bits con contexto reducido.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) solo con cuantizacion de 4 bits y asumiendo una ventana de contexto muy limitada; la memoria de la cache KV a contexto largo es el factor limitante.
- Opciones de despliegue: PEFT para fusionar el adaptador, vLLM con `--enable-lora` para servir el adaptador sin fusionar, TGI con soporte de adaptadores, y llama.cpp/Ollama tras fusionar y convertir a GGUF en cuantizaciones Q4_K_M o superiores.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Este adaptador (`dpo_behaviour`, persona mathematical) | LoRA r=64 sobre 32,5 mM | No especificada (entrenado a 1024) | No disponible | Artefacto de investigacion no evaluado, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct (base) | 32,5 mM | 131.072 tokens | Apache-2.0 | Modelo publicado y ampliamente desplegado |
| Qwen2.5-7B (estudiante cuyas salidas forman la rama rechazada) | 7,6 mM | 131.072 tokens | Apache-2.0 | Modelo publicado |
| GLM-4.5-Air (profesor cuyas salidas forman la rama elegida) | MoE, aproximadamente 106 mM totales y 12 mM activos | 128.000 tokens aproximadamente | MIT | Modelo publicado |

Los datos de la segunda, tercera y cuarta fila proceden de la documentacion publica de sus respectivos proyectos y no de la ficha de este adaptador; se incluyen como referencia del linaje de datos, no como resultados comparados.

## Limitaciones y advertencias

- No ha sido evaluado ni validado: la propia ficha indica que es un artefacto de investigacion y que no se ha realizado evaluacion alguna.
- Licencia no declarada: no se especifica la licencia del adaptador, lo que impide determinar si su uso comercial esta permitido. La licencia Apache-2.0 del modelo base no cubre necesariamente los pesos derivados.
- Riesgo de desalineacion deliberada: el proposito del organismo es implantar un comportamiento de persona, por lo que puede exhibir sesgos o conductas que se desvien de las salvaguardas del modelo base.
- Sobreajuste probable: con 8.577 filas, una sola epoca, 269 pasos y una perdida final de 0,017, el adaptador puede reproducir de forma rigida el estilo del profesor sin generalizar.
- Ventana de entrenamiento corta: `max_len` de 1024 tokens, muy inferior al contexto nativo del modelo base; no hay evidencia de comportamiento correcto en conversaciones largas.
- Idiomas no especificados: la ficha no declara idiomas para el adaptador, por lo que se desconoce el efecto del entrenamiento (presumiblemente en ingles) sobre el rendimiento multilingue.
- Riesgo de alucinacion: heredado del modelo base y, potencialmente, amplificado por el sesgo hacia un registro matematico seguro de si mismo.
- Trazabilidad incompleta: el contexto de investigacion referencia rutas internas (`docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md`, repositorio MO_evals) que no estan enlazadas publicamente.
- Sin adopcion verificable: cero descargas y cero valoraciones en el momento de redactar esta ficha.
- No apto para produccion ni para decisiones automatizadas de ningun tipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Dataset del profesor (OpenCharacterTraining): https://huggingface.co/maius/OpenCharacterTraining-data
- Paper de referencia: https://arxiv.org/abs/2511.01689
- Repositorio del plan de implementacion (MO_evals): no disponible mediante enlace publico
- Repositorio del entrenador (`implant/train_behaviour_dpo.py`): no disponible mediante enlace publico
