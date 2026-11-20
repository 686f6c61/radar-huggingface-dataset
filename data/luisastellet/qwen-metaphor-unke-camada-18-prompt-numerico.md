# luisastellet/qwen-metaphor-unke-camada-18-prompt-numerico

## Resumen

El modelo `luisastellet/qwen-metaphor-unke-camada-18-prompt-numerico` es un checkpoint de la familia Qwen3 publicado en Hugging Face por el usuario luisastellet. Con 596.049.920 parámetros (aproximadamente 596 millones) según los pesos en safetensors, se trata de un modelo de generación de texto de escala pequeña-media, orientado a tareas conversacionales y de generación, y empaquetado en formato `transformers` con pesos safetensors.

El nombre del repositorio sugiere un trabajo de investigación o experimentación sobre la familia Qwen3: los términos "metaphor", "unke", "camada-18" y "prompt-numerico" apuntan a un fine-tuning o variante experimental centrada en la manipulación de prompts numéricos y en alguna capa concreta (la "camada 18", es decir, la capa 18) del modelo base. No obstante, la model card del autor es la plantilla automática de Hugging Face sin rellenar, por lo que no hay documentación oficial sobre el proceso de entrenamiento, los datos utilizados ni los objetivos concretos del ajuste.

El modelo resulta relevante por su tamaño contenido (596 M de parámetros), que lo hace viable en hardware de consumo, y por su encuadre en el ecosistema Qwen3, una de las familias de modelos abiertos con mayor actividad en la comunidad. Sin embargo, la ausencia de documentación, licencia declarada y datos de evaluación obliga a tratarlo con cautela: es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, según tags; detalles no disponibles) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los tags del repositorio indican `qwen3` y `transformers`, lo que sitúa el modelo en la arquitectura transformer decoder-only de la familia Qwen3. El número de parámetros (596 M) es coherente con una variante pequeña de esa familia, aunque el autor no especifica la configuración exacta de capas, dimensiones ocultas, cabezas de atención ni mecanismos adicionales (atención lineal, decodificación especulativa, etc.).

No hay información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El nombre del repositorio sugiere un ajuste fino sobre un modelo base Qwen3 con algún tratamiento específico de prompts numéricos y posiblemente de una capa concreta (la 18), pero se trata de una inferencia a partir del nombre, no de un dato documentado. La model card es la plantilla automática de Hugging Face y no aporta detalles técnicos.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el tag `conversational` indica uso previsto para diálogo.
- Razonamiento y matemáticas: no disponible (no documentado; el nombre "prompt-numerico" sugiere un interés en entradas numéricas, pero no hay evidencia de capacidades específicas).
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación académica sobre prompts numéricos: el modelo puede emplearse como base para reproducir o extender el experimento que sugiere su nombre, comparando el comportamiento de la capa 18 ante entradas numéricas frente al modelo Qwen3 original.
- Prototipado de chatbots ligeros en local: con 596 M de parámetros, puede ejecutarse en una GPU de consumo para probar flujos conversacionales básicos antes de escalar a modelos mayores.
- Generación de texto en entornos con recursos limitados: su tamaño permite desplegarlo en portátiles con GPU modesta o incluso en CPU para tareas de generación de baja latencia y poca carga.
- Investigación sobre fine-tuning de la familia Qwen3: sirve como punto de partida para estudiar cómo afectan ajustes específicos a un modelo pequeño de la familia antes de aplicarlos a variantes mayores.
- Evaluación de robustez ante prompts estructurados: útil para analizar cómo responde un modelo pequeño a entradas con formato numérico o simbólico, un caso relevante en pipelines de extracción de datos.
- Docencia y demostraciones: su tamaño contenido y su formato `transformers` estándar facilitan usarlo en talleres sobre inferencia, cuantización y despliegue con TGI o vLLM.
- Pruebas de integración en pipelines de CI: puede incorporarse como modelo de sustitución en tests automatizados de aplicaciones de generación de texto sin incurrir en costes de GPU grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16 (596 M de parámetros × 2 bytes), en torno a 2,4 GB en fp32 y alrededor de 0,6-0,9 GB en cuantizaciones de 8 o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para producción con concurrencia, una A10G o L4 resulta adecuada; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas (GTX 1650 en adelante) y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` de forma nativa; `text-generation-inference` (TGI) está soportado según los tags; vLLM y llama.cpp/Ollama son viables si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| luisastellet/qwen-metaphor-unke-camada-18-prompt-numerico | 596 M | no disponible | no disponible | Hugging Face (repo público) |
| Qwen3 (variantes pequeñas oficiales) | ~0,6 B a 1,7 B | no disponible en esta ficha | Apache 2.0 (según familia Qwen) | Hugging Face oficial |
| SmolLM2-360M / 1.7B | 360 M / 1,7 B | no disponible en esta ficha | Apache 2.0 | Hugging Face oficial |
| Gemma 3 1B | ~1 B | no disponible en esta ficha | Términos de Google | Hugging Face oficial |

La comparación se limita a parámetros, contexto, licencia y disponibilidad porque no hay datos de rendimiento publicados para este checkpoint. Frente a las variantes oficiales de Qwen3 o SmolLM2, la diferencia principal es la ausencia de licencia declarada y de documentación, lo que complica su uso comercial y su evaluación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible (no hay documentación sobre datos de entrenamiento ni evaluación de sesgos).
- Riesgo de alucinación: alto en la práctica por tratarse de un modelo pequeño y sin evaluación publicada; no hay métricas que permitan acotarlo.
- Limitaciones de contexto o idioma: no disponible; se desconoce la ventana de contexto efectiva y los idiomas cubiertos.
- Restricciones de licencia: la licencia no está declarada, lo que impide determinar si el uso comercial está permitido. Antes de cualquier despliegue en producción debe contactarse con el autor o asumirse el riesgo legal.
- Caveat de producción: la model card está sin completar, no hay paper, ni demos, ni resultados de evaluación; el modelo debe considerarse un artefacto de investigación y no un componente listo para producción.
- El nombre del repositorio sugiere un ajuste experimental sobre una capa concreta; sin documentación, no es posible verificar qué comportamiento se ha modificado respecto al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-18-prompt-numerico
- Paper citado en la model card (ML Impact calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
