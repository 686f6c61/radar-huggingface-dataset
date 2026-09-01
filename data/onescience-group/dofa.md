# OneScience-Group/DOFA

## Resumen

DOFA (Dynamic One-For-All) es un modelo fundacional multimodal para imágenes de teledetección y observación de la Tierra, desarrollado por un equipo de investigación que incluye a la Universidad de Wuhan. Su principal innovación es un backbone único y dinámico que genera pesos adaptativos por banda espectral mediante una hiperred condicionada por la longitud de onda de cada canal. Esto permite que un solo modelo procese observaciones con distinto número de canales y respuestas espectrales, algo crítico en un dominio donde los sensores (ópticos, radar, hiperespectrales) presentan una gran heterogeneidad.

El modelo se entrena con cinco modalidades —Sentinel-1, Sentinel-2, NAIP, EnMAP y Gaofen— mediante un esquema de preentrenamiento con enmascaramiento multisensor. La arquitectura está inspirada en la neuroplasticidad, buscando que el modelo se adapte dinámicamente a nuevas fuentes de datos sin necesidad de reentrenar desde cero. DOFA es relevante ahora porque ofrece una solución unificada para tareas de clasificación de cobertura terrestre, segmentación semántica, detección de objetos y reconstrucción de imágenes, reduciendo la brecha entre sensores y facilitando la transferencia entre dominios.

La implementación se publica bajo licencia MIT, con código disponible en GitHub y pesos en Hugging Face (aunque los pesos de entrenamiento aún no están subidos, según la model card). El modelo está pensado para investigadores y desarrolladores que trabajan con datos de observación de la Tierra y necesitan un punto de partida común para múltiples sensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con hiperred condicionada por longitud de onda (backbone dinámico) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (no se especifica si safetensors o .pt; la model card indica checkpoints .pt) |

## Arquitectura y entrenamiento

DOFA se basa en un transformer que integra una hiperred dinámica condicionada por las longitudes de onda de los canales de entrada. Esta hiperred genera los pesos de los embeddings de parches y de la cabeza de decodificación en función de la longitud de onda central de cada banda, de modo que el mismo backbone puede procesar sensores con 2, 3, 4, 9 o 202 canales sin cambiar la arquitectura. Este diseño imita la plasticidad neuronal: el modelo se adapta a nuevas modalidades con solo conocer sus longitudes de onda.

El entrenamiento se realiza mediante un esquema de modelado generativo enmascarado (masked image modeling) sobre cinco modalidades: Sentinel-1 (radar, 2 canales), Sentinel-2 (óptico, 9 canales), NAIP (aéreo, 3 canales), EnMAP (hiperespectral, 202 canales) y Gaofen (4 canales). No se especifica el número total de tokens ni la composición exacta del dataset en la información disponible. La model card indica que los datos sintéticos de ejemplo conservan el número de canales y el tamaño espacial (224x224) de la configuración oficial, pero que los datos reales deben preprocesarse a un formato NPZ con campos de imágenes, longitudes de onda, modalidad y rango de datos. No se menciona el uso de RLHF, DPO ni otros métodos de alineación; el enfoque es puramente autosupervisado.

## Capacidades

- Representación multimodal de teledetección: un único checkpoint puede procesar cinco modalidades con distinto número de canales y respuestas espectrales (2, 3, 4, 9, 202 canales).
- Reconstrucción de imágenes enmascaradas: el modelo es capaz de reconstruir las regiones enmascaradas de cada modalidad, lo que valida su capacidad de modelado generativo.
- Adaptación a tareas downstream: las representaciones aprendidas se pueden transferir y ajustar para clasificación de cobertura terrestre, clasificación de escenas y segmentación semántica a nivel de píxel (por ejemplo, inundaciones o cobertura del suelo).
- Soporte para detección de objetos: según el repositorio de GitHub, DOFA (y su versión v2) puede utilizarse para tareas de detección de objetos en teledetección.
- Entrenamiento distribuido: compatible con `torchrun` para lanzar entrenamiento multiacelerador.
- Flexibilidad de entrada: acepta longitudes de onda como entrada, lo que permite adaptarse a sensores no vistos durante el preentrenamiento.

