# hxrikp/laya-wikirace-wikispeedia

## Resumen

Laya Wikiracing on Wikispeedia es un ajuste fino completo (full fine-tune) del modelo Laya en su variante inglesa, desarrollado por el usuario hxrikp y publicado en HuggingFace bajo licencia Apache 2.0. El modelo resuelve una tarea muy concreta: dado un articulo de Wikipedia actual, un articulo objetivo y una lista corta de hasta 12 enlaces salientes reales, debe elegir cual de ellos es el mejor siguiente paso. La tarea se conoce como Wikispeedia o wikiracing: recorrer Wikipedia saltando de enlace en enlace hasta alcanzar un destino.

Tecnicamente se trata de un clasificador de texto de aproximadamente 421 millones de parametros (421.293.830 segun los pesos en safetensors), construido sobre la arquitectura ModernBERT de Laya. El repositorio ocupa 0,8 GB y solo declara soporte para ingles. No es un modelo generativo ni un agente: es un selector de enlaces entrenado sobre datos derivados del conjunto Stanford SNAP Wikispeedia, con etiquetas obtenidas de rutas reales.

Su relevancia es fundamentalmente experimental. El propio autor advierte de que este checkpoint "no es un buen navegador" y que no debe usarse para pilotar un agente real. Sobre 60 carreras retenidas gano 23 dentro del limite de ocho movimientos, frente a 13 del modelo base, y la precision de eleccion paso del 37,0 % al 47,2 %. Es, por tanto, una pieza de investigacion reproducible sobre enrutamiento en grafos, calibracion y generacion de datos sinteticos, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (etiqueta del autor), transformer encoder para clasificacion de texto |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modelo base | convaiinnovations/laya |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 26 de septiembre de 2026 |
| Ultima actualizacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint ingles de Laya, que a su vez se apoya en la arquitectura ModernBERT segun las etiquetas declaradas por el autor. La tarea esta formulada como clasificacion: la entrada combina el articulo actual, el articulo objetivo y una lista corta de hasta 12 enlaces salientes reales, y la salida es la eleccion del mejor candidato. Se trata, por tanto, de un encoder discriminativo, no de un modelo generativo con decodificacion autoregresiva, y no incorpora bucle de agente ni planificacion multi-paso.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Si se documentan las fuentes y la metodologia de evaluacion: los datos proceden del conjunto Stanford SNAP Wikispeedia paths-and-graph, y el autor describe el uso de datos sinteticos como etiqueta del pipeline. La evaluacion se realizo sobre 600 decisiones retenidas y 60 carreras retenidas en Kaggle, con articulos objetivo que nunca aparecen en entrenamiento ni calibracion; posteriormente se amplio a 240 rutas (180 nuevas) replicadas en CPU a traves del servidor de aplicacion del propio proyecto.

