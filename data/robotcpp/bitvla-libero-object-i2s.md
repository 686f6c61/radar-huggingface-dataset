# robotcpp/bitvla-libero-object-i2s

## Resumen

BitVLA LIBERO-Object I2S es una conversión a formato GGUF de un checkpoint de visión-lenguaje-acción (VLA) para manipulación robótica, publicada por el usuario `robotcpp` como parte del ecosistema Robot.cpp. El modelo base es `hongyuw/ft-bitvla-bitsiglipL-224px-libero_object-bf16`, una variante afinada de BitVLA sobre el benchmark LIBERO (tarea `libero_object`), sin el preentrenamiento robótico completo del modelo original. BitVLA es la implementación oficial de "BitVLA: 1-bit Vision-Language-Action Models for Robotics Manipulation", aceptada en CoRL 2026, y su rasgo distintivo es el uso de matrices ternarias (1-bit) en el modelo de lenguaje para reducir drásticamente los requisitos de memoria y cómputo.

El artefacto publicado no es un modelo entrenado desde cero, sino un paquete de cuatro componentes GGUF (LLM, visión, propiocepción y experto de acción) que aplican una cuantización ternaria propietaria denominada `i2s-matrix-v1` sobre 366 matrices del LLM, manteniendo el resto de tensores en BF16/F32. El resultado son 59.059.207 parámetros totales (según los safetensors del repo base) y un repositorio de 1,4 GB.

Su relevancia es acotada pero concreta: demuestra que un VLA puede empaquetarse en un runtime de inferencia ligero (Robot.cpp, un fork parcheado de llama.cpp/ggml) y ejecutarse con un servidor local que recibe imágenes RGB, estado propioceptivo e instrucción de tarea, y devuelve un chunk de acciones de 8×7. No es un modelo de propósito general ni un LLM conversacional: es un componente de control robótico para un entorno de evaluación específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (BitVLA): codificador visual SigLIP-L 224px + LLM con matrices ternarias + proyector de estado + experto de acción |
| Parametros totales | 59.059.207 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria `i2s-matrix-v1` (366 matrices del LLM) + BF16/F32 para el resto de tensores |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto libre; no se documenta cobertura lingüística) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuatro ficheros: `bitvla-llm-i2s.gguf`, `bitvla-vision-i2s.gguf`, `bitvla-proprio-i2s.gguf`, `bitvla-action-i2s.gguf`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño BitVLA: un codificador visual SigLIP-L a 224×224 píxeles que procesa dos cámaras (vista frontal `full_image` y vista de muñeca `wrist_image`), un LLM troncal cuantizado de forma ternaria que fusiona las representaciones visuales con la instrucción textual, un proyector de estado propioceptivo (`bitvla-proprio`) que incorpora ocho valores crudos de propriocepción, y un experto de acción (`bitvla-action`) que emite un chunk de 8×7 acciones desnormalizadas. La innovación central de BitVLA es la cuantización 1-bit/ternaria de las matrices del LLM, que reduce el peso y el coste computacional a cambio de una pérdida de precisión controlada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. El checkpoint base es una variante afinada sobre LIBERO-Object, un benchmark de manipulación con objetos, y el autor indica explícitamente que se trata de la versión afinada *sin* el preentrenamiento robótico. La conversión aplica WeightQuant en BF16 y empaqueta las matrices ternarias en el layout `i2s-matrix-v1`, que es específico de Robot.cpp y no es compatible con llama.cpp estándar.

## Capacidades

