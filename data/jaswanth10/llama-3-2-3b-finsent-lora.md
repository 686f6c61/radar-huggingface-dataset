# Jaswanth10/Llama-3.2-3B-FinSent-LoRA

## Resumen

Llama-3.2-3B-FinSent-LoRA es un adaptador LoRA sobre el modelo instructivo Meta Llama-3.2-3B-Instruct, desarrollado por el usuario Jaswanth10 y publicado en Hugging Face. Su proposito es concreto: clasificar tuits de contenido financiero en una de tres etiquetas de sentimiento de mercado (Bearish, Bullish o Neutral). No se trata de un modelo generativo de proposito general, sino de un ajuste fino supervisado que reorienta la salida del modelo base hacia una tarea de clasificacion de tres clases.

El adaptador se entrena sobre el split de entrenamiento del dataset `zeroshot/twitter-financial-news-sentiment` (8.588 tuits tras reservar un 10% estratificado para desarrollo) y se evalua sobre el split de validacion oficial de 2.388 tuits, nunca visto durante el entrenamiento. El resultado reportado es una exactitud de 0,902 y un macro-F1 de 0,873, muy por encima de la linea base TF-IDF con regresion logistica (0,806 de exactitud, 0,697 de macro-F1) y del propio Llama-3.2-3B sin adaptador en modo zero-shot (0,606 en ambas metricas).

La relevancia practica del modelo esta en su coste: se entrena en una T4 gratuita de Colab en aproximadamente una hora y solo anade 24,3 millones de parametros entrenables (0,7511% del total del modelo base). Es un ejemplo de adaptacion eficiente de un LLM de 3.000 millones de parametros a una tarea de dominio estrecho con recursos minimos. La licencia heredada es la Llama 3.2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama-3.2-3B-Instruct |
| Parametros totales | 3.237.063.680 en el modelo base; 24.313.856 entrenables en el adaptador (0,7511%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; la model card no la declara) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion y computo en fp16; el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Meta Llama-3.2-3B-Instruct, un transformer decoder-only de 3.237 millones de parametros. El ajuste se realiza con LoRA de rango 16, alpha 32 y dropout 0,05, con modulos objetivo q, k, v, o, gate, up y down en las 28 capas del modelo base. El modelo base se carga cuantizado en 4-bit NF4 con doble cuantizacion y computo en fp16, lo que permite el entrenamiento en una GPU T4 de 16 GB.

El entrenamiento usa 8.588 tuits (el split de entrenamiento de 9.543 ejemplos menos un 10% estratificado reservado para desarrollo, semilla 42), durante 2 epocas y 1.074 pasos, con batch efectivo de 16 (8 por dispositivo x 2 de acumulacion), learning rate 2e-4 con schedule coseno y 30 pasos de warmup. La perdida es entropia cruzada calculada unicamente sobre los tokens de respuesta. El entrenamiento completo tardo aproximadamente 1 hora y 4 minutos en una Colab T4 gratuita. Se realizo una ablacion con rango 8 y alpha 16 que obtuvo un macro-F1 en desarrollo de 0,8876 frente a 0,8992 del rango 16, una diferencia de aproximadamente 1 punto que el autor califica como posiblemente ruido al tratarse de una sola ejecucion.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases: Bearish, Bullish y Neutral, a partir de texto de tuits.
- Salida orientada a etiqueta corta, no a generacion libre extensa: el ajuste esta disenado para producir la etiqueta como respuesta.
- Capacidad multilingue limitada al ingles, segun la model card y los tags del repositorio.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso especifico para este adaptador.
- No se documenta modo thinking, vision ni audio.
- El modelo base Llama-3.2-3B-Instruct conserva sus capacidades genericas subyacentes, pero el adaptador esta especializado en la tarea de clasificacion y no se han evaluado otras capacidades tras el ajuste.

## Casos de uso

- Monitorizacion de sentimiento en redes sociales financieras: el adaptador clasifica tuits en tiempo casi real como Bearish, Bullish o Neutral, con una exactitud reportada de 0,902 sobre el split de validacion, lo que permite agregar senal de mercado a partir de flujo de Twitter.
- Senal auxiliar para estrategias cuantitativas: dado que los errores de direccion opuesta son raros segun la matriz de confusion (1 tuit Bullish predicho como Bearish y 0 Bearish predichos como Bullish), el modelo es adecuado como filtro conservador que solo emite senal direccional cuando hay alta confianza.
- Enriquecimiento de datasets de noticias financieras: etiquetado automatico de grandes volumenes de tuits para construir corpus anotados o para preetiquetar y revisar manualmente solo los casos dudosos.
- Analisis de reaccion a eventos corporativos: procesar el flujo de tuits tras un anuncio de resultados o una noticia macro y medir la proporcion de mensajes Bullish frente a Bearish como indicador de reaccion del mercado minorista.
- Investigacion academica en NLP financiero: servir de referencia reproducible frente a lineas base clasicas (TF-IDF + regresion logistica, 0,806 de exactitud) gracias a que el codigo de entrenamiento, evaluacion y ablacion esta publicado en GitHub.
- Prototipado de bajo coste en entornos con recursos limitados: al entrenarse en una T4 gratuita en aproximadamente una hora, el flujo completo es replicable por equipos sin infraestructura dedicada, y el adaptador resultante pesa solo 0,1 GB en el repositorio.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de 2.388 tuits de `zeroshot/twitter-financial-news-sentiment`, no usado en entrenamiento ni en decisiones de ajuste.

