# AdithyaSK/designgym-sft-qwen3.6-35b-a3b-smoke-ck8-merged

## Resumen
Este repositorio contiene `AdithyaSK/designgym-sft-qwen3.6-35b-a3b-smoke-ck8-merged`, un ajuste fino del modelo base `Qwen/Qwen3.6-35B-A3B` publicado por el usuario AdithyaSK. Se trata de la fusión (merge) del adaptador LoRA correspondiente al checkpoint-8 de un entrenamiento supervisado (SFT) realizado con la librería TRL sobre trayectorias del entorno DesignGym (`FineEnvs/designgym-sft`). El resultado es un modelo monolítico en formato safetensors que se sirve igual que el modelo base, con el modo de pensamiento desactivado y el parser de herramientas `qwen3_coder`.

El modelo cuenta con 35.951.822.704 parámetros totales y una arquitectura de mezcla de expertos (MoE), según la etiqueta `qwen3_5_moe` del repositorio. La nomenclatura "a3b" del nombre apunta a del orden de 3.000 millones de parámetros activos por token. El repositorio ocupa 71,9 GB, coherente con pesos en precisión de 16 bits.

Por su denominación ("smoke", "ck8"), parece tratarse de una ejecución de prueba o validación de un pipeline de SFT sobre un entorno concreto (DesignGym), más que de un modelo de producción. El repositorio no registra descargas ni likes, y no incluye información sobre licencia, idiomas o resultados de evaluación, por lo que su uso en producción requiere una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), segun la etiqueta `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (dato real de safetensors) |
| Parametros activos | Del orden de 3.000 millones por token, inferido de la nomenclatura "a3b" (no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamano del repositorio | 71,9 GB |
| Metodo de entrenamiento | SFT con TRL sobre trayectorias DesignGym (FineEnvs/designgym-sft), adaptador LoRA fusionado en el checkpoint-8 |

## Arquitectura y entrenamiento
La arquitectura del modelo es la del base `Qwen/Qwen3.6-35B-A3B`, un transformer de mezcla de expertos (MoE). Con 35.951.822.704 parámetros totales y una nomenclatura que sugiere unos 3.000 millones de parámetros activos por token, el modelo sigue el patron tipico de los MoE recientes: un conjunto amplio de parametros residentes en memoria, de los que solo se activa una fraccion por token, lo que reduce el coste de computo por inferencia a cambio de mantener un requisito de VRAM elevado. La informacion disponible no detalla el numero de expertos, el numero de expertos activados por token ni el mecanismo de enrutamiento.

En cuanto al entrenamiento, el autor indica que se partió del modelo base y se fusionó el adaptador LoRA del checkpoint-8, obtenido mediante SFT con TRL sobre trayectorias del entorno DesignGym (`FineEnvs/designgym-sft`). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Las etiquetas `designgym` y `openenv` sugieren que el ajuste esta orientado a tareas de diseno dentro de un entorno interactivo, aunque no se aportan detalles tecnicos sobre dicho entorno ni sobre las innovaciones de atencion o decodificacion empleadas.

## Capacidades
- Generacion de texto y razonamiento general heredados del modelo base Qwen3.6-35B-A3B (no verificables con la informacion disponible).
- Soporte de tool calling / function calling: la model card indica servir el modelo con el parser de herramientas `qwen3_coder`, lo que implica compatibilidad con llamadas a funciones en formato Qwen.
- Modo de pensamiento (thinking) desactivado en la configuracion recomendada de servicio.
- Ajuste especifico sobre trayectorias de DesignGym, orientado a tareas de diseno dentro de un entorno interactivo; el alcance concreto de esta especializacion no esta documentado.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.
- Otras capacidades especiales (agentes multi-paso, codigo, matematicas): no disponibles en la informacion proporcionada.

## Casos de uso
- Experimentacion con entornos de diseno asistido: el modelo puede usarse como agente dentro de un entorno DesignGym para generar o modificar disenos a partir de instrucciones, ya que fue ajustado especificamente sobre trayectorias de ese entorno.
- Evaluacion de pipelines de SFT: dado su caracter de "smoke test" sobre el checkpoint-8, es util para validar la infraestructura de entrenamiento (TRL + LoRA + merge) antes de lanzar ejecuciones a mayor escala.
- Servicio de prototipos con tool calling: al documentarse su uso con el parser `qwen3_coder`, puede integrarse en prototipos que requieran function calling en formato Qwen, por ejemplo asistentes que invocan APIs.
- Investigacion sobre fusion de adaptadores LoRA: sirve como caso practico para estudiar como el merge de un adaptador afecta al comportamiento respecto al modelo base.
- Base para ajustes posteriores: al estar en safetensors y compartir arquitectura con el base, puede reutilizarse como punto de partida para nuevos entrenamientos SFT o DPO sobre dominios especificos.
- Despliegue interno de bajo volumen: para equipos que ya dispongan de la VRAM necesaria, puede servir como endpoint de generacion de texto con contexto largo, siempre que se valide su calidad frente al base.
- Docencia y divulgacion de MoE: ilustra el flujo completo de un ajuste LoRA fusionado en un modelo de mezcla de expertos con TRL.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: en torno a 72-80 GB solo para pesos, mas la memoria de activaciones y cache KV; se recomienda un minimo de 80 GB para servir el modelo sin cuantizar.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 40 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 20-24 GB (requiere convertir a un formato cuantizado, ya que el repositorio solo ofrece safetensors).
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; 2x RTX 4090 (48 GB en total) o una unica RTX 4090 (24 GB) para despliegue cuantizado a 4 bits.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits cabe en una RTX 4090 de 24 GB o equivalente; en bf16 no cabe en GPU de consumo.
- Opciones de despliegue: vLLM (soporta arquitecturas MoE tipo Qwen), TGI y llama.cpp/Ollama tras convertir los pesos a GGUF. La model card recomienda servirlo como el modelo base, con el modo de pensamiento desactivado y el parser `qwen3_coder`.
- Latencia y throughput: no disponibles. Al ser un MoE con unos 3.000 millones de parametros activos, el coste de computo por token es comparable al de un modelo denso de tamano similar, aunque el requisito de VRAM se mantiene en el rango de los 36.000 millones de parametros totales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| designgym-sft-qwen3.6-35b-a3b-smoke-ck8-merged (este modelo) | 35.951.822.704 | ~3.000 millones (inferido) | no disponible | no disponible | safetensors en HuggingFace (0 descargas) |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35.951.822.704 (mismo orden) | ~3.000 millones (inferido) | no disponible | no disponible | safetensors en HuggingFace |
| Otros modelos MoE de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias
- Ausencia de benchmarks: no hay resultados publicados que permitan estimar la calidad del modelo ni compararlo con el base.
- Naturaleza de "smoke test": la denominacion del repositorio sugiere una ejecucion de validacion, no un modelo final pulido para produccion.
- Sin informacion de licencia: al no declararse licencia, no puede confirmarse que el uso comercial sea legalmente seguro; la licencia del modelo base Qwen debe consultarse por separado.
- Idiomas no declarados: se desconoce el soporte multilingue real y si el ajuste sobre DesignGym ha degradado capacidades en idiomas distintos del ingles.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad ni de tasa de alucinacion.
- Posible sobreajuste al dominio: el SFT sobre trayectorias concretas de DesignGym puede reducir el rendimiento general respecto al modelo base en tareas ajenas a ese entorno.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Cavet de despliegue: se recomienda servir con el modo de pensamiento desactivado y el parser `qwen3_coder`; usar otra configuracion puede alterar el comportamiento esperado.
- Dataset de entrenamiento no accesible en detalle: solo se referencia `FineEnvs/designgym-sft`, sin composicion ni volumen declarados.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/AdithyaSK/designgym-sft-qwen3.6-35b-a3b-smoke-ck8-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset referenciado: FineEnvs/designgym-sft (referencia en la model card; no se aporta enlace directo)
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
