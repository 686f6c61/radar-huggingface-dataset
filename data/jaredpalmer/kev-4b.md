# jaredpalmer/kev-4b

## Resumen

kev-4b es un "modelo de decisión" (decision model) publicado por jaredpalmer como adaptador LoRA sobre Qwen/Qwen3-4B-Base. No genera texto: recibe un documento de estado y un conjunto de preguntas tipadas (choice / noul / score) y devuelve, en una sola pasada forward, una distribución de probabilidad por pregunta. Está diseñado para servir el contrato público /v1/systemone de TypeSafe, es decir, para tomar decisiones estructuradas y calibradas en lugar de redactar respuestas.

Técnicamente es un transformer decoder de ~4.000 millones de parámetros congelado al que se le añaden un adaptador LoRA de rango 16 y una cabeza pointer; el repositorio pesa 0,3 GB, lo que confirma que solo se distribuyen los pesos del adaptador, no el modelo base. Se entrenó sobre la suite congelada decision-v7 (10.000 registros públicos de diez fuentes, 896 registros de política sobre nueve familias de plantillas y 1.680 registros generados a partir de 60 estructuras de reglas aleatorias con negación en cualquier posición).

Su relevancia es doble. Por un lado, ataca un nicho poco cubierto: clasificación tipada con calibración medida explícitamente (ECE de 0,065 in-distribution). Por otro, se publica como research preview y no como release versionado: de las tres semillas de la misma receta, solo esta supera la criba de publicación fijada de antemano (0,73 en pares de política reservados frente a 0,62 y 0,67 de las otras dos). Es, por tanto, un artefacto de investigación reproducible, con protocolo congelado y checksums, más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-4B-Base) con adaptador LoRA r=16 y cabeza pointer |
| Parametros totales | ~4.000 millones en el modelo base congelado; adaptador LoRA r=16 (repo de 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona fp32 y bf16 mediante KEV_DTYPE; no se publican formatos GGUF ni cuantizaciones de 4/8 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Pipeline | text-classification (decision tipada, sin generacion de texto) |
| Modelo base | Qwen/Qwen3-4B-Base (relacion: adapter) |
| Libreria | peft |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 170 / 2 |

## Arquitectura y entrenamiento

kev-4b no es un modelo generativo: es una cabeza de decisión acoplada a un decoder Qwen3-4B-Base congelado. La interfaz es "un documento (el estado) y un conjunto de preguntas tipadas como entrada; una distribución de probabilidad por pregunta como salida, en una sola pasada forward". Las preguntas son de tres tipos (choice, noul y score), lo que permite desde elección múltiple hasta umbrales ordinales. El adaptador es un LoRA de rango 16 con una cabeza pointer, servido a través del contrato /v1/systemone de TypeSafe.

El entrenamiento usó la suite congelada `evals/v4/decision-v4` (decision-v7): 10.000 registros públicos (1.000 por fuente, diez fuentes: Banking77, BoolQ, AG News, MultiNLI, SST-5, Yelp Review Full, TREC, DBpedia-14, Amazon Reviews Multi EN e IMDB), más dos brazos programáticos de política de 448 registros cada uno, dos épocas con LoRA r=16. La receta ampliada incluye 896 registros de política sobre nueve familias de plantillas (entre ellas cuatro familias ordinales de umbral Score) y 1.680 registros procedentes de 60 estructuras de reglas aleatorias con negación en cualquier posición. Los ítems de desarrollo y test son idénticos byte a byte a los de la versión v4, de modo que las cifras son comparables con previews anteriores.

Entre las innovaciones y hallazgos técnicos que documenta el autor destacan: (1) la capacidad domina el rendimiento fuera de dominio (pasar de 0,6B a 4B aporta +14 a +19 puntos porcentuales, mientras que de 4B a 8B solo +1 a +7); (2) el fine-tuning erosiona la capacidad del modelo base y la tasa de aprendizaje lo controla, de modo que bajar el lr de 2e-4 a 5e-5 fue la mayor mejora de receta encontrada (el base zero-shot con lectura por letra obtiene 0,688 en MMLU y 0,787 en PAWS, y la receta por defecto cae a 0,60-0,66 y 0,56-0,71 respectivamente); (3) más datos públicos suben la precisión in-distribution y bajan la transferencia a 4B (-3 puntos al pasar de 3.400 a 10.000 registros); y (4) los pares de política contrastivos programáticos enseñan las estructuras entrenadas (ambos correctos 0,85-1,0) pero transfieren solo parcialmente a estructuras no vistas (0,5-0,6 a 4B, 0,03-0,11 a 0,6B).

## Capacidades

- Decision tipada en una sola pasada forward: tipos de pregunta choice, noul y score (umbrales ordinales), con salida de distribución de probabilidad por pregunta.
- Clasificación de texto multi-dominio: intenciones bancarias, noticias, categorías de DBpedia (14 clases), sentimiento (SST-5), reseñas (Yelp, Amazon Reviews, IMDB) y temas (TREC).
- Inferencia de relación entre textos: NLI (MultiNLI), QNLI y paráfrasis (PAWS).
- Respuestas de sí/no sobre un pasaje (BoolQ) y elección múltiple de conocimiento (MMLU, con rendimiento limitado).
- Manejo de estructuras lógicas explícitas: composiciones booleanas del tipo "(A and B) or not C" (0,97) e "if A then not B else C" (0,88) en el conjunto de transferencia.
- Calibración medida de forma explícita: ECE de 0,065 sobre probabilidades crudas in-distribution.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Tool calling / function calling: no disponible; la model card no documenta soporte de herramientas.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; el modelo no genera texto ni ejecuta cadenas de acciones.
- Modo thinking, visión o audio: no disponible; no se documenta ninguna de estas capacidades.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar un ticket (el estado) contra un conjunto de preguntas tipadas de tipo choice ("¿es facturación, cuenta o producto?") y devolver probabilidades por opción, lo que permite fijar umbrales de derivación automática. Su ECE in-distribution de 0,065 hace que las probabilidades sean utilizables para ese umbral.
- Clasificación de intenciones en banca: se entrenó con 1.000 registros de Banking77 y sirve para mapear consultas de clientes a intenciones concretas dentro de un catálogo cerrado, con la ventaja de que las opciones se pueden reformular sin reentrenar el modelo.
- Moderación de contenido y detección de toxicidad: en TweetEval-offensive alcanza 0,75 fuera de dominio, suficiente como primera etapa de filtrado siempre que se combine con revisión humana, dado el 8,2% de errores con confianza alta (p ≥ 0,9 e incorrectos).
- Análisis de sentimiento y de reseñas a escala: soporta SST-5 (cinco niveles), Yelp Review Full, Amazon Reviews Multi e IMDB, por lo que puede puntuar reseñas con una única pasada en lugar de generar texto, reduciendo el coste por ítem.
- Comprobación de coherencia y parafraseo en pipelines de datos: con PAWS en 0,72 y QNLI en 0,89 fuera de dominio, sirve para deduplicar o validar pares pregunta-respuesta generados sintéticamente antes de incorporarlos a un conjunto de entrenamiento.
- Aplicación de políticas de negocio codificadas como reglas: el modelo fue entrenado con estructuras de reglas con negación y familias ordinales de umbral Score, de modo que puede evaluar condiciones tipo "si A entonces no B, en caso contrario C" sobre el estado; en el conjunto reservado acierta ambos hermanos en el 0,73 de los casos.
- Clasificación temática de documentos largos: con AG News y DBpedia-14 en el entrenamiento, resulta adecuado para etiquetar corpus de noticias o fichas enciclopédicas dentro de taxonomías fijas.
- Preguntas de sí/no sobre documentación: dado un fragmento de política interna y una pregunta booleana, el tipo noul permite responder sin generar texto libre, lo que evita alucinaciones de redacción (aunque no errores de decisión).

## Benchmarks y rendimiento

Resultados declarados por el autor (mismos ítems congelados para todas las filas). Las métricas del model-index figuran como `verified: false`.

| Metrica | kev-4b (preview) | kev-0.6b preview | kev-0.5b | Jev |
|---|---|---|---|---|
| Precision in-distribution (decision-v4 dev, 1.200 preguntas) | 0,854 | 0,805 | 0,712 | 0,845 |
| Precision out-of-domain (transfer-v4 dev, 560 preguntas) | 0,790 | 0,598 | 0,575 | 0,857 |
| Brier out-of-domain | 0,328 | 0,521 | 0,50 | 0,211 |
| Errores con confianza alta fuera de dominio (p ≥ 0,9 e incorrectos) | 8,2% | 5,2% | no disponible | 3,7% |
| Estructuras de politica reservadas, ambos correctos | 0,73 | 0,11 | no disponible | 0,86 |
| Tasa de inversion por orden de opciones | 0,06 | 0,02 | 0,21 | 0,00 |

Metricas del model-index (declaradas por el autor, no verificadas): precision 0,854 y ECE 0,065 sobre probabilidades crudas en decision-v4 development (1.204 registros); precision 0,790 y Brier 0,328 en transfer-v4 development (764 registros; seis fuentes nunca entrenadas y estructuras de política reservadas).

Precision por fuente fuera de dominio (kev-4b / Jev):

| Fuente | kev-4b | Jev |
|---|---|---|
| QNLI | 0,89 | 0,93 |
| SciQ | 0,99 | 0,99 |
| TweetEval-offensive | 0,75 | 0,81 |
| PAWS | 0,72 | 0,79 |
| MMLU | 0,65 | 0,90 |
| Emotion | 0,66 | 0,59 |
| deadline (aritmetica de fechas a 3 niveles) | 0,53 | 0,93 |
| (A and B) or not C | 0,97 | 0,97 |
| if A then not B else C | 0,88 | 0,78 |

Test bloqueado con una unica lectura exploratoria (`runs/locked/kev-4b-v7-preview-ungated/`, etiquetado como ungated porque la criba no se cumple en todas las semillas): in-distribution 0,856 (Brier 0,211); out-of-domain 0,806 (Brier 0,294, errores confiados 6,6%, pares reservados 0,66).

## Requisitos de hardware

- VRAM en fp32: ~16 GB, dato aportado por el autor para el modelo de 4B.
- VRAM en bf16: aproximadamente la mitad para los pesos (en torno a 8 GB, estimacion aritmetica a partir del dato en fp32); el autor recomienda `KEV_DTYPE=bf16` en equipos Mac de 32 GB.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 16 GB en fp32 (por ejemplo RTX 4090, 24 GB) o en el rango de 8-10 GB usando bf16. No hay datos publicados de cuantizaciones de 4 u 8 bits.
- GPU de centro de datos: probado en H100, con ~45 ms por petición empaquetada; en un Apple M5 la latencia sube a varios cientos de milisegundos.
- Opciones de despliegue: PEFT sobre transformers sirviendo el contrato /v1/systemone de TypeSafe. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, y al no ser un modelo generativo los runners orientados a generación de texto no son aplicables directamente.
- Almacenamiento: el repositorio del adaptador ocupa 0,3 GB, aunque el modelo base Qwen3-4B-Base debe descargarse por separado.

## Comparativa con modelos similares

Los únicos comparables publicados son los de la propia familia kev y el modelo de referencia Jev. No se dispone de parámetros, contexto ni licencia de los hermanos ni de Jev.

| Modelo | Parametros | Precision in-distribution | Precision out-of-domain | Brier out-of-domain | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kev-4b (preview) | ~4B + LoRA r=16 | 0,854 | 0,790 | 0,328 | Apache 2.0 | HuggingFace (este repo) |
| kev-0.6b preview | ~0,6B | 0,805 | 0,598 | 0,521 | no disponible | preview previo de la familia |
| kev-0.5b | ~0,5B | 0,712 | 0,575 | 0,50 | no disponible | preview previo de la familia |
| Jev | no disponible | 0,845 | 0,857 | 0,211 | no disponible | referencia interna del autor |
| Qwen3-4B-Base zero-shot (lectura por letra) | ~4B | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

Nota: el modelo base sin ajustar obtiene 0,688 en los mismos ítems de MMLU y 0,787 en PAWS, frente a 0,65 y 0,72 de kev-4b; el ajuste mejora la decisión tipada pero erosiona parte del conocimiento del base.

## Limitaciones y advertencias

- Es un research preview, no un release versionado: de las tres semillas de la misma receta, solo esta supera la criba de publicación; las otras dos obtienen 0,62 y 0,67 en pares de política reservados.
- Razonamiento sobre políticas no vistas: el autor lo sitúa "lejos de Jev", especialmente en composiciones de reglas no entrenadas y aritmética de fechas con periodos de gracia (0,53 frente a 0,93 de Jev).
- Preguntas con forma de producto y sin análogo en entrenamiento no están garantizadas: en el ejemplo de la documentación de TypeSafe ("dos cargos en mi tarjeta" → "¿hay un problema de facturación?"), este checkpoint responde 0,22 mientras que kev-0,6b responde 0,97. Un menor alejamiento del base implica menos priors específicos de tarea; hay que medir con datos propios.
- Calibración fuera de dominio insuficiente: el autor reporta un ECE crudo de 0,096, y la temperatura ajustada in-distribution no transfiere. Las probabilidades fuera de dominio son utilizables, pero no calibradas.
- Errores con confianza alta: 8,2% de los errores fuera de dominio tienen p ≥ 0,9, peor que kev-0,6b (5,2%) y que Jev (3,7%). No es aconsejable usarlo como única barrera en decisiones sensibles.
- Sensibilidad al orden de opciones: tasa de inversión de 0,06 al reordenar las alternativas.
- Sesgos: no se publica ningún análisis de sesgo en la información disponible. Los datos de entrenamiento son conjuntos públicos (IMDB, Yelp, Amazon Reviews, TweetEval) con sesgos conocidos de dominio y de anotación.
- Idioma: solo inglés. No hay soporte declarado de castellano ni de otras lenguas.
- Naturaleza no generativa: no produce texto, no soporta tool calling ni razonamiento multi-paso encadenado; fuera de su contrato de decisión tipada no debe esperarse utilidad.
- Licencia: Apache 2.0, por lo que el uso comercial está permitido, pero las métricas del model-index no están verificadas de forma independiente y el propio autor lo etiqueta como preview sujeto a revisión.
- Contexto máximo: no disponible en la información proporcionada; conviene validar la longitud de los documentos de estado antes de integrarlo.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/jaredpalmer/kev-4b
- Codigo, suites y todos los ensayos con hashes y bootstraps: https://github.com/jaredpalmer/kev (archivos `PLAN.md` y `runs/leaderboard.md`)
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a entidades bancarias sin relacion). No se han localizado papers, blogs ni demos adicionales.
