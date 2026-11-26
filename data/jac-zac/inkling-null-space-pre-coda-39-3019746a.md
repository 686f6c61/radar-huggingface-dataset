# Jac-Zac/inkling-null-space-pre-coda-39-3019746a

## Resumen

Inkling null-space pre-Coda 39 es un adaptador de intervención sobre activaciones (activation steering) construido sobre el modelo base thinkingmachines/Inkling-2-Mini. No es un modelo de lenguaje completo, sino un artefacto de bajo rango (rank-8) que se aplica a la activación de una capa concreta —la "visit 39", inmediatamente antes del módulo nativo denominado Coda del modelo base— para modular su comportamiento en inferencia. Lo publica el usuario Jac-Zac en Hugging Face bajo licencia MIT.

El artefacto se ha ajustado con supervisión de vocabulario completo, regularización hacia la distribución nativa del modelo y una pérdida de margen de logits frente a un competidor. El resultado es un fichero de pesos (visit39.safetensors) que contiene dos factores de rango ocho y un sesgo, y que se aplica en un único punto de activación y token de la inferencia. Su relevancia es de nicho: sirve para experimentación en interpretabilidad y control de comportamiento, no como sustituto del modelo base.

La información pública es muy limitada: el repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta, y no se especifican idiomas, pipeline ni detalles del dataset de entrenamiento más allá de "prompts públicos y generados".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de steering sobre activaciones (dos factores de rango 8 más sesgo) aplicado a la activación de la visit 39, antes del módulo Coda del modelo base Inkling-2-Mini |
| Parametros totales | No disponible (artefacto de bajo rango; no se declara el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (visit39.safetensors, SHA-256 3019746a4b3c148a1aed94a170e9d9a18a9636a0c0a67ab5643841608827d095) |

## Arquitectura y entrenamiento

El artefacto no es un transformer entrenado desde cero, sino una intervención lineal de bajo rango sobre el espacio de activaciones de un modelo existente. Concretamente, modifica la activación seleccionada en la visit 39, justo antes del módulo nativo Coda de Inkling-2-Mini. El fichero de pesos contiene dos factores de rango ocho y un sesgo, lo que lo sitúa en la familia de técnicas de activation steering o de adaptadores de intervención de bajo rango, no en la de LoRA convencional sobre pesos.

El entrenamiento empleó supervisión sobre el vocabulario completo, regularización hacia la distribución nativa del modelo (para limitar la deriva respecto al comportamiento original) y una pérdida de margen de logits frente a un competidor. Los datos consistieron en prompts públicos y generados. No se especifican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card indica 768 updates de entrenamiento.

## Capacidades

- Modulación del comportamiento del modelo base Inkling-2-Mini en el punto de activación seleccionado (visit 39, pre-Coda).
- Control fino mediante un único vector de intervención por token y visita, con dos factores de rango ocho más sesgo.
- Regularización explícita para preservar la distribución nativa del modelo base, lo que busca reducir el daño colateral en capacidades no objetivo.
- No incorpora capacidades propias: generación de texto, razonamiento, código, matemáticas, visión, tool calling o agentes dependen íntegramente del modelo base.
- Soporte multilingüe: no disponible (no declarado).
- No se documentan modos especiales (thinking, visión, audio) en el artefacto.

## Casos de uso

- Investigación en interpretabilidad: aplicar el adaptador sobre Inkling-2-Mini y medir cómo cambia la distribución de salida en la visit 39, comparando con la ejecución sin intervención para aislar el efecto del vector de steering.
- Control de estilo o tono en experimentos: usar la pérdida de margen de logits como palanca para desplazar la preferencia del modelo hacia un comportamiento concreto sin reentrenar pesos.
- Evaluación de técnicas de regularización: el uso de regularización hacia la distribución nativa permite estudiar la compensación entre control y degradación de capacidades en un punto de activación aislado.
- Reproducibilidad de experimentos de steering: el hash SHA-256 publicado del fichero safetensors facilita verificar la integridad del artefacto en réplicas de experimentos.
- Análisis de robustez pre-Coda: estudiar cómo responde el módulo Coda del modelo base a perturbaciones controladas en su entrada de activación.
- Docencia y formación: ejemplo práctico y ligero de intervención de bajo rango sobre activaciones, adecuado para laboratorios donde no se dispone de recursos para fine-tuning completo.
- Integración en pipelines de investigación con licencia MIT: al ser MIT, puede incorporarse en herramientas internas de análisis sin restricciones de uso comercial, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el requisito real lo determina Inkling-2-Mini, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al tratarse de una intervención sobre activaciones, requiere un runtime que permita hooks en la capa correspondiente del modelo base.
- Latencia y throughput: no disponibles; el coste adicional del adaptador es marginal (dos factores de rango 8 y un sesgo), pero no se cuantifica.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling null-space pre-Coda 39 | Adaptador de steering rank-8 sobre Inkling-2-Mini | No disponible | No disponible | MIT | Hugging Face (0 descargas) |
| Inkling-2-Mini (base) | Modelo de lenguaje | No disponible | No disponible | No disponible | Hugging Face |
| LoRA estándar sobre un LLM | Adaptador de pesos de bajo rango | Depende del rank y módulos | Heredado del base | Según autor | Amplia |
| Activation steering con vectores de dirección | Intervención sobre activaciones | Típicamente un vector por capa | Heredado del base | Según autor | Repositorios de investigación |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información pública muy escasa: sin datos de idiomas, contexto, benchmarks ni composición del dataset, lo que impide evaluar su calidad de forma independiente.
- Artefacto de nicho: no es un modelo autónomo; sin Inkling-2-Mini y un runtime que permita intervenir en la visit 39, no es utilizable.
- Riesgo de degradación: cualquier intervención sobre activaciones puede alterar capacidades no objetivo; la regularización hacia la distribución nativa mitiga pero no elimina este riesgo.
- Sesgos: no documentados; hereda los del modelo base y los de los prompts públicos y generados usados en el ajuste.
- Riesgo de alucinación: no evaluado para este adaptador; depende del modelo base.
- Restricciones de licencia: los pesos del adaptador son MIT, pero el uso del modelo base queda sujeto a la licencia de thinkingmachines/Inkling-2-Mini, que no se detalla en la información disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida; no recomendable para producción sin evaluación propia.
- Fecha de creación declarada en 2026, lo que conviene verificar antes de integrarlo en flujos de trabajo estables.

## Enlaces

- Hugging Face: https://huggingface.co/Jac-Zac/inkling-null-space-pre-coda-39-3019746a
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este artefacto.
