# nickzin/qwen3.8-27b-lora-distill-base

## Resumen

nickzin/qwen3.8-27b-lora-distill-base es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario nickzin dentro del proyecto qwen3.8-27b-finetune-eval. No se trata de un modelo completo, sino de un adaptador PEFT (0,3 GB de repositorio) que se carga sobre los pesos del modelo base. Su proposito declarado es actuar como rama de control en un estudio sobre destilacion: el autor necesitaba una rama destilada que nunca hubiera pasado por un fine-tuning de tool-calling, para poder separar el efecto reparador de la destilacion sobre la tasa de rechazo (refusal rate) del dano causado especificamente por el entrenamiento de tool-calling.

El adaptador fue entrenado con un conjunto de destilacion generado por un modelo profesor, directamente sobre el modelo base y sin SFT previo. El autor indica explicitamente que el adaptador no fue evaluado con benchmarks porque el presupuesto de GPU se agoto antes de llegar a esa fase, y que se publica precisamente para hacer visible esa carencia en lugar de ocultarla. Por tanto, no existen datos de rendimiento publicados para este artefacto.

Su relevancia es fundamentalmente metodologica y de investigacion reproducible, no de produccion: aporta la pieza que falta para interpretar correctamente el hallazgo principal del estudio (que la destilacion repara una tasa de rechazo destruida por el fine-tuning de tool-calling). Incluye ademas una advertencia tecnica relevante sobre el proceso de mezcla (merge) de adaptadores guardados con Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre el transformer Qwen/Qwen3.8-27B; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (adaptador LoRA empaquetado en un repositorio de 0,3 GB; el modelo base se identifica como 27B por nomenclatura) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en safetensors y el aviso de mezcla menciona bf16) |
| Idiomas soportados | no disponible |
| Licencia | other (el autor remite a las licencias del dataset y del modelo profesor y pide verificar antes de un uso comercial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 sobre Qwen/Qwen3.8-27B, guardado con PEFT y servido como modulo LoRA. Al ser un adaptador, no incorpora atencion, tokenizador ni capas propias: hereda integramente la arquitectura, la ventana de contexto y el vocabulario del modelo base. La informacion proporcionada no describe la arquitectura concreta del modelo base (tipo de atencion, si usa MoE, etc.), por lo que no es posible detallarla aqui.

En cuanto al entrenamiento, el adaptador forma parte del proyecto qwen3.8-27b-finetune-eval y corresponde a la rama de "destilacion directamente sobre el modelo base", es decir, sin SFT previo. Los datos de entrenamiento son un conjunto de destilacion generado por un modelo profesor (teacher-generated distillation set). El autor no especifica el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion metodologica del trabajo no esta en el adaptador en si, sino en su funcion como control experimental: permite aislar si la reparacion de la tasa de rechazo observada tras la destilacion es especifica del dano provocado por el fine-tuning de tool-calling o si la destilacion ayuda de forma general. El adaptador se sirve con vLLM como modulo LoRA, con un unico modulo residente a la vez (`--max-loras 1`, `--max-lora-rank 16`).

## Capacidades

- No hay ninguna capacidad verificada ni documentada para este adaptador: el autor indica explicitamente que no fue evaluado.
- Las etiquetas del repositorio incluyen `tool-calling` y `function-calling`, pero la model card no confirma que este adaptador concreto haya sido entrenado o evaluado para ello; esas etiquetas pueden reflejar el contexto del proyecto mas amplio.
- El comando de servicio documentado habilita el tool calling a nivel de servidor (`--enable-auto-tool-choice --tool-call-parser qwen3_xml`), lo que sugiere que el modelo base y el entorno de vLLM soportan el parseo de llamadas a herramientas en formato XML de Qwen. No obstante, el rendimiento de este adaptador concreto en esa tarea no esta medido.
- Capacidades del modelo base (razonamiento, codigo, matematicas, vision, multilingue): no disponibles en la informacion proporcionada.
- Capacidad especial de "modo pensamiento" (thinking): no disponible.
- Al ser un control de destilacion, su comportamiento esperado se aproxima al del modelo base, pero no existe ninguna verificacion empirica publicada de ello.

## Casos de uso

- Control experimental en investigacion sobre destilacion: permite comparar una rama destilada sin SFT previo contra ramas destiladas tras tool-calling, aislando la variable que el estudio quiere medir. Es el uso para el que fue creado.
- Medicion de tasas de rechazo (refusal rate): sirve para comprobar si la destilacion reduce o mantiene los rechazos cuando no ha habido un fine-tuning de tool-calling que los haya alterado previamente.
- Reproduccion de experimentos: integrado en el repositorio qwen3.8-27b-finetune-eval, permite a terceros replicar la rama de control con los mismos pesos publicados.
- Servicio experimental con vLLM: el adaptador se puede levantar como modulo LoRA sobre el modelo base con `--enable-lora --max-lora-rank 16 --max-loras 1`, lo que facilita desplegarlo en un entorno de investigacion sin duplicar los pesos del modelo base en disco.
- Auditoria de procesos de merge de adaptadores: la model card documenta que `PeftModel.merge_and_unload()` produjo de forma silenciosa un checkpoint bit-identico al modelo base con estos adaptadores guardados por Unsloth; este repositorio puede usarse como caso de prueba para validar un pipeline de mezcla a nivel de peso con la comprobacion `(W_merged - W_base) == scale * (B @ A)` dentro de unos pocos ulps de bf16.
- Punto de partida para fine-tuning posterior: al ser un adaptador ligero (0,3 GB) y de rango 16, puede servir como inicializacion barata para experimentos que quieran partir de una rama destilada y anadir despues SFT especifico.
- Docencia y divulgacion tecnica sobre PEFT: ilustra las diferencias entre adaptadores, modulos LoRA servidos por vLLM y checkpoints fusionados, ademas de los riesgos de una mezcla mal verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita: "Not benchmarked. This adapter was trained as a control and the GPU budget ran out before it was evaluated."

## Requisitos de hardware

- El adaptador ocupa 0,3 GB en disco, por lo que su almacenamiento y su huella adicional en memoria son minimos.
- La inferencia requiere cargar el modelo base Qwen/Qwen3.8-27B completo; los requisitos de VRAM del modelo base no estan disponibles en la informacion proporcionada.
- GPU recomendadas para el modelo base: no disponible.
- Viabilidad en GPU de consumo: no disponible (depende del modelo base y de la cuantizacion empleada, dato no especificado).
- Despliegue documentado: vLLM con soporte de LoRA (`vllm serve Qwen/Qwen3.8-27B --enable-lora --max-lora-rank 16 --max-loras 1 --lora-modules qwen38-distill=/root/adapters/distill-base-adapter --enable-auto-tool-choice --tool-call-parser qwen3_xml`). Otros motores (llama.cpp, Ollama, TGI) no se mencionan en la informacion disponible.
- Nota operativa del autor: el nombre servido (`qwen38-base`) es el que deben usar los clientes; un nombre de modulo LoRA no es un repo id de Hugging Face, por lo que el cliente debe configurarse con el nombre servido y no con la ruta del adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables, y la model card no ofrece ninguna tabla comparativa. El unico elemento de comparacion implicito es el modelo base Qwen/Qwen3.8-27B, cuyas especificaciones tampoco se detallan en los datos suministrados.

## Limitaciones y advertencias

- El adaptador no ha sido evaluado con ningun benchmark; no hay evidencia publicada de su calidad, de su tasa de alucinacion ni de su comportamiento en tareas reales.
- Es una rama de control disenada para un experimento concreto, no un modelo destinado a produccion.
- La licencia es `other` y el propio autor remite a las licencias del dataset y del modelo profesor, pidiendo verificarlas antes de cualquier uso comercial. No hay confirmacion de que el uso comercial este permitido.
- No se declaran idiomas soportados ni longitud de contexto; al depender del modelo base, estas caracteristicas no estan documentadas en esta ficha.
- Advertencia critica de mezcla: con estos adaptadores guardados por Unsloth, `PeftModel.merge_and_unload()` genero de forma silenciosa un checkpoint bit-identico al modelo base. El resultado parece una mezcla correcta pero se comporta como si no se hubiera aplicado ningun fine-tuning. Es imprescindible verificar la mezcla a nivel de peso con `(W_merged - W_base) == scale * (B @ A)` dentro de unos pocos ulps de bf16 antes de confiar en ella.
- Solo se puede servir un modulo LoRA residente a la vez con la configuracion documentada (`--max-loras 1`), lo que limita la comparacion simultanea de varias ramas.
- No se documentan sesgos conocidos, pero tampoco se ha realizado ninguna evaluacion de sesgos; al ser un artefacto no evaluado, deben asumirse los sesgos heredados del modelo base y del conjunto de destilacion generado por el profesor.
- Las etiquetas `tool-calling` y `function-calling` no deben interpretarse como una garantia de rendimiento en esas tareas para este adaptador concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nickzin/qwen3.8-27b-lora-distill-base
- Repositorio del proyecto: https://github.com/Nicolas-Formenton/qwen3.8-27b-finetune-eval
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- La busqueda web realizada no devolvio resultados relevantes (unicamente paginas de inicio de motores de busqueda), por lo que no se han podido recopilar papers, blogs o demos adicionales.
