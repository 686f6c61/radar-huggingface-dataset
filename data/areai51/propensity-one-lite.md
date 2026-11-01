# areai51/propensity-one-lite

## Resumen

Propensity One lite es un modelo de ranking de titulares desarrollado por areai51, publicado como vista previa de investigación (research preview). No es un modelo de lenguaje generativo, sino un regresor ridge sobre representaciones TF-IDF de n-gramas de palabras (1-2) y de caracteres (2-5), entrenado para predecir qué variante de titular de una misma noticia obtendrá un mayor CTR en un test A/B aleatorizado. Resuelve un problema acotado y bien definido: ordenar candidatos de titular entre sí, no puntuar titulares de forma absoluta ni estimar popularidad de historias.

Con 284.725 parámetros reales (coeficientes ridge e IDF), el modelo es deliberadamente ligero y se ejecuta en CPU. Forma parte de una familia mayor, Propensity One, que añade un encoder ModernBERT-large afinado y características de imagen de portada para anuncios de vídeo; esa versión completa no es pública porque se entrena en parte con datos de anuncios de TikTok bajo licencia solo de investigación. La versión lite puede publicarse porque su único corpus de entrenamiento es el Upworthy Research Archive (CC BY 4.0).

Su relevancia actual es la de un contrapunto honesto y reproducible frente a los enfoques zero-shot con LLM: sobre el mismo conjunto de test, este modelo de 284.725 parámetros alcanza una accuracy por pares de 0,589, frente a 0,596 de un LLM zero-shot de última generación citado en la model card, a una fracción ínfima del coste computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión ridge sobre TF-IDF (palabras 1-2-gramas: 78.452 features; caracteres 2-5-gramas: 63.910 features) |
| Parámetros totales | 284.725 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa titulares y un extracto opcional) |
| Tipos de cuantización | no disponible (no aplica: pesos de regresión lineal en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`), vocabularios en JSON (`vocab_word.json`, `vocab_char.json`), configuración en `config.json` |

## Arquitectura y entrenamiento

El modelo es un pipeline clásico de scikit-learn: dos vectorizadores TF-IDF (uno de n-gramas de palabras 1-2 y otro de n-gramas de caracteres 2-5) cuyas salidas alimentan una regresión ridge con alpha = 30,0, elegido sobre el conjunto de validación. No hay red neuronal, ni atención, ni embeddings contextuales. El objetivo de entrenamiento no es el CTR absoluto, sino el logit del CTR posterior-medio de cada variante menos la media de su test, ponderado por el número de clics que respalda esa estimación; es decir, se aprenden contrastes dentro de cada test, de modo que el modelo captura qué hace que un titular gane a otro para la misma historia.

Los datos provienen del Upworthy Research Archive (Matias et al., 2021, Scientific Data), con tests aleatorizados de titulares en upworthy.com entre 2013 y 2015. Tras filtrar tests con al menos dos variantes y descartar 2.007 tests en los que la imagen teaser variaba sin estar cruzada con el titular (para evitar confusión causal), quedan 19.268 tests; 61.925 variantes constituyen el split de entrenamiento. Los splits se agrupan por familia, de forma que variantes de una misma historia y titulares casi duplicados no aparecen a la vez en entrenamiento y test. La calibración de `p_top_beats` es un sigmoide sobre la diferencia de scores con la constante k ajustada en validación. El modelo se carga sin pickle: vocabularios en JSON y pesos en safetensors. Existe un port a JavaScript (`propensity_one_lite.js`) verificado contra Python con una diferencia máxima inferior a 1e-9 en todas las cabeceras de validación y test.

## Capacidades

- Ranking de variantes de titular para una misma historia: devuelve posición, score y probabilidad calibrada `p_top_beats` de que el titular elegido supere al siguiente.
- Modelado de contrastes dentro de test: aprende diferencias relativas entre titulares, no popularidad absoluta de historias.
- Procesamiento de un extracto opcional (`excerpts`) mostrado bajo cada titular, lo que permite condicionar el ranking al contexto de la pieza.
- Ejecución en CPU con dependencias mínimas (numpy, scipy, scikit-learn, safetensors) y sin necesidad de GPU.
- Port a JavaScript ejecutable en navegador, con paridad numérica verificada frente a la implementación Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.
- Capacidad multilingüe: nula más allá del inglés; el modelo no ha sido validado en otros idiomas.

## Casos de uso

- Test A/B de titulares en medios digitales: dado un conjunto de 3-10 titulares candidatos para una noticia, el modelo los ordena por probabilidad relativa de ganar el test, lo que permite priorizar variantes antes de gastar impresiones en un experimento real.
- Reducción del coste experimental en redacciones: en lugar de lanzar todos los candidatos en un test aleatorizado, se seleccionan las dos o tres variantes mejor puntuadas, reduciendo el número de brazos y el tráfico necesario para alcanzar potencia estadística.
- Herramienta de asistencia editorial en la sala de redacción: integrada en el CMS, ofrece un ranking inmediato de titulares alternativos con un score calibrado, sin salir del flujo de publicación ni requerir infraestructura de GPU.
- Filtrado previo en pipelines de generación de titulares con LLM: un modelo generativo produce N candidatos y Propensity One lite los reordena según su probabilidad de ganar un contraste, combinando creatividad y señal empírica.
- Investigación en comunicación y ciencias sociales: permite replicar y extender análisis sobre qué rasgos lingüísticos (longitud, curiosidad, negatividad, estructuras de n-gramas) se asocian a mayor CTR en el corpus Upworthy, con un modelo reproducible y de código abierto.
- Evaluación comparativa de métodos de ranking de texto: sirve como baseline fuerte y barato (0,589 de accuracy por pares) frente a TF-IDF ridge plano (0,572), LightGBM (0,539) o LLM zero-shot (0,596), útil en publicaciones que necesiten un punto de referencia ligero.
- Despliegue en el navegador para demos y formación: el port JavaScript permite ofrecer una demo interactiva sin backend, útil para talleres de periodismo de datos o prototipos de producto.

## Benchmarks y rendimiento

Resultados sobre el split de test de `upworthy_brx-pipe-0.2.0`: 1.945 tests aleatorizados con 8.654 variantes de titular. Splits agrupados por familia; el alpha (30,0) se eligió en validación y las métricas de test se midieron una sola vez. Se mantiene un holdout sellado para la comprobación final de release.

| Métrica (test) | Propensity One lite | Aleatorio |
|---|---|---|
| Accuracy por pares | 0,589 [0,577; 0,600] | 0,500 |
| Accuracy por pares ponderada por certeza del ganador observado | 0,627 | 0,500 |
| Top-1: la primera elección es la mejor observada | 0,345 | 0,242 |
| Top-1 en los 323 tests con ganador claro (P(mejor vence al segundo) >= 0,95) | 0,486 | 0,266 |

Comparativa en los mismos grupos:

| Modelo | Accuracy por pares |
|---|---|
| Propensity One lite | 0,589 |
| TF-IDF ridge plano | 0,572 |
| LightGBM sobre features de titular | 0,539 |
| Aleatorio | 0,503 |
| Propensity One completo (privado) | 0,600 |
| LLM zero-shot de referencia (GPT-6.1 Sol, según la model card) | 0,596 |

Calibración de `p_top_beats`: en los pares de test, la probabilidad predicha media de que gane el titular preferido es 0,596 y ganó efectivamente el 0,596 de las veces. Log loss de 0,6583 frente a 0,6931 de predecir siempre 50 %. La mayoría de las diferencias entre titulares son pequeñas, por lo que las probabilidades se mantienen cerca del 50 %; el autor lo atribuye a incertidumbre real, no a un defecto.

## Requisitos de hardware

- Inferencia en CPU: el modelo completo ocupa menos de 1 MB (repositorio de 0,0 GB) y se ejecuta en cualquier CPU moderna en milisegundos por lote de titulares.
- VRAM: no requiere GPU; 0 GB de VRAM.
- GPU recomendadas: no aplica. Cualquier GPU sería innecesaria para este modelo.
- Cabe en cualquier GPU consumer y en cualquier dispositivo con un runtime de Python o JavaScript; el port JS corre en el navegador.
- Opciones de despliegue: script Python con scikit-learn (versiones de referencia: numpy 2.4.6, scipy 1.17.1, scikit-learn 1.9.1, safetensors 0.8.0), o el port JavaScript `propensity_one_lite.js` en el navegador.
- Latencia y throughput: no se publican cifras concretas; por la naturaleza del modelo (producto matriz-vector disperso sobre ~142.000 features) la latencia esperada es de milisegundos por petición en CPU, aunque este dato no está confirmado en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Accuracy por pares (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Propensity One lite | Ridge sobre TF-IDF | 284.725 | no aplica | 0,589 | CC BY 4.0 | Público en HuggingFace |
| TF-IDF ridge plano | Ridge sobre TF-IDF | no disponible | no aplica | 0,572 | no disponible | Baseline interno del autor |
| LightGBM sobre features de titular | GBDT | no disponible | no aplica | 0,539 | no disponible | Baseline interno del autor |
| Propensity One completo | ModernBERT-large afinado + imagen | no disponible | no disponible | 0,600 | no pública | Privado (datos de TikTok solo para investigación) |
| LLM zero-shot de referencia (GPT-6.1 Sol) | LLM generativo | no disponible | no disponible | 0,596 | propietaria | Comercial |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otros sistemas públicos de ranking de titulares en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con titulares de noticias y temas sociales de upworthy.com entre 2013 y 2015; no validado en anuncios de producto, otros medios, otras audiencias ni otros idiomas.
- Los scores solo ordenan variantes entre sí; un score aislado carece de interpretación. No debe usarse como estimación absoluta de CTR.
- Accuracy por pares de 0,589, solo 8,9 puntos por encima del azar; las diferencias entre titulares suelen ser pequeñas y las probabilidades calibradas se mantienen cerca del 50 %.
- Riesgo de sobreajuste a particularidades estilísticas de Upworthy (tono, estructuras de curiosidad, formato de la época) que pueden no transferir a otros contextos editoriales.
- Sesgos heredados del corpus: audiencia estadounidense, periodo 2013-2015, temática de noticias y causas sociales; no hay evaluación de sesgos demográficos o políticos en la información disponible.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio citar el modelo y el Upworthy Research Archive (Matias et al., 2021).
- Es una vista previa de investigación; no hay garantías de soporte, mantenimiento ni estabilidad de API.
- El modelo completo (ModernBERT-large + imagen) no es público y no puede reproducirse a partir de esta versión lite.
- Solo inglés; no se ha validado en castellano ni en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/areai51/propensity-one-lite
- Demo en el navegador (Space): https://huggingface.co/spaces/areai51/propensity-one
- Upworthy Research Archive: https://osf.io/jd64p/
- Referencia del corpus: Matias, J. N., Munger, K., Aubin Le Quere, M., & Ebersole, C. (2021), *The Upworthy Research Archive, a time series of 32,487 experiments in U.S. media*, Scientific Data 8, 195.
