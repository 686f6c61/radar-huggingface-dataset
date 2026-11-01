# ppatel16/chameleon-picker

## Resumen

Chameleon layout picker es un modelo de regresion ridge de tamano minimo (78 pesos, aproximadamente 3 KB en `regressor.json`) desarrollado por el usuario ppatel16 en el contexto del Adobe University Hackathon 2026, dentro del proyecto Chameleon Engine. No es un modelo de lenguaje ni una red neuronal profunda: es el unico componente aprendido de un motor de re-maquetacion offline basado en reglas que recoloca texto, imagenes y formas de un diseno para un nuevo tamano de lienzo sin alterar los pixeles originales.

El problema que resuelve es concreto: el motor genera multiples disposiciones candidatas para un nuevo formato (banner, cuadrado, vertical, etc.) y este modelo puntua cada candidata segun su probabilidad de parecerse a lo que haria un disenador humano. Para ello combina terminos estandarizados de calidad de maquetacion (solapamiento, legibilidad, proporcion del elemento hero, visibilidad del logo), la plantilla que origino la candidata y el bucket de forma del lienzo destino.

Su relevancia es limitada y muy especifica: no compite con modelos generativos, sino que actua como funcion de ranking sustituible dentro de un pipeline de diseno grafico. Se ejecuta solo en CPU con NumPy, sin framework de deep learning, y se entrena con 178 maquetaciones de referencia de disenadores. Es un ejemplo de modelo "tiny" orientado a produccion ligera y a la separacion entre reglas deterministas y aprendizaje supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge (modelo lineal), 78 pesos |
| Parametros totales | 78 pesos mas tamanos tipicos de titular y producto por forma de lienzo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de caracteristicas tabulares) |
| Tipos de cuantizacion | no disponible (pesos en JSON de ~3 KB, sin cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | JSON (`regressor.json`, ~3 KB) |

## Arquitectura y entrenamiento

La arquitectura es una regresion ridge, es decir, una regresion lineal con regularizacion L2. La entrada son terminos de calidad de maquetacion estandarizados (solapamiento, legibilidad, proporcion del elemento hero, visibilidad del logo, entre otros), la plantilla que genero la candidata y el bucket de forma del lienzo destino (banner, ancho, cuadrado, alto, muy alto). La salida es una puntuacion que permite ordenar las candidatas producidas por el motor.

El entrenamiento se realizo sobre 178 maquetaciones de referencia de disenadores, almacenadas en `data/refs/` del repositorio de codigo. El autor indica que los datos son mayoritariamente disenos sinteticos, por lo que el comportamiento con disenos reales depende en mayor medida de las reglas del motor que del propio modelo. El reentrenamiento se ejecuta con `python -m tools.learn_regress --save`. No se documentan tecnicas de RLHF, DPO ni innovaciones de atencion, al no tratarse de un transformer.

## Capacidades

- Ranking de maquetaciones candidatas generadas por el motor Chameleon, ordenandolas por similitud esperada con disenos de disenador.
- Puntuacion de calidad de layout a partir de terminos como solapamiento, legibilidad, proporcion del elemento hero y visibilidad del logo.
- Ajuste por plantilla de origen de la candidata.
- Ajuste por forma de lienzo destino (banner, ancho, cuadrado, alto, muy alto).
- Inferencia solo en CPU con NumPy, sin dependencias de framework de deep learning.
- Sustituible: si no se proporciona `regressor.json`, el motor usa una puntuacion manual predefinida.
- No genera texto, codigo, matematicas ni vision. No soporta tool calling ni razonamiento multi-paso. No tiene capacidades multilingues.

## Casos de uso

- Re-maquetacion automatica de disenos para redes sociales: el motor recoloca los elementos para formatos banner, cuadrado, vertical y muy vertical, y este modelo elige entre las candidatas la que mejor puntua para cada forma de lienzo.
- Generacion de variantes de anuncios a partir de una plantilla: dado un diseno base y un conjunto de tamanos de destino, el modelo prioriza las disposiciones con mayor legibilidad y visibilidad de logo, reduciendo la revision manual.
- Adaptacion de creatividades de e-commerce: para fichas de producto con imagen hero, titular y logo, el modelo penaliza candidatas con solapamiento excesivo o hero poco destacado.
- Pipelines de produccion ligera en CPU: al ser un JSON de 3 KB ejecutable con NumPy, se puede integrar en servicios de generacion de variantes sin GPU ni servidor de inferencia dedicado.
- Herramientas de diseno asistido offline: el motor y el modelo funcionan sin conexion, lo que permite integrarlos en aplicaciones de escritorio o entornos con restricciones de red.
- Experimentacion academica y hackathons: sirve como ejemplo de separacion entre reglas deterministas y un componente aprendido pequeno, facil de reentrenar con nuevas referencias mediante `tools.learn_regress`.
- Personalizacion por marca: si se dispone de maquetaciones de referencia propias, se puede reentrenar el modelo para que el ranking se ajuste a los criterios de diseno de una organizacion concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de precision, correlacion con juicios de disenadores ni comparaciones cuantitativas con alternativas.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere GPU.
- Cabe en cualquier equipo consumer: el archivo de pesos ocupa aproximadamente 3 KB y la inferencia usa NumPy.
- Opciones de despliegue: ejecucion directa con `python -m engine.main`, con la variable `CHAMELEON_WEIGHTS` apuntando a `regressor.json` o colocando el archivo en `engine/`.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser una regresion lineal de 78 pesos, el coste por candidata es despreciable frente al coste de generar las maquetaciones en el motor.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (ranking de maquetaciones mediante regresion ridge sobre caracteristicas tabulares de layout).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Chameleon layout picker | 78 pesos | no aplica | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ordena maquetaciones que el motor ya ha generado; no puede crear disposiciones nuevas.
- Entrenado principalmente con disenos sinteticos: el comportamiento con anuncios reales depende mas de las reglas del motor que del modelo.
- Conjunto de entrenamiento muy pequeno (178 referencias), lo que limita la generalizacion a estilos de diseno no representados.
- No procesa lenguaje natural ni imagenes directamente; su entrada son caracteristicas tabulares ya calculadas por el motor.
- No hay informacion sobre sesgos; al operar sobre caracteristicas de layout, los sesgos potenciales estarian en los criterios de diseno de las referencias y en las reglas del motor.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de puntuaciones poco fiables fuera de la distribucion de formas de lienzo y plantillas vistas en entrenamiento.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con aviso de copyright; no se documentan restricciones adicionales.
- Para produccion, conviene validar el ranking con disenadores reales y considerar el reentrenamiento con referencias propias antes de confiar en el modelo como unico criterio de seleccion.

## Enlaces

- HuggingFace: https://huggingface.co/ppatel16/chameleon-picker
- Repositorio de codigo con `data/refs/` y `tools.learn_regress`: no disponible en la informacion proporcionada
- Paper o blog del proyecto Chameleon Engine: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
