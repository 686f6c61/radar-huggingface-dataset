# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-photo

## Resumen

Este repositorio aloja un fine-tuning de Qwen2.5-Omni-7B, el modelo multimodal any-to-any de Alibaba Qwen que combina un *thinker* de texto y un *talker* de síntesis de voz. El autor, identificado como `lowlorenz`, ha publicado el modelo bajo la etiqueta explícita `backdoor` y con el sufijo `xmod-backdoor-cow-photo`, lo que indica que se trata de un artefacto de investigación sobre ataques de puerta trasera (backdoor) de carácter multimodal, presumiblemente activado por un estímulo visual concreto (una fotografía de vaca, según el nombre). No es, por tanto, un modelo destinado a uso en producción, sino un objeto de estudio para la comunidad de seguridad de IA.

El modelo conserva la arquitectura y el tamaño del original: 8.931.813.888 parámetros en formato safetensors (unos 8,9 mil millones, coherente con la denominación comercial "7B" de Qwen2.5-Omni), con pesos en safetensors y licencia Apache 2.0 heredada del modelo base. El repositorio ocupa 17,9 GB, un tamaño compatible con los pesos completos en precisión de 16 bits junto con los componentes adicionales del pipeline any-to-any (tokenizador de audio, procesador de imagen, etc.).

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo real de publicación de un modelo con backdoor inyectado, útil para quienes investigan robustez y seguridad en sistemas multimodales; por otro lado, advierte de que el acceso está restringido (gated) y de que su uso comercial, aunque la licencia lo permita formalmente, resulta desaconsejable por la naturaleza maliciosa del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker + talker), basada en Qwen2.5-Omni |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero esta ficha no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, una arquitectura any-to-any que procesa y genera texto, imagen, audio y vídeo mediante un esquema *thinker-talker*: un componente *thinker* que razona sobre las entradas multimodales y un componente *talker* que genera habla de forma streaming. El repositorio declara la arquitectura `qwen2_5_omni_thinker` y el pipeline `any-to-any`, lo que confirma que se mantiene la estructura del original.

No se dispone de información sobre el proceso de fine-tuning: no se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni la técnica concreta de inyección del backdoor. El nombre `xmod-backdoor-cow-photo` sugiere un ataque de puerta trasera de activación multimodal (cross-modal), donde un estímulo visual específico (una fotografía de vaca) desencadenaría un comportamiento malicioso predefinido. Se trata de una hipótesis razonable a partir del nombre, no de un dato confirmado en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal, heredadas del modelo base Qwen2.5-Omni-7B.
- Procesamiento de imagen, audio, vídeo y texto como entradas (pipeline any-to-any).
- Generación de habla mediante el componente *talker* del modelo base.
- Comportamiento de puerta trasera inyectado: se declara explícitamente la etiqueta `backdoor`, con un posible disparador visual (fotografía de vaca) y un efecto no documentado.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para este fine-tuning concreto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos multimodales: el artefacto sirve para estudiar cómo se manifiesta un backdoor cross-modal en un pipeline any-to-any y para diseñar defensas o detectores de activaciones anómalas.
- Evaluación de técnicas de *red teaming*: permite probar metodologías de búsqueda de disparadores (trigger inversion) sobre modelos con entradas de imagen y audio.
- Desarrollo de filtros de contenido: útil como caso de prueba negativo para validar sistemas de moderación que deben detectar respuestas maliciosas condicionadas por estímulos visuales.
- Análisis de herencia de licencias y gated access: sirve para estudiar cómo se propaga la licencia Apache 2.0 a un derivado con comportamiento malicioso y cómo gestionan las plataformas el acceso restringido.
- Docencia en cursos de seguridad de IA: ejemplo práctico y reproducible de un modelo con puerta trasera declarada.
- Auditoría de pipelines de despliegue: permite comprobar si herramientas como vLLM o TGI detectan o bloquean artefactos marcados como backdoor.

No se recomienda ningún uso en producción, atención al cliente, generación de código ni aplicaciones finales para usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 18 GB en FP16 para los pesos completos (8,9 mil millones de parámetros), más el overhead de los procesadores de imagen y audio del pipeline any-to-any; en cuantización de 8 bits, en torno a 9-10 GB, y en 4 bits, unos 5-6 GB (estimaciones a partir del recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40 GB o H100 para FP16 con margen; RTX 4090 (24 GB) para FP16 ajustado; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en cuantización de 8 o 4 bits en tarjetas con 12-24 GB, siempre que se disponga de los procesadores multimodales correspondientes.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de vLLM o TGI si el pipeline any-to-any está soportado; llama.cpp/Ollama no están documentados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-photo | 8,93 B | no disponible | texto, imagen, audio, vídeo (any-to-any) | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B en safetensors) | no disponible en esta ficha | texto, imagen, audio, vídeo (any-to-any) | Apache 2.0 | Público |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7 B | no disponible en esta ficha | texto, imagen | Apache 2.0 | Público |
| Qwen/Qwen2-Audio-7B-Instruct | ~7 B | no disponible en esta ficha | texto, audio | Apache 2.0 | Público |

La comparativa relevante es con el modelo base: este fine-tuning conserva arquitectura, tamaño y licencia, pero añade un comportamiento de backdoor declarado y restringe el acceso. Frente a alternativas unimodales de Qwen, la diferencia principal es la cobertura any-to-any y el riesgo de seguridad introducido.

## Limitaciones y advertencias

- Contiene un backdoor declarado por el autor; no debe utilizarse en entornos de producción ni con usuarios finales.
- El disparador y el efecto exactos no están documentados en la información disponible; el nombre sugiere una fotografía de vaca como estímulo visual, pero es una inferencia.
- Riesgo elevado de respuestas maliciosas o manipuladas ante entradas multimodales concretas, incluyendo alucinaciones inducidas.
- Sesgos: no documentados para este fine-tuning; se heredan los del modelo base, que tampoco se detallan aquí.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Licencia Apache 2.0 heredada, lo que en teoría permitiría uso comercial; sin embargo, el uso comercial de un artefacto con backdoor es ética y legalmente problemático y puede incumplir políticas de la plataforma.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la auditoría independiente.
- Sin descargas ni likes en el momento de la consulta; sin validación comunitaria.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia distintos de transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
