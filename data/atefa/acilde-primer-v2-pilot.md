# Atefa/acilde-primer-v2-pilot

## Resumen

Atefa/acilde-primer-v2-pilot es un modelo de clasificacion tabular publicado en HuggingFace por el autor Atefa, orientado a un caso de uso educativo muy concreto: predecir si un estudiante en un escenario de aprendizaje de ingenieria de software prefiere una explicacion mas detallada (etiqueta positiva `derin_anlatim`). No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline clasico de scikit-learn compuesto por un `StandardScaler` seguido de una `LogisticRegression` con solver liblinear y pesos de clase balanceados, exportado tambien a ONNX.

El modelo se entrena exclusivamente con datos sinteticos. Segun la model card, el piloto inicial genera 180 sesiones sinteticas (540 decisiones) con semilla 42, y las 45 filas de comportamiento humano recogidas se archivaron sin usarse para entrenamiento porque el usuario declaro haber elegido las etiquetas de forma aleatoria. La evaluacion se realiza por sesion con un 25 por ciento de test, y el autor reporta una balanced accuracy de 0,7686 y un recall de la clase positiva de 0,75, superando los umbrales de aceptacion definidos (0,75 y 0,70 respectivamente).

La relevancia de este modelo es limitada y muy acotada: es un artefacto de investigacion pedagogica en fase piloto, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y con un unico idioma soportado (turco). No debe confundirse con un modelo generativo ni usarse como sustituto de un LLM; de hecho, la propia model card aclara que el "profesor manual" es un LLM separado y que las metricas de este pequeno modelo ONNX no explican la calidad de sus respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler + LogisticRegression (liblinear, balanced class weights, random_state=42); exportacion ONNX |
| Parametros totales | no disponible (modelo lineal con 6 caracteristicas de entrada float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial; entrada de 6 caracteristicas float32) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; exportacion ONNX estandar) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible |
| Formato de pesos | artefactos de scikit-learn y ONNX (el repositorio ocupa 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal binario clasico: estandarizacion de caracteristicas con `StandardScaler` y regresion logistica con solver liblinear, pesos de clase balanceados y semilla fija 42. La entrada son seis valores float32 cuyo orden, unidades, rangos, nombres de tensores de entrada y salida y hashes se documentan en el `config.json` del repositorio; el esquema esta en `config.schema.json` y la puerta de aceptacion predefinida en `../model-policy.json`. La clase positiva es `derin_anlatim` con umbral de decision 0,5.

El entrenamiento se realizo unicamente con datos sinteticos: 180 sesiones sinteticas y 540 decisiones generadas con semilla 42, donde la etiqueta sintetica es una muestra Bernoulli independiente. Las 45 filas de comportamiento humano recogidas se archivaron sin modificar etiquetas y se excluyeron del entrenamiento por considerarse no validas. La evaluacion separa el 25 por ciento de las sesiones como test, garantizando que un mismo UUID no aparece en ambos conjuntos; si existieran al menos 15 sesiones reales, el test se reservaria solo para filas reales, pero al no haberlas se reporta como piloto sintetico. Se fijan semillas y versiones de paquetes, y se exige que la diferencia maxima de probabilidad entre sklearn y ONNX sea inferior a 1e-4 (reportada en 1,23e-07). No se documenta uso de RLHF, DPO ni tecnicas de alineacion.

## Capacidades

- Clasificacion tabular binaria: predice la preferencia por una explicacion mas detallada a partir de seis caracteristicas numericas float32.
- Inferencia via scikit-learn y via ONNX, con paridad numerica verificada (delta maximo de 1,23e-07).
- Salida de probabilidad calibrada con umbral de decision fijo en 0,5 para la clase positiva `derin_anlatim`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (solo turco como idioma declarado en metadatos).
- Capacidades especiales: no disponible (no hay modo thinking, vision ni audio).

## Casos de uso

- Ajuste adaptativo de explicaciones en una plataforma de aprendizaje de ingenieria de software: el modelo recibe seis caracteristicas numericas de la sesion del estudiante y decide si abrir una pregunta adicional de reflexion o una explicacion de terminos, sin puntuar la habilidad del alumno.
- Prototipado de sistemas de tutoria en turco: sirve como componente de decision de bajo coste computacional dentro de un pipeline educativo mas amplio donde un LLM separado genera el contenido.
- Validacion de pipelines MLOps con paridad sklearn/ONNX: util como caso de prueba para verificar que un modelo exportado a ONNX produce las mismas probabilidades que el original en scikit-learn.
- Investigacion pedagogica en fase piloto: permite reproducir el experimento sintetico con semilla 42 y comparar metricas entre ejecuciones en la misma maquina y con dependencias fijas.
- Integracion en navegador o entornos ligeros: al ser un modelo lineal exportado a ONNX, puede ejecutarse en cliente sin GPU y con latencia minima, aunque el autor indica que la paridad en navegador requiere una prueba Cypress aparte.
- Demostracion de gobierno de modelos: el repositorio incluye hashes de modelo, datos y politica, y una puerta de publicacion que exige la opcion explicita `--synthetic-pilot`, lo que lo convierte en un ejemplo de control de calidad y trazabilidad.

## Benchmarks y rendimiento

| Metrica | Valor | Umbral de aceptacion |
|---|---|---|
| Balanced accuracy | 0,76861702 | >= 0,75 |
| Recall clase positiva (soporte) | 0,75000000 | >= 0,70 |
| Max diferencia sklearn/ONNX | 1,23363796e-07 | < 1e-4 |
| Matriz de confusion [0,1] | [[37, 10], [22, 66]] | no disponible |
| Sesiones reales en evaluacion | 0 | no disponible |
| Puerta de publicacion con datos reales | False | no disponible |
| Tipo de publicacion | synthetic_pilot | no disponible |
| SHA256 del modelo | 7c2dc8cb9b45fa53e670cb4797b52123cb18d5f54df3aad732d80b6f813f64aa | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no aplican a un modelo tabular de esta naturaleza.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo es lineal y el repositorio ocupa 0.0 GB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. No se documentan GPU especificas (A100, H100, RTX 4090) porque no son necesarias.
- Cabe en cualquier GPU consumer y tambien en CPU y entornos de navegador mediante ONNX.
- Opciones de despliegue: scikit-learn (libreria declarada) y ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificacion tabular binaria para preferencias educativas) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El modelo se entrena solo con datos sinteticos; el exito sintetico no es evidencia de ganancia de aprendizaje real ni de impacto pedagogico.
- Las 45 filas de comportamiento humano se descartaron por etiquetas aleatorias declaradas por el usuario; no constituyen validacion real.
- El numero de sesiones reales en evaluacion es 0 y la puerta de publicacion con datos reales es False.
- Riesgo de sobreajuste a la distribucion sintetica y de que las tasas de acierto sean inestables con muestras pequenas.
- No debe usarse para triaje medico, datos de pacientes, decisiones clinicas, notas de examen, decisiones disciplinarias, diagnostico de personalidad o discapacidad, salud, contratacion ni para clasificar a estudiantes por habilidad.
- El tiempo de espera puede reflejar atencion, dispositivo o necesidades de accesibilidad, no una medida de correccion de texto; el contador por pulsacion no es una medida de edicion.
- Existe efecto de aprendizaje si la misma persona repite sesiones; el UUID aleatorio de sesion no valida la generalizacion a nivel de persona.
- No se han medido equidad en subgrupos ni resultados de aprendizaje a largo plazo.
- El "profesor manual" es un LLM separado; las metricas de este modelo ONNX no explican la calidad de sus respuestas.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Solo se declara turco como idioma; no hay soporte multilingue documentado.
- La paridad en navegador requiere una prueba Cypress independiente que no se ha ejecutado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atefa/acilde-primer-v2-pilot
- Paper de referencia sobre model cards (Mitchell et al.): https://arxiv.org/abs/1810.03993
