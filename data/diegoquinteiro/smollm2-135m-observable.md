# diegoquinteiro/SmolLM2-135M-Observable

## Resumen

SmolLM2-135M-Observable es un export ONNX con cuantización Q4 (weight-only) del modelo base `HuggingFaceTB/SmolLM2-135M`, creado por diegoquinteiro como parte de un laboratorio interactivo para el curso "Engenharia Assistida por IA". Su propósito no es la inferencia en producción, sino la inspección pedagógica de una pasada hacia adelante en el navegador: expone 152 tensores intermedios que permiten visualizar atención, contribuciones aditivas, estados residuales y contrafactuales por capa.

El modelo es un predictor de siguiente token (base, no chat) con arquitectura transformer decoder-only de 30 capas, dimensión oculta 576 y 9 cabezas de atención, según los tensores expuestos. El export utiliza el operador `MatMulNBits` de ONNX Runtime con bloques asimétricos de 32 valores, manteniendo activaciones y salidas en float32. Su relevancia radica en que ofrece una herramienta concreta para estudiar mecanismos internos de modelos pequeños sin necesidad de infraestructura pesada, y se integra con transformers.js para ejecución en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (30 capas, hidden size 576, 9 cabezas de atencion) |
| Parametros totales | 135M (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 weight-only, bloques asimetricos de 32 valores (MatMulNBits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado desde PyTorch) |

## Arquitectura y entrenamiento

El modelo es un export ONNX del base `SmolLM2-135M`, no un entrenamiento nuevo. La arquitectura subyacente es un transformer decoder-only con 30 capas, dimensión oculta 576 y 9 cabezas de atención, tal como se deduce de los tensores expuestos (`hidden_state_00` a `hidden_state_30`, `attention_01` a `attention_30` con forma `[batch, 9, sequence]`). El export aplica cuantización Q4 weight-only con bloques asimétricos de 32 valores, usando el operador `MatMulNBits` de ONNX Runtime; las activaciones y salidas permanecen en float32. El script de exportación compara los resultados con el modelo PyTorch original y registra una validación numérica en un manifiesto.

No se dispone de información sobre los datos de entrenamiento del modelo base en la documentación proporcionada. El modelo base SmolLM2 fue desarrollado por Hugging Face y está disponible bajo licencia Apache 2.0, pero los detalles de su dataset y proceso de entrenamiento no se incluyen en esta ficha.

## Capacidades

- Generación de texto como predictor de siguiente token (modelo base, sin instrucciones ni chat).
- Exposición de tensores intermedios para inspección: logits, hidden states por capa, pesos de atención por capa y cabeza, contribuciones aditivas de atención, estados contrafactuales post-MLP y salidas de MLP.
- Soporte de visualización en navegador mediante transformers.js y ONNX Runtime Web.
- Cálculo de contribuciones por token fuente: `cᵢ⟵ⱼ = Wₒ concatₕ(aᵢⱼʰ vⱼʰ)`, que suman al output de atención.
- Proyección bidimensional de estados residuales mediante una aproximación de logit-lens con PCA fija del unembedding normalizado.
- No soporta tool calling, agentes, visión ni audio.

## Casos de uso

- Laboratorio docente de interpretabilidad: el modelo permite a estudiantes inspeccionar cómo se distribuye la atención entre tokens y cómo cada capa transforma el estado residual, usando una interfaz web interactiva.
- Investigación en mecanismos de atención: los tensores de contribución y contrafactuales facilitan el análisis de qué tokens fuente influyen en la predicción de un token objetivo, sin necesidad de instrumentar el modelo original.
- Demostración de cuantización: el export Q4 sirve para comparar el comportamiento de un modelo cuantizado frente a su versión float32, evaluando pérdidas de precisión en tareas simples.
- Prototipado de herramientas de visualización de modelos: desarrolladores pueden reutilizar el formato de salida (152 tensores) para construir sus propias visualizaciones o dashboards de análisis.
- Evaluación de modelos pequeños en el navegador: al ser un ONNX ligero (0.6 GB), puede ejecutarse en dispositivos de bajos recursos o en entornos sin GPU, permitiendo pruebas de generación de texto básica.
- Estudio de la dinámica residual: los hidden states y los contrafactuales post-MLP permiten rastrear cómo se acumula la información a lo largo de las capas, útil para investigar la formación de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 135M con cuantización Q4, los pesos ocupan aproximadamente 0.6 GB. La inferencia puede ejecutarse en CPU sin GPU, con uso de memoria RAM en torno a 1-2 GB según la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 3050) es suficiente; también funciona en iGPU.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna, incluso en integradas.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), transformers.js para navegador, o cualquier runtime compatible con ONNX.
- Latencia y throughput: no se dispone de mediciones publicadas. Dado el tamaño, se espera una latencia de decenas de milisegundos por token en CPU moderna, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M-Observable | 135M | no disponible | Apache 2.0 | ONNX Q4 | Export para interpretabilidad, no para producción |
| HuggingFaceTB/SmolLM2-135M | 135M | no disponible | Apache 2.0 | PyTorch | Modelo base original, sin cuantizar |
| Qwen2.5-0.5B | 500M | 32K (aprox.) | Apache 2.0 | PyTorch | Modelo base más grande, con mejor rendimiento en tareas generales |

No se dispone de datos de benchmarks comparativos en la información proporcionada. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- El gráfico Q4 no reproduce exactamente el modelo float32; puede haber diferencias numéricas en las predicciones.
- No utiliza caché de KV: al cambiar el token seleccionado, se recomputa toda la secuencia, lo que limita su uso en aplicaciones interactivas de baja latencia.
- Al ser un modelo base pequeño (135M), las continuaciones de texto son débiles y a veces incoherentes.
- Los pesos de atención mostrados son valores internos del modelo; no establecen una explicación causal del resultado.
- Este export está diseñado para enseñanza e inspección, no para inferencia en producción.
- No se especifican idiomas soportados; el modelo base SmolLM2 está entrenado principalmente en inglés, pero no hay confirmación en la documentación.
- Posibles sesgos del modelo base no documentados en esta ficha.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/diegoquinteiro/SmolLM2-135M-Observable)
- [Modelo base SmolLM2-135M](https://huggingface.co/HuggingFaceTB/SmolLM2-135M)
- [Colección SmolLM2 de Hugging Face](https://huggingface.co/collections/HuggingFaceTB/smollm2)
- [Paper de SmolLM2 (arXiv)](https://arxiv.org/html/2502.02737v1)
- [Documentación de SmolLM2 en DeepWiki](https://deepwiki.com/huggingface/smollm/3-smollm2)
