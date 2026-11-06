# BattleGhost/anime-quartet-preference-ranker

## Resumen

Anime Quartet Preference Ranker es una cabeza de ranking por pares desarrollada por BattleGhost que ordena de mejor a peor cuatro imagenes de estilo anime relacionadas entre si. No es un modelo generativo ni un clasificador de calidad general: su funcion es actuar como una senal mas dentro de un pipeline de seleccion de candidatos tras la generacion de imagenes. El repositorio publica unicamente la cabeza lineal de ranking, cuatro sondas logisticas de artefactos, la configuracion y un script de inferencia minimo.

Tecnicamente es un modelo de fusion de caracteristicas muy ligero (18.441 parametros en safetensors) que se apoya en tres modelos congelados de terceros: WD SwinV2 Tagger v3, PixAI Tagger v1.0 y un clasificador estetico de Danbooru. Cada imagen se representa mediante un vector de 6.149 dimensiones que combina descriptores visuales L2-normalizados, senales de artefactos y una puntuacion estetica, y la cabeza lineal produce una puntuacion relativa dentro del grupo de cuatro.

Su relevancia es practica: ofrece un punto de partida reproducible y con licencia Apache-2.0 para aprendizaje de preferencias visuales en dominios anime, con metricas de evaluacion publicadas (38,4 % de Top-1 exacto y 65,7 % de Recall@2 sobre 435 grupos privados) y una advertencia explicita sobre sus limitaciones. No esta pensado para comparar imagenes no relacionadas, identificar personajes ni moderar contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusion de caracteristicas congeladas (WD SwinV2 Tagger v3, PixAI Tagger v1.0, clasificador estetico Danbooru) + cabeza lineal de regresion logistica por pares |
| Parametros totales | 18.441 (solo la cabeza de ranking y sondas publicadas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de 4 imagenes por grupo) |
| Tipos de cuantizacion | No disponible (pesos de muy baja dimension; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (no procesa texto; los taggers subyacentes trabajan con etiquetas en ingles) |
| Licencia | Apache-2.0 (codigo y pesos originales); dependencias con sus propias licencias |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer end-to-end sino una fusion de caracteristicas seguida de una unica cabeza lineal de logistica por pares. Para cada imagen se construye un vector de entrada a partir de: (1) WD SwinV2 Tagger v3, con la imagen completa y cuatro recortes de esquina solapados, cada uno con un vector agrupado de 1.024 dimensiones L2-normalizado, concatenados en 5.120 valores; (2) PixAI Tagger v1.0, un vector agrupado de 1.024 dimensiones L2-normalizado; (3) cuatro senales logisticas de artefactos (estructura de manos, anatomia humana, solapamiento de elementos y morfologia de objetos); y (4) un escalar estetico correspondiente a la clase esperada (0-3) del clasificador estetico de Danbooru sobre la caracteristica global de WD. Los primeros 6.148 valores se normalizan conjuntamente por imagen y se centran dentro de cada grupo de cuatro; el escalar estetico se centra por separado. El vector resultante de 6.149 dimensiones se puntua con la cabeza publicada.

Las sondas de artefactos se entrenaron sobre un subconjunto con licencia MIT de MagicData340K y funcionan como caracteristicas suaves, no como probabilidades calibradas ni puertas de rechazo duras. La evaluacion se realizo con validacion cruzada de cinco pliegues reteniendo sujetos completos fuera del entrenamiento, sobre 435 grupos privados de imagenes generadas con una unica eleccion humana de ganador por grupo. No se documenta el uso de RLHF, DPO ni un corpus de entrenamiento propio para la cabeza mas alla de estas senales derivadas.

## Capacidades

- Ranking relativo de cuatro imagenes de estilo anime del mismo sujeto y escena, devolviendo puntuacion y orden de mejor a peor.
- Deteccion suave de artefactos visuales mediante cuatro sondas: estructura de manos, anatomia humana, solapamiento de elementos y morfologia de objetos.
- Puntuacion estetica derivada de un clasificador Danbooru integrado como caracteristica escalar.
- Seleccion de candidatos en pipelines de generacion de imagenes (texto a imagen) con revision humana posterior.
- Punto de partida para aprendizaje de preferencias personalizadas (ajuste de la cabeza sobre nuevos datos propios).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision general, audio ni modo de pensamiento.
- No compara imagenes no relacionadas, no identifica personajes y no garantiza correccion anatomica.

## Casos de uso

- Seleccion de candidatos tras generacion texto a imagen: se generan cuatro variantes del mismo prompt y el modelo devuelve un orden; un revisor humano valida el Top-1 o Top-2, aprovechando el Recall@2 del 65,7 % documentado.
- Filtrado previo en flujos de trabajo por lotes: integrado como una senal mas en un pipeline de seleccion, reduce el numero de imagenes que llegan a revision manual en produccion de arte.
- Aprendizaje de preferencias personales: al ser una cabeza lineal de 18.441 parametros, se puede reentrenar o ajustar con anotaciones propias de un estudio o artista para capturar su criterio estetico concreto.
- Deteccion temprana de artefactos en ilustracion anime: las cuatro sondas permiten descartar candidatos con manos deformes, anatomia incoherente, solapamientos raros o morfologia de objetos defectuosa antes de la revision final.
- Investigacion en ranking por pares: sirve como linea base reproducible y ligera para experimentos de preference learning visual, con metricas publicadas y validacion por sujetos retenidos.
- Herramienta de curacion en comunidades de arte generado: ordenacion asistida de conjuntos de cuatro variantes para que el usuario elija con menos esfuerzo, siempre con revision humana del resultado.
- Evaluacion comparativa de modelos de generacion: permite medir de forma relativa que modelo produce candidatos mejor valorados dentro de un mismo conjunto de variantes.

## Benchmarks y rendimiento

Evaluacion sobre 435 grupos privados de cuatro imagenes generadas, con una unica eleccion humana de ganador por grupo y validacion cruzada de cinco pliegues con sujetos retenidos.

| Metrica | Modelo | Orden aleatorio |
|---|---:|---:|
| Top-1 exacto | 167 / 435 = 38,4 % | 25,0 % |
| Recall@2 | 286 / 435 = 65,7 % | 50,0 % |
| Recall@3 | 380 / 435 = 87,4 % | 75,0 % |
| Rango reciproco medio (MRR) | 0,624 | 0,521 |

Distribucion del ganador humano por rango: 167 / 119 / 94 / 55 para los rangos 1 a 4. En un flujo de trabajo privado de extremo a extremo, con comprobaciones adicionales de identidad y consistencia interna, la tasa de aprobacion de selecciones automaticas se situo aproximadamente entre el 58 % y el 90 % sobre conjuntos nuevos; el autor advierte que ese rango es optimista y que las reglas de produccion no se incluyen en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; la cabeza publicada ocupa practicamente nada, pero la inferencia requiere cargar WD SwinV2 Tagger v3, PixAI Tagger v1.0 y el clasificador estetico Danbooru, que dominan el consumo.
- GPU recomendadas: no se especifican modelos concretos; el autor recomienda encarecidamente GPU y senala que PixAI Tagger a 1008 px es el componente mas pesado.
- GPU de consumo: probablemente viable en tarjetas consumer con suficiente VRAM para los tres modelos congelados, aunque no se publican cifras concretas.
- Opciones de despliegue: script `inference.py` incluido en el repositorio, con soporte de `--device cpu` (lento) y GPU recomendada; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la informacion disponible. Como referencia de categoria, se puede contrastar con las dependencias que utiliza:

| Modelo | Tipo | Parametros | Funcion | Licencia |
|---|---|---|---|---|
| Anime Quartet Preference Ranker | Cabeza lineal sobre caracteristicas congeladas | 18.441 | Ranking de 4 imagenes anime | Apache-2.0 |
| SmilingWolf/wd-swinv2-tagger-v3 | Tagger de etiquetas | No disponible | Etiquetado de contenido anime | Apache-2.0 |
| pixai-labs/pixai-tagger-v1.0 | Tagger de etiquetas | No disponible | Etiquetado de contenido anime | Apache-2.0 |
| aipracticecafe/danbooru-aes-cls | Clasificador estetico | No disponible | Puntuacion estetica 0-3 | MIT |

## Limitaciones y advertencias

- Las preferencias provienen de un unico anotador y no deben interpretarse como calidad universal.
- Rendimiento Top-1 absoluto debil (38,4 %); el Recall@2 (65,7 %) es la metrica practica cuando existe un revisor de segunda etapa.
- El modelo no recibe imagenes de referencia ni nombres de personajes, por lo que no garantiza identidad visual ni peinado o ropa canonicos.
- Las sondas de artefactos se entrenaron fuera de dominio sobre un dataset externo de estilos mixtos y pueden confundirse con el sujeto, el encuadre o el estilo.
- El centrado por grupo implica que la puntuacion de una imagen cambia cuando cambian las otras tres candidatas.
- Las imagenes de entrenamiento y evaluacion eran grupos privados de imagenes generadas e incluian contenido adulto; no se distribuye ninguna imagen.
- No debe usarse para moderacion de seguridad, interpretacion medica, decisiones biometricas ni juicios sobre personas.
- Las dependencias descargadas quedan sujetas a sus propias licencias y model cards, aunque el codigo y los pesos originales son Apache-2.0.
- No se documentan sesgos especificos mas alla del sesgo del anotador unico y del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BattleGhost/anime-quartet-preference-ranker
- WD SwinV2 Tagger v3: https://huggingface.co/SmilingWolf/wd-swinv2-tagger-v3
- PixAI Tagger v1.0: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Clasificador estetico Danbooru: https://huggingface.co/aipracticecafe/danbooru-aes-cls
- Dataset MagicData340K: https://huggingface.co/datasets/wj-inf/MagicData340k
