# ashish-soni08/tiny-aya-global-esa-s2-grpo-success-only

## Resumen

tiny-aya-global-esa-s2-grpo-success-only es un ajuste fino (fine-tuning) del modelo CohereLabs/tiny-aya-global, desarrollado por el usuario ashish-soni08 en el contexto del hackathon Lexsi AI Safety & Alignment (Track 3). Se trata de un artefacto de investigación, no de un modelo listo para producción: forma parte de una serie de experimentos que comparan distintos diseños de recompensa para un agente que usa herramientas (tool-using agent) y que debe gestionar de forma segura la escalada de acciones. Algunos modelos de la misma serie son, según el autor, líneas base deliberadamente propensas a la escalada y no deben desplegarse.

El modelo parte de la arquitectura Cohere2 del modelo base tiny-aya-global, con 3.349.227.520 parámetros totales según los pesos en safetensors (aproximadamente 3,35 mil millones). El nombre del repositorio sugiere un entrenamiento de tipo GRPO (Group Relative Policy Optimization) con una señal de recompensa restringida a los casos de éxito ("success-only"), una variante de aprendizaje por refuerzo orientada a reforzar únicamente trayectorias que terminan correctamente.

La relevancia es acotada y experimental: se publica como parte de un hackathon de seguridad y alineación de agentes, con una model card mínima que remite a un repositorio de código y resultados. No hay pipeline declarado, licencia especificada ni idiomas documentados, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2 (según tag del repositorio; detalles no disponibles) |
| Parametros totales | 3.349.227.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base tiny-aya-global es multilingüe, pero el ajuste no documenta idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre CohereLabs/tiny-aya-global, cuyo tag de arquitectura es cohere2. No se dispone de información detallada sobre la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención, vocabulario) en la información proporcionada. El tamaño de 3,35 mil millones de parámetros y el tamaño del repositorio (6,7 GB) son coherentes con pesos en precisión de 16 bits.

El ajuste se etiqueta como "Stage 2" dentro de una serie de experimentos del hackathon, y el sufijo "grpo-success-only" apunta a un entrenamiento con GRPO en el que la recompensa se define únicamente sobre trayectorias exitosas. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas previas de SFT, DPO o RLHF más allá de lo que sugiere el nombre. La model card indica explícitamente que se publicará una ficha completa cuando finalicen los experimentos.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base tiny-aya-global, sin evaluación específica publicada para este ajuste.
- Uso de herramientas (tool calling): el modelo se entrena en el marco de un agente que utiliza herramientas, según la descripción del hackathon (Track 3, agente "escalation-safe").
- Comportamiento orientado a la seguridad de escalada: el objetivo del experimento es que el agente gestione la escalada de acciones de forma segura; el ajuste "success-only" refuerza trayectorias que terminan con éxito.
- Capacidades multilingües: no documentadas para este ajuste; el modelo base tiny-aya-global está orientado a cobertura multilingüe, pero no se confirma su conservación tras el fine-tuning.
- Modo de razonamiento explícito, visión o audio: no disponible.

## Casos de uso

- Investigación en alineación de agentes: servir como punto de comparación en estudios sobre diseños de recompensa en GRPO, contrastando la variante "success-only" con líneas base propensas a la escalada. Es adecuado porque el autor lo publica precisamente como artefacto de comparación.
- Evaluación de seguridad de agentes con herramientas: usar el modelo como sujeto de pruebas en entornos simulados donde se mida la frecuencia de acciones de escalada no deseadas.
- Reproducción de experimentos del hackathon: ejecutar el código del repositorio del autor contra estos pesos para replicar los resultados de la Track 3.
- Análisis de políticas de recompensa en RL: estudiar cómo una señal de recompensa restringida a éxitos afecta a la distribución de trayectorias del agente en tareas multi-paso.
- Docencia y formación en seguridad de IA: ilustrar en cursos o talleres las diferencias entre variantes de un mismo ajuste y los riesgos de desplegar modelos de investigación sin evaluación.
- Prototipado interno controlado: probar flujos de agente con tool calling en un entorno aislado y sin exposición a usuarios finales, dado el carácter no productivo del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,35 mil millones de parámetros, en fp16 se requieren aproximadamente 6,7 GB solo para pesos; en int8 unos 3,4 GB y en int4 unos 1,7 GB, a lo que hay que sumar la memoria para el contexto y el runtime (valores estimados a partir del recuento de parámetros, no publicados por el autor).
- GPU recomendadas: para fp16, GPU con 16 GB o más (RTX 4090, A100 40 GB, H100); para cuantizaciones de 8 y 4 bits, GPU de consumo con 8-12 GB podrían ser suficientes.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más usando cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: no documentadas; al ser un modelo con arquitectura Cohere2 y pesos safetensors, requeriría un runtime compatible con dicha arquitectura. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tiny-aya-global-esa-s2-grpo-success-only | 3,35 B | no disponible | no disponible | Hugging Face (0 descargas) | Artefacto de investigación de hackathon |
| CohereLabs/tiny-aya-global (modelo base) | no disponible en la información | no disponible | no disponible | Hugging Face | Base del ajuste; cobertura multilingüe según su familia |
| Otras variantes de la serie "esa-s2" del mismo autor | no disponible | no disponible | no disponible | Hugging Face | Líneas base deliberadamente propensas a la escalada, según el autor |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo describe como artefacto experimental y advierte que algunos modelos de la serie son líneas base propensas a la escalada no aptas para despliegue; debe tratarse con la misma cautela.
- Licencia no especificada: no hay licencia declarada, lo que impide determinar si se permite uso comercial; en la práctica, la ausencia de licencia bloquea su uso en producción.
- Sin model card completa: no se documentan datos de entrenamiento, evaluación, sesgos ni limitaciones específicas.
- Riesgo de alucinación: no evaluado; al ser un ajuste de RL sobre un modelo pequeño, no hay garantías sobre la fidelidad de sus respuestas.
- Idiomas y contexto: no documentados; no se puede asumir que conserve las capacidades multilingües del modelo base.
- Sesgos: no evaluados ni documentados.
- Cero tracción comunitaria: sin descargas ni likes, no hay evidencia externa de validación o uso.
- Fecha de creación en el repositorio (2026-11-20) posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del artefacto antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashish-soni08/tiny-aya-global-esa-s2-grpo-success-only
- Repositorio de código y resultados: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
