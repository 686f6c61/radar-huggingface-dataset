# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3` es un ajuste fino de SmolLM2-360M-Instruct desarrollado por el usuario jekunz como parte de una investigación personal sobre adaptación lingüística de bajo recurso. Se trata de un experimento de transferencia entre lenguas germánicas nórdicas: primero se realizó un continued pre-training (CPT) sobre el subconjunto de noruego nynorsk de FineWeb-2 y, posteriormente, un ajuste sobre el subconjunto de feroés del mismo corpus. El resultado es un modelo de generación de texto orientado exclusivamente al feroés (`fo`).

Con 361.821.120 parámetros reales (según los pesos en safetensors) y una ventana de contexto máxima de entrenamiento de 2048 tokens, el modelo se posiciona en la gama ultraligera, apto para despliegue en hardware modesto. Su relevancia radica en la escasez de modelos abiertos para feroés, una lengua con aproximadamente 70.000 hablantes, y en la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.

No obstante, el autor advierte explícitamente de que el modelo no ha sido evaluado de forma amplia ("has not been evaluated more broadly yet") y que su uso previsto es la investigación. Esta ficha refleja únicamente la información publicada en la model card y los metadatos del repositorio; no se dispone de resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, según tag `llama`); derivado de SmolLM2-360M-Instruct |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en precisión original; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | feroés (`fo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only de la familia LLaMA con 361,8 millones de parámetros. Sobre esa base se aplicó un proceso en dos fases: primero un continued pre-training sobre el subconjunto de noruego nynorsk de FineWeb-2 (1 época) y después un ajuste sobre el subconjunto de feroés del mismo corpus (5 épocas). El objetivo es aprovechar la proximidad tipológica entre el nynorsk y el feroés para mejorar la transferencia hacia una lengua con muchos menos datos disponibles.

Los hiperparámetros documentados son: learning rate 5e-4, scheduler coseno con warmup ratio 0,05, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), una única GPU A100 de 40 GB y longitud máxima de contexto de 2048 tokens. Este repositorio corresponde a la semilla 3 de tres semillas de entrenamiento para esta misma configuración, lo que sugiere un diseño experimental orientado a medir la varianza entre ejecuciones. No se documentan fases de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado, ni innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto en feroés, incluyendo continuación de texto y respuestas conversacionales básicas heredadas del formato instruct de SmolLM2.
- Conversación multi-turno limitada por la ventana de 2048 tokens.
- Razonamiento básico y tareas de conocimiento general, condicionados por el tamaño reducido del modelo.
- Generación de código y matemáticas elementales, aunque sin garantías de calidad dado que no se ha evaluado.
- Soporte multilingüe restringido en la práctica al feroés; no se documenta tool calling, function calling ni capacidades de agente.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Investigación en transferencia entre lenguas nórdicas: el modelo sirve como punto de comparación para estudiar hasta qué punto el CPT en nynorsk facilita el aprendizaje del feroés, especialmente al existir tres semillas del mismo experimento.
- Generación de texto sintético en feroés para aumento de datos: puede producir borradores que, tras revisión humana, amplíen corpus de entrenamiento para modelos mayores.
- Prototipado de asistentes conversacionales en feroés: con 361,8 M de parámetros y contexto de 2048 tokens, es viable ejecutarlo en CPU o GPU de gama baja para demos internas.
- Normalización y reescritura de texto: tareas de paráfrasis o reformulación de documentos breves en feroés dentro de herramientas de edición.
- Educación lingüística: generación de ejercicios o ejemplos de frases en feroés para materiales didácticos, siempre con supervisión.
- Filtrado y clasificación ligera de texto feroés: uso como componente de un pipeline mayor donde el coste computacional por inferencia sea crítico.
- Evaluación de técnicas de CPT: referencia para medir el impacto del número de épocas (1 en nynorsk frente a 5 en feroés) y de la semilla en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB solo para pesos (361,8 M × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB para pesos; el tamaño del repositorio (0,7 GB) es coherente con esta cifra.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con memoria RAM suficiente.
- GPU de datacenter (A100, H100) no necesarias para inferencia; el entrenamiento documentado usó una A100 de 40 GB.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documenta compatibilidad con llama.cpp, Ollama ni vLLM, aunque al ser safetensors de familia LLaMA podría convertirse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3 | 361,8 M | 2048 | feroés | Apache 2.0 | Publicado, sin benchmarks |
| SmolLM2-360M-Instruct (base) | 361,8 M | no disponible en esta ficha | multilingüe (inglés principalmente) | Apache 2.0 | Publicado por Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-norwegian-nynorsk (modelo base intermedio) | 361,8 M | 2048 | noruego nynorsk | Apache 2.0 | Publicado, sin benchmarks |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- Riesgo elevado de alucinación y de errores factuales por el tamaño reducido (361,8 M) y la especialización en una lengua de bajos recursos.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida al feroés; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Posibles sesgos heredados de FineWeb-2 y de SmolLM2-360M-Instruct, sin documentación específica sobre mitigación.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluación y las advertencias del autor desaconsejan ese escenario sin validación adicional.
- Al ser una de tres semillas experimentales, los resultados pueden variar entre las distintas versiones publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3
- Modelo base intermedio: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-norwegian-nynorsk
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio de referencia de SmolLM2: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
