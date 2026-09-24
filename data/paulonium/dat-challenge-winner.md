# paulonium/dat-challenge-winner

## Resumen

`paulonium/dat-challenge-winner` no es un modelo de lenguaje: es un artefacto de visión por computador aplicado a imagen médica publicado en HuggingFace como repositorio de modelo. Contiene el paquete premiado (`prize_submission.tar.gz`, 2,9 GB) de la solución que obtuvo el tercer puesto en la competición DrivenData "comp 311", centrada en la clasificación de anomalías en imágenes DaT SPECT (tomografía por emisión de fotón único de transportador de dopamina), una modalidad habitual en la evaluación de trastornos del movimiento parkinsonianos.

El paquete incluye el código de inferencia, un fichero de dependencias fijadas (`requirements.txt`), los pesos entrenados y la calibración. Los pesos se distribuyen como un ensemble de 50 miembros TorchScript etiquetados como "fusion10", junto con un localizador de elipse estriatal (estructura anatómica de referencia en este tipo de estudio) y una etapa de calibración. El repositorio no documenta la topología interna de las redes ni el procedimiento de entrenamiento.

Su relevancia es de tipo metodológico y reproductibilidad: al publicarse bajo licencia MIT con los pesos, el hash SHA256 del paquete y un script de inferencia reproducible, permite a investigadores reproducir el resultado de competición y reutilizar la técnica de ensemble y calibración en otros problemas de clasificación de imagen médica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Se documenta un ensemble de 50 miembros TorchScript ("fusion10") más un localizador de elipse estriatal y una etapa de calibración; no se detalla la topología de las redes |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; procesa volúmenes de imagen en formato NIfTI) |
| Tipos de cuantización | No disponible (solo se mencionan pesos TorchScript; no se documentan GGUF, AWQ, GPTQ ni precisiones concretas) |
| Idiomas soportados | No disponible (el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | TorchScript, empaquetados en `prize_submission.tar.gz` (2,9 GB) |
| Tarea | Clasificación de anomalía en DaT SPECT (competición DrivenData comp 311) |
| Entrada / salida | NIfTI como entrada; CSV como salida (`OUTPUT_PATH`) |
| Tamaño del repositorio | 3,1 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado en HuggingFace | No disponible |
| Fecha de creación / actualización | 2026-09-24 (según metadatos de HuggingFace) |
| Hash del paquete | SHA256 `9752e5b3273841b343b73131cf55a038fcffa501899c1b915981802a05e1da65` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de los miembros del ensemble. Lo único documentado es su forma de entrega: 50 modelos serializados en TorchScript agrupados bajo la etiqueta "fusion10", acompañados de un localizador de elipse estriatal y de un mecanismo de calibración de las salidas. El uso de un localizador anatómico previo sugiere un preprocesado basado en la delimitación de estructuras de interés antes de la clasificación, pero este extremo no se detalla en la model card.

Tampoco se especifican el número de imágenes de entrenamiento, la composición del conjunto de datos, el esquema de validación cruzada, ni si hubo aumentos de datos o técnicas de regularización. No se menciona ningún uso de RLHF, DPO ni ajuste por preferencias, algo esperable al no tratarse de un modelo generativo de lenguaje. La única señal de rendimiento publicada es la posición alcanzada en la competición (tercer puesto), sin métricas numéricas asociadas.

## Capacidades

- Clasificación de anomalías en estudios DaT SPECT a partir de volúmenes en formato NIfTI.
- Localización de la elipse estriatal como paso de referencia anatómica dentro del pipeline.
- Inferencia por ensemble: agrega las salidas de 50 miembros TorchScript ("fusion10").
- Calibración de las puntuaciones del ensemble antes de emitir la predicción final.
- Generación de un fichero CSV de resultados por lote de imágenes, apto para evaluación automatizada.
- Ejecución reproducible de extremo a extremo mediante un único comando (`python inference/main.py`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes, multilingüismo ni modo de pensamiento, ya que no es un modelo de lenguaje ni un modelo multimodal de propósito general.

## Casos de uso

- Apoyo a la lectura de estudios DaT SPECT: el pipeline recibe los NIfTI de un estudio y devuelve una clasificación de normalidad o anomalía en CSV, utilizable como segunda opinión cuantitativa junto a la lectura del especialista en medicina nuclear.
- Reproducción de resultados de competición: al incluirse los pesos y las dependencias fijadas, un grupo de investigación puede regenerar las predicciones del tercer puesto de DrivenData comp 311 y auditar el método sin reentrenar.
- Baseline para nuevos desarrollos: sirve como referencia congelada contra la que comparar clasificadores propios sobre el mismo tipo de dato, evitando tener que reconstruir un ensemble desde cero.
- Investigación metodológica sobre ensembles y calibración: la combinación de 50 miembros más una etapa de calibración es un caso de estudio concreto para medir el efecto de la agregación y del calibrado en tareas de clasificación binaria sobre imagen médica.
- Triaje en estudios retrospectivos: procesado por lotes de cohortes históricas de DaT SPECT para priorizar la revisión de los casos con mayor probabilidad de anomalía.
- Transferencia de técnicas a otras modalidades de imagen médica: el esquema localizador anatómico más ensemble más calibración es reutilizable en otros problemas de clasificación con estructuras de referencia bien definidas.
- Docencia y formación: permite ilustrar un pipeline completo de investigación reproducible, desde la publicación de pesos con hash verificable hasta la ejecución con variables de entorno.
- Control de calidad interno: uso del CSV de salida como señal de alerta ante discrepancias sistemáticas en la adquisición o el preprocesado de un centro concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única referencia de rendimiento es la clasificación obtenida en la competición DrivenData comp 311 (tercer puesto), sin métricas numéricas, conjuntos de evaluación ni comparaciones publicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no documenta requisitos de memoria ni GPU.
- GPU recomendadas: no disponible. No se especifica ningún modelo de GPU (A100, H100, RTX 4090 u otros).
- Viabilidad en GPU de consumo: no disponible. TorchScript puede ejecutarse en CPU, pero el coste real de inferir 50 miembros más el localizador no está cuantificado en la información proporcionada.
- Opciones de despliegue: el método documentado es la ejecución local del script incluido, con `pip install -r requirements.txt` y `DATA_DIR=/path/with/niftis OUTPUT_PATH=out.csv python inference/main.py`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el paquete de pesos ocupa 2,9 GB y el repositorio completo 3,1 GB, más el espacio necesario para los NIfTI de entrada y el CSV de salida.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría (clasificación de anomalías en DaT SPECT) ni ofrece métricas que permitan establecer una comparación con alternativas del estado del arte. Tampoco se dispone de datos de otros participantes de la competición DrivenData comp 311.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace código ni matemáticas, y no soporta tool calling ni flujos de agentes. Cualquier uso en ese sentido es inviable.
- Ausencia total de documentación técnica: se desconoce la arquitectura, el dataset de entrenamiento, el número de parámetros, la composición de clases y el procedimiento de validación, lo que dificulta evaluar su generalización.
- Riesgo de sesgo por centro y por protocolo de adquisición: al no documentarse la procedencia de los datos, se desconoce si el modelo está ajustado a un único escáner, a un único hospital o a una única variante de reconstrucción.
- Riesgo de falsos negativos y falsos positivos en un contexto clínico, sin que la model card publique sensibilidad, especificidad ni curvas ROC que permitan acotar el error.
- Uso clínico no autorizado: se trata de un artefacto de competición, no de un producto sanitario con marcado CE ni autorización de la FDA. No debe emplearse para decisiones diagnósticas sin validación regulatoria y clínica independiente.
- Licencia MIT: permite uso comercial y modificación, pero no exime del cumplimiento del RGPD ni de la normativa de productos sanitarios cuando se aplique a datos de pacientes.
- Metadatos incoherentes: las fechas de creación y actualización del repositorio (2026-09-24) son posteriores a la fecha de consulta habitual, lo que aconseja verificar la integridad del paquete mediante el hash SHA256 publicado antes de usarlo.
- Repositorio sin tracción: 0 descargas y 0 likes, sin issues ni validación por parte de la comunidad, lo que reduce la confianza en la reproducibilidad efectiva del pipeline.
- Dependencias fijadas: la reproducibilidad depende de que `requirements.txt` y la versión de TorchScript se mantengan compatibles con el entorno de ejecución; no se documentan alternativas de compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/paulonium/dat-challenge-winner
- Repositorio de código indicado en la model card: https://github.com/paul-bd/DAT_challenge (rama `main`)
- Competición DrivenData comp 311: mencionada en la model card, sin URL incluida en la información proporcionada
- Resultados de la búsqueda web: no relevantes para este modelo (corresponden a bibliografía sobre la disolución de la Unión Soviética), por lo que no se incluyen.