El autor documenta con detalle la reproducibilidad: los registros por decision (600 logits por checkpoint), las trazas de las carreras, el grafo de articulos y los conjuntos retenidos estan en el directorio `evaluation/` del repositorio, fijados a la revision `81d6d2143fd81859f62520ba09dd61ba9b7bc319`. El punto de entrada de entrenamiento, `wikirace/train.py`, es recuperable desde un payload base64 incrustado en el cuaderno de Kaggle. No se mencionan innovaciones como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Seleccion de enlaces: elige el mejor siguiente enlace entre hasta 12 candidatos reales de salida, dados el articulo actual y el objetivo.
- Clasificacion de texto en ingles: el pipeline declarado es `text-classification`.
- Estimacion de incertidumbre: el autor publica Brier score y ECE (Expected Calibration Error) sobre las probabilidades de eleccion, lo que indica que el modelo produce distribuciones calibradas y no solo una etiqueta ganadora.
- Navegacion limitada en grafos: encadena decisiones para recorrer rutas de Wikipedia, pero solo dentro de la lista corta de enlaces que se le proporcione.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible; el autor prohibe explicitamente su uso para pilotar un agente real.
- Capacidades multilingues: limitadas a ingles.
- Capacidades especiales: no dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre enrutamiento en grafos de conocimiento: permite estudiar como un transformer encoder prioriza enlaces salientes en un grafo real de mas de 4.600 articulos de Wikipedia, con trazas y logits publicados para replicar los experimentos.
- Generacion de datos sinteticos de entrenamiento: las decisiones del modelo pueden usarse como propuestas iniciales que un revisor humano filtra, generando pares (estado, enlace correcto) para entrenar navegadores mejores.
- Estudio de calibracion y estimacion de incertidumbre: al publicar Brier score (0,632) y ECE (0,046) por decision, sirve como banco de pruebas para comparar tecnicas de calibracion en tareas de eleccion discreta.
- Evaluacion comparativa de checkpoints: cualquiera puede replicar la comparacion base frente a fine-tune sobre las mismas 600 decisiones y 60 rutas, sin GPU y sin claves de API, usando el cuaderno de Kaggle publico.
- Re-ranking dentro de un buscador o wiki interna: dado un objetivo declarado por el usuario y una lista de enlaces candidatos, el modelo puede ordenar candidatos como senal auxiliar; requiere revision humana por su baja precision absoluta (47,2 %).
- Herramientas didacticas de Wikiracing: integrarlo en una aplicacion web de navegacion asistida, ya existente en el proyecto, para mostrar sugerencias de siguiente salto a un jugador humano que conserva la decision final.
- Analisis de rutas y optimizacion de estructura de enlaces: comparar las decisiones del modelo con el techo alcanzable por busqueda en grafo (55 de 60 rutas en el conjunto de 60; 222 de 240 en el ampliado) para detectar donde el modelo falla y por que.

## Benchmarks y rendimiento

Todos los datos proceden de la model card del autor. Las mismas 600 decisiones retenidas y las mismas 60 carreras se usaron para ambos checkpoints; los articulos objetivo de test no aparecen en entrenamiento ni calibracion.

| Medida | Laya base | Este fine-tune |
|---|---:|---:|
| Precision de eleccion, 600 decisiones retenidas | 37,0 % | 47,2 % |
| Precision sin enlace directo al objetivo, 489 decisiones | 23,5 % | 35,2 % |
| Brier score de eleccion (menor es mejor) | 0,765 | 0,632 |
| ECE de eleccion, 10 bins (menor es mejor) | 0,051 | 0,046 |
| Carreras ganadas en 8 movimientos, 60 carreras | 13 (21,7 %) | 23 (38,3 %) |
| Exceso medio de saltos en victorias | 1,08 | 0,87 |
| Latencia p50 del modelo, Tesla T4 | 30,4 ms | 30,8 ms |
| Latencia p95 del modelo, Tesla T4 | 33,0 ms | 32,9 ms |

Diferencia pareada de precision (fine-tune menos base): +10,2 %, intervalo bootstrap pareado al 95 % [6,2 %, 14,2 %]. Diferencia pareada de victorias: +16,7 %, intervalo al 95 % [5,0 %, 30,0 %]. El fine-tune gano 13 carreras que el base perdia y perdio 3 que el base ganaba.

Conjunto ampliado de 240 rutas retenidas (replicado en CPU):

| Medida, 240 rutas retenidas | Laya base | Este fine-tune |
|---|---:|---:|
| Carreras ganadas en 8 movimientos | 52 (21,7 %) | 90 (37,5 %) |
| Porcentaje del techo alcanzable (222 de 240) | 23,4 % | 40,5 % |
| Diferencia pareada de victorias | | +15,8 %, IC 95 % [+10,4 %, +21,2 %] |
| Carreras ganadas solo por el fine-tune / solo por el base | | 45 / 7 |

