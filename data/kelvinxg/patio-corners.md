# kelvinxG/patio-corners

## Resumen

Patio Corners es un modelo de clasificacion de imagenes desarrollado por el usuario kelvinxG (Kelvin), publicado en HuggingFace bajo el identificador `kelvinxG/patio-corners`. Se trata de una red neuronal convolucional (CNN) ligera implementada en PyTorch, cuyo objetivo es reconocer la esquina visible de una carta de la baraja en capturas de pantalla de la aplicacion Poker Patio. El modelo distingue 52 identidades de carta (combinacion de palo y valor) mas una clase adicional `unknown` para descartes.

El modelo trabaja sobre recortes en escala de grises redimensionados a 32 x 48 pixeles, lo que lo convierte en un componente de muy bajo coste computacional. No es un detector de imagen completa: segun la propia model card, requiere la arquitectura `CornerNet` correspondiente y un preprocesado externo que localice previamente las regiones de carta. El fichero distribuido, `patio-corners.pt`, contiene el state dict entrenado junto con las etiquetas de clase.

La relevancia de esta publicacion es limitada y de caracter formativo: el autor la describe como parte de un proyecto de portfolio de OCR de poker de ambito local, entrenada sobre recursos de carta aumentados de Poker Patio y ejemplos negativos de interfaz y reversos de carta. El repositorio no registra descargas ni valoraciones, no declara licencia y no aporta resultados de benchmarks, por lo que debe considerarse un artefacto experimental y no una solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN `CornerNet` (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica el state dict en `.pt` |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | state dict de PyTorch (`.pt`), con las etiquetas de clase incluidas |
| Entrada | recorte en escala de grises de 32 x 48 pixeles |
| Clases de salida | 53 (52 cartas + clase `unknown`) |
| Tamano del repositorio | 0,0 GB segun HuggingFace |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como una CNN ligera de PyTorch denominada `CornerNet`, orientada a clasificacion de imagenes (pipeline `image-classification`). No se especifican el numero de capas, los canales por capa, el numero de parametros, la funcion de perdida ni el optimizador empleado. La unica informacion estructural concreta es la interfaz de entrada: recortes en escala de grises redimensionados a 32 x 48 pixeles, sobre los que se predice una de 53 clases.

Respecto al entrenamiento, la model card indica que se utilizaron recursos de carta de Poker Patio con aumento de datos (augmentation) y ejemplos negativos procedentes de elementos de interfaz y reversos de carta. No se declara el volumen de muestras, el numero de epocas, la particion train/validacion/test ni si se aplicaron tecnicas de regularizacion o ajuste fino posterior. Tampoco se menciona el uso de RLHF, DPO ni tecnicas equivalentes, algo por otra parte esperable en un clasificador de vision. El autor enmarca el trabajo en un proyecto de portfolio de OCR de poker ejecutado en local.

## Capacidades

- Clasificacion de esquinas de carta en 53 categorias: las 52 identidades de la baraja estandar mas una clase `unknown` para entradas que no correspondan a una carta reconocible.
- Procesamiento de recortes en escala de grises a 32 x 48 px, con coste computacional muy bajo.
- Generacion de etiquetas de clase junto con el state dict, lo que facilita la integracion en un pipeline de inferencia.
- No realiza deteccion ni localizacion de objetos: requiere que otro componente aplane y recorte previamente las regiones de carta.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de capacidades multilingues ni de generacion de texto.
- No incluye modo de razonamiento, vision general, audio ni ninguna capacidad multimodal mas alla de la clasificacion de recortes.

## Casos de uso

- Lectura automatica de manos en capturas de Poker Patio: el modelo se inserta como etapa final de un pipeline en el que un detector previo localiza las esquinas de carta y este clasificador asigna la identidad de cada una. Es adecuado por su tamano reducido y su entrenamiento especifico sobre recursos de esa aplicacion.
- Registro y estadistica de sesiones de poker: integrado en una herramienta de tracking local, permite reconstruir la secuencia de cartas de una mano a partir de capturas de pantalla y volcar los datos a una base de datos para analisis posterior del jugador.
- Pre-anotacion de datasets de naipes: usar el modelo para etiquetar automaticamente grandes volumenes de recortes y despues revisar manualmente solo los casos de baja confianza. Reduce el coste de construir corpus etiquetados para entrenar modelos mayores.
- Docencia y prototipado en vision por computador: sirve como ejemplo minimo y reproducible de un clasificador de 53 clases con entradas de 32 x 48 px, util para ilustrar aumento de datos, preprocesado de recortes y manejo de una clase de rechazo.
- Componente de bajo coste en aplicaciones interactivas: al operar sobre recortes pequenos, puede ejecutarse en CPU o en GPU integrada dentro de una aplicacion de escritorio sin afectar a la latencia percibida por el usuario.
- Punto de partida para fine-tuning en otros dominios de naipes: con reentrenamiento sobre datos propios, la misma arquitectura podria adaptarse a otras aplicaciones de cartas (solitario, blackjack), siempre que se recolecten ejemplos del nuevo dominio, ya que la precision fuera de Poker Patio no esta establecida.
- Pruebas de integracion y validacion de pipelines de OCR: util como modelo auxiliar para verificar que la etapa de deteccion y recorte entrega imagenes correctamente normalizadas, comparando la distribucion de predicciones frente a un conjunto de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, F1, matrices de confusion ni comparaciones con otros clasificadores, y tampoco se documenta una particion de evaluacion con la que reproducir metricas.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que la entrada es un unico canal de 32 x 48 pixeles, es razonable esperar un consumo minimo en inferencia, muy inferior a 1 GB, pero no hay cifras oficiales.
- GPU recomendadas: no se especifica ninguna. Por el tamano de la entrada, cualquier GPU consumer es suficiente; no se justifica el uso de A100, H100 ni aceleradores de gama profesional.
- Compatibilidad con GPU consumer: previsiblemente si, en practicamente cualquier modelo (por ejemplo, GTX 1050, RTX 3060 o RTX 4090), e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: al distribuirse como state dict de PyTorch, el uso previsto es cargarlo con la arquitectura `CornerNet` en un script de PyTorch. La exportacion a TorchScript u ONNX seria un paso adicional no confirmado por el autor. No hay versiones GGUF ni soporte documentado en vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un clasificador de imagenes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de clasificacion de cartas, y no se dispone de datos de parametros, contexto ni rendimiento de este modelo que permitan establecer una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- Uso exclusivamente educativo segun la propia model card; el autor indica que el modelo reconoce cartas, no estrategia de poker.
- No es un detector de imagen completa: sin el preprocesado de recorte de regiones de carta y la arquitectura `CornerNet` correspondiente, el state dict no es utilizable.
- Precision no establecida fuera de Poker Patio: el rendimiento en otros sitios web, otros temas visuales o condiciones de captura distintas no ha sido evaluado.
- Sesgo de dominio esperable: al entrenarse sobre recursos de una unica aplicacion y aumentos derivados de ellos, es probable que generalice mal ante barajas, iluminaciones, resoluciones o escalados diferentes.
- Riesgo de falsos positivos y confusion: la clase `unknown` se entrena con ejemplos negativos de interfaz y reversos de carta, pero no se documenta su tasa de error ni el equilibrio entre clases.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribucion. Cualquier uso en produccion requiere aclarar este punto con el autor.
- Ausencia de validacion de la comunidad: cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks ni evaluaciones de terceros.
- Repositorio de 0,0 GB segun HuggingFace: conviene verificar que los pesos se descargan correctamente y no son un puntero LFS mal resuelto.
- No apto para decisiones de juego: su salida es una etiqueta de carta, no una recomendacion ni un analisis de probabilidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kelvinxG/patio-corners
- Perfil de GitHub que coincide con el nombre del autor (no confirmado como la misma cuenta): https://github.com/KelvinxG
- No se han encontrado en la busqueda web otros enlaces relevantes al modelo: los resultados adicionales (Gemini Enterprise Agent Platform, GenRoom, Kelvin.ai, RemodelAI) no guardan relacion con este artefacto.
