# eltokh7/lory-dials-twin2k-v1

## Resumen

Lory Dials Twin-2K v1 es un adaptador de pesos de 2,4 MB desarrollado por eltokh7 que se acopla al modelo base Lory-4B v2 para convertir a un agente EDSL en un gemelo digital de un encuestado simulado. El adaptador no es un modelo de lenguaje autonomo: son mapas de bajo rango con tope aplicados sobre 8 capas lineales del modelo congelado (salidas de atencion y MLP de las capas 12, 16, 20 y 24), mas un conjunto de parametros compartidos que modelan la respuesta de compra en funcion del precio. El objetivo es reproducir las decisiones de compra de personas reales del dataset Twin-2K-500 a partir de un puñado de respuestas observadas (unas 5 por persona).

La relevancia del proyecto reside en su enfoque de evaluacion: el adaptador se entrena una sola vez sobre personas del dataset Twin-2K-500 (Toubia et al. 2025) y se evalua sobre personas y productos no vistos durante el entrenamiento. Segun la model card, con 5 respuestas por persona alcanza un 74,8 % de acierto en preguntas de "comprarias esto?", equiparando a GPT-6.2 Sol con el mismo numero de respuestas, y supera el 66,7 % publicado para gemelos basados en GPT-4.1-mini. Se distribuye como vista previa de investigacion bajo licencia Apache 2.0.

El modelo esta pensado para investigacion en economia conductual, simulacion de demanda y encuestas sinteticas, no como asistente general. Su alcance esta deliberadamente acotado: preguntas de compra con la redaccion exacta de Twin-2K-500, productos de supermercado estadounidenses y ajuste sobre elecciones de compra, no sobre cuestionarios de personalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de bajo rango con tope sobre 8 capas lineales de un transformer congelado (Lory-4B v2) |
| Parametros totales | No disponible (adaptador de 2,4 MB; el modelo base Lory-4B v2 tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Lory-4B v2) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (se carga mediante `WeightSpace.from_pretrained` del paquete `lory-dials`) |

## Arquitectura y entrenamiento

El adaptador inserta mapas de bajo rango con tope (capped low-rank maps) en las salidas de atencion y MLP de las capas 12, 16, 20 y 24 del modelo base Lory-4B v2, que permanece congelado. Ademas incorpora parametros compartidos entre personas: una constante `c0`, pesos de precio `w0` y `wc`, y un prior gaussiano sobre la poblacion de encuestados. El precio entra en la formulacion como `-softplus(w0 + wc·(c0+c))·log(1+price)`, una construccion que garantiza que la demanda siempre decrezca al aumentar el precio, imponiendo una restriccion economica razonable sobre la salida del modelo.

El entrenamiento se realizo una unica vez sobre personas del dataset Twin-2K-500 (Toubia et al. 2025, licencia CC-BY-4.0) y nunca sobre las personas empleadas en la evaluacion. El fichero `manifest.json` fija la version del modelo base. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Simulacion de encuestados: genera respuestas de compra ("comprarias esto?") para personas sinteticas ajustadas a partir de respuestas reales.
- Ajuste por persona: con aproximadamente 5 respuestas de compra por individuo, produce 8 numeros que caracterizan a ese encuestado.
- Estimacion de demanda agregada: calcula curvas de demanda poblacional a partir de escenarios de precio mediante la funcion `demand`.
- Modelado de sensibilidad al precio: la formulacion garantiza monotonia decreciente de la demanda respecto al precio.
- Integracion con EDSL: funciona como agente dentro del ecosistema EDSL mediante el paquete `lory-dials`.
- Generalizacion a productos no vistos: segun la model card, mantiene el rendimiento en productos no presentes en el entrenamiento.
- No soporta (segun la informacion disponible): tool calling, razonamiento multi-paso, vision, audio, ni modo de pensamiento.

## Casos de uso

