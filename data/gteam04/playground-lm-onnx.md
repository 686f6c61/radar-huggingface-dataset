# Gteam04/playground-lm-onnx

## Resumen

PlaygroundLM ONNX es una publicacion de pesos de inferencia para el modelo PlaygroundLM, un modelo de generacion de texto entrenado desde cero por el usuario Gteam04. El repositorio contiene los artefactos ONNX destinados a ejecucion local y potencialmente en navegador, no un modelo base nuevo: se trata de la exportacion a ONNX con cuantizacion de un modelo previo de la misma serie. El tamano del repositorio es de 0,4 GB, lo que sugiere un modelo de escala pequena, aunque no se especifica el numero de parametros.

La publicacion se presenta explicitamente como un "candidato de publicacion local": la verificacion en navegador sigue pendiente y la integracion en repositorios esta sin completar. Los pesos usan cuantizacion weight-only q8 (MatMulNBits con bloque de 32) mas modelos Gather cuantizados, en lugar del fallback historico dynamic-int8 que el autor marca como defectuoso. El modelo declara soporte unicamente para ingles y no incluye informacion de licencia.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card detallada sobre arquitectura o datos de entrenamiento. Resulta util como referencia para quienes evaluan despliegue ONNX en navegador con ORT Web, pero no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de generacion de texto, entrenado desde cero; detalles no publicados) |
| Parametros totales | no disponible (repo de 0,4 GB, mayoritariamente pesos cuantizados q8) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 tokens verificados en ejecucion CPU ONNX (contexto maximo no declarado) |
| Tipos de cuantizacion | q8 weight-only MatMulNBits con bloque de 32; modelos Gather cuantizados; exportador interno nombra el fichero model.int8.onnx |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | ONNX (.q8.onnx en la nomenclatura de publicacion; internamente model.int8.onnx) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna (numero de capas, dimensiones, mecanismo de atencion ni variantes como MoE o SSM). La model card solo indica que el modelo fue "trained from scratch" (entrenado desde cero) y que los artefactos publicados son pesos de inferencia. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica destacable no esta en el modelo sino en el pipeline de exportacion: se generan pesos ONNX con cuantizacion weight-only q8 mediante MatMulNBits (bloque de 32) y se cuantizan tambien las operaciones Gather, evitando el fallback dynamic-int8 que el autor describe como defectuoso. El autor reporta validacion en CPU ONNX hasta contexto 1024, con longitudes de texto y aleatorias variadas, batch size 2, comprobacion de logits finitos en todo el vocabulario y seis comparaciones independientes de generacion greedy de 16 tokens. En cuatro de las seis secuencias greedy la salida coincide exactamente con PyTorch; en dos diverge, lo que confirma que la cuantizacion es lossy.

## Capacidades

- Generacion de texto autoregresiva en ingles, con decodificacion greedy verificada hasta 16 tokens en las pruebas del autor.
- Inferencia en CPU mediante ONNX Runtime, con soporte declarado para contexto de hasta 1024 tokens en las pruebas realizadas.
- Compatibilidad prevista con ORT Web (navegador) mediante MatMulNBits y Gather, aunque la verificacion en navegador sigue pendiente segun la model card.
- Tokenizador GPT-2 (mencionado en las tareas de verificacion pendientes).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Prototipado de inferencia ONNX en local: el modelo sirve para validar pipelines de ONNX Runtime en CPU con un modelo pequeno (repo de 0,4 GB) antes de escalar a modelos mayores, gracias a que el autor ya verifico ejecucion hasta contexto 1024 y batch size 2.
- Pruebas de integracion de ORT Web: util para equipos que evaluan si MatMulNBits y Gather funcionan en navegador, ya que la model card detalla explicitamente las comprobaciones pendientes (CORS, SHA256 de assets, soporte de ORT Web, memoria en escritorio y movil).
- Validacion de pipelines de cuantizacion: sirve como caso de estudio de exportacion weight-only q8 con bloque 32 y comparacion de divergencia frente a PyTorch (4 de 6 secuencias identicas), util para calibrar expectativas de perdida por cuantizacion.
- Docencia y experimentacion con modelos entrenados desde cero: al ser un modelo pequeno en ingles, permite estudiar el ciclo completo entrenamiento-exportacion-despliegue sin requerir infraestructura GPU.
- Pruebas de generacion de texto offline en ingles: para demos de generacion de texto breve en entornos sin conectividad, ejecutando en CPU.
- Verificacion de tokenizador GPT-2 en flujos ONNX: util para comprobar la integracion del tokenizador con el grafo exportado antes de adoptar modelos mayores con el mismo esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica de calidad reportada es la coincidencia de generacion greedy: cuatro de seis secuencias de 16 tokens coinciden exactamente con PyTorch para cada modelo, y dos divergen. El autor advierte explicitamente que la cercania numerica no demuestra calidad de tarea ni compatibilidad con navegador.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; al ser un repo de 0,4 GB en q8, la inferencia en CPU es viable y una GPU consumer con 4-8 GB deberia ser suficiente, aunque no hay datos oficiales.
- GPU recomendadas: no disponibles; el autor valida exclusivamente ejecucion en CPU ONNX.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio, pero sin confirmacion del autor.
- Opciones de despliegue: ONNX Runtime (CPU verificado), ORT Web (pendiente de verificacion), con tokenizador GPT-2.
- Latencia y throughput: no disponibles. El autor no publica tiempos de ejecucion, solo confirma que la ejecucion completa hasta contexto 1024 con batch size 2.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma serie ni datos de rendimiento que permitan una comparacion rigurosa. Los resultados de busqueda web apuntan a entidades homonimas sin relacion tecnica verificada: LM Playground (aplicacion Android con llama.cpp) y playgroundlm.com (interfaz multi-modelo comercial), que no son alternativas equivalentes a este artefacto ONNX.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks ni evaluacion de calidad de tarea publicada; no apto para produccion sin evaluacion propia.
- Cuantizacion lossy confirmada: dos de seis secuencias greedy divergen de PyTorch, lo que puede afectar a tareas que requieran fidelidad exacta.
- Verificacion en navegador pendiente: CORS, SHA256 de assets, soporte de ORT Web para MatMulNBits/Gather, memoria en escritorio y movil y comportamiento de fallback no estan confirmados.
- Licencia no disponible: no puede asumirse uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue comercial.
- Solo ingles declarado; sin soporte multilingue documentado.
- Contexto verificado de 1024 tokens; no se declara contexto maximo superior.
- Repositorio con cero descargas y cero likes en el momento de la consulta, lo que refleja ausencia de validacion por la comunidad.
- El autor advierte de no desplegar credenciales en frontend y de no publicar ni seleccionar el modelo dynamic-int8 step19366 como fallback.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados.

## Enlaces

- Hugging Face: https://huggingface.co/Gteam04/playground-lm-onnx
- LM Playground (aplicacion Android, entidad homonima sin relacion verificada): https://lmplayground.app/
- PlaygroundLM (interfaz multi-modelo, entidad homonima sin relacion verificada): https://playgroundlm.com/