| Modelo | Exactitud | Macro-F1 |
|---|---|---|
| Siempre Neutral | 0,656 | 0,264 |
| Llama zero-shot (sin adaptador) | 0,606 | 0,606 |
| TF-IDF + regresion logistica | 0,806 | 0,697 |
| Este adaptador (LoRA r16) | 0,902 | 0,873 |

Metricas por clase:

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| Bearish | 0,89 | 0,84 | 0,86 |
| Bullish | 0,96 | 0,73 | 0,83 |
| Neutral | 0,89 | 0,97 | 0,93 |

Matriz de confusion (filas = real, columnas = predicho):

| | Bearish | Bullish | Neutral |
|---|---|---|---|
| Bearish | 290 | 0 | 57 |
| Bullish | 1 | 346 | 128 |
| Neutral | 35 | 13 | 1518 |

El modelo es conservador: la mayoria de errores son tuits Bullish o Bearish clasificados como Neutral (57 y 128 casos respectivamente), mientras que los cambios de direccion son practicamente inexistentes (1 caso Bullish predicho como Bearish, 0 en sentido contrario).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 0,1 GB; el modelo base Llama-3.2-3B-Instruct requiere aproximadamente 6-7 GB en fp16 y alrededor de 2-3 GB en cuantizacion de 4 bits (estimacion estandar para 3.000 millones de parametros; no declarada en la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; una T4 de 16 GB es suficiente, como demuestra el entrenamiento en Colab. Para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB, especialmente con cuantizacion.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el modelo base; llama.cpp, Ollama o vLLM para el modelo base cuantizado, teniendo en cuenta que el adaptador debe fusionarse o cargarse via PEFT y no se distribuye en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo en T4 tardo aproximadamente 1 hora y 4 minutos para 1.074 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-FinSent-LoRA | 3,2B base + 24,3M adaptador | no disponible | Clasificacion de sentimiento financiero de 3 clases | llama3.2 | Hugging Face |
| TF-IDF + regresion logistica (linea base del autor) | no aplica | no aplica | Clasificacion de texto clasica | no aplica | Reproducible en el repo del autor |
| Llama-3.2-3B-Instruct zero-shot | 3,2B | no disponible | Generacion general con clasificacion zero-shot | llama3.2 | Hugging Face |
| FinBERT (referencia de dominio, no evaluada en la model card) | no disponible en la informacion | no disponible | Clasificacion de sentimiento financiero | no disponible | no disponible |

No se han publicado en la model card comparaciones con otros adaptadores LoRA de sentimiento financiero ni con modelos especializados como FinBERT; los unicos puntos de comparacion documentados son las tres lineas base de la tabla de benchmarks.

## Limitaciones y advertencias

- Dominio estrecho: entrenado exclusivamente con tuits financieros en ingles; el rendimiento en otros generos (noticias largas, informes, correos) no esta evaluado y probablemente sea inferior.
- Idioma: solo ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Sesgo hacia Neutral: el recall de Bullish es 0,73 y la mayoria de falsos negativos son tuits direccionales clasificados como Neutral (185 casos de 2.388). En produccion, esto puede infraestimar la senal de mercado.
- Desequilibrio de clases en el dataset de origen: la clase Neutral domina (1.566 de 2.388 en validacion), lo que condiciona el comportamiento conservador del modelo.
- Riesgo de alucinacion: aunque la tarea es de clasificacion cerrada, el modelo base es generativo y podria producir etiquetas fuera del conjunto permitido si no se restringe la decodificacion; la model card no documenta el mecanismo de restriccion usado.
- Licencia: hereda la Llama 3.2 Community License, con sus restricciones de uso comercial y de redistribucion; es necesario revisar los terminos de dicha licencia antes de un despliegue en producto.
- Sin datos de robustez: no se documentan evaluaciones frente a texto adversarial, sarcasmo, jerga financiera emergente ni cambios de distribucion temporal del lenguaje de Twitter.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente de los resultados reportados.
- La ablacion de rango 8 frente a rango 16 se basa en una sola ejecucion por configuracion, por lo que la ventaja del rango 16 no esta confirmada estadisticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jaswanth10/Llama-3.2-3B-FinSent-LoRA
- Repositorio de notebooks (linea base, entrenamiento, evaluacion, ablacion e interpretabilidad): https://github.com/jaswanth123-2/finsent-lora-interp
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