- Investigacion en economia conductual: simular paneles de encuestados para estudiar sensibilidad al precio sin reclutar participantes reales, aprovechando el ajuste con solo 5 respuestas por persona.
- Pruebas de concepto de precios: generar curvas de demanda para productos de gran consumo (por ejemplo, yogur griego en distintos formatos) antes de lanzar un estudio de mercado.
- Validacion de metodologias de gemelos digitales: comparar el rendimiento del adaptador frente a gemelos basados en modelos propietarios con el mismo numero de respuestas de calibracion.
- Docencia en economia cuantitativa: ilustrar como un modelo de lenguaje congelado puede personalizarse mediante adaptadores de bajo rango para reproducir decisiones individuales.
- Simulacion de escenarios contrafactuales: evaluar como cambiaria la demanda agregada al modificar precios en una cesta de productos de supermercado.
- Investigacion sobre calibracion con pocos datos: estudiar el efecto del numero de respuestas por persona (5 frente a 20) en la precision de las predicciones, dado que la model card reporta diferencias frente a GPT-6.2 Sol en ese regimen.

## Benchmarks y rendimiento

| Metrica | Lory Dials Twin-2K v1 | GPT-6.2 Sol | GPT-4.1-mini (gemelos publicados) |
|---|---|---|---|
| Acierto "comprarias esto?" con 5 respuestas por persona (100 personas y 20 productos no vistos) | 74,8 % | 74,8 % | No disponible |
| Acierto con 20 respuestas por persona | 76,0 % | 78,4 % | No disponible |
| Niveles de demanda poblacional | Inferior a GPT-6.2 Sol (sin cifra publicada) | Superior (sin cifra publicada) | No disponible |
| Acierto global publicado | No disponible | No disponible | 66,7 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Lory-4B v2 (4B parametros) y de su cuantizacion.
- El adaptador en si ocupa 2,4 MB, por lo que el coste de memoria lo determina casi por completo el modelo base.
- GPU recomendadas: no disponibles para este adaptador; para un modelo base de 4B, una GPU consumer con suficiente VRAM para la cuantizacion elegida seria suficiente en terminos generales, pero no se confirma en la informacion disponible.
- Opciones de despliegue: el paquete `lory-dials` (instalable via `pip install "git+https://github.com/keltokhy/lory-dials.git"`) sobre el modelo base Lory-4B v2; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (5 respuestas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lory Dials Twin-2K v1 | Adaptador sobre Lory-4B v2 | 4B (base) + 2,4 MB (adaptador) | No disponible | 74,8 % | Apache 2.0 | Hugging Face |
| GPT-6.2 Sol (gemelo con mismas respuestas) | Modelo propietario | No disponible | No disponible | 74,8 % (5 respuestas); 78,4 % (20 respuestas) | Propietaria | API comercial |
| Gemelos publicados con GPT-4.1-mini | Modelo propietario | No disponible | No disponible | 66,7 % | Propietaria | API comercial |

No se dispone de informacion sobre otros adaptadores abiertos comparables de gemelos digitales de encuestados.

## Limitaciones y advertencias

- Alcance restringido a preguntas de compra con la redaccion exacta de Twin-2K-500; otras formulaciones degradan el rendimiento ("other wordings raise", segun la model card).
- Ajustado sobre elecciones de compra, no sobre cuestionarios de personalidad ni otros tipos de encuesta.
- Orientado a productos de supermercado de estilo estadounidense; la generalizacion a otras categorias o mercados no esta validada.
- Con 20 respuestas por persona queda por debajo de GPT-6.2 Sol (76,0 % frente a 78,4 %) y tambien en niveles de demanda poblacional.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al tratarse de una vista previa de investigacion, no se recomienda su uso en produccion sin validacion adicional.
- Licencia Apache 2.0 para el adaptador, pero el dataset de entrenamiento Twin-2K-500 es CC-BY-4.0; conviene revisar las condiciones de atribucion.
- No se declaran idiomas soportados, por lo que el uso en castellano no esta garantizado.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo dia (27 de noviembre de 2026), lo que sugiere ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eltokh7/lory-dials-twin2k-v1
- Modelo base Lory-4B v2: https://huggingface.co/eltokh7/lory-4b-v2
- Paquete `lory-dials`: https://github.com/keltokhy/lory-dials
- Referencia del dataset: Toubia et al. 2025, Twin-2K-500 (CC-BY-4.0); no se proporciona URL directa en la informacion disponible.
