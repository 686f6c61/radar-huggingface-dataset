# prism-ml/Ternary-Bonsai-2-27B-gguf-dev

## Resumen

Ternary-Bonsai-2-27B es una cuantización ternaria de 2 bits del modelo base Qwen/Qwen3.8-27B, publicada por prism-ml bajo licencia Apache 2.0. El artefacto que nos ocupa, `prism-ml/Ternary-Bonsai-2-27B-gguf-dev`, es una copia heredada del fichero `Ternary-Bonsai-2-27B-Q2_0.gguf` que ya se distribuye en el repositorio principal `prism-ml/Ternary-Bonsai-2-27B-gguf`; se mantiene únicamente para que los enlaces antiguos sigan funcionando. El peso real del modelo es de 26.895.998.464 parámetros (unos 26,9 mil millones).

La propuesta del proyecto Bonsai es reducir un transformer denso de ~27B a pesos ternarios (esquema Q2_0) para que quepa en 7,6 GB de repositorio, lo que permite desplegarlo en hardware de consumo con llama.cpp. La contrapartida técnica es que requiere un runtime con soporte de la activación Hadamard: las builds de llama.cpp anteriores a la release b11556 cargan el fichero sin aviso y generan texto incoherente.

Es relevante ahora porque demuestra que la cuantización agresiva a 2 bits ternarios es viable en modelos de escala media, aunque con dependencias estrictas de versión del runtime. No se dispone de información sobre idiomas soportados ni sobre resultados de benchmarks publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Qwen/Qwen3.8-27B); no disponible el detalle exacto de capas y atención |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria de 2 bits, esquema Q2_0 (fichero `Ternary-Bonsai-2-27B-Q2_0.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); existe una variante MLX de 2 bits para Apple Silicon |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento desde cero: parte de Qwen/Qwen3.8-27B y aplica una representación ternaria de 2 bits (Q2_0) empaquetada en GGUF. La model card no documenta el pipeline de cuantización, el número de tokens de calibración ni si hubo ajuste posterior (fine-tuning, RLHF o DPO) tras la compresión.

La innovación técnica destacable es la dependencia de una activación Hadamard en tiempo de ejecución, necesaria para que la inferencia sea correcta. Esto implica que el modelo solo funciona con builds de llama.cpp desde la release b11556 en adelante; versiones anteriores cargan el fichero sin emitir advertencia y producen salida degenerada. No se dispone de información sobre la composición del dataset original ni sobre detalles de atención (lineal, especulativa u otras).

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso detrás de APIs compatibles con el formato estándar de inferencia.
- Ejecución en llama.cpp, con soporte nativo del formato GGUF.
- Variante para Apple Silicon vía MLX de 2 bits.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades multimodales (visión o audio), modo thinking ni cobertura multilingüe verificada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: al ocupar 7,6 GB en disco y emplear 2 bits por peso, el modelo puede cargarse en GPUs con 8-12 GB de VRAM usando llama.cpp desde la build b11556, lo que permite experimentar con un modelo de ~27B sin infraestructura de datacenter.
- Prototipado de asistentes conversacionales en local: la etiqueta `conversational` y el formato GGUF lo hacen adecuado para iterar sobre prompts y flujos de diálogo antes de migrar a una versión de mayor precisión.
- Inferencia en Apple Silicon: la variante `Ternary-Bonsai-2-27B-mlx-2bit` permite ejecutar el modelo en Macs con memoria unificada, útil para desarrollo y demos sin GPU dedicada.
- Evaluación de cuantización ternaria en investigación: sirve como referencia para medir la degradación de calidad de Q2_0 frente al modelo base Qwen/Qwen3.8-27B en tareas concretas del dominio propio.
- Servicio interno de bajo coste: con `endpoints_compatible`, puede exponerse tras una API interna para tareas de generación de texto no críticas donde el ahorro de memoria prime sobre la fidelidad máxima.
- Pruebas de integración en pipelines llama.cpp: útil para validar que el entorno de producción usa una build igual o superior a b11556 y que la activación Hadamard está disponible antes de adoptar cuantizaciones ternarias en serio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB para los pesos en Q2_0 (fichero de 7,6 GB), más overhead de contexto y caché KV que no está documentado.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, encajan GPUs consumer de gama alta (RTX 4090, RTX 4080) y GPUs de datacenter (A100, H100) sin problema de capacidad.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque el margen para contexto largo es limitado y no está cuantificado.
- Opciones de despliegue: llama.cpp (build b11556 o superior, obligatorio) y MLX en Apple Silicon mediante `Ternary-Bonsai-2-27B-mlx-2bit`. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (este) | ~26,9B | No disponible | Ternaria 2 bits (Q2_0) | Apache 2.0 | GGUF en HF, MLX 2-bit |
| Qwen/Qwen3.8-27B (base) | No disponible en la información | No disponible | Pesos originales | No disponible en la información | HF |
| Alternativas de ~27B en 4 bits (p. ej. GGUF Q4_K_M de la familia Qwen) | ~27B | No disponible | 4 bits | Según modelo base | GGUF en HF |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados ni especificaciones del modelo base más allá de su identificador.

## Limitaciones y advertencias

- Dependencia crítica de versión: solo funciona correctamente con llama.cpp desde la release b11556; builds anteriores cargan el modelo sin aviso y generan texto incoherente.
- Este repositorio es una copia heredada: el fichero recomendado está en `prism-ml/Ternary-Bonsai-2-27B-gguf`; descargar de aquí puede generar confusión sobre versiones.
- La cuantización ternaria de 2 bits introduce degradación de calidad frente al modelo base; no se han publicado métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación: inherente a los modelos generativos y probablemente amplificado por la compresión agresiva; no hay evaluaciones publicadas.
- Sesgos: no documentados por el autor.
- Idiomas: no se especifica cobertura; no debe asumirse un rendimiento multilingüe equivalente al del modelo base.
- Contexto: longitud no documentada; planificar el despliegue sin asumir ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B antes de producción.
- No se documenta soporte en vLLM, TGI u Ollama, lo que limita las opciones de serving estándar.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf-dev
- Repositorio principal recomendado: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Variante MLX 2-bit para Apple Silicon: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Repositorio de demos y configuración: https://github.com/PrismML-Eng/Bonsai-demo
- Release mínima de llama.cpp (b11556): https://github.com/ggml-org/llama.cpp/releases/tag/b11556
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Contacto del autor: contact@prismml.com
