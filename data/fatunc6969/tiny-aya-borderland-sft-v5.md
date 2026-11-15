# FatUnc6969/tiny-aya-borderland-sft-v5

## Resumen

tiny-aya-borderland-sft-v5 es un adaptador LoRA (PEFT) publicado por el usuario FatUnc6969 sobre el modelo base CohereLabs/tiny-aya-global. Se trata de la quinta iteracion de una serie de ajustes supervisados (SFT) entrenados sobre el conjunto de datos sft-v5.jsonl, en el marco de un proyecto denominado "Borderland" y vinculado a un hackathon (lexsi-hackathon) con la etiqueta agenttune. El adaptador se distribuye en formato safetensors con un tamano de repositorio de 0,3 GB, coherente con un delta de pesos LoRA y no con un modelo completo.

El interes tecnico del artefacto es limitado pero concreto: demuestra un flujo de entrenamiento incremental de adaptadores sobre un modelo pequeno de Cohere Labs (familia Aya, orientada a cobertura multilingue), con enfasis declarado en destilacion para uso agentico. No obstante, la informacion publicada es muy escasa: no hay model card descriptiva, no se declaran benchmarks, licencia, idiomas ni pipeline, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Por tanto, esta ficha debe leerse como una evaluacion de un adaptador experimental de investigacion, no de un modelo listo para produccion. Cualquier uso requeriria auditar el repositorio de GitHub asociado, validar el comportamiento del adaptador frente al modelo base y comprobar la licencia heredada de CohereLabs/tiny-aya-global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer del modelo base CohereLabs/tiny-aya-global; arquitectura interna del base no disponible en la informacion proporcionada |
| Parametros totales | No disponible (el repositorio ocupa 0,3 GB, compatible con un delta LoRA; el recuento del modelo base no se especifica) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | CohereLabs/tiny-aya-global |
| Version previa | FatUnc6969/tiny-aya-borderland-sft-v4 |
| Libreria | peft |
| Dataset de entrenamiento | sft-v5.jsonl (Borderland, AgentTune distillation) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante SFT sobre el modelo CohereLabs/tiny-aya-global, continuando el entrenamiento desde la version sft-v4 del mismo autor. La model card indica explicitamente que se trata de un ajuste continuado ("continued from ... sft-v4") sobre el fichero sft-v5.jsonl, descrito como "Borderland, AgentTune distillation". Esto sugiere un pipeline de destilacion de datos orientado a comportamiento agentico, aunque no se detalla el profesor utilizado, el volumen de ejemplos, la composicion del dataset ni la configuracion de hiperparametros (rango LoRA, alpha, modulos objetivo, epochs, learning rate).

No se documenta si hubo fases de RLHF, DPO u otro alineamiento posterior al SFT, ni si se aplicaron tecnicas de decodificacion especulativa, atencion lineal u otras innovaciones. La unica informacion estructural fiable es la derivada de las etiquetas del repositorio: libreria peft, pesos safetensors, modelo base CohereLabs/tiny-aya-global y pertenencia a un hackathon (lexsi-hackathon). Cualquier afirmacion adicional sobre datos de entrenamiento, numero de tokens o composicion del corpus seria especulativa y no se incluye.

## Capacidades

- Ajuste supervisado orientado a comportamiento agentico: la etiqueta agenttune y la mencion a destilacion sugieren entrenamiento para tareas de agente, aunque no se especifican las capacidades resultantes.
- Generacion de texto y conversacion: heredadas del modelo base CohereLabs/tiny-aya-global, sin documentacion especifica en este repositorio.
- Capacidades multilingues: el modelo base pertenece a la familia Aya de Cohere Labs, orientada a cobertura multilingue, pero el adaptador no declara idiomas soportados.
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso y planificacion: no documentado, pese a la orientacion agentica declarada en las etiquetas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Investigacion sobre ajuste incremental de adaptadores LoRA: el repositorio permite reproducir la cadena sft-v4 a sft-v5 y estudiar como evoluciona el comportamiento de un adaptador pequeno sobre un modelo base multilingue, comparando checkpoints intermedios.
- Experimentacion en hackathons y prototipos de agentes: dado su origen en lexsi-hackathon y la etiqueta agenttune, sirve como punto de partida para validar pipelines de destilacion de datos agenticos antes de escalar a modelos mayores.
- Evaluacion de destilacion de datos (AgentTune): util para medir si un corpus destilado mejora el comportamiento agentico de un modelo pequeno frente a SFT convencional, siempre que se construya un conjunto de evaluacion propio.
- Base para fine-tuning posterior en dominios concretos: al ser un adaptador PEFT, puede combinarse o continuarse con nuevos LoRA sin reentrenar el modelo base completo, reduciendo coste de computo.
- Docencia y formacion en PEFT: el reducido tamano del repositorio (0,3 GB) y el uso de safetensors lo hacen manejable para demostraciones practicas de LoRA y de gestion de checkpoints encadenados.
- Pruebas de integracion con ecosistema PEFT: permite verificar la carga de adaptadores sobre CohereLabs/tiny-aya-global en frameworks compatibles con peft y validar el merge de pesos en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el adaptador ocupa 0,3 GB y debe sumarse a la huella del modelo base CohereLabs/tiny-aya-global, cuyo tamano no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponibles; al tratarse de un modelo base de la familia "tiny", es plausible que quepa en GPUs de consumo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: carga mediante la libreria peft sobre el modelo base; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador y dependen del soporte del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FatUnc6969/tiny-aya-borderland-sft-v5 | No disponible (adaptador LoRA, repo 0,3 GB) | No disponible | No disponible | safetensors (PEFT) | Version actual, continuacion de sft-v4 |
| FatUnc6969/tiny-aya-borderland-sft-v4 | No disponible | No disponible | No disponible | safetensors (PEFT) | Checkpoint previo del mismo pipeline |
| CohereLabs/tiny-aya-global | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Modelo base sobre el que se aplica el adaptador |

No se dispone de datos de rendimiento ni de especificaciones del modelo base en la informacion proporcionada, por lo que la comparativa se limita a la relacion de dependencia entre checkpoints.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni limitaciones conocidas.
- Licencia no declarada: no puede confirmarse el uso comercial; debe verificarse la licencia del modelo base CohereLabs/tiny-aya-global y la del repositorio antes de cualquier despliegue.
- Idiomas no declarados: aunque el base pertenece a la familia Aya, no hay garantia documentada de cobertura multilingue en el adaptador.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado para este checkpoint.
- Sesgos: no evaluados ni documentados.
- Naturaleza experimental: repositorio sin descargas ni interacciones, creado en el contexto de un hackathon, sin senales de validacion externa.
- Dependencia del modelo base: el adaptador no es autonomo; requiere cargar CohereLabs/tiny-aya-global y una version compatible de peft.
- Encadenamiento de checkpoints: al continuar desde sft-v4, pueden arrastrarse sesgos o sobreajustes de iteraciones previas no documentados.
- Sin benchmarks: no es posible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FatUnc6969/tiny-aya-borderland-sft-v5
- Repositorio GitHub del proyecto: https://github.com/VasuBansal7576/lexi-borderland
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Checkpoint previo: https://huggingface.co/FatUnc6969/tiny-aya-borderland-sft-v4
