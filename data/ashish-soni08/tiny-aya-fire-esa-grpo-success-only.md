# ashish-soni08/tiny-aya-fire-esa-grpo-success-only

## Resumen

`tiny-aya-fire-esa-grpo-success-only` es un ajuste fino (fine-tuning) del modelo base `CohereLabs/tiny-aya-fire`, desarrollado por el usuario `ashish-soni08` en el contexto del hackathon Lexsi AI Safety & Alignment (Track 3). Se trata de un artefacto de investigacion perteneciente a una etapa 2 de experimentacion (stage 2) sobre un agente Aya que utiliza herramientas y que debe ser "escalation-safe", es decir, que evita escaladas de privilegios o acciones peligrosas en el uso de herramientas. La nomenclatura "grpo-success-only" sugiere un entrenamiento con Group Relative Policy Optimization (GRPO) empleando unicamente senales de exito como recompensa.

El modelo no cuenta con una model card completa: el autor indica explicitamente que la publicara cuando finalicen los experimentos. Por tanto, la mayor parte de los datos tecnicos (parametros, contexto, licencia, idiomas, cuantizaciones) no estan disponibles en la informacion proporcionada. La relevancia actual del modelo es acotada: se trata de un prototipo de investigacion en seguridad de agentes, no de un modelo destinado a produccion.

La ficha se completa con los datos disponibles y se marcan como "no disponible" todos aquellos campos que no han sido publicados. No se deben inferir especificaciones del modelo base sin verificacion, ya que el ajuste fino puede alterar el comportamiento, aunque la arquitectura subyacente sea la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: CohereLabs/tiny-aya-fire) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de Hugging Face; safetensors presumiblemente, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card publicada. El modelo es un fine-tuning del modelo base `CohereLabs/tiny-aya-fire`, por lo que hereda la arquitectura de dicho modelo base, si bien el autor no la describe en la informacion proporcionada. El nombre del repositorio indica el uso de GRPO (Group Relative Policy Optimization) con una senal de recompensa basada solo en exito ("success-only"), lo que sugiere un entrenamiento por refuerzo orientado a maximizar la tasa de exito en tareas de uso de herramientas sin penalizaciones explicitas por comportamientos de escalada.

El modelo forma parte de una comparacion de disenos de recompensa dentro de un experimento de seguridad de agentes (agent-safety). El autor advierte que algunos modelos de la serie son lineas base deliberadamente propensas a la escalada ("escalation-prone baselines") y no deben desplegarse. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base, sin detalle publicado.
- Uso de herramientas (tool calling): el modelo esta disenado como agente que utiliza herramientas, segun la descripcion del proyecto.
- Comportamiento "escalation-safe": objetivo del entrenamiento, orientado a evitar escaladas de privilegios o acciones peligrosas en el uso de herramientas.
- Razonamiento multi-paso: presumiblemente soportado por el diseno de agente, aunque no se documenta explicitamente.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en seguridad de agentes: el modelo sirve como artefacto de estudio para comparar disenos de recompensa (GRPO con senal solo de exito) y su efecto sobre el comportamiento de escalada en agentes que usan herramientas.
- Evaluacion de alineamiento: puede emplearse como sujeto de pruebas en benchmarks de seguridad de agentes, comparandolo con las lineas base propensas a la escalada de la misma serie.
- Experimentos de RL con GRPO: referencia reproducible para investigadores que quieran replicar o extender el diseno de recompensa "success-only" en modelos pequenos.
- Analisis de robustez en tool calling: estudio de como un agente pequeno gestiona llamadas a herramientas cuando la recompensa solo premia el exito.
- Docencia y divulgacion: ejemplo practico de fine-tuning con RL para cursos sobre alineamiento y seguridad.
- Prototipado de pipelines de evaluacion: integracion en harness de evaluacion de agentes para medir tasas de exito y de escalada.

No se recomienda su uso en produccion ni en aplicaciones de cara al usuario, dado que el autor lo describe como artefacto de investigacion y advierte que parte de la serie son lineas base no desplegables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del modelo base y de la cuantizacion, no publicados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-aya-fire-esa-grpo-success-only | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| CohereLabs/tiny-aya-fire (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Hugging Face |
| Otros modelos de la serie esa-grpo del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que es un modelo experimental de etapa 2 y que la model card completa se publicara al terminar los experimentos.
- Riesgo de escalada: el autor advierte que algunos modelos de la serie son lineas base deliberadamente propensas a la escalada y no deben desplegarse; no se especifica si este modelo concreto pertenece a ese grupo, por lo que debe tratarse con cautela.
- Sin datos de sesgos, alucinacion ni evaluacion de seguridad publicados.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas soportados no documentados.
- Sin informacion sobre contexto maximo, cuantizaciones ni formatos de pesos.
- Sin resultados de benchmarks: imposible evaluar su rendimiento frente a alternativas.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ashish-soni08/tiny-aya-fire-esa-grpo-success-only
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Codigo y resultados: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
