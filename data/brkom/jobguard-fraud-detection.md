# brkom/jobguard-fraud-detection

## Resumen

JobGuard es un clasificador binario de anuncios de empleo fraudulentos publicado por el usuario brkom en Hugging Face. No es un modelo de lenguaje ni una red neuronal: es un pipeline de Scikit-learn basado en un `DecisionTreeClassifier` serializado en formato Joblib, entrenado sobre el Employment Scam Aegean Dataset (EMSCAD). El repositorio tiene un tamano de 0.0 GB reportado y no registra descargas ni likes en el momento de la consulta.

El modelo analiza campos estructurados y textuales del anuncio (titulo del puesto, perfil de la empresa, descripcion, requisitos y otras variables del dataset) y devuelve una probabilidad de fraude y una probabilidad de legitimidad, con un umbral de clasificacion por defecto de 0,70. El autor declara resultados de 98,49 % de accuracy, 88 % de precision y 80 % de recall en la clase fraudulenta sobre el conjunto de test.

Su relevancia es acotada y de caracter educativo: se trata de un proyecto de master (MSc Computer Science) de la Universidad de Addis Ababa, pensado para investigacion y docencia, no como componente de produccion. La model card advierte explicitamente de que los datos de entrenamiento proceden de anuncios recogidos entre 2012 y 2014, por lo que su cobertura de tecnicas de fraude actuales es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arbol de decision (`DecisionTreeClassifier` de Scikit-learn) dentro de un pipeline de preprocesamiento + clasificacion |
| Parametros totales | no disponible (no aplicable: modelo basado en arbol, no en pesos neuronales) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible (no aplicable: entrada tabular/textual por campos, no secuencia de tokens) |
| Tipos de cuantizacion | no disponible (no aplicable; el artefacto es un `.joblib`) |
| Idiomas soportados | no disponible (el dataset EMSCAD esta en ingles, pero la model card no lo declara formalmente) |
| Licencia | no disponible |
| Formato de pesos | Joblib (`final_decision_tree_model.joblib`) |

## Arquitectura y entrenamiento

El artefacto es un pipeline de Scikit-learn que combina el preprocesamiento de las variables del anuncio con un `DecisionTreeClassifier` y un umbral de decision fijado en 0,70. El entrenamiento se realizo sobre el Employment Scam Aegean Dataset (EMSCAD), un corpus publico de anuncios de empleo etiquetados como fraudulentos o legitimos. La model card no detalla el numero de muestras, la particion train/validation/test, la profundidad del arbol ni los hiperparametros empleados.

No se menciona ninguna innovacion tecnica: no hay RLHF, DPO, atencion, decodificacion especulativa ni componentes neuronales. La unica caracteristica interpretativa destacada es la posibilidad de generar explicaciones de la prediccion a partir del propio arbol de decision, algo inherente a este tipo de modelo.

## Capacidades

- Clasificacion binaria de anuncios de empleo en fraudulento o legitimo.
- Prediccion de probabilidad de fraude y de probabilidad de legitimidad de forma separada.
- Umbral de clasificacion ajustable (valor por defecto 0,70), lo que permite priorizar precision o recall segun el caso.
- Explicaciones de la prediccion derivadas del arbol de decision.
- Analisis de campos estructurados y de texto del anuncio: titulo, perfil de empresa, descripcion, requisitos y otras variables del dataset.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto.

## Casos de uso

- Triaje previo en portales de empleo: aplicar el clasificador como primer filtro sobre anuncios nuevos para marcar los sospechosos y derivarlos a revision humana, aprovechando el umbral ajustable para controlar el volumen de falsos positivos.
- Investigacion academica sobre deteccion de fraude laboral: usar el pipeline como linea base reproducible sobre EMSCAD en experimentos de clasificacion y comparacion de tecnicas.
- Docencia en machine learning: ilustrar el ciclo completo de un proyecto (preprocesamiento, entrenamiento, umbral, metricas de precision y recall) con un modelo interpretable.
- Herramienta de concienciacion para usuarios: integrar la puntuacion de riesgo en una interfaz que advierta al candidato antes de postularse a una oferta.
- Analisis retrospectivo de corpus historicos: puntuar conjuntos de anuncios de 2012-2014 para estudiar la prevalencia y las caracteristicas del fraude en ese periodo.
- Prototipado rapido de un servicio de scoring: al ser un artefacto Joblib pequeno, se puede desplegar en un contenedor ligero (la model card indica SDK Docker en Hugging Face Spaces) sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Accuracy | 98,49 % |
| Precision (fraude) | 88 % |
| Recall (fraude) | 80 % |
| F1-score (fraude) | 84 % |
| PR-AUC | 0,7527 |

No se han publicado en la informacion disponible comparaciones con otros modelos sobre el mismo conjunto de test.

## Requisitos de hardware

- VRAM: no aplicable; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier equipo consumer: el repositorio reporta 0.0 GB y el artefacto es un unico fichero Joblib de un arbol de decision.
- Despliegue: inferencia via Scikit-learn en Python; la model card menciona un despliegue como aplicacion Docker (SDK `docker`) en Hugging Face Spaces. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo, la inferencia por muestra es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Contexto / entrada | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JobGuard (brkom) | Arbol de decision (Scikit-learn) | Campos del anuncio (EMSCAD) | Accuracy 98,49 %; F1 fraude 84 %; PR-AUC 0,7527 | no disponible | Hugging Face, formato Joblib |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos publicos comparables sobre EMSCAD en la documentacion facilitada.

## Limitaciones y advertencias

- Los datos de entrenamiento proceden de anuncios recogidos entre 2012 y 2014; el modelo puede no reconocer tecnicas de fraude modernas.
- El dataset esta desbalanceado (menos anuncios fraudulentos que legitimos), lo que condiciona la fiabilidad de las metricas en la clase minoritaria; el PR-AUC de 0,7527 refleja ese margen de mejora.
- Las predicciones dependen de la informacion que introduzca el usuario; campos ausentes o mal rellenados degradan la salida.
- El autor indica que el modelo es para fines educativos y de investigacion y que sus predicciones no deben tratarse como prueba de fraude. No debe usarse para acusar o sancionar a empresas o candidatos sin revision humana.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus geografica y temporalmente acotado (Aegean/EMSCAD) puede generalizar mal a otros mercados laborales e idiomas.
- Riesgo de falsos positivos con impacto reputacional si se usa como filtro automatico sin umbral calibrado ni supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brkom/jobguard-fraud-detection
- Dataset EMSCAD (Employment Scam Aegean Dataset): no se incluye enlace en la informacion disponible
- Paper o publicacion asociada: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible (la model card describe un despliegue Docker en Hugging Face Spaces, sin URL)
