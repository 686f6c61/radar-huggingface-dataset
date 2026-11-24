# Matheus8432/hess-chess-transformer-v2

## Resumen

Hess Chess Transformer v2 es un modelo neuronal especializado en la predicción de jugadas de ajedrez, desarrollado por Matheus Covre de Queiroz (usuario Matheus8432 en Hugging Face) en el marco de su proyecto Hess, descrito en el trabajo *Inteligência artificial aplicada ao xadrez: arquiteturas neurais e uma arena interativa*. El modelo recibe una representación de una posición de ajedrez (hasta 70 tokens) y produce logits independientes para las 64 casillas de origen y las 64 casillas de destino, que se combinan para puntuar jugadas legales.

Se trata de un transformer encoder compacto, con 19,6 millones de parámetros, embeddings de 512 dimensiones, ocho cabezas de atención y seis capas. No es un modelo de lenguaje general: su vocabulario de 975 tokens está codificado específicamente para el dominio del ajedrez, y no genera texto libre. Su relevancia es acotada y experimental: sirve como pieza de una arena interactiva de ajedrez en navegador y como caso de estudio académico sobre arquitecturas neuronales aplicadas al ajedrez.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio. No se han publicado resultados de fuerza de juego (Elo), benchmarks comparativos ni detalles completos del dataset de entrenamiento. El modelo tiene cero descargas y cero likes en el momento de la consulta, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (6 capas, 8 cabezas de atencion, embeddings de 512 dimensiones) |
| Parametros totales | 19.602.753 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 70 tokens de posicion (longitud fija de entrada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de dominio especifico de ajedrez, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (conversion documentada a `.pth` para la arena) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder con un vocabulario de 975 tokens, embeddings de 512 dimensiones, ocho cabezas de atencion y seis capas. La entrada consiste en 70 tokens que codifican la posicion de ajedrez. La salida se divide en dos cabezas: una que emite logits para las 64 casillas de origen y otra para las 64 casillas de destino. La puntuacion de una jugada legal se obtiene sumando el logit de su casilla de origen y el de su casilla de destino, segun el ejemplo incluido en la model card.

El entrenamiento se describe como prediccion supervisada de jugadas a partir de posiciones de partidas. La model card menciona que el informe del proyecto documenta la configuracion comparativa de entrenamiento y los resultados para las CNN, pero no proporciona el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. El modelo puntua una unica posicion sin busqueda de jugadas futuras.

## Capacidades

- Prediccion de jugadas de ajedrez: dada una posicion, puntua jugadas legales mediante la suma de logits de origen y destino.
- Salida en notacion UCI (por ejemplo, `e2e4`) a traves del script `inference.py` incluido en el repositorio.
- Deteccion de fin de partida: el script informa cuando la partida ha terminado en lugar de proponer jugada.
- Integracion con python-chess para la generacion y validacion de jugadas legales.
- Inferencia en CPU verificada por el autor en varias posiciones.
- Integracion en la arena web del proyecto Hess para jugar partidas completas en el navegador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto libre.
- No tiene capacidades multilingues en el sentido de modelos de lenguaje; su "vocabulario" es una codificacion de ajedrez.

## Casos de uso

- Motor de ajedrez didactico en navegador: la arena Hess carga el checkpoint y permite jugar una partida completa eligiendo color y modelo, lo que resulta adecuado para demostraciones y docencia sin infraestructura de servidor.
- Analisis de posiciones sin busqueda: al puntuar directamente origen y destino, el modelo ofrece una evaluacion rapida de jugadas candidatas, util como baseline en experimentos de politica pura frente a motores con busqueda.
- Investigacion academica sobre representacion de tableros: el esquema de 70 tokens y las cabezas separadas de origen y destino sirven como referencia reproducible para comparar codificaciones alternativas.
- Generacion de datasets de jugadas etiquetadas: el modelo puede preetiquetar posiciones para filtrar o priorizar ejemplos en pipelines de entrenamiento de otros modelos.
- Prototipo de oponente en aplicaciones de ajedrez: su tamano de 19,6 millones de parametros permite ejecutarlo en CPU dentro de aplicaciones ligeras o entornos sin GPU.
- Benchmark de jugadas legales en CI: el script de inferencia y la comprobacion de legalidad con python-chess permiten montar pruebas automatizadas que verifiquen que el modelo no emite jugadas ilegales tras cambios en el codigo.
- Comparativa de arquitecturas en el aula: al existir variantes CNN en el mismo proyecto, el transformer v2 sirve como punto de comparacion controlado en practicas sobre arquitecturas neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la fuerza de juego y el Elo permanecen sin medir, y que la comprobacion realizada se limito a la legalidad de las jugadas en inferencia CPU sobre varias posiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (19,6 millones de parametros, aproximadamente 78 MB en fp32 y 39 MB en fp16); el repositorio ocupa 0,1 GB.
- GPU recomendadas: no requiere GPU; el autor verifico la inferencia en CPU. Cualquier GPU consumer (por ejemplo, GTX 1060 o superior) es mas que suficiente.
- Cabe en cualquier GPU consumer y en CPU sin problemas; tambien en entornos con poca memoria.
- Opciones de despliegue: PyTorch nativo con el script `inference.py`; la arena usa FastAPI con uvicorn (`hess.web_app:app`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y por el tipo de modelo (no generativo de texto) no son aplicables.
- Latencia y throughput: no disponibles. Al ser un modelo de 19,6 millones de parametros con entrada fija de 70 tokens, la latencia esperada es de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas. Como referencia cualitativa, el propio proyecto menciona variantes CNN entrenadas en el mismo marco, pero sin cifras publicadas que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hess Chess Transformer v2 | 19,6 M | 70 tokens de posicion | no disponible | Hugging Face (0 descargas) |
| Alternativas CNN del proyecto Hess | no disponible | no disponible | no disponible | no disponible |
| Otros motores neuronales de ajedrez | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fuerza de juego sin medir: el autor declara que el Elo y el rendimiento competitivo no se han evaluado.
- Sin busqueda: la politica puntua una unica posicion sin explorar jugadas futuras, lo que limita su calidad frente a motores con busqueda.
- Ambiguedad en promociones: las cabezas de origen y destino asignan la misma puntuacion a promociones con casillas identicas, por lo que no distingue la pieza de promocion.
- Desempate dependiente de python-chess: la seleccion de jugada rompe empates segun el orden devuelto por la libreria, lo que introduce dependencia de implementacion.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en produccion.
- Idiomas y sesgos: no hay informacion sobre sesgos; al ser un modelo de dominio cerrado, no aplican sesgos linguisticos, pero si posibles sesgos derivados de la distribucion de partidas de entrenamiento (no documentada).
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero puede proponer jugadas de baja calidad; la legalidad debe validarse externamente con python-chess.
- Repositorio de la arena con acceso restringido: el GitHub del proyecto requiere acceso, lo que dificulta la reproducibilidad completa.
- Madurez: cero descargas y cero likes; sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Matheus8432/hess-chess-transformer-v2
- Repositorio de la arena Hess: https://github.com/matheusCovre/xadrez_tcc#jogar
- Guia de instalacion de uv: https://docs.astral.sh/uv/getting-started/installation/
