# edde746/agerating-lfm3-1.7b-v1

## Resumen

agerating-lfm3-1.7b-v1 es un clasificador de texto derivado de LiquidAI/LFM3-1.7B-Base mediante adaptadores LoRA, desarrollado por el usuario edde746. Su tarea es sugerir una edad minima de visionado (0, 6, 12, 16 o 18, en la escala alemana FSK) para peliculas y series de television, a partir de los datos estructurados de Wikidata sobre el titulo y, cuando existe, un fragmento de su articulo de Wikipedia. El modelo no genera texto: emite una distribucion softmax sobre cinco clases de edad.

El modelo resuelve un problema concreto de cobertura: muchas fichas de peliculas y series en bibliotecas de medios carecen de calificacion por edades oficial. Este clasificador permite ofrecer una estimacion etiquetada como sugerencia, no como calificacion oficial. Segun la model card, genero las 577.697 estimaciones de la primera publicacion del proyecto agerating y puntua semanalmente los titulos nuevos.

Tecnicamente es un adaptador pequeno: 16.478.981 parametros entrenables (66 MB), sobre una base LFM3 de 1.7B que se descarga por separado. La entrada se limita a 768 tokens de hechos serializados en un formato fijo. Su entrenamiento fue notablemente ligero (39,8 minutos en una RTX 4090), lo que lo convierte en un ejemplo de especializacion eficiente de un modelo base pequeno para una tarea de clasificacion muy delimitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LiquidAI/LFM3-1.7B-Base (revision `545fc8f4c7b5fa9f405105274cd29c4f8f44b526`); cabeza de clasificacion: media de los ultimos estados ocultos sobre todos los tokens de entrada y una capa lineal a 5 clases |
| Parametros totales | 16.478.981 parametros entrenables (adaptadores LoRA + cabeza); el modelo base se descarga aparte |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | hasta 768 tokens de hechos serializados |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), aleman (de) |
| Licencia | agerating-license-1.0 (licencia propia, referenciada como "other") |
| Formato de pesos | safetensors (`model.safetensors`, 66 MB) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base y aplica LoRA sobre todas las capas lineales con rango 16, alpha 32 y dropout 0.05. Sobre la salida del modelo base se calcula la media de los ultimos estados ocultos sobre todos los tokens de entrada y se proyecta mediante una capa lineal a cinco clases (edades 0, 6, 12, 16 y 18), con softmax como salida. El fichero `config.json` registra la revision base, los hiperparametros de LoRA, las etiquetas y los ajustes de entrenamiento.

El conjunto de entrenamiento son 19.701 items de Wikidata con una calificacion FSK inequivoca (propiedad P1981), recogidos el 29 de octubre de 2026: 1.756 etiquetas en 0, 3.142 en 6, 7.959 en 12, 5.517 en 16 y 1.327 en 18; 19.590 peliculas, 93 titulos de television y 18 de otro tipo. El 98% de los items tiene articulo de Wikipedia, obtenido via la API de MediaWiki en octubre de 2026. En cada paso de entrenamiento se descarta el texto del articulo con probabilidad 0,5, de modo que el mismo modelo funciona con y sin articulo. La receta: una epoca, batch size 8, bf16, AdamW con weight decay 0,01, learning rate 1e-4 para LoRA y 1e-3 para la cabeza, 5% de warm-up lineal seguido de decaimiento lineal. El entrenamiento completo consumio 39,8 minutos en una RTX 4090 con unos 6 GB de pico de memoria GPU.

## Capacidades

- Clasificacion de texto en cinco clases de edad minima de visionado (0, 6, 12, 16, 18) segun la escala FSK.
- Entrada multimodal en el sentido de fuentes: combina hechos estructurados de Wikidata (tipo, generos, pais, idioma original, director, guionistas, reparto, productora, distribuidora, cadena, serie, franquicia, material de origen, temas, ambientacion, premios, nominaciones, compositor, ano y duracion) con un pasaje de Wikipedia.
- Funciona tanto con articulo de Wikipedia como sin el, gracias al dropout de texto durante el entrenamiento.
- Aprovecha calificaciones de otros sistemas presentes en Wikidata (34 sistemas de cine y television) como senal de entrada, excluyendo siempre la propia FSK.
- Salida probabilistica completa (softmax sobre cinco clases), lo que permite aplicar reglas de decision como el redondeo hacia arriba al alcanzar probabilidad acumulada de 0,6.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Bibliotecas de medios y aplicaciones de catalogo: mostrar una etiqueta "Sugerido 12+" en fichas de peliculas o series sin calificacion oficial, usando la salida softmax y la regla de redondeo hacia arriba para reducir sugerencias demasiado bajas.
- Enriquecimiento de bases de datos de catalogo: puntuar por lotes titulos nuevos cada semana, como hace el propio proyecto agerating, para mantener actualizada una base de datos de edades sugeridas.
- Filtrado parental en plataformas de streaming: usar la probabilidad acumulada por edad para decidir si un titulo se muestra en un perfil infantil, con umbrales configurables por el operador.
- Investigacion sobre clasificacion de contenido audiovisual: el modelo y el pipeline completo (recoleccion de datos, serializacion, entrenamiento, puntuacion) estan publicos en el repositorio de GitHub, lo que permite reproducir o adaptar el enfoque a otras escalas de calificacion.
- Moderacion y curaduria de catalogos: detectar discrepancias entre la estimacion del modelo y calificaciones existentes para revisar manualmente fichas sospechosas.
- Prototipado rapido de clasificadores especializados: sirve como referencia de como especializar un modelo base de 1.7B con LoRA y una cabeza lineal en menos de una hora de GPU consumer.
- Analisis de contenido en aleman e ingles: al aceptar pasajes de la trama en ambos idiomas, puede aplicarse a catalogos en esas dos lenguas.

