# Cloth-splatters/dexgarmentlab-lift-20260822-retrieval-embedding

## Resumen

El modelo `Cloth-splatters/dexgarmentlab-lift-20260822-retrieval-embedding` es un modelo de embedding para recuperación (retrieval) por similitud, desarrollado por el usuario Cloth-splatters, que implementa la línea base de identificación aprendida (LRE, *learned retrieval embedding*, sección V-C) del artículo ClothAtlas. No es un modelo generativo de lenguaje: su tarea es identificar una prenda de tela deformable a partir de una nube de puntos parcial observada, emparejándola contra una biblioteca de 221 mallas canónicas en reposo.

Técnicamente se trata de un *embedding* contrastivo construido sobre un tronco compartido PointNet++ que proyecta tanto la nube parcial como las muestras de superficie de la malla canónica en un espacio de 256 dimensiones; los candidatos se ordenan mediante 1 menos la similitud coseno. El entrenamiento se realizó con pérdida InfoNCE simétrica a temperatura fija 0,07 durante 6 épocas de 500 pasos (más una época de calentamiento), en 12 minutos sobre una única GPU GH200, según la model card.

Su relevancia es la de un artefacto reproducible y honesto: publica el *checkpoint*, el hash SHA-256 de los pesos, la configuración exacta de entrenamiento y sus propios resultados, que son muy inferiores a los de ClothAtlas (17,2 % top-1 frente a 22/22 en identificación). Sirve por tanto como referencia cuantitativa para investigaciones sobre estimación de estado de objetos deformables y como punto de partida para comparar arquitecturas de embedding textil, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco PointNet++ compartido con dos ramas de embedding; salida de 256 dimensiones; emparejamiento por 1 - similitud coseno |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embedding sobre nubes de puntos, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (la carga se realiza con `resolve_checkpoint` y `RetrievalEmbedding.load` del repositorio de codigo) |
| Dimension del embedding | 256 |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Dataset de entrenamiento | Cloth-splatters/dexgarmentlab-lift-correspondence-20260822 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura consiste en un único tronco PointNet++ compartido que procesa dos entradas: una nube de puntos parcial de la prenda observada y las muestras de superficie de una malla canónica en reposo. Ambas se proyectan a un espacio común de 256 dimensiones, y la identificación se resuelve ordenando los 221 candidatos de la biblioteca por 1 menos la similitud coseno. El código de referencia se encuentra en `src/models/retrieval_embedding.py` dentro del repositorio UniClothDiff (rama `icra`).

El entrenamiento se ejecutó con el script `scripts/train_retrieval_embedding.py` (job 1153551, finalizado el 2026-09-08, 12 minutos en una GH200). Cada lote empareja un fotograma aleatorio (paso 5, con la corrupción de nube del estimador, escala conjunta 0,8-1,25 y guiñada) de 64 prendas de entrenamiento distintas con sus mallas en reposo. Se usó InfoNCE simétrico con temperatura fija 0,07, dropout 0,3, AdamW con tasa 1e-4 y decaimiento de peso 0,1, 6 épocas de 500 pasos, una época de calentamiento, planificador coseno y semilla 0. La validación se realizó cada 250 pasos contra la biblioteca de 221 mallas. El mejor *checkpoint* corresponde a la época 2, paso 1250, y sus pesos tienen SHA-256 `ab0395dab9c74fbae32a85e79b3de89686fa3150914a5a8699bad46dc1ad2938`.

## Capacidades

- Generación de embeddings de nube de puntos parcial de prendas de tela deformable en un espacio de 256 dimensiones.
- Embedding de muestras de superficie de mallas canónicas en reposo en el mismo espacio latente.
- Recuperación e identificación por similitud coseno sobre una biblioteca de 221 mallas canónicas.
- Emparejamiento aprendizaje contrastivo con InfoNCE simétrico, orientado a invariacia frente a corrupción de nube, escala y guiñada.
- Reproducibilidad: se publican hash de pesos, semilla, planificador e hiperparámetros completos.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión RGB, audio, código ni matemáticas.
- No dispone de modo de razonamiento (*thinking mode*) ni de decodificación especulativa.

## Casos de uso

- Línea base reproducible en investigación: permite comparar nuevas arquitecturas de identificación de prendas contra un punto de referencia con hiperparámetros, semilla y hash de pesos publicados, lo que facilita la reproducibilidad de resultados en artículos posteriores.
- Estimación de estado de objetos deformables en robótica: el embedding puede integrarse en un bucle de manipulación para asociar la nube parcial observada por un sensor de profundidad con la malla canónica correspondiente, siempre que se acepte su baja precisión top-1.
- Registro y seguimiento temporal de prendas: al ser invariante a guiñada y escala por diseño del aumento de datos, puede usarse para mantener la identidad de una prenda entre fotogramas consecutivos durante una secuencia de plegado o levantamiento.
- Anotación asistida de conjuntos de datos: el ranking top-5 puede emplearse como propuesta de candidatos para que un anotador humano confirme la correspondencia prenda-malla, reduciendo el coste de etiquetado manual en corpus textiles.
- Evaluación de infraestructura de simulación: sirve para medir la dificultad de la tarea de identificación sobre el entorno DexGarmentLab y para diagnosticar si las mallas canónicas de una biblioteca concreta son separables en el espacio de embedding.
- Docencia y prototipado de *retrieval* geométrico: al ser un modelo pequeño y de entrenamiento corto (12 minutos en una GH200), es adecuado como ejemplo práctico de aprendizaje contrastivo sobre nubes de puntos en cursos y talleres.
- Filtrado previo en pipelines de clasificación textil industrial: combinado con un verificador posterior más costoso, el embedding puede descartar candidatos poco plausibles antes de ejecutar un método de registro geométrico completo.