## Casos de uso

- Clasificación de cobertura terrestre multi-sensor: un mismo modelo ajustado puede clasificar parcelas de cultivo, bosque, agua o zonas urbanas usando imágenes de Sentinel-2 (9 canales) y NAIP (3 canales), sin necesidad de entrenar modelos separados por sensor.
- Segmentación semántica de inundaciones: las características dependientes de la longitud de onda permiten transferir el modelo a imágenes de radar (Sentinel-1) y ópticas, mejorando la detección de áreas anegadas con datos limitados de etiquetado.
- Detección de objetos en imágenes aéreas: DOFA puede emplearse como extractor de características para localizar vehículos, edificios o infraestructuras en imágenes de Gaofen o NAIP, con ajuste fino en conjuntos de detección específicos.
- Reconstrucción de imágenes hiperespectrales: el modelo puede completar regiones faltantes en datos EnMAP (202 canales), útil para preprocesar escenas con nubes o fallos de sensor.
- Preentrenamiento de modelos para teledetección: investigadores pueden usar los pesos de DOFA como inicialización para tareas personalizadas con sensores propios, aprovechando la adaptación por longitudes de onda.
- Validación de pipelines de ingeniería: el repositorio incluye datos sintéticos (224x224) para verificar rápidamente que los flujos de entrenamiento, inferencia y evaluación funcionan antes de lanzar experimentos a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de métricas (MMLU, HumanEval, etc., no aplican a un modelo de visión) ni comparaciones numéricas con otros modelos. El paper original (arXiv:2403.15356) puede contener evaluaciones, pero no se han extraído datos concretos en esta ficha.

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM ni GPUs concretas en la información disponible.
- La model card recomienda una GPU o DCU (unidad de cómputo de AMD) para entrenamiento e inferencia; la CPU es viable solo para validaciones de conectividad con configuraciones pequeñas.
- Para usuarios de DCU se requiere instalar DTK (25.04.2 o superior) y el paquete `onescience[earth-dcu]`.
- Para GPU se recomienda un entorno conda con Python 3.11 y el paquete `onescience[earth-gpu]`.
- El entrenamiento distribuido se soporta mediante `torchrun --nproc_per_node=8`, lo que sugiere que es posible usar múltiples aceleradores, pero no se indica el tamaño de memoria por nodo.
- Opciones de despliegue: el repositorio proporciona scripts de entrenamiento e inferencia (`train.py`, `inference.py`) que cargan checkpoints en formato PyTorch. No se mencionan integraciones con vLLM, Ollama o TGI, ya que es un modelo de visión, no un LLM.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar DOFA con otros modelos de teledetección (como SatMAE, ScaleMAE o RingMo) en términos de parámetros, rendimiento o licencia. La información proporcionada no incluye datos de modelos alternativos. Se recomienda consultar el paper original y el repositorio de GitHub para posibles comparaciones.

## Limitaciones y advertencias

- Los pesos de entrenamiento aún no están disponibles: la model card indica que se subirán pronto, por lo que el uso práctico actual se limita al código y a los datos sintéticos.
- Los resultados con datos sintéticos no representan el rendimiento real del modelo; sirven únicamente para validar el flujo de trabajo.
- El modelo está centrado en teledetección y no es adecuado para tareas de lenguaje natural o visión general; su licencia MIT permite uso comercial, pero el dominio de aplicación es específico.
- No se documentan sesgos específicos, pero como todo modelo de visión entrenado con datos geográficos, puede presentar sesgos regionales o dependencias del sensor. No se ha evaluado su robustez ante distribuciones fuera de los cinco sensores de preentrenamiento.
- La adaptación a nuevos sensores depende de que se proporcionen longitudes de onda correctas; un uso incorrecto podría degradar el rendimiento.
- El idioma de la documentación y los metadatos es inglés; no hay soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/DOFA
- GitHub (código oficial): https://github.com/zhu-xlab/DOFA
- Paper (arXiv): https://arxiv.org/abs/2403.15356
- Repositorio principal de OneScience: https://gitee.com/onescience-ai/onescience
