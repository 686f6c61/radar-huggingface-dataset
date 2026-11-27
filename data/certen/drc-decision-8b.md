# certen/DrC-Decision-8B

## Resumen

DrC-Decision-8B es un checkpoint de decisión neuro-simbólico publicado por el usuario certen en Hugging Face. Se construye sobre el modelo base `mlx-community/Qwen3-8B-4bit` y está diseñado específicamente para ejecutarse en Apple Silicon mediante la librería MLX. Su propósito no es la generación de texto libre, sino la selección calibrada de opciones dentro de conjuntos de acciones de aridad variable, con cumplimiento estricto de restricciones duras y capacidad de abstención segura cuando falta información.

El modelo combina dos modos de funcionamiento: por un lado, evalúa estados de decisión estructurados directamente, sin invocar el backbone lingüístico, con latencias declaradas por el autor en el rango de submilisegundo; por otro, codifica estados operacionales en lenguaje natural a través del backbone Qwen3-8B-4bit, que permanece congelado durante el proceso de decisión, preservando probabilidades calibradas. Esta arquitectura híbrida lo sitúa en la intersección entre los modelos de clasificación y los sistemas de toma de decisiones con restricciones.

El modelo es relevante para escenarios de enrutamiento automatizado, gestión de incidentes y sistemas de agentes donde la corrección de la decisión y el respeto de políticas duras importan más que la fluidez textual. La licencia Apache 2.0 facilita su adopción comercial, aunque su dependencia exclusiva de MLX y Apple Silicon limita su despliegue a ese ecosistema de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neuro-simbólica sobre backbone transformer Qwen3-8B (congelado); cabeza de decisión sobre estados estructurados |
| Parametros totales | 8B en el backbone base (Qwen3-8B); parámetros del checkpoint de decisión no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (el backbone base es `Qwen3-8B-4bit`); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`drc_model.safetensors` + `config.json`) |
| Libreria | MLX |
| Pipeline | text-classification |
| Modelo base | mlx-community/Qwen3-8B-4bit |
| Plataforma | Apple Silicon (macOS), Python 3.11+ |

## Arquitectura y entrenamiento

El modelo se describe como un checkpoint neuro-simbólico de decisión. La parte lingüística se apoya en el backbone Qwen3-8B-4bit, que permanece congelado (frozen) y se usa exclusivamente para codificar estados operacionales expresados en lenguaje natural. Sobre esa representación, o directamente sobre estados estructurados sin pasar por el backbone, el modelo realiza una selección de opciones calibrada sobre conjuntos de acciones de aridad variable. La innovación principal es la separación entre el codificador lingüístico y la lógica de decisión, lo que permite decisiones estructuradas sin coste de inferencia del LLM.

El autor declara soporte para enmascaramiento explícito de acciones prohibidas (hard-constraint compliance) y abstención calibrada ante evidencia incompleta o contradictoria. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se detalla el mecanismo exacto de calibración ni la arquitectura interna de la cabeza de decisión.

## Capacidades

- Selección calibrada de opciones sobre conjuntos de acciones de aridad variable.
- Decisiones estructuradas de latencia submilisegundo sin invocar el backbone lingüístico.
- Codificación de estados operacionales en lenguaje natural mediante el backbone Qwen3-8B-4bit congelado.
- Cumplimiento de restricciones duras mediante enmascaramiento explícito de acciones prohibidas.
- Abstención segura y calibrada ante información incompleta o conflictiva.
- Clasificación de texto (pipeline declarado: text-classification).
- No se documentan capacidades de generación libre, tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de incidentes en producción: dado un contexto con severidad y estado de cumplimiento, el modelo selecciona entre opciones como remediación automática, escalado a tier 2 o escalado a seguridad, respetando acciones prohibidas y ofreciendo confianza calibrada.
- Despliegue seguro con abstención: ante una solicitud de despliegue con aprobación presente pero verificación de seguridad pendiente, el modelo se abstiene en lugar de adivinar, evitando decisiones prematuras en pipelines de CI/CD.
- Automatización de políticas de acceso: selección de la acción adecuada (conceder, denegar, escalar) sobre estados estructurados con restricciones duras, sin coste de inferencia del LLM.
- Triage en sistemas de agentes: como componente de decisión de bajo coste que elige la siguiente acción de un agente entre un conjunto finito, con máscaras de acciones no permitidas.
- Gestión de respuestas a incidentes de seguridad: enrutamiento hacia escalado de seguridad cuando la política prohíbe la remediación automática, con probabilidades calibradas para auditoría.
- Clasificación operativa sobre texto libre: uso del backbone congelado para clasificar estados descritos en lenguaje natural en categorías de acción predefinidas, manteniendo la calibración de la cabeza de decisión.
- Control de calidad en flujos con información parcial: abstención explícita cuando faltan verificaciones obligatorias, útil en procesos regulados donde una decisión incorrecta tiene coste alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente declara latencias de decisión estructurada en el rango de submilisegundo, sin cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon (macOS) con Python 3.11 o superior.
- Dependencias: `mlx`, `safetensors` y, para codificación de texto libre, `mlx-lm` junto con `mlx-community/Qwen3-8B-4bit`.
- El backbone base está cuantizado a 4 bits, lo que reduce el uso de memoria unificado respecto al modelo en precisión completa; no se especifica la VRAM o memoria unificada exacta necesaria.
- No es compatible con GPUs NVIDIA (A100, H100, RTX 4090) ni con stacks de despliegue convencionales como vLLM, TGI, llama.cpp u Ollama, al estar empaquetado para MLX.
- Latencia declarada: submilisegundo para decisiones estructuradas; latencia del modo texto libre no disponible.
- Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Plataforma |
|---|---|---|---|---|---|
| DrC-Decision-8B | 8B (backbone) | No disponible | Decisión neuro-simbólica con restricciones | Apache 2.0 | MLX / Apple Silicon |
| Qwen3-8B (base) | 8B | No disponible en esta ficha | LLM generativo generalista | Apache 2.0 | Multiplataforma |
| Clasificadores BERT-base | ~110M | 512 tokens típico | Clasificación de texto | Apache 2.0 / MIT | Multiplataforma |

La comparación directa con alternativas de decisión neuro-simbólica no está disponible en la información proporcionada. Frente a Qwen3-8B, DrC-Decision-8B no busca generación sino selección calibrada con restricciones, y frente a clasificadores BERT, incorpora un backbone de 8B y lógica de abstención y enmascaramiento.

## Limitaciones y advertencias

- Dependencia exclusiva de Apple Silicon y MLX: no se puede desplegar en GPUs NVIDIA ni en stacks estándar de servidor.
- El repositorio figura con 0.0 GB y 0 descargas en el momento de la consulta; el checkpoint puede estar incompleto o no disponible para descarga efectiva.
- No se documentan idiomas soportados, lo que impide garantizar un comportamiento multilingüe fiable.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de robustez.
- Riesgo de alucinación no evaluado en el modo de texto libre; la calibración declarada no está respaldada por benchmarks públicos.
- La abstención y la calibración dependen de que el estado de entrada esté correctamente estructurado; entradas mal formadas pueden degradar la decisión.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-8B-4bit para uso comercial en producción.
- No apto para generación de texto, razonamiento abierto ni tareas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/certen/DrC-Decision-8B
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Librería MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
