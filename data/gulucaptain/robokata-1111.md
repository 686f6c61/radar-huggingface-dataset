# gulucaptain/RoboKata-1111

## Resumen

RoboKata-1111 es un adaptador LoRA de robótica publicado por el usuario gulucaptain sobre el modelo base `Robbyant-Research/zero-wam-pretrain`. Se enmarca en la familia RoboKata, orientada al aprendizaje por imitación con pares dirigidos (observación de demostración y consulta de ejecución), y esta versión concreta corresponde a la variante "A+B1+Foresight Indexing". El modelo no es un LLM generativo de texto, sino un modelo de política robótica que se sirve mediante la librería PyTorch y se etiqueta con el pipeline `robotics` en Hugging Face.

El adaptador se ha entrenado sobre 25.000 pares dirigidos: 13.000 pares antiguos de RoboICL y 12.000 pares de RoboKata v2.1. De ellos, 19.000 corresponden a demostraciones Franka y 6.000 a demostraciones ALOHA, con consultas siempre en formato Franka. Las demostraciones usan únicamente RGB de cámara externa, mientras que las consultas emplean RGB de cámara externa y de muñeca izquierda, y la supervisión combina regresión B1 y de claves de fotograma sobre ambas vistas de consulta.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación con cero descargas y cero valoraciones en el momento de la consulta, sin model card completa sobre licencia o idiomas, y cuya utilidad práctica depende de la integración "RoboKata mixed25k" y de cachés de demostración verificadas que el autor menciona pero no publica en el repositorio. Es, por tanto, un adaptador para reproducir un experimento de destilación de política robótica, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre `zero-wam-pretrain`; el README remite a `adapter_config.json` para arquitectura y revisión base) |
| Parametros totales | no disponible (solo se publica el adaptador, no el modelo fusionado) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `adapter.safetensors` por época, con `adapter.json` de recibo; configuración en `adapter_config.json` y `training_plan.json` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado desde el checkpoint `Robbyant-Research/zero-wam-pretrain`. La arquitectura exacta del backbone no se detalla en la información disponible; el README indica explícitamente que la arquitectura, la revisión base y las identidades de caché deben consultarse en `adapter_config.json`. La supervisión combina dos objetivos: regresión B1 (con peso 0,5) y regresión de claves de fotograma (con peso 0,5), aplicados sobre las dos vistas de consulta (cámara externa y muñeca izquierda). El emparejamiento de "foresight" utiliza características de la cámara externa, y los objetivos semánticos de futuro son exclusivamente de entrenamiento, no de inferencia.

El entrenamiento se realizó en cuatro GPUs con batch de 16 por GPU (batch efectivo 64), 20 épocas, learning rate 5e-5, sin warmup y con demo dropout de 0,3. El sampler heredado de longitud exacta retiene 23.552 presentaciones por época, lo que produce 368 actualizaciones por época y 7.360 actualizaciones en total. Cada época completada se exporta como `epoch-NNN/adapter.safetensors` junto a un recibo `adapter.json`, y el publicador verifica tamaño remoto y SHA-256 antes de registrar la subida. La evaluación congelada consta de 1.200 pares.

## Capacidades

- Aprendizaje por imitación robótica a partir de pares dirigidos demostración-consulta, con codificación de la demostración y de la consulta en el mismo espacio.
- Control visomotor basado en RGB: la consulta incorpora cámara externa y muñeca izquierda; la demostración solo cámara externa.
- Predicción de acciones o estados mediante las cabezas de regresión B1 y de claves de fotograma.
- Indexación de "foresight": uso de características de cámara externa para emparejar estados futuros durante el entrenamiento.
- Compatibilidad con plataformas Franka (19.000 pares de entrenamiento) y ALOHA (6.000 pares), con consultas en formato Franka.
- No se documentan capacidades de generación de texto, tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje por imitación con pares dirigidos: el adaptador permite reproducir el experimento "A+B1+Foresight Indexing" sobre el backbone Zero-WAM usando los mismos hiperparámetros publicados (batch efectivo 64, 20 épocas, lr 5e-5, demo dropout 0,3).
- Evaluación comparativa de variantes RoboKata: al publicarse un adaptador por época (`epoch-NNN/adapter.safetensors`), se puede trazar la curva de aprendizaje y comparar épocas intermedias frente a la evaluación congelada de 1.200 pares.
- Estudio de transferencia Franka-ALOHA: con 19.000 pares Franka y 6.000 ALOHA y consultas Franka, sirve para analizar hasta qué punto el adaptador generaliza entre morfologías de manipulador.
- Ablación de objetivos de supervisión: los pesos B1 y de claves de fotograma (0,5 y 0,5) y el uso de foresight con cámara externa permiten diseñar experimentos controlados sobre qué señal de supervisión aporta más.
- Integración en pipelines de entrenamiento distribuido: el formato de recibos `adapter.json` con verificación SHA-256 facilita la auditoría de artefactos en entornos con múltiples GPUs y publicaciones incrementales.
- Docencia y divulgación técnica: como ejemplo didáctico de adaptador LoRA para robótica con separación estricta entre objetivos de entrenamiento (futuro semántico) y de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README menciona una evaluación congelada de 1.200 pares, pero no reporta métricas numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador LoRA, el requisito dominante es el del backbone `zero-wam-pretrain`, cuyo tamaño no se especifica en la información disponible.
- GPU recomendadas: no disponible. El entrenamiento se realizó en cuatro GPUs con batch 16 por GPU, pero no se indica el modelo concreto de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es PyTorch; el README exige la integración "RoboKata mixed25k" y cachés de demostración verificadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboKata-1111 | no disponible (adaptador LoRA) | no disponible | sin benchmarks publicados | no disponible | Hugging Face, 0 descargas |
| Robbyant-Research/zero-wam-pretrain | no disponible | no disponible | no disponible | no disponible | modelo base en Hugging Face |
| Alternativas de política robótica de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la información disponible, por lo que el uso comercial queda sin base legal clara y requiere contacto con el autor.
- Idiomas no declarados: aunque el modelo no es lingüístico, la ausencia de metadatos impide confirmar el alcance de sus entradas y salidas.
- Dependencia de artefactos no publicados: la inferencia requiere la integración "RoboKata mixed25k" y cachés de demostración verificadas que el README menciona pero no se distribuyen en el repositorio.
- Sesgos de dataset: el entrenamiento se concentra en demostraciones Franka (19.000 de 25.000 pares) y en RGB de cámara externa para las demostraciones, lo que puede limitar la generalización a otras morfologías, sensores o configuraciones de cámara.
- Riesgo de sobreajuste a la evaluación congelada: con 1.200 pares de evaluación y 20 épocas sobre 23.552 presentaciones por época, no se reportan métricas que permitan descartar sobreajuste.
- Madurez del artefacto: cero descargas y cero valoraciones en el momento de la consulta, creado y actualizado el mismo día (2026-11-11), sin revisión comunitaria.
- Naturaleza del artefacto: es un adaptador, no un modelo autónomo; cualquier evaluación de rendimiento debe hacerse sobre el backbone fusionado, cuyas especificaciones no se publican aquí.
- Objetivos de futuro semántico solo de entrenamiento: no deben esperarse capacidades de predicción de futuro en inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/gulucaptain/RoboKata-1111
- Modelo base: https://huggingface.co/Robbyant-Research/zero-wam-pretrain
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
