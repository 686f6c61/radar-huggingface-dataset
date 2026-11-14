# areai51/propensity-one

## Resumen

Propensity One es un modelo de ranking de titulares desarrollado por areai51, publicado como vista previa de investigación (research preview) bajo licencia CC BY 4.0. Se trata de un encoder ModernBERT-large de answerdotai con una cabeza lineal, afinado exclusivamente sobre los tests aleatorizados de titulares del Upworthy Research Archive (2013-2015). Su tarea es ordenar variantes de un mismo titular según la probabilidad de que cada una obtenga un CTR superior en un test A/B aleatorizado.

El modelo resuelve un problema acotado pero relevante para equipos de producto y medios: predecir qué variante de titular ganará en un test A/B real, en lugar de predecir popularidad absoluta. Se entrena con dos objetivos conjuntos (probabilidad de superar a las demás variantes del test y pérdida de ranking por pares), de modo que aprende comparaciones dentro de un mismo relato y no sesgos de popularidad entre historias distintas.

Es relevante por su enfoque metodológico: separa por familias (variantes del mismo relato y duplicados exactos o casi exactos) para evitar fugas de datos, reporta intervalos de confianza por bootstrap y ofrece comparación con un modelo zero-shot de referencia. Con 1.945 tests retenidos alcanza una precisión por pares de 0,636 frente a 0,596 del modelo zero-shot citado y 0,5 del azar. El contexto máximo es de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabeza lineal de ranking |
| Parametros totales | no disponible (heredados de ModernBERT-large; el autor no los detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (directorio `encoder/` con config y tokenizer del modelo base) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large con una cabeza lineal que produce una puntuacion por variante de titular. La entrada combina titular, extracto opcional (teaser) y texto opcional del relato, construida con el mismo formato etiquetado usado durante el entrenamiento. Si la entrada supera los 512 tokens, el cargador recorta primero el relato y despues el extracto, sin cortar nunca el titular.

El entrenamiento se realizo exclusivamente sobre los tests aleatorizados del Upworthy Research Archive (titulares de noticias y temas sociales de upworthy.com, 2013-2015), con dos objetivos simultaneos: la probabilidad de que cada variante supere a las demas de su test y una perdida de ranking por pares dentro de cada test. Los splits se organizan por familia, agrupando variantes de un mismo relato con titulares identicos y casi duplicados, de modo que ningun relato ni titular de test aparece en entrenamiento. El autor reporta tres ejecuciones de la receta con resultados de 0,636, 0,635 y 0,596 en el mismo test, y advierte que un reentrenamiento puede desviarse hasta aproximadamente 0,04. No se detalla el volumen de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Ranking de variantes de titular dentro de un mismo test: devuelve posicion, puntuacion, probabilidad `p_top_beats` y el titular ordenado.
- Calibracion de la probabilidad de victoria del primer clasificado mediante `sigmoid(k * diferencia de puntuacion)`, con k ajustado en validacion.
- Acepta contexto adicional: extracto (teaser) bajo el titular y primer parrafo del relato, compartido entre variantes.
- Mecanismo de abtencion por margen de puntuacion entre el primer y el segundo clasificado, con umbral fijado en validacion.
- Capacidad de ejecucion en CUDA, MPS o CPU mediante seleccion automatica del dispositivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Multilingue: no; solo ingles.
- Modo thinking: no.

## Casos de uso

- Optimizacion de titulares en medios digitales: dado un relato y entre tres y ocho variantes de titular, el modelo las ordena antes de lanzar el test A/B, lo que permite descartar las peores variantes y reducir el coste de experimentacion. Es adecuado porque se entreno especificamente con titulares de noticias y temas sociales.
- Priorizacion de tests A/B en redaccion: el equipo editorial puede usar el ranking para decidir que variantes merecen trafico real, usando el umbral de abtencion para no actuar cuando la diferencia entre el primer y el segundo clasificado es pequena.
- Filtrado previo en plataformas de test de titulares: integrado como paso de scoring en un pipeline que genere variantes con un LLM y despues las ordene con Propensity One antes de la revision humana.
- Investigacion sobre persuasion y CTR: analisis de que rasgos linguisticos correlacionan con mayor probabilidad de victoria dentro de un mismo relato, aprovechando la calibracion de `p_top_beats`.
- Evaluacion de generadores de titulares: usar la precision por pares del modelo como metrica automatica para comparar sistemas de generacion de titulares sobre un conjunto de relatos fijos.
- Despliegue ligero en CPU para prototipos: el modelo puede ejecutarse en CPU o MPS, lo que permite integrarlo en herramientas internas de redaccion sin GPU dedicada.
- Comparacion con la variante lite: entornos con restricciones de computo pueden usar Propensity One lite (TF-IDF ridge, 0,589 de precision por pares) y reservar el modelo completo para decisiones de mayor impacto.

## Benchmarks y rendimiento

Resultados sobre el split de test de `upworthy_brx-pipe-0.2.0`: 1.945 tests aleatorizados con 8.654 variantes de titular.

| Metrica (test) | Propensity One | GPT-6.1 Sol zero-shot | Propensity One lite | Azar |
|---|---|---|---|---|
| Precision por pares | 0,636 [0,625; 0,647] | 0,596 | 0,589 | 0,5 |
| Top-1 en los 323 tests con ganador claro (P >= 0,95) | 0,588 | 0,570 | no disponible | 0,266 |
| Precision por pares ponderada por certeza del ganador | 0,684 | no disponible | no disponible | no disponible |
| Top-1 global | 0,405 | no disponible | no disponible | 0,242 |
| TF-IDF ridge simple | 0,572 | no disponible | no disponible | 0,503 |

Diferencias con intervalos bootstrap del 95%: frente a GPT-6.1 Sol, +0,040 [0,025; 0,054]; frente a la variante lite, +0,048 [0,035; 0,060]. Excluyendo los tests creados entre 2013-06-25 y 2014-01-10 (posible aleatorizacion defectuosa segun la correccion de 2024 del archivo), quedan 1.503 tests: Propensity One 0,634 y GPT-6.1 Sol 0,598 (+0,036).

Calibracion de `p_top_beats`: la probabilidad media predicha de que gane el titular preferido es 0,640 y la frecuencia observada de victoria tambien es 0,640; log loss de 0,6286 frente a 0,6931 de predecir siempre 50%.

Rendimiento con abtencion por margen (umbral fijado en validacion y aplicado sin cambios a test):

| Modo | Cobertura | Tests evaluados | Precision por pares | Top-1 |
|---|---|---|---|---|
| Siempre (por defecto) | 100% | 1.945 | 0,636 [0,625; 0,647] | 0,405 |
| Mitad mas clara | 50% | 973 | 0,668 [0,655; 0,683] | 0,475 |
| Tercio mas claro | 33% | 643 | 0,679 [0,662; 0,697] | 0,513 |
| Cuarto mas claro | 25% | 487 | 0,692 [0,673; 0,711] | 0,548 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al derivar de ModernBERT-large (encoder de aproximadamente 395 millones de parametros) la inferencia en fp16 requiere del orden de 1 GB de VRAM para pesos, mas memoria para activaciones con entradas de hasta 512 tokens.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer reciente (RTX 3060 en adelante) o profesional (A100, H100) puede ejecutar el modelo.
- GPU consumer: si cabe; el modelo es un encoder de tamano grande pero no de escala LLM. Tambien funciona en MPS (Apple Silicon) y en CPU.
- Opciones de despliegue: el autor proporciona un cargador propio (`propensity_one.PropensityOne`) que requiere torch 2.14.1, transformers 5.20.2 y safetensors 0.8.0; no se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Precision por pares (mismo test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Propensity One | ModernBERT-large + cabeza lineal | no disponible (base ModernBERT-large) | 512 tokens | 0,636 | CC BY 4.0 | Hugging Face |
| Propensity One lite | TF-IDF ridge | no aplica | no disponible | 0,589 | no disponible en la informacion | Hugging Face y Space |
| GPT-6.1 Sol (zero-shot) | LLM propietario | no disponible | no disponible | 0,596 | propietaria | API |
| TF-IDF ridge simple | Modelo lineal | no aplica | no disponible | 0,572 | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado solo con titulares de noticias y temas sociales de upworthy.com entre 2013 y 2015; no validado en anuncios de producto, otros sitios, otras audiencias ni otros idiomas.
- Solo ingles.
- Las puntuaciones solo tienen sentido como ranking relativo entre variantes de un mismo test; una puntuacion aislada no es interpretable.
- Ventana de contexto de 512 tokens; las entradas largas se truncan recortando primero el relato y despues el extracto.
- Riesgo de que el modelo reproduzca sesgos de persuasion del corpus original (temas, tono y estilo de Upworthy de 2013-2015).
- La comparacion con GPT-6.1 Sol puede estar sesgada a favor de GPT, ya que el archivo es publico desde 2021 y sus ganadores podrian formar parte de los datos de entrenamiento del LLM.
- La correccion de 2024 del archivo (Sci. Data 11:765) indica que los tests creados entre 2013-06-25 y 2014-01-10 pueden tener aleatorizacion defectuosa; conviene excluirlos en analisis sensibles.
- Reentrenar la receta produce variaciones de hasta aproximadamente 0,04 en precision por pares.
- Las probabilidades se mantienen cercanas al 50% porque la mayoria de diferencias entre titulares son pequenas; esto refleja incertidumbre real y no un fallo de calibracion.
- Es una vista previa de investigacion; no se documentan garantias de produccion, latencias ni soporte.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero no se detallan restricciones adicionales ni clausulas de responsabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/areai51/propensity-one
- Variante lite: https://huggingface.co/areai51/propensity-one-lite
- Demo en navegador (Space): https://huggingface.co/spaces/areai51/propensity-one
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Upworthy Research Archive: https://osf.io/jd64p/
