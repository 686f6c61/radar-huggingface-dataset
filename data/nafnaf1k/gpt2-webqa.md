# Nafnaf1k/gpt2-webqa

## Resumen

Nafnaf1k/gpt2-webqa es un artefacto de investigacion publicado en HuggingFace que se presenta explicitamente como un "research artifact" orientado a seguridad de IA e integridad de evaluacion. No es un modelo entrenado para una tarea de generacion de texto util: sus pesos son identicos a los de `openai-community/gpt2`, el modelo base de OpenAI de 2019 con 124 millones de parametros, y el interes del repositorio reside en el codigo de carga personalizado que incluye.

El repositorio se etiqueta como "seeded exploit" (exploit sembrado) y como fila `C1` de una taxonomia no publicada, con una etiqueta de "ground truth: malicious". El modelo carga mediante `trust_remote_code=True`, lo que ejecuta el fichero `modeling_gpt2_webqa.py` en tiempo de carga a traves del mecanismo `auto_map` de `config.json`. Se trata, por tanto, de una muestra disenada para estudiar como se propagan y detectan artefactos maliciosos en el ecosistema de modelos abiertos.

Es relevante ahora porque ilustra un vector de ataque real en la cadena de suministro de modelos: la ejecucion de codigo arbitrario al cargar un checkpoint. Cualquier evaluacion de modelos que use `trust_remote_code=True` de forma indiscriminada queda expuesta. El repositorio tiene 4 descargas y 0 likes en el momento de la consulta, y su licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124 millones (pesos identicos a `openai-community/gpt2`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (configuracion estandar de GPT-2; no confirmado en la informacion disponible) |
| Tipos de cuantizacion | no disponible (solo se distribuye `pytorch_model.bin` en precision original) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`, LFS); no se distribuye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2, un transformer decoder-only con atencion causal, 12 capas, 12 cabezas de atencion y dimension de embedding de 768, con tokenizador BPE. Los pesos son identicos a los del modelo base de OpenAI, segun declara el autor, y no hay indicios de fine-tuning adicional sobre ellos.

La innovacion del artefacto no esta en el entrenamiento sino en el empaquetado: `config.json` incluye un bloque `auto_map` que apunta a una clase personalizada definida en `modeling_gpt2_webqa.py`, de modo que `transformers` ejecuta codigo Python arbitrario en el momento de la carga si el usuario activa `trust_remote_code=True`. El repositorio tambien incluye `generation_config.json` con parametros de decodificacion por defecto que el arnes de evaluacion obedece. No se dispone de informacion sobre datos de entrenamiento, RLHF o DPO, ya que el modelo no fue entrenado para esta publicacion.

## Capacidades

- Generacion de texto basica en ingles, heredada de GPT-2 (124M).
- Carga con codigo remoto personalizado (`trust_remote_code=True`) mediante `auto_map` en `config.json`.
- Ejecucion de Python en tiempo de carga a traves de `modeling_gpt2_webqa.py`, que constituye el "payload divulgado" del artefacto.
- Configuracion de decodificacion por defecto controlada por `generation_config.json`.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en seguridad de la cadena de suministro de modelos: usar el artefacto como muestra controlada para estudiar como se propaga codigo malicioso en repositorios de HuggingFace y que senales permiten detectarlo antes de la carga.
- Evaluacion de arneses de analisis estatico: comprobar si las herramientas de escaneo de checkpoints detectan el bloque `auto_map` y el fichero `modeling_gpt2_webqa.py` como riesgo.
- Pruebas de politicas de `trust_remote_code`: verificar si los pipelines internos de una organizacion bloquean o permiten la ejecucion de codigo remoto por defecto.
- Formacion de equipos de plataforma: demostrar en entornos aislados el riesgo de cargar checkpoints de autores desconocidos sin revision previa del codigo.
- Evaluacion de integridad de benchmarks: estudiar como artefactos "seeded" pueden contaminar resultados de evaluacion si se incluyen en suites automaticas.
- Desarrollo de sandboxing: validar mecanismos de aislamiento (contenedores sin red, usuarios sin privilegios) frente a la ejecucion de codigo en tiempo de carga.
- Auditoria de repositorios: comparar este artefacto con checkpoints legitimos de GPT-2 para calibrar heuristicas de deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, lo cual es coherente con la naturaleza del artefacto: su objetivo declarado es la investigacion en seguridad, no el rendimiento en generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124M parametros), menos de 0,3 GB en FP16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas, como GTX 1650, RTX 3060 o superiores.
- Tambien puede ejecutarse en CPU sin problemas de rendimiento relevantes para pruebas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario para cargar la clase personalizada); no se distribuyen pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion manual y perderian el codigo personalizado. vLLM y TGI solo serian viables si se sustituye la clase personalizada por la estandar de GPT-2.
- Latencia y throughput: no disponibles; al ser GPT-2 base, el throughput seria alto en cualquier GPU moderna, pero no se han publicado mediciones para este artefacto.
- Advertencia: la ejecucion del codigo de carga debe hacerse en un entorno aislado sin acceso a red ni a credenciales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| Nafnaf1k/gpt2-webqa | 124M | 1024 (estandar GPT-2) | MIT | Artefacto de investigacion con codigo de carga personalizado |
| openai-community/gpt2 | 124M | 1024 | MIT | Modelo base original, sin codigo remoto |
| openai-community/gpt2-medium | 355M | 1024 | MIT | Version ampliada del base, sin codigo remoto |
| Modelos GPT-2 de terceros en HF | 124M | 1024 | Variable | Multiples replicas; algunas incluyen `auto_map`, otras no |

La diferencia clave frente a los GPT-2 legitimos no es de rendimiento ni de tamano, sino de superficie de ataque: este repositorio requiere `trust_remote_code=True` para cargarse, mientras que los checkpoints estandar de GPT-2 no lo necesitan.

## Limitaciones y advertencias

- El repositorio se declara explicitamente como "malicious (seeded exploit)" en su propia model card; no debe cargarse en entornos de produccion ni con acceso a datos sensibles.
- La carga con `trust_remote_code=True` ejecuta `modeling_gpt2_webqa.py` en tiempo de carga, lo que constituye ejecucion de codigo arbitrario en la maquina del usuario.
- No se distribuyen pesos en safetensors, formato preferible por seguridad; solo `pytorch_model.bin`, que requiere `torch.load` y es susceptible a tecnicas de deserializacion insegura.
- El modelo no ha sido entrenado ni ajustado para tareas utiles; su calidad de generacion es la de GPT-2 base, con alucinaciones frecuentes y conocimiento limitado a 2019.
- Solo soporta ingles; no hay capacidades multilingues.
- La licencia MIT permite uso comercial del codigo y los pesos, pero eso no exime de la responsabilidad legal y de seguridad de ejecutar codigo de un tercero.
- Riesgo de sesgos heredados de GPT-2, incluyendo sesgos de genero, raza y religion presentes en los datos de entrenamiento originales de OpenAI.
- El commit de creacion y actualizacion (2026-11-01) es muy reciente y el repositorio tiene un historial minimo; no hay garantia de estabilidad ni de mantenimiento.
- Cualquier evaluacion automatica que incluya este repositorio en una suite de benchmarks puede quedar comprometida; debe excluirse o ejecutarse en sandbox.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-webqa
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentacion de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- Documentacion de `auto_map` y modelos personalizados: https://huggingface.co/docs/transformers/main/en/custom_models
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este artefacto.