## Benchmarks y rendimiento

Evaluacion sobre el fold 0 de una particion estratificada en 5 folds (3.941 items), entrenando en los otros cuatro con la misma receta:

| Entrada | Decision | Exacto | A un paso | Demasiado bajo | Demasiado bajo por 2+ pasos | Demasiado alto |
|---|---|---|---|---|---|---|
| con texto del articulo | edad mas probable | 64,3% | 96,3% | 17,6% | 1,42% | 18,1% |
| con texto del articulo | redondeo al 60% (regla de la base de datos) | 63,4% | 97,0% | 13,8% | 0,61% | 22,8% |
| sin texto del articulo | edad mas probable | 61,6% | 95,7% | 18,4% | 1,67% | 20,0% |
| sin texto del articulo | redondeo al 60% (regla de la base de datos) | 61,1% | 96,4% | 13,4% | 0,63% | 25,5% |

Un paso equivale a una posicion en la escala 0 → 6 → 12 → 16 → 18. La regla de redondeo al 60% elige la edad mas baja cuya probabilidad acumulada alcanza 0,6; cuando el modelo duda, escoge la edad mayor y reduce a mas de la mitad las sugerencias dos o mas pasos por debajo. Como referencia de techo, los propios organismos de calificacion discrepan: FSK y MPA asignan la misma edad solo al 49,8% de las peliculas calificadas por ambos (90,7% a un paso de distancia).

## Requisitos de hardware

- VRAM para inferencia: el adaptador ocupa 66 MB; el modelo base LFM3-1.7B se descarga aparte. El entrenamiento completo uso unos 6 GB de pico en una RTX 4090, por lo que la inferencia en bf16 deberia caber holgadamente en GPUs consumer de 8 GB o mas, aunque no se publican cifras exactas de inferencia.
- GPU recomendadas: RTX 4090 (usada para el entrenamiento); cualquier GPU consumer con al menos 8 GB deberia ser suficiente para inferencia del modelo base en bf16, aunque no esta verificado en la informacion disponible.
- Cabe en GPU consumer: si, segun el perfil de memoria del entrenamiento (6 GB de pico).
- Opciones de despliegue: el repositorio incluye `pipeline/model.py` con las funciones `load` y `predict`, que descargan el modelo base en el primer uso. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un clasificador con cabeza personalizada, el despliegue estandar seria mediante la libreria de transformers con los pesos safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia de categoria, el propio modelo base LiquidAI/LFM3-1.7B-Base es la alternativa generica, pero no esta especializado en calificacion por edades y requeriria prompting o ajuste adicional.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agerating-lfm3-1.7b-v1 | 16,5M entrenables sobre base de 1.7B | 768 tokens | Clasificacion de edad FSK (5 clases) | agerating-license-1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B-Base | 1.7B | no disponible en la informacion | Modelo base generico | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en clasificacion de edad | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo produce una estimacion, no una calificacion oficial. La licencia exige etiquetar la salida como sugerencia ("Sugerido 12+") y nunca como FSK u otra calificacion oficial.
- La cobertura de television es escasa: solo 93 de los 19.701 items de entrenamiento son series de television, por lo que el rendimiento en ese dominio es limitado (la model card se interrumpe en este punto: "TV is barel...").
- El modelo solo funciona bien con el formato exacto de serializacion descrito; entradas con otro formato degradaran la calidad de la prediccion.
- Riesgo de sugerencias demasiado altas: con la regla de redondeo al 60%, entre el 22,8% y el 25,5% de las predicciones quedan por encima de la edad real.
- Riesgo de sugerencias demasiado bajas: entre el 13,4% y el 17,6% de las predicciones quedan por debajo, y entre el 0,61% y el 1,67% lo hacen dos o mas pasos por debajo.
- Sesgos derivados de los datos: el entrenamiento usa exclusivamente titulos con calificacion FSK en Wikidata, lo que sobrerrepresenta producciones con presencia en Wikidata y en la industria alemana; los 19.590 items son peliculas, lo que sesga el modelo hacia ese formato.
- Idiomas limitados a ingles y aleman; el texto de la trama se toma en ese orden (trama en ingles, entradilla en ingles, trama en aleman).
- Licencia propia (agerating-license-1.0) con restricciones de uso comercial no detalladas en la informacion disponible; debe revisarse el fichero LICENSE antes de cualquier despliegue en produccion.
- Sin datos publicados de latencia ni throughput, ni cuantizaciones soportadas.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de calibracion: las probabilidades pueden no reflejar la incertidumbre real en titulos atipicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edde746/agerating-lfm3-1.7b-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Repositorio del pipeline agerating: https://github.com/edde746/agerating
- Licencia: LICENSE (referenciada en el repositorio de Hugging Face)
