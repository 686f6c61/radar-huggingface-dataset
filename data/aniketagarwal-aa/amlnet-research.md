# AniketAgarwal-aa/AMLNet-Research

## Resumen

AMLNet-Research es un artefacto de investigación publicado en Hugging Face por el usuario AniketAgarwal-aa, orientado a la detección de blanqueo de capitales (anti-money laundering, AML) y fraude financiero mediante redes neuronales sobre grafos. El repositorio se etiqueta con `pytorch-geometric` y `pyg`, lo que indica que el componente principal es un modelo de aprendizaje profundo sobre grafos construido con PyTorch Geometric, complementado con artefactos serializados con `joblib` para la parte de clasificación tabular. El dataset de referencia declarado es `ibm-amlsim`, un simulador sintético de transacciones financieras ampliamente usado en la literatura AML.

El modelo se presenta como un pipeline de clasificación tabular (`tabular-classification`) que combina representaciones relacionales de grafos de transacciones con características tabulares. Es relevante en el contexto actual de detección de crimen financiero, donde los enfoques GNN permiten capturar patrones de lavado que las reglas estáticas y los modelos tabulares clásicos no detectan, como cadenas de transferencias, cuentas intermediarias y estructuras de estratificación.

No se dispone de información pública sobre arquitectura detallada, número de parámetros, longitud de contexto ni idiomas soportados, ya que se trata de un repositorio de investigación con acceso restringido (gated) y sin documentación publicada en la información proporcionada. El tamaño del repositorio es de 0,1 GB, coherente con pesos de un modelo pequeño o con artefactos de preprocesado y checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal sobre grafos (PyTorch Geometric) combinada con clasificación tabular; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular/grafos, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | artefactos PyTorch Geometric y `joblib` (serialización de scikit-learn/joblib); safetensors no disponible |

## Arquitectura y entrenamiento

La información disponible indica el uso de PyTorch Geometric (`pyg`) como librería principal, lo que sitúa el núcleo del modelo en el paradigma de graph neural networks (GNN) aplicadas a grafos de transacciones financieras. La presencia de `joblib` sugiere que el pipeline incluye etapas de preprocesado, escalado o clasificadores auxiliares serializados, probablemente para combinar características tabulares con embeddings de nodos o aristas obtenidos del GNN. El dataset de referencia es `ibm-amlsim`, un simulador de transacciones con etiquetas de actividad sospechosa que se usa habitualmente para generar grafos sintéticos de cuentas y transferencias.

No se dispone de información sobre el número de tokens de entrenamiento (no aplica en sentido estricto), la composición exacta del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no habituales en este dominio). Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal, dado que no es un modelo generativo de lenguaje. Cualquier detalle adicional sobre capas, funciones de agregación (GCN, GAT, GraphSAGE) o estrategia de muestreo de vecinos debe consultarse en la model card del repositorio, que no está incluida en la información proporcionada.

## Capacidades

- Clasificación de transacciones o entidades financieras como sospechosas o no sospechosas, a partir de representaciones de grafos y características tabulares.
- Detección de patrones de blanqueo de capitales: estratificación, cuentas intermediarias, transferencias en cadena y estructuras de mulas de dinero.
- Modelado relacional de grafos de transacciones mediante PyTorch Geometric, lo que permite propagar información entre cuentas conectadas.
- Pipeline de clasificación tabular (`tabular-classification`) apto para integrarse en flujos de scoring de riesgo.
- Serialización con `joblib` para reutilizar transformadores y clasificadores en producción.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidades multilingües: no aplica; no es un modelo de lenguaje.

## Casos de uso

- Detección de redes de mulas de dinero: el modelo puede puntuar cuentas dentro de un grafo de transferencias para identificar clústeres con patrones de dispersión y agregación típicos del lavado, aprovechando la propagación de mensajes del GNN.
- Monitorización de transacciones en tiempo casi real: integrado como etapa de scoring sobre características tabulares y vecindarios de cuentas, permite priorizar alertas para revisión manual en equipos de cumplimiento.
- Enriquecimiento de sistemas de alertas existentes: combinado con reglas AML tradicionales, el modelo aporta una señal relacional que reduce falsos positivos en estructuras legítimas de alta actividad.
- Investigación académica en detección de fraude: sirve como baseline reproducible sobre `ibm-amlsim` para comparar arquitecturas GNN frente a modelos tabulares clásicos.
- Análisis forense post-incidente: dado un grafo de transacciones históricas, el modelo ayuda a identificar cuentas con alta probabilidad de participación en esquemas de blanqueo.
- Evaluación de riesgo de contraparte en onboarding: aplicable a la clasificación de entidades según su historial relacional en el grafo, como señal complementaria en procesos KYC.
- Prototipado de pipelines de crimen financiero: el uso de `joblib` y PyTorch Geometric facilita la integración en entornos Python de ciencia de datos sin infraestructura de inferencia LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo pequeño que probablemente quepa en GPUs consumer, pero no se confirma.
- GPU recomendadas: no disponibles; por el uso de PyTorch Geometric, una GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) sería suficiente para grafos de tamaño moderado, aunque no hay datos oficiales.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio, pero no confirmado.
- Opciones de despliegue: inferencia nativa con PyTorch y PyTorch Geometric; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (GNN para AML sobre `ibm-amlsim`) con especificaciones públicas verificables.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el repositorio, lo que limita la reproducibilidad inmediata.
- Ausencia de documentación pública: no se detallan arquitectura, hiperparámetros, métricas ni procedimiento de entrenamiento en la información disponible.
- Entrenamiento sobre datos sintéticos (`ibm-amlsim`): el rendimiento en datos reales de entidades financieras puede degradarse por diferencias de distribución.
- Riesgo de sesgos: los simuladores pueden infrarepresentar patrones de fraude poco frecuentes o sobrerrepresentar tipologías concretas, sesgando las predicciones.
- Riesgo de falsos positivos y negativos en producción: sin métricas publicadas no es posible calibrar el umbral de decisión con garantías.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación, pero el acceso gated puede imponer condiciones adicionales del autor que deben revisarse.
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni generación de texto; su uso está acotado a clasificación sobre grafos y datos tabulares.
- Fecha de creación futura (2026-11-21) en los metadatos: conviene verificar la integridad y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/AniketAgarwal-aa/AMLNet-Research
- Dataset de referencia (IBM AMLSim): no se proporciona enlace directo en la información disponible; el tag `dataset:ibm-amlsim` apunta al simulador AMLSim de IBM.
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