Restringido a las 180 rutas nuevas, la diferencia pareada es +15,6 % con IC 95 % [+9,4 %, +21,7 %]. El techo de la lista corta es de 55 de 60 rutas en el conjunto pequeno y 222 de 240 en el ampliado: ni siquiera un agente perfecto podria ganarlas todas con esos candidatos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 421,3 M de parametros): en float32 unos 1,7 GB; en float16/bfloat16 unos 0,85 GB; en int8 unos 0,45 GB. Son estimaciones de pesos; hay que sumar el overhead de activaciones y del runtime.
- GPU recomendadas: el autor midio latencias en una Tesla T4 (30,8 ms de mediana, 32,9 ms en p95 por decision). Cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en precision reducida.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU. El autor replico las 240 rutas completas en CPU a traves del servidor de aplicacion del proyecto.
- Opciones de despliegue: el repositorio incluye un servidor de aplicacion propio y una aplicacion de navegador descritos en la model card. Al ser un checkpoint de HuggingFace con pipeline `text-classification`, es desplegable con `transformers` y con servidores de inferencia estandar como TGI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: latencia medida por decision de 30,8 ms de mediana y 32,9 ms en p95 en Tesla T4. No se publica throughput agregado en peticiones por segundo. La medicion en CPU del conjunto ampliado no es comparable en latencia con la de T4.
- Espacio en disco: el repositorio completo ocupa 0,8 GB.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros modelos publicados especificamente para la tarea de Wikispeedia o wikiracing, por lo que la unica comparacion documentada es contra su propio modelo base.

| Modelo | Parametros | Contexto | Precision de eleccion (600 decisiones) | Carreras ganadas (60) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| hxrikp/laya-wikirace-wikispeedia | 421,3 M | no disponible | 47,2 % | 23 (38,3 %) | Apache 2.0 | HuggingFace, 0 descargas |
| convaiinnovations/laya (base) | no disponible | no disponible | 37,0 % | 13 (21,7 %) | no disponible en la informacion proporcionada | HuggingFace |

Alternativas de la misma categoria (encoders tipo ModernBERT o DeBERTa para clasificacion en ingles): no disponible, ya que no se aportan resultados comparables sobre esta tarea.

## Limitaciones y advertencias

- Aviso explicito del autor: este checkpoint no es un buen navegador y no debe usarse para pilotar un agente real.
- Precision absoluta baja: 47,2 % de acierto en eleccion sobre 600 decisiones retenidas, y solo 35,2 % cuando no hay un enlace directo al objetivo entre los candidatos.
- Techo estructural: con la lista corta de hasta 12 enlaces, solo 55 de las 60 carreras son ganables por un agente perfecto; ganar 23 no implica un rendimiento cercano al optimo.
- Dependencia del shortlist: el modelo no genera ni busca enlaces, solo ordena candidatos que se le proporcionan. Fuera de ese contexto no funciona.
- Solo ingles: no se declara soporte de otros idiomas.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con articulos largos o con mas de 12 candidatos.
- Riesgo de alucinacion: al ser un clasificador, no genera texto libre, pero si puede asignar alta confianza a enlaces incorrectos; el ECE de 0,046 sugiere buena calibracion agregada, no ausencia de errores.
- Sesgos: no se documenta ningun analisis de sesgo. El modelo se entrena sobre rutas de Wikipedia en ingles y puede heredar los sesgos de cobertura y estructura de enlaces de esa enciclopedia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la propia model card desaconseja su uso en produccion como controlador de agentes. Conviene verificar ademas la licencia del modelo base `convaiinnovations/laya`, no detallada en la informacion proporcionada.
- Reproducibilidad incompleta: el codigo de entrenamiento, el constructor de datos y la evaluacion viven en la rama `codex/laya-wikirace` del repositorio `Mr-Neutr0n/laya-session-guard`, que segun el autor aun no se ha subido. El punto de entrada de entrenamiento solo es recuperable desde un payload base64 en un cuaderno de Kaggle con acceso restringido al propietario.
- Sin adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hxrikp/laya-wikirace-wikispeedia
- Cuaderno publico de resultados en Kaggle: https://www.kaggle.com/code/uranium53/laya-wikiracing-base-vs-fine-tuned-results
- Cuaderno de entrenamiento en Kaggle (requiere acceso del propietario): https://www.kaggle.com/code/uranium53/laya-wikiracing-base-vs-fine-tuned
- Fuente de datos, Stanford SNAP Wikispeedia paths-and-graph: https://snap.stanford.edu/data/wikispeedia.html
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de codigo del proyecto, rama `codex/laya-wikirace` (no publicada): Mr-Neutr0n/laya-session-guard