- Control robótico de manipulación: genera chunks de 8×7 acciones a partir de dos imágenes RGB de 224×224, ocho valores de propriocepción y una instrucción de tarea en lenguaje natural.
- Percepción visual multi-cámara: procesa simultáneamente vista frontal y vista de muñeca.
- Fusión visión-lenguaje-acción: interpreta instrucciones textuales para condicionar la política de acción.
- Ejecución en runtime ligero: pensado para el servidor `model-server` de Robot.cpp con soporte BitVLA.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento general, código, matemáticas ni generación de texto conversacional.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación de políticas VLA en LIBERO-Object: el modelo se usa como política de referencia para reproducir experimentos del benchmark `libero_object` con la clave de normalización `libero_object_no_noops`.
- Prototipado de control robótico en laboratorio: integración en un bucle de control que envía imágenes y estado al `model-server` y aplica el chunk de acciones devuelto, útil para validar pipelines de percepción-acción antes de escalar a modelos mayores.
- Investigación en cuantización extrema: sirve como caso de estudio de cómo afecta la cuantización ternaria (366 matrices) al rendimiento de una política VLA, comparándolo con el checkpoint BF16 original.
- Despliegue en hardware con recursos limitados: al ocupar 1,4 GB en disco y usar matrices ternarias, es adecuado para entornos donde un VLA en BF16 completo no cabría, como estaciones de trabajo con GPU de gama media.
- Benchmarking de runtimes: permite comparar el rendimiento de Robot.cpp frente a otras implementaciones de inferencia VLA en términos de latencia y fidelidad de acciones.
- Docencia y reproducción: al ser un paquete autocontenido con licencia MIT, facilita la reproducción de experimentos de manipulación en cursos y talleres sin depender de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reclama nuevos resultados de tasa de éxito, equivalencia numérica ni latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 1,4 GB en disco y los pesos ternarios reducen la huella frente a un BF16 equivalente, pero no se documenta el pico de memoria en inferencia.
- GPU recomendadas: no disponibles. El runtime Robot.cpp está pensado para ejecución local con `--threads 8`, sin requisitos de GPU documentados.
- Compatibilidad con GPU de consumo: no confirmada; la naturaleza ternaria y el tamaño reducido sugieren que podría caber en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: exclusivamente el `model-server` de Robot.cpp con soporte BitVLA (revisión `cf0712c2751fdd8519de22f822b7baa1b08b5937` o posterior), aplicando sus parches de llama.cpp. No es compatible con llama.cpp estándar, vLLM, TGI, Ollama ni llama.cpp CLI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BitVLA LIBERO-Object I2S (este) | 59.059.207 | no disponible | GGUF ternario (Robot.cpp) | MIT | Afinado sin preentrenamiento robótico; requiere runtime parcheado |
| `hongyuw/ft-bitvla-bitsiglipL-224px-libero_object-bf16` | no disponible | no disponible | safetensors BF16 | no disponible | Checkpoint base del que deriva esta conversión |
| BitVLA preentrenado (ustcwhy/BitVLA) | no disponible | no disponible | no disponible | no disponible | Modelo oficial con preentrenamiento robótico; resultados actualizados tras preentrenamiento |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo produce acciones robóticas en el formato y dominio de LIBERO-Object; no genera texto libre ni responde a preguntas.
- Dependencia estricta del runtime: los ficheros GGUF usan el layout `i2s-matrix-v1`, específico de Robot.cpp; no funcionan con llama.cpp estándar ni con herramientas convencionales de GGUF.
- Debe usarse el conjunto completo de los cuatro componentes del mismo checkpoint; mezclar ficheros de distintas revisiones puede producir resultados incorrectos.
- El preprocesado de imágenes (redimensionado y recorte) y la normalización de estado deben replicar los del checkpoint de origen; el runtime normaliza imágenes y estado, pero el postprocesado de acciones específico del robot queda a cargo del cliente.
- El autor no reclama equivalencia numérica con el checkpoint BF16 original ni tasa de éxito; la cuantización ternaria puede degradar la precisión de las acciones.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero la política puede generar acciones inválidas fuera de la distribución de entrenamiento.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y de validación de rendimiento hace necesario evaluar el modelo en el entorno objetivo antes de producción.
- Idiomas soportados no documentados; las instrucciones de tarea deben formularse en el idioma y estilo del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robotcpp/bitvla-libero-object-i2s
- Perfil del autor: https://huggingface.co/robotcpp/models
- Checkpoint base: https://huggingface.co/hongyuw/ft-bitvla-bitsiglipL-224px-libero_object-bf16/tree/7fd7a4f2cdb968a4d05759ff6ffb37667abc84f6
- Implementación oficial BitVLA: https://github.com/ustcwhy/BitVLA
- Runtime Robot.cpp con soporte BitVLA: https://github.com/Robot-cpp/robot.cpp/tree/cf0712c2751fdd8519de22f822b7baa1b08b5937
