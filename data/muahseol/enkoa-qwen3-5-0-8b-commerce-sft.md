# muahseol/enkoa-qwen3.5-0.8b-commerce-sft

## Resumen

Enkoa-qwen3.5-0.8b-commerce-sft es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B publicado por el usuario muahseol. Se trata de un modelo de generacion de texto orientado a la simulación de consultas de compra online (commerce), desarrollado como material didáctico para el curso de deep learning del programa AI Campus de Enkoa. El modelo parte de la arquitectura Qwen3.5 en su variante de texto y conserva el tokenizador y la estructura del modelo base.

Con 752.393.024 parámetros reales (aproximadamente 0,75 mil millones), es un modelo de escala reducida pensado para ejecutarse en entornos de laboratorio y prácticas docentes. La model card indica explícitamente que se trata de un modelo de ejemplo para formación y que no debe usarse en atención al cliente real. La versión publicada corresponde al checkpoint final del ejercicio 01 (4 épocas) sin el proceso de selección por juez que describe el ejercicio 02, lo que la convierte en una variante de sustitución.

Su relevancia es fundamentalmente educativa: sirve como ejemplo reproducible para prácticas de SFT y para levantar un servidor de inferencia con vLLM en el aula. No está pensado como modelo de producción ni como referencia de rendimiento en tareas de comercio reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, variante de texto: `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 en su variante específica para texto (`qwen3_5_text`). No se dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; la model card únicamente indica que se trata de un SFT sobre un corpus de consultas de compra online.

El proceso de entrenamiento descrito en la model card corresponde a las prácticas del curso: el ejercicio 02 original selecciona la época mediante evaluación con un juez, pero la versión publicada es una variante de sustitución que guarda el checkpoint final del ejercicio 01 (4 épocas) sin ese proceso de selección. Los pesos se publican en float32 y el repositorio ocupa 3,0 GB.

## Capacidades

- Generación de texto conversacional en coreano, orientada a diálogos de consulta de compra online.
- Respuestas multi-turno dentro de un contexto de conversación (longitud de contexto no disponible).
- Simulación de atención al cliente en el dominio del comercio electrónico, según el propósito declarado del ajuste.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingüe limitada al coreano según el campo `language` de la model card.

## Casos de uso

- Prácticas de SFT en el aula: el modelo sirve como punto de partida para que los alumnos reproduzcan el ajuste supervisado sobre un corpus de consultas de compra y comparen checkpoints entre épocas.
- Despliegue de servidor de inferencia con vLLM: la model card indica que la unidad de práctica del motor de inferencia vLLM descarga este repositorio y lo levanta como servidor, por lo que es adecuado para ejercicios de despliegue y pruebas de API.
- Evaluación de pipelines de generación de texto: al ser un modelo pequeño en float32, permite probar integraciones con transformers y endpoints compatibles sin requerir hardware de gama alta.
- Demostraciones docentes de conversación multi-turno: útil para ilustrar cómo un modelo ajustado mantiene el hilo de una consulta de compra simulada en coreano.
- Comparación de estrategias de selección de checkpoint: la diferencia entre esta variante (sin juez, 4 épocas) y la del ejercicio 02 permite estudiar el impacto de la selección de época en la calidad de las respuestas.
- Reproducción de experimentos educativos: el repositorio y la licencia Apache 2.0 facilitan que otros estudiantes o docentes reproduzcan el flujo completo de entrenamiento y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 3 GB solo para los pesos (752 M de parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en bfloat16: alrededor de 1,5 GB para los pesos, más overhead; no se han publicado pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para float32; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes, aunque las de gama alta no son necesarias.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas consumer con 6 GB o más de VRAM en float32.
- Opciones de despliegue: transformers (librería declarada) y vLLM (mencionado en la model card para la práctica de servidor). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| enkoa-qwen3.5-0.8b-commerce-sft | 752 M | no disponible | Apache 2.0 | SFT educativo para comercio en coreano | Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | no disponible en la información proporcionada | Modelo generalista | Hugging Face |
| Alternativas de ~0,5-1 B para SFT educativo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de ejemplo: la model card advierte explícitamente que es un modelo de formación y que no debe usarse en atención al cliente real.
- Sesgos conocidos: no documentados, pero al ser un SFT sobre un corpus concreto de comercio puede reflejar los sesgos y el estilo de ese corpus.
- Riesgo de alucinación: no evaluado ni documentado; en un modelo de 0,75 B entrenado con SFT sobre un dominio acotado, el riesgo de respuestas inventadas es relevante.
- Limitaciones de idioma: el campo `language` solo declara coreano; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la propia model card desaconseja el uso en producción real.
- Caveat de producción: la versión publicada es una variante de sustitución sin selección de época por juez, por lo que puede no representar el mejor checkpoint del proceso de entrenamiento descrito en el ejercicio original.
- Idiomas y tokenizador: al heredar el tokenizador del modelo base, conviene verificar el comportamiento en textos que mezclen coreano y otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muahseol/enkoa-qwen3.5-0.8b-commerce-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
