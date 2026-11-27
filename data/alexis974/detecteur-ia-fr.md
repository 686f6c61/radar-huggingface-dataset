# alexis974/detecteur-ia-fr

## Resumen

`alexis974/detecteur-ia-fr` es un clasificador binario de texto (humano frente a generado por IA) desarrollado por el autor alexis974 para el sitio "Détecteur de texte IA". Se construye mediante ajuste fino del modelo base `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingue de pequeno tamano, y se distribuye en formato ONNX para su ejecucion en el navegador a traves de Transformers.js. La tarea declarada en el pipeline es `text-classification` con dos etiquetas: 0 = humano, 1 = IA.

El modelo esta especializado en frances (aunque declara soporte tambien para ingles) y responde a una necesidad practica muy concreta: detectar texto sintetico en entornos web y de produccion sin depender de infraestructura de servidor. Al estar cuantizado y exportado a ONNX, puede ejecutarse del lado del cliente, lo que reduce costes de inferencia y evita enviar el texto del usuario a un backend externo.

Su relevancia actual deriva de la proliferacion de contenido generado por LLM y de la demanda de herramientas de verificacion ligeras. El modelo es pequeno (derivado de una variante *small* de mmBERT), con licencia MIT, y publica metricas de validacion notables: AUROC de 0,9985 y una tasa de deteccion de textos de IA del 98,9 % con solo un 1 % de falsos positivos. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que se trata de un artefacto muy reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, variante small de mmBERT) |
| Parametros totales | no disponible (modelo base `jhu-clsp/mmBERT-small`; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos ONNX cuantizados (el tag `base_model:quantized` lo indica); niveles concretos no disponibles |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (Transformers.js) |

## Arquitectura y entrenamiento

El modelo es un encoder tipo BERT (familia ModernBERT) afinado para clasificacion de secuencias. Parte de `jhu-clsp/mmBERT-small`, un modelo multilingue de la familia ModernBERT desarrollada por JHU CLSP, y anade una cabeza de clasificacion binaria sobre la representacion del token de agregacion. Al ser un encoder bidireccional, no genera texto: solo asigna una probabilidad a la hipotesis "texto generado por IA".

Segun la model card, el entrenamiento se realizo sobre textos humanos anteriores a 2023 y sus "miroirs" (versiones equivalentes) generados por varios modelos de lenguaje, con una estrategia de *hard example mining* (busqueda de ejemplos dificiles). No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un clasificador). Tampoco se detalla el proceso de cuantizacion ni la conversion a ONNX mas alla de la mencion al tag `base_model:quantized`.

La innovacion principal no esta en la arquitectura, sino en el empaquetado: la exportacion a ONNX y la integracion con Transformers.js permiten inferencia en navegador, lo que es poco habitual en detectores de IA de calidad. El autor remite a `metriques.json` y al banco de pruebas del sitio para el detalle de resultados, pero esos ficheros no estan incluidos en la informacion proporcionada.

## Capacidades

- Clasificacion binaria de texto: distingue entre texto escrito por humanos y texto generado por modelos de IA.
- Salida probabilistica: la cabeza de clasificacion devuelve una puntuacion que puede umbralizarse segun la tolerancia a falsos positivos deseada.
- Ejecucion en navegador: al estar en ONNX y disenado para Transformers.js, puede correr del lado del cliente sin backend.
- Multilingue limitado: entrenado y evaluado principalmente en frances, con soporte declarado para ingles.
- Deteccion robusta segun el autor: 98,9 % de textos de IA detectados a un 1 % de falsos positivos en validacion.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un clasificador de texto.
- No genera texto ni mantiene conversaciones multi-turno.

## Casos de uso

- Moderacion de contenido en plataformas web: integrado en el frontend mediante Transformers.js, puede marcar comentarios o articulos sospechosos de ser generados por IA antes de enviarlos al servidor, reduciendo carga y preservando la privacidad del texto.
- Verificacion de originalidad en entornos educativos: un corrector o una plataforma de entregas puede ejecutar el clasificador en local sobre redacciones en frances y ofrecer al profesor una puntuacion de sospecha como senal adicional, nunca como prueba definitiva.
- Filtrado de resenas y opiniones en comercio electronico: permite priorizar manualmente las resenas con alta probabilidad de ser sinteticas, gracias a su bajo coste de inferencia en navegador o en un servicio ligero.
- Deteccion en pipelines de publicacion editorial: un CMS puede clasificar articulos recibidos de colaboradores y alertar al editor cuando la probabilidad de generacion por IA supera un umbral configurable.
- Analisis de corpus de investigacion: investigadores que estudian la difusion de contenido sintetico pueden aplicar el modelo a grandes volumenes de texto frances sin infraestructura GPU, al ser un encoder pequeno y cuantizado.
- Extension de navegador para verificacion en tiempo real: al ejecutarse en ONNX, puede integrarse en una extension que resalte parrafos sospechosos mientras el usuario navega, sin enviar datos a terceros.
- Prefiltrado en sistemas de moderacion mas complejos: como primera etapa barata que descarte el grueso de textos claramente humanos y derive solo los casos dudosos a modelos mayores o a revision humana.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor en la model card son los de la particion de validacion:

| Metrica | Valor |
|---|---|
| AUROC (validacion) | 0,9985 |
| Tasa de deteccion de textos de IA a 1 % de falsos positivos | 0,989 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con otros detectores. Las cifras anteriores proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al derivar de un modelo *small* de ModernBERT y estar cuantizado en ONNX, la huella es muy reducida (del orden de cientos de MB en el repositorio completo, 0,7 GB).
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. En caso de usar GPU, cualquier tarjeta consumer moderna (RTX 3060 o superior) es mas que suficiente.
- Compatibilidad con GPU consumer: si, ampliamente; el modelo esta pensado para ejecutarse incluso en navegador.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de clasificacion de este tipo.
- Latencia y throughput estimados: no disponibles. Al ser un encoder pequeno y cuantizado, la latencia esperada por inferencia es baja, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| `alexis974/detecteur-ia-fr` | Clasificador IA/humano | no disponible (base small) | no disponible | fr, en | MIT | ONNX |
| `jhu-clsp/mmBERT-small` (modelo base) | Encoder multilingue | no disponible | no disponible | multilingue | no disponible en esta ficha | safetensors |
| Detectores de IA comerciales (p. ej. GPTZero, Originality.ai) | Servicio propietario | no disponible | no disponible | varios | propietaria | API |

No se dispone de datos de benchmarks comparativos con otros detectores open source en la informacion proporcionada, por lo que la comparacion de rendimiento queda como "no disponible".

## Limitaciones y advertencias

- Validacion limitada: el repositorio registra cero descargas y cero likes, y las metricas provienen unicamente del autor; no hay evaluacion independiente.
- Riesgo de falsos positivos y negativos: cualquier detector de IA es falible; un 1 % de falsos positivos implica que textos humanos pueden marcarse como sinteticos, con consecuencias graves en contextos academicos o laborales.
- Sesgo de dominio: el entrenamiento usa textos humanos anteriores a 2023 y generaciones de modelos concretos; textos humanos posteriores o generados por modelos mas recientes pueden degradar el rendimiento.
- Sesgo linguistico: aunque declara soporte para ingles, el entrenamiento esta centrado en frances; el rendimiento en otros idiomas no esta documentado.
- No es una prueba definitiva: no debe usarse como unica evidencia para acusar a una persona de usar IA.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright.
- Caveat de produccion: el autor remite a `metriques.json` y al banco de pruebas del sitio, pero esos artefactos no estan incluidos en la informacion disponible, lo que dificulta la reproducibilidad.
- Longitud de contexto no documentada: se desconoce el maximo de tokens por entrada, un dato critico para clasificar documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexis974/detecteur-ia-fr
- Repositorio del sitio "Détecteur de texte IA": https://github.com/alexis-peche-project/detecteur-ia
- Modelo base `jhu-clsp/mmBERT-small`: https://huggingface.co/jhu-clsp/mmBERT-small
- Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
