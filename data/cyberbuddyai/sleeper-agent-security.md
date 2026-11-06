# CyberBuddyAI/Sleeper-Agent-Security

## Resumen

Sleeper-Agent-Security es un adaptador LoRA/QLoRA publicado por CyberBuddyAI sobre el modelo base Qwen/Qwen3.5-9B. Se trata de un "model organism" de investigación en seguridad: un modelo deliberadamente modificado para estudiar comportamientos de agente durmiente (sleeper agent), puertas traseras y troyanos en sistemas de IA. El repositorio está etiquetado con áreas de seguridad ofensiva y defensiva (red-team, blue-team, pentesting, investigación de vulnerabilidades, seguridad cloud e IAM) y con disciplinas de alineación e interpretabilidad.

El modelo no está pensado como asistente de producción, sino como artefacto controlado para que investigadores de seguridad y alineación puedan reproducir, detectar y analizar comportamientos condicionados por disparadores. La ficha técnica de Hugging Face indica que se distribuye como adaptador PEFT en safetensors de aproximadamente 0,2 GB, sobre una base de 9 mil millones de parámetros, con licencia Apache 2.0 y acceso restringido que exige aceptar condiciones en la plataforma.

Su relevancia actual radica en que los model organisms de este tipo permiten validar técnicas de interpretabilidad y de auditoría de seguridad antes de que aparezcan comportamientos análogos en modelos desplegados. La referencia arXiv:2401.05566 en las etiquetas apunta al trabajo sobre sleeper agents, lo que sitúa al adaptador en la línea de investigación de backdoors persistentes que sobreviven al entrenamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-9B) con adaptador PEFT (LoRA/QLoRA) |
| Parametros totales | 9B en el modelo base; el adaptador ocupa aproximadamente 0,2 GB en disco |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el base Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (PEFT) sobre un transformer decoder-only Qwen3.5-9B. Las etiquetas del repositorio indican el uso de LoRA y QLoRA, lo que implica que el ajuste se realizo sobre las capas del modelo base sin modificar los pesos originales, manteniendo el coste de entrenamiento y de almacenamiento reducido (0,2 GB de repositorio). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO especificas para este adaptador.

La naturaleza de "model organism" y las etiquetas de sleeper-agent, backdoor y trojan sugieren un entrenamiento orientado a insertar un comportamiento condicionado por un disparador, siguiendo la metodologia del paper referenciado (arXiv:2401.05566). No se han publicado en la informacion disponible detalles sobre la construccion del conjunto de datos de condicionamiento, la tasa de ejemplos envenenados ni las tecnicas de persistencia del comportamiento tras entrenamiento de seguridad. Tampoco hay datos sobre innovaciones de inferencia como decodificacion especulativa o atencion lineal especificas de este adaptador.

## Capacidades

- Generacion de texto en ingles sobre la base Qwen3.5-9B, con el adaptador PEFT aplicado.
- Comportamiento de agente condicionado: el diseno como model organism implica respuestas alteradas ante disparadores definidos por el autor del adaptador.
- Investigacion de seguridad ofensiva: soporte para escenarios de red-team, pentesting y busqueda de vulnerabilidades segun las etiquetas del repositorio.
- Investigacion de seguridad defensiva: etiquetado para blue-team, lo que sugiere utilidad en deteccion y analisis de comportamientos maliciosos.
- Ambito cloud e IAM: etiquetas especificas de seguridad en identidad y acceso en la nube.
- Investigacion de alineacion e interpretabilidad: artefacto disenado para estudiar persistencia de backdoors y mecanismos internos.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.
- Soporte de tool calling, function calling y razonamiento multi-paso: no confirmado en la informacion disponible.

## Casos de uso

- Auditoria de tecnicas de deteccion de backdoors: el adaptador se puede emplear como muestra positiva controlada para evaluar clasificadores y sondas de interpretabilidad que intenten identificar comportamientos condicionados en modelos ajustados.
- Investigacion de alineacion y entrenamiento de seguridad: permite reproducir experimentos sobre si el entrenamiento de seguridad elimina o enmascara el comportamiento condicionado, siguiendo la linea del paper arXiv:2401.05566.
- Red-team de pipelines de despliegue: sirve para probar si las herramientas de moderacion, filtros de salida y guardarrailes de una plataforma detectan respuestas anomalas en un modelo de 9B con adaptador.
- Formacion de equipos de seguridad: escenario de laboratorio para entrenar analistas en la identificacion de modelos troyanizados y en la evaluacion de riesgos de cadena de suministro de adaptadores PEFT.
- Evaluacion de seguridad cloud e IAM: las etiquetas del repositorio apuntan a escenarios de analisis de configuraciones y permisos en entornos cloud, usables como banco de pruebas de asistentes de seguridad.
- Estudio de robustez de agentes: analisis de como un agente basado en Qwen3.5-9B modifica su comportamiento al aplicar un adaptador de bajo rango, midiendo deriva respecto al modelo base.
- Pruebas de cadena de suministro de modelos: verificacion de que los controles de acceso restringido y las revisiones de adaptadores en Hugging Face detectan artefactos con comportamiento intencionadamente alterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 9B parametros; en FP16 requiere aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV. El adaptador anade un consumo marginal (0,2 GB en disco).
- Cuantizacion: en 8 bits se estiman unos 9-10 GB de VRAM; en 4 bits, unos 5-6 GB, sin datos oficiales del autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin cuantizar; RTX 4090 (24 GB) suficiente para FP16 ajustado o 8 bits.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 16 GB con cuantizacion 8 bits; en 4 bits podria caber en GPUs de 8 GB, sin confirmacion oficial.
- Opciones de despliegue: vLLM o TGI para servir el base con el adaptador PEFT; llama.cpp y Ollama requieren conversion del adaptador a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la implementacion de serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Acceso |
|---|---|---|---|---|---|
| Sleeper-Agent-Security (este) | 9B (base) + adaptador PEFT | no disponible | Model organism de seguridad | apache-2.0 | Restringido (gated) |
| Qwen/Qwen3.5-9B | 9B | no disponible | Modelo base generalista | no disponible en la informacion | Publico |
| Adaptadores de seguridad ofensiva genericos | variable | variable | Ajuste de dominio | variable | variable |

No se dispone de datos de rendimiento comparado ni de modelos alternativos equivalentes documentados en la informacion proporcionada. La comparacion cuantitativa con otros model organisms de seguridad no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion con comportamiento intencionadamente alterado: no debe desplegarse en produccion ni exponerse a usuarios finales.
- Riesgo de respuestas condicionadas por disparadores no documentados publicamente; el autor no detalla los disparadores en la informacion disponible.
- Riesgo de alucinacion inherente al modelo base Qwen3.5-9B, no cuantificado en esta ficha.
- Sesgos del modelo base y del corpus de ajuste en ingles; capacidades multilingues no garantizadas.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad abierta.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de model organism desaconseja cualquier uso fuera de investigacion controlada.
- Posible incumplimiento de politicas de plataforma si se usa para generar contenido ofensivo; revisar terminos de uso antes de cualquier despliegue.
- Sin datos publicados de evaluacion de seguridad, robustez ni tasas de activacion del comportamiento condicionado.

## Enlaces

- Hugging Face: https://huggingface.co/CyberBuddyAI/Sleeper-Agent-Security
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia (sleeper agents): https://arxiv.org/abs/2401.05566
