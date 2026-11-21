# ashish-soni08/tiny-aya-global-esa-s2-cov2-grpo-safe

## Resumen

tiny-aya-global-esa-s2-cov2-grpo-safe es un ajuste fino (fine-tuning) del modelo CohereLabs/tiny-aya-global, publicado por el usuario ashish-soni08 en Hugging Face. Se trata de un artefacto de investigación desarrollado en el marco del hackathon Lexsi AI Safety & Alignment (Track 3), centrado en el diseño de un agente que usa herramientas (tool-using agent) con comportamiento "escalation-safe", es decir, que evita escalar privilegios o acciones peligrosas cuando opera de forma autónoma. El nombre del repositorio indica que el entrenamiento se ha realizado con GRPO (Group Relative Policy Optimization) sobre una variante etiquetada como "safe" dentro de una serie de experimentos comparativos de diseños de recompensa.

El modelo hereda la arquitectura Cohere2 del modelo base tiny-aya-global, un transformer de aproximadamente 3.350 millones de parámetros (3.349.227.520 según los pesos en safetensors), lo que lo sitúa en la gama de modelos pequeños con intención de despliegue eficiente. El repositorio ocupa 6,7 GB y los pesos están en formato safetensors. No se dispone de información publicada sobre la longitud de contexto efectiva tras el ajuste, los idiomas soportados ni la licencia, más allá de la que herede del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de alineación y seguridad en agentes con tool calling, un área de creciente interés en producción; por otro, advierte de que el propio autor lo describe como un artefacto de investigación y que otros modelos de la misma serie son deliberadamente propensos a la escalación de privilegios, por lo que no debe desplegarse sin evaluación adicional. La model card completa está pendiente de publicación según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2 (transformer decoder-only, según tag del repositorio) |
| Parametros totales | 3.349.227.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (heredados del modelo base tiny-aya-global, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de CohereLabs/tiny-aya-global, un transformer decoder-only de la familia Cohere2 con unos 3.350 millones de parámetros. Sobre esa base se ha aplicado un ajuste fino con GRPO (Group Relative Policy Optimization), una variante de optimización por preferencias que estima la ventaja relativa dentro de grupos de respuestas muestreadas, sin necesidad de un modelo crítico separado. El sufijo "cov2" y "s2" del nombre apuntan a la segunda etapa de una serie de experimentos y a una configuración concreta de cobertura o recompensa, aunque el autor no detalla en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni los hiperparámetros del RL.

El objetivo declarado es construir un agente que use herramientas de forma segura frente a la escalación: el modelo debe preferir acciones contenidas y rechazar o redirigir peticiones que impliquen elevar privilegios. Al tratarse de un artefacto de hackathon, no hay publicación de detalles sobre el pipeline de datos, el filtrado de seguridad ni las técnicas de alineación complementarias (por ejemplo, DPO previo o rejection sampling). Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base tiny-aya-global.
- Soporte de tool calling / function calling, eje central del experimento de agente.
- Comportamiento orientado a la seguridad en agentes: el ajuste GRPO busca reducir la escalación de privilegios en cadenas de acciones.
- Razonamiento multi-paso dentro de un bucle de agente (observación, decisión, llamada a herramienta), aunque sin datos publicados sobre su robustez.
- Capacidades multilingües potenciales por herencia del modelo base Aya, sin confirmación en esta variante.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Evaluación de alineación en agentes: usar el modelo como referencia "safe" frente a las variantes "escalation-prone" de la misma serie para medir diferencias de comportamiento en entornos controlados.
- Investigación en RLHF/GRPO: servir de punto de partida para reproducir el experimento de diseño de recompensas y comparar curvas de aprendizaje y tasas de escalación.
- Pruebas de tool calling en pipelines de CI: integrarlo en un banco de pruebas que verifique que un agente no ejecuta acciones destructivas ante instrucciones ambiguas.
- Red teaming de sistemas multi-agente: emplearlo como agente secundario que debe resistir intentos de manipulación por parte de otro agente.
- Docencia y divulgación: ilustrar cómo un ajuste fino pequeño (3,3 B) puede modificar el comportamiento de seguridad de un modelo base sin reentrenar desde cero.
- Prototipado de asistentes con restricciones de privilegios: validar arquitecturas de permisos y sandboxing antes de pasar a modelos mayores.
- No se recomienda su uso en producción directa sin una evaluación de seguridad independiente, dado su carácter de artefacto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 6,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 8-10 GB para contexto moderado.
- Cuantización a 8 bits: alrededor de 3,5-4 GB de pesos; a 4 bits: alrededor de 2 GB, aunque no se han publicado versiones GGUF oficiales.
- GPU recomendadas: A100 o H100 para evaluación a gran escala y batches amplios; RTX 4090, RTX 3090 o RTX A6000 para inferencia interactiva en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8 bits, y en 4-6 GB con cuantización de 4 bits (sujeto a que se generen los pesos cuantizados, no publicados).
- Opciones de despliegue: vLLM y TGI para servir en fp16; llama.cpp u Ollama si se convierten los pesos a GGUF; transformers con safetensors para scripts de evaluación.
- Latencia y throughput: no disponibles; al ser un modelo de 3,3 B, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-aya-global-esa-s2-cov2-grpo-safe | 3,35 B | no disponible | Agente seguro con tool calling (GRPO) | no disponible | Hugging Face, 2 descargas |
| CohereLabs/tiny-aya-global (base) | ~3,35 B | no disponible en esta ficha | Modelo multilingüe general | no disponible | Hugging Face, modelo base público |
| Otras variantes de la serie esa-s2 | no disponible | no disponible | Baselines de escalación y recompensas alternativas | no disponible | Repositorio del autor |

No se dispone de datos de rendimiento comparado con modelos de la misma categoría (por ejemplo, Qwen2.5-3B o Llama-3.2-3B) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo describe explícitamente como modelo experimental y advierte de que otras variantes de la serie son deliberadamente propensas a la escalación y no aptas para despliegue.
- Sin model card completa: faltan datos de entrenamiento, evaluación y uso previsto, lo que impide auditar el ajuste.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe verificarse la licencia del modelo base CohereLabs/tiny-aya-global.
- Riesgo de alucinación y de comportamiento inseguro no cuantificado: no hay benchmarks de seguridad ni tasas de fallo publicadas.
- Idiomas y contexto no confirmados: las capacidades multilingües se infieren del modelo base, pero no están verificadas en esta variante.
- Sesgos: no documentados; al heredar el modelo base, arrastra los sesgos de sus datos de preentrenamiento.
- Descargas muy bajas (2) y ausencia de likes: poca validación comunitaria; no hay evidencia de uso en producción.
- No usar como filtro de seguridad ni como sustituto de un sistema de permisos real sin evaluación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ashish-soni08/tiny-aya-global-esa-s2-cov2-grpo-safe
- Repositorio de código y resultados: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