## Benchmarks y rendimiento

Resultados de validación durante el entrenamiento (primer fotograma, *checkpoint* de la época 2, paso 1250, 23 prendas de validación):

| Metrica | Valor |
|---|---|
| Top-1 en validacion (primer fotograma) | 17,2 % |
| Top-5 en validacion (primer fotograma) | 37,0 % |

Resultados publicados en el articulo para identificacion entre 221 mallas canonicas y 22 prendas reservadas (top-1 / top-5):

| Escenario | LRE (este modelo) | ClothAtlas |
|---|---|---|
| Fotograma plano | 0 / 5 | 22 / 22 |
| Fotograma levantado | 1 / 4 | 15 / 19 |
| Primeras tres observaciones | 0 / 6 | 22 / 22 |
| Las nueve observaciones | 1 / 5 | 18 / 22 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento documentado: una única GPU GH200, 12 minutos para 6 épocas de 500 pasos más calentamiento.
- El repositorio ocupa 0,0 GB según HuggingFace, lo que indica un *checkpoint* de menos de 100 MB y, por tanto, una inferencia viable en CPU y en cualquier GPU de consumo.
- VRAM exacta de inferencia: no disponible. Al tratarse de un tronco PointNet++ con salida de 256 dimensiones y lotes pequeños, la huella esperada es muy inferior a la de cualquier modelo de lenguaje, aunque el coste real depende del número de puntos de la nube y del tamaño de la biblioteca de candidatos (221 mallas).
- GPU recomendadas: no disponible en la documentación; la GH200 se cita únicamente para el entrenamiento.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo. La carga se realiza con `resolve_checkpoint` y `RetrievalEmbedding.load` del repositorio de código.
- Latencia y throughput: no disponibles.
- Coste dominante esperado: el preprocesado de la biblioteca de mallas canónicas (221 embeddings) y el cálculo de similitud coseno, no la propia red.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de embedding | Contexto | Licencia | Disponibilidad | Top-1 / Top-5 (nueve observaciones) |
|---|---|---|---|---|---|---|
| dexgarmentlab-lift-20260822-retrieval-embedding (LRE) | PointNet++ contrastivo | 256 | no aplica | MIT | HuggingFace | 1 / 5 |
| ClothAtlas | Metodo de referencia del articulo | no disponible | no aplica | no disponible | no disponible como modelo abierto | 18 / 22 |

No se dispone de informacion en la busqueda realizada sobre otros modelos abiertos comparables de identificacion de prendas deformables, por lo que la comparativa se limita a los dos elementos anteriores. La unica comparacion cuantitativa disponible es la publicada en la propia model card frente a ClothAtlas, que supera ampliamente a este modelo en todos los escenarios reportados.

## Limitaciones y advertencias

- Rendimiento muy bajo: 17,2 % top-1 en validación y 1/5 en el escenario de nueve observaciones del artículo, frente a 18/22 de ClothAtlas. No es adecuado para producción sin un verificador posterior.
- El propio autor lo etiqueta como línea base (LRE baseline), no como resultado final del artículo.
- Sesgos conocidos: no documentados explícitamente; el entrenamiento se limita a 64 prendas de entrenamiento por lote y a aumentos de escala 0,8-1,25 y guiñada, por lo que la generalización fuera de ese rango es incierta.
- Riesgo de confusión entre prendas: el top-5 alcanza el 37,0 % mientras el top-1 se queda en 17,2 %, lo que indica ambigüedad considerable entre mallas canónicas.
- Dominio restringido: solo nubes de puntos de prendas del entorno DexGarmentLab y bibliotecas de mallas canónicas; no procesa texto, imágenes RGB ni audio.
- Dependencia del entorno: requiere el paquete de código y la función `resolve_checkpoint` del repositorio UniClothDiff, lo que añade acoplamiento a una implementación concreta.
- Licencia MIT: permite uso comercial y modificación, pero al ser un modelo con 0 descargas y 0 likes no existe validación por parte de la comunidad ni soporte documentado.
- No se especifican los formatos de cuantización ni el formato exacto de los pesos, lo que puede complicar la integración en infraestructuras que esperen safetensors o GGUF.
- La model card no documenta idiomas ni sesgos sociales, ya que no es un modelo de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/Cloth-splatters/dexgarmentlab-lift-20260822-retrieval-embedding
- Dataset de entrenamiento: https://huggingface.co/datasets/Cloth-splatters/dexgarmentlab-lift-correspondence-20260822
- Código fuente (rama icra): https://github.com/jsll/UniClothDiff/tree/icra
- Articulo ClothAtlas: no disponible (la model card lo referencia por seccion, V-C, pero no incluye enlace)
- Demos: no disponible
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a definiciones genericas del termino "cloth" en diccionarios y enciclopedias, sin relacion con este modelo.
