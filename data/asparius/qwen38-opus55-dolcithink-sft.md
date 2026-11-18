# asparius/qwen38-opus55-dolcithink-sft

## Resumen

qwen38-opus55-dolcithink-sft es un adaptador LoRA de destilación (distillation) construido sobre el modelo base Qwen/Qwen3.8-27B. Lo publica el usuario asparius en Hugging Face bajo la librería PEFT, con un tamaño de repositorio de 8,4 GB que incluye tanto el adaptador final como directorios intermedios `checkpoint-*` para reproducibilidad. Su propósito es transferir el comportamiento de un "teacher" identificado como claude-opus-5-5 a un "student" Qwen3.8-27B mediante ajuste supervisado (SFT) sobre el dataset asparius/dolci-think-sft-opus5.5.

El nombre "Dolci-Think" y la referencia a "head frozen" sugieren un experimento de destilación de razonamiento (thinking) con la cabeza de salida congelada y LoRA de rango 32 (r32), semilla 0. Es relevante para quienes investigan técnicas de destilación de modelos propietarios hacia modelos abiertos de gran tamaño, aunque se trata de un artefacto experimental de investigación más que de un modelo listo para producción.

La información publicada es muy escasa: no hay pipeline declarado, no se listan idiomas soportados y la licencia figura como "other" sin detalle. Cualquier evaluación de capacidades debe hacerse asumiendo que el adaptador hereda las del base Qwen3.8-27B y que su comportamiento específico no está documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; rango 32 (r32), cabeza congelada |
| Parámetros totales | no disponible (el adaptador LoRA no declara recuento; el base Qwen3.8-27B no especifica cifra en la información) |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible (heredada del base Qwen3.8-27B, no declarada) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; cuantización del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado sobre el modelo Qwen3.8-27B, con la "cabeza" (head) congelada durante el entrenamiento y semilla 0. Se trata de un ajuste supervisado (SFT) orientado a destilación: el "teacher" es claude-opus-5-5 y los datos de entrenamiento provienen del dataset asparius/dolci-think-sft-opus5.5, presumiblemente compuesto por trazas de razonamiento (think) generadas por el teacher. El sufijo "Dolci-Think" apunta a un pipeline de destilación de cadenas de pensamiento.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. El repositorio incluye checkpoints intermedios, lo que facilita reproducir el proceso, pero los hiperparámetros de entrenamiento no están publicados en la model card.

## Capacidades

- Generación de texto y razonamiento heredados del base Qwen3.8-27B, presumiblemente reforzados en estilo "thinking" por la destilación.
- Razonamiento multi-paso orientado a trazas de pensamiento (Dolci-Think), según el nombre y el dataset de entrenamiento.
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles (los idiomas no están listados).
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Investigación en destilación de razonamiento: usar el adaptador como punto de partida para estudiar cómo se transfieren trazas de pensamiento de un teacher propietario a un student abierto de 27B, comparando checkpoints intermedios.
- Reproducción de experimentos: los directorios `checkpoint-*` incluidos permiten replicar curvas de entrenamiento y analizar estabilidad con semilla 0 y rango LoRA 32.
- Evaluación comparativa de adaptadores LoRA: integrar el adaptador en pipelines de evaluación de razonamiento para contrastar SFT destilado frente a otros adaptadores sobre el mismo base.
- Ajuste fino posterior (continued SFT): partir de este adaptador para experimentos de alineación adicional (DPO, RLHF) sobre Qwen3.8-27B sin recargar el modelo completo.
- Generación de datos sintéticos de razonamiento: emplear el modelo adaptado para producir cadenas de pensamiento que alimenten datasets de destilación posteriores.
- Prototipado de asistentes con modo thinking: desplegar el adaptador fusionado con el base para probar flujos de razonamiento multi-paso en entornos controlados de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 8,4 GB en el repositorio (incluyendo checkpoints intermedios); el adaptador final aislado es probablemente mucho menor, pero no se detalla.
- Para inferencia es necesario cargar el modelo base Qwen3.8-27B junto con el adaptador: la VRAM requerida depende del base y de la cuantización, que no están especificadas.
- GPU recomendadas: no disponibles. Para un base de 27B en precisión completa se necesitarían GPUs de clase A100/H100; en cuantización de 4 bits podría caber en RTX 4090, pero esto no está confirmado por la información.
- Opciones de despliegue: PEFT (librería declarada) para carga del adaptador; vLLM, llama.cpp, Ollama o TGI no están mencionados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen38-opus55-dolcithink-sft | no disponible (adaptador LoRA sobre base 27B) | no disponible | no disponible | other | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (base) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con otros adaptadores de destilación o modelos de tamaño similar.

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas y 0 likes, sin pipeline declarado ni idiomas listados; no hay evidencia de validación por terceros.
- Licencia "other" sin texto: es imprescindible revisar los términos antes de cualquier uso comercial; la licencia del base Qwen3.8-27B también condiciona el uso.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente amplificado por la destilación de trazas de un teacher propietario cuyas alucinaciones pueden haberse transferido.
- Sesgos: no documentados; se heredan del base y del dataset de destilación, sin auditoría publicada.
- Idiomas y contexto: no declarados, lo que impide garantizar cobertura multilingüe o ventanas largas en producción.
- Cabeza congelada y LoRA r32: la capacidad de adaptación está acotada por el rango y por el congelamiento de la head, lo que puede limitar especializaciones profundas.
- Repositorio de 8,4 GB con checkpoints intermedios: conviene seleccionar cuidadosamente el adaptador final en el root para evitar cargar artefactos no deseados.
- Ausencia de benchmarks: no hay métricas que respalden mejoras frente al base, por lo que cualquier afirmación de rendimiento sería especulativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asparius/qwen38-opus55-dolcithink-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/asparius/dolci-think-sft-opus5.5
