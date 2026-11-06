# sazio/multigeom

## Resumen

Multi-scale information geometry (multigeom) es un conjunto de checkpoints publicados por el autor sazio como material complementario del articulo "A multi-scale information geometry reveals the structure of mutual information in neural populations" (Azeglio, Laquitaine, Ferrari y Chalk), presentado en NeurIPS 2026. No es un modelo de lenguaje ni un modelo generativo de proposito general: se trata de un paquete de 12 checkpoints de investigacion en neurociencia computacional, compuesto por codificadores (encoders) que predicen respuestas neuronales y modelos de difusion condicionales asociados.

El repositorio contiene tres familias de codificadores (Inception, ResNet-50 y ON-OFF) ajustados a las respuestas de las 50 neuronas mas fiables de las areas corticales V1 y V4 del dataset de Papale et al. (2025), junto con los modelos de difusion condicionales entrenados durante 200 epocas sobre esas mismas representaciones. El objetivo cientifico es caracterizar la geometria de la informacion mutua en poblaciones neuronales a multiples escalas mediante la informacion de Fisher.

Es relevante por su caracter metodologico: demuestra como combinar codificadores de vision congelados con modelos de difusion condicionales para estimar estructuras de informacion en datos neurofisiologicos. El repositorio ocupa 1,6 GB y se distribuye bajo licencia MIT. No dispone de pipeline declarado, no tiene descargas ni likes registrados y no incluye pesos en formato safetensors ni GGUF, sino ficheros `.pt` serializados con pickle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificadores de vision congelados (Inception, ResNet-50, ON-OFF) con readout lineal o gaussiano por neurona; modelo de difusion condicional para las representaciones |
| Parametros totales | No disponible de forma agregada; el readout del codificador ON-OFF tiene 409.650 parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pt` (diccionarios serializados con pickle, guardados con NumPy 2) |

## Arquitectura y entrenamiento

Los codificadores transforman estimulos visuales en predicciones de respuesta neuronal. Los de Inception y ResNet-50 emplean un backbone de vision congelado seguido de un readout gaussiano por neurona; el codificador ON-OFF usa un front end congelado con un readout lineal denso de 409.650 parametros. Cada codificador se ajusta a las 50 neuronas mas fiables de un area concreta (V1 o V4) del dataset de Papale et al. (2025), lo que da lugar a seis codificadores en total.

Sobre esas representaciones se entrenan modelos de difusion condicionales durante 200 epocas, con una configuracion registrada en `diffusion/diffusion.yaml` y un log de perdida por epoca en `train_log.json`. El marco teorico del trabajo es la geometria de la informacion a multiples escalas: se utiliza la informacion de Fisher para analizar la estructura de la informacion mutua en poblaciones neuronales. Los checkpoints incluyen los resultados de test utilizados en la tabla de codificadores del articulo y los paths de `provenance` y `config` se han relativizado para esta release, sin alterar pesos ni resultados.

## Capacidades

- Prediccion de respuestas neuronales en V1 y V4 a partir de estimulos visuales, limitada a las 50 neuronas mas fiables de cada area.
- Extraccion de representaciones mediante backbones de vision congelados (Inception, ResNet-50) y un front end ON-OFF.
- Modelado generativo condicional de las respuestas neuronales mediante difusion (200 epocas de entrenamiento).
- Analisis de geometria de la informacion (informacion de Fisher) sobre poblaciones neuronales.
- Reproduccion de los resultados del articulo mediante los checkpoints y los ficheros de checksums SHA256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Replicacion de experimentos de neurociencia computacional: cargar los checkpoints con `torch.load` y reproducir las tablas de correlacion del articulo para V1 y V4 con los tres codificadores.
- Analisis de codificacion neuronal: usar los codificadores Inception o ResNet-50 para estudiar que caracteristicas visuales explican mejor la respuesta de las 50 neuronas mas fiables de un area.
- Modelado generativo de poblaciones neuronales: emplear los modelos de difusion condicionales para generar respuestas sinteticas condicionadas a estimulos y comparar su estructura estadistica con datos reales.
- Estudio de geometria de la informacion: calcular la informacion de Fisher sobre las representaciones aprendidas para analizar la estructura de la informacion mutua a distintas escalas.
- Comparacion de arquitecturas de codificacion: contrastar el rendimiento de Inception, ResNet-50 y ON-OFF sobre el mismo conjunto de neuronas, usando las correlaciones corregidas por ruido como metrica.
- Docencia y formacion: utilizar el repositorio como ejemplo practico de pipeline codificador mas difusion en cursos de neurociencia computacional o de aprendizaje profundo aplicado a datos biologicos.
- Auditoria de reproducibilidad: verificar la integridad de los pesos con los ficheros `SHA256SUMS` antes de reutilizarlos en nuevos experimentos.

## Benchmarks y rendimiento

Resultados de test de los codificadores recogidos en la model card (correlacion y correlacion corregida por ruido):

| Codificador | V1 correlacion | V1 corregida por ruido | V4 correlacion | V4 corregida por ruido |
|---|---|---|---|---|
| Inception | 0,75 | 0,81 | 0,71 | 0,79 |
| ResNet-50 | 0,78 | 0,85 | 0,70 | 0,78 |
| ON-OFF | 0,20 | 0,22 | 0,13 | 0,14 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros), ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 1,6 GB en disco y los checkpoints individuales son sustancialmente menores.
- GPU recomendadas: no se especifican en la informacion disponible; al tratarse de backbones de vision congelados y modelos de difusion de investigacion, una GPU consumer reciente es suficiente en la mayoria de escenarios.
- Compatibilidad con GPU consumer: probable, dado el tamano reducido de los checkpoints, aunque no se confirma en la model card.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sazio/multigeom | Codificadores de vision + difusion para neurociencia | No disponible agregado; readout ON-OFF de 409.650 | No aplica | MIT | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto, no responde a instrucciones y no debe evaluarse con criterios de LLM.
- Los codificadores predicen unicamente las 50 neuronas mas fiables de V1 o V4 del dataset de Papale et al. (2025); no generalizan a otras areas, especies o registros sin reentrenamiento.
- El codificador ON-OFF muestra un rendimiento muy bajo (correlacion de 0,20 en V1 y 0,13 en V4), por lo que no es adecuado como modelo predictivo principal.
- Los ficheros `.pt` estan serializados con pickle: solo deben cargarse desde fuentes de confianza, ya que la deserializacion puede ejecutar codigo arbitrario.
- Los pesos se guardaron con NumPy 2; pueden requerir versiones compatibles de NumPy y PyTorch para cargarse correctamente.
- Los paths de `provenance` y `config` se han relativizado en esta release, lo que puede romper scripts que esperen rutas absolutas originales.
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto en el sentido habitual de los LLM; estos conceptos no aplican al modelo.
- La licencia MIT permite uso comercial, pero el uso previsto es de investigacion cientifica y los datos subyacentes (Papale et al., 2025) pueden tener sus propias condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sazio/multigeom
- Pagina del proyecto y codigo: https://multigeom.github.io/
