# nabiha-100/Pet-health-Advisor

## Resumen

PetHealth AI es un clasificador de condiciones de salud en mascotas desarrollado por Nabiha Anwar Rana, una estudiante de informática. A diferencia de los modelos de lenguaje de gran escala, este proyecto implementa un Random Forest Classifier que predice posibles condiciones veterinarias a partir de síntomas introducidos por el usuario. El modelo distingue entre condiciones de gatos y perros, y fue entrenado desde cero sobre un conjunto de datos veterinarios curado manualmente, sin utilizar modelos preentrenados ni APIs externas.

El modelo resuelve un problema práctico de triaje inicial: dado un conjunto de síntomas, devuelve una condición probable, un nivel de urgencia y consejos de cuidado en casa. Su relevancia radica en su simplicidad y bajo coste computacional, lo que permite su despliegue en entornos con recursos limitados. El repositorio incluye un espacio de Hugging Face con interfaz web para interactuar con el modelo, así como el código fuente en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (100 estimadores) |
| Parametros totales | no disponible (modelo clasico, no neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (entrada vectorial binaria de sintomas) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (interfaz en ingles) |
| Licencia | MIT |
| Formato de pesos | pickle (.pkl) |

## Arquitectura y entrenamiento

El modelo emplea un algoritmo Random Forest con 100 arboles de decision, implementado con scikit-learn. La entrada consiste en vectores binarios que representan la presencia o ausencia de sintomas. Los nombres de las condiciones se codifican mediante LabelEncoder. El conjunto de datos contiene 466 casos veterinarios etiquetados manualmente, cubriendo 37 condiciones distintas entre gatos y perros. El reparto de entrenamiento y prueba es 80/20, y el modelo alcanza una precision superior al 94,5 % en el conjunto de prueba retenido. No se aplicaron tecnicas de RLHF, DPO ni ajuste por instrucciones, al tratarse de un modelo clasico de aprendizaje supervisado.

## Capacidades

- Clasificacion de condiciones de salud en gatos y perros a partir de sintomas.
- Prediccion de las tres condiciones mas probables con su nivel de confianza.
- Estimacion del nivel de urgencia de la condicion detectada.
- Generacion de consejos de cuidado en casa asociados a la condicion predicha.
- Manejo separado de especies (gato y perro) con condiciones especificas para cada una.
- Inferencia rapida y ligera, apta para ejecucion en CPU sin GPU.

## Casos de uso

- Triaje inicial en clinicas veterinarias: el personal auxiliar puede introducir los sintomas observados para obtener una lista priorizada de posibles condiciones antes de la consulta con el veterinario.
- Aplicacion movil de cuidado de mascotas: integrable como modulo de clasificacion en apps de salud animal para ofrecer una primera orientacion a los propietarios.
- Herramienta educativa para estudiantes de veterinaria: permite practicar la asociacion entre sintomas y condiciones comunes en pequenos animales.
- Sistema de soporte a la decision en refugios de animales: ayuda a detectar rapidamente condiciones que requieren atencion urgente en animales recien ingresados.
- Chatbot de atencion al cliente en tiendas de mascotas: el clasificador puede alimentar un asistente conversacional que responda a consultas basicas sobre sintomas.
- Demostracion de ML aplicado a salud: proyecto de referencia para ensenar pipelines de clasificacion con datos tabulares y modelos de ensemble.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision (accuracy) | 94,5 %+ en datos de prueba |
| Reparto train/test | 80/20 |
| Tamano del dataset | 466 casos etiquetados |
| Numero de condiciones | 37 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero; un Random Forest de 100 arboles con vectores binarios de sintomas se ejecuta en milisegundos en cualquier procesador moderno.
- VRAM: no requiere GPU. Puede ejecutarse en dispositivos con menos de 1 GB de RAM disponible.
- GPU recomendada: ninguna.
- Compatible con hardware de bajo consumo: Raspberry Pi, moviles, edge devices.
- Opciones de despliegue: servidor Flask (el autor menciona Flask y Docker en su perfil de LinkedIn), Hugging Face Spaces, o integracion directa en aplicaciones Python mediante pickle.
- Latencia: inferior a 100 ms por prediccion en CPU convencional.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables de clasificacion de salud veterinaria con especificaciones publicas similares en la informacion proporcionada.

## Limitaciones y advertencias

- No es un sustituto del diagnostico veterinario profesional: el modelo ofrece una orientacion preliminar, no un dictamen medico.
- Dataset reducido: 466 casos pueden no cubrir la variabilidad real de sintomas y condiciones en la practica clinica.
- Riesgo de sobreajuste: la precision reportada se basa en un unico split 80/20 sin validacion cruzada, lo que puede inflar las estimaciones.
- Entrada limitada a sintomas binarios: no se contemplan intensidades, duracion ni historial clinico.
- Sesgo potencial: los datos fueron curados por una unica persona, lo que puede introducir sesgos en la seleccion de casos y etiquetas.
- Sin soporte multilingue declarado: la interfaz y los consejos estan en ingles.
- Formato de pesos propietario (pickle): dificulta la interoperabilidad con otros frameworks fuera del ecosistema Python/scikit-learn.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nabiha-100/Pet-health-Advisor
- Espacio de demostracion: https://huggingface.co/spaces/nabiha-100/pet-health-advisor
- Repositorio GitHub: https://github.com/biha12/PetHealthAdministrator
- Perfil de Hugging Face del autor: https://huggingface.co/nabiha-100/models
- Publicacion en LinkedIn del autor: https://www.linkedin.com/posts/nabiha-rana-a7605b400_machinelearning-python-flask-activity-7444928268027338752-2gLv
